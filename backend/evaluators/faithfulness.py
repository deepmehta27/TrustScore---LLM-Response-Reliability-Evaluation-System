import asyncio
from typing import Dict

try:
    # RAGAS provides groundedness/faithfulness metric for RAG systems
    from ragas.metrics import Faithfulness
    from ragas.dataset_schema import SingleTurnSample
except Exception:  # pragma: no cover
    Faithfulness = None
    SingleTurnSample = None


async def evaluate_faithfulness(query: str, response: str, context: str) -> Dict:
    """Evaluate how well the response is grounded in the provided context.
    Uses RAGAS Faithfulness metric when available; falls back to heuristic if not.
    """
    import os
    if os.getenv("DISABLE_EXTERNAL_CALLS", "").lower() == "true":
        ctx_tokens = set(context.lower().split())
        resp_tokens = set(response.lower().split())
        overlap = len(ctx_tokens & resp_tokens)
        denom = max(len(resp_tokens), 1)
        heuristic = (overlap / denom) * 100
        return {
            "name": "Faithfulness",
            "score": round(heuristic, 2),
            "description": "Heuristic groundedness (external disabled)",
        }
    if Faithfulness and SingleTurnSample:
        try:
            sample = SingleTurnSample(
                user_input=query,
                response=response,
                retrieved_contexts=[context],
            )
            scorer = Faithfulness()
            # RAGAS may expose async scoring; use ensure_future to be safe.
            score = await scorer.single_turn_ascore(sample)  # 0..1
            return {
                "name": "Faithfulness",
                "score": round(float(score) * 100, 2),
                "description": "How well the response is grounded in the context",
            }
        except Exception:
            pass

    # Fallback: simple heuristic comparing overlap with context terms.
    ctx_tokens = set(context.lower().split())
    resp_tokens = set(response.lower().split())
    overlap = len(ctx_tokens & resp_tokens)
    denom = max(len(resp_tokens), 1)
    heuristic = (overlap / denom) * 100
    return {
        "name": "Faithfulness",
        "score": round(heuristic, 2),
        "description": "Heuristic groundedness based on context overlap",
    }

