import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { CALENDAR, CLOCK, COAT_HOOK, CRUCIFIX, DIARY, DRESSER, EAST, FRIDGE, HIS_CHAIR, LIVING_DOOR, NORTH, PHOTO, PIPE, SOUTH, STOVE, WEST, WINDOW } from './layout';
import { looks, type Look } from './looks';

interface Spot {
  prompt: string;
  at: { x: number; z: number };
  radius: number;
  say: Look[];
}

/** Every object the player can look at. Positions are on the floor plan; height doesn't matter. */
const spots: Spot[] = [
  { prompt: 'Look at the coat', at: { x: COAT_HOOK.x, z: SOUTH - 0.15 }, radius: 0.25, say: ['coat', 'boots'] },
  { prompt: 'Look at the pipe', at: PIPE, radius: 0.1, say: ['pipe'] },
  { prompt: 'Look at the chair', at: HIS_CHAIR, radius: 0.22, say: ['chair'] },
  { prompt: 'Look at the photo', at: { x: EAST - 0.05, z: PHOTO.z }, radius: 0.15, say: ['photo'] },
  { prompt: 'Look at the crucifix', at: { x: EAST - 0.05, z: CRUCIFIX.z }, radius: 0.15, say: ['crucifix'] },
  { prompt: 'Look at the calendar', at: { x: EAST - 0.05, z: CALENDAR.z }, radius: 0.15, say: ['calendar'] },
  { prompt: 'Look at the clock', at: { x: CLOCK.x, z: NORTH + 0.05 }, radius: 0.15, say: ['clock'] },
  { prompt: 'Look at the stove', at: { x: WEST + 0.3, z: STOVE.z }, radius: 0.45, say: ['stove'] },
  { prompt: 'Look at the sink', at: { x: WINDOW.x + 0.25, z: NORTH + 0.3 }, radius: 0.25, say: ['sink'] },
  { prompt: 'Look out of the window', at: { x: WINDOW.x - 0.3, z: NORTH + 0.3 }, radius: 0.25, say: ['window'] },
  { prompt: 'Look at the dresser', at: { x: WEST + 0.25, z: DRESSER.z + 0.2 }, radius: 0.45, say: ['dresser'] },
];

/** The look hotspots, the clipping on the fridge, the living room door, and the diary while it is there. */
export function placeLooks(kit: LevelKit, ctx: SceneContext, night: boolean, diaryThere: () => boolean): void {
  // His chair reads differently once it has moved behind the player's back (kit_chair_moved).
  const current = (look: Look): Look => (look === 'chair' && ctx.state.hasFlag('kit_chair_moved') ? 'chairMoved' : look);
  const say = (lines: Look[]) => () => ctx.say(lines.map((look) => looks[current(look)]));
  spots.forEach((spot) => kit.hotspot({ prompt: spot.prompt, radius: spot.radius, onInteract: say(spot.say) }).at(spot.at.x, 0, spot.at.z));

  kit.hotspot({ prompt: 'Read the clipping', radius: 0.2, onInteract: () => ctx.readDocument('doc_odile_clipping') }).at(FRIDGE.x + 0.08, 0, NORTH + FRIDGE.d);
  kit.hotspot({ prompt: 'Listen at the door', radius: 0.4, onInteract: say([night ? 'livingRoomNight' : 'livingRoomDay']) }).at(WEST, 0, LIVING_DOOR.z);
  kit.hotspot({ prompt: 'Look at the diary', radius: 0.1, enabled: diaryThere, onInteract: say(['diary']) }).at(DIARY.x, 0, DIARY.z);
}
