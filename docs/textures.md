# Textures

All textures come from FLORA and go through `tools/textures/ps1-texture.sh`, which crops to a square, makes the image tile, shrinks it, mutes the colors, and cuts the palette. Raw downloads live in `assets-src/textures/`, finished textures in `public/assets/textures/<name>.png`. Level code loads them by name.

## Pipeline

```sh
tools/textures/ps1-texture.sh assets-src/textures/stone_wall.png public/assets/textures/stone_wall.png 128 32
```

Arguments: input, output, size in pixels (default 128), palette colors (default 32), and `yes` or `no` for tiling (default `yes`). With `no`, the image keeps its aspect ratio and the size is its width.

Cutouts such as trees use `tools/textures/ps1-sprite.sh <in> <out> [width] [colors] [background] [flood|global]`. It removes the flat background and gives 1-bit alpha, as PS1 sprites had. Use `global` for shapes with background showing through gaps, such as bare branches and fences.

## Available textures

All in `public/assets/textures/`. Tiling textures are 128x128 unless noted.

| Group | Names |
|---|---|
| Village walls and roofs | `stone_wall`, `plaster_wall`, `render_wall`, `wood_planks`, `shutters`, `roof_tiles`, `roof_shingles` |
| Ground | `cobblestone`, `asphalt`, `gravel_path`, `grass_dead`, `pasture`, `mud`, `forest_floor`, `snow_slush`, `grave_dirt` |
| Forest | `bark_spruce`, `bark_birch`, `moss_rock`, `spruce_foliage` |
| Cemetery | `gravestone_granite`, `gravestone_sandstone`, `iron_fence` (cutout with alpha) |
| Church | `church_stone`, `church_floor`, `pew_wood` |
| Interiors | `wallpaper_inn`, `wallpaper_home`, `wood_floor`, `carpet` |
| Bunker | `concrete_bunker`, `concrete_floor`, `tunnel_vault`, `tiles_white`, `rust_metal` |
| Single objects, not tiling, 96 px wide | `door_wood`, `window_dark`, `window_lit`, `bunker_door` |
| Le Loyon | `camo_cape` (tiling), `gas_mask` (128 px cutout with alpha, front view) |
| Sprites with alpha | `tree_spruce`, `tree_beech_bare`, `tree_birch` (96 px wide, tall), `fern_dead`, `bush`, `grass_tuft` (64 px wide) |
| NPC faces, 64x64 | `face_priest`, `face_farmer`, `face_innkeeper`, `face_mechanic`, `face_old_woman`, `face_watchman`, `face_young_woman` |
| Forum photos | `photo_sighting_path`, `photo_sighting_field`, `photo_sighting_cemetery` (320 px JPEG, low quality on purpose) in `public/assets/photos/`, for the 90s web pages |

## Spend log

FLORA balance on 2026-10-30: $5.13. Budget for the build: $4.50.

| Date | Batch | Model | Images | Cost |
|---|---|---|---|---|
| 2026-10-30 | Test: stone_wall | FLUX 3 Image Klein | 1 | $0.009 |
| 2026-10-30 | Batch 1: walls, ground, forest, cemetery, bunker | FLUX 3 Image Klein | 20 | $0.18 |
| 2026-10-30 | Batch 2: interiors, doors, windows, cape, mask | FLUX 3 Image Klein | 20 | $0.18 |
| 2026-10-30 | Batch 3: tree and plant sprites, NPC faces | FLUX 3 Image Klein | 13 | $0.117 |
| 2026-10-30 | Forum sighting photos | GPT Image 2.5 | 3 | $0.165 |
| | **Total** | | 57 | **$0.65** |
