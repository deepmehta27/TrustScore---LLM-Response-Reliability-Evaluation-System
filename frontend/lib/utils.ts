export function badgeForScore(score: number) {
  if (score >= 80) return { label: "High", bg: "#22c55e", fg: "#0f172a" };
  if (score >= 60) return { label: "Medium", bg: "#f59e0b", fg: "#0f172a" };
  return { label: "Low", bg: "#ef4444", fg: "#0f172a" };
}

