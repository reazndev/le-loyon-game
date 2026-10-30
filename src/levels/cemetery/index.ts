import { greenery } from './greenery';
import type { LevelKit } from '../../game/kit/levelKit';
import { crows } from '../../game/ambient';
import { playSound } from '../../game/scares/sounds';
import { defineScene, type SceneContext } from '../../game/scene';
import { everyFrame } from '../church/everyFrame';
import { playNode } from '../forest_path/play';
import { isNight, storyPhase, type StoryPhase } from '../forest_path/story';
import { hillAmbience, hillAtmosphere } from './atmosphere';
import { BackGate } from './backGate';
import { stageCemetery } from './beats';
import { saveNightTwoStart } from './caught';
import { DigSite } from './digSite';
import { floor, hill, oldStones, tapAndBin, walls } from './grounds';
import { graveStones, readGrave } from './graves';
import { BACK_GATE, BACK_Z, FRONT_Z, GRAVE_FOOT, refusalFor, WALL_HEIGHT, type Grave } from './layout';
import { ossuary } from './shed';
import { nightTwoRound } from './watchman';

/**
 * Cimetière. Forty graves inside a waist-high wall on the hilltop, the ossuary shed by the front
 * gate, the Chassot plot in the back row against the Bois-Noir. Night 1 is the three graves, the
 * dog, and the figure at the back wall; night 2 is the dig and Raymond's rounds.
 */
export const cemeteryScene = defineScene({
  id: 'cemetery',
  spawns: {
    default: { x: 0, z: FRONT_Z - 1.2, yaw: 0 },
    front_gate: { x: 0, z: FRONT_Z - 1.2, yaw: 0 },
    back_gate: { x: BACK_GATE.x, z: BACK_Z + 1.4, yaw: 180 },
    chassot: { x: GRAVE_FOOT.x + 0.3, z: GRAVE_FOOT.z + 0.6, yaw: 0 },
  },
  atmosphere: hillAtmosphere,

  build(kit, ctx) {
    const { state } = ctx;
    const phase = storyPhase(state);
    const night = isNight(phase);
    saveNightTwoStart(ctx, 'cemetery_path');

    kit.ground('grass', 0);
    kit.batch((still) => {
      hill(still, night);
      floor(still);
      walls(still);
      greenery(still);
      tapAndBin(still);
      oldStones(still, ctx);
      ossuary(still);
    });

    // On the night of the dig the back gate starts shut, so that it can be found open (cem2_back_gate).
    const gate = new BackGate(kit, ctx, state.hasFlag('first_sighting') && phase !== 'night2');
    let arrived = false;
    everyFrame(kit, () => {
      if (arrived) return;
      arrived = true;
      // Whoever comes in from the forest has just come through it.
      if (Math.hypot(ctx.player.position.x - BACK_GATE.x, ctx.player.position.z - BACK_Z) < 3) gate.set(true);
    });
    const staging = stageCemetery(kit, ctx, phase, gate);
    // The patrol and the dig site each need the other; the hooks reach the round once it exists.
    let round: ReturnType<typeof nightTwoRound> | null = null;
    const site = new DigSite(
      kit,
      ctx,
      { ...staging.dig, noise: (at, reach) => round?.hear(at, reach) },
      !night && state.hasFlag('grave_left_open'),
    );
    if (phase === 'night2') round = nightTwoRound(kit, ctx, site, staging.scares);

    const digging = () => phase === 'night2' && state.hasItem('shovel') && !state.hasFlag('opened_coffin') && !site.inHole;
    const { windmill } = kit.batch((still) =>
      graveStones(still, {
        digging,
        lanternLit: phase === 'night1' || phase === 'night3',
        read: async (grave) => {
          await readGrave(ctx, grave);
          staging.read(grave);
        },
        dig: (grave) => digWrongGrave(ctx, grave, () => round?.alarm()),
      }),
    );
    everyFrame(kit, windmill);

    exits(kit, ctx, phase, gate);
    hillAmbience(kit, state.time);
    if (!night) crows(kit, ctx, [
      { x: -6, z: FRONT_Z, y: WALL_HEIGHT + 0.06, yaw: 160 },
      { x: 12.5, z: BACK_Z, y: WALL_HEIGHT + 0.06, yaw: 20 },
      { x: 9.4, z: -6.4, y: 1.0, yaw: 90 },
      { x: -4, z: 1.8 },
      { x: 3.2, z: -0.4, yaw: -40 },
    ]);
  },
});

/** The refusals, and two strokes on the Gremaud footing, loud enough to bring Raymond early. */
async function digWrongGrave(ctx: SceneContext, grave: Grave, alarm: () => void): Promise<void> {
  const node = refusalFor(grave);
  if (node !== 'dig_gremaud') return playNode(ctx, node);
  if (ctx.state.hasFlag('dug_gremaud_stone')) return playNode(ctx, 'dig_gremaud_again');
  playSound(ctx.audio, 'sfx_knock_metal', { at: { x: grave.x, y: 0.1, z: grave.z + 0.4 }, volume: 1.4 });
  alarm();
  return playNode(ctx, 'dig_gremaud');
}

/**
 * The front gate down to the path and the back gate into the forest, with the strip of trees
 * behind the wall where the reporter can wait out a round. Leaving with the coffin open asks first.
 */
function exits(kit: LevelKit, ctx: SceneContext, phase: StoryPhase, gate: BackGate): void {
  const { state } = ctx;
  const leave = async (to: string, spawn: string, back: { x: number; z: number }) => {
    if (state.hasFlag('opened_coffin') && !state.hasFlag('grave_refilled') && !state.hasFlag('grave_left_open')) {
      await playNode(ctx, 'leave_open_warning');
      if (!state.hasFlag('grave_left_open')) {
        ctx.player.position.x += back.x;
        ctx.player.position.z += back.z;
        return;
      }
    }
    if (to === 'cemetery_path' && phase === 'night1' && state.hasFlag('first_sighting') && !state.hasFlag('found_bunker')) state.setFlag('skipped_follow');
    ctx.goTo(to, spawn);
  };
  kit.trigger({ w: 7, d: 1 }).at(0, 0, FRONT_Z + 5.5).onEnter(() => void leave('cemetery_path', 'from_cemetery', { x: 0, z: -1.6 }));
  kit.trigger({ w: 12, d: 1 }).at(BACK_GATE.x, 0, BACK_Z - 9).onEnter(() => {
    if (gate.isOpen) void leave('forest_path', 'from_cemetery', { x: 0, z: 1.6 });
  });

  // Outside the front gate, a short stretch of the path; behind the back gate, the edge of the trees.
  const fence = (x: number, z: number, w: number, d: number) => kit.barrier({ w, d }).at(x, 0, z);
  fence(-3.6, FRONT_Z + 3.2, 0.5, 6);
  fence(3.6, FRONT_Z + 3.2, 0.5, 6);
  fence(0, FRONT_Z + 6.3, 8, 0.5);
  fence(BACK_GATE.x - 6.5, BACK_Z - 5, 0.5, 10);
  fence(BACK_GATE.x + 6.5, BACK_Z - 5, 0.5, 10);
  fence(BACK_GATE.x, BACK_Z - 9.8, 13.5, 0.5);
}

export const scenes = [cemeteryScene];
