import { motorbikeWallpaper } from './gfx/wallpaper';

export type Bookmark = { label: string; url: string } | { folder: string; items: Bookmark[] };

/** What differs between the reporter's home PC and the old computer in the inn's stübli. */
export interface Setup {
  mode: 'home' | 'inn';
  /** Taskbar clock at power on. */
  clock: string;
  /** Modem speed as shown on connect. */
  speed: string;
  phone: string;
  homeUrl: string;
  bookmarks: Bookmark[];
  /** What My Computer says about drive C:. */
  disk: string;
  wallpaper?: () => string;
}

export const HELVENET_PHONE = '0848 80 80 80';
export const BOARD_URL = 'http://www.alpanom.ch/board/index.html';

export const homeSetup: Setup = {
  mode: 'home',
  clock: '23:10',
  speed: '33,600',
  phone: HELVENET_PHONE,
  homeUrl: 'http://www.helvenet.ch/',
  bookmarks: [
    { label: 'Helvenet - Home', url: 'http://www.helvenet.ch/' },
    { label: 'Alpine Anomalies Board', url: BOARD_URL },
    { label: 'SMI weather - Plateau', url: 'http://www.sma.ch/text/plateau.html' },
    { folder: 'Work', items: [{ label: 'Swiss Press Agency login', url: 'http://extranet.spa-presse.ch/login/' }] },
  ],
  disk: 'C: 1.2 GB, 214 MB free.',
};

export function innSetup(clock: string): Setup {
  return {
    mode: 'inn',
    clock,
    speed: '28,800',
    phone: HELVENET_PHONE,
    homeUrl: 'http://www.helvenet.ch/',
    bookmarks: [
      { label: 'Alpine Anomalies Board', url: BOARD_URL },
      { label: 'MotoNet Romandie', url: 'http://www.motonet-romandie.ch/' },
      { label: 'Allez les Verts! - supporters', url: 'http://members.netcity.ch/~allezlesverts/' },
      { label: 'Leurs - notre village', url: 'http://members.netcity.ch/~leurs/' },
    ],
    disk: 'C: 540 MB, 38 MB free.',
    wallpaper: motorbikeWallpaper,
  };
}
