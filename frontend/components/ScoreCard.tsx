import { badgeForScore } from "../lib/utils";

type Metric = { name: string; score: number; description: string };

export default function ScoreCard({
  trustScore,
  metrics,
  explanation,
  preset,
}: {
  trustScore: number;
  metrics: Metric[];
  explanation: string;
  preset: string;
}) {
  const badge = badgeForScore(trustScore);
  return (
    <div style={{ background: "#111827", padding: 20, borderRadius: 12, border: "1px solid #334155" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 14, opacity: 0.7 }}>Preset: {preset}</div>
          <div style={{ fontSize: 36, fontWeight: 800 }}>TrustScore: {trustScore}</div>
        </div>
        <span style={{ padding: "8px 12px", borderRadius: 999, background: badge.bg, color: badge.fg, fontWeight: 700 }}>
          {badge.label}
        </span>
      </div>

      <div style={{ marginTop: 16 }}>
        {metrics.map((m) => (
          <div key={m.name} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontWeight: 600 }}>{m.name}</div>
              <div style={{ opacity: 0.8 }}>{m.score}</div>
            </div>
            <div style={{ height: 8, background: "#1f2937", borderRadius: 8 }}>
              <div style={{ width: `${m.score}%`, height: 8, background: "#22c55e", borderRadius: 8 }} />
            </div>
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>{m.description}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Explanation</div>
        <div style={{ opacity: 0.9 }}>{explanation}</div>
      </div>
    </div>
  );
}

