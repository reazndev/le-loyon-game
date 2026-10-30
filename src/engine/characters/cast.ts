import type { TextureLibrary } from '../render/textures';
import { buildCow, buildDog } from './animals';
import type { TurnStyle } from './character';
import { buildHuman, type HumanLook } from './human';
import { buildLoyon } from './loyon';
import type { CharacterModel } from './model';

/**
 * The looks of the cast in docs/script/00-overview.md. Clothes are what a Fribourg village
 * wore in November 1998: work blues, loden, cardigans, dark Sunday coats.
 */
export const humanLooks = {
  overney: {
    face: 'face_priest',
    height: 1.7,
    build: 0.95,
    stoop: 0.12,
    skin: 0xb59a88,
    hair: 0xb8b4ac,
    hairStyle: 'bald',
    top: 0x1b1b1d,
    legs: 0x1b1b1d,
    shoes: 0x121212,
    coat: { color: 0x1d1d20, length: 0.78 },
    collar: 0xd8d6cc,
  },
  monique: {
    face: 'face_innkeeper',
    height: 1.64,
    build: 1.1,
    skin: 0xb89a84,
    hair: 0x4a3426,
    top: 0x5a2e30,
    legs: 0x4c4440,
    shoes: 0x2a2420,
    skirt: { color: 0x3c3a3c, length: 0.5 },
    apron: 0xbcb7a6,
  },
  yannick: {
    face: 'face_young_man',
    faceTint: 0x9a9690,
    height: 1.75,
    build: 0.88,
    skin: 0xb09682,
    hair: 0x2c241c,
    hat: { kind: 'hood', color: 0x2a3140 },
    top: 0x2a3140,
    legs: 0x39435a,
    shoes: 0x8c8a82,
  },
  bernard: {
    face: 'face_farmer',
    height: 1.76,
    build: 1.15,
    skin: 0xae8670,
    hair: 0x8a8580,
    hat: { kind: 'flat_cap', color: 0x5a5852 },
    top: 0x6a3e2e,
    legs: 0x2e4a6e,
    shoes: 0x283024,
    overalls: 0x2e4a6e,
  },
  gilles: {
    face: 'face_mechanic',
    height: 1.78,
    skin: 0xae8c76,
    hair: 0x2a2018,
    top: 0x3e4c5c,
    legs: 0x3e4c5c,
    shoes: 0x1e1c1a,
    overalls: 0x36424e,
  },
  christine: {
    face: 'face_shopkeeper',
    height: 1.66,
    skin: 0xb89c88,
    hair: 0x5a4632,
    hairStyle: 'long',
    top: 0x6a7280,
    legs: 0x3a3a40,
    shoes: 0x2a2826,
    coat: { color: 0xb4b2a8, length: 0.45 },
  },
  odile: {
    face: 'face_widow',
    height: 1.6,
    build: 0.95,
    stoop: 0.18,
    skin: 0xb49c8c,
    hair: 0x8c8a86,
    hat: { kind: 'headscarf', color: 0x161616 },
    top: 0x1e1e20,
    legs: 0x2a2826,
    shoes: 0x141414,
    coat: { color: 0x202022, length: 0.62 },
  },
  raymond: {
    face: 'face_watchman',
    height: 1.74,
    build: 1.15,
    stoop: 0.06,
    skin: 0xa88672,
    hair: 0x9a958c,
    hat: { kind: 'peaked_cap', color: 0x3a3e32 },
    top: 0x3e4a32,
    legs: 0x3a3228,
    shoes: 0x1e1c18,
    coat: { color: 0x3c4830, length: 0.55 },
  },
  // The two old women who are the last out of morning mass on day 2. Black and brown Sunday coats.
  parishioner_1: {
    face: 'face_widow',
    faceTint: 0xa8a29a,
    height: 1.55,
    build: 1.05,
    stoop: 0.24,
    skin: 0xb49a8a,
    hair: 0xa8a6a0,
    hat: { kind: 'headscarf', color: 0x3a2e26 },
    top: 0x2a2624,
    legs: 0x2e2a28,
    shoes: 0x161412,
    coat: { color: 0x3c3028, length: 0.66 },
  },
  parishioner_2: {
    face: 'face_widow',
    height: 1.59,
    build: 0.9,
    stoop: 0.16,
    skin: 0xb8a090,
    hair: 0xc4c2bc,
    hat: { kind: 'headscarf', color: 0x262a34 },
    top: 0x1c1c20,
    legs: 0x24242a,
    shoes: 0x121212,
    coat: { color: 0x22232a, length: 0.64 },
  },
  driver: {
    face: 'face_driver',
    height: 1.77,
    build: 1.05,
    skin: 0xae8c76,
    hair: 0x2a2018,
    hat: { kind: 'bus_cap', color: 0x3a4450, band: 0xb08a1a },
    top: 0x46505c,
    legs: 0x2e343c,
    shoes: 0x161616,
  },
} satisfies Record<string, HumanLook>;

export type HumanId = keyof typeof humanLooks;
/** Every character a level can place: the villagers, Le Loyon (`marc`), and the two animals. */
export type CharacterId = HumanId | 'marc' | 'bari' | 'marquise';

export const characterIds = [...(Object.keys(humanLooks) as HumanId[]), 'marc', 'bari', 'marquise'] as const satisfies readonly CharacterId[];

/** Builds the model for a cast member, with the way that character turns. */
export function castModel(id: CharacterId, textures: TextureLibrary): { model: CharacterModel; turn: TurnStyle } {
  switch (id) {
    case 'marc':
      return { model: buildLoyon(textures), turn: 'stiff' };
    case 'bari':
      return { model: buildDog(), turn: 'smooth' };
    case 'marquise':
      return { model: buildCow(), turn: 'smooth' };
    default:
      return { model: buildHuman(humanLooks[id], textures), turn: 'smooth' };
  }
}
