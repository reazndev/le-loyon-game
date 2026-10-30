import { CylinderGeometry, IcosahedronGeometry } from 'three';
import type { BufferGeometry } from 'three';
import { dialogues } from '../../content';
import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { minet } from '../chassot_farm/kolly';
import { minetBelow } from '../chassot_farm/hatch';
import { handText, paintedTexture } from '../forest_path/scrawl';
import { wall, type Finish } from '../inn/interior';
import { BIN, CANDLE, CRATE, CROWN, GRATING, ROOM, SHELF, SPRING, STAIR_DOOR, STEPS } from './layout';

/**
 * The cellar itself: rubble walls under a whitewashed vault gone grey, an earth floor, and what
 * someone keeps down here. Every prop the reporter can look at has its hotspot here.
 */

const STONE: Finish = { texture: 'stone_wall', tile: 1.1, color: 0x6e6a62 };
const WOOD = 0x5a4a3a;

export function buildRoom(kit: LevelKit): void {
  const { x0, x1, z0, z1 } = ROOM;
  kit.plane({ w: x1 - x0, d: z1 - z0, cell: 0.5 }).texture('grave_dirt', { tile: 1.4 }).color(0x4e4236).at(0, 0, 0).walkable('grass');
  wall(kit, [x0, z0], [x1, z0], SPRING, STONE);
  wall(kit, [x1, z1], [x0, z1], SPRING, STONE);
  wall(kit, [x1, z0], [x1, z1], CROWN, STONE, [{ at: -z0, w: STEPS.half * 2, h: 2.05 }]);
  wall(kit, [x0, z1], [x0, z0], CROWN, STONE, [{ at: z1 - STAIR_DOOR.z, w: STAIR_DOOR.w, h: STAIR_DOOR.h }]);
  kit.mesh(vault(x1 - x0, (z1 - z0) / 2)).texture('stone_wall', { tile: [0.2, 0.25] }).color(0x7a766c).doubleSided();
  grating(kit);
}

/**
 * A barrel vault along X over a span of `half` either side of z 0, springing at SPRING and
 * rising to CROWN, its faces turned inward so the torch lights the inside.
 */
function vault(length: number, half: number): BufferGeometry {
  const rise = CROWN - SPRING;
  const r = (half * half + rise * rise) / (2 * rise);
  const angle = Math.asin(half / r);
  const geometry = new CylinderGeometry(r, r, length, 14, 6, true, Math.PI / 2 - angle, angle * 2)
    .rotateZ(Math.PI / 2)
    .translate(0, SPRING - r * Math.cos(angle), 0);
  const normals = geometry.getAttribute('normal');
  for (let i = 0; i < normals.count; i++) normals.setXYZ(i, -normals.getX(i), -normals.getY(i), -normals.getZ(i));
  const index = geometry.getIndex()!;
  for (let i = 0; i < index.count; i += 3) {
    const b = index.getX(i + 1);
    index.setX(i + 1, index.getX(i + 2));
    index.setX(i + 2, b);
  }
  return geometry;
}

/** The grating high in the east wall, daylight through its bars. */
function grating(kit: LevelKit): void {
  kit.box({ w: 0.04, h: 0.22, d: 0.45 }).color(0xb4b8b0).unlit().at(GRATING.x - 0.07, GRATING.y, GRATING.z);
  [-0.15, -0.05, 0.05, 0.15].forEach((dz) => kit.box({ w: 0.02, h: 0.24, d: 0.02 }).color(0x2a2420).at(GRATING.x - 0.1, GRATING.y - 0.01, GRATING.z + dz));
}

/** The props, Minet, and their hotspots. */
export function buildProps(kit: LevelKit, ctx: SceneContext): void {
  const look = (prompt: string, at: { x: number; z: number }, play: () => Promise<void>, options: { radius?: number; photo?: string } = {}) =>
    kit.hotspot({ prompt, radius: options.radius ?? 0.6, onInteract: play, ...(options.photo ? { photo: options.photo } : {}) }).at(at.x, 0, at.z);

  kit.batch((still) => {
    potatoBin(still);
    jarShelf(still);
    still.box({ w: 0.7, h: 0.45, d: 0.45 }).texture('wood_planks', { tile: 0.6 }).color(WOOD).at(CRATE.x, 0, CRATE.z).collider();
    // The army blanket, folded square, BOIS-NOIR stenciled on the top fold.
    still.box({ w: 0.6, h: 0.12, d: 0.4 }).color(0x5c5e58).at(CRATE.x, 0.45, CRATE.z);
    still.box({ w: 0.3, h: 0.005, d: 0.06 }).color(0x1a1a18).at(CRATE.x + 0.1, 0.571, CRATE.z - 0.1);
    still.box({ w: 0.36, h: 0.36, d: 0.36 }).texture('wood_planks', { tile: 0.6 }).color(WOOD).at(CANDLE.x, 0, CANDLE.z).collider();
    still.cylinder({ r: 0.045, h: 0.1, sides: 8 }).color(0x8a9a90).at(CANDLE.x, 0.36, CANDLE.z);
    still.cylinder({ r: 0.02, h: 0.02, sides: 6 }).color(0xd8d0b8).at(CANDLE.x, 0.37, CANDLE.z);
    still.box({ w: 0.08, h: 0.025, d: 0.05 }).color(0x6a4a2a).at(CANDLE.x + 0.1, 0.36, CANDLE.z + 0.05).rotY(20);
    insideStair(still);
  });
  pencilMarks(kit);

  look('Look at the potatoes', BIN, () => ctx.dialogue(dialogues.cellar_bin), { photo: 'chassot_cellar' });
  look('Look at the jars', { x: SHELF.x, z: SHELF.z + 0.5 }, () => ctx.dialogue(dialogues.cellar_jars));
  look('Look at the blanket', { x: CRATE.x + 0.2, z: CRATE.z - 0.4 }, () => ctx.dialogue(dialogues.cellar_blanket_look), { photo: 'chassot_cellar' });
  look('Look at the jam jar', { x: CANDLE.x, z: CANDLE.z - 0.35 }, () => ctx.dialogue(dialogues.cellar_candle), { radius: 0.45, photo: 'chassot_cellar' });
  look('Look at the door frame', { x: STAIR_DOOR.x + 0.35, z: STAIR_DOOR.z + 0.45 }, () => ctx.dialogue(dialogues.cellar_marks), { radius: 0.4 });
  look('Look up the stair', { x: STAIR_DOOR.x + 0.35, z: STAIR_DOOR.z }, () => ctx.dialogue(dialogues.cellar_stair), { radius: 0.4 });

  if (!minetBelow(ctx)) return;
  const cat = minet(kit, ctx, { x: CRATE.x - 0.1, y: 0.53, z: CRATE.z, yaw: -70 });
  kit
    .hotspot({
      prompt: 'Pick up the cat',
      radius: 0.45,
      enabled: () => minetBelow(ctx),
      onInteract: async () => {
        await ctx.dialogue(dialogues.cellar_minet);
        if (!minetBelow(ctx)) cat.forEach((part) => (part.object.visible = false));
      },
    })
    .at(CRATE.x - 0.1, 0, CRATE.z - 0.35);
}

/** A slatted bin against the north wall, the potatoes taken from one side. */
function potatoBin(kit: LevelKit): void {
  const { x, z } = BIN;
  kit.box({ w: 1, h: 0.05, d: 0.7 }).texture('wood_planks', { tile: 0.6 }).color(WOOD).at(x, 0.05, z);
  [-0.48, 0.48].forEach((dx) => kit.box({ w: 0.04, h: 0.7, d: 0.7 }).texture('wood_planks', { tile: 0.6 }).color(WOOD).at(x + dx, 0, z));
  [0.12, 0.32, 0.52].forEach((y) =>
    [-0.33, 0.33].forEach((dz) => kit.box({ w: 1, h: 0.1, d: 0.03 }).texture('wood_planks', { tile: 0.6 }).color(0x6a5844).at(x, y, z + dz)),
  );
  kit.barrier({ w: 1, d: 0.7 }).at(x, 0, z);
  const potato = new IcosahedronGeometry(0.05, 0).scale(1.2, 0.8, 1);
  for (let i = 0; i < 26; i++) {
    const px = x - 0.4 + (i % 7) * 0.13;
    // Heaped to the brim on the west side, dug down on the east.
    const y = 0.12 + Math.max(0.05, 0.42 - (px - x + 0.4) * 0.45) + (i % 3) * 0.03;
    kit.mesh(potato).color(0x8a7458).at(px, y, z - 0.25 + Math.floor(i / 7) * 0.16).rotY(i * 47);
  }
  // Fresh soil on the floor where they were taken.
  kit.box({ w: 0.5, h: 0.01, d: 0.4 }).color(0x3a3026).at(x + 0.6, 0, z + 0.45);
}

/** Two boards of jam against the north wall: fourteen places, seven jars left, clean rings where the rest stood. */
function jarShelf(kit: LevelKit): void {
  const { x, z, w } = SHELF;
  const gone = new Set([1, 2, 4, 7, 9, 11, 12]);
  [0.75, 1.15].forEach((y, row) => {
    kit.box({ w, h: 0.03, d: 0.26 }).texture('wood_planks', { tile: 0.8 }).color(WOOD).at(x, y, z);
    for (let i = 0; i < 7; i++) {
      const slot = row * 7 + i;
      const jx = x - w / 2 + 0.13 + i * 0.24;
      if (gone.has(slot)) {
        kit.cylinder({ r: 0.045, h: 0.003, sides: 8 }).color(0x9a9286).at(jx, y + 0.03, z);
        continue;
      }
      kit.cylinder({ r: 0.045, h: 0.12, sides: 8 }).color(slot % 2 ? 0x5a2a34 : 0x8a6a2a).at(jx, y + 0.03, z);
      kit.cylinder({ r: 0.047, h: 0.02, sides: 8 }).color(0xc8c0a8).at(jx, y + 0.15, z);
    }
  });
  [-1, 1].forEach((side) => kit.box({ w: 0.04, h: 1.3, d: 0.26 }).texture('wood_planks', { tile: 0.8 }).color(WOOD).at(x + (side * w) / 2, 0, z));
  kit.barrier({ w, d: 0.3 }).at(x, 0, z);
}

/** Past the door frame in the west wall, a wooden stair up to the shut door into the house. */
function insideStair(kit: LevelKit): void {
  const { x, z, w, h } = STAIR_DOOR;
  [-1, 1].forEach((side) => kit.box({ w: 0.12, h, d: 0.1 }).texture('wood_planks', { tile: 0.6 }).color(0x6a5a46).at(x + 0.04, 0, z + (side * (w + 0.1)) / 2));
  kit.box({ w: 0.12, h: 0.12, d: w + 0.2 }).texture('wood_planks', { tile: 0.6 }).color(0x6a5a46).at(x + 0.04, h, z);
  for (let i = 0; i < 6; i++) kit.box({ w: 0.28, h: 0.24, d: w }).texture('wood_planks', { tile: 0.6 }).color(0x5e4e3c).at(x - 0.25 - i * 0.26, i * 0.24, z);
  [-1, 1].forEach((side) => kit.box({ w: 1.7, h: 3, d: 0.1 }).texture('stone_wall', { tile: 1.1 }).color(0x5e5a54).at(x - 0.9, 0, z + (side * (w + 0.1)) / 2));
  kit.box({ w: 0.06, h: 1.9, d: w }).texture('door_wood', { tile: [w, 1.9] }).color(0x7a6a58).at(x - 1.7, 1.44, z);
  kit.barrier({ w: 0.3, d: w }).at(x - 0.15, 0, z);
}

/** "Marc 1964", "Marc 1968", "Marc 1974": pencil on the south jamb, the last level with the reporter's eyes. */
function pencilMarks(kit: LevelKit): void {
  const marks = paintedTexture([24, 96], (g) => {
    g.fillStyle = '#6a5a46';
    g.fillRect(0, 0, 24, 96);
    [
      ['64', 70],
      ['68', 48],
      ['74', 6],
    ].forEach(([year, y]) => {
      g.fillStyle = '#2a2622';
      g.fillRect(2, Number(y), 18, 1);
      handText(g, `Marc ${year}`, 2, Number(y) + 4, { size: 4, color: '#2a2622' });
    });
  });
  kit.box({ w: 0.003, h: 1.0, d: 0.1 }).map(marks, { tile: [0.1, 1] }).at(STAIR_DOOR.x + 0.105, 0.72, STAIR_DOOR.z + (STAIR_DOOR.w + 0.1) / 2);
}
