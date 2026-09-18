/**
 * Visual QA crops — the shots a reviewer actually needs to judge v1.6.
 *
 * Usage: node scripts/qa-crops.mjs [baseUrl]
 *
 * Full-page images of a 7800px document downscale to nothing. These crops are
 * captured at real resolution instead:
 *
 *   first-screen-<theme>   1440×900 at scroll 0  — can you see the science?
 *   mid-<theme>            1440×900 at ~42%      — is the field still there?
 *   lower-<theme>          1440×900 at ~80%      — the notes / contact band
 *   footer-<theme>         1440×900 at the end   — does the page still end
 *                                                  on the same surface?
 *   mobile-first-paper     390×844  at scroll 0  — phone composition
 *   mobile-footer-paper    390×844  at the end
 *
 * Local review artifacts only; the directory is gitignored.
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const BASE = process.argv[2] ?? 'http://127.0.0.1:4321';
const OUT = '.qa-screens/v16';
const ROUTE = '/zh/';

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();

async function open(theme, viewport) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.addInitScript((value) => {
    try {
      localStorage.setItem('haoleilab-theme', value);
      localStorage.setItem('haoleilab-language', 'zh');
    } catch {
      /* storage unavailable */
    }
  }, theme);
  await page.goto(`${BASE}${ROUTE}`, { waitUntil: 'networkidle' });

  // Reveal anything that animates in, then settle.
  await page.evaluate(async () => {
    const step = window.innerHeight / 2;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 45));
    }
  });
  await page.waitForTimeout(300);
  return { context, page };
}

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

for (const theme of ['paper', 'white', 'night']) {
  const { context, page } = await open(theme, DESKTOP);

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUT}/first-screen-${theme}.png` });

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.42));
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUT}/mid-${theme}.png` });

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.8));
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUT}/lower-${theme}.png` });

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${OUT}/footer-${theme}.png` });

  console.log(`  ${theme}: first-screen / mid / lower / footer`);
  await context.close();
}

{
  const { context, page } = await open('paper', MOBILE);

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUT}/mobile-first-paper.png` });

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${OUT}/mobile-footer-paper.png` });

  console.log('  mobile: first-screen / footer');
  await context.close();
}

await browser.close();
console.log(`\nQA crops written to ${OUT}/`);
