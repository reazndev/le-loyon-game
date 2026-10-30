import { dialogues, type NodeId } from '../../content';
import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { playNode } from '../forest_path/play';
import { bedOf, CHASSOT_BEDS, chassotGrave, GRAVE_FOOT, graves, type Bed, type Grave, type Rect } from './layout';

const STONE_TEXTURE = { granite: 'gravestone_granite', sandstone: 'gravestone_sandstone' } as const;
const STONE_COLOR = { granite: 0x8a8a88, sandstone: 0xa49c8c } as const;
const CURB = 0x7c7b78;

export interface GraveHandlers {
  /** True while the reporter has the shovel on the night of the dig. Graves then offer "Dig". */
  digging: () => boolean;
  dig: (grave: Grave) => Promise<void>;
  read: (grave: Grave) => Promise<void>;
  /** Whether Daniel's lantern burns tonight. */
  lanternLit: boolean;
}

/**
 * Reads a grave: the inscription, then whatever the reporter notices. Sets the read flags for
 * the three graves that matter.
 */
export async function readGrave(ctx: SceneContext, grave: Grave): Promise<void> {
  const { state } = ctx;
  if (grave === chassotGrave) {
    const first = !state.hasFlag('read_grave_chassot');
    await ctx.readDocument('grave_chassot');
    await playNode(ctx, first ? 'grave_chassot_look' : 'grave_chassot_look_again');
    return;
  }
  if (!grave.doc) return;
  await ctx.readDocument(grave.doc);
  if (grave.doc === 'grave_menoud') {
    state.setFlag('read_grave_menoud');
    if (state.time === 'night') await playNode(ctx, lanternNode(state.count('night')));
  } else if (grave.doc === 'grave_gremaud') {
    state.setFlag('read_grave_gremaud');
  }
  const look = `${grave.doc}_look`;
  if (look in dialogues) await playNode(ctx, look as NodeId);
}

/** Night 1 and 3 the lantern burns; night 2 it's dark. Unset nights read as the first. */
const lanternNode = (night: number): NodeId =>
  night === 2 ? 'grave_menoud_lantern_dark' : night >= 3 ? 'grave_menoud_lantern_night3' : 'grave_menoud_lantern';

/** Every grave on the hill: stones, curbs, beds, lanterns, and the one interaction each offers. */
export function graveStones(kit: LevelKit, handlers: GraveHandlers): { windmill: () => void } {
  let spin = () => undefined as void;
  graves.forEach((grave) => {
    if (grave === chassotGrave) return chassotPlot(kit, handlers);
    stone(kit, grave);
    if (grave.kind === 'flat') bedFill(kit, { x: grave.x, z: grave.z + 0.85, w: 1.1, d: 1.7 }, 'gravel');
    else curbedBed(kit, bedOf(grave), grave.bed);
    if (grave.lantern) lantern(kit, grave, grave.doc === 'grave_menoud' && handlers.lanternLit);
    if (grave.doc === 'grave_bapst_lea') spin = windmill(kit, grave);
    kit
      .hotspot({
        prompt: () => (handlers.digging() ? 'Dig' : 'Read the stone'),
        enabled: () => handlers.digging() || grave.doc !== undefined,
        radius: 1.3,
        onInteract: () => (handlers.digging() ? handlers.dig(grave) : handlers.read(grave)),
      })
      .at(grave.x, 0, grave.z + 0.6);
  });
  return { windmill: spin };
}

function stone(kit: LevelKit, grave: Grave): void {
  const texture = STONE_TEXTURE[grave.stone];
  const color = STONE_COLOR[grave.stone];
  const { x, z, w, h } = grave;
  if (grave.kind === 'iron_cross') return ironCross(kit, x, z, h);
  if (grave.kind === 'wood_cross') return woodCross(kit, x, z, h);
  if (grave.kind === 'flat') {
    // Odile's stone: new, sharp-edged, pale, lying flat in the gravel, with fresh chrysanthemums.
    kit.box({ w: 0.9, h: 0.12, d: 0.62 }).texture('gravestone_sandstone', { tile: 0.8 }).color(0xc4beb0).at(x, 0.02, z + 0.4).collider();
    kit.box({ w: 0.6, h: 0.01, d: 0.3 }).color(0x8a8478).at(x, 0.14, z + 0.4);
    kit.cylinder({ r: 0.1, h: 0.16, sides: 6 }).color(0x6a4a3a).at(x + 0.3, 0.06, z + 1.25);
    [-0.05, 0.04, 0.0].forEach((dx, i) => kit.box({ w: 0.09, h: 0.08, d: 0.09 }).color(0xd6d4cc).at(x + 0.3 + dx, 0.2 + i * 0.03, z + 1.25 + (i - 1) * 0.04));
    return;
  }
  const capped = grave.kind === 'peaked' ? 0.16 : 0;
  kit.box({ w: w + 0.14, h: 0.12, d: 0.3 }).texture(texture, { tile: 0.8 }).color(color - 0x0a0a0a).at(x, 0, z);
  kit.box({ w, h: h - capped, d: 0.17 }).texture(texture, { tile: 0.9 }).color(color).at(x, 0.1, z).collider();
  if (capped) kit.gable({ w, d: 0.17, h: capped }).texture(texture, { tile: 0.9 }).color(color).at(x, 0.1 + h - capped, z);
  // The lettering reads as a darker panel at this distance.
  kit.box({ w: w * 0.7, h: h * 0.4, d: 0.01 }).texture(texture, { tile: 0.5 }).color(color - 0x303030).at(x, 0.1 + h * 0.3, z + 0.09);
  if (grave.doc === 'grave_menoud') kit.box({ w: 0.1, h: 0.13, d: 0.012 }).color(0xd8d2c2).at(x, 0.1 + h * 0.76, z + 0.092);
}

function ironCross(kit: LevelKit, x: number, z: number, h: number): void {
  kit.box({ w: 0.36, h: 0.14, d: 0.26 }).texture('gravestone_granite', { tile: 0.6 }).color(0x7a7a78).at(x, 0, z).collider();
  kit.box({ w: 0.05, h, d: 0.05 }).texture('rust_metal', { tile: 0.5 }).color(0x4a3e36).at(x, 0.12, z);
  kit.box({ w: 0.44, h: 0.05, d: 0.05 }).texture('rust_metal', { tile: 0.5 }).color(0x4a3e36).at(x, 0.12 + h * 0.7, z);
  kit.box({ w: 0.14, h: 0.1, d: 0.01 }).color(0xa8a290).at(x, 0.12 + h * 0.45, z + 0.03);
}

function woodCross(kit: LevelKit, x: number, z: number, h: number): void {
  kit.box({ w: 0.06, h, d: 0.05 }).texture('wood_planks', { tile: 0.5 }).color(0xd2cec4).at(x, 0, z).collider();
  kit.box({ w: 0.34, h: 0.06, d: 0.05 }).texture('wood_planks', { tile: 0.5 }).color(0xd2cec4).at(x, h * 0.68, z);
  // The ceramic angel at the foot of the cross.
  kit.box({ w: 0.11, h: 0.16, d: 0.08 }).color(0xe0ddd4).at(x - 0.2, 0.06, z + 0.3);
  kit.box({ w: 0.07, h: 0.07, d: 0.07 }).color(0xe8e4dc).at(x - 0.2, 0.22, z + 0.3);
}

/** Léa's plastic windmill. It turns with no wind; there's a draft through the wall. */
function windmill(kit: LevelKit, grave: Grave): () => void {
  const x = grave.x + 0.25;
  const z = grave.z + 1.2;
  kit.box({ w: 0.015, h: 0.42, d: 0.015 }).color(0x8a8a80).at(x, 0, z);
  const blades = kit.group((g) => {
    g.box({ w: 0.26, h: 0.035, d: 0.01 }).color(0xa04a3e).at(0, -0.017, 0);
    g.box({ w: 0.035, h: 0.26, d: 0.01 }).color(0xb8a24a).at(0, -0.13, 0);
  }).at(x, 0.42, z + 0.02);
  return () => {
    blades.object.rotation.z += 0.02;
  };
}

function lantern(kit: LevelKit, grave: Grave, lit: boolean): void {
  const x = grave.x + (grave.doc === 'grave_menoud' ? -0.28 : 0.3);
  const z = grave.z + 1.75;
  const glass = grave.doc === 'grave_menoud' || grave.x > 0 ? 0x7a2420 : 0x8a8478;
  kit.box({ w: 0.12, h: 0.2, d: 0.12 }).color(lit ? 0xd04a30 : glass).emissive(lit ? 0x6a1808 : 0x000000).at(x, 0.06, z);
  kit.box({ w: 0.15, h: 0.04, d: 0.15 }).texture('rust_metal').color(0x8a7040).at(x, 0.26, z);
  if (!lit) return;
  kit.box({ w: 0.04, h: 0.06, d: 0.04 }).unlit().color(0xffc070).at(x, 0.12, z);
  kit.glow(0.9, 0xff6a3a).at(x, 0.17, z);
  kit.light({ color: 0xff5a30, intensity: 1.7, range: 5.5 }).flicker(0.35).at(x, 0.35, z);
}

function curbedBed(kit: LevelKit, bed: Rect, fill: Bed, plants = true): void {
  const { x, z, w, d } = bed;
  kit.box({ w: w + 0.08, h: 0.1, d: 0.08 }).texture('gravestone_granite', { tile: 0.6 }).color(CURB).at(x, 0, z + d / 2);
  kit.box({ w: 0.08, h: 0.1, d }).texture('gravestone_granite', { tile: 0.6 }).color(CURB).at(x - w / 2, 0, z);
  kit.box({ w: 0.08, h: 0.1, d }).texture('gravestone_granite', { tile: 0.6 }).color(CURB).at(x + w / 2, 0, z);
  bedFill(kit, bed, fill, plants);
}

export function bedFill(kit: LevelKit, bed: Rect, fill: Bed, plants = true): void {
  const { x, z, w, d } = bed;
  const texture = fill === 'gravel' ? 'gravel_path' : fill === 'grass' ? 'grass_dead' : 'grave_dirt';
  const color = fill === 'gravel' ? 0x9a968c : fill === 'grass' ? 0x6e725e : 0x6a5e52;
  kit.plane({ w: w - 0.06, d: d - 0.06, cell: 0.5 }).texture(texture, { tile: 1 }).color(color).at(x, 0.06, z).walkable(fill === 'gravel' ? 'gravel' : 'grass');
  if (!plants) return;
  if (fill === 'heather') {
    [-0.25, 0.2].forEach((dz, i) => kit.sprite('bush', { w: 0.42, h: 0.3 }).color(0x6a5262).at(x + (i ? 0.12 : -0.1), 0.05, z + dz));
  } else if (fill === 'flowers') {
    [0x9a4a44, 0xc8c2b4, 0xa89848].forEach((c, i) => kit.box({ w: 0.12, h: 0.14, d: 0.12 }).color(c).at(x - 0.22 + i * 0.22, 0.06, z - 0.3 + (i % 2) * 0.25));
  }
}

/** The Chassot family plot: one dark stone with a green bronze cross over two beds. */
function chassotPlot(kit: LevelKit, handlers: GraveHandlers): void {
  const { x, z, w, h } = chassotGrave;
  kit.box({ w: w + 0.16, h: 0.14, d: 0.34 }).texture('gravestone_granite', { tile: 0.9 }).color(0x56565a).at(x, 0, z);
  kit.box({ w, h, d: 0.24 }).texture('gravestone_granite', { tile: 1 }).color(0x5e5e62).at(x, 0.12, z).collider();
  // Two panels of old lettering and one sharper line under the left one, cut in 1995.
  const lettering = (w: number, h: number, dx: number, y: number, color: number) =>
    kit.box({ w, h, d: 0.01 }).texture('gravestone_granite', { tile: 0.5 }).color(color).at(x + dx, y, z + 0.125);
  lettering(0.8, 0.42, -0.6, 0.55, 0x38383c);
  lettering(0.8, 0.42, 0.6, 0.55, 0x38383c);
  lettering(0.7, 0.1, -0.6, 0.34, 0x2c2c30);
  kit.box({ w: 0.07, h: 0.5, d: 0.07 }).color(0x4e6a5c).at(x, 0.12 + h, z);
  kit.box({ w: 0.3, h: 0.07, d: 0.07 }).color(0x4e6a5c).at(x, 0.12 + h + 0.32, z);

  const { marc, therese } = CHASSOT_BEDS;
  const outer: Rect = { x, z: marc.z, w: therese.x + therese.w / 2 - (marc.x - marc.w / 2), d: marc.d };
  [
    { w: outer.w + 0.1, d: 0.1, x, z: outer.z + outer.d / 2 },
    { w: 0.1, d: outer.d, x: outer.x - outer.w / 2, z: outer.z },
    { w: 0.1, d: outer.d, x: outer.x + outer.w / 2, z: outer.z },
    { w: 0.08, d: outer.d, x, z: outer.z },
  ].forEach((c) => kit.box({ w: c.w, h: 0.12, d: c.d }).texture('gravestone_granite', { tile: 0.6 }).color(CURB).at(c.x, 0, c.z));
  bedFill(kit, therese, 'heather');
  // Two boot prints in the gravel at the foot of Marc's side, pressed deep.
  [-0.13, 0.13].forEach((dx) => kit.plane({ w: 0.11, d: 0.27 }).color(0x3a3630).at(GRAVE_FOOT.x + dx, 0.03, GRAVE_FOOT.z + 0.05));

  kit
    .hotspot({ prompt: 'Read the stone', enabled: () => !handlers.digging(), radius: 1.3, onInteract: () => handlers.read(chassotGrave) })
    .at(x, 0, z + 0.6);
  kit
    .hotspot({ prompt: 'Dig', enabled: handlers.digging, radius: 0.5, onInteract: () => handlers.dig(chassotGrave) })
    .at(therese.x, 0, therese.z);
}
