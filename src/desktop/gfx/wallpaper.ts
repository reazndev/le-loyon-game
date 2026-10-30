import { canvas, context2d, seeded, tileUrl } from './pixels';

/** The motorbike picture Yannick set as the inn computer's wallpaper: a red sports bike at dusk. */
export const motorbikeWallpaper = tileUrl(() => {
  const element = canvas(256, 160);
  const context = context2d(element);
  const sky = context.createLinearGradient(0, 0, 0, 110);
  sky.addColorStop(0, '#2a2348');
  sky.addColorStop(0.6, '#a04a3a');
  sky.addColorStop(1, '#e09a50');
  context.fillStyle = sky;
  context.fillRect(0, 0, 256, 110);
  context.fillStyle = '#2a2a30';
  context.fillRect(0, 110, 256, 50);
  context.fillStyle = '#e0d070';
  for (let x = 0; x < 256; x += 32) context.fillRect(x, 140, 18, 2);

  const wheel = (x: number) => {
    context.fillStyle = '#111';
    context.beginPath();
    context.arc(x, 112, 21, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#8a8a90';
    context.beginPath();
    context.arc(x, 112, 11, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#222';
    context.fillRect(x - 2, 110, 4, 4);
  };
  wheel(72);
  wheel(188);
  const body = (color: string, points: number[]) => {
    context.fillStyle = color;
    context.beginPath();
    context.moveTo(points[0]!, points[1]!);
    for (let i = 2; i < points.length; i += 2) context.lineTo(points[i]!, points[i + 1]!);
    context.closePath();
    context.fill();
  };
  body('#555', [72, 112, 110, 86, 150, 92, 188, 112, 176, 112, 146, 100, 112, 100, 80, 114]);
  body('#c8201c', [96, 84, 150, 70, 196, 80, 206, 96, 176, 98, 140, 96, 108, 96]);
  body('#e83a2a', [120, 70, 160, 62, 176, 72, 150, 80, 126, 80]);
  body('#151515', [74, 76, 118, 70, 126, 78, 92, 84]);
  body('#9aa0a8', [60, 96, 96, 92, 98, 98, 62, 102]);
  body('#f4f2c0', [200, 82, 210, 84, 208, 92, 200, 90]);
  body('#222', [188, 64, 198, 60, 202, 80, 194, 82]);

  // Noise, as a JPEG passed around on floppies would have.
  const image = context.getImageData(0, 0, 256, 160);
  const random = seeded(7);
  for (let i = 0; i < image.data.length; i += 4) {
    const n = (random() - 0.5) * 18;
    for (let c = 0; c < 3; c++) image.data[i + c] = image.data[i + c]! + n;
  }
  context.putImageData(image, 0, 0);
  context.strokeStyle = '#f4f2ea';
  context.strokeRect(0.5, 0.5, 255, 159);
  return element;
});
