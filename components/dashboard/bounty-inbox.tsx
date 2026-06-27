"use client";

import * as React from "react";
import { toast } from "sonner";
import { HandCoins, Clock, Users, FileCheck2, Check, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { bounties as seedBounties } from "@/lib/mock-data/bounties";
import { postById } from "@/lib/mock-data/site";
import { money, timeAgo } from "@/lib/utils";
import type { Bounty } from "@/lib/mock-data/types";

const SLA_HOURS = 72;
const NOW = new Date("2026-06-24T09:00:00Z").getTime();

function slaLeft(askedAt: string) {
  const due = new Date(askedAt).getTime() + SLA_HOURS * 3600_000;
  const hrs = Math.round((due - NOW) / 3600_000);
  if (hrs <= 0) return { label: "overdue", urgent: true };
  if (hrs < 24) return { label: `${hrs}h left`, urgent: true };
  return { label: `${Math.round(hrs / 24)}d left`, urgent: false };
}

export function BountyInbox() {
  const [bounties, setBounties] = React.useState<Bounty[]>(seedBounties);
  const [answering, setAnswering] = React.useState<Bounty | null>(null);
  const [draft, setDraft] = React.useState("");

  const pending = bounties.filter((b) => b.status === "pending");
  const answered = bounties.filter((b) => b.status === "answered");

  function openAnswer(b: Bounty) {
    setAnswering(b);
    setDraft("");
  }

  function submit() {
    if (!answering) return;
    setBounties((bs) =>
      bs.map((b) =>
        b.id === answering.id
          ? { ...b, status: "answered", answer: draft || "Thanks for the question! ...", answeredAt: new Date().toISOString(), fundedBy: 1 }
          : b
      )
    );
    toast.success("Answer sent & published", {
      description: "Your reply became a Reader-Funded Note on the post.",
    });
    setAnswering(null);
  }

  return (
    <>
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-lg font-medium text-ink">Pending</h2>
          <Badge variant="clay">{pending.length}</Badge>
        </div>
        {pending.length === 0 && (
          <div className="rounded-xl border border-dashed border-line-strong bg-surface p-8 text-center text-sm text-ink-muted">
            All caught up — no bounties waiting on you.
          </div>
        )}
        {pending.map((b) => {
          const sla = slaLeft(b.askedAt);
          return (
            <div key={b.id} className="rounded-xl border border-line bg-surface p-5 edge">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Badge><HandCoins className="size-3" /> {money(b.price)} bounty</Badge>
                  <span className="text-xs text-ink-subtle">from {b.visitorEmail}</span>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${sla.urgent ? "bg-conf-low-soft text-conf-low" : "bg-paper-2 text-ink-muted"}`}>
                  <Clock className="size-3" /> {sla.label}
                </span>
              </div>
              <p className="mt-3 text-[15px] leading-relaxed text-ink">&ldquo;{b.question}&rdquo;</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-ink-subtle">
                  On {postById(b.postId)?.title} · asked {timeAgo(b.askedAt)}
                </span>
                <Button size="sm" onClick={() => openAnswer(b)}><Send /> Answer</Button>
              </div>
            </div>
          );
        })}
      </section>

      <section className="mt-8 space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-lg font-medium text-ink">Published as Reader-Funded Notes</h2>
          <Badge variant="sage">{answered.length}</Badge>
        </div>
        {answered.map((b) => (
          <div key={b.id} className="rounded-xl border border-line bg-surface p-5 edge">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <p className="flex-1 text-[15px] font-medium text-ink">&ldquo;{b.question}&rdquo;</p>
              <Badge variant="sage"><FileCheck2 className="size-3" /> Published</Badge>
            </div>
            <div className="mt-3 rounded-lg border-l-2 border-accent/40 bg-paper/50 px-4 py-3 text-sm leading-relaxed text-ink-muted">
              {b.answer}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-subtle">
              <span className="inline-flex items-center gap-1 text-sage">
                <Users className="size-3.5" /> Funded by {b.fundedBy} readers
              </span>
              <span>On {postById(b.postId)?.title}</span>
              <span>Earned {money(b.price)}</span>
            </div>
          </div>
        ))}
      </section>

      {/* answer dialog */}
      <Dialog open={!!answering} onOpenChange={(o) => !o && setAnswering(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Answer this reader</DialogTitle>
            <DialogDescription>
              Your reply is emailed to the reader and published as a permanent, cited note on the post.
            </DialogDescription>
          </DialogHeader>
          {answering && (
            <div className="rounded-lg border border-line bg-paper px-3 py-2.5 text-sm text-ink">
              &ldquo;{answering.question}&rdquo;
            </div>
          )}
          <Textarea value={draft} onChange={(e) => setDraft(e.target.value)}
            placeholder="Write your answer in your own voice…" className="min-h-32" />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAnswering(null)}>Cancel</Button>
            <Button onClick={submit}><Check /> Send & publish note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
