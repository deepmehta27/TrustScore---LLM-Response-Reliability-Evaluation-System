from typing import List, Dict, Any
from pydantic import BaseModel, Field


class EvalRequest(BaseModel):
    query: str = Field(..., description="Original user question")
    response: str = Field(..., description="LLM-generated answer to evaluate")
    context: str = Field("", description="Supporting context used for grounding")
    preset: str = Field("general", description="Industry preset controlling metric weights")


class MetricResult(BaseModel):
    name: str
    score: float
    description: str


class EvalResponse(BaseModel):
    trust_score: float
    metrics: List[MetricResult]
    explanation: str


class CompareRequest(BaseModel):
    query: str
    models: List[str] = Field(..., description="List of OpenAI model ids to compare")


class ModelComparison(BaseModel):
    model: str
    response: str
    trust_score: float
    metrics: List[MetricResult]


class CompareResponse(BaseModel):
    results: List[ModelComparison]

