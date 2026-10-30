import type { Group, Object3D } from 'three';
import type { PoseInput } from './poses';

/** Where a character's head is turned, relative to its body, in radians. */
export interface Look {
  yaw: number;
  pitch: number;
}

/**
 * A posable character mesh. The root stands with its feet at the origin and faces -Z, so the
 * level's yaw convention applies to `root.rotation.y` unchanged.
 */
export interface CharacterModel {
  readonly root: Group;
  /** Height of the eyes above the feet, in meters. */
  readonly eyeHeight: number;
  /** Meters covered by one stride cycle (two steps). */
  readonly stride: number;
  /** Normal walking speed in meters per second. */
  readonly walkSpeed: number;
  /** How far the head turns before the body has to follow, in radians. */
  readonly neckLimit: number;
  /** The right hand, for props such as a torch. Humans only. */
  readonly hand?: Object3D;
  /** Raises the right arm to hold something out in front. */
  holding?: boolean;
  pose(input: PoseInput, look: Look): void;
}
