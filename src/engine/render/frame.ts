/** The fixed size of the rendered frame and of the UI coordinate system. */
export const FRAME_WIDTH = 640;
export const FRAME_HEIGHT = 480;

export interface FrameFit {
  scale: number;
  left: number;
  top: number;
}

/**
 * Fits the 4:3 frame into a window. Prefers a whole-number scale when it costs little space,
 * because nearest-neighbor upscaling at fractional scales makes dither patterns uneven.
 */
export function fitFrame(windowWidth: number, windowHeight: number): FrameFit {
  const fit = Math.min(windowWidth / FRAME_WIDTH, windowHeight / FRAME_HEIGHT);
  const whole = Math.floor(fit);
  const scale = whole >= 1 && whole / fit >= 0.85 ? whole : fit;
  return {
    scale,
    left: Math.floor((windowWidth - FRAME_WIDTH * scale) / 2),
    top: Math.floor((windowHeight - FRAME_HEIGHT * scale) / 2),
  };
}

/**
 * Keeps an element sized and centered as the letterboxed frame. Children positioned in
 * 640x480 units can scale with the `--frame-scale` CSS variable.
 */
export function keepFrameFitted(element: HTMLElement): () => void {
  const apply = () => {
    const { scale, left, top } = fitFrame(window.innerWidth, window.innerHeight);
    Object.assign(element.style, {
      left: `${left}px`,
      top: `${top}px`,
      width: `${FRAME_WIDTH * scale}px`,
      height: `${FRAME_HEIGHT * scale}px`,
    });
    element.style.setProperty('--frame-scale', String(scale));
  };
  apply();
  window.addEventListener('resize', apply);
  return () => window.removeEventListener('resize', apply);
}
