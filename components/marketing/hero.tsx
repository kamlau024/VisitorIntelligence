import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnswerPreview } from "./answer-preview";

export function Hero() {
  return (
    <section className="grain relative overflow-hidden">
      {/* atmospheric warm glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(194,85,47,0.18), rgba(217,154,43,0.10), transparent)",
        }}
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        {/* left: copy */}
        <div className="animate-rise">
          <span className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface px-3 py-1 text-xs font-medium text-ink-muted">
            <span className="size-1.5 rounded-full bg-accent animate-pulse-dot" />
            For creators whose Google traffic fell 33% this year
          </span>

          <h1 className="mt-5 font-display text-[2.75rem] font-medium leading-[1.04] tracking-tight text-ink sm:text-6xl">
            Your own AI Overview.
            <span className="block text-accent">On your own site.</span>
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-muted">
            AI Overviews answer your readers and keep them on Google. Visitor
            Intelligence puts an author-voiced answer engine on{" "}
            <em className="font-display not-italic text-ink">your</em> pages —
            so the visitor, the question, and the revenue all stay with you.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/get-started">
                Add it to your site <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/demo">
                <Play /> See it live
              </Link>
            </Button>
          </div>

          <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-6">
            {[
              { n: "2–3×", l: "more value per visitor who still arrives" },
              { n: "5 min", l: "to install — any CMS, one script tag" },
              { n: "$29", l: "flat / month. Never metered by traffic" },
            ].map((s) => (
              <div key={s.l}>
                <dt className="font-display text-2xl font-medium text-ink tnum">
                  {s.n}
                </dt>
                <dd className="mt-1 text-xs leading-snug text-ink-muted">{s.l}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* right: browser frame with widget */}
        <div className="animate-rise [animation-delay:120ms]">
          <BrowserFrame />
        </div>
      </div>
    </section>
  );
}

function BrowserFrame() {
  return (
    <div className="relative">
      <div className="overflow-hidden rounded-2xl border border-line bg-surface edge-lg">
        {/* chrome */}
        <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-4 py-3">
          <span className="size-2.5 rounded-full bg-clay/40" />
          <span className="size-2.5 rounded-full bg-ochre/50" />
          <span className="size-2.5 rounded-full bg-sage/50" />
          <div className="ml-3 flex-1 truncate rounded-md bg-paper px-3 py-1 text-center text-xs text-ink-subtle">
            theweeknightkitchen.com/no-knead-dutch-oven-bread
          </div>
        </div>

        {/* faux article + widget */}
        <div className="relative">
          <div className="space-y-3 px-6 pb-6 pt-5">
            <p className="kicker">Bread · 2021</p>
            <h3 className="font-display text-2xl font-medium tracking-tight text-ink">
              No-Knead Dutch Oven Bread
            </h3>
            <div className="space-y-2">
              <div className="h-2.5 w-full rounded bg-paper-2" />
              <div className="h-2.5 w-[92%] rounded bg-paper-2" />
              <div className="h-2.5 w-[78%] rounded bg-paper-2" />
            </div>
          </div>

          {/* widget panel */}
          <div className="mx-4 mb-4 rounded-xl border border-line bg-paper/70 p-3.5 backdrop-blur">
            <AnswerPreview
              question="I don't have a Dutch oven — what can I use?"
              paragraphs={[
                "You don't strictly need one — the Dutch oven just traps steam so the crust sets slowly. Any heavy oven-safe pot with a tight lid will get you most of the way there.",
                "That said, if you bake even a few times a year, an enameled one is the single tool I'd actually buy — it's what I've used for every loaf here.",
              ]}
              confidence="high"
              citations={["No-Knead Dutch Oven Bread", "Weeknight Sourdough Focaccia"]}
              affiliate={{
                product: "Lodge 6qt Enameled Dutch Oven",
                retailer: "Amazon",
                price: 79.9,
                authorPickSince: 2019,
              }}
            />
          </div>
        </div>
      </div>

      {/* floating caption chip */}
      <div className="absolute -bottom-4 -left-4 hidden rounded-xl border border-line bg-surface px-3.5 py-2 text-xs edge sm:block">
        <span className="font-semibold text-ink">Captured as intent →</span>{" "}
        <span className="text-ink-muted">&ldquo;equipment&rdquo; cluster</span>
      </div>
    </div>
  );
}
