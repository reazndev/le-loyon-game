# Assets

Where the game's fonts, textures, and sounds come from, and under which terms they ship.

## Licenses

| Asset | Files | Source | License |
|---|---|---|---|
| DotGothic16 pixel font, UI text | `public/assets/fonts/dotgothic16-latin.woff2`, `dotgothic16-latin-ext.woff2` | Fontworks, through the `@fontsource/dotgothic16` package | SIL Open Font License 1.1. Full text in `public/assets/fonts/DotGothic16-OFL.txt`, which must ship with the font. |
| Textures and photos | `public/assets/textures/`, `public/assets/photos/` | Generated with FLORA, then filtered for the PS1 look | Generated for this project. Prompts, models, and spending are in [textures.md](textures.md). |
| Procedural textures | Painted at runtime by `src/engine/render/proceduralTextures.ts` | Written for this project | Project code |
| Procedural sound | Wind, drone, crackle, clicks, and footsteps synthesized by `src/engine/audio/` | Written for this project | Project code |
| Three.js | Bundled into `dist/` | three.js authors | MIT |
| Electron and Chromium | Desktop builds | Electron and Chromium authors | MIT for Electron. Chromium's notices are in `LICENSES.chromium.html`, which electron-builder copies into each build. |

The OFL allows bundling and redistributing the font with the game. It forbids selling the font on its own and requires the license text to travel with it.
