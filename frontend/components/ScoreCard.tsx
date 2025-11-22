import { badgeForScore } from "../lib/utils";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";

type Metric = { name: string; score: number; description: string };

export default function ScoreCard({
  trustScore,
  metrics,
  explanation,
  preset,
  response,
}: {
  trustScore: number;
  metrics: Metric[];
  explanation: string;
  preset: string;
  response?: string;
}) {
  const badge = badgeForScore(trustScore);
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm opacity-70">Preset: {preset}</div>
            <div className="text-3xl font-extrabold">TrustScore: {trustScore}</div>
          </div>
          <Badge className="bg-red-500 text-slate-900" style={{ background: badge.bg, color: badge.fg }}>{badge.label}</Badge>
        </div>
      </CardHeader>
      <CardContent>

      {response && (
        <div className="mt-3">
          <div className="font-bold mb-2">Model Response</div>
          <div className="whitespace-pre-wrap bg-slate-900 border border-slate-700 rounded-md p-3">{response}</div>
        </div>
      )}

      <div className="mt-4">
        {metrics.map((m) => (
          <div key={m.name} className="mb-3">
            <div className="flex justify-between"><div className="font-semibold">{m.name}</div><div className="opacity-80">{m.score}</div></div>
            <Progress value={m.score} />
            <div className="text-xs opacity-80 mt-1">{m.description}</div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <div className="font-bold mb-2">Explanation</div>
        <div className="opacity-90">{explanation}</div>
      </div>
      </CardContent>
    </Card>
  );
}

