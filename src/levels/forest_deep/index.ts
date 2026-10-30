import { ConeGeometry, SphereGeometry } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { LevelKit } from '../../game/kit/levelKit';
import { defineScene, type SceneContext } from '../../game/scene';
import { cue, type Markers } from '../forest_path/beats';
import { lostInTheFog } from '../forest_path/lost';
import { playNode } from '../forest_path/play';
import { handText, scrawl } from '../forest_path/scrawl';
import { storyPhase, type StoryPhase } from '../forest_path/story';
import { distanceToTrails, pointAlong, yawToward, type Trail } from '../forest_path/trail';
import { enclose, fallenLog, forestAmbience, forestAtmosphere, forestFloor, rock, trailStrip, undergrowth, woodland, woodsHeight, type Area } from '../forest_path/woods';

/**
 * Bois-Noir, haut. The animal track above the fort winds up to a single larch, golden among
 * black spruce. Under it Marc buried the syndic. Reached only on day 3, from the fort's thicket.
 */

const track: Trail = [
  [0, 33],
  [-3.5, 24],
  [2.5, 15],
  [-2.2, 6],
  [1.6, -2],
  [0, -9.5],
];
const LARCH = { x: 0.4, z: -14.8 };
const GRAVE = { x: 0.2, z: -12.4 };
const area: Area = { x: 0, z: 3, w: 60, d: 76 };

const inClearing = (x: number, z: number) => Math.max(0, Math.hypot(x - LARCH.x, z - LARCH.z + 1.5) - 5.5);
const slope = (_x: number, z: number) => 0.12 * (33 - z);
const calm = (x: number, z: number) => Math.min(distanceToTrails([track], x, z), inClearing(x, z));
const height = woodsHeight(slope, calm);

/** Points beside the track, looking up the slope at the player. */
const watcher = (meters: number, side: number) => {
  const p = pointAlong(track, meters);
  const x = p.x - p.dz * side;
  const z = p.z + p.dx * side;
  return { x, z, yaw: yawToward(LARCH.x - x, LARCH.z - z) };
};
const trigger = (meters: number) => {
  const p = pointAlong(track, meters);
  return { x: p.x, z: p.z, yaw: yawToward(-p.dx, -p.dz) };
};

export const markers = {
  for3_grave: {
    beat: 'for3_grave',
    ...GRAVE,
    yaw: 0,
    note: 'Reading the cross. Every ambient bed out for six seconds. No figure. Cue `for3_grave` fires with forest_grave.',
  },
  for3_watched_trigger_1: {
    beat: 'for3_watched',
    ...trigger(30),
    note: 'Walking back down after the grave: when the player passes here, show the figure at for3_watched_1.',
  },
  for3_watched_1: {
    beat: 'for3_watched',
    ...watcher(14, 8),
    note: 'About 30 m below the player, between the trunks, looking up. It does not move.',
  },
  for3_watched_trigger_2: {
    beat: 'for3_watched',
    ...trigger(16),
    note: 'At the next turn of the track: hide for3_watched_1 and show the figure at for3_watched_2, then not at all.',
  },
  for3_watched_2: {
    beat: 'for3_watched',
    ...watcher(2, -7.5),
    note: 'The same place relative to the player, as if it had kept pace. Marc walks the straight line; the track winds.',
  },
} satisfies Markers;

/** Le Loyon and the scare beats for this scene. The integration step fills this in. */
export function stageBeats(_kit: LevelKit, _ctx: SceneContext, _phase: StoryPhase): void {}

export const forestDeepScene = defineScene({
  id: 'forest_deep',
  spawns: {
    default: { x: 0, z: 30.5, yaw: 0 },
    from_fort: { x: 0, z: 30.5, yaw: 0 },
  },
  atmosphere: forestAtmosphere,

  build(kit, ctx) {
    const phase = storyPhase(ctx.state);
    kit.ground('grass', 0);
    forestFloor(kit, area, height);
    trailStrip(kit, track, 0.75, height);

    const onTrack = (x: number, z: number) => distanceToTrails([track], x, z) < 2.4;
    woodland(kit, { area, seed: 'larch', avoid: (x, z) => onTrack(x, z) || inClearing(x, z) < 1, spruce: 360, beech: 12 });
    undergrowth(kit, area, { seed: 'larch', count: 150, avoid: (x, z) => onTrack(x, z) || inClearing(x, z) < 0.2 || calm(x, z) > 11 });
    fallenLog(kit, 4.2, 19, 30, 4);
    fallenLog(kit, -4.5, 1, -60, 5);
    rock(kit, 3.5, 9, 0.6, 'larch-rock-1');
    rock(kit, -3.8, -6, 0.5, 'larch-rock-2');

    larch(kit);
    grave(kit, ctx);

    enclose(kit, area);
    kit.exit({ w: 6, d: 1, to: 'bunker_exterior', spawn: 'from_track' }).at(0, 0, 34.2);

    forestAmbience(kit, ctx.state.time);
    stageBeats(kit, ctx, phase);
  },

  update: lostInTheFog([track]),
});

/** Bare and golden in a forest of black spruce. It stands out like a lamp. */
function larch(kit: LevelKit): void {
  kit.cylinder({ r: 0.26, h: 13, sides: 7, cell: 2 }).texture('bark_spruce', { tile: [1, 2] }).color(0x8c7a64).at(LARCH.x, -0.2, LARCH.z).onGround().collider();
  const tiers = Array.from({ length: 7 }, (_, i) => {
    const t = i / 6;
    const radius = 0.6 + 2.1 * (1 - t);
    const h = 1.7 - t * 0.5;
    return new ConeGeometry(radius, h, 7, 1, true).translate(0, 3.2 + i * 1.35 + h / 2, 0).toNonIndexed();
  });
  kit
    .mesh(mergeGeometries(tiers)!)
    .texture('spruce_foliage', { tile: 1.3 })
    .color(0xd8a040)
    .emissive(0x2a1a08)
    .cutout()
    .doubleSided()
    .at(LARCH.x, -0.2, LARCH.z)
    .onGround();
}

/** A mound of fieldstones the length of a man, a cross of split branches, a jam jar, pine cones. */
function grave(kit: LevelKit, ctx: SceneContext): void {
  const mound = new SphereGeometry(1, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2).scale(1.15, 0.18, 0.5);
  kit.mesh(mound).texture('grave_dirt', { tile: 0.8 }).color(0x6e7062).at(GRAVE.x, -0.05, GRAVE.z).onGround();
  [
    [-0.8, 0.1],
    [-0.45, -0.18],
    [-0.1, 0.15],
    [0.25, -0.12],
    [0.6, 0.12],
    [0.9, -0.05],
    [-0.6, -0.02],
    [0.05, -0.02],
    [0.45, 0.02],
  ].forEach(([dx, dz], i) => rock(kit, GRAVE.x + dx!, GRAVE.z + dz!, 0.22 + (i % 3) * 0.05, `grave-stone-${i}`, -0.08));
  kit.barrier({ w: 2.4, d: 1.1 }).at(GRAVE.x, 0, GRAVE.z);

  const head = { x: GRAVE.x - 1.45, z: GRAVE.z };
  kit.group((g) => {
    g.box({ w: 0.07, h: 1.05, d: 0.07 }).texture('bark_birch', { tile: 0.5 }).color(0x9a8c78);
    g.box({ w: 0.62, h: 0.12, d: 0.06 }).texture('bark_birch', { tile: 0.5 }).color(0x9a8c78).at(0, 0.66, 0);
    g.box({ w: 0.09, h: 0.09, d: 0.08 }).color(0x4e4e4c).at(0, 0.67, 0);
    scrawl(g, { w: 0.58, h: 0.11 }, [64, 12], (c) => {
      handText(c, 'J.-P. G.', 2, 6, { size: 9, color: '#d8c8a0', font: 'serif' });
      handText(c, '14.I.1997', 34, 6, { size: 8, color: '#d8c8a0', font: 'serif' });
    }).at(0, 0.665, 0.035);
  })
    .at(head.x, -0.05, head.z)
    .onGround();
  kit.cylinder({ r: 0.045, h: 0.1, sides: 6 }).color(0x7e8c86).at(head.x + 0.22, 0, head.z + 0.24).onGround();
  kit.cylinder({ r: 0.02, h: 0.04, sides: 5 }).color(0xd0c8b0).at(head.x + 0.22, 0.01, head.z + 0.24).onGround();
  Array.from({ length: 7 }, (_, i) => i).forEach((i) =>
    kit.box({ w: 0.05, h: 0.05, d: 0.08 }).color(0x4a3a2a).at(GRAVE.x - 0.9 + i * 0.3, 0.02, GRAVE.z + 0.62).onGround(),
  );

  kit
    .hotspot({
      prompt: 'Look at the cross',
      radius: 1.2,
      onInteract: () => {
        cue('for3_grave');
        return playNode(ctx, 'forest_grave');
      },
    })
    .at(GRAVE.x - 0.5, 0, GRAVE.z);
}

export const scenes = [forestDeepScene];
