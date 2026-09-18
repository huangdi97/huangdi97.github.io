/** @type {import('prettier').Config} */
export default {
  semi: true,
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  trailingComma: 'all',
  plugins: ['prettier-plugin-astro'],
  overrides: [
    {
      files: '*.astro',
      options: { parser: 'astro' },
    },
    {
      files: ['*.md', '*.mdx'],
      options: { proseWrap: 'preserve' },
    },
  ],
};
