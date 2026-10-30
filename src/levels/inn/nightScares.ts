import { Color, Vector3 } from 'three';
import { handshake } from '../../desktop/audio/handshake';
import { playHandshake } from '../../desktop/audio/modem';
import { innSetup } from '../../desktop/setup';
import { everyFrame } from '../../game/ambient';
import type { LevelKit } from '../../game/kit/levelKit';
import { viewAngle, type Beat } from '../../game/scares/beats';
import { lookBack } from '../../game/scares/lookBack';
import { otherStep, playSound } from '../../game/scares/sounds';
import type { SceneContext } from '../../game/scene';
import type { CafeParts } from './cafe';
import type { InnDressing } from './dressing';
import { CAFE, CAFE_RADIATOR, RADIATOR, ROOM3, ROOM3_COAT, STUBLI, UPPER } from './layout';
import { radiatorHiss } from './sounds';
import type { Monitor } from './stubli';

/**
 * The inn after dark, each once per game. Night 1: the café radiator breathing, steps in the
 * attic over room 3, and a shape in room 3's window that is the reporter's coat. Any night:
 * Yannick's modem dialing out on its own. Night 2: the café television on to snow, and the spare
 * chair turned. Returns the beats for the inn's director; the rest runs on its own.
 */
export function nightScares(kit: LevelKit, ctx: SceneContext, dressing: InnDressing, parts: { cafe: CafeParts; monitor: Monitor }): Beat[] {
  if (!dressing.night) return [];
  const { state } = ctx;
  const night = state.count('night');
  const fresh = (flag: string) => !state.hasFlag(flag);
  if (fresh('inn_window_coat')) coatInTheWindow(kit, ctx);
  if (night === 1 && fresh('inn_radiator_breath')) radiatorBreathing(kit, ctx);
  if (night === 2 && fresh('inn_tv_snow')) televisionOn(kit, ctx, parts.cafe);
  if (night === 2 && fresh('inn_chair_turned')) chairTurned(kit, ctx, parts.cafe);
  return [
    {
      id: 'inn_modem',
      when: [{ enter: { x: STUBLI.x0 + 3.2, z: (STUBLI.z0 + STUBLI.z1) / 2, w: 6.4, d: STUBLI.z1 - STUBLI.z0 } }, { after: 4 }],
      do: [{ after: 2, run: () => dialOut(ctx, parts.monitor) }],
      set: 'inn_modem_dialed',
    },
    ...(night === 1 ? [stepsInTheAttic()] : []),
  ];
}

/** Yannick's machine wakes, dials the board with the full screech, and hangs up. He set it to fetch the posts at night. */
function dialOut(ctx: SceneContext, monitor: Monitor): void {
  const color = monitor.screen.mesh.material.uniforms.uColor.value as Color;
  const dark = color.clone();
  const { phone, speed } = innSetup('');
  const script = handshake(phone, speed);
  color.set(0x40607a);
  if (monitor.light.light) monitor.light.light.intensity = 1.3;
  playHandshake(ctx.audio, script);
  setTimeout(() => {
    color.copy(dark);
    if (monitor.light.light) monitor.light.light.intensity = 0.5;
  }, (script.duration + 9) * 1000);
}

/** Someone crossing the attic over room 3, stopping halfway, then a few steps back. Yannick, after his things. */
function stepsInTheAttic(): Beat {
  const y = UPPER + ROOM3.h + 0.3;
  const z = (ROOM3.z0 + ROOM3.z1) / 2;
  const across = Array.from({ length: 6 }, (_, i) => ({ x: ROOM3.x0 + 0.4 + i * 0.55, at: i * 0.7 }));
  const back = [0, 1, 2].map((i) => ({ x: across[4]!.x - i * 0.55, at: across[5]!.at + 4 + i * 0.75 }));
  return {
    id: 'inn_attic_steps',
    when: [{ enter: { x: (ROOM3.x0 + ROOM3.x1) / 2, z, w: 2.8, d: 3 } }, { after: 3 }],
    do: [{ after: 5, run: (c) => [...across, ...back].forEach((s) => setTimeout(() => otherStep(c.audio, 'wood', { x: s.x, y, z }, false), s.at * 1000)) }],
    set: 'inn_attic_steps',
  };
}

/**
 * The café radiator in the dark: from across the room each cycle is a breath through a filter;
 * within a few meters it is steam in the valve and a knock in the pipe, and it stops.
 */
function radiatorBreathing(kit: LevelKit, ctx: SceneContext): void {
  const CLOSE = 3.2;
  let wait = 6;
  let breaths = 0;
  let done = false;
  everyFrame(kit, (dt) => {
    const p = ctx.player.position;
    const inCafe = p.y < 1 && p.x > CAFE.x0 && p.x < CAFE.x1 && p.z > CAFE.z0 && p.z < CAFE.z1;
    if (done || ctx.paused || !inCafe || (wait -= dt) > 0) return;
    wait = 5.5;
    const close = Math.hypot(p.x - CAFE_RADIATOR.x, p.z - CAFE_RADIATOR.z) < CLOSE;
    if (close) radiatorHiss(ctx.audio, CAFE_RADIATOR, 0.5);
    else playSound(ctx.audio, 'sfx_breath_mask', { at: CAFE_RADIATOR, volume: 0.22 });
    done = close || ++breaths >= 8;
    if (done) ctx.state.setFlag('inn_radiator_breath');
  });
}

/** The café television comes on to snow once the player has looked away; its timer, Monique says. Off again after half a minute. */
function televisionOn(kit: LevelKit, ctx: SceneContext, cafe: CafeParts): void {
  const at = { x: CAFE.x1 - 0.76, y: 2.06, z: -0.48 };
  const color = cafe.tvScreen.mesh.material.uniforms.uColor.value as Color;
  const off = color.clone();
  const snow = new Color(0x9aa4ac);
  const glow = kit.light({ color: 0x8a9aaa, intensity: 0, range: 4.5 }).at(at.x - 0.5, at.y, at.z + 0.2);
  let left = 0;
  let hiss = 0;
  lookBack(kit, ctx, {
    at,
    within: 9,
    if: () => ctx.time > 40,
    change: () => {
      left = 30;
      ctx.state.setFlag('inn_tv_snow');
    },
  });
  everyFrame(kit, (dt) => {
    if (left <= 0) return;
    left -= dt;
    const on = left > 0;
    const level = on ? 0.3 + Math.random() * 0.25 : 0;
    if (on) color.copy(snow).multiplyScalar(level);
    else color.copy(off);
    if (glow.light) glow.light.intensity = level * 2;
    if (on && (hiss -= dt) <= 0) {
      hiss = 3.8;
      playSound(ctx.audio, 'sfx_static', { at, volume: 0.45 });
    }
  });
}

/** The spare chair by the stübli door turned to face the room, as if someone had sat watching it. Yannick did. */
function chairTurned(kit: LevelKit, ctx: SceneContext, cafe: CafeParts): void {
  const chair = cafe.spareChair.object;
  lookBack(kit, ctx, {
    at: { x: chair.position.x, y: 0.6, z: chair.position.z },
    within: 8,
    change: () => {
      chair.position.x += 0.25;
      chair.rotation.y += (55 * Math.PI) / 180;
      ctx.state.setFlag('inn_chair_turned');
    },
  });
}

const SHADE = 0x24221f;

/**
 * Room 3's window at night is a mirror: looking into it from close, a head and shoulders stand
 * in the glass behind the reporter. It is the coat on its hook, placed where its reflection
 * would fall. A board creaks by the door; turning round, it is gone.
 */
function coatInTheWindow(kit: LevelKit, ctx: SceneContext): void {
  const pane = { x: ROOM3.x1 - 0.1, y: UPPER + 1.5, z: RADIATOR.z };
  const collar = { x: 2 * ROOM3.x1 - ROOM3_COAT.x, y: ROOM3_COAT.y + 0.45, z: ROOM3_COAT.z };
  const shape = kit
    .group((g) => {
      g.box({ w: 0.01, h: 0.2, d: 0.15 }).color(SHADE).unlit().at(0, 0, 0);
      g.box({ w: 0.01, h: 0.34, d: 0.4 }).color(SHADE).unlit().at(0, -0.36, 0);
    })
    .dynamic();
  shape.object.visible = false;
  const camera = ctx.player.camera;
  const view = new Vector3();
  let shown = 0;
  let done = false;
  everyFrame(kit, (dt) => {
    if (done || ctx.paused) return;
    const eye = camera.position;
    camera.getWorldDirection(view);
    // Where the line from the eye to the coat's mirror image crosses the glass.
    const k = (pane.x - eye.x) / (collar.x - eye.x);
    const y = eye.y + (collar.y - eye.y) * k;
    const z = eye.z + (collar.z - eye.z) * k;
    const onGlass = eye.x < pane.x && Math.abs(z - pane.z) < 0.38 && Math.abs(y - pane.y) < 0.4;
    const looking = viewAngle({ eye, view }, pane) < 22 && Math.hypot(pane.x - eye.x, pane.z - eye.z) < 3;
    if (!shape.object.visible) {
      if (!looking || !onGlass) return;
      shape.object.visible = true;
      setTimeout(() => playSound(ctx.audio, 'sfx_floorboard', { at: { x: ROOM3_COAT.x + 0.5, y: UPPER, z: ROOM3_COAT.z + 0.4 }, volume: 0.45 }), 900);
    }
    shape.object.position.set(pane.x, y, z);
    shown += dt;
    if (looking && onGlass && shown < 2.4) return;
    shape.object.visible = false;
    done = true;
    ctx.state.setFlag('inn_window_coat');
  });
}
