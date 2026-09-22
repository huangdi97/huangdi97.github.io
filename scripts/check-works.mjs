#!/usr/bin/env node
/**
 * Works gate (v2.3, §102).
 *
 * §102 asks for a small gate that protects the core contracts of the new
 * surface and nothing else — "not 500 rules". This is that gate. It answers one
 * question: **can anything reach a page that claims a work exists when it does
 * not, or that pulls bytes the round exists to prevent?**
 *
 * The rules, and the brief section each one comes from:
 *
 *   1. a work entry parses and carries a slug, a supported `type`, a supported
 *      `status`, a supported `aspectRatio`, a poster path and a description
 *      (§15–§17, §61);
 *   2. every outbound URL is `https` (§84);
 *   3. a published work's poster ships the whole shared ladder, so the `srcset`
 *      and the plain `src` cannot point at a file that is not there (§21);
 *   4. **no draft reaches `dist/`** — not as a page, not as a slug, not as a
 *      title (§69). This is the rule that lets the schema and the routes exist
 *      while §30/§31 forbid publishing anything the owner has not handed over;
 *   5. no raw video file is published anywhere (§88), and `dist/images/works/`
 *      contains nothing that a published work does not reference — which is also
 *      the backstop for a QA run that was interrupted before its cleanup;
 *   6. no page on the site loads a video: no `<video>`, no `<iframe>`, no
 *      `autoplay`, no `preload` (§18–§19, §25);
 *   7. the Works entry is in the primary navigation **only** once
 *      `WORKS_NAV_MIN` works are published (§81–§82);
 *   8. the Works pages carry no placeholder copy — no "coming soon", no TODO,
 *      no lorem (§32, §71);
 *   9. a locale's Works index is offered to search engines **exactly** when
 *      that locale has a published work: at zero it is absent from the sitemap
 *      and carries `noindex,follow`, at one or more both come back (v2.3.1
 *      §1–§2, §7–§8). Both signals are asserted against each other, because
 *      `astro.config.mjs` decides the sitemap from the content directory while
 *      the page decides the directive from the collection;
 *  10. the sitemap lists real entries only — no draft is reachable through it
 *      (v2.3.1 §7, §69).
 *
 * What this gate deliberately does **not** do: judge whether a work is any
 * good, check the poster's own pixels, or validate the video URL resolves. The
 * first is not a gate's business; the second and third are the screenshot
 * harness's job, which loads the real files in a real browser.
 *
 * Usage: node scripts/check-works.mjs   (after `npm run build`)
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(root, 'src', 'content', 'works');
const posterDir = join(root, 'public', 'images', 'works');
const dist = join(root, 'dist');

const problems = [];
const notes = [];
let checks = 0;

function fail(message) {
  problems.push(message);
}

function ok(condition, message) {
  checks += 1;
  if (!condition) fail(message);
  return condition;
}

/* -------------------------------------------------------------------------- */
/* The contract, restated here                                                 */
/*                                                                             */
/* Kept in step with `src/content.config.ts` by hand rather than by importing  */
/* it: the gate has to be able to run when the config does not load, which is  */
/* precisely the failure it is there to catch. A value that exists in one and  */
/* not the other is a bug this gate cannot see, so the lists are short and     */
/* fixed on purpose (§16).                                                     */
/* -------------------------------------------------------------------------- */

const TYPES = ['film', 'visual', 'cultural-ai', 'digital-heritage', 'interactive', 'generative'];
const STATUSES = ['published', 'experiment', 'archive'];
const RATIOS = ['9/16', '16/9', '1/1', '4/3', '3/2'];
const LADDER = [640, 960, 1440];
const POSTER_BASE = '/images/works/';
const WORKS_NAV_MIN = 3;

/**
 * Copy that promises work instead of showing it (§32, §71).
 *
 * v2.3.1 §1 adds the "there is nothing here yet" family to the list: a dormant
 * index is allowed to be quiet, and saying "no works yet" out loud is a
 * different thing from saying nothing. Both are forbidden for the same reason —
 * the page must not be *about* its own emptiness.
 */
const PLACEHOLDER =
  /coming soon|敬请期待|即将推出|coming shortly|暂无作品|还没有作品|作品即将|no works yet|nothing here yet|not published yet|stay tuned|TODO|lorem ipsum/i;
const RAW_VIDEO = /\.(mp4|mov|webm|mkv|m4v|avi)$/i;

/* -------------------------------------------------------------------------- */
/* Frontmatter                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Read the frontmatter block as flat key/value data.
 *
 * A real YAML parser would be better and is not available: this repository has
 * no YAML dependency, and the schema is deliberately flat — one string, number,
 * boolean or inline array per key. The values the fixture harness writes are
 * JSON-encoded, which is valid YAML, so the same reader handles both.
 */
function readFrontmatter(file) {
  const text = readFileSync(file, 'utf8');
  const block = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!block) return null;

  const data = {};
  for (const line of block[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z][A-Za-z0-9_]*):\s*(.*)$/.exec(line);
    if (!kv) continue;

    const raw = kv[2].trim();
    let value = raw;
    if (raw.startsWith('"') || raw.startsWith('[')) {
      try {
        value = JSON.parse(raw);
      } catch {
        /* Leave it as the literal text; the type checks below will catch it. */
      }
    } else if (raw === 'true') value = true;
    else if (raw === 'false') value = false;
    else if (/^-?\d+$/.test(raw)) value = Number(raw);

    data[kv[1]] = value;
  }
  return data;
}

/** Every work entry in the repository, with the locale it came from. */
function readEntries() {
  const entries = [];
  if (!existsSync(contentDir)) return entries;

  for (const locale of readdirSync(contentDir)) {
    const dir = join(contentDir, locale);
    if (!statSync(dir).isDirectory()) continue;

    for (const file of readdirSync(dir)) {
      if (!/\.mdx?$/.test(file)) continue;
      const data = readFrontmatter(join(dir, file));
      if (data) entries.push({ locale, file: join(dir, file), data });
    }
  }
  return entries;
}

const entries = readEntries();
const published = entries.filter((e) => e.data.draft !== true);
const drafts = entries.filter((e) => e.data.draft === true);

/**
 * The two index routes, each with the locale whose content decides it.
 *
 * v2.3.1 §1 states the dormant rule per language, so the gate has to count per
 * language too. A single combined count would call a mixed state "not dormant"
 * and then pass a build where one language's index is in the sitemap while that
 * same page tells crawlers not to index it.
 */
const WORK_INDEX_ROUTES = [
  { route: '/works/', page: 'works/index.html', locale: 'en' },
  { route: '/zh/works/', page: 'zh/works/index.html', locale: 'zh' },
];

const publishedByLocale = new Map(
  WORK_INDEX_ROUTES.map(({ locale }) => [
    locale,
    published.filter((e) => e.locale === locale).length,
  ]),
);

notes.push(`entries: ${entries.length} (${published.length} publishable, ${drafts.length} draft)`);
notes.push(
  `publishable by locale: ${WORK_INDEX_ROUTES.map(
    ({ locale }) => `${locale} ${publishedByLocale.get(locale)}`,
  ).join(', ')}`,
);

/* -------------------------------------------------------------------------- */
/* 1–2. The entry contract                                                     */
/* -------------------------------------------------------------------------- */

for (const { file, data } of entries) {
  const where = relative(root, file).replace(/\\/g, '/');

  ok(typeof data.slug === 'string' && data.slug.length > 0, `${where}: no slug`);
  ok(TYPES.includes(data.type), `${where}: unsupported type "${data.type}"`);
  ok(STATUSES.includes(data.status), `${where}: unsupported status "${data.status}"`);
  ok(RATIOS.includes(data.aspectRatio), `${where}: unsupported aspectRatio "${data.aspectRatio}"`);
  ok(
    typeof data.poster === 'string' && data.poster.startsWith(POSTER_BASE),
    `${where}: poster must live under ${POSTER_BASE} — got "${data.poster}"`,
  );
  ok(
    typeof data.description === 'string' && data.description.trim().length > 0,
    `${where}: no description`,
  );

  /* §84: an outbound link is the only way a work leaves the site, and it is
     always https. `http:` would be a downgrade on a page served over https. */
  for (const key of ['videoUrl', 'externalUrl']) {
    if (data[key] === undefined) continue;
    ok(
      typeof data[key] === 'string' && data[key].startsWith('https://'),
      `${where}: ${key} must be an https URL — got "${data[key]}"`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* 3. The poster ladder, for publishable entries only                          */
/* -------------------------------------------------------------------------- */

/* A draft's poster is generated by the QA harness and deleted again, so the
   files are legitimately absent outside a preview run. A *publishable* entry
   with a missing rung is the real defect: `WorkPoster` writes the 1440 rung as
   the plain `src`, so a gap there is a broken image for any browser that
   ignores `srcset`. */
for (const { data, file } of published) {
  const where = relative(root, file).replace(/\\/g, '/');
  const base = String(data.poster).replace(POSTER_BASE, '');

  for (const width of LADDER) {
    ok(
      existsSync(join(posterDir, `${base}-${width}.webp`)),
      `${where}: poster rung missing — public/images/works/${base}-${width}.webp`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* 4–5. The built output                                                       */
/* -------------------------------------------------------------------------- */

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

if (!existsSync(dist)) {
  fail('dist/ does not exist — run `npm run build` first');
} else {
  const distFiles = walk(dist);
  const htmlFiles = distFiles.filter((f) => f.endsWith('.html'));
  const distPages = htmlFiles.map((f) => relative(dist, f).replace(/\\/g, '/'));

  /* §88: no video file is published. This is the rule that keeps the repository
     and the deployed artifact from becoming a media host (§23). */
  const videoFiles = distFiles.filter((f) => RAW_VIDEO.test(f));
  ok(
    videoFiles.length === 0,
    `${videoFiles.length} video file(s) published — §88 forbids hosting video in the repository (${videoFiles
      .map((f) => relative(dist, f))
      .slice(0, 3)
      .join(', ')})`,
  );

  /* §69: a draft must not appear in the built output at all — not as a route,
     not as a slug in a link, not as a title in the markup. Checking the pages
     *and* the raw bytes is deliberate: a slug can survive in a `srcset`, a
     canonical URL or a structured-data block without ever becoming a route. */
  const draftSlugs = [...new Set(drafts.map((d) => d.data.slug))].filter(Boolean);
  const draftTitles = [...new Set(drafts.map((d) => d.data.title))].filter(Boolean);

  for (const slug of draftSlugs) {
    const leaked = distPages.filter((page) => page.includes(String(slug)));
    ok(
      leaked.length === 0,
      `draft "${slug}" reached dist/ as a route: ${leaked.slice(0, 3).join(', ')}`,
    );
  }

  let draftMentions = 0;
  for (const file of htmlFiles) {
    const html = readFileSync(file, 'utf8');
    for (const slug of draftSlugs) if (slug && html.includes(String(slug))) draftMentions += 1;
    for (const title of draftTitles) if (title && html.includes(String(title))) draftMentions += 1;
  }
  ok(
    draftMentions === 0,
    `draft slug or title appears in ${draftMentions} built page(s) — §69 requires drafts out of the build`,
  );

  /* §88's other half, and the backstop for an interrupted QA run: the published
     poster directory holds exactly the files the publishable entries reference. */
  const expectedPosters = new Set(
    published.flatMap(({ data }) => {
      const base = String(data.poster).replace(POSTER_BASE, '');
      return LADDER.map((w) => `${base}-${w}.webp`);
    }),
  );
  const actualPosters = existsSync(posterDir)
    ? readdirSync(posterDir).filter((f) => f.endsWith('.webp'))
    : [];
  const stray = actualPosters.filter((f) => !expectedPosters.has(f));
  ok(
    stray.length === 0,
    `${stray.length} poster file(s) in public/images/works are referenced by no publishable work (${stray
      .slice(0, 3)
      .join(', ')}) — a leftover QA fixture is the usual cause`,
  );

  /* §18–§19, §25: no page loads a video. The index is checked hardest because
     §19 names it, but the rule is site-wide — a `<video>` on a detail page
     would be the same violation one click later. */
  for (const file of htmlFiles) {
    const page = relative(dist, file).replace(/\\/g, '/');
    const html = readFileSync(file, 'utf8');

    ok(!/<video[\s>]/i.test(html), `${page}: contains a <video> element (§19)`);
    ok(!/<iframe[\s>]/i.test(html), `${page}: contains an <iframe> (§25)`);
    ok(!/autoplay/i.test(html), `${page}: contains an autoplay attribute (§19)`);
    ok(
      !/<link[^>]+rel=["']preload["'][^>]+as=["']video["']/i.test(html),
      `${page}: preloads a video (§19)`,
    );
  }

  /* §81–§82: the navigation entry tracks the number of publishable works, so a
     build that has none cannot advertise the section, and a build that has
     enough cannot forget to. The homepage is the right page to check: it has no
     other reason to link to /works.

     Counted **per locale**, because the header is: `Header.astro` asks
     `publishedWorkCount(lang)`. A combined count would demand a link on the
     Chinese homepage once three English works exist, while the header correctly
     withholds it — the gate failing a correct build, which is the failure mode
     a gate is least able to tell apart from a real one. */
  for (const { page, locale } of [
    { page: 'index.html', locale: 'en' },
    { page: 'zh/index.html', locale: 'zh' },
  ]) {
    const file = join(dist, page);
    if (!existsSync(file)) continue;
    const html = readFileSync(file, 'utf8');
    const linked = /href=["']\/(zh\/)?works\/["']/.test(html);
    const count = publishedByLocale.get(locale) ?? 0;

    if (count >= WORKS_NAV_MIN) {
      ok(
        linked,
        `${page}: ${count} ${locale} works are published but the header does not link to them (§82)`,
      );
    } else {
      ok(
        !linked,
        `${page}: the header links to /works with only ${count} ${locale} publishable work(s) — §81 keeps it out below ${WORKS_NAV_MIN}`,
      );
    }
  }

  /* v2.3.1 §1/§2/§7/§8, per locale: a locale's index route is offered to search
     engines exactly when that locale has a published work, and the page says
     the same thing in its own markup. Both directions are asserted for both
     signals, because the sitemap is decided in `astro.config.mjs` from the
     content directory while the page is decided in the page from the
     collection — two reads of one rule, and therefore two things that can
     drift. Asserting them against each other is what turns "in the sitemap and
     noindex at once" into a gate failure instead of a shipped page.

     A detail route is never part of this: it exists only when its work does. */
  const sitemapFile = join(dist, 'sitemap-0.xml');

  if (!existsSync(sitemapFile)) {
    fail('dist/sitemap-0.xml was not built (§75)');
  } else {
    const indexed = [...readFileSync(sitemapFile, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (m) => m[1],
    );

    for (const { route, locale } of WORK_INDEX_ROUTES) {
      const count = publishedByLocale.get(locale) ?? 0;
      const present = indexed.some(
        (url) => new URL(url).pathname.replace(/\/+$/, '') === route.replace(/\/+$/, ''),
      );

      ok(
        present === (count > 0),
        present
          ? `sitemap: ${route} is offered to search engines with 0 published ${locale} work(s) (v2.3.1 §1)`
          : `sitemap: ${route} is missing while ${count} ${locale} work(s) are published (v2.3.1 §7)`,
      );
    }

    /* §7's other half: the sitemap lists real entries only, so a draft can
       never be reachable through it even if a route leaked past §69. */
    for (const slug of draftSlugs) {
      ok(
        !indexed.some((url) => url.includes(String(slug))),
        `sitemap offers a draft route: ${slug} (v2.3.1 §7, §69)`,
      );
    }

    notes.push(`sitemap carries ${indexed.length} URLs with ${published.length} published work(s)`);
  }

  /* v2.3.1 §8: the page states the same thing itself. `noindex,follow` at zero
     — *followed* rather than `nofollow` because the page still renders the site
     navigation and there is no reason to cut a crawler off at it. At one work
     the directive has to be gone, or the section never enters the index at all,
     and a forgotten `noindex` is silent: nothing about the page looks wrong.
     That silence is why this is asserted rather than reviewed.

     §32/§71 rides along: nothing on a Works page promises work that does not
     exist. */
  for (const { page, locale } of WORK_INDEX_ROUTES) {
    const file = join(dist, page);
    if (!existsSync(file)) {
      fail(`${page} was not built — §5 requires the Works index in both locales`);
      continue;
    }

    const html = readFileSync(file, 'utf8');
    const count = publishedByLocale.get(locale) ?? 0;

    const found = /<meta\s+name=["']robots["']\s+content=["']([^"']*)["']/i.exec(html);
    const directive = found ? found[1].replace(/\s+/g, '') : null;
    const withheld = (directive ?? '').includes('noindex');

    ok(
      count === 0 ? directive === 'noindex,follow' : !withheld,
      count === 0
        ? `${page}: a dormant index (0 ${locale} works) must carry <meta name="robots" content="noindex,follow"> — found ${
            directive === null ? 'no robots meta' : `"${directive}"`
          } (v2.3.1 §8)`
        : `${page}: ${count} ${locale} work(s) are published but the page is still withheld from the index (v2.3.1 §2)`,
    );

    ok(!PLACEHOLDER.test(html), `${page}: contains placeholder copy (§32)`);
  }
}

/* -------------------------------------------------------------------------- */

if (problems.length) {
  console.error(`\nWorks gate FAILED (${problems.length} problem(s), ${checks} checks)\n`);
  for (const problem of problems) console.error(`  ✗ ${problem}`);
  console.error('');
  process.exit(1);
}

console.log(`\nWorks gate passed (${checks} checks).`);
for (const note of notes) console.log(`  • ${note}`);
if (drafts.length) {
  console.log(`  • ${drafts.length} draft(s) verified absent from dist/ (§69)`);
}
console.log('');
