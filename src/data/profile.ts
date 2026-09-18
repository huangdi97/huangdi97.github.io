import { SITE, primaryEmail } from '../config/site';
import type { Lang } from '../i18n/ui';

/**
 * Structured-data identity, built once and reused by the home, About and
 * Resume pages so no two copies can disagree.
 *
 * Privacy: only the primary Gmail address is published to crawlers. The QQ
 * address stays visible to humans on the page but is kept out of JSON-LD. No
 * telephone, birthDate, address or family field is ever emitted.
 *
 * `alumniOf` carries institution names only — no invented URLs, rankings,
 * identifiers or dates beyond what is already published on the page.
 */

const ALUMNI_OF = [
  { '@type': 'CollegeOrUniversity', name: 'Dalian Medical University' },
  { '@type': 'CollegeOrUniversity', name: 'Taiyuan University of Technology' },
];

export function personJsonLd(lang: Lang): Record<string, unknown> {
  return {
    '@type': 'Person',
    name: SITE.nameEn,
    alternateName: SITE.nameZh,
    url: SITE.url,
    sameAs: [SITE.github],
    email: `mailto:${primaryEmail()}`,
    alumniOf: ALUMNI_OF,
    knowsAbout: SITE.focusAreas.map((a) => (lang === 'zh' ? a.zh : a.en)),
  };
}

export function personSchema(lang: Lang): Record<string, unknown> {
  return { '@context': 'https://schema.org', ...personJsonLd(lang) };
}

export function profilePageJsonLd(
  lang: Lang,
  path: string,
  pageName: string,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    name: pageName,
    url: new URL(path, SITE.url).href,
    inLanguage: lang === 'zh' ? 'zh-Hans' : 'en',
    mainEntity: personJsonLd(lang),
  };
}
