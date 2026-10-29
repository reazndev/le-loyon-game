// Renders one frame of a scene in headless Chromium and saves it as a PNG.
// Usage: npm run shot -- --scene <id> --out <file.png> [--time day|night] [--pos x,y,z] [--yaw deg]
//        [--flags a,b] [--frames 90] [--size 640x480]
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { launchBrowser, openGame } from './browser.mjs';
import { startDevServer } from './devServer.mjs';

const { values } = parseArgs({
  options: {
    scene: { type: 'string', default: 'test' },
    out: { type: 'string' },
    time: { type: 'string' },
    pos: { type: 'string' },
    yaw: { type: 'string' },
    flags: { type: 'string' },
    frames: { type: 'string', default: '90' },
    size: { type: 'string', default: '640x480' },
  },
});

if (!values.out) {
  console.error('Missing --out <file.png>');
  process.exit(1);
}

const query = new URLSearchParams({ scene: values.scene });
for (const key of ['time', 'pos', 'yaw', 'flags']) if (values[key]) query.set(key, values[key]);
const [width, height] = values.size.split('x').map(Number);

const { server, url } = await startDevServer();
const browser = await launchBrowser();

try {
  const { page, errors } = await openGame(browser, url, query, { width, height });
  await page.evaluate((frames) => window.__game.waitFrames(frames), Number(values.frames));
  const out = resolve(values.out);
  mkdirSync(dirname(out), { recursive: true });
  await page.locator('#frame').screenshot({ path: out });
  if (errors.length) console.warn(`Page errors:\n${errors.join('\n')}`);
  console.log(`Saved ${out}`);
} finally {
  await browser.close();
  await server.close();
}
