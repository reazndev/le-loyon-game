import { Vector3 } from 'three';
import { AudioManager } from '../engine/audio/audioManager';
import { playFootstep } from '../engine/audio/footsteps';
import { click } from '../engine/audio/generators';
import { interactLabel } from '../engine/input/bindings';
import { Input } from '../engine/input/input';
import { promptText } from '../engine/interactions';
import { Player } from '../engine/player';
import { keepFrameFitted } from '../engine/render/frame';
import { GameRenderer } from '../engine/render/renderer';
import { loadUiFont } from '../engine/ui/font';
import { Overlay } from '../engine/ui/overlay';
import { GameUi, type PauseAction } from './gameUi';
import { itemInfo } from './items';
import { readSave, writeSave } from './save';
import type { Scene, SceneContext } from './scene';
import { SceneManager } from './sceneManager';
import { GameState, type PlayerPose, type TimeOfDay } from './state';
import { World } from './world';

export interface StartOptions {
  scene: string;
  /** A spawn point name or an exact pose. Default "default". */
  at?: string | PlayerPose;
  time?: TimeOfDay;
  flags?: string[];
}

const SAVE_SLOT = 'main';

/** Owns every system and runs the frame loop. */
export class Game {
  readonly state = new GameState();
  readonly world = new World();
  readonly player = new Player();
  readonly input = new Input();
  readonly audio = new AudioManager();
  readonly renderer: GameRenderer;
  readonly overlay: Overlay;
  readonly ui: GameUi;
  readonly scenes: SceneManager;
  readonly context: SceneContext;
  /** Frames rendered since start. */
  frames = 0;
  private elapsed = 0;
  private lastTime = 0;
  private frameWaiters: { frame: number; resolve: () => void }[] = [];

  constructor(frame: HTMLElement, scenes: Scene[]) {
    keepFrameFitted(frame);
    this.renderer = new GameRenderer(frame);
    this.overlay = new Overlay(frame);
    this.ui = new GameUi(this.overlay, this.state);
    this.context = this.createContext();
    this.scenes = new SceneManager({
      world: this.world,
      state: this.state,
      player: this.player,
      audio: this.audio,
      overlay: this.overlay,
      renderer: this.renderer,
      context: this.context,
    });
    this.scenes.register(...scenes);

    this.audio.unlockOnGesture();
    this.player.events.on('footstep', (step) => playFootstep(this.audio, step.surface, { level: step.fast ? 1.25 : 1 }));
    this.state.events.on('item', ({ item, held }) => {
      if (held) this.overlay.notify(`Got: ${itemInfo(item).name}`);
    });
  }

  async start(options: StartOptions): Promise<void> {
    await loadUiFont();
    this.state.time = options.time ?? 'day';
    options.flags?.forEach((flag) => this.state.setFlag(flag));
    requestAnimationFrame(this.tick);
    await this.scenes.load(options.scene, options.at ?? 'default');
  }

  save(): void {
    this.state.player = this.pose();
    writeSave(localStorage, SAVE_SLOT, this.state.snapshot());
    this.overlay.notify('Saved.');
  }

  /** Loads the save slot. Returns false when there is no readable save. */
  async load(): Promise<boolean> {
    const file = readSave(localStorage, SAVE_SLOT);
    if (!file) {
      this.overlay.notify('No saved game.');
      return false;
    }
    this.state.restore(file);
    await this.scenes.load(file.scene, file.player);
    return true;
  }

  pose(): PlayerPose {
    const { x, y, z } = this.player.position;
    return { x, y, z, yaw: (this.player.yaw * 180) / Math.PI };
  }

  /** Resolves after `count` more frames have rendered. */
  waitFrames(count: number): Promise<void> {
    return new Promise((resolve) => this.frameWaiters.push({ frame: this.frames + count, resolve }));
  }

  private readonly tick = (now: number) => {
    requestAnimationFrame(this.tick);
    const dt = this.lastTime ? Math.min((now - this.lastTime) / 1000, 0.1) : 0;
    this.lastTime = now;
    this.elapsed += dt;

    this.input.update();
    if (this.input.lastDevice === 'gamepad') this.audio.resume();

    if (this.ui.open) this.ui.update(dt, this.input);
    else if (!this.scenes.busy) this.updatePlay(dt);
    if (this.ui.open || this.scenes.busy) this.overlay.prompt.hide();
    this.scenes.update(dt);

    this.updateSenses();
    this.renderer.render(this.world.scene, this.player.camera, this.elapsed);
    this.frames++;
    this.resolveFrameWaiters();
  };

  private updatePlay(dt: number): void {
    const { input, player, world } = this;
    player.update(dt, input.movement(), input.isDown('fast'), world);
    const at = { x: player.position.x, z: player.position.z };
    world.triggers.update(at);

    const forward = player.forward();
    const focus = world.interactions.focus(at, { x: forward.x, z: forward.z });
    if (focus) this.overlay.prompt.show(interactLabel[input.lastDevice], promptText(focus));
    else this.overlay.prompt.hide();

    if (input.pressed('interact') && focus) void focus.onInteract();
    else if (input.pressed('flashlight')) {
      world.lights.flashlightOn = !world.lights.flashlightOn;
      click(this.audio);
    } else if (input.pressed('inventory')) this.ui.openInventory();
    else if (input.pressed('pause')) this.ui.openPause(this.pauseActions());
  }

  /** Moves the flashlight and the audio listener with the camera. */
  private updateSenses(): void {
    const camera = this.player.camera;
    const forward = camera.getWorldDirection(new Vector3());
    const right = new Vector3().crossVectors(forward, camera.up).normalize();
    // Held at chest height, a little to the right, so the beam has some parallax.
    const hand = camera.position.clone().addScaledVector(right, 0.18).add(new Vector3(0, -0.35, 0));
    const aim = forward.clone().add(new Vector3(0, -0.06, 0));
    this.world.lights.aimFlashlight(hand, aim);
    this.world.lights.update(camera.position, this.elapsed);
    this.audio.setListener(camera.position, forward);
  }

  private pauseActions(): PauseAction[] {
    const actions: PauseAction[] = [
      { label: 'Resume', run: () => undefined },
      { label: 'Save game', run: () => this.save() },
      { label: 'Load game', run: () => void this.load() },
    ];
    // Browsers ignore window.close() on tabs they didn't open, so only offer it on desktop.
    if (navigator.userAgent.includes('Electron')) actions.push({ label: 'Quit to desktop', run: () => window.close() });
    return actions;
  }

  private createContext(): SceneContext {
    const game = this;
    return {
      state: this.state,
      audio: this.audio,
      player: this.player,
      goTo: (scene, spawn) => void this.scenes.load(scene, spawn ?? 'default'),
      dialogue: (script) => this.ui.dialogue(script),
      say: (lines, speaker) => this.ui.say(lines, speaker),
      notify: (text) => this.overlay.notify(text),
      get time() {
        return game.scenes.time;
      },
    };
  }

  private resolveFrameWaiters(): void {
    const due = this.frameWaiters.filter((waiter) => waiter.frame <= this.frames);
    this.frameWaiters = this.frameWaiters.filter((waiter) => waiter.frame > this.frames);
    due.forEach((waiter) => waiter.resolve());
  }
}
