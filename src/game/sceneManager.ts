import { Mesh, type Material, type Object3D } from 'three';
import type { AudioManager, Bus } from '../engine/audio/audioManager';
import type { Player } from '../engine/player';
import { applyAtmosphere } from '../engine/render/atmosphere';
import type { GameRenderer } from '../engine/render/renderer';
import type { Overlay } from '../engine/ui/overlay';
import { KitSession } from './kit/levelKit';
import type { Scene, SceneContext } from './scene';
import type { GameState, PlayerPose } from './state';
import type { World } from './world';

const FADED_BUSES: Bus[] = ['ambience', 'sfx', 'music'];

export interface SceneManagerDeps {
  world: World;
  state: GameState;
  player: Player;
  audio: AudioManager;
  overlay: Overlay;
  renderer: GameRenderer;
  context: SceneContext;
}

/** Loads scenes by id, with a fade to black and an audio fade between them. */
export class SceneManager {
  current: Scene | null = null;
  /** True while a scene is unloading or loading. Gameplay input pauses meanwhile. */
  busy = false;
  /** Seconds since the current scene loaded. */
  time = 0;
  private readonly scenes = new Map<string, Scene>();

  constructor(private readonly deps: SceneManagerDeps) {
    deps.state.events.on('time', () => this.applyAtmosphere());
  }

  register(...scenes: Scene[]): void {
    scenes.forEach((scene) => this.scenes.set(scene.id, scene));
  }

  get ids(): string[] {
    return [...this.scenes.keys()];
  }

  /** Loads a scene and puts the player at a named spawn point or an exact pose. */
  async load(id: string, where: string | PlayerPose = 'default', fadeSeconds = 0.8): Promise<void> {
    const scene = this.scenes.get(id);
    if (!scene) throw new Error(`Unknown scene "${id}". Known: ${this.ids.join(', ')}`);
    if (this.busy) return;
    this.busy = true;
    const { world, state, audio, overlay, context } = this.deps;

    if (this.current) {
      FADED_BUSES.forEach((bus) => audio.fadeBus(bus, 0, fadeSeconds));
      await overlay.fade(1, fadeSeconds);
      this.current.dispose?.(context);
      disposeTree(world.scene);
      world.clear();
    } else {
      await overlay.fade(1, 0);
    }

    this.current = scene;
    state.scene = id;
    const session = new KitSession({ world, audio, scene: context, goTo: context.goTo, say: (text) => context.say(text) });
    await scene.build(session.kit, context);
    session.finish();
    this.applyAtmosphere();
    this.placePlayer(scene, where);
    this.time = 0;

    FADED_BUSES.forEach((bus) => audio.fadeBus(bus, audio.busLevel(bus), fadeSeconds));
    this.busy = false;
    await overlay.fade(0, fadeSeconds);
  }

  update(dt: number): void {
    if (!this.current || this.busy) return;
    this.time += dt;
    this.deps.world.updates.forEach((update) => update(dt));
    this.current.update?.(dt, this.deps.context);
  }

  private placePlayer(scene: Scene, where: string | PlayerPose): void {
    const { world, player } = this.deps;
    const pose = typeof where === 'string' ? (scene.spawns[where] ?? scene.spawns.default) : where;
    const ground = world.ground.sample(pose.x, pose.z, pose.y ?? Infinity);
    player.place(pose.x, ground.height, pose.z, pose.yaw);
    world.triggers.settle({ x: pose.x, z: pose.z });
  }

  private applyAtmosphere(): void {
    if (!this.current) return;
    const { renderer, player, world, state } = this.deps;
    const atmosphere = this.current.atmosphere[state.time];
    const result = applyAtmosphere(atmosphere);
    renderer.background = result.background;
    renderer.saturation = result.saturation;
    player.camera.far = result.far;
    player.camera.updateProjectionMatrix();
    world.lights.flashlightOn = atmosphere.flashlight ?? state.time === 'night';
  }
}

function disposeTree(root: Object3D): void {
  root.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    object.geometry.dispose();
    const materials: Material[] = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => material.dispose());
  });
}
