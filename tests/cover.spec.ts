/**
 * Project cover + ambient layer tests (v1.4.1).
 *
 * Two things this suite exists to prevent:
 *
 *   1. A cover that is only a drawing. Every featured cover must state, in
 *      HTML text, the project name, what it is, its core capabilities and its
 *      real status — so the page never asks a visitor to guess from a figure.
 *   2. A cover that drifts back into being a mathematics poster. No MathML,
 *      and a hard cap on notation characters inside the cover.
 *
 * The ambient layer is the other half of the split: it must be present,
 * invisible to assistive technology, and inert to the pointer.
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

test.describe('scientific ambient layer', () => {
  for (const home of HOMES) {
    test(`${home} renders an inert, hidden atmosphere layer`, async ({ page }) => {
      await visit(page, home);

      const layers = page.locator('[data-scientific-ambient]');
      expect(await layers.count()).toBeGreaterThanOrEqual(1);

      const count = await layers.count();
      for (let i = 0; i < count; i += 1) {
        const layer = layers.nth(i);
        await expect(layer).toHaveAttribute('aria-hidden', 'true');

        // Atmosphere, not a target: the pointer must pass straight through.
        const pointerEvents = await layer.evaluate(
          (el) => getComputedStyle(el as HTMLElement).pointerEvents,
        );
        expect(pointerEvents).toBe('none');
      }

      // Nothing behind the text may join the tab order.
      const focusable = await page.locator('[data-scientific-ambient] a, [data-scientific-ambient] button')
        .count();
      expect(focusable).toBe(0);
    });

    test(`${home} ambient stays inside the theme's opacity budget`, async ({ page }) => {
      await visit(page, home);

      const opacities = await page
        .locator('[data-scientific-ambient]')
        .evaluateAll((nodes) =>
          nodes.map((node) => Number(getComputedStyle(node as HTMLElement).opacity)),
        );

      expect(opacities.length).toBeGreaterThan(0);
      for (const value of opacities) {
        // Paper: 0.025–0.055. Visible, never wallpaper.
        expect(value).toBeGreaterThan(0);
        expect(value).toBeLessThan(0.06);
      }
    });

    test(`${home} a 390px screen keeps only part of the atmosphere`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await visit(page, home);
      const desktop = await page
        .locator('[data-scientific-ambient] [data-ambient-mobile]:visible')
        .count();

      await page.setViewportSize({ width: 390, height: 844 });
      await visit(page, home);
      const mobile = await page
        .locator('[data-scientific-ambient] [data-ambient-mobile]:visible')
        .count();

      expect(desktop).toBeGreaterThan(0);
      expect(mobile).toBeGreaterThan(0);
      // The spec asks a phone to show 30–50% of the desktop marks.
      expect(mobile / desktop).toBeLessThanOrEqual(0.6);
    });
  }
});
