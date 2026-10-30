import type { Computer } from '../computer';
import { h } from '../dom';
import { icon, type IconName } from '../gfx/icons';
import type { AppWindow, WindowOptions } from '../ui/window';

const openWindows = new WeakMap<Computer, Map<string, AppWindow>>();

/** Brings an existing window forward, or builds it once. */
function single(pc: Computer, options: WindowOptions, fill: (win: AppWindow) => void): void {
  const open = openWindows.get(pc) ?? new Map<string, AppWindow>();
  openWindows.set(pc, open);
  let win = open.get(options.title);
  if (!win) {
    win = pc.windows.create({ ...options, onClose: () => open.delete(options.title) });
    fill(win);
    open.set(options.title, win);
  }
  pc.windows.open(win);
}

/** My Computer: three drives and nothing useful on them. */
export function openDrives(pc: Computer): void {
  const status = h('div', { class: 'sunken', style: 'padding:2px 6px;margin-top:2px' }, '3 object(s)');
  const notReady = (drive: string) => () => void pc.message(drive, `${drive}\\ is not accessible.\n\nThe device is not ready.`);
  const drive = (label: string, kind: IconName, onClick: () => void) =>
    h('div', { class: 'pc-icon', style: 'color:#111', onClick }, icon(kind, 32), h('span', null, label));
  single(pc, { title: 'My Computer', icon: 'computer', at: { x: 130, y: 60, w: 340, h: 200 }, menu: ['File', 'Edit', 'View', 'Help'] }, (win) =>
    win.body.append(
      h(
        'div',
        { class: 'sunken', style: 'flex:1;background:#fff;display:flex;gap:6px;padding:12px' },
        drive('(A:)', 'floppy', notReady('A:')),
        drive('(C:)', 'hardDisk', () => (status.textContent = pc.setup.disk)),
        drive('(D:)', 'disc', notReady('D:')),
      ),
      status,
    ),
  );
}

export function openRecycleBin(pc: Computer): void {
  single(pc, { title: 'Recycle Bin', icon: 'trash', at: { x: 160, y: 90, w: 320, h: 180 }, menu: ['File', 'Edit', 'View', 'Help'] }, (win) =>
    win.body.append(
      h('div', { class: 'sunken', style: 'flex:1;background:#fff' }),
      h('div', { class: 'sunken', style: 'padding:2px 6px;margin-top:2px' }, '0 object(s)'),
    ),
  );
}
