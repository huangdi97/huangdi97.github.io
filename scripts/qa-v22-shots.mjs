/**
 * v2.2 screenshot and measurement set (§90–§93).
 *
 * Usage: node scripts/qa-v22-shots.mjs [baseUrl]
 *
 * The round's acceptance argument is not "the numbers went down", it is "the
 * page is already good before the bytes arrive". So this script produces three
 * kinds of evidence, and the third is the one that decides the round:
 *
 *   §90  Paper, 1440 — home, /projects, /research, /about, plus the two
 *        non-reviewed themes on the homepage first screen so White and Night
 *        can be looked at rather than assumed.
 *
 *   §92  Paper, 390 — the same four pages, so the mobile composition is
 *        reviewed instead of inferred.
 *
 *   §91  No-image, 1440 — home, /research, /about with every raster request
 *        aborted. This is §86/§87: if these frames are empty or structurally
 *        broken, the round failed, whatever the payload says.
 *
 *   §93  Slow 4G — the homepage and /research under throttling, recording when
 *        the hero was requested, when it arrived, and when the page first
 *        painted. §85 is explicit that perception matters more than file size,
 *        so the measurement is *order*, not just bytes.
 *
 * Everything is written to `.qa-screens/v22/` (gitignored) with a
 * `measurements.json` next to the frames.
 */
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const BASE = process.argv[2] ?? 'http://127.0.0.1:4321';
const OUT = '.qa-screens/v22';

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
];

/** §91 reviews these three with the rasters switched off. */
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

/** Everything a reviewer needs to see what the page asked for, and when. */
const IMAGE_AUDIT = () => {
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
    imageCount: images.length,
    imageBytes: images.reduce((sum, image) => sum + image.transferBytes, 0),
    images,
    paints,
    eagerImages: Array.from(document.querySelectorAll('img')).filter(
      (image) => image.loading === 'eager',
    ).length,
    lazyImages: Array.from(document.querySelectorAll('img')).filter(
      (image) => image.loading === 'lazy',
    ).length,
  };
};

/** §91: what survives when nothing raster arrives. */
const NO_IMAGE_AUDIT = () => {
  const wash = document.querySelector('.ebg-wash');
  const texture = document.querySelector('.ebg-texture');
  const background = document.querySelector('[data-editorial-background]');
  const main = document.querySelector('main');
  return {
    documentHeight: document.documentElement.scrollHeight,
    backgroundHeight: background ? Math.round(background.getBoundingClientRect().height) : 0,
    washPainted: wash ? getComputedStyle(wash).backgroundImage !== 'none' : false,
    washOpacity: wash ? Number(getComputedStyle(wash).opacity) : 0,
    texturePainted: texture ? getComputedStyle(texture).backgroundImage !== 'none' : false,
    visibleFragments: document.querySelectorAll('[data-editorial-background] [data-bg-group]')
      .length,
    mainTextLength: (main?.textContent ?? '').replace(/\s+/g, ' ').trim().length,
    brokenImages: Array.from(document.images).filter(
      (image) => image.complete && image.naturalWidth === 0,
    ).length,
  };
};

/* ── §90 · desktop, Paper ─────────────────────────────────────────────────── */

for (const { lang, prefix } of LANGS) {
  for (const { key, path } of PAGES) {
    const audit = await frame(`${prefix}${path}`, DESKTOP, lang, `${key}-1440-paper-${lang}`, {
      fullPage: true,
      audit: IMAGE_AUDIT,
    });
    measurements[`${key}-1440-${lang}`] = audit;
  }

  /* White and Night are out of review scope this round, but §5 and §6 make
     claims about them, so they get looked at rather than assumed. */
  await frame(`${prefix}/`, DESKTOP, lang, `home-1440-white-${lang}`, { theme: 'white' });
  await frame(`${prefix}/`, DESKTOP, lang, `home-1440-night-${lang}`, { theme: 'night' });
  await frame(`${prefix}/research/`, DESKTOP, lang, `research-1440-night-${lang}`, {
    theme: 'night',
  });
}

/* ── §92 · mobile, Paper ──────────────────────────────────────────────────── */

for (const { lang, prefix } of LANGS) {
  for (const { key, path } of PAGES) {
    const audit = await frame(`${prefix}${path}`, MOBILE, lang, `${key}-390-paper-${lang}`, {
      fullPage: true,
      audit: IMAGE_AUDIT,
    });
    measurements[`${key}-390-${lang}`] = audit;
  }
}

/* ── §91 · no image, desktop ──────────────────────────────────────────────── */

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

/* ── §93 · Slow 4G ────────────────────────────────────────────────────────── */

/**
 * 1.6 Mbps down, 750 kbps up, 150 ms RTT — the standard Slow 4G profile. The
 * point is not a score; it is to watch the order in which things arrive. The
 * page has to be readable before the hero lands, and the hero has to be the
 * thing that arrives last rather than the thing the page waits on.
 */
async function slowFrame(path, lang, name) {
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
    latency: 150,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
  });

  await page.goto(`${BASE}${path}`, { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${OUT}/${name}.png` });

  const audit = await page.evaluate(IMAGE_AUDIT);
  await context.close();
  shots.push(name);
  return audit;
}

measurements['slow4g-home'] = await slowFrame('/', 'en', 'home-1440-slow4g');
measurements['slow4g-research'] = await slowFrame('/research/', 'en', 'research-1440-slow4g');

/* ── report ───────────────────────────────────────────────────────────────── */

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;

console.log(`\n  ${shots.length} frames → ${OUT}/\n`);

for (const [label, data] of Object.entries(measurements)) {
  if (data.imageCount === undefined) {
    console.log(
      `  ${label.padEnd(26)} ${String(data.documentHeight).padStart(5)}px  ` +
        `bg ${data.backgroundHeight}px  fragments ${data.visibleFragments}  ` +
        `text ${data.mainTextLength} chars  broken ${data.brokenImages}`,
    );
    continue;
  }

  const fcp = data.paints['first-contentful-paint'];
  const first = data.images[0];
  console.log(
    `  ${label.padEnd(26)} ${String(data.documentHeight).padStart(5)}px  ` +
      `${String(data.imageCount).padStart(2)} image(s)  ${kb(data.imageBytes).padStart(9)}  ` +
      `eager ${data.eagerImages} lazy ${data.lazyImages}  ` +
      `FCP ${fcp ?? '—'}ms  first request ${first ? `${first.startMs}ms` : '—'}`,
  );
}

const slow = measurements['slow4g-home'];
console.log('\n  Slow 4G — homepage, request order:');
for (const image of slow.images.slice(0, 8)) {
  console.log(
    `    ${String(image.startMs).padStart(5)}ms → ${String(image.doneMs).padStart(6)}ms  ` +
      `${kb(image.transferBytes).padStart(9)}  ${image.file}`,
  );
}
console.log(`    first contentful paint: ${slow.paints['first-contentful-paint'] ?? '—'}ms\n`);

await writeFile(`${OUT}/measurements.json`, `${JSON.stringify(measurements, null, 2)}\n`);
await browser.close();
