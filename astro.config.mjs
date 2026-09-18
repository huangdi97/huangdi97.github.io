// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

/**
 * Canonical public origin.
 *
 * The published custom domain is the serving origin: GitHub Pages answers
 * `huangdi97.github.io` with a 301 to `haoleilab.com`, so canonical URLs,
 * the sitemap and OG images all point at the domain. The repository itself
 * is the user site `huangdi97.github.io`, which serves at the root — `base`
 * stays `/`.
 *
 * If the custom domain is ever removed, set this back to
 * `https://huangdi97.github.io`.
 */
const SITE = 'https://haoleilab.com';

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
