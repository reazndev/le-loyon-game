import { CylinderGeometry, DataTexture, DoubleSide, Group, Mesh, NearestFilter, PlaneGeometry, RGBAFormat, Vector3 } from 'three';
import type { PointLight } from '../../engine/render/lighting';
import { createPs1Material } from '../../engine/render/ps1Material';
import type { KitContext } from '../kit/builders';
import { TORCH_HALF_ANGLE, TORCH_RANGE } from './detection';

/** Brightest at the lens, gone at the far end, so the beam fades into the fog. */
function beamFade(): DataTexture {
  const size = 32;
  const data = new Uint8Array(size * 4);
  for (let i = 0; i < size; i++) {
    const v = i / (size - 1);
    data.set([255, 246, 220, Math.round(255 * v ** 3)], i * 4);
  }
  const texture = new DataTexture(data, 1, size, RGBAFormat);
  texture.magFilter = NearestFilter;
  texture.minFilter = NearestFilter;
  texture.needsUpdate = true;
  return texture;
}

/**
 * A big rubber torch: a visible beam through the fog, a hot spot at the lens, and a point light
 * where the beam lands. Aim it each frame with `aim`.
 */
export class TorchBeam {
  readonly object = new Group();
  private light: PointLight | null = null;
  private readonly direction = new Vector3();
  private on = true;

  constructor(ctx: KitContext) {
    // Many rings along the beam: affine texturing would smear the fade across one long quad.
    const geometry = new CylinderGeometry(0.04, TORCH_RANGE * Math.tan(TORCH_HALF_ANGLE), TORCH_RANGE, 10, 16, true)
      .translate(0, -TORCH_RANGE / 2, 0)
      .rotateX(Math.PI / 2);
    const beam = new Mesh(geometry, createPs1Material({ glow: true, map: beamFade(), color: 0x17140f, side: DoubleSide }));
    const lens = new Mesh(new PlaneGeometry(0.7, 0.7), createPs1Material({ glow: true, billboard: true, map: ctx.world.textures.get('glow'), color: 0xfff0d0 }));
    beam.frustumCulled = false;
    this.object.add(beam, lens);
    ctx.world.scene.add(this.object);
    ctx.later('register', () => (this.light = ctx.world.lights.addPoint(new Vector3(), { color: 0xfff0d0, intensity: 2.2, range: 6 })));
  }

  set visible(on: boolean) {
    this.on = on;
    this.object.visible = on;
    if (this.light && !on) this.light.intensity = 0;
  }

  /** Points the torch from `origin` along a yaw (level convention) and a downward pitch, in radians. */
  aim(origin: Vector3, yaw: number, pitch: number): void {
    this.object.position.copy(origin);
    this.object.rotation.set(-pitch, yaw, 0, 'YXZ');
    this.direction.set(-Math.sin(yaw) * Math.cos(pitch), -Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch));
    if (!this.light || !this.on) return;
    // The light sits where the beam reaches the ground, or partway along it.
    const reach = this.direction.y < -0.02 ? Math.min(origin.y / -this.direction.y, 7) : 6;
    this.light.position.copy(origin).addScaledVector(this.direction, reach * 0.85);
    this.light.position.y = Math.max(this.light.position.y, 0.4);
    this.light.intensity = 2.2;
  }
}
