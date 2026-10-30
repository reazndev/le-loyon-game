export type Child = Node | string | null | undefined | false | readonly Child[];

type Handler = (event: MouseEvent) => void;

export interface Props {
  class?: string;
  style?: string;
  onClick?: Handler;
  onMouseDown?: Handler;
  /** Any other HTML attributes, such as `colspan` or `title`. */
  attrs?: Record<string, string>;
}

/** Builds an element with a class, handlers, and children in one expression. */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Props | string | null = null,
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  const options: Props = typeof props === 'string' ? { class: props } : (props ?? {});
  if (options.class) element.className = options.class;
  if (options.style) element.setAttribute('style', options.style);
  const target: HTMLElement = element;
  if (options.onClick) target.addEventListener('click', options.onClick);
  if (options.onMouseDown) target.addEventListener('mousedown', options.onMouseDown);
  Object.entries(options.attrs ?? {}).forEach(([name, value]) => element.setAttribute(name, value));
  append(element, children);
  return element;
}

function append(parent: HTMLElement, children: readonly Child[]): void {
  children.forEach((child) => {
    if (child === null || child === undefined || child === false) return;
    if (typeof child === 'string') parent.append(child);
    else if (child instanceof Node) parent.append(child);
    else append(parent, child);
  });
}

/** Escapes text for use inside page HTML. */
export function esc(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Resolves after `ms`, or rejects with an AbortError when `signal` aborts first. */
export function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason);
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });
}
