/**
 * Theme system tests.
 *
 * Covers the three behaviours a visitor actually notices:
 *   · the default is paper, for everyone, including a dark-mode visitor;
 *   · a choice persists across reloads, across pages and across languages;
 *   · the theme is decided before the first paint, so nothing flashes.
 */

import { test, expect, type Page } from '@playwright/test';
import { activeTheme, openAppearance, visit } from './helpers';

const THEMES = ['paper', 'white', 'night'] as const;

async function chooseTheme(page: Page, theme: (typeof THEMES)[number]): Promise<void> {
  await openAppearance(page);
  await page.locator(`[data-theme-option="${theme}"]`).first().click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
}

test.describe('theme default', () => {
  test('a first visit is paper, even when the OS prefers dark', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await visit(page, '/zh/');
    expect(await activeTheme(page)).toBe('paper');
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#F0EEE8');
  });

  test('the bootstrap script runs before any stylesheet is applied', async ({ request }) => {
    const response = await request.get('/zh/');
    const html = await response.text();

    const bootstrap = html.indexOf('haoleilab-theme');
    const firstStyle = Math.min(
      ...['<link rel="stylesheet"', '<style', 'rel="stylesheet"']
        .map((needle) => html.indexOf(needle))
        .filter((index) => index !== -1),
    );

    // No flash: the attribute is written before the first rule can paint.
    expect(bootstrap).toBeGreaterThan(-1);
    expect(firstStyle).toBeGreaterThan(-1);
    expect(bootstrap).toBeLessThan(firstStyle);
  });

  test('data-theme is present at commit time, before the body paints', async ({ page }) => {
    await visit(page, '/zh/', { waitUntil: 'commit' });
    expect(await activeTheme(page)).toBe('paper');
  });
});

test.describe('theme switching', () => {
  test('choosing white applies it and persists across a reload', async ({ page }) => {
    await visit(page, '/zh/');
    await chooseTheme(page, 'white');

    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#FFFFFF');

    await page.reload();
    expect(await activeTheme(page)).toBe('white');
  });

  test('choosing night persists into a newly opened page', async ({ page }) => {
    await visit(page, '/zh/');
    await chooseTheme(page, 'night');

    const other = await page.context().newPage();
    await other.goto('/zh/research/');
    expect(await other.evaluate(() => document.documentElement.dataset.theme)).toBe('night');
  });

  test('the switcher marks the active theme for assistive technology', async ({ page }) => {
    await visit(page, '/zh/');
    await chooseTheme(page, 'night');

    const options = page.locator('[data-theme-option]');
    const count = await options.count();
    for (let i = 0; i < count; i += 1) {
      const option = options.nth(i);
      const value = await option.getAttribute('data-theme-option');
      await expect(option).toHaveAttribute('aria-checked', value === 'night' ? 'true' : 'false');
    }
  });

  test('switching theme costs no navigation and no network request', async ({ page }) => {
    await visit(page, '/zh/');
    const url = page.url();

    const requests: string[] = [];
    page.on('request', (request) => requests.push(request.url()));

    await chooseTheme(page, 'white');
    expect(requests.filter((value) => !value.startsWith('data:'))).toEqual([]);
    expect(page.url()).toBe(url);
  });

  test('a theme chosen in one tab reaches the others', async ({ page, context }) => {
    await visit(page, '/zh/');
    const second = await context.newPage();
    await second.goto('/zh/');

    await chooseTheme(page, 'night');
    await expect(second.locator('html')).toHaveAttribute('data-theme', 'night');
  });
});

test.describe('theme survives the language switch', () => {
  test('moving between locales keeps the chosen theme', async ({ page }) => {
    await visit(page, '/zh/');
    await chooseTheme(page, 'night');

    await page.getByRole('banner').getByRole('link', { name: /EN|English/ }).first().click();
    await page.waitForURL((url) => !url.pathname.startsWith('/zh'));

    expect(await activeTheme(page)).toBe('night');
    await page.reload();
    expect(await activeTheme(page)).toBe('night');
  });
});

test.describe('theme coverage', () => {
  for (const theme of THEMES) {
    test(`${theme} paints its own canvas and leaves no unstyled surface`, async ({ page }) => {
      await page.addInitScript((value) => {
        try {
          localStorage.setItem('haoleilab-theme', value);
        } catch {
          /* storage unavailable */
        }
      }, theme);

      await visit(page, '/zh/');
      expect(await activeTheme(page)).toBe(theme);

      const body = await page.evaluate(() => {
        const style = getComputedStyle(document.body);
        return { background: style.backgroundColor, colour: style.color };
      });

      // Every theme resolves both properties — a missing token would leave the
      // browser default (transparent canvas, black ink) in place.
      expect(body.background).not.toBe('rgba(0, 0, 0, 0)');
      expect(body.colour).not.toBe('');
    });
  }
});

test.describe('mobile appearance control', () => {
  test('the mobile menu offers all three themes as reachable targets', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'mobile-only');
    await visit(page, '/zh/');

    await page.locator('[data-nav-toggle]').click();
    const panel = page.locator('#mobile-nav');

    for (const theme of THEMES) {
      const option = panel.locator(`[data-theme-option="${theme}"]`);
      await expect(option).toBeVisible();
      const box = await option.boundingBox();
      expect(box?.height ?? 0, `${theme} touch target`).toBeGreaterThanOrEqual(44);
    }

    await panel.locator('[data-theme-option="white"]').click();
    expect(await activeTheme(page)).toBe('white');
  });
});
