import { speakers } from '../../content';
import type { LevelKit } from '../../game/kit/levelKit';
import { viewAngle } from '../../game/scares/beats';
import type { ScareDirector } from '../../game/scares/director';
import type { SceneContext } from '../../game/scene';
import { everyFrame } from '../church/everyFrame';
import { playNode } from '../forest_path/play';
import { yawToward } from '../forest_path/trail';
import { SEAT, YANNICK_SEAT } from './layout';
import { fallNight } from './turns';

/** If the player won't turn for this long, the bench creaks behind them anyway. */
const PATIENCE = 40;
/** Degrees from the view center at which Yannick counts as fully in view. */
const IN_VIEW = 16;
const HEAD = { x: YANNICK_SEAT.x, y: 1.2, z: YANNICK_SEAT.z };

/**
 * Jumpscare 2 (`inn_doorway` in 07-scares.md). After the post "turn around", the reporter turns
 * from the computer and Yannick is already in the stübli, sitting in the dark at the regulars'
 * table, hood up, his face just caught by the monitor. Not a figure in a doorway: that is Marc's,
 * the same night. When he is fully in view the bench creaks and he gets up. Then his confession,
 * and night 3 begins.
 */
export function veilleur(kit: LevelKit, ctx: SceneContext, scares: ScareDirector): () => void {
  const yannick = kit
    .npc('yannick')
    .at(YANNICK_SEAT.x, 0, YANNICK_SEAT.z)
    .faceYaw(yawToward(SEAT.x - YANNICK_SEAT.x, SEAT.z - YANNICK_SEAT.z))
    .sit(YANNICK_SEAT.height);
  const { character } = yannick;
  character.root.visible = false;
  let waited = -1;

  const confess = async (late: boolean) => {
    waited = -1;
    scares.fire('inn_doorway');
    character.stand();
    if (late) {
      await ctx.say('Sorry.', speakers.yannick);
      await turnTo(ctx, HEAD);
    }
    character.lookAt = ctx.player.camera.position;
    await playNode(ctx, 'yannick_reveal');
    fallNight(ctx, 3, 'stubli', false);
  };

  everyFrame(kit, (dt) => {
    if (waited < 0 || ctx.paused) return;
    waited += dt;
    const eye = ctx.player.camera.position;
    const view = ctx.player.forward();
    if (viewAngle({ eye, view }, HEAD) < IN_VIEW) void confess(false);
    else if (waited > PATIENCE) void confess(true);
  });

  // He has been there the whole time: shown while the reporter reads, with their back to him.
  return () => {
    character.root.visible = true;
    waited = 0;
  };
}

/** Turns the player to face a point over a second and a half. */
function turnTo(ctx: SceneContext, point: { x: number; z: number }): Promise<void> {
  const { player } = ctx;
  const from = player.yaw;
  const target = Math.atan2(-(point.x - player.position.x), -(point.z - player.position.z));
  const delta = Math.atan2(Math.sin(target - from), Math.cos(target - from));
  const start = performance.now();
  return new Promise((resolve) => {
    const step = () => {
      const t = Math.min(1, (performance.now() - start) / 1500);
      player.yaw = from + delta * (t * t * (3 - 2 * t));
      if (t < 1) requestAnimationFrame(step);
      else resolve();
    };
    step();
  });
}
