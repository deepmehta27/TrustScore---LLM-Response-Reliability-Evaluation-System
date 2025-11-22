import { twMerge } from "tailwind-merge";

export function cn(...classes: Array<string | false | null | undefined>) {
  const filtered = classes.filter((cls): cls is string => Boolean(cls));
  return twMerge(filtered.join(" "));
}

