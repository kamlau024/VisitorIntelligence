---
name: demo-pdf
description: Generate a 3-page prospect demo PDF simulating the Visitor Intelligence widget installed on a target site. Use when asked to build a demo/sales PDF for a prospect from a demo_pdf/<prospect>/ folder of CSVs. Inputs - prospect folder path and the site author's first name.
---

# demo-pdf: prospect demo PDF generator

Turns `demo_pdf/<prospect>/` (three CSVs) into `demo_pdf/<prospect>/demo.pdf`:
a 3-page tall-page PDF — homepage hero with the widget overlaid, intent
clusters, scattered-content gap. Run everything from the repo root.

**Required inputs:** prospect folder path, author first name (drives "Ask
{Author}" branding). Optional: site display name (default: homepage domain
without `www.`, e.g. `example-blog.com`).

## Hard rules (violating any of these fails the run)

1. Cluster labels render verbatim from CSV `cluster_name`. Never rename.
2. Every URL must pass `verify_urls.mjs` BEFORE any rendering. If any URL
   fails, stop and report the failures. Do not fabricate or substitute URLs.
3. Page 2 numbers are always literal `X` / `+XX%` (pre-masked in the
   template — do not replace them).
4. Reader questions render exactly as written in the CSVs, including
   drafted ones. Never rephrase.
5. No U+FFFD (`�`) anywhere in filled HTML. Resolve each from context
   (cp1252 damage: usually em dash, curly quote, or apostrophe).
6. Story discipline: no affiliate chips, draft scaffolds, "Write it for
   me," credits meters, stat boxes, trend badges, "New" pills, or CTAs.
7. If the homepage screenshot fails or shows a bot-block page, stop and
   report. Never ship a placeholder background.

## Process

### 1. Parse inputs

For each of the three CSVs:

    node .claude/skills/demo-pdf/scripts/csv_to_json.mjs demo_pdf/<prospect>/page1_leads.csv

Read the JSON. Expect: page1 = 3 lead rows; page2 = 5 cluster rows exactly
one with `is_featured: "yes"`; page3 = rows grouped by `gap_id`. The
featured page-3 gap is the one whose posts belong to this prospect's site
(check `source_post_url` domains). If any expectation fails, stop and
report — never guess.

### 2. Verify URLs (hard gate)

    node .claude/skills/demo-pdf/scripts/verify_urls.mjs demo_pdf/<prospect>/page1_leads.csv demo_pdf/<prospect>/page2_clusters.csv demo_pdf/<prospect>/page3_scattered_content_gaps.csv

Exit code must be 0. Save the output — it is the verification log.

### 3. Capture the homepage

    mkdir -p demo_pdf/<prospect>/build
    node .claude/skills/demo-pdf/scripts/capture_homepage.mjs "<target_homepage_url from page1 CSV>" demo_pdf/<prospect>/build/homepage.png

View the PNG (Read tool). It must show the real homepage — not a blank
page, error, or consent wall. If blocked, retry once; if still blocked,
stop and report (troubleshooting: some sites require
`chromium.launch({ headless: false })` — edit nothing, just report).

### 4. Fill the templates

Copy `templates/tokens.css`, `page1.html`, `page2.html`, `page3.html`
into `demo_pdf/<prospect>/build/`. Fill the copies:

- `{{NAME}}` placeholders: replace with data. HTML-escape `&`, `<`, `>`
  in all CSV text.
- `<!-- BEGIN:block -->…<!-- END:block -->`: duplicate the enclosed
  markup once per data row (per the note in each block comment), then
  remove the marker comments.
- **Page 1 answer conversion** (`answer_text` → `{{ANSWER_HTML}}`):
  - Split into paragraphs on blank lines; lines starting `- ` become
    `<ul><li>` groups. Bold section headers like `Main steps (from the
    posts)` become `<p><strong>…</strong></p>`.
  - Replace each `[Cite](URL)` with `<sup class="cite">N</sup>` where N
    is that URL's 1-based index in the lead's unique-URL list (order of
    first appearance). Build one `source_chip` per unique URL:
    `{{CITE_NUMBER}}` = N, `{{CITE_LABEL}}` = the URL's slug, hyphens →
    spaces, `.html` stripped, sentence case, truncated to ~55 chars with
    `…`.
  - Render the answer IN FULL — no truncation in lead rows.
- **Page 1 widget preview**: `{{WIDGET_QUESTION}}` = lead 1's question;
  `{{WIDGET_ANSWER_PREVIEW}}` = lead 1's first 1-2 paragraphs as `<p>`s
  (cite links stripped) — CSS crops it with a fade; give it enough text
  to overflow the 150px max-height so the fade reads naturally.
- **Page 2**: 5 `nav_item`s in `nav_order` (only the featured row keeps
  class `featured`; bar widths 62/48/41/33/27% top to bottom); featured
  detail from the featured row's `question_1..3` and `source_post_titles`
  (`; `-split).
- **Page 3**: featured gap only. `{{POST_COUNT}}` = number of CSV rows
  for that gap, as a digit. Questions from `reader_questions`
  (pipe-split). One `source_post` per row in `source_post_order`.
  `{{BRIDGE_LINE}}` from the CSV, verbatim.

### 5. Render

    node .claude/skills/demo-pdf/scripts/render_pdf.mjs demo_pdf/<prospect>/demo.pdf demo_pdf/<prospect>/build/page1.html demo_pdf/<prospect>/build/page2.html demo_pdf/<prospect>/build/page3.html

### 6. QA (all must pass before you call it done)

Read `demo.pdf` (Read tool) and check every page:

- [ ] No `�` anywhere (also `grep -c '�'` each filled HTML → 0).
- [ ] Every cluster label matches its CSV `cluster_name` exactly (diff by
      eye against the csv_to_json output).
- [ ] Page 1: real homepage visible; widget floats bottom-right; 3 lead
      cards; every cite superscript has a matching numbered source chip.
- [ ] Page 2: 5 clusters, correct featured one, all numbers `X`/`+XX%`.
- [ ] Page 3: single gap card, plain-text `Covers:` lines, bridge line
      closes the card, no CTA.
- [ ] No clipped text, no overflowing boxes, no blank regions.
- [ ] Footer disclosure ("demo mockup — the widget is not installed…")
      present on page 1.

Fix and re-render until all boxes check. Report the QA result explicitly.
