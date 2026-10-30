import type { HumanLook } from '../../engine/characters/human';

/**
 * Villagers who are not in the script: people seen in passing on the street, never spoken to.
 * They wear what the cast wears, but none of them can be mistaken for a cast member up close.
 */
export const folk = {
  /** An old woman back from the laiterie, in a brown coat and a headscarf. */
  shopper: {
    face: 'face_old_woman',
    height: 1.56,
    build: 1.05,
    stoop: 0.2,
    hair: 0xb0aca4,
    hat: { kind: 'headscarf', color: 0x4a3a30 },
    top: 0x3a3430,
    legs: 0x2e2a28,
    shoes: 0x1a1816,
    coat: { color: 0x54443a, length: 0.6 },
  },
  /** A farmer in work blues and a cap, with a barrow or a cow. */
  farmer: {
    face: 'face_farmer',
    faceTint: 0xc8c0b8,
    height: 1.72,
    build: 1.1,
    stoop: 0.08,
    hair: 0x6a6460,
    hat: { kind: 'flat_cap', color: 0x3e3c38 },
    top: 0x5a5448,
    legs: 0x34465e,
    shoes: 0x22261e,
    overalls: 0x34465e,
  },
  /** A man in a grey anorak who smokes in the inn's doorway. */
  smoker: {
    face: 'face_driver',
    faceTint: 0xb8b2aa,
    height: 1.8,
    build: 1.05,
    hair: 0x3a3028,
    top: 0x5c5e5a,
    legs: 0x2e2c2a,
    shoes: 0x1a1a18,
    coat: { color: 0x585a56, length: 0.3 },
  },
  /** A woman in an apron and cardigan who sweeps her step. */
  sweeper: {
    face: 'face_young_woman',
    faceTint: 0xb4aca4,
    height: 1.63,
    hair: 0x4a3a2c,
    hairStyle: 'bob',
    top: 0x6a5a4a,
    legs: 0x3a3634,
    shoes: 0x2a2420,
    skirt: { color: 0x4a4440, length: 0.48 },
    apron: 0x8a8678,
  },
  /** An older man on a black roadster bicycle. */
  cyclist: {
    face: 'face_mechanic',
    faceTint: 0xb0aaa2,
    height: 1.74,
    build: 0.95,
    hair: 0x8a8580,
    hat: { kind: 'flat_cap', color: 0x2e2c2a },
    top: 0x3a3c36,
    legs: 0x2a2a28,
    shoes: 0x161616,
    coat: { color: 0x3e4036, length: 0.4 },
  },
  /** A neighbour who talks with the smoker at the inn door. */
  neighbour: {
    face: 'face_young_man',
    faceTint: 0xa8a29a,
    height: 1.7,
    build: 1.1,
    hair: 0x5a4a3a,
    hat: { kind: 'flat_cap', color: 0x4a4038 },
    top: 0x4a3e34,
    legs: 0x3a3a3e,
    shoes: 0x1e1c1a,
  },
  /** Two children in anoraks with their hoods up, running home from school. */
  childA: {
    face: 'face_young_man',
    faceTint: 0x9a9690,
    height: 1.28,
    build: 0.8,
    hair: 0x4a3a2a,
    hat: { kind: 'hood', color: 0x6a2e2a },
    top: 0x6a2e2a,
    legs: 0x2e3a52,
    shoes: 0x3a3a3a,
  },
  childB: {
    face: 'face_young_woman',
    faceTint: 0x9a9690,
    height: 1.2,
    build: 0.78,
    hair: 0x6a5a40,
    hat: { kind: 'hood', color: 0x3a5a6a },
    top: 0x3a5a6a,
    legs: 0x3a3634,
    shoes: 0x4a3a30,
  },
  /** Someone walking home late, in a dark coat with the collar up. */
  late: {
    face: 'face_widow',
    faceTint: 0x7a7672,
    height: 1.76,
    build: 1,
    stoop: 0.06,
    hair: 0x2a2624,
    hat: { kind: 'flat_cap', color: 0x1a1a1a },
    top: 0x1c1c1e,
    legs: 0x1a1a1c,
    shoes: 0x101010,
    coat: { color: 0x1e1e20, length: 0.7 },
  },
} satisfies Record<string, HumanLook>;

export type FolkId = keyof typeof folk;
