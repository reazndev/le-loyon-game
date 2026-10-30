import { createServer } from 'vite';

/**
 * Starts the Vite dev server on a free port and returns it with its URL. It neither watches files
 * nor reloads the page, so other agents editing the checkout can't restart a shot or a run midway.
 */
export async function startDevServer() {
  const server = await createServer({ logLevel: 'error', server: { port: 0, strictPort: false, hmr: false, watch: null } });
  await server.listen();
  const url = server.resolvedUrls?.local[0];
  if (!url) throw new Error('Vite did not report a local URL');
  return { server, url };
}
