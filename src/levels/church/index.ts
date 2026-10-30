import type { LevelKit } from '../../game/kit/levelKit';
import { defineScene, type SceneContext } from '../../game/scene';
import { scareDirector } from '../../game/scares/director';
import { overneySpot } from './abbe';
import { chimesBetween } from './clock';
import { everyFrame } from './everyFrame';
import { CHANCEL, CONFESSIONAL, MAIN_DOOR, NAVE, RAISED, SIDE_DOOR, TOWER, WALL } from './layout';
import { churchAmbient } from './ambient';
import { furnish } from './furnishings';
import { hints } from './hints';
import { buildNave, SAT_IN_CONFESSIONAL } from './nave';
import { placeAbbe } from './overney';
import { buildSacristy } from './sacristy';
import { buildShell } from './shell';
import { towerBell, towerClick, woodCreak } from './sounds';
import { startle } from '../../game/scares/startles';

/**
 * Église Saint-Maurice. The nave, the Virgin's side altar, the confessional, the sacristy with
 * the register cupboard (P2), and the parish office. The quietest place in the game: a lamp's
 * hum and the tower clock. By day only, in the story; at night it is locked.
 */

/** The hour the bell strikes. Day 1 begins at 16:20, so the first hour heard is five. */
const HOUR_STROKES = 5;

export const churchScene = defineScene({
  id: 'church',
  spawns: {
    default: { x: MAIN_DOOR.x, z: NAVE.z1 - 1.4, yaw: 0 },
    from_square: { x: MAIN_DOOR.x, z: NAVE.z1 - 1.4, yaw: 0 },
    from_cemetery_path: { x: CHANCEL.x1 - 1.1, z: SIDE_DOOR.z, yaw: 140 },
    sacristy: { x: -0.5, z: -17.9, yaw: -15 },
  },
  atmosphere: {
    // The one still, clear place in Leurs: only a faint haze down the nave, so the fog outside
    // reads as a threat by contrast.
    day: {
      fog: { color: 0x6e7072, near: 10, far: 36, density: 0.008, wisps: 0.03 },
      ambient: 0x56585a,
      saturation: 0.58,
      flashlight: false,
    },
    night: {
      fog: { color: 0x040506, near: 3, far: 26, density: 0.04, wisps: 0.05 },
      ambient: 0x0b0c10,
      saturation: 0.5,
    },
  },

  build(kit, ctx) {
    const night = ctx.state.time === 'night';
    kit.ground('stone', 0);
    // Two batches: the nave with the chancel, and the rooms behind the altar.
    kit.batch((still) => {
      buildShell(still, night);
      buildNave(still, ctx);
      furnish(still);
    });
    kit.batch((still) => buildSacristy(still, ctx, night));
    churchAmbient(kit, ctx, night);
    placeAbbe(kit, ctx);
    hints(kit, ctx);
    if (overneySpot(ctx.state) === 'nave' && !ctx.state.hasFlag('chu_after_mass')) lastOutOfMass(kit, ctx);

    kit.door({ to: 'village_square', spawn: 'church_door', w: MAIN_DOOR.w, h: MAIN_DOOR.h, prompt: 'Go out' }).at(MAIN_DOOR.x, 0, NAVE.z1 - WALL / 2 - 0.05);
    kit
      .door({ to: 'cemetery_path', spawn: 'from_church', w: SIDE_DOOR.w, h: SIDE_DOOR.h, prompt: 'Go out to the path', locked: () => ctx.state.time === 'night', lockedText: 'Locked.' })
      .at(CHANCEL.x1 - WALL / 2 - 0.05, RAISED, SIDE_DOOR.z)
      .rotY(90);

    // chu_clock: a heavy click every quarter hour, the bell on the hour.
    let heard = ctx.time;
    everyFrame(kit, () => {
      chimesBetween(heard, ctx.time).forEach((chime) => (chime === 'hour' ? towerBell(ctx.audio, TOWER, HOUR_STROKES) : towerClick(ctx.audio, TOWER)));
      heard = ctx.time;
    });

    // chu_confessional: after sitting, a long quiet, then someone shifts their weight on the priest's side.
    kit.use(
      scareDirector([
        // Pigeons in the roof timbers, startled by the first steps down the nave.
        startle('church_pigeons', 'pigeons', { x: MAIN_DOOR.x, z: NAVE.z1 - 6, r: 2.5 }, { x: MAIN_DOOR.x + 1.5, y: NAVE.h - 0.5, z: NAVE.z1 - 9 }),
        {
          id: 'chu_confessional',
          when: { flag: SAT_IN_CONFESSIONAL },
          do: [{ silence: 22 }, { after: 20, run: () => woodCreak(ctx.audio, { x: CONFESSIONAL.x, y: 1.2, z: CONFESSIONAL.z }) }],
          set: 'chu_confessional',
        },
      ]),
    );
  },
});

/**
 * Day 2, after morning mass: the reporter comes in as the last two old women leave. They walk
 * down the aisle past the door, look once, and are gone.
 */
function lastOutOfMass(kit: LevelKit, ctx: SceneContext): void {
  ctx.state.setFlag('chu_after_mass');
  const door = NAVE.z1 - 0.9;
  (['parishioner_1', 'parishioner_2'] as const).forEach((id, i) => {
    const side = i === 0 ? -0.55 : 0.5;
    const woman = kit.npc(id).at(side, 0, -2.6 - i * 0.9).faceYaw(180).watch(2.5);
    void woman.character.walk([{ x: side, z: 4 }, { x: side * 1.4, z: door }], { speed: 0.55 - i * 0.05 }).then(() => {
      woman.object.visible = false;
      if (i === 1) woodCreak(ctx.audio, { x: MAIN_DOOR.x, y: 1.4, z: NAVE.z1 });
    });
  });
}

export const scenes = [churchScene];
