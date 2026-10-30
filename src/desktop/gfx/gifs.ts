import { bitmapText, canvas, context2d, paintGrid, seeded, tileUrl } from './pixels';

/** An animated GIF drawn in code: `draw` paints one frame. */
export interface Gif {
  width: number;
  height: number;
  frames: number;
  /** Frames per second. */
  fps: number;
  draw(context: CanvasRenderingContext2D, frame: number): void;
}

const YELLOW = '#f0c818';
const BLACK = '#111';

function line(context: CanvasRenderingContext2D, color: string, width: number, ...points: number[]): void {
  context.strokeStyle = color;
  context.lineWidth = width;
  context.beginPath();
  context.moveTo(points[0]!, points[1]!);
  for (let i = 2; i < points.length; i += 2) context.lineTo(points[i]!, points[i + 1]!);
  context.stroke();
}

function disc(context: CanvasRenderingContext2D, color: string, x: number, y: number, r: number): void {
  context.fillStyle = color;
  context.beginPath();
  context.arc(x, y, r, 0, Math.PI * 2);
  context.fill();
}

function polygon(context: CanvasRenderingContext2D, color: string, ...points: number[]): void {
  context.fillStyle = color;
  context.beginPath();
  context.moveTo(points[0]!, points[1]!);
  for (let i = 2; i < points.length; i += 2) context.lineTo(points[i]!, points[i + 1]!);
  context.closePath();
  context.fill();
}

/** The yellow road sign with a little man digging. */
const construction: Gif = {
  width: 56,
  height: 56,
  frames: 2,
  fps: 3,
  draw(context, frame) {
    polygon(context, BLACK, 28, 0, 56, 28, 28, 56, 0, 28);
    polygon(context, YELLOW, 28, 3, 53, 28, 28, 53, 3, 28);
    polygon(context, BLACK, 31, 44, 44, 44, 38, 38);
    disc(context, BLACK, 22, 19, 3);
    line(context, BLACK, 2, 22, 22, 24, 33, 20, 41);
    line(context, BLACK, 2, 24, 33, 28, 41);
    if (frame === 0) {
      line(context, BLACK, 2, 23, 25, 30, 22);
      line(context, BLACK, 1, 27, 28, 36, 18);
      polygon(context, BLACK, 35, 15, 40, 17, 37, 21);
    } else {
      line(context, BLACK, 2, 23, 25, 30, 30);
      line(context, BLACK, 1, 27, 26, 34, 39);
      polygon(context, BLACK, 32, 38, 37, 37, 36, 42);
    }
  },
};

/** A yellow and black stripe with UNDER CONSTRUCTION in the middle, stripes crawling. */
function constructionBanner(): Gif {
  let label: HTMLCanvasElement | null = null;
  return {
    width: 440,
    height: 28,
    frames: 8,
    fps: 10,
    draw(context, frame) {
      context.fillStyle = YELLOW;
      context.fillRect(0, 0, 440, 28);
      context.fillStyle = BLACK;
      for (let x = -40 + frame * 2; x < 460; x += 16) {
        context.beginPath();
        context.moveTo(x, 28);
        context.lineTo(x + 8, 28);
        context.lineTo(x + 36, 0);
        context.lineTo(x + 28, 0);
        context.fill();
      }
      label ??= bitmapText('UNDER CONSTRUCTION', { font: 'bold 16px "Liberation Sans", Arial, sans-serif', color: BLACK });
      context.fillStyle = YELLOW;
      context.fillRect(220 - label.width / 2 - 8, 4, label.width + 16, 20);
      context.drawImage(label, Math.round(220 - label.width / 2), Math.round(14 - label.height / 2));
    },
  };
}

/** The flaming horizontal rule. */
const flames: Gif = {
  width: 480,
  height: 16,
  frames: 6,
  fps: 9,
  draw(context, frame) {
    const random = seeded(frame * 97 + 5);
    let height = 6;
    for (let x = 0; x < 480; x += 2) {
      height = Math.max(3, Math.min(15, height + (random() - 0.5) * 7));
      for (let y = 0; y < height; y++) {
        const heat = y / height;
        context.fillStyle = heat < 0.35 ? '#c8180c' : heat < 0.7 ? '#f07818' : '#f8e050';
        context.fillRect(x, 15 - y, 2, 1);
      }
    }
  },
};

const skullRows = [
  '....wwwwwwww....',
  '..wwwwwwwwwwww..',
  '.wwwwwwwwwwwwww.',
  '.wwwwwwwwwwwwww.',
  'wwwwwwwwwwwwwwww',
  'wwwrrrwwwwrrrwww',
  'wwrrRrrwwrrRrrww',
  'wwrrrrrwwrrrrrww',
  'wwwrrrwwwwrrrwww',
  '.wwwwwwkkwwwwww.',
  '..wwwwkkkkwwww..',
  '...wwwwwwwwww...',
  '...wkwkwkwkww...',
  '...wwwwwwwwww...',
  '....wkwkwkww....',
  '.....wwwwww.....',
];

/** A skull with red eyes, turning on the spot. */
function skull(): Gif {
  const front = canvas(16, 16);
  const back = canvas(16, 16);
  paintGrid(context2d(front), skullRows, { w: '#e8e4d8', k: '#111', r: '#b01010', R: '#ff4030' });
  paintGrid(context2d(back), skullRows.map((row) => row.replace(/[rRk]/g, 'w')), { w: '#c8c4b8' });
  return {
    width: 40,
    height: 40,
    frames: 16,
    fps: 10,
    draw(context, frame) {
      const turn = Math.cos((frame / 16) * Math.PI * 2);
      const width = Math.max(2, Math.round(Math.abs(turn) * 32));
      context.drawImage(turn >= 0 ? front : back, 20 - width / 2, 4, width, 32);
    },
  };
}

/** A mountain biker bobbing along. */
const biker: Gif = {
  width: 72,
  height: 48,
  frames: 4,
  fps: 7,
  draw(context, frame) {
    const bob = [0, 1, 2, 1][frame]!;
    const wheel = (x: number) => {
      context.strokeStyle = BLACK;
      context.lineWidth = 2;
      context.beginPath();
      context.arc(x, 38, 9, 0, Math.PI * 2);
      context.stroke();
      const a = frame * 0.6;
      line(context, '#777', 1, x - Math.cos(a) * 8, 38 - Math.sin(a) * 8, x + Math.cos(a) * 8, 38 + Math.sin(a) * 8);
      line(context, '#777', 1, x + Math.sin(a) * 8, 38 - Math.cos(a) * 8, x - Math.sin(a) * 8, 38 + Math.cos(a) * 8);
    };
    wheel(14);
    wheel(56);
    line(context, '#d01818', 3, 14, 38, 30, 38, 46, 22, 26, 22, 30, 38);
    line(context, '#d01818', 3, 46, 22, 56, 38);
    line(context, BLACK, 2, 44, 18, 50, 18);
    line(context, BLACK, 3, 22, 20, 30, 20);
    line(context, '#2a4ad0', 4, 27, 16 + bob, 40, 8 + bob);
    line(context, '#2a4ad0', 3, 40, 9 + bob, 46, 18);
    line(context, '#222', 3, 27, 17 + bob, 33, 28, 30, 38);
    disc(context, '#f0d020', 43, 5 + bob, 4);
  },
};

/** A mailbox whose red flag goes up. */
const mailbox: Gif = {
  width: 48,
  height: 48,
  frames: 10,
  fps: 4,
  draw(context, frame) {
    context.fillStyle = '#6a4a2a';
    context.fillRect(21, 26, 6, 22);
    context.fillStyle = '#4a5a8a';
    context.fillRect(6, 12, 32, 16);
    disc(context, '#4a5a8a', 22, 13, 16);
    context.fillStyle = '#4a5a8a';
    context.fillRect(6, 13, 32, 15);
    context.fillStyle = '#7a8aba';
    context.fillRect(8, 14, 3, 12);
    context.fillStyle = '#1a2a4a';
    context.fillRect(36, 10, 3, 18);
    const angle = (Math.min(frame, 5) / 5) * (Math.PI / 2);
    const tipX = 40 + Math.cos(angle) * 12;
    const tipY = 26 - Math.sin(angle) * 12;
    line(context, '#c01818', 2, 40, 26, tipX, tipY);
    context.fillStyle = '#c01818';
    context.fillRect(Math.round(tipX) - 3, Math.round(tipY) - 2, 6, 5);
  },
};

/** A small blinking NEW! sticker. */
function newBadge(): Gif {
  const a = bitmapText('NEW!', { font: 'bold 11px "Liberation Sans", Arial, sans-serif', color: '#ff2020', padding: 1 });
  const b = bitmapText('NEW!', { font: 'bold 11px "Liberation Sans", Arial, sans-serif', color: '#ffe020', padding: 1 });
  return {
    width: a.width + 4,
    height: a.height + 2,
    frames: 2,
    fps: 2,
    draw(context, frame) {
      context.fillStyle = frame ? '#c01010' : '#ffe020';
      context.fillRect(0, 0, a.width + 4, a.height + 2);
      context.drawImage(frame ? b : a, 2, 1);
    },
  };
}

export const gifs: Record<string, () => Gif> = {
  construction: () => construction,
  'construction-banner': constructionBanner,
  flames: () => flames,
  skull,
  biker: () => biker,
  mailbox: () => mailbox,
  new: newBadge,
};

/** A tiled star field for the board's black background. */
export const starTile = tileUrl(() => {
  const element = canvas(64, 64);
  const context = context2d(element);
  context.fillStyle = '#000';
  context.fillRect(0, 0, 64, 64);
  const random = seeded(11);
  for (let i = 0; i < 26; i++) {
    const bright = random();
    context.fillStyle = bright > 0.85 ? '#fff' : bright > 0.5 ? '#9a9aa8' : '#4a4a58';
    context.fillRect(Math.floor(random() * 64), Math.floor(random() * 64), 1, 1);
  }
  return element;
});

/** Stef's dark blue marbled background, tiling seamlessly. */
export const marbleTile = tileUrl(() => {
  const size = 96;
  const element = canvas(size, size);
  const context = context2d(element);
  const image = context.createImageData(size, size);
  const tau = Math.PI * 2;
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const u = (x / size) * tau;
      const v = (y / size) * tau;
      const vein = Math.sin(u * 2 + Math.sin(v * 3) * 2.2 + Math.cos(u + v) * 1.5);
      const swirl = Math.sin(v * 2 + Math.cos(u * 3) * 1.8);
      const t = (vein * 0.6 + swirl * 0.4 + 1) / 2;
      const i = (y * size + x) * 4;
      image.data[i] = 20 + t * 40;
      image.data[i + 1] = 30 + t * 60;
      image.data[i + 2] = 90 + t * 120;
      image.data[i + 3] = 255;
    }
  context.putImageData(image, 0, 0);
  return element;
});
