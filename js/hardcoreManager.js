window.BR = window.BR || {};

BR.HardcoreManager = {
  active: false,
  config: {
    normal: {
      ballSpeedMult: 1,
      paddleWidthMult: 1,
      enemyHpMult: 1,
      comboDurationMult: 1,
      powerupChanceMult: 1,
      coinPenalty: 0,
      scorePenalty: 0,
      ballAngleRandom: 0,
      scoreMultiplier: 1,
      lives: 1
    },
    hardcore: {
      ballSpeedMult: 1.6,
      paddleWidthMult: 0.6,
      enemyHpMult: 2.0,
      comboDurationMult: 0.4,
      powerupChanceMult: 0.4,
      coinPenalty: 0.4,
      scorePenalty: 0.15,
      ballAngleRandom: 8 * (Math.PI / 180),
      scoreMultiplier: 2,
      lives: 3
    }
  },

  getSettings() {
    return this.active ? this.config.hardcore : this.config.normal;
  },

  toggle() {
    this.active = !this.active;
    return this.active;
  },

  setMode(isHardcore) {
    this.active = isHardcore;
  },

  applyToModifiers(modifiers) {
    if (!this.active) return modifiers;
    var s = this.config.hardcore;
    modifiers.ballSpeed = (modifiers.ballSpeed || 1) * s.ballSpeedMult;
    modifiers.paddleWidth = (modifiers.paddleWidth || 1) * s.paddleWidthMult;
    modifiers.damageMultiplier = (modifiers.damageMultiplier || 1);
    return modifiers;
  },

  applyToBall(ball) {
    if (!this.active) return;
    var s = this.config.hardcore;
    ball.baseSpeed *= s.ballSpeedMult;
    ball.speed = ball.baseSpeed;
  },

  applyToPaddle(paddle) {
    if (!this.active) return;
    var s = this.config.hardcore;
    paddle.baseWidth = Math.floor(paddle.baseWidth * s.paddleWidthMult);
    paddle.width = paddle.baseWidth;
  },

  applyToLevelConfig(config) {
    if (!this.active) return config;
    var s = this.config.hardcore;
    config.hpMultiplier *= s.enemyHpMult;
    return config;
  },

  applyToComboDuration() {
    if (!this.active) return;
    var s = this.config.hardcore;
    BR.Combo.config.baseDuration = 3 * s.comboDurationMult;
    BR.Combo.maxTimer = BR.Combo.config.baseDuration;
  },

  applyToPowerupChance(baseChance) {
    if (!this.active) return baseChance;
    return baseChance * this.config.hardcore.powerupChanceMult;
  },

  getCoinPenalty(coins) {
    if (!this.active) return 0;
    return Math.floor(coins * this.config.hardcore.coinPenalty);
  },

  getScorePenalty(score) {
    if (!this.active) return 0;
    return Math.floor(score * this.config.hardcore.scorePenalty);
  },

  getScoreMultiplier() {
    if (!this.active) return 1;
    return this.config.hardcore.scoreMultiplier;
  },

  addRandomAngleToBall(ball) {
    if (!this.active) return;
    var s = this.config.hardcore;
    if (s.ballAngleRandom > 0) {
      var randomAngle = (Math.random() - 0.5) * 2 * s.ballAngleRandom;
      var speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
      if (speed > 0) {
        var currentAngle = Math.atan2(ball.vy, ball.vx);
        var newAngle = currentAngle + randomAngle;
        ball.vx = Math.cos(newAngle) * speed;
        ball.vy = Math.sin(newAngle) * speed;
      }
    }
  }
};
