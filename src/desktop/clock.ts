/** The taskbar clock. It starts at a set time and runs at real speed, one minute per minute. */
export class Clock {
  private seconds: number;

  constructor(start: string) {
    this.seconds = parseTime(start) * 60;
  }

  advance(dt: number): void {
    this.seconds += dt;
  }

  /** Minutes since midnight, wrapping at 24:00. */
  get minutes(): number {
    return Math.floor(this.seconds / 60) % (24 * 60);
  }

  get text(): string {
    return formatTime(this.minutes);
  }
}

/** "23:10" to minutes since midnight. */
export function parseTime(text: string): number {
  const [hours, minutes] = text.split(':').map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

export function formatTime(minutes: number): string {
  const wrapped = ((minutes % 1440) + 1440) % 1440;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(Math.floor(wrapped / 60))}:${pad(wrapped % 60)}`;
}
