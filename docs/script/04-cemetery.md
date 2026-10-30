# The cemetery

The path up the hill, the graves and their inscriptions, Raymond Bapst and his dog, the digging sequence, the empty coffin, and the key. Dialogue convention: see [00-overview.md](00-overview.md#dialogue-convention).

## The path up

A gravel path climbs 300 m from behind the church in three switchbacks between wet meadows and a barbed-wire fence. Halfway up, a wooden wayside cross with a tin Christ and a jam jar of plastic flowers. By day the village vanishes behind the player after the first bend. At night the path is black except for the torch.

### path_cross
@speaker: narration

> A wayside cross. Someone has tied a rosary to the foot of it. The beads are wet.

### path_forest_blocked
@speaker: narration
?if: !first_sighting

> The path goes on past the cemetery into the forest. In this fog I'd lose myself in a minute.

## Layout

A rectangle about 40 by 25 m on the hilltop, surrounded by a waist-high stone wall with moss on top. An iron gate at the front (south, facing the village) that squeals on its hinges. A narrow back gate in the north wall opens onto the forest path. The Bois-Noir spruce stands right behind the north wall, so the back row is always in shadow.

About 40 graves in five rows, with gravel paths between them. Graves in Swiss cemeteries are cleared after about 25 years, so almost all the stones date from after 1970. Five old stones from the 1800s are fixed against the inside of the west wall, saved when their graves were cleared.

Near the gate stands a small stone ossuary from the 1700s, now the gravedigger's shed: a wooden door that doesn't lock, a barred window, tools, a wheelbarrow, a stack of wooden crosses for new graves. It is the main hiding place during the dig.

A water tap and a green watering can on a chain by the gate. A bin for dead flowers.

Lighting at night: none, except the grave lanterns. Most are dark. Marc lights Daniel's lantern on Saturdays. This week he also lights it on Tuesday (night 1) and Thursday (night 3), because a stranger is in the village and he is restless. It is dark on night 2. Raymond notices the change.

```
            N  (Bois-Noir spruce right behind the wall)
   +------------[back gate]-----------------------------+
   | CHASSOT plot      [Python]   [Kolly]   [Yerly M-L] |  row 5 (back)
   |                                                    |
   | old  [Bapst Léa]  [Overney  ]  [Clément]  [ ... ]  |  row 4
   | wall [GREMAUD stone]        [ ... ]     [ ... ]    |  row 3
   | stones                                             |
   | [MENOUD Daniel]  [ ... ]  [ ... ]  [ ... ]         |  row 2
   |                                                    |
   | [ossuary/shed]  [ ... ]  [ ... ]  [tap] [bin]      |  row 1
   +---------------------[front gate]-------------------+
                           S  (path down to the village)
```

## Inscriptions

The game shows the French inscription on screen as it appears carved or painted. A translation appears in small type underneath. Notes below explain the choices.

### The three graves

#### grave_menoud

A gray granite stone, upright, polished on the face, rough on the sides. A small oval enamel photo of a smiling man with a mustache. A red glass grave lantern with a brass lid on the gravel in front. Heather in a pot.

```
DANIEL MENOUD
7.7.1958 - 8.12.1996

Repose en paix, petit frère.
```

Translation: "Rest in peace, little brother."

Note: chosen by Christine. The plainness is the point. There is no reference to how he died.

Reading sets `read_grave_menoud`.

### grave_menoud_lantern
@speaker: narration
?if: night == 1
! set: saw_lantern_lit

> The lantern is lit. A new candle, burned down a finger's width. Someone was here less than an hour ago.

### grave_menoud_lantern_dark
@speaker: narration
?if: night == 2

> The lantern is dark. Cold wax.

### grave_menoud_lantern_night3
@speaker: narration
?if: night == 3

> Lit again. Tonight he came here first.

#### grave_gremaud

A low, flat, pale stone set in gravel, new, sharp-edged, with no photo. A pot of white chrysanthemums, fresh. In front of it, no lantern.

```
À LA MÉMOIRE DE
JEAN-PIERRE GREMAUD
SYNDIC DE LEURS 1971 - 1997
né le 2.5.1932
disparu le 14.1.1997

Nous t'attendons.
```

Translation: "In memory of Jean-Pierre Gremaud. Syndic of Leurs 1971 to 1997. Born 2 May 1932. Disappeared 14 January 1997. We are waiting for you."

Note: "disparu" (disappeared) instead of a death date. "Nous t'attendons" is Odile's choice; it can be read as "we're waiting for you to come home" or as the Christian "we'll meet again". Both fit her.

Reading sets `read_grave_gremaud`.

#### grave_chassot

The family plot in the back row, in the corner where the north and west walls meet. A dark stone, older, with a cast bronze cross on top gone green. Two grave beds side by side under one stone, edged with granite curbs: the left bed has gravel and a dead geranium; the right bed (Thérèse) has a fresher look, with a small bush of heather. The stone carries four names. Émile's and Thérèse's are cut in the original lettering. Marc's line was added in 1995 in slightly newer, sharper letters. Thérèse's death date was added in 1996.

```
FAMILLE CHASSOT

ÉMILE    1929 - 1977
THÉRÈSE née KOLLY    1931 - 1996

MARC    1958 - 1995
Tombé loin des siens.
```

Translation: "Chassot family. Émile 1929-1977. Thérèse née Kolly 1931-1996. Marc 1958-1995. Fallen far from his own."

Note: Thérèse chose "Tombé loin des siens" in 1995, a common phrase for men who died abroad. The ground in front of Marc's side is slightly lower than Thérèse's, and the moss on its curb has been worn by someone standing at the same spot: two shallow boot prints in the gravel at the foot of the plot, always there.

### grave_chassot_look
@speaker: narration
?if: !read_grave_chassot
! set: read_grave_chassot

> Two boot prints in the gravel at the foot of the grave, pressed deep. Someone stands here a long time.

### grave_chassot_look_again
@speaker: narration
?if: read_grave_chassot

> "Tombé loin des siens." Fallen far from his own. And buried right beside them.

### The other graves

These give the cemetery a real population and some of them tie into the village. Each has a short inscription and an optional narration line when examined.

| Id | Inscription (French) | Translation | Narration on look |
|---|---|---|---|
| `grave_yerly_ml` | MARIE-LOUISE YERLY-BAPST / 1937 - 1995 / Ta bonté reste avec nous. | "Your kindness stays with us." | "Fresh flowers. Bernard's wife, I suppose." |
| `grave_kolly_ernest` | ERNEST KOLLY / 1909 - 1995 / Doyen de Leurs | "Oldest man in Leurs." | "86 years in one village." |
| `grave_bapst_lea` | A small white wooden cross, a ceramic angel. LÉA / 4.3.1997 - 7.3.1997 | | "Three days. A plastic windmill in the gravel, turning." (The windmill turns with no wind. It's a draft through the wall. It still turns.) |
| `grave_python_joseph` | JOSEPH PYTHON / 1911 - 1997 / Priez pour lui | "Pray for him." | "A photo of a man with an enormous mustache and a cow." |
| `grave_clement` | FAMILLE CLÉMENT / AGNÈS MENOUD-CLÉMENT 1930 - 1989 | | "Daniel's mother, maybe." |
| `grave_overney_marie` | MARIE OVERNEY / 1902 - 1984 / Mère de notre curé | "Mother of our parish priest." | "The abbé's mother. He'd have buried her himself." |
| `grave_rossier_andre` | ANDRÉ ROSSIER / 1944 - 1990 / Aubergiste | "Innkeeper." | "Monique's husband. Someone keeps it very neat." |
| `grave_misc_1` to `grave_misc_8` | Plain family stones: GRANDJEAN, KOLLY, YERLY, BAPST, PYTHON, DOUSSE, CLÉMENT, MAURON with dates from 1972 to 1994. | | No narration. |

#### The old stones on the west wall

Five weathered sandstone slabs set into the wall. Partly readable.

| Id | Inscription | Translation |
|---|---|---|
| `oldstone_1` | ICI REPOSE / ANNE-MARIE GRANDJEAN / GUÉRISSEUSE / 1821 - 1887 / ELLE SOIGNAIT LES AUTRES | "Here lies Anne-Marie Grandjean, healer, 1821-1887. She cared for others." |
| `oldstone_2` | J. B. CHASSOT / SYNDIC / 1798 - 1861 | "J. B. Chassot, syndic." (The Chassots were syndics before the Gremauds.) |
| `oldstone_3` | ... ENFANTS DE LA FAMILLE KOLLY / DIPHTÉRIE 1887 | "...children of the Kolly family. Diphtheria, 1887." |
| `oldstone_4` | Unreadable. A cross and a skull, worn smooth. | |
| `oldstone_5` | PRIEZ POUR NOUS QUI AVONS ÉTÉ CE QUE VOUS ÊTES | "Pray for us, who were what you are." |

The healer's stone is a nod to the earlier CLI game. The epidemic is diphtheria, not plague, which fits 1887 Switzerland.

## Raymond Bapst, the watchman

68. Retired forest warden (garde forestier) of the commune. Also the gravedigger for 30 years: he dug the graves of Marc's empty coffin, Thérèse, and Daniel. Thick green loden coat, a peaked cap, a big rubber torch, a thermos of coffee with kirsch. His dog Bari is a tired old Bernese mountain dog cross with a bell on the collar.

Since All Saints 1997 the commune council has asked him to walk past the cemetery at night, because of the lantern and because flowers kept being moved. He does it every night from nine to two. He tells himself he does it for the council. He does it because he wants to see who lights Daniel's lantern.

He is gruff, slow, and not stupid. He is frightened of the forest at night and would never admit it.

### The round

The round is a loop the level builder can time:

1. Raymond comes up the path from the village (torch beam visible through the fog from 30 m away, swinging).
2. Enters by the front gate (squeal).
3. Walks the central path to the back row, shines the torch along the back wall and at the Chassot plot for 5 seconds, then at Daniel's lantern.
4. Walks out through the front gate and down the far side of the hill, then back up the path after a wait.

| Night | Loop time (real) | Notes |
|---|---|---|
| 1 | One pass only, scripted | Introduction. He talks to the reporter. |
| 2 | 90 s, 70 s after `dug_gremaud_stone` or after the reporter is warned | The dig. |
| 3 | No round | He's in the café, because of the open grave or, if refilled, because Monique gave him a second kirsch. The cemetery is empty on night 3. |

Warning signs, in order, before he reaches the gate:

- 20 s before: Bari's collar bell, faint, from down the path.
- 15 s before: Raymond whistling, the same four notes every time (an old folk tune, the opening of "Le Vieux Chalet" is fine since it is traditional, or an invented one).
- 8 s before: the torch beam visible through the fog, swinging across the wall.
- 0 s: the gate squeals.

Detection: Raymond's torch is a cone 12 m long and 25 degrees wide. He sees the reporter if:

- the reporter's own flashlight is on anywhere inside the cemetery while Raymond is within 30 m, or
- the beam touches the reporter while they are standing (not crouched), or
- the beam touches the open grave hole while it is at `dig_stage >= 1` and the reporter is anywhere in the cemetery. (He finds the hole; the reporter is the only stranger in the village.)

Bari can smell the reporter if they hide within 3 m of the central path. He growls once. If the reporter does not move away within 4 seconds, Raymond turns his torch that way.

Hiding spots: the ossuary shed (safe), behind the larger stones in rows 2 to 4 while crouched (safe unless within 3 m of the path), outside the back gate in the forest (safe, but the player must go around and come back).

At `dig_stage >= 3` the hole is deep enough that climbing out takes 3 seconds. Crouching in the hole with the light off is also safe at stage 3 and above, unless the beam points straight into it, which happens at stage 4 and 5 because he checks the Chassot plot every pass. So at stage 4 and 5 the player has to climb out and hide.

To avoid the hole being found, the player can drag the tarp from the ossuary shed over the hole (`tarp_over_hole`, one action). This makes the hole safe from the beam. The tarp hint is in the shed: "A green tarp, folded. Raymond covers fresh graves with it when it rains."

### Night 1: meeting Raymond

Triggered when the player has read at least one of the three graves. After a long quiet stretch (see [07-scares.md](07-scares.md), jumpscare 1), Bari barks suddenly from right behind the wall, close. Then the torch hits the reporter's face.

### raymond_night1
@speaker: raymond
! set: met_raymond

> Who's there? Bari, tais-toi! {{Bari, quiet!}}
> ...
> You're the newspaper. From the inn.
> What do you want up here at this hour?
- [I'm reading the stones.] -> raymond_night1_stones
- [Looking for whoever lights the lantern.] -> raymond_night1_lantern

### raymond_night1_stones
@speaker: raymond

> In the dark. With a torch. Like a burglar.
-> raymond_night1_warn

### raymond_night1_lantern
@speaker: raymond

> Ha. You and me both. A year I've been coming up here.
> Every Saturday it's lit. I never see a soul. Not a footprint. Bari doesn't even bark.
> Tonight it's lit and it's Tuesday. That's new.
-> raymond_night1_warn

### raymond_night1_warn
@speaker: raymond

> I do a round here every night. Nine till two. For the council.
> If I find anyone messing with these graves, I call the gendarmes in Romont. I don't care who.
> These are my graves. I dug every one of them.
- [Even Marc Chassot's?] -> raymond_night1_marc
- [Good night.] -> raymond_night1_end

### raymond_night1_marc
@speaker: raymond

> I dug it. And I carried him. Four of us.
> ...
> Go to bed, journalist.
-> raymond_night1_end

### raymond_night1_end
@speaker: raymond

> Allez, Bari. {{Come on, Bari.}}

@speaker: narration
> His light goes down the path, swinging. The bell on the dog's collar fades out.
> Then nothing at all.

After this, the first sighting can trigger: Le Loyon stands among the spruces outside the back wall, looks back at the reporter while his mask lenses glow and go dark, and walks slowly into the forest. The back gate creaks open behind him and the notebook says to follow him. See [05-forest-bunker.md](05-forest-bunker.md#night-1-the-first-sighting).

### Night 2: the warning

If Raymond's torch catches the reporter on night 2 while they are not digging and the hole is not visible (`dig_stage == 0`, or the tarp is over it), he warns them once.

### raymond_night2_warn
@speaker: raymond
?if: !raymond_warned
! set: raymond_warned

> You again.
> Two nights. People notice.
> Go down. If I see you up here again tonight, I'm not asking questions. I'm phoning.

@speaker: narration
> He stands at the gate until I walk out. Then he goes down. I can come back. He'll be faster now.

The next round is shorter (70 s).

### Caught

If the reporter is caught (second sighting after the warning, or any sighting with the hole visible or while digging), the round stops. Bari barks continuously. Raymond's torch holds steady on the reporter.

### raymond_caught
@speaker: raymond
! set: caught

> Bouge pas! {{Don't move!}}
> Mon Dieu. Mon Dieu, what have you done.
> Bari, stay. STAY.

@speaker: narration
> He doesn't come closer. He backs to the gate with the torch on me.
> Then he's running, as fast as an old man can, down to the phone box.
> I could run. Where to? There's one bus, at 6:41.

Then fade to black and the caught screen, white text on black:

```
The gendarmes from Romont arrived at 2:40.

You spent the night in a cell in Romont and the next day
in an interview room. Violation of a grave. Disturbing
the peace of the dead. Your editor came to collect you.

On Saturday, L'Écho ran a short item on page 9 that did
not carry your name:

  JOURNALIST HELD AFTER GRAVE DESECRATED IN LEURS

The village did not speak to the newspaper.
In Leurs, nobody mentioned what was or wasn't in the box.

                [ Continue from the last sleep ]
```

The text says "you" for the reporter. "Continue from the last sleep" reloads the save made when the reporter last woke (day 2 morning or the night 2 start).

Caught text if `dig_stage == 0` (caught after a warning, without digging):

```
Raymond Bapst phoned the gendarmes anyway.

They found no damage, but you were asked to leave Leurs on
the first bus. Monique did not charge for the last night.
She didn't speak to you at breakfast.

                [ Continue from the last sleep ]
```

### Raymond by day

Raymond sits in the inn café on day 2 evening and day 3. He is not a dialogue hub. His lines:

### raymond_day2
@speaker: raymond
?if: day == 2

> The journalist. Did you sleep?
> I didn't. That lantern. Tuesday. It's never been lit on a Tuesday.

### raymond_day3_refilled
@speaker: raymond
?if: day == 3, grave_refilled

> The Chassot grave's soft. Sunk a bit. Rain, I suppose.

@speaker: narration
> He looks at me for a long time over the thermos.

@speaker: raymond
> Rain.

### raymond_day3_open
@speaker: raymond
?if: day == 3, grave_left_open

> Leave me alone.

@speaker: narration
> His hands shake on the cup. He doesn't look up. Gilles puts a hand on his shoulder.

## The dig

Night 2. Requirements: `has_shovel`, the `flashlight` item, `suspects_empty_coffin`. The player enters the cemetery after Raymond's first round.

Digging uses one held action at a grave with a "Dig" prompt. Each stage takes about 25 seconds of holding. Releasing pauses progress; progress is kept. The flashlight can be on or off while digging. With it off the screen is near black except for whatever ambient light the grave lantern or fog gives, and the dig sound is louder.

Sound for digging: blade into wet earth, a grunt, the soft thump of earth thrown onto the pile. Between strokes, the forest. The dig sound carries; if `dig_stage >= 1` and Raymond is within 20 m, he hears it and turns toward it (counts as detection if he then sees the reporter or the hole).

### Wrong graves

### dig_menoud
@speaker: narration

> No. Not him.

### dig_therese
@speaker: narration

> That's his mother.

### dig_other
@speaker: narration

> No. That's someone's family.

### dig_gremaud
@speaker: narration
! set: dug_gremaud_stone

> Two strokes, and the blade rings on concrete. A footing for the stone. Nothing under it.
> There never was anything under it.
> That was loud.

Raymond's next round comes 30 s early.

### dig_gremaud_again
@speaker: narration
?if: dug_gremaud_stone

> Concrete. He isn't here.

### Digging the Chassot grave

Each stage's narration plays once when the stage completes. The visual hole deepens and the earth pile beside it grows.

### dig_chassot_start
@speaker: narration
?if: dig_stage == 0

> Marc's side. Where the boot prints stand.
> If I'm wrong about this, there's no explaining it to anyone.
- [Dig.] -> dig_chassot_1
- [Not yet.] -> dig_not_yet

### dig_not_yet
@speaker: narration

> I stand there with the shovel. The forest breathes behind the wall.

### dig_chassot_1
@speaker: narration
! set: dig_stage = 1

> The gravel first, raked into a pile. Then the turf comes away in wet squares.

### dig_chassot_2
@speaker: narration
! set: dig_stage = 2

> Clay and stones. It sticks to the blade. My arms are shaking already.

### dig_chassot_3
@speaker: narration
! set: dig_stage = 3

> The earth gets softer. Loose. Dug more than once, not that long ago.
> I'm up to my waist. If he comes now I have to climb out.

### dig_chassot_4
@speaker: narration
! set: dig_stage = 4

> Shoulder deep. The walls of the hole drip. The torch beam looks small down here.
> Somewhere above me something steps on the gravel and stops.

(Nothing is there. See [07-scares.md](07-scares.md), cemetery night 2.)

### dig_chassot_5
@speaker: narration
! set: dig_stage = 5

> The blade hits wood. A hollow sound, very loud.
> I scrape the earth off with my hands. Pale pine. A cheap coffin. The lid is screwed down at the corners.

## The coffin

The view looks down at the lid in the torch beam. The four screws are rusted. Two are already loose.

### coffin_lid
@speaker: narration

> Two screws turn with my fingers. The other two have nearly rusted through.
- [Lift the lid.] -> coffin_open
- [Wait.] -> coffin_wait

### coffin_wait
@speaker: narration

> I listen. No bell. No whistle. Only my own breathing, too loud.
-> coffin_lid

### coffin_open
@speaker: narration
! set: opened_coffin

> The lid comes up with a crack of wood.
> The smell is only damp. Wet wood and old cloth.
> The coffin is empty.

Hold for four seconds on the empty coffin. Gray satin lining, stained, sagging. No body, no clothes, no bones. In the middle, small against all that empty space, a gray metal cash box with a hinged lid.

Then:

@speaker: narration
> No one was ever in here.
> There's a box.

### coffin_box
@speaker: narration
! set: has_bunker_key, has_legion_tag, read_gremaud_letter, give: bunker_key, give: gremaud_letter, give: legion_tag

> A cash box. Not locked. Inside, wrapped in an oilcloth:
> A key on a brass tag. An envelope. And a dented metal disc on a chain.

The player sees each item close up:

- `bunker_key`: a heavy steel key, the bit cut in a square pattern. The brass tag is stamped "K.P. 3" and, by hand with a nail, "BOIS-NOIR".
- `legion_tag`: an oval metal identity disc, the kind that snaps in half. Stamped: "CHALLAND M. / 1958 / 172493 / LE". A Legion identity disc in a name that isn't Marc's. Full text in [06-documents.md](06-documents.md#doc_legion_tag).
- `gremaud_letter`: the envelope reads "À qui ouvrira ce cercueil" ("To whoever opens this coffin"). The player can read it now or later. Full text in [06-documents.md](06-documents.md#doc_gremaud_letter).

When the player reads the letter, add to the notebook:

```
Gremaud. He knew. The coffin was empty from the start.
"K.P. 3." The room at the end of the fort.
Knock three times, wait, then once.
Bread. The larch above the fort.
CHALLAND M. Who is Challand?
```

### coffin_after
@speaker: narration

> I should put this back the way it was.

## Refilling

The player can refill the grave: three stages of the same dig action, about 20 s each, with the same patrol rules. Throwing earth back is quieter (Raymond hears it only within 12 m). Refilling sets `refill_stage` 1 to 3, then `grave_refilled`. The gravel goes back on in the last stage.

### refill_1
@speaker: narration
! set: refill_stage = 1

> The lid back on. The screws into the same holes. Earth on wood, a dull sound like a door closing far away.

### refill_2
@speaker: narration
! set: refill_stage = 2

> Half full. My hands are raw.

### refill_3
@speaker: narration
! set: refill_stage = 3, grave_refilled

> The turf back in squares. Gravel over it. It looks almost right. In the rain, it will look right.

If the player leaves the cemetery after opening the coffin without refilling:

### leave_open_warning
@speaker: narration
?if: opened_coffin, !grave_refilled

> I'm leaving it open. Raymond will find it in the morning.
- [Go anyway.] -> leave_open_go
- [Go back and fill it.] -> leave_open_back

### leave_open_go
@speaker: narration
! set: grave_left_open

> I can't do any more tonight.

### leave_open_back
@speaker: narration

> Back to the hole.

## Photographs in the cemetery

The camera works here. Special results:

| Shot | Result |
|---|---|
| Any photo in the cemetery on night 1 before `first_sighting` | Becomes `photo_treeline` (photo 7). When it develops after a minute, it shows a pale shape between the trees behind the back wall that the player did not see. See [06-documents.md](06-documents.md#photo-7-the-treeline). |
| The Chassot grave | `photo_grave_chassot` |
| Daniel's lit lantern | `photo_lantern` |
| The empty coffin | `photo_empty_coffin`, strong evidence |
| Using the flash on night 2 | The flash counts as the reporter's flashlight being on for detection for 2 seconds. |
