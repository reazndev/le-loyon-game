import type { LevelKit } from '../../game/kit/levelKit';
import type { Beat } from '../../game/scares/beats';
import { scareDirector, type ScareDirector } from '../../game/scares/director';
import { otherStep } from '../../game/scares/sounds';
import type { SceneContext } from '../../game/scene';
import type { InnDressing } from './dressing';
import { CORRIDOR, CORRIDOR_DOORS, DOORWAY, PHONE, ROOM3, STAIRS, UPPER } from './layout';
import { doorShut } from './sounds';

/** A beat that only fires when the scene calls `scares.fire`. */
const MANUAL = { after: Number.POSITIVE_INFINITY };

/** The corridor's middle line, upstairs. */
const HALL_Z = (CORRIDOR.z0 + CORRIDOR.z1) / 2;
const YANNICKS_DOOR = CORRIDOR_DOORS.find((door) => door.label === 'yannick')!;

/**
 * inn_upstairs_steps: up the stairs, along the corridor to just outside room 3, a pause, back a
 * few steps, and Yannick's door closes. Returns the seconds each step lands and where.
 */
export function stepsPastRoom3(): { at: number; x: number; z: number }[] {
  const up = Array.from({ length: 5 }, (_, i) => ({ x: (STAIRS.x0 + STAIRS.x1) / 2, z: STAIRS.z1 + 1.6 - i * 0.4 }));
  const along = Array.from({ length: 10 }, (_, i) => ({ x: STAIRS.x1 + 0.3 + i * 0.68, z: HALL_Z }));
  const back = [5.0, 4.4, 3.9].map((x) => ({ x, z: HALL_Z - 0.2 }));
  const path = [...up, ...along];
  const steps = path.map((p, i) => ({ ...p, at: i * 0.62 }));
  const pause = steps[steps.length - 1]!.at + 3.5;
  return [...steps, ...back.map((p, i) => ({ ...p, at: pause + i * 0.62 }))];
}

/**
 * The inn's beats from 07-scares.md. `inn_radiator` plays in the bed sequence (see turns.ts);
 * the inn and the church are never given random events.
 */
export function stageBeats(kit: LevelKit, ctx: SceneContext, dressing: InnDressing): ScareDirector {
  const nightTwoBack = dressing.phase === 'night2' && ctx.state.hasFlag('opened_coffin');
  const upstairs: Beat = {
    id: 'inn_upstairs_steps',
    when: [{ enter: { x: (ROOM3.x0 + ROOM3.x1) / 2, z: (ROOM3.z0 + ROOM3.z1) / 2, w: 2.8, d: 3 } }, { after: 3 }],
    do: [
      {
        after: 2.5,
        run: (c) => {
          const steps = stepsPastRoom3();
          steps.forEach((s) => setTimeout(() => otherStep(c.audio, 'wood', { x: s.x, y: UPPER, z: s.z }, false), s.at * 1000));
          const last = steps[steps.length - 1]!.at;
          setTimeout(() => doorShut(c.audio, { x: YANNICKS_DOOR.x, y: UPPER + 1, z: CORRIDOR.z0 }), (last + 0.9) * 1000);
        },
      },
    ],
  };
  const beats: Beat[] = [
    { id: 'inn_doorway', when: MANUAL, do: [{ stinger: 'sfx_floorboard', at: DOORWAY }] },
    {
      id: 'vil_inn_phone',
      when: MANUAL,
      do: [
        { sound: 'sfx_static', at: PHONE, volume: 0.7 },
        { sound: 'sfx_breath_mask', at: PHONE, volume: 0.12, after: 1.1 },
      ],
    },
    ...(nightTwoBack ? [upstairs] : []),
  ];
  return kit.use(scareDirector(beats));
}
