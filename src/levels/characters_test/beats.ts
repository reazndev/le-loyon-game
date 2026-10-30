import type { Beat } from '../../game/scares/beats';

/**
 * A walk north along the gravel path at x = 14 runs through one of each scare primitive. The
 * ids are local to this test scene.
 */
export const testBeats: Beat[] = [
  {
    id: 'test_stalk',
    when: { enter: { x: 14, z: 2, w: 4, d: 2 } },
    do: [{ stalk: { surface: 'gravel', steps: 8 } }],
  },
  {
    id: 'test_figure',
    when: { enter: { x: 14, z: -6, r: 2 } },
    // Behind the player's left shoulder, out in the field: there when they turn around.
    do: [{ silence: 6 }, { figure: { at: { x: 2, z: 2 } }, after: 1 }],
    set: 'test_figure_seen',
  },
  {
    id: 'test_branch',
    when: { look: { x: 22, y: 2, z: -18, within: 16, hold: 0.5 } },
    do: [{ sound: 'sfx_branch', at: 'left', distance: 18 }],
  },
  {
    id: 'test_walker',
    when: [{ flag: 'test_figure_seen' }, { enter: { x: 14, z: -16, r: 2.5 } }],
    do: [{ figure: { at: { x: 4, z: -28 }, walk: [{ x: 26, z: -29 }], vanish: 'unseen', near: 6 } }],
  },
  {
    id: 'test_cough',
    when: { enter: { x: 14, z: -24, r: 2 } },
    do: [{ sound: 'sfx_cough_mask', at: 'behind', distance: 14 }, { sound: 'sfx_knock_metal', at: 'right', distance: 20, after: 6 }],
    repeat: 30,
  },
  {
    id: 'test_fog',
    when: { after: 90 },
    do: [{ fog: { seconds: 15 } }],
  },
  {
    id: 'test_stinger',
    when: { enter: { x: 14, z: -31, r: 1.5 } },
    do: [{ silence: 4 }, { stinger: true, after: 4 }],
    repeat: 20,
  },
];
