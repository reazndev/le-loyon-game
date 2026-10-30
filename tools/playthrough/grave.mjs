import { StageError } from './session.mjs';

/**
 * Night 2, puzzle P5, played for real: Marc's side of the Chassot plot, the tarp, and the ossuary
 * shed, against Raymond's rounds.
 */

export const HOLE = { x: -17.88, z: -9.78 };
const GRAVE_FOOT = { x: -17.88, z: -8.13 };
const SHED = { x: -15.5, z: 9.75 };
/** The game runs this many times faster during the dig, so the rounds come round in minutes. */
export const DIG_SPEED = 4;

/** Raymond is on his round and closer to the grave than this many meters. He hears the shovel at 20. */
const TOO_CLOSE = 28;
const raymondNear = (s) =>
  s.eval(
    ([hole, limit]) => window.__game.characters().some((c) => c.id === 'raymond' && c.visible && Math.hypot(c.x - hole.x, c.z - hole.z) < limit),
    [HOLE, TOO_CLOSE],
  );
/** Where Raymond stands and how far that is from the hole, for a failure message. */
const whereIsRaymond = (s) =>
  s.eval((hole) => {
    const r = window.__game.characters().find((c) => c.id === 'raymond' && c.visible);
    const torch = window.__game.game.world.lights.flashlightOn ? 'on' : 'off';
    if (!r?.visible) return `Raymond offstage, torch ${torch}`;
    return `Raymond at ${r.x.toFixed(1)}, ${r.z.toFixed(1)}, ${Math.hypot(r.x - hole.x, r.z - hole.z).toFixed(1)} m from the hole, torch ${torch}`;
  }, HOLE);
export const inHole = (s) => s.eval(() => window.__game.pose().y < -0.25);

export async function torchOff(s) {
  if (await s.eval(() => window.__game.game.world.lights.flashlightOn)) await s.key('KeyF');
}

async function setCrouched(s, on) {
  if ((await s.eval(() => window.__game.game.player.crouched)) !== on) await s.key('KeyC');
}

/** Climbs out of the hole by walking against its wall. */
export async function climbOut(s) {
  if (!(await inHole(s))) return;
  await s.hold('ArrowUp', () => window.__game.pose().y > -0.05, { timeout: 20_000 });
  await s.talk();
}

/**
 * Raymond's round has started: out of the hole, the tarp over it, and into the ossuary shed with
 * the torch off, crouched, until his light has gone back down the hill.
 */
async function waitOutTheRound(s) {
  s.log('    (Raymond is coming: tarp over, into the shed)');
  await climbOut(s);
  const open = await s.eval(() => (window.__game.state().counts.dig_stage ?? 0) >= 1 && !window.__game.state().flags.includes('grave_refilled'));
  if (open) {
    const prompts = await s.eval(() => window.__game.hotspots().map((h) => h.prompt));
    if (prompts.includes('Drag the tarp to the grave')) {
      await s.use('Drag the tarp to the grave');
      await s.talk();
    }
    await s.use('Pull the tarp over the hole');
  }
  await s.teleport(SHED.x, SHED.z, 180);
  await torchOff(s);
  await setCrouched(s, true);
  await s.until(() => !window.__game.characters().some((c) => c.id === 'raymond' && c.visible), 'Raymond to finish his round', { timeout: 120_000 });
  if ((await s.state()).flags.includes('caught')) throw new StageError('Raymond caught the reporter in the shed');
  await setCrouched(s, false);
  await s.teleport(GRAVE_FOOT.x, GRAVE_FOOT.z + 1.2, 0);
  if ((await s.state()).flags.includes('tarp_over_hole')) await s.use('Pull the tarp back');
}

/**
 * Waits in the shed for Raymond's next round to come and go, so the minute after it is clear of him.
 * The coffin takes that long to open and empty at normal speed.
 */
export async function afterTheNextRound(s) {
  await s.until(() => window.__game.characters().some((c) => c.id === 'raymond' && c.visible), "Raymond's next round", { timeout: 120_000 });
  await waitOutTheRound(s);
}

/** Waits out Raymond's round if he is anywhere on it, so the reporter can walk out by the front gate. */
export async function whenRaymondIsGone(s) {
  const out = await s.eval(() => window.__game.characters().some((c) => c.id === 'raymond' && c.visible));
  if (out) await waitOutTheRound(s);
}

/**
 * Holds E on the grave until `done` holds, stopping for each of Raymond's rounds and playing
 * each stage's narration. `prompt` is "Dig" or "Fill in the grave".
 */
export async function holdAtGrave(s, prompt, done, what) {
  const end = Date.now() + 400_000;
  while (!(await s.eval(done))) {
    if (Date.now() > end) throw new StageError(`Never finished: ${what}`);
    if ((await s.state()).flags.includes('caught')) throw new StageError(`Raymond caught the reporter: ${what} (${await whereIsRaymond(s)})`);
    if (await raymondNear(s)) {
      await waitOutTheRound(s);
      continue;
    }
    const site = await sitePrompt(s);
    // No prompt while the reporter climbs in or out.
    if (site === null) {
      await s.frames(10);
      continue;
    }
    if (site === 'Climb down') {
      await s.use('Climb down', { near: HOLE });
      await s.until(() => window.__game.pose().y < -0.25 && !window.__game.game.ui.open, 'climbing into the hole');
      continue;
    }
    if (site !== prompt) throw new StageError(`The grave offers "${site}", expected "${prompt}"`);
    await atGrave(s, prompt);
    // The first stroke asks "Dig." or "Not yet."; the first choice digs.
    await s.talk();
    await s
      .hold(
        'KeyE',
        ([hole, limit]) =>
          window.__game.modal() !== null ||
          window.__game.characters().some((c) => c.id === 'raymond' && c.visible && Math.hypot(c.x - hole.x, c.z - hole.z) < limit),
        { timeout: 60_000, arg: [HOLE, TOO_CLOSE] },
      )
      .catch(() => undefined);
    await s.talk();
  }
}

/**
 * Uses the dig site. From inside the hole the scene holds the reporter in place, so they only
 * turn to face the coffin end; from outside they step up to it.
 */
export async function atGrave(s, prompt) {
  if (!(await inHole(s))) return s.use(prompt, { near: HOLE });
  // Just after climbing down the reporter is still settling and may face the headstone's prompt.
  const facing = (p) => {
    window.__game.game.player.yaw = 0;
    return window.__game.prompt() === p;
  };
  await s.until(facing, `the prompt "${prompt}" in the hole`, { timeout: 5_000, arg: prompt });
  await s.key('KeyE');
}

/** The prompt of the dig site's one hotspot, in the middle of Marc's bed, or null when it has none. */
const sitePrompt = (s) =>
  s.eval((hole) => window.__game.hotspots().find((h) => Math.hypot(h.x - hole.x, h.z - hole.z) < 0.05)?.prompt ?? null, HOLE);
