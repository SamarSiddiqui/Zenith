import type { SoundscapeId } from '../../types/focus';

class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private currentSoundscape: SoundscapeId = 'none';
  private masterGain: GainNode | null = null;
  private activeNodes: (AudioNode | number)[] = [];
  private isRunning: boolean = false;
  private targetVolume: number = 0.5;

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setVolume(volume: number) {
    this.targetVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.targetVolume, this.ctx.currentTime, 0.1);
    }
  }

  public async playSoundscape(id: SoundscapeId, volume: number = 0.5) {
    this.targetVolume = volume;
    if (this.currentSoundscape === id && this.isRunning) return;

    this.stopSoundscape();
    if (id === 'none') {
      this.currentSoundscape = 'none';
      return;
    }

    const ctx = this.initContext();
    if (!ctx) return;

    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, ctx.currentTime);
    this.masterGain.gain.setTargetAtTime(this.targetVolume, ctx.currentTime, 0.5);
    this.masterGain.connect(ctx.destination);

    this.currentSoundscape = id;
    this.isRunning = true;

    try {
      switch (id) {
        case 'rain':
          this.startRainSynthesis(ctx, this.masterGain);
          break;
        case 'forest':
          this.startForestSynthesis(ctx, this.masterGain);
          break;
        case 'brown_noise':
          this.startBrownNoiseSynthesis(ctx, this.masterGain);
          break;
        case 'alpha_waves':
          this.startAlphaWavesSynthesis(ctx, this.masterGain);
          break;
      }
    } catch (e) {
      console.error('[SoundscapeEngine] Failed to start sound synthesis:', e);
    }
  }

  public stopSoundscape() {
    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
      } catch {
        // Safe fallback
      }
    }

    // Stop and disconnect all active nodes
    setTimeout(() => {
      this.activeNodes.forEach((node) => {
        if (typeof node === 'number') {
          clearInterval(node);
        } else if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
          try {
            (node as AudioScheduledSourceNode).stop();
            node.disconnect();
          } catch {}
        } else {
          try {
            node.disconnect();
          } catch {}
        }
      });
      this.activeNodes = [];
      this.isRunning = false;
      this.currentSoundscape = 'none';
    }, 250);
  }

  /**
   * Generates a 5-second seamless White/Pink Noise Buffer
   */
  private createNoiseBuffer(ctx: AudioContext, seconds: number = 5): AudioBuffer {
    const bufferSize = ctx.sampleRate * seconds;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Pink noise approximation
        lastOut = (lastOut * 0.95) + (white * 0.05);
        data[i] = lastOut * 3;
      }
    }
    return buffer;
  }

  /**
   * Generates Brown Noise (Deep rumble) Buffer
   */
  private createBrownNoiseBuffer(ctx: AudioContext, seconds: number = 5): AudioBuffer {
    const bufferSize = ctx.sampleRate * seconds;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + (0.02 * white)) / 1.02;
        data[i] = lastOut * 3.5;
      }
    }
    return buffer;
  }

  /**
   * Synthesize Rain: Dual filtered noise with subtle random high-frequency droplet sizzle
   */
  private startRainSynthesis(ctx: AudioContext, destination: AudioNode) {
    const buffer = this.createNoiseBuffer(ctx);

    // Bed of rain (low-pass + bandpass)
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(1200, ctx.currentTime);

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(250, ctx.currentTime);

    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.7, ctx.currentTime);

    source.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(rainGain);
    rainGain.connect(destination);

    source.start(0);
    this.activeNodes.push(source, highpass, lowpass, rainGain);

    // Droplet sizzle texture
    const dropletSource = ctx.createBufferSource();
    dropletSource.buffer = buffer;
    dropletSource.loop = true;

    const dropletFilter = ctx.createBiquadFilter();
    dropletFilter.type = 'bandpass';
    dropletFilter.frequency.setValueAtTime(3200, ctx.currentTime);
    dropletFilter.Q.setValueAtTime(1.5, ctx.currentTime);

    const dropletGain = ctx.createGain();
    dropletGain.gain.setValueAtTime(0.25, ctx.currentTime);

    dropletSource.connect(dropletFilter);
    dropletFilter.connect(dropletGain);
    dropletGain.connect(destination);

    dropletSource.start(0);
    this.activeNodes.push(dropletSource, dropletFilter, dropletGain);
  }

  /**
   * Synthesize Forest Breeze: Modulated sweeping bandpass noise + low resonance
   */
  private startForestSynthesis(ctx: AudioContext, destination: AudioNode) {
    const buffer = this.createNoiseBuffer(ctx);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, ctx.currentTime);
    filter.Q.setValueAtTime(1.0, ctx.currentTime);

    // LFO modulator to simulate gentle swaying wind gusts
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // very slow cycle (~8 seconds)
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(180, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const forestGain = ctx.createGain();
    forestGain.gain.setValueAtTime(0.65, ctx.currentTime);

    source.connect(filter);
    filter.connect(forestGain);
    forestGain.connect(destination);

    source.start(0);
    lfo.start(0);
    this.activeNodes.push(source, filter, lfo, lfoGain, forestGain);
  }

  /**
   * Synthesize Brown Noise: Deep, warm low-frequency cognitive cushion
   */
  private startBrownNoiseSynthesis(ctx: AudioContext, destination: AudioNode) {
    const buffer = this.createBrownNoiseBuffer(ctx);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);

    const brownGain = ctx.createGain();
    brownGain.gain.setValueAtTime(0.8, ctx.currentTime);

    source.connect(filter);
    filter.connect(brownGain);
    brownGain.connect(destination);

    source.start(0);
    this.activeNodes.push(source, filter, brownGain);
  }

  /**
   * Synthesize Alpha Waves: 432Hz fundamental + 442Hz binaural split (10Hz Alpha resonance)
   */
  private startAlphaWavesSynthesis(ctx: AudioContext, destination: AudioNode) {
    // Left ear (432 Hz)
    const oscL = ctx.createOscillator();
    oscL.type = 'sine';
    oscL.frequency.setValueAtTime(432, ctx.currentTime);

    const pannerL = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (pannerL) pannerL.pan.setValueAtTime(-0.8, ctx.currentTime);

    const gainL = ctx.createGain();
    gainL.gain.setValueAtTime(0.15, ctx.currentTime);

    // Right ear (442 Hz -> 10Hz binaural delta)
    const oscR = ctx.createOscillator();
    oscR.type = 'sine';
    oscR.frequency.setValueAtTime(442, ctx.currentTime);

    const pannerR = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (pannerR) pannerR.pan.setValueAtTime(0.8, ctx.currentTime);

    const gainR = ctx.createGain();
    gainR.gain.setValueAtTime(0.15, ctx.currentTime);

    // Deep sub-pad drone (108 Hz)
    const subPad = ctx.createOscillator();
    subPad.type = 'sine';
    subPad.frequency.setValueAtTime(108, ctx.currentTime);
    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.12, ctx.currentTime);

    if (pannerL) {
      oscL.connect(gainL);
      gainL.connect(pannerL);
      pannerL.connect(destination);
    } else {
      oscL.connect(gainL);
      gainL.connect(destination);
    }

    if (pannerR) {
      oscR.connect(gainR);
      gainR.connect(pannerR);
      pannerR.connect(destination);
    } else {
      oscR.connect(gainR);
      gainR.connect(destination);
    }

    subPad.connect(subGain);
    subGain.connect(destination);

    oscL.start(0);
    oscR.start(0);
    subPad.start(0);

    this.activeNodes.push(oscL, oscR, subPad, gainL, gainR, subGain);
    if (pannerL) this.activeNodes.push(pannerL);
    if (pannerR) this.activeNodes.push(pannerR);
  }

  /**
   * Play crystal singing bowl chime for session start / completion
   */
  public playBowlChime(pitch: 'start' | 'complete' = 'complete') {
    const ctx = this.initContext();
    if (!ctx) return;

    const baseFreq = pitch === 'start' ? 528 : 432; // Solfeggio 528Hz or 432Hz
    const harmonics = [1, 2.76, 5.4, 8.9];
    const amplitudes = [0.35, 0.15, 0.08, 0.03];
    const decayTimes = [3.5, 2.2, 1.4, 0.8];

    harmonics.forEach((harmonic, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * harmonic, ctx.currentTime);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(amplitudes[i], ctx.currentTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + decayTimes[i]);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + decayTimes[i]);
    });
  }
}

// Export singleton instance
export const soundscapeEngine = new SoundscapeEngine();
