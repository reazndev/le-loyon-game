import { Vector3, type Object3D } from 'three';
import { characterIds } from '../engine/characters/cast';
import type { Action } from '../engine/input/bindings';
import { promptText } from '../engine/interactions';
import { playerTuning } from '../engine/player';
import type { Game } from './game';
import type { PlayerPose, TimeOfDay } from './state';

export interface DebugParams {
  scene?: string;
  time?: TimeOfDay;
  flags: string[];
  /** Story counts such as `day` and `night`. */
  counts: Record<string, number>;
  pose?: PlayerPose;
}

/** The story counts the URL can set. */
const COUNT_PARAMS = ['day', 'night'] as const;

/**
 * Reads `?scene=<id>&time=<day|night>&day=n&night=n&flags=a,b&pos=x,y,z&yaw=deg` from a query
 * string. `yaw` without `pos` is ignored, because a spawn point brings its own facing.
 */
export function parseDebugParams(search: string): DebugParams {
  const params = new URLSearchParams(search);
  const time = params.get('time');
  const pos = params.get('pos')?.split(',').map(Number);
  const result: DebugParams = {
    flags: (params.get('flags') ?? '').split(',').filter(Boolean),
    counts: Object.fromEntries(COUNT_PARAMS.filter((name) => /^\d+$/.test(params.get(name) ?? '')).map((name) => [name, Number(params.get(name))])),
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
  /** What holds the input: a dialogue, a document, another screen or menu, or nothing. */
  modal: () => 'dialogue' | 'document' | 'screen' | null;
  /** Interaction points that are enabled now, with their prompts and positions. */
  hotspots: () => Hotspot[];
  /**
   * Stands the player on free ground in reach of the enabled interaction with this prompt, facing
   * it, so that it is the one in focus. With several, takes the one closest to `near`, or to the
   * player. Returns false when there is none or no spot works.
   */
  approach: (prompt: string, near?: { x: number; z: number }) => boolean;
  /** Characters in the scene by cast id, with their positions and whether they are shown. */
  characters: () => { id: string; x: number; z: number; visible: boolean }[];
  /** Multiplies the game clock, to get through held actions and long waits. 1 is normal. */
  setSpeed: (factor: number) => void;
}

export interface Hotspot {
  prompt: string;
  x: number;
  z: number;
  radius: number;
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
    modal: () => (game.ui.dialogueStep ? 'dialogue' : game.ui.documentTitle ? 'document' : game.ui.open ? 'screen' : null),
    hotspots: () =>
      game.world.interactions.enabled().map((item) => ({ prompt: promptText(item), x: item.position.x, z: item.position.z, radius: item.radius })),
    approach: (prompt, near) => approach(game, prompt, near),
    characters: () => {
      const cast: Object3D[] = [];
      game.world.scene.traverse((object) => (characterIds as readonly string[]).includes(object.name) && cast.push(object));
      return cast.map((object) => {
        const at = object.getWorldPosition(new Vector3());
        return { id: object.name, x: at.x, z: at.z, visible: object.visible };
      });
    },
    setSpeed: (factor) => (game.timeScale = factor),
  };
  window.__game = hooks;
  return hooks;
}

/** Distances past an interaction's radius to try standing at, and how many directions around it. */
const REACHES = [0.45, 0.8, 0.2];
const DIRECTIONS = 24;

function approach(game: Game, prompt: string, near?: { x: number; z: number }): boolean {
  const { world, player } = game;
  const from = near ?? { x: player.position.x, z: player.position.z };
  const targets = world.interactions
    .enabled()
    .filter((item) => promptText(item) === prompt)
    .sort((a, b) => Math.hypot(a.position.x - from.x, a.position.z - from.z) - Math.hypot(b.position.x - from.x, b.position.z - from.z));
  for (const target of targets) {
    const { x, z } = target.position;
    // Start from the side the player is on, then go round.
    const toward = Math.atan2(player.position.z - z, player.position.x - x);
    for (const reach of REACHES) {
      for (let i = 0; i < DIRECTIONS; i++) {
        const angle = toward + (i % 2 ? 1 : -1) * Math.ceil(i / 2) * ((2 * Math.PI) / DIRECTIONS);
        const spot = { x: x + Math.cos(angle) * (target.radius + reach), z: z + Math.sin(angle) * (target.radius + reach) };
        const free = world.collision.resolve(spot.x, spot.z, playerTuning.radius);
        if (Math.hypot(free.x - spot.x, free.z - spot.z) > 1e-3) continue;
        const facing = { x: x - spot.x, z: z - spot.z };
        const length = Math.hypot(facing.x, facing.z) || 1;
        if (world.interactions.focus(spot, { x: facing.x / length, z: facing.z / length }) !== target) continue;
        const yaw = (Math.atan2(-facing.x, -facing.z) * 180) / Math.PI;
        player.place(spot.x, world.ground.sample(spot.x, spot.z).height, spot.z, yaw);
        return true;
      }
    }
  }
  return false;
}
