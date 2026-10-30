# Additions: more people, more to do

Eleven additions that make the three days longer and fuller without changing the story. Marc Chassot is still Le Loyon, the coffin is still empty, Gremaud still lies under the larch, and the endings stay as they are. Nothing here is supernatural, and nothing adds walking distance beyond a few meters. Each addition is something to do in a place the player already passes through.

Dialogue follows the convention in [00-overview.md](00-overview.md#dialogue-convention). Documents follow the format at the top of [06-documents.md](06-documents.md).

## Summary

| Id | Type | When | Level | What it adds |
|---|---|---|---|---|
| A1 `simone` | Character | Days 1 to 3 | `church` | Simone Grandjean, the sacristan. Texture about the funeral, and the clue to the coffin maker. |
| A2 `step_burials_book` | Step | Day 2 | `church` | The burials books are in the parish office. The reporter fixes the printer to get them back. |
| A3 `beat_harmonium_reed` | Beat | Day 2 or 3 | `church` | A stuck harmonium reed keeps sounding in the empty nave. |
| A4 `josiane` | Character | Days 2 and 3 | `village_square` | Josiane Mauron, the postwoman. A film pack from the editor, and the syndic's letters from France. |
| A5 `puzzle_brodard_call` | Puzzle, character | Days 2 and 3 | `village_square`, `laiterie`, `inn` | Buy a taxcard, find the coffin maker in the directory, and phone him from the box on the square. |
| A6 `beat_line_breath` | Beat | During A5 | `village_square` | The carpenter hears someone breathing on the line. |
| A7 `germaine` | Character, errand | Days 1 to 3 | `chassot_farm` | Germaine Kolly, Marc's great-aunt across the road, and her lost cat Minet. |
| A8 `puzzle_cellar_lock` | Puzzle | Days 1 to 3 | `chassot_farm`, new room `chassot_cellar` | The Chassot cellar's combination padlock, Marc's birthday, and what someone keeps down there. |
| A9 `beat_cellar_hatch` | Beat | First cellar visit | `chassot_cellar` | The hatch falls shut behind the reporter. |
| A10 `fort_logbook_note` | Interaction, beat | Day 2 or 3, then night 3 | `bunker_interior` | Write a line in the guard room logbook. On night 3 there is an answer. |
| A11 `step_larch_chart` | Step | Day 3 | `bunker_interior`, `forest_deep` | The track to the larch splits at a boulder. The fort's wall chart shows which way. |

New characters: Simone Grandjean (A1), Josiane Mauron (A4), Aloys Brodard (A5, a voice on the phone), and Germaine Kolly (A7). A2 and A11 are steps in the main chain, and everything else is optional. Scare and atmosphere beats: A3, A6, A9, and the end of A10.

### What not to bring back

An earlier rewrite was rejected and reverted. None of it returns: no Lucien, no Bielmann, no Rose, no Pittet farm, and no field telephone as the way into the hidden room. The guard room's field telephone stays the dead prop it is in [05-forest-bunker.md](05-forest-bunker.md#fort_phone).

## New cast

| Id | Name | Age | Role | Face | Where |
|---|---|---|---|---|---|
| `simone` | Simone Grandjean | 61 | Sacristan and harmonium player at Saint-Maurice | New `face_sacristan`, or `face_widow` until it exists | Church: nave on day 1, parish office then harmonium on day 2, harmonium on day 3 |
| `josiane` | Josiane Mauron | 34 | Postwoman for Leurs and Vauchy | `face_young_woman` | Square, by her yellow van at the Gremaud gate, days 2 and 3 by day |
| `germaine` | Germaine Kolly | 79 | Widow of Ernest Kolly. Thérèse Chassot was Ernest's niece, so Marc called her "tante Germaine". | `face_old_woman` | Chassot farm level, at the top half of her stable door across the road, days 1 to 3 by day |
| `brodard` | Aloys Brodard | 70 | Carpenter and coffin maker in Vauchy, the next valley | None, voice only | The phone box on the square |

Display names until the name is heard (`roles` in `src/content/speakers.ts`): Simone shows as "Sacristan", Josiane as "Postwoman", Germaine as "Old woman". Brodard shows as "Brodard", since the reporter dials him by name.

None of them knows Marc is alive. None of them says ghost.

## A1. Simone Grandjean, the sacristan

**Type.** Character. **When.** Days 1 to 3, by day. The church is locked at night. **Level.** `church`.

**Why she exists.** Somebody has to do the flowers, the linen, the bell rope, and the bulletin, and the abbé is 71. She played the harmonium at Marc's funeral and reads the maker's plate on every coffin out of habit. That habit gives the player a fourth way to doubt the coffin (A5).

**Where she is.**

| Phase | Where |
|---|---|
| Day 1 | In the nave, changing the cloth on the Virgin's side altar |
| Day 2, before `simone_printed` | Parish office, seated at the computer |
| Day 2, after `simone_printed` | At the harmonium in the nave, practising for Saturday |
| Day 3 | At the harmonium |

**What the player does.** Talks to her. On day 2 she drives step A2. Her day 2 and day 3 talks give `knows_brodard`, the name of the coffin maker.

### Entry

| Condition | Node |
|---|---|
| `day == 1` | `simone_day1` |
| `day == 2`, `!simone_printed` | `simone_printer` |
| `chu_harmonium_reed`, `!knows_brodard` | `simone_reed` |
| `day == 3`, `!knows_brodard` | `simone_plate` |
| `day == 2`, `!chu_harmonium_reed` | `simone_practising` |
| Any other | `simone_saturday` |

### simone_day1
@speaker: simone
! set: simone_met

> Bonsoir. If it's the abbé you want, he's by the candles.
> If it's anything else, it's me.
- [What do you do here?] -> simone_job
- [Nothing, thanks.] -> simone_bye

### simone_job
@speaker: simone

> Sacristan. Flowers, linen, the bell rope, the harmonium.
> And the bulletin, since the abbé bought that computer. God help me.
> Simone Grandjean. Like the healer on the old stone by the wall. No relation, I tell people. Nobody believes me.
- [You play at funerals?] -> simone_funerals
- [Thanks.] -> simone_bye

### simone_funerals
@speaker: simone

> Every one for thirty years. Weddings too, but there aren't many weddings now.
> You can tell a village by its funerals. Here they all come, and nobody says anything afterward.

### simone_bye
@speaker: simone

> À demain, peut-être. {{Until tomorrow, maybe.}}

### simone_saturday
@speaker: simone

> Saturday at six, if you're still here. The mass for the dead of the month. I read the names.
> I asked the abbé if I should keep reading Marc Chassot's. Three years now.
> He said, keep reading him. He said it strangely.

### simone_practising
@speaker: simone

> Saturday's hymn. I play it badly all week so I can play it well on Saturday.

`simone_printer` is in A2 and `simone_reed` in A3. `simone_plate` gives the same clue as the end of `simone_reed`, for a player who reaches her on day 3 before the reed has stuck.

### simone_plate
@speaker: simone
! set: knows_brodard

> Saturday I read Marc Chassot's name again. I played at that funeral.
> I always read the little plate on a coffin, you know. Habit. Who made it.
> Brodard, from Vauchy. He makes half the coffins in the district.
> Funny thing to find on a coffin that came from France.

**Flags.** `simone_met`, `knows_brodard`.

**Notebook.** On `knows_brodard`: "Marc's coffin 'from France' had a carpenter's plate on it. Brodard, Vauchy. There's a directory in the phone box."

**Hooks.** Gated by nothing on day 1. `knows_brodard` unlocks the call in A5.

**Build.**
- `humanLooks.simone` in `src/engine/characters/cast.ts`: height 1.6, build 1.05, slight stoop 0.08, gray hair in a `bob`, a long brown cardigan as a `coat` (length 0.7) over a dark skirt, flat shoes. Reading glasses are not modeled; she has lost them.
- Face: a new portrait `face_sacristan` through FLORA and the crop recipe in [characters.md](../characters.md#face-textures). Use `face_widow` until it exists.
- `kit.npc('simone')` in the church, placed by phase as in the table. Seated at the office desk with `.sit(0.48)`, seated at the harmonium the same way.

## A2. The burials book is in the office

**Type.** Step in the main chain (P2, the register). **When.** Day 2. **Level.** `church`: sacristy and parish office.

**What changes.** The abbé still unlocks the cupboard as in [03-church.md](03-church.md#overney_register_offer). The three green burial books (`doc_register_1995`, `_1996`, `_1997`) are not on the shelf. Simone took them to the office to copy the names for Saturday's mass, and the office printer won't print. The player gets them back by pressing the right key, using the sticky note that is already on the monitor (`office_computer`).

**What the player does.**

1. Opens the register cupboard on day 2. The shelf shows a gap and a note (`sacristy_register_gap`). Sets `saw_register_gap`. The baptisms and the chronicle can still be read.
2. Goes through the door into the parish office. Simone is at the computer (`simone_printer`).
3. Agrees to try. Uses the computer (`office_computer_print`). The sticky note says F2 prints. Picks "Press F2".
4. The dot-matrix printer screams one line at a time. Simone hands over the books and a bulletin. Gain `burials_book`, `bulletin_november`. Sets `simone_printed`.
5. Goes back to the cupboard and picks "Put the burials books back". The shelf opens with the green books in it, and the player reads `doc_register_1995` as before. Reading it sets `read_register` and takes `burials_book`. From here the chain runs on unchanged: `overney_seal` at the sacristy door.

### sacristy_register_gap
@speaker: narration
?if: !simone_printed
! set: saw_register_gap

> Red books, a black one. Where the green ones should be, a gap, and a slip of paper.
> "Sépultures 87- → bureau (bulletin). S.G." {{Burials 87 on → office (bulletin). S.G.}}

### simone_printer
@speaker: narration

> A woman in a long cardigan sits at the office computer, glaring at it. Beside it, a printer, silent.

@speaker: simone
> Don't come in, I'll make it worse. Oh. It's you.
> You'll want the burials books. They're here. I'm copying the names for Saturday and now this thing won't print.
> Yannick from the inn set it up. He wrote me a note, and I've lost my glasses.
- [Can I try?] -> simone_printer_try
- [I'll come back.] -> simone_printer_later

### simone_printer_try
@speaker: simone
! set: simone_asked_help

> Please. Only don't touch the modem. If you touch the modem it telephones Lausanne.

### simone_printer_later
@speaker: simone

> The books aren't going anywhere. Neither am I.

### office_computer_print
@speaker: narration
?if: simone_asked_help, !simone_printed

> The bulletin is on the screen, all typed. The sticky note on the monitor: "Bulletin: F2 = imprimer."
- [Press F2.] -> office_print
- [Press Enter.] -> office_print_wrong
- [Leave it.] -> office_print_leave

### office_print_wrong
@speaker: narration

> It beeps and asks if I want to save the changes. I press nothing else.

### office_print_leave
@speaker: narration

> Not yet.

### office_print
@speaker: narration
! set: simone_printed, give: burials_book, give: bulletin_november

> The printer wakes up and screams, one line at a time. The whole office shakes with it.

@speaker: simone
> Ah! Voilà. Merci, merci. You people with computers just know.
> Take the books back to the cupboard for me, would you? The abbé likes things where they live.
> And take a bulletin. Saturday. Come if you're still here.

### sacristy_books_back
@speaker: narration
?if: has_burials_book

> I put the green books back in the gap. They're warm from the office.

Then the shelf opens as usual (`readRegisters` in `src/levels/church/registers.ts`).

On any other day the office computer keeps its old line (`office_computer`).

**New items.**

| Id | Name | Description | Document |
|---|---|---|---|
| `burials_book` | Burials books, green | "Three green ledgers, heavy as bricks. Too heavy to read standing up. They go back in the cupboard." | None |
| `bulletin_november` | Parish bulletin, November | "Still warm from the printer. Saturday's mass for the dead of the month." | `doc_bulletin_november` |

### doc_bulletin_november
- type: bulletin
- item: `bulletin_november`
- found: Simone gives it, day 2
- language: fr
- look: one sheet of continuous-feed paper with the holes torn off, dot-matrix print, a clip-art cross at the top.

```
PAROISSE SAINT-MAURICE - LEURS
Bulletin paroissial - novembre 1998

Samedi 21 novembre, 18 h
Messe anniversaire pour les défunts du mois.
Nous prions pour :
   Ernest Kolly (1995)
   Marc Chassot (1995)
   Joseph Python (1997)
et pour tous les défunts de la paroisse.

Chœur mixte : répétition mardi 20 h.
Nous cherchons toujours des ténors.

Quête du dimanche : en faveur des missions.
```

Translation: "SAINT-MAURICE PARISH, LEURS. Parish bulletin, November 1998. Saturday 21 November, 6 pm. Anniversary mass for the dead of the month. We pray for: Ernest Kolly (1995), Marc Chassot (1995), Joseph Python (1997), and for all the dead of the parish. Mixed choir: rehearsal Tuesday 8 pm. We are still looking for tenors. Sunday collection: for the missions."

Ernest Kolly (1909 to 1995, already on a stone) died in November 1995, a week before Marc's funeral. He is Germaine's husband (A7).

**Flags.** `saw_register_gap`, `simone_asked_help`, `simone_printed`. Derived: `has_burials_book` (holds the `burials_book` item), defined like `has_shovel`.

**Notebook goals.** Insert these two before the day 2 goal "Go to the church after morning mass and ask the priest to see the register." in `notebookGoals`:

| Condition | Text | `to` | `who` |
|---|---|---|---|
| day 2, `has_burials_book` | "Put the burials books back in the sacristy cupboard and read 1995." | `church` | |
| day 2, `saw_register_gap`, `!read_register` | "The burials books are in the parish office. Ask the sacristan for them." | `church` | `simone` |

**Hints** in `src/levels/church/hints.ts`, registered before the existing day 2 cupboard hint:
- Near the cupboard, `saw_register_gap` and no `burials_book`: "The note says the office. The door is at the back of the sacristy." Point at the office door.
- Near the office desk, `simone_asked_help` and `!simone_printed`: "Read the note stuck to the monitor." Point at the computer.
- Near the cupboard with `burials_book`: "Put the books back in the gap and open the green one for 1995." Point at the cupboard.

**Hooks.** Gated by day 2 and the abbé opening the cupboard. `read_register` still comes from reading `doc_register_1995` at the cupboard, so `overney_seal`, `suspects_empty_coffin`, Odile, and forum stage logic are untouched. Update `registers.test.ts` for the gap.

**Build.**
- Sacristy: the three green spines are missing from the shelf model until `simone_printed`, and a paper slip sticks out of the gap.
- Office: the computer screen shows a blue word-processor page when Simone is there (a texture swap). A dot-matrix printer on the desk beside it, a beige box with a stack of fanfold paper. The three green books on the desk until printed.
- Sound: a dot-matrix print, about 6 s, harsh and line by line. Synthesize it in `src/levels/church/sounds.ts`: bursts of filtered noise with a carriage return clunk between lines.
- The cupboard hotspot checks `burials_book` first and plays `sacristy_books_back`, then the shelf.

## A3. The harmonium reed

**Type.** Beat. **When.** Day 2 after `abbe_seal_hint`, or day 3. Fires once. **Level.** `church`, nave.

**What happens.** After printing, Simone moves to the harmonium against the north wall of the nave, left of the chancel arch, and practises Saturday's hymn: a slow invented tune, not a real song. The first time the player walks through the nave after the abbé's talk at the sacristy door, she stops in the middle of a phrase. She takes her hands off the keys and puts them in her lap. One low note keeps sounding. It thins as the bellows empty, over about 12 s, and stops. Then nothing but the lamp hum. She doesn't move until the player talks to her or walks past the font.

Resolves false: a reed sticks when the church is damp.

### simone_reed
@speaker: simone
! set: knows_brodard

> It does that. The low A sticks when it's damp.
> It stuck at Marc Chassot's funeral. All through the absolution, one note, and nobody could stop it.
> Raymond said it was Marc complaining about the music. Raymond is like that.
> I always read the little plate on a coffin, you know. Habit. Who made it.
> Brodard, from Vauchy. He makes half the coffins in the district.
> Funny thing to find on a coffin that came from France.

@speaker: narration
> She plays the first chord again, carefully. This time the A behaves.

**Scare director entry** (in the church level):

```ts
{
  id: 'chu_harmonium_reed',
  when: [{ flag: 'simone_printed' }, { enter: NAVE_AISLE_ZONE }],
  if: { any: [{ flag: 'abbe_seal_hint' }, { count: [['day', '==', 3]] }] },
  do: [{ run: (ctx) => harmonium.stickLowA(12) }],
  set: 'chu_harmonium_reed',
}
```

**Flags.** `chu_harmonium_reed` (beat spent), `knows_brodard`.

**Hooks.** Needs `simone_printed`. The church stays the safe place: no stinger, no figure, and random events stay off inside.

**Build.**
- A small harmonium: a wooden case on legs, two pedals, a fold-back lid, a hymn book on the stand. Simone sits at it with `.sit(0.48)`.
- Sound: a reed organ tone synthesized in `src/levels/church/sounds.ts` (a square wave through a low-pass, slight beating between two detuned voices, a bellows wheeze under it). A 30 s loop of the hymn while she plays, and `stickLowA(seconds)` that holds A2 and fades with the wheeze. Positional, from the harmonium.

## A4. Josiane Mauron, the postwoman

**Type.** Character. **When.** Days 2 and 3, by day. **Level.** `village_square`.

**Why she exists.** The post is how a village knows things it never says. She brings a parcel from the editor, and she remembers the syndic's letters from France, which point at the Legion before Gilles hands over the postcard.

**Where she is.** Beside her small yellow post van, parked on the road at the Gremaud gate, sorting letters into a tray on the passenger seat. Now and then she walks to the inn door and back (`walk`, loop, waits of 6 s at each end).

**What the player does.** Talks to her. The first talk gives a film pack (resets `film_shots` to 10) and Ruth's note.

### Entry

| Condition | Node |
|---|---|
| `!josiane_met` | `josiane_parcel` |
| `day == 2` | `josiane_day2` |
| `day == 3`, `grave_left_open`, `!josiane_letterbox` | `josiane_day3_open` |
| `day == 3`, `!josiane_letterbox` | `josiane_day3` |
| Any other | `josiane_bye` |

### josiane_parcel
@speaker: josiane
! set: josiane_met, film_shots = 10, give: ruth_note

> Room three at the Croix-Blanche? That's you. Recorded, from L'Écho. Signez là. {{Sign there.}}

@speaker: narration
> A padded envelope. Inside, a film pack for the camera and a card in Ruth's hand. I load the pack. Ten shots.

@speaker: josiane
> Nine years on this round and you're the first person who ever got post at the inn.
- [Do you know everyone here?] -> josiane_round
- [Thanks.] -> josiane_bye

### josiane_round
@speaker: josiane

> Leurs, Vauchy, and the farms in between. You learn who gets bills and who gets love letters.
- [Have you ever seen Le Loyon?] -> josiane_loyon
- [Who got letters at the syndic's house?] ?if: abbe_told_graves -> josiane_letters
- [I'll let you work.] -> josiane_bye

### josiane_day2
@speaker: josiane

> Still here? The 18:52 is the last bus. People forget.
- [Have you ever seen Le Loyon?] ?if: !josiane_seen -> josiane_loyon
- [Who got letters at the syndic's house?] ?if: abbe_told_graves, !josiane_letters -> josiane_letters
- [Bye.] -> josiane_bye

### josiane_loyon
@speaker: josiane
! set: josiane_seen

> I do the Bois-Noir road at six in winter, in the dark.
> Twice something has crossed in my lights. Tall, a cape down to here. Not fast. It didn't even look at the van.
> Deer don't wear capes. I take the long way now.
- [Who got letters at the syndic's house?] ?if: abbe_told_graves, !josiane_letters -> josiane_letters
- [Thanks.] -> josiane_bye

### josiane_letters
@speaker: josiane
! set: josiane_letters

> Monsieur Gremaud? Council post, mostly. Bills from the canton.
> And twice a year, a letter from France. Calvi on the postmark. Sometimes no town at all, just "Secteur postal" and a number.
> Same handwriting every time. Small, careful. A dozen letters, maybe, in my years.
> Then in September '95, a big envelope from the French army, recorded. He signed for it on the step and waited till I'd gone.
> After that, nothing from France. Not one.
> I used to tease him about a sweetheart in Corsica. I stopped after that.

### josiane_day3
-> josiane_cat ?if: minet_returned
-> josiane_letterbox_line

### josiane_cat
@speaker: josiane

> Madame Kolly says somebody found her cat. That's one friend in Leurs.
-> josiane_letterbox_line

### josiane_day3_open
@speaker: josiane

> You heard? Somebody dug at the cemetery last night. Raymond's telephoned Romont.
> I'm not asking. I'd take the 13:30, if I were you.
-> josiane_letterbox_line

### josiane_letterbox_line
@speaker: josiane
! set: josiane_letterbox

> Funny thing. The Chassot farm. Nobody's had post there since Thérèse died.
> I still put the commune's leaflets in the box. Every time I come back, they're gone.
> Madame Kolly, I suppose. She's like that.

### josiane_bye
@speaker: josiane

> À la prochaine. {{See you.}}

### doc_ruth_note
- type: card
- item: `ruth_note`
- found: in the parcel from Josiane, day 2
- language: en
- look: a compliments slip from L'Écho, blue ballpoint.

```
Ten more. The fog is not a photo.
A person is a photo.
Keep the receipts.
R.
```

**New items.**

| Id | Name | Description | Document |
|---|---|---|---|
| `ruth_note` | Card from Ruth | "A compliments slip from L'Écho, in Ruth's handwriting. It came with a film pack." | `doc_ruth_note` |

**Flags.** `josiane_met`, `josiane_seen`, `josiane_letters`, `josiane_letterbox`. Count: `film_shots` set to 10 (the cap).

**Notebook.** On `josiane_letters`: "The postwoman: letters from France to the syndic, twice a year for years. Calvi. Then September '95, the French army, recorded. Then nothing." On `josiane_letterbox`: "Somebody empties the Chassot letterbox."

**Hooks.** Day 2 and 3 only. `josiane_letters` sets nothing else. It must not set `knows_legion`, because Gilles's entry uses `!knows_legion` to hand over the postcard. `josiane_letterbox` opens a line with Germaine (A7).

**Build.**
- `humanLooks.josiane`: height 1.66, build 0.95, dark hair `long` tied back, a yellow-and-gray post jacket as a `coat` (length 0.55), dark trousers with a belt, a yellow `peaked` cap, a shoulder bag (a box on a strap).
- The van: reuse the Fiat from `src/levels/village_square/traffic.ts` as a small box van, painted post yellow (0xe2b21c), with a black side panel texture reading "LA POSTE". Hazard lights blinking slowly, as post vans do on a round. Parked, engine off.
- Sounds: the van door opening and shutting once each time she walks back to it. Paper rustle when she sorts. Both in `src/levels/village_square/sounds.ts`.
- A tray of letters on the passenger seat, as a few thin white boxes.

## A5. The call to Vauchy

**Type.** Puzzle, and a voice-only character. **When.** Day 2 or 3, by day. **Levels.** `village_square` (the phone box), `laiterie` (the taxcard), `inn` (a redirect at the stübli phone).

**Why it exists.** The register, Bernard, and Odile each say something about the coffin. Brodard, the carpenter in the next valley, is the only person alive who handled it before the funeral. He gives a fourth route to `suspects_empty_coffin`, through a reporter's oldest tool, the phone.

**What the player does.**

1. Learns the name from Simone (A1 or A3). Sets `knows_brodard`.
2. Buys a taxcard from Christine (`christine_taxcard`, new choice in `christine_shop`). Gain `taxcard`.
3. Goes into the red phone box on the square and uses the phone (`phonebox_brodard`). Looks up Brodard in the damp directory, which opens `doc_directory_vauchy`. Sets `read_directory_vauchy`.
4. Calls (`brodard_call`). Sets `brodard_called`.

If the player tries the inn's phone with `knows_brodard`, the reporter sends them to the box (`phone_not_here`).

### christine_taxcard
@speaker: christine
?if: !has_taxcard
! give: taxcard

> A taxcard. Ten francs. The box on the square eats them, mind. Talk fast.

Add to `christine_shop`: a choice `[A taxcard, please.] ?if: !has_taxcard -> christine_taxcard`.

### phone_not_here
@speaker: narration
?if: knows_brodard, !brodard_called

> I could call Vauchy from here. Monique can hear every word from the counter.
> The phone box on the square, then.

### phonebox_brodard
@speaker: narration
?if: knows_brodard, !brodard_called

> A red phone box. Taxcard only. The directory is swollen with damp.
- [Look up Brodard, Vauchy.] -> phonebox_lookup ! set: read_directory_vauchy
- [Call Brodard.] ?if: read_directory_vauchy, has_taxcard -> brodard_call
- [Leave it.] -> phonebox_leave

Picking "Look up Brodard" closes the dialogue. The level then opens `doc_directory_vauchy`, and after the player closes it, plays `phonebox_no_card` if they have no card, or `phonebox_brodard` again if they do.

### phonebox_lookup
@speaker: narration

> I peel the wet pages apart. V. Vauchy.

### phonebox_no_card
@speaker: narration
?if: !has_taxcard

> I've got the number. The box only takes a taxcard. The dairy shop will sell me one.

### phonebox_leave
@speaker: narration

> Not now.

### brodard_call
@speaker: narration

> I push the card in. The display counts it: 10.00. The ringing goes on a long time.
> A click. A radio somewhere behind the voice.

@speaker: brodard
> Brodard, menuiserie.
- [I'm a journalist. I'm asking about a coffin you made in November '95. For Leurs.] -> brodard_coffin
- [Sorry. Wrong number.] -> brodard_hangup

### brodard_hangup
@speaker: narration

> I hang up. The card comes out. 9.40.

### brodard_coffin
@speaker: brodard

> Leurs. The syndic's boy. The one from France.
> Oui, I remember. You don't forget the ones you make for nobody.
- [For nobody?] -> brodard_nobody

### brodard_nobody
@speaker: brodard
! set: brodard_called

> The syndic came himself, in his own car. A Thursday. Plain pine, lined, gray satin.
> No name plate, he said. I put my own little plate on the foot. I always do.
> He said the French were sending the remains sealed, and he would make the transfer himself. Family. Out of respect.
> I said, Monsieur le syndic, that's not how it's done. He said, Aloys, please.
> So I didn't ask. I put the lid on loose and gave him the screws in a paper bag. And my good screwdriver. Never saw it again.
> We carried it to his car together. Empty, of course. It was new.
-> brodard_breath

`brodard_breath` is in A6.

### doc_directory_vauchy
- type: directory page
- item: none
- found: the phone box on the square, from `phonebox_brodard`
- language: fr
- look: a page of the 1997-98 Fribourg phone book, thin paper gone wavy with damp, three columns, one of them a smear. The header and one block are readable.

```
VAUCHY FR                                   026

Bovet Marcel, agric., Le Crêt ............. 915 11 62
Brodard Aloys, menuiserie-ébénisterie,
   cercueils, rte de l'Église 4 ........... 915 23 07
Brodard Hélène, couture ................... 915 30 44
Café du Lion d'Or ......................... 915 12 01
Clément Roger, transports ................. 915 18 90
```

Translation: "VAUCHY FR, area code 026. Bovet Marcel, farmer, Le Crêt. Brodard Aloys, carpentry and cabinet making, coffins, 4 church road. Brodard Hélène, dressmaker. Café du Lion d'Or. Clément Roger, haulage."

Vauchy and every name and number on the page are invented. The 026 code is right for Fribourg after the 1996 renumbering.

**New items.**

| Id | Name | Description |
|---|---|---|
| `taxcard` | Taxcard | "A Swiss PTT phone card, ten francs. A picture of a mountain lake on the front." |

**Flags.** `knows_brodard` (A1, A3), `read_directory_vauchy`, `brodard_called`. Derived: `has_taxcard` (holds the `taxcard` item), defined like `has_shovel`.

**Derived flag change.** In `src/content/flags.ts`, `suspects_empty_coffin` becomes "two of four": `read_register`, `bernard_light_coffin`, `odile_talked`, `brodard_called`. Replace `twoOf(a, b, c)` with a helper that takes a list and builds every pair. Update `flags.test.ts`.

**Notebook.** On `brodard_called`: "Brodard, Vauchy. Gremaud bought the coffin himself. Pine, lid loose, he took the screws. 'You don't forget the ones you make for nobody.'"

**Hooks.** Needs `knows_brodard`, which needs Simone, which needs day 2. The call helps `suspects_empty_coffin` and so `dinner_day2`. On day 3 it is texture only. The phone box keeps its old lines when `knows_brodard` is not set, and its night 2 ring (`vil_phonebox`) is untouched.

**Build.**
- Phone box interior: the directory on a chain on the shelf, a slot and a small green LCD on the phone for the card's credit.
- `src/levels/village_square/beats.ts` already plays `square_phonebox` from the box's hotspot. Route to `phonebox_brodard` first when its condition holds.
- Sounds in `src/levels/village_square/sounds.ts`: card in, a two-tone beep, a long Swiss ring tone (425 Hz, 1 s on, 4 s off), the pick-up click, a faint radio under the voice (reuse `radio` from `src/levels/inn/sounds.ts` at low volume, band-passed to phone quality), the card ejecting.
- `src/levels/inn/phone.ts`: in `lift()`, before the idle line, play `phone_not_here` when its condition holds.
- `src/levels/laiterie/hints.ts`: with `knows_brodard` and no `taxcard`, near the counter: "The phone box takes taxcards. Ask at the counter."
- `src/levels/village_square/hints.ts`: with `knows_brodard`, `taxcard`, `!brodard_called`: "The phone box is by the Gremaud lane." Point at `PHONE_BOX`.

## A6. Someone on the line

**Type.** Beat. **When.** At the end of the call in A5. **Level.** `village_square`, inside the phone box.

**What happens.** When Brodard has finished, the reporter's own breathing (the recordings in `src/game/breathing.ts`) comes up in the mix, close and slow, as if the receiver picks it up. Then the carpenter asks about it.

### brodard_breath
@speaker: brodard

> ...
> Is there somebody there with you?
> I can hear somebody breathing. Slow.
- [No. I'm alone.] -> brodard_alone
- [Who's there?] -> brodard_alone

### brodard_alone
@speaker: brodard

> Then it's the line. Vauchy has had bad lines since the mobilisation.
> Write what you like. Leave my name out of it.

@speaker: narration
> He hangs up. The display says 2.40. I stand in the box a moment longer than I need to.

After the dialogue closes, the director runs a silence drop of 6 s, and the box's light flickers once. If the player turns round inside the box, there is only the square, the fountain, and fog on the glass. Nothing else happens.

Resolves open. It was most likely the reporter's own breath, but the game never says so.

```ts
{
  id: 'vil_line_breath',
  when: { flag: 'brodard_called' },
  do: [{ silence: 6 }, { run: () => phoneBox.flicker(1) }],
  set: 'vil_line_breath',
}
```

**Flags.** `vil_line_breath` (beat spent).

**Hooks.** Fires only once, after `brodard_called`. Not at night, so it never meets `vil_phonebox`.

**Build.** Raise the reporter's breathing bus for the length of `brodard_breath` and duck it after. A one-flicker method on the phone box light. Both in `src/levels/village_square/`.

## A7. Germaine Kolly and Minet

**Type.** Character and errand (lost and found). **When.** Days 1 to 3, by day. **Level.** `chassot_farm`, plus the cellar room from A8.

**Why she exists.** The laiterie board already says the Kolly family lost a tabby called Minet. Germaine is Ernest Kolly's widow. Thérèse Chassot, born Kolly, was Ernest's niece, so Germaine was Marc's great-aunt. She lives across the road from the shuttered farm, watching it with bad eyes and worse ears. She sat with Thérèse in her last week, and she carries one memory she has never made sense of.

**Where she is.** At her house across the road from the Chassot farm: a small whitewashed house south of the road, its front to the road, the top half of a stable door open. She leans on the bottom half with a shawl round her shoulders. At night the top half is shut and one window is lit.

**What the player does.**

1. Talks to her. She asks about Minet (`minet_missing`).
2. Hears mewing near the cellar hatch on the east side of the farmhouse, by the trodden path. A hotspot "Listen" there plays `farm_mewing` and sets `heard_minet`.
3. Tells Germaine. She explains the cellar and the padlock (`germaine_cellar`, sets `cellar_code_hint`).
4. Opens the cellar (A8) and picks up Minet. Gain item `minet`.
5. Brings Minet back. Germaine tells the reporter about Thérèse's last week (`germaine_minet_back`). Sets `minet_returned`.

### Entry

| Condition | Node |
|---|---|
| `has_minet` | `germaine_minet_back` |
| `!germaine_met` | `germaine_day1` |
| `heard_minet`, `!cellar_code_hint` | `germaine_cellar` |
| `josiane_letterbox`, `!germaine_letterbox` | `germaine_letterbox` |
| `minet_returned` | `germaine_after` |
| Any other | `germaine_again` |

### germaine_day1
@speaker: germaine
! set: germaine_met, minet_missing

> Bonjour. You're looking at Thérèse's house. They all come and look at it now. Since the internet.
> Have you seen a cat? Tabby, white socks. Minet. Five days.
- [Whose house was it?] -> germaine_chassot
- [I'll keep an eye out.] -> germaine_again

### germaine_chassot
@speaker: germaine

> Thérèse Chassot's. My Ernest's niece. He's up the hill now, with her.
> Her boy went to the army in France, and they sent him home in a box. Then she went too. Nobody's opened that door since.
> Somebody keeps her garden. I don't ask. My ears are no good and my eyes are worse.

### germaine_again
@speaker: germaine

> Minet, Minet. Five days. He's never been gone five days.
> If you see him, he comes to his name. When he wants to.

### farm_mewing
@speaker: narration
! set: heard_minet

> Under the house. A cat, mewing, thin and angry. It comes up through a grating by the cellar hatch.
> The hatch has a padlock with four brass wheels.

### germaine_cellar
@speaker: germaine
! set: cellar_code_hint

> Under the house? In Thérèse's cellar? Mon Dieu. He goes in by the grating after the mice, and now he can't get out.
> It's locked. Her padlock with the little wheels.
> She used the boy's birthday for everything. The bicycle lock, the cellar, her post office book.
> The day and the month, the way you write them on a letter. Don't ask me which. I was at his baptism and I can't tell you.
> The church books will know. They know everybody.

### germaine_minet_back
@speaker: germaine
! set: minet_returned, take: minet

> Minet ! Espèce de sale bête. {{Minet! You dirty animal.}}

@speaker: narration
> She takes him in both arms. He lets her.

@speaker: germaine
> In the cellar. Of course. Was it... was it tidy, down there?
- [Somebody's been taking the potatoes.] -> germaine_potatoes
- [Just the cat.] -> germaine_thanks

### germaine_potatoes
@speaker: germaine

> Then somebody's eating. Good. Nothing should rot in that house.
-> germaine_step

### germaine_step
@speaker: germaine

> I'll tell you something. I told the abbé, and he only held my hand.
> The week before Thérèse died, I was sitting with her. It was June, the window was open.
> She said, "That's Marc in the garden. I know his step."
> Then she said, "He drags it now. Why does he drag his foot?"
> Marc never dragged a foot in his life. He ran everywhere. We said it was the morphine.

@speaker: narration
> She strokes the cat. She doesn't look at the farm.
-> germaine_thanks

### germaine_thanks
@speaker: germaine

> Merci. Come for coffee on Sunday, if you're still here.

### germaine_letterbox
@speaker: germaine
! set: germaine_letterbox

> The letterbox? Thérèse's? I haven't put a finger on it since the funeral.

@speaker: narration
> She looks across the road at the farm for a long time.

@speaker: germaine
> Then who?

### germaine_after
@speaker: germaine

> He's asleep on the stove. He's forgotten all about it. Cats.

**New items.**

| Id | Name | Description |
|---|---|---|
| `minet` | Minet | "A tabby with white socks, inside my coat. Thin, furious, and purring." |

**Flags.** `germaine_met`, `minet_missing`, `heard_minet`, `cellar_code_hint`, `minet_returned`, `germaine_letterbox`. Derived: `has_minet` (holds the `minet` item), defined like `has_shovel`.

**Notebook.** On `cellar_code_hint`: "The Chassot cellar padlock: Marc's birthday, day and month. The church books." On `minet_returned`: "Thérèse, the week before she died: Marc's step in the garden. 'He drags it now.' Stef's man limps."

**Hooks.** Optional. The cellar code needs `read_baptism` (the baptisms book in the sacristy cupboard, open from day 2), which already exists and was optional until now. Nothing in the main chain waits on Germaine. Her memory supports what Marc says in `marc_mother` without changing it: he stayed out of sight, and his mother heard him once and was not believed.

**Build.**
- `humanLooks.germaine`: height 1.52, build 0.9, stoop 0.2, white hair `short` under a dark `headscarf`, a black dress as a `skirt` (length 0.62), a gray knitted shawl as a short `coat` (length 0.35), black shoes.
- Her house in `src/levels/chassot_farm/`: a small two-storey house, whitewash and green shutters, 8 by 7 m, south of the road at about (14, 14), front facing the road. A stable door with the top half open, a lit window, a geranium box empty for winter, a bench, and a saucer by the door. Germaine stands at the door with `.watch(5)`.
- Minet: `cat()` from `src/game/ambient/life.ts` with a tabby fur color (about 0x8a6c48) and white feet. He sits in the cellar until picked up. After `minet_returned`, put him on Germaine's window sill, where he stays.
- Mewing and purring: synthesize in a new `src/levels/chassot_farm/sounds.ts`. Mewing every 6 to 12 s from the cellar grating while Minet is down there, by day. A purr loop on the player while they carry `minet`.
- A low grating in the east wall by the hatch, one bar bent.
- Hints in `src/levels/chassot_farm/hints.ts`: near the hatch with `!heard_minet` on any day: "Something is crying under the house. Listen at the grating." With `heard_minet` and `!cellar_code_hint`: "Tell the old woman across the road." With `minet`: "Take Minet back across the road."

## A8. The Chassot cellar

**Type.** Puzzle, and a small room inside an existing building. **When.** Days 1 to 3, by day. **Levels.** `chassot_farm` (the hatch and the lock) and a new interior scene `chassot_cellar`.

**What the player does.**

1. At the sloping cellar hatch on the east side of the farmhouse, uses the padlock. A combination view opens: four brass wheels, 0 to 9.
2. Enters 0304. Marc was born on 3.4.1958 (the baptisms book, [03-church.md](03-church.md#baptisms-1958)). Swiss dates put the day first, so "the way you write it on a letter" is 03 04.
3. The shackle drops. The hatch opens onto five stone steps. Sets `opened_cellar` and loads `chassot_cellar`.
4. Inside, by torchlight: the potato bin, the jars, an army blanket, a jam jar with a candle stub, the height marks on the door frame of the inside stair, and Minet in the blanket. Picks up Minet (A7).

Wrong code: the shackle doesn't move. After three wrong tries the reporter says `cellar_lock_wrong_3`.

At night the hatch says `cellar_lock_night` and does not open. Night 3's candle behind the boards (`vil_chassot_farm`) is untouched.

### cellar_lock_look
@speaker: narration

> A brass padlock with four little wheels. Old, but oiled. The hasp is shiny where it's been opened.

### cellar_lock_wrong_3
@speaker: narration
?if: cellar_code_hint

> I'm guessing. His birthday, she said. Day and month.

### cellar_lock_wrong_3_blind
@speaker: narration
?if: !cellar_code_hint

> Four numbers. I don't even know whose.

### cellar_lock_night
@speaker: narration
?if: night >= 1

> Not at night. Not in there.

### cellar_open
@speaker: narration
! set: opened_cellar

> The shackle drops. Cold air comes up the steps, smelling of earth and apples.

### cellar_bin
@speaker: narration

> Potatoes in a slatted bin. The top layer has been taken, carefully, from one side. The soil on the floor is fresh.

### cellar_jars
@speaker: narration

> Jars on a shelf, labeled in a round old hand. "Poires 1995." "Prunes 1995." Her last summer of jam.
> Half the row is gone. Clean rings in the dust where they stood.

### cellar_blanket_look
-> cellar_blanket ?if: !has_minet, !minet_returned
-> cellar_blanket_after

### cellar_blanket
@speaker: narration

> An army blanket folded on a crate. Gray wool, stenciled in black: BOIS-NOIR. Minet has made a nest in it, and glares at me.

### cellar_blanket_after
@speaker: narration

> An army blanket folded on a crate. Gray wool, stenciled in black: BOIS-NOIR. Cat hair all over it now.

### cellar_candle
@speaker: narration

> A jam jar with a candle stub in it, burned down to a finger's width. Army matches beside it in a brown box.

### cellar_marks
@speaker: narration

> Pencil lines on the frame of the inside stair door, each with a date. "Marc 1964." "Marc 1968." "Marc 1974", level with my eyes.
> After that, nothing.

### cellar_stair
@speaker: narration

> The stair up into the house. The door at the top is shut. No dust on the steps.

### cellar_minet
@speaker: narration
?if: !has_minet, !minet_returned
! give: minet

> A tabby with white socks. He spits at me, and then he's purring against my coat. Minet.

**Flags.** `opened_cellar`. The new scene's spawns: `from_farm` at the foot of the steps.

**Photo.** Photographing the bin, the candle, or the blanket gives `photo_misc` with the caption "Somebody eats here." Add `chassot_cellar: 'Somebody eats here.'` to `miscPhotoCaptions` in `src/content/items.ts`. It is not evidence.

**Notebook.** On `opened_cellar`: "The Chassot cellar. Potatoes taken, jam gone, a candle in a jam jar. An army blanket stenciled BOIS-NOIR. Somebody lives off this house."

**Hooks.** Needs `cellar_code_hint` and `read_baptism` to solve by reasoning, but any player who enters 0304 opens it. It confirms nothing about who comes here. The candle in a jam jar rhymes with the one at the larch on day 3. The stencil rhymes with the BOIS-NOIR scratched on the K.P. 3 key tag.

**Build.**
- `src/game/combinationLock.ts` (new): an overlay with four wheels drawn in the 640x480 UI style. Up and down roll the selected wheel with a click, left and right move between wheels, interact tries, cancel closes. Returns the entered code. Keyboard and gamepad.
- The hatch on the farm's east wall: two sloping wooden doors in a frame against the wall, about 1.4 by 1.2 m, beside the trodden path, with the padlock on a hasp. Opening plays a wood creak and loads `chassot_cellar`.
- `src/levels/chassot_cellar/` (new scene, registered in `src/levels/index.ts`): a vaulted stone cellar about 4 by 5 m, 2.1 m high at the crown, earth floor, five steps up to the hatch (daylight falls down them in a pale square), a wooden stair up to a shut door into the house. Props: slatted potato bin, a shelf of 14 jars (7 gone), a crate with the folded blanket, the jam jar with candle and a matchbox, the pencil marks as a decal on the stair door frame, the grating high on one wall with daylight through it. No electric light. The player needs the torch.
- Sound: room tone, a slow drip, mice in the walls (`miceInTheWalls` from the ambient kit). Minet's mewing from the blanket.
- Exit: walking up the steps returns to `chassot_farm` at the hatch.

## A9. The hatch

**Type.** Beat. **When.** The first visit to `chassot_cellar`. **Level.** `chassot_cellar`.

**What happens.** Eight seconds after the player reaches the floor, the first time they face away from the steps, the hatch falls shut with a bang that shakes dust down. The square of daylight is gone. The ambience drops out for 6 s. If Minet is still there, he mews once, close, and the sound comes back. If not, the player hears only their own breath.

When the player climbs the steps, the hatch opens with a push. The prop stick lies on the top step, snapped, wet and rotten.

### cellar_stick
@speaker: narration

> The stick that held the hatch open. Rotten through. It just gave.

Resolves false.

```ts
{
  id: 'cel_hatch_slam',
  when: [{ after: 8 }, { look: { x: CELLAR_BIN.x, z: CELLAR_BIN.z, angle: 40, hold: 0.5 } }],
  do: [
    { sound: 'sfx_hatch_slam', at: HATCH },
    { run: () => hatch.close() },
    { silence: 6 },
    { run: (ctx) => minetHere(ctx) && mew(ctx.audio, MINET), after: 6 },
  ],
  set: 'cel_hatch_slam',
}
```

**Flags.** `cel_hatch_slam` (beat spent).

**Hooks.** Fires once per game. No stinger: the slam is a world sound, not `sfx_hit`. Random events stay off in the cellar.

**Build.** The daylight square and its light go off when the hatch closes. A hatch slam (low wooden boom with a rattle of dust) in `src/levels/chassot_cellar/sounds.ts`. A dust particle burst from the ceiling. The snapped stick on the top step after the beat, with a hotspot that plays `cellar_stick`.

## A10. A line in the logbook

**Type.** Interaction, with a beat on night 3. **When.** Day 2 or day 3 by day to write. Night 3, or the next day, to read the answer. **Level.** `bunker_interior`, the guard room.

**Why it exists.** Someone already wrote "NE TOUCHEZ PAS AU FOND" in the teenagers' logbook in small careful capitals ([05-forest-bunker.md](05-forest-bunker.md#fort_logbook)). Marc reads that book. Giving the player a way to write back is the first thing in the game they say to him, before they know who he is. He watches and keeps to himself, and his answer is in that style.

**What the player does.**

1. On day 2 or 3, at the guard room desk, picks "Write in the logbook" (a second hotspot beside the existing "Read the logbook").
2. Chooses one of two lines, or nothing. Sets `wrote_in_logbook`, the line's flag, and `logbook_day` to the current day.
3. Later, reads the logbook again. The answer is there on night 3, or on any day after the day they wrote.

### fort_logbook_write
@speaker: narration
?if: night == 0, !wrote_in_logbook

> A pencil stub is tied to the logbook with string. Under "NE TOUCHEZ PAS AU FOND" there's half a page left.
- [Write: "Je ne vous veux pas de mal." {{I mean you no harm.}}] -> fort_logbook_written ! set: wrote_in_logbook, logbook_wrote_harm
- [Write: "Qui êtes-vous ?" {{Who are you?}}] -> fort_logbook_written ! set: wrote_in_logbook, logbook_wrote_who
- [Write nothing.] -> fort_logbook_nothing

### fort_logbook_written
@speaker: narration

> My handwriting looks wrong next to the others. Too new.

The level sets `logbook_day` to the current `day` here.

### fort_logbook_nothing
@speaker: narration

> No. It isn't my book.

### fort_logbook_reply
@speaker: narration
?if: wrote_in_logbook
! set: read_logbook_reply
-> fort_logbook_reply_harm ?if: logbook_wrote_harm
-> fort_logbook_reply_who ?if: logbook_wrote_who

The level opens this node instead of `fort_logbook` when `wrote_in_logbook` holds and either `night == 3` or `day > logbook_day`.

### fort_logbook_reply_harm
@speaker: narration

> Under my line, in small careful capitals: "ALORS FRAPPEZ." {{Then knock.}}
> The pencil lies across the page. I left it on the desk.

### fort_logbook_reply_who
@speaker: narration

> Under my line, in small careful capitals: "PERSONNE. C'EST ÉCRIT SUR LA PIERRE." {{Nobody. It says so on the stone.}}
> The pencil lies across the page. I left it on the desk.

**The beat.** On night 3, when the player closes the reply, a tin cup is set down on concrete somewhere deeper in the fort, once (`sfx_metal_cup`, from the dormitory end). Nothing more. It resolves real, but the player only learns that in the hidden room. Set `fort_logbook_cup` so it plays once.

**Flags.** `wrote_in_logbook`, `logbook_wrote_harm`, `logbook_wrote_who`, `read_logbook_reply`, `fort_logbook_cup`. New count `logbook_day` (0 to 3) in `counts`.

**Notebook.** On `read_logbook_reply`, with `logbook_wrote_harm`: "The logbook. 'ALORS FRAPPEZ.' Then knock." With `logbook_wrote_who`: "The logbook. 'PERSONNE. C'EST ÉCRIT SUR LA PIERRE.'" Use two keyed entries or one entry with a conditional text; the notebook takes one entry per key, so key the second on `logbook_wrote_who` with `if: { flag: 'read_logbook_reply' }`.

**Hooks.** Optional. It does not change `marc_trust`, so the monologue's thresholds stay as they are. "ALORS FRAPPEZ" agrees with the letter's knock, and also with the radiator's three knocks and one on night 1 (`inn_radiator`). If the player wrote on day 2 and returns on day 3 for the larch (A11), they find the answer then.

**Build.** A second hotspot on the guard room desk. The logbook model gets a pencil on a string, and a version of its page texture with each reply in small capitals (two textures). The pencil sits on the desk until the reply exists, then lies across the open page.

## A11. The chart and the boulder

**Type.** Step in the main chain (day 3, the larch). **When.** Day 3. **Levels.** `bunker_interior` (the guard room chart) and `forest_deep` (the track).

**What changes.** A third of the way up the animal track above the fort, the track splits around a boulder the size of a car. The left branch climbs 25 m to a ring of spruce and a rotten hunter's high seat, and ends there. The right branch goes on to the larch. The fog hides both ends. The guard room's wall chart (`fort_chart`), read after the letter, shows the larch as the army's reference point 3, with the track passing right of the boulder.

A player who guesses right loses nothing. A player who guesses wrong walks 25 m to the high seat and back, and gets a hint toward the chart.

**What the player does.**

1. Climbs the track on day 3 and reaches the boulder (`forest_boulder`).
2. Either reads the chart in the fort's guard room (`fort_chart_larch`, sets `read_chart_larch`) or tries a branch.
3. Takes the right branch to the larch. `found_forest_grave` is set as before.

### fort_chart_larch
@speaker: narration
?if: read_gremaud_letter
! set: read_chart_larch

> The chart of the valley. Now I know what to look for.
> Up the slope behind the fort, someone drew a small tree in grease pencil. "Rp 3 - mélèze." Reference point three. The larch.
> The track to it runs to the right of a dot marked "bloc".

The guard room hotspot plays `fort_chart_larch` when its condition holds, otherwise `fort_chart`.

### forest_boulder
@speaker: narration

> A boulder the size of a car, dropped here by a glacier. The track splits around it. Both ways go up into the fog.

### forest_highseat
@speaker: narration

> A hunter's high seat, the ladder rotten through. A plastic bag on the seat, gone white. Nobody has sat up there in years.
> This isn't it.

**Flags.** `read_chart_larch`.

**Notebook.** On `read_chart_larch`: "Fort chart: the larch is reference point 3. Keep right of the boulder."

**Hints** in `src/levels/forest_deep/hints.ts`, registered before "Follow the track uphill":
- Near the boulder, `!read_chart_larch`, `!found_forest_grave`: "The track splits. The army mapped this slope. The chart in the fort's guard room." Point at the boulder.
- Near the boulder, `read_chart_larch`, `!found_forest_grave`: "Keep right of the boulder, as the chart shows." Point up the right branch.
- Near the high seat, `!found_forest_grave`: "A dead end. Go back down to the boulder and take the other side."

In `src/levels/bunker_interior/hints.ts`, on day 3 with `read_gremaud_letter` and `!read_chart_larch`, inside the fort: "The chart on the guard room wall shows the slope above the fort."

**Hooks.** Needs `read_gremaud_letter`, as `forest_deep` already does. Sets nothing the larch depends on, so `found_forest_grave`, the photo, and the six seconds of silence at the grave are unchanged. The notebook goal for the larch stays as it is.

**Build.**
- `forest_deep`: a mossy boulder (`boulder()` from `src/levels/forest_path/woods.ts`, size about 2.5, with a collider) where the track splits. A left branch of worn mud, 25 m, ending in a small clearing walled by dense spruce, with the high seat: four poles, a platform, a rotten ladder with two rungs missing, a white bag on the seat. `offTrack` in `forest_deep/hints.ts` must count the new branch as on the track, so the "You've left the track" hint doesn't fire there. Two crows on the high seat by day (`crows`), which lift off when the reporter comes within 5 m.
- `bunker_interior`: a second texture for the chart with the grease pencil tree and "Rp 3 - mélèze" (the first chart texture stays for day 2), or a decal over it. The hotspot routes by condition.

## Build batches

Batch 1 lands first, because every other batch reads its ids. Batches 2, 3, and 4 then run in parallel. They touch separate folders.

### Batch 1: content and cast

All the script data for A1 to A11, and the three new character looks.

| File | Change |
|---|---|
| `src/content/flags.ts` | New story flags: `simone_met`, `knows_brodard`, `saw_register_gap`, `simone_asked_help`, `simone_printed`, `chu_harmonium_reed`, `josiane_met`, `josiane_seen`, `josiane_letters`, `josiane_letterbox`, `read_directory_vauchy`, `brodard_called`, `vil_line_breath`, `germaine_met`, `minet_missing`, `heard_minet`, `cellar_code_hint`, `minet_returned`, `germaine_letterbox`, `opened_cellar`, `cel_hatch_slam`, `wrote_in_logbook`, `logbook_wrote_harm`, `logbook_wrote_who`, `read_logbook_reply`, `fort_logbook_cup`, `read_chart_larch`. New count `logbook_day` (0 to 3). New derived flags `has_burials_book`, `has_taxcard`, `has_minet`. `suspects_empty_coffin` becomes two of four (A5). |
| `src/content/flags.test.ts`, `src/content/content.test.ts` | Cover the new derived flag and the new nodes. |
| `src/content/items.ts` | `burials_book`, `bulletin_november`, `ruth_note`, `taxcard`, `minet`. `miscPhotoCaptions.chassot_cellar`. |
| `src/content/documents.ts` | `doc_bulletin_november`, `doc_ruth_note`, `doc_directory_vauchy`. |
| `src/content/notebook.ts` | Entries on `knows_brodard`, `josiane_letters`, `josiane_letterbox`, `brodard_called`, `cellar_code_hint`, `opened_cellar`, `minet_returned`, `read_chart_larch`, `read_logbook_reply`, `logbook_wrote_who`. The two day 2 goals from A2. |
| `src/content/speakers.ts` | `simone`, `josiane`, `germaine`, `brodard`, and the role names. |
| `src/content/dialogues/simone.ts` (new) | A1, A2, A3 nodes and Simone's entry table. |
| `src/content/dialogues/josiane.ts` (new) | A4 nodes and entry table. |
| `src/content/dialogues/brodard.ts` (new) | A5 and A6 nodes, including `phonebox_brodard`, `phonebox_lookup`, `phonebox_no_card`, `phonebox_leave`. |
| `src/content/dialogues/kolly.ts` (new) | A7 nodes and Germaine's entry table, A8 and A9 cellar nodes. |
| `src/content/dialogues/fortNotes.ts` (new) | A10 and A11 nodes. |
| `src/content/dialogues/christine.ts` | `christine_taxcard` and the new choice in `christine_shop`. |
| `src/content/dialogues/phone.ts` | `phone_not_here`. |
| `src/content/dialogues/index.ts` | Register the five new files in `areas`, and `simone`, `josiane`, `germaine` in `entries`. |
| `src/engine/characters/cast.ts` | `humanLooks.simone`, `humanLooks.josiane`, `humanLooks.germaine`. |
| `src/engine/characters/human.ts` | `faceSkin` for any face that lacks one. |
| `assets-src/textures/`, `public/assets/textures/face_sacristan.png` | The new face, or skip and use `face_widow`. |

### Batch 2: the village and the Chassot farm

A4, A5, A6, A7, A8, A9, level side.

| File | Change |
|---|---|
| `src/levels/village_square/` (`index.ts`, `beats.ts`, `hints.ts`, `sounds.ts`, `props.ts` or a new `post.ts`) | Josiane and the post van. Phone box routing to `phonebox_brodard`, the card display, the call sounds, the breathing and the flicker (A6). Hints. |
| `src/levels/inn/phone.ts` | `phone_not_here` before the idle line. |
| `src/levels/laiterie/hints.ts` | The taxcard hint. |
| `src/levels/chassot_farm/` (`index.ts`, `hints.ts`, new `kolly.ts`, new `hatch.ts`, new `sounds.ts`) | Germaine's house and NPC, Minet on the sill after return, the grating and the mewing, the hatch and lock, the exit into the cellar. |
| `src/levels/chassot_cellar/` (new scene) | The cellar room, its props and hotspots, Minet, the hatch beat. |
| `src/levels/index.ts` | Register `chassot_cellar`. |
| `src/game/combinationLock.ts` (new) | The four-wheel lock overlay. |

### Batch 3: the church

A1, A2, A3, level side.

| File | Change |
|---|---|
| `src/levels/church/` (`index.ts`, `sacristy.ts`, `nave.ts`, `registers.ts`, `registers.test.ts`, `hints.ts`, `sounds.ts`, new `simone.ts`) | Simone by phase, the gap in the cupboard and the books back, the office computer and printer, the harmonium, its tune and the stuck reed, the beat, hints. |

### Batch 4: the fort and the forest above it

A10 and A11, level side.

| File | Change |
|---|---|
| `src/levels/bunker_interior/` (`props.ts` or `rooms.ts`, `hints.ts`, `index.ts`) | The logbook write and reply hotspots, the two page textures, the pencil, the night 3 cup. The chart's second texture and its routing. The day 3 hint. |
| `src/levels/forest_deep/` (`index.ts`, `dressing.ts`, `hints.ts`, `index.test.ts`) | The boulder, the left branch, the high seat and its crows, `offTrack`, the hints. |

### Not touched

The endings, Marc's monologue, the dig and the watchman's round, the forum posts, the prologue, and every existing character's role. Docs other than this file, one line in [00-overview.md](00-overview.md), and the conversation log in [docs/README.md](../README.md) stay as they are.
