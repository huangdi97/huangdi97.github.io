/**
 * Project entries (v2.2).
 *
 * What this suite used to be. v1.6–v2.0 rendered /projects as a grid of
 * words-first covers: every project had to state its name, its type, its
 * capabilities and its status in HTML, with a small auxiliary mark that was not
 * allowed to take over. The page carried no image at all.
 *
 * v2.1 (§10–§14) reverses that. Every featured entry leads with the project's
 * own artwork — the same file the homepage shows — and the words are cut to a
 * name, one positioning line, a short public introduction and one status. The
 * two rules that mattered in the cover era survive and are still asserted here:
 *
 *   1. the image never stands in for the words — an entry read with its images
 *      removed is still a description;
 *   2. no entry drifts into being a mathematics poster.
 *
 * v2.2 demotes the artwork further (§18–§19): the drawing is feathered into the
 * paper and no longer carries the row, but it is still a labelled image and
 * still has to earn its place. The half of this file that used to assert the
 * v1.7 global scientific canvas is gone — that system is retired and is checked
 * as retired in `background.spec.ts` and in the visual gate, rather than
 * re-tested here against pages that no longer mount it.
 */

import { test, expect, type Locator, type Page } from '@playwright/test';
import { visit } from './helpers';

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

/**
 * v2.2: the v1.7 canvas is retired.
 *
 * It used to be checked here, on the two inner pages that mounted it. Nothing
 * mounts it now, so the assertion is the retirement itself — one line, on every
 * route that used to carry it, rather than a suite re-testing a component the
 * site no longer renders. `background.spec.ts` covers what replaced it.
 */
test.describe('the retired v1.7 canvas', () => {
  for (const route of ['/projects/', '/zh/projects/', '/research/', '/zh/research/']) {
    test(`${route} no longer mounts it`, async ({ page }) => {
      await visit(page, route);
      await expect(page.locator('[data-global-scientific-canvas]')).toHaveCount(0);
      await expect(page.locator('.global-science')).toHaveCount(0);
    });
  }
});
