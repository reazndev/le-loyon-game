import {
  Color,
  ColorManagement,
  DataTexture,
  HalfFloatType,
  LinearFilter,
  LinearSRGBColorSpace,
  Material,
  MathUtils,
  Mesh,
  NearestFilter,
  PerspectiveCamera,
  RedFormat,
  RGBAFormat,
  WebGLRenderTarget,
  WebGLRenderer,
  type Camera,
  type ColorRepresentation,
  type Object3D,
  type Scene,
} from 'three';
import { FRAME_HEIGHT, FRAME_WIDTH } from './frame';
import { PostProcess } from './postProcess';
import { ps1Uniforms, SHADOW_SIZE } from './ps1Uniforms';

// The PS1 lit and blended in display space. Turning color management off keeps every color
// value as authored, with no sRGB conversion anywhere in the pipeline.
ColorManagement.enabled = false;

/**
 * Renders a scene into a 640x480 target, runs the dither pass, and draws the result to a
 * 640x480 canvas that CSS upscales with nearest-neighbor filtering.
 */
export class GameRenderer {
  readonly canvas: HTMLCanvasElement;
  private readonly renderer: WebGLRenderer;
  private readonly target: WebGLRenderTarget;
  private readonly post: PostProcess;
  /** The torch's own view of the scene, for its shadows. */
  private readonly shadowTarget = new WebGLRenderTarget(SHADOW_SIZE, SHADOW_SIZE, {
    type: HalfFloatType,
    format: RedFormat,
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    depthBuffer: true,
  });
  private readonly shadowCamera = new PerspectiveCamera(40, 1, 0.05, 10);
  /** Bound in place of the torch's view while it is being drawn, which can't be read and written at once. */
  private readonly noShadow = new DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1, RGBAFormat);
  private readonly hidden: Object3D[] = [];
  private readonly clearColor = new Color();

  constructor(container: HTMLElement) {
    this.renderer = new WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    this.renderer.outputColorSpace = LinearSRGBColorSpace;
    this.renderer.setPixelRatio(1);
    // Two passes per frame; reset once so the stats cover both.
    this.renderer.info.autoReset = false;
    this.renderer.setSize(FRAME_WIDTH, FRAME_HEIGHT, false);
    this.canvas = this.renderer.domElement;
    this.canvas.className = 'game-canvas';
    container.appendChild(this.canvas);

    this.target = new WebGLRenderTarget(FRAME_WIDTH, FRAME_HEIGHT, {
      minFilter: NearestFilter,
      magFilter: NearestFilter,
      depthBuffer: true,
    });
    this.post = new PostProcess(this.target.texture);
    ps1Uniforms.uShadowMap.value = this.shadowTarget.texture;
    this.noShadow.needsUpdate = true;
  }

  set background(color: ColorRepresentation) {
    this.renderer.setClearColor(color, 1);
  }

  set saturation(value: number) {
    this.post.saturation = value;
  }

  set night(on: boolean) {
    this.post.night = on;
  }

  /** What the last frame cost the GPU, for performance checks. Includes the dither pass. */
  get stats(): { calls: number; triangles: number; programs: number; geometries: number; textures: number } {
    const { render, memory, programs } = this.renderer.info;
    return { calls: render.calls, triangles: render.triangles, programs: programs?.length ?? 0, ...memory };
  }

  render(scene: Scene, camera: Camera, time: number): void {
    this.renderer.info.reset();
    ps1Uniforms.uTime.value = time;
    this.post.time = time;
    this.renderTorchView(scene);
    this.renderer.setRenderTarget(this.target);
    this.renderer.clear();
    this.renderer.render(scene, camera);
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.post.scene, this.post.camera);
  }

  /**
   * Draws what the torch can see, as distance from it, so surfaces behind something closer stay
   * out of its light. Only PS1 surfaces cast: particles, the sky, and halos are hidden for it.
   * Skipped while the torch is off.
   */
  private renderTorchView(scene: Scene): void {
    const { uSpotPos, uSpotDir, uSpotColor, uSpotCos, uSpotRange, uShadowMatrix, uShadowPass, uShadowOn } = ps1Uniforms;
    const lit = uSpotColor.value.r + uSpotColor.value.g + uSpotColor.value.b > 0;
    uShadowOn.value = lit ? 1 : 0;
    if (!lit) return;
    const camera = this.shadowCamera;
    camera.fov = MathUtils.radToDeg(Math.acos(uSpotCos.value.x)) * 2.3;
    camera.far = uSpotRange.value;
    camera.position.copy(uSpotPos.value);
    camera.lookAt(camera.position.clone().add(uSpotDir.value));
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    uShadowMatrix.value.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);

    scene.traverseVisible((object) => {
      const material = (object as Mesh).material as Material | Material[] | undefined;
      if (material && (Array.isArray(material) || !material.userData.ps1)) this.hidden.push(object);
    });
    this.hidden.forEach((object) => (object.visible = false));
    this.renderer.getClearColor(this.clearColor);
    this.renderer.setClearColor(0xffffff, 1);
    uShadowPass.value = 1;
    ps1Uniforms.uShadowMap.value = this.noShadow;
    this.renderer.setRenderTarget(this.shadowTarget);
    this.renderer.clear();
    this.renderer.render(scene, camera);
    uShadowPass.value = 0;
    ps1Uniforms.uShadowMap.value = this.shadowTarget.texture;
    this.renderer.setClearColor(this.clearColor, 1);
    this.hidden.forEach((object) => (object.visible = true));
    this.hidden.length = 0;
  }

}
