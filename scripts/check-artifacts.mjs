/**
 * Artifact gate.
 *
 * The Selected Public Work list only works if every item in it can be opened and
 * checked by a stranger. This gate enforces that, and enforces the two things
 * that would quietly ruin it: a fabricated artifact, and an artifact that leaks
 * something private while claiming to be real.
 *
 * Rules:
 *   1. every artifact carries a `source`, a `sourceUrl` and a read `date`;
 *   2. `verified: true` is only allowed when `source` is non-empty;
 *   3. `type: 'screenshot'` requires an image that actually exists on disk;
 *   4. no placeholder markers — no TODO, no lorem, no example.com;
 *   5. no credential, token, private host or private contact in a body;
 *   6. ids are unique and every `projectSlug` maps to a real project;
 *   7. the built pages render **no** artifact row, no artifact room and no raw
 *      repository tree, terminal transcript or metric dump.
 *
 * Rule 7 has been tightened twice, in the same direction both times. v1.6 moved
 * the room off the homepage; v2.1's final closure cut it from a five-tile mosaic
 * to a three-row list; v2.2.1 (§42–§44) removes it from /projects entirely, so
 * the ceiling is now zero and the reduction is held by a check rather than by
 * the component's source. Rules 1–6 are unchanged and still validate every entry
 * in the table, which remains the whole record.
 *
 * Usage: node scripts/check-artifacts.mjs
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src');
const dist = join(root, 'dist');

const ARTIFACTS_FILE = join(src, 'data', 'artifacts.ts');

const problems = [];
const notes = [];
let checks = 0;

function fail(message) {
  problems.push(message);
}

/* -------------------------------------------------------------------------- */
/* Parse the artifact table without importing TypeScript                      */
/* -------------------------------------------------------------------------- */

const source = readFileSync(ARTIFACTS_FILE, 'utf8');
const arrayStart = source.indexOf('export const ARTIFACTS');
checks += 1;
if (arrayStart === -1) fail('src/data/artifacts.ts does not export ARTIFACTS');

// `Artifact[]` sits between the export name and the literal, so anchor on the
// assignment rather than on the first bracket.
const assign = source.indexOf('= [', arrayStart);
const openBracket = assign === -1 ? source.indexOf('[', arrayStart) : assign + 2;
let depth = 0;
let end = -1;
for (let i = openBracket; i < source.length; i += 1) {
  if (source[i] === '[') depth += 1;
  else if (source[i] === ']') {
    depth -= 1;
    if (depth === 0) {
      end = i;
      break;
    }
  }
}
const arrayBody = source.slice(openBracket + 1, end);

/** Split a JS array body into its top-level object literals. */
function splitEntries(body) {
  const entries = [];
  let depth = 0;
  let start = -1;
  let inString = false;
  let quote = '';
  let inTemplate = false;
  for (let i = 0; i < body.length; i += 1) {
    const ch = body[i];
    const prev = body[i - 1];

    if (inString) {
      if (ch === quote && prev !== '\\') inString = false;
      continue;
    }
    if (inTemplate) {
      if (ch === '`' && prev !== '\\') inTemplate = false;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inString = true;
      quote = ch;
      continue;
    }
    if (ch === '`') {
      inTemplate = true;
      continue;
    }

    if (ch === '{') {
      if (depth === 0) start = i;
      depth += 1;
    } else if (ch === '}') {
      depth -= 1;
      if (depth === 0 && start !== -1) {
        entries.push(body.slice(start, i + 1));
        start = -1;
      }
    }
  }
  return entries;
}

const entries = splitEntries(arrayBody);

checks += 1;
if (entries.length === 0) fail('no artifact entries found in src/data/artifacts.ts');
notes.push(`${entries.length} artifact entr${entries.length === 1 ? 'y' : 'ies'} parsed`);

/* -------------------------------------------------------------------------- */
/* Field-level checks                                                         */
/* -------------------------------------------------------------------------- */

const PLACEHOLDER = /\b(TODO|TBD|FIXME|LOREM|IPSUM|PLACEHOLDER|DUMMY|FAKE|EXAMPLE\.COM)\b/i;
const SENSITIVE = [
  [/bearer\s+[a-z0-9._-]{8,}/i, 'bearer token'],
  [/(api[_-]?key|access[_-]?token|secret|password|passwd)\s*[:=]\s*["'`]?[a-z0-9._-]{6,}/i, 'credential'],
  [/https?:\/\/(?:[a-z0-9-]+\.)?(?:internal|intranet|corp|local)\.[a-z]{2,}/i, 'internal host'],
  [/\b10\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/, 'private IPv4 address'],
  [/\b192\.168\.\d{1,3}\.\d{1,3}\b/, 'private IPv4 address'],
  [/\b172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}\b/, 'private IPv4 address'],
  [/[a-z0-9._%+-]+@(?!example\.com)[a-z0-9.-]+\.[a-z]{2,}/i, 'email address'],
];

const ALLOWED_SOURCE_HOSTS = ['github.com'];

const projectSlugs = new Set(
  readdirSync(join(src, 'content', 'projects', 'en'))
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, '')),
);

function field(entry, name) {
  const m = new RegExp(`${name}\\s*:\\s*`).exec(entry);
  if (!m) return null;
  const rest = entry.slice(m.index + m[0].length);
  if (rest.startsWith('`')) {
    const endTick = rest.indexOf('`', 1);
    return rest.slice(1, endTick);
  }
  if (rest.startsWith('"') || rest.startsWith("'")) {
    const q = rest[0];
    let i = 1;
    let out = '';
    while (i < rest.length) {
      if (rest[i] === '\\') {
        out += rest[i + 1];
        i += 2;
        continue;
      }
      if (rest[i] === q) break;
      out += rest[i];
      i += 1;
    }
    return out;
  }
  return rest.split(/[,\n}]/)[0].trim();
}

function hasLocalized(entry, name) {
  return new RegExp(`${name}\\s*:\\s*\\{[\\s\\S]*?en\\s*:`).test(entry);
}

const seenIds = new Set();

entries.forEach((entry, index) => {
  const label = `artifact #${index + 1}`;

  const id = field(entry, 'id');
  checks += 1;
  if (!id) fail(`${label}: no id`);
  else {
    if (seenIds.has(id)) fail(`${label}: duplicate id "${id}"`);
    seenIds.add(id);
  }

  for (const name of ['projectSlug', 'type', 'sourceUrl', 'date', 'kind', 'size']) {
    checks += 1;
    if (!field(entry, name)) fail(`${id ?? label}: missing ${name}`);
  }

  for (const name of ['project', 'title', 'source', 'caption']) {
    checks += 1;
    if (!hasLocalized(entry, name)) fail(`${id ?? label}: ${name} needs both en and zh`);
  }

  const verified = field(entry, 'verified');
  const sourceText = field(entry, 'source');
  checks += 1;
  if (verified === 'true' && !sourceText && !hasLocalized(entry, 'source')) {
    fail(`${id ?? label}: verified=true requires a non-empty source`);
  }

  const sourceUrl = field(entry, 'sourceUrl');
  if (sourceUrl) {
    checks += 1;
    let host = '';
    try {
      host = new URL(sourceUrl).hostname;
    } catch {
      fail(`${id ?? label}: sourceUrl is not a valid URL (${sourceUrl})`);
    }
    if (host && !ALLOWED_SOURCE_HOSTS.includes(host)) {
      fail(`${id ?? label}: sourceUrl host "${host}" is not an allowed public source host`);
    }
    checks += 1;
    if (!sourceUrl.startsWith('https://')) fail(`${id ?? label}: sourceUrl must be https`);
  }

  const date = field(entry, 'date');
  checks += 1;
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) fail(`${id ?? label}: date must be ISO 8601 (${date})`);

  const type = field(entry, 'type');
  if (type === 'screenshot') {
    const image = field(entry, 'image');
    checks += 1;
    if (!image) fail(`${id ?? label}: type=screenshot requires an image`);
    else if (!existsSync(join(root, image.replace(/^\//, '')))) {
      fail(`${id ?? label}: image ${image} does not exist`);
    }
  }

  const slug = field(entry, 'projectSlug');
  checks += 1;
  if (slug && !projectSlugs.has(slug)) fail(`${id ?? label}: projectSlug "${slug}" has no project page`);

  for (const [pattern, what] of SENSITIVE) {
    checks += 1;
    const hit = pattern.exec(entry);
    if (hit) fail(`${id ?? label}: possible ${what} in artifact content ("${hit[0].slice(0, 40)}")`);
  }

  checks += 1;
  const placeholder = PLACEHOLDER.exec(entry);
  if (placeholder) fail(`${id ?? label}: placeholder marker "${placeholder[0]}"`);
});

/* -------------------------------------------------------------------------- */
/* Built output                                                               */
/* -------------------------------------------------------------------------- */

// v1.6: the artifact room is no longer a homepage section. The homepage answers
// "what have you built"; the evidence list answers "show me the evidence", and
// that question belongs to /projects. Both locales carry it there.
//
// v2.1 FINAL CLOSURE: /projects printed a three-row "Selected Public Work" list
// rather than a five-tile mosaic of trees and transcripts.
//
// v2.2.1 (§42–§44): /projects prints none of it. The owner's read was that the
// inverted block was a second website bolted onto a paper page, that it put the
// page's information density back up, and that it duplicated what the four
// entries already say — so §42 removes the block outright and §44 allows at most
// one line of exit in its place.
//
// The table is untouched: rules 1–6 still check every entry in
// `src/data/artifacts.ts`, which remains the record. What this section now
// asserts is the *absence* — zero rows, zero raw bodies, on both locales — so
// the block cannot quietly return one row at a time.
const MAX_RENDERED = 0;

/** Astro escapes text nodes this way; a body that rendered would appear escaped. */
const escapeHtml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const pages = [join(dist, 'projects', 'index.html'), join(dist, 'zh', 'projects', 'index.html')].filter(
  (p) => existsSync(p),
);

checks += 1;
if (pages.length === 0) {
  fail('dist has no built projects pages — run npm run build first');
} else {
  const bodies = entries
    .map((entry) => ({ id: field(entry, 'id'), body: field(entry, 'body') }))
    .filter((e) => e.body && e.body.trim().length > 0);

  for (const page of pages) {
    const html = readFileSync(page, 'utf8');
    const rel = relative(root, page);

    /* Which artifacts the page actually rendered, read off the markup rather
       than assumed from the component's source — an id that is rendered but
       absent from the table would be a fabricated one. */
    const rendered = [...html.matchAll(/data-artifact="([^"]+)"/g)].map((m) => m[1]);

    checks += 1;
    if (rendered.length > MAX_RENDERED) {
      fail(
        `${rel} renders ${rendered.length} artifact(s) — the cap is ${MAX_RENDERED}. ` +
          '§42 removes the block from /projects; the table stays the record.',
      );
    }

    checks += 1;
    if (/id="artifacts"/.test(html)) fail(`${rel} renders the inverted artifact room again`);

    for (const id of rendered) {
      checks += 1;
      if (!seenIds.has(id)) fail(`${rel} renders "${id}", which is not in the artifact table`);
    }

    /* §35, enforced: a repository tree, a terminal transcript and a metric dump
       are all things the repository can be opened for. Printing them here is
       what made the room 44% of the page. */
    for (const { id, body } of bodies) {
      checks += 1;
      if (html.includes(escapeHtml(body))) {
        fail(
          `${rel} renders the raw body of "${id}" — trees, terminal transcripts and metric dumps do not belong on /projects`,
        );
      }
    }

    notes.push(`${rel}: 0 artifact rows, 0 raw bodies (table holds ${entries.length})`);
  }
}

/* And the homepage must not carry it either — that is the whole point of the
   v1.6 reduction, and it is exactly the kind of thing that creeps back. */
for (const home of [join(dist, 'index.html'), join(dist, 'zh', 'index.html')]) {
  if (!existsSync(home)) continue;
  checks += 1;
  if (readFileSync(home, 'utf8').includes('id="artifacts"')) {
    fail(`${relative(root, home)} renders the artifact room again — §42 keeps it off every public page`);
  }
}

/* -------------------------------------------------------------------------- */

if (problems.length) {
  console.error('Artifact gate FAILED:\n');
  for (const problem of problems) console.error(`  ✗ ${problem}`);
  console.error(`\n${checks} checks run, ${problems.length} failed.`);
  process.exit(1);
}

console.log(`Artifact gate passed (${checks} checks).`);
for (const note of notes) console.log(`  • ${note}`);
