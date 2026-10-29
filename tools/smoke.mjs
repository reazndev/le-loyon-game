// Plays through the test scene with scripted input and checks each system responds.
// Usage: npm run smoke
import assert from 'node:assert/strict';
import { launchBrowser, openGame } from './browser.mjs';
import { startDevServer } from './devServer.mjs';

const { server, url } = await startDevServer();
const browser = await launchBrowser();

const step = (name) => console.log(`- ${name}`);

try {
  const { page, errors } = await openGame(browser, url, 'scene=test&pos=4.6,0,3.3&yaw=180');
  const game = (fn, arg) => page.evaluate(fn, arg);
  const press = (action) => game((a) => window.__game.press(a), action);

  step('facing the crate shows its prompt');
  assert.equal(await game(() => window.__game.prompt()), 'Read the note');

  step('the note dialogue runs to its choice and gives the key');
  await press('interact');
  for (let i = 0; i < 12; i++) {
    const current = await game(() => window.__game.dialogue());
    if (current?.kind === 'choice') break;
    await press('interact');
  }
  assert.deepEqual((await game(() => window.__game.dialogue())).choices, ['Look under the bench', 'Leave it']);
  await game(() => window.__game.waitFrames(40));
  await press('interact');
  for (let i = 0; i < 6 && (await game(() => window.__game.dialogue())); i++) await press('interact');
  assert.equal(await game(() => window.__game.dialogue()), null);
  assert.deepEqual((await game(() => window.__game.state())).inventory, ['rusty_key']);

  step('walking forward moves the player and collision stops them at the wall');
  await game(() => window.__game.teleport(2, 0, 0, 0));
  await game(() => {
    window.__game.game.input.simulate('up', true);
    return window.__game.waitFrames(400);
  });
  await game(() => window.__game.game.input.simulate('up', false));
  const pose = await game(() => window.__game.pose());
  // The north wall's inner face is at z = -5.75 and the player's radius is 0.3.
  assert.ok(Math.abs(pose.z + 5.45) < 0.05, `expected to stop at the wall, z = ${pose.z}`);

  step('the unlocked door changes scene to the outside spawn');
  await game(() => window.__game.teleport(5.0, 0, 2, -90));
  await game(() => window.__game.waitFrames(2));
  assert.equal(await game(() => window.__game.prompt()), 'Open the door');
  await press('interact');
  await page.waitForFunction(() => {
    const p = window.__game.pose();
    return Math.abs(p.z + 12) < 0.5 && !window.__game.game.scenes.busy;
  });

  step('pause and inventory open and close');
  await press('pause');
  assert.equal(await game(() => window.__game.game.ui.open), true);
  await press('cancel');
  assert.equal(await game(() => window.__game.game.ui.open), false);
  await press('inventory');
  assert.equal(await game(() => window.__game.game.ui.open), true);
  await press('inventory');

  step('save and load restore the pose and inventory');
  await game(() => window.__game.game.save());
  await game(() => window.__game.teleport(0, 0, 3, 0));
  await game(() => window.__game.game.load());
  const loaded = await game(() => window.__game.pose());
  assert.ok(Math.abs(loaded.z + 12) < 0.5, `expected the saved pose, z = ${loaded.z}`);

  step('night switches the flashlight on');
  await game(() => window.__game.setTime('night'));
  assert.equal(await game(() => window.__game.game.world.lights.flashlightOn), true);

  assert.deepEqual(errors, []);
  console.log('Smoke test passed');
} finally {
  await browser.close();
  await server.close();
}
