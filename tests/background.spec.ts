/**
 * Editorial background system + raster loading policy (v2.2, re-layered in
 * v2.2.1).
 *
 * This suite is the browser half of the argument the visual gate makes in
 * source. The gate can prove the tokens are declared and the markup is inert;
 * only a browser can prove the tokens are actually *applied*, that a phone gets
 * fewer fragments rather than a squashed desktop, and — the acceptance item
 * this whole round turns on — that the page still stands up when no image
 * arrives at all.
 *
 * v2.2.1 moves the axis of the suite. v2.2 had one composition and varied the
 * number of fragments per mode, so the tests here could check "the same field,
 * smaller". The round replaced that with seven variants that differ in mark
 * set, placement *and* density (§50–§52), so the tests now check the hierarchy
 * itself: that the routes do not draw the same field, and that the density
 * order the owner named is the order the CSS actually produces.
 *
 * The suite is deliberately small. §97 asks for a few assertions that would
 * genuinely catch a regression, and warns against dozens of fragile pixel
 * tests. Everything here is either a contract (inert, deterministic, one eager
 * image) or the round's own acceptance criterion (no-image completeness).
 */

import { test, expect, type Page } from '@playwright/test';
import { visit } from './helpers';

/** Routes that mount the background, with the marks each variant is meant to show. */
const MARKED_ROUTES = ['/', '/projects/', '/research/', '/about/', '/resume/'] as const;

/**
 * §50–§52: the variant table, mirrored from `ScientificEditorialBackground`.
 *
 * Read per *kind*, not per group: `formula` and `curve` are both mathematics,
 * so a variant's kind set is what a reader actually perceives. `/projects`
 * deliberately shares the homepage's mark set — what separates them is density
 * and placement, which the hierarchy test below measures.
 */
const EXPECTED_KINDS: Record<string, string[]> = {
  '/': ['math', 'ai'],
  '/projects/': ['math', 'ai'],
  '/research/': ['math', 'biology', 'ai'],
  '/about/': ['math', 'ai'],
  '/resume/': ['math'],
};

/** §51: the owner's density table, as a strict order rather than seven numbers. */
const DENSITY_ORDER = ['/research/', '/', '/projects/', '/about/', '/resume/'] as const;

/** §12/§18: floor and ceiling per token, per theme, exactly as the gate enforces. */
const TOKEN_BANDS: Record<string, Record<string, [number, number]>> = {
  paper: {
    'bg-texture': [0.01, 0.028],
    'bg-grid': [0.02, 0.04],
    'bg-mark': [0.025, 0.05],
    'bg-curve': [0.03, 0.06],
    'bg-graph': [0.03, 0.06],
    'bg-bio': [0.03, 0.06],
  },
  white: {
    'bg-texture': [0.01, 0.024],
    'bg-grid': [0.015, 0.035],
    'bg-mark': [0.02, 0.045],
    'bg-curve': [0.02, 0.055],
    'bg-graph': [0.02, 0.06],
    'bg-bio': [0.02, 0.06],
  },
  night: {
    'bg-texture': [0.015, 0.032],
    'bg-grid': [0.03, 0.06],
    'bg-mark': [0.04, 0.08],
    'bg-curve': [0.045, 0.09],
    'bg-graph': [0.045, 0.09],
    'bg-bio': [0.045, 0.09],
  },
};

/** Captions the background may never carry (§11). */
const BANNED_CAPTIONS = ['CELL STATE LANDSCAPE', 'AGENT GRAPH', 'posterior', 'likelihood', 'LATENT'];

/** Every image the page can request. Used by the no-image and loading tests. */
const IMAGE_GLOB = '**/*.{png,jpg,jpeg,webp,avif,svg}';

async function setTheme(page: Page, theme: string) {
  await page.addInitScript((value) => {
    try {
      localStorage.setItem('haoleilab-theme', value);
    } catch {
      /* storage unavailable */
    }
  }, theme);
}

test.describe('editorial background', () => {
  for (const route of MARKED_ROUTES) {
    test(`${route} mounts an inert, document-level background`, async ({ page }) => {
      await visit(page, route);

      const bg = page.locator('[data-editorial-background]');
      await expect(bg).toHaveCount(1);
      await expect(bg).toHaveAttribute('aria-hidden', 'true');

      // Atmosphere, not a target: the pointer must pass straight through.
      const pointerEvents = await bg.evaluate(
        (el) => getComputedStyle(el as HTMLElement).pointerEvents,
      );
      expect(pointerEvents).toBe('none');

      // Nothing behind the text may join the tab order.
      expect(await bg.locator('a, button, [tabindex]').count()).toBe(0);

      /* Document-level, not viewport-fixed. `absolute` rather than `fixed` is
         the difference between a sheet of paper the page sits on and wallpaper
         the page slides over. */
      const geometry = await bg.evaluate((el) => {
        const style = getComputedStyle(el as HTMLElement);
        return {
          position: style.position,
          zIndex: style.zIndex,
          height: (el as HTMLElement).getBoundingClientRect().height,
          document: document.documentElement.scrollHeight,
        };
      });
      expect(geometry.position).toBe('absolute');
      expect(geometry.zIndex).toBe('-1');
      expect(geometry.height).toBeGreaterThan(geometry.document * 0.9);

      /* The three layers, actually painted. A background that is present in the
         DOM and empty on screen is the v1.4 failure this system exists to fix. */
      const layers = await page.evaluate(() => {
        const read = (selector: string) => {
          const el = document.querySelector(selector) as HTMLElement | null;
          if (!el) return null;
          const style = getComputedStyle(el);
          return {
            image: style.backgroundImage,
            size: style.backgroundSize,
            opacity: Number(style.opacity),
            width: el.getBoundingClientRect().width,
          };
        };
        return { wash: read('.ebg-wash'), texture: read('.ebg-texture') };
      });

      expect(layers.wash, 'wash layer').not.toBeNull();
      expect(layers.wash?.image, 'wash gradients').not.toBe('none');
      expect(layers.wash?.opacity ?? 0).toBeGreaterThan(0.4);

      expect(layers.texture, 'texture layer').not.toBeNull();
      expect(layers.texture?.image ?? '', 'texture tile').toContain('paper.webp');
      expect(layers.texture?.opacity ?? 0).toBeGreaterThan(0.01);

      /* §3: a 128px tile, not a 256px one. The v2.2 tile was 256×256 and carried
         a directional fibre layer, so it repeated every 256px behind every page
         — the horizontal banding this round exists to remove. The size is
         asserted here because a later "make the grain finer" edit that quietly
         grew the tile would restore the periodicity without ever touching the
         generator, and nothing else in the suite would notice. */
      expect(layers.texture?.size ?? '', 'tile size').toBe('128px 128px');
    });
  }

  for (const route of Object.keys(EXPECTED_KINDS)) {
    test(`${route} carries the sciences its mode promises`, async ({ page }) => {
      await visit(page, route);

      for (const kind of EXPECTED_KINDS[route]) {
        const count = await page.locator(`[data-editorial-background] [data-bg-kind="${kind}"]`).count();
        expect(count, `${kind} fragments on ${route}`).toBeGreaterThan(0);
      }

      // §11: no captions. The field carries the idea by drawing it.
      const text = await page.locator('[data-editorial-background]').innerText().catch(() => '');
      for (const caption of BANNED_CAPTIONS) {
        expect(text.toUpperCase(), `background caption on ${route}`).not.toContain(caption);
      }
    });
  }

  /**
   * §50–§52: the per-page variant table, checked as a hierarchy rather than as
   * seven numbers.
   *
   * v2.2's failure was that every page had roughly the same field — density
   * moved by a factor of two across the whole site, which is not a hierarchy.
   * The correction is only real if the order the owner named survives all the
   * way to the rendered page, so this test reads `--ebg-scale` off the mounted
   * element and asserts the order, and separately checks that the routes do not
   * all draw the same marks. A variant that differs only in its multiplier
   * would pass a "the mode names are unique" check and fail this one.
   */
  test('the routes draw different fields, in the order the brief names', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    const seen: Record<string, { mode: string; scale: number; groups: string[] }> = {};

    for (const route of MARKED_ROUTES) {
      await visit(page, route);
      seen[route] = await page.evaluate(() => {
        const bg = document.querySelector('[data-editorial-background]') as HTMLElement | null;
        if (!bg) return { mode: '', scale: 0, groups: [] };
        return {
          mode: bg.dataset.bgMode ?? '',
          scale: Number(getComputedStyle(bg).getPropertyValue('--ebg-scale').trim()),
          groups: Array.from(bg.querySelectorAll('[data-bg-group]')).map(
            (group) => (group as HTMLElement).dataset.bgGroup ?? '',
          ),
        };
      });
    }

    // One variant per route, and no route quietly falling back to the empty one.
    const modes = MARKED_ROUTES.map((route) => seen[route].mode);
    expect(modes.every(Boolean), 'every route declares its mode').toBe(true);
    expect(new Set(modes).size, 'each route has its own mode').toBe(modes.length);
    expect(modes, 'no route falls back to the empty variant').not.toContain('minimal');

    // §51: research is the richest field and resume the quietest, in that order.
    const scales = DENSITY_ORDER.map((route) => seen[route].scale);
    expect(scales.every((value) => Number.isFinite(value) && value > 0), 'every scale parses').toBe(
      true,
    );
    for (let i = 1; i < scales.length; i += 1) {
      expect(scales[i], `${DENSITY_ORDER[i]} is quieter than ${DENSITY_ORDER[i - 1]}`).toBeLessThan(
        scales[i - 1],
      );
    }

    for (const route of MARKED_ROUTES) {
      const { groups } = seen[route];
      expect(groups.length, `${route} group count`).toBeGreaterThanOrEqual(1);
      expect(groups.length, `${route} group count`).toBeLessThanOrEqual(4);
      if (route !== '/resume/') {
        /* §7–§8: a composition, not a watermark. /resume is the one page §50
           deliberately leaves with a single fragment. */
        expect(groups.length, `${route} draws a composition`).toBeGreaterThanOrEqual(2);
      }
    }

    // The mark set travels with the variant — these are not one field with five
    // multipliers.
    const sets = MARKED_ROUTES.map((route) => [...seen[route].groups].sort().join(','));
    expect(new Set(sets).size, 'the routes do not all draw the same marks').toBeGreaterThan(2);
  });

  test('every theme inks the field inside the §12 band, and the hierarchy holds', async ({
    page,
  }) => {
    /* Pinned to the desktop breakpoint on purpose. Below 900px the system
       multiplies every weight by `--ebg-mobile` (§59), so the rendered opacity
       is deliberately *not* the token there — the 390px composition has its own
       test below. This one is about the token, so it is measured where the
       token is the whole story. */
    await page.setViewportSize({ width: 1440, height: 900 });

    for (const theme of ['paper', 'white', 'night'] as const) {
      await setTheme(page, theme);
      await visit(page, '/');
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);

      /* Read the tokens themselves. Reading the rendered opacity instead would
         fold in the mode and viewport scales and make the band meaningless. */
      const tokens = await page.evaluate((names) => {
        const style = getComputedStyle(document.documentElement);
        return Object.fromEntries(
          names.map((name) => [name, Number(style.getPropertyValue(`--${name}`).trim())]),
        );
      }, Object.keys(TOKEN_BANDS[theme]));

      for (const [token, [min, max]] of Object.entries(TOKEN_BANDS[theme])) {
        const value = tokens[token];
        expect(Number.isFinite(value), `${theme} ${token} is declared`).toBe(true);
        expect(value, `${theme} ${token} floor`).toBeGreaterThanOrEqual(min);
        expect(value, `${theme} ${token} ceiling`).toBeLessThanOrEqual(max);
      }

      /* §18: four mark kinds, four separable bands. The curve sits between the
         notation and the network, which is what makes the weights four distinct
         values rather than three — v2.2 gave the curve and the network one
         token, so two of the owner's four bands collapsed into one. */
      expect(tokens['bg-texture'], `${theme} grain under every mark`).toBeLessThan(tokens['bg-grid']);
      expect(tokens['bg-grid'], `${theme} ruled grid under the notation`).toBeLessThan(
        tokens['bg-mark'],
      );
      expect(tokens['bg-mark'], `${theme} notation under the curve`).toBeLessThan(tokens['bg-curve']);
      expect(tokens['bg-curve'], `${theme} curve under the network`).toBeLessThan(tokens['bg-graph']);
      expect(tokens['bg-bio'], `${theme} biology no louder than the network`).toBeLessThanOrEqual(
        tokens['bg-graph'],
      );

      /* And the tokens are actually used: the homepage runs at scale 1, so its
         rendered group opacity is the token itself. */
      const rendered = await page.evaluate(() => {
        const el = document.querySelector('.ebg-formula') as HTMLElement | null;
        return el ? Number(getComputedStyle(el).opacity) : null;
      });
      expect(rendered, `${theme} formula opacity`).not.toBeNull();
      expect(Math.abs((rendered as number) - tokens['bg-mark'])).toBeLessThan(0.002);
    }
  });

  test('the background declares no motion', async ({ page }) => {
    await visit(page, '/');

    const motion = await page.evaluate(() => {
      const out: string[] = [];
      for (const el of document.querySelectorAll('[data-editorial-background], .ebg-wash, .ebg-texture, .ebg-marks, .ebg-group')) {
        const style = getComputedStyle(el);
        if (style.animationName !== 'none') out.push(`${el.className}: animation ${style.animationName}`);
        if (Number.parseFloat(style.transitionDuration) > 0) {
          out.push(`${el.className}: transition ${style.transitionDuration}`);
        }
      }
      return out;
    });

    expect(motion, '§38 asks the background for no motion at all').toEqual([]);
  });

  test('a 390px screen gets fewer fragments, not a squashed desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await visit(page, '/research/');
    const desktop = await page.locator('[data-editorial-background] [data-bg-group]:visible').count();

    await page.setViewportSize({ width: 390, height: 844 });
    await visit(page, '/research/');
    const mobile = await page.locator('[data-editorial-background] [data-bg-group]:visible').count();

    expect(desktop).toBeGreaterThan(0);
    // Still present — the answer to a small screen is "fewer", not "none".
    expect(mobile).toBeGreaterThan(0);
    expect(mobile).toBeLessThan(desktop);

    /* §54 caps a phone at one or two groups, and /research keeps exactly one:
       the network, which is the fragment that says "computational" on its own.
       The notation, the cell and the curve are *hidden* rather than shrunk,
       because a mark that has been shrunk to fit is still a mark competing with
       the text. */
    expect(mobile, '§54 caps a phone at two groups').toBeLessThanOrEqual(2);
    expect(mobile, 'the network is the one that survives').toBe(1);

    const visibleKinds = await page
      .locator('[data-editorial-background] [data-bg-kind]:visible')
      .evaluateAll((nodes) => [
        ...new Set(nodes.map((node) => (node as HTMLElement).dataset.bgKind ?? '')),
      ]);
    expect(visibleKinds.sort()).toEqual(['ai']);
  });

  test('the phone clears the field entirely on the two document pages', async ({ page }) => {
    /* §54, per page: /projects already leads with four drawings and /resume is a
       professional document, so both keep zero mark groups at 390px. Asserted
       rather than assumed, because "fewer" and "none" are one CSS rule apart. */
    await page.setViewportSize({ width: 390, height: 844 });

    for (const route of ['/projects/', '/resume/']) {
      await visit(page, route);
      const visible = await page.locator('[data-editorial-background] [data-bg-group]:visible').count();
      expect(visible, `${route} at 390px`).toBe(0);
    }
  });

  test('the retired v1.7 canvas is gone from every route', async ({ page }) => {
    for (const route of ['/', '/projects/', '/research/', '/about/', '/resume/']) {
      await visit(page, route);
      await expect(page.locator('[data-global-scientific-canvas]'), route).toHaveCount(0);
      await expect(page.locator('.global-science'), route).toHaveCount(0);
    }
  });
});

test.describe('raster loading policy', () => {
  test('the homepage paints one eager drawing and defers the other four', async ({ page }) => {
    await visit(page, '/');

    const eager = page.locator('main img[loading="eager"]');
    await expect(eager, 'exactly one eager drawing').toHaveCount(1);
    await expect(eager).toHaveAttribute('src', /hero-/);

    // §24: everything else is deferred, and every drawing is async-decoded.
    const lazy = page.locator('main [data-artwork] img');
    await expect(lazy).toHaveCount(5);
    for (let i = 0; i < 5; i += 1) {
      const img = lazy.nth(i);
      await expect(img).toHaveAttribute('decoding', 'async');
      await expect(img).toHaveAttribute('srcset', /640w/);
      await expect(img).toHaveAttribute('width', /\d+/);
      await expect(img).toHaveAttribute('height', /\d+/);
      if (i > 0) await expect(img, `drawing #${i + 1}`).toHaveAttribute('loading', 'lazy');
    }

    // §25: one preload, and it is the hero.
    const preloads = page.locator('link[rel="preload"][as="image"]');
    await expect(preloads).toHaveCount(1);
    await expect(preloads).toHaveAttribute('imagesrcset', /hero-640\.webp 640w/);
  });

  test('a 390px phone asks for the small rung, not the desktop file', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    const requested: string[] = [];
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('/images/')) requested.push(url);
    });

    await visit(page, '/', { waitUntil: 'networkidle' });

    // The hero is the only drawing above the fold, so it is the only one that
    // must have arrived — and it must not be the 1440px file.
    const hero = requested.filter((url) => url.includes('hero-'));
    expect(hero.length, 'the hero was requested').toBeGreaterThan(0);
    expect(hero.some((url) => url.includes('hero-640.webp') || url.includes('hero-960.webp'))).toBe(
      true,
    );
    expect(hero.some((url) => url.includes('hero-1440.webp'))).toBe(false);
  });

  test('no source artwork is reachable', async ({ page, request }) => {
    for (const url of [
      '/images/home/v2/hero-source.png',
      '/images/home/v2/wennian-source.png',
      '/images/site/v2/pages/research-source.png',
      '/images/home/v2/source/hero.png',
    ]) {
      const response = await request.get(url);
      expect(response.status(), `${url} must not be published`).toBe(404);
    }

    // And nothing in the page points at one either.
    await visit(page, '/');
    const html = await page.content();
    expect(html).not.toMatch(/\/[^"'\s]*-source\.(?:png|jpe?g|webp)/i);
  });
});

/**
 * §86–§87, the round's acceptance criterion.
 *
 * "If the page becomes very empty, structurally off, or looks broken with the
 * images off, this round failed." So this test blocks every image and asserts
 * the page is still a page: the background is painted, the words are there, the
 * structure has not collapsed, and the document is the same height it was with
 * the images — because the frames reserve their space with `aspect-ratio`, the
 * layout must not depend on whether the bytes arrived.
 */
test.describe('no-image QA', () => {
  for (const route of ['/', '/research/', '/about/']) {
    test(`${route} stands up with every image blocked`, async ({ page }) => {
      await visit(page, route, { waitUntil: 'networkidle' });
      const withImages = await page.evaluate(() => document.documentElement.scrollHeight);

      const blocked: string[] = [];
      await page.route(IMAGE_GLOB, (routeHandler) => {
        blocked.push(routeHandler.request().url());
        return routeHandler.abort();
      });

      await visit(page, route);
      await page.waitForLoadState('domcontentloaded');

      expect(blocked.length, 'the block actually blocked something').toBeGreaterThan(0);

      // 1. The background is still painted.
      const painted = await page.evaluate(() => {
        const wash = document.querySelector('.ebg-wash') as HTMLElement | null;
        const bg = document.querySelector('[data-editorial-background]') as HTMLElement | null;
        return {
          washImage: wash ? getComputedStyle(wash).backgroundImage : 'none',
          washOpacity: wash ? Number(getComputedStyle(wash).opacity) : 0,
          height: bg ? bg.getBoundingClientRect().height : 0,
        };
      });
      expect(painted.washImage).not.toBe('none');
      expect(painted.washOpacity).toBeGreaterThan(0.4);
      expect(painted.height).toBeGreaterThan(400);

      // 2. The words are still there, and still the first thing on the page.
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

      // 3. The structure has not collapsed.
      const withoutImages = await page.evaluate(() => document.documentElement.scrollHeight);
      expect(withoutImages).toBeGreaterThan(withImages * 0.95);

      // 4. No horizontal scrollbar, which is how a background layer usually
      //    breaks a page.
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);
    });
  }
});
