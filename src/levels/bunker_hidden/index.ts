import { CylinderGeometry, type Group } from 'three';
import type { NodeId } from '../../content';
import type { Atmosphere } from '../../engine/render/atmosphere';
import type { LightBuilder } from '../../game/kit/builders';
import type { LevelKit } from '../../game/kit/levelKit';
import type { NpcBuilder } from '../../game/kit/npc';
import type { Beat } from '../../game/scares/beats';
import { scareDirector, type ScareDirector } from '../../game/scares/director';
import { defineScene, type SceneContext } from '../../game/scene';
import type { TimeOfDay } from '../../game/state';
import { buildRooms, insideOut, movingBlocker } from '../bunker_interior/concrete';
import { drip } from '../bunker_interior/drips';
import type { Opening, Room } from '../bunker_interior/rooms';
import type { Markers } from '../forest_path/beats';
import { playNode } from '../forest_path/play';
import { handText, scrawl } from '../forest_path/scrawl';
import { unspent } from '../forest_path/spent';
import { candleFlutter, hatchWheel, splash, steelDoorShut } from '../forest_path/sounds';
import { yawToward } from '../forest_path/trail';
import { takeArrival, type Arrival } from './arrival';

/**
 * Fort, command room "K.P. 3". Marc's room behind the steel door: candle, notebook, the photo
 * of two boys, the képi blanc, Gremaud's ring in a tin, a camp bed made tight. At the back,
 * the escape tunnel: a low concrete pipe to the hatch in the forest.
 */

const rooms: Room[] = [
  { id: 'threshold', x0: -1.4, x1: -0.6, z0: -0.45, z1: 0.45, h: 2 },
  { id: 'command', x0: 0, x1: 6, z0: -2, z1: 2, h: 2.05 },
  { id: 'mouth', x0: 6.6, x1: 7.4, z0: -0.55, z1: 0.55, h: 1.5 },
];
const openings: Opening[] = [
  { a: 'threshold', b: 'command', at: 0, w: 0.9 },
  { a: 'command', b: 'mouth', at: 0, w: 0.8, h: 1.5 },
];

/** The escape tunnel: a low pipe, about 44 m, the length of a long crouched walk. */
const TUNNEL = { x0: 7.4, x1: 51, r: 0.74 };
const CANDLE = { x: 2.55, y: 0.78, z: -0.95 };
const DOOR = { x: 0.15, z: 0 };
const BED = { x: 4.35, z: 1.55, top: 0.42 };

const atmosphere: Atmosphere = {
  fog: { color: 0x080605, near: 1, far: 12, density: 0.06, wisps: 0.1 },
  ambient: 0x0b0908,
  saturation: 0.65,
  flashlight: true,
};
const atmospheres: Record<TimeOfDay, Atmosphere> = { day: atmosphere, night: atmosphere };

export const markers = {
  bun3_doorway: {
    beat: 'bun3_doorway',
    x: 0.6,
    z: -0.3,
    yaw: yawToward(3 - 0.6, 0.3),
    note: 'Jumpscare 3, `room_empty` only: Marc just inside the doorway, at one side of the frame, so he stands off-center and closer than the doorway itself. He holds a candle low; it lights the mask from below and his hand, and the rest of him is in shadow. The table candle gutters when he comes in. He steps in while the player looks away; when they turn back, one loud breath, and marc_doorway 1 s later.',
  },
  marc_dark_corner: {
    beat: 'bun3_knock',
    x: 5.55,
    z: -1.55,
    yaw: yawToward(DOOR.x - 5.55, DOOR.z + 1.55),
    note: 'Wrong knock: Marc stands in this corner in the dark, still, facing the door. marc_dark_room plays when the torch finds him.',
  },
  marc_on_bed: {
    beat: 'marc_monologue',
    x: 4,
    z: BED.z - 0.2,
    yaw: -55,
    note: 'After the monologue: he sits on the south edge of the bed, turned away from the door, hands on his knees, and does not move again.',
  },
  marc_monologue_stand: {
    beat: 'marc_monologue',
    x: 4.6,
    z: -0.6,
    yaw: yawToward(DOOR.x - 4.6, DOOR.z + 0.6),
    note: 'During the monologue in the room (dark and empty-room branches): never closer than 3 m to the reporter, standing, later sitting on the bed.',
  },
} satisfies Markers;

type Update = (dt: number, ctx: SceneContext) => void;
let updates: Update[] = [];

export const bunkerHiddenScene = defineScene({
  id: 'bunker_hidden',
  spawns: {
    default: { x: 0.7, z: 0, yaw: -90 },
    from_dormitory: { x: 0.7, z: 0, yaw: -90 },
  },
  atmosphere: atmospheres,

  build(kit, ctx) {
    updates = [];
    const arrival = takeArrival(ctx.state.hasFlag('met_marc'));
    kit.ground('stone', 0);
    buildRooms(kit, rooms, openings, {
      threshold: { finish: 'bare', open: ['w'], floor: 0x5c5850 },
      command: { finish: 'bare', floor: 0x6a655c },
      mouth: { finish: 'bare', open: ['e'], floor: 0x3e3c38 },
    });
    kit.box({ w: 0.02, h: 2, d: 0.9 }).unlit().color(0x030303).at(-1.38, 0, 0);

    const seen = new Set<string>();
    const look = (id: NodeId, then?: () => Promise<void>) => async () => {
      seen.add(id);
      await playNode(ctx, id);
      await then?.();
    };
    furnish(kit, ctx, arrival, look);
    const tableCandle = candle(kit, ctx, arrival);
    const scares = kit.use(scareDirector(unspent(ctx.state, roomBeats(tunnel(kit, ctx)))));
    leaveByTheDoor(kit, ctx);
    stageMarc(kit, ctx, arrival, seen, scares, () => {
      if (tableCandle?.light) tableCandle.light.intensity *= 0.35;
    });
  },

  update(dt, ctx) {
    updates.forEach((update) => update(dt, ctx));
  },
});

/** The camp bed, table, shelves, crate, stove, the képi on its nail, the phone, and the bulb. */
function furnish(kit: LevelKit, ctx: SceneContext, arrival: Arrival, look: (id: NodeId, then?: () => Promise<void>) => () => Promise<void>): void {
  // The camp bed, blanket folded tight, corners square.
  kit.box({ w: 1.9, h: 0.38, d: 0.75 }).texture('camo_cape', { tile: 1 }).color(0x58583e).at(BED.x, 0, BED.z).collider();
  // Walkable only so Marc sits on top of it; the collider keeps the player off.
  kit.box({ w: 1.86, h: 0.04, d: 0.72 }).color(0x4a4c38).at(BED.x, 0.38, BED.z).walkable('wood');
  kit.box({ w: 0.4, h: 0.08, d: 0.6 }).color(0x6e6a58).at(5.05, BED.top, BED.z);
  kit.hotspot({ prompt: 'Look at the bed', radius: 0.45, photo: 'photo_hidden_room', onInteract: look('room_camp_bed') }).at(3.75, 0, 1.15);

  // The képi blanc in a plastic bag, on a nail over the bed like a picture.
  kit.box({ w: 0.36, h: 0.34, d: 0.04 }).color(0x4e504c).at(4.35, 1.25, 1.96);
  kit.cylinder({ r: 0.1, h: 0.12, sides: 8 }).color(0xbcbab2).at(4.35, 1.34, 1.9);
  kit.box({ w: 0.2, h: 0.02, d: 0.1 }).color(0x141414).at(4.35, 1.34, 1.84);
  // Over the head of the bed, so it is its own thing to look at.
  kit.hotspot({ prompt: 'Look at the cap', radius: 0.35, onInteract: look('room_kepi') }).at(4.95, 0, 1.2);

  // The heavy table with the valley map under glass, the notebook, the photo, Gremaud's notes.
  kit.box({ w: 1.5, h: 0.75, d: 0.85 }).texture('wood_planks', { tile: 1 }).color(0x5a4c3e).at(2.55, 0, -0.95).collider();
  valleyMap(kit).at(2.55, 0.752, -0.66).object.rotation.set(-Math.PI / 2, 0, 0);
  kit.box({ w: 0.2, h: 0.015, d: 0.28 }).color(0x7a8a9a).at(2.05, 0.752, -0.75).rotY(12);
  // Only when he is out does he come back to find it moved, and write that down.
  const notebook = arrival === 'empty' && ctx.state.hasFlag('cupboard_restored') ? 'doc_marc_notebook_restored' : 'doc_marc_notebook';
  kit.hotspot({ prompt: 'Read the notebook', radius: 0.25, onInteract: look('room_notebook', () => ctx.readDocument(notebook)) }).at(2.05, 0, -0.6);
  kit.box({ w: 0.08, h: 0.11, d: 0.01 }).color(0x9a9282).at(CANDLE.x + 0.12, CANDLE.y, CANDLE.z + 0.05).rotY(-20);
  kit.hotspot({ prompt: 'Look at the photograph', radius: 0.2, onInteract: look('room_photo') }).at(CANDLE.x + 0.15, 0, CANDLE.z + 0.4);
  kit.box({ w: 0.16, h: 0.05, d: 0.22 }).color(0xb8b4a0).at(2.95, 0.752, -1.15).rotY(-30);
  kit.hotspot({ prompt: "Read the syndic's notes", radius: 0.2, onInteract: look('room_notes_gremaud', () => ctx.readDocument('doc_gremaud_notes')) }).at(3.05, 0, -0.65);
  kit.hotspot({ prompt: 'Look at the map', radius: 0.3, onInteract: look('room_map') }).at(2.4, 0, -0.45);
  [[1.6, -1.1, 0], [3.5, -0.4, 200]].forEach(([x, z, yaw]) => stool(kit, x!, z!, yaw!));

  // The crate by the bed, with the pastille tin.
  kit.box({ w: 0.5, h: 0.45, d: 0.4 }).texture('wood_planks', { tile: 0.6 }).color(0x6a5a46).at(5.6, 0, 1.5).collider();
  kit.cylinder({ r: 0.04, h: 0.02, sides: 8 }).color(0x9a8a5a).at(5.6, 0.45, 1.45);
  kit.hotspot({ prompt: 'Look at the tin', radius: 0.25, onInteract: look('room_ring') }).at(5.45, 0, 1.15);

  // Shelves: tins, biscuits, candles, a jerrycan of water.
  kit.group((g) => {
    [0, 0.6, 1.2].forEach((y) => g.box({ w: 1.8, h: 0.03, d: 0.35 }).texture('wood_planks', { tile: 1 }).color(0x5e5244).at(0, 0.35 + y, 0));
    [-0.88, 0.88].forEach((x) => g.box({ w: 0.04, h: 1.7, d: 0.35 }).color(0x4a4036).at(x, 0, 0));
    [-0.6, -0.4, -0.2, 0.1, 0.3, 0.55].forEach((x, i) => g.cylinder({ r: 0.05, h: 0.11, sides: 7 }).color(i % 2 ? 0x8a8a84 : 0x7a7466).at(x, 0.38 + (i % 3) * 0.6, 0));
    g.box({ w: 0.3, h: 0.08, d: 0.2 }).color(0x7a6a44).at(0.3, 0.98, 0);
    g.barrier({ w: 1.8, d: 0.35 });
  }).at(4.4, 0, -1.8);
  kit.box({ w: 0.28, h: 0.42, d: 0.16 }).texture('rust_metal', { tile: 0.5 }).color(0x4e5a3a).at(5.6, 0, -1.7).collider();
  kit.hotspot({ prompt: 'Look at the shelves', radius: 0.6, onInteract: look('room_shelves') }).at(4.4, 0, -1.4);

  // Stove, pot, and bucket in the far corner.
  kit.box({ w: 0.26, h: 0.12, d: 0.26 }).color(0x3a3a36).at(5.65, 0, 0.55);
  kit.cylinder({ r: 0.1, h: 0.1, sides: 8 }).color(0x5a5a56).at(5.65, 0.12, 0.55);
  kit.cylinder({ r: 0.15, h: 0.3, sides: 8 }).texture('rust_metal').color(0x5a5a54).at(5.7, 0, -0.75);

  // The field phone on the wall, and the bulb on the battery wires, not lit.
  kit.box({ w: 0.24, h: 0.26, d: 0.16 }).color(0x4a3a2a).at(0.9, 1.15, -1.92);
  kit.hotspot({ prompt: 'Look at the telephone', radius: 0.3, onInteract: look('room_phone') }).at(0.9, 0, -1.6);
  kit.box({ w: 0.012, h: 0.012, d: 1.9 }).color(0x141414).at(0.05, 1.95, -0.95);
  kit.box({ w: 0.012, h: 0.3, d: 0.012 }).color(0x141414).at(2.55, 1.72, -0.95);
  kit.box({ w: 2.5, h: 0.012, d: 0.012 }).color(0x141414).at(1.3, 2.0, -0.95);
  kit.cylinder({ r: 0.035, h: 0.07, sides: 6 }).color(0x9a9890).at(2.55, 1.64, -0.95);

  // A second face on a hook by the door, only when he is out.
  if (arrival === 'empty') {
    kit.box({ w: 0.2, h: 0.25, d: 0.12 }).texture('gas_mask', { tile: [0.2, 0.25] }).cutout().color(0x8a7a62).at(0.07, 1.4, 1.2).rotY(90);
    kit.hotspot({ prompt: 'Look at the mask', radius: 0.25, onInteract: look('room_mask_hook') }).at(0.35, 0, 1.2);
  }
}

function stool(kit: LevelKit, x: number, z: number, yaw: number): void {
  kit.box({ w: 0.36, h: 0.45, d: 0.36 }).texture('wood_planks', { tile: 0.6 }).color(0x4e4236).at(x, 0, z).rotY(yaw);
}

/** Marc's map of the valley under glass: paths, times, Raymond's rounds in grease pencil. */
function valleyMap(kit: LevelKit) {
  return scrawl(kit, { w: 1.1, h: 0.62 }, [88, 50], (g) => {
    g.fillStyle = '#9e9878';
    g.fillRect(0, 0, 88, 50);
    g.strokeStyle = '#6a6450';
    [10, 18, 26].forEach((r) => {
      g.beginPath();
      g.ellipse(60, 40, r * 1.5, r, 0.2, 0, Math.PI * 2);
      g.stroke();
    });
    g.strokeStyle = '#2a2a3a';
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(8, 8);
    g.lineTo(30, 22);
    g.lineTo(48, 24);
    g.lineTo(70, 42);
    g.stroke();
    handText(g, 'R. 21:00-02:00', 4, 40, { size: 7, color: '#2a2a3a', font: 'monospace' });
    handText(g, 'Samedi: D.', 50, 10, { size: 7, color: '#2a2a3a', font: 'monospace' });
  });
}

/**
 * One candle on the table, and its flutter, the only sound. It is out in the dark branch: the
 * wrong knock put it out. Returns its light, or null when it is out.
 */
function candle(kit: LevelKit, ctx: SceneContext, arrival: Arrival): LightBuilder | null {
  kit.cylinder({ r: 0.022, h: 0.09, sides: 6 }).color(0xd8d0b8).at(CANDLE.x, CANDLE.y, CANDLE.z);
  if (arrival === 'dark') return null;
  kit.use((k) => k.world.sounds.track(candleFlutter(ctx.audio, { x: CANDLE.x, y: CANDLE.y + 0.1, z: CANDLE.z })));
  kit.box({ w: 0.012, h: 0.03, d: 0.012 }).unlit().color(0xffd070).at(CANDLE.x, CANDLE.y + 0.09, CANDLE.z);
  kit.glow(0.35, 0xffb860).at(CANDLE.x, CANDLE.y + 0.11, CANDLE.z);
  return kit.light({ color: 0xffa858, intensity: 1.7, range: 6.5 }).flicker(0.35).at(CANDLE.x, CANDLE.y + 0.25, CANDLE.z);
}

/**
 * The steel door at the back and 25 m of low pipe, water underfoot, iron rungs up to the
 * hatch. The player goes through crouched. It opens once Marc has told them to go.
 */
function tunnel(kit: LevelKit, ctx: SceneContext): () => void {
  const metMarc = () => ctx.state.hasFlag('met_marc');
  // Shut on every visit, even after the monologue: the player opens it themselves.
  let open = false;
  let swing = 0;
  let closing = false;
  const leaf = kit
    .group((g) => g.box({ w: 0.06, h: 1.5, d: 0.8 }).texture('bunker_door', { tile: [0.8, 1.5] }).color(0x6a6c66).at(0, 0, 0.4))
    .at(6.15, 0, -0.4);
  updates.push(movingBlocker(() => (open ? null : { kind: 'box', x: 6.3, z: 0, hw: 0.2, hd: 0.45, angle: 0 })));
  kit
    .hotspot({
      prompt: 'Open the door',
      radius: 0.4,
      enabled: () => !open,
      onInteract: () => {
        if (!metMarc()) return ctx.say('Not yet.');
        open = true;
      },
    })
    .at(5.85, 0, 0);
  updates.push((dt) => {
    swing = closing ? Math.max(0, swing - dt / 0.6) : open ? Math.min(1, swing + dt / 1.5) : swing;
    (leaf.object as Group).rotation.y = (-85 * swing * Math.PI) / 180;
  });


  const length = TUNNEL.x1 - TUNNEL.x0;
  const mid = (TUNNEL.x0 + TUNNEL.x1) / 2;
  const pipe = insideOut(new CylinderGeometry(TUNNEL.r, TUNNEL.r, length, 10, Math.ceil(length / 0.8), true).rotateZ(Math.PI / 2));
  kit.mesh(pipe).texture('concrete_bunker', { tile: 1.4 }).color(0x6e6c64).at(mid, TUNNEL.r, 0);
  kit.plane({ w: length, d: 0.9, cell: 0.8 }).texture('concrete_floor', { tile: 1.5 }).color(0x2a2c2a).emissive(0x030404).at(mid, 0.06, 0);
  kit.barrier({ w: length, d: 0.2 }).at(mid, 0, -0.6);
  kit.barrier({ w: length, d: 0.2 }).at(mid, 0, 0.6);
  kit.box({ w: 0.1, h: 1.6, d: 1.6 }).texture('concrete_bunker', { tile: 1 }).color(0x5a5852).at(TUNNEL.x1 + 0.05, 0, 0).collider();
  [0.35, 0.65, 0.95, 1.25].forEach((y) => kit.box({ w: 0.05, h: 0.03, d: 0.4 }).texture('rust_metal').color(0x5a4a3a).at(TUNNEL.x1 - 0.06, y, 0));
  kit.box({ w: 0.6, h: 0.04, d: 0.6 }).texture('rust_metal', { tile: 0.6 }).color(0x4a4038).at(TUNNEL.x1 - 0.35, 1.46, 0);
  kit
    .hotspot({
      prompt: 'Climb the rungs',
      radius: 0.4,
      onInteract: () => {
        hatchWheel(ctx.audio, { x: TUNNEL.x1, y: 1.4, z: 0 });
        ctx.goTo('bunker_exterior', 'from_hatch');
        // First light: the walk down through the forest is by day.
        ctx.state.time = 'day';
      },
    })
    .at(TUNNEL.x1 - 0.5, 0, 0);

  // Low enough that the player has to crouch; the pipe forces it.
  updates.push((_dt, c) => {
    c.player.crouched = c.player.position.x > 6.4;
  });
  let wait = 3;
  updates.push((dt, c) => {
    wait -= dt;
    if (wait > 0 || c.player.position.x < 6) return;
    wait = 2 + Math.random() * 3;
    drip(c.audio, { x: c.player.position.x + 3 + Math.random() * 6, y: 0.1, z: 0 }, 0.35);
  });
  // Water underfoot all the way.
  kit.use((k) =>
    k.later('register', () =>
      k.scene.player.events.on('footstep', () => {
        const p = ctx.player.position;
        if (p.x > TUNNEL.x0) splash(ctx.audio, { x: p.x, y: 0.05, z: p.z }, 0.35);
      }),
    ),
  );
  return () => {
    closing = true;
    open = false;
    steelDoorShut(ctx.audio, { x: 6.2, y: 0.8, z: 0 });
  };
}

/** The way back to the dormitory, closed until Marc has been met. */
function leaveByTheDoor(kit: LevelKit, ctx: SceneContext): void {
  const metMarc = () => ctx.state.hasFlag('met_marc');
  // The K.P. 3 door stands open against the wall, the way it swung in.
  kit.group((g) => g.box({ w: 0.06, h: 2, d: 0.9 }).texture('bunker_door', { tile: [0.9, 2] }).color(0x7a7c78).at(0, 0, 0.45)).at(0.03, 0, 0.45).rotY(85);
  updates.push(movingBlocker(() => (metMarc() ? null : { kind: 'box', x: -0.3, z: 0, hw: 0.3, hd: 0.45, angle: 0 })));
  kit
    .trigger({ w: 0.6, d: 0.9 })
    .at(-1.05, 0, 0)
    .onEnter(() => ctx.goTo('bunker_interior', 'from_hidden_room'));
}

/**
 * The room's beats: jumpscare 3, and in the tunnel, a third of the way along, the steel door at
 * the back pulled shut behind the reporter, then nothing. Only forward now.
 */
const roomBeats = (shutTheDoor: () => void): Beat[] => [
  {
    id: 'bun3_doorway',
    when: { after: Number.POSITIVE_INFINITY },
    do: [{ stinger: 'sfx_breath_mask', at: { x: markers.bun3_doorway.x, z: markers.bun3_doorway.z } }],
  },
  {
    id: 'dawn_tunnel_door',
    when: { enter: { x: TUNNEL.x0 + 14, z: 0, w: 1, d: 1.2 } },
    if: { flag: 'met_marc' },
    do: [{ run: shutTheDoor }, { silence: 14, after: 1 }],
  },
];

/**
 * Marc, masked, wherever the night has put him. Empty room: he steps into the doorway while the
 * reporter's back is turned, a candle in his hand, and is there when they turn (jumpscare 3); the
 * table candle gutters in the air he lets in (`gutter`). Dark room: he stands in the far corner
 * from the start until the torch finds him. After the monologue, and on any later visit, he sits
 * on the bed with his back to the door.
 */
function stageMarc(kit: LevelKit, ctx: SceneContext, arrival: Arrival, seen: Set<string>, scares: ScareDirector, gutter: () => void): void {
  const marc = kit.npc('marc');
  if (arrival === 'after') return sitOnTheBed(marc, { instantly: true });
  const talk = (id: NodeId) => playNode(ctx, id).then(() => walkToTheBed(marc));

  if (arrival === 'dark') {
    const { x, z, yaw } = markers.marc_dark_corner;
    marc.at(x, 0, z).faceYaw(yaw);
    let fired = false;
    updates.push((_dt, c) => {
      if (fired || c.paused || !facing(c, x, z, 12) || distance(c, x, z) > 7) return;
      fired = true;
      void talk('marc_dark_room');
    });
    return;
  }

  // After three objects or 90 seconds he comes back. He steps in only while he is behind the
  // reporter, and the hit comes when they turn and see him.
  const { x, z, yaw } = markers.bun3_doorway;
  marc.at(x, 0, z).faceYaw(yaw).holdCandle();
  marc.object.visible = false;
  let elapsed = 0;
  let stage: 'waiting' | 'there' | 'met' = 'waiting';
  updates.push((dt, c) => {
    if (stage === 'met' || c.paused) return;
    elapsed += dt;
    if (seen.size < 3 && elapsed < 90) return;
    if (stage === 'waiting') {
      if (facing(c, x, z, 70)) return;
      stage = 'there';
      marc.object.visible = true;
      gutter();
      return;
    }
    if (!facing(c, x, z, 30) || distance(c, x, z) < 1.6) return;
    stage = 'met';
    scares.fire('bun3_doorway');
    setTimeout(() => void talk('marc_doorway'), 1000);
  });
}

/** He walks to the bed when he has said goodbye, and sits. */
function walkToTheBed(marc: NpcBuilder): void {
  const { x, z } = markers.marc_on_bed;
  void marc.character.walk([{ x: x - 1.2, z: z - 1.1 }, { x, z }]).then(() => sitOnTheBed(marc));
}

/**
 * On the edge of the blanket, his back to the door, hands on his knees (05-forest-bunker.md).
 * He stands on the bed's walkable top, so the seat is where he stands.
 */
function sitOnTheBed(marc: NpcBuilder, { instantly = false } = {}): void {
  const { x, z, yaw } = markers.marc_on_bed;
  marc.character.position.set(x, BED.top, z);
  marc.faceYaw(yaw);
  marc.character.sit(0, { instantly });
}

const distance = (ctx: SceneContext, x: number, z: number) => Math.hypot(x - ctx.player.position.x, z - ctx.player.position.z);

function facing(ctx: SceneContext, x: number, z: number, coneDeg: number): boolean {
  const forward = ctx.player.forward();
  const dx = x - ctx.player.position.x;
  const dz = z - ctx.player.position.z;
  const length = Math.hypot(dx, dz) || 1;
  return (forward.x * dx + forward.z * dz) / length > Math.cos((coneDeg * Math.PI) / 180);
}

export const scenes = [bunkerHiddenScene];
