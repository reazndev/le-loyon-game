import type { SoundHandle } from '../../engine/audio/audioManager';
import { cat, everyFrame } from '../../game/ambient';
import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { house, palette } from '../village_square/houses';
import { bench, flowerBox } from '../village_square/props';
import { purring } from './sounds';

/**
 * Germaine Kolly's house across the road from the farm (A7): whitewash and green shutters, a
 * stable door with its top half open and the old woman leaning on the bottom half, watching.
 * At night the top half is shut and one window is lit. Once Minet is home he sits on her sill.
 */

/** The house's middle; its front faces north, to the road. */
const KOLLY = { x: 14, z: 14, w: 8, d: 7 };
const FRONT = KOLLY.z - KOLLY.d / 2;
/** The stable door, in a shallow porch so she can stand in it in front of the wall. */
export const KOLLY_DOOR = { x: 13.6, z: FRONT - 0.2 };
/** Tabby with white socks. */
export const MINET_FUR = 0x8a6c48;

export function kollyHouse(kit: LevelKit, ctx: SceneContext, night: boolean): void {
  const minetHome = ctx.state.hasFlag('minet_returned');
  kit.batch((still) => {
    house(still, {
      ...KOLLY,
      floors: 2,
      front: [-2.5, 2.5],
      sides: [0],
      back: [0],
      wall: palette.white,
      shutter: palette.shutterGreen,
      roof: palette.roof,
      // The window right of the door, where the cat sits, is the one lit at night.
      window: ({ face, floor, col }) => (night && face === 'front' && floor === 0 && col === 0 ? 'lit' : 'dark'),
      glow: true,
    })
      .at(KOLLY.x, 0, KOLLY.z)
      .rotY(180);
    stableDoor(still, night);
    bench(still).at(15.2, 0, FRONT - 0.3).rotY(180);
    flowerBox(still, 1).at(11.5, 1.32, FRONT - 0.14);
    // A saucer by the door for a cat who hasn't come home.
    still.cylinder({ r: 0.08, h: 0.02, sides: 8 }).color(0xc8c4b8).at(14.35, 0, FRONT - 0.45);
  });
  if (minetHome) {
    kit.box({ w: 0.5, h: 0.04, d: 0.3 }).texture('wood_planks', { tile: 0.5 }).color(0x8a8478).at(16.5, 1.36, FRONT - 0.14);
    minet(kit, ctx, { x: 16.5, y: 1.4, z: FRONT - 0.16, yaw: 0 });
  }
  if (!night) kit.npc('germaine').at(KOLLY_DOOR.x, 0, KOLLY_DOOR.z + 0.02).faceYaw(0).watch(5).talk('germaine');
}

/** Minet: the cat model in tabby, with white socks. Returns both, to hide him when he is picked up. */
export function minet(kit: LevelKit, ctx: SceneContext, at: { x: number; y: number; z: number; yaw: number }) {
  const body = cat(kit, ctx, at, MINET_FUR);
  const socks = kit
    .group((g) => [-0.04, 0.04].forEach((x) => g.box({ w: 0.035, h: 0.03, d: 0.045 }).color(0xe0dcd0).at(x, 0, -0.1)))
    .at(at.x, at.y, at.z)
    .rotY(at.yaw)
    .dynamic();
  return [body, socks];
}

/** A purr against the reporter's coat for as long as they carry Minet. */
export function purrWhileCarried(kit: LevelKit, ctx: SceneContext): void {
  let purr: SoundHandle | null = null;
  kit.use((k) => k.world.sounds.track({ stop: () => purr?.stop(0.3) }));
  everyFrame(kit, () => {
    const carrying = ctx.state.hasItem('minet');
    if (carrying && !purr) purr = purring(ctx.audio);
    if (!carrying && purr) {
      purr.stop(1);
      purr = null;
    }
  });
}

/**
 * The stable door in a porch of rendered jambs: the bottom half shut, the top half open on the
 * dark hall by day and shut at night.
 */
function stableDoor(kit: LevelKit, night: boolean): void {
  const { x } = KOLLY_DOOR;
  const back = FRONT;
  const face = FRONT - 0.42;
  [-0.6, 0.6].forEach((dx) => kit.box({ w: 0.16, h: 2.35, d: 0.44 }).texture('render_wall', { tile: 2 }).color(palette.white).at(x + dx, 0, back - 0.21).collider());
  kit.box({ w: 1.36, h: 0.2, d: 0.44 }).texture('render_wall', { tile: 2 }).color(palette.white).at(x, 2.25, back - 0.21);
  kit.box({ w: 1.04, h: 2.2, d: 0.02 }).color(0x16130f).unlit().at(x, 0.05, back - 0.02);
  kit.box({ w: 1.5, h: 0.14, d: 0.6 }).texture('stone_wall', { tile: 1 }).color(0x96948c).at(x, 0, face - 0.25).walkable('stone');
  kit.box({ w: 1.04, h: 0.86, d: 0.06 }).texture('door_wood', { tile: [1.04, 2.1] }).color(0x5e6e58).at(x, 0.12, face + 0.03).collider();
  kit.box({ w: 1.12, h: 0.05, d: 0.14 }).texture('wood_planks', { tile: 0.6 }).color(0x4e5a48).at(x, 0.98, face + 0.03);
  if (night) kit.box({ w: 1.04, h: 1.22, d: 0.06 }).texture('door_wood', { tile: [1.04, 2.1] }).color(0x5e6e58).at(x, 1.03, face + 0.03);
}
