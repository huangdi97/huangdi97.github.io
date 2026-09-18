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

/** Notation that used to end up on project covers. */
const MATH_GLYPHS = /[∈∝Σ∫∇∂√≈≤≥θλσΩΔαβγπℝⁿˣᵖₜ₊₁₂₃₀₄₅₆₇₈₉]/g;

function covers(page: Page) {
  return page.locator('article.showcase [data-cover]');
}

test.describe('featured project covers', () => {
  for (const home of HOMES) {
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

      await expect(page.locator('article.showcase [data-cover] math')).toHaveCount(0);

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

    test(`${home} inks the field inside the v1.6 band`, async ({ page }) => {
      await visit(page, home);

      const weights = await page.evaluate(() => {
        const read = (cls: string): number | null => {
          const el = document.querySelector(`.global-science .${cls}`);
          return el ? Number(getComputedStyle(el as HTMLElement).opacity) : null;
        };
        return {
          macro: read('sci-stroke'),
          notation: read('sci-notation'),
          micro: read('sci-micro'),
          grid: read('sci-grid'),
        };
      });

      expect(weights.macro, 'macro layer').not.toBeNull();
      expect(weights.notation, 'notation layer').not.toBeNull();
      expect(weights.micro, 'micro layer').not.toBeNull();
      expect(weights.grid, 'grid layer').not.toBeNull();

      /* Paper, the default theme. The floors are the v1.6 decision: the v1.4
         ambient layer lived at 0.025–0.055 and was invisible, so "faint enough
         to be safe" is now a failure, not a virtue. */
      expect(weights.macro as number).toBeGreaterThanOrEqual(0.08);
      expect(weights.macro as number).toBeLessThanOrEqual(0.14);
      expect(weights.notation as number).toBeGreaterThanOrEqual(0.05);
      expect(weights.notation as number).toBeLessThanOrEqual(0.09);
      expect(weights.micro as number).toBeGreaterThanOrEqual(0.02);
      expect(weights.micro as number).toBeLessThanOrEqual(0.05);
      expect(weights.grid as number).toBeGreaterThanOrEqual(0.02);
      expect(weights.grid as number).toBeLessThanOrEqual(0.04);

      // Hierarchy: a formula never out-shouts the composition around it.
      expect(weights.notation as number).toBeLessThan(weights.macro as number);
      expect(weights.grid as number).toBeLessThan(weights.micro as number);
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
