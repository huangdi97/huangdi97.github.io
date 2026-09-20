/**
 * Editorial background system + raster loading policy (v2.2).
 *
 * This suite is the browser half of the argument the visual gate makes in
 * source. The gate can prove the tokens are declared and the markup is inert;
 * only a browser can prove the tokens are actually *applied*, that a phone gets
 * fewer fragments rather than a squashed desktop, and — the acceptance item
 * this whole round turns on — that the page still stands up when no image
 * arrives at all.
 *
 * The suite is deliberately small. §97 asks for a few assertions that would
 * genuinely catch a regression, and warns against dozens of fragile pixel
 * tests. Everything here is either a contract (inert, deterministic, one eager
 * image) or the round's own acceptance criterion (no-image completeness).
 */

import { test, expect, type Page } from '@playwright/test';
import { visit } from './helpers';

/** Routes that mount the background, with the marks each mode is meant to show. */
const MARKED_ROUTES = ['/', '/projects/', '/research/', '/about/', '/resume/'] as const;

/** §34: what each mode is for. `minimal` is checked separately — it has none. */
const EXPECTED_KINDS: Record<string, string[]> = {
  '/': ['math', 'biology', 'ai'],
  '/research/': ['math', 'biology', 'ai'],
  '/about/': ['math', 'biology'],
  '/resume/': ['math'],
};

/** §12: floor and ceiling per token, per theme, exactly as the gate enforces. */
const TOKEN_BANDS: Record<string, Record<string, [number, number]>> = {
  paper: {
    'bg-mark': [0.025, 0.05],
    'bg-graph': [0.03, 0.06],
    'bg-bio': [0.03, 0.06],
    'bg-grid': [0.02, 0.04],
  },
  white: {
    'bg-mark': [0.02, 0.045],
    'bg-graph': [0.02, 0.05],
    'bg-bio': [0.02, 0.05],
    'bg-grid': [0.015, 0.035],
  },
  night: {
    'bg-mark': [0.04, 0.08],
    'bg-graph': [0.04, 0.08],
    'bg-bio': [0.04, 0.08],
    'bg-grid': [0.03, 0.06],
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

      expect(tokens['bg-grid'], `${theme} ticks under notation`).toBeLessThan(tokens['bg-mark']);
      expect(tokens['bg-mark'], `${theme} notation under the graph marks`).toBeLessThan(
        tokens['bg-graph'],
      );
      expect(tokens['bg-bio'], `${theme} biology no louder than the graph`).toBeLessThanOrEqual(
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

    // And all three sciences survive the reduction.
    for (const kind of ['math', 'biology', 'ai']) {
      const count = await page
        .locator(`[data-editorial-background] [data-bg-kind="${kind}"]:visible`)
        .count();
      expect(count, `${kind} fragments at 390px`).toBeGreaterThan(0);
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
