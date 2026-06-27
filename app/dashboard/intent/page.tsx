import { Eye } from "lucide-react";
import { PageHeader, PageBody, StatCard, Panel } from "@/components/dashboard/primitives";
import { IntentExplorer, IntentByPage } from "@/components/dashboard/intent-explorer";
import { clusters } from "@/lib/mock-data/intent";

export const metadata = { title: "Intent Explorer — Visitor Intelligence" };

export default function IntentPage() {
  const total = clusters.reduce((s, c) => s + c.volume, 0);
  const buying = clusters.filter((c) => c.buyingIntent).reduce((s, c) => s + c.volume, 0);
  const buyingPct = Math.round((buying / total) * 100);

  return (
    <PageBody>
      <PageHeader
        kicker="Intent Explorer"
        title="Why your visitors came"
        description="Behavior tools show you what visitors did. This shows you what they wanted — their actual questions, captured first-party on your own site and clustered into intent."
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Questions captured" value={total.toLocaleString()} footnote="last 30 days" />
        <StatCard label="Intent clusters" value={String(clusters.length)} footnote="auto-grouped by meaning" />
        <StatCard label="Carrying buying intent" value={`${buyingPct}%`} footnote="eligible for affiliate surfacing" accent />
        <CoverageCard />
      </div>

      <div className="mt-4">
        <IntentExplorer />
      </div>

      <div className="mt-4">
        <Panel
          title="Intent by recipe"
          description="Which pages generate the most reader questions — your evergreen content, re-discovered"
        >
          <IntentByPage />
        </Panel>
      </div>
    </PageBody>
  );
}

function CoverageCard() {
  // chat 2.4% vs survey/comment ~0.2% baseline → ~12× coverage
  return (
    <div className="rounded-xl border border-line bg-surface p-5 edge">
      <div className="flex items-center justify-between">
        <span className="text-sm text-ink-muted">Intent coverage</span>
        <Eye className="size-4 text-ink-subtle" />
      </div>
      <div className="mt-2 font-display text-3xl font-medium text-ink tnum">~12×</div>
      <div className="mt-2 space-y-1.5">
        <Bar label="This widget" value={2.4} max={2.4} color="bg-accent" />
        <Bar label="Surveys / comments" value={0.2} max={2.4} color="bg-line-strong" />
      </div>
    </div>
  );
}

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-28 shrink-0 text-[11px] text-ink-subtle">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper-2">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${(value / max) * 100}%` }} />
      </div>
      <span className="tnum w-8 text-right text-[11px] text-ink-muted">{value}%</span>
    </div>
  );
}
