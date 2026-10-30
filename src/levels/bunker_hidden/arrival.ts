/**
 * How the player comes into Marc's room, decided at the K.P. 3 door in the outer rooms:
 * - `empty`: unlocked without knocking. Marc is out; he comes back to the doorway (jumpscare 3).
 * - `dark`: knocked the wrong way. The candle went out and Marc stands in the far corner.
 * - `after`: knocked right. The monologue played through the door; he sits on the bed.
 * Not saved: once Marc has been met, the room always opens as `after`.
 */
export type Arrival = 'empty' | 'dark' | 'after';

let next: Arrival = 'empty';

export function arriveAs(arrival: Arrival): void {
  next = arrival;
}

export function takeArrival(metMarc: boolean): Arrival {
  const arrival = metMarc ? 'after' : next;
  next = 'empty';
  return arrival;
}
