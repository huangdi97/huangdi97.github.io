/**
 * Generate the public-safe résumé PDFs from the live résumé page.
 *
 * Why this exists: the source résumés on disk (`郝磊-简历.pdf` and friends)
 * contain the owner's mobile number. Publishing them verbatim would leak
 * private data. Instead of copying them, this script prints the site's own
 * Chinese résumé page to PDF — so the PDF and the page are the same document,
 * generated from `src/data/*`, and neither can drift from the other.
 *
 * Privacy contract enforced here and re-checked by `scripts/check-public-identity.mjs`:
 *   present : h30441854@gmail.com, 304418554@qq.com, github.com/huangdi97, haoleilab.com
 *   absent  : 18535864540, haolei970211@163.com
 *
 * Run:  npm run build && node scripts/generate-resume-pdfs.mjs
 * Not part of CI — the two PDFs are committed to public/resume/ and verified
 * by the identity check, so CI never needs a browser with CJK fonts.
 */

import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const OUT_DIR = path.join(ROOT, 'public', 'resume');

const PDF_TITLE = 'Hao Lei — Resume';
const PDF_AUTHOR = 'Hao Lei';

/**
 * Two variants of the same résumé.
 *
 * Both contain every section — neither omits a fact. They differ only in the
 * positioning line and in section order, so each reads as a document aimed at
 * a different reviewer while stating exactly the same truth.
 */
const VARIANTS = [
  {
    id: 'ai-agent',
    file: 'Hao-Lei-AI-Agent-Resume-ZH.pdf',
    subject: 'AI 系统 / 智能体工程方向简历',
    position: '版本定位：AI 系统 · 智能体工程',
    order: [
      'profile',
      'focus',
      'projects',
      'technical',
      'experience',
      'education',
      'research',
      'output',
      'opensource',
      'contact',
    ],
  },
  {
    id: 'ai-lifescience',
    file: 'Hao-Lei-AI-LifeScience-Resume-ZH.pdf',
    subject: 'AI × 生命科学方向简历',
    position: '版本定位：AI × 生命科学',
    order: [
      'profile',
      'focus',
      'research',
      'output',
      'education',
      'experience',
      'technical',
      'projects',
      'opensource',
      'contact',
    ],
  },
];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
};

/** Minimal static server for the built site — no dependency on `astro preview`. */
function serveDist() {
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://127.0.0.1');
      let rel = decodeURIComponent(url.pathname);
      if (rel.endsWith('/')) rel += 'index.html';
      const file = path.join(DIST, rel);
      if (!file.startsWith(DIST) || !existsSync(file)) {
        res.writeHead(404).end('not found');
        return;
      }
      const body = await readFile(file);
      res.writeHead(200, {
        'content-type': MIME[path.extname(file)] ?? 'application/octet-stream',
      });
      res.end(body);
    } catch {
      res.writeHead(500).end('error');
    }
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

/**
 * Print-oriented overrides.
 *
 * The page's own print stylesheet is built for A4 already; these tweaks only
 * compensate for the narrower print viewport used by headless Chromium, so the
 * two-column entry grid survives and nothing is orphaned across a page break.
 */
const PRINT_OVERRIDES = `
@page { margin: 13mm 12mm; }
html, body { background: #fff !important; color: #000 !important; }
.shell { max-width: none !important; padding-inline: 0 !important; }
main { padding-top: 0 !important; }
.resume { max-width: none !important; padding: 0 !important; }
.resume-head { padding-top: 0 !important; max-width: none !important; }
.resume-headline { font-size: 0.95rem !important; }
.resume-entry {
  grid-template-columns: 9.5rem minmax(0, 1fr) !important;
  gap: 0.25rem 1.25rem !important;
  break-inside: avoid !important;
}
.resume-entry-meta { font-size: 0.7rem !important; }
.resume-block { margin-top: 1.1rem !important; padding-top: 0.7rem !important; break-inside: auto; }
.resume-block-title { break-after: avoid; margin-bottom: 0.8rem !important; }
.resume-entries { gap: 1rem !important; }
.resume-text, .resume-entry-lines li, .resume-group-list li { font-size: 0.82rem !important; max-width: none !important; }
.resume-entry-title { font-size: 0.95rem !important; }
.resume-entry-sub { font-size: 0.85rem !important; }
.resume-variant { display: block !important; font-size: 0.72rem !important; margin-top: 0.55rem !important; }
.resume-foot { display: block !important; font-size: 0.7rem !important; margin-top: 1.4rem !important; }
.contact-list { gap: 0.3rem !important; }
a { color: #000 !important; text-decoration: none !important; }
a[href^='http']::after { content: ' (' attr(href) ')' !important; font-size: 0.68em !important; color: #555 !important; }
`;

async function renderVariant(browser, base, variant) {
  const page = await browser.newPage({ viewport: { width: 794, height: 1123 } });
  await page.goto(`${base}/zh/resume/`, { waitUntil: 'networkidle' });

  await page.addStyleTag({ content: PRINT_OVERRIDES });

  await page.evaluate(
    ({ order, position }) => {
      const doc = document.querySelector('.resume');
      const blocks = new Map(
        [...doc.querySelectorAll('[data-resume-section]')].map((n) => [n.dataset.resumeSection, n]),
      );
      const anchor = doc.querySelector('.resume-foot');
      for (const id of order) {
        const node = blocks.get(id);
        if (node) doc.insertBefore(node, anchor);
      }
      const variantLine = doc.querySelector('[data-resume-variant]');
      if (variantLine) {
        variantLine.textContent = position;
        variantLine.removeAttribute('hidden');
      }
    },
    { order: variant.order, position: variant.position },
  );

  const out = path.join(OUT_DIR, variant.file);
  await page.emulateMedia({ media: 'print' });
  await page.pdf({
    path: out,
    format: 'A4',
    printBackground: false,
    preferCSSPageSize: true,
  });
  await page.close();
  return out;
}

/**
 * Set /Info metadata.
 *
 * Chromium leaves its own producer strings behind and takes the title from the
 * HTML <title>, which would publish the page's SEO title rather than the
 * résumé title. Both are overwritten so no tool name is ever written into a
 * file the owner hands to a recruiter.
 */
async function applyMetadata(file, subject) {
  const bytes = await readFile(file);
  const pdf = await PDFDocument.load(bytes);
  pdf.setTitle(PDF_TITLE);
  pdf.setAuthor(PDF_AUTHOR);
  pdf.setSubject(subject);
  pdf.setKeywords(['Hao Lei', 'Resume', 'AI systems', 'Agents', 'Life science']);
  pdf.setCreator(PDF_AUTHOR);
  pdf.setProducer(PDF_AUTHOR);
  pdf.setLanguage('zh-CN');
  await writeFile(file, await pdf.save());
}

async function main() {
  if (!existsSync(path.join(DIST, 'zh', 'resume', 'index.html'))) {
    throw new Error('dist/zh/resume/index.html is missing — run `npm run build` first.');
  }

  await mkdir(OUT_DIR, { recursive: true });
  const { server, port } = await serveDist();
  const base = `http://127.0.0.1:${port}`;
  const browser = await chromium.launch();

  try {
    for (const variant of VARIANTS) {
      const out = await renderVariant(browser, base, variant);
      await applyMetadata(out, variant.subject);
      console.log(path.relative(ROOT, out).replace(/\\/g, '/'));
    }
  } finally {
    await browser.close();
    server.close();
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
