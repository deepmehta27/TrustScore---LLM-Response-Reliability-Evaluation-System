import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "../../lib/cn";

export function Progress({ value, className }: { value: number; className?: string }) {
  const getColor = (val: number) => {
    if (val >= 80) return "bg-[#10b981]";
    if (val >= 60) return "bg-[#fbbf24]";
    return "bg-[#ef4444]";
  };
  
  return (
    <ProgressPrimitive.Root className={cn("relative h-3 w-full overflow-hidden rounded-full bg-slate-700", className)}>
      <ProgressPrimitive.Indicator 
        style={{ width: `${value}%` }} 
        className={cn("h-full transition-all duration-500", getColor(value))} 
      />
    </ProgressPrimitive.Root>
  );
}

