// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Canonical public origin.
 *
 * The published custom domain is the serving origin: GitHub Pages answers
 * `huangdi97.github.io` with a 301 to `haoleilab.com`, so canonical URLs,
 * the sitemap and OG images all point at the domain. The repository itself
 * is the user site `huangdi97.github.io`, which serves at the root — `base`
 * stays `/`.
 *
 * If the custom domain is ever removed, set this back to
 * `https://huangdi97.github.io`.
 */
const SITE = 'https://haoleilab.com';

/**
 * Whether the Works index routes belong in the sitemap.
 *
 * **Owner decision, 2026-09-21 (v2.3.1 §1, §7).** §75 asks for the Works routes
 * to be in the sitemap, and they are — as soon as there is something to index.
 * Until then the index route is held back, because a page with no work and no
 * navigation entry (§81 keeps the link out below `WORKS_NAV_MIN`) should not be
 * offered to search engines, and §1 asks for exactly that in the same breath as
 * the `noindex` directive the page itself carries.
 *
 * The rule is **per locale**, because §1 states it per locale and because the
 * page's own `noindex` is per locale. An English work does not make the Chinese
 * index — still a heading over nothing — worth indexing. Holding both back as a
 * pair would put a URL in the sitemap for a page that tells crawlers not to
 * index it, which is two signals contradicting each other.
 *
 * This is deliberately *not* a second implementation of the draft rule. It is a
 * coarse read of the content directory used to answer one question — "is the
 * count zero?" — and `scripts/check-works.mjs` asserts, per locale, that the
 * sitemap agrees with the built page *and* with that page's `robots` directive,
 * so a divergence fails the gate instead of shipping. The exact rule stays in
 * `src/lib/works.ts`, which is what the pages read.
 *
 * Paths are resolved against the working directory, which for every supported
 * invocation (`npm run build`, `npx astro build` from the project root) is the
 * project root.
 */
const WORK_CONTENT_DIRS = [
  { route: '/works/', dir: 'src/content/works/en' },
  { route: '/zh/works/', dir: 'src/content/works/zh' },
];

/**
 * How many entries in `dir` a build would publish.
 *
 * The parameter is typed rather than left implicit because `@ts-check` is on in
 * this file and `astro check` is a blocking gate: an implicit `any` here fails
 * the build rather than reading as a style nit.
 *
 * @param {string} dir Repository-relative content directory.
 * @returns {number} Entries whose frontmatter is not `draft: true`.
 */
function countPublishedWorks(dir) {
  if (!existsSync(dir)) return 0;
  let count = 0;
  for (const name of readdirSync(dir)) {
    if (!/\.mdx?$/.test(name)) continue;
    const source = readFileSync(join(dir, name), 'utf8');
    const end = source.indexOf('\n---', 3);
    const frontmatter = source.startsWith('---') && end > 0 ? source.slice(3, end) : '';
    if (!/^\s*draft\s*:\s*true\s*$/m.test(frontmatter)) count += 1;
  }
  return count;
}

/** Resolved once at config load, so the sitemap filter stays a pure predicate. */
const DORMANT_WORK_ROUTES = new Set(
  WORK_CONTENT_DIRS.filter(({ dir }) => countPublishedWorks(dir) === 0).map(({ route }) => route),
);

/**
 * A page URL reduced to its route, so `/zh/works/` is never read as `/works/`.
 *
 * `endsWith('/works/')` matches both, and the two routes are held back
 * independently — the comparison has to be on the whole path.
 *
 * @param {string} page Absolute page URL, as the sitemap integration emits it.
 * @returns {string} The route, always with a trailing slash.
 */
function routeOf(page) {
  const path = new URL(page).pathname.replace(/\/+$/, '');
  return path === '' ? '/' : `${path}/`;
}

export default defineConfig({
  site: SITE,
  base: '/',
  output: 'static',
  integrations: [
    mdx(),
    sitemap({
      // Emits <xhtml:link rel="alternate" hreflang="..."> for every page.
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en-US',
          zh: 'zh-CN',
        },
      },
      filter: (page) => {
        if (page.includes('404')) return false;
        // §1 + the Owner decision above: a dormant index route is not offered
        // to search engines. A detail route is never matched here, so the first
        // work to ship is indexed immediately.
        if (DORMANT_WORK_ROUTES.has(routeOf(page))) return false;
        return true;
      },
      serialize: (item) => (item.url.endsWith('/') ? item : { ...item, url: `${item.url}/` }),
    }),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-light',
      wrap: true,
    },
  },
});
