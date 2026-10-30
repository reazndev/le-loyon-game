import { page, type Pages } from '../page';
import { HELVENET_HOME as HOME } from '../urls';

const SEARCH_URL = 'http://www.helvenet.ch/cgi-bin/search';

const headlines = [
  ['Swisscom: first weeks on the stock market', 'news/swisscom.html'],
  ['Fog on the Plateau: no end in sight before the weekend', 'news/fog.html'],
  ['Football: Swiss qualification hopes', 'news/football.html'],
];

/** Helvenet, the dial-up provider's portal and the browser's home page. */
export const helvenetPages: Pages = {
  [HOME]: page(
    'Helvenet - Home',
    18,
    `
<center><x-img src="helvenet-logo" alt="HELVENET"></x-img><br>Your gateway to the Internet</center>
<x-marquee style="color:#1a3a9a">+++ ${headlines.map(([text]) => text).join(' +++ ')} +++</x-marquee>
<hr>
<table width="100%" cellspacing="6"><tr>
<td width="168" bgcolor="#1a3a9a">
  <font color="#ffffff">Search the Web</font>
  <form action="${SEARCH_URL}">
    <span class="w-field" style="min-width:110px"> </span><br><br>
    <input type="submit" class="w-button" value="Go">
  </form>
</td>
<td>
  <font color="#1a3a9a">TODAY ON HELVENET</font>
  <ul>
    ${headlines.map(([text, url]) => `<li><a href="${HOME}${url}">${text}</a></li>`).join('\n')}
    <li><x-gif name="new"></x-gif> <a href="${HOME}irc/">New: chat with Helvenet IRC!</a></li>
  </ul>
  <br>
  <x-broken w="234" h="60" alt="[Partner]"></x-broken>
</td>
<td width="120" align="center">
  <x-gif name="mailbox"></x-gif><br>You have 0 new messages
</td>
</tr></table>
<hr>
<center>Best viewed with Navigator 4.0 at 800 x 600. (c) 1998 Helvenet.</center>`,
  ),
  [SEARCH_URL]: page(
    'Helvenet Search',
    3,
    `
<center><x-img src="helvenet-logo" alt="HELVENET"></x-img></center>
<hr>
<p>Search is temporarily unavailable. Please try again later.</p>
<p><a href="${HOME}">Back to Helvenet</a></p>`,
  ),
};
