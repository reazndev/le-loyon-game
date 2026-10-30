import { canvas, context2d, gridCanvas, type Palette } from './pixels';

/** 16x16 icons, shown at 32 px on the desktop and 16 px in title bars and the taskbar. */

const computer = [
  '................',
  '..kkkkkkkkkkkk..',
  '..kbbbbbbbbbbk..',
  '..kbkkkkkkkkbk..',
  '..kbkttttttkbk..',
  '..kbktwttttkbk..',
  '..kbkttttttkbk..',
  '..kbkttttttkbk..',
  '..kbkkkkkkkkbk..',
  '..kbbbbbbbebbk..',
  '..kkkkkkkkkkkk..',
  '.....kbbbbk.....',
  '..kkkkkkkkkkkk..',
  '.kbbbbbbbbbbbbk.',
  '.kbBbBbBbBbBbbk.',
  '.kkkkkkkkkkkkkk.',
];

const envelope = [
  '................',
  '................',
  '................',
  '.kkkkkkkkkkkkkk.',
  '.kkwwwwwwwwwwkk.',
  '.kwkwwwwwwwwkwk.',
  '.kwwkwwwwwwkwwk.',
  '.kwwwkwwwwkwwwk.',
  '.kwwwwkwwkwwwwk.',
  '.kwwwwwkkwwwwwk.',
  '.kwwwwwwwwwwrrk.',
  '.kwwwwwwwwwwrrk.',
  '.kkkkkkkkkkkkkk.',
  '................',
  '................',
  '................',
];

const dialUp = [
  '................',
  '................',
  '..kkkkk..kkkkk..',
  '.kbbbbbkkbbbbbk.',
  '.kbbkkkkkkkkbbk.',
  '.kkk........kkk.',
  '................',
  '................',
  '..kkkkkkkkkkkk..',
  '.kggggggggggggk.',
  '.kgGGGGGGGGGGgk.',
  '.kgeGrGeGGGGGgk.',
  '.kggggggggggggk.',
  '.kkkkkkkkkkkkkk.',
  '................',
  '................',
];

const textFile = [
  '...kkkkkkkk.....',
  '...kwwwwwwkk....',
  '...kwwwwwwkwk...',
  '...kwGGGGwkkkk..',
  '...kwwwwwwwwwk..',
  '...kwGGGGGGGwk..',
  '...kwwwwwwwwwk..',
  '...kwGGGGGGwwk..',
  '...kwwwwwwwwwk..',
  '...kwGGGGGGGwk..',
  '...kwwwwwwwwwk..',
  '...kwGGGGGwwwk..',
  '...kwwwwwwwwwk..',
  '...kwwwwwwwwwk..',
  '...kkkkkkkkkkk..',
  '................',
];

const trash = [
  '................',
  '................',
  '...kkkkkkkkkk...',
  '..kggggggggggk..',
  '..kkkkkkkkkkkk..',
  '...kgGgGgGgGk...',
  '...kGgGgGgGgk...',
  '...kgGgGgGgGk...',
  '...kGgGgGgGgk...',
  '....kgGgGgGk....',
  '....kGgGgGgk....',
  '....kgGgGgGk....',
  '....kkkkkkkk....',
  '................',
  '................',
  '................',
];

const floppy = [
  '................',
  '.kkkkkkkkkkkkk..',
  '.kGGGggggggGGkk.',
  '.kGGGgkkggGGGGk.',
  '.kGGGgkkggGGGGk.',
  '.kGGGggggggGGGk.',
  '.kGGGGGGGGGGGGk.',
  '.kGwwwwwwwwwwGk.',
  '.kGwGGGGGGGGwGk.',
  '.kGwwwwwwwwwwGk.',
  '.kGwGGGGGGwwwGk.',
  '.kGwwwwwwwwwwGk.',
  '.kkkkkkkkkkkkkk.',
  '................',
  '................',
  '................',
];

const hardDisk = [
  '................',
  '................',
  '................',
  '................',
  '................',
  '.kkkkkkkkkkkkkk.',
  '.kggggggggggggk.',
  '.kgGGGGGGGGGGgk.',
  '.kggggggggggegk.',
  '.kkkkkkkkkkkkkk.',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
];

const startLogo = [
  '................',
  '................',
  '......yyyy......',
  '.....yyyyyy.....',
  '....yyyyyyyy....',
  '....yyyyyyyy....',
  '................',
  '..eeeeee........',
  '.eeeeeeeeee.....',
  'eeeeeeeeeeeeee..',
  'eeeeeeeeeeeeeeee',
  '................',
];

const twoMonitors = [
  '................',
  'kkkkkkk.........',
  'kaaaaak.........',
  'kaaaaak.........',
  'kkkkkkk.........',
  '..kkk...........',
  '.........kkkkkkk',
  '.........kccccck',
  '.........kccccck',
  '.........kkkkkkk',
  '...........kkk..',
];

export const cursorArrow = [
  'k...........',
  'kk..........',
  'kwk.........',
  'kwwk........',
  'kwwwk.......',
  'kwwwwk......',
  'kwwwwwk.....',
  'kwwwwwwk....',
  'kwwwwwwwk...',
  'kwwwwwwwwk..',
  'kwwwwwwwwwk.',
  'kwwwwwwkkkkk',
  'kwwwkwwk....',
  'kwwkkwwk....',
  'kwk..kwwk...',
  'kk...kwwk...',
  'k.....kwwk..',
  '......kwwk..',
  '.......kk...',
];

export const cursorHand = [
  '.....kk.........',
  '....kwwk........',
  '....kwwk........',
  '....kwwk........',
  '....kwwkkk......',
  '....kwwkwwkkk...',
  '....kwwkwwkwwkk.',
  '.kk.kwwkwwkwwkwk',
  'kwwkkwwwwwwwwkwk',
  'kwwwkwwwwwwwwwwk',
  '.kwwwwwwwwwwwwwk',
  '..kwwwwwwwwwwwwk',
  '..kwwwwwwwwwwwk.',
  '...kwwwwwwwwwwk.',
  '....kwwwwwwwwk..',
  '....kwwwwwwwwk..',
  '....kkkkkkkkkk..',
];

export const cursorHourglass = [
  'kkkkkkkkkk',
  'kwwwwwwwwk',
  '.kwwwwwwk.',
  '.kwyyyywk.',
  '..kwyywk..',
  '...kwwk...',
  '...kwwk...',
  '..kwwwwk..',
  '.kwwyywwk.',
  '.kwyyyywk.',
  'kwyyyyyywk',
  'kkkkkkkkkk',
];

/** A globe at a rotation `phase` in radians, for the Navigator icon and its loading throbber. */
export function globe(size: number, phase = 0): HTMLCanvasElement {
  const element = canvas(size, size);
  const context = context2d(element);
  const r = size / 2 - 1;
  const c = size / 2 - 0.5;
  for (let j = 0; j < size; j++)
    for (let i = 0; i < size; i++) {
      const x = (i - c) / r;
      const y = (j - c) / r;
      const d = x * x + y * y;
      if (d > 1) continue;
      const lon = Math.asin(x / Math.sqrt(Math.max(1 - y * y, 1e-6))) + phase;
      const lat = Math.asin(y);
      const land = Math.sin(lon * 2) + Math.cos(lat * 3 + lon) * 0.8 > 0.55;
      const edge = d > 0.78;
      const grid = Math.abs(Math.sin(lon * 3)) < 0.12 || Math.abs(Math.sin(lat * 3)) < 0.1;
      context.fillStyle = edge ? '#1a2a5a' : land ? (grid ? '#2a6a30' : '#3e9a48') : grid ? '#2a4aa0' : '#3a6ad0';
      if (!edge && x < -0.2 && y < -0.2 && d < 0.5) context.fillStyle = land ? '#7ac080' : '#7aa4ee';
      context.fillRect(i, j, 1, 1);
    }
  return element;
}

function disc(): HTMLCanvasElement {
  const element = canvas(16, 16);
  const context = context2d(element);
  for (let j = 0; j < 16; j++)
    for (let i = 0; i < 16; i++) {
      const d = Math.hypot(i - 7.5, j - 7.5);
      if (d > 7) continue;
      const shine = ((Math.atan2(j - 7.5, i - 7.5) + Math.PI) * 3) % 2 < 0.5;
      context.fillStyle = d > 6.2 ? '#1a1916' : d < 1.6 ? '#1a1916' : d < 2.6 ? '#807b6f' : shine ? '#f4f2ea' : '#c3bfb3';
      if (d < 1.6) continue;
      context.fillRect(i, j, 1, 1);
    }
  return element;
}

const icons = {
  computer: () => gridCanvas(computer),
  mail: () => gridCanvas(envelope),
  browser: () => globe(16, 0.6),
  dialUp: () => gridCanvas(dialUp),
  text: () => gridCanvas(textFile),
  trash: () => gridCanvas(trash),
  floppy: () => gridCanvas(floppy),
  hardDisk: () => gridCanvas(hardDisk),
  disc,
  start: () => gridCanvas(startLogo),
};

export type IconName = keyof typeof icons;

/** A fresh canvas of an icon, scaled with CSS to `size` pixels. */
export function icon(name: IconName, size: 16 | 32 = 16): HTMLCanvasElement {
  const element = icons[name]();
  element.className = `px icon icon-${size}`;
  return element;
}

/** The two-monitor modem light in the taskbar. `phase` 0 or 1 picks which screen is lit. */
export function modemLight(phase: number): HTMLCanvasElement {
  const lit = '#e8f070';
  const dark = '#2a4a48';
  const palette: Palette = { a: phase ? lit : dark, c: phase ? dark : lit };
  const element = gridCanvas(twoMonitors, palette);
  element.className = 'px icon icon-16';
  return element;
}
