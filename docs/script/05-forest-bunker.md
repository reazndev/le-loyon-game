# Forest and bunker

The Bois-Noir forest, the sightings, the fort and its rooms, the hidden room, Marc's monologue, and the three endings. Dialogue convention: see [00-overview.md](00-overview.md#dialogue-convention). Scare timing is in [07-scares.md](07-scares.md); this file gives the content.

## The forest: Bois-Noir

Spruce on the slope, beech and birch in the hollows, a stream that crosses the path once on a plank bridge. Moss on everything. The ground is soft needles and mud. Visibility by day is 10 to 15 m in the fog; at night, the length of the torch beam and no more.

The path from the cemetery's back gate runs north-west for about 400 m to a fork with a small wooden shrine to the Virgin on a post. Left goes down to the stream and the Yerly field edge. Right climbs to a clearing where the fort stands. Above the fort a narrow animal track goes up to the larch.

```
   [larch, Gremaud's grave]
           |  animal track, 150 m (day 3 only)
   [escape hatch under a fallen spruce]
           |
   [FORT: the "barn" in a clearing]
           |
     right, 200 m uphill
           |
   [shrine fork]------- left, 250 m down ------ [plank bridge] ---- [Yerly field edge]
           |
     400 m, spruce
           |
   [cemetery back gate]
```

Sound bed: drip from the branches, a very low wind in the tops, the stream near the bridge. No birds at night. By day, now and then, a crow, and the bell of a cow from the fields far below.

### forest_shrine
@speaker: narration

> A little wooden house on a post. Inside, a plaster Virgin with a chipped nose.
> Fresh: a stub of candle and a sprig of fir.

### forest_shrine_night
@speaker: narration
?if: night >= 1

> The Virgin's face in the torchlight. Someone has turned her to face the path to the fort.
> She used to face the other way. There's a pale mark in the moss.

### forest_bridge
@speaker: narration

> Two planks over a stream. Black water, very fast, no sound but a hiss.

### forest_lost
@speaker: narration

Played if the player walks off the path for more than 20 m: the fog closes in and the path is lost. After 10 seconds the reporter turns back automatically.

> Every tree looks like the last one. I go back the way I came, I think.

## Night 1: the first sighting

Conditions: night 1, all three graves read, `met_raymond`, and Raymond has gone back down. The player stands anywhere in the back half of the cemetery.

A figure stands outside the walls, among the first spruces of the Bois-Noir, about 4.5 m past the back wall and a little right of the back gate. A few spruce trunks stand around the spot. It appears while the player is at least 13 m away, inside the fog, so it comes out of the fog as the player walks toward the back wall. It is visible only as a dark vertical shape with a paler oval where the face would be (the tan mask). A low drone swells in on the music bus as it appears, and the ambience has already dropped out.

Once the player has looked straight at it, it stands still and faces them, turning with them if they move. After a second the two lenses of the mask glow a faint cold green, brighten and go dark again over about two seconds. Six seconds after it was seen, it turns stiffly and walks away into the forest, slower than its usual walk, and the fog takes it. Four seconds later the back gate creaks open on its own. The drone holds for 20 seconds after it turns, then fades out over 12, or stops when the player leaves the cemetery.

### sighting_1
@speaker: narration
! set: first_sighting

> Someone was standing out there in the trees. Looking at me.
> The back gate is open. It wasn't open before. He's going into the forest.

The forest path is now open, and the notebook says to follow him into the forest. If the player goes back to the inn instead of following, the night still ends normally, but the reporter thinks: "I should have followed." (`skipped_follow`). The bunker is then first seen on day 2 by following the heifer's line of sight. Following is the intended path.

### Following

Two more glimpses on the forest path:

1. At about 150 m, the figure stands in the middle of the path at the edge of the torch beam, facing away. When the player gets within 12 m, it steps off the path to the right and is gone. There is no sound of it moving through the undergrowth.
2. At the shrine fork, the player hears footsteps on the right-hand path, slow, uneven, one heavier than the other, going away uphill. No figure.

Then the clearing and the barn.

## The fort: exterior

The "barn" is a concrete infantry fort from the 1940s, dressed as a hay barn. From 20 m in fog it is convincing: a steep roof of gray boards, plank walls with a hay door, a stone base. Close up, the planks are painted on concrete, the "hay door" is a steel shutter over a firing slit, and the roof boards are real wood over a concrete roof. A wooden front door, real, hangs half off its hinges. Behind it, a steel door painted green, a wheel handle, and a plate.

### fort_plate
@speaker: narration

> A small enamel plate on the steel door. "Ouvrage A 3417. Propriété de la Confédération."
> Somebody has scratched out "Confédération" and written "Commune" in marker.

{{Fortification A 3417. Property of the Confederation.}}

### fort_graffiti
@speaker: narration

> Graffiti on the concrete under the false planks. "KEVIN + SANDRA." "Nirvana." A smiley in a gas mask.
> Under it, small, in pencil: "il nous regarde." {{He's watching us.}}

### Night 1: the wedged door

### fort_door_night1
@speaker: narration
?if: night == 1
! set: found_bunker, bunker_door_wedged

> The wheel turns a quarter, then stops hard. Something holds the door from the other side.
> I put my ear to the steel.

After a 4 second pause: a single metal sound from deep inside, like a tin cup set down on concrete. Then nothing.

@speaker: narration
> ...
> I'm not going to stand here.

The return to the village is unscripted. On the way back the player hears, once, far off behind them, something that could be a cough through a rubber mask. See [07-scares.md](07-scares.md).

### Day 2: the open door

### fort_door_day2
@speaker: narration
?if: day >= 2, !bunker_door_open
! set: bunker_door_open, found_bunker

> The steel door stands open a hand's width. Last night it wouldn't move.
> On the floor inside, a wooden wedge, kicked aside.

The wedge can be picked up as a look-only object: "Fresh cut. Spruce. Someone made this with a knife."

## The fort: outer rooms

Concrete corridors 1.8 m wide and 2.1 m high, painted pale green to shoulder height, white above. Pipes and cable runs along the ceiling. Signs stenciled in German and French, as everywhere in the Swiss army. The air is cold and smells of wet concrete, diesel, and mold. There is no electric light; the player needs the torch even by day (`flashlight`). Daylight reaches only the first 5 m.

Sound: every footstep echoes. Water drips somewhere, always in the next room. A low hum that might be wind in the ventilation shafts.

```
  [entrance]--[gas lock]--[corridor A]---------------[corridor B]---------[casemate]
                             |                           |                (firing slit)
                         [guard room]              [dormitory]
                             |                           | (cupboard / K.P. 3 door)
                        [latrines]                 [mask store]
                                                         |
                                                   [machine room]
```

### Gas lock

Two steel doors 3 m apart. The inner one has a rubber seal and a small round window of thick glass.

### fort_gaslock_sign
@speaker: narration

> "GASSCHLEUSE / SAS À GAZ."
> "Les deux portes ne doivent jamais être ouvertes en même temps." {{Gas lock. Both doors must never be open at the same time.}}
> Both are open.

### Guard room

A small room with a wooden desk, a field telephone in a leather case, a wall chart of the valley under yellowed plastic, a metal locker, two chairs. Beer cans and candle stubs from teenagers. Cigarette butts.

### fort_phone
@speaker: narration

> A field telephone. A crank on the side. The wire goes into the wall and nowhere.
- [Turn the crank.] -> fort_phone_crank
- [Leave it.] -> fort_leave_it

### fort_phone_crank
@speaker: narration

> It whirs. Nothing rings. Of course nothing rings.

On day 2 this is all. On night 3, turning the crank makes a phone ring somewhere deeper in the fort, once (see [07-scares.md](07-scares.md), bunker night 3). The other end is the command room, where an old field phone still hangs on the line. Marc doesn't answer it.

### fort_leave_it
@speaker: narration

> No.

### fort_chart
@speaker: narration

> A chart of the valley. Fields of fire drawn in grease pencil, red fans across the slope.
> Leurs is a cluster of squares. The cemetery is marked with a cross.

### fort_logbook
@speaker: narration

> A guard logbook on the desk, swollen with damp.
> The last army entry: "1993. Contrôle annuel. RAS." {{Annual inspection. Nothing to report.}}
> Below it, in pencil, different hands. "Kevin était là 96." "Ici c'est le Loyon qui dort lol." {{Kevin was here. The Loyon sleeps here lol.}}
> And, much later, in small careful capitals: "NE TOUCHEZ PAS AU FOND." {{Don't touch the back.}}

### Latrines

Three stalls, steel bowls, a long trough sink. A mirror of polished steel, scratched. Nothing to find. A scare location (see [07-scares.md](07-scares.md)): the polished steel mirror shows a blurred shape behind the player when they look into it on day 2. When they turn, it's the hanging tent sheet on the opposite hook. On night 3 the tent sheet is gone.

### fort_mirror
@speaker: narration

> Polished steel instead of glass. It gives back a gray smear that is supposed to be me.

### fort_tentsheet
@speaker: narration
?if: night == 0

> An old army tent sheet on a hook. The camouflage of my grandfather's time. Damp, heavy, smelling of rubber.

### Casemate

The fighting room at the front. A heavy machine-gun mount without a gun, an embrasure (firing slit) with a steel shutter, open a crack. Through it, a strip of gray: the fog over the slope. On a clear day it would look down at the cemetery and the village.

### fort_embrasure
@speaker: narration

> A slit in the concrete. Nothing out there but gray.
> From here you would see the whole cemetery. Every grave. Every light.

### fort_embrasure_night3
@speaker: narration
?if: night == 3

> Far below, through the fog, one small red light. Daniel's lantern.

### Mask store

A long storeroom with steel shelves on both walls. The shelves have collapsed at one end and hundreds of old rubber gas masks lie in a heap on the floor, waist high, tan and gray, their round filter cans and eyepieces pointing every way. Old civil defense and army stock nobody took away. The reference image `gas-masks-on-floor.png` is the model.

### fort_masks
@speaker: narration

> Gas masks. Hundreds. Piled to my waist. Eyepieces everywhere, looking at the ceiling, at the wall, at me.
> Old rubber, the color of skin. Brown, tan, gray.
> His mask came from here. I'm almost sure of it.

### fort_masks_look
@speaker: narration
?if: day >= 2

> One shelf at the end is not collapsed. On it, masks laid out in a row, cleaned, the straps loosened. Five. Six.
> And a space where a seventh was.

The pile is a scare location. See [07-scares.md](07-scares.md), bunker day 2: the pile shifts and one mask slides down while the player has their back to it.

### Machine room

A diesel generator the size of a car, red paint peeling, its exhaust pipe going into the ceiling. A row of fuel drums. A control board of dead dials. A workbench with tools. A car battery on the bench with two wires running from it along the wall, held up with tape, into a hole drilled through the concrete toward the dormitory.

### fort_generator
@speaker: narration

> Dead for years. The fuel drums are empty. I tap one and it booms like a church bell.

(This sound carries through the whole fort. If the player does it on night 3, see the scares file.)

### fort_battery
@speaker: narration
?if: !found_hidden_door

> A car battery. Newer than anything else here. Two wires go from it along the wall and through a hole in the concrete.

### fort_battery_after
@speaker: narration
?if: found_hidden_door

> The wires go through the wall into the room behind the steel door. A light. He has a light in there.

Following the wires along the wall leads to the dormitory end wall, behind the cupboard. This is the second way to solve puzzle P4.

### Dormitory

A long room with two rows of triple metal bunks, the canvas long rotted out of most frames. A table, benches. At the far end, a tall steel cupboard, two meters high, olive green, stenciled "MATÉRIEL SANITAIRE / SANITÄTSMATERIAL".

### fort_bunks
@speaker: narration

> Twenty-four bunks. Twenty-four men slept here, waiting for a war that never came up this valley.

### fort_cupboard
@speaker: narration
?if: !looked_at_dust

> A medical supplies cupboard. Empty except for a roll of yellowed bandages.

### fort_dust
@speaker: narration
?if: !looked_at_dust
! set: looked_at_dust

> The floor is thick with dust everywhere. Except here.
> In front of the cupboard, the dust is swept away in a quarter circle. As if a door opened. As if the cupboard swung.

### fort_cupboard_push
@speaker: narration
?if: looked_at_dust, !found_hidden_door
! set: found_hidden_door

> I put my shoulder to it. It's on castors. It rolls aside with a long screech that goes all through the fort.
> Behind it, a steel door. Gray. A keyhole. A small stamped plate.
> "K.P. 3."

The door does not open. If the player has `bunker_key`, it does: see night 3.

### fort_hidden_door_locked
@speaker: narration
?if: found_hidden_door, !has_bunker_key

> Locked. Cold to the touch. There's a draft under it. It smells of candle smoke.

### fort_hidden_door_listen
@speaker: narration
?if: found_hidden_door, !has_bunker_key

> I listen at the door. Nothing.
> Then something. Very slow. Breathing? Or the wind in a shaft.

### fort_wrapper
@speaker: narration
! set: found_biscuit_wrapper

> A biscuit wrapper on the floor by the door. Army biscuits, the hard kind. The plastic is clean. This week's.

### fort_cupboard_back
If the player pushes the cupboard back into place (optional action), set `cupboard_restored`. veilleur's stage 3 post says "dont move the cupboard back. he will know" only as an unsettling line; restoring it has one effect: in the night 3 empty-room version, Marc's notebook has an extra line, "They put it back. Careful one."

## Day 2: the heifer

Conditions: day 2, `heifer_missing`, `!heifer_found`. From the Yerly farm the player goes through the gate behind the shed and up the field along a barbed-wire fence. 300 m up, the field ends at the forest edge.

The heifer Marquise stands at the forest edge, absolutely still, facing into the trees. Her bell does not ring because she does not move. Her breath steams. The player hears the bell only when they get close and she turns her head toward them.

### heifer_found
@speaker: narration
! set: heifer_found

> There she is. Brown, white face. Standing like a statue at the edge of the trees.
> She's staring into the forest. She doesn't look at me.

Then the beat: following her gaze, the player can see, 25 m into the trees, a dark vertical shape between two trunks. It might be a stump. If the player looks away and back, it is gone, and there was no sound. If the player walks toward it, it turns out to be a stump with a coat of moss. Then, from deeper in, a branch snaps. See [07-scares.md](07-scares.md), forest day 2.

### heifer_lead
@speaker: narration

> I take her by the collar. She comes, slowly, looking back over her shoulder the whole way down.

Marquise follows the reporter. When they reach the farmyard, Bernard's `bernard_heifer_back` plays.

If `skipped_follow` is set, the heifer is standing at the left branch of the shrine fork instead, and the bunker can be seen as a dark roofline up the right branch. The reporter thinks: "A barn. Up there in the trees. Why would anyone build a barn in a forest?"

## Day 3: the larch

`forest_deep` opens on day 3 after `read_gremaud_letter`. From the fort clearing, an animal track goes up the slope, 150 m. Halfway, the player passes the escape hatch: a square of concrete under a fallen spruce, with a rusted steel lid, closed. It has no handle on the outside.

### forest_hatch
@speaker: narration

> A concrete square in the moss, a steel lid. No handle on this side. An emergency exit.
> The moss around it is worn into a path.

At the top, a single larch, bare and golden in a forest of black spruce. At its foot, a long low mound of fieldstones, covered in moss, about 2 m long. At its head, a wooden cross made from two split branches bound with wire. Carved into the crosspiece with a knife:

```
J.-P. G.
14.I.1997
```

Beside it, a jam jar with a candle stub. Pine cones laid in a line along the stones.

### forest_grave
@speaker: narration
! set: found_forest_grave

> A larch. The only one. It stands out against the spruce like a lamp.
> Under it, stones. A long low pile of them, the length of a man.
> A cross made of branches. Letters cut into it with a knife.
> J.-P. G. The fourteenth of January, 1997.
> The syndic. He's been up here the whole time. Two hundred meters from the fort.

Hold. Total silence: the forest bed fades out completely for six seconds.

@speaker: narration
> Who buries a man in the forest and carves his initials?
> Someone who knew exactly who he was.

Notebook line: "Gremaud is under the larch. Someone buried him and marked it. Someone who goes up and down past that hatch every day."

Photographing it gives `photo_forest_grave` (strong evidence).

The game should let this read as murder. The letter says Gremaud had a weak heart, but the player has no reason yet to think that is what happened.

## Night 3: the hidden room

Conditions: night 3, `has_bunker_key`, `found_hidden_door` (if not found yet, the player must find it on the way in; the dust and the cupboard work the same at night).

On night 3 the fort is different. The tent sheet in the latrines is gone. The steel door of the gas lock is shut but not wedged. A faint warm light shows under the K.P. 3 door. The masks on the clean shelf: six. The seventh space is still empty.

At the K.P. 3 door the player has two actions: **Knock** and **Use key**.

### The knock

Knocking is a separate action. The game records the pattern: the player presses Knock, and the interval between presses decides grouping. A pause of 2 seconds or more counts as a "wait".

The correct pattern, from Gremaud's letter: three knocks, a wait, one knock.

- Correct pattern: `knock_pattern_done`. Go to `marc_door_voice`.
- Any other knocking: no answer, but the faint light under the door goes out. The player can still use the key. Marc is inside, in the dark, and the scene plays as `marc_dark_room`.
- No knocking, just the key: Marc is out. Go to `room_empty`.

### marc_door_voice
@speaker: narration
! set: met_marc

> Silence. Long enough that I think the room is empty.
> Then, on the other side of the steel, breathing. Slow. Through rubber.

@speaker: marc
> ...
> Jean-Pierre knocked like that.
> Jean-Pierre is dead.
- [I know. I read his letter.] -> marc_door_letter
- [I found the key in your grave.] -> marc_door_letter

### marc_door_letter
@speaker: marc
! set: marc_trust += 1

> ...
> Then you dug. You're the stranger from the inn.
> Step back from the door. To the bunks. I'll open it.

@speaker: narration
> I step back. The lock turns from inside. The door opens on darkness, and a candle somewhere behind.
> He's standing well back in the room. A shape. The cape. The mask. He doesn't come any closer.

-> marc_monologue_1

### marc_dark_room

The player knocked in a wrong pattern. The light went out. They unlock the door. The room is black. The torch beam finds the cot, the table, the shelves. No one. Then the beam reaches the far corner, and he is standing there, against the wall, completely still, masked, facing them. He has been there the whole time.

This is a version of jumpscare 3, without the sting: no music hit, only the player's own torch finding him. He does not move.

@speaker: narration
! set: met_marc, entered_hidden_room

> He's in the corner. Standing. Facing me.
> He was there in the dark the whole time I looked around.

@speaker: marc
> ...
> Put the light down. Not in my face.
> Please.

-> marc_monologue_1

### room_empty

The player unlocks the door without knocking. The room is lit by one candle on the table and empty. The player can explore it freely. See the room objects below. When the player has examined at least three objects, or after 90 seconds, whichever comes first, and turns back toward the door, Marc is in the doorway (jumpscare 3, see [07-scares.md](07-scares.md)).

### room_enter
@speaker: narration
! set: entered_hidden_room

> A key that hasn't turned in three years turns easily. It's been oiled.
> The door swings in. Warm air. Candle smoke. Someone lives here.

### marc_doorway
@speaker: narration
! set: met_marc

> He's in the doorway.
> I didn't hear him. Not a step.

@speaker: marc
> ...
> You found Jean-Pierre's key.
> Don't move. I won't either.

-> marc_monologue_1

## The hidden room: objects

The command room (Kommandoposten, "K.P."): 4 by 6 m, low ceiling, concrete. A field phone on the wall. A heavy table with a map under glass. A camp bed with army blankets, made tight, the corners square, the way the Legion taught. A camping stove and a pot. Shelves: tins, mostly empty; army biscuits; candles; a jerrycan of water. A bucket. A small electric bulb wired to the car battery, not on. A wooden crate used as a bedside table. A second door, steel, at the back: the escape tunnel.

On the wall over the bed, on a nail, a white képi in a plastic bag. On a hook by the door, a gas mask (in the empty-room version only; otherwise he is wearing it).

### room_bed
@speaker: narration

> A camp bed. The blanket is folded so tight you could bounce a coin on it.

### room_kepi
@speaker: narration

> A white cap in a plastic bag, hung on a nail like a picture. A képi blanc. The Legion.
> Kept clean. Kept out of the damp.

### room_mask_hook
@speaker: narration
?if: !knock_pattern_done, !met_marc

> A gas mask on a hook. Tan rubber. The inside of the eyepieces is fogged, as if someone took it off just now.
> He has more than one face.

### room_shelves
@speaker: narration

> Tins. Most of them empty, washed, stacked. Army biscuits. A bag of potatoes from the Chassot garden, I'd bet.
> A tin of five-franc and two-franc coins.

### room_map
@speaker: narration

> A map of the valley under glass. On the glass, in grease pencil, lines. Paths. Times.
> "R. 21:00 - 02:00, toutes les 1h30." {{R. 9 pm to 2 am, every hour and a half.}} Raymond's rounds.
> "Samedi: D." {{Saturday: D.}} Daniel.

### room_photo
@speaker: narration
! set: give: photo_boys

> A photograph propped against the candle. Two boys on a moped by the village fountain, grinning. Summer.
> On the back, in pencil: "Marc et Dani, 1972."

Full description in [06-documents.md](06-documents.md#photo_boys).

### room_notebook
@speaker: narration
! set: read_marc_notebook

> A school exercise book. Pencil. Small square capitals. Each page is a date.

Full text in [06-documents.md](06-documents.md#doc_marc_notebook). The last pages are about the reporter, with small drawings of them: at the cemetery with the torch, at the barn door, digging. The reporter's face is left blank in every drawing.

@speaker: narration
> He drew me. At the stones. At the door. With the shovel.
> He left my face empty.

### room_ring
@speaker: narration
! set: saw_ring

> A small round tin, a throat pastille tin. Inside, on cotton wool, a gold wedding ring.
> Engraved inside: "J-P - O 1958."
> A slip of paper folded around it: "Pour Odile. Un jour." {{For Odile. One day.}}

### room_notes_gremaud
@speaker: narration

> A bundle of notes on squared paper held with a rubber band. The syndic's handwriting. Lists. Messages.

Full text in [06-documents.md](06-documents.md#doc_gremaud_notes).

### room_phone
@speaker: narration

> An army field phone on the wall, the twin of the one in the guard room.

## Marc's monologue

Marc stays masked for the whole scene. He never takes the mask off, never comes within 3 m of the reporter, and never touches them. He stands or, later, sits on the edge of the bed. His voice is low and muffled by the mask, with the slow intake and outflow of the filter between lines. He speaks short sentences. French slips in when he is moved. He speaks Swiss French, with a Legion habit of clipped commands now and then.

The speaker label shows "Le Loyon" until `marc_named` is set, then "Marc".

Breathing: play a respirator breath (in, out, about 4 seconds) between nodes. Where a line is just "...", hold for that breath.

If the player has `food_parcel`, the first choice of `marc_monologue_1` includes giving it.

### marc_monologue_1
@speaker: marc

> So. You followed the stories all the way down.
> You came for a ghost. The thing they call Le Loyon.
> I suppose you've earned the truth. Coming this far. Digging.
- [Who are you?] -> marc_name
- [I brought bread. And cheese.] ?if: has_food -> marc_food
- [Did you kill Jean-Pierre Gremaud?] ?if: found_forest_grave -> marc_gremaud_accused

### marc_food
@speaker: marc
! set: marc_trust += 1, take: food_parcel, has_food = false

> ...
> Put it on the table.

@speaker: narration
> I put it on the table and step back. He doesn't touch it. But his head turns to it, and stays turned.

@speaker: marc
> Jean-Pierre brought Gruyère. The salty kind. Every Tuesday.
> Merci.
-> marc_name

### marc_name
@speaker: marc
! set: marc_named

> You read the name on the stone. Marc Chassot.
> He died in the war. That's the official story. The easier story.
> The truth is I lived. If you can call it that.
-> marc_legion

### marc_legion
@speaker: marc

> I left here at twenty. I was angry at everything. My father, the cows, the fog.
> I went to Marseille and signed. The Legion gives you a new name. Nobody asks.
> Marc Challand. Belgian. Seventeen years. Chad, Lebanon, the Gulf. Sarajevo in '93. Then Sarajevo again.
- [What happened in Bosnia?] -> marc_bosnia
- [The disc in the coffin. CHALLAND.] ?if: has_legion_tag -> marc_tag

### marc_tag
@speaker: marc

> I gave it to Jean-Pierre to bury. A man should be buried with his name.
> Even if it's the wrong one.
-> marc_bosnia

### marc_bosnia
@speaker: marc

> August '95. The mountain above the city. A road. A truck. A shell.
> Two of my men burned. I was thrown clear. My face. My hands. My ears.
> ...
> I don't tell the rest. I'm sorry. Not because it's secret. I can't.
-> marc_after

### marc_after
@speaker: marc

> I walked away in the dark. I don't know why. I didn't decide. My legs decided.
> Nine weeks. Croatia, Slovenia, Austria. Lorries. Barns. I don't remember much.
> I came here because it was the only place I could find with my eyes shut.
> I knocked on my godfather's door at two in the morning. He opened it in his pyjamas.
-> marc_war_inside

### marc_war_inside
@speaker: marc

> The war doesn't stay over there. It comes with you. It chews you up and leaves what's left.
> It isn't only the face. It's the head. The noise. The shaking. The same five seconds, again and again.
> A door slams in the village and I'm on the floor. A car backfires and I'm on that road.
> You come back. But you're not the man who left. That man is up there under the stone.
- [Why didn't you get help? A doctor?] -> marc_help
- [Why the mask?] -> marc_mask

### marc_help
@speaker: marc

> A doctor needs a name. A name needs papers. Papers say deserter. And a Swiss in a foreign army.
> The French would want me for leaving. The Swiss would want me for going.
> And they'd all want to look at me.
> I couldn't. I still can't.
-> marc_mask

### marc_mask
@speaker: marc

> The mask.
> When people see the mask, they look at the mask. They don't look for me.
> Inside it there's only rubber and charcoal. No smoke. Nothing else gets in.
> And I can walk. The forest is the only place that holds still. I walk there all night.
> I can go to certain places. Stand by certain people. Without questions. Without pity.
-> marc_daniel

### marc_daniel
@speaker: marc

> Daniel found me. Spring '96. In the forest. He knew me by my walk. He laughed and cried at the same time.
> He came every Sunday. Brought the newspaper and talked. About nothing. Cows. Football.
> He never asked about the war. Not once.
> Then one Sunday he didn't come.
> ...
> I knew what it looked like, a man going under. I'd seen it in men in Calvi. I saw it in him. I said nothing.
> I couldn't go to his funeral. So I light his lantern. On Saturdays. It's the only thing I can do.
- [It wasn't your fault.] -> marc_daniel_fault
- [Say nothing.] -> marc_daniel_silence

### marc_daniel_fault
@speaker: marc

> Everyone says that to everyone. It doesn't help anyone. But thank you.
-> marc_mother

### marc_daniel_silence
@speaker: narration
! set: marc_trust += 1

> I don't say anything. He nods, as if that was the right answer.

-> marc_mother

### marc_mother
@speaker: marc

> My mother died in June '96. She thought I was dead. Jean-Pierre wanted to tell her.
> I said no. I didn't want her to see me like this. That was my choice. A bad one.
> I watched them bury her from the trees. Next to my coffin.
> That's my grave you see me at. Hers. Mine. The same stone.
-> marc_gremaud

### marc_gremaud_accused
@speaker: marc

> ...
> You found the larch.
> No. I'll tell you. But not first. First you hear the rest.
-> marc_name

### marc_gremaud
@speaker: marc

> Jean-Pierre.
> He brought food twice a week for fourteen months. Tuesdays and Fridays. Snow, rain, fog.
> He made the funeral. The empty box. He lied to the abbé, to the village, to his wife. For me.
-> marc_gremaud_2

### marc_gremaud_2
@speaker: marc

> January '97. A Tuesday. Heavy snow. He didn't come.
> At first light I went down the path. He was lying in the snow two hundred meters from the door.
> Rucksack still on. Bread, cheese, the newspaper. His heart. He'd told me. He had pills.
> He was cold. Hours already.
- [And you didn't tell anyone.] -> marc_gremaud_3
- [You could have carried him down to the village.] -> marc_gremaud_3

### marc_gremaud_3
@speaker: marc

> Carry the syndic into the square on my back? In this?
> I carried him inside. I sat with him. The snow covered our tracks. They searched for five days.
> They came to the door. I heard them. I didn't open.
> In March, when the ground was soft, I buried him under the larch.
> He liked larches. They lose their needles and come back.
> I've kept his ring. For Odile. I never found a way.
- [I believe you.] -> marc_believe ! set: marc_trust += 1
- [How do I know that's true?] -> marc_doubt

### marc_believe
@speaker: marc

> ...
> Thank you.
-> marc_bunker

### marc_doubt
@speaker: marc

> You don't. Nobody can know now. Only him and me were there.
> That's why I can't be found.
-> marc_bunker

### marc_bunker
@speaker: marc

> So Le Loyon was born. A man in a mask. A thing in the woods. Something to laugh about in the café.
> This bunker is quiet. It's safe from the world. Safe from the past, sometimes.
> Not always.
-> marc_photo_ask

### marc_photo_ask
@speaker: marc

> You have a camera. I've seen it round your neck.
- [May I take your picture? Just the mask.] ?if: marc_trust >= 2 -> marc_photo_request
- [May I take your picture? Just the mask.] ?if: marc_trust < 2 -> marc_photo_refused
- [I won't photograph you.] -> marc_photo_no ! set: marc_trust += 1
- [Raise the camera without asking.] -> marc_photo_forced

### marc_photo_request
@speaker: marc
?if: marc_trust >= 2
! set: marc_photo_consent, give: photo_marc_masked

> ...
> The mask. Not the room. Not the hands.
> The mask is Le Loyon. It isn't me.

@speaker: narration
> He stands still. The flash. For an instant the room is white, and he's a shape cut out of paper.
> The Polaroid slides out, gray. I don't look at it yet.

-> marc_request

### marc_photo_refused
@speaker: marc
?if: marc_trust < 2

> No.
> Put it away.
- [Put it away.] -> marc_request
- [Take it anyway.] -> marc_photo_forced

### marc_photo_no
@speaker: marc

> ...
> Thank you.
-> marc_request

### marc_photo_forced
@speaker: narration
! set: took_forced_photo, give: photo_marc_forced, marc_trust = 0

> I raise the camera. The flash.
> He turns away from it with his arm over the mask, very fast. The fastest I've seen him move.
> The Polaroid slides out. He stands with his back to me.

@speaker: marc
> Go.
> Take your picture and go. The tunnel's at the back. It comes out in the forest.

The scene ends. `has_ring` is not given. The player leaves through the tunnel. Go to [Dawn](#dawn).

### marc_request
@speaker: marc

> You've found a secret that was kept for a long time. Now I have to ask you to keep it.
> Let Marc Chassot stay dead and buried. Let the village have its history. A son who fell far away.
> And let them have their mystery too. Le Loyon. A thing in the fog. It does something for them, I think.
> Or maybe he's just a habit this old soldier can't break.
-> marc_request_2

### marc_request_2
@speaker: marc

> Keep the secret. Don't tell anyone who I am. Let the legend go on.
> Can you do that? Can you walk away and let the ghost keep walking?
- [I don't know yet.] -> marc_ring_route
- [I'll think about it.] -> marc_ring_route
- [I have a job to do.] -> marc_ring_job

### marc_ring_job
@speaker: marc

> I know. I had one too.
-> marc_ring_route

### marc_ring_route
-> marc_ring ?if: marc_trust >= 1, saw_ring
-> marc_ring_unseen ?if: marc_trust >= 1, !saw_ring
-> marc_goodbye

### marc_ring
@speaker: marc
?if: marc_trust >= 1, saw_ring

> One more thing. The tin by the candle. Jean-Pierre's ring.
> Whatever you decide. Give it to Odile. Don't tell her where you got it. Tell her he wasn't alone, after.
- [I'll take it to her.] -> marc_ring_take
- [I can't.] -> marc_goodbye

### marc_ring_take
@speaker: narration
! set: has_ring, give: ring

> He doesn't hand it to me. He nods at the tin. I pick it up myself. It weighs almost nothing.

-> marc_goodbye

### marc_ring_unseen
@speaker: marc

> One more thing. There's a tin by the candle. Jean-Pierre's ring.
> Whatever you decide. Give it to Odile. Don't tell her where you got it. Tell her he wasn't alone, after.
- [I'll take it to her.] -> marc_ring_take
- [I can't.] -> marc_goodbye

### marc_goodbye
@speaker: marc

> Go out through the tunnel. Not the front. Raymond's dog doesn't come this side.
> It'll be light soon. The fog will hold till noon.
> ...
> Adieu. {{Goodbye.}}

@speaker: narration
> He sits down on the edge of the bed with his back to me. His hands on his knees. He doesn't move again.

## Dawn

The escape tunnel: 60 m of low concrete pipe, the player crouched (forward movement slowed). Water underfoot. Iron rungs up to the hatch. It opens from inside with a wheel. The forest at first light, gray, the fog brightening without a sun. The player walks down past the larch (if found), the fort, the shrine, the cemetery. The lantern on Daniel's grave has burned out.

### dawn_cemetery
@speaker: narration

> The lantern's out. The stones are wet. Somewhere down in the village, a tractor starts.

Then the inn, the stübli, the phone.

## The ending call

Friday 20 November, 8:10. The inn's stübli. Monique has left coffee. The notebook is open on the desk with everything the reporter has written. The phone on the wall.

The reporter dials the newspaper. The editor answers on the second ring.

### ending_call
@speaker: editor
?if: met_marc

> L'Écho, Aebischer.
> It's you. Well? I've got a page with a hole in it.
- [I've got him. Le Loyon has a name.] -> ending_publish_confirm
- [There's nothing here. Run the fog.] -> ending_secret_confirm

### ending_publish_confirm
@speaker: narration

> His name. The Legion. The empty coffin. The syndic under the larch. All of it.
> Once I say it, it's out. I can't take it back.
- [Read it to her.] -> ending_publish_route ! set: ending_publish
- [Wait.] -> ending_call

### ending_secret_confirm
@speaker: narration

> A page of fog and folklore. No name. No photo. A man in a mask that nobody can find.
- [Tell her.] -> ending_secret_go ! set: ending_secret
- [Wait.] -> ending_call

### ending_publish_route
-> ending_publish_go ?if: has_evidence
-> ending_publish_go_weak

### ending_publish_go
@speaker: editor
?if: has_evidence

> ...
> Say that again. The whole thing. Slowly. I'm writing.
> That's the front page. Not the supplement. The front.

### ending_publish_go_weak
@speaker: editor
?if: !has_evidence

> And you've got what? A story from a man in a mask, in the dark. No picture. No paper.
> I'll run it. Page nine. "Questions in Leurs." The lawyers will cut half.

### ending_secret_go
@speaker: editor

> Nothing at all?
> ...
> All right. Eight hundred words of fog. You'd better make it beautiful.

## Ending: publish

### Front page

Shown as a full-screen newspaper page: gray newsprint, black type, a halftone photo. The masthead is *L'Écho*. Date: Saturday 21 November 1998. The article is in English for the player (as if translated) with the French place names kept.

Photo choice, in order of preference: `photo_marc_masked`, `photo_marc_forced`, `photo_hidden_room`, `photo_forest_grave`, `photo_empty_coffin`. The halftone shows the Polaroid. Caption follows the photo.

Headline and text (if `has_evidence`):

```
L'ÉCHO                                   Saturday 21 November 1998

          "LE LOYON" HAS A NAME
   Soldier buried in 1995 has been living in an army fort above his village

LEURS (FR) - For three years the people of Leurs have joked about
a man in a gas mask who walks in the Bois-Noir forest at night.
They call him Le Loyon. This week L'Écho met him. He is Marc
Chassot, 40, born in Leurs, whom the village buried on 18 November
1995 as a soldier killed abroad.

Chassot left Leurs in 1978 and joined the French Foreign Legion
under an assumed name, as the Legion allows. He served for
seventeen years. In August 1995, with French UN troops near
Sarajevo, he was badly burned when a shell hit his vehicle. He
was listed as missing, presumed dead. He was not dead. He walked
home.

The coffin that four men of the village carried up the hill in
1995 was empty. L'Écho has seen it. The late syndic,
Jean-Pierre Gremaud, arranged the funeral and hid Chassot in a
disused army fort that the commune had bought in 1994. Serving in
a foreign army is a crime under Swiss military law.

Gremaud disappeared in January 1997. L'Écho has found a grave in
the forest above the fort, marked with his initials. Chassot
says Gremaud died of a heart attack in the snow while bringing
him food, and that he buried him because he could not go for
help without giving himself up. There is no way at present to
confirm this. The cantonal police were informed on Friday.

Chassot suffers from the effects of war trauma. He asked that his
story not be told.

Abbé Louis Overney, curé of Leurs since 1968, declined to
comment. "There are things a priest may not say," he said.

                                                         (réd.)
```

Caption, by photo:

| Photo | Caption |
|---|---|
| `photo_marc_masked` | "Le Loyon": Marc Chassot in the fort where he has lived since 1995. |
| `photo_marc_forced` | Marc Chassot turns away from our photographer. |
| `photo_hidden_room` | The room in the Bois-Noir fort where Marc Chassot lives. |
| `photo_forest_grave` | A grave in the forest above Leurs, marked "J.-P. G." |
| `photo_empty_coffin` | The empty coffin in the Chassot family grave. |

If `grave_left_open`, add a paragraph after the third: "On Wednesday night the grave was opened. The gendarmerie in Romont is investigating." The reporter knows who opened it. The paper doesn't say.

If `took_forced_photo`, delete the sentence "He asked that his story not be told." and replace it with "He refused to be photographed."

### Front page, weak version

If `!has_evidence`, show a small item on page 9 instead:

```
QUESTIONS IN LEURS

LEURS (FR) - Is the "Loyon" of Leurs a soldier the village
buried in 1995? A man who says he is Marc Chassot, a former
Foreign Legion sergeant declared dead in Bosnia, told L'Écho
he has lived in the woods above the village for three years.
The commune and the parish declined to comment. (réd.)
```

### Epilogue: publish

White text on black, one paragraph per screen, advancing on a button press. Use these, with the conditional lines in place.

```
On Monday the cantonal police went up to the Bois-Noir fort
with the commune's new syndic and a locksmith.

The room behind the steel door was empty. The bed was made,
the blanket folded tight. The candles were gone. The white cap
was gone. There was no mask on the hook.
```

```
They found Jean-Pierre Gremaud under the larch.
The autopsy could say very little after two years. It found no
sign of violence. The case was left open.

Odile Gremaud buried her husband in the cemetery on a Thursday,
under the stone that says Nous t'attendons.
```

If `has_ring`:

```
You never gave her the ring. You couldn't think of a way to
face her after the article. It is in a drawer in your flat,
in a throat pastille tin.
```

```
The military justice office opened a file on Marc Chassot for
foreign military service. The French embassy asked for details.
Neither found him.

The lantern on Daniel Menoud's grave was never lit again.
```

```
Your article was picked up by two national papers and a
television channel in France. Reporters came to Leurs with
cameras for a week. Nobody in the village would speak to them.

Monique Rossier wrote to the newspaper asking it to stop
sending people. The letter was not printed.
```

Then the board, stage 6, publish version. Show the board index with these new threads at the top:

```
* LE LOYON = SOLDIER!!! (newspaper) - Kamikaze 11/21/98
    * Re: LE LOYON = SOLDIER!!! - Billy 11/21/98
    * Re: LE LOYON = SOLDIER!!! - kjhhjahsf 11/21/98
* (no subject) - veilleur 11/22/98
```

**LE LOYON = SOLDIER!!! (newspaper)**, Kamikaze, 11/21/98:

```
Did you see L'Echo today??? Front page. Its a real guy. An
ex Legion soldier from the village. They BURIED him!!!!
We were right!!! This board was right!!!

-= Kamikaze =-
  "the truth is in here"
```

**Re: LE LOYON = SOLDIER!!!**, Billy, 11/21/98:

```
OK I was wrong. A Swiss in the Legion. Poor guy actually.
Now everybody will go there with cameras.

Billy  |  http://members.netcity.ch/billy/  |  ICQ 3318204
```

**Re: LE LOYON = SOLDIER!!!**, kjhhjahsf, 11/21/98:

```
told u it was a guy

sdfsdf
```

**(no subject)**, veilleur, 11/22/98:

```
he's gone. i went up to the barn sunday. the door was open.

you could have left him alone.
```

Final image: the fog over a field somewhere else, months later. One last board post, dated March 1999, from a new user:

```
* weird guy in gas mask, Jura, near Saignelegier?? - lili_77 03/14/99
```

Fade out. Credits.

## Ending: keep the secret

### The column

Shown as a small newspaper column in the Saturday supplement, page 14, with a photo of the fog over the village square (any `photo_misc` of the village, or a default image of the fountain).

```
STRANGE SWITZERLAND

THE FOG OF LEURS

LEURS (FR) - In November the stratus settles on the
Fribourg plateau like a lid, and in Leurs, a village of 312
souls, it stays. You can stand in the square and not see
the church.

People here will tell you about a man in a gas mask who
walks in the forest at night. They call him Le Loyon. They
say it with a smile, the way you talk about the weather.

I went looking for him for three days. I found a good inn,
a patient priest, a dairy that sells the best bread in the
canton, and graves that are kept with great care.

If there is someone in those woods, he does no harm. Leave
him the fog.                                          (réd.)
```

### The forum post

A week later. The reporter is at home again, at the same desk, the same PC, the same rain. The scene returns to the prologue room, with the bag unpacked on the floor. The board has reopened registration.

The player watches the reporter type a post (the text appears letter by letter at typing speed; the player presses a button to advance). Username: **brouillard** ("fog").

```
                          Le Loyon - I went

Posted by brouillard on November 28, 1998 at 23:40:12:

Hi. I'm the journalist some of you talked about.

I went to the village. I stayed three nights. I walked
in the forest and I sat in the cemetery and I read
every stone.

There is nothing for you there. It's fog and cows and old
people who want to be left alone. The man in the mask is a
story they tell, and they tell it better than we do.

Please don't go. Please stop posting the name of the
village. Some things are better as a story.

Thank you to the one who watched. You know who you are.

brouillard
```

After the player "posts" it, the board shows it at the top, and after a few seconds a follow-up appears.

**Re: Le Loyon - I went**, veilleur, 11/29/98, 02:51:30:

```
merci.

saturday the lantern was lit. same as always.
```

If `has_ring`, add a second line to veilleur's post:

```
and there was a new one. on the syndic's stone. madame
gremaud puts it there now. she doesnt say why.
```

**Re: Le Loyon - I went**, kjhhjahsf, 11/29/98:

```
so u found nothing. lame

sdfsdf
```

### Epilogue: keep the secret

```
You never told anyone. Not Ruth, not your friends, not the
police. Some nights you think about the larch, and about how
you have only his word for what happened there.
```

If `has_ring`:

```
You posted the ring to Odile Gremaud in a padded envelope
with no return address, and a note in capitals:

  HE WAS NOT ALONE, AFTER. HE WAS BRINGING BREAD TO A FRIEND.

In December, a lantern appeared on the stone that says
Nous t'attendons.
```

If `took_forced_photo`:

```
The Polaroid of a man turning away is in a drawer. You have
taken it out twice. You have never shown it to anyone.
```

If `photo_marc_masked` is held and `!took_forced_photo`:

```
The Polaroid of the mask is pinned above your desk. Visitors
ask what it is. You tell them it's a Swiss legend.
```

Final image: the cemetery at night, seen from the forest wall, from Marc's viewpoint. Daniel's lantern burns. The camera holds for ten seconds. Breathing through a mask, once. Fade out. Credits.

## Ending: leave

Triggered at the bus stop before `met_marc` (see [02-village.md](02-village.md#square_busstop)).

The player boards the PostBus and sits in the back seat, facing the rear window. The bus pulls away from the fountain. The village fades in the fog. As the road passes the edge of the Yerly field, a figure stands at the forest edge, far away, the cape, the pale oval of the mask, perfectly still. It is there for three seconds. The bus goes round a bend. There is no music.

### leave_epilogue
@speaker: narration

> I don't turn around in my seat. I don't want to know if it's still there.

Then text on black:

```
You wrote eight hundred words about the fog and the folklore.
Ruth ran them on page 14, under the horoscope.

Nobody in Leurs read them.
```

If `opened_coffin`:

```
You still have a key with a brass tag stamped K.P. 3. You
don't know what it opens. You know exactly what it opens.
```

If `found_forest_grave`:

```
Some nights you think about the larch, and the stones, and
the initials cut with a knife. You never told anyone.
```

The board, stage 6, leave version:

**(no subject)**, veilleur, 11/20/98:

```
the journalist left on the bus.

he watched it go. from the yerlys field. i think he was glad.
```

Fade out. Credits.
