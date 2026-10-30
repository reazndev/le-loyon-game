import { describe, expect, it } from 'vitest';
import type { SoundHandle } from '../../engine/audio/audioManager';
import { pausable } from './clock';

function fakeLoops() {
  const started: { stopped: boolean }[] = [];
  const start = (): SoundHandle => {
    const loop = { stopped: false };
    started.push(loop);
    return { stop: () => void (loop.stopped = true) };
  };
  return { started, start };
}

describe('pausable', () => {
  it('starts at once and plays until paused', () => {
    const { started, start } = fakeLoops();
    const clock = pausable(start);
    expect(started).toHaveLength(1);
    expect(clock.playing).toBe(true);
    clock.pause();
    expect(started[0]!.stopped).toBe(true);
    expect(clock.playing).toBe(false);
  });

  it('starts a fresh loop on resume, and only one', () => {
    const { started, start } = fakeLoops();
    const clock = pausable(start);
    clock.resume();
    expect(started).toHaveLength(1);
    clock.pause();
    clock.resume();
    clock.resume();
    expect(started).toHaveLength(2);
    expect(started[1]!.stopped).toBe(false);
  });

  it('stays quiet once stopped', () => {
    const { started, start } = fakeLoops();
    const clock = pausable(start);
    clock.pause();
    clock.stop();
    clock.resume();
    expect(started).toHaveLength(1);
    expect(clock.playing).toBe(false);
  });
});
