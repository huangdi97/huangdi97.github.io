/**
 * Dump the measured v1.6 background numbers for the release report.
 *
 * Usage: node scripts/qa-canvas-report.mjs [baseUrl]
 *
 * Prints, per theme: the four computed opacity weights, and the macro/micro
 * mark counts with how many survive at 390px. Numbers quoted in a report
 * should be measured, not restated from the stylesheet.
 */
import { chromium } from 'playwright';

const BASE = process.argv[2] ?? 'http://127.0.0.1:4321';

const browser = await chromium.launch();

for (const theme of ['paper', 'white', 'night']) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.addInitScript((value) => {
    try {
      localStorage.setItem('haoleilab-theme', value);
      localStorage.setItem('haoleilab-language', 'zh');
    } catch {
      /* storage unavailable */
    }
  }, theme);
  await page.goto(`${BASE}/zh/`, { waitUntil: 'networkidle' });

  const desktop = await page.evaluate(() => {
    const read = (cls) => {
      const el = document.querySelector(`.global-science .${cls}`);
      return el ? Number(getComputedStyle(el).opacity) : null;
    };
    return {
      macro: read('sci-stroke'),
      notation: read('sci-notation'),
      micro: read('sci-micro'),
      grid: read('sci-grid'),
      accent: read('sci-accent'),
      marks: document.querySelectorAll('.global-science [data-sci-mobile]').length,
      macroPlaques: document.querySelectorAll('.global-science [data-sci-kind]').length,
      microMarks: document.querySelectorAll('.global-science .micro .sci-plaque').length,
      kinds: [...document.querySelectorAll('.global-science [data-sci-kind]')].reduce((acc, el) => {
        const k = el.dataset.sciKind;
        acc[k] = (acc[k] ?? 0) + 1;
        return acc;
      }, {}),
    };
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}/zh/`, { waitUntil: 'networkidle' });
  const mobile = await page.evaluate(() => ({
    marks: document.querySelectorAll('.global-science [data-sci-mobile]:not([style*="display: none"])').length,
    visible: [...document.querySelectorAll('.global-science [data-sci-mobile]')].filter(
      (el) => getComputedStyle(el).display !== 'none',
    ).length,
    kinds: [...document.querySelectorAll('.global-science [data-sci-kind]')]
      .filter((el) => getComputedStyle(el).display !== 'none')
      .reduce((acc, el) => {
        const k = el.dataset.sciKind;
        acc[k] = (acc[k] ?? 0) + 1;
        return acc;
      }, {}),
  }));

  console.log(
    `${theme.padEnd(6)} macro ${desktop.macro}  notation ${desktop.notation?.toFixed(4)}  micro ${desktop.micro}  grid ${desktop.grid}  accent ${desktop.accent}`,
  );
  console.log(
    `       macro plaques ${desktop.macroPlaques} ${JSON.stringify(desktop.kinds)}  micro marks ${desktop.microMarks}  marks ${desktop.marks} -> mobile ${mobile.visible}`,
  );
  console.log(`       mobile kinds ${JSON.stringify(mobile.kinds)}`);

  await context.close();
}

await browser.close();
