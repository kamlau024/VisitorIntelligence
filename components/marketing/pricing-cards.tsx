import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PRICING } from "@/lib/mock-data";

export function PricingCards() {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {PRICING.map((p) => (
        <div
          key={p.tier}
          className={cn(
            "relative flex flex-col rounded-2xl border p-7",
            p.highlight
              ? "border-accent/40 bg-surface edge-lg ring-1 ring-accent/20"
              : "border-line bg-surface edge"
          )}
        >
          {p.highlight && (
            <span className="absolute -top-3 left-7 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-ink">
              Most popular
            </span>
          )}
          <h3 className="font-display text-xl font-medium text-ink">{p.tier}</h3>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="font-display text-4xl font-medium text-ink tnum">
              ${p.price}
            </span>
            <span className="text-sm text-ink-muted">{p.cadence}</span>
          </div>
          <p className="mt-3 min-h-10 text-sm leading-relaxed text-ink-muted">
            {p.tagline}
          </p>
          <Button
            asChild
            variant={p.highlight ? "default" : "secondary"}
            className="mt-5 w-full"
          >
            <Link href="/get-started">{p.cta}</Link>
          </Button>
          <ul className="mt-6 space-y-3 border-t border-line pt-6">
            {p.features.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-ink">
                <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
