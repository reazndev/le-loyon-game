import type { SoundHandle } from '../../engine/audio/audioManager';
import { handshake } from '../audio/handshake';
import { playHandshake } from '../audio/modem';
import type { Computer } from '../computer';
import { h } from '../dom';
import { modemLight } from '../gfx/icons';
import type { AppWindow } from '../ui/window';

/** "Connect to Helvenet": the dial-up window and the modem handshake. */
export class DialUpApp {
  private win: AppWindow | null = null;
  private sound: SoundHandle | null = null;
  private timers: ReturnType<typeof setTimeout>[] = [];
  private then: (() => void) | null = null;
  private connectedAt = 0;

  constructor(private readonly pc: Computer) {}

  /** Opens the window. `then` runs once connected, such as opening Navigator. */
  open(then?: () => void): void {
    this.then = then ?? null;
    this.win ??= this.pc.windows.create({
      title: 'Connect to Helvenet',
      icon: 'dialUp',
      x: 150,
      y: 130,
      w: 360,
      h: 172,
      onClose: () => {
        this.cancel();
        this.win = null;
      },
    });
    this.pc.windows.open(this.win);
    if (this.pc.connected) this.showConnected();
    else if (!this.sound) this.showForm();
  }

  /** Dials straight away, as the inn computer does when someone sits at it. */
  dial(then?: () => void): void {
    this.open(then);
    if (!this.sound && !this.pc.connected) this.connect();
  }

  hangUp(): void {
    this.cancel();
    if (this.win) this.pc.windows.close(this.win);
  }

  private showForm(): void {
    const row = (label: string, ...value: (string | HTMLElement)[]) =>
      h('div', { style: 'display:flex;align-items:center;gap:8px;height:26px;white-space:nowrap' }, h('span', { style: 'width:88px' }, label), ...value);
    const stars = () => h('span', { class: 'field', style: 'width:84px' }, '********');
    this.body(
      h(
        'div',
        { style: 'padding:10px 14px' },
        row('User name:', stars()),
        row('Password:', stars(), h('span', { class: 'field', style: 'padding:0 3px;line-height:14px' }, 'x'), 'Save password'),
        row('Phone:', this.pc.setup.phone),
      ),
      this.buttons(['Connect', () => this.connect()], ['Cancel', () => this.close()]),
    );
  }

  private connect(): void {
    const script = handshake(this.pc.setup.phone, this.pc.setup.speed);
    const status = h('div', null, script.status[0]!.text);
    const light = h('span', null, modemLight(0));
    this.body(
      h('div', { style: 'display:flex;gap:14px;align-items:center;padding:28px 18px 20px' }, light, status),
      this.buttons(['Cancel', () => this.close()]),
    );
    this.sound = playHandshake(this.pc.audio, script);
    let phase = 0;
    const blink = setInterval(() => light.replaceChildren(modemLight((phase = 1 - phase))), 260);
    this.timers = [
      ...script.status.slice(1).map((step) => setTimeout(() => (status.textContent = step.text), step.at * 1000)),
      setTimeout(() => {
        clearInterval(blink);
        this.sound = null;
        this.pc.connected = true;
        this.connectedAt = this.pc.clock.minutes;
      }, script.duration * 1000),
      setTimeout(() => {
        const then = this.then;
        this.close();
        then?.();
      }, (script.duration + 1.2) * 1000),
    ];
    this.timers.push(blink);
  }

  private showConnected(): void {
    const minutes = this.pc.clock.minutes - this.connectedAt;
    this.body(
      h(
        'div',
        { style: 'display:flex;gap:14px;align-items:center;padding:24px 18px 16px' },
        modemLight(1),
        h('div', null, `Connected at ${this.pc.setup.speed} bps`, h('br'), `Duration: ${minutes} min`),
      ),
      this.buttons(['Disconnect', () => this.pc.hangUp()], ['Close', () => this.close()]),
    );
  }

  private cancel(): void {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers = [];
    this.sound?.stop();
    this.sound = null;
  }

  private close(): void {
    if (this.win) this.pc.windows.close(this.win);
  }

  private body(...children: HTMLElement[]): void {
    this.win?.body.replaceChildren(...children);
  }

  private buttons(...buttons: [string, () => void][]): HTMLElement {
    return h(
      'div',
      'pc-msg-buttons',
      buttons.map(([label, run]) => h('div', { class: 'btn', onClick: run }, label)),
    );
  }
}
