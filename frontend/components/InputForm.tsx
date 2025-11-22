"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Select } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { cn } from "../lib/cn";
import { Heart, DollarSign, MessageSquare, Play, CheckCircle2, Loader2 } from "lucide-react";

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

const AVAILABLE_MODELS = [
  { id: "gpt-4.1", label: "GPT-4.1", provider: "OpenAI" },
  { id: "gpt-5.1", label: "GPT-5.1", provider: "OpenAI" },
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", provider: "Google" },
  { id: "deepseek/deepseek-chat-v3-0324:free", label: "DeepSeek Chat", provider: "OpenRouter" },
  { id: "claude-sonnet-4-5-20250929", label: "Claude 3.5 Sonnet", provider: "Anthropic" },
];

export default function InputForm({ isLoading, onCompare }: Props) {
  const [query, setQuery] = useState("");
  const [context, setContext] = useState("");
  const [preset, setPreset] = useState("general");
  const [selectedModels, setSelectedModels] = useState<string[]>(["gpt-4.1", "gpt-5.1"]);
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  function toggleModel(id: string) {
    setSelectedModels((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
  }

  function applyDemo(key: keyof typeof DEMOS) {
    const d = DEMOS[key];
    setQuery(d.query);
    setContext(d.context);
    setActiveDemo(key);
    if (key === "healthcare") setPreset("healthcare");
    if (key === "finance") setPreset("finance");
    if (key === "support") setPreset("general");
    
    // Show brief feedback
    setTimeout(() => setActiveDemo(null), 2000);
  }

  const canCompare = query.trim().length > 0 && selectedModels.length > 0 && !isLoading;

  return (
    <Card className="mb-8">
      <CardHeader>
        <h2 className="text-xl font-bold text-white">Model Comparison</h2>
        <p className="text-sm text-slate-400 mt-1">
          Configure your evaluation query and select models to compare
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Demo Preset Tabs */}
        <div>
          <label className="block text-sm font-medium text-white mb-3">
            Quick Start Demos
          </label>
          <div className="inline-flex gap-1 rounded-lg bg-[#1e293b] p-1 border border-slate-700">
            <button
              type="button"
              onClick={() => applyDemo("healthcare")}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200",
                activeDemo === "healthcare"
                  ? "bg-[#10b981] text-white shadow-md"
                  : "text-slate-300 hover:text-white hover:bg-[#334155]"
              )}
            >
              <Heart className="h-4 w-4" />
              Healthcare
            </button>
            <button
              type="button"
              onClick={() => applyDemo("finance")}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200",
                activeDemo === "finance"
                  ? "bg-[#10b981] text-white shadow-md"
                  : "text-slate-300 hover:text-white hover:bg-[#334155]"
              )}
            >
              <DollarSign className="h-4 w-4" />
              Finance
            </button>
            <button
              type="button"
              onClick={() => applyDemo("support")}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200",
                activeDemo === "support"
                  ? "bg-[#10b981] text-white shadow-md"
                  : "text-slate-300 hover:text-white hover:bg-[#334155]"
              )}
            >
              <MessageSquare className="h-4 w-4" />
              Customer Support
            </button>
          </div>
        </div>

        {/* Query Input */}
        <div>
          <label htmlFor="query" className="block text-sm font-medium text-white mb-2">
            Query <span className="text-[#ef4444]">*</span>
          </label>
          <p className="text-xs text-slate-400 mb-2">
            Enter the question or prompt you want to evaluate
          </p>
          <Textarea
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={4}
            placeholder="e.g., What are the side effects of this medication?"
            className="min-h-[120px]"
          />
        </div>

        {/* Context Input */}
        <div>
          <label htmlFor="context" className="block text-sm font-medium text-white mb-2">
            Context <span className="text-slate-400 text-xs">(Optional)</span>
          </label>
          <p className="text-xs text-slate-400 mb-2">
            Provide relevant context or background information for evaluation
          </p>
          <Textarea
            id="context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={5}
            placeholder="e.g., Clinical guidelines, documentation, or reference material..."
            className="min-h-[150px]"
          />
        </div>

        {/* Preset Dropdown */}
        <div>
          <label htmlFor="preset" className="block text-sm font-medium text-white mb-2">
            Industry Preset
          </label>
          <p className="text-xs text-slate-400 mb-2">
            Select the evaluation preset that best matches your use case
          </p>
          <Select
            id="preset"
            value={preset}
            onChange={(e) => setPreset(e.target.value)}
          >
            <option value="healthcare">Healthcare</option>
            <option value="finance">Finance</option>
            <option value="general">General</option>
          </Select>
        </div>

        {/* Model Selection */}
        <div>
          <label className="block text-sm font-medium text-white mb-3">
            Select Models <span className="text-[#ef4444]">*</span>
          </label>
          <p className="text-xs text-slate-400 mb-3">
            {selectedModels.length} {selectedModels.length === 1 ? "model" : "models"} selected
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {AVAILABLE_MODELS.map((model) => (
              <div
                key={model.id}
                className={`
                  flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer
                  ${selectedModels.includes(model.id)
                    ? "border-[#10b981] bg-[#10b981]/10 hover:bg-[#10b981]/15"
                    : "border-slate-700 bg-[#334155] hover:border-slate-600 hover:bg-[#475569]"
                  }
                `}
                onClick={() => toggleModel(model.id)}
              >
                <div className="flex items-center gap-3 flex-1">
                  <Checkbox
                    checked={selectedModels.includes(model.id)}
                    onChange={() => toggleModel(model.id)}
                    label=""
                    className="pointer-events-none"
                  />
                  <div>
                    <div className="text-sm font-medium text-white">{model.label}</div>
                    <div className="text-xs text-slate-400">{model.provider}</div>
                  </div>
                </div>
                {selectedModels.includes(model.id) && (
                  <CheckCircle2 className="h-5 w-5 text-[#10b981]" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Compare Button */}
        <div className="pt-4">
          <Button
            size="xl"
            disabled={!canCompare}
            onClick={() => onCompare({ query, models: selectedModels, context, preset })}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Evaluating models...
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                Compare Models
              </>
            )}
          </Button>
          {!canCompare && (
            <p className="text-xs text-slate-400 mt-2 text-center">
              {!query.trim() && "Please enter a query. "}
              {selectedModels.length === 0 && "Please select at least one model."}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
