// Web Audio API procedural sound engine

class SoundEngine {
  private ctx: AudioContext | null = null;
  private ambientGainNode: GainNode | null = null;
  private ambientSource: AudioNode | null = null;
  private ambientInterval: any = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playAlarm(type: 'digital' | 'bell' | 'chime' | 'zen' = 'bell', volume = 80) {
    this.initCtx();
    if (!this.ctx) return;

    const gainVal = Math.max(0.01, (volume / 100) * 0.4);
    const now = this.ctx.currentTime;

    if (type === 'digital') {
      // 3 short digital beeps
      for (let i = 0; i < 3; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, now + i * 0.15);
        gain.gain.setValueAtTime(gainVal * 0.3, now + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.09);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.15);
        osc.stop(now + i * 0.15 + 0.1);
      }
    } else if (type === 'bell') {
      // Warm gong / singing bell
      const freqs = [528, 1056, 1584];
      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        const startGain = gainVal * (0.6 / (idx + 1));
        gain.gain.setValueAtTime(startGain, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 2.5);
      });
    } else if (type === 'chime') {
      // Celestial arpeggio chime
      const notes = [587.33, 739.99, 880.00, 1174.66]; // D5, F#5, A5, D6
      notes.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);
        gain.gain.setValueAtTime(gainVal * 0.5, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 1.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 1.3);
      });
    } else { // zen
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(432, now); // 432 Hz healing frequency
      gain.gain.setValueAtTime(gainVal * 0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 3.0);
    }
  }

  public playTick(volume = 30) {
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    gain.gain.setValueAtTime((volume / 100) * 0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  public startAmbient(type: string, volume = 50) {
    this.stopAmbient();
    this.initCtx();
    if (!this.ctx || type === 'none') return;

    const gain = this.ctx.createGain();
    const targetGain = (volume / 100) * 0.25;
    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(targetGain, this.ctx.currentTime + 1.0);
    gain.connect(this.ctx.destination);
    this.ambientGainNode = gain;

    if (type === 'binaural') {
      // 40Hz Gamma wave generator (Left 200Hz, Right 240Hz)
      const merger = this.ctx.createChannelMerger(2);
      
      const oscL = this.ctx.createOscillator();
      oscL.type = 'sine';
      oscL.frequency.value = 200;
      oscL.connect(merger, 0, 0);

      const oscR = this.ctx.createOscillator();
      oscR.type = 'sine';
      oscR.frequency.value = 240;
      oscR.connect(merger, 0, 1);

      merger.connect(gain);
      oscL.start();
      oscR.start();
      this.ambientSource = merger;
    } else if (type === 'whitenoise' || type === 'rain') {
      // Noise buffer (White / Pink filter)
      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === 'rain') {
          // Pink noise filter for soft rain
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
          b6 = white * 0.115926;
        } else {
          output[i] = white * 0.1;
        }
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      if (type === 'rain') {
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1200;
        whiteNoise.connect(filter);
        filter.connect(gain);
      } else {
        whiteNoise.connect(gain);
      }

      whiteNoise.start();
      this.ambientSource = whiteNoise;
    } else if (type === 'waves') {
      // Ocean wave periodic modulation
      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.15;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, this.ctx.currentTime);

      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.12; // 8.3 second wave cycle
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 500;
      lfo.connect(filter.frequency);

      noise.connect(filter);
      filter.connect(gain);

      noise.start();
      lfo.start();
      this.ambientSource = noise;
    } else if (type === 'cafe') {
      // Gentle warm background hum
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      osc1.type = 'triangle';
      osc2.type = 'sine';
      osc1.frequency.value = 110;
      osc2.frequency.value = 165;
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 350;

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      osc1.start();
      osc2.start();
      this.ambientSource = filter;
    }
  }

  public setAmbientVolume(volume: number) {
    if (this.ambientGainNode && this.ctx) {
      const targetGain = (volume / 100) * 0.25;
      this.ambientGainNode.gain.setValueAtTime(targetGain, this.ctx.currentTime);
    }
  }

  public stopAmbient() {
    if (this.ambientGainNode && this.ctx) {
      try {
        this.ambientGainNode.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      } catch (e) {}
    }
    if (this.ambientSource) {
      try {
        (this.ambientSource as any).stop?.();
        this.ambientSource.disconnect();
      } catch (e) {}
      this.ambientSource = null;
    }
    if (this.ambientInterval) {
      clearInterval(this.ambientInterval);
      this.ambientInterval = null;
    }
  }
}

export const soundEngine = typeof window !== 'undefined' ? new SoundEngine() : null;
