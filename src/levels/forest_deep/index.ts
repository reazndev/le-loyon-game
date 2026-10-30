import { SphereGeometry, type CanvasTexture } from 'three';
import type { LevelKit } from '../../game/kit/levelKit';
import type { ScareAction } from '../../game/scares/beats';
import { scareDirector, type ScareDirector } from '../../game/scares/director';
import { defineScene, type SceneContext } from '../../game/scene';
import type { Markers } from '../forest_path/beats';
import { lostInTheFog } from '../forest_path/lost';
import { playNode } from '../forest_path/play';
import { handText, paintedTexture } from '../forest_path/scrawl';
import { unspent } from '../forest_path/spent';
import { distanceToTrails, pointAlong, yawToward, type Trail } from '../forest_path/trail';
import { dressTrack, keepClear } from './dressing';
import { hints } from './hints';
import { larch } from './larch';
import { scatter } from '../../game/kit/scatter';
import {
  enclose,
  fallenLog,
  forestAmbience,
  forestAtmosphere,
  forestFloor,
  leaningBeeches,
  lowPlants,
  mossPatches,
  rock,
  spruceWall,
  tallPlants,
  trailStrip,
  undergrowth,
  woodland,
  woodsHeight,
  type Area,
} from '../forest_path/woods';
import { startle } from '../../game/scares/startles';

/**
 * Bois-Noir, haut. The animal track above the fort winds up to a single larch, golden among
 * black spruce. Under it Marc buried the syndic. Reached only on day 3, from the fort's thicket.
 */

export const track: Trail = [
  [0, 18],
  [2.6, 11.5],
  [-2.2, 6],
  [1.6, -2],
  [0, -9.5],
];
const LARCH = { x: 0.4, z: -14.8 };
const GRAVE = { x: 0.2, z: -12.4 };
const area: Area = { x: 0, z: -4.5, w: 60, d: 61 };

const inClearing = (x: number, z: number) => Math.max(0, Math.hypot(x - LARCH.x, z - LARCH.z + 1.5) - 5.5);
const slope = (_x: number, z: number) => 0.12 * (18 - z);
const calm = (x: number, z: number) => Math.min(distanceToTrails([track], x, z), inClearing(x, z));
const height = woodsHeight(slope, calm);

/** Walking back down: where the player is `meters` up the track, facing downhill. */
const goingDown = (meters: number) => {
  const p = pointAlong(track, meters);
  return { x: p.x, z: p.z, yaw: yawToward(-p.dx, -p.dz) };
};

/** A spot `ahead` meters downhill of a point on the track and `side` meters to its right. */
function below(from: { x: number; z: number; yaw: number }, ahead: number, side: number) {
  const a = (from.yaw * Math.PI) / 180;
  const [fx, fz] = [-Math.sin(a), -Math.cos(a)];
  const x = from.x + fx * ahead - fz * side;
  const z = from.z + fz * ahead + fx * side;
  return { x, z, yaw: yawToward(from.x - x, from.z - z) };
}

/**
 * Each figure stands 10 m below a point on the track, at the edge of the day fog. It is set off
 * further up, from where it is still hidden, so it is already there when the fog gives it up.
 */
const watchedFrom1 = goingDown(24);
const watchedFrom2 = goingDown(16);

export const watchedFrom = [watchedFrom1, watchedFrom2] as const;

export const markers = {
  for3_grave: {
    beat: 'for3_grave',
    ...GRAVE,
    yaw: 0,
    note: 'Reading the cross. Every ambient bed out for six seconds after the narration. No figure.',
  },
  for3_watched_trigger_1: {
    beat: 'for3_watched',
    ...goingDown(28.5),
    note: 'Walking back down after the grave: when the player passes here, the figure stands at for3_watched_1, still hidden in the fog.',
  },
  for3_watched_1: {
    beat: 'for3_watched',
    ...below(watchedFrom1, 10, -5.5),
    note: 'Below the player at the edge of the fog, between the trunks, looking up, seen from 24 m up the track. It does not move. Gone once looked at and looked away from.',
  },
  for3_watched_trigger_2: {
    beat: 'for3_watched',
    ...goingDown(20.5),
    note: 'Past the first figure, at the next turn of the track: the figure at for3_watched_2, then not at all.',
  },
  for3_watched_2: {
    beat: 'for3_watched',
    ...below(watchedFrom2, 10, 5.5),
    note: 'The same place relative to the player, as if it had kept pace. Marc walks the straight line; the track winds.',
  },
} satisfies Markers;

/**
 * The larch beats. Reading the cross drops every sound and holds the silence: the heaviest dread
 * in the game, and nothing happens. Walking back down, a figure stands below in the fog looking
 * up, and at the next turn it is there again in the same place relative to the player.
 */
function stageLarch(kit: LevelKit, ctx: SceneContext): ScareDirector {
  const watcher = (at: { x: number; z: number }): ScareAction => ({ figure: { at, vanish: 'unseen', near: 8, timeout: 30 } });
  return kit.use(
    scareDirector(unspent(ctx.state, [
      // Crows roosting in the spruce over the track, halfway up to the larch.
      startle('deep_crows', 'crows', { x: -1.7, z: 5, r: 4 }, { x: -5.7, y: 7, z: 1 }),
      { id: 'for3_grave', when: { after: Number.POSITIVE_INFINITY }, do: [{ silence: 6 }] },
      {
        id: 'for3_watched',
        when: { enter: { ...markers.for3_watched_trigger_1, r: 2.5 } },
        if: { flag: 'found_forest_grave' },
        do: [watcher(markers.for3_watched_1)],
      },
      {
        id: 'for3_watched_again',
        when: { enter: { ...markers.for3_watched_trigger_2, r: 2.5 } },
        do: [watcher(markers.for3_watched_2)],
      },
    ])),
  );
}

export const forestDeepScene = defineScene({
  id: 'forest_deep',
  spawns: {
    default: { x: 0, z: 15.5, yaw: 0 },
    from_fort: { x: 0, z: 15.5, yaw: 0 },
  },
  atmosphere: forestAtmosphere,

  build(kit, ctx) {
    kit.ground('grass', 0);
    forestFloor(kit, area, height);
    trailStrip(kit, track, 0.75, height);

    const onTrack = (x: number, z: number) => distanceToTrails([track], x, z) < 2.4;
    // Nothing grows between the track and where the watcher stands, so the fog alone hides him.
    const sightlines: Trail[] = [
      [[watchedFrom1.x, watchedFrom1.z], [markers.for3_watched_1.x, markers.for3_watched_1.z]],
      [[watchedFrom2.x, watchedFrom2.z], [markers.for3_watched_2.x, markers.for3_watched_2.z]],
    ];
    const inSight = (x: number, z: number, margin: number) => distanceToTrails(sightlines, x, z) < margin;
    const near = (x: number, z: number) => calm(x, z) < 10;
    const spruceClear = (x: number, z: number) => calm(x, z) < 4.2 || inSight(x, z, 3);
    const avoid = (x: number, z: number) => onTrack(x, z) || inClearing(x, z) < 1 || inSight(x, z, 1.2);
    woodland(kit, { area, seed: 'larch', avoid, near, spruceClear, spruce: 420, beech: 40, distant: 880 });
    const watchers = (x: number, z: number) => inSight(x, z, 3) || [markers.for3_watched_1, markers.for3_watched_2].some((m) => Math.hypot(x - m.x, z - m.z) < 3);
    leaningBeeches(kit, { area, seed: 'larch', trails: [track], count: 11, from: 2, to: 3.6, avoid: (x, z) => inClearing(x, z) < 2 || inSight(x, z, 2) });
    spruceWall(kit, { area, seed: 'larch', trails: [track], from: 10, to: 24, count: 160, avoid: (x, z) => watchers(x, z) || inClearing(x, z) < 6 });
    const offTrack = (inner: number, outer: number) => (x: number, z: number) => {
      const d = calm(x, z);
      return distanceToTrails([track], x, z) < inner || inClearing(x, z) < 0.2 || d > outer || inSight(x, z, 1.5);
    };
    const props = keepClear(track);
    undergrowth(kit, area, { seed: 'larch-low', count: 560, mix: lowPlants, spacing: 0.75, avoid: (x, z) => offTrack(0.9, 9)(x, z) || props.low(x, z) });
    undergrowth(kit, area, { seed: 'larch-tall', count: 640, mix: tallPlants, spacing: 1, avoid: (x, z) => offTrack(1.7, 14)(x, z) || props.tall(x, z) || props.low(x, z) });
    mossPatches(kit, height, scatter({ ...area, count: 56, seed: 'larch-moss', spacing: 2.4, avoid: offTrack(1.2, 10) }));
    fallenLog(kit, 6, 11, 30, 4);
    fallenLog(kit, -4.5, 1, -60, 5);
    rock(kit, 4.6, 8.6, 0.6, 'larch-rock-1');
    rock(kit, -3.8, -6, 0.5, 'larch-rock-2');
    dressTrack(kit, ctx, track, height);

    const scares = stageLarch(kit, ctx);
    larch(kit, LARCH);
    grave(kit, ctx, scares);
    hints(kit, ctx, { larch: LARCH, grave: GRAVE, offTrack: (x, z) => calm(x, z) > 6 });

    enclose(kit, area);
    kit.exit({ w: 6, d: 1, to: 'bunker_exterior', spawn: 'from_track' }).at(0, 0, 19.2);

    forestAmbience(kit, ctx);
  },

  update: lostInTheFog([track]),
});

/** A mound of fieldstones the length of a man, a cross of split branches, a jam jar, pine cones. */
function grave(kit: LevelKit, ctx: SceneContext, scares: ScareDirector): void {
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
    g.box({ w: 0.62, h: 0.12, d: 0.06 }).map(carvedCrossbar(), { tile: [0.62, 0.12] }).at(0, 0.66, 0);
    g.box({ w: 0.09, h: 0.09, d: 0.08 }).color(0x4e4e4c).at(0, 0.67, 0);
  })
    .at(head.x, -0.05, head.z)
    .onGround();
  kit.cylinder({ r: 0.045, h: 0.1, sides: 6 }).color(0x7e8c86).at(head.x + 0.22, 0, head.z + 0.24).onGround();
  kit.cylinder({ r: 0.02, h: 0.04, sides: 5 }).color(0xd0c8b0).at(head.x + 0.22, 0.01, head.z + 0.24).onGround();
  Array.from({ length: 7 }, (_, i) => i).forEach((i) =>
    kit.box({ w: 0.05, h: 0.05, d: 0.08 }).color(0x4a3a2a).at(GRAVE.x - 0.9 + i * 0.3, 0.02, GRAVE.z + 0.62).onGround(),
  );

  // The first look is the reporter taking it in; after that the carving reads like any stone.
  kit
    .hotspot({
      prompt: () => (ctx.state.hasFlag('found_forest_grave') ? 'Read the cross' : 'Look at the cross'),
      radius: 1.2,
      photo: 'photo_forest_grave',
      onInteract: () => {
        if (ctx.state.hasFlag('found_forest_grave')) return ctx.readDocument('doc_forest_cross');
        scares.fire('for3_grave');
        return playNode(ctx, 'forest_grave');
      },
    })
    .at(GRAVE.x - 0.5, 0, GRAVE.z);
}

/**
 * The crossbar's own wood with the initials and the date cut into it by knife. The cuts are only
 * a shade darker than the wood, so from a few steps away they read as grain.
 */
function carvedCrossbar(): CanvasTexture {
  return paintedTexture([64, 12], (c) => {
    c.fillStyle = '#867a66';
    c.fillRect(0, 0, 64, 12);
    c.fillStyle = '#766a58';
    [1, 4, 8, 10].forEach((y, i) => c.fillRect(i * 7, y, 64 - i * 9, 1));
    const carve = (text: string, x: number, size: number) => {
      handText(c, text, x + 1, 7, { size, color: '#968a74', font: 'serif' });
      handText(c, text, x, 6, { size, color: '#4e4436', font: 'serif' });
    };
    carve('J.-P. G.', 0, 8);
    carve('14.I.1997', 37, 8);
  });
}

export const scenes = [forestDeepScene];
