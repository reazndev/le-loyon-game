import { CircleGeometry, CylinderGeometry, SphereGeometry } from 'three';
import type { DripSpot } from '../../game/ambient';
import type { LevelKit } from '../../game/kit/levelKit';
import { handText, scrawl } from '../forest_path/scrawl';
import { graffiti, stubs } from './props';

/**
 * What the army left behind and what the teenagers added: rotten mattresses on a few bunks,
 * rusted lockers along the dormitory's west wall, one hanging open, ammunition crates and a
 * cable drum in the guard room, helmets, ration tins, two peeling posters, names and years on
 * the walls, and puddles under the leaks. All still, in one batch, and off every route: the
 * dormitory aisle, the cupboard and K.P. 3, and the doorways stay clear.
 */

/** Where water comes through the ceiling: a pipe in the corridor, the dormitory, the machine room, the latrines. */
export const LEAKS: DripSpot[] = [
  { x: 0.39, z: -21.2, top: 1.95, bottom: 0.01 },
  { x: 7.5, z: -31.3, top: 2.4, bottom: 0.01 },
  { x: 9.7, z: -18.4, top: 2.6, bottom: 0.01 },
  { x: -9.7, z: -15.6, top: 2.3, bottom: 0.01 },
];

const OLIVE = 0x5c6244;
const RUST = 0x4a3628;
const TICKING = 0x625a46;
const PAPER = '#8a7e5c';

export function fortClutter(kit: LevelKit): void {
  kit.batch((still) => {
    mattresses(still);
    lockers(still);
    guardRoomStores(still);
    dormitoryTable(still);
    LEAKS.forEach((leak, i) => puddle(still, leak.x, leak.z, 0.35 + (i % 2) * 0.15));
    walls(still);
  });
}

/** Striped army mattresses gone brown, on a few of the bunks, and one dragged off against the wall. */
function mattresses(kit: LevelKit): void {
  [
    [3, -33, 0.3],
    [4.8, -29, 1.0],
    [6.6, -33, 0.3],
    [6.6, -29, 1.7],
    [8.4, -33, 1.0],
  ].forEach(([x, z, y], i) => {
    kit.box({ w: 0.7, h: 0.09, d: 1.74 }).texture('plaster_wall', { tile: 0.6 }).color(TICKING).at(x!, y! + 0.02, z!);
    // The stain where somebody slept, and later where the water came in.
    kit.box({ w: 0.36, h: 0.004, d: 0.5 }).color(0x2e2618).at(x! + (i % 2 ? 0.1 : -0.12), y! + 0.11, z! + (i % 3) * 0.3 - 0.3);
  });
  const leaning = kit.box({ w: 0.7, h: 1.55, d: 0.09 }).texture('plaster_wall', { tile: 0.6 }).color(0x5a5240).at(9.55, 0, -28.2);
  leaning.object.rotation.x = 0.12;
}

/** An olive locker against a wall, its door shut or hanging open on a dark, empty inside. Faces +Z. */
function locker(kit: LevelKit, x: number, z: number, yaw: number, open: number) {
  return kit
    .group((g) => {
      g.box({ w: 0.6, h: 1.8, d: 0.5 }).texture('rust_metal', { tile: 0.8 }).color(OLIVE).at(0, 0, 0.25).collider();
      // Louvres at the top of the door, and a streak of rust from the hinge down.
      [1.5, 1.56, 1.62].forEach((y) => g.box({ w: 0.3, h: 0.012, d: 0.01 }).color(0x24261e).at(0, y, 0.505));
      g.box({ w: 0.045, h: 0.9, d: 0.01 }).color(RUST).at(-0.25, 0.8, 0.505);
      if (!open) return g.box({ w: 0.04, h: 0.08, d: 0.02 }).color(0x8a8a80).at(0.24, 0.95, 0.51);
      g.box({ w: 0.54, h: 1.72, d: 0.02 }).color(0x0e0f0c).at(0, 0.04, 0.495);
      g.box({ w: 0.5, h: 0.015, d: 0.4 }).color(0x3a3c30).at(0, 1.42, 0.27);
      g.group((door) => {
        door.box({ w: 0.58, h: 1.74, d: 0.02 }).texture('rust_metal', { tile: 0.8 }).color(OLIVE).at(0.29, 0, 0);
        [1.5, 1.56, 1.62].forEach((y) => door.box({ w: 0.3, h: 0.012, d: 0.01 }).color(0x24261e).at(0.29, y, 0.012));
      })
        .at(-0.29, 0.03, 0.51)
        .rotY(-open);
    })
    .at(x, 0, z)
    .rotY(yaw);
}

/** Lockers along the dormitory's west wall, either side of the door; a helmet left on one. */
function lockers(kit: LevelKit): void {
  const wall = 1.5;
  locker(kit, wall, -33.5, 90, 0);
  locker(kit, wall, -32.88, 90, 68);
  locker(kit, wall, -28.62, 90, 0);
  helmet(kit, 1.76, 1.8, -33.5, 30);
  helmet(kit, 5.7, 0, -33.45, 200);
}

/** A Swiss army helmet, the old kind with the flared rim, sitting upright. */
function helmet(kit: LevelKit, x: number, y: number, z: number, yaw: number): void {
  kit.mesh(new SphereGeometry(0.14, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.85, 1.1)).color(0x4a5034).at(x, y + 0.02, z).rotY(yaw);
  kit.cylinder({ r: 0.17, h: 0.02, sides: 9 }).color(0x464c32).at(x, y, z);
}

/** Wooden crates with rope handles and stencilled lots. Faces +Z. */
function ammoCrate(kit: LevelKit, x: number, y: number, z: number, yaw: number, open = false): void {
  kit
    .group((g) => {
      g.box({ w: 0.62, h: 0.3, d: 0.34 }).texture('wood_planks', { tile: 0.5 }).color(0x5e6044).at(0, 0, 0);
      [-0.33, 0.33].forEach((dx) => g.box({ w: 0.02, h: 0.04, d: 0.12 }).color(0x4a4230).at(dx, 0.18, 0));
      g.box({ w: 0.2, h: 0.04, d: 0.006 }).color(0xc8c0a0).at(-0.12, 0.17, 0.172);
      g.box({ w: 0.12, h: 0.03, d: 0.006 }).color(0xc8c0a0).at(0.16, 0.18, 0.172);
      if (!open) return g.box({ w: 0.64, h: 0.03, d: 0.36 }).texture('wood_planks', { tile: 0.5 }).color(0x52543c).at(0, 0.3, 0);
      g.box({ w: 0.56, h: 0.01, d: 0.28 }).color(0x16160f).at(0, 0.29, 0);
    })
    .at(x, y, z)
    .rotY(yaw);
}

/** A field telephone cable drum on its side, a few turns of black wire still on it. */
function cableDrum(kit: LevelKit, x: number, z: number, yaw: number): void {
  kit
    .group((g) => {
      [-0.16, 0.16].forEach((dx) => g.mesh(new CylinderGeometry(0.22, 0.22, 0.025, 10).rotateZ(Math.PI / 2)).texture('rust_metal', { tile: 0.4 }).color(0x4a4c3e).at(dx, 0.22, 0));
      g.mesh(new CylinderGeometry(0.15, 0.15, 0.3, 8).rotateZ(Math.PI / 2)).color(0x141412).at(0, 0.22, 0);
      g.box({ w: 0.012, h: 0.012, d: 0.7 }).color(0x141412).at(0.05, 0.01, 0.45).rotY(12);
    })
    .at(x, 0, z)
    .rotY(yaw);
}

/** Ration tins, opened and not: tall meat tins and flat biscuit tins, at height `y`. */
function rationTins(kit: LevelKit, spots: [number, number][], y: number): void {
  spots.forEach(([x, z], i) => {
    const flat = i % 3 === 2;
    kit.cylinder({ r: flat ? 0.06 : 0.04, h: flat ? 0.035 : 0.09, sides: 7 }).color(i % 2 ? 0x5a5e44 : 0x7a7a70).at(x, y, z);
    if (i % 2) kit.cylinder({ r: 0.035, h: 0.004, sides: 7 }).color(0x1a1a16).at(x, y + 0.09, z);
  });
}

/** The guard room's north corners: crates and the drum by the phone wall, tins and a helmet by the door. */
function guardRoomStores(kit: LevelKit): void {
  ammoCrate(kit, -6.1, 0, -17.7, 0);
  ammoCrate(kit, -6.08, 0.3, -17.68, 6);
  ammoCrate(kit, -6.0, 0, -17.2, 84, true);
  cableDrum(kit, -5.35, -17.62, 10);
  rationTins(kit, [[-1.8, -17.7], [-1.92, -17.62], [-1.75, -17.5], [-2.02, -17.75]], 0);
  helmet(kit, -2.2, 0, -17.45, 120);
}

/** The table by the bench: what the last party left, and an army tin used as an ashtray. */
function dormitoryTable(kit: LevelKit): void {
  rationTins(kit, [[9.75, -33.2], [10.55, -32.9], [10.75, -33.25]], 0.77);
  stubs(kit, { x: 10.2, z: -33.05, w: 1.3, d: 0.5 }, 0.77, 8, 'dorm-table');
}

/** Water standing on the concrete under a leak, darker than the floor round it. */
function puddle(kit: LevelKit, x: number, z: number, r: number): void {
  kit.mesh(new CircleGeometry(r, 9).rotateX(-Math.PI / 2).scale(1, 1, 0.7)).color(0x1e1f1c).at(x, 0.004, z);
}

/** Two army posters, peeling, and the names and years teenagers sprayed and wrote on the walls. */
function walls(kit: LevelKit): void {
  poster(kit, ['GASALARM', 'ALERTE AU GAZ'], ['Maske anziehen.', 'Mettez le masque.'], 'gas').at(0.885, 0.95, -24.6).rotY(-90);
  poster(kit, ['WER NICHT SCHWEIGEN', 'KANN, SCHADET'], ['Qui ne sait se taire', 'nuit au pays.'], 'ear').at(-1.515, 0.95, -16.95).rotY(-90);
  graffiti(kit, [{ text: 'STEVE + JESS', color: '#8a2420', size: 12, angle: -5 }, { text: '94', color: '#8a2420', size: 13, angle: -5 }], { w: 1, h: 0.64 }).at(1.515, 0.95, -29.75).rotY(90);
  graffiti(kit, [{ text: 'GOTTERON', color: '#1c1c1a', size: 13, angle: 4 }, { text: 'DJ MIKE 97', color: '#2a4a8a', size: 11, angle: -2 }]).at(-2.985, 0.5, -43.2).rotY(90);
  graffiti(kit, [{ text: 'LAETITIA 93', color: '#a04070', size: 11, angle: 3 }, { text: 'NO FUTURE', color: '#1c1c1a', size: 12, angle: -6 }], { w: 1.2, h: 0.75 }).at(-2.45, 0.45, -17.985);
}

/**
 * A printed army poster gone yellow, German over French, its lower corner torn away and one
 * corner curling off the wall. `picture` is the drawing on it: a gas mask, or an ear.
 */
function poster(kit: LevelKit, german: string[], french: string[], picture: 'gas' | 'ear') {
  return scrawl(kit, { w: 0.5, h: 0.7 }, [40, 56], (g) => {
    g.fillStyle = PAPER;
    g.fillRect(0, 0, 40, 56);
    g.fillStyle = '#8a2a22';
    g.fillRect(0, 0, 40, 4);
    german.forEach((line, i) => handText(g, line, 2, 8 + i * 5, { size: 4, color: '#1e1e1a', font: 'bold sans-serif' }));
    g.fillStyle = '#2a2a24';
    if (picture === 'gas') {
      g.fillRect(14, 20, 12, 13);
      g.fillStyle = PAPER;
      g.fillRect(16, 23, 3, 3);
      g.fillRect(21, 23, 3, 3);
      g.fillStyle = '#2a2a24';
      g.fillRect(18, 33, 4, 5);
    } else {
      // An ear, and the mouth below it shut with a bar.
      g.strokeStyle = '#2a2a24';
      g.lineWidth = 3;
      g.beginPath();
      g.arc(20, 26, 7, Math.PI * 1.1, Math.PI * 0.55);
      g.stroke();
      g.lineWidth = 1;
      g.beginPath();
      g.arc(20, 26, 3, Math.PI * 1.2, Math.PI * 0.4);
      g.stroke();
      g.fillRect(13, 37, 14, 2);
    }
    french.forEach((line, i) => handText(g, line, 2, 43 + i * 5, { size: 4, color: '#3a3428', font: 'sans-serif' }));
    // Damp coming through from the bottom, and the torn corner.
    g.fillStyle = 'rgba(70, 60, 40, 0.5)';
    g.fillRect(0, 50, 40, 6);
    g.clearRect(28, 47, 12, 9);
    g.clearRect(33, 44, 7, 3);
    g.clearRect(0, 0, 3, 2);
  }).color(0x9a927c);
}
