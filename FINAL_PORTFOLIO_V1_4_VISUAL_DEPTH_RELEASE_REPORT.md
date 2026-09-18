# Hao Lei Personal AI Lab — v1.4 Release Report

**Subtitle:** Visual Depth · Mathematical Biology · Theme System · Chinese-first Entry
**Status:** `PRODUCTION_READY` — built, gated, tested, deployed
**Date:** 2026-09-18
**Live:** https://haoleilab.com

---

## 1. Final status

v1.4 is production ready and live. Ten gates pass in order on every run:

```
lint → typecheck → build → verify → theme → artifacts → science → identity → test → deploy
```

| Gate | Result |
| --- | --- |
| `npm run lint` | 0 errors, 0 warnings |
| `npm run typecheck` (`astro check`) | 0 errors, 0 warnings, 0 hints — 96 files |
| `npm run build` | 26 pages |
| `npm run verify` | 776 internal links |
| `npm run theme` | 1162 checks |
| `npm run artifacts` | 143 checks |
| `npm run science` | 2069 checks |
| `npm run identity` | 432 assertions |
| `npm run test` | 245 passed · 5 skipped · 0 failed |
| GitHub Actions | build 2m4s + deploy 11s, exit 0 |

The release adds visual depth without touching the fact layer. Evidence, project
statuses, the reality matrix and the résumé are exactly as v1.3 left them; what
changed is the surface a visitor reads them on.

---

## 2. Chinese-first entry behaviour

The site keeps two stable URL trees — `/` for English, `/zh/` for Chinese. The
entry locale is a **client preference over a static site**, never a rewrite of
the build output.

- Storage key `haoleilab-language`, values `zh` | `en`.
- No stored preference → Chinese. A first visit to `haoleilab.com/` lands on
  `/zh/`.
- The redirect is `location.replace`, so the wrong-locale page never enters
  session history and the Back button keeps working.
- The redirect **preserves the requested path**: `/projects/wennian/` →
  `/zh/projects/wennian/`, not to the home page.
- It runs from an inline `<script>` in `<head>`, before any stylesheet is
  applied — no English frame ever paints. Verified by test: the bootstrap is
  present in the HTML before `<body`, and `data-theme` is already set at
  `waitUntil: 'commit'`.
- `canonical`, `hreflang` and `x-default` are **not** rewritten by the
  preference. Two alternates plus `x-default` are declared in both locales and
  still match the rendered page.
- Paths containing a `.` (e.g. `/404.html`) are never redirected — static
  assets stay where they are.

---

## 3. Theme architecture

Three themes — `paper` (default), `white`, `night`.

- Driven entirely by **CSS custom properties** under
  `[data-theme='paper' | 'white' | 'night']`. No component contains
  `if (theme === …)`; there is no theme class on any element.
- Storage key `haoleilab-theme`. The value is read and stamped onto
  `document.documentElement.dataset.theme` by an inline script that runs
  **before the first paint** — 867 bytes, zero dependencies. `<html>` is also
  server-rendered with `data-theme="paper"`, so the page is correct even with
  JavaScript off.
- Unknown or missing values fall back to `paper` and **never** to the OS
  setting: a visitor whose system prefers dark still gets paper on a first
  visit, because the themes are an editorial choice, not a system mirror.
- Switching is synchronous: no network request, no navigation, no reload. Verified
  by test — the URL is unchanged and no request is issued.
- The choice propagates across tabs through the `storage` event, and survives a
  language switch.
- `<meta name="theme-color">` is updated with the theme so the browser chrome
  matches (`#F0EEE8` on paper).
- The switcher is a single shared ES module (`src/scripts/theme-switcher.ts`).
  It was extracted from a per-component inline script because `define:vars`
  re-injected the block once per instance.
- The theme gate enforces: all three blocks define the same 30-token set, every
  `var(--*)` used in `src` is defined somewhere, no hard-coded white surface
  outside the white theme itself, and night's canvas/card/artifact backgrounds
  stay below a 0.05 / 0.08 / 0.08 luminance ceiling.

---

## 4. Paper

The default. A warm off-white canvas (`#F7F7F4` family) with a paper grain
overlay: an inline SVG turbulence filter, 406 bytes as a data URI (357 bytes
decoded, 232 gzipped) — a texture, never a network request. Ink is near-black,
muted is mid-grey, and a single accent carries every interactive state.

| token on canvas | contrast |
| --- | --- |
| `--ink` | 15.74:1 |
| `--muted` | 6.29:1 |
| `--faint` | 4.75:1 |
| `--accent` | 4.85:1 |

Artifact room: ink 15.94:1, muted 7.11:1.

`--accent` was moved from `#315cff` to `#2e56f2` during this release: as link
text on the paper canvas the original measured 4.41:1, which fails WCAG AA for
normal text. The shifted value clears it at 4.85:1 while remaining visually the
same blue.

---

## 5. White

A neutral, cooler white with the grain disabled (`--grain-opacity: 0`). It is
the highest-contrast theme and the one a visitor picks when they want maximum
legibility or are about to print.

| token on canvas | contrast |
| --- | --- |
| `--ink` | 18.88:1 |
| `--muted` | 6.42:1 |
| `--faint` | 4.63:1 |
| `--accent` | 5.63:1 |

Artifact room: ink 16.27:1, muted 7.20:1.

---

## 6. Night

A true dark surface, not an inverted filter. Every token is re-authored rather
than derived, so the room stays a room and the hierarchy holds.

| token on canvas | contrast |
| --- | --- |
| `--ink` | 15.85:1 |
| `--muted` | 7.07:1 |
| `--faint` | 5.41:1 |
| `--accent` | 6.08:1 |

Artifact room: ink 14.29:1, muted 6.38:1.

`color-scheme` is set per theme so native form controls, scrollbars and
selection colours follow. The night primary-button hover was changed from a
hard-coded `#ffffff` to `filter: brightness(1.12)` — partly for correctness
under the theme gate's no-hard-coded-white rule, partly because a literal white
would have ignored any future token change.

All eighteen measurements pass WCAG AA (≥ 4.5:1) for normal text.

---

## 7. Formula system

Mathematical notation is **MathML**, serialised into the HTML. There is no
MathJax, no KaTeX, no WASM, and no client-side typesetting pass — the notation
is in the document on first paint and costs zero JavaScript.

Notation appears in two places:

- the signature concept loop: `z = E(X)`, `zₜ₊₁ = Fθ(zₜ, aₜ)` with its
  mechanistic reading `dx/dt = f(x, u, θ)`, and `a*`;
- the equation note, which introduces the ΔAGE framing and states plainly that
  the surrounding model is a **conceptual** one.

Every page that renders a formula is required by the science gate to carry a
conceptual label. The gate scans all 26 built pages for notation markers
(`ΔAGE`, `Fθ`, `ẑ`, `Δx=`, `dx/dt`) and fails the build if a page shows one
without also saying, in that language, that the figure is conceptual.

---

## 8. Mathematical Biology

A new homepage section, 数学 × 生物 / "Mathematical Biology", built on four
layers that describe how the work actually proceeds:

```
OBSERVATION → REPRESENTATION → DYNAMICS → DECISION
```

Biological measurement is encoded into a state; a dynamics model — mechanistic
where the equations are known, learned where they are not — predicts the next
state under an action; a decision selects the action.

It reduces the whole approach to three questions — what state are we in, why did
it change, where would an intervention move it — and answers them with four
**original** SVG figures, drawn for this site:

| figure | what it shows |
| --- | --- |
| Cell state landscape | contour lines, one trajectory, one target basin |
| Gene × cell matrix | an abstract rendering of high-dimensional observation |
| Gene → pathway → phenotype → intervention | six nodes, deliberately small |
| Phase portrait | a vector field, two attractor basins, one trajectory |

All four are hand-built SVG that inherit `--dg-*` theme tokens, so they restyle
with the theme instead of being baked bitmaps. **Every caption states that the
figure is conceptual and not an experimental result.** No figure encodes
measured data, and none of them is a stock illustration.

---

## 9. Signature Concept Figure

`ConceptLoop` is the one diagram that recurs as the site's signature:
observation encoded into a state, a dynamics model predicting the next state
under an action, a decision selecting that action, and the outcome feeding back
as a new observation.

- 1024 × 300 viewBox, four boxes and a dashed feedback arc.
- The dynamics box is the only one stroked in the accent colour — it is where
  the learning happens, and the eye should land there.
- Rendered as `role="img"` with a full `aria-label` describing the loop, so the
  diagram is readable to a screen reader rather than skipped.
- Notation is MathML; all colours come from theme tokens.
- Labeled as a conceptual diagram in both languages.

---

## 10. Project visual differentiation

Every project page and card now carries its own visual instead of sharing one
generic treatment. Thirteen variants exist (`src/data/visualVariants.ts`), each
hand-drawn SVG: `aging-state`, `cell-transition`, `agent-dag`,
`compliance-triangle`, `dependency-graph`, `discovery-loop`, and others.

Two implementation notes worth keeping:

- The variant union type lives in a `.ts` module, not in the component
  frontmatter. Astro's compiler hoists `export` statements and **truncates a
  multi-line union at its first member**, leaving a stray `| 'cell'` in the
  component body and an esbuild `Unexpected "|"` error. Externalising the type
  is the fix.
- Variants are selected by data, not by branching markup, so adding a project
  does not mean adding a conditional.

---

## 11. Selected Artifacts

The homepage's **single inverted block**, placed between Selected Work and the
later sections so the page reads light → dark → light. It is an editorial
mosaic — `large`, `tall`, `small`, `mid`, `wide` cells on a 12-column grid at
desktop, one column below 768px.

**No artifact is fabricated.** There are no mock UIs, no invented benchmarks,
no terminal screenshots staged for effect, and no product photography. The
artifact test asserts `#artifacts img` has count **0** — every visual in the
room is real text.

Five artifacts, each with PROJECT / TYPE / SOURCE / DATE(SNAPSHOT) rendered
directly on the tile:

| # | project | type | kind | size |
| --- | --- | --- | --- | --- |
| 1 | 知身 · 问年 / WenNian | 仓库产物 · repository | tree | large |
| 2 | HyCell-JEPA | 验收产物 · acceptance | terminal | tall |
| 3 | morn | 架构产物 · architecture | tree | small |
| 4 | BioPulse | 命令与输出 · command output | terminal | mid |
| 5 | HyCell-JEPA | 报告产物 · report | list | wide |

Text artifacts open through a **native `<dialog>`** via `showModal()`, which
gives focus trapping, Escape-to-close and an inert background for free — no
modal library. Closing returns focus to the trigger. The enlarged view repeats
the same verbatim content and keeps the source and snapshot date.

One structural note: `.ar-cell` (the grid item) is rendered only by
`SelectedArtifacts`, and `.ar-tile` (the card shell) only by `ArtifactCard`.
Astro scopes styles per component, so a grid rule written in the parent never
reaches an element rendered by the child — the wrapper exists for that reason,
and a test guards the split.

---

## 12. Artifact sources

Provenance is enforced, not decorative. `scripts/check-artifacts.mjs` (143
checks) parses the artifact data without importing TypeScript and requires, per
entry:

- a unique `id`, and non-empty `projectSlug` / `type` / `sourceUrl` / `date` /
  `kind` / `size`;
- bilingual `project`, `title`, `source`, `caption`;
- `verified: true` implies a non-empty `source`;
- `sourceUrl` is `https` and its host is `github.com`;
- `date` is ISO 8601;
- `type: 'screenshot'` implies an image that actually exists on disk (no such
  artifact currently exists — the room is text only);
- `projectSlug` resolves to a real project page;
- no placeholder markers (TODO, LOREM, FAKE, example.com);
- no sensitive material (bearer tokens, `api_key`, private IPv4, e-mail
  addresses, internal hosts).

It then checks both home pages render every artifact id and every source URL.
Harvest dates are recorded as snapshots (`2026-09-18`), so an artifact always
says *when* it was read.

---

## 13. Lab Notes

Three entries in `src/data/notes.ts`, rendered as a dated log — a log, not a
blog, and not a CMS:

| date | kind | entry |
| --- | --- | --- |
| 2026.09 | snapshot | 知身 · 问年 — public snapshot re-read (structure unchanged; causal graph still partially open) |
| 2026.09 | note | HyCell — real-matrix smoke workflow written up (GSE130973 subset, labels explicitly unknown) |
| 2026.09 | release | Personal AI Lab — visual system v1.4 |

Each entry points at something real or renders as plain text when there is
nothing to open. Copy was checked against NOW and Selected Work for
duplication: the only repeated strings on the rendered homepage are artifact
`<pre>` bodies, which appear twice by design because the dialog is an enlarged
copy of the tile.

---

## 14. Scientific claim audit

`scripts/check-science-copy.mjs` (2069 checks) guards the language:

1. **Overclaims** — clinically proven, validated intervention, production
   digital twin, production QSP, FDA, peer-reviewed, medical advice, diagnostic
   accuracy, guaranteed (plus Chinese equivalents) across 118 files. A
   negation window looks back 90 characters and skips compliant disclaimers
   such as "does not provide medical advice", so the gate does not punish the
   site for being careful.
2. **Implementation vocabulary** — six research-status project files may not
   use `partial implementation`, `working prototype`, `implemented subsystem`,
   `validated architecture`, `current system` or their Chinese equivalents.
3. **TaiYi Lingjing** must remain `status: 'Research'` in both languages and
   state that work has **not started** (「尚未开始」). This is inherited from the
   v1.3 correction and is now machine-checked so it cannot quietly regress.
4. **Conceptual labelling** — every page rendering a formula must also say so.

HyCell's benchmark numbers are published **together with the repository's own
limitation** ("these are engineering smoke metrics and do not constitute
biological validity"). Engineering results are reported as engineering results.

---

## 15. Privacy & identity audit

`npm run identity` — 432 assertions, passing.

- Person JSON-LD validated on both locales.
- All 26 pages checked for the retired project name.
- Both résumé PDFs verified for **text privacy and metadata**: extraction runs
  through `pdfjs-dist/legacy` because Chromium-generated PDFs are CID-encoded,
  and a naive stream scan would only find link annotations and would falsely
  report a pass.
- The public e-mail set is exactly `h30441854@gmail.com` and
  `304418554@qq.com`. The private mobile number and the 163 address must never
  appear in source or build output; the check assembles those strings at
  runtime so the literals do not live in the repository.

---

## 16. Accessibility

- All 18 theme × token contrast measurements pass WCAG AA (lowest 4.63:1,
  median ~6.3:1). Values are computed, not asserted — the theme gate
  recalculates relative luminance on every run.
- Diagrams are `role="img"` with descriptive labels; decorative glyphs are
  `aria-hidden`.
- The artifact dialog is a native `<dialog>`: focus trap, Escape and focus
  restoration come from the platform.
- Appearance and language controls are reachable by keyboard with arrow,
  Home/End, Enter/Space and Escape handling, and `aria-checked` reflects the
  active theme in the server-rendered HTML.
- Every interactive target in the mobile appearance control measures ≥ 44px;
  a test asserts it in all three themes.
- `prefers-reduced-motion` disables the scroll reveal.

---

## 17. Performance

| metric | value |
| --- | --- |
| External JavaScript files | **0** |
| Inline scripts on the homepage | 10 blocks, 6,473 bytes |
| Theme + language runtime | 3,352 bytes (1,248 gzipped) |
| Homepage CSS (3 bundles) | 53,119 bytes raw · 11,642 gzipped |
| All CSS (6 bundles) | 78,831 bytes raw · 16,690 gzipped |
| `<img>` elements on the homepage | **0** — all visuals are inline SVG |
| Paper grain texture | 406 bytes (232 gzipped) |
| Third-party scripts, web fonts, trackers | none |

No framework runtime is shipped. The theme and language behaviour is 3.3 KB of
inline script, well under the 5 KB budget, and it executes before the first
paint rather than after hydration.

---

## 18. Mobile QA

- No horizontal overflow at 375, 390, 430, 768, 1024, 1280 and 1920 px —
  asserted on every run.
- The artifact mosaic collapses to a single column below 768px; long `<pre>`
  listings scroll inside their tile instead of widening the page (asserted).
- The hamburger menu opens and closes, and offers all three themes as ≥ 44px
  targets.
- The appearance control in the footer follows the theme tokens, including on
  night.

---

## 19. Theme QA

Forty screenshots were taken across three themes × desktop 1440 / mobile 390 ×
eight routes (home EN/ZH, WenNian, HyCell, TaiYi, research, résumé, 404).
Findings and their resolutions:

1. **The artifact room collapsed into a narrow column.** The mosaic rules were
   written in `SelectedArtifacts` but the cells were rendered by
   `ArtifactCard`, and Astro scopes styles per component. Fixed by making the
   parent own `.ar-cell` and the child render `.ar-tile`.
2. **The theme script was injected twice** — two switcher instances each
   emitted their own `define:vars` block. Fixed by extracting
   `src/scripts/theme-switcher.ts`.
3. **A hard-coded white** on the night primary-button hover. Fixed with
   `filter: brightness(1.12)`.
4. **Accent failed AA as link text on paper** (4.41:1). Fixed by shifting
   `--accent` to `#2e56f2` (4.85:1).

---

## 20. Tests

245 passed · 5 skipped · 0 failed, across desktop (1440×900) and mobile
(Pixel 5).

| spec | coverage |
| --- | --- |
| `tests/site.spec.ts` | structure, evidence layer, résumé, 404, links, SEO, language switching, overflow at 7 widths |
| `tests/identity.spec.ts` | public identity, PDF privacy, retired project name |
| `tests/theme.spec.ts` | default paper, no FOUC, persistence, cross-tab sync, zero network cost, keyboard, contrast coverage |
| `tests/language.spec.ts` | first visit in Chinese, path preservation, static-asset exemption, canonical/hreflang integrity |
| `tests/artifacts.spec.ts` | five real artifacts, mosaic spans, no fabricated screenshots, single inverted block, dialog behaviour, keyboard reachability, mobile collapse |

`tests/helpers.ts` exists because the entry locale is now a client preference:
`visit()` derives the preference from the path *being loaded* rather than
capturing it once, so an init script cannot overwrite a choice the page itself
made mid-test.

Two flake sources were fixed during this release:

- `waitForURL` could miss the client-side redirect under parallel load, because
  the navigation completed before the waiter subscribed. The redirect tests now
  use `waitUntil: 'commit'` plus a polling assertion on the resolved pathname.
- `switchLocalePath` was not idempotent and produced 12 `/zh/zh/…` dead links.
  It now strips the prefix before re-applying the target.

---

## 21. CI

`.github/workflows/deploy.yml` runs ten gates before uploading to Pages:

```
Lint → Typecheck → Build → Verify build output → Check theme system →
Check artifacts → Check science copy → Check public identity → Test → Deploy
```

Run **35339024400**: `build` 2m4s, `deploy` 11s, exit 0. Playwright browsers are
cached; the résumé PDFs are produced in-workflow and verified before upload.

Two CI-only issues were resolved earlier in this line of work and remain fixed:

- `astro check` also type-checks `tests/*.ts`, so third-party library types must
  be narrowed (`Record<string, unknown>`) before assertion — a locally-clean
  install can differ from CI's.
- A stale `.astro` cache can make `astro check` report duplicate ids; clearing
  it resolves the false positive.

---

## 22. Deployment

GitHub Pages via GitHub Actions on push to `main`. Static output only — no
server, no runtime, no environment variables. Custom domain `haoleilab.com`
with `huangdi97.github.io` redirecting to it. Sitemap and `robots.txt` are
generated at build time.

---

## 23. Live URL

**https://haoleilab.com**

Verified after deploy:

| check | result |
| --- | --- |
| `/` | 200 |
| `/zh/` | 200, `lang="zh-Hans"`, `data-theme="paper"` server-rendered |
| theme-color | `#F0EEE8` on paper |
| artifact tiles / sources on `/zh/` | 5 / 5 |
| résumé PDFs | 200 |
| `/404.html` | 200 |

A visitor with no stored preference opens the Chinese site; the theme is
already correct at the first frame.

---

## 24. Commit

```
ebbc5fb63fe2ee905cadc8843dde1fc717e068b7
v1.4: visual depth, theme system, Chinese-first entry
```

59 files changed: 33 modified, 26 added. The additions are the theme
configuration and switcher, the artifact room, the four biological figures, the
concept loop, the equation note, lab notes, three gate scripts and three specs.
No build output or local artefact was committed.

---

## 25. Remaining optional visual assets

Deliberately not built. Each would cost more than it returns:

- **Per-project hero imagery.** Every visual on the site is hand-drawn SVG that
  themes correctly and ships at zero bytes of network cost. Photography would
  add requests, a maintenance burden, and stock-looking filler.
- **Animated figures.** The diagrams are static and carry
  `prefers-reduced-motion` handling. Motion is reserved for the scroll reveal,
  which is opt-in.
- **A real screenshot artifact.** The room currently has no `type: 'screenshot'`
  entry. The gate already supports one — it requires the image file to exist and
  to be a real capture — but nothing worth showing has been produced yet, and
  inventing one would break the room's premise.
- **A CMS or blog.** Lab Notes is a dated log with three entries, by design. It
  needs no authoring surface.
- **Additional themes.** Three are enough; each one costs a full token audit,
  and the gate enforces parity across all of them.

---

## Summary

v1.4 gives the portfolio depth and a recognisable visual language without
moving a single fact: three themes resolved before first paint, a Chinese-first
entry over stable URLs, a mathematical-biology section built from original
diagrams, a signature concept figure, and an evidence room of five real
repository artifacts. Every claim is machine-checked — theme token parity and
contrast, artifact provenance, scientific overclaims, and public-identity
privacy — and the ten-gate pipeline passes locally and on CI.
