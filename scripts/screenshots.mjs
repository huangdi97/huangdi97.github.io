/**
 * Captures review screenshots of the built site at several viewports.
 *
 * Usage: node scripts/screenshots.mjs [baseUrl]
 * Output: .qa-screens/<slug>-<viewport>.png
 *
 * These are local review artifacts only; they are gitignored.
 */
import { chromium, devices } from 'playwright';
import { mkdir } from 'node:fs/promises';

const BASE = process.argv[2] ?? 'http://127.0.0.1:4321';
const OUT = '.qa-screens';

const ROUTES = [
  ['home', '/'],
  ['projects', '/projects/'],
  ['project-wennian', '/projects/wennian/'],
  ['research', '/research/'],
  ['about', '/about/'],
  ['resume', '/resume/'],
  ['zh-home', '/zh/'],
  ['zh-project', '/zh/projects/hycell/'],
  ['not-found', '/404.html'],
];

const VIEWPORTS = [
  ['desktop', { width: 1440, height: 1000 }],
  ['tablet', { width: 768, height: 1000 }],
  ['mobile', { ...devices['Pixel 5'].viewport }],
];

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
let failures = 0;

for (const [name, viewport] of VIEWPORTS) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();

  for (const [slug, route] of ROUTES) {
    try {
      const res = await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
      if (!res || res.status() >= 400) throw new Error(`status ${res?.status()}`);

      // Scroll through the page so IntersectionObserver-driven reveals fire,
      // then return to the top before capturing.
      await page.evaluate(async () => {
        const step = window.innerHeight / 2;
        for (let y = 0; y <= document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 40));
        }
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 300));
      });

      await page.screenshot({
        path: `${OUT}/${slug}-${name}.png`,
        fullPage: name === 'desktop',
      });
    } catch (error) {
      failures += 1;
      console.error(`FAIL ${slug}-${name}: ${error.message}`);
    }
  }

  await context.close();
}

await browser.close();
console.log(`Screenshots written to ${OUT}/ (${failures} failure(s)).`);
process.exit(failures === 0 ? 0 : 1);
