import { Info, MousePointerClick, Sparkles, Plus } from "lucide-react";
import {
  PageHeader, PageBody, StatCard, Panel, EstimateTag,
} from "@/components/dashboard/primitives";
import { RevenuePie, AreaTrend } from "@/components/dashboard/charts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  revenueByCluster, revenueTotals, revenueByProduct, couldHaveLinked,
} from "@/lib/mock-data/revenue";
import { affiliateInventory, postById } from "@/lib/mock-data/site";
import { db } from "@/lib/mock-data";
import { money, compact } from "@/lib/utils";

export const metadata = { title: "Affiliate Revenue — Visitor Intelligence" };

export default function RevenuePage() {
  const maxClicks = Math.max(...revenueByCluster.map((r) => r.clicks));
  const eligible = affiliateInventory.filter((a) => a.included);

  return (
    <PageBody>
      <PageHeader
        kicker="Affiliate Revenue"
        title="Which conversations make money"
        description="Revenue attributed to the question-cluster it came from — not just per link. We report clicks first; dollar figures are modeled estimates."
        actions={<EstimateTag>Clicks-first</EstimateTag>}
      />

      {/* stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Chat-attributed clicks" value={compact(revenueTotals.clicks)}
          trend={9} footnote="primary metric — measured" accent />
        <StatCard label="Modeled revenue" value={money(revenueTotals.modeledRevenue, { compact: true })}
          trend={14} footnote="estimated, not measured" />
        <StatCard label="Top earning cluster" value="Equipment"
          footnote={`${money(revenueByCluster[0].modeledRevenue)} this month`} />
        <StatCard label="Eligible products" value={String(eligible.length)}
          footnote="approved to surface in answers" />
      </div>

      {/* attribution note */}
      <div className="mt-4 flex items-start gap-3 rounded-xl border border-conf-med/30 bg-conf-med-soft/40 p-4">
        <Info className="mt-0.5 size-4.5 shrink-0 text-conf-med" />
        <p className="text-sm leading-relaxed text-ink">
          <span className="font-semibold">How we count.</span> Clicks from chat are measured
          directly (each surfaced link carries a <code className="rounded bg-surface px-1 py-0.5 font-mono text-[12px]">vi_chat</code> tag).
          Revenue is <em>modeled</em> — clicks × your category&apos;s average earnings-per-click —
          because affiliate networks confirm sales days later with shrinking cookie windows.
          Treat dollar figures as directional.
        </p>
      </div>

      {/* cluster revenue + product mix */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Panel title="Revenue by question-cluster" description="The CFO answer: which kinds of questions earn">
          <div className="space-y-4">
            {revenueByCluster.map((r) => (
              <div key={r.clusterId}>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm font-medium text-ink">
                    <Sparkles className="size-3.5 text-accent" /> {r.label}
                  </span>
                  <span className="flex items-center gap-3 text-sm">
                    <span className="inline-flex items-center gap-1 text-ink-muted">
                      <MousePointerClick className="size-3.5" /> {r.clicks}
                    </span>
                    <span className="tnum font-semibold text-ink">{money(r.modeledRevenue)}</span>
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-paper-2">
                  <div className="h-full rounded-full bg-accent/80" style={{ width: `${(r.clicks / maxClicks) * 100}%` }} />
                </div>
                <p className="mt-1 text-xs text-ink-subtle">Top pick: {r.topProduct}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Revenue by product" description="Modeled, last 30 days">
          <RevenuePie data={revenueByProduct} valueFormat="currency" />
          <div className="mt-4 space-y-2">
            {revenueByProduct.slice(0, 4).map((p) => (
              <div key={p.name} className="flex items-center gap-2 text-sm">
                <span className="size-2.5 rounded-full" style={{ background: p.color }} />
                <span className="flex-1 truncate text-ink-muted">{p.name}</span>
                <span className="tnum font-medium text-ink">{money(p.value)}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* clicks trend */}
      <div className="mt-4">
        <Panel title="Chat-attributed clicks over time" description="Measured — last 30 days">
          <AreaTrend data={db.dailySeries} dataKey="clicks" height={200} />
        </Panel>
      </div>

      {/* product table */}
      <div className="mt-4">
        <Panel title="Author's-pick performance" description="Your own recommended products, surfaced in your voice" bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-subtle">
                  <th className="px-5 py-3 font-semibold">Product</th>
                  <th className="px-5 py-3 font-semibold">In your posts</th>
                  <th className="px-5 py-3 text-right font-semibold">Clicks</th>
                  <th className="px-5 py-3 text-right font-semibold">Modeled rev.</th>
                  <th className="px-5 py-3 text-center font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {affiliateInventory.filter((a) => a.eligible).map((a) => (
                  <tr key={a.id} className="hover:bg-surface-2/50">
                    <td className="px-5 py-3">
                      <div className="font-medium text-ink">{a.product}</div>
                      <div className="text-xs text-ink-subtle">{money(a.price)} · {a.retailer}</div>
                    </td>
                    <td className="px-5 py-3 text-ink-muted">{a.mentions} posts</td>
                    <td className="px-5 py-3 text-right tnum text-ink">{a.clicksFromChat || "—"}</td>
                    <td className="px-5 py-3 text-right tnum text-ink">{a.modeledRevenue ? money(a.modeledRevenue) : "—"}</td>
                    <td className="px-5 py-3 text-center">
                      {a.included
                        ? <Badge variant="sage">Surfacing</Badge>
                        : <Badge variant="outline">Paused</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      {/* could have linked */}
      <div className="mt-4">
        <Panel
          title="Could have linked — but didn't"
          description="High-intent moments we held back from, by your anti-spam rules. Approve to start surfacing."
        >
          <div className="space-y-3">
            {couldHaveLinked.map((m) => (
              <div key={m.id} className="flex flex-col gap-3 rounded-xl border border-line bg-paper/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm text-ink">&ldquo;{m.question}&rdquo;</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-subtle">
                    <span className="inline-flex items-center gap-1 text-accent">
                      <Sparkles className="size-3" /> {m.suggestedProduct}
                    </span>
                    <span>·</span>
                    <span>{postById(m.postId)?.title}</span>
                    <span>·</span>
                    <span>{m.reason}</span>
                  </div>
                </div>
                <Button size="sm" variant="secondary" className="shrink-0">
                  <Plus /> Approve
                </Button>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </PageBody>
  );
}
