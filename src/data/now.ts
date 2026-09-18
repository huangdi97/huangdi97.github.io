import type { Lang } from '../i18n/ui';
import type { Bi } from './bi';

/**
 * NOW — the single source for "what is actually being worked on".
 *
 * Why this file exists: current-status copy used to be spread across the hero,
 * project cards and the résumé, and three places drift apart within a month.
 * Status belongs in exactly one place, and nothing here may be aspirational —
 * a project appears in NOW only when there is real work behind it.
 *
 * Discipline:
 *  - `status` describes what can be checked today, never a goal.
 *  - `updatedAt` is the month this list was last reviewed by hand. It is not
 *    derived from Git or from a build timestamp.
 *  - Three entries maximum. NOW is a strip, not a dashboard.
 */

export type NowItem = {
  id: string;
  title: Bi;
  status: Bi;
  href: Bi;
};

export const NOW_UPDATED_AT = '2026.09';

const ITEMS: NowItem[] = [
  {
    id: 'wennian',
    title: { en: 'ZhiShen · WenNian', zh: '知身·问年' },
    status: { en: 'Active Development', zh: '持续迭代' },
    href: { en: '/projects/wennian/', zh: '/zh/projects/wennian/' },
  },
  {
    id: 'hycell',
    title: { en: 'HyCell', zh: 'HyCell' },
    status: { en: 'Research Prototype', zh: '研究原型' },
    href: { en: '/projects/hycell/', zh: '/zh/projects/hycell/' },
  },
  {
    id: 'morn',
    title: { en: 'Morn', zh: 'Morn' },
    status: { en: 'Agent Systems', zh: '智能体系统' },
    href: { en: '/projects/morn/', zh: '/zh/projects/morn/' },
  },
];

export type LocalizedNowItem = { id: string; title: string; status: string; href: string };

export function getNow(lang: Lang): LocalizedNowItem[] {
  return ITEMS.map((item) => ({
    id: item.id,
    title: item.title[lang],
    status: item.status[lang],
    href: item.href[lang],
  }));
}
