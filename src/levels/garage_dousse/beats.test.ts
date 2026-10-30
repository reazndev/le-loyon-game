import { describe, expect, it, vi } from 'vitest';
import { garageBeats } from './beats';

const radio = () => ({ on: vi.fn(), toStatic: vi.fn() });

describe('garageBeats', () => {
  it('stages nothing outside day 3', () => {
    (['day1', 'day2', 'night1', 'night3', 'dawn'] as const).forEach((phase) => expect(garageBeats(phase, radio())).toEqual([]));
  });

  it('drops the radio to static on day 3 and brings it back four seconds later', () => {
    const set = radio();
    const [beat] = garageBeats('day3', set);
    expect(beat?.id).toBe('gar_radio_static');
    expect(beat?.set).toBe('gar_radio_static');
    const [drop, back] = beat!.do;
    expect(back?.after).toBe(4);
    if (!drop || !('run' in drop) || !back || !('run' in back)) throw new Error('expected two run actions');
    void drop.run({} as never);
    expect(set.toStatic).toHaveBeenCalledOnce();
    void back.run({} as never);
    expect(set.on).toHaveBeenCalledOnce();
  });
});
