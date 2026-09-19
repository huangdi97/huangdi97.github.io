# V1_7_P0_VISUAL_PROTOTYPE_REPORT

**Round:** v1.7-P0 — Scientific Editorial Homepage Prototype
**Status:** `WAITING_FOR_OWNER_VISUAL_APPROVAL`
**Reviewed locale / theme:** `/zh/`, Paper, 1440px
**Baseline:** `02d42e6` (v1.6, PRODUCTION_READY)

---

## 1. Branch

```
visual-v17-scientific-editorial     22fd54c
```

Created from `main` at `02d42e6`. **Not merged to main. Not deployed.**

**One deviation:** §67 recommends the branch name `visual/v17-scientific-editorial`. The slashed form could not be created in this environment — `git branch visual/…` exits 0 and silently writes no ref (nested paths under `.git/refs/heads/` are blocked; a flat name works). The flat equivalent was used. Renaming is a one-liner once the environment allows it:

```
git branch -m visual-v17-scientific-editorial visual/v17-scientific-editorial
```

---

## 2. Files changed

**New**

| File | Role |
|---|---|
| `src/components/HeroComposition.astro` | canvas movement 1 — biology → dynamics → AI |
| `src/components/MidComposition.astro` | canvas movement 2 — measured object → computational object |
| `src/components/LowerComposition.astro` | canvas movement 3 — the drawing thinning out |
| `src/components/ProjectMosaic.astro` | the 2 × 2 editorial mosaic |
| `src/components/ProjectMosaicVisual.astro` | the four large project illustrations |
| `scripts/qa-mosaic.mjs` | card / illustration ratio audit |
| `scripts/qa-prototype-shots.mjs` | the three review screenshots |

**Deleted**

| File | Why |
|---|---|
| `src/components/MacroScienceLayer.astro` | the 8-plaque architecture §8/§9 replaced |
| `src/components/MicroNotebookLayer.astro` | same |

**Modified**

| File | Change |
|---|---|
| `src/pages/zh/index.astro`, `src/pages/index.astro` | hero rebuilt, mosaic, statement band, Research & Notes hidden, minimal footer |
| `src/components/GlobalScientificCanvas.astro` | composes three movements instead of two layers |
| `src/styles/global.css` | five weighted ink tokens + `--science-bio-ink`; `.sci-composition` replaces `.sci-plaque` |
| `src/components/MathematicsBiologyAI.astro` | research section → statement band |
| `src/components/Footer.astro` | coda removed; `minimal` prop |
| `src/layouts/BaseLayout.astro` | `minimalFooter` prop |
| `src/i18n/ui.ts` | `mbai.statement`; `work.lead` no longer says "five projects" while showing four |
| `scripts/check-visual-system.mjs` | rewritten for compositions + mosaic; now fails on any background caption |
| `scripts/check-theme-system.mjs` | five new tokens + `science-bio-ink` |
| `scripts/check-science-copy.mjs` | the formula-labelling rule no longer scans the aria-hidden background |
| `tests/{site,cover,theme,identity}.spec.ts` | re-pointed at the prototype contract |
| `.gitignore` | `.workbuddy-ai/` |

**Untouched, as required:** every project file, `evidence.ts`, résumé data, education, employment, research claims, TaiYi's `status: 'Research'` and `Concept / Not Started`, `ProjectCover.astro`, `ProjectShowcase.astro`, `ResearchNotesPreview.astro`, `HeroSystem.astro`, and every route other than the homepage.

---

## 3. Hero composition

**Before:** eyebrow, title, statement, three buttons and a capabilities rail on the left; a bordered, grid-backed `HeroSystem` figure on the right; the scientific canvas behind both. Three visual languages competing in the first screen.

**After:**

- the `HeroSystem` figure is **gone from the homepage** — no panel, no border, no grid, no box;
- the capabilities rail is gone;
- copy occupies the **left 46%** of an **82vh** band (not 100vh);
- the right half of the first screen belongs to the canvas.

Reading order is now enforced by weight rather than by boxes: **郝磊** → **AI × 生命科学 × 智能体** → the statement → the buttons → then the science on the right. Asserted in `tests/site.spec.ts` → `the hero is words and canvas, with no system figure`, which also pins the copy width under 55% and the band height between 60% and 95% of the viewport.

---

## 4. Scientific Canvas composition

**Before — eight independent plates, each with a title:** Bayes, `CELL STATE LANDSCAPE`, `gene → pathway → phenotype`, expression matrix, `state space · x(t)`, `AGENT GRAPH`, latent transition, probability curve. Read together they were figures pinned to a wall.

**After — three movements of one drawing:**

| Movement | What it draws | Where |
|---|---|---|
| **HeroComposition** | a four-level state landscape (biology) running off the right edge; one long trajectory entering from off-canvas left (dynamics); two notations at the top-left (mathematics); and the trajectory **resolving into nodes and edges** past the landscape (AI) | first screen, 96vh |
| **MidComposition** | an expression matrix fragment (biology) whose cells disperse and lose their grid, gathering again as a small latent graph (AI). One bare `X` and one `zₜ₊₁` | behind the mosaic and the band |
| **LowerComposition** | a probability curve and its axis, one dashed line leaving the curve, three nodes where it arrives. One `∇L` | near the foot, fading |

**Continuity** comes from drawings that enter and leave their own frames, not from one stretched viewBox (which would distort at every viewport). Every composition bleeds off at least one page edge.

**Captions: removed entirely.** v1.6 shipped `CELL STATE LANDSCAPE`, `AGENT GRAPH`, `state space · x(t)`, `posterior · likelihood · prior`, `cells × genes`, `ten nodes · two links each · typed hand-offs`, `expression is measured, phenotype is inferred`. All gone. Background text is now **five bare notations** — `P(H | D)`, `dx/dt`, `X`, `zₜ₊₁`, `∇L`, `p(x)` — a reduction well past the 70–85% the brief asked for. The visual gate fails the build if any of those captions returns.

**Ink** — five weights, one token each, so nothing is inked uniformly:

| Token | Paper | Role |
|---|---|---|
| `--science-major` | 0.15 | major contours, the long trajectory |
| `--science-bio` | 0.11 | secondary biological structure |
| `--science-formula` | 0.07 | notation |
| `--science-grid` | 0.03 | ticks and rules |
| `--science-accent` | 0.11 | the AI cobalt |

**Biological ink:** `--science-bio-ink: #547265` on paper — a desaturated moss, background-only. It never appears on a button, a link or a border. Weighting is roughly mathematics 50% / biology 30% / AI 20%; the page still reads as black-on-warm-paper first.

---

## 5. Project Mosaic

**Before:** four full-width showcase blocks, ~900px each, 4124px in total — more than half the homepage, and one full screen of scrolling per project.

**After:** a 12-column editorial grid, 1877px for the whole section.

```
row 1   ZhiShen · WenNian   7 cols   |   HyCell   5 cols
row 2   Morn                6 cols   |   BioPulse 6 cols
```

**The illustrations are the subject now.** Each card's drawing takes **51–58%** of the card's height, up from 41–45%:

| Card | Span | Card | Illustration | Share |
|---|---|---|---|---|
| ZhiShen · WenNian | 7 | 680px | 391px | **57%** |
| HyCell | 5 | 680px | 347px | **51%** |
| Morn | 6 | 681px | 392px | **58%** |
| BioPulse | 6 | 681px | 383px | **56%** |

Four distinct metaphors, one per project, three elements each at most:

- **ZhiShen** — a biological state form, four measured state nodes, one intervention path leaving for a target state
- **HyCell** — a large abstract cell, one state trajectory, one target state
- **Morn** — a central orchestration form with six nodes around it
- **BioPulse** — three evidence sources converging on one validation node

Each illustration is a labelled image (`role="img"` + `aria-label`), because it now carries the project's meaning rather than decorating text that carries it.

**What each card says — and nothing else:** category eyebrow, name, one line of type, the illustration, up to three keywords, one reality status, one case link (plus the repository). No chips, no proof line, no tag pills, no duplicate public-code label, no second status, no summary-plus-description double copy. Body copy measures **89–102 characters**, against a §58 budget of 35–55 Chinese characters excluding name and status.

**Card frames** are a hairline on the page canvas — no radius, no shadow, no coloured header — so the canvas keeps running between and behind them.

---

## 6. Homepage height

**3656px** at 1440px, down from **7279px** in v1.6 — and from **15138px** at the v1.5 baseline.

| Block | Height | Share | Brief's priority target |
|---|---|---|---|
| Hero | 738px | 20.2% | 20–25% |
| Selected Work | 1877px | 51.3% | 50–60% |
| Mathematics × Biology × AI | 380px | 10.4% | 10–15% |
| About / Contact | 385px | 10.5% | — |
| Footer | 207px | 5.7% | — |

The brief's guide was "约 3800–5000px". The page lands at 3656px — about 4% under — and that is deliberate rather than forced: the mosaic is denser than the guide assumed, and §46's instruction not to reach a number by padding or compressing type was followed. Every *proportional* target is met. If the owner wants the absolute figure inside the range, the honest lever is larger illustrations again, not more whitespace.

---

## 7. The three screenshots

```
.qa-screens/v17/hero-first-screen.png     1440 × 900
.qa-screens/v17/selected-work.png         1440 × 1877
.qa-screens/v17/homepage-full.png         1440 × 3656
```

Paper, 1440px, `/zh/`, captured with `npm run qa:prototype-shots` (add `node scripts/qa-prototype-shots.mjs <url>` to regenerate).

**What the hero crop must show** (§55) — all three, without hunting:

- **biology** — the four-level contour landscape, moss-tinted, centre-right
- **mathematics** — `P(H | D)` and `dx/dt`, top-left
- **AI** — four cobalt nodes joined by dashed edges, lower-right

**What it must not show** (§56): no `CELL STATE LANDSCAPE`, no `AGENT GRAPH`, no `posterior · likelihood · prior`, no `cells × genes`. Confirmed — and now enforced by a test and a gate.

**What the mosaic crop must show** (§57): four projects, four different visual identities, names legible without reading any body copy.

---

## 8. lint / typecheck / build

```
npm run lint        clean (0 errors, 0 warnings)
npm run typecheck   0 errors, 0 warnings, 0 hints (119 files)
npm run build       26 pages
```

Also green, though not required for a prototype: `verify` · `theme` (1345 checks) · `artifacts` (145) · `science` (2271) · `visual` (373) · `identity` (456 assertions), and **297 Playwright tests pass** (5 mobile-only skips).

Per §69 none of this is presented as evidence that the *visual* work is done. The direction is the owner's call.

---

## 9. Known unfinished items

Deliberately out of scope for P0, per §51/§52/§79:

1. **White and Night are not tuned.** They inherit the new token set and do not break, but Paper is the only theme reviewed. `--science-bio-ink` in particular needs its own tuning pass.
2. **Mobile is not adapted.** 390px is not broken (the canvas drops 54% of its marks, no horizontal overflow at 375/390/430/768/1024/1280/1920), but the mosaic, the hero and the statement band have not been composed for a phone.
3. **English is built, not reviewed.** `/` mirrors `/zh/` structurally; its card body copy runs to ~100 characters where the Chinese is ~40, and English line-lengths have not been judged.
4. **The `MidComposition` drift line crosses the keyword row of the two row-2 cards.** It is thin and the text is plainly legible, so §49's canvas veil was not applied — but it is the one place the canvas passes through text rather than beside it, and it is the first thing to change if the owner finds it distracting.
5. **`ProjectShowcase.astro`, `HeroSystem.astro` and `ResearchNotesPreview.astro` are now unused on the homepage.** All three are preserved and still referenced by nothing else; they are candidates for deletion or for a different role in P1.
6. **No motion.** §63 — composition first. The only movement is the existing slow drift, off under `prefers-reduced-motion`.
7. **Homepage height is 4% under the brief's guide** (see §6).
8. **Branch name deviates from §67** (see §1).

Also worth flagging for the owner's judgement, since it is a design opinion rather than a defect:

9. **The mosaic row-1 cards are 680px and row-2 are 681px** — near-identical heights, though their widths and drawings differ. §71-F fails only when all four are identical in size, structure *and* rhythm; these are not, and the 7/5/6/6 spans are the brief's own layout. But if the owner reads the two rows as too even, the fix is a taller flagship rather than a new grid.

**Two real defects were found and fixed while building this:**

- **BioPulse's card subtitle was its own type line reordered** (`生命科学 Agent-native 工作台` / `Agent-native 生命科学工作台`) — the exact double copy §24 exists to remove. The subtitle is now off the mosaic card; the dual-name discipline still holds on the case study and on `/projects`.
- **The statement band's height depended on how the statement wrapped**, moving ~130px between a cold and a warm load. Pinned with a desktop `min-height: 380px`.

**One pre-existing inconsistency fixed:** the Selected Work lead read "五个 / Five projects" while the homepage showed four — stale since v1.6 cut the count. The number is now out of the sentence entirely, so it cannot go stale again.

---

## 10. WAITING_FOR_OWNER_VISUAL_APPROVAL

The prototype is complete and frozen at `22fd54c` on `visual-v17-scientific-editorial`.

**Nothing is deployed. `main` is untouched.**

Please look at the three screenshots — `hero-first-screen.png`, `selected-work.png`, `homepage-full.png` — and answer one question:

> **这个方向对了？**

- **Yes** → v1.7-P1: White, Night, mobile, the full test suite re-tightened against the new homepage, CI, deploy.
- **No** → the four changes to revisit are the hero's 46/54 split, the canvas ink weights, the mosaic spans, and the statement band. Each is isolated and cheap to change; nothing else depends on them.

Until then: **no further expansion.**
