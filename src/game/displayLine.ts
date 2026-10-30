import { splitTranslation } from '../content/translation';
import type { DialogueLine } from '../engine/ui/dialogueBox';

/**
 * Turns a script line into what the dialogue box shows. A line with no speaker is narration, as
 * the script convention has it, and a `{{translation}}` moves to its own subtitle line.
 */
export function displayLine(speaker: string | undefined, line: string): DialogueLine {
  const { text, translation } = splitTranslation(line);
  return {
    text,
    narration: speaker === undefined,
    ...(speaker === undefined ? {} : { speaker }),
    ...(translation === undefined ? {} : { translation }),
  };
}

/** Choices show the French only; the subtitle line belongs to the spoken text. */
export const choiceText = (choice: string): string => splitTranslation(choice).text;
