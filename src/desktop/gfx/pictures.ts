import { bitmapText, canvas, context2d, seeded } from './pixels';

/** Still images on the web pages, painted in code or processed from the sighting photos. */

type Painter = () => Promise<HTMLCanvasElement> | HTMLCanvasElement;

const photoUrl = (name: string) => `${import.meta.env.BASE_URL}assets/photos/${name}.jpg`;

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Missing image ${url}`));
    image.src = url;
  });
}

interface Crop {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Crops and scales a photo, then gives it the green cast and blocky JPEG look of a cheap scan. */
async function scannedPhoto(name: string, crop: Crop, width: number, height: number, options: { tilt?: number; smear?: number; smooth?: boolean } = {}): Promise<HTMLCanvasElement> {
  const source = await loadImage(photoUrl(name));
  const element = canvas(width, height);
  const context = context2d(element);
  context.imageSmoothingEnabled = options.smooth ?? true;
  context.fillStyle = '#222';
  context.fillRect(0, 0, width, height);
  context.save();
  context.translate(width / 2, height / 2);
  context.rotate(((options.tilt ?? 0) * Math.PI) / 180);
  const scale = options.tilt ? 1.08 : 1;
  const draw = (dx: number, alpha: number) => {
    context.globalAlpha = alpha;
    context.drawImage(source, crop.x, crop.y, crop.w, crop.h, -width / 2 * scale + dx, -height / 2 * scale, width * scale, height * scale);
  };
  draw(0, 1);
  // Motion blur from a photo taken while riding.
  for (let i = 1; i <= (options.smear ?? 0); i++) draw(i * 1.5, 0.28);
  context.restore();
  context.globalAlpha = 1;
  jpegBlocks(context, width, height, 0.35);
  colorCast(context, width, height);
  return element;
}

/** Pulls each 8x8 block toward its average, like a heavily compressed JPEG. */
function jpegBlocks(context: CanvasRenderingContext2D, width: number, height: number, amount: number): void {
  const image = context.getImageData(0, 0, width, height);
  const data = image.data;
  for (let by = 0; by < height; by += 8)
    for (let bx = 0; bx < width; bx += 8) {
      const sum = [0, 0, 0];
      let count = 0;
      for (let y = by; y < Math.min(by + 8, height); y++)
        for (let x = bx; x < Math.min(bx + 8, width); x++) {
          const i = (y * width + x) * 4;
          sum[0]! += data[i]!;
          sum[1]! += data[i + 1]!;
          sum[2]! += data[i + 2]!;
          count++;
        }
      for (let y = by; y < Math.min(by + 8, height); y++)
        for (let x = bx; x < Math.min(bx + 8, width); x++) {
          const i = (y * width + x) * 4;
          for (let c = 0; c < 3; c++) data[i + c] = data[i + c]! * (1 - amount) + (sum[c]! / count) * amount;
        }
    }
  context.putImageData(image, 0, 0);
}

function colorCast(context: CanvasRenderingContext2D, width: number, height: number): void {
  const image = context.getImageData(0, 0, width, height);
  const data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 12 + data[i]! * 0.86;
    data[i + 1] = 16 + data[i + 1]! * 0.95;
    data[i + 2] = 10 + data[i + 2]! * 0.8;
  }
  context.putImageData(image, 0, 0);
}

const pathCrop: Crop = { x: 0, y: 40, w: 320, h: 240 };
const zoomCrop: Crop = { x: 150, y: 104, w: 52, h: 39 };
const villageCrop: Crop = { x: 0, y: 30, w: 320, h: 240 };

/** Stef's third photo with the handwritten label and the thumb smudge over its middle. */
async function villagePhoto(width: number, height: number): Promise<HTMLCanvasElement> {
  const element = await scannedPhoto('photo_sighting_cemetery', villageCrop, width, height, { tilt: -3, smear: 3 });
  const context = context2d(element);
  const k = width / 320;
  // Stef's label on the print, with a thumb smudge from the scanner glass over the "e".
  const font = `italic ${Math.round(20 * k)}px "Comic Sans MS", "Liberation Serif", cursive`;
  context.font = font;
  const first = context.measureText('L').width;
  const second = context.measureText('e').width;
  const label = { x: 232 * k, y: 226 * k };
  context.save();
  context.translate(label.x, label.y);
  context.rotate(-0.06);
  context.fillStyle = 'rgba(232, 228, 210, 0.92)';
  context.fillRect(-6 * k, -18 * k, 76 * k, 26 * k);
  context.fillStyle = '#1a2a8a';
  context.fillText('Leurs', 0, 0);
  const smudge = { x: first + second / 2, y: -6 * k };
  const shade = context.createRadialGradient(smudge.x, smudge.y, 1, smudge.x, smudge.y, 11 * k);
  shade.addColorStop(0, 'rgba(58, 50, 40, 0.98)');
  shade.addColorStop(0.65, 'rgba(78, 68, 52, 0.94)');
  shade.addColorStop(1, 'rgba(80, 70, 52, 0)');
  context.fillStyle = shade;
  context.beginPath();
  context.ellipse(smudge.x, smudge.y, 7 * k, 12 * k, 0.3, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = 'rgba(30, 26, 20, 0.45)';
  context.lineWidth = Math.max(1, k);
  for (let r = 2; r < 9; r += 2.2) {
    context.beginPath();
    context.ellipse(smudge.x, smudge.y + k, r * k * 0.6, r * k, 0.3, 3.4, 6.2);
    context.stroke();
  }
  context.restore();
  return element;
}

/** The scanned death notice from 1995, skewed, creased, and half lost to the microfilm. */
function deathNotice(): HTMLCanvasElement {
  const element = canvas(260, 350);
  const context = context2d(element);
  context.imageSmoothingEnabled = true;
  context.fillStyle = '#121212';
  context.fillRect(0, 0, 260, 350);
  context.save();
  context.translate(138, 172);
  context.rotate((4 * Math.PI) / 180);
  context.fillStyle = '#b9b7ae';
  context.fillRect(-110, -165, 224, 330);
  context.strokeStyle = '#1c1c1c';
  context.lineWidth = 2;
  context.strokeRect(-100, -155, 204, 312);

  // Each line is parts drawn left to right: plain text, text blurred past reading, or a gap
  // the crease will cover.
  type Part = string | { blur: string } | { gap: number };
  const serif = (size: number, bold = false) => `${bold ? 'bold ' : ''}${size}px "Liberation Serif", serif`;
  const lines: [Part[], number, string][] = [
    [['+'], -132, serif(14)],
    [['Dieu a rappelé à Lui, loin des siens,'], -110, serif(11)],
    [['Monsieur'], -86, serif(12)],
    [[{ blur: 'Marc CHASSOT' }], -68, serif(17, true)],
    [["décédé accidentellement à l'étranger"], -46, serif(11)],
    [['dans sa 38e année.'], -32, serif(11)],
    [['Font part de leur peine :'], -12, serif(11)],
    [['Sa maman, ', { blur: 'Thérèse Chassot-Kolly' }, ', à L', { gap: 16 }, 'urs ;'], 2, serif(10)],
    [['Son parrain et sa marraine,'], 16, serif(10)],
    [[{ blur: 'Jean-Pierre et Odile Gremaud' }, ' ;'], 29, serif(10)],
    [["Ses amis d'enfance ", { blur: 'Daniel, Gilles' }], 42, serif(10)],
    [['ainsi que les familles parentes et alliées.'], 55, serif(10)],
    [["La messe d'enterrement sera célébrée"], 76, serif(10)],
    [["en l'église de L", { gap: 16 }, 'urs, le samedi'], 89, serif(10)],
    [['18 novembre 1995, à 14 h 30.'], 102, serif(10)],
    [[{ blur: 'Une veillée de prières aura lieu' }], 117, serif(10)],
    [['Cet avis tient lieu de lettre de faire-part.'], 140, serif(9)],
  ];
  const width = (part: Part) =>
    typeof part === 'string' ? context.measureText(part).width : 'gap' in part ? part.gap : context.measureText(part.blur).width;
  const gaps: { x: number; y: number }[] = [];
  // The microfilm reader never quite focused.
  context.filter = 'blur(0.45px)';
  lines.forEach(([parts, y, font]) => {
    context.font = font;
    let x = 2 - parts.reduce((sum, part) => sum + width(part), 0) / 2;
    parts.forEach((part) => {
      context.fillStyle = '#222';
      if (typeof part === 'string') context.fillText(part, x, y);
      else if ('blur' in part) {
        context.filter = 'blur(1.7px)';
        context.fillText(part.blur, x, y);
        context.filter = 'blur(0.45px)';
      } else gaps.push({ x: x + part.gap / 2, y: y - 3 });
      x += width(part);
    });
  });
  context.filter = 'none';

  // The clipping was folded twice. Each fold runs across a place name and the ink there has
  // worn to black, so only "L" and "urs" show.
  const slope = 0.1;
  gaps.forEach((gap) => {
    const across = (x: number) => gap.y + slope * (x - gap.x);
    [
      ['rgba(90, 90, 86, 0.35)', 5],
      ['rgba(24, 24, 24, 0.8)', 2],
    ].forEach(([color, lineWidth]) => {
      context.strokeStyle = color as string;
      context.lineWidth = lineWidth as number;
      context.beginPath();
      context.moveTo(-112, across(-112));
      context.lineTo(114, across(114));
      context.stroke();
    });
    context.fillStyle = 'rgba(18, 18, 18, 0.97)';
    context.beginPath();
    context.ellipse(gap.x, gap.y, 8.5, 6, Math.atan(slope), 0, Math.PI * 2);
    context.fill();
  });
  context.restore();

  // Moiré from the microfilm reader.
  context.strokeStyle = '#000';
  context.lineWidth = 1;
  [
    [3, 0.98, 0.12],
    [3.2, 1.06, 0.1],
  ].forEach(([spacing, slope, alpha]) => {
    context.globalAlpha = alpha!;
    for (let x = -400; x < 260; x += spacing!) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x + 350 * slope!, 350);
      context.stroke();
    }
  });
  context.globalAlpha = 1;
  const edge = context.createLinearGradient(0, 0, 40, 0);
  edge.addColorStop(0, 'rgba(0,0,0,0.9)');
  edge.addColorStop(1, 'rgba(0,0,0,0)');
  context.fillStyle = edge;
  context.fillRect(0, 0, 40, 350);
  const thumb = context.createRadialGradient(170, 352, 4, 170, 352, 60);
  thumb.addColorStop(0, 'rgba(0,0,0,0.75)');
  thumb.addColorStop(1, 'rgba(0,0,0,0)');
  context.fillStyle = thumb;
  context.fillRect(100, 280, 140, 70);

  const image = context.getImageData(0, 0, 260, 350);
  const random = seeded(19);
  for (let i = 0; i < image.data.length; i += 4) {
    const gray = image.data[i]! * 0.33 + image.data[i + 1]! * 0.5 + image.data[i + 2]! * 0.17 + (random() - 0.5) * 22;
    image.data[i] = image.data[i + 1] = image.data[i + 2] = gray;
  }
  context.putImageData(image, 0, 0);
  return element;
}

/** Stef's red bike against a garage door, with the camera's date stamp. */
function bikePhoto(): HTMLCanvasElement {
  const element = canvas(200, 150);
  const context = context2d(element);
  context.imageSmoothingEnabled = true;
  context.fillStyle = '#5e6c5c';
  context.fillRect(0, 0, 200, 112);
  context.fillStyle = '#4a5648';
  for (let y = 8; y < 112; y += 14) context.fillRect(0, y, 200, 2);
  context.fillStyle = '#6a665e';
  context.fillRect(0, 112, 200, 38);
  const wheel = (x: number) => {
    context.strokeStyle = '#111';
    context.lineWidth = 5;
    context.beginPath();
    context.arc(x, 108, 25, 0, Math.PI * 2);
    context.stroke();
    context.strokeStyle = '#999';
    context.lineWidth = 1;
    for (let a = 0; a < Math.PI; a += Math.PI / 6) {
      context.beginPath();
      context.moveTo(x - Math.cos(a) * 22, 108 - Math.sin(a) * 22);
      context.lineTo(x + Math.cos(a) * 22, 108 + Math.sin(a) * 22);
      context.stroke();
    }
  };
  wheel(52);
  wheel(148);
  context.strokeStyle = '#c81c1c';
  context.lineWidth = 5;
  context.beginPath();
  context.moveTo(52, 108);
  context.lineTo(92, 108);
  context.lineTo(132, 70);
  context.lineTo(80, 68);
  context.lineTo(92, 108);
  context.moveTo(132, 70);
  context.lineTo(148, 108);
  context.stroke();
  context.fillStyle = '#111';
  context.fillRect(70, 58, 22, 6);
  context.fillRect(126, 54, 26, 4);
  const flash = context.createRadialGradient(100, 70, 5, 100, 70, 130);
  flash.addColorStop(0, 'rgba(255,255,240,0.28)');
  flash.addColorStop(1, 'rgba(0,0,0,0.35)');
  context.fillStyle = flash;
  context.fillRect(0, 0, 200, 150);
  context.fillStyle = '#f08a2a';
  context.font = 'bold 9px monospace';
  context.fillText("5 12 '96", 146, 142);
  jpegBlocks(context, 200, 150, 0.3);
  colorCast(context, 200, 150);
  return element;
}

/** The church of Leurs in summer, for Yannick's school page. */
function churchPhoto(): HTMLCanvasElement {
  const element = canvas(200, 150);
  const context = context2d(element);
  context.imageSmoothingEnabled = true;
  const sky = context.createLinearGradient(0, 0, 0, 90);
  sky.addColorStop(0, '#4a86c8');
  sky.addColorStop(1, '#a8c8e4');
  context.fillStyle = sky;
  context.fillRect(0, 0, 200, 100);
  context.fillStyle = '#5a8a3a';
  context.beginPath();
  context.moveTo(0, 104);
  context.quadraticCurveTo(100, 84, 200, 100);
  context.lineTo(200, 150);
  context.lineTo(0, 150);
  context.fill();
  context.fillStyle = '#e8e2d2';
  context.fillRect(60, 64, 70, 40);
  context.fillRect(122, 40, 18, 64);
  context.fillStyle = '#8a4a32';
  context.beginPath();
  context.moveTo(54, 66);
  context.lineTo(95, 46);
  context.lineTo(126, 66);
  context.fill();
  context.fillStyle = '#3a3a3e';
  context.beginPath();
  context.moveTo(119, 42);
  context.lineTo(131, 6);
  context.lineTo(143, 42);
  context.fill();
  context.fillStyle = '#222';
  context.fillRect(130, 1, 2, 6);
  context.fillRect(128, 3, 6, 1);
  context.fillRect(87, 84, 12, 20);
  [20, 36, 168, 184].forEach((x) => {
    context.fillStyle = '#2e5a28';
    context.beginPath();
    context.ellipse(x, 88, 11, 20, 0, 0, Math.PI * 2);
    context.fill();
  });
  jpegBlocks(context, 200, 150, 0.3);
  return element;
}

/** The dating site banner at the top of the free guestbook. */
function singlesAd(): HTMLCanvasElement {
  const element = canvas(468, 60);
  const context = context2d(element);
  const fill = context.createLinearGradient(0, 0, 468, 0);
  fill.addColorStop(0, '#c0186a');
  fill.addColorStop(1, '#e83a2a');
  context.fillStyle = fill;
  context.fillRect(0, 0, 468, 60);
  context.fillStyle = '#ff9ac8';
  [20, 48, 420, 446].forEach((x, i) => {
    const y = i % 2 ? 40 : 18;
    context.beginPath();
    context.arc(x - 4, y, 5, 0, Math.PI * 2);
    context.arc(x + 4, y, 5, 0, Math.PI * 2);
    context.moveTo(x - 9, y + 2);
    context.lineTo(x, y + 12);
    context.lineTo(x + 9, y + 2);
    context.fill();
  });
  const title = bitmapText('Meet singles in YOUR area!', { font: 'bold 22px "Liberation Sans", Arial, sans-serif', color: '#fff', shadow: '#5a0020' });
  context.drawImage(title, 70, 6);
  context.fillStyle = '#ffe020';
  context.fillRect(150, 36, 168, 18);
  const button = bitmapText('CLICK HERE - FREE!', { font: 'bold 12px "Liberation Sans", Arial, sans-serif', color: '#111' });
  context.drawImage(button, 234 - button.width / 2, 37);
  return element;
}

const asciiBanner = [
  '     _    _       _              _                                _ _',
  "    / \\  | |_ __ (_)_ __   ___  / \\   _ __   ___  _ __ ___   __ _| (_) ___  ___",
  "   / _ \\ | | '_ \\| | '_ \\ / _ \\/ _ \\ | '_ \\ / _ \\| '_ ` _ \\ / _` | | |/ _ \\/ __|",
  '  / ___ \\| | |_) | | | | |  __/ ___ \\| | | | (_) | | | | | | (_| | | |  __/\\__ \\',
  ' /_/   \\_\\_| .__/|_|_| |_|\\___/_/   \\_\\_| |_|\\___/|_| |_| |_|\\__,_|_|_|\\___||___/',
  '           |_|',
];

/** The board's ASCII-art title, in small yellow Courier. */
function boardBanner(): HTMLCanvasElement {
  const rows = asciiBanner.map((row) => bitmapText(row || ' ', { font: '11px "Liberation Mono", "Courier New", monospace', color: '#f0e040', padding: 0 }));
  const element = canvas(Math.max(...rows.map((r) => r.width)), rows.length * 11 + 2);
  const context = context2d(element);
  rows.forEach((row, i) => context.drawImage(row, 0, i * 11));
  return element;
}

/** Seven odometer digits, white on black, as a hit counter. */
export function counter(digits: string): HTMLCanvasElement {
  const cell = 12;
  const element = canvas(digits.length * cell + 2, 20);
  const context = context2d(element);
  context.fillStyle = '#555';
  context.fillRect(0, 0, element.width, 20);
  [...digits].forEach((digit, i) => {
    const x = 1 + i * cell;
    const shade = context.createLinearGradient(0, 1, 0, 19);
    shade.addColorStop(0, '#000');
    shade.addColorStop(0.5, '#2a2a2a');
    shade.addColorStop(1, '#000');
    context.fillStyle = shade;
    context.fillRect(x, 1, cell - 1, 18);
    const glyph = bitmapText(digit, { font: 'bold 14px "Liberation Mono", monospace', color: '#f4f4f4', padding: 0 });
    context.drawImage(glyph, x + Math.round((cell - 1 - glyph.width) / 2), 3);
  });
  return element;
}

function logo(text: string, font: string, color: string, shadow: string): Painter {
  return () => bitmapText(text, { font, color, shadow, padding: 3 });
}

export const pictures: Record<string, Painter> = {
  'stef-1': () => scannedPhoto('photo_sighting_path', pathCrop, 320, 240),
  'stef-1-thumb': () => scannedPhoto('photo_sighting_path', pathCrop, 160, 120),
  'stef-2': () => scannedPhoto('photo_sighting_path', zoomCrop, 320, 240, { smooth: false }),
  'stef-2-thumb': () => scannedPhoto('photo_sighting_path', zoomCrop, 160, 120, { smooth: false }),
  'stef-3': () => villagePhoto(320, 240),
  'stef-3-thumb': () => villagePhoto(160, 120),
  'death-notice': deathNotice,
  bike: bikePhoto,
  church: churchPhoto,
  'singles-ad': singlesAd,
  'board-banner': boardBanner,
  'helvenet-logo': logo('HELVENET', 'bold 34px "Liberation Serif", "Times New Roman", serif', '#1a3a9a', '#a8b8d8'),
  'motonet-logo': logo('MotoNet Romandie', 'bold italic 28px "Liberation Sans", Arial, sans-serif', '#e02010', '#f0c818'),
};
