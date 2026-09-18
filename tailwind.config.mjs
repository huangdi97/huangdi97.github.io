/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F7F7F4',
        ink: '#111111',
        muted: '#666666',
        faint: '#8A8A85',
        card: '#FFFFFF',
        night: '#111111',
        'night-ink': '#F5F5F5',
        accent: '#315CFF',
        line: 'rgba(0,0,0,0.10)',
      },
      fontFamily: {
        sans: [
          'Inter',
          'Geist',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'PingFang SC',
          'Hiragino Sans GB',
          'Microsoft YaHei',
          'Noto Sans SC',
          'sans-serif',
        ],
        mono: [
          'Geist Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Consolas',
          'Liberation Mono',
          'monospace',
        ],
      },
      maxWidth: {
        shell: '1200px',
        editorial: '68ch',
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.2, 0.6, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
