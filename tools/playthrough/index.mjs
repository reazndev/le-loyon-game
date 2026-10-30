// Plays the critical path of each ending, and the caught failure, in headless Chromium.
// Usage: npm run playthrough [-- <run> ...] [--from <stage>] [--to <stage>]
// Runs: publish, secret, leave, caught. Default: all four. See docs/playthrough.md.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { launchBrowser, openGame } from '../browser.mjs';
import { startDevServer } from '../devServer.mjs';
import { runs } from './runs.mjs';
import { Session } from './session.mjs';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { from: { type: 'string' }, to: { type: 'string' } },
});
const chosen = positionals.length ? positionals : Object.keys(runs);
const unknown = chosen.filter((name) => !runs[name]);
if (unknown.length) {
  console.error(`Unknown run: ${unknown.join(', ')}. Runs: ${Object.keys(runs).join(', ')}`);
  process.exit(1);
}

/** The state after each stage, so `--from` can start a run part way through. */
const CHECKPOINTS = join(tmpdir(), 'le-loyon-playthrough');
mkdirSync(CHECKPOINTS, { recursive: true });
const checkpoint = (stage) => join(CHECKPOINTS, `${stage}.json`);

const { server, url } = await startDevServer();
const browser = await launchBrowser();
const results = [];

try {
  for (const name of chosen) results.push(await play(name, runs[name]));
} finally {
  await browser.close();
  await server.close();
}

console.log('\nResults');
results.forEach((r) => console.log(`  ${r.ok ? 'PASS' : 'FAIL'}  ${r.name}  ${r.seconds}s${r.ok ? '' : `  at ${r.stage}: ${r.error}`}`));
process.exit(results.every((r) => r.ok) ? 0 : 1);

async function play(name, stages) {
  const started = Date.now();
  const first = values.from ? stages.findIndex((stage) => stage.name === values.from) : 0;
  const last = values.to ? stages.findIndex((stage) => stage.name === values.to) : stages.length - 1;
  if (first < 0 || last < 0) return { name, ok: false, stage: values.from ?? values.to, error: 'no such stage in this run', seconds: 0 };
  console.log(`\n${name}`);
  const { page, errors } = await openGame(browser, url, first === 0 ? '' : 'scene=test');
  const session = new Session(page, errors, (line) => console.log(line));
  if (first > 0) await restore(session, stages[first - 1].name);
  let stage = stages[first];
  try {
    for (stage of stages.slice(first, last + 1)) {
      const t = Date.now();
      await stage.play(session);
      if (stage.flags) await session.expectFlags(...stage.flags);
      if (stage.items) await session.expectItems(...stage.items);
      if (stage.counts) await session.expectCounts(stage.counts);
      if (stage.shot) await session.shot(stage.shot);
      const pose = await session.eval(() => window.__game.pose());
      writeFileSync(checkpoint(stage.name), JSON.stringify({ ...(await session.state()), player: pose }));
      console.log(`  ok  ${stage.name} (${((Date.now() - t) / 1000).toFixed(0)}s)`);
    }
    if (errors.length) throw new Error(`Page errors:\n${errors.join('\n')}`);
    return { name, ok: true, seconds: Math.round((Date.now() - started) / 1000) };
  } catch (error) {
    await page.locator('#frame').screenshot({ path: join(CHECKPOINTS, `failed-${name}.png`) }).catch(() => undefined);
    const state = await session.state().catch(() => null);
    if (state) writeFileSync(join(CHECKPOINTS, `failed-${name}.json`), JSON.stringify({ ...state, pose: await session.eval(() => window.__game.pose()) }, null, 1));
    console.log(`  FAIL ${stage.name}: ${error.message}\n  (frame saved to ${join(CHECKPOINTS, `failed-${name}.png`)})`);
    return { name, ok: false, stage: stage.name, error: error.message.split('\n')[0], seconds: Math.round((Date.now() - started) / 1000) };
  } finally {
    await page.close();
  }
}

/** Loads the state a stage ended with, from an earlier run of this script. */
async function restore(session, stage) {
  const snapshot = JSON.parse(readFileSync(checkpoint(stage), 'utf8'));
  await session.eval(async (snap) => {
    window.__game.game.state.restore(snap);
    await window.__game.loadScene(snap.scene, snap.player);
  }, snapshot);
  await session.inScene(snapshot.scene);
  console.log(`  from the end of ${stage}`);
}
