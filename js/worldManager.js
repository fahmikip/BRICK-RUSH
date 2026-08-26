window.BR = window.BR || {};

BR.WorldManager = {
  areas: [
    { id: 0, name: 'NEON CITY', description: 'The beginning of the journey', unlockRequirement: null, bossId: 'the-core', theme: { bg: '#0a0a1a', accent: '#00f0ff', particles: ['#00f0ff', '#0088cc', '#004488'] } },
    { id: 1, name: 'CYBER CORE', description: 'Mechanical fortress', unlockRequirement: { type: 'boss', bossId: 'the-core' }, bossId: 'hex-guardian', theme: { bg: '#0a1a0a', accent: '#00ff44', particles: ['#00ff44', '#00cc33', '#008822'] } },
    { id: 2, name: 'VOID SPACE', description: 'Dark cosmic void', unlockRequirement: { type: 'boss', bossId: 'hex-guardian' }, bossId: 'void-walker', theme: { bg: '#1a0a1a', accent: '#aa00ff', particles: ['#aa00ff', '#8800cc', '#660099'] } },
    { id: 3, name: 'LAVA ZONE', description: 'Molten inferno', unlockRequirement: { type: 'boss', bossId: 'void-walker' }, bossId: 'molten-lord', theme: { bg: '#1a0a0a', accent: '#ff4400', particles: ['#ff4400', '#ff6600', '#cc2200'] } },
    { id: 4, name: 'ICE PLANET', description: 'Frozen wasteland', unlockRequirement: { type: 'boss', bossId: 'molten-lord' }, bossId: 'frost-queen', theme: { bg: '#0a1a2a', accent: '#00ccff', particles: ['#00ccff', '#88ddff', '#0088cc'] } },
    { id: 5, name: 'GALAXY', description: 'The final frontier', unlockRequirement: { type: 'boss', bossId: 'frost-queen' }, bossId: 'galactic-core', theme: { bg: '#0a0a2a', accent: '#ff00aa', particles: ['#ff00aa', '#ff00cc', '#cc0088'] } }
  ],

  selectedArea: 0,

  getArea(index) {
    return this.areas[index] || this.areas[0];
  },

  getAreaByBossId(bossId) {
    for (let i = 0; i < this.areas.length; i++) {
      if (this.areas[i].bossId === bossId) return this.areas[i];
    }
    return this.areas[0];
  },

  isAreaUnlocked(areaIndex) {
    if (areaIndex === 0) return true;
    const area = this.areas[areaIndex];
    if (!area || !area.unlockRequirement) return true;
    
    const save = BR.Storage.load();
    const defeated = save.defeatedBosses || {};
    
    if (area.unlockRequirement.type === 'boss') {
      return !!defeated[area.unlockRequirement.bossId];
    }
    return false;
  },

  unlockArea(areaIndex) {
    // Areas are unlocked dynamically via isAreaUnlocked check
    // This method exists for future use (level-based unlocks etc)
  },

  selectArea(areaIndex) {
    if (this.isAreaUnlocked(areaIndex)) {
      this.selectedArea = areaIndex;
      BR.Storage.set('selectedArea', areaIndex);
      return true;
    }
    return false;
  },

  getSelectedArea() {
    return this.getArea(this.selectedArea);
  },

  init() {
    const saved = BR.Storage.get('selectedArea');
    if (saved !== undefined && saved !== null) {
      this.selectedArea = saved;
    }
    // Ensure selected area is unlocked
    if (!this.isAreaUnlocked(this.selectedArea)) {
      this.selectedArea = 0;
    }
  },

  isBossDefeated(bossId) {
    const save = BR.Storage.load();
    return !!(save.defeatedBosses && save.defeatedBosses[bossId]);
  },

  getBossBestScore(bossId) {
    const save = BR.Storage.load();
    const scores = save.bossBestScores || {};
    return scores[bossId] || { score: 0, time: 0, combo: 0 };
  },

  setBossBestScore(bossId, score, time, combo) {
    const save = BR.Storage.load();
    if (!save.bossBestScores) save.bossBestScores = {};
    const prev = save.bossBestScores[bossId] || { score: 0, time: 0, combo: 0 };
    save.bossBestScores[bossId] = {
      score: Math.max(prev.score, score),
      time: prev.time === 0 ? time : (time > 0 && time < prev.time ? time : prev.time),
      combo: Math.max(prev.combo, combo)
    };
    BR.Storage.save();
  },

  getCoreTokens() {
    const save = BR.Storage.load();
    return save.coreTokens || 0;
  },

  addCoreTokens(amount) {
    const save = BR.Storage.load();
    save.coreTokens = (save.coreTokens || 0) + amount;
    BR.Storage.save();
  },

  spendCoreTokens(amount) {
    const save = BR.Storage.load();
    const current = save.coreTokens || 0;
    if (current < amount) return false;
    save.coreTokens = current - amount;
    BR.Storage.save();
    return true;
  },

  getUnlockProgress() {
    const progress = [];
    for (let i = 0; i < this.areas.length; i++) {
      const area = this.areas[i];
      progress.push({
        area: area,
        unlocked: this.isAreaUnlocked(i),
        defeated: this.isBossDefeated(area.bossId),
        bestScore: this.getBossBestScore(area.bossId)
      });
    }
    return progress;
  }
};
