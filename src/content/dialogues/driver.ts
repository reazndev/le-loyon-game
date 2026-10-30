import { speakers } from '../speakers';
import type { ScriptNode } from './script';

export const nodes = {
  driver_arrival: {
    speaker: speakers.driver,
    effects: { set: 'arrived' },
    lines: [
      'Leurs. Terminus.',
      'Last bus back is at 18:52. Tomorrow the first is at 6:41.',
      "There's nothing after that. You know that?",
    ],
    choices: [
      { text: 'Yes.', next: 'driver_arrival_end' },
      { text: 'Is it always this foggy?', next: 'driver_fog' },
    ],
  },
  driver_fog: {
    speaker: speakers.driver,
    lines: ["Since the end of October. It'll go when the bise comes. Or in March."],
    next: 'driver_arrival_end',
  },
  driver_arrival_end: {
    speaker: speakers.driver,
    lines: ['Bonne soirée. {{Have a good evening.}}'],
    next: 'driver_arrival_end.2',
  },
  'driver_arrival_end.2': {
    lines: [
      'The doors close. The bus turns around the fountain and is gone. Its engine is audible for a long time.',
      'Then nothing.',
    ],
  },
  driver_departure: {
    speaker: speakers.driver,
    lines: ['In you get. Find what you came for?'],
    choices: [
      { text: 'No.', next: 'driver_departure_end' },
      { text: "I'm not sure.", next: 'driver_departure_end' },
    ],
  },
  driver_departure_end: {
    speaker: speakers.driver,
    lines: ['Nobody does, up here.'],
  },
} satisfies Record<string, ScriptNode>;
