import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { distantTraffic, dustMotes, fliesOver, loop, miceInTheWalls, particles, suddenLife, weather } from '../../game/ambient';
import { rain } from '../../game/ambient/sounds';
import { clockTick } from '../inn/sounds';
import { secondHand } from '../laiterie/secondHand';
import { CLOCK, SANDWICH } from './clutter';
import { BENCH, ROOM } from './layout';

/**
 * What moves in the garage besides the failing tube: flies over Yannick's lunch, dust in the
 * window light, the clock, rain drumming on the tin roof on wet nights, mice in the walls, and a
 * car going by on the road outside the bay doors.
 */
export function garageAmbient(kit: LevelKit, ctx: SceneContext, open: boolean): void {
  suddenLife(kit, ctx, 'indoors');
  secondHand(kit, { x: CLOCK.x, y: CLOCK.y, z: CLOCK.z + 0.045 }, 0.17);
  loop(kit, () => clockTick(ctx.audio, CLOCK, 0.18));
  fliesOver(kit, ctx, SANDWICH);

  if (open) {
    particles(kit, dustMotes({ box: [2.2, 1.6, 4], count: 40, opacity: 0.4, size: 0.012 })).at(ROOM.x0 + 1.3, 1.9, 0);
    particles(kit, dustMotes({ box: [1.6, 1.2, 1], count: 20, opacity: 0.45, size: 0.012, seed: 'garage-bench' })).at(BENCH.x, 1.9, BENCH.z + 0.5);
  } else particles(kit, dustMotes({ follow: true, box: [6, 3, 6], count: 60 }));

  if (weather(ctx.state).drizzle) loop(kit, () => rain(ctx.audio, { surface: 'tin', volume: 0.32 }));
  const walls = [
    { x: ROOM.x0, y: 0.3, z: -3 },
    { x: ROOM.x1, y: 0.3, z: -4.5 },
    { x: 1.5, y: 0.3, z: ROOM.z0 },
    { x: ROOM.x0, y: 3.4, z: 1.5 },
  ];
  miceInTheWalls(kit, ctx, walls, open ? 70 : 35);
  distantTraffic(kit, ctx, [{ x: -60, y: 0, z: 16 }, { x: 60, y: 0, z: 16 }], open ? 120 : 220);
}
