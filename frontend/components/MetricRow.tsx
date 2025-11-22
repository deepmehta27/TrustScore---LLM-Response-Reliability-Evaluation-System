type Props = { name: string; score: number; description?: string };

export default function MetricRow({ name, score, description }: Props) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 600 }}>{name}</div>
        <div style={{ opacity: 0.8 }}>{score}</div>
      </div>
      <div style={{ height: 8, background: "#1f2937", borderRadius: 8 }}>
        <div style={{ width: `${score}%`, height: 8, background: "#22c55e", borderRadius: 8 }} />
      </div>
      {description && <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>{description}</div>}
    </div>
  );
}

