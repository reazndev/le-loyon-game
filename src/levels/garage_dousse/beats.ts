import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import type { Beat } from '../../game/scares/beats';
import { scareDirector } from '../../game/scares/director';
import type { StoryPhase } from '../forest_path/story';
import { ROOM } from './layout';
import type { ShelfRadio } from './radio';

/** How long the player has been in the garage before the radio can lose its station. */
const SETTLED = 40;
/** How long the station stays lost. */
const STATIC = 4;
/** Facing the street end, the radio on the back left wall is behind the player. */
const STREET_END = { x: 3, y: 1.4, z: ROOM.z1 };

/**
 * The garage by day is safe and dull. One quiet false beat on day 3: once the player has been
 * inside a while and turns toward the street, the radio behind them drops to static for four
 * seconds and then finds its station again, as if nothing happened.
 */
export function garageBeats(phase: StoryPhase, radio: Pick<ShelfRadio, 'on' | 'toStatic'>): Beat[] {
  if (phase !== 'day3') return [];
  return [
    {
      id: 'gar_radio_static',
      when: [{ after: SETTLED }, { look: { ...STREET_END, angle: 45, hold: 2 } }],
      do: [{ run: () => radio.toStatic() }, { after: STATIC, run: () => void radio.on() }],
      set: 'gar_radio_static',
    },
  ];
}

export function stageBeats(kit: LevelKit, _ctx: SceneContext, phase: StoryPhase, radio: ShelfRadio): void {
  const beats = garageBeats(phase, radio);
  if (beats.length) kit.use(scareDirector(beats));
}
