import { describe, expect, it } from 'vitest';
import { GameState } from '../state';
import { developed, isCameraPhoto, photoCaption, resolveShot } from './photos';

const day = () => {
  const state = new GameState();
  state.setCount('day', 2);
  return state;
};

describe('resolveShot', () => {
  it('gives the photo a target names', () => {
    expect(resolveShot({ scene: 'cemetery', target: 'photo_lantern', state: day(), taken: [] })).toEqual({
      item: 'photo_lantern',
      caption: 'D.M. Who lights it?',
    });
  });

  it('gives each named photo once, then plain photos', () => {
    const shot = resolveShot({ scene: 'cemetery', target: 'photo_lantern', state: day(), taken: ['photo_lantern'] });
    expect(shot).toEqual({ item: 'photo_misc_1', caption: 'Leurs, November 98' });
  });

  it('numbers plain photos', () => {
    const shot = resolveShot({ scene: 'village_square', state: day(), taken: ['photo_misc_1', 'photo_lantern', 'photo_misc_2'] });
    expect(shot.item).toBe('photo_misc_3');
  });

  it('uses a caption key from the content', () => {
    const shot = resolveShot({ scene: 'chassot_farm', target: 'chassot_garden', state: day(), taken: [] });
    expect(shot).toEqual({ item: 'photo_misc_1', caption: 'A garden nobody owns, kept by nobody.' });
  });

  it('makes any shot in the cemetery on night 1 photo 7, once', () => {
    const night = new GameState();
    night.setCount('night', 1);
    expect(resolveShot({ scene: 'cemetery', target: 'photo_lantern', state: night, taken: [] })).toEqual({ item: 'photo_treeline' });
    expect(resolveShot({ scene: 'cemetery', target: 'photo_lantern', state: night, taken: ['photo_treeline'] }).item).toBe('photo_lantern');
    expect(resolveShot({ scene: 'church', state: night, taken: [] }).item).toBe('photo_misc_1');
  });

  it('stops making photo 7 once the figure has been seen', () => {
    const night = new GameState();
    night.setCount('night', 1);
    night.setFlag('first_sighting');
    expect(resolveShot({ scene: 'cemetery', state: night, taken: [] }).item).toBe('photo_misc_1');
  });

  it('ignores targets that are not camera photos', () => {
    expect(resolveShot({ scene: 'bunker_hidden', target: 'photo_boys', state: day(), taken: [] }).item).toBe('photo_misc_1');
  });
});

describe('photo items', () => {
  it('tells Polaroids from found photos', () => {
    expect(isCameraPhoto('photo_grave_chassot')).toBe(true);
    expect(isCameraPhoto('photo_misc_4')).toBe(true);
    expect(isCameraPhoto('photo_boys')).toBe(false);
    expect(isCameraPhoto('shovel')).toBe(false);
  });

  it('reads captions from the content', () => {
    expect(photoCaption('photo_grave_chassot')).toBe('Chassot. The boot prints.');
    expect(photoCaption('photo_empty_coffin')).toBe('Empty. 18.11.95.');
    expect(photoCaption('photo_marc_forced')).toBeUndefined();
    expect(photoCaption('photo_treeline')).toBeUndefined();
  });

  it('develops over a minute', () => {
    const photo = { image: '', takenAt: 1000 };
    expect(developed(photo, 1000)).toBe(0);
    expect(developed(photo, 31_000)).toBe(0.5);
    expect(developed(photo, 1_000_000)).toBe(1);
  });
});
