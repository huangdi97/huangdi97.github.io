/**
 * v2.1 screenshot set (§48) — the sitewide review frames, and nothing else.
 *
 * Usage: node scripts/qa-v21-shots.mjs [baseUrl]
 *
 * §48 asks for ten frames. Because the site is bilingual and a reviewer needs to
 * see what a visitor sees in either language, each of them is produced once per
 * locale, and the two page-level frames §48 names as "top / full" get both:
 *
 *   home-hero-1440-<lang>       the first screen, Paper, 1440 × 900
 *   home-full-1440-<lang>       the whole homepage
 *   projects-full-1440-<lang>   /projects, whole page
 *   case-wennian-full-1440-<lang>  one project detail page, whole page
 *   research-top-1440-<lang>    /research first screen
 *   research-full-1440-<lang>   /research whole page
 *   about-top-1440-<lang>       /about first screen
 *   about-full-1440-<lang>      /about whole page
 *   resume-full-1440-<lang>     /resume whole page
 *
 *   home-390-<lang>             homepage at 390px
 *   projects-390-<lang>         /projects at 390px
 *   research-390-<lang>         /research at 390px
 *   about-390-<lang>            /about at 390px
 *   resume-390-<lang>           /resume at 390px
 *   research-band-390-<lang>    /research framed on the artwork itself
 *   about-band-390-<lang>       /about framed on the artwork itself
 *
 * It also prints the geometry of the pages the round rebuilt — the entry sizes
 * on /projects, the direction blocks on /research, the sections on /about, and
 * each artwork band's frame box, intrinsic file size and resolved crop — so the
 * review is not done by eye alone.
 *
 * Local review artifacts only; `.qa-screens/` is gitignored.
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const BASE = process.argv[2] ?? 'http://127.0.0.1:4321';
const OUT = '.qa-screens/v21';

const LANGS = [
  { lang: 'zh', prefix: '/zh' },
  { lang: 'en', prefix: '' },
];

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();

/**
 * A page that has been scrolled end to end, so lazy images have decoded.
 *
 * The language bootstrap redirects when `haoleilab-language` disagrees with the
 * path, so the stored value has to match the route being opened — otherwise the
 * capture lands on the other locale's page.
 */
async function open(path, viewport, lang) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.addInitScript(
    ({ theme, language }) => {
      try {
        localStorage.setItem('haoleilab-theme', theme);
        localStorage.setItem('haoleilab-language', language);
      } catch {
        /* storage unavailable */
      }
    },
    { theme: 'paper', language: lang },
  );
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    const step = window.innerHeight / 2;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  // Every lazy image has to have finished decoding before a full-page shot,
  // otherwise the capture races the network and the plates come out empty.
  await page.evaluate(() =>
    Promise.all(
      Array.from(document.images)
        .filter((i) => !i.complete)
        .map((i) => new Promise((r) => i.addEventListener('load', r, { once: true }))),
    ),
  );
  await page.waitForTimeout(400);
  return { context, page };
}

const shots = [];

async function frame(path, viewport, lang, name, { fullPage = false, audit = null } = {}) {
  const { context, page } = await open(path, viewport, lang);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage });
  let result = null;
  if (audit) result = await page.evaluate(audit);
  await context.close();
  shots.push(name);
  return result;
}

const reports = {};

for (const { lang, prefix } of LANGS) {
  /* ── desktop ────────────────────────────────────────────────────────────── */
  await frame(`${prefix}/`, DESKTOP, lang, `home-hero-1440-${lang}`);
  const home = await frame(`${prefix}/`, DESKTOP, lang, `home-full-1440-${lang}`, {
    fullPage: true,
    audit: () => ({
      height: document.documentElement.scrollHeight,
      sections: document.querySelectorAll('main > section').length,
      rows: Array.from(document.querySelectorAll('[data-featured-row]')).map((row) => ({
        slug: row.dataset.slug,
        height: Math.round(row.getBoundingClientRect().height),
        art: row.querySelector('[data-artwork]')?.dataset.artwork ?? '',
        source: row.querySelector('[data-artwork]')?.dataset.artworkSource ?? '',
        position: (row.querySelector('.row-position')?.textContent ?? '').trim(),
        status: (row.querySelector('.row-status')?.textContent ?? '').trim(),
      })),
    }),
  });

  const projects = await frame(`${prefix}/projects/`, DESKTOP, lang, `projects-full-1440-${lang}`, {
    fullPage: true,
    audit: () => ({
      height: document.documentElement.scrollHeight,
      entries: Array.from(document.querySelectorAll('[data-project-entry]')).map((entry) => ({
        slug: entry.dataset.slug,
        height: Math.round(entry.getBoundingClientRect().height),
        art: entry.querySelector('[data-artwork]')?.dataset.artwork ?? '',
        line: (entry.querySelector('.entry-line')?.textContent ?? '').trim().length,
        status: (entry.querySelector('.entry-status')?.textContent ?? '').trim(),
      })),
      other: document.querySelectorAll('.other-list li').length,
      artifacts: document.querySelectorAll('[data-artifact]').length,
      exit: document.querySelectorAll('.work-exit a').length,
    }),
  });

  const caseStudy = await frame(
    `${prefix}/projects/wennian/`,
    DESKTOP,
    lang,
    `case-wennian-full-1440-${lang}`,
    {
      fullPage: true,
      audit: () => ({
        height: document.documentElement.scrollHeight,
        headings: Array.from(document.querySelectorAll('.case-prose h2')).map((h) =>
          (h.textContent ?? '').trim(),
        ),
        visual: Boolean(document.querySelector('.case-visual')),
        reality: Boolean(document.querySelector('#reality')),
      }),
    },
  );

  await frame(`${prefix}/research/`, DESKTOP, lang, `research-top-1440-${lang}`);
  const research = await frame(`${prefix}/research/`, DESKTOP, lang, `research-full-1440-${lang}`, {
    fullPage: true,
    audit: () => {
      /* The band's real geometry, not the stylesheet's intent: the frame box, the
         file's intrinsic size and the `object-position` the browser resolved.
         The mobile frame is a different ratio, so the same declaration produces a
         different crop — which is exactly what §27 asks for and what cannot be
         read off the CSS. */
      const art = document.querySelector('[data-artwork="research"]');
      const img = art?.querySelector('img');
      const box = art?.getBoundingClientRect();
      const cs = img ? getComputedStyle(img) : null;
      return {
        height: document.documentElement.scrollHeight,
        band: art
          ? {
              source: art.dataset.artworkSource,
              box: `${Math.round(box.width)}×${Math.round(box.height)}`,
              natural: img ? `${img.naturalWidth}×${img.naturalHeight}` : 'svg',
              aspectRatio: getComputedStyle(art).aspectRatio,
              objectFit: cs?.objectFit ?? null,
              objectPosition: cs?.objectPosition ?? null,
              loading: img?.loading ?? null,
              alt: img?.alt ?? null,
            }
          : null,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        areas: Array.from(document.querySelectorAll('.research-area')).map((area) => ({
          title: (area.querySelector('.area-title')?.textContent ?? '').trim(),
          summary: (area.querySelector('.area-summary')?.textContent ?? '').trim().length,
          tier:
            area.closest('.research-tier')?.querySelector('.research-tier-label')?.textContent?.trim() ??
            '',
        })),
        mathbio: Boolean(document.querySelector('#mathbio')),
        equation: Boolean(document.querySelector('aside.eq')),
      };
    },
  });

  await frame(`${prefix}/about/`, DESKTOP, lang, `about-top-1440-${lang}`);
  const about = await frame(`${prefix}/about/`, DESKTOP, lang, `about-full-1440-${lang}`, {
    fullPage: true,
    audit: () => {
      const art = document.querySelector('[data-artwork="about"]');
      const img = art?.querySelector('img');
      const box = art?.getBoundingClientRect();
      const cs = img ? getComputedStyle(img) : null;
      return {
        height: document.documentElement.scrollHeight,
        band: art
          ? {
              source: art.dataset.artworkSource,
              box: `${Math.round(box.width)}×${Math.round(box.height)}`,
              natural: img ? `${img.naturalWidth}×${img.naturalHeight}` : 'svg',
              aspectRatio: getComputedStyle(art).aspectRatio,
              objectFit: cs?.objectFit ?? null,
              objectPosition: cs?.objectPosition ?? null,
              loading: img?.loading ?? null,
              alt: img?.alt ?? null,
            }
          : null,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        sections: Array.from(document.querySelectorAll('.about-section h2')).map((h) =>
          (h.textContent ?? '').trim(),
        ),
        focus: document.querySelectorAll('.focus-list li').length,
        path: document.querySelectorAll('.bt-item').length,
      };
    },
  });

  const resume = await frame(`${prefix}/resume/`, DESKTOP, lang, `resume-full-1440-${lang}`, {
    fullPage: true,
    audit: () => ({
      height: document.documentElement.scrollHeight,
      sections: Array.from(document.querySelectorAll('[data-resume-section]')).map(
        (s) => s.dataset.resumeSection,
      ),
      print: Boolean(document.querySelector('[data-print]')),
      downloads: document.querySelectorAll('[data-resume-pdf]').length,
    }),
  });

  /* ── mobile 390 (§50) ───────────────────────────────────────────────────── */
  await frame(`${prefix}/`, MOBILE, lang, `home-390-${lang}`, { fullPage: true });
  await frame(`${prefix}/projects/`, MOBILE, lang, `projects-390-${lang}`, { fullPage: true });
  await frame(`${prefix}/research/`, MOBILE, lang, `research-390-${lang}`, { fullPage: true });
  await frame(`${prefix}/about/`, MOBILE, lang, `about-390-${lang}`, { fullPage: true });
  await frame(`${prefix}/resume/`, MOBILE, lang, `resume-390-${lang}`, { fullPage: true });

  /* The two bands once more at 390, framed on the artwork itself: same page,
     different frame ratio, therefore a different window of the source (§27).
     Judging that crop from the desktop numbers is not possible. */
  const mobileBand = async (name) => {
    const { context, page } = await open(`${prefix}/${name}/`, MOBILE, lang);
    const art = page.locator(`[data-artwork="${name}"]`);
    await art.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${OUT}/${name}-band-390-${lang}.png` });
    /* No TypeScript type assertions inside this callback: Playwright serialises
       the function with `toString()` and runs it in the browser, and a `.mjs`
       script is never transpiled — `(node as HTMLElement)` is a syntax error
       here, not a cast. */
    const result = await art.evaluate((node) => {
      const img = node.querySelector('img');
      const box = node.getBoundingClientRect();
      const cs = img ? getComputedStyle(img) : null;
      return {
        source: node.dataset.artworkSource,
        box: `${Math.round(box.width)}×${Math.round(box.height)}`,
        natural: img ? `${img.naturalWidth}×${img.naturalHeight}` : 'svg',
        objectFit: cs?.objectFit ?? null,
        objectPosition: cs?.objectPosition ?? null,
        aspectRatio: getComputedStyle(node).aspectRatio,
        loading: img?.loading ?? null,
      };
    });
    await context.close();
    shots.push(`${name}-band-390-${lang}`);
    return result;
  };
  const researchBand390 = await mobileBand('research');
  const aboutBand390 = await mobileBand('about');

  reports[lang] = { home, projects, caseStudy, research, about, resume, researchBand390, aboutBand390 };
}

await browser.close();

/* ── the audit ─────────────────────────────────────────────────────────────── */

/** One line per band: the frame box, the file, and the crop the browser resolved. */
const bandLine = (label, band) =>
  band
    ? `  ${label.padEnd(13)} ${band.box.padStart(11)}  file ${band.natural.padEnd(10)}  ratio ${String(
        band.aspectRatio,
      ).padEnd(7)} fit ${String(band.objectFit).padEnd(6)} pos ${String(band.objectPosition).padEnd(11)} [${band.source}] ${band.loading}`
    : `  ${label.padEnd(13)} MISSING`;

for (const [lang, r] of Object.entries(reports)) {
  console.log(`\n  ══ ${lang} ═══════════════════════════════════════════════════════`);

  console.log('\n  ── homepage ───────────────────────────────────────────────');
  console.log(`  height          ${r.home.height}px   sections ${r.home.sections}`);
  for (const row of r.home.rows) {
    console.log(
      `  ${String(row.slug).padEnd(9)} ${String(row.height).padStart(4)}px  ${row.art.padEnd(9)} [${row.source}]  ${row.status}`,
    );
    console.log(`            position: ${row.position}`);
  }

  console.log('\n  ── /projects ──────────────────────────────────────────────');
  console.log(
    `  height          ${r.projects.height}px   entries ${r.projects.entries.length}   other ${r.projects.other}   artifacts ${r.projects.artifacts}`,
  );
  for (const entry of r.projects.entries) {
    console.log(
      `  ${String(entry.slug).padEnd(9)} ${String(entry.height).padStart(4)}px  ${entry.art.padEnd(9)} intro ${String(entry.intro).padStart(3)} chars  ${entry.status}`,
    );
  }

  console.log('\n  ── case study (wennian) ───────────────────────────────────');
  console.log(`  height          ${r.caseStudy.height}px`);
  console.log(`  headings        ${r.caseStudy.headings.join(' · ')}`);
  console.log(
    `  visual ${r.caseStudy.visual ? 'yes' : 'no'}   reality matrix ${r.caseStudy.reality ? 'yes' : 'no'}`,
  );

  console.log('\n  ── /research ──────────────────────────────────────────────');
  console.log(
    `  height          ${r.research.height}px   #mathbio ${r.research.mathbio ? 'PRESENT' : 'absent'}   equation ${r.research.equation ? 'PRESENT' : 'absent'}   overflow ${r.research.overflow}px`,
  );
  console.log(bandLine('band 1440', r.research.band));
  console.log(bandLine('band 390', r.researchBand390));
  for (const area of r.research.areas) {
    console.log(`  ${String(area.tier).padEnd(20)} ${area.title}  (${area.summary} chars)`);
  }

  console.log('\n  ── /about ─────────────────────────────────────────────────');
  console.log(
    `  height          ${r.about.height}px   directions ${r.about.focus}   path nodes ${r.about.path}   overflow ${r.about.overflow}px`,
  );
  console.log(bandLine('band 1440', r.about.band));
  console.log(bandLine('band 390', r.aboutBand390));
  console.log(`  sections        ${r.about.sections.join(' · ')}`);

  console.log('\n  ── /resume ────────────────────────────────────────────────');
  console.log(`  height          ${r.resume.height}px`);
  console.log(`  sections        ${r.resume.sections.join(', ')}`);
  console.log(`  print ${r.resume.print ? 'yes' : 'no'}   pdf downloads ${r.resume.downloads}`);
}

console.log(`\n  ${shots.length} frames → ${OUT}/`);
for (const name of shots) console.log(`  · ${name}.png`);
console.log('');
