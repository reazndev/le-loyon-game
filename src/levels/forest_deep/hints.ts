import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';

type Spot = { x: number; z: number };

export interface TrackLayout {
  larch: Spot;
  grave: Spot;
  /** True well off the track and out of the larch's clearing. */
  offTrack: (x: number, z: number) => boolean;
}

/** The clue under the goal line: the way up to the larch, the grave under it, and the way down. */
export function hints(kit: LevelKit, ctx: SceneContext, { larch, grave, offTrack }: TrackLayout): void {
  const climbing = { notFlag: 'found_forest_grave' };
  const found = { flag: 'found_forest_grave' };

  kit.hint("You've left the track. Go back to the worn strip of mud.", { when: () => offTrack(ctx.player.position.x, ctx.player.position.z) });
  kit.hint('Take a photo of the cross before you go.', {
    if: { ...found, item: 'polaroid_camera', notItem: 'photo_forest_grave' },
    near: { ...grave, r: 4 },
    point: grave,
  });
  kit.hint('A long low pile of stones lies under the larch. Look closer.', { if: climbing, near: { ...larch, r: 9 }, point: grave });
  kit.hint('Follow the track uphill. The larch is gold among the black spruce.', { if: climbing, point: larch });
  kit.hint('Go back down the track to the barn, then the path to the village.');
}
