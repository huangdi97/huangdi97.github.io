/**
 * Theme review screenshots.
 *
 * Captures the combinations a visual review actually needs: three themes at
 * desktop width, and paper + night at 390px, plus one project page per theme so
 * diagrams, evidence panels and the artifact room are covered.
 *
 * Usage: node scripts/screenshots-themes.mjs [baseUrl]
 * Output: .qa-screens/theme-<theme>-<slug>-<viewport>.png
 *
 * Local review artifacts only; the directory is gitignored.
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const BASE = process.argv[2] ?? 'http://127.0.0.1:4321';
const OUT = '.qa-screens';

const THEMES = ['paper', 'white', 'night'];

const ROUTES = [
  ['home', '/zh/'],
  ['home-en', '/'],
  ['project-wennian', '/zh/projects/wennian/'],
  ['project-hycell', '/zh/projects/hycell/'],
  ['project-taiyi', '/zh/projects/taiyi-lingjing/'],
  ['research', '/zh/research/'],
  ['resume', '/zh/resume/'],
  ['not-found', '/404.html'],
];

const VIEWPORTS = [
  ['desktop', { width: 1440, height: 1000 }],
  ['mobile-390', { width: 390, height: 844 }],
];

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
let failures = 0;

for (const theme of THEMES) {
  for (const [viewportName, viewport] of VIEWPORTS) {
    // Mobile review covers the two extremes; night-on-white adds nothing new.
    if (viewportName === 'mobile-390' && theme === 'white') continue;

    const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
    const page = await context.newPage();

    await page.addInitScript((value) => {
      try {
        localStorage.setItem('haoleilab-theme', value);
      } catch {
        /* storage unavailable */
      }
    }, theme);

    for (const [slug, route] of ROUTES) {
      try {
        const response = await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
        if (!response || response.status() >= 400) throw new Error(`status ${response?.status()}`);

        await page.evaluate(async () => {
          const step = window.innerHeight / 2;
          for (let y = 0; y < document.body.scrollHeight; y += step) {
            window.scrollTo(0, y);
            await new Promise((resolve) => setTimeout(resolve, 60));
          }
          window.scrollTo(0, 0);
        });
        await page.waitForTimeout(250);

        const name = `theme-${theme}-${slug}-${viewportName}.png`;
        await page.screenshot({ path: `${OUT}/${name}`, fullPage: true });
        console.log(`  ${name}`);
      } catch (error) {
        failures += 1;
        console.error(`  ✗ ${theme}/${slug}/${viewportName}: ${error.message}`);
      }
    }

    await context.close();
  }
}

await browser.close();

if (failures) {
  console.error(`\n${failures} screenshot(s) failed.`);
  process.exit(1);
}
console.log(`\nTheme screenshots written to ${OUT}/`);
