import type { LevelKit } from '../../game/kit/levelKit';

/** Runs `work` every frame while the scene is loaded, after the characters have moved. */
export function everyFrame(kit: LevelKit, work: (dt: number) => void): void {
  kit.use((ctx) => ctx.later('register', () => ctx.world.updates.add(work)));
}
