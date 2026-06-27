import Link from "next/link";
import { Hero } from "@/components/marketing/hero";
import { ClosedLoop } from "@/components/marketing/closed-loop";
import { Features } from "@/components/marketing/features";
import { PremiumFullDraft } from "@/components/marketing/premium-full-draft";
import { WorksAnywhere } from "@/components/marketing/works-anywhere";
import { Proof } from "@/components/marketing/proof";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { Faq } from "@/components/marketing/faq";
import { CtaBand } from "@/components/marketing/cta-band";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <ClosedLoop />
      <Features />
      <PremiumFullDraft />
      <WorksAnywhere />
      <Proof />

      <section id="pricing" className="mx-auto max-w-6xl px-5 py-16 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="kicker">Pricing</p>
          <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            Flat price. Never punished for traffic.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-muted">
            Under 1% of a mid-tier creator&apos;s income — and it pays for itself
            with the first surfaced affiliate pick.
          </p>
        </div>
        <div className="mt-12">
          <PricingCards />
        </div>
        <p className="mt-6 text-center text-sm text-ink-subtle">
          Need multi-site or white-label?{" "}
          <Link href="/pricing" className="text-accent hover:underline">
            Compare plans in detail →
          </Link>
        </p>
      </section>

      <Faq />
      <CtaBand />
    </>
  );
}
