import { h, wait } from '../dom';
import { gifs, type Gif } from '../gfx/gifs';
import { counter, pictures } from '../gfx/pictures';
import { canvas, context2d, gridCanvas } from '../gfx/pixels';

/** A piece of a page that arrives after the text: an image, an animation, or a counter. */
export interface Widget {
  element: HTMLElement;
  /** Draws in from the top over `seconds`. Rejects if the load is stopped. */
  arrive?(seconds: number, signal: AbortSignal): Promise<void>;
  tick?(dt: number): void;
}

const brokenRows = [
  'kkkkkkkkkk......',
  'kwwwwwwwwkk.....',
  'kwrrwwwwwkwk....',
  'kwrrwwllwkkkk...',
  'kwwwwwllwwwwk...',
  'kweeewwwwwwwk...',
  'kweeeewwwk.kk...',
  'kkkkkkkkk.......',
  '..........kkkkk.',
  '.kk.....kwwwwwk.',
  'kwk...kwwwwwwwk.',
  'kwwkkkwwlwwwwwk.',
  'kwwwwwwllleewwk.',
  'kwwwwwwwleeeewk.',
  'kkkkkkkkkkkkkkk.',
];

const ROW_STEP = 4;

/** Reveals `element` from the top in bands, the way a picture arrived over a modem. */
async function drawIn(element: HTMLElement, height: number, seconds: number, signal: AbortSignal): Promise<void> {
  const steps = Math.max(1, Math.ceil(height / ROW_STEP));
  for (let i = 1; i <= steps; i++) {
    element.style.clipPath = `inset(0 0 ${Math.max(0, height - i * ROW_STEP)}px 0)`;
    if (seconds > 0) await wait((seconds * 1000) / steps, signal);
  }
  element.style.clipPath = '';
}

/** The empty box Navigator showed where an image had not arrived yet. */
function placeholder(width: number, height: number, alt: string): HTMLElement {
  return h(
    'span',
    {
      class: 'web-ph',
      style: `width:${width}px;height:${height}px`,
    },
    alt,
  );
}

function broken(element: HTMLElement, alt: string): void {
  const icon = gridCanvas(brokenRows);
  icon.className = 'px';
  element.replaceChildren(icon, alt ? ` ${alt}` : '');
  element.classList.add('web-broken');
}

function size(tag: Element, name: string, fallback: number): number {
  return Number(tag.getAttribute(name) ?? fallback);
}

function image(tag: Element): Widget {
  // Logos leave out their size and take the painted picture's.
  const fixed = tag.hasAttribute('w');
  const width = size(tag, 'w', 120);
  const height = size(tag, 'h', 40);
  const alt = tag.getAttribute('alt') ?? '';
  const paint = pictures[tag.getAttribute('src') ?? ''];
  const element = placeholder(width, height, alt);
  return {
    element,
    async arrive(seconds, signal) {
      let picture: HTMLCanvasElement;
      try {
        if (!paint) throw new Error('missing');
        picture = await paint();
      } catch {
        return broken(element, alt);
      }
      const shown = fixed ? { width, height } : { width: picture.width, height: picture.height };
      picture.className = 'px';
      picture.style.cssText = `width:${shown.width}px;height:${shown.height}px;display:block`;
      element.style.cssText = '';
      element.className = 'web-img';
      element.replaceChildren(picture);
      await drawIn(picture, shown.height, seconds, signal);
    },
  };
}

function animation(tag: Element): Widget {
  const gif: Gif | undefined = gifs[tag.getAttribute('name') ?? '']?.();
  if (!gif) {
    const element = placeholder(32, 32, '');
    broken(element, '');
    return { element };
  }
  const picture = canvas(gif.width, gif.height);
  const context = context2d(picture);
  const element = placeholder(gif.width, gif.height, '');
  let time = 0;
  let frame = -1;
  let arrived = false;
  const show = () => {
    const next = Math.floor(time * gif.fps) % gif.frames;
    if (next === frame) return;
    frame = next;
    context.clearRect(0, 0, gif.width, gif.height);
    gif.draw(context, frame);
  };
  return {
    element,
    async arrive(seconds, signal) {
      show();
      element.style.cssText = '';
      element.className = 'web-img';
      element.replaceChildren(picture);
      arrived = true;
      await drawIn(picture, gif.height, seconds, signal);
    },
    tick(dt) {
      if (!arrived) return;
      time += dt;
      show();
    },
  };
}

function hitCounter(tag: Element): Widget {
  const picture = counter(tag.getAttribute('digits') ?? '0');
  const element = placeholder(picture.width, picture.height, '');
  return {
    element,
    async arrive(seconds, signal) {
      element.style.cssText = '';
      element.className = 'web-img';
      element.replaceChildren(picture);
      await drawIn(picture, picture.height, seconds, signal);
    },
  };
}

function brokenImage(tag: Element): Widget {
  const element = placeholder(size(tag, 'w', 32), size(tag, 'h', 32), '');
  broken(element, tag.getAttribute('alt') ?? '');
  return { element };
}

/** Text that crawls right to left, two pixels at a time. */
function marquee(tag: Element): Widget {
  const text = h('span', { style: 'position:absolute;white-space:nowrap;left:0;top:0' }, tag.textContent ?? '');
  const element = h('div', { class: 'web-marquee', style: tag.getAttribute('style') ?? '' }, text);
  let x = Number.NaN;
  let carry = 0;
  return {
    element,
    tick(dt) {
      const width = element.clientWidth;
      if (Number.isNaN(x)) x = width;
      carry += dt * 50;
      const step = Math.floor(carry / 2) * 2;
      carry -= step;
      x -= step;
      if (x < -text.offsetWidth) x = width;
      text.style.transform = `translateX(${x}px)`;
    },
  };
}

const factories: Record<string, (tag: Element) => Widget> = {
  'x-img': image,
  'x-gif': animation,
  'x-counter': hitCounter,
  'x-broken': brokenImage,
  'x-marquee': marquee,
};

/** Replaces every widget tag in a rendered page and returns the widgets in page order. */
export function mountWidgets(root: HTMLElement): Widget[] {
  const tags = [...root.querySelectorAll(Object.keys(factories).join(','))];
  return tags.map((tag) => {
    const widget = factories[tag.tagName.toLowerCase()]!(tag);
    tag.replaceWith(widget.element);
    return widget;
  });
}
