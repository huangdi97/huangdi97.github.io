# Hao Lei — Personal AI Lab

> Building intelligent systems for discovery, health, simulation and autonomous work.

Personal brand · Technical portfolio · Research portfolio · Recruiting landing page.

---

## Live site

| | |
| --- | --- |
| Canonical (GitHub Pages) | <https://huangdi97.github.io> |
| Custom domain | <https://haoleilab.com> |

English is the default language. Simplified Chinese is served under `/zh`.

> The custom domain is real and its `CNAME` file is committed in `public/`.
> DNS is managed outside this repository — see [Custom domain](#custom-domain).

---

## Tech stack

| Layer | Choice | Reason |
| --- | --- | --- |
| Framework | [Astro](https://astro.build) 5 | Ships zero JS by default; static-first |
| Language | TypeScript (strict) | Type-safe frontmatter and page props |
| Styling | Tailwind CSS 3 + CSS custom-property tokens | One token layer, no runtime cost |
| Content | Astro Content Collections (Markdown) | Schema-validated project entries |
| Search / sitemap | `@astrojs/sitemap` | Build-time only |
| Tests | Playwright | Real browser checks against a real build |
| CI/CD | GitHub Actions → GitHub Pages | Official `configure-pages` / `deploy-pages` flow |

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

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with HMR |
| `npm run build` | Regenerate static assets, then build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint over `.ts` / `.astro` |
| `npm run typecheck` | `astro check` (strict TypeScript diagnostics) |
| `npm run format` | Prettier write |
| `npm run check` | `lint` → `typecheck` → `build` |
| `npm run verify` | `check` → link/asset verification of `dist/` |
| `npm run test` | Playwright browser tests against `dist/` |
| `npm run assets` | Regenerate OG images and icons from SVG |

---

## Build

```bash
npm run build        # → dist/
npm run preview      # inspect the built site
```

`npm run build` first executes `scripts/generate-assets.mjs`, which renders the OG
images, favicon variants and PWA icons from SVG sources into `public/og/` and the
site root. Those outputs are committed, so a plain `astro build` in CI is reproducible
even though the script re-runs locally.

---

## Project structure

```
├── public/
│   ├── og/                     OG images (1200×630), one per route + default
│   ├── favicon.svg             HL monogram
│   ├── manifest.webmanifest    PWA manifest
│   ├── robots.txt
│   └── CNAME                   Published custom domain
├── scripts/
│   ├── generate-assets.mjs     SVG → PNG asset pipeline (@resvg/resvg-js)
│   └── verify-build.mjs        Link + asset checker over dist/
├── src/
│   ├── components/             Header, MobileNav, HeroSystem, ProjectCard, …
│   ├── config/site.ts          Single source of truth for verifiable facts
│   ├── content/projects/       Content collections: en/ and zh/
│   ├── data/                   research.ts, resume.ts, oss.ts, how.ts, about.ts
│   ├── i18n/ui.ts              UI string table (en / zh-Hans)
│   ├── layouts/BaseLayout.astro
│   ├── lib/projects.ts         Collection queries and ordering
│   ├── pages/                  English routes (default language)
│   │   └── zh/                 Chinese routes, mirroring the English tree
│   └── styles/global.css       Design tokens + typography + primitives
├── tests/site.spec.ts          Playwright end-to-end checks
└── astro.config.mjs
```

### Routes

| Route | zh counterpart |
| --- | --- |
| `/` | `/zh/` |
| `/projects` | `/zh/projects` |
| `/projects/wennian` · `hycell` · `taiyi-lingjing` · `pet-ai-health` · `pdig` | `/zh/projects/<slug>` |
| `/research` | `/zh/research` |
| `/about` | `/zh/about` |
| `/resume` | `/zh/resume` |
| `/404` | `/zh/404` |

---

## Content editing

### Adding a project

Create one Markdown file **per language**, sharing the same `slug`:

`src/content/projects/en/<slug>.md`

```markdown
---
title: "Project Name"
slug: "project-name"
year: 2026
status: "Active"
category: "AI Health"
summary: "One sentence, no adjectives that cost nothing."
description: "Two sentences used for SEO + card body."
tags: ["Aging clock", "Agents", "Digital twin"]
featured: true
order: 1
role: "Design & implementation"
repo: "https://github.com/huangdi97/example"   # omit if not public
demo: ""                                        # omit if none
cover: ""                                       # omit to use generated visual
---

## Overview
…
```

Allowed `status` values: `Active`, `Research`, `Prototype`, `Stable`, `Archived`.

Then mirror it at `src/content/projects/zh/<slug>.md` with the **same slug** and
frontmatter keys. Product names stay untranslated (`WenNian / 知身·问年`,
`HyCell`, `TaiYi Lingjing / 太一·灵境`).

### Rules that keep the site honest

- Every fact must be traceable to a public repository, its README, or the account itself.
- If a repository does not exist, omit `repo` — the page will render without a repository link.
- Never invent metrics, users, revenue, employers, degrees, papers or benchmarks.
- `src/config/site.ts` is the only place site-wide facts live. It is commented per field.

### Case studies vs. README

A case study answers *why this project exists, what it does about it, and how it is built*.
A repository README answers *how to run it*. They are deliberately different documents —
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

| Record | Type | Value |
| --- | --- | --- |
| `haoleilab.com` | `A` | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` |
| `www` | `CNAME` | `huangdi97.github.io` |

Then enable **Enforce HTTPS** in the Pages settings once the certificate is issued.
Any future domain only requires editing `public/CNAME` — no code changes.

---

## Quality assurance

| Check | Command |
| --- | --- |
| Lint | `npm run lint` |
| Types | `npm run typecheck` |
| Production build | `npm run build` |
| Dead links / missing assets | `node scripts/verify-build.mjs` |
| Browser tests | `npm run test` |

`scripts/verify-build.mjs` walks every generated HTML file, resolves internal links
against built routes, checks local asset references exist, and confirms each case
study is present in both locales.

`tests/site.spec.ts` covers: homepage render, navigation, project listing, case-study
detail, language switching with path preservation, mobile hamburger menu, resume print
route, 404 page, external link attributes, no horizontal overflow at 375 px, and
absence of console errors.

### Verified viewports

375 · 390 · 430 · 768 · 1024 · 1280 · 1440 · 1920

---

## Design system

Tokens are declared once in `src/styles/global.css`:

| Token | Value | Use |
| --- | --- | --- |
| `--canvas` | `#F7F7F4` | Page background |
| `--surface` | `#FFFFFF` | Cards |
| `--ink` | `#111111` | Primary text |
| `--ink-2` | `#666666` | Secondary text |
| `--line` | `rgba(0,0,0,0.10)` | Borders |
| `--accent` | `#315CFF` | Sparse — links, single focal elements |

Type uses system fonts only (`Inter` → `system-ui` → `PingFang SC` / `Microsoft YaHei`),
so there is no webfont cost on first paint. Motion is 150–500 ms and fully disabled
under `prefers-reduced-motion`.

---

## Privacy

No analytics, no pixels, no fingerprinting, no third-party scripts. The site is
static and tracks nothing.

---

## License

Code is licensed under the [MIT License](LICENSE).
Written content and project case studies are © Hao Lei.
