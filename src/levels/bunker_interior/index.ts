import { CircleGeometry, CylinderGeometry, Euler, MathUtils, SphereGeometry, Vector3, type Group, type Object3D } from 'three';
import { dialogues } from '../../content';
import { noiseBurst, thump } from '../../engine/audio/generators';
import type { Shape } from '../../engine/physics/collision';
import type { Atmosphere } from '../../engine/render/atmosphere';
import type { LevelKit } from '../../game/kit/levelKit';
import { viewAngle } from '../../game/scares/beats';
import { scareDirector, type ScareDirector } from '../../game/scares/director';
import { defineScene, type SceneContext } from '../../game/scene';
import type { TimeOfDay } from '../../game/state';
import { arriveAs } from '../bunker_hidden/arrival';
import type { Markers } from '../forest_path/beats';
import { playNode } from '../forest_path/play';
import { handText, scrawl } from '../forest_path/scrawl';
import { isSpent, unspent } from '../forest_path/spent';
import { drumBoom, maskSlide, ventHum } from '../forest_path/sounds';
import { isNight, storyPhase, type StoryPhase } from '../forest_path/story';
import { yawToward } from '../forest_path/trail';
import { fortAmbient, SHAFTS } from './ambient';
import { fortClutter } from './clutter';
import { buildRooms, movingBlocker } from './concrete';
import { dripInTheNextRoom } from './drips';
import { easePose } from './facing';
import { isFriendlyKnock } from './knock';
import { floorMask, heapPoses, maskPile, uprightMask, type HeapOptions, type MaskPose } from './masks';
import { beerCans, bench, bunkStack, ceilingRuns, chair, graffiti, locker, stencil, stubs, table, wires } from './props';
import { neighbors, roomAt, type Opening, type Room } from './rooms';
import { hints } from './hints';
import { fortBeats } from './scares';
import { screamer } from '../../game/scares/screamers';

/**
 * Fort, outer rooms. The vaulted entrance, the gas lock, one long corridor with the guard room
 * and latrines to the west, the dormitory, mask store, and machine room to the east, and the
 * casemate at the far end. There is no electric light: the torch, and daylight for 5 m.
 */

const rooms: Room[] = [
  { id: 'entrance', x0: -0.9, x1: 0.9, z0: -8, z1: 1.2, h: 2.2 },
  { id: 'gaslock', x0: -0.9, x1: 0.9, z0: -11, z1: -8.6, h: 2.1 },
  { id: 'corridor', x0: -0.9, x1: 0.9, z0: -40, z1: -11.6, h: 2.1 },
  { id: 'guard', x0: -6.5, x1: -1.5, z0: -18, z1: -13, h: 2.3 },
  { id: 'latrines', x0: -11.1, x1: -7.1, z0: -18, z1: -13, h: 2.3 },
  { id: 'dormitory', x0: 1.5, x1: 12, z0: -34, z1: -28, h: 2.4 },
  { id: 'masks', x0: 3, x1: 11.5, z0: -27.4, z1: -23.4, h: 2.4 },
  { id: 'machine', x0: 3, x1: 11.5, z0: -22.8, z1: -16.8, h: 2.6 },
  { id: 'casemate', x0: -3, x1: 3, z0: -46, z1: -40.6, h: 2.4 },
  // The dark passage behind the K.P. 3 door. Marc's room itself is the bunker_hidden scene.
  { id: 'kp3', x0: 12.6, x1: 15.8, z0: -31.7, z1: -30.3, h: 2.1 },
];
const openings: Opening[] = [
  { a: 'entrance', b: 'gaslock', at: 0, w: 1.1, h: 1.95 },
  { a: 'gaslock', b: 'corridor', at: 0, w: 1.1, h: 1.95 },
  { a: 'corridor', b: 'guard', at: -15.5, w: 1 },
  { a: 'guard', b: 'latrines', at: -14.2, w: 0.9 },
  { a: 'corridor', b: 'dormitory', at: -31, w: 1.1 },
  { a: 'dormitory', b: 'masks', at: 10.6, w: 1 },
  { a: 'masks', b: 'machine', at: 10.1, w: 1 },
  { a: 'corridor', b: 'casemate', at: 0, w: 1.2 },
  { a: 'dormitory', b: 'kp3', at: -31, w: 0.9 },
];

const atmosphere: Record<TimeOfDay, Atmosphere> = {
  day: {
    fog: { color: 0x0a0b0b, near: 1, far: 14, density: 0.06, wisps: 0.15 },
    // Grey daylight from the entrance and the firing slit, so the day visit reads safer than night 3.
    ambient: 0x242625,
    saturation: 0.6,
    flashlight: true,
  },
  night: {
    fog: { color: 0x030303, near: 0.6, far: 12, density: 0.09, wisps: 0.1 },
    ambient: 0x060606,
    saturation: 0.55,
    flashlight: true,
  },
};

const CUPBOARD = { x: 11.75, z: -31, w: 1, d: 0.5, h: 2 };
const CUPBOARD_ASIDE = -32.15;
const BATTERY = { x: 10.8, z: -20.25 };
const KP3 = { x: 12.15, z: -31, hinge: -31.45 };
const HEAP: Omit<HeapOptions, 'count' | 'seed'> = { x: 6.4, z: -24.75, rx: 2.7, rz: 1.45, height: 1, lookAt: { x: 10.6, y: 1.6, z: -27.4 } };
const TENT_SHEET = { x: -7.6, z: -17.85 };
const MIRROR = { x: -9.3, z: -13.02 };
/** Where Marc stands in the passage while he talks through the open door: well back, never within 3 m. */
const MARC_BACK = { x: 15.2, z: -31 };
/** Where the reporter stands to see Marc through the open door: square to the doorway, 4 m from him. */
const FACING_MARC = { x: 11.15, z: -30.95 };
/** The fort_phone choice that turns the crank. */
const CRANK = dialogues.fort_phone.nodes.fort_phone!.choices!.find((choice) => choice.next === 'fort_phone_crank')!.text;

export const markers = {
  bun2_wedge: { beat: 'bun2_wedge', x: 0.45, z: -0.6, yaw: 0, note: 'Day 2, entering: the wedge kicked aside on the floor. Dressed by the scene.' },
  bun2_drip: {
    beat: 'bun2_drip',
    x: 0,
    z: -25,
    yaw: 0,
    note: 'Built in: `dripInTheNextRoom` plays a drip in a room next to the player wherever they go. Silence drops should fade the ambience bus.',
  },
  bun2_mirror: {
    beat: 'bun2_mirror',
    ...TENT_SHEET,
    y: 0.3,
    yaw: 180,
    note: 'By day the latrine mirror shows a blurred dark shape behind the player: the tent sheet on its hook here. Looking in drops every sound for a moment.',
  },
  bun2_masks_slide_from: {
    beat: 'bun2_masks',
    x: HEAP.x + 1.6,
    y: 0.85,
    z: HEAP.z - 0.4,
    yaw: 0,
    note: 'Day 2, when the player has stood in the mask store and turns to the door: one mask slides off the top of the heap from here.',
  },
  bun2_masks_slide_to: {
    beat: 'bun2_masks',
    x: HEAP.x + 2.5,
    z: HEAP.z - 1.15,
    yaw: 0,
    note: 'Where it lands: face up, eyepieces to the ceiling, with a soft sliding rattle.',
  },
  bun2_cupboard_screech_echo: {
    beat: 'bun2_cupboard_screech',
    x: 16,
    y: -0.5,
    z: -37,
    yaw: 0,
    note: 'After the push: a second, fainter screech from far off, like the escape hatch lid. Too late to be an echo.',
  },
  bun2_door_listen: { beat: 'bun2_door_listen', x: KP3.x + 1.5, y: 1, z: KP3.z, yaw: 90, note: 'Listening at K.P. 3: slow breathing, or the wind in a shaft, while the narration says so.' },
  bun3_tentsheet: { beat: 'bun3_tentsheet', ...TENT_SHEET, yaw: 180, note: 'Night 3: the hook is bare. The scene leaves the tent sheet out.' },
  bun3_masks: { beat: 'bun3_masks', x: 3.35, y: 1.45, z: -25.1, yaw: -90, note: 'Night 3: the clean shelf still has six; the seventh space is empty. Looking at it drops every sound.' },
  bun3_phone: { beat: 'bun3_phone', x: 18, y: 1.3, z: -31, yaw: 90, note: 'Night 3, after turning the guard room phone crank: a phone rings once, here, deep in the fort.' },
  bun3_drum: {
    beat: 'bun3_drum',
    x: KP3.x,
    y: 1,
    z: KP3.z,
    yaw: 90,
    note: 'Night 3, after tapping a fuel drum: one soft tap on the K.P. 3 door if Marc is in (the player has knocked), otherwise silence.',
  },
  bun3_light_under_door: { beat: 'bun3_light_under_door', x: KP3.x, z: KP3.z, yaw: 90, note: 'Night 3: the warm line under the door. Built in; it goes out on a wrong knock.' },
  bun3_knock: {
    beat: 'bun3_knock',
    x: KP3.x + 1,
    y: 1.2,
    z: KP3.z,
    yaw: 90,
    note: 'Right knock: a long silence, breathing through the steel from here, then his voice. Wrong knock: the light under the door goes out.',
  },
  marc_door: {
    beat: 'marc_door_voice',
    ...MARC_BACK,
    yaw: 90,
    note: 'Right knock: Marc stands here, well back in the passage, while he talks. The door swings open when he gives his name.',
  },
} satisfies Markers;

type Update = (dt: number, ctx: SceneContext) => void;
let updates: Update[] = [];
let cleanups: (() => void)[] = [];
let scares: ScareDirector | null = null;
const fire = (beat: string) => scares?.fire(beat);

export const bunkerInteriorScene = defineScene({
  id: 'bunker_interior',
  spawns: {
    default: { x: 0, z: -0.3, yaw: 0 },
    from_entrance: { x: 0, z: -0.3, yaw: 0 },
    from_hidden_room: { x: 10.7, z: -31, yaw: 90 },
  },
  atmosphere,

  build(kit, ctx) {
    updates = [];
    cleanups = [];
    const phase = storyPhase(ctx.state);
    kit.ground('stone', 0);
    buildRooms(kit, rooms, openings, {
      entrance: { finish: 'vault', open: ['s'], floor: 0x6e6a62 },
      casemate: { open: ['n'] },
      dormitory: { floor: 0x9a968c },
      kp3: { finish: 'bare', floor: 0x5c5850 },
    });

    entrance(kit, ctx, phase);
    gasLock(kit, ctx, phase);
    kit.batch((still) => {
      corridor(still);
      guardRoom(still, ctx, phase);
      latrines(still, ctx, phase);
    });
    const kp3 = dormitory(kit, ctx, phase);
    const slideMask = maskStore(kit, ctx, phase);
    machineRoom(kit, ctx, phase, kp3);
    casemate(kit, ctx, phase);
    fortClutter(kit);
    hints(kit, ctx, phase, { cupboard: CUPBOARD, door: KP3, battery: BATTERY, kp3 });

    kit.ambience('drone', { volume: 0.16 });
    vents(kit, ctx);
    fortAmbient(kit, ctx, isNight(phase));
    updates.push(dripInTheNextRoom(rooms, openings));
    scares = kit.use(
      scareDirector(
        unspent(ctx.state, [...fortBeats(ctx, { markers, cupboard: { x: CUPBOARD.x, y: 0.4, z: CUPBOARD.z }, slideMask, voice: kp3.voice }), screamer('bunker', 50)]),
        { random: { surface: 'stone' } },
      ),
    );
  },

  update(dt, ctx) {
    updates.forEach((update) => update(dt, ctx));
  },

  dispose() {
    cleanups.forEach((cleanup) => cleanup());
    scares = null;
  },
});

/** Air in the shafts: a grille in the corridor ceiling and one over the generator, each humming. */
function vents(kit: LevelKit, ctx: SceneContext): void {
  SHAFTS.forEach((at) => {
    kit.box({ w: 0.5, h: 0.04, d: 0.5 }).texture('rust_metal', { tile: 0.3 }).color(0x3a3a36).at(at.x, at.y - 0.04, at.z);
    kit.box({ w: 0.42, h: 0.01, d: 0.42 }).unlit().color(0x050505).at(at.x, at.y - 0.045, at.z);
    kit.use((k) => k.world.sounds.track(ventHum(ctx.audio, at)));
  });
}

/** The vaulted entrance tunnel. Daylight reaches the first few meters. */
function entrance(kit: LevelKit, ctx: SceneContext, phase: StoryPhase): void {
  const night = isNight(phase);
  kit.box({ w: 2.2, h: 2.5, d: 0.02 }).unlit().color(night ? 0x020303 : 0x8e908c).at(0, -0.1, 1.32);
  if (!night) kit.light({ color: 0x8a8e8c, intensity: 1.5, range: 7 }).at(0, 1.6, 0.4);
  kit.exit({ w: 1.8, d: 0.4, to: 'bunker_exterior', spawn: 'from_fort_door' }).at(0, 0, 1.05);
  graffiti(kit, [{ text: 'KEVIN 96', color: '#8a2420', size: 14, angle: -4 }, { text: 'NIRVANA', color: '#1e1e1a', size: 13, angle: 3 }]).at(-0.88, 0.5, -4.2).rotY(90);

  if (phase === 'day2' || phase === 'day3') {
    kit.box({ w: 0.26, h: 0.07, d: 0.1 }).texture('wood_planks', { tile: 0.3 }).color(0xa0906e).at(markers.bun2_wedge.x, 0, markers.bun2_wedge.z).rotY(35);
    kit.hotspot({ prompt: 'Look at the wedge', radius: 0.3, onInteract: () => ctx.say('Fresh cut. Spruce. Someone made this with a knife.') }).at(markers.bun2_wedge.x, 0, markers.bun2_wedge.z);
  }
}

/** Two steel doors 3 m apart. By day both stand open; on night 3 the inner one is shut. */
function gasLock(kit: LevelKit, ctx: SceneContext, phase: StoryPhase): void {
  steelLeaf(kit, -0.5, -8.3, 92);
  const innerShut = phase === 'night3' || phase === 'night2';
  const inner = steelLeaf(kit, -0.55, -11.3, innerShut ? 0 : 95, true);
  if (innerShut) {
    let open = false;
    let swing = 0;
    updates.push(movingBlocker(() => (open ? null : { kind: 'box', x: 0, z: -11.3, hw: 0.6, hd: 0.15, angle: 0 })));
    updates.push((dt) => {
      if (!open || swing >= 1) return;
      swing = Math.min(1, swing + dt / 1.6);
      inner.rotation.y = (95 * swing * Math.PI) / 180;
    });
    kit
      .hotspot({ prompt: 'Open the door', radius: 0.55, enabled: () => !open, onInteract: () => void (open = true) })
      .at(0, 0, -11.1);
  }
  stencil(kit, ['GASSCHLEUSE', 'SAS A GAZ']).at(0.88, 1.5, -9.8).rotY(-90);
  kit.hotspot({ prompt: 'Read the sign', radius: 0.4, onInteract: () => playNode(ctx, 'fort_gaslock_sign') }).at(0.6, 0, -9.8);
}

/** A steel door leaf hinged at (x, z), turned `yaw` degrees open. Returns its pivot to animate. */
function steelLeaf(kit: LevelKit, x: number, z: number, yaw: number, window = false): Group {
  const pivot = kit.group((g) => {
    g.box({ w: 1.05, h: 1.92, d: 0.08 }).texture('bunker_door', { tile: [1.05, 1.92] }).color(0x6c706a).at(0.53, 0, 0);
    if (window) {
      g.mesh(new CylinderGeometry(0.12, 0.12, 0.1, 10).rotateX(Math.PI / 2)).color(0x1c2222).at(0.53, 1.45, 0);
      g.mesh(new CylinderGeometry(0.15, 0.15, 0.09, 10).rotateX(Math.PI / 2)).color(0x2a2a28).at(0.53, 1.45, 0);
    }
  })
    .at(x, 0, z)
    .rotY(yaw);
  return pivot.object as Group;
}

function corridor(kit: LevelKit): void {
  ceilingRuns(kit, 0.25, -11.6, -40, 2.1);
  stencil(kit, ['WACHE', 'GARDE'], 0.9).at(-0.88, 1.55, -14.4).rotY(90);
  stencil(kit, ['MANNSCHAFT', 'TROUPE'], 0.9).at(0.88, 1.55, -29.9).rotY(-90);
  stencil(kit, ['<- AUSGANG', '<- SORTIE'], 0.9).at(-0.88, 1.55, -22).rotY(90);
  stencil(kit, ['KAMPFSTAND', 'CASEMATE'], 0.9).at(-0.88, 1.55, -38.6).rotY(90);
  graffiti(kit, [{ text: 'SANDRA', color: '#a04070', size: 15, angle: 6 }, { text: '666', color: '#1a1a18', size: 18 }]).at(0.88, 0.4, -19).rotY(-90);
  graffiti(kit, [{ text: 'ICI DORT', color: '#1a1a18', size: 14, angle: -3 }, { text: 'LE LOYON', color: '#1a1a18', size: 16, angle: -3 }]).at(-0.88, 0.5, -33.5).rotY(90);
  beerCans(kit, { x: 0, z: -24, w: 1.4, d: 22 }, 9, 'corridor-cans');
}

function guardRoom(kit: LevelKit, ctx: SceneContext, phase: StoryPhase): void {
  table(kit, -4.2, -17.45, 0, 1.4, 0.7);
  chair(kit, -4.3, -16.7, 180);
  chair(kit, -2.6, -14.2, 40, true);
  locker(kit, -2.1, -13.3, 180).collider();
  kit.box({ w: 0.26, h: 0.05, d: 0.34 }).color(0x5a5446).at(-4.5, 0.77, -17.5).rotY(-8);
  stubs(kit, { x: -4, z: -17.45, w: 1.2, d: 0.5 }, 0.77, 9, 'guard-desk');
  stubs(kit, { x: -4, z: -15, w: 4, d: 3.5 }, 0, 14, 'guard-floor');
  beerCans(kit, { x: -4, z: -15.4, w: 4.4, d: 4 }, 16, 'guard-cans');
  kit.hotspot({ prompt: 'Read the logbook', radius: 0.35, onInteract: () => playNode(ctx, 'fort_logbook') }).at(-4.5, 0, -17.4);

  // The field telephone in its leather case, the wire running into the wall.
  kit.box({ w: 0.16, h: 0.26, d: 0.24 }).color(0x4a3a2a).at(-6.42, 1.15, -15.2);
  kit.box({ w: 0.04, h: 0.04, d: 0.12 }).color(0x2a2a28).at(-6.32, 1.3, -15.04);
  kit.box({ w: 0.012, h: 0.012, d: 1.2 }).color(0x101010).at(-6.48, 1.42, -14.6);
  kit
    .hotspot({
      prompt: 'Look at the telephone',
      radius: 0.35,
      onInteract: async () => {
        const choice = await ctx.ask(dialogues.fort_phone);
        if (phase === 'night3' && choice === CRANK) fire('bun3_phone');
      },
    })
    .at(-6.2, 0, -15.2);

  valleyChart(kit).at(-4, 0.95, -13.02).rotY(180);
  kit.hotspot({ prompt: 'Look at the chart', radius: 0.45, onInteract: () => playNode(ctx, 'fort_chart') }).at(-4, 0, -13.3);
  stencil(kit, ['LATRINEN', 'LATRINES'], 0.8).at(-6.48, 1.6, -15.2).rotY(90);
}

/** The wall chart of the valley under yellowed plastic, fields of fire in red grease pencil. */
function valleyChart(kit: LevelKit) {
  return scrawl(kit, { w: 1.1, h: 0.8 }, [88, 64], (g) => {
    g.fillStyle = '#b8ac84';
    g.fillRect(0, 0, 88, 64);
    g.strokeStyle = '#7a7058';
    g.lineWidth = 1;
    [14, 24, 34, 46].forEach((r) => {
      g.beginPath();
      g.ellipse(30, 70, r * 1.6, r, 0, Math.PI, Math.PI * 2);
      g.stroke();
    });
    g.fillStyle = '#4a4436';
    [[54, 40], [58, 44], [61, 39], [56, 48], [64, 45]].forEach(([x, y]) => g.fillRect(x!, y!, 3, 3));
    g.fillRect(44, 20, 1, 6);
    g.fillRect(42, 22, 5, 1);
    g.strokeStyle = '#a02a20';
    [[20, 10, 0.2, 1.1], [20, 10, 0.9, 1.6]].forEach(([x, y, a, b]) => {
      g.beginPath();
      g.moveTo(x!, y!);
      g.arc(x!, y!, 52, a!, b!);
      g.closePath();
      g.stroke();
    });
    handText(g, 'A 3417', 4, 58, { size: 8, color: '#3a3428', font: 'monospace' });
  });
}

function latrines(kit: LevelKit, ctx: SceneContext, phase: StoryPhase): void {
  [-11.1, -10.1, -9.1, -8.1].forEach((x) => kit.box({ w: 0.04, h: 1.8, d: 1.2 }).texture('rust_metal', { tile: 0.8 }).color(0x6a6c66).at(x, 0, -17.4));
  [-10.6, -9.6, -8.6].forEach((x) => {
    kit.cylinder({ r: 0.2, h: 0.4, sides: 8 }).texture('rust_metal', { tile: 0.5 }).color(0x9a9a96).at(x, 0, -17.65).collider();
    kit.cylinder({ r: 0.15, h: 0.01, sides: 8 }).color(0x1a1c1a).at(x, 0.4, -17.65);
  });
  kit.box({ w: 2.6, h: 0.22, d: 0.42 }).texture('rust_metal', { tile: 0.6 }).color(0x8e908c).at(-9.3, 0.62, -13.23).collider();
  [-10.4, -8.2].forEach((x) => kit.box({ w: 0.05, h: 0.62, d: 0.05 }).color(0x5a5a56).at(x, 0, -13.25));
  // Polished steel instead of glass. By day the tent sheet behind the player shows in it as a blur.
  kit.box({ w: 0.7, h: 0.62, d: 0.02 }).texture('rust_metal', { tile: 2 }).color(0x6e7274).at(MIRROR.x, 1.1, MIRROR.z);
  if (!isNight(phase)) mirrorSmear(kit).at(MIRROR.x + 0.12, 1.12, MIRROR.z - 0.012).rotY(180);
  kit
    .hotspot({
      prompt: 'Look in the mirror',
      radius: 0.4,
      onInteract: () => {
        if (!isNight(phase)) fire('bun2_mirror');
        return playNode(ctx, 'fort_mirror');
      },
    })
    .at(MIRROR.x, 0, -13.5);

  kit.box({ w: 0.08, h: 0.05, d: 0.08 }).color(0x3a3a36).at(TENT_SHEET.x, 1.86, TENT_SHEET.z - 0.1);
  if (!isNight(phase)) {
    // Hung from one hook it is the height and width of a standing man.
    kit.box({ w: 0.62, h: 1.55, d: 0.05 }).texture('camo_cape', { tile: 0.8 }).color(0x6a6650).at(TENT_SHEET.x, 0.3, TENT_SHEET.z);
    kit.hotspot({ prompt: 'Look at the tent sheet', radius: 0.4, onInteract: () => playNode(ctx, 'fort_tentsheet') }).at(TENT_SHEET.x, 0, TENT_SHEET.z + 0.2);
  }
}

/** A tall dark smudge, soft at the edges, the height of a man in the scratched steel. */
function mirrorSmear(kit: LevelKit) {
  return scrawl(kit, { w: 0.26, h: 0.5 }, [16, 32], (g) => {
    const shade = g.createRadialGradient(8, 13, 1, 8, 15, 12);
    shade.addColorStop(0, 'rgba(18, 18, 16, 0.95)');
    shade.addColorStop(1, 'rgba(18, 18, 16, 0)');
    g.fillStyle = shade;
    g.fillRect(0, 0, 16, 32);
  });
}

function dormitory(kit: LevelKit, ctx: SceneContext, phase: StoryPhase): Kp3Door {
  kit.batch((still) => {
    [3, 4.8, 6.6, 8.4].forEach((x, i) => {
      bunkStack(still, x, -33, 0, `bunk-n${i}`);
      bunkStack(still, x, -29, 0, `bunk-s${i}`);
    });
    table(still, 10.2, -33.05, 0, 1.6, 0.7);
    bench(still, 10.2, -32.35, 0, 1.5);
    beerCans(still, { x: 6, z: -31, w: 8, d: 1.6 }, 10, 'dorm-cans');
  });
  kit.hotspot({ prompt: 'Look at the bunks', radius: 0.6, onInteract: () => playNode(ctx, 'fort_bunks') }).at(4.8, 0, -31.9);
  stencil(kit, ['GASMASKEN', 'MASQUES A GAZ'], 0.9).at(9.4, 1.6, -28.02).rotY(180);
  wires(kit, [[11.4, -28.04], [11.96, -28.04], [11.96, -30.5]], 1.9);

  // The dust is thick everywhere except a quarter circle in front of the cupboard.
  kit.mesh(new CircleGeometry(1, 8, Math.PI, Math.PI / 2).rotateX(-Math.PI / 2)).texture('concrete_floor', { tile: 1 }).color(0x5c5a54).at(11.5, 0.004, -31.5);
  // Tank controls can't look down at the dust, so the clue is also at eye level: scrapes on the end
  // wall where the cupboard rolls aside.
  [
    [0.52, 1.1, -32.05, 0.04],
    [0.58, 0.7, -31.95, -0.03],
    [0.93, 1.0, -32.1, 0.02],
    [1.01, 0.45, -31.85, -0.05],
    [1.86, 0.8, -32.0, 0.03],
  ].forEach(([y, d, z, tilt]) => {
    kit.box({ w: 0.01, h: 0.012, d: d! }).color(0x76736a).at(12 - 0.005, y!, z!).object.rotation.x = tilt!;
  });

  const kp3 = kp3Door(kit, ctx, phase);
  const aside = ctx.state.hasFlag('found_hidden_door') && !ctx.state.hasFlag('cupboard_restored');
  const cupboard = kit.group((g) => {
    g.box(CUPBOARD).texture('rust_metal', { tile: 0.8 }).color(0x5c6244).rotY(90);
    stencil(g, ['MATERIEL SANITAIRE', 'SANITATSMATERIAL'], 0.8).at(-0.26, 1.2, 0).rotY(-90);
  });
  cupboard.at(CUPBOARD.x, 0, aside ? CUPBOARD_ASIDE : CUPBOARD.z);
  let target = cupboard.object.position.z;
  updates.push((dt) => {
    const p = cupboard.object.position;
    p.z += Math.sign(target - p.z) * Math.min(Math.abs(target - p.z), dt * 0.55);
    kp3.revealed = p.z < CUPBOARD.z - 0.95;
  });
  updates.push(
    movingBlocker((): Shape => ({ kind: 'box', x: CUPBOARD.x, z: cupboard.object.position.z, hw: CUPBOARD.d / 2, hd: CUPBOARD.w / 2, angle: 0 })),
  );
  // One hotspot where the cupboard stands, one where it rolls to; only the one it is at works.
  const resting = (z: number) => () => cupboard.object.position.z === z && target === z;
  kit
    .hotspot({
      prompt: () => (ctx.state.hasFlag('looked_at_dust') ? 'Push the cupboard' : 'Look at the cupboard'),
      radius: 0.6,
      enabled: resting(CUPBOARD.z),
      onInteract: async () => {
        // Looking at the cupboard draws the eye down to the swept dust, which the camera can't see.
        if (!ctx.state.hasFlag('looked_at_dust')) {
          await playNode(ctx, 'fort_cupboard');
          return playNode(ctx, 'fort_dust');
        }
        target = CUPBOARD_ASIDE;
        if (ctx.state.hasFlag('found_hidden_door')) return;
        fire('bun2_cupboard_screech');
        await playNode(ctx, 'fort_cupboard_push');
      },
    })
    .at(CUPBOARD.x - 0.35, 0, CUPBOARD.z);
  kit
    .hotspot({
      prompt: 'Push the cupboard back',
      radius: 0.5,
      enabled: resting(CUPBOARD_ASIDE),
      onInteract: () => {
        target = CUPBOARD.z;
        ctx.state.setFlag('cupboard_restored');
      },
    })
    .at(CUPBOARD.x - 0.35, 0, CUPBOARD_ASIDE - 0.2);
  kit
    .hotspot({ prompt: 'Look at the floor', radius: 0.3, enabled: () => !ctx.state.hasFlag('looked_at_dust'), onInteract: () => playNode(ctx, 'fort_dust') })
    .at(10.95, 0, -31.05);

  kit.plane({ w: 0.16, d: 0.09 }).color(0x8a8a62).at(11.15, 0.006, -30.2).rotY(28);
  kit.hotspot({ prompt: 'Look at the wrapper', radius: 0.2, onInteract: () => playNode(ctx, 'fort_wrapper') }).at(11.15, 0, -30.2);
  return kp3;
}

export interface Kp3Door {
  /** True once the cupboard has rolled clear of it. */
  revealed: boolean;
  /** How the player knocked tonight. Marc is in once anyone has knocked. */
  readonly knock: 'none' | 'right' | 'wrong';
  /** How many times the player has knocked tonight. */
  readonly knocks: number;
  /** Marc's voice through the steel, the right knock's last beat. */
  voice(): void;
}

/**
 * The steel door stamped "K.P. 3" behind the cupboard, puzzles P4 and P6. Without the key the
 * player can try it and listen. With it: knock, or use the key. Three knocks, a wait, and one
 * more bring Marc's voice through the steel; any other knocking puts his light out.
 */
function kp3Door(kit: LevelKit, ctx: SceneContext, phase: StoryPhase): Kp3Door {
  // Once the player has been inside, the door stays open.
  let open = ctx.state.hasFlag('met_marc') || ctx.state.hasFlag('entered_hidden_room');
  let knock: Kp3Door['knock'] = ctx.state.hasFlag('knock_pattern_done') ? 'right' : 'none';
  const knocks: number[] = [];
  const marc = marcInThePassage(kit, ctx);

  const pivot = kit.group((g) => {
    g.box({ w: 0.06, h: 2, d: 0.9 }).texture('bunker_door', { tile: [0.9, 2] }).color(0x7a7c78).at(0, 0, 0.45);
    g.box({ w: 0.012, h: 0.1, d: 0.3 }).color(0x9a9890).at(-0.036, 1.5, 0.45);
    scrawl(g, { w: 0.28, h: 0.08 }, [42, 12], (c) => handText(c, 'K.P. 3', 3, 6, { size: 10, color: '#1c1c1a', font: 'bold monospace' }))
      .at(-0.044, 1.51, 0.45)
      .rotY(-90);
    g.box({ w: 0.02, h: 0.05, d: 0.03 }).color(0x0a0a0a).at(-0.035, 1, 0.78);
  });
  pivot.at(KP3.x, 0, KP3.hinge).rotY(open ? 80 : 0);
  updates.push(movingBlocker(() => (open ? null : { kind: 'box', x: KP3.x, z: KP3.z, hw: 0.2, hd: 0.5, angle: 0 })));

  const swingOpen = () => {
    open = true;
    marc.show();
    let swing = 0;
    updates.push((dt) => {
      if (swing >= 1) return;
      swing = Math.min(1, swing + dt / 2.2);
      pivot.object.rotation.y = (80 * swing * Math.PI) / 180;
    });
  };

  // Night 3: candlelight under the door from Marc's candle on the other side.
  const night3 = phase === 'night3';
  const candle = night3 && !open;
  const lineUnder = kit.box({ w: 0.02, h: 0.012, d: 0.84 }).unlit().color(0xffa850).at(KP3.x - 0.06, 0, KP3.z);
  lineUnder.object.visible = candle;
  const glow = kit.light({ color: 0xff9a48, intensity: candle ? 0.5 : 0, range: 1.8 }).at(KP3.x - 0.4, 0.1, KP3.z);
  const putOutCandle = () => {
    lineUnder.object.visible = false;
    if (glow.light) glow.light.intensity = 0;
  };

  const hasKey = () => ctx.state.hasItem('bunker_key');
  const usable = () => door.revealed && !open;

  kit
    .hotspot({
      prompt: () => (hasKey() ? 'Knock' : 'Listen at the door'),
      radius: 0.25,
      enabled: usable,
      onInteract: () => {
        if (!hasKey()) {
          fire('bun2_door_listen');
          return playNode(ctx, 'fort_hidden_door_listen');
        }
        knockOnSteel(ctx);
        knocks.push(ctx.time);
      },
    })
    .at(KP3.x - 0.3, 0, KP3.z - 0.12);
  kit
    .hotspot({
      prompt: () => (hasKey() ? 'Use the key' : 'Try the door'),
      radius: 0.2,
      enabled: usable,
      photo: 'photo_bunker_door',
      onInteract: async () => {
        if (!hasKey()) return playNode(ctx, 'fort_hidden_door_locked');
        if (knock === 'wrong') arriveAs('dark');
        else {
          await playNode(ctx, 'room_enter');
          arriveAs('empty');
        }
        ctx.goTo('bunker_hidden', 'from_dormitory');
      },
    })
    .at(KP3.x - 0.3, 0, KP3.z + 0.3)
    .leadsTo('bunker_hidden');

  // Knocks are judged once the player has stopped for a while.
  updates.push(() => {
    if (knock !== 'none' || !knocks.length || ctx.time - knocks[knocks.length - 1]! < 4) return;
    if (!isFriendlyKnock(knocks)) {
      knock = 'wrong';
      fire('bun3_knock_wrong');
      putOutCandle();
      return;
    }
    knock = 'right';
    ctx.state.setFlag('knock_pattern_done');
    fire('bun3_knock_right');
  });

  const voice = () => {
    const unsubscribe = ctx.state.events.on('flag', ({ flag }) => {
      if (flag === 'marc_named' && !open) swingOpen();
    });
    cleanups.push(unsubscribe);
    void playNode(ctx, 'marc_door_voice').then(() => {
      unsubscribe();
      putOutCandle();
      if (!open) swingOpen();
      marc.leave();
    });
  };

  kit
    .trigger({ w: 1, d: 1 })
    .at(13.3, 0, -31)
    .onEnter(() => {
      arriveAs('after');
      ctx.goTo('bunker_hidden', 'from_dormitory');
    });
  const door: Kp3Door = {
    revealed: false,
    get knock() {
      return knock;
    },
    get knocks() {
      return knocks.length;
    },
    voice,
  };
  return door;
}

/**
 * The right knock: Marc in the passage behind the door, well back, holding his candle low. He is
 * there when the door swings open, and the reporter turns to him, so a photo he allows has him in
 * it. When he has said goodbye he goes back into the dark.
 */
function marcInThePassage(kit: LevelKit, ctx: SceneContext) {
  const marc = kit.npc('marc').at(MARC_BACK.x, 0, MARC_BACK.z).faceYaw(markers.marc_door.yaw).holdCandle();
  marc.object.visible = false;
  return {
    show: () => {
      marc.object.visible = true;
      turnToMarc(ctx);
    },
    leave: () => {
      if (!marc.object.visible) return;
      marc.character.face(-90 * (Math.PI / 180));
      void marc.character.walkTo(MARC_BACK.x + 0.5, MARC_BACK.z).then(() => (marc.object.visible = false));
    },
  };
}

/**
 * The reporter steps back from the jamb, square to the doorway, and turns to Marc. From the
 * knocking spot beside the door the jamb hides the passage. The dialogue holds the player, so
 * the pose goes through `place`, which moves the camera with it.
 */
function turnToMarc(ctx: SceneContext): void {
  const p = ctx.player.position;
  const from = { x: p.x, z: p.z, yaw: MathUtils.radToDeg(ctx.player.yaw) };
  const to = { ...FACING_MARC, yaw: yawToward(MARC_BACK.x - FACING_MARC.x, MARC_BACK.z - FACING_MARC.z) };
  let t = 0;
  updates.push((dt) => {
    if (t >= 1) return;
    t = Math.min(1, t + dt / 1.4);
    const pose = easePose(from, to, t);
    ctx.player.place(pose.x, p.y, pose.z, pose.yaw);
  });
}

/** A fist on a steel door: a dull boom with a ring in it. */
function knockOnSteel(ctx: SceneContext): void {
  const output = ctx.audio.output({ bus: 'sfx', volume: 0.9, at: { x: KP3.x, y: 1.2, z: KP3.z }, refDistance: 2 });
  thump(ctx.audio, output.input, ctx.audio.now, 95, 0.9);
  noiseBurst(ctx.audio, output.input, { start: ctx.audio.now, duration: 0.25, type: 'bandpass', frequency: 420, q: 6, gain: 0.25 });
  setTimeout(() => output.release(0.3), 900);
}

/**
 * The most disturbing room in the game. Hundreds of masks in a waist-high heap where the
 * shelves gave way, eyepieces pointing everywhere; a row of them on hooks at head height along
 * the aisle; and at the far end one clean shelf: six laid out in a row, and a space for a seventh.
 */
function maskStore(kit: LevelKit, ctx: SceneContext, phase: StoryPhase): () => void {
  const poses: MaskPose[] = [
    ...heapPoses({ ...HEAP, count: 460, seed: 'mask-heap' }),
    ...[
      [9.6, -26.6, 20],
      [10.3, -25.4, 140],
      [8.9, -26.9, 260],
      [7.7, -26.6, 80],
      [5.2, -26.8, 200],
      [4.1, -26.2, 310],
      [10.9, -24.2, 30],
      [3.6, -24.0, 170],
    ].map(([x, z, yaw]) => floorMask(x!, z!, yaw!)),
    // Hung by their straps along the north wall, at the height of a face.
    ...[4.1, 4.75, 5.4, 6.05, 6.7, 7.35].map((x, i) => uprightMask(x, 1.58 - (i % 2) * 0.04, -27.27, 180, 0.12)),
    // The clean shelf: six, and a gap where a seventh was.
    ...[-26.55, -26.15, -25.75, -25.35, -24.55, -24.15].map((z) => uprightMask(3.22, 1.58, z, -90)),
  ];
  // A 130k-triangle heap: drawn only from the rooms that can see it, not through the walls.
  updates.push(onlyNear(maskPile(kit, poses, 'mask-store').object, 'masks'));
  [4.1, 4.75, 5.4, 6.05, 6.7, 7.35].forEach((x) => kit.box({ w: 0.03, h: 0.03, d: 0.06 }).color(0x2a2a26).at(x, 1.74, -27.37));

  // A heap mound under the masks, so no floor shows through, and a barrier round its core.
  kit.mesh(heapMound()).texture('concrete_floor', { tile: 1 }).color(0x3e3830).at(HEAP.x, 0, HEAP.z);
  kit.barrier({ w: HEAP.rx * 1.6, d: HEAP.rz * 1.5 }).at(HEAP.x, 0, HEAP.z + 0.2);

  // Shelves: standing on the north wall past the hooks, collapsed into the heap on the south.
  shelfUnit(kit, 8.9, -27.15, 0, 2.2);
  [5, 6.6, 8.2].forEach((x, i) => {
    const board = kit.box({ w: 1.6, h: 0.03, d: 0.45 }).texture('rust_metal', { tile: 0.8 }).color(0x5a5c56).at(x, 0.5 + i * 0.15, -23.75);
    board.object.rotation.set(0.5 - i * 0.2, 0, 0.35 - i * 0.3);
  });
  kit.box({ w: 0.05, h: 1.9, d: 0.05 }).texture('rust_metal').color(0x5a5c56).at(9.7, 0, -23.65);
  shelfUnit(kit, 3.22, -25.35, -90, 2.6);

  kit.hotspot({ prompt: 'Look at the masks', radius: 1.6, onInteract: () => playNode(ctx, 'fort_masks') }).at(HEAP.x + 1.2, 0, HEAP.z - 0.6);
  kit
    .hotspot({
      prompt: 'Look at the shelf',
      radius: 0.6,
      onInteract: () => {
        if (phase === 'night3') fire('bun3_masks');
        return playNode(ctx, 'fort_masks_look');
      },
    })
    .at(3.5, 0, -25.35);
  stencil(kit, ['MASCHINEN', 'MACHINES'], 0.8).at(9.2, 1.6, -23.42).rotY(180);
  wires(kit, [[11.46, -23.4], [11.46, -27.4]], 1.9);
  if (phase === 'day2') turnToLeave(ctx);
  return slidingMask(kit, ctx);
}

/** Shows `object` only while the player is in `room` or one opening away from it. */
function onlyNear(object: Object3D, room: string): (dt: number, ctx: SceneContext) => void {
  const near = [room, ...neighbors(openings, room)];
  return (_, ctx) => {
    // In a doorway the player is in no room; keep what the last room showed.
    const here = roomAt(rooms, ctx.player.position.x, ctx.player.position.z);
    if (here) object.visible = near.includes(here.id);
  };
}

/** Seconds in the mask store before turning to the door sets off bun2_masks. */
const MASKS_LINGER = 8;

/** bun2_masks fires when the player has stood among the masks a while and turns to go. */
function turnToLeave(ctx: SceneContext): void {
  const door = new Vector3(markers.bun2_masks_slide_to.x + 1.9, 1.2, -27.4);
  const view = new Vector3();
  let inside = 0;
  updates.push((dt) => {
    const p = ctx.player.position;
    const room = rooms.find((r) => r.id === 'masks')!;
    inside = p.x > room.x0 && p.x < room.x1 && p.z > room.z0 && p.z < room.z1 ? inside + dt : 0;
    if (inside < MASKS_LINGER || ctx.paused) return;
    ctx.player.camera.getWorldDirection(view);
    if (viewAngle({ eye: ctx.player.camera.position, view }, door) < 25) fire('bun2_masks');
  });
}

/**
 * The mask on top of the heap that slides off behind the player, landing face up with its
 * eyepieces to the ceiling. Returns what starts the slide.
 */
function slidingMask(kit: LevelKit, ctx: SceneContext): () => void {
  const { bun2_masks_slide_from: from, bun2_masks_slide_to: to } = markers;
  const mask = maskPile(kit, [{ position: new Vector3(), rotation: new Euler(-0.4, 0.6, 0.2, 'YXZ') }], 'mask-slide').at(from.x, from.y ?? 0.85, from.z);
  const start = mask.object.position.clone();
  const end = new Vector3(to.x, 0.07, to.z);
  if (isSpent(ctx.state, 'bun2_masks')) {
    mask.object.position.copy(end);
    mask.object.rotation.set(-Math.PI / 2, 0.9, 0, 'YXZ');
  }
  let t = -1;
  updates.push((dt) => {
    if (t < 0 || t >= 1) return;
    t = Math.min(1, t + dt / 0.7);
    mask.object.position.lerpVectors(start, end, t);
    mask.object.position.y += Math.sin(t * Math.PI) * 0.1;
    mask.object.rotation.set(-0.4 - (Math.PI / 2 - 0.4) * t, 0.6 + 0.3 * t, 0.2 * (1 - t), 'YXZ');
  });
  return () => {
    t = 0;
    maskSlide(ctx.audio, { x: from.x, y: 0.6, z: from.z });
  };
}

/** Bare steel uprights and four boards, against a wall, facing along `yaw`. */
function shelfUnit(kit: LevelKit, x: number, z: number, yaw: number, width: number): void {
  kit
    .group((g) => {
      [-width / 2, width / 2].forEach((dx) => [-0.2, 0.2].forEach((dz) => g.box({ w: 0.04, h: 2, d: 0.04 }).texture('rust_metal').color(0x5a5c56).at(dx, 0, dz)));
      [0.25, 0.85, 1.42, 1.95].forEach((y) => g.box({ w: width, h: 0.03, d: 0.44 }).texture('rust_metal', { tile: 0.8 }).color(0x5e605a).at(0, y, 0));
      g.barrier({ w: width, d: 0.44 });
    })
    .at(x, 0, z)
    .rotY(yaw);
}

/** A low dome for the heap, a little under its surface. */
function heapMound() {
  return new SphereGeometry(1, 12, 5, 0, Math.PI * 2, 0, Math.PI / 2).scale(HEAP.rx * 0.95, HEAP.height * 0.72, HEAP.rz * 0.95);
}

function machineRoom(kit: LevelKit, ctx: SceneContext, phase: StoryPhase, kp3: Kp3Door): void {
  kit.box({ w: 2.6, h: 1.3, d: 1.1 }).texture('rust_metal', { tile: 0.9 }).color(0x7a3a2e).at(6.2, 0, -20.2).collider();
  kit.box({ w: 0.9, h: 0.5, d: 0.9 }).texture('rust_metal', { tile: 0.9 }).color(0x6a3228).at(5.3, 1.3, -20.2);
  kit.cylinder({ r: 0.09, h: 0.8, sides: 6 }).texture('rust_metal').color(0x3e3a36).at(5.3, 1.8, -20.2);
  [4, 4.68, 5.36, 6.04, 6.72].forEach((x, i) =>
    kit.cylinder({ r: 0.29, h: 0.88, sides: 9 }).texture('rust_metal', { tile: 0.9 }).color(i % 2 ? 0x4a4a3a : 0x5a4a3a).at(x, 0, -17.25).collider(),
  );
  kit
    .hotspot({
      prompt: 'Tap a fuel drum',
      radius: 0.5,
      onInteract: async () => {
        drumBoom(ctx.audio, { x: 5.36, y: 0.6, z: -17.25 });
        await playNode(ctx, 'fort_generator');
        if (phase === 'night3' && !ctx.state.hasFlag('met_marc')) fire(kp3.knock === 'none' ? 'bun3_drum_silence' : 'bun3_drum_answer');
      },
    })
    .at(5.36, 0, -17.6);

  // The control board of dead dials.
  kit.box({ w: 1.6, h: 1.25, d: 0.22 }).texture('rust_metal', { tile: 0.8 }).color(0x3e403c).at(8.9, 0.5, -22.66).collider();
  [8.4, 8.9, 9.4].forEach((x) =>
    [1.2, 1.5].forEach((y) => kit.mesh(new CylinderGeometry(0.07, 0.07, 0.03, 8).rotateX(Math.PI / 2)).color(0xb8b4a8).at(x, y, -22.54)),
  );

  // The workbench, and the car battery: newer than anything else here.
  kit.box({ w: 0.6, h: 0.88, d: 2 }).texture('wood_planks', { tile: 1 }).color(0x5a4e40).at(11.15, 0, -19.6).collider();
  kit.box({ w: 0.2, h: 0.18, d: 0.3 }).color(0x161616).at(11.2, 0.88, -20.25);
  kit.box({ w: 0.03, h: 0.03, d: 0.03 }).color(0x8a1a14).at(11.16, 1.06, -20.34);
  kit.box({ w: 0.03, h: 0.03, d: 0.03 }).color(0x1a1a1a).at(11.16, 1.06, -20.16);
  [[10.95, -19.2], [11.25, -18.9], [11.0, -19.8]].forEach(([x, z], i) => kit.box({ w: 0.3, h: 0.04, d: 0.06 }).color(0x4a4a46).at(x!, 0.88, z!).rotY(i * 40));
  wires(kit, [[11.46, -20.25], [11.46, -22.78]], 1.9);
  kit.box({ w: 0.02, h: 0.95, d: 0.012 }).color(0x141414).at(11.46, 0.95, -20.25);
  kit
    .hotspot({
      prompt: 'Look at the battery',
      radius: 0.3,
      onInteract: () => playNode(ctx, ctx.state.hasFlag('found_hidden_door') ? 'fort_battery_after' : 'fort_battery'),
    })
    .at(BATTERY.x, 0, BATTERY.z);
}

/** The fighting room: an empty gun mount and the embrasure, a strip of grey fog. */
function casemate(kit: LevelKit, ctx: SceneContext, phase: StoryPhase): void {
  const z = -46 - 0.15;
  const slit = { y0: 1.25, y1: 1.5, w: 1.4 };
  const wallBox = (x: number, w: number, y: number, h: number) =>
    kit.box({ w, h, d: 0.3, cell: 0.6 }).texture('concrete_bunker', { tile: 1.6 }).color(y < 1.45 ? 0x7a876f : 0xaeada2).at(x, y, z);
  wallBox(0, 6.6, 0, slit.y0).collider();
  wallBox(0, 6.6, slit.y1, 2.4 - slit.y1);
  wallBox(-(3.3 + slit.w / 2) / 2, 3.3 - slit.w / 2, slit.y0, slit.y1 - slit.y0);
  wallBox((3.3 + slit.w / 2) / 2, 3.3 - slit.w / 2, slit.y0, slit.y1 - slit.y0);
  const outside = isNight(phase) ? 0x020303 : 0x8a8c88;
  kit.box({ w: 2, h: 0.6, d: 0.02 }).unlit().color(outside).at(0, 1.1, -46.4);
  if (phase === 'night3') kit.box({ w: 0.02, h: 0.02, d: 0.01 }).unlit().color(0xc01808).at(0.35, 1.33, -46.38);
  else if (!isNight(phase)) kit.light({ color: 0x7e8280, intensity: 0.6, range: 3.2 }).at(0, 1.4, -45.6);
  const shutter = kit.box({ w: 1.5, h: 0.5, d: 0.04 }).texture('rust_metal', { tile: 0.6 }).color(0x4e4c48).at(0, 1.5, -46.36);
  shutter.object.rotation.x = 0.25;

  kit.cylinder({ r: 0.16, h: 0.95, sides: 8 }).texture('rust_metal').color(0x4a4c46).at(0, 0, -44.6).collider();
  kit.box({ w: 0.5, h: 0.12, d: 0.7 }).texture('rust_metal').color(0x3e403a).at(0, 0.95, -44.7);
  [[-2.2, -45.2], [-2.3, -44.6], [2.1, -41.5]].forEach(([x, bz], i) => kit.box({ w: 0.45, h: 0.28, d: 0.3 }).texture('rust_metal').color(0x4e5640).at(x!, 0, bz!).rotY(i * 15).collider());
  beerCans(kit, { x: 0, z: -42.5, w: 4.5, d: 2.5 }, 6, 'casemate-cans');
  kit
    .hotspot({ prompt: 'Look out of the slit', radius: 0.6, onInteract: () => playNode(ctx, phase === 'night3' ? 'fort_embrasure_night3' : 'fort_embrasure') })
    .at(0, 0, -45.7);
}

export const scenes = [bunkerInteriorScene];
