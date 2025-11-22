"use client";
import { Card, CardContent } from "./ui/card";
import { TrendingUp, Award, BarChart3, Users } from "lucide-react";

type Row = {
  model: string;
  trust_score: number;
  metrics: Array<{ name: string; score: number }>;
};

type Props = {
  results: Row[];
};

export default function SummaryStats({ results }: Props) {
  if (!results || results.length === 0) return null;

  const modelsEvaluated = results.length;
  const highestScore = Math.max(...results.map((r) => r.trust_score));
  const averageScore = results.reduce((sum, r) => sum + r.trust_score, 0) / results.length;
  const highestModel = results.find((r) => r.trust_score === highestScore)?.model || "N/A";

  const stats = [
    {
      label: "Models Evaluated",
      value: modelsEvaluated,
      icon: Users,
      color: "text-[#3b82f6]",
    },
    {
      label: "Highest TrustScore",
      value: highestScore.toFixed(1),
      icon: Award,
      color: "text-[#10b981]",
    },
    {
      label: "Average TrustScore",
      value: averageScore.toFixed(1),
      icon: BarChart3,
      color: "text-[#fbbf24]",
    },
    {
      label: "Top Model",
      value: highestModel,
      icon: TrendingUp,
      color: "text-[#10b981]",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-in fade-in duration-500">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
                    {stat.label}
                  </p>
                  <p className="text-4xl font-bold text-white mb-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} opacity-80`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

