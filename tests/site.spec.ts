import { test, expect, type Page } from '@playwright/test';

const ROUTES = [
  '/',
  '/projects/',
  '/projects/wennian/',
  '/projects/hycell/',
  '/projects/taiyi-lingjing/',
  '/projects/pet-ai-health/',
  '/projects/pdig/',
  '/research/',
  '/about/',
  '/resume/',
  '/zh/',
  '/zh/projects/',
  '/zh/projects/wennian/',
  '/zh/research/',
  '/zh/about/',
  '/zh/resume/',
];

async function collectConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(String(err)));
  return errors;
}

test.describe('pages render', () => {
  for (const route of ROUTES) {
    test(`loads ${route}`, async ({ page }) => {
      const errors = await collectConsoleErrors(page);
      const response = await page.goto(route, { waitUntil: 'networkidle' });
      expect(response?.status()).toBe(200);
      await expect(page.locator('body')).toBeVisible();
      expect(errors, `console errors on ${route}`).toEqual([]);
    });
  }
});

test.describe('homepage', () => {
  test('shows hero identity and primary actions', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('HAO LEI');
    await expect(page.getByRole('link', { name: 'Explore Work' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Resume' }).first()).toBeVisible();
    await expect(page.locator('h2', { hasText: 'Selected Work' })).toBeVisible();
  });

  test('lists five featured projects', async ({ page }) => {
    await page.goto('/');
    const cards = page.locator('article.showcase');
    await expect(cards).toHaveCount(5);
  });

  test('hero diagram is exposed as an image with a label', async ({ page }) => {
    await page.goto('/');
    const diagram = page.locator('svg.diagram[role="img"]').first();
    await expect(diagram).toHaveAttribute('aria-label', /.+/);
  });
});

test.describe('projects', () => {
  test('filter narrows the grid without navigating', async ({ page }) => {
    await page.goto('/projects/');
    const cards = page.locator('article[data-groups]');
    await expect(cards).toHaveCount(5);

    await page.getByRole('button', { name: 'Infrastructure' }).click();
    await expect(page.locator('article[data-groups]:visible')).toHaveCount(1);
    await expect(page.locator('article[data-slug="pdig"]')).toBeVisible();

    await page.getByRole('button', { name: 'All' }).click();
    await expect(page.locator('article[data-groups]:visible')).toHaveCount(5);
  });

  test('case study renders its full structure', async ({ page }) => {
    await page.goto('/projects/wennian/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('WenNian');
    for (const heading of ['Overview', 'Problem', 'Architecture', 'Current Status', 'Next']) {
      await expect(page.locator('h2', { hasText: heading }).first()).toBeVisible();
    }
    const repoLink = page.getByRole('complementary').getByRole('link', { name: 'Repository' });
    await expect(repoLink).toHaveAttribute('href', 'https://github.com/huangdi97/WenNian');
  });

  test('projects without a verified repo show no repository link', async ({ page }) => {
    await page.goto('/projects/pdig/');
    await expect(page.getByRole('link', { name: /Repository/ })).toHaveCount(0);
    await expect(
      page.getByRole('complementary').getByText('No public repository'),
    ).toBeVisible();
  });
});

test.describe('evidence layer', () => {
  test('case study answers status, public code and reality on first screen', async ({ page }) => {
    await page.goto('/projects/wennian/');
    const meta = page.locator('.case-meta');

    await expect(meta.getByText('Public code')).toBeVisible();
    await expect(meta.getByText('Public repository')).toBeVisible();
    await expect(meta.getByText('Reality')).toBeVisible();
    await expect(meta.getByText(/Code, tests, UI, API and deployment files are public\./)).toBeVisible();
  });

  test('implementation status matrix and evidence panels render', async ({ page }) => {
    await page.goto('/projects/wennian/');
    const reality = page.locator('#reality');
    await expect(reality).toBeVisible();

    const badges = reality.locator('.state-badge');
    expect(await badges.count()).toBeGreaterThan(5);
    await expect(reality.locator('.state-badge[data-state="built"]').first()).toBeVisible();
    await expect(reality.locator('.state-badge[data-state="planned"]').first()).toBeVisible();

    // Every evidence panel must state where it came from.
    const panels = page.locator('figure.ev-panel');
    const panelCount = await panels.count();
    expect(panelCount).toBeGreaterThan(0);
    for (let i = 0; i < panelCount; i += 1) {
      await expect(panels.nth(i).locator('.ev-source-value')).not.toBeEmpty();
    }
  });

  test('a project without public code states that, and cites no repository artifact', async ({
    page,
  }) => {
    await page.goto('/projects/pdig/');
    await expect(page.locator('.case-meta').getByText('None — nothing published')).toBeVisible();
    await expect(page.locator('.state-badge[data-state="not-public"]').first()).toBeVisible();
    await expect(page.locator('figure.ev-panel .ev-source-value').first()).toBeVisible();
  });

  test('home page cards carry a reality status', async ({ page }) => {
    await page.goto('/');
    const pills = page.locator('.reality-pill');
    expect(await pills.count()).toBeGreaterThanOrEqual(3);
    await expect(pills.filter({ hasText: 'Open-source MVP' }).first()).toBeVisible();
  });

  test('open source strip shows checked-in license and update metadata', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Metadata snapshot')).toBeVisible();
    await expect(page.locator('.oss-fact-k').first()).toBeVisible();
    // WenNian has no detected LICENSE file — shown as a fact, not hidden.
    await expect(page.getByText('No license detected').first()).toBeVisible();
  });
});

test.describe('language switching', () => {
  test('keeps the current project page when switching to Chinese', async ({ page }) => {
      await page.goto('/projects/wennian/');
      await page.getByRole('banner').getByRole('link', { name: /Language/ }).click();
    await page.waitForURL('**/zh/projects/wennian/**');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('WenNian');
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hans');
  });

  test('switches from the Chinese project page back to English', async ({ page }) => {
      await page.goto('/zh/projects/hycell/');
      await page.getByRole('banner').getByRole('link', { name: /语言/ }).click();
    await page.waitForURL('**/projects/hycell/**');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});

test.describe('mobile', () => {
  test('hamburger opens and closes the navigation', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'mobile-only');
    await page.goto('/');
    const toggle = page.locator('[data-nav-toggle]');
    await expect(toggle).toBeVisible();

    await toggle.click();
    const panel = page.locator('#mobile-nav');
    await expect(panel).toHaveAttribute('aria-hidden', 'false');
    await expect(panel.getByRole('link', { name: 'Research' })).toBeVisible();

    await page.locator('[data-nav-close]').click();
    await expect(panel).toHaveAttribute('aria-hidden', 'true');
  });
});

test.describe('layout integrity', () => {
  for (const width of [375, 390, 430, 768, 1024, 1280, 1920]) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const route of ['/', '/projects/', '/projects/wennian/', '/resume/', '/zh/']) {
        await page.goto(route);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth,
        );
        expect(overflow, `overflow on ${route} at ${width}px`).toBeLessThanOrEqual(1);
      }
    });
  }
});

test.describe('resume', () => {
  test('exposes a print action and all verifiable sections', async ({ page }) => {
    await page.goto('/resume/');
    await expect(page.getByRole('button', { name: /Print \/ Save as PDF/ })).toBeVisible();
    for (const section of [
      'Profile',
      'Focus',
      'Selected Projects',
      'Technical Areas',
      'Open Source',
      'Contact',
    ]) {
      await expect(page.locator('h2', { hasText: section })).toBeVisible();
    }

    // Education is hidden until verified data is supplied — it must never be
    // rendered as a visitor-facing placeholder.
    await expect(page.locator('h2', { hasText: 'Education' })).toHaveCount(0);
    await expect(page.getByText(/no verified record/i)).toHaveCount(0);
  });

  test('shows no PDF download button while no real PDF exists', async ({ page }) => {
    await page.goto('/resume/');
    await expect(page.getByRole('link', { name: /Download PDF/ })).toHaveCount(0);
  });
});

test.describe('404', () => {
  test('renders the designed not-found page', async ({ page }) => {
    await page.goto('/404.html');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('404');
    await expect(page.getByText('This page drifted outside the system.')).toBeVisible();
    await expect(page.getByRole('link', { name: /Back Home/ })).toBeVisible();
  });
});

test.describe('links', () => {
  test('external links open safely in a new tab', async ({ page }) => {
    await page.goto('/');
    const external = page.locator('a[href^="https://github.com"]').first();
    await expect(external).toHaveAttribute('target', '_blank');
    await expect(external).toHaveAttribute('rel', /noopener/);
  });
});

test.describe('seo', () => {
  test('home declares canonical and hreflang alternates', async ({ page }) => {
    await page.goto('/');
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toBe('https://haoleilab.com/');
    await expect(page.locator('link[hreflang="en"]')).toHaveCount(1);
    await expect(page.locator('link[hreflang="zh-Hans"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
    await expect(page.locator('script[type="application/ld+json"]')).not.toHaveCount(0);
  });
});
