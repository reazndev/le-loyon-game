import { holds } from '../../content';
import type { LevelKit } from '../../game/kit/levelKit';
import type { NpcBuilder } from '../../game/kit/npc';
import { scareDirector } from '../../game/scares/director';
import { defineScene, type SceneContext } from '../../game/scene';
import { everyFrame } from '../church/everyFrame';
import { isNight, storyPhase } from '../forest_path/story';
import { nowAndThen } from '../../game/ambient';
import { yerlyAmbient } from './ambient';
import { villageAmbience, villageAtmosphere } from '../village_square/atmosphere';
import { fountainWater } from '../village_square/sounds';
import { henhouse, toolShed, yard, type Hen } from './farmyard';
import { fences, forestEdge, land } from './field';
import { greenery } from './greenery';
import { hints } from './hints';
import { BERNARD, BOUNDS, FOREST_EDGE, HENHOUSE, spawns, STALL } from './layout';
import { marquise } from './marquise';
import { cluck, moo } from './sounds';

/**
 * Ferme Yerly. Bernard's farmyard, the cowshed and its stall, the henhouse, the tool shed with
 * the shovel, and the field up to the Bois-Noir where Marquise stands on day 2 (puzzle P3).
 * The track at the top of the field goes on into the forest to the shrine fork.
 */
export const yerlyFarmScene = defineScene({
  id: 'yerly_farm',
  spawns,
  atmosphere: villageAtmosphere,

  build(kit, ctx) {
    const phase = storyPhase(ctx.state);
    const night = isNight(phase);
    kit.ground('grass');
    land(kit);
    yard(kit, night);
    fences(kit);
    greenery(kit);
    forestEdge(kit);
    const shovel = toolShed(kit);
    everyFrame(kit, () => (shovel.object.visible = !holds('has_shovel', ctx.state)));
    // The hens are shut in for the night.
    const hens = henhouse(kit);
    hens.forEach((hen) => (hen.body.object.visible = !night));
    const cows = animals(kit, ctx, night ? [] : hens, night);
    yerlyAmbient(kit, ctx, cows);

    if (!night) kit.npc('bernard').at(BERNARD.x, 0, BERNARD.z).faceYaw(BERNARD.yaw).watch(6).talk('bernard');
    hints(kit, marquise(kit, ctx, phase));
    if (night) kit.use(scareDirector([], { random: { surface: 'gravel' } }));

    kit.exit({ w: 1, d: 8, to: 'village_square', spawn: 'from_yerly' }).at(BOUNDS.x1 - 1, 0, 12);
    kit.exit({ w: 1, d: 5, to: 'forest_path', spawn: 'from_yerly' }).at(FOREST_EDGE - 12, 0, -10);
    [
      { x: (BOUNDS.x0 + BOUNDS.x1) / 2, z: BOUNDS.z0, w: BOUNDS.x1 - BOUNDS.x0, d: 1 },
      { x: (BOUNDS.x0 + BOUNDS.x1) / 2, z: BOUNDS.z1, w: BOUNDS.x1 - BOUNDS.x0, d: 1 },
      { x: BOUNDS.x0, z: (BOUNDS.z0 + BOUNDS.z1) / 2, w: 1, d: BOUNDS.z1 - BOUNDS.z0 },
      { x: BOUNDS.x1, z: (BOUNDS.z0 + BOUNDS.z1) / 2, w: 1, d: BOUNDS.z1 - BOUNDS.z0 },
    ].forEach(({ x, z, w, d }) => kit.barrier({ w, d }).at(x, 0, z));

    villageAmbience(kit, ctx, {
      bell: { x: 40, y: 12, z: -50 },
      layers: [() => fountainWater(ctx.audio, { x: -1.5, y: 0.8, z: 3.2 }, 0.3)],
    });
  },
});

/** Three cows in the stall, lowing now and then, and the hens pecking and muttering by day. Returns the cows. */
function animals(kit: LevelKit, ctx: SceneContext, hens: Hen[], night: boolean): NpcBuilder[] {
  const cows = [
    [STALL.x - 1.2, STALL.z - 2.6, 250],
    [STALL.x + 0.6, STALL.z - 0.2, 110],
    [STALL.x - 1.4, STALL.z + 2.4, 280],
  ].map(([x, z, yaw]) => kit.npc('marquise').at(x!, 0, z!).faceYaw(yaw!));
  nowAndThen(kit, ctx, night ? 70 : 30, () => moo(ctx.audio, { x: STALL.x, y: 1.4, z: STALL.z + (Math.random() - 0.5) * 6 }), 8);
  if (night) return cows;
  nowAndThen(kit, ctx, 9, () => cluck(ctx.audio, { x: HENHOUSE.x + (Math.random() - 0.5) * 5, y: 0.3, z: HENHOUSE.z }), 3);

  const pecks = hens.map(() => Math.random() * 3);
  everyFrame(kit, (dt) => {
    hens.forEach((hen, i) => {
      pecks[i]! -= dt;
      if (pecks[i]! < 0) pecks[i] = 0.6 + Math.random() * 3;
      // Head down for a quarter second, then up and still.
      hen.head.object.rotation.x = pecks[i]! < 0.25 ? 0.9 : 0;
      if (Math.random() < dt * 0.2) hen.body.object.rotation.y += (Math.random() - 0.5) * 1.6;
    });
  });
  return cows;
}

export const scenes = [yerlyFarmScene];
