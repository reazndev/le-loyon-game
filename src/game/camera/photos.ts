import { items, miscPhotoCaptions, type Item } from '../../content';
import type { StateView } from '../conditions';

/** A Polaroid the player took: a small JPEG of the frame and the caption on its strip. */
export interface Photo {
  /** Data URL. */
  image: string;
  caption?: string;
  /** `Date.now()` when the shot was taken. The picture develops over the next minute. */
  takenAt: number;
}

export const FILM_COUNT = 'film_shots';
export const TREELINE_PHOTO = 'photo_treeline';
const MISC_PREFIX = 'photo_misc_';
/** Real seconds an instant photo takes to develop, as the script has it. */
export const DEVELOP_SECONDS = 60;

/** Whether an item is a Polaroid from the camera, as opposed to an old photo the player finds. */
export function isCameraPhoto(id: string): boolean {
  if (id.startsWith(MISC_PREFIX)) return true;
  const item = (items as Record<string, Item>)[id];
  return id.startsWith('photo_') && item !== undefined && item.document === undefined;
}

/** The caption the reporter wrote on the strip: the quoted text that ends the item's description. */
export function photoCaption(id: string): string | undefined {
  const item = (items as Record<string, Item>)[id];
  return item?.description.match(/"([^"]+)"\s*$/)?.[1];
}

export interface Shot {
  scene: string;
  /** The `photo` option of the interaction point in the viewfinder, if any. */
  target?: string;
  state: StateView;
  /** Ids of the photos already taken. */
  taken: readonly string[];
}

/**
 * Which photo a shot makes. Any shot in the cemetery on night 1, before the figure at the back wall,
 * is photo 7. A target naming a camera photo gives that photo once. Every other shot is
 * `photo_misc_<n>`, captioned by a `miscPhotoCaptions` key in the target or the default caption.
 */
export function resolveShot({ scene, target, state, taken }: Shot): { item: string; caption?: string } {
  const fresh = (id: string) => !taken.includes(id);
  if (scene === 'cemetery' && state.count('night') === 1 && !state.hasFlag('first_sighting') && fresh(TREELINE_PHOTO)) {
    return { item: TREELINE_PHOTO };
  }
  if (target !== undefined && isCameraPhoto(target) && !target.startsWith(MISC_PREFIX) && fresh(target)) {
    const caption = photoCaption(target);
    return caption === undefined ? { item: target } : { item: target, caption };
  }
  const misc = taken.filter((id) => id.startsWith(MISC_PREFIX)).length + 1;
  const captions: Record<string, string> = miscPhotoCaptions;
  return { item: `${MISC_PREFIX}${misc}`, caption: (target && captions[target]) ?? miscPhotoCaptions.default };
}

/** How far a photo has developed, from 0 to 1. */
export const developed = (photo: Photo, now: number): number =>
  Math.min(1, Math.max(0, (now - photo.takenAt) / (DEVELOP_SECONDS * 1000)));
