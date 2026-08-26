window.BR = window.BR || {};

BR.DailyChallenge = {
  todayData: null,

  getTodaySeed() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  },

  generate() {
    var seed = this.getTodaySeed();
    var rng = new BR.SeedRandom(seed);

    var modifiers = {
      damageMultiplier: 1 + rng.nextInt(0, 3) * 0.15,
      ballSpeed: 1 + rng.nextInt(0, 2) * 0.1,
      paddleWidth: 1 + rng.nextInt(-1, 2) * 0.1,
      coinMultiplier: 1 + rng.nextInt(1, 3) * 0.2
    };

    var themePool = [
      { name: 'FIRE ONLY', color: '#ff4400', icon: '🔥', forcedUpgrade: 'fire_damage' },
      { name: 'CRITICAL MASS', color: '#ffcc00', icon: '⚡', forcedUpgrade: 'critical_core' },
      { name: 'CHAIN LIGHTNING', color: '#aa44ff', icon: '🔗', forcedUpgrade: 'chain_chance' },
      { name: 'SPEED DEMON', color: '#4488ff', icon: '💨', forcedUpgrade: 'ball_speed' },
      { name: 'TANK MODE', color: '#00ff88', icon: '🛡', forcedUpgrade: 'paddle_width' },
      { name: 'RICH RUN', color: '#ffcc00', icon: '💰', forcedUpgrade: 'coin_bonus' },
      { name: 'EXPLOSIVE', color: '#ff0044', icon: '💣', forcedUpgrade: 'explosion_radius' },
      { name: 'POWER SURGE', color: '#ff00aa', icon: '⚡', forcedUpgrade: 'powerup_chance' }
    ];
    var theme = rng.pick(themePool);

    var reward = rng.nextInt(3, 8) * 100;

    var dailyUpgrades = [
      theme.forcedUpgrade,
      rng.pick(BR.Upgrades.TEMP_DEFS.filter(function(d) { return d.id !== theme.forcedUpgrade; }).map(function(d) { return d.id; })),
      rng.pick(BR.Upgrades.TEMP_DEFS.filter(function(d) { return d.id !== theme.forcedUpgrade; }).map(function(d) { return d.id; }))
    ];

    this.todayData = {
      seed: seed,
      theme: theme,
      modifiers: modifiers,
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
    var save = BR.Storage.load();
    if (!save.dailyScores) return 0;
    var streak = 0;
    var d = new Date();
    while (true) {
      var key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      if (save.dailyScores[key] && save.dailyScores[key].completed) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  },

  startRun() {
    var data = this.getData();
    var run = BR.RunManager.newRun(true);
    return run;
  }
};
