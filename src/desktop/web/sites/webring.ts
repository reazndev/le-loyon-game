import { page, type Pages } from '../page';
import { BOARD_INDEX, RING_LIST, STEF_HOME } from '../urls';

/** Random always lands on the same dead site, which is what it mostly did. */
const RANDOM = 'http://www.fantomes-romands.ch/';

/** The ring's navigation box that member sites put at the bottom of their pages. */
export function webring(links: { prev: string; next: string }): string {
  return `
<center><table border="2" cellpadding="6" bgcolor="#101030"><tr><td align="center">
<font color="#d0d0d0">This site is a member of the</font><br>
<font color="#f0e040">SWISS MYSTERIES WEBRING</font><br>
[ <a href="${links.prev}">&lt;&lt; Prev</a> | <a href="${RANDOM}">Random</a> | <a href="${links.next}">Next &gt;&gt;</a> | <a href="${RING_LIST}">List Sites</a> ]
</td></tr></table></center>`;
}

const sites = [
  [BOARD_INDEX, 'Alpine Anomalies Board', 'The Swiss board for the strange and unexplained.'],
  [STEF_HOME, "Stef's Page - VTT - Music - Mystery", 'Mountain bike, synth music and a strange encounter.'],
  ['http://members.netcity.ch/~ufojura/', 'UFO Jura Watch', 'Sightings over the Jura since 1994.'],
  [RANDOM, 'Les Fantomes Romands', 'Ghosts and legends of French-speaking Switzerland.'],
  ['http://members.netcity.ch/~valaismystere/', 'Valais Mysterieux', 'Old stories from the Valais valleys.'],
];

/** The ring hub: the list of its five sites, three of them gone. */
export const webringPages: Pages = {
  [RING_LIST]: page(
    'Swiss Mysteries Webring - List Sites',
    4,
    `
<center><h1>SWISS MYSTERIES WEBRING</h1>5 sites in this ring</center>
<hr>
<ol>
${sites.map(([url, name, about]) => `<li><a href="${url}">${name}</a><br>${about}<br><br></li>`).join('\n')}
</ol>
<hr>
<center>Want to join? The ring is full for now.</center>`,
    { background: '#fff' },
  ),
};
