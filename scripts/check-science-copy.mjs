/**
 * Science copy gate.
 *
 * Two failure modes this exists to catch:
 *
 *   1. An overclaim. Phrases like "clinically proven" or "production digital
 *      twin" would turn a careful engineering portfolio into a medical claim
 *      it cannot support. The scan is deliberately narrow — the status matrix
 *      legitimately says clinical validation is *planned*, and the safety
 *      copy legitimately says medical advice is *blocked*; neither is a claim.
 *
 *   2. A concept dressed as an implementation. A project marked as research
 *      or design may not be described with implementation vocabulary, and
 *      TaiYi Lingjing in particular must still read as not started.
 *
 * Also: any page that renders a formula inside a drawing must label it as
 * conceptual notation, so a reader never mistakes notation for a measurement.
 *
 * Usage: node scripts/check-science-copy.mjs
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src');
const dist = join(root, 'dist');

const problems = [];
const notes = [];
let checks = 0;

function fail(message) {
  problems.push(message);
}

function walk(dir, extensions) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full, extensions));
    else if (extensions.some((ext) => entry.endsWith(ext))) out.push(full);
  }
  return out;
}

function lineOf(text, index) {
  return text.slice(0, index).split('\n').length;
}

/* -------------------------------------------------------------------------- */
/* 1. Overclaims                                                              */
/* -------------------------------------------------------------------------- */

const OVERCLAIMS = [
  [/clinically\s+proven/i, 'clinical proof claim'],
  [/clinically\s+validated/i, 'clinical validation claim'],
  [/validated\s+intervention/i, 'validated-intervention claim'],
  [/production\s+digital\s+twin/i, 'production digital twin claim'],
  [/production\s+QSP\b/i, 'production QSP claim'],
  [/FDA[-\s]?approved/i, 'regulatory approval claim'],
  [/peer[-\s]reviewed\s+validation/i, 'peer-reviewed validation claim'],
  [/provides?\s+medical\s+advice/i, 'medical-advice claim'],
  [/provides?\s+a\s+diagnos(is|tic)/i, 'diagnosis claim'],
  [/diagnostic\s+accuracy\s+of\s+\d/i, 'diagnostic accuracy claim'],
  [/guaranteed\s+(result|outcome|accuracy)/i, 'guaranteed outcome claim'],
  [/已临床验证|临床已验证|临床证明|临床有效|临床准确/, 'clinical proof claim (zh)'],
  [/已验证的?干预/, 'validated-intervention claim (zh)'],
  [/生产级?数字孪生|数字孪生已上线/, 'production digital twin claim (zh)'],
  [/药监局?批准|获批上市/, 'regulatory approval claim (zh)'],
  [/诊断准确率\s*\d/, 'diagnostic accuracy claim (zh)'],
  [/保证疗效|保证准确/, 'guaranteed outcome claim (zh)'],
];

const scanned = [
  ...walk(src, ['.astro', '.ts', '.md', '.mdx', '.css']),
  ...walk(dist, ['.html']),
];

/*
 * A disclaimer and a claim often differ by one word: "blocks medical advice"
 * and "no evidence supporting clinical accuracy" are the honest sentences this
 * site actually wants. Look back a short window and skip negated occurrences.
 */
const NEGATION =
  /(?:not|no|never|does\s?n[o']?t|do\s?n[o']?t|blocks?|blocked|without|lacks?|out\s+of\s+scope|disclaim)/i;
const NEGATION_ZH = /不|未|无|非|没有|否认|免责|排除|拦截|支撑/;

function negated(text, index) {
  const window = text.slice(Math.max(0, index - 90), index);
  return NEGATION.test(window) || NEGATION_ZH.test(window);
}

for (const file of scanned) {
  const text = readFileSync(file, 'utf8');
  for (const [pattern, what] of OVERCLAIMS) {
    checks += 1;
    const hit = pattern.exec(text);
    if (!hit) continue;
    if (negated(text, hit.index)) continue;
    fail(`${relative(root, file)}:${lineOf(text, hit.index)} — ${what}: "${hit[0]}"`);
  }
}
notes.push(`${scanned.length} files scanned for overclaims`);

/* -------------------------------------------------------------------------- */
/* 2. Concept projects must not borrow implementation vocabulary              */
/* -------------------------------------------------------------------------- */

const IMPLEMENTATION_CLAIMS = [
  [/partial\s+implementation/i, 'partial implementation'],
  [/prototype\s+implementation/i, 'prototype implementation'],
  [/implemented\s+subsystem/i, 'implemented subsystem'],
  [/working\s+prototype/i, 'working prototype'],
  [/validated\s+architecture/i, 'validated architecture'],
  [/the\s+current\s+system\s+(is|runs|provides|delivers)/i, 'current system'],
  [/rolled\s+out\s+to\s+production/i, 'production rollout'],
  [/部分实现|原型实现|已实现的子系统|可运行原型|已验证架构|当前系统已|已上线运行/, 'implementation claim (zh)'],
];

const conceptFiles = walk(join(src, 'content', 'projects'), ['.md']).filter((file) => {
  const text = readFileSync(file, 'utf8');
  return /^status:\s*'Research'/m.test(text);
});

checks += 1;
if (conceptFiles.length === 0) fail('no Research-status project files found — check the content glob');

for (const file of conceptFiles) {
  const text = readFileSync(file, 'utf8');
  for (const [pattern, what] of IMPLEMENTATION_CLAIMS) {
    checks += 1;
    const hit = pattern.exec(text);
    if (!hit) continue;
    fail(`${relative(root, file)}:${lineOf(text, hit.index)} — concept project uses "${what}"`);
  }
}
notes.push(`${conceptFiles.length} research-status project file(s) checked for implementation vocabulary`);

/* -------------------------------------------------------------------------- */
/* 3. TaiYi Lingjing stays a concept that has not started                     */
/* -------------------------------------------------------------------------- */

const taiyi = [
  join(src, 'content', 'projects', 'en', 'taiyi-lingjing.md'),
  join(src, 'content', 'projects', 'zh', 'taiyi-lingjing.md'),
];

for (const file of taiyi) {
  checks += 1;
  if (!existsSync(file)) {
    fail(`missing ${relative(root, file)}`);
    continue;
  }
  const text = readFileSync(file, 'utf8');

  checks += 1;
  if (!/^status:\s*'Research'/m.test(text)) fail(`${relative(root, file)}: status must stay Research`);

  checks += 1;
  const zh = /(?:[/\\])zh[/\\]/.test(file);
  const started = zh ? /尚未开始/.test(text) : /not\s+started|has not started/i.test(text);
  if (!started) fail(`${relative(root, file)}: must state that implementation has not started`);
}

/* -------------------------------------------------------------------------- */
/* 4. Formulas in drawings are labelled as conceptual notation                */
/* -------------------------------------------------------------------------- */

const FORMULA_MARKERS = [/ΔAGE/i, /Fθ/, /ẑ/, /Δx\s*=/, /dx\/dt/];
/**
 * Case-insensitive on purpose: every label on the site is uppercased by CSS
 * (`text-transform: uppercase`), so the source text is "Conceptual diagram".
 * Requiring an uppercase literal here was checking the stylesheet's job, and
 * it made pages fail for a label they were in fact rendering.
 */
const CONCEPT_LABEL = /conceptual|概念模型|概念标注|概念图/i;

/**
 * Remove the decorative background layer before looking for formulas.
 *
 * The editorial background (v2.2) carries a handful of notations — dx/dt among
 * them — behind every page, at 0.045 opacity, `aria-hidden`, with no claim
 * attached to them. This rule is about formulas a page *presents*, so scanning
 * the background would fail every route on the site for decoration it never
 * asked anyone to read. Removing the block keeps the rule as strict as it was
 * for real content.
 *
 * v2.2 changed the selector, not the argument: the v1.7 canvas it used to strip
 * is no longer mounted anywhere, and the layer that replaced it carries
 * `data-editorial-background`.
 */
function stripCanvas(html) {
  const marker = 'data-editorial-background';
  const markerAt = html.indexOf(marker);
  if (markerAt === -1) return html;

  // Walk back to the `<` that opens the element carrying the marker.
  const start = html.lastIndexOf('<', markerAt);
  if (start === -1) return html;

  let depth = 0;
  let i = start;
  while (i < html.length) {
    const open = html.indexOf('<div', i);
    const close = html.indexOf('</div>', i);
    if (close === -1) break;
    if (open !== -1 && open < close) {
      depth += 1;
      i = open + 4;
    } else {
      depth -= 1;
      i = close + 6;
      if (depth === 0) return html.slice(0, start) + html.slice(i);
    }
  }
  return html;
}

for (const file of walk(dist, ['.html'])) {
  const text = stripCanvas(readFileSync(file, 'utf8'));
  const hasFormula = FORMULA_MARKERS.some((pattern) => pattern.test(text));
  if (!hasFormula) continue;
  checks += 1;
  if (!CONCEPT_LABEL.test(text)) {
    fail(`${relative(root, file)} renders formula notation with no conceptual label`);
  }
}
notes.push(`conceptual-notation label checked across ${walk(dist, ['.html']).length} built page(s)`);

/* -------------------------------------------------------------------------- */

if (problems.length) {
  console.error('Science copy gate FAILED:\n');
  for (const problem of problems) console.error(`  ✗ ${problem}`);
  console.error(`\n${checks} checks run, ${problems.length} failed.`);
  process.exit(1);
}

console.log(`Science copy gate passed (${checks} checks).`);
for (const note of notes) console.log(`  • ${note}`);
