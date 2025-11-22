"use client";
import { useState } from "react";
import InputForm from "../components/InputForm";
import ScoreCard from "../components/ScoreCard";
import ComparisonTable from "../components/ComparisonTable";

type Metric = { name: string; score: number; description: string };

export default function Page() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    trust_score: number;
    metrics: Metric[];
    explanation: string;
    preset?: string;
  } | null>(null);
  const [compareData, setCompareData] = useState<any>(null);

  async function handleEvaluate(payload: { query: string; response: string; context: string; preset: string }) {
    setIsLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Evaluation failed. Ensure backend is running on http://localhost:8000.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCompare(query: string) {
    setCompareData(null);
    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, models: ["gpt-4o-mini", "gpt-3.5-turbo"] }),
      });
      const data = await res.json();
      setCompareData(data);
    } catch (err) {
      console.error(err);
      alert("Comparison failed. Ensure backend is running and OpenAI API key is set.");
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>TrustScore - LLM Reliability Evaluation</h1>
      <p style={{ opacity: 0.8, marginBottom: 20 }}>
        Evaluate responses across faithfulness, relevance, bias, toxicity, and factual accuracy. Generates a unified 0–100 TrustScore.
      </p>

      <InputForm isLoading={isLoading} onSubmit={handleEvaluate} onCompare={handleCompare} />

      {isLoading && (
        <div style={{ marginTop: 16 }}>Evaluating… please wait</div>
      )}

      {result && (
        <div style={{ marginTop: 24 }}>
          <ScoreCard
            trustScore={result.trust_score}
            metrics={result.metrics}
            explanation={result.explanation}
            preset={result.preset || "general"}
          />
        </div>
      )}

      {compareData && (
        <div style={{ marginTop: 24 }}>
          <ComparisonTable data={compareData} />
        </div>
      )}
    </div>
  );
}

