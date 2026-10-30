import { items, miscPhoto, type DocumentId, type Item } from '../content';
import type { MenuEntry } from '../engine/ui/menuScreen';
import { FILM_COUNT } from './camera/photos';
import { itemInfo } from './items';
import type { GameState } from './state';

/** What confirming an item in the inventory does. */
export type ItemUse =
  | { kind: 'read'; document: DocumentId }
  | { kind: 'notebook' }
  | { kind: 'photo'; item: string }
  | { kind: 'camera' };

const useLabels: Record<ItemUse['kind'], string> = { read: 'Read', notebook: 'Read', photo: 'Look', camera: 'Raise the camera' };

export function itemUse(id: string, state: GameState): ItemUse | null {
  if (id === 'notebook') return { kind: 'notebook' };
  if (id === 'polaroid_camera') return { kind: 'camera' };
  if (state.photo(id)) return { kind: 'photo', item: id };
  const document = (items as Record<string, Item>)[id]?.document;
  return document ? { kind: 'read', document } : null;
}

/** An inventory line. Misc photos have no registered item, so their caption describes them. */
export function inventoryEntry(id: string, state: GameState): MenuEntry {
  const photo = state.photo(id);
  const info = id.startsWith('photo_misc_') && photo ? miscPhoto(photo.caption) : itemInfo(id);
  const use = itemUse(id, state);
  const film = id === 'polaroid_camera' ? ` Shots left: ${state.count(FILM_COUNT)}.` : '';
  return { label: info.name, detail: `${info.description}${film}`, ...(use ? { action: useLabels[use.kind] } : {}) };
}
