export type Bus = 'ambience' | 'sfx' | 'ui' | 'music';

export interface Point3 {
  x: number;
  y: number;
  z: number;
}

export interface SoundHandle {
  /** Stops the sound, fading out over `fade` seconds. */
  stop(fade?: number): void;
}

export interface OutputOptions {
  bus?: Bus;
  volume?: number;
  /** Places the sound in the world with an HRTF panner. Omit for a flat, head-locked sound. */
  at?: Point3;
  /** Distance in meters at which the sound plays at full volume. */
  refDistance?: number;
}

export interface PlayOptions extends OutputOptions {
  loop?: boolean;
  /** Playback speed; also shifts pitch. */
  rate?: number;
}

/** An output node chain: a gain to set the level, then an optional panner, then a bus. */
export interface Output {
  input: GainNode;
  panner: PannerNode | null;
  /** Fades the output to silence and disconnects it. */
  release(fade: number): void;
}

const defaultBusLevels: Record<Bus, number> = { ambience: 0.8, sfx: 1, ui: 0.7, music: 0.6 };

/**
 * WebAudio with four buses, file loading, and positional sound. Browsers start the context
 * suspended; `unlockOnGesture` resumes it on the first key, click, or gamepad button.
 */
export class AudioManager {
  readonly context = new AudioContext({ latencyHint: 'interactive' });
  readonly listenerPosition: Point3 = { x: 0, y: 0, z: 0 };
  private readonly master = this.context.createGain();
  private readonly buses: Record<Bus, GainNode>;
  private readonly buffers = new Map<string, Promise<AudioBuffer>>();
  private noiseBuffer: AudioBuffer | null = null;
  private readonly levels: Record<Bus, number> = { ...defaultBusLevels };

  constructor() {
    this.master.connect(this.context.destination);
    this.buses = Object.fromEntries(
      (Object.keys(defaultBusLevels) as Bus[]).map((bus) => {
        const gain = this.context.createGain();
        gain.gain.value = defaultBusLevels[bus];
        gain.connect(this.master);
        return [bus, gain];
      }),
    ) as Record<Bus, GainNode>;
  }

  get now(): number {
    return this.context.currentTime;
  }

  unlockOnGesture(target: Window = window): void {
    const unlock = () => {
      void this.context.resume();
      if (this.context.state === 'running') {
        target.removeEventListener('keydown', unlock);
        target.removeEventListener('pointerdown', unlock);
      }
    };
    target.addEventListener('keydown', unlock);
    target.addEventListener('pointerdown', unlock);
  }

  /** Tries to resume the context. Call on gamepad input, which raises no DOM events. */
  resume(): void {
    if (this.context.state === 'suspended') void this.context.resume();
  }

  /** Loads and decodes a file once; later calls share the same promise. */
  load(url: string): Promise<AudioBuffer> {
    const cached = this.buffers.get(url);
    if (cached) return cached;
    const buffer = fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`Audio not found: ${url}`);
        return response.arrayBuffer();
      })
      .then((data) => this.context.decodeAudioData(data));
    this.buffers.set(url, buffer);
    return buffer;
  }

  /** Plays a file. The handle works at once, even while the file is still loading. */
  play(url: string, options: PlayOptions = {}): SoundHandle {
    let stopped = false;
    let source: AudioBufferSourceNode | null = null;
    const output = this.output(options);
    this.load(url).then(
      (buffer) => {
        if (stopped) return;
        source = this.context.createBufferSource();
        source.buffer = buffer;
        source.loop = options.loop ?? false;
        source.playbackRate.value = options.rate ?? 1;
        source.connect(output.input);
        source.onended = () => output.release(0);
        source.start();
      },
      (error: unknown) => console.warn(error),
    );
    return {
      stop: (fade = 0.2) => {
        stopped = true;
        output.release(fade);
        source?.stop(this.now + fade + 0.05);
      },
    };
  }

  /** Builds the node chain a sound plays into. Generators use this too. */
  output(options: OutputOptions = {}): Output {
    const input = this.context.createGain();
    input.gain.value = options.volume ?? 1;
    let panner: PannerNode | null = null;
    if (options.at) {
      panner = new PannerNode(this.context, {
        panningModel: 'HRTF',
        distanceModel: 'inverse',
        refDistance: options.refDistance ?? 1.5,
        maxDistance: 60,
        rolloffFactor: 1,
        positionX: options.at.x,
        positionY: options.at.y,
        positionZ: options.at.z,
      });
      input.connect(panner).connect(this.buses[options.bus ?? 'sfx']);
    } else {
      input.connect(this.buses[options.bus ?? 'sfx']);
    }
    return {
      input,
      panner,
      release: (fade) => {
        const end = this.now + fade;
        input.gain.cancelScheduledValues(this.now);
        input.gain.setValueAtTime(input.gain.value, this.now);
        input.gain.linearRampToValueAtTime(0, end);
        setTimeout(() => {
          input.disconnect();
          panner?.disconnect();
        }, (fade + 0.1) * 1000);
      },
    };
  }

  setListener(position: Point3, forward: Point3): void {
    Object.assign(this.listenerPosition, position);
    const listener = this.context.listener;
    // Firefox's listener has no AudioParams, only the older setters.
    if (!listener.positionX) {
      listener.setPosition(position.x, position.y, position.z);
      listener.setOrientation(forward.x, forward.y, forward.z, 0, 1, 0);
      return;
    }
    const t = this.now;
    listener.positionX.setValueAtTime(position.x, t);
    listener.positionY.setValueAtTime(position.y, t);
    listener.positionZ.setValueAtTime(position.z, t);
    listener.forwardX.setValueAtTime(forward.x, t);
    listener.forwardY.setValueAtTime(forward.y, t);
    listener.forwardZ.setValueAtTime(forward.z, t);
    listener.upX.setValueAtTime(0, t);
    listener.upY.setValueAtTime(1, t);
    listener.upZ.setValueAtTime(0, t);
  }

  fadeBus(bus: Bus, level: number, seconds: number): void {
    const gain = this.buses[bus].gain;
    gain.cancelScheduledValues(this.now);
    gain.setValueAtTime(gain.value, this.now);
    gain.linearRampToValueAtTime(level, this.now + seconds);
  }

  /** The level a bus plays at, and returns to after scene fades. */
  busLevel(bus: Bus): number {
    return this.levels[bus];
  }

  /** Scales a bus from its mixed level: 1 keeps the mix, 0 mutes it. For the volume settings. */
  setBusVolume(bus: Bus, volume: number): void {
    this.levels[bus] = defaultBusLevels[bus] * volume;
    this.fadeBus(bus, this.levels[bus], 0.05);
  }

  /** Two seconds of white noise, shared by the generators. */
  get noise(): AudioBuffer {
    if (!this.noiseBuffer) {
      const length = this.context.sampleRate * 2;
      this.noiseBuffer = this.context.createBuffer(1, length, this.context.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    }
    return this.noiseBuffer;
  }
}

/** Collects sounds that belong to one scene so they can all stop when it ends. */
export class SoundScope {
  private readonly handles = new Set<SoundHandle>();

  track(handle: SoundHandle): SoundHandle {
    this.handles.add(handle);
    return {
      stop: (fade) => {
        this.handles.delete(handle);
        handle.stop(fade);
      },
    };
  }

  stopAll(fade = 0.5): void {
    this.handles.forEach((handle) => handle.stop(fade));
    this.handles.clear();
  }
}
