// Draws the app icon, a gas mask against a patch of fog, and writes build/icon.png (512x512)
// and build/icon.ico. The mask is drawn on a 64x64 grid and scaled up with nearest-neighbor
// filtering and 5-bit color, so it has the same chunky pixels as the game.
// Usage: node tools/package/icon.mjs   (needs ImageMagick 7 as `magick`)
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const GRID = 64;
const SIZE = 512;
const out = resolve('build');

const eyepiece = (x) => `
  <circle cx="${x}" cy="27" r="6" fill="#2a2722"/>
  <circle cx="${x}" cy="27" r="4.4" fill="#040505"/>
  <circle cx="${x - 1.6}" cy="25.4" r="1.1" fill="#8f938c"/>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${GRID}" height="${GRID}" viewBox="0 0 ${GRID} ${GRID}">
  <defs>
    <radialGradient id="fog" cx="32" cy="30" r="31" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#a3a6a0"/>
      <stop offset="0.6" stop-color="#4b4e4b"/>
      <stop offset="1" stop-color="#060707"/>
    </radialGradient>
  </defs>
  <rect width="${GRID}" height="${GRID}" fill="url(#fog)"/>
  <path d="M19 15 L8 6 M45 15 L56 6 M17 30 L5 31 M47 30 L59 31" stroke="#121110" stroke-width="2.5"/>
  <path d="M32 8 C44 8 49 17 49 28 C49 38 43 44 38 46 L26 46 C21 44 15 38 15 28 C15 17 20 8 32 8 Z" fill="#141210"/>
  ${eyepiece(24.5)}
  ${eyepiece(39.5)}
  <path d="M27 38 L37 38 L36 46 L28 46 Z" fill="#1d1a16"/>
  <rect x="25" y="45" width="14" height="13" rx="2" fill="#1b1a17"/>
  <path d="M25 49 H39 M25 52 H39 M25 55 H39" stroke="#0a0a09" stroke-width="1"/>
</svg>`;

mkdirSync(out, { recursive: true });
const work = mkdtempSync(join(tmpdir(), 'loyon-icon-'));
try {
  const source = join(work, 'icon.svg');
  writeFileSync(source, svg);
  const png = join(out, 'icon.png');
  execFileSync('magick', ['-background', 'none', source, '-filter', 'point', '-resize', `${SIZE}x${SIZE}`, '-posterize', '32', '-depth', '8', png]);
  execFileSync('magick', [png, '-filter', 'point', '-define', 'icon:auto-resize=256,128,64,48,32,16', join(out, 'icon.ico')]);
  console.log(`Wrote ${png} and ${join(out, 'icon.ico')}`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
