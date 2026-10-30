import { Vector3 } from 'three';
import type { NotebookGoal } from '../content';
import type { World } from './world';

/** Which scenes open onto which. The compass walks this to find the next door toward a goal. */
const links: Record<string, string[]> = {
  village_square: ['inn', 'church', 'laiterie', 'garage_dousse', 'chassot_farm', 'yerly_farm', 'cemetery_path', 'house_gremaud'],
  inn: ['village_square'],
  laiterie: ['village_square'],
  garage_dousse: ['village_square'],
  chassot_farm: ['village_square'],
  church: ['village_square', 'cemetery_path'],
  cemetery_path: ['village_square', 'church', 'cemetery'],
  cemetery: ['cemetery_path', 'forest_path'],
  forest_path: ['cemetery', 'bunker_exterior', 'yerly_farm'],
  yerly_farm: ['village_square', 'forest_path'],
  house_gremaud: ['village_square', 'house_gremaud_kitchen'],
  house_gremaud_kitchen: ['house_gremaud'],
  bunker_exterior: ['forest_path', 'bunker_interior', 'forest_deep'],
  bunker_interior: ['bunker_exterior', 'bunker_hidden'],
  bunker_hidden: ['bunker_interior', 'bunker_exterior'],
  forest_deep: ['bunker_exterior'],
};

/** The first scene on the shortest way from `from` to `to`, or null when there is none. */
export function nextScene(from: string, to: string): string | null {
  const firstHop = new Map<string, string>((links[from] ?? []).map((scene) => [scene, scene]));
  const queue = [...firstHop.keys()];
  for (let scene = queue.shift(); scene !== undefined; scene = queue.shift()) {
    if (scene === to) return firstHop.get(scene)!;
    (links[scene] ?? []).filter((next) => next !== from && !firstHop.has(next)).forEach((next) => {
      firstHop.set(next, firstHop.get(scene)!);
      queue.push(next);
    });
  }
  return null;
}

/**
 * Where the compass points for a step: the person in the scene where the step happens, or the
 * nearest way out toward that scene. Null when there is nothing to point at.
 */
export function compassTarget(world: World, scene: string, step: NotebookGoal | undefined, from: Vector3): Vector3 | null {
  if (!step?.to) return null;
  if (step.to === scene) {
    const person = step.who ? world.scene.getObjectByName(step.who) : undefined;
    return person?.visible ? person.getWorldPosition(new Vector3()) : null;
  }
  const hop = nextScene(scene, step.to);
  const nearest = world.exits
    .filter((exit) => exit.to === hop)
    .map((exit) => exit.object.getWorldPosition(new Vector3()))
    .sort((a, b) => a.distanceToSquared(from) - b.distanceToSquared(from))[0];
  return nearest ?? null;
}

/** Degrees to turn from facing `forward` to face `target`; positive is to the right. */
export function bearing(from: Vector3, forward: Vector3, target: Vector3): number {
  const dx = target.x - from.x;
  const dz = target.z - from.z;
  const right = dx * -forward.z + dz * forward.x;
  const ahead = dx * forward.x + dz * forward.z;
  return (Math.atan2(right, ahead) * 180) / Math.PI;
}
