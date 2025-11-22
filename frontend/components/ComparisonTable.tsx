type Metric = { name: string; score: number; description: string };

type Row = {
  model: string;
  response: string;
  trust_score: number;
  metrics: Metric[];
  error?: string | null;
};

export default function ComparisonTable({ data }: { data: { results: Row[] } }) {
  const rows = data.results || [];
  const maxBy = (selector: (r: Row) => number) => Math.max(...rows.map(selector));
  const maxTrust = rows.length ? maxBy((r) => r.trust_score) : 0;

  const metricIndex = (name: string) => (r: Row) => r.metrics.find((m) => m.name === name)?.score || 0;
  const maxFaith = rows.length ? maxBy(metricIndex("Faithfulness")) : 0;
  const maxRel = rows.length ? maxBy(metricIndex("Relevance")) : 0;
  const maxBias = rows.length ? maxBy(metricIndex("Bias")) : 0;
  const maxTox = rows.length ? maxBy(metricIndex("Toxicity")) : 0;
  const maxFact = rows.length ? maxBy(metricIndex("Factual")) : 0;

  const cellStyle = (value: number, max: number): React.CSSProperties => ({
    padding: 8,
    borderBottom: "1px solid #1f2937",
    background: value === max ? "#0ea5e9" : "transparent",
    color: value === max ? "#0f172a" : "#e2e8f0",
    fontWeight: value === max ? 800 : 500,
    textAlign: "center",
  });

  return (
    <div style={{ background: "#111827", padding: 16, borderRadius: 12, border: "1px solid #334155" }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Model Comparison</div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thStyle}>Model</th>
              <th style={thStyle}>TrustScore</th>
              <th style={thStyle}>Faithfulness</th>
              <th style={thStyle}>Relevance</th>
              <th style={thStyle}>Bias</th>
              <th style={thStyle}>Toxicity</th>
              <th style={thStyle}>Factual</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.model}>
                <td style={{ padding: 8, borderBottom: "1px solid #1f2937" }}>
                  {r.model}
                  {r.error && (
                    <span style={{ marginLeft: 8, padding: "2px 6px", borderRadius: 6, background: "#ef4444", color: "#0f172a", fontWeight: 800 }}>
                      Error
                    </span>
                  )}
                </td>
                <td style={cellStyle(r.trust_score, maxTrust)}>{r.trust_score}</td>
                <td style={cellStyle(metricIndex("Faithfulness")(r), maxFaith)}>{metricIndex("Faithfulness")(r)}</td>
                <td style={cellStyle(metricIndex("Relevance")(r), maxRel)}>{metricIndex("Relevance")(r)}</td>
                <td style={cellStyle(metricIndex("Bias")(r), maxBias)}>{metricIndex("Bias")(r)}</td>
                <td style={cellStyle(metricIndex("Toxicity")(r), maxTox)}>{metricIndex("Toxicity")(r)}</td>
                <td style={cellStyle(metricIndex("Factual")(r), maxFact)}>{metricIndex("Factual")(r)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: 8,
  borderBottom: "1px solid #1f2937",
  textAlign: "center",
};

