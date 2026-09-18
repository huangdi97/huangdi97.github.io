/**
 * Generates static PNG assets at build time:
 *   - Open Graph images (1200×630) for the site and every project
 *   - PWA / touch icons
 *
 * Text is set in Arial for deterministic rasterisation; no web fonts are
 * downloaded and no network access is required.
 *
 * Usage: node scripts/generate-assets.mjs
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = resolve(root, 'public');
const ogDir = resolve(publicDir, 'og');

mkdirSync(ogDir, { recursive: true });

const SITE_HOST = 'huangdi97.github.io';
const BG = '#F7F7F4';
const INK = '#111111';
const MUTED = '#666666';
const FAINT = '#8A8A85';
const LINE = 'rgba(0,0,0,0.12)';
const ACCENT = '#315CFF';

/** Escape text for SVG. */
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fitSize(text, base) {
  const len = text.length;
  if (len <= 16) return base;
  if (len <= 24) return Math.round(base * 0.86);
  if (len <= 34) return Math.round(base * 0.72);
  return Math.round(base * 0.6);
}

function ogSvg({ title, subtitle, eyebrow = 'Personal AI Lab' }) {
  const titleSize = fitSize(title, 78);
  const subSize = fitSize(subtitle ?? '', 30);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${BG}"/>
  <rect x="32" y="32" width="1136" height="566" fill="none" stroke="${LINE}"/>

  <text x="80" y="112" font-family="Arial, Helvetica, sans-serif" font-size="26" letter-spacing="6" fill="${INK}">HAO LEI</text>
  <text x="1120" y="112" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="20" letter-spacing="3" fill="${FAINT}">${esc(eyebrow.toUpperCase())}</text>

  <line x1="80" y1="150" x2="1120" y2="150" stroke="${LINE}" stroke-width="1"/>

  <text x="80" y="330" font-family="Arial, Helvetica, sans-serif" font-size="${titleSize}" font-weight="bold" fill="${INK}">${esc(title)}</text>
  ${
    subtitle
      ? `<text x="80" y="392" font-family="Arial, Helvetica, sans-serif" font-size="${subSize}" fill="${MUTED}">${esc(subtitle)}</text>`
      : ''
  }

  <rect x="80" y="436" width="64" height="3" fill="${ACCENT}"/>

  <line x1="80" y1="500" x2="1120" y2="500" stroke="${LINE}" stroke-width="1"/>
  <text x="80" y="552" font-family="Arial, Helvetica, sans-serif" font-size="22" letter-spacing="2" fill="${FAINT}">AI × LIFE SCIENCE × AGENTS</text>
  <text x="1120" y="552" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="${FAINT}">${SITE_HOST}</text>
</svg>`;
}

function iconSvg(size) {
  const fontSize = Math.round(size * 0.42);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${BG}"/>
  <text x="${size / 2}" y="${size / 2 + fontSize * 0.36}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="bold" letter-spacing="${-fontSize * 0.04}" fill="${INK}">HL</text>
</svg>`;
}

function render(svg, width) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    font: { loadSystemFonts: true, defaultFontFamily: 'Arial' },
  });
  return resvg.render().asPng();
}

function write(file, svg, width) {
  const png = render(svg, width);
  writeFileSync(file, png);
  console.log(`  ${file} (${(png.length / 1024).toFixed(1)} kB)`);
}

console.log('Generating OG images…');

const pages = [
  { file: 'home.png', title: 'Hao Lei', subtitle: 'Building intelligent systems for discovery, health, simulation and autonomous work.' },
  { file: 'default.png', title: 'Hao Lei', subtitle: 'AI × Life Science × Agents' },
  { file: 'projects.png', title: 'Work', subtitle: 'Five systems, built end to end.' },
  { file: 'research.png', title: 'Research', subtitle: 'Five directions, each tied to something built.' },
  { file: 'about.png', title: 'About', subtitle: 'AI systems at the intersection of science, health and autonomous software.' },
  { file: 'resume.png', title: 'Resume', subtitle: 'AI systems, agents, computational biology, digital health, simulation.' },
];

const projects = [
  { file: 'wennian.png', title: 'ZhiShen · WenNian', subtitle: 'AI aging assessment and intervention decision system.' },
  { file: 'hycell.png', title: 'HyCell', subtitle: 'AI virtual-cell infrastructure for biological representation and simulation.' },
  { file: 'taiyi-lingjing.png', title: 'TaiYi Lingjing', subtitle: 'An agentic discovery platform for biology, evidence, simulation and experiment.' },
  { file: 'pet-ai-health.png', title: 'Pet AI Health', subtitle: 'Observation, risk assessment, consultation and care workflows.' },
  { file: 'pdig.png', title: 'PDIG', subtitle: 'A local-first personal digital-infrastructure graph.' },
];

for (const p of pages) {
  write(resolve(ogDir, p.file), ogSvg({ title: p.title, subtitle: p.subtitle }), 1200);
}

for (const p of projects) {
  write(
    resolve(ogDir, p.file),
    ogSvg({ title: p.title, subtitle: p.subtitle, eyebrow: 'Case Study' }),
    1200,
  );
}

console.log('Generating icons…');
write(resolve(publicDir, 'icon-192.png'), iconSvg(192), 192);
write(resolve(publicDir, 'icon-512.png'), iconSvg(512), 512);
write(resolve(publicDir, 'apple-touch-icon.png'), iconSvg(180), 180);

console.log('Assets ready.');
