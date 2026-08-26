window.BR = window.BR || {};

BR.MetaProgression = {
  XP_VALUES: {
    brick: 1,
    criticalHit: 2,
    elite: 10,
    boss: 100,
    levelComplete: 25,
    mission: 100,
    achievement: 50,
    daily: 50,
    combo5: 5,
    combo10: 10,
    combo25: 25,
    combo50: 50,
    combo100: 100
  },

  xpForLevel(level) {
    if (level <= 1) return 0;
    return Math.floor(50 * level * (level - 1));
  },

  getXForLevel(level) {
    return this.xpForLevel(level);
  },

  getXForNextLevel() {
    return this.xpForLevel(this.getLevel() + 1);
  },

  getLevel() {
    return (BR.Storage.get('meta.level')) || 1;
  },

  getXP() {
    return (BR.Storage.get('meta.xp')) || 0;
  },

  addXP(amount) {
    if (amount <= 0) return null;
    amount = Math.floor(amount);
    var save = BR.Storage._data;
    if (!save.meta) save.meta = { level: 1, xp: 0, totalXP: 0 };
    save.meta.xp += amount;
    save.meta.totalXP += amount;

    var oldLevel = save.meta.level;
    var levelsGained = 0;
    while (save.meta.xp >= this.xpForLevel(save.meta.level + 1)) {
      save.meta.level++;
      levelsGained++;
    }
    BR.Storage.save();

    if (levelsGained > 0) {
      return { newLevel: save.meta.level, levelsGained: levelsGained };
    }
    return null;
  },

  getProgress() {
    var level = this.getLevel();
    var xp = this.getXP();
    var currentNeed = this.xpForLevel(level);
    var nextNeed = this.xpForLevel(level + 1);
    var range = nextNeed - currentNeed;
    return {
      level: level,
      xp: xp,
      currentXP: xp - currentNeed,
      nextXP: range,
      progress: range > 0 ? Math.min(1, (xp - currentNeed) / range) : 1
    };
  },

  getLevelUpRewards(level) {
    var rewards = [];
    rewards.push({ type: 'coins', amount: level * 50, label: '+' + (level * 50) + ' COINS' });

    if (level % 5 === 0) {
      var tokens = Math.floor(level / 5);
      rewards.push({ type: 'tokens', amount: tokens, label: '+' + tokens + ' CORE TOKEN' + (tokens > 1 ? 'S' : '') });
    }

    if (level % 10 === 0) {
      rewards.push({ type: 'permToken', amount: 1, label: '+1 PERM UPGRADE TOKEN' });
    }

    var titles = {
      5: { id: 'brick_breaker', name: 'Brick Breaker' },
      10: { id: 'destroyer', name: 'Destroyer' },
      25: { id: 'combo_master', name: 'Combo Master' },
      50: { id: 'neon_legend', name: 'Neon Legend' },
      100: { id: 'brick_god', name: 'Brick God' }
    };
    if (titles[level]) {
      rewards.push({ type: 'title', id: titles[level].id, name: titles[level].name, label: 'TITLE: ' + titles[level].name.toUpperCase() });
    }

    return rewards;
  },

  grantLevelUpRewards(level) {
    var rewards = this.getLevelUpRewards(level);
    var save = BR.Storage._data;
    save.claimedRewards = save.claimedRewards || {};
    save.titles = save.titles || {};

    var granted = [];
    for (var i = 0; i < rewards.length; i++) {
      var r = rewards[i];
      var rewardId = 'levelup:' + level + ':' + r.type + ':' + (r.id || r.amount);
      if (save.claimedRewards[rewardId]) continue;

      switch (r.type) {
        case 'coins':
          BR.Storage.addCoins(r.amount);
          break;
        case 'tokens':
          if (BR.WorldManager) BR.WorldManager.addCoreTokens(r.amount);
          break;
        case 'title':
          save.titles[r.id] = true;
          break;
        case 'permToken':
          break;
      }

      save.claimedRewards[rewardId] = true;
      granted.push(r);
    }
    BR.Storage.save();
    return granted;
  },

  checkLevelUp() {
    var save = BR.Storage._data;
    if (!save.meta) save.meta = { level: 1, xp: 0, totalXP: 0 };
    var oldLevel = save.meta.level;
    var levelsGained = 0;
    while (save.meta.xp >= this.xpForLevel(save.meta.level + 1)) {
      save.meta.level++;
      levelsGained++;
    }
    BR.Storage.save();
    if (levelsGained > 0) {
      return { newLevel: save.meta.level, levelsGained: levelsGained };
    }
    return null;
  },

  addStats(stats) {
    var save = BR.Storage._data;
    if (!save.statistics) save.statistics = {};
    for (var key in stats) {
      save.statistics[key] = (save.statistics[key] || 0) + stats[key];
    }
    BR.Storage.save();
  },

  getStats() {
    var save = BR.Storage._data;
    var meta = save.meta || {};
    return {
      level: meta.level || 1,
      xp: meta.xp || 0,
      totalXP: meta.totalXP || 0,
      totalBricks: save.totalBricksDestroyed || 0,
      totalCoins: save.totalCoinsEarned || 0,
      totalRuns: save.totalRuns || 0,
      bossesDefeated: save.bossesDefeated || 0,
      highestCombo: save.highestCombo || 0,
      highestLevel: save.highestLevel || 0,
      bestScore: save.bestScore || 0,
      totalPlayTime: save.totalPlayTime || 0,
      totalPowerUps: (save.statistics && save.statistics.totalPowerUps) || 0,
      totalCriticalHits: (save.statistics && save.statistics.totalCriticalHits) || 0,
      totalExplosions: (save.statistics && save.statistics.totalExplosions) || 0,
      totalLightningChains: (save.statistics && save.statistics.totalLightningChains) || 0,
      eliteWavesCleared: (save.statistics && save.statistics.eliteWavesCleared) || 0,
      totalScore: (save.statistics && save.statistics.totalScore) || 0
    };
  },

  getDefaultTitle() {
    var level = this.getLevel();
    if (level >= 100) return 'brick_god';
    if (level >= 50) return 'neon_legend';
    if (level >= 25) return 'combo_master';
    if (level >= 10) return 'destroyer';
    if (level >= 5) return 'brick_breaker';
    return 'rookie';
  },

  formatPlayTime(ms) {
    var totalSeconds = Math.floor(ms / 1000);
    var hours = Math.floor(totalSeconds / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) return hours + 'h ' + minutes + 'm';
    if (minutes > 0) return minutes + 'm ' + (totalSeconds % 60) + 's';
    return totalSeconds + 's';
  }
};
