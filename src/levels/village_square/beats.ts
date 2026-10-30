import { Color } from 'three';
import { dialogues } from '../../content';
import type { Point3 } from '../../engine/audio/audioManager';
import { bark } from '../../engine/characters/voices';
import type { MeshBuilder } from '../../game/kit/builders';
import type { LevelKit } from '../../game/kit/levelKit';
import type { Beat } from '../../game/scares/beats';
import { scareDirector } from '../../game/scares/director';
import { playSound } from '../../game/scares/sounds';
import type { SceneContext } from '../../game/scene';
import { everyFrame } from '../church/everyFrame';
import { isNight, type StoryPhase } from '../forest_path/story';
import { towerBell } from '../church/sounds';
import { CHURCH, HOUSE_1, HOUSE_2, PHONE_BOX, SQUARE } from './layout';
import { brodardCall } from './phonebox';
import { dialTone, moped, phoneRing, scoped, shutterBang, type MovingSound } from './sounds';
import { startle } from '../../game/scares/startles';

/**
 * The village beats of docs/script/07-scares.md. By day almost nothing: a curtain, a light going
 * off, a moped in the fog. At night, footsteps on the cobbles behind, a dog that stops barking
 * too suddenly, and on night 2 the phone box ringing once.
 */

export interface SquareParts {
  /** The upstairs curtain at the Gremaud house (vil_curtain). */
  curtain: MeshBuilder | null;
  /** The light upstairs in house 2 that goes off as the reporter comes close. */
  houseTwoLight: MeshBuilder | null;
  phoneLamp: MeshBuilder | null;
  /** The abbé's lamp; a shadow passes it now and then. */
  presbyteryLamp: MeshBuilder | null;
  /** The tower's bell, for the strike overhead. */
  bell: Point3;
}

/** Where the moped idles on day 2, behind the houses east of the square, out of sight. */
const MOPED = { x: 25, y: 0.6, z: 9 };
const MOPED_AWAY = { x: 44, y: 0.6, z: 30 };

const wait = (seconds: number) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));

/** Stages the square's beats. Returns what lifting the phone box receiver does. */
export function stageBeats(kit: LevelKit, ctx: SceneContext, phase: StoryPhase, parts: SquareParts): () => Promise<void> {
  const { audio } = ctx;
  const night = isNight(phase);
  let rangAt = Number.NEGATIVE_INFINITY;
  let curtainOffset = 0;
  let idling: { sound: MovingSound; leaving: number | null } | null = null;

  // Jackdaws roosting in the tower burst out as the reporter passes under it on the way to the lane.
  const beats: Beat[] = night
    ? [startle('square_tower', 'pigeons', { x: -CHURCH.w / 2 - 1, z: CHURCH.front + 2, r: 3 }, { x: CHURCH.x, y: 16, z: CHURCH.front - 2 })]
    : [];
  // Once each game: the bell striking right overhead at the church door, and a shutter on house 1 slamming in the wind.
  beats.push({
    id: 'vil_tower_strike',
    when: { enter: { x: CHURCH.x, z: CHURCH.front + 2.5, r: 2.5 } },
    do: [{ run: () => towerBell(audio, parts.bell, 3) }, { after: 1.65, run: (c) => c.jolt() }, { after: 1.7, startle: 'pigeons', from: parts.bell }],
    set: 'vil_tower_strike',
  });
  if (phase !== 'day1')
    beats.push({
      id: 'vil_shutter',
      when: { enter: { x: HOUSE_1.x + HOUSE_1.d / 2 + 1.5, z: HOUSE_1.z, w: 3, d: 8 } },
      do: [{ run: () => shutterBang(audio, { x: HOUSE_1.x + HOUSE_1.d / 2, y: 4.4, z: HOUSE_1.z + 1.6 }) }],
      set: 'vil_shutter',
    });
  if (phase === 'day1')
    beats.push({ id: 'vil_curtain', when: { enter: { x: 9.6, z: 10.5, r: 3.5 } }, do: [{ run: () => void twitch() }] });
  if (phase === 'day2')
    beats.push({
      id: 'vil_moped',
      when: { enter: { x: SQUARE.x, z: SQUARE.z, w: SQUARE.w - 4, d: SQUARE.d - 4 } },
      if: { any: [{ flag: 'has_shovel' }, { flag: 'found_hidden_door' }] },
      do: [
        {
          run: () => {
            idling = { sound: scoped(kit, moped(audio, MOPED)), leaving: null };
          },
        },
      ],
    });
  if (phase === 'night1' || phase === 'night2')
    beats.push({
      id: 'vil_follow',
      when: { enter: { x: 4.5, z: -5.5, w: 5, d: 7 } },
      if: { notFlag: 'met_veilleur' },
      do: [{ stalk: { surface: 'stone', steps: 12 } }],
    });
  if (phase === 'night1')
    beats.push({
      id: 'vil_dog_muzzled',
      when: { enter: { x: HOUSE_2.x, z: 10.5, w: 10, d: 4 } },
      do: [{ run: () => bark(audio, { at: { x: HOUSE_2.x + 1, y: 1, z: HOUSE_2.z - 2.5 }, volume: 1 }), after: 0.6 }],
    });
  // Someone on the line (A6): once the call is over, the square goes quiet and the box light blinks.
  if (!night)
    beats.push({
      id: 'vil_line_breath',
      when: { flag: 'brodard_called' },
      do: [{ silence: 6 }, { run: () => void blink() }],
      set: 'vil_line_breath',
    });
  if (phase === 'night2')
    beats.push({
      id: 'vil_phonebox',
      when: { enter: { x: PHONE_BOX.x - 2, z: PHONE_BOX.z, r: 4.5 } },
      do: [
        {
          run: () => {
            phoneRing(audio, { x: PHONE_BOX.x, y: 1.4, z: PHONE_BOX.z });
            rangAt = ctx.time;
          },
        },
      ],
    });
  kit.use(scareDirector(beats, night ? { random: { surface: 'stone' } } : {}));
  const call = brodardCall(kit, ctx);

  const twitch = async () => {
    curtainOffset = 0.32;
    await wait(1.6);
    curtainOffset = 0;
  };
  const curtainHome = parts.curtain?.object.position.x ?? 0;
  const lamp = parts.phoneLamp;
  const blink = async () => {
    if (!lamp) return;
    lamp.object.visible = false;
    await wait(0.15);
    lamp.object.visible = true;
  };
  const abbe = parts.presbyteryLamp;
  const abbeLit = new Color(abbe?.mesh.material.uniforms.uColor.value ?? 0xffffff);
  let shadow = -1;
  let shadowWait = 25;

  everyFrame(kit, (dt) => {
    const p = ctx.player.position;
    if (parts.curtain) parts.curtain.object.position.x += (curtainHome + curtainOffset - parts.curtain.object.position.x) * Math.min(1, dt * 3);
    // A light upstairs goes off as the reporter comes close (door_house_2).
    if (!night && parts.houseTwoLight?.object.visible && Math.hypot(p.x - HOUSE_2.x, p.z - (HOUSE_2.z - HOUSE_2.d / 2)) < 9) parts.houseTwoLight.object.visible = false;
    if (night && lamp && Math.random() < dt * 1.4) lamp.object.visible = Math.random() < 0.85;
    if (abbe && !ctx.paused) {
      shadowWait -= dt;
      if (shadowWait < 0 && shadow < 0) shadow = 0;
      if (shadow >= 0) {
        // Someone crosses the lamp slowly: the window dims over three seconds and brightens.
        shadow += dt / 3;
        const k = 1 - 0.7 * Math.sin(Math.min(1, shadow) * Math.PI);
        abbe.mesh.material.uniforms.uColor.value.copy(abbeLit).multiplyScalar(k);
        if (shadow >= 1) {
          shadow = -1;
          shadowWait = 30 + Math.random() * 40;
        }
      }
    }
    if (idling) {
      const near = Math.hypot(p.x - MOPED.x, p.z - MOPED.z) < 17;
      if (near && idling.leaving === null) {
        idling.leaving = 0;
        idling.sound.throttle(1);
      }
      if (idling.leaving !== null) {
        idling.leaving += dt / 6;
        const t = Math.min(1, idling.leaving);
        idling.sound.moveTo({ x: MOPED.x + (MOPED_AWAY.x - MOPED.x) * t, y: 0.6, z: MOPED.z + (MOPED_AWAY.z - MOPED.z) * t });
        if (t >= 1) {
          idling.sound.stop(2);
          idling = null;
        }
      }
    }
  });

  return async () => {
    if (phase === 'night2' && ctx.time - rangAt < 4) {
      rangAt = Number.NEGATIVE_INFINITY;
      playSound(audio, 'sfx_static', { volume: 0.7 });
      playSound(audio, 'sfx_breath_mask', { volume: 0.2 });
      await wait(4);
      dialTone(audio, 2.5);
      await ctx.dialogue(dialogues.phone_night_static);
      return;
    }
    if (!night && call.wanted()) return call.use();
    await ctx.dialogue(night ? dialogues.square_phonebox_night : dialogues.square_phonebox);
  };
}
