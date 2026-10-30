import type { StateView } from '../../game/conditions';
import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { playNode } from '../forest_path/play';
import { handText, scrawl } from '../forest_path/scrawl';
import type { StoryPhase } from '../forest_path/story';

/** The answer is under the reporter's line on night 3, or on any day after the day they wrote. */
export const logbookAnswered = (state: StateView): boolean =>
  state.hasFlag('wrote_in_logbook') && (state.count('night') === 3 || state.count('day') > state.count('logbook_day'));

const REPLIES = { logbook_wrote_harm: ['ALORS FRAPPEZ.'], logbook_wrote_who: ["PERSONNE. C'EST", 'ÉCRIT SUR LA PIERRE.'] } as const;
const LINES = { logbook_wrote_harm: 'Je ne vous veux pas de mal.', logbook_wrote_who: 'Qui êtes-vous ?' } as const;

/**
 * The teenagers' logbook open on the guard room desk, a pencil stub tied to it with string. By
 * day 2 or 3 the reporter can write a line under "NE TOUCHEZ PAS AU FOND"; reading it again once
 * it is answered plays the reply, and `onAnswerRead` runs after.
 */
export function logbook(kit: LevelKit, ctx: SceneContext, phase: StoryPhase, onAnswerRead: () => void): void {
  const { state } = ctx;
  const answered = logbookAnswered(state);
  const written = (['logbook_wrote_harm', 'logbook_wrote_who'] as const).find((flag) => state.hasFlag(flag));
  kit
    .group((g) => {
      g.box({ w: 0.26, h: 0.05, d: 0.34 }).color(0x5a5446);
      const page = scrawl(g, { w: 0.24, h: 0.32 }, [48, 64], (c) => {
        c.fillStyle = '#b4ae9a';
        c.fillRect(0, 0, 48, 64);
        // Lines of teenage biro: dates, names, nothing that matters at this size.
        [5, 10, 15, 20, 25, 30].forEach((y, i) => {
          c.fillStyle = i % 2 ? '#3a3c5a' : '#4a3a3a';
          c.fillRect(3, y, 24 + ((i * 7) % 17), 1);
        });
        handText(c, 'NE TOUCHEZ PAS AU FOND', 3, 36, { size: 4, color: '#2a2824', font: 'monospace' });
        if (written) handText(c, LINES[written], 3, 43, { size: 5, color: '#5a5a58', angle: -2 });
        if (written && answered) REPLIES[written].forEach((line, i) => handText(c, line, 3, 50 + i * 5, { size: 4, color: '#2a2824', font: 'monospace' }));
      });
      page.at(0, 0.052, 0.16).object.rotation.x = -Math.PI / 2;
      // Lying across the page once the answer is there; on the desk beside the book until then.
      const pencil = g.cylinder({ r: 0.006, h: 0.12, sides: 5 }).color(0x8a6a3a);
      if (answered) pencil.at(0.05, 0.058, 0).object.rotation.set(0, 0.6, Math.PI / 2);
      else pencil.at(0.28, 0.006, 0.05).object.rotation.set(0, -0.2, Math.PI / 2);
      g.box({ w: answered ? 0.06 : 0.16, h: 0.003, d: 0.004 }).color(0xb0a890).at(answered ? 0.1 : 0.17, answered ? 0.054 : 0.002, 0.12);
    })
    .at(-4.5, 0.77, -17.5)
    .rotY(-8);

  kit
    .hotspot({
      prompt: 'Read the logbook',
      radius: 0.35,
      onInteract: async () => {
        if (!logbookAnswered(state)) return playNode(ctx, 'fort_logbook');
        await playNode(ctx, 'fort_logbook_reply');
        onAnswerRead();
      },
    })
    .at(-4.5, 0, -17.4);
  if (phase !== 'day2' && phase !== 'day3') return;
  kit
    .hotspot({
      prompt: 'Write in the logbook',
      radius: 0.3,
      enabled: () => !state.hasFlag('wrote_in_logbook'),
      onInteract: async () => {
        await playNode(ctx, 'fort_logbook_write');
        if (state.hasFlag('wrote_in_logbook')) state.setCount('logbook_day', state.count('day'));
      },
    })
    .at(-3.95, 0, -17.4);
}
