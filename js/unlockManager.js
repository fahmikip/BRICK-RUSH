window.BR = window.BR || {};

BR.UnlockManager = {
  DEFINITIONS: [
    { id: 'area_1', category: 'area', name: 'NEON CITY', description: 'Starting area', icon: '🏙', color: '#00f0ff', unlocked: true, condition: null },
    { id: 'area_2', category: 'area', name: 'CYBER CORE', description: 'Reach Level 5', icon: '💾', color: '#00ff44', unlocked: false, condition: function(s) { return (s.highestLevel || 0) >= 5; } },
    { id: 'area_3', category: 'area', name: 'VOID SPACE', description: 'Reach Level 10', icon: '🌌', color: '#aa00ff', unlocked: false, condition: function(s) { return (s.highestLevel || 0) >= 10; } },
    { id: 'area_4', category: 'area', name: 'LAVA ZONE', description: 'Reach Level 15', icon: '🌋', color: '#ff4400', unlocked: false, condition: function(s) { return (s.highestLevel || 0) >= 15; } },
    { id: 'area_5', category: 'area', name: 'ICE PLANET', description: 'Reach Level 20', icon: '❄', color: '#00ccff', unlocked: false, condition: function(s) { return (s.highestLevel || 0) >= 20; } },
    { id: 'area_6', category: 'area', name: 'GALAXY', description: 'Reach Level 30', icon: '🪐', color: '#ff00aa', unlocked: false, condition: function(s) { return (s.highestLevel || 0) >= 30; } },

    { id: 'ball_neon', category: 'ball', name: 'NEON BALL', description: 'Reach Combo 25', icon: '🔵', color: '#00f0ff', unlocked: false, condition: function(s) { return (s.highestCombo || 0) >= 25; } },
    { id: 'ball_plasma', category: 'ball', name: 'PLASMA BALL', description: 'Destroy 1000 bricks', icon: '🟣', color: '#aa44ff', unlocked: false, condition: function(s) { return (s.totalBricksDestroyed || 0) >= 1000; } },
    { id: 'ball_fire', category: 'ball', name: 'FIRE BALL', description: 'Collect 5000 coins', icon: '🔴', color: '#ff4400', unlocked: false, condition: function(s) { return (s.totalCoinsEarned || 0) >= 5000; } },
    { id: 'ball_ice', category: 'ball', name: 'ICE BALL', description: 'Reach Level 15', icon: '⚪', color: '#00ccff', unlocked: false, condition: function(s) { return (s.highestLevel || 0) >= 15; } },
    { id: 'ball_galaxy', category: 'ball', name: 'GALAXY BALL', description: 'Reach Level 25', icon: '🟤', color: '#ff00aa', unlocked: false, condition: function(s) { return (s.highestLevel || 0) >= 25; } },

    { id: 'paddle_neon', category: 'paddle', name: 'NEON PADDLE', description: 'Play 50 runs', icon: '━', color: '#00f0ff', unlocked: false, condition: function(s) { return (s.totalRuns || 0) >= 50; } },
    { id: 'paddle_cyber', category: 'paddle', name: 'CYBER PADDLE', description: 'Reach Combo 50', icon: '━', color: '#00ff44', unlocked: false, condition: function(s) { return (s.highestCombo || 0) >= 50; } },
    { id: 'paddle_fire', category: 'paddle', name: 'FIRE PADDLE', description: 'Destroy 5000 bricks', icon: '━', color: '#ff4400', unlocked: false, condition: function(s) { return (s.totalBricksDestroyed || 0) >= 5000; } },
    { id: 'paddle_ice', category: 'paddle', name: 'ICE PADDLE', description: 'Reach Level 20', icon: '━', color: '#00ccff', unlocked: false, condition: function(s) { return (s.highestLevel || 0) >= 20; } },
    { id: 'paddle_void', category: 'paddle', name: 'VOID PADDLE', description: 'Collect 25000 coins total', icon: '━', color: '#aa44ff', unlocked: false, condition: function(s) { return (s.totalCoinsEarned || 0) >= 25000; } }
  ],

  init() {
    var save = BR.Storage.load();
    if (!save.unlocks) save.unlocks = {};
    for (var i = 0; i < this.DEFINITIONS.length; i++) {
      var def = this.DEFINITIONS[i];
      if (def.unlocked && !save.unlocks[def.id]) {
        save.unlocks[def.id] = true;
      }
    }
    BR.Storage.save();
  },

  isUnlocked(id) {
    var save = BR.Storage.load();
    return !!(save.unlocks && save.unlocks[id]);
  },

  checkAll() {
    var save = BR.Storage.load();
    if (!save.unlocks) save.unlocks = {};
    var newlyUnlocked = [];
    for (var i = 0; i < this.DEFINITIONS.length; i++) {
      var def = this.DEFINITIONS[i];
      if (save.unlocks[def.id]) continue;
      if (def.condition && def.condition(save)) {
        save.unlocks[def.id] = true;
        newlyUnlocked.push(def);
      }
    }
    if (newlyUnlocked.length > 0) {
      BR.Storage.save();
      for (var i = 0; i < newlyUnlocked.length; i++) {
        if (BR.Audio) BR.Audio.unlockSound();
        if (BR.Effects) {
          BR.Effects.addFloatingText(
            BR.Game ? BR.Game.width / 2 : 300,
            100 + i * 30,
            'UNLOCKED: ' + newlyUnlocked[i].name,
            newlyUnlocked[i].color || '#00ff88',
            { fontSize: 16, speed: 1, life: 2.5 }
          );
        }
      }
    }
    return newlyUnlocked;
  },

  getByCategory(category) {
    var results = [];
    for (var i = 0; i < this.DEFINITIONS.length; i++) {
      if (this.DEFINITIONS[i].category === category) results.push(this.DEFINITIONS[i]);
    }
    return results;
  },

  getAll() {
    return this.DEFINITIONS;
  }
};
