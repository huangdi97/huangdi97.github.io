import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';

export type ProjectEntry = CollectionEntry<'projects'> | CollectionEntry<'projectsZh'>;

/** Ordered, featured-first project list for a locale. */
export async function getProjects(lang: Lang): Promise<ProjectEntry[]> {
  const entries =
    lang === 'zh' ? await getCollection('projectsZh') : await getCollection('projects');
  return entries.sort((a, b) => {
    if (a.data.featured !== b.data.featured) return a.data.featured ? -1 : 1;
    return a.data.order - b.data.order;
  });
}

export async function getFeaturedProjects(lang: Lang, limit = 5): Promise<ProjectEntry[]> {
  const all = await getProjects(lang);
  return all.filter((p) => p.data.featured).slice(0, limit);
}

export function projectHref(lang: Lang, slug: string): string {
  return lang === 'zh' ? `/zh/projects/${slug}/` : `/projects/${slug}/`;
}

export function projectsHref(lang: Lang): string {
  return lang === 'zh' ? '/zh/projects/' : '/projects/';
}

/** Next project in the ordered list, wrapping around. */
export function nextProject(all: ProjectEntry[], slug: string): ProjectEntry | undefined {
  const i = all.findIndex((p) => p.data.slug === slug);
  if (i === -1) return undefined;
  return all[(i + 1) % all.length];
}

export const PROJECT_FILTERS = [
  'ai-health',
  'ai-science',
  'agents',
  'infrastructure',
  'experiments',
] as const;

export type ProjectFilter = (typeof PROJECT_FILTERS)[number];

export const FILTER_LABELS: Record<ProjectFilter, { en: string; zh: string }> = {
  'ai-health': { en: 'AI Health', zh: 'AI 健康' },
  'ai-science': { en: 'AI Science', zh: 'AI 科学' },
  agents: { en: 'Agents', zh: '智能体' },
  infrastructure: { en: 'Infrastructure', zh: '基础设施' },
  experiments: { en: 'Experiments', zh: '实验' },
};
