import type { Points } from 'three';
import { ps1Uniforms } from '../../engine/render/ps1Uniforms';
import type { LevelKit } from '../kit/levelKit';
import type { SceneContext } from '../scene';
import { particles } from './particles';
import { everyFrame } from './schedule';
import { waterDrop } from './sounds';

export interface DripSpot {
  x: number;
  z: number;
  /** World height the drop forms at: a ceiling, a branch. */
  top: number;
  /** World height it lands at. */
  bottom: number;
}

const FALL_SPEED = 4;

/**
 * A drop forming and falling every `every` seconds at each spot, with the sound of it landing at
 * the moment it lands. Keep it to a few spots per scene; each is one draw call.
 */
export function drips(kit: LevelKit, ctx: SceneContext, spots: readonly DripSpot[], every = 2.6, volume = 0.3): void {
  const fields = spots.map((spot, i) => {
    // The column is longer than the fall, so the drop waits out of sight below the floor.
    const cycle = Math.max(FALL_SPEED * every, spot.top - spot.bottom + 1);
    const placed = particles(kit, {
      count: 1,
      box: [0.01, cycle, 0.01],
      velocity: [0, -FALL_SPEED, 0],
      size: 0.03,
      shape: 'dot',
      color: 0xb8c4c8,
      floor: spot.bottom,
      seed: `drip-${i}`,
    }).at(spot.x, spot.top - cycle / 2, spot.z);
    const points = placed.object.children[0] as Points;
    // Where the drop sits in its fall when the clock reads 0, as the shader works it out.
    const start = points.geometry.getAttribute('position').getY(0) * cycle;
    return { spot, start, cycle, low: spot.top - cycle, last: Infinity };
  });
  everyFrame(kit, () => {
    const t = ps1Uniforms.uTime.value;
    fields.forEach((field) => {
      const { cycle } = field;
      const local = (((field.start - FALL_SPEED * t - field.low) % cycle) + cycle) % cycle;
      // How far the drop is below the top of its column; it jumps back to 0 when it wraps.
      const below = cycle - local;
      const landing = field.spot.top - field.spot.bottom;
      if (field.last < landing && below >= landing) waterDrop(ctx.audio, { x: field.spot.x, y: field.spot.bottom, z: field.spot.z }, volume);
      field.last = below;
    });
  });
}
