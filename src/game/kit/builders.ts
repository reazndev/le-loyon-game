import {
  DoubleSide,
  Euler,
  Group,
  InstancedMesh,
  MathUtils,
  Matrix4,
  Mesh,
  Object3D,
  Quaternion,
  Vector3,
  type BufferGeometry,
  type ColorRepresentation,
  type Texture,
} from 'three';
import type { AudioManager } from '../../engine/audio/audioManager';
import type { Shape } from '../../engine/physics/collision';
import type { GroundPatch, Surface } from '../../engine/physics/ground';
import type { PointLight, PointLightOptions } from '../../engine/render/lighting';
import { createPs1Material, setDefine, type Ps1Material } from '../../engine/render/ps1Material';
import { DYNAMIC } from '../../engine/render/staticBatch';
import { treeModel, type TreeKind } from '../../engine/render/trees';
import type { SceneContext } from '../scene';
import type { World } from '../world';

/**
 * When deferred work runs after `build` returns. Ground first, so later phases can sample it;
 * merge last, once colliders have read each mesh's own geometry.
 */
export type Phase = 'ground' | 'place' | 'register' | 'merge';

export interface KitContext {
  world: World;
  audio: AudioManager;
  /** The running scene's context, for builders that need the player, state, or dialogue. */
  scene: SceneContext;
  goTo(scene: string, spawn?: string): void;
  say(text: string): Promise<void>;
  later(phase: Phase, work: () => void): void;
}

/** A footprint in the XZ plane: a `w` by `d` rectangle, or a circle of radius `r`. */
export type Area = { w: number; d: number } | { r: number };

export interface InteractOptions {
  prompt: string | (() => string);
  onInteract: () => void | Promise<void>;
  /** Defaults to the object's footprint. */
  radius?: number;
  enabled?: () => boolean;
  /**
   * What the camera makes of the object when it is in the viewfinder: a photo item id from the
   * script, such as `photo_lantern`, or a key of `miscPhotoCaptions`. Other shots make a misc photo.
   * A function decides at the moment of the shot, for objects that change, such as an opened grave.
   */
  photo?: string | (() => string | undefined);
}

export interface TextureOptions {
  /** Meters covered by one copy of the texture, as one number or [across, up]. Default 2. */
  tile?: number | [number, number];
}

export function worldPosition(object: Object3D): Vector3 {
  return new Vector3().setFromMatrixPosition(object.matrixWorld);
}

export function worldYaw(object: Object3D): number {
  const rotation = new Quaternion();
  object.getWorldQuaternion(rotation);
  return new Euler().setFromQuaternion(rotation, 'YXZ').y;
}

function areaShape(area: Area, object: Object3D): Shape {
  const p = worldPosition(object);
  return 'r' in area
    ? { kind: 'circle', x: p.x, z: p.z, r: area.r }
    : { kind: 'box', x: p.x, z: p.z, hw: area.w / 2, hd: area.d / 2, angle: worldYaw(object) };
}

/**
 * Something with a place in the level. Positions and turns are relative to the parent group,
 * or to the world at the top level. Builders register colliders, lights, and other systems
 * after the scene's `build` returns, so the order of calls in a chain doesn't matter.
 */
export class Placed {
  constructor(
    protected readonly ctx: KitContext,
    readonly object: Object3D,
  ) {}

  at(x: number, y: number, z: number): this {
    this.object.position.set(x, y, z);
    return this;
  }

  /** Turns around the vertical axis. Positive turns counterclockwise seen from above. */
  rotY(degrees: number): this {
    this.object.rotation.y = MathUtils.degToRad(degrees);
    return this;
  }

  /** Keeps the object out of `kit.batch` merging, for parts the level moves, hides, or recolors. */
  dynamic(): this {
    this.object.userData[DYNAMIC] = true;
    return this;
  }

  /** Lifts the object onto the ground under it. The `y` from `at` becomes an offset above it. */
  onGround(): this {
    this.ctx.later('place', () => {
      const p = worldPosition(this.object);
      const parentY = p.y - this.object.position.y;
      this.object.position.y += this.ctx.world.ground.sample(p.x, p.z).height - parentY;
      this.object.updateMatrixWorld(true);
    });
    return this;
  }
}

export class MeshBuilder extends Placed {
  readonly mesh: Mesh<BufferGeometry, Ps1Material>;

  constructor(ctx: KitContext, geometry: BufferGeometry, material: Ps1Material = createPs1Material()) {
    const mesh = new Mesh(geometry, material);
    super(ctx, mesh);
    this.mesh = mesh;
  }

  /** Loads `public/assets/textures/<name>.png`, or a procedural stand-in when it is missing. */
  texture(name: string, options: TextureOptions = {}): this {
    return this.map(this.ctx.world.textures.get(name), options);
  }

  /** Uses a texture made in code, such as a painted window pane. */
  map(texture: Texture, options: TextureOptions = {}): this {
    const [u, v] = typeof options.tile === 'number' || options.tile === undefined ? [options.tile ?? 2, options.tile ?? 2] : options.tile;
    this.mesh.material.uniforms.uMap.value = texture;
    this.mesh.material.uniforms.uUvScale.value.set(1 / u, 1 / v);
    return this;
  }

  /** Multiplies the texture. */
  color(color: ColorRepresentation): this {
    this.mesh.material.uniforms.uColor.value.set(color);
    return this;
  }

  /** Adds light the surface gives off itself, such as a lamp bulb. */
  emissive(color: ColorRepresentation): this {
    this.mesh.material.uniforms.uEmissive.value.set(color);
    return this;
  }

  /** Ignores lights; shows the texture at full brightness. Fog still applies. */
  unlit(): this {
    setDefine(this.mesh.material, 'UNLIT', true);
    return this;
  }

  doubleSided(): this {
    this.mesh.material.side = DoubleSide;
    return this;
  }

  /** Discards transparent texels, for leaves, fences, and other cutouts. */
  cutout(threshold = 0.5): this {
    this.mesh.material.uniforms.uAlphaTest.value = threshold;
    return this;
  }

  /** Blocks the player with the object's footprint. */
  collider(): this {
    this.ctx.later('register', () => this.ctx.world.collision.add(this.colliderShape()));
    return this;
  }

  /** Lets the player walk on top of the object. */
  walkable(surface: Surface = 'stone'): this {
    this.ctx.later('ground', () => this.ctx.world.ground.add(this.groundPatch(surface)));
    return this;
  }

  /** Shows a prompt when the player faces the object, and runs `onInteract` on the button. */
  interact(options: InteractOptions): this {
    this.ctx.later('register', () => {
      const p = worldPosition(this.object);
      this.ctx.world.interactions.add({
        position: { x: p.x, z: p.z },
        radius: options.radius ?? this.footprintRadius(),
        prompt: options.prompt,
        onInteract: options.onInteract,
        ...(options.enabled ? { enabled: options.enabled } : {}),
        ...(options.photo ? { photo: options.photo } : {}),
      });
    });
    return this;
  }

  protected footprint(): { cx: number; cz: number; hw: number; hd: number; top: number } {
    const geometry = this.mesh.geometry;
    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    return {
      cx: (box.min.x + box.max.x) / 2,
      cz: (box.min.z + box.max.z) / 2,
      hw: (box.max.x - box.min.x) / 2,
      hd: (box.max.z - box.min.z) / 2,
      top: box.max.y,
    };
  }

  protected footprintRadius(): number {
    const { hw, hd } = this.footprint();
    return Math.max(hw, hd);
  }

  protected colliderShape(): Shape {
    const { cx, cz, hw, hd } = this.footprint();
    const center = this.object.localToWorld(new Vector3(cx, 0, cz));
    return { kind: 'box', x: center.x, z: center.z, hw, hd, angle: worldYaw(this.object) };
  }

  protected groundPatch(surface: Surface): GroundPatch {
    const top = worldPosition(this.object).y + this.footprint().top;
    return { area: this.colliderShape(), heightAt: () => top, surface };
  }
}

export class CylinderBuilder extends MeshBuilder {
  constructor(
    ctx: KitContext,
    geometry: BufferGeometry,
    private readonly radius: number,
  ) {
    super(ctx, geometry);
  }

  protected override colliderShape(): Shape {
    return areaShape({ r: this.radius }, this.object);
  }
}

export class TerrainBuilder extends MeshBuilder {
  constructor(
    ctx: KitContext,
    geometry: BufferGeometry,
    private readonly height: (x: number, z: number) => number,
  ) {
    super(ctx, geometry, createPs1Material({ vertexColors: true }));
  }

  protected override groundPatch(surface: Surface): GroundPatch {
    const toLocal = this.object.matrixWorld.clone().invert();
    const baseY = worldPosition(this.object).y;
    const local = new Vector3();
    return {
      area: this.colliderShape(),
      heightAt: (x, z) => {
        local.set(x, 0, z).applyMatrix4(toLocal);
        return baseY + this.height(local.x, local.z);
      },
      surface,
    };
  }
}

export class SpriteBuilder extends MeshBuilder {
  constructor(
    ctx: KitContext,
    geometry: BufferGeometry,
    private readonly width: number,
  ) {
    super(ctx, geometry);
    setDefine(this.mesh.material, 'BILLBOARD', true);
    this.mesh.material.side = DoubleSide;
    this.cutout();
  }

  protected override colliderShape(): Shape {
    return areaShape({ r: this.width / 4 }, this.object);
  }

  protected override footprintRadius(): number {
    return this.width / 2;
  }
}

export interface TreeSpot {
  x: number;
  z: number;
  /** Size multiplier. Default 1. */
  scale?: number;
  /** Degrees. */
  yaw?: number;
}

/** Many trees of one kind as instanced meshes. Each tree stands on the ground under it. */
export class TreesBuilder extends Placed {
  private readonly trunkRadius: number;

  constructor(
    ctx: KitContext,
    kind: TreeKind,
    private readonly spots: TreeSpot[],
  ) {
    super(ctx, new Group());
    const model = treeModel(kind);
    this.trunkRadius = model.trunkRadius;
    const meshes = model.parts.map((part) => {
      const material = createPs1Material({
        map: ctx.world.textures.get(part.texture),
        uvScale: part.uvScale,
        color: part.color,
        ...(part.cutout ? { alphaTest: 0.5, side: DoubleSide } : {}),
      });
      const mesh = new InstancedMesh(part.geometry, material, spots.length);
      this.object.add(mesh);
      return mesh;
    });
    ctx.later('place', () => this.placeInstances(meshes));
  }

  /** Blocks the player at each trunk. */
  collider(): this {
    this.ctx.later('register', () =>
      this.spots.forEach((spot) => {
        const p = this.object.localToWorld(new Vector3(spot.x, 0, spot.z));
        this.ctx.world.collision.add({ kind: 'circle', x: p.x, z: p.z, r: this.trunkRadius * (spot.scale ?? 1) });
      }),
    );
    return this;
  }

  private placeInstances(meshes: InstancedMesh[]): void {
    const groupY = worldPosition(this.object).y;
    const matrix = new Matrix4();
    this.spots.forEach((spot, i) => {
      const p = this.object.localToWorld(new Vector3(spot.x, 0, spot.z));
      const scale = spot.scale ?? 1;
      // Sink the base a little so trunks never float on slopes.
      const y = this.ctx.world.ground.sample(p.x, p.z).height - groupY - 0.15;
      matrix.compose(
        new Vector3(spot.x, y, spot.z),
        new Quaternion().setFromEuler(new Euler(0, MathUtils.degToRad(spot.yaw ?? 0), 0)),
        new Vector3(scale, scale, scale),
      );
      meshes.forEach((mesh) => mesh.setMatrixAt(i, matrix));
    });
    meshes.forEach((mesh) => {
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    });
  }
}

export class LightBuilder extends Placed {
  /** The live light, set once the scene is built. Change its position or intensity to animate it. */
  light: PointLight | null = null;

  constructor(
    ctx: KitContext,
    private readonly options: PointLightOptions,
  ) {
    super(ctx, new Object3D());
    ctx.later('register', () => (this.light = ctx.world.lights.addPoint(worldPosition(this.object), this.options)));
  }

  flicker(amount: number): this {
    this.options.flicker = amount;
    return this;
  }
}

/** An invisible spot the player can use, such as a note on a table or a view out a window. */
export class HotspotBuilder extends Placed {
  constructor(ctx: KitContext, options: InteractOptions) {
    super(ctx, new Object3D());
    ctx.later('register', () => {
      const p = worldPosition(this.object);
      ctx.world.interactions.add({
        position: { x: p.x, z: p.z },
        radius: options.radius ?? 0.3,
        prompt: options.prompt,
        onInteract: options.onInteract,
        ...(options.enabled ? { enabled: options.enabled } : {}),
        ...(options.photo ? { photo: options.photo } : {}),
      });
    });
  }
}

/** An invisible area that runs code when the player walks in or out. */
export class TriggerBuilder extends Placed {
  private enter: (() => void) | undefined;
  private exit: (() => void) | undefined;
  private onlyOnce = false;

  constructor(ctx: KitContext, area: Area) {
    super(ctx, new Object3D());
    ctx.later('register', () =>
      ctx.world.triggers.add({
        area: areaShape(area, this.object),
        once: this.onlyOnce,
        onEnter: () => this.enter?.(),
        onExit: () => this.exit?.(),
      }),
    );
  }

  onEnter(handler: () => void): this {
    this.enter = handler;
    return this;
  }

  onExit(handler: () => void): this {
    this.exit = handler;
    return this;
  }

  /** Fires the enter handler only the first time, then removes the trigger. */
  once(): this {
    this.onlyOnce = true;
    return this;
  }
}

/** An invisible wall. Use it to close off the edges of a level hidden in fog. */
export class BarrierBuilder extends Placed {
  constructor(ctx: KitContext, area: Area) {
    super(ctx, new Object3D());
    ctx.later('register', () => ctx.world.collision.add(areaShape(area, this.object)));
  }
}

export interface SoundOptions {
  volume?: number;
  /** Default true. */
  loop?: boolean;
  /** Meters at which the sound plays at full volume. Default 1.5. */
  refDistance?: number;
}

/** A sound file playing from a point in the level, such as a radio or a stream. */
export class SoundBuilder extends Placed {
  constructor(ctx: KitContext, src: string, options: SoundOptions) {
    super(ctx, new Object3D());
    ctx.later('register', () => {
      const p = worldPosition(this.object);
      ctx.world.sounds.track(
        ctx.audio.play(src, {
          bus: 'ambience',
          at: { x: p.x, y: p.y, z: p.z },
          loop: options.loop ?? true,
          volume: options.volume ?? 1,
          refDistance: options.refDistance ?? 1.5,
        }),
      );
    });
  }
}
