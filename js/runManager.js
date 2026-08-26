window.BR = window.BR || {};

BR.RunManager = {
  state: null,
  isDaily: false,

  newRun(isDaily) {
    this.isDaily = !!isDaily;
    this.state = {
      level: 1,
      wave: 1,
      score: 0,
      displayScore: 0,
      combo: 0,
      bestCombo: 0,
      coins: 0,
      displayCoins: 0,
      upgrades: [],
      activePowerUps: [],
      currentArea: BR.Storage.get('currentArea') || 0,
      multiplier: 1,
      bricksDestroyed: 0,
      bossesDefeated: 0,
      startTime: Date.now(),
      dailySeed: isDaily ? BR.DailyChallenge.getTodaySeed() : null
    };
    BR.UpgradeManager.init();
    BR.PermanentUpgradeManager.init();
    BR.BuildManager.reset();
    BR.Combo.init();
    BR.EventQueue.clear();
    BR.Juice.init();
    BR.Powerups.init();
    BR.Particles.clear();
    BR.Effects.clear();
    return this.state;
  },

  getState() {
    if (!this.state) {
      this.state = this.newRun();
    }
    return this.state;
  },

  addScore(amount) {
    if (!this.state) return;
    var comboMult = BR.Combo.getScoreMultiplier();
    var buildMult = BR.BuildManager.getStat('scoreMultiplier');
    var final = Math.floor(amount * comboMult * buildMult);
    this.state.score += final;
    return final;
  },

  addCoins(amount) {
    if (!this.state) return 0;
    var comboMult = BR.Combo.getCoinMultiplier();
    var buildMult = BR.BuildManager.getStat('coinMultiplier');
    var permanentMult = 1 + (BR.Storage.get('permanentUpgrades.coinGain') || 0) * 0.05;
    var final = Math.floor(amount * comboMult * buildMult * permanentMult);
    if (BR.Game && BR.Game.doubleCoinActive) final *= 2;
    final = Math.max(0, final);
    this.state.coins += final;
    return final;
  },

  getRunCoins() {
    return this.state ? this.state.coins : 0;
  },

  getRunScore() {
    return this.state ? this.state.score : 0;
  },

  nextWave() {
    if (!this.state) return 'normal';
    this.state.wave++;
    var wavesPerLevel = BR.Level.wavesPerLevel;
    if (this.state.wave > wavesPerLevel) {
      this.state.wave = 1;
      this.state.level++;
      return 'level_complete';
    }
    if (this.state.wave === wavesPerLevel) {
      return 'elite';
    }
    return 'normal';
  },

  endRun() {
    if (!this.state) return null;
    var result = {
      score: this.state.score,
      bestCombo: this.state.bestCombo,
      coins: this.state.coins,
      level: this.state.level,
      wave: this.state.wave,
      bricksDestroyed: this.state.bricksDestroyed,
      duration: Date.now() - this.state.startTime
    };

    var save = BR.Storage.load();
    var isNewBest = result.score > (save.bestScore || 0);
    if (isNewBest) BR.Storage.set('bestScore', result.score);

    var highestWave = (result.level - 1) * BR.Level.wavesPerLevel + result.wave;
    BR.Storage.set('highestWave', Math.max(save.highestWave || 0, highestWave));
    BR.Storage.set('highestCombo', Math.max(save.highestCombo || 0, result.bestCombo));
    BR.Storage.set('totalBricksDestroyed', (save.totalBricksDestroyed || 0) + result.bricksDestroyed);
    BR.Storage.set('totalCoinsEarned', (save.totalCoinsEarned || 0) + result.coins);
    BR.Storage.set('totalRuns', (save.totalRuns || 0) + 1);
    BR.Storage.set('highestLevel', Math.max(save.highestLevel || 0, result.level));
    BR.Storage.set('totalPlayTime', (save.totalPlayTime || 0) + result.duration);

    var earned = BR.Storage.addCoins(result.coins);

    BR.UnlockManager.checkAll();
    this._saveDailyScore(result);

    this.state = null;
    return { result: result, earned: earned, isNewBest: isNewBest };
  },

  _saveDailyScore(result) {
    if (!this.isDaily) return;
    var today = BR.DailyChallenge.getTodaySeed();
    var save = BR.Storage.load();
    if (!save.dailyScores) save.dailyScores = {};
    var prev = save.dailyScores[today];
    if (!prev || result.score > prev.score) {
      save.dailyScores[today] = {
        score: result.score,
        level: result.level,
        completed: true,
        timestamp: Date.now()
      };
      BR.Storage.save();
    }
  },

  trackBrickDestroyed() {
    if (this.state) this.state.bricksDestroyed++;
  },

  updateBestCombo(combo) {
    if (this.state && combo > this.state.bestCombo) {
      this.state.bestCombo = combo;
    }
  },

  setLevel(lvl) {
    if (this.state) this.state.level = lvl;
  },

  setWave(wv) {
    if (this.state) this.state.wave = wv;
  },

  setArea(area) {
    if (this.state) this.state.currentArea = area;
  },

  isRunActive() {
    return this.state !== null;
  }
};
