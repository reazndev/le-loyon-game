import { dialogues, documents, type DocumentId } from '../content';
import { interactLabel } from '../engine/input/bindings';
import type { Input } from '../engine/input/input';
import type { DocumentLook } from '../engine/ui/documentView';
import type { MenuEntry } from '../engine/ui/menuScreen';
import type { Overlay } from '../engine/ui/overlay';
import { developed, TREELINE_PHOTO } from './camera/photos';
import { DialogueRunner, type DialogueScript, type DialogueStep } from './dialogue';
import { choiceText, displayLine } from './displayLine';
import { documentLook, documentPages, type ReadableDocument } from './documentPages';
import { inventoryEntry, itemUse } from './inventory';
import { hintsDocument, notebookDocument } from './notebook';
import { changeSetting, settingRows, type Settings } from './settings';
import type { GameState } from './state';

/** A screen that takes over input until it closes. Only the top one of the stack updates. */
interface Modal {
  update(dt: number, input: Input): void;
}

/** A full-frame screen opened with `openScreen`. */
export interface ScreenHandle {
  close(): void;
  /** False while a dialogue or another screen covers this one. */
  readonly onTop: boolean;
}

export interface PauseAction {
  label: string;
  run: () => void;
}

type ModalUpdate = (dt: number, input: Input, close: () => void) => void;

/** Seconds the reporter looks at photo 7 before saying anything. */
const TREELINE_PAUSE = 1.2;

/**
 * Runs the dialogue box, documents, photos, and menus as a stack of modal screens over the game.
 * A screen opened over another one hands input back to it when it closes.
 */
export class GameUi {
  /** The dialogue step on screen, or null. For tests. */
  dialogueStep: DialogueStep | null = null;
  /** The title of the document on screen, or null. For tests. */
  documentTitle: string | null = null;
  /** Raises the camera; the inventory calls it when the player uses the Polaroid. */
  raiseCamera: () => void = () => undefined;
  private readonly stack: Modal[] = [];

  constructor(
    private readonly overlay: Overlay,
    private readonly state: GameState,
  ) {}

  /** True while any dialogue, screen, or menu is open. */
  get open(): boolean {
    return this.stack.length > 0;
  }

  update(dt: number, input: Input): void {
    this.overlay.menu.keyLabel = interactLabel[input.lastDevice];
    this.stack.at(-1)?.update(dt, input);
  }

  /** Plays a dialogue. Resolves with the text of the last choice the player picked, or null. */
  dialogue(script: DialogueScript): Promise<string | null> {
    const runner = new DialogueRunner(script, this.state);
    let picked: string | null = null;
    const box = this.overlay.dialogue;
    const show = (step: DialogueStep) => {
      this.dialogueStep = step.kind === 'end' ? null : step;
      if (step.kind === 'line') box.showLine(displayLine(step.speaker, step.text));
      if (step.kind === 'choice') box.showLine(displayLine(step.speaker, step.text ?? ''), step.choices.map(choiceText));
    };
    const ended = this.present(
      (dt, input, close) => {
        box.update(dt);
        const step = runner.step;
        if (box.typing) {
          if (input.pressed('interact')) box.finishTyping();
        } else if (step.kind === 'line') {
          if (input.pressed('interact')) show(runner.advance());
        } else if (step.kind === 'choice') {
          const index = box.choices.handle(input);
          if (index !== null) {
            picked = step.choices[index] ?? null;
            show(runner.choose(index));
          }
        }
        if (runner.step.kind === 'end') close();
      },
      () => {
        box.hide();
        this.dialogueStep = null;
      },
      (close) => {
        show(runner.step);
        if (runner.step.kind === 'end') close();
      },
    );
    return ended.then(() => picked);
  }

  async say(lines: string | string[], speaker?: string): Promise<void> {
    const node = { lines: typeof lines === 'string' ? [lines] : lines, ...(speaker ? { speaker } : {}) };
    await this.dialogue({ start: 'say', nodes: { say: node } });
  }

  /** Shows a document from the content page by page, with its translation underneath. */
  readDocument(id: DocumentId): Promise<void> {
    return this.read(documents[id], documentLook(id));
  }

  /** The quest log, opened at the first page, where the next step sits above the notes. */
  openNotebook(): Promise<void> {
    return this.read(notebookDocument(this.state), 'notebook');
  }

  /** The next step and the controls. */
  openHints(): Promise<void> {
    return this.read(hintsDocument(this.state), 'notebook');
  }

  /** Holds up a Polaroid. Photo 7 makes the reporter look again once it has developed. */
  openPhoto(item: string): Promise<void> {
    const photo = this.state.photo(item);
    if (!photo) return Promise.resolve();
    const view = this.overlay.photo;
    view.show(photo.image, photo.caption, developed(photo, Date.now()));
    let looked = 0;
    return this.present(
      (dt, input, close) => {
        const amount = developed(photo, Date.now());
        view.develop(amount);
        if ((['interact', 'cancel', 'inventory'] as const).some((action) => input.pressed(action))) return close();
        if (item !== TREELINE_PHOTO || amount < 1 || looked > TREELINE_PAUSE) return;
        looked += dt;
        if (looked > TREELINE_PAUSE) {
          const later = this.state.hasFlag('read_marc_notebook');
          void this.dialogue(dialogues[later ? 'photo_treeline_look_after' : 'photo_treeline_look']);
        }
      },
      () => view.close(),
    );
  }

  /** Shows `element` over the 3D view and gives it all input until `close` runs. */
  openScreen(element: HTMLElement, update: (dt: number, input: Input) => void): ScreenHandle {
    this.overlay.screens.appendChild(element);
    let close = () => undefined as void;
    void this.present(update, () => element.remove(), (closeModal) => (close = closeModal));
    const stack = this.stack;
    const modal = stack.at(-1);
    return {
      close: () => close(),
      get onTop() {
        return stack.at(-1) === modal;
      },
    };
  }

  openInventory(): void {
    const ids = [...this.state.inventory];
    this.menu('INVENTORY', ids.map((id) => inventoryEntry(id, this.state)), 'You carry nothing of note.', ['cancel', 'inventory'], (index, close) => {
      const id = ids[index]!;
      const use = itemUse(id, this.state);
      if (use?.kind === 'read') void this.readDocument(use.document);
      if (use?.kind === 'notebook') void this.openNotebook();
      if (use?.kind === 'photo') void this.openPhoto(use.item);
      if (use?.kind === 'camera') {
        close();
        this.raiseCamera();
      }
    });
  }

  openPause(actions: PauseAction[]): void {
    this.menu('PAUSED', actions.map((a) => ({ label: a.label })), '', ['cancel', 'pause'], (index, close) => {
      close();
      actions[index]!.run();
    });
  }

  /** Left and right change a value, confirm flips a switch. `onChange` gets every new value. */
  openSettings(initial: Settings, onChange: (settings: Settings) => void): Promise<void> {
    let settings = initial;
    const menu = this.overlay.menu;
    const entries = (): MenuEntry[] => settingRows(settings);
    menu.open('SETTINGS', entries());
    return this.present(
      (_dt, input, close) => {
        if (input.pressed('cancel') || input.pressed('pause')) return close();
        const row = menu.list.selected;
        const isSwitch = typeof entries()[row]?.value === 'string';
        const delta = input.pressed('left') ? -1 : input.pressed('right') || (isSwitch && input.pressed('interact')) ? 1 : 0;
        menu.list.handle(input);
        if (delta === 0) return;
        settings = changeSetting(settings, row, delta);
        menu.refresh(entries());
        onChange(settings);
      },
      () => menu.close(),
    );
  }

  private read(document: ReadableDocument, look: DocumentLook, start: 'first' | 'last' = 'first'): Promise<void> {
    const pages = documentPages(document, look);
    const view = this.overlay.document;
    let index = start === 'last' ? pages.length - 1 : 0;
    view.show(pages[index]!);
    this.documentTitle = document.title;
    return this.present(
      (_dt, input, close) => {
        if (input.pressed('cancel')) return close();
        const next = input.pressed('interact') || input.pressed('right') || input.pressed('down');
        const back = input.pressed('left') || input.pressed('up');
        if (next && index === pages.length - 1) return close();
        const turned = Math.min(pages.length - 1, Math.max(0, index + (next ? 1 : back ? -1 : 0)));
        if (turned !== index) view.show(pages[(index = turned)]!);
      },
      () => {
        view.close();
        this.documentTitle = null;
      },
    );
  }

  private menu(
    title: string,
    entries: MenuEntry[],
    emptyText: string,
    closeOn: ('cancel' | 'pause' | 'inventory')[],
    onConfirm: (index: number, close: () => void) => void,
  ): void {
    const menu = this.overlay.menu;
    menu.open(title, entries, emptyText);
    void this.present(
      (_dt, input, close) => {
        if (closeOn.some((action) => input.pressed(action))) return close();
        const index = menu.list.handle(input);
        if (index !== null) onConfirm(index, close);
      },
      () => menu.close(),
    );
  }

  /**
   * Pushes a modal and resolves when it closes. `close` removes it wherever it sits in the stack,
   * so a screen can close while a dialogue covers it. `onOpen` gets `close` before the first frame.
   */
  private present(update: ModalUpdate, onClose: () => void, onOpen?: (close: () => void) => void): Promise<void> {
    return new Promise((resolve) => {
      let closed = false;
      const close = () => {
        if (closed) return;
        closed = true;
        const index = this.stack.indexOf(modal);
        if (index >= 0) this.stack.splice(index, 1);
        onClose();
        resolve();
      };
      const modal: Modal = { update: (dt, input) => update(dt, input, close) };
      this.stack.push(modal);
      onOpen?.(close);
    });
  }
}
