# V2.0-P0 — Homepage Visual Reset

**Status: `WAITING_FOR_OWNER_VISUAL_APPROVAL`**

Not a release. Nothing has been merged to `main`, nothing has been deployed. This
round produces a visual prototype on a feature branch, three review screenshots,
and this record.

The brief's own words for this round: *abandon the ugly visual paradigm and build
a homepage that reads as a piece of work rather than as an explanation.*

---

## 1. Branch

```
visual-v20-homepage-reset
```

Created off `main` (`7420f53`). The brief allowed `visual/v20-homepage-reset` or,
if the environment could not take a slash, `visual-v20-homepage-reset`; the second
form was used. `main` is untouched, and `visual-v17-scientific-editorial` is left
as it was so the two paradigms can be compared side by side.

---

## 2. Files changed

### New

| Path | What it is |
|---|---|
| `scripts/generate-home-artwork.mjs` | 32 KB. Generates the five drawings. Deterministic (fixed seeds); re-running is a no-op in git. |
| `src/assets/home/hero.svg` | 22 KB. The hero artwork. |
| `src/assets/home/wennian.svg` | 24 KB. 知身·问年 cover. |
| `src/assets/home/hycell.svg` | 28 KB. HyCell cover. |
| `src/assets/home/morn.svg` | 25 KB. Morn cover. |
| `src/assets/home/biopulse.svg` | 20 KB. BioPulse cover. |
| `src/components/Artwork.astro` | The one frame that renders the five drawings. Inlines the SVG so the `--art-*` tokens can reach it. |
| `src/components/ProjectFeatureRow.astro` | One project as a work entry, not a card. |
| `src/data/home.ts` | `ARTWORK_LABELS` (spoken description of each drawing) and `HOME_STATUS` (which single evidence field a project shows). |
| `scripts/qa-v20-shots.mjs` | Produces the three review screenshots. |

Total new asset weight: **118.5 KB of SVG** for all five drawings, uncompressed.
That is the entire visual payload of the homepage.

### Modified

| Path | Change |
|---|---|
| `src/pages/zh/index.astro` | Rewritten. This is the page under review. |
| `src/pages/index.astro` | Rewritten as the English mirror. |
| `src/components/MathematicsBiologyAI.astro` | Compressed to a statement band; one CSS-gradient texture, no second drawing. |
| `src/layouts/BaseLayout.astro` | New `canvas` prop, default `true`. The homepage passes `false`. |
| `src/styles/global.css` | `--art-*` token set for all three themes; CJK font-stack correction (see §10). |
| `src/i18n/ui.ts` | `work.project` ("View project" / "查看项目"); new `home.contact.line`. |
| `scripts/check-visual-system.mjs` | Rewritten to assert the v2.0 homepage: row copy length, no canvas, five drawings, four content areas. |
| `scripts/check-theme-system.mjs` | Checks the `--art-*` tokens exist and stay in contrast range per theme. |
| `tests/site.spec.ts` | Homepage assertions rewritten for the new structure. |
| `tests/cover.spec.ts` | Cover assertions updated for the new drawings. |
| `package.json` | Added `npm run artwork`. |

```
11 files changed, 628 insertions(+), 370 deletions(-)
```

---

## 3. Hero visual approach

**What was removed.** The v1.7 hero was three layers arguing with each other: a
text column, a bordered system figure beside it, and the page-wide scientific
canvas behind both. Every layer was drawn in the same 1px hairline language, so
the hero had no focal point — the eye had nowhere to land first.

**What replaces it.** One text column on the left, one complete drawing on the
right, and nothing behind either. The `GlobalScientificCanvas` is no longer
mounted on the homepage at all (`canvas={false}`); it remains on every inner page,
where it is the atmosphere and nothing competes with it.

**The drawing.** A single scientific field: a biological state landscape rendered
as nested iso-lines over a soft tonal wash, its ridge carried in stipple, crossed
by one trajectory that enters at the lower left, bends through the field and
leaves at the upper right with a single cobalt terminal. It is one composition,
not a set of marks.

Five ingredients, used at fixed weights in all five drawings (§23):

- **wash** — one radial gradient, giving depth without ever becoming a panel;
- **contour** — a smooth scalar field as iso-lines, spaced evenly in *value* so
  they read unevenly on the page, which is what makes it look like a surface
  rather than a pattern;
- **stipple** — ink dots sampled inside one value band, so the tone follows the
  form. This is the biological ink;
- **one thread** — a single trajectory, the heaviest line in the frame and the
  only one that moves;
- **one accent** — exactly one cobalt moment per drawing, no exceptions.

**Reading order (§8).** The name is the first thing on the page and sits alone at
the top of the left column. The drawing is second. The scientific register —
mathematics, biology, agents — is third: it is something you notice *after* you
have seen a person and a picture, not a label applied first.

**Prohibitions honoured (§7).** No caption, no plate title, no "CELL STATE
LANDSCAPE", no `posterior / likelihood / prior`, no grid, no matrix of arrows, no
labelled boxes. The generator enforces this: it emits no text of any kind.

The first screen is **684px** — 76vh, not a full one. The page hands the eye on to
the work instead of insisting on filling the window.

---

## 4. Featured Projects layout

Four rows, stacked, alternating sides (§10, §11). Not a 2 × 2 mosaic, not four
cards.

```
Row 1 — 知身·问年    drawing left   · text right
Row 2 — HyCell       text left      · drawing right
Row 3 — Morn         drawing left   · text right
Row 4 — BioPulse     text left      · drawing right
```

The drawing takes seven of twelve columns (605px at 1440), the words take four
(315px), and the empty column between them (168px including its two 72px gutters)
is the separator — there is no rule, no border and no card fill between rows.

**What each row is allowed to say (§14).** The name, one type line, one status,
one primary link, and optionally the repository. Nothing else. Removed from v1.7:
the index number, the category eyebrow, the keyword list, the proof line, the
second copy of the public-code fact, the border and the card fill. The visual
gate measures this — each Chinese row now carries **18–25 characters** of body
copy, and each English row **53–70**.

**Row height: 453px**, inside the 360–520px band (§12). Rows 1–4 are all 453px;
an alternating layout that also varied in height would read as broken rather than
as rhythm.

### One honest note on §12

§12 also asks that the projects area be *lighter than v1.6 and v1.7*. Measured
against v1.7, it is not — and the arithmetic of the brief makes that unreachable:

| | v1.7 | v2.0 |
|---|---|---|
| Layout | 2 × 2 mosaic | 4 stacked rows (§10) |
| Row height | ~938px | 453px |
| Work section total | 1877px | 2496px |
| **Per project** | **469px** | **453px** |

Per project, v2.0 is **3% lighter**. The section is 33% taller because §10 mandates
four stacked rows, which need four row-slots where a 2 × 2 grid needs two. Four
rows at the §12 minimum of 360px each still put the section at roughly 2100px,
above v1.7's 1877px, before any drawing is placed.

§10 (four vertical rows) and §12 (rows ≥ 360px, section lighter than v1.7) cannot
both hold. This round honoured §10 and the row band, because those are the
concrete structural instructions and the ones that shape how the page reads. If
the owner prefers the absolute height target, the honest lever is a smaller
drawing per row — narrowing the art column from seven columns to six drops the row
to ~381px and the section to roughly 2200px — not more whitespace or compressed
type.

---

## 5. The four project visuals

Each is a complete cover, not a diagram of the product. All four share the
material system in §3, so they read as one body of work, and each carries a
different subject.

| Project | Drawing | What it says |
|---|---|---|
| **知身·问年** | An irregular biological state form with three fainter outlines behind it for the same state at later times, a row of fine ticks along the foot for many measured dimensions, and one curve rising from the lower left. | A personal state, changing over time, measured across many dimensions, with a direction. |
| **HyCell** | A cell form with internal structure, one trajectory entering from the left and crossing it to a target state at the upper right, plus a shorter branch settling below. | A cell, its internal state, an intervention and its outcome. |
| **Morn** | Three plateaus stepping up the frame, with one thread entering at the lower left, passing through each in turn, and leaving at the upper right. | Orchestration: one thread through several stages of a local runtime. |
| **BioPulse** | Six streams entering from the left, gathering into a single channel at the centre, and continuing to the upper right as one record. | Many evidence sources converging into one checked record. |

**Real material was preferred (§24), and the honest answer is that none was
usable.** No project here has a public interface that can be shown without
inventing one. BioPulse, HyCell and Morn have public repositories but no shipped
UI; 知身·问年 is in active development. Putting a screenshot on the homepage would
have meant putting a rendered mockup of a product that does not exist on a page
that elsewhere says, in the same voice, *nothing here is a rendered mockup*. That
trade was not worth a prettier row. So the second option in §24 — a unified project
illustration — was used for all four, drawn from the same generator as the hero so
the material genuinely matches rather than merely resembling it.

---

## 6. Statement band

Kept, and compressed (§27, §28). It is one breath, not a research section: a short
statement, one expression, one way out.

> 生命系统有状态、变化、噪声与干预。数学提供结构，AI 学习那些无法被完整写成方程的部分。

with `zₜ₊₁ = F(zₜ, aₜ)` and `查看全部研究方向 →`.

Removed: the three-question list, the multiple figures, the long exposition, the
formula wall. **Band height 320px** — down from 380px in v1.7.

This is the one place after the hero where the page is allowed a little scientific
texture again (§9). It is a **CSS gradient** of faint ruled lines, faded at both
edges — not another drawing. Adding a second SVG here would rebuild the
"many small diagrams" problem this round exists to remove.

---

## 7. Contact and footer

**Contact (§29).** A name, one positioning line, four links. No card, no eyebrow,
no second content block, no /about link (that is in the header, and repeating it
would make this band a module again).

```
郝磊
生命科学 × 计算生物学 × AI 系统
GMAIL · QQ 邮箱 · GITHUB ↗ · 简历
```

Band height **282px**, background fully transparent — it is part of the page, not
a surface laid over it. The test asserts that transparency directly.

**Footer (§30).** Minimal and unchanged in kind: the name, the positioning line,
the language and appearance controls, one hairline, the copyright. No scientific
element is forced into it. Height **207px** — the same as v1.7, because the footer
was already right.

**The rhythm the page now has (§9):** strong (hero) → clear (work) → a light
thought (statement) → close. It is not one texture all the way down. Document
height **4057px** at 1440px.

---

## 8. Screenshots

All three are `/zh/`, Paper, 1440px, captured from the built site with
`node scripts/qa-v20-shots.mjs <url>`.

```
.qa-screens/v20/hero-first-screen.png      1440 × 900
.qa-screens/v20/featured-projects.png      1440 × 2496
.qa-screens/v20/homepage-full.png          1440 × 4057
```

Additional review crops, element-level at real resolution, from the same session:

```
.qa-screens/v20/detail-statement.png       1440 × 320
.qa-screens/v20/detail-contact.png         1440 × 282
.qa-screens/v20/detail-footer.png          1440 × 207
.qa-screens/v20/detail-row-1.png           1440 × 453   (知身·问年)
.qa-screens/v20/detail-row-4.png           1440 × 453   (BioPulse)
.qa-screens/v20/theme-white-hero.png       1440 × 900
.qa-screens/v20/theme-night-hero.png       1440 × 900
```

`.qa-screens/` is gitignored — these are review artifacts, not deliverables.

**Judged against §41.** The failure signals were: a research handout, a maths
wallpaper, a technical card page, a design-system document. None of the three
screenshots is any of those. The hero leads with a name and one drawing; the four
projects read as work entries separated by whitespace; the close is a name and
four links. The page reads as a person's homepage with a scientific register
rather than as a document about science.

---

## 9. lint / typecheck / build

| Gate | Result |
|---|---|
| `npm run lint` | **0 errors, 0 warnings** |
| `npm run typecheck` (`astro check`) | **0 errors, 0 warnings, 0 hints** across 129 files |
| `npm run build` | **26 pages** built, clean |
| `npm run verify` | passed — 654 internal links, 7 case studies × 2 locales |
| `npm run theme` | passed — all three themes, all `--art-*` tokens in range |
| `npm run artifacts` | passed — 145 checks |
| `npm run science` | passed — 2322 checks, 133 files scanned for overclaims |
| `npm run visual` | passed — row copy density, no canvas, five drawings, four content areas |
| `npm run identity` | passed — 462 assertions, no private contact data, PDFs intact |
| `npm test` | **299 passed, 7 skipped, 0 failed** (desktop + mobile) |

### Four defects found and fixed this round

1. **Duplicate `data-artwork` on the hero drawing.** The generated SVG root
   carried `data-artwork="hero"` in addition to the frame's own attribute, so the
   hero contained two matching nodes and the test — correctly — failed. Removed
   from the generator; the built page now has exactly one marker per drawing, and
   this is asserted.
2. **A desktop-only layout claim was asserted on mobile.** The hero test asserted
   that the copy's right edge falls left of the drawing's left edge. Below 900px
   the hero stacks, so that geometry does not exist. Split into a structural test
   that runs at both widths and a desktop-only test for the two-column
   composition.
3. **`npm run artwork` was documented but did not exist.** `Artwork.astro`
   instructs the reader to run it. Added to `package.json`, and the generator was
   verified deterministic — re-running it produces byte-identical output.
4. **The CJK font stack resolved Chinese to a calligraphic kai face on Windows.**
   `system-ui` was listed before the CJK families, and on Windows `system-ui`
   carries Han glyphs — so every Chinese character on the site was resolved by it
   and never reached `Microsoft YaHei`. This was an accident, not a decision, and
   it was the single largest typographic defect the v2.0 screenshots exposed. The
   CJK families now precede `system-ui`. Latin is unaffected: Inter, Geist, the
   platform UI font and Roboto all still come first and all carry Latin glyphs.

---

## 10. Known unfinished items

- **Paper only.** White and Night are not tuned this round (§31). Both were
  checked and neither is broken — the drawings follow the theme through the
  `--art-*` tokens, and Night in particular had to be inked harder to read at all
  on a dark canvas. But neither has had the attention Paper has. Paper is the one
  to review.
- **English is structural only.** `/` mirrors the new homepage and builds and
  passes, but the typography was not tuned for English line lengths (§32). `/zh/`
  is the reviewed page.
- **The statement band's texture is a judgement call.** It is the one piece of the
  reset that adds something rather than removing it. If it reads as noise rather
  than as a breath, it is a one-line deletion.
- **The four drawings share a family resemblance.** They are meant to (§23) — one
  material system — but 知身·问年 and Morn both read as a contour mass crossed by a
  thread at a glance, and a reviewer may want them pulled further apart.
- **No real project material is used (§24).** See §5 for why. If the owner has a
  screenshot of any project that is safe to publish, swapping it into a row is the
  single largest available improvement to this page.
- **§12's section-height target is unreachable** as written; see §4. Reported
  rather than silently reinterpreted.
- **Mobile was not art-directed.** The rows stack with the drawing leading and no
  horizontal overflow at 375–1920px, but the mobile composition is a consequence
  of the desktop one, not a design of its own.
- **The homepage is not committed.** It sits uncommitted on the feature branch.

---

## 11. Final state

```
WAITING_FOR_OWNER_VISUAL_APPROVAL
```

This is a prototype for review. It is not production ready, it has not been
merged, and it has not been deployed. The decision this round produces is a visual
one, and it belongs to the owner.
