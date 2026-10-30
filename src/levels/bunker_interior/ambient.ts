import { drips, dustMotes, miceInTheWalls, nowAndThen, particles, sway, weather } from '../../game/ambient';
import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { LEAKS } from './clutter';
import { shaftMoan } from './sounds';

/** The two air shafts: the grille in the corridor ceiling and the one over the dead generator. */
export const SHAFTS = [
  { x: 0, y: 2.1, z: -26 },
  { x: 7.4, y: 2.6, z: -19 },
];

/**
 * What moves in the fort when nothing does: dust in the torch and in the daylight at the
 * entrance, water through the ceiling at a few leaks, two loose cable ends turning in the draft
 * from the shafts, wind moaning in the shafts, and rats behind the concrete. The generator is
 * dead, so nothing hums but the shafts.
 */
export function fortAmbient(kit: LevelKit, ctx: SceneContext, night: boolean): void {
  particles(kit, dustMotes({ follow: true, box: [5, 2.4, 5], count: 45, opacity: 0.45, size: 0.013, seed: 'fort-torch' }));
  if (!night) particles(kit, dustMotes({ box: [1.6, 1.8, 4], count: 30, size: 0.012, opacity: 0.4, seed: 'fort-door' })).at(0, 1.1, -1.5);
  drips(kit, ctx, LEAKS, 3.4, 0.25);

  // A cut cable end under the corridor grille, and a longer one by the machine room's dead board.
  looseCable(kit, { x: -0.16, y: 1.96, z: -25.7 }, 0.24, 6);
  looseCable(kit, { x: 9.95, y: 2.6, z: -21.7 }, 0.95, 3.5);

  const wind = weather(ctx.state).wind;
  nowAndThen(kit, ctx, 45, () => shaftMoan(ctx.audio, SHAFTS[Math.floor(Math.random() * SHAFTS.length)]!, wind, 0.22 + wind * 0.15), 20);
  miceInTheWalls(
    kit,
    ctx,
    [
      { x: -6.6, y: 0.15, z: -16.5 },
      { x: -11.2, y: 0.2, z: -15 },
      { x: 4, y: 0.1, z: -27.5 },
      { x: -2.5, y: 0.2, z: -46.1 },
      { x: 1.4, y: 0.1, z: -18 },
    ],
    50,
  );
}

/** A length of black cable hanging from `top`, built down from its end so it can turn. */
function looseCable(kit: LevelKit, top: { x: number; y: number; z: number }, length: number, degrees: number): void {
  const cable = kit
    .group((g) => g.box({ w: 0.014, h: length, d: 0.014 }).color(0x121210).at(0, -length, 0))
    .at(top.x, top.y, top.z)
    .dynamic();
  sway(kit, cable, { axis: 'x', degrees, speed: 0.13 });
}
