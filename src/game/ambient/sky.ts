import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, Mesh, PlaneGeometry, Points, ShaderMaterial } from 'three';
import { hashString, seededRandom } from '../../engine/random';
import { ps1Uniforms } from '../../engine/render/ps1Uniforms';
import type { LevelKit } from '../kit/levelKit';
import type { SceneContext } from '../scene';

const STARS = 420;

// The sky sits just past the fog's far edge and moves with the camera, so it never gets closer.
// Anything nearer, a tree or a roof, hides it through the depth test; the fog does not touch it.
const SKY_DISTANCE = 'uFogFar * 1.05';

const starVertex = /* glsl */ `
uniform float uTime;
uniform float uFogFar;
attribute float aSeed;
varying float vBright;

void main() {
  vec3 world = cameraPosition + position * ${SKY_DISTANCE};
  gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
  gl_PointSize = 1.0 + step(0.94, aSeed);
  float twinkle = 0.7 + 0.3 * sin(uTime * (1.2 + aSeed * 3.0) + aSeed * 50.0);
  // Low stars are lost in the haze over the horizon.
  vBright = (0.2 + 0.8 * aSeed * aSeed) * twinkle * smoothstep(0.04, 0.4, position.y);
}
`;

const starFragment = /* glsl */ `
uniform vec3 uFogColor;
uniform vec3 uColor;
varying float vBright;

void main() {
  gl_FragColor = vec4(mix(uFogColor, uColor, vBright), 1.0);
}
`;

const moonVertex = /* glsl */ `
uniform vec3 uSunDir;
uniform float uFogFar;
uniform float uSize;
varying vec2 vUv;

void main() {
  vec4 view = viewMatrix * vec4(cameraPosition + uSunDir * ${SKY_DISTANCE}, 1.0);
  view.xy += position.xy * uSize * uFogFar;
  gl_Position = projectionMatrix * view;
  vUv = position.xy * 2.0;
}
`;

const moonFragment = /* glsl */ `
uniform vec3 uColor;
varying vec2 vUv;

void main() {
  float d = length(vUv);
  float disc = 1.0 - smoothstep(0.1, 0.115, d);
  // Darker seas across the face.
  float seas = 0.82 + 0.18 * sin(vUv.x * 29.0 + 1.3) * sin(vUv.y * 23.0 - 0.7);
  // The fog veils it, so a wide pale ring bleeds out around the disc.
  float halo = (1.0 - disc) * (exp(-d * 6.0) * 0.45 + exp(-d * 2.2) * 0.12) * (1.0 - smoothstep(0.75, 1.0, d));
  gl_FragColor = vec4(uColor * (disc * seas + halo), 1.0);
}
`;

function starDirections(seed: string): BufferGeometry {
  const random = seededRandom(hashString(seed));
  const stars = Array.from({ length: STARS }, () => {
    // An even spread over the upper half of the sphere: height uniform, angle uniform.
    const y = random();
    const angle = random() * Math.PI * 2;
    const r = Math.sqrt(1 - y * y);
    return [Math.cos(angle) * r, y, Math.sin(angle) * r];
  });
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(stars.flat()), 3));
  geometry.setAttribute('aSeed', new BufferAttribute(new Float32Array(STARS).map(() => random()), 1));
  return geometry;
}

/**
 * The night sky over an open scene: faint twinkling stars and a hazy moon. The moon hangs where
 * the atmosphere's `sun` comes from, so it sits on the side the moonlight falls from. Day does nothing.
 */
export function nightSky(kit: LevelKit, ctx: SceneContext): void {
  if (ctx.state.time !== 'night') return;
  const stars = new Points(
    starDirections('night-sky'),
    new ShaderMaterial({
      uniforms: { ...ps1Uniforms, uColor: { value: new Color(0xb4bccc) } },
      vertexShader: starVertex,
      fragmentShader: starFragment,
      depthWrite: false,
    }),
  );
  const moon = new Mesh(
    new PlaneGeometry(1, 1),
    new ShaderMaterial({
      uniforms: { ...ps1Uniforms, uColor: { value: new Color(0xc8ccd2) }, uSize: { value: 0.55 } },
      vertexShader: moonVertex,
      fragmentShader: moonFragment,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    }),
  );
  // Both are placed by their shaders, so three.js's bounds would cull them wrongly.
  [stars, moon].forEach((object) => {
    object.frustumCulled = false;
  });
  // Drawn first, so everything in front simply covers the stars.
  stars.renderOrder = -1;
  kit.group(() => undefined).dynamic().object.add(stars, moon);
}
