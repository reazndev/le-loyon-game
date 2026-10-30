# Characters, scares, and the patrol

How levels place the cast, stage the beats in [script/07-scares.md](script/07-scares.md), and set up Raymond's round from [script/04-cemetery.md](script/04-cemetery.md). The test scene `characters_test` shows all of it.

![The cast in the test field](screenshots/characters-lineup-day.png)

![Le Loyon at night, 10 m away](screenshots/characters-marc-night.png) ![Raymond and Bari on the round](screenshots/characters-patrol-night.png)

## Code layout

| Path | Contents |
|---|---|
| `src/engine/characters/` | Models built from boxes, pose curves, the `Character` runtime that walks and looks, animal sounds |
| `src/game/kit/npc.ts` | `kit.npc(id)`, the level builder for a cast member |
| `src/game/scares/` | Beat data, the scare director, figures, random events, the sound palette |
| `src/game/patrol/` | The watchman's round, torch beam, and detection rules |
| `src/levels/characters_test/` | The test scene |

## Placing characters

`kit.npc(id)` adds a cast member and returns a builder. Ids are the cast ids from [script/00-overview.md](script/00-overview.md): `overney`, `monique`, `yannick`, `bernard`, `gilles`, `christine`, `odile`, `raymond`, `driver`, plus `marc` (Le Loyon, always masked), `bari`, and `marquise`.

```ts
kit.npc('overney').at(2, 0, -4).faceYaw(180).watch(4).talk('overney');
kit.npc('bernard').at(-3, 0, 1).talk('bernard_shovel_ask', 'Ask about the shovel');
kit.npc('gilles').at(6, 0, 2).walk([{ x: 6, z: -4, wait: 3 }, { x: 6, z: 2, wait: 5 }], { loop: true });
const marquise = kit.npc('marquise').at(30, 0, -12).faceYaw(90);
```

| Method | Effect |
|---|---|
| `.at(x, y, z)`, `.faceYaw(deg)` | Place and turn. Characters stand on the ground under them; `y` only matters on raised floors. Yaw follows the level convention: 0 faces -Z. |
| `.talk(dialogue, prompt = 'Talk')` | Interact plays a dialogue. Pass a node id (`raymond_night1`), a cast id for the person's entry table (`monique`), or a `DialogueScript`. The character turns to the player while it runs. |
| `.watch(radius = 4)` | The head follows the player while they are within `radius` meters. |
| `.walk(points, { loop?, speed? })` | Walks the waypoints. A point with `wait` stands there for that many seconds. |
| `.followPlayer(distance = 2.5)` | Follows the player, as Marquise does on the way home. |
| `.sit(height = 0)` | Already seated when the scene opens, on a seat `height` meters above the ground under the character. Use about 0.48 for a kitchen chair, or 0 when the character stands on the seat itself, such as Marc on his walkable bed. |
| `.character` | The live `Character`, for scripted moves in triggers and `update`. |

Place NPCs at the top level of the kit, not inside `kit.group`, because they walk in world coordinates.

`.character` has `walk(points)` and `walkTo(x, z)`, which return a promise that resolves at the end, plus `follow(target, distance)`, `stop()`, `face(yawOrPoint)`, `lookAt` (a `Vector3` the head turns to, or `null`), `position`, `yaw`, and `events.on('step' | 'arrive', ...)`. `sit(height, { instantly? })` sits down where the character is over about a second, `stand()` gets up, and `sitting` tells which. Walking stands a seated character up first, as Yannick does when he leaves the garage bench on day 3. A seated character turns only the head toward the player during a talk, never the body.

```ts
// Marc after the monologue: he walks to the bed and sits on its edge.
await marc.character.walk([{ x: 2.8, z: 0.15 }, { x: 4, z: 1.35 }]);
marc.character.sit(0);
```

```ts
kit.trigger({ r: 2 }).at(0, 0, -6).once().onEnter(async () => {
  const bus = driver.character;
  await bus.walkTo(3, -2);
  bus.face(ctx.player.position);
});
```

Bari's collar bell rings on his steps and Marquise's cowbell on hers. Both stay silent while the animal stands still.

### How they look and move

- Humans are 550 to 680 triangles: tapered boxes for limbs and the body, and a ten-sided head shaped at the chin, jaw, and brow, with a nose, ears, a six-sided neck, and hair or a hat as separate shells fitted over it. The face texture is projected onto the front facets of the head and the nose, so it bends round the face instead of sitting on a flat front. Everyone has hands with a thumb and curled fingers, shoes on a darker sole, and a collar open at the throat. Each person's clothes come from `humanLooks` in `src/engine/characters/cast.ts`. The options are short, bob, long, or bald hair, a coat (with lapels and buttons), a skirt, overalls (with braces and a bib pocket), an apron (with a bib and waist strings), a clerical collar, and a flat cap, peaked cap, PostBus cap, headscarf, or hood. Trousers without a coat or overalls get a belt. Standing, they breathe, shift their weight, and every 14 seconds or so glance off to one side, hold it, and look back. Walking, their legs swing about 25 degrees and their arms swing against the legs. Seated, the thighs are level, the shins hang, the back slumps a little, and the hands rest on the knees. A `stoop` in `humanLooks` bends the back forward and keeps the head level.
- Le Loyon is a tent sheet that hangs from a body, about 1,560 triangles. The shoulders are its widest point, it falls in long vertical folds that deepen toward the hem, and it darkens toward the hem, so a light at his chest shows only the top of him. Its hem is torn, and a shorter frayed layer covers the shoulders. The hood comes forward past the gas mask, so the mask sits inside it, over a wool scarf. The mask is a rounded rubber face piece with two raised metal lens rims round dark glass, a filter canister hanging from the snout, and straps over the head. Its texture is painted in code (`maskTexture` in `src/engine/characters/materials.ts`) so the shapes stay clean at 640x480; the `gas_mask` PNG is still used for props. The lens glass and the halos in front of it light up through `model.eyes(amount)`. A rope coil of two turns runs over his left shoulder and under his right arm, a rope belt is knotted at the front with a frayed end hanging, and spare rope hangs in loops at his right hip. Rope is a twisted tube (`tube` in `shapes.ts`) with a strand texture. One hand in a fingerless wool glove comes out of the cape below the chest, and army boots on thick soles show under the hem. He never takes the mask off. Standing, he takes one slow breath every seven seconds that barely moves the cape, and every 13 seconds or so his head tilts and stays tilted. Before turning he stands still for 0.7 s, then turns all at once. He walks at 0.62 m/s, half a normal pace, and limps on his left leg. Seated, he folds forward over his knees with his boots out in front, and the hem of the cape sinks through the seat.
- Bari trots with diagonal legs together. Marquise walks one leg at a time. Both lower their heads now and then while standing.

`.holdCandle()` puts a lit candle in a character's hand, with a small warm light that moves with it and goes out while the character is hidden. Le Loyon holds one in the hidden room on night 3, so the candle lights his mask from below and his hand, and the rest of him stays dark.

When a talk starts, the reporter eases back to 1.3 m from the character over a third of a second, unless a wall is in the way (`src/game/kit/talkFraming.ts`). At that distance the head fills about a fifth of the frame.

| Character | Face texture |
|---|---|
| Overney | `face_priest` |
| Monique | `face_innkeeper` |
| Yannick | `face_young_man`, darkened under his hood |
| Bernard | `face_farmer` |
| Gilles | `face_mechanic` |
| Christine | `face_shopkeeper` |
| Odile | `face_widow` |
| Raymond | `face_watchman` |
| PostBus driver | `face_driver` |
| Parishioners | `face_widow` |

### Face textures

The faces are 36 by 40 px with 16 colors. Each one is cropped from its portrait in `assets-src/textures/` so the eyes sit 35% down and the chin at the bottom edge. The crop's contrast is softened, and an oval mask fades it into the cheek color at the edges. Then `tools/textures/ps1-texture.sh <in> <out> 36 16 no` shrinks and dithers it like every other texture. The skin of the rest of the head, the neck, and the hands is the color at the edge of the finished texture, kept in `faceSkin` in `src/engine/characters/human.ts`, so the face blends into the head. After reprocessing a face, measure its edge color again and update `faceSkin`.

```sh
# cx, eye, and chin are pixels in the 1024 px portrait.
h=$(( (chin - eye) * 100 / 61 )); top=$(( eye - h * 35 / 100 )); w=$(( h * 89 / 100 ))
magick face.png -crop "${w}x${h}+$((cx - w / 2))+${top}" +repage -resize 144x160! crop.png
skin=$(magick crop.png \( -clone 0 -crop 20%x10%+15%+52% \) \( -clone 0 -crop 20%x10%+65%+52% \) -delete 0 -append -scale 1x1! -format '#%[hex:p{0,0}]' info:)
magick -size 144x160 xc: -fx "1-(hypot((i-w/2)/(w*0.47),(j-h*0.52)/(h*0.54))-0.72)/0.28" mask.png
magick crop.png +sigmoidal-contrast 2.5x50% \( -size 144x160 "xc:$skin" \) -compose blend -define compose:args=15 -composite soft.png
magick \( -size 144x160 "xc:$skin" \) soft.png mask.png -composite faded.png
tools/textures/ps1-texture.sh faded.png public/assets/textures/face_<name>.png 36 16 no
```

| Face | cx | eye | chin |
|---|---|---|---|
| `driver` | 512 | 372 | 708 |
| `farmer` | 516 | 364 | 698 |
| `innkeeper` | 516 | 386 | 700 |
| `mechanic` | 512 | 364 | 684 |
| `old_woman` | 512 | 468 | 748 |
| `priest` | 512 | 398 | 728 |
| `shopkeeper` | 516 | 386 | 676 |
| `watchman` | 516 | 368 | 708 |
| `widow` | 516 | 358 | 666 |
| `young_man` | 512 | 418 | 726 |
| `young_woman` | 512 | 348 | 592 |

## Staging scare beats

Beats are data. Write them as a list and hand them to the director with `kit.use`:

```ts
import { scareDirector } from '../../game/scares/director';

const scares = kit.use(scareDirector([
  {
    id: 'cem1_back_wall',
    when: [{ flag: 'read_grave_menoud' }, { flag: 'read_grave_gremaud' }, { flag: 'read_grave_chassot' }],
    if: { flag: 'met_raymond' },
    do: [
      { silence: 20 },
      { figure: { at: { x: 0, z: -14 }, vanish: 'never', near: 12, leave: [{ x: 1.5, z: -15 }, { x: 1.5, z: -24 }] } },
      { sound: 'sfx_gate_creak_back', at: { x: 1.5, z: -15 }, after: 9 },
    ],
    set: 'first_sighting',
  },
  {
    id: 'vil_follow',
    when: { enter: { x: 0, z: -10, w: 6, d: 3 } },
    if: { notFlag: 'met_veilleur' },
    do: [{ stalk: { surface: 'stone', steps: 12 } }],
  },
], { random: { surface: 'gravel' } }));
```

A beat fires once, the first frame all of its triggers and its `if` condition hold. With `set`, it also sets that flag, and a beat whose flag is already set never fires again, so beats stay spent across visits. With `repeat: seconds`, the beat can fire again after its triggers stop holding, at most that often.

### Triggers

| Trigger | Holds when |
|---|---|
| `{ enter: { x, z, r } }` or `{ enter: { x, z, w, d } }` | The player has walked into the zone. Starting inside doesn't count until they leave and come back. |
| `{ flag: 'id' }` | The flag is set. |
| `{ after: seconds }` | The scene has been loaded that long. |
| `{ look: { x, y?, z, angle?, within?, hold? } }` | The player looks at the point: within `angle` degrees of the view center (default 10), closer than `within` meters (default 20), for `hold` seconds (default 0.4). |

`when` takes one trigger or a list. A list means all of them.

### Actions

Every action takes `after: seconds` to delay it from the moment the beat fires.

| Action | What happens |
|---|---|
| `{ figure: { at, who?, face?, walk?, vanish?, hold?, near?, leave?, timeout?, stare?, eyes?, speed?, onShow?, onLeave? } }` | A figure, Le Loyon unless `who` names someone else. It appears only while its spot is out of view, so it is there when the player turns. A spot past the edge of the fog counts as out of view too, so a figure on the path ahead is there already and comes out of the fog as the player walks on (`fogSight` in `src/game/scares/fogSight.ts` works out where the fog hides everything, from the live fog uniforms). It stands on the ground at its spot. With `vanish: 'seen'` (default) it is gone after being looked at directly for `hold` seconds (0.8). With `'unseen'` it is gone the first time it leaves the view after being seen. With `'never'` it stays. If the player comes within `near` meters (8), it walks off along `leave`, or is gone at once without one. With `walk` it walks those points at its own slow pace and is gone at the end, which makes a figure that crosses the path ahead and isn't there when you look back. With `stare`, it turns its whole body to keep facing the player and walks off along `leave` that many seconds after being seen. With `eyes`, Le Loyon's mask lenses glow faintly once, a second after he is seen, over about two seconds. `speed` sets the pace of `walk` and `leave` in meters per second. `onShow` and `onLeave` run when it appears and when it starts to walk off. |
| `{ sound: id, at?, distance?, volume? }` | One sound from a point `{ x, z }`, or `distance` meters (default 12) `'behind'`, `'ahead'`, `'left'`, or `'right'` of the player. |
| `{ stalk: { surface?, steps?, distance? } }` | Footsteps 7 m behind the player that answer each of their steps 0.3 s late, with a dragged foot every second step. When the player stops, one more step comes, then nothing. |
| `{ silence: seconds }` | Every ambient bed fades out over 1.5 s, stays out, then returns over 3 s. |
| `{ fog: { far?, density?, seconds, fade? } }` | The fog eases to these values (default: closes in to 60% of `far` and 1.8 times the density), holds, and eases back. When the values thin the fog, the camera's far plane moves out with it for as long as it lasts, so what the thinner fog uncovers is drawn. The barn roof at the forest fork uses this to show 26 m up the branch. |
| `{ stinger: id \| true, at? }` | The loud hit of a real jumpscare. `true` plays `sfx_hit`; the three jumpscares use `sfx_bark`, `sfx_floorboard`, and `sfx_breath_mask`. |
| `{ run: (ctx) => ... }` | Any code, such as a dialogue after a stinger. |

Sound ids, all synthesized: `sfx_step_other`, `sfx_branch`, `sfx_breath_mask`, `sfx_cough_mask`, `sfx_bell_dog`, `sfx_whistle_raymond`, `sfx_gate_squeal`, `sfx_gate_creak_back`, `sfx_metal_cup`, `sfx_knock_metal`, `sfx_static`, `sfx_floorboard`, `sfx_bark` (three barks), `sfx_growl`, `sfx_hit`. Play one outside a beat with `playSound(ctx.audio, id, { at })` from `src/game/scares/sounds.ts`.

### The director

`kit.use(scareDirector(beats, options))` returns the `ScareDirector`:

- `scares.fire('id')` plays a beat now, whatever its triggers say.
- `scares.block(seconds)` keeps random events away, for example during the watchman's approach.
- `options.random` turns on the random events from the table in 07-scares.md: at least 75 s apart, a 6% chance in each 10 s window, and a pool of footsteps (40%), a branch (35%), an 8 s silence (20%), and a mask breath (5%, once per scene). Turn it on only outdoors at night and in the bunker. Each fixed beat holds random events back for 60 s, and nothing happens during dialogue.

Beats, figures, and timers pause while a dialogue or menu is open.

## The watchman's round

```ts
import { watchmanPatrol } from '../../game/patrol/patrol';
import { dialogues } from '../../content';

const patrol = kit
  .use(watchmanPatrol({
    route: [
      { x: 0, z: 30 },                                   // offstage, down the path
      { x: 0, z: 6, gate: true },                         // the front gate squeals
      { x: 0, z: -12, wait: 5, aim: { x: 2, z: -16 } },   // the back wall and the Chassot plot
      { x: -3, z: -12, wait: 3, aim: { x: -6, z: -14 } }, // Daniel's lantern
      { x: 0, z: 6, gate: true },
      { x: 12, z: 30 },                                   // down the far side
    ],
    rest: 40,
    grounds: [{ x: 0, z: -4, w: 24, d: 22 }],
    suspicious: [{ x: 2, z: -15, r: 3 }],
    safe: [{ x: 9, z: -10, w: 2, d: 2 }],
    evidence: [{ at: { x: 2, z: -15 }, active: () => ctx.state.count('dig_stage') >= 1 && !ctx.state.hasFlag('tarp_over_hole') }],
  }))
  .onRound(() => scares.block(45))
  .onSeen(() => void ctx.dialogue(dialogues.raymond_night2_warn))
  .onCaught(() => void ctx.dialogue(dialogues.raymond_caught));
```

Raymond walks the route with Bari at heel, rests offstage for `rest` seconds, and starts again. Set `once: true` for the single pass on night 1. Change `patrol.rest` at any time, for example to shorten the round after the warning.

He gives himself away in this order:

1. Bari's collar bell rings on the dog's steps. The sound is positional, so start the route 20 m or more outside the grounds.
2. Raymond whistles his four notes every 7 to 10 s while he is outside the grounds.
3. His torch beam swings ahead of him and shows through the fog. A point light lands where the beam meets the ground.
4. The gate squeals at every stop marked `gate`.

While he stands at a stop with `aim`, the torch sweeps around that spot.

Detection follows 04-cemetery.md, with a torch cone 12 m long and 25 degrees wide:

| Cause | Rule | Result |
|---|---|---|
| `flashlight` | The player's flashlight is on inside `grounds` while Raymond is within 30 m. | Caught |
| `evidence` | The beam touches an active `evidence` spot while the player is inside `grounds`. | Caught |
| `beam` | The beam touches a standing player. A crouched player is safe when a collider stands between them and the torch, unless Bari has given them away and Raymond is within 4 m. | Caught inside a `suspicious` zone, otherwise `onSeen`, once per round |

The player is never seen inside a `safe` zone. If the player comes within 3 m of Bari, he growls once. If they are still within 3 m of the route 4 s later, Raymond turns his torch on them for 3 s.

When the player is caught, the round stops, Raymond and Bari face the player, the torch stays on them, Bari keeps barking, and `onCaught` runs. `patrol.catch()` ends the round the same way from level code, for example on a sighting after the warning. `patrol.caught` tells whether it happened, and `patrol.raymond` and `patrol.bari` are the two `NpcBuilder`s.

## Crouching

C, left Ctrl, or the gamepad's LB toggles crouching. The eye drops from 1.65 m to 1.05 m, the player walks at 0.6 m/s, and their steps are quieter. Loading a scene stands the player up. `ctx.player.crouched` reads the state.

## The test scene

`characters_test` is a foggy pasture. Spawns: `default` faces the row of villagers and animals. `view_<id>` stands 3 m in front of each of them. `view_marc` and `view_marc_close` face Le Loyon at the tree line, 10 m and 3.6 m away. `path` starts the gravel path north, which runs through a stalker, a figure behind the player, a look trigger on the bare tree, a walker, a cough, and a stinger at the end. `patrol` stands beside the walled plot where Raymond does his round.

Flags: `test_patrol_now` starts the round after 3 s, `test_walk` makes the row walk up and down, and `test_loyon_walk` makes Le Loyon pace.

```sh
npm run shot -- --scene characters_test --time night --flags test_patrol_now --pos 25,0,6 --yaw -140 --frames 380 --out /tmp/patrol.png
```

Screenshots of every character by day are in `screenshots/characters-<id>.png`.
