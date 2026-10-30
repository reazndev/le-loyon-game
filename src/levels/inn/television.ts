import { Color } from 'three';
import { hashString, seededRandom } from '../../engine/random';
import type { MeshBuilder } from '../../game/kit/builders';
import type { LevelKit } from '../../game/kit/levelKit';
import { everyFrame } from '../church/everyFrame';

/**
 * The local channel on the café television, sound off: a shot holds for a few seconds, then
 * cuts to another, each a different grey-blue cast, with the tube's small shimmer on top.
 */

const PICTURES = [0x5a7088, 0x6a7468, 0x7a6e5e, 0x4a5a70, 0x848a8e, 0x3e4a56];

const SLOT = 1.5;
/** At most this many slots go by without a cut. */
const LONGEST = 5;
const roll = (key: string): number => seededRandom(hashString(key))();

/** Whether the picture cuts at the start of slot `n`. */
const cutsAt = (n: number): boolean => n % LONGEST === 0 || roll(`tv-cut-${n}`) < 0.35;

/** Which shot is on at `t` seconds (the slot it cut in), its picture, and how bright, about 0.75 to 1.0. */
export function tvPicture(t: number): { shot: number; picture: number; level: number } {
  let n = Math.floor(t / SLOT);
  while (!cutsAt(n)) n--;
  const picture = Math.floor(roll(`tv-pic-${n}`) * PICTURES.length);
  const shimmer = 0.94 + 0.06 * Math.sin(t * 7.3 + n) * Math.sin(t * 2.1);
  // A shot comes up out of a darker frame as it cuts.
  const settle = Math.min(1, (t - n * SLOT) / 0.15);
  return { shot: n, picture, level: shimmer * (0.8 + 0.2 * settle) };
}

/** Plays the channel on `screen`, an unlit box whose color is the picture. */
export function playChannel(kit: LevelKit, screen: MeshBuilder): void {
  const color = screen.mesh.material.uniforms.uColor.value as Color;
  const pictures = PICTURES.map((hex) => new Color(hex));
  let time = 0;
  everyFrame(kit, (dt) => {
    time += dt;
    const { picture, level } = tvPicture(time);
    color.copy(pictures[picture]!).multiplyScalar(level);
  });
}
