import * as React from "react";
import { cn } from "../../lib/cn";

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-lg border-2 border-slate-700 bg-[#334155] p-4 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-[#10b981] transition-all duration-200 resize-y",
        className
      )}
      {...props}
    />
  );
}

