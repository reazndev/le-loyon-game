/** Lines per page in the document view. */
export const PAGE_LINES = 10;
/** Characters per line at the 16 px UI font in the 640x480 frame, with margins. */
export const PAGE_WIDTH = 64;

/** Breaks a line longer than `width` at spaces, keeping its indent on every piece. */
export function wrap(line: string, width = PAGE_WIDTH): string[] {
  const indent = line.match(/^ */)![0];
  const words = line.trim().split(/ +/);
  return words.reduce<string[]>((out, word) => {
    const last = out.at(-1);
    if (last !== undefined && `${last} ${word}`.length <= width) return [...out.slice(0, -1), `${last} ${word}`];
    return [...out, `${indent}${word}`];
  }, []);
}

/**
 * Splits text into pages of at most `PAGE_LINES` wrapped lines. Each section starts a new page.
 * Pages break between paragraphs (blank-line separated) where they can.
 */
export function paginate(sections: string | string[]): string[] {
  const paragraphs = (section: string) =>
    section
      .replace(/^(\s*\n)+/, '')
      .trimEnd()
      .split(/\n\s*\n/)
      .map((p) => p.split('\n').flatMap((line) => (line.trim() === '' ? [] : wrap(line.trimEnd()))));
  const pagesOf = (section: string) =>
    paragraphs(section).reduce<string[][]>((pages, paragraph) => {
      const page = pages.at(-1);
      if (page && page.length + 1 + paragraph.length <= PAGE_LINES) {
        return [...pages.slice(0, -1), [...page, '', ...paragraph]];
      }
      const chunks = Array.from({ length: Math.ceil(paragraph.length / PAGE_LINES) }, (_, i) =>
        paragraph.slice(i * PAGE_LINES, (i + 1) * PAGE_LINES),
      );
      return [...pages, ...chunks];
    }, []);
  return (typeof sections === 'string' ? [sections] : sections).flatMap(pagesOf).map((page) => page.join('\n'));
}
