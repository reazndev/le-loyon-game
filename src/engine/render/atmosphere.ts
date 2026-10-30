import { Color, Vector3, type ColorRepresentation } from 'three';
import { ps1Uniforms } from './ps1Uniforms';

export interface FogSettings {
  color: ColorRepresentation;
  /** Distance in meters where fog starts. */
  near: number;
  /** Distance in meters where fog is opaque. Nothing past this is drawn. */
  far: number;
  /** Adds exponential-squared fog on top of the linear ramp. 0 turns it off; 0.15 is thick. */
  density?: number;
  /** How much drifting noise varies the fog, 0 to 1. */
  wisps?: number;
}

export interface Atmosphere {
  fog: FogSettings;
  /** Light that reaches every surface. */
  ambient: ColorRepresentation;
  /** A directional light such as an overcast sky or moonlight. */
  sun?: { color: ColorRepresentation; direction: [number, number, number] };
  /** 1 keeps colors, 0 is grayscale. Defaults to 0.75 for the washed-out look. */
  saturation?: number;
  /** Whether the flashlight starts on in this scene. Defaults to on at night. */
  flashlight?: boolean;
}

/** The camera's far plane for a fog: a little past where the fog hides everything. */
export const cameraFar = (fogFar: number): number => fogFar * 1.15;

/** Writes an atmosphere to the shared uniforms and returns the values the renderer needs. */
export function applyAtmosphere(atmosphere: Atmosphere): { background: Color; far: number; saturation: number } {
  const { fog } = atmosphere;
  ps1Uniforms.uFogColor.value.set(fog.color);
  ps1Uniforms.uFogNear.value = fog.near;
  ps1Uniforms.uFogFar.value = fog.far;
  ps1Uniforms.uFogDensity.value = fog.density ?? 0;
  ps1Uniforms.uFogWisps.value = fog.wisps ?? 0.35;
  ps1Uniforms.uAmbient.value.set(atmosphere.ambient);
  if (atmosphere.sun) {
    ps1Uniforms.uSunColor.value.set(atmosphere.sun.color);
    ps1Uniforms.uSunDir.value.copy(new Vector3(...atmosphere.sun.direction).normalize());
  } else {
    ps1Uniforms.uSunColor.value.setRGB(0, 0, 0);
  }
  return {
    background: new Color(fog.color),
    far: cameraFar(fog.far),
    saturation: atmosphere.saturation ?? 0.75,
  };
}
