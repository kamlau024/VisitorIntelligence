import { Check, CreditCard, Users, KeyRound, Globe, Trash2, WandSparkles, Crown } from "lucide-react";
import { PageHeader, PageBody, Panel } from "@/components/dashboard/primitives";
import { SettingsSources } from "@/components/dashboard/settings-sources";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyButton } from "@/components/copy-button";
import { PRICING } from "@/lib/mock-data";
import { db } from "@/lib/mock-data";
import { SITE_ID } from "@/lib/embed";

export const metadata = { title: "Settings — Visitor Intelligence" };

const TAB_VALUES = ["sources", "plan", "site", "team"];

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const active = tab && TAB_VALUES.includes(tab) ? tab : "sources";
  return (
    <PageBody>
      <PageHeader kicker="Settings" title="Settings" description="Manage your sources, plan, site profile, and team." />
      <div className="mt-6">
        <Tabs key={active} defaultValue={active}>
          <TabsList>
            <TabsTrigger value="sources">Sources</TabsTrigger>
            <TabsTrigger value="plan">Plan & billing</TabsTrigger>
            <TabsTrigger value="site">Site</TabsTrigger>
            <TabsTrigger value="team">Team & API</TabsTrigger>
          </TabsList>

          <TabsContent value="sources">
            <SettingsSources />
          </TabsContent>

          <TabsContent value="plan">
            <PlanSettings />
          </TabsContent>

          <TabsContent value="site">
            <SiteSettings />
          </TabsContent>

          <TabsContent value="team">
            <TeamSettings />
          </TabsContent>
        </Tabs>
      </div>
    </PageBody>
  );
}

function PlanSettings() {
  return (
    <div className="space-y-4">
      <Panel title="Current plan">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Badge>Pro</Badge>
            <div>
              <div className="font-display text-2xl font-medium text-ink">$29<span className="text-base text-ink-muted">/mo</span></div>
              <div className="text-sm text-ink-muted">Renews Jul 1, 2026</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary">Manage billing</Button>
            <Button>Upgrade to Studio</Button>
          </div>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {/* questions usage */}
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-ink">Questions</span>
              <span className="tnum text-ink-muted">3,380 / 5,000</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-paper-2">
              <div className="h-full rounded-full bg-accent" style={{ width: "67.6%" }} />
            </div>
            <p className="mt-1 text-xs text-ink-subtle">Resets monthly</p>
          </div>

          {/* full draft credits */}
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 font-medium text-ink">
                <WandSparkles className="size-3.5 text-ochre" /> Full Drafts
                <span className="inline-flex items-center gap-0.5 rounded-full bg-conf-med-soft px-1.5 py-0.5 text-[10px] font-semibold text-ochre">
                  <Crown className="size-2.5" /> Premium
                </span>
              </span>
              <span className="tnum text-ink-muted">
                <span className="font-semibold text-ochre">2</span> of 3 left
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-paper-2">
              <div className="h-full rounded-full bg-ochre" style={{ width: "33.3%" }} />
            </div>
            <p className="mt-1 text-xs text-ink-subtle">1 used this month · extra drafts $5 each</p>
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-3">
        {PRICING.map((p) => (
          <div key={p.tier} className={`rounded-xl border bg-surface p-5 edge ${p.tier === "Pro" ? "border-accent/40 ring-1 ring-accent/20" : "border-line"}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-medium text-ink">{p.tier}</h3>
              {p.tier === "Pro" && <Badge variant="sage">Current</Badge>}
            </div>
            <div className="mt-1 font-display text-2xl font-medium text-ink">${p.price}<span className="text-sm text-ink-muted">{p.cadence}</span></div>
            <ul className="mt-4 space-y-2">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-ink-muted">
                  <Check className="mt-0.5 size-4 shrink-0 text-accent" /> {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <Panel title="Payment method">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-paper-2 text-ink-muted"><CreditCard className="size-5" /></span>
          <div className="flex-1">
            <div className="text-sm font-medium text-ink">Visa ending 4242</div>
            <div className="text-xs text-ink-muted">Expires 09/2028</div>
          </div>
          <Button variant="ghost" size="sm">Update</Button>
        </div>
      </Panel>
    </div>
  );
}

function SiteSettings() {
  return (
    <div className="space-y-4">
      <Panel title="Site profile">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="mb-2 block">Site name</Label>
            <Input defaultValue={db.site.name} />
          </div>
          <div>
            <Label className="mb-2 block">Domain</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" />
              <Input defaultValue={db.site.domain} className="pl-9" />
            </div>
          </div>
          <div className="sm:col-span-2">
            <Label className="mb-2 block">Tagline</Label>
            <Input defaultValue={db.site.tagline} />
          </div>
          <div>
            <Label className="mb-2 block">Author name</Label>
            <Input defaultValue={db.site.author.name} />
          </div>
          <div>
            <Label className="mb-2 block">Site ID</Label>
            <div className="flex items-center gap-2">
              <Input readOnly value={SITE_ID} className="font-mono text-[13px]" />
              <CopyButton value={SITE_ID} />
            </div>
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <Button>Save changes</Button>
        </div>
      </Panel>

      <Panel title="Danger zone" className="border-negative/30">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-ink">Disconnect this site</div>
            <div className="text-sm text-ink-muted">Stops capturing intent and removes the widget data. This can&apos;t be undone.</div>
          </div>
          <Button variant="danger"><Trash2 /> Disconnect</Button>
        </div>
      </Panel>
    </div>
  );
}

function TeamSettings() {
  return (
    <div className="space-y-4">
      <Panel title="Team" description="Invite teammates to your workspace"
        action={<Badge variant="outline">Studio</Badge>}>
        <div className="flex items-center gap-3 rounded-lg border border-line bg-paper/40 p-4">
          <Users className="size-5 text-ink-subtle" />
          <div className="flex-1 text-sm text-ink-muted">
            Team seats are available on the Studio plan.
          </div>
          <Button size="sm">Upgrade</Button>
        </div>
      </Panel>

      <Panel title="API access" description="Programmatic access to your visitor-intent data"
        action={<Badge variant="outline">Studio</Badge>}>
        <div className="flex items-center gap-3 rounded-lg border border-line bg-paper/40 p-4">
          <KeyRound className="size-5 text-ink-subtle" />
          <div className="flex-1 text-sm text-ink-muted">
            API access is available on the Studio plan.
          </div>
          <Button size="sm">Upgrade</Button>
        </div>
      </Panel>
    </div>
  );
}
