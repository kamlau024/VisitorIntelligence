import { PageHeader, PageBody, StatCard } from "@/components/dashboard/primitives";
import { ContentGapsList } from "@/components/dashboard/content-gaps";
import { contentGaps } from "@/lib/mock-data/gaps";

export const metadata = { title: "Content Gaps — Visitor Intelligence" };

export default function ContentGapsPage() {
  const totalReaders = contentGaps.reduce((s, g) => s + g.volume, 0);
  const drafted = contentGaps.filter((g) => g.status === "drafted").length;
  const topTrend = Math.max(...contentGaps.map((g) => g.trendWoW));

  return (
    <PageBody>
      <PageHeader
        kicker="Gap-to-Draft Pipeline"
        title="What to write next"
        description="Questions your readers ask but your posts don't answer well — clustered, ranked, and turned into a draft scaffold built from your own content. Close the loop: question → next post → fewer gaps."
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Gaps detected" value={String(contentGaps.length)} footnote="this month" accent />
        <StatCard label="Readers asking" value={totalReaders.toLocaleString()} footnote="across all gaps" />
        <StatCard label="Fastest rising" value={`+${topTrend}%`} footnote="week over week" />
        <StatCard label="Drafts created" value={String(drafted)} footnote="sent to your editor" />
      </div>

      <div className="mt-6">
        <ContentGapsList />
      </div>
    </PageBody>
  );
}
