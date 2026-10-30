import { describe, expect, it } from 'vitest';
import { looks } from './looks';

describe('kitchen looks', () => {
  it('follow the writing rules: short, plain punctuation, a capital first', () => {
    Object.values(looks).forEach((line) => {
      expect(line).not.toMatch(/[—–‘’“”]/);
      expect(line).toMatch(/^[A-Z]/);
      expect(line.length).toBeLessThan(100);
    });
  });
});
