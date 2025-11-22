import * as React from "react";
import { cn } from "../../lib/cn";

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

export function Tabs({ className, value, onValueChange, children, ...props }: TabsProps) {
  return (
    <div className={cn("", className)} {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { value, onValueChange } as any);
        }
        return child;
      })}
    </div>
  );
}

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export function TabsList({ className, value, onValueChange, children, ...props }: TabsListProps) {
  return (
    <div className={cn("inline-flex gap-1 rounded-lg bg-[#1e293b] p-1 border border-slate-700", className)} {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { activeValue: value, onValueChange } as any);
        }
        return child;
      })}
    </div>
  );
}

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  activeValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export function TabsTrigger({ className, value, activeValue, onValueChange, children, ...props }: TabsTriggerProps) {
  const isActive = activeValue === value;
  
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-[#10b981] text-white shadow-md"
          : "text-slate-300 hover:text-white hover:bg-[#334155]",
        className
      )}
      onClick={() => onValueChange?.(value)}
      {...props}
    >
      {children}
    </button>
  );
}

