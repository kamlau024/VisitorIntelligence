import { Sparkles, ArrowUpRight } from "lucide-react";
import { ConfidenceBar } from "@/components/confidence";
import { Mark } from "@/components/brand";
import { money } from "@/lib/utils";
import type { Confidence } from "@/lib/mock-data/types";

interface Props {
  question: string;
  paragraphs: string[];
  confidence: Confidence;
  citations: string[];
  affiliate?: { product: string; retailer: string; price: number; authorPickSince: number | null };
  compact?: boolean;
}

/** Static, presentational render of a widget answer — used in marketing. */
export function AnswerPreview({
  question,
  paragraphs,
  confidence,
  citations,
  affiliate,
  compact,
}: Props) {
  return (
    <div className="space-y-3">
      {/* visitor question */}
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-ink px-3.5 py-2 text-sm text-paper">
          {question}
        </div>
      </div>

      {/* author-voiced answer */}
      <div className="flex gap-2.5">
        <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-soft">
          <Mark className="size-4" />
        </div>
        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="rounded-2xl rounded-tl-sm border border-line bg-surface px-3.5 py-3 text-sm leading-relaxed text-ink">
            {paragraphs.slice(0, compact ? 1 : paragraphs.length).map((p, i) => (
              <p key={i} className={i > 0 ? "mt-2.5" : ""}>
                {p}
              </p>
            ))}

            {affiliate && (
              <a
                href="#"
                className="group mt-3 flex items-center gap-2.5 rounded-lg border border-line bg-paper px-2.5 py-2 transition-colors hover:border-accent/40 hover:bg-accent-soft/40"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent">
                  <Sparkles className="size-4" />
                </span>
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block truncate text-[13px] font-semibold text-ink">
                    {affiliate.product}
                  </span>
                  <span className="text-[11px] text-ink-muted">
                    {money(affiliate.price)} at {affiliate.retailer}
                    {affiliate.authorPickSince
                      ? ` · author's pick since ${affiliate.authorPickSince}`
                      : ""}
                  </span>
                </span>
                <ArrowUpRight className="size-4 shrink-0 text-ink-subtle transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <ConfidenceBar level={confidence} />
            {citations.length > 0 && (
              <span className="text-[11px] text-ink-subtle">
                from {citations.length} of Maya&apos;s posts
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
