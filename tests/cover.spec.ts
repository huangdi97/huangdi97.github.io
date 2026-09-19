/**
 * Project cover + global scientific canvas tests (v1.6).
 *
 * Two things this suite exists to prevent:
 *
 *   1. A cover that is only a drawing. Every featured cover must state, in
 *      HTML text, the project name, what it is, its core capabilities and its
 *      real status — so the page never asks a visitor to guess from a figure.
 *   2. A cover that drifts back into being a mathematics poster. No MathML,
 *      and a hard cap on notation characters inside the cover.
 *
 * The canvas is the other half of the split. v1.4 shipped it at 2.5–5.5%
 * opacity and the owner could not see it, so this suite now asserts both
 * directions: the field must be inert and hidden from assistive technology,
 * AND it must be inked inside a band that is genuinely visible. A floor is as
 * much a part of the contract as a ceiling.
 */

import { test, expect, type Page } from '@playwright/test';
import { visit } from './helpers';

const HOMES = ['/', '/zh/'] as const;
const PROJECTS = ['/projects/', '/zh/projects/'] as const;

/** Notation that used to end up on project covers. */
const MATH_GLYPHS = /[∈∝Σ∫∇∂√≈≤≥θλσΩΔαβγπℝⁿˣᵖₜ₊₁₂₃₀₄₅₆₇₈₉]/g;

function covers(page: Page) {
  return page.locator('article[data-groups] [data-cover]');
}

/**
 * The words-first cover contract.
 *
 * v1.7 moved the homepage off covers: Selected Work is now a mosaic of large
 * illustrations with identification-only text, so the "a cover explains itself
 * in words" rule is checked where covers still render — the /projects grid.
 * The rule itself is unchanged, and it still has to hold.
 */
test.describe('project covers on /projects', () => {
  for (const home of PROJECTS) {
    test(`${home} every cover names, explains and dates the project`, async ({ page }) => {
      await visit(page, home);
      const all = covers(page);
      const count = await all.count();
      expect(count).toBeGreaterThanOrEqual(3);

      for (let i = 0; i < count; i += 1) {
        const cover = all.nth(i);

        // 1. The project name — as text, not as an SVG path.
        const title = cover.locator('[data-cover-title]');
        await expect(title).toBeVisible();
        expect(((await title.innerText()) ?? '').trim().length).toBeGreaterThan(1);

        // 2. What it is.
        const description = cover.locator('[data-cover-desc]');
        await expect(description).toBeVisible();
        expect(((await description.innerText()) ?? '').trim().length).toBeGreaterThan(10);

        // 3. Core capabilities — at least three, in HTML.
        const capabilities = cover.locator('[data-cover-caps] li');
        expect(await capabilities.count()).toBeGreaterThanOrEqual(3);

        // 4. Real status.
        const status = cover.locator('[data-cover-status]');
        await expect(status).toBeVisible();
        expect(((await status.innerText()) ?? '').trim().length).toBeGreaterThan(3);
      }
    });

    test(`${home} covers are words first — the drawing alone says nothing`, async ({ page }) => {
      await visit(page, home);
      const cover = covers(page).first();

      const words = ((await cover.innerText()) ?? '').trim();
      expect(words.length).toBeGreaterThan(60);

      // Strip the auxiliary mark: what is left must still be a description.
      const withoutSvg = await cover.evaluate((el) => {
        const clone = el.cloneNode(true) as HTMLElement;
        clone.querySelectorAll('svg').forEach((svg) => svg.remove());
        return (clone.textContent ?? '').trim();
      });
      expect(withoutSvg.length).toBeGreaterThan(60);
    });

    test(`${home} covers carry no MathML and almost no notation`, async ({ page }) => {
      await visit(page, home);

      await expect(page.locator('article[data-groups] [data-cover] math')).toHaveCount(0);

      const all = covers(page);
      const count = await all.count();
      for (let i = 0; i < count; i += 1) {
        const text = await all.nth(i).innerText();
        const glyphs = text.match(MATH_GLYPHS) ?? [];
        expect(glyphs.length, `cover #${i + 1} notation characters: ${glyphs.join('')}`).toBeLessThanOrEqual(
          12,
        );
      }
    });

    test(`${home} the auxiliary mark never takes over the cover`, async ({ page }) => {
      await visit(page, home);
      const cover = covers(page).first();

      const box = await cover.boundingBox();
      const mark = await cover.locator('[data-cover-visual]').boundingBox();
      expect(box).not.toBeNull();
      expect(mark).not.toBeNull();

      const share = ((mark?.width ?? 0) * (mark?.height ?? 0)) / ((box?.width ?? 1) * (box?.height ?? 1));
      // Words own the cover: the mark stays under half of it.
      expect(share).toBeLessThan(0.5);
    });
  }
});

test.describe('global scientific canvas', () => {
  for (const home of HOMES) {
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
