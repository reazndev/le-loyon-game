# Documents

Every readable note, letter, clipping, photo, and inscription. Texts that already appear in full in another file are listed in the index with a link, so each text lives in one place.

## Format

Each document is a level-3 heading with its id, then a small key list, then the text in a code block.

```
### doc_id
- type: letter | note | clipping | photo | inscription | page | disc | postcard
- item: item_id (if the player keeps it), or none
- found: area and condition
- language: fr | en
- look: how it is shown (paper, handwriting, size)

(text block, exactly as shown)

Translation: (for French documents, the English subtitle text)
```

In game, French documents show the original (handwriting, print, or carving) with the English translation in small type beneath or on a toggle. Line breaks in the code blocks are the line breaks on the page.

## Index

| Id | What | Where the full text is |
|---|---|---|
| `doc_editor_mail` | Ruth Aebischer's email | [01-prologue.md](01-prologue.md#mail-1-from-the-editor) |
| `doc_board_posts` | All board posts, prologue | [01-prologue.md](01-prologue.md#page-alpine-anomalies-board-index) |
| `doc_stef_page` | Stef's sighting account | [01-prologue.md](01-prologue.md#subpage-le-loyon) |
| `doc_guestbook` | Stef's guestbook | [01-prologue.md](01-prologue.md#subpage-guestbook) |
| `doc_scan_death_notice` | Bad scan of the 1995 death notice | Below |
| `doc_stef_photo_1` to `_3` | Stef's three photos | Below |
| `doc_forum_ingame` | Board posts at the inn, stages 1 to 5 | [02-village.md](02-village.md#the-inn-computer) |
| `doc_leurs_page` | Yannick's school page | [02-village.md](02-village.md#page-leurs---notre-village) |
| `doc_postcard_calvi` | Marc's 1979 postcard | Below |
| `doc_gremaud_diary` | Gremaud's 1996 diary | Below |
| `doc_odile_clipping` | 1997 newspaper clipping on Odile's fridge | Below |
| `doc_laiterie_board` | Notices at the laiterie | Below |
| `doc_register_*` | Parish register entries | [03-church.md](03-church.md#the-registers) |
| `doc_chronicle` | Parish chronicle | [03-church.md](03-church.md#the-parish-chronicle) |
| `doc_church_bulletin` | Parish bulletin | [03-church.md](03-church.md#church_bulletin) |
| `grave_*`, `oldstone_*` | Cemetery inscriptions | [04-cemetery.md](04-cemetery.md#inscriptions) |
| `doc_gremaud_letter` | The letter in the coffin | Below |
| `doc_legion_tag` | Marc's Legion identity disc | Below |
| `fort_*` signs | Fort plates, signs, logbook | [05-forest-bunker.md](05-forest-bunker.md#the-fort-outer-rooms) |
| `doc_forest_cross` | The cross under the larch | [05-forest-bunker.md](05-forest-bunker.md#day-3-the-larch) |
| `doc_marc_notebook` | Marc's notebook | Below |
| `doc_gremaud_notes` | Gremaud's notes left with the food | Below |
| `photo_boys` | Marc and Dani, 1972 | Below |
| `doc_ring` | The ring and its note | Below |
| `photo_*` | The reporter's Polaroids | Below |
| `doc_newspaper_*` | Ending articles | [05-forest-bunker.md](05-forest-bunker.md#ending-publish) |
| `doc_notebook_*` | Lines the game adds to the reporter's notebook | Listed below, defined in each file |

## Prologue

### doc_scan_death_notice
- type: clipping (scanned)
- item: none
- found: Cloudy's board post, prologue
- language: fr
- look: a gray, skewed scan of a newspaper death notice with a black border. Moiré lines. A thumb-shaped shadow at the bottom. A dark diagonal crease runs across the place name, so only "L" and "urs" show. Some lines are blurred past reading; they are marked [...] here and should be rendered as gray mush.

```
           +                                    
   Dieu a rappelé à Lui, loin des siens,

            Monsieur
         Marc CHASSOT

  décédé accidentellement à l'étranger
       dans sa 38e année.

  Font part de leur peine :
  Sa maman, Thérèse Chassot-Kolly, à L▓▓▓urs ;
  Son parrain et sa marraine,
     Jean-Pierre et Odile Gremaud ;
  Ses amis d'enfance [...]
  ainsi que les familles parentes et alliées.

  La messe d'enterrement sera célébrée
  en l'église de L▓▓▓urs, le samedi
  18 novembre 1995, à 14 h 30.
  [...] 

  Cet avis tient lieu de lettre de faire-part.
```

Translation: "God has called to Him, far from his own, Marc Chassot, who died in an accident abroad in his 38th year. Mourning him: his mother, Thérèse Chassot-Kolly, of L...urs; his godfather and godmother, Jean-Pierre and Odile Gremaud; his childhood friends [...] and related families. The funeral mass will be held in the church of L...urs on Saturday 18 November 1995 at 2:30 pm. This notice takes the place of a personal announcement."

Note: "Monsieur" here is about Marc, which is fine; the rule against monsieur and madame applies only to the reporter. The last line is the standard closing of a Swiss French death notice.

### doc_stef_photo_1
- type: photo (scanned, 320 x 240 when enlarged)
- found: Stef's Le Loyon page
- look: a color print scanned badly. Green cast, JPEG blocks.

A forest path in fog, seen from a bike's handlebars (a brake lever intrudes at the bottom left). Dark spruces on both sides. On the right, between two trunks at about 30 m, a vertical brownish shape, slightly wider at the bottom, with a paler patch at head height. It could be a person in a long coat. It could be a stump.

Caption: "the path behind the cemetery (he is on the right, between trees)"

### doc_stef_photo_2
- look: the same photo cropped and enlarged until the pixels show.

The brownish shape fills the frame, blocky. A mottled pattern on it, maybe camouflage. At the top, a pale blob with two darker round spots side by side, and a darker round shape below them, centered. Eyepieces and a filter. Or bark.

Caption: "zoom (sorry blurry)"

### doc_stef_photo_3
- look: tilted, taken while riding. Motion blur.

Looking back down a slope. A wet meadow, a fence, a stone wall with crosses behind it (the cemetery), and beyond, in fog, the dark spire of a church. In the bottom right corner, a smudge from a thumb on the scanner glass covers part of the handwritten label Stef wrote on the print: "L...urs". At the far left edge of the frame, cut off by the border, a dark shape stands at the top of the wall. Nobody on the board has noticed it. The player may.

Caption: "looking back to the village. you see the church of L...urs"

## Village

### doc_postcard_calvi
- type: postcard
- item: `postcard_calvi`
- found: Gilles gives it, day 2
- language: fr
- look: a faded color postcard, the blue gone pale green. Front: a harbor with fishing boats, a citadel on a rock, "CALVI - La citadelle". Back: a French stamp, a postmark "CALVI 14-6 1979", the address "Gilles Dousse, Garage, Leurs (FR), SUISSE", and handwriting in blue ballpoint, cramped.

```
Gilles, salut.
Il fait 35 degrés. On saute d'avions toute la
journée, c'est mieux que les vaches.
Ici je m'appelle autrement. C'est mieux comme ça.
Dis rien à ma mère. Dis rien à personne.
Bois une bière pour moi au Croix-Blanche.
                                     Marc
```

Translation: "Gilles, hi. It's 35 degrees. We jump out of planes all day, it's better than cows. Here I go by another name. It's better that way. Don't tell my mother. Don't tell anyone. Have a beer for me at the Croix-Blanche. Marc"

### doc_gremaud_diary
- type: diary
- item: `gremaud_diary`
- found: Odile gives it, day 2
- language: fr
- look: a small black pocket diary for 1996, one week per spread, "Agenda 1996" in gold on the cover with the logo of a cantonal bank. Pencil and blue ink. Most entries are council business. The player can flip through 52 weeks; only these weeks carry anything beyond routine. Other weeks show filler like "Conseil 20h", "Ass. communale", "Route: devis", "Pompiers exercice".

```
Mardi 9 janvier       BN
Vendredi 12 janvier   BN. Couvertures.
Mardi 16 janvier      BN
   (every Tuesday and Friday through the year: "BN")
Lundi 4 mars          Dr Pittet, Romont. Cœur. Pilules.
Vendredi 19 avril     BN. D.M. sait. Bien.
Mercredi 19 juin      Thérèse. 6h. Prévenir l'abbé.
Samedi 22 juin        Enterrement Thérèse 10h.
                      BN le soir. Dur.
Vendredi 2 août       BN. Batterie voiture.
Mardi 12 novembre     Confession.
Dimanche 8 décembre   Daniel.
Jeudi 12 décembre     Enterrement Daniel 14h.
                      BN. Il n'a pas parlé.
Mardi 24 décembre     BN. Bougies, fromage, une
                      bouteille. Messe de minuit
                      après.
Mardi 31 décembre     BN. Bonne année, mon grand.
```

Translation:

```
Tuesday 9 January     BN
Friday 12 January     BN. Blankets.
Monday 4 March        Dr Pittet, Romont. Heart. Pills.
Friday 19 April       BN. D.M. knows. Good.
Wednesday 19 June     Thérèse. 6 am. Tell the abbé.
Saturday 22 June      Thérèse's funeral 10 am. BN in
                      the evening. Hard.
Friday 2 August       BN. Car battery.
Tuesday 12 November   Confession.
Sunday 8 December     Daniel.
Thursday 12 December  Daniel's funeral 2 pm. BN. He
                      didn't speak.
Tuesday 24 December   BN. Candles, cheese, a bottle.
                      Midnight mass after.
Tuesday 31 December   BN. Happy new year, my boy.
```

Reading it adds to the notebook: "BN, twice a week, all year. Bois-Noir? 'D.M. knows.' Daniel Menoud. 'Confession' in November. 'Happy new year, my boy.'"

"Car battery" (August) is the battery in the fort's machine room.

### doc_odile_clipping
- type: clipping
- item: none
- found: on Odile's fridge under a magnet shaped like a cow, day 2 and 3
- language: fr
- look: newsprint, yellowed, cut out with kitchen scissors. A small photo of a man in a suit at a podium.

```
LE JOURNAL DU PLATEAU          Mardi 21 janvier 1997

LEURS
Le syndic toujours introuvable

Les recherches pour retrouver Jean-Pierre Gremaud, 64 ans,
syndic de Leurs depuis 1971, ont été suspendues dimanche.
Pompiers, gendarmes et habitants de trois communes ont
fouillé pendant cinq jours les bords de la rivière et les
forêts voisines, sous d'importantes chutes de neige. M.
Gremaud avait quitté son domicile le 14 janvier vers 22 h,
à pied. Son épouse indique qu'il voulait « contrôler le
bois de la commune ». La gendarmerie n'exclut aucune
hypothèse.
```

Translation: "LE JOURNAL DU PLATEAU, Tuesday 21 January 1997. LEURS. Syndic still missing. The search for Jean-Pierre Gremaud, 64, syndic of Leurs since 1971, was called off on Sunday. Firefighters, gendarmes, and residents of three communes searched the riverbanks and nearby forests for five days, in heavy snow. Mr Gremaud left his home on foot at about 10 pm on 14 January. His wife says he wanted to 'check on the commune's timber'. The gendarmerie is not ruling anything out."

*Le Journal du Plateau* is an invented newspaper.

### doc_laiterie_board
- type: notices
- found: cork board in the laiterie, always
- language: fr
- look: index cards and photocopies, pinned with colored pins.

```
MISE DE BÉTAIL - Romont, jeudi 26 novembre, 9h
CHŒUR MIXTE - répétition mardi 20h, salle paroissiale.
   Nous cherchons des ténors !!!
PERDU chat tigré, répond à « Minet ». Famille Kolly.
À VENDRE pneus d'hiver 165/70 R13, presque neufs.
   S'adresser au Garage Dousse.
COMMUNE DE LEURS - Le cimetière est fermé de 21h à 7h.
   Le Conseil communal
BABY-SITTING - Sandrine, 15 ans, sérieuse. Tél. 652 41 18
```

Translation: "CATTLE AUCTION, Romont, Thursday 26 November, 9 am. MIXED CHOIR: rehearsal Tuesday 8 pm, parish hall. We need tenors!!! LOST: tabby cat, answers to 'Minet'. Kolly family. FOR SALE: winter tyres 165/70 R13, nearly new. Ask at Garage Dousse. COMMUNE OF LEURS: The cemetery is closed from 9 pm to 7 am. The commune council. BABYSITTING: Sandrine, 15, reliable."

Phone numbers in 1998 Fribourg had a three-digit area code and six or seven digits; the board shows only local numbers, as people did.

## Cemetery

### doc_gremaud_letter
- type: letter
- item: `gremaud_letter`
- found: in the cash box in Marc's coffin, night 2
- language: fr
- look: two sheets of lined paper folded in four, in a white envelope gone soft with damp. On the envelope, in fountain pen: "À qui ouvrira ce cercueil". Inside, the same pen, an old man's careful hand, slanted. Some words have run in the damp. The letterhead at the top of the first sheet is the commune's: "COMMUNE DE LEURS - Le Syndic".

```
Leurs, le 17 novembre 1995

À qui ouvrira ce cercueil,

Si vous lisez ceci, c'est que vous n'avez pas cru à sa
mort. Vous aviez raison.

Marc Chassot est vivant. Il est revenu de la guerre à
pied, à la fin d'octobre, blessé au visage et aux mains,
et blessé ailleurs aussi, là où ça ne se voit pas. Il ne
veut pas être vu. Il ne veut pas être retrouvé. Je l'ai
caché. Demain nous enterrerons ce cercueil vide et tout le
village pleurera un mort qui n'est pas mort. Que Dieu me
pardonne, je ne sais pas faire autrement.

Il vit dans l'ancien fort du Bois-Noir. La clé ci-jointe
ouvre la dernière pièce, le K.P. 3, derrière l'armoire du
dortoir. J'ai l'autre.

Je mets cette lettre ici parce que mon cœur est fatigué et
que je suis le seul à savoir. Si vous la lisez, c'est peut-
être que je ne suis plus là pour monter le pain. Alors c'est
à vous.

Frappez trois fois, attendez, puis une fois. Il saura que
c'est un ami. N'arrivez jamais derrière lui. Ne criez pas.
N'allumez pas de lampe dans ses yeux. Apportez du pain.

Il n'est pas dangereux. Il est blessé.

Quand il ne supporte plus les murs, nous montons nous
asseoir sous le mélèze, au-dessus du fort. De là, quand il
n'y a pas de brouillard, on voit tout le village.

Ne dites rien à ma femme. Elle n'y est pour rien.

C'est mon filleul. Je lui ai tenu la tête sur les fonts
baptismaux. Je ne le laisserai pas seul.

Jean-Pierre Gremaud
syndic
```

Translation:

```
Leurs, 17 November 1995

To whoever opens this coffin,

If you are reading this, you did not believe he was dead.
You were right.

Marc Chassot is alive. He came back from the war on foot at
the end of October, wounded in the face and hands, and
wounded elsewhere too, where it doesn't show. He doesn't
want to be seen. He doesn't want to be found. I have hidden
him. Tomorrow we will bury this empty coffin and the whole
village will mourn a dead man who is not dead. God forgive
me, I don't know what else to do.

He lives in the old Bois-Noir fort. The key with this letter
opens the last room, K.P. 3, behind the cupboard in the
dormitory. I have the other one.

I am leaving this letter here because my heart is tired and
I am the only one who knows. If you are reading it, perhaps
I am no longer here to carry up the bread. Then it is up to
you.

Knock three times, wait, then once. He will know it is a
friend. Never come up behind him. Don't shout. Don't shine a
light in his eyes. Bring bread.

He is not dangerous. He is hurt.

When he can't bear the walls any more, we go up and sit
under the larch above the fort. From there, when there is no
fog, you can see the whole village.

Say nothing to my wife. She has no part in this.

He is my godson. I held his head over the font. I will not
leave him alone.

Jean-Pierre Gremaud
syndic
```

The letter tells the player that Gremaud had a weak heart. It does not tell them how he died. It tells them the larch was the place the two men sat. The grave there can be read two ways.

### doc_legion_tag
- type: disc
- item: `legion_tag`
- found: in the cash box, night 2
- language: fr
- look: an oval steel disc, about 5 cm, scored across the middle so it can be snapped in two. Dented on one edge. Stamped letters, the same text on both halves. A short chain, the links black.

```
CHALLAND M.
1958
172493
LE
```

Translation (shown in the item description): "An identity disc. 'CHALLAND M., 1958, 172493, LE.' LE: Légion étrangère, the Foreign Legion. Not his name. His name in the Legion."

Note: the format is simplified and invented. Do not try to match a real service number format.

## Bunker

### doc_marc_notebook
- type: notebook
- item: none (read in place)
- found: on the crate by the bed in K.P. 3, night 3
- language: fr
- look: a school exercise book with a blue cover, squared paper, the corners soft. Pencil, small square capitals, very neat. Each entry starts with a date in Roman numerals for the month, as the Legion wrote them. Every page has a small sketch in the margin. Marc refers to the reporter as LA LAMPE ("the torch"), after the flashlight. This keeps the reporter's gender out of the French.

Most of the book is a year of short entries. The game shows six spreads: the first page and the last five.

```
1.I.98
BROUILLARD. RIEN. RONDE R. 21H-2H.
BOUGIE CHEZ D. SAMEDI.

(sketch: a lantern)
```

```
3.X.98
OEUFS CHEZ YERLY: 2. LAISSÉ 5 FR.
LE GARÇON DE L'AUBERGE À SA FENÊTRE. 3H.
IL ME REGARDE. JE LE REGARDE.

(sketch: a window with a small figure in it)
```

```
17.XI.98
QUELQU'UN D'AILLEURS. BUS DE 16H20. AUBERGE.
CHEZ L'ABBÉ UNE HEURE.

17.XI.98 NUIT
LA LAMPE LIT LES PIERRES. UNE PAR UNE.
RAYMOND. BARI M'A SENTI, N'A RIEN DIT.
JE ME SUIS MONTRÉ AU MUR. POURQUOI ?
JE NE SAIS PAS.
LA LAMPE M'A SUIVI. PORTE CALÉE.

(sketch: a figure with a torch among gravestones, the face left blank)
```

```
18.XI.98
PORTE OUVERTE. POUR QUE LA LAMPE VOIE.
POURQUOI ? JE NE SAIS PAS NON PLUS.
LA LAMPE A TROUVÉ L'ARMOIRE.
QUATRE MINUTES DANS LA SALLE DES MASQUES.

(sketch: the pile of masks, and a small blank-faced figure beside it)
```

```
18.XI.98 NUIT
LA LAMPE CREUSE. JE REGARDE DEPUIS LE MUR.
JE NE L'ARRÊTE PAS.
LA BOÎTE EST FAITE POUR ÇA. J-P L'AVAIT DIT.

(sketch: a figure in a hole, a spade, the face blank)
```

```
19.XI.98
LA LAMPE EST MONTÉE AU MÉLÈZE.
ELLE CROIT QUE JE L'AI TUÉ.
PEUT-ÊTRE QUE C'EST JUSTE.

(sketch: a larch tree, and nothing under it)
```

Translation:

```
1 January 98. Fog. Nothing. R.'s round 9 pm to 2 am.
Candle at D.'s on Saturday.

3 October 98. Eggs at Yerly's: 2. Left 5 francs. The boy
from the inn at his window. 3 am. He watches me. I watch
him.

17 November 98. Someone from elsewhere. The 16:20 bus. The inn. With the
abbé for an hour.

17 November 98, night. The torch reads the stones. One by
one. Raymond. Bari smelled me, said nothing. I showed myself
at the wall. Why? I don't know. The torch followed me. Door
wedged.

18 November 98. Door open. So the torch would see. Why? I
don't know that either. The torch found the cupboard. Four
minutes in the mask room.

18 November 98, night. The torch is digging. I watch from
the wall. I don't stop it. The box was made for this. J-P
said so.

19 November 98. The torch went up to the larch. It thinks I
killed him. Maybe that's fair.
```

Note on gender: "ELLE CROIT" uses "elle" because "la lampe" is a feminine noun; it refers to the torch, not to the reporter's gender. The English uses "it". Keep both exactly as written.

If `cupboard_restored`, add to the 18.XI entry: "ELLE L'A REMISE EN PLACE. PRUDENTE." Translation: "It put it back. Careful one." (Again "elle" for "la lampe".)

The notebook shows that Marc let himself be seen, and left the door open, on purpose. He never says so aloud. The player can decide what it means.

### doc_gremaud_notes
- type: notes
- item: none
- found: a bundle under a rubber band on the shelf in K.P. 3, night 3
- language: fr
- look: half sheets of squared paper torn from a pad, folded once. Blue ballpoint, Gremaud's slanted hand. Each was left with a food delivery. Marc kept every one. The player reads six; the rest are shopping lists.

```
Mardi.
Pain, fromage, piles, le journal.
Ne sors pas de jour cette semaine, les chasseurs sont dans
le Bois-Noir jusqu'à dimanche.
J-P
```

```
Vendredi.
Ta mère a demandé à l'abbé s'il priait pour toi. Elle va mal.
Réfléchis. Je peux lui dire. Je peux l'amener.
J-P
```

```
19 juin.
Ta mère est partie ce matin. Elle n'a pas souffert. Elle
avait ta photo de communion sur la table de nuit.
L'enterrement est samedi à 10 heures.
Je suis désolé, mon grand.
J-P
```

```
Daniel est venu me voir. Il sait. Il ne dira rien. Laisse-
le venir le dimanche, ça te fera du bien. À lui aussi.
J-P
```

```
Décembre.
Daniel.
Je ne sais pas quoi t'écrire. Je viens demain soir. Ne fais
pas de bêtise. Attends-moi.
J-P
```

```
Le docteur dit que mon cœur est fatigué. Si un jour je ne
viens pas, ne m'attends pas. Il y a de quoi tenir deux mois
sur l'étagère. Et tu sais où est la boîte.
J-P
```

Translation:

```
Tuesday. Bread, cheese, batteries, the newspaper. Don't go
out by day this week, the hunters are in Bois-Noir until
Sunday. J-P

Friday. Your mother asked the abbé if he prays for you.
She's not well. Think about it. I can tell her. I can bring
her. J-P

19 June. Your mother passed away this morning. She didn't
suffer. She had your communion photo on her bedside table.
The funeral is on Saturday at 10. I'm sorry, my boy. J-P

Daniel came to see me. He knows. He won't say anything. Let
him come on Sundays, it will do you good. Him too. J-P

December. Daniel. I don't know what to write to you. I'll
come tomorrow night. Don't do anything stupid. Wait for me.
J-P

The doctor says my heart is tired. If one day I don't come,
don't wait for me. There's enough on the shelf for two
months. And you know where the box is. J-P
```

The last note backs up Marc's account of Gremaud's death without proving it.

### photo_boys
- type: photo
- item: `photo_boys`
- found: propped against the candle in K.P. 3, night 3
- look: a small square color print with a white border, colors gone orange with age.

Two boys of about fourteen on a red moped by a stone fountain (the village fountain, recognizable by the basin). Summer: short sleeves, bright sun, no fog. The boy driving is dark-haired, squinting, grinning with his whole face. The boy behind holds on with one arm and gives the camera a thumbs up with the other; he has a gap in his front teeth. On the back, in pencil: "Marc et Dani, 1972." Under that, in different pencil, much later: "Samedi."

The photo is the only time the player sees Marc's face, at fourteen, before anything happened to it.

### doc_ring
- type: object
- item: `ring`
- found: a round metal throat pastille tin in K.P. 3, night 3
- look: a plain gold band, worn thin on one side. Engraved inside in script. A slip of squared paper folded around it, in Marc's square capitals.

```
(inside the ring)
J-P - O  1958

(the slip)
POUR ODILE. UN JOUR.
```

Translation: "For Odile. One day."

## The reporter's Polaroids

The camera produces instant photos. Each one ejects gray and develops over about 60 seconds of game time; the inventory image fades in during that time. Photos keep a caption written by the reporter in marker on the white strip. Shots that don't match an id below become `photo_misc_<n>` with the caption "Leurs, November 98".

| Item | What the photo shows | Caption |
|---|---|---|
| `photo_grave_chassot` | The Chassot stone in flash, overexposed in the middle, black around. The boot prints show as two dark hollows. | "Chassot. The boot prints." |
| `photo_lantern` | A red point of light in total black. Nothing else came out. | "D.M. Who lights it?" |
| `photo_bunker_door` | A gray steel door, "K.P. 3", the flash bouncing off it. | "K.P. 3" |
| `photo_empty_coffin` | A rectangle of stained gray satin seen from above, earth walls around, the edge of the lid. Empty. | "Empty. 18.11.95." |
| `photo_forest_grave` | Stones, a cross of branches, the golden needles of the larch fallen on the moss. In daylight and fog, washed out. | "J.-P. G." |
| `photo_hidden_room` | A camp bed, a candle, the white képi on the wall. | "Where he lives." |
| `photo_marc_masked` | A figure in a camouflage cape, a gas mask, standing very straight in a concrete room. The flash turns the eyepieces into two white discs. No skin shows. | "Le Loyon." |
| `photo_marc_forced` | A blur of camouflage and an arm thrown up. A corner of the mask. A white flare where the flash hit the wall. | (No caption. The reporter didn't write one.) |

### Photo 7: the treeline

- item: `photo_treeline`
- found: any photo taken in the cemetery on night 1 before `first_sighting`

The photo is mostly black. The flash lit the nearest gravestone, white, and fell off fast. At the top of the frame, past the back wall, the spruce trunks are faint gray lines. Between two of them, far back, stands a pale oval at head height above a darker vertical shape. The player did not see anything there when they took it.

Caption, written automatically when it finishes developing: (none). The reporter, on examining it:

### photo_treeline_look
@speaker: narration

> There's nothing there. I looked. There was nothing there.
> ...
> There's something there.

After `read_marc_notebook`, examining the photo again:

### photo_treeline_look_after
@speaker: narration
?if: read_marc_notebook

> He was there. Watching me take it.

## Notebook lines

The reporter's notebook is the quest log. Lines are added by events. Each line's full text is defined where its event is defined. Summary in order:

| Event | File |
|---|---|
| Arrival: "Leurs. Inn, room 3. Last bus 18:52. Ask about the man in the mask." | Add on `arrived` |
| Abbé's three graves: "Three graves. Daniel Menoud, suicide, Dec 96. J.-P. Gremaud, syndic, vanished Jan 97, stone, no body. Marc Chassot, died abroad 95, coffin came home sealed." | Add on `abbe_told_graves` |
| Gilles: "Gilles saw him 'staring at a grave'. Back row." | Add on `met_gilles` after `gilles_day1_seen` |
| First sighting: "Someone at the back wall. Into the forest. A barn in the woods. The door held from inside." | Add on `bunker_door_wedged` |
| Forum stage 2 | [02-village.md](02-village.md#stage-2-day-2-morning) |
| Register | [03-church.md](03-church.md#burials-1995) |
| Chronicle | [03-church.md](03-church.md#the-parish-chronicle) |
| Bernard: "Bearers: Yerly, Dousse, Bapst, Menoud. 'Like lifting a door.'" | Add on `bernard_light_coffin` |
| Postcard: "Calvi 1979. 'Here I go by another name.' The Legion." | Add on `knows_legion` |
| Diary | Above, `doc_gremaud_diary` |
| Suspicion | [00-overview.md](00-overview.md#day-2-wednesday-18-november-35-min) |
| Hidden door: "A steel door behind a cupboard. K.P. 3. Locked. Candle smoke." | Add on `found_hidden_door` |
| Letter | [04-cemetery.md](04-cemetery.md#the-coffin) |
| Larch | [05-forest-bunker.md](05-forest-bunker.md#day-3-the-larch) |
| Editor: "Ruth. Friday before ten. A name and a photo." | Add on `editor_called` |
| Yannick: "veilleur = Yannick. Sixteen. He's seen him seven times." | Add on `met_veilleur` |
