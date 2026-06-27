"use client";

import * as React from "react";
import { Search, Sparkles, ArrowUpRight, MessageSquareText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConfidencePill } from "@/components/confidence";
import { TrendPill } from "@/components/dashboard/primitives";
import { MiniArea } from "@/components/dashboard/charts";
import { clusters, recentQuestions } from "@/lib/mock-data/intent";
import { posts, postById } from "@/lib/mock-data/site";
import { compact, cn } from "@/lib/utils";
import type { IntentCluster } from "@/lib/mock-data/types";

const CATS = Array.from(new Set(clusters.map((c) => c.category)));

// Deterministic 8-point trend per cluster so the detail sparkline reads real.
function clusterSeries(c: IntentCluster) {
  const end = c.volume;
  const start = end / (1 + c.trendWoW / 100);
  return Array.from({ length: 8 }, (_, i) => {
    const t = i / 7;
    const wobble = Math.sin(i * 1.7 + c.label.length) * (end * 0.04);
    return { i, v: Math.round(start + (end - start) * t + wobble) };
  });
}

export function IntentExplorer() {
  const [q, setQ] = React.useState("");
  const [cat, setCat] = React.useState<string | null>(null);
  const [selectedId, setSelectedId] = React.useState(clusters[0].id);

  const filtered = clusters.filter(
    (c) =>
      (!cat || c.category === cat) &&
      (!q || c.label.toLowerCase().includes(q.toLowerCase()) ||
        c.sampleQuestions.some((s) => s.toLowerCase().includes(q.toLowerCase())))
  );
  const selected = clusters.find((c) => c.id === selectedId) ?? filtered[0] ?? clusters[0];
  const max = Math.max(...clusters.map((c) => c.volume));

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.25fr]">
      {/* list column */}
      <div className="rounded-xl border border-line bg-surface edge">
        <div className="border-b border-line p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search questions…" className="pl-9" />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <FilterChip active={!cat} onClick={() => setCat(null)}>All</FilterChip>
            {CATS.map((c) => (
              <FilterChip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</FilterChip>
            ))}
          </div>
        </div>
        <div className="max-h-[640px] divide-y divide-line overflow-y-auto">
          {filtered.map((c) => (
            <button key={c.id} onClick={() => setSelectedId(c.id)}
              className={cn(
                "flex w-full flex-col gap-2 p-4 text-left transition-colors",
                c.id === selected.id ? "bg-accent-soft/30" : "hover:bg-surface-2"
              )}>
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-sm font-medium text-ink">
                  {c.label}
                  {c.buyingIntent && <Sparkles className="size-3.5 text-accent" />}
                </span>
                <TrendPill value={c.trendWoW} />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper-2">
                  <div className="h-full rounded-full bg-teal/70" style={{ width: `${(c.volume / max) * 100}%` }} />
                </div>
                <span className="tnum text-xs text-ink-muted">{compact(c.volume)}</span>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-sm text-ink-muted">No clusters match &ldquo;{q}&rdquo;.</div>
          )}
        </div>
      </div>

      {/* detail column */}
      <ClusterDetail cluster={selected} />
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={cn(
        "rounded-full border px-2.5 py-1 text-xs font-medium capitalize transition-colors",
        active ? "border-accent/40 bg-accent-soft text-accent-press" : "border-line-strong text-ink-muted hover:bg-surface-2"
      )}>
      {children}
    </button>
  );
}

function ClusterDetail({ cluster }: { cluster: IntentCluster }) {
  const series = clusterSeries(cluster);
  const verbatim = recentQuestions.filter((rq) => rq.clusterId === cluster.id);
  const samples = cluster.sampleQuestions.map((text, i) => ({
    text,
    confidence: verbatim[i]?.confidence ?? cluster.avgConfidence,
    postId: verbatim[i]?.postId ?? cluster.relatedPosts[0],
  }));

  return (
    <div className="rounded-xl border border-line bg-surface edge">
      <div className="border-b border-line p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="teal" className="capitalize">{cluster.category}</Badge>
              {cluster.buyingIntent && (
                <Badge><Sparkles className="size-3" /> Buying intent</Badge>
              )}
            </div>
            <h2 className="mt-2 font-display text-2xl font-medium tracking-tight text-ink">{cluster.label}</h2>
          </div>
          <div className="text-right">
            <div className="font-display text-3xl font-medium text-ink tnum">{cluster.volume.toLocaleString()}</div>
            <div className="mt-1 flex items-center justify-end gap-1.5 text-xs text-ink-muted">
              questions <TrendPill value={cluster.trendWoW} /> WoW
            </div>
          </div>
        </div>
        <div className="mt-4">
          <MiniArea data={series} dataKey="v" />
        </div>
      </div>

      {cluster.buyingIntent && (
        <div className="flex items-start gap-3 border-b border-line bg-accent-soft/30 p-4">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-accent" />
          <p className="text-sm text-ink">
            <span className="font-semibold">Affiliate opportunity.</span> This cluster carries
            buying intent — answers here are eligible to surface your author&apos;s-pick links.{" "}
            <a href="/dashboard/revenue" className="font-medium text-accent hover:underline">See revenue →</a>
          </p>
        </div>
      )}

      <div className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <MessageSquareText className="size-4 text-ink-subtle" />
          <h3 className="text-sm font-semibold text-ink">What readers actually asked</h3>
        </div>
        <div className="space-y-2">
          {samples.map((s, i) => (
            <div key={i} className="flex items-center justify-between gap-3 rounded-lg border border-line bg-paper/50 px-3.5 py-2.5">
              <span className="text-sm text-ink">&ldquo;{s.text}&rdquo;</span>
              <ConfidencePill level={s.confidence} />
            </div>
          ))}
        </div>

        <div className="mt-5">
          <h3 className="mb-2 text-sm font-semibold text-ink">Where it&apos;s asked</h3>
          <div className="flex flex-wrap gap-2">
            {cluster.relatedPosts.map((pid) => (
              <a key={pid} href="#" className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-surface px-3 py-1.5 text-xs text-ink transition-colors hover:border-accent/40 hover:bg-accent-soft/40">
                {postById(pid)?.title}
                <ArrowUpRight className="size-3 text-ink-subtle" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function IntentByPage() {
  const ranked = [...posts].sort((a, b) => b.questionsCaptured - a.questionsCaptured);
  const max = Math.max(...ranked.map((p) => p.questionsCaptured));
  return (
    <div className="space-y-3">
      {ranked.map((p) => (
        <div key={p.id} className="flex items-center gap-3">
          <span className="w-44 shrink-0 truncate text-sm text-ink">{p.title}</span>
          <div className="h-6 flex-1 overflow-hidden rounded-md bg-paper-2">
            <div className="flex h-full items-center justify-end rounded-md bg-teal/25 pr-2"
              style={{ width: `${(p.questionsCaptured / max) * 100}%` }}>
              <span className="tnum text-xs font-medium text-teal">{p.questionsCaptured}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
