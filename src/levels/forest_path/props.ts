import { BoxGeometry } from 'three';
import { cylinderGeometry } from '../../engine/render/geometry';
import { hashString, seededRandom } from '../../engine/random';
import { drips, nowAndThen, sway, weather, type Perch } from '../../game/ambient';
import { trunkCreak } from '../../game/ambient/sounds';
import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { alongPost, fencePosts, sagging, wireGeometry, type Point } from './fence';
import { handText, paintedTexture } from './scrawl';
import { wireTick } from './sounds';
import { yawToward, type Trail } from './trail';
import { rock, type Height } from './woods';

/**
 * Things left in the Bois-Noir: dead wood, an old wire fence, a hunter's hide, a cairn, litter,
 * a sign. Static parts can go inside `kit.batch`; parts that move are marked `.dynamic()`.
 * Each returns where a crow could sit on it, as a height above the ground.
 */

export type Spot = { x: number; z: number };

const WEATHERED = 0x6a6258;
/** Fence posts, a step lighter than the undergrowth so they read in the fog. */
const POST_WOOD = 0x7a7266;
const DARK_WOOD = 0x4e463e;
const BARK = 0x5e564c;
const RUST_WIRE = 0x3a302a;

/** Turns a prop so its -Z side faces `to`. */
const facing = (from: Spot, to: Spot) => yawToward(to.x - from.x, to.z - from.z);

/** A stick lying along its yaw, centered on its origin. */
const stick = (radius: number, length: number) =>
  cylinderGeometry(radius, length, 4, 1)
    .rotateZ(Math.PI / 2)
    .translate(length / 2, radius, 0);

/** Two or three dead branches dropped across each other, one with a side twig. */
export function fallenBranches(kit: LevelKit, { x, z }: Spot, yaw: number, seed: string): void {
  const random = seededRandom(hashString(seed));
  const count = 2 + Math.floor(random() * 2);
  Array.from({ length: count }, (_, i) => i).forEach((i) => {
    const length = 0.9 + random() * 1.1;
    const radius = 0.022 + random() * 0.025;
    const turn = yaw + (random() - 0.5) * 80;
    const [dx, dz] = [(random() - 0.5) * 0.6, (random() - 0.5) * 0.6];
    kit.mesh(stick(radius, length)).texture('bark_spruce', { tile: 0.5 }).color(i % 2 ? BARK : 0x6a5f52).at(x + dx, i * 0.02, z + dz).rotY(turn).onGround();
    if (i === 0) kit.mesh(stick(radius * 0.6, length * 0.4)).texture('bark_spruce', { tile: 0.5 }).color(BARK).at(x + dx + 0.2, 0.01, z + dz).rotY(turn + 35).onGround();
  });
}

/** A spruce stump gone soft: ragged top, a shelf fungus, roots running off into the moss. */
export function rottenStump(kit: LevelKit, { x, z }: Spot, size: number, seed: string): Perch {
  const random = seededRandom(hashString(seed));
  const r = 0.26 * size;
  const h = 0.45 * size;
  const body = kit.cylinder({ r, h: h + 0.12, sides: 7 }).texture('bark_spruce', { tile: 0.7 }).color(0x4e463c).at(x, -0.12, z).onGround();
  if (r > 0.24) body.collider();
  kit.cylinder({ r: r * 0.88, h: 0.03, sides: 7 }).texture('wood_planks', { tile: 0.4 }).color(0x4a3e32).at(x, h - 0.01, z).onGround();
  // Splinters left standing round the rim where the trunk broke.
  [0, 1, 2].forEach((i) => {
    const a = random() * Math.PI * 2;
    kit
      .box({ w: 0.08 * size, h: 0.08 + random() * 0.18, d: 0.05 })
      .texture('bark_spruce', { tile: 0.4 })
      .color(BARK)
      .at(x + Math.cos(a) * r * 0.8, h - 0.02, z + Math.sin(a) * r * 0.8)
      .rotY((-a * 180) / Math.PI + 90 + i * 7)
      .onGround();
  });
  const fungus = random() * Math.PI * 2;
  kit.cylinder({ r: 0.07 * size, h: 0.02, sides: 6 }).color(0x8e806a).at(x + Math.cos(fungus) * r, h * 0.45, z + Math.sin(fungus) * r).onGround();
  [0, 1, 2].forEach((i) => {
    const a = random() * Math.PI * 2;
    kit.mesh(stick(0.04 * size, 0.5 * size)).texture('bark_spruce', { tile: 0.5 }).color(BARK).at(x + Math.cos(a) * r, -0.02, z + Math.sin(a) * r).rotY((-a * 180) / Math.PI + i * 5).onGround();
  });
  return { x, z, y: h + 0.02 };
}

/** A small stack of flat stones by a path, the kind someone builds to mark a way. */
export function cairn(kit: LevelKit, { x, z }: Spot, seed: string): Perch {
  let y = 0;
  [0.3, 0.23, 0.17, 0.12, 0.08].forEach((size, i) => {
    // Paler than the boulders: stones picked out of the stream, no moss on them yet.
    rock(kit, x + (i % 2 ? 0.03 : -0.02), z + (i % 3 ? 0.02 : -0.03), size, `${seed}-${i}`, -y).texture('church_stone', { tile: 0.6 }).color(0xbcb8ac);
    y += size * 0.55;
  });
  return { x, z, y };
}

/**
 * A pale plastic bag caught in a bramble, stirring now and then. Built as a group hanging from
 * the twig it snagged on, so `sway` swings it from there.
 */
export function plasticBag(kit: LevelKit, { x, z }: Spot): void {
  kit.sprite('bramble', { w: 1.5, h: 1.05 }).color(0x6a5c54).at(x, -0.12, z).onGround();
  const bag = kit
    .group((g) => {
      const plastic = (w: number, h: number, d: number, shade: number) => g.box({ w, h, d }).color(shade);
      plastic(0.04, 0.08, 0.03, 0x8e8e86).at(0, -0.08, 0);
      // The handles, stretched up to where they caught.
      plastic(0.02, 0.12, 0.02, 0x96968e).at(-0.05, -0.2, 0).rotY(10);
      plastic(0.02, 0.1, 0.02, 0x96968e).at(0.05, -0.19, 0.01);
      plastic(0.19, 0.17, 0.08, 0x9c9c94).at(0, -0.36, 0).rotY(14);
      plastic(0.14, 0.09, 0.11, 0x92928a).at(0.03, -0.4, 0.02).rotY(-24);
      plastic(0.1, 0.06, 0.07, 0xa4a49c).at(-0.06, -0.31, -0.02).rotY(40);
    })
    .at(x + 0.15, 0.78, z - 0.1)
    .onGround()
    .dynamic();
  sway(kit, bag, { degrees: 9, speed: 0.31, axis: 'x' });
}

/** The sign's board: faded enamel white, rust coming through, black capitals. */
const signTexture = () =>
  paintedTexture([64, 32], (c) => {
    c.fillStyle = '#a49e90';
    c.fillRect(0, 0, 64, 32);
    c.fillStyle = '#7a5a40';
    [[3, 26, 9, 4], [50, 2, 10, 3], [58, 20, 5, 9], [0, 0, 3, 32]].forEach(([sx, sy, sw, sh]) => c.fillRect(sx!, sy!, sw!, sh!));
    c.fillStyle = '#2a2622';
    c.fillRect(2, 2, 60, 1);
    c.fillRect(2, 29, 60, 1);
    handText(c, 'PROPRIÉTÉ', 4, 11, { size: 9, color: '#2a2622', font: 'sans-serif' });
    handText(c, 'PRIVÉE', 14, 22, { size: 9, color: '#2a2622', font: 'sans-serif' });
  });

/** "Propriété privée" on a post, the board hanging crooked from its last nail. It faces `toward`. */
export function privateSign(kit: LevelKit, at: Spot, toward: Spot): void {
  const yaw = facing(at, toward) + 180;
  kit.group((g) => {
    g.box({ w: 0.09, h: 1.55, d: 0.09 }).texture('wood_planks', { tile: 0.6 }).color(DARK_WOOD).at(0, -0.2, 0);
    const board = g
      .group((b) => b.box({ w: 0.48, h: 0.26, d: 0.025 }).map(signTexture(), { tile: [0.48, 0.26] }).color(0x8e897e).at(-0.19, -0.24, 0))
      .at(0.2, 1.3, 0.06)
      .dynamic();
    board.object.rotation.z = 0.14;
    sway(kit, board, { degrees: 1.2, speed: 0.13, axis: 'z' });
  })
    .at(at.x, 0, at.z)
    .rotY(yaw)
    .onGround();
}

/**
 * A raised hunter's hide: a plank box on four splayed legs, a slit for the rifle facing `toward`,
 * a ladder up to it. It creaks in the wind now and then when the reporter is near.
 */
export function huntersHide(kit: LevelKit, ctx: SceneContext, at: Spot, toward: Spot): Perch {
  const deck = 2.5;
  const half = 0.65;
  const splay = 0.07;
  const wallH = 1.15;
  kit.group((g) => {
    const planks = (size: { w: number; h: number; d: number }) => g.box(size).texture('wood_planks', { tile: [0.8, 1.6] }).color(WEATHERED);
    [-1, 1].forEach((sx) =>
      [-1, 1].forEach((sz) => {
        const leg = g
          .cylinder({ r: 0.06, h: deck + 0.3, sides: 5 })
          .texture('bark_spruce', { tile: 0.8 })
          .color(BARK)
          .at(sx * (half + deck * splay), -0.3, sz * (half + deck * splay))
          .collider();
        leg.object.rotation.set(-sz * splay, 0, sx * splay);
      }),
    );
    // A brace across each side, nailed from one leg to the other.
    [-1, 1].forEach((sx) =>
      g
        .mesh(new BoxGeometry(0.05, 0.08, Math.hypot(2 * half + deck * splay, deck * 0.55)).rotateX(Math.atan2(deck * 0.55, 2 * half + deck * splay)))
        .texture('bark_spruce', { tile: 0.6 })
        .color(BARK)
        .at(sx * (half + deck * splay * 0.5 + 0.05), deck * 0.45, 0),
    );
    planks({ w: 1.5, h: 0.08, d: 1.5 }).at(0, deck, 0);
    const floor = deck + 0.08;
    planks({ w: 1.4, h: wallH, d: 0.05 }).at(0, floor, half);
    planks({ w: 0.05, h: wallH, d: 1.4 }).at(-half, floor, 0);
    planks({ w: 0.05, h: wallH, d: 1.4 }).at(half, floor, 0);
    planks({ w: 1.4, h: 0.62, d: 0.05 }).at(0, floor, -half);
    planks({ w: 1.4, h: 0.16, d: 0.05 }).at(0, floor + wallH - 0.16, -half);
    // The slit shows nothing but dark.
    g.box({ w: 1.3, h: 0.37, d: 0.02 }).color(0x050505).unlit().at(0, floor + 0.62, -half + 0.08);
    const roof = g.box({ w: 1.8, h: 0.05, d: 1.85 }).texture('rust_metal', { tile: 0.9 }).color(0x4e4a44).at(0, floor + wallH + 0.04, 0);
    roof.object.rotation.x = -0.16;
    g.group((ladder) => {
      [-1, 1].forEach((side) => ladder.box({ w: 0.05, h: 2.95, d: 0.05 }).texture('bark_spruce', { tile: 0.6 }).color(BARK).at(side * 0.22, 0, 0));
      [0.3, 0.62, 0.94, 1.26, 1.58, 1.9, 2.22, 2.54].forEach((y, i) =>
        // One rung has gone.
        i === 3 ? undefined : ladder.box({ w: 0.48, h: 0.04, d: 0.04 }).texture('wood_planks', { tile: 0.5 }).color(WEATHERED).at(0, y, 0),
      );
    })
      .at(0, -0.1, -half - 1.0)
      .object.rotation.set(0.36, 0, 0);
  })
    .at(at.x, 0, at.z)
    .rotY(facing(at, toward))
    .onGround();

  const world = kit.use((k) => k.world);
  nowAndThen(kit, ctx, 40 / (0.4 + weather(ctx.state).wind), () => {
    const p = ctx.player.position;
    if (Math.hypot(p.x - at.x, p.z - at.z) > 20) return;
    trunkCreak(ctx.audio, { x: at.x, y: world.ground.sample(at.x, at.z).height + deck, z: at.z }, 0.35);
  }, 25);
  return { x: at.x, z: at.z, y: deck + wallH + 0.15 };
}

const POST = 1.35;
const STRANDS = [0.6, 1.05];

/**
 * A rusted barbed-wire fence on leaning posts along `points`, its last post rotted off and lying
 * in the moss with the wire trailing to it. Solid to walk into. In wind the wire ticks now and
 * then near the reporter. Returns the post tops for crows.
 */
export function wireFence(kit: LevelKit, ctx: SceneContext, height: Height, points: Trail, seed: string): Perch[] {
  const posts = fencePosts(points, 2.6, seed);
  const sunk = 0.2;
  const base = (post: { x: number; z: number }): Point => [post.x, height(post.x, post.z) - sunk, post.z];
  posts.forEach((post) => {
    if (post.fallen) {
      kit.mesh(stick(0.055, POST)).texture('wood_planks', { tile: 0.6 }).color(POST_WOOD).at(post.x, -0.04, post.z).rotY(70).onGround();
      return;
    }
    const placed = kit.cylinder({ r: 0.06, h: POST + sunk, sides: 5 }).texture('wood_planks', { tile: 0.6 }).color(POST_WOOD).at(...base(post));
    placed.object.rotation.set(post.lean.x, 0, post.lean.z);
  });
  const spans = posts.slice(1).map((b, i) => [posts[i]!, b] as const);
  const wires = spans.flatMap(([a, b]) =>
    STRANDS.map((up) => {
      const from = alongPost(a, base(a), up + sunk);
      // To the fallen post the wire has slipped down and trails over the ground.
      const to = b.fallen ? ([b.x, height(b.x, b.z) + 0.05, b.z] as const) : alongPost(b, base(b), up + sunk);
      return sagging(from, to, b.fallen ? 0.15 : 0.05);
    }),
  );
  kit.mesh(wireGeometry(wires, 0.018, 0.45)).color(RUST_WIRE);
  spans
    .filter(([, b]) => !b.fallen)
    .forEach(([a, b]) => kit.barrier({ w: 0.3, d: Math.hypot(b.x - a.x, b.z - a.z) }).at((a.x + b.x) / 2, 0, (a.z + b.z) / 2).rotY(facing(a, b)));

  const middles = spans.map(([a, b]) => ({ x: (a.x + b.x) / 2, y: height((a.x + b.x) / 2, (a.z + b.z) / 2) + 1, z: (a.z + b.z) / 2 }));
  nowAndThen(kit, ctx, 30 / (0.3 + weather(ctx.state).wind), () => {
    const p = ctx.player.position;
    const nearest = middles.reduce((best, m) => (Math.hypot(m.x - p.x, m.z - p.z) < Math.hypot(best.x - p.x, best.z - p.z) ? m : best));
    if (Math.hypot(nearest.x - p.x, nearest.z - p.z) < 16) wireTick(ctx.audio, nearest);
  }, 12);
  return posts.filter((post) => !post.fallen).map((post) => ({ x: post.x, z: post.z, y: POST - 0.05 }));
}

/** On wet nights, water gathering on branches over the path and dropping, at each spot. */
export function branchDrips(kit: LevelKit, ctx: SceneContext, height: Height, spots: readonly Spot[]): void {
  if (!weather(ctx.state).drizzle) return;
  drips(
    kit,
    ctx,
    spots.map(({ x, z }) => ({ x, z, top: height(x, z) + 3.4, bottom: height(x, z) + 0.06 })),
    3.4,
    0.25,
  );
}
