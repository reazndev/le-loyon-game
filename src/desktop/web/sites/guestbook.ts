import { esc } from '../../dom';
import { page, type Page, type Pages } from '../page';
import { GUESTBOOK, STEF_HOME } from '../urls';

const SIGN = 'http://www.guestbook-free.com/cgi-bin/gb.pl?user=stefvtt&action=sign';
const ADD = 'http://www.guestbook-free.com/cgi-bin/gb.pl?action=add';

interface Entry {
  name: string;
  email?: string;
  homepage?: string;
  date: string;
  comments: string;
}

/** Newest first. Text from docs/script/01-prologue.md. */
const entries: Entry[] = [
  {
    name: 'yann',
    date: 'Fri, Nov 13, 1998 02:31:07',
    comments: 'i live in leurs. he is real. hes not a ghost and hes not a crazy. leave him alone. the lantern was lit again.',
  },
  {
    name: 'Kamikaze',
    email: 'kamikaze77@swissonline.ch',
    date: 'Tue, Nov 3, 1998 08:20:55',
    comments: 'Found you from the Alpine Anomalies board. Creepy photos!! Do you think he is dangerous?',
  },
  {
    name: 'Stef (admin)',
    email: 'stefvtt@netcity.ch',
    homepage: STEF_HOME,
    date: 'Mon, Oct 26, 1998 19:02:13',
    comments: "To the people who emailed me: OK I removed the name of the village. I don't want problems. Sorry.",
  },
  {
    name: 'bertrand.c',
    email: 'bertrand.c@freesurf.ch',
    date: 'Sun, Oct 25, 1998 22:47:40',
    comments: 'Its not funny to put a village on internet like this. People live there. Remove it please.',
  },
  {
    name: 'Melanie',
    email: 'mel_77@bluewin.ch',
    date: 'Thu, Jul 30, 1998 15:11:02',
    comments: 'Coucou Stef! Nice page! When do we ride again? Bisous',
  },
  {
    name: 'Patrick VTT Club Broye',
    homepage: 'http://members.netcity.ch/~vttbroye/',
    date: 'Mon, Jun 8, 1998 12:00:31',
    comments: 'Nice bike photos. The Loyon thing is fake no? Its your brother in a costume haha',
  },
  {
    name: 'Ana from Lisboa',
    homepage: 'http://www.paginas-gratis.pt/~ana/gatos.html',
    date: 'Sat, Feb 14, 1998 10:44:18',
    comments: 'Hello from Portugal! Visit my page about cats!',
  },
  {
    name: 'Sandra',
    date: 'Wed, Nov 26, 1997 21:15:00',
    comments:
      "I saw something like this near Romont in the summer. A man in a cape on the edge of a field. I thought it was a scarecrow until it turned. I didn't sleep that night.",
  },
  {
    name: 'Stef (admin)',
    email: 'stefvtt@netcity.ch',
    homepage: STEF_HOME,
    date: 'Mon, Nov 3, 1997 20:30:30',
    comments: 'First entry in my own guestbook! Please sign!!',
  },
];

const link = (href: string | undefined, text: string) => (href ? `<a href="${href}">${esc(text)}</a>` : '');

function entry(e: Entry): string {
  return `
<table width="100%" border="1" cellspacing="0" cellpadding="3" bgcolor="#e8e8e8">
<tr bgcolor="#c8cce0"><td width="45%">Name: ${esc(e.name)}</td><td>Date: ${e.date}</td></tr>
<tr><td>Email: ${link(e.email && `mailto:${e.email}`, e.email ?? '')}</td><td>Homepage: ${link(e.homepage, e.homepage ?? '')}</td></tr>
<tr><td colspan="2">Comments:<br>${esc(e.comments)}</td></tr>
</table><br>`;
}

/** The ad frame on top and the free service's links, shared by every guestbook page. */
function frame(body: string): string {
  return `
<div class="w-topframe"><center><a href="http://www.meet-singles-now.com/"><span class="w-blinkborder"><x-img src="singles-ad" w="468" h="60" alt="[Meet singles]"></x-img></span></a></center></div>
<center><span class="big">Stef's Guestbook</span><br><br>
[ <a href="${SIGN}">Sign the Guestbook</a> ] [ <a href="${GUESTBOOK}">View the Guestbook</a> ]</center><br>
${body}
<hr>
<center>Guestbook by guestbook-free.com - get your FREE guestbook now!</center>`;
}

const field = (label: string, width: number) => `<tr><td>${label}</td><td><span class="w-field" style="width:${width}px"></span></td></tr>`;

const look: Partial<Page> = { background: '#fff' };

export const guestbookPages: Pages = {
  [GUESTBOOK]: {
    title: "Stef's Guestbook",
    size: 15,
    ...look,
    html: () => frame(entries.map(entry).join('')),
    onLoad: (env) => env.read('pro_read_guestbook'),
  },
  [SIGN]: page(
    "Sign Stef's Guestbook",
    6,
    frame(`
<form action="${ADD}">
<table>
${field('Name:', 260)}
${field('Email:', 260)}
${field('Homepage:', 260)}
<tr><td colspan="2">Comments:<br><span class="w-field w-area"></span></td></tr>
</table>
<input type="submit" class="w-button" value="Sign the Guestbook">
</form>`),
    look,
  ),
  [ADD]: page('Error', 1, frame('<p>Error 500: guestbook temporarily full. Upgrade to Guestbook PRO for only $4.95/month!</p>'), look),
};
