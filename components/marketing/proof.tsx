const QUOTES = [
  {
    quote:
      "My Google traffic is down 40%, but the readers who do land are worth more now. The widget answers their substitution questions and quietly drops in my Amazon picks. It paid for itself in week one.",
    name: "Lindsay O.",
    role: "Food creator · 180k sessions/mo",
    initials: "LO",
  },
  {
    quote:
      "I finally know what my readers are actually trying to ask. The Monday gap report told me to write about freezing sourdough — that post is now my third-best page.",
    name: "Megan P.",
    role: "Baking blog · 95k sessions/mo",
    initials: "MP",
  },
  {
    quote:
      "It's the first 'AI' tool I didn't churn off in a month. It's not a chatbot — it tells me what to write and shows me the money. Installed it on three sites.",
    name: "Casey R.",
    role: "Recipe developer · 220k sessions/mo",
    initials: "CR",
  },
];

export function Proof() {
  return (
    <section className="border-y border-line bg-surface-2">
      <div className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
        <div className="max-w-2xl">
          <p className="kicker">From the kitchens</p>
          <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            Built for creators, by watching their wound.
          </h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {QUOTES.map((q) => (
            <figure
              key={q.name}
              className="flex flex-col rounded-xl border border-line bg-surface p-6 edge"
            >
              <blockquote className="flex-1 font-display text-[17px] leading-relaxed text-ink">
                &ldquo;{q.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                <span className="flex size-9 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent-press">
                  {q.initials}
                </span>
                <span className="leading-tight">
                  <span className="block text-sm font-semibold text-ink">
                    {q.name}
                  </span>
                  <span className="text-xs text-ink-muted">{q.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
