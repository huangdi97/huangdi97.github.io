/**
 * Chinese-first entry tests.
 *
 * The site keeps two stable URL trees — `/` for English and `/zh/` for Chinese.
 * A stored preference decides which one a visitor lands on, and the redirect
 * always preserves the path they asked for. Nothing here rewrites canonical,
 * hreflang or the build output: it is a client preference over a static site.
 */

import { test, expect, type Page } from '@playwright/test';
import { seedLocale, visit, waitForPath } from './helpers';

/**
 * Wait for the client redirect to land.
 *
 * The bootstrap calls `location.replace` from an inline script, so under a busy
 * worker the navigation can complete before `waitForURL` subscribes to it.
 * Polling the resolved path is immune to that race.
 */
async function expectRedirectedTo(page: Page, path: string): Promise<void> {
  await expect.poll(() => new URL(page.url()).pathname, { timeout: 20_000 }).toBe(path);
}

async function prefer(page: Page, lang: 'en' | 'zh'): Promise<void> {
  await page.addInitScript((value) => {
    try {
      localStorage.setItem('haoleilab-language', value);
    } catch {
      /* storage unavailable */
    }
  }, lang);
}

test.describe('first visit', () => {
  test('opens in Chinese when no preference exists', async ({ page }) => {
    await page.goto('/', { waitUntil: 'commit' });
    await expectRedirectedTo(page, '/zh/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('郝磊');
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hans');
  });

  test('keeps the requested path when it redirects', async ({ page }) => {
    await page.goto('/projects/wennian/', { waitUntil: 'commit' });
    await expectRedirectedTo(page, '/zh/projects/wennian/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('知身·问年');
  });

  test('a static asset path is never redirected', async ({ page }) => {
    const response = await page.goto('/404.html');
    expect(response?.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe('/404.html');
  });
});

test.describe('stored preference', () => {
  test('an English preference opens the English page and survives a reload', async ({ page }) => {
    await prefer(page, 'en');
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('HAO LEI');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    await page.reload();
    expect(new URL(page.url()).pathname).toBe('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('HAO LEI');
  });

  test('a Chinese preference does not bounce off a Chinese URL', async ({ page }) => {
    await prefer(page, 'zh');
    await page.goto('/zh/projects/hycell/');
    expect(new URL(page.url()).pathname).toBe('/zh/projects/hycell/');
  });
});

test.describe('switching language', () => {
  // Deliberately no `visit()` here: seeding from an init script would write the
  // same value the click is about to write, and the handler would go untested.
  test('Chinese → English keeps the page and stores the choice', async ({ page }) => {
    await page.goto('/zh/projects/wennian/');
    await page.getByRole('banner').getByRole('link', { name: /语言/ }).click();
    await waitForPath(page, '/projects/wennian/');

    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    expect(
      await page.evaluate(() => localStorage.getItem('haoleilab-language')),
    ).toBe('en');

    // The preference now decides a bare entry visit.
    await page.goto('/');
    expect(new URL(page.url()).pathname).toBe('/');
  });

  test('English → Chinese keeps the page and stores the choice', async ({ page }) => {
    await page.goto('/projects/morn/');
    await seedLocale(page, 'en');
    await page.goto('/projects/morn/');

    await page.getByRole('banner').getByRole('link', { name: /Language/ }).click();
    await waitForPath(page, '/zh/projects/morn/');

    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hans');
    expect(
      await page.evaluate(() => localStorage.getItem('haoleilab-language')),
    ).toBe('zh');

    await page.goto('/');
    expect(new URL(page.url()).pathname).toBe('/zh/');
  });

  test('the header marks the active locale and offers the other one', async ({ page }) => {
    await visit(page, '/');
    const cluster = page.getByRole('banner').locator('[data-lang-switch]').first();
    await expect(cluster).toHaveText('中文');

    await visit(page, '/zh/');
    const zhCluster = page.getByRole('banner').locator('[data-lang-switch]').first();
    await expect(zhCluster).toHaveText('EN');
  });
});

test.describe('seo is untouched by the preference', () => {
  test('canonical still matches the rendered page', async ({ page }) => {
    await visit(page, '/projects/wennian/');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://haoleilab.com/projects/wennian/',
    );

    await visit(page, '/zh/projects/wennian/');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://haoleilab.com/zh/projects/wennian/',
    );
  });

  test('both alternates and x-default are declared on either locale', async ({ page }) => {
    await visit(page, '/zh/');
    await expect(page.locator('link[hreflang="en"]')).toHaveCount(1);
    await expect(page.locator('link[hreflang="zh-Hans"]')).toHaveCount(1);
    await expect(page.locator('link[hreflang="x-default"]')).toHaveCount(1);
  });

  test('the bootstrap script is inline, so no English paints first', async ({ request }) => {
    const html = await (await request.get('/')).text();
    expect(html).toContain('haoleilab-language');
    const scriptAt = html.indexOf('haoleilab-language');
    const bodyAt = html.indexOf('<body');
    expect(scriptAt).toBeLessThan(bodyAt);
  });
});
