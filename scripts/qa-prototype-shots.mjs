/**
 * v1.7-P0 prototype screenshots — exactly three, Paper, 1440px, /zh/.
 *
 * Usage: node scripts/qa-prototype-shots.mjs [baseUrl]
 *
 * The brief is explicit that a visual prototype should be judged from three
 * images rather than twenty, so this script produces three and nothing else:
 *
 *   hero-first-screen.png   1440 × 900, scroll 0
 *   selected-work.png       the #work section, clipped at real resolution
 *   homepage-full.png       the whole document
 *
 * Local review artifacts only; the directory is gitignored.
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const BASE = process.argv[2] ?? 'http://127.0.0.1:4321';
const OUT = '.qa-screens/v17';
const ROUTE = '/zh/';
const THEME = 'paper';

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();

await page.addInitScript((theme) => {
  try {
    localStorage.setItem('haoleilab-theme', theme);
    localStorage.setItem('haoleilab-language', 'zh');
  } catch {
    /* storage unavailable */
  }
}, THEME);

await page.goto(`${BASE}${ROUTE}`, { waitUntil: 'networkidle' });

// Reveal anything that animates in, then settle back at the top.
await page.evaluate(async () => {
  const step = window.innerHeight / 2;
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 50));
  }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(500);

/* 1. the first screen */
await page.screenshot({ path: `${OUT}/hero-first-screen.png` });

/* 2. Selected Work, captured as an element so a section taller than the
      viewport is stitched correctly rather than clipped to a blank band. */
const work = page.locator('#work');
const workBox = await work.boundingBox();
if (!workBox) throw new Error('#work not found');
await work.screenshot({ path: `${OUT}/selected-work.png` });

/* 3. the whole page */
await page.screenshot({ path: `${OUT}/homepage-full.png`, fullPage: true });

const height = await page.evaluate(() => document.documentElement.scrollHeight);

console.log(`hero-first-screen.png  1440 x 900`);
console.log(`selected-work.png      1440 x ${Math.round(workBox.height)}`);
console.log(`homepage-full.png      1440 x ${height}`);
console.log(`\nDocument height: ${height}px`);

await browser.close();
