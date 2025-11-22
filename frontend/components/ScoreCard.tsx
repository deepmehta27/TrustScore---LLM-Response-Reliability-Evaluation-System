"use client";
import { useState } from "react";
import { badgeForScore } from "../lib/utils";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { cn } from "../lib/cn";

type Metric = { name: string; score: number; description: string };

export default function ScoreCard({
  trustScore,
  metrics,
  explanation,
  preset,
  response,
  model,
}: {
  trustScore: number;
  metrics: Metric[];
  explanation: string;
  preset: string;
  response?: string;
  model?: string;
}) {
  const [isResponseExpanded, setIsResponseExpanded] = useState(false);
  const badge = badgeForScore(trustScore);
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-[#10b981] text-white";
    if (score >= 60) return "bg-[#fbbf24] text-[#0f172a]";
    return "bg-[#ef4444] text-white";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-[#10b981]/10 border-[#10b981]";
    if (score >= 60) return "bg-[#fbbf24]/10 border-[#fbbf24]";
    return "bg-[#ef4444]/10 border-[#ef4444]";
  };

  return (
    <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {model && (
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-bold text-white">{model}</h3>
                <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                  {preset}
                </Badge>
              </div>
            )}
            <div className="flex items-baseline gap-3">
              <span className="text-sm font-medium text-slate-400">TrustScore</span>
              <div className={cn(
                "inline-flex items-center justify-center min-w-[90px] px-5 py-3 rounded-xl font-bold text-5xl leading-none",
                getScoreColor(trustScore)
              )}>
                {typeof trustScore === 'number' ? trustScore.toFixed(1) : trustScore}
              </div>
              <Badge 
                className={cn("text-sm font-semibold", getScoreBg(trustScore))}
                style={{ background: badge.bg + "20", borderColor: badge.bg, color: badge.fg }}
              >
                {badge.label}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Metrics */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-white uppercase tracking-wide">Metrics Breakdown</h4>
          {metrics.map((m) => {
            const metricScore = m.score;
            return (
              <div key={m.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{m.name}</span>
                  <span className="text-sm font-bold text-slate-300">{metricScore.toFixed(1)}</span>
                </div>
                <Progress value={metricScore} />
                <p className="text-xs text-slate-400">{m.description}</p>
              </div>
            );
          })}
        </div>

        {/* Model Response */}
        {response && (
          <div className="space-y-2">
            <button
              onClick={() => setIsResponseExpanded(!isResponseExpanded)}
              className="flex items-center justify-between w-full text-left"
            >
              <h4 className="text-sm font-semibold text-white uppercase tracking-wide">
                Model Response
              </h4>
              {isResponseExpanded ? (
                <ChevronUp className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </button>
            <div
              className={cn(
                "rounded-lg border-2 border-slate-700 bg-[#0f1729] p-4 transition-all duration-300",
                isResponseExpanded ? "max-h-none" : "max-h-32 overflow-hidden"
              )}
            >
              <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                {response}
              </p>
            </div>
          </div>
        )}

        {/* Explanation */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-white uppercase tracking-wide">Explanation</h4>
          <div className="rounded-lg border-2 border-slate-700 bg-[#0f1729] p-4">
            <p className="text-sm text-slate-300 leading-relaxed">{explanation}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
