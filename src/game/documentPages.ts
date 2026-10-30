import type { DocumentPage, DocumentLook } from '../engine/ui/documentView';

export interface ReadableDocument {
  title: string;
  pages: string[];
  translation?: string[];
}

/**
 * Pairs the pages of a document with the pages of its translation. The two can paginate to
 * different lengths, so the view has as many steps as the longer one and spreads the shorter
 * one across them; every page of both shows at least once, in order.
 */
export function documentPages(document: ReadableDocument, look: DocumentLook): DocumentPage[] {
  const original = document.pages;
  const english = document.translation ?? [];
  const steps = Math.max(original.length, english.length, 1);
  const at = (pages: string[], step: number) => pages[Math.floor((step * pages.length) / steps)];
  return Array.from({ length: steps }, (_, step) => {
    const translation = at(english, step);
    return {
      title: document.title,
      text: at(original, step) ?? '',
      page: step,
      pages: steps,
      look,
      ...(translation === undefined ? {} : { translation }),
    };
  });
}

/** Inscriptions are carved; everything else in the content is on paper. */
export function documentLook(id: string): DocumentLook {
  return /^(grave_|oldstone_)|^doc_forest_cross$/.test(id) ? 'stone' : 'paper';
}
