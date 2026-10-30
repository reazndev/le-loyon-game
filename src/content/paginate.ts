/** Lines per page in the document view. */
export const PAGE_LINES = 10;
/** Characters per line at the 16 px UI font in the 640x480 frame, with margins. */
export const PAGE_WIDTH = 64;

/** Lines and characters on a page of the reporter's notebook, a narrow book page. */
export const BOOK_PAGE = { lines: 13, width: 30 };

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
export function paginate(sections: string | string[], { lines = PAGE_LINES, width = PAGE_WIDTH } = {}): string[] {
  const paragraphs = (section: string) =>
    section
      .replace(/^(\s*\n)+/, '')
      .trimEnd()
      .split(/\n\s*\n/)
      .map((p) => p.split('\n').flatMap((line) => (line.trim() === '' ? [] : wrap(line.trimEnd(), width))));
  const pagesOf = (section: string) =>
    paragraphs(section).reduce<string[][]>((pages, paragraph) => {
      const page = pages.at(-1);
      if (page && page.length + 1 + paragraph.length <= lines) {
        return [...pages.slice(0, -1), [...page, '', ...paragraph]];
      }
      const chunks = Array.from({ length: Math.ceil(paragraph.length / lines) }, (_, i) =>
        paragraph.slice(i * lines, (i + 1) * lines),
      );
      return [...pages, ...chunks];
    }, []);
  return (typeof sections === 'string' ? [sections] : sections).flatMap(pagesOf).map((page) => page.join('\n'));
}
