/**
 * Test helpers for a site whose entry locale is a client preference.
 *
 * With no stored preference the site opens in Chinese, so a test that wants the
 * English page has to declare that preference *before* the bootstrap script
 * runs. `visit()` writes it with an init script, which Playwright evaluates
 * ahead of every page script — the same moment a real visitor's stored choice
 * would be read.
 */

import type { Page } from '@playwright/test';

export type Locale = 'en' | 'zh';

export function localeForPath(path: string): Locale {
  return path === '/zh' || path.startsWith('/zh/') ? 'zh' : 'en';
}

/**
 * Navigate with the language preference that matches the requested path, so a
 * test lands on the page it asked for instead of being redirected to its
 * counterpart.
 *
 * The preference is derived from the path *being loaded*, not captured once at
 * call time: an init script runs on every navigation, and a frozen value would
 * overwrite a choice the page itself just made (the language switch records
 * one mid-test).
 */
export async function visit(
  page: Page,
  path: string,
  options?: Parameters<Page['goto']>[1],
): Promise<ReturnType<Page['goto']>> {
  await page.addInitScript(() => {
    try {
      const current = window.location.pathname;
      localStorage.setItem(
        'haoleilab-language',
        current === '/zh' || current.startsWith('/zh/') ? 'zh' : 'en',
      );
    } catch {
      /* storage unavailable — the preference simply is not read */
    }
  });
  return page.goto(path, options);
}

/** Record a locale choice once, on the page that is already open. */
export async function seedLocale(page: Page, locale: Locale): Promise<void> {
  await page.evaluate((value) => {
    try {
      localStorage.setItem('haoleilab-language', value);
    } catch {
      /* storage unavailable */
    }
  }, locale);
}

/** Wait until the document's path is exactly `path` (no `**` prefix matching). */
export async function waitForPath(page: Page, path: string): Promise<void> {
  await page.waitForURL((url) => new URL(url).pathname === path);
}

/** The theme currently applied to <html>, as the page itself would read it. */
export async function activeTheme(page: Page): Promise<string | null> {
  return page.evaluate(() => document.documentElement.dataset.theme ?? null);
}

/** Open the header appearance popover. */
export async function openAppearance(page: Page): Promise<void> {
  const trigger = page.locator('[data-theme-toggle]').first();
  await trigger.click();
  await page.locator('[data-theme-menu]:not([hidden])').first().waitFor();
}
