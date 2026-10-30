import { Vector3 } from 'three';
import type { LevelKit } from '../../game/kit/levelKit';
import { caw, flap } from './sounds';

export interface Perch {
  x: number;
  z: number;
  /** Height above the ground, such as the top of a wall. */
  y?: number;
  yaw?: number;
}

const SCARE_DISTANCE = 4.5;
const FLIGHT_SECONDS = 3;
const CAW_EVERY = 16;

/**
 * Crows by day: black shapes on walls and stones that call now and then and take off, flapping,
 * when the reporter comes close. They don't come back while the scene lasts.
 */
export function crows(kit: LevelKit, perches: Perch[]): void {
  const birds = perches.map((perch) => ({
    perch,
    placed: kit
      .group((g) => {
        g.box({ w: 0.16, h: 0.15, d: 0.3 }).color(0x111214).at(0, 0.06, 0);
        g.box({ w: 0.1, h: 0.1, d: 0.11 }).color(0x0e0f10).at(0, 0.16, -0.17);
        g.box({ w: 0.03, h: 0.03, d: 0.08 }).color(0x2a2a26).at(0, 0.17, -0.25);
        g.box({ w: 0.12, h: 0.03, d: 0.16 }).color(0x111214).at(0, 0.1, 0.2).rotY(0);
        g.box({ w: 0.02, h: 0.07, d: 0.02 }).color(0x2a2620).at(-0.04, 0, 0);
        g.box({ w: 0.02, h: 0.07, d: 0.02 }).color(0x2a2620).at(0.04, 0, 0);
      })
      .at(perch.x, perch.y ?? 0, perch.z)
      .rotY(perch.yaw ?? 0)
      .onGround(),
    flight: -1,
    heading: new Vector3(),
  }));

  kit.use((ctx) =>
    ctx.later('register', () => {
      let cawIn = 5 + Math.random() * 8;
      ctx.world.updates.add((dt) => {
        const player = ctx.scene.player.position;
        birds.forEach((bird) => {
          const object = bird.placed.object;
          if (bird.flight < 0 && object.position.distanceTo(new Vector3(player.x, object.position.y, player.z)) < SCARE_DISTANCE) {
            bird.flight = 0;
            bird.heading.set(object.position.x - player.x, 0, object.position.z - player.z).normalize();
            flap(ctx.audio, object.position);
            if (Math.random() < 0.6) caw(ctx.audio, object.position);
          }
          if (bird.flight < 0 || !object.visible) return;
          bird.flight += dt;
          object.position.addScaledVector(bird.heading, dt * 4.5);
          object.position.y += dt * (1.2 + bird.flight * 1.4);
          object.rotation.z = Math.sin(bird.flight * 30) * 0.4;
          if (bird.flight > FLIGHT_SECONDS) object.visible = false;
        });
        cawIn -= dt;
        if (cawIn > 0) return;
        cawIn = CAW_EVERY * (0.5 + Math.random());
        const sitting = birds.filter((b) => b.flight < 0);
        const from = sitting[Math.floor(Math.random() * sitting.length)]?.placed.object.position;
        // With none left close by, the call comes from somewhere off in the fog.
        caw(ctx.audio, from ?? { x: player.x + (Math.random() - 0.5) * 40, y: 6, z: player.z - 18 });
      });
    }),
  );
}
