import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';

type Spot = { x: number; z: number };

export interface TrackLayout {
  larch: Spot;
  grave: Spot;
  /** Where the track splits. */
  boulder: Spot;
  /** A little way up the right fork, the way to the larch. */
  rightFork: Spot;
  /** The hunter's high seat at the end of the left fork. */
  seat: Spot;
  /** True well off the track and out of the larch's clearing. */
  offTrack: (x: number, z: number) => boolean;
}

/** The clue under the goal line: the way up to the larch past the fork, the grave under it, and the way down. */
export function hints(kit: LevelKit, ctx: SceneContext, { larch, grave, boulder, rightFork, seat, offTrack }: TrackLayout): void {
  const climbing = { notFlag: 'found_forest_grave' };
  const found = { flag: 'found_forest_grave' };

  kit.hint("You've left the track. Go back to the worn strip of mud.", { when: () => offTrack(ctx.player.position.x, ctx.player.position.z) });
  kit.hint('Take a photo of the cross before you go.', {
    if: { ...found, item: 'polaroid_camera', notItem: 'photo_forest_grave' },
    near: { ...grave, r: 4 },
    point: grave,
  });
  kit.hint('A long low pile of stones lies under the larch. Look closer.', { if: climbing, near: { ...larch, r: 9 }, point: grave });
  const atFork = { ...boulder, r: 5.5 };
  kit.hint("The track splits. The army mapped this slope. The chart in the fort's guard room.", {
    if: { notFlag: ['read_chart_larch', 'found_forest_grave'] },
    near: atFork,
    point: boulder,
  });
  kit.hint('Keep right of the boulder, as the chart shows.', { if: { flag: 'read_chart_larch', notFlag: 'found_forest_grave' }, near: atFork, point: rightFork });
  kit.hint('A dead end. Go back down to the boulder and take the other side.', { if: climbing, near: { ...seat, r: 6 }, point: boulder });
  kit.hint('Follow the track uphill. The larch is gold among the black spruce.', { if: climbing, point: larch });
  kit.hint('Go back down the track to the barn, then the path to the village.');
}
