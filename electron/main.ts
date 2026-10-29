import { app, BrowserWindow } from 'electron';
import { fileURLToPath } from 'node:url';

const devServerUrl = process.env.VITE_DEV_SERVER_URL;

function createWindow(): void {
  const window = new BrowserWindow({
    width: 1280,
    height: 960,
    minWidth: 640,
    minHeight: 480,
    backgroundColor: '#000000',
    autoHideMenuBar: true,
    title: 'Le Loyon',
    webPreferences: {
      // Ambience should start without waiting for a key press.
      autoplayPolicy: 'no-user-gesture-required',
      contextIsolation: true,
      sandbox: true,
    },
  });
  window.setMenu(null);
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

void app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
