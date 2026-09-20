import { test, expect, type Locator, type Page } from '@playwright/test';
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

/**
 * The homepage artwork has two possible sources, and the contract is the same
 * for both (§50):
 *
 *   · placeholder — the inlined drawing, an `<svg role="img" aria-label>`;
 *   · official asset — the owner's WebP, an `<img alt>`.
 *
 * Asserting on `svg` alone would make this suite pass only while the five real
 * files are missing, and start failing the moment they are integrated — which is
 * exactly backwards. So the assertion is on the invariant, not the tag.
 */
async function expectArtworkLabelled(art: Locator) {
  const svg = art.locator('svg[role="img"]');
  const img = art.locator('img');

  if ((await img.count()) > 0) {
    await expect(img).toHaveAttribute('alt', /.{12,}/);
    // §49: the intrinsic size has to be declared, or the layout shifts as the
    // image decodes.
    await expect(img).toHaveAttribute('width', /\d+/);
    await expect(img).toHaveAttribute('height', /\d+/);
    return;
  }

  await expect(svg).toHaveCount(1);
  await expect(svg).toHaveAttribute('role', 'img');
  await expect(svg).toHaveAttribute('aria-label', /.{12,}/);
}

/** Every artwork on the homepage, whichever source is active. */
const ARTWORK_SELECTOR = 'main [data-artwork] :is(svg[role="img"], img)';

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
    await expect(page.locator('.hero-role')).toContainText('AI × Life Science × Agents');
  });

  test('lists exactly four featured projects, in the confirmed order', async ({ page }) => {
    await visit(page, '/');
    const cards = page.locator('[data-featured-row]');
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
    const mosaic = page.locator('#work');
    await expect(mosaic.getByText('TaiYi Lingjing')).toHaveCount(0);
    await expect(mosaic.getByRole('link', { name: /TaiYi/ })).toHaveCount(0);
    // PDIG keeps its full case study under /projects; the homepage carries four.
    await expect(mosaic.getByRole('link', { name: /PDIG/ })).toHaveCount(0);
  });

  /**
   * v2.0 (§13–§14): a homepage row shows a project, it does not explain one.
   * Each row carries a name, one line of positioning, one status, one project
   * link and a labelled drawing — and none of the apparatus a card used to
   * stack on top of that.
   *
   * v2.1 (§7–§8) renamed the type line: the row no longer prints a project
   * *type* plus a sentence about how the project works. It prints exactly one
   * line, the project's own `publicLine`, which /projects prints too.
   */
  test('each featured row shows the project and nothing more', async ({ page }) => {
    await visit(page, '/');
    const rows = page.locator('[data-featured-row]');
    await expect(rows).toHaveCount(4);

    for (const slug of ['wennian', 'hycell', 'morn', 'biopulse']) {
      const row = page.locator(`[data-featured-row][data-slug="${slug}"]`);
      await expect(row).toHaveCount(1);
      await expect(row.locator('.row-name')).toBeVisible();
      await expect(row.locator('.row-position')).toBeVisible();
      await expect(row.locator('.row-status')).toHaveCount(1);
      await expect(row.locator('.row-status')).toBeVisible();
      await expect(row.locator('.row-link')).toBeVisible();

      // The artwork carries meaning, so it is a labelled image.
      await expectArtworkLabelled(row.locator('[data-artwork]'));

      // Removed in v2.0: the card shell and everything that came with it.
      await expect(row.locator('[data-mosaic-card]')).toHaveCount(0);
      await expect(row.locator('.card-eyebrow')).toHaveCount(0);
      await expect(row.locator('.card-index')).toHaveCount(0);
      await expect(row.locator('.card-keywords')).toHaveCount(0);
      await expect(row.locator('[data-cover-caps]')).toHaveCount(0);
      await expect(row.locator('[data-proof]')).toHaveCount(0);
      await expect(row.locator('.tag')).toHaveCount(0);
    }
  });

  /**
   * The four rows alternate sides (§11) without becoming four different
   * heights, and each one stays inside the 360–520px band the brief sets (§12).
   */
  test('the four featured rows alternate sides at a consistent height', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'desktop-only: the row grid is a wide layout');
    await visit(page, '/');
    await page.locator('#work').scrollIntoViewIfNeeded();

    const rows = page.locator('[data-featured-row]');
    const heights: number[] = [];
    const sides: string[] = [];

    for (let i = 0; i < 4; i += 1) {
      const row = rows.nth(i);
      const box = await row.boundingBox();
      heights.push(box?.height ?? 0);

      const art = await row.locator('.row-art').boundingBox();
      // Which side the drawing sits on, relative to the row's own centre.
      const centre = (box?.x ?? 0) + (box?.width ?? 0) / 2;
      sides.push((art?.x ?? 0) + (art?.width ?? 0) / 2 < centre ? 'left' : 'right');
    }

    expect(sides).toEqual(['left', 'right', 'left', 'right']);
    for (const [i, height] of heights.entries()) {
      expect(height, `row #${i + 1} height`).toBeGreaterThanOrEqual(340);
      expect(height, `row #${i + 1} height`).toBeLessThanOrEqual(540);
    }
  });

  /**
   * The v2.0-P1 homepage, as a test. Three content areas, not four: §32 of the
   * brief removes the Mathematics × Biology × AI band from the homepage, so the
   * page now closes straight from the work to the contact band (§34). Every
   * block that left the homepage still exists somewhere on the site, and none of
   * it may creep back.
   */
  test('homepage is reduced to three content areas', async ({ page }) => {
    await visit(page, '/');

    // Hero · Featured Projects · Contact
    await expect(page.locator('main > section')).toHaveCount(3);

    // Removed from the homepage, relocated to a sub-page.
    await expect(page.locator('#mathbio')).toHaveCount(0); // → /research
    await expect(page.locator('#artifacts')).toHaveCount(0); // → /projects
    await expect(page.locator('section[aria-labelledby="now-label"]')).toHaveCount(0); // → /projects
    await expect(page.locator('.oss-list')).toHaveCount(0); // → /projects
    await expect(page.locator('ol.bt')).toHaveCount(0); // → /about
    await expect(page.locator('ol.rail')).toHaveCount(0); // → /about
    await expect(page.locator('aside.eq')).toHaveCount(0); // → /research

    // The band's own copy is gone too — no eyebrow, no state-transition
    // expression, no research CTA left behind on the homepage (§37).
    await expect(page.getByText('Mathematics × Biology × AI')).toHaveCount(0);
    await expect(page.locator('main math')).toHaveCount(0);

    // Hidden for the prototype: the component and its data are untouched.
    await expect(page.locator('.rn-list')).toHaveCount(0);
  });

  /**
   * §22–§28: /research is a page of questions, not a statement of method. In
   * v1.6 it carried the directions *and* a complete mathematical-biology figure
   * set, a standalone conceptual equation and the full lab-note log. v2.1 keeps
   * the directions, the two tiers and the notes — and nothing that answers "how
   * would you build this".
   *
   * v2.2.1 (§18) removes one more thing: the sentence that announced how many
   * directions there are and explained why the page does not open them up. A
   * visitor needs neither. The list is still a list; what is gone is the page
   * telling the reader how to read it.
   */
  test('research states its directions as questions, and never counts them', async ({ page }) => {
    await visit(page, '/research/');

    // The page artwork is still there and still labelled like every other
    // drawing on the site — demoted to an accent (§19–§21), not removed.
    await expectArtworkLabelled(page.locator('[data-artwork="research"]'));

    // The directions are still one paragraph each. The count is a structural
    // fact this suite is allowed to know; what the page may not do is state it.
    const areas = page.locator('.research-area');
    const areaCount = await areas.count();
    expect(areaCount, 'the direction list still renders').toBeGreaterThan(0);
    await expect(page.locator('.research-area .area-summary')).toHaveCount(areaCount);

    /* §18: neither the count nor the explanation of method may appear in the
       rendered copy. Both locales are listed because the English route is the
       one under test and the Chinese page shares the same component. */
    const copy = await page.locator('main').innerText();
    for (const phrase of [
      '五个方向',
      '五个持续投入的方向',
      '不展开方法',
      'Five directions',
      'five directions',
      'Five research directions',
    ]) {
      expect(copy, `"${phrase}" must not be stated on the page`).not.toContain(phrase);
    }

    // The figure set, the interest lists and the standalone equation are gone.
    await expect(page.locator('.area-list')).toHaveCount(0);
    await expect(page.locator('#mathbio')).toHaveCount(0);
    await expect(page.locator('aside.eq')).toHaveCount(0);
    await expect(page.locator('main math')).toHaveCount(0);
  });

  /**
   * v2.0 (§5, §8): the hero is the name, then one complete artwork. It is not a
   * text column beside a bordered system figure, and it is not a text column
   * over a page-wide field either — both of those are what the reset removes.
   */
  test('the hero is the name and one artwork, with no system figure', async ({ page }) => {
    await visit(page, '/');

    const hero = page.locator('.hero');
    await expect(hero.getByRole('heading', { level: 1 })).toContainText('HAO LEI');
    await expect(hero.locator('.hero-role')).toContainText('AI × Life Science × Agents');
    await expect(hero.getByRole('link', { name: 'Explore Work' })).toBeVisible();

    // Exactly one drawing, and it is the hero artwork.
    await expect(hero.locator('[data-artwork]')).toHaveCount(1);
    await expect(hero.locator('[data-artwork="hero"]')).toHaveCount(1);
    await expectArtworkLabelled(hero.locator('[data-artwork="hero"]'));

    // The figures and the page-wide canvas are gone from the homepage.
    await expect(hero.locator('.hero-system')).toHaveCount(0);
    await expect(hero.locator('.hero-field')).toHaveCount(0);
    await expect(page.locator('[data-global-scientific-canvas]')).toHaveCount(0);
  });

  /**
   * The composition itself: words on the left, the drawing taking the rest, and
   * a first screen that is 76vh rather than a full one. This is the wide layout
   * only — below 900px the hero stacks, with the drawing under the words — so it
   * is asserted where that layout actually exists.
   */
  test('the hero splits into copy and drawing on wide screens', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'desktop-only: the hero is two columns above 900px');
    await visit(page, '/');

    const hero = page.locator('.hero');

    // The copy occupies the left half; the drawing takes the rest.
    const copy = await hero.locator('.hero-copy').boundingBox();
    const artBox = await hero.locator('.hero-art').boundingBox();
    expect(copy?.width ?? 0).toBeLessThan(1440 * 0.55);
    expect((copy?.x ?? 0) + (copy?.width ?? 0)).toBeLessThan(artBox?.x ?? 0);

    // 76vh, not a full screen.
    const height = (await hero.boundingBox())?.height ?? 0;
    expect(height).toBeGreaterThan(900 * 0.6);
    expect(height).toBeLessThan(900 * 0.95);
  });

  /**
   * v2.0 (§29): the close is a name, one positioning line and four links. No
   * eyebrow, no card, no second content block.
   */
  test('homepage contact band carries name, positioning line and contact links', async ({
    page,
  }) => {
    await visit(page, '/');
    const band = page.locator('#contact');

    await expect(band).toContainText('Hao Lei');
    await expect(band).toContainText('Life Science × Computational Biology × AI Systems');
    await expect(band.locator('.eyebrow')).toHaveCount(0);

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

  /**
   * v2.2 (§33–§34): the homepage mounts the editorial background, and still
   * does not mount the v1.7 page-wide canvas — which is retired site-wide now,
   * not just here. Its visual work is the background plus one hero artwork and
   * four project drawings.
   */
  test('the homepage carries its own drawings and the editorial background', async ({ page }) => {
    await visit(page, '/');
    await expect(page.locator('[data-global-scientific-canvas]')).toHaveCount(0);
    await expect(page.locator('[data-editorial-background]')).toHaveCount(1);

    const drawings = page.locator(ARTWORK_SELECTOR);
    await expect(drawings).toHaveCount(5);
    const slugs = await page
      .locator('main [data-artwork]')
      .evaluateAll((nodes) => nodes.map((n) => (n as HTMLElement).dataset.artwork ?? ''));
    expect([...new Set(slugs)]).toEqual(['hero', 'wennian', 'hycell', 'morn', 'biopulse']);
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


  test('every project drawing is exposed as a labelled image', async ({ page }) => {
    await visit(page, '/');
    const rows = page.locator('[data-featured-row]');
    await expect(rows).toHaveCount(4);
    for (let i = 0; i < 4; i += 1) {
      await expectArtworkLabelled(rows.nth(i).locator('[data-artwork]'));
    }
  });
});

test.describe('projects', () => {
  /**
   * §33–§36: /projects is a curated directory, not a filterable catalogue. Each
   * entry carries an image, a name, one positioning line, one status and one
   * link — and there is no filter bar.
   *
   * v2.2.1 removes the public introduction the entry used to print (§35). The
   * longer description is not deleted from the content collection — it lives on
   * the project's own case page, which is where a reader who wants it has
   * already decided to go.
   */
  test('is a curated directory of entries, with no filter bar', async ({ page }) => {
    await visit(page, '/projects/');

    const entries = page.locator('[data-project-entry]');
    await expect(entries).toHaveCount(4);

    for (const slug of ['wennian', 'hycell', 'morn', 'biopulse']) {
      const entry = page.locator(`[data-project-entry][data-slug="${slug}"]`);
      await expect(entry).toHaveCount(1);
      await expect(entry.locator('.entry-name')).toBeVisible();
      await expect(entry.locator('.entry-line')).toBeVisible();
      await expect(entry.locator('.entry-intro')).toHaveCount(0); // §35
      await expect(entry.locator('.entry-status')).toHaveCount(1);
      await expect(entry.getByRole('link', { name: /View project/ })).toBeVisible();
      await expectArtworkLabelled(entry.locator('[data-artwork]'));
    }

    // The filter bar and the card grid are gone, and no card apparatus remains.
    await expect(page.getByRole('button', { name: 'Infrastructure' })).toHaveCount(0);
    await expect(page.locator('article[data-groups]')).toHaveCount(0);
    await expect(page.locator('[data-cover]')).toHaveCount(0);
    await expect(page.locator('[data-cover-caps]')).toHaveCount(0);

    /* Only the four projects with a real artwork get an entry. */
    await expect(page.locator('[data-project-entry] [data-artwork]')).toHaveCount(4);

    /* §39–§41: the three unfinished projects are hidden from this page rather
       than deleted from the content collection. §44: the inverted evidence room
       is gone, and what replaced it is one line of text, at most. */
    await expect(page.locator('.other-list li')).toHaveCount(0);
    await expect(page.locator('[data-artifact]')).toHaveCount(0);
    await expect(page.locator('.artifact-room')).toHaveCount(0);
    await expect(page.locator('.work-exit')).toHaveCount(1);
  });

  test('case study renders its public structure', async ({ page }) => {
    await visit(page, '/projects/wennian/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('ZhiShen · WenNian');
    for (const heading of [
      'What it is',
      'Why it matters',
      'Current public status',
      'What is publicly available',
    ]) {
      await expect(page.locator('h2', { hasText: heading }).first()).toBeVisible();
    }
    const repoLink = page.locator('.case-actions').getByRole('link', { name: 'Repository' });
    await expect(repoLink).toHaveAttribute('href', 'https://github.com/huangdi97/WenNian');
  });

  test('projects without a verified repo show no repository link', async ({ page }) => {
    await visit(page, '/projects/pdig/');
    await expect(page.locator('.case-actions').getByRole('link', { name: /Repository/ })).toHaveCount(
      0,
    );
    await expect(page.locator('.case-no-repo')).toBeVisible();
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

  test('home page rows carry one reality status each', async ({ page }) => {
    await visit(page, '/');
    /* v2.0 (§14): each row states the project once, in words — exactly one line.
       No pill, no second code label, no trailing status word, no proof line.

       The wording is the owner's, fixed by §21–§24 of the P1 brief rather than
       read straight out of `evidence.headline`. ZhiShen · WenNian was corrected
       so that it opens with the canonical evidence wording instead of a
       paraphrase of it — the headline leads and the second clause is
       `evidence.proof[2]`. HyCell is title-cased relative to its headline. Morn
       and BioPulse are the public-code fact, unchanged.
       `evidence.ts` itself is untouched (§57); this is a homepage presentation
       choice, and `HOME_STATUS_TEXT` falls back to the evidence layer for any
       slug it does not list. */
    const statuses = page.locator('[data-featured-row] .row-status');
    await expect(statuses).toHaveCount(4);

    await expect(page.locator('[data-featured-row][data-slug="wennian"] .row-status')).toHaveText(
      'Open-source MVP · Active Development',
    );
    await expect(page.locator('[data-featured-row][data-slug="hycell"] .row-status')).toHaveText(
      'Research Prototype',
    );
    await expect(page.locator('[data-featured-row][data-slug="morn"] .row-status')).toHaveText(
      'Public Repository',
    );
    await expect(page.locator('[data-featured-row][data-slug="biopulse"] .row-status')).toHaveText(
      'Public Repository',
    );
  });

  test('open source rows carry four fields and no metadata block', async ({ page }) => {
    /* §45–§47: this used to be a repository table — name, description, and a
       four-row metadata block per entry carrying role, language, licence and
       last-update date, under a line announcing when the metadata had been
       captured. What is left is the part a visitor cannot get faster by opening
       the repository: name, one line, language, GitHub →. */
    await visit(page, '/projects/');

    const rows = page.locator('.oss-list li');
    const count = await rows.count();
    expect(count, 'the repository list still renders').toBeGreaterThan(0);

    for (let i = 0; i < count; i += 1) {
      const row = rows.nth(i);
      await expect(row.locator('.oss-name')).not.toBeEmpty();
      await expect(row.locator('.oss-desc')).not.toBeEmpty();
      await expect(row.locator('.oss-lang')).not.toBeEmpty();
      await expect(row.locator('.oss-go')).toContainText('GitHub');
      await expect(row.locator('a')).toHaveAttribute('href', /^https:\/\/github\.com\//);
    }

    // The columns §47 deletes, the snapshot line above them, and the "role"
    // that was hand-written for each repository.
    await expect(page.getByText('Metadata snapshot')).toHaveCount(0);
    await expect(page.locator('.oss-facts')).toHaveCount(0);
    await expect(page.locator('.oss-snapshot')).toHaveCount(0);
    await expect(page.locator('.oss-fact-k')).toHaveCount(0);
    await expect(page.locator('.oss-list').getByText('License')).toHaveCount(0);
    await expect(page.locator('.oss-list').getByText('Updated')).toHaveCount(0);
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
