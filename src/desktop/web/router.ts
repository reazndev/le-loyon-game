import type { ForumStage } from '../forum';
import type { Page, Pages } from './page';
import { boardPages } from './sites/board';
import { notFound } from './sites/errors';
import { guestbookPages } from './sites/guestbook';
import { helvenetPages } from './sites/helvenet';
import { innBookmarkPages } from './sites/innBookmarks';
import { stefPages } from './sites/stef';
import { weatherPages } from './sites/weather';
import { webringPages } from './sites/webring';

export type Lookup = { kind: 'page'; url: string; page: Page } | { kind: 'no-response' };

/** Hosts that answer. Anything else times out, like a dead link in 1998. */
const liveHosts = new Set([
  'www.helvenet.ch',
  'www.sma.ch',
  'www.alpanom.ch',
  'members.netcity.ch',
  'www.guestbook-free.com',
  'www.swissmysteries-ring.ch',
  'www.motonet-romandie.ch',
]);

/** Normalizes an address the way the location bar shows it. */
export function normalize(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = '';
    return parsed.href;
  } catch {
    return url;
  }
}

/** The web as one computer sees it: every page that exists, with the board at one stage. */
export class Web {
  private readonly pages: Pages;

  constructor(stage: ForumStage) {
    this.pages = Object.fromEntries(
      Object.entries({
        ...helvenetPages,
        ...weatherPages,
        ...boardPages(stage),
        ...webringPages,
        ...stefPages,
        ...guestbookPages,
        ...innBookmarkPages,
      }).map(([url, page]) => [normalize(url), page]),
    );
  }

  find(url: string): Lookup {
    const key = normalize(url);
    const page = this.pages[key];
    if (page) return { kind: 'page', url: key, page };
    const host = URL.canParse(key) ? new URL(key).host : '';
    return liveHosts.has(host) ? { kind: 'page', url: key, page: notFound(key) } : { kind: 'no-response' };
  }
}
