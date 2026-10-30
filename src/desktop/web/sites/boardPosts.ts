import type { StateView } from '../../../game/conditions';
import { formatTime, parseTime } from '../../clock';
import type { ForumStage } from '../../forum';
import { RING_LIST } from '../urls';

/**
 * Every post on the Alpine Anomalies board. Prologue posts are stage 0; the inn adds stages
 * 1 to 5 on top. Text from docs/script/01-prologue.md and 02-village.md.
 */
export interface Post {
  /** The WWWBoard message number, which is also its page: messages/<id>.html. */
  id: number;
  parent?: number;
  subject: string;
  author: string;
  /** Omitted for authors who left no address, such as veilleur. */
  email?: string;
  /** "November 02, 1998 at 21:47:13". A function for posts stamped with the current time. */
  posted: string | ((time: string) => string);
  /** "11/02/98", as in the message list. */
  short: string;
  body: string | ((state: StateView) => string);
  stage: ForumStage;
  /** Reading flag recorded when the post is opened. */
  reads?: string;
  image?: { src: string; w: number; h: number; alt: string };
  link?: { url: string; title: string };
}

const kamikaze = '-= Kamikaze =-\n  "the truth is in here"';
const cloudy = ['  ___', ' (o o)   Cloudy', ' ( V )   "I want to believe"', ' -m-m----------------'].join('\n');
const billy = 'Billy  |  http://members.netcity.ch/billy/  |  ICQ 3318204';

export const posts: Post[] = [
  {
    id: 1,
    subject: 'RULES - read before posting',
    author: 'admin',
    email: 'admin@alpanom.ch',
    posted: 'March 01, 1997 at 10:02:11',
    short: '03/01/97',
    stage: 0,
    body: `1. Be nice.
2. No porn, no ads, no chain letters.
3. Don't post names or addresses of private persons.
4. English please, so everybody understands.
5. Have fun!`,
  },
  {
    id: 412,
    subject: 'Crop circle Thurgau 1996 - any photos?',
    author: 'Hansruedi',
    email: 'h.keller@thurnet.ch',
    posted: 'October 22, 1998 at 19:44:02',
    short: '10/22/98',
    stage: 0,
    body: `Hello, I search for photos of the crop circle near
Frauenfeld in summer 1996. My scanner is broken.
Thank you. Hansruedi`,
  },
  {
    id: 437,
    subject: 'Webring down?',
    author: 'admin',
    email: 'admin@alpanom.ch',
    posted: 'October 29, 1998 at 08:15:40',
    short: '10/29/98',
    stage: 0,
    body: `The Swiss Mysteries Webring hub was down for 2 days.
It is back. Sorry. - admin`,
  },
  {
    id: 441,
    subject: 'Dahu sighted in Valais LOL',
    author: 'TheTruthIsOutThere',
    email: 'xfiles_fan@hotmail.ch',
    posted: 'November 01, 1998 at 23:58:30',
    short: '11/01/98',
    stage: 0,
    body: 'Shorter legs on the left side confirmed. Film at 11.',
  },
  {
    id: 446,
    subject: 'GAS MASK MAN near Fribourg???',
    author: 'Kamikaze',
    email: 'kamikaze77@swissonline.ch',
    posted: 'November 02, 1998 at 21:47:13',
    short: '11/02/98',
    stage: 0,
    body: `Hi all, first post here.

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

${kamikaze}`,
  },
  {
    id: 447,
    parent: 446,
    subject: 'Re: GAS MASK MAN near Fribourg???',
    author: 'Cloudy',
    email: 'cloudy@bluewin.ch',
    posted: 'November 02, 1998 at 23:05:41',
    short: '11/02/98',
    stage: 0,
    link: { url: RING_LIST, title: 'Swiss Mysteries Webring' },
    body: `>Long army cape. GAS MASK. Not moving.

There is a guy who has photos of this on his homepage!
Stef something. Mountain biker. Search "Le Loyon" on
the webring, his page is on it. Photos are very blurry
but it's creepy.

${cloudy}`,
  },
  {
    id: 448,
    parent: 447,
    subject: 'Re: GAS MASK MAN near Fribourg???',
    author: 'Kamikaze',
    email: 'kamikaze77@swissonline.ch',
    posted: 'November 03, 1998 at 08:12:56',
    short: '11/03/98',
    stage: 0,
    body: `Thx Cloudy found it. OK this is weird. Why would someone
walk around in a gas mask in the forest?? Is there a
chemical factory or what.

-= Kamikaze =-`,
  },
  {
    id: 452,
    parent: 446,
    subject: 'Re: GAS MASK MAN near Fribourg???',
    author: 'pivex',
    email: 'pivex@freesurf.ch',
    posted: 'November 04, 1998 at 19:30:02',
    short: '11/04/98',
    stage: 0,
    reads: 'pro_read_thread_bus',
    body: `I think I know which village it is from Stef's photos, I
recognise the church tower. I won't post the name because
Stef asked people not to (the locals emailed him, not
happy). But if you want to go: train to the main station,
then the yellow PostBus. 4 buses a day, last one back at
18:52 so DON'T miss it, there is nothing there. Not even a
taxi. One inn.

Also it's always foggy in November, you see nothing.
Good luck.

pivex`,
  },
  {
    id: 453,
    parent: 452,
    subject: 'Re: bus',
    author: 'kjhhjahsf',
    email: 'asdf@asdf.com',
    posted: 'November 04, 1998 at 20:01:11',
    short: '11/04/98',
    stage: 0,
    body: `lol who would go there for a guy in a mask. its probably
a farmer spraying his apples

sdfsdf`,
  },
  {
    id: 455,
    parent: 446,
    subject: 'Re: GAS MASK MAN near Fribourg???',
    author: 'Billy',
    email: 'billy@netcity.ch',
    posted: 'November 05, 1998 at 14:22:37',
    short: '11/05/98',
    stage: 0,
    body: `In the french part they have many old legends, "le loyon"
could be from patois. I asked my grandmother (she is from
the Gruyere) she never heard of it. So it's new, not
a real legend. Probably kids. Or an artist. Or a crazy.

${billy}`,
  },
  {
    id: 458,
    subject: 'old death notice, coincidence?? (scan)',
    author: 'Cloudy',
    email: 'cloudy@bluewin.ch',
    posted: 'November 08, 1998 at 17:40:09',
    short: '11/08/98',
    stage: 0,
    image: { src: 'death-notice', w: 260, h: 350, alt: '[notice.jpg]' },
    body: `OK I did some research (I am a librarian, haha). In the
newspaper archive from 1995 there is a death notice from a
village that MIGHT be Stef's village. A young-ish man who
died "abroad". 1995 = war in Bosnia. A soldier???

Here is my scan, sorry quality is bad, the microfilm
machine at work is ancient.`,
  },
  {
    id: 459,
    parent: 458,
    subject: 'Re: old death notice',
    author: 'Billy',
    email: 'billy@netcity.ch',
    posted: 'November 08, 1998 at 18:02:44',
    short: '11/08/98',
    stage: 0,
    body: `Swiss don't go to war. We have the army only at home.
It's illegal to fight for another country. So no.

${billy}`,
  },
  {
    id: 466,
    parent: 446,
    subject: 'Re: GAS MASK MAN near Fribourg???',
    author: 'veilleur',
    posted: 'November 12, 1998 at 02:14:50',
    short: '11/12/98',
    stage: 0,
    body: `he is not kids. he is not an artist.
he was there again on saturday. at the cemetery, the back
row. he stood there one hour. then the lantern was lit.

if you come, dont come at night.`,
  },
  {
    id: 471,
    subject: 'Lights over Lac de la Gruyere - FRIDAY NIGHT',
    author: 'Gaston',
    email: 'gaston.r@vtx.ch',
    posted: 'November 15, 1998 at 00:31:17',
    short: '11/15/98',
    stage: 0,
    body: `3 orange lights in triangle over the lake around 22h. No
sound. Lasted 4 min. My wife saw also. Anyone else??`,
  },
  {
    id: 472,
    parent: 471,
    subject: 'Re: Lights over Lac de la Gruyere',
    author: 'Billy',
    email: 'billy@netcity.ch',
    posted: 'November 15, 1998 at 09:12:05',
    short: '11/15/98',
    stage: 0,
    body: 'Paragliders with lamps. Or the Payerne air base. Next.',
  },
  {
    id: 473,
    parent: 472,
    subject: 'Re: Lights over Lac de la Gruyere',
    author: 'Gaston',
    email: 'gaston.r@vtx.ch',
    posted: 'November 15, 1998 at 11:40:58',
    short: '11/15/98',
    stage: 0,
    body: 'At 22h in november in the fog??? Paragliders?? OK Billy.',
  },
  {
    id: 480,
    subject: 'journalist going to Fribourg village??',
    author: 'Kamikaze',
    email: 'kamikaze77@swissonline.ch',
    posted: 'November 17, 1998 at 12:40:22',
    short: '11/17/98',
    stage: 1,
    body: `Somebody on IRC said a journalist is going to the Le Loyon
village this week to "investigate". Is it someone from
here?? Please post what you find!!!

${kamikaze}`,
  },
  {
    id: 481,
    parent: 480,
    subject: 'Re: journalist going to Fribourg village??',
    author: 'pivex',
    email: 'pivex@freesurf.ch',
    posted: 'November 17, 1998 at 13:02:51',
    short: '11/17/98',
    stage: 1,
    body: `Hope they have a good coat. Remember the last bus.

pivex`,
  },
  {
    id: 486,
    subject: 'the journalist',
    author: 'veilleur',
    posted: 'November 18, 1998 at 01:12:09',
    short: '11/18/98',
    stage: 2,
    body: `the journalist came. took the bus at 16h, room upstairs at
the inn. went to the abbe. ate the soup.

then went up to the cemetery at night with a torch and read
the stones. one by one.

then walked into the forest. nobody does that.`,
  },
  {
    id: 487,
    parent: 486,
    subject: 'Re: the journalist',
    author: 'Cloudy',
    email: 'cloudy@bluewin.ch',
    posted: 'November 18, 1998 at 07:55:30',
    short: '11/18/98',
    stage: 2,
    body: `Veilleur who are you??? How do you know all this??
Are you the journalist?

${cloudy}`,
  },
  {
    id: 488,
    parent: 487,
    subject: 'Re: the journalist',
    author: 'veilleur',
    posted: 'November 18, 1998 at 07:58:44',
    short: '11/18/98',
    stage: 2,
    body: 'no.',
  },
  {
    id: 492,
    subject: 'BUNKER near Le Loyon village',
    author: 'Billy',
    email: 'billy@netcity.ch',
    posted: 'November 18, 1998 at 15:20:11',
    short: '11/18/98',
    stage: 3,
    body: `OK I changed my mind, maybe interesting. My uncle was in
the army in the 60s and says there are hundreds of old
bunkers in the hills, some look like barns or chalets
from outside. The army sold many. If your gas mask man
lives somewhere, it's in one of these. Obvious.

${billy}`,
  },
  {
    id: 493,
    parent: 492,
    subject: 'Re: BUNKER',
    author: 'veilleur',
    posted: 'November 18, 1998 at 15:41:00',
    short: '11/18/98',
    stage: 3,
    body: (state) =>
      state.hasFlag('found_hidden_door')
        ? `the journalist found it today. went inside. stood in the
room with the masks for a long time.

dont move the cupboard back. he will know.`
        : 'the journalist hasnt gone inside yet. there is a cupboard.',
  },
  {
    id: 494,
    subject: 'the lantern',
    author: 'veilleur',
    posted: 'November 18, 1998 at 16:02:37',
    short: '11/18/98',
    stage: 3,
    body: `three years ago this saturday they buried a box at the
cemetery. everybody knew it was too light.`,
  },
  {
    id: 497,
    subject: '(no subject)',
    author: 'veilleur',
    posted: 'November 19, 1998 at 03:48:15',
    short: '11/19/98',
    stage: 4,
    body: (state) =>
      state.hasFlag('grave_left_open')
        ? `i watched you dig. from the ossuary. you didnt see me.

you left it open. raymond will find it at seven.
they will call the gendarmes from romont.

you have until tomorrow.`
        : `i watched you dig. from the ossuary. you didnt see me.
raymond passed twice. bari smelled me and said nothing.
good dog.

you put the earth back. thank you for that.

i saw what you took out of the box.`,
  },
  {
    id: 498,
    parent: 497,
    subject: 'Re: (no subject)',
    author: 'kjhhjahsf',
    email: 'asdf@asdf.com',
    posted: 'November 19, 1998 at 09:10:02',
    short: '11/19/98',
    stage: 4,
    body: `this is fake. veilleur is the journalist making publicity
for the article. classic

sdfsdf`,
  },
  {
    id: 503,
    subject: 'you',
    author: 'veilleur',
    // Posted a minute before the player opens the board.
    posted: (time) => `November 19, 1998 at ${formatTime(parseTime(time) - 1)}:37`,
    short: '11/19/98',
    stage: 5,
    body: `you're reading this in the back room of the inn.

the light is on in the cafe kitchen. your coat is on the
chair. there's a cup by the keyboard that went cold.

turn around.`,
  },
];

/** Top-level threads from the top of the list down: newest stage first, then the prologue order. */
const prologueOrder = [471, 446, 458, 441, 437, 412, 1];
const stageOrder: Record<number, number[]> = { 1: [480], 2: [486], 3: [492, 494], 4: [497], 5: [503] };

export function threadRoots(stage: ForumStage): Post[] {
  const ids = [5, 4, 3, 2, 1].filter((s) => s <= stage).flatMap((s) => stageOrder[s]!);
  return [...ids, ...prologueOrder].map((id) => postById(id)!);
}

export function postById(id: number): Post | undefined {
  return posts.find((post) => post.id === id);
}

export function visiblePosts(stage: ForumStage): Post[] {
  return posts.filter((post) => post.stage <= stage);
}

export function replies(post: Post, stage: ForumStage): Post[] {
  return visiblePosts(stage).filter((reply) => reply.parent === post.id);
}
