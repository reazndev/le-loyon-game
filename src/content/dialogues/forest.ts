import type { ScriptNode } from './script';

export const nodes = {
  forest_shrine: {
    lines: [
      'A little wooden house on a post. Inside, a plaster Virgin with a chipped nose.',
      'Fresh: a stub of candle and a sprig of fir.',
    ],
  },
  forest_shrine_night: {
    if: { count: [['night', '>=', 1]] },
    lines: [
      "The Virgin's face in the torchlight. Someone has turned her to face the path to the fort.",
      "She used to face the other way. There's a pale mark in the moss.",
    ],
  },
  forest_bridge: {
    lines: ['Two planks over a stream. Black water, very fast, no sound but a hiss.'],
  },
  forest_lost: {
    lines: ['Every tree looks like the last one. I go back the way I came, I think.'],
  },
  sighting_1: {
    effects: { set: 'first_sighting' },
    lines: [
      'Someone was standing there. Right there, by the wall.',
      "The back gate is open. It wasn't open before.",
    ],
  },
  heifer_found: {
    effects: { set: 'heifer_found' },
    lines: [
      'There she is. Brown, white face. Standing like a statue at the edge of the trees.',
      "She's staring into the forest. She doesn't look at me.",
    ],
  },
  heifer_lead: {
    lines: ['I take her by the collar. She comes, slowly, looking back over her shoulder the whole way down.'],
  },
  forest_hatch: {
    lines: [
      'A concrete square in the moss, a steel lid. No handle on this side. An emergency exit.',
      'The moss around it is worn into a path.',
    ],
  },
  forest_grave: {
    effects: { set: 'found_forest_grave' },
    lines: [
      'A larch. The only one. It stands out against the spruce like a lamp.',
      'Under it, stones. A long low pile of them, the length of a man.',
      'A cross made of branches. Letters cut into it with a knife.',
      'J.-P. G. The fourteenth of January, 1997.',
      "The syndic. He's been up here the whole time. Two hundred meters from the fort.",
      'Who buries a man in the forest and carves his initials?',
      'Someone who knew exactly who he was.',
    ],
  },
} satisfies Record<string, ScriptNode>;
