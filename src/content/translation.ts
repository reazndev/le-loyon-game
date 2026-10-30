/**
 * Splits a dialogue line into the spoken text and its `{{subtitle}}`, which the script shows on its own
 * smaller line under the box: `Bonsoir. {{Good evening.}} Come in.` gives
 * `{ text: 'Bonsoir. Come in.', translation: 'Good evening.' }`.
 */
export function splitTranslation(line: string): { text: string; translation?: string } {
  const translations = [...line.matchAll(/\{\{(.*?)\}\}/g)].map((m) => m[1]!.trim());
  const text = line.replace(/\s*\{\{.*?\}\}/g, '').trim();
  return translations.length === 0 ? { text } : { text, translation: translations.join(' ') };
}
