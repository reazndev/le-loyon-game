import { ivyCover, thicket, VERGE_PLANTS, yew } from '../../game/kit/foliage';
import type { LevelKit } from '../../game/kit/levelKit';
import { spotsAlong } from '../../game/kit/scatter';
import { hashString, seededRandom } from '../../engine/random';
import { BACK_GATE, BACK_Z, EAST_X, FRONT_GATE, FRONT_Z, OLD_STONES, WALL_HEIGHT, WEST_X } from './layout';

type Line = [number, number][];

/** Half the wall's thickness, and the gap each gate leaves in it. */
const HALF = 0.25;
const frontGap = FRONT_GATE.w / 2 + 0.6;
const backGap = BACK_GATE.w / 2 + 0.6;

/**
 * Each run of wall as a line along one face, with the yaw that turns an ivy sheet's +Z out from
 * that face. `side` is 1 for the face inside the grounds, -1 for the one outside.
 */
function faces(side: 1 | -1): { line: Line; yaw: number }[] {
  const front = FRONT_Z - side * HALF;
  const back = BACK_Z + side * HALF;
  const west = WEST_X + side * HALF;
  const east = EAST_X - side * HALF;
  const out = side === 1 ? 0 : 180;
  return [
    { line: [[WEST_X, front], [-frontGap, front]], yaw: 180 + out },
    { line: [[frontGap, front], [EAST_X, front]], yaw: 180 + out },
    { line: [[WEST_X, back], [BACK_GATE.x - backGap, back]], yaw: out },
    { line: [[BACK_GATE.x + backGap, back], [EAST_X, back]], yaw: out },
    { line: [[west, BACK_Z], [west, FRONT_Z]], yaw: 90 + out },
    { line: [[east, BACK_Z], [east, FRONT_Z]], yaw: -90 + out },
  ];
}

/** The old stones set into the west wall stay readable: nothing grows over them. */
const overStones = (x: number, z: number) => x < WEST_X + 1 && z > OLD_STONES[0]!.z - 1.2 && z < OLD_STONES[OLD_STONES.length - 1]!.z + 1.2;

/**
 * Ivy over stretches of the wall, inside and out, dead grass and bramble at its foot outside,
 * and dark yews: two by the front gate, one in each of the quiet corners at the back.
 */
export function greenery(kit: LevelKit): void {
  const random = seededRandom(hashString('cemetery-ivy'));
  const sheets = ['a', 'b', 'c'].map((seed) => ivyCover(`cemetery-${seed}`, { w: 2.6, h: WALL_HEIGHT - 0.2 }));
  const ivySpots = [...faces(1), ...faces(-1)].flatMap(({ line, yaw }, i) =>
    spotsAlong(line, { step: 2.4, seed: `cemetery-ivy-${i}` })
      .filter((s) => random() < 0.55 && !overStones(s.x, s.z))
      .map((s) => ({ ...s, yaw })),
  );
  kit.trees(sheets, ivySpots);

  const verge = ['a', 'b'].map((seed) => thicket(`cemetery-verge-${seed}`, { length: 2.2, depth: 0.8, count: 9, plants: VERGE_PLANTS }));
  const foot = faces(-1).map(({ line, yaw }) => line.map(([x, z]) => [x + Math.sin((yaw * Math.PI) / 180) * 0.5, z + Math.cos((yaw * Math.PI) / 180) * 0.5] as [number, number]));
  kit.trees(verge, foot.flatMap((line, i) => spotsAlong(line, { step: 1.8, seed: `cemetery-verge-${i}`, jitter: 0.25, scale: [0.8, 1.2] })));

  kit
    .trees([yew('gate-west', { height: 5.4 }), yew('gate-east', { height: 5 }), yew('corner', { height: 6, radius: 1.25 })], [
      { x: -frontGap - 2, z: FRONT_Z + 1.8 },
      { x: frontGap + 2, z: FRONT_Z + 1.8, yaw: 120 },
      { x: EAST_X - 1.6, z: BACK_Z + 1.5, yaw: 40 },
      { x: EAST_X - 1.5, z: FRONT_Z - 1.4, yaw: 200 },
    ])
    .collider()
    .shade(0.1);
}
