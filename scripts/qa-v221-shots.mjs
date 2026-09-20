/**
 * v2.2.1 screenshot and measurement set (§69–§72, §56–§58).
 *
 * Usage: node scripts/qa-v221-shots.mjs [baseUrl]
 *
 * What is different from the v2.2 set, and why it is a new script rather than an
 * edit of the old one. The v2.2 round was about payload; its frames existed to
 * show that the page survives without images. This round is about the *field* —
 * banding, per-page variants, and the Research composition — so the frames have
 * to be looked at at full length, at both widths, and with the rasters off, and
 * every frame carries the background's own measurements next to it.
 *
 *   §69  Paper, 1440 — home, /projects, /research, /about, /resume, full page,
 *        plus /research's first screen on its own. /resume is in the set because
 *        this round widens it and empties its background; the open-source
 *        surface is a section of /projects rather than a route, so /projects
 *        full-page is its frame.
 *
 *   §70  No-raster, 1440 — home, /research, /about with every raster request
 *        aborted. §56 asks specifically that /research must not become a large
 *        blank, so its audit records how much text survives.
 *
 *   §71  Paper, 390 — the same five pages, so the mobile composition is reviewed
 *        rather than inferred.
 *
 *   §72  English — every one of the above is captured in both locales, and the
 *        console table carries the horizontal-overflow measurement for each
 *        (§68: zero overflow in zh and en at 1440 and 390).
 *
 *   §57  Slow network — Fast 3G and Slow 4G profiles on the pages that carry the
 *        most artwork, recording the order in which things arrive.
 *
 * Everything is written to `.qa-screens/v221/` (gitignored) with a
 * `measurements.json` next to the frames. Diagnostic images from this round's
 * banding investigation live in `.qa-screens/v221/_diag/` so the frame count in
 * the report is not inflated by them.
 */
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const BASE = process.argv[2] ?? 'http://127.0.0.1:4321';
const OUT = '.qa-screens/v221';

const LANGS = [
  { lang: 'zh', prefix: '/zh' },
  { lang: 'en', prefix: '' },
];

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

const PAGES = [
  { key: 'home', path: '/' },
  { key: 'projects', path: '/projects/' },
  { key: 'research', path: '/research/' },
  { key: 'about', path: '/about/' },
  { key: 'resume', path: '/resume/' },
];

/** §70 reviews these three with the rasters switched off. */
const NO_IMAGE_PAGES = ['home', 'research', 'about'];

const IMAGE_GLOB = '**/*.{png,jpg,jpeg,webp,avif,svg}';

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();

/**
 * Open a page with a pinned theme and language.
 *
 * The language bootstrap redirects when `haoleilab-language` disagrees with the
 * path, so the stored value has to match the route being opened — otherwise the
 * capture lands on the other locale's page.
 */
async function open(path, viewport, lang, { theme = 'paper', blockImages = false } = {}) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();

  if (blockImages) await page.route(IMAGE_GLOB, (route) => route.abort());

  await page.addInitScript(
    ({ themeValue, language }) => {
      try {
        localStorage.setItem('haoleilab-theme', themeValue);
        localStorage.setItem('haoleilab-language', language);
      } catch {
        /* storage unavailable */
      }
    },
    { themeValue: theme, language: lang },
  );

  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });

  if (!blockImages) {
    /* Scroll the whole document so lazy images decode, then return to the top.
       A full-page capture taken without this races the network and the plates
       come out empty. */
    await page.evaluate(async () => {
      const step = window.innerHeight / 2;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await page.evaluate(() =>
      Promise.all(
        Array.from(document.images)
          .filter((image) => !image.complete)
          .map((image) => new Promise((r) => image.addEventListener('load', r, { once: true }))),
      ),
    );
    await page.waitForTimeout(400);
  }

  return { context, page };
}

const shots = [];
const measurements = {};

async function frame(path, viewport, lang, name, options = {}) {
  const { fullPage = false, theme = 'paper', blockImages = false, audit = null } = options;
  const { context, page } = await open(path, viewport, lang, { theme, blockImages });
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage });

  let result = null;
  if (audit) result = await page.evaluate(audit);

  await context.close();
  shots.push(name);
  return result;
}

/**
 * The background, measured on the rendered page.
 *
 * `--ebg-scale` is read from the mounted element rather than from the
 * stylesheet, so the variant table is verified where it is actually applied;
 * `overflowX` is §68's measurement and is recorded on every frame rather than
 * asserted in one place.
 */
const PAGE_AUDIT = () => {
  const bg = document.querySelector('[data-editorial-background]');
  const texture = document.querySelector('.ebg-texture');
  const wash = document.querySelector('.ebg-wash');
  const h1 = document.querySelector('h1');
  const images = performance
    .getEntriesByType('resource')
    .filter((entry) => /\/images\/|\/texture\//.test(entry.name))
    .map((entry) => ({
      file: entry.name.split('/').pop(),
      startMs: Math.round(entry.startTime),
      doneMs: Math.round(entry.responseEnd),
      transferBytes: entry.transferSize,
    }));

  const paints = Object.fromEntries(
    performance.getEntriesByType('paint').map((entry) => [
      entry.name,
      Math.round(entry.startTime),
    ]),
  );

  return {
    documentHeight: document.documentElement.scrollHeight,
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    /* §59 asks for the inner-page h1 to come down by 12–18%. The only way to
       report that honestly is to read the rendered size, so every frame
       records it. */
    h1FontSize: h1 ? Math.round(Number.parseFloat(getComputedStyle(h1).fontSize) * 100) / 100 : 0,
    background: bg
      ? {
          mode: bg.dataset.bgMode ?? '',
          scale: Number(getComputedStyle(bg).getPropertyValue('--ebg-scale').trim()),
          washScale: Number(getComputedStyle(bg).getPropertyValue('--ebg-wash-scale').trim()),
          groups: Array.from(bg.querySelectorAll('[data-bg-group]')).map(
            (group) => group.dataset.bgGroup ?? '',
          ),
          visibleGroups: Array.from(bg.querySelectorAll('[data-bg-group]')).filter(
            (group) => getComputedStyle(group).display !== 'none',
          ).length,
          textureSize: texture ? getComputedStyle(texture).backgroundSize : '',
          textureOpacity: texture ? Number(getComputedStyle(texture).opacity) : 0,
          washImage: wash ? getComputedStyle(wash).backgroundImage : 'none',
        }
      : null,
    imageCount: images.length,
    imageBytes: images.reduce((sum, image) => sum + image.transferBytes, 0),
    images,
    paints,
    eagerImages: Array.from(document.images).filter((image) => image.loading === 'eager').length,
    lazyImages: Array.from(document.images).filter((image) => image.loading === 'lazy').length,
  };
};

/** §56: what survives when nothing raster arrives. */
const NO_IMAGE_AUDIT = () => {
  const wash = document.querySelector('.ebg-wash');
  const texture = document.querySelector('.ebg-texture');
  const background = document.querySelector('[data-editorial-background]');
  const main = document.querySelector('main');
  const h1 = document.querySelector('h1');
  return {
    documentHeight: document.documentElement.scrollHeight,
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    backgroundHeight: background ? Math.round(background.getBoundingClientRect().height) : 0,
    washPainted: wash ? getComputedStyle(wash).backgroundImage !== 'none' : false,
    washOpacity: wash ? Number(getComputedStyle(wash).opacity) : 0,
    texturePainted: texture ? getComputedStyle(texture).backgroundImage !== 'none' : false,
    fragments: document.querySelectorAll('[data-editorial-background] [data-bg-group]').length,
    h1Present: Boolean(h1 && h1.getBoundingClientRect().height > 0),
    mainTextLength: (main?.textContent ?? '').replace(/\s+/g, ' ').trim().length,
    brokenImages: Array.from(document.images).filter(
      (image) => image.complete && image.naturalWidth === 0,
    ).length,
  };
};

/* ── §69 · desktop, Paper, full page ──────────────────────────────────────── */

for (const { lang, prefix } of LANGS) {
  for (const { key, path } of PAGES) {
    const audit = await frame(`${prefix}${path}`, DESKTOP, lang, `${key}-1440-paper-${lang}`, {
      fullPage: true,
      audit: PAGE_AUDIT,
    });
    measurements[`${key}-1440-${lang}`] = audit;
  }

  // §69: the Research first screen on its own, so the composition can be read
  // without scrolling through the essay under it.
  await frame(`${prefix}/research/`, DESKTOP, lang, `research-top-1440-${lang}`, {
    audit: PAGE_AUDIT,
  });

  /* White and Night are out of review scope, but this round changed every
     theme's `--bg-*` table, so they get looked at rather than assumed. */
  await frame(`${prefix}/`, DESKTOP, lang, `home-1440-white-${lang}`, { theme: 'white' });
  await frame(`${prefix}/`, DESKTOP, lang, `home-1440-night-${lang}`, { theme: 'night' });
  await frame(`${prefix}/research/`, DESKTOP, lang, `research-1440-night-${lang}`, {
    theme: 'night',
  });
}

/* ── §71 · mobile, Paper ──────────────────────────────────────────────────── */

for (const { lang, prefix } of LANGS) {
  for (const { key, path } of PAGES) {
    const audit = await frame(`${prefix}${path}`, MOBILE, lang, `${key}-390-paper-${lang}`, {
      fullPage: true,
      audit: PAGE_AUDIT,
    });
    measurements[`${key}-390-${lang}`] = audit;
  }
}

/* ── §70 · no image, desktop ──────────────────────────────────────────────── */

for (const { lang, prefix } of LANGS) {
  for (const { key, path } of PAGES.filter((page) => NO_IMAGE_PAGES.includes(page.key))) {
    const audit = await frame(`${prefix}${path}`, DESKTOP, lang, `${key}-1440-noimage-${lang}`, {
      fullPage: true,
      blockImages: true,
      audit: NO_IMAGE_AUDIT,
    });
    measurements[`${key}-1440-noimage-${lang}`] = audit;
  }
}

/* ── §57 · slow network ───────────────────────────────────────────────────── */

/**
 * Two standard profiles. Fast 3G is 1.6 Mbps / 750 kbps / 150 ms RTT; Slow 4G
 * here is the tighter 400 kbps / 400 kbps / 400 ms RTT profile. The point is not
 * a score — it is to watch the order in which things arrive. The page has to be
 * readable before the hero lands, and the hero has to be the thing that arrives
 * last rather than the thing the page waits on.
 */
const PROFILES = {
  fast3g: { latency: 150, download: (1.6 * 1024 * 1024) / 8, upload: (750 * 1024) / 8 },
  slow4g: { latency: 400, download: (400 * 1024) / 8, upload: (400 * 1024) / 8 },
};

async function slowFrame(path, lang, name, profile) {
  const context = await browser.newContext({ viewport: DESKTOP, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.addInitScript((language) => {
    try {
      localStorage.setItem('haoleilab-theme', 'paper');
      localStorage.setItem('haoleilab-language', language);
    } catch {
      /* storage unavailable */
    }
  }, lang);

  const client = await context.newCDPSession(page);
  await client.send('Network.enable');
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: profile.latency,
    downloadThroughput: profile.download,
    uploadThroughput: profile.upload,
  });

  await page.goto(`${BASE}${path}`, { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${OUT}/${name}.png` });

  const audit = await page.evaluate(PAGE_AUDIT);
  await context.close();
  shots.push(name);
  return audit;
}

measurements['fast3g-home'] = await slowFrame('/', 'en', 'home-1440-fast3g', PROFILES.fast3g);
measurements['fast3g-research'] = await slowFrame(
  '/research/',
  'en',
  'research-1440-fast3g',
  PROFILES.fast3g,
);
measurements['slow4g-research'] = await slowFrame(
  '/research/',
  'en',
  'research-1440-slow4g',
  PROFILES.slow4g,
);

/* ── report ───────────────────────────────────────────────────────────────── */

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
const pad = (value, width) => String(value).padEnd(width);

console.log(`\n  ${shots.length} frames → ${OUT}/\n`);

for (const [label, data] of Object.entries(measurements)) {
  if (!data.background) {
    console.log(
      `  ${pad(label, 30)} ${String(data.documentHeight).padStart(5)}px  ` +
        `overflow ${String(data.overflowX).padStart(3)}  ` +
        `bg ${String(data.backgroundHeight).padStart(5)}px  ` +
        `fragments ${data.fragments}  text ${data.mainTextLength} chars  ` +
        `h1 ${data.h1Present ? 'yes' : 'NO'}  broken ${data.brokenImages}`,
    );
    continue;
  }

  const bg = data.background;
  console.log(
    `  ${pad(label, 30)} ${String(data.documentHeight).padStart(5)}px  ` +
      `overflow ${String(data.overflowX).padStart(3)}  ` +
      `h1 ${String(data.h1FontSize).padStart(6)}px  ` +
      `mode ${pad(bg.mode, 10)} scale ${String(bg.scale).padEnd(5)} ` +
      `groups ${bg.visibleGroups}/${bg.groups.length}  ` +
      `tile ${pad(bg.textureSize, 10)} @${bg.textureOpacity.toFixed(3)}  ` +
      `${String(data.imageCount).padStart(2)} img ${kb(data.imageBytes).padStart(9)}  ` +
      `FCP ${data.paints['first-contentful-paint'] ?? '—'}ms`,
  );
}

for (const profile of ['fast3g', 'slow4g']) {
  const slow = measurements[`${profile}-home`] ?? measurements[`${profile}-research`];
  if (!slow) continue;
  console.log(`\n  ${profile} — request order:`);
  for (const image of slow.images.slice(0, 8)) {
    console.log(
      `    ${String(image.startMs).padStart(6)}ms → ${String(image.doneMs).padStart(6)}ms  ` +
        `${kb(image.transferBytes).padStart(9)}  ${image.file}`,
    );
  }
  console.log(`    first contentful paint: ${slow.paints['first-contentful-paint'] ?? '—'}ms`);
}
console.log('');

await writeFile(`${OUT}/measurements.json`, `${JSON.stringify(measurements, null, 2)}\n`);
await browser.close();
