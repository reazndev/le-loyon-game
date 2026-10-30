import type { AudioManager, Point3, SoundHandle } from '../../engine/audio/audioManager';
import type { LevelKit } from '../kit/levelKit';
import type { SceneContext } from '../scene';
import { animalCall } from './recordings';
import { around, everyFrame, nowAndThen } from './schedule';

/** Recordings in `public/assets/audio/forest/`. Sources in docs/credits.md. */
const url = (name: string) => `${import.meta.env.BASE_URL}assets/audio/forest/${name}.ogg`;

/** Field crickets, a dark bush-cricket, and a tree cricket's steady trill, each a seamless loop. */
type Song = 'cricket_field_1' | 'cricket_field_2' | 'cricket_bush' | 'cricket_tree';
const DAY_SONGS: Song[] = ['cricket_field_1', 'cricket_field_2', 'cricket_bush'];
const NIGHT_SONGS: Song[] = ['cricket_tree', 'cricket_field_1', 'cricket_bush', 'cricket_field_2', 'cricket_tree'];

/** Meters from the reporter a cricket sits in the grass, near and far. */
const SPREAD: [number, number] = [6, 18];
/** Left this far behind, a cricket moves up to sing near the reporter again. */
const LEFT_BEHIND = 30;
/** A cricket goes quiet when the reporter comes this close, and sings again once they are this far off. */
const HUSH = 4;
const RESUME = 9;

interface Caller {
  name: string;
  takes: number;
  /** Average seconds between calls. */
  every: number;
  distance: [number, number];
  height: number;
  volume: number;
}

/** Average seconds between the night owl's calls, and how long the other takes to answer. */
const OWL_EVERY = 30;
const OWL_ANSWER: [number, number] = [2, 5];

/** Autumn birds by day; at night the crickets share the forest with a pair of owls. */
const DAY_CALLS: Caller[] = [
  { name: 'robin', takes: 3, every: 25, distance: [12, 30], height: 4, volume: 0.35 },
  { name: 'wren', takes: 2, every: 45, distance: [10, 25], height: 1, volume: 0.3 },
  { name: 'woodpecker', takes: 5, every: 35, distance: [25, 60], height: 8, volume: 0.45 },
  { name: 'jay', takes: 4, every: 60, distance: [20, 45], height: 6, volume: 0.4 },
];

/**
 * Small life in the forest: crickets chirping on and on in the grass around the reporter, by day
 * robins, a wren, a woodpecker drumming, and a jay's screech, and at night two owls calling to
 * each other, one in the trees nearby and one further off. Each cricket stops when the reporter
 * walks up to it and starts again once they have passed, like the real thing.
 */
export function forestLife(kit: LevelKit, ctx: SceneContext): void {
  const night = ctx.state.time === 'night';
  (night ? NIGHT_SONGS : DAY_SONGS).forEach((song) => cricket(kit, ctx, song, night ? 0.5 : 0.3));
  if (night) {
    nowAndThen(kit, ctx, OWL_EVERY, () => {
      animalCall(ctx.audio, 'owl', { at: around(ctx, 15 + Math.random() * 15, 8), volume: 0.6 });
      const answer = OWL_ANSWER[0] + Math.random() * (OWL_ANSWER[1] - OWL_ANSWER[0]);
      setTimeout(() => animalCall(ctx.audio, 'owl', { at: around(ctx, 40 + Math.random() * 20, 10), volume: 0.4 }), answer * 1000);
    }, 8);
    return;
  }
  DAY_CALLS.forEach((caller) =>
    nowAndThen(kit, ctx, caller.every, () => {
      const take = 1 + Math.floor(Math.random() * caller.takes);
      const distance = caller.distance[0] + Math.random() * (caller.distance[1] - caller.distance[0]);
      ctx.audio.play(url(`${caller.name}_${take}`), {
        bus: 'ambience',
        volume: caller.volume,
        rate: 0.95 + Math.random() * 0.1,
        at: around(ctx, distance, caller.height),
        refDistance: 3,
      });
    }),
  );
}

/** One cricket on a loop, placed in the grass near the reporter, hushing as they come close. */
function cricket(kit: LevelKit, ctx: SceneContext, song: Song, volume: number): void {
  const spot = (): Point3 => around(ctx, SPREAD[0] + Math.random() * (SPREAD[1] - SPREAD[0]), 0.1);
  let at = spot();
  const { output, handle } = loopAt(ctx.audio, url(song), at);
  kit.use((k) => k.world.sounds.track(handle));
  let quiet = false;
  everyFrame(kit, () => {
    const p = ctx.player.position;
    const distance = Math.hypot(p.x - at.x, p.z - at.z);
    if (distance > LEFT_BEHIND) {
      at = spot();
      output.panner!.positionX.value = at.x;
      output.panner!.positionY.value = at.y;
      output.panner!.positionZ.value = at.z;
    }
    if (!quiet && distance < HUSH) quiet = true;
    if (quiet && distance > RESUME) quiet = false;
    // Hushes at once, but takes a few seconds to dare again.
    output.input.gain.setTargetAtTime(quiet ? 0 : volume, ctx.audio.now, quiet ? 0.08 : 2);
  });
}

/** A looping recording at a point, from a random place in it and a little off pitch, so no two match. */
function loopAt(audio: AudioManager, file: string, at: Point3): { output: ReturnType<AudioManager['output']>; handle: SoundHandle } {
  const output = audio.output({ bus: 'ambience', volume: 0, at, refDistance: 2 });
  let source: AudioBufferSourceNode | null = null;
  let stopped = false;
  void audio.load(file).then((buffer) => {
    if (stopped) return;
    source = audio.context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.playbackRate.value = 0.94 + Math.random() * 0.12;
    source.connect(output.input);
    source.start(0, Math.random() * buffer.duration);
  });
  return {
    output,
    handle: {
      stop: (fade = 0.5) => {
        stopped = true;
        output.release(fade);
        source?.stop(audio.now + fade + 0.05);
      },
    },
  };
}
