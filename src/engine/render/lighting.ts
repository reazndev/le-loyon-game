import { Color, MathUtils, Vector3, type ColorRepresentation } from 'three';
import { FlashlightFault } from './flashlightFault';
import { MAX_POINT_LIGHTS, ps1Uniforms } from './ps1Uniforms';

export interface PointLightOptions {
  color?: ColorRepresentation;
  /** Brightness multiplier. 1 is a household bulb at close range. */
  intensity?: number;
  /** Distance in meters at which the light reaches zero. */
  range?: number;
  /** 0 is steady, 1 flickers hard. */
  flicker?: number;
}

export interface PointLight {
  position: Vector3;
  color: Color;
  intensity: number;
  range: number;
  flicker: number;
  readonly seed: number;
}

export interface FlashlightSettings {
  color: Color;
  intensity: number;
  range: number;
  /** Half-angle of the outer cone in degrees. */
  angle: number;
  /** Half-angle of the fully lit inner cone in degrees. */
  innerAngle: number;
}

/**
 * Owns the scene's point lights and the flashlight, and writes them to the shared uniforms
 * each frame. When a scene has more lights than the shader supports, the nearest ones win.
 */
export class LightingRig {
  readonly flashlight: FlashlightSettings = {
    color: new Color(1, 0.94, 0.82),
    intensity: 2.6,
    range: 14,
    angle: 24,
    innerAngle: 10,
  };
  flashlightOn = false;
  private readonly fault = new FlashlightFault();
  private readonly points = new Set<PointLight>();
  private nextSeed = 1;

  addPoint(position: Vector3, options: PointLightOptions = {}): PointLight {
    const light: PointLight = {
      position: position.clone(),
      color: new Color(options.color ?? 0xffd9a0),
      intensity: options.intensity ?? 1,
      range: options.range ?? 6,
      flicker: options.flicker ?? 0,
      seed: this.nextSeed++ * 17.31,
    };
    this.points.add(light);
    return light;
  }

  removePoint(light: PointLight): void {
    this.points.delete(light);
  }

  /** Points the flashlight from the given origin along the given direction. */
  aimFlashlight(origin: Vector3, direction: Vector3): void {
    ps1Uniforms.uSpotPos.value.copy(origin);
    ps1Uniforms.uSpotDir.value.copy(direction).normalize();
  }

  update(viewer: Vector3, time: number): void {
    const nearest = [...this.points]
      .map((light) => ({ light, distance: light.position.distanceTo(viewer) - light.range }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, MAX_POINT_LIGHTS);

    nearest.forEach(({ light }, i) => {
      ps1Uniforms.uPointPos.value[i]!.copy(light.position);
      ps1Uniforms.uPointColor.value[i]!.copy(light.color).multiplyScalar(light.intensity * flickerAt(light, time));
      ps1Uniforms.uPointRange.value[i] = light.range;
    });
    ps1Uniforms.uPointCount.value = nearest.length;

    const flash = this.flashlight;
    ps1Uniforms.uSpotColor.value.copy(flash.color).multiplyScalar(this.flashlightOn ? flash.intensity * this.fault.level(time) : 0);
    ps1Uniforms.uSpotRange.value = flash.range;
    ps1Uniforms.uSpotCos.value.set(
      Math.cos(MathUtils.degToRad(flash.angle)),
      Math.cos(MathUtils.degToRad(flash.innerAngle)),
    );
  }

  clear(): void {
    this.points.clear();
  }
}

function flickerAt(light: PointLight, time: number): number {
  if (light.flicker <= 0) return 1;
  const t = time * 9 + light.seed;
  const wave = Math.sin(t) * 0.5 + Math.sin(t * 2.7 + 1.3) * 0.3 + Math.sin(t * 7.1 + 0.4) * 0.2;
  // Occasional deep dips read as a failing bulb rather than a smooth pulse.
  const dip = Math.sin(time * 1.3 + light.seed) > 0.93 ? 0.5 : 0;
  return Math.max(0, 1 - light.flicker * (0.5 + 0.5 * wave + dip) * 0.6);
}
