/** A wall calendar page: where each day of a month falls in a grid of weeks starting on Monday. */

export interface CalendarCell {
  day: number;
  /** 0 is Monday, 6 is Sunday. */
  column: number;
  /** Week of the month, from 0. */
  row: number;
}

export function monthCells(year: number, month: number): CalendarCell[] {
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const offset = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
  return Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    column: (offset + i) % 7,
    row: Math.floor((offset + i) / 7),
  }));
}
