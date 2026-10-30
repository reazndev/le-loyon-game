import type { ScriptNode } from './script';

// The script gives these as a "narration on look" column in the cemetery's table of other graves,
// not as nodes. Each id is the grave's document id plus `_look`.
export const nodes = {
  grave_yerly_ml_look: { lines: ["Fresh flowers. Bernard's wife, I suppose."] },
  grave_kolly_ernest_look: { lines: ['86 years in one village.'] },
  grave_bapst_lea_look: { lines: ['Three days. A plastic windmill in the gravel, turning.'] },
  grave_python_joseph_look: { lines: ['A photo of a man with an enormous mustache and a cow.'] },
  grave_clement_look: { lines: ["Daniel's mother, maybe."] },
  grave_overney_marie_look: { lines: ["The abbé's mother. He'd have buried her himself."] },
  grave_rossier_andre_look: { lines: ["Monique's husband. Someone keeps it very neat."] },
} satisfies Record<string, ScriptNode>;
