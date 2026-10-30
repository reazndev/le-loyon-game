# Prologue: the desktop

Monday 16 November 1998, 23:10. The reporter's flat. Dialogue convention: see [00-overview.md](00-overview.md#dialogue-convention).

## The room

The player starts seated at a desk, looking at a beige CRT. The game view is first person but locked to the desk. Pressing back stands the reporter up, and they can turn to see the room: a single bed, a coat on a hook, a packed bag by the door that is not yet zipped, rain on a black window, a lamp with a green shade. There is nothing else to do in the room. The phone on the wall does not ring.

Sound: rain, the hum of the CRT, a fridge in the next room that switches on and off. No music.

### home_window
@speaker: narration

> Rain. The street lamp below has been flickering since September.

### home_bag
@speaker: narration
?if: !pro_knows_village

> Half packed. I don't know yet where I'm going.

### home_bag_ready
@speaker: narration
?if: pro_knows_village

> Three days of clothes. The camera. The notebook. Ready.

### home_coat
@speaker: narration

> Still damp from this afternoon.

## The computer

The screen fills the view when the player sits. It is a fictional mid-90s desktop. Do not use real trademarks: the OS has no name on screen, the browser is called **Navigator 4.0** (generic word), the mail program is **Courrier**. Teal background, gray windows with blue title bars, a taskbar with a "Start" button and a clock reading 23:10. The clock advances one minute per real minute.

The arrow keys or the d-pad jump between links, icons, and menu items; interact opens, back goes back, Tab or Y opens the Start menu. The mouse also works. Clicking makes a dry plastic click sound. The editor's mail ends with "Before you go, find out which village it is and how you get there." After it is read, a notes.txt strip above the taskbar lists the three unknowns and ticks them off; after 60 seconds without progress it types a hint toward the next clue page. The taskbar shows the controls.

### Desktop icons

| Icon | Label | Opens |
|---|---|---|
| Beige computer | My Computer | A window with drives A:, C:, D:. Nothing useful. "C: 1.2 GB, 214 MB free." |
| Envelope | Courrier | The mail program |
| Globe | Navigator | The browser, after dialing up |
| Phone and modem | Helvenet Dial-Up | The dial-up window |
| Text file | notes.txt | The reporter's notes |
| Trash can | Recycle Bin | Empty |

### Dial-up

Clicking Navigator or Courrier before connecting opens the dial-up window first.

```
+-- Connect to Helvenet ---------------------------+
|  User name:  [ ******** ]                        |
|  Password:   [ ******** ]   [x] Save password    |
|  Phone:      0848 80 80 80                       |
|                                                  |
|          [ Connect ]        [ Cancel ]           |
+--------------------------------------------------+
```

Clicking Connect plays the full modem handshake, about 18 seconds: dial tone, ten DTMF tones, ringing, the screech and hiss. The status line steps through:

> Dialing...
> Verifying user name and password...
> Logging on to network...
> Connected at 33,600 bps

A small icon of two monitors blinks in the taskbar for the rest of the prologue.

The number is made up.

### notes.txt

Opens in a plain text editor called "Notepad" style, but titled **notes.txt - Editor**. The text updates as the player reads. The reporter writes it, so it is in their voice.

At the start:

```
STRANGE SWITZERLAND - ideas
- the "Dahu" again? no. done in 1996.
- lights over the lake. boring. weather balloons.
- gas mask man, Fribourg? saw something on that board. check.
```

After `pro_read_thread_bus`, add:

```
- PostBus. 4 a day. last one 18:52.
```

After `pro_read_homepage`, add:

```
- Stef's photos. the church in photo 3: LEURS.
```

When `pro_knows_village` is set, add a blank line and:

```
LEURS (FR). PostBus from the station. Inn: Croix-Blanche.
They call him "Le Loyon".
Three days. Go.
```

At that moment the Start menu's "Shut Down..." entry changes to "Pack and go".

## Courrier: the mail program

Three-pane window. Inbox list on top, message below. Three messages, newest first.

| From | Subject | Received |
|---|---|---|
| Ruth Aebischer | Strange Switzerland, Thursday deadline | 16.11.98 18:42 |
| info@millionaire-secrets.com | MAKE $$$ FAST - read this!!! | 15.11.98 03:12 |
| Photo Rapid | Your order is ready | 13.11.98 11:05 |

### Mail 1: from the editor

```
From:    Ruth Aebischer <r.aebischer@lecho.ch>
To:      (you)
Date:    Mon, 16 Nov 1998 18:42:10 +0100
Subject: Strange Switzerland, Thursday deadline

Hi,

As discussed. The Saturday supplement wants its
"strange Switzerland" page and I have nothing.
The cow-that-predicts-the-weather piece fell through
(the cow died, don't ask).

You said you had something about a man in a gas mask
near Fribourg. Fine. Go. Three days, train and one
room paid, keep the receipts. I want a person, a place,
a photo. If it's nothing, write me the fog and the
folklore and we'll run it small.

Call in by Saturday morning at the latest.

R.

--
Ruth Aebischer
Rédaction / L'Écho
```

Opening it sets `pro_read_mail`.

### Mail 2: spam

```
Dear Friend,

This is NOT a chain letter!!! In 1997 I was broke.
Today I own TWO houses. Send $5 to each of the 5
names below and put YOUR name at the bottom...
```

The rest is a long list of names and US addresses. The reporter comments if the player scrolls to the end:

### home_spam
@speaker: narration

> Delete.

### Mail 3: photo lab

```
Your film (24 exp.) is ready for collection.
Photo Rapid - open Mon-Fri 8.30-18.30, Sat 8.30-16.00
```

## Navigator: the browser

Gray chrome, a spinning globe in the top right that turns while a page loads, Back / Forward / Reload / Home / Search / Print / Stop buttons, a Location bar, and a Bookmarks menu. Pages load slowly from the top, text first, images last, each image drawing in from top to bottom over two or three seconds. Missing images show a broken-image icon.

Bookmarks:

- Helvenet - Home
- Alpine Anomalies Board
- SMI weather - Plateau
- (folder) Work > Swiss Press Agency login (dead link, "Server not responding")

### Page: Helvenet home

`http://www.helvenet.ch/`

A portal page. Logo in blue Times-ish caps. Three columns.

Left column, a blue box: "Search the Web", a field and a [Go] button. Typing anything returns "Search is temporarily unavailable. Please try again later."

Middle column, headlines (plain links that go nowhere):

- Swisscom: first weeks on the stock market
- Fog on the Plateau: no end in sight before the weekend
- Football: Swiss qualification hopes
- New: chat with Helvenet IRC!

Right column: a little animated GIF of a mailbox with its flag going up, and "You have 0 new messages".

Footer: "Best viewed with Navigator 4.0 at 800 x 600. (c) 1998 Helvenet."

### Page: SMI weather

`http://www.sma.ch/text/plateau.html`

A text-only page with a gray background. An invented page of the Swiss Meteorological Institute (SMA), the weather office's name from 1979. Sources disagree on when the MeteoSwiss name took over, 1996 or 2000; see [research.md](research.md). The fog details follow MeteoSwiss's own description of November stratus.

```
WEATHER BULLETIN FOR THE NORTH OF THE ALPS
Issued Monday 16.11.1998, 17:00

Plateau: stratus, top at 900 to 1100 m, no clearing
expected. Locally drizzle. Temperature 2 to 4 degrees.
Above the stratus: clear and mild.
Outlook Tuesday to Thursday: no change. Bise, weak.
```

### Page: Alpine Anomalies board, index

`http://www.alpanom.ch/board/index.html`

This is a period WWWBoard-style message board. Black background, a tiled star field GIF. Text is pale green Courier for posts and yellow for headings. The board is in English because it is an international hobby board for Swiss sightings, run by a Swiss in Zurich. Users write in their own weak English; some come from France, Germany, Belgium, the US.

Top of page:

```
     _    _       _              _                                _ _
    / \  | |_ __ (_)_ __   ___  / \   _ __   ___  _ __ ___   __ _| (_) ___  ___
   / _ \ | | '_ \| | '_ \ / _ \/ _ \ | '_ \ / _ \| '_ ` _ \ / _` | | |/ _ \/ __|
  / ___ \| | |_) | | | | |  __/ ___ \| | | | (_) | | | | | | (_| | | |  __/\__ \
 /_/   \_\_| .__/|_|_| |_|\___/_/   \_\_| |_|\___/|_| |_| |_|\__,_|_|_|\___||___/
           |_|
```

Below it, centered:

- An "UNDER CONSTRUCTION" GIF: a yellow diamond sign with a little man digging, animated.
- "Welcome to ALPINE ANOMALIES - the Swiss board for the strange & unexplained. Est. 1997."
- "Please read the RULES before posting. No flame wars. No porn. No selling. Be nice!!"
- A hit counter of seven odometer digits: **0018223**.
- Links in a row: [ Post a Message ] [ FAQ ] [ Rules ] [ Links ] [ Webring ]

Then a horizontal rule (an animated GIF of a flaming line), then the message list. The GAS MASK MAN thread has an animated NEW! badge in front of it so the player sees where to start. Messages are threaded with nested bullet lists. Each line shows: subject, author, date. Unread links are blue, visited are purple.

```
* Lights over Lac de la Gruyere - FRIDAY NIGHT - Gaston 11/15/98
    * Re: Lights over Lac de la Gruyere - Billy 11/15/98
        * Re: Lights over Lac de la Gruyere - Gaston 11/15/98
* GAS MASK MAN near Fribourg??? - Kamikaze 11/02/98
    * Re: GAS MASK MAN near Fribourg??? - Cloudy 11/02/98
        * Re: GAS MASK MAN near Fribourg??? - Kamikaze 11/03/98
    * Re: GAS MASK MAN near Fribourg??? - pivex 11/04/98
        * Re: bus - kjhhjahsf 11/04/98
    * Re: GAS MASK MAN near Fribourg??? - Billy 11/05/98
    * Re: GAS MASK MAN near Fribourg??? - veilleur 11/12/98
* old death notice, coincidence?? (scan) - Cloudy 11/08/98
    * Re: old death notice - Billy 11/08/98
* Dahu sighted in Valais LOL - TheTruthIsOutThere 11/01/98
* Webring down? - admin 10/29/98
* Crop circle Thurgau 1996 - any photos? - Hansruedi 10/22/98
* RULES - read before posting - admin 03/01/97
```

The board uses US date order because it runs an American script. Leave that as is; it is period-accurate.

At the bottom: the posting form (fields Name, E-Mail, Subject, Message, Optional Link URL, Optional Image URL, and a [Submit Follow Up] button). Submitting shows: "Posting is disabled for your account. Please register first (registration is closed)."

Opening the index sets `pro_read_board`.

### Post format

Every post page follows the classic WWWBoard layout:

```
                  [ Follow Ups ] [ Post Followup ] [ Alpine Anomalies Board ] [ FAQ ]

                          GAS MASK MAN near Fribourg???

Posted by Kamikaze on November 02, 1998 at 21:47:13:

(message body)

(signature)

Follow Ups:
   * Re: ...
```

### Post: GAS MASK MAN near Fribourg???

Posted by Kamikaze on November 02, 1998 at 21:47:13:

```
Hi all, first post here.

My cousin lives in canton Fribourg, small village, cows and
fog, you know the type. At All Saints (1st nov) they went to
the cemetery for the candles and she says there was a man
standing in the trees behind the wall. Long army cape.
GAS MASK. Not moving. When her husband went to see, he was
gone.

She says the people in the village just laugh and say
"oh that's Le Loyon". Like it's normal!!

Anyone know about this? Is it a local legend or a real
guy? I searched on AltaVista and found nothing.

-= Kamikaze =-
  "the truth is in here"
```

### Post: Re: GAS MASK MAN near Fribourg???

Posted by Cloudy on November 02, 1998 at 23:05:41:

```
>Long army cape. GAS MASK. Not moving.

There is a guy who has photos of this on his homepage!
Stef, a mountain biker. Link below. Photos are very
blurry but it's creepy.

  ___
 (o o)   Cloudy
 ( V )   "I want to believe"
 -m-m----------------
```

### Post: Re: GAS MASK MAN near Fribourg???

Posted by Kamikaze on November 03, 1998 at 08:12:56:

```
Thx Cloudy found it. OK this is weird. Why would someone
walk around in a gas mask in the forest?? Is there a
chemical factory or what.

-= Kamikaze =-
```

### Post: Re: GAS MASK MAN near Fribourg???

Posted by pivex on November 04, 1998 at 19:30:02:

```
It's Leurs, the village on Stef's photos, I recognise
the church tower. If you want to go: train to the main station,
then the yellow PostBus. 4 buses a day, last one back at
18:52 so DON'T miss it, there is nothing there. Not even a
taxi. One inn.

Also it's always foggy in November, you see nothing.
Good luck.

pivex
```

Reading this post sets `pro_read_thread_bus`.

### Post: Re: bus

Posted by kjhhjahsf on November 04, 1998 at 20:01:11:

```
lol who would go there for a guy in a mask. its probably
a farmer spraying his apples

sdfsdf
```

### Post: Re: GAS MASK MAN near Fribourg???

Posted by Billy on November 05, 1998 at 14:22:37:

```
In the french part they have many old legends, "le loyon"
could be from patois. I asked my grandmother (she is from
the Gruyere) she never heard of it. So it's new, not
a real legend. Probably kids. Or an artist. Or a crazy.

Billy  |  http://members.netcity.ch/billy/  |  ICQ 3318204
```

### Post: Re: GAS MASK MAN near Fribourg???

Posted by veilleur on November 12, 1998 at 02:14:50:

```
he is not kids. he is not an artist.
he was there again on saturday. at the cemetery, the back
row. he stood there one hour. then the lantern was lit.

if you come, dont come at night.
```

No signature, no email. The name "veilleur" is not a link. There is nothing more to click.

### Post: old death notice, coincidence?? (scan)

Posted by Cloudy on November 08, 1998 at 17:40:09:

```
OK I did some research (I am a librarian, haha). In the
newspaper archive from 1995 there is a death notice from a
village that MIGHT be Stef's village. A young-ish man who
died "abroad". 1995 = war in Bosnia. A soldier???

Here is my scan, sorry quality is bad, the microfilm
machine at work is ancient.
```

Below the text, an inline image: a bad scan of a newspaper death notice. Gray, skewed by about four degrees, a black edge on one side, moiré lines across it. Half the text is readable. Full design in [06-documents.md](06-documents.md#doc_scan_death_notice). The village name in the notice is under a dark crease.

```
  ___
 (o o)   Cloudy
 ( V )   "I want to believe"
 -m-m----------------
```

### Post: Re: old death notice

Posted by Billy on November 08, 1998 at 18:02:44:

```
Swiss don't go to war. We have the army only at home.
It's illegal to fight for another country. So no.

Billy  |  http://members.netcity.ch/billy/  |  ICQ 3318204
```

### Flavor posts

These only need one page each.

**Lights over Lac de la Gruyere - FRIDAY NIGHT**, by Gaston, 11/15/98:

```
3 orange lights in triangle over the lake around 22h. No
sound. Lasted 4 min. My wife saw also. Anyone else??
```

**Re: Lights over Lac de la Gruyere**, by Billy, 11/15/98:

```
Paragliders with lamps. Or the Payerne air base. Next.
```

**Re: Lights over Lac de la Gruyere**, by Gaston, 11/15/98:

```
At 22h in november in the fog??? Paragliders?? OK Billy.
```

**Dahu sighted in Valais LOL**, by TheTruthIsOutThere, 11/01/98:

```
Shorter legs on the left side confirmed. Film at 11.
```

**Webring down?**, by admin, 10/29/98:

```
The Swiss Mysteries Webring hub was down for 2 days.
It is back. Sorry. - admin
```

**Crop circle Thurgau 1996 - any photos?**, by Hansruedi, 10/22/98:

```
Hello, I search for photos of the crop circle near
Frauenfeld in summer 1996. My scanner is broken.
Thank you. Hansruedi
```

**RULES - read before posting**, by admin, 03/01/97:

```
1. Be nice.
2. No porn, no ads, no chain letters.
3. Don't post names or addresses of private persons.
4. English please, so everybody understands.
5. Have fun!
```

## Page: Stéphane's homepage

Cloudy's post links straight to the LE LOYON subpage, so the player can't miss it. The homepage is also reached from the board's Links page and from the Swiss Mysteries Webring. The webring widget at the bottom of the board says "This site is a member of the SWISS MYSTERIES WEBRING [ << Prev | Random | Next >> | List Sites ]". "List Sites" shows five sites; three are dead (404), one is the board itself, one is Stef's page.

`http://members.netcity.ch/~stefvtt/index.htm`

### Look

- Tiled background: a dark blue marbled texture that makes text hard to read.
- Text in yellow Comic Sans, centered, with some lines in red `<blink>`.
- A MIDI file starts playing automatically when the page loads: a tinny General MIDI cover of a well-known 80s synth tune. Invent the tune; do not use a real song. The player can stop it with Navigator's Stop button.
- An animated GIF of a mountain bike rider bobbing up and down.
- An "UNDER CONSTRUCTION" banner with a yellow and black stripe.
- A hit counter at the bottom: **000412**.
- "Last update: 03.11.98".

### Text

```
*** WELCOME ON STEF'S PAGE ***
VTT - MUSIC - MYSTERY

Hi! I'm Stephane, 24, from the Broye. I do mountain bike
(VTT) every weekend, I listen to Depeche-style music and I
like mysteries. This page is in english for my e-friends!

NEW! MY PHOTOS OF "LE LOYON" NEW!   (large link to the subpage)

[ My bike ]  [ My CDs ]  [ LE LOYON ]  [ Links ]  [ Guestbook ]

You are visitor number 000412
```

"My bike" shows one photo of a red bike against a garage door and the line "My bike, 1996, best bike ever!! 21 gears". "My CDs" is a list of fifteen invented band names with star ratings. "Links" has three dead links and the board.

### Subpage: LE LOYON

`http://members.netcity.ch/~stefvtt/loyon.htm`

The background turns black. A small GIF of a skull with red eyes at the top, rotating. Then:

```
=== MY ENCOUNTER WITH "LE LOYON" ===

This happened on Saturday 18 October 1997. I write it
exactly like it happened. I don't drink and I don't take
drugs (ask my mother!).

I was doing a long tour, from the Broye up to the hills,
small roads and forest paths. Around 16h30 the fog came
down very thick. I took a forest path to cut back to the
road, near LEURS, a small village in the hills above the
Broye.

The path goes along the back of a cemetery on a hill and
then into a dark forest. I stopped to drink. Then I heard
something in the forest, like a branch, but heavy. I
looked and there was a MAN standing between the trees.
Maybe 30 meters. He had a long cape, army camouflage, old
type, to the knees. And on the face a GAS MASK. Brown
rubber, with the round filter on the front.

He did not move. Not at all. Like a statue. I said
"bonjour?" and he did not answer. I could hear him
breathe through the mask. It was the worst sound I ever
heard. Slow. Like a machine.

I took my camera (I always have it for the bike photos)
and made 3 photos. Then I looked down to wind the film
and when I looked up he was walking away. Very slow.
He walks strange, like one leg is hurt.

I didn't follow. I went down to the village very fast.

In the village cafe I asked about it. The old men laughed
and said "c'est le Loyon". One said "he's harmless". One
didn't laugh. He said "go home".

Here are the photos. Sorry, they are bad, I scanned them
at work on the boss's scanner.
```

Then three images in a row, each 160 x 120, clickable to a 320 x 240 version. Full descriptions in [06-documents.md](06-documents.md#stef-photos).

Under the images:

- Photo 1 caption: "the path behind the cemetery (he is on the right, between trees)"
- Photo 2 caption: "zoom (sorry blurry)"
- Photo 3 caption: "looking back to the village. the church of LEURS"

Under that, in blinking red:

```
!!! IF YOU KNOW WHO HE IS, WRITE IN MY GUESTBOOK !!!
```

The blinking line is itself a link to the guestbook. Reading the Le Loyon page sets `pro_read_homepage`.

### Subpage: Guestbook

`http://www.guestbook-free.com/cgi-bin/gb.pl?user=stefvtt`

Hosted by a free guestbook service, so it has a different look: white background, a banner ad at the top for a dating site ("Meet singles in YOUR area!") with a blinking border, then a gray table of entries. Each entry is a table row with Name, Email (a link or blank), Homepage, Date, and Comments. Newest first.

[ Sign the Guestbook ] [ View the Guestbook ]

| Name | Date | Comments |
|---|---|---|
| yann | Fri, Nov 13, 1998 02:31:07 | i live in leurs. he is real. hes not a ghost and hes not a crazy. leave him alone. the lantern was lit again. |
| Kamikaze | Tue, Nov 3, 1998 08:20:55 | Found you from the Alpine Anomalies board. Creepy photos!! Do you think he is dangerous? |
| Stef (admin) | Mon, Oct 26, 1998 19:02:13 | To the people who emailed me: OK I removed the name of the village. I don't want problems. Sorry. |
| bertrand.c | Sun, Oct 25, 1998 22:47:40 | Its not funny to put a village on internet like this. People live there. Remove it please. |
| Melanie | Thu, Jul 30, 1998 15:11:02 | Coucou Stef! Nice page! When do we ride again? Bisous |
| Patrick VTT Club Broye | Mon, Jun 8, 1998 12:00:31 | Nice bike photos. The Loyon thing is fake no? Its your brother in a costume haha |
| Ana from Lisboa | Sat, Feb 14, 1998 10:44:18 | Hello from Portugal! Visit my page about cats! |
| Sandra | Wed, Nov 26, 1997 21:15:00 | I saw something like this near Romont in the summer. A man in a cape on the edge of a field. I thought it was a scarecrow until it turned. I didn't sleep that night. |
| Stef (admin) | Mon, Nov 3, 1997 20:30:30 | First entry in my own guestbook! Please sign!! |

The entry by yann has no email and no homepage. Reading the guestbook sets `pro_read_guestbook`. It is optional; the village is already named on the Le Loyon page.

"Sign the Guestbook" opens a form that rejects input: "Error 500: guestbook temporarily full. Upgrade to Guestbook PRO for only $4.95/month!"

## Leaving

When `pro_knows_village` is set:

### home_ready
@speaker: narration
?if: pro_knows_village

> Leurs. A bus line, an inn, a man in a mask, and three days.
> If there's nothing, I'll write the fog.

Clicking Start > "Pack and go" disconnects the modem (a click and silence), the screen collapses to a white dot, and the scene fades to black. Sets `pro_done`. Gives `notebook`, `polaroid_camera`, `pocket_money`.

Title card in white on black, small:

```
Tuesday 17 November 1998
16:20
```

Then the PostBus scene.

## Arrival: the PostBus

The player sits in the back of a yellow PostBus, looking forward. Gray light through wet windows. The road climbs through fields that vanish into fog after twenty meters. No other passengers. The driver's radio plays a French-language local station very low, a weather report the player can half hear: "...stratus sur le Plateau, limite supérieure vers mille mètres..."

The bus stops. The doors hiss. The player stands automatically and steps off into the square. The driver leans over.

### driver_arrival
@speaker: driver
! set: arrived

> Leurs. Terminus.
> Last bus back is at 18:52. Tomorrow the first is at 6:41.
> There's nothing after that. You know that?
- [Yes.] -> driver_arrival_end
- [Is it always this foggy?] -> driver_fog

### driver_fog
@speaker: driver

> Since the end of October. It'll go when the bise comes. Or in March.
-> driver_arrival_end

### driver_arrival_end
@speaker: driver

> Bonne soirée. {{Have a good evening.}}

@speaker: narration
> The doors close. The bus turns around the fountain and is gone. Its engine is audible for a long time.
> Then nothing.

Hold the silence for eight seconds before any ambient sound fades in: a dripping gutter, a cowbell far off, a television through a wall.

### Departure, for the leave ending

At the bus stop, from day 1 until `met_marc`, the player can wait for the bus. See [05-forest-bunker.md](05-forest-bunker.md#ending-leave).

### driver_departure
@speaker: driver

> In you get. Find what you came for?
- [No.] -> driver_departure_end
- [I'm not sure.] -> driver_departure_end

### driver_departure_end
@speaker: driver

> Nobody does, up here.
