window.BR = window.BR || {};

BR.LevelGenerator = {
  patterns: ['grid', 'pyramid', 'diamond', 'checker', 'fortress', 'random', 'ring'],

  areas: [
    { name: 'NEON CITY',    bgColor: '#0a0a1a', accentColor: '#00f0ff', bossName: 'THE CORE' },
    { name: 'CYBER CORE',   bgColor: '#0a1a0a', accentColor: '#00ff44', bossName: 'HEX GUARDIAN' },
    { name: 'VOID SPACE',   bgColor: '#1a0a1a', accentColor: '#aa00ff', bossName: 'VOID WALKER' },
    { name: 'LAVA ZONE',    bgColor: '#1a0a0a', accentColor: '#ff4400', bossName: 'MOLTEN LORD' },
    { name: 'ICE PLANET',   bgColor: '#0a1a2a', accentColor: '#00ccff', bossName: 'FROST QUEEN' },
    { name: 'GALAXY',       bgColor: '#0a0a2a', accentColor: '#ff00aa', bossName: 'GALACTIC CORE' }
  ],

  getConfig(level, wave, canvasWidth, canvasHeight) {
    const difficultyMult = 1 + (level - 1) * 0.25 + (wave - 1) * 0.08;
    const patternIdx = (level - 1) % this.patterns.length;
    const pattern = this.patterns[patternIdx];

    const padding = 4;
    const brickW = Math.min(50, (canvasWidth - 40) / 8);
    const brickH = 20;
    const topOffset = 10;
    const sidePadding = 20;

    const cols = Math.floor((canvasWidth - sidePadding * 2) / (brickW + padding));
    const rows = Math.min(8, 3 + Math.floor(level / 2));

    const specialChance = this._getSpecialChance(level);
    const typeWeights = this._getTypeWeights(level);

    return {
      level: level,
      wave: wave,
      pattern: pattern,
      rows: rows,
      cols: cols,
      brickWidth: brickW,
      brickHeight: brickH,
      topOffset: topOffset,
      sidePadding: sidePadding,
      padding: padding,
      hpMultiplier: difficultyMult,
      specialChance: specialChance,
      typeWeights: typeWeights,
      canvasWidth: canvasWidth,
      canvasHeight: canvasHeight
    };
  },

  _getSpecialChance(level) {
    if (level <= 3) return 0.05;
    if (level <= 6) return 0.12;
    if (level <= 9) return 0.2;
    return 0.3;
  },

  _getTypeWeights(level) {
    const w = { normal: 70, strong: 15, armored: 0, explosive: 0, chain: 0, coin: 0, mystery: 0 };

    if (level >= 4) {
      w.coin = 4;
      w.normal -= 4;
    }
    if (level >= 7) {
      w.armored = 7;
      w.normal -= 7;
    }
    if (level >= 10) {
      w.explosive = 2;
      w.chain = 2;
      w.mystery = 2;
      w.normal -= 6;
    }

    if (w.normal < 40) w.normal = 40;
    return w;
  },

  _chooseType(typeWeights, specialChance) {
    if (Math.random() < specialChance) {
      let roll = Math.random() * 100;
      const specials = ['strong', 'armored', 'explosive', 'chain', 'coin', 'mystery'];
      for (const id of specials) {
        if (typeWeights[id] > 0) {
          roll -= typeWeights[id];
          if (roll <= 0) return BR.BrickTypeById[id] || BR.BrickTypes.NORMAL;
        }
      }
    }
    return BR.BrickTypes.NORMAL;
  },

  generate(config) {
    const bricks = [];
    const grid = this._buildGrid(config);

    for (let r = 0; r < config.rows; r++) {
      for (let c = 0; c < config.cols; c++) {
        if (!grid[r] || !grid[r][c]) continue;

        const x = config.sidePadding + c * (config.brickWidth + config.padding);
        const y = config.topOffset + r * (config.brickHeight + config.padding);
        const type = this._chooseType(config.typeWeights, config.specialChance);
        const brick = new BR.Brick(x, y, config.brickWidth, config.brickHeight, type, config.hpMultiplier);
        bricks.push(brick);
      }
    }

    return bricks;
  },

  _buildGrid(config) {
    switch (config.pattern) {
      case 'grid':     return this._patternGrid(config);
      case 'pyramid':  return this._patternPyramid(config);
      case 'diamond':  return this._patternDiamond(config);
      case 'checker':  return this._patternChecker(config);
      case 'fortress': return this._patternFortress(config);
      case 'random':   return this._patternRandom(config);
      case 'ring':     return this._patternRing(config);
      default:         return this._patternGrid(config);
    }
  },

  _patternGrid(config) {
    const grid = [];
    for (let r = 0; r < config.rows; r++) {
      grid[r] = [];
      for (let c = 0; c < config.cols; c++) {
        grid[r][c] = true;
      }
    }
    return grid;
  },

  _patternPyramid(config) {
    const grid = [];
    const center = Math.floor(config.cols / 2);
    for (let r = 0; r < config.rows; r++) {
      grid[r] = [];
      const rowWidth = Math.floor((config.rows - r) * (config.cols / config.rows)) + 1;
      const halfW = Math.floor(rowWidth / 2);
      for (let c = 0; c < config.cols; c++) {
        grid[r][c] = Math.abs(c - center) <= halfW;
      }
    }
    return grid;
  },

  _patternDiamond(config) {
    const grid = [];
    const centerR = Math.floor(config.rows / 2);
    const centerC = Math.floor(config.cols / 2);
    const maxDist = Math.floor(Math.min(config.rows, config.cols) / 2);
    for (let r = 0; r < config.rows; r++) {
      grid[r] = [];
      for (let c = 0; c < config.cols; c++) {
        const dist = Math.abs(r - centerR) + Math.abs(c - centerC);
        grid[r][c] = dist <= maxDist;
      }
    }
    return grid;
  },

  _patternChecker(config) {
    const grid = [];
    for (let r = 0; r < config.rows; r++) {
      grid[r] = [];
      for (let c = 0; c < config.cols; c++) {
        grid[r][c] = (r + c) % 2 === 0;
      }
    }
    return grid;
  },

  _patternFortress(config) {
    const grid = [];
    for (let r = 0; r < config.rows; r++) {
      grid[r] = [];
      for (let c = 0; c < config.cols; c++) {
        const isBorder = r === 0 || r === config.rows - 1 || c === 0 || c === config.cols - 1;
        const centerR = Math.floor(config.rows / 2);
        const centerC = Math.floor(config.cols / 2);
        const innerR1 = centerR - 1;
        const innerR2 = centerR + 1;
        const innerC1 = centerC - 2;
        const innerC2 = centerC + 2;
        const isInnerBlock = r >= innerR1 && r <= innerR2 && c >= innerC1 && c <= innerC2;
        grid[r][c] = isBorder || isInnerBlock;
      }
    }
    return grid;
  },

  _patternRandom(config) {
    const grid = [];
    for (let r = 0; r < config.rows; r++) {
      grid[r] = [];
      for (let c = 0; c < config.cols; c++) {
        grid[r][c] = Math.random() < 0.75;
      }
    }
    const centerR = Math.floor(config.rows / 2);
    const centerC = Math.floor(config.cols / 2);
    if (!grid[centerR] || !grid[centerR][centerC]) {
      grid[centerR] = grid[centerR] || [];
      grid[centerR][centerC] = true;
    }
    return grid;
  },

  _patternRing(config) {
    const grid = [];
    const centerR = (config.rows - 1) / 2;
    const centerC = (config.cols - 1) / 2;
    const outerR = Math.min(config.rows, config.cols) / 2 - 0.5;
    const innerR = outerR - 1.5;
    for (let r = 0; r < config.rows; r++) {
      grid[r] = [];
      for (let c = 0; c < config.cols; c++) {
        const dx = c - centerC;
        const dy = r - centerR;
        const dist = Math.sqrt(dx * dx + dy * dy);
        grid[r][c] = dist <= outerR && dist >= innerR;
      }
    }
    return grid;
  }
};

BR.Level = {
  level: 1,
  wave: 1,
  wavesPerLevel: 5,
  currentArea: 0,
  isBossWave: false,
  isEliteWave: false,

  areas: BR.LevelGenerator.areas,

  getCurrentArea() {
    return this.areas[this.currentArea] || this.areas[0];
  },

  generateWave(level, wave, canvasWidth, canvasHeight) {
    const isBoss = this.isBossWave;
    const isElite = this.isEliteWave;

    if (isBoss) return [];
    if (isElite) {
      if (BR.EliteManager) {
        return BR.EliteManager.generateEliteWave(level, wave, canvasWidth, canvasHeight);
      }
      return [];
    }

    const config = BR.LevelGenerator.getConfig(level, wave, canvasWidth, canvasHeight);
    return BR.LevelGenerator.generate(config);
  },

  nextWave() {
    this.wave++;
    if (this.wave > this.wavesPerLevel) {
      this.wave = 1;
      this.isBossWave = true;
      this.isEliteWave = false;
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
    return 'Wave ' + this.wave + '/' + this.wavesPerLevel;
  },

  getLevelLabel() {
    return this.getCurrentArea().name + ' - Level ' + this.level;
  }
};
