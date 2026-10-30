import type { ScreenHandle } from '../../game/gameUi';
import type { SceneContext } from '../../game/scene';

/** Small white lines on black, such as the date and time before the next day starts. */
export function showTitleCard(ctx: SceneContext, lines: string[]): ScreenHandle {
  const card = document.createElement('div');
  card.style.cssText =
    'position:absolute;inset:0;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;color:#e8e4dc;opacity:0;transition:opacity 1.2s';
  card.append(...lines.map((line) => Object.assign(document.createElement('div'), { textContent: line })));
  const handle = ctx.openScreen(card, () => undefined);
  requestAnimationFrame(() => requestAnimationFrame(() => (card.style.opacity = '1')));
  return handle;
}
