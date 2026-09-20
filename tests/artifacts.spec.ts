/**
 * The retired evidence block (v2.2.1, §42–§44).
 *
 * What this suite used to be. v1.6 moved the "Selected Public Work" block from
 * the homepage to /projects. v2.1 cut it from a five-tile mosaic of repository
 * trees and terminal transcripts down to a three-row list — the room had
 * reached 2,875px, 44% of the page — and this file spent that round defending
 * the new size: three rows, their source links, their snapshot dates, a
 * three-column layout, the dark inverted surface, and a share of the page under
 * a fifth.
 *
 * v2.2.1 removes the block. The owner's review was no longer about size: a
 * full-width inverted surface reads as a different website bolted onto a
 * paper-editorial page, and a directory page should be a directory. So the
 * suite flips from "the block is small and correct" to "the block is not
 * mounted anywhere".
 *
 * §43 is explicit that this is a *rendering* change and not a data one, so the
 * survival of `src/data/artifacts.ts` is asserted at source level in
 * `scripts/check-artifacts.mjs`, where it can be checked without a browser.
 * What is asserted here is what a visitor can see: no room, no inverted
 * surface, and one line of text where the block used to be (§44).
 */

import { test, expect } from '@playwright/test';
import { visit } from './helpers';

const PROJECTS = ['/projects/', '/zh/projects/'] as const;

/** §44's exit link is labelled with the retired block's own title. */
const EXIT_LABEL: Record<string, string> = {
  '/projects/': 'Selected Public Work',
  '/zh/projects/': '公开成果精选',
};

test.describe('the retired evidence block', () => {
  for (const route of PROJECTS) {
    test(`${route} mounts no inverted evidence room`, async ({ page }) => {
      await visit(page, route);

      // The section, its room class, its rows and its links — all gone.
      await expect(page.locator('#artifacts')).toHaveCount(0);
      await expect(page.locator('.artifact-room')).toHaveCount(0);
      await expect(page.locator('[data-artifact]')).toHaveCount(0);
      await expect(page.locator('.ar-row')).toHaveCount(0);
      await expect(page.locator('.ar-source')).toHaveCount(0);
      await expect(page.locator('.ar-all-link')).toHaveCount(0);
      await expect(page.locator('.ar-eyebrow, .ar-lead, .ar-footnote')).toHaveCount(0);
    });

    test(`${route} paints no surface other than the page`, async ({ page }) => {
      /* The specific complaint §42 answers. The block was the site's only
         inverted surface, and the dark palette is the thing to test for: with
         the room gone, nothing on the page may paint it — the paper is the
         paper all the way down. Matching the colour rather than "any non-canvas
         background" keeps this from failing on a legitimate hairline or hover
         state, which is not what §42 was about. */
      await visit(page, route);

      const dark = await page.evaluate(() => {
        const out: string[] = [];
        for (const el of document.querySelectorAll('main, main *')) {
          const bg = getComputedStyle(el).backgroundColor;
          if (/rgba?\((?:17|21|28),/.test(bg)) {
            out.push(`${el.tagName.toLowerCase()}.${el.className}`);
          }
        }
        return out;
      });

      expect(dark, 'no inverted surface survives on the page').toEqual([]);
    });

    test(`${route} keeps one way out, and it is a line rather than a block`, async ({ page }) => {
      await visit(page, route);

      const exits = page.locator('.work-exit');
      await expect(exits).toHaveCount(1);

      const link = exits.getByRole('link');
      await expect(link).toHaveCount(1);
      await expect(link).toHaveAttribute('href', 'https://github.com/huangdi97');
      await expect(link).toContainText(EXIT_LABEL[route]);

      // A line, not a section that grew back: no heading, no list, no grid.
      await expect(exits.locator('section, h2, ul, ol, pre, code, img')).toHaveCount(0);
      const box = await exits.boundingBox();
      expect(box?.height ?? 0, 'the exit is a line').toBeLessThan(80);
    });
  }
});
