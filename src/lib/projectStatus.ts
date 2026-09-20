import type { Lang } from '../i18n/ui';
import { getProjectEvidence } from '../data/evidence';

/**
 * The one status line a project prints, and which evidence field it comes from.
 *
 * This used to live in `src/data/home.ts` because the homepage was the only
 * surface that printed a status. v2.1 prints the same line on /projects, so the
 * decision moved here — one function, one answer, and no page can invent a
 * second wording for a fact the evidence layer already states.
 *
 * The rule, unchanged from v2.0:
 *
 *   · some projects are best identified by the reality headline ("Open-source
 *     MVP"), others by the public-code fact ("Public repository");
 *   · exactly one of the two is printed, never both. A status plus a second
 *     code label plus a proof line is the four-part apparatus the round removes;
 *   · a slug absent from the maps falls back to the evidence layer, so a new
 *     project prints a true status without a second copy of this decision.
 */

/**
 * The owner's approved wording, per slug and locale.
 *
 * These are summaries of what the evidence layer already says, not a second,
 * competing record of project state.
 *
 * ZhiShen · WenNian opens with the canonical evidence wording rather than a
 * paraphrase of it: `evidence.headline` reads "Open-source MVP" / "开源 MVP" and
 * leads verbatim; the second clause is `evidence.proof[2]`, "Active development"
 * / "持续迭代". The English second clause is that proof entry verbatim; the
 * Chinese one is the owner's preferred "持续开发中" — same fact, and the only
 * remaining place where an approved string is a wording variant of the truth
 * layer rather than the identical token.
 *
 * HyCell reads "Research Prototype", which is `evidence.headline` ("研究原型")
 * in title case. Morn and BioPulse read the public-code fact.
 */
const PROJECT_STATUS_TEXT: Record<string, Record<Lang, string>> = {
  wennian: {
    en: 'Open-source MVP · Active Development',
    zh: '开源 MVP · 持续开发中',
  },
  hycell: {
    en: 'Research Prototype',
    zh: '研究原型',
  },
  morn: {
    en: 'Public Repository',
    zh: '公开仓库',
  },
  biopulse: {
    en: 'Public Repository',
    zh: '公开仓库',
  },
};

/** Which evidence field a project prints. Anything unlisted reads its headline. */
const PROJECT_STATUS_FIELD: Record<string, 'headline' | 'publicCode'> = {
  wennian: 'headline',
  hycell: 'headline',
  morn: 'publicCode',
  biopulse: 'publicCode',
};

/**
 * Resolve one project's status line for a locale, or null when the evidence
 * layer has nothing to say about it. Never returns an invented string: every
 * branch reads `evidence.ts`.
 */
export function projectStatus(slug: string, lang: Lang, t: (_key: string) => string): string | null {
  const approved = PROJECT_STATUS_TEXT[slug]?.[lang];
  if (approved) return approved;

  const evidence = getProjectEvidence(slug);
  if (!evidence) return null;

  if (PROJECT_STATUS_FIELD[slug] === 'publicCode') {
    return evidence.publicCode === 'open' ? t('publiccode.open') : t('publiccode.none');
  }

  return evidence.headline[lang];
}
