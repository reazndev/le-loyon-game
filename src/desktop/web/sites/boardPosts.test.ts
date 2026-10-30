import { describe, expect, it } from 'vitest';
import { GameState } from '../../../game/state';
import { flatThread, postById, posts, readingOrder, replies, rootOf, threadRoots, visiblePosts } from './boardPosts';

describe('board posts', () => {
  it('have unique ids and replies to posts of the same or an earlier stage', () => {
    expect(new Set(posts.map((p) => p.id)).size).toBe(posts.length);
    posts
      .filter((post) => post.parent !== undefined)
      .forEach((post) => expect(postById(post.parent!)!.stage).toBeLessThanOrEqual(post.stage));
  });

  it('list every visible post exactly once at each stage', () => {
    ([0, 1, 2, 3, 4, 5] as const).forEach((stage) => {
      const listed: number[] = [];
      const walk = (id: number) => {
        listed.push(id);
        replies(postById(id)!, stage).forEach((reply) => walk(reply.id));
      };
      threadRoots(stage).forEach((root) => walk(root.id));
      expect(listed.sort((a, b) => a - b)).toEqual(visiblePosts(stage).map((p) => p.id).sort((a, b) => a - b));
    });
  });

  it('puts the newest stage on top of the prologue threads', () => {
    expect(threadRoots(0)[0]!.subject).toBe('Lights over Lac de la Gruyere - FRIDAY NIGHT');
    expect(threadRoots(5)[0]!.subject).toBe('you');
  });

  it('picks variants from the flags', () => {
    const state = new GameState();
    const dig = postById(497)!;
    const text = (s: GameState) => (typeof dig.body === 'string' ? dig.body : dig.body(s));
    expect(text(state)).toContain('you put the earth back');
    state.setFlag('grave_left_open');
    expect(text(state)).toContain('you left it open');
  });

  it('stamps the last post a minute before the clock', () => {
    const post = postById(503)!;
    expect(typeof post.posted === 'function' && post.posted('19:20')).toBe('November 19, 1998 at 19:19:37');
  });

  it('gives the bus times in the post that solves part of P1', () => {
    const bus = posts.find((post) => post.reads === 'pro_read_thread_bus')!;
    expect(bus.body).toContain('18:52');
  });

  it('reads a thread flat, each reply under the post it answers', () => {
    const gasMask = threadRoots(0).find((post) => post.subject.startsWith('GAS MASK MAN'))!;
    const thread = flatThread(gasMask, 0);
    const bus = thread.findIndex((post) => post.reads === 'pro_read_thread_bus');
    expect(thread[0]).toBe(gasMask);
    expect(thread[bus + 1]!.subject).toBe('Re: bus');
    expect(thread.every((post) => rootOf(post) === gasMask)).toBe(true);
  });

  it('puts every visible post once in reading order', () => {
    ([0, 5] as const).forEach((stage) => {
      const order = readingOrder(stage);
      expect(order).toHaveLength(visiblePosts(stage).length);
      expect(new Set(order).size).toBe(order.length);
    });
  });
});
