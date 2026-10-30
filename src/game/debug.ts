import type { Action } from '../engine/input/bindings';
import type { Game } from './game';
import type { PlayerPose, TimeOfDay } from './state';

export interface DebugParams {
  scene?: string;
  time?: TimeOfDay;
  flags: string[];
  pose?: PlayerPose;
}

/**
 * Reads `?scene=<id>&time=<day|night>&flags=a,b&pos=x,y,z&yaw=deg` from a query string.
 * `yaw` without `pos` is ignored, because a spawn point brings its own facing.
 */
export function parseDebugParams(search: string): DebugParams {
  const params = new URLSearchParams(search);
  const time = params.get('time');
  const pos = params.get('pos')?.split(',').map(Number);
  const result: DebugParams = {
    flags: (params.get('flags') ?? '').split(',').filter(Boolean),
  };
  const scene = params.get('scene');
  if (scene) result.scene = scene;
  if (time === 'day' || time === 'night') result.time = time;
  if (pos && pos.length === 3 && pos.every(Number.isFinite)) {
    const [x, y, z] = pos as [number, number, number];
    result.pose = { x, y, z, yaw: Number(params.get('yaw') ?? 0) || 0 };
  }
  return result;
}

/** Helpers for automated tests and screenshots, exposed as `window.__game`. */
export interface DebugHooks {
  /** True once the first scene, or the title screen, has loaded and faded in. */
  ready: boolean;
  game: Game;
  state: () => ReturnType<Game['state']['snapshot']>;
  pose: () => PlayerPose;
  scenes: () => string[];
  loadScene: (id: string, at?: string | PlayerPose) => Promise<void>;
  teleport: (x: number, y: number, z: number, yawDeg: number) => void;
  setTime: (time: TimeOfDay) => void;
  /** Holds an action for a number of frames, then releases it. */
  press: (action: Action, frames?: number) => Promise<void>;
  waitFrames: (count: number) => Promise<void>;
  /** The visible interaction prompt text, or null. */
  prompt: () => string | null;
  /** The dialogue step on screen, or null. */
  dialogue: () => unknown;
}

declare global {
  interface Window {
    __game?: DebugHooks;
  }
}

export function installDebugHooks(game: Game): DebugHooks {
  const hooks: DebugHooks = {
    ready: false,
    game,
    state: () => game.state.snapshot(),
    pose: () => game.pose(),
    scenes: () => game.scenes.ids,
    loadScene: (id, at) => game.scenes.load(id, at ?? 'default', 0),
    teleport: (x, y, z, yaw) => game.player.place(x, y, z, yaw),
    setTime: (time) => (game.state.time = time),
    press: async (action, frames = 2) => {
      game.input.simulate(action, true);
      await game.waitFrames(frames);
      game.input.simulate(action, false);
      await game.waitFrames(1);
    },
    waitFrames: (count) => game.waitFrames(count),
    prompt: () => game.overlay.prompt.text,
    dialogue: () => game.ui.dialogueStep,
  };
  window.__game = hooks;
  return hooks;
}
