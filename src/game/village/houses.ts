import type { Object3D } from 'three';
import { nowAndThen, particles } from '../ambient';
import type { LevelKit } from '../kit/levelKit';
import type { SceneContext } from '../scene';

/** Signs that someone is at home: smoke from the chimneys and lights going on and off. */

export interface Chimney {
  x: number;
  z: number;
  /** Height of the chimney's mouth, a little above the roof where it comes through. */
  top: number;
}

/**
 * A stove chimney on a roof, with wood smoke going up from it and leaning off with the wind.
 * The smoke is one particle field: one draw call, nothing per frame.
 */
export function chimneySmoke(kit: LevelKit, chimney: Chimney, wind: number, seed: string): void {
  kit.box({ w: 0.45, h: 1.4, d: 0.45 }).texture('render_wall', { tile: 1 }).color(0x8a8680).at(chimney.x, chimney.top - 1.4, chimney.z);
  kit.box({ w: 0.55, h: 0.08, d: 0.55 }).color(0x4a4642).at(chimney.x, chimney.top, chimney.z);
  const drift = 0.15 + wind * 0.7;
  const rise = 4.5;
  particles(kit, {
    count: 14,
    box: [0.9 + drift * 3, rise, 0.9],
    velocity: [drift, 0.5, 0.05],
    sway: [0.3, 0.15, 0.3],
    speed: 0.3,
    size: 0.9,
    shape: 'soft',
    color: 0x8c8a86,
    opacity: 0.32,
    seed,
  }).at(chimney.x + drift * 1.5, chimney.top + rise / 2, chimney.z);
}

/** The window and the time of day it is lived in. */
export type WindowHours =
  /** Late afternoon going on dusk: dark windows come on one by one, and now and then one goes off for a while as someone leaves the room. */
  | 'dusk'
  /** Night: the lit windows go out one by one, a minute or so apart, and stay out. */
  | 'bedtime';

/**
 * Lit window panes that change while the player is in the scene. Pass the panes' meshes; each
 * shows by being visible. At dusk half start dark; at bedtime all start lit.
 */
export function windowLife(kit: LevelKit, ctx: SceneContext, panes: readonly Object3D[], hours: WindowHours): void {
  if (panes.length === 0) return;
  const shuffled = [...panes].sort(() => Math.random() - 0.5);
  if (hours === 'bedtime') {
    nowAndThen(kit, ctx, 55, () => {
      const lit = shuffled.find((pane) => pane.visible);
      if (lit) lit.visible = false;
    }, 40);
    return;
  }
  const waiting = shuffled.slice(0, Math.ceil(shuffled.length / 2));
  waiting.forEach((pane) => (pane.visible = false));
  nowAndThen(kit, ctx, 35, () => {
    const next = waiting.shift();
    if (next) {
      next.visible = true;
      return;
    }
    // Everyone is home: someone goes into another room, and the light follows a little later.
    const pane = shuffled[Math.floor(Math.random() * shuffled.length)]!;
    pane.visible = !pane.visible;
  }, 25);
}
