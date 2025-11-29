"use client";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Trophy, AlertCircle } from "lucide-react";
import { cn } from "../lib/cn";

type Metric = { name: string; score: number; description: string };

type Row = {
  model: string;
  response: string;
  trust_score: number;
  metrics: Metric[];
  error?: string | null;
};

export default function ComparisonTable({ data, mode }: { data: { results: Row[] }, mode?: 'parallel' | 'sequential' }) {
  const rows = data.results || [];
  const maxBy = (selector: (r: Row) => number) => Math.max(...rows.map(selector));
  const maxTrust = rows.length ? maxBy((r) => r.trust_score) : 0;

  const metricIndex = (name: string) => (r: Row) => r.metrics.find((m) => m.name === name)?.score || 0;
  const maxFaith = rows.length ? maxBy(metricIndex("Faithfulness")) : 0;
  const maxRel = rows.length ? maxBy(metricIndex("Relevance")) : 0;
  const maxBias = rows.length ? maxBy(metricIndex("Bias")) : 0;
  const maxTox = rows.length ? maxBy(metricIndex("Toxicity")) : 0;
  const maxFact = rows.length ? maxBy(metricIndex("Factual")) : 0;

  const winnerModel = rows.find((r) => r.trust_score === maxTrust);

  const getCellStyle = (value: number, max: number): string => {
    if (value === max && max > 0) {
      return "bg-[#10b981]/20 text-[#10b981] font-bold border-[#10b981]/30";
    }
    return "text-slate-300";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-[#10b981]";
    if (score >= 60) return "text-[#fbbf24]";
    return "text-[#ef4444]";
  };

  if (rows.length === 0) return null;

  return (
    <Card className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">Comparison Table</h2>
            {mode && (
              <Badge variant={mode === 'parallel' ? 'secondary' : 'outline'}>
                Mode: {mode}
              </Badge>
            )}
          </div>
          {winnerModel && (
            <Badge className="bg-[#10b981] text-white flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              Winner: {winnerModel.model}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-700">
                <th className="text-left p-4 text-sm font-semibold text-slate-300 uppercase tracking-wide">
                  Model
                </th>
                <th className="text-center p-4 text-sm font-semibold text-slate-300 uppercase tracking-wide">
                  TrustScore
                </th>
                <th className="text-center p-4 text-sm font-semibold text-slate-300 uppercase tracking-wide">
                  Faithfulness
                </th>
                <th className="text-center p-4 text-sm font-semibold text-slate-300 uppercase tracking-wide">
                  Relevance
                </th>
                <th className="text-center p-4 text-sm font-semibold text-slate-300 uppercase tracking-wide">
                  Bias
                </th>
                <th className="text-center p-4 text-sm font-semibold text-slate-300 uppercase tracking-wide">
                  Toxicity
                </th>
                <th className="text-center p-4 text-sm font-semibold text-slate-300 uppercase tracking-wide">
                  Factual
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr
                  key={r.model}
                  className={cn(
                    "border-b border-slate-700/50 transition-colors duration-200",
                    idx % 2 === 0 ? "bg-[#1e293b]/50" : "bg-[#1e293b]/30",
                    "hover:bg-[#334155]/50"
                  )}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{r.model}</span>
                      {r.trust_score === maxTrust && maxTrust > 0 && (
                        <Trophy className="h-4 w-4 text-[#10b981]" />
                      )}
                      {r.error && (
                        <Badge className="bg-[#ef4444] text-white text-xs flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Error
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className={cn("p-4 text-center font-bold text-lg border-l-2 border-r-2 border-slate-700/50", getCellStyle(r.trust_score, maxTrust), getScoreColor(r.trust_score))}>
                    {r.trust_score.toFixed(1)}
                  </td>
                  <td className={cn("p-4 text-center", getCellStyle(metricIndex("Faithfulness")(r), maxFaith))}>
                    {metricIndex("Faithfulness")(r).toFixed(1)}
                  </td>
                  <td className={cn("p-4 text-center", getCellStyle(metricIndex("Relevance")(r), maxRel))}>
                    {metricIndex("Relevance")(r).toFixed(1)}
                  </td>
                  <td className={cn("p-4 text-center", getCellStyle(metricIndex("Bias")(r), maxBias))}>
                    {metricIndex("Bias")(r).toFixed(1)}
                  </td>
                  <td className={cn("p-4 text-center", getCellStyle(metricIndex("Toxicity")(r), maxTox))}>
                    {metricIndex("Toxicity")(r).toFixed(1)}
                  </td>
                  <td className={cn("p-4 text-center", getCellStyle(metricIndex("Factual")(r), maxFact))}>
                    {metricIndex("Factual")(r).toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
