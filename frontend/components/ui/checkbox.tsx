import * as React from "react";
import { cn } from "../../lib/cn";
import { Check } from "lucide-react";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Checkbox({ className, label, checked, ...props }: CheckboxProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          {...props}
        />
        <div className={cn(
          "w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center",
          checked 
            ? "bg-[#10b981] border-[#10b981]" 
            : "border-slate-600 bg-[#334155] group-hover:border-slate-500",
          className
        )}>
          {checked && <Check className="w-4 h-4 text-white" />}
        </div>
      </div>
      {label && <span className="text-sm text-white select-none">{label}</span>}
    </label>
  );
}

