"use client";

import * as React from "react";
import { Check, Code2, Palette, Mic, MessageSquarePlus, Sparkles, X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CopyButton } from "@/components/copy-button";
import { VisitorWidget } from "@/components/widget/visitor-widget";
import { snippet, CMS_GUIDES } from "@/lib/embed";
import { cn } from "@/lib/utils";

const ACCENTS = [
  { name: "Terracotta", value: "#c2552f" },
  { name: "Berry", value: "#9d3b54" },
  { name: "Teal", value: "#3f6b6e" },
  { name: "Forest", value: "#4a6b3f" },
  { name: "Plum", value: "#6e4a6b" },
  { name: "Ink", value: "#2f2a26" },
];

const VOICES = ["Warm & encouraging", "Concise & practical", "Playful & punchy"];

function Section({ icon: Icon, title, desc, children }: { icon: React.ElementType; title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-surface p-5 edge">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex size-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
          <Icon className="size-4" />
        </span>
        <div>
          <h2 className="font-display text-base font-medium text-ink">{title}</h2>
          {desc && <p className="text-xs text-ink-muted">{desc}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function Seg<T extends string | number>({ options, value, onChange }: { options: T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-line-strong bg-paper-2 p-0.5">
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)}
          className={cn("rounded-md px-3 py-1 text-sm font-medium transition-colors",
            value === o ? "bg-surface text-ink shadow-sm" : "text-ink-muted hover:text-ink")}>
          {o}
        </button>
      ))}
    </div>
  );
}

export function WidgetStudio() {
  const [accent, setAccent] = React.useState(ACCENTS[0].value);
  const [label, setLabel] = React.useState("Maya");
  const [voice, setVoice] = React.useState(VOICES[0]);
  const [position, setPosition] = React.useState("Bottom-right");
  const [suggestions, setSuggestions] = React.useState([
    "I don't have a Dutch oven — what can I use?",
    "No buttermilk. What's the best swap?",
    "Can I make this dairy-free?",
    "How do I adjust the bread for high altitude?",
  ]);
  const [surface, setSurface] = React.useState(true);
  const [maxChips, setMaxChips] = React.useState(1);
  const [minMentions, setMinMentions] = React.useState(2);
  const [showConfidence, setShowConfidence] = React.useState(true);
  const [allowBounty, setAllowBounty] = React.useState(true);

  function updateSuggestion(i: number, v: string) {
    setSuggestions((s) => s.map((x, j) => (j === i ? v : x)));
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_400px]">
      {/* controls */}
      <div className="space-y-4">
        <Section icon={Palette} title="Appearance" desc="How the launcher and panel look on your site">
          <div className="space-y-5">
            <div>
              <Label className="mb-2 block">Accent color</Label>
              <div className="flex flex-wrap gap-2">
                {ACCENTS.map((a) => (
                  <button key={a.value} onClick={() => setAccent(a.value)} title={a.name}
                    className={cn("flex size-9 items-center justify-center rounded-full ring-offset-2 ring-offset-surface transition-all",
                      accent === a.value ? "ring-2 ring-ink" : "hover:scale-110")}
                    style={{ background: a.value }}>
                    {accent === a.value && <Check className="size-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="label" className="mb-2 block">Launcher label</Label>
                <Input id="label" value={label} onChange={(e) => setLabel(e.target.value)} />
              </div>
              <div>
                <Label className="mb-2 block">Position</Label>
                <Seg options={["Bottom-right", "Bottom-left"]} value={position} onChange={setPosition} />
              </div>
            </div>
          </div>
        </Section>

        <Section icon={Mic} title="Voice" desc="How answers sound — already trained on your posts">
          <div className="flex flex-wrap gap-2">
            {VOICES.map((v) => (
              <button key={v} onClick={() => setVoice(v)}
                className={cn("rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                  voice === v ? "border-accent/50 bg-accent-soft/40 text-accent-press" : "border-line text-ink-muted hover:bg-surface-2")}>
                {v}
              </button>
            ))}
          </div>
        </Section>

        <Section icon={MessageSquarePlus} title="Suggested questions" desc="Shown as starter chips when the widget opens">
          <div className="space-y-2">
            {suggestions.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input value={s} onChange={(e) => updateSuggestion(i, e.target.value)} />
                <button onClick={() => setSuggestions((arr) => arr.filter((_, j) => j !== i))}
                  className="rounded-md p-2 text-ink-subtle hover:bg-surface-2 hover:text-conf-low">
                  <X className="size-4" />
                </button>
              </div>
            ))}
            {suggestions.length < 6 && (
              <button onClick={() => setSuggestions((s) => [...s, "New suggested question"])}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline">
                <Plus className="size-4" /> Add question
              </button>
            )}
          </div>
        </Section>

        <Section icon={Sparkles} title="Affiliate surfacing" desc="The author's-pick chip rules (anti-spam)">
          <div className="divide-y divide-line">
            <Row label="Surface author's-pick links" hint="Show your own affiliate picks inside answers">
              <Switch checked={surface} onCheckedChange={setSurface} />
            </Row>
            <Row label="Max chips per answer" hint="Hard cap to keep answers clean">
              <Seg options={[1, 2, 3]} value={maxChips} onChange={setMaxChips} />
            </Row>
            <Row label="Min mentions to qualify" hint="A product must appear in this many of your posts">
              <Seg options={[1, 2, 3]} value={minMentions} onChange={setMinMentions} />
            </Row>
            <Row label="Show confidence bar" hint="Display Low / Medium / High on each answer">
              <Switch checked={showConfidence} onCheckedChange={setShowConfidence} />
            </Row>
            <Row label="Allow $3 reader bounties" hint="Let readers pay to ask you directly on low-confidence answers">
              <Switch checked={allowBounty} onCheckedChange={setAllowBounty} />
            </Row>
          </div>
        </Section>

        <Section icon={Code2} title="Install snippet" desc="Same one-line embed, on any CMS">
          <div className="rounded-lg border border-line bg-[#171310] p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs text-paper/40">Add before &lt;/body&gt;</span>
              <CopyButton value={snippet()} className="border-paper/20 bg-paper/10 text-paper hover:bg-paper/20" />
            </div>
            <pre className="overflow-x-auto whitespace-pre font-mono text-[13px] leading-relaxed text-paper/90"><code>{snippet()}</code></pre>
          </div>
          <div className="mt-4">
            <Tabs defaultValue="wordpress">
              <TabsList className="flex w-full flex-wrap h-auto">
                {CMS_GUIDES.map((g) => <TabsTrigger key={g.key} value={g.key}>{g.label}</TabsTrigger>)}
              </TabsList>
              {CMS_GUIDES.map((g) => (
                <TabsContent key={g.key} value={g.key}>
                  <ol className="space-y-2.5 rounded-lg border border-line bg-paper/40 p-4">
                    {g.steps.map((s, i) => (
                      <li key={i} className="flex gap-3 text-sm text-ink">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent-press">{i + 1}</span>
                        {s}
                      </li>
                    ))}
                  </ol>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </Section>
      </div>

      {/* live preview */}
      <div className="lg:sticky lg:top-20 lg:self-start">
        <div className="mb-2 flex items-center justify-between">
          <span className="kicker">Live preview</span>
          <span className="text-xs text-ink-subtle">{position} · {voice.split(" ")[0]}</span>
        </div>
        <VisitorWidget mode="inline" brandName={label} accent={accent} suggestions={suggestions.filter(Boolean)} />
        <p className="mt-3 text-center text-xs text-ink-subtle">
          Changes here apply to your live widget instantly.
        </p>
      </div>
    </div>
  );
}

function Row({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div>
        <div className="text-sm font-medium text-ink">{label}</div>
        <div className="text-xs text-ink-muted">{hint}</div>
      </div>
      {children}
    </div>
  );
}
