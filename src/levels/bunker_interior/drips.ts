import type { AudioManager, Point3 } from '../../engine/audio/audioManager';
import { noiseBurst } from '../../engine/audio/generators';
import type { SceneContext } from '../../game/scene';
import { neighbors, roomAt, type Opening, type Room } from './rooms';

/** One drop of water falling into a puddle on concrete. */
export function drip(audio: AudioManager, at: Point3, volume = 0.5): void {
  const output = audio.output({ bus: 'ambience', volume, at, refDistance: 2.5 });
  const t = audio.now;
  const pitch = 1100 + Math.random() * 900;
  const plip = new OscillatorNode(audio.context, { frequency: pitch });
  const envelope = new GainNode(audio.context, { gain: 0 });
  plip.frequency.exponentialRampToValueAtTime(pitch * 0.55, t + 0.06);
  envelope.gain.setValueAtTime(0, t);
  envelope.gain.linearRampToValueAtTime(0.35, t + 0.003);
  envelope.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
  plip.connect(envelope).connect(output.input);
  plip.start(t);
  plip.stop(t + 0.12);
  noiseBurst(audio, output.input, { start: t, duration: 0.02, type: 'highpass', frequency: 3500, gain: 0.2 });
  setTimeout(() => output.release(0.2), 600);
}

/**
 * bun2_drip: water drips somewhere in the fort, always in a room next to the one the player
 * is in, wherever they go. Returns the scene's per-frame update.
 */
export function dripInTheNextRoom(rooms: readonly Room[], openings: readonly Opening[], interval = 4.5): (dt: number, ctx: SceneContext) => void {
  let wait = interval;
  let current: Room | null = null;
  let source: Point3 | null = null;
  return (dt, ctx) => {
    current = roomAt(rooms, ctx.player.position.x, ctx.player.position.z) ?? current;
    wait -= dt;
    if (wait > 0 || !current) return;
    wait = interval * (0.6 + Math.random() * 0.9);
    const next = rooms.filter((room) => neighbors(openings, current!.id).includes(room.id));
    if (!next.length) return;
    // The same leak keeps dripping until the player moves on, then it is in the next room again.
    if (!source || roomAt(rooms, source.x, source.z) === current || !next.includes(roomAt(rooms, source.x, source.z)!)) {
      const room = next[Math.floor(Math.random() * next.length)]!;
      source = { x: room.x0 + Math.random() * (room.x1 - room.x0), y: 0.1, z: room.z0 + Math.random() * (room.z1 - room.z0) };
    }
    drip(ctx.audio, source);
  };
}
