/**
 * Selected Public Work tests.
 *
 * v1.6 moved this block from the homepage to /projects. v2.1's final closure cut
 * it from a five-tile mosaic of repository trees and terminal transcripts to a
 * three-row list: the room had reached 2,875px, 44% of the page, so a visitor
 * asking "what have you built" met a directory listing before they met the four
 * projects.
 *
 * Two things therefore have to hold, and they pull in opposite directions:
 *
 *   · the evidence has to stay real and checkable — every row still carries its
 *     source file and the day it was read;
 *   · the page has to stay a portfolio — no raw tree, no transcript, and a block
 *     small enough that the four projects are still what the page is about.
 *
 * The second half of that is the reason for the height assertion below. Without
 * it, "reduce the artifact area" is a one-off edit that the next round can undo
 * by accident.
 *
 * Every test runs against /zh/projects/, except the locale-independent ones.
 */

import { test, expect } from '@playwright/test';
import { visit } from './helpers';

const ISO_DATE = /\d{4}-\d{2}-\d{2}/;

/** The cap §34 sets: the evidence list is a footnote, never a fifth of the page. */
const MAX_PAGE_SHARE = 0.2;

test.describe('selected public work', () => {
  test('renders three real artifacts with sources and snapshot dates', async ({ page }) => {
    await visit(page, '/zh/projects/');

    const rows = page.locator('#artifacts .ar-row');
    await expect(rows).toHaveCount(3);

    // Each row names the artifact it is quoting, so a stranger can go and read it.
    const ids = await rows.evaluateAll((nodes) =>
      nodes.map((node) => (node as HTMLElement).dataset.artifact ?? ''),
    );
    expect(ids.filter(Boolean)).toHaveLength(3);

    const sources = page.locator('#artifacts .ar-source');
    await expect(sources).toHaveCount(3);
    for (let i = 0; i < 3; i += 1) {
      await expect(sources.nth(i)).toHaveAttribute('href', /^https:\/\/github\.com\//);
    }

    // Every row carries its snapshot date, whatever language is rendered.
    for (const text of await rows.allInnerTexts()) {
      expect(text).toMatch(ISO_DATE);
    }
  });

  test('prints no repository tree, terminal transcript or metric dump', async ({ page }) => {
    await visit(page, '/zh/projects/');

    // The whole reason the block was 44% of the page. A repository can be opened;
    // a directory listing on a portfolio page is not evidence, it is weight.
    await expect(page.locator('#artifacts pre')).toHaveCount(0);
    await expect(page.locator('#artifacts code')).toHaveCount(0);
    await expect(page.locator('#artifacts img')).toHaveCount(0);
  });

  test('stays under a fifth of the page', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'the budget is stated for the desktop page');

    await visit(page, '/zh/projects/');

    const share = await page.evaluate(() => {
      const section = document.querySelector('#artifacts');
      if (!section) return 1;
      return section.getBoundingClientRect().height / document.documentElement.scrollHeight;
    });

    expect(share).toBeLessThanOrEqual(MAX_PAGE_SHARE);
  });

  test('collapses to one column on mobile without horizontal overflow', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'desktop', 'desktop asserts the three-column rows');
    await visit(page, '/zh/projects/');
    await page.locator('#artifacts').scrollIntoViewIfNeeded();

    const columns = await page.locator('#artifacts .ar-row').evaluateAll((nodes) =>
      nodes.map((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length),
    );
    expect(columns).toEqual([1, 1, 1]);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('lays the rows out in three columns at desktop width', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'single-column below 860px');

    await visit(page, '/zh/projects/');
    await page.locator('#artifacts').scrollIntoViewIfNeeded();

    const columns = await page.locator('#artifacts .ar-row').evaluateAll((nodes) =>
      nodes.map((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length),
    );
    expect(columns).toEqual([3, 3, 3]);
  });

  test('the block is the single inverted surface on the page', async ({ page }) => {
    await visit(page, '/zh/projects/');

    const room = await page.locator('#artifacts').evaluate((node) => getComputedStyle(node).backgroundColor);
    const canvas = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);

    expect(room).not.toBe(canvas);
    // Paper canvas is light; the evidence block must be dark.
    expect(room).toMatch(/rgba?\((?:17|21|28),/);
  });

  test('every source link is reachable by keyboard and labelled', async ({ page }) => {
    await visit(page, '/zh/projects/');

    const rows = page.locator('#artifacts .ar-row');
    await expect(rows).toHaveCount(3);

    for (let i = 0; i < 3; i += 1) {
      const row = rows.nth(i);
      await expect(row.locator('.ar-title')).not.toBeEmpty();
      await expect(row.locator('.ar-project')).not.toBeEmpty();

      const source = row.locator('.ar-source');
      await expect(source).toBeVisible();
      await expect(source).toHaveAttribute('target', '_blank');
      await expect(source).toHaveAttribute('rel', /noopener/);
      // The link text is the quoted source itself, not "here" or an icon alone.
      expect(((await source.textContent()) ?? '').trim().length).toBeGreaterThan(12);
    }
  });

  test('offers one way out to everything else', async ({ page }) => {
    await visit(page, '/zh/projects/');

    const all = page.locator('#artifacts .ar-all-link');
    await expect(all).toHaveCount(1);
    await expect(all).toHaveAttribute('href', 'https://github.com/huangdi97');
  });
});
