import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, Clock, Users, Star, CookingPot, Scale, Thermometer,
  Utensils, ArrowUpRight, Sparkles,
} from "lucide-react";
import { VisitorWidget } from "@/components/widget/visitor-widget";
import { affiliateInventory } from "@/lib/mock-data/site";
import { money } from "@/lib/utils";

export const metadata = { title: "Live demo — The Weeknight Kitchen" };

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-paper">
      {/* demo notice */}
      <div className="bg-ink text-paper">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-5 py-2.5 text-sm">
          <Link href="/" className="inline-flex items-center gap-1.5 text-paper/70 hover:text-paper">
            <ArrowLeft className="size-4" /> Back to Visitor Intelligence
          </Link>
          <span className="hidden text-paper/80 sm:inline">
            Live demo · click{" "}
            <span className="font-semibold text-ochre">&ldquo;Ask Maya&rdquo;</span>{" "}
            ↘ to try the widget
          </span>
        </div>
      </div>

      {/* faux blog header */}
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-5">
          <div className="font-display text-xl font-semibold tracking-tight text-ink">
            The Weeknight Kitchen
          </div>
          <nav className="hidden gap-6 text-sm text-ink-muted sm:flex">
            <span>Recipes</span><span>Dinner</span><span>Bread</span><span>About</span>
          </nav>
        </div>
      </header>

      {/* article */}
      <article className="mx-auto max-w-3xl px-5 py-10">
        <p className="kicker">Bread · Beginner</p>
        <h1 className="mt-3 font-display text-4xl font-medium leading-tight tracking-tight text-ink sm:text-5xl">
          No-Knead Dutch Oven Bread
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-ink-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="flex size-7 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent-press">MB</span>
            By Maya Brennan
          </span>
          <span className="inline-flex items-center gap-1 text-ochre">
            <Star className="size-4 fill-ochre" /> 4.9 (612)
          </span>
          <span>Updated June 2026</span>
        </div>

        {/* hero image */}
        <div className="relative mt-7 aspect-[3/2] w-full overflow-hidden rounded-2xl border border-line edge">
          <Image
            src="/broccoli-cheddar.png"
            alt="A golden no-knead loaf baked in a cream enameled Dutch oven"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>

        {/* recipe meta card */}
        <div className="mt-7 grid grid-cols-3 divide-x divide-line rounded-xl border border-line bg-surface text-center edge">
          {[
            { icon: Clock, label: "Prep", value: "15 min" },
            { icon: Clock, label: "Total", value: "18 hrs" },
            { icon: Users, label: "Yields", value: "1 loaf" },
          ].map((m) => (
            <div key={m.label} className="px-4 py-4">
              <m.icon className="mx-auto size-4 text-ink-subtle" />
              <div className="mt-1.5 font-display text-lg font-medium text-ink">{m.value}</div>
              <div className="text-xs text-ink-muted">{m.label}</div>
            </div>
          ))}
        </div>

        <div className="prose-vi mt-8 space-y-4 text-[17px] leading-relaxed text-ink/90">
          <p>
            This is the loaf that made me fall in love with baking bread. No
            kneading, no stand mixer, no sourdough starter to babysit — just four
            ingredients, a long slow rise, and a screaming-hot Dutch oven that does
            all the hard work for you.
          </p>
          <p>
            The magic is steam. When you drop the dough into a preheated covered
            pot, the trapped moisture lets the crust stay soft long enough for the
            bread to spring up tall before it sets into that deep, crackly shell.
          </p>

          <h2 className="font-display text-2xl font-medium text-ink">Ingredients</h2>
          <ul className="list-disc space-y-1.5 pl-5 marker:text-accent">
            <li>3 cups (430g) bread flour</li>
            <li>1¼ tsp instant yeast</li>
            <li>2 tsp fine sea salt</li>
            <li>1½ cups (360g) cool water</li>
          </ul>

          <h2 className="font-display text-2xl font-medium text-ink">Instructions</h2>
          <ol className="list-decimal space-y-2 pl-5 marker:font-semibold marker:text-ink-muted">
            <li>Whisk the flour, yeast, and salt. Add water and stir into a shaggy dough.</li>
            <li>Cover and rest at room temperature for 12–18 hours, until bubbly and doubled.</li>
            <li>Preheat your Dutch oven to 450°F for 30 minutes. Shape the dough into a round.</li>
            <li>Drop the dough in, cover, and bake 30 minutes. Uncover and bake 12 more until deep golden.</li>
          </ol>

        </div>

        <RelatedProducts />
      </article>

      {/* the live widget */}
      <VisitorWidget mode="floating" brandName="Maya" />
    </div>
  );
}

// Real affiliate content on the page — the same links the assistant can surface in answers.
const RELATED = [
  { id: "a-dutch", icon: CookingPot, why: "The one tool that makes this loaf — it traps steam for that crackly crust." },
  { id: "a-thermo", icon: Thermometer, why: "Pull the loaf at 205°F internal for a perfectly set crumb." },
  { id: "a-scale", icon: Scale, why: "Weigh your flour in grams — far more reliable than measuring cups." },
  { id: "a-scraper", icon: Utensils, why: "Turns and shapes the sticky dough without it gluing to your hands." },
];

function RelatedProducts() {
  const items = RELATED.map((r) => ({
    ...r,
    p: affiliateInventory.find((a) => a.id === r.id)!,
  }));

  return (
    <section className="mt-12 border-t border-line pt-8">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-2xl font-medium text-ink">Related Products</h2>
        <span className="rounded-full border border-line-strong px-2 py-0.5 text-[11px] font-medium text-ink-subtle">
          Affiliate links
        </span>
      </div>
      <p className="mt-2 text-sm text-ink-muted">
        The tools I actually use for this loaf. As an Amazon Associate, I earn from qualifying purchases.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {items.map(({ id, icon: Icon, why, p }) => (
          <a
            key={id}
            href="#"
            className="group flex items-start gap-3 rounded-xl border border-line bg-surface p-4 transition-colors hover:border-accent/40 hover:bg-accent-soft/20 edge"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <Icon className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <span className="truncate font-medium text-ink">{p.product}</span>
                <ArrowUpRight className="size-4 shrink-0 text-ink-subtle transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
              <span className="mt-0.5 block text-sm leading-snug text-ink-muted">{why}</span>
              <span className="mt-1.5 block text-xs font-medium text-ink">
                {money(p.price)} · {p.retailer}
              </span>
            </span>
          </a>
        ))}
      </div>

      {/* demo annotation: ties page content to the generated answer */}
      <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-dashed border-accent/40 bg-accent-soft/25 px-4 py-3 text-sm text-ink">
        <Sparkles className="mt-0.5 size-4 shrink-0 text-accent" />
        <span>
          <span className="font-semibold">Demo:</span> these affiliate links live in the page&apos;s
          content. Ask the assistant ↘ <em>&ldquo;I don&apos;t have a Dutch oven&rdquo;</em> and it
          surfaces the same Lodge pick — grounded in this post, with the affiliate link inline.
        </span>
      </div>
    </section>
  );
}
