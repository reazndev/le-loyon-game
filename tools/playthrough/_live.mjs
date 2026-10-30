import { launchBrowser, openGame } from '../browser.mjs';
import { runs } from './runs.mjs';
import { Session } from './session.mjs';
const browser = await launchBrowser();
const { page, errors } = await openGame(browser, process.argv[2], '', { width: 1280, height: 800 });
page.on('console', m => { if (m.type() !== 'warning') console.log('console', m.type(), m.text()); });
const s = new Session(page, errors, (l) => console.log(l));
s.shot = async (n) => {};
try {
  for (const st of runs.leave.slice(0, 3)) { console.log('stage', st.name); await st.play(s); }
} catch (e) { console.log('ERR', e.message); }
await page.waitForTimeout(3000);
await page.screenshot({ path: '/tmp/leyon-repro/flow.png' });
console.log(errors.join('\n'));
console.log(await page.evaluate(() => { const c = document.querySelector('#frame canvas'); const r = c?.getBoundingClientRect(); return JSON.stringify({ r, vis: c && getComputedStyle(c).visibility, disp: c && getComputedStyle(c).display, frame: document.getElementById('frame').innerHTML.slice(0, 400) }); }));
await browser.close();
