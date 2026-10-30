import { Color } from 'three';
import type { LightBuilder, MeshBuilder } from '../kit/builders';
import type { LevelKit } from '../kit/levelKit';
import type { SceneContext } from '../scene';
import { loop } from './soundscape';
import { everyFrame } from './schedule';
import { tubeHum, tubeTick } from './sounds';

/** Smooth pseudo-random wobble in -1..1 from a few unrelated sines, so it never visibly repeats. */
function wobble(t: number, seed: number): number {
  return Math.sin(t * 1.7 + seed) * 0.5 + Math.sin(t * 4.3 + seed * 2.1) * 0.3 + Math.sin(t * 9.1 + seed * 0.7) * 0.2;
}

/**
 * A failing fluorescent tube: steady most of the time, then a stutter of a second or so where it
 * drops out and catches again. Returns the brightness, 0 to 1, at time `t` seconds.
 */
export function tubeLevel(t: number, seed = 0): number {
  const period = 7 + (seed % 5);
  const phase = (t + seed * 3.1) % period;
  if (phase > 1.1) return 1;
  // Inside the stutter: square-ish dropouts of uneven length.
  const flick = Math.sin(phase * 31 + seed) + Math.sin(phase * 17.3);
  return flick > 0.4 ? 0.08 : 1;
}

/** A candle or oil flame in still air: 0.75 to 1.05, quick small wavers. */
export function flameLevel(t: number, seed = 0): number {
  return 0.9 + wobble(t * 2.2, seed) * 0.15;
}

/**
 * Drives a light, and the mesh that shows its source, from a level function such as `tubeLevel`
 * or `flameLevel`. The mesh's emissive color dims with the light. Returns nothing; it runs as
 * long as the scene.
 */
export function animateLight(kit: LevelKit, light: LightBuilder, source: MeshBuilder | null, level: (t: number) => number): void {
  let base = 0;
  const emissive = source ? source.mesh.material.uniforms.uEmissive.value.clone() : new Color();
  let time = 0;
  everyFrame(kit, (dt) => {
    const live = light.light;
    if (!live) return;
    if (!base) base = live.intensity;
    time += dt;
    const k = level(time);
    live.intensity = base * k;
    source?.mesh.material.uniforms.uEmissive.value.copy(emissive).multiplyScalar(k);
  });
}

/**
 * A fluorescent tube that stutters, with its hum and the tick of the starter each time it drops
 * out. `at` is the tube's world position, for the sound.
 */
export function fluorescentTube(kit: LevelKit, ctx: SceneContext, light: LightBuilder, tube: MeshBuilder, at: { x: number; y: number; z: number }, seed = 1): void {
  loop(kit, () => tubeHum(ctx.audio, at));
  let lit = true;
  animateLight(kit, light, tube, (t) => {
    const k = tubeLevel(t, seed);
    if (lit && k < 0.5) tubeTick(ctx.audio, at);
    lit = k >= 0.5;
    return k;
  });
}
