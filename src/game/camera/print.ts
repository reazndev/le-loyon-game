import { VIEWFINDER } from '../../engine/ui/viewfinder';

/** Side of the square print, in pixels. The photo view shows it at this size in the 640x480 frame. */
export const PRINT_SIZE = 240;

/**
 * Turns a rendered frame into an instant print: the viewfinder square, softened, with lifted
 * blacks, cool shadows, warm highlights, a vignette, and grain. Returns a JPEG data URL.
 * `figure` adds the shape at the treeline in photo 7, which the player never saw in the scene.
 */
export function printPhoto(frame: CanvasImageSource, options: { figure?: boolean } = {}): string {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = PRINT_SIZE;
  const context = canvas.getContext('2d')!;
  context.imageSmoothingEnabled = true;
  context.drawImage(frame, VIEWFINDER.x, VIEWFINDER.y, VIEWFINDER.size, VIEWFINDER.size, 0, 0, PRINT_SIZE, PRINT_SIZE);
  if (options.figure) drawTreelineFigure(context);
  grade(context);
  return canvas.toDataURL('image/jpeg', 0.82);
}

function grade(context: CanvasRenderingContext2D): void {
  const image = context.getImageData(0, 0, PRINT_SIZE, PRINT_SIZE);
  const data = image.data;
  const half = PRINT_SIZE / 2;
  for (let i = 0; i < data.length; i += 4) {
    const x = (i / 4) % PRINT_SIZE;
    const y = Math.floor(i / 4 / PRINT_SIZE);
    const [r, g, b] = [data[i]!, data[i + 1]!, data[i + 2]!];
    const luma = 0.3 * r + 0.59 * g + 0.11 * b;
    const light = luma / 255;
    const vignette = 1 - 0.5 * (((x - half) ** 2 + (y - half) ** 2) / (half * half * 2)) ** 1.2;
    const grain = (Math.random() - 0.5) * 12;
    // Instant film never reaches true black, and its dyes drift teal in the shadows and amber in the light.
    const tone = (channel: number, shadow: number, highlight: number) =>
      (14 + (luma + (channel - luma) * 0.8) * 0.9 + shadow * (1 - light) + highlight * light) * vignette + grain;
    data[i] = tone(r, -3, 10);
    data[i + 1] = tone(g, 3, 4);
    data[i + 2] = tone(b, 7, -10);
  }
  context.putImageData(image, 0, 0);
}

/**
 * A pale oval at head height over a darker upright shape, far back between two trunks. A faint
 * patch of fog behind it is all that lets the dark shape show against the night.
 */
function drawTreelineFigure(context: CanvasRenderingContext2D): void {
  const x = PRINT_SIZE * 0.64;
  const top = PRINT_SIZE * 0.3;
  context.save();
  const haze = context.createRadialGradient(x, top + 14, 2, x, top + 14, 42);
  haze.addColorStop(0, 'rgba(120, 124, 122, 0.16)');
  haze.addColorStop(1, 'rgba(120, 124, 122, 0)');
  context.fillStyle = haze;
  context.fillRect(x - 42, top - 28, 84, 84);
  context.filter = 'blur(0.7px)';
  // Spruce trunks run up out of the frame and fade into the dark below.
  const trunk = context.createLinearGradient(0, 0, 0, top + 44);
  trunk.addColorStop(0, 'rgba(64, 66, 64, 0.2)');
  trunk.addColorStop(1, 'rgba(64, 66, 64, 0)');
  context.fillStyle = trunk;
  [x - 21, x + 13, x + 37].forEach((left, i) => context.fillRect(left, 0, 2 + (i % 2), top + 44));
  context.fillStyle = 'rgba(2, 2, 2, 0.8)';
  context.beginPath();
  context.moveTo(x - 2.5, top + 4);
  context.lineTo(x + 2.5, top + 4);
  context.lineTo(x + 4, top + 27);
  context.lineTo(x - 3.5, top + 27);
  context.fill();
  context.fillStyle = 'rgba(176, 174, 164, 0.7)';
  context.beginPath();
  context.ellipse(x, top + 1.5, 2, 2.8, 0, 0, Math.PI * 2);
  context.fill();
  context.restore();
}
