# Style

Target: 90s Japanese survival horror on the PS1, mainly Silent Hill (1999).

## PS1 look, decided

We fake the console's hardware limits in shaders and render settings:

1. Render at low resolution and upscale with nearest-neighbor.
2. Snap vertices to a coarse grid so geometry wobbles as the camera moves.
3. Turn off perspective-correct texturing so textures warp on large polygons.
4. Use nearest filtering, no mipmaps, and textures of 64 to 256 px.
5. Reduce color depth to 15-bit with ordered dithering.
6. Use thick fog and a short draw distance.
7. Keep models low-poly and use mostly vertex lighting.

## Feel, decided 2026-10-29

| Topic | Choice | Notes |
|---|---|---|
| Camera | First person | |
| Controls | Tank controls | Forward and back move, left and right turn on the spot. No free mouse look. Turning slowly is part of the tension. |
| Threats | No combat | The player hides and runs. |
| Players | Single player | Co-op was considered and dropped. |
| Resolution | 640x480 | All PS1 effects stay on, but text and distant objects stay readable. No CRT filter. |
| Language | English | Place names and folklore terms stay in their original language. |
| Input | Keyboard and gamepad | Gamepad through the browser Gamepad API. |
| Length | 1 to 3 hours | Several areas, puzzles, and story beats. |

## Atmosphere, decided 2026-10-30

- **Psychological horror first.** The game builds dread through anticipation. Jumpscares are allowed but rare, and they pay off tension the game has built up.
- **Sudden movement, few reveals.** Something moves at the edge of the screen, a shape crosses the path far ahead. The game rarely shows Le Loyon clearly. Most sightings end before the player is sure.
- **Priorities.** Story, immersion, and the graphics style come first. Scares serve those three.
- **Silent Hill fog.** Visibility is very short, a few meters, as in Silent Hill 1. Objects fade out of the fog instead of popping in.
- **Sound carries the fear.** Random crackling, footsteps that aren't the player's, branches snapping off-screen, and moments of total silence. Use sound to suggest things the player can't see.
- **J-horror of the 90s and 00s.** The build-up and anticipation of films like Ringu (1998), Pulse (Kairo, 2001), Ju-On (2002), and Dark Water (2002). Pulse is the main model. What we take from them:
  - Long, quiet stretches where nothing happens, so the player waits for something to happen.
  - Figures standing still in the background or at the edge of the frame, with no music cue. Some players won't notice them at all.
  - Movement that looks slightly wrong: too slow, stiff, stumbling.
  - Faces that stay hidden.
  - Technology as the channel for the unease. In Pulse it's the internet. Here it can be the phone and the forum: static, a post from a user who shouldn't exist, a photo with something in it the player didn't see.
  - Washed-out, desaturated colors and empty rooms.
- **References.** See [references/](references/README.md) for the user's mood images: Le Loyon sightings, gas masks, a bunker tunnel, foggy forests, Silent Hill 2, and J-horror film stills.

## Textures

Codex agents generate images with GPT image generation, using the user's ChatGPT subscription. Claude runs them through our own filter script to match the PS1 look: downscale to 64 to 256 px, reduce the palette, and dither. The same script processes every texture, so they all match.

## Open questions

None right now. Story questions live in [story.md](story.md).
