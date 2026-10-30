import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import type { Beat } from '../../game/scares/beats';
import { overneySpot } from './abbe';
import { everyFrame } from './everyFrame';
import { CANDLE_RACK, CHANCEL, CONFESSIONAL, HARMONIUM, RAISED, SACRISTY, SACRISTY_DOOR, WALL } from './layout';
import { CANDLE_OUT } from './nave';
import { simoneSpot } from './simone';
import { doorSlam, harmoniumDraft, wickHiss, woodCreak } from './sounds';

/** Set once the sacristy door has blown shut behind the reporter. */
const DOOR_SLAMMED = 'chu_sacristy_slam';

/**
 * The church's small frights, each once per game and each a draft or a bird: the harmonium
 * sounding with nobody at it, a pigeon off the confessional, a votive candle guttering out, and
 * the sacristy door blown shut. Only where nobody is standing, so it is the reporter alone who
 * hears it. Returns the beats for the church's director; the door runs on its own.
 */
export function churchScares(kit: LevelKit, ctx: SceneContext): Beat[] {
  const { state } = ctx;
  const abbe = overneySpot(state);
  const simone = simoneSpot(state);
  if (!state.hasFlag(DOOR_SLAMMED) && !['sacristy', 'sacristy_door', 'office'].includes(abbe ?? '') && simone !== 'office') sacristyDoor(kit, ctx);
  const draft = { x: HARMONIUM.x, y: 0.8, z: HARMONIUM.z };
  return [
    ...(simone === 'harmonium'
      ? []
      : [
          {
            id: 'chu_harmonium_draft',
            when: { enter: { x: HARMONIUM.x + 0.6, z: HARMONIUM.z + 1.2, r: 1.5 } },
            // On day 2 Simone walks over to play once she has printed the list.
            ...(simone === 'office' ? { if: { notFlag: 'simone_printed' } } : {}),
            do: [{ after: 0.8, run: () => harmoniumDraft(ctx.audio, draft) }],
            set: 'chu_harmonium_draft',
          },
        ]),
    ...(state.count('day') < 2
      ? []
      : [
          {
            // A pigeon roosting on the confessional's cornice, once the first ones have gone up.
            id: 'chu_confessional_pigeon',
            when: [{ enter: { x: CONFESSIONAL.x + 1.1, z: CONFESSIONAL.z, w: 1.4, d: 3 } }, { flag: 'startle_church_pigeons' }],
            do: [{ startle: 'pigeons' as const, from: { x: CONFESSIONAL.x, y: 2.7, z: CONFESSIONAL.z } }],
            set: 'chu_confessional_pigeon',
          },
        ]),
    ...(state.count('day') < 2 || ['candles', 'kneeling'].includes(abbe ?? '') || simone === 'altar'
      ? []
      : [
          {
            id: CANDLE_OUT,
            when: { look: { x: CANDLE_RACK.x, y: 1, z: CANDLE_RACK.z, within: 6, hold: 1 } },
            do: [{ run: () => wickHiss(ctx.audio, { x: CANDLE_RACK.x, y: 1, z: CANDLE_RACK.z }) }],
            set: CANDLE_OUT,
          },
        ]),
  ];
}

const SWING_SHUT = 0.45;
const SWING_OPEN = 0.9;
/** Seconds the reporter spends inside the sacristy, away from the door, before the draft comes. */
const INSIDE = 6;
/** Closer than this to the shut door, the reporter pushes it open again. */
const PUSH = 1.2;

/**
 * The sacristy door, standing open into the chancel. Once, while the reporter is in the sacristy
 * with their back to it, a draft from the side door slams it. Walking up to it pushes it open.
 */
function sacristyDoor(kit: LevelKit, ctx: SceneContext): void {
  const w = SACRISTY_DOOR.w;
  const hinge = { x: SACRISTY_DOOR.x + w / 2, z: CHANCEL.z0 + WALL / 2 + 0.03 };
  const middle = { x: SACRISTY_DOOR.x, y: RAISED + 1.1, z: CHANCEL.z0 };
  const leaf = kit
    .group((g) => g.box({ w, h: SACRISTY_DOOR.h - 0.05, d: 0.05 }).texture('door_wood', { tile: [w, 2] }).color(0x5e4e42).at(-w / 2, 0, 0))
    .at(hinge.x, RAISED, hinge.z)
    .dynamic();
  const OPEN = (85 * Math.PI) / 180;
  leaf.object.rotation.y = OPEN;
  let inside = 0;
  let shut = 0;
  let swing: { from: number; to: number; t: number; seconds: number } | null = null;
  const swingTo = (to: number, seconds: number) => (swing = { from: leaf.object.rotation.y, to, t: 0, seconds });
  everyFrame(kit, (dt) => {
    if (ctx.paused) return;
    const p = ctx.player.position;
    const fromDoor = Math.hypot(p.x - middle.x, p.z - middle.z);
    if (swing) {
      swing.t = Math.min(1, swing.t + dt / swing.seconds);
      // A slam speeds up as it goes; a push eases out.
      const k = swing.to === 0 ? swing.t * swing.t : 1 - (1 - swing.t) ** 2;
      leaf.object.rotation.y = swing.from + (swing.to - swing.from) * k;
      if (swing.t === 1) swing = null;
      return;
    }
    if (shut) {
      shut += dt;
      if (shut > 1.5 && fromDoor < PUSH) {
        woodCreak(ctx.audio, middle);
        swingTo(OPEN, SWING_OPEN);
        shut = 0;
      }
      return;
    }
    if (ctx.state.hasFlag(DOOR_SLAMMED)) return;
    const inSacristy = p.z < SACRISTY.z1 - 0.3 && p.x > SACRISTY.x0 && p.x < SACRISTY.x1;
    inside = inSacristy && fromDoor > 2 ? inside + dt : 0;
    if (inside < INSIDE) return;
    swingTo(0, SWING_SHUT);
    setTimeout(() => doorSlam(ctx.audio, middle), SWING_SHUT * 1000);
    shut = 0.001;
    ctx.state.setFlag(DOOR_SLAMMED);
  });
}
