/**
 * Public identity gate.
 *
 * Fails the build when the site would publish a wrong identity, a private
 * contact detail, or the retired project name. Everything here is a hard
 * requirement from the v1.2 identity closure: owner-confirmed résumé facts must
 * be present, private contact details must be absent from *source* as well as
 * output, and the flagship project must be branded `ZhiShen · WenNian`.
 *
 * Usage: node scripts/check-public-identity.mjs
 * Wired into CI between `build`/`verify` and `test` — a failure blocks deploy.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

/*
 * Assembled at runtime so the literals below do not exist in this file —
 * otherwise this script would fail its own scan.
 */
const PRIVATE_PHONE = ['1853', '5864', '540'].join('');
const PRIVATE_EMAIL = ['haolei970211', '@163.com'].join('');

const PRIMARY_EMAIL = ['h30441854', '@gmail.com'].join('');
const SECONDARY_EMAIL = ['304418554', '@qq.com'].join('');

const ALLOWED_MAILTO = [`mailto:${PRIMARY_EMAIL}`, `mailto:${SECONDARY_EMAIL}`];

const problems = [];
const notes = [];
let checks = 0;

function fail(message) {
  problems.push(message);
}

function check(condition, message) {
  checks += 1;
  if (!condition) fail(message);
}

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const rel = (file) => relative(root, file).split('\\').join('/');

if (!existsSync(dist)) {
  console.error('dist/ not found — run `npm run build` first.');
  process.exit(1);
}

const files = walk(dist);
const htmlFiles = files.filter((f) => f.endsWith('.html'));
/** Keyed by the route as it appears in the URL, e.g. `zh/resume/index.html`. */
const html = new Map(
  htmlFiles.map((f) => [relative(dist, f).split('\\').join('/'), readFileSync(f, 'utf8')]),
);
const page = (route) => html.get(route.replace(/^\//, '')) ?? '';

/* ─────────────────────────────────────────── 1. private data is gone */

// Source copy, not just output: a private detail must never be typed into the
// repository in the first place.
const srcFiles = walk(join(root, 'src')).filter((f) => /\.(astro|ts|md|mdx|css|js)$/.test(f));
for (const file of srcFiles) {
  const text = readFileSync(file, 'utf8');
  check(!text.includes(PRIVATE_PHONE), `private phone number in source: ${rel(file)}`);
  check(!text.includes(PRIVATE_EMAIL), `private email address in source: ${rel(file)}`);
}
notes.push(`${srcFiles.length} source files scanned for private contact data`);

for (const [route, text] of html) {
  check(!text.includes(PRIVATE_PHONE), `private phone number rendered on /${route}`);
  check(!text.includes(PRIVATE_EMAIL), `private email address rendered on /${route}`);
}
notes.push(`${html.size} built pages scanned for private contact data`);

/* ─────────────────────────────────────── 2. contact identity is complete */

for (const [route, text] of html) {
  // Every page carries the shared contact block, so both addresses are public
  // on every surface — no page may fall back to a single address.
  check(text.includes(PRIMARY_EMAIL), `primary email missing on /${route}`);
  check(text.includes(SECONDARY_EMAIL), `secondary email missing on /${route}`);
  check(text.includes('https://github.com/huangdi97'), `GitHub identity missing on /${route}`);
}

const mailtos = new Set();
for (const [, text] of html) {
  for (const match of text.matchAll(/href="(mailto:[^"]*)"/g)) {
    mailtos.add(match[1]);
  }
}
for (const value of mailtos) {
  check(
    ALLOWED_MAILTO.includes(value),
    `unapproved mailto target: ${value} (allowed: ${ALLOWED_MAILTO.join(', ')})`,
  );
}
notes.push(`${mailtos.size} distinct mailto target(s), all approved`);

/* ─────────────────────────────────────────── 3. owner-confirmed facts */

const FACT_MATRIX = [
  ['resume/index.html', 'Dalian Medical University', 'master institution'],
  ['resume/index.html', 'Taiyuan University of Technology', "bachelor's institution"],
  ['resume/index.html', 'M.S.', "master's degree"],
  ['resume/index.html', 'B.Eng.', "bachelor's degree"],
  ['resume/index.html', 'Zoology', 'master field'],
  ['resume/index.html', 'Biological Engineering', 'bachelor field'],
  ['resume/index.html', 'Beijing ZONCI Technology Development Co., Ltd.', 'ZONCI employment'],
  ['resume/index.html', 'Sinovac Life Sciences Co., Ltd.', 'Sinovac employment'],
  ['resume/index.html', 'Assistant Engineer', 'ZONCI role'],
  ['resume/index.html', 'Formulation Technology Engineer', 'Sinovac role'],
  ['resume/index.html', 'Manuscript submitted', 'manuscript status'],
  ['zh/resume/index.html', '大连医科大学', 'master institution (zh)'],
  ['zh/resume/index.html', '太原理工大学', "bachelor's institution (zh)"],
  ['zh/resume/index.html', '理学硕士', "master's degree (zh)"],
  ['zh/resume/index.html', '工学学士', "bachelor's degree (zh)"],
  ['zh/resume/index.html', '北京众驰伟业科技发展有限公司', 'ZONCI employment (zh)'],
  ['zh/resume/index.html', '北京科兴中维生物技术有限公司', 'Sinovac employment (zh)'],
  ['zh/resume/index.html', '稿件在投', 'manuscript status (zh)'],
];

for (const [route, needle, label] of FACT_MATRIX) {
  check(page(route).includes(needle), `${label} missing from /${route}`);
}

const RESUME_HEADINGS = {
  'resume/index.html': ['Experience', 'Education', 'Research Experience', 'Research Output'],
  'zh/resume/index.html': ['工作经历', '教育经历', '科研经历', '研究成果'],
};
for (const [route, headings] of Object.entries(RESUME_HEADINGS)) {
  const text = page(route);
  for (const heading of headings) {
    check(text.includes(heading), `resume heading "${heading}" missing from /${route}`);
  }
}

// Promotion-free education: no ranking, GPA, CET band or supervisor claims.
for (const banned of ['211 Project', 'Double First-Class', 'CET-6', 'GPA', 'class rank']) {
  check(!page('resume/index.html').includes(banned), `promotional education claim on resume: ${banned}`);
}

// Retired résumé copy: education used to be withheld as "unverified".
for (const route of ['resume/index.html', 'zh/resume/index.html']) {
  check(
    !/unverified|no verified record/i.test(page(route)),
    `resume still claims an unverified record on /${route}`,
  );
}

/* ────────────────────────────────────────────── 4. structured data */

let personBlocks = 0;
for (const [route, text] of html) {
  for (const match of text.matchAll(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
  )) {
    let data;
    try {
      data = JSON.parse(match[1]);
    } catch {
      fail(`invalid JSON-LD on /${route}`);
      continue;
    }
    const nodes = Array.isArray(data) ? data : [data];
    for (const node of nodes) {
      if (node?.['@type'] !== 'Person') continue;
      personBlocks += 1;
      check(node.email === `mailto:${PRIMARY_EMAIL}`, `Person.email is not the primary address on /${route}`);
      for (const key of ['telephone', 'birthDate', 'address']) {
        check(!(key in node), `Person exposes private field "${key}" on /${route}`);
      }
      const sameAs = [node.sameAs].flat().filter(Boolean).join(' ');
      check(sameAs.includes('github.com/huangdi97'), `Person.sameAs omits GitHub on /${route}`);
      const alumni = [node.alumniOf].flat().filter(Boolean).map((a) => a.name).join(' | ');
      check(
        alumni.includes('Dalian Medical University') &&
          alumni.includes('Taiyuan University of Technology'),
        `Person.alumniOf incomplete on /${route} (got: ${alumni || 'none'})`,
      );
    }
  }
}
check(personBlocks > 0, 'no Person JSON-LD found anywhere in dist');
notes.push(`${personBlocks} Person JSON-LD block(s) validated`);

/* ──────────────────────────────────────────── 5. project naming */

const NAMING = [
  ['projects/wennian/index.html', 'ZhiShen · WenNian'],
  ['zh/projects/wennian/index.html', '知身·问年'],
];

for (const [route, brand] of NAMING) {
  const text = page(route);
  check(text.includes(brand), `project /${route} does not carry the brand "${brand}"`);

  const title = text.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '';
  check(title.includes(brand), `<title> on /${route} omits "${brand}" (got: ${title})`);

  const h1 = text.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]?.replace(/<[^>]+>/g, '').trim() ?? '';
  check(h1.includes(brand), `<h1> on /${route} omits "${brand}" (got: ${h1})`);

  const ogTitle = text.match(/property="og:title" content="([^"]*)"/)?.[1] ?? '';
  check(ogTitle.includes(brand), `og:title on /${route} omits "${brand}" (got: ${ogTitle})`);
}

// The bare repository name may live in URLs and in repo citations, but it must
// never be the visible project title.
for (const [route, text] of html) {
  for (const match of text.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)) {
    const value = match[1].replace(/<[^>]+>/g, '').trim();
    check(value !== 'WenNian', `/${route} uses the retired name "WenNian" as its heading`);
  }
}
notes.push(`${html.size} pages checked for the retired project name`);

/* ───────────────────────────────────────────── 6. résumé PDFs */

/**
 * Real text extraction.
 *
 * A byte-level scan is not enough: Chromium stores page text CID-encoded, so a
 * raw search only ever matches link annotations and would happily pass a PDF
 * whose body still carried a private number.
 */
async function readPdf(file) {
  const doc = await getDocument({
    data: new Uint8Array(readFileSync(file)),
    useSystemFonts: false,
  }).promise;

  let text = '';
  for (let i = 1; i <= doc.numPages; i += 1) {
    const page_ = await doc.getPage(i);
    const content = await page_.getTextContent();
    text += content.items.map((item) => item.str).join(' ') + '\n';
  }
  const meta = await doc.getMetadata();
  return { text, pages: doc.numPages, info: meta.info ?? {} };
}

const pdfDir = join(root, 'public', 'resume');
const pdfs = existsSync(pdfDir) ? walk(pdfDir).filter((f) => f.endsWith('.pdf')) : [];

if (pdfs.length === 0) {
  notes.push('PUBLIC_PDF_PENDING_SANITIZATION — no résumé PDF published');
} else {
  for (const file of pdfs) {
    const name = rel(file);
    const { text, pages, info } = await readPdf(file);

    check(pages > 0, `${name}: no pages`);

    for (const [needle, label] of [
      [PRIMARY_EMAIL, 'primary email'],
      [SECONDARY_EMAIL, 'secondary email'],
      ['github.com/huangdi97', 'GitHub'],
      ['haoleilab.com', 'canonical site'],
      ['大连医科大学', "master's institution"],
    ]) {
      check(text.includes(needle), `${name}: ${label} missing`);
    }
    for (const [needle, label] of [
      [PRIVATE_PHONE, 'private phone number'],
      [PRIVATE_EMAIL, 'private email address'],
    ]) {
      check(!text.includes(needle), `${name}: contains ${label}`);
    }

    // No tool name may end up in a file the owner hands to a recruiter.
    const metadata = [info.Title, info.Author, info.Subject, info.Creator, info.Producer, info.Keywords]
      .filter(Boolean)
      .join(' | ');
    for (const token of ['WorkBuddy', 'ChatGPT', 'GPT', 'Claude', 'Copilot', 'AI generated', 'AI-generated']) {
      check(!metadata.includes(token), `${name}: metadata mentions "${token}"`);
    }
    check(info.Title === 'Hao Lei — Resume', `${name}: /Title is "${info.Title}"`);
    check(info.Author === 'Hao Lei', `${name}: /Author is "${info.Author}"`);

    const built = join(dist, 'resume', name.replace(/^.*[\\/]/, ''));
    check(existsSync(built), `${name}: not emitted into dist/resume/`);
  }
  notes.push(`${pdfs.length} résumé PDF(s) verified (text privacy + metadata)`);
}

/* ─────────────────────────────────────────────────────────── report */

if (problems.length) {
  console.error(`\nPublic identity check FAILED (${checks} assertions):`);
  for (const p of problems) console.error(`  x ${p}`);
  process.exit(1);
}

console.log(`\nPublic identity check passed (${checks} assertions).`);
for (const n of notes) console.log(`  - ${n}`);
