import { check, type Condition, type StateView } from '../game/conditions';
import { strongEvidence } from './items';

/** Flags the game sets as the story moves. Set once and never cleared. */
export const storyFlags = [
  'pro_read_mail',
  'pro_read_board',
  'pro_read_thread_bus',
  'pro_read_homepage',
  'pro_read_guestbook',
  'pro_done',
  'arrived',
  'inn_checked_in',
  'abbe_met',
  'abbe_told_graves',
  'heifer_missing',
  'dinner_day1',
  'read_grave_menoud',
  'read_grave_gremaud',
  'read_grave_chassot',
  'saw_lantern_lit',
  'met_raymond',
  'met_gilles',
  'first_sighting',
  'found_bunker',
  'bunker_door_wedged',
  'bunker_door_open',
  'found_hidden_door',
  'found_biscuit_wrapper',
  'looked_at_dust',
  'cupboard_restored',
  'skipped_follow',
  'read_register',
  'abbe_seal_hint',
  'read_baptism',
  'read_chronicle',
  'lit_candle',
  'heifer_found',
  'heifer_returned',
  'bernard_light_coffin',
  'knows_legion',
  'odile_talked',
  'christine_daniel_hint',
  'dinner_day2',
  'dug_gremaud_stone',
  'raymond_warned',
  'tarp_over_hole',
  'opened_coffin',
  'read_gremaud_letter',
  'grave_refilled',
  'grave_left_open',
  'found_forest_grave',
  'editor_called',
  'abbe_day3',
  'met_veilleur',
  'knock_pattern_done',
  'entered_hidden_room',
  'read_marc_notebook',
  'met_marc',
  'marc_named',
  'saw_ring',
  'marc_photo_consent',
  'took_forced_photo',
  'ending_publish',
  'ending_secret',
  'ending_leave',
  'caught',
  // The desktop agent sets these when the player opens forum stage n at the inn.
  'forum_seen_1',
  'forum_seen_2',
  'forum_seen_3',
  'forum_seen_4',
  'forum_seen_5',
  'forum_seen_6',
  // Scene beats that play once, and small scene state the levels keep across visits.
  'lai_bell_draft',
  'kit_clock_stop',
  'gar_radio_static',
  'gar_yannick_left',
  'sat_in_confessional',
  'chu_confessional',
  // Set by the dig's "Dig." choice and cleared at once by the cemetery, so never saved.
  'dig_confirmed',
] as const;

export type StoryFlag = (typeof storyFlags)[number];

/** Numeric story values and their ranges. Unset counts read as 0. */
export const counts = {
  /** 1 to 3 for the three days, 4 for the ending morning. */
  day: { min: 1, max: 4 },
  /** 0 by day, otherwise the number of the current night. */
  night: { min: 0, max: 3 },
  dig_stage: { min: 0, max: 5 },
  refill_stage: { min: 0, max: 3 },
  marc_trust: { min: 0, max: 5 },
  film_shots: { min: 0, max: 10 },
  /** Computed by the desktop agent when the player connects at the inn. */
  forum_stage: { min: 1, max: 6 },
} as const;

export type CountName = keyof typeof counts;

const twoOf = (a: StoryFlag, b: StoryFlag, c: StoryFlag): Condition => ({
  any: [{ flag: [a, b] }, { flag: [a, c] }, { flag: [b, c] }],
});

/** Flags that follow from other state. The game never stores them; read them with `holds` or `checkStory`. */
export const derivedFlags = {
  pro_knows_village: { flag: ['pro_read_thread_bus', 'pro_read_homepage', 'pro_read_guestbook'] },
  suspects_empty_coffin: twoOf('read_register', 'bernard_light_coffin', 'odile_talked'),
  has_evidence: { any: [{ item: 'gremaud_letter' }, ...strongEvidence.map((item) => ({ item }))] },
  has_shovel: { item: 'shovel' },
  has_food: { item: 'food_parcel' },
  has_bunker_key: { item: 'bunker_key' },
  has_legion_tag: { item: 'legion_tag' },
  has_ring: { item: 'ring' },
} satisfies Record<string, Condition>;

export type DerivedFlag = keyof typeof derivedFlags;
export type Flag = StoryFlag | DerivedFlag;

export const isDerivedFlag = (flag: string): flag is DerivedFlag => Object.hasOwn(derivedFlags, flag);

/** Each derived flag as a function over the game state. */
export const derived = Object.fromEntries(
  Object.entries(derivedFlags).map(([flag, condition]) => [flag, (state: StateView) => check(condition, state)]),
) as Record<DerivedFlag, (state: StateView) => boolean>;

/** Whether a story flag is set or a derived flag holds. */
export function holds(flag: Flag, state: StateView): boolean {
  return isDerivedFlag(flag) ? derived[flag](state) : state.hasFlag(flag);
}

const list = (value: string | string[] | undefined): string[] => (value === undefined ? [] : Array.isArray(value) ? value : [value]);
const oneOrMany = (values: string[]) => (values.length === 0 ? undefined : values.length === 1 ? values[0] : values);

/** Replaces derived flags in a condition with the conditions they stand for, so `check` can test it. */
export function expandDerived(condition: Condition): Condition {
  const { flag, notFlag, any, all, not, ...rest } = condition;
  const isStored = (f: string) => !isDerivedFlag(f);
  const stored: Condition = { ...rest };
  const flags = oneOrMany(list(flag).filter(isStored));
  const notFlags = oneOrMany(list(notFlag).filter(isStored));
  if (flags) stored.flag = flags;
  if (notFlags) stored.notFlag = notFlags;
  if (any) stored.any = any.map(expandDerived);
  if (all) stored.all = all.map(expandDerived);
  if (not) stored.not = expandDerived(not);
  const implied = [
    ...list(flag).filter(isDerivedFlag).map((f) => derivedFlags[f]),
    ...list(notFlag).filter(isDerivedFlag).map((f) => ({ not: derivedFlags[f] })),
  ];
  return implied.length === 0 ? stored : { all: [stored, ...implied] };
}

/** `check` that understands derived flags. Use it for every condition from `src/content`. */
export function checkStory(condition: Condition | undefined, state: StateView): boolean {
  return condition === undefined || check(expandDerived(condition), state);
}

export const flags = { story: storyFlags, derived: derivedFlags, counts };
