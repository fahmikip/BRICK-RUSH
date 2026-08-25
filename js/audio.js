window.BR = window.BR || {};

BR.Audio = {
  ctx: null,
  musicEnabled: true,
  soundEnabled: true,
  _initialized: false,

  init() {
    if (this._initialized) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        console.warn('BR.Audio: Web Audio API not supported.');
        return;
      }
      this.ctx = new AudioCtx();
    } catch (e) {
      console.warn('BR.Audio: Failed to create AudioContext:', e);
      return;
    }

    this._initialized = true;

    const resume = () => {
      this.resume();
    };

    window.addEventListener('click', resume, { once: true });
    window.addEventListener('touchstart', resume, { once: true });
    window.addEventListener('keydown', resume, { once: true });
  },

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  },

  _play(frequency, type, duration, volume, detune) {
    if (!this.soundEnabled || !this.ctx) return;
    if (this.ctx.state === 'suspended') this.resume();

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type || 'square';
      osc.frequency.setValueAtTime(frequency, now);
      if (detune) {
        osc.detune.setValueAtTime(detune, now);
      }

      gain.gain.setValueAtTime(volume || 0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      // Silently fail - don't break gameplay
    }
  },

  _playNoise(duration, volume, lowFreq, highFreq) {
    if (!this.soundEnabled || !this.ctx) return;
    if (this.ctx.state === 'suspended') this.resume();

    try {
      const now = this.ctx.currentTime;
      const sampleRate = this.ctx.sampleRate;
      const length = Math.floor(sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, length, sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < length; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(lowFreq || 1000, now);
      filter.Q.setValueAtTime(1, now);

      if (highFreq) {
        filter.frequency.linearRampToValueAtTime(highFreq, now + duration);
      }

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(volume || 0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      source.start(now);
      source.stop(now + duration);
    } catch (e) {
      // Silently fail
    }
  },

  _playChord(frequencies, type, duration, volume, stagger) {
    if (!this.soundEnabled || !this.ctx) return;

    const staggerMs = stagger || 0.05;
    frequencies.forEach((freq, i) => {
      setTimeout(() => {
        this._play(freq, type, duration, volume);
      }, i * staggerMs * 1000);
    });
  },

  brickHit() {
    this._play(800, 'square', 0.05, 0.15);
  },

  brickBreak() {
    this._play(600, 'square', 0.08, 0.25);
    setTimeout(() => this._play(350, 'square', 0.12, 0.2), 30);
  },

  criticalHit() {
    this._play(200, 'sawtooth', 0.15, 0.3);
    setTimeout(() => this._play(1200, 'square', 0.2, 0.25), 50);
  },

  coin() {
    this._play(988, 'square', 0.08, 0.2);
    setTimeout(() => this._play(1319, 'square', 0.15, 0.2), 80);
  },

  powerup() {
    if (!this.soundEnabled || !this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.25);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {
      // Silently fail
    }
  },

  combo(level) {
    const baseFreq = 600 + Math.min(level, 20) * 40;
    this._play(baseFreq, 'sine', 0.1, 0.2);
  },

  bossHit() {
    this._play(80, 'sawtooth', 0.2, 0.35);
    this._playNoise(0.15, 0.2, 200, 800);
  },

  bossDefeat() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => this._play(freq, 'square', 0.25, 0.25), i * 120);
    });
  },

  buttonClick() {
    this._play(1000, 'sine', 0.04, 0.12);
  },

  levelComplete() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => this._play(freq, 'square', 0.2, 0.2), i * 100);
    });
  },

  ballBounce() {
    this._play(440, 'sine', 0.06, 0.12);
  },

  gameOver() {
    const notes = [523, 440, 349, 262];
    notes.forEach((freq, i) => {
      setTimeout(() => this._play(freq, 'square', 0.3, 0.2), i * 150);
    });
  },

  explosion() {
    this._play(60, 'sawtooth', 0.4, 0.35);
    this._playNoise(0.35, 0.3, 100, 400);
  },

  comboBreak() {
    this._play(300, 'square', 0.15, 0.15, -10);
    this._play(200, 'square', 0.2, 0.12, -20);
  },

  powerupExpire() {
    this._play(600, 'sine', 0.1, 0.1);
    this._play(400, 'sine', 0.15, 0.08);
  },

  chainReaction(depth) {
    const freq = 300 + depth * 50;
    this._play(freq, 'square', 0.08, 0.12);
  },

  megaCombo() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => this._play(freq, 'sine', 0.15, 0.2), i * 60);
    });
  }
};
