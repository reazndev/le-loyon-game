import { fogPaneTexture } from './fogPane';
import type { LevelKit } from './levelKit';

export interface WindowSpec {
  /** The middle of the opening, on the wall's centerline. */
  x: number;
  z: number;
  /** The way the room side faces, in degrees: 0 faces -Z, 90 faces -X. */
  facing: number;
  w: number;
  h: number;
  /** Sill height above the floor. */
  y: number;
  night: boolean;
  /** Floor height. Default 0. */
  base?: number;
  /** A street lamp somewhere out in the fog, as an orange smear on the glass at night. */
  lamp?: boolean;
}

/**
 * A window with fog pressed against it by day and black glass at night, a roof and a few trees
 * just showing through. It lets cold light into the room by day. Cut the opening in the wall
 * with a `Gap` of the same size first.
 */
export function fogWindow(kit: LevelKit, spec: WindowSpec): void {
  const { w, h, y, night } = spec;
  kit
    .group((g) => {
      // Unlit so it reads as light coming in; the painted pane keeps it below the fog outside.
      g.box({ w, h, d: 0.02 }).map(fogPaneTexture(spec), { tile: [w, h] }).unlit().at(0, y, 0.03);
      const frame = (fw: number, fh: number, fx: number, fy: number) => g.box({ w: fw, h: fh, d: 0.07 }).texture('wood_planks', { tile: 0.6 }).color(0xb4ad9c).at(fx, fy, -0.02);
      frame(w + 0.08, 0.06, 0, y - 0.04);
      frame(w + 0.08, 0.06, 0, y + h - 0.02);
      frame(0.06, h, -w / 2, y);
      frame(0.06, h, w / 2, y);
      frame(0.04, h, 0, y);
      frame(w, 0.035, 0, y + h * 0.62);
      g.box({ w: w + 0.2, h: 0.04, d: 0.2 }).texture('wood_planks', { tile: 0.6 }).color(0x9a9282).at(0, y - 0.05, -0.1);
      if (night && spec.lamp) g.glow(0.6, 0x6a4420).at(-w * 0.19, y + h * 0.7, 0.01);
    })
    .at(spec.x, spec.base ?? 0, spec.z)
    .rotY(spec.facing);
  if (night && !spec.lamp) return;
  const rad = (spec.facing * Math.PI) / 180;
  const inward = { x: -Math.sin(rad), z: -Math.cos(rad) };
  // By day the fog's cold light; at night the street lamp's orange, faint.
  kit
    .light(night ? { color: 0x8a5a30, intensity: 0.8, range: 4.5 } : { color: 0x8a949c, intensity: 1.2, range: 5.5 })
    .at(spec.x + inward.x * 1.2, (spec.base ?? 0) + y + h * 0.5, spec.z + inward.z * 1.2);
}
