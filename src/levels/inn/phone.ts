import { speakers } from '../../content';
import type { SoundHandle } from '../../engine/audio/audioManager';
import type { LevelKit } from '../../game/kit/levelKit';
import type { ScareDirector } from '../../game/scares/director';
import type { SceneContext } from '../../game/scene';
import { playNode } from '../forest_path/play';
import type { InnDressing } from './dressing';
import { playEnding } from './endingScreens';
import { PHONE } from './layout';
import { dialTone, phoneRing, receiverUp } from './sounds';
import { dayOf } from './story';

/**
 * The beige phone on the stübli wall. A dial tone most days; the editor at noon on day 3; static
 * and something like breathing on night 2; and on Friday morning, the call that ends the game.
 */
export class InnPhone {
  private ringing: SoundHandle | null = null;
  private busy = false;

  constructor(
    kit: LevelKit,
    private readonly ctx: SceneContext,
    private readonly dressing: InnDressing,
    private readonly scares: ScareDirector,
  ) {
    kit
      .hotspot({
        prompt: () => (this.ringing ? 'Answer the phone' : 'Lift the phone'),
        radius: 0.5,
        enabled: () => !this.busy,
        onInteract: () => void this.lift(),
      })
      .at(PHONE.x, 0, PHONE.z + 0.55);
    kit.use((k) => k.later('register', () => k.world.sounds.track({ stop: () => this.ringing?.stop(0) })));
  }

  get isRinging(): boolean {
    return this.ringing !== null;
  }

  /** The editor's call at noon on day 3. Monique calls through if she's at the counter. */
  ring(moniqueHere: boolean): void {
    if (this.ringing) return;
    this.ringing = phoneRing(this.ctx.audio, PHONE);
    if (moniqueHere) setTimeout(() => this.ringing && !this.ctx.paused && void this.ctx.say("It's for you.", speakers.monique), 4500);
  }

  private async lift(): Promise<void> {
    const { ctx } = this;
    const { state } = ctx;
    this.busy = true;
    receiverUp(ctx.audio, PHONE);
    if (this.ringing) {
      this.ringing.stop(0);
      this.ringing = null;
      await playNode(ctx, 'phone_editor');
    } else if (this.dressing.endingMorning && !state.hasFlag('ending_publish') && !state.hasFlag('ending_secret')) {
      await this.callTheNewspaper();
    } else if (state.time === 'night' && state.count('night') === 2) {
      this.scares.fire('vil_inn_phone');
      await new Promise((resolve) => setTimeout(resolve, 4600));
      await playNode(ctx, 'phone_night_static');
    } else {
      const tone = dialTone(ctx.audio, PHONE);
      if (!state.hasFlag('editor_called') && dayOf(state) !== 3) await playNode(ctx, 'phone_idle');
      else await ctx.say('A dial tone.');
      tone.stop();
    }
    this.busy = false;
  }

  /** "The reporter dials the newspaper. The editor answers on the second ring." */
  private async callTheNewspaper(): Promise<void> {
    const { ctx } = this;
    await ctx.say('I dial the newspaper.');
    await playNode(ctx, 'ending_call');
    const { state } = ctx;
    if (state.hasFlag('ending_publish')) await playEnding(ctx, 'publish');
    else if (state.hasFlag('ending_secret')) await playEnding(ctx, 'secret');
  }
}
