import { h } from '../dom';
import { canvas, context2d } from '../gfx/pixels';
import { closeGlyph, titleButton } from './window';

/** A modal box with a message and an OK button. Resolves when it closes. */
export function messageBox(layer: HTMLElement, title: string, text: string): { done: Promise<void>; close: () => void } {
  let close = () => undefined as void;
  const done = new Promise<void>((resolve) => {
    const modal = h('div', 'pc-modal');
    close = () => {
      modal.remove();
      resolve();
    };
    const box = h(
      'div',
      { class: 'win raised active', style: 'width:max-content;max-width:440px' },
      h('div', 'win-title', h('span', 'win-title-text', title), titleButton(closeGlyph, close)),
      h('div', 'pc-msg-body', infoIcon(), h('div', { style: 'padding-top:6px;white-space:pre-line' }, text)),
      h('div', 'pc-msg-buttons', h('div', { class: 'btn', onClick: close }, 'OK')),
    );
    modal.append(box);
    layer.append(modal);
    const width = box.offsetWidth;
    const height = box.offsetHeight;
    Object.assign(box.style, { left: `${Math.round((640 - width) / 2)}px`, top: `${Math.round((452 - height) / 2)}px` });
  });
  return { done, close };
}

function infoIcon(): HTMLCanvasElement {
  const element = canvas(16, 16, 'px icon icon-32');
  const context = context2d(element);
  for (let j = 0; j < 16; j++)
    for (let i = 0; i < 16; i++) {
      const d = Math.hypot(i - 7.5, j - 7.5);
      if (d > 7.6) continue;
      context.fillStyle = d > 6.6 ? '#1a1916' : '#2a4ac0';
      context.fillRect(i, j, 1, 1);
    }
  context.fillStyle = '#fff';
  context.fillRect(7, 3, 2, 2);
  context.fillRect(6, 6, 3, 1);
  context.fillRect(7, 7, 2, 5);
  context.fillRect(6, 12, 4, 1);
  return element;
}
