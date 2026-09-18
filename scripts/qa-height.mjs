/**
 * Height audit — where does the homepage actually spend its pixels?
 *
 * Usage: node scripts/qa-height.mjs [baseUrl]
 *
 * Prints the document height and a per-section breakdown at 1440px, so a
 * reduction round can see which block is really responsible instead of
 * guessing. Local review tool only; no output is committed.
 */
import { chromium } from 'playwright';

const BASE = process.argv[2] ?? 'http://127.0.0.1:4321';
const WIDTH = Number(process.argv[3] ?? 1440);
const HEIGHT = Number(process.argv[4] ?? 900);

const TARGETS = [
  ['/zh/', 'zh'],
  ['/', 'en'],
];

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: WIDTH, height: HEIGHT } });
const page = await context.newPage();

// Pin the locale so '/' is not swapped to '/zh/' by the stored preference.
await page.addInitScript(() => {
  try {
    localStorage.setItem('haoleilab-language', 'en');
  } catch {
    /* storage unavailable */
  }
});

for (const [route, label] of TARGETS) {
  await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    const step = window.innerHeight / 2;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(200);

  const data = await page.evaluate(() => {
    const rows = [];
    const main = document.querySelector('main');
    const walk = (el, depth) => {
      for (const child of el.children) {
        const rect = child.getBoundingClientRect();
        const style = getComputedStyle(child);
        if (style.position === 'absolute' || style.display === 'none') continue;
        const tag = child.tagName.toLowerCase();
        const id = child.id ? `#${child.id}` : '';
        const cls = (child.className || '').toString().split(/\s+/).filter(Boolean).slice(0, 2);
        if (depth < 2 && (tag === 'section' || tag === 'article' || rect.height > 200)) {
          rows.push({
            label: `${'  '.repeat(depth)}${tag}${id}.${cls.join('.')}`,
            top: Math.round(rect.top + window.scrollY),
            height: Math.round(rect.height),
          });
          walk(child, depth + 1);
        }
      }
    };
    if (main) walk(main, 0);
    const footer = document.querySelector('footer.site-footer');
    return {
      document: document.documentElement.scrollHeight,
      main: main ? Math.round(main.getBoundingClientRect().height) : 0,
      header: Math.round(document.querySelector('header.site-header')?.getBoundingClientRect().height ?? 0),
      footer: footer ? Math.round(footer.getBoundingClientRect().height) : 0,
      rows,
    };
  });

  console.log(`\n=== ${route} (${label}) ===`);
  console.log(`document ${data.document}px | header ${data.header} | main ${data.main} | footer ${data.footer}`);
  for (const row of data.rows) {
    console.log(`  ${String(row.top).padStart(5)}px  ${String(row.height).padStart(5)}px  ${row.label}`);
  }
}

await browser.close();
