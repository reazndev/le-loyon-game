# Packaging

How to build the desktop game for Linux and Windows, where the files land, and what has been tested.

## Build

| Command | Output |
|---|---|
| `npm run dist:linux` | `release/Le-Loyon-<version>-linux-x86_64.AppImage` |
| `npm run dist:win` | `release/Le-Loyon-<version>-win-x64.zip`, a portable build |
| `npm run dist` | Both |
| `npm run dist:check` | Starts the AppImage with no display, checks the window, and quits from the title |
| `npm run icon` | Redraws `build/icon.png` and `build/icon.ico` (needs ImageMagick 7) |

Each `dist` script runs `npm run build` first, so a type error stops the build. `release/` is gitignored. electron-builder also leaves the unpacked apps in `release/linux-unpacked/` and `release/win-unpacked/`, which you can run directly.

The first build downloads Electron for each platform into `~/.cache/electron`, about 110 MB per platform.

Configuration lives in `electron-builder.yml`. The app id is `ch.leloyon.game` and the product name is "Le Loyon".

## Sizes (version 0.1.0, Electron 45)

| Artifact | Size |
|---|---|
| Linux AppImage | 118 MB |
| Windows zip | 135 MB, 310 MB unpacked |

The game itself is about 1.5 MB of `app.asar`. Everything else is Electron. Vite bundles three.js, so no `node_modules` ship, and only the en-US Chromium locale is kept because the game draws its own UI.

## Windows installer

`dist:win` makes a portable zip: extract it and run `Le Loyon.exe`. It needs no wine on Linux, and electron-builder still sets the exe icon and version info.

An NSIS installer (`setup.exe`) needs wine when built on Linux. On a Windows machine, run:

```sh
npm ci
npm run build
npx electron-builder --win nsis
```

This writes `release/Le-Loyon-<version>-win-x64-setup.exe`, an installer that lets the player choose the install folder. The `nsis` section of `electron-builder.yml` already configures it. On Linux with wine installed, the same `npx electron-builder --win nsis` works.

Neither build is code-signed, so Windows SmartScreen warns on first run. Signing needs a certificate, set through `CSC_LINK` and `CSC_KEY_PASSWORD`.

## How the app behaves

- **Window.** The content area opens at 1280x960, twice the 640x480 frame. On screens whose work area is smaller, it opens at 640x480. The renderer letterboxes 4:3 at any size. F11 or Alt+Enter toggles fullscreen.
- **No menu.** `Menu.setApplicationMenu(null)` removes the menu bar, and Alt does not bring it back.
- **Quit.** The title menu and the pause menu offer Quit only in the desktop app. Quit closes the window, and the app exits when its last window closes.
- **`ELECTRON_RUN_AS_NODE`.** Electron-based editors and terminals export this variable, and with it a plain Electron binary starts as Node and exits. The packaged app has the `RunAsNode` fuse turned off, so it ignores the variable. Check with `npx @electron/fuses read --app release/linux-unpacked/le-loyon`. `npm run electron` and `npm run electron:dev` use the unfused Electron from `node_modules`, so `tools/electron.mjs` deletes the variable instead.
- **Saves.** Saves and settings live in Chromium's localStorage under the user data folder, `~/.config/Le Loyon` on Linux and `%APPDATA%\Le Loyon` on Windows. `npm run electron` uses the same folder because `package.json` sets `productName`.

## Tested

| What | Where | Result |
|---|---|---|
| AppImage starts, shows the title at 1280x960 with no menu, and quits from the title menu, with `ELECTRON_RUN_AS_NODE=1` set (`npm run dist:check`) | Arch Linux, kernel 7.2, Electron headless Ozone backend, no X server | Passed, no page errors |
| Windows zip builds, and the exe has the icon and version info | Built on Arch Linux without wine | Passed |
| Windows exe runs | Not tested. There is no Windows machine or wine here. |  |
| NSIS installer | Not built. It needs wine on Linux, or a Windows machine. |  |

`dist:check` saves a screenshot of the title to `release/launch-check.png`. It runs the AppImage through Playwright's Electron driver with `--ozone-platform=headless`, so it works over SSH and in CI without Xvfb.

## Performance

`node tools/package/perf.mjs --gpu` loads the heaviest views and reports draw calls, triangles, CPU time per frame, GPU time per frame from a timer query, and JS allocations per frame. Without `--gpu` it runs on SwiftShader, which gives real CPU and allocation numbers but no useful GPU time. Run it in a checkout nobody is editing, because the dev server reloads the page when files change.

Numbers from 2026-10-30 at commit `e399d45`, on a Core Ultra 200V laptop with Intel Arc 140V integrated graphics (Mesa), 640x480, 240 frames:

| View | Draw calls | Triangles | CPU ms (p95) | GPU ms | Alloc KB/frame |
|---|---|---|---|---|---|
| village_square day | 130 | 22k | 4.2 (8.0) | 0.5 | 59 |
| forest_path day | 18 | 168k | 1.5 (3.6) | 0.7 | 36 |
| cemetery day | 232 | 76k | 5.0 (9.5) | 0.6 | 106 |
| cemetery night | 113 | 75k | 3.5 (7.2) | 0.5 | 73 |
| bunker_interior, facing the mask heap | 179 | 145k | 4.1 (7.3) | 1.1 | 92 |
| yerly_farm day | 8 | 6k | 1.8 (3.6) | 0.6 | 27 |

Every view holds 60 fps with a steady 16.6 ms frame. GPU time stays near 1 ms, so a GPU ten times slower, such as an Intel UHD 620, still fits in the 16.6 ms budget. CPU time grows with the number of meshes in the scene, so on a slow CPU the cemetery and the village square are the first to drop frames.

What changed to get here:

- Tree models are indexed again after merging, which cuts tree vertex work 2.7 to 4.4 times and forest GPU time by about a quarter.
- Collision rejects far shapes before any math or allocation. That cut forest allocations from 63 to 36 KB per frame.

What is left lives in level code:

- **The mask heap** in `bunker_interior` is one 400k-vertex, non-indexed mesh, 133k triangles. It is drawn whenever the camera faces it, even through walls. Running `mergeVertices` on the merged heap, and hiding it outside the mask store and the rooms next to it, would remove most of the bunker's GPU time.
- **The cemetery** draws about 260 small boxes and 270 quads as separate meshes. Merging static props that share a material, per area, would cut its draw calls by more than half.
- **The village square** has 1,674 meshes, 820 of them copies of one 32-vertex part. Three.js walks and culls every mesh each frame, so instancing or merging that part is the cheapest CPU saving there.
- Instanced trees are culled as one group, so trees behind the fog are still drawn. GPU time is small enough that this can wait.
