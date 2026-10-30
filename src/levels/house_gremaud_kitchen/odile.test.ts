import { describe, expect, it } from 'vitest';
import { check } from '../../game/conditions';
import type { DialogueScript } from '../../game/dialogue';
import { GameState } from '../../game/state';
import { kitchenScript } from './odile';

const entry: DialogueScript = {
  start: [{ if: { flag: 'odile_talked' }, to: 'odile_after' }, { to: 'odile_closed' }],
  nodes: {
    odile_talk_2: { lines: ['inside'] },
    odile_after: { lines: ['after'] },
    odile_closed: { lines: ['closed'] },
  },
};

function opening(script: DialogueScript, flags: string[]): string | null {
  const state = new GameState();
  flags.forEach((f) => state.setFlag(f));
  const start = script.start;
  if (typeof start === 'string') return start;
  return start.find((row) => check(row.if, state))?.to ?? null;
}

describe('kitchenScript', () => {
  it('opens at odile_talk_2 the first time, after the register', () => {
    expect(opening(kitchenScript(entry), ['read_register'])).toBe('odile_talk_2');
  });

  it('falls back to her entry table otherwise', () => {
    expect(opening(kitchenScript(entry), ['read_register', 'odile_talked'])).toBe('odile_after');
    expect(opening(kitchenScript(entry), [])).toBe('odile_closed');
  });

  it('keeps a plain string start as the fallback', () => {
    expect(opening(kitchenScript({ ...entry, start: 'odile_after' }), [])).toBe('odile_after');
  });

  it('keeps every node', () => {
    expect(kitchenScript(entry).nodes).toBe(entry.nodes);
  });
});
