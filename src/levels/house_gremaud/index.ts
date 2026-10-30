import { dialogues } from '../../content';
import type { DialogueScript } from '../../game/dialogue';
import type { LevelKit } from '../../game/kit/levelKit';
import { scatter } from '../../game/kit/scatter';
import { defineScene, type SceneContext } from '../../game/scene';
import { everyFrame } from '../church/everyFrame';
import { woodCreak } from '../church/sounds';
import { storyPhase, isNight } from '../forest_path/story';
import { villageAmbience, villageAtmosphere } from '../village_square/atmosphere';
import { house, palette, woodpile } from '../village_square/houses';
import { milkCan } from '../village_square/props';
import { road } from '../village_square/road';
import { doorBell, lockTwice } from '../village_square/sounds';
import { doorstep } from './doorstep';
import { DOOR, gremaudHouse, type GremaudHouse } from './house';

/**
 * Maison Gremaud, the front garden and the doorstep. Odile opens a hand's width on day 1 and
 * shuts the door; from day 2, once the abbé has phoned her, she lets the reporter into the
 * kitchen (`house_gremaud_kitchen`, built with the interiors). The inn's back yard, with
 * Yannick's window over the bins, is across the hedge.
 */

const GATE = { x: DOOR.x, z: 12 };
const ODILE = { x: DOOR.x + 0.15, z: DOOR.z - 0.6 };
/** The inn's back wall, across the hedge on the left. */
const INN_BACK = { x: -13.5, z: 2 };

export const houseGremaudScene = defineScene({
  id: 'house_gremaud',
  spawns: {
    default: { x: GATE.x, z: GATE.z + 1.4, yaw: 0 },
    from_square: { x: GATE.x, z: GATE.z + 1.4, yaw: 0 },
    from_gremaud: { x: DOOR.x + 0.1, z: DOOR.z + 1.1, yaw: 180 },
  },
  atmosphere: villageAtmosphere,

  build(kit, ctx) {
    const night = isNight(storyPhase(ctx.state));
    kit.ground('grass');
    garden(kit);
    const home = gremaudHouse(kit, (slot) => (!night && slot.face === 'back' && slot.floor === 0 ? 'lit' : 'dark'));
    innYard(kit, night);
    frontDoor(kit, ctx, home);

    kit.exit({ w: 10, d: 1, to: 'village_square', spawn: 'from_gremaud' }).at(GATE.x, 0, 18.4);
    [
      { x: 0, z: -12, w: 34, d: 1 },
      { x: -17, z: 3, w: 1, d: 32 },
      { x: 13, z: 3, w: 1, d: 32 },
      { x: 0, z: 19, w: 34, d: 1 },
    ].forEach(({ x, z, w, d }) => kit.barrier({ w, d }).at(x, 0, z));

    villageAmbience(kit, ctx, { bell: { x: -30, y: 14, z: 40 } });
  },
});

/** A lawn cut short for winter, a raked gravel path, a low wall with a gate, a bare apple tree. */
function garden(kit: LevelKit): void {
  kit.plane({ w: 70, d: 70, cell: 2 }).texture('grass_dead', { tile: 3 }).color(0x8a8c7a).at(0, 0.01, 3);
  kit.plane({ w: 1.3, d: GATE.z - DOOR.z, cell: 0.7 }).texture('gravel_path', { tile: 1.5 }).color(0xa8a49a).at(GATE.x, 0.03, (GATE.z + DOOR.z) / 2 + 0.3).walkable('gravel');
  road(kit, [[-16, 15.5], [13, 15.5]], { width: 4, texture: 'gravel_path', tile: 2, color: 0x9a968c, surface: 'gravel' });

  // The garden wall with iron railings, broken by the gate.
  const w = 7.6;
  [-1, 1].forEach((side) => {
    const x = GATE.x + side * (0.7 + w / 2);
    kit.box({ w, h: 0.55, d: 0.35 }).texture('stone_wall', { tile: 1 }).color(0x9c9a92).at(x, 0, GATE.z).collider();
    kit.box({ w, h: 0.75, d: 0.03 }).texture('iron_fence', { tile: [1, 0.75] }).cutout().doubleSided().color(0x3a3a38).at(x, 0.55, GATE.z);
  });
  [-0.7, 0.7].forEach((dx) => kit.box({ w: 0.3, h: 1.2, d: 0.3 }).texture('stone_wall', { tile: 0.6 }).color(0xa4a29a).at(GATE.x + dx, 0, GATE.z).collider());
  // The gate leaf stands open against the wall.
  kit.box({ w: 1.1, h: 1.0, d: 0.03 }).texture('iron_fence', { tile: [1.1, 1] }).cutout().doubleSided().color(0x3a3a38).at(GATE.x + 0.65, 0.05, GATE.z - 0.55).rotY(90);

  kit.trees('bare', [{ x: 3.4, z: 8.6, scale: 0.6, yaw: 40 }]).collider();
  scatter({ x: 0, z: 8, w: 9, d: 6, count: 10, seed: 'gremaud-lawn', spacing: 1.4, scale: [0.5, 0.8], avoid: (x) => Math.abs(x - GATE.x) < 1.2 }).forEach((s) =>
    kit.sprite('grass_tuft', { w: 0.6 * s.scale!, h: 0.35 * s.scale! }).color(0x7e806a).at(s.x, 0, s.z),
  );
  // A clipped hedge down the left side, between the garden and the inn's yard.
  scatter({ x: -9.2, z: 3, w: 1.2, d: 18, count: 16, seed: 'gremaud-hedge', spacing: 1, scale: [1, 1.3] }).forEach((s) =>
    kit.sprite('bush', { w: 1.7 * s.scale!, h: 1.5 * s.scale! }).color(0x5e6452).at(s.x, -0.1, s.z),
  );
  kit.barrier({ w: 1, d: 18 }).at(-9.2, 0, 3);
}

/** The back of the Croix-Blanche: kitchen door, bins, crates of empties, the boy's window upstairs. */
function innYard(kit: LevelKit, night: boolean): void {
  house(kit, {
    w: 13,
    d: 10,
    floors: 2,
    front: [-4.2, -1.4, 1.4, 4.2],
    doors: [-1.4],
    wall: palette.renderWarm,
    shutter: palette.shutterGreen,
    // Yannick's room is the second window upstairs, the one over the bins.
    window: ({ floor, col }) => (night ? (floor === 1 && col === 2 ? 'lit' : 'dark') : floor === 0 && col >= 2 ? 'lit' : floor === 1 && col === 0 ? 'shut' : 'dark'),
  })
    .at(INN_BACK.x, 0, INN_BACK.z)
    .rotY(90);
  [0, 1.1].forEach((dz) => kit.box({ w: 0.8, h: 1.1, d: 0.75 }).color(0x3a4a3e).at(INN_BACK.x + 5.8, 0, 9.2 + dz).collider());
  [0, 0.42].forEach((dy) => kit.box({ w: 0.6, h: 0.4, d: 0.4 }).texture('wood_planks', { tile: 0.6 }).color(0x7a6040).at(INN_BACK.x + 5.7, dy, 7.4));
  woodpile(kit, 3).at(INN_BACK.x + 5.3, 0, 3.5).rotY(90);
  milkCan(kit).at(INN_BACK.x + 5.8, 0, 6.2);
}

/** The bell, the door, Odile behind it, and the curtain upstairs. */
function frontDoor(kit: LevelKit, ctx: SceneContext, home: GremaudHouse): void {
  const odile = kit.npc('odile').at(ODILE.x, 0.2, ODILE.z).faceYaw(180);
  odile.object.visible = false;
  let leafTarget = 0;
  let curtainTarget = 0;
  const curtainHome = home.curtain?.object.position.x ?? 0;
  everyFrame(kit, (dt) => {
    const leaf = home.leaf.object.rotation;
    leaf.y += (leafTarget - leaf.y) * Math.min(1, dt * 3);
    if (home.curtain) home.curtain.object.position.x += (curtainHome + curtainTarget - home.curtain.object.position.x) * Math.min(1, dt * 2.5);
  });
  const wait = (seconds: number) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  const at = { x: DOOR.x, y: 1.2, z: DOOR.z };
  let busy = false;

  const answer = async () => {
    busy = true;
    doorBell(ctx.audio, { x: DOOR.x, y: 1.6, z: DOOR.z - 1 });
    await wait(2.2);
    const outcome = doorstep(ctx.state);
    if (outcome === 'curtain') {
      curtainTarget = 0.35;
      await wait(1.2);
      curtainTarget = 0;
      await ctx.dialogue(dialogues.odile_closed);
    } else {
      woodCreak(ctx.audio, at);
      odile.object.visible = true;
      odile.character.face(ctx.player.position);
      leafTarget = outcome === 'refuses' ? 0.24 : 1.3;
      await wait(0.8);
      if (outcome === 'refuses') {
        await ctx.dialogue(dialogues.odile);
        leafTarget = 0;
        await wait(0.7);
        odile.object.visible = false;
        lockTwice(ctx.audio, at);
      } else {
        if (!ctx.state.hasFlag('odile_talked')) await ctx.dialogue(onTheStep(dialogues.odile_talk));
        ctx.goTo('house_gremaud_kitchen', 'from_door');
      }
    }
    busy = false;
  };
  kit.hotspot({ prompt: 'Ring the bell', radius: 0.9, enabled: () => !busy, onInteract: () => void answer() }).at(DOOR.x, 0, DOOR.z + 0.7);
  // The porch is wide enough to walk into; the closed door stops the player.
  kit.barrier({ w: DOOR.w, d: 0.2 }).at(DOOR.x, 0, DOOR.z - 0.1);
}

/** `odile_talk` up to "Come in. Wipe your feet."; the kitchen picks up the conversation inside. */
function onTheStep(script: DialogueScript): DialogueScript {
  const { next: _inside, ...step } = script.nodes.odile_talk!;
  return { ...script, nodes: { ...script.nodes, odile_talk: step } };
}

export const scenes = [houseGremaudScene];
