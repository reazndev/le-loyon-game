import { ConeGeometry } from 'three';
import type { MeshBuilder } from '../../game/kit/builders';
import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { playNode } from '../forest_path/play';
import { gremaudHouse, type GremaudHouse } from '../house_gremaud/house';
import { house, palette, woodpile, type HouseSpec, type WindowLook, type WindowSlot } from './houses';
import { CHURCH, GARAGE, GREMAUD, GREMAUD_GATE, HOUSE_1, HOUSE_2, INN, INN_DOOR, LAITERIE } from './layout';
import { milkCan, smallCar, tractor, tyres, wheel } from './props';

/**
 * The buildings round the square: the church front, the inn, the Gremaud house, the laiterie,
 * the garage, the two houses with a door the reporter can try, and the farms behind them.
 */

/** A strip of painted lettering over a shop front: a pale band with a dark line of letters. */
function lettering(kit: LevelKit, w: number, letters: number, color = 0x2a2620) {
  return kit.group((g) => {
    g.box({ w, h: 0.42, d: 0.04 }).color(0xc8c4b8);
    const step = (w - 0.6) / letters;
    // Two strokes per letter, of uneven heights, read as painted capitals from a few meters off.
    for (let i = 0; i < letters; i++) {
      const x = -w / 2 + 0.3 + step * (i + 0.5);
      g.box({ w: step * 0.16, h: 0.24, d: 0.05 }).color(color).at(x - step * 0.18, 0.09, 0);
      g.box({ w: step * 0.16, h: 0.16 + ((i * 7) % 3) * 0.04, d: 0.05 }).color(color).at(x + step * 0.14, 0.09, 0);
      g.box({ w: step * 0.4, h: 0.04, d: 0.05 }).color(color).at(x, 0.09 + ((i * 5) % 3) * 0.1, 0);
    }
  });
}

export interface ChurchFront {
  /** The tower's bell, for the hour. */
  bell: { x: number; y: number; z: number };
}

/** The church of Saint-Maurice seen from the square: the tower over the main door, the nave behind. */
export function churchFront(kit: LevelKit, ctx: SceneContext, night: boolean): ChurchFront {
  const plaster = 0xb6b4ac;
  const tower = CHURCH.tower;
  const towerZ = CHURCH.front - tower / 2;
  const naveZ = CHURCH.front - tower + 0.2 - CHURCH.d / 2;
  kit.box({ w: CHURCH.w, h: 8.5, d: CHURCH.d, cell: 2 }).texture('plaster_wall', { tile: 3 }).color(plaster).at(CHURCH.x, 0, naveZ).collider();
  kit.gable({ w: CHURCH.w + 0.8, d: CHURCH.d + 0.6, h: 4.4 }).texture('roof_shingles', { tile: 2 }).color(0x58565a).at(CHURCH.x, 8.5, naveZ).rotY(90).doubleSided();
  kit.box({ w: CHURCH.w + 0.3, h: 0.6, d: CHURCH.d + 0.3 }).texture('church_stone', { tile: 1.5 }).color(0x8e8c86).at(CHURCH.x, 0, naveZ);
  [-1, 1].forEach((side) =>
    [-4, -11, -18].forEach((dz) =>
      kit
        .box({ w: 0.06, h: 3.2, d: 1.1 })
        .texture('window_dark', { tile: [1.1, 3.2] })
        .color(0x6a7078)
        .at(CHURCH.x + side * (CHURCH.w / 2 + 0.02), 3.2, CHURCH.front - tower + dz),
    ),
  );

  // The tower: a stone foot with the door, plaster above, the clock, the belfry, a slate spire.
  kit.box({ w: tower, h: 3.6, d: tower }).texture('church_stone', { tile: 1.6 }).color(0x9a988f).at(CHURCH.x, 0, towerZ).collider();
  kit.box({ w: tower - 0.2, h: 13.4, d: tower - 0.2, cell: 2 }).texture('plaster_wall', { tile: 3 }).color(plaster).at(CHURCH.x, 3.6, towerZ);
  kit.box({ w: tower + 0.1, h: 0.3, d: tower + 0.1 }).texture('church_stone', { tile: 1 }).color(0x9a988f).at(CHURCH.x, 17, towerZ);
  [0, 90, 180, 270].forEach((yaw) =>
    kit
      .group((face) => {
        wheel(face, 0.8, 0.05, 0xd8d4c8).at(0, 0, 0.03).rotY(90);
        face.box({ w: 0.06, h: 0.6, d: 0.04 }).color(0x1a1a18).at(0, 0, 0.08);
        face.box({ w: 0.45, h: 0.06, d: 0.04 }).color(0x1a1a18).at(0.2, 0.0, 0.08);
      })
      .at(CHURCH.x + Math.sin((yaw * Math.PI) / 180) * (tower / 2), 12.6, towerZ + Math.cos((yaw * Math.PI) / 180) * (tower / 2))
      .rotY(yaw),
  );
  [0, 90, 180, 270].forEach((yaw) => {
    const r = tower / 2 - 0.08;
    kit
      .box({ w: 0.8, h: 1.8, d: 0.06 })
      .color(0x1a1a1c)
      .at(CHURCH.x + Math.sin((yaw * Math.PI) / 180) * r, 14.6, towerZ + Math.cos((yaw * Math.PI) / 180) * r)
      .rotY(yaw);
  });
  kit
    .mesh(new ConeGeometry(tower * 0.62, 9, 8).translate(0, 4.5, 0))
    .texture('roof_shingles', { tile: 1.5 })
    .color(0x4e5054)
    .at(CHURCH.x, 17.3, towerZ);
  kit.box({ w: 0.08, h: 1.6, d: 0.08 }).color(0x3a3a38).at(CHURCH.x, 26.2, towerZ);
  kit.box({ w: 0.6, h: 0.08, d: 0.08 }).color(0x3a3a38).at(CHURCH.x, 27.1, towerZ);

  // The main door: steps, an arch of dark stone, the double door. Locked at night.
  kit.box({ w: 2.8, h: 0.18, d: 1.4 }).texture('church_stone', { tile: 1 }).color(0x8e8c84).at(CHURCH.x, 0, CHURCH.front + 0.7).walkable('stone');
  kit.box({ w: 2.2, h: 3.3, d: 0.08 }).texture('church_stone', { tile: 1 }).color(0x6a6862).at(CHURCH.x, 0.18, CHURCH.front + 0.02);
  kit
    .box({ w: 1.6, h: 2.8, d: 0.08 })
    .texture('door_wood', { tile: [0.8, 2.8] })
    .color(0x8a7a68)
    .at(CHURCH.x, 0.18, CHURCH.front + 0.08)
    .interact({ prompt: 'Open the door', radius: 1, onInteract: () => (night ? playNode(ctx, 'church_locked') : ctx.goTo('church', 'from_square')) });
  return { bell: { x: CHURCH.x, y: 15, z: towerZ } };
}

export interface Presbytery {
  /** The abbé's lit window upstairs at night, if it is lit. */
  lamp: MeshBuilder | null;
}

/** The presbytery beside the church, where the abbé's lamp burns late (church_locked). */
export function presbytery(kit: LevelKit, night: boolean): Presbytery {
  const parts: { lamp?: MeshBuilder } = {};
  house(kit, {
    w: 8,
    d: 8,
    floors: 2,
    front: [-2.4, 0, 2.4],
    sides: [-1.8, 1.8],
    doors: [0],
    wall: palette.renderGrey,
    shutter: palette.shutterBrown,
    window: ({ face, floor, col }) => (face === 'front' && floor === 1 && col === 2 ? 'lit' : night ? 'dark' : face === 'front' && floor === 0 && col === 0 ? 'lit' : 'dark'),
    capture: (_, part) => (parts.lamp = part),
    glow: night,
  })
    .at(CHURCH.w / 2 + 6, 0, CHURCH.front - 9)
    .rotY(-90);
  return { lamp: parts.lamp ?? null };
}

/** The Auberge de la Croix-Blanche: green shutters, the hanging sign, the café lit by day. */
export function inn(kit: LevelKit, night: boolean): void {
  // Yannick's room is the last window upstairs, looking onto the square.
  const look = ({ face, floor, col }: WindowSlot): WindowLook => {
    if (face !== 'front') return night || floor > 0 ? 'dark' : 'lit';
    if (floor === 1 && col === 3) return night ? 'lit' : 'dark';
    if (night) return 'dark';
    return floor === 0 ? 'lit' : col === 0 ? 'shut' : 'dark';
  };
  const front = INN.x - INN.d / 2;
  house(kit, {
    w: INN.w,
    d: INN.d,
    floors: 2,
    front: [-4.8, -1.2, 1.6, 4.4],
    sides: [-2.8, 2],
    back: [-4, 0, 4],
    doors: [INN_DOOR.z - INN.z],
    wall: palette.renderWarm,
    shutter: palette.shutterGreen,
    roof: palette.roof,
    roofHeight: 4.6,
    window: look,
    glow: night,
  })
    .at(INN.x, 0, INN.z)
    .rotY(INN.yaw);
  lettering(kit, 7.6, 18).at(front - 0.05, 2.75, INN.z + 0.3).rotY(-90);
  // The hanging sign: a white cross on red, on an iron arm.
  kit.box({ w: 1.2, h: 0.05, d: 0.05 }).color(0x2a2826).at(front - 0.6, 3.9, INN_DOOR.z + 1.6);
  kit.group((sign) => {
    sign.box({ w: 0.8, h: 0.85, d: 0.04 }).color(0x8e2c26);
    sign.box({ w: 0.14, h: 0.5, d: 0.05 }).color(0xd8d4c8).at(0, 0.17, 0);
    sign.box({ w: 0.5, h: 0.14, d: 0.05 }).color(0xd8d4c8).at(0, 0.35, 0);
  }).at(front - 0.8, 2.95, INN_DOOR.z + 1.6);
  // The terrace: two tables and their chairs stacked for winter, and a woodpile at the side.
  [1.2, 3.4].forEach((z) => {
    kit.cylinder({ r: 0.4, h: 0.72, sides: 8 }).color(0x5a5a56).at(front - 1.6, 0, z).collider();
    kit.box({ w: 0.45, h: 0.9, d: 0.45 }).color(0x6a6a64).at(front - 2.5, 0, z + 0.2);
  });
  woodpile(kit, 4).at(INN.x - 1, 0, INN.z - INN.w / 2 - 0.4).rotY(180);
  kit.door({ to: 'inn', spawn: 'from_square', prompt: 'Go in' }).at(front - 0.25, 0.16, INN_DOOR.z).rotY(-90);
}

/** The Gremaud house beside the inn, with its garden wall and the gate to the doorstep. */
export function gremaud(kit: LevelKit, night: boolean): GremaudHouse {
  const home = gremaudHouse(kit, ({ face, floor }) => (!night && face === 'right' && floor === 0 ? 'lit' : 'dark'));
  home.group.at(GREMAUD.x, 0, GREMAUD.z).rotY(GREMAUD.yaw);
  const wallX = GREMAUD_GATE.x;
  [
    [GREMAUD_GATE.z - 3.4, 5.4],
    [GREMAUD_GATE.z + 3.4, 5.4],
  ].forEach(([z, d]) => kit.box({ w: 0.35, h: 0.55, d: d! }).texture('stone_wall', { tile: 1 }).color(0x9c9a92).at(wallX, 0, z!).collider());
  kit.box({ w: 0.03, h: 0.75, d: 4.6 }).texture('iron_fence', { tile: [1, 0.75] }).cutout().doubleSided().color(0x3a3a38).at(wallX, 0.55, GREMAUD_GATE.z - 3.5);
  kit.box({ w: 0.03, h: 0.75, d: 4.6 }).texture('iron_fence', { tile: [1, 0.75] }).cutout().doubleSided().color(0x3a3a38).at(wallX, 0.55, GREMAUD_GATE.z + 3.5);
  return home;
}

/** The laiterie: a low building with a loading ramp of milk cans, open until six. */
export function laiterie(kit: LevelKit, night: boolean): void {
  const front = LAITERIE.x + LAITERIE.d / 2;
  const spec: HouseSpec = {
    w: LAITERIE.w,
    d: LAITERIE.d,
    floors: 2,
    front: [-3.4, 0, 3.4],
    sides: [-2, 2],
    doors: [0],
    wall: palette.render,
    shutter: palette.shutterBrown,
    roof: palette.roofDark,
    window: ({ face, floor, col }) => (night ? (face === 'back' && floor === 1 && col === 0 ? 'lit' : 'dark') : face === 'front' && floor === 0 ? 'lit' : 'dark'),
    back: [-2.4, 2.4],
  };
  house(kit, spec).at(LAITERIE.x, 0, LAITERIE.z).rotY(LAITERIE.yaw);
  lettering(kit, 5, 8).at(front + 0.05, 2.8, LAITERIE.z).rotY(90);
  kit.door({ to: 'laiterie', spawn: 'from_square', prompt: 'Go in', locked: () => night, lockedText: 'Closed. The shop shuts at six.' }).at(front + 0.25, 0.16, LAITERIE.z).rotY(90);
  // The milk ramp on the south end, the height of a trailer bed.
  kit.box({ w: 2.2, h: 0.9, d: 3.2 }).texture('concrete_floor', { tile: 1.5 }).color(0x8e8c86).at(front + 1.1, 0, LAITERIE.z + 3.6).collider();
  [
    [-0.5, -1],
    [0.1, -0.9],
    [0.6, -1.1],
    [-0.3, 0.2],
    [0.4, 0.4],
    [0.2, 1.1],
  ].forEach(([dx, dz], i) => milkCan(kit, i * 37).at(front + 1.1 + dx!, 0.9, LAITERIE.z + 3.6 + dz!));
  tractor(kit).at(front + 3.4, 0, LAITERIE.z + 6.8).rotY(-20);
}

/** Garage Dousse: the workshop doors half open on a lit bench, a Fiat outside, a stack of tyres. */
export function garage(kit: LevelKit, night: boolean): void {
  const front = GARAGE.x - GARAGE.d / 2;
  kit.box({ w: GARAGE.d, h: 4.4, d: GARAGE.w, cell: 1.5 }).texture('render_wall', { tile: 3 }).color(palette.renderGrey).at(GARAGE.x, 0, GARAGE.z).collider();
  kit.gable({ w: GARAGE.w + 1.2, d: GARAGE.d + 1.2, h: 2 }).texture('roof_tiles', { tile: 2 }).color(palette.roofDark).at(GARAGE.x, 4.4, GARAGE.z).rotY(90).doubleSided();
  // The workshop door: a dark opening with a lit bench at the back, by day.
  kit.box({ w: 0.06, h: 3, d: 3.6 }).color(night ? 0x0c0c0c : 0x24221e).at(front - 0.02, 0, GARAGE.z - 2.4);
  if (!night) kit.box({ w: 0.04, h: 0.3, d: 2.6 }).color(0xd8d4b0).unlit().at(front - 0.05, 2.4, GARAGE.z - 2.4);
  kit.box({ w: 0.08, h: 3, d: 1.9 }).texture('rust_metal', { tile: 1.5 }).color(0x6a6a64).at(front - 0.06, 0, GARAGE.z - 3.4);
  lettering(kit, 6, 12, 0x6a1a14).at(front - 0.05, 3.5, GARAGE.z).rotY(-90);
  kit.box({ w: 0.06, h: 1.25, d: 0.95 }).texture(night ? 'window_dark' : 'window_lit', { tile: [0.95, 1.25] }).color(night ? 0x9a9c9e : palette.litDay).at(front - 0.03, 1.2, GARAGE.z + 3.2);
  kit.door({ to: 'garage_dousse', spawn: 'from_square', prompt: 'Go in', locked: () => night, lockedText: 'Locked. The workshop is dark.' }).at(front - 0.08, 0, GARAGE.z + 1.4).rotY(-90);
  // An old petrol pump, the kind with a round glass head.
  kit.box({ w: 0.5, h: 1.6, d: 0.4 }).color(0x8a8a82).at(front - 1.4, 0, GARAGE.z + 4.4).collider();
  kit.cylinder({ r: 0.24, h: 0.4, sides: 8 }).color(0xb8b0a0).at(front - 1.4, 1.6, GARAGE.z + 4.4);
  smallCar(kit, 0x8e8a78).at(front - 2.2, 0, GARAGE.z - 6.4).rotY(10);
  tyres(kit, 4).at(front - 0.6, 0, GARAGE.z + 4.8);
  tyres(kit, 2).at(front - 0.9, 0, GARAGE.z + 5.6);
}

export interface HouseTwo {
  /** The lit window upstairs whose light goes off as the reporter comes close. */
  upstairs: MeshBuilder | null;
}

/** The two houses with a door to try: the one with the television, and the one with the bicycle. */
export function doorHouses(kit: LevelKit, ctx: SceneContext, night: boolean): HouseTwo {
  house(kit, {
    w: HOUSE_1.w,
    d: HOUSE_1.d,
    floors: 2,
    front: [-2.8, 0, 2.8],
    sides: [-2, 2],
    doors: [0],
    wall: palette.renderGrey,
    shutter: palette.shutterRed,
    gableFront: true,
    gable: 'boards',
    // The television's blue-grey glow on the ground floor, by day and by night.
    window: ({ face, floor, col }) => (face === 'front' && floor === 0 && col === 2 ? 'lit' : night ? 'shut' : 'dark'),
  })
    .at(HOUSE_1.x, 0, HOUSE_1.z)
    .rotY(HOUSE_1.yaw);
  kit.hotspot({ prompt: 'Knock', radius: 0.8, onInteract: () => playNode(ctx, 'door_house_1') }).at(HOUSE_1.x + HOUSE_1.d / 2 + 0.6, 0, HOUSE_1.z);
  woodpile(kit, 5).at(HOUSE_1.x, 0, HOUSE_1.z - HOUSE_1.w / 2 - 0.4).rotY(180);

  const parts: { upstairs?: MeshBuilder } = {};
  house(kit, {
    w: HOUSE_2.w,
    d: HOUSE_2.d,
    floors: 2,
    front: [-2.8, 0, 2.8],
    sides: [-1.8, 1.8],
    doors: [0],
    wall: palette.render,
    shutter: palette.shutterGreen,
    window: ({ face, floor, col }) => (face === 'front' && floor === 1 && col === 0 && !night ? 'lit' : 'dark'),
    capture: (_, part) => (parts.upstairs = part),
  })
    .at(HOUSE_2.x, 0, HOUSE_2.z)
    .rotY(HOUSE_2.yaw);
  kit
    .hotspot({ prompt: 'Knock', radius: 0.8, onInteract: () => playNode(ctx, night ? 'door_house_2_night' : 'door_house_2') })
    .at(HOUSE_2.x, 0, HOUSE_2.z - HOUSE_2.d / 2 - 0.6);
  return { upstairs: parts.upstairs ?? null };
}

/** Farms and houses further out, mostly in the fog: lit kitchens by day, nearly all dark at night. */
export function outlyingHouses(kit: LevelKit, night: boolean): void {
  const lit = (slots: string[]) => (slot: WindowSlot): WindowLook => {
    const key = `${slot.face}:${slot.floor}:${slot.col}`;
    if (slots.includes(key)) return night ? 'dark' : 'lit';
    return night && slot.floor === 0 ? 'shut' : 'dark';
  };
  const farm = (x: number, z: number, yaw: number, litSlots: string[], wall: number = palette.render) => {
    house(kit, {
      w: 10,
      d: 9,
      floors: 2,
      front: [-3.2, 0, 3.2],
      sides: [-2.4, 2.4],
      back: [-2.4, 2.4],
      gableFront: true,
      gable: 'boards',
      wall,
      shutter: palette.shutterGreen,
      window: lit(litSlots),
    })
      .at(x, 0, z)
      .rotY(yaw);
    // The barn under the same ridge, behind the house: grey boards and a big door.
    kit
      .group((b) => {
        b.box({ w: 10, h: 6.8, d: 12 }).texture('wood_planks', { tile: 2.4 }).color(0x6a5e52).collider();
        b.gable({ w: 12, d: 11.2, h: 4.4 }).texture('roof_tiles', { tile: 2 }).color(palette.roofDark).at(0, 6.8, 0).rotY(90).doubleSided();
        b.box({ w: 3.4, h: 3.6, d: 0.06 }).texture('wood_planks', { tile: 1.6 }).color(0x4e463e).at(-5.03, 0, 0).rotY(90);
      })
      .at(x - Math.sin((yaw * Math.PI) / 180) * 10.5, 0, z - Math.cos((yaw * Math.PI) / 180) * 10.5)
      .rotY(yaw);
  };
  farm(-35, -6, 90, ['front:0:0']);
  farm(-34, 26, 180, ['right:0:1'], palette.renderWarm);
  farm(24, 44, -90, ['front:0:2']);

  const small = (x: number, z: number, yaw: number, litSlots: string[]) =>
    house(kit, {
      w: 8,
      d: 7,
      floors: 2,
      front: [-2.2, 0, 2.2],
      sides: [-1.4, 1.4],
      doors: [0],
      wall: palette.render,
      shutter: palette.shutterBrown,
      window: lit(litSlots),
    })
      .at(x, 0, z)
      .rotY(yaw);
  small(25, -19, -90, ['front:0:0', 'front:1:2']);
  small(-11, 42, 90, ['front:0:2']);
  small(-22, -27, 90, []);
}
