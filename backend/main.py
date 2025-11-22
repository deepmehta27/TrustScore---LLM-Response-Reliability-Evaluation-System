import os
import json
import asyncio
from typing import List, Dict

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import EvalRequest, EvalResponse, CompareRequest, CompareResponse, ModelComparison, MetricResult
from evaluators import (
    evaluate_faithfulness,
    evaluate_relevance,
    evaluate_bias,
    evaluate_toxicity,
    evaluate_factual,
)
from scorer import PRESETS, calculate_weighted_score

try:
    from openai import OpenAI
except Exception:
    OpenAI = None

try:
    from google import genai
except Exception:
    genai = None


try:
    import httpx
except Exception:
    httpx = None

try:
    from dotenv import load_dotenv
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        load_dotenv(env_path, override=False)
except Exception:
    pass


app = FastAPI(title="TrustScore API", version="0.1.0")

# CORS configuration - allows frontend to access the backend
# In production, replace "*" with your actual frontend URL
allowed_origins = [
    "http://localhost:3000",
    "https://trust-score-llm-response-reliabilit.vercel.app",  # Your frontend
    "*"  # Allow all for demo
]


# Add production frontend URL from environment variable
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)
    # Also allow Vercel preview deployments
    if "vercel.app" in frontend_url:
        allowed_origins.append("https://*.vercel.app")

# For development, allow all origins (remove in production)
if os.getenv("ENVIRONMENT") != "production":
    allowed_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "results.json")
os.makedirs(os.path.dirname(DATA_PATH), exist_ok=True)
if not os.path.exists(DATA_PATH):
    with open(DATA_PATH, "w", encoding="utf-8") as f:
        json.dump([], f)


def _load_env_file():
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    s = line.strip()
                    if not s or s.startswith("#"):
                        continue
                    if "=" in s:
                        k, v = s.split("=", 1)
                        os.environ.setdefault(k.strip(), v.strip())
        except Exception:
            pass

_load_env_file()


async def append_result(result: Dict) -> None:
    # Simple JSON file storage for hackathon demo; not concurrency-safe for production.
    try:
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            current = json.load(f)
        current.append(result)
        with open(DATA_PATH, "w", encoding="utf-8") as f:
            json.dump(current, f, ensure_ascii=False, indent=2)
    except Exception:
        pass


async def generate_explanation(metrics: List[Dict]) -> str:
    if OpenAI and os.getenv("OPENAI_API_KEY"):
        try:
            client = OpenAI()
            bullet_lines = "\n".join([f"- {m['name']}: {m['score']} ({m['description']})" for m in metrics])

            def _call():
                return client.chat.completions.create(
                    model="gpt-4.1",
                    messages=[
                        {
                            "role": "system",
                            "content": "Summarize reliability metrics into a single coherent explanation (3-4 sentences).",
                        },
                        {"role": "user", "content": f"Metrics summary:\n{bullet_lines}"},
                    ],
                    response_format={"type": "text"},
                    temperature=1,
                    max_completion_tokens=2048,
                    top_p=1,
                    frequency_penalty=0,
                    presence_penalty=0,
                    store=False,
                )

            completion = await asyncio.to_thread(_call)
            return completion.choices[0].message.content or "Evaluation summary unavailable"
        except Exception:
            pass

    # Fallback deterministic summary.
    parts = [f"{m['name']}={m['score']}" for m in metrics]
    return "; ".join(parts)


@app.get("/presets")
async def get_presets():
    return PRESETS


@app.post("/evaluate", response_model=EvalResponse)
async def evaluate_response(request: EvalRequest):
    if request.preset not in PRESETS:
        raise HTTPException(status_code=400, detail="Unknown preset")

    # Run all evaluators concurrently.
    tasks = [
        evaluate_faithfulness(request.query, request.response, request.context),
        evaluate_relevance(request.query, request.response),
        evaluate_bias(request.response),
        evaluate_toxicity(request.response),
        evaluate_factual(request.response, request.context),
    ]
    metrics: List[Dict] = await asyncio.gather(*tasks)

    weights = PRESETS[request.preset]
    trust_score = calculate_weighted_score(metrics, weights)
    explanation = await generate_explanation(metrics)

    result = {
        "trust_score": trust_score,
        "metrics": metrics,
        "explanation": explanation,
        "preset": request.preset,
    }
    await append_result(result)
    # Cast dicts to pydantic models for response typing
    return EvalResponse(
        trust_score=trust_score,
        metrics=[MetricResult(**m) for m in metrics],
        explanation=explanation,
    )


async def generate_model_response(query: str, model: str) -> str:
    # Check if we have any API keys available
    openai_key = os.getenv("OPENAI_API_KEY")
    gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    openrouter_key = os.getenv("OPENROUTER_API_KEY")
    
    has_openai = OpenAI and openai_key
    has_gemini = genai and gemini_key
    has_openrouter = httpx and openrouter_key
    
    # Debug: Log which API keys are available (without showing the actual keys)
    if model == "deepseek/deepseek-chat-v3-0324:free":
        if not has_openrouter:
            return f"[ERROR] OpenRouter API key not found. Please set OPENROUTER_API_KEY in backend/.env file. Key present: {bool(openrouter_key)}, httpx available: {httpx is not None}"
    
    if not (has_openai or has_gemini or has_openrouter):
        return f"[Stubbed response for {model}] {query}"
    
    try:
        # Handle OpenRouter models (DeepSeek) via HTTP API
        if model == "deepseek/deepseek-chat-v3-0324:free" and has_openrouter:
            async def _openrouter_call():
                try:
                    async with httpx.AsyncClient() as client:
                        # Try the free model first, fallback to regular if needed
                        model_id = "deepseek/deepseek-chat"
                        response = await client.post(
                            "https://openrouter.ai/api/v1/chat/completions",
                            headers={
                                "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
                                "Content-Type": "application/json",
                                "HTTP-Referer": os.getenv("SITE_URL", "http://localhost:3000"),
                                "X-Title": os.getenv("SITE_NAME", "TrustScore"),
                            },
                            json={
                                "model": model_id,
                                "messages": [
                                    {
                                        "role": "user",
                                        "content": query,
                                    },
                                ],
                            },
                            timeout=60.0,
                        )
                        response.raise_for_status()
                        data = response.json()
                        return data["choices"][0]["message"]["content"]
                except httpx.HTTPStatusError as e:
                    error_detail = ""
                    try:
                        error_data = e.response.json()
                        error_detail = str(error_data)
                    except:
                        error_detail = e.response.text
                    raise Exception(f"OpenRouter API error ({e.response.status_code}): {error_detail}")
            
            return await _openrouter_call() or ""
        
        # Handle Claude Sonnet models
        elif False:
            anthropic_key = os.getenv("ANTHROPIC_API_KEY")
            if not anthropic_key:
                return "[ERROR] ANTHROPIC_API_KEY environment variable is empty"
            
            anthropic_client = Anthropic(api_key=anthropic_key)
            
            def _anthropic_call():
                # Try multiple Claude model IDs in order of preference
                # Using official Claude Sonnet 4.5 model IDs
                model_ids = [
                    "claude-sonnet-4-5-20250929",  # Official Claude Sonnet 4.5 (from comparison table)
                    "claude-sonnet-4-5",  # API alias for Claude Sonnet 4.5
                    "claude-3-5-sonnet-20241022",  # Fallback to Claude 3.5 Sonnet
                ]
                
                last_error = None
                for model_id in model_ids:
                    try:
                        message = anthropic_client.messages.create(
                            model=model_id,
                            max_tokens=1024,
                            messages=[
                                {
                                    "role": "user",
                                    "content": query
                                }
                            ]
                        )
                        return message
                    except Exception as e:
                        last_error = e
                        continue  # Try next model ID
                
                # If all models failed, raise the last error
                raise Exception(f"Anthropic API error with all model IDs: {str(last_error)}")
            
            try:
                message = await asyncio.to_thread(_anthropic_call)
                return message.content[0].text if message.content else ""
            except Exception as e:
                return f"[ERROR] Anthropic API call failed: {str(e)}"
        
        # Handle Gemini models
        elif model.startswith("gemini") and has_gemini:
            api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
            gclient = genai.Client(api_key=api_key) if api_key else genai.Client()

            def _gcall():
                return gclient.models.generate_content(model=model, contents=query)

            gresp = await asyncio.to_thread(_gcall)
            text = getattr(gresp, "text", "")
            if not text:
                try:
                    # Fallback to extracting from candidates
                    cand = (getattr(gresp, "candidates", None) or [None])[0]
                    content = getattr(cand, "content", None)
                    parts = getattr(content, "parts", None) or []
                    for p in parts:
                        if hasattr(p, "text") and p.text:
                            text = p.text
                            break
                except Exception:
                    pass
            return text or ""
        
        # Handle OpenAI models (GPT-4.1, GPT-5.1, etc.)
        elif has_openai:
            oclient = OpenAI()

            def _ocall():
                if model == "gpt-5.1":
                    return oclient.chat.completions.create(
                        model="gpt-5.1",
                        messages=[{"role": "user", "content": query}],
                        response_format={"type": "text"},
                        verbosity="medium",
                        reasoning_effort="medium",
                        store=False,
                    )
                else:
                    return oclient.chat.completions.create(
                        model=model,
                        messages=[{"role": "user", "content": query}],
                        response_format={"type": "text"},
                        temperature=1,
                        max_completion_tokens=2048,
                        top_p=1,
                        frequency_penalty=0,
                        presence_penalty=0,
                        store=False,
                    )

            completion = await asyncio.to_thread(_ocall)
            return completion.choices[0].message.content or ""
        else:
            return f"[ERROR] No API key available for model: {model}"
    except Exception as e:
        return f"[ERROR] {e.__class__.__name__}: {e}"


@app.post("/compare", response_model=CompareResponse)
async def compare_models(request: CompareRequest):
    if not request.models:
        raise HTTPException(status_code=400, detail="No models provided for comparison")

    # Generate all model responses concurrently.
    model_responses = await asyncio.gather(
        *[generate_model_response(request.query, m) for m in request.models]
    )

    # Evaluate each response concurrently.
    async def evaluate_one(model: str, response_text: str):
        eval_tasks = [
            evaluate_faithfulness(request.query, response_text, request.context or ""),
            evaluate_relevance(request.query, response_text),
            evaluate_bias(response_text),
            evaluate_toxicity(response_text),
            evaluate_factual(response_text, request.context or ""),
        ]
        error = None
        if response_text.strip().startswith("[ERROR]"):
            error = response_text.strip()
            metrics = [
                {"name": "Faithfulness", "score": 0.0, "description": "Model response error"},
                {"name": "Relevance", "score": 0.0, "description": "Model response error"},
                {"name": "Bias", "score": 0.0, "description": "Model response error"},
                {"name": "Toxicity", "score": 0.0, "description": "Model response error"},
                {"name": "Factual", "score": 0.0, "description": "Model response error"},
            ]
            explanation = f"Model call failed; metrics set to 0. Details: {error}"
        else:
            metrics = await asyncio.gather(*eval_tasks)
            explanation = await generate_explanation(metrics)

        preset_key = request.preset if request.preset in PRESETS else "general"
        trust_score = calculate_weighted_score(metrics, PRESETS[preset_key])
        return ModelComparison(
            model=model,
            response=response_text,
            trust_score=trust_score,
            metrics=[MetricResult(**m) for m in metrics],
            error=error,
            explanation=explanation,
        )

    results = await asyncio.gather(
        *[
            evaluate_one(model, resp)
            for model, resp in zip(request.models, model_responses)
        ]
    )

    return CompareResponse(results=list(results))

@app.get("/")
async def root():
    return {
        "message": "TrustScore API is running",
        "version": "0.1.0",
        "docs": "/docs",
        "endpoints": {
            "compare": "/compare",
            "evaluate": "/evaluate",
            "presets": "/presets"
        }
    }
