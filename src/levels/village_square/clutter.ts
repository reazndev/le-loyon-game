import type { LevelKit } from '../../game/kit/levelKit';
import { HOUSE_1, HOUSE_2, INN, LAITERIE } from './layout';
import { bicycle, choppingBlock, flowerBox, puddle, smallCar } from './props';

/**
 * The small things left about the square that nobody moves: the cheesemaker's Panda by the
 * laiterie, two bicycles against walls, window boxes gone brown, a chopping block, and the
 * puddles in the dips. Still, so it goes in the batch; only the car blocks the player.
 */
export function streetClutter(kit: LevelKit, night: boolean): void {
  const laiterieFront = LAITERIE.x + LAITERIE.d / 2;
  const innFront = INN.x - INN.d / 2;
  smallCar(kit, 0x6e2a22).at(laiterieFront + 4.4, 0.035, LAITERIE.z - 3.4).rotY(-4);

  // A black roadster against the laiterie beside the door, and another against the inn.
  leaning(bicycle(kit, { size: 1.35, frame: 0x1e1e1c }).at(laiterieFront + 0.28, 0.035, LAITERIE.z - 2), 0.2);
  leaning(bicycle(kit, { size: 1.35, frame: 0x2e3a34 }).at(innFront - 0.28, 0.025, INN.z + 5.6), -0.2);

  windowBoxes(kit);
  choppingBlock(kit).at(HOUSE_1.x + 2.6, 0, HOUSE_1.z - HOUSE_1.w / 2 - 1.5);

  // Square at 0.025, road at 0.04, forecourt at 0.035; each puddle sits just over its surface.
  [
    [1.6, -3.6, 1.4, 0.9, 0.033],
    [-6.2, 4, 2, 1.1, 0.033],
    [6.6, -1.6, 1, 0.7, 0.033],
    [-3.6, 9.1, 1.8, 1, 0.048],
    [3.6, 19, 1.2, 0.8, 0.048],
    [-2.8, 26, 1.6, 1, 0.043],
  ].forEach(([x, z, w, d, y]) => puddle(kit, w!, d!, !night).at(x!, y!, z!));
}

/** Tips a bicycle standing along a wall over against it, `lean` radians toward -X in its own frame. */
function leaning(bike: ReturnType<typeof bicycle>, lean: number): void {
  bike.object.rotation.z = lean;
}

/** Window boxes under the upstairs windows of the houses that face the square. */
function windowBoxes(kit: LevelKit): void {
  // Upstairs sills stand 4 m up (plinth, one floor, sill height); the box hangs just under one.
  const upstairs = 4;
  // House 1 faces east, the inn west, house 2 north; offsets are each front's window columns.
  [-2.8, 0, 2.8].forEach((col) => flowerBox(kit).at(HOUSE_1.x + HOUSE_1.d / 2 + 0.12, upstairs - 0.2, HOUSE_1.z - col).rotY(90));
  [-4.8, -1.2, 1.6, 4.4].forEach((col) => flowerBox(kit).at(INN.x - INN.d / 2 - 0.12, upstairs - 0.2, INN.z + col).rotY(90));
  [-2.8, 2.8].forEach((col) => flowerBox(kit).at(HOUSE_2.x - col, upstairs - 0.2, HOUSE_2.z - HOUSE_2.d / 2 - 0.12));
}
