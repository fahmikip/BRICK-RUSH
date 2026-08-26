window.BR = window.BR || {};

BR.Storage = {
  _key: 'brickrush_save',
  _schemaVersion: 4,

  _defaults: {
    version: 4,
    coins: 0,
    bestScore: 0,
    totalBricksDestroyed: 0,
    totalCoinsEarned: 0,
    highestWave: 0,
    highestCombo: 0,
    highestLevel: 0,
    totalRuns: 0,
    totalPlayTime: 0,
    bossesDefeated: 0,
    currentArea: 0,
    selectedArea: 0,
    unlockedAreas: [0],
    defeatedBosses: {},
    coreTokens: 0,
    bossBestScores: {},
    permanentUpgrades: {
      startingDamage: 0,
      startingCritical: 0,
      criticalDamage: 0,
      startingPaddleWidth: 0,
      paddleSpeed: 0,
      startingShield: 0,
      coinGain: 0,
      scoreGain: 0,
      rewardMultiplier: 0,
      powerUpChance: 0,
      powerUpDuration: 0,
      startingBallSpeed: 0
    },
    achievements: {},
    unlocks: { area_1: true },
    skins: {
      balls: ['ball_default'],
      paddles: ['paddle_default'],
      activeBall: 'ball_default',
      activePaddle: 'paddle_default'
    },
    dailyScores: {},
    settings: {
      music: true,
      sound: true,
      vibration: true,
      reduceMotion: false,
      fullscreen: false,
      rageEvents: true
    },
    meta: {
      level: 1,
      xp: 0,
      totalXP: 0
    },
    missions: {
      daily: {},
      weekly: {}
    },
    statistics: {
      totalScore: 0,
      totalPowerUps: 0,
      totalCriticalHits: 0,
      totalExplosions: 0,
      totalLightningChains: 0,
      eliteWavesCleared: 0
    },
    daily: {
      lastDate: null,
      streak: 0,
      bestStreak: 0
    },
    playerTitle: 'Rookie',
    titles: { rookie: true },
    claimedRewards: {}
  },

  _data: null,

  _deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  _deepMerge(target, source) {
    var result = this._deepClone(target);
    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        if (
          source[key] !== null &&
          typeof source[key] === 'object' &&
          !Array.isArray(source[key]) &&
          target[key] !== undefined &&
          typeof target[key] === 'object' &&
          !Array.isArray(target[key])
        ) {
          result[key] = this._deepMerge(target[key], source[key]);
        } else if (Array.isArray(source[key])) {
          result[key] = this._deepClone(source[key]);
        } else if (result[key] === undefined) {
          result[key] = this._deepClone(source[key]);
        }
      }
    }
    return result;
  },

  _migrate(data) {
    if (!data || typeof data !== 'object') return this._deepClone(this._defaults);

    if (!data.version || data.version < 3) {
      var migrated = this._deepClone(this._defaults);
      if (data.coins !== undefined) migrated.coins = data.coins;
      if (data.bestScore !== undefined) migrated.bestScore = data.bestScore;
      if (data.totalBricksDestroyed !== undefined) migrated.totalBricksDestroyed = data.totalBricksDestroyed;
      if (data.totalCoinsEarned !== undefined) migrated.totalCoinsEarned = data.totalCoinsEarned;
      if (data.highestWave !== undefined) migrated.highestWave = data.highestWave;
      if (data.highestCombo !== undefined) migrated.highestCombo = data.highestCombo;
      if (data.highestLevel !== undefined) migrated.highestLevel = data.highestLevel;
      if (data.totalRuns !== undefined) migrated.totalRuns = data.totalRuns;
      if (data.totalPlayTime !== undefined) migrated.totalPlayTime = data.totalPlayTime;
      if (data.bossesDefeated !== undefined) migrated.bossesDefeated = data.bossesDefeated;
      if (data.currentArea !== undefined) migrated.currentArea = data.currentArea;
      if (data.unlockedAreas !== undefined) migrated.unlockedAreas = data.unlockedAreas;
      if (data.achievements !== undefined) migrated.achievements = data.achievements;
      if (data.settings !== undefined) migrated.settings = data.settings;
      if (data.ballSkins) migrated.skins.balls = data.ballSkins;
      if (data.paddleSkins) migrated.skins.paddles = data.paddleSkins;
      if (data.defeatedBosses !== undefined) migrated.defeatedBosses = data.defeatedBosses;
      if (data.coreTokens !== undefined) migrated.coreTokens = data.coreTokens;
      if (data.bossBestScores !== undefined) migrated.bossBestScores = data.bossBestScores;

      if (data.permanentUpgrades) {
        var old = data.permanentUpgrades;
        if (old.damage !== undefined) migrated.permanentUpgrades.startingDamage = old.damage;
        if (old.paddleWidth !== undefined) migrated.permanentUpgrades.startingPaddleWidth = old.paddleWidth;
        if (old.ballSpeed !== undefined) migrated.permanentUpgrades.startingBallSpeed = old.ballSpeed;
        if (old.coinMultiplier !== undefined) migrated.permanentUpgrades.coinGain = old.coinMultiplier;
        if (old.critChance !== undefined) migrated.permanentUpgrades.startingCritical = old.critChance;
        if (old.powerupChance !== undefined) migrated.permanentUpgrades.powerUpChance = old.powerupChance;
      }

      data = migrated;
    }

    if (data.version < 4) {
      if (!data.meta) data.meta = { level: 1, xp: 0, totalXP: 0 };
      if (!data.missions) data.missions = { daily: {}, weekly: {} };
      if (!data.statistics) data.statistics = { totalScore: 0, totalPowerUps: 0, totalCriticalHits: 0, totalExplosions: 0, totalLightningChains: 0, eliteWavesCleared: 0 };
      if (!data.daily) data.daily = { lastDate: null, streak: 0, bestStreak: 0 };
      if (!data.playerTitle) data.playerTitle = 'Rookie';
      if (!data.titles) data.titles = { rookie: true };
      if (!data.claimedRewards) data.claimedRewards = {};
      if (!data.settings) data.settings = {};
      if (data.settings.fullscreen === undefined) data.settings.fullscreen = false;
    }

    data.version = this._schemaVersion;
    return data;
  },

  load() {
    try {
      var raw = localStorage.getItem(this._key);
      if (raw === null) {
        this._data = this._deepClone(this._defaults);
        this.save();
        return this._data;
      }

      var parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        console.warn('BR.Storage: Corrupt save data detected, resetting to defaults.');
        this._data = this._deepClone(this._defaults);
        this.save();
        return this._data;
      }

      if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
        console.warn('BR.Storage: Invalid save data structure, resetting to defaults.');
        this._data = this._deepClone(this._defaults);
        this.save();
        return this._data;
      }

      parsed = this._migrate(parsed);
      this._data = this._deepMerge(this._defaults, parsed);
      this.save();
    } catch (e) {
      console.error('BR.Storage: Failed to load save data:', e);
      this._data = this._deepClone(this._defaults);
    }
    return this._data;
  },

  save() {
    try {
      var json = JSON.stringify(this._data);
      localStorage.setItem(this._key, json);
    } catch (e) {
      console.error('BR.Storage: Failed to save data:', e);
    }
  },

  reset() {
    this._data = this._deepClone(this._defaults);
    this.save();
  },

  get(path) {
    if (!this._data) {
      this.load();
    }

    var parts = path.split('.');
    var current = this._data;

    for (var i = 0; i < parts.length; i++) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return undefined;
      }
      current = current[parts[i]];
    }

    return current;
  },

  set(path, value) {
    if (!this._data) {
      this.load();
    }

    var parts = path.split('.');
    var current = this._data;

    for (var i = 0; i < parts.length - 1; i++) {
      var part = parts[i];
      if (current[part] === undefined || current[part] === null || typeof current[part] !== 'object') {
        current[part] = {};
      }
      current = current[part];
    }

    current[parts[parts.length - 1]] = value;
    this.save();
  },

  addCoins(amount) {
    amount = Math.max(0, Math.floor(amount));
    var multiplier = 1 + (this.get('permanentUpgrades.coinGain') || 0) * 0.05;
    var finalAmount = Math.floor(amount * multiplier);
    finalAmount = Math.max(0, finalAmount);

    this.set('coins', (this.get('coins') || 0) + finalAmount);
    this.set('totalCoinsEarned', (this.get('totalCoinsEarned') || 0) + finalAmount);

    return finalAmount;
  },

  spendCoins(amount) {
    amount = Math.max(0, Math.floor(amount));
    var coins = this.get('coins') || 0;
    if (coins < amount) return false;
    this.set('coins', coins - amount);
    return true;
  },

  canAfford(amount) {
    return (this.get('coins') || 0) >= amount;
  }
};
