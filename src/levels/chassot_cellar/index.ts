import { drips, miceInTheWalls } from '../../game/ambient';
import { defineScene } from '../../game/scene';
import { purrWhileCarried } from '../chassot_farm/kolly';
import { loopSound } from '../inn/interior';
import { roomTone } from '../inn/sounds';
import { stepsAndHatch } from './hatch';
import { ROOM, spawns } from './layout';
import { buildProps, buildRoom } from './room';

/**
 * The Chassot cellar under the farmhouse (A8, A9): a vaulted stone room four by five meters,
 * reached down five steps from the hatch by the trodden path. No electric light; the torch and
 * the daylight down the steps. Potatoes, jam, an army blanket, a candle stub, Marc's height on the
 * door frame, and Minet. Somebody lives off this house.
 */
export const chassotCellarScene = defineScene({
  id: 'chassot_cellar',
  spawns,
  atmosphere: {
    day: {
      fog: { color: 0x050505, near: 1, far: 11, density: 0.08, wisps: 0.05 },
      ambient: 0x151411,
      saturation: 0.5,
      flashlight: true,
    },
    night: {
      fog: { color: 0x030303, near: 0.5, far: 10, density: 0.1, wisps: 0.05 },
      ambient: 0x080808,
      saturation: 0.45,
      flashlight: true,
    },
  },

  build(kit, ctx) {
    kit.batch((still) => buildRoom(still));
    buildProps(kit, ctx);
    stepsAndHatch(kit, ctx);
    purrWhileCarried(kit, ctx);

    loopSound(kit, (audio) => roomTone(audio, 0.14));
    drips(kit, ctx, [{ x: 0.6, z: -0.8, top: 2.05, bottom: 0 }], 3.4, 0.25);
    miceInTheWalls(kit, ctx, [
      { x: ROOM.x0, y: 0.3, z: -1.5 },
      { x: ROOM.x1, y: 1.2, z: 1.8 },
      { x: -0.5, y: 1.9, z: ROOM.z1 },
    ], 25);
    kit.hint('Take Minet up the steps and back across the road.', { if: { item: 'minet' } });
  },
});

export const scenes = [chassotCellarScene];
