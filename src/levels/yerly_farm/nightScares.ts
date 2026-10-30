import type { Point3 } from '../../engine/audio/audioManager';
import { everyFrame } from '../../game/ambient';
import { wingFlaps } from '../../game/ambient/sounds';
import type { LevelKit } from '../../game/kit/levelKit';
import { playSound } from '../../game/scares/sounds';
import type { SceneContext } from '../../game/scene';
import type { Hen } from './farmyard';
import { HENHOUSE, STALL } from './layout';
import { cluck, cowBreath, henPanic, snort } from './sounds';

/**
 * The Yerly yard after dark, each once per game: a breath in the stall that is a cow, a cow's
 * head swinging out over the rail beside the reporter, and the hens bursting out of the pop
 * hole Bernard forgot to shut. The dog's lunge lives with the dog.
 */
export function yerlyNightScares(kit: LevelKit, ctx: SceneContext, hens: Hen[]): void {
  const fresh = (flag: string) => !ctx.state.hasFlag(flag);
  if (fresh('yerly_stall_breath')) breathInTheStall(kit, ctx);
  if (fresh('yerly_cow_head')) cowOverTheRail(kit, ctx);
  if (fresh('yerly_hens_burst')) hensBurst(kit, ctx, hens);
}

/** Where the rail of the open stall runs, on its east side. */
const RAIL_X = STALL.x + STALL.w / 2 - 0.2;
const DARK_STALL = { x: STALL.x - 0.8, y: 1.3, z: STALL.z - 2 };

/**
 * From across the yard, something in the dark stall breathes through a filter, slow and
 * rasping. Within a few meters it is a cow blowing through her nose, and it stops.
 */
function breathInTheStall(kit: LevelKit, ctx: SceneContext): void {
  const CLOSE = 4.5;
  const HEARD = 15;
  let wait = 4;
  let breaths = 0;
  let done = false;
  everyFrame(kit, (dt) => {
    const p = ctx.player.position;
    const distance = Math.hypot(p.x - DARK_STALL.x, p.z - DARK_STALL.z);
    if (done || ctx.paused || distance > HEARD || (wait -= dt) > 0) return;
    wait = 5.5;
    const close = distance < CLOSE;
    if (close) {
      cowBreath(ctx.audio, DARK_STALL, 0.6);
      setTimeout(() => snort(ctx.audio, DARK_STALL, 0.5), 3000);
    } else playSound(ctx.audio, 'sfx_breath_mask', { at: DARK_STALL, volume: 0.25 });
    done = close || ++breaths >= 7;
    if (done) ctx.state.setFlag('yerly_stall_breath');
  });
}

const HIDE = 0x231d18;
const BLAZE = 0xcac4b6;

/**
 * A fourth cow at the north end of the rail, her head down in the hay in the dark. When the
 * reporter walks past within reach she swings it out over the rail at them and blows, then
 * pulls it back in.
 */
function cowOverTheRail(kit: LevelKit, ctx: SceneContext): void {
  const neck = { x: RAIL_X - 0.75, y: 1.15, z: STALL.z - 2.6 };
  kit.batch((still) => still.box({ w: 0.75, h: 0.85, d: 1.9 }).color(HIDE).at(neck.x - 0.2, 0.55, neck.z - 0.9));
  // Built facing +Z from the neck, so a yaw from atan2 points the muzzle.
  const head = kit
    .group((g) =>
      g.batch((b) => {
        b.box({ w: 0.34, h: 0.36, d: 0.5 }).color(HIDE).at(0, -0.18, 0.3);
        b.box({ w: 0.12, h: 0.2, d: 0.02 }).color(BLAZE).at(0, -0.06, 0.55);
        b.box({ w: 0.26, h: 0.2, d: 0.14 }).color(0x4a3a34).at(0, -0.3, 0.6);
        [-1, 1].forEach((side) => b.box({ w: 0.16, h: 0.06, d: 0.06 }).color(HIDE).at(side * 0.24, 0.0, 0.14));
        [-1, 1].forEach((side) => b.box({ w: 0.03, h: 0.03, d: 0.01 }).color(0x8a7a50).emissive(0x100c06).at(side * 0.15, -0.05, 0.45));
      }),
    )
    .at(neck.x, neck.y, neck.z)
    .dynamic();
  const object = head.object;
  object.rotation.order = 'YXZ';
  const REST = { yaw: Math.PI, pitch: 0.7 };
  object.rotation.set(REST.pitch, REST.yaw, 0);
  let t = -1;
  let yaw = REST.yaw;
  everyFrame(kit, (dt) => {
    const p = ctx.player.position;
    if (t < 0) {
      if (ctx.paused || p.x < RAIL_X || Math.hypot(p.x - RAIL_X, p.z - neck.z) > 1.8) return;
      t = 0;
      yaw = Math.atan2(p.x - neck.x, p.z - neck.z);
      const muzzle = { x: neck.x + Math.sin(yaw) * 0.6, y: neck.y - 0.2, z: neck.z + Math.cos(yaw) * 0.6 };
      snort(ctx.audio, muzzle, 1.2);
      ctx.jolt();
      setTimeout(() => cowBreath(ctx.audio, muzzle, 0.5), 1500);
      ctx.state.setFlag('yerly_cow_head');
    }
    if (t > 7) return;
    t += dt;
    // Out in a third of a second, held, then drawn back over two.
    const out = t < 0.3 ? t / 0.3 : t < 4 ? 1 : Math.max(0, 1 - (t - 4) / 2);
    const ease = out * out * (3 - 2 * out);
    object.rotation.y = REST.yaw + (yaw - REST.yaw) * ease;
    object.rotation.x = REST.pitch - 0.8 * ease;
    object.position.y = neck.y + 0.1 * ease;
  });
}

/**
 * The hens are shut in for the night, but the pop hole is open. A step close to the run sets
 * them off: they burst out of it squawking and flapping into the dark of the run, and stay out.
 */
function hensBurst(kit: LevelKit, ctx: SceneContext, hens: Hen[]): void {
  const hole: Point3 = { x: HENHOUSE.x + 0.5, y: 0.65, z: HENHOUSE.z - 1.14 };
  const flights = hens.map((hen) => ({
    object: hen.body.object,
    to: hen.body.object.position.clone(),
    delay: Math.random() * 0.9,
    seconds: 0.5 + Math.random() * 0.5,
  }));
  let t = -1;
  everyFrame(kit, (dt) => {
    if (t < 0) {
      const p = ctx.player.position;
      if (ctx.paused || Math.hypot(p.x - HENHOUSE.x, p.z - HENHOUSE.z) > 4.2) return;
      t = 0;
      henPanic(ctx.audio, hole, 1.1);
      wingFlaps(ctx.audio, hole, hens.length, 1.4);
      setTimeout(() => cluck(ctx.audio, { ...hole, y: 0.3 }, 0.5), 4200);
      if (Math.hypot(p.x - hole.x, p.z - hole.z) < 4) ctx.jolt();
      ctx.state.setFlag('yerly_hens_burst');
    }
    if (t > 3) return;
    t += dt;
    flights.forEach(({ object, to, delay, seconds }) => {
      const k = Math.min(1, Math.max(0, (t - delay) / seconds));
      object.visible = t > delay;
      object.position.set(hole.x + (to.x - hole.x) * k, hole.y * (1 - k) + Math.sin(k * Math.PI) * 0.5, hole.z + (to.z - hole.z) * k);
      object.rotation.z = k < 1 ? Math.sin(t * 40) * 0.35 : 0;
    });
  });
}
