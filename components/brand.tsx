import { cn } from "@/lib/utils";

/**
 * Visitor Intelligence mark: a speech bubble (the visitor's question)
 * holding a single rising signal (the intelligence). Terracotta on cream.
 */
export function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={cn("size-7", className)}
      aria-hidden="true"
    >
      <path
        d="M6 4.5h20a3.5 3.5 0 0 1 3.5 3.5v12a3.5 3.5 0 0 1-3.5 3.5H13.2L7 27.2a.7.7 0 0 1-1.2-.5V23.5H6A3.5 3.5 0 0 1 2.5 20V8A3.5 3.5 0 0 1 6 4.5Z"
        fill="var(--accent)"
      />
      <rect x="9" y="15.5" width="2.6" height="3.5" rx="1.3" fill="var(--accent-ink)" />
      <rect x="14.7" y="12" width="2.6" height="7" rx="1.3" fill="var(--accent-ink)" />
      <rect x="20.4" y="8.5" width="2.6" height="10.5" rx="1.3" fill="var(--accent-ink)" />
    </svg>
  );
}

export function Wordmark({
  className,
  markClassName,
  showSub = false,
}: {
  className?: string;
  markClassName?: string;
  showSub?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Mark className={markClassName} />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[17px] font-medium tracking-tight text-ink">
          Visitor Intelligence
        </span>
        {showSub && (
          <span className="text-[10px] uppercase tracking-[0.18em] text-ink-subtle mt-0.5">
            Intent capture
          </span>
        )}
      </span>
    </span>
  );
}
