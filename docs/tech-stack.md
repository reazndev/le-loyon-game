# Tech stack

## Decision

| Part | Choice |
|---|---|
| Rendering | Three.js |
| Language | TypeScript |
| Dev server and bundler | Vite |
| Desktop builds | Electron (Windows `.exe`, Linux AppImage) |
| Browser demo | Same build, uploaded to itch.io |
| 3D assets | Blender, exported as glTF |
| Textures | Aseprite or Krita, 64 to 256 px |
| Version control | Git, with LFS for binary assets |
| Texture pipeline | Images generated with GPT image generation through Codex, run through our own filter script for the PS1 look |
| Networking | None. Single player. |

## Why

Claude writes the code. That changed the pick from Godot 4 to Three.js:

- Claude writes TypeScript more reliably than GDScript. Godot 4 renamed much of the Godot 3 API, which leads to wrong calls.
- The whole game is code. Levels, triggers, and cameras live in files Claude can read and edit. Godot scene files are hard to edit by hand without the editor.
- Claude can run the game in a headless browser and take screenshots to check its own work.
- Electron ships Chromium, so WebGL behaves the same on Linux and Windows. Tauri uses WebKitGTK on Linux, which has weaker WebGL performance.

## Trade-offs we accept

- No level editor. Claude builds levels in code. The user can add Blender models later.
- Electron builds are large, around 100 MB. That doesn't matter for a game.

## Alternatives considered

- **Godot 4.** The best pick for a human developer: free, has an editor, exports to both platforms. Rejected because Claude writes the code.
- **Unity.** Its license is a long-term risk after the 2023 runtime fee episode.
- **Raylib, Bevy.** We'd have to build too many tools ourselves.
