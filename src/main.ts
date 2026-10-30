import { installDebugHooks, parseDebugParams } from './game/debug';
import { Game } from './game/game';
import { allScenes } from './levels';

const scenes = allScenes;
const START_SCENE = 'home';

const params = parseDebugParams(location.search);
const game = new Game(document.getElementById('frame')!, scenes);
const hooks = installDebugHooks(game);

await game.start({
  scene: params.scene ?? START_SCENE,
  ...(params.pose ? { at: params.pose } : {}),
  ...(params.time ? { time: params.time } : {}),
  flags: params.flags,
});
hooks.ready = true;
