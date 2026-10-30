import { Vector3, type Points, type ShaderMaterial } from 'three';
import type { LevelKit } from '../kit/levelKit';
import type { SceneContext } from '../scene';
import { particles } from './particles';
import { everyFrame } from './schedule';

const PUFF_SECONDS = 1.7;

/** Opacity of a breath `age` seconds after it leaves the mouth: a quick swell, a slow fade. */
export function puffOpacity(age: number): number {
  if (age < 0 || age > PUFF_SECONDS) return 0;
  const k = age / PUFF_SECONDS;
  return Math.min(1, k * 6) * (1 - k) ** 1.5;
}

/**
 * The reporter's breath showing in the cold: a small cloud in front of the camera every few
 * seconds, drifting forward and up as it thins. Use it outdoors at night. It stays away while
 * dialogue or a menu is open.
 */
export function breathVapor(kit: LevelKit, ctx: SceneContext, every = 4.5, opacity = 0.32): void {
  const placed = particles(kit, {
    count: 14,
    box: [0.2, 0.1, 0.2],
    sway: [0.05, 0.03, 0.05],
    speed: 0.6,
    size: 0.14,
    shape: 'soft',
    color: 0xc8ccd0,
    opacity: 0,
    seed: 'breath',
  });
  const material = (placed.object.children[0] as Points).material as ShaderMaterial;
  const uniforms = material.uniforms as Record<'uOpacity' | 'uSize', { value: number }> & { uBox: { value: Vector3 } };
  const origin = new Vector3();
  const ahead = new Vector3();
  let age = PUFF_SECONDS;
  let wait = every * Math.random();
  everyFrame(kit, (dt) => {
    age += dt;
    wait -= dt;
    if (wait <= 0 && !ctx.paused) {
      wait = every * (0.75 + Math.random() * 0.5);
      age = 0;
      // Fixed where it left the mouth: the reporter walks on through it.
      ctx.player.camera.getWorldDirection(ahead);
      origin.copy(ctx.player.camera.position).addScaledVector(ahead, 0.55);
      origin.y -= 0.12;
    }
    const k = Math.min(age / PUFF_SECONDS, 1);
    placed.object.position.copy(origin).addScaledVector(ahead, k * 0.35);
    placed.object.position.y += k * 0.15;
    uniforms.uOpacity.value = puffOpacity(age) * opacity;
    uniforms.uSize.value = 0.12 + k * 0.2;
    uniforms.uBox.value.setScalar(0.12 + k * 0.4).setY(0.06 + k * 0.2);
  });
}
