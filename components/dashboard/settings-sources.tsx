"use client";

import * as React from "react";
import { RefreshCw, FileText, BookOpen, Link2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { affiliateInventory, site } from "@/lib/mock-data/site";
import { money, timeAgo, cn } from "@/lib/utils";

export function SettingsSources() {
  const [included, setIncluded] = React.useState<Record<string, boolean>>(
    Object.fromEntries(affiliateInventory.map((a) => [a.id, a.included]))
  );
  const [crawling, setCrawling] = React.useState(false);
  const [lastCrawl, setLastCrawl] = React.useState(site.lastCrawl);

  function recrawl() {
    setCrawling(true);
    setTimeout(() => {
      setCrawling(false);
      setLastCrawl(new Date().toISOString());
    }, 2000);
  }

  const stats = [
    { icon: FileText, label: "Pages indexed", value: site.pagesIndexed },
    { icon: BookOpen, label: "Recipes detected", value: site.recipesDetected },
    { icon: Link2, label: "Affiliate links", value: site.affiliateLinksDetected },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-line bg-surface p-5 edge">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display text-lg font-medium text-ink">Content sources</h3>
            <p className="text-sm text-ink-muted">
              We learn your site by reading its published pages — no plugin or database access.
              Last crawled {crawling ? "just now" : timeAgo(lastCrawl)}.
            </p>
          </div>
          <Button variant="secondary" onClick={recrawl} disabled={crawling}>
            {crawling ? <Loader2 className="animate-spin" /> : <RefreshCw />}
            {crawling ? "Re-crawling…" : "Re-crawl site"}
          </Button>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-lg border border-line bg-paper/50 p-3 text-center">
              <s.icon className="mx-auto size-4 text-ink-subtle" />
              <div className="mt-1.5 font-display text-xl font-medium text-ink tnum">{s.value}</div>
              <div className="text-xs text-ink-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface edge">
        <div className="border-b border-line px-5 py-4">
          <h3 className="font-display text-lg font-medium text-ink">Affiliate inventory</h3>
          <p className="text-sm text-ink-muted">
            Detected from your own links. Toggle which products the widget may surface.
          </p>
        </div>
        <div className="divide-y divide-line">
          {affiliateInventory.map((a) => (
            <div key={a.id} className="flex items-center gap-4 px-5 py-3.5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={cn("truncate font-medium", a.eligible ? "text-ink" : "text-ink-muted")}>{a.product}</span>
                  {a.authorPickSince && <Badge variant="outline">since {a.authorPickSince}</Badge>}
                </div>
                <div className="mt-0.5 text-xs text-ink-subtle">
                  {money(a.price)} · {a.retailer} · mentioned in {a.mentions} post{a.mentions === 1 ? "" : "s"}
                  {!a.eligible && " · not yet eligible (needs 2+ mentions)"}
                </div>
              </div>
              {a.eligible ? (
                <Switch checked={included[a.id]} onCheckedChange={(v) => setIncluded((s) => ({ ...s, [a.id]: v }))} />
              ) : (
                <Badge variant="outline">Ineligible</Badge>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
