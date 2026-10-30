import { Vector3 } from 'three';
import type { NpcBuilder } from '../../game/kit/npc';
import type { LevelKit } from '../../game/kit/levelKit';
import { viewAngle } from '../../game/scares/beats';
import { playSound } from '../../game/scares/sounds';
import type { SceneContext } from '../../game/scene';
import { everyFrame } from '../church/everyFrame';
import type { StoryPhase } from '../forest_path/story';
import { heiferPlace } from './heifer';
import { fieldHeight, HOME_SPOT, MARQUISE, SHAPE, STUMP } from './layout';

/**
 * Puzzle P3 and the day 2 forest edge beats (07-scares.md). Marquise stands at the edge of the
 * Bois-Noir staring into the trees (for2_heifer); walking up to her makes her follow the reporter
 * home, looking back over her shoulder at the forest the whole way (for2_led_home). Twelve meters
 * in, a dark upright shape is gone when the reporter looks again, and there is a stump in a
 * different place (for2_stump). Bernard's dialogue sets `heifer_returned`; then she goes to the stall.
 * Returns the meters between her and the reporter, 0 when she isn't out.
 */

const FIND_DISTANCE = 3.5;
const FOLLOW_DISTANCE = 2.6;
/** A point in the trees at a cow's head height, where she stares. */
const STARE = new Vector3(SHAPE.x, fieldHeight(SHAPE.x, SHAPE.z) + 1.2, SHAPE.z);

export function marquise(kit: LevelKit, ctx: SceneContext, phase: StoryPhase): () => number {
  const { state, player } = ctx;
  const place = heiferPlace(state, phase);
  forestEdgeShape(kit, ctx, place === 'at_the_edge');
  if (place === 'missing') return () => 0;

  const spot = place === 'home' ? HOME_SPOT : MARQUISE;
  const cow = kit.npc('marquise').at(spot.x, fieldHeight(spot.x, spot.z), spot.z).faceYaw(place === 'home' ? 200 : MARQUISE.yaw);
  let following = place === 'following';
  let placed = place !== 'following';
  let glance = 6;

  if (place === 'at_the_edge') cow.character.lookAt = STARE;
  everyFrame(kit, (dt) => {
    if (ctx.paused) return;
    // Coming back to the farm with her found, she is already behind the reporter.
    if (!placed) {
      placed = true;
      const back = player.forward().multiplyScalar(-FOLLOW_DISTANCE);
      cow.character.position.set(player.position.x + back.x, player.position.y, player.position.z + back.z);
      startFollowing(cow, 0);
    }
    const near = Math.hypot(cow.character.position.x - player.position.x, cow.character.position.z - player.position.z) < FIND_DISTANCE;
    if (place === 'at_the_edge' && !following && !state.hasFlag('heifer_found') && near) {
      state.setFlag('heifer_found');
      following = true;
      startFollowing(cow, 1.8);
    }
    if (following && state.hasFlag('heifer_returned')) {
      following = false;
      cow.character.stop();
      cow.character.lookAt = null;
      void cow.character.walkTo(HOME_SPOT.x, HOME_SPOT.z);
    }
    if (!following) return;
    // She keeps looking back at the trees. When the reporter looks too, there is nothing.
    glance -= dt;
    if (glance < 0) {
      cow.character.lookAt = cow.character.lookAt ? null : STARE;
      glance = cow.character.lookAt ? 2.2 : 7 + Math.random() * 6;
    }
  });
  return () => Math.hypot(cow.character.position.x - player.position.x, cow.character.position.z - player.position.z);
}

function startFollowing(cow: NpcBuilder, delay: number): void {
  setTimeout(() => {
    cow.character.lookAt = null;
    cow.followPlayer(FOLLOW_DISTANCE);
  }, delay * 1000);
}

/**
 * for2_stump: a dark upright shape among the spruce, where Marquise is looking. Once the reporter
 * has looked at it and looked away, it is gone. Walking in finds a mossy stump nearby, and then,
 * deeper in, a branch breaks.
 */
function forestEdgeShape(kit: LevelKit, ctx: SceneContext, active: boolean): void {
  kit.cylinder({ r: 0.34, h: 0.75, sides: 7 }).texture('bark_spruce', { tile: 0.7 }).color(0x5e564c).at(STUMP.x, -0.05, STUMP.z).onGround().collider();
  kit.cylinder({ r: 0.32, h: 0.06, sides: 7 }).texture('moss_rock', { tile: 0.5 }).color(0x6a7056).at(STUMP.x, 0.7, STUMP.z).onGround();
  if (!active) return;
  const shape = kit
    .group((g) => {
      g.cylinder({ r: 0.2, h: 1.55, sides: 6 }).color(0x1c1c1a).at(0, 0, 0);
      g.box({ w: 0.32, h: 0.34, d: 0.28 }).color(0x1a1a18).at(0.02, 1.5, 0);
    })
    .at(SHAPE.x, 0, SHAPE.z)
    .onGround();
  const top = new Vector3(SHAPE.x, fieldHeight(SHAPE.x, SHAPE.z) + 1.2, SHAPE.z);
  const view = new Vector3();
  let seenFor = 0;
  let awayFor = 0;
  let branchIn: number | null = null;
  everyFrame(kit, (dt) => {
    if (ctx.paused) return;
    const eye = ctx.player.camera.position;
    ctx.player.camera.getWorldDirection(view);
    const angle = viewAngle({ eye, view }, top);
    if (shape.object.visible) {
      if (angle < 9 && eye.distanceTo(top) < 22) seenFor += dt;
      else if (seenFor > 0.5 && angle > 40) awayFor += dt;
      if (awayFor > 1) shape.object.visible = false;
      return;
    }
    const p = ctx.player.position;
    if (branchIn === null && Math.hypot(p.x - STUMP.x, p.z - STUMP.z) < 5) branchIn = 2.5;
    if (branchIn === null) return;
    branchIn -= dt;
    if (branchIn > 0) return;
    branchIn = Number.POSITIVE_INFINITY;
    playSound(ctx.audio, 'sfx_branch', { at: { x: SHAPE.x - 16, y: fieldHeight(SHAPE.x, SHAPE.z) + 1, z: SHAPE.z - 4 } });
  });
}
