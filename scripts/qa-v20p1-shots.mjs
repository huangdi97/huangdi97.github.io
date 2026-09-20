/**
 * v2.0-P1 screenshot QA (§54) — the four approved frames, and nothing else.
 *
 * Usage: node scripts/qa-v20p1-shots.mjs [baseUrl] [--themes]
 *
 *   hero-paper-1440.png        first screen, Paper, 1440 × 900
 *   projects-paper-1440.png    #work, captured as an element
 *   homepage-paper-1440.png    the whole document, Paper
 *   homepage-390-mobile.png    the whole document, 390px
 *
 * Those four are the export set the owner asked for. `--themes` additionally
 * writes white-1440.png and night-1440.png as review aids; they are not part of
 * the approved set and are not produced by a default run.
 *
 * It also prints the geometry the brief is written in numbers about — hero
 * copy/artwork split (§8), the four row heights (§26) and each artwork's share
 * of its row (§25) — so a review does not have to be done by eye alone.
 *
 * Local review artifacts only; `.qa-screens/` is gitignored.
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const BASE = process.argv[2] ?? 'http://127.0.0.1:4321';
const OUT = '.qa-screens/v20p1';
const ROUTE = '/zh/';

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();

/** A page that has been scrolled end to end, so lazy images have decoded. */
async function open(width, height, theme) {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.addInitScript((t) => {
    try {
      localStorage.setItem('haoleilab-theme', t);
      localStorage.setItem('haoleilab-language', 'zh');
    } catch {
      /* storage unavailable */
    }
  }, theme);
  await page.goto(`${BASE}${ROUTE}`, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    const step = window.innerHeight / 2;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  // Every lazy image has to have finished decoding before a full-page shot,
  // otherwise the capture races the network and the plates come out empty.
  await page.evaluate(() =>
    Promise.all(
      Array.from(document.images)
        .filter((i) => !i.complete)
        .map((i) => new Promise((r) => i.addEventListener('load', r, { once: true }))),
    ),
  );
  await page.waitForTimeout(500);
  return { context, page };
}

const pct = (a, b) => (b ? `${((a / b) * 100).toFixed(1)}%` : 'n/a');

/* ── desktop ──────────────────────────────────────────────────────────────── */
const desktop = await open(1440, 900, 'paper');
const page = desktop.page;

await page.screenshot({ path: `${OUT}/hero-paper-1440.png` });
await page.locator('#work').screenshot({ path: `${OUT}/projects-paper-1440.png` });
await page.screenshot({ path: `${OUT}/homepage-paper-1440.png`, fullPage: true });

const geometry = await page.evaluate(() => {
  const box = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
  };
  const hero = document.querySelector('.hero');
  const rows = Array.from(document.querySelectorAll('[data-featured-row]'));
  /* §8's percentages are shares of the row's content width, not of its padded
     box — the hero is a `.shell`, so its 1200px includes 56px of gutter each
     side that neither the copy nor the artwork may use. Measuring against the
     padded box understates both by about four points. */
  const contentWidth = (el) => {
    if (!el) return 0;
    const s = getComputedStyle(el);
    return el.clientWidth - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight);
  };
  return {
    documentHeight: document.documentElement.scrollHeight,
    mainSections: document.querySelectorAll('main > section').length,
    mathBandPresent: Boolean(document.querySelector('#mathbio')),
    hero: box(hero),
    heroContentWidth: Math.round(contentWidth(hero)),
    heroCopy: box(hero?.querySelector('.hero-copy')),
    heroArt: box(hero?.querySelector('.hero-art')),
    rows: rows.map((row) => {
      const r = box(row);
      const art = box(row.querySelector('.row-art'));
      const copy = box(row.querySelector('.row-copy'));
      return {
        slug: row.dataset.slug,
        height: r?.h ?? 0,
        artWidth: art?.w ?? 0,
        copyWidth: copy?.w ?? 0,
        artShare: r && art ? +((art.w / r.w) * 100).toFixed(1) : 0,
        copyShare: r && copy ? +((copy.w / r.w) * 100).toFixed(1) : 0,
        artSide: r && art ? (art.x + art.w / 2 < r.x + r.w / 2 ? 'left' : 'right') : '?',
        source: row.querySelector('[data-artwork]')?.dataset.artworkSource ?? '?',
        status: row.querySelector('.row-status')?.textContent?.trim() ?? '',
      };
    }),
  };
});

console.log('\n  ── document ───────────────────────────────────────────────');
console.log(`  height          ${geometry.documentHeight}px`);
console.log(`  main sections   ${geometry.mainSections}   (expected 3: hero · work · contact)`);
console.log(`  #mathbio        ${geometry.mathBandPresent ? 'PRESENT — §32 violated' : 'absent  ✓'}`);

console.log('\n  ── hero (§8) ──────────────────────────────────────────────');
console.log(`  hero height     ${geometry.hero?.h}px   content ${geometry.heroContentWidth}px`);
console.log(
  `  copy            ${geometry.heroCopy?.w}px  ${pct(geometry.heroCopy?.w ?? 0, geometry.heroContentWidth)}   (target 38–45%)`,
);
console.log(
  `  artwork         ${geometry.heroArt?.w}px  ${pct(geometry.heroArt?.w ?? 0, geometry.heroContentWidth)}   (target 55–62%)`,
);

console.log('\n  ── featured rows (§16, §25, §26) ──────────────────────────');
for (const [i, r] of geometry.rows.entries()) {
  console.log(
    `  ${i + 1}. ${String(r.slug).padEnd(9)} ${String(r.height).padStart(4)}px  art ${String(r.artWidth).padStart(4)}px ${String(r.artShare).padStart(5)}% ${r.artSide.padEnd(5)} copy ${String(r.copyShare).padStart(5)}%  [${r.source}]  ${r.status}`,
  );
}

/* ── mobile (§45–§47) ─────────────────────────────────────────────────────── */
const mobile = await open(390, 844, 'paper');
await mobile.page.screenshot({ path: `${OUT}/homepage-390-mobile.png`, fullPage: true });

const mobileGeometry = await mobile.page.evaluate(() => {
  const rows = Array.from(document.querySelectorAll('[data-featured-row]'));
  const hero = document.querySelector('.hero');
  const copy = hero?.querySelector('.hero-copy')?.getBoundingClientRect();
  const art = hero?.querySelector('.hero-art')?.getBoundingClientRect();
  return {
    documentHeight: document.documentElement.scrollHeight,
    heroCopyTop: Math.round(copy?.top ?? 0),
    heroArtTop: Math.round(art?.top ?? 0),
    heroArtWidth: Math.round(art?.width ?? 0),
    rowOrder: rows.map((row) => {
      const a = row.querySelector('.row-art')?.getBoundingClientRect();
      const c = row.querySelector('.row-copy')?.getBoundingClientRect();
      return (a?.top ?? 0) < (c?.top ?? 0) ? 'art→copy' : 'copy→art';
    }),
  };
});

console.log('\n  ── mobile 390 (§45–§47) ───────────────────────────────────');
console.log(`  height          ${mobileGeometry.documentHeight}px`);
console.log(
  `  hero order      copy@${mobileGeometry.heroCopyTop}  art@${mobileGeometry.heroArtTop}  → ${mobileGeometry.heroCopyTop < mobileGeometry.heroArtTop ? 'copy first ✓' : 'ART FIRST ✗'}`,
);
console.log(`  hero art width  ${mobileGeometry.heroArtWidth}px  (viewport 390)`);
console.log(`  row order       ${mobileGeometry.rowOrder.join(', ')}`);
console.log(
  `                  ${new Set(mobileGeometry.rowOrder).size === 1 ? 'consistent across all four ✓' : 'INCONSISTENT ✗'}`,
);

await mobile.context.close();

/* ── resource timing (§52) ────────────────────────────────────────────────── */
/* A cold local desktop load against a preview server on 127.0.0.1, watching for
   the LCP candidate entry.
 *
 * This is NOT a Web Vitals result and must not be reported as one. It is a local
 * measurement against an unthrottled loopback server with no network latency, no
 * CDN, no TLS, no compression negotiation and a warm filesystem — conditions no
 * visitor is ever in. The millisecond value is therefore meaningless as a
 * performance claim.
 *
 * What it IS good for is the two things that do not depend on the machine: which
 * element the browser picks as the LCP candidate, and whether that element
 * carries the loading hints §48 asks for. Those are structural facts about the
 * page, and they are what this section reports. */
const perf = await open(1440, 900, 'paper');
const lcp = await perf.page.evaluate(async () => {
  const entry = await new Promise((resolve) => {
    const seen = performance.getEntriesByType('largest-contentful-paint');
    if (seen.length) return resolve(seen[seen.length - 1]);
    try {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        resolve(entries[entries.length - 1]);
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {
      resolve(null);
    }
    setTimeout(() => resolve(null), 4000);
  });
  if (!entry) return null;
  const el = entry.element;
  return {
    startTime: Math.round(entry.startTime),
    size: Math.round(entry.size),
    tag: el?.tagName?.toLowerCase() ?? 'unknown',
    src: el?.getAttribute?.('src') ?? '',
    loading: el?.getAttribute?.('loading') ?? '',
    fetchpriority: el?.getAttribute?.('fetchpriority') ?? '',
  };
});

const imageBytes = await perf.page.evaluate(async () => {
  const out = [];
  for (const img of document.querySelectorAll('main img')) {
    const res = await fetch(img.currentSrc || img.src, { cache: 'force-cache' });
    const blob = await res.blob();
    out.push({
      src: new URL(img.currentSrc || img.src).pathname,
      kb: Math.round(blob.size / 1024),
      loading: img.getAttribute('loading') ?? 'eager',
      complete: img.complete,
    });
  }
  return out;
});

console.log('\n  ── resource timing (§52) — LOCAL, not a Web Vitals result ──');
if (lcp) {
  console.log(`  LCP candidate   <${lcp.tag}>  ${lcp.src.split('/').pop() || '(text)'}`);
  console.log(`  observed at     ${lcp.startTime}ms   size ${lcp.size}px²`);
  console.log(`  candidate hints loading="${lcp.loading}" fetchpriority="${lcp.fetchpriority}"`);
  console.log(
    `                  ${lcp.tag === 'img' && lcp.fetchpriority === 'high' ? 'hero asset is the LCP candidate and is prioritised ✓' : 'CHECK: the LCP candidate is not the prioritised hero asset'}`,
  );
  console.log(
    '                  (loopback preview, unthrottled — the ms value is not a field measurement)',
  );
} else {
  console.log('  LCP candidate   not reported by this browser build');
}
let totalKb = 0;
for (const i of imageBytes) {
  totalKb += i.kb;
  console.log(`  ${String(i.kb).padStart(5)} KB  ${i.loading.padEnd(6)} ${i.src}`);
}
console.log(`  ${String(totalKb).padStart(5)} KB  total across ${imageBytes.length} images`);

await perf.context.close();

/* ── optional themes (§44) ────────────────────────────────────────────────── */
/* Off by default. The approved export set is the four Paper frames above and
   nothing else, so White and Night are produced only when asked for:
   `npm run qa:v20p1 -- --themes`. They remain review aids, not deliverables. */
if (process.argv.includes('--themes')) {
  for (const theme of ['white', 'night']) {
    const t = await open(1440, 900, theme);
    await t.page.screenshot({ path: `${OUT}/${theme}-1440.png` });
    await t.context.close();
  }
}

await desktop.context.close();
await browser.close();

console.log(`\n  screenshots → ${OUT}/`);
console.log('  hero-paper-1440 · projects-paper-1440 · homepage-paper-1440 · homepage-390-mobile');
console.log('  (add --themes for the optional white-1440 / night-1440 review frames)\n');
