import { StageError } from './session.mjs';

/** Getting about Leurs: the exits and doors on the critical path, and the walks between them. */

// Each exit: where to stand, which way to face, and the scene it leads to.
export const exits = {
  squareToPath: [-10, -40, 0, 'cemetery_path'],
  pathToCemetery: [0, -36.5, 0, 'cemetery'],
  pathToSquare: [-7, 46, 90, 'village_square'],
  cemeteryToPath: [0, 15, 180, 'cemetery_path'],
  cemeteryToForest: [-8.5, -13.5, 0, 'forest_path'],
  forestToFort: [16, -45, 0, 'bunker_exterior'],
  forestToCemetery: [0, 73, 180, 'cemetery'],
  fortToForest: [0, 25, 180, 'forest_path'],
  squareToGremaud: [10, 13.5, -90, 'house_gremaud'],
  squareToYerly: [4.6, 51, 180, 'yerly_farm'],
  yerlyToSquare: [45, 12, -90, 'village_square'],
  gremaudToSquare: [-0.4, 15.5, 180, 'village_square'],
  fortInsideToOutside: [0, -1.5, 180, 'bunker_exterior'],
  larchToFort: [0, 31.5, 180, 'bunker_exterior'],
};
export const walk = (s, exit) => s.walkOut(...exit);

const SQUARE_INN_DOOR = { x: 9.8, z: -3.2 };
const CHURCH_DOOR = { x: 0, z: -11.9 };
/** The café door, from inside the inn. */
export const INN_FRONT_DOOR = { x: 2.6, z: 4 };

export async function intoInn(s) {
  await s.use('Go in', { near: SQUARE_INN_DOOR });
  await s.inScene('inn');
}

export async function outOfInn(s) {
  await s.use('Go out');
  await s.inScene('village_square');
}

/** From anywhere in the square, up the lane, the path, and through the cemetery's front gate. */
export async function upToCemetery(s) {
  await walk(s, exits.squareToPath);
  await walk(s, exits.pathToCemetery);
}

/** From the cemetery's front gate trigger down the path and into the inn. */
export async function downToInn(s) {
  await walk(s, exits.cemeteryToPath);
  await walk(s, exits.pathToSquare);
  await intoInn(s);
}

/** Room 3's bed: the night ends, a black card with the date, and the reporter wakes in room 3. */
export async function sleep(s, day) {
  await s.use('Lie down');
  await s.talk();
  await s.until((d) => window.__game.state().counts.day === d && window.__game.state().time === 'day', `day ${day}`, { timeout: 40_000, arg: day });
  await s.idle(`waking on day ${day}`);
  const saved = await s.eval(() => localStorage.getItem('le-loyon.save.sleep') !== null);
  if (!saved) throw new StageError('Waking wrote no sleep save');
}

export async function intoChurch(s) {
  await s.use('Open the door', { near: CHURCH_DOOR });
  await s.inScene('church');
}

export async function outOfChurch(s) {
  await s.use('Go out', { near: { x: 0, z: 10.7 } });
  await s.inScene('village_square');
}

/** From the square to the fort's front door by the cemetery and the forest path. */
export async function upToFort(s) {
  await upToCemetery(s);
  await walk(s, exits.cemeteryToForest);
  await walk(s, exits.forestToFort);
}

/** From the fort's clearing back to the inn. */
export async function fortToInn(s) {
  await walk(s, exits.fortToForest);
  await walk(s, exits.forestToCemetery);
  await downToInn(s);
}
