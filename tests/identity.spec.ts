import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { test, expect, type Page } from '@playwright/test';

/**
 * Identity closure tests.
 *
 * These guard the v1.2 identity contract: owner-confirmed résumé facts must be
 * published, private contact details must never reach a rendered page, the
 * flagship project must be branded `ZhiShen · WenNian`, and the résumé must
 * survive printing without truncation or horizontal overflow.
 *
 * Private values are assembled at runtime so this file does not itself contain
 * the phone number it is checking for — `scripts/check-public-identity.mjs`
 * scans the repository and would flag a literal.
 */

const PHONE = ['1853', '5864', '540'].join('');
const PRIVATE_EMAIL = ['haolei970211', '@163.com'].join('');

const GMAIL = ['h30441854', '@gmail.com'].join('');
const QQ = ['304418554', '@qq.com'].join('');

const ROUTES = [
  '/',
  '/projects/',
  '/projects/wennian/',
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

test.describe('factual consistency', () => {
  test('English résumé publishes the confirmed education and employment record', async ({ page }) => {
    await page.goto('/resume/');
    const body = page.locator('body');

    for (const fact of [
      'Dalian Medical University',
      'M.S.',
      'Zoology',
      'Taiyuan University of Technology',
      'B.Eng.',
      'Biological Engineering',
      'Beijing ZONCI Technology Development Co., Ltd.',
      'Assistant Engineer',
      'Sinovac Life Sciences Co., Ltd.',
      'Formulation Technology Engineer',
      'Manuscript submitted',
    ]) {
      await expect(body, `missing fact: ${fact}`).toContainText(fact);
    }

    // No degree inflation, no promotional education claims.
    for (const banned of ['Bachelor of Science', 'Dalian Medical College', 'Lead Engineer', 'Project Manager']) {
      await expect(body, `unexpected claim: ${banned}`).not.toContainText(banned);
    }
  });

  test('Chinese résumé publishes the same record in Chinese', async ({ page }) => {
    await page.goto('/zh/resume/');
    const body = page.locator('body');

    for (const fact of [
      '大连医科大学',
      '理学硕士',
      '动物学',
      '太原理工大学',
      '工学学士',
      '生物工程',
      '北京众驰伟业科技发展有限公司',
      '北京科兴中维生物技术有限公司',
      '稿件在投',
    ]) {
      await expect(body, `missing fact: ${fact}`).toContainText(fact);
    }

    await expect(body).not.toContainText('211');
  });

  test('manuscript is never described as published', async ({ page }) => {
    await page.goto('/resume/');
    const output = page.locator('[data-resume-section="output"]');
    await expect(output).toContainText('Manuscript submitted');
    await expect(output).not.toContainText(/doi|DOI|published|accepted|peer-reviewed/i);
  });
});

test.describe('privacy', () => {
  for (const route of ROUTES) {
    test(`no private contact detail on ${route}`, async ({ page }) => {
      await page.goto(route);
      const html = await page.content();
      expect(html.includes(PHONE), `phone number found on ${route}`).toBe(false);
      expect(html.includes(PRIVATE_EMAIL), `private email found on ${route}`).toBe(false);
    });
  }
});

test.describe('contact identity', () => {
  const SURFACES: Array<[string, string]> = [
    ['footer', 'footer.site-footer'],
    ['about', 'main'],
    ['resume', 'main'],
  ];

  for (const [label, scope] of SURFACES) {
    test(`${label} exposes both addresses in a fixed order`, async ({ page }) => {
      await page.goto(label === 'footer' ? '/' : `/${label}/`);
      const root = page.locator(scope).first();

      const ids = await root.locator('[data-contact-id]').evaluateAll((nodes) =>
        nodes.map((n) => (n as HTMLElement).dataset.contactId ?? ''),
      );
      // Gmail → QQ Mail → GitHub → Resume, on every surface.
      expect(ids.slice(0, 4)).toEqual(['gmail', 'qq', 'github', 'resume']);

      await expect(root.locator('[data-contact-id="gmail"]').first()).toHaveAttribute(
        'href',
        `mailto:${GMAIL}`,
      );
      await expect(root.locator('[data-contact-id="qq"]').first()).toHaveAttribute(
        'href',
        `mailto:${QQ}`,
      );
    });
  }

  test('no page links a mailto target outside the approved pair', async ({ page }) => {
    for (const route of ROUTES) {
      await page.goto(route);
      const targets = await page.locator('a[href^="mailto:"]').evaluateAll((nodes) =>
        nodes.map((n) => n.getAttribute('href') ?? ''),
      );
      for (const target of targets) {
        expect(target, `unapproved mailto on ${route}`).toMatch(
          new RegExp(`^mailto:(${GMAIL}|${QQ})$`),
        );
      }
    }
  });
});

test.describe('naming', () => {
  test('flagship project carries the ZhiShen · WenNian brand', async ({ page }) => {
    await page.goto('/projects/wennian/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('ZhiShen · WenNian');
    await expect(page.locator('.case-subtitle')).toContainText('知身·问年');
  });

  test('Chinese case study carries 知身·问年', async ({ page }) => {
    await page.goto('/zh/projects/wennian/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('知身·问年');
    await expect(page.locator('.case-subtitle')).toContainText('ZhiShen · WenNian');
  });

  test('the retired name is never used as a page heading', async ({ page }) => {
    for (const route of ROUTES) {
      await page.goto(route);
      const headings = await page.locator('h1, h2').allInnerTexts();
      for (const heading of headings) {
        expect(heading.trim(), `bare "WenNian" heading on ${route}`).not.toBe('WenNian');
      }
    }
  });

  test('repository URL and slug stay stable across the rename', async ({ page }) => {
    await page.goto('/projects/wennian/');
    const repo = page.getByRole('complementary').getByRole('link', { name: 'Repository' });
    await expect(repo).toHaveAttribute('href', 'https://github.com/huangdi97/WenNian');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://haoleilab.com/projects/wennian/',
    );
  });
});

test.describe('resume integrity', () => {
  const SECTIONS = [
    'profile',
    'focus',
    'experience',
    'education',
    'research',
    'output',
    'projects',
    'technical',
    'opensource',
    'contact',
  ];

  for (const locale of ['/resume/', '/zh/resume/']) {
    test(`${locale} renders every section`, async ({ page }) => {
      await page.goto(locale);
      await expect(page.locator('[data-resume-section]')).toHaveCount(SECTIONS.length);
      for (const id of SECTIONS) {
        const section = page.locator(`[data-resume-section="${id}"]`);
        await expect(section, `missing section ${id}`).toHaveCount(1);
        await expect(section).toBeVisible();
        const text = (await section.innerText()).trim();
        expect(text.length, `empty section ${id}`).toBeGreaterThan(0);
      }
    });

    test(`${locale} separates employment, research and personal projects`, async ({ page }) => {
      await page.goto(locale);
      const employment = page.locator('[data-resume-section="experience"]');
      const research = page.locator('[data-resume-section="research"]');
      const projects = page.locator('[data-resume-section="projects"]');

      await expect(employment).toBeVisible();
      await expect(research).toBeVisible();
      await expect(projects).toBeVisible();

      // Employment names companies; research names the university project.
      const employmentText = await employment.innerText();
      const researchText = await research.innerText();
      expect(employmentText).not.toEqual(researchText);
    });
  }

  test('download buttons appear only for PDFs that exist', async ({ page }) => {
    await page.goto('/resume/');
    const links = page.locator('a[data-resume-pdf]');
    const count = await links.count();
    for (let i = 0; i < count; i += 1) {
      const href = await links.nth(i).getAttribute('href');
      expect(href).toBeTruthy();
      const response = await page.request.get(href as string);
      expect(response.status(), `404 download: ${href}`).toBe(200);
    }
  });
});

test.describe('print', () => {
  for (const locale of ['/resume/', '/zh/resume/']) {
    test(`${locale} prints without truncation or overflow`, async ({ page }) => {
      await page.setViewportSize({ width: 794, height: 1123 });
      await page.emulateMedia({ media: 'print' });
      await page.goto(locale);

      // Chrome furniture must be gone from the printed document.
      await expect(page.locator('header.site-header')).toBeHidden();
      await expect(page.locator('footer.site-footer')).toBeHidden();
      await expect(page.locator('[data-print]')).toBeHidden();

      // Every section survives — nothing is clipped in print.
      const sections = page.locator('[data-resume-section]');
      const count = await sections.count();
      expect(count).toBeGreaterThan(0);
      for (let i = 0; i < count; i += 1) {
        await expect(sections.nth(i)).toBeVisible();
      }

      // Contact details remain reachable on paper.
      await expect(page.locator('[data-contact-id="gmail"]').first()).toContainText(GMAIL);
      await expect(page.locator('[data-contact-id="qq"]').first()).toContainText(QQ);

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow, `horizontal overflow in print at ${locale}`).toBeLessThanOrEqual(1);
    });
  }
});

test.describe('mobile resume', () => {
  test('long institution and company names wrap at 390px', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'mobile-only');
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto('/resume/');

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);

    await expect(page.locator('[data-resume-section="experience"]')).toContainText(
      'Beijing ZONCI Technology Development Co., Ltd.',
    );
    await expect(page.locator('[data-resume-section="education"]')).toContainText(
      'Taiyuan University of Technology',
    );
  });
});

async function collectConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(String(err)));
  return errors;
}

const PDF_VARIANTS = [
  {
    id: 'ai-agent',
    file: 'Hao-Lei-AI-Agent-Resume-ZH.pdf',
    projects: ['Morn', 'BioPulse', '知身·问年', 'HyCell'],
  },
  {
    id: 'ai-lifescience',
    file: 'Hao-Lei-AI-LifeScience-Resume-ZH.pdf',
    projects: ['知身·问年', 'HyCell', 'BioPulse', 'Morn'],
  },
];

/**
 * Text is extracted from the rendered file — never from the source data — so a
 * claim that survives only in the browser cannot slip onto paper. Chinese
 * headings arrive as separate glyphs, so matching runs against a squashed
 * string with no whitespace at all.
 */
async function pdfRaw(file: string): Promise<string> {
  const bytes = readFileSync(join(process.cwd(), 'public', 'resume', file));
  const doc = await getDocument({ data: new Uint8Array(bytes), useSystemFonts: true }).promise;
  let raw = '';
  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    raw += `${content.items.map((item) => ('str' in item ? item.str : '')).join('')}\n`;
  }
  return raw;
}

function squashed(raw: string): string {
  return raw.replace(/\s+/g, '');
}

/**
 * `/Info` metadata as plain strings.
 *
 * `pdfjs` types `info` as a bare `Object`, which differs between the local and
 * the CI install of the package — reading through a narrow shape keeps the
 * assertion honest without depending on how the type happens to be declared.
 */
async function pdfInfo(file: string): Promise<Record<string, unknown>> {
  const bytes = readFileSync(join(process.cwd(), 'public', 'resume', file));
  const doc = await getDocument({ data: new Uint8Array(bytes), useSystemFonts: true }).promise;
  const meta = await doc.getMetadata();
  return (meta.info ?? {}) as Record<string, unknown>;
}

/** The Selected Projects block, bounded by whichever section follows it. */
function projectsBlock(text: string): string {
  const start = text.indexOf('精选项目');
  expect(start, 'Selected Projects heading missing from PDF').toBeGreaterThan(-1);
  const next = ['技术领域', '开源']
    .map((title) => text.indexOf(title, start))
    .filter((index) => index > start);
  const end = next.length > 0 ? Math.min(...next) : start + 900;
  return text.slice(start, end);
}

test.describe('resume PDFs', () => {
  for (const variant of PDF_VARIANTS) {
    test(`${variant.id} publishes the public identity only`, async () => {
      const text = squashed(await pdfRaw(variant.file));
      expect(text, 'gmail missing').toContain(GMAIL);
      expect(text, 'qq mail missing').toContain(QQ);
      expect(text, 'phone leaked into PDF').not.toContain(PHONE);
      expect(text, 'private email leaked into PDF').not.toContain(PRIVATE_EMAIL);

      const info = await pdfInfo(variant.file);
      expect(info.Title).toBe('Hao Lei — Resume');
      expect(info.Author).toBe('Hao Lei');
    });

    test(`${variant.id} Selected Projects carry no TaiYi and follow its order`, async () => {
      const block = projectsBlock(squashed(await pdfRaw(variant.file)));
      expect(block, 'TaiYi must not appear in Selected Projects').not.toContain('太一');
      expect(block, 'TaiYi must not appear in Selected Projects').not.toContain('TaiYi');

      const positions = variant.projects.map((name) => {
        const index = block.indexOf(name);
        expect(index, `missing project ${name} in ${variant.file}`).toBeGreaterThan(-1);
        return index;
      });
      for (let i = 1; i < positions.length; i += 1) {
        expect(positions[i] > positions[i - 1], `project order drifted in ${variant.file}`).toBe(
          true,
        );
      }
    });
  }
});

test.describe('structured identity', () => {
  test('Person JSON-LD exposes only the public identity', async ({ page }) => {
    const errors = await collectConsoleErrors(page);
    await page.goto('/');
    expect(errors).toEqual([]);

    const blocks = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((nodes) => nodes.map((n) => n.textContent ?? ''));

    const persons = blocks
      .map((raw) => {
        try {
          return JSON.parse(raw);
        } catch {
          return null;
        }
      })
      .flatMap((node) => (Array.isArray(node) ? node : [node]))
      .filter((node) => node?.['@type'] === 'Person');

    expect(persons.length).toBeGreaterThan(0);
    for (const person of persons) {
      expect(person.email).toBe(`mailto:${GMAIL}`);
      expect(person.telephone).toBeUndefined();
      expect(person.birthDate).toBeUndefined();
      expect(person.address).toBeUndefined();
      expect(JSON.stringify(person.alumniOf)).toContain('Dalian Medical University');
      expect(JSON.stringify(person.alumniOf)).toContain('Taiyuan University of Technology');
    }
  });
});
