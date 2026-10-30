import { bareTree, HEDGE_PLANTS, ivyCover, thicket, VERGE_PLANTS, WILD_PLANTS } from '../../game/kit/foliage';
import type { LevelKit } from '../../game/kit/levelKit';
import { scatter, spotsAlong } from '../../game/kit/scatter';
import { BOUNDS, CHURCH, GREMAUD_GATE, HOUSE_1, HOUSE_2, LAITERIE } from './layout';

/**
 * What grows in Leurs in November: the limes by the church and the walnut over the bench, bare
 * fruit trees in the gardens, ivy up the old walls, hedges gone shaggy, and the uncut verges
 * of dead grass and bramble along the roads out. All alpha cards, like the forest.
 */
export function greenery(kit: LevelKit): void {
  trees(kit);
  ivy(kit);
  hedges(kit);
  verges(kit);
}

function trees(kit: LevelKit): void {
  const lime = (seed: string) => bareTree(seed, { height: 10.5, crownBase: 3, spread: 1.05, leaves: 0.15, ivy: true });
  kit.trees([lime('church-west'), lime('church-east')], [
    { x: -8.6, z: -12.6, yaw: 20 },
    { x: 8.4, z: -13.2, scale: 0.95, yaw: 140 },
  ]).collider().shade(0.1);
  // The walnut over the bench on the square, old and broad, a few black leaves still on it.
  kit.trees(bareTree('walnut', { height: 9, crownBase: 2.4, spread: 1.5, leaves: 0.3 }), [{ x: 5.6, z: -8.6, yaw: 200 }]).collider();
  const orchard = (seed: string) => bareTree(seed, { height: 5.2, crownBase: 1.4, spread: 1.6, leaves: 0.4 });
  kit
    .trees([orchard('apple-a'), orchard('apple-b'), orchard('pear')], [
      { x: -15, z: 26, scale: 0.9 },
      { x: 21, z: 5, yaw: 70 },
      { x: -26, z: -14 },
      { x: 26, z: 20, scale: 0.95, yaw: 200 },
      { x: -28, z: 22, yaw: 120 },
      { x: -24.5, z: 25.5, scale: 0.85, yaw: 300 },
    ])
    .collider()
    .shade(0.12);
  const { x0, x1, z0 } = BOUNDS;
  kit.trees('spruce', scatter({ x: (x0 + x1) / 2, z: z0 + 6, w: x1 - x0, d: 8, count: 18, seed: 'village-spruce-north', spacing: 4, scale: [1.1, 1.5], avoid: (x) => Math.abs(x + 10) < 4 })).collider().shade(0.12);
}

/** Ivy up the church's west side and tower foot, the laiterie's gable, and the Gremaud garden wall. */
function ivy(kit: LevelKit): void {
  const sheet = (seed: string, w: number, h: number) => ivyCover(seed, { w, h });
  const towerSide = CHURCH.x - CHURCH.tower / 2;
  const naveSide = CHURCH.x - CHURCH.w / 2 - 0.15;
  // Turned so each sheet's +Z faces out from its wall: -90 faces west, 180 north.
  kit.trees([sheet('nave-a', 3.4, 5.5), sheet('nave-b', 2.6, 3.8)], [
    { x: naveSide, z: CHURCH.front - CHURCH.tower - 2.2, yaw: -90 },
    { x: naveSide, z: CHURCH.front - CHURCH.tower - 9, yaw: -90 },
  ]);
  kit.trees(sheet('tower', 1.4, 3.4), [
    { x: towerSide + 0.7, z: CHURCH.front + 0.03, yaw: 0 },
    { x: towerSide - 0.03, z: CHURCH.front - 1.2, yaw: -90 },
  ]);
  kit.trees(sheet('laiterie', 3, 4.2), [{ x: LAITERIE.x - 2.5, z: LAITERIE.z - LAITERIE.w / 2 - 0.03, yaw: 180 }]);
  kit.trees(sheet('gremaud-wall', 2.2, 0.9), spotsAlong([[GREMAUD_GATE.x - 0.2, GREMAUD_GATE.z - 6], [GREMAUD_GATE.x - 0.2, GREMAUD_GATE.z - 1.4]], { step: 2.3, seed: 'gremaud-ivy' }).map((s) => ({ ...s, yaw: -90 })));
}

/** Garden hedges behind the two houses with doors, and a wild one round the far orchard. */
function hedges(kit: LevelKit): void {
  const hedge = (seed: string) => thicket(seed, { length: 2.6, depth: 1, count: 9, plants: HEDGE_PLANTS });
  const wild = (seed: string) => thicket(seed, { length: 2.8, depth: 1.4, count: 9, plants: WILD_PLANTS });
  const behindOne = HOUSE_1.z - 6.6;
  kit.trees([hedge('house-1-a'), hedge('house-1-b')], spotsAlong([[HOUSE_1.x - 6, behindOne], [HOUSE_1.x + 4.5, behindOne]], { step: 2.1, seed: 'house-1', jitter: 0.15 }));
  const besideTwo = HOUSE_2.x + 5.6;
  kit.trees([hedge('house-2-a'), hedge('house-2-b')], spotsAlong([[besideTwo, HOUSE_2.z - 3.4], [besideTwo, HOUSE_2.z + 5]], { step: 2.1, seed: 'house-2', jitter: 0.15 }));
  kit.trees([wild('orchard-a'), wild('orchard-b')], spotsAlong([[-31, 18.5], [-21, 18.5], [-20.5, 30]], { step: 2.4, seed: 'orchard', jitter: 0.3 }));
  // Bushes at the corners of the laiterie and the garage, where nobody mows.
  kit.trees([thicket('corner-a', { length: 1.4, depth: 1.2, count: 4, plants: WILD_PLANTS }), thicket('corner-b', { length: 1.6, depth: 1.2, count: 5, plants: HEDGE_PLANTS })], [
    { x: LAITERIE.x - 5.4, z: LAITERIE.z - 4.6 },
    { x: 19.6, z: 19.9, yaw: 30 },
    { x: -15.8, z: 27.6, yaw: 80 },
    { x: 20.4, z: 32, yaw: 10 },
  ]);
}

/** Dead grass, bramble, and fern along both roads out and at the foot of the Gremaud garden wall. */
function verges(kit: LevelKit): void {
  const models = ['a', 'b', 'c'].map((seed) => thicket(`verge-${seed}`, { length: 2.2, depth: 0.8, count: 10, plants: VERGE_PLANTS }));
  const lines: [number, number][][] = [
    // The road west, both sides, from the bus stop out into the fog.
    [[-47, 12.1], [-27.5, 12.1]],
    [[-15.5, 12.1], [-13, 12.1]],
    [[-47, 4.9], [-13.5, 4.9]],
    // The road south past the garage, out to the Yerly farm.
    [[1, 33], [1, 55]],
    [[8.3, 34], [8.3, 55]],
    // The street side of the Gremaud garden wall.
    [[GREMAUD_GATE.x - 0.45, GREMAUD_GATE.z - 6], [GREMAUD_GATE.x - 0.45, GREMAUD_GATE.z - 1.3]],
    [[GREMAUD_GATE.x - 0.45, GREMAUD_GATE.z + 1.3], [GREMAUD_GATE.x - 0.45, GREMAUD_GATE.z + 6]],
  ];
  kit.trees(models, lines.flatMap((line, i) => spotsAlong(line, { step: 1.6, seed: `verge-${i}`, jitter: 0.3, scale: [0.8, 1.2] })));
}
