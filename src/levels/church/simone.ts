import { MathUtils } from 'three';
import type { Waypoint } from '../../engine/characters/motion';
import type { StateView } from '../../game/conditions';
import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import type { Beat } from '../../game/scares/beats';
import type { TimeOfDay } from '../../game/state';
import { storyPhase } from '../forest_path/story';
import { everyFrame } from './everyFrame';
import { HARMONIUM, NAVE_AISLE, PAST_THE_STOUP_Z, PRINTER, RAISED, simoneSpots } from './layout';
import { dotMatrixPrint, Harmonium } from './sounds';

/** Simone Grandjean, the sacristan (A1), the office printer (A2), and the stuck reed (A3). */

export type SimoneSpot = keyof typeof simoneSpots;

type ChurchState = StateView & { readonly time: TimeOfDay };

/** The office chair and the harmonium bench. */
const SEAT = 0.48;
/** Talking to her within this distance lets her play again after the reed. */
const TALK_RANGE = 2.5;

/** Out of the office, across the sacristy, down through the chancel rail, and along the front pew to the bench. */
const toHarmonium: Waypoint[] = [
  { x: 4.3, z: -19.4 },
  { x: 2.9, z: -19.4 },
  { x: 2.9, z: -17.75 },
  { x: -2.5, z: -17.8 },
  { x: -2.5, z: -16.8 },
  { x: -2.4, z: -16.2 },
  { x: -2.0, z: -14.2 },
  { x: 0.3, z: -12 },
  { x: 0.3, z: -9.8 },
  { x: -1.0, z: -8.7 },
  { x: simoneSpots.harmonium.x, z: -8.7 },
  simoneSpots.harmonium,
];

/** Where Simone is, from the table in docs/script/08-additions.md; null at night and once the story is past day 3. */
export function simoneSpot(state: ChurchState): SimoneSpot | null {
  if (state.count('day') >= 4) return null;
  switch (storyPhase(state)) {
    case 'day1':
      return 'altar';
    case 'day2':
      return state.hasFlag('simone_printed') ? 'harmonium' : 'office';
    case 'day3':
      return 'harmonium';
    default:
      return null;
  }
}

/** A small reed organ against the north wall: case on short legs, two treadles, keys, a fold-back lid, and the hymn book. */
export function buildHarmonium(kit: LevelKit): void {
  const wood = (b: ReturnType<LevelKit['box']>) => b.texture('pew_wood', { tile: 0.8 }).color(0x4a3628);
  kit
    .group((g) => {
      [-0.5, 0.5].forEach((dx) => [-0.18, 0.18].forEach((dz) => g.box({ w: 0.06, h: 0.1, d: 0.06 }).color(0x2a2018).at(dx, 0, dz)));
      wood(g.box({ w: 1.1, h: 0.62, d: 0.48 })).at(0, 0.1, 0).collider();
      [-0.18, 0.18].forEach((dx) => g.box({ w: 0.24, h: 0.03, d: 0.26 }).color(0x5a2a24).at(dx, 0.13, 0.3));
      wood(g.box({ w: 0.92, h: 0.06, d: 0.2 })).at(0, 0.72, 0.3);
      g.box({ w: 0.82, h: 0.02, d: 0.13 }).color(0xd2c8ae).at(0, 0.78, 0.33);
      g.box({ w: 0.8, h: 0.015, d: 0.05 }).color(0x1e1a16).at(0, 0.8, 0.29);
      wood(g.box({ w: 1.1, h: 0.3, d: 0.3 })).at(0, 0.72, -0.09);
      wood(g.box({ w: 1.1, h: 0.02, d: 0.2 })).at(0, 1.02, -0.14);
      wood(g.box({ w: 0.5, h: 0.32, d: 0.02 })).at(0, 1.02, 0.02);
      g.box({ w: 0.36, h: 0.24, d: 0.015 }).color(0xcfc6ae).at(0, 1.06, 0.04);
    })
    .at(HARMONIUM.x, 0, HARMONIUM.z);
  const bench = simoneSpots.harmonium;
  wood(kit.box({ w: 0.6, h: 0.45, d: 0.32 })).at(bench.x, 0, bench.z);
}

/**
 * Simone where the story puts her. On day 2 she sits at the office computer until the reporter
 * prints the bulletin, then walks to the harmonium and plays Saturday's hymn. Returns the reed
 * beat for the church's scare director.
 */
export function placeSimone(kit: LevelKit, ctx: SceneContext): Beat[] {
  let spot = simoneSpot(ctx.state);
  if (!spot) return [];
  const start = simoneSpots[spot];
  const simone = kit.npc('simone').at(start.x, 0, start.z).faceYaw(start.yaw).watch(3).talk('simone');
  if (spot !== 'altar') simone.sit(SEAT);
  const harmonium = kit.use((k) => {
    const instrument = new Harmonium(ctx.audio, { x: HARMONIUM.x, y: 0.9, z: HARMONIUM.z });
    k.world.sounds.track(instrument);
    return instrument;
  });

  let walking = false;
  let hushed = false;
  let printed = ctx.state.hasFlag('simone_printed');
  everyFrame(kit, () => {
    if (!printed && ctx.state.hasFlag('simone_printed')) {
      printed = true;
      dotMatrixPrint(ctx.audio, { x: PRINTER.x, y: RAISED + 0.75, z: PRINTER.z });
    }
    const player = ctx.player.position;
    const talkedTo = ctx.paused && player.distanceTo(simone.character.position) < TALK_RANGE;
    if (hushed && (talkedTo || player.z > PAST_THE_STOUP_Z)) {
      hushed = false;
      simone.watch(3);
    }
    if (spot === 'harmonium' && !walking && !hushed && !ctx.paused) harmonium.play();
    else harmonium.stop();

    if (walking || ctx.paused || spot !== 'office' || simoneSpot(ctx.state) !== 'harmonium') return;
    spot = 'harmonium';
    walking = true;
    void simone.character.walk(toHarmonium).then(() => {
      walking = false;
      simone.character.face(MathUtils.degToRad(simoneSpots.harmonium.yaw));
      simone.character.sit(SEAT);
    });
  });

  return [
    {
      id: 'chu_harmonium_reed',
      when: [{ flag: 'simone_printed' }, { enter: NAVE_AISLE }],
      if: { any: [{ flag: 'abbe_seal_hint' }, { count: [['day', '==', 3]] }] },
      do: [
        {
          run: () => {
            // She takes her hands off the keys and sits still until spoken to or left behind.
            hushed = true;
            simone.watch(0);
            simone.character.lookAt = null;
            harmonium.stickLowA(12);
          },
        },
      ],
      set: 'chu_harmonium_reed',
    },
  ];
}
