import Link from "next/link";
import { Sparkles } from "lucide-react";
import { ConfidencePill } from "@/components/confidence";
import { TrendPill } from "@/components/dashboard/primitives";
import { postById } from "@/lib/mock-data/site";
import { compact, timeAgo, cn } from "@/lib/utils";
import type { IntentCluster, VisitorQuestion } from "@/lib/mock-data/types";

const CAT_COLOR: Record<string, string> = {
  substitution: "bg-clay", dietary: "bg-plum", equipment: "bg-teal",
  technique: "bg-ochre", timing: "bg-sage", storage: "bg-olive",
  scaling: "bg-teal", sourcing: "bg-plum", nutrition: "bg-ink-subtle",
};

export function ClusterBar({
  cluster, max, href,
}: { cluster: IntentCluster; max: number; href?: string }) {
  const inner = (
    <>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-sm font-medium text-ink">
          <span className={cn("size-2 rounded-full", CAT_COLOR[cluster.category] ?? "bg-ink-subtle")} />
          {cluster.label}
          {cluster.buyingIntent && (
            <Sparkles className="size-3.5 text-accent" />
          )}
        </span>
        <span className="flex items-center gap-2">
          <span className="tnum text-sm text-ink-muted">{compact(cluster.volume)}</span>
          <TrendPill value={cluster.trendWoW} />
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-paper-2">
        <div className="h-full rounded-full bg-teal/70 transition-all"
          style={{ width: `${(cluster.volume / max) * 100}%` }} />
      </div>
    </>
  );
  return href ? (
    <Link href={href} className="block rounded-lg p-1 -m-1 transition-colors hover:bg-surface-2">{inner}</Link>
  ) : (
    <div>{inner}</div>
  );
}

export function QuestionRow({ q }: { q: VisitorQuestion }) {
  const post = postById(q.postId);
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug text-ink">{q.text}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-subtle">
          <span className="truncate">{post?.title}</span>
          <span>·</span>
          <span>{timeAgo(q.askedAt)}</span>
          {q.affiliateSurfaced && (
            <span className="inline-flex items-center gap-1 text-accent">
              <Sparkles className="size-3" /> link surfaced
            </span>
          )}
        </div>
      </div>
      <ConfidencePill level={q.confidence} />
    </div>
  );
}
