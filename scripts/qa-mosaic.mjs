/**
 * Mosaic audit — card height vs illustration height, and where the page spends
 * its pixels. Local review tool only.
 *
 * Usage: node scripts/qa-mosaic.mjs [baseUrl]
 */
import { chromium } from 'playwright';

const BASE = process.argv[2] ?? 'http://127.0.0.1:4321';

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
await page.addInitScript(() => {
  try {
    localStorage.setItem('haoleilab-theme', 'paper');
    localStorage.setItem('haoleilab-language', 'zh');
  } catch {
    /* storage unavailable */
  }
});
await page.goto(`${BASE}/zh/`, { waitUntil: 'networkidle' });
await page.evaluate(async () => {
  const step = window.innerHeight / 2;
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 40));
  }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(300);

const report = await page.evaluate(() => {
  const doc = document.documentElement.scrollHeight;
  const rect = (sel) => {
    const el = document.querySelector(sel);
    return el ? Math.round(el.getBoundingClientRect().height) : 0;
  };
  const cards = [...document.querySelectorAll('[data-mosaic-card]')].map((card) => {
    const vis = card.querySelector('[data-mosaic-visual]');
    const h = Math.round(card.getBoundingClientRect().height);
    const v = vis ? Math.round(vis.getBoundingClientRect().height) : 0;
    const text = card.innerText.replace(/\s+/g, ' ').trim();
    return {
      slug: card.dataset.mosaicSlug,
      span: card.dataset.span,
      card: h,
      visual: v,
      ratio: h ? +(v / h).toFixed(2) : 0,
      chars: text.length,
    };
  });
  return {
    doc,
    header: rect('header.site-header'),
    hero: rect('.hero'),
    work: rect('#work'),
    band: rect('.statement-band'),
    contact: rect('#contact'),
    footer: rect('footer.site-footer'),
    cards,
  };
});

const pct = (n) => `${((n / report.doc) * 100).toFixed(1)}%`;
console.log(`document ${report.doc}px`);
console.log(
  `  hero    ${String(report.hero).padStart(5)}px  ${pct(report.hero)}   (target 20–25%)`,
);
console.log(
  `  work    ${String(report.work).padStart(5)}px  ${pct(report.work)}   (target 50–60%)`,
);
console.log(
  `  band    ${String(report.band).padStart(5)}px  ${pct(report.band)}   (target 10–15%)`,
);
console.log(
  `  contact ${String(report.contact).padStart(5)}px  ${pct(report.contact)}`,
);
console.log(
  `  footer  ${String(report.footer).padStart(5)}px  ${pct(report.footer)}`,
);
console.log(`\ncards (visual share of card, target 45–65%):`);
for (const c of report.cards) {
  console.log(
    `  ${String(c.slug).padEnd(10)} span ${c.span}  card ${String(c.card).padStart(4)}px  visual ${String(c.visual).padStart(4)}px  ${(c.ratio * 100).toFixed(0)}%  ${c.chars} chars`,
  );
}

await browser.close();
