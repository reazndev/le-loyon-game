/** Lines per page in the document view. */
export const PAGE_LINES = 10;
/** Characters per line at the 16 px UI font in the 640x480 frame, with margins. */
export const PAGE_WIDTH = 64;

/**
 * Breaks a line longer than `width` at spaces, keeping its indent on every piece. Spacing inside
 * the line is kept as written, so columns such as the dates in Gremaud's diary stay aligned.
 */
export function wrap(line: string, width = PAGE_WIDTH): string[] {
  if (line.length <= width) return [line];
  const indent = line.match(/^ */)![0];
  const lastSpace = line.lastIndexOf(' ', width);
  // A word longer than the line stays whole, as a page can't break it either.
  const cut = lastSpace > indent.length ? lastSpace : line.indexOf(' ', width);
  if (cut < 0) return [line];
  const rest = line.slice(cut).trimStart();
  return [line.slice(0, cut).trimEnd(), ...(rest ? wrap(indent + rest, width) : [])];
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
