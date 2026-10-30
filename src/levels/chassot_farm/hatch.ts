import { dialogues } from '../../content';
import { everyFrame } from '../../game/ambient';
import { combinationLock } from '../../game/combinationLock';
import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { hatchCreak, lockRattle, mew, shackleDrop } from './sounds';

/**
 * The cellar hatch on the east wall of the farmhouse, by the trodden path (A7, A8): two sloping
 * doors, a brass padlock with four wheels, and a low grating beside them that Minet cries
 * through while he is shut in below.
 */

type House = { x: number; z: number; w: number; d: number };

/** Marc's birthday, 3 April 1958, day first as the Swiss write it. */
const CODE = '0304';

/** The middle of the hatch, against the east wall. */
export const hatchAt = (house: House) => ({ x: house.x + house.w / 2 + 0.56, z: house.z });
/** The grating at the foot of the east wall, a little toward the front. */
export const gratingAt = (house: House) => ({ x: house.x + house.w / 2, z: house.z + 1.3 });

/** Whether Minet is still in the cellar. */
export const minetBelow = (ctx: SceneContext) => !ctx.state.hasItem('minet') && !ctx.state.hasFlag('minet_returned');

export function cellarHatch(kit: LevelKit, ctx: SceneContext, house: House, night: boolean): void {
  const hatch = hatchAt(house);
  const grating = gratingAt(house);
  const lock = { x: hatch.x + 0.58, y: 0.2, z: hatch.z };
  const wall = house.x + house.w / 2;

  kit.batch((still) => {
    still.box({ w: 1.15, h: 0.18, d: 1.35 }).texture('stone_wall', { tile: 1 }).color(0x8a8880).at(hatch.x, 0, hatch.z);
    const doors = still.group((g) => {
      [-0.31, 0.31].forEach((dz) => g.box({ w: 1.33, h: 0.05, d: 0.6 }).texture('wood_planks', { tile: 0.8 }).color(0x5a4e40).at(0, 0, dz));
      g.box({ w: 0.08, h: 0.03, d: 0.2 }).texture('rust_metal', { tile: 0.3 }).color(0x5a4a3a).at(0.6, 0.04, 0);
    });
    doors.at(hatch.x, 0.47, hatch.z).object.rotation.z = -0.6;
    // The grating, one bar bent out where the cat got in.
    still.box({ w: 0.03, h: 0.24, d: 0.5 }).color(0x0c0b09).at(wall + 0.02, 0.1, grating.z);
    [-0.18, -0.06, 0.06, 0.18].forEach((dz, i) => {
      const bar = still.box({ w: 0.02, h: 0.26, d: 0.02 }).texture('rust_metal', { tile: 0.3 }).color(0x4a3e34).at(wall + 0.05, 0.09, grating.z + dz);
      if (i === 2) bar.object.rotation.x = 0.35;
    });
  });
  kit.box({ w: 0.06, h: 0.07, d: 0.045 }).color(0xb08a3e).at(lock.x, 0.13, lock.z);
  kit.box({ w: 0.015, h: 0.05, d: 0.035 }).color(0x9a9a92).at(lock.x - 0.01, 0.2, lock.z);
  kit.barrier({ w: 1.15, d: 1.35 }).at(hatch.x, 0, hatch.z);

  let tried = '0000';
  let wrong = 0;
  let looked = false;
  const tryCode = async (code: string) => {
    tried = code;
    if (code === CODE) return true;
    lockRattle(ctx.audio, lock);
    wrong += 1;
    if (wrong === 3) {
      await ctx.dialogue(dialogues.cellar_lock_wrong_3);
      await ctx.dialogue(dialogues.cellar_lock_wrong_3_blind);
    }
    return false;
  };
  kit
    .hotspot({
      prompt: () => (ctx.state.hasFlag('opened_cellar') && !night ? 'Go down into the cellar' : 'Look at the padlock'),
      radius: 0.7,
      onInteract: async () => {
        if (night) return ctx.dialogue(dialogues.cellar_lock_night);
        if (!ctx.state.hasFlag('opened_cellar')) {
          if (!looked) await ctx.dialogue(dialogues.cellar_lock_look);
          looked = true;
          if (!(await combinationLock(ctx, { start: tried, tryCode }))) return;
          shackleDrop(ctx.audio, lock);
          await ctx.dialogue(dialogues.cellar_open);
        }
        hatchCreak(ctx.audio, lock);
        ctx.goTo('chassot_cellar', 'from_farm');
      },
    })
    .at(lock.x + 0.2, 0, lock.z);

  if (night) return;
  kit
    .hotspot({
      prompt: 'Listen',
      radius: 0.6,
      enabled: () => minetBelow(ctx) && !ctx.state.hasFlag('heard_minet'),
      onInteract: () => ctx.dialogue(dialogues.farm_mewing),
    })
    .at(wall + 0.6, 0, grating.z);
  let nextMew = 3;
  everyFrame(kit, (dt) => {
    if (!minetBelow(ctx) || ctx.paused) return;
    nextMew -= dt;
    if (nextMew > 0) return;
    nextMew = 6 + Math.random() * 6;
    mew(ctx.audio, { x: wall + 0.1, y: 0.2, z: grating.z });
  });
}
