import { Scene as ThreeScene } from 'three';
import { SoundScope } from '../engine/audio/audioManager';
import { Interactions } from '../engine/interactions';
import { CollisionWorld } from '../engine/physics/collision';
import { GroundMap } from '../engine/physics/ground';
import { LightingRig } from '../engine/render/lighting';
import { TextureLibrary } from '../engine/render/textures';
import { Triggers } from '../engine/triggers';

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

  clear(): void {
    this.scene.clear();
    this.collision.clear();
    this.ground.clear();
    this.interactions.clear();
    this.triggers.clear();
    this.lights.clear();
    this.sounds.stopAll(0.3);
  }
}
