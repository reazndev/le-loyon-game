import type { Object3D } from 'three';
import { Scene as ThreeScene } from 'three';
import { SoundScope } from '../engine/audio/audioManager';
import { Interactions } from '../engine/interactions';
import { CollisionWorld, type Shape } from '../engine/physics/collision';
import { GroundMap } from '../engine/physics/ground';
import { LightingRig } from '../engine/render/lighting';
import { TextureLibrary } from '../engine/render/textures';
import { Triggers } from '../engine/triggers';
import type { LiveHint } from './liveHint';
import type { MapSketch } from '../engine/ui/mapSheet';

/** The per-scene runtime systems a level fills in. The scene manager clears them between scenes. */
export class World {
  readonly scene = new ThreeScene();
  readonly collision = new CollisionWorld();
  readonly ground = new GroundMap();
  readonly interactions = new Interactions();
  readonly triggers = new Triggers();
  readonly lights = new LightingRig();
  readonly sounds = new SoundScope();
  readonly textures = new TextureLibrary();
  /** Per-frame work that belongs to the scene, such as animated characters. */
  readonly updates = new Set<(dt: number) => void>();
  /** The ways out of the scene and where each leads, for the compass. */
  readonly exits: { to: string; object: Object3D }[] = [];
  /** Invisible walls, which the map leaves out. */
  readonly barriers = new WeakSet<Shape>();
  /** The map of the scene, worked out the first time it is shown. */
  mapSketch: MapSketch | null = null;
  /** Clues for the corner that belong to this scene. */
  readonly hints: LiveHint[] = [];
  /** Cold enough outdoors to see the reporter's breath. `breathVapor` sets it. */
  cold = false;
  /** Scene seconds when a scare beat last fired, for layers that get busier after one. */
  lastScareAt = Number.NEGATIVE_INFINITY;

  clear(): void {
    this.scene.clear();
    this.collision.clear();
    this.ground.clear();
    this.interactions.clear();
    this.triggers.clear();
    this.lights.clear();
    this.sounds.stopAll(0.3);
    this.updates.clear();
    this.exits.length = 0;
    this.hints.length = 0;
    this.mapSketch = null;
    this.cold = false;
    this.lastScareAt = Number.NEGATIVE_INFINITY;
  }
}
