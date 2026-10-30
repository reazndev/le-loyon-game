import { BufferAttribute, BufferGeometry, Color, NormalBlending, Points, ShaderMaterial, Vector3, type ColorRepresentation } from 'three';
import { hashString, seededRandom } from '../../engine/random';
import { FRAME_HEIGHT } from '../../engine/render/frame';
import { MAX_POINT_LIGHTS, ps1Uniforms } from '../../engine/render/ps1Uniforms';
import type { Placed } from '../kit/builders';
import type { LevelKit } from '../kit/levelKit';

/**
 * Cheap particles as point sprites, moved entirely on the GPU: each point has a fixed seed and
 * the vertex shader works out where it is from the clock, so a field costs one draw call and no
 * CPU time per frame. Points render at the 640x480 frame's pixel size, so they come out as the
 * chunky squares and dots of a PS1 game.
 */

export type ParticleShape =
  /** A round blob that fades at the rim, blended. For fog wisps, dust, and breath. */
  | 'soft'
  /** A hard round dot, stippled when faint. For moths, flies, and drops. */
  | 'dot'
  /** A thin vertical line, for rain. */
  | 'streak'
  /** A square whose shade flips as it falls, as if it tumbled. For leaves. */
  | 'leaf';

export interface ParticleSpec {
  count: number;
  /** The volume the points fill, in meters, centered on the field's position. */
  box: [number, number, number];
  /** The field moves with the camera, its position an offset from it, and points wrap at the box's sides. */
  follow?: boolean;
  /** Starting position of the field: with `follow`, its offset from the camera. Same as calling `.at()`. */
  offset?: [number, number, number];
  /** Meters per second every point drifts. Points leaving the box come back in on the other side. */
  velocity?: [number, number, number];
  /** How far each point wanders from its path, per axis, in meters. */
  sway?: [number, number, number];
  /** How fast the sway, or the orbit, goes. 1 is about one cycle in six seconds. */
  speed?: number;
  /** Points circle the field's position at up to this radius instead of drifting through the box. */
  orbit?: number;
  /** Diameter of one point in meters. */
  size: number;
  shape: ParticleShape;
  color: ColorRepresentation;
  /** 0 to 1. */
  opacity?: number;
  /** Takes the fog's color times this instead of `color`, so wisps match whatever fog the scene has. */
  fogTint?: number;
  /**
   * The points are the fog itself: the scene's fog only thins them a little with distance
   * instead of hiding them, and the torch and lamps light them fully. Use with `fogTint`.
   */
  mist?: boolean;
  /** World height below which points hide, such as a floor under a drip. */
  floor?: number;
  seed?: string;
}

const vertexShader = /* glsl */ `
uniform float uTime;
uniform vec2 uSnap;
uniform vec3 uAmbient;
uniform vec3 uSunColor;
uniform vec3 uPointPos[${MAX_POINT_LIGHTS}];
uniform vec3 uPointColor[${MAX_POINT_LIGHTS}];
uniform float uPointRange[${MAX_POINT_LIGHTS}];
uniform int uPointCount;
uniform vec3 uSpotPos;
uniform vec3 uSpotDir;
uniform vec3 uSpotColor;
uniform float uSpotRange;
uniform vec2 uSpotCos;
uniform float uFogNear;
uniform float uFogFar;
uniform float uFogDensity;

uniform vec3 uBox;
uniform vec3 uVelocity;
uniform vec3 uSway;
uniform float uSpeed;
uniform float uOrbit;
uniform float uSize;
uniform float uFloor;

attribute float aSeed;

varying float vAlpha;
varying vec3 vLight;
varying vec3 vGlow;
varying float vFog;
varying float vSeed;

void main() {
  vec3 center = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
  #ifdef FOLLOW
    center += cameraPosition;
  #endif
  float phase = aSeed * 6.2831;
  float t = uTime * uSpeed * (0.7 + 0.6 * aSeed);
  vec3 sway = uSway * vec3(sin(t + phase), sin(t * 1.7 + phase * 2.0), cos(t * 0.8 + phase));

  #ifdef ORBIT
    float a = t * 1.6 + phase;
    float r = uOrbit * (0.35 + 0.65 * position.x);
    vec3 world = center + sway + vec3(cos(a) * r, (position.y - 0.5) * uBox.y + sin(a * 2.3) * 0.08, sin(a * 1.31) * r);
    float edge = 1.0;
  #else
    vec3 low = center - uBox * 0.5;
    vec3 local = mod(position * uBox + uVelocity * uTime + sway - low, uBox);
    vec3 world = low + local;
    // Fade near the sides the points wrap at, but not across thin boxes such as a drip's column.
    vec3 room = min(local, uBox - local) / max(uBox, vec3(1e-3));
    room = mix(vec3(1.0), room, step(0.3, uBox));
    float edge = smoothstep(0.0, 0.12, min(room.x, min(room.y, room.z)));
  #endif
  edge *= step(uFloor, world.y);

  vec4 view = viewMatrix * vec4(world, 1.0);
  vec4 clip = projectionMatrix * view;
  if (clip.w > 0.0) {
    vec2 grid = uSnap * 0.5;
    clip.xy = floor(clip.xy / clip.w * grid + 0.5) / grid * clip.w;
  }
  gl_Position = clip;

  float dist = max(-view.z, 0.05);
  gl_PointSize = clamp(uSize * projectionMatrix[1][1] * ${(FRAME_HEIGHT / 2).toFixed(1)} / dist, 1.0, 96.0);
  // A point right at the lens would fill the frame, so it fades out first.
  vAlpha = edge * smoothstep(0.2, 0.7, dist);

  vGlow = vec3(0.0);
  for (int i = 0; i < ${MAX_POINT_LIGHTS}; i++) {
    if (i >= uPointCount) break;
    float falloff = clamp(1.0 - distance(uPointPos[i], world) / uPointRange[i], 0.0, 1.0);
    vGlow += uPointColor[i] * falloff * falloff;
  }
  vec3 toSpot = world - uSpotPos;
  float spotDist = length(toSpot);
  float cone = smoothstep(uSpotCos.x, uSpotCos.y, dot(toSpot / max(spotDist, 1e-4), uSpotDir));
  float spotFalloff = clamp(1.0 - spotDist / uSpotRange, 0.0, 1.0);
  vGlow += uSpotColor * cone * spotFalloff * spotFalloff;
  vLight = uAmbient + uSunColor * 0.6 + vGlow;

  float d = length(view.xyz);
  float ramp = clamp((d - uFogNear) / max(uFogFar - uFogNear, 1e-3), 0.0, 1.0);
  float x = max(d - uFogNear, 0.0) * uFogDensity;
  vFog = max(ramp, 1.0 - exp(-x * x));
  vSeed = aSeed;
}
`;

const fragmentShader = /* glsl */ `
uniform float uTime;
uniform vec3 uFogColor;
uniform vec3 uColor;
uniform float uOpacity;
uniform float uFogTint;

varying float vAlpha;
varying vec3 vLight;
varying vec3 vGlow;
varying float vFog;
varying float vSeed;

float bayer(vec2 p) {
  const float m[16] = float[16](0.0, 8.0, 2.0, 10.0, 12.0, 4.0, 14.0, 6.0, 3.0, 11.0, 1.0, 9.0, 15.0, 7.0, 13.0, 5.0);
  ivec2 i = ivec2(mod(p, 4.0));
  return (m[i.x + i.y * 4] + 0.5) / 16.0;
}

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float alpha = vAlpha * uOpacity;
  #if defined(SOFT)
    alpha *= smoothstep(0.5, 0.05, length(c));
  #elif defined(STREAK)
    if (abs(c.x) > 0.09) discard;
  #elif defined(DOT)
    if (length(c) > 0.5) discard;
  #endif

  #if defined(MIST)
    // Lit, but not so much that it washes out the shapes behind it.
    vec3 lit = uFogColor * uFogTint + vGlow * 0.55;
  #elif defined(FOG_TINT)
    vec3 lit = uFogColor * uFogTint + vGlow * 0.35;
  #else
    vec3 lit = uColor * min(vLight, vec3(2.0));
  #endif
  #ifdef LEAF
    lit *= 0.5 + 0.5 * abs(sin(uTime * (1.5 + vSeed * 2.5) + vSeed * 20.0));
  #endif
  #ifdef MIST
    float fog = vFog * 0.3;
  #else
    float fog = vFog;
  #endif
  vec3 color = mix(lit, uFogColor, fog);

  #ifdef SOFT
    gl_FragColor = vec4(color, alpha * (1.0 - fog));
  #else
    // Screen-door transparency, like the PS1's stipple: nothing to sort, nothing to blend.
    if (alpha * (1.0 - fog * 0.7) < bayer(gl_FragCoord.xy)) discard;
    gl_FragColor = vec4(color, 1.0);
  #endif
}
`;

function seeds(count: number, seed: string): BufferGeometry {
  const random = seededRandom(hashString(seed));
  const positions = new Float32Array(count * 3).map(() => random());
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('aSeed', new BufferAttribute(new Float32Array(count).map(() => random()), 1));
  return geometry;
}

function particleMaterial(spec: ParticleSpec): ShaderMaterial {
  const soft = spec.shape === 'soft';
  const defines: Record<string, string> = { [spec.shape.toUpperCase()]: '' };
  if (spec.follow) defines.FOLLOW = '';
  if (spec.orbit) defines.ORBIT = '';
  if (spec.fogTint !== undefined) defines.FOG_TINT = '';
  if (spec.mist) defines.MIST = '';
  return new ShaderMaterial({
    defines,
    uniforms: {
      ...ps1Uniforms,
      uBox: { value: new Vector3(...spec.box) },
      uVelocity: { value: new Vector3(...(spec.velocity ?? [0, 0, 0])) },
      uSway: { value: new Vector3(...(spec.sway ?? [0, 0, 0])) },
      uSpeed: { value: spec.speed ?? 1 },
      uOrbit: { value: spec.orbit ?? 0 },
      uSize: { value: spec.size },
      uFloor: { value: spec.floor ?? -1e4 },
      uColor: { value: new Color(spec.color) },
      uOpacity: { value: spec.opacity ?? 1 },
      uFogTint: { value: spec.fogTint ?? 1 },
    },
    vertexShader,
    fragmentShader,
    transparent: soft,
    depthWrite: !soft,
    blending: NormalBlending,
  });
}

/**
 * Adds a particle field. It is a group like any other: place it with `.at()`, inside a group
 * or not, and it goes away with the scene.
 *
 * ```ts
 * particles(kit, dustMotes({ box: [3, 2, 3] })).at(1, 1.2, -2);
 * particles(kit, fallingLeaves());
 * ```
 */
export function particles(kit: LevelKit, spec: ParticleSpec): Placed {
  const points = new Points(seeds(spec.count, spec.seed ?? `${spec.shape}-${spec.count}`), particleMaterial(spec));
  // Positions come from the shader, so the bounds three.js would cull by mean nothing.
  points.frustumCulled = false;
  if (spec.shape === 'soft') points.renderOrder = 1;
  const placed = kit.group(() => undefined).dynamic();
  placed.object.add(points);
  return spec.offset ? placed.at(...spec.offset) : placed;
}
