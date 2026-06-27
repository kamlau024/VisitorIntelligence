import { TrendingUp, FileText, Check, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AnswerPreview } from "./answer-preview";
import { clusters } from "@/lib/mock-data/intent";
import { contentGaps } from "@/lib/mock-data/gaps";
import { compact, pct } from "@/lib/utils";

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-5 py-16 lg:py-24">
      <div className="max-w-2xl">
        <p className="kicker">What you get</p>
        <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
          Three things no chatbot does.
        </h2>
      </div>

      <div className="mt-14 space-y-20">
        {/* A — Affiliate */}
        <FeatureRow
          tag="Revenue"
          tagVariant="default"
          title="Author-Voiced Affiliate Surfacing"
          body="When a reader asks what to buy, the answer cites your own recommended product — as a quiet 'author's pick' chip, not a banner ad. Grounded in your writing, capped at one per answer, never spammy."
          points={[
            "Surfaces your existing affiliate links, in your voice",
            "Only when you've recommended it in 2+ posts",
            "Revenue tracked per question-cluster, not per link",
          ]}
          visual={
            <div className="rounded-xl border border-line bg-paper/60 p-4">
              <AnswerPreview
                question="What stand mixer do you use?"
                paragraphs={[
                  "For the focaccia I use a KitchenAid Pro 5 Plus — the workhorse I've had since 2020. It handles wet, sticky dough without walking across the counter.",
                ]}
                confidence="high"
                citations={["Weeknight Sourdough Focaccia"]}
                affiliate={{
                  product: "KitchenAid Pro 5 Plus",
                  retailer: "Amazon",
                  price: 449,
                  authorPickSince: 2020,
                }}
                compact
              />
            </div>
          }
        />

        {/* C — Intent capture */}
        <FeatureRow
          reverse
          tag="The moat"
          tagVariant="teal"
          title="Intent-capture analytics"
          body="GA4 and Hotjar show you what visitors did. Visitor Intelligence shows you what they wanted — their actual questions, clustered and trended. It's a whole signal Google stopped giving you."
          points={[
            "See why visitors came, not just what they clicked",
            "~10× the intent coverage of surveys or comments",
            "First-party — owned by you, not inferred by an ad network",
          ]}
          visual={<ClusterVisual />}
        />

        {/* B — Gap to draft */}
        <FeatureRow
          tag="Stickiness"
          tagVariant="plum"
          title="Gap-to-Draft Pipeline"
          body="Questions you can't answer well cluster into a ranked Content Gap report — each one a pre-built outline stitched from your own posts. Not an AI essay; a scaffold you finish in 90 minutes."
          points={[
            "Ranked by volume and week-over-week trend",
            "Verbatim reader questions, ready to embed",
            "One click to a WordPress, Notion, or markdown draft",
          ]}
          visual={<GapVisual />}
        />
      </div>
    </section>
  );
}

function FeatureRow({
  tag,
  tagVariant,
  title,
  body,
  points,
  visual,
  reverse,
}: {
  tag: string;
  tagVariant: React.ComponentProps<typeof Badge>["variant"];
  title: string;
  body: string;
  points: string[];
  visual: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2">
      <div className={reverse ? "lg:order-2" : ""}>
        <Badge variant={tagVariant}>{tag}</Badge>
        <h3 className="mt-4 font-display text-2xl font-medium tracking-tight text-ink sm:text-3xl">
          {title}
        </h3>
        <p className="mt-3 text-base leading-relaxed text-ink-muted">{body}</p>
        <ul className="mt-5 space-y-2.5">
          {points.map((p) => (
            <li key={p} className="flex items-start gap-2.5 text-sm text-ink">
              <Check className="mt-0.5 size-4 shrink-0 text-accent" />
              {p}
            </li>
          ))}
        </ul>
      </div>
      <div className={reverse ? "lg:order-1" : ""}>{visual}</div>
    </div>
  );
}

function ClusterVisual() {
  const top = clusters.slice(0, 5);
  const max = Math.max(...top.map((c) => c.volume));
  return (
    <div className="rounded-xl border border-line bg-surface p-5 edge">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-ink">Top intent this week</span>
        <span className="text-xs text-ink-subtle">4,209 questions</span>
      </div>
      <div className="space-y-3">
        {top.map((c) => (
          <div key={c.id}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-ink">{c.label}</span>
              <span className="flex items-center gap-2">
                <span className="tnum text-ink-muted">{compact(c.volume)}</span>
                <span
                  className={`inline-flex items-center gap-0.5 text-xs ${
                    c.trendWoW >= 0 ? "text-positive" : "text-ink-subtle"
                  }`}
                >
                  <TrendingUp className="size-3" />
                  {pct(c.trendWoW)}
                </span>
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-paper-2">
              <div
                className="h-full rounded-full bg-teal/70"
                style={{ width: `${(c.volume / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GapVisual() {
  const gap = contentGaps[0];
  return (
    <div className="rounded-xl border border-line bg-surface p-5 edge">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Badge variant="plum">Gap detected</Badge>
          <h4 className="mt-2 font-display text-lg font-medium text-ink">
            {gap.label}
          </h4>
        </div>
        <span className="rounded-md bg-positive-soft px-2 py-1 text-xs font-semibold text-positive">
          ↑ 3.2× WoW
        </span>
      </div>
      <p className="mt-2 text-sm text-ink-muted">
        {gap.volume} readers asked this month. You&apos;ve touched it in 2 posts.
      </p>
      <div className="mt-4 space-y-2 rounded-lg bg-paper/70 p-3">
        {gap.outline.slice(0, 3).map((o, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-ink">
            <FileText className="size-3.5 text-ink-subtle" />
            {o.heading}
          </div>
        ))}
        <div className="text-xs text-ink-subtle">+ FAQ block from 5 reader questions</div>
      </div>
      <button className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-accent-ink">
        Send to WordPress draft <ArrowUpRight className="size-3.5" />
      </button>
    </div>
  );
}
