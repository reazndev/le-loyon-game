// Measures the heaviest views before a release: draw calls, triangles, CPU time per frame, JS
// allocations per frame, and with --gpu the GPU time per frame from a timer query.
// Without --gpu it runs on SwiftShader, where the frame interval is a software-rendering worst
// case. With --gpu it runs on the machine's GPU through ANGLE on EGL, which needs Mesa or a
// vendor driver with EXT_disjoint_timer_query_webgl2.
// Usage: node tools/package/perf.mjs [--gpu] [--frames 240] [--only village_square]
// Run it in a checkout nobody is editing: the dev server reloads the page when files change.
import { chromium } from 'playwright';
import { parseArgs } from 'node:util';
import { launchBrowser, openGame } from '../browser.mjs';
import { startDevServer } from '../devServer.mjs';

const { values } = parseArgs({
  options: {
    frames: { type: 'string', default: '180' },
    only: { type: 'string' },
    gpu: { type: 'boolean', default: false },
  },
});

// One view per scene that shows the most at once, by day and by night.
const views = [
  { scene: 'village_square', pos: '0,0,9', yaw: 0 },
  { scene: 'forest_path', pos: '0,0,72.5', yaw: 0 },
  { scene: 'cemetery' },
  { scene: 'bunker_interior', pos: '9.6,0,-25', yaw: 90, label: 'bunker_interior (mask heap)' },
  { scene: 'bunker_interior', pos: '0,0,-21', yaw: -120, label: 'bunker_interior (corridor, heap behind the wall)' },
  { scene: 'yerly_farm' },
  { scene: 'forest_deep' },
  { scene: 'bunker_exterior' },
  { scene: 'bunker_hidden' },
  { scene: 'home' },
  { scene: 'laiterie' },
  { scene: 'garage_dousse' },
  { scene: 'house_gremaud_kitchen' },
].filter((view) => !values.only || view.scene === values.only);

const frames = Number(values.frames);
const { server, url } = await startDevServer();
const browser = values.gpu
  ? await chromium.launch({ channel: 'chromium', args: ['--use-angle=gl-egl', '--ignore-gpu-blocklist', '--enable-gpu'] })
  : await launchBrowser();

try {
  const rows = [];
  for (const view of views) {
    for (const time of ['day', 'night']) {
      const query = new URLSearchParams({ scene: view.scene, time });
      if (view.pos) query.set('pos', view.pos);
      if (view.yaw !== undefined) query.set('yaw', String(view.yaw));
      const name = `${view.label ?? view.scene} ${time}`;
      try {
        const { page, errors } = await openGame(browser, url, query);
        rows.push({ view: name, ...(await measure(page)) });
        if (errors.length) console.warn(`${name} page errors:\n${errors.join('\n')}`);
        await page.close();
      } catch (error) {
        // A scene that fails to load should not hide the numbers for the others.
        rows.push({ view: name, error: error.message.split('\n')[0] });
      }
    }
  }
  console.table(rows);
} finally {
  await browser.close();
  await server.close();
}

async function measure(page) {
  const cdp = await page.context().newCDPSession(page);
  // Settle shader compiles and texture uploads before measuring.
  await page.evaluate(() => window.__game.waitFrames(30));
  await cdp.send('HeapProfiler.enable');
  await cdp.send('HeapProfiler.collectGarbage');
  await cdp.send('HeapProfiler.startSampling', {
    samplingInterval: 512,
    includeObjectsCollectedByMajorGC: true,
    includeObjectsCollectedByMinorGC: true,
  });
  const timing = await page.evaluate(async (count) => {
    const game = window.__game.game;
    // The loop reads `game.tick` each frame, so wrapping it times every frame from here on.
    const gl = game.renderer.renderer.getContext();
    const timer = gl.getExtension('EXT_disjoint_timer_query_webgl2');
    const tick = game.tick;
    const ticks = [];
    const queries = [];
    game.tick = (now) => {
      const query = timer && gl.createQuery();
      if (query) gl.beginQuery(timer.TIME_ELAPSED_EXT, query);
      const start = performance.now();
      tick(now);
      ticks.push(performance.now() - start);
      if (query) {
        gl.endQuery(timer.TIME_ELAPSED_EXT);
        queries.push(query);
      }
    };
    const begin = performance.now();
    await window.__game.waitFrames(count);
    const wall = performance.now() - begin;
    game.tick = tick;
    // Query results arrive a few frames late.
    await window.__game.waitFrames(5);
    const gpu = queries
      .filter((query) => gl.getQueryParameter(query, gl.QUERY_RESULT_AVAILABLE))
      .map((query) => gl.getQueryParameter(query, gl.QUERY_RESULT) / 1e6)
      .sort((a, b) => a - b);
    const mean = (list) => list.reduce((sum, t) => sum + t, 0) / list.length;
    const p95 = (list) => list[Math.floor(list.length * 0.95)];
    ticks.sort((a, b) => a - b);
    return {
      cpuMs: mean(ticks),
      cpuP95Ms: p95(ticks),
      gpuMs: gpu.length ? mean(gpu) : NaN,
      gpuP95Ms: gpu.length ? p95(gpu) : NaN,
      frameMs: wall / count,
      ...game.renderer.stats,
    };
  }, frames);
  const { profile } = await cdp.send('HeapProfiler.stopSampling');
  await cdp.detach();
  return {
    calls: timing.calls,
    triangles: timing.triangles,
    programs: timing.programs,
    textures: timing.textures,
    'cpu ms': timing.cpuMs.toFixed(2),
    'cpu p95': timing.cpuP95Ms.toFixed(2),
    'gpu ms': timing.gpuMs.toFixed(2),
    'gpu p95': timing.gpuP95Ms.toFixed(2),
    'frame ms': timing.frameMs.toFixed(1),
    'alloc KB/frame': (allocated(profile.head) / 1024 / frames).toFixed(1),
    'top allocators': topAllocators(profile.head, 3),
  };
}

function allocated(node) {
  return node.selfSize + node.children.reduce((sum, child) => sum + allocated(child), 0);
}

/** The functions that allocated the most, named with their file and line. */
function topAllocators(root, count) {
  const bySite = new Map();
  const walk = (node) => {
    const { functionName, url, lineNumber } = node.callFrame;
    const site = `${functionName || '(anon)'}@${url.split('/').pop()?.split('?')[0]}:${lineNumber + 1}`;
    bySite.set(site, (bySite.get(site) ?? 0) + node.selfSize);
    node.children.forEach(walk);
  };
  walk(root);
  return [...bySite.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([site, bytes]) => `${site} ${(bytes / 1024 / frames).toFixed(1)}K`)
    .join(', ');
}
