import type { Placed } from '../../game/kit/builders';
import { ivyCover, thicket, VERGE_PLANTS, WILD_PLANTS, yew } from '../../game/kit/foliage';
import type { LevelKit } from '../../game/kit/levelKit';
import { crows } from '../../game/ambient';
import { scatter, spotsAlong } from '../../game/kit/scatter';
import { watchmanPatrol } from '../../game/patrol/patrol';
import { scareDirector } from '../../game/scares/director';
import { defineScene, type SceneContext } from '../../game/scene';
import { hillAmbience, hillAtmosphere } from '../cemetery/atmosphere';
import { saveNightTwoStart } from '../cemetery/caught';
import { gateLeaf } from '../cemetery/grounds';
import { everyFrame } from '../church/everyFrame';
import { playNode } from '../forest_path/play';
import { isNight, storyPhase, type StoryPhase } from '../forest_path/story';
import { distanceToTrails, pointAlong, yawToward, type Trail } from '../forest_path/trail';
import { barbedWire, gravelPath } from './hillside';
import { bench } from '../cemetery/clutter';
import { crossOfferings, fenceSign } from './props';
import { billboards } from '../forest_path/woods';
import { screamer } from '../../game/scares/screamers';

/**
 * Chemin du cimetière. A gravel path climbs from behind the church in three switchbacks between
 * wet meadows and a barbed-wire fence, past a wayside cross, to the cemetery gate on the hilltop.
 */

const path: Trail = [
  [-1, 47],
  [1, 38],
  [10, 30.5],
  [15, 26],
  [6, 18],
  [-8, 10],
  [-13, 5],
  [-6, -3],
  [6, -10],
  [9, -15],
  [3, -22],
  [0.5, -30],
  [0, -37.5],
];
const CROSS = { x: -15.6, z: 4.6 };
const CHURCH = { x: -1, z: 54, w: 15, d: 9 };
const SIDE_DOOR = { x: 2.5, z: CHURCH.z - CHURCH.d / 2 };
const GATE_Z = -40;
/** The lower edge of the church roof on the path's side, above the ground at its foot. */
const EAVES = { y: 7.62, z: CHURCH.z - CHURCH.d / 2 - 0.3 };

/** The hill rises about thirteen meters from the church to the cemetery, with a cross slope. */
const height = (x: number, z: number): number => {
  const rise = 0.155 * (48 - Math.min(48, Math.max(z, GATE_Z))) + 0.04 * x;
  const near = Math.min(1, distanceToTrails([path], x, z) / 4);
  return rise + near * (0.35 * Math.sin(x * 0.27 + 1.1) * Math.cos(z * 0.21) + 0.15 * Math.sin(x * 0.7 - z * 0.5));
};

export const cemeteryPathScene = defineScene({
  id: 'cemetery_path',
  spawns: {
    default: { x: -1, z: 45.5, yaw: 0 },
    from_square: { x: -1, z: 45.5, yaw: 0 },
    from_church: { x: SIDE_DOOR.x, z: SIDE_DOOR.z - 1.3, yaw: 0 },
    from_cemetery: { x: 0, z: -35.5, yaw: 180 },
  },
  atmosphere: hillAtmosphere,

  build(kit, ctx) {
    const phase = storyPhase(ctx.state);
    const night = isNight(phase);
    saveNightTwoStart(ctx, 'cemetery_path');

    kit.ground('grass', 0);
    kit
      .terrain({ w: 90, d: 110, cell: 1.5, height: (x, z) => height(x, z + 4) })
      .texture('pasture', { tile: 3 })
      .color(0x8a8e76)
      .at(0, 0, 4)
      .walkable('grass');
    const fenced = path.slice(1, -1).map((p, i) => [p, path[i + 2]!] as Trail).filter((_, i) => i % 2 === 0);
    kit.batch((still) => {
      gravelPath(still, path, 1.6, height);
      barbedWire(still, fenced, 1.6);
      church(still, ctx, night);
      wayside(still, ctx, phase);
      cemeteryWall(still);
      // At the eastern bend, facing down the hill toward the church.
      bench(still, { x: 16.8, z: 27.2 }, { x: 16.8, z: 40 });
      fenceSign(still, { x: 4.27, z: 37.36 }, { x: 3.25, z: 36.13 });
    });
    fenceVerges(kit, fenced, 1.9);
    meadow(kit);

    kit.exit({ w: 6, d: 1, to: 'cemetery', spawn: 'front_gate' }).at(0, 0, GATE_Z + 1.2);
    kit.exit({ w: 1, d: 6, to: 'village_square', spawn: 'church_door' }).at(-9.5, 0, 46);
    [
      { x: 0, z: -48, w: 90, d: 1 },
      { x: 0, z: 58, w: 90, d: 1 },
      { x: -30, z: 4, w: 1, d: 110 },
      { x: 30, z: 4, w: 1, d: 110 },
    ].forEach(({ x, z, w, d }) => kit.barrier({ w, d }).at(x, 0, z));

    // The church stands at the foot of the path.
    hillAmbience(kit, ctx, { x: 0, z: 1 });
    if (!night)
      crows(kit, ctx, [
        { x: 12, z: 28.6, y: 1.2 },
        { x: -2, z: 14.5, y: 1.2, yaw: 60 },
        { x: 4.8, z: -14, y: 0, yaw: 200 },
        // On the church's eaves, black against the fog.
        { x: CHURCH.x - 3.5, z: EAVES.z, y: EAVES.y, yaw: 170 },
        { x: CHURCH.x + 2.2, z: EAVES.z, y: EAVES.y, yaw: 200 },
      ]);
    stagePath(kit, phase);
  },
});

/** Wet grass, tufts, a few bare trees and the posts of an old hay rack in the fog. */
function meadow(kit: LevelKit): void {
  const offPath = (x: number, z: number) => distanceToTrails([path], x, z) < 1.6 || (Math.abs(x - CHURCH.x) < 10 && z > 44);
  billboards(kit, { texture: 'grass_tuft', w: 1, h: 0.62, color: 0x80826a, sink: 0.04 }, scatter({ x: 0, z: 4, w: 56, d: 100, count: 700, seed: 'hill-tufts', spacing: 0.9, scale: [0.7, 1.4], avoid: offPath }));
  kit.trees('bare', scatter({ x: 0, z: 4, w: 60, d: 96, count: 11, seed: 'hill-trees', spacing: 12, avoid: (x, z) => distanceToTrails([path], x, z) < 5 })).collider().shade(0.12);
  kit.trees('spruce', scatter({ x: 0, z: GATE_Z - 6, w: 70, d: 10, count: 26, seed: 'hill-spruce', spacing: 3, scale: [1, 1.4] })).collider().shade(0.12);
}

/** The back of the church at the foot of the path, with the side door the abbé uses. */
function church(kit: LevelKit, ctx: SceneContext, night: boolean): void {
  const plaster = 0xb4b2aa;
  kit.box({ w: CHURCH.w, h: 8, d: CHURCH.d }).texture('plaster_wall', { tile: 3 }).color(plaster).at(CHURCH.x, -0.4, CHURCH.z).onGround().collider();
  kit.gable({ w: CHURCH.w + 0.6, d: CHURCH.d + 0.8, h: 3.4 }).texture('roof_shingles', { tile: 2 }).color(0x5a5856).at(CHURCH.x, 7.6, CHURCH.z).onGround();
  // The tower at the west end; the fog takes the spire.
  kit.box({ w: 4, h: 18, d: 4 }).texture('plaster_wall', { tile: 3 }).color(plaster).at(CHURCH.x - CHURCH.w / 2 - 1.5, -0.4, CHURCH.z + 1).onGround().collider();
  [-4.5, 0, 4.5].forEach((dx) =>
    kit.box({ w: 1.1, h: 3.4, d: 0.06 }).texture('window_dark', { tile: [1.1, 3.4] }).color(0x6a7078).at(CHURCH.x + dx - 1.5, 2.6, CHURCH.z - CHURCH.d / 2 - 0.03).onGround(),
  );
  // At night the church is locked, and the script says what the reporter sees instead.
  kit
    .box({ w: 1, h: 2.1, d: 0.08 })
    .texture('door_wood', { tile: [1, 2.1] })
    .at(SIDE_DOOR.x, 0, SIDE_DOOR.z - 0.05)
    .onGround()
    .collider()
    .interact({
      prompt: 'Open the door',
      radius: 0.5,
      onInteract: () => (night ? playNode(ctx, 'church_locked') : ctx.goTo('church', 'from_cemetery_path')),
    });
}

/**
 * Halfway up: a wooden wayside cross under a little roof, a tin Christ, a jam jar of plastic
 * flowers, and a rosary tied to the foot that swings on night 1 (path_cross_rosary).
 */
function wayside(kit: LevelKit, ctx: SceneContext, phase: StoryPhase): void {
  const wood = 0x5a4e42;
  const facing = yawToward(-6 - CROSS.x, -3 - CROSS.z) + 180;
  const parts: { rosary?: Placed } = {};
  kit
    .group((g) => {
      g.box({ w: 0.18, h: 2.45, d: 0.15 }).texture('wood_planks', { tile: 0.8 }).color(wood).collider();
      g.box({ w: 1.15, h: 0.15, d: 0.15 }).texture('wood_planks', { tile: 0.8 }).color(wood).at(0, 1.85, 0);
      // The little roof over the arms, as on the crosses along every field road in the canton.
      g.gable({ w: 1.45, d: 0.5, h: 0.26 }).texture('roof_shingles', { tile: 0.6 }).color(0x4e4a46).at(0, 2.32, 0.03).doubleSided();
      // The tin Christ, grey and thin.
      g.box({ w: 0.08, h: 0.42, d: 0.04 }).texture('rust_metal', { tile: 0.3 }).color(0x9a9a96).at(0, 1.45, 0.08);
      g.box({ w: 0.62, h: 0.04, d: 0.04 }).texture('rust_metal', { tile: 0.3 }).color(0x9a9a96).at(0, 1.82, 0.08);
      g.box({ w: 0.07, h: 0.07, d: 0.05 }).color(0xa6a6a0).at(0, 1.9, 0.09);
      g.cylinder({ r: 0.06, h: 0.12, sides: 6 }).color(0x8a9a9a).at(0.18, 0, 0.12);
      [0x9a4038, 0xb0a040, 0x6a5aa0].forEach((c, i) => g.box({ w: 0.05, h: 0.12, d: 0.05 }).color(c).at(0.15 + i * 0.03, 0.12, 0.1 + (i % 2) * 0.03));
      parts.rosary = g.group((r) => {
        [0, 1, 2, 3, 4, 5, 6].forEach((i) => r.box({ w: 0.025, h: 0.025, d: 0.025 }).color(0x2a2420).at(Math.sin(i * 0.5) * 0.05, -0.04 - i * 0.035, 0));
        r.box({ w: 0.012, h: 0.07, d: 0.004 }).color(0x8a8070).at(0, -0.32, 0);
      }).at(0, 0.62, 0.08).dynamic();
    })
    .at(CROSS.x, 0, CROSS.z)
    .rotY(facing)
    .onGround();
  crossOfferings(kit, CROSS, { x: -6, z: -3 });
  kit.hotspot({ prompt: 'Look at the cross', radius: 0.6, onInteract: () => playNode(ctx, 'path_cross') }).at(CROSS.x, 0, CROSS.z);

  if (phase !== 'night1') return;
  let swing = 0;
  everyFrame(kit, (dt) => {
    const near = Math.hypot(ctx.player.position.x - CROSS.x, ctx.player.position.z - CROSS.z) < 3.5;
    if (near && swing === 0) swing = 0.001;
    if (swing === 0 || !parts.rosary) return;
    swing += dt;
    // A slow pendulum with no wind behind it, dying away over half a minute.
    parts.rosary.object.rotation.z = 0.22 * Math.sin(swing * 2.1) * Math.exp(-swing / 30);
  });
}

/**
 * The strip under the barbed wire the mower never reaches: dead grass and bramble the length of
 * each fence, and here and there a wild bush grown up round a post.
 */
function fenceVerges(kit: LevelKit, legs: Trail[], offset: number): void {
  const lines = legs.map((leg) => {
    const [a, b] = [leg[0]!, leg[leg.length - 1]!];
    const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const [ox, oz] = [(-(b[1] - a[1]) / length) * offset, ((b[0] - a[0]) / length) * offset];
    return [[a[0] + ox, a[1] + oz], [b[0] + ox, b[1] + oz]] as [number, number][];
  });
  const verge = ['a', 'b', 'c'].map((seed) => thicket(`hill-verge-${seed}`, { length: 2.2, depth: 0.8, count: 9, plants: VERGE_PLANTS }));
  kit.trees(verge, lines.flatMap((line, i) => spotsAlong(line, { step: 1.7, seed: `hill-verge-${i}`, jitter: 0.3, scale: [0.8, 1.25] })));
  const bushes = ['a', 'b'].map((seed) => thicket(`hill-bush-${seed}`, { length: 1.8, depth: 1.4, count: 5, plants: WILD_PLANTS }));
  kit.trees(bushes, lines.flatMap((line, i) => spotsAlong(line, { step: 9, seed: `hill-bush-${i}`, jitter: 0.4 })));
}

/** The cemetery wall and gate at the top, seen from below, ivy on it and a yew each side of the gate. */
function cemeteryWall(kit: LevelKit): void {
  const ivy = ['a', 'b'].map((seed) => ivyCover(`hill-wall-${seed}`, { w: 2.6, h: 0.9 }));
  kit.trees(ivy, [-17, -12.5, -6, 5.5, 9, 14.5].map((x) => ({ x, z: GATE_Z + 0.26, yaw: 0 })));
  // The same yews the cemetery shows from its own side of the gate.
  kit.trees([yew('gate-west', { height: 5.4 }), yew('gate-east', { height: 5 })], [{ x: -3.9, z: GATE_Z + 1.8 }, { x: 3.9, z: GATE_Z + 1.8, yaw: 120 }]).collider();
  [-1, 1].forEach((side) => {
    kit.box({ w: 18, h: 1.1, d: 0.5 }).texture('stone_wall', { tile: 1.6 }).color(0x8c8a82).at(side * 10.6, -0.1, GATE_Z).onGround().collider();
    kit.box({ w: 0.55, h: 1.65, d: 0.6 }).texture('stone_wall', { tile: 1 }).color(0x96938a).at(side * 1.6, -0.1, GATE_Z).onGround().collider();
  });
  gateLeaf(kit, 1.3, GATE_Z, 1.28, 1.45, -1).onGround();
  gateLeaf(kit, -1.3, GATE_Z, 1.28, 1.45, 1).rotY(-75).onGround();
  // The first stones inside, so the gate opens onto something.
  [
    [-3, -42.6, 0.7, 0.95],
    [3.2, -42.8, 0.8, 1.05],
    [-6.2, -43, 0.6, 0.85],
    [6.4, -42.6, 0.5, 1.1],
    [-0.4, -47.4, 0.7, 0.9],
  ].forEach(([x, z, w, h]) => kit.box({ w: w!, h: h!, d: 0.17 }).texture('gravestone_granite', { tile: 0.9 }).color(0x8a8a88).at(x!, -0.05, z!).onGround());
}

/** path_light_above on night 2: halfway up, a torch beam moving up toward the cemetery, and the bell. */
function stagePath(kit: LevelKit, phase: StoryPhase): void {
  if (!isNight(phase)) return;
  kit.use(scareDirector([screamer('cemetery_path', 14)], { random: { surface: 'gravel' } }));
  if (phase !== 'night2') return;
  const ahead = (meters: number) => {
    const p = pointAlong(path, meters);
    return { x: p.x, z: p.z };
  };
  const patrol = kit.use(
    watchmanPatrol({
      route: [ahead(68), ahead(80), ahead(88), ahead(97), ahead(106), { x: 0, z: GATE_Z }, { x: 0, z: GATE_Z - 6 }],
      once: true,
      firstIn: Number.POSITIVE_INFINITY,
      speed: 0.85,
    }),
  );
  kit.trigger({ r: 4 }).at(-11, 0, 7).once().onEnter(() => patrol.hurry(Number.POSITIVE_INFINITY));
}

export const scenes = [cemeteryPathScene];
