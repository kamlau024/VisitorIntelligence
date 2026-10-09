"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  ChevronDown, FileText, MessageSquareQuote, Send, Quote,
  NotebookPen, FileCode, Check, WandSparkles, Crown, Loader2, Sparkles, BookOpenText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendPill } from "@/components/dashboard/primitives";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { contentGaps, fullArticleFor, type GapArticle } from "@/lib/mock-data/gaps";
import { postById } from "@/lib/mock-data/site";
import { cn } from "@/lib/utils";
import type { ContentGap } from "@/lib/mock-data/types";

const STATUS: Record<ContentGap["status"], { label: string; variant: React.ComponentProps<typeof Badge>["variant"] }> = {
  new: { label: "New", variant: "clay" },
  queued: { label: "Queued", variant: "ochre" },
  drafted: { label: "Drafted", variant: "sage" },
};

function toMarkdown(g: ContentGap) {
  const lines = [`# ${g.label}`, ""];
  g.outline.forEach((o) => {
    lines.push(`## ${o.heading}`);
    if (o.note) lines.push(`<!-- ${o.note} -->`);
    lines.push("");
  });
  lines.push("## Reader questions to answer", "");
  g.verbatim.forEach((q) => lines.push(`> ${q}`, ""));
  return lines.join("\n");
}

function toFullMarkdown(g: ContentGap, a: GapArticle) {
  const lines = [`# ${g.label}`, "", "*By Maya Brennan · The Weeknight Kitchen*", ""];
  a.intro.forEach((p) => lines.push(p, ""));
  a.sections.forEach((s) => lines.push(`## ${s.heading}`, "", s.body, ""));
  lines.push("## Reader questions, answered", "");
  g.verbatim.forEach((q) => lines.push(`- ${q}`));
  return lines.join("\n");
}

export function ContentGapsList() {
  const [open, setOpen] = React.useState<string | null>(contentGaps[0].id);
  const [statuses, setStatuses] = React.useState<Record<string, ContentGap["status"]>>(
    Object.fromEntries(contentGaps.map((g) => [g.id, g.status]))
  );
  const [fullDraftGap, setFullDraftGap] = React.useState<ContentGap | null>(null);
  const [credits, setCredits] = React.useState(3);

  function send(g: ContentGap, dest: string) {
    setStatuses((s) => ({ ...s, [g.id]: "drafted" }));
    if (dest === "Markdown") {
      navigator.clipboard?.writeText(toMarkdown(g));
      toast.success("Outline copied as markdown", { description: g.label });
    } else {
      toast.success(`Draft created in ${dest}`, {
        description: `"${g.label}" — with ${g.verbatim.length} reader questions embedded.`,
      });
    }
  }

  return (
    <div className="space-y-3">
      {contentGaps.map((g) => {
        const expanded = open === g.id;
        const st = STATUS[statuses[g.id]];
        return (
          <div key={g.id} className="overflow-hidden rounded-xl border border-line bg-surface edge">
            {/* header */}
            <button onClick={() => setOpen(expanded ? null : g.id)}
              className="flex w-full items-center gap-4 p-5 text-left transition-colors hover:bg-surface-2/50">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft font-display text-lg font-medium text-accent">
                {g.priority}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg font-medium text-ink">{g.label}</h3>
                  <Badge variant={st.variant}>{st.label}</Badge>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
                  <span className="tnum font-medium text-ink">{g.volume} readers asked</span>
                  <TrendPill value={g.trendWoW} />
                  <span>·</span>
                  <span>touched in {g.nearMissPosts.length} of your posts</span>
                </div>
              </div>
              <ChevronDown className={cn("size-5 shrink-0 text-ink-subtle transition-transform", expanded && "rotate-180")} />
            </button>

            {/* body */}
            {expanded && (
              <div className="border-t border-line bg-paper/40 p-5">
                <div className="grid gap-5 lg:grid-cols-2">
                  {/* verbatim + near-miss */}
                  <div className="space-y-5">
                    <div>
                      <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
                        <MessageSquareQuote className="size-4 text-ink-subtle" /> What readers asked
                      </h4>
                      <ul className="space-y-1.5">
                        {g.verbatim.map((q, i) => (
                          <li key={i} className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink">
                            &ldquo;{q}&rdquo;
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
                        <FileText className="size-4 text-ink-subtle" /> Posts that almost answer it
                      </h4>
                      <div className="space-y-2">
                        {g.nearMissPosts.map((nm) => (
                          <div key={nm.postId} className="flex items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2">
                            <span className="flex-1 truncate text-sm text-ink">{postById(nm.postId)?.title}</span>
                            <span className="text-xs text-ink-subtle">{Math.round(nm.coverage * 100)}% covered</span>
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-paper-2">
                              <div className="h-full rounded-full bg-ochre" style={{ width: `${nm.coverage * 100}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* draft scaffold */}
                  <div>
                    <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
                      <NotebookPen className="size-4 text-ink-subtle" /> Draft scaffold
                    </h4>
                    <div className="rounded-xl border border-line bg-surface p-4">
                      <div className="font-display text-lg font-medium text-ink">{g.label}</div>
                      <div className="mt-3 space-y-3">
                        {g.outline.map((o, i) => (
                          <div key={i} className="border-l-2 border-accent/30 pl-3">
                            <div className="text-sm font-semibold text-ink">{o.heading}</div>
                            {o.note && <div className="text-xs italic text-ink-subtle">{o.note}</div>}
                          </div>
                        ))}
                        <div className="border-l-2 border-line pl-3">
                          <div className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                            <Quote className="size-3.5 text-ink-subtle" /> Reader Q&A block
                          </div>
                          <div className="text-xs text-ink-subtle">{g.verbatim.length} verbatim questions, pre-embedded</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* actions: choose your output — scaffold (included) or full article (premium) */}
                <div className="mt-5 border-t border-line pt-5">
                  <p className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-subtle">
                    Choose your output
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* scaffold — included */}
                    <div className="flex flex-col rounded-xl border border-line bg-surface p-4">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                          <NotebookPen className="size-4 text-ink-subtle" /> Scaffold
                        </span>
                        <Badge variant="outline">Included</Badge>
                      </div>
                      <p className="mt-1.5 flex-1 text-xs leading-relaxed text-ink-muted">
                        The outline above, sent to your editor with the reader questions embedded.
                        You finish it in your voice in ~90 minutes.
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="secondary">
                              <Send /> Send to draft <ChevronDown className="size-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuLabel>Create draft in</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => send(g, "WordPress")}><FileText /> WordPress</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => send(g, "Notion")}><NotebookPen /> Notion</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => send(g, "Markdown")}><FileCode /> Copy as markdown</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        {statuses[g.id] === "drafted" && (
                          <span className="inline-flex items-center gap-1 text-xs text-positive">
                            <Check className="size-3.5" /> Sent
                          </span>
                        )}
                      </div>
                    </div>

                    {/* full article — premium */}
                    <div className="relative flex flex-col overflow-hidden rounded-xl border border-ochre/45 bg-linear-to-br from-conf-med-soft/45 to-surface p-4">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                          <WandSparkles className="size-4 text-ochre" /> Full article
                        </span>
                        <Badge variant="ochre"><Crown className="size-3" /> Premium</Badge>
                      </div>
                      <p className="mt-1.5 flex-1 text-xs leading-relaxed text-ink-muted">
                        Let AI write the complete post in your voice — every section filled in,
                        ~{fullArticleFor(g.id)?.wordCount.toLocaleString()} words, ready to publish.
                      </p>
                      <div className="mt-3 flex items-center gap-2.5">
                        <Button
                          size="sm"
                          onClick={() => setFullDraftGap(g)}
                          className="bg-ochre text-ink hover:bg-ochre/90"
                        >
                          <WandSparkles /> Write it for me
                        </Button>
                        <span className="text-[11px] text-ink-subtle">1 credit · {credits} left</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <FullDraftDialog
        gap={fullDraftGap}
        credits={credits}
        onClose={() => setFullDraftGap(null)}
        onGenerate={() => setCredits((c) => Math.max(0, c - 1))}
        onSent={(g) => setStatuses((s) => ({ ...s, [g.id]: "drafted" }))}
      />
    </div>
  );
}

function FullDraftDialog({
  gap, credits, onClose, onGenerate, onSent,
}: {
  gap: ContentGap | null;
  credits: number;
  onClose: () => void;
  onGenerate: () => void;
  onSent: (g: ContentGap) => void;
}) {
  const [phase, setPhase] = React.useState<"offer" | "writing" | "done">("offer");
  const [prevGap, setPrevGap] = React.useState(gap);
  if (gap !== prevGap) {
    setPrevGap(gap);
    if (gap) setPhase("offer");
  }

  const article = gap ? fullArticleFor(gap.id) : null;

  function generate() {
    onGenerate();
    setPhase("writing");
    setTimeout(() => setPhase("done"), 2400);
  }
  function sendFull(dest: string) {
    if (!gap || !article) return;
    onSent(gap);
    if (dest === "Markdown") {
      navigator.clipboard?.writeText(toFullMarkdown(gap, article));
      toast.success("Full article copied as markdown", {
        description: `${gap.label} — ${article.wordCount.toLocaleString()} words.`,
      });
    } else {
      toast.success(`Full article sent to ${dest} draft`, {
        description: `${gap.label} — ${article.wordCount.toLocaleString()} words, in your voice.`,
      });
    }
    onClose();
  }

  return (
    <Dialog open={!!gap} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        {phase === "offer" && gap && article && (
          <>
            <DialogHeader>
              <span className="mb-1 flex size-10 items-center justify-center rounded-xl bg-conf-med-soft text-ochre">
                <WandSparkles className="size-5" />
              </span>
              <DialogTitle className="flex items-center gap-2">
                Write the full article
                <Badge variant="ochre"><Crown className="size-3" /> Premium</Badge>
              </DialogTitle>
              <DialogDescription>
                Go beyond the scaffold — AI writes the complete, publish-ready post in your
                voice, grounded in your own posts.
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-lg border border-line bg-paper/50 px-3.5 py-3">
              <div className="text-sm font-medium text-ink">{gap.label}</div>
              <div className="mt-0.5 text-xs text-ink-muted">
                ~{article.wordCount.toLocaleString()} words · {article.sections.length} written
                sections · reader Q&A from {gap.verbatim.length} questions
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg border border-line bg-surface p-3">
                <div className="font-semibold text-ink">Scaffold</div>
                <div className="mt-0.5 text-ink-muted">Outline you finish (~90 min). Included.</div>
              </div>
              <div className="rounded-lg border border-ochre/40 bg-conf-med-soft/30 p-3">
                <div className="flex items-center gap-1 font-semibold text-ink"><Crown className="size-3 text-ochre" /> Full Draft</div>
                <div className="mt-0.5 text-ink-muted">Finished post, ready to publish.</div>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-lg bg-conf-med-soft/40 px-3 py-2 text-xs text-ink">
              <Sparkles className="mt-0.5 size-3.5 shrink-0 text-ochre" />
              <span>
                Uses <span className="font-semibold">1 Full Draft credit</span> — you have{" "}
                {credits} of 3 left this month. It costs more because we generate the entire
                article; extra credits are $5 each.
              </span>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              <Button onClick={generate} className="bg-ochre text-ink hover:bg-ochre/90">
                <WandSparkles /> {credits > 0 ? "Generate full article" : "Buy a credit & generate"}
              </Button>
            </DialogFooter>
          </>
        )}

        {phase === "writing" && gap && article && (
          <div className="py-8 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-conf-med-soft text-ochre">
              <Loader2 className="size-7 animate-spin" />
            </div>
            <h3 className="mt-4 font-display text-xl font-medium text-ink">
              Writing your article in Maya&apos;s voice…
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">
              Reading your posts, matching your tone, drafting {article.sections.length} sections
              and a reader Q&A from {gap.verbatim.length} questions.
            </p>
            <div className="mx-auto mt-5 max-w-xs space-y-1.5 text-left">
              {["Reading your 142 posts", "Matching your voice & tone", "Drafting every section", "Embedding the reader Q&A"].map((s) => (
                <div key={s} className="flex items-center gap-2 text-xs text-ink-muted">
                  <Loader2 className="size-3 animate-spin text-ochre" /> {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {phase === "done" && gap && article && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Check className="size-5 text-positive" /> Your full article is ready
              </DialogTitle>
              <DialogDescription>
                {article.wordCount.toLocaleString()} words · {article.readingTime} · written in
                your voice · 1 credit used ({credits} left)
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-[52vh] overflow-y-auto rounded-xl border border-line bg-surface px-5 py-4">
              <h2 className="font-display text-2xl font-medium tracking-tight text-ink">{gap.label}</h2>
              <p className="mt-1 text-xs text-ink-subtle">By Maya Brennan · The Weeknight Kitchen</p>
              <div className="prose-vi mt-4 space-y-3.5 text-[15px] leading-relaxed text-ink/90">
                {article.intro.map((p, i) => <p key={i}>{p}</p>)}
                {article.sections.map((s, i) => (
                  <div key={i}>
                    <h3 className="font-display text-lg font-medium text-ink">{s.heading}</h3>
                    <p className="mt-1">{s.body}</p>
                  </div>
                ))}
                <div className="rounded-lg border border-line bg-paper/50 p-3.5">
                  <div className="flex items-center gap-1.5 font-display text-base font-medium text-ink">
                    <BookOpenText className="size-4 text-ink-subtle" /> Reader questions, answered
                  </div>
                  <ul className="mt-2 space-y-1.5">
                    {gap.verbatim.map((q, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-ink-muted">
                        <Check className="mt-0.5 size-3.5 shrink-0 text-positive" /> {q}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={onClose}>Close</Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button><Send /> Send to draft <ChevronDown className="size-3.5" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Create draft in</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => sendFull("WordPress")}><FileText /> WordPress</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => sendFull("Notion")}><NotebookPen /> Notion</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => sendFull("Markdown")}><FileCode /> Copy as markdown</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
