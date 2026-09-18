# FINAL PORTFOLIO — V1.6 HOMEPAGE REDUCTION REPORT

**Release:** v1.6 — Homepage Reduction + Global Scientific Canvas + Theme-consistent Footer
**Canonical:** https://haoleilab.com
**Repository:** huangdi97/huangdi97.github.io
**Baseline commit:** `8443f38` (v1.5 sample: scientific canvas + minimal project posters)
**Round type:** REDUCTION / BACKGROUND REBUILD / VISUAL HIERARCHY CORRECTION
**Status:** PRODUCTION_READY

---

## 0. Verdict

All three acceptance questions from §91 of the brief are answered **YES**:

| # | Question | Answer | Evidence |
|---|---|---|---|
| 1 | Is the homepage shorter and easier to scan? | **YES** | 15138px → 7279px at 1440px, −51.9% (§10) |
| 2 | Without hunting, can you feel mathematics, biology and AI in the background? | **YES** | 8 macro plaques, all three motif classes, macro layer at 0.10–0.16 (§6) |
| 3 | On Paper / White, does the page still drop into a black footer? | **NO — fixed** | `night` class removed; footer luminance 0.855 on paper (§8) |

No new homepage section was added. Two homepage sections were merged, six were removed and relocated.

---

## 1. Homepage before / after structure

**Before (v1.5) — 12 blocks + footer, 15138px (zh) / 16312px (en):**

| # | Block |
|---|---|
| 1 | Hero |
| 2 | NOW strip |
| 3 | Selected Work — 5 projects |
| 4 | Selected Artifacts — inverted evidence room |
| 5 | Background + BackgroundTimeline |
| 6 | Mathematical Biology — 4 figures |
| 7 | Equation Note |
| 8 | Research — active + concept tiers |
| 9 | How I Work — 6-stage rail |
| 10 | Open Source & Engineering — full table |
| 11 | Lab Notes — 3 entries |
| 12 | About / Contact — CTA card |
| — | Footer (forced `night`) |

**After (v1.6) — 5 blocks + footer, 7279px (zh) / 7805px (en):**

| # | Block | Question it answers |
|---|---|---|
| 1 | Hero | Who are you? |
| 2 | Selected Work — 4 projects | What have you built? |
| 3 | Mathematics × Biology × AI | How do you read a problem? |
| 4 | Research & Notes — 3 rows | What are you thinking about now? |
| 5 | About / Contact — open band | How do I find out more? |
| — | Footer (theme-continuous) | Continuity, not a section |

Verified structurally by `tests/site.spec.ts` → `homepage is reduced to five content areas` (`main > section` count = 5) and by `scripts/check-visual-system.mjs`, which now fails the build if `#artifacts`, the NOW strip or the open-source table reappear on `/`.

---

## 2. Removed sections

| Section | Reason |
|---|---|
| **NOW strip** | Selected Work already states what is being built; the strip repeated three project names. |
| **Selected Artifacts** | The homepage was answering "show me the evidence" as well as "what have you built". §9: one page, one question. |
| **Background (as a section)** | Merged into Mathematics × Biology × AI — both told the same story. |
| **Mathematical Biology (4-figure form)** | Reduced to one signature figure on the homepage. |
| **Equation Note (standalone)** | The expression now appears once, fused into the merged section. |
| **Research (full tiered list)** | Replaced by a three-row preview. |
| **How I Work (6-stage rail)** | An interview answer, not a homepage block. |
| **Open Source (full repo table)** | A repository table is evidence; evidence belongs with the case studies. |
| **Lab Notes (full log)** | Replaced by a three-row preview. |
| **About / Contact CTA card** | Replaced by an open, surface-free band. |

Removed from the homepage is not removed from the site. Every block above still renders — see §3.

---

## 3. Relocated content

| Content | New home | Route |
|---|---|---|
| NOW strip | `/projects` (above the grid) | both locales |
| Selected Artifacts (inverted evidence room) | `/projects` (after the grid) | both locales |
| Open Source table | `/projects` (extracted to `OpenSourceList.astro`) | both locales |
| BackgroundTimeline (5-node path) | `/about`, inside "Where this comes from" | both locales |
| ProcessRail / How I Work | already on `/about` as the approach timeline | both locales |
| Mathematical Biology — full figure set | `/research` | both locales |
| Equation Note | `/research` | both locales |
| Lab Notes — full log | `/research` | both locales |
| Research areas — full tiered list | `/research` (tiers preserved, see below) | both locales |
| PDIG project | `/projects` — `featured: false` in both locales | both locales |
| TaiYi Lingjing | `/research` concept tier + `/projects/taiyi-lingjing/` | both locales |

### 3.1 A truth claim that nearly got flattened

The active/concept **tier split** lived only in the homepage markup. Moving the research list to `/research` without it would have rendered a written concept as the twin of a direction tied to inspectable code — exactly what `src/data/research.ts` says must never happen.

Fixed by grouping `/research` into the same two labelled tiers, **and** by making `ResearchArea.astro` print each related project's own evidence headline. TaiYi Lingjing now reads `Concept / Not Started` / `概念设计 / 尚未开始` on the link itself, read from `evidence.ts` rather than written in the component. This is an improvement over v1.5, where that state appeared only on the homepage.

`NowStrip`, `BackgroundTimeline`, `SelectedArtifacts`, `ProcessRail`, `LabNotes`, `EquationNote`, `MathematicalBiology` and `ResearchRow` were all kept as components — nothing was deleted to reduce the homepage.

---

## 4. Global Scientific Canvas

**Files**

| File | Role |
|---|---|
| `src/components/GlobalScientificCanvas.astro` | page-level wrapper; `data-global-scientific-canvas`, `aria-hidden`, composes the two layers |
| `src/components/MacroScienceLayer.astro` | Layer A — 8 macro plaques, 280–800px |
| `src/components/MicroNotebookLayer.astro` | Layer B — 14 notebook marks |

**Placement contract**

```
body { position: relative }
  └── <GlobalScientificCanvas />   position: absolute; inset: 0; z-index: -1
  ├── <Header />
  ├── <main>…</main>
  └── <Footer />
```

Mounted once in `BaseLayout.astro`, so the field runs behind every route from the first line to the last. `position: absolute` (not `fixed`) is deliberate: the plaques stay attached to the sections they sit behind and scroll with the document. A fixed layer would read as wallpaper (§39).

`ScientificAmbient.astro` (v1.4.1, section-scoped, 2.5–5.5%) was **deleted**; its mark vocabulary was carried into `MicroNotebookLayer.astro` rather than lost (§26). `ScientificCanvas.astro` and the two `/v15-sample` routes were also removed — see §14.3 for why.

**Discipline, enforced by `scripts/check-visual-system.mjs`:**

- inline SVG only — no `<canvas>`, no WebGL, no three.js, no `<img>`, no external image, no `fetch`;
- `aria-hidden="true"`, `pointer-events: none`, `z-index: -1`;
- every stroke and fill resolves to a CSS custom property;
- no component may hard-code an opacity — every `opacity:` must read a `--science-*` token;
- `.global-science` must be `position: absolute`, `overflow: hidden`, `pointer-events: none`, `z-index: -1`.

---

## 5. Macro / Micro layers

### Layer A — Macro Science Forms (8 plaques)

| # | Kind | Motif | Desktop placement | 390px |
|---|---|---|---|---|
| 1 | math | Bayesian notation `P(H \| D) ∝ P(D \| H) P(H)` | top 1.1%, cropped left | keep — re-placed inside the gutter |
| 2 | biology | cell state landscape: contours + trajectory + target | top 2.6%, cropped right | keep — moved below the hero copy |
| 3 | biology | `gene → pathway → phenotype` cascade | top 26%, left | drop |
| 4 | biology | expression matrix fragment (9×7) + `X ∈ ℝⁿˣᵖ` | top 30%, right | drop |
| 5 | math | state-space vector field + phase trajectory | top 46%, left | drop |
| 6 | AI | sparse agent graph, 10 nodes, 2 links each | top 60%, right | keep |
| 7 | AI | latent state transition `zₜ → zₜ₊₁` with `aₜ` | top 73%, left | drop |
| 8 | math | probability curve + `∂x/∂t = f(x, u, x, θ)` | top 87%, right | keep |

**Motif ratio: mathematics 3 / biology 3 / AI 2** — 37.5 / 37.5 / 25. Biology is three distinct motifs, so the field can never read as "only formulas"; AI is a graph and a state transition, never a robot, a brain or a circuit head (the gate fails the build on that vocabulary).

### Layer B — Micro Notebook Marks (14 marks)

`∇L(θ)`, `θ ∈ ℝⁿ`, `Σ`, `X ∈ ℝⁿˣᵖ`, `P(H | D)`, `zₜ → zₜ₊₁`, two coordinate/axis fragments, a `t → t + 1` tick rail, an `x(t)` tick rail, two matrix fragments (3×3 and 1×4), two small graph links, and a bracket pair with `∂/∂t`.

Inked at `--science-micro` — roughly a third of the macro layer — so it reads as pencil in the margin rather than a competing composition.

---

## 6. Background visibility

**Theme tokens** (`src/styles/global.css`), four weights, one home:

| Token | Paper | White | Night |
|---|---|---|---|
| `--science-macro` (large line art) | 0.12 | 0.10 | 0.16 |
| `--science-notation` (derived: `calc(macro × 0.62)`) | 0.0744 | 0.0620 | 0.0992 |
| `--science-micro` (notebook marks) | 0.045 | 0.035 | 0.06 |
| `--science-grid` (rules and ticks) | 0.035 | 0.028 | 0.05 |
| `--science-accent` (the single blue) | 0.09 | 0.075 | 0.13 |

All five measured from the running build (`npm run qa:canvas`), not restated from the stylesheet.

**Why the numbers moved.** v1.4/v1.5 sat at 0.025–0.055 and the owner could not see it. §30 asked for 0.08–0.18 on the macro layer. The gate now enforces a **floor as well as a ceiling**: too faint fails exactly like too loud. Notation is pinned at 0.62 × macro so a formula never out-shouts the composition around it, and grid is pinned below micro so a rule is never the loudest mark on the page.

**Mark budget**

| | Desktop | 390px |
|---|---|---|
| Macro plaques | 8 | 4 |
| Micro marks | 14 | 6 |
| Total | 22 | 10 (−54.5%) |
| Kinds present | math 3 / biology 3 / AI 2 | math 2 / biology 1 / AI 1 |

No element is `display: none` on mobile for the whole layer — the layer is re-chosen, not switched off (§82).

---

## 7. Paper / White / Night screenshots

Captured with `npm run qa:crops` into `.qa-screens/v16/` (gitignored), at real resolution:

| Artifact | What it proves |
|---|---|
| `first-screen-paper.png` | at least three motifs identifiable without hunting, title still dominant |
| `first-screen-white.png` | white is not empty; the field reads as light grey, never as absence |
| `first-screen-night.png` | night is dark by choice and not noisy; marks legible, title dominant |
| `mid-*.png` | the field persists mid-page (vector field, trajectory, `X ∈ ℝⁿˣᵖ`) |
| `lower-*.png` | motifs land in the whitespace around Research & Notes |
| `footer-*.png` | footer continuous with the theme; scientific coda visible |
| `mobile-first-paper.png` | 390px composition; formula uncropped |
| `mobile-footer-paper.png` | mobile footer keeps language, appearance and contact |

Full-page references also captured for the record: `baseline-v15-zh-1440.png` (15138px), `v16-zh-1440.png` (7279px), `v16-zh-390.png` (7624px).

### §72 checklist

| | Check | Result |
|---|---|---|
| A | Homepage obviously shorter | PASS — −51.9% |
| B | Mathematics / biology / AI perceptible | PASS — 3 classes, 8 macro plaques |
| C | Projects still the visual subject | PASS — `#work` is 4124px of 7805px, the four cover panels dominate |
| D | Paper natural | PASS — warm paper footer, field at 0.12 |
| E | White not empty | PASS — field at 0.10, footer white |
| F | Night not messy | PASS — field at 0.16, marks subordinate |
| G | Footer connected to the current theme | PASS — same surface as the page |
| H | No sudden black block at the bottom | PASS — luminance 0.855 (paper) / 1.0 (white) |

### §67 counter-checks (the opposite failure)

- Formula more prominent than `郝磊`? **No** — notation is inked at 0.62 × macro and the title is 5.5rem of ink.
- Background like mathematics wallpaper? **No** — no tiling, no repeating pattern; eight cropped, off-centre plaques across a 7279px document.
- Looks like a quantitative-trading site? **No** — no charts-as-hero, no numbers-in-boxes, no green/red.

---

## 8. Footer redesign

**Before**

```html
<footer class="site-footer night no-print mt-auto">
```

plus `text-night-ink` / `text-night-muted` throughout and a `--artifact-*` palette in `ContactLinks`. On Paper and White the document fell into a black block the moment you stopped scrolling.

**After**

```html
<footer class="site-footer no-print mt-auto">
```

- background `transparent` — the canvas the page was drawn on continues to the last line;
- `border-top: 1px solid var(--line)`;
- text reads `var(--ink)` / `var(--muted)` / `var(--faint)`;
- **no `night` class, no `text-night-*` class anywhere**;
- one compact band: `HAO LEI` · tagline · language · appearance (inline, no popover) · contact row · copyright;
- a scientific coda above the band — `∂x/∂t` left, `gene → pathway → phenotype` centre, `z(t+1)` right, at `--science-micro` (0.045 on paper), not a dark panel.

**Theme behaviour:** Paper gets a warm-paper footer, White a white one, Night a dark one — because the *theme* is dark, not because the footer forces it (§48).

**Measured footer luminance** (`tests/theme.spec.ts` → `footer follows the theme`):

| Theme | Footer background | Effective luminance |
|---|---|---|
| paper | `transparent` → body `#f0eee8` | 0.855 |
| white | `transparent` → body `#ffffff` | 1.0 |
| night | `transparent` → body `#111210` | 0.006 |

**Contact duplication.** §84 allows either arrangement ("或者反过来"). The homepage band now shows the four entries as **labelled links only** (matching §49's sketch, which lists `Gmail / QQ / GitHub / Resume` without values); the footer is the surface that prints the addresses, so the same four values no longer appear twice inside one screen. The addresses remain the accessible name of each link (`aria-label`-equivalent via a visually-hidden value) and remain printed in full on `/about` and `/resume`. The identity discipline is untouched: every surface still renders the same array, in the same fixed order, with `data-contact-id` intact.

---

## 9. Project count

**Homepage featured projects: 4** — ZhiShen · WenNian, HyCell, Morn, BioPulse.

PDIG keeps its full case study at `/projects/pdig/`; its `featured` flag — documented in `content.config.ts` as "Homepage Selected Work membership" — is now `false` in both locales. Side effect: PDIG sorts after Pet AI Health in the `/projects` grid, since `featured` is the primary sort key. All seven projects remain on `/projects`, filterable.

TaiYi Lingjing remains `featured: false` and `status: 'Research'`, and continues to read `Concept / Not Started` — on the homepage it does not appear at all; on `/research` it sits in the concept tier; on `/projects/taiyi-lingjing/` it keeps its concept structure.

Asserted by `tests/site.spec.ts` → `lists exactly four featured projects, in the confirmed order` and `selected work never features TaiYi or PDIG`.

---

## 10. Homepage height reduction

Measured with one script, one viewport (1440×900), against a `git worktree` build of the baseline commit `8443f38`, served side by side:

| Locale | v1.5 (baseline) | v1.6 | Δ |
|---|---|---|---|
| `/zh/` | 15138px | 7279px | **−7859px, −51.9%** |
| `/` | 16312px | 7805px | **−8507px, −52.2%** |

Target was 25–40%; the result is ~52% by removing sections, not by compressing type — font sizes, line heights and spacing tokens are unchanged.

**Where the reduction came from** (`npm run qa:height`, zh):

| Block | v1.5 | v1.6 |
|---|---|---|
| Hero | 828px | 835px |
| NOW strip | 175px | — |
| Selected Work | 5014px (5 projects) | 4124px (4 projects) |
| Selected Artifacts | 2943px | — |
| Background + timeline | 883px | — |
| Mathematical Biology | 1463px | 1243px (merged) |
| Equation Note | 262px | — |
| Research | 1106px | 823px (preview) |
| How I Work | 592px | — |
| Open Source | 1046px | — |
| Lab Notes | 752px | — |
| About / Contact | 440px | 385px |
| Footer | 739px | 327px |

`#work` is now 53% of the page — projects are the subject, which is the intended hierarchy (§87).

---

## 11. Mobile

**390×844:** document 7624px (baseline 15138px at 1440; the mobile document is naturally taller because every project stacks).

- Macro plaques: 8 → 4; micro marks: 14 → 6; total 22 → 10 (−54.5%).
- All three sciences survive the reduction: math 2, biology 1, AI 1.
- **Two plaques are re-placed rather than scaled** (§40):
  - `bayes` — cropped hard by the left edge on desktop (intended). At 390px that crop cut the leading `P` and the formula read as noise, so on a phone it is set inside the gutter at 94vw. §40's "公式不能被截成乱码" is now satisfied and asserted.
  - `landscape` — moved below the hero copy, so the contour arcs never run through the hero statement.
- The rest is dropped, not shrunk — a phone gets a re-chosen composition, not a compressed desktop.
- Footer further reduced: identity, language, appearance and contact remain; the copyright line is hidden below 640px.
- No horizontal overflow at 375 / 390 / 430 / 768 / 1024 / 1280 / 1920 (existing test, still green).

---

## 12. Accessibility

- `GlobalScientificCanvas` — `aria-hidden="true"`, `pointer-events: none`, zero focusable descendants. Asserted in `tests/cover.spec.ts`.
- The canvas is `display: none` in print, so `/resume` still prints clean.
- Project illustrations keep their existing contract: `ProjectCover` is `aria-hidden`; `ConceptLoop`, the four scientific figures and `HeroSystem` carry `role="img"` + `aria-label`.
- The new footer theme control is a `menuitemradio` group with `aria-checked`, 44px targets, and no popover; the language switch and contact links keep their 44px targets.
- The homepage contact links keep their value in the accessible name while showing only the label visually (WCAG 2.5.3 Label in Name holds — the visible label is contained in the accessible name).
- Reduced motion: both drifts are switched off under `prefers-reduced-motion: reduce`, and the reduced-motion rule is declared inside the component that owns the animation.

---

## 13. Performance

- **Inline SVG only.** No `<canvas>`, no WebGL, no three.js, no `<img>`, no image file, no font, no `fetch`, no `XMLHttpRequest`, no `importScripts`. Asserted on all three canvas components.
- **Zero additional network requests.** The canvas adds markup to the HTML document and nothing else. No new CSS file, no new font, no new asset.
- **No runtime.** No client-side JavaScript is added; the two drifts are pure CSS animations on a `transform`.
- **Motion budget:** two `transform` animations, 78s, alternating, 8–11px of travel.
- The page is roughly half as tall, so the same content costs roughly half the paint on first scroll.

---

## 14. Tests

### 14.1 Result

```
289 passed, 5 skipped (1.2m)   —  desktop + mobile projects
```

The 5 skips are mobile-only tests correctly skipped on the desktop project.

### 14.2 New and rewritten assertions

| Test | What it now enforces |
|---|---|
| `site.spec.ts` → `homepage is reduced to five content areas` | `main > section` = 5; `#artifacts`, NOW strip, `.oss-list`, `ol.bt`, `ol.rail`, `aside.eq` all absent |
| `site.spec.ts` → `homepage answers each question exactly once` | `#mathbio` has 1 heading, 1 signature figure, 1 `<math>`, 3 questions; `#notes` has exactly 3 rows; `#contact` has 4 contact ids and no card background |
| `site.spec.ts` → `lists exactly four featured projects` | count = 4 and the confirmed order |
| `site.spec.ts` → `selected work never features TaiYi or PDIG` | both excluded |
| `site.spec.ts` → `research is split into active and concept tiers on /research` | tiers survived the move; TaiYi reads `Concept / Not Started` |
| `site.spec.ts` → `open source table … on /projects` | the table moved and still renders license facts |
| `site.spec.ts` → `homepage contact band …` | no CTA card (`backgroundColor` is `rgba(0,0,0,0)`), fixed contact order |
| `cover.spec.ts` → `renders an inert, document-level field` | `position: absolute`, height > 90% of the document, `pointer-events: none`, no focusable descendants |
| `cover.spec.ts` → `carries mathematics, biology and AI` | all three `data-sci-kind` classes present |
| `cover.spec.ts` → `inks the field inside the v1.6 band` | **floors and ceilings** per weight, plus the notation < macro and grid < micro hierarchy |
| `cover.spec.ts` → `a 390px screen gets fewer motifs, not a squashed desktop` | ratio ≤ 0.6, still > 0, all three kinds survive |
| `theme.spec.ts` → `footer follows the theme` | no `night` class; footer luminance > 0.6 on paper/white, < 0.06 on night; footer surface identical to the page |
| `theme.spec.ts` → `the footer keeps language, appearance and contact usable` | 1 language switch, 3 theme options, 4 contact ids, switching works from the footer |
| `artifacts.spec.ts` | all seven tests re-pointed at `/zh/projects/` |

### 14.3 Gate scripts

| Gate | Before | After |
|---|---|---|
| `verify` | passed | passed — 720 internal links, 26 pages |
| `theme` | passed | passed, 1299 checks — `ambient-base` swapped for the four `--science-*` tokens |
| `artifacts` | passed | passed, 145 checks — re-pointed at `/projects`, **plus** a new assertion that the homepage does *not* render `#artifacts` again |
| `science` | **FAILED at HEAD** | passed, 2222 checks |
| `visual` | passed (old contract) | passed, 314 checks — rewritten for the canvas |
| `identity` | passed | passed, 450 assertions |

**Two pre-existing defects found and fixed:**

1. **`npm run science` was already red at commit `8443f38`.** The v1.5 sample commit added `dx/dt = f(x, u, θ)` to `ScientificCanvas.astro`, which `/v15-sample/` rendered with no conceptual label — so `dist/v15-sample/index.html` and `dist/zh/v15-sample/index.html` failed the formula-labelling gate. The v1.5 sample shipped without running the gate.
2. **The gate required an uppercase `CONCEPTUAL` literal** while every label on the site is uppercased by `text-transform: uppercase` in CSS. It was checking the stylesheet's job. `CONCEPT_LABEL` is now case-insensitive — the label is still required, the letter case is not.

**Resolution of the v1.5 sample.** `ScientificCanvas.astro`, `src/pages/v15-sample.astro` and `src/pages/zh/v15-sample.astro` were removed, along with the now-unused `--canvas-base` / `--canvas-zone` tokens. They were a `noindex` design sample for choosing the homepage direction; v1.6 *is* that direction, shipped, and the sample carried a second, section-scoped background system alongside the new global one — exactly the duplication §22/§23 removed. Nothing else referenced them (no test, no script, no route list). All content the owner asked to preserve was relocated, not deleted (§55); this was a superseded design sample, not content.

**`visual` added to CI.** The visual gate was not part of `.github/workflows/deploy.yml`. Since it is now the gate that owns the background contract — inert, themed, in-band, all three sciences present, homepage reduced — it is wired into the pipeline as a blocking step, and the comment now lists eleven steps.

---

## 15. CI

`.github/workflows/deploy.yml` — blocking order, no deployment unless every step passes:

```
npm ci → lint → typecheck → build → verify → theme → artifacts
       → science → visual → identity → test → deploy
```

Node 22, Playwright browsers cached against the resolved `@playwright/test` version. `visual` is new in this round.

Local equivalent: `npm run gate` — passed end to end.

---

## 16. Deployment

- Static build to `dist/`, 26 pages (28 before: the two `/v15-sample/` routes removed).
- GitHub Pages via GitHub Actions on push to `main`; `CNAME` = `haoleilab.com`.
- No new runtime dependency, no new build step, no new secret.
- `npm run resume:pdf` unchanged; the résumé PDFs still verify (text privacy + metadata) in the identity gate.

---

## 17. Live URL

- https://haoleilab.com (English, `/`)
- https://haoleilab.com/zh/ (Chinese, default entry for a first-time visitor)
- https://haoleilab.com/projects/ — grid + NOW + evidence room + open source
- https://haoleilab.com/research/ — directions + full figure set + equation + notes
- https://haoleilab.com/about/ — background path + how I work + contact

---

## 18. Commit

**Baseline:** `8443f38` — v1.5 sample: scientific canvas + minimal project posters

**v1.6:** see the commit created with this report (`v1.6: homepage reduction, global scientific canvas, theme-consistent footer`).

**Files changed**

*New*
- `src/components/GlobalScientificCanvas.astro`
- `src/components/MacroScienceLayer.astro`
- `src/components/MicroNotebookLayer.astro`
- `src/components/MathematicsBiologyAI.astro`
- `src/components/ResearchNotesPreview.astro`
- `src/components/OpenSourceList.astro`
- `scripts/qa-height.mjs`, `scripts/qa-crops.mjs`, `scripts/qa-shot.mjs`, `scripts/qa-canvas-report.mjs`

*Deleted*
- `src/components/ScientificAmbient.astro`
- `src/components/ScientificCanvas.astro`
- `src/pages/v15-sample.astro`, `src/pages/zh/v15-sample.astro`

*Modified*
- `src/styles/global.css` — `body { position: relative }`, four `--science-*` tokens per theme, `.global-science` / `.sci-plaque` / four weight classes, `.vh`, print rules; `--ambient-base` / `--canvas-base` / `--canvas-zone` / `.ambient-host` removed
- `src/layouts/BaseLayout.astro` — mounts the global canvas
- `src/components/Footer.astro` — rewritten, theme-continuous
- `src/components/ContactLinks.astro` — `footer` variant replaced by `row` (theme tokens) + new `inline` variant; all `--artifact-*` colours removed
- `src/components/ThemeSwitcher.astro` — new `inline` variant for the footer
- `src/components/ResearchArea.astro` — prints each project's evidence headline
- `src/components/MathematicalBiology.astro` — `/research` only, ambient import removed
- `src/components/ProjectScientificVisual.astro` — doc reference updated
- `src/pages/index.astro`, `src/pages/zh/index.astro` — rebuilt: 5 blocks
- `src/pages/projects/index.astro`, `src/pages/zh/projects/index.astro` — NOW + evidence room + open source
- `src/pages/research.astro`, `src/pages/zh/research.astro` — tiered list + figures + equation + notes
- `src/pages/about.astro`, `src/pages/zh/about.astro` — background path rail
- `src/i18n/ui.ts` — `mbai.*`, `rnotes.*`, `home.contact.*` in both locales
- `src/content/projects/{en,zh}/pdig.md` — `featured: false`
- `tests/{site,cover,theme,artifacts}.spec.ts`
- `scripts/check-visual-system.mjs` — rewritten for the canvas contract
- `scripts/check-theme-system.mjs`, `scripts/check-artifacts.mjs`, `scripts/check-science-copy.mjs`
- `.github/workflows/deploy.yml` — `visual` added
- `package.json` — `qa:*` scripts

---

## 19. What must not happen next

The reduction is the deliverable, and reduction regresses quietly. These are the guards, in order of how early they fire:

1. `scripts/check-visual-system.mjs` fails the build if `#artifacts`, the NOW strip or the open-source table reappears on `/`.
2. `tests/site.spec.ts` fails if `main > section` exceeds 5.
3. `tests/cover.spec.ts` fails if the macro layer drops below 0.08 or the field loses a science class.
4. `tests/theme.spec.ts` fails if any `night` class returns to the footer.
5. `scripts/check-theme-system.mjs` fails if a `--science-*` token goes missing from any theme.

Adding a homepage section now requires editing at least four assertions and a gate script, which is the point.
