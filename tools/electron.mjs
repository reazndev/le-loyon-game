// Starts the desktop app. With --dev it runs against the Vite dev server; otherwise it loads
// the production build in dist/.
import { spawn } from 'node:child_process';
import electron from 'electron';
import { startDevServer } from './devServer.mjs';

const dev = process.argv.includes('--dev');
const devServer = dev ? await startDevServer() : null;

const env = { ...process.env };
// Electron-based terminals and editors export this, and it makes Electron behave as plain Node.
delete env.ELECTRON_RUN_AS_NODE;
if (devServer) env.VITE_DEV_SERVER_URL = devServer.url;

const child = spawn(String(electron), ['.'], { stdio: 'inherit', env });
child.on('close', async (code) => {
  await devServer?.server.close();
  process.exit(code ?? 0);
});
