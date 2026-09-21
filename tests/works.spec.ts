/**
 * Works route tests (v2.3, §100).
 *
 * What this suite is for. §100 lists the contracts the new surface has to hold:
 * the two index routes, the detail routes, hreflang, no draft rendering, **no
 * initial video request**, poster dimensions, responsive behaviour and no
 * overflow. Every one of them is asserted here against a real browser rather
 * than inferred from the markup.
 *
 * ── Why the suite has two modes ─────────────────────────────────────────────
 *
 * The published site has **no works** — §30–§32 forbid inventing one — so the
 * default build renders an empty index, and the assertions that matter for it
 * are negative ones: nothing is listed, no draft has a route, no page pulls a
 * video byte.
 *
 * The layouts, on the other hand, can only be checked against entries, and
 * `scripts/qa-works-shots.mjs` builds those under the `works-preview` mode
 * (§83). So the same file runs in both modes and asserts the appropriate half:
 *
 *   default          the index is empty; every fixture route 404s; no `qa-`
 *                    slug appears anywhere; zero video requests
 *   WORKS_PREVIEW=1  the index lists the fixtures; a fixture route renders; the
 *                    poster, ratio, responsive and overflow contracts are
 *                    asserted against real entries
 *
 * The mode is passed in rather than sniffed, because a suite that infers "am I
 * in preview?" from the page it is testing cannot tell a preview build from a
 * production build that leaked a draft — which is the one failure this suite
 * exists to catch.
 */

import { test, expect, type Page } from '@playwright/test';
import { visit } from './helpers';

const PREVIEW = process.env.WORKS_PREVIEW === '1';

/**
 * The fixture slugs `scripts/qa-works-shots.mjs` writes.
 *
 * Duplicated here on purpose: this is the list of things that must **not** exist
 * in a default build, and a list that were imported from the generator would
 * stop being an independent check on it.
 */
const FIXTURE_SLUGS = [
  'qa-film-16x9',
  'qa-film-9x16',
  'qa-visual-1x1',
  'qa-generative-3x2',
  'qa-cultural-9x16',
  'qa-heritage-4x3',
  'qa-interactive-16x9',
  'qa-experiment-9x16',
];

const INDEX_ROUTES = [
  { path: '/works/', locale: 'en', heading: 'Works' },
  { path: '/zh/works/', locale: 'zh', heading: '作品' },
];

/** Every request the page makes that could be a video, by host or by extension. */
const VIDEO_REQUEST =
  /(youtube\.com|youtu\.be|bilibili\.com|douyin\.com|vimeo\.com)|\.(mp4|webm|mov|m4v|m3u8)(\?|$)/i;

function collectVideoRequests(page: Page): string[] {
  const seen: string[] = [];
  page.on('request', (request) => {
    if (VIDEO_REQUEST.test(request.url())) seen.push(request.url());
  });
  return seen;
}

/**
 * Walk the page so every `loading="lazy"` poster has actually been requested.
 *
 * §54 puts everything below the fold on `lazy`, and an assertion that is not a
 * full-page screenshot does not scroll — so `naturalWidth` stays 0 for a poster
 * that was never near the viewport. That reads as "the file is missing" and is
 * not: the first run of this suite reported entry 6 as broken for exactly this
 * reason, while `scripts/qa-works-shots.mjs` measured all eight loaded.
 */
async function primeLazyImages(page: Page) {
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.8);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    window.scrollTo(0, 0);
    await Promise.all(
      [...document.images]
        .filter((img) => !img.complete)
        .map(
          (img) =>
            new Promise((resolve) => {
              img.addEventListener('load', resolve, { once: true });
              img.addEventListener('error', resolve, { once: true });
            }),
        ),
    );
  });
}

/* -------------------------------------------------------------------------- */

test.describe('Works index routes', () => {
  for (const { path, locale, heading } of INDEX_ROUTES) {
    test(`${path} renders with its own SEO and a single h1`, async ({ page }) => {
      await visit(page, path);

      await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
      await expect(page.locator('html')).toHaveAttribute(
        'lang',
        locale === 'zh' ? 'zh-Hans' : 'en',
      );

      /* §48: the index carries its own title, description and canonical. The
         floor is per locale rather than one count for both: the Chinese
         description is written in Chinese, and CJK carries the same meaning in
         roughly a third of the characters, so a single English-shaped minimum
         fails a correct page. */
      await expect(page).toHaveTitle(/Works|作品/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        new RegExp(`${path}$`),
      );
      const description =
        (await page.locator('meta[name="description"]').getAttribute('content')) ?? '';
      const minDescription = locale === 'zh' ? 18 : 60;
      expect(
        description.length,
        `description is ${description.length} characters: ${description}`,
      ).toBeGreaterThanOrEqual(minDescription);

      /* §49: the Open Graph tags are present and agree with the canonical. */
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /.{4,}/);
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
        'content',
        /^https?:\/\//,
      );
    });

    test(`${path} declares both locales for hreflang`, async ({ page }) => {
      await visit(page, path);

      /* `hreflang` sits on the `<link>` itself rather than on a child of it, so
         each alternate is matched by attribute. `filter({ has })` looks for a
         *descendant* and would report zero for a perfectly correct page. */
      await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1);
      await expect(page.locator('link[rel="alternate"][hreflang="zh-Hans"]')).toHaveCount(1);
      await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);

      await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute(
        'href',
        /\/works\/$/,
      );
      await expect(page.locator('link[rel="alternate"][hreflang="zh-Hans"]')).toHaveAttribute(
        'href',
        /\/zh\/works\/$/,
      );
    });

    test(`${path} requests no video and mounts no player`, async ({ page }) => {
      const videoRequests = collectVideoRequests(page);
      await visit(page, path);
      await page.waitForLoadState('networkidle');

      /* §19 and §53: the index pulls zero video bytes, and that is measured from
         the network rather than argued from the absence of a tag. */
      expect(videoRequests).toEqual([]);
      await expect(page.locator('video')).toHaveCount(0);
      await expect(page.locator('iframe')).toHaveCount(0);
    });
  }
});

/* -------------------------------------------------------------------------- */

/**
 * §36 — the Works background is its own variant, and this is where it is
 * asserted as *rendered* rather than as declared.
 *
 * `scripts/check-visual-system.mjs` already proves at source level that a
 * `works` variant exists and that its density is distinct from the other seven.
 * That check cannot see the page, so it would still pass if `/works/` mounted
 * `minimal`, or if the variant drew a cell and a neural group — both of which
 * §36 rules out ("at most one curve and one faint formula fragment; no cell, no
 * large neural network, no DNA").
 *
 * It lives in this file rather than in `background.spec.ts` so that the existing
 * background suite is left exactly as it was (§1).
 */
test.describe('Works background', () => {
  for (const { path } of INDEX_ROUTES) {
    test(`${path} mounts the works variant and nothing more (§36)`, async ({ page }) => {
      await visit(page, path);

      const bg = page.locator('[data-editorial-background]');
      await expect(bg).toHaveCount(1);
      await expect(bg).toHaveAttribute('aria-hidden', 'true');
      await expect(bg).toHaveAttribute('data-bg-mode', 'works');

      // Atmosphere, not a target — and it must sit behind the work.
      const style = await bg.evaluate((el) => {
        const cs = getComputedStyle(el as HTMLElement);
        return {
          pointerEvents: cs.pointerEvents,
          zIndex: cs.zIndex,
          scale: cs.getPropertyValue('--ebg-scale').trim(),
        };
      });
      expect(style.pointerEvents).toBe('none');
      expect(style.zIndex).toBe('-1');
      expect(Number(style.scale), 'the works density is the declared 0.72').toBeCloseTo(0.72, 2);

      /* §36's mark budget, as rendered: one curve and one faint formula. */
      const groups = await bg
        .locator('[data-bg-group]')
        .evaluateAll((els) => els.map((el) => (el as HTMLElement).dataset.bgGroup ?? ''));
      expect(groups.slice().sort()).toEqual(['curve', 'formula']);

      const kinds = await bg
        .locator('[data-bg-kind]')
        .evaluateAll((els) => els.map((el) => (el as HTMLElement).dataset.bgKind ?? ''));
      expect(new Set(kinds)).toEqual(new Set(['math']));

      /* §11: the field carries the idea by drawing it, never by captioning it.
         The formula mark is rendered as SVG text, so this layer legitimately
         contains notation (`∂u/∂t`, `∇L(θ)`) — that is the drawing, not a label.
         What must not appear is a caption naming the page or naming a science
         the variant does not draw: §36 excludes the cell, the agent graph and
         the DNA strand, and a caption for any of them would be the watermark
         failure written in words. */
      const text = (await bg.innerText().catch(() => '')).toUpperCase();
      for (const caption of ['WORKS', '作品', 'CELL', 'AGENT', 'DNA', 'NEURAL', 'POSTERIOR']) {
        expect(text, `Works background caption: ${caption}`).not.toContain(caption);
      }
    });
  }
});

/* -------------------------------------------------------------------------- */

test.describe('Works navigation', () => {
  /* Both surfaces carry the same `links` array, so both are checked — and they
     are checked in the DOM rather than through visibility. Below the `md`
     breakpoint the desktop list is `display: none` *and* the panel behind the
     hamburger is `display: none` until it is opened, so a visibility-based
     assertion on a phone would pass or fail for reasons unrelated to the label.
     `hasText` is anchored with `\s*` because it tests `textContent`, which
     carries the formatting whitespace around the label. */
  const SURFACES = ['[data-site-header] nav', '#mobile-nav nav'];

  test('the header label for /projects is Projects, not Work', async ({ page }) => {
    /* §4: the rename is what keeps the two output lines distinguishable. The
       route, its content and its <h1> are unchanged, and the retired label is
       asserted absent rather than merely un-asserted. */
    await visit(page, '/');
    for (const surface of SURFACES) {
      const links = page.locator(`${surface} a`);
      await expect(links.filter({ hasText: /^\s*Projects\s*$/ })).toHaveCount(1);
      await expect(links.filter({ hasText: /^\s*Work\s*$/ })).toHaveCount(0);
    }
  });

  test('the Chinese header label for /projects is still 项目', async ({ page }) => {
    await visit(page, '/zh/');
    for (const surface of SURFACES) {
      await expect(page.locator(`${surface} a`).filter({ hasText: /^\s*项目\s*$/ })).toHaveCount(1);
    }
  });

  test('the Works entry is absent below the publication threshold', async ({ page }) => {
    test.skip(PREVIEW, 'the preview build has enough works to enable the entry');

    /* §81: with too few published works the route exists and is simply not
       announced — on either surface. */
    for (const path of ['/', '/zh/']) {
      await visit(page, path);
      for (const surface of SURFACES) {
        await expect(
          page.locator(`${surface} a`).filter({ hasText: /^\s*(Works|作品)\s*$/ }),
        ).toHaveCount(0);
      }
    }
  });

  test('the Works entry appears once the threshold is met', async ({ page }) => {
    test.skip(!PREVIEW, 'the default build has no published works');

    /* §82: eight fixtures are past `WORKS_NAV_MIN`, so the entry is present on
       both surfaces — and it is present because the content says so, not
       because a flag was flipped. */
    await visit(page, '/');
    for (const surface of SURFACES) {
      const links = page.locator(`${surface} a`);
      await expect(links.filter({ hasText: /^\s*Works\s*$/ })).toHaveCount(1);
      await expect(links.filter({ hasText: /^\s*作品\s*$/ })).toHaveCount(0);
    }
  });
});

/* -------------------------------------------------------------------------- */

test.describe('drafts never reach a page', () => {
  test('no fixture slug has a route in the default build', async ({ page }) => {
    test.skip(PREVIEW, 'the preview build renders the fixtures by design');

    /* §69: a draft has no route. Asserted by asking for one, which is the only
       way to be sure the filter ran rather than merely being present. */
    for (const slug of FIXTURE_SLUGS) {
      const response = await page.goto(`/works/${slug}/`);
      expect(response?.status(), `/works/${slug}/ must not exist`).toBe(404);
    }
  });

  test('no fixture slug appears anywhere in the default build', async ({ page }) => {
    test.skip(PREVIEW, 'the preview build renders the fixtures by design');

    for (const path of ['/', '/projects/', '/works/', '/zh/', '/zh/works/']) {
      await visit(page, path);
      const html = await page.content();
      for (const slug of FIXTURE_SLUGS) {
        expect(html, `${path} leaks the draft slug ${slug}`).not.toContain(slug);
      }
    }
  });
});

/* -------------------------------------------------------------------------- */

test.describe('gallery layout', () => {
  test.skip(!PREVIEW, 'the layout contracts need entries to be asserted against');

  test('every poster is responsive, loaded, and framed at its own ratio', async ({ page }) => {
    await visit(page, '/works/');
    await primeLazyImages(page);

    const entries = page.locator('[data-work]');
    await expect(entries).toHaveCount(FIXTURE_SLUGS.length);

    for (let i = 0; i < FIXTURE_SLUGS.length; i += 1) {
      const entry = entries.nth(i);
      const poster = entry.locator('img').first();

      /* §21: the shared ladder, so a phone is never handed the 1440 file. */
      const srcset = await poster.getAttribute('srcset');
      expect(srcset, `entry ${i} has no srcset`).toBeTruthy();
      expect(srcset?.split(',').length, `entry ${i} does not ship the whole ladder`).toBe(3);

      /* §51: a description, not the word "cover". */
      const alt = await poster.getAttribute('alt');
      expect(alt?.length ?? 0).toBeGreaterThan(12);
      expect(alt ?? '').not.toMatch(/^(image|cover|poster image)$/i);

      /* §54: nothing below the fold is eager. */
      await expect(poster).toHaveAttribute('loading', 'lazy');

      /* §49/§98: the intrinsic size is declared, so the box is reserved before
         the bytes arrive. */
      await expect(poster).toHaveAttribute('width', /\d+/);
      await expect(poster).toHaveAttribute('height', /\d+/);

      /* The file actually exists and decoded — the one check a static gate
         cannot make. */
      const natural = await poster.evaluate((node: HTMLImageElement) => ({
        w: node.naturalWidth,
        h: node.naturalHeight,
      }));
      expect(natural.w, `entry ${i} poster did not load`).toBeGreaterThan(0);

      /* §62: the frame's shape comes from the entry's own ratio, and the source
         file agrees with it. */
      const declared = await entry.evaluate((node) => {
        const ratio = getComputedStyle(node.querySelector('figure')!).aspectRatio;
        const [rw, rh] = ratio.split('/').map((v) => Number(v.trim()));
        return rw / rh;
      });
      expect(natural.w / natural.h).toBeCloseTo(declared, 2);
    }
  });

  test('portrait and landscape works get different compositions', async ({ page }) => {
    /* §63: a 9:16 piece does not stretch across the page. This is the
       *two-column* composition, which only exists from 900px up — below that
       every entry is a single column and the portrait rule is a width cap
       instead, asserted by the next test. Comparing the two widths at a phone
       width would be measuring a composition that is not there. */
    await page.setViewportSize({ width: 1440, height: 900 });
    await visit(page, '/works/');

    const landscape = page.locator('[data-work][data-orientation="landscape"]').first();
    const portrait = page.locator('[data-work][data-orientation="portrait"]').first();

    const landscapeWidth = (await landscape.locator('figure').first().boundingBox())?.width ?? 0;
    const portraitWidth = (await portrait.locator('figure').first().boundingBox())?.width ?? 0;

    expect(portraitWidth).toBeGreaterThan(0);
    expect(portraitWidth).toBeLessThan(landscapeWidth * 0.75);
  });

  test('the gallery is a single column and never overflows sideways', async ({ page }) => {
    for (const width of [1440, 1024, 768, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await visit(page, '/works/');

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(0);

      /* §9: one work per row, always — a gallery, not a wall of tiles (§8). */
      const columns = await page.evaluate(() => {
        const gallery = document.querySelector('[data-works-gallery]');
        if (!gallery) return 1;
        return getComputedStyle(gallery).gridTemplateColumns.split(' ').filter(Boolean).length;
      });
      expect(columns).toBeLessThanOrEqual(1);
    }
  });

  test('a portrait poster is bounded on a phone', async ({ page }) => {
    /* §64: capping the width rather than the height is what keeps the
       composition intact while stopping one poster eating the screen. The band
       is the declared cap — 78% — rather than "smaller than the page", which a
       full-width poster also satisfies on a wide phone.

       The denominator is the *entry*, not `.shell`. The cap is a percentage of
       the poster's containing block, and `.shell`'s bounding box includes its
       own horizontal padding: measuring against it reports 0.68 for a poster
       that is exactly at 0.78, which reads as a missing cap and is not one. */
    await page.setViewportSize({ width: 390, height: 844 });
    await visit(page, '/works/');

    const portrait = page.locator('[data-work][data-orientation="portrait"]').first();
    const box = await portrait.locator('figure').first().boundingBox();
    const column = (await portrait.boundingBox())?.width ?? 0;

    const ratio = (box?.width ?? 0) / column;
    expect(ratio, 'a phone portrait poster is capped at 78% of its column').toBeGreaterThan(0.7);
    expect(ratio, 'a phone portrait poster is capped at 78% of its column').toBeLessThan(0.8);
  });
});

/* -------------------------------------------------------------------------- */

test.describe('work detail', () => {
  test.skip(!PREVIEW, 'the detail contract needs an entry to be asserted against');

  test('shows the poster, the identification and one watch link', async ({ page }) => {
    const videoRequests = collectVideoRequests(page);
    await visit(page, '/works/qa-film-16x9/');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    /* §54: the detail page's poster is the page's own LCP element, so it is the
       one image allowed to be eager. */
    const poster = page.locator('figure.work-poster img').first();
    await expect(poster).toHaveAttribute('loading', 'eager');

    /* §44: the watch affordance is a link, and §84/§52 require it to be an
       external https link that says so. */
    const watch = page.getByRole('link', { name: /Watch|观看作品/ });
    await expect(watch).toBeVisible();
    await expect(watch).toHaveAttribute('href', /^https:\/\//);
    await expect(watch).toHaveAttribute('rel', /noopener/);
    await expect(watch).toHaveAttribute('target', '_blank');

    /* §25/§26: nothing is mounted until — and, in this phase, even after — the
       visitor clicks. The measurement is the point. */
    await watch.click({ noWaitAfter: true }).catch(() => undefined);
    expect(videoRequests).toEqual([]);
    await expect(page.locator('iframe')).toHaveCount(0);
  });

  test('a vertical work is capped by width, a horizontal one is not', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    await visit(page, '/works/qa-film-16x9/');
    const wide = (await page.locator('figure.work-poster').first().boundingBox())?.width ?? 0;

    await visit(page, '/works/qa-film-9x16/');
    const tall = (await page.locator('figure.work-poster').first().boundingBox())?.width ?? 0;

    /* §63/§65: a cinematic piece gets the column; a portrait piece gets a
       comfortable one and the page keeps the rest as air. The absolute figure is
       the declared cap in `DETAIL_PORTRAIT_SIZES` — the relative one alone would
       also be satisfied by a 700px poster, which is the failure this is for. */
    expect(tall).toBeGreaterThan(0);
    expect(tall).toBeLessThan(wide * 0.75);
    expect(tall, 'the portrait cap is the declared 520px').toBeCloseTo(520, -2);
  });

  test('both locales cap a vertical work identically', async ({ page }) => {
    /* §47: the two detail routes are separate files, so a layout change can land
       in one and not the other — and this round's portrait cap did exactly that.
       `visit` derives the language from the path, so the test above only ever
       measured the English page; the QA harness pins the language and measured
       the Chinese one, which is how the one-sided fix was found. Asserting both
       here is what stops it recurring, because a green run is not evidence that
       the locale you did not open is correct. */
    await page.setViewportSize({ width: 1440, height: 900 });

    for (const path of ['/works/qa-film-9x16/', '/zh/works/qa-film-9x16/']) {
      await visit(page, path);
      const box = await page.locator('figure.work-poster').first().boundingBox();
      expect(box?.width ?? 0, `${path} caps the portrait poster at 520px`).toBeCloseTo(520, -2);
    }
  });

  test('the declared Open Graph size is the work own, not the site 1200x630', async ({ page }) => {
    /* §49: a portrait poster announced as 1200×630 is a false statement. */
    await visit(page, '/works/qa-film-9x16/');

    const width = await page.locator('meta[property="og:image:width"]').getAttribute('content');
    const height = await page.locator('meta[property="og:image:height"]').getAttribute('content');

    expect(Number(height)).toBeGreaterThan(Number(width));
  });

  test('the credits row appears only when a work has collaborators', async ({ page }) => {
    /* §44 lists Credits as an optional detail element. Exactly one fixture is
       built with one, so this asserts both directions: the row renders, and a
       solo piece gets no empty heading. */
    await visit(page, '/works/qa-film-16x9/');
    const facts = page.locator('dl.work-facts');
    await expect(facts).toContainText('Credits');
    await expect(facts).toContainText('Fixture Composer');

    await visit(page, '/works/qa-film-9x16/');
    await expect(page.locator('dl.work-facts')).not.toContainText('Credits');

    /* §47: the label is per-locale, and the two detail routes are separate
       files — the split-file hazard this round already hit once. */
    await visit(page, '/zh/works/qa-film-16x9/');
    await expect(page.locator('dl.work-facts')).toContainText('参与制作');
  });
});
