import type { CharacterId } from '../../engine/characters/cast';
import type { EntryId, NodeId } from '../../content';
import type { LevelKit } from '../../game/kit/levelKit';
import { scatter } from '../../game/kit/scatter';
import { watchmanPatrol } from '../../game/patrol/patrol';
import { scareDirector } from '../../game/scares/director';
import { defineScene, type Scene, type SceneContext, type Spawn } from '../../game/scene';
import { testBeats } from './beats';

/** The lineup, west to east, with what each one says when spoken to. */
const lineup: { id: CharacterId; talk?: NodeId | EntryId }[] = [
  { id: 'overney', talk: 'overney' },
  { id: 'monique', talk: 'monique' },
  { id: 'yannick', talk: 'yannick' },
  { id: 'bernard', talk: 'bernard' },
  { id: 'gilles', talk: 'gilles' },
  { id: 'christine', talk: 'christine' },
  { id: 'odile', talk: 'odile' },
  { id: 'raymond', talk: 'raymond_night1' },
  { id: 'driver', talk: 'driver_arrival' },
  { id: 'bari' },
];

const LINE_Z = -2;
const SPACING = 1.7;
const lineX = (i: number) => (i - (lineup.length - 1) / 2) * SPACING;
/** Le Loyon stands alone, west of the lineup, at the edge of the trees. */
const LOYON = { x: -22, z: -14 };
/** The watchman's grounds: a walled plot east of the field, a stand-in for the cemetery. */
const GROUNDS = { x: 30, z: -10, w: 14, d: 12 };
const GRAVE = { x: 27, z: -13 };
const SHED = { x: 35, z: -14 };

/** Marquise stands at the east end of the row, turned a little so her length shows. */
const MARQUISE = { x: lineX(lineup.length) + 0.8, z: LINE_Z };

const viewSpawns: Record<string, Spawn> = {
  ...Object.fromEntries(lineup.map(({ id }, i) => [`view_${id}`, { x: lineX(i), z: LINE_Z + 3, yaw: 0 }])),
  view_marquise: { x: MARQUISE.x, z: MARQUISE.z + 4, yaw: 0 },
};

const hills = (x: number, z: number) => 0.25 * Math.sin(x * 0.21 + 1) * Math.cos(z * 0.17) * Math.min(1, Math.hypot(x, z - LINE_Z) / 14);

/**
 * A foggy pasture for judging the cast: everyone stands in a row, Le Loyon waits by the trees,
 * the gravel path north runs through the scare primitives, and a walled plot to the east has
 * Raymond's round. Flags: `test_patrol_now` starts the round at once, `test_walk` makes the
 * row walk up and down, and `test_loyon_walk` makes Le Loyon pace instead of stand.
 */
export const charactersTestScene: Scene = defineScene({
  id: 'characters_test',
  spawns: {
    default: { x: 0, z: 6, yaw: 0 },
    ...viewSpawns,
    view_marc: { x: LOYON.x, z: LOYON.z + 10, yaw: 0 },
    view_marc_close: { x: LOYON.x + 0.4, z: LOYON.z + 3.6, yaw: 0 },
    path: { x: 14, z: 8, yaw: 0 },
    patrol: { x: 22, z: -9, yaw: -90 },
  },
  atmosphere: {
    day: {
      fog: { color: 0x9a9c98, near: 1, far: 17, density: 0.07, wisps: 0.45 },
      ambient: 0x76766f,
      sun: { color: 0x5c5c56, direction: [0.3, 1, 0.6] },
      saturation: 0.7,
    },
    night: {
      fog: { color: 0x07080a, near: 0.5, far: 13, density: 0.11, wisps: 0.35 },
      ambient: 0x14161b,
      sun: { color: 0x0e1118, direction: [-0.4, 1, 0.3] },
      saturation: 0.6,
    },
  },

  build(kit, ctx) {
    buildField(kit);
    buildGrounds(kit);
    placeCast(kit, ctx);

    const night = ctx.state.time === 'night';
    kit.use(scareDirector(testBeats, night ? { random: { surface: 'grass' } } : {}));
    kit
      .use(
        watchmanPatrol({
          route: [
            { x: 30, z: 14 },
            { x: 30, z: -4, gate: true },
            { x: 30, z: -12, wait: 6, aim: { x: 30, z: -16 } },
            { x: 28.5, z: -11.5, wait: 4, aim: GRAVE },
            { x: 30, z: -4, gate: true },
            { x: 30, z: 14 },
          ],
          rest: 40,
          firstIn: ctx.state.hasFlag('test_patrol_now') ? 3 : 30,
          grounds: [GROUNDS],
          suspicious: [{ ...GRAVE, r: 2.5 }],
          safe: [{ ...SHED, w: 1.8, d: 1.4 }],
        }),
      )
      .onSeen(() => ctx.notify('Raymond saw you.'))
      .onCaught((cause) => void ctx.say(`Caught (${cause}).`));

    kit.ambience('wind', { volume: 0.4 });
    if (night) kit.ambience('crackle', { interval: 6 });
  },
});

export const scenes: Scene[] = [charactersTestScene];

function buildField(kit: LevelKit): void {
  kit.ground('grass');
  kit.terrain({ w: 90, d: 90, cell: 2, height: hills }).texture('pasture', { tile: 4 }).walkable('grass');
  kit.plane({ w: 2.2, d: 42, cell: 1 }).texture('gravel_path', { tile: 2.5 }).at(14, 0.03, -12).walkable('gravel');

  const open = (x: number, z: number) => x > -34 && x < 42 && z > -34 && z < 20;
  kit.trees('spruce', scatter({ x: 0, z: 0, w: 88, d: 88, count: 110, seed: 'characters_test', spacing: 3, avoid: open })).collider();
  kit.trees('bare', [
    { x: 22, z: -18, scale: 1.1 },
    { x: -9, z: -16, scale: 0.9 },
    { x: -26, z: -18, scale: 1.2 },
    { x: 6, z: -30 },
  ]).collider();
  kit.trees('spruce', [
    { x: -25, z: -19, scale: 1.2 },
    { x: -19, z: -20 },
  ]).collider();
  [-44, 44].forEach((edge) => {
    kit.barrier({ w: 90, d: 1 }).at(0, 0, edge);
    kit.barrier({ w: 1, d: 90 }).at(edge, 0, 0);
  });
}

/** A low-walled plot with a gate gap, a few stones, an open grave, and a shed to hide in. */
function buildGrounds(kit: LevelKit): void {
  const { x, z, w, d } = GROUNDS;
  const wall = (cx: number, cz: number, ww: number, dd: number) =>
    kit.box({ w: ww, h: 1.1, d: dd }).texture('stone_wall', { tile: 1.5 }).at(cx, 0, cz).onGround().collider();
  wall(x, z - d / 2, w, 0.4);
  wall(x - w / 2, z, 0.4, d);
  wall(x + w / 2, z, 0.4, d);
  wall(x - 3.9, z + d / 2, w / 2 - 1, 0.4);
  wall(x + 3.9, z + d / 2, w / 2 - 1, 0.4);

  [-4, -1.5, 2, 4.5].forEach((dx, i) =>
    [-2, 1].forEach((dz) =>
      kit
        .box({ w: 0.7, h: i % 2 ? 0.9 : 0.6, d: 0.18 })
        .texture(i % 2 ? 'gravestone_granite' : 'gravestone_sandstone', { tile: 0.8 })
        .at(x + dx, 0, z + dz)
        .onGround()
        .collider(),
    ),
  );
  kit.plane({ w: 1, d: 2, cell: 0.5 }).texture('grave_dirt', { tile: 1 }).at(GRAVE.x, 0.04, GRAVE.z);

  kit.group((g) => {
    g.box({ w: 2.4, h: 2.2, d: 0.15 }).texture('wood_planks', { tile: 1.5 }).at(0, 0, -1).collider();
    g.box({ w: 0.15, h: 2.2, d: 2 }).texture('wood_planks', { tile: 1.5 }).at(-1.15, 0, 0).collider();
    g.box({ w: 0.15, h: 2.2, d: 2 }).texture('wood_planks', { tile: 1.5 }).at(1.15, 0, 0).collider();
    g.gable({ w: 2.8, d: 2.4, h: 0.6 }).texture('roof_shingles', { tile: 1.5 }).at(0, 2.2, 0);
  }).at(SHED.x, 0, SHED.z).rotY(180);
}

function placeCast(kit: LevelKit, ctx: SceneContext): void {
  lineup.forEach(({ id, talk }, i) => {
    const npc = kit.npc(id).at(lineX(i), 0, LINE_Z).faceYaw(180).watch(4);
    if (talk) npc.talk(talk);
    if (ctx.state.hasFlag('test_walk')) {
      npc.walk(
        [
          { x: lineX(i), z: LINE_Z - 3, wait: 1 + (i % 3) },
          { x: lineX(i), z: LINE_Z, wait: 2 },
        ],
        { loop: true },
      );
    }
  });

  const marquise = kit.npc('marquise').at(MARQUISE.x, 0, MARQUISE.z).faceYaw(140);
  let following = false;
  kit
    .hotspot({
      prompt: 'Lead her',
      radius: 0.8,
      enabled: () => !following,
      onInteract: () => {
        following = true;
        marquise.followPlayer();
      },
    })
    .at(MARQUISE.x, 0, MARQUISE.z);

  const loyon = kit.npc('marc').at(LOYON.x, 0, LOYON.z).faceYaw(180);
  if (ctx.state.hasFlag('test_loyon_walk')) {
    loyon.walk(
      [
        { x: LOYON.x - 4, z: LOYON.z, wait: 3 },
        { x: LOYON.x + 4, z: LOYON.z, wait: 4 },
      ],
      { loop: true },
    );
  } else loyon.watch(14);
}
