window.BR = window.BR || {};

BR.EnduranceManager = {
  active: false,
  waveCount: 0,
  bossEvery: 5,
  eliteEvery: 3,
  difficultyScale: 0.5,
  specialBrickCap: 0.6,
  scoreMultiplier: 1.5,
  coinMultiplier: 1.3,

  start() {
    this.active = true;
    this.waveCount = 0;
  },

  stop() {
    this.active = false;
    this.waveCount = 0;
  },

  getDifficultyMultiplier(level, wave) {
    if (!this.active) {
      return 1 + (level - 1) * 0.25 + (wave - 1) * 0.08;
    }
    return 1 + (level - 1) * this.difficultyScale + (wave - 1) * 0.12;
  },

  getSpecialChance(level) {
    if (!this.active) {
      if (level <= 3) return 0.05;
      if (level <= 6) return 0.12;
      if (level <= 9) return 0.2;
      return 0.3;
    }
    var base = Math.min(this.specialBrickCap, 0.05 + level * 0.03);
    return base;
  },

  shouldBossWave(level, wave) {
    if (!this.active) return level % 10 === 0 && wave === 1;
    return wave === 1 && level % this.bossEvery === 0;
  },

  shouldEliteWave(wave) {
    if (!this.active) return wave === BR.Level.wavesPerLevel;
    return wave % this.eliteEvery === 0;
  },

  getWavesPerLevel() {
    return 5;
  },

  getScoreMultiplier() {
    return this.active ? this.scoreMultiplier : 1;
  },

  getCoinMultiplier() {
    return this.active ? this.coinMultiplier : 1;
  },

  incrementWave() {
    this.waveCount++;
  },

  getStats() {
    return {
      active: this.active,
      wavesCompleted: this.waveCount,
      bossFrequency: 'Every ' + this.bossEvery + ' levels',
      eliteFrequency: 'Every ' + this.eliteEvery + ' waves',
      difficultyScale: '+' + Math.round(this.difficultyScale * 100) + '% per level'
    };
  }
};
