import js from '@eslint/js';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import astro from 'eslint-plugin-astro';

const astroFlat = astro.configs['flat/recommended'] ?? astro.configs.recommended ?? [];

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.astro/**',
      'playwright-report/**',
      'test-results/**',
      'public/**',
      // Local review artifacts and retired scratch, all gitignored. Keeping them
      // out of lint is what makes a local run cover the same files as CI, which
      // never sees them at all.
      '.qa-screens/**',
    ],
  },
  js.configs.recommended,
  // eslint-plugin-astro ships flat config as an array of config objects.
  ...astroFlat,
  {
    files: ['**/*.ts', '**/*.mjs', '**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
      parser: tsParser,
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
    },
  },
  {
    files: ['**/*.astro'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      'no-unused-vars': 'off',
    },
  },
];
