import type { AudioManager } from '../engine/audio/audioManager';
import type { Input } from '../engine/input/input';
import type { Player } from '../engine/player';
import type { Atmosphere } from '../engine/render/atmosphere';
import type { DialogueScript } from './dialogue';
import type { ScreenHandle } from './gameUi';
import type { LevelKit } from './kit/levelKit';
import type { GameState, TimeOfDay } from './state';

export interface Spawn {
  x: number;
  z: number;
  /** Degrees. 0 looks down -Z, 90 looks down -X. */
  yaw: number;
  /** Omit to stand on the ground at (x, z). */
  y?: number;
}

/** What a scene can reach while it builds and runs. */
export interface SceneContext {
  readonly state: GameState;
  readonly audio: AudioManager;
  readonly player: Player;
  /** Loads a scene with a fade. `spawn` names one of its spawn points. */
  goTo(scene: string, spawn?: string): void;
  /** Plays a dialogue script and resolves when it ends. */
  dialogue(script: DialogueScript): Promise<void>;
  /** Shows lines in the dialogue box, with an optional speaker, and resolves when dismissed. */
  say(lines: string | string[], speaker?: string): Promise<void>;
  /** Shows a short line in the corner of the screen. */
  notify(text: string): void;
  /** Seconds since this scene finished loading. */
  readonly time: number;
  /** True while a dialogue, menu, or scene change holds the player still. */
  readonly paused: boolean;
  /**
   * Shows a full-frame screen, such as a computer desktop, and gives it all input until the
   * handle closes. Dialogues still show on top and hand input back to the screen.
   */
  openScreen(element: HTMLElement, update: (dt: number, input: Input) => void): ScreenHandle;
}

export interface Scene {
  id: string;
  /** Named places the player can arrive at. "default" is used when no name is given. */
  spawns: { default: Spawn } & Record<string, Spawn>;
  /** Fog and light for each time of day. */
  atmosphere: Record<TimeOfDay, Atmosphere>;
  /** Builds the level. Colliders, lights, and triggers take effect when this returns. */
  build(kit: LevelKit, ctx: SceneContext): void | Promise<void>;
  /** Runs every frame while the scene is loaded. */
  update?(dt: number, ctx: SceneContext): void;
  /** Runs before the scene unloads. Meshes, colliders, lights, and sounds are cleaned up anyway. */
  dispose?(ctx: SceneContext): void;
}

/** Identity function that gives a scene object its type. */
export function defineScene(scene: Scene): Scene {
  return scene;
}
