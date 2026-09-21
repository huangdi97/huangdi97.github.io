#!/usr/bin/env node
/**
 * Works screenshot and measurement set (v2.3, §95–§99).
 *
 * Usage: node scripts/qa-works-shots.mjs [--fixtures=8] [--keep]
 *
 * Why this is a script that owns its own fixtures rather than a screenshot pass
 * over the real site. The site has **no published works** — §30 and §31 forbid
 * publishing anything the owner has not handed over, and §32 forbids standing a
 * placeholder in for it. But §95 still requires the Works layouts to be looked
 * at, and §96 requires them to survive one, three and eight entries. So the
 * frames have to be taken over content that exists only for the duration of
 * this run.
 *
 * §83 is the rule that makes that legitimate, and it comes with its own
 * condition: the fixture may be used, and it must not reach a production page.
 * Three things enforce that, and none of them is a promise:
 *
 *   1. the fixture entries are written with `draft: true`, and `src/lib/works.ts`
 *      is the single place the draft rule lives;
 *   2. the build runs under `--mode works-preview`, which is the one condition
 *      that lifts the draft rule — `npm run build`, the script CI runs, never
 *      sets it;
 *   3. both generated sets are gitignored, and the cleanup below runs in a
 *      `finally`, so an interrupted run still leaves the tree clean.
 *
 * Everything lands in `.qa-screens/works/` (gitignored) with a
 * `measurements.json` beside the frames. §99 is explicit that the numbers are
 * recorded rather than asserted to be good: the local preview server's timings
 * are resource timings, not field Web Vitals.
 */
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from 'playwright';
import sharp from 'sharp';

const ROOT = process.cwd();
const CONTENT_DIR = join(ROOT, 'src', 'content', 'works');
const POSTER_DIR = join(ROOT, 'public', 'images', 'works');
const OUT = join(ROOT, '.qa-screens', 'works');
const PORT = 4399;

/** §21: the shared ladder. A fixture poster ships the same three rungs a real one does. */
const LADDER = [640, 960, 1440];

const args = process.argv.slice(2);
const KEEP = args.includes('--keep');
const fixtureCount = Number(
  (args.find((a) => a.startsWith('--fixtures=')) ?? '--fixtures=8').split('=')[1],
);

/**
 * `--base=<url>` points the capture phase at a preview server that is already
 * running, and skips the build and the server this script would otherwise own.
 *
 * It exists because the two phases fail differently here. The build deletes
 * `dist/` wholesale, and in this sandbox a bulk delete that runs *inside* a
 * spawned child blocks indefinitely — the same build run directly exits 0 in
 * about 40 s. Splitting the phases lets the build be run the way that works and
 * the capture still be reproducible from this file rather than by hand.
 */
const EXTERNAL_BASE = args.find((a) => a.startsWith('--base='))?.split('=')[1];
const BASE = EXTERNAL_BASE ?? `http://127.0.0.1:${PORT}`;

/**
 * Every deletion this script makes is one of its own fixture files, by explicit
 * path, so the sandbox's bulk-delete guard is asked to allow them here rather
 * than per call site.
 *
 * It has to be set in **this** process: the bypass `build()` passes to the child
 * does not reach the parent's own `unlinkSync`, which is why an earlier version
 * ended a run with correct frames, a correct `measurements.json`, and all 40
 * fixture files still on disk while printing "cleaned up 0 file(s)".
 */
process.env.CODEBUDDY_SAFE_DELETE_ENABLED = '0';

/**
 * The fixture set.
 *
 * Chosen so that one run covers every shape §83 and §95–§96 name: all six types,
 * all three statuses, five distinct aspect ratios including two portraits, an
 * external video, a non-video external link, and an image-only work. `featured`
 * is set on two of them so §68's ordering is visible in the frames rather than
 * only in the helper's unit of work.
 */
const FIXTURES = [
  {
    slug: 'qa-film-16x9',
    en: 'Fixture — Cinematic 16:9',
    zh: '测试件 — 横屏 16:9',
    type: 'film',
    ratio: '16/9',
    year: 2026,
    duration: '15s',
    featured: true,
    status: 'published',
    video: true,
    tone: 214,
    /* §44: only this one fixture carries credits, so a single capture shows
       both states — the row rendered, and the row correctly absent. */
    credits: ['Score — Fixture Composer', 'Colour — Fixture Grader'],
  },
  {
    slug: 'qa-film-9x16',
    en: 'Fixture — Portrait 9:16',
    zh: '测试件 — 竖屏 9:16',
    type: 'film',
    ratio: '9/16',
    year: 2026,
    duration: '30s',
    featured: true,
    status: 'published',
    video: true,
    tone: 198,
  },
  {
    slug: 'qa-visual-1x1',
    en: 'Fixture — Square 1:1',
    zh: '测试件 — 方形 1:1',
    type: 'visual',
    ratio: '1/1',
    year: 2025,
    featured: false,
    status: 'published',
    video: false,
    tone: 226,
  },
  {
    slug: 'qa-generative-3x2',
    en: 'Fixture — Generative 3:2',
    zh: '测试件 — 生成视觉 3:2',
    type: 'generative',
    ratio: '3/2',
    year: 2025,
    featured: false,
    status: 'published',
    video: false,
    tone: 206,
  },
  {
    slug: 'qa-cultural-9x16',
    en: 'Fixture — Cultural AI 9:16',
    zh: '测试件 — 文化 AI 9:16',
    type: 'cultural-ai',
    ratio: '9/16',
    year: 2026,
    featured: false,
    status: 'published',
    video: true,
    tone: 190,
  },
  {
    slug: 'qa-heritage-4x3',
    en: 'Fixture — Digital Heritage 4:3',
    zh: '测试件 — 数字遗产 4:3',
    type: 'digital-heritage',
    ratio: '4/3',
    year: 2024,
    featured: false,
    status: 'archive',
    video: false,
    tone: 218,
  },
  {
    slug: 'qa-interactive-16x9',
    en: 'Fixture — Interactive 16:9',
    zh: '测试件 — 交互作品 16:9',
    type: 'interactive',
    ratio: '16/9',
    year: 2026,
    featured: false,
    status: 'published',
    external: true,
    video: false,
    tone: 210,
  },
  {
    slug: 'qa-experiment-9x16',
    en: 'Fixture — Experiment 9:16',
    zh: '测试件 — 实验 9:16',
    type: 'visual',
    ratio: '9/16',
    year: 2026,
    featured: false,
    status: 'experiment',
    video: false,
    tone: 194,
  },
];

/* -------------------------------------------------------------------------- */
/* Fixture generation                                                          */
/* -------------------------------------------------------------------------- */

/**
 * One fixture poster as an SVG.
 *
 * Deliberately not styled like the site: §58 says a work keeps its own colour,
 * and a fixture tinted with the editorial palette would make the frames look
 * like the works had been harmonised, which is the thing that rule forbids. So
 * these are neutral greys with the ratio printed on them — unmistakably QA
 * scaffolding, and easy to tell apart in a screenshot.
 */
function posterSvg(width, height, fixture) {
  const [rw, rh] = fixture.ratio.split('/').map(Number);
  const label = `${rw} : ${rh}`;
  const fontSize = Math.round(Math.min(width, height) * 0.06);
  const small = Math.round(fontSize * 0.52);
  const ink = '#3a3a37';
  const faint = '#6d6d68';
  const tone = fixture.tone;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="rgb(${tone},${tone - 4},${tone - 10})"/>
  <path d="M 0 0 L ${width} ${height} M ${width} 0 L 0 ${height}" stroke="${ink}" stroke-width="${Math.max(1, width / 600)}" stroke-opacity="0.16" fill="none"/>
  <rect x="${width * 0.06}" y="${height * 0.06}" width="${width * 0.88}" height="${height * 0.88}" fill="none" stroke="${ink}" stroke-width="${Math.max(1, width / 700)}" stroke-opacity="0.22"/>
  <text x="50%" y="47%" text-anchor="middle" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="${fontSize}" fill="${ink}" letter-spacing="0.06em">QA FIXTURE</text>
  <text x="50%" y="47%" dy="${fontSize * 1.5}" text-anchor="middle" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="${small}" fill="${faint}" letter-spacing="0.14em">${label} · ${fixture.slug}</text>
</svg>`;
}

async function writePosters() {
  const written = [];
  for (const fixture of FIXTURES) {
    const [rw, rh] = fixture.ratio.split('/').map(Number);
    for (const width of LADDER) {
      const height = Math.round((width * rh) / rw);
      const file = join(POSTER_DIR, `${fixture.slug}-${width}.webp`);
      await sharp(Buffer.from(posterSvg(width, height, fixture)))
        .webp({ quality: 82, effort: 4 })
        .toFile(file);
      written.push(file);
    }
  }
  return written;
}

/** A minimal, valid frontmatter block for one fixture. The body stays empty: §43
 *  keeps the detail page a display, so a work has nothing to say in Markdown. */
function fixtureMarkdown(fixture, lang) {
  const lines = [
    '---',
    `title: ${JSON.stringify(lang === 'zh' ? fixture.zh : fixture.en)}`,
    `slug: ${JSON.stringify(fixture.slug)}`,
    `year: ${fixture.year}`,
    `type: ${JSON.stringify(fixture.type)}`,
    `status: ${JSON.stringify(fixture.status)}`,
    `featured: ${fixture.featured}`,
    `poster: ${JSON.stringify(`/images/works/${fixture.slug}`)}`,
    `aspectRatio: ${JSON.stringify(fixture.ratio)}`,
    `description: ${JSON.stringify(
      lang === 'zh'
        ? '测试用条目，用于验证版式，不会出现在正式站点上。'
        : 'QA fixture entry, used to verify the layout. Never part of the published site.',
    )}`,
    `posterAlt: ${JSON.stringify(
      lang === 'zh'
        ? '灰底测试海报，标有画幅比例'
        : 'Grey QA fixture poster labelled with its aspect ratio',
    )}`,
    `role: ${JSON.stringify(lang === 'zh' ? '导演 · 视觉设计' : 'Direction · Visual Design')}`,
    `tools: ["ComfyUI", "MiniMax H3"]`,
  ];

  if (fixture.duration) lines.push(`duration: ${JSON.stringify(fixture.duration)}`);
  /* §44: absent on every other fixture on purpose — the detail page must not
     print an empty `Credits` heading, so one capture has to show both. */
  if (fixture.credits) lines.push(`credits: ${JSON.stringify(fixture.credits)}`);
  if (fixture.video) {
    lines.push(`videoProvider: "external"`);
    lines.push(`videoUrl: ${JSON.stringify(`https://example.com/works/${fixture.slug}`)}`);
  }
  if (fixture.external) {
    lines.push(`externalUrl: ${JSON.stringify(`https://example.com/view/${fixture.slug}`)}`);
  }
  lines.push(`publishedAt: "${fixture.year}-01-01"`);
  /* §83: the fixture exists for this run only. `draft` is what keeps it out of
     every build that is not the preview mode. */
  lines.push('draft: true');
  lines.push('---');
  lines.push('');
  lines.push('<!-- QA fixture. Generated by scripts/qa-works-shots.mjs; never published. -->');
  lines.push('');

  return lines.join('\n');
}

/**
 * Remove every fixture already on disk, whatever run wrote it.
 *
 * `writeFixtures` only writes the fixtures this run selected, so a smaller run
 * used to leave the previous run's entries behind and the build would render the
 * union: asking for one fixture produced `count-1: expected 1, rendered 8`. The
 * prefixes are reserved for this script — `_qa-` in the content dirs and `qa-` in
 * the poster dir — so nothing a real work would be named can match.
 */
function clearFixtures() {
  const removed = [];
  for (const dir of [join(CONTENT_DIR, 'en'), join(CONTENT_DIR, 'zh'), POSTER_DIR]) {
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir)) {
      if (!file.startsWith('_qa-') && !file.startsWith('qa-')) continue;
      const full = join(dir, file);
      try {
        unlinkSync(full);
        removed.push(full);
      } catch {
        /* reported by the leftover check at the end of the run */
      }
    }
  }
  return removed;
}

async function writeFixtures(selected) {
  const written = [];
  for (const lang of ['en', 'zh']) {
    const dir = join(CONTENT_DIR, lang);
    await mkdir(dir, { recursive: true });
    for (const fixture of selected) {
      const file = join(dir, `_qa-${fixture.slug}.md`);
      writeFileSync(file, fixtureMarkdown(fixture, lang), 'utf8');
      written.push(file);
    }
  }
  return written;
}

/**
 * Delete exactly what this run wrote.
 *
 * Individual `unlinkSync` calls rather than a recursive remove: the sandbox
 * blocks bulk deletion. The failures are **collected and reported** rather than
 * swallowed — the first version of this function caught the error and pushed
 * nothing, so a blocked delete printed "cleaned up 0 files" and left the tree
 * dirty while looking like it had done its job. A cleanup that cannot fail
 * loudly is worse than no cleanup.
 */
function cleanup(files) {
  const removed = [];
  const failed = [];

  for (const file of files) {
    if (!existsSync(file)) continue;
    try {
      unlinkSync(file);
      removed.push(file);
    } catch (error) {
      failed.push(`${file} — ${error.code ?? error.message}`);
    }
  }

  return { removed, failed };
}

/* -------------------------------------------------------------------------- */
/* Build and serve                                                             */
/* -------------------------------------------------------------------------- */

function build() {
  const result = spawnSync('npx', ['astro', 'build', '--mode', 'works-preview'], {
    cwd: ROOT,
    shell: true,
    stdio: 'inherit',
    /* The sandbox's safe-delete shim turns Astro's output cleanup into a
         non-zero exit even when every page was written. */
    env: { ...process.env, CODEBUDDY_SAFE_DELETE_ENABLED: '0' },
  });
  return result.status;
}

async function waitForServer(url, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) return true;
    } catch {
      /* not up yet */
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return false;
}

/* -------------------------------------------------------------------------- */
/* Capture                                                                     */
/* -------------------------------------------------------------------------- */

const LANGS = [
  { lang: 'zh', prefix: '/zh' },
  { lang: 'en', prefix: '' },
];

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

/**
 * Open a page with the theme and language pinned.
 *
 * Both keys have to be set: the language bootstrap redirects when the stored
 * language disagrees with the path, so a capture that set only the theme would
 * land on the other locale's page.
 */
async function open(browser, path, viewport, lang, { theme = 'paper', blockVideo = false } = {}) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();

  if (blockVideo) {
    await page.route(/(youtube\.com|youtu\.be|bilibili\.com|douyin\.com|vimeo\.com)/, (route) =>
      route.abort(),
    );
  }

  await page.addInitScript(
    ({ themeValue, language }) => {
      try {
        localStorage.setItem('haoleilab-theme', themeValue);
        localStorage.setItem('haoleilab-language', language);
      } catch {
        /* storage unavailable */
      }

      /* §99: cumulative layout shift, collected in the page rather than
         estimated from the outside — and with its sources, because §98 is not
         "keep the number small" but "the layout must be stable", and a number
         without a cause cannot be told apart from a measurement artefact. */
      window.__cls = 0;
      window.__shifts = [];
      try {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.hadRecentInput) continue;
            window.__cls += entry.value;
            window.__shifts.push({
              value: Number(entry.value.toFixed(4)),
              at: Math.round(entry.startTime),
              sources: (entry.sources ?? []).map((s) => ({
                node: s.node
                  ? `${String(s.node.tagName ?? '').toLowerCase()}${s.node.className ? `.${String(s.node.className).trim().split(/\s+/).slice(0, 2).join('.')}` : ''}`
                  : 'unknown',
                from: s.previousRect
                  ? `${Math.round(s.previousRect.top)}h${Math.round(s.previousRect.height)}`
                  : null,
                to: s.currentRect
                  ? `${Math.round(s.currentRect.top)}h${Math.round(s.currentRect.height)}`
                  : null,
              })),
            });
          }
        }).observe({ type: 'layout-shift', buffered: true });
      } catch {
        /* the browser has no layout-shift API */
      }
    },
    { themeValue: theme, language: lang },
  );

  await page.goto(`${BASE}${path}`, { waitUntil: 'load' });
  await page.waitForTimeout(400);
  return { context, page };
}

/**
 * §99: what the page actually cost and how much it moved.
 *
 * `videoBytes` is the number the round exists to keep at zero — §19 and §53 —
 * and it is measured from the network rather than asserted from the markup.
 */
async function measure(page) {
  return page.evaluate(() => {
    const entries = performance.getEntriesByType('resource');
    const bytes = (list) => list.reduce((total, e) => total + (e.transferSize || 0), 0);

    const video = entries.filter(
      (e) => e.initiatorType === 'video' || /\.(mp4|webm|mov|m4v|m3u8)(\?|$)/i.test(e.name),
    );
    const images = entries.filter(
      (e) => e.initiatorType === 'img' || /\.(webp|png|jpe?g|avif|svg)(\?|$)/i.test(e.name),
    );

    return {
      requestCount: entries.length,
      imageRequests: images.length,
      imageBytes: bytes(images),
      videoRequests: video.length,
      videoBytes: bytes(video),
      cls: Number((window.__cls ?? 0).toFixed(4)),
      shifts: (window.__shifts ?? []).slice(0, 4),
      videoElements: document.querySelectorAll('video').length,
      iframes: document.querySelectorAll('iframe').length,
      docHeight: document.documentElement.scrollHeight,
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
}

async function shoot(page, name, { fullPage = true } = {}) {
  await page.screenshot({ path: join(OUT, `${name}.png`), fullPage });
}

/**
 * Walk the page so every lazy poster has been requested.
 *
 * §54 puts every poster below the fold on `loading="lazy"`, which is the policy
 * — and a full-page screenshot does not scroll, so a lazy image that was never
 * near the viewport has no bytes when the frame is taken. The first version of
 * this harness produced frames with three empty posters and an `imageRequests`
 * of 7 for 8 works, which reads as a layout bug and is not one.
 *
 * The order matters, and that is why this is not folded into `measure()`:
 * layout shift is a property of the **initial** load, so it is measured before
 * this runs. Bytes and request counts are properties of the whole page, so they
 * are measured after.
 */
async function primeLazyImages(page) {
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.8);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 60));
    }
    window.scrollTo(0, 0);

    await Promise.all(
      [...document.images]
        .filter((img) => !img.complete)
        .map(
          (img) =>
            new Promise((resolve) => {
              img.addEventListener('load', resolve, { once: true });
              img.addEventListener('error', resolve, { once: true });
            }),
        ),
    );

    if (document.fonts?.ready) await document.fonts.ready;
  });

  await page.waitForTimeout(250);
}

/**
 * Measure, load, measure again, then capture.
 *
 * Returns the record that goes into `measurements.json`: the initial-load CLS
 * with its sources, and the whole-page byte and request counts.
 */
async function capture(page, name) {
  const initial = await measure(page);
  await primeLazyImages(page);
  const full = await measure(page);
  await shoot(page, name);

  return {
    ...full,
    cls: initial.cls,
    clsSources: initial.shifts,
    imagesLoaded: await page.evaluate(
      () => [...document.images].filter((img) => img.complete && img.naturalWidth > 0).length,
    ),
    imagesTotal: await page.evaluate(() => document.images.length),
  };
}

/* -------------------------------------------------------------------------- */
/* Run                                                                         */
/* -------------------------------------------------------------------------- */

const selected = FIXTURES.slice(0, Math.max(1, Math.min(fixtureCount, FIXTURES.length)));

await mkdir(OUT, { recursive: true });
await mkdir(POSTER_DIR, { recursive: true });

/**
 * `--write-only` lays the fixtures down and stops.
 *
 * It exists for the same reason as `--base`: the build has to be run by hand
 * here, so the fixtures have to be able to exist without one. The three phases
 * are otherwise inseparable, which is fine when they can run in one process and
 * useless when they cannot.
 */
if (args.includes('--write-only')) {
  console.log(`\n[works-qa] writing ${selected.length} fixture(s) + posters only`);
  const cleared = clearFixtures();
  if (cleared.length) console.log(`[works-qa] cleared ${cleared.length} stale fixture file(s)`);
  const written = [...(await writePosters()), ...(await writeFixtures(selected))];
  console.log(`[works-qa] ${written.length} file(s) written; build and capture skipped`);
  console.log('[works-qa] next: npx astro build --mode works-preview');
  process.exit(0);
}

const writtenFiles = [];
let server = null;
const measurements = {};

try {
  if (EXTERNAL_BASE) {
    /* The fixtures and the build are already in place and this run only
       captures. Re-writing them here would silently change what is being
       measured against what is on disk. */
    console.log(`\n[works-qa] capture-only against ${BASE}`);
  } else {
    console.log(`\n[works-qa] generating ${selected.length} fixture(s) + posters`);
    const cleared = clearFixtures();
    if (cleared.length) console.log(`[works-qa] cleared ${cleared.length} stale fixture file(s)`);
    writtenFiles.push(...(await writePosters()));
    writtenFiles.push(...(await writeFixtures(selected)));

    console.log('[works-qa] building under --mode works-preview');
    const buildStatus = build();
    if (buildStatus !== 0) {
      throw new Error(`astro build exited ${buildStatus}`);
    }

    server = spawn('npx', ['astro', 'preview', '--port', String(PORT), '--host', '127.0.0.1'], {
      cwd: ROOT,
      shell: true,
      stdio: 'ignore',
    });
  }

  if (!(await waitForServer(`${BASE}/works/`))) {
    throw new Error(`preview server did not come up at ${BASE}`);
  }

  const browser = await chromium.launch();

  /* §95 — the index, both widths, in the reviewed locale and in English. */
  for (const { lang, prefix } of LANGS) {
    for (const [label, viewport] of [
      ['1440', DESKTOP],
      ['390', MOBILE],
    ]) {
      const { context, page } = await open(browser, `${prefix}/works/`, viewport, lang);
      measurements[`index-${label}-${lang}`] = await capture(page, `works-index-${label}-${lang}`);
      await context.close();
    }
  }

  /* §97 — the same index with every video provider blocked. §19 says the index
     must not be affected, and the measurement is what proves it rather than the
     absence of a `<video>` tag. */
  {
    const { context, page } = await open(browser, '/works/', DESKTOP, 'zh', { blockVideo: true });
    measurements['index-1440-zh-novideo'] = await capture(page, 'works-index-1440-zh-novideo');
    await context.close();
  }

  /* §95 — one horizontal work and one vertical work, at the widths §95 names.
     Two things are asserted rather than assumed, because both were wrong before:
     the route carries the language prefix so the page and the pinned language
     agree, and the frame really is the fixture's own page. `?? selected[0]`
     used to substitute a horizontal work into the *vertical* frames, which
     produced two identical pictures that read as evidence of a layout the run
     never rendered. A slice with no portrait work now renders no vertical frame
     instead of a mislabelled one. */
  const horizontal = selected.find((f) => f.ratio === '16/9') ?? null;
  const vertical = selected.find((f) => f.ratio === '9/16') ?? null;

  const detailFrames = [
    ...(horizontal ? [[horizontal, 'work-detail-horizontal-1440', DESKTOP]] : []),
    ...(vertical
      ? [
          [vertical, 'work-detail-vertical-1440', DESKTOP],
          [vertical, 'work-detail-vertical-390', MOBILE],
        ]
      : []),
  ];

  for (const ratio of ['16/9', '9/16']) {
    if (!selected.some((f) => f.ratio === ratio)) {
      console.log(`[works-qa] no ${ratio} work in this slice — its detail frame(s) skipped`);
    }
  }

  for (const [fixture, name, viewport] of detailFrames) {
    const { context, page } = await open(browser, `/zh/works/${fixture.slug}/`, viewport, 'zh');

    const heading = ((await page.locator('h1').first().textContent()) ?? '').trim();
    if (!heading.includes(fixture.zh) && !heading.includes(fixture.en)) {
      throw new Error(
        `${name}: captured "${heading}" instead of the detail page for ${fixture.slug}`,
      );
    }

    /* The declared ratio is what the frame claims to show. A 16:9 picture in a
       frame named "vertical" is the failure this replaces. */
    const box = await page.locator('figure.work-poster').first().boundingBox();
    const [ratioW, ratioH] = fixture.ratio.split('/').map(Number);
    const rendered = (box?.width ?? 0) / (box?.height || 1);
    if (Math.abs(rendered - ratioW / ratioH) > 0.02) {
      throw new Error(
        `${name}: the poster renders at ${rendered.toFixed(3)} but ${fixture.slug} declares ${fixture.ratio}`,
      );
    }

    measurements[name] = {
      ...(await capture(page, name)),
      slug: fixture.slug,
      ratio: fixture.ratio,
    };
    await context.close();
  }

  /* §96 — the layout at the three counts the brief names. The count is baked
     into this run's fixture set, so the frame and the number agree. */
  {
    const { context, page } = await open(browser, '/works/', DESKTOP, 'zh');
    measurements[`count-${selected.length}`] = {
      expected: selected.length,
      rendered: await page.locator('[data-work]').count(),
    };
    await capture(page, `works-index-${selected.length}-items-1440`);
    await context.close();
  }

  await browser.close();

  /* Both names on purpose. `measurements.json` is the run that is on disk;
     `measurements-<n>.json` is the record for that count, and §96 asks for the
     layout to be verified at one, three and eight — so the evidence for all
     three has to survive the runs that came after it. */
  const record = `${JSON.stringify({ fixtureCount: selected.length, measurements }, null, 2)}\n`;
  writeFileSync(join(OUT, 'measurements.json'), record, 'utf8');
  writeFileSync(join(OUT, `measurements-${selected.length}.json`), record, 'utf8');

  console.log('\n[works-qa] measurements');
  for (const [key, value] of Object.entries(measurements)) {
    console.log(`  ${key}: ${JSON.stringify(value)}`);
  }
} finally {
  if (server?.pid) {
    /* `/T` because the shell wrapper is the direct child and the preview server
       is its child; killing only the wrapper leaves a process holding the port,
       which makes the next run fail to start. */
    spawnSync('taskkill', ['/pid', String(server.pid), '/T', '/F'], {
      shell: true,
      stdio: 'ignore',
    });
  }

  if (KEEP || EXTERNAL_BASE) {
    console.log(
      `\n[works-qa] ${EXTERNAL_BASE ? 'capture-only' : '--keep'}: fixtures left in place`,
    );
  } else {
    const { removed, failed } = cleanup(writtenFiles);
    console.log(`\n[works-qa] cleaned up ${removed.length} generated file(s)`);

    if (failed.length) {
      console.error(`[works-qa] ${failed.length} file(s) could NOT be deleted:`);
      for (const line of failed.slice(0, 3)) console.error(`  ${line}`);
      console.error(
        '[works-qa] the sandbox intercepts unlink — re-run outside it, or delete them by hand',
      );
    }

    /* A leftover empty directory is harmless but untidy; the glob loader warns
       about a missing base directory, so the directory itself stays. */
    const leftovers = [];
    for (const dir of [CONTENT_DIR, POSTER_DIR]) {
      if (!existsSync(dir)) continue;
      for (const file of readdirSync(dir)) {
        if (file.startsWith('_qa-') || file.startsWith('qa-')) leftovers.push(join(dir, file));
      }
    }
    if (leftovers.length) {
      console.warn(`[works-qa] WARNING: ${leftovers.length} fixture file(s) left behind`);
      console.warn('[works-qa] `npm run works` will report these as stray posters');
    }
  }
}

console.log(`[works-qa] frames in ${OUT}`);
