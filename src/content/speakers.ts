/**
 * Name labels in the dialogue box, by cast id. The reporter and narration have no label.
 * Marc shows as Le Loyon until he says his name (`marc_named`).
 */
export const speakers = {
  loyon: 'Le Loyon',
  marc: 'Marc',
  overney: 'Abbé Overney',
  monique: 'Monique',
  yannick: 'Yannick',
  bernard: 'Bernard',
  gilles: 'Gilles',
  christine: 'Christine',
  odile: 'Odile',
  raymond: 'Raymond',
  driver: 'Driver',
  editor: 'Ruth',
};

/**
 * What the dialogue box calls someone until the player has heard their name in a line, a choice,
 * or a document. Names that are always known, like the abbé's title or Le Loyon, are not listed.
 */
const roles: Record<string, string> = {
  [speakers.monique]: 'Innkeeper',
  [speakers.yannick]: 'Boy',
  [speakers.bernard]: 'Farmer',
  [speakers.gilles]: 'Mechanic',
  [speakers.christine]: 'Woman at the dairy',
  [speakers.odile]: 'Woman at the door',
  [speakers.raymond]: 'Watchman',
};

const knownFlag = (name: string) => `knows_name_${name.toLowerCase()}`;

/** The flags for every role name that `text` mentions, so later lines can show the name. */
export function namesHeardIn(text: string): string[] {
  return Object.keys(roles)
    .filter((name) => new RegExp(`\\b${name}\\b`).test(text))
    .map(knownFlag);
}

/** The label for a speaker: the name once heard, the role before. */
export function speakerLabel(speaker: string, hasFlag: (flag: string) => boolean): string {
  const role = roles[speaker];
  return role && !hasFlag(knownFlag(speaker)) ? role : speaker;
}
