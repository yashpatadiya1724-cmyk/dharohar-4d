// Dharohar 4D Subterranean Acoustic Engine
// Conforms to PRD Section 5.2: ConvolverNode, Depth-Dependent RT60 (0.4s to 4.5s),
// Inharmonic Bell Resonance & Hydrological Droplet Synthesizer

export class SubterraneanAcoustics {
  private ctx: AudioContext | null = null;
  private convolver: ConvolverNode | null = null;
  private lowpassFilter: BiquadFilterNode | null = null;
  private dryGain: GainNode | null = null;
  private wetGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private ambientOscs: OscillatorNode[] = [];
  private lastDepthM: number = -1;
  private isMuted: boolean = false;

  constructor() {
    // Lazy AudioContext initialization on first user interaction
  }

  private initContext() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    this.ctx = new AudioCtx();

    // Create acoustic graph nodes
    this.convolver = this.ctx.createConvolver();
    this.lowpassFilter = this.ctx.createBiquadFilter();
    this.lowpassFilter.type = "lowpass";

    this.dryGain = this.ctx.createGain();
    this.wetGain = this.ctx.createGain();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);

    // Source -> Dry -> Master
    // Source -> Convolver -> Lowpass -> Wet -> Master
    this.convolver.connect(this.lowpassFilter);
    this.lowpassFilter.connect(this.wetGain);

    this.dryGain.connect(this.masterGain);
    this.wetGain.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    // Initial surface acoustics (depth = 0)
    this.updateDepth(0);
  }

  /**
   * Generates a stereo synthetic impulse response with 60 dB exponential decay.
   * Amplitude falls 60 dB over rt60 seconds: exp(-6.9077 * t / rt60).
   */
  private makeImpulseResponse(rt60: number): AudioBuffer {
    if (!this.ctx) throw new Error("AudioContext not initialized");
    const sampleRate = this.ctx.sampleRate;
    const length = Math.floor(sampleRate * rt60);
    const buffer = this.ctx.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        // Exponential decay envelope
        const envelope = Math.exp((-6.9077 * t) / rt60);
        // Stereo uncorrelated white noise with early reflections simulation
        const noise = Math.random() * 2 - 1;
        channelData[i] = noise * envelope;
      }
    }
    return buffer;
  }

  /**
   * Updates subterranean reverberation decay, wet/dry mix, and stone absorption cutoff.
   * Depth: 0m (Surface) to 24.5m (Deep Aquifer Cistern).
   */
  public updateDepth(depthM: number) {
    if (!this.ctx || !this.convolver || !this.lowpassFilter || !this.dryGain || !this.wetGain) {
      return;
    }

    // Only regenerate IR if depth changed by more than 0.5m (performance optimization)
    if (Math.abs(depthM - this.lastDepthM) < 0.5 && this.lastDepthM >= 0) {
      return;
    }
    this.lastDepthM = depthM;

    const clampedDepth = Math.max(0, Math.min(24.5, depthM));
    const depthRatio = clampedDepth / 24.5;

    // RT60: 0.4s at surface up to 4.5s at -24.5m
    const rt60 = 0.4 + 4.1 * depthRatio;

    // Wet mix increases with depth as walls enclose sound (0.15 surface to 0.75 cistern)
    const wetMix = 0.15 + 0.6 * depthRatio;
    const dryMix = 1.0 - wetMix * 0.4;

    // Porous sandstone absorbs higher frequencies as acoustic path lengths increase
    // Cutoff: 12000 Hz at surface down to 4000 Hz at bottom
    const cutoff = 12000 - 8000 * depthRatio;

    const now = this.ctx.currentTime;
    this.dryGain.gain.setTargetAtTime(dryMix, now, 0.05);
    this.wetGain.gain.setTargetAtTime(wetMix, now, 0.05);
    this.lowpassFilter.frequency.setTargetAtTime(cutoff, now, 0.05);

    // Generate new impulse response
    try {
      this.convolver.buffer = this.makeImpulseResponse(rt60);
    } catch (e) {
      console.warn("Failed to update impulse response:", e);
    }
  }

  /**
   * Triggers a subterranean water droplet impact.
   * Short sine chirp (900-1400 Hz, 40ms) with randomized pitch and cavern reflection.
   */
  public triggerWaterDrop() {
    this.initContext();
    if (!this.ctx || !this.dryGain || !this.convolver) return;
    if (this.ctx.state === "suspended") this.ctx.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Random droplet pitch between 950 Hz and 1350 Hz
    const baseFreq = 950 + Math.random() * 400;
    osc.type = "sine";
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.6, now + 0.035);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.dryGain);
    gain.connect(this.convolver);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  /**
   * Triggers an ancient temple bell resonance with inharmonic stone partials.
   * Partials: 1.0, 2.76, 5.4, 8.9 times f0 (around 432-440 Hz) with exponential decay.
   */
  public triggerTempleBell() {
    this.initContext();
    if (!this.ctx || !this.dryGain || !this.convolver) return;
    if (this.ctx.state === "suspended") this.ctx.resume();

    const now = this.ctx.currentTime;
    const f0 = 432; // Sacred harmonic frequency
    const partials = [
      { ratio: 1.0, amp: 0.4, decay: 3.8 },
      { ratio: 2.76, amp: 0.25, decay: 2.9 },
      { ratio: 5.4, amp: 0.15, decay: 2.1 },
      { ratio: 8.9, amp: 0.08, decay: 1.4 },
    ];

    partials.forEach((p) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(f0 * p.ratio, now);

      gain.gain.setValueAtTime(p.amp, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + p.decay);

      osc.connect(gain);
      gain.connect(this.dryGain!);
      gain.connect(this.convolver!);

      osc.start(now);
      osc.stop(now + p.decay + 0.1);
    });
  }

  /**
   * Toggles subterranean cavern drone (tanpura/aquifer resonant hum).
   */
  public toggleCavernDrone(enable?: boolean): boolean {
    this.initContext();
    if (!this.ctx || !this.dryGain || !this.convolver) return false;
    if (this.ctx.state === "suspended") this.ctx.resume();

    if (this.ambientOscs.length > 0) {
      // Stop existing drone
      this.ambientOscs.forEach((osc) => {
        try {
          osc.stop();
        } catch {}
      });
      this.ambientOscs = [];
      return false;
    }

    if (enable === false) return false;

    // Start subtle drone
    const freqs = [108, 162, 216]; // Root, Fifth, Octave in Indian microtonal scale
    const now = this.ctx.currentTime;
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.08, now);
    this.ambientGain.connect(this.dryGain);
    this.ambientGain.connect(this.convolver);

    this.ambientOscs = freqs.map((f) => {
      const osc = this.ctx!.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(f, now);
      osc.connect(this.ambientGain!);
      osc.start(now);
      return osc;
    });

    return true;
  }

  public setMasterVolume(vol: number) {
    if (!this.ctx || !this.masterGain) return;
    this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime, 0.05);
  }

  public toggleMute(): boolean {
    if (!this.ctx || !this.masterGain) return false;
    this.isMuted = !this.isMuted;
    this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime, 0.05);
    return this.isMuted;
  }
}

// Global acoustic singleton
export const subterraneanAcousticEngine = typeof window !== "undefined" ? new SubterraneanAcoustics() : (null as any);
