"use client";
import { useState } from "react";
import InputForm from "../components/InputForm";
import ComparisonTable from "../components/ComparisonTable";
import ScoreCard from "../components/ScoreCard";
import SummaryStats from "../components/SummaryStats";
import { Skeleton } from "../components/ui/skeleton";
import { Card, CardContent } from "../components/ui/card";
import { Loader2 } from "lucide-react";

type Metric = { name: string; score: number; description: string };

export default function Page() {
  const [isLoading, setIsLoading] = useState(false);
  const [compareData, setCompareData] = useState<any>(null);
  const [lastPreset, setLastPreset] = useState<string>("general");
  const [lastMode, setLastMode] = useState<'parallel' | 'sequential'>('parallel');

  async function handleCompare(payload: { query: string; models: string[]; context: string; preset: string; mode: 'parallel' | 'sequential' }) {
    setCompareData(null);
    setIsLoading(true);
    setLastPreset(payload.preset);
    setLastMode(payload.mode);
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
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
          TrustScore
        </h1>
        <p className="text-lg text-slate-400 max-w-3xl">
          Evaluate LLM responses across faithfulness, relevance, bias, toxicity, and factual accuracy. 
          Generates a unified 0–100 TrustScore to help you choose the most reliable AI model.
        </p>
      </div>

      {/* Input Form */}
      <InputForm isLoading={isLoading} onCompare={handleCompare} />

      {/* Loading State */}
      {isLoading && (
        <Card className="animate-in fade-in duration-300">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-12 w-12 text-[#10b981] animate-spin" />
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold text-white">Evaluating Models...</p>
                <p className="text-sm text-slate-400">
                  This may take a few moments. We're analyzing responses across all selected models.
                </p>
              </div>
              <div className="w-full max-w-md space-y-3 mt-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {compareData && !isLoading && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Summary Stats */}
          <SummaryStats results={compareData.results || []} />

          {/* Scorecards */}
          {Array.isArray(compareData.results) && compareData.results.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Model Scorecards</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {compareData.results.map((r: any, index: number) => (
                  <div
                    key={r.model}
                    style={{ animationDelay: `${index * 100}ms` }}
                    className="animate-in fade-in slide-in-from-bottom-4"
                  >
                    <ScoreCard
                      model={r.model}
                      trustScore={r.trust_score}
                      metrics={r.metrics}
                      explanation={r.explanation || ""}
                      preset={lastPreset}
                      response={r.response}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comparison Table */}
          <ComparisonTable data={compareData} mode={lastMode} />
      </div>
    )}
    </div>
  );
}
