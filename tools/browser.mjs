import { chromium } from 'playwright';

/**
 * Launches headless Chromium with software WebGL. SwiftShader gives a working WebGL2 context
 * on machines without a usable GPU, such as CI runners and headless servers.
 */
export function launchBrowser() {
  return chromium.launch({
    channel: 'chromium',
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  });
}

/** Opens the game at a query string and waits until the first scene has faded in. */
export async function openGame(browser, url, query, viewport = { width: 640, height: 480 }) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    // Missing textures fall back to procedural ones, so their 404s are expected.
    if (message.type() === 'error' && !message.text().includes('404')) errors.push(message.text());
  });
  await page.goto(`${url}?${query}`);
  await page.waitForFunction(() => window.__game?.ready === true, null, { timeout: 60_000 });
  return { page, errors };
}
