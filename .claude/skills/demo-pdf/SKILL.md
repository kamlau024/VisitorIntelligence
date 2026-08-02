---
name: demo-pdf
description: Generate a prospect demo PDF simulating the Visitor Intelligence widget installed on a target site - one simulated homepage mockup per reader question, plus intent-clusters and content-gap pages. Use when asked to build a demo or sales PDF for a prospect from a folder of prospect CSVs under demo_pdf. Inputs - the prospect folder path and the site author's first name.
---

# demo-pdf: prospect demo PDF generator

Turns `demo_pdf/<prospect>/` (three CSVs) into `demo_pdf/<prospect>/demo.pdf`,
a tall-page PDF: one page per reader question (the widget simulated on the
prospect's homepage), then an intent-clusters page, then a scattered-content
gap page — 5 pages for the standard 3-lead prospect.

**Required inputs:** prospect folder path, author first name (drives "Ask
{Author}" branding). Optional: site display name (default: homepage domain
without `www.`, e.g. `example-blog.com`).

## Paths used in this document

- **`<SKILL>`** — the directory this SKILL.md lives in. Substitute the real
  path in every command below. Typically `.claude/skills/demo-pdf` (project
  install) or `~/.claude/skills/demo-pdf` (personal install). The scripts
  resolve their own dependencies, so they work from any location.
- **Prospect paths** (`demo_pdf/<prospect>/…`) are relative to your current
  working directory. Run all commands from the directory that contains the
  `demo_pdf/` folder, or substitute absolute paths.

If `<SKILL>/node_modules` does not exist, the skill has not been installed —
see `<SKILL>/README.md`.

## Hard rules (violating any of these fails the run)

1. Cluster labels render verbatim from CSV `cluster_name`. Never rename.
2. Every URL must pass `verify_urls.mjs` BEFORE any rendering. If any URL
   fails, stop and report the failures. Do not fabricate or substitute URLs.
3. Intent-cluster numbers (page2.html) are always literal `X` / `+XX%`
   (pre-masked in the template — do not replace them).
4. Reader questions render exactly as written in the CSVs, including
   drafted ones. Never rephrase.
5. No U+FFFD (`�`) anywhere in filled HTML. Resolve each from context
   (cp1252 damage: usually em dash, curly quote, or apostrophe).
6. Story discipline: no affiliate chips, draft scaffolds, "Write it for
   me," credits meters, stat boxes, trend badges, "New" pills, or CTAs.
7. If the homepage screenshot fails or shows a bot-block page, stop and
   report. Never ship a placeholder background.

## Process

### 0. Preflight (first run on a machine, or after any tooling error)

    node <SKILL>/scripts/preflight.mjs

Exit code must be 0. It verifies Node, the `playwright`/`pdf-lib`
dependencies, a launchable Chromium, and `pdftoppm` (needed to read the
PDF in step 6). If it reports a blocking problem, follow the printed fix
and re-run — do not start a prospect run against a broken environment.

### 1. Parse inputs

For each of the three CSVs:

    node <SKILL>/scripts/csv_to_json.mjs demo_pdf/<prospect>/page1_leads.csv

Read the JSON. Expect: page1 = 3 lead rows; page2 = 5 cluster rows exactly
one with `is_featured: "yes"`; page3 = rows grouped by `gap_id`. The
featured page-3 gap is the one whose posts belong to this prospect's site
(check `source_post_url` domains). Page 3 CSVs may include multiple gap
groups as seed/reference examples for the skill, all from the same target
domain — domain alone won't disambiguate them. In that case, the featured
gap is the one whose full `source_post_url` set exactly matches a page1
lead's `source_post_urls` set (page 1 and the featured page-3 gap tell the
same underlying story). If more than one gap still matches, stop and
report — never guess. If NO gap's URL set matches any page1 lead, or any other expectation above fails (row counts, featured flags, missing columns), stop and report — do not guess or repair inputs.

### 2. Verify URLs (hard gate)

    node <SKILL>/scripts/verify_urls.mjs demo_pdf/<prospect>/page1_leads.csv demo_pdf/<prospect>/page2_clusters.csv demo_pdf/<prospect>/page3_scattered_content_gaps.csv

Exit code must be 0. Save the output — it is the verification log.

### 3. Capture the homepage

    mkdir -p demo_pdf/<prospect>/build
    node <SKILL>/scripts/capture_homepage.mjs "<target_homepage_url from page1 CSV>" demo_pdf/<prospect>/build/homepage.png --full

`--full` captures the whole page: the page-1 hero grows to fit the full
widget answer and shows as much homepage behind it as that requires
(`object-fit: cover` crops from the top).

View the PNG (Read tool). It must show the real homepage — not a blank
page, error, or consent wall. If blocked, retry once; if still blocked,
stop and report (troubleshooting: some sites require
`chromium.launch({ headless: false })` — edit nothing, just report).

### 4. Fill the templates

Copy `<SKILL>/templates/tokens.css`, `page2.html`, and
`page3.html` into `demo_pdf/<prospect>/build/`, then fill
`<SKILL>/templates/question-page.html` once per lead into
`demo_pdf/<prospect>/build/q1.html`, `q2.html`, … (in `lead_order`).
Fill the copies:

- `{{NAME}}` placeholders: replace with data. HTML-escape `&`, `<`, `>`
  in all CSV text.
- `<!-- BEGIN:block -->…<!-- END:block -->`: duplicate the enclosed
  markup once per data row (per the note in each block comment), then
  remove the marker comments.
- **Question pages**: EVERY lead gets its own page — a widget-on-homepage
  simulation. Per page: `{{LEAD_NUMBER}}` and verbatim `{{CLUSTER_NAME}}`
  in the header above the simulation; `{{WIDGET_QUESTION}}` = the lead's
  question. The `intro` block (h1 + lede) stays ONLY on `q1.html` —
  delete it (markers included) on every later question page. All pages
  share the same `homepage.png`, cropped from the top, so the prospect's
  header, logo, and branding are visible on every mockup.
- **Answer conversion** (`answer_text` → `{{WIDGET_ANSWER_HTML}}`):
  - Split into paragraphs on blank lines; lines starting `- ` become
    `<ul><li>` groups. Bold section headers like `Main steps (from the
    posts)` become `<p><strong>…</strong></p>`.
  - Strip each `[Cite](URL)` marker — the widget shows citations as
    chips, not inline superscripts — while recording each URL's 1-based
    index in order of first appearance. `{{WIDGET_SOURCE_COUNT}}` = the
    lead's unique-URL count. One `widget_source_chip` per unique URL:
    `{{CITE_NUMBER}}` = its index, `{{CITE_LABEL}}` = the URL's slug,
    hyphens → spaces, `.html` stripped, sentence case, truncated to
    ~55 chars with `…`.
  - Render the answer IN FULL — never truncate or fade it; each hero
    grows to fit its widget. The confidence indicator and thumbs row
    under the bubble are static in the template — leave them untouched.
- **Page 2**: 5 `nav_item`s in `nav_order` (only the featured row keeps
  class `featured`; bar widths 62/48/41/33/27% top to bottom); featured
  detail from the featured row's `question_1..3` and `source_post_titles`
  (`; `-split).
- **Page 3**: featured gap only. `{{POST_COUNT}}` = number of CSV rows
  for that gap, as a digit. Questions from `reader_questions`
  (pipe-split). One `source_post` per row in `source_post_order`.
  `{{BRIDGE_LINE}}` from the CSV, verbatim.

### 5. Render

    node <SKILL>/scripts/render_pdf.mjs demo_pdf/<prospect>/demo.pdf demo_pdf/<prospect>/build/q1.html demo_pdf/<prospect>/build/q2.html demo_pdf/<prospect>/build/q3.html demo_pdf/<prospect>/build/page2.html demo_pdf/<prospect>/build/page3.html

(One `qN.html` argument per lead, in `lead_order`, before `page2.html`.)

### 6. QA (all must pass before you call it done)

Read `demo.pdf` (Read tool) and check every page:

- [ ] No `�` anywhere (also `grep -c '�'` each filled HTML → 0).
- [ ] Every cluster label matches its CSV `cluster_name` exactly (diff by
      eye against the csv_to_json output).
- [ ] Question pages: one page per lead, each a widget-on-homepage
      simulation with the real homepage visible behind the widget (NO
      dimming or gray backdrop), cropped from the TOP so the prospect's
      header, logo, and branding show on every page; each widget shows
      that lead's full answer ending in numbered source chips, with the
      confidence indicator and thumbs up/down row visible under the
      bubble; verbatim cluster chip above each simulation; h1 + lede on
      the first question page only; the intro copy never claims the
      widget IS installed (it says what it looks like WHEN installed —
      the footer disclosure depends on that distinction).
- [ ] Intent-clusters page: 5 clusters, correct featured one, all
      numbers `X`/`+XX%`.
- [ ] Content-gaps page: single gap card, plain-text `Covers:` lines,
      bridge line closes the card, no CTA.
- [ ] No clipped text, no overflowing boxes, no blank regions.
- [ ] Footer band ("Visitor Intelligence · demo mockup — <site>")
      present on every question page.

Fix and re-render until all boxes check. Report the QA result explicitly.
