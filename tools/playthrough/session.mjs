import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const SHOTS = resolve(import.meta.dirname, '../../docs/screenshots');

/** Thrown when the game doesn't reach a state the run expects. */
export class StageError extends Error {}

/**
 * One browser page running the game, with the moves a playthrough needs. Keys go in as real key
 * presses; teleports, hotspot lookups, and state checks go through `window.__game`.
 */
export class Session {
  constructor(page, errors, log) {
    this.page = page;
    this.errors = errors;
    this.log = log;
  }

  eval(fn, arg) {
    return this.page.evaluate(fn, arg);
  }

  frames(count) {
    return this.eval((n) => window.__game.waitFrames(n), count);
  }

  state() {
    return this.eval(() => window.__game.state());
  }

  async seconds(count) {
    await this.page.waitForTimeout(count * 1000);
  }

  /** Taps a key, as the player would, and lets the game see it. */
  async key(code, frames = 3) {
    await this.page.keyboard.press(code);
    await this.frames(frames);
  }

  /** Holds a key down until `done` returns true in the page, or the time runs out. */
  async hold(code, done, { timeout = 30_000, arg } = {}) {
    await this.page.keyboard.down(code);
    try {
      await this.page.waitForFunction(done, arg, { timeout, polling: 'raf' });
    } finally {
      await this.page.keyboard.up(code);
    }
  }

  /** Waits for a condition in the page. `what` names it in the error. */
  async until(fn, what, { timeout = 30_000, arg } = {}) {
    try {
      await this.page.waitForFunction(fn, arg, { timeout, polling: 100 });
    } catch {
      throw new StageError(`Timed out waiting for ${what}`);
    }
  }

  /** Waits until no scene is loading and nothing holds the input. */
  async idle(what = 'the game to be idle', timeout = 30_000) {
    await this.until(() => !window.__game.game.scenes.busy && !window.__game.game.ui.open, what, { timeout });
    await this.frames(2);
  }

  async inScene(id, timeout = 30_000) {
    await this.until((scene) => window.__game.state().scene === scene && !window.__game.game.scenes.busy, `scene ${id}`, { timeout, arg: id });
    await this.frames(5);
  }

  /** Puts the player at a pose without a fade. */
  async teleport(x, z, yaw) {
    await this.eval(([px, pz, pyaw]) => {
      const ground = window.__game.game.world.ground.sample(px, pz).height;
      window.__game.teleport(px, ground, pz, pyaw);
    }, [x, z, yaw]);
    await this.frames(2);
  }

  /**
   * Walks forward from a pose until the scene changes to `scene`, as through a door or an exit.
   * Dialogues that a beat starts on the way are played through.
   */
  async walkOut(x, z, yaw, scene, timeout = 20_000) {
    await this.teleport(x, z, yaw);
    const end = Date.now() + timeout;
    while (!(await this.eval((id) => window.__game.game.scenes.busy || window.__game.state().scene === id, scene))) {
      if (Date.now() > end) throw new StageError(`Walked from ${x}, ${z} without reaching ${scene}`);
      await this.hold('ArrowUp', (id) => window.__game.game.scenes.busy || window.__game.state().scene === id || window.__game.modal() !== null, {
        timeout: Math.max(1000, end - Date.now()),
        arg: scene,
      }).catch(() => undefined);
      if (await this.eval(() => window.__game.modal() === 'dialogue' || window.__game.modal() === 'document')) await this.talk();
    }
    await this.inScene(scene);
  }

  /** Waits for the interaction with this prompt, steps up to it, checks the prompt shows, and presses E. */
  async use(prompt, { near, timeout = 20_000 } = {}) {
    await this.until((p) => window.__game.hotspots().some((h) => h.prompt === p), `"${prompt}" to be available`, { timeout, arg: prompt });
    const placed = await this.eval(([p, n]) => window.__game.approach(p, n ?? undefined), [prompt, near ?? null]);
    if (!placed) throw new StageError(`Found no free spot to reach "${prompt}"`);
    await this.frames(3);
    const shown = await this.eval(() => window.__game.prompt());
    if (shown !== prompt) throw new StageError(`Expected the prompt "${prompt}", saw "${shown}"`);
    await this.key('KeyE');
  }

  /** Steps up to a character by cast id and talks, then plays the conversation through. */
  async talkTo(id, ...picks) {
    const who = await this.character(id);
    await this.use('Talk', { near: who });
    await this.talk(...picks);
  }

  async character(id) {
    const who = (await this.eval(() => window.__game.characters())).find((c) => c.id === id && c.visible);
    if (!who) throw new StageError(`${id} is not in ${(await this.state()).scene}`);
    return who;
  }

  /**
   * Plays dialogues and documents until the input is free. At each choice it picks the first
   * remaining pick that a choice contains, else the first choice. Throws if a pick is never used.
   * Stops at other screens, such as a computer or an ending page, and leaves them to the caller.
   */
  async talk(...picks) {
    const left = [...picks];
    let quiet = 0;
    while (quiet < 12) {
      const modal = await this.eval(() => window.__game.modal());
      if (process.env.TALK_DEBUG) this.log(`      ${modal} ${JSON.stringify(await this.eval(() => window.__game.dialogue()))}`);
      if (modal === null || modal === 'screen') {
        quiet++;
        await this.frames(2);
        continue;
      }
      quiet = 0;
      if (modal === 'document') {
        await this.key('KeyE');
        continue;
      }
      const { typing, step } = await this.eval(() => ({ typing: window.__game.game.overlay.dialogue.typing, step: window.__game.dialogue() }));
      if (typing || step.kind !== 'choice') {
        await this.key('KeyE');
        continue;
      }
      const pickAt = left.findIndex((pick) => step.choices.some((choice) => choice.includes(pick)));
      const index = pickAt < 0 ? 0 : step.choices.findIndex((choice) => choice.includes(left[pickAt]));
      if (pickAt >= 0) left.splice(pickAt, 1);
      this.log(`    > ${step.choices[index]}`);
      for (let i = 0; i < index; i++) await this.key('ArrowDown');
      await this.key('KeyE');
    }
    if (left.length) throw new StageError(`Never offered: ${left.join(', ')}`);
  }

  /** Waits for a dialogue that starts after a pause, such as a door being answered, and plays it. */
  async awaitTalk(what, ...picks) {
    await this.until(() => window.__game.modal() === 'dialogue', what, { timeout: 30_000 });
    await this.talk(...picks);
  }

  /** Raises the Polaroid at what the player faces, shoots, and waits for the print. */
  async photograph(item) {
    await this.key('KeyQ', 20);
    await this.key('KeyE');
    await this.until((id) => window.__game.state().inventory.includes(id), item, { timeout: 15_000, arg: item });
    await this.idle(`the camera to lower after ${item}`);
  }

  /** Presses E on full-frame screens, such as ending pages, until `done` holds in the page. */
  async confirmScreens(done, what, { timeout = 90_000 } = {}) {
    const end = Date.now() + timeout;
    while (!(await this.eval(done))) {
      if (Date.now() > end) throw new StageError(`Timed out waiting for ${what}`);
      await this.key('KeyE', 20);
    }
  }

  async expectFlags(...flags) {
    const held = this.endState ?? (await this.state()).flags;
    const missing = flags.filter((flag) => !held.includes(flag));
    if (missing.length) throw new StageError(`Flags not set: ${missing.join(', ')}`);
  }

  async expectItems(...items) {
    const state = await this.state();
    const missing = items.filter((item) => !state.inventory.includes(item));
    if (missing.length) throw new StageError(`Items not held: ${missing.join(', ')}`);
  }

  async expectCounts(counts) {
    const state = await this.state();
    const wrong = Object.entries(counts).filter(([name, value]) => (state.counts[name] ?? 0) !== value);
    if (wrong.length) throw new StageError(`Counts: ${wrong.map(([name, value]) => `${name} is ${state.counts[name] ?? 0}, expected ${value}`).join('; ')}`);
  }

  /** Saves the 640x480 frame as docs/screenshots/flow-<name>.png. */
  async shot(name) {
    const path = resolve(SHOTS, `flow-${name}.png`);
    mkdirSync(dirname(path), { recursive: true });
    await this.page.locator('#frame').screenshot({ path });
    return path;
  }
}
