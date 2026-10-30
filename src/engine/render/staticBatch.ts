import { BufferGeometry, Float32BufferAttribute, Matrix4, Mesh, type Object3D } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { Ps1Material } from './ps1Material';

/** Set on an object whose meshes must keep their own draw call because they move, hide, or change. */
export const DYNAMIC = 'dynamic';

type Ps1Mesh = Mesh<BufferGeometry, Ps1Material>;

/**
 * Merges the static meshes under `root` that would draw with the same material into one mesh
 * each, so a village of small parts costs a few draw calls instead of hundreds. The color and
 * UV scale of each part are baked into its vertices. Billboards, glows, hidden meshes, and
 * anything under an object marked `DYNAMIC` are left alone.
 */
export function mergeStatic(root: Object3D): void {
  root.updateMatrixWorld(true);
  const toRoot = root.matrixWorld.clone().invert();
  const groups = new Map<string, Ps1Mesh[]>();
  staticMeshes(root).forEach((mesh) => {
    const key = materialKey(mesh.material);
    groups.set(key, [...(groups.get(key) ?? []), mesh]);
  });
  [...groups.values()]
    .filter((meshes) => meshes.length > 1)
    .forEach((meshes) => {
      const geometries = meshes.map((mesh) => baked(mesh, toRoot.clone().multiply(mesh.matrixWorld)));
      const indexed = geometries.every((g) => g.index);
      const merged = mergeGeometries(indexed ? geometries : geometries.map((g) => (g.index ? g.toNonIndexed() : g)))!;
      const material = meshes[0]!.material;
      material.uniforms.uColor.value.set(0xffffff);
      material.uniforms.uUvScale.value.set(1, 1);
      material.vertexColors = true;
      material.needsUpdate = true;
      meshes.forEach((mesh) => {
        mesh.removeFromParent();
        mesh.geometry.dispose();
        if (mesh.material !== material) mesh.material.dispose();
      });
      root.add(new Mesh(merged, material));
    });
}

function staticMeshes(root: Object3D): Ps1Mesh[] {
  const found: Ps1Mesh[] = [];
  const visit = (object: Object3D) => {
    if (object.userData[DYNAMIC] || !object.visible) return;
    if (isMergeable(object)) found.push(object);
    object.children.forEach(visit);
  };
  visit(root);
  return found;
}

function isMergeable(object: Object3D): object is Ps1Mesh {
  if (!(object instanceof Mesh) || 'isInstancedMesh' in object || Array.isArray(object.material)) return false;
  const material = object.material as Partial<Ps1Material>;
  if (!material.uniforms?.uMap || material.transparent) return false;
  const defines = material.defines ?? {};
  // A billboard turns around its own origin, and a mirrored part would turn inside out.
  return !('BILLBOARD' in defines) && !('GLOW' in defines) && object.matrixWorld.determinant() > 0;
}

/** Everything that tells two PS1 materials apart once color and UV scale are in the vertices. */
export function materialKey(material: Ps1Material): string {
  const { uMap, uEmissive, uAlphaTest } = material.uniforms;
  const defines = Object.keys(material.defines ?? {}).sort().join(',');
  return [uMap.value.uuid, uEmissive.value.getHexString(), uAlphaTest.value, material.side, defines].join('|');
}

/** A copy of the mesh's geometry in root space, with only the attributes the PS1 material reads. */
function baked(mesh: Ps1Mesh, matrix: Matrix4): BufferGeometry {
  const source = mesh.geometry;
  const geometry = new BufferGeometry();
  const count = source.getAttribute('position').count;
  geometry.setAttribute('position', source.getAttribute('position').clone());
  if (source.index) geometry.setIndex(source.index.clone());
  if (source.getAttribute('normal')) geometry.setAttribute('normal', source.getAttribute('normal').clone());
  else geometry.computeVertexNormals();

  const { uColor, uUvScale } = mesh.material.uniforms;
  const uv = source.getAttribute('uv');
  geometry.setAttribute('uv', new Float32BufferAttribute(Array.from({ length: count * 2 }, (_, i) => (uv?.getComponent(i >> 1, i % 2) ?? 0) * (i % 2 ? uUvScale.value.y : uUvScale.value.x)), 2));
  const color = mesh.material.vertexColors ? source.getAttribute('color') : undefined;
  const tint = [uColor.value.r, uColor.value.g, uColor.value.b];
  geometry.setAttribute('color', new Float32BufferAttribute(Array.from({ length: count * 3 }, (_, i) => (color?.getComponent(Math.floor(i / 3), i % 3) ?? 1) * tint[i % 3]!), 3));
  return geometry.applyMatrix4(matrix);
}
