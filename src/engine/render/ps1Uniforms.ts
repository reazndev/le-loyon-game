import { Color, Matrix4, Vector2, Vector3, type Texture } from 'three';

export const MAX_POINT_LIGHTS = 8;
/** Width and height of the torch's view, in texels. */
export const SHADOW_SIZE = 512;

/**
 * Uniforms shared by every PS1 material. Materials hold references to these objects, so the
 * lighting rig and atmosphere update one place and every mesh follows.
 */
export const ps1Uniforms = {
  uTime: { value: 0 },
  uSnap: { value: new Vector2(320, 240) },
  uFogColor: { value: new Color(0.5, 0.5, 0.5) },
  uFogNear: { value: 1 },
  uFogFar: { value: 12 },
  uFogDensity: { value: 0 },
  uFogWisps: { value: 0 },
  uAmbient: { value: new Color(0.3, 0.3, 0.3) },
  uSunDir: { value: new Vector3(0, 1, 0) },
  uSunColor: { value: new Color(0, 0, 0) },
  uPointPos: { value: Array.from({ length: MAX_POINT_LIGHTS }, () => new Vector3()) },
  uPointColor: { value: Array.from({ length: MAX_POINT_LIGHTS }, () => new Color(0, 0, 0)) },
  uPointRange: { value: new Array<number>(MAX_POINT_LIGHTS).fill(1) },
  uPointCount: { value: 0 },
  uSpotPos: { value: new Vector3() },
  uSpotDir: { value: new Vector3(0, 0, -1) },
  uSpotColor: { value: new Color(0, 0, 0) },
  uSpotRange: { value: 10 },
  uSpotCos: { value: new Vector2(0.9, 0.97) },
  uSpotFogGlow: { value: 0.18 },
  /** What the torch can see, as distance from it over its range; see `GameRenderer`. */
  uShadowMap: { value: null as Texture | null },
  /** World to the torch's clip space. */
  uShadowMatrix: { value: new Matrix4() },
  /** 1 while the torch's view is being drawn, 0 for the frame itself. */
  uShadowPass: { value: 0 },
  /** 1 when this frame has a torch view to test against. */
  uShadowOn: { value: 0 },
  uLightFogGlow: { value: 0.22 },
};
