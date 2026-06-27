# Visitor Intelligence — product mockup / build spec

A runnable, high-fidelity mockup of **Visitor Intelligence**: an on-site AI Q&A widget
(the *capture mechanism*) feeding a publisher dashboard that turns the questions visitors
ask on their own site into **first-party visitor intent** — and into revenue, content
direction, and audience insight. Built from ~3 months of product research. This app doubles
as the build/design spec: every key screen and state is real, seeded with believable
food-blog data ("The Weeknight Kitchen").

> Vocabulary follows the project's Canonical Vocabulary: **visitor/reader** (the audience),
> **publisher/creator** (the buyer), **the widget** (mechanism), **first-party visitor
> intent**, **intent capture** (the category). *Intent* = stated wants; *behavior* = clicks.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (Vercel-deployable)
```

## Routes → research features

| Route | Surface | Research feature |
|---|---|---|
| `/` · `/pricing` | Marketing | "AI Overviews defense" painkiller narrative, closed loop, $0/$29/$79 |
| `/get-started` | Onboarding | **CMS-agnostic install** (Gap E): connect → crawl → approve affiliate inventory → tune voice → paste snippet → verify |
| `/demo` | Visitor Widget in context | Author-voiced answers, "author's pick" affiliate chip, confidence bar, $3 bounty |
| `/dashboard` | Overview | At-a-glance intent, revenue, biggest gap, live feed (+ `?state=empty` empty state) |
| `/dashboard/intent` | Intent Explorer | **Gap C** — the "see *why*, not just what" moat: clusters, verbatim, per-page intent |
| `/dashboard/revenue` | Affiliate Revenue | **Gap A** — revenue per question-cluster, clicks-first (revenue *modeled*), "could have linked" |
| `/dashboard/content-gaps` | Gap-to-Draft | **Gap B** — ranked gaps → draft scaffolds → send to WordPress/Notion/markdown |
| `/dashboard/bounties` | Bounty Inbox | Confidence + reader-funded notes (wildcard) |
| `/dashboard/widget` | Widget Studio | Appearance, voice, suggested questions, affiliate rules, live preview, embed snippet |
| `/dashboard/settings` | Settings | Content sources & affiliate inventory, plan/billing, site, team/API |
| `/embed-test.html` | Embed proof | A **plain HTML page** that loads `vi-widget.js` — proves the CMS-agnostic embed |

## The embeddable widget

`public/vi-widget.js` is the real install mechanism: one `<script src="…/vi-widget.js"
data-site-id="…" defer>` tag mounts the widget into an **isolated Shadow DOM** on any site
(WordPress, Squarespace, Ghost, Webflow, Shopify, plain HTML). Open `/embed-test.html` to see
it running on a page with totally different styles. The richer React widget
(`components/widget/visitor-widget.tsx`) is the design source, used on `/demo` and in Widget
Studio's live preview.

### Divergence from the research
The research assumed a WordPress-first plugin. This mockup implements a **universal JS embed**
instead — so the product learns the site by crawling the sitemap and parsing rendered pages
(recipe JSON-LD, affiliate-link discovery) rather than reading WordPress's database. Reflected
in Onboarding and Settings → Content Sources.

## Project structure

```
app/(marketing)/        Landing + pricing (own nav/footer)
app/get-started/        Onboarding wizard
app/demo/               Fake food blog + live widget
app/dashboard/          App shell + all dashboard pages
components/ui/           Hand-built UI kit (Radix + cva, warm-themed)
components/marketing/    Hero, closed loop, features, pricing, FAQ
components/dashboard/    App shell, charts (Recharts), primitives, per-page views
components/widget/       The visitor widget (React)
lib/mock-data/           Typed dataset for "The Weeknight Kitchen"
lib/design/chart.ts      Earthy data-viz palette
public/vi-widget.js      Standalone embeddable widget (Shadow DOM)
```

## Design system — "Warm editorial intelligence"

Cream/ink neutrals + terracotta accent, **Fraunces** display + **Hanken Grotesk** body +
**JetBrains Mono** for code. Earthy data-viz (clay/sage/ochre/teal/plum). Tokens live in
`app/globals.css` (`bg-paper`, `text-ink`, `bg-accent`, `text-sage`, confidence scale, …).

## Out of scope (mockup)
Real RAG/LLM backend, real crawling, auth, Stripe, affiliate attribution, and Year-2 features
(vertical packs, sponsored answers, gap exchange, agent toll-gate). The UI is structured so
these slot in later.
