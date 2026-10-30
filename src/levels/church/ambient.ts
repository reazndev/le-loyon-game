import type { Point3 } from '../../engine/audio/audioManager';
import { caw, dustMotes, everyFrame, loop, nowAndThen, particles, suddenLife, weather } from '../../game/ambient';
import { rain } from '../../game/ambient/sounds';
import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { houseCreak, roomTone } from '../inn/sounds';
import { MAIN_DOOR, NAVE, PEW, PEW_ROWS, WALL } from './layout';
import { pendulumBeat } from './sounds';

/** The tower clock's pendulum swings once in two seconds. */
const BEAT_SECONDS = 2;

/** Where the light from the tall windows falls: the middle of each shaft, a meter or two in. */
const SHAFTS: Point3[] = [
  { x: NAVE.x0 + WALL / 2 + 1.9, y: 1.7, z: 0.8 },
  { x: NAVE.x1 - WALL / 2 - 1.9, y: 1.7, z: 6.2 },
  { x: NAVE.x0 + WALL / 2 + 1.9, y: 1.7, z: -4.6 },
];

/**
 * The stillness of the church: dust turning in the window light, the room's own low tone, the
 * pendulum through the tower wall near the door, a pew settling somewhere behind the reporter,
 * a crow on the roof, and on wet nights the rain on the glass.
 */
export function churchAmbient(kit: LevelKit, ctx: SceneContext, night: boolean): void {
  suddenLife(kit, ctx, 'indoors');
  const { audio } = ctx;
  if (night) particles(kit, dustMotes({ follow: true, box: [6, 3, 6], count: 50 }));
  else SHAFTS.forEach((at, i) => particles(kit, dustMotes({ box: [2.6, 2.6, 0.9], count: 40, size: 0.014, opacity: 0.55, seed: `church-shaft-${i}` })).at(at.x, at.y, at.z));

  // The electric candle lamp's hum, and the stone's own quiet under it.
  kit.ambience('drone', { volume: 0.05 });
  loop(kit, () => roomTone(audio, 0.1));

  const beatAt = { x: MAIN_DOOR.x, y: 4.6, z: NAVE.z1 + 0.3 };
  let sinceBeat = 0;
  everyFrame(kit, (dt) => {
    sinceBeat += dt;
    if (sinceBeat < BEAT_SECONDS) return;
    sinceBeat -= BEAT_SECONDS;
    pendulumBeat(audio, beatAt, 0.35);
  });

  nowAndThen(kit, ctx, 75, () => {
    const p = ctx.player.position;
    const pews = Array.from({ length: PEW_ROWS * 2 }, (_, i) => ({ x: (i % 2 ? 1 : -1) * PEW.x, y: 0.5, z: PEW.firstZ - Math.floor(i / 2) * PEW.spacing }));
    const far = pews.filter((s) => Math.hypot(s.x - p.x, s.z - p.z) > 5);
    const at = far[Math.floor(Math.random() * far.length)];
    if (at) houseCreak(audio, at, 0.35);
  }, 40);

  if (!night) nowAndThen(kit, ctx, 110, () => caw(ctx, { x: (Math.random() - 0.5) * 10, y: NAVE.h + 3, z: (Math.random() - 0.5) * 18 }, 0.18), 50);
  if (weather(ctx.state).drizzle) [NAVE.x0, NAVE.x1].forEach((x) => loop(kit, () => rain(audio, { at: { x, y: 4, z: 0.8 }, surface: 'glass', volume: 0.2 })));
}
