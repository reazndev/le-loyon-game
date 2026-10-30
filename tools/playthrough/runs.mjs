import { afterTheNextRound, atGrave, climbOut, DIG_SPEED, HOLE, holdAtGrave, inHole, torchOff, whenRaymondIsGone } from './grave.mjs';
import { StageError } from './session.mjs';
import {
  downToInn,
  exits,
  fortToInn,
  INN_FRONT_DOOR,
  intoChurch,
  intoInn,
  outOfChurch,
  outOfInn,
  sleep,
  upToCemetery,
  upToFort,
  walk,
} from './travel.mjs';

/**
 * The stages of each run. A stage plays one step of docs/script/00-overview.md, then the runner
 * checks its `flags`, `items`, and `counts` and saves its `shot` as docs/screenshots/flow-<shot>.png.
 * Shared stages are written once and listed in every run that passes through them.
 */

const title = {
  name: 'title',
  shot: '01-title',
  async play(s) {
    await s.until(() => window.__game.modal() === 'screen', 'the title screen');
    await s.frames(60);
  },
};

const prologue = {
  name: 'prologue',
  flags: ['pro_read_thread_bus', 'pro_read_homepage', 'pro_read_guestbook', 'pro_done'],
  items: ['notebook', 'polaroid_camera'],
  async play(s) {
    // "New game" is the first entry of the title menu.
    await s.key('KeyE');
    await s.inScene('home');
    // Keyboard only, as a new player would: the desktop focuses Courrier, which dials up first.
    await s.until(() => window.__desktop?.root.classList.contains('on'), 'the desktop', { timeout: 20_000 });
    await s.shot('02-home');
    await s.key('KeyE');
    await s.until(() => window.__desktop.focus.current?.textContent === 'Connect', 'the dial-up window');
    await s.key('KeyE');
    await s.until(() => window.__game.state().flags.includes('pro_read_mail'), "Ruth's mail", { timeout: 60_000 });
    // Back closes Courrier. Navigator is the next icon down, and it opens on the board.
    await s.key('Escape');
    await s.key('ArrowDown');
    // Presses interact and waits for the page it opens to arrive; a cached page arrives at once.
    const openFocused = async () => {
      await s.eval(() => (window.__lastPage = window.__desktop.browser.page));
      await s.key('KeyE');
      await s.until(
        () => {
          const { browser } = window.__desktop;
          return browser.page && browser.page !== window.__lastPage && !browser.loading && browser.pane.content.style.clipPath === '';
        },
        'the page to arrive',
        { timeout: 60_000 },
      );
    };
    // Down steps from link to link and scrolls through the text between them.
    const downUntil = async (done, what, arg) => {
      for (let i = 0; !(await s.eval(done, arg)); i++) {
        if (i > 80) throw new StageError(`Pressed down 80 times without reaching ${what}`);
        await s.key('ArrowDown', 8);
      }
    };
    const open = async (text, flag) => {
      await downUntil((t) => window.__desktop.focus.current?.textContent?.includes(t), `the link "${text}"`, text);
      await openFocused();
      if (flag) await s.until((f) => window.__game.state().flags.includes(f), flag, { timeout: 60_000, arg: flag });
    };
    await openFocused();
    // P1: the bus times in a reply on the board, Stef's Le Loyon page, and yann in the guestbook.
    await open('GAS MASK MAN');
    await downUntil(() => window.__game.state().flags.includes('pro_read_thread_bus'), 'the reply about the bus');
    await open('Back to index');
    await open('Links');
    await open("Stef's page");
    await open('LE LOYON', 'pro_read_homepage');
    await open('Guestbook', 'pro_read_guestbook');
    await s.shot('03-guestbook');
    // The third clue: the reporter knows where to go, over the desktop.
    await s.awaitTalk('the reporter placing the village');
    // The Start menu opens from the keyboard; its last entry is Pack and go.
    await s.key('Tab');
    await s.key('ArrowUp');
    await s.until(() => window.__desktop.focus.current?.textContent === 'Pack and go', 'Pack and go');
    await s.key('KeyE');
    await s.inScene('village_square', 60_000);
  },
};

const arrival = {
  name: 'arrival',
  flags: ['arrived'],
  counts: { day: 1, night: 0 },
  async play(s) {
    // The driver speaks a second after the bus stops.
    await s.until(() => window.__game.modal() === 'dialogue', "the driver's lines");
    await s.shot('04-arrival');
    await s.talk('Is it always this foggy?');
  },
};

const checkIn = {
  name: 'check_in',
  flags: ['inn_checked_in'],
  items: ['inn_room_key'],
  async play(s) {
    await intoInn(s);
    await s.talkTo('monique', 'What brings people', 'Le Loyon');
    await outOfInn(s);
  },
};

const abbe = {
  name: 'abbe',
  flags: ['abbe_met', 'abbe_told_graves'],
  async play(s) {
    await intoChurch(s);
    await s.use('Talk', { near: await s.character('overney') });
    await s.until(() => window.__game.modal() === 'dialogue', 'the abbé');
    await s.shot('05-abbe');
    await s.talk('Le Loyon', 'Why the cemetery?', 'Please.', 'burial records');
    await outOfChurch(s);
  },
};

const dinnerOne = {
  name: 'dinner_1',
  shot: '06-dinner-1',
  flags: ['dinner_day1'],
  items: ['flashlight'],
  counts: { night: 1 },
  async play(s) {
    await intoInn(s);
    await s.talkTo('monique', 'Is it safe');
    // Supper starts night 1: the inn reloads closed for the night.
    await s.until(() => window.__game.state().time === 'night', 'night 1');
    await s.inScene('inn');
  },
};

/** Grave hotspots stand 0.6 m in front of each stone. */
const graves = {
  menoud: { x: -3, z: 4.6 },
  gremaud: { x: -12.6, z: -0.4 },
  chassot: { x: -17.2, z: -10.4 },
  misc3: { x: 3, z: -0.4 },
};

/** Where the figure stands on night 1, against the back wall beside the Chassot plot. */
const SIGHTING = { x: -14.5, z: -11.8 };

async function readGrave(s, at) {
  await s.use('Read the stone', { near: at });
  await s.talk();
}

const nightOneCemetery = {
  name: 'night_1_cemetery',
  flags: ['read_grave_menoud', 'read_grave_gremaud', 'read_grave_chassot', 'met_raymond', 'first_sighting'],
  async play(s) {
    await outOfInn(s);
    await upToCemetery(s);
    await readGrave(s, graves.menoud);
    await readGrave(s, graves.gremaud);
    await readGrave(s, graves.chassot);
    // Jumpscare 1: after 45 s of silence, Bari barks behind a reporter reading a grave away from the gate.
    await s.eval(() => window.__game.setSpeed(3));
    await s.seconds(16);
    await s.eval(() => window.__game.setSpeed(1));
    await s.teleport(graves.misc3.x, graves.misc3.z + 2.5, 0);
    await readGrave(s, graves.misc3);
    await s.awaitTalk('Raymond and Bari');
    // He goes back down the hill; then the figure stands at the back wall by the Chassot plot.
    await s.eval(() => window.__game.setSpeed(3));
    await s.until(() => window.__game.characters().some((c) => c.id === 'marc' && c.visible), 'the figure at the back wall', { timeout: 60_000 });
    await s.eval(() => window.__game.setSpeed(1));
    await s.teleport(SIGHTING.x + 3.4, SIGHTING.z + 6.2, 31);
    await s.frames(30);
    await s.shot('07-first-sighting');
    // Walking up to it turns it away through the back gate. The reporter's own reaction sets first_sighting.
    await s.teleport(SIGHTING.x + 1.4, SIGHTING.z + 2.4, 31);
    await s.awaitTalk('the reporter at the back wall');
  },
};

const nightOneForest = {
  name: 'night_1_forest',
  shot: '08-wedged-door',
  flags: ['found_bunker', 'bunker_door_wedged'],
  async play(s) {
    // It goes out by the back gate, which creaks open behind it.
    await s.teleport(-10, -8, 30);
    await s.until(() => !window.__game.hotspots().some((h) => h.prompt === 'Open the gate'), 'the back gate to open', { timeout: 30_000 }).catch(() => s.use('Open the gate'));
    await walk(s, exits.cemeteryToForest);
    await walk(s, exits.forestToFort);
    await s.use('Turn the wheel');
    await s.talk();
  },
};

const sleepOne = {
  name: 'sleep_1',
  shot: '09-day-2',
  counts: { day: 2, night: 0 },
  async play(s) {
    await walk(s, exits.fortToForest);
    await walk(s, exits.forestToCemetery);
    await downToInn(s);
    await sleep(s, 2);
  },
};

const register = {
  name: 'day_2_register',
  flags: ['read_register', 'abbe_seal_hint'],
  async play(s) {
    await s.use('Go out', { near: { x: 2.6, z: 4 } });
    await s.inScene('village_square');
    await intoChurch(s);
    await s.talkTo('overney');
    // P2: the 1995 burials, where the syndic handed over a sealed coffin.
    await s.use('Read the registers');
    await s.until(() => window.__game.modal() === 'dialogue', 'the register shelf');
    await s.key('KeyE');
    await s.key('KeyE');
    await s.until(() => window.__game.modal() === 'document', 'the 1995 burials');
    await s.shot('10-register');
    await s.talk('Close the cupboard.');
    // Coming out of the sacristy, the abbé speaks about the seal of confession.
    await s.teleport(-2.4, -15.6, 180);
    await s.seconds(4);
    if (!(await s.state()).flags.includes('abbe_seal_hint')) await s.talkTo('overney');
    await s.talk();
    await outOfChurch(s);
  },
};

const odile = {
  name: 'day_2_odile',
  flags: ['odile_talked'],
  items: ['gremaud_diary'],
  async play(s) {
    await walk(s, exits.squareToGremaud);
    await s.use('Ring the bell');
    await s.awaitTalk('Odile at the door');
    await s.inScene('house_gremaud_kitchen');
    // She picks up at odile_talk_2 a second after the reporter comes in.
    await s.until(() => window.__game.modal() === 'dialogue', "Odile in her kitchen");
    const step = await s.eval(() => window.__game.dialogue());
    if (!step.text.startsWith('They all want to know')) throw new StageError(`The kitchen opened on "${step.text}", not odile_talk_2`);
    await s.shot('11-odile');
    await s.talk('What happened that night?', 'Do you think');
    await s.use('Go out');
    await s.inScene('house_gremaud');
    await walk(s, exits.gremaudToSquare);
  },
};

const heifer = {
  name: 'day_2_heifer',
  flags: ['heifer_found', 'heifer_returned', 'bernard_light_coffin'],
  items: ['shovel'],
  async play(s) {
    await walk(s, exits.squareToYerly);
    // P3: Marquise at the forest edge above the field. Walking up to her makes her follow.
    await s.teleport(-59, -8, 90);
    await s.until(() => window.__game.state().flags.includes('heifer_found'), 'Marquise to notice the reporter');
    await s.shot('12-heifer');
    await s.teleport(-50, -6, -90);
    await s.seconds(3);
    await s.talkTo('bernard', 'At the forest edge', 'You carried his coffin');
    if (!(await s.state()).inventory.includes('shovel')) await s.talkTo('bernard');
    await walk(s, exits.yerlyToSquare);
  },
};

/** In the dormitory, facing the K.P. 3 door once the cupboard has rolled clear of it. */
const HIDDEN_DOOR_VIEW = { x: 9.4, z: -30.8, yaw: -84 };

const hiddenDoor = {
  name: 'day_2_hidden_door',
  flags: ['bunker_door_open', 'looked_at_dust', 'found_hidden_door', 'found_biscuit_wrapper'],
  async play(s) {
    await upToFort(s);
    await s.use('Go inside');
    await s.talk();
    await s.inScene('bunker_interior');
    // P4: the scrapes beside the cupboard lead down to the swept quarter circle, then it rolls aside.
    await s.use('Look at the cupboard');
    await s.talk();
    await s.use('Push the cupboard');
    await s.talk();
    await s.use('Look at the wrapper');
    await s.talk();
    await s.teleport(HIDDEN_DOOR_VIEW.x, HIDDEN_DOOR_VIEW.z, HIDDEN_DOOR_VIEW.yaw);
    await s.until(() => window.__game.hotspots().some((h) => h.prompt === 'Push the cupboard back'), 'the cupboard to roll clear');
    await s.frames(20);
    await s.shot('13-hidden-door');
    await walk(s, exits.fortInsideToOutside);
    await fortToInn(s);
  },
};

const dinnerTwo = {
  name: 'dinner_2',
  flags: ['dinner_day2'],
  counts: { night: 2 },
  async play(s) {
    await s.talkTo('monique');
    await s.until(() => window.__game.state().time === 'night', 'night 2');
    await s.inScene('inn');
  },
};

const dig = {
  name: 'night_2_dig',
  flags: ['opened_coffin', 'read_gremaud_letter'],
  items: ['bunker_key', 'gremaud_letter', 'legion_tag', 'photo_empty_coffin'],
  counts: { dig_stage: 5 },
  async play(s) {
    await outOfInn(s);
    await upToCemetery(s);
    const saved = await s.eval(() => JSON.parse(localStorage.getItem('le-loyon.save.sleep') ?? 'null'));
    if (saved?.counts?.night !== 2) throw new StageError('Setting out on night 2 wrote no sleep save');
    await torchOff(s);
    await s.eval((speed) => window.__game.setSpeed(speed), DIG_SPEED);
    await holdAtGrave(s, 'Dig', () => (window.__game.state().counts.dig_stage ?? 0) >= 5, 'five stages of digging');
    await afterTheNextRound(s);
    await s.eval(() => window.__game.setSpeed(1));
    if (!(await inHole(s))) {
      await s.use('Climb down', { near: HOLE });
      await s.until(() => window.__game.pose().y < -1 && !window.__game.game.ui.open, 'climbing into the hole');
    }
    await atGrave(s, 'Look at the lid');
    await s.talk('Lift the lid.');
    await s.photograph('photo_empty_coffin');
    await s.shot('14-empty-coffin');
    await atGrave(s, 'Take the box');
    await s.talk();
    // Out of the hole with the box the reporter says this, either as the climb ends or just after.
    const after = 'I should put this back the way it was.';
    await climbOut(s);
    if (!s.heard.has(after)) await s.awaitTalk('the reporter looking at the open grave');
    if (!s.heard.has(after)) throw new StageError(`Climbing out with the box never played "${after}"`);
    if ((await s.state()).flags.includes('caught')) throw new StageError('Raymond caught the reporter at the open coffin');
  },
};

const refill = {
  name: 'night_2_refill',
  flags: ['grave_refilled'],
  counts: { refill_stage: 3 },
  async play(s) {
    await torchOff(s);
    await s.eval((speed) => window.__game.setSpeed(speed), DIG_SPEED);
    await holdAtGrave(s, 'Fill in the grave', () => window.__game.state().flags.includes('grave_refilled'), 'three stages of refilling');
    // His round comes in by the front gate, so the reporter leaves between rounds.
    await whenRaymondIsGone(s);
    await s.eval(() => window.__game.setSpeed(1));
    await downToInn(s);
    await sleep(s, 3);
  },
};

/** The other way out of night 2: the grave stays open, and Raymond finds it at dawn. */
const leaveOpen = {
  name: 'night_2_leave_open',
  flags: ['grave_left_open'],
  async play(s) {
    await s.eval((speed) => window.__game.setSpeed(speed), DIG_SPEED);
    await whenRaymondIsGone(s);
    await s.eval(() => window.__game.setSpeed(1));
    await s.teleport(0, 15, 180);
    await s.hold('ArrowUp', () => window.__game.modal() !== null, { timeout: 10_000 });
    await s.talk('Go anyway.');
    await s.inScene('cemetery_path');
    await walk(s, exits.pathToSquare);
    await intoInn(s);
    await sleep(s, 3);
  },
};

/** Where Yannick sits in the stübli on the third evening, behind the reporter at the computer. */
const YANNICK = { x: -6.8, z: -0.24 };

const dayThreeMorning = {
  name: 'day_3_morning',
  flags: ['editor_called', 'abbe_day3'],
  items: ['food_parcel'],
  async play(s) {
    await s.talkTo('monique', 'bread and cheese');
    // The editor rings at noon, a few seconds after the reporter comes back in from the square.
    await s.use('Go out', { near: INN_FRONT_DOOR });
    await s.inScene('village_square');
    await intoInn(s);
    await s.use('Answer the phone', { timeout: 30_000 });
    await s.until(() => window.__game.modal() === 'dialogue', 'the editor');
    await s.shot('15-editor-call');
    await s.talk("There's something here.");
    await s.use('Go out', { near: INN_FRONT_DOOR });
    await s.inScene('village_square');
    await intoChurch(s);
    await s.talkTo('overney');
    await outOfChurch(s);
  },
};

const forestGrave = {
  name: 'day_3_forest_grave',
  flags: ['found_forest_grave'],
  async play(s) {
    await upToFort(s);
    await s.use('Push through to the larch');
    await s.inScene('forest_deep');
    await s.use('Look at the cross');
    await s.talk();
    await s.shot('16-forest-grave');
    await walk(s, exits.larchToFort);
    await fortToInn(s);
  },
};

const veilleur = {
  name: 'day_3_veilleur',
  flags: ['forum_seen_5', 'met_veilleur'],
  counts: { night: 3 },
  async play(s) {
    // The third evening: the café is dark and the board at stage 5 has a post called "you".
    await s.use('Use the computer');
    // Links can be clicked once the page has dropped in, which is when the board marks the stage seen.
    await s.until(() => window.__game.state().flags.includes('forum_seen_5'), 'the stage 5 board', { timeout: 90_000 });
    await s.page.locator('.pc a[href*="503"]').first().click();
    await s.seconds(3);
    // Back closes the windows, then stands the reporter up.
    while ((await s.eval(() => window.__game.modal())) === 'screen') await s.key('Escape', 10);
    await s.eval((seat) => {
      const p = window.__game.pose();
      window.__game.teleport(p.x, p.y, p.z, (Math.atan2(-(seat.x - p.x), -(seat.z - p.z)) * 180) / Math.PI);
    }, YANNICK);
    await s.awaitTalk('Yannick behind the reporter');
    await s.until(() => window.__game.state().time === 'night', 'night 3');
    await s.inScene('inn');
    await s.shot('17-veilleur');
  },
};

/** The day 3 morning after leaving the grave open: Monique won't pack food, so Christine is the only bread. */
const dayThreeMorningCold = {
  name: 'day_3_morning_cold',
  flags: ['editor_called', 'grave_left_open'],
  async play(s) {
    await s.talkTo('monique');
    await s.use('Go out', { near: INN_FRONT_DOOR });
    await s.inScene('village_square');
    await intoInn(s);
    await s.use('Answer the phone', { timeout: 30_000 });
    await s.awaitTalk('the editor', "I don't know yet.");
    await s.use('Go out', { near: INN_FRONT_DOOR });
    await s.inScene('village_square');
  },
};

/** From the inn at night to the K.P. 3 door in the dormitory, with the key. */
async function toTheSteelDoor(s) {
  await s.use('Go out', { near: INN_FRONT_DOOR });
  await s.inScene('village_square');
  await upToFort(s);
  await s.use('Go inside');
  await s.talk();
  await s.inScene('bunker_interior');
  await s.until(() => window.__game.hotspots().some((h) => h.prompt === 'Knock'), 'the K.P. 3 door');
}

/** Marc's room after the monologue: his notebook, then out by the tunnel to the hatch at dawn. */
async function outByTheTunnel(s) {
  await s.use('Read the notebook');
  await s.talk();
  // The steel door at the back is shut until the reporter opens it.
  await s.use('Open the door', { near: { x: 5.85, z: 0 } });
  await s.frames(60);
  await s.use('Climb the rungs', { timeout: 10_000 });
  await s.inScene('bunker_exterior');
}

const knock = {
  name: 'night_3_knock',
  flags: ['knock_pattern_done', 'met_marc', 'marc_named', 'marc_photo_consent', 'read_marc_notebook'],
  items: ['ring', 'photo_marc_masked'],
  async play(s) {
    await toTheSteelDoor(s);
    // P6: "Knock three times, wait, then once."
    await s.use('Knock');
    await s.seconds(0.6);
    await s.key('KeyE');
    await s.seconds(0.6);
    await s.key('KeyE');
    await s.seconds(2.8);
    await s.key('KeyE');
    await s.awaitTalk('his voice through the steel', 'I read his letter', 'I brought bread', 'I believe you.', 'May I take your picture?', "I'll take it to her.");
    // The door is open; through it is his room.
    await s.hold('ArrowUp', () => window.__game.game.scenes.busy || window.__game.state().scene === 'bunker_hidden', { timeout: 15_000 }).catch(() => undefined);
    if ((await s.state()).scene !== 'bunker_hidden') await s.walkOut(13.3, -31, -90, 'bunker_hidden');
    await s.inScene('bunker_hidden');
    await s.frames(30);
    await s.shot('18-hidden-room');
    await outByTheTunnel(s);
  },
};

const noKnock = {
  name: 'night_3_key',
  flags: ['entered_hidden_room', 'met_marc'],
  async play(s) {
    await toTheSteelDoor(s);
    await s.use('Use the key');
    await s.talk();
    await s.inScene('bunker_hidden');
    // He comes back while the reporter looks at his things with the door behind them (jumpscare 3).
    for (const thing of ['Look at the bed', 'Look at the cap', 'Look at the map']) {
      await s.use(thing);
      await s.talk();
    }
    await s.teleport(3, 0, -90);
    await s.seconds(2);
    await s.teleport(3, 0, 90);
    await s.until(() => window.__game.modal() === 'dialogue', 'Marc in the doorway', { timeout: 20_000 });
    await s.shot('19-marc-doorway');
    await s.talk('Who are you?', 'Raise the camera without asking');
    await outByTheTunnel(s);
  },
};

/** Down through the forest at first light, the date card, the piece written out in room 3. */
const dawn = {
  name: 'dawn',
  counts: { day: 4, night: 0 },
  async play(s) {
    await fortToInn(s);
    await s.awaitTalk('the piece written out in room 3');
    await s.shot('20-dawn');
  },
};

/** The phone in the stübli, the editor, and the ending's pages, epilogue, and last screen. */
function phoneIn(ending, picks, shot) {
  return {
    name: `phone_${ending}`,
    flags: [`ending_${ending}`],
    async play(s) {
      await s.use('Lift the phone');
      await s.talk(...picks);
      await endingScreens(s, shot);
    },
  };
}

/** Saves the first ending page, then confirms each screen until the game is back at the title. */
async function endingScreens(s, shot) {
  await s.until(() => window.__game.modal() === 'screen', 'the ending screens');
  await s.seconds(2);
  await s.shot(shot);
  const flags = (await s.state()).flags;
  const reloaded = s.page.waitForEvent('framenavigated', { timeout: 120_000 });
  const pressing = (async () => {
    for (let done = false; !done; ) done = await s.key('KeyE', 30).then(() => false, () => true);
  })();
  await reloaded;
  await pressing.catch(() => undefined);
  await s.until(() => window.__game?.ready === true && window.__game.modal() === 'screen', 'the title screen after the ending', { timeout: 60_000 });
  // The reload clears the game; hand the stage check the flags the ending set.
  s.endState = flags;
}

/** Day 1 evening at the bus stop: the last bus, the driver, and the ride home without turning round. */
const leave = {
  name: 'leave',
  flags: ['ending_leave'],
  async play(s) {
    await s.use('Read the timetable');
    await s.talk('Wait for the bus and go home.', 'Go home.');
    await s.awaitTalk('the driver', 'No.');
    await s.awaitTalk('the ride home');
    await endingScreens(s, '23-ending-leave');
  },
};

/**
 * Night 2 set up through the debug URL and `window.__game`: the reporter has the shovel and
 * Monique's torch, and supper is over.
 */
const nightTwoSetUp = {
  name: 'night_2_set_up',
  counts: { day: 2, night: 2 },
  items: ['shovel', 'flashlight'],
  async play(s) {
    const flags = [
      'pro_done', 'arrived', 'inn_checked_in', 'abbe_met', 'abbe_told_graves', 'dinner_day1', 'met_raymond', 'first_sighting',
      'found_bunker', 'bunker_door_wedged', 'read_register', 'odile_talked', 'heifer_found', 'heifer_returned', 'bernard_light_coffin', 'dinner_day2',
    ];
    await s.page.goto(`${new URL(s.page.url()).origin}/?scene=inn&time=night&day=2&night=2&flags=${flags.join(',')}`);
    await s.until(() => window.__game?.ready === true, 'the inn on night 2', { timeout: 60_000 });
    await s.eval(() => ['notebook', 'polaroid_camera', 'inn_room_key', 'flashlight', 'gremaud_diary', 'shovel'].forEach((item) => window.__game.game.state.giveItem(item)));
    await s.idle();
  },
};

/** Digging with the torch on while Raymond comes up the hill: "Bouge pas!", the caught text, and back to the last save. */
const caught = {
  name: 'caught',
  counts: { night: 2, dig_stage: 0 },
  async play(s) {
    await outOfInn(s);
    await upToCemetery(s);
    await s.eval((speed) => window.__game.setSpeed(speed), DIG_SPEED);
    await s.use('Dig', { near: HOLE });
    await s.talk('Dig.');
    await s.hold('KeyE', () => window.__game.modal() !== null, { timeout: 120_000 });
    await s.eval(() => window.__game.setSpeed(1));
    if ((await s.eval(() => window.__game.dialogue()?.text)) !== "Bouge pas! {{Don't move!}}") await s.talk();
    await s.until(() => window.__game.state().flags.includes('caught'), 'Raymond to catch the reporter', { timeout: 120_000 });
    await s.talk();
    await s.until(() => document.body.innerText.includes('Continue from the last sleep'), 'the caught screen');
    await s.seconds(3);
    await s.shot('24-caught');
    await s.key('KeyE');
    // "Continue from the last sleep" loads the save made when the reporter set out on night 2.
    await s.inScene('cemetery_path');
    const state = await s.state();
    if (state.flags.includes('caught')) throw new StageError('The caught flag survived loading the last sleep');
  },
};

export const runs = {
  publish: [title, prologue, arrival, checkIn, abbe, dinnerOne, nightOneCemetery, nightOneForest, sleepOne, register, odile, heifer, hiddenDoor, dinnerTwo, dig, refill, dayThreeMorning, forestGrave, veilleur, knock, dawn,
    phoneIn('publish', ["I've got him", 'Read it to her.'], '21-ending-publish')],
  secret: [title, prologue, arrival, checkIn, abbe, dinnerOne, nightOneCemetery, nightOneForest, sleepOne, register, odile, heifer, hiddenDoor,
    dinnerTwo, dig, leaveOpen, dayThreeMorningCold, forestGrave, veilleur, noKnock, dawn,
    phoneIn('secret', ["There's nothing here", 'Tell her.'], '22-ending-secret')],
  leave: [title, prologue, arrival, checkIn, abbe, leave],
  caught: [title, nightTwoSetUp, caught],
};
