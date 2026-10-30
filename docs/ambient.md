# Ambient detail

`src/game/ambient/` holds the helpers that make a scene feel lived in or abandoned: particles, swaying objects and foliage, flickering lights, small animals, and sound layers. Everything binds to the scene through the kit and stops when the scene unloads. Import from the index:

```ts
import { breathVapor, drizzle, dustMotes, fogWisps, hourBells, particles, weather, windInTrees, windSway } from '../../game/ambient';
import { fridgeHum, rain } from '../../game/ambient/sounds';
```

Keep it quiet. One or two moving things in view at a time, long gaps between sounds, nothing cheerful. Ambient detail should be easy to miss.

## Weather

`weather(ctx.state)` returns `{ drizzle, wind, breath }` for the current point in the story, so every scene agrees. Night 1 is dry and still. From night 2 on a drizzle falls, and night 3 adds wind. By day the wind rises a little each day. Outdoor scenes read it for rain, wind strength, and breath. Interiors read it for rain on the roof or the window.

## Particles

`particles(kit, spec)` adds one field of point sprites and returns a placed group, so `.at()` and groups work as for any kit object. The vertex shader works out each point's position from the clock, so a field is one draw call with no per-frame CPU cost. Points render at the 640x480 frame's pixel size, take fog and the shared lights (lamps and the torch), and snap to the PS1 vertex grid. Faint dots use a 4x4 stipple instead of blending.

| Preset | Use | Place |
|---|---|---|
| `fogWisps()` | Low mist drifting along the ground, in the fog's own color | Follows the camera |
| `fallingLeaves()` | Leaves coming down through trees by day | Follows the camera |
| `drizzle()` | Fine rain, visible mostly in the torch | Follows the camera |
| `dustMotes()` | Dust in a room, seen only where light falls | `.at()` the middle of a lit volume, or `{ follow: true, box: [6, 3, 6] }` for dust in the torch |
| `moths()` | Moths circling a lamp | `.at()` the bulb, or call `mothsAround(kit, at)` |
| `flies()` | Flies circling something left out | `fliesOver(kit, ctx, at)` adds the buzz too |

Each preset takes overrides: `particles(kit, drizzle({ count: 800 }))`. The spec fields are documented in `particles.ts`: `count`, `box`, `follow`, `offset`, `velocity`, `sway`, `speed`, `orbit`, `size`, `shape` (`soft`, `dot`, `streak`, `leaf`), `color`, `opacity`, `fogTint`, `floor`, `seed`.

`drips(kit, ctx, spots, every)` drops water from a ceiling or a branch at each spot and plays the drop landing at the right moment. Spots are world coordinates `{ x, z, top, bottom }`. Each spot is one draw call, so keep it to a handful.

`breathVapor(kit, ctx)` puffs the reporter's breath in front of the camera every few seconds. Use it outdoors when `weather(...).breath` holds.

## Movement

- `windSway(kit, strength)` makes every cut-out material in the scene move in the wind: tree cards, grass, undergrowth. Trunks and other solid meshes stay still. Call it once in `build`; it patches the materials after the build. Use `0.5 + weather.wind` outdoors.
- `sway(kit, placed, { degrees, speed, axis })` swings one object around its origin: a curtain, a hanging lamp, a sign on one nail. Kit boxes have their origin at the bottom, so build hanging things in a group placed at the hook and hanging down from it, and sway the group. Don't put swaying objects inside `kit.batch`, or chain `.dynamic()`.
- `animateLight(kit, light, mesh, level)` drives a `kit.light` and the emissive of the mesh that shows its source from a level function. `flameLevel` gives a candle's waver; `tubeLevel` gives a failing fluorescent tube.
- `fluorescentTube(kit, ctx, light, tube, at)` is a failing tube with its hum and the tick of the starter each time it drops out.

## Life

- `crows(kit, ctx, perches)` puts crows on branches, posts, or wall tops. They call now and then and lift off, flapping, when the reporter comes within 5 m. Use them by day only.
- `cat(kit, ctx, { x, y, z, yaw })` is a grey cat sitting on a sill or a chair. It breathes, flicks its tail, turns its head to watch the reporter, and purrs when they stand close.
- `fliesOver` and `mothsAround` are listed under particles.
- `miceInTheWalls(kit, ctx, spots)` scratches inside a wall at one of the spots every so often.
- `distantDog(kit, ctx, every)` barks a few times far off.
- `distantTraffic(kit, ctx, road, every)` sends a car or a tractor along a road the player never sees. `road` is two far points; the panner glides on the audio clock.

## Wildlife

`wildlife(kit, ctx, habitat)` in `wildlife.ts` is every animal around an outdoor scene. `habitat` is `'village'`, `'field'`, `'cemetery'`, or `'forest'`; the forest has the most.

- Real calls from `recordings.ts`, each on its own random clock and from its own distance: crows, ravens, and a buzzard high up by day; tawny owls, a fox's scream, and a roe deer's bark at night.
- Outside the village, something on four legs now and then crosses nearby through the undergrowth. Half the time it stops when it is closest, waits a few seconds, snaps a twig, and bolts.
- In the forest and the cemetery, a bird or two takes off from a branch.
- At night the whole place sometimes falls silent for half a minute or more. The silence ends with a twig snapping close behind.

`animalCall(audio, animal, { at, volume, bus })` plays one call: a random take at a slightly different pitch each time. The files are trimmed takes in `public/assets/audio/wild/`; the source recordings and their licenses are in `docs/credits.md`.

## Startles

`startle(id, kind, zone, from)` in `src/game/scares/startles.ts` is a scare beat for a scare director. The first time the player walks into `zone`, something goes off at `from`: `'crows'` or `'pigeons'` bursting out of a tree or a roof, an `'owl'` screeching overhead, a `'deer'` crashing away through the undergrowth, or `'rats'` scattering. Each fires once per game. Put `from` in the tree, the rafters, or the bush the noise belongs to, close to the path, so the scare has a cause the player can see.

## Sound layers

`loop(kit, () => handle)` starts a looping sound and stops it with the scene. Scene-level layers:

- `windInTrees(kit, ctx, strength)` is the shared wind, the leaves' hiss over it, and at higher strengths a trunk groaning somewhere close.
- `hourBells(kit, ctx, toward)` rings the church bell on the hour from far off, 120 m in the direction of the village. Play time is compressed as in the church clock: an hour every five minutes, the first one 40 s after arrival. Use it in every outdoor scene.

Sounds in `sounds.ts`, all synthesized:

| Sound | Kind |
|---|---|
| `rain(audio, { at?, surface: 'glass' \| 'tin' \| 'leaves' })` | Loop |
| `fridgeHum(audio, at, { wall? })` | Loop, switches itself on and off |
| `leafRustle(audio, strength)` | Loop |
| `flyBuzz(audio, at)` | Loop |
| `tubeHum(audio, at)` | Loop |
| `waterDrop(audio, at)` | One-shot |
| `trunkCreak(audio, at)` | One-shot |
| `mouseScratch(audio, at)` | One-shot |
| `tubeTick(audio, at)` | One-shot |
| `passingEngine(audio, from, to, { kind })` | One-shot that moves |
| `distantBell(audio, at, strokes)` | One-shot |
| `wingFlaps(audio, at, birds)` | One-shot |
| `ratsScatter(audio, at)` | One-shot |

`nowAndThen(kit, ctx, mean, work)` runs `work` at random, on average every `mean` seconds, never while a dialogue or menu is open. `around(ctx, distance, y)` gives a random point at that distance from the player.

Interior sounds already in `src/levels/inn/sounds.ts` work in any scene: `clockTick`, `radio`, `tvMurmur`, `radiatorKnock`, `houseCreak`, `roomTone`, `cutlery`. Play them through a wall by placing them behind it with a low volume.

## Cost

Measure with `node tools/package/perf.mjs --gpu`. A particle field is one draw call. Crows and the cat are small groups of boxes, a few draw calls each. Build clutter inside `kit.batch` so a shelf of tins merges into a few draw calls; keep anything that moves outside it.

## Second pass

Pass B adds the same layers to the village, cemetery, church, farms, inn, Gremaud house, and fort interior. A few sounds there have local copies that can move to these helpers: `caw` and `flap` in `cemetery/sounds.ts` (use `crows` and `caw` here), `nowAndThen` in `village_square/atmosphere.ts`, and `drip` in `bunker_interior/drips.ts` (use `waterDrop`).
