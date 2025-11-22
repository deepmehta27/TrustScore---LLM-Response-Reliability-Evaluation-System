from typing import Dict
import os
import asyncio
import re

try:
    from openai import OpenAI
except Exception:
    OpenAI = None


FACT_CHECK_PROMPT = (
    "Verify factual accuracy of the response against the context. "
    "Provide a short explanation and a numeric score (0-100, 100=fully supported)."
)


async def evaluate_factual(response: str, context: str) -> Dict:
    if not context.strip():
        return {"name": "Factual", "score": 0.0, "description": "No context provided for factual assessment"}
    if OpenAI and os.getenv("OPENAI_API_KEY"):
        try:
            client = OpenAI()

            def _call():
                return client.chat.completions.create(
                    model="gpt-4.1",
                    messages=[
                        {"role": "system", "content": FACT_CHECK_PROMPT},
                        {"role": "user", "content": f"Context:\n{context}\n\nResponse:\n{response}"},
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
            content = (completion.choices[0].message.content or "").strip()
            match = re.search(r"(\d{1,3}(?:\.\d+)?)", content)
            score = float(match.group(1)) if match else 50.0
            score = max(0.0, min(100.0, score))
            explanation = content
            return {"name": "Factual", "score": round(score, 2), "description": explanation}
        except Exception:
            pass

    ctx_tokens = set(context.lower().split())
    resp_tokens = set(response.lower().split())
    overlap = len(ctx_tokens & resp_tokens)
    denom = max(len(resp_tokens), 1)
    heuristic = (overlap / denom) * 100
    return {"name": "Factual", "score": round(heuristic, 2), "description": "Heuristic factuality based on overlap with provided context"}

