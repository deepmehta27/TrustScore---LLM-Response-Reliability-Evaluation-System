from typing import Dict

try:
    from ragas.metrics import ResponseRelevancy
    from ragas.dataset_schema import SingleTurnSample
except Exception:
    ResponseRelevancy = None
    SingleTurnSample = None


async def evaluate_relevance(query: str, response: str) -> Dict:
    """Evaluate how relevant the response is to the query.
    Uses RAGAS ResponseRelevancy when available; else falls back to cosine-like token overlap.
    """
    if ResponseRelevancy and SingleTurnSample:
        try:
            sample = SingleTurnSample(user_input=query, response=response, retrieved_contexts=[])
            scorer = ResponseRelevancy()
            score = await scorer.single_turn_ascore(sample)  # 0..1
            return {
                "name": "Relevance",
                "score": round(float(score) * 100, 2),
                "description": "How well the response addresses the question",
            }
        except Exception:
            pass

    q_tokens = set(query.lower().split())
    r_tokens = set(response.lower().split())
    overlap = len(q_tokens & r_tokens)
    denom = max(len(q_tokens | r_tokens), 1)
    heuristic = (overlap / denom) * 100
    return {
        "name": "Relevance",
        "score": round(heuristic, 2),
        "description": "Heuristic relevance based on query/response token overlap",
    }

