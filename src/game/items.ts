export interface ItemInfo {
  name: string;
  description: string;
}

const registry = new Map<string, ItemInfo>();

/** Adds item names and descriptions. Content modules call this once at startup. */
export function registerItems(items: Record<string, ItemInfo>): void {
  Object.entries(items).forEach(([id, info]) => registry.set(id, info));
}

export function itemInfo(id: string): ItemInfo {
  return registry.get(id) ?? { name: id, description: '' };
}
