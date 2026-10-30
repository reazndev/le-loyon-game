# Script overview

This is the master plan for the story of Le Loyon, second version (2026-10-30). It replaces the first plot (Marc Chassot, the empty coffin, the key) with a new one on the same map. Read [../story.md](../story.md) first for the premise and the truth. This file fixes the timeline, the order of play, every puzzle, and every flag, item, document, level, and dialogue id, so that writers and programmers can rewrite their parts in parallel.

Elements marked **NEW** do not exist in the game yet and need building. Everything else reuses an existing level, prop, or beat with new text.

## Work split

The other script files still describe the old plot. Each needs a rewrite from this overview. They can be done in parallel; this file is the only shared contract.

| File | Contents | What to rewrite |
|---|---|---|
| [01-prologue.md](01-prologue.md) | Home desktop, 90s web pages, arrival | Forum posts, Stéphane's page, the scanned notice. See [Prologue](#prologue-monday-16-november-1998-2310). |
| [02-village.md](02-village.md) | Villagers, the inn, forum stages | Every villager except Monique's structure. See [Cast](#cast) and [Forum stages](#forum-stages). |
| [03-church.md](03-church.md) | Abbé Overney, registers | The three grave stories, the 1971 register, the catechism list, the holy card scene. |
| [04-cemetery.md](04-cemetery.md) | Graves, Raymond, the dig | Inscriptions, Raymond's subtext, the shed notebooks, the crate. Layout and patrol rules stay. |
| [05-forest-bunker.md](05-forest-bunker.md) | Forest, fort, Lucien, endings | First sighting, the phone, the hidden room, the monologue, the three endings. |
| [06-documents.md](06-documents.md) | Every readable text | See [Documents](#documents). |
| [07-scares.md](07-scares.md) | Anticipation beats | See [Scares](#scares). |
| [research.md](research.md) | Fact checks | Add the topics in [Research to do](#research-to-do). |

## The story in one paragraph

In November 1998 an unnamed reporter reads about a breathing man in a gas mask near the cemetery of Leurs and goes there for three days. The villagers call him Le Loyon and laugh him off. In the cemetery three graves matter: the old schoolteacher's, whose lantern someone lights; a homemade stone for a "Rose" nobody remembers; and the Pittet family plot by the forest wall, due to be cleared in spring. The reporter learns that two foster children worked on the Pittet farm until January 1971, when the girl, Rose, "went back to the city". She never left. She died of a fever nobody treated and was buried at the foot of old Joseph Pittet's grave the night before his funeral. The masked man is her brother Lucien, back after 27 years, dying of farmer's lung, searching for her from a disused army fort. The reporter digs, finds her, and uses what they found to get Lucien to open his door. Then they decide whether to publish.

## Backstory

### The placement

Lucien Bielmann (born 4 March 1959) and Rose Bielmann (born 22 May 1962) grew up in the Basse-Ville, the poor lower town of Fribourg. Their father drowned in the Sarine in 1964. Their mother could not keep them. In April 1966 the guardianship office of the Sarine district placed both children with the farmer Albert Pittet in Leurs. The office paid Albert a monthly boarding fee per child and was supposed to inspect once a year. Inspections were announced in advance.

The Pittets treated the children as labor. Lucien mucked out and cut wood from age 7. Rose minded the hens and the kitchen garden. Both went to the one-room village school taught by Hélène Jaquet, and both went to catechism with the young Abbé Overney. Albert used a strap. His wife Germaine did not stop him. Next door, the Yerly family also took a placed boy, Gilles Dousse, and treated him decently, which the village took as proof that the system worked.

### Rose's death

On Monday 11 January 1971 old Joseph Pittet, Albert's father, died in his bed at 76. The ground was frozen. Raymond Bapst, the gravedigger, needed until Saturday to dig the grave. The funeral was set for Monday 18 January.

On Tuesday 12 January Albert caught Rose taking bread and shut her in the barn for the night at minus fifteen. She came out with a fever. Albert would not fetch the doctor from Romont: the doctor would see the strap marks on her back and tell the office, and the office would take both children and the boarding fees. Germaine nursed Rose in the kitchen. Rose died there in the night of Thursday 14 January. Lucien was asleep in the barn loft.

On Friday 15 January, while Lucien was in the forest cutting wood, Albert told him Rose had been taken to hospital in Fribourg in the office's car. He told the village the same, then changed it to "the office came for her". He told the office nothing.

On the night of Sunday 17 January Albert went to Raymond. Raymond owed him money for a tractor. Albert said the girl had died of a fever and that if it came out they would say the Pittets killed her. Raymond took 200 francs. With a lantern and Albert's tractor on the path, they dug a deeper pit at the foot end of Joseph's open grave, laid Rose in it in a Pittet apple crate, wrapped in a gray blanket and dressed in her checked coat, and covered her. On Monday the village buried Joseph on top. Abbé Overney said the mass. At the graveside Albert told the abbé "the office came for the girl", and the abbé wrote "partie (janv. 71)" next to her name in his catechism list.

### The cover-up

Albert kept cashing Rose's boarding fee for January, February, and March 1971 and entered it in the farm account book. Hélène Jaquet, the teacher, saw Rose's empty seat and was told the office had come for her. She wrote to the office on 2 February 1971 asking where the child had been placed. The office replied on 9 March: "the child Rose Bielmann is placed with Mr Albert Pittet in Leurs, who receives the fee regularly". The two stories did not match. Hélène went to Albert. He told her to mind her school, and at the next council meeting (he sat on the council) her contract came up for review. She stopped asking. In late March Albert reported to the office that the girl had run away. The office closed the file: "fugue, recherches sans résultat". Nobody had searched.

In April 1971 Albert asked the office to move Lucien. He went to a farm in the Broye.

### Lucien's life

Lucien kept asking about Rose. The office told him she had run away and was presumably with relatives. In 1979, at 20, he came back to Leurs drunk and shouted at the Pittets' door. Albert and the syndic called the gendarmes. The prefect ordered him interned at Bellechasse for a year for "dissolute conduct" under administrative internment, without a trial. He came out in 1980 and never asked anyone in Leurs again.

He worked on farms and later at a sawmill in the Gruyère. In 1988 a doctor diagnosed farmer's lung, an allergic lung disease caused by mold spores in hay, which he had breathed since he was 7. By 1998 his lungs are scarred. He cannot walk 20 meters uphill without stopping. Damp air makes it worse. The doctor told him to wear a respirator outdoors.

Albert died in 1985 and lies on his own side of the family plot. Germaine closed the farm in 1986 and moved into a house in the village.

### Why he came back

In August 1996 Hélène Jaquet, dying of cancer, found Lucien's address through a social worker and wrote to him. She enclosed the office's 1971 reply. She wrote that Rose never left Leurs, that she did not know where Rose was, and that she was sorry she had stopped asking. She died in October 1996.

Lucien came to Leurs in July 1997. He moved into the Bois-Noir fort, which the commune had bought from the army in 1994 and left empty. He entered by the forest escape hatch and found the command room's steel door could be bolted from inside. He took a gas mask and filters from the fort's mask store and an army tent sheet as a cape.

He searches. He probes the cemetery's grassy areas at night with a steel rod, looking for an unmarked burial. He has dug dozens of holes across the forest slope above the fort, each marked with a split stick. He has read every stone. He has never probed the Pittet plot. He knew old Joseph died that week, but at 11 he was kept in the barn during the funeral and never knew the grave stood open for three nights. He cannot make himself stand at Albert's grave, and since All Saints 1997 Raymond's torch rests on it every pass.

On All Saints 1997 he set up a stone on an empty bed in row 3, where an old grave had been cleared. He cut it himself from a sandstone block in the fort. Under it he poured a small concrete vault, empty. The stone reads ROSE, 1962 to 1971, JE TE CHERCHE.

He keeps the Pittet farm's kitchen garden, Rose's old job. He takes eggs from the Yerly henhouse and leaves coins. Every Saturday night he lights the lantern on Hélène's grave.

### Who knows what

| Person | What they know | What they do in the game |
|---|---|---|
| Raymond Bapst | He buried Rose. He thinks the ROSE stone means someone knows. He does not know who Le Loyon is and is afraid of him. | Lies. Patrols the cemetery since All Saints 1997, "for the council", really to watch the Pittet plot. Plans to clear it himself in spring. Never calls the gendarmes, whatever the reporter does. |
| Germaine Pittet | Everything about the death and the burial. Suspects Le Loyon is the boy. | Lies on day 2. Confesses on day 3 if the reporter shows her what they found. |
| Abbé Overney | That a placed girl "left" in January 1971. He never connected it to Joseph's funeral. | Helps. Sees his own part on day 2. |
| Gilles Dousse | Lucien is Le Loyon. He recognised him in spring 1998 by his cough at the laiterie at 5 a.m. He does not know where Rose is. | Lies to protect Lucien and himself (his children do not know he was a placed boy). Brings Lucien filters and cortisone from the pharmacy in Romont. Rewired the fort's field telephone so he can ring before coming in. Confesses on day 3. |
| Bernard Yerly | Saw a lantern in the cemetery and Albert's tractor on the path the night before Joseph's funeral. Heard Rose crying in the Pittet barn more than once. | Helps after the reporter brings his heifer home. Ashamed he never asked. |
| Christine Jaquet | Rose sat next to her at school. Rose had a red ladybird hair clip. Her aunt Hélène kept the 1970-71 class register. | Helps. Gives the register. |
| Monique Rossier | Nothing. She married into Leurs in 1975. | Neutral. Runs the inn, feeds the reporter. |
| Yannick Rossier | Has watched Le Loyon many times. Has seen Gilles carry jerrycans into the forest. Does not know who Le Loyon is. | Posts as "veilleur". Revealed on day 3. |

### Who "veilleur" is

Unchanged. A forum user called veilleur ("watchman") posts during the game and always knows where the reporter has been. It is Yannick Rossier, 16, the innkeeper's son and apprentice at Gilles's garage. He signed Stéphane's guestbook as "yann" in the prologue. Revealed on the evening of day 3.

### Ambiguity until the end

Keep three doubts open:

- Whether Le Loyon is a man at all.
- Whether he is the one who hurt Rose. The ROSE stone with JE TE CHERCHE reads like a stalker's message. The probe holes and the field of holes on the slope read like many graves. The player should fear it until the hidden room.
- Who is watching the reporter.

Rules for every writer and level builder:

- Never show Le Loyon's face or a clear full-body view before the hidden room. He never takes off the mask.
- Before he is seen, he is heard: a slow, wet breath through a filter, and now and then a cough. Never a growl or a scream.
- He moves slowly and stops every few meters to breathe. He does not limp. **NEW** for the character model: replace the left-leg limp with stops of 1 to 2 seconds, shoulders rising.
- Villagers never call him a ghost. They say tramp, drunk, joke.
- Photo 7 (the treeline) still shows a figure the player did not see. In the hidden room Lucien's ledger mentions the flash.

## Timeline

| Date | Event |
|---|---|
| 1894 | Joseph Pittet born. |
| 1918 | Albert Pittet born. |
| 1921 | Germaine Pittet born. Hélène Jaquet born. |
| 1930 | Raymond Bapst born. Gravedigger of Leurs from 1960. |
| 1935 | Bernard Yerly born. |
| 1946 | Hélène Jaquet starts teaching in Leurs. |
| 1957 | Gilles Dousse born. Placed at the Yerly farm 1964 to 1973. |
| 4 March 1959 | Lucien Bielmann born in Fribourg. |
| 1962 | Rose Bielmann born 22 May. Christine Jaquet born. |
| 1964 | The children's father drowns. |
| April 1966 | Lucien and Rose placed at the Pittet farm. |
| 1968 | Louis Overney becomes curé of Leurs. |
| Christmas 1970 | The abbé gives each catechism child a holy card with their name on the back. |
| Mon 11 January 1971 | Joseph Pittet dies. |
| Tue 12 January 1971 | Rose shut in the barn overnight. |
| Thu 14 January 1971 | Rose dies in the night. |
| Fri 15 January 1971 | Lucien told she went to hospital. |
| Sun 17 January 1971, night | Albert and Raymond bury Rose at the foot of Joseph's grave. Bernard sees the lantern. |
| Mon 18 January 1971 | Joseph's funeral. The abbé writes "partie" next to Rose's name. |
| 2 February 1971 | Hélène writes to the guardianship office. |
| 9 March 1971 | The office replies that the child is still with Albert Pittet. |
| Late March 1971 | Albert reports a runaway. File closed. |
| April 1971 | Lucien moved to the Broye. |
| 1979 | Lucien shouts at the Pittets' door. Interned at Bellechasse for a year. |
| 1983 | Gilles opens his garage. Hélène retires. |
| 1985 | Albert Pittet dies. |
| 1986 | Germaine closes the farm and moves into the village. |
| 1988 | Lucien diagnosed with farmer's lung. |
| 1994 | Commune buys the Bois-Noir fort. |
| August 1996 | Hélène writes to Lucien. |
| October 1996 | Hélène dies. Buried in row 2. |
| June 1997 | The council decides to clear rows 4 and 5 (burials before 1975) in spring 1999. Notice in the official gazette. Germaine's request to renew refused. |
| July 1997 | Lucien moves into the fort. |
| October 1997 | First sightings posted online. |
| 1 November 1997 | The ROSE stone appears. Raymond starts night rounds. |
| Spring 1998 | Gilles recognises Lucien and starts helping him. |
| Mon 16 November 1998 | Prologue. |
| Tue 17 to Fri 20 November 1998 | The game. |

## The map of Leurs

Unchanged except for names. Another agent is shortening the walking distances between areas; no beat in this plot depends on a long walk.

```
                         N
                         ^
            [ slope of holes, forest hatch ]   (deep forest, day 3)
                     |
   [ FORT: "barn" ]----- forest path ------+
                                           |
                             [ fork / shrine with the Virgin ]
                                           |
                  [ CEMETERY on the hill, back wall + gate ]
                                           |
                               path up the hill
                                           |
  [ Pittet farm ]          [ CHURCH ]------+
   (derelict, barn)              |
        \                 [ VILLAGE SQUARE ]----[ INN Croix-Blanche ]
         \                 | bus stop, fountain,   |
          +--- road -------+ phone box             +--[ Germaine Pittet's house ]
                           |
             [ Laiterie ]--+--[ Garage Dousse ]
                           |
                       road south ---- [ Yerly farm ] ---- field edge to Bois-Noir (heifer)
```

| Area id | Old id | Place | Notes |
|---|---|---|---|
| `home` | same | The reporter's flat | Unchanged. |
| `village_square` | same | Place du village | Unchanged. |
| `inn` | same | Auberge de la Croix-Blanche | Unchanged. |
| `church` | same | Église Saint-Maurice | The register cupboard now holds the 1971 burials and the catechism list. |
| `house_pittet` | `house_gremaud` | Germaine Pittet's house | Front step and door. Rename the level id. |
| `house_pittet_kitchen` | `house_gremaud_kitchen` | Germaine's kitchen | Day 2 and 3. The garage with the Opel goes; Germaine never drove. The fridge clipping becomes a framed photo on the dresser. |
| `laiterie` | same | Laiterie-épicerie | Run by Christine Jaquet. |
| `garage_dousse` | same | Garage Dousse | The pinned 1979 postcard becomes a 1970 school photo. |
| `yerly_farm` | same | Ferme Yerly | Unchanged. The tool shed no longer gives a shovel. |
| `pittet_farm` | `chassot_farm` | Ferme Pittet | Shuttered, overgrown. The kept garden behind it now has Lucien's spade (**NEW** pickup). The barn door opens on day 2 (**NEW**). |
| `pittet_barn` | none | The Pittet hay barn | **NEW**, optional, small. One room and a loft ladder. Where the children slept. |
| `cemetery_path` | same | Chemin du cimetière | Unchanged. |
| `cemetery` | same | Cimetière | Same layout and grave positions. New inscriptions. Probe holes along the back row (**NEW** decal and hotspot). The shed gets a tin of notebooks (**NEW** hotspot). Yellow clearing tags on the row 4 and 5 stones (**NEW** props). |
| `forest_path` | same | Bois-Noir, chemin | Unchanged. |
| `forest_deep` | same | Bois-Noir, haut | The larch and cross go. In their place, a slope with about forty filled holes, each marked with a split stick (**NEW** props). The forest hatch stays. |
| `bunker_exterior` | same | La grange du Bois-Noir | Unchanged. |
| `bunker_interior` | same | Fort, outer rooms | A new gray wire runs along the ceiling from the guard room phone to the dormitory wall (**NEW** prop). One empty hook in the mask store. |
| `bunker_hidden` | same | Fort, command room | Lucien's room. New props, see night 3. The hidden door has no keyhole on the outside. |

## Cast

| Id | Old id | Name | Age | Role |
|---|---|---|---|---|
| `lucien` | `marc` | Lucien Bielmann | 39 | Le Loyon. Former placed child. Farmer's lung. Lives in the fort. Shows as "Le Loyon" until `lucien_named`. |
| `overney` | same | Abbé Louis Overney | 71 | Curé since 1968. Wrote "partie" next to Rose's name. |
| `monique` | same | Monique Rossier | 52 | Innkeeper. Widow. |
| `yannick` | same | Yannick Rossier | 16 | Her son. Apprentice at the garage. Is "veilleur". |
| `bernard` | same | Bernard Yerly | 63 | Dairy farmer, the Pittets' old neighbor. Saw the lantern in 1971. |
| `gilles` | same | Gilles Dousse | 41 | Mechanic. Former placed boy at the Yerlys'. Secretly helps Lucien. |
| `christine` | same | Christine Jaquet | 36 | Runs the laiterie. Hélène's niece. Rose's classmate. |
| `germaine` | `odile` | Germaine Pittet | 77 | Albert's widow. |
| `raymond` | same | Raymond Bapst | 68 | Gravedigger and night watchman, dog Bari. Buried Rose. |
| `driver` | same | PostBus driver | | Unchanged. |
| `editor` | same | Ruth Aebischer | | Unchanged. |
| `rose`, `helene`, `albert`, `joseph` | `daniel`, `gremaud`, `therese` | | | Dead. Appear only in documents and stories. |

The reporter has no name and no gender. Monique calls them "number three". The paper is *L'Écho*.

Speaker labels in `src/content/speakers.ts`: replace `marc: 'Marc'` with `lucien: 'Lucien'` and `odile: 'Odile'` with `germaine: 'Germaine'`. Keep `loyon: 'Le Loyon'`. Germaine's role label stays "Woman at the door". Christine's stays "Woman at the dairy". Germaine uses the `face_old_woman` texture instead of `face_widow`.

## Flow of play

Target times are real play time for a first run. Total about 2 hours 20 minutes, about 20 minutes longer than the first plot.

### Prologue: Monday 16 November 1998, 23:10

Area: `home`. Mechanics unchanged. Content changes:

- The editor's email is the same: three days for a "strange Switzerland" piece.
- **GAS MASK MAN thread.** Posts describe a man in a gas mask and an army cape near a cemetery in Fribourg, and the breathing: "you hear him first, like someone breathing through a sock". Cloudy links Stéphane's page. pivex gives the bus line and "4 buses a day, the last at 18:52". Puzzle P1 is unchanged.
- **Stéphane's Le Loyon page.** Blurry photos: a figure at a cemetery wall in fog; the hand-cut ROSE stone with the caption "someone made a grave for a ghost??"; the "barn" in the forest. The page names Leurs.
- **The scanned notice.** The thread "old death notice, coincidence??" becomes "cemetery notice in the FO (scan)". Someone scanned the commune's notice from the official gazette of June 1997: the commune of Leurs will clear rows 4 and 5 of its cemetery (burials before 1975) in spring 1999, and families may collect stones and plaques until 31 March 1999. A reply jokes that Le Loyon is protesting. A later reply notes the first sightings came right after.
- The guestbook still has "yann".

Flags unchanged: `pro_read_mail`, `pro_read_board`, `pro_read_thread_bus`, `pro_read_homepage`, `pro_read_guestbook`, `pro_done`, and derived `pro_knows_village`. Items gained: `notebook`, `polaroid_camera` (10 shots), `pocket_money`.

### Day 1: Tuesday 17 November, 16:20 to evening (25 min)

Areas open: `village_square`, `inn`, `church`, `laiterie`, `garage_dousse`, `yerly_farm`, `house_pittet` (doorstep), `pittet_farm` (exterior), `cemetery_path`, `cemetery`. Closed: the forest past the cemetery, the fort.

1. PostBus arrival. Sets `arrived`.
2. **Check in** with Monique. Gives `inn_room_key`, sets `inn_checked_in`.
3. **The abbé.** He says Le Loyon is seen at the cemetery, always at three graves, and tells them: Hélène Jaquet, who taught everyone in Leurs to read, whose lantern someone lights on Saturdays; the ROSE stone that appeared last All Saints ("I have buried everyone in this parish since 1968. I buried no Rose."); and the Pittet plot at the back wall, which the council will clear in spring, and which Germaine fought to keep. He mentions the registers for tomorrow after morning mass. Sets `abbe_met`, `abbe_told_graves`.
4. **The others.**
   - Gilles calls Le Loyon a tramp from the Broye who "wheezes like my compressor". The 1970 school photo is pinned above his bench; the reporter can look at the front (`doc_school_photo`, front page only). Gilles points himself out in the back row and turns away. Sets `met_gilles`.
   - Bernard is short. His heifer got out in the fog. Eggs go missing and coins turn up in the nests. Sets `heifer_missing`.
   - Christine says someone lights her aunt's lantern on Saturdays. "Not me. I can't afford the candles."
   - Germaine opens the door a hand's width. "I have nothing for newspapers."
5. **Inn computer.** Forum stage 1.
6. **Dinner.** Same rule as before: after `abbe_told_graves` and two other conversations, Monique serves soup and lends the torch. Gives `flashlight`, sets `dinner_day1`. Night 1 starts.

### Night 1 (20 min)

1. **The three graves.** Read them: `read_grave_jaquet`, `read_grave_rose`, `read_grave_pittet`. The lantern on Hélène's grave is lit, nobody around: `saw_lantern_lit`.
2. **NEW: probe holes.** Along the back row, in the grass between beds, a line of finger-wide holes a hand apart, freshly made. Hotspot "Look at the grass". Narration: someone has been pushing a rod into the ground, row after row. Sets `found_probe_holes`.
3. **NEW, optional: the gravedigger's notebooks.** In the ossuary shed, next to the tarp, a biscuit tin with 38 school exercise books, one per year since 1960, in Raymond's hand: name, date, dimensions, fee. Reading the tin opens `doc_gravedigger_book`, the 1971 book open at January. The Pittet Joseph entry has a second line in different ink: "+ 0,60 au pied. A.P. 17.1. 200.-" (plus 60 cm at the foot, A.P., 17 January, 200 francs). Sets `read_gravedigger_book`. The player can read it now and understand it later. Taking the book is offered only after `found_rose` (see night 2).
4. **Raymond and Bari.** Dog bark jumpscare, unchanged. Raymond says the council asked him to watch because of the ROSE stone and the lantern, "some sick joke". His torch rests on the Pittet plot longer than anywhere else. He tells the reporter to go down. Sets `met_raymond`. This teaches the patrol.
5. **First sighting.** When all three graves are read and Raymond has gone down: first the breathing, from beyond the back wall. Then a figure stands at the forest edge outside the cemetery, past the back gate, about 15 m off, watching. When the reporter's torch finds him, the mask lenses flash for a moment. He turns, slowly, and walks into the forest, stopping once to breathe. The back gate is open. Sets `first_sighting`; the forest path opens.
6. **Follow.** He is seen twice more ahead, lost at the shrine fork. The path leads to the barn. The wooden door opens; the steel door behind it will not. On the other side, a cough, then a bar dragged into place. Sets `found_bunker`, `bunker_door_wedged`.
7. Sleep in room 3.

`skipped_follow` stays as before for players who go back without following.

### Day 2: Wednesday 18 November (40 min)

Forum stage 2 in the morning. Areas newly open: `forest_path` by day, `bunker_exterior`, `bunker_interior`, `house_pittet_kitchen` (when `read_register` or `knows_placed_children`), `pittet_barn` (**NEW**).

**P2: the register and the catechism list.** After morning mass the abbé opens the register cupboard. The reporter asks about a Rose. The abbé finds nothing in the burials. The reporter asks what else happened in 1971; the abbé gets out the 1971 burials (`doc_register_1971`): N° 1, Pittet Joseph, died 11.1.1971, buried 18.1.1971, "inhumation retardée par le gel" (burial delayed by frost). Sets `read_register`. Then he remembers he kept catechism lists in the same cupboard (`doc_catechism_1970`): "Bielmann Rose, placée chez Pittet", and in his own hand, "partie (janv. 71)". Sets `read_catechism`. Talking to him after that plays his realisation: Albert told him at Joseph's graveside, and he wrote one word and never asked the office. Sets `abbe_admits` and `knows_placed_children`.

**P3: the heifer and Bernard's night.** Unchanged mechanics: find Marquise at the forest edge above the Yerly field, staring into the trees (the breathing is audible from the spruces), lead her home (`heifer_found`, `heifer_returned`). Bernard thanks the reporter and, asked about the Pittets, tells two things. Gilles was his father's placed boy and "we were decent to him". And on the Sunday night before old Joseph's funeral, at minus fifteen, he saw a lantern up at the cemetery, Albert's tractor on the path, and Raymond's bicycle at the wall. He thought they were thawing the ground. He didn't go up. He also heard the Pittet girl crying in their barn more than once, and didn't go over. Sets `bernard_1971_night`, `knows_placed_children`. **Bernard does not lend a shovel.** If asked, he says Raymond has the only grave spade in Leurs and keeps it at home now. Bernard also mentions that someone keeps the Pittet garden: "Leeks, in November. I don't go over there."

**P4 (NEW location): the spade.** In the kept garden behind the Pittet farm, from day 2, a spade stands in a row of leeks. Its blade is caked with yellow clay, the clay of the cemetery hill, not the black garden soil. Taking it gives `shovel` (display name "Spade"). Narration: whoever owns this has been digging somewhere else. The existing `chassot_garden` hotspot becomes `pittet_garden`.

**NEW, optional: the Pittet barn.** The barn door is unlatched. Inside: a corner of the hayloft with two straw sacks. On the doorframe, height notches cut with a knife: "L 66", "R 66", "L 67", "R 67" up to "R 70". Higher than all of them, one fresh cut: "L 98". Sets `saw_barn_marks`. Reading opens `doc_barn_marks`.

**Christine.** She talks about Rose: Rose sat next to her, was hungry all the time, had a red ladybird hair clip with one spot rubbed off, and one January didn't come back. If asked, she fetches her aunt's class register for 1970-71 from the back room. Gives `class_register` (`doc_class_register`): Rose marked absent on 12, 13, and 14 January; from 15 January her line is ruled through with "partie ?"; and in red ink at the bottom of the page, added later: "Écrit à l'Office 2.2.71. Réponse 9.3.71 : l'enfant est chez M. Pittet. ???". Sets `christine_rose_hint`.

**Germaine (kitchen).** She lets the reporter in when `read_register` or `knows_placed_children`. She lies: the office came for the girl the week Joseph died, the boy stayed until spring, "they were not ours to keep". On the dresser, a framed photo (`doc_pittet_photo`): the farm in summer 1970, Albert, Germaine, old Joseph, and two thin children; the girl wears a checked coat with a big collar. The kitchen clock stops while she talks (`kit_clock_stop`, kept). Sets `germaine_talked`.

**Gilles.** With `knows_placed_children`, the reporter can turn the school photo over (`doc_school_photo`, back page): names in the teacher's hand, including "Lucien B." and "Rose B.". Gilles says he doesn't remember them. A lie, and his voice gives it away. Sets `knows_placed_children` if not set.

**P5: the hidden door and the phone.** In daylight the fort's steel door stands open (`bunker_door_open`). Outer rooms as before. In the mask store one hook is empty. The swept dust and the cupboard puzzle are unchanged (`looked_at_dust`, `found_hidden_door`, `cupboard_restored`). Behind the cupboard is the steel door stamped "K.P. 3". It has no handle and no keyhole on this side. The biscuit wrapper is still there (`found_biscuit_wrapper`). **NEW:** in the guard room, a new gray wire runs from the old crank field telephone along the ceiling toward the dormitory. Cranking it makes a bell ring faintly behind the K.P. 3 door. Nobody answers. Sets `phone_rang_day2`. **NEW:** a pharmacy bag from Romont hangs on a nail beside the K.P. 3 door: filter cartridges and a box of cortisone tablets, with a receipt stapled to the bag, "Garage Dousse, compte". Sets `found_pharmacy_bag`.

**Suspicion.** `suspects_pittet_grave` holds when two of `read_register`, `bernard_1971_night`, `christine_rose_hint` are set. The notebook then reads: "Rose stopped coming to school the week Joseph Pittet was buried. His grave stood open three nights. Is she in it?"

**Evening.** Forum stage 3. Dinner (`dinner_day2`) requires `has_shovel` and `suspects_pittet_grave`; otherwise the reporter says "Not yet. I need to know more first."

### Night 2: the dig (20 min)

Patrol mechanics unchanged: Raymond's rounds every 90 s (70 s after noise), Bari's bell, whistling, torch cone, crouching, the shed, the tarp (`tarp_over_hole`), `raymond_warned`, `caught`. Raymond checks the Pittet plot on every pass, which is what the old round did with the Chassot plot.

The lantern on Hélène's grave is dark tonight. Lucien is in the trees beyond the back wall, watching. At `dig_stage` 3 the breathing is audible from the other side of the wall for a few seconds, then stops.

- **Diggable:** the foot of the Pittet plot, Joseph's side, the forest end. This is the hole position the old "Marc's side" used.
- **Albert's side** (old "Thérèse's side"): the reporter refuses. "Albert. 1985. Whatever happened here happened before him."
- **Hélène's grave:** refuses. "No. Not her."
- **The ROSE stone:** two strokes hit concrete. The concrete is fresh, and the blade's knock rings hollow. "Poured, not old. There's a space under it. Empty." Noise raises the patrol alert. Sets `dug_rose_stone`.
- **Other graves:** generic refusal, unchanged.

Five stages as before. At stage 5 the blade hits wood, but small and shallow under the foot end, not a coffin. A slatted crate, rotten, with "PITTET LEURS" stenciled on the side. The top slats lift away. Inside: a gray wool blanket, a child's shoe, and a checked coat with a big collar, the coat from Germaine's photo. In the coat pocket, a holy card. In the blanket, near where the head would be, a red ladybird hair clip with one spot rubbed off. The reporter does not touch anything else.

Gives `holy_card` and `hair_clip`. Sets `found_rose`. Reading the card (`doc_holy_card`) sets `read_holy_card`: a Saint Rose of Lima card, and on the back in the abbé's handwriting, "Rose Bielmann, Noël 1970". Photo: `photo_crate` (strong evidence).

If `read_gravedigger_book` is set and the reporter goes back to the shed after `found_rose`, they can take the 1971 notebook: gives `gravedigger_notebook`.

**Refill.** Optional, three stages, same rules. Sets `grave_refilled`. Leaving without refilling sets `grave_left_open`. **Change from the first plot:** Raymond finds the open grave at dawn and fills it in himself. He tells nobody and does not call the gendarmes.

Sleep ends night 2.

### Day 3: Thursday 19 November (35 min)

Forum stage 4 in the morning (content depends on `grave_left_open`). Area newly open: `forest_deep`.

1. **NEW: Raymond on the path.** The first time the reporter enters `cemetery_path` or the square on day 3, Raymond is waiting. If `grave_left_open`, his boots and trouser cuffs are yellow with clay. He says dogs dug at the Pittet grave and he filled it. He asks what the reporter found. Choices: tell him, say nothing, or (with `gravedigger_notebook`) "I have your notebook." If told, he says he has waited 27 years for someone to dig there, that the girl had a fever and nobody hit her that night, and that he took 200 francs and has paid for it every night since. He does not threaten anyone. He asks if the masked man is the brother. Sets `raymond_confronted`.
2. **NEW: Germaine's confession.** With `found_rose`, the reporter can show Germaine the holy card or the clip. She sits down. She tells the night of 14 January: the fever, the strap marks, Albert refusing the doctor, Rose dying in her lap at the kitchen table "about three". She gives the farm account book for 1971 (`pittet_ledger`, `doc_pittet_ledger`): "Pension Bielmann R." entered for January, February, and March 1971. "Take it. I've tried to burn it four times." She asks whether the man in the mask is the boy. Sets `germaine_confessed`.
3. **NEW: the abbé and the card.** With `holy_card`, the abbé recognises his own handwriting. He says Rose's name at the noon Angelus. He does not tell the reporter what to do with the story. Sets `abbe_day3`, `abbe_saw_card`.
4. **NEW: Gilles's confession.** With `found_rose`, at the garage. If `found_pharmacy_bag` the reporter can lead with the receipt; otherwise Gilles opens up when told about the crate. He was the Yerlys' placed boy, 1964 to 1973. Lucien was his friend at school. In spring he heard that cough at the laiterie door at 5 a.m. and knew it. He brings filters and cortisone, and diesel for the fort's generator; he rewired the field telephone so he could ring before going in. He gives the ring: two short, one long. He asks not to be named; his children don't know what he was. Sets `gilles_confessed`.
5. **The slope of holes.** Above the fort (`forest_deep`): about forty filled holes across the slope, each marked with a split stick, some with a date scratched on. It reads as a mass grave until the reporter looks closer: every hole is filled, every stick says when. Reading opens `doc_search_holes`. Sets `found_search_holes`. Photo: `photo_search_holes` (weak evidence). The forest hatch is here, as before.
6. **The editor calls** the inn phone at noon. Unchanged. Sets `editor_called`.
7. **Food.** Christine or Monique, as before. Gives `food_parcel`.
8. **Evening.** Inn computer, forum stage 5, Yannick in the doorway (jumpscare 2, unchanged). Yannick admits to being veilleur, says he has heard Le Loyon breathe from ten meters, and has seen Gilles carry jerrycans into the forest. Sets `met_veilleur`. This starts night 3, as before.

### Night 3: the call (20 min)

1. **NEW, optional: Raymond at the plot.** Passing the cemetery, the reporter sees Raymond standing at the Pittet plot in the dark, no torch, not moving. Bari lies at his feet. He does not notice the reporter. Sets `saw_raymond_night3`. No patrol tonight.
2. The lantern on Hélène's grave is lit.
3. **P6: the field telephone.** In the guard room the reporter cranks the phone. Crank input is a sequence of short and long turns.
   - Two short, one long (from Gilles): `ring_code_done`, `lucien_trust += 1`. He picks up and says "Gilles?" Then silence when nobody answers.
   - Any other pattern: he picks up and says nothing. Only breathing.
   Either way the dialogue continues. The reporter says they found Rose. "Where." "At the foot of Joseph Pittet's grave." A long silence. "What did she have in her hair." The choice "A ladybird clip. Red. One spot rubbed off." needs `has_hair_clip`. Other choices make him hang up; the reporter can ring again. On the right answer: `phone_answered`, and a bolt slides back in the dormitory.
4. **The room.** With `ring_code_done`: the door opens from inside, Lucien stands back in the dark, masked, holding a candle. Calm meeting. Without it: the door swings open on an empty room lit by one candle; when the reporter turns to leave, Lucien is in the doorway behind them, back from the escape tunnel (jumpscare 3). He does not move toward them. Sets `entered_hidden_room`.
5. **What's in the room (all NEW text, existing hotspots where possible):**
   - Camp bed, candle, the mask hook with spare filters.
   - A school exercise book (`doc_lucien_ledger`): every grave in the cemetery listed by row, each crossed out after probing; the forest holes with dates; recent pages about the reporter in short entries, including the Polaroid flash on night 1. Sets `read_lucien_ledger`. If `cupboard_restored`, the later pages note that the stranger put the cupboard back (`doc_lucien_ledger_restored`).
   - A photo (`photo_siblings`): two children on the Pittet farmyard in April 1966, holding cardboard suitcases. On the back: "Lucien et Rose, arrivée".
   - A folder (`doc_lucien_papers`): the Bellechasse release paper of 1980 and a 1996 hospital letter about pulmonary fibrosis.
   - A tin (`doc_helene_letter`): Hélène's 1996 letter and the office's 1971 reply. Sets `saw_helene_letter`.
   - The steel probing rod, a sandstone off-cut with practice letters R O S E, a sack of cement.
6. **The monologue.** Choices raise `lucien_trust` (0 to 5) as before: the ring code (+1), food (+1, takes `food_parcel`), giving him the clip (+1, takes `hair_clip`, sets `gave_clip`), and two choices in the conversation (+1 each). Asking to photograph him: `lucien_trust >= 2` lets the reporter photograph the mask only (`lucien_photo_consent`, gives `photo_loyon_masked`). Otherwise the reporter can take it anyway (`took_forced_photo`, gives `photo_loyon_forced`, sets trust to 0), and he turns away and the scene ends coldly. If the reporter has `shovel`: "You have my spade."
   He tells his story in his own order: the farm, the hospital lie, Bellechasse, the hay and his lungs, Hélène's letter, the stone and the empty vault. He names himself (`lucien_named`). He asks the reporter not to write about him. He will take Rose out himself before the spring clearing and lay her under her own stone. "The last time an office came for Rose, it was a lie. I won't hand her to another one." If `lucien_trust >= 1` he gives the reporter Hélène's letter, "so someone outside knows she asked" (`helene_letter`). Sets `met_lucien`.
7. The reporter leaves through the escape tunnel at dawn.

### Endings: Friday 20 November

Mechanics unchanged. The reporter writes longhand in room 3 and makes the call from the stübli phone. Phoning in the story gives `ending_publish`; telling Ruth there is nothing gives `ending_secret`. `ending_leave` is at the bus stop any time from day 1 evening until `met_lucien`. `caught` is a failure state with "Continue from the last sleep".

**Publish, with `has_evidence`.** Front page: "THE GIRL WHO 'WENT BACK TO THE CITY'". Subhead: a child placed on a farm in Leurs in 1971 never left the village; she has lain in another man's grave for 27 years. Paragraphs by flag:

- Always: the placement, the fever, the burial at the foot of Joseph Pittet's grave, the office's file closed as a runaway.
- `pittet_ledger`: the boarding fee was collected for two months after her death.
- `helene_letter`: the teacher asked in 1971, and the office replied that the child was still with the farmer.
- `gravedigger_notebook`: the gravedigger's own notebook records extra depth at the foot of the grave, for 200 francs.
- `grave_left_open`: the grave was opened this week and filled in again by persons unknown.
- `lucien_photo_consent`: Le Loyon's portrait, masked, and that he is her brother and asked not to be named. The paper does not name him.
- `took_forced_photo`: the blurred photo, and the paper names him.
- Gilles is never named, whatever the flags.

Epilogue cards: the canton exhumes Rose in December and identifies her; no one can be charged, because the time limits ran out long before; Germaine dies in February; Raymond resigns as gravedigger; Lucien is taken to the cantonal hospital in Fribourg; Rose is buried under her own name on 14 January 1999, the abbé says the mass, the whole village comes, and a man with an oxygen bottle stands at the back without a mask. Optional final card: in 2013 the Swiss government apologised to the people placed as children (see [Research to do](#research-to-do)).

**Publish, without evidence.** Page 7, "Strange Switzerland": a short folklore piece about the gas mask man. Ruth cut everything else. Epilogue: in spring the back rows are cleared; Raymond digs the Pittet plot alone at dawn and reports nothing found.

**Keep the secret.** Ruth is annoyed. Epilogue: early December, fresh earth on the Pittet plot one morning and new mortar round the ROSE stone; Raymond fills the plot level and says nothing. In spring he clears it and finds nothing at the foot. The lantern on Hélène's grave stops being lit in February. If `has_helene_letter`, the last card is the reporter putting the letter in a drawer.

**Leave.** The reporter goes home. Epilogue: in spring Raymond clears the Pittet plot alone at dawn; the commune breaks up the ROSE stone; the forum keeps reporting a breathing man in the fog above Leurs.

Forum stage 6 posts close each ending, as before.

## Puzzle summary

| Id | Where | Goal | Solution | Gives | Status |
|---|---|---|---|---|---|
| P1 | Home PC | Find the village | Read the bus post and Stéphane's page | `pro_knows_village` | Kept |
| P2 | Church | Connect Rose to the Pittets and to January 1971 | Read the 1971 burials and the catechism list | `read_register`, `read_catechism` | New content |
| P3 | Yerly farm, forest edge | Get Bernard to talk | Lead the heifer home | `bernard_1971_night` | New reward |
| P4 | Pittet farm garden | Get a spade | Find Lucien's spade among the leeks | `shovel` | **NEW** location |
| P5 | Fort, dormitory and guard room | Find the room and a way to reach it | Swept dust, push the cupboard, crank the phone | `found_hidden_door`, `phone_rang_day2` | Phone part **NEW** |
| P6 | Cemetery, night 2 | Find Rose | Dig the foot of the Pittet plot, hide from Raymond | `holy_card`, `hair_clip`, `found_rose` | New target and find |
| P7 | Germaine's kitchen, day 3 | Get the truth and proof | Show her the card or clip | `pittet_ledger` | **NEW** |
| P8 | Fort guard room, night 3 | Get Lucien to open | Ring (code optional), say where Rose is, describe the clip | `phone_answered` | **NEW**, replaces the knock |

## Items

`has_evidence` is true when the player holds any strong evidence item or `holy_card`.

| Id | Name in game | Source | Use | Evidence |
|---|---|---|---|---|
| `notebook` | Notebook | Start | Quest log | |
| `polaroid_camera` | Polaroid camera | Start | 10 shots | |
| `pocket_money` | Wallet | Start | Flavor | |
| `inn_room_key` | Key, room 3 | Monique, day 1 | Room 3 | |
| `flashlight` | Torch | Monique, dinner day 1 | Light at night | |
| `class_register` | Class register, 1970-71 | Christine, day 2 | Document `doc_class_register` | |
| `shovel` | Spade | Pittet garden, day 2 | Digging. Description: yellow clay on the blade. | |
| `hair_clip` | Ladybird hair clip | The crate, night 2 | The answer on the phone. Given to Lucien. | |
| `holy_card` | Holy card | The crate, night 2 | Document `doc_holy_card`. Shown to Germaine and the abbé. | counts for `has_evidence` |
| `gravedigger_notebook` | Raymond's notebook, 1971 | The shed, after `found_rose` | Document `doc_gravedigger_book` | strong |
| `pittet_ledger` | Pittet account book, 1971 | Germaine, day 3 | Document `doc_pittet_ledger` | strong |
| `food_parcel` | Bread and cheese | Christine or Monique, day 3 | Give to Lucien, trust +1 | |
| `helene_letter` | Hélène Jaquet's letter | Lucien, night 3, trust 1+ | Document `doc_helene_letter`. Ending detail. | |
| `photo_siblings` | Photo: Lucien and Rose, 1966 | Hidden room | Document | |
| `photo_grave_pittet` | Photo: the Pittet plot | Camera | | weak |
| `photo_lantern` | Photo: the lantern | Camera | Caption "H.J. Who lights it?" | |
| `photo_bunker_door` | Photo: the steel door | Camera | Caption "K.P. 3. No keyhole." | weak |
| `photo_crate` | Photo: the crate | Camera, night 2 | Caption "PITTET LEURS. A child's coat." | strong |
| `photo_search_holes` | Photo: the slope of holes | Camera, day 3 | | weak |
| `photo_hidden_room` | Photo: Lucien's room | Camera | | strong |
| `photo_loyon_masked` | Photo: Le Loyon | Camera, with consent | | strong |
| `photo_loyon_forced` | Photo: Le Loyon, turning away | Camera, without consent | | strong |
| `photo_treeline` | Photo 7: the treeline | Camera, cemetery night 1 | Shows a figure the player did not see | |

### Item id mapping

| Old id | Action | New id | Notes |
|---|---|---|---|
| `notebook` | keep | | |
| `polaroid_camera` | keep | | |
| `pocket_money` | keep | | |
| `inn_room_key` | keep | | |
| `flashlight` | keep | | |
| `postcard_calvi` | drop | | The garage photo is read in place, not taken. |
| `gremaud_diary` | rename | `class_register` | Still a document from a villager on day 2. |
| `shovel` | keep | | Display name "Spade", new source and description. |
| `bunker_key` | rename | `hair_clip` | Still the thing that opens the hidden room. |
| `gremaud_letter` | rename | `holy_card` | Still the readable find from the dig. |
| `legion_tag` | drop | | |
| `food_parcel` | keep | | |
| `ring` | rename | `helene_letter` | Still Lucien's gift at trust 1+. |
| `photo_boys` | rename | `photo_siblings` | |
| `photo_grave_chassot` | rename | `photo_grave_pittet` | |
| `photo_lantern` | keep | | New caption. |
| `photo_bunker_door` | keep | | New caption. |
| `photo_empty_coffin` | rename | `photo_crate` | |
| `photo_forest_grave` | rename | `photo_search_holes` | Now weak evidence. |
| `photo_hidden_room` | keep | | New description. |
| `photo_marc_masked` | rename | `photo_loyon_masked` | |
| `photo_marc_forced` | rename | `photo_loyon_forced` | |
| `photo_treeline` | keep | | |
| | **NEW** | `gravedigger_notebook` | |
| | **NEW** | `pittet_ledger` | |

`miscPhotoCaptions.chassot_garden` becomes `pittet_garden`: "A garden nobody owns, kept by nobody."

## Flags

### Story flag mapping

Every flag in `storyFlags` in `src/content/flags.ts`, in file order.

| Old flag | Action | New flag | Set when |
|---|---|---|---|
| `pro_read_mail` | keep | | Opened the editor's email |
| `pro_read_board` | keep | | Opened the board index |
| `pro_read_thread_bus` | keep | | Read the bus reply |
| `pro_read_homepage` | keep | | Opened Stéphane's page |
| `pro_read_guestbook` | keep | | Read the guestbook |
| `pro_done` | keep | | Chose "Pack and go" |
| `arrived` | keep | | Off the PostBus |
| `inn_checked_in` | keep | | Took the room |
| `abbe_met` | keep | | First talk with the abbé |
| `abbe_told_graves` | keep | | The abbé told the three graves |
| `heifer_missing` | keep | | Bernard mentions the heifer |
| `dinner_day1` | keep | | Starts night 1 |
| `read_grave_menoud` | rename | `read_grave_jaquet` | Read Hélène's grave |
| `read_grave_gremaud` | rename | `read_grave_rose` | Read the ROSE stone |
| `read_grave_chassot` | rename | `read_grave_pittet` | Read the Pittet plot |
| `saw_lantern_lit` | keep | | Saw Hélène's lantern lit, night 1 |
| `met_raymond` | keep | | |
| `met_gilles` | keep | | |
| `first_sighting` | keep | | Saw him at the forest edge |
| `found_bunker` | keep | | |
| `bunker_door_wedged` | keep | | |
| `bunker_door_open` | keep | | |
| `found_hidden_door` | keep | | |
| `found_biscuit_wrapper` | keep | | |
| `looked_at_dust` | keep | | |
| `cupboard_restored` | keep | | |
| `skipped_follow` | keep | | |
| `read_register` | keep | | Read `doc_register_1971` |
| `abbe_seal_hint` | rename | `abbe_admits` | The abbé remembers writing "partie" |
| `read_baptism` | rename | `read_catechism` | Read `doc_catechism_1970` |
| `read_chronicle` | keep | | Read the parish chronicle (new text) |
| `lit_candle` | keep | | |
| `heifer_found` | keep | | |
| `heifer_returned` | keep | | |
| `bernard_light_coffin` | rename | `bernard_1971_night` | Bernard told about the lantern in 1971 |
| `knows_legion` | rename | `knows_placed_children` | Learned the Pittets had two placed children (abbé, Bernard, or the photo's back) |
| `odile_talked` | rename | `germaine_talked` | Germaine's day 2 talk |
| `christine_daniel_hint` | rename | `christine_rose_hint` | Christine talked about Rose |
| `dinner_day2` | keep | | Starts night 2 |
| `dug_gremaud_stone` | rename | `dug_rose_stone` | Struck the concrete under the ROSE stone |
| `raymond_warned` | keep | | |
| `tarp_over_hole` | keep | | |
| `opened_coffin` | rename | `found_rose` | Opened the crate |
| `read_gremaud_letter` | rename | `read_holy_card` | Read the card |
| `grave_refilled` | keep | | |
| `grave_left_open` | keep | | Raymond refills it; no gendarmes |
| `found_forest_grave` | rename | `found_search_holes` | Read the slope of holes |
| `editor_called` | keep | | |
| `abbe_day3` | keep | | The abbé's day 3 scene |
| `met_veilleur` | keep | | |
| `knock_pattern_done` | rename | `ring_code_done` | Cranked two short, one long |
| `entered_hidden_room` | keep | | |
| `read_marc_notebook` | rename | `read_lucien_ledger` | |
| `met_marc` | rename | `met_lucien` | Monologue started |
| `marc_named` | rename | `lucien_named` | Changes his label |
| `saw_ring` | rename | `saw_helene_letter` | Opened the tin |
| `marc_photo_consent` | rename | `lucien_photo_consent` | |
| `took_forced_photo` | keep | | |
| `ending_publish`, `ending_secret`, `ending_leave` | keep | | |
| `caught` | keep | | |
| `forum_seen_1` to `forum_seen_6` | keep | | |
| `lai_bell_draft`, `kit_clock_stop`, `gar_radio_static`, `gar_yannick_left`, `sat_in_confessional`, `chu_confessional`, `chu_after_mass` | keep | | Scene beats |

### New flags

| Flag | Set when |
|---|---|
| `found_probe_holes` | Looked at the rod holes along the back row, night 1 |
| `read_gravedigger_book` | Read Raymond's notebooks in the shed |
| `saw_barn_marks` | Read the height marks in the Pittet barn |
| `phone_rang_day2` | Cranked the guard room phone by day and heard it ring inside |
| `found_pharmacy_bag` | Saw the pharmacy bag at the K.P. 3 door |
| `raymond_confronted` | Raymond's day 3 scene |
| `germaine_confessed` | Germaine's confession |
| `abbe_saw_card` | The abbé saw the holy card |
| `gilles_confessed` | Gilles's confession, gives the ring code |
| `saw_raymond_night3` | Saw Raymond at the plot on night 3 |
| `phone_answered` | Gave the right answer on the phone |
| `gave_clip` | Gave Lucien the clip |

### Counts

| Old | Action | New |
|---|---|---|
| `day`, `night`, `dig_stage`, `refill_stage`, `film_shots`, `forum_stage` | keep | |
| `marc_trust` | rename | `lucien_trust`, same range 0 to 5 |

### Derived flags

| Old | Action | New definition |
|---|---|---|
| `pro_knows_village` | keep | unchanged |
| `suspects_empty_coffin` | rename | `suspects_pittet_grave`: two of `read_register`, `bernard_1971_night`, `christine_rose_hint` |
| `has_evidence` | keep | `holy_card` or any strong item |
| `has_shovel` | keep | item `shovel` |
| `has_food` | keep | item `food_parcel` |
| `has_bunker_key` | rename | `has_hair_clip`: item `hair_clip` |
| `has_legion_tag` | drop | |
| `has_ring` | rename | `has_helene_letter`: item `helene_letter` |

### Forum stages

Conditions unchanged. Content for [02-village.md](02-village.md):

| Stage | Condition | Content |
|---|---|---|
| 1 | Day 1 | Locals joke about Le Loyon. Someone reposts the clearing notice. veilleur: "he's not a ghost. ghosts don't breathe." |
| 2 | Day 2 morning | veilleur describes the reporter's night: the graves, the old man, the back gate. "you followed him. he let you." |
| 3 | Day 2 after `found_hidden_door` or `has_shovel` | If `has_shovel`: "you took his spade. he'll know." Otherwise: "don't ring the phone in the fort. he hears it." |
| 4 | Day 3 morning | If `grave_left_open`: "the old man filled a grave in himself at 6 this morning. why didn't he call anyone?" Otherwise: "the old man stood at the Pittet grave for an hour before light." |
| 5 | Day 3 evening | "turn around." Triggers the Yannick scene. |
| 6 | Epilogue only | One closing post per ending. |

## Documents

Every key in `documents` in `src/content/documents.ts`. Full text goes in [06-documents.md](06-documents.md).

| Old id | Action | New id | Content |
|---|---|---|---|
| `doc_postcard_calvi` | rename | `doc_school_photo` | Class photo, Leurs 1970, pinned in the garage. Page 1 the front, page 2 the back with names in Hélène's hand. |
| `doc_gremaud_diary` | rename | `doc_class_register` | The class register, January 1971 page, with Hélène's red note. |
| `doc_odile_clipping` | rename | `doc_pittet_photo` | Framed photo on Germaine's dresser, farm 1970. |
| `doc_laiterie_board` | keep | | Same board. Add the commune's clearing notice for rows 4 and 5. Keep "cimetière fermé de 21h à 7h". |
| `doc_gremaud_letter` | rename | `doc_holy_card` | Saint Rose of Lima; back: "Rose Bielmann, Noël 1970". |
| `doc_legion_tag` | drop | | |
| `doc_marc_notebook` | rename | `doc_lucien_ledger` | Lucien's grave list, hole dates, and short entries about the reporter. |
| `doc_marc_notebook_restored` | rename | `doc_lucien_ledger_restored` | Same, with the entry about the cupboard put back. |
| `doc_gremaud_notes` | rename | `doc_lucien_papers` | Bellechasse release 1980, hospital letter 1996. |
| `photo_boys` | rename | `photo_siblings` | Two children with cardboard suitcases, 1966. |
| `doc_ring` | rename | `doc_helene_letter` | Hélène's 1996 letter and the office's reply of 9 March 1971. |
| `doc_register_1995` | rename | `doc_register_1971` | Burials 1971, N° 1 Pittet Joseph. |
| `doc_register_1996` | keep | | Burials 1996, including Jaquet Hélène, October. |
| `doc_register_1997` | keep | | Burials 1997, with a pencilled note of the council's clearing decision. |
| `doc_register_baptisms_1958` | rename | `doc_catechism_1970` | Catechism list 1970-71 with "partie (janv. 71)". |
| `doc_chronicle` | keep | | New entries: January 1971 (frost, two days to dig Joseph's grave), November 1997 (the ROSE stone), and the abbé's recent line "Pour Hélène, qui demandait." |
| `doc_church_bulletin` | keep | | New text: All Souls' list, the clearing notice. |
| `grave_menoud` | rename | `grave_jaquet` | HÉLÈNE JAQUET / INSTITUTRICE / 1921 - 1996 / "Elle nous a appris à lire." |
| `grave_gremaud` | rename | `grave_rose` | Hand-cut letters: ROSE / 1962 - 1971 / JE TE CHERCHE |
| `grave_chassot` | rename | `grave_pittet` | FAMILLE PITTET / JOSEPH 1894 - 1971 / ALBERT 1918 - 1985, space left below. Yellow clearing tag. |
| `grave_yerly_ml`, `grave_kolly_ernest`, `grave_bapst_lea`, `grave_python_joseph`, `grave_overney_marie`, `grave_rossier_andre`, `grave_misc_1` to `grave_misc_8`, `oldstone_1` to `oldstone_5` | keep | | Fillers. `grave_misc_3` (Yerly, ROSE 1915-1988) is a deliberate false lead; keep it. |
| `grave_clement` | keep | | Change "AGNÈS MENOUD-CLÉMENT" to "AGNÈS CLÉMENT"; Menoud is no longer a story family. |
| `doc_forest_cross` | rename | `doc_search_holes` | The split sticks and their dates. |
| | **NEW** | `doc_gravedigger_book` | Raymond's 1971 notebook, January page. |
| | **NEW** | `doc_pittet_ledger` | Account book 1971, "Pension Bielmann R." in January, February, March. |
| | **NEW** | `doc_barn_marks` | The height notches on the barn doorframe. |

Prologue documents live in the desktop code: `doc_scan_death_notice` becomes `doc_scan_clearing_notice`; the three Stéphane photos keep their ids with new captions.

## Levels and code-facing names

| Kind | Old | New |
|---|---|---|
| Level | `house_gremaud` | `house_pittet` |
| Level | `house_gremaud_kitchen` | `house_pittet_kitchen` |
| Level | `chassot_farm` | `pittet_farm` |
| Level | none | `pittet_barn` (**NEW**, optional) |
| Cast id | `marc` | `lucien` |
| Cast id | `odile` | `germaine` |
| Dialogue file | `marc.ts` | `lucien.ts` |
| Dialogue file | `odile.ts` | `germaine.ts` |
| Dialogue entry table | `odile` | `germaine` |
| Node prefix | `marc_` | `lucien_` |
| Node prefix | `odile_` | `germaine_` |
| Node prefix | `coffin_` | `crate_` |
| Node prefix | `dig_chassot_` | `dig_pittet_` |
| Type `Refusal` in `src/levels/cemetery/layout.ts` | `dig_menoud`, `dig_therese`, `dig_other`, `dig_gremaud` | `dig_jaquet`, `dig_albert`, `dig_other`, `dig_rose_stone` |
| Constant | `chassotGrave` in the cemetery level | `pittetGrave` |

**NEW** engine and sound work for code agents:

- Le Loyon's breath: a looping positional sound, a slow wet breath through a filter, with an occasional cough. Audible from about 15 m. Plays before every sighting.
- Le Loyon's walk: no limp; stop 1 to 2 s every few meters with the shoulders rising.
- The mask lenses: a brief specular flash when the player's torch cone hits them.
- The guard room phone: crank input as short and long turns; a muffled bell behind the K.P. 3 door.
- Props: probe holes decal, yellow clearing tags, the shed's biscuit tin, the spade in the leeks, the barn doorframe notches, the slope of holes with split sticks, the gray ceiling wire, the pharmacy bag, the crate.

## Dialogue files

What each file in `src/content/dialogues/` must now say. Node ids not listed keep their id and get new text where the old text mentions the old plot.

| File | Must now say |
|---|---|
| `bernard.ts` | Day 1: short, worried about the heifer, the eggs and coins. Day 2 after the heifer: Gilles was his father's placed boy; the lantern, Albert's tractor and Raymond's bicycle on the night before Joseph's funeral; Rose crying in the Pittet barn; someone keeps the Pittet garden. Refuses the shovel and points to Raymond. Rename `bernard_coffin`, `bernard_coffin_2` to `bernard_1971`, `bernard_1971_2`. Drop `bernard_shovel` (replace with `bernard_no_shovel`). Day 3: if `found_rose`, quiet shame; if `grave_left_open`, saw Raymond with a barrow at dawn. |
| `cemetery.ts` | `path_cross`, `path_forest_blocked` kept. Lantern nodes now about Hélène's grave; `grave_menoud_lantern*` renamed `grave_jaquet_lantern*`. `grave_chassot_look*` renamed `grave_pittet_look*`: the clearing tag, boot prints at the foot (Raymond's). **NEW** `cemetery_probe_holes`, `shed_tin`, `shed_take_notebook`, `raymond_night3_seen`. |
| `christine.ts` | Christine Jaquet. Day 1: the lantern on her aunt's grave. Day 2: Rose at the next desk, the ladybird clip, the empty seat; gives `class_register`. Rename `christine_daniel_*` to `christine_rose_*`. Day 3: food; if `found_rose`, she asks nothing and gives the bread for free. |
| `church.ts` | Building nodes kept. `church_bulletin` new text. `office_*` nodes: the parish office desk has the catechism lists' index card box. |
| `dig.ts` | `dig_menoud` to `dig_jaquet` ("No. Not her."), `dig_therese` to `dig_albert`, `dig_gremaud*` to `dig_rose_stone*` (fresh concrete, hollow), `dig_other` kept. `dig_chassot_*` to `dig_pittet_*`. `coffin_lid`, `coffin_wait`, `coffin_open`, `coffin_box`, `coffin_after` to `crate_lid`, `crate_wait`, `crate_open`, `crate_pocket`, `crate_after`. `refill_*` kept. `leave_open_*` kept; the warning no longer mentions gendarmes. |
| `driver.ts` | Unchanged, except any line about Marc or the syndic. |
| `ending.ts` | Same node ids. New ending text as in [Endings](#endings-friday-20-november). `dawn_cemetery`: the reporter passes the Pittet plot at dawn. |
| `forest.ts` | `sighting_1` rewritten to the forest-edge sighting (breath, lenses, slow walk into the trees). Heifer nodes kept with the breathing from the spruces. `forest_hatch` kept. `forest_grave` renamed `forest_search_holes`. |
| `fort.ts` | Most nodes kept. `fort_phone`, `fort_phone_crank`: the ring behind the door by day; night 3 call moves to `hiddenRoom.ts`. `fort_hidden_door_locked`: no handle, no keyhole, bolted from inside. `fort_hidden_door_listen`: a clock ticking and a slow breath. `fort_masks_look`: one empty hook. `fort_logbook`: the army logbook ends in 1994. **NEW** `fort_wire`, `fort_pharmacy_bag`. |
| `gilles.ts` | Day 1: the tramp who wheezes; the school photo front. Day 2: denies knowing the names on the back; evasive about the wire. Rename `gilles_marc_*` to `gilles_lucien_*`. **NEW** day 3 confession nodes: placed at the Yerlys', the cough at the laiterie, filters and cortisone, the phone, the ring code, "don't name me". Drop `gilles_day1_seen`, `gilles_day1_which` (the "staring at a grave" line). |
| `graveLooks.ts` | Filler looks kept. Add `grave_misc_3_look` if the false Rose needs a line: "Rose Yerly. 1915. Not her." |
| `hiddenRoom.ts` | The phone call: **NEW** `phone_crank_night3`, `lucien_phone_breath`, `lucien_phone_where`, `lucien_phone_hair`, `lucien_phone_wrong`, `lucien_phone_open`. `marc_door_voice*`, `marc_door_letter*`, `marc_dark_room*`, `marc_doorway*` renamed to `lucien_door_*`, `lucien_dark_room*`, `lucien_doorway*`. Room hotspots: `room_camp_bed`, `room_mask_hook`, `room_shelves`, `room_map` (now the hole map), `room_photo`, `room_notebook` (the ledger), `room_phone` kept; `room_kepi` becomes `room_rod`; `room_ring` becomes `room_tin`; `room_notes_gremaud` becomes `room_papers`. **NEW** `room_stone_practice`. |
| `home.ts` | Unchanged. |
| `houses.ts` | `door_chassot_farm` to `door_pittet_farm`, `chassot_garden` to `pittet_garden` (spade pickup from day 2). `door_house_*` kept. **NEW** `barn_door`, `barn_marks`, `barn_loft`. |
| `index.ts` | Import `lucien` and `germaine` instead of `marc` and `odile`; entry table key `germaine`. |
| `marc.ts` to `lucien.ts` | Full rewrite. Monologue topics: the farm and the strap, the hospital lie, looking for her, Bellechasse, the hay and his lungs, Hélène's letter, the mask, the stone and the empty vault, the clip, his request. Keep the node shape: food, name, photo ask, consent, forced, request, gift (`lucien_letter_*` replaces `marc_ring_*`), goodbye. Drop the Legion, Bosnia, and Gremaud nodes. |
| `monique.ts` | Same structure and ids. Remove Marc, Gremaud, and Menoud references. `monique_day2_marc` renamed `monique_day2_pittet`: she knows the Pittets only as "the old woman who pays for her plot every year". `monique_day3_cold*`: no gendarmes; she is cold only if `grave_left_open` and Raymond grumbled in the café. |
| `odile.ts` to `germaine.ts` | Day 1: the door, "nothing for newspapers". Day 2 kitchen: the lie, the photo. **NEW** day 3 confession and the ledger. `odile_diary` becomes `germaine_photo`; `odile_day3_knows*` becomes `germaine_confess*`. Drop `odile_dead`. |
| `overney.ts` | Day 1: Le Loyon at the cemetery, the three graves, "I buried no Rose." Rename `overney_graves_menoud`, `_gremaud`, `_chassot` to `overney_graves_jaquet`, `_rose`, `_pittet`. Drop all `overney_seal*` nodes; add `overney_catechism`, `overney_catechism_2`, `overney_partie`. Day 3: `overney_day3_letter*` becomes `overney_day3_card*`. |
| `phone.ts` | Ruth's call, same ids. She wants "a name and a photo" by Friday. |
| `photos.ts` | Unchanged. |
| `raymond.ts` | Night 1: "for the council", the sick joke, the long look at the Pittet plot. Night 2 warning kept. `raymond_caught*` kept as the `caught` failure, new text: he does not threaten the gendarmes. He takes the spade, shaking, and says "Go home. Go home and forget this hill." The night ends. `raymond_day3_refilled*`, `raymond_day3_open*` replaced by **NEW** `raymond_confront*`. |
| `room3.ts` | Unchanged. |
| `script.ts` | Code, unchanged. |
| `square.ts` | Unchanged. |
| `yannick.ts` | Same ids. Reveal content: veilleur, has heard the breath, has seen Gilles with jerrycans, signed the guestbook. |

## Notebook

Lines the game adds, keyed by flag (replace `notebook` in `src/content/notebook.ts`):

| Key | Text |
|---|---|
| `arrived` | Leurs. Inn, room 3. Last bus 18:52. Ask about the man in the mask. |
| `abbe_told_graves` | Three graves. Hélène Jaquet, the teacher; someone lights her lantern. "ROSE 1962-1971", a homemade stone; the abbé buried no Rose. The Pittet plot by the forest wall, cleared in spring. |
| `met_gilles` | The mechanic: "wheezes like my compressor". |
| `found_probe_holes` | Holes in the grass along the back row. Someone is probing for something. |
| `bunker_door_wedged` (if `first_sighting`) | He stood at the forest edge and let me follow. A barn in the woods. Barred from inside. He coughed. |
| `forum_seen_2` | Someone on the board knows where I was last night. |
| `read_register` | Joseph Pittet died 11 January 1971. Buried the 18th. Frost. |
| `abbe_admits` | Rose Bielmann, placed with the Pittets. "Partie, janvier 71." Albert told the abbé at the graveside. |
| `read_chronicle` (if `read_register`) | Two days to dig Joseph's grave in the frost. |
| `bernard_1971_night` | Sunday night before the funeral: a lantern at the cemetery, Albert's tractor, Raymond's bicycle. |
| `christine_rose_hint` | Rose absent 12 to 14 January. The office said in March she was still at the Pittets'. The teacher wrote three question marks. A red ladybird clip. |
| `germaine_talked` | Germaine: "The office came for the girl." The office says it didn't. The girl in the photo wears a checked coat. |
| `suspects_pittet_grave` | Rose stopped coming to school the week Joseph Pittet was buried. His grave stood open three nights. Is she in it? |
| `found_hidden_door` | A steel door behind a cupboard. K.P. 3. No keyhole. Bolted from inside. |
| `phone_rang_day2` | The field phone rings behind that door. |
| `found_rose` | The foot of Joseph Pittet's grave. A crate. A checked coat. A ladybird clip. |
| `read_holy_card` | "Rose Bielmann, Noël 1970." The abbé's handwriting. |
| `germaine_confessed` | A fever. Strap marks. No doctor. Albert kept the money until March. |
| `gilles_confessed` | Gilles helps him. Ring two short, one long. Don't name Gilles. |
| `found_search_holes` | Forty holes on the slope above the fort. Every one filled in. Every one dated. He's been looking for her. |
| `editor_called` | Ruth. Friday before ten. A name and a photo. |
| `met_veilleur` | veilleur = Yannick. He's heard him breathe. |

Notebook goals, in order (replace `notebookGoals`; same `day()` and `night()` helpers):

1. Day 1, not checked in: "Go to the inn on the square and talk to the innkeeper." (`inn`, `monique`)
2. Day 1, not `abbe_told_graves`: "Go to the church and talk to the priest." (`church`, `overney`)
3. Day 1, not `dinner_day1`: "Talk to people around the village: the dairy shop, the garage, the farm. Then ask the innkeeper for supper."
4. Night 1, three graves not read: "Go up to the cemetery and read the three graves the priest told you about." (`cemetery`)
5. Night 1, not `met_raymond` and no sighting: "Wait by the graves. Listen."
6. Night 1, no sighting: "Stay a while. Watch the forest beyond the back wall."
7. Night 1, not `found_bunker` or `skipped_follow`: "Follow him into the forest." (`forest_path`)
8. Night 1: "Go back to the inn and sleep in room 3." (`inn`)
9. Day 2, not `read_register`: "Go to the church after morning mass and ask the priest about a Rose." (`church`, `overney`)
10. Day 2, not `suspects_pittet_grave`, heifer missing: "Find the farmer's lost heifer at the forest edge above the Yerly field and lead her home." (`yerly_farm`, `marquise`)
11. Day 2, not `suspects_pittet_grave`: "Ask at the dairy shop about the old school." (`laiterie`, `christine`)
12. Day 2, no `shovel`: "Find a spade. Someone keeps the garden at the old Pittet farm." (`pittet_farm`)
13. Day 2, `found_bunker`, not `found_hidden_door`: "Go back to the barn in the forest while it is light and search the bunker." (`bunker_interior`)
14. Day 2: "Ask the innkeeper for supper. Then go to the Pittet grave." (`inn`, `monique`)
15. Night 2, not `found_rose`: "Dig at the foot of the Pittet grave. Turn the torch off and hide when you hear the bell." (`cemetery`)
16. Night 2, not `grave_refilled`: "Fill the grave back in before the watchman sees it. Then go to bed."
17. Night 2: "Go back to the inn and sleep." (`inn`)
18. Day 3, not `germaine_confessed`: "Show Germaine Pittet what you found." (`house_pittet_kitchen`, `germaine`)
19. Day 3, not `gilles_confessed`: "Ask the mechanic who he buys filters for." (`garage_dousse`, `gilles`)
20. Day 3, not `met_veilleur`, no food: "Buy bread at the dairy shop, or ask the innkeeper for food." (`laiterie`, `christine`)
21. Day 3, not `met_veilleur`: "Use the computer in the inn's back room before it gets dark." (`inn`)
22. Night 3, not `entered_hidden_room`: "Ring the field telephone in the bunker's guard room." (`bunker_interior`)
23. Night 3, not `met_lucien`: "Look around the room."
24. After `met_lucien`, day 3 or earlier: "Leave through the tunnel before it gets light."
25. Day 4: "Call your editor from the phone in the inn's back room." (`inn`)

## Scares

For [07-scares.md](07-scares.md). Principles unchanged: anticipation over reveals, few sudden moves.

- **Sound palette, NEW:** the filtered breath, the cough, a phone bell behind steel, a crate slat giving under a spade.
- **Jumpscare 1, the dog (night 1).** Unchanged.
- **Jumpscare 2, Yannick in the doorway (day 3 evening).** Unchanged.
- **Jumpscare 3, Lucien in the doorway (night 3).** Unchanged mechanics, renamed.
- **Replaced beats.** The larch grave goes. In its place, the slope of holes on day 3: the stick markers appear one by one out of the fog, more than the player expects.
- **New beats.** The breath before the first sighting. The lenses flashing in the torch. The breath beyond the wall at `dig_stage` 3. The bell ringing behind the K.P. 3 door on day 2 with nobody there. The breath on the phone line on night 3. Raymond standing motionless at the plot on night 3.

## Research to do

For [research.md](research.md). Check and cite before final text:

- *Enfants placés* / Verdingkinder in the canton of Fribourg: how placements worked around 1966 to 1971, who paid whom, how often inspectors came.
- Administrative internment at Bellechasse: legal basis in Fribourg, who could order it, the end in 1981.
- The Swiss government apology of 11 April 2013 and the 2017 federal law on compulsory social measures before 1981, if used in the epilogue.
- Farmer's lung (extrinsic allergic alveolitis): symptoms, respirator advice in the 1990s, progression to fibrosis.
- Swiss criminal limitation periods in force in 1998 for a death by negligence in 1971 and for disturbing a grave, so that "nobody can be charged" is right.
- Grave clearing practice in Fribourg communes: notice period and how families are told.
- Army field telephones in 1940s forts: whether a crank phone can ring a second station with no power.
- Holy cards for catechism children in Fribourg parishes around 1970.

## Dialogue convention

Unchanged. Every dialogue in this folder uses the format below. A programmer can turn it into TypeScript data line by line.

```
### node_id
@speaker: speaker_id
?if: flag_a, !flag_b, lucien_trust >= 2
! set: flag_c, lucien_trust += 1, give: item_id, take: item_id

> First line of dialogue.
> Second line.
- [Choice text] -> other_node_id
- [Choice text] ?if: flag_d -> node_three ! set: flag_e
-> next_node_id
```

Rules:

1. **Node.** A level-3 heading `### node_id` starts a node. Only headings whose whole text matches `^[a-z0-9_]+$` are nodes; headings with spaces or capitals ("### Entry", "### The round") are structure for human readers. Ids are snake_case and unique across the whole script. Prefix them with the character id: `monique_checkin`, `overney_graves_1`.
2. **Speaker.** `@speaker:` takes a character id from the cast table, or `reporter` for the player character's own spoken lines, or `narration` for description and inner thoughts (rendered in italics, no name). It applies to every line in the node until another `@speaker:` line appears inside the node.
3. **Condition.** `?if:` is a comma-separated list, all of which must be true (logical AND). `!flag` means the flag is false. Numeric comparisons use `>=`, `<=`, `==`, `!=`. A node without `?if:` is always available.
4. **Effects.** `! set:` runs when the node starts. Items: `flag_name` sets true, `flag_name = false` clears it, `counter += n`, `counter = n`, `give: item_id`, `take: item_id`.
5. **Lines.** Each `>` line is one dialogue box. Keep each under 120 characters, not counting a `{{translation}}`, which shows on its own line.
6. **Choices.** `- [text] -> target`. A choice can carry its own `?if:` (hidden when false) and its own `! set:` (runs when picked), written after the text and before or after the arrow, as shown.
7. **Jump.** A line `-> target` with no choice text continues automatically. A jump can carry a condition, `-> target ?if: flag_a`. A node may list several jumps; the first whose condition holds is taken. A node with no lines and only jumps is a router. A node with neither choices nor a jump ends the conversation.
8. **Entry points.** Under each character, a table called "Entry" lists which node opens when the player talks to them, checked top to bottom. The first row whose condition holds wins.
9. **French.** French phrases sit inline in the line. A translation for the subtitle tooltip, if needed, follows in `{{ }}`: `> Bonsoir. {{Good evening.}}`. The game shows the English in a smaller line under the box.
10. **Notes in prose.** Any line that does not start with `@`, `?if:`, `! set:`, `>`, `- [` or `->` is a note for humans: descriptions, stage directions, timing. The converter skips it, inside or outside nodes.
11. **Display names.** `lucien` shows as "Le Loyon" until `lucien_named` is set, then "Lucien". `reporter` lines show with no name label. `narration` lines show in italics with no label.

Documents (letters, inscriptions, posts) use a different format, given at the top of [06-documents.md](06-documents.md).

Example:

```
### bernard_no_shovel
@speaker: reporter
?if: !heifer_returned

> Could I borrow a spade?

@speaker: bernard
> A spade. For what?
> I've no grave spade. Raymond has the only one, and he keeps it at home now.
```
