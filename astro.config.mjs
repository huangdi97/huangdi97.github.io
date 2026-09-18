// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

/**
 * Canonical public origin.
 *
 * The deployment target is the GitHub Pages user site `huangdi97.github.io`,
 * which serves at the repository root, so `base` stays `/`.
 *
 * If the repository is ever renamed to a project site (`<user>.github.io/<repo>`),
 * set `base` to `/<repo>`; `site` + `base` then produce correct absolute URLs
 * everywhere, including the sitemap and canonical tags.
 */
const SITE = 'https://huangdi97.github.io';

export default defineConfig({
  site: SITE,
  base: '/',
  output: 'static',
  integrations: [
    mdx(),
    sitemap({
      // Emits <xhtml:link rel="alternate" hreflang="..."> for every page.
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en-US',
          zh: 'zh-CN',
        },
      },
      filter: (page) => !page.includes('404'),
      serialize: (item) => (item.url.endsWith('/') ? item : { ...item, url: `${item.url}/` }),
    }),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-light',
      wrap: true,
    },
  },
});
