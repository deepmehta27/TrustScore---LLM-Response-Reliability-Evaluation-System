"use client";
import { useState } from "react";
import InputForm from "../components/InputForm";
import ComparisonTable from "../components/ComparisonTable";
import ScoreCard from "../components/ScoreCard";

type Metric = { name: string; score: number; description: string };

export default function Page() {
  const [isLoading, setIsLoading] = useState(false);
  const [compareData, setCompareData] = useState<any>(null);
  const [lastPreset, setLastPreset] = useState<string>("general");

  async function handleCompare(payload: { query: string; models: string[]; context: string; preset: string }) {
    setCompareData(null);
    setIsLoading(true);
    setLastPreset(payload.preset);
    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setCompareData(data);
    } catch (err) {
      console.error(err);
      alert("Comparison failed. Ensure backend is running and OpenAI API key is set.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>TrustScore - LLM Reliability Evaluation</h1>
      <p style={{ opacity: 0.8, marginBottom: 20 }}>
        Evaluate responses across faithfulness, relevance, bias, toxicity, and factual accuracy. Generates a unified 0–100 TrustScore.
      </p>

      <InputForm isLoading={isLoading} onCompare={handleCompare} />

      {isLoading && (
        <div style={{ marginTop: 16 }}>Comparing… please wait</div>
      )}

      {compareData && (
        <div style={{ marginTop: 24 }}>
          {Array.isArray(compareData.results) && compareData.results.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
              {compareData.results.map((r: any) => (
                <ScoreCard
                  key={r.model}
                  trustScore={r.trust_score}
                  metrics={r.metrics}
                  explanation={r.explanation || ""}
                  preset={lastPreset}
                />
              ))}
            </div>
          )}
          <ComparisonTable data={compareData} />
        </div>
      )}
    </div>
  );
}

