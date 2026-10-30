import { Mesh, OrthographicCamera, PlaneGeometry, Scene, ShaderMaterial, Vector3, type Texture } from 'three';

const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const fragmentShader = /* glsl */ `
uniform sampler2D tScene;
uniform float uTime;
uniform float uGrain;
uniform float uSaturation;
uniform float uVignette;
uniform float uFlicker;
uniform vec3 uTint;
varying vec2 vUv;

float bayer4(vec2 p) {
  int x = int(mod(p.x, 4.0));
  int y = int(mod(p.y, 4.0));
  int i = x + y * 4;
  int m[16] = int[16](0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5);
  return (float(m[i]) + 0.5) / 16.0;
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec3 color = texture2D(tScene, vUv).rgb;
  float luma = dot(color, vec3(0.299, 0.587, 0.114));
  color = mix(vec3(luma), color, uSaturation);
  color *= uTint;
  // Darker toward the edges and corners, where the torch never reaches.
  float edge = length((vUv - 0.5) * vec2(1.333, 1.0));
  color *= 1.0 - uVignette * smoothstep(0.2, 0.8, edge);
  // A faint, uneven waver in the whole picture, like film running through a tired projector.
  color *= 1.0 - uFlicker * (0.5 + 0.5 * sin(uTime * 11.3) * sin(uTime * 4.7 + 1.3));
  color += (hash(gl_FragCoord.xy + fract(uTime * 7.13) * 431.0) - 0.5) * uGrain;
  // 15-bit color: 5 bits per channel, with a 4x4 ordered dither like the PS1 GPU.
  color = floor(clamp(color, 0.0, 1.0) * 31.0 + bayer4(gl_FragCoord.xy)) / 31.0;
  gl_FragColor = vec4(color, 1.0);
}
`;

const DAY = { grain: 0.035, vignette: 0.15, flicker: 0, tint: new Vector3(1, 1, 1) };
/** Night leans cold blue: the reds pulled down, the blues lifted. */
const NIGHT = { grain: 0.09, vignette: 0.6, flicker: 0.04, tint: new Vector3(0.82, 0.92, 1.18) };

/** Full-screen pass that reduces the rendered frame to 15-bit dithered color with film grain. */
export class PostProcess {
  readonly scene = new Scene();
  readonly camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private readonly material: ShaderMaterial;

  constructor(source: Texture) {
    this.material = new ShaderMaterial({
      uniforms: {
        tScene: { value: source },
        uTime: { value: 0 },
        uGrain: { value: DAY.grain },
        uSaturation: { value: 0.75 },
        uVignette: { value: DAY.vignette },
        uFlicker: { value: DAY.flicker },
        uTint: { value: DAY.tint.clone() },
      },
      vertexShader,
      fragmentShader,
      depthTest: false,
      depthWrite: false,
    });
    this.scene.add(new Mesh(new PlaneGeometry(2, 2), this.material));
  }

  set time(value: number) {
    this.material.uniforms.uTime!.value = value;
  }

  set saturation(value: number) {
    this.material.uniforms.uSaturation!.value = value;
  }

  /** Night has heavier grain, a dark vignette, a faint flicker, and a cold blue tint; day keeps them light. */
  set night(on: boolean) {
    const look = on ? NIGHT : DAY;
    this.material.uniforms.uGrain!.value = look.grain;
    this.material.uniforms.uVignette!.value = look.vignette;
    this.material.uniforms.uFlicker!.value = look.flicker;
    (this.material.uniforms.uTint!.value as Vector3).copy(look.tint);
  }
}
