# V1_7_P1_RELEASE_REPORT

**Round:** v1.7-P1 — theme adaptation, mobile, full tests, deploy
**Predecessor:** v1.7-P0 (`WAITING_FOR_OWNER_VISUAL_APPROVAL` → owner: **"对了"**)
**Status:** `PRODUCTION_READY`
**Live:** https://haoleilab.com · https://haoleilab.com/zh/

---

## 0. What changed since P0

P0 was frozen at `22fd54c` on `visual-v17-scientific-editorial`. P1 is `d7d5045`,
merged to `main` fast-forward and deployed. Nothing in P0's composition was
redesigned — the direction was approved as-is. P1 finished the parts P0
deliberately left out, and fixed two mobile defects that P0's "don't break"
bar had hidden.

| Area | P0 | P1 |
|---|---|---|
| Paper | tuned | unchanged |
| White | inherited, untuned | dials raised, biological ink deepened |
| Night | inherited, untuned | checked, left alone |
| Mobile | "not broken" | re-framed — two real defects fixed |
| Canvas tests | paper only | all three themes, with hierarchy per theme |
| Deploy | not deployed | merged, CI green, live |

---

## 1. Branch and commits

```
main                                      d7d5045
├── 22fd54c  v1.7-P0: scientific editorial prototype
├── d708463  Add v1.7-P0 visual prototype report
└── d7d5045  v1.7-P1: theme tuning, mobile framing, full test coverage

visual-v17-scientific-editorial           d7d5045  (merged, kept for reference)
```

Merged with `--ff-only`: no merge commit, `main` history stays linear.

---

## 2. White and Night

**White was wrong, and P0 flagged it as untuned.** The first pass sat so far
below paper that white read as *emptier* than paper rather than as cleaner, and
the desaturated moss lost its hue entirely against `#ffffff`.

| Token | P0 | P1 |
|---|---|---|
| `--science-major` | 0.11 | **0.13** |
| `--science-bio` | 0.075 | **0.095** |
| `--science-formula` | 0.05 | **0.06** |
| `--science-grid` | 0.022 | **0.026** |
| `--science-accent` | 0.075 | **0.09** |
| `--science-bio-ink` | `#5a766b` | **`#54756a`** |

White still sits below paper on every dial — flat white shows ink faster — but
the field is now comparable in presence, and the biology reads as moss rather
than as grey.

**Night was checked and left alone.** `0.17 / 0.12 / 0.08 / 0.04 / 0.13` with
`--science-bio-ink: #8fae9f` reads clearly on the dark canvas without becoming
noisy. Changing it would have been churn.

Final Paper / White / Night:

| | Paper | White | Night |
|---|---|---|---|
| major | 0.15 | 0.13 | 0.17 |
| bio | 0.11 | 0.095 | 0.12 |
| formula | 0.07 | 0.06 | 0.08 |
| grid | 0.03 | 0.026 | 0.04 |
| accent | 0.11 | 0.09 | 0.13 |
| bio ink | `#547265` | `#54756a` | `#8fae9f` |

---

## 3. Mobile — two real defects, both from `slice`

P0 reported mobile as "not broken". Looking at it properly, it was broken in two
ways, and both came from the same cause: `preserveAspectRatio="slice"` on a box
much taller than the drawing.

**Defect 1 — the hero composition was cropped to its middle.**
The hero box was `96vh` tall, so `slice` scaled the 1600 × 1000 drawing to fill
the *height* and cropped the *sides*. At 390px only the middle ~480 viewBox units
survived:

- the notation at x 58 — **off-canvas**
- the entire AI graph at x 1340–1576 — **off-canvas**

So a phone showed biology and a fragment of trajectory, and nothing else. The
mark counts still reported math 3 / biology 4 / AI 2, because they counted
`display`, not what was inside the visible crop. That is exactly the kind of
thing a count-based check misses and a screenshot catches.

**Fix:** below 640px each movement takes its own aspect ratio, so the whole
drawing is present:

| Movement | viewBox | Mobile height |
|---|---|---|
| hero | 1600 × 1000 | `62.5vw` |
| mid | 1460 × 520 | `35.6vw` |
| lower | 1460 × 420 | `28.8vw` |

Nothing cropped, nothing squashed — the same drawing, framed for the screen.

**Defect 2 — the trajectory ran straight through the hero statement.**
On a phone the hero copy is full width, so the trajectory's horizontal sweep
crossed the paragraph. The hero composition now sits in the hero's lower
whitespace (`top: 15%`), clear of every line of copy.

**Notation is dropped on phones.** At 0.24 scale a 27px formula renders at 6px —
a smudge, not a formula. §40's rule is that a formula must not be cropped into
nonsense; at 6px it is nonsense without being cropped, which is worse. So
`P(H | D)`, `dx/dt`, `X`, `zₜ₊₁`, `∇L` and `p(x)` are all dropped below 640px,
and mathematics still reads on a phone **as a form** — the trajectory in the
hero, the probability curve at the foot (now tagged `data-sci-kind="math"` so
the intent is explicit rather than incidental).

Mobile still carries all three sciences: **math 1 / biology 4 / AI 2**, with 8 of
20 marks kept (60% dropped).

**Mobile measurements**

| | 390px |
|---|---|
| Document | 4099px |
| Hero | 69–761px |
| Selected Work | 761–3199px (four cards stacked, 475–544px each) |
| Statement band | 3199–3507px |
| Contact | 3507–3866px |
| Footer | 3866–4099px |
| Horizontal overflow | 0 (also verified at 375 / 430 / 768 / 1024 / 1280 / 1920) |

---

## 4. Canvas placement, measured rather than guessed

P0 flagged that the `MidComposition` drift line appeared to cross the second
mosaic row's text. Measuring the actual block positions showed the real picture:

| Block | Page y |
|---|---|
| Row 2 cards | 1887–2568 |
| Row 2 keywords | 2455–2483 |
| Row 2 status + links | ~2500–2540 |
| Statement band | 2684–3064 |

The drift line was **not** crossing the keywords — it passed 100px below them.
What *was* crossing them was the expression matrix and the dispersing cells.

The movement moved from 66% to **55%** of the document, which places the entire
drawing inside row 2's illustration band (≈2054–2446). The canvas now crosses
drawings rather than text, which is what §48 asks for.

This is the second time this round that "looks wrong" and "is wrong" were
different things; the fix came from measuring, not from adjusting until it
looked better.

---

## 5. Tests

**297 pass, 5 skipped** (mobile-only tests correctly skipped on desktop).

The canvas opacity test was the significant re-tightening. In P0 it asserted
Paper only; a token can be defined correctly in CSS and still never reach an
element, so P1 checks all three themes in a real browser, with the hierarchy
asserted per theme:

```
for theme in paper, white, night:
  major, bio, formula, grid, accent  ∈  the theme's band
  formula < major        (notation never out-shouts the drawing)
  grid    < formula      (ticks never out-shout notation)
  bio     < major        (biology is secondary to the composition)
```

That is 15 band assertions × 3 themes × 2 locales, up from 10 assertions on one
theme.

Full suite: `lint` clean · `typecheck` 0/0/0 · `build` 26 pages · `verify`
passed · `theme` 1345 · `artifacts` 145 · `science` 2271 · `visual` 373 ·
`identity` 456 assertions.

---

## 6. CI and deploy

```
main  d7d5045  →  GitHub Actions run 35419348930  completed success
```

Eleven blocking steps, unchanged from v1.6: `npm ci → lint → typecheck → build →
verify → theme → artifacts → science → visual → identity → test → deploy`.

**Production smoke, verified against the live host:**

| Route | Result |
|---|---|
| `/` | canvas 1 · mosaic 4 · compositions 3 · math/bio/AI 4/5/6 · no `#artifacts` · no NOW · no OSS table · no forced-night footer |
| `/zh/` | identical |
| `/projects/` | evidence room ✓ · NOW strip ✓ · open-source table ✓ · 7 project cards ✓ · contact row ✓ · no forced-night footer |
| `/research/` | figure set ✓ · equation ✓ · lab notes ✓ · 2 tiers ✓ · TaiYi `Concept / Not Started` ✓ · canvas ✓ |

---

## 7. Final homepage numbers

| | 1440px |
|---|---|
| Document | **3656px** |
| Hero | 738px · 20.2% (target 20–25%) |
| Selected Work | 1877px · 51.3% (target 50–60%) |
| Mathematics × Biology × AI | 380px · 10.4% (target 10–15%) |
| About / Contact | 385px · 10.5% |
| Footer | 207px · 5.7% |

| Card | Span | Card | Illustration | Share (target 45–65%) |
|---|---|---|---|---|
| ZhiShen · WenNian | 7 | 680px | 391px | 57% |
| HyCell | 5 | 680px | 347px | 51% |
| Morn | 6 | 681px | 392px | 58% |
| BioPulse | 6 | 681px | 383px | 56% |

For the record: v1.5 was 15138px, v1.6 7279px, v1.7 3656px — a 76% reduction
across the two rounds, with no project, fact or claim removed from the site.

---

## 8. Screenshots

```
.qa-screens/v17/hero-first-screen.png     1440 × 900     paper
.qa-screens/v17/selected-work.png         1440 × 1877    paper
.qa-screens/v17/homepage-full.png         1440 × 3656    paper
.qa-screens/v17/full-white.png            1440 × 3656    white
.qa-screens/v17/full-night.png            1440 × 3656    night
.qa-screens/v17/mobile-first-paper.png     390 × 844     paper
.qa-screens/v17/mobile-full-paper.png      390 × 4099    paper
.qa-screens/v17/mobile-card-wennian.png    390 × 475     paper
```

Regenerate with `npm run qa:prototype-shots` (three core shots) and
`node scripts/qa-crops.mjs` (theme + mobile set).

---

## 9. Remaining items

Not defects, and none blocking. Listed so they are decisions rather than
oversights.

1. **`ProjectShowcase.astro`, `HeroSystem.astro` and `ResearchNotesPreview.astro`
   are unused on the homepage.** All three are preserved and still pass the
   visual gate's cover checks, but nothing renders them. Candidates for removal,
   or for a role on `/projects` and `/research` in a later round.
2. **Homepage height is 3656px, ~4% under the brief's 3800–5000 guide.** Every
   proportional target is met. Reaching the absolute figure honestly means
   larger illustrations again, not more whitespace — left for the owner to call.
3. **English body copy runs longer than Chinese** (~100 characters per card
   against ~40). It builds and reads, but line-lengths were not judged the way
   the Chinese ones were.
4. **The `MidComposition` still sits behind row 2's illustrations.** That is
   intended — the canvas crossing a drawing is fine, crossing text is not — but
   it means the drawing is partially covered at 1440px.
5. **No motion beyond the existing slow drift**, which is off under
   `prefers-reduced-motion`. §63: composition first.

---

## 10. Status

**PRODUCTION_READY.**

- homepage 3656px, four content areas, every proportional target met
- Paper / White / Night all reviewed and tuned
- mobile re-framed, no crop, no text collision, all three sciences present
- 297 tests, six gates, eleven CI steps, all green
- merged to `main`, deployed, production smoke passed on four routes

The branch `visual-v17-scientific-editorial` is kept at `d7d5045` for reference
and can be deleted once the next round starts.
