import { describe, expect, it } from 'vitest';
import type { Condition, Effect } from '../game/conditions';
import { DialogueRunner, validateScript, type DialogueStep } from '../game/dialogue';
import { GameState } from '../game/state';
import { dialogues, entries, scriptNodes } from './dialogues';
import { documents } from './documents';
import { caught, endings } from './endings';
import { counts, derivedFlags, storyFlags } from './flags';
import { items } from './items';
import { notebook } from './notebook';
import { PAGE_LINES, PAGE_WIDTH } from './paginate';
import { speakers } from './speakers';
import { splitTranslation } from './translation';

const knownFlags = new Set<string>([...storyFlags, ...Object.keys(derivedFlags)]);
const storedFlags = new Set<string>(storyFlags);
const knownItems = new Set(Object.keys(items));
const knownCounts = new Set(Object.keys(counts));
const list = (v: string | string[] | undefined) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);

function conditionProblems(c: Condition | undefined, where: string): string[] {
  if (!c) return [];
  return [
    ...[...list(c.flag), ...list(c.notFlag)].filter((f) => !knownFlags.has(f)).map((f) => `${where}: unknown flag ${f}`),
    ...[...list(c.item), ...list(c.notItem)].filter((i) => !knownItems.has(i)).map((i) => `${where}: unknown item ${i}`),
    ...(c.count ?? []).filter(([name]) => !knownCounts.has(name)).map(([name]) => `${where}: unknown count ${name}`),
    ...[...(c.any ?? []), ...(c.all ?? []), ...(c.not ? [c.not] : [])].flatMap((sub) => conditionProblems(sub, where)),
  ];
}

function effectProblems(e: Effect | undefined, where: string): string[] {
  if (!e) return [];
  const inRange = (name: string, value: number) => {
    const range = counts[name as keyof typeof counts];
    return range !== undefined && value >= range.min && value <= range.max;
  };
  return [
    ...[...list(e.set), ...list(e.clear)].filter((f) => !storedFlags.has(f)).map((f) => `${where}: cannot store flag ${f}`),
    ...[...list(e.give), ...list(e.take)].filter((i) => !knownItems.has(i)).map((i) => `${where}: unknown item ${i}`),
    ...Object.keys(e.add ?? {}).filter((n) => !knownCounts.has(n)).map((n) => `${where}: unknown count ${n}`),
    ...Object.entries(e.assign ?? {}).filter(([n, v]) => !inRange(n, v)).map(([n, v]) => `${where}: ${n} = ${v} is out of range`),
  ];
}

const allLines = Object.entries(scriptNodes).flatMap(([id, node]) => [
  ...node.lines.map((l) => ({ id, text: typeof l === 'string' ? l : l.text })),
  ...(node.choices ?? []).map((c) => ({ id, text: c.text })),
]);

describe('dialogues', () => {
  it('only reference known flags, counts, and items', () => {
    const problems = [
      ...Object.entries(scriptNodes).flatMap(([id, node]) => [
        ...conditionProblems(node.if, id),
        ...effectProblems(node.effects, id),
        ...node.lines.flatMap((l) => (typeof l === 'string' ? [] : conditionProblems(l.if, id))),
        ...(node.choices ?? []).flatMap((c) => [...conditionProblems(c.if, id), ...effectProblems(c.effects, id)]),
        ...(Array.isArray(node.next) ? node.next.flatMap((j) => conditionProblems(j.if, id)) : []),
      ]),
      ...Object.entries(entries).flatMap(([who, table]) => table.flatMap((row) => conditionProblems(row.if, `${who} entry`))),
    ];
    expect(problems).toEqual([]);
  });

  it('only jump to nodes that exist', () => {
    expect(Object.values(dialogues).flatMap(validateScript)).toEqual([]);
  });

  it('keep every line and choice within 120 characters, not counting the translation', () => {
    const long = allLines.filter(({ text }) => splitTranslation(text).text.length > 120);
    expect(long).toEqual([]);
  });

  it('have no empty lines', () => {
    expect(allLines.filter(({ text }) => text.trim() === '')).toEqual([]);
  });

  it('keep entry ids apart from node ids', () => {
    expect(Object.keys(entries).filter((id) => id in scriptNodes)).toEqual([]);
  });
});

/** Plays a dialogue, picking choices by text, and returns every step shown. */
function play(script: (typeof dialogues)[keyof typeof dialogues], state: GameState, picks: string[] = []): DialogueStep[] {
  const runner = new DialogueRunner(script, state);
  const steps = [runner.step];
  const queue = [...picks];
  while (runner.step.kind !== 'end') {
    const step = runner.step;
    if (step.kind === 'choice') {
      const pick = queue.shift();
      if (pick === undefined) break;
      steps.push(runner.choose(step.choices.indexOf(pick)));
    } else steps.push(runner.advance());
  }
  return steps;
}

const texts = (steps: DialogueStep[]) => steps.flatMap((s) => (s.kind === 'end' ? [] : [s.text ?? '']));

describe('playing the converted script', () => {
  it('ends a node dialogue at once when its condition fails', () => {
    const state = new GameState();
    expect(play(dialogues.square_phonebox_night, state)).toEqual([{ kind: 'end' }]);
    state.setCount('night', 1);
    expect(play(dialogues.square_phonebox_night, state)[0]).toMatchObject({ kind: 'line' });
  });

  it('follows the entry table, treating day rows as daytime only', () => {
    const state = new GameState();
    state.setFlag('inn_checked_in');
    state.setCount('day', 1);
    expect(play(dialogues.monique, state)[0]).toMatchObject({ speaker: speakers.monique });
    state.setCount('night', 1);
    expect(texts(play(dialogues.monique, state))[0]).toMatch(/The café is dark/);
  });

  it("opens Monique's second dinner only with the shovel and the suspicion", () => {
    const state = new GameState();
    state.setFlag('inn_checked_in');
    state.setCount('day', 2);
    const dinner = /Rösti tonight/;
    expect(texts(play(dialogues.monique, state)).some((t) => dinner.test(t))).toBe(false);
    state.giveItem('shovel');
    state.setFlag('read_register');
    state.setFlag('bernard_light_coffin');
    expect(texts(play(dialogues.monique, state, ["Don't tell anyone."])).some((t) => dinner.test(t))).toBe(true);
  });

  it('allows the masked photo only with enough trust', () => {
    const ask = 'May I take your picture? Just the mask.';
    const state = new GameState();
    state.setCount('marc_trust', 2);
    play(dialogues.marc_photo_ask, state, [ask]);
    expect(state.hasItem('photo_marc_masked')).toBe(true);
    const low = new GameState();
    low.setCount('marc_trust', 1);
    play(dialogues.marc_photo_ask, low, [ask, 'Put it away.']);
    expect(low.hasItem('photo_marc_masked')).toBe(false);
  });

  it('raises trust with the food and takes the parcel', () => {
    const state = new GameState();
    state.giveItem('food_parcel');
    play(dialogues.marc_monologue_1, state, ['I brought bread. And cheese.']);
    expect(state.count('marc_trust')).toBe(1);
    expect(state.hasItem('food_parcel')).toBe(false);
  });

  it('labels Marc as Le Loyon until he says his name', () => {
    const steps = play(dialogues.marc_monologue_1, new GameState(), ['Who are you?']);
    const speakersSeen = steps.flatMap((s) => (s.kind === 'end' ? [] : [s.speaker]));
    expect(speakersSeen[0]).toBe(speakers.loyon);
    expect(speakersSeen).toContain(speakers.marc);
  });

  it('shows conditional lines only when they hold', () => {
    const state = new GameState();
    state.setCount('day', 3);
    expect(texts(play(dialogues.bernard_day3, state)).some((t) => t.includes('My wife'))).toBe(false);
    state.setFlag('read_register');
    expect(texts(play(dialogues.bernard_day3, state)).some((t) => t.includes('My wife'))).toBe(true);
  });

  it('routes the publish call by evidence', () => {
    const weak = new GameState();
    expect(texts(play(dialogues.ending_publish_route, weak)).join(' ')).toMatch(/Page nine/);
    const strong = new GameState();
    strong.giveItem('gremaud_letter');
    expect(texts(play(dialogues.ending_publish_route, strong)).join(' ')).toMatch(/front page/);
  });
});

describe('documents', () => {
  it('fit the document view', () => {
    const pages = Object.entries(documents).flatMap(([id, doc]) =>
      [...doc.pages, ...(doc.translation ?? [])].map((page) => ({ id, lines: page.split('\n') })),
    );
    expect(pages.filter((p) => p.lines.length > PAGE_LINES).map((p) => p.id)).toEqual([]);
    expect(pages.filter((p) => p.lines.some((l) => l.length > PAGE_WIDTH)).map((p) => p.id)).toEqual([]);
  });

  it('exist for every item that links one', () => {
    const missing = Object.entries(items).filter(([, item]) => 'document' in item && !(item.document in documents));
    expect(missing).toEqual([]);
  });
});

describe('notebook and endings', () => {
  it('only reference known flags, counts, and items', () => {
    const problems = [
      ...Object.entries(notebook).flatMap(([flag, entry]) => [
        ...(knownFlags.has(flag) ? [] : [`notebook: unknown flag ${flag}`]),
        ...conditionProblems('if' in entry ? entry.if : undefined, `notebook ${flag}`),
      ]),
      ...Object.entries(endings).flatMap(([id, ending]) => [
        ...ending.articles.flatMap((a) => [a.if, ...a.paragraphs.map((p) => p.if)]).flatMap((c) => conditionProblems(c, id)),
        ...ending.epilogue.flatMap((p) => conditionProblems(p.if, id)),
      ]),
      ...caught.texts.flatMap((t) => conditionProblems(t.if, 'caught')),
    ];
    expect(problems).toEqual([]);
  });
});

describe('splitTranslation', () => {
  it('moves the subtitle out of the line', () => {
    expect(splitTranslation('Bonsoir. {{Good evening.}} Come in.')).toEqual({ text: 'Bonsoir. Come in.', translation: 'Good evening.' });
    expect(splitTranslation('No subtitle.')).toEqual({ text: 'No subtitle.' });
  });
});
