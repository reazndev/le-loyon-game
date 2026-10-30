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

`breathVapor(kit, ctx)` puffs the reporter's breath in front of the camera every few seconds. Use it outdoors when `weather(...).breath` holds. It also marks the scene as cold, which lets the reporter shiver and sniff now and then. Running for more than about five seconds winds them anywhere; `src/game/breathing.ts` has the timing.

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
- The treeline moves (`treeline.ts`). Gusts run through, the leaves rushing from one side to the other while the foliage leans harder; something pushes through the bushes off to one side of where the player looks, sometimes moving on a few meters; and when it is tense, a dark four-legged shape darts between the trunks at the edge of the fog (not in the village). It is calm by day, busier at night, and busiest for a minute and a half after any scare beat fires (`world.lastScareAt`) and while the animals have gone quiet.

`rustle(audio, 'bush' | 'leaves', { at, volume })` plays one rustle from the undergrowth. `animalCall(audio, animal, { at, volume, bus })` plays one call: a random take at a slightly different pitch each time. The files are trimmed takes in `public/assets/audio/wild/`; the source recordings and their licenses are in `docs/credits.md`.

## Villagers

`src/game/village/` holds the people of Leurs who are not in the script, and the signs that the houses are lived in.

`walker(kit, { look, route, ... })` in `walker.ts` is someone going about their day in the background. `look` is a key of `folk` in `folk.ts`: `shopper`, `farmer`, `smoker`, `sweeper`, `cyclist`, `neighbour`, `childA`, `childB`, and `late`. The walker builds a villager with `buildHuman` and walks the route with the `Character` walk cycle, from the first stop to the last. It then waits `rest` seconds out of sight and walks the route back the other way. A stop with `door: true` is a house door: the walker comes out of it or goes in, and the door is heard shutting. Put the other route ends in the fog. A walker appears and vanishes only when the player is more than 16 m away, and walks on past the end until then. No one can be talked to.

- Walkers stop when the player is in their way, step round them after a second or so, and turn their heads to the stranger within 5 m. A rider rings the bell instead.
- Footsteps come from the ground under each step, heard within 18 m.
- Options: `inHand` (a bag or a broom), `inFront` (a barrow), `rides` (a bicycle; the walker sits and coasts), `leadsCow` (a cow on a rope with its bell), `activity` at stops (`'sweep'` swings the broom and scrapes, `'smoke'` raises the cigarette and lights the ember), `stares` (faces the player through every stop), `once`, `stepSound`, and `tread`.

`houses.ts` has `chimneySmoke(kit, { x, z, top }, wind, seed)`, a chimney stack with one particle field of smoke leaning off with the wind. It also has `windowLife(kit, ctx, panes, 'dusk' | 'bedtime')`. At dusk half the lit panes start dark and come on one by one, and later someone goes from room to room. At bedtime the panes go out one by one and stay out. `outlyingHouses` in the square returns its lit panes for this. `sounds.ts` has the synthesized sounds the walkers make: `broomStroke`, `bicycleBell`, `freewheel`, and `barrowSqueak`.

`passingCars(kit, ctx, { road, every, yieldTo })` in `src/levels/village_square/traffic.ts` sends a Fiat with its headlights on along a road, keeping to the right. It starts and ends 30 m past the road's ends. It brakes and waits for the player or anyone in `yieldTo` standing in the road ahead.

The square uses all of this in `village_square/people.ts`, and fewer people come out each day. At night the lights go out, a car comes by rarely, and on nights 1 and 2 one late figure may come down the church lane. It stops under the lamp to look at the reporter and goes into the house with the television. Keep it to a handful of walkers per scene: each villager is a few dozen small meshes, and only those in the street are drawn.

## Startles

`startle(id, kind, zone, from)` in `src/game/scares/startles.ts` is a scare beat for a scare director. The first time the player walks into `zone`, something goes off at `from`, seen as well as heard: `'crows'` or `'pigeons'` bursting out of a tree or a roof, an `'owl'` swooping low over the player's head, a `'deer'`, `'fox'`, or `'hare'` bolting away, `'rats'` running along the floor, or just a `'crack'` (a branch) or `'creak'` (floorboards). Each fires once per game. Put `from` in the tree, the rafters, or the bush the noise belongs to, close to the path, so the scare has a cause the player can see. Loud kinds closer than 7 m also flash and shake the frame.

The animals come from one hidden pool per scene, `critters(ctx)` in `src/game/ambient/critters.ts`.

`suddenLife(kit, ctx, setting)` in `src/game/ambient/suddenLife.ts` sets the same startles off at random near the player: about every minute in the forest at night, half as often by day, and at least 20 s apart. `wildlife()` calls it for every outdoor scene. Interiors call it with `'indoors'` for rats and creaking boards. The table of what lives where and how often is at the top of the file.

## Close calls

These make the player think it is him for a moment. Each one is something ordinary.

- `eyesInBeam(kit, ctx, { every })` in `eyes.ts`: at night, about once a minute, a pair of small eyes shines 10 to 20 m off inside the torch beam, at a deer's, a fox's, or a hare's height. They stay lit for one to three seconds while the beam is on them. Then they go out, or the animal bolts from the spot. They never show with the torch off. `suddenLife` calls it for every outdoor setting but the village.
- `touches(kit, ctx, every)` in `touches.ts`: a branch brushes the reporter's face now and then while they walk. `suddenLife` calls it in the forest, about every 90 s.
- `ctx.brush('branch' | 'web')`: a dark twig sweeps across part of the frame with a leaf rustle and a small knock, or pale cobweb threads cover the view and fade over two seconds. A beat can do it with `{ brush: 'web' }`.
- `ctx.torchOut(seconds)`: the torch stutters, dies for `seconds`, and stutters back on, the same way its loose contact fails at random. Nothing happens if it is off. A beat can do it with `{ torch: 3 }`.
- `ctx.blink(hold)`: with `hold`, the eyes close slowly, stay shut that many seconds, and open again. Without it, a normal blink.
- `decoy(kit, kind, { x, z, yaw })` in `src/game/scares/decoys.ts` builds a prop that reads as a man standing in the fog: `'scarecrow'`, `'coat_on_post'`, `'snagged_cape'` (camo cloth on a dead branch, stirring a little), or `'hunters_stand'` (a raised hide with a dark shape in it). It stays put. `decoySighting(id, kind, at, zone)` is its beat: the first time the player looks at it from within 25 m, the ambience drops out for a few seconds and a low swell (`sfx_sting_low`) plays. Nothing else happens. Give `at.y` where the ground is not at 0.
- `lookBack(kit, ctx, { at, change, if, away })` in `src/game/scares/lookBack.ts`: once the player has seen `at`, `change` runs the first time `at` has been out of view for `away` seconds (default 2). Use it to turn a chair, leave a door ajar, or switch a television on. `if` holds it back until a condition is true.

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
