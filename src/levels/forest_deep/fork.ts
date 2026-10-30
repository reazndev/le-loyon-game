import { crows } from '../../game/ambient';
import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { playNode } from '../forest_path/play';
import { yawToward } from '../forest_path/trail';
import { leafyTrees, rock } from '../forest_path/woods';

type Spot = { x: number; z: number };

const BARK = 0x5e564c;
const ROTTEN = 0x5a5248;
const DECK = 2.4;

/** The glacier boulder where the track splits, the size of a car and furred with moss. */
export function forkBoulder(kit: LevelKit, ctx: SceneContext, at: Spot): void {
  rock(kit, at.x, at.z, 1.4, 'larch-boulder', 0.15);
  kit.hotspot({ prompt: 'Look at the boulder', radius: 2.2, onInteract: () => playNode(ctx, 'forest_boulder') }).at(at.x, 0, at.z);
}

/**
 * The end of the left fork: a hunter's high seat on four poles, its ladder rotted through and two
 * rungs gone, a bag on the seat bleached white. Dense spruce close round it, open only to the
 * mud the reporter came up, so it reads as the end. Two crows sit on it by day.
 */
export function highSeat(kit: LevelKit, ctx: SceneContext, at: Spot, toward: Spot): void {
  const yaw = yawToward(toward.x - at.x, toward.z - at.z);
  kit.group((g) => {
    const pole = (x: number, z: number) => g.cylinder({ r: 0.06, h: DECK + 1.1, sides: 5 }).texture('bark_spruce', { tile: 0.8 }).color(BARK).at(x, -0.2, z).collider();
    [-0.5, 0.5].forEach((x) => [-0.5, 0.5].forEach((z) => pole(x, z)));
    const plank = (size: { w: number; h: number; d: number }) => g.box(size).texture('wood_planks', { tile: [0.8, 1.6] }).color(ROTTEN);
    plank({ w: 1.2, h: 0.06, d: 1.2 }).at(0, DECK, 0);
    plank({ w: 1, h: 0.05, d: 0.32 }).at(0, DECK + 0.45, 0.3);
    plank({ w: 1.15, h: 0.05, d: 0.05 }).at(0, DECK + 0.8, -0.52);
    plank({ w: 0.05, h: 0.05, d: 1.15 }).at(-0.52, DECK + 0.7, 0);
    // The bag on the seat, gone white in the weather.
    g.box({ w: 0.24, h: 0.1, d: 0.16 }).color(0xc4c4bc).at(0.18, DECK + 0.5, 0.28).rotY(18);
    g.box({ w: 0.1, h: 0.05, d: 0.12 }).color(0xb8b8b0).at(0.04, DECK + 0.5, 0.36).rotY(-30);
    g.group((ladder) => {
      ladder.box({ w: 0.05, h: DECK + 0.3, d: 0.05 }).texture('bark_spruce', { tile: 0.6 }).color(BARK).at(-0.22, 0, 0);
      // The right rail has rotted off at knee height.
      ladder.box({ w: 0.05, h: 0.55, d: 0.05 }).texture('bark_spruce', { tile: 0.6 }).color(BARK).at(0.22, 0, 0);
      // Above the break the rungs hang from the left rail alone.
      [0.3, 0.62, 0.94, 1.26, 1.58, 1.9, 2.22]
        .map((y, i) => ({ y, i }))
        .filter(({ i }) => i !== 2 && i !== 4)
        .forEach(({ y, i }) => {
          const rung = ladder.box({ w: 0.48, h: 0.04, d: 0.04 }).texture('wood_planks', { tile: 0.5 }).color(ROTTEN).at(0, y, 0);
          if (i > 1) rung.object.rotation.z = -0.35;
        });
    })
      .at(0, -0.05, -1.35)
      .object.rotation.set(0.36, 0, 0);
  })
    .at(at.x, 0, at.z)
    .rotY(yaw)
    .onGround();
  kit.hotspot({ prompt: 'Look at the high seat', radius: 1.6, onInteract: () => playNode(ctx, 'forest_highseat') }).at(at.x, 0, at.z);

  const open = (yaw * Math.PI) / 180;
  const ring = Array.from({ length: 12 }, (_, i) => (i / 12) * Math.PI * 2)
    .filter((a) => Math.abs(Math.atan2(Math.sin(a - open), Math.cos(a - open))) > 0.75)
    .map((a, i) => ({ x: at.x - Math.sin(a) * (4 + (i % 2) * 0.6), z: at.z - Math.cos(a) * (4 + (i % 2) * 0.6), scale: 1.1 + (i % 3) * 0.12, yaw: i * 47 }));
  leafyTrees(kit, 'spruce', ring);

  if (ctx.state.time === 'day') {
    crows(kit, ctx, [
      { x: at.x + 0.3, z: at.z, y: DECK + 0.85 },
      { x: at.x - 0.35, z: at.z + 0.2, y: DECK + 0.6 },
    ]);
  }
}
