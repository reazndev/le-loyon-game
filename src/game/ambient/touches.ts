import type { AudioManager } from '../../engine/audio/audioManager';
import { noiseBurst } from '../../engine/audio/generators';
import { oneShot } from '../../engine/characters/voices';
import type { BrushKind } from '../../engine/ui/overlay';
import type { LevelKit } from '../kit/levelKit';
import type { SceneContext } from '../scene';
import { preloadRecordings, rustle } from './recordings';
import { everyFrame, nowAndThen } from './schedule';

/** Meters per second above which the reporter counts as walking into things. */
const MOVING = 0.6;

/** The sound of something brushing the face, right at the ears: leaves, or a dry faint whisper. */
export function brushSound(audio: AudioManager, kind: BrushKind): void {
  if (kind === 'branch') return rustle(audio, 'leaves', { volume: 0.9, bus: 'sfx' });
  oneShot(audio, { volume: 0.35 }, 1.2, (out, t) => {
    noiseBurst(audio, out, { start: t, duration: 0.5, type: 'highpass', frequency: 5000, gain: 0.25, attack: 0.15 });
    noiseBurst(audio, out, { start: t + 0.1, duration: 0.7, type: 'bandpass', frequency: 2400, q: 6, gain: 0.08, attack: 0.3 });
  });
}

/**
 * Branches brushing the reporter's face as they push through the trees, on average every
 * `every` seconds, only while they are moving.
 */
export function touches(kit: LevelKit, ctx: SceneContext, every: number): void {
  preloadRecordings(ctx.audio, ['leaves']);
  const last = { x: ctx.player.position.x, z: ctx.player.position.z };
  let speed = 0;
  everyFrame(kit, (dt) => {
    const p = ctx.player.position;
    speed = Math.hypot(p.x - last.x, p.z - last.z) / Math.max(dt, 1e-4);
    last.x = p.x;
    last.z = p.z;
  });
  nowAndThen(kit, ctx, every, () => speed > MOVING && ctx.brush('branch'));
}
