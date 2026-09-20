# V2.2.1 — Scientific Editorial Visual Correction

**Round type:** visual correction. Not a redesign, not a new system.
**Base:** `baa716a` (v2.2, released) → working tree, 31 files changed, +1670 / −1149.
**Terminal state:** `WAITING_FOR_OWNER_VISUAL_APPROVAL`. Nothing merged, nothing deployed.

> **Released.** The owner approved on 2026-09-20 and this round was merged and
> deployed. The line above is left as written; the release record — commit,
> CI run, and the byte-level live verification — is in
> **"Owner decision applied — release"** at the end of this report. Current
> state: **`RELEASED`**.

> **Superseded in part.** The header's `31 files changed, +1670 / −1149` was
> measured when this report was written (19:36). Two files were edited after it
> — `README.md` (19:45) and `src/content.config.ts` (19:46) — so the working
> tree is now **33 tracked files, +1774 / −1202** (35 files counting the two
> untracked). The header is left as written; see
> **"Independent verification — 2026-09-20"** at the end of this report for the
> re-measurement and for why `dist/` is nevertheless still valid.

Every number in this report is labelled either **measured** (a command ran and
its exit code is quoted) or **derived** (arithmetic on measured endpoints). The
rule this repository has held since v2.1 is that "passed" is also a number, and
it has to come from a run with an exit code. Where a claim could not be measured
it is listed in §14 as an open item instead of being asserted.

---

## 0. Scope, and what was deliberately not touched

The brief named five defects and five prohibitions. Both lists were treated as
binding, and the prohibitions are the easier half to report because they are
absences:

| Not touched | Evidence |
| --- | --- |
| Information architecture | 26 pages before and after; no route added or removed |
| Homepage layout | `dist/index.html` 46,512 B → 46,001 B; three content areas both times |
| Artwork rasters | the only binary that changed in the whole round is `public/texture/paper.webp` (16,444 → 6,622 B) |
| The retired `GlobalScientificCanvas` | still retired; the visual gate fails if anything under `src/` imports it |
| The fact layer | `src/data/{evidence,resume,artifacts}.ts`, `src/lib/projectStatus.ts` are unmodified |
| Project truth | `src/content/projects/**` unmodified |
| Cursor behaviour | the only `cursor:` declarations in the tree are in `EvidencePanel.astro` and `ProjectReality.astro`, neither touched |
| New skills | none created |

Two readings of the brief are worth stating explicitly, because they are
judgement calls rather than obvious:

1. **§63's "no raster regeneration" applies to artwork, not to the paper
   texture.** §3 of the same brief requires the texture to be rebuilt to
   128×128 or 256×256, isotropic, with no directionality. Those two instructions
   can only both be satisfied if "raster" in §63 means the five homepage plates
   and the two page plates. Nothing in `public/images/` was regenerated or
   re-encoded.
2. **The texture is not the only layer that was changed, but it is the only one
   that was rebuilt.** The wash, the marks and the variant table were edited in
   CSS and markup. No new asset was introduced and no new HTTP request exists:
   the site still fetches one tile.

---

## 1. The five reported defects, and what each one actually was

The brief listed symptoms. Establishing what each symptom *was* is most of the
work, so each is stated here with the instrument that settled it.

| # | Reported | Actual | Settled by |
| --- | --- | --- | --- |
| 1 | horizontal blur bands, faint stripes, horizontal smearing | the v2.2 paper tile was strongly anisotropic — its features ran horizontally — and repeated every 256px behind every page | `diag-texture.mjs`, §2 |
| 2 | Research background is not a mathematics × neural × biology composition | the marks were six glyphs at six unrelated offsets and one network, with no shared placement logic; the page was a stacked title + one big picture | `research.astro`, §7 |
| 3 | Projects exposes too much project detail | the v2.1 entry's intro paragraph had grown back into a project description | §9 |
| 4 | the black "公开成果精选" block is visually disjoined | it was the site's only inverted surface, on a directory page | §10 |
| 5 | every page's background density is similar | density moved by a factor of ~2 across the whole site and the mark *set* never changed | §5 |

Defect 1 is the one that needed measurement rather than judgement, and it is
treated at length in §2 because the first plausible explanation was wrong.

---

## 2. Root cause of the horizontal banding (measured)

### 2.1 The first hypothesis, and why it was rejected

The obvious suspect was the wash. v2.2 sized its radials as **percentages of the
document** — `radial-gradient(86% 28% at 28% 101%, …)` on a 3,300px page is a
~1,200px-tall ramp. An 8-bit canvas quantises a 4.8%-alpha ramp over 1,200px
into roughly a dozen visible steps, which is a set of wide horizontal arcs, i.e.
exactly the reported artefact.

It was measured before it was believed, and it turned out to be **not** the
dominant term. It is still a real defect and it was fixed (§4), but the numbers
below show the texture was carrying more of the symptom.

### 2.2 The tile, measured with the same instrument before and after

`.qa-screens/v221/diag-texture.mjs`, run against the v2.2 tile (recovered from a
clean build of `baa716a`) and the v2.2.1 tile:

| metric | v2.2 | v2.2.1 | |
| --- | --- | --- | --- |
| size | 256×256 | **128×128** | |
| bytes | 16,444 | **6,622** | −59.7% |
| row-profile σ (w8) — *horizontal banding energy* | **15.8796** | **6.6831** | **−57.9%** |
| col-profile σ (w8) | 4.5915 | 9.7214 | |
| mean \|step\| along X | 1.2575 | 5.4673 | |
| mean \|step\| along Y | 6.0340 | 5.4395 | |
| **anisotropy X/Y** (1.0 = isotropic) | **0.2084** | **1.0051** | |
| seam X (1.0 = joins itself) | 0.9970 | 0.9997 | |
| seam Y | 0.9977 | 0.9981 | |
| verdict printed by the tool | `ANISOTROPIC — features run horizontally (streaks)` | `isotropic` | |

Anisotropy 0.2084 means the tile's features were about five times longer in X
than in Y. The cause was in the generator, not in the CSS: v2.2 mixed in a
`fibre` layer built as `valueNoise(SIZE, 3, 48, rand)` — a **3-cell lattice on X
and a 48-cell lattice on Y**. That stretches each cell into a horizontal streak
by construction. Repeated every 256px behind every page, the result is a
256px-periodic field of horizontal stripes. That is the reported symptom, and it
is a defect of the generator rather than of any page.

The fix removes every term that treats X differently from Y: the noise lattice
is now square, so the tile is isotropic *by construction* and the measurement is
a confirmation rather than a tuning knob.

### 2.3 The same defect, seen in the rendered page

`.qa-screens/v221/diag-banding.mjs` was run against both builds with one
instrument. It screenshots 1440×900 of `/research/` with the page's chrome and
the marks hidden, and adds one background layer at a time, so each row is the
cost of the layer it adds. rowσ is the standard deviation of the per-row mean
luminance smoothed over 8 rows — a run of rows collectively darker than its
neighbours is a band, and this is what such a run inflates.

| config | rowσ(w8) v2.2 | rowσ(w8) v2.2.1 | dominant period v2.2 | v2.2.1 |
| --- | --- | --- | --- | --- |
| `flat` (colour only) | 0.000 | 0.000 | — | — |
| `grain` (body feTurbulence) | 0.007 | 0.007 | — | — |
| `+wash` (three radials) | 0.900 | 0.740 | 449px (p=0.191) | 450px (p=0.227) |
| `+texture` (the tile) | **1.154** | **0.772** | **268px (p=0.452)** | 450px (p=0.227) |

Two results matter:

* **The texture no longer contributes a periodic component.** In v2.2, adding
  the tile introduced a 268px component with power 0.452 — 268px is the 256px
  tile seen through the smoothing window, and power 0.452 is a strong, coherent
  stripe field. In v2.2.1 the period does not move when the tile is added (450px
  is already present in the `+wash` row) and the power stays at 0.227. A 128px
  isotropic tile cannot produce a 256px-periodic field, and the measurement
  agrees.
* **Total row-to-row variation in the full page fell 1.154 → 0.772, −33.1%.**

### 2.4 The acceptance criterion, rendered

§2's acceptance test is visual, so it was produced rather than argued.
`.qa-screens/v221/amp-compare.mjs` captures the full document of `/research/`
with chrome and marks hidden, crops the same 900×420 window at (180,1500) from
both builds, subtracts a 64px local mean and multiplies by 18.

```
.qa-screens/v221/_diag/amp-side-by-side.png   (left = v2.2, right = v2.2.1)
```

The left half is a field of elongated horizontal smears. The right half is
uniform, directionless speckle with no axis. This is the §2 criterion — *"the
texture's direction must be unidentifiable"* — as an image rather than a claim.

### 2.5 A metric that was tried and is not being cited

A second metric was added to the diagnostic: `step`, the mean discrete second
difference divided by the mean first difference of the profile. The derivation
is sound for a single monotone ramp — a linear ramp gives 0, a staircase gives
2 — and the intent was to distinguish a *smooth* gradient from a *stepped* one,
which is precisely the quantisation question.

It does not discriminate here, and it is reported rather than quietly dropped.
The wash is the sum of three overlapping radials, so its vertical profile has
genuine curvature, and curvature produces second differences with no stepping
involved. `step` therefore conflates curvature with edges, and it moved the
wrong way (v2.2 `+wash` 1.059 → v2.2.1 `+wash` 1.269) while the absolute
variation it was supposed to explain fell. The four lines of evidence in §2.2
and §2.3 are the ones this round stands on; `step` is left in the tool as a
record of an approach that did not work.

---

## 3. The corrected paper texture

`scripts/build-paper-texture.mjs`, rebuilt.

* **128×128**, `SEED = 20260921`, **alpha-only** (RGB constant black, all
  variation in alpha) so that Night can reuse the same file under
  `filter: invert(1)` rather than shipping a second asset.
* Six octaves on a **square** lattice — `[[4,0.26],[8,0.22],[16,0.2],[32,0.16],
  [64,0.11],[128,0.05]]` — with the noise index taken modulo the lattice size,
  which is what makes the tile join itself. Seamlessness is structural, not
  tuned afterwards.
* Alpha quantised to **64 levels** (6-bit) and encoded **losslessly**
  (`sharp(...).webp({ lossless: true, effort: 6 })`). Lossy WebP compresses alpha
  in blocks, which is a second, independent banding source; at 128×128 the
  lossless file is 6.5 KB, so the trade is free.
* Measured output: `128×128 · 6.5 KB · mean alpha 0.4962 · mean |step| X 0.0213
  Y 0.0212 · anisotropy 1.0055 · seam X 0.9997 · seam Y 0.9982`.
* `--bg-texture`: paper 0.038 → **0.022**, white **0.018**, night **0.025**.

The script now **fails itself** if anisotropy leaves `[0.9, 1.1]`, if a seam
ratio exceeds `1.01`, or if the file exceeds 30 KB. The property the brief asked
for is therefore enforced by the build rather than asserted in a report: a
future edit that reintroduces directionality cannot ship silently.

---

## 4. The four layers, and only four

`ScientificEditorialBackground.astro` mounts exactly four things, and the visual
gate asserts that there is no fifth:

| | layer | implementation |
| --- | --- | --- |
| A | base colour | `--canvas`, the theme's warm paper |
| B | radial depth | **three fixed-size radials in `rem`** |
| C | paper grain | the one 128×128 tile |
| D | scientific marks | two to four inline SVG groups |

There is no blur, no `backdrop-filter`, no repeating gradient, no second raster
and no page-wide sweep.

**Layer B is the §2.1 fix.** The radials changed from percentage-sized ellipses
to fixed sizes:

```css
background-image:
  radial-gradient(40rem 28rem at 78% 1rem,  var(--bg-blue),  transparent 72%),
  radial-gradient(36rem 30rem at 2% 22rem,  var(--bg-green), transparent 74%),
  radial-gradient(52rem 26rem at 46% 100%,  var(--bg-warm),  transparent 78%);
```

A fixed-size glow stays a glow whatever the page length, so it cannot become a
1,200px ramp that quantises into arcs. The stops are also fully transparent well
before the next gradient begins, so no coloured patch can become visible.

**Layer C's size is asserted in the browser test suite**, not only in the
generator: `tests/background.spec.ts` reads `background-size` off the rendered
element and requires `128px 128px`. A later "let's make the grain finer" edit
that quietly grew the tile would restore the periodicity without touching the
generator, and nothing else in the suite would notice.

---

## 5. Per-page variants and the density table

`GROUPS` (five modes, one composition, differing only in fragment count) was
replaced by `VARIANTS` (seven modes, each naming its own mark set, density and
placement).

| variant | route | `--ebg-scale` | marks mounted |
| --- | --- | --- | --- |
| `home` | `/` | 1 | formula · curve · neural |
| `projects` | `/projects/` | 0.85 | formula · curve · neural |
| `research` | `/research/` | **1.4** | neural · formula · cell · curve |
| `about` | `/about/` | 0.78 | formula · grid · neural |
| `resume` | `/resume/` | **0.5** | formula |
| `opensource` | — reserved | 0.62 | curve · neural |
| `minimal` | `/404` | 0 | none |

**Measured on the rendered pages** (`npm run qa:v221`, `measurements.json`), at
1440, both locales:

```
research 1.4  >  home 1  >  projects 0.85  >  about 0.78  >  resume 0.5
```

which is the brief's density table, and the order is asserted by a browser test
rather than by reading the stylesheet — a variant that differed only in its name
would pass a uniqueness check and fail that one.

Two dials multiply and stay independent: `--ebg-scale` (this page) ×
`--ebg-mobile` (this viewport, 0.7 below 900px). They are deliberately **not**
combined into one self-referencing `var()`, which silently resolves to the
fallback and gives every mode the same weight.

`opensource` is declared and reserved. The repository's open-source surface is a
section of `/projects` rather than a route of its own, so nothing mounts it
today; it exists so that the day it becomes a page it inherits a field of its
own instead of `/projects`'.

---

## 6. The scientific marks as a composition

The three changes that turn scattered watermarks into a composition:

1. **Notation is now a margin note.** v2.2 placed six glyphs at six unrelated
   offsets across a 420×300 box. It is now three lines, left-aligned on a shared
   origin with tight leading — `∂u/∂t`, `∇L(θ)`, `p(z|x)` — so the group reads
   as something someone wrote down. (`dx/dt` and its five companions are gone.)
2. **The dot matrix became a ruled-grid fragment.** A field of dots reads as a
   data matrix, which is a figure; §27 asks for the hint of ruled paper behind a
   personal note. Six vertical and four horizontal hairlines, unevenly spaced,
   stopping before the edge of their box rather than closing into a table.
3. **The helix was removed.** It was the one group that drew a *thing* rather
   than a relation, and on `/about` it was competing with the cell.

Placement is per variant and follows one of two rules, and which rule a group
uses is a statement about what it belongs to: `top: <rem>` for a mark that
belongs to the top of the page (a length keeps it there when the page grows),
`top: <n>%` for a mark that belongs to a *region* of a long page. v2.2 used
percentages for everything, which is why fragments drifted away from the part of
the page they were drawn for. Every position is a constant — no `Math.random`,
no time, no per-render variation, all of it asserted against the source by the
visual gate.

**Weight is now one token per mark kind.** On `/research/` the four rendered
opacities are notation **0.059**, curve **0.070**, cell **0.073**, network
**0.081** — four distinct values, all inside the four bands §18 named, with
notation the lightest thing on the page and the network the heaviest. In v2.2
the curve and the network shared one token, so two of the four bands collapsed
into one.

`aria-hidden="true"` and `pointer-events: none` are on the host element, nothing
inside is focusable, and the browser suite asserts all three.

---

## 7. Research — the editorial hero

The page was a stacked `SectionHeading` above a full-width picture. It is now a
two-column grid:

```css
grid-template-columns: minmax(0, 46fr) minmax(0, 54fr);   /* ≥1024px */
align-items: center;
min-height: clamp(520px, 58vh, 680px);
```

* **Measured hero height: 522px** at a 900px viewport — inside the requested
  520–680px band, and the direction list now enters the first screen.
* **Measured h1: 54.4px**, against 64px for the same element on `/projects/` and
  `/resume/`. **−15.0%**, inside the requested 12–18%.
* The accent bleeds into the right gutter with
  `margin-right: calc(-1 * clamp(1rem, 3vw, 3.5rem))`, so the composition
  reaches the page edge the way the copy does not.

**The copy changed, and the count is no longer stated.** Removed:
`五个持续投入的方向。每个方向只给出问题本身，不展开方法。` The Chinese lead is now
`探索生命系统、计算模型与智能系统之间值得长期研究的问题。` and the English lead is
`Exploring long-term questions across biological systems, computational models
and intelligent systems.` A browser test asserts that six phrasings of the
removed sentence — including `五个方向` and `Five directions` — appear nowhere in
the rendered page, in either locale.

The direction list is untouched in structure: five areas in two tiers, each a
title, one or two sentences and an optional project reference.

---

## 8. Research — the demoted raster

`research.webp` was not deleted and was not regenerated. It was demoted from
"the page's picture" to a side accent, exactly along the four axes the brief
allowed:

| axis | v2.2 | v2.2.1 |
| --- | --- | --- |
| role | page hero band, full width | side accent, right column |
| opacity | 1.0 (in the band) | **0.18** paper/white, **0.14** night |
| crop | `8 / 5` | **`3 / 2`** |
| mask | symmetric feather 9% / 96.5% | right-anchored fade, dissolving left |

The mask is two nested gradients that multiply, which avoids `mask-composite`
and its vendor differences: a horizontal `linear-gradient(to left, #000 0%, #000
40%, transparent 100%)` on the image and a vertical
`linear-gradient(to bottom, transparent 0%, #000 12%, #000 88%, transparent 100%)`
on the frame. There is no rectangular edge.

**Measured single transfer at 1440: 29.8 KB** — `research-640.webp` at 23.1 KB
plus the 6.8 KB texture. The accent's `sizes` is `(min-width: 1024px) 590px,
calc(100vw - 3rem)`, so a 1440 viewport takes the 640 rung and never the 1440
file.

`about.webp` received the same treatment on `/about`, which is §26's
requirement that About be quieter than Research rather than a second copy of it.

---

## 9. Projects — the contraction

`ProjectEntry` now renders four fields, and the visual gate fails if a fifth
appears:

```
Project Name · one-line positioning · status · View project →
```

The `<p class="entry-intro">` and its CSS rule are gone. The long `description`
is **not** deleted from the content collection — it still supplies each case
page's meta and OG description, and the case page's own body was always the
fuller account.

The three phrases the brief quoted as examples of text to remove were checked
against the built page rather than assumed:

```
把分散的健康信息整理成        → 0 occurrences in dist/zh/projects/index.html
研究如何用模型表示细胞状态    → 0
让 AI 在用户自己的机器上协作  → 0
```

and the `.entry-line` that does render is the short `publicLine` value
(`面向个体健康与衰老研究的 AI 产品探索`, etc.).

**"Other work" is hidden from the public page without deleting data.** The
section is gone from both locales; the three projects' frontmatter, case pages
and evidence layer are untouched. Measured: `.other-list li` = 0 on `/projects/`,
and the string `other-list` appears in no built page at all.

---

## 10. Projects — the retired evidence block

The inverted "公开成果精选" room is no longer mounted anywhere.

* `SelectedArtifacts.astro` still exists in the tree, and `src/data/artifacts.ts`
  is unmodified — the gate reports `5 artifact entries parsed` and `0 artifact
  rows` rendered in each locale, which is the point: the data survived, the mount
  did not.
* The visual gate's `RETIRED` list gained `SelectedArtifacts`, so the guard is
  the same one the v1.7 canvas gets: **nothing under `src/` may import it.** If
  that check ever goes green again, the black block has come back onto a paper
  page.
* §44's exit is one line of text — `公开成果精选 →` / `Selected Public Work →` —
  linking to GitHub. A browser test asserts there is exactly one, that it is a
  link rather than a section, that it contains no heading, list, grid, `pre`,
  `code` or `img`, and that its rendered height is under 80px.
* A second browser test asserts that no element inside `main` paints the old
  dark palette (`rgba(17|21|28, …)`). The paper is the paper all the way down.

---

## 11. Open Source, About and Resume

**Open Source — four fields per row** (`§45–§48`): repo name · one-line
description · language · `GitHub ↗`. The role, licence and last-update columns
and the "metadata snapshot" line above them are gone, because GitHub already
shows all of it. `src/data/oss.ts` is untouched. The lead is now one line:
`公开仓库与部分开源工作。` / `Public repositories and selected open-source work.`
A browser test walks every row and asserts the four fields are present, the link
resolves to `github.com`, and `Metadata snapshot`, `.oss-facts`, `.oss-snapshot`,
`License` and `Updated` appear zero times.

**About** (§25–§28) is medium-low and quieter than Research: a margin note, a
ruled-grid hint and a small node group — no cell, no helix, no large network.
Two passages of personal methodology were trimmed in both locales (the
"one engineer rather than a team of five" aside and the closing clause about
mathematics supplying the language). `about.webp` is a right-side environment
rather than a centred rectangle.

**Resume** (§29–§32) is very low: the warm paper base, very fine grain, and one
notation fragment at 0.5 scale. **Measured content width 944px**, up from 848px,
inside the requested 900–1040px band, with 192px margins remaining. On a phone
the page carries no marks at all.

**Footer duplication** (§49) was checked rather than assumed. Three pages carry
their own contact surface — `/`, `/about` (which closes on a contact section)
and `/resume` (which prints the details in its head and again in its contact
block). On those three the footer row was a third copy of the same four links,
so all three now render a minimal footer. `/projects`, `/research` and the case
studies keep the full row, because there the footer is the only contact surface
and it is what the identity gate asserts a fixed order against.

---

## 12. Widths, heading sizes and overflow

| check | result | source |
| --- | --- | --- |
| `/resume/` content box at 1440 | **944px** (was 848px) | `measure-width.mjs` |
| `/research/` h1 at 1440 | **54.4px** vs 64px elsewhere → −15.0% | `qa:v221` |
| horizontal overflow, 20 frames × both locales | **0** on every one | `qa:v221` |
| horizontal overflow, 7 widths × 5 routes (incl. `/zh/`) | 0 | `site.spec.ts` layout integrity |

---

## 13. QA matrix

**§56 — no-image.** `/`, `/research/` and `/about/` were captured at 1440 with
every raster request aborted. `/research/` — the page the brief singled out —
keeps **2,648 characters** of body text (en) and 1,012 (zh), its `<h1>` is
present and laid out, its background is painted at full document height (3,315px
of 3,315px), and it still carries 4 mark groups because Layer D is inline SVG
rather than a raster. It is not a large blank. `home` and `about` likewise.

**§57 — slow network.** Two profiles, on the pages that carry the most artwork:

| profile | page | FCP | request order |
| --- | --- | --- | --- |
| Fast 3G (1.6 Mbps / 750 kbps / 150 ms) | `/` | **528 ms** | hero 185→593 ms, texture 445→655 ms, three project plates 499 ms |
| Fast 3G | `/research/` | **552 ms** | — |
| Slow 4G (400 kbps / 400 ms) | `/research/` | **1,380 ms** | accent 480→1,523 ms, texture 1,267→1,829 ms |

The page is readable before the artwork lands and the artwork arrives last,
which is the property §85 asks for. These are local loopback timings under
emulation, not field measurements.

**§58 — no skeleton, spinner or shimmer.** `skeleton|spinner|shimmer|
animate-pulse|placeholder-shown` returns nothing across `src/`.

**§62 — cursor untouched.** The only `cursor:` declarations in the tree are in
two case-study components this round did not open.

**§67 — the background is inert.** `aria-hidden="true"`, `pointer-events: none`,
zero focusable descendants, asserted in both the gate and the browser suite.

---

## 14. Gates, Playwright, and what is still open

### 14.1 The stack, each with its exit code

All measured on a fully LF working tree (a CRLF scan of the tree returns 0
files), so these are the bytes CI will build.

| step | result | exit |
| --- | --- | --- |
| `npm run lint` | clean | **0** |
| `npm run typecheck` | 108 files, 0 errors / 0 warnings / 0 hints | **0** |
| `CODEBUDDY_SAFE_DELETE_ENABLED=0 npm run build` | 26 pages | **0** |
| `npm run verify` | 75 files, 26 HTML pages, 632 internal links, 22 local assets | **0** |
| `npm run theme` | 1080 checks | **0** |
| `npm run artifacts` | 137 checks · 5 entries parsed, 0 rows rendered per locale | **0** |
| `npm run science` | 1895 checks · 108 files | **0** |
| `npm run visual` | 745 checks | **0** |
| `npm run identity` | 412 assertions | **0** |
| `npx playwright test --workers=1` | **327 passed / 5 skipped / 0 failed** | **0** |
| `npm run qa:v221` | **37 frames** + `measurements.json` | **0** |
| `dist/` | **75 files**, 0 residue, 0 source-artwork leakage | — |

### 14.2 The Playwright delta, accounted for

v2.2 was 322 / 8 / 0. This round is 327 / 5 / 0. The change is fully explained by
the specs themselves and was checked rather than guessed:

* `artifacts.spec.ts` was rewritten from 8 tests (3 conditional skips) to 6
  tests (0 skips), because the block it tested no longer exists: −1 pass, −3
  skips.
* `background.spec.ts` gained 3 tests (a fifth route in the kind loop, the
  variant/density hierarchy, and the phone clears the field on the two document
  pages): +6 passes across the two projects.
* Net: 322 + 6 − 1 = **327 passed**, 8 − 3 = **5 skipped**.

The conditional-skip count is a static property of the specs and matches: 8
`test.skip` calls at `HEAD`, 5 now.

### 14.3 `dist/` is 75 files, one fewer than v2.2

Reported because a silent file-count change is exactly the kind of thing that
should not pass without explanation. A clean build of `baa716a` was produced in
an isolated export and the file lists were diffed:

```
only in v2.2:      _astro/about.N14eJ5w7.css
                   _astro/index.CtzGD9Sq.css
                   _astro/resume.DAefX7AP.css
only in v2.2.1:    _astro/about.DbKRxH47.css
                   _astro/resume.CjBju15f.css
```

v2.2 emitted four CSS chunks, v2.2.1 emits three. The missing one is
`index.CtzGD9Sq.css` (6,261 B), which contained `.entry-intro`, `.oss-facts` and
`.ar-row` — the styles of exactly the three surfaces this round removed. With
those rules gone, `/projects/`'s own stylesheet fell below Astro's inline
threshold and is now inlined into `dist/projects/index.html`. Nothing was lost;
one chunk became an inline block.

### 14.4 Open items

Stated rather than buried, because each is a judgement the owner may want to
overrule:

1. **The wash is still the largest single contributor to smooth vertical
   variation** — 0.740 of the page's 0.772 total rowσ. It is a *smooth* gradient
   by design (§4 asks for radial depth), and the change from percentage ellipses
   to fixed `rem` radii removed its ability to become a 1,200px quantised ramp,
   but the residual is not zero. The `step` metric that was supposed to
   characterise it did not work (§2.5) and is not being claimed.
2. **The Research hero's raster accent and its marks share the upper right.**
   The marks are inside the background layer at `z-index: -1`, so the accent
   paints over them at 0.18. The composition stays legible, but if the owner
   reads the notation as muddy, the fix is to move the notation out from under
   the accent rather than to raise the marks above the page.
3. **Two markers in the science gate are dead.** `Δx =` and `dx/dt` match
   nothing a page renders; the drawing that used them belongs to the retired
   v1.7 canvas. They are retained deliberately — a marker that matches nothing
   costs one regex, and deleting it would mean that if that notation returned to
   a page that *presents* it, the label rule would silently stop applying.
4. **`.qa-screens/v221/` is gitignored.** The 37 frames, the two amplified
   comparisons and `measurements.json` are local evidence; the report cites them
   by path. If the owner wants them committed, that is a separate decision.
5. **`astro check` reports 108 files against v2.2's 107.** `tsconfig.json`
   includes `**/*.mjs`, and exactly one new `.mjs` was added this round
   (`scripts/qa-v221-shots.mjs`), so 107 + 1 = 108. No source file was added or
   removed.

---

## 15. Recommendation

The five reported defects are addressed, and the one that needed measurement —
the horizontal banding — has a root cause that was found, fixed at the
generator, and re-measured with the same instrument on both builds. The
correction is enforced rather than asserted: the texture script fails itself if
it stops being isotropic, and the visual gate fails if a fifth layer, a
mis-ordered density, a re-mounted evidence block or a returning `entry-intro`
ever comes back.

The prohibitions held: no merge, no deploy, no architecture change, no artwork
regenerated, no fact-layer edit, no new skill.

**State: `WAITING_FOR_OWNER_VISUAL_APPROVAL`.**

---

# Independent verification — 2026-09-20

This section was not written by the round that produced the report. It is a
second, independent re-run of §14.1 against the working tree as it stood at
19:44–19:51, recorded here because the round's own numbers are self-reported and
should not be the only account of them. Nothing below was taken on trust; every
line is a command with an exit code.

## 1. Every §14.1 number reproduced

| step | report | re-measured | exit |
| --- | --- | --- | --- |
| `npm run lint` | clean | clean | **0** |
| `npm run typecheck` | 108 files, 0/0/0 | 108 files, 0 errors / 0 warnings / 0 hints | **0** |
| `npm run verify` | 75 files, 26 pages, 632 links, 22 assets | 75 files, 26 HTML pages, 632 internal links, 22 local assets | **0** |
| `npm run theme` | 1080 checks | 1080 checks (3 themes × 45 tokens) | **0** |
| `npm run artifacts` | 137 checks · 5 parsed, 0 rows/locale | 137 checks · 5 entries parsed, 0 rows, 0 raw bodies per locale | **0** |
| `npm run science` | 1895 checks · 108 files | 1895 checks · 108 files scanned | **0** |
| `npm run visual` | 745 checks | 745 checks | **0** |
| `npm run identity` | 412 assertions | 412 assertions | **0** |
| `npx playwright test --workers=1` | 327 / 5 / 0 | **327 passed / 5 skipped / 0 failed** | **0** |
| `dist/` | 75 files, 0 residue, 0 leakage | 75 files, no `*source*`, no `manifest_*.mjs` | — |

The CRLF claim in §14.1 was also re-checked independently rather than accepted:
a byte-level scan of **161 text files** across `src/`, `scripts/`, `tests/`,
`public/` and the repo root (excluding `node_modules`, `dist`, `.git`, `.astro`,
`.qa-screens`) found **0 files containing `0x0d`**.

## 2. The header's file count is stale, by exactly two files

The header says `31 files changed, +1670 / −1149`. Re-measured from `ef6c797`
(the commit the round actually started from):

```
$ git diff --shortstat
 33 files changed, 1774 insertions(+), 1202 deletions(-)

$ git diff --shortstat -- . ':(exclude)README.md' ':(exclude)src/content.config.ts'
 31 files changed, 1670 insertions(+), 1149 deletions(-)      # ← the header's number
```

The exclusion reproduces the header **exactly**, which identifies the drift
rather than guessing at it: `README.md` (written 19:45:35) and
`src/content.config.ts` (written 19:46:22) were both edited **after** this report
was finalised (19:36:24), and the header was not brought forward.

Two further notes on the base label, since it is easy to misread:

* The header names `baa716a` as the base, but `ef6c797` (the README reformat)
  was committed between `baa716a` and this round. Measured from `baa716a` the
  tree is **33 files, +1892 / −1235** — that figure also contains the README
  reformat and is *not* the round's own delta.
* The round is **35 files** end-to-end: 33 tracked + 2 untracked
  (`V2_2_1_VISUAL_CORRECTION_REPORT.md`, `scripts/qa-v221-shots.mjs`).

## 3. Why `dist/` is nevertheless still valid

`src/content.config.ts` is newer than `dist/index.html`, which normally means the
build is behind its source. It is not, here, and this was checked rather than
assumed: **the entire diff of `src/content.config.ts` is inside JSDoc blocks.**
Every added and removed line sits within `/** … */`; the schema body —
`description: z.string()`, and every other field — is unchanged. TypeScript
comments are stripped and cannot reach emitted HTML, so the 19:32 build remains
a faithful build of the current tree and no rebuild is required.

This is worth stating explicitly because the opposite conclusion would have been
easy to reach from timestamps alone.

## 4. Playwright ran against the real artifact, not a rebuild

The full suite reuses the running preview because
`playwright.config.ts` sets `reuseExistingServer: !process.env.CI` on port 4321.
That was verified rather than assumed: `dist/index.html` still carried its
19:32:44 mtime after the suite finished, and `dist/` still held 75 files — a
`npm run build` would have moved both. The suite therefore exercised the
artifact described in §14.3, not a fresh one.

## 5. What this does and does not establish

Established: the §14.1 stack reproduces exactly on an independently invoked run,
the tree is LF-clean, `dist/` is a 75-file artifact with no leakage, and the
Playwright delta of §14.2 (327 / 5 / 0) is real.

Not established, and not claimed: anything visual. This verification says the
gate stack agrees with the report. Whether the correction is *right* is the
owner's judgement, and that is what the terminal state is waiting on.

---

# Owner decision applied — release

The owner was asked, with the verification above in hand, and answered
**"批准并发布"** (approve and release). The round was then merged and deployed.
Every number below is from a command that ran.

## R1. What the owner approved

Not a re-review of the report's claims — those had already been re-measured
independently (previous section). The approval was the visual judgement the
terminal state was holding for, and it also lifted the repository's standing
prohibition on merging to `main` and deploying.

## R2. Commit and merge

```
b980d63  v2.2.1: scientific editorial visual correction
         35 files changed, 2852 insertions(+), 1202 deletions(-)
         create V2_2_1_VISUAL_CORRECTION_REPORT.md
         create scripts/qa-v221-shots.mjs
```

Pushed with a ref-to-ref push, so the working tree was never checked out:

```
$ git push origin visual-v20-homepage-reset:main
   ef6c797..b980d63  visual-v20-homepage-reset -> main
$ git fetch . visual-v20-homepage-reset:main
   ef6c797..b980d63  visual-v20-homepage-reset -> main
```

`local main` = `remote main` = `HEAD` = `b980d63`, working tree 0 modified
before and after. No `git checkout` was used: this repository has a documented
CRLF trap in which `checkout` rewrites every text file and the `\n`-anchored
gate regexes fail while the build still passes.

## R3. CI

Run **`35509100236`** — **completed / success**, **26 steps, 0 non-success**
(step 16 `Install Playwright browser` skipped: cache hit).

All thirteen gate steps passed on CI: Lint, Typecheck, Build, Verify build
output, Check theme system, Check artifacts, Check science copy, Check visual
system, Check public identity, then Test, Configure Pages, Upload artifact, and
the `deploy` job's `Deploy to GitHub Pages`.

That `Build` passes on CI with an unmodified `npm run build` is itself a
result: locally that command exits 1 because Astro's `cleanServerOutput` is
stopped by the sandbox's safe-delete guard *after* the pages are written. CI
proves the non-zero local exit is an artifact of this environment, not a
property of the tree.

## R4. Live verification

All six routes are **byte-identical** to `dist/`. Fetched with cache-busters
and retried; the sandbox proxy truncates responses intermittently, so a single
response was never trusted.

| route | live | `dist/` |
| --- | --- | --- |
| `/` | 46,001 | 46,001 |
| `/zh/` | 45,931 | 45,931 |
| `/research/` | 48,438 | 48,438 |
| `/projects/` | 47,043 | 47,043 |
| `/about/` | 42,115 | 42,115 |
| `/resume/` | 44,151 | 44,151 |

Published assets, same method:

| asset | live | `dist/` |
| --- | --- | --- |
| `/texture/paper.webp` | 6,622 | 6,622 |
| `/images/home/v2/hero-640.webp` | 39,634 | 39,634 |
| `/images/home/v2/hero-960.webp` | 82,238 | 82,238 |
| `/images/home/v2/hero-1440.webp` | 156,264 | 156,264 |

`hero-1440.webp` needs a note, because it first looked like a CDN mismatch.
Five GETs returned `0`, `156264`, `156264`, `156264`, `113995` — three complete,
two truncated mid-transfer. A `HEAD` settled it: `Content-Length: 156264`,
`Content-Type: image/webp`, `Last-Modified: Sun, 20 Sep 2026 11:56:25 GMT`
(the deploy). **The file is correct; the short reads were the proxy, not the
CDN.** The texture is now 6,622 B, down from v2.2's 16,444 B.

Homepage markers: `data-editorial-background` 1 · `global-scientific-canvas` 0
· `entry-intro` 0 · `hero-640.webp` 2 · `color:transparent` 1. The retired
canvas has not been revived and the retired surface has not returned.

Six URLs that must not resolve were checked and all return **404**:
`/images/home/v2/hero-source.png`, `/images/home/v2/wennian-source.png`,
`/images/home/v2/README.md`, `/images/site/v2/pages/research-source.png`,
`/images/home/v2/hero.webp`, `/images/home/v2/wennian.webp`.

## R5. State

**`RELEASED`.** `main` = `b980d63`. Nothing about this round is pending.
