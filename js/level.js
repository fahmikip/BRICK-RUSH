window.BR = window.BR || {};

BR.Level = {
  level: 1,
  wave: 1,
  wavesPerLevel: 5,
  isBossWave: false,
  isEliteWave: false,

  areas: [
    { name: 'NEON CITY', bgColor: '#0a0a1a', accentColor: '#00f0ff', bossName: 'THE CORE', waves: 5 },
    { name: 'CYBER CORE', bgColor: '#0a1a0a', accentColor: '#00ff44', bossName: 'HEX GUARDIAN', waves: 5 },
    { name: 'VOID SPACE', bgColor: '#1a0a1a', accentColor: '#aa00ff', bossName: 'VOID WALKER', waves: 5 },
    { name: 'LAVA ZONE', bgColor: '#1a0a0a', accentColor: '#ff4400', bossName: 'MOLTEN LORD', waves: 5 },
    { name: 'ICE PLANET', bgColor: '#0a1a2a', accentColor: '#00ccff', bossName: 'FROST QUEEN', waves: 5 },
    { name: 'GALAXY', bgColor: '#0a0a2a', accentColor: '#ff00aa', bossName: 'GALACTIC CORE', waves: 5 }
  ],

  currentArea: 0,

  generateWave(level, wave, canvasWidth, canvasHeight) {
    const bricks = [];
    const isBoss = wave === 0;
    const isElite = wave === this.wavesPerLevel;

    if (isBoss) return bricks;

    const difficultyMult = 1 + (level - 1) * 0.3 + (wave - 1) * 0.1;

    const padding = 4;
    const brickW = 50;
    const brickH = 20;
    const topOffset = 60;
    const sidePadding = 20;

    const cols = Math.floor((canvasWidth - sidePadding * 2) / (brickW + padding));
    const rows = Math.min(8, 3 + Math.floor(level / 2));

    const startX = (canvasWidth - cols * (brickW + padding)) / 2;

    const patterns = ['grid', 'pyramid', 'checker', 'diamond', 'random'];
    const pattern = patterns[(level - 1) % patterns.length];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = startX + c * (brickW + padding);
        const y = topOffset + r * (brickH + padding);

        if (!this._shouldPlace(pattern, r, c, rows, cols)) continue;

        const type = this._chooseBrickType(level, wave, r, c, rows, cols, isElite);

        const brick = new BR.Brick(x, y, brickW, brickH, type, difficultyMult);
        bricks.push(brick);
      }
    }

    return bricks;
  },

  _shouldPlace(pattern, row, col, totalRows, totalCols) {
    switch (pattern) {
      case 'grid':
        return true;

      case 'pyramid': {
        const center = Math.floor(totalCols / 2);
        const distFromCenter = Math.abs(col - center);
        const maxDist = Math.floor(totalRows - row) * 0.8;
        return distFromCenter <= maxDist;
      }

      case 'checker':
        return (row + col) % 2 === 0;

      case 'diamond': {
        const centerR = Math.floor(totalRows / 2);
        const centerC = Math.floor(totalCols / 2);
        const dist = Math.abs(row - centerR) + Math.abs(col - centerC);
        return dist <= Math.floor(totalRows / 2);
      }

      case 'random':
        return Math.random() < 0.75;

      default:
        return true;
    }
  },

  _chooseBrickType(level, wave, row, col, totalRows, totalCols, isElite) {
    if (isElite) {
      const rand = Math.random();
      if (rand < 0.15) return BR.BrickTypes.ELITE;
      if (rand < 0.25) return BR.BrickTypes.ARMORED;
      if (rand < 0.35) return BR.BrickTypes.EXPLOSIVE;
      if (rand < 0.45) return BR.BrickTypes.CHAIN;
      if (rand < 0.50) return BR.BrickTypes.MYSTERY;
    }

    const rand = Math.random();
    const specialChance = Math.min(0.3, level * 0.03);

    if (rand < 0.02 + specialChance * 0.5) return BR.BrickTypes.EXPLOSIVE;
    if (rand < 0.04 + specialChance * 0.5) return BR.BrickTypes.CHAIN;
    if (rand < 0.06 + specialChance) return BR.BrickTypes.COIN;
    if (rand < 0.08 + specialChance * 0.3) return BR.BrickTypes.MYSTERY;
    if (rand < 0.12 + specialChance * 0.5) return BR.BrickTypes.STRONG;
    if (rand < 0.14 + specialChance * 0.3) return BR.BrickTypes.ARMORED;

    return BR.BrickTypes.NORMAL;
  },

  getCurrentArea() {
    return this.areas[this.currentArea] || this.areas[0];
  },

  nextWave() {
    this.wave++;
    if (this.wave > this.wavesPerLevel) {
      this.wave = 1;
      this.isBossWave = true;
      return 'boss';
    }
    if (this.wave === this.wavesPerLevel) {
      this.isEliteWave = true;
      return 'elite';
    }
    this.isEliteWave = false;
    return 'normal';
  },

  completeLevel() {
    this.level++;
    this.wave = 1;
    this.isBossWave = false;
    this.isEliteWave = false;

    if ((this.level - 1) % 5 === 0 && this.currentArea < this.areas.length - 1) {
      this.currentArea++;
      return 'area_unlock';
    }
    return 'next';
  },

  shouldBossWave() {
    return this.isBossWave;
  },

  reset() {
    this.level = 1;
    this.wave = 1;
    this.isBossWave = false;
    this.isEliteWave = false;
    this.currentArea = 0;
  },

  getWaveLabel() {
    if (this.isBossWave) return 'BOSS';
    if (this.isEliteWave) return 'ELITE WAVE';
    return 'Wave ' + this.wave;
  },

  getLevelLabel() {
    return this.getCurrentArea().name + ' - Level ' + this.level;
  }
};