// Starts a packaged build with no display, waits for the title screen, saves a screenshot,
// and quits through the title menu. ELECTRON_RUN_AS_NODE is set on purpose: the packaged app
// has to ignore it, because the editors and terminals people launch it from often export it.
// Usage: node tools/package/launch-check.mjs [path to the AppImage or le-loyon binary]
import assert from 'node:assert/strict';
import { mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { _electron as electron } from 'playwright';

const executablePath = resolve(process.argv[2] ?? join('release', readdirSync('release').find((file) => file.endsWith('.AppImage')) ?? ''));
const step = (name) => console.log(`- ${name}`);
// A fresh profile, so earlier saves and settings on this machine don't change what we see.
const profile = mkdtempSync(join(tmpdir(), 'loyon-launch-'));

step(`launching ${executablePath}`);
const app = await electron.launch({
  executablePath,
  // Chromium's headless Ozone backend needs no X server or Wayland compositor. Its screen is
  // 1920x1080, a common desktop, so the window should open at 1280x960.
  args: ['--ozone-platform=headless', '--ozone-override-screen-size=1920,1080'],
  env: { ...process.env, ELECTRON_RUN_AS_NODE: '1', XDG_CONFIG_HOME: profile, APPDATA: profile },
  timeout: 60_000,
});

try {
  const errors = [];
  const window = await app.firstWindow();
  window.on('pageerror', (error) => errors.push(error.message));
  window.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('404')) errors.push(message.text());
  });

  step('the title screen loads');
  await window.waitForFunction(() => window.__game?.ready === true, null, { timeout: 60_000 });
  await window.evaluate(() => window.__game.waitFrames(60));
  const shot = resolve('release', 'launch-check.png');
  await window.screenshot({ path: shot });
  console.log(`  saved ${shot}`);

  step('the window has no menu bar and a 4:3 content area');
  const frame = await app.evaluate(({ BrowserWindow, Menu }) => ({
    menu: Menu.getApplicationMenu(),
    size: BrowserWindow.getAllWindows()[0].getContentSize(),
    fullscreenable: BrowserWindow.getAllWindows()[0].isFullScreenable(),
  }));
  console.log(`  content size ${frame.size.join('x')}`);
  assert.equal(frame.menu, null);
  assert.deepEqual(frame.size, [1280, 960]);
  assert.equal(frame.fullscreenable, true);

  step('Quit on the title menu closes the app');
  const exited = new Promise((done) => app.process().once('exit', done));
  // The page goes away mid-call when the app quits, so the call itself is expected to fail.
  window
    .evaluate(async () => {
      await window.__game.press('up');
      await window.__game.press('interact');
    })
    .catch(() => undefined);
  await Promise.race([exited, new Promise((_, fail) => setTimeout(() => fail(new Error('the app did not quit')), 10_000))]);

  assert.deepEqual(errors, []);
  console.log('Launch check passed');
} catch (error) {
  await app.close();
  throw error;
} finally {
  rmSync(profile, { recursive: true, force: true });
}
