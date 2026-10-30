import { launchBrowser, openGame } from './browser.mjs';
import { startDevServer } from './devServer.mjs';
const { server, url } = await startDevServer();
const browser = await launchBrowser();
const [, , tag] = process.argv;
const views = [
  ['forest', 'scene=forest_path&time=night&night=1&pos=0,0,62&yaw=0'],
  ['cemetery', 'scene=cemetery&time=night&night=1&flags=met_raymond'],
  ['square', 'scene=village_square&time=night&night=1'],
];
try {
  for (const [name, query] of views) {
    const { page } = await openGame(browser, url, query, { width: 640, height: 480 });
    await page.evaluate(() => { window.__game.game.world.lights.flashlightOn = true; });
    await page.evaluate(() => window.__game.waitFrames(120));
    await page.locator('#frame').screenshot({ path: `/tmp/leyon-loyon/fog-${tag}-${name}.png` });
    console.log(name, await page.evaluate(() => JSON.stringify({ on: window.__game.game.world.lights.flashlightOn, modal: window.__game.modal() })));
    await page.close();
  }
} finally { await browser.close(); await server.close(); }
