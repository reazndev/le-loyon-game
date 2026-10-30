import { Color, Group, Mesh, PlaneGeometry, type BufferGeometry } from 'three';
import { createPs1Material } from '../render/ps1Material';
import type { TextureLibrary } from '../render/textures';
import { MASK_PICTURE, maskTexture, partMaterial, ropeTexture } from './materials';
import type { CharacterModel, Look } from './model';
import { loyonPose, type PoseInput } from './poses';
import { block, lathe, projectFront, shadeDown, taperedBox, tube, type Point, type Ring } from './shapes';

const SIDES = 16;
/** A lathe arc that goes all the way round, so it has no caps: for sleeves of cloth whose ends are hidden. */
const AROUND = (sides: number): [number, number] => [0.5 / sides, 1 + 0.5 / sides];

/**
 * The tent sheet from the hem up to the neck. It hangs from a body: the shoulders are its widest
 * point, it falls slack over the chest, closes in at the waist, and opens a little to the hem in
 * long folds that deepen as they fall.
 */
const CAPE: Ring[] = [
  { y: 0.08, rx: 0.235, rz: 0.19, z: 0.02, ripple: 0.034 },
  { y: 0.5, rx: 0.222, rz: 0.17, z: 0.01, ripple: 0.03 },
  { y: 0.95, rx: 0.205, rz: 0.15, ripple: 0.022 },
  { y: 1.2, rx: 0.232, rz: 0.15, front: 0.025, ripple: 0.014 },
  { y: 1.41, rx: 0.272, rz: 0.14, ripple: 0.006 },
  { y: 1.47, rx: 0.25, rz: 0.125 },
  { y: 1.52, rx: 0.17, rz: 0.11 },
  { y: 1.57, rx: 0.095, rz: 0.09, z: 0.01 },
];
const NECK_Y = 1.56;
/** A second, shorter layer over the shoulders, an old shelter half cut down, frayed at its hem. */
const CAPELET: Ring[] = [
  { y: 1.16, rx: 0.265, rz: 0.18, ripple: 0.018 },
  { y: 1.34, rx: 0.288, rz: 0.162, ripple: 0.01 },
  { y: 1.49, rx: 0.262, rz: 0.14 },
  { y: 1.585, rx: 0.105, rz: 0.1, z: 0.01 },
];
/** Wool wound round the neck, filling the gap between the hood and the chin of the mask. */
const SCARF: Ring[] = [
  { y: 1.46, rx: 0.13, rz: 0.12, ripple: 0.008 },
  { y: 1.53, rx: 0.12, rz: 0.118, front: 0.015 },
  { y: 1.585, rx: 0.095, rz: 0.1, z: -0.01 },
];

/** The hood around the head, relative to the neck. It reaches past the mask, so the mask sits inside it. */
const HOOD_SIDES: Ring[] = [
  { y: -0.08, rx: 0.19, rz: 0.17, z: 0.0 },
  { y: 0.06, rx: 0.15, rz: 0.165, z: -0.025 },
  { y: 0.21, rx: 0.145, rz: 0.165, z: -0.03 },
];
/** Above the face it closes and comes forward over the brow, so the mask sits in its shadow. */
const HOOD_TOP: Ring[] = [
  { y: 0.21, rx: 0.145, rz: 0.165, z: -0.03, front: 0.03 },
  { y: 0.3, rx: 0.12, rz: 0.145, z: -0.01, front: 0.025 },
  { y: 0.37, rx: 0.05, rz: 0.08, z: 0.04 },
];
/** The rubber face piece, relative to the neck: full over the cheeks, pushed out at the snout, rounded over the brow. */
const MASK: Ring[] = [
  { y: -0.02, rx: 0.05, rz: 0.06, z: -0.06, front: 0.02 },
  { y: 0.03, rx: 0.078, rz: 0.088, z: -0.05, front: 0.03 },
  { y: 0.09, rx: 0.09, rz: 0.1, z: -0.045, front: 0.018 },
  { y: 0.15, rx: 0.095, rz: 0.1, z: -0.04 },
  { y: 0.2, rx: 0.093, rz: 0.098, z: -0.038 },
  { y: 0.25, rx: 0.08, rz: 0.088, z: -0.035 },
  { y: 0.29, rx: 0.052, rz: 0.066, z: -0.03 },
];
const MASK_BOTTOM = MASK[0]!.y;
/** Where the mask picture lands on the face piece. */
const MASK_BOX = { x0: -MASK_PICTURE.w / 2, x1: MASK_PICTURE.w / 2, y0: MASK_BOTTOM, y1: MASK_BOTTOM + MASK_PICTURE.h };
/** Lens centers relative to the neck, on the face piece where the picture has their seats. */
const LENS_AT = [-1, 1].map((side) => ({ side, x: side * MASK_PICTURE.lens.x, y: MASK_BOTTOM + MASK_PICTURE.lens.y, z: -0.124 }));
/** The centers of the two lenses, relative to the neck, just in front of the glass. */
const LENSES = LENS_AT.map(({ x, y }) => ({ x, y, z: -0.155 }));
/** A cold, dim green, so lit lenses read as something behind the glass and not as lamps. */
const LENS_GLOW = new Color(0x9aa884);
/** The filter screws onto the snout and hangs forward and down. */
const FILTER = { y: MASK_BOTTOM + MASK_PICTURE.filter.y, z: -0.15, tilt: 0.5 };

/** The hand: out of the fold below the chest, a little to his left, held out in front. */
const HAND = { x: -0.06, y: 1.08, z: -0.27 };

/**
 * A coil of rope worn across the body, over his left shoulder and under the right arm, front
 * and back. Two turns of it lie side by side.
 */
const SLING: Point[] = [
  [-0.2, 1.535, -0.02],
  [-0.17, 1.49, -0.13],
  [-0.09, 1.38, -0.19],
  [0.02, 1.24, -0.205],
  [0.12, 1.1, -0.17],
  [0.2, 0.99, -0.07],
  [0.225, 0.98, 0.05],
  [0.15, 1.08, 0.14],
  [0.0, 1.27, 0.2],
  [-0.14, 1.45, 0.16],
  [-0.2, 1.535, -0.02],
];
/** The rope belt: round the waist from the knot at the front and back to it. */
const BELT = { y: 0.985, rx: 0.228, rz: 0.17, knot: 0.05 };
/** The loose end below the knot, frayed where it was cut. */
const TAIL: Point[] = [
  [0.055, 0.975, -0.185],
  [0.066, 0.89, -0.195],
  [0.073, 0.79, -0.195],
  [0.07, 0.7, -0.19],
  [0.066, 0.645, -0.188],
];
/** Spare rope hung in loops from the belt at his right hip. */
const COIL = { x: 0.24, top: 0.985, drop: 0.32, width: 0.085, loops: 3, perLoop: 6, spread: 0.014 };
const ROPE_RADIUS = 0.012;
/** Radians the rope's section turns per point, so its facets wind like strands. */
const ROPE_TWIST = 0.9;

/**
 * Le Loyon: a tall shape in a camo cape that falls from a hood to the ankles, a shorter frayed
 * layer over the shoulders, and the gas mask deep in the hood. He carries a coil of rope across
 * his body and another at the belt. One hand in a fingerless glove comes out of the cape below
 * the chest, where a level can put a candle (`hand`). The mask never comes off.
 */
export function buildLoyon(textures: TextureLibrary): CharacterModel {
  const camo = partMaterial({ color: 0x524e45, map: textures.get('camo_cape'), tile: 0.7 });
  // The cape fades into shadow toward the hem, so a light at the hand shows only the top of him.
  camo.vertexColors = true;
  const hood = partMaterial({ color: 0x524e45, map: textures.get('camo_cape'), tile: 0.7 });
  const capelet = partMaterial({ color: 0x48453c, map: textures.get('camo_cape'), tile: 0.6 });
  const wool = partMaterial({ color: 0x2e2b26 });
  const shadow = partMaterial({ color: 0x0a0907 });
  const skin = partMaterial({ color: 0x7e6e5e });
  const glove = partMaterial({ color: 0x34312b });
  const boots = partMaterial({ color: 0x1b1a16 });
  const soles = partMaterial({ color: 0x0e0d0b });
  const trousers = partMaterial({ color: 0x25251f });
  const mask = partMaterial({ color: 0xc4b89c, map: maskTexture(), tile: 1 });
  const rubber = partMaterial({ color: 0x2b2823 });
  const metal = partMaterial({ color: 0x75736a });
  const filter = partMaterial({ color: 0x55584a });
  const glass = partMaterial({ color: 0x182019 });
  const rope = partMaterial({ color: 0x66593f, map: ropeTexture(), tile: 0.05 });

  const root = new Group();
  const body = new Group();
  root.add(body);
  body.add(new Mesh(shadeDown(fray(lathe(CAPE, SIDES), CAPE[0]!.y, 0.1, SIDES), 0.3, 1.6, 0.05), camo));
  body.add(new Mesh(fray(lathe(CAPELET, SIDES, AROUND(SIDES)), CAPELET[0]!.y, 0.06, SIDES), capelet));
  body.add(new Mesh(lathe(SCARF, 12, AROUND(12)), wool));
  addRope(body, rope);

  const head = new Group();
  head.position.set(0, NECK_Y, 0);
  body.add(head);
  head.add(new Mesh(lathe(HOOD_SIDES, SIDES, [3.5 / 32, 28.5 / 32]), hood));
  head.add(new Mesh(lathe(HOOD_TOP, SIDES), hood));
  // The dark inside of the hood, behind and around the mask, and the head the straps run over.
  head.add(new Mesh(lathe([{ y: -0.05, rx: 0.12, rz: 0.115, z: 0.01 }, { y: 0.25, rx: 0.115, rz: 0.115, z: 0.01 }], 8), shadow));
  head.add(new Mesh(projectFront(lathe(MASK, 18, [-0.22, 0.22]), MASK_BOX), mask));
  // Straps from the eyelets at the temples and the brow, back over the head.
  const straps: Point[][] = [
    [[0, 0.27, -0.11], [0, 0.315, -0.065], [0, 0.335, 0.0], [0, 0.31, 0.075], [0, 0.25, 0.12]],
    ...[-1, 1].map((s): Point[] => [[s * 0.086, 0.195, -0.08], [s * 0.118, 0.205, -0.02], [s * 0.112, 0.215, 0.07]]),
  ];
  straps.forEach((path) => head.add(new Mesh(tube(path, 0.007, 4), rubber)));

  // Each lens is a metal rim round a disc of dark glass, turned a little outward like the eyes behind it.
  LENS_AT.forEach(({ side, x, y, z }) => {
    const seat = (geometry: BufferGeometry) => geometry.rotateX(-Math.PI / 2).rotateY(-side * 0.3).translate(x, y, z);
    const rim = [
      { y: 0, rx: 0.034, rz: 0.034 },
      { y: 0.02, rx: 0.034, rz: 0.034 },
      { y: 0.02, rx: 0.026, rz: 0.026 },
    ];
    head.add(new Mesh(seat(lathe(rim, 8, AROUND(8))), metal));
    head.add(new Mesh(seat(lathe([{ y: 0, rx: 0.027, rz: 0.027 }, { y: 0.023, rx: 0.027, rz: 0.027 }], 8)), glass));
  });
  // The filter canister: a neck into the snout, a ribbed collar, then the drum, open at the end.
  const canister = [
    { y: 0, rx: 0.03, rz: 0.03 },
    { y: 0.03, rx: 0.03, rz: 0.03 },
    { y: 0.03, rx: 0.047, rz: 0.047 },
    { y: 0.1, rx: 0.044, rz: 0.044 },
    { y: 0.1, rx: 0.028, rz: 0.028 },
  ];
  head.add(new Mesh(lathe(canister, 8).rotateX(-Math.PI / 2 - FILTER.tilt).translate(0, FILTER.y, FILTER.z), filter));

  // A halo over each lens. Halos are dimmed only partly by fog, so lit eyes show past where the mask is lost.
  const lensGlow = createPs1Material({ glow: true, billboard: true, map: textures.get('glow'), color: 0x000000 });
  const lenses = LENSES.map(({ x, y, z }) => {
    const lens = new Mesh(new PlaneGeometry(0.13, 0.13), lensGlow);
    lens.position.set(x, y, z);
    lens.visible = false;
    head.add(lens);
    return lens;
  });

  // The forearm comes out of the cape's front fold and bends up to the hand.
  body.add(new Mesh(taperedBox({ w: 0.09, d: 0.1 }, { w: 0.075, d: 0.085 }, 0, -0.2).rotateX(-1.35).translate(HAND.x, HAND.y - 0.01, HAND.z + 0.1), hood));
  // A fist in a fingerless wool glove: the knuckles and thumb are bare.
  body.add(new Mesh(block(0.074, 0.077, HAND.y - 0.045, HAND.y + 0.012, HAND.z), glove));
  body.add(new Mesh(block(0.068, 0.07, HAND.y + 0.012, HAND.y + 0.03, HAND.z - 0.003), skin));
  body.add(new Mesh(block(0.026, 0.045, HAND.y + 0.03, HAND.y + 0.048, HAND.z - 0.005).translate(0.02, 0, 0), skin));
  const hand = new Group();
  hand.position.set(HAND.x, HAND.y + 0.03, HAND.z);
  body.add(hand);

  // Heavy army boots with thick soles, and the trouser legs above them, seen through the torn hem.
  const feet = [-1, 1].map((side) => {
    const foot = new Group();
    foot.position.x = side * 0.11;
    foot.add(new Mesh(block(0.13, 0.31, 0, 0.03, -0.045), soles));
    foot.add(new Mesh(taperedBox({ w: 0.105, d: 0.15, z: 0 }, { w: 0.122, d: 0.28, z: -0.045 }, 0.17, 0.03), boots));
    foot.add(new Mesh(taperedBox({ w: 0.12, d: 0.13 }, { w: 0.13, d: 0.15 }, 0.5, 0.17), trousers));
    root.add(foot);
    return foot;
  }) as [Group, Group];

  return {
    root,
    eyeHeight: 1.76,
    stride: 1.05,
    // About half a normal walk: slow enough that it looks wrong.
    walkSpeed: 0.62,
    neckLimit: 0.3,
    hand,
    eyes: (amount) => {
      lensGlow.uniforms.uColor.value.copy(LENS_GLOW).multiplyScalar(amount);
      lenses.forEach((lens) => (lens.visible = amount > 0.01));
      glass.uniforms.uEmissive.value.copy(LENS_GLOW).multiplyScalar(amount * 0.8);
    },
    pose: (input: PoseInput, look: Look) => {
      const pose = loyonPose(input);
      body.position.y = pose.bodyY;
      // Breathing lifts and fills the chest so slightly that it only shows when nothing else moves.
      body.scale.set(1 + 0.008 * pose.breath, 1 + 0.003 * pose.breath, 1 + 0.012 * pose.breath);
      // Positive pitch leans forward; a positive X turn would tip him back.
      body.rotation.set(-pose.pitch, 0, pose.roll);
      head.rotation.set(look.pitch + 0.015 * pose.breath, look.yaw, pose.headRoll, 'YXZ');
      feet[0].position.set(feet[0].position.x, pose.footL.lift, pose.footL.z);
      feet[1].position.set(feet[1].position.x, pose.footR.lift, pose.footR.z);
    },
  };
}

/**
 * Tears a hem: each corner of the bottom ring rises by an amount picked from its column, so the
 * edge goes ragged. Shared corners pick the same amount and stay joined.
 */
function fray(geometry: BufferGeometry, hemY: number, depth: number, sides: number): BufferGeometry {
  const position = geometry.getAttribute('position');
  for (let i = 0; i < position.count; i++) {
    if (Math.abs(position.getY(i) - hemY) > 0.001) continue;
    const column = Math.round((Math.atan2(position.getX(i), -position.getZ(i)) / (Math.PI * 2)) * sides * 2);
    const tear = Math.abs(Math.sin(column * 12.9898) * 43758.5453) % 1;
    position.setY(i, hemY + depth * tear * tear);
  }
  geometry.computeVertexNormals();
  return geometry;
}

/** The rope: two turns across the body, the belt with its knot and frayed end, and the coil at the hip. */
function addRope(body: Group, material: ReturnType<typeof partMaterial>): void {
  const strand = (path: Point[], radius = ROPE_RADIUS) => body.add(new Mesh(tube(path, radius, 4, ROPE_TWIST), material));
  strand(SLING);
  // The second turn lies beside the first, a little further out from the body.
  strand(SLING.map(([x, y, z]) => [x * 1.07, y - 0.012, z * 1.08]));

  const start = Math.asin(BELT.knot / BELT.rx);
  const beltPoints = 10;
  strand(
    Array.from({ length: beltPoints + 1 }, (_, i): Point => {
      const a = start + (i / beltPoints) * Math.PI * 2;
      return [Math.sin(a) * BELT.rx, BELT.y, -Math.cos(a) * BELT.rz - 0.01];
    }),
  );
  const [kx, ky, kz] = [BELT.knot, BELT.y, -BELT.rz - 0.012];
  strand([[kx - 0.016, ky + 0.008, kz], [kx, ky + 0.02, kz - 0.014], [kx + 0.016, ky, kz - 0.01], [kx, ky - 0.018, kz - 0.006], [kx - 0.012, ky - 0.004, kz]], 0.013);
  strand(TAIL);
  const end = TAIL.at(-1)!;
  const frays: [number, number][] = [[-0.012, -0.004], [0.004, -0.012], [0.013, 0.006]];
  frays.forEach(([dx, dz]) => strand([end, [end[0] + dx * 0.5, end[1] - 0.03, end[2] + dz * 0.5], [end[0] + dx, end[1] - 0.06, end[2] + dz]], 0.004));

  const steps = COIL.loops * COIL.perLoop;
  strand(
    Array.from({ length: steps + 1 }, (_, i): Point => {
      const a = (i / COIL.perLoop) * Math.PI * 2;
      return [COIL.x + (COIL.spread * i) / COIL.perLoop, COIL.top - (COIL.drop * (1 - Math.cos(a))) / 2, COIL.width * Math.sin(a)];
    }),
  );
}
