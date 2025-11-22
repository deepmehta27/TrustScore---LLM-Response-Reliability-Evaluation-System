import os
import json
import asyncio
from typing import List, Dict

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .models import EvalRequest, EvalResponse, CompareRequest, CompareResponse, ModelComparison, MetricResult
from .evaluators import (
    evaluate_faithfulness,
    evaluate_relevance,
    evaluate_bias,
    evaluate_toxicity,
    evaluate_factual,
)
from .scorer import PRESETS, calculate_weighted_score

try:
    from openai import OpenAI
except Exception:
    OpenAI = None

try:
    from google import genai
except Exception:
    genai = None

try:
    import dotenv
    dotenv.load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
except Exception:
    pass


app = FastAPI(title="TrustScore API", version="0.1.0")

# Allow local frontend to access the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    if not (OpenAI and os.getenv("OPENAI_API_KEY")) and not (genai and os.getenv("GEMINI_API_KEY")):
        return f"[Stubbed response for {model}] {query}"
    try:
        if model.startswith("gemini") and genai and (os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")):
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
        else:
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

