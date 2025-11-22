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
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
      <div className="font-bold mb-2">Model Comparison</div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-center">
              <th className="p-2 border-b border-slate-700">Model</th>
              <th className="p-2 border-b border-slate-700">TrustScore</th>
              <th className="p-2 border-b border-slate-700">Faithfulness</th>
              <th className="p-2 border-b border-slate-700">Relevance</th>
              <th className="p-2 border-b border-slate-700">Bias</th>
              <th className="p-2 border-b border-slate-700">Toxicity</th>
              <th className="p-2 border-b border-slate-700">Factual</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.model}>
                <td className="p-2 border-b border-slate-700">
                  {r.model}
                  {r.error && (
                    <span className="ml-2 px-2 py-1 rounded bg-red-500 text-slate-900 font-bold">Error</span>
                  )}
                </td>
                <td className="p-2 border-b border-slate-700" style={cellStyle(r.trust_score, maxTrust)}>{r.trust_score}</td>
                <td className="p-2 border-b border-slate-700" style={cellStyle(metricIndex("Faithfulness")(r), maxFaith)}>{metricIndex("Faithfulness")(r)}</td>
                <td className="p-2 border-b border-slate-700" style={cellStyle(metricIndex("Relevance")(r), maxRel)}>{metricIndex("Relevance")(r)}</td>
                <td className="p-2 border-b border-slate-700" style={cellStyle(metricIndex("Bias")(r), maxBias)}>{metricIndex("Bias")(r)}</td>
                <td className="p-2 border-b border-slate-700" style={cellStyle(metricIndex("Toxicity")(r), maxTox)}>{metricIndex("Toxicity")(r)}</td>
                <td className="p-2 border-b border-slate-700" style={cellStyle(metricIndex("Factual")(r), maxFact)}>{metricIndex("Factual")(r)}</td>
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

