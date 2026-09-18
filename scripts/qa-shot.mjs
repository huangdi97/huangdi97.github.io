/**
 * Capture one full-page screenshot and report its true pixel size.
 *
 * Usage: node scripts/qa-shot.mjs <baseUrl> <route> <out.png> [width]
 *
 * Prints the CSS scrollHeight next to the PNG's real height so a mismatch
 * (lazy content, a late layout shift, a fixed-position layer) is visible
 * instead of silently baked into a review image.
 */
import { chromium } from 'playwright';

const [base, route, out, width = '1440'] = process.argv.slice(2);
if (!base || !route || !out) {
  console.error('usage: node scripts/qa-shot.mjs <baseUrl> <route> <out.png> [width]');
  process.exit(1);
}

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: Number(width), height: 900 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();

await page.addInitScript(() => {
  try {
    // Match the locale to the path being loaded. Pinning 'en' unconditionally
    // would make a /zh/ capture silently redirect to the English page.
    const path = window.location.pathname;
    localStorage.setItem(
      'haoleilab-language',
      path === '/zh' || path.startsWith('/zh/') ? 'zh' : 'en',
    );
  } catch {
    /* storage unavailable */
  }
});

await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
await page.evaluate(async () => {
  const step = window.innerHeight / 2;
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 50));
  }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(400);

const cssHeight = await page.evaluate(() => document.documentElement.scrollHeight);
await page.screenshot({ path: out, fullPage: true });
await browser.close();

const { readFileSync } = await import('node:fs');
const png = readFileSync(out);
console.log(`${out}: css ${cssHeight}px, png ${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`);
