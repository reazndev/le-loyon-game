import { describe, expect, it } from 'vitest';
import { weather } from './weather';

const at = (time: 'day' | 'night', counts: Record<string, number>) => weather({ time, count: (name) => counts[name] ?? 0 });

describe('weather', () => {
  it('keeps the first night dry and still, then rains from night 2 on', () => {
    expect(at('night', { night: 1 })).toEqual({ drizzle: false, wind: 0.35, breath: true });
    expect(at('night', { night: 2 }).drizzle).toBe(true);
    expect(at('night', { night: 3 })).toEqual({ drizzle: true, wind: 0.7, breath: true });
  });

  it('treats unset counts as the first day and night', () => {
    expect(at('night', {}).drizzle).toBe(false);
    expect(at('day', {}).wind).toBeCloseTo(0.3);
  });

  it('lets the wind rise by day without rain or breath', () => {
    expect(at('day', { day: 3 })).toEqual({ drizzle: false, wind: 0.6, breath: false });
  });
});
