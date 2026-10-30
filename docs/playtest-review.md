# Playtest review, fresh eyes

Reviewed on 2026-10-30 from the 24 `flow-*` screenshots, the per-scene screenshots in `docs/screenshots/`, two extra frames of the bunker interior (`/tmp/dust.png`, `/tmp/dust2.png`), and the script docs. I did not play the game through, so notes on timing come from the script and the playthrough doc, not from the clock.

## Top 10 fixes

Ranked by how much each would improve the game.

1. **Every NPC has a photo face on a box head.** Scenes are the arrival (`flow-04`), the abbé (`flow-05`), Monique at supper (`inn-dinner.png`), and the lineup (`characters-lineup-day.png`). The faces are sharp, high-contrast photographs pasted on a flat front of a cube, and they sit in front of the camera in every conversation. Everything else in the game is dithered and fogged, so the faces look like cardboard cutouts, and the player meets one in almost every scene. Fix: give the character builder a low-poly head (an 8 to 10 sided cylinder or a simple PS1 head mesh) and run the face textures through the same filter as the other textures, down to 32 to 64 px with the reduced palette. Pull the dialogue camera back a little so heads fill less of the frame.

2. **Marc's reveal in the doorway is the weakest-looking frame in the game.** `flow-19`. The cape is one flat rectangular slab with a camo texture, wider at the bottom than at the shoulders, and the mask sits on top like a separate sticker. It reads as a rolled carpet leaning in a door. This is the third jumpscare and the payoff of three days of glimpses. Fix: model shoulders, a hood, and a few vertical folds so the tent sheet hangs from a body. Leave the lower half in shadow and light only the mask and one hand with the candle, so the player fills in the rest.

3. **The empty coffin opens in the dark.** `flow-14`, cemetery, night 2. The player has just hidden from Raymond with the torch off, and the moment the whole night builds to is a black frame with "Take the box" over it. `cemetery-coffin-night.png` shows the same moment lit, and it works, so this is only a problem when the torch is off. A player who learns to keep the torch off near Raymond will see nothing at the key story beat. Fix: in the cemetery level, turn the torch on automatically when the player opens the lid, or give the hole a faint light of its own (a match, Raymond's lantern on the far wall) for the open-coffin state.

4. **Puzzle P4 asks the player to read the floor in a black room.** Bunker interior, day 2. `bunker-cupboard-day.png`, `bunker-masks-slid-day.png`, and my two extra frames near the cupboard (`/tmp/dust.png`, `/tmp/dust2.png`) are almost black outside the torch circle. Tank controls have no look-down, so a mark on the floor next to the cupboard is below the bottom of the frame until the player stands back from it. Fix: put the clue where the camera looks, such as scrape marks on the cupboard's side or a fresh scratch on the wall. Or make "Look at the floor" fire from the cupboard's prompt range and say what the reporter sees. Raise the ambient light in `bunker_interior` by day a little, since the firing slit should let some in.

5. **The notebook never says what to do next.** `ui-notebook.png`, `src/content/notebook.ts`. Every entry is a clue ("A steel door behind a cupboard. K.P. 3. Locked.") and none is a goal. Most of the game is an errand chain across seven places (register, Odile, Yerly, the fort, the dig, the larch, the knock), and after a break a player will not know which door is next. The day-2 entries `suspects_empty_coffin` and `found_hidden_door` are the worst cases, because the next step (dig at night, find a shovel, bring food) is not written anywhere the player can reread. Fix: add one short "next" line per stage in `notebook.ts`, behind the same `if` conditions, shown at the top of the notebook in the reporter's voice ("Tonight. The Chassot grave. Need a spade.").

6. **Two "figure in a doorway" jumpscares on the same evening.** Yannick in the inn doorway (day 3 evening, `07-scares.md` jumpscare 2) and Marc in the bunker doorway (night 3, jumpscare 3) use the same staging within one session. The second loses its punch because the player has just been taught that doorway means a person. Fix: restage Yannick's reveal in the inn. He could already be in the stübli when the reporter turns from the computer, seen in the dark CRT's reflection, or be on the stairs behind the reporter. Keep the doorway for Marc.

7. **The larch looks like a stack of plates.** `forest-larch-day.png`, `flow-16`. It is the only landmark of day 3 and the place Gremaud is buried. Its tiers are flat, pale ivory discs, unlike every other tree, and from below (`flow-16`) it reads as a giant mushroom. A larch in November is bare or rust-gold. Fix: a bare trunk with drooping branches in a rust tone, tall and thin, so it stands out from the spruces by shape and color and reads at 30 m in fog.

8. **The fort does not look like a hay barn.** `bunker-exterior-day.png`. The script says the fort is disguised as a barn. On screen it is a gray rendered house with a modern steel door and a sign beside it. The disguise is part of why the village never found it. Fix: wood-plank cladding painted on the concrete, a large fake barn door, a shingle roof, and the steel door set back inside the plank opening.

9. **Flat white surfaces look like placeholders.** Window panes in room 3 and Odile's kitchen (`flow-09`, `flow-11`, `flow-20`, `garage-day.png`) are flat white planes with no view out, brighter than anything else in the frame. Untextured white also shows on the pillow and bed edge (`inn-room3-night.png`), the inn phone (`flow-15`), and candles. Fix: give windows a fog gradient texture with a faint roof or tree silhouette, and a tint so they sit below the fog color. Texture the pillow, phone, and sheets through the same filter.

10. **The dig loop on night 2 repeats.** Per `docs/playthrough.md` the dig takes three to four of Raymond's rounds, each with the same whistle, bell, climb out, tarp, and wait in the shed. By the third round the player is following a timer, not afraid of him. Fix: cap it at two full rounds by digging faster per press, and vary the second round (Raymond stops at the tarp, or Bari sniffs at the shed door, then he moves on).

## Readability

- **Day 2 has no starting direction.** `flow-09` opens on room 3 with only "Look out of the window". If the window or Monique does not give the day's first goal, the player walks out into a square they can't see across. See fix 5.
- **The fog hides the square's layout.** In `village-day.png` the only readable shapes are the fountain and a pole. The player can't tell which way the church, inn, or cemetery path lie. Add one strong shape per exit at the edge of fog distance, such as the church tower, a yellow PostBus sign, or a lit inn sign, and a hand-painted wooden signpost by the fountain ("Cimetière", "Bois-Noir").
- **The bunker is dark by day and by night.** `bunker-guard-day.png`, `bunker-masks-day.png`, `bunker-tunnel-night.png`. With no change between visits, the day-2 visit doesn't feel safer than night 3, and objects to examine sit outside the torch circle. See fix 4.
- **Forest paths at night are almost black.** `forest-path-night.png` shows one tree and a patch of ground. The path edge is not visible, so following the path in the night-1 chase depends on luck. Lighten the path texture a step or line it with pale stones so the torch catches it.
- **Interaction prompts are clear.** The "E + verb" prompt is easy to read everywhere I looked, so the problems above come from lighting and layout, not from the prompts.
- **The forest-grave cross carries its inscription as a decal floating in front of the wood** (`flow-16`, bottom left), readable before the player presses "Read the cross". This gives away the reveal from a distance. Carve it into the crossbar texture at a size that only reads up close.

## Horror pacing

- **The prologue and the forum work.** The 1998 desktop (`flow-02`) and the veilleur posts are the closest the game gets to Pulse, with technology as the channel. The posts that know what the reporter did last night (`forum_seen_2`) are the strongest idea in the game. Use them more. A post that appears while the reporter is still at the inn computer would be stronger than one found later.
- **The first sighting may be missed by everyone.** `flow-07` and `cemetery-sighting-night.png` show no figure I could pick out. The scares doc accepts that some players miss sightings, but this is the inciting beat. If `first_sighting` is set by a trigger rather than by the player looking, the notebook then writes "Someone at the back wall" for a player who saw nothing, which tells them they missed it. Either keep the figure visible for a second longer at the back wall, or write the notebook line only after the reporter's own reaction fires.
- **The heifer false alarm is good.** `flow-12`. A shape in forest fog that turns out to be a cow is the right kind of resolve-as-nothing beat.
- **Day 2 is long and flat in daylight.** Register, Odile, Yerly, and the fort all happen in the same gray light with no beat between them. One quiet wrong detail on the way back from the fort (the cupboard pushed back into place, or a cup set down in the next room, `sfx_metal_cup`) would carry tension into night 2.
- **Marc in the doorway is staged too frontally.** See fixes 2 and 6. He stands centered and lit in the frame. Something at the edge of the frame, closer than the player thought, would follow the style doc better.
- **The church fog removes the room.** `church-day.png` and `flow-05`. Indoor fog as thick as the square's makes the nave feel like outdoors. The church should be the one still, clear place, so the fog outside reads as a threat by contrast.

## Visual consistency

- **Characters** are the largest break (fix 1). Their silhouettes in `characters-lineup-day.png` are fine at fog distance. The faces up close are the problem.
- **The PostBus** (`flow-04`) is a flat yellow box with a black rectangle for a window. A cab shape, wheels, and a bevel would do.
- **The fort door wheel** (`flow-08`) is a flat black octagon with no spokes or rim. It is the object the player handles on night 1.
- **Village night lighting** (`village-night.png`). A sign on a pole floats as a pale rectangle, and a bright cream bar at the bottom of the frame (the fountain rim or a bench) looks unlit and glows above everything else in the frame.
- **The red phone box** (`village-phonebox-day.png`) is the cleanest, most saturated object in the village. Desaturate it and add grime so it stays the one red thing without looking new.
- **The coffin lining** (`cemetery-coffin-night.png`) is a white grid pattern that reads as bathroom tile. Use a dull, stained cloth texture.
- **Room 3 by morning** (`flow-20`). The ceiling lamp at the top right appears to cut into the sloped ceiling. Lower it or move it under the flat part.
- Interiors that already fit the style: Odile's kitchen apart from the window, the garage, the hidden room (`flow-18`), and the stübli. The mask pile in `bunker-masks-day.png` is the best single image in the game.

## Bugs

1. **`npm run shot` rejects `--day` and `--night`.** Run `npm run shot -- --scene cemetery --time night --day 2 --out /tmp/x.png`. It fails with `ERR_PARSE_ARGS_UNKNOWN_OPTION: Unknown option '--day'`, because `tools/shot.mjs` only passes `time`, `pos`, `yaw`, and `flags` to the URL. `docs/playthrough.md` says shot takes `day=` and `night=`, and `docs/engine.md` documents them on the URL. Add `day` and `night` to the options list and to the query loop. Without this, a night-2 or day-3 scene can't be captured from the CLI.
2. **`flow-13-hidden-door.png` doesn't show the hidden door.** The stage in `tools/playthrough/runs.mjs` (around line 268) takes the shot after "Look at the wrapper", so it shows a brick wall and the wrapper prompt. Turn the player toward the steel door before `s.shot('13-hidden-door')`.
3. **The empty-coffin moment can play in total darkness** when the torch is off (`flow-14`). Steps: night 2, dig, hide from Raymond with the torch off, open the lid without turning the torch back on. "Take the box" shows over a black frame. This is by design of the torch, but the result is that the player can miss the key story image. See fix 3.
