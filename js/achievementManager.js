window.BR = window.BR || {};

BR.AchievementManager = {
  DEFINITIONS: [
    { id: 'brick_1', title: 'FIRST BREAK', description: 'Destroy your first brick', category: 'combat', target: 1, stat: 'totalBricksDestroyed', reward: { coins: 50, xp: 25 } },
    { id: 'brick_100', title: 'BRICK BREAKER', description: 'Destroy 100 bricks', category: 'combat', target: 100, stat: 'totalBricksDestroyed', reward: { coins: 200, xp: 50 } },
    { id: 'brick_1000', title: 'DEMOLITION', description: 'Destroy 1,000 bricks', category: 'combat', target: 1000, stat: 'totalBricksDestroyed', reward: { coins: 500, xp: 100 } },
    { id: 'brick_10000', title: 'BRICK DESTROYER', description: 'Destroy 10,000 bricks', category: 'combat', target: 10000, stat: 'totalBricksDestroyed', reward: { coins: 2000, xp: 250 } },
    { id: 'brick_50000', title: 'BRICK ANNIHILATOR', description: 'Destroy 50,000 bricks', category: 'combat', target: 50000, stat: 'totalBricksDestroyed', reward: { coins: 5000, xp: 500 } },

    { id: 'combo_10', title: 'COMBO STARTER', description: 'Reach combo x10', category: 'combo', target: 10, stat: 'highestCombo', reward: { coins: 100, xp: 50 } },
    { id: 'combo_25', title: 'COMBO KING', description: 'Reach combo x25', category: 'combo', target: 25, stat: 'highestCombo', reward: { coins: 300, xp: 75 } },
    { id: 'combo_50', title: 'INSANE', description: 'Reach combo x50', category: 'combo', target: 50, stat: 'highestCombo', reward: { coins: 500, xp: 100 } },
    { id: 'combo_100', title: 'UNSTOPPABLE', description: 'Reach combo x100', category: 'combo', target: 100, stat: 'highestCombo', reward: { coins: 1000, xp: 200 } },
    { id: 'combo_250', title: 'COMBO GOD', description: 'Reach combo x250', category: 'combo', target: 250, stat: 'highestCombo', reward: { coins: 2500, xp: 400 } },

    { id: 'coins_1000', title: 'SAVER', description: 'Earn 1,000 total coins', category: 'economy', target: 1000, stat: 'totalCoins', reward: { coins: 100, xp: 30 } },
    { id: 'coins_10000', title: 'RICH', description: 'Earn 10,000 total coins', category: 'economy', target: 10000, stat: 'totalCoins', reward: { coins: 500, xp: 75 } },
    { id: 'coins_100000', title: 'MILLIONAIRE', description: 'Earn 100,000 total coins', category: 'economy', target: 100000, stat: 'totalCoins', reward: { coins: 2000, xp: 200 } },
    { id: 'coins_1000000', title: 'TYCOON', description: 'Earn 1,000,000 total coins', category: 'economy', target: 1000000, stat: 'totalCoins', reward: { coins: 5000, xp: 500 } },

    { id: 'first_boss', title: 'BOSS HUNTER', description: 'Defeat your first boss', category: 'boss', target: 1, stat: 'bossesDefeated', reward: { coins: 300, xp: 75 } },
    { id: 'boss_5', title: 'BOSS SLAYER', description: 'Defeat 5 bosses', category: 'boss', target: 5, stat: 'bossesDefeated', reward: { coins: 1000, xp: 150 } },
    { id: 'boss_10', title: 'BOSS MASTER', description: 'Defeat 10 bosses', category: 'boss', target: 10, stat: 'bossesDefeated', reward: { coins: 2000, xp: 300 } },
    { id: 'boss_25', title: 'BOSS DESTROYER', description: 'Defeat 25 bosses', category: 'boss', target: 25, stat: 'bossesDefeated', reward: { coins: 5000, xp: 500 } },
    { id: 'boss_all', title: 'BOSS CONQUEROR', description: 'Defeat all 6 bosses', category: 'boss', target: 6, stat: 'uniqueBossesDefeated', reward: { coins: 10000, xp: 1000 } },

    { id: 'power_first', title: 'POWER UP', description: 'Use your first power-up', category: 'powerup', target: 1, stat: 'totalPowerUps', reward: { coins: 50, xp: 25 } },
    { id: 'power_50', title: 'POWER COLLECTOR', description: 'Use 50 power-ups', category: 'powerup', target: 50, stat: 'totalPowerUps', reward: { coins: 300, xp: 75 } },
    { id: 'power_200', title: 'POWER ADDICT', description: 'Use 200 power-ups', category: 'powerup', target: 200, stat: 'totalPowerUps', reward: { coins: 1000, xp: 200 } },

    { id: 'level_5', title: 'RISING STAR', description: 'Reach player level 5', category: 'progression', target: 5, stat: 'playerLevel', reward: { coins: 200, xp: 50 } },
    { id: 'level_10', title: 'VETERAN', description: 'Reach player level 10', category: 'progression', target: 10, stat: 'playerLevel', reward: { coins: 500, xp: 100 } },
    { id: 'level_25', title: 'ELITE', description: 'Reach player level 25', category: 'progression', target: 25, stat: 'playerLevel', reward: { coins: 2000, xp: 300 } },
    { id: 'level_50', title: 'LEGENDARY', description: 'Reach player level 50', category: 'progression', target: 50, stat: 'playerLevel', reward: { coins: 5000, xp: 500 } },
    { id: 'level_100', title: 'BRICK GOD', description: 'Reach player level 100', category: 'progression', target: 100, stat: 'playerLevel', reward: { coins: 10000, xp: 1000 } },

    { id: 'score_1m', title: 'MILLIONAIRE SCORE', description: 'Reach 1,000,000 score', category: 'special', target: 1000000, stat: 'bestScore', reward: { coins: 2000, xp: 300 } },
    { id: 'wave_50', title: 'ENDURANCE', description: 'Reach wave 50', category: 'special', target: 50, stat: 'highestWave', reward: { coins: 1000, xp: 200 } },
    { id: 'runs_100', title: 'DEDICATED', description: 'Complete 100 runs', category: 'special', target: 100, stat: 'totalRuns', reward: { coins: 3000, xp: 400 } }
  ],

  checkAll() {
    var stats = this._getStats();
    var save = BR.Storage._data;
    save.achievements = save.achievements || {};
    var newlyUnlocked = [];

    for (var i = 0; i < this.DEFINITIONS.length; i++) {
      var def = this.DEFINITIONS[i];
      if (save.achievements[def.id]) continue;

      var current = stats[def.stat] || 0;
      if (current >= def.target) {
        save.achievements[def.id] = { unlockedAt: Date.now() };
        newlyUnlocked.push(def);
      }
    }

    if (newlyUnlocked.length > 0) {
      BR.Storage.save();
    }

    for (var j = 0; j < newlyUnlocked.length; j++) {
      this._onUnlock(newlyUnlocked[j]);
    }

    return newlyUnlocked;
  },

  unlock(achievementId) {
    var save = BR.Storage._data;
    save.achievements = save.achievements || {};
    if (save.achievements[achievementId]) return false;

    var def = this.getDef(achievementId);
    if (!def) return false;

    save.achievements[achievementId] = { unlockedAt: Date.now() };
    BR.Storage.save();
    this._onUnlock(def);
    return true;
  },

  isUnlocked(id) {
    var achs = BR.Storage.get('achievements') || {};
    return !!achs[id];
  },

  isClaimed(id) {
    var save = BR.Storage._data;
    save.claimedRewards = save.claimedRewards || {};
    return !!save.claimedRewards['achievement:' + id];
  },

  getUnclaimedCount() {
    var save = BR.Storage._data;
    save.achievements = save.achievements || {};
    save.claimedRewards = save.claimedRewards || {};
    var count = 0;
    for (var id in save.achievements) {
      if (!save.achievements[id]) continue;
      if (!save.claimedRewards['achievement:' + id]) count++;
    }
    return count;
  },

  getDef(id) {
    for (var i = 0; i < this.DEFINITIONS.length; i++) {
      if (this.DEFINITIONS[i].id === id) return this.DEFINITIONS[i];
    }
    return null;
  },

  getProgress(id) {
    var def = this.getDef(id);
    if (!def) return null;
    var stats = this._getStats();
    var current = stats[def.stat] || 0;
    return {
      current: Math.min(current, def.target),
      target: def.target,
      ratio: Math.min(1, current / def.target),
      unlocked: this.isUnlocked(id)
    };
  },

  getAllProgress() {
    var results = [];
    for (var i = 0; i < this.DEFINITIONS.length; i++) {
      results.push({
        def: this.DEFINITIONS[i],
        progress: this.getProgress(this.DEFINITIONS[i].id)
      });
    }
    return results;
  },

  hasUnclaimedRewards() {
    var save = BR.Storage._data;
    save.claimedRewards = save.claimedRewards || {};
    var achs = save.achievements || {};
    for (var id in achs) {
      if (!achs[id]) continue;
      var rewardId = 'achievement:' + id;
      if (!save.claimedRewards[rewardId]) return true;
    }
    return false;
  },

  getAll() {
    var save = BR.Storage._data;
    save.achievements = save.achievements || {};
    save.claimedRewards = save.claimedRewards || {};
    var results = [];
    for (var i = 0; i < this.DEFINITIONS.length; i++) {
      var def = this.DEFINITIONS[i];
      var unlocked = !!save.achievements[def.id];
      var claimed = !!save.claimedRewards['achievement:' + def.id];
      results.push({
        id: def.id,
        name: def.title,
        title: def.title,
        description: def.description,
        desc: def.description,
        icon: '🏆',
        category: def.category,
        reward: def.reward,
        unlocked: unlocked,
        claimed: claimed
      });
    }
    return results;
  },

  claimAchievement(id) {
    var def = this.getDef(id);
    if (!def || !this.isUnlocked(id)) return false;

    var save = BR.Storage._data;
    save.claimedRewards = save.claimedRewards || {};
    var rewardId = 'achievement:' + id;
    if (save.claimedRewards[rewardId]) return false;

    save.claimedRewards[rewardId] = true;
    BR.Storage.save();
    return { coins: def.reward.coins || 0, xp: def.reward.xp || 0 };
  },

  claimReward(id) {
    var def = this.getDef(id);
    if (!def || !this.isUnlocked(id)) return false;

    var save = BR.Storage._data;
    save.claimedRewards = save.claimedRewards || {};
    var rewardId = 'achievement:' + id;
    if (save.claimedRewards[rewardId]) return false;

    save.claimedRewards[rewardId] = true;
    if (def.reward.coins) BR.Storage.addCoins(def.reward.coins);
    if (def.reward.xp) BR.MetaProgression.addXP(def.reward.xp);
    BR.Storage.save();
    return true;
  },

  _onUnlock(def) {
    if (BR.NotificationManager) {
      BR.NotificationManager.show('achievement', 'ACHIEVEMENT UNLOCKED', def.title + '\n' + def.description,
        (def.reward.coins ? '+' + def.reward.coins + ' COINS' : '') + (def.reward.xp ? ' +' + def.reward.xp + ' XP' : ''), 4000);
    }
    if (BR.Audio) BR.Audio.unlockSound();
    if (BR.Juice) { BR.Juice.shake(8, 0.3); BR.Juice.flash('#ffcc00', 0.15); }
  },

  _getStats() {
    var save = BR.Storage._data;
    var meta = save.meta || {};
    var bosses = save.defeatedBosses || {};
    var uniqueBossCount = 0;
    for (var k in bosses) { if (bosses[k]) uniqueBossCount++; }

    return {
      totalBricksDestroyed: save.totalBricksDestroyed || 0,
      highestCombo: save.highestCombo || 0,
      totalCoins: save.totalCoinsEarned || 0,
      bossesDefeated: save.bossesDefeated || 0,
      uniqueBossesDefeated: uniqueBossCount,
      totalPowerUps: (save.statistics && save.statistics.totalPowerUps) || 0,
      playerLevel: meta.level || 1,
      bestScore: save.bestScore || 0,
      highestWave: save.highestWave || 0,
      totalRuns: save.totalRuns || 0,
      totalCriticalHits: (save.statistics && save.statistics.totalCriticalHits) || 0,
      eliteWavesCleared: (save.statistics && save.statistics.eliteWavesCleared) || 0
    };
  },

  _legacyUnlock(id) {
    if (this.isUnlocked(id)) return;
    this.unlock(id);
  }
};
