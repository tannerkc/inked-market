/** Numbered path steps used across booking flow gates and confirmations. */
export function StepList({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-3">
      {steps.map((label, i) => (
        <li key={label} className="flex items-center gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-ink-black/[0.12] font-mono text-[10px] text-ink-black/50 dark:border-ink-cream/[0.12] dark:text-ink-cream/50">
            {i + 1}
          </span>
          <span className="text-[13px] text-ink-black/70 dark:text-ink-cream/70">{label}</span>
        </li>
      ))}
    </ol>
  );
}
