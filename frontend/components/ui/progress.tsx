import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "../../lib/cn";

export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <ProgressPrimitive.Root className={cn("relative h-2 w-full overflow-hidden rounded bg-slate-700", className)}>
      <ProgressPrimitive.Indicator style={{ width: `${value}%` }} className="h-full bg-green-500" />
    </ProgressPrimitive.Root>
  );
}

