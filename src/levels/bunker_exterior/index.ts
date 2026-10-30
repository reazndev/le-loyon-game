import { suddenLife } from '../../game/ambient';
import { BoxGeometry, CylinderGeometry, TorusGeometry, type BufferGeometry } from 'three';
import type { LevelKit } from '../../game/kit/levelKit';
import { scareDirector, type ScareDirector } from '../../game/scares/director';
import { playSound } from '../../game/scares/sounds';
import { defineScene, type SceneContext } from '../../game/scene';
import { lookPoint, type Markers } from '../forest_path/beats';
import { lostInTheFog } from '../forest_path/lost';
import { playNode } from '../forest_path/play';
import { handText, scrawl } from '../forest_path/scrawl';
import { isNight, storyPhase, type StoryPhase } from '../forest_path/story';
import { distanceToTrails, type Trail } from '../forest_path/trail';
import { scatter } from '../../game/kit/scatter';
import { dressClearing, keepClear } from './debris';
import { hints } from './hints';
import { sirenWail } from './sounds';
import { decoy, decoySighting } from '../../game/scares/decoys';
import { oncePerGame, unspent } from '../forest_path/spent';
import {
  enclose,
  fallenLog,
  forestAmbience,
  forestAtmosphere,
  forestFloor,
  leafyTrees,
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
import { nightMist } from '../../game/ambient/mist';
import { nightSky } from '../../game/ambient/sky';

/**
 * La grange du Bois-Noir. A clearing with the 1940s fort dressed as a hay barn. Behind it an
 * animal track climbs past the escape hatch to a thicket; on day 3 the way goes on to the larch.
 */

const approach: Trail = [
  [0, 27],
  [1.2, 19],
  [-0.4, 11],
  [0, 3.4],
];
const track: Trail = [
  [5.6, 1],
  [7.6, -7],
  [7.2, -13],
  [5, -20],
  [3.6, -27],
  [3, -31],
];
const trails = [approach, track];

const FORT = { x: 0, z: -2.6, w: 10, d: 7 };
const FRONT = FORT.z + FORT.d / 2;
const HATCH = { x: 8.6, z: -17.5 };
const THICKET = { x: 3, z: -32 };
const area: Area = { x: 0, z: -8, w: 60, d: 74 };

const inClearing = (x: number, z: number) => Math.max(0, Math.hypot((x - FORT.x) / 1.25, z - FORT.z - 1) - 10);
const slope = (_x: number, z: number) => (z < -6 ? 0.1 * (-6 - z) : 0) + 0.025 * (27 - Math.max(z, -6));
const calm = (x: number, z: number) => Math.min(distanceToTrails(trails, x, z), inClearing(x, z));
const height = woodsHeight(slope, calm);
const FLOOR = slope(FORT.x, FRONT);
const DOOR = { x: 0.2, z: FRONT - 0.3 };
/** The last post standing past the end of the old wire west of the approach, with a coat left on it. */
const COAT = { x: -6.2, z: 7.5, yaw: 100 };
const atCoat = (x: number, z: number) => Math.hypot(x - COAT.x, z - COAT.z) < 1.8;

export const markers = {
  for1_cup: {
    beat: 'for1_cup',
    x: 0,
    y: 0.2,
    z: FORT.z,
    yaw: 0,
    note: 'Night 1, 4 s after the wheel stops, while the reporter listens at the steel: one tin cup set down on concrete, deep inside.',
  },
  for3_hatch: {
    beat: 'for3_hatch',
    ...HATCH,
    yaw: 180,
    note: 'Day 3, passing the hatch: the worn path in the moss. Looking at it, every sound drops away.',
  },
} satisfies Markers;

/** Seconds of listening at the steel before the cup, as the script times it. */
const CUP_DELAY = 4;

/**
 * The clearing's beats. Night 1 at the wedged door: a tin cup set down inside, once. Day 3 at
 * the hatch: the worn path, and silence. The coat on the post by the approach reads as a man,
 * once. Nights have the random sounds of the forest.
 */
function stageFort(kit: LevelKit, ctx: SceneContext, phase: StoryPhase): ScareDirector {
  const cup = markers.for1_cup;
  return kit.use(
    scareDirector(
      unspent(ctx.state, [
        {
          id: 'for1_cup',
          when: { after: Number.POSITIVE_INFINITY },
          // A wall clock, not the director's: the cup comes while the reporter's ear is on the door.
          do: [{ run: () => void setTimeout(() => playSound(ctx.audio, 'sfx_metal_cup', { at: { x: cup.x, y: FLOOR + cup.y, z: cup.z } }), CUP_DELAY * 1000) }],
        },
        {
          id: 'for3_hatch',
          when: { look: { ...lookPoint(markers.for3_hatch, height, 0.3), within: 6, angle: 14, hold: 1 } },
          if: { count: [['day', '==', 3], ['night', '==', 0]] },
          do: [{ silence: 9 }],
        },
        decoySighting('coat', 'coat_on_post', { ...COAT, y: height(COAT.x, COAT.z) }),
        // The first day visit: a siren test far down in the valley, while the clearing is quiet.
        ...(isNight(phase) ? [] : [oncePerGame({ id: 'ext_siren', when: { after: 6 }, do: [{ run: () => sirenWail(ctx.audio) }] })]),
      ]),
      isNight(phase) ? { random: { surface: 'grass' } } : {},
    ),
  );
}

export const bunkerExteriorScene = defineScene({
  id: 'bunker_exterior',
  spawns: {
    default: { x: 0.6, z: 22, yaw: 0 },
    from_forest: { x: 0.6, z: 22, yaw: 0 },
    from_fort_door: { x: 0, z: FRONT + 1.4, yaw: 180 },
    from_hatch: { x: HATCH.x - 1.3, z: HATCH.z + 1, yaw: 160 },
    from_track: { x: THICKET.x + 0.4, z: THICKET.z + 3.2, yaw: 170 },
  },
  atmosphere: forestAtmosphere,

  build(kit, ctx) {
    suddenLife(kit, ctx, 'forest');
    const phase = storyPhase(ctx.state);
    kit.ground('grass', 0);
    forestFloor(kit, area, height);
    trailStrip(kit, approach, 1.6, height);
    trailStrip(kit, track, 0.8, height);

    const onTrail = (x: number, z: number) => distanceToTrails(trails, x, z) < 2.6;
    const clear = (x: number, z: number) => onTrail(x, z) || inClearing(x, z) < 1.5 || Math.hypot(x - HATCH.x, z - HATCH.z) < 2.5 || atCoat(x, z);
    const near = (x: number, z: number) => calm(x, z) < 10;
    const spruceClear = (x: number, z: number) => calm(x, z) < 4.2;
    woodland(kit, { area, seed: 'fort', avoid: clear, near, spruceClear, spruce: 480, beech: 60, birch: 6, distant: 1200 });
    leaningBeeches(kit, { area, seed: 'fort', trails, count: 16, avoid: (x, z) => inClearing(x, z) < 2 || Math.hypot(x - HATCH.x, z - HATCH.z) < 3 || Math.hypot(x - THICKET.x, z - THICKET.z) < 4 });
    spruceWall(kit, { area, seed: 'fort', trails, from: 10, to: 24, count: 220, avoid: (x, z) => inClearing(x, z) < 7 });
    const offTrail = (inner: number, outer: number) => (x: number, z: number) =>
      distanceToTrails(trails, x, z) < inner || inClearing(x, z) < 0.5 || calm(x, z) > outer || Math.hypot(x - HATCH.x, z - HATCH.z) < 2;
    const props = keepClear(approach, track);
    undergrowth(kit, area, { seed: 'fort-low', count: 800, mix: lowPlants, spacing: 0.75, avoid: (x, z) => offTrail(1.2, 9)(x, z) || props.low(x, z) });
    undergrowth(kit, area, { seed: 'fort-tall', count: 900, mix: tallPlants, spacing: 1, avoid: (x, z) => offTrail(2, 14)(x, z) || props.tall(x, z) || props.low(x, z) || atCoat(x, z) });
    mossPatches(kit, height, scatter({ ...area, count: 90, seed: 'fort-moss', spacing: 2.4, avoid: offTrail(1.4, 10) }));
    [
      [-7, 7, 0.6],
      [6.5, 6, 0.4],
      [-8.5, -6, 0.8],
      [9.5, -2, 0.5],
      [1.5, -24, 0.5],
    ].forEach(([x, z, size], i) => rock(kit, x!, z!, size!, `fort-rock-${i}`));
    fallenLog(kit, -9, 12, 70, 4);
    fallenLog(kit, 11, 10, -20, 3.5);
    decoy(kit, 'coat_on_post', COAT);

    const scares = stageFort(kit, ctx, phase);
    fort(kit, ctx, phase, scares);
    hatch(kit, ctx, phase);
    thicket(kit, ctx, phase);
    dressClearing(kit, ctx, { height, floor: FLOOR, approach, track });
    hints(kit, ctx, phase, { door: DOOR, hatch: HATCH, thicket: THICKET, offPath: (x, z) => calm(x, z) > 6 });

    enclose(kit, area);
    kit.exit({ w: 6, d: 1, to: 'forest_path', spawn: 'from_bunker' }).at(0, 0, 27.8);

    forestAmbience(kit, ctx);
    nightMist(kit, ctx);
    nightSky(kit, ctx);
  },

  update: lostInTheFog(trails),
});

const PLANKS = 0x7a6852;
const TRIM = 0x9c8c72;
const SHINGLES = 0x6e665e;

/**
 * The concrete fort under its barn costume: a concrete plinth, plank walls painted on the
 * concrete, a big false barn door, a shingle roof, and the steel door deep in a plank opening.
 */
function fort(kit: LevelKit, ctx: SceneContext, phase: StoryPhase, scares: ScareDirector): void {
  const { w, d } = FORT;
  const front = d / 2;
  const floor = 0.5;
  const wallH = 3.1;
  const eaves = floor + wallH;
  const door = { w: 1.4, h: 2.3, depth: 0.9 };
  kit.group((g) => {
    const planks = (size: { w: number; h: number; d: number }) => g.box(size).texture('wood_planks', { tile: [1.2, 2.4] }).color(PLANKS);
    g.box({ w: w + 0.4, h: 0.9, d: d + 0.4 }).texture('concrete_bunker', { tile: 1.4 }).color(0x8a8a82).at(0, floor - 0.9, 0).collider();
    // Back and side walls are solid; the front is built round the door opening.
    planks({ w, h: wallH, d: 0.3 }).at(0, floor, -front + 0.15);
    planks({ w: 0.3, h: wallH, d }).at(-w / 2 + 0.15, floor, 0);
    planks({ w: 0.3, h: wallH, d }).at(w / 2 - 0.15, floor, 0);
    const side = (w - door.w) / 2;
    planks({ w: side, h: wallH, d: 0.3 }).at(-(side + door.w) / 2, floor, front - 0.15);
    planks({ w: side, h: wallH, d: 0.3 }).at((side + door.w) / 2, floor, front - 0.15);
    planks({ w: door.w, h: wallH - door.h, d: 0.3 }).at(0, floor + door.h, front - 0.15);
    // Corner posts and the beam under the eaves, lighter, so the barn's frame reads in fog.
    [-1, 1].forEach((sx) =>
      [-1, 1].forEach((sz) => g.box({ w: 0.2, h: wallH, d: 0.2 }).texture('wood_planks', { tile: 0.8 }).color(TRIM).at((sx * (w - 0.1)) / 2, floor, (sz * (d - 0.1)) / 2)),
    );
    g.box({ w: w + 0.1, h: 0.18, d: 0.08 }).texture('wood_planks', { tile: 0.8 }).color(TRIM).at(0, eaves - 0.2, front + 0.02);
    roof(g, w, d, eaves);

    falseBarnDoor(g, -3, floor, front);

    // The opening: a plank surround, concrete reveals and soffit in shadow, the steel door at the back.
    const trim = (tw: number, th: number, tx: number, ty: number) =>
      g.box({ w: tw, h: th, d: 0.06 }).texture('wood_planks', { tile: 0.8 }).color(TRIM).at(tx, ty, front + 0.03);
    trim(0.16, door.h + 0.16, -(door.w / 2 + 0.08), floor);
    trim(0.16, door.h + 0.16, door.w / 2 + 0.08, floor);
    trim(door.w + 0.48, 0.18, 0, floor + door.h);
    [-1, 1].forEach((sx) =>
      g.box({ w: 0.12, h: door.h, d: door.depth }).texture('concrete_bunker', { tile: 1 }).color(0x4a4a45).at((sx * (door.w - 0.12)) / 2, floor, front - door.depth / 2),
    );
    g.box({ w: door.w, h: 0.12, d: door.depth }).texture('concrete_bunker', { tile: 1 }).color(0x46463f).at(0, floor + door.h - 0.12, front - door.depth / 2);
    const steelZ = front - door.depth;
    g.box({ w: door.w - 0.24, h: door.h - 0.12, d: 0.1 }).texture('bunker_door', { tile: [door.w - 0.24, door.h - 0.12] }).color(0x46503f).at(0, floor, steelZ);
    doorWheel(g, 0.25, floor + 1.15, steelZ + 0.1);
    g.box({ w: 0.26, h: 0.12, d: 0.02 }).texture('concrete_bunker', { tile: 0.3 }).color(0xa8a490).at(-0.25, floor + 1.75, steelZ + 0.06);

    // The real wooden door, hanging half off its top hinge.
    const leaf = g.box({ w: 1.15, h: 2.05, d: 0.06 }).texture('wood_planks', { tile: [0.9, 2.4] }).color(0x6a5c4a).at(-1.05, floor + 0.02, front + 0.32).rotY(-38);
    leaf.object.rotation.z = 0.09;

    // The "hay hatch" is a steel shutter over a firing slit, open a crack.
    g.box({ w: 1.2, h: 1.0, d: 0.06 }).texture('rust_metal', { tile: 0.8 }).color(0x5e5a52).at(3.9, floor + 1.95, front + 0.02);
    g.box({ w: 1.0, h: 0.08, d: 0.04 }).color(0x060606).unlit().at(3.9, floor + 1.6, front + 0.06);

    // Where the paint has flaked, concrete shows; on the bare patch by the door, graffiti.
    [
      [3.6, floor + 0.6, 0.9, 0.7],
      [-4.6, floor + 1.2, 0.5, 0.6],
      [1.5, floor + 2.5, 0.5, 0.4],
    ].forEach(([x, y, pw, ph]) =>
      g.box({ w: pw!, h: ph!, d: 0.02 }).texture('concrete_bunker', { tile: 0.8 }).color(0x9a9890).at(x!, y!, front + 0.01),
    );
    g.box({ w: 1.9, h: 1.5, d: 0.02 }).texture('concrete_bunker', { tile: 1 }).color(0x8e8c86).at(2.2, floor + 0.3, front + 0.01);
    scrawl(g, { w: 1.8, h: 1.4 }, [96, 72], (c) => {
      handText(c, 'KEVIN + SANDRA', 6, 14, { size: 13, color: '#9c2c26', angle: -6 });
      handText(c, 'Nirvana', 20, 34, { size: 15, color: '#20201c', angle: 3 });
      maskedSmiley(c, 74, 48);
      handText(c, 'il nous regarde', 8, 62, { size: 7, color: '#3a3832', font: 'serif' });
    })
      .at(2.2, floor + 0.35, front + 0.035);
  })
    .at(FORT.x, FLOOR, FORT.z);

  const wedged = phase === 'day1' || phase === 'night1';
  kit
    .hotspot({
      prompt: wedged ? 'Turn the wheel' : 'Go inside',
      radius: 0.5,
      onInteract: async () => {
        if (wedged) {
          if (phase === 'night1') scares.fire('for1_cup');
          return playNode(ctx, 'fort_door_night1');
        }
        if (!ctx.state.hasFlag('bunker_door_open') && phase !== 'night3') await playNode(ctx, 'fort_door_day2');
        ctx.goTo('bunker_interior', 'from_entrance');
      },
    })
    .at(DOOR.x, 0, DOOR.z)
    .leadsTo('bunker_interior');
  kit.hotspot({ prompt: 'Read the plate', radius: 0.25, onInteract: () => playNode(ctx, 'fort_plate') }).at(-0.45, 0, DOOR.z);
  kit.hotspot({ prompt: 'Look at the graffiti', radius: 0.6, onInteract: () => playNode(ctx, 'fort_graffiti') }).at(2.2, 0, FRONT + 0.4);
}

/** A smiley in a gas mask, the way a bored teenager sprays one. */
function maskedSmiley(g: CanvasRenderingContext2D, x: number, y: number): void {
  g.strokeStyle = '#20201c';
  g.lineWidth = 2;
  g.beginPath();
  g.arc(x, y, 11, 0, Math.PI * 2);
  g.stroke();
  [-4, 4].forEach((dx) => {
    g.beginPath();
    g.arc(x + dx, y - 3, 3, 0, Math.PI * 2);
    g.stroke();
  });
  g.fillStyle = '#20201c';
  g.fillRect(x - 2, y + 3, 5, 6);
}

/** A broad shingle roof with deep eaves over plank gable ends, as on the farms round Leurs. */
function roof(g: LevelKit, w: number, d: number, eaves: number): void {
  const rise = 2.6;
  const out = { x: 0.9, z: 1.0 };
  const pitch = Math.atan2(rise, d / 2);
  const run = d / 2 + out.z;
  const length = run / Math.cos(pitch);
  g.gable({ w, d, h: rise }).texture('wood_planks', { tile: [1.2, 2.4] }).color(PLANKS).at(0, eaves, 0);
  [-1, 1].forEach((sz) =>
    g
      .mesh(
        new BoxGeometry(w + 2 * out.x, 0.14, length)
          .rotateX(sz * pitch)
          .translate(0, eaves + rise - (run / 2) * Math.tan(pitch) + 0.08, (sz * run) / 2),
      )
      .texture('roof_shingles', { tile: [1 / 6, 1 / 3] })
      .color(SHINGLES),
  );
  g.box({ w: w + 2 * out.x, h: 0.12, d: 0.3 }).texture('rust_metal', { tile: 0.6 }).color(0x4a4640).at(0, eaves + rise + 0.06, 0);
}

/** Two tall plank leaves with Z braces, nailed to the concrete. There is nothing behind them. */
function falseBarnDoor(g: LevelKit, x: number, floor: number, front: number): void {
  const leaf = { w: 1.2, h: 2.7 };
  const z = front + 0.03;
  g.box({ w: 2 * leaf.w + 0.3, h: 0.2, d: 0.1 }).texture('wood_planks', { tile: 0.8 }).color(TRIM).at(x, floor + leaf.h, z);
  [-1, 1].forEach((side) => {
    const cx = x + (side * (leaf.w + 0.02)) / 2;
    g.box({ w: leaf.w, h: leaf.h, d: 0.05 }).texture('wood_planks', { tile: [0.9, 2.4] }).color(0x6c5c48).at(cx, floor, z);
    [0.15, leaf.h / 2, leaf.h - 0.3].forEach((y) =>
      g.box({ w: leaf.w - 0.06, h: 0.14, d: 0.04 }).texture('wood_planks', { tile: 0.8 }).color(TRIM).at(cx, floor + y, z + 0.04),
    );
    // A brace in each half, rising toward the hinge side.
    const run = leaf.w - 0.14;
    const rise = leaf.h / 2 - 0.3;
    [0.22, leaf.h / 2 + 0.07].forEach((y0) =>
      g
        .mesh(new BoxGeometry(0.12, Math.hypot(run, rise), 0.04).rotateZ(side * Math.atan2(run, rise)))
        .texture('wood_planks', { tile: 0.8 })
        .color(TRIM)
        .at(cx, floor + y0 + rise / 2, z + 0.04),
    );
    [0.4, leaf.h - 0.5].forEach((y) =>
      g.box({ w: 0.5, h: 0.05, d: 0.02 }).texture('rust_metal', { tile: 0.3 }).color(0x3e3a34).at(cx + (side * leaf.w) / 2 - side * 0.25, floor + y, z + 0.07),
    );
  });
  g.box({ w: 0.05, h: leaf.h - 0.1, d: 0.06 }).color(0x0c0b0a).unlit().at(x, floor + 0.05, z + 0.01);
}

/** The hand wheel that throws the steel door's bolts: a rim, a hub, and five spokes. */
function doorWheel(g: LevelKit, x: number, y: number, z: number): void {
  const r = 0.2;
  const wheel = g.group((h) => {
    const rust = (geometry: BufferGeometry) => h.mesh(geometry).texture('rust_metal', { tile: 0.25 }).color(0x6a5c4c);
    rust(new TorusGeometry(r, 0.018, 4, 12));
    rust(new CylinderGeometry(0.04, 0.04, 0.07, 6).rotateX(Math.PI / 2));
    rust(new CylinderGeometry(0.018, 0.018, 0.12, 4).rotateX(Math.PI / 2).translate(0, 0, -0.06));
    [0, 1, 2, 3, 4].forEach((i) => rust(new BoxGeometry(0.022, r, 0.016).translate(0, r / 2, 0).rotateZ((i * 2 * Math.PI) / 5)));
    rust(new CylinderGeometry(0.016, 0.016, 0.09, 4).rotateX(Math.PI / 2).translate(0, -r, 0.05));
  });
  wheel.at(x, y, z + 0.06);
  wheel.object.rotation.z = 0.3;
}

/**
 * The emergency exit under a fallen spruce: a concrete square and a steel lid with no handle. At
 * dawn the reporter has just climbed out, and the lid lies thrown back on the moss.
 */
function hatch(kit: LevelKit, ctx: SceneContext, phase: StoryPhase): void {
  kit.box({ w: 1.2, h: 0.3, d: 1.2 }).texture('concrete_bunker', { tile: 1 }).color(0x8a8a80).at(HATCH.x, -0.12, HATCH.z).onGround().collider();
  if (phase === 'dawn') {
    kit.box({ w: 0.8, h: 0.02, d: 0.8 }).unlit().color(0x050505).at(HATCH.x, 0.185, HATCH.z).onGround();
    kit.box({ w: 0.86, h: 0.05, d: 0.86 }).texture('rust_metal', { tile: 0.6 }).color(0x6a5a4a).at(HATCH.x + 0.95, 0.02, HATCH.z + 0.2).rotY(14).onGround();
  } else kit.box({ w: 0.86, h: 0.05, d: 0.86 }).texture('rust_metal', { tile: 0.6 }).color(0x6a5a4a).at(HATCH.x, 0.18, HATCH.z).onGround();
  fallenLog(kit, HATCH.x - 2.6, HATCH.z - 1.1, -12, 6.5, 0.28);
  // The moss worn into a path, from the hatch to the track.
  kit.plane({ w: 0.7, d: 3.2 }).texture('mud', { tile: 1.5 }).color(0x5e584f).at(HATCH.x - 1.6, 0.05, HATCH.z + 0.6).rotY(-62).onGround();
  kit.hotspot({ prompt: 'Look at the hatch', radius: 0.7, onInteract: () => playNode(ctx, 'forest_hatch') }).at(HATCH.x, 0, HATCH.z);
}

/** Young spruce and bramble over the track. On day 3, with the letter read, the reporter pushes through. */
function thicket(kit: LevelKit, ctx: SceneContext, phase: StoryPhase): void {
  leafyTrees(
    kit,
    'spruce',
    [-2.2, -1, 0.3, 1.6, 2.8].map((dx, i) => ({ x: THICKET.x + dx, z: THICKET.z - 0.6 - (i % 2) * 0.9, scale: 0.42 + (i % 3) * 0.08, yaw: i * 70 })),
  );
  [-2.6, -1.4, -0.2, 1, 2.2, 3.2].forEach((dx, i) =>
    kit.sprite('bush', { w: 1.6, h: 1.25 }).color(0x5e6052).at(THICKET.x + dx, -0.05, THICKET.z + 0.2 - (i % 2) * 0.5).onGround(),
  );
  kit.barrier({ w: 9, d: 1.4 }).at(THICKET.x, 0, THICKET.z);
  const open = phase === 'day3' && ctx.state.hasFlag('read_gremaud_letter');
  kit
    .hotspot({
      prompt: open ? 'Push through to the larch' : 'Look at the track',
      radius: 1,
      onInteract: () =>
        open ? ctx.goTo('forest_deep', 'from_fort') : ctx.say("The track goes on up into the thicket. In this fog I'd lose myself in a minute."),
    })
    .at(THICKET.x, 0, THICKET.z + 0.9)
    .leadsTo('forest_deep');
}

export const scenes = [bunkerExteriorScene];
