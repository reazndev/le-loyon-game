import { describe, expect, it } from 'vitest';
import { Clock, formatTime, parseTime } from './clock';

describe('Clock', () => {
  it('runs one minute per real minute from its start time', () => {
    const clock = new Clock('23:10');
    expect(clock.text).toBe('23:10');
    clock.advance(59);
    expect(clock.text).toBe('23:10');
    clock.advance(1);
    expect(clock.text).toBe('23:11');
  });

  it('wraps at midnight', () => {
    const clock = new Clock('23:59');
    clock.advance(60);
    expect(clock.text).toBe('00:00');
    expect(formatTime(parseTime('07:05') - 10)).toBe('06:55');
  });
});
