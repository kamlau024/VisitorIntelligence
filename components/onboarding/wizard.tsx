"use client";

import * as React from "react";
import Link from "next/link";
import {
  Globe, Search, Sparkles, Mic, Code2, PartyPopper, Loader2,
  ArrowRight, ArrowLeft, Check, ShieldCheck, FileText, Link2, X,
} from "lucide-react";
import { Wordmark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CopyButton } from "@/components/copy-button";
import { AnswerPreview } from "@/components/marketing/answer-preview";
import { affiliateInventory } from "@/lib/mock-data/site";
import { snippet, CMS_GUIDES } from "@/lib/embed";
import { cn, money } from "@/lib/utils";

const STEPS = [
  { icon: Globe, title: "Connect your site", sub: "Point us at your domain" },
  { icon: Link2, title: "Affiliate inventory", sub: "Approve what can be surfaced" },
  { icon: Mic, title: "Tune the voice", sub: "Make it sound like you" },
  { icon: Code2, title: "Place the widget", sub: "One script tag, any CMS" },
  { icon: PartyPopper, title: "Go live", sub: "Verify and launch" },
];

const CRAWL_LOG = [
  "Reading sitemap.xml…",
  "Indexed 142 pages",
  "Detected 38 recipes (JSON-LD schema)",
  "Found 96 affiliate links — Amazon, Lasso",
  "Building the answer model in your voice…",
];

const VOICES = {
  warm: {
    label: "Warm & encouraging",
    desc: "Friendly, reassuring, lots of 'you've got this.'",
    paragraphs: [
      "Oh, you've totally got options here! You don't strictly need a Dutch oven — it just traps steam so the crust sets slowly. Any heavy oven-safe pot with a snug lid will get you there beautifully.",
      "If you bake even a few times a year though, an enameled one is the little luxury I'd splurge on — it's what I've used for every single loaf here.",
    ],
  },
  concise: {
    label: "Concise & practical",
    desc: "Straight to the answer, minimal fluff.",
    paragraphs: [
      "No Dutch oven needed. It just traps steam. Use any heavy oven-safe pot with a tight lid, or cover a cast-iron pan with a metal bowl for the first 20 minutes.",
      "If you bake regularly, an enameled Dutch oven is worth it — it's what I use for every loaf.",
    ],
  },
  playful: {
    label: "Playful & punchy",
    desc: "A little personality and humor.",
    paragraphs: [
      "Dutch oven schmutch oven — you can absolutely wing it. The thing's just a steam trap. Any heavy pot with a lid (or a cast-iron pan wearing a metal-bowl hat) does the job.",
      "That said, if bread's becoming your thing, the enameled Dutch oven is the one splurge I'd actually high-five you for. It's my ride-or-die.",
    ],
  },
} as const;
type VoiceKey = keyof typeof VOICES;

export function OnboardingWizard() {
  const [step, setStep] = React.useState(0);
  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* rail */}
      <aside className="shrink-0 border-b border-line bg-surface-2 lg:w-[340px] lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col p-7 lg:p-9">
          <div className="flex items-center justify-between">
            <Link href="/"><Wordmark /></Link>
            <Link href="/dashboard" className="text-sm text-ink-subtle hover:text-ink lg:hidden">
              Skip
            </Link>
          </div>

          <ol className="mt-10 hidden flex-1 space-y-1 lg:block">
            {STEPS.map((s, i) => {
              const state = i < step ? "done" : i === step ? "active" : "todo";
              return (
                <li key={s.title}>
                  <button
                    onClick={() => i < step && setStep(i)}
                    disabled={i > step}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                      state === "active" && "bg-surface edge",
                      i < step && "cursor-pointer hover:bg-surface/60",
                      i > step && "cursor-default opacity-55"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                        state === "done" && "bg-accent text-accent-ink",
                        state === "active" && "bg-accent-soft text-accent-press ring-2 ring-accent/30",
                        state === "todo" && "bg-paper-2 text-ink-subtle"
                      )}
                    >
                      {state === "done" ? <Check className="size-4" /> : i + 1}
                    </span>
                    <span className="leading-tight">
                      <span className="block text-sm font-medium text-ink">{s.title}</span>
                      <span className="text-xs text-ink-muted">{s.sub}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="mt-8 hidden items-center gap-2 rounded-lg border border-line bg-surface px-3.5 py-3 text-xs text-ink-muted lg:flex">
            <ShieldCheck className="size-4 shrink-0 text-sage" />
            We only read your published pages. No database or admin access.
          </div>
        </div>
      </aside>

      {/* content */}
      <div className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-2xl flex-1 px-5 py-10 lg:px-10 lg:py-16">
          <div key={step} className="animate-rise">
            {step === 0 && <ConnectStep onDone={next} />}
            {step === 1 && <AffiliateStep />}
            {step === 2 && <VoiceStep />}
            {step === 3 && <PlaceStep />}
            {step === 4 && <GoLiveStep />}
          </div>
        </div>

        {step > 0 && (
          <div className="sticky bottom-0 border-t border-line bg-paper/85 backdrop-blur">
            <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-5 py-4 lg:px-10">
              <Button variant="ghost" onClick={back}>
                <ArrowLeft /> Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={next}>
                  Continue <ArrowRight />
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/dashboard">
                    Open dashboard <ArrowRight />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StepHead({ icon: Icon, kicker, title, desc }: { icon: React.ElementType; kicker: string; title: string; desc: string }) {
  return (
    <div className="mb-7">
      <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
        <Icon className="size-5" />
      </span>
      <p className="kicker">{kicker}</p>
      <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-ink">{title}</h1>
      <p className="mt-2 text-ink-muted">{desc}</p>
    </div>
  );
}

function ConnectStep({ onDone }: { onDone: () => void }) {
  const [url, setUrl] = React.useState("theweeknightkitchen.com");
  const [phase, setPhase] = React.useState<"idle" | "crawling" | "done">("idle");
  const [pct, setPct] = React.useState(0);
  const [logIdx, setLogIdx] = React.useState(0);

  function start() {
    if (!url.trim()) return;
    setPhase("crawling");
    setPct(0);
    setLogIdx(0);
    const startT = Date.now();
    const dur = 2800;
    const id = setInterval(() => {
      const p = Math.min(100, ((Date.now() - startT) / dur) * 100);
      setPct(p);
      setLogIdx(Math.min(CRAWL_LOG.length, Math.floor((p / 100) * CRAWL_LOG.length) + 1));
      if (p >= 100) {
        clearInterval(id);
        setTimeout(() => setPhase("done"), 350);
      }
    }, 90);
  }

  return (
    <>
      <StepHead icon={Globe} kicker="Step 1 of 5" title="Connect your site"
        desc="Enter your domain. We'll read your published pages to learn your content, recipes, and affiliate links — no plugin required." />

      <div className="rounded-xl border border-line bg-surface p-5 edge">
        <label className="text-sm font-medium text-ink">Your site URL</label>
        <div className="mt-2 flex gap-2">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" />
            <Input value={url} onChange={(e) => setUrl(e.target.value)} className="pl-9"
              placeholder="yoursite.com" disabled={phase === "crawling"} />
          </div>
          <Button onClick={start} disabled={phase === "crawling"}>
            {phase === "crawling" ? <Loader2 className="animate-spin" /> : <Search />}
            {phase === "idle" ? "Connect" : phase === "crawling" ? "Reading…" : "Re-scan"}
          </Button>
        </div>

        {phase !== "idle" && (
          <div className="mt-5">
            <Progress value={pct} />
            <ul className="mt-4 space-y-1.5">
              {CRAWL_LOG.slice(0, logIdx).map((l, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-ink-muted animate-rise">
                  <Check className="size-3.5 text-sage" /> {l}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {phase === "done" && (
        <div className="mt-5 animate-rise">
          <div className="grid grid-cols-3 gap-3">
            {[
              { n: "142", l: "pages indexed" },
              { n: "38", l: "recipes detected" },
              { n: "96", l: "affiliate links" },
            ].map((s) => (
              <div key={s.l} className="rounded-xl border border-line bg-surface p-4 text-center edge">
                <div className="font-display text-2xl font-medium text-ink tnum">{s.n}</div>
                <div className="mt-0.5 text-xs text-ink-muted">{s.l}</div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-end">
            <Button onClick={onDone}>
              Looks right — continue <ArrowRight />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

function AffiliateStep() {
  const [included, setIncluded] = React.useState<Record<string, boolean>>(
    Object.fromEntries(affiliateInventory.map((a) => [a.id, a.included]))
  );
  const eligible = affiliateInventory.filter((a) => a.eligible);
  const ineligible = affiliateInventory.filter((a) => !a.eligible);

  return (
    <>
      <StepHead icon={Link2} kicker="Step 2 of 5" title="Approve your affiliate inventory"
        desc="These are products you already recommend in your own posts. The widget can surface them as quiet 'author's pick' chips — only the ones you switch on, and only one per answer." />

      <div className="space-y-2.5">
        {eligible.map((a) => (
          <label key={a.id}
            className="flex cursor-pointer items-center gap-4 rounded-xl border border-line bg-surface p-4 edge transition-colors hover:border-line-strong">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium text-ink">{a.product}</span>
                {a.authorPickSince && (
                  <Badge variant="outline" className="shrink-0">since {a.authorPickSince}</Badge>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
                <span>{money(a.price)} · {a.retailer}</span>
                <span className="inline-flex items-center gap-1">
                  <FileText className="size-3" /> mentioned in {a.mentions} of your posts
                </span>
              </div>
            </div>
            <Switch checked={included[a.id]} onCheckedChange={(v) => setIncluded((s) => ({ ...s, [a.id]: v }))} />
          </label>
        ))}
      </div>

      {ineligible.length > 0 && (
        <div className="mt-6">
          <p className="kicker mb-3">Not yet eligible</p>
          <div className="space-y-2.5">
            {ineligible.map((a) => (
              <div key={a.id} className="flex items-center gap-4 rounded-xl border border-dashed border-line bg-surface-2/50 p-4 opacity-80">
                <div className="min-w-0 flex-1">
                  <span className="truncate font-medium text-ink-muted">{a.product}</span>
                  <div className="mt-1 text-xs text-ink-subtle">
                    Only mentioned in {a.mentions} post{a.mentions === 1 ? "" : "s"} — needs 2+ to surface (anti-spam rule).
                  </div>
                </div>
                <X className="size-4 text-ink-subtle" />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function VoiceStep() {
  const [voice, setVoice] = React.useState<VoiceKey>("warm");
  return (
    <>
      <StepHead icon={Mic} kicker="Step 3 of 5" title="Tune the voice"
        desc="Pick how answers should sound. We've already learned your phrasing from your posts — this just sets the dial." />

      <div className="grid gap-2.5 sm:grid-cols-3">
        {(Object.keys(VOICES) as VoiceKey[]).map((k) => (
          <button key={k} onClick={() => setVoice(k)}
            className={cn(
              "rounded-xl border p-4 text-left transition-all",
              voice === k ? "border-accent/50 bg-accent-soft/40 ring-1 ring-accent/25" : "border-line bg-surface hover:border-line-strong"
            )}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-ink">{VOICES[k].label}</span>
              {voice === k && <Check className="size-4 text-accent" />}
            </div>
            <p className="mt-1 text-xs leading-snug text-ink-muted">{VOICES[k].desc}</p>
          </button>
        ))}
      </div>

      <div className="mt-6">
        <p className="kicker mb-3">Live preview</p>
        <div className="rounded-xl border border-line bg-paper/60 p-4 edge">
          <AnswerPreview
            key={voice}
            question="I don't have a Dutch oven — what can I use?"
            paragraphs={[...VOICES[voice].paragraphs]}
            confidence="high"
            citations={["No-Knead Dutch Oven Bread", "Weeknight Sourdough Focaccia"]}
            affiliate={{ product: "Lodge 6qt Enameled Dutch Oven", retailer: "Amazon", price: 79.9, authorPickSince: 2019 }}
          />
        </div>
      </div>
    </>
  );
}

function PlaceStep() {
  return (
    <>
      <StepHead icon={Code2} kicker="Step 4 of 5" title="Place the widget"
        desc="Add one script tag before your closing </body>. It self-mounts in an isolated shadow DOM, so it can't clash with your theme's styles." />

      <div className="rounded-xl border border-line bg-[#171310] p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="flex items-center gap-2 text-xs text-paper/40">
            <Code2 className="size-4" /> Your install snippet
          </span>
          <CopyButton value={snippet()} className="border-paper/20 bg-paper/10 text-paper hover:bg-paper/20" />
        </div>
        <pre className="overflow-x-auto whitespace-pre font-mono text-[13px] leading-relaxed text-paper/90">
          <code>{snippet()}</code>
        </pre>
      </div>

      <div className="mt-6">
        <p className="kicker mb-3">Where do you publish?</p>
        <Tabs defaultValue="wordpress">
          <TabsList className="flex w-full flex-wrap h-auto">
            {CMS_GUIDES.map((g) => (
              <TabsTrigger key={g.key} value={g.key}>{g.label}</TabsTrigger>
            ))}
          </TabsList>
          {CMS_GUIDES.map((g) => (
            <TabsContent key={g.key} value={g.key}>
              <ol className="space-y-3 rounded-xl border border-line bg-surface p-5 edge">
                {g.steps.map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm text-ink">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent-press">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{s}</span>
                  </li>
                ))}
              </ol>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </>
  );
}

function GoLiveStep() {
  const [phase, setPhase] = React.useState<"idle" | "checking" | "verified">("idle");
  function check() {
    setPhase("checking");
    setTimeout(() => setPhase("verified"), 1900);
  }
  return (
    <>
      <StepHead icon={PartyPopper} kicker="Step 5 of 5" title="Go live"
        desc="We'll ping your site to confirm the widget is mounted and capturing visitor intent." />

      {phase !== "verified" ? (
        <div className="rounded-xl border border-line bg-surface p-8 text-center edge">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-accent-soft text-accent">
            {phase === "checking" ? <Loader2 className="size-6 animate-spin" /> : <Globe className="size-6" />}
          </div>
          <h3 className="mt-4 font-display text-xl font-medium text-ink">
            {phase === "checking" ? "Checking theweeknightkitchen.com…" : "Ready when you are"}
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">
            {phase === "checking"
              ? "Looking for the widget on your homepage and a recent recipe."
              : "Once you've pasted the snippet, run the check to confirm you're live."}
          </p>
          <Button className="mt-5" onClick={check} disabled={phase === "checking"}>
            {phase === "checking" ? "Verifying…" : "Check installation"}
          </Button>
          {phase === "idle" && (
            <p className="mt-3 text-xs text-ink-subtle">Not detected yet? Give your CDN cache a minute, then retry.</p>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-sage/40 bg-positive-soft/60 p-8 text-center animate-rise">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-positive text-white">
            <Check className="size-7" />
          </div>
          <h3 className="mt-4 font-display text-2xl font-medium text-ink">You&apos;re live 🎉</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">
            Widget detected on <span className="font-medium text-ink">theweeknightkitchen.com</span>.
            It&apos;s answering readers and capturing first-party visitor intent right now.
          </p>
        </div>
      )}
    </>
  );
}
