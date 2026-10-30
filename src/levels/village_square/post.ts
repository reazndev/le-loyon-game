import { everyFrame } from '../../game/ambient';
import type { MeshBuilder } from '../../game/kit/builders';
import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { paintedTexture } from '../forest_path/scrawl';
import { INN, INN_DOOR } from './layout';
import { smallCar } from './props';
import { paperRustle, vanDoor } from './sounds';

/**
 * Josiane Mauron on her round (A4): the yellow post van parked by the Gremaud gate, hazards
 * blinking, and the postwoman sorting letters at its passenger door. Now and then she walks the
 * inn's post to its door and back. Days 2 and 3, by day.
 */

const POST_YELLOW = 0xe2b21c;
/** The van, nose north, west of the Gremaud wall and clear of the lane to the gate. */
const VAN = { x: 9, z: 15 };
/** Where she sorts, at the passenger door on the gate side. */
const SORTING = { x: 10.15, z: 15 };
/**
 * Up the inn front to the door and back. She keeps to the house side of the square, east of
 * the neighbour's and the smoker's spots by the step.
 */
const ROUND = [
  { ...SORTING, wait: 6 },
  { x: 10.3, z: 12.8 },
  { x: 9.6, z: 9.5 },
  { x: 9.5, z: 4.5 },
  { x: INN.x - INN.d / 2 - 0.45, z: INN_DOOR.z + 1.9, wait: 6 },
  { x: 9.5, z: 4.5 },
  { x: 9.6, z: 9.5 },
  { x: 10.3, z: 12.8 },
];

export function postRound(kit: LevelKit, ctx: SceneContext): void {
  const hazards = postVan(kit);
  let blink = 0;
  everyFrame(kit, (dt) => {
    blink = (blink + dt) % 1.4;
    hazards.forEach((h) => (h.object.visible = blink < 0.6));
  });

  const josiane = kit.npc('josiane').at(SORTING.x, 0, SORTING.z).faceYaw(90).watch(4).walk(ROUND, { loop: true }).talk('josiane');
  const door = { x: SORTING.x - 0.4, y: 1, z: SORTING.z };
  let sorting = false;
  josiane.character.events.on('arrive', (index) => {
    sorting = index === 0;
    if (!sorting) return;
    vanDoor(ctx.audio, door, false);
    setTimeout(() => vanDoor(ctx.audio, door, true), 5200);
  });
  let rustle = 2;
  everyFrame(kit, (dt) => {
    if (!sorting || ctx.paused) return;
    rustle -= dt;
    if (rustle > 0) return;
    rustle = 1.2 + Math.random() * 1.8;
    paperRustle(ctx.audio, { x: SORTING.x - 0.3, y: 1, z: SORTING.z });
  });
}

/**
 * The Fiat from the square as a small box van in post yellow, LA POSTE on its sides, a tray of
 * letters resting in the open passenger window. Returns the hazard lights, which the caller blinks.
 */
function postVan(kit: LevelKit) {
  const lettering = paintedTexture([96, 24], (g) => {
    g.fillStyle = '#141412';
    g.fillRect(0, 0, 96, 24);
    g.fillStyle = '#e2b21c';
    g.font = 'bold 15px sans-serif';
    g.textBaseline = 'middle';
    g.fillText('LA POSTE', 10, 13);
  });
  const hazards: MeshBuilder[] = [];
  kit
    .group((g) => {
      // Built nose to +Z like every car in the village; turned round below to face north.
      smallCar(g, POST_YELLOW);
      g.box({ w: 1.5, h: 1.2, d: 1.9 }).texture('rust_metal', { tile: 1.6 }).color(POST_YELLOW).at(0, 0.5, -0.78);
      [-1, 1].forEach((side) => {
        g.box({ w: 0.01, h: 0.36, d: 1.4 }).map(lettering, { tile: [1.4, 0.36] }).at(side * 0.755, 0.95, -0.78);
        [1.73, -1.74].forEach((z) => hazards.push(g.box({ w: 0.1, h: 0.07, d: 0.03 }).color(0xffa030).unlit().at(side * 0.66, 0.66, z)));
      });
      // The tray of letters on the passenger side, which turned round is the gate side.
      [0, 0.03, 0.06].forEach((dy, i) => g.box({ w: 0.24, h: 0.02, d: 0.32 }).color(i === 1 ? 0xc8c0a8 : 0xe0dccc).at(-0.72, 0.82 + dy, 0.3 + i * 0.02));
      g.box({ w: 0.3, h: 0.06, d: 0.4 }).color(0x5a5a56).at(-0.72, 0.8, 0.32);
    })
    .at(VAN.x, 0, VAN.z)
    .rotY(180);
  return hazards;
}
