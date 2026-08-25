window.BR = window.BR || {};

BR.Storage = {
  _key: 'brickrush_save',

  _defaults: {
    coins: 0,
    bestScore: 0,
    totalBricksDestroyed: 0,
    totalCoinsEarned: 0,
    highestWave: 0,
    bossesDefeated: 0,
    currentArea: 0,
    unlockedAreas: [0],
    permanentUpgrades: {
      damage: 0,
      paddleWidth: 0,
      ballSpeed: 0,
      coinMultiplier: 0,
      critChance: 0,
      powerupChance: 0
    },
    achievements: {},
    ballSkins: [0],
    paddleSkins: [0],
    settings: {
      music: true,
      sound: true,
      vibration: true,
      reduceMotion: false
    }
  },

  _data: null,

  _deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  _deepMerge(target, source) {
    const result = this._deepClone(target);
    for (const key in source) {
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

  load() {
    try {
      const raw = localStorage.getItem(this._key);
      if (raw === null) {
        this._data = this._deepClone(this._defaults);
        this.save();
        return this._data;
      }

      let parsed;
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

      this._data = this._deepMerge(this._defaults, parsed);
    } catch (e) {
      console.error('BR.Storage: Failed to load save data:', e);
      this._data = this._deepClone(this._defaults);
    }
    return this._data;
  },

  save() {
    try {
      const json = JSON.stringify(this._data);
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

    const parts = path.split('.');
    let current = this._data;

    for (let i = 0; i < parts.length; i++) {
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

    const parts = path.split('.');
    let current = this._data;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (current[part] === undefined || current[part] === null || typeof current[part] !== 'object') {
        current[part] = {};
      }
      current = current[part];
    }

    current[parts[parts.length - 1]] = value;
    this.save();
  },

  addCoins(amount) {
    const multiplier = 1 + (this.get('permanentUpgrades.coinMultiplier') || 0) * 0.2;
    const finalAmount = Math.floor(amount * multiplier);

    this.set('coins', (this.get('coins') || 0) + finalAmount);
    this.set('totalCoinsEarned', (this.get('totalCoinsEarned') || 0) + finalAmount);

    return finalAmount;
  },

  getUpgradeCost(type) {
    const level = this.get('permanentUpgrades.' + type) || 0;
    return Math.floor(50 * Math.pow(1.8, level));
  },

  buyUpgrade(type) {
    const cost = this.getUpgradeCost(type);
    const coins = this.get('coins') || 0;

    if (coins < cost) {
      return false;
    }

    this.set('coins', coins - cost);
    this.set('permanentUpgrades.' + type, (this.get('permanentUpgrades.' + type) || 0) + 1);
    return true;
  }
};
