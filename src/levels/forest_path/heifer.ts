import { Vector3 } from 'three';
import { dialogues } from '../../content';
import type { LevelKit } from '../../game/kit/levelKit';
import { viewAngle, type Beat } from '../../game/scares/beats';
import type { SceneContext } from '../../game/scene';
import { everyFrame } from '../church/everyFrame';
import { lookPoint } from './beats';
import { height, markers } from './layout';
import { heiferAtTheFork, type StoryPhase } from './story';

const { for2_heifer_fork: FORK_SPOT, for2_roofline: ROOF, for2_stump_shape: SHAPE, for2_stump: STUMP, for2_branch: BRANCH } = markers;

const FIND_DISTANCE = 3.5;
const FOLLOW_DISTANCE = 2.6;

/**
 * Day 2 in the forest, puzzle P3 when the reporter skipped the follow on night 1: Marquise stands
 * at the fork staring up the right branch (for2_heifer). Up there, a dark upright shape is gone
 * once looked away from, and a branch breaks deeper in (for2_stump). Looking up the branch from
 * the fork, the fog thins once and shows a barn roof in the trees (for2_roofline). Found, she
 * follows the reporter home, looking back over her shoulder (for2_led_home). Returns the beats
 * for the scene's director.
 */
export function heiferInTheForest(kit: LevelKit, ctx: SceneContext, phase: StoryPhase): Beat[] {
  const { state, player } = ctx;
  const atTheFork = heiferAtTheFork(state, phase);
  // Brought into the forest after she was found, she is already behind the reporter.
  const following = phase === 'day2' && state.hasFlag('heifer_found') && !state.hasFlag('heifer_returned');
  if (!atTheFork && !following) return [];

  const stare = new Vector3(ROOF.x, height(ROOF.x, ROOF.z) + 2.5, ROOF.z);
  const cow = kit.npc('marquise').at(FORK_SPOT.x, height(FORK_SPOT.x, FORK_SPOT.z), FORK_SPOT.z).faceYaw(FORK_SPOT.yaw);
  let glance = 6;
  const follow = () => {
    cow.character.lookAt = null;
    cow.followPlayer(FOLLOW_DISTANCE);
  };
  if (following) {
    let placed = false;
    everyFrame(kit, () => {
      if (placed) return;
      placed = true;
      const back = player.forward().multiplyScalar(-FOLLOW_DISTANCE);
      cow.character.position.set(player.position.x + back.x, player.position.y, player.position.z + back.z);
      follow();
    });
  } else cow.character.lookAt = stare;

  // On the way she keeps looking back at the trees. When the reporter looks too, there is nothing.
  everyFrame(kit, (dt) => {
    if (ctx.paused || !state.hasFlag('heifer_found')) return;
    glance -= dt;
    if (glance > 0) return;
    cow.character.lookAt = cow.character.lookAt ? null : stare;
    glance = cow.character.lookAt ? 2.2 : 7 + Math.random() * 6;
  });
  if (!atTheFork) return [];

  let finding = false;
  everyFrame(kit, () => {
    if (finding || ctx.paused || state.hasFlag('heifer_found')) return;
    if (cow.character.position.distanceTo(player.position) > FIND_DISTANCE) return;
    finding = true;
    void ctx
      .dialogue(dialogues.heifer_found)
      .then(() => ctx.dialogue(dialogues.heifer_lead))
      .then(follow);
  });
  return stageTheFork(kit, ctx);
}

/** The barn roof in the fog, the shape that isn't there, and the branch. */
function stageTheFork(kit: LevelKit, ctx: SceneContext): Beat[] {
  const roof = kit
    .group((g) => {
      g.box({ w: 8, h: 3, d: 5 }).texture('wood_planks', { tile: [1.8, 2.4] }).color(0x3a3834);
      g.gable({ w: 8.6, d: 5.8, h: 3 }).texture('wood_planks', { tile: [1.4, 2.2] }).color(0x2c2b28).at(0, 3, 0);
    })
    .at(ROOF.x, -0.5, ROOF.z)
    .rotY(ROOF.yaw)
    .onGround();
  roof.object.visible = false;

  const shape = kit
    .group((g) => {
      g.cylinder({ r: 0.2, h: 1.55, sides: 6 }).color(0x1c1c1a);
      g.box({ w: 0.32, h: 0.34, d: 0.28 }).color(0x1a1a18).at(0.02, 1.5, 0);
    })
    .at(SHAPE.x, 0, SHAPE.z)
    .onGround();
  kit.cylinder({ r: 0.34, h: 0.75, sides: 7 }).texture('bark_spruce', { tile: 0.7 }).color(0x5e564c).at(STUMP.x, -0.05, STUMP.z).onGround().collider();
  kit.cylinder({ r: 0.32, h: 0.06, sides: 7 }).texture('moss_rock', { tile: 0.5 }).color(0x6a7056).at(STUMP.x, 0.7, STUMP.z).onGround();
  kit.trees('bare', [
    { x: SHAPE.x - 1.2, z: SHAPE.z - 0.4, scale: 1.1, yaw: 40 },
    { x: SHAPE.x + 1.1, z: SHAPE.z + 0.3, scale: 0.95, yaw: 200 },
  ]).collider();

  let shapeArmed = false;
  const beats: Beat[] = [
    {
      id: 'for2_roofline',
      when: [{ enter: { ...markers.for2_heifer_fork, r: 7 } }, { look: { ...lookPoint(ROOF, height), within: 34, angle: 14, hold: 1 } }],
      do: [
        { fog: { far: 30, density: 0.045, seconds: 5, fade: 2.5 } },
        { run: () => void (roof.object.visible = true) },
        { after: 3.5, run: (c) => c.say('A barn. Up there in the trees. Why would anyone build a barn in a forest?') },
        { after: 10.5, run: () => void (roof.object.visible = false) },
      ],
    },
    {
      id: 'for2_stump',
      when: { look: { ...lookPoint(SHAPE, height), within: 22, angle: 9, hold: 0.6 } },
      do: [{ run: () => void (shapeArmed = true) }],
    },
    {
      id: 'for2_branch',
      when: { enter: { ...STUMP, r: 5 } },
      do: [{ sound: 'sfx_branch', at: BRANCH, after: 2.5 }],
    },
  ];
  const view = new Vector3();
  const top = lookPoint(SHAPE, height);
  let awayFor = 0;
  everyFrame(kit, (dt) => {
    if (!shapeArmed || !shape.object.visible || ctx.paused) return;
    ctx.player.camera.getWorldDirection(view);
    awayFor = viewAngle({ eye: ctx.player.camera.position, view }, top) > 40 ? awayFor + dt : 0;
    if (awayFor > 1) shape.object.visible = false;
  });
  return beats;
}
