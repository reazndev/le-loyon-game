import type { Markers } from './beats';
import { beside, distanceToTrails, pointAlong, yawToward, type Trail } from './trail';
import { woodsHeight, type Area } from './woods';

/** Where everything in the Bois-Noir path scene is: the trails, the stream, the shrine, the beats. */

export const main: Trail = [
  [0, 32],
  [1, 24],
  [-1.5, 15],
  [1.5, 7],
  [0, 0],
];
export const toFort: Trail = [
  [0, 0],
  [4, -7],
  [9, -14],
  [12, -24],
];
export const toStream: Trail = [
  [0, 0],
  [-6, -3],
  [-13, -4],
  [-17, -7],
  [-23, -8.5],
  [-30, -11],
];
export const trails = [main, toFort, toStream];

/** The stream runs roughly north to south across the left branch. */
export const stream: Trail = [
  [-14, -58],
  [-17, -36],
  [-20, -10],
  [-19, 14],
  [-23, 40],
];
export const BRIDGE = { x: -20.3, z: -7.8 };

export const area: Area = { x: -5.5, z: 4, w: 63, d: 72 };
export const FORK = { x: 0, z: 0 };
export const SHRINE = { x: -1.1, z: -3.1 };

const channel = (x: number, z: number) => {
  const d = distanceToTrails([stream], x, z);
  return 1.3 * Math.max(0, 1 - (d / 2.6) ** 2);
};
/** Rises gently from the cemetery to the fork and on up to the fort; falls away to the stream. */
export const slope = (x: number, z: number) => 0.05 * (32 - z) + 0.07 * x - channel(x, z);
export const height = woodsHeight(slope, (x, z) => distanceToTrails(trails, x, z));

const along = (trail: Trail, meters: number) => {
  const p = pointAlong(trail, meters);
  return { x: p.x, z: p.z, yaw: yawToward(p.dx, p.dz) };
};
const backTowardCemetery = (trail: Trail, meters: number) => {
  const p = pointAlong(trail, meters);
  return { x: p.x, z: p.z, yaw: yawToward(-p.dx, -p.dz) };
};

const heifer = along(toStream, 6);

export const markers = {
  for1_ahead_trigger: {
    beat: 'for1_ahead',
    ...along(main, 5.5),
    note: 'Night 1, 5.5 m in from the back gate. The figure is already standing 12.5 m on, past the edge of the torch beam.',
  },
  for1_ahead: {
    beat: 'for1_ahead',
    ...along(main, 18),
    note: 'The figure stands on the path facing away. When the player is within 8.5 m it steps off to the right behind a spruce. No sound.',
  },
  for1_ahead_exit: {
    beat: 'for1_ahead',
    ...beside(main, 19.5, 3.2),
    note: 'Where it steps to, behind the big spruce, and is gone.',
  },
  for1_ahead_again_trigger: {
    beat: 'for1_ahead_again',
    ...along(main, 19),
    note: 'Night 1, after the first glimpse: walking on toward the fork.',
  },
  for1_ahead_again_from: {
    beat: 'for1_ahead_again',
    ...beside(main, 31.5, -4.5),
    note: 'The second glimpse: a shape crossing the path at the edge of the beam, from the left, toward the fort side.',
  },
  for1_ahead_again_to: {
    beat: 'for1_ahead_again',
    ...beside(main, 32.5, 6),
    note: 'Where it is gone into the spruce on the right, toward the fort.',
  },
  for1_fork_steps_from: {
    beat: 'for1_fork_steps',
    ...along(toFort, 9),
    note: 'Night 1, when the player reaches the shrine: slow uneven footsteps start here, one heavier than the other.',
  },
  for1_fork_steps_to: {
    beat: 'for1_fork_steps',
    ...along(toFort, 26),
    note: 'Where the footsteps fade out, going away uphill. No figure.',
  },
  for1_shrine: {
    beat: 'for1_shrine',
    ...SHRINE,
    y: 1.45,
    yaw: 180,
    note: 'The shrine. The Virgin faces the path to the fort. Looking at it at night drops every sound for a few seconds.',
  },
  for1_cough_trigger: {
    beat: 'for1_cough',
    ...backTowardCemetery(main, 21),
    note: 'Night 1, after the fort: when the player walks back past here toward the cemetery.',
  },
  for1_cough_source: {
    beat: 'for1_cough',
    ...FORK,
    yaw: 180,
    note: 'Far behind the player: one muffled cough through rubber.',
  },
  for2_heifer_fork: {
    beat: 'for2_heifer',
    ...heifer,
    yaw: yawToward(4, -7),
    note: 'Day 2 with `skipped_follow`: Marquise stands on the left branch staring up the right one, toward the fort.',
  },
  for2_roofline: {
    beat: 'for2_roofline',
    x: 7.5,
    y: 5,
    z: -25.5,
    yaw: yawToward(7.5 - heifer.x, -25.5 - heifer.z),
    note: 'The fort as a dark barn roof up the right branch, about 26 m from the fork, shown only while the fog thins, once, when the player looks up the branch. The real fort is further on; the roof stands where thinned fog can just uncover it.',
  },
  for2_stump_shape: {
    beat: 'for2_stump',
    x: 2,
    y: 1.2,
    z: -8,
    yaw: 0,
    note: 'Day 2 at the fork: a dark upright shape between two trunks where Marquise stares. Gone once looked at and looked away from.',
  },
  for2_stump: {
    beat: 'for2_stump',
    x: 3.2,
    z: -10.2,
    yaw: 0,
    note: 'The mossy stump, a little off from where the shape stood. Walking up to it, a branch breaks deeper in.',
  },
  for2_branch: {
    beat: 'for2_stump',
    x: -2,
    z: -28,
    yaw: 0,
    note: 'Deeper in, uphill: the branch.',
  },
  for2_cup: {
    beat: 'for2_cup',
    ...beside(toFort, 21, 1.7),
    note: 'Day 2, walking back from the fort: a tin cup on the stump beside the path. It was not there on the way up. Looking at it drops every sound for a while. Nothing else.',
  },
  for3n_follow: {
    beat: 'for3n_follow',
    ...along(main, 9),
    note: 'Night 3, on the way up: footsteps behind on the needles that stop one step after the player stops.',
  },
  fp_wire_snag: {
    beat: 'fp_wire_snag',
    ...along(toFort, 17.5),
    note: 'Once: old army wire trailing across the path at ankle height catches the boot. A clank, a stumble, the view dips.',
  },
  fp_cape: {
    beat: 'decoy_cape',
    ...beside(toStream, 28, 2.8),
    note: 'A camo tarp snagged on a dead branch beside the stream path, a man standing there from the fork. Empty up close.',
  },
  fp_cape_seen_from: {
    beat: 'decoy_cape',
    ...along(toStream, 12),
    note: 'Night, the stretch of the stream path where the snagged tarp first shows through the fog, 15 to 20 m on.',
  },
  fp_torch_stream: {
    beat: 'fp_torch_stream',
    ...along(toStream, 21),
    note: 'Night, at the bridge: the torch dies for 3 s, a branch snaps by the tarp and two steps go off. The light comes back on the tarp.',
  },
  fp_torch_fort: {
    beat: 'fp_torch_fort',
    ...along(toFort, 24),
    note: 'Night 3, near the fort: the torch dies, four slow steps go off through the spruce, and a branch sweeps the face as it catches.',
  },
} satisfies Markers;
