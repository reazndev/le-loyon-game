import type { Condition } from '../game/conditions';
import type { ItemId } from './items';

// The board posts that close each ending (forum stage 6, the brouillard post) belong to the desktop agent.
// Conditions may name derived flags; test them with `checkStory`.

export interface Passage {
  text: string;
  /** Left out unless this holds. */
  if?: Condition;
}

export interface Article {
  /** The first article whose condition holds is printed. */
  if?: Condition;
  page: string;
  /** The regular column the piece runs under, if any. */
  column?: string;
  headline: string;
  subhead?: string;
  paragraphs: Passage[];
  /** The halftone photo: the first of these the player holds, with its caption. */
  photos?: { item: ItemId; caption: string }[];
}

export interface Ending {
  flag: 'ending_publish' | 'ending_secret' | 'ending_leave';
  articles: Article[];
  /** Text on black, one passage per screen, in order. */
  epilogue: Passage[];
}

const frontPage: Article = {
  if: { flag: 'has_evidence' },
  page: "L'ÉCHO, Saturday 21 November 1998, front page",
  headline: '"LE LOYON" HAS A NAME',
  subhead: 'Soldier buried in 1995 has been living in an army fort above his village',
  paragraphs: [
    {
      text: "LEURS (FR) - For three years the people of Leurs have joked about a man in a gas mask who walks in the Bois-Noir forest at night. They call him Le Loyon. This week L'Écho met him. He is Marc Chassot, 40, born in Leurs, whom the village buried on 18 November 1995 as a soldier killed abroad.",
    },
    {
      text: 'Chassot left Leurs in 1978 and joined the French Foreign Legion under an assumed name, as the Legion allows. He served for seventeen years. In August 1995, with French UN troops near Sarajevo, he was badly burned when a shell hit his vehicle. He was listed as missing, presumed dead. He was not dead. He walked home.',
    },
    {
      text: "The coffin that four men of the village carried up the hill in 1995 was empty. L'Écho has seen it. The late syndic, Jean-Pierre Gremaud, arranged the funeral and hid Chassot in a disused army fort that the commune had bought in 1994. Serving in a foreign army is a crime under Swiss military law.",
    },
    {
      if: { flag: 'grave_left_open' },
      text: 'On Wednesday night the grave was opened. The gendarmerie in Romont is investigating.',
    },
    {
      text: "Gremaud disappeared in January 1997. L'Écho has found a grave in the forest above the fort, marked with his initials. Chassot says Gremaud died of a heart attack in the snow while bringing him food, and that he buried him because he could not go for help without giving himself up. There is no way at present to confirm this. The cantonal police were informed on Friday.",
    },
    {
      if: { notFlag: 'took_forced_photo' },
      text: 'Chassot suffers from the effects of war trauma. He asked that his story not be told.',
    },
    {
      if: { flag: 'took_forced_photo' },
      text: 'Chassot suffers from the effects of war trauma. He refused to be photographed.',
    },
    {
      text: 'Abbé Louis Overney, curé of Leurs since 1968, declined to comment. "There are things a priest may not say," he said. (réd.)',
    },
  ],
  photos: [
    { item: 'photo_marc_masked', caption: '"Le Loyon": Marc Chassot in the fort where he has lived since 1995.' },
    { item: 'photo_marc_forced', caption: 'Marc Chassot turns away from our photographer.' },
    { item: 'photo_hidden_room', caption: 'The room in the Bois-Noir fort where Marc Chassot lives.' },
    { item: 'photo_forest_grave', caption: 'A grave in the forest above Leurs, marked "J.-P. G."' },
    { item: 'photo_empty_coffin', caption: 'The empty coffin in the Chassot family grave.' },
  ],
};

const pageNine: Article = {
  page: "L'ÉCHO, Saturday 21 November 1998, page 9",
  headline: 'QUESTIONS IN LEURS',
  paragraphs: [
    {
      text: `LEURS (FR) - Is the "Loyon" of Leurs a soldier the village buried in 1995? A man who says he is Marc Chassot, a former Foreign Legion sergeant declared dead in Bosnia, told L'Écho he has lived in the woods above the village for three years. The commune and the parish declined to comment. (réd.)`,
    },
  ],
};

const fogColumn: Article = {
  page: "L'ÉCHO, Saturday supplement, page 14",
  column: 'STRANGE SWITZERLAND',
  headline: 'THE FOG OF LEURS',
  paragraphs: [
    {
      text: 'LEURS (FR) - In November the stratus settles on the Fribourg plateau like a lid, and in Leurs, a village of 312 souls, it stays. You can stand in the square and not see the church.',
    },
    {
      text: 'People here will tell you about a man in a gas mask who walks in the forest at night. They call him Le Loyon. They say it with a smile, the way you talk about the weather.',
    },
    {
      text: 'I went looking for him for three days. I found a good inn, a patient priest, a dairy that sells the best bread in the canton, and graves that are kept with great care.',
    },
    { text: 'If there is someone in those woods, he does no harm. Leave him the fog. (réd.)' },
  ],
};

export const endings = {
  publish: {
    flag: 'ending_publish',
    articles: [frontPage, pageNine],
    epilogue: [
      {
        text: `On Monday the cantonal police went up to the Bois-Noir fort
with the commune's new syndic and a locksmith.

The room behind the steel door was empty. The bed was made,
the blanket folded tight. The candles were gone. The white cap
was gone. There was no mask on the hook.`,
      },
      {
        text: `They found Jean-Pierre Gremaud under the larch.
The autopsy could say very little after two years. It found no
sign of violence. The case was left open.

Odile Gremaud buried her husband in the cemetery on a Thursday,
under the stone that says Nous t'attendons.`,
      },
      {
        if: { flag: 'has_ring' },
        text: `You never gave her the ring. You couldn't think of a way to
face her after the article. It is in a drawer in your flat,
in a throat pastille tin.`,
      },
      {
        text: `The military justice office opened a file on Marc Chassot for
foreign military service. The French embassy asked for details.
Neither found him.

The lantern on Daniel Menoud's grave was never lit again.`,
      },
      {
        text: `Your article was picked up by two national papers and a
television channel in France. Reporters came to Leurs with
cameras for a week. Nobody in the village would speak to them.

Monique Rossier wrote to the newspaper asking it to stop
sending people. The letter was not printed.`,
      },
    ],
  },
  secret: {
    flag: 'ending_secret',
    articles: [fogColumn],
    epilogue: [
      {
        text: `You never told anyone. Not Ruth, not your friends, not the
police. Some nights you think about the larch, and about how
you have only his word for what happened there.`,
      },
      {
        if: { flag: 'has_ring' },
        text: `You posted the ring to Odile Gremaud in a padded envelope
with no return address, and a note in capitals:

  HE WAS NOT ALONE, AFTER. HE WAS BRINGING BREAD TO A FRIEND.

In December, a lantern appeared on the stone that says
Nous t'attendons.`,
      },
      {
        if: { flag: 'took_forced_photo' },
        text: `The Polaroid of a man turning away is in a drawer. You have
taken it out twice. You have never shown it to anyone.`,
      },
      {
        if: { item: 'photo_marc_masked', notFlag: 'took_forced_photo' },
        text: `The Polaroid of the mask is pinned above your desk. Visitors
ask what it is. You tell them it's a Swiss legend.`,
      },
    ],
  },
  leave: {
    flag: 'ending_leave',
    articles: [],
    // The bus scene plays the leave_epilogue dialogue before these screens.
    epilogue: [
      {
        text: `You wrote eight hundred words about the fog and the folklore.
Ruth ran them on page 14, under the horoscope.

Nobody in Leurs read them.`,
      },
      {
        if: { flag: 'opened_coffin' },
        text: `You still have a key with a brass tag stamped K.P. 3. You
don't know what it opens. You know exactly what it opens.`,
      },
      {
        if: { flag: 'found_forest_grave' },
        text: `Some nights you think about the larch, and the stones, and
the initials cut with a knife. You never told anyone.`,
      },
    ],
  },
} satisfies Record<string, Ending>;

/** The failure screen when Raymond catches the reporter. The first text whose condition holds is shown. */
export const caught = {
  texts: [
    {
      if: { count: [['dig_stage', '==', 0]] },
      text: `Raymond Bapst phoned the gendarmes anyway.

They found no damage, but you were asked to leave Leurs on
the first bus. Monique did not charge for the last night.
She didn't speak to you at breakfast.`,
    },
    {
      text: `The gendarmes from Romont arrived at 2:40.

You spent the night in a cell in Romont and the next day
in an interview room. Violation of a grave. Disturbing
the peace of the dead. Your editor came to collect you.

On Saturday, L'Écho ran a short item on page 9 that did
not carry your name:

  JOURNALIST HELD AFTER GRAVE DESECRATED IN LEURS

The village did not speak to the newspaper.
In Leurs, nobody mentioned what was or wasn't in the box.`,
    },
  ],
  /** Reloads the save made when the reporter last woke. */
  action: 'Continue from the last sleep',
} satisfies { texts: Passage[]; action: string };
