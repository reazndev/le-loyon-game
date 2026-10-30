import { bareTree, HEDGE_PLANTS, ivyCover, thicket, VERGE_PLANTS, WILD_PLANTS } from '../../game/kit/foliage';
import type { LevelKit } from '../../game/kit/levelKit';
import { spotsAlong } from '../../game/kit/scatter';
import { FIELD, HENHOUSE, HOUSE } from './layout';

/**
 * What grows round a working farm in November: the orchard below the yard, bare, with a few
 * leaves hanging on; two limes by the road; dead grass and bramble under the field fences and
 * along the road where the mower never reaches; ivy up the back of the house.
 */
export function greenery(kit: LevelKit): void {
  const orchard = (seed: string, ivy = false) => bareTree(seed, { height: 5.4, crownBase: 1.4, spread: 1.6, leaves: 0.35, ivy });
  kit
    .trees([orchard('yerly-a'), orchard('yerly-b', true), orchard('yerly-c')], [
      { x: -12, z: 17, yaw: 20 },
      { x: -5, z: 18.5, scale: 0.9, yaw: 160 },
      { x: 2, z: 17.5, yaw: 260 },
      { x: -8.5, z: 23, scale: 1.05, yaw: 90 },
      { x: -1.5, z: 23.5, scale: 0.85 },
      { x: 5.5, z: 22.5, yaw: 300 },
    ])
    .collider()
    .shade(0.12);
  const lime = (seed: string) => bareTree(seed, { height: 10, crownBase: 3, leaves: 0.15 });
  kit.trees([lime('yerly-road-a'), lime('yerly-road-b')], [{ x: 30, z: 16, yaw: 40 }, { x: 34, z: 7.5, scale: 0.9 }]).collider();

  const verge = ['a', 'b', 'c'].map((seed) => thicket(`yerly-verge-${seed}`, { length: 2.2, depth: 0.8, count: 9, plants: VERGE_PLANTS }));
  const lines: [number, number][][] = [
    [[FIELD.x0, FIELD.z0 - 0.4], [FIELD.x1, FIELD.z0 - 0.4]],
    [[FIELD.x0, FIELD.z1 + 0.4], [FIELD.x1, FIELD.z1 + 0.4]],
    [[FIELD.x0, FIELD.z0 + 0.5], [FIELD.x1, FIELD.z0 + 0.5]],
    [[FIELD.x0, FIELD.z1 - 0.5], [FIELD.x1, FIELD.z1 - 0.5]],
    // Both sides of the road in from the village.
    [[24, 9.6], [38, 9.6]],
    [[24, 14.4], [38, 14.4]],
  ];
  kit.trees(verge, lines.flatMap((line, i) => spotsAlong(line, { step: 1.8, seed: `yerly-verge-${i}`, jitter: 0.25, scale: [0.8, 1.25] })));
  // Bramble got into the fences in places, and a hedge of sorts grows behind the henhouse.
  const bramble = ['a', 'b'].map((seed) => thicket(`yerly-bramble-${seed}`, { length: 2.4, depth: 1.2, count: 6, plants: WILD_PLANTS }));
  kit.trees(bramble, [...spotsAlong([[FIELD.x0, FIELD.z0], [FIELD.x1, FIELD.z0]], { step: 11, seed: 'yerly-fence-south', jitter: 0.3 }), ...spotsAlong([[FIELD.x0, FIELD.z1], [FIELD.x1, FIELD.z1]], { step: 13, seed: 'yerly-fence-north', jitter: 0.3 })]);
  const hedge = ['a', 'b'].map((seed) => thicket(`yerly-hedge-${seed}`, { length: 2.6, depth: 1, count: 9, plants: HEDGE_PLANTS }));
  kit.trees(hedge, spotsAlong([[HENHOUSE.x - 5, HENHOUSE.z + 4.4], [HENHOUSE.x + 6, HENHOUSE.z + 4.4]], { step: 2.1, seed: 'yerly-hedge', jitter: 0.2 }));

  kit.trees(ivyCover('yerly-house', { w: 3, h: 4.2 }), [{ x: HOUSE.x - HOUSE.w / 2 - 0.03, z: HOUSE.z - 3.4, yaw: -90 }]);
}
