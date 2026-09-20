# V2.2.2 — Final Background & Raster Loading Cleanup

**Round type:** final small closure. Two items, then one QA pass.
**Base:** `455e0b2` (v2.2.1, released) → working tree, 9 files changed
(+26 / −34: eight source and gate files for the two items, plus `README.md`).
**Terminal state:** `WAITING_FOR_OWNER_VISUAL_APPROVAL`. Nothing committed, nothing deployed.

The brief was explicit about the boundary, and it held: no redesign, no page
refactor, no new section, no artwork regenerated, no project fact or public
status touched. Two items only.

---

## 1. The double grain

### 1.1 What was actually happening

Two paper textures were live at the same time, and only one of them was the
intended one.

| | Source | Implementation | Themes |
| --- | --- | --- | --- |
| **A** | `ScientificEditorialBackground.astro:365` | `.ebg-texture` → `url('/texture/paper.webp')`, `background-size: 128px 128px`, `opacity: var(--bg-texture)` | all three (Night inverts it) |
| **B** | `global.css:376` | `body { background-image: var(--grain) }` — a 140×140 inline SVG `feTurbulence`, opacity 0.032 baked into the SVG | **paper only** (white/night set `background-image: none`) |

A is v2.2's Layer C. B is the v1.4 inline grain. `scripts/build-paper-texture.mjs`
already described A as behaving "the same as the inline `--grain` SVG that has
carried the paper theme since v1.4" — the replacement was intended, but B was
never removed. So **on the paper theme the page carried both**, and the two tiles
beat against each other at different periods (140 px against 128 px).

Confirmed in the built artifact rather than inferred from source: the shipped
stylesheet contained **both** `feTurbulence` and `texture/paper.webp`.

### 1.2 What was removed

* `body`'s `background-image: var(--grain)` and `background-repeat: repeat`;
* the `--grain` token itself (the inline SVG data URI);
* the now-redundant `[data-theme='white'] body, [data-theme='night'] body { background-image: none }` override;
* `--grain-opacity`, which was **dead** — defined three times (1 / 0 / 0) and referenced nowhere.

`global.css` is 14 lines shorter. The one remaining occurrence of the word
"grain" in that file is a comment describing Layer C's `texture` dial band, which
is still correct.

### 1.3 Verified

```
dist CSS files containing feTurbulence:      0   (was 1)
dist CSS files containing texture/paper.webp: 1   (Layer C intact)
```

The print stylesheet's `background-image: none !important` is deliberately left
alone — it is a print safety net, not part of the grain system.

---

## 2. `/research` and `/about` off the critical path

### 2.1 What changed

`Artwork.astro` treated the two inner-page accents as critical, on the same
footing as the hero:

```js
const loading = isHero || isPageAccent ? 'eager' : 'lazy';
const fetchpriority = isHero || isPageAccent ? 'high' : 'auto';
```

Both pages also passed `preloadArtwork`, so each emitted a
`fetchpriority="high"` image preload. The hero is now the only eager drawing on
the site; the accents are `lazy` with `fetchpriority="auto"`, and neither page
preloads anything.

`isPageAccent` itself is kept — it still drives `isBlend` and the mask treatment,
which this round does not touch.

### 2.2 Measured, before and after

| page | preload | eager | lazy | fetchpriority=high |
| --- | --- | --- | --- | --- |
| `/research/`, `/about/`, `/zh/research/`, `/zh/about/` | 0 (was 1) | 0 (was 1) | 1 | 0 (was 1) |
| `/`, `/zh/` | 1 | 1 (hero) | 4 | 1 |

The two home pages are unchanged, which is the point: the hero is the LCP element
and must not be deferred.

### 2.3 The gate moved with it

`check-visual-system.mjs`'s `LOADING_PAGES` asserted the old policy, so it was
updated in the same commit rather than worked around: `/research/` and `/about/`
(and their `zh` twins) went from `1` to `0`. The file's header comment was
rewritten to match — it now reads "the hero is the only eager drawing on the
site" instead of "at most one drawing per page is eager".

The existing rule that a page which paints nothing eagerly must preload nothing
already covered the new arrangement, so no assertion was weakened. Nothing was
deleted from the gate; one expectation table changed.

---

## 3. Two counts moved, and both are fully accounted for

Neither is a silent change, and neither is a pass/fail change.

**`npm run theme`: 1080 → 1074 (−6).** Traced to three places in
`check-theme-system.mjs`, each incremented once per unit:

| source | line | delta |
| --- | --- | --- |
| required-token loop, once per theme (3 themes) | `:158` | −3 |
| "paper defines it, so white and night must redefine it", once per theme (2) | `:171` | −2 |
| `var(--grain)` was the one reference to the removed token | `:189` | −1 |

`--grain-opacity` was also removed from that file's `REQUIRED_TOKENS` list, which
is what the −3 and −2 are: the list went from 43 to 42 entries. Leaving it in
would have failed the gate.

**`npm run verify`: 632 → 628 (−4).** `verify-build.mjs:105` collects links with
`(?:href|src)="…"`, so an image preload's `href` counts as an internal link. Four
pages stopped emitting one preload each: −4. The internal link graph itself is
unchanged.

---

## 4. QA

Every number below comes from a run with an exit code. Measured on an LF working
tree — a byte-level scan of 161 text files found **0 containing `0x0d`**.

| step | result | exit |
| --- | --- | --- |
| `npm run lint` | clean | **0** |
| `npm run typecheck` | 108 files, 0 errors / 0 warnings / 0 hints | **0** |
| `CODEBUDDY_SAFE_DELETE_ENABLED=0 npm run build` | 26 pages | **0** |
| `npm run verify` | 75 files, 26 HTML pages, 628 internal links, 22 local assets | **0** |
| `npm run theme` | 1074 checks | **0** |
| `npm run artifacts` | 137 checks · 5 entries parsed, 0 rows per locale | **0** |
| `npm run science` | 1895 checks · 108 files | **0** |
| `npm run visual` | 745 checks | **0** |
| `npm run identity` | 412 assertions | **0** |
| `npx playwright test --workers=1` | **327 passed / 5 skipped / 0 failed** | **0** |
| `dist/` | **75 files**, 0 residue, 0 source-artwork leakage | — |

The Playwright count is identical to v2.2.1 because no test was added, removed or
skipped — this round changed two expectations inside an existing gate and no
browser assertion at all.

The visual gate's own output reports the demotion from the other side:
`dist/index.html: 153 KB eager, 1 drawing` for each home page, and no eager
drawing on the four accent pages.

---

## 5. Open items

Stated rather than buried.

1. **The paper theme now looks slightly different, by design.** Removing B takes
   away roughly 0.032 of noise that was previously stacked under Layer C. If the
   owner reads the result as *too* flat, the correct fix is to raise Layer C's
   `--bg-texture` — not to restore a second grain. One constraint worth stating:
   the three values are 0.022 (paper) / 0.018 (white) / 0.025 (night), and
   `global.css:119` records §3's ceiling for texture as 0.025. **Night already
   sits on that ceiling**, so it has no headroom — any raise has to happen in the
   paper and white themes only, or §3 has to be reopened first.
2. **The accents now arrive later.** On `/research` and `/about` the side accent
   is no longer preloaded, so on a slow connection it will paint after the text
   instead of with it. That is the intended trade — both pages are read as text
   first — but it is a visible change and the owner should look at it.
3. **Nine modified files plus this report are uncommitted.** Nothing is staged,
   nothing is pushed.
4. **Four of the touched files were already Prettier-dirty before this round**
   (`global.css`, `research.astro`, `check-theme-system.mjs`,
   `check-visual-system.mjs`) and are left that way. This was checked rather than
   assumed: each file's `HEAD` version was extracted and re-checked, and the
   changes Prettier asks for are all pre-existing over-long lines, none of them
   introduced here. `Artwork.astro` was clean at `HEAD` and is still clean.
   Repo-wide Prettier debt is a separate, much larger question and is not in
   scope.

---

## 6. Recommendation

Both items are done and enforced rather than asserted: the theme gate would fail
if the grain token came back, and the visual gate would fail if an accent page
started preloading or loading eagerly again.

**State: `WAITING_FOR_OWNER_VISUAL_APPROVAL`.**
