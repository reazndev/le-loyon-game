import type { Input } from '../engine/input/input';
import type { MenuEntry } from '../engine/ui/menuScreen';
import type { Overlay } from '../engine/ui/overlay';
import { DialogueRunner, type DialogueScript, type DialogueStep } from './dialogue';
import { itemInfo } from './items';
import type { GameState } from './state';

/** A screen that takes over input until it closes. */
interface Modal {
  update(dt: number, input: Input): void;
}

export interface PauseAction {
  label: string;
  run: () => void;
}

/** Runs the dialogue box, inventory, and pause menu as modal screens over the game. */
export class GameUi {
  /** The dialogue step on screen, or null. For tests. */
  dialogueStep: DialogueStep | null = null;
  private modal: Modal | null = null;

  constructor(
    private readonly overlay: Overlay,
    private readonly state: GameState,
  ) {}

  /** True while a dialogue, the inventory, or the pause menu is open. */
  get open(): boolean {
    return this.modal !== null;
  }

  update(dt: number, input: Input): void {
    this.modal?.update(dt, input);
  }

  dialogue(script: DialogueScript): Promise<void> {
    return new Promise((resolve) => {
      const runner = new DialogueRunner(script, this.state);
      const box = this.overlay.dialogue;
      const show = (step: DialogueStep) => {
        this.dialogueStep = step;
        if (step.kind === 'end') {
          box.hide();
          this.dialogueStep = null;
          this.close();
          resolve();
        } else if (step.kind === 'line') {
          box.show(step.speaker, step.text);
        } else {
          box.show(step.speaker, step.text ?? '', step.choices);
        }
      };
      this.modal = {
        update: (dt, input) => {
          box.update(dt);
          const step = runner.step;
          if (box.typing) {
            if (input.pressed('interact')) box.finishTyping();
          } else if (step.kind === 'line') {
            if (input.pressed('interact')) show(runner.advance());
          } else if (step.kind === 'choice') {
            const index = box.choices.handle(input);
            if (index !== null) show(runner.choose(index));
          }
        },
      };
      show(runner.step);
    });
  }

  say(lines: string | string[], speaker?: string): Promise<void> {
    const node = { lines: typeof lines === 'string' ? [lines] : lines, ...(speaker ? { speaker } : {}) };
    return this.dialogue({ start: 'say', nodes: { say: node } });
  }

  openInventory(): void {
    const entries: MenuEntry[] = this.state.inventory.map((id) => {
      const info = itemInfo(id);
      return { label: info.name, detail: info.description };
    });
    this.openMenu('INVENTORY', entries, 'You carry nothing of note.', ['cancel', 'inventory'], () => undefined);
  }

  openPause(actions: PauseAction[]): void {
    this.openMenu('PAUSED', actions.map((a) => ({ label: a.label })), '', ['cancel', 'pause'], (index) => {
      this.closeMenu();
      actions[index]!.run();
    });
  }

  private openMenu(
    title: string,
    entries: MenuEntry[],
    emptyText: string,
    closeOn: ('cancel' | 'pause' | 'inventory')[],
    onConfirm: (index: number) => void,
  ): void {
    const menu = this.overlay.menu;
    menu.open(title, entries, emptyText);
    this.modal = {
      update: (_dt, input) => {
        if (closeOn.some((action) => input.pressed(action))) return this.closeMenu();
        const index = menu.list.handle(input);
        if (index !== null) onConfirm(index);
      },
    };
  }

  private closeMenu(): void {
    this.overlay.menu.close();
    this.close();
  }

  private close(): void {
    this.modal = null;
  }
}
