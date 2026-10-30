# The village

Every villager's dialogue from day 1 to the ending morning, the inn, the phone, and the forum posts at the inn computer. Dialogue convention: see [00-overview.md](00-overview.md#dialogue-convention). The abbé is in [03-church.md](03-church.md), Raymond at the cemetery in [04-cemetery.md](04-cemetery.md).

## How people talk

People in Leurs are polite and short. They answer the question asked and no more. They change the subject to the weather, the cows, the fog. Nobody says "Le Loyon" with a straight face on day 1. By day 3 nobody says it at all.

The reporter is never called monsieur or madame. People say "you", "the journalist", or nothing. Monique says "number three".

## Village square

Things to look at:

### square_fountain
@speaker: narration

> A stone basin, 1873 carved on the rim. The water runs whether anyone drinks or not.

### square_memorial
@speaker: narration

> A bronze plaque. "Aux soldats de Leurs, mobilisation 1914-1918." Four names. None of them died in a war.

### square_phonebox
@speaker: narration

> A red phone box. Taxcard only. The directory is swollen with damp.

### square_phonebox_night
@speaker: narration
?if: night >= 1

> The light in the box flickers. The receiver hangs a little off its hook. I put it back.

At night 2, the phone box rings once as the reporter passes, then stops. Nobody is on the line if they pick up in time, just a hiss (see [07-scares.md](07-scares.md)).

### square_busstop
@speaker: narration
?if: !met_marc

> PostBus. Leurs, Place. 6:41, 9:15, 13:30, 18:52. Nothing on Sundays after noon.
- [Wait for the bus and go home.] -> leave_confirm
- [Not yet.] -> square_busstop_end

### leave_confirm
@speaker: narration

> If I get on, I don't come back. Go home?
- [Go home.] -> leave_go ! set: ending_leave
- [Stay.] -> square_busstop_end

### leave_go
@speaker: narration

> I wait in the fog for the headlights.

The scene cuts to the departure dialogue in [01-prologue.md](01-prologue.md#driver_departure), then the leave ending.

### square_busstop_end
@speaker: narration

> Not yet.

## The inn: Auberge de la Croix-Blanche

A two-story house with green shutters and a hanging sign: a white cross on red. Inside, the café: brown wood, six tables with checked cloths, a counter with a coffee machine and a rack of glasses, a television on a bracket showing the local channel with the sound off, a calendar from the dairy cooperative. Smell of smoke, coffee, and soup. The stübli, a small back room, has a computer on a desk, a beige phone on the wall, a shelf of folders, and a window onto the square.

Sound: the coffee machine, the TV's faint whine, a clock.

### Who is in the café

| Phase | Present |
|---|---|
| Day 1 evening | Monique. Gilles at the counter with a glass of white. |
| Night 1, 2, 3 | Empty. Chairs up on tables. Monique's kitchen light. |
| Day 2 morning | Monique. Bernard having coffee (only until the heifer quest starts). |
| Day 2 evening | Monique. Raymond at a corner table with a thermos, before his round. |
| Day 3 | Monique. If `grave_left_open`, Raymond and Gilles at a table, talking low. They stop when the reporter comes in. |

## Monique Rossier, innkeeper

52, widow for eight years, runs the inn alone with her son Yannick. Tired, practical, warm under it. She does not believe in Le Loyon and does not want to talk about him, because it upsets Yannick.

### Entry

| Condition | Node |
|---|---|
| `!inn_checked_in` | `monique_checkin` |
| `day == 1`, `abbe_told_graves`, `!dinner_day1` | `monique_dinner1` |
| `day == 1` | `monique_day1` |
| `night >= 1` | `monique_night` |
| `day == 2`, `has_shovel`, `suspects_empty_coffin`, `!dinner_day2` | `monique_dinner2` |
| `day == 2` | `monique_day2` |
| `day == 3`, `grave_left_open` | `monique_day3_cold` |
| `day == 3`, `met_veilleur` | `monique_day3_after` |
| `day == 3` | `monique_day3` |
| `day == 4` | `monique_end` |

### monique_checkin
@speaker: monique

> Bonsoir. {{Good evening.}} You're the one who phoned? From the newspaper.
> Number three. Upstairs, at the end. The heating knocks, it's normal.
> Breakfast seven to nine. Supper at seven if you want it. Tell me before six.
- [Thank you.] -> monique_checkin_end
- [What brings people to Leurs?] -> monique_checkin_why

### monique_checkin_why
@speaker: monique

> Nobody comes to Leurs. A cousin for a funeral. A cattle dealer.
> And you. What does a newspaper want here?
- [I'm writing about Le Loyon.] -> monique_checkin_loyon
- [A piece about village life.] -> monique_checkin_life

### monique_checkin_loyon
@speaker: monique

> Mon Dieu. That again.
> It's a story for children. Some men from the café, a few kirsch, a man in a coat.
> Don't get my son started. He has his apprenticeship. He needs his sleep.
-> monique_checkin_end

### monique_checkin_life
@speaker: monique

> Village life. Cows, fog, funerals. Write that and you'll have the truth.
-> monique_checkin_end

### monique_checkin_end
@speaker: monique
! set: inn_checked_in, give: inn_room_key

> Voilà. The key. Don't lose it, I only have the one.

### monique_day1
@speaker: monique

> Supper's at seven. If you're going to see the abbé, he's in the church until six.
- [Who should I talk to here?] -> monique_who
- [Can I use the computer in the back?] -> monique_computer
- [Nothing, thanks.] -> monique_bye

### monique_who
@speaker: monique

> Gilles at the garage talks to everyone. Bernard Yerly at the farm talks to nobody.
> Christine has the laiterie. Leave Madame Gremaud alone, she's had enough.
> And the abbé knows everyone, living or dead.

### monique_computer
@speaker: monique

> Yannick's machine. He set it up for the bookings. Nobody books.
> Go ahead. But it uses the phone line, so if someone calls, they get nothing.
> Don't stay on all night. It costs.

### monique_bye
@speaker: monique

> À tout à l'heure. {{See you later.}}

### monique_dinner1
@speaker: monique
! set: dinner_day1

> Sit. Soupe de chalet. {{Alpine soup.}} There's bread.

@speaker: narration
> Potatoes, pasta, cream, cheese. It's very good. Monique watches the window while I eat.

@speaker: monique
> You saw the abbé? Then you've heard about the cemetery.
- [Is it safe to walk up there at night?] -> monique_dinner1_torch
- [Who lights the lantern on the Menoud grave?] -> monique_dinner1_lantern
- [Good night.] -> monique_dinner1_torch

### monique_dinner1_lantern
@speaker: monique

> Nobody knows. Christine says it isn't her. Raymond sits up there half the night and never sees anyone.
> Somebody who liked Daniel. That's all.
-> monique_dinner1_torch

### monique_dinner1_torch
@speaker: monique
! set: give: flashlight

> You're going out. I can see it.
> Take this. Raymond walks his dog up there till two. Don't scare him, he's not young.
> And bring the torch back. It was my husband's.

@speaker: narration
> A heavy metal torch. It smells of the drawer it lived in.

### monique_night
@speaker: narration

> The café is dark. Chairs on the tables. A strip of light under the kitchen door, and the radio, very low.

### monique_day2
@speaker: monique
?if: !grave_left_open

> You were out late. I heard the door.
- [I went up to the cemetery.] -> monique_day2_cemetery
- [Do you know anything about the old bunker in the forest?] -> monique_day2_bunker
- [Did you know Marc Chassot?] -> monique_day2_marc ?if: abbe_told_graves
- [Nothing.] -> monique_bye

### monique_day2_cemetery
@speaker: monique

> At night. Of course you did.
> Yannick came in at one in the morning too. I suppose that's a coincidence.

### monique_day2_bunker
@speaker: monique

> The "barn" up in Bois-Noir? Army. The commune bought it, God knows why.
> The kids go up to drink. I told Yannick if I catch him there I'll sell his moped.

### monique_day2_marc
@speaker: monique

> I came here when I married, in '78. He'd just left.
> I knew his mother. Thérèse. She kept his room the same for twenty years.
> When they told her he was dead she said "Good. Now I know where he is." Then she cried for a year.

### monique_dinner2
@speaker: monique
! set: dinner_day2

> Rösti tonight. With an egg.
> You have mud on your sleeves. And on the stairs. Bernard's shovel is behind my coat rack, you think I'm blind?
- [I'm returning it tomorrow.] -> monique_dinner2_b
- [Don't tell anyone.] -> monique_dinner2_b

### monique_dinner2_b
@speaker: monique

> I don't tell anyone anything. That's how you run an inn for twenty years.
> Raymond's round is every hour and a half. He takes the long way back past the chapel. I'm just saying.

### monique_day3
@speaker: monique

> The fog's worse. You look terrible.
- [Could you pack me some bread and cheese?] -> monique_food ?if: !has_food
- [The editor might call.] -> monique_editor_note ?if: !editor_called
- [Nothing.] -> monique_bye

### monique_food
@speaker: monique
! set: has_food, give: food_parcel

> For a picnic? In this?
> Here. Bread, a piece of Gruyère, two apples. You don't have to tell me.

### monique_editor_note
@speaker: monique

> A woman called this morning. She'll call back at noon. She didn't sound patient.

### monique_day3_cold
@speaker: monique

> Raymond found the Chassot grave open this morning. Dug out. The coffin lid off.
> He's called Romont. The gendarmes come tomorrow.
> I have your shovel mud on my stairs. I'm not going to say anything. But you'll take the first bus tomorrow.
> I mean it.
- [I understand.] -> monique_day3_cold_b
- [It's not what you think.] -> monique_day3_cold_b

### monique_day3_cold_b
@speaker: monique

> I don't think anything. I run an inn.
> If you want bread, Christine still sells it. I won't pack you anything.

### monique_day3_after
@speaker: monique

> He told me. About the forum, and following you. He's sixteen. He's stupid.
> He said you weren't angry. Thank you.
- [Could you pack me some bread and cheese?] -> monique_food ?if: !has_food, !grave_left_open
- [Good night.] -> monique_bye

### monique_end
@speaker: monique

> You're up early. Or you never went to bed.
> There's coffee. The phone's in the back if you need to call your newspaper.

## Yannick Rossier, "veilleur"

16. Apprentice mechanic at Gilles's garage. Thin, hood up, earphones from a Discman around his neck. He avoids the reporter until day 3. When the player meets him before then, he answers with as few words as possible and leaves.

### Entry

| Condition | Node |
|---|---|
| `met_veilleur` | `yannick_after` |
| `day == 1` | `yannick_day1` |
| `day == 2` | `yannick_day2` |
| `day == 3`, `!met_veilleur` | `yannick_day3` |

Where he is: at the garage by day (day 1 at the bench, day 2 under the Fiat), in the square at dusk on his moped on day 2, upstairs window at night (seen, not met).

### yannick_day1
@speaker: yannick

> ...
> Salut. {{Hi.}}

@speaker: narration
> He goes back to the brake disc he's cleaning. He doesn't look up again.

### yannick_day2
@speaker: yannick

> You went into the forest.
- [How do you know?] -> yannick_day2_b
- [Have you seen him? Le Loyon?] -> yannick_day2_b

### yannick_day2_b
@speaker: yannick

> Everybody knows everything here.
> I have to work.

### yannick_day3
@speaker: yannick

> Not now.

@speaker: narration
> He walks off fast, hands in his pockets.

### The doorway scene

Triggered on day 3 evening at the inn computer after reading forum stage 5 (see the forum section below and [07-scares.md](07-scares.md), jumpscare 2). The player has just read veilleur's post "turn around". When they turn (tank controls make this slow), Yannick stands in the stübli doorway in the dark, with the café unlit behind him. He has been there the whole time.

### yannick_reveal
@speaker: yannick
! set: met_veilleur

> Sorry. Sorry. I didn't mean... I was going to say something.
> It's me. Veilleur. The posts.
- [You've been following me.] -> yannick_reveal_follow
- [You wrote in Stef's guestbook. "yann".] -> yannick_reveal_guestbook

### yannick_reveal_follow
@speaker: yannick

> Only at night. I wanted to see what you'd do.
> Nobody goes into the forest. You just walked in.
-> yannick_reveal_seen

### yannick_reveal_guestbook
@speaker: yannick

> Yeah. People were making fun of him. Like he's a monster in a film.
-> yannick_reveal_seen

### yannick_reveal_seen
@speaker: yannick

> I've seen him. Six times. Seven.
> Once he was standing in our yard at three in the morning, by the bins. Just standing.
> He looked up at my window. I didn't move. He didn't move. Then he went.
- [Are you scared of him?] -> yannick_reveal_scared
- [Who do you think he is?] -> yannick_reveal_who

### yannick_reveal_scared
@speaker: yannick

> No. Yes. Not like that.
> He's like... someone who got lost and never stopped walking.
-> yannick_reveal_end

### yannick_reveal_who
@speaker: yannick

> The old men say it's Marc Chassot. Then they laugh, like it's a joke.
> Gilles doesn't laugh.
-> yannick_reveal_end

### yannick_reveal_end
@speaker: yannick

> You're going up tonight. To the barn.
> Don't bring the gendarmes. Please.
> And don't tell my mother I said please.

### yannick_after
@speaker: yannick

> I won't follow you tonight. Promise.

## Gilles Dousse, mechanic

41. Big, quiet, grease to the elbows. Did recruit school with Marc in 1977. Carried his coffin. He is the only villager who takes Le Loyon seriously and the only one who will say why, a little.

### Entry

| Condition | Node |
|---|---|
| `day == 1`, `!met_gilles` | `gilles_day1` (in the café) |
| `day == 1` | `gilles_day1_again` |
| `day == 2`, `!knows_legion` | `gilles_day2` (garage) |
| `day == 2` | `gilles_day2_again` |
| `day == 3`, `grave_left_open` | `gilles_day3_open` |
| `day == 3` | `gilles_day3` |

### gilles_day1
@speaker: gilles
! set: met_gilles

> The journalist. Monique said.
> Sit if you want. I'm not going to tell you a ghost story.
- [What do people mean by Le Loyon?] -> gilles_day1_loyon
- [Have you seen him?] -> gilles_day1_seen

### gilles_day1_loyon
@speaker: gilles

> A man in the woods with a mask. Some say a tramp. Some say a farmer with a grudge.
> The old ones make a joke of it. That's what people do here.
-> gilles_day1_seen

### gilles_day1_seen
@speaker: gilles

> Once. Last winter. Driving back from Romont at night, I came round by the cemetery.
> He was standing at a grave. Not doing anything. Staring at it.
> I stopped the car. He turned his head. That's all. Turned his head.
> I drove home.
- [Which grave?] -> gilles_day1_which
- [Thank you.] -> gilles_day1_end

### gilles_day1_which
@speaker: gilles

> The back row. Against the forest.
> Go and look. It won't take you long. There aren't many of us up there yet.

### gilles_day1_end
@speaker: gilles

> Santé. {{Cheers.}}

### gilles_day1_again
@speaker: gilles

> Back row. Against the forest.

### gilles_day2
@speaker: gilles

> You're the one who walked into Bois-Noir at night. Yannick told me. Yannick tells me everything.
- [Did you know Marc Chassot?] -> gilles_marc_1
- [Do you have a key to the old bunker?] -> gilles_bunker
- [Have you seen Bernard's heifer?] -> gilles_heifer ?if: heifer_missing, !heifer_returned

### gilles_marc_1
@speaker: gilles

> We did recruit school together. Summer '77, in Bière. Artillery.
> He was the best shot in the company. He hated every minute of it.
> His father died that winter. Marc sold the cows, had a fight with half the village, and left in March.
-> gilles_marc_2

### gilles_marc_2
@speaker: gilles
! set: knows_legion, give: postcard_calvi

> One card came. Then nothing.

@speaker: narration
> He reaches over the bench and unpins a postcard from the wall. It's faded blue. A harbor, a citadel.

@speaker: gilles
> Calvi. Corsica. You know who's in Calvi?
- [No.] -> gilles_marc_3
- [The Foreign Legion.] -> gilles_marc_3

### gilles_marc_3
@speaker: gilles

> The Legion. The paratroopers.
> You can't say it here. A Swiss in a foreign army, that's prison. His mother never said the word.
> Keep the card. I've looked at it long enough.
-> gilles_marc_4

### gilles_marc_4
@speaker: gilles

> When they buried him in '95, I was a bearer. With Bernard and Raymond. And Daniel.
> Ask Bernard about that coffin. Not me.

### gilles_bunker
@speaker: gilles

> Nobody has a key. The syndic had them. Jean-Pierre. The keys went where he went.
> The kids get in somehow. The front's never locked, the steel door inside is. Was.

### gilles_heifer
@speaker: gilles

> Marquise? She'll be up at the forest edge above his field. They always go up there in fog. Don't ask me why.

### gilles_day2_again
@speaker: gilles

> Ask Bernard about the coffin.

### gilles_day3
@speaker: gilles

> You look like someone who found something.
> Don't tell me. I've had three years of not knowing. I'm used to it.

### gilles_day3_open
@speaker: gilles

> Somebody dug up Marc's grave last night.
> Raymond says the coffin was empty. Not a bone. Nothing.
> He's been sitting in the café since six with his hands shaking.

@speaker: narration
> Gilles looks at my boots for a long time.

@speaker: gilles
> I carried that box. I knew. I always knew it was too light.
> Whatever you're doing, finish it before the gendarmes come.

## Bernard Yerly, farmer

63. Dairy farmer, twenty cows, bad knees. Pallbearer at Marc's funeral. Short with strangers. Notices eggs missing from his henhouse and coins left in the nest, and has decided not to think about it.

### Entry

| Condition | Node |
|---|---|
| `day == 1` | `bernard_day1` |
| `day == 2`, `heifer_found`, `!heifer_returned` | `bernard_heifer_back` |
| `day == 2`, `!heifer_returned` | `bernard_day2` |
| `heifer_returned`, `!has_shovel` | `bernard_shovel` |
| `day == 2` | `bernard_day2_after` |
| `day == 3`, `grave_left_open` | `bernard_day3_open` |
| `day == 3` | `bernard_day3` |

### bernard_day1
@speaker: bernard
! set: heifer_missing

> Oui? {{Yes?}}
> A journalist. Good for you. I've got a heifer out somewhere in this soup and it's getting dark.
- [Can I help?] -> bernard_day1_help
- [Do you know anything about Le Loyon?] -> bernard_day1_loyon

### bernard_day1_help
@speaker: bernard

> In the dark? You'd walk into the river. Come back in the morning if you're serious.

### bernard_day1_loyon
@speaker: bernard

> I know a fox takes my eggs. That's what I know.
> Bonsoir.

### bernard_day2
@speaker: bernard

> Still not back. Marquise. Brown, white face, a bell.
> She'll be up by the forest. They go up there and stand like idiots. I can't walk that far today.
- [I'll go and look.] -> bernard_day2_go
- [Could I borrow a shovel?] -> bernard_shovel_ask

### bernard_day2_go
@speaker: bernard

> Through the gate behind the shed, straight up the field. Follow the fence. Shut the gate.

### bernard_shovel_ask
@speaker: bernard

> A shovel. For what?
> No. Not with that cow still out there. Ask me when she's home.

### bernard_heifer_back
@speaker: bernard
! set: heifer_returned

> There she is. Stupid animal.

@speaker: narration
> He runs a hand down the heifer's neck. She is shivering.

@speaker: bernard
> Where was she?
- [At the forest edge, staring into the trees.] -> bernard_heifer_staring
- [Up the field. By the fence.] -> bernard_heifer_staring

### bernard_heifer_staring
@speaker: bernard

> They do that. Since last year. Something in there they don't like.
> Merci. {{Thank you.}} You've earned a coffee. Come inside.
-> bernard_kitchen

### bernard_kitchen
@speaker: narration

> A low kitchen. A wood stove. A crucifix and a calendar from the cattle insurance.
> He pours coffee and a splash of something clear.

@speaker: bernard
> You were at the abbé's. You're asking about the Chassot boy.
- [You carried his coffin.] -> bernard_coffin
- [What happened to him?] -> bernard_coffin

### bernard_coffin
@speaker: bernard
! set: bernard_light_coffin

> November '95. Four of us. Me, Gilles, Raymond, and Daniel Menoud.
> The syndic brought the coffin up from the valley in a van. Sealed. "From the French."
> We lifted it and Daniel looked at me. I looked at him. Nobody said anything.
> It was light. Like lifting a door.
- [What did you think was in it?] -> bernard_coffin_2
- [Why didn't anyone ask?] -> bernard_coffin_2

### bernard_coffin_2
@speaker: bernard

> A man burned up in a war, what's left? I told myself that.
> His mother was standing right there. You don't ask, with the mother there.
> And the syndic said it was in order. Jean-Pierre always said things were in order.
-> bernard_eggs

### bernard_eggs
@speaker: bernard

> The fox takes my eggs. Two, three a week.
> Sometimes there's a coin in the straw. Five francs. Two francs.
> Foxes don't pay.

@speaker: narration
> He drinks. He doesn't look at me.

### bernard_shovel
@speaker: bernard
! set: has_shovel, give: shovel

> You wanted a shovel.
> In the shed, on the left. Bring it back clean.
> And I don't want to know.

@speaker: narration
> The shovel has a worn ash handle and a blade sharpened with a file.

### bernard_day2_after
@speaker: bernard

> Shovel's in your hand. I didn't see you take it.

### bernard_day3
@speaker: bernard

> Marquise ate this morning. First time in three days.
> You keep the shovel till you go.

### bernard_day3_open
@speaker: bernard

> Raymond found the grave open.
> Leave my shovel against the shed when you go. Clean.
> I lent it to someone to plant a tree. That's what I'll say.

## Christine Menoud, the laiterie

44. Daniel's older sister. Runs the laiterie, where farmers bring milk at six and six, and the small shop beside it. Calm, warm with customers, careful when Daniel comes up. She does not know Marc is alive. She suspects someone loved her brother enough to light his lantern, and does not want to know who.

The laiterie: steel milk cans, a cooling tank, a counter with bread, cheese, tinned goods, cigarettes, a cork board with notices (cattle auction, choir rehearsal, lost cat). A bell above the door.

### Entry

| Condition | Node |
|---|---|
| `day == 1` | `christine_day1` |
| `day == 2`, `!christine_daniel_hint` | `christine_day2` |
| `day == 3`, `!has_food` | `christine_day3` |
| Any other | `christine_shop` |

### christine_day1
@speaker: christine

> Bonsoir. We're closing in ten minutes, but go on.
- [I'm a journalist. I'm asking about Le Loyon.] -> christine_day1_loyon
- [Just looking.] -> christine_shop

### christine_day1_loyon
@speaker: christine

> I sell milk and bread. I don't sell stories.
> If you go up to the cemetery, my brother's there. Daniel. Second row.
> Somebody lights his lantern every Saturday. It isn't me.
- [Who, then?] -> christine_day1_who

### christine_day1_who
@speaker: christine

> If I find out, I'll thank them. That's all.

### christine_day2
@speaker: christine

> You went to see Daniel. Raymond told me. People tell me everything at the milk counter.
- [What was he like?] -> christine_daniel_1
- [Was he close to Marc Chassot?] -> christine_daniel_marc ?if: abbe_told_graves

### christine_daniel_1
@speaker: christine

> Funny. Clever with machines. Hopeless with money.
> The farm went wrong after his divorce. Then he went quiet. We thought it was the winter.
> Nobody here says the word depression. We say "he's tired."
> He was tired for a long time.
-> christine_daniel_marc

### christine_daniel_marc
@speaker: christine
! set: christine_daniel_hint

> Marc and Daniel. You never saw one without the other, when they were boys.
> When Marc left, Daniel didn't speak to anyone for a month.
> The last year, Daniel went walking on Sundays. Up into Bois-Noir. Every Sunday.
> Once at supper he said, "Marc isn't dead, you know." Then he laughed. So I laughed.
> Three weeks later...

@speaker: narration
> She straightens the bread on the counter. It doesn't need straightening.

@speaker: christine
> Do you want something? Bread?

### christine_day3
@speaker: christine

> You look like you're going on a walk.
- [Bread and cheese, please. Enough for two.] -> christine_food
- [Nothing, thanks.] -> christine_shop

### christine_food
@speaker: christine
! set: has_food, give: food_parcel

> Pain mi-blanc. Gruyère, the salé, it keeps. {{Half-white bread. Salty Gruyère.}}
> Eight francs forty.

@speaker: narration
> She wraps it in paper and doesn't ask who the second person is.

### christine_shop
@speaker: christine

> Bread, milk, Gruyère, cigarettes, batteries. That's the shop.

## Odile Gremaud, the syndic's widow

66. Her husband Jean-Pierre, syndic for 26 years, walked out one January night in 1997 and never came back. She has heard every theory: he ran off, he fell in the river, he had debts, he had a woman. She opens the door a hand's width.

House: a neat white house beside the inn, a geranium box empty for winter, a brass plate "Gremaud". The kitchen (day 2 and 3): spotless, two chairs at the table, one never used.

### Entry

| Condition | Node |
|---|---|
| `day == 1` | `odile_day1` |
| `day >= 2`, `!read_register` | `odile_closed` |
| `day == 2`, `read_register`, `!odile_talked` | `odile_talk` |
| `day == 3`, `read_gremaud_letter`, `found_forest_grave` | `odile_day3_knows` |
| Any other | `odile_after` |

### odile_day1
@speaker: odile

> Oui?
- [I'm a journalist. Could I ask about your husband?] -> odile_day1_no

### odile_day1_no
@speaker: odile

> No.

@speaker: narration
> The door shuts. The lock turns twice.

### odile_closed
@speaker: narration

> A curtain moves upstairs. Nobody comes to the door.

### odile_talk
@speaker: odile

> The abbé phoned. He said you might come, and that I could decide.
> Come in. Wipe your feet.
-> odile_talk_2

### odile_talk_2
@speaker: odile

> They all want to know if he ran away. Twenty-six years syndic, and they ask me that.
- [What happened that night?] -> odile_night
- [Was anything different, before?] -> odile_before

### odile_night
@speaker: odile

> The fourteenth of January. Snow all day. He put his boots on after the news.
> He said he was going to look at the commune's wood in Bois-Noir. At ten at night. In snow.
> I said, "Jean-Pierre, you're sixty-four." He kissed my head and went.
> His car's still in the garage. Gilles keeps the battery charged. I don't know why I let him.
-> odile_before

### odile_before
@speaker: odile

> That last year he went out two nights a week. Tuesdays and Fridays. Always with the rucksack.
> He came back with it empty. Bread gone, cheese gone, sometimes the newspaper.
> I thought there was a woman. God forgive me, I would have preferred a woman.
-> odile_diary

### odile_diary
@speaker: odile
! set: odile_talked, give: gremaud_diary

> Here. His diary from '96. The police looked and gave it back. They said it was nothing.
> Take it. Bring it back. I can't read it any more.
- [Thank you.] -> odile_end
- [Do you think he's dead?] -> odile_dead

### odile_dead
@speaker: odile

> I put up a stone so I'd have somewhere to stand on Sundays.
> Yes. I think he's dead. I'd just like to know where.

### odile_end
@speaker: odile

> Close the door properly. It sticks.

### odile_day3_knows

The reporter knows where Gremaud lies but has not yet met Marc. The game does not allow the reporter to tell her.

@speaker: odile

> You came back. Did you read it?

@speaker: narration
> I think of the cross under the larch. I can't say it. Not before I know who carved it.

@speaker: reporter
> Not yet. I'll bring it back tomorrow.

### odile_after
@speaker: odile

> Did you find anything in it?
- [Not yet.] -> odile_end

## The inn phone and the editor

The beige phone on the stübli wall. The player can lift it at any time.

### phone_idle
@speaker: narration
?if: !editor_called, day != 3

> A dial tone. I don't have anyone to call yet.

### phone_editor
On day 3 at noon (the first time the player enters the stübli after the morning, if they have been anywhere else first), the phone rings. Monique: "It's for you." If the player is not in the inn at noon, the phone rings the first time they come back.

@speaker: editor
?if: day == 3, !editor_called
! set: editor_called

> It's me. How's the fog?
> I've got a page held for you on Saturday. What do I put on it?
- [There's something here. A real person.] -> phone_editor_real
- [I don't know yet.] -> phone_editor_unsure

### phone_editor_real
@speaker: editor

> A name? A photo?
> Get both. Call me Friday morning before ten. If I don't hear from you, I run the horoscope bigger.

### phone_editor_unsure
@speaker: editor

> Then find out. Friday before ten. I don't run fog twice.

### phone_night_static
At night (any night), lifting the phone gives a dial tone, but on night 2 the dial tone is replaced by soft static and, under it, something that might be breathing for four seconds, then the dial tone returns. It is a bad line. Nobody explains it. See [07-scares.md](07-scares.md).

@speaker: narration
?if: night == 2

> Static. Then the tone again.

The final call (Friday morning, the ending choice) is in [05-forest-bunker.md](05-forest-bunker.md#the-ending-call).

## Room 3

A narrow room under the roof. Iron bed, a crucifix over it, a washbasin, a radiator that knocks. A window onto the square. On night 1 and 2 the window shows the fog lit orange by the one street lamp.

### room_bed
@speaker: narration
?if: night == 0, day < 4

> Not tired. Not yet.

### room_bed_night
@speaker: narration
?if: night >= 1

> Sleep.

Sleeping ends the night: `night = 0`, `day += 1`. Before night 2 can end, it checks `opened_coffin`; if false, the reporter says "Not yet. Not without opening it." If the player sleeps after opening the coffin without refilling, set `grave_left_open`.

On night 3 the player does not sleep: they come back at dawn and the ending morning begins.

### room_window
@speaker: narration

> The square. The fountain. The street lamp makes a ball of orange light in the fog and nothing else.

### room_window_night2
@speaker: narration
?if: night == 2

> Someone is standing by the fountain. Hood up. Then the lamp flickers, and the square is empty.

(It is Yannick. The player learns this on day 3.)

## The inn computer

The stübli computer runs the same fictional desktop as the reporter's home PC, but older: a 14-inch monitor with a yellowed case, a 28.8k modem, and a desktop wallpaper of a motorbike Yannick downloaded. Dialing up uses the same modem sequence, with the house phone line: if the player is online, the phone can't ring.

Only one bookmark matters: Alpine Anomalies Board. The other bookmarks are Yannick's: a motorbike site, a Swiss football club site, and a page called "Leurs - notre village", which is a one-page site made by Yannick for school (see below).

Opening the board shows the same index as in the prologue, with new posts added at the top according to `forum_stage`. The prologue posts stay in the list. All posts use the board format from [01-prologue.md](01-prologue.md#post-format).

### Page: Leurs - notre village

`http://members.netcity.ch/~leurs/`

A school project. White background, a scanned photo of the church in summer, a list: "Habitants: 312. Altitude: 760 m. Église Saint-Maurice. Laiterie. Garage. Auberge de la Croix-Blanche." At the bottom: "Page faite par Yannick R., 1997. Mise à jour: jamais." {{Page made by Yannick R., 1997. Updated: never.}} A visitor counter: 000087.

This is a clue the attentive player can use to guess who "yann" is before day 3.

### Stage 1: day 1

New thread at the top:

```
* journalist going to Fribourg village?? - Kamikaze 11/17/98
    * Re: journalist going to Fribourg village?? - pivex 11/17/98
```

**journalist going to Fribourg village??**, Posted by Kamikaze on November 17, 1998 at 12:40:22:

```
Somebody on IRC said a journalist is going to the Le Loyon
village this week to "investigate". Is it someone from
here?? Please post what you find!!!

-= Kamikaze =-
  "the truth is in here"
```

**Re: journalist going to Fribourg village??**, Posted by pivex on November 17, 1998 at 13:02:51:

```
Hope they have a good coat. Remember the last bus.

pivex
```

### Stage 2: day 2 morning

```
* the journalist - veilleur 11/18/98
    * Re: the journalist - Cloudy 11/18/98
        * Re: the journalist - veilleur 11/18/98
```

**the journalist**, Posted by veilleur on November 18, 1998 at 01:12:09:

```
the journalist came. took the bus at 16h, room upstairs at
the inn. went to the abbe. ate the soup.

then went up to the cemetery at night with a torch and read
the stones. one by one.

then walked into the forest. nobody does that.
```

**Re: the journalist**, Posted by Cloudy on November 18, 1998 at 07:55:30:

```
Veilleur who are you??? How do you know all this??
Are you the journalist?

  ___
 (o o)   Cloudy
 ( V )   "I want to believe"
 -m-m----------------
```

**Re: the journalist**, Posted by veilleur on November 18, 1998 at 07:58:44:

```
no.
```

Reading stage 2 adds to the notebook: "Someone on the board knows what I did last night. Down to the soup."

### Stage 3: day 2, after the bunker or the shovel

Unlocks when `found_hidden_door` or `has_shovel` is set.

```
* BUNKER near Le Loyon village - Billy 11/18/98
    * Re: BUNKER - veilleur 11/18/98
* the lantern - veilleur 11/18/98
```

**BUNKER near Le Loyon village**, Posted by Billy on November 18, 1998 at 15:20:11:

```
OK I changed my mind, maybe interesting. My uncle was in
the army in the 60s and says there are hundreds of old
bunkers in the hills, some look like barns or chalets
from outside. The army sold many. If your gas mask man
lives somewhere, it's in one of these. Obvious.

Billy  |  http://members.netcity.ch/billy/  |  ICQ 3318204
```

**Re: BUNKER**, Posted by veilleur on November 18, 1998 at 15:41:00:

```
the journalist found it today. went inside. stood in the
room with the masks for a long time.

dont move the cupboard back. he will know.
```

If the player has not moved the cupboard (stage unlocked by the shovel instead), the last line is instead:

```
the journalist hasnt gone inside yet. there is a cupboard.
```

**the lantern**, Posted by veilleur on November 18, 1998 at 16:02:37:

```
three years ago this saturday they buried a box at the
cemetery. everybody knew it was too light.
```

### Stage 4: day 3 morning

The posts depend on whether the grave was left open.

If `grave_refilled`:

```
* (no subject) - veilleur 11/19/98
```

**(no subject)**, Posted by veilleur on November 19, 1998 at 03:48:15:

```
i watched you dig. from the ossuary. you didnt see me.
raymond passed twice. bari smelled me and said nothing.
good dog.

you put the earth back. thank you for that.

i saw what you took out of the box.
```

If `grave_left_open`:

**(no subject)**, Posted by veilleur on November 19, 1998 at 03:48:15:

```
i watched you dig. from the ossuary. you didnt see me.

you left it open. raymond will find it at seven.
they will call the gendarmes from romont.

you have until tomorrow.
```

Same stage, either way:

```
* Re: (no subject) - kjhhjahsf 11/19/98
```

**Re: (no subject)**, Posted by kjhhjahsf on November 19, 1998 at 09:10:02:

```
this is fake. veilleur is the journalist making publicity
for the article. classic

sdfsdf
```

### Stage 5: day 3 evening, the doorway

Unlocks on day 3 after `found_forest_grave` or after 18:00 (after the editor call and two other conversations). The evening computer visit is required to start night 3.

The index shows one new thread at the top, posted a minute ago. The time stamp matches the in-game clock in the taskbar.

```
* you - veilleur 11/19/98
```

**you**, Posted by veilleur on November 19, 1998 at (current time):

```
you're reading this in the back room of the inn.

the light is on in the cafe kitchen. your coat is on the
chair. there's a cup by the keyboard that went cold.

turn around.
```

Nothing happens until the player turns the reporter around. When they do, Yannick is in the doorway (see `yannick_reveal`). If the player does not turn for 40 seconds, the floor creaks behind them, and Yannick says "Sorry," which plays the same scene.

### Stage 6: epilogue

Shown only inside the ending text. See [05-forest-bunker.md](05-forest-bunker.md).

## Other houses

These have a door and a line or two. They make the village feel lived in and give the player places to walk past.

### door_chassot_farm
@speaker: narration

> The Chassot farm. Shutters nailed shut. A "À vendre" sign from 1996 lying in the nettles. {{For sale.}}

### chassot_garden
@speaker: narration
?if: day >= 2

> Behind the house, a vegetable patch. Leeks, cabbages, the earth turned recently. Somebody keeps this.

### chassot_garden_photo
Photographing the garden gives `photo_misc` with the caption "A garden nobody owns, kept by nobody."

### door_house_1
@speaker: narration

> A television, loud. A man coughing. I don't knock.

### door_house_2
@speaker: narration

> A child's bicycle against the wall. A light upstairs goes off as I come close.

### door_house_2_night
@speaker: narration
?if: night >= 1

> A dog barks inside, once, then stops, as if somebody held its mouth.
