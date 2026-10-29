import { createServer } from 'vite';

/** Starts the Vite dev server on a free port and returns it with its URL. */
export async function startDevServer() {
  const server = await createServer({ logLevel: 'error', server: { port: 0, strictPort: false } });
  await server.listen();
  const url = server.resolvedUrls?.local[0];
  if (!url) throw new Error('Vite did not report a local URL');
  return { server, url };
}
