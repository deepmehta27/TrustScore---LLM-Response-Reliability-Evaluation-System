"use client";
import { useState } from "react";

type Props = {
  isLoading: boolean;
  onCompare: (payload: { query: string; models: string[]; context: string; preset: string }) => Promise<void>;
};

const DEMOS = {
  healthcare: {
    query: "What treatment is recommended for stage 2 hypertension?",
    context:
      "Current clinical guidelines recommend lifestyle modifications and pharmacological intervention for stage 2 hypertension (BP ≥140/90 mmHg).",
    response: "Lifestyle changes and antihypertensive medications are typically recommended for stage 2 hypertension.",
  },
  finance: {
    query: "Should I invest in cryptocurrency?",
    context: "Cryptocurrency is a highly volatile asset class with significant risk.",
    response: "Consider your risk tolerance: crypto can be part of a diversified portfolio but carries high volatility.",
  },
  support: {
    query: "How do I reset my password?",
    context: "Password reset can be done via the 'Forgot Password' link on the login page.",
    response: "Click the 'Forgot Password' link on the login page and follow the instructions.",
  },
};

export default function InputForm({ isLoading, onCompare }: Props) {
  const [query, setQuery] = useState("");
  const [context, setContext] = useState("");
  const [preset, setPreset] = useState("general");
  const [selectedModels, setSelectedModels] = useState<string[]>(["gpt-4.1", "gpt-5.1"]);

  function toggleModel(id: string) {
    setSelectedModels((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
  }

  function applyDemo(key: keyof typeof DEMOS) {
    const d = DEMOS[key];
    setQuery(d.query);
    setContext(d.context);
    if (key === "healthcare") setPreset("healthcare");
    if (key === "finance") setPreset("finance");
    if (key === "support") setPreset("general");
  }

  return (
    <div style={{ background: "#111827", padding: 16, borderRadius: 12, border: "1px solid #334155" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <span style={{ fontWeight: 700 }}>Model Comparison</span>
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <button onClick={() => applyDemo("healthcare")} style={btnStyle}>Healthcare Demo</button>
        <button onClick={() => applyDemo("finance")} style={btnStyle}>Finance Demo</button>
        <button onClick={() => applyDemo("support")} style={btnStyle}>Customer Support Demo</button>
      </div>

      <label style={labelStyle}>Query</label>
      <textarea value={query} onChange={(e) => setQuery(e.target.value)} style={taStyle} rows={3} />

      <label style={labelStyle}>Context</label>
      <textarea value={context} onChange={(e) => setContext(e.target.value)} style={taStyle} rows={3} />

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 12 }}>
        <label style={labelStyle}>Preset</label>
        <select value={preset} onChange={(e) => setPreset(e.target.value)} style={selectStyle}>
          <option value="healthcare">Healthcare</option>
          <option value="finance">Finance</option>
          <option value="general">General</option>
        </select>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ ...labelStyle, marginRight: 8 }}>Models:</span>
          {[
            { id: "gpt-4.1", label: "GPT-4.1" },
            { id: "gpt-5.1", label: "GPT-5.1" },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => toggleModel(m.id)}
              style={{
                ...btnStyle,
                background: selectedModels.includes(m.id) ? "#60a5fa" : "#334155",
                color: selectedModels.includes(m.id) ? "#0f172a" : "#e2e8f0",
              }}
            >
              {m.label}
            </button>
          ))}
          <button
            disabled={!query || selectedModels.length === 0 || isLoading}
            onClick={() => onCompare({ query, models: selectedModels, context, preset })}
            style={btnSecondary}
          >
            {isLoading ? "Comparing…" : "Compare Models"}
          </button>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { fontWeight: 600, marginTop: 8 };
const taStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 8,
  padding: 10,
  border: "1px solid #334155",
  background: "#0b1220",
  color: "#e2e8f0",
};
const selectStyle: React.CSSProperties = {
  borderRadius: 8,
  padding: "8px 10px",
  border: "1px solid #334155",
  background: "#0b1220",
  color: "#e2e8f0",
};
const btnStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #334155",
  background: "#22c55e",
  color: "#0f172a",
  fontWeight: 700,
  cursor: "pointer",
};
const btnSecondary: React.CSSProperties = {
  ...btnStyle,
  background: "#60a5fa",
};
