import { IcosahedronGeometry } from 'three';
import { dialogues } from '../../content';
import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';

/**
 * The vegetable patch behind the Chassot house: Marc's. Straight rows, the earth turned, the
 * edges cut, a hoe wiped clean. In the middle of the nettles it is the most frightening thing here.
 */

export const GARDEN = { x: 9.5, z: -12.5, w: 6, d: 7 };

export function garden(kit: LevelKit, ctx: SceneContext): void {
  const { x, z, w, d } = GARDEN;
  kit.plane({ w, d, cell: 0.6 }).texture('grave_dirt', { tile: 1.4 }).color(0x5a4a3c).at(x, 0.03, z).walkable('grass');
  // Leeks in four rows, cabbages in two, string between stakes at the row ends.
  [-2.2, -1.5, -0.8, -0.1].forEach((dx) => {
    for (let i = 0; i < 9; i++) {
      const lz = z - d / 2 + 0.6 + i * 0.7;
      kit.box({ w: 0.05, h: 0.42, d: 0.05 }).color(0x7e8870).at(x + dx, 0.03, lz);
      kit.box({ w: 0.14, h: 0.22, d: 0.02 }).color(0x5e6e52).at(x + dx, 0.38, lz).rotY(i * 40);
    }
    [-1, 1].forEach((end) => kit.box({ w: 0.03, h: 0.35, d: 0.03 }).color(0x6a5a46).at(x + dx, 0.03, z + (end * (d - 0.4)) / 2));
  });
  const cabbage = new IcosahedronGeometry(0.2, 0).scale(1, 0.8, 1).translate(0, 0.14, 0);
  [1, 1.9].forEach((dx) => {
    for (let i = 0; i < 7; i++) kit.mesh(cabbage).color(0x46543e).at(x + dx, 0.03, z - d / 2 + 0.7 + i * 0.9).rotY(i * 53);
  });
  // A low wire fence on stakes, and a gap with a gate of two boards.
  [
    [x, z - d / 2 - 0.2, w + 0.4, 0],
    [x, z + d / 2 + 0.2, w + 0.4, 0],
    [x - w / 2 - 0.2, z, d + 0.4, 90],
  ].forEach(([fx, fz, length, yaw]) => {
    kit.box({ w: length!, h: 0.8, d: 0.03 }).texture('iron_fence', { tile: [0.5, 0.5] }).cutout().doubleSided().color(0x8a8a84).at(fx!, 0, fz!).rotY(yaw!);
    kit.barrier({ w: yaw ? 0.3 : length!, d: yaw ? length! : 0.3 }).at(fx!, 0, fz!);
  });
  // The hoe against the barn, its blade wiped clean; a watering can, full.
  kit.box({ w: 0.035, h: 1.5, d: 0.035 }).color(0x9a8a6a).at(x - w / 2 - 0.9, 0, z - 1.4).object.rotation.z = 0.2;
  kit.box({ w: 0.2, h: 0.12, d: 0.03 }).color(0x8a8a86).at(x - w / 2 - 0.75, 0.02, z - 1.4);
  kit.cylinder({ r: 0.14, h: 0.3, sides: 8 }).color(0x6a7a6a).at(x + w / 2 + 0.5, 0, z + 2).collider();
  kit.box({ w: 0.04, h: 0.04, d: 0.4 }).color(0x6a7a6a).at(x + w / 2 + 0.5, 0.2, z + 2.3).object.rotation.x = -0.6;

  kit
    .hotspot({
      prompt: 'Look at the garden',
      radius: 2.5,
      photo: 'chassot_garden',
      // The script lets the reporter notice it from day 2.
      enabled: () => ctx.state.count('day') >= 2,
      onInteract: () => ctx.dialogue(dialogues.chassot_garden),
    })
    .at(x, 0, z);
}
