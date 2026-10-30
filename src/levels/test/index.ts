import type { DialogueScript } from '../../game/dialogue';
import { registerItems } from '../../game/items';
import { scatter } from '../../game/kit/scatter';
import { defineScene } from '../../game/scene';
import { bench, crate, doorway, streetLamp, wall, well } from './props';

registerItems({
  rusty_key: { name: 'Rusty key', description: 'A small iron key wrapped in a rag. It smells of damp earth.' },
});

const note: DialogueScript = {
  start: [{ if: { item: 'rusty_key' }, to: 'empty' }, { to: 'note' }],
  nodes: {
    note: {
      lines: [
        'A note is pinned to the crate. The ink has run in the damp.',
        '"The key is under the bench. Don\'t let them see you take it."',
      ],
      choices: [{ text: 'Look under the bench', next: 'take' }, { text: 'Leave it' }],
    },
    take: {
      lines: ['Wrapped in a rag under the bench: a small rusty key.'],
      effects: { give: 'rusty_key', set: 'test_key_found' },
    },
    empty: { lines: ['The note says nothing more.'] },
  },
};

/** Courtyard half size in meters. The yard runs from -HALF to +HALF on both axes. */
const HALF = 6;

/** Keeps trees off the courtyard and the path that leaves through the north doorway. */
const keepClear = (x: number, z: number) =>
  (Math.abs(x) < HALF + 1.2 && Math.abs(z) < HALF + 1.2) || (Math.abs(x) < 3.2 && z < -HALF);

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

/** Gentle bumps outside the courtyard, flat inside it and along the path. */
const terrainHeight = (x: number, z: number) => {
  const rise = clamp01((Math.max(Math.abs(x), Math.abs(z)) - HALF - 1) / 4);
  const offPath = z < -HALF ? clamp01((Math.abs(x) - 1.8) / 2) : 1;
  const bumps = 0.35 * Math.sin(x * 0.45) * Math.cos(z * 0.38) + 0.25 * Math.sin(z * 0.8 + x * 0.2);
  return -0.05 + rise * offPath * bumps;
};

/**
 * A walled stone courtyard in fog, for judging the PS1 look: a doorway to the north with a
 * path into spruce and bare trees, a street lamp, a well, and a locked door with a key to find.
 */
export const testScene = defineScene({
  id: 'test',
  spawns: {
    default: { x: 1.2, z: 4.5, yaw: 8 },
    outside: { x: 0, z: -12, yaw: 180 },
  },
  atmosphere: {
    day: {
      fog: { color: 0x9c9e9a, near: 1, far: 16, density: 0.08, wisps: 0.45 },
      ambient: 0x6e6e6a,
      sun: { color: 0x5a5a54, direction: [0.35, 1, 0.5] },
      saturation: 0.7,
    },
    night: {
      fog: { color: 0x07080a, near: 0.5, far: 13, density: 0.11, wisps: 0.3 },
      ambient: 0x15171c,
      sun: { color: 0x0e1118, direction: [-0.4, 1, 0.3] },
      saturation: 0.6,
    },
  },

  build(kit, ctx) {
    kit.ground('grass');
    kit.terrain({ w: 64, d: 64, cell: 2, height: terrainHeight }).texture('grass_dead', { tile: 4 }).walkable('grass');
    kit.plane({ w: HALF * 2, d: HALF * 2, cell: 0.75 }).texture('cobblestone', { tile: 2.2 }).walkable('stone');
    kit.plane({ w: 2.4, d: 26, cell: 1 }).texture('gravel_path', { tile: 2.5 }).at(0, 0, -HALF - 13).walkable('gravel');

    doorway(kit, -HALF, HALF, -HALF, 1.5);
    wall(kit, -HALF, -HALF, -HALF, HALF);
    wall(kit, HALF, -HALF, HALF, HALF);
    // The south wall has partly fallen.
    wall(kit, -HALF, HALF, -1, HALF, 1.4);
    wall(kit, -1, HALF, HALF, HALF, 0.9);

    kit
      .door({
        to: 'test',
        spawn: 'outside',
        w: 1.1,
        h: 2.1,
        locked: () => !ctx.state.hasItem('rusty_key'),
        lockedText: 'Locked. The keyhole is crusted with rust.',
      })
      .at(HALF - 0.29, 0, 2)
      .rotY(90);

    streetLamp(kit, -3.6, -3.4, ctx.state.time === 'night');
    well(kit, 2.6, -1.8);
    bench(kit, -4.6, 2.4, 90);
    crate(kit, 4.6, 4.4, 20);
    crate(kit, 4.9, 3.3, -8, 0.6);
    kit.hotspot({ prompt: 'Read the note', radius: 0.5, onInteract: () => ctx.dialogue(note) }).at(4.6, 0, 4.4);

    kit.trees('spruce', scatter({ x: 0, z: 0, w: 50, d: 50, count: 70, seed: 'test-spruce', spacing: 2.6, avoid: keepClear })).collider();
    kit.trees('bare', scatter({ x: 0, z: 0, w: 50, d: 50, count: 30, seed: 'test-bare', spacing: 3, avoid: keepClear })).collider();

    scatter({ x: 0, z: 0, w: 40, d: 40, count: 90, seed: 'test-weeds', spacing: 0.9, scale: [0.6, 1.1], avoid: keepClear }).forEach(
      (spot, i) => {
        const [texture, w, h] = i % 3 ? ['grass_tuft', 0.9, 0.6] : ['fern_dead', 1.1, 0.9];
        kit.sprite(texture, { w: w * spot.scale!, h: h * spot.scale! }).at(spot.x, -0.05, spot.z).onGround();
      },
    );

    kit.barrier({ w: 60, d: 1 }).at(0, 0, -25);
    kit.barrier({ w: 60, d: 1 }).at(0, 0, 25);
    kit.barrier({ w: 1, d: 60 }).at(-25, 0, 0);
    kit.barrier({ w: 1, d: 60 }).at(25, 0, 0);
    kit.exit({ w: 2.4, d: 1, to: 'test' }).at(0, 0, -24);

    kit.ambience('wind', { volume: ctx.state.time === 'night' ? 0.35 : 0.5 });
    if (ctx.state.time === 'night') {
      kit.ambience('drone', { volume: 0.25 });
      kit.ambience('crackle', { interval: 4 });
    } else {
      kit.ambience('crackle', { interval: 9, volume: 0.4 });
    }
  },
});
