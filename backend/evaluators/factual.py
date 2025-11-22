from typing import Dict
import os

try:
    from openai import OpenAI
except Exception:
    OpenAI = None


FACT_CHECK_PROMPT = (
    "You are verifying factual accuracy of the provided response against the given context. "
    "Return JSON with: score (0-100, 100=fully supported), and explanation (short)."
)


async def evaluate_factual(response: str, context: str) -> Dict:
    """LLM-based factual accuracy check against context."""
    api_key = os.getenv("OPENAI_API_KEY")
    if OpenAI and api_key:
        try:
            client = OpenAI(api_key=api_key)
            completion = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": FACT_CHECK_PROMPT},
                    {
                        "role": "user",
                        "content": f"Context:\n{context}\n\nResponse to check:\n{response}",
                    },
                ],
                response_format={"type": "json_object"},
            )
            content = completion.choices[0].message.content or "{}"
            import json

            parsed = json.loads(content)
            score = float(parsed.get("score", 50.0))
            explanation = parsed.get("explanation", "No explanation provided")
            return {
                "name": "Factual",
                "score": round(max(0.0, min(100.0, score)), 2),
                "description": explanation,
            }
        except Exception:
            pass

    # Fallback: penalize claims not appearing in context based on token overlap.
    ctx_tokens = set(context.lower().split())
    resp_tokens = set(response.lower().split())
    overlap = len(ctx_tokens & resp_tokens)
    denom = max(len(resp_tokens), 1)
    heuristic = (overlap / denom) * 100
    return {
        "name": "Factual",
        "score": round(heuristic, 2),
        "description": "Heuristic factuality based on overlap with provided context",
    }

