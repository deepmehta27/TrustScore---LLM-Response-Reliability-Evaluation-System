import * as React from "react";
import { cn } from "../../lib/cn";

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-md border border-slate-700 bg-slate-900 p-2 text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500",
        className
      )}
      {...props}
    />
  );
}

