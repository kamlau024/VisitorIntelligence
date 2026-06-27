import Link from "next/link";
import { Wordmark } from "@/components/brand";

const COLS = [
  {
    title: "Product",
    links: [
      { href: "/#features", label: "Features" },
      { href: "/pricing", label: "Pricing" },
      { href: "/demo", label: "Live demo" },
      { href: "/get-started", label: "Install" },
    ],
  },
  {
    title: "For creators",
    links: [
      { href: "/#how", label: "How it works" },
      { href: "/#features", label: "Affiliate surfacing" },
      { href: "/#features", label: "Intent capture" },
      { href: "/#features", label: "Gap-to-Draft" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "#", label: "About" },
      { href: "#", label: "Blog" },
      { href: "#", label: "Privacy" },
      { href: "#", label: "Terms" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface-2">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <Wordmark />
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">
              Turn the questions visitors ask on your own site into first-party
              visitor intent — and into revenue, content direction, and audience
              insight.
            </p>
          </div>
          {COLS.map((col) => (
            <div key={col.title}>
              <h4 className="kicker mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-ink-muted transition-colors hover:text-accent"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-line pt-6 text-xs text-ink-subtle sm:flex-row sm:items-center">
          <p>© 2026 Visitor Intelligence. A first-party intent-capture platform.</p>
          <p>Made for creators bleeding traffic to AI Overviews.</p>
        </div>
      </div>
    </footer>
  );
}
