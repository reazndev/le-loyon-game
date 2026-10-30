import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { day, headingTo, headingUpTheHill, near, ways } from '../village_square/hints';
import { abbeSpots, OFFICE, OFFICE_DOOR, REGISTER_CUPBOARD, simoneSpots } from './layout';

/** The church's clues: the priest, the register cupboard and the office, and the side door to the hill. */
export function hints(kit: LevelKit, ctx: SceneContext): void {
  const toChurch = headingTo(ctx, 'church');
  const cupboard = near(REGISTER_CUPBOARD, 2);

  // A2: the burials books are in the office until the printer prints.
  const officeDoor = { x: OFFICE.x0, z: OFFICE_DOOR.z };
  const computer = { x: simoneSpots.office.x, z: simoneSpots.office.z - 0.75 };
  kit.hint('The note says the office. The door is at the back of the sacristy.', { if: { count: day(2), flag: 'saw_register_gap', notItem: 'burials_book', notFlag: ['simone_printed', 'read_register'] }, near: cupboard, point: officeDoor });
  kit.hint('Read the note stuck to the monitor.', { if: { flag: 'simone_asked_help', notFlag: 'simone_printed' }, near: near(computer, 2), point: computer });
  kit.hint('Put the books back in the gap and open the green one for 1995.', { if: { item: 'burials_book' }, near: cupboard, point: REGISTER_CUPBOARD });
  kit.hint('Open the green book of burials for 1995. Find the Chassot entry.', { if: { count: day(2) }, near: cupboard, when: toChurch, point: REGISTER_CUPBOARD });
  kit.hint('Locked until tomorrow. The priest said to come after morning mass.', { if: { count: day(1) }, near: cupboard });
  kit.hint('The priest is praying at the side altar. He will talk to you.', { if: { count: day(3), flag: 'read_gremaud_letter', notFlag: 'abbe_day3' }, near: near(abbeSpots.kneeling, 3), point: abbeSpots.kneeling });

  kit.hint('The priest is by the candles on the right, near the altar.', { if: { count: day(1) }, when: toChurch });
  kit.hint('The registers are in the sacristy, the door left of the altar.', { if: { count: day(2) }, when: toChurch, point: REGISTER_CUPBOARD });
  // The church and its side door are locked at night.
  kit.hint('The side door right of the altar opens onto the path up the hill.', { when: () => ctx.state.time === 'day' && headingUpTheHill(ctx)() });
  ways(kit, ctx, 'church');
}
