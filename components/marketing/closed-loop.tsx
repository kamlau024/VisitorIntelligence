import { MessageCircleQuestion, Sparkles, BarChart3, PenLine, ArrowRight } from "lucide-react";

const STEPS = [
  {
    icon: MessageCircleQuestion,
    title: "A visitor asks",
    body: "On your page, in their own words — the question they'd have typed into Google.",
    tone: "text-teal",
    bg: "bg-[#e2ecef]",
  },
  {
    icon: Sparkles,
    title: "You answer + earn",
    body: "Author-voiced, grounded in your posts, with your own affiliate pick surfaced as a quiet chip.",
    tone: "text-accent",
    bg: "bg-accent-soft",
  },
  {
    icon: BarChart3,
    title: "Intent is captured",
    body: "Every question becomes first-party visitor intent — clustered, trended, owned by you.",
    tone: "text-sage",
    bg: "bg-positive-soft",
  },
  {
    icon: PenLine,
    title: "You write what's next",
    body: "Unanswered clusters become a ranked draft skeleton — the next post your readers already want.",
    tone: "text-plum",
    bg: "bg-[#f0e6ea]",
  },
];

export function ClosedLoop() {
  return (
    <section id="how" className="border-y border-line bg-surface-2">
      <div className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
        <div className="max-w-2xl">
          <p className="kicker">The closed loop</p>
          <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            Every visitor question becomes revenue{" "}
            <span className="text-accent">or</span> your next post.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-muted">
            Other tools stop at a chatbot, or stop at analytics. Visitor
            Intelligence closes the loop — so the questions your readers ask keep
            paying you back.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.title} className="relative">
              <div className="h-full rounded-xl border border-line bg-surface p-5 edge">
                <span
                  className={`flex size-10 items-center justify-center rounded-lg ${s.bg} ${s.tone}`}
                >
                  <s.icon className="size-5" />
                </span>
                <h3 className="mt-4 font-display text-lg font-medium text-ink">
                  {s.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                  {s.body}
                </p>
              </div>
              {i < STEPS.length - 1 && (
                <ArrowRight className="absolute -right-3 top-1/2 z-10 hidden size-5 -translate-y-1/2 text-line-strong md:block" />
              )}
            </div>
          ))}
        </div>

        <p className="mt-8 flex items-center gap-2 text-sm text-ink-subtle">
          <span className="inline-block h-px w-8 bg-line-strong" />
          The new post answers more questions — which sharpens the next loop.
        </p>
      </div>
    </section>
  );
}
