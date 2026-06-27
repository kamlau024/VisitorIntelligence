import Link from "next/link";
import { ArrowRight, PenLine, HandCoins, Radar, Sparkles, Inbox } from "lucide-react";
import {
  PageHeader, PageBody, StatCard, Panel, EstimateTag, TrendPill,
} from "@/components/dashboard/primitives";
import { ClusterBar, QuestionRow } from "@/components/dashboard/lists";
import { AreaTrend } from "@/components/dashboard/charts";
import { Button } from "@/components/ui/button";
import { db, clusters, recentQuestions, contentGaps } from "@/lib/mock-data";
import { money } from "@/lib/utils";

export default function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  return <Resolver searchParams={searchParams} />;
}

async function Resolver({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  const sp = await searchParams;
  if (sp.state === "empty") return <EmptyOverview />;
  return <PopulatedOverview />;
}

function PopulatedOverview() {
  const o = db.overview;
  const topClusters = clusters.slice(0, 6);
  const max = Math.max(...topClusters.map((c) => c.volume));
  const gap = contentGaps[0];

  return (
    <PageBody>
      <PageHeader
        kicker="Good morning, Maya"
        title="Here's what your readers wanted this week"
        description="First-party visitor intent from theweeknightkitchen.com — the questions your visitors asked you directly, not what Google inferred."
        actions={
          <Button asChild variant="secondary" size="sm">
            <Link href="/dashboard/intent">Explore intent <ArrowRight /></Link>
          </Button>
        }
      />

      {/* stat cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Questions captured" value={o.questionsThisWeek.toLocaleString()}
          trend={o.questionsTrendWoW} footnote="this week" />
        <StatCard label="Reader engagement" value={`${o.engagedRate}%`}
          footnote={`≈10× the ${o.baselineRate}% survey baseline`} />
        <StatCard label="Chat-attributed clicks" value={o.clicksThisWeek.toLocaleString()}
          trend={o.clicksTrendWoW} footnote="to your affiliate links" />
        <StatCard label="Modeled revenue" value={money(o.modeledRevenue, { compact: true })}
          trend={o.revenueTrendWoW} accent
          footnote="estimated from chat clicks" />
      </div>

      {/* main grid */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Panel title="Questions captured" description="Daily first-party visitor intent, last 30 days"
          action={<EstimateTag>Live</EstimateTag>}>
          <AreaTrend data={db.dailySeries} dataKey="questions" />
        </Panel>

        <div className="grid gap-4">
          {/* biggest gap */}
          <Panel className="bg-linear-to-br from-surface to-accent-soft/30">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <PenLine className="size-[18px]" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="kicker">Biggest gap this week</p>
                  <TrendPill value={gap.trendWoW} />
                </div>
                <h3 className="mt-1 font-display text-lg font-medium leading-tight text-ink">
                  {gap.label}
                </h3>
                <p className="mt-1 text-sm text-ink-muted">
                  {gap.volume} readers asked. You&apos;ve touched it in {gap.nearMissPosts.length} posts.
                </p>
                <Button asChild size="sm" className="mt-3">
                  <Link href="/dashboard/content-gaps">Turn into a draft <ArrowRight /></Link>
                </Button>
              </div>
            </div>
          </Panel>

          {/* needs your voice */}
          <Panel>
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-conf-low-soft text-conf-low">
                <HandCoins className="size-[18px]" />
              </span>
              <div className="min-w-0">
                <p className="kicker">Needs your voice</p>
                <h3 className="mt-1 font-display text-lg font-medium leading-tight text-ink">
                  2 readers paid to ask you directly
                </h3>
                <p className="mt-1 text-sm text-ink-muted">
                  Plus {o.unansweredThisWeek} low-confidence questions worth a look.
                </p>
                <Button asChild size="sm" variant="secondary" className="mt-3">
                  <Link href="/dashboard/bounties">Open bounty inbox <ArrowRight /></Link>
                </Button>
              </div>
            </div>
          </Panel>
        </div>
      </div>

      {/* lower grid */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Top intent clusters" description="What visitors most wanted to know"
          action={<Link href="/dashboard/intent" className="text-sm font-medium text-accent hover:underline">View all</Link>}>
          <div className="space-y-3.5">
            {topClusters.map((c) => (
              <ClusterBar key={c.id} cluster={c} max={max} href="/dashboard/intent" />
            ))}
          </div>
        </Panel>

        <Panel title="Live question feed" description="Newest visitor questions, as they arrive"
          action={<span className="flex items-center gap-1.5 text-xs text-ink-muted"><span className="size-2 rounded-full bg-positive animate-pulse-dot" /> live</span>}>
          <div className="divide-y divide-line">
            {recentQuestions.slice(0, 7).map((q) => (
              <QuestionRow key={q.id} q={q} />
            ))}
          </div>
        </Panel>
      </div>
    </PageBody>
  );
}

function EmptyOverview() {
  return (
    <PageBody>
      <PageHeader kicker="Welcome to Visitor Intelligence" title="Your dashboard is ready" />
      <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-20 text-center edge">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-accent-soft text-accent">
          <Inbox className="size-8" />
        </span>
        <h2 className="mt-6 font-display text-2xl font-medium text-ink">
          No visitor intent captured yet
        </h2>
        <p className="mx-auto mt-2 max-w-md text-ink-muted">
          As soon as a reader asks your widget a question, it&apos;ll appear here —
          clustered into intent, surfaced as revenue, and turned into your next post.
          Most sites see their first questions within an hour of going live.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/get-started">Finish installing the widget <ArrowRight /></Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/demo">Preview the widget</Link>
          </Button>
        </div>

        <div className="mt-10 grid w-full max-w-lg gap-3 text-left sm:grid-cols-3">
          {[
            { icon: Radar, label: "Capture intent" },
            { icon: Sparkles, label: "Surface revenue" },
            { icon: PenLine, label: "Draft what's next" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2.5 rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-sm text-ink-muted">
              <s.icon className="size-4 text-ink-subtle" /> {s.label}
            </div>
          ))}
        </div>
      </div>
    </PageBody>
  );
}
