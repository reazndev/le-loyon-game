// Lists the enabled hotspots and characters of scenes, for writing playthrough stages.
// Usage: node tools/playthrough/peek.mjs "<query>" ["<query>" ...]
import { launchBrowser, openGame } from '../browser.mjs';
import { startDevServer } from '../devServer.mjs';

const { server, url } = await startDevServer();
const browser = await launchBrowser();
try {
  for (const query of process.argv.slice(2)) {
    const { page, errors } = await openGame(browser, url, query);
    await page.evaluate(() => window.__game.waitFrames(30));
    const report = await page.evaluate(() => ({
      pose: window.__game.pose(),
      hotspots: window.__game.hotspots().map((h) => `${h.prompt} @ ${h.x.toFixed(1)},${h.z.toFixed(1)}`),
      cast: window.__game.characters().map((c) => `${c.id}${c.visible ? '' : ' (hidden)'} @ ${c.x.toFixed(1)},${c.z.toFixed(1)}`),
    }));
    console.log(`\n== ${query}\npose ${JSON.stringify(report.pose)}\n${report.hotspots.join('\n')}\ncast: ${report.cast.join('; ')}`);
    if (errors.length) console.warn(errors.join('\n'));
    await page.close();
  }
} finally {
  await browser.close();
  await server.close();
}
