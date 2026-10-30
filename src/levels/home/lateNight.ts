import type { SoundHandle } from '../../engine/audio/audioManager';
import { everyFrame } from '../../game/ambient';
import { passingEngine } from '../../game/ambient/sounds';
import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { phoneRing } from '../inn/sounds';
import { PHONE, ROOM, WINDOW } from './room';
import { carIdle } from './sounds';

/**
 * Two things while the reporter reads the board, both just the street and the line: a car pulls
 * up below with its lights across the ceiling, idles, and drives off; and once the homepage is
 * open the phone rings once and stops. Neither waits for the player to stand up: the desktop
 * holds the scene's "paused", but the street doesn't care.
 */
export function lateNight(kit: LevelKit, ctx: SceneContext): void {
  carBelow(kit, ctx);
  afterFlag(kit, ctx, { flag: 'pro_read_homepage', delay: 5, once: 'pro_phone_once' }, () => {
    const ring = phoneRing(ctx.audio, PHONE, 0.6);
    setTimeout(() => ring.stop(0.05), 1100);
  });
}

/** Runs `then` `delay` seconds after `flag` is set, once per game: it sets `once`. */
function afterFlag(kit: LevelKit, ctx: SceneContext, cue: { flag: string; delay: number; once: string }, then: () => void): void {
  let wait = cue.delay;
  everyFrame(kit, (dt) => {
    if (ctx.state.hasFlag(cue.once) || !ctx.state.hasFlag(cue.flag) || (wait -= dt) > 0) return;
    ctx.state.setFlag(cue.once);
    then();
  });
}

/** The headlights on the ceiling: seconds into the car's visit, then x, z, and brightness. */
const SWEEP: [number, number, number, number][] = [
  [3.5, 1.9, -1.6, 0],
  [6, 0.4, -0.5, 1],
  [41, 0.4, -0.5, 1],
  [43.5, -1.9, -1.4, 0],
];
const ARRIVE = 6;
const LEAVE = 41;

function carBelow(kit: LevelKit, ctx: SceneContext): void {
  const street = (x: number) => ({ x, y: -7, z: -ROOM.halfD - 9 });
  const parked = street((WINDOW.x0 + WINDOW.x1) / 2);
  const beam = kit.light({ color: 0xd8dcf0, intensity: 0, range: 2.6 }).at(0, ROOM.height - 0.25, 0);
  const world = kit.use((c) => c.world);
  let idle: SoundHandle | null = null;
  let t = -1;
  afterFlag(kit, ctx, { flag: 'pro_read_board', delay: 8, once: 'pro_car_below' }, () => {
    t = 0;
    passingEngine(ctx.audio, street(-30), parked, { kind: 'car', seconds: ARRIVE + 1, volume: 0.4 });
  });
  everyFrame(kit, (dt) => {
    if (t < 0 || t > SWEEP[SWEEP.length - 1]![0]) return;
    const before = t;
    t += dt;
    if (before < ARRIVE - 1.5 && t >= ARRIVE - 1.5) idle = world.sounds.track(carIdle(ctx.audio, parked));
    if (before < LEAVE && t >= LEAVE) {
      idle?.stop(1.2);
      passingEngine(ctx.audio, parked, street(30), { kind: 'car', seconds: 7, volume: 0.4 });
    }
    const light = beam.light;
    if (!light) return;
    const [x, z, level] = sweepAt(t);
    light.position.set(x, ROOM.height - 0.25, z);
    // Rain on the glass breaks the beam up a little.
    light.intensity = level * (1.1 + 0.08 * Math.sin(t * 9) * Math.sin(t * 3.7));
  });
}

function sweepAt(t: number): [number, number, number] {
  const next = SWEEP.findIndex(([at]) => at > t);
  if (next <= 0) {
    const [, x, z, level] = SWEEP[next === 0 ? 0 : SWEEP.length - 1]!;
    return [x, z, next === 0 ? 0 : level];
  }
  const [a, ax, az, al] = SWEEP[next - 1]!;
  const [b, bx, bz, bl] = SWEEP[next]!;
  const k = (t - a) / (b - a);
  return [ax + (bx - ax) * k, az + (bz - az) * k, al + (bl - al) * k];
}
