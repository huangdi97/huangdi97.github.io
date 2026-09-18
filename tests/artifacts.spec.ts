/**
 * Selected Artifacts tests.
 *
 * The room only works if the mosaic actually lays out, every tile shows where
 * it came from, and the enlarge action is a real dialog. The grid assertion
 * also guards a class of regression: the cell widths are declared in
 * SelectedArtifacts but the cells are rendered by ArtifactCard, and Astro
 * scopes styles per component — a refactor that moves either side breaks it.
 *
 * Two naming rules keep the selectors honest:
 *   `.ar-cell` — the grid item, rendered only by SelectedArtifacts
 *   `.ar-tile` — the card shell, rendered only by ArtifactCard
 */

import { test, expect } from '@playwright/test';
import { visit } from './helpers';

const ISO_DATE = /\d{4}-\d{2}-\d{2}/;

test.describe('artifact room', () => {
  test('renders five real artifacts with sources and snapshot dates', async ({ page }) => {
    await visit(page, '/zh/');

    const cells = page.locator('#artifacts .ar-cell');
    await expect(cells).toHaveCount(5);

    // One tile per cell: the grid item and the card are separate elements.
    await expect(page.locator('#artifacts .ar-tile')).toHaveCount(5);

    const sources = page.locator('#artifacts .ar-source');
    await expect(sources).toHaveCount(5);
    for (let i = 0; i < 5; i += 1) {
      await expect(sources.nth(i)).toHaveAttribute('href', /^https:\/\/github\.com\//);
    }

    // Every tile carries its snapshot date, whatever language is rendered.
    for (const text of await cells.allInnerTexts()) {
      expect(text).toMatch(ISO_DATE);
    }
  });

  test('mosaic spans apply at desktop width', async ({ page }, testInfo) => {
    test.info().annotations.push({ type: 'note', description: 'guards cross-component scoping' });
    // Below 768px the grid is intentionally a single column, so no span applies.
    test.skip(testInfo.project.name === 'mobile', 'single-column layout below 768px');

    await visit(page, '/zh/');
    await page.locator('#artifacts').scrollIntoViewIfNeeded();

    const spans = await page.locator('#artifacts .ar-cell').evaluateAll((nodes) =>
      nodes.map((node) => ({
        size: (node as HTMLElement).dataset.size,
        column: getComputedStyle(node).gridColumnStart,
      })),
    );

    expect(spans).toHaveLength(5);
    const bySize = Object.fromEntries(spans.map((s) => [s.size ?? '', s.column]));
    expect(bySize.large).not.toBe('auto');
    expect(bySize.tall).not.toBe('auto');
    expect(bySize.wide).not.toBe('auto');
  });

  test('collapses to one column on mobile without horizontal overflow', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'desktop', 'desktop asserts the mosaic spans');
    await visit(page, '/zh/');
    await page.locator('#artifacts').scrollIntoViewIfNeeded();

    const spans = await page.locator('#artifacts .ar-cell').evaluateAll((nodes) =>
      nodes.map((node) => getComputedStyle(node).gridColumnStart),
    );
    expect(spans).toHaveLength(5);
    for (const column of spans) expect(column).toBe('auto');

    // Long <pre> listings must scroll inside the tile, not push the page.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('no artifact fabricates a screenshot', async ({ page }) => {
    await visit(page, '/zh/');
    await expect(page.locator('#artifacts img')).toHaveCount(0);
  });

  test('the room is the single inverted block on the page', async ({ page }) => {
    await visit(page, '/zh/');

    const room = await page.locator('#artifacts').evaluate((node) => getComputedStyle(node).backgroundColor);
    const canvas = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);

    expect(room).not.toBe(canvas);
    // Paper canvas is light; the room must be dark.
    expect(room).toMatch(/rgba?\((?:17|21|28),/);
  });

  test('enlarge opens a native dialog, Escape closes it, focus returns', async ({ page }) => {
    await visit(page, '/zh/');

    const cell = page.locator('#artifacts .ar-cell').first();
    const trigger = cell.locator('[data-artifact-open]');
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();

    const dialog = page.locator('dialog[open]');
    await expect(dialog).toHaveCount(1);

    // The enlarged view keeps the provenance: same source, plus the date.
    const source = ((await cell.locator('.ar-source').evaluate((node) => node.textContent ?? '')) as string)
      .split('↗')[0]
      .trim();
    await expect(dialog.locator('.ar-dialog-meta')).toContainText(source);
    await expect(dialog.locator('.ar-dialog-meta')).toContainText(ISO_DATE);

    await page.keyboard.press('Escape');
    await expect(page.locator('dialog[open]')).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test('every artifact is reachable by keyboard and labelled', async ({ page }) => {
    await visit(page, '/zh/');

    const cells = page.locator('#artifacts .ar-cell');
    await expect(cells).toHaveCount(5);

    for (let i = 0; i < 5; i += 1) {
      const cell = cells.nth(i);
      // `.ar-title` only: the dialog holds a second heading with the same text.
      await expect(cell.locator('.ar-title')).not.toBeEmpty();
      const expand = cell.locator('button.ar-expand');
      await expect(expand).toBeVisible();
      await expect(expand).toBeEnabled();
    }
  });
});
