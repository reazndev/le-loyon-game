import { Vector3 } from 'three';
import { ps1Uniforms } from '../../engine/render/ps1Uniforms';
import type { LevelKit } from '../../game/kit/levelKit';
import { viewAngle, type FigureSpec } from '../../game/scares/beats';
import { Figure } from '../../game/scares/figure';

export interface Fog {
  near: number;
  far: number;
  density: number;
  wisps: number;
}

/** How much fog hides at this distance before it counts as gone. */
const HIDDEN = 0.95;

/**
 * Meters past which the fog hides a figure completely, by the same ramp and falloff as the PS1
 * material. Wisps thin the fog in patches, so the distance is pushed out a little for them.
 */
export function fogSight(fog: Fog): number {
  const ramp = fog.near + HIDDEN * (fog.far - fog.near);
  const falloff = fog.density > 0 ? fog.near + Math.sqrt(-Math.log(1 - HIDDEN)) / fog.density : Infinity;
  return Math.min(ramp, falloff) / (1 - fog.wisps / 4);
}

const liveFog = (): Fog => ({
  near: ps1Uniforms.uFogNear.value,
  far: ps1Uniforms.uFogFar.value,
  density: ps1Uniforms.uFogDensity.value,
  wisps: ps1Uniforms.uFogWisps.value,
});

/**
 * Le Loyon on the open path ahead. The director's figures wait until their spot is out of view,
 * which never happens when the player walks straight at it. Here a spot past the edge of the fog
 * counts as out of view too, so the figure is there already and comes out of the fog as the
 * player walks on. Returns the function that starts it, for a beat's `run`.
 */
export function fogFigure(kit: LevelKit, spec: FigureSpec): () => void {
  const npc = kit.npc(spec.who ?? 'marc').at(spec.at.x, 0, spec.at.z);
  npc.object.visible = false;
  let figure: Figure | null = null;
  const view = new Vector3();
  kit.use((ctx) =>
    ctx.later('register', () => {
      // Characters follow the ground from where their feet are, so start them on the slope.
      npc.character.position.y = ctx.world.ground.sample(spec.at.x, spec.at.z).height;
      ctx.world.updates.add((dt) => {
        if (!figure || figure.done || ctx.scene.paused) return;
        const camera = ctx.scene.player.camera;
        const eye = camera.position;
        camera.getWorldDirection(view);
        const sight = fogSight(liveFog());
        figure.update(dt, { eye, sight, angleTo: (point) => (eye.distanceTo(point) > sight ? 180 : viewAngle({ eye, view }, point)) });
      });
    }),
  );
  return () => {
    figure ??= new Figure(npc.character, spec);
  };
}
