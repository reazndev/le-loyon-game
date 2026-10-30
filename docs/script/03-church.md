# The church

Église Saint-Maurice, Abbé Louis Overney, the sacristy, the parish register, and the parish chronicle. Dialogue convention: see [00-overview.md](00-overview.md#dialogue-convention).

## The building

A plain white church from the 1830s with a pointed slate spire. The fog hides the top of the spire. Inside: twelve rows of pews, a stone floor worn into hollows in the aisle, a painted wooden altar, a side altar to the Virgin with a rack of votive candles, a confessional of dark wood on the left wall, Stations of the Cross in faded oil.

Above the side door hangs a painting of Saint Maurice, the patron: a Roman soldier in armor, holding a banner with a white cross. He was a soldier who refused to kill.

Sacristy: a narrow room behind the altar. A tall cupboard with vestments, a sink, a cupboard of registers with a key in its lock, a table with an oil lamp and a modern desk lamp. Next door is the parish office: a desk, a filing cabinet, and a beige computer with a modem on which the abbé types the parish bulletin. He does not use the internet. "Yannick installed it. It makes a noise like a cat being strangled."

Sound: the church is the quietest place in the game. No ambient bed except the hum of the electric candle lamp and, every quarter hour, the clock mechanism in the tower, a heavy click, followed on the hour by the bell. The bell is loud.

### church_saint_maurice
@speaker: narration

> Saint Maurice. A soldier. The plaque says he laid down his sword rather than kill innocent people.

### church_candles
@speaker: narration

> A rack of votive candles. Three are lit. One franc in the box.
- [Light a candle.] -> church_candle_lit
- [Leave it.] -> church_candles_end

### church_candle_lit
@speaker: narration
! set: lit_candle

> The coin drops a long way into the box. The wick takes.

### church_candles_end
@speaker: narration

> Not now.

### church_confessional
@speaker: narration

> The confessional. A purple curtain on the penitent's side. The grille is dark.
- [Sit inside.] -> church_confessional_in
- [Leave it.] -> church_candles_end

### church_confessional_in
@speaker: narration

> It smells of wood polish and old breath. Through the grille, nothing.
> I sit for a while. The tower clock clicks.

On night visits this beat changes (see [07-scares.md](07-scares.md), church): the church is locked at night, so this only happens by day.

### church_bulletin
@speaker: narration

> A parish bulletin pinned by the door.
> "Samedi 21 novembre: messe anniversaire pour les défunts du mois." {{Saturday 21 November: anniversary mass for the dead of the month.}}

## Abbé Louis Overney

71. Curé of Leurs since 1968. Born in the Gruyère, trained in the seminary in Fribourg. Tall, stooped, a black cassock under a gray cardigan. Speaks slowly and in full sentences, unlike the rest of the village. Kind, and frightened of saying too much.

He holds a secret he cannot tell. In November 1996 Jean-Pierre Gremaud confessed to him that Marc Chassot was alive and that the funeral had been a lie. Under the seal of confession the abbé may never reveal this, or act on it in any way that would betray the penitent, even after Gremaud's disappearance. He has buried an empty coffin, he suspects where Jean-Pierre went that night, and he has said nothing for two years. He prays for both men by name every morning.

The player should sense, by day 2, that he knows something and is not allowed to say it. He never lies outright. He chooses what to say.

People address him as "Monsieur l'abbé" (fine, it's his title). He calls the reporter "my friend" or nothing.

### Where he is

| Phase | Where |
|---|---|
| Day 1, until `abbe_told_graves` | In the nave, replacing candles |
| Day 1, after | Sacristy |
| Night 1, 2, 3 | Church locked. A light in the presbytery window next door. |
| Day 2 | After morning mass (the player arrives as the last two old women leave), in the nave, then the sacristy |
| Day 3 | Kneeling at the side altar |
| Day 4 | Not present (the ending morning) |

### Entry

| Condition | Node |
|---|---|
| `day == 1`, `!abbe_met` | `overney_meet` |
| `day == 1`, `abbe_told_graves` | `overney_day1_again` |
| `day == 2`, `!read_register` | `overney_register_offer` |
| `day == 2`, `read_register`, `!abbe_seal_hint` | `overney_seal` |
| `day == 2` | `overney_day2_again` |
| `day == 3`, `read_gremaud_letter`, `!abbe_day3` | `overney_day3_letter` |
| `day == 3` | `overney_day3` |
| `night >= 1` | `church_locked` |

### church_locked
@speaker: narration

> Locked. In the presbytery next door, a lamp in an upstairs window. A shadow passes it, slowly.

### overney_meet
@speaker: overney
! set: abbe_met

> Good evening. You're not from the village. I know every coat in Leurs.
- [I'm a journalist. I'm writing about Le Loyon.] -> overney_meet_loyon
- [Just looking at the church.] -> overney_meet_church

### overney_meet_church
@speaker: overney

> It's not much to look at. But it's warm, which this week is something.
> What brings you up here? The truth, please. I'm too old for the other thing.
-> overney_meet_loyon

### overney_meet_loyon
@speaker: overney

> Le Loyon. Yes.
> People need a name for what frightens them. Give a thing a silly name and you can laugh at it.
> I've heard the stories. A man in a mask, at night, at the cemetery.
- [Do you believe them?] -> overney_believe
- [Why the cemetery?] -> overney_why_cemetery

### overney_believe
@speaker: overney

> I believe people see something. What, I couldn't tell you.
-> overney_why_cemetery

### overney_why_cemetery
@speaker: overney

> If someone walks among our graves, I suppose he is visiting someone.
> We are a small parish. There are three graves up there people whisper about.
> Would you like to hear about them? It's a sad hour's talk, but it's the history of this place.
- [Please.] -> overney_graves_menoud
- [Another time.] -> overney_later

### overney_later
@speaker: overney

> I'm here until six. After that, God and I have an appointment.

### overney_graves_menoud
@speaker: overney

> Daniel Menoud. Second row. He died two years ago, in December.
> A gentle man. Clever hands. He could fix anything except himself.
> He carried more than anyone saw. One Sunday it was too much, and he took his own life.
> I buried him with a full mass. Some old people objected. I did not listen to them.
> Somebody lights the lantern on his grave every Saturday. I don't ask who. Neither should you.
-> overney_graves_gremaud

### overney_graves_gremaud
@speaker: overney

> Jean-Pierre Gremaud. Our syndic for twenty-six years. My friend.
> He walked out of his house one night in January '97, in the snow, and was never seen again.
> We searched for five days. The river, the road, the forest. Nothing.
> Odile put up a stone last year so she has somewhere to bring flowers. There is no one under it.
> People say things. That he ran off, that he owed money. He didn't. He wasn't that kind of man.
-> overney_graves_chassot

### overney_graves_chassot
@speaker: overney

> And Marc Chassot. Back row, by the forest wall, with his mother.
> An old Leurs family. He left at twenty, very angry, after his father died. Twenty years we didn't see him.
> In '95 word came that he had died abroad. In the war in Yugoslavia.
> Jean-Pierre arranged everything. The coffin came home sealed. We buried him three years ago this Saturday.
-> overney_graves_whisper

### overney_graves_whisper
@speaker: overney
! set: abbe_told_graves

> Now, the whispers. You'll hear them anyway, so hear them from me.
> Some say Marc didn't die. That he came back with his face burned, and hides it behind a mask.
> That is what people do with grief. They turn it into a story they can stand.
- [Do you think it could be true?] -> overney_true
- [Where are the burial records kept?] -> overney_register_mention

### overney_true
@speaker: overney

> I said the mass. I blessed the coffin. I gave his mother communion at the graveside.
> What I think doesn't matter very much.
-> overney_register_mention

### overney_register_mention
@speaker: overney

> If you want the dates, the register is in the sacristy. Every burial since 1802.
> Come after morning mass tomorrow, at half past eight. I'll let you read it.
> Not tonight. Tonight I'm tired.

### overney_day1_again
@speaker: overney

> Tomorrow, half past eight. Go and look at the stones if you must. Not too late.

### overney_register_offer
@speaker: overney

> You came. Good. Most people say tomorrow and mean never.
> The registers are in the cupboard. The burials are the green books. Don't lick your fingers.
> I'll be in the office.

@speaker: narration
> He unlocks the cupboard and leaves the key in it.

The player can now read the registers. See below. Reading the Chassot entry sets `read_register`. When the player leaves the sacristy after that, the abbé is waiting by the door: `overney_seal`.

### overney_seal
@speaker: overney
! set: abbe_seal_hint

> You found what you were looking for.
- [Marc's coffin was handed over by the syndic. Sealed. No body shown. No death certificate.] -> overney_seal_2
- [Why was there never a death certificate?] -> overney_seal_2

### overney_seal_2
@speaker: overney

> I wrote that entry in November '95. I wrote what I saw. That's all a register is.
> Since then I have been told things.
> Things told to a priest under the seal of confession can never be repeated. Not in a court. Not to a bishop.
> Not to stop a war. Not to bring a man home.
-> overney_seal_3

### overney_seal_3
@speaker: overney

> So I can't help you. Do you understand? I cannot.
> But the register is not a confession. It says what it says.
> And a man may go and stand at a grave and ask himself what is in it. That is between him and God.
- [Who confessed to you?] -> overney_seal_who
- [Is he dangerous?] -> overney_seal_danger

### overney_seal_who
@speaker: overney

> You know I won't answer that.
> Go and see Odile Gremaud. I'll telephone her. She has been alone with her questions long enough.
-> overney_seal_end

### overney_seal_danger
@speaker: overney

> Who?
> ...
> I have never met anyone who frightened me less than the dead do.
-> overney_seal_who

### overney_seal_end
@speaker: overney

> And please. If you go up there at night, take Raymond's rounds seriously. He's not a patient man.

### overney_day2_again
@speaker: overney

> I've said all I may say. More than I should have, maybe.

### overney_day3
@speaker: overney

> Sit with me a moment.

@speaker: narration
> We sit in the front pew. The tower clock clicks. He doesn't say anything else.

### overney_day3_letter
@speaker: overney
! set: abbe_day3

> You have something in your coat you didn't have yesterday. You keep touching it.
> No. Don't show me. If I read it, I'll have to decide what I know.
> Jean-Pierre came to see me often, that last year. What he told me, I keep.
> Bring him bread.

@speaker: narration
> He gets up before I can ask who. His knees crack. He goes into the sacristy and closes the door.

The line "Bring him bread" is the only time the abbé comes close to breaking the seal. He does not say a name. The player can choose to read it as being about Marc.

## The registers

The cupboard holds about forty bound books: baptisms (red spines), marriages (blue), burials (green), plus the parish chronicle in a black binding. Most are props: "Baptêmes 1802-1851", "Sépultures 1903-1935". Three can be opened:

- **Sépultures 1987-** (burials, the current volume)
- **Baptêmes 1950-1969** (baptisms)
- **Chronique paroissiale 1968-** (the abbé's chronicle)

The register pages show as a full-screen document: yellowed paper, ruled columns, handwriting in blue-black ink in the abbé's tidy, slanting hand. Display the French as handwriting and show the English translation in a smaller typed line beneath each entry. Translations below are the subtitle text.

Columns of the burial register: N° / Nom et prénoms / Né(e) le / Décédé(e) le / Inhumé(e) le / Remarques / Signature.

### Burials, 1995

| N° | Nom et prénoms | Né(e) le | Décédé(e) le | Inhumé(e) le | Remarques |
|---|---|---|---|---|---|
| 5 | Yerly née Bapst, Marie-Louise | 2.2.1937 | 30.5.1995 | 2.6.1995 | Épouse de Bernard Yerly. Munie des sacrements. |
| 6 | Kolly, Ernest | 14.9.1909 | 21.10.1995 | 24.10.1995 | Doyen de la paroisse. |
| 7 | Chassot, Marc Émile | 3.4.1958 | août 1995, en Bosnie-Herzégovine, date exacte inconnue | 18.11.1995 | Fils de feu Émile et de Thérèse née Kolly. Cercueil scellé remis par M. le syndic J.-P. Gremaud. Dépouille non présentée. Acte de décès : à suivre. Porteurs : B. Yerly, G. Dousse, R. Bapst, D. Menoud. |

Translations:

- 5: "Yerly née Bapst, Marie-Louise. Wife of Bernard Yerly. Received the sacraments."
- 6: "Kolly, Ernest. Oldest member of the parish."
- 7: "Chassot, Marc Émile. Born 3 April 1958. Died August 1995 in Bosnia-Herzegovina, exact date unknown. Buried 18 November 1995. Son of the late Émile and of Thérèse née Kolly. Sealed coffin handed over by the syndic, J.-P. Gremaud. Remains not shown. Death certificate: to follow. Bearers: B. Yerly, G. Dousse, R. Bapst, D. Menoud."

"Acte de décès : à suivre" was never completed. The space after it is empty. Reading entry 7 sets `read_register` and adds to the notebook:

```
Marc Chassot's coffin: sealed, handed over by the syndic.
No body shown. Death certificate "to follow". It never
followed. Bearers: Yerly, Dousse, Bapst, Menoud.
```

Bernard's wife died in 1995. He never mentions it. If the player reads entry 5 and later talks to Bernard on day 3, add one line to `bernard_day3`: "My wife liked you people. Newspapers. She read every page." (Condition `read_register`.)

### Burials, 1996

| N° | Nom et prénoms | Né(e) le | Décédé(e) le | Inhumé(e) le | Remarques |
|---|---|---|---|---|---|
| 3 | Chassot née Kolly, Thérèse | 11.3.1931 | 19.6.1996 | 22.6.1996 | Veuve d'Émile. Inhumée dans la tombe de famille, auprès de son fils. |
| 9 | Menoud, Daniel Pierre | 7.7.1958 | 8.12.1996 | 12.12.1996 | Funérailles chrétiennes célébrées. « Je suis la résurrection et la vie. » |

Translations:

- 3: "Chassot née Kolly, Thérèse. Widow of Émile. Buried in the family grave, beside her son."
- 9: "Menoud, Daniel Pierre. Christian funeral celebrated. 'I am the resurrection and the life.'"

The abbé's note on Daniel's entry, the quotation from John 11:25, is his quiet answer to those who thought a suicide should not get a church funeral.

### Burials, 1997

No entry for Gremaud: there was no burial. A folded slip of paper is tucked into the page for 1997, in the abbé's hand:

```
Gremaud, Jean-Pierre, syndic. Né le 2.5.1932.
Disparu le 14 janvier 1997.
Pas d'inhumation.
Pierre commémorative bénie le 1er novembre 1997, à la
demande de son épouse.
```

Translation: "Gremaud, Jean-Pierre, syndic. Born 2 May 1932. Disappeared 14 January 1997. No burial. Memorial stone blessed on 1 November 1997 at his wife's request."

Two more 1997 entries are filler: an infant who lived three days (keep the line short and plain: "Bapst, Léa. 4.3.1997. 7.3.1997. 9.3.1997. Ondoyée."), and an old farmer, "Python, Joseph, 1911 - 1997".

### Baptisms, 1958

Reading this sets `read_baptism`. It is optional. It shows that Gremaud was Marc's godfather, which the player otherwise only learns from the letter.

| N° | Nom | Né le | Baptisé le | Parents | Parrain et marraine |
|---|---|---|---|---|---|
| 8 | Chassot, Marc Émile | 3.4.1958 | 6.4.1958 | Émile Chassot et Thérèse née Kolly | Jean-Pierre Gremaud, Odile Gremaud née Python |
| 14 | Menoud, Daniel Pierre | 7.7.1958 | 13.7.1958 | Pierre Menoud et Agnès née Clément | Gilbert Dousse, Marthe Yerly |

Translation: "Godfather and godmother: Jean-Pierre Gremaud, Odile Gremaud née Python." Odile was Marc's godmother. If `read_baptism` is set, `odile_talk_2` adds one line after its first line: "He was our godson, you know. Marc. We never had children."

## The parish chronicle

A black bound ledger. Each year the curé writes a page or two about the life of the parish. Overney's entries are short and plain. Show the French as handwriting with the English below. The French text is in code blocks so the converter treats it as a document, not dialogue. Only the entries below can be read; others are summarized as "pages about harvests, the choir, a new roof".

Reading the chronicle sets `read_chronicle`.

**1978**

```
Mars. Le jeune Marc Chassot a quitté le village après la vente du bétail de feu son père. Sa mère ne dit pas où il est allé.
```

"March. Young Marc Chassot left the village after selling his late father's cattle. His mother won't say where he has gone."

**1994**

```
Le Conseil communal a acquis de la Confédération l'ancien fort du Bois-Noir, que l'armée n'utilise plus. M. le syndic parle d'un dépôt pour la commune. On verra.
```

"The commune council bought the old Bois-Noir fort from the Confederation; the army no longer uses it. The syndic talks of a storeroom for the commune. We shall see."

**1995**

```
Septembre. M. le syndic m'annonce la mort de Marc Chassot, tombé en ex-Yougoslavie. Je suis allé chez Thérèse. Elle m'a offert du café et n'a pas pleuré devant moi.
18 novembre. Sépulture de Marc Chassot. Beaucoup de monde, beaucoup de brouillard. Le cercueil venait de France, scellé. Que Dieu l'accueille, où qu'il soit.
```

"September. The syndic tells me Marc Chassot is dead, fallen in the former Yugoslavia. I went to Thérèse. She gave me coffee and did not cry in front of me."
"18 November. Burial of Marc Chassot. Many people, much fog. The coffin came from France, sealed. May God receive him, wherever he is."

"Wherever he is" (où qu'il soit) reads as a normal phrase. On a second reading it isn't.

**1996**

```
Juin. Thérèse Chassot nous a quittés. Elle repose auprès de son fils.
Décembre. Daniel Menoud. Je n'ai pas su voir. Seigneur, apprends-nous à voir.
```

"June. Thérèse Chassot has left us. She rests beside her son."
"December. Daniel Menoud. I did not know how to see it. Lord, teach us to see."

**1997**

```
Janvier. M. le syndic Jean-Pierre Gremaud a disparu dans la nuit du 14. Cinq jours de recherches, la neige, les pompiers de trois communes. Rien. Je connais Jean-Pierre depuis trente ans.
Mars. Raymond Bapst signale que quelqu'un allume la lanterne sur la tombe de Daniel Menoud. Il ne voit jamais personne.
1er novembre. Bénédiction de la pierre à la mémoire de Jean-Pierre Gremaud. Odile était seule au premier rang. Je n'ai pas pu finir l'homélie.
```

"January. The syndic Jean-Pierre Gremaud disappeared on the night of the 14th. Five days of searching, the snow, the fire brigades of three communes. Nothing. I have known Jean-Pierre for thirty years."
"March. Raymond Bapst reports that someone lights the lantern on Daniel Menoud's grave. He never sees anyone."
"1 November. Blessing of the stone in memory of Jean-Pierre Gremaud. Odile alone in the front pew. I could not finish the homily."

**1998**

```
Les jeunes parlent d'un « Loyon » qui rôderait au Bois-Noir. Le Conseil a demandé à Raymond de faire une ronde au cimetière. Je prie chaque matin pour J.-P. et pour M.
```

"The young people talk of a 'Loyon' who prowls in Bois-Noir. The council has asked Raymond to make a round at the cemetery. Every morning I pray for J.-P. and for M."

The last line is the abbé's slip. He writes "M." among the living and the lost, beside the syndic. He prays for Marc. If the player reads it after `read_register`, add to the notebook: "The abbé prays for 'J.-P. and M.' Every morning. Present tense."

## The parish office

### office_computer
@speaker: narration

> A beige computer, switched off. A sticky note on the monitor: "Bulletin: F2 = imprimer. Ne PAS toucher le modem. Y." {{F2 = print. Do NOT touch the modem.}}

### office_desk
@speaker: narration

> A typed bulletin, half finished. A list of names for Saturday's mass for the dead of the month. Chassot Marc is on it.

### office_photo
@speaker: narration

> A framed photo on the filing cabinet. Two men in their fifties, laughing, holding a huge trout between them. The abbé and, I think, the syndic.
