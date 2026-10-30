import { dialogues } from '../../content';
import type { MeshBuilder } from '../../game/kit/builders';
import type { LevelKit } from '../../game/kit/levelKit';
import { scatter } from '../../game/kit/scatter';
import type { SceneContext } from '../../game/scene';
import { distanceToTrails } from '../forest_path/trail';
import { BOUNDS, BUS_STOP, churchLane, FOUNTAIN, gremaudLane, LAMP, mainRoad, MEMORIAL, PHONE_BOX, ROAD_WIDTH, SQUARE } from './layout';
import { bench, busStop, fountain, fribourgFlag, hikingSign, memorial, noticeCase, phoneBox, streetLamp } from './props';
import { road } from './road';

/** The ground of the village: wet grass, the paved square, the road, the lanes, and the things on them. */

const roads = [mainRoad, churchLane, gremaudLane];

/** Flat in the village, rising gently into the meadows past the last houses. */
const height = (x: number, z: number) => {
  const out = Math.max(0, Math.hypot(x * 0.9, z * 0.7) - 30);
  return Math.min(2.5, out * 0.08) * (0.7 + 0.3 * Math.sin(x * 0.11 + z * 0.07));
};

export function ground(kit: LevelKit): void {
  const w = BOUNDS.x1 - BOUNDS.x0 + 20;
  const d = BOUNDS.z1 - BOUNDS.z0 + 20;
  const cx = (BOUNDS.x0 + BOUNDS.x1) / 2;
  const cz = (BOUNDS.z0 + BOUNDS.z1) / 2;
  kit
    .terrain({ w, d, cell: 2, height: (x, z) => height(x + cx, z + cz) })
    .texture('grass_dead', { tile: 4 })
    .color(0x8a8c78)
    .at(cx, 0, cz)
    .walkable('grass');
  kit.plane({ w: SQUARE.w, d: SQUARE.d, cell: 0.75 }).texture('cobblestone', { tile: 2.2 }).color(0x9a9890).at(SQUARE.x, 0.025, SQUARE.z).walkable('stone');
  road(kit, mainRoad, { width: ROAD_WIDTH, texture: 'asphalt', tile: 4, color: 0x8a8a86, lift: 0.04 });
  road(kit, churchLane, { width: 3, texture: 'gravel_path', tile: 2, color: 0x9e9a90, surface: 'gravel' });
  road(kit, gremaudLane, { width: 2.4, texture: 'gravel_path', tile: 2, color: 0x9e9a90, surface: 'gravel' });
  // Forecourts in front of the laiterie and the garage, where the milk lorry and the cars turn.
  kit.plane({ w: 7, d: 12, cell: 1 }).texture('asphalt', { tile: 4 }).color(0x86867e).at(-2.5, 0.035, 23).walkable('stone');
  kit.plane({ w: 4, d: 16, cell: 1 }).texture('gravel_path', { tile: 2 }).color(0x9a968a).at(8.6, 0.035, 25).walkable('gravel');

  // Tufts and a few weeds where the grass meets the walls; none on the roads.
  const paved = (x: number, z: number) =>
    distanceToTrails(roads, x, z) < ROAD_WIDTH / 2 + 0.6 || (Math.abs(x - SQUARE.x) < SQUARE.w / 2 + 0.5 && Math.abs(z - SQUARE.z) < SQUARE.d / 2 + 0.5);
  scatter({ x: cx, z: cz, w: w - 24, d: d - 24, count: 420, seed: 'village-tufts', spacing: 1.3, scale: [0.6, 1.2], avoid: paved }).forEach((s) =>
    kit.sprite('grass_tuft', { w: 0.8 * s.scale!, h: 0.45 * s.scale! }).color(0x7a7c66).at(s.x, -0.04, s.z).onGround(),
  );
  // Lime trees by the church and a few bare fruit trees in the gardens.
  kit
    .trees('bare', [
      { x: -8.6, z: -12.6, scale: 1.25, yaw: 20 },
      { x: 8.4, z: -13.2, scale: 1.15, yaw: 140 },
      { x: -15, z: 26, scale: 0.7 },
      { x: 21, z: 5, scale: 0.75, yaw: 70 },
      { x: -26, z: -14, scale: 0.8 },
      { x: 26, z: 20, scale: 0.7, yaw: 200 },
    ])
    .collider();
  kit
    .trees('spruce', scatter({ x: cx, z: BOUNDS.z0 + 6, w: w - 20, d: 8, count: 18, seed: 'village-spruce-north', spacing: 4, scale: [1.1, 1.5], avoid: (x) => Math.abs(x + 10) < 4 }))
    .collider();
}

export interface Street {
  /** The phone box lamp, which flickers at night. */
  phoneLamp: MeshBuilder | null;
}

/**
 * The fountain, the phone box, the bus stop, the memorial, the lamp, the flag and the yellow
 * sign. `phone` runs when the reporter lifts the receiver; the night 2 beat decides what is on it.
 */
export function streetFurniture(kit: LevelKit, ctx: SceneContext, night: boolean, phone: () => Promise<void>): Street {
  fountain(kit)
    .at(FOUNTAIN.x, 0, FOUNTAIN.z)
    .rotY(15);
  kit.hotspot({ prompt: 'Look at the fountain', radius: 1.2, onInteract: () => ctx.dialogue(dialogues.square_fountain) }).at(FOUNTAIN.x, 0, FOUNTAIN.z);

  const parts: { phoneLamp?: MeshBuilder } = {};
  kit
    .group((g) => {
      phoneBox(g);
      if (night) parts.phoneLamp = g.box({ w: 0.32, h: 0.04, d: 0.32 }).color(0xd8e0d0).unlit().at(0, 2.31, 0);
    })
    .at(PHONE_BOX.x, 0, PHONE_BOX.z)
    .rotY(-90);
  kit.hotspot({ prompt: 'Lift the receiver', radius: 0.9, onInteract: phone }).at(PHONE_BOX.x - 0.9, 0, PHONE_BOX.z);

  busStop(kit).at(BUS_STOP.x, 0, BUS_STOP.z).rotY(180);
  memorial(kit).at(MEMORIAL.x, 0, MEMORIAL.z);
  kit.hotspot({ prompt: 'Read the plaque', radius: 0.8, onInteract: () => ctx.dialogue(dialogues.square_memorial) }).at(MEMORIAL.x, 0, MEMORIAL.z + 0.6);
  fribourgFlag(kit).at(MEMORIAL.x - 2, 0, MEMORIAL.z + 0.6);
  streetLamp(kit, night).at(LAMP.x, 0, LAMP.z).rotY(-130);
  hikingSign(kit, [100, -10]).at(-8.2, 0, -9.4);
  noticeCase(kit).at(-11.8, 0, 2).rotY(90);
  bench(kit).at(3.4, 0, -6.4).rotY(200);
  return { phoneLamp: parts.phoneLamp ?? null };
}

/** The reporter's way out of the village in each direction, and the invisible edges. */
export function exits(kit: LevelKit): void {
  const { x0, x1, z0, z1 } = BOUNDS;
  kit.exit({ w: 1, d: 8, to: 'chassot_farm', spawn: 'from_square' }).at(x0 + 1.5, 0, 8.5);
  kit.exit({ w: 8, d: 1, to: 'yerly_farm', spawn: 'from_square' }).at(4.6, 0, z1 - 1.5);
  kit.exit({ w: 5, d: 1, to: 'cemetery_path', spawn: 'from_square' }).at(-10, 0, z0 + 2.5);
  [
    { x: (x0 + x1) / 2, z: z0, w: x1 - x0, d: 1 },
    { x: (x0 + x1) / 2, z: z1, w: x1 - x0, d: 1 },
    { x: x0, z: (z0 + z1) / 2, w: 1, d: z1 - z0 },
    { x: x1, z: (z0 + z1) / 2, w: 1, d: z1 - z0 },
  ].forEach(({ x, z, w, d }) => kit.barrier({ w, d }).at(x, 0, z));
}
