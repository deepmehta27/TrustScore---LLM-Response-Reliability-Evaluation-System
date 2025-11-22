from typing import List, Dict


# Industry presets determine relative importance of each metric.
PRESETS: Dict[str, Dict[str, float]] = {
    "healthcare": {
        "faithfulness": 0.35,  # Changed from 0.40
        "factual": 0.25,       # Changed from 0.10
        "relevance": 0.20,
        "bias": 0.15,
        "toxicity": 0.05,      # Changed from 0.15
    },
    "finance": {
        "bias": 0.30,
        "faithfulness": 0.25,
        "relevance": 0.20,
        "factual": 0.15,
        "toxicity": 0.10,
    },
    "general": {
        "faithfulness": 0.30,
        "relevance": 0.25,
        "bias": 0.20,
        "toxicity": 0.15,
        "factual": 0.10,
    },
}


def calculate_weighted_score(metrics: List[dict], weights: Dict[str, float]) -> float:
    # Weighted average: metric scores are 0-100; weights must sum to 1.0 per preset.
    total = sum(m["score"] * weights.get(m["name"].lower(), 0.0) for m in metrics)
    return round(total, 2)

