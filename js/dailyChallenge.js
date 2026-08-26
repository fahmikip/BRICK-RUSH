window.BR = window.BR || {};

BR.DailyChallenge = {
  todayData: null,

  MODIFIERS: [
    { id: 'fire_only', name: 'FIRE ONLY', icon: '🔥', color: '#ff4400', desc: 'Fireball power-up more frequent', forcedUpgrade: 'fire_damage', apply: function(m) { m.powerUpChance = (m.powerUpChance || 0) + 0.3; } },
    { id: 'speed_run', name: 'SPEED RUN', icon: '💨', color: '#4488ff', desc: 'Ball speed +50%', forcedUpgrade: 'ball_speed', apply: function(m) { m.ballSpeed = (m.ballSpeed || 1) * 1.5; } },
    { id: 'giant_bricks', name: 'GIANT BRICKS', icon: '🧱', color: '#ff8800', desc: 'Brick HP x2', forcedUpgrade: 'damage_core', apply: function(m) { m.damageMultiplier = (m.damageMultiplier || 1) * 1.5; } },
    { id: 'one_ball', name: 'ONE BALL', icon: '⚪', color: '#aaaaaa', desc: 'No multiball power-up', forcedUpgrade: 'ball_save', apply: function(m) { m.noMultiball = true; } },
    { id: 'chaos', name: 'CHAOS', icon: '🌪', color: '#aa00ff', desc: 'Random brick patterns each wave', forcedUpgrade: 'explosion_radius', apply: function(m) { m.chaosMode = true; } },
    { id: 'critical', name: 'CRITICAL', icon: '⚡', color: '#ffcc00', desc: 'Critical chance +50%', forcedUpgrade: 'critical_core', apply: function(m) { m.criticalChance = (m.criticalChance || 0.05) + 0.5; } },
    { id: 'low_gravity', name: 'LOW GRAVITY', icon: '🌙', color: '#00ccff', desc: 'Ball bounces higher', forcedUpgrade: 'paddle_speed', apply: function(m) { m.ballSpeed = (m.ballSpeed || 1) * 0.85; m.paddleWidth = (m.paddleWidth || 1) * 1.15; } },
    { id: 'double_coins', name: 'DOUBLE COINS', icon: '💰', color: '#ffcc00', desc: 'Coins x2', forcedUpgrade: 'coin_bonus', apply: function(m) { m.coinMultiplier = (m.coinMultiplier || 1) * 2; } },
    { id: 'elite', name: 'ELITE', icon: '⭐', color: '#ff6600', desc: 'More elite bricks', forcedUpgrade: 'critical_damage', apply: function(m) { m.eliteChance = (m.eliteChance || 0) + 0.3; } },
    { id: 'berserk', name: 'BERSERK', icon: '💥', color: '#ff0044', desc: 'Damage +100%', forcedUpgrade: 'berserk', apply: function(m) { m.damageMultiplier = (m.damageMultiplier || 1) * 2; } }
  ],

  getTodaySeed() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  },

  generate() {
    var seed = this.getTodaySeed();
    var rng = new BR.SeedRandom('daily-' + seed);

    var modifierIdx = rng.nextInt(0, this.MODIFIERS.length - 1);
    var modifier = this.MODIFIERS[modifierIdx];

    var baseModifiers = {
      damageMultiplier: 1 + rng.nextInt(0, 3) * 0.15,
      ballSpeed: 1 + rng.nextInt(0, 2) * 0.1,
      paddleWidth: 1 + rng.nextInt(0, 2) * 0.1,
      coinMultiplier: 1 + rng.nextInt(1, 3) * 0.2
    };
    modifier.apply(baseModifiers);

    var reward = rng.nextInt(3, 8) * 100;

    var tempDefs = BR.Upgrades.TEMP_DEFS || [];
    var otherUpgrades = [];
    for (var i = 0; i < tempDefs.length; i++) {
      if (tempDefs[i].id !== modifier.forcedUpgrade) otherUpgrades.push(tempDefs[i].id);
    }
    var dailyUpgrades = [modifier.forcedUpgrade];
    if (otherUpgrades.length >= 2) {
      var shuffled = rng.shuffle(otherUpgrades);
      dailyUpgrades.push(shuffled[0], shuffled[1]);
    }

    this.todayData = {
      seed: seed,
      modifier: modifier,
      modifiers: baseModifiers,
      reward: reward,
      forcedUpgrades: dailyUpgrades,
      rng: rng
    };

    return this.todayData;
  },

  getData() {
    if (!this.todayData) this.generate();
    return this.todayData;
  },

  isCompletedToday() {
    var save = BR.Storage.load();
    var today = this.getTodaySeed();
    return !!(save.dailyScores && save.dailyScores[today] && save.dailyScores[today].completed);
  },

  getTodayBest() {
    var save = BR.Storage.load();
    var today = this.getTodaySeed();
    if (save.dailyScores && save.dailyScores[today]) {
      return save.dailyScores[today].score || 0;
    }
    return 0;
  },

  getStreak() {
    var save = BR.Storage._data;
    save.daily = save.daily || { lastDate: null, streak: 0, bestStreak: 0 };

    this._updateStreak(save);

    var today = this.getTodaySeed();
    if (save.dailyScores && save.dailyScores[today] && save.dailyScores[today].completed) {
      return save.daily.streak;
    }
    return save.daily.streak;
  },

  _updateStreak(save) {
    var today = this.getTodaySeed();
    var lastDate = save.daily.lastDate;

    if (!lastDate) {
      save.daily.lastDate = today;
      BR.Storage.save();
      return;
    }

    if (lastDate === today) return;

    var last = new Date(lastDate);
    var now = new Date(today);
    var diffDays = Math.floor((now - last) / 86400000);

    if (diffDays < 0) {
      save.daily.streak = 0;
      save.daily.lastDate = today;
      BR.Storage.save();
      return;
    }

    if (diffDays > 1) {
      var yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      var yKey = yesterday.getFullYear() + '-' + String(yesterday.getMonth() + 1).padStart(2, '0') + '-' + String(yesterday.getDate()).padStart(2, '0');
      if (!(save.dailyScores && save.dailyScores[yKey] && save.dailyScores[yKey].completed)) {
        save.daily.streak = 0;
      }
    }
  },

  completeToday(score) {
    var save = BR.Storage._data;
    var today = this.getTodaySeed();

    this._updateStreak(save);

    var isNewBest = false;
    if (!save.dailyScores) save.dailyScores = {};
    var prev = save.dailyScores[today];
    if (!prev || score > (prev.score || 0)) {
      save.dailyScores[today] = { score: score, level: BR.Level.level, completed: true, timestamp: Date.now() };
      isNewBest = true;
    }

    save.daily.lastDate = today;
    save.daily.streak = (save.daily.streak || 0) + 1;
    if (save.daily.streak > (save.daily.bestStreak || 0)) {
      save.daily.bestStreak = save.daily.streak;
    }
    BR.Storage.save();

    if (BR.MissionManager) BR.MissionManager.handleEvent('levelCompleted', {});

    return {
      isNewBest: isNewBest,
      streak: save.daily.streak,
      reward: this._getCompletionReward(save.daily.streak)
    };
  },

  _getCompletionReward(streak) {
    var data = this.getData();
    var reward = { coins: data.reward, xp: 100 };

    if (streak >= 30) { reward.coins += 5000; reward.xp += 500; reward.special = 'Cosmetic Skin'; }
    else if (streak >= 14) { reward.coins += 2500; reward.xp += 300; }
    else if (streak >= 7) { reward.coins += 1000; reward.xp += 200; }
    else if (streak >= 3) { reward.coins += 300; reward.xp += 100; }

    return reward;
  },

  getStreakRewards() {
    return [
      { days: 3, label: '3 DAY STREAK', coins: 300, xp: 100 },
      { days: 7, label: '7 DAY STREAK', coins: 1000, xp: 200 },
      { days: 14, label: '14 DAY STREAK', coins: 2500, xp: 300 },
      { days: 30, label: '30 DAY STREAK', coins: 5000, xp: 500 }
    ];
  },

  startRun() {
    var data = this.getData();
    var run = BR.RunManager.newRun(true);
    return run;
  }
};
