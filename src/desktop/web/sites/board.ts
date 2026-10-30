import { esc } from '../../dom';
import type { ForumStage } from '../../forum';
import { starTile } from '../../gfx/gifs';
import type { Page, PageEnv, Pages } from '../page';
import { BOARD_BASE as BASE, BOARD_INDEX, RING_LIST, STEF_HOME } from '../urls';
import { postById, replies, threadRoots, visiblePosts, type Post } from './boardPosts';
import { webring } from './webring';

const POST_SCRIPT = 'http://www.alpanom.ch/cgi-bin/wwwboard.pl';

/** Black with a star field; pale green text, yellow headings, links brightened to read on black. */
const look: Pick<Page, 'background' | 'colors'> = {
  background: () => `#000 url(${starTile()}) repeat`,
  colors: { text: '#a8f0a0', link: '#6a9cff', visited: '#b87ae8' },
};

const yellow = (text: string) => `<font color="#f0e040">${text}</font>`;

function messageUrl(post: Post): string {
  return `${BASE}messages/${post.id}.html`;
}

function listItem(post: Post, stage: ForumStage): string {
  const children = replies(post, stage);
  return `<li><a href="${messageUrl(post)}">${esc(post.subject)}</a> - ${esc(post.author)} <i>${post.short}</i>${
    children.length ? `<ul>${children.map((child) => listItem(child, stage)).join('')}</ul>` : ''
  }</li>`;
}

function field(label: string, width: number, value = ''): string {
  return `<tr><td>${label}</td><td><span class="w-field" style="width:${width}px">${esc(value)}</span></td></tr>`;
}

function postForm(subject: string, quote: string, title: string): string {
  return `
${yellow(title)}
<form action="${POST_SCRIPT}">
<table>
${field('Name:', 260)}
${field('E-Mail:', 260)}
${field('Subject:', 360, subject)}
<tr><td colspan="2">Message:<br><span class="w-field w-area">${esc(quote)}</span></td></tr>
${field('Optional Link URL:', 260, 'http://')}
${field('Optional Image URL:', 260, 'http://')}
</table>
<input type="submit" class="w-button" value="Submit Follow Up"> <input type="reset" class="w-button" value="Reset">
</form>`;
}

function indexPage(stage: ForumStage): Page {
  const hits = String(18223 + stage * 137).padStart(7, '0');
  return {
    title: 'Alpine Anomalies Board',
    size: 22,
    ...look,
    html: () => `
<center>
<x-img src="board-banner" alt="[ALPINE ANOMALIES]"></x-img><br><br>
<x-gif name="construction"></x-gif><br><br>
${yellow('Welcome to ALPINE ANOMALIES - the Swiss board for the strange &amp; unexplained. Est. 1997.')}<br>
Please read the <a href="${BASE}messages/1.html">RULES</a> before posting. No flame wars. No porn. No selling. Be nice!!<br><br>
<x-counter digits="${hits}"></x-counter><br><br>
[ <a href="#post">Post a Message</a> ] [ <a href="${BASE}faq.html">FAQ</a> ] [ <a href="${BASE}messages/1.html">Rules</a> ] [ <a href="${BASE}links.html">Links</a> ] [ <a href="${RING_LIST}">Webring</a> ]
<br><br><x-gif name="flames"></x-gif>
</center>
<ul>
${threadRoots(stage).map((post) => listItem(post, stage)).join('\n')}
</ul>
<br>
<center><x-gif name="flames"></x-gif></center>
<a name="post"></a>
${postForm('', '', 'Post A New Message!')}
<hr>
${webring({ prev: 'http://members.netcity.ch/~ufojura/', next: STEF_HOME })}`,
    onLoad(env) {
      if (stage === 0) env.read('pro_read_board');
      else env.setFlag(`forum_seen_${stage}`);
    },
  };
}

function author(post: Post): string {
  return post.email ? `<a href="mailto:${post.email}">${esc(post.author)}</a>` : esc(post.author);
}

function postPage(post: Post, stage: ForumStage): Page {
  const nav = `<center>[ <a href="#followups">Follow Ups</a> ] [ <a href="#postfp">Post Followup</a> ] [ <a href="${BOARD_INDEX}">Alpine Anomalies Board</a> ] [ <a href="${BASE}faq.html">FAQ</a> ]</center>`;
  const body = (env: PageEnv) => (typeof post.body === 'string' ? post.body : post.body(env.state));
  const posted = (env: PageEnv) => (typeof post.posted === 'string' ? post.posted : post.posted(env.time));
  const quote = (env: PageEnv) =>
    body(env)
      .split('\n')
      .map((line) => `: ${line}`)
      .join('\n');
  const children = replies(post, stage);
  return {
    title: post.subject,
    size: 6 + (post.image ? 30 : 0),
    ...look,
    html: (env) => `
${nav}
<hr>
<center><h1>${yellow(esc(post.subject))}</h1></center>
<hr>
<p>Posted by ${author(post)} on ${posted(env)}:</p>
${post.parent ? `<p>In Reply to: <a href="${messageUrl(postById(post.parent)!)}">${esc(postById(post.parent)!.subject)}</a> posted by ${esc(postById(post.parent)!.author)}</p>` : ''}
<pre>${esc(body(env))}</pre>
${post.image ? `<center><x-img src="${post.image.src}" w="${post.image.w}" h="${post.image.h}" alt="${post.image.alt}"></x-img></center><br>` : ''}
${post.link ? `<ul><li><a href="${post.link.url}">${esc(post.link.title)}</a></li></ul><br>` : ''}
<hr>
<a name="followups">Follow Ups:</a><br>
<ul>${children.map((child) => listItem(child, stage)).join('')}</ul>
<br><hr>
<a name="postfp"></a>
${postForm(post.subject.startsWith('Re: ') ? post.subject : `Re: ${post.subject}`, quote(env), 'Post a Followup')}
<hr>
${nav}`,
    onLoad(env) {
      if (post.reads) env.read(post.reads);
      env.postRead(String(post.id));
    },
  };
}

const faq: Page = {
  title: 'Alpine Anomalies - FAQ',
  size: 4,
  ...look,
  html: () => `
<center><h1>${yellow('FAQ')}</h1></center>
<hr>
<p>${yellow('Q: What is this board?')}<br>
A: A place to post sightings and strange things in Switzerland. Lights, creatures, ghosts, old stories.</p>
<p>${yellow('Q: Why in English?')}<br>
A: So everybody understands. Many of us are not Swiss.</p>
<p>${yellow('Q: Can I post photos?')}<br>
A: Put them on your homepage and use the Optional Image URL.</p>
<p>${yellow('Q: How do I register?')}<br>
A: Registration is closed for now, sorry. Too much spam.</p>
<p>${yellow('Q: Who runs this?')}<br>
A: admin, from Zurich. The server is free, so be patient when it is slow.</p>
<hr>
<center>[ <a href="${BOARD_INDEX}">Back to the board</a> ]</center>`,
};

const links: Page = {
  title: 'Alpine Anomalies - Links',
  size: 3,
  ...look,
  html: () => `
<center><h1>${yellow('LINKS')}</h1></center>
<hr>
<ul>
<li><a href="${RING_LIST}">Swiss Mysteries Webring</a> - all the sites in the ring</li>
<li><a href="${STEF_HOME}">Stef's page</a> - VTT, music and his Le Loyon photos</li>
<li><a href="http://www.ufo-info-schweiz.ch/">UFO-Info Schweiz</a> - in German</li>
<li><a href="http://members.netcity.ch/~fantomes/">Les Fantomes Romands</a> - ghost stories from Romandie</li>
</ul>
<hr>
<center>[ <a href="${BOARD_INDEX}">Back to the board</a> ]</center>`,
};

const postingDisabled: Page = {
  title: 'Alpine Anomalies Board',
  size: 1,
  ...look,
  html: () => `
<center><h1>${yellow('Error')}</h1></center>
<p>Posting is disabled for your account. Please register first (registration is closed).</p>
<p><a href="${BOARD_INDEX}">Back to Alpine Anomalies Board</a></p>`,
};

/** The board at a stage: the index, the posts it shows, and its side pages. */
export function boardPages(stage: ForumStage): Pages {
  return {
    [BOARD_INDEX]: indexPage(stage),
    [BASE]: indexPage(stage),
    [`${BASE}faq.html`]: faq,
    [`${BASE}links.html`]: links,
    [POST_SCRIPT]: postingDisabled,
    ...Object.fromEntries(visiblePosts(stage).map((post) => [messageUrl(post), postPage(post, stage)])),
  };
}
