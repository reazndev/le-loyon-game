import type { LevelKit } from '../../game/kit/levelKit';
import { handText, paintedTexture } from '../forest_path/scrawl';
import { yawToward } from '../forest_path/trail';

/**
 * Small things along the hill path: a bench where the old people stop on the way up, the
 * offerings at the foot of the wayside cross, and an enamel sign wired to the fence. Still, for
 * the path's batch. Each faces `toward` with its front.
 */

type Spot = { x: number; z: number };

/** Turns a prop so its -Z side faces `to`. */
const facing = (from: Spot, to: Spot) => yawToward(to.x - from.x, to.z - from.z);

/** A slatted bench on iron legs, its front toward `toward`, the paint gone grey. */
export function bench(kit: LevelKit, at: Spot, toward: Spot): void {
  const wood = 0x6e6458;
  const iron = 0x34322e;
  kit
    .group((g) => {
      [-0.07, 0.07].forEach((dz) => g.box({ w: 1.6, h: 0.04, d: 0.12 }).texture('wood_planks', { tile: 0.8 }).color(wood).at(0, 0.44, dz));
      [0.6, 0.78].forEach((y) => g.box({ w: 1.6, h: 0.1, d: 0.03 }).texture('wood_planks', { tile: 0.8 }).color(wood).at(0, y, 0.18));
      [-0.65, 0.65].forEach((dx) => {
        g.box({ w: 0.05, h: 0.44, d: 0.34 }).color(iron).at(dx, 0, 0);
        g.box({ w: 0.04, h: 0.48, d: 0.04 }).color(iron).at(dx, 0.44, 0.19);
      });
      // Someone's bag of bread for the birds, left folded under the seat.
      g.box({ w: 0.2, h: 0.02, d: 0.14 }).color(0xb4ab96).at(0.3, 0.01, -0.05).rotY(20);
    })
    .at(at.x, -0.05, at.z)
    .rotY(facing(at, toward))
    .onGround();
  kit.barrier({ w: 1.6, d: 0.45 }).at(at.x, 0, at.z);
}

/** At the foot of the wayside cross: a pot of chrysanthemums from All Saints gone brown, and a grave candle, out. */
export function crossOfferings(kit: LevelKit, at: Spot, toward: Spot): void {
  kit
    .group((g) => {
      g.cylinder({ r: 0.1, h: 0.15, sides: 6 }).color(0x7a4e38).at(-0.2, 0, 0.18);
      [0x6a5440, 0x7a5e44, 0x8a7254, 0x5e4a3a].forEach((c, i) =>
        g.box({ w: 0.09, h: 0.07, d: 0.09 }).color(c).at(-0.2 + Math.cos(i * 1.6) * 0.045, 0.15 + (i % 2) * 0.04, 0.18 + Math.sin(i * 1.6) * 0.045).rotY(i * 30),
      );
      g.cylinder({ r: 0.04, h: 0.12, sides: 6 }).color(0x6a2420).at(0.02, 0, 0.22);
      g.cylinder({ r: 0.042, h: 0.025, sides: 6 }).color(0x8a7a48).at(0.02, 0.12, 0.22);
      // A flat stone to kneel on, sunk in the grass.
      g.box({ w: 0.5, h: 0.06, d: 0.3 }).texture('gravestone_granite', { tile: 0.6 }).color(0x7a7a74).at(0, -0.02, 0.55);
    })
    .at(at.x, 0, at.z)
    .rotY(facing(at, toward) + 180)
    .onGround();
}

/** "Attention taureau" on enamel, wired to the side of a fence post that faces `toward`. */
export function fenceSign(kit: LevelKit, post: Spot, toward: Spot): void {
  const board = paintedTexture([64, 32], (c) => {
    c.fillStyle = '#a8a294';
    c.fillRect(0, 0, 64, 32);
    c.fillStyle = '#7a3a30';
    c.fillRect(0, 0, 64, 2);
    c.fillRect(0, 30, 64, 2);
    c.fillStyle = '#6a5040';
    [[52, 4, 9, 4], [2, 22, 6, 6]].forEach(([x, y, w, h]) => c.fillRect(x!, y!, w!, h!));
    handText(c, 'ATTENTION', 5, 11, { size: 9, color: '#2a2622', font: 'sans-serif' });
    handText(c, 'TAUREAU', 10, 22, { size: 9, color: '#2a2622', font: 'sans-serif' });
  });
  kit
    .group((g) => {
      g.box({ w: 0.44, h: 0.22, d: 0.015 }).map(board, { tile: [0.44, 0.22] }).color(0x9a958a).at(0, 0, 0.06);
    })
    .at(post.x, 0.72, post.z)
    .rotY(facing(post, toward) + 180)
    .onGround();
}
