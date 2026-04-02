import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ currentStep, totalSteps, className }, ref) => (
    <div ref={ref} className={cn("flex items-center gap-2 mb-4", className)}>
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        let bg = "bg-ink-black/[0.06]"; // pending
        if (step < currentStep) bg = "bg-ink-black/25"; // done
        if (step === currentStep) bg = "bg-ink-red"; // active
        return <div key={step} className={cn("h-[3px] flex-1 rounded-full", bg)} />;
      })}
      <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink-black/25 whitespace-nowrap">
        {currentStep} / {totalSteps}
      </span>
    </div>
  )
);
ProgressBar.displayName = "ProgressBar";

export { ProgressBar };
export type { ProgressBarProps };
