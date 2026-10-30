import { app, BrowserWindow, Menu, screen } from 'electron';
import { fileURLToPath } from 'node:url';

const devServerUrl = process.env.VITE_DEV_SERVER_URL;

/**
 * The window opens at twice the 640x480 frame, or once on screens too small for that, so the
 * frame starts at a whole-number scale. The renderer letterboxes 4:3 inside any other size.
 */
function contentSize(): { width: number; height: number } {
  const area = screen.getPrimaryDisplay().workArea;
  const scale = Math.max(1, Math.min(2, Math.floor(Math.min(area.width / 640, area.height / 480))));
  return { width: 640 * scale, height: 480 * scale };
}

function createWindow(): void {
  const window = new BrowserWindow({
    ...contentSize(),
    useContentSize: true,
    minWidth: 640,
    minHeight: 480,
    backgroundColor: '#000000',
    show: false,
    title: 'Le Loyon',
    webPreferences: {
      // Ambience should start without waiting for a key press.
      autoplayPolicy: 'no-user-gesture-required',
      contextIsolation: true,
      sandbox: true,
    },
  });
  window.once('ready-to-show', () => window.show());
  window.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F11' || (input.key === 'Enter' && input.alt)) {
      window.setFullScreen(!window.isFullScreen());
      event.preventDefault();
    }
    if (input.key === 'F12' && devServerUrl) window.webContents.toggleDevTools();
  });

  if (devServerUrl) void window.loadURL(devServerUrl);
  else void window.loadFile(fileURLToPath(new URL('../dist/index.html', import.meta.url)));
}

// No menu bar on any window, and Alt doesn't bring one up.
Menu.setApplicationMenu(null);
// Groups the portable Windows build in the taskbar under the same id as the installer.
app.setAppUserModelId('ch.leloyon.game');
void app.whenReady().then(createWindow);
// The title's Quit closes the only window.
app.on('window-all-closed', () => app.quit());
