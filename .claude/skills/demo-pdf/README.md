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

Works on macOS, Linux, and Windows.

| Requirement | Version | Notes |
| --- | --- | --- |
| Node.js | 18 or newer | 22+ recommended. Windows: [nodejs.org](https://nodejs.org) installer, or `winget install OpenJS.NodeJS.LTS` |
| npm | any current | ships with Node |
| poppler (`pdftoppm`) | any | lets the agent read the finished PDF to QA it — see step 3 |
| Disk | ~400 MB | mostly the Chromium download |

Everything else installs locally into the skill folder.

> **Using WSL on Windows?** Treat it as Linux, not Windows: run the
> macOS/Linux commands *inside* your WSL shell, and install the skill into
> the WSL home directory (`~/.claude/skills/`), not `C:\Users\...`. Mixing
> the two sides is the most common setup mistake — a skill installed on the
> Windows side is invisible to Claude Code running in WSL.

---

## Install

### 1. Put the folder where Claude Code will find it

Two choices, on any OS:

- **Personal skill** — available in every project for your user account
- **Project skill** — lives in one repo, shared with the team through it

**macOS / Linux**

```bash
# personal
mkdir -p ~/.claude/skills
unzip demo-pdf-skill.zip -d ~/.claude/skills/

# or project
mkdir -p /path/to/your-project/.claude/skills
unzip demo-pdf-skill.zip -d /path/to/your-project/.claude/skills/
```

**Windows (PowerShell)**

```powershell
# personal
New-Item -ItemType Directory -Force "$env:USERPROFILE\.claude\skills"
Expand-Archive demo-pdf-skill.zip -DestinationPath "$env:USERPROFILE\.claude\skills" -Force

# or project
New-Item -ItemType Directory -Force "C:\path\to\your-project\.claude\skills"
Expand-Archive demo-pdf-skill.zip -DestinationPath "C:\path\to\your-project\.claude\skills" -Force
```

Either way you should end up with a `demo-pdf` folder containing `SKILL.md`
directly inside it — not nested in a second `demo-pdf` folder. (Windows
Explorer's "Extract All" sometimes adds that extra level; if it does, move
the inner folder up one.)

### 2. Install its dependencies

**macOS / Linux**

```bash
cd ~/.claude/skills/demo-pdf
npm run setup
```

**Windows (PowerShell)**

```powershell
cd "$env:USERPROFILE\.claude\skills\demo-pdf"
npm run setup
```

`npm run setup` installs `playwright` + `pdf-lib` into the skill's own
`node_modules` and downloads the matching Chromium build. The skill carries
its own dependencies, so it does not matter what the surrounding project
is written in — or whether there is one.

### 3. Install poppler (for the QA step)

**macOS**

```bash
brew install poppler
```

**Debian / Ubuntu**

```bash
sudo apt-get install poppler-utils
```

**Windows** — use whichever package manager you have:

```powershell
scoop install poppler
# or
choco install poppler
```

No package manager? Download a poppler Windows build (the commonly used one
is published at `github.com/oschwartz10612/poppler-windows/releases`),
unzip it somewhere permanent such as `C:\poppler`, then add its `bin`
folder to your PATH:

```powershell
[Environment]::SetEnvironmentVariable(
  "Path", $env:Path + ";C:\poppler\Library\bin", "User")
```

Open a new terminal afterwards so the PATH change takes effect, and confirm
with `pdftoppm -v`.

Without poppler the PDF still renders — the agent just cannot open the
result to check it, so the skill's final QA pass becomes unverifiable.

### 4. Verify

```
npm run preflight
```

Expected (paths differ per OS):

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

### 5. Restart Claude Code

So it rescans the skills directory and picks up `demo-pdf`.

---

### Alternative: upload to your Claude account

The same folder can be uploaded as a Skill to your Claude account (Claude
Desktop → Settings → Capabilities → Skills → Upload). Upload
`demo-pdf-skill.zip`; it already has the required shape — a `demo-pdf/`
folder with `SKILL.md` at its root and valid `name`/`description`
frontmatter.

**If you edit the frontmatter, keep it upload-safe.** The validator enforces
rules the local runtime does not care about:

- The `description` may not contain `<` or `>` — they are read as XML tags
  and the upload is rejected with *"SKILL.md description cannot contain XML
  tags"*. Write `demo_pdf folder`, never `demo_pdf/<prospect>/`.
- `name` must be lowercase letters, numbers, and hyphens only.
- `description` must be non-empty and at most 1024 characters.

`npm run preflight` checks all three and reports any violation, so run it
before packaging rather than finding out in the upload dialog.

**Understand the trade-off before relying on this.** An uploaded skill runs
in Claude's own sandboxed execution environment, not on your machine. This
skill's core steps need things that environment may not permit:

- **Outbound network access to the prospect's website** — required to
  screenshot their homepage and to verify every source URL. Without it the
  skill cannot do its main job.
- **A Chromium install** (~150 MB via `npx playwright install chromium`,
  plus Linux system libraries) — required to render anything at all.
- **poppler** for the QA pass.

Run `node scripts/preflight.mjs` as the first thing after uploading; it
reports exactly which of these are available. If the environment is
restricted, run the skill through **Claude Code locally** instead, where the
full pipeline is verified working. Uploading still has value for carrying
the process and templates across machines and sharing them with teammates.

To rebuild the upload package after editing the skill:

**macOS / Linux**

```bash
cd <parent of demo-pdf>
rm -f demo-pdf-skill.zip
zip -qr demo-pdf-skill.zip demo-pdf -x 'demo-pdf/node_modules/*' -x '*.DS_Store'
```

**Windows (PowerShell)** — `Compress-Archive` cannot exclude subfolders, so
stage a clean copy first:

```powershell
cd <parent of demo-pdf>
Remove-Item demo-pdf-skill.zip -ErrorAction SilentlyContinue
Remove-Item .\_pkg -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item demo-pdf .\_pkg\demo-pdf -Recurse -Exclude node_modules
Compress-Archive .\_pkg\demo-pdf demo-pdf-skill.zip
Remove-Item .\_pkg -Recurse -Force
```

Always exclude `node_modules` — it holds a platform-specific Chromium and
would be both enormous and useless on another OS. That is also why the
recipient must run `npm run setup` themselves rather than receiving your
copy of it.

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
`npx playwright install-deps chromium` (Linux only — that command does not
apply to Windows or macOS).

**Windows: `npm ... cannot be loaded because running scripts is disabled on
this system`** — PowerShell's execution policy is blocking npm's shim. Fix
it for your user account, then reopen the terminal:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Alternatively run the commands from Command Prompt (`cmd.exe`) instead of
PowerShell, where the policy does not apply.

**Windows: `pdftoppm` is installed but preflight says it is missing** — it
is not on PATH. Reopen the terminal after installing (PATH changes do not
reach already-open shells), and confirm with `pdftoppm -v`. Preflight also
reports the case where it finds poppler outside PATH, and prints the full
path it found.

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
