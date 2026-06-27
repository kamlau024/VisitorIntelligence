import Link from "next/link";
import { Crown, WandSparkles, Check, ArrowRight, NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";

const POINTS = [
  "A complete ~1,800-word post, written in your voice",
  "Every section drafted — not just an outline",
  "Reader Q&A built from real visitor questions",
  "Pay only when you use it — Full Draft credits",
];

export function PremiumFullDraft() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16">
      <div className="overflow-hidden rounded-2xl border border-ochre/40 bg-linear-to-br from-conf-med-soft/50 via-surface to-surface edge-lg">
        <div className="grid gap-10 p-8 lg:grid-cols-2 lg:items-center lg:p-12">
          {/* copy */}
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-ochre/40 bg-conf-med-soft/60 px-3 py-1 text-xs font-semibold text-ochre">
              <Crown className="size-3.5" /> Premium · AI Full Draft
            </span>
            <h2 className="mt-4 font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
              Slammed this week? Let Visitor Intelligence finish the post.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-muted">
              Every content gap comes with a free scaffold you finish yourself. But when you
              don&apos;t have the 90 minutes, upgrade any gap to a full, publish-ready article —
              written in your voice, grounded in your own posts.
            </p>
            <ul className="mt-6 space-y-2.5">
              {POINTS.map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-sm text-ink">
                  <Check className="mt-0.5 size-4 shrink-0 text-ochre" />
                  {p}
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button asChild className="bg-ochre text-ink hover:bg-ochre/90">
                <Link href="/dashboard/content-gaps">
                  See it in the dashboard <ArrowRight />
                </Link>
              </Button>
              <span className="text-sm text-ink-muted">Included credits on Pro & Studio</span>
            </div>
          </div>

          {/* before / after visual */}
          <div className="space-y-3">
            <UpgradeCard
              kind="scaffold"
              title="Scaffold"
              tag="Included"
            />
            <div className="flex items-center justify-center gap-2 text-xs font-medium text-ochre">
              <span className="h-px w-8 bg-ochre/40" />
              <WandSparkles className="size-4" /> upgrade with 1 credit
              <span className="h-px w-8 bg-ochre/40" />
            </div>
            <UpgradeCard
              kind="full"
              title="Full Draft"
              tag="Premium"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function UpgradeCard({
  kind, title, tag,
}: {
  kind: "scaffold" | "full";
  title: string;
  tag: string;
}) {
  const premium = kind === "full";
  return (
    <div
      className={
        premium
          ? "rounded-xl border border-ochre/45 bg-surface p-4 edge"
          : "rounded-xl border border-line bg-surface/70 p-4"
      }
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
          {premium ? <WandSparkles className="size-4 text-ochre" /> : <NotebookPen className="size-4 text-ink-subtle" />}
          {title}
        </span>
        <span
          className={
            premium
              ? "inline-flex items-center gap-1 rounded-full bg-conf-med-soft px-2 py-0.5 text-[11px] font-semibold text-ochre"
              : "rounded-full border border-line-strong px-2 py-0.5 text-[11px] font-medium text-ink-subtle"
          }
        >
          {premium && <Crown className="size-3" />} {tag}
        </span>
      </div>

      <div className="mt-3 font-display text-base font-medium text-ink">
        Freezing &amp; reheating your sourdough
      </div>

      {kind === "scaffold" ? (
        <div className="mt-2.5 space-y-1.5">
          {["Freezing baked vs. unbaked dough", "How to wrap for the best crust", "Reheating to revive the crust"].map((h) => (
            <div key={h} className="border-l-2 border-line pl-2.5 text-xs font-medium text-ink-muted">{h}</div>
          ))}
        </div>
      ) : (
        <div className="mt-2.5 space-y-1.5 text-xs leading-relaxed text-ink-muted">
          <p>Few things are sadder than a beautiful loaf going stale before you finish it — so let&apos;s fix that. Freezing sourdough keeps that bakery-fresh crumb on hand…</p>
          <div className="space-y-1 pt-1">
            <span className="block h-1.5 w-[92%] rounded bg-paper-2" />
            <span className="block h-1.5 w-full rounded bg-paper-2" />
            <span className="block h-1.5 w-[78%] rounded bg-paper-2" />
          </div>
          <p className="pt-1 text-[11px] font-medium text-ochre">~1,840 words · ready to publish</p>
        </div>
      )}
    </div>
  );
}
