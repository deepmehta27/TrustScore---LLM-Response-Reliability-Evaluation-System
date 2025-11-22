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
    """Create a concise explanation summarizing metric outcomes.
    Uses GPT for humanized text when available; else constructs a deterministic summary.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if OpenAI and api_key:
        try:
            client = OpenAI(api_key=api_key)
            bullet_lines = "\n".join(
                [f"- {m['name']}: {m['score']} ({m['description']})" for m in metrics]
            )
            completion = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "Summarize reliability metrics into a single coherent explanation (3-4 sentences).",
                    },
                    {
                        "role": "user",
                        "content": f"Metrics summary:\n{bullet_lines}",
                    },
                ],
            )
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
    """Ask the specified OpenAI model to answer the query."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not (OpenAI and api_key):
        # Fallback stub response when API key is not configured.
        return f"[Stubbed response for {model}] {query}"
    try:
        client = OpenAI(api_key=api_key)
        completion = await client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": query}],
        )
        return completion.choices[0].message.content or ""
    except Exception:
        return ""


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
            evaluate_faithfulness(request.query, response_text, ""),
            evaluate_relevance(request.query, response_text),
            evaluate_bias(response_text),
            evaluate_toxicity(response_text),
            evaluate_factual(response_text, ""),
        ]
        metrics = await asyncio.gather(*eval_tasks)
        trust_score = calculate_weighted_score(metrics, PRESETS["general"])  # default preset
        return ModelComparison(
            model=model,
            response=response_text,
            trust_score=trust_score,
            metrics=[MetricResult(**m) for m in metrics],
        )

    results = await asyncio.gather(
        *[
            evaluate_one(model, resp)
            for model, resp in zip(request.models, model_responses)
        ]
    )

    return CompareResponse(results=list(results))

