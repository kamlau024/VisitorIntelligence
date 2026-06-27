import { Check, Minus } from "lucide-react";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { Faq } from "@/components/marketing/faq";
import { CtaBand } from "@/components/marketing/cta-band";

const MATRIX: { label: string; free: string | boolean; pro: string | boolean; studio: string | boolean }[] = [
  { label: "Questions / month", free: "100", pro: "5,000", studio: "Unlimited" },
  { label: "Author-voiced Q&A widget", free: true, pro: true, studio: true },
  { label: "Intent-capture analytics", free: "Basic", pro: "Full", studio: "Full" },
  { label: "Author-Voiced Affiliate Surfacing", free: false, pro: true, studio: true },
  { label: "Revenue per question-cluster", free: false, pro: true, studio: true },
  { label: "Gap-to-Draft pipeline", free: false, pro: true, studio: true },
  { label: "AI Full Draft (premium)", free: false, pro: "3 / mo", studio: "20 / mo" },
  { label: "Confidence + reader bounties", free: false, pro: false, studio: true },
  { label: "Multi-site & team seats", free: false, pro: false, studio: true },
  { label: "White-label widget", free: false, pro: false, studio: true },
  { label: "API access", free: false, pro: false, studio: true },
  { label: '"Powered by" badge', free: "Shown", pro: "Removed", studio: "Removed" },
];

function Cell({ v }: { v: string | boolean }) {
  if (v === true) return <Check className="mx-auto size-4 text-accent" />;
  if (v === false) return <Minus className="mx-auto size-4 text-ink-subtle/50" />;
  return <span className="text-sm text-ink">{v}</span>;
}

export default function PricingPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pt-16 lg:pt-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="kicker">Pricing</p>
          <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-ink sm:text-5xl">
            One flat price. The whole closed loop.
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-muted">
            No credit metering, no per-visitor surprises. Pick a plan by your
            audience size and keep it as you grow.
          </p>
        </div>
        <div className="mt-12">
          <PricingCards />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-16">
        <div className="overflow-hidden rounded-2xl border border-line bg-surface edge">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-line bg-surface-2">
                <th className="p-4 text-sm font-semibold text-ink">Feature</th>
                <th className="p-4 text-center text-sm font-semibold text-ink">Free</th>
                <th className="p-4 text-center text-sm font-semibold text-accent">Pro</th>
                <th className="p-4 text-center text-sm font-semibold text-ink">Studio</th>
              </tr>
            </thead>
            <tbody>
              {MATRIX.map((row, i) => (
                <tr
                  key={row.label}
                  className={i % 2 ? "bg-surface-2/40" : ""}
                >
                  <td className="p-4 text-sm text-ink">{row.label}</td>
                  <td className="p-4 text-center"><Cell v={row.free} /></td>
                  <td className="p-4 text-center"><Cell v={row.pro} /></td>
                  <td className="p-4 text-center"><Cell v={row.studio} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Faq />
      <CtaBand />
    </>
  );
}
