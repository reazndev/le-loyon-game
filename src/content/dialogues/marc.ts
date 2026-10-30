import { speakers } from '../speakers';
import type { ScriptNode } from './script';

export const nodes = {
  marc_monologue_1: {
    speaker: speakers.loyon,
    lines: [
      'So. You followed the stories all the way down.',
      'You came for a ghost. The thing they call Le Loyon.',
      "I suppose you've earned the truth. Coming this far. Digging.",
    ],
    choices: [
      { text: 'Who are you?', next: 'marc_name' },
      { text: 'I brought bread. And cheese.', if: { flag: 'has_food' }, next: 'marc_food' },
      { text: 'Did you kill Jean-Pierre Gremaud?', if: { flag: 'found_forest_grave' }, next: 'marc_gremaud_accused' },
    ],
  },
  marc_food: {
    speaker: speakers.loyon,
    effects: { take: 'food_parcel', add: { marc_trust: 1 } },
    lines: [
      '...',
      'Put it on the table.',
    ],
    next: 'marc_food.2',
  },
  'marc_food.2': {
    lines: [
      "I put it on the table and step back. He doesn't touch it. But his head turns to it, and stays turned.",
    ],
    next: 'marc_food.3',
  },
  'marc_food.3': {
    speaker: speakers.loyon,
    lines: [
      'Jean-Pierre brought Gruyère. The salty kind. Every Tuesday.',
      'Merci.',
    ],
    next: 'marc_name',
  },
  marc_name: {
    speaker: speakers.marc,
    effects: { set: 'marc_named' },
    lines: [
      'You read the name on the stone. Marc Chassot.',
      "He died in the war. That's the official story. The easier story.",
      'The truth is I lived. If you can call it that.',
    ],
    next: 'marc_legion',
  },
  marc_legion: {
    speaker: speakers.marc,
    lines: [
      'I left here at twenty. I was angry at everything. My father, the cows, the fog.',
      'I went to Marseille and signed. The Legion gives you a new name. Nobody asks.',
      "Marc Challand. Belgian. Seventeen years. Chad, Lebanon, the Gulf. Sarajevo in '93. Then Sarajevo again.",
    ],
    choices: [
      { text: 'What happened in Bosnia?', next: 'marc_bosnia' },
      { text: 'The disc in the coffin. CHALLAND.', if: { flag: 'has_legion_tag' }, next: 'marc_tag' },
    ],
  },
  marc_tag: {
    speaker: speakers.marc,
    lines: [
      'I gave it to Jean-Pierre to bury. A man should be buried with his name.',
      "Even if it's the wrong one.",
    ],
    next: 'marc_bosnia',
  },
  marc_bosnia: {
    speaker: speakers.marc,
    lines: [
      "August '95. The mountain above the city. A road. A truck. A shell.",
      'Two of my men burned. I was thrown clear. My face. My hands. My ears.',
      '...',
      "I don't tell the rest. I'm sorry. Not because it's secret. I can't.",
    ],
    next: 'marc_after',
  },
  marc_after: {
    speaker: speakers.marc,
    lines: [
      "I walked away in the dark. I don't know why. I didn't decide. My legs decided.",
      "Nine weeks. Croatia, Slovenia, Austria. Lorries. Barns. I don't remember much.",
      'I came here because it was the only place I could find with my eyes shut.',
      "I knocked on my godfather's door at two in the morning. He opened it in his pyjamas.",
    ],
    next: 'marc_war_inside',
  },
  marc_war_inside: {
    speaker: speakers.marc,
    lines: [
      "The war doesn't stay over there. It comes with you. It chews you up and leaves what's left.",
      "It isn't only the face. It's the head. The noise. The shaking. The same five seconds, again and again.",
      "A door slams in the village and I'm on the floor. A car backfires and I'm on that road.",
      "You come back. But you're not the man who left. That man is up there under the stone.",
    ],
    choices: [
      { text: "Why didn't you get help? A doctor?", next: 'marc_help' },
      { text: 'Why the mask?', next: 'marc_mask' },
    ],
  },
  marc_help: {
    speaker: speakers.marc,
    lines: [
      'A doctor needs a name. A name needs papers. Papers say deserter. And a Swiss in a foreign army.',
      'The French would want me for leaving. The Swiss would want me for going.',
      "And they'd all want to look at me.",
      "I couldn't. I still can't.",
    ],
    next: 'marc_mask',
  },
  marc_mask: {
    speaker: speakers.marc,
    lines: [
      'The mask.',
      "When people see the mask, they look at the mask. They don't look for me.",
      "Inside it there's only rubber and charcoal. No smoke. Nothing else gets in.",
      'And I can walk. The forest is the only place that holds still. I walk there all night.',
      'I can go to certain places. Stand by certain people. Without questions. Without pity.',
    ],
    next: 'marc_daniel',
  },
  marc_daniel: {
    speaker: speakers.marc,
    lines: [
      "Daniel found me. Spring '96. In the forest. He knew me by my walk. He laughed and cried at the same time.",
      'He came every Sunday. Brought the newspaper and talked. About nothing. Cows. Football.',
      'He never asked about the war. Not once.',
      "Then one Sunday he didn't come.",
      '...',
      "I knew what it looked like, a man going under. I'd seen it in men in Calvi. I saw it in him. I said nothing.",
      "I couldn't go to his funeral. So I light his lantern. On Saturdays. It's the only thing I can do.",
    ],
    choices: [
      { text: "It wasn't your fault.", next: 'marc_daniel_fault' },
      { text: 'Say nothing.', next: 'marc_daniel_silence' },
    ],
  },
  marc_daniel_fault: {
    speaker: speakers.marc,
    lines: ["Everyone says that to everyone. It doesn't help anyone. But thank you."],
    next: 'marc_mother',
  },
  marc_daniel_silence: {
    effects: { add: { marc_trust: 1 } },
    lines: ["I don't say anything. He nods, as if that was the right answer."],
    next: 'marc_mother',
  },
  marc_mother: {
    speaker: speakers.marc,
    lines: [
      "My mother died in June '96. She thought I was dead. Jean-Pierre wanted to tell her.",
      "I said no. I didn't want her to see me like this. That was my choice. A bad one.",
      'I watched them bury her from the trees. Next to my coffin.',
      "That's my grave you see me at. Hers. Mine. The same stone.",
    ],
    next: 'marc_gremaud',
  },
  marc_gremaud_accused: {
    speaker: speakers.loyon,
    lines: [
      '...',
      'You found the larch.',
      "No. I'll tell you. But not first. First you hear the rest.",
    ],
    next: 'marc_name',
  },
  marc_gremaud: {
    speaker: speakers.marc,
    lines: [
      'Jean-Pierre.',
      'He brought food twice a week for fourteen months. Tuesdays and Fridays. Snow, rain, fog.',
      'He made the funeral. The empty box. He lied to the abbé, to the village, to his wife. For me.',
    ],
    next: 'marc_gremaud_2',
  },
  marc_gremaud_2: {
    speaker: speakers.marc,
    lines: [
      "January '97. A Tuesday. Heavy snow. He didn't come.",
      'At first light I went down the path. He was lying in the snow two hundred meters from the door.',
      "Rucksack still on. Bread, cheese, the newspaper. His heart. He'd told me. He had pills.",
      'He was cold. Hours already.',
    ],
    choices: [
      { text: "And you didn't tell anyone.", next: 'marc_gremaud_3' },
      { text: 'You could have carried him down to the village.', next: 'marc_gremaud_3' },
    ],
  },
  marc_gremaud_3: {
    speaker: speakers.marc,
    lines: [
      'Carry the syndic into the square on my back? In this?',
      'I carried him inside. I sat with him. The snow covered our tracks. They searched for five days.',
      "They came to the door. I heard them. I didn't open.",
      'In March, when the ground was soft, I buried him under the larch.',
      'He liked larches. They lose their needles and come back.',
      "I've kept his ring. For Odile. I never found a way.",
    ],
    choices: [
      { text: 'I believe you.', effects: { add: { marc_trust: 1 } }, next: 'marc_believe' },
      { text: "How do I know that's true?", next: 'marc_doubt' },
    ],
  },
  marc_believe: {
    speaker: speakers.marc,
    lines: [
      '...',
      'Thank you.',
    ],
    next: 'marc_bunker',
  },
  marc_doubt: {
    speaker: speakers.marc,
    lines: [
      "You don't. Nobody can know now. Only him and me were there.",
      "That's why I can't be found.",
    ],
    next: 'marc_bunker',
  },
  marc_bunker: {
    speaker: speakers.marc,
    lines: [
      'So Le Loyon was born. A man in a mask. A thing in the woods. Something to laugh about in the café.',
      "This bunker is quiet. It's safe from the world. Safe from the past, sometimes.",
      'Not always.',
    ],
    next: 'marc_photo_ask',
  },
  marc_photo_ask: {
    speaker: speakers.marc,
    lines: ["You have a camera. I've seen it round your neck."],
    choices: [
      { text: 'May I take your picture? Just the mask.', if: { count: [['marc_trust', '>=', 2]] }, next: 'marc_photo_request' },
      { text: 'May I take your picture? Just the mask.', if: { count: [['marc_trust', '<', 2]] }, next: 'marc_photo_refused' },
      { text: "I won't photograph you.", effects: { add: { marc_trust: 1 } }, next: 'marc_photo_no' },
      { text: 'Raise the camera without asking.', next: 'marc_photo_forced' },
    ],
  },
  marc_photo_request: {
    speaker: speakers.marc,
    if: { count: [['marc_trust', '>=', 2]] },
    effects: { set: 'marc_photo_consent', give: 'photo_marc_masked' },
    lines: [
      '...',
      'The mask. Not the room. Not the hands.',
      "The mask is Le Loyon. It isn't me.",
    ],
    next: 'marc_photo_request.2',
  },
  'marc_photo_request.2': {
    lines: [
      "He stands still. The flash. For an instant the room is white, and he's a shape cut out of paper.",
      "The Polaroid slides out, gray. I don't look at it yet.",
    ],
    next: 'marc_request',
  },
  marc_photo_refused: {
    speaker: speakers.marc,
    if: { count: [['marc_trust', '<', 2]] },
    lines: [
      'No.',
      'Put it away.',
    ],
    choices: [
      { text: 'Put it away.', next: 'marc_request' },
      { text: 'Take it anyway.', next: 'marc_photo_forced' },
    ],
  },
  marc_photo_no: {
    speaker: speakers.marc,
    lines: [
      '...',
      'Thank you.',
    ],
    next: 'marc_request',
  },
  marc_photo_forced: {
    effects: { set: 'took_forced_photo', give: 'photo_marc_forced', assign: { marc_trust: 0 } },
    lines: [
      'I raise the camera. The flash.',
      "He turns away from it with his arm over the mask, very fast. The fastest I've seen him move.",
      'The Polaroid slides out. He stands with his back to me.',
    ],
    next: 'marc_photo_forced.2',
  },
  'marc_photo_forced.2': {
    speaker: speakers.marc,
    lines: [
      'Go.',
      "Take your picture and go. The tunnel's at the back. It comes out in the forest.",
    ],
  },
  marc_request: {
    speaker: speakers.marc,
    lines: [
      "You've found a secret that was kept for a long time. Now I have to ask you to keep it.",
      'Let Marc Chassot stay dead and buried. Let the village have its history. A son who fell far away.',
      'And let them have their mystery too. Le Loyon. A thing in the fog. It does something for them, I think.',
      "Or maybe he's just a habit this old soldier can't break.",
    ],
    next: 'marc_request_2',
  },
  marc_request_2: {
    speaker: speakers.marc,
    lines: [
      "Keep the secret. Don't tell anyone who I am. Let the legend go on.",
      'Can you do that? Can you walk away and let the ghost keep walking?',
    ],
    choices: [
      { text: "I don't know yet.", next: 'marc_ring_route' },
      { text: "I'll think about it.", next: 'marc_ring_route' },
      { text: 'I have a job to do.', next: 'marc_ring_job' },
    ],
  },
  marc_ring_job: {
    speaker: speakers.marc,
    lines: ['I know. I had one too.'],
    next: 'marc_ring_route',
  },
  marc_ring_route: {
    lines: [],
    next: [{ if: { flag: 'saw_ring', count: [['marc_trust', '>=', 1]] }, to: 'marc_ring' }, { if: { notFlag: 'saw_ring', count: [['marc_trust', '>=', 1]] }, to: 'marc_ring_unseen' }, { to: 'marc_goodbye' }],
  },
  marc_ring: {
    speaker: speakers.marc,
    if: { flag: 'saw_ring', count: [['marc_trust', '>=', 1]] },
    lines: [
      "One more thing. The tin by the candle. Jean-Pierre's ring.",
      "Whatever you decide. Give it to Odile. Don't tell her where you got it. Tell her he wasn't alone, after.",
    ],
    choices: [
      { text: "I'll take it to her.", next: 'marc_ring_take' },
      { text: "I can't.", next: 'marc_goodbye' },
    ],
  },
  marc_ring_take: {
    effects: { give: 'ring' },
    lines: ["He doesn't hand it to me. He nods at the tin. I pick it up myself. It weighs almost nothing."],
    next: 'marc_goodbye',
  },
  marc_ring_unseen: {
    speaker: speakers.marc,
    lines: [
      "One more thing. There's a tin by the candle. Jean-Pierre's ring.",
      "Whatever you decide. Give it to Odile. Don't tell her where you got it. Tell her he wasn't alone, after.",
    ],
    choices: [
      { text: "I'll take it to her.", next: 'marc_ring_take' },
      { text: "I can't.", next: 'marc_goodbye' },
    ],
  },
  marc_goodbye: {
    speaker: speakers.marc,
    lines: [
      "Go out through the tunnel. Not the front. Raymond's dog doesn't come this side.",
      "It'll be light soon. The fog will hold till noon.",
      '...',
      'Adieu. {{Goodbye.}}',
    ],
    next: 'marc_goodbye.2',
  },
  'marc_goodbye.2': {
    lines: [
      "He sits down on the edge of the bed with his back to me. His hands on his knees. He doesn't move again.",
    ],
  },
} satisfies Record<string, ScriptNode>;
