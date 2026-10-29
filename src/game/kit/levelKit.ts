import { Group, PlaneGeometry, type BufferGeometry, type ColorRepresentation, type Object3D, type Texture } from 'three';
import { crackle, drone, wind, type CrackleOptions, type GeneratorOptions } from '../../engine/audio/generators';
import type { Surface } from '../../engine/physics/ground';
import {
  boxGeometry,
  cylinderGeometry,
  gableGeometry,
  planeGeometry,
  spriteGeometry,
  terrainGeometry,
} from '../../engine/render/geometry';
import type { PointLightOptions } from '../../engine/render/lighting';
import { createPs1Material } from '../../engine/render/ps1Material';
import type { TreeKind } from '../../engine/render/trees';
import {
  BarrierBuilder,
  CylinderBuilder,
  HotspotBuilder,
  LightBuilder,
  MeshBuilder,
  Placed,
  SoundBuilder,
  SpriteBuilder,
  TerrainBuilder,
  TreesBuilder,
  TriggerBuilder,
  type Area,
  type InteractOptions,
  type KitContext,
  type Phase,
  type SoundOptions,
  type TreeSpot,
} from './builders';

/** Size of the cells that faces are split into, in meters. Smaller cells light more smoothly. */
const DEFAULT_CELL = 1;

export interface DoorOptions {
  /** Scene id to load. */
  to: string;
  /** Spawn point in the target scene. Default "default". */
  spawn?: string;
  w?: number;
  h?: number;
  texture?: string;
  prompt?: string;
  /** When this returns true, the door shows `lockedText` instead of opening. */
  locked?: () => boolean;
  lockedText?: string;
}

export type AmbienceKind = 'wind' | 'drone' | 'crackle';

/**
 * The level authoring API. Every method adds something to the level and returns a builder for
 * chaining. Inside `group`, positions are relative to the group.
 */
export class LevelKit {
  constructor(
    private readonly ctx: KitContext,
    private readonly parent: Object3D,
  ) {}

  /** A box with its origin at the bottom center. */
  box(size: { w: number; h: number; d: number; cell?: number }): MeshBuilder {
    return this.add(new MeshBuilder(this.ctx, boxGeometry(size.w, size.h, size.d, size.cell ?? DEFAULT_CELL)));
  }

  /** A flat, upward-facing plane centered on its origin. Call `.walkable()` for floors. */
  plane(size: { w: number; d: number; cell?: number }): MeshBuilder {
    return this.add(new MeshBuilder(this.ctx, planeGeometry(size.w, size.d, size.cell ?? DEFAULT_CELL)));
  }

  /** A downward-facing plane, for ceilings. */
  ceiling(size: { w: number; d: number; cell?: number }): MeshBuilder {
    const geometry = planeGeometry(size.w, size.d, size.cell ?? DEFAULT_CELL).rotateX(Math.PI);
    return this.add(new MeshBuilder(this.ctx, geometry));
  }

  /** An upright cylinder with its origin at the bottom center. */
  cylinder(size: { r: number; h: number; sides?: number; cell?: number }): CylinderBuilder {
    const geometry = cylinderGeometry(size.r, size.h, size.sides ?? 8, size.cell ?? DEFAULT_CELL);
    return this.add(new CylinderBuilder(this.ctx, geometry, size.r));
  }

  /** A gable roof with the ridge along X and its origin at the bottom center. */
  gable(size: { w: number; d: number; h: number; cell?: number }): MeshBuilder {
    return this.add(new MeshBuilder(this.ctx, gableGeometry(size.w, size.d, size.h, size.cell ?? DEFAULT_CELL)));
  }

  /** A heightfield. `height` gets x and z relative to the terrain's center and returns meters. */
  terrain(size: { w: number; d: number; cell?: number; height: (x: number, z: number) => number }): TerrainBuilder {
    const geometry = terrainGeometry(size.w, size.d, size.cell ?? DEFAULT_CELL, size.height);
    return this.add(new TerrainBuilder(this.ctx, geometry, size.height));
  }

  /** A camera-facing picture standing on its bottom edge. Transparent texels are cut out. */
  sprite(texture: string, size: { w: number; h: number }): SpriteBuilder {
    const builder = new SpriteBuilder(this.ctx, spriteGeometry(size.w, size.h), size.w);
    return this.add(builder).texture(texture, { tile: [size.w, size.h] });
  }

  /** A soft additive halo that faces the camera, for lamps in fog. Its origin is its center. */
  glow(size: number, color: ColorRepresentation = 0xffd49a): MeshBuilder {
    const material = createPs1Material({ glow: true, billboard: true, map: this.texture('glow'), color });
    return this.add(new MeshBuilder(this.ctx, new PlaneGeometry(size, size), material));
  }

  /** Any geometry with the PS1 material. UVs are scaled by the texture's `tile`. */
  mesh(geometry: BufferGeometry): MeshBuilder {
    return this.add(new MeshBuilder(this.ctx, geometry));
  }

  /** Instanced trees, one per spot. See `scatter` for random spots. */
  trees(kind: TreeKind, spots: TreeSpot[]): TreesBuilder {
    return this.add(new TreesBuilder(this.ctx, kind, spots));
  }

  /** A point light. Pair it with an emissive mesh so the source is visible. */
  light(options: PointLightOptions = {}): LightBuilder {
    return this.add(new LightBuilder(this.ctx, { ...options }));
  }

  hotspot(options: InteractOptions): HotspotBuilder {
    return this.add(new HotspotBuilder(this.ctx, options));
  }

  trigger(area: Area): TriggerBuilder {
    return this.add(new TriggerBuilder(this.ctx, area));
  }

  barrier(area: Area): BarrierBuilder {
    return this.add(new BarrierBuilder(this.ctx, area));
  }

  /** A door slab that loads another scene when used. Its origin is the bottom center. */
  door(options: DoorOptions): MeshBuilder {
    const w = options.w ?? 1;
    const h = options.h ?? 2.1;
    return this.box({ w, h, d: 0.08 })
      .texture(options.texture ?? 'wood_planks', { tile: [w, h] })
      .collider()
      .interact({
        prompt: options.prompt ?? 'Open the door',
        radius: w / 2,
        onInteract: () => {
          if (options.locked?.()) return this.ctx.say(options.lockedText ?? 'It is locked.');
          this.ctx.goTo(options.to, options.spawn);
        },
      });
  }

  /** An area that loads another scene when the player walks into it. */
  exit(options: Area & { to: string; spawn?: string }): TriggerBuilder {
    return this.trigger(options).onEnter(() => this.ctx.goTo(options.to, options.spawn));
  }

  /** Builds children relative to a group. Place the group as a whole with `at` and `rotY`. */
  group(build: (kit: LevelKit) => void): Placed {
    const group = new Group();
    build(new LevelKit(this.ctx, group));
    return this.add(new Placed(this.ctx, group));
  }

  /** A looping sound file at a point in the level. */
  sound(src: string, options: SoundOptions = {}): SoundBuilder {
    return this.add(new SoundBuilder(this.ctx, src, options));
  }

  /** Procedural background sound for the whole scene. Stops when the scene ends. */
  ambience(kind: AmbienceKind, options: GeneratorOptions & CrackleOptions = {}): void {
    const generators = { wind, drone, crackle };
    this.ctx.world.sounds.track(generators[kind](this.ctx.audio, options));
  }

  /** What the ground is where no walkable object covers it. */
  ground(surface: Surface, height = 0): void {
    this.ctx.world.ground.fallback = { surface, height };
  }

  /** A texture by name, for custom materials. */
  texture(name: string): Texture {
    return this.ctx.world.textures.get(name);
  }

  private add<T extends Placed>(builder: T): T {
    this.parent.add(builder.object);
    return builder;
  }
}

/** Runs one scene build: hands out the kit, then performs the deferred work in phase order. */
export class KitSession {
  readonly kit: LevelKit;
  private readonly root: Object3D;
  private readonly queues: Record<Phase, (() => void)[]> = { ground: [], place: [], register: [] };

  constructor(context: Omit<KitContext, 'later'>) {
    const ctx: KitContext = { ...context, later: (phase, work) => this.queues[phase].push(work) };
    this.root = context.world.scene;
    this.kit = new LevelKit(ctx, this.root);
  }

  finish(): void {
    (['ground', 'place', 'register'] as const).forEach((phase) => {
      this.root.updateMatrixWorld(true);
      this.queues[phase].splice(0).forEach((work) => work());
    });
  }
}
