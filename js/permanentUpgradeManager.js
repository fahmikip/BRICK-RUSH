window.BR = window.BR || {};

BR.PermanentUpgradeManager = {
  init() {
    var save = BR.Storage.load();
    if (!save.permanentUpgrades) {
      save.permanentUpgrades = {};
      BR.Storage.save();
    }
  },

  getLevel(id) {
    var save = BR.Storage.load();
    return (save.permanentUpgrades && save.permanentUpgrades[id]) || 0;
  },

  getCost(id) {
    var level = this.getLevel(id);
    var def = this.getDef(id);
    if (!def) return Infinity;
    return Math.round(def.baseCost * Math.pow(def.growthRate, level));
  },

  canAfford(id) {
    var cost = this.getCost(id);
    var coins = BR.Storage.get('coins') || 0;
    return coins >= cost;
  },

  purchase(id) {
    if (!this.canAfford(id)) return false;
    var cost = this.getCost(id);
    var coins = BR.Storage.get('coins') || 0;
    var def = this.getDef(id);
    if (!def) return false;
    var currentLevel = this.getLevel(id);
    if (currentLevel >= def.maxLevel) return false;

    BR.Storage.set('coins', coins - cost);
    var save = BR.Storage.load();
    if (!save.permanentUpgrades) save.permanentUpgrades = {};
    save.permanentUpgrades[id] = currentLevel + 1;
    BR.Storage.save();

    BR.BuildManager.recalculate();
    return true;
  },

  getDef(id) {
    for (var i = 0; i < BR.Upgrades.PERMANENT_DEFS.length; i++) {
      if (BR.Upgrades.PERMANENT_DEFS[i].id === id) return BR.Upgrades.PERMANENT_DEFS[i];
    }
    return null;
  },

  getAllDefs() {
    return BR.Upgrades.PERMANENT_DEFS;
  },

  getEffect(id) {
    var def = this.getDef(id);
    if (!def) return 0;
    var level = this.getLevel(id);
    return def.effectPerLevel * level;
  },

  getAllEffects() {
    var effects = {};
    for (var i = 0; i < BR.Upgrades.PERMANENT_DEFS.length; i++) {
      var def = BR.Upgrades.PERMANENT_DEFS[i];
      effects[def.id] = this.getEffect(def.id);
    }
    return effects;
  }
};
