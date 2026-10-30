import { caught, checkStory } from '../../content';
import { readSave, writeSave } from '../../game/save';
import type { SceneContext } from '../../game/scene';
import { playNode } from '../forest_path/play';

/**
 * The save the game returns to after `caught`: the one made when the reporter last woke. The inn
 * writes it on waking; the night of the dig writes one too, the first time the reporter sets out.
 */
export const SLEEP_SLOT = 'sleep';

/** Saves the start of night 2 at `scene`'s default spawn, once per night. */
export function saveNightTwoStart(ctx: SceneContext, scene: string): void {
  const { state } = ctx;
  if (state.time !== 'night' || state.count('night') !== 2) return;
  const last = readSave(localStorage, SLEEP_SLOT);
  if (last?.time === 'night' && last.counts?.night === 2) return;
  writeSave(localStorage, SLEEP_SLOT, { ...state.snapshot(), scene });
}

/** Loads the last sleep, or starts the path again with the failure forgotten if there is none. */
function continueFromLastSleep(ctx: SceneContext): void {
  const file = readSave(localStorage, SLEEP_SLOT);
  if (file) {
    ctx.state.restore(file);
    ctx.goTo(file.scene);
    return;
  }
  ctx.state.setFlag('caught', false);
  ctx.goTo('cemetery_path');
}

/** "Bouge pas!" Then black, the caught text from the script, and the way back. */
export async function caughtByRaymond(ctx: SceneContext): Promise<void> {
  await playNode(ctx, 'raymond_caught');
  const text = caught.texts.find((passage) => checkStory(passage.if, ctx.state))!.text;
  const screen = document.createElement('div');
  screen.style.cssText =
    'position:absolute;inset:0;background:#000;color:#e8e4dc;display:flex;flex-direction:column;justify-content:center;padding:0 72px;opacity:0;transition:opacity 2s;white-space:pre-wrap;line-height:1.35';
  const body = Object.assign(document.createElement('div'), { textContent: text });
  const action = Object.assign(document.createElement('div'), { textContent: `[ ${caught.action} ]` });
  action.style.cssText = 'margin-top:28px;align-self:center;opacity:0;transition:opacity 1.5s';
  screen.append(body, action);
  let shown = 0;
  const handle = ctx.openScreen(screen, (dt, input) => {
    shown += dt;
    if (shown > 2.5) action.style.opacity = '1';
    if (shown > 2.5 && input.pressed('interact')) {
      handle.close();
      continueFromLastSleep(ctx);
    }
  });
  requestAnimationFrame(() => requestAnimationFrame(() => (screen.style.opacity = '1')));
}
