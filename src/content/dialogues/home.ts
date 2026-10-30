import type { ScriptNode } from './script';

export const nodes = {
  home_window: {
    lines: ['Rain. The street lamp below has been flickering since September.'],
  },
  home_bag: {
    if: { notFlag: 'pro_knows_village' },
    lines: ["Half packed. I don't know yet where I'm going."],
  },
  home_bag_ready: {
    if: { flag: 'pro_knows_village' },
    lines: ['Three days of clothes. The camera. The notebook. Ready.'],
  },
  home_coat: {
    lines: ['Still damp from this afternoon.'],
  },
  home_spam: {
    lines: ['Delete.'],
  },
  home_ready: {
    if: { flag: 'pro_knows_village' },
    lines: [
      'Leurs. A bus line, an inn, a man in a mask, and three days.',
      "If there's nothing, I'll write the fog.",
    ],
  },
} satisfies Record<string, ScriptNode>;
