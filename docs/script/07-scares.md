# Scares

The anticipation beats, area by area and stage by stage. This file is the brief for the scare director and the sound work. Story content for each place is in the other script files.

## Principles

1. **Wait.** Most of the game is quiet walking in fog. The player should spend long stretches waiting for something that doesn't come. A beat only works if the minutes before it were empty.
2. **Sound first.** Hear it before you see it, and usually only hear it. Footsteps that aren't yours, a branch, a bell, breathing through rubber, and silence where there should be sound.
3. **No music cues.** No sting when a figure appears. Nothing tells the player "this is a scare". Some players will miss half the sightings, and that is correct. The one exception is the first sighting (`cem1_back_wall`): a low drone swells in slowly as he appears and fades a while after he leaves. It is a bed, not a sting.
4. **Distance.** Le Loyon is almost always 12 m or more away, at the edge of the fog, and blurred by it. Before the hidden room he is never closer than 8 m and never fully lit.
5. **Wrong movement.** When he moves, it is slow, stiff, a limp on the left leg. He never runs toward the player. He never runs at all, except once in the forced-photo branch, away.
6. **Change behind you.** Tank controls make turning slow. Use it. Things change while the player's back is turned: a gate that was shut is open, an object has moved, a figure was there and isn't.
7. **Resolve most beats as nothing.** A stump, the wind, a dog, the boy from the inn. Every false alarm makes the next real one land harder.
8. **Earn the jumpscares.** Three in the whole game. Each one comes after a long build and pays it off.

## Sound palette

| Id | Sound | Use |
|---|---|---|
| `amb_village_day` | Drip from gutters, a far cowbell, a TV through a wall, a tractor once in a while | Village by day |
| `amb_village_night` | Drip, the fountain, a dog far off, then nothing for long stretches | Village at night |
| `amb_cemetery` | Very soft wind, the drip from the spruce over the back wall | Cemetery |
| `amb_forest` | Drip from branches, very low wind in the treetops, the stream near the bridge | Forest |
| `amb_bunker` | Room tone of concrete, distant water drip, a low hum from the vent shafts | Bunker |
| `amb_church` | Nothing but the electric hum of the candle lamp; the tower clock click every 15 min | Church |
| `sfx_step_other` | A single footstep on gravel, wet leaves, or concrete, slightly heavier than the player's, with a drag on every second step | Footsteps that aren't yours |
| `sfx_branch` | A branch snapping, heavy, 15 to 30 m away, panned | Forest |
| `sfx_breath_mask` | One slow breath through a respirator filter, in and out, 4 s | Rare. Never more than once per area visit |
| `sfx_bell_dog` | Bari's collar bell | Raymond's approach |
| `sfx_whistle_raymond` | Four notes, whistled, always the same | Raymond's approach |
| `sfx_gate_squeal` | The cemetery front gate | Raymond, or the player |
| `sfx_gate_creak_back` | The back gate, a softer creak | Le Loyon |
| `sfx_metal_cup` | A tin cup set down on concrete | Behind the steel door |
| `sfx_static` | Phone line hiss | Phones at night |
| `sfx_modem` | The dial-up handshake | Computers |

**Silence drops.** The scare director can fade every ambient bed to zero over 1.5 s and hold it. Use this before a sighting and in a few places where nothing happens at all, so the player learns that silence doesn't always mean something. Silence drops are the most important tool in this file.

## The scare director

The level code places most beats as fixed triggers. A small director adds random sound events between them.

| Setting | Value |
|---|---|
| Random sound events | Only outdoors at night and in the bunker |
| Minimum gap between random events | 75 s |
| Chance per eligible 10 s window | 6% |
| Pool | `sfx_step_other` (40%), `sfx_branch` (35%), silence drop for 8 s (20%), `sfx_breath_mask` (5%, at most once per night) |
| Blocked | During dialogue, during Raymond's approach, for 60 s after a fixed beat, inside the inn and the church |

A random footstep never repeats more than twice in a row and always stops when the player stops, one step late. That one step late is the point.

## The jumpscares

Only these three. Each has a loud sound hit. Nothing else in the game has one.

### Jumpscare 1: the dog (night 1, cemetery)

**Build.** The player has walked up the path in the dark and is reading graves by torchlight. The director is blocked: no random sounds. The cemetery ambience fades slowly over a minute until there is nothing but the player's own steps on gravel. At least 45 s of this.

**Hit.** When the player is reading a grave in rows 2 to 4 and facing away from the front gate, Bari barks, loud, from right behind the wall 2 m away, three barks. Then Raymond's torch swings onto the reporter.

**Resolve.** "Bari, tais-toi!" An old man and an old dog. The dialogue `raymond_night1` plays. The player learns the watchman exists and what his approach sounds like (it was silent this once because he'd stopped to drink from his thermos behind the wall).

**Why it's earned.** It is the first night, the first time in the dark, the cemetery. The player is braced for Le Loyon. It's a dog. It also teaches the mechanic that will matter on night 2.

### Jumpscare 2: the regulars' table (day 3 evening, inn)

**Build.** All game, veilleur's posts have described where the reporter is and what they did. On day 3 the inn is empty: Monique is in the kitchen, the café lights are off. The stübli is lit only by the monitor. The modem handshake, then the board loads, slowly, image by image. A new post at the top, time-stamped a minute ago. It describes the room the player is sitting in: the cup, the coat, the light in the kitchen. "turn around."

**Hit.** Yannick is already in the stübli. He sits in the dark on the corner bench at the regulars' table, behind the reporter's right shoulder, hood up, where the monitor's light only just reaches his face. He has been there while the reporter read. The player has to turn the reporter around with tank controls, which takes about two seconds for 180 degrees, so he comes in at the edge of view first and the player sees him before they understand him. At the moment he is fully in view, the bench creaks (the hit) and he stands up. The doorway stays empty: a figure in a doorway is Marc's, the same night.

If the player refuses to turn for 40 s: the bench creaks behind them anyway, Yannick says "Sorry.", and the reporter turns to him. Same scene.

**Resolve.** `yannick_reveal`. He's sixteen and embarrassed. He wrote every post.

**Why it's earned.** It pays off two days of the forum knowing too much. It resolves the "who is watching" mystery as human, which makes the bunker scarier, because now the player knows the remaining watcher is the real one.

### Jumpscare 3: Marc in the doorway (night 3, hidden room)

Only in the `room_empty` branch (the player unlocked the door without knocking).

**Build.** The player enters Marc's room alone. It's warm, candlelit, and silent. No ambient bed at all except the candle's faint flutter. They look at the bed, the képi, the notebook with drawings of themselves with no face. The mask is on its hook. Every object tells them they are in someone's home without permission.

**Hit.** After three objects or 90 s, when the player turns back toward the door, Marc is standing in the doorway, full height, masked, the cape, 3 m away, lit from below by the candle. One `sfx_breath_mask`, loud and close, is the hit. Then nothing. He doesn't move.

**Resolve.** "Don't move. I won't either." The monologue.

**Variants.**

- Correct knock (`knock_pattern_done`): no jumpscare. The fear is spread over the long pause and the voice through the door.
- Wrong knock: the player's own torch finds him standing in the corner (`marc_dark_room`). No sound hit, only the image. It counts as a softer version.

**Why it's earned.** It is the first time the player sees him close, after two hours of glimpses. The player made a choice that led here: they didn't follow Gremaud's instructions. Players who read the letter carefully skip it.

## Beats by area and stage

Each row: when, what triggers it, what the player sees or hears, and how it resolves. "Real" means Le Loyon is actually there. "False" means it's something else. "Open" means the game never says.

### Prologue: the flat

| Id | When | Trigger | What happens | Resolves |
|---|---|---|---|---|
| `pro_streetlamp` | Any time | Looking out the window | The street lamp outside flickers. Under it, for one flicker, a figure stands in the rain. Next flicker, empty. | Open. Never explained. (It's a man waiting for a bus.) The only beat in the prologue. |
| `pro_fridge` | After reading veilleur's post | Automatic | The fridge in the next room stops humming. The silence is very loud. 20 s later it starts again. | False. A fridge. |

### Arrival

| Id | When | Trigger | What happens | Resolves |
|---|---|---|---|---|
| `arr_silence` | Bus leaves | Automatic | Eight seconds of total silence after the engine fades. Then the village sounds come in one by one. | Sets the rule: silence is normal here. |

### Village by day

Almost nothing. The village should feel safe and dull by day, so nights feel worse.

| Id | When | Trigger | What happens | Resolves |
|---|---|---|---|---|
| `vil_curtain` | Day 1 | Walking past the Gremaud house | An upstairs curtain moves. | False. Odile. |
| `vil_child_bike` | Day 2 | Passing house 2 | The child's bicycle that was against the wall on day 1 is lying on its side in the road. | False. A child. Never seen. |
| `vil_moped` | Day 2 dusk | Crossing the square | A moped engine, idling somewhere out of sight in the fog. It doesn't come closer or go away. When the player walks toward it, it drives off. | False. Yannick. Revealed later. |

### Village at night

| Id | When | Trigger | What happens | Resolves |
|---|---|---|---|---|
| `vil_follow` | Night 1, 2 | Walking from the inn toward the church | `sfx_step_other` on the cobbles behind, matching the player's pace, stopping one step after the player stops. Turning shows only fog and the street lamp. | False. Yannick, following. Revealed day 3. |
| `vil_dog_muzzled` | Night 1 | Passing house 2 | A dog barks inside once and stops dead, as if someone held its mouth. | Open. |
| `vil_fountain_figure` | Night 2 | Looking out of room 3's window before leaving | Someone stands by the fountain, hood up. The lamp flickers; the square is empty. | False. Yannick. |
| `vil_phonebox` | Night 2 | Passing the phone box | It rings once. If the player gets inside within 3 s and lifts it: `sfx_static` for 4 s, a sound under it like breathing, then the dial tone. | Open. Probably a bad line. Nobody in the game has a phone Marc could use. |
| `vil_inn_phone` | Night 2 | Lifting the stübli phone | Same static and breathing, then dial tone. | Open. |
| `vil_chassot_farm` | Night 3 | Passing the Chassot farm | A light moves behind the nailed shutters, low, like a candle carried at waist height. When the player gets close, it goes out. | Real. Marc fetching potatoes from the cellar. Never confirmed. |

### Inn

| Id | When | Trigger | What happens | Resolves |
|---|---|---|---|---|
| `inn_radiator` | Night 1 | Lying down to sleep | The radiator knocks three times. Pause. Once. Monique said it knocks. | False, and a rhyme with the knock pattern the player learns later. The player may remember it at the K.P. 3 door. |
| `inn_upstairs_steps` | Night 2 | Coming back after the dig | Footsteps in the corridor upstairs go past room 3 and a door closes. | False. Yannick coming in. |
| `inn_doorway` | Day 3 evening | Forum stage 5 | Jumpscare 2. | Yannick. |

### Church

The church is the one safe place. Use it as a rest.

| Id | When | Trigger | What happens | Resolves |
|---|---|---|---|---|
| `chu_confessional` | Day 1 to 3 | Sitting in the confessional | Through the grille, after 20 s of silence, the soft creak of someone shifting their weight on the priest's side. If the player leaves and looks, the priest's side is empty and the abbé is at the far end of the nave. | Open. The old wood settling. |
| `chu_clock` | Any visit | Every quarter hour | The tower clock's heavy click. On the hour, the bell. It is loud, and it is the only loud sound in the church. | False. Teaches the player that loud sounds aren't always danger. |

### Cemetery path

| Id | When | Trigger | What happens | Resolves |
|---|---|---|---|---|
| `path_cross_rosary` | Night 1 | Passing the wayside cross | The rosary tied to the cross is swinging, slightly, with no wind. | False. The player brushed it, or the draft. |
| `path_light_above` | Night 2 | Halfway up | A torch beam moving up at the cemetery, through the fog. Bari's bell. | Raymond. The patrol mechanic, again. |

### Cemetery, night 1

| Id | Trigger | What happens | Resolves |
|---|---|---|---|
| `cem1_lantern` | Entering | Daniel's lantern is the only light. The player sees it from the gate, a red point in the black. | Real. Marc lit it within the hour. |
| `cem1_silence` | Reading the first grave | Ambient fades over a minute to nothing. | Builds to jumpscare 1. |
| `cem1_dog` | Reading a grave in rows 2 to 4, back to the gate | Jumpscare 1. | Raymond and Bari. |
| `cem1_back_wall` | All graves read, Raymond gone | The first sighting. A figure outside the walls among the spruces, 4.5 m past the back wall, right of the back gate. Silence drop, then a low drone swells in. Once seen, it stands facing the player for six seconds while its mask lenses glow faintly and go dark, then walks slowly into the forest. The back gate creaks open on its own and the reporter is told to follow. The drone fades 20 s later. | Real. `first_sighting`. |
| `cem1_photo` | Any photo before the sighting | Photo 7 develops with a figure in it. | Real. Marc was there. Confirmed by his notebook. |

### Cemetery, night 2: the dig

The dig is the longest tense sequence in the game. The patrol is the threat. Le Loyon is a watcher and never interferes.

| Id | Trigger | What happens | Resolves |
|---|---|---|---|
| `cem2_dark_lantern` | Entering | Daniel's lantern is dark tonight. The cemetery is pitch black. | Marc is at the wall instead. |
| `cem2_patrol` | Every 90 s | Bell, whistle, torch beam, gate. The player hides. | Raymond. Can end the game. |
| `cem2_gravel_step` | `dig_stage` reaches 4 | While the player is in the hole, a single step on the gravel above and behind, then nothing. If the player climbs out and looks: nobody. Not Raymond (no bell). | Open. Either Yannick (he was in the ossuary) or Marc (he was at the wall). The notebook and the forum both claim to have been watching. |
| `cem2_ossuary_shape` | Hiding in the ossuary | In the dark corner of the shed, behind the stack of wooden crosses, something pale at head height. Lit by the torch, it's a white enamel grave photo frame, broken, propped on the shelf. | False. |
| `cem2_back_gate` | Opening the coffin | When the player climbs out after opening the coffin, the back gate, which was shut, is standing open. | Real. Marc came in and went out while the player was down in the hole. |
| `cem2_breath` | Reading the letter at the graveside | One `sfx_breath_mask`, very faint, from beyond the back wall. | Real. |

### Forest, night 1

| Id | Trigger | What happens | Resolves |
|---|---|---|---|
| `for1_ahead` | 150 m in | The figure stands on the path at the edge of the torch beam, facing away. At 12 m it steps off the path to the right. No sound of it moving through the undergrowth. | Real. |
| `for1_fork_steps` | At the shrine | Footsteps on the right path, slow, uneven, going away uphill. No figure. | Real. |
| `for1_shrine` | Looking at the shrine | The Virgin has been turned to face the path to the fort. | Real. Marc turned it. Why is never said. |
| `for1_cup` | At the fort's steel door | After a pause, `sfx_metal_cup` from inside. | Real. |
| `for1_cough` | Walking back to the cemetery | Far behind, once, a muffled cough through rubber. | Real. |

### Forest, day 2

| Id | Trigger | What happens | Resolves |
|---|---|---|---|
| `for2_heifer` | Finding Marquise | She stands still at the forest edge, staring into the trees. Her bell is silent because she doesn't move. | Setup. |
| `for2_stump` | Following her gaze | A dark vertical shape 25 m in. If the player looks away and back, it's gone. If they walk to it, it's a mossy stump in a different place than they thought. Then, deeper in, `sfx_branch`. | Open. The stump is false. The branch is real. Players won't be sure which was which. |
| `for2_led_home` | Leading the heifer | She keeps looking back over her shoulder at the forest. If the player looks back too, there is nothing. Every time. | False, every time. The heifer knows something the player can't see. |
| `for2_cup` | Day 2, after `bunker_door_open`, walking back past the stump beside the fort path | An army tin cup stands on the stump with an inch of cold coffee in it. It wasn't there on the way up. Looking at it silences the forest for 9 seconds. Nothing else happens. | Real. Someone was there between the walk up and the walk back. |

### Bunker, day 2

| Id | Trigger | What happens | Resolves |
|---|---|---|---|
| `bun2_wedge` | Entering | The door that wouldn't open last night is open. The wedge is on the floor. | Real. Marc opened it for the player (his notebook says so). |
| `bun2_drip` | Anywhere inside | Water drips in the next room. Always the next room, wherever the player goes. | False. Design. |
| `bun2_mirror` | Looking in the latrine mirror | A blurred shape behind the player's reflection. Turning: the tent sheet on its hook. | False. On night 3 the tent sheet is gone. |
| `bun2_masks` | Standing in the mask store, then turning to leave | Behind the player, a soft sliding rattle: one mask has slid off the top of the pile onto the floor. It lies face up, eyepieces to the ceiling. If the player looks at the pile again, they can't tell which one moved. | False. The pile settles. |
| `bun2_cupboard_screech` | Pushing the cupboard | The screech echoes through the whole fort and takes a long time to die. Then the player hears, very faint, a second screech from far off, like an echo but too late. | Open. The escape hatch lid closing as Marc leaves? Or the echo. |
| `bun2_door_listen` | Listening at K.P. 3 | Slow breathing, or the wind in a shaft. | Open. |

### Forest, day 3: the larch

| Id | Trigger | What happens | Resolves |
|---|---|---|---|
| `for3_hatch` | Passing the hatch | The worn path in the moss. No sound. | Setup. |
| `for3_grave` | Reading the cross | Total silence for six seconds. Every ambient bed out. | The heaviest dread beat in the game. No figure. Nothing happens. That is the scare. |
| `for3_watched` | Walking back down | 30 m below, between the trunks, a figure stands looking up at the player. It does not move. If the player keeps walking, it is still there at the next turn of the track, in the same place relative to the player, as if it had kept pace without being seen to move. Then not. | Real. Marc watching the player at Gremaud's grave. The "kept pace" is placement, not supernatural: the track winds and he walks the straight line. |

### Bunker, night 3

| Id | Trigger | What happens | Resolves |
|---|---|---|---|
| `bun3_tentsheet` | Passing the latrines | The tent sheet is gone from its hook. | Real. He's wearing it. Or he's out. |
| `bun3_masks` | The mask store | The clean shelf still has six. The seventh space is empty. | Real. |
| `bun3_phone` | Turning the guard room field phone's crank | Somewhere deeper in the fort, a phone rings, once. | Real. The line still runs to K.P. 3. Nobody answers. |
| `bun3_drum` | Tapping a fuel drum | The boom goes all through the fort. Then, from K.P. 3, a soft tap on the steel door, once. | Real if Marc is inside (wrong knock or knock branches). If he's out, nothing answers, and the silence after is the beat. |
| `bun3_light_under_door` | Arriving at K.P. 3 | A warm line of light under the door. | Real. |
| `bun3_knock` | Knocking | Correct: a long pause, then breathing through the steel, then his voice. Wrong: the light under the door goes out. | Real. |
| `bun3_doorway` | `room_empty` | Jumpscare 3. | Marc. |

### Endings

| Id | Ending | What happens |
|---|---|---|
| `end_leave_window` | Leave | From the back of the bus, a figure at the forest edge above the Yerly field, still, for three seconds. No music. The bus turns. |
| `end_secret_view` | Keep the secret | The last shot: the cemetery from the forest wall, Daniel's lantern lit, one breath through a mask. Marc's point of view. The player was the one being watched all along, and now they are looking from where he stood. |
| `end_publish_empty` | Publish | The empty room after the police come. The bed made. The hook bare. No sound at all. |

## Count

Real sightings where the player can see him: night 1 back wall, night 1 forest path, day 3 below the larch, the ending bus window (leave only), and the hidden room. Five at most, four in any one playthrough, and in all but the last he is a shape in fog.

Jumpscares: three, one of them avoidable by reading the letter.
