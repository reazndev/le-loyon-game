import {
  ColorManagement,
  LinearSRGBColorSpace,
  NearestFilter,
  WebGLRenderTarget,
  WebGLRenderer,
  type Camera,
  type ColorRepresentation,
  type Scene,
} from 'three';
import { FRAME_HEIGHT, FRAME_WIDTH } from './frame';
import { PostProcess } from './postProcess';
import { ps1Uniforms } from './ps1Uniforms';

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
    this.renderer.setRenderTarget(this.target);
    this.renderer.clear();
    this.renderer.render(scene, camera);
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.post.scene, this.post.camera);
  }
}
