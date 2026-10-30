import { Vector3 } from 'three';
import { miscPhoto } from '../../content';
import type { AudioManager } from '../../engine/audio/audioManager';
import { click } from '../../engine/audio/generators';
import { cancelLabel, interactLabel } from '../../engine/input/bindings';
import type { Input, Movement } from '../../engine/input/input';
import { photoTarget } from '../../engine/interactions';
import type { Player } from '../../engine/player';
import { fadeOpacity } from '../../engine/ui/dom';
import type { Overlay } from '../../engine/ui/overlay';
import { Viewfinder } from '../../engine/ui/viewfinder';
import type { GameUi } from '../gameUi';
import { registerItems } from '../items';
import type { GameState } from '../state';
import type { World } from '../world';
import { FILM_COUNT, isCameraPhoto, photoCaption, resolveShot, TREELINE_PHOTO } from './photos';
import { printPhoto } from './print';
import { filmMotor, flashCharge, shutter } from './sounds';

export interface CameraDeps {
  ui: GameUi;
  overlay: Overlay;
  state: GameState;
  audio: AudioManager;
  world: World;
  player: Player;
  /** Resolves with a copy of the next rendered frame. */
  captureFrame(): Promise<HTMLCanvasElement>;
  /** The player's movement input, with the turning setting applied. */
  movement(input: Input): Movement;
}

/** The viewfinder turns at half speed, for framing. */
const AIM_TURN = 0.5;
/** Seconds the motor runs before the print is out. */
const MOTOR_SECONDS = 1.3;

const wait = (seconds: number) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));

/**
 * The reporter's Polaroid. Raising it shows the viewfinder; a shot uses one of the `film_shots`,
 * fires the flash, and gives a photo item with a print of the frame. Photos that a dialogue gives,
 * such as Marc's portrait, fire the camera the same way.
 */
export class PolaroidCamera {
  private raised = false;

  constructor(private readonly deps: CameraDeps) {
    deps.state.events.on('item', ({ item, held }) => {
      if (held && isCameraPhoto(item) && !deps.state.photo(item)) void this.shootForScript(item);
    });
  }

  raise(): void {
    const { state, ui, audio, player, world } = this.deps;
    if (this.raised || !state.hasItem('polaroid_camera')) return;
    this.raised = true;
    const finder = new Viewfinder();
    finder.shots = state.count(FILM_COUNT);
    let busy = false;
    const showHints = (input?: Input) => {
      const device = input?.lastDevice ?? 'keyboard';
      finder.hints = [
        [interactLabel[device], 'Shoot'],
        [cancelLabel[device], 'Lower'],
      ];
    };
    showHints();
    finder.element.style.opacity = '0';
    void fadeOpacity(finder.element, 1, 0.2);
    flashCharge(audio);

    const handle = ui.openScreen(finder.element, (dt, input) => {
      if (busy) return;
      player.update(dt, { forward: 0, turn: this.deps.movement(input).turn * AIM_TURN }, false, world);
      if (input.pressed('cancel') || input.pressed('camera')) return lower();
      if (!input.pressed('interact')) return;
      busy = true;
      finder.hints = [];
      void this.shoot(finder).then((shot) => {
        if (shot) return lower();
        busy = false;
        showHints(input);
      });
    });
    const lower = () => {
      busy = true;
      void fadeOpacity(finder.element, 0, 0.15).then(() => {
        handle.close();
        this.raised = false;
      });
    };
  }

  /** Takes a picture of what is in the viewfinder. Resolves false when there is no film. */
  private async shoot(finder: Viewfinder): Promise<boolean> {
    const { state, audio, world, player } = this.deps;
    const film = state.count(FILM_COUNT);
    if (film <= 0) {
      click(audio);
      this.deps.overlay.notify('No film left.');
      return false;
    }
    const forward = player.forward();
    const focus = world.interactions.focus({ x: player.position.x, z: player.position.z }, { x: forward.x, z: forward.z });
    const target = focus ? photoTarget(focus) : undefined;
    const shot = resolveShot({ scene: state.scene, state, taken: state.photos, ...(target ? { target } : {}) });
    state.setCount(FILM_COUNT, film - 1);
    finder.shots = film - 1;
    await this.expose(shot.item, shot.caption);
    if (shot.item.startsWith('photo_misc_')) registerItems({ [shot.item]: miscPhoto(shot.caption) });
    await wait(MOTOR_SECONDS + 0.2);
    state.giveItem(shot.item);
    return true;
  }

  /** A photo a dialogue hands over, such as Marc in his mask: the camera fires on the frame behind the text. */
  private async shootForScript(item: string): Promise<void> {
    const { state } = this.deps;
    state.setCount(FILM_COUNT, Math.max(0, state.count(FILM_COUNT) - 1));
    await this.expose(item, photoCaption(item));
  }

  /** Shutter, flash, and motor; the print of the flash-lit frame is stored under `item`. */
  private async expose(item: string, caption: string | undefined): Promise<void> {
    const { state, audio, world, player, overlay } = this.deps;
    // Holds the spot until the frame comes back, so a second item event can't shoot it twice.
    state.addPhoto(item, { image: '', takenAt: Date.now() });
    shutter(audio);
    const flash = world.lights.addPoint(player.camera.getWorldPosition(new Vector3()), {
      color: 0xf2f0ff,
      intensity: 3.4,
      range: 8,
    });
    const frame = await this.deps.captureFrame();
    world.lights.removePoint(flash);
    void overlay.flash();
    const image = printPhoto(frame, { figure: item === TREELINE_PHOTO });
    state.addPhoto(item, { image, takenAt: Date.now(), ...(caption === undefined ? {} : { caption }) });
    filmMotor(audio, MOTOR_SECONDS);
  }
}
