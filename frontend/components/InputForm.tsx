"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

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
    <Card>
      <CardHeader>
        <div className="font-bold">Model Comparison</div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-3">
          <Button onClick={() => applyDemo("healthcare")}>Healthcare Demo</Button>
          <Button onClick={() => applyDemo("finance")}>Finance Demo</Button>
          <Button onClick={() => applyDemo("support")}>Customer Support Demo</Button>
        </div>

        <div className="font-semibold">Query</div>
        <Textarea value={query} onChange={(e) => setQuery(e.target.value)} rows={3} />

        <div className="font-semibold mt-3">Context</div>
        <Textarea value={context} onChange={(e) => setContext(e.target.value)} rows={3} />

        <div className="flex items-center gap-3 mt-3">
          <div className="font-semibold">Preset</div>
          <select value={preset} onChange={(e) => setPreset(e.target.value)} className="rounded-md border border-slate-700 bg-slate-900 p-2">
            <option value="healthcare">Healthcare</option>
            <option value="finance">Finance</option>
            <option value="general">General</option>
          </select>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold mr-2">Models:</span>
            {[
              { id: "gpt-4.1", label: "GPT-4.1" },
              { id: "gpt-5.1", label: "GPT-5.1" },
              { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
            ].map((m) => (
              <Button
                key={m.id}
                onClick={() => toggleModel(m.id)}
                variant={selectedModels.includes(m.id) ? "secondary" : "outline"}
              >
                {m.label}
              </Button>
            ))}
            <Button
              disabled={!query || selectedModels.length === 0 || isLoading}
              onClick={() => onCompare({ query, models: selectedModels, context, preset })}
            >
              {isLoading ? "Comparing…" : "Compare Models"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const labelStyle: React.CSSProperties = { fontWeight: 600, marginTop: 8 };
