import { dialogues } from '../../content';
import type { MeshBuilder } from '../../game/kit/builders';
import { bareTree, ivyCover, thicket, VERGE_PLANTS, WILD_PLANTS } from '../../game/kit/foliage';
import type { LevelKit } from '../../game/kit/levelKit';
import { scatter, spotsAlong } from '../../game/kit/scatter';
import { scareDirector } from '../../game/scares/director';
import { defineScene, type SceneContext } from '../../game/scene';
import { everyFrame } from '../church/everyFrame';
import { isNight, storyPhase } from '../forest_path/story';
import { billboards } from '../forest_path/woods';
import { villageAmbience, villageAtmosphere } from '../village_square/atmosphere';
import { house, palette } from '../village_square/houses';
import { tractor } from '../village_square/props';
import { road } from '../village_square/road';
import { chassotAmbient } from './ambient';
import { candleAlong, gapGlow } from './candle';
import { garden, GARDEN } from './garden';

/**
 * Ferme Chassot, where Marc grew up. Shuttered and nailed since his mother died in 1996, the
 * yard gone to nettles, the "for sale" sign lying in them. Behind the house, a vegetable patch
 * that somebody keeps. Exterior only.
 */

const HOUSE = { x: 0, z: -4, w: 10, d: 9 };
const BOUNDS = { x0: -26, x1: 34, z0: -30, z1: 22 };
/** Window centers along the front, as the house builder lays them out. */
const FRONT_WINDOWS = [-3.2, 0, 3.2];

/** The dark behind a boarded window's planks, and where the window is along the front. */
interface Gap {
  x: number;
  part: MeshBuilder;
}

export const chassotFarmScene = defineScene({
  id: 'chassot_farm',
  spawns: {
    default: { x: 29, z: 6, yaw: 95 },
    from_square: { x: 29, z: 6, yaw: 95 },
  },
  atmosphere: villageAtmosphere,

  build(kit, ctx) {
    const phase = storyPhase(ctx.state);
    kit.ground('grass');
    kit.plane({ w: BOUNDS.x1 - BOUNDS.x0 + 20, d: BOUNDS.z1 - BOUNDS.z0 + 20, cell: 2 }).texture('grass_dead', { tile: 4 }).color(0x868872).at(4, 0, -4).walkable('grass');
    road(kit, [[36, 6], [12, 6], [4, 3.5]], { width: 4, texture: 'gravel_path', tile: 2, color: 0x8c887e, surface: 'gravel' });

    const gaps: Gap[] = [];
    // The still farm in one batch; `capture` keeps the window gaps the candle lights out of it.
    kit.batch((still) => {
      house(still, {
        ...HOUSE,
        floors: 2,
        front: FRONT_WINDOWS,
        sides: [-2.4, 2.4],
        back: [-2.4, 2.4],
        doors: [0],
        gableFront: true,
        gable: 'boards',
        wall: 0x86827a,
        shutter: palette.shutterBrown,
        roof: palette.roofDark,
        window: ({ face, floor }) => (face === 'front' && floor === 0 ? 'boarded' : 'shut'),
        capture: ({ face, floor, col }, part) => face === 'front' && floor === 0 && gaps.push({ x: FRONT_WINDOWS[col]!, part }),
      }).at(HOUSE.x, 0, HOUSE.z);
      barn(still);
      overgrowth(still);
      garden(still, ctx);
      tractor(still).at(15, 0, -3.5).rotY(130);
      // The front door, its sign in the nettles.
      still.box({ w: 0.9, h: 0.6, d: 0.03 }).color(0xc8c4b4).at(2.2, 0.08, HOUSE.z + HOUSE.d / 2 + 1.6).rotY(18).object.rotation.x = -1.35;
      still.box({ w: 0.6, h: 0.08, d: 0.032 }).color(0x8a2a24).at(2.2, 0.12, HOUSE.z + HOUSE.d / 2 + 1.5).rotY(18).object.rotation.x = -1.35;
    });
    kit.hotspot({ prompt: 'Look at the house', radius: 1, onInteract: () => ctx.dialogue(dialogues.door_chassot_farm) }).at(0, 0, HOUSE.z + HOUSE.d / 2 + 0.9);

    if (phase === 'night3') candleBehindTheBoards(kit, ctx, gaps);
    if (isNight(phase)) kit.use(scareDirector([], { random: { surface: 'grass' } }));

    kit.exit({ w: 1, d: 8, to: 'village_square', spawn: 'from_chassot' }).at(BOUNDS.x1 + 0.5, 0, 6);
    [
      { x: (BOUNDS.x0 + BOUNDS.x1) / 2, z: BOUNDS.z0, w: BOUNDS.x1 - BOUNDS.x0, d: 1 },
      { x: (BOUNDS.x0 + BOUNDS.x1) / 2, z: BOUNDS.z1, w: BOUNDS.x1 - BOUNDS.x0, d: 1 },
      { x: BOUNDS.x0, z: (BOUNDS.z0 + BOUNDS.z1) / 2, w: 1, d: BOUNDS.z1 - BOUNDS.z0 },
      { x: BOUNDS.x1 + 1, z: (BOUNDS.z0 + BOUNDS.z1) / 2, w: 1, d: BOUNDS.z1 - BOUNDS.z0 },
    ].forEach(({ x, z, w, d }) => kit.barrier({ w, d }).at(x, 0, z));
    chassotAmbient(kit, ctx, { house: HOUSE, barnEast: HOUSE.x + 5 });
    villageAmbience(kit, ctx, { bell: { x: 60, y: 14, z: -10 } });
  },
});

/** The barn behind the house, its roof half fallen in. */
function barn(kit: LevelKit): void {
  const z = HOUSE.z - HOUSE.d / 2 - 6;
  kit.box({ w: 10, h: 6, d: 12 }).texture('wood_planks', { tile: 2.4 }).color(0x5e564c).at(HOUSE.x, 0, z).collider();
  kit.gable({ w: 11.6, d: 6, h: 4.2 }).texture('roof_tiles', { tile: 2 }).color(0x5e5652).at(HOUSE.x, 6, z + 3).rotY(90).doubleSided();
  // Where the back half of the roof has gone: bare rafters against the sky.
  [-4, -2, 0, 2, 4].forEach((dx) => kit.box({ w: 0.14, h: 0.14, d: 6.6 }).color(0x3a3430).at(HOUSE.x + dx, 6.1, z - 2.6).object.rotation.set(0.6, 0, 0));
  kit.box({ w: 3.6, h: 3.4, d: 0.06 }).texture('wood_planks', { tile: 1.5 }).color(0x46403a).at(HOUSE.x + 5.03, 0, z).rotY(90);
}

/** Nettles and dead grass to the waist, with the path somebody has trodden round to the back. */
function overgrowth(kit: LevelKit): void {
  const trodden = (x: number, z: number) => {
    // From the yard round the east side of the house to the garden.
    const alongSide = Math.abs(x - (HOUSE.w / 2 + 1)) < 0.7 && z > GARDEN.z && z < HOUSE.z + HOUSE.d / 2 + 2;
    const inFront = Math.abs(z - (HOUSE.z + HOUSE.d / 2 + 2.2)) < 0.7 && x > 0 && x < HOUSE.w / 2 + 1.5;
    const garden = Math.abs(x - GARDEN.x) < GARDEN.w / 2 + 0.8 && Math.abs(z - GARDEN.z) < GARDEN.d / 2 + 0.8;
    const indoors = Math.abs(x - HOUSE.x) < HOUSE.w / 2 + 0.3 && Math.abs(z - HOUSE.z) < HOUSE.d / 2 + 0.3;
    return alongSide || inFront || garden || indoors || z > 3.8 && x > 6;
  };
  const nettles = scatter({ x: 2, z: -6, w: 34, d: 34, count: 380, seed: 'chassot-nettles', spacing: 0.75, scale: [0.7, 1.35], avoid: trodden });
  const kinds = [
    { texture: 'grass_tuft', w: 1.1, h: 0.9, color: 0x7a7c64, sink: 0.05 },
    { texture: 'fern_dead', w: 1.1, h: 1.0, color: 0x80785e, sink: 0.05 },
    { texture: 'grass_tuft', w: 1.3, h: 1.1, color: 0x84806a, sink: 0.05 },
  ];
  kinds.forEach((kind, k) => billboards(kit, kind, nettles.filter((_, i) => i % kinds.length === k)));
  // The old orchard, not pruned since the mother died: bare, mossy, a few brown leaves hanging on.
  const orchard = (seed: string, ivy = false) => bareTree(seed, { height: 5, crownBase: 1.3, spread: 1.7, leaves: 0.45, ivy });
  kit
    .trees([orchard('chassot-a', true), orchard('chassot-b'), orchard('chassot-c')], [
      { x: 12, z: -2, yaw: 30 },
      { x: 15, z: -8, scale: 0.9, yaw: 200 },
      { x: 12.5, z: -14, scale: 1.05 },
      { x: -10, z: 6, yaw: 90 },
      { x: 17.5, z: -15.5, scale: 0.85, yaw: 140 },
    ])
    .collider()
    .shade(0.12);
  wildHedge(kit);
  // The old fence along the road, posts leaning, rails down.
  for (let x = -14; x < 30; x += 2.6) {
    kit.box({ w: 0.1, h: 1.1, d: 0.1 }).texture('bark_spruce', { tile: 0.5 }).color(0x56504a).at(x, -0.1, 3.4).rotY(x * 17).object.rotation.z = Math.sin(x) * 0.18;
  }
}

/**
 * The hedge along the road and down the west side, unclipped for years: bramble over it and young
 * spruce and saplings through it, head high, with dead grass at its foot along the road. Ivy has
 * the west wall of the house and the corners of the front.
 */
function wildHedge(kit: LevelKit): void {
  const wild = ['a', 'b', 'c'].map((seed) => thicket(`chassot-hedge-${seed}`, { length: 3, depth: 1.6, count: 11, plants: WILD_PLANTS }));
  kit.trees(wild, spotsAlong([[-15, 2.4], [-1.5, 2.4]], { step: 2.2, seed: 'chassot-road', jitter: 0.35, scale: [0.95, 1.3] }));
  kit.trees(wild, spotsAlong([[-17, 1], [-17, -24]], { step: 2.3, seed: 'chassot-west', jitter: 0.5, scale: [1, 1.35] }));
  kit.trees(wild, spotsAlong([[22, 2.6], [31, 2.6]], { step: 2.3, seed: 'chassot-east', jitter: 0.35 }));
  kit.barrier({ w: 13.5, d: 1.2 }).at(-8.25, 0, 2.4);
  const verge = ['a', 'b'].map((seed) => thicket(`chassot-verge-${seed}`, { length: 2.2, depth: 0.8, count: 9, plants: VERGE_PLANTS }));
  kit.trees(verge, spotsAlong([[-15, 3.8], [-1, 3.8]], { step: 1.7, seed: 'chassot-verge', jitter: 0.2 }));
  kit.trees(verge, spotsAlong([[8, 3.7], [33, 3.7]], { step: 1.7, seed: 'chassot-verge-east', jitter: 0.2 }));
  const front = HOUSE.z + HOUSE.d / 2 + 0.03;
  kit.trees(ivyCover('chassot-west-wall', { w: 6.5, h: 4.6 }), [{ x: HOUSE.x - HOUSE.w / 2 - 0.03, z: HOUSE.z - 0.5, yaw: -90 }]);
  kit.trees(ivyCover('chassot-front', { w: 1.3, h: 3.4 }), [{ x: HOUSE.x - HOUSE.w / 2 + 0.6, z: front, yaw: 0 }, { x: HOUSE.x + HOUSE.w / 2 - 0.55, z: front, yaw: 0 }]);
}

/** The light in the gaps: a candle carried slowly along the front room, gone when the reporter comes near. */
function candleBehindTheBoards(kit: LevelKit, ctx: SceneContext, gaps: Gap[]): void {
  const front = { x: HOUSE.x, z: HOUSE.z + HOUSE.d / 2 };
  // A halo in the fog in front of whichever window the candle is behind.
  const halo = kit.glow(1.8, 0x000000).at(0, 1.4, front.z + 0.4);
  let out = false;
  let level = 1;
  everyFrame(kit, (dt) => {
    const p = ctx.player.position;
    if (!out && Math.hypot(p.x - front.x, p.z - front.z) < 6.5) out = true;
    level = out ? Math.max(0, level - dt * 1.5) : 1;
    const x = candleAlong(ctx.time, 3.4);
    const flicker = 0.85 + Math.random() * 0.15;
    const warm = (k: number) => (Math.round(0xc0 * k) << 16) | (Math.round(0x78 * k) << 8) | Math.round(0x28 * k);
    let brightest = 0;
    gaps.forEach((gap) => {
      const k = gapGlow(x - gap.x) * level * flicker;
      brightest = Math.max(brightest, k);
      gap.part.emissive(warm(k));
    });
    halo.object.position.x = x;
    halo.color(warm(brightest * 0.6));
  });
}

export const scenes = [chassotFarmScene];
