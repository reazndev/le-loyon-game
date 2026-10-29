import {
  AdditiveBlending,
  Color,
  DataTexture,
  FrontSide,
  RGBAFormat,
  ShaderMaterial,
  Vector2,
  type ColorRepresentation,
  type IUniform,
  type Side,
  type Texture,
} from 'three';
import { MAX_POINT_LIGHTS, ps1Uniforms } from './ps1Uniforms';

const vertexShader = /* glsl */ `
uniform vec2 uSnap;
uniform vec2 uUvScale;
uniform vec3 uAmbient;
uniform vec3 uSunDir;
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

varying vec2 vUvAffine;
varying float vAffineW;
varying vec3 vLight;
varying vec3 vTint;
varying vec3 vWorldPos;
varying float vViewDist;
varying float vSpotGlow;
varying vec3 vFogLight;

// Wrapped Lambert: PS1 games lit with plain N.L, but a small wrap keeps back faces from going
// pitch black next to a lamp, which reads better in fog.
float diffuse(vec3 n, vec3 l) {
  return clamp((dot(n, l) + 0.25) / 1.25, 0.0, 1.0);
}

vec3 vertexLight(vec3 p, vec3 n) {
  vec3 light = uAmbient + uSunColor * diffuse(n, uSunDir);
  vFogLight = vec3(0.0);
  for (int i = 0; i < ${MAX_POINT_LIGHTS}; i++) {
    if (i >= uPointCount) break;
    vec3 toLight = uPointPos[i] - p;
    float dist = length(toLight);
    float falloff = clamp(1.0 - dist / uPointRange[i], 0.0, 1.0);
    light += uPointColor[i] * falloff * falloff * diffuse(n, toLight / max(dist, 1e-4));
    vFogLight += uPointColor[i] * falloff * falloff;
  }
  vec3 toSpot = uSpotPos - p;
  float spotDist = length(toSpot);
  vec3 spotL = toSpot / max(spotDist, 1e-4);
  float cone = smoothstep(uSpotCos.x, uSpotCos.y, dot(-spotL, uSpotDir));
  float spotFalloff = clamp(1.0 - spotDist / uSpotRange, 0.0, 1.0);
  light += uSpotColor * cone * spotFalloff * spotFalloff * diffuse(n, spotL);
  return light;
}

void main() {
  mat4 model = modelMatrix;
  #ifdef USE_INSTANCING
    model = modelMatrix * instanceMatrix;
  #endif

  #ifdef BILLBOARD
    // Cylindrical billboard: the quad turns around Y to face the camera, like PS1 sprite trees.
    vec3 origin = (model * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    vec3 toCamera = cameraPosition - origin;
    toCamera.y = 0.0;
    toCamera = normalize(toCamera + vec3(1e-5, 0.0, 0.0));
    vec3 right = vec3(toCamera.z, 0.0, -toCamera.x);
    vec3 world = origin
      + right * position.x * length(model[0].xyz)
      + vec3(0.0, 1.0, 0.0) * position.y * length(model[1].xyz);
    vec3 worldNormal = toCamera;
  #else
    vec3 world = (model * vec4(position, 1.0)).xyz;
    vec3 worldNormal = normalize(mat3(model) * normal);
  #endif

  vec4 viewPos = viewMatrix * vec4(world, 1.0);
  vec4 clip = projectionMatrix * viewPos;

  // Snap to a coarse screen grid. The PS1 had no sub-pixel precision, so vertices jump between
  // pixels and geometry wobbles as the camera moves.
  if (clip.w > 0.0) {
    vec2 grid = uSnap * 0.5;
    clip.xy = floor(clip.xy / clip.w * grid + 0.5) / grid * clip.w;
  }
  gl_Position = clip;

  // WebGL2 interpolates varyings with perspective correction. Pre-multiplying by w and dividing
  // in the fragment shader cancels it out, which gives the PS1's affine texture warp.
  vAffineW = clip.w;
  vUvAffine = uv * uUvScale * clip.w;

  vWorldPos = world;
  vViewDist = length(viewPos.xyz);

  #ifdef UNLIT
    vLight = vec3(1.0);
    vFogLight = vec3(0.0);
  #else
    vLight = vertexLight(world, worldNormal);
  #endif

  vTint = vec3(1.0);
  #ifdef USE_COLOR
    vTint *= color.rgb;
  #endif
  #ifdef USE_INSTANCING_COLOR
    vTint *= instanceColor;
  #endif

  float spotView = dot(normalize(world - uSpotPos), uSpotDir);
  vSpotGlow = smoothstep(uSpotCos.x, uSpotCos.y, spotView) * clamp(1.0 - vViewDist / uSpotRange, 0.0, 1.0);
}
`;

const fragmentShader = /* glsl */ `
uniform sampler2D uMap;
uniform vec3 uColor;
uniform vec3 uEmissive;
uniform float uAlphaTest;
uniform float uTime;
uniform vec3 uFogColor;
uniform float uFogNear;
uniform float uFogFar;
uniform float uFogDensity;
uniform float uFogWisps;
uniform vec3 uSpotColor;
uniform float uSpotFogGlow;
uniform float uLightFogGlow;

varying vec2 vUvAffine;
varying float vAffineW;
varying vec3 vLight;
varying vec3 vTint;
varying vec3 vWorldPos;
varying float vViewDist;
varying float vSpotGlow;
varying vec3 vFogLight;

float hash3(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float valueNoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash3(i), hash3(i + vec3(1, 0, 0)), f.x), mix(hash3(i + vec3(0, 1, 0)), hash3(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(hash3(i + vec3(0, 0, 1)), hash3(i + vec3(1, 0, 1)), f.x), mix(hash3(i + vec3(0, 1, 1)), hash3(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
}

float fogAmount(float dist) {
  // Drifting noise thickens and thins the fog in patches, so it reads as moving banks of mist
  // rather than a flat distance gradient.
  vec3 drift = vec3(uTime * 0.35, uTime * 0.05, uTime * 0.2);
  float wisps = valueNoise(vWorldPos * 0.35 + drift) * 0.65 + valueNoise(vWorldPos * 0.9 - drift) * 0.35;
  float d = dist * (1.0 + uFogWisps * (wisps - 0.5));
  float ramp = clamp((d - uFogNear) / max(uFogFar - uFogNear, 1e-3), 0.0, 1.0);
  float x = max(d - uFogNear, 0.0) * uFogDensity;
  return max(ramp, 1.0 - exp(-x * x));
}

void main() {
  vec4 texel = texture2D(uMap, vUvAffine / vAffineW);
  float fog = fogAmount(vViewDist);

  #ifdef GLOW
    // Additive halo. It is light scattered by the fog itself, so fog only dims it partly.
    gl_FragColor = vec4(texel.rgb * texel.a * uColor * (1.0 - fog * 0.6), 1.0);
  #else
    if (texel.a < uAlphaTest) discard;
    // Light can reach 2x, like PS1 vertex colors where 128 meant full brightness.
    vec3 lit = texel.rgb * uColor * vTint * min(vLight, vec3(2.0)) + uEmissive;
    // Lamps and the flashlight brighten the fog near what they light.
    vec3 fogColor = uFogColor + uSpotColor * vSpotGlow * uSpotFogGlow + vFogLight * uLightFogGlow;
    gl_FragColor = vec4(mix(lit, fogColor, fog), 1.0);
  #endif
}
`;

const whiteTexture = new DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1, RGBAFormat);
whiteTexture.needsUpdate = true;

export interface Ps1MaterialOptions {
  map?: Texture;
  color?: ColorRepresentation;
  emissive?: ColorRepresentation;
  /** Multiplies the geometry UVs. Kit geometry has UVs in meters, so this is 1 / tile size. */
  uvScale?: [number, number];
  /** Discards texels with alpha below this value. Use 0.5 for cutouts such as leaves. */
  alphaTest?: number;
  unlit?: boolean;
  billboard?: boolean;
  /** Draws as an additive halo, for the glow around lamps. */
  glow?: boolean;
  vertexColors?: boolean;
  side?: Side;
}

export interface Ps1MaterialUniforms extends Record<string, IUniform> {
  uMap: IUniform<Texture>;
  uColor: IUniform<Color>;
  uEmissive: IUniform<Color>;
  uUvScale: IUniform<Vector2>;
  uAlphaTest: IUniform<number>;
}

export type Ps1Material = ShaderMaterial & { uniforms: Ps1MaterialUniforms };

/** Creates the PS1 look material: snapped vertices, affine textures, vertex lighting, fog. */
export function createPs1Material(options: Ps1MaterialOptions = {}): Ps1Material {
  const uniforms: Ps1MaterialUniforms = {
    ...ps1Uniforms,
    uMap: { value: options.map ?? whiteTexture },
    uColor: { value: new Color(options.color ?? 0xffffff) },
    uEmissive: { value: new Color(options.emissive ?? 0x000000) },
    uUvScale: { value: new Vector2(...(options.uvScale ?? [1, 1])) },
    uAlphaTest: { value: options.alphaTest ?? 0 },
  };
  const material = new ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    side: options.side ?? FrontSide,
    vertexColors: options.vertexColors ?? false,
  }) as Ps1Material;
  setDefine(material, 'UNLIT', options.unlit ?? false);
  setDefine(material, 'BILLBOARD', options.billboard ?? false);
  if (options.glow) {
    setDefine(material, 'GLOW', true);
    Object.assign(material, { transparent: true, depthWrite: false, blending: AdditiveBlending });
  }
  return material;
}

export function setDefine(material: ShaderMaterial, name: string, enabled: boolean): void {
  if (enabled) material.defines[name] = '';
  else delete material.defines[name];
  material.needsUpdate = true;
}
