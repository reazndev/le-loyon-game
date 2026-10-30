/** What the reporter notices in the kitchen. Each look is one short line of narration. */
export const looks = {
  coat: "A man's grey coat on the hook. It still smells of pipe smoke.",
  boots: 'Work boots under the coat. Somebody keeps them polished.',
  pipe: 'His pipe, in a clean ashtray. The bowl is still black.',
  photo: 'Gremaud in a dark suit with the syndic\'s sash. He looks like he wants the photo over with.',
  calendar: "The commune's calendar for 1997, still on January. Nothing is written on the fourteenth.",
  chair: 'The second chair is pushed in square to the table. The cushion has no dent in it.',
  chairMoved: "The second chair is pulled out from the table, turned a little toward the room. I'm sure it was pushed in.",
  crucifix: 'A crucifix over his place at the table, with a sprig of dry box behind it.',
  clock: "The kitchen clock. It's the loudest thing in the house.",
  stove: 'An enamel stove, still warm. The wood box beside it is full.',
  sink: 'The sink is dry. One cup upside down on the drainer.',
  dresser: 'Plates in rows on the dresser. Enough for a big family.',
  window: "Fog against the glass. I can't see the inn, and it's next door.",
  diary: "A black pocket diary. Agenda 1996. It isn't mine to pick up.",
  livingRoomDay: 'The television is on in there. Nobody is watching it.',
  livingRoomNight: 'Nothing behind the door now. Not even the television.',
} as const;

export type Look = keyof typeof looks;
