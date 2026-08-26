window.BR = window.BR || {};

BR.UpgradeManager = {
  collected: [],

  init() {
    this.collected = [];
  },

  getChoices(count) {
    count = count || 3;
    var available = BR.Upgrades.TEMP_DEFS.filter(function(d) {
      return !BR.UpgradeManager.collected.find(function(c) { return c.id === d.id; });
    });
    if (available.length === 0) {
      available = BR.Upgrades.TEMP_DEFS.slice();
    }
    var shuffled = available.slice();
    for (var i = shuffled.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = tmp;
    }
    var pool = [];
    for (var i = 0; i < shuffled.length; i++) {
      var weight = BR.Upgrades.getRarityWeight(shuffled[i].rarity);
      pool.push({ def: shuffled[i], weight: weight });
    }
    var results = [];
    var usedIds = {};
    var attempts = 0;
    while (results.length < count && attempts < 100) {
      attempts++;
      var totalWeight = 0;
      for (var i = 0; i < pool.length; i++) totalWeight += pool[i].weight;
      var roll = Math.random() * totalWeight;
      var acc = 0;
      for (var i = 0; i < pool.length; i++) {
        acc += pool[i].weight;
        if (roll < acc && !usedIds[pool[i].def.id]) {
          var existing = this.getUpgradeLevel(pool[i].def.id);
          results.push(this._createChoice(pool[i].def, existing));
          usedIds[pool[i].def.id] = true;
          break;
        }
      }
    }
    return results;
  },

  _createChoice(def, currentLevel) {
    var nextLevel = currentLevel + 1;
    var effect = this._calculateEffect(def, nextLevel);
    return {
      id: def.id,
      name: def.name,
      description: def.description,
      icon: def.icon,
      color: def.color,
      rarity: def.rarity,
      category: def.category,
      currentLevel: currentLevel,
      nextLevel: nextLevel,
      effectText: effect.text,
      effect: effect.value,
      def: def
    };
  },

  _calculateEffect(def, level) {
    var base = def.baseValue || 0.2;
    var scale = def.scale || 1;
    var total = base * level * scale;
    var text = '+' + Math.round(total * 100) + '% ' + (def.statName || '');
    return { value: total, text: text };
  },

  selectUpgrade(choice) {
    var existing = null;
    for (var i = 0; i < this.collected.length; i++) {
      if (this.collected[i].id === choice.id) {
        existing = this.collected[i];
        break;
      }
    }
    if (existing) {
      existing.level++;
    } else {
      this.collected.push({
        id: choice.id,
        level: 1,
        def: choice.def
      });
    }
    BR.BuildManager.recalculate();
    this._checkSynergies();
  },

  getUpgradeLevel(id) {
    for (var i = 0; i < this.collected.length; i++) {
      if (this.collected[i].id === id) return this.collected[i].level;
    }
    return 0;
  },

  getAllCollected() {
    return this.collected;
  },

  _checkSynergies() {
    var activeSynergies = [];
    for (var i = 0; i < BR.Upgrades.SYNERGIES.length; i++) {
      var syn = BR.Upgrades.SYNERGIES[i];
      var met = true;
      for (var j = 0; j < syn.requirements.length; j++) {
        var req = syn.requirements[j];
        if (this.getUpgradeLevel(req.id) < req.level) {
          met = false;
          break;
        }
      }
      if (met) activeSynergies.push(syn);
    }
    var prev = BR.BuildManager.activeSynergies || [];
    BR.BuildManager.activeSynergies = activeSynergies;
    for (var i = 0; i < activeSynergies.length; i++) {
      var isNew = true;
      for (var j = 0; j < prev.length; j++) {
        if (prev[j].id === activeSynergies[i].id) { isNew = false; break; }
      }
      if (isNew) {
        if (BR.Audio) BR.Audio.synergyActivate();
        if (BR.Juice) {
          BR.Juice.shake(8, 0.2);
          BR.Juice.flash(activeSynergies[i].color || '#ff00aa', 0.1);
        }
        if (BR.Effects) {
          BR.Effects.addFloatingText(
            BR.Game ? BR.Game.width / 2 : 300,
            120,
            activeSynergies[i].name + ' ACTIVATED!',
            activeSynergies[i].color || '#ff00aa',
            { fontSize: 18, speed: 1, life: 2 }
          );
        }
      }
    }
  },

  getActiveSynergies() {
    return BR.BuildManager.activeSynergies || [];
  }
};
