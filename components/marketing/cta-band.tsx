import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaBand() {
  return (
    <section className="grain relative overflow-hidden border-t border-line">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(60% 120% at 50% 0%, rgba(194,85,47,0.12), transparent)",
        }}
      />
      <div className="relative mx-auto max-w-3xl px-5 py-20 text-center">
        <h2 className="font-display text-4xl font-medium tracking-tight text-ink sm:text-5xl">
          Keep the reader.
          <br />
          Keep the revenue.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-ink-muted">
          The visitors who still find you are worth more than ever. Stop sending
          their questions — and their buying intent — to Google. Capture them on
          your own site.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/get-started">
              Start free in 5 minutes <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/demo">See the live demo</Link>
          </Button>
        </div>
        <p className="mt-4 text-sm text-ink-subtle">
          No credit card · Works on any CMS · Free tier forever
        </p>
      </div>
    </section>
  );
}
