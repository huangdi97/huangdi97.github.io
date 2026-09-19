import { test, expect, type Page } from '@playwright/test';
import { visit, waitForPath } from './helpers';

const ROUTES = [
  '/',
  '/projects/',
  '/projects/wennian/',
  '/projects/hycell/',
  '/projects/morn/',
  '/projects/biopulse/',
  '/projects/taiyi-lingjing/',
  '/projects/pet-ai-health/',
  '/projects/pdig/',
  '/research/',
  '/about/',
  '/resume/',
  '/zh/',
  '/zh/projects/',
  '/zh/projects/wennian/',
  '/zh/projects/hycell/',
  '/zh/projects/morn/',
  '/zh/projects/biopulse/',
  '/zh/projects/taiyi-lingjing/',
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
      const response = await visit(page, route, { waitUntil: 'networkidle' });
      expect(response?.status()).toBe(200);
      await expect(page.locator('body')).toBeVisible();
      expect(errors, `console errors on ${route}`).toEqual([]);
    });
  }
});

test.describe('homepage', () => {
  test('shows hero identity and primary actions', async ({ page }) => {
    await visit(page, '/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('HAO LEI');
    await expect(page.getByRole('link', { name: 'Explore Work' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Resume' }).first()).toBeVisible();
    await expect(page.locator('h2', { hasText: 'Selected Work' })).toBeVisible();
  });

  test('hero keeps the AI × Life Science × Agents line', async ({ page }) => {
    await visit(page, '/');
    await expect(page.locator('.hero-sub')).toContainText('AI × Life Science × Agents');
  });

  test('lists exactly four featured projects, in the confirmed order', async ({ page }) => {
    await visit(page, '/');
    const cards = page.locator('[data-mosaic-card]');
    await expect(cards).toHaveCount(4);

    const titles = await cards.locator('h3 a').allInnerTexts();
    expect(titles.map((title) => title.trim())).toEqual([
      'ZhiShen · WenNian',
      'HyCell',
      'Morn',
      'BioPulse',
    ]);
  });

  test('selected work never features TaiYi or PDIG', async ({ page }) => {
    await visit(page, '/');
    const mosaic = page.locator('.mosaic');
    await expect(mosaic.getByText('TaiYi Lingjing')).toHaveCount(0);
    await expect(mosaic.getByRole('link', { name: /TaiYi/ })).toHaveCount(0);
    // PDIG keeps its full case study under /projects; the homepage carries four.
    await expect(mosaic.getByRole('link', { name: /PDIG/ })).toHaveCount(0);
  });

  /**
   * v1.7 prototype: a homepage card identifies a project, it does not explain
   * one. Each card carries a name, one line of type, a labelled illustration,
   * one reality status and one case link — and none of the apparatus v1.6
   * stacked on top of that.
   */
  test('each mosaic card identifies the project and nothing more', async ({ page }) => {
    await visit(page, '/');
    const cards = page.locator('[data-mosaic-card]');
    await expect(cards).toHaveCount(4);

    for (const slug of ['wennian', 'hycell', 'morn', 'biopulse']) {
      const card = page.locator(`[data-mosaic-slug="${slug}"]`);
      await expect(card).toHaveCount(1);
      await expect(card.locator('.card-name')).toBeVisible();
      await expect(card.locator('.card-type')).toBeVisible();
      await expect(card.locator('.card-status')).toBeVisible();
      await expect(card.locator('.card-link')).toBeVisible();

      // The illustration carries meaning now, so it is a labelled image.
      const visual = card.locator('[data-mosaic-visual] svg');
      await expect(visual).toHaveAttribute('role', 'img');
      await expect(visual).toHaveAttribute('aria-label', /.{12,}/);

      // Removed in v1.7.
      await expect(card.locator('[data-cover-caps]')).toHaveCount(0);
      await expect(card.locator('[data-proof]')).toHaveCount(0);
      await expect(card.locator('.tag')).toHaveCount(0);
    }
  });

  /**
   * The v1.7 prototype, as a test. Four content areas; every block that left
   * the homepage still exists on the site, and none of it may creep back.
   */
  test('homepage is reduced to four content areas', async ({ page }) => {
    await visit(page, '/');

    // Hero · Selected Work · Math × Bio × AI · About/Contact
    await expect(page.locator('main > section')).toHaveCount(4);

    // Removed from the homepage, relocated to a sub-page.
    await expect(page.locator('#artifacts')).toHaveCount(0); // → /projects
    await expect(page.locator('section[aria-labelledby="now-label"]')).toHaveCount(0); // → /projects
    await expect(page.locator('.oss-list')).toHaveCount(0); // → /projects
    await expect(page.locator('ol.bt')).toHaveCount(0); // → /about
    await expect(page.locator('ol.rail')).toHaveCount(0); // → /about
    await expect(page.locator('aside.eq')).toHaveCount(0); // → /research

    // Hidden for the prototype: the component and its data are untouched.
    await expect(page.locator('.rn-list')).toHaveCount(0);
  });

  test('the hero is words and canvas, with no system figure', async ({ page }) => {
    await visit(page, '/');

    const hero = page.locator('.hero');
    await expect(hero.getByRole('heading', { level: 1 })).toContainText('HAO LEI');
    await expect(hero.locator('.hero-sub')).toContainText('AI × Life Science × Agents');
    await expect(hero.getByRole('link', { name: 'Explore Work' })).toBeVisible();

    // The bordered system diagram is gone from the homepage.
    await expect(hero.locator('.hero-system')).toHaveCount(0);
    await expect(hero.locator('.hero-field')).toHaveCount(0);

    // The copy occupies the left half; the rest of the first screen is canvas.
    const copy = await hero.locator('.hero-copy').boundingBox();
    expect(copy?.width ?? 0).toBeLessThan(1440 * 0.55);

    // 75–88vh, not a full screen.
    const height = (await hero.boundingBox())?.height ?? 0;
    expect(height).toBeGreaterThan(900 * 0.6);
    expect(height).toBeLessThan(900 * 0.95);
  });

  test('the statement band is one breath, not a research section', async ({ page }) => {
    await visit(page, '/');
    const band = page.locator('#mathbio');
    await expect(band).toBeVisible();

    // The eyebrow carries the title; there is no heading and no figure.
    await expect(band).toContainText('Mathematics × Biology × AI');
    await expect(band.locator('svg')).toHaveCount(0);
    await expect(band.locator('math')).toHaveCount(1);
    await expect(band.locator('.mb-q')).toHaveCount(0);
    await expect(band.getByRole('link', { name: /research directions/i })).toBeVisible();

    const height = (await band.boundingBox())?.height ?? 0;
    expect(height, 'statement band height').toBeGreaterThanOrEqual(260);
    expect(height, 'statement band height').toBeLessThanOrEqual(460);
  });

  test('homepage contact band carries name, positioning line and contact links', async ({
    page,
  }) => {
    await visit(page, '/');
    const band = page.locator('#contact');

    await expect(band).toContainText('About / Contact');
    await expect(band).toContainText('Hao Lei');
    await expect(band).toContainText(
      'AI systems and agents, with a life-science and computational biology background.',
    );

    // Order is fixed by the shared contact data: Gmail → QQ → GitHub → Resume.
    const ids = await band
      .locator('[data-contact-id]')
      .evaluateAll((nodes) => nodes.map((n) => (n as HTMLElement).dataset.contactId ?? ''));
    expect(ids).toEqual(['gmail', 'qq', 'github', 'resume']);

    await expect(band.locator('a[href^="mailto:"]')).toHaveCount(2);
    await expect(band.locator('[data-contact-id="github"]')).toHaveAttribute(
      'href',
      'https://github.com/huangdi97',
    );
    await expect(band.locator('[data-contact-id="resume"]')).toHaveAttribute('href', '/resume/');

    // No CTA card: the band is part of the page, not a surface laid over it.
    const background = await band.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(background).toBe('rgba(0, 0, 0, 0)');
  });

  test('the background field is present on the homepage', async ({ page }) => {
    await visit(page, '/');
    const canvas = page.locator('[data-global-scientific-canvas]');
    await expect(canvas).toHaveCount(1);
    await expect(canvas).toHaveAttribute('aria-hidden', 'true');
  });

  test('research is split into active and concept tiers on /research', async ({ page }) => {
    await visit(page, '/research/');
    await expect(page.getByText('Active / Building')).toBeVisible();
    await expect(page.getByText('Concepts / Exploring')).toBeVisible();

    const concepts = page.locator('.research-tier').nth(1);
    await expect(concepts).toContainText('AI for Scientific Discovery');
    await expect(concepts).toContainText('Concept / Not Started');
    await expect(concepts.getByRole('link', { name: /TaiYi Lingjing/ })).toBeVisible();
  });

  test('TaiYi case study states that implementation has not started', async ({ page }) => {
    await visit(page, '/projects/taiyi-lingjing/');
    const body = page.locator('main');

    await expect(page.getByRole('heading', { level: 1 })).toContainText('TaiYi Lingjing');
    await expect(body).toContainText('not started');
    await expect(page.locator('.case-meta')).toContainText('Concept / Not Started');

    // No claim that any part of it has been built.
    for (const banned of [
      'partial implementation',
      'prototype implementation',
      'implemented subsystem',
      'working prototype',
      'validated architecture',
      'research prototype',
      'lessons learned from implementation',
    ]) {
      await expect(body, `banned phrase: ${banned}`).not.toContainText(new RegExp(banned, 'i'));
    }

    // The banned word list must also hold in Chinese.
    await visit(page, '/zh/projects/taiyi-lingjing/');
    const zhBody = page.locator('main');
    await expect(zhBody).toContainText('尚未开始');
    await expect(zhBody).not.toContainText(/部分实现|已完成实现|系统已经实现/);
  });

  test('TaiYi evidence table never uses PARTIAL', async ({ page }) => {
    await visit(page, '/projects/taiyi-lingjing/');
    await expect(page.locator('#reality')).toBeVisible();
    await expect(page.locator('.state-badge[data-state="partial"]')).toHaveCount(0);
    await expect(page.locator('.state-badge[data-state="planned"]').first()).toBeVisible();
  });


  test('every project illustration is exposed as a labelled image', async ({ page }) => {
    await visit(page, '/');
    const visuals = page.locator('[data-mosaic-visual] svg[role="img"]');
    await expect(visuals).toHaveCount(4);
    const count = await visuals.count();
    for (let i = 0; i < count; i += 1) {
      await expect(visuals.nth(i)).toHaveAttribute('aria-label', /.{12,}/);
    }
  });
});

test.describe('projects', () => {
  test('filter narrows the grid without navigating', async ({ page }) => {
    await visit(page, '/projects/');
    const cards = page.locator('article[data-groups]');
    await expect(cards).toHaveCount(7);

    await page.getByRole('button', { name: 'Infrastructure' }).click();
    await expect(page.locator('article[data-groups]:visible')).toHaveCount(2);
    await expect(page.locator('article[data-slug="pdig"]')).toBeVisible();
    await expect(page.locator('article[data-slug="morn"]')).toBeVisible();

    await page.getByRole('button', { name: 'All' }).click();
    await expect(page.locator('article[data-groups]:visible')).toHaveCount(7);
  });

  test('case study renders its full structure', async ({ page }) => {
    await visit(page, '/projects/wennian/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('ZhiShen · WenNian');
    for (const heading of ['Overview', 'Problem', 'Architecture', 'Current Status', 'Next']) {
      await expect(page.locator('h2', { hasText: heading }).first()).toBeVisible();
    }
    const repoLink = page.getByRole('complementary').getByRole('link', { name: 'Repository' });
    await expect(repoLink).toHaveAttribute('href', 'https://github.com/huangdi97/WenNian');
  });

  test('projects without a verified repo show no repository link', async ({ page }) => {
    await visit(page, '/projects/pdig/');
    await expect(page.getByRole('link', { name: /Repository/ })).toHaveCount(0);
    await expect(
      page.getByRole('complementary').getByText('No public repository'),
    ).toBeVisible();
  });
});

test.describe('evidence layer', () => {
  test('case study answers status, public code and reality on first screen', async ({ page }) => {
    await visit(page, '/projects/wennian/');
    const meta = page.locator('.case-meta');

    await expect(meta.getByText('Public code')).toBeVisible();
    await expect(meta.getByText('Public repository')).toBeVisible();
    await expect(meta.getByText('Reality')).toBeVisible();
    await expect(meta.getByText(/Code, tests, UI, API and deployment files are public\./)).toBeVisible();
  });

  test('implementation status matrix and evidence panels render', async ({ page }) => {
    await visit(page, '/projects/wennian/');
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
    await visit(page, '/projects/pdig/');
    await expect(page.locator('.case-meta').getByText('None — nothing published')).toBeVisible();
    await expect(page.locator('.state-badge[data-state="not-public"]').first()).toBeVisible();
    await expect(page.locator('figure.ev-panel .ev-source-value').first()).toBeVisible();
  });

  test('home page cards carry a reality status', async ({ page }) => {
    await visit(page, '/');
    /* v1.7: the mosaic states each project's reality once, in words, from the
       evidence layer — no pill, no second code label, no trailing status word.
       ZhiShen reads "Open-source MVP"; every card carries a headline. */
    const statuses = page.locator('[data-mosaic-card] .card-status');
    await expect(statuses).toHaveCount(4);
    await expect(page.locator('[data-mosaic-slug="wennian"] .card-status')).toContainText(
      'Open-source MVP',
    );
    // The public-code fact is stated once, beside the headline, not twice.
    await expect(statuses.first()).toContainText('Public repository');
  });

  test('open source table shows checked-in license and update metadata on /projects', async ({
    page,
  }) => {
    // v1.6 moved the repository table off the homepage. It is evidence, and
    // evidence lives beside the case studies.
    await visit(page, '/projects/');
    await expect(page.getByText('Metadata snapshot')).toBeVisible();
    await expect(page.locator('.oss-fact-k').first()).toBeVisible();
    // WenNian has no detected LICENSE file — shown as a fact, not hidden.
    await expect(page.getByText('No license detected').first()).toBeVisible();
  });
});

test.describe('language switching', () => {
  test('keeps the current project page when switching to Chinese', async ({ page }) => {
      await visit(page, '/projects/wennian/');
      await page.getByRole('banner').getByRole('link', { name: /Language/ }).click();
    await waitForPath(page, '/zh/projects/wennian/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('知身·问年');
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hans');
  });

  test('switches from the Chinese project page back to English', async ({ page }) => {
      await visit(page, '/zh/projects/hycell/');
      await page.getByRole('banner').getByRole('link', { name: /语言/ }).click();
    await waitForPath(page, '/projects/hycell/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});

test.describe('mobile', () => {
  test('hamburger opens and closes the navigation', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'mobile-only');
    await visit(page, '/');
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
        await visit(page, route);
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
    await visit(page, '/resume/');
    await expect(page.getByRole('button', { name: /Print \/ Save as PDF/ })).toBeVisible();
    for (const section of [
      'Profile',
      'Focus',
      'Experience',
      'Education',
      'Research Experience',
      'Research Output',
      'Selected Projects',
      'Technical Areas',
      'Open Source',
      'Contact',
    ]) {
      // Exact name — "Experience" must not be satisfied by "Research Experience".
      await expect(page.getByRole('heading', { level: 2, name: section, exact: true })).toBeVisible();
    }

    // The record is complete — the page no longer carries a "pending" notice.
    await expect(page.getByText(/no verified record|unverified/i)).toHaveCount(0);
  });

  test('selected projects exclude TaiYi and include Morn and BioPulse', async ({ page }) => {
    await visit(page, '/resume/');
    const projects = page.locator('[data-resume-section="projects"]');
    await expect(projects).toBeVisible();
    await expect(projects).not.toContainText('TaiYi');
    await expect(projects).not.toContainText('太一');
    for (const name of ['ZhiShen · WenNian', 'HyCell', 'Morn', 'BioPulse']) {
      await expect(projects.getByRole('link', { name, exact: true })).toBeVisible();
    }
  });

  test('Chinese resume selected projects carry the same correction', async ({ page }) => {
    await visit(page, '/zh/resume/');
    const projects = page.locator('[data-resume-section="projects"]');
    await expect(projects).not.toContainText('太一');
    for (const name of ['知身·问年', 'HyCell', 'Morn', 'BioPulse']) {
      await expect(projects.getByRole('link', { name, exact: true })).toBeVisible();
    }
  });

  test('only offers downloads for PDFs that resolve', async ({ page }) => {
    await visit(page, '/resume/');
    const downloads = page.locator('a[data-resume-pdf]');
    const count = await downloads.count();
    for (let i = 0; i < count; i += 1) {
      const href = await downloads.nth(i).getAttribute('href');
      const response = await page.request.get(href as string);
      expect(response.status(), `dead download link: ${href}`).toBe(200);
    }
  });
});

test.describe('404', () => {
  test('renders the designed not-found page', async ({ page }) => {
    await visit(page, '/404.html');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('404');
    await expect(page.getByText('This page drifted outside the system.')).toBeVisible();
    await expect(page.getByRole('link', { name: /Back Home/ })).toBeVisible();
  });
});

test.describe('links', () => {
  test('external links open safely in a new tab', async ({ page }) => {
    await visit(page, '/');
    const external = page.locator('a[href^="https://github.com"]').first();
    await expect(external).toHaveAttribute('target', '_blank');
    await expect(external).toHaveAttribute('rel', /noopener/);
  });
});

test.describe('seo', () => {
  test('home declares canonical and hreflang alternates', async ({ page }) => {
    await visit(page, '/');
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toBe('https://haoleilab.com/');
    await expect(page.locator('link[hreflang="en"]')).toHaveCount(1);
    await expect(page.locator('link[hreflang="zh-Hans"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
    await expect(page.locator('script[type="application/ld+json"]')).not.toHaveCount(0);
  });
});
