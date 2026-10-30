import type { GameState } from '../../game/state';
import type { ForumStage } from '../forum';

/** What a page can read while it renders. */
export interface PageEnv {
  readonly state: GameState;
  readonly stage: ForumStage;
  /** The taskbar time, "HH:MM". */
  readonly time: string;
}

/** What a page can do once it has arrived. */
export interface LoadEnv extends PageEnv {
  /** Records a reading flag, which can solve the village puzzle. */
  read(flag: string): void;
  setFlag(flag: string): void;
  /** Starts the page's background MIDI. Stop or leaving the page ends it. */
  playMusic(): void;
  /** Reports a board post as read, for the inn. */
  postRead(id: string): void;
}

/**
 * One web page. Its HTML is real 1998-style markup (tables, font tags, center) plus widget
 * tags the browser fills in: `<x-img>`, `<x-gif>`, `<x-counter>`, `<x-text>`, `<x-marquee>`.
 */
export interface Page {
  title: string;
  /** Kilobytes. Bigger pages arrive more slowly. */
  size: number;
  html(env: PageEnv): string;
  /** CSS background of the page, such as a tiled GIF. Default Navigator gray. */
  background?: string | (() => string);
  /** Default text and link colors, like the BODY tag's TEXT, LINK, and VLINK. */
  colors?: { text?: string; link?: string; visited?: string };
  onLoad?(env: LoadEnv): void;
}

export type Pages = Record<string, Page>;

/** A page from a fixed HTML string. */
export function page(title: string, size: number, html: string, extra: Partial<Page> = {}): Page {
  return { title, size, html: () => html, ...extra };
}
