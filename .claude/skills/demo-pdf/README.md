# demo-pdf — installation guide

An agent skill for Claude Code. It turns a folder of prospect CSVs into a
sales demo PDF that simulates the Visitor Intelligence chat widget installed
on that prospect's own website: one page per reader question (the widget
floating over their real homepage, answering with citations back to their
posts), then an intent-clusters page and a scattered-content-gap page.

This file is for the **human installing the skill**. Once installed, the
agent follows `SKILL.md`.

---

## Requirements

| Requirement | Version | Notes |
| --- | --- | --- |
| Node.js | 18 or newer | 22+ recommended |
| npm | any current | ships with Node |
| poppler (`pdftoppm`) | any | lets the agent read the finished PDF to QA it |
| Disk | ~400 MB | mostly the Chromium download |

Everything else installs locally into the skill folder.

---

## Install

### 1. Put the folder where Claude Code will find it

Pick one:

**Personal skill** — available in every project on this machine:

```bash
mkdir -p ~/.claude/skills
cp -R demo-pdf ~/.claude/skills/
```

**Project skill** — available only inside one repo, and shareable with the
team through that repo:

```bash
mkdir -p /path/to/your-project/.claude/skills
cp -R demo-pdf /path/to/your-project/.claude/skills/
```

If you received a `demo-pdf.zip`, `unzip demo-pdf.zip` first — it expands to
a `demo-pdf/` folder.

### 2. Install its dependencies

```bash
cd ~/.claude/skills/demo-pdf      # or your project's .claude/skills/demo-pdf
npm run setup
```

`npm run setup` installs `playwright` + `pdf-lib` into the skill's own
`node_modules` and downloads the matching Chromium build. The skill carries
its own dependencies, so it does not matter what the surrounding project
is written in — or whether there is one.

### 3. Install poppler (for the QA step)

```bash
brew install poppler              # macOS
sudo apt-get install poppler-utils # Debian / Ubuntu
```

Without it the PDF still renders, but the agent cannot open the result to
check it, and the skill's final QA pass becomes unverifiable.

### 4. Verify

```bash
npm run preflight
```

Expected:

```
demo-pdf preflight — skill at /Users/you/.claude/skills/demo-pdf

  ✓ Node.js              v22.x.x
  ✓ playwright           resolved
  ✓ pdf-lib              resolved
  ✓ Chromium             launches (149.x)
  ✓ pdftoppm (poppler)   on PATH

Ready.
```

Any `✗` line prints the exact command that fixes it. Exit code is 0 only
when nothing is blocking.

---

## Using it

Start Claude Code in the directory that contains your `demo_pdf/` folder and
ask for a demo PDF, naming the prospect folder and the site author's first
name:

```
Build the demo PDF for demo_pdf/acmeblog — the author is Dana.
```

The agent reads `SKILL.md` and runs the pipeline: parse CSVs → verify every
source URL → screenshot the homepage → fill the HTML templates → render and
merge the PDF → visually QA every page. Output lands at
`demo_pdf/<prospect>/demo.pdf`.

### Input files the agent expects

Create `demo_pdf/<prospect>/` containing:

| File | Contents |
| --- | --- |
| `page1_leads.csv` | One row per reader question: `cluster_name`, `lead_order`, `question`, `answer_text` (with `[Cite](url)` markers), `source_post_urls`, `target_homepage_url` |
| `page2_clusters.csv` | Five intent clusters: `cluster_name`, `is_featured`, `nav_order`, `question_1..3`, `source_post_titles`, `source_post_urls` |
| `page3_scattered_content_gaps.csv` | Gap rows keyed by `gap_id`: `gap_title`, `reader_questions` (pipe-separated), `source_post_order`, `source_post_title`, `source_post_url`, `source_post_coverage`, `bridge_line` |

Every URL in these files is checked over the network before anything
renders. A single dead link stops the run — by design, so a prospect never
receives a deck with a broken citation.

---

## What the skill will not do

These are enforced rules in `SKILL.md`, not preferences:

- Never invents or substitutes a URL, and never renders if one fails to resolve
- Never renames a cluster label — they render verbatim from the CSV
- Never invents metrics; intent-cluster volumes always render as `X` / `+XX%`
- Never rephrases a reader question
- Never ships a placeholder or stock background if the homepage screenshot fails
- Keeps the deck honest: the copy says what the site looks like *when* the
  widget is installed, and every question page carries a "demo mockup"
  footer

---

## Troubleshooting

**`Cannot find package 'playwright'`** — dependencies were never installed,
or you copied only some files. Run `npm run setup` in the skill folder.

**Chromium fails to launch** — run `npx playwright install chromium` from
the skill folder. On Linux you may also need system libraries:
`npx playwright install-deps chromium`.

**The homepage screenshot is blank, or shows a consent wall** — some sites
block headless browsers. The skill stops and reports rather than shipping a
bad background. Editing `capture_homepage.mjs` to use
`chromium.launch({ headless: false })` usually gets past it.

**Gray slab covering the screenshot in Preview** — Apple's PDF renderer
draws CSS `box-shadow` as a solid gray rectangle. The templates deliberately
contain no box-shadows; if you add one, this comes back. Check any rendered
PDF in Preview or Quick Look, not just a browser.

**The agent didn't pick up the skill** — confirm `SKILL.md` sits directly
inside `demo-pdf/` (not nested a level deeper), then restart Claude Code so
it rescans the skills directory.

---

## Layout

```
demo-pdf/
├── SKILL.md                     the agent's process, rules, and QA checklist
├── README.md                    this file
├── package.json                 the skill's own dependencies
├── scripts/
│   ├── preflight.mjs            environment check
│   ├── csv_to_json.mjs          tolerant CSV reader (handles mixed encodings)
│   ├── verify_urls.mjs          source URL gate — fails the run on any dead link
│   ├── capture_homepage.mjs     full-page homepage screenshot
│   └── render_pdf.mjs           HTML → tall PDF pages, merged
├── templates/
│   ├── tokens.css               shared palette
│   ├── question-page.html       one reader question simulated on the homepage
│   ├── page2.html               intent clusters
│   └── page3.html               scattered content gap
└── tests/                       node --test suite (npm test)
```

Run the test suite any time with `npm test` from the skill folder.
