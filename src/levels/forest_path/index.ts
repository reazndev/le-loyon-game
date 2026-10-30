import type { LevelKit } from '../../game/kit/levelKit';
import { defineScene, type SceneContext } from '../../game/scene';
import { heiferInTheForest } from './heifer';
import { area, BRIDGE, FORK, height, main, markers, SHRINE, slope, stream, toFort, trails } from './layout';
import { lostInTheFog } from './lost';
import { playNode } from './play';
import { stageForestPath } from './scares';
import { streamHiss } from './sounds';
import { storyPhase } from './story';
import { distanceToTrails, nearestOnTrails, yawToward } from './trail';
import { enclose, fallenLog, forestAmbience, forestAtmosphere, forestFloor, rock, trailStrip, undergrowth, woodland } from './woods';

/**
 * Bois-Noir, chemin. From the cemetery's back gate north through spruce to the shrine fork.
 * Right climbs to the fort, left drops to the stream and the Yerly field edge.
 */

export { markers };

/** Trees within this many meters of a trail are solid models; past it, pictures in the fog. */
const NEAR_TREES = 7.5;

export const forestPathScene = defineScene({
  id: 'forest_path',
  spawns: {
    default: { x: 0, z: 72.5, yaw: 0 },
    from_cemetery: { x: 0, z: 72.5, yaw: 0 },
    from_bunker: { x: 15.8, z: -44, yaw: 178 },
    from_yerly: { x: -46, z: -13.2, yaw: -76 },
  },
  atmosphere: forestAtmosphere,

  build(kit, ctx) {
    const phase = storyPhase(ctx.state);
    kit.ground('grass', 0);
    forestFloor(kit, area, height);
    trails.forEach((trail) => trailStrip(kit, trail, trail === main ? 1.7 : 1.3, height));
    streamBed(kit);

    const nearWater = (x: number, z: number) => distanceToTrails([stream], x, z) < 2.4;
    const onTrail = (x: number, z: number) => distanceToTrails(trails, x, z) < 3;
    const clear = (x: number, z: number) => onTrail(x, z) || nearWater(x, z) || Math.hypot(x - FORK.x, z - FORK.z) < 6 || z > 76;
    const near = (x: number, z: number) => distanceToTrails(trails, x, z) < NEAR_TREES;
    const spruceClear = (x: number, z: number) => distanceToTrails(trails, x, z) < 4.4;
    woodland(kit, { area, seed: 'forest-path', avoid: clear, near, spruceClear, spruce: 620, beech: 110, birch: 26, distant: 1700 });
    // The big spruce Le Loyon steps behind on night 1.
    kit.trees('spruce', [{ x: markers.for1_ahead_exit.x + 0.6, z: markers.for1_ahead_exit.z - 0.5, scale: 1.4 }]).collider();
    // Undergrowth only where the player can see it, along the trails.
    undergrowth(kit, area, { seed: 'forest-path', count: 700, avoid: (x, z) => onTrail(x, z) || distanceToTrails(trails, x, z) > 16 });

    [
      [4.5, 60, 20, 5],
      [-5, 41, 75, 4],
      [3.8, 24, -30, 3.5],
      [-4.2, 12, 110, 5.5],
      [9, -4, 60, 4],
      [7.5, -20, -15, 5],
      [-16, -1, 10, 4.5],
      [-23, -12.5, 95, 3.5],
      [19.5, -30, 80, 4],
    ].forEach(([x, z, yaw, length]) => fallenLog(kit, x!, z!, yaw!, length));
    [
      [-3.5, 64, 0.7],
      [4, 50, 0.4],
      [-4.5, 31, 0.9],
      [3.4, 4, 0.5],
      [-3, 2.5, 0.35],
      [6.5, -12, 0.8],
      [13, -38, 1],
      [-10, -7.5, 0.6],
      [-27.5, -12, 0.5],
      [-32.5, -7, 0.7],
      [-38, -15, 0.45],
      [2.5, 36, 0.3],
    ].forEach(([x, z, size], i) => rock(kit, x!, z!, size!, `forest-path-rock-${i}`));

    shrine(kit, ctx);
    bridge(kit, ctx);
    backGate(kit);

    enclose(kit, area);
    kit.exit({ w: 6, d: 1, to: 'cemetery', spawn: 'back_gate' }).at(0, 0, 75.6);
    kit.exit({ w: 5, d: 1, to: 'bunker_exterior', spawn: 'from_forest' }).at(16, 0, -48.4);
    kit.exit({ w: 1, d: 5, to: 'yerly_farm', spawn: 'from_forest' }).at(-50.4, 0, -14);

    forestAmbience(kit, ctx);
    stageForestPath(kit, ctx, phase, heiferInTheForest(kit, ctx, phase));
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
  const yaw = yawToward(-6, -1);
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
  const z = 77.2;
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
