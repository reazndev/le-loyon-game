import type { LevelKit } from '../../game/kit/levelKit';
import { defineScene, type SceneContext } from '../../game/scene';
import { cupOnTheStump } from './cup';
import { dressPath, keepClear } from './dressing';
import { heiferInTheForest } from './heifer';
import { hints } from './hints';
import { area, BRIDGE, FORK, height, main, markers, SHRINE, slope, stream, toFort, toStream, trails } from './layout';
import { lostInTheFog } from './lost';
import { overgrowth } from './overgrowth';
import { playNode } from './play';
import { stageForestPath } from './scares';
import { streamHiss } from './sounds';
import { edgeStones } from './stones';
import { storyPhase } from './story';
import { distanceToTrails, nearestOnTrails, yawToward } from './trail';
import { scatter } from '../../game/kit/scatter';
import { enclose, fallenLog, forestAmbience, forestAtmosphere, forestFloor, leafyTrees, leaningBeeches, lowPlants, mossPatches, rock, spruceWall, tallPlants, trailStrip, undergrowth, woodland } from './woods';
import { mistAlong, nightMist } from '../../game/ambient/mist';
import { nightSky } from '../../game/ambient/sky';

/**
 * Bois-Noir, chemin. From the cemetery's back gate north through spruce to the shrine fork.
 * Right climbs to the fort, left drops to the stream and the Yerly field edge.
 */

export { markers };

/** Trees within this many meters of a trail are solid models; past it, pictures in the fog. */
const NEAR_TREES = 8.5;

export const forestPathScene = defineScene({
  id: 'forest_path',
  spawns: {
    default: { x: 0, z: 29.5, yaw: 0 },
    from_cemetery: { x: 0, z: 29.5, yaw: 0 },
    from_bunker: { x: 10.9, z: -20.2, yaw: 163 },
    from_yerly: { x: -26.2, z: -9.7, yaw: -84 },
  },
  atmosphere: forestAtmosphere,

  build(kit, ctx) {
    const phase = storyPhase(ctx.state);
    kit.ground('grass', 0);
    forestFloor(kit, area, height);
    trails.forEach((trail, i) => {
      const width = trail === main ? 1.7 : 1.3;
      trailStrip(kit, trail, width, height);
      edgeStones(kit, trail, width, height, `forest-path-${i}`);
    });
    streamBed(kit);

    const nearWater = (x: number, z: number) => distanceToTrails([stream], x, z) < 2.4;
    const fromTrail = (x: number, z: number) => distanceToTrails(trails, x, z);
    const onTrail = (x: number, z: number) => fromTrail(x, z) < 3;
    const clear = (x: number, z: number) => onTrail(x, z) || nearWater(x, z) || Math.hypot(x - FORK.x, z - FORK.z) < 6 || z > 33;
    const near = (x: number, z: number) => fromTrail(x, z) < NEAR_TREES;
    const spruceClear = (x: number, z: number) => fromTrail(x, z) < 4.2;
    woodland(kit, { area, seed: 'forest-path', avoid: clear, near, spruceClear, spruce: 400, beech: 75, birch: 12, distant: 900 });
    // The big spruce Le Loyon steps behind on night 1.
    leafyTrees(kit, 'spruce', [{ x: markers.for1_ahead_exit.x + 0.6, z: markers.for1_ahead_exit.z - 0.5, scale: 1.4 }]);
    leaningBeeches(kit, { area, seed: 'forest-path', trails, count: 28, avoid: (x, z) => nearWater(x, z) || Math.hypot(x - FORK.x, z - FORK.z) < 4 || z > 31 });
    spruceWall(kit, { area, seed: 'forest-path', trails, from: 10, to: 26, count: 200, avoid: (_x, z) => z > 33 });

    // Undergrowth only where the player can see it: low plants up to the trail's edge, tall ones a step back.
    const atShrine = (x: number, z: number) => Math.hypot(x - SHRINE.x, z - SHRINE.z) < 1.6;
    const offTrail = (inner: number, outer: number) => (x: number, z: number) => {
      const d = fromTrail(x, z);
      return d < inner || d > outer || distanceToTrails([stream], x, z) < 1.2 || atShrine(x, z) || z > 33;
    };
    undergrowth(kit, area, { seed: 'forest-path-low', count: 700, mix: lowPlants, spacing: 0.75, avoid: (x, z) => offTrail(1.3, 9)(x, z) || keepClear.low(x, z) });
    undergrowth(kit, area, { seed: 'forest-path-tall', count: 800, mix: tallPlants, spacing: 1, avoid: (x, z) => offTrail(2.1, 15)(x, z) || keepClear.tall(x, z) || keepClear.low(x, z) });
    mossPatches(kit, height, scatter({ ...area, count: 80, seed: 'forest-path-moss', spacing: 2.4, avoid: offTrail(1.6, 11) }));
    // Three stretches where the path has nearly closed over.
    overgrowth(kit, [{ trail: main, from: 10, to: 20 }, { trail: toFort, from: 9, to: 20 }, { trail: toStream, from: 8, to: 17 }], {
      seed: 'forest-path-overgrown',
      avoid: (x, z) => keepClear.low(x, z) || distanceToTrails([stream], x, z) < 1.2 || atShrine(x, z),
    });

    [
      [3.6, 25.7, 20, 5],
      [-3.4, 18.4, 75, 4],
      [2.9, 10.9, -30, 3.5],
      [-3.5, 5.6, 110, 5.5],
      [9, -4, 60, 4],
      [7.5, -20, -15, 5],
      [-16, -1, 10, 4.5],
      [-13.3, -10.7, 95, 3.5],
      [16, -22, 80, 4],
    ].forEach(([x, z, yaw, length]) => fallenLog(kit, x!, z!, yaw!, length));
    [
      [-3.7, 27.1, 0.7],
      [3.9, 20.8, 0.4],
      [-4.4, 12.2, 0.9],
      [3.4, 4, 0.5],
      [-3, 2.5, 0.35],
      [6.5, -12, 0.8],
      [15, -26, 1],
      [-10, -7.5, 0.6],
      [-17.8, -10.2, 0.5],
      [-22.8, -5.2, 0.7],
      [-28.3, -13.2, 0.45],
      [2.9, 16.1, 0.3],
    ].forEach(([x, z, size], i) => rock(kit, x!, z!, size!, `forest-path-rock-${i}`));

    shrine(kit, ctx);
    bridge(kit, ctx);
    backGate(kit);
    dressPath(kit, ctx);

    enclose(kit, area);
    kit.exit({ w: 6, d: 1, to: 'cemetery', spawn: 'back_gate' }).at(0, 0, 32.6);
    kit.exit({ w: 5, d: 1, to: 'bunker_exterior', spawn: 'from_forest' }).at(12, 0, -24.4);
    kit.exit({ w: 1, d: 5, to: 'yerly_farm', spawn: 'from_forest' }).at(-30.4, 0, -11);

    forestAmbience(kit, ctx);
    nightMist(kit, ctx);
    nightSky(kit, ctx);
    trails.forEach((trail) => mistAlong(kit, ctx, trail, height));
    const heifer = heiferInTheForest(kit, ctx, phase);
    stageForestPath(kit, ctx, phase, [...heifer.beats, ...cupOnTheStump(kit, ctx, phase)]);
    hints(kit, ctx, phase, heifer.gap);
  },

  update: lostInTheFog(trails),
});

/** A narrow channel of black, fast water, glinting in the torch. */
function streamBed(kit: LevelKit): void {
  stream.slice(1).forEach(([bx, bz], i) => {
    const [ax, az] = stream[i]!;
    const length = Math.hypot(bx - ax, bz - az);
    kit
      .plane({ w: 1.5, d: length + 0.6, cell: 1 })
      .texture('mud', { tile: 1.5 })
      .color(0x1a1d1e)
      .emissive(0x040506)
      .mapAs('water')
      .at((ax + bx) / 2, slope((ax + bx) / 2, (az + bz) / 2) + 0.22, (az + bz) / 2)
      .rotY(yawToward(bx - ax, bz - az));
  });
}

/** Two planks over the stream on the left branch. The water hisses under them and for a way up and down. */
function bridge(kit: LevelKit, ctx: SceneContext): void {
  [-12, 0, 12].forEach((dz) => {
    const p = nearestOnTrails([stream], BRIDGE.x, BRIDGE.z + dz);
    kit.use((k) => k.world.sounds.track(streamHiss(ctx.audio, { x: p.x, y: slope(p.x, p.z), z: p.z }, dz === 0 ? 0.5 : 0.35)));
  });
  const yaw = yawToward(-6, -1.5);
  const deck = Math.max(height(BRIDGE.x - 2.4, BRIDGE.z + 0.4), height(BRIDGE.x + 2.4, BRIDGE.z - 0.4)) + 0.08;
  kit.group((g) => {
    g.box({ w: 0.42, h: 0.07, d: 5.4 }).texture('wood_planks', { tile: 1.2 }).color(0x726a5e).at(-0.24, 0, 0).walkable('wood');
    g.box({ w: 0.42, h: 0.07, d: 5.4 }).texture('wood_planks', { tile: 1.2 }).color(0x665e54).at(0.24, 0, 0).walkable('wood');
    g.box({ w: 1.1, h: 0.14, d: 0.14 }).texture('bark_spruce').at(0, -0.12, -2.4);
    g.box({ w: 1.1, h: 0.14, d: 0.14 }).texture('bark_spruce').at(0, -0.12, 2.4);
    // Rails of bare water either side of the planks.
    g.barrier({ w: 0.2, d: 5.2 }).at(-0.75, 0, 0);
    g.barrier({ w: 0.2, d: 5.2 }).at(0.75, 0, 0);
  })
    .at(BRIDGE.x, deck - 0.07, BRIDGE.z)
    .rotY(yaw);
  kit.hotspot({ prompt: 'Look at the stream', radius: 0.6, onInteract: () => playNode(ctx, 'forest_bridge') }).at(BRIDGE.x + 2.2, 0, BRIDGE.z + 0.5);
}

/** The little wooden house on a post, turned to face the path to the fort. */
function shrine(kit: LevelKit, ctx: SceneContext): void {
  const facing = nearestOnTrails([toFort], 6, -10);
  const yaw = yawToward(facing.x - SHRINE.x, facing.z - SHRINE.z) + 180;
  kit.group((g) => {
    g.box({ w: 0.12, h: 1.25, d: 0.12 }).texture('wood_planks', { tile: 0.6 }).color(0x5a5048).collider();
    g.group((house) => {
      house.box({ w: 0.7, h: 0.05, d: 0.5 }).texture('wood_planks', { tile: 0.5 }).color(0x6a5e52);
      house.box({ w: 0.7, h: 0.66, d: 0.05 }).texture('wood_planks', { tile: 0.5 }).color(0x5e5348).at(0, 0, -0.22);
      house.box({ w: 0.05, h: 0.66, d: 0.5 }).texture('wood_planks', { tile: 0.5 }).color(0x5e5348).at(-0.33, 0, 0);
      house.box({ w: 0.05, h: 0.66, d: 0.5 }).texture('wood_planks', { tile: 0.5 }).color(0x5e5348).at(0.33, 0, 0);
      house.gable({ w: 0.9, d: 0.7, h: 0.34 }).texture('roof_shingles', { tile: 0.5 }).color(0x56524c).at(0, 0.66, 0).doubleSided();
      // The plaster Virgin, a sprig of fir, and a candle stub.
      house.cylinder({ r: 0.075, h: 0.34, sides: 6 }).color(0xb8bcc0).at(0, 0.05, -0.05);
      house.box({ w: 0.08, h: 0.09, d: 0.08 }).color(0xd6cfc0).at(0, 0.39, -0.05);
      house.box({ w: 0.12, h: 0.03, d: 0.03 }).color(0x2e3a26).at(-0.14, 0.05, 0.09).rotY(30);
      house.cylinder({ r: 0.018, h: 0.05, sides: 5 }).color(0xd8d0b8).at(0.13, 0.04, 0.1);
    }).at(0, 1.25, 0);
  })
    .at(SHRINE.x, 0, SHRINE.z)
    .rotY(yaw)
    .onGround();
  // The pale mark in the moss where the post stood the other way round.
  kit.plane({ w: 0.3, d: 0.22 }).color(0xa8a890).at(SHRINE.x + 0.12, 0.04, SHRINE.z + 0.14).rotY(yaw + 25).onGround();

  const night = ctx.state.time === 'night';
  kit.hotspot({ prompt: 'Look at the shrine', radius: 0.5, onInteract: () => playNode(ctx, night ? 'forest_shrine_night' : 'forest_shrine') }).at(SHRINE.x, 0, SHRINE.z);
}

/** The cemetery's back wall and its gate, so the way home is there when the player turns round. */
function backGate(kit: LevelKit): void {
  const z = 34.2;
  [-1, 1].forEach((side) =>
    kit
      .box({ w: 9, h: 1.9, d: 0.5 })
      .texture('stone_wall', { tile: 2.2 })
      .color(0x9a978e)
      .at(side * 5.4, -0.2, z)
      .onGround()
      .collider(),
  );
  kit.box({ w: 0.16, h: 2.1, d: 0.16 }).texture('rust_metal').color(0x504a44).at(-0.92, 0, z).onGround();
  kit.box({ w: 0.16, h: 2.1, d: 0.16 }).texture('rust_metal').color(0x504a44).at(0.92, 0, z).onGround();
  // The gate leaf hangs open toward the forest.
  kit
    .box({ w: 1.6, h: 1.6, d: 0.03 })
    .texture('iron_fence', { tile: [1.6, 1.6] })
    .cutout()
    .doubleSided()
    .color(0x6a645c)
    .at(-0.9 + 0.8 * Math.cos(Math.PI / 3), 0.1, z - 0.8 * Math.sin(Math.PI / 3))
    .rotY(60)
    .onGround();
}

export const scenes = [forestPathScene];
