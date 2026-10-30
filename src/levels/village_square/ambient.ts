import type { Point3 } from '../../engine/audio/audioManager';
import type { Placed } from '../../game/kit/builders';
import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { animateLight, cat, crows, distantTraffic, fallingLeaves, mothsAround, outdoorWeather, particles, sway } from '../../game/ambient';
import { lampLevel } from './lampLevel';
import { GREMAUD_GATE, INN, LAMP, MEMORIAL, PHONE_BOX } from './layout';
import { LAMP_HEAD, type StreetLamp } from './props';
import { wildlife } from '../../game/ambient/wildlife';

export interface SquareMoving {
  lamp: StreetLamp;
  /** The inn's hanging sign, from its hook. */
  sign: Placed;
}

/**
 * What moves on the square besides people: mist along the cobbles, drizzle from night 2, leaves
 * off the limes by day, the inn sign on its rings, the street lamp failing at night with moths
 * round it, a cat on the inn terrace and crows on the wires and walls by day, the reporter's
 * breath, and a car now and then on the valley road below.
 */
export function squareAmbient(kit: LevelKit, ctx: SceneContext, moving: SquareMoving): void {
  wildlife(kit, ctx, 'village');
  const night = ctx.state.time === 'night';
  const sky = outdoorWeather(kit, ctx, { rain: 0.18, tin: { at: { x: PHONE_BOX.x, y: 2.5, z: PHONE_BOX.z }, volume: 0.3 } });
  sway(kit, moving.sign, { axis: 'x', degrees: 2 + sky.wind * 5, speed: 0.18 });
  // The cantonal road along the valley floor, south of the village and well below it.
  distantTraffic(kit, ctx, [{ x: -150, y: -25, z: 120 }, { x: 150, y: -25, z: 95 }], night ? 300 : 150);
  if (night) failingLamp(kit, moving.lamp);
  else daytimeLife(kit, ctx);
}

/** The bulb and its glow dim with the light; moths keep circling where it hangs. */
function failingLamp(kit: LevelKit, lamp: StreetLamp): void {
  if (!lamp.lit) return;
  const { bulb, glow, light } = lamp.lit;
  const bulbColor = bulb.mesh.material.uniforms.uColor.value.clone();
  const glowColor = glow.mesh.material.uniforms.uColor.value.clone();
  animateLight(kit, light, null, (t) => {
    const k = lampLevel(t);
    bulb.mesh.material.uniforms.uColor.value.copy(bulbColor).multiplyScalar(0.25 + 0.75 * k);
    glow.mesh.material.uniforms.uColor.value.copy(glowColor).multiplyScalar(k);
    return k;
  });
  mothsAround(kit, lampHead());
}

/** Where the lamp head hangs, out along the arm from the post. */
function lampHead(): Point3 {
  const yaw = (LAMP.yaw * Math.PI) / 180;
  return { x: LAMP.x + Math.sin(yaw) * LAMP_HEAD.reach, y: LAMP_HEAD.y - 0.15, z: LAMP.z + Math.cos(yaw) * LAMP_HEAD.reach };
}

function daytimeLife(kit: LevelKit, ctx: SceneContext): void {
  // Leaves come off the two limes and the walnut, a few at a time, each tree its own field.
  [
    { x: -8.6, z: -12.6, box: [7, 9, 7] as [number, number, number] },
    { x: 8.4, z: -13.2, box: [7, 9, 7] as [number, number, number] },
    { x: 5.6, z: -8.6, box: [8, 8, 8] as [number, number, number] },
  ].forEach(({ x, z, box }, i) =>
    particles(kit, fallingLeaves({ follow: false, box, count: 16, seed: `square-leaves-${i}` })).at(x, box[1] / 2 + 0.05, z),
  );
  // On the nearer stack of terrace chairs, watching the square.
  cat(kit, ctx, { x: INN.x - INN.d / 2 - 2.5, y: 0.9, z: 1.4, yaw: 90 });
  crows(kit, ctx, [
    { x: -29.3, z: 12.4, y: 7, yaw: 180 },
    { x: -28.8, z: 12.4, y: 7, yaw: 160 },
    { x: MEMORIAL.x, z: MEMORIAL.z - 0.1, y: 1.8, yaw: 20 },
    { x: GREMAUD_GATE.x, z: GREMAUD_GATE.z + 4, y: 0.55, yaw: 100 },
  ], 40);
}
