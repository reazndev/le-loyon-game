import { BoxGeometry, Group, Mesh, PlaneGeometry } from 'three';
import { describe, expect, it } from 'vitest';
import { createPs1Material } from './ps1Material';
import { DYNAMIC, mergeStatic } from './staticBatch';

const meshes = (root: Group) => root.children.filter((child): child is Mesh => child instanceof Mesh);

describe('mergeStatic', () => {
  it('merges meshes that share a material, baking color, place, and UV scale', () => {
    const root = new Group();
    const red = new Mesh(new BoxGeometry(1, 1, 1), createPs1Material({ color: 0xff0000, uvScale: [0.5, 0.5] }));
    const blue = new Mesh(new BoxGeometry(1, 1, 1), createPs1Material({ color: 0x0000ff }));
    blue.position.set(10, 0, 0);
    root.add(red, blue);

    mergeStatic(root);

    expect(meshes(root)).toHaveLength(1);
    const merged = meshes(root)[0]!;
    const { geometry } = merged;
    expect(geometry.getAttribute('position').count).toBe(48);
    geometry.computeBoundingBox();
    expect(geometry.boundingBox!.max.x).toBeCloseTo(10.5);
    const color = geometry.getAttribute('color');
    expect([color.getX(0), color.getZ(0)]).toEqual([1, 0]);
    expect([color.getX(24), color.getZ(24)]).toEqual([0, 1]);
    // BoxGeometry UVs run 0..1, so the first box's halve.
    expect(Math.max(...Array.from({ length: 24 }, (_, i) => geometry.getAttribute('uv').getX(i)))).toBeCloseTo(0.5);
    expect((merged.material as ReturnType<typeof createPs1Material>).uniforms.uUvScale.value.x).toBe(1);
  });

  it('leaves dynamic parts, billboards, and lone meshes alone', () => {
    const root = new Group();
    const moving = new Group();
    moving.userData[DYNAMIC] = true;
    moving.add(new Mesh(new PlaneGeometry(), createPs1Material()));
    root.add(moving, new Mesh(new PlaneGeometry(), createPs1Material({ billboard: true })), new Mesh(new PlaneGeometry(), createPs1Material({ billboard: true })));
    root.add(new Mesh(new PlaneGeometry(), createPs1Material({ unlit: true })));
    const before = meshes(root).length;

    mergeStatic(root);

    expect(meshes(root)).toHaveLength(before);
    expect(moving.children).toHaveLength(1);
  });
});
