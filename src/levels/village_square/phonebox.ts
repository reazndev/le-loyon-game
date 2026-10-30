import { checkStory, dialogues, holds } from '../../content';
import type { DialogueScript } from '../../game/dialogue';
import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { paintedTexture } from '../forest_path/scrawl';
import { radio } from '../inn/sounds';
import { PHONE_BOX } from './layout';
import { breathOnTheLine, pickUp, ringTone, taxcard } from './sounds';

/**
 * The call to Brodard from the red phone box (A5 and A6): the damp directory, the taxcard and
 * its credit on the little green display, the ringing, the radio behind the carpenter's voice,
 * and the breathing on the line.
 */

const LOOK_UP = 'Look up Brodard, Vauchy.';
const CALL = 'Call Brodard.';
/** The phone on the back wall, where the receiver's sounds come from. */
const PHONE = { x: PHONE_BOX.x + 0.35, y: 1.3, z: PHONE_BOX.z };

/** The script with `id` emptied, so the dialogue ends where it would have gone there. */
const endAt = (script: DialogueScript, id: string): DialogueScript => ({ ...script, nodes: { ...script.nodes, [id]: { lines: [] } } });
const wait = (seconds: number) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));

export interface BrodardCall {
  /** Whether lifting the receiver goes to the Brodard call instead of the box's usual lines. */
  wanted(): boolean;
  use(): Promise<void>;
}

/** Dresses the inside of the phone box and returns the call. */
export function brodardCall(kit: LevelKit, ctx: SceneContext): BrodardCall {
  const display = boxInterior(kit);
  const { audio, state } = ctx;

  const call = async () => {
    display('10.00');
    taxcard(audio, PHONE, false);
    const ringing = ringTone(audio);
    await ctx.dialogue(endAt(dialogues.brodard_call, 'brodard_call.2'));
    ringing.stop();
    pickUp(audio);
    const line = radio(audio, PHONE, 0.035);
    await ctx.dialogue(endAt({ ...dialogues.brodard_call, start: 'brodard_call.2' }, 'brodard_breath'));
    if (state.hasFlag('brodard_called')) {
      const breath = breathOnTheLine(audio);
      await ctx.dialogue(dialogues.brodard_breath);
      breath.stop(2.5);
    }
    line.stop(0.2);
    display(state.hasFlag('brodard_called') ? '2.40' : '9.40');
    taxcard(audio, PHONE, true);
    await wait(4);
    display('');
  };

  return {
    wanted: () => checkStory({ flag: 'knows_brodard', notFlag: 'brodard_called' }, state),
    use: async () => {
      for (;;) {
        const choice = await ctx.ask(endAt(dialogues.phonebox_brodard, 'brodard_call'));
        if (choice === CALL) return call();
        if (choice !== LOOK_UP) return;
        await ctx.readDocument('doc_directory_vauchy');
        if (!holds('has_taxcard', state)) return ctx.dialogue(dialogues.phonebox_no_card);
      }
    },
  };
}

/**
 * The shelf under the phone with the directory on its chain, the card slot, and the green
 * display. Returns what shows the credit; an empty string blanks it.
 */
function boxInterior(kit: LevelKit): (credit: string) => void {
  const lcd = paintedTexture([40, 10], () => undefined);
  const canvas = lcd.image as HTMLCanvasElement;
  const show = (credit: string) => {
    const g = canvas.getContext('2d')!;
    g.fillStyle = credit ? '#5e8a4a' : '#26302a';
    g.fillRect(0, 0, 40, 10);
    g.fillStyle = '#10200e';
    g.font = '9px monospace';
    g.textBaseline = 'middle';
    g.fillText(credit, 6, 5.5);
    lcd.needsUpdate = true;
  };
  show('');
  kit
    .group((g) => {
      // The box faces local +Z; the phone hangs on the back wall at z -0.38.
      g.box({ w: 0.1, h: 0.035, d: 0.01 }).map(lcd, { tile: [0.1, 0.035] }).unlit().at(0.02, 1.27, -0.317);
      g.box({ w: 0.012, h: 0.07, d: 0.01 }).color(0x0c0c0c).at(0.1, 1.15, -0.317);
      g.box({ w: 0.62, h: 0.03, d: 0.26 }).texture('wood_planks', { tile: 0.6 }).color(0x4a3e32).at(0, 0.92, -0.3);
      // The directory, swollen with damp, on a chain screwed to the shelf.
      g.box({ w: 0.24, h: 0.07, d: 0.3 }).color(0xb8ac78).at(-0.14, 0.95, -0.27).rotY(8);
      g.box({ w: 0.01, h: 0.01, d: 0.2 }).color(0x6a6a66).at(0.02, 0.955, -0.33);
    })
    .at(PHONE_BOX.x, 0, PHONE_BOX.z)
    .rotY(-90)
    .dynamic();
  return show;
}
