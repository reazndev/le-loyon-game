import { MathUtils } from 'three';
import { castModel, type CharacterId } from '../../engine/characters/cast';
import { Character, type WalkOptions } from '../../engine/characters/character';
import type { Waypoint } from '../../engine/characters/motion';
import { collarBell, cowbell } from '../../engine/characters/voices';
import { hashString } from '../../engine/random';
import { dialogues, type EntryId, type NodeId } from '../../content';
import type { DialogueScript } from '../dialogue';
import { Placed, type KitContext } from './builders';

/**
 * A cast member placed in the level: a villager, Le Loyon (`marc`), Bari, or Marquise. Place
 * NPCs at the top level, not inside `kit.group`, because they walk in world coordinates.
 * `.character` is the live `Character`, for scripting walks and looks in `update` or triggers.
 */
export class NpcBuilder extends Placed {
  readonly character: Character;
  private watchRadius = 0;
  private talking = false;

  constructor(ctx: KitContext, id: CharacterId) {
    const { model, turn } = castModel(id, ctx.world.textures);
    const character = new Character(model, {
      turn,
      seed: hashString(id) % 100,
      ground: (x, z) => ctx.world.ground.sample(x, z, model.root.position.y).height,
    });
    super(ctx, character.root);
    this.character = character;
    // Named by cast id, so tests can find who is on stage.
    character.root.name = id;
    if (id === 'bari') this.ringOnSteps(collarBell, 0.6);
    if (id === 'marquise') this.ringOnSteps(cowbell, 0.5);
    ctx.later('register', () =>
      ctx.world.updates.add((dt) => {
        this.watchPlayer();
        character.update(dt);
      }),
    );
  }

  /** Which way the character faces, in degrees: 0 faces -Z, 90 faces -X. */
  faceYaw(degrees: number): this {
    this.character.yaw = MathUtils.degToRad(degrees);
    return this;
  }

  /**
   * Talking plays a dialogue: a node id from the script such as `overney_meet`, a cast id for the
   * person's entry table such as `monique`, or a script. The character turns to the player.
   */
  talk(dialogue: NodeId | EntryId | DialogueScript, prompt = 'Talk'): this {
    const script = typeof dialogue === 'string' ? dialogues[dialogue] : dialogue;
    const spot = { x: 0, z: 0 };
    this.ctx.later('register', () => {
      this.ctx.world.interactions.add({
        position: spot,
        radius: 0.35,
        prompt,
        onInteract: async () => {
          this.talking = true;
          this.character.lookAt = this.ctx.scene.player.camera.position;
          this.character.turnToLook = true;
          await this.ctx.scene.dialogue(script);
          this.talking = false;
          this.character.turnToLook = false;
          this.character.lookAt = null;
        },
      });
      // The prompt follows the character as it walks.
      this.ctx.world.updates.add(() => {
        spot.x = this.character.position.x;
        spot.z = this.character.position.z;
      });
    });
    return this;
  }

  /** The head follows the player while they are within `radius` meters. */
  watch(radius = 4): this {
    this.watchRadius = radius;
    return this;
  }

  /** Walks these points. `await npc.character.walk(...)` instead to wait for the end. */
  walk(points: Waypoint[], options: WalkOptions = {}): this {
    void this.character.walk(points, options);
    return this;
  }

  /** Follows the player at about `distance` meters, like Marquise on the way home. */
  followPlayer(distance = 2.5): this {
    this.character.follow(() => this.ctx.scene.player.position, distance);
    return this;
  }

  private watchPlayer(): void {
    if (this.talking || this.watchRadius <= 0) return;
    const player = this.ctx.scene.player.position;
    const near = this.character.position.distanceTo(player) < this.watchRadius;
    this.character.lookAt = near ? this.ctx.scene.player.camera.position : null;
  }

  private ringOnSteps(ring: typeof collarBell, chance: number): void {
    this.character.events.on('step', ({ x, z }) => {
      if (Math.random() < chance) ring(this.ctx.audio, { at: { x, y: this.character.position.y + 0.5, z } });
    });
  }
}
