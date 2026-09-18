# FINAL_PORTFOLIO_V1_3_EDITORIAL_RELEASE_REPORT

**Project:** Hao Lei Personal AI Lab — `https://haoleilab.com`
**Repository:** `huangdi97/huangdi97.github.io`
**Release:** v1.3 — Editorial Enrichment / Homepage Truth / TaiYi Status Correction
**Date:** 2026-09-18
**Commit:** `4219e87`
**Status:** **PRODUCTION_READY**

---

## 1. Final status

v1.2 shipped a site whose identity, privacy and evidence contracts held. v1.3
keeps every one of those and fixes the single thing that was still untrue: the
site described 太一·灵境 (TaiYi Lingjing) as a system that had been partly built.

It has not been built. Engineering implementation has not started. There is no
repository, no prototype, no deployment and no validation result.

v1.3 states that in every place the project appears — frontmatter, case-study
body, evidence table, homepage and résumé — and replaces its position in
Selected Work with two projects that carry real, inspectable engineering
evidence.

Final status: **PRODUCTION_READY**. The site is live, the CI gate is green, and
no claim on any page exceeds what a visitor can check.

---

## 2. TaiYi status correction (Clauses 1–7, 39)

The correction was made at the source of truth and propagated outward. Every
surface reads from `evidence.ts`, so a single edit reaches the card, the case
study and the tests.

### 2.1 New official status

| Surface | EN | ZH |
| --- | --- | --- |
| Frontmatter `status` | `Research` | `Research` |
| Reality headline | `Concept / Not Started` | `概念设计 / 尚未开始` |
| Category | `AI-native Scientific Discovery · Research Concept` | 同 |
| Public code | `None — nothing published` | `无 — 未公开发布` |

The description states plainly, in both languages, that this is a concept and
research direction and that engineering implementation has not started.

### 2.2 Case-study chapters

The old structure (which ended in Engineering, Validation Results and What I
Learned) read as a build report no matter how the prose was worded. It was
replaced with a structure that cannot:

Overview · Motivation · Research Questions · Proposed Discovery Loop ·
Proposed Architecture · Design Principles · What Must Be Validated ·
First Implementation Milestone · Current Status · Next

All five subsystems (Bio / Discovery / Experiment / Evidence / Human) now speak
in `proposed / planned / would / intended` (EN) and `拟 / 计划 / 目标 / 设想`
(ZH). No subsystem is described as something the system does.

The **Current Status** chapter states, verbatim, that implementation has not
started; that there is no repository, prototype, deployment or validation
result; and that the page describes an intended system rather than an
implemented one.

### 2.3 Banned vocabulary, verified absent

`partial implementation`, `prototype implementation`, `implemented subsystem`,
`working prototype`, `validated architecture`, `current system`, `lessons
learned from implementation`, `Research Prototype`, `Active Development`,
`production-ready`, `95%` — a repository-wide grep returns nothing, and an
automated test asserts the absence on the rendered page.

### 2.4 Evidence table

| Row | State |
| --- | --- |
| Research framing | DESIGNED |
| Proposed architecture | DESIGNED |
| Discovery loop | DESIGNED |
| Engineering implementation | PLANNED |
| Prototype | PLANNED |
| Validation | PLANNED |
| Public repository | NOT PUBLIC |

**No row uses `PARTIAL`.** The state is reserved for work that is genuinely
partly built; using it here would have been the same overclaim in a smaller
font. A test asserts that no `data-state="partial"` badge renders on this page.

### 2.5 Where it is discoverable

Removed from Selected Work (`featured: false`). It remains reachable from
Projects, from the `/research/` page and from the homepage Research section
under **Concepts / Exploring**. It is never rendered at the same completion
level as a real project.

---

## 3. Homepage hierarchy (Clauses 9–27)

### 3.1 Final section order

Header · Hero · **NOW** · Selected Work · **BACKGROUND** · Research (grouped) ·
How I Work (rail) · Open Source · About / Contact · Footer

Nine content sections instead of seven, and each one is shorter than what it
replaced. The page gained information without gaining visual complexity.

### 3.2 Hero — unchanged

`HAO LEI` / `AI × Life Science × Agents` / the existing statement. Left-aligned,
large whitespace, light SVG system diagram, no avatar, no background video.
The only change is the removal of the `Home` nav item that was already absent in
v1.2 — the hero itself is byte-identical to the v1.2 source.

### 3.3 NOW / CURRENT FOCUS (Clauses 10–11)

A light horizontal rail between the hero and Selected Work. Desktop height
lands inside the 100–160px budget (measured 148px at 1440px). Three entries,
single column below 760px.

| Entry | Status |
| --- | --- |
| ZhiShen · WenNian | Active Development |
| HyCell | Research Prototype |
| Morn | Agent Systems |

Sourced entirely from the new `src/data/now.ts`. No copy is hard-coded in the
component; `updatedAt` is hand-reviewed (2026.09), never derived from Git
timestamps, because a commit date is not a review date.

### 3.4 Selected Work (Clauses 8, 12–14)

New order, chosen so the five featured projects are ones whose state a visitor
can check:

| # | Project | Proof line |
| --- | --- | --- |
| 01 | ZhiShen · WenNian | Public repository · Open-source MVP · Active development |
| 02 | HyCell | Public repository · Research prototype · Real-data pipeline |
| 03 | Morn | Public repository · Rust workspace · Desktop application |
| 04 | BioPulse | Public repository · MIT license · Agent-native workbench |
| 05 | PDIG | Canonical specification · Cross-platform design · Nothing published |

**Proof lines** are mono, 11px, uppercase, dot-separated and deliberately
quieter than the reality pill above them. Every token is a checkable fact. None
is a percentage, a ranking or a marketing adjective — asserted by test.

### 3.5 BACKGROUND (Clauses 15–17)

Titled **From biology to AI systems** / **从生命科学到 AI 系统**. Two
paragraphs, then a five-node timeline: Life Science → Wet Lab → Computational
Biology → AI Systems → Agents. Horizontal rail on desktop, vertical list with
dots below 900px. No photographs, no generated illustrations.

Every node maps to an owner-confirmed résumé fact already published elsewhere on
the site (education.ts, researchRecord.ts, evidence.ts). No domain was added for
narrative warmth. The closing line — "The portability is method, not domain" —
is the section's whole point and is not an embellishment.

### 3.6 Research grouping (Clauses 18–19)

Split into two tiers, driven by a `tier` field on `ResearchArea` documented as a
truth claim rather than a style choice.

- **Active / Building** — AI for Scientific Discovery's sibling directions tied
  to inspectable code: Agentic Systems, AI for Health & Computational Biology,
  Simulation, Local-first Personal Intelligence.
- **Concepts / Exploring** — AI for Scientific Discovery, whose target system is
  TaiYi.

Each linked project's state is read from `evidence.ts` at render time, so the
row for TaiYi reads `CONCEPT / NOT STARTED` and cannot drift into a stronger
claim than the project's own truth table allows.

### 3.7 How I Work (Clause 21)

The vertical timeline was replaced on the homepage by a compact process rail:
one row on desktop (six columns), three columns at 700px, two on mobile. The
full vertical timeline remains on the About page, where there is room for it.

### 3.8 Open Source (Clauses 22–23)

A hand-assigned `role` was added: FLAGSHIP, RESEARCH, AGENT SYSTEM or TOOLING.
It is never inferred from language or from commit volume. Star counts,
followers, total commits and LOC remain absent.

### 3.9 About CTA (Clause 24)

Retitled **A LITTLE MORE CONTEXT**, carrying the name, the one-line context
("AI systems engineer with a life-science and computational biology
background.") and four links: Gmail, QQ Mail, GitHub, Résumé.

### 3.10 The dark section — considered and rejected (Clause 20)

A single `#111111` / `#F5F5F5` CURRENTLY BUILDING block was drafted and dropped.
The NOW strip and the Research tiers already answer "what is happening now" in
two places, and a third answer at full contrast made the page read as busier
without being more informative. Clause 20 explicitly permits this outcome:
simplicity wins.

---

## 4. Reading-time outcomes (Clause 26)

| Budget | What the page delivers |
| --- | --- |
| 10s | Name, `AI × Life Science × Agents`, statement, three actions |
| 30s | ZhiShen · WenNian, HyCell, Morn, BioPulse with proof lines |
| 60s | Life-science background, computational biology, complete AI systems, real public engineering |
| 3min | Decide which project to open, whether to read the résumé, whether to get in touch |

---

## 5. Résumé changes (Clauses 32–33)

TaiYi was removed from Selected Projects in both résumés. Its entry described
"an agentic discovery platform" — a claim about a system that does not exist,
inside a document a recruiter reads as a record of work completed.

The remaining projects are split per variant by slug, so one project has one
wording and two reading orders:

| Variant | Selected Projects order |
| --- | --- |
| AI / Agent | Morn · BioPulse · ZhiShen · WenNian · HyCell |
| AI × Life Science | ZhiShen · WenNian · HyCell · BioPulse · Morn |

Morn and BioPulse were added to the résumé data with factual one-line
descriptions drawn from their public repositories. Nothing in either résumé
asserts a state the site does not also assert.

---

## 6. PDF regeneration and re-audit (Clause 34)

Both PDFs were regenerated through `npm run resume:pdf`, which builds, serves
`dist`, prints `/zh/resume/` with Playwright, reorders sections and re-selects
projects per variant, then rewrites `/Info` metadata with `pdf-lib`.

Re-audit results, from **real text extraction** (`pdfjs-dist/legacy`), not from
source data:

| Assertion | AI / Agent | AI × Life Science |
| --- | --- | --- |
| `h30441854@gmail.com` present | ✅ | ✅ |
| `304418554@qq.com` present | ✅ | ✅ |
| Phone number absent | ✅ | ✅ |
| `@163.com` address absent | ✅ | ✅ |
| TaiYi absent from Selected Projects | ✅ | ✅ |
| Morn and BioPulse present | ✅ | ✅ |
| Project order matches the variant | ✅ | ✅ |
| Title `Hao Lei — Resume` | ✅ | ✅ |
| Author `Hao Lei` | ✅ | ✅ |
| Pages | 3 | 4 |

Both PDFs now also carry a test in the Playwright suite that extracts the
rendered text and asserts each of the above — so a future edit that reintroduces
either the project or a private detail fails the gate rather than shipping.

---

## 7. Fact audit (Clause 39)

A site-wide pass over every mention of TaiYi, Pet AI Health and PDIG:

- **TaiYi** — all implementation language removed. Concept only.
- **Pet AI Health** — already stated "this is product and system design, not a
  released product". Left as is; no public repository, no code link, `featured`
  set to `false` so it no longer occupies a Selected Work slot.
- **PDIG** — already stated "spec-level work, no public artifact to inspect".
  Left as is; its proof line now says `Nothing published` in plain words.

No other "already implemented" wording was found that could not be confirmed
against a public artifact.

---

## 8. Enrichment without weakening Evidence Discipline (Clause 38)

The risk in an enrichment pass is that richer prose quietly becomes stronger
prose. Three mechanisms prevent it:

1. **Single source.** `evidence.ts` is the only place a project's state is
   written. Cards, case studies and the research rows all read it.
2. **Hand-transcribed snapshots.** Morn's and BioPulse's rows came from GitHub
   API reads on 2026-09-18 — tree listings and README text — and include
   negatives: Morn's licence is `partial` because the README claims
   MIT OR Apache-2.0 while GitHub detects no LICENSE file; BioPulse has an
   explicit row stating no accuracy benchmark exists.
3. **Tests that fail on overclaim.** The suite asserts the absence of banned
   phrases, the absence of `PARTIAL` on TaiYi, and the presence of the
   `NOT STARTED` labels.

Evidence discipline is measurably stricter than v1.2: 396 identity assertions
(up from 340) and 186 Playwright tests (up from 152).

---

## 9. Performance (Clauses 27–31, 44–46)

- **No second accent colour.** The palette is unchanged: `#F7F7F4` canvas,
  `#111` ink, `#666` muted, `#315CFF` accent.
- **No third-party scripts, no web fonts, no large hero images, no blocking
  JS.** The homepage uses four lines of inline JS for the project filter and the
  mobile nav; nothing was added by v1.3.
- **HTML grew, JS did not.** More sections were added as semantic HTML
  (`<section aria-labelledby>`, `<ol>`, `<dl>`); the only new interactive
  surface is the desktop-only sticky contents column, which is pure CSS.
- **Typography was not shrunk.** Body sizes are unchanged; density came from
  structure, not from smaller type.
- **Mobile verified at 390px** across NOW, Background timeline, Selected Work,
  Research grouping, process rail and CTA. Automated overflow assertions pass at
  375 / 390 / 430 / 768 / 1024 / 1280 / 1920px on five routes.

---

## 10. Tests (Clauses 41–43)

New assertions added to `tests/site.spec.ts`:

- TaiYi is not featured on the homepage and has no link from Selected Work.
- The TaiYi case study states `Concept / Not Started` and "not started".
- No banned phrase renders on the TaiYi page, in either language
  (`部分实现 / 已完成实现 / 系统已经实现` in Chinese).
- The TaiYi evidence table renders no `partial` badge and at least one
  `planned` badge.
- NOW exists with exactly three entries; Background exists with five nodes.
- Selected Work has exactly five cards in the confirmed order.
- Research is split into two labelled tiers, and the Concepts tier names TaiYi
  as `Concept / Not Started`.
- Every featured card carries a proof line with no metric-like content.
- The About CTA carries the eyebrow, the name, the context line and all four
  links.
- Both résumés' Selected Projects exclude TaiYi and include Morn and BioPulse.
- Seven project cards render on `/projects/`, and the Infrastructure filter
  returns PDIG and Morn.

New assertions added to `tests/identity.spec.ts`:

- For each PDF: both public addresses present, phone absent, `163` absent,
  TaiYi absent from Selected Projects, correct metadata, and correct project
  order — all from extracted text.

**Result: 186 passed, 2 skipped (mobile-only guards), 0 failed.**

---

## 11. CI gate (Clause 46)

`.github/workflows/deploy.yml` is unchanged and nothing was lowered:

```
checkout → node 22 → npm ci → lint → typecheck → build
  → verify → identity → playwright install → test
  → configure pages → upload dist → deploy
```

Every step remains blocking. v1.3 passes the same gate v1.2 passed.

---

## 12. Deployment

- **Commit:** `4219e87`
- **Branch:** `main`
- **Live URL:** `https://haoleilab.com`
- **Résumés:** `https://haoleilab.com/resume/Hao-Lei-AI-Agent-Resume-ZH.pdf`
  and `https://haoleilab.com/resume/Hao-Lei-AI-LifeScience-Resume-ZH.pdf`

---

## 13. Screenshots reviewed (Clause 47)

| Surface | Viewport | Finding |
| --- | --- | --- |
| Home EN | 1440×900 | Hero intact; NOW rail 148px; five proofs render; no overflow |
| Home ZH | 1440×900 | Section order matches; Chinese labels wrap cleanly |
| Home EN | 390×844 | NOW stacks to one column; timeline goes vertical; no overflow |
| Home ZH | 390×844 | Same; long Chinese titles wrap without clipping |
| TaiYi EN | 1440×900 | `CONCEPT / NOT STARTED` pill visible; PLANNED rows render |
| TaiYi ZH | 1440×900 | 概念设计 / 尚未开始 renders; no partial badge |
| Résumé EN | 900×1200 | TaiYi gone; four projects present |
| Résumé ZH | 900×1200 | Section order intact; contact block correct |
| PDF AI / Agent | 3 pages | Correct order, metadata, no private data |
| PDF AI × Life Science | 4 pages | Correct order, metadata, no private data |

Zero horizontal overflow measured on all ten captures.

---

## 14. Final judgement (Clause 50)

The page does not read as a template — the type, the density and the
proof-line/pill pairing are specific to this body of work. It does not read as a
bloated résumé — the résumé is a separate document and the homepage is
structured by project state rather than by chronology. And it no longer reads as
an "AI concept collection": the concepts are quarantined in their own tier,
labelled as not started, and outnumbered by projects with public code.

What it reads as is one person continuously building real AI, life-science and
agent systems — with the honesty of the labels being the thing that makes the
claim credible.

Compared with v1.2: **more information, the same visual complexity, strictly
more accurate facts.**
