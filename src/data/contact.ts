import { SITE } from '../config/site';
import { localizedPath, t, type Lang } from '../i18n/ui';

/**
 * Contact identity — single source of truth for every "how to reach me" block.
 *
 * Order is fixed everywhere: Gmail, QQ Mail, GitHub, Resume. Footer, About,
 * Resume and the mobile navigation all render from this array, so no surface
 * can end up showing one address and not the other.
 *
 * Privacy rule: a phone number and the 163 address used for doctoral
 * applications are deliberately absent. They are not "hidden by CSS" — they do
 * not exist in the source at all.
 */

export type ContactLink = {
  id: string;
  label: string;
  value: string;
  href: string;
  /** Opens in a new tab; rendered with rel="noopener noreferrer". */
  external?: boolean;
};

export function getContactLinks(lang: Lang): ContactLink[] {
  const resumeHref = localizedPath(lang, '/resume');

  return [
    ...SITE.emails.map((email) => ({
      id: email.id,
      label: email.label[lang],
      value: email.value,
      href: `mailto:${email.value}`,
    })),
    {
      id: 'github',
      label: 'GitHub',
      value: SITE.github.replace('https://', ''),
      href: SITE.github,
      external: true,
    },
    {
      id: 'resume',
      label: t(lang, 'nav.resume'),
      value: new URL(resumeHref, SITE.url).href.replace('https://', ''),
      href: resumeHref,
    },
  ];
}

/** Addresses that may ever appear in a public mailto link. */
export const ALLOWED_MAILTO = SITE.emails.map((e) => `mailto:${e.value}`);
