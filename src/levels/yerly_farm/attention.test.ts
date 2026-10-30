import { describe, expect, it } from 'vitest';
import { cowsLooking, dogStep, nearFor, restingDog } from './attention';

describe('dogStep', () => {
  it('lifts its head when the reporter comes in range, and says so only the first time', () => {
    const far = dogStep(restingDog, 20, 0.1, 8);
    expect(far.dog.up).toBe(false);
    const woken = dogStep(far.dog, 7, 0.1, 8);
    expect(woken).toEqual({ dog: { up: true, woke: true, away: 0 }, first: true });
    const again = dogStep({ up: false, woke: true, away: 0 }, 7, 0.1, 8);
    expect(again.dog.up).toBe(true);
    expect(again.first).toBe(false);
  });

  it('keeps watching close by and lays its head down after ten seconds out of range', () => {
    let dog = dogStep(restingDog, 5, 0.1, 8).dog;
    dog = dogStep(dog, 10, 5, 8).dog;
    expect(dog.up).toBe(true);
    expect(dog.away).toBe(0);
    dog = dogStep(dog, 30, 6, 8).dog;
    expect(dog.up).toBe(true);
    dog = dogStep(dog, 30, 6, 8).dog;
    expect(dog).toEqual({ up: false, woke: true, away: 0 });
  });
});

describe('nearFor', () => {
  it('counts up in reach and down three times as fast out of it, never below zero', () => {
    expect(nearFor(1, 3, 0.5, 8)).toBe(1.5);
    expect(nearFor(1.5, 12, 0.25, 8)).toBe(0.75);
    expect(nearFor(0.2, 12, 1, 8)).toBe(0);
  });
});

describe('cowsLooking', () => {
  it('turns the cows one by one', () => {
    expect(cowsLooking(0, [0.5, 2, 4])).toEqual([false, false, false]);
    expect(cowsLooking(2.5, [0.5, 2, 4])).toEqual([true, true, false]);
  });
});
