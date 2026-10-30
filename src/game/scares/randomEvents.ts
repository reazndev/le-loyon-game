/** The random sound events between fixed beats, from the table in docs/script/07-scares.md. */
export type RandomEventId = 'step' | 'branch' | 'silence' | 'breath';

export interface PoolEntry {
  id: RandomEventId;
  weight: number;
  /** Most times it can happen while the scene is loaded. */
  limit?: number;
}

export const defaultPool: PoolEntry[] = [
  { id: 'step', weight: 0.4 },
  { id: 'branch', weight: 0.35 },
  { id: 'silence', weight: 0.2 },
  { id: 'breath', weight: 0.05, limit: 1 },
];

export interface RandomEventOptions {
  /** Least seconds between two events. Default 75. */
  gap?: number;
  /** Chance of an event in each eligible window. Default 0.06. */
  chance?: number;
  /** Window length in seconds. Default 10. */
  window?: number;
  pool?: PoolEntry[];
}

/** Rolls for random events in fixed windows. Pure apart from the injected random source. */
export class RandomEvents {
  private readonly gap: number;
  private readonly chance: number;
  private readonly window: number;
  private readonly pool: PoolEntry[];
  private readonly counts = new Map<RandomEventId, number>();
  /** Starts at 0, so the first event can't come right after the scene loads. */
  private sinceLast = 0;
  private windowTime = 0;
  private blockedFor = 0;
  private last: RandomEventId | null = null;
  private repeats = 0;

  constructor(
    options: RandomEventOptions = {},
    private readonly random: () => number = Math.random,
  ) {
    this.gap = options.gap ?? 75;
    this.chance = options.chance ?? 0.06;
    this.window = options.window ?? 10;
    this.pool = options.pool ?? defaultPool;
  }

  /** Holds events back for at least `seconds`, such as after a fixed beat. */
  block(seconds: number): void {
    this.blockedFor = Math.max(this.blockedFor, seconds);
  }

  /** Advances time. `blocked` holds events back this frame. Returns the event to play, if any. */
  update(dt: number, blocked = false): RandomEventId | null {
    this.sinceLast += dt;
    this.blockedFor = Math.max(0, this.blockedFor - dt);
    if (blocked || this.blockedFor > 0 || this.sinceLast < this.gap) {
      this.windowTime = 0;
      return null;
    }
    this.windowTime += dt;
    if (this.windowTime < this.window) return null;
    this.windowTime = 0;
    if (this.random() >= this.chance) return null;
    const id = this.pick();
    if (!id) return null;
    this.sinceLast = 0;
    this.counts.set(id, (this.counts.get(id) ?? 0) + 1);
    this.repeats = id === this.last ? this.repeats + 1 : 1;
    this.last = id;
    return id;
  }

  private pick(): RandomEventId | null {
    // Never the same event three times in a row, and never past an entry's limit.
    const open = this.pool.filter(
      (entry) => (entry.limit === undefined || (this.counts.get(entry.id) ?? 0) < entry.limit) && !(entry.id === this.last && this.repeats >= 2),
    );
    const total = open.reduce((sum, entry) => sum + entry.weight, 0);
    let roll = this.random() * total;
    return open.find((entry) => (roll -= entry.weight) < 0)?.id ?? null;
  }
}
