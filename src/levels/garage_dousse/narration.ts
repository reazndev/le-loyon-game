/** What the reporter notices in the garage. Plain and short, in the voice of 02-village.md. */
export const narration = {
  calendar: ["A tyre dealer's calendar from Romont, still on November.", 'On the first Monday someone wrote in pencil: "Gremaud, batt."'],
  fiat: ['A Fiat 127 up on the lift, wheels hanging.', 'Oil drips from the sump into a tray. It has been dripping a long time.'],
  pit: ['The inspection pit. A meter and a half down, black water at the bottom.', 'It smells of old oil and cold concrete.'],
  radioOn: ['A small radio on the shelf, turned low. Music from Lausanne, then a man talking about the weather.'],
  radioOff: ['The radio is off. The dial is still on the same station.'],
  postcard: ['A postcard pinned above the bench, faded blue. A harbor, and a citadel on the rock.', "The pin has rusted into the wall. Nobody has taken it down in a long time."],
  postcardGone: ['A rusty pin, and a square of paint paler than the rest, where the card was.'],
} satisfies Record<string, string[]>;
