window.BR = window.BR || {};

BR.Combo = {
  count: 0,
  timer: 0,
  maxTimer: 3,
  maxMultiplier: 10,
  highestCombo: 0,

  config: {
    baseDuration: 3,
    maxMultiplier: 10,
    milestoneThresholds: [5, 10, 25, 50, 100],
    milestoneNames: {
      5: 'GOOD!',
      10: 'GREAT!',
      25: 'AMAZING!',
      50: 'INSANE!',
      100: 'UNSTOPPABLE!'
    }
  },

  init() {
    this.count = 0;
    this.timer = 0;
    this.highestCombo = 0;
  },

  increment() {
    this.count++;
    this.timer = this.config.baseDuration;
    if (this.count > this.highestCombo) {
      this.highestCombo = this.count;
    }

    const milestone = this._getMilestone(this.count);
    if (milestone) {
      if (BR.Events) BR.Events.emit('comboMilestone', {
        combo: this.count,
        name: milestone
      });
    }

    if (BR.Events) {
      BR.Events.emit('comboIncrement', { combo: this.count });
    }
  },

  reset() {
    if (this.count >= 5 && BR.Events) {
      BR.Events.emit('comboBreak', { combo: this.count });
    }
    this.count = 0;
    this.timer = 0;
  },

  update(dt) {
    if (this.count <= 0) return;
    this.timer -= dt;
    if (this.timer <= 0) {
      this.reset();
    }
  },

  getTimerRatio() {
    if (this.count <= 0) return 0;
    return Math.max(0, this.timer / this.config.baseDuration);
  },

  getScoreMultiplier() {
    if (this.count <= 1) return 1;
    if (this.count <= 3) return 1 + (this.count - 1) * 0.1;
    if (this.count <= 5) return 1.2 + (this.count - 3) * 0.15;
    if (this.count <= 10) return 1.5 + (this.count - 5) * 0.1;
    return Math.min(3, 2 + (this.count - 10) * 0.05);
  },

  getCoinMultiplier() {
    if (this.count <= 1) return 1;
    if (this.count <= 5) return 1 + (this.count - 1) * 0.05;
    return Math.min(2, 1.2 + (this.count - 5) * 0.04);
  },

  _getMilestone(combo) {
    const thresholds = this.config.milestoneThresholds;
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (combo === thresholds[i]) {
        return this.config.milestoneNames[thresholds[i]];
      }
    }
    return null;
  },

  getTier() {
    if (this.count >= 50) return 3;
    if (this.count >= 25) return 2;
    if (this.count >= 5) return 1;
    return 0;
  }
};
