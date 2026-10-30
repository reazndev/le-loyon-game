import type { ItemInfo } from '../game/items';
import type { DocumentId } from './documents';

export interface Item extends ItemInfo {
  /** The document shown when the player reads the item. */
  document?: DocumentId;
  /** How much the item proves in the publish ending. */
  evidence?: 'weak' | 'strong';
}

export const items = {
  notebook: {
    name: 'Notebook',
    description: 'Spiral bound, half full of other stories. The notes for this one start on a clean page.',
  },
  polaroid_camera: {
    name: 'Polaroid camera',
    description: 'An instant camera. The counter on the back shows how many shots are left.',
  },
  pocket_money: {
    name: 'Wallet',
    description: 'Francs for the room and the bread. Not much more.',
  },
  inn_room_key: {
    name: 'Key, room 3',
    description: 'An iron key on a wooden tag with a painted 3. Monique only has the one.',
  },
  flashlight: {
    name: 'Torch',
    description: "A heavy metal torch. It was Monique's husband's. It smells of the drawer it lived in.",
  },
  postcard_calvi: {
    name: 'Postcard from Calvi',
    description: "A faded postcard of a harbor and a citadel, postmarked Calvi, 1979. Marc's handwriting.",
    document: 'doc_postcard_calvi',
  },
  gremaud_diary: {
    name: "Gremaud's diary, 1996",
    description: 'A black pocket diary. Council meetings, and every Tuesday and Friday two letters: BN.',
    document: 'doc_gremaud_diary',
  },
  shovel: {
    name: "Bernard's shovel",
    description: 'A worn ash handle and a blade sharpened with a file.',
  },
  bunker_key: {
    name: 'Key stamped K.P. 3',
    description: 'A heavy steel key with a square-cut bit. The brass tag says K.P. 3 and, scratched with a nail, BOIS-NOIR.',
  },
  gremaud_letter: {
    name: 'Letter in the coffin',
    description: 'A soft white envelope. "À qui ouvrira ce cercueil." To whoever opens this coffin.',
    document: 'doc_gremaud_letter',
  },
  legion_tag: {
    name: 'Identity disc, CHALLAND M.',
    description:
      "An identity disc. 'CHALLAND M., 1958, 172493, LE.' LE: Légion étrangère, the Foreign Legion. Not his name. His name in the Legion.",
    document: 'doc_legion_tag',
  },
  food_parcel: {
    name: 'Bread and cheese',
    description: 'Bread and a piece of Gruyère, wrapped in paper.',
  },
  ring: {
    name: 'Wedding ring',
    description: 'A plain gold band in a throat pastille tin. Engraved inside: J-P - O 1958.',
    document: 'doc_ring',
  },
  photo_boys: {
    name: 'Photo: Marc and Dani, 1972',
    description: 'Two boys on a red moped by the village fountain, grinning. On the back: "Marc et Dani, 1972."',
    document: 'photo_boys',
  },
  photo_grave_chassot: {
    name: 'Photo: Chassot grave',
    description: 'The Chassot stone in the flash, the boot prints two dark hollows. "Chassot. The boot prints."',
    evidence: 'weak',
  },
  photo_lantern: {
    name: 'Photo: the lantern',
    description: 'A red point of light in total black. Nothing else came out. "D.M. Who lights it?"',
  },
  photo_bunker_door: {
    name: 'Photo: hidden door',
    description: 'A gray steel door, the flash bouncing off it. "K.P. 3"',
    evidence: 'weak',
  },
  photo_empty_coffin: {
    name: 'Photo: the empty coffin',
    description: 'Stained gray satin seen from above, earth walls around, the edge of the lid. "Empty. 18.11.95."',
    evidence: 'strong',
  },
  photo_forest_grave: {
    name: 'Photo: the cross',
    description: 'Stones, a cross of branches, larch needles on the moss. Washed out by the fog. "J.-P. G."',
    evidence: 'strong',
  },
  photo_hidden_room: {
    name: "Photo: Marc's room",
    description: 'A camp bed, a candle, the white képi on the wall. "Where he lives."',
    evidence: 'strong',
  },
  photo_marc_masked: {
    name: 'Photo: Le Loyon',
    description: 'A figure in a camouflage cape and a gas mask. The flash turns the eyepieces into white discs. "Le Loyon."',
    evidence: 'strong',
  },
  photo_marc_forced: {
    name: 'Photo: Le Loyon, turning away',
    description: 'A blur of camouflage and an arm thrown up. A corner of the mask. No caption.',
    evidence: 'strong',
  },
  photo_treeline: {
    name: 'Photo 7: the treeline',
    description: 'Mostly black. One gravestone in the flash. Far back between the spruces, a pale oval at head height.',
  },
} satisfies Record<string, Item>;

export type ItemId = keyof typeof items;

export const strongEvidence = (Object.keys(items) as ItemId[]).filter(
  (id) => (items[id] as Item).evidence === 'strong',
);

/** Captions for shots without their own item. The camera names those items `photo_misc_<n>`. */
export const miscPhotoCaptions = {
  default: 'Leurs, November 98',
  chassot_garden: 'A garden nobody owns, kept by nobody.',
};

export const miscPhoto = (caption: string = miscPhotoCaptions.default): Item => ({ name: 'Photo', description: `"${caption}"` });
