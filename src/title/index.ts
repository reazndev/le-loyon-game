import { click, drone } from '../engine/audio/generators';
import { CONTINUE_SLOTS, type Game } from '../game/game';
import { isDesktopApp } from '../game/platform';
import { latestSave } from '../game/save';
import { TitleScreen } from './titleScreen';

const NEW_GAME_SCENE = 'home';

interface TitleOption {
  label: string;
  run: () => Promise<void> | void;
}

/**
 * Shows the title screen and resolves once it is on screen. Its menu starts a new game at the
 * reporter's flat, continues from the latest save, opens the settings, or quits the desktop app.
 */
export async function showTitle(game: Game): Promise<void> {
  await game.boot();
  const screen = new TitleScreen();
  const music = drone(game.audio, { bus: 'music', volume: 0.45 });
  const save = latestSave(localStorage, CONTINUE_SLOTS);
  let busy = false;

  const leave = async (then: () => Promise<unknown>) => {
    busy = true;
    music.stop(1.6);
    await game.overlay.fade(1, 1.4);
    screen.stop();
    handle.close();
    await then();
  };
  const options: TitleOption[] = [
    { label: 'New game', run: () => leave(() => game.start({ scene: NEW_GAME_SCENE })) },
    ...(save ? [{ label: 'Continue', run: () => leave(() => game.load(save.slot)) }] : []),
    {
      label: 'Settings',
      run: async () => {
        busy = true;
        await game.openSettings();
        busy = false;
      },
    },
    ...(isDesktopApp() ? [{ label: 'Quit', run: () => window.close() }] : []),
  ];

  screen.menu.set(options.map((option) => option.label));
  screen.menu.onSelect = () => click(game.audio, { bus: 'ui', volume: 0.2 });
  const handle = game.ui.openScreen(screen.element, (_dt, input) => {
    if (busy) return;
    const index = screen.menu.handle(input);
    if (index !== null) void options[index]!.run();
  });
  await game.overlay.fade(1, 0);
  await game.overlay.fade(0, 2);
}
