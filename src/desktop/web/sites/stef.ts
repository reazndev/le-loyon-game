import { marbleTile } from '../../gfx/gifs';
import { page, type Page, type Pages } from '../page';
import { BOARD_INDEX, GUESTBOOK, STEF_BASE as BASE, STEF_HOME } from '../urls';
import { webring } from './webring';

/** Stef's homepage: yellow on blue marble, a MIDI tune, and the Le Loyon photos. */
const look: Partial<Page> = {
  background: () => `#18284a url(${marbleTile()}) repeat`,
  colors: { text: '#f8e830', link: '#40f0f0', visited: '#ff90ff' },
};

const nav = `[ <a href="${BASE}bike.htm">My bike</a> ]  [ <a href="${BASE}cds.htm">My CDs</a> ]  [ <a href="${BASE}loyon.htm">LE LOYON</a> ]  [ <a href="${BASE}links.htm">Links</a> ]  [ <a href="${GUESTBOOK}">Guestbook</a> ]`;
const back = `<center>[ <a href="${STEF_HOME}">Back to my homepage</a> ]</center>`;

const cds: [string, string, number][] = [
  ['Velvet Static', 'Cold Machines', 5],
  ['Neon Cathedral', 'Glass Heart', 5],
  ['Polar Echo', 'Transmission', 5],
  ['Frozen Sun', 'Satellite Love', 5],
  ['The Grey Hours', 'Silhouettes', 4],
  ['Lumen Drive', 'Night Bus', 4],
  ['Mirror Kids', 'Blue Room', 4],
  ['Ghost Signal', 'Black Wire', 4],
  ['Silent Tribe', 'Dark Season', 4],
  ['Kalte Stadt', 'Industria', 3],
  ['Station Nine', 'Tunnel Vision', 3],
  ['The Opal Line', 'Rain on Lausanne', 3],
  ['Concrete Kiss', 'Basel Electric', 3],
  ['Echo Parade', 'Paper Saints', 2],
  ['Vapor Monks', 'Sleepwalk', 1],
];

const photos = [
  ['stef-1', 'loyon1.jpg', 'the path behind the cemetery (he is on the right, between trees)'],
  ['stef-2', 'loyon2.jpg', 'zoom (sorry blurry)'],
  ['stef-3', 'loyon3.jpg', 'looking back to the village. you see the church of L...urs'],
];

const encounter = `=== MY ENCOUNTER WITH "LE LOYON" ===

This happened on Saturday 18 October 1997. I write it
exactly like it happened. I don't drink and I don't take
drugs (ask my mother!).

I was doing a long tour, from the Broye up to the hills,
small roads and forest paths. Around 16h30 the fog came
down very thick. I took a forest path to cut back to the
road, near a village I won't name (I named it before and
people from there emailed me, they were not happy, so
sorry).

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
at work on the boss's scanner.`;

const photoPages: Pages = Object.fromEntries(
  photos.map(([src, file]) => [
    `${BASE}${file}`,
    page(`${file} (JPEG Image, 320 x 240 pixels)`, 24, `<x-img src="${src}" w="320" h="240" alt=""></x-img>`, { background: '#c0c0c0' }),
  ]),
);

export const stefPages: Pages = {
  [STEF_HOME]: {
    title: "STEF'S PAGE - VTT - MUSIC - MYSTERY",
    size: 16,
    ...look,
    html: () => `
<center>
<span class="big">*** WELCOME ON STEF'S PAGE ***</span><br>
<font color="#ff3030" class="blink">VTT - MUSIC - MYSTERY</font><br><br>
<x-gif name="biker"></x-gif><br><br>
Hi! I'm Stephane, 24, from the Broye. I do mountain bike<br>
(VTT) every weekend, I listen to Depeche-style music and I<br>
like mysteries. This page is in english for my e-friends!<br><br>
${nav}<br><br>
<x-gif name="construction-banner"></x-gif><br><br>
You are visitor number <x-counter digits="000412"></x-counter><br><br>
<font color="#c8c8c8">Last update: 03.11.98</font>
</center><br>
${webring({ prev: BOARD_INDEX, next: 'http://members.netcity.ch/~ufojura/' })}`,
    onLoad: (env) => env.playMusic(),
  },
  [`${BASE}bike.htm`]: page(
    'My bike',
    14,
    `
<center>
<span class="big">MY BIKE</span><br><br>
<x-img src="bike" w="200" h="150" alt="[bike.jpg]"></x-img><br><br>
My bike, 1996, best bike ever!! 21 gears<br><br>
</center>
${back}`,
    look,
  ),
  [`${BASE}cds.htm`]: page(
    'My CDs',
    5,
    `
<center>
<span class="big">MY CDs</span><br><br>
<table border="1" cellpadding="3" cellspacing="0">
<tr><td>BAND</td><td>ALBUM</td><td>STARS</td></tr>
${cds.map(([band, album, stars]) => `<tr><td>${band}</td><td>${album}</td><td>${'*'.repeat(stars)}</td></tr>`).join('\n')}
</table><br>
</center>
${back}`,
    look,
  ),
  [`${BASE}links.htm`]: page(
    'My links',
    3,
    `
<center>
<span class="big">LINKS</span><br><br>
<a href="http://members.netcity.ch/~vttbroye/">VTT Club Broye</a><br><br>
<a href="http://www.downhill-suisse.ch/">Downhill Suisse</a><br><br>
<a href="http://members.netcity.ch/~synthpop/">The Synth Pop Archive</a><br><br>
<a href="${BOARD_INDEX}">Alpine Anomalies Board</a> (strange things in Switzerland)<br><br>
</center>
${back}`,
    look,
  ),
  [`${BASE}loyon.htm`]: {
    title: 'LE LOYON',
    size: 12,
    background: '#000',
    colors: { text: '#e8e8e8', link: '#40f0f0', visited: '#ff90ff' },
    html: () => `
<center><x-gif name="skull"></x-gif></center><br>
<pre>${encounter}</pre>
<table width="100%" cellspacing="4"><tr>
${photos
  .map(
    ([src, file, caption]) =>
      `<td width="33%" align="center"><a href="${BASE}${file}"><x-img src="${src}-thumb" w="160" h="120" alt="[${file}]"></x-img></a><br>${caption}</td>`,
  )
  .join('\n')}
</tr></table><br>
<center><font color="#ff3030" class="blink">!!! IF YOU KNOW WHO HE IS, WRITE IN MY GUESTBOOK !!!</font><br><br>
[ <a href="${GUESTBOOK}">Guestbook</a> ]  [ <a href="${STEF_HOME}">Home</a> ]</center>`,
    onLoad: (env) => env.read('pro_read_homepage'),
  },
  ...photoPages,
};
