import { dialogues } from '../../content';
import { everyFrame, particles } from '../../game/ambient';
import { breathUrl } from '../../game/breathing';
import type { LevelKit } from '../../game/kit/levelKit';
import { scareDirector } from '../../game/scares/director';
import type { SceneContext } from '../../game/scene';
import { minetBelow } from '../chassot_farm/hatch';
import { hatchCreak, mew } from '../chassot_farm/sounds';
import { CRATE, BIN, HATCH, STEPS, STEPS_TOP } from './layout';
import { hatchSlam } from './sounds';

/**
 * The five steps up to the hatch and the daylight down them, and the hatch beat (A9): the first
 * time the reporter turns away from the steps, the hatch falls shut. The rotten stick that held
 * it lies on the steps after. Pushing the hatch from the top step goes back out to the farm.
 */

const SILENCE = 6;
/** Where Minet mews from, in his nest in the blanket. */
const NEST = { x: CRATE.x, y: 0.6, z: CRATE.z };

export function stepsAndHatch(kit: LevelKit, ctx: SceneContext): void {
  const { x, count, run, rise, half } = STEPS;
  kit.batch((still) => {
    for (let i = 0; i < count; i++) {
      still.box({ w: run, h: rise * (i + 1), d: half * 2 }).texture('stone_wall', { tile: 0.8 }).color(0x7a766e).at(x + run * (i + 0.5), 0, 0).walkable('stone');
    }
    [-1, 1].forEach((side) => still.box({ w: STEPS_TOP - x, h: 3.5, d: 0.16 }).texture('stone_wall', { tile: 1.1 }).color(0x6e6a62).at((x + STEPS_TOP) / 2, 0, side * (half + 0.08)).collider());
    still.box({ w: 0.16, h: 2.9, d: half * 2 }).texture('stone_wall', { tile: 1.1 }).color(0x6e6a62).at(STEPS_TOP + 0.08, 0, 0).collider();
  });

  const slammed = () => ctx.state.hasFlag('cel_hatch_slam');
  // Open: sky through the frame and a pale square on the steps. Shut: boards with light at the seams.
  const hatch = (build: (g: LevelKit) => void) => {
    const panel = kit.group(build).at(HATCH.x, HATCH.y, HATCH.z).dynamic();
    panel.object.rotation.z = -0.37;
    return panel;
  };
  const sky = hatch((g) => g.box({ w: 1.4, h: 0.04, d: half * 2 }).color(0xc4c8c4).unlit());
  const boards = hatch((g) => {
    g.box({ w: 1.4, h: 0.05, d: half * 2 }).texture('wood_planks', { tile: 0.8 }).color(0x3a3028);
    g.box({ w: 1.4, h: 0.04, d: 0.015 }).color(0x9a9c98).unlit().at(0, -0.02, 0);
  });
  const square = kit.plane({ w: 0.9, d: half * 2 - 0.1 }).color(0x8c908a).unlit().at(x - 0.5, 0.012, 0).dynamic();
  const daylight = kit.light({ color: 0xb8c0c4, intensity: 1.5, range: 6 }).at(x + 0.6, 2.4, 0);
  const stick = kit
    .group((g) => {
      g.box({ w: 0.5, h: 0.03, d: 0.03 }).color(0x4a3e30).at(0, 0, 0).rotY(12);
      g.box({ w: 0.42, h: 0.03, d: 0.03 }).color(0x4a3e30).at(0.1, 0, 0.12).rotY(-30);
    })
    .at(x + run * 3.5, rise * 3, half - 0.2)
    .dynamic();
  const shut = (closed: boolean) => {
    sky.object.visible = !closed;
    square.object.visible = !closed;
    boards.object.visible = closed;
    if (daylight.light) daylight.light.intensity = closed ? 0 : 1.5;
  };
  shut(false);
  stick.object.visible = slammed();

  kit
    .hotspot({ prompt: 'Look at the stick', radius: 0.45, enabled: slammed, onInteract: () => ctx.dialogue(dialogues.cellar_stick) })
    .at(x + run * 2.5, 0, half - 0.25);
  // The top step: the boards give to a push, and the farm.
  kit
    .trigger({ w: run, d: half * 2 })
    .at(STEPS_TOP - run / 2, 0, 0)
    .once()
    .onEnter(() => {
      hatchCreak(ctx.audio, HATCH);
      ctx.goTo('chassot_farm', 'from_cellar');
    });

  const dust = particles(kit, { count: 60, box: [2.5, 2, 2.5], velocity: [0, -0.5, 0], sway: [0.05, 0, 0.05], size: 0.02, shape: 'dot', color: 0xb8b0a0, opacity: 0.7, seed: 'cellar-dust' }).at(x - 1.4, 1, 0);
  dust.object.visible = false;
  const wait = (seconds: number) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  // Minet complains every so often, but keeps quiet through the silence after the slam.
  let nextMew = 4;
  everyFrame(kit, (dt) => {
    if (!minetBelow(ctx) || ctx.paused) return;
    nextMew -= dt;
    if (nextMew > 0) return;
    nextMew = 8 + Math.random() * 6;
    mew(ctx.audio, NEST, 0.45);
  });

  kit.use(
    scareDirector([
      {
        id: 'cel_hatch_slam',
        when: [{ after: 8 }, { look: { x: BIN.x, z: BIN.z, y: 0.5, angle: 40, hold: 0.5 } }],
        do: [
          {
            run: async () => {
              hatchSlam(ctx.audio, HATCH);
              nextMew = SILENCE * 2 + 6;
              shut(true);
              stick.object.visible = true;
              dust.object.visible = true;
              await wait(3);
              dust.object.visible = false;
            },
          },
          { silence: SILENCE },
          {
            after: SILENCE,
            run: async () => {
              if (minetBelow(ctx)) return mew(ctx.audio, NEST, 0.7);
              const breath = ctx.audio.play(breathUrl('tired'), { volume: 0.25, rate: 0.85 });
              await wait(5);
              breath.stop(1.5);
            },
          },
        ],
        set: 'cel_hatch_slam',
      },
    ]),
  );
}
