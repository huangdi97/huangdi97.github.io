/**
 * Project entries + global scientific canvas tests (v2.1).
 *
 * What this suite used to be. v1.6–v2.0 rendered /projects as a grid of
 * words-first covers: every project had to state its name, its type, its
 * capabilities and its status in HTML, with a small auxiliary mark that was not
 * allowed to take over. The page carried no image at all.
 *
 * v2.1 (§10–§14) reverses that. Every featured entry now leads with the
 * project's own artwork — the same file the homepage shows — and the words are
 * cut to a name, one positioning line, a short public introduction and one
 * status. The two rules that mattered in the cover era survive and are still
 * asserted here:
 *
 *   1. the image never stands in for the words — an entry read with its images
 *      removed is still a description;
 *   2. no entry drifts into being a mathematics poster.
 *
 * The canvas is the other half of the split. v1.4 shipped it at 2.5–5.5%
 * opacity and the owner could not see it, so this suite now asserts both
 * directions: the field must be inert and hidden from assistive technology,
 * AND it must be inked inside a band that is genuinely visible. A floor is as
 * much a part of the contract as a ceiling.
 */

import { test, expect, type Locator, type Page } from '@playwright/test';
import { visit } from './helpers';

/**
 * Pages that still mount the page-wide canvas.
 *
 * v2.0 removed it from the homepage (§9) — the homepage's visual work is one
 * hero artwork plus four project drawings, and a page-wide field behind them
 * would rebuild the "one hairline language on every screen" problem the reset
 * exists to fix. The canvas itself is unchanged and still has to behave, so the
 * suite checks it where it still renders: the inner pages, one per locale.
 */
const CANVAS_PAGES = ['/projects/', '/zh/research/'] as const;
const PROJECTS = ['/projects/', '/zh/projects/'] as const;

/** Notation that used to end up on project covers. */
const MATH_GLYPHS = /[∈∝Σ∫∇∂√≈≤≥θλσΩΔαβγπℝⁿˣᵖₜ₊₁₂₃₀₄₅₆₇₈₉]/g;

function entries(page: Page) {
  return page.locator('[data-project-entry]');
}

/**
 * An entry's drawing has two possible sources and the contract is the same for
 * both: the inlined placeholder (`<svg role="img" aria-label>`) or the owner's
 * raster asset (`<img alt width height>`). Asserting on one tag would make the
 * suite pass only while the other is missing, which is backwards.
 */
async function expectLabelledArtwork(art: Locator) {
  const img = art.locator('img');
  if ((await img.count()) > 0) {
    await expect(img).toHaveAttribute('alt', /.{12,}/);
    await expect(img).toHaveAttribute('width', /\d+/);
    await expect(img).toHaveAttribute('height', /\d+/);
    return;
  }
  const svg = art.locator('svg[role="img"]');
  await expect(svg).toHaveCount(1);
  await expect(svg).toHaveAttribute('aria-label', /.{12,}/);
}

test.describe('project entries on /projects', () => {
  for (const home of PROJECTS) {
    test(`${home} every entry carries an image, a name, one line and one status`, async ({ page }) => {
      await visit(page, home);
      const all = entries(page);
      await expect(all).toHaveCount(4);

      for (let i = 0; i < 4; i += 1) {
        const entry = all.nth(i);

        // 1. The project name — as text, not as an SVG path.
        const title = entry.locator('.entry-name');
        await expect(title).toBeVisible();
        expect(((await title.innerText()) ?? '').trim().length).toBeGreaterThan(1);

        // 2. One line of positioning.
        const line = entry.locator('.entry-line');
        await expect(line).toBeVisible();
        expect(((await line.innerText()) ?? '').trim().length).toBeGreaterThan(6);

        // 3. A short public introduction — present, but still a paragraph
        //    rather than a specification (§13).
        const intro = entry.locator('.entry-intro');
        await expect(intro).toBeVisible();
        const introText = ((await intro.innerText()) ?? '').trim();
        expect(introText.length, `entry #${i + 1} intro`).toBeGreaterThan(40);
        expect(introText.length, `entry #${i + 1} intro`).toBeLessThan(340);

        // 4. Exactly one status, and one project link. The link is matched by
        //    class rather than by its label, which differs per locale.
        await expect(entry.locator('.entry-status')).toHaveCount(1);
        await expect(entry.locator('.entry-link')).toBeVisible();

        // 5. The drawing is a labelled image and carries no notation.
        const art = entry.locator('[data-artwork]');
        await expect(art).toHaveCount(1);
        await expectLabelledArtwork(art);

        const glyphs = ((await art.innerText()) ?? '').match(MATH_GLYPHS) ?? [];
        expect(
          glyphs.length,
          `entry #${i + 1} notation characters: ${glyphs.join('')}`,
        ).toBeLessThanOrEqual(6);
      }
    });

    test(`${home} entries are words as well as images`, async ({ page }) => {
      await visit(page, home);

      // Strip the drawings: what is left must still describe the project.
      const withoutArt = await entries(page)
        .first()
        .evaluate((el) => {
          const clone = el.cloneNode(true) as HTMLElement;
          clone.querySelectorAll('svg, img').forEach((node) => node.remove());
          return (clone.textContent ?? '').trim();
        });
      expect(withoutArt.length).toBeGreaterThan(80);
    });

    test(`${home} carries no card apparatus`, async ({ page }) => {
      await visit(page, home);

      for (const selector of [
        '[data-cover]',
        '[data-cover-caps]',
        '[data-groups]',
        '.card-eyebrow',
        '.card-index',
        '.card-keywords',
        '[data-proof]',
        '.tag',
      ]) {
        await expect(page.locator(selector), `${selector} on ${home}`).toHaveCount(0);
      }
    });
  }
});

test.describe('global scientific canvas', () => {
  for (const home of CANVAS_PAGES) {
    test(`${home} renders an inert, document-level field`, async ({ page }) => {
      await visit(page, home);

      const canvas = page.locator('[data-global-scientific-canvas]');
      await expect(canvas).toHaveCount(1);
      await expect(canvas).toHaveAttribute('aria-hidden', 'true');

      // Atmosphere, not a target: the pointer must pass straight through.
      const pointerEvents = await canvas.evaluate(
        (el) => getComputedStyle(el as HTMLElement).pointerEvents,
      );
      expect(pointerEvents).toBe('none');

      // Nothing behind the text may join the tab order.
      expect(await canvas.locator('a, button, [tabindex]').count()).toBe(0);

      /* Document-level, not viewport-fixed. A `fixed` layer stops being a
         sheet of research paper and becomes wallpaper, so the position and the
         height are both part of the contract. */
      const geometry = await canvas.evaluate((el) => {
        const style = getComputedStyle(el as HTMLElement);
        return {
          position: style.position,
          height: (el as HTMLElement).getBoundingClientRect().height,
          document: document.documentElement.scrollHeight,
        };
      });
      expect(geometry.position).toBe('absolute');
      expect(geometry.height).toBeGreaterThan(geometry.document * 0.9);
    });

    test(`${home} carries mathematics, biology and AI`, async ({ page }) => {
      await visit(page, home);

      // The failure mode this guards: a field made only of formulas.
      for (const kind of ['math', 'biology', 'ai']) {
        const count = await page.locator(`[data-sci-kind="${kind}"]`).count();
        expect(count, `${kind} motifs in the canvas`).toBeGreaterThan(0);
      }
    });

    test(`${home} inks the field inside the v1.7 band, on every theme`, async ({ page }) => {
      /* Paper, White and Night are all reviewed as of P1. The bands below are the
         same numbers the visual gate enforces in CSS; checking them again in a
         browser catches a token that is defined but never applied. */
      const BANDS: Record<string, Record<string, [number, number]>> = {
        paper: {
          major: [0.1, 0.15],
          bio: [0.07, 0.11],
          formula: [0.045, 0.075],
          grid: [0.018, 0.035],
          accent: [0.07, 0.11],
        },
        white: {
          major: [0.07, 0.13],
          bio: [0.05, 0.1],
          formula: [0.035, 0.07],
          grid: [0.015, 0.035],
          accent: [0.05, 0.1],
        },
        night: {
          major: [0.1, 0.2],
          bio: [0.07, 0.15],
          formula: [0.05, 0.1],
          grid: [0.025, 0.06],
          accent: [0.08, 0.16],
        },
      };

      const CLASSES: Record<string, string> = {
        major: 'sci-major',
        bio: 'sci-bio',
        formula: 'sci-formula',
        grid: 'sci-grid',
        accent: 'sci-accent',
      };

      for (const theme of ['paper', 'white', 'night'] as const) {
        await page.addInitScript((value) => {
          try {
            localStorage.setItem('haoleilab-theme', value);
          } catch {
            /* storage unavailable */
          }
        }, theme);
        await visit(page, home);
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);

        const weights = await page.evaluate((classes) => {
          const out: Record<string, number | null> = {};
          for (const [key, cls] of Object.entries(classes)) {
            const el = document.querySelector(`.global-science .${cls}`);
            out[key] = el ? Number(getComputedStyle(el as HTMLElement).opacity) : null;
          }
          return out;
        }, CLASSES);

        for (const [key, [min, max]] of Object.entries(BANDS[theme])) {
          const value = weights[key];
          expect(value, `${theme} ${key} exists`).not.toBeNull();
          expect(value as number, `${theme} ${key} floor`).toBeGreaterThanOrEqual(min);
          expect(value as number, `${theme} ${key} ceiling`).toBeLessThanOrEqual(max);
        }

        // Hierarchy holds on every theme: notation under the drawing, ticks
        // under the notation, biology under the major weight.
        expect(weights.formula as number, `${theme} notation < major`).toBeLessThan(
          weights.major as number,
        );
        expect(weights.grid as number, `${theme} ticks < notation`).toBeLessThan(
          weights.formula as number,
        );
        expect(weights.bio as number, `${theme} biology < major`).toBeLessThan(
          weights.major as number,
        );
      }
    });

    test(`${home} the canvas never labels itself`, async ({ page }) => {
      await visit(page, home);

      // v1.6 captioned its motifs; the field read as a slide deck. A background
      // carries the idea by drawing it.
      const canvasText = await page
        .locator('[data-global-scientific-canvas]')
        .innerText()
        .catch(() => '');
      for (const caption of [
        'CELL STATE LANDSCAPE',
        'AGENT GRAPH',
        'state space',
        'posterior',
        'cells × genes',
      ]) {
        expect(canvasText, `background caption: ${caption}`).not.toContain(caption);
      }

      // Only bare notation is allowed, and very little of it. SVG <text> has no
      // innerText, so the content is read directly.
      const notation = await page
        .locator('.global-science .sci-formula text')
        .evaluateAll((nodes) => nodes.map((n) => (n.textContent ?? '').trim()));
      expect(notation.length).toBeLessThanOrEqual(6);
      for (const item of notation) {
        expect(item.length, `background notation "${item}"`).toBeLessThanOrEqual(12);
      }
    });

    test(`${home} a 390px screen gets fewer motifs, not a squashed desktop`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await visit(page, home);
      const desktop = await page.locator('.global-science [data-sci-mobile]:visible').count();

      await page.setViewportSize({ width: 390, height: 844 });
      await visit(page, home);
      const mobile = await page.locator('.global-science [data-sci-mobile]:visible').count();

      expect(desktop).toBeGreaterThan(0);
      // Still present — the answer to a small screen is "fewer", not "none".
      expect(mobile).toBeGreaterThan(0);
      expect(mobile / desktop).toBeLessThanOrEqual(0.6);

      // And all three sciences survive the reduction.
      for (const kind of ['math', 'biology', 'ai']) {
        const count = await page
          .locator(`.global-science [data-sci-kind="${kind}"]:visible`)
          .count();
        expect(count, `${kind} motifs at 390px`).toBeGreaterThan(0);
      }
    });
  }
});
