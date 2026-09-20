# `.artwork-source/` — the owner's original artwork, kept out of the build

This directory is the **archive of originals**. It is the only place the two
artwork pipelines look for source images, and it is deliberately outside
`public/`.

## Why it is not under `public/`

Everything under `public/` is copied verbatim into `dist/` by the Astro build
and is therefore publicly fetchable. Until v2.1's final closure the five
homepage originals sat in `public/images/home/v2/source/`, which published
**12,030,940 bytes** of unused PNGs at `/images/home/v2/source/*.png` — nothing
referenced them; the build simply copied them. Moving the archive here removes
that surface entirely. Nothing under `.artwork-source/` is ever served.

## Version control

This archive **is tracked**, on the owner's explicit instruction. It is kept out
of `public/` so that it is never *served*, not so that it is lost — the sources
are the only copy of the artwork the site is built from, and a build machine that
cannot find them cannot regenerate a single `.webp`. Roughly 17 MB of PNGs, none
of them larger than 2.5 MB.

Nothing here is reachable over HTTP. The pipeline reads it from disk at build
time; the deployable output is `public/**/*.webp`.

## Layout

```
.artwork-source/
├── home/
│   └── v2/                      ← five homepage slots
│       ├── hero-source.png
│       ├── wennian-source.png
│       ├── hycell-source.png
│       ├── morn-source.png
│       └── biopulse-source.png
└── site/
    └── v2/
        └── pages/               ← the two inner-page bands
            ├── research-source.png
            └── about-source.png
```

The name in front of `-source` is the slot. Any of `.png`, `.jpg`, `.jpeg`,
`.tif`, `.tiff`, `.webp` or `.avif` is accepted, and both pipelines match on the
stem, so a file that arrives as `知身·问年.png` or `Hero (final).png` still
resolves. An exact stem match always wins over an alias match, and two files
claiming one slot is an error rather than a silent pick.

## Producing the served files

```bash
npm run artwork:v2       # .artwork-source/home/v2/        → public/images/home/v2/*.webp
npm run artwork:pages    # .artwork-source/site/v2/pages/  → public/images/site/v2/pages/*.webp
```

Both write a generated manifest — `src/data/home-artwork.generated.json` and
`src/data/page-artwork.generated.json` — which is what `Artwork.astro` reads for
intrinsic size. That is what reserves the space before the bytes arrive and
keeps CLS at zero.

Neither pipeline designs, redraws or substitutes an image. It resizes (never
enlarging), encodes to WebP and records the result.

## Current state

| slot     | source                       | served                                | delivered         |
| -------- | ---------------------------- | ------------------------------------- | ----------------- |
| Hero     | `home/v2/hero-source.png`    | `/images/home/v2/hero.webp`           | 1586×992 · 180 KB |
| ZhiShen  | `home/v2/wennian-source.png` | `/images/home/v2/wennian.webp`        | 1600×900 · 129 KB |
| HyCell   | `home/v2/hycell-source.png`  | `/images/home/v2/hycell.webp`         | 1600×900 · 182 KB |
| Morn     | `home/v2/morn-source.png`    | `/images/home/v2/morn.webp`           | 1600×900 · 128 KB |
| BioPulse | `home/v2/biopulse-source.png`| `/images/home/v2/biopulse.webp`       | 1600×900 · 196 KB |
| Research | `site/v2/pages/research-source.png` | `/images/site/v2/pages/research.webp` | 1600×800 · 128 KB |
| About    | `site/v2/pages/about-source.png`    | `/images/site/v2/pages/about.webp`    | 1600×800 · 156 KB |

The hero source is 1586px wide, below the 1800–2200px target; the optimizer does
not upscale, so it ships at 1586px and says so.

## Tuning a crop

`ART_PLACEMENT` in `src/data/artwork.ts` holds each slot's `object-position` and
frame ratio, plus an optional mobile pair. To judge a change before shipping it,
render the actual crop from the archive:

```bash
npm run artwork:preview -- 1.6 100 50 .qa-screens/crop research about
#                          ratio posX posY outDir          [slot...]
```

That reproduces `object-fit: cover` + `object-position` in sharp and prints the
window of the source that survives, so the decision is made by looking at the
picture rather than by arithmetic. Slot names are discovered from this
directory, so the preview can never drift from what will actually be built.
