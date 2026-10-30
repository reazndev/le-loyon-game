import { CylinderGeometry } from 'three';
import type { LevelKit } from '../../game/kit/levelKit';
import { scareDirector, type ScareDirector } from '../../game/scares/director';
import { playSound } from '../../game/scares/sounds';
import { defineScene, type SceneContext } from '../../game/scene';
import type { Markers } from '../forest_path/beats';
import { lostInTheFog } from '../forest_path/lost';
import { playNode } from '../forest_path/play';
import { handText, scrawl } from '../forest_path/scrawl';
import { unspent } from '../forest_path/spent';
import { isNight, storyPhase, type StoryPhase } from '../forest_path/story';
import { distanceToTrails, type Trail } from '../forest_path/trail';
import { enclose, fallenLog, forestAmbience, forestAtmosphere, forestFloor, rock, trailStrip, undergrowth, woodland, woodsHeight, type Area } from '../forest_path/woods';

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
 * the hatch: the worn path, and silence. Nights have the random sounds of the forest.
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
          when: { look: { ...markers.for3_hatch, y: 0.3, within: 6, angle: 14, hold: 1 } },
          if: { count: [['day', '==', 3], ['night', '==', 0]] },
          do: [{ silence: 9 }],
        },
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
    const phase = storyPhase(ctx.state);
    kit.ground('grass', 0);
    forestFloor(kit, area, height);
    trailStrip(kit, approach, 1.6, height);
    trailStrip(kit, track, 0.8, height);

    const onTrail = (x: number, z: number) => distanceToTrails(trails, x, z) < 2.6;
    const clear = (x: number, z: number) => onTrail(x, z) || inClearing(x, z) < 1.5 || Math.hypot(x - HATCH.x, z - HATCH.z) < 2.5;
    const near = (x: number, z: number) => calm(x, z) < 10;
    const spruceClear = (x: number, z: number) => calm(x, z) < 4.2;
    woodland(kit, { area, seed: 'fort', avoid: clear, near, spruceClear, spruce: 330, beech: 40, birch: 6, distant: 1000 });
    undergrowth(kit, area, { seed: 'fort', count: 420, avoid: (x, z) => onTrail(x, z) || inClearing(x, z) < 0.5 || calm(x, z) > 14 });
    [
      [-7, 7, 0.6],
      [6.5, 6, 0.4],
      [-8.5, -6, 0.8],
      [9.5, -2, 0.5],
      [1.5, -24, 0.5],
    ].forEach(([x, z, size], i) => rock(kit, x!, z!, size!, `fort-rock-${i}`));
    fallenLog(kit, -9, 12, 70, 4);
    fallenLog(kit, 11, 10, -20, 3.5);

    const scares = stageFort(kit, ctx, phase);
    fort(kit, ctx, phase, scares);
    hatch(kit, ctx, phase);
    thicket(kit, ctx, phase);

    enclose(kit, area);
    kit.exit({ w: 6, d: 1, to: 'forest_path', spawn: 'from_bunker' }).at(0, 0, 27.8);

    forestAmbience(kit, ctx);
  },

  update: lostInTheFog(trails),
});

const PLANKS = 0x7a7368;

/** The concrete fort under its barn costume: plinth, painted plank walls, a board roof. */
function fort(kit: LevelKit, ctx: SceneContext, phase: StoryPhase, scares: ScareDirector): void {
  const { w, d } = FORT;
  const wallH = 3.1;
  const base = 0.9;
  kit.group((g) => {
    g.box({ w: w + 0.4, h: base, d: d + 0.4 }).texture('stone_wall', { tile: 1.6 }).color(0x8e8b84).at(0, -0.4, 0).collider();
    // Back and side walls are solid; the front is built round the door recess.
    g.box({ w, h: wallH, d: 0.3 }).texture('wood_planks', { tile: [1.8, 2.4] }).color(PLANKS).at(0, base - 0.4, -d / 2 + 0.15);
    g.box({ w: 0.3, h: wallH, d }).texture('wood_planks', { tile: [1.8, 2.4] }).color(PLANKS).at(-w / 2 + 0.15, base - 0.4, 0);
    g.box({ w: 0.3, h: wallH, d }).texture('wood_planks', { tile: [1.8, 2.4] }).color(PLANKS).at(w / 2 - 0.15, base - 0.4, 0);
    const side = (w - 1.4) / 2;
    g.box({ w: side, h: wallH, d: 0.3 }).texture('wood_planks', { tile: [1.8, 2.4] }).color(PLANKS).at(-(side + 1.4) / 2, base - 0.4, d / 2 - 0.15);
    g.box({ w: side, h: wallH, d: 0.3 }).texture('wood_planks', { tile: [1.8, 2.4] }).color(PLANKS).at((side + 1.4) / 2, base - 0.4, d / 2 - 0.15);
    g.box({ w: 1.4, h: wallH - 2.3, d: 0.3 }).texture('wood_planks', { tile: [1.8, 2.4] }).color(PLANKS).at(0, base - 0.4 + 2.3, d / 2 - 0.15);
    g.gable({ w: w + 0.8, d: d + 0.9, h: 3.4 }).texture('wood_planks', { tile: [1.4, 2.2] }).color(0x5f5d58).at(0, base - 0.4 + wallH, 0);
    // Boards under the eaves, so the overhang doesn't show sky.
    g.box({ w: w + 0.8, h: 0.08, d: d + 0.9 }).texture('wood_planks', { tile: 1.4 }).color(0x3e3c38).at(0, base - 0.48 + wallH, 0);

    // The recess: concrete reveals, the green steel door, its wheel, and the enamel plate.
    g.box({ w: 0.15, h: 2.3, d: 0.9 }).texture('concrete_bunker', { tile: 1 }).at(-0.78, base - 0.4, d / 2 - 0.45);
    g.box({ w: 0.15, h: 2.3, d: 0.9 }).texture('concrete_bunker', { tile: 1 }).at(0.78, base - 0.4, d / 2 - 0.45);
    g.box({ w: 1.4, h: 2.3, d: 0.1 }).texture('bunker_door', { tile: [1.4, 2.3] }).color(0x74866a).at(0, base - 0.4, d / 2 - 0.9);
    g.mesh(new CylinderGeometry(0.17, 0.17, 0.05, 8).rotateX(Math.PI / 2)).texture('rust_metal', { tile: 0.3 }).color(0x56604e).at(0.25, base + 0.75, d / 2 - 0.82);
    g.box({ w: 0.28, h: 0.13, d: 0.02 }).color(0xc8c2ae).at(-0.25, base + 1.35, d / 2 - 0.84);

    // The real wooden door, hanging half off its top hinge.
    const leaf = g.box({ w: 1.15, h: 2.05, d: 0.06 }).texture('door_wood', { tile: [1.15, 2.05] }).color(0x8a8278).at(-1.05, base - 0.38, d / 2 + 0.32).rotY(-38);
    leaf.object.rotation.z = 0.09;

    // The "hay door" up front is a steel shutter over a firing slit, open a crack.
    g.box({ w: 1.5, h: 1.05, d: 0.06 }).texture('rust_metal', { tile: 0.8 }).color(0x5e5a52).at(-3, base + 1.55, d / 2 + 0.02);
    g.box({ w: 1.2, h: 0.08, d: 0.04 }).color(0x060606).unlit().at(-3, base + 1.15, d / 2 + 0.06);

    // Where the paint has flaked, concrete shows; on the bare patch by the door, graffiti.
    [
      [3.6, base + 0.2, 0.9, 0.7],
      [-4.2, base + 1.9, 0.6, 0.5],
      [1.5, base + 2.4, 0.5, 0.4],
    ].forEach(([x, y, pw, ph]) =>
      g.box({ w: pw!, h: ph!, d: 0.02 }).texture('concrete_bunker', { tile: 0.8 }).color(0x9a9890).at(x!, y!, d / 2 + 0.01),
    );
    g.box({ w: 1.9, h: 1.5, d: 0.02 }).texture('concrete_bunker', { tile: 1 }).color(0x8e8c86).at(2.2, base - 0.1, d / 2 + 0.01);
    scrawl(g, { w: 1.8, h: 1.4 }, [96, 72], (c) => {
      handText(c, 'KEVIN + SANDRA', 6, 14, { size: 13, color: '#9c2c26', angle: -6 });
      handText(c, 'Nirvana', 20, 34, { size: 15, color: '#20201c', angle: 3 });
      maskedSmiley(c, 74, 48);
      handText(c, 'il nous regarde', 8, 62, { size: 7, color: '#3a3832', font: 'serif' });
    })
      .at(2.2, base - 0.05, d / 2 + 0.035);
  })
    .at(FORT.x, FLOOR, FORT.z);

  const wedged = phase === 'day1' || phase === 'night1';
  const doorZ = FRONT - 0.3;
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
    .at(0.2, 0, doorZ);
  kit.hotspot({ prompt: 'Read the plate', radius: 0.25, onInteract: () => playNode(ctx, 'fort_plate') }).at(-0.45, 0, doorZ);
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
  kit.trees(
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
    .at(THICKET.x, 0, THICKET.z + 0.9);
}

export const scenes = [bunkerExteriorScene];
