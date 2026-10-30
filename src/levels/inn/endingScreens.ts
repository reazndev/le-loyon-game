import { checkStory, endings, type Ending } from '../../content';
import type { Article, Passage } from '../../content/endings';
import type { SceneContext } from '../../game/scene';

/**
 * The end of the game: the newspaper pages the ending printed, the epilogue on black, and a last
 * screen that returns to the start. The inn's phone plays `publish` and `secret`; the bus stop
 * plays `leave`.
 */

const INK = '#1c1b18';

function el<K extends keyof HTMLElementTagNameMap>(tag: K, css: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.style.cssText = css;
  if (text !== undefined) node.textContent = text;
  return node;
}

/**
 * Shows `screen` full-frame, fades it in, and resolves when the player presses interact, but not
 * before `minSeconds` have passed, so a held key doesn't skip a page unread.
 */
function showUntilConfirmed(ctx: SceneContext, screen: HTMLElement, minSeconds: number, action = 'Continue'): Promise<void> {
  screen.style.opacity = '0';
  screen.style.transition = 'opacity 1.4s';
  const hint = el('div', 'position:absolute;right:18px;bottom:10px;opacity:0;transition:opacity 1s', `[ ${action} ]`);
  screen.append(hint);
  let shown = 0;
  return new Promise((resolve) => {
    const handle = ctx.openScreen(screen, (dt, input) => {
      shown += dt;
      if (shown > minSeconds) hint.style.opacity = '0.8';
      if (shown > minSeconds && input.pressed('interact')) {
        handle.close();
        resolve();
      }
    });
    requestAnimationFrame(() => requestAnimationFrame(() => (screen.style.opacity = '1')));
  });
}

const holds = (passage: Passage, ctx: SceneContext) => checkStory(passage.if, ctx.state);

/** One newspaper page: masthead, headline, the halftone photo if the reporter has one, the text. */
function newspaperPage(ctx: SceneContext, article: Article): HTMLElement {
  const page = el(
    'div',
    `position:absolute;inset:0;background:#c9c4b6;color:${INK};padding:18px 26px 34px;font-family:Georgia,'Times New Roman',serif;overflow:hidden;text-shadow:none;display:flex;flex-direction:column`,
  );
  page.append(
    el('div', 'font-size:34px;font-weight:bold;letter-spacing:2px;text-align:center;border-bottom:3px double #1c1b18;line-height:1.1', "L'ÉCHO"),
    el('div', 'font-size:10px;text-align:center;margin:3px 0 8px;letter-spacing:1px', article.page),
  );
  if (article.column) page.append(el('div', 'font-size:10px;letter-spacing:2px;font-weight:bold', article.column));
  page.append(el('div', 'font-size:22px;font-weight:bold;line-height:1.1;margin:2px 0 4px', article.headline));
  if (article.subhead) page.append(el('div', 'font-size:12px;font-style:italic;margin-bottom:8px', article.subhead));

  // The columns fill top to bottom, as a printed page does.
  const body = el('div', 'flex:1;min-height:0;column-count:3;column-fill:auto;column-gap:14px;column-rule:1px solid #8a867c;font-size:11.5px;line-height:1.3;text-align:justify');
  const photo = article.photos?.find((p) => ctx.state.hasItem(p.item));
  if (photo) {
    const figure = el('div', 'break-inside:avoid;margin-bottom:6px');
    // A halftone: grey dots on newsprint, the Polaroid as the press made it.
    // The reporter's own Polaroid when the save has it; the mask alone otherwise.
    const print = ctx.state.photo(photo.item)?.image;
    const mask = photo.item === 'photo_marc_masked' || photo.item === 'photo_marc_forced';
    const subject = print ? `url(${print}) center/cover no-repeat,` : mask ? 'url(assets/textures/gas_mask.png) center/auto 92% no-repeat,' : '';
    figure.append(
      el('div', `height:110px;background:radial-gradient(circle,#2a2925 38%,transparent 42%) 0 0/4px 4px,${subject}#8a867c;filter:grayscale(1) contrast(1.2)`),
      el('div', 'font-size:9px;font-style:italic;margin-top:2px', photo.caption),
    );
    body.append(figure);
  }
  article.paragraphs.filter((p) => holds(p, ctx)).forEach((p) => body.append(el('p', 'margin:0 0 6px', p.text)));
  page.append(body);
  return page;
}

function blackScreen(text: string): HTMLElement {
  const screen = el('div', 'position:absolute;inset:0;background:#000;color:#e8e4dc;display:flex;align-items:center;justify-content:center;padding:0 60px');
  screen.append(el('div', 'white-space:pre-wrap;line-height:1.4', text));
  return screen;
}

function creditsScreen(): HTMLElement {
  const screen = el('div', 'position:absolute;inset:0;background:#000;color:#e8e4dc;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px');
  screen.append(
    el('div', 'font-size:28px;letter-spacing:4px', 'LE LOYON'),
    el('div', 'opacity:0.7', 'Leurs, canton of Fribourg, November 1998.'),
    el('div', 'opacity:0.7', 'Leurs and everyone in it are invented.'),
    el('div', 'opacity:0.45;font-size:12px;margin-top:24px', 'Dog bark: "Barking" by Piecesofuk, CC BY-SA 4.0, Wikimedia Commons.'),
    el(
      'div',
      'opacity:0.45;font-size:12px;max-width:520px;text-align:center',
      'Animal calls: Alvaro Ortiz Troncoso, Benoît Van Hecke, Marie-Lan Taÿ Pamart (xeno-canto), Livlandfahrer, 1bumer, FelixWilson. CC BY-SA, Wikimedia Commons.',
    ),
  );
  return screen;
}

/** Plays the ending's pages, epilogue, and last screen, then returns to the title screen. */
export async function playEnding(ctx: SceneContext, which: keyof typeof endings): Promise<void> {
  const ending: Ending = endings[which];
  const article = ending.articles.find((a) => checkStory(a.if, ctx.state));
  if (article) await showUntilConfirmed(ctx, newspaperPage(ctx, article), 4);
  for (const passage of ending.epilogue.filter((p) => holds(p, ctx))) await showUntilConfirmed(ctx, blackScreen(passage.text), 2.5);
  await showUntilConfirmed(ctx, creditsScreen(), 3, 'Return to the title');
  // The title is shown before any scene loads; starting the page again without `?scene=` brings it back.
  location.assign(location.pathname);
}
