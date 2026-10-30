import type { LevelKit } from '../../game/kit/levelKit';
import { defineScene, type SceneContext } from '../../game/scene';
import { cue, type Markers } from './beats';
import { lostInTheFog } from './lost';
import { playNode } from './play';
import { isNight, storyPhase, type StoryPhase } from './story';
import { distanceToTrails, nearestOnTrails, pointAlong, yawToward, type Trail } from './trail';
import { enclose, fallenLog, forestAmbience, forestAtmosphere, forestFloor, rock, trailStrip, undergrowth, woodland, woodsHeight, type Area } from './woods';

/**
 * Bois-Noir, chemin. From the cemetery's back gate north through spruce to the shrine fork.
 * Right climbs to the fort, left drops to the stream and the Yerly field edge.
 */

const main: Trail = [
  [0, 75],
  [0.5, 66],
  [2.5, 56],
  [-1.5, 46],
  [-3, 38],
  [0.5, 28],
  [2, 18],
  [-0.5, 8],
  [0, 0],
];
const toFort: Trail = [
  [0, 0],
  [4, -7],
  [9, -14],
  [12, -24],
  [15.5, -34],
  [16, -48],
];
const toStream: Trail = [
  [0, 0],
  [-6, -3],
  [-13, -4],
  [-20, -6],
  [-27, -9],
  [-33, -10],
  [-40, -12],
  [-50, -14],
];
const trails = [main, toFort, toStream];

/** The stream runs roughly north to south across the left branch. */
const stream: Trail = [
  [-24, -58],
  [-27, -36],
  [-30, -10],
  [-29, 14],
  [-33, 40],
];
const BRIDGE = { x: -30, z: -9.6 };

const area: Area = { x: -13, z: 13, w: 86, d: 136 };
const FORK = { x: 0, z: 0 };
const SHRINE = { x: -1.1, z: -3.1 };

const channel = (x: number, z: number) => {
  const d = distanceToTrails([stream], x, z);
  return 1.3 * Math.max(0, 1 - (d / 2.6) ** 2);
};
/** Rises gently from the cemetery to the fork and on up to the fort; falls away to the stream. */
const slope = (x: number, z: number) => 0.05 * (75 - z) + 0.07 * x - channel(x, z);
const height = woodsHeight(slope, (x, z) => distanceToTrails(trails, x, z));

const along = (trail: Trail, meters: number) => {
  const p = pointAlong(trail, meters);
  return { x: p.x, z: p.z, yaw: yawToward(p.dx, p.dz) };
};
const backTowardCemetery = (trail: Trail, meters: number) => {
  const p = pointAlong(trail, meters);
  return { x: p.x, z: p.z, yaw: yawToward(-p.dx, -p.dz) };
};

const ahead = along(main, 30);
const aheadRad = (ahead.yaw * Math.PI) / 180;

export const markers = {
  for1_ahead: {
    beat: 'for1_ahead',
    ...ahead,
    note: 'Night 1. The figure stands on the path facing away, at the edge of the torch beam. When the player is within 12 m it steps off to the right. No sound.',
  },
  for1_ahead_exit: {
    beat: 'for1_ahead',
    x: ahead.x + Math.cos(aheadRad) * 4,
    z: ahead.z - Math.sin(aheadRad) * 4,
    yaw: ahead.yaw - 90,
    note: 'Where the figure from for1_ahead goes when it steps off the path, into the spruce.',
  },
  for1_fork_steps_from: {
    beat: 'for1_fork_steps',
    ...along(toFort, 9),
    note: 'Night 1, when the player reaches the shrine: slow uneven footsteps start here, one heavier than the other.',
  },
  for1_fork_steps_to: {
    beat: 'for1_fork_steps',
    ...along(toFort, 30),
    note: 'Where the footsteps fade out, going away uphill. No figure.',
  },
  for1_shrine: {
    beat: 'for1_shrine',
    ...SHRINE,
    yaw: 180,
    note: 'The shrine. The Virgin faces the path to the fort. Cue `for1_shrine` fires when the player looks at it at night.',
  },
  for1_cough_trigger: {
    beat: 'for1_cough',
    ...backTowardCemetery(main, 52),
    note: 'Night 1, after the fort: when the player walks back past here toward the cemetery.',
  },
  for1_cough_source: {
    beat: 'for1_cough',
    ...FORK,
    yaw: 180,
    note: 'Far behind the player: one muffled cough through rubber.',
  },
  for2_heifer_fork: {
    beat: 'for2_heifer',
    ...along(toStream, 6),
    yaw: yawToward(4, -7),
    note: 'Day 2 with `skipped_follow`: Marquise stands on the left branch staring up the right one, toward the fort.',
  },
} satisfies Markers;

/** Le Loyon and the scare beats for this scene. The integration step fills this in. */
export function stageBeats(_kit: LevelKit, _ctx: SceneContext, _phase: StoryPhase): void {}

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
    woodland(kit, { area, seed: 'forest-path', avoid: clear, spruce: 620, beech: 90, birch: 22 });
    // Undergrowth only where the player can see it, along the trails.
    undergrowth(kit, area, { seed: 'forest-path', count: 260, avoid: (x, z) => onTrail(x, z) || distanceToTrails(trails, x, z) > 14 });

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

    shrine(kit, ctx, phase);
    bridge(kit, ctx);
    backGate(kit);

    enclose(kit, area);
    kit.exit({ w: 6, d: 1, to: 'cemetery', spawn: 'back_gate' }).at(0, 0, 75.6);
    kit.exit({ w: 5, d: 1, to: 'bunker_exterior', spawn: 'from_forest' }).at(16, 0, -48.4);
    kit.exit({ w: 1, d: 5, to: 'yerly_farm', spawn: 'from_forest' }).at(-50.4, 0, -14);

    forestAmbience(kit, ctx.state.time);
    stageBeats(kit, ctx, phase);
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

/** Two planks over the stream on the left branch. */
function bridge(kit: LevelKit, ctx: SceneContext): void {
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
function shrine(kit: LevelKit, ctx: SceneContext, phase: StoryPhase): void {
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

  const night = isNight(phase);
  kit
    .hotspot({
      prompt: 'Look at the shrine',
      radius: 0.5,
      onInteract: () => {
        if (night) cue('for1_shrine');
        return playNode(ctx, night ? 'forest_shrine_night' : 'forest_shrine');
      },
    })
    .at(SHRINE.x, 0, SHRINE.z);
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
