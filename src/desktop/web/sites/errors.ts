import { esc } from '../../dom';
import type { Page } from '../page';

/** The web server's own page for a path that isn't there. */
export function notFound(url: string): Page {
  const path = new URL(url).pathname;
  return {
    title: '404 Not Found',
    size: 1,
    background: '#fff',
    html: () => `
<h1>Not Found</h1>
<p>The requested URL ${esc(path)} was not found on this server.</p>
<hr>
<address>Apache/1.2.6 Server at ${esc(new URL(url).host)} Port 80</address>`,
  };
}
