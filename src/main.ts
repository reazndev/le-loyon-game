import { installDebugHooks, parseDebugParams } from './game/debug';
import { Game } from './game/game';
import { allScenes } from './levels';
import { showTitle } from './title';

const params = parseDebugParams(location.search);
const game = new Game(document.getElementById('frame')!, allScenes);
const hooks = installDebugHooks(game);

// `?scene=` skips the title and loads a scene directly, for debugging and screenshots.
if (params.scene) {
  await game.start({
    scene: params.scene,
    ...(params.pose ? { at: params.pose } : {}),
    ...(params.time ? { time: params.time } : {}),
    flags: params.flags,
  });
} else {
  await showTitle(game);
}
hooks.ready = true;
