import { cn } from "@/lib/utils";
import type { Confidence } from "@/lib/mock-data/types";

const MAP: Record<
  Confidence,
  { label: string; bars: number; text: string; soft: string; bar: string }
> = {
  high: { label: "High confidence", bars: 3, text: "text-conf-high", soft: "bg-conf-high-soft", bar: "bg-conf-high" },
  medium: { label: "Medium confidence", bars: 2, text: "text-conf-med", soft: "bg-conf-med-soft", bar: "bg-conf-med" },
  low: { label: "Low confidence", bars: 1, text: "text-conf-low", soft: "bg-conf-low-soft", bar: "bg-conf-low" },
};

export function ConfidenceBar({
  level,
  showLabel = true,
  className,
}: {
  level: Confidence;
  showLabel?: boolean;
  className?: string;
}) {
  const c = MAP[level];
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="flex items-end gap-[3px]" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn(
              "w-[5px] rounded-[2px] transition-colors",
              i === 0 ? "h-2" : i === 1 ? "h-2.5" : "h-3",
              i < c.bars ? c.bar : "bg-line-strong"
            )}
          />
        ))}
      </span>
      {showLabel && (
        <span className={cn("text-xs font-medium", c.text)}>{c.label}</span>
      )}
    </span>
  );
}

export function ConfidencePill({ level }: { level: Confidence }) {
  const c = MAP[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium capitalize",
        c.soft,
        c.text
      )}
    >
      <span className={cn("size-1.5 rounded-full", c.bar)} />
      {level}
    </span>
  );
}
