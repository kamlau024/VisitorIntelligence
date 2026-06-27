"use client";

import * as React from "react";
import {
  Send, X, ArrowUpRight, ThumbsUp, ThumbsDown, HandCoins, Check, Loader2, FileText,
} from "lucide-react";
import { Mark } from "@/components/brand";
import { ConfidenceBar } from "@/components/confidence";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { matchAnswer, suggestedQuestions, type WidgetAnswer } from "@/lib/mock-data/widget";
import { cn, money } from "@/lib/utils";

type Msg =
  | { id: number; role: "visitor"; text: string }
  | { id: number; role: "author"; answer: WidgetAnswer; feedback: "up" | "down" | null };

let uid = 1;

/** The on-site Q&A widget. mode="floating" pins it bottom-right; "inline" renders the panel in-flow. */
export function VisitorWidget({
  mode = "floating",
  brandName = "Maya",
  accent,
  suggestions,
}: {
  mode?: "floating" | "inline";
  brandName?: string;
  accent?: string;
  suggestions?: string[];
}) {
  const [open, setOpen] = React.useState(mode === "inline");

  const style = accent
    ? ({ ["--accent" as string]: accent } as React.CSSProperties)
    : undefined;

  if (mode === "inline") {
    return (
      <div style={style} className="w-full">
        <WidgetPanel brandName={brandName} onClose={() => {}} inline suggestions={suggestions} />
      </div>
    );
  }

  return (
    <div style={style}>
      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-[min(380px,calc(100vw-2.5rem))] animate-rise">
          <WidgetPanel brandName={brandName} onClose={() => setOpen(false)} suggestions={suggestions} />
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-accent-ink shadow-[0_8px_30px_-8px_rgba(194,85,47,0.6)] transition-transform hover:scale-[1.03] active:scale-95 cursor-pointer"
      >
        {open ? <X className="size-5" /> : <Mark className="size-5 [&_path]:fill-[var(--accent-ink)] [&_rect]:fill-[var(--accent)]" />}
        {!open && <span>Ask {brandName}</span>}
      </button>
    </div>
  );
}

function WidgetPanel({
  brandName, onClose, inline, suggestions = suggestedQuestions,
}: { brandName: string; onClose: () => void; inline?: boolean; suggestions?: string[] }) {
  const [msgs, setMsgs] = React.useState<Msg[]>([]);
  const [input, setInput] = React.useState("");
  const [typing, setTyping] = React.useState(false);
  const [bountyFor, setBountyFor] = React.useState<WidgetAnswer | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing]);

  function ask(text: string) {
    if (!text.trim() || typing) return;
    const ans = matchAnswer(text);
    setInput("");
    setMsgs((m) => [...m, { id: uid++, role: "visitor", text }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { id: uid++, role: "author", answer: { ...ans, question: text }, feedback: null }]);
    }, 1100);
  }

  function setFeedback(id: number, f: "up" | "down") {
    setMsgs((m) => m.map((x) => (x.id === id && x.role === "author" ? { ...x, feedback: f } : x)));
  }

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-line bg-surface edge-lg",
        inline ? "h-[560px]" : "h-[min(560px,calc(100vh-8rem))]"
      )}
    >
      {/* header */}
      <div className="flex items-center gap-3 border-b border-line bg-surface-2 px-4 py-3">
        <span className="flex size-9 items-center justify-center rounded-full bg-accent-soft">
          <Mark className="size-5" />
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="text-sm font-semibold text-ink">Ask {brandName}</div>
          <div className="text-xs text-ink-muted">Answers from The Weeknight Kitchen</div>
        </div>
        {!inline && (
          <button onClick={onClose} className="rounded-md p-1 text-ink-subtle hover:bg-paper-2 hover:text-ink cursor-pointer">
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {msgs.length === 0 && (
          <div className="space-y-3">
            <div className="flex gap-2.5">
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-soft">
                <Mark className="size-4" />
              </span>
              <div className="rounded-2xl rounded-tl-sm border border-line bg-paper px-3.5 py-2.5 text-sm leading-relaxed text-ink">
                Hi! I&apos;m {brandName}&apos;s kitchen assistant. Ask me anything about this
                recipe — substitutions, equipment, make-ahead, you name it.
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pl-9">
              {suggestions.map((q) => (
                <button key={q} onClick={() => ask(q)}
                  className="rounded-full border border-line-strong bg-surface px-3 py-1.5 text-left text-xs text-ink transition-colors hover:border-accent/40 hover:bg-accent-soft/40 cursor-pointer">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {msgs.map((m) =>
          m.role === "visitor" ? (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[82%] rounded-2xl rounded-br-sm bg-ink px-3.5 py-2 text-sm text-paper">
                {m.text}
              </div>
            </div>
          ) : (
            <AuthorMessage key={m.id} msg={m} onFeedback={setFeedback} onBounty={() => setBountyFor(m.answer)} />
          )
        )}

        {typing && (
          <div className="flex gap-2.5">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-soft">
              <Mark className="size-4" />
            </span>
            <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-line bg-paper px-4 py-3">
              {[0, 1, 2].map((i) => (
                <span key={i} className="size-1.5 rounded-full bg-ink-subtle animate-pulse-dot"
                  style={{ animationDelay: `${i * 160}ms` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* input */}
      <form onSubmit={(e) => { e.preventDefault(); ask(input); }}
        className="flex items-center gap-2 border-t border-line bg-surface-2 px-3 py-3">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder={`Ask about this recipe…`}
          className="h-10 bg-surface" />
        <Button type="submit" size="icon" disabled={!input.trim() || typing}>
          <Send className="size-4" />
        </Button>
      </form>

      <div className="border-t border-line bg-surface px-4 py-1.5 text-center text-[10px] text-ink-subtle">
        Powered by Visitor Intelligence
      </div>

      <BountyModal answer={bountyFor} onOpenChange={(o) => !o && setBountyFor(null)} brandName={brandName} />
    </div>
  );
}

function AuthorMessage({
  msg, onFeedback, onBounty,
}: { msg: Extract<Msg, { role: "author" }>; onFeedback: (id: number, f: "up" | "down") => void; onBounty: () => void }) {
  const { answer } = msg;
  return (
    <div className="flex gap-2.5">
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-soft">
        <Mark className="size-4" />
      </span>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="rounded-2xl rounded-tl-sm border border-line bg-paper px-3.5 py-3 text-sm leading-relaxed text-ink">
          {answer.answer.map((p, i) => (
            <p key={i} className={i > 0 ? "mt-2.5" : ""}>{p}</p>
          ))}

          {answer.affiliate && (
            <a href="#" onClick={(e) => e.preventDefault()}
              className="group mt-3 flex items-center gap-2.5 rounded-lg border border-line bg-surface px-2.5 py-2 transition-colors hover:border-accent/40 hover:bg-accent-soft/40">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent">
                <ArrowUpRight className="size-4" />
              </span>
              <span className="min-w-0 flex-1 leading-tight">
                <span className="block truncate text-[13px] font-semibold text-ink">{answer.affiliate.product}</span>
                <span className="text-[11px] text-ink-muted">
                  {money(answer.affiliate.price)} at {answer.affiliate.retailer}
                  {answer.affiliate.authorPickSince ? ` · author's pick since ${answer.affiliate.authorPickSince}` : ""}
                </span>
              </span>
            </a>
          )}

          {answer.citations.length > 0 && (
            <div className="mt-3 border-t border-line/70 pt-2.5">
              <div className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-ink-subtle">
                <FileText className="size-3" />
                {answer.citations.length === 1 ? "Source" : `${answer.citations.length} sources`} from Maya&apos;s posts
              </div>
              <div className="flex flex-wrap gap-1.5">
                {answer.citations.map((c, i) => (
                  <a
                    key={c}
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="inline-flex max-w-full items-center gap-1 rounded-md border border-line bg-surface px-2 py-1 text-[11px] text-ink transition-colors hover:border-accent/40 hover:bg-accent-soft/40"
                  >
                    <span className="flex size-3.5 shrink-0 items-center justify-center rounded-sm bg-accent-soft text-[9px] font-semibold text-accent-press">
                      {i + 1}
                    </span>
                    <span className="truncate">{c}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <ConfidenceBar level={answer.confidence} />
          <div className="flex items-center gap-1">
            <button onClick={() => onFeedback(msg.id, "up")}
              className={cn("rounded-md p-1 transition-colors hover:bg-paper-2 cursor-pointer", msg.feedback === "up" ? "text-positive" : "text-ink-subtle")}>
              <ThumbsUp className="size-3.5" />
            </button>
            <button onClick={() => onFeedback(msg.id, "down")}
              className={cn("rounded-md p-1 transition-colors hover:bg-paper-2 cursor-pointer", msg.feedback === "down" ? "text-conf-low" : "text-ink-subtle")}>
              <ThumbsDown className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Low confidence → bounty CTA (P3) */}
        {answer.confidence === "low" && (
          <button onClick={onBounty}
            className="flex w-full items-center gap-2 rounded-lg border border-dashed border-conf-low/40 bg-conf-low-soft/50 px-3 py-2 text-left text-xs text-conf-low transition-colors hover:bg-conf-low-soft cursor-pointer">
            <HandCoins className="size-4 shrink-0" />
            <span><span className="font-semibold">Not fully sure on this one.</span> Ask Maya directly — $3, usually within 24h.</span>
          </button>
        )}
      </div>
    </div>
  );
}

function BountyModal({
  answer, onOpenChange, brandName,
}: { answer: WidgetAnswer | null; onOpenChange: (o: boolean) => void; brandName: string }) {
  const [price, setPrice] = React.useState(3);
  const [phase, setPhase] = React.useState<"form" | "paying" | "done">("form");
  const [email, setEmail] = React.useState("");

  React.useEffect(() => {
    if (answer) { setPhase("form"); setPrice(3); setEmail(""); }
  }, [answer]);

  function pay() {
    setPhase("paying");
    setTimeout(() => setPhase("done"), 1600);
  }

  return (
    <Dialog open={!!answer} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {phase !== "done" ? (
          <>
            <DialogHeader>
              <span className="mb-1 flex size-10 items-center justify-center rounded-xl bg-conf-low-soft text-conf-low">
                <HandCoins className="size-5" />
              </span>
              <DialogTitle>Ask {brandName} directly</DialogTitle>
              <DialogDescription>
                {brandName} will answer within 24–72h. Your answer also becomes a
                permanent, cited note on this post for future readers.
              </DialogDescription>
            </DialogHeader>

            {answer && (
              <div className="rounded-lg border border-line bg-paper px-3 py-2.5 text-sm text-ink">
                &ldquo;{answer.question}&rdquo;
              </div>
            )}

            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-ink-muted">Your bounty</span>
                <span className="font-display text-lg font-medium text-ink tnum">{money(price)}</span>
              </div>
              <Slider value={[price]} min={3} max={25} step={1} onValueChange={(v) => setPrice(v[0])} />
              <p className="mt-1.5 text-xs text-ink-subtle">Higher bounties tend to get answered faster.</p>
            </div>

            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Email for your answer" />

            <DialogFooter>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={pay} disabled={phase === "paying"}>
                {phase === "paying" ? <><Loader2 className="animate-spin" /> Processing…</> : <>Pay {money(price)} & send</>}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="py-4 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-positive text-white">
              <Check className="size-6" />
            </div>
            <h3 className="mt-3 font-display text-xl font-medium text-ink">Sent to {brandName}!</h3>
            <p className="mx-auto mt-2 max-w-xs text-sm text-ink-muted">
              We&apos;ll email you when {brandName} replies. You only get charged once she answers.
            </p>
            <Button className="mt-5" onClick={() => onOpenChange(false)}>Back to chat</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
