import { Mesh, ShaderMaterial, type Object3D } from 'three';
import type { Placed } from '../kit/builders';
import type { LevelKit } from '../kit/levelKit';
import { everyFrame } from './schedule';

export interface SwayOptions {
  /** Largest swing in degrees. */
  degrees?: number;
  /** Cycles per second of the main swing. */
  speed?: number;
  /** Which axis it swings around: `x` and `z` tilt, `y` turns. */
  axis?: 'x' | 'y' | 'z';
}

/** Angle in degrees of something swaying at `t` seconds: a slow swing with an uneven tremor on top. */
export function swayAngle(t: number, degrees: number, speed: number, seed: number): number {
  const w = t * speed * Math.PI * 2;
  return degrees * (0.75 * Math.sin(w + seed) + 0.25 * Math.sin(w * 2.7 + seed * 1.9));
}

/**
 * Swings an object back and forth around its origin: a curtain in a draft, a hanging lamp, a
 * sign on one nail. Kit boxes have their origin at the bottom, so for things that hang, build
 * them in a group placed at the hook, hanging down from it, and sway the group.
 */
export function sway(kit: LevelKit, placed: Placed, options: SwayOptions = {}): void {
  const { degrees = 3, speed = 0.25, axis = 'z' } = options;
  const object = placed.object;
  const rest = object.rotation[axis];
  const seed = Math.random() * 10;
  let time = 0;
  everyFrame(kit, (dt) => {
    time += dt;
    object.rotation[axis] = rest + (swayAngle(time, degrees, speed, seed) * Math.PI) / 180;
  });
}

const windChunk = /* glsl */ `
  {
    // Wind: the higher a vertex sits on its model, the further it moves, in slow gusts that
    // roll across the area.
    float gust = 0.6 + 0.4 * sin(uTime * 0.23 + world.x * 0.05);
    float lift = sqrt(max(position.y, 0.0));
    float wave = uTime * 1.3 + world.x * 0.31 + world.z * 0.23;
    world.xz += vec2(sin(wave), cos(wave * 0.8 + 1.3)) * uWind * gust * lift * 0.04;
  }
  vec4 viewPos = viewMatrix`;

/** Cut-out pictures of rigid things, which stay still in the wind: iron railings and gates. */
const RIGID_CUTOUTS = new Set(['iron_fence']);

const swaying = new WeakSet<ShaderMaterial>();
const wind = { value: 0 };
/** The scene's own wind strength, which a gust adds to. */
let calm = 0;

/** Leans the foliage `extra` harder than the scene's wind, for a gust running through. 0 settles it. */
export function gust(extra: number): void {
  wind.value = calm + extra;
}

function addWind(material: ShaderMaterial): void {
  if (swaying.has(material) || !material.vertexShader.includes('vec4 viewPos = viewMatrix')) return;
  swaying.add(material);
  material.uniforms.uWind = wind;
  const declare = ['uWind', 'uTime'].filter((name) => !material.vertexShader.includes(`uniform float ${name};`));
  material.vertexShader = material.vertexShader
    .replace('vec4 viewPos = viewMatrix', windChunk)
    .replace('void main()', `${declare.map((name) => `uniform float ${name};`).join('\n')}\nvoid main()`);
  material.needsUpdate = true;
}

/**
 * Makes the scene's foliage move in the wind: every cut-out leaf, needle, and grass picture,
 * including trees and undergrowth from the shared builders. Solid meshes such as trunks, and
 * cut-out railings, stay still. `strength` 1 moves a ten-meter treetop about 12 cm; the setting
 * holds while the scene lasts. Call it once, anywhere in `build`.
 */
export function windSway(kit: LevelKit, strength = 1): void {
  kit.use((ctx) =>
    ctx.later('merge', () => {
      calm = strength;
      wind.value = strength;
      ctx.world.scene.traverse((object: Object3D) => {
        if (!(object instanceof Mesh)) return;
        const material = object.material as unknown;
        if (!(material instanceof ShaderMaterial) || (material.uniforms.uAlphaTest?.value ?? 0) <= 0) return;
        if (!RIGID_CUTOUTS.has(material.uniforms.uMap?.value?.name)) addWind(material);
      });
    }),
  );
}
