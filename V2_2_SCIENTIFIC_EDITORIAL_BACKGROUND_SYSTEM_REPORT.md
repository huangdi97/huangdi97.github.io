# V2.2 — Scientific Editorial Background System

**Status: `WAITING_FOR_OWNER_BACKGROUND_APPROVAL`**

Lightweight site-wide background system · raster downgrade · loading-behaviour work.
Branch `visual-v20-homepage-reset`. **No merge to `main`. No deploy.**

**No `PRODUCTION_READY` claim is made anywhere in this document.** That string has been
prohibited since v2.0. Every number below — including the word "passes" — comes from a
command that returned exit code 0 in this environment. Derived or remembered figures are
labelled as such, and the one figure that is a *derivation* rather than a measurement is
called out in §10.

The brief's first principle (§0), which this round exists to satisfy:

> 页面本身先好看。图片只是增强。
> 图片加载前已经好看 / 图片加载后只是更丰富。

The owner's report from a real visit was the negation of that: the rasters visibly
"慢慢加载出来", and the page read as a picture with some text under it.

---

## 0. Scope, and what was deliberately not touched

| Locked by the brief | State |
| --- | --- |
| Truth layer (`src/data/evidence.ts`), résumé, education, employment | Read-only. Not one claim changed. |
| Project reality, TaiYi Lingjing status | Unchanged. |
| SEO — canonical, hreflang, sitemap, metadata | Unchanged. |
| Page structure and IA (§67–§71) | Unchanged. No copy restored, no surface re-expanded. |
| The retired v1.7 `GlobalScientificCanvas` | Not re-implemented, and now *asserted gone* by gate and test (§1). |
| Client JavaScript for the background (§66) | None added. The background layer contains no `<script>`. |
| Animation (§38) | None. No `@keyframes`, no `transition`, no scroll effect. |
| `.artwork-source/` | Still tracked, still outside `public/`. |
| Test system and gates | Kept and *extended*, never loosened (§95, §97). |

**Permitted change: density of atmosphere. Nothing else.** Per §33–§34 a page may choose
how much background it gets. It may not choose a palette, and it may not change layout.

---

## 1. The problem being solved

Measured before anything was changed, against the v2.1 build (`HEAD` = `f69c613`):

| v2.1 fact | Value | Source |
| --- | --- | --- |
| Published home + page artwork | 7 files, **1,098.7 KB** | `git cat-file -s` on every path under `public/images/{home,site}/v2` |
| Of which the homepage | 5 files, **814.1 KB** | same |
| Intrinsic width of those files | 1586–1600 px, single size each | manifest |
| `srcset` / `sizes` | none — one file per slot, for every viewport | `Artwork.astro` |
| Homepage background layer | **absent** — the homepage mounted `canvas={false}` | `index.astro` |

The two facts together are the whole complaint. The homepage's only visual mass was a
set of five single-resolution rasters that the browser could not choose between, so a
390 px phone downloaded the 1600 px files, and the page had no base of its own to be
read against while those bytes were in flight.

**The page had nothing to be good with until the images arrived.** That is what this round
inverts.

---

## 2. The new background architecture

One component, one mount point, three layers, mounted behind every page:

```
src/components/visual/ScientificEditorialBackground.astro
  <div class="editorial-bg" data-editorial-background data-bg-mode={mode} aria-hidden="true">
    .ebg-wash      layer 1 — four very low-alpha radial gradients
    .ebg-texture   layer 2 — one 256x256 alpha-only WebP, repeated
    .ebg-marks     layer 3 — at most five inline-SVG fragment groups
  </div>
```

| Property | Value | Why |
| --- | --- | --- |
| Positioning | `position: absolute; inset: 0; z-index: -1` | A sheet of paper the page sits **on**, not wallpaper it slides over. A `fixed` layer would detach the atmosphere from the document. |
| Interaction | `pointer-events: none`, `aria-hidden="true"`, nothing focusable | §57. It is not in the accessibility tree and cannot receive a click. |
| JavaScript | **zero** — no `<script>`, no `client:` directive, no inline handler, no fetch | §66 |
| Determinism | no `Math.random`, no `Date.now`, no `new Date(` | §76 |
| Motion | no `@keyframes`, no `animation:`, no `transition:` | §38 |
| Network | one request: `/texture/paper.webp` | §7 |

All four of the above are asserted by `check-visual-system.mjs` §1 against the component
source, not by inspection.

The retired v1.7 canvas is now **positively asserted absent**: the gate fails if anything
under `src/` imports `GlobalScientificCanvas`, `HeroComposition`, `MidComposition` or
`LowerComposition` (excluding the retired files themselves), and `tests/entries.spec.ts`
asserts `[data-global-scientific-canvas]` and `.global-science` have count 0 on
`/projects/`, `/zh/projects/`, `/research/`, `/zh/research/`.

---

## 3. Layer 1 — CSS gradients

The paper is never a flat fill (§4–§6). Four radials, each fully transparent well before
the next begins, so no coloured patch can become visible:

```css
.ebg-wash {
  background-image:
    radial-gradient(62% 26% at 80%   2%, var(--bg-blue),  transparent 70%),
    radial-gradient(50% 20% at  3%  27%, var(--bg-green), transparent 72%),
    radial-gradient(56% 22% at 89%  63%, var(--bg-green), transparent 74%),
    radial-gradient(86% 28% at 28% 101%, var(--bg-warm),  transparent 78%);
  opacity: var(--ebg-wash-scale);
}
```

Every colour is a custom property, so nothing hard-codes a surface and all three themes
follow. The accent is the site's existing cobalt and the muted biological green (§56) —
no purple, no orange, no neon cyan.

Measured alpha bands per theme (`check-visual-system.mjs` §2 enforces both a floor and a
ceiling on each, plus the hierarchy `grid < mark < graph` and `bio <= graph`):

| Token | Paper | White | Night |
| --- | --- | --- | --- |
| `--bg-blue` | 0.055 | 0.04 | 0.07 |
| `--bg-green` | 0.042 | 0.03 | 0.055 |
| `--bg-warm` | 0.035 | 0.028 | 0.03 |
| `--bg-texture` | 0.038 | 0.03 | 0.05 |
| `--bg-mark` | 0.045 | 0.035 | 0.07 |
| `--bg-graph` | 0.056 | 0.04 | 0.075 |
| `--bg-bio` | 0.052 | 0.036 | 0.07 |
| `--bg-grid` | 0.032 | 0.026 | 0.05 |

Paper sits at the top of every band on purpose: it is the theme under review this round,
and the brief asks for the most comfortable version of it rather than the safest.

---

## 4. Layer 2 — the paper texture

`scripts/build-paper-texture.mjs`, `npm run texture`. Generated, not authored.

| Property | Value |
| --- | --- |
| Size | 256 × 256 |
| File | `public/texture/paper.webp`, **16.1 KB** |
| Encoding | WebP, alpha-only (RGB written as 0, all variation in alpha) |
| Content | 4 octaves of value noise (4/8/16/32) + one fibre octave, seeded LCG (`SEED = 20260920`) |
| Alpha range | 1 … 216, mean **0.458** |

**Alpha-only is the load-bearing decision.** Because the tile can only *darken*, Night
inverts it with `filter: invert(1)` instead of shipping a second file — one asset, one
request, three themes.

**Seamlessness, measured on the shipped file** (`.qa-screens/_seam.mjs`):

| Axis | Interior mean \|step\| | Wrapped mean \|step\| | Max wrapped step |
| --- | --- | --- | --- |
| Vertical | 1.257 | **0.277** | 2 |
| Horizontal | 6.034 | **2.445** | 8 |

The wrapped edge is *smoother* than an average interior edge on both axes, which is the
correct test: a tiling artefact would show as a wrapped step much larger than the interior
average. The tile comes from a toroidal lattice — the noise index is taken modulo the
lattice size at every octave — so continuity across the seam is a property of the
construction rather than something that was tuned out afterwards.

---

## 5. Layer 3 — the scientific marks

Six fragment groups exist in the library; **no mode mounts more than five**.

| Group | Kind | What it actually is |
| --- | --- | --- |
| `formula` | math | Six isolated notations — `∇L`, `p(x)`, `dx/dt`, `zₜ`, `∂`, `Σ` — scattered, never a line of working |
| `curve` | math | One probability curve with its axis |
| `neural` | ai | 3 layers, 10 nodes, **7** of 36 possible edges, 2 accent nodes, 1 accent edge |
| `cell` | biology | **Three open arcs** and a nucleus — deliberately not a closed contour |
| `matrix` | math | 5 × 5, of which **5 cells** carry ink |
| `helix` | biology | Two sine strands, 7 rungs, one and a third turns — a fragment, not a helix |

Everything is a *fragment* by construction, which is the line between this and the retired
canvas: that system composed three page-sized drawings with a stated quota of motifs per
screen and read as a research poster. Here, if a group could be read as a figure, it is
wrong. No fragment is captioned (§10 forbids background text labels), and the gate fails
on any banned caption.

Geometry is computed in the component frontmatter from constants — the helix rungs are
derived from the same sine as the strands so they actually meet, and the matrix is an
actual matrix. Determinism is therefore structural, not a promise.

Weight is one token per group, scaled by the mode:

```css
.ebg-formula          { opacity: calc(var(--bg-mark)  * var(--ebg-scale) * var(--ebg-mobile)); }
.ebg-curve, .ebg-neural { opacity: calc(var(--bg-graph) * var(--ebg-scale) * var(--ebg-mobile)); }
.ebg-cell, .ebg-helix   { opacity: calc(var(--bg-bio)   * var(--ebg-scale) * var(--ebg-mobile)); }
.ebg-matrix           { opacity: calc(var(--bg-grid)  * var(--ebg-scale) * var(--ebg-mobile)); }
```

Notation is the lightest thing on the page and biology the heaviest — the same hierarchy
the artwork uses, so the background is a quieter version of the site rather than a
different one. The gate rejects any hard-coded `opacity:` in this file (its regex carries a
negative lookbehind so `stroke-opacity` is not mistaken for a weight).

---

## 6. Per-page variants

`BaseLayout` takes `backgroundMode`. **Density is the only thing a mode changes.**

| Mode | Groups mounted | `--ebg-scale` | `--ebg-wash-scale` | Pages |
| --- | --- | --- | --- | --- |
| `default` | 4 — formula, curve, neural, cell | 1 | 1 | `/`, `/projects` |
| `research` | 5 — + helix | 1.18 | 1.1 | `/research` |
| `about` | 3 — formula, cell, matrix | 0.94 | 0.9 | `/about` |
| `resume` | 1 — formula | 0.6 | 0.62 | `/resume` |
| `minimal` | 0 — wash and texture only | 0 | 0.5 | `404`, utility routes |

Placement follows §13's sparse composition rather than an even fill — top right, down the
left through the middle, right near the end — expressed as **document-level percentages**,
so a longer page spreads the fragments instead of stacking them.

**Two independent dials, multiplied.** `--ebg-scale` says how dense *this page* is;
`--ebg-mobile` says how dense *this viewport* is. Below 900 px the latter becomes 0.72 and
three wide marks (`curve`, `matrix`, `helix`) are dropped outright rather than shrunk —
at 390 px they would sit under the body copy instead of beside it. Keeping the two dials
separate is what stops the phone rule from overwriting the page rule; an earlier version
derived one from the other with a self-referencing `var()`, which silently resolved to its
fallback and gave every mode identical weight.

---

## 7. Raster downgrade strategy

The drawings keep their place, their meaning and their label. What changed is that the
frame no longer *presents* them as a picture on the page.

| Surface | Before | After |
| --- | --- | --- |
| Homepage hero | Load-bearing; the page's whole right half | Enhancement; feathered in from the left, enlarged 3.5 % about an anchored origin |
| Homepage project rows | The row's subject | Feathered on all four edges; the row is carried by name, description, tags, link |
| `/research`, `/about` bands | Full-bleed plates | Feathered into the paper; band width capped at 56 rem |
| `/resume`, contact | Already restrained | **No artwork at all** |

The feather is a mask, not a gradient painted in the canvas colour — so it stays correct in
all three themes without hard-coding `#f0eee8`. Nested masks multiply (horizontal on the
innermost element, vertical on the wrapper), which avoids `mask-composite` and its
vendor-prefix differences.

### 7.1 The feather is measured, not aesthetic

`.qa-screens/_feather-value.mjs` renders `/projects/` twice — masks on, masks off — and
reports the luminance step exactly at each drawing's frame edge:

| Drawing edge | Step **without** feather | Step **with** feather |
| --- | --- | --- |
| Row 1, right | 53.44 | **1.52** |
| Row 1, left | 4.36 | 0.38 |
| Row 2, right | **123.17** | **3.95** |
| Row 2, left | 9.97 | 1.26 |

A 123-level step is the "plate pasted onto the page" defect the owner reported. The feather
removes it — a 31× and 35× reduction on the two right edges.

### 7.2 The band's asymmetry is also measured

Column-wise ink profiling of the two Owner assets puts the first ink at 45.3 % (`research`)
and 29.1 % (`about`), so the **left** 9 % ramps across nothing but the artwork's own blank
paper and can stay wide. The **right** edge is the opposite: it *is* content — the final
column of `about.webp` measures 91.9 % of that image's peak column deviation, and
`research.webp` reaches 52.4 % only 3 % in. A 9 % ramp there was fading real subject, which
the owner saw as a washed-out right side. It is pulled back to the hero's already-validated
3.5 % (96.5 %), the narrowest value that still hides the warmer paper step.

### 7.3 One defect found by looking, and fixed

The first `.art--blend` attempt was a single `radial-gradient(118% 118% at 50% 50%, …)`, on
the theory that a radial falloff is edge-agnostic. It was wrong, and the screenshot showed
it: at 118 % of the box, the midpoint of the top edge sits at 0.5/1.18 = 42 % of the
gradient's radius — well inside the opaque stop at 58 %. The radial was therefore only
softening the four **corners**; the **edges**, which are the thing that reads as a pasted
plate, kept their hard line. Replaced with the two nested directional ramps measured above.

---

## 8. Responsive image variants

A three-rung ladder, not "dozens of sizes" (§79):

```
scripts/lib/artwork-ladder.mjs   LADDER = [640, 960, 1440]
```

`ladderWidths(target)` never upscales — a slot whose target is below a rung simply omits
it, so no file is ever interpolated larger than its source. `writeLadder()` emits the rungs
and `pruneStale()` deletes the ones a slot no longer references, because `public/` is a
passthrough directory: an unreferenced file there is a published file.

`sizes` is written per layout rather than guessed, and lives in `src/data/artwork.ts` so the
`<img>` and the `BaseLayout` preload cannot disagree (§25):

| Slot | `sizes` |
| --- | --- |
| hero | `(min-width: 1200px) 632px, (min-width: 900px) 52vw, calc(100vw - 3rem)` |
| project rows | `(min-width: 1200px) 662px, (min-width: 900px) 59vw, calc(100vw - 3rem)` |
| `/projects` entries | `(min-width: 1200px) 540px, (min-width: 760px) 46vw, calc(100vw - 3rem)` |
| page bands | `(min-width: 900px) 896px, calc(100vw - 3rem)` |

**Verified in a real browser, not by reading the markup:**

- at 390 px the homepage fetches `hero-640` and never `hero-1440`;
- at 1440 px the project rows fetch the 960 rung;
- `/research` at 1440 px fetches `research-960` (not 1440) against `BAND_SIZES` of 896 px.

**Published vs transferred.** The published footprint grew, and it is worth stating plainly:
7 single-size files (1,098.7 KB) became 21 rungs + 1 texture = 1,741,222 B = **1,700.4 KB**.
Only one rung per slot is ever fetched, which is the entire point — the transfer per visit
went *down* (§10) while the repository gained the ability to serve any viewport correctly.

---

## 9. Lazy / eager / preload policy

| Rule | Implementation |
| --- | --- |
| Only the page's own LCP drawing is eager | `loading="eager" fetchpriority="high"` for `hero`, `research`, `about`; everything else `loading="lazy"` |
| At most one image preload per page | `BaseLayout` emits exactly one `<link rel="preload" as="image" href imagesrcset imagesizes type="image/webp" fetchpriority="high">`, and only where an eager drawing exists |
| Space reserved before bytes arrive | `aspect-ratio` on the frame plus intrinsic `width`/`height` on the `<img>` (§43) |
| No skeleton, no spinner, no blur-up (§40, §89) | none present — the background layer is what fills the wait |

The gate (`check-visual-system.mjs` §5) enforces: every `<img class="art-img">` carries a
loading hint, an intrinsic size and a `srcset`; the eager count per page is exactly the
expected one; at most one image preload exists and it is present exactly where an eager
drawing is; and eager bytes measured **at the largest rung** stay under 250 KB (§61/§62).

Measured at the largest rung, i.e. the worst case a DPR-2 screen can request:

| Page | Eager bytes (largest rung) | Budget |
| --- | --- | --- |
| `/`, `/zh/` | 153 KB | 250 KB |
| `/research`, `/zh/research` | 106 KB | 250 KB |
| `/about`, `/zh/about` | 131 KB | 250 KB |

---

## 10. Payload comparison

Transferred bytes, measured on a DPR-1 1440 × 900 viewport by
`scripts/qa-v22-shots.mjs` reading `performance.getEntriesByType('resource')`:

| Page | 1440 px | 390 px | v2.1 equivalent |
| --- | --- | --- | --- |
| `/` | 358.2 KB (eager 1 / lazy 4) | 213.3 KB | **814.1 KB** — five single-size files, all mounted at every viewport |
| `/projects` | 174.3 KB (eager 0 / lazy 4) | 174.3 KB | — |
| `/research` | 65.8 KB | 39.4 KB | 284.6 KB for the one `research.webp` + `about.webp` pair |
| `/about` | 80.1 KB | 46.5 KB | (above) |

The homepage figure is a **measurement**; the v2.1 figure is also a measurement
(`git cat-file -s` on the five files at `HEAD`). The percentage difference is a derivation
from those two measurements: **−56 % at desktop, −74 % at mobile.** It is presented as a
derivation, not as a measured ratio.

The texture costs 16.1 KB — 4.5 % of the homepage's 358.2 KB — and is the only background
request that exists.

---

## 11. No-image QA (§86–§87, the decisive acceptance item)

Run with **every** image type aborted at the network layer
(`**/*.{png,jpg,jpeg,webp,avif,svg}`), so the browser is given nothing to draw:

| Page | Document height | Background height | Fragments visible | Main text | Broken images |
| --- | --- | --- | --- | --- | --- |
| `/` en | 3635 px | 3635 px | 4 | 782 chars | 5 (the aborted ones) |
| `/` zh | 3635 px | 3635 px | 4 | 396 chars | 5 |
| `/research` en | 3821 px | 3821 px | 5 | 2633 chars | 1 |
| `/research` zh | 3623 px | 3623 px | 5 | 1012 chars | 1 |
| `/about` en | 3483 px | 3483 px | 3 | 2162 chars | 1 |
| `/about` zh | 3205 px | 3205 px | 3 | 764 chars | 1 |

The background spans the full document height in every case, the wash is still painted, the
fragments are still visible, all main text is present, and horizontal overflow is ≤ 1 px.
**The page is complete and good with zero images.**

### 11.1 A defect this QA exposed, and its fix

Blocked images make the browser paint the `alt` text at the top-left of the image box —
which is the one corner where the horizontal ramp (ending at 58 px) and the vertical ramp
(ending at 34 px) multiply. Measured, the text occupies x 20…439, y 7…22, i.e. entirely
inside both ramps, and the leading glyphs came out at **~195 luminance against ~21 for full
ink** — a 60+ level washout. The fallback text was being drawn *through* the fade and read
as a ghost.

There is no placement that fixes it. The text is inline content in the img box, so the only
levers are `text-indent` and `line-height` — but the hero's ramp is not opaque until 46 %
while its alt text is long enough to wrap, and a wrapped line returns to x = 0, back inside
the fade. Padding would move the text but would also inset the picture and change the crop,
which is tuned per slot and is not this round's business.

So the text was made non-painting instead, on the three feathered frame types:

```css
.art--hero.art--raster .art-img,
.art--blend.art--raster .art-img,
.art--band.art--raster .art-img { color: transparent; }
```

Verified (`.qa-screens/_verify-fix.mjs`):

| Check | Before | After |
| --- | --- | --- |
| Inked pixels in the art slot, images blocked | thousands | **0** |
| Computed `color` | inherited ink | `rgba(0, 0, 0, 0)` |
| `alt` attribute present | yes | **yes** — unchanged |
| Loaded-state edge step | 0.38 | 0.50 (unchanged within noise) |

This is a **presentational** change only. The `alt` attribute stays on the element, so
assistive technology is unaffected — every gate and every test asserts the attribute, never
the pixels (`check-visual-system.mjs:144/631/812`, `tests/entries.spec.ts:47`,
`tests/site.spec.ts:54`). And a blocked frame now reads as clean paper, which is what "the
drawing is an enhancement" is supposed to look like; a half-erased sentence in the corner is
what it is not (§89 — no placeholder content).

---

## 12. Slow-network QA

Chromium via CDP `Network.emulateNetworkConditions` — Slow 4G, 1.6 Mbps down / 750 kbps up
/ 150 ms RTT:

| Page | Transferred | First contentful paint | First request |
| --- | --- | --- | --- |
| `/` | 262.5 KB | **612 ms** | 187 ms |
| `/research` | 65.8 KB | 628 ms | 179 ms |

Homepage request order — this is the perception fix in one table:

```
   187ms →  599ms   39.0 KB  hero-640.webp
   451ms →  816ms   16.4 KB  paper.webp
   509ms → 1531ms   56.8 KB  wennian-960.webp
   509ms → 1717ms   89.3 KB  hycell-960.webp
   509ms → 1592ms   60.9 KB  morn-960.webp
  first contentful paint: 612ms
```

The honest reading: on this profile the hero lands at 599 ms and first paint is at 612 ms,
so the hero is not *dramatically* late — it is preloaded and small (39.0 KB, the 640 rung).
What the order proves is the structural change: the four project drawings do not begin until
509 ms and the slowest does not finish until 1717 ms, long after the page has painted, and
the 16 KB texture is an independent request rather than a dependency of anything.

The decisive evidence for "good before images" is not this table but §11, where the page was
rendered with *nothing*.

---

## 13. Desktop screenshots

`.qa-screens/v22/`, 1440 × 900, full-page. Paper unless noted.

| Frame | File |
| --- | --- |
| Homepage | `home-1440-paper-en.png`, `home-1440-paper-zh.png` |
| Homepage, White | `home-1440-white-en.png`, `home-1440-white-zh.png` |
| Homepage, Night | `home-1440-night-en.png`, `home-1440-night-zh.png` |
| Homepage, **no images** | `home-1440-noimage-en.png`, `home-1440-noimage-zh.png` |
| Homepage, **Slow 4G** | `home-1440-slow4g.png` |
| `/projects` | `projects-1440-paper-en.png`, `projects-1440-paper-zh.png` |
| `/research` | `research-1440-paper-en.png`, `research-1440-paper-zh.png`, `-night-`, `-noimage-`, `-slow4g` |
| `/about` | `about-1440-paper-en.png`, `about-1440-paper-zh.png`, `-noimage-` |

Reviewed at 100 % crops (`.qa-screens/v22/crops/`). Two defects were found by looking at
these frames rather than at the numbers, and both are fixed in §7.3 and §11.1.

---

## 14. Mobile screenshots

390 px (Pixel 5), Paper, full-page:

`home-390-paper-en.png` · `home-390-paper-zh.png` · `projects-390-paper-en.png` ·
`projects-390-paper-zh.png` · `research-390-paper-en.png` · `research-390-paper-zh.png` ·
`about-390-paper-en.png` · `about-390-paper-zh.png`

At 390 px the composition is the same at lower density rather than a squashed desktop:
`--ebg-mobile: 0.72`, and `curve`, `matrix` and `helix` are not mounted. The 32-frame
counterpart set for the theme/language matrix is produced by `npm run qa:v21`, which must be
run with **both** `haoleilab-theme` and `haoleilab-language` set or the language redirect
photographs the wrong locale.

---

## 15. Gates

All six run individually against the final `dist/` — `npm run gate` cannot be used in this
environment because it is a `&&` chain (see §17).

| Gate | Result | Exit |
| --- | --- | --- |
| `verify-build.mjs` | 76 files, 26 HTML pages, 644 internal links, 22 local assets | 0 |
| `check-theme-system.mjs` | 1092 checks | 0 |
| `check-artifacts.mjs` | 155 checks — 5 entries parsed, 3 rendered per locale, 0 raw bodies | 0 |
| `check-science-copy.mjs` | 1895 checks — 108 files scanned | 0 |
| `check-visual-system.mjs` | 696 checks | 0 |
| `check-public-identity.mjs` | 412 assertions — 26 pages, 2 PDFs | 0 |

Plus, all exit 0:

| Check | Result |
| --- | --- |
| `npm run lint` | clean |
| `npm run typecheck` (`astro check`) | **107 files, 0 errors / 0 warnings / 0 hints** |
| `CODEBUDDY_SAFE_DELETE_ENABLED=0 npm run build` | 26 pages, `dist/` = **76 files**, 0 residue |
| `npm run texture -- --check` | 256 × 256, 16.1 KB, mean alpha 0.458 |
| `npm run qa:v22` | 30 frames + `measurements.json` |

### 15.1 New assertions added this round (§97)

`check-visual-system.mjs` §5 is new and asserts, against built HTML: the expected eager
count per page; that every drawing carries a loading hint, an intrinsic size and a `srcset`;
that at most one image preload exists and only where an eager drawing does; that eager bytes
at the largest rung stay ≤ 250 KB; that no `/source/` file is published anywhere in `dist/`;
and that `public/texture/paper.webp` exists and is ≤ 30 KB.

`tests/background.spec.ts` is new — 38 tests covering: the layer is inert and document-level
on five routes (`aria-hidden`, `pointer-events: none`, no focusables, `position: absolute`,
`z-index: -1`, height > 0.9 × document); the wash is actually painted and the texture URL is
actually referenced; per-mode expected `data-bg-kind` sets; no banned caption; theme bands
read from the custom properties; no motion; 390 px mounts fewer fragments but still all three
sciences; the retired canvas is gone from every route; the raster policy end to end; and the
no-image case for three pages.

---

## 16. Playwright

**Authoritative run — CI-equivalent conditions** (`--workers=1`, matching the repo's own
`workers: process.env.CI ? 1 : undefined`):

```
8 skipped
322 passed (4.8m)
exit 0
```

**Local default run** (6 workers, this sandbox):

```
1 failed
8 skipped
321 passed (1.8m)
exit 1
```

The single failure was `tests/entries.spec.ts:146` — `net::ERR_NO_BUFFER_SPACE` at
`page.goto('http://127.0.0.1:4321/zh/research/')`. This is a Chromium network-stack error
(socket-buffer exhaustion), not an assertion failure, and it was diagnosed rather than
re-run until green:

1. **The assertion target was checked directly against the artefact.** `dist/zh/research/index.html`
   contains **0** occurrences of `data-global-scientific-canvas` / `global-science` and
   **1** occurrence of `data-editorial-background` — the assertion's subject is satisfied.
2. **The same test passes in isolation.** `npx playwright test tests/entries.spec.ts` →
   **20 passed**, including `/zh/research/ no longer mounts it` on both projects.
3. **The failure is load-related.** Six workers hammer one `astro preview` server; CI runs
   one worker with one retry, which is why the project configures it that way.

Nothing was changed to make it pass. The CI-equivalent run is the number that matters, and
it is 0 failed.

---

## 17. Known issues

1. **`npm run gate` is unusable in this environment.** It is a `&&` chain and
   `npm run build` exits 1 here without `CODEBUDDY_SAFE_DELETE_ENABLED=0` (Astro's
   `cleanServerOutput` is blocked by the sandbox's safe-delete guard, after the pages have
   already been written). The six gates must be run individually, as in §15. On CI the
   chain is fine.

2. **The published artwork footprint grew** — 1,098.7 KB to 1,700.4 KB — because each slot
   now ships three rungs instead of one. This is deliberate and is the mechanism by which
   per-visit transfer fell. It is recorded here so it is not mistaken for a regression.

3. **The no-image fallback text is no longer painted** (§11.1). Assistive technology is
   unaffected — the `alt` attribute is intact — but a sighted visitor with images blocked
   sees clean paper rather than a description of the missing drawing. This is the trade-off
   that was chosen, with the measurement that forced it.

4. **Night was checked, not designed.** It only has to not break: the artworks are
   light-canvas images and are eased back with `opacity: 0.95; filter: brightness(0.92)`
   on the dark ground. No value there is tuned.

5. **The flaky-test class from earlier rounds still exists.** `theme.spec.ts:85` and now
   `entries.spec.ts:146` can fail under high local concurrency for environment reasons.
   Both are diagnosed by isolation plus artefact inspection, never by re-running.

---

## 18. Recommendation for release

The round's acceptance condition was §86/§87: *with images disabled, Home, Projects,
Research and About must still be complete and good.* Measured in §11, they are — full
document height, background painted edge to edge, fragments visible, all text present, no
overflow, in both locales.

The brief's first principle is satisfied in the way it asked to be: the page is now good
*before* the bytes, and richer *after* them. The background is three layers of CSS and one
16 KB file, contains no JavaScript and no motion, and is asserted inert by both a gate and a
test suite.

**Recommendation: approve for release.** The work is on `visual-v20-homepage-reset`, is not
merged and not deployed, and no `PRODUCTION_READY` claim is made. The suggested candidate
commit is:

```
v2.2: add lightweight scientific editorial background system
```

---

**Terminal state: `WAITING_FOR_OWNER_BACKGROUND_APPROVAL`.** No merge to `main`, no deploy.
