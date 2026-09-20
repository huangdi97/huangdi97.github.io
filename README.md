# Hao Lei — Personal AI Lab

> Building intelligent systems for discovery, health, simulation and autonomous work.

Personal brand · Technical portfolio · Research portfolio · Recruiting landing page.

---

## Live site

|                           |                                                     |
| ------------------------- | --------------------------------------------------- |
| Custom domain (canonical) | <https://haoleilab.com>                             |
| GitHub Pages              | <https://huangdi97.github.io> (301 → custom domain) |

English is the default language. Simplified Chinese is served under `/zh`.

> The custom domain is real and its `CNAME` file is committed in `public/`.
> DNS is managed outside this repository — see [Custom domain](#custom-domain).

---

## Tech stack

| Layer            | Choice                                      | Reason                                           |
| ---------------- | ------------------------------------------- | ------------------------------------------------ |
| Framework        | [Astro](https://astro.build) 5              | Ships zero JS by default; static-first           |
| Language         | TypeScript (strict)                         | Type-safe frontmatter and page props             |
| Styling          | Tailwind CSS 3 + CSS custom-property tokens | One token layer, no runtime cost                 |
| Content          | Astro Content Collections (Markdown)        | Schema-validated project entries                 |
| Search / sitemap | `@astrojs/sitemap`                          | Build-time only                                  |
| Tests            | Playwright                                  | Real browser checks against a real build         |
| CI/CD            | GitHub Actions → GitHub Pages               | Official `configure-pages` / `deploy-pages` flow |

No backend. No database. No CMS. No third-party analytics. No trackers.

---

## Requirements

- Node.js `>= 18.17.1` (developed and verified on Node 22 LTS)
- npm 10+

---

## Development

```bash
npm install
npm run dev          # http://localhost:4321
```

### Scripts

| Script                    | What it does                                                   |
| ------------------------- | -------------------------------------------------------------- |
| `npm run dev`             | Dev server with HMR                                            |
| `npm run build`           | `assets` → `texture` → `astro build`, into `dist/`             |
| `npm run preview`         | Serve the production build locally                             |
| `npm run lint`            | ESLint over `.ts` / `.astro`                                   |
| `npm run typecheck`       | `astro check` (strict TypeScript diagnostics)                  |
| `npm run format`          | Prettier write                                                 |
| `npm run check`           | `lint` → `typecheck` → `build`                                 |
| `npm run assets`          | Regenerate OG images and icons from SVG                        |
| `npm run texture`         | Regenerate the paper texture → `public/texture/paper.webp`     |
| `npm run artwork:v2`      | Homepage artwork → three WebP rungs per slot + size manifest   |
| `npm run artwork:pages`   | Inner-page accents → three WebP rungs per slot + size manifest |
| `npm run artwork:preview` | Render an `object-fit: cover` crop without a full build        |
| `npm run qa:v22`          | 30 acceptance frames + `measurements.json` into `.qa-screens/` |
| `npm run qa:v221`         | 37 acceptance frames + `measurements.json` into `.qa-screens/` |
| `npm run verify`          | Link + asset verification over `dist/`                         |
| `npm run test`            | Playwright browser tests against `dist/`                       |

The five remaining gates — `theme`, `artifacts`, `science`, `visual`, `identity` — are
listed under [Quality assurance](#quality-assurance).

---

## Build

```bash
npm run build        # → dist/
npm run preview      # inspect the built site
```

`npm run build` runs three steps in order: `scripts/generate-assets.mjs` renders the OG
images, favicon variants and PWA icons from SVG sources into `public/og/` and the site
root; `scripts/build-paper-texture.mjs` generates the tiling paper texture; then
`astro build` writes `dist/`.

Both generated sets are committed, so a plain `astro build` in CI is reproducible even
though the scripts re-run locally. The texture is deterministic — a seeded LCG over a
fixed lattice — so re-running it yields a byte-identical file, and
`npm run texture -- --check` verifies the committed one without rewriting it.

---

## Project structure

```
├── .artwork-source/            Owner's source PNGs — tracked in git, never served
├── public/                     Copied verbatim into dist/ — everything here is public
│   ├── og/                     OG images (1200×630), one per route + default
│   ├── images/                 Published artwork — three WebP rungs per slot
│   ├── texture/paper.webp      Tiling paper texture (128×128, 6.5 KB, lossless)
│   ├── favicon.svg             HL monogram
│   ├── manifest.webmanifest    PWA manifest
│   ├── robots.txt
│   └── CNAME                   Published custom domain
├── scripts/
│   ├── generate-assets.mjs     SVG → PNG asset pipeline (@resvg/resvg-js)
│   ├── build-paper-texture.mjs Deterministic seamless noise → paper.webp (self-checking)
│   ├── optimize-home-images.mjs   Homepage artwork → WebP ladder + manifest
│   ├── build-page-artwork.mjs     Inner-page accents → WebP ladder + manifest
│   ├── preview-artwork-crops.mjs  Render an object-fit: cover crop for review
│   ├── lib/artwork-ladder.mjs  Shared ladder [640, 960, 1440] + stale-rung pruning
│   ├── verify-build.mjs        Link + asset checker over dist/
│   ├── qa-v221-shots.mjs       Acceptance frames + measurements, per round
│   └── check-*.mjs             The five remaining gates
├── src/
│   ├── components/             Header, MobileNav, Artwork, ProjectEntry, …
│   │   └── visual/             ScientificEditorialBackground — the site-wide background
│   ├── config/site.ts          Single source of truth for verifiable facts
│   ├── content/projects/       Content collections: en/ and zh/
│   ├── data/                   research, resume, oss, how, about, artwork
│   ├── i18n/ui.ts              UI string table (en / zh-Hans)
│   ├── layouts/BaseLayout.astro  Mounts the background, emits the one image preload
│   ├── lib/projects.ts         Collection queries and ordering
│   ├── lib/artworkAsset.ts     Slot names, variants, srcset — one source of truth
│   ├── pages/                  English routes (default language)
│   │   └── zh/                 Chinese routes, mirroring the English tree
│   └── styles/global.css       Design tokens + typography + primitives
├── tests/                      Playwright specs (site, entries, artifacts, theme, background)
└── astro.config.mjs
```

### Routes

| Route                                                                        | zh counterpart        |
| ---------------------------------------------------------------------------- | --------------------- |
| `/`                                                                          | `/zh/`                |
| `/projects`                                                                  | `/zh/projects`        |
| `/projects/wennian` · `hycell` · `taiyi-lingjing` · `pet-ai-health` · `pdig` | `/zh/projects/<slug>` |
| `/research`                                                                  | `/zh/research`        |
| `/about`                                                                     | `/zh/about`           |
| `/resume`                                                                    | `/zh/resume`          |
| `/404`                                                                       | `/zh/404`             |

---

## Content editing

### Adding a project

Create one Markdown file **per language**, sharing the same `slug`:

`src/content/projects/en/<slug>.md`

```markdown
---
title: 'Project Name'
slug: 'project-name'
year: 2026
status: 'Active'
category: 'AI Health'
summary: 'One sentence, no adjectives that cost nothing.'
description: 'Two sentences: what it is, and how much is public today.' # SEO + case page
publicLine: 'What the project is, at the level of the whole project.' # the /projects line
tags: ['Aging clock', 'Agents', 'Digital twin']
featured: true
order: 1
role: 'Design & implementation'
visual: 'aging-state' # which case-study diagram to draw
repo: 'https://github.com/huangdi97/example' # omit if not public
---

## Overview

…
```

`title`, `slug`, `year`, `status`, `category`, `summary`, `description`, `publicLine`,
`role` and `visual` are required; everything else has a default or is optional.
`publicLine` is the one positioning line `/projects` and the homepage row both print, and
`description` no longer appears on `/projects` at all — it supplies the case page's meta and
Open Graph description, and the case-study body expands it. The six `cover*` fields were
removed in v2.1 with the `ProjectCover` component; do not reintroduce them.

Allowed `status` values: `Active`, `Research`, `Prototype`, `Stable`, `Archived`.

Then mirror it at `src/content/projects/zh/<slug>.md` with the **same slug** and
frontmatter keys. Product names stay untranslated (`WenNian / 知身·问年`,
`HyCell`, `Morn`, `BioPulse`, `TaiYi Lingjing / 太一·灵境`).

`status: Research` means exactly what it says: the work is written down — a
specification, a design or a research direction — and nothing more. A project
whose target system does not exist yet must say so on the page, in both
languages, and must never be described with implementation language.

### Rules that keep the site honest

- Every fact must be traceable to a public repository, its README, or the account itself.
- If a repository does not exist, omit `repo` — the page will render without a repository link.
- Never invent metrics, users, revenue, employers, degrees, papers or benchmarks.
- `src/config/site.ts` is the only place site-wide facts live. It is commented per field.

### Case studies vs. README

A case study answers _why this project exists, what it does about it, and how it is built_.
A repository README answers _how to run it_. They are deliberately different documents —
do not paste one into the other.

---

## Internationalization

- Default language: English, served from the site root.
- Chinese: served from `/zh`, using the identical route tree below it.
- Strings live in `src/i18n/ui.ts`, keyed and typed (`useT(lang)`).
- The language switcher **preserves the current page**: `/projects/wennian` ↔ `/zh/projects/wennian`.
- Alternate URLs are emitted via `<link rel="alternate" hreflang="…">` on every page.
- Copy is written natively in each language, not machine-translated line by line.

---

## Deployment

`.github/workflows/deploy.yml` runs on every push to `main`:

```
install → lint → typecheck → build → verify → upload-pages-artifact → deploy-pages
```

Required permissions are minimal:

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

The workflow uses the current official Pages flow (`actions/configure-pages`,
`actions/upload-pages-artifact`, `actions/deploy-pages`) — no `gh-pages` branch,
no personal access token, no legacy deploy action.

### Repository setup

In **Settings → Pages → Source**, select **GitHub Pages** (not "Deploy from a branch").

### Custom domain

`public/CNAME` already contains `haoleilab.com`, so GitHub Pages serves it directly.
Point the domain at GitHub with:

| Record          | Type    | Value                                                                      |
| --------------- | ------- | -------------------------------------------------------------------------- |
| `haoleilab.com` | `A`     | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` |
| `www`           | `CNAME` | `huangdi97.github.io`                                                      |

Then enable **Enforce HTTPS** in the Pages settings once the certificate is issued.
Any future domain only requires editing `public/CNAME` — no code changes.

---

## Quality assurance

`npm run lint`, `npm run typecheck` and `npm run build` come first, then six gates, then
the browser suite. All of them are blocking in CI, in this order.

| Gate          | Command             | What it owns                                            |
| ------------- | ------------------- | ------------------------------------------------------- |
| Verify        | `npm run verify`    | Dead links, missing assets, both locales present        |
| Theme         | `npm run theme`     | Three themes; every colour a token; contrast ratios     |
| Artifacts     | `npm run artifacts` | The evidence table is kept but rendered nowhere          |
| Science       | `npm run science`   | No overclaims; conceptual notation labelled             |
| Visual        | `npm run visual`    | The background contract and the raster loading policy   |
| Identity      | `npm run identity`  | No private contact data; PDF text and metadata          |
| Browser tests | `npm run test`      | Playwright — desktop 1440×900 + Pixel 5                 |

`scripts/verify-build.mjs` walks every generated HTML file, resolves internal links
against built routes, checks local asset references exist, and confirms each case
study is present in both locales.

`scripts/check-visual-system.mjs` is the one to read before touching anything visual. It
asserts against both source and built HTML: that the retired v1.7 canvas **and the retired
"Selected Public Work" room** are imported nowhere; that the background component carries no
script, no animation, no `Math.random` and no hard-coded opacity; that all seven per-page
variants exist, declare a density of their own, and mount no more than four groups; that every
`--bg-*` weight sits inside its per-theme band and that the mark kinds stay ordered
(`grid < mark < curve < graph`, with biology no louder than the network); that `/projects`
renders four entries, no "other work" index, no artifact room and no entry intro; and the
raster loading policy — the expected eager count per page, a loading hint plus intrinsic size
plus `srcset` on every drawing, at most one image preload and only where an eager drawing
exists, eager bytes at the largest rung under 250 KB, and no source file published.

The browser suite covers homepage render, navigation, project listing, case-study detail,
language switching with path preservation, mobile hamburger menu, resume print route, 404
page, external link attributes, absence of console errors, and no horizontal overflow at
375 / 390 / 430 / 768 / 1024 / 1280 / 1920 px. For the background it asserts the layer's
inertness, the per-theme bands, the density hierarchy across the five marked routes, that a
390 px screen gets _fewer_ fragments rather than a squashed desktop, and the no-image case for
three pages. For the contraction it asserts that `/projects` carries four entries and
four-field repository rows, that the inverted evidence room is gone from both locales, and
that the three pages which carry their own contact surface keep a minimal footer.

### Verified viewports

375 · 390 · 430 · 768 · 1024 · 1280 · 1440 · 1920

---

## Design system

Tokens are declared once in `src/styles/global.css`, per theme, and nothing hard-codes a
surface — every colour is read from a custom property. Three themes are supported, selected
by `[data-theme]` on the document element and applied by an inline bootstrap script before
the first paint, so there is no flash of the wrong theme:

| Token       | Paper               | White            | Night                  | Use                               |
| ----------- | ------------------- | ---------------- | ---------------------- | --------------------------------- |
| `--canvas`  | `#f0eee8`           | `#ffffff`        | `#111210`              | Page background                   |
| `--surface` | `#f6f4ee`           | `#f7f7f4`        | `#161715`              | Raised surfaces                   |
| `--ink`     | `#151515`           | `#111111`        | `#ecece7`              | Primary text                      |
| `--muted`   | `#5a564e`           | `#5f5f5a`        | `#a09f98`              | Secondary text                    |
| `--faint`   | `#6e685f`           | `#757570`        | `#8a8a83`              | Tertiary text                     |
| `--line`    | `rgba(20,20,18,.1)` | `rgba(0,0,0,.1)` | `rgba(255,255,255,.1)` | Borders                           |
| `--accent`  | `#2e56f2`           | `#2e56f2`        | `#6e8bff`              | Sparse — links, one focal element |

The accent is cobalt; the background's biological marks add one muted green (`--bg-bio-ink`).
No other hue is introduced anywhere. `scripts/check-theme-system.mjs` enforces the contrast
ratios and `scripts/check-visual-system.mjs` enforces the background's opacity bands.

Type uses system fonts only (`Inter` → `system-ui` → `PingFang SC` / `Microsoft YaHei`),
so there is no webfont cost on first paint. Motion is 150–500 ms and fully disabled
under `prefers-reduced-motion`.

### The background

Every page sits on a **four-layer** background, mounted once by `BaseLayout` behind the whole
document (`src/components/visual/ScientificEditorialBackground.astro`). Four is the whole list
— there is no fifth layer, no blur, no `backdrop-filter`, no repeating gradient and no second
raster:

| Layer | What it is                                                                                                           |
| ----- | -------------------------------------------------------------------------------------------------------------------- |
| A     | `--canvas`, the theme's warm paper                                                                                   |
| B     | Three radial gradients at **fixed `rem` radii**, all read from `--bg-*` tokens                                       |
| C     | One **128×128** alpha-only WebP tile, repeated — alpha-only, so Night inverts it rather than shipping a second file  |
| D     | Two to four inline-SVG groups: a three-line notation note, a probability curve, a neural fragment, cell contours, a ruled-grid fragment |

Layer B is sized in `rem` rather than percentages on purpose. A percentage-sized ellipse on a
3,300 px document is a 1,200 px-tall ramp, and an 8-bit canvas quantises a 4.8 %-alpha ramp
over that distance into a dozen visible steps — a set of wide horizontal arcs. A fixed-size
glow cannot do that, whatever the page length.

It contains **no JavaScript, no animation and no motion**, is `aria-hidden` with
`pointer-events: none` and nothing focusable, and is deterministic — no `Math.random`, no time.
It makes exactly one request: the 6.5 KB texture.

`BaseLayout`'s `backgroundMode` prop selects one of seven variants — `home` (1) / `projects`
(0.85) / `research` (1.4) / `about` (0.78) / `resume` (0.5) / `opensource` (0.62, declared and
reserved) / `minimal` (0, used by the 404). A variant carries its own mark set and its own
placement, not only a multiplier: **a variant changes density and composition — never the
palette, never the layout.** Two dials multiply and stay independent — `--ebg-scale` (this
page) × `--ebg-mobile` (this viewport, 0.7 below 900 px) — and below 900 px a page also *hides*
groups rather than shrinking them, because a mark shrunk to fit is still a mark competing with
the text.

The tile is generated by `scripts/build-paper-texture.mjs` from a seeded LCG over a **square**
noise lattice, so it is isotropic by construction and joins itself. The script **measures
itself and exits non-zero** if anisotropy leaves `[0.9, 1.1]`, if a seam ratio exceeds `1.01`,
or if the file exceeds 30 KB — the tile's properties are enforced by the build rather than
asserted in a document. It is stored **losslessly** because lossy WebP compresses alpha in
blocks, which is a second, independent banding source; at 128×128 the lossless file is smaller
than the old lossy 256×256 one it replaced.

> `GlobalScientificCanvas.astro`, its three composition components and
> `SelectedArtifacts.astro` are still in `src/components/`, but **nothing imports them and they
> must not be revived.** The first four were the v1.7 page-wide canvas, which read as a research
> poster behind the text — exactly what this background replaced. `SelectedArtifacts` was the
> inverted "Selected Public Work" room, removed from `/projects` in v2.2.1 because a full-width
> dark surface reads as a different site bolted onto a paper page; its data
> (`src/data/artifacts.ts`) is untouched. `scripts/check-visual-system.mjs` asserts that no
> source file imports any of them, and the browser suite asserts their DOM markers never appear
> on a built page.

### Artwork

Each drawing ships as three WebP rungs — 640 / 960 / 1440 — with `srcset` and a
layout-specific `sizes`, so a phone fetches the 640 rung and never the 1440 one. The ladder
never upscales a source. Only a page's own largest-contentful drawing is eager; everything
else is lazy, and a page emits at most one `<link rel="preload" as="image">`, and only where
an eager drawing exists. Rungs a slot no longer references are pruned, because `public/` is
copied into `dist/` verbatim — an unreferenced file there is a published file.

The drawings are enhancements rather than the page's structure: the hero and the project rows
are feathered into the paper with nested masks, and every page is complete and readable with
images blocked entirely. The inner-page plates are demoted further — `/research` and `/about`
carry theirs as a **side accent**: a `3 / 2` crop, opacity 0.18 (0.14 on Night), and a mask
that anchors right and dissolves towards the copy, so there is no rectangular edge and no
picture sitting in the middle of the page.

---

## Privacy

No analytics, no pixels, no fingerprinting, no third-party scripts. The site is
static and tracks nothing.

---

## License

Code is licensed under the [MIT License](LICENSE).
Written content and project case studies are © Hao Lei.
