window.BR = window.BR || {};

BR.BuildManager = {
  cachedStats: null,
  activeSynergies: [],

  reset() {
    this.cachedStats = null;
    this.activeSynergies = [];
  },

  recalculate() {
    this.cachedStats = null;
  },

  getStats() {
    if (this.cachedStats) return this.cachedStats;
    this.cachedStats = this._calculateAll();
    return this.cachedStats;
  },

  getStat(name) {
    return this.getStats()[name] || 0;
  },

  _calculateAll() {
    var stats = {
      damageMultiplier: 1,
      criticalChance: 0.05,
      criticalDamage: 3,
      ballSpeed: 1,
      paddleWidth: 1,
      paddleSpeed: 1,
      coinMultiplier: 1,
      scoreMultiplier: 1,
      explosionRadius: 0,
      chainChance: 0,
      powerUpChance: 0,
      powerUpDuration: 1,
      magnetStrength: 0,
      pierceCount: 0,
      autoShield: false,
      ballSizeMult: 1,
      doubleStrike: 0,
      slowBricks: false,
      vampireHeal: false,
      explosiveHits: false
    };

    var pe = BR.PermanentUpgradeManager.getAllEffects();
    stats.damageMultiplier += (pe.startingDamage || 0);
    stats.criticalChance += (pe.startingCritical || 0);
    stats.criticalDamage += (pe.criticalDamage || 0);
    stats.ballSpeed += (pe.startingBallSpeed || 0);
    stats.paddleWidth += (pe.startingPaddleWidth || 0);
    stats.paddleSpeed += (pe.paddleSpeed || 0);
    stats.coinMultiplier += (pe.coinGain || 0);
    stats.scoreMultiplier += (pe.scoreGain || 0);
    stats.powerUpChance += (pe.powerUpChance || 0);
    stats.powerUpDuration += (pe.powerUpDuration || 0);

    var collected = BR.UpgradeManager.getAllCollected();
    var mods = {};
    for (var i = 0; i < collected.length; i++) {
      var upg = collected[i];
      var def = upg.def;
      var level = upg.level;
      var value = this._getDiminishingValue(def.baseValue || 0.2, def.scale || 1, level);
      mods[def.id] = value;
    }

    if (mods.damage_core) stats.damageMultiplier += mods.damage_core;
    if (mods.critical_core) stats.criticalChance += mods.critical_core;
    if (mods.critical_damage) stats.criticalDamage += mods.critical_damage;
    if (mods.ball_speed) stats.ballSpeed += mods.ball_speed;
    if (mods.paddle_width) stats.paddleWidth += mods.paddle_width;
    if (mods.paddle_speed) stats.paddleSpeed += mods.paddle_speed;
    if (mods.coin_bonus) stats.coinMultiplier += mods.coin_bonus;
    if (mods.score_bonus) stats.scoreMultiplier += mods.score_bonus;
    if (mods.magnet) stats.magnetStrength += mods.magnet;
    if (mods.explosion_radius) stats.explosionRadius += mods.explosion_radius;
    if (mods.lightning_chance) stats.chainChance += mods.lightning_chance;
    if (mods.chain_chance) stats.chainChance += mods.chain_chance;
    if (mods.powerup_chance) stats.powerUpChance += mods.powerup_chance;
    if (mods.powerup_duration) stats.powerUpDuration += mods.powerup_duration;
    if (mods.piercing) stats.pierceCount += Math.floor(mods.piercing / 0.15);
    if (mods.fire_damage) stats.damageMultiplier += mods.fire_damage;
    if (mods.shield) stats.autoShield = true;
    if (mods.ball_save) stats.autoShield = true;
    if (mods.reward_bonus) stats.coinMultiplier += mods.reward_bonus;
    if (mods.multiball_bonus) { /* handled in spawn logic */ }

    for (var i = 0; i < this.activeSynergies.length; i++) {
      var syn = this.activeSynergies[i];
      if (syn.apply) syn.apply(stats);
    }

    stats.damageMultiplier = Math.round(stats.damageMultiplier * 100) / 100;
    stats.criticalChance = Math.min(1, Math.round(stats.criticalChance * 100) / 100);
    stats.criticalDamage = Math.round(stats.criticalDamage * 100) / 100;
    stats.ballSpeed = Math.round(stats.ballSpeed * 100) / 100;
    stats.paddleWidth = Math.round(stats.paddleWidth * 100) / 100;
    stats.paddleSpeed = Math.round(stats.paddleSpeed * 100) / 100;
    stats.coinMultiplier = Math.round(stats.coinMultiplier * 100) / 100;
    stats.scoreMultiplier = Math.round(stats.scoreMultiplier * 100) / 100;

    return stats;
  },

  _getDiminishingValue(baseValue, scale, level) {
    var total = 0;
    for (var i = 1; i <= level; i++) {
      var factor = 1 - (i - 1) * 0.08;
      if (factor < 0.5) factor = 0.5;
      total += baseValue * scale * factor;
    }
    return total;
  },

  getStatPanelData() {
    var s = this.getStats();
    return [
      { label: 'DAMAGE', value: '+' + Math.round((s.damageMultiplier - 1) * 100) + '%', color: '#ff4400' },
      { label: 'CRITICAL', value: Math.round(s.criticalChance * 100) + '%', color: '#ffcc00' },
      { label: 'CRIT DAMAGE', value: '+' + Math.round((s.criticalDamage - 1) * 100) + '%', color: '#ff00aa' },
      { label: 'BALL SPEED', value: '+' + Math.round((s.ballSpeed - 1) * 100) + '%', color: '#4488ff' },
      { label: 'PADDLE', value: '+' + Math.round((s.paddleWidth - 1) * 100) + '%', color: '#00ff88' },
      { label: 'COIN BONUS', value: '+' + Math.round((s.coinMultiplier - 1) * 100) + '%', color: '#ffcc00' },
      { label: 'CHAIN', value: Math.round(s.chainChance * 100) + '%', color: '#aa44ff' },
      { label: 'EXPLOSION', value: Math.round(s.explosionRadius * 100) + '%', color: '#ff3344' }
    ];
  }
};
