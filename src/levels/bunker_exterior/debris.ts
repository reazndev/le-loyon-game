import { CylinderGeometry, TorusGeometry } from 'three';
import { crows, drips, nowAndThen, sway, weather, type Perch } from '../../game/ambient';
import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { cairn, fallenBranches, rottenStump, wireFence, type Spot } from '../forest_path/props';
import { scrawl } from '../forest_path/scrawl';
import { beside, distanceToTrails, type Trail } from '../forest_path/trail';
import type { Height } from '../forest_path/woods';
import { tarpFlap } from './sounds';
import { tarpGeometry, type Heap } from './tarp';

/**
 * What the army left round the fort and what somebody has added since: rusted sheets, a broken
 * ammunition crate, a coil of wire, concrete blocks, a jerrycan, a tarp over a heap,
 * and a stack of firewood against the wall, cut this autumn.
 */

const RUST = 0x5e544a;
const CONCRETE = 0x8a8a82;

const TARP: Spot & { yaw: number } = { x: -7.4, z: 3.6, yaw: 30 };
const HEAP: Heap = { w: 1.3, d: 0.8, h: 0.62, skirt: 0.3 };
/** The old wire along the west side of the approach, its last post down by the fallen log. */
const FENCE: Trail = [
  [-4.5, 18],
  [-5, 14.5],
  [-5.6, 11],
];

/** Stumps, dead wood, and a cairn at the edges of the approach and the track. */
function trailside(approach: Trail, track: Trail) {
  return {
    stumps: [
      { ...beside(approach, 6, 1.9), size: 1 },
      { ...beside(track, 15, -1.8), size: 0.9 },
    ],
    branches: [
      { ...beside(approach, 14, -1.8), yaw: 60 },
      { ...beside(track, 8, 1.8), yaw: -10 },
    ],
    // Where the track leaves the clearing, the same cairn as on the way up to the larch.
    cairn: beside(track, 3, -1.5),
  };
}

/** Where undergrowth would bury the props: tall plants off the fence, any plant off the small things. */
export function keepClear(approach: Trail, track: Trail) {
  const { stumps, branches, cairn: marker } = trailside(approach, track);
  return {
    tall: (x: number, z: number): boolean => distanceToTrails([FENCE], x, z) < 1.3,
    low: (x: number, z: number): boolean => [...stumps, ...branches, marker].some((p) => Math.hypot(x - p.x, z - p.z) < 1),
  };
}

export interface Clearing {
  height: Height;
  /** Ground level at the fort's front, which the roof and the doorstep are built from. */
  floor: number;
  approach: Trail;
  track: Trail;
}

/**
 * Dresses the clearing. Crows sit on the roof ridge, the woodpile, and the tarp by day; on wet
 * nights the eaves drip in front of the door, and the tarp's loose corner slaps in the wind.
 */
export function dressClearing(kit: LevelKit, ctx: SceneContext, clearing: Clearing): void {
  const { height } = clearing;
  const { stumps, branches, cairn: marker } = trailside(clearing.approach, clearing.track);
  const perches = kit.batch((still) => {
    const pile = firewood(still, { x: -5.55, z: -3 });
    jerrycan(still, { x: -5.9, z: -0.7 }, 20);
    const heap = tarp(still, ctx, TARP);
    brokenCrate(still, { x: -7.7, z: 0.2 }, -15);
    const blocks = concreteBlocks(still, { x: -4.6, z: 6 });
    rustedSheets(still);
    wireCoil(still, { x: 4.5, z: -6.6 });
    const posts = wireFence(still, ctx, height, FENCE, 'fort-fence');
    const tops = stumps.map((at, i) => rottenStump(still, at, at.size, `fort-stump-${i}`));
    branches.forEach((at, i) => fallenBranches(still, at, at.yaw, `fort-branches-${i}`));
    cairn(still, marker, 'fort-cairn');
    const ridge = { x: 2.5, z: -2.6, y: 6.3 };
    return [ridge, pile, heap, blocks, posts[1]!, tops[0]!];
  });
  if (ctx.state.time === 'day') crows(kit, ctx, perches);
  if (weather(ctx.state).drizzle) {
    // Off the front eaves, either side of the door.
    drips(kit, ctx, [-3.8, 4.2].map((x) => ({ x, z: 1.9, top: clearing.floor + 2.85, bottom: height(x, 1.9) + 0.04 })), 2.2, 0.3);
  }
}

/**
 * Split logs stacked against the fort's west wall under a rusted sheet. The cut ends are a painted
 * picture in front of a dark block, cheaper than a hundred logs and the same from the path.
 */
function firewood(kit: LevelKit, at: Spot): Perch {
  const length = 2.2;
  const high = 0.95;
  kit
    .group((g) => {
      g.box({ w: length, h: high, d: 0.42 }).color(0x241e18);
      scrawl(g, { w: length, h: high }, [88, 38], (c) => {
        for (let row = 0; row < 6; row++) {
          for (let col = 0; col < 14; col++) {
            const wobble = Math.sin(row * 7.3 + col * 3.1);
            const x = 3.5 + col * 6.1 + (row % 2) * 3 + wobble * 1.2;
            const y = 34 - row * 6 + Math.cos(row * 5 + col * 1.7) * 0.9;
            const r = 2.3 + ((row * 13 + col * 7) % 5) * 0.3;
            c.fillStyle = '#3a2c1e';
            c.beginPath();
            c.arc(x, y, r + 0.8, 0, Math.PI * 2);
            c.fill();
            c.fillStyle = wobble > 0.3 ? '#b0905e' : '#a2824e';
            c.beginPath();
            c.arc(x, y, r, 0, Math.PI * 2);
            c.fill();
            c.fillStyle = '#7e6440';
            c.fillRect(Math.round(x) - 1, Math.round(y) - 1, 2, 2);
          }
        }
      }).at(0, 0, 0.27);
      const sheet = g.box({ w: length + 0.3, h: 0.025, d: 0.75 }).texture('rust_metal', { tile: 0.9 }).color(RUST).at(0, high + 0.02, 0);
      sheet.object.rotation.x = 0.08;
      // Two logs that rolled off the front.
      [
        [0.4, 0.55, 12],
        [-0.5, 0.7, -8],
      ].forEach(([x, z, yaw]) =>
        g.mesh(new CylinderGeometry(0.08, 0.08, 0.42, 6).rotateX(Math.PI / 2)).texture('bark_spruce', { tile: 0.5 }).color(0x7a6a58).at(x!, 0.08, z!).rotY(yaw!),
      );
    })
    .at(at.x, 0, at.z)
    .rotY(-90)
    .onGround();
  kit.barrier({ w: 0.5, d: length }).at(at.x, 0, at.z);
  return { ...at, y: high + 0.05 };
}

/** An old army jerrycan, olive paint gone to rust. */
function jerrycan(kit: LevelKit, at: Spot, yaw: number): void {
  kit
    .group((g) => {
      g.box({ w: 0.17, h: 0.45, d: 0.34 }).texture('rust_metal', { tile: 0.4 }).color(0x5a5a46);
      [-0.08, 0, 0.08].forEach((z) => g.box({ w: 0.03, h: 0.05, d: 0.03 }).color(0x3e3a30).at(0, 0.45, z));
      g.box({ w: 0.03, h: 0.02, d: 0.2 }).color(0x3e3a30).at(0, 0.5, 0);
      g.cylinder({ r: 0.025, h: 0.04, sides: 6 }).color(0x3e3a30).at(0, 0.45, 0.13);
    })
    .at(at.x, 0, at.z)
    .rotY(yaw)
    .onGround();
}

/**
 * An army tarp over a heap the size of a crate, weighed down with stones, one corner loose.
 * The corner lifts and slaps down in the wind now and then.
 */
function tarp(kit: LevelKit, ctx: SceneContext, at: Spot & { yaw: number }): Perch {
  const corner = { x: HEAP.w / 2 + HEAP.skirt - 0.05, z: HEAP.d / 2 + HEAP.skirt - 0.05 };
  kit
    .group((g) => {
      g.mesh(tarpGeometry(HEAP)).texture('concrete_floor', { tile: 1.6 }).color(0x6a6e52).doubleSided();
      [
        [-1, -1],
        [-1, 1],
        [1, -1],
      ].forEach(([sx, sz], i) => g.box({ w: 0.22, h: 0.12, d: 0.18 }).texture('stone_wall', { tile: 0.4 }).color(0x8a867c).at(sx! * corner.x, 0, sz! * corner.z).rotY(i * 40));
      const flap = g
        .group((f) => f.box({ w: 0.4, h: 0.012, d: 0.36 }).texture('concrete_floor', { tile: 1.6 }).color(0x6a6e52).at(0.15, 0, 0.13).doubleSided())
        .at(corner.x - 0.1, 0.03, corner.z - 0.1)
        .rotY(-45)
        .dynamic();
      flap.object.rotation.x = -0.25;
      sway(kit, flap, { degrees: 10, speed: 0.45, axis: 'x' });
    })
    .at(at.x, 0, at.z)
    .rotY(at.yaw)
    .onGround();
  kit.barrier({ w: HEAP.w + 0.4, d: HEAP.d + 0.4 }).at(at.x, 0, at.z).rotY(at.yaw);
  nowAndThen(kit, ctx, 28 / (0.3 + weather(ctx.state).wind), () => {
    const p = ctx.player.position;
    if (Math.hypot(p.x - at.x, p.z - at.z) < 18) tarpFlap(ctx.audio, { x: at.x, y: p.y, z: at.z });
  }, 10);
  return { ...at, y: HEAP.h + 0.02 };
}

/** An ammunition crate with its front stove in and the lid gone, stencilled with the federal cross. */
function brokenCrate(kit: LevelKit, at: Spot, yaw: number): void {
  const [w, h, d] = [0.9, 0.48, 0.55];
  kit
    .group((g) => {
      const plank = (size: { w: number; h: number; d: number }) => g.box(size).texture('wood_planks', { tile: [0.6, 1.2] }).color(0x7a6e5a);
      plank({ w, h: 0.03, d }).at(0, 0, 0);
      plank({ w, h, d: 0.03 }).at(0, 0, -d / 2);
      plank({ w: 0.03, h, d }).at(-w / 2, 0, 0);
      plank({ w: 0.03, h, d }).at(w / 2, 0, 0);
      // What is left of the front: one board, the rest kicked in.
      plank({ w, h: 0.16, d: 0.03 }).at(0, 0, d / 2);
      const board = plank({ w: w * 0.9, h: 0.03, d: 0.15 }).at(0.2, 0, d / 2 + 0.4).rotY(18);
      board.object.rotation.z = 0.05;
      scrawl(g, { w: 0.44, h: 0.22 }, [48, 24], (c) => {
        c.fillStyle = '#2a2824';
        c.fillRect(2, 3, 18, 18);
        c.clearRect(9, 6, 4, 12);
        c.clearRect(5, 10, 12, 4);
        c.font = '9px monospace';
        c.fillText('1941', 22, 16);
      }).at(w / 2 + 0.016, 0.12, 0).rotY(90);
    })
    .at(at.x, 0, at.z)
    .rotY(yaw)
    .onGround();
}

/** Three cast concrete blocks, one sitting crooked on the others, a fourth tipped over in the moss. */
function concreteBlocks(kit: LevelKit, at: Spot): Perch {
  const block = () => kit.box({ w: 0.6, h: 0.4, d: 0.4 }).texture('concrete_bunker', { tile: 0.8 }).color(CONCRETE);
  block().at(at.x, 0, at.z).onGround().collider();
  block().at(at.x + 0.64, 0, at.z + 0.05).rotY(4).onGround().collider();
  block().at(at.x + 0.3, 0.4, at.z).rotY(-11).onGround();
  const tipped = block().at(at.x - 0.6, 0.3, at.z + 0.75).rotY(30).onGround();
  tipped.object.rotation.z = Math.PI / 2;
  return { x: at.x + 0.3, z: at.z, y: 0.82 };
}

/** Corrugated roofing gone to rust: one sheet in the moss behind the fort, one leaned on its wall. */
function rustedSheets(kit: LevelKit): void {
  const sheet = (w: number, d: number) => kit.box({ w, h: 0.015, d }).texture('rust_metal', { tile: [0.18, 1.2] }).color(RUST);
  // Tipped to lie along the rise behind the fort.
  sheet(1.8, 0.85).at(-2.5, 0.08, -7.7).rotY(8).onGround().object.rotation.x = 0.1;
  const leaning = sheet(1.6, 0.8).at(2.2, 0.35, -6.75).rotY(-3).onGround();
  leaning.object.rotation.x = -1.2;
}

/** A coil of barbed wire, loops sagging over each other. */
function wireCoil(kit: LevelKit, at: Spot): void {
  [0, 1, 2, 3, 4].forEach((i) => {
    const loop = kit
      .mesh(new TorusGeometry(0.36, 0.012, 3, 14))
      .color(0x3a302a)
      .at(at.x + i * 0.09, 0.33, at.z + Math.sin(i * 2) * 0.04)
      .rotY(90 + i * 4)
      .onGround();
    loop.object.rotation.z = 0.1 * (i - 2);
  });
}
