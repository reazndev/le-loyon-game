import { esc } from '../../dom';
import type { ForumStage } from '../../forum';
import { starTile } from '../../gfx/gifs';
import type { Page, PageEnv, Pages } from '../page';
import { BOARD_BASE as BASE, BOARD_INDEX, RING_LIST, STEF_HOME } from '../urls';
import { flatThread, postById, readingOrder, replies, rootOf, threadRoots, type Post } from './boardPosts';
import { webring } from './webring';

const POST_SCRIPT = 'http://www.alpanom.ch/cgi-bin/wwwboard.pl';

/** Black with a star field; pale green text, yellow headings, links brightened to read on black. */
const look: Pick<Page, 'background' | 'colors'> = {
  background: () => `#000 url(${starTile()}) repeat`,
  colors: { text: '#a8f0a0', link: '#6a9cff', visited: '#b87ae8' },
};

const yellow = (text: string) => `<font color="#f0e040">${text}</font>`;

/** A thread's page, named after the message number of its first post. */
function threadUrl(root: Post): string {
  return `${BASE}messages/${root.id}.html`;
}

/** A post's place on its thread's page. */
function postUrl(post: Post): string {
  const root = rootOf(post);
  return post === root ? threadUrl(root) : `${threadUrl(root)}#m${post.id}`;
}

function listItem(post: Post, stage: ForumStage): string {
  const children = replies(post, stage);
  return `<li>${post.hot ? '<x-gif name="new"></x-gif> ' : ''}<a href="${postUrl(post)}">${esc(post.subject)}</a> - ${esc(post.author)} <i>${post.short}</i>${
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

/**
 * A thread as one flat page: the first post and every reply in order, each with its author and
 * date. Previous and Next message step through the whole board in reading order, so a player can
 * read on without going back to the index. A post counts as read once it scrolls into view.
 */
function threadPage(root: Post, stage: ForumStage): Page {
  const thread = flatThread(root, stage);
  const order = readingOrder(stage);
  const body = (post: Post, env: PageEnv) => (typeof post.body === 'string' ? post.body : post.body(env.state));
  const posted = (post: Post, env: PageEnv) => (typeof post.posted === 'string' ? post.posted : post.posted(env.time));
  const toIndex = `[ <a href="${BOARD_INDEX}">Back to index</a> ]`;
  const jump = (post: Post | undefined, label: string) =>
    post ? `[ <a href="${rootOf(post) === root ? `#m${post.id}` : postUrl(post)}">${label}</a> ] ` : '';
  const nav = (post: Post) => {
    const at = order.indexOf(post);
    return `<center>${jump(order[at - 1], 'Previous message')}${jump(order[at + 1], 'Next message')}${toIndex}</center>`;
  };
  const message = (post: Post, env: PageEnv) => `
<hr>
<a name="m${post.id}"></a>
<div data-seen="${post.id}">
${yellow(esc(post.subject))}<br>
Posted by ${author(post)} on ${posted(post, env)}${post.parent ? `, in reply to ${esc(postById(post.parent)!.author)}` : ''}:<br><br>
<pre>${esc(body(post, env))}</pre>
${post.image ? `<center><x-img src="${post.image.src}" w="${post.image.w}" h="${post.image.h}" alt="${post.image.alt}"></x-img></center><br>` : ''}
${post.link ? `<ul><li><a href="${post.link.url}">${esc(post.link.title)}</a></li></ul><br>` : ''}
</div>
${nav(post)}`;
  const quote = (env: PageEnv) =>
    body(root, env)
      .split('\n')
      .map((line) => `: ${line}`)
      .join('\n');
  return {
    title: root.subject,
    size: 4 + thread.length * 2 + thread.filter((post) => post.image).length * 30,
    ...look,
    html: (env) => `
<center>${toIndex} [ <a href="#postfp">Post Followup</a> ] [ <a href="${BASE}faq.html">FAQ</a> ]</center>
${thread.map((post) => message(post, env)).join('')}
<hr>
<a name="postfp"></a>
${postForm(`Re: ${root.subject}`, quote(env), 'Post a Followup')}
<hr>
<center>${toIndex}</center>`,
    onSeen(key, env) {
      const post = postById(Number(key));
      if (post?.reads) env.read(post.reads);
      env.postRead(key);
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
    ...Object.fromEntries(threadRoots(stage).map((root) => [threadUrl(root), threadPage(root, stage)])),
  };
}
