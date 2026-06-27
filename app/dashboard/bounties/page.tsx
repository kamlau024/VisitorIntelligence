import { PageHeader, PageBody, StatCard } from "@/components/dashboard/primitives";
import { BountyInbox } from "@/components/dashboard/bounty-inbox";
import { bounties, bountyEarnings } from "@/lib/mock-data/bounties";

export const metadata = { title: "Bounty Inbox — Visitor Intelligence" };

export default function BountiesPage() {
  const pending = bounties.filter((b) => b.status === "pending").length;
  const answered = bounties.filter((b) => b.status === "answered");
  const reachedReaders = answered.reduce((s, b) => s + (b.fundedBy ?? 0), 0);

  return (
    <PageBody>
      <PageHeader
        kicker="Bounty Inbox"
        title="Questions readers paid to ask you"
        description="When an answer is low-confidence, readers can pay a small bounty to ask you directly. Your reply becomes a permanent Reader-Funded Note — enriching your archive at no editorial cost."
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pending bounties" value={String(pending)} footnote="waiting on you" accent />
        <StatCard label="Earned this month" value={`$${bountyEarnings}`} footnote="from answered bounties" />
        <StatCard label="Notes published" value={String(answered.length)} footnote="permanent, cited answers" />
        <StatCard label="Readers reached" value={String(reachedReaders)} footnote="hit those notes for free" />
      </div>

      <div className="mt-6">
        <BountyInbox />
      </div>
    </PageBody>
  );
}
