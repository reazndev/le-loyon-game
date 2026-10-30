import type { BoxShape } from '../../engine/physics/collision';
import type { LevelKit } from '../../game/kit/levelKit';
import { playSound } from '../../game/scares/sounds';
import type { SceneContext } from '../../game/scene';
import { playNode } from '../forest_path/play';
import { gateLeaf } from './grounds';
import { BACK_GATE, BACK_Z } from './layout';

const OPEN_DEG = 105;

/**
 * The narrow iron gate in the north wall, onto the forest path. Shut on day 1 until the first
 * sighting, when the reporter can open it. It can also be found standing open (cem2_back_gate).
 */
export class BackGate {
  private open = false;
  private readonly leaf;
  private removeCollider: (() => void) | null = null;

  constructor(
    kit: LevelKit,
    ctx: SceneContext,
    startOpen: boolean,
  ) {
    this.leaf = gateLeaf(kit, BACK_GATE.x - BACK_GATE.w / 2, BACK_Z, BACK_GATE.w, 1.2, 1);
    const shape: BoxShape = { kind: 'box', x: BACK_GATE.x, z: BACK_Z, hw: BACK_GATE.w / 2 + 0.1, hd: 0.2, angle: 0 };
    kit.use((k) => {
      this.collide = (on) => {
        if (on && !this.removeCollider) this.removeCollider = k.world.collision.add(shape);
        if (!on && this.removeCollider) {
          this.removeCollider();
          this.removeCollider = null;
        }
      };
    });
    kit
      .hotspot({
        prompt: 'Open the gate',
        enabled: () => !this.open,
        radius: 0.7,
        onInteract: async () => {
          // From day 2 the forest is open whether or not the reporter saw the figure on night 1.
          if (!ctx.state.hasFlag('first_sighting') && ctx.state.count('day') <= 1) return playNode(ctx, 'path_forest_blocked');
          this.set(true);
          playSound(ctx.audio, 'sfx_gate_creak_back', { at: { x: BACK_GATE.x, y: 1, z: BACK_Z } });
        },
      })
      .at(BACK_GATE.x, 0, BACK_Z + 0.4);
    this.set(startOpen);
  }

  private collide: (on: boolean) => void = () => undefined;

  get isOpen(): boolean {
    return this.open;
  }

  /** Opens or shuts it without a sound, as when it is found open. */
  set(open: boolean): void {
    this.open = open;
    this.leaf.object.rotation.y = open ? (OPEN_DEG * Math.PI) / 180 : 0;
    this.collide(!open);
  }
}
