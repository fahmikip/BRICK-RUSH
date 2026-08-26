window.BR = window.BR || {};

BR.EliteManager = {
  isActive: false,
  ELITE_TYPES: {
    STRONG: { id: 'elite_strong', name: 'Elite Strong', hpMultiplier: 5, scoreMultiplier: 3, coinMultiplier: 3, color: '#ff6600', glow: '#ff8800', description: 'High HP' },
    EXPLOSIVE: { id: 'elite_explosive', name: 'Elite Explosive', hpMultiplier: 2, scoreMultiplier: 2, coinMultiplier: 2, color: '#ff0044', glow: '#ff2266', description: 'Large explosion', explosionRadius: 200 },
    CHAIN: { id: 'elite_chain', name: 'Elite Chain', hpMultiplier: 2, scoreMultiplier: 2, coinMultiplier: 2, color: '#aa44ff', glow: '#cc66ff', description: 'Chain attacks', chainCount: 5 },
    SHIELD: { id: 'elite_shield', name: 'Elite Shield', hpMultiplier: 3, armor: 3, scoreMultiplier: 3, coinMultiplier: 3, color: '#00ff88', glow: '#00ffaa', description: 'Armored' }
  },

  activate() {
    this.isActive = true;
  },

  deactivate() {
    this.isActive = false;
  },

  generateEliteWave(level, wave, canvasWidth, canvasHeight) {
    this.activate();
    const bricks = [];
    const config = BR.LevelGenerator.getConfig(level, wave, canvasWidth, canvasHeight);
    
    const typeKeys = Object.keys(this.ELITE_TYPES);
    const cols = config.cols;
    const rows = Math.min(4, Math.ceil(cols / 3));
    
    let colIdx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols && colIdx < cols; c++, colIdx++) {
        const typeKey = typeKeys[colIdx % typeKeys.length];
        const eliteType = this.ELITE_TYPES[typeKey];
        
        const x = config.sidePadding + c * (config.brickWidth + config.padding);
        const y = config.topOffset + r * (config.brickHeight + config.padding);
        
        const baseHp = Math.ceil(2 * config.hpMultiplier);
        const hp = Math.ceil(baseHp * eliteType.hpMultiplier);
        const armor = eliteType.armor ? Math.ceil(eliteType.armor * config.hpMultiplier) : 0;
        
        const brick = new BR.Brick(x, y, config.brickWidth, config.brickHeight, {
          id: eliteType.id,
          name: eliteType.name,
          baseHp: hp,
          armor: armor,
          scoreValue: Math.ceil(25 * eliteType.scoreMultiplier),
          coinValue: Math.ceil(2 * eliteType.coinMultiplier),
          color: eliteType.color,
          glow: eliteType.glow,
          weight: 0
        }, 1);
        
        brick.eliteType = eliteType;
        brick.isElite = true;
        
        if (eliteType.id === 'elite_explosive') {
          brick.explosionRadius = eliteType.explosionRadius || 150;
        }
        if (eliteType.id === 'elite_chain') {
          brick.chainCount = eliteType.chainCount || 4;
        }
        
        bricks.push(brick);
      }
    }
    
    return bricks;
  },

  getEliteRewardMultiplier() {
    return this.isActive ? 2 : 1;
  },

  getElitePowerupChanceBonus() {
    return this.isActive ? 0.15 : 0;
  },

  isEliteBrick(brick) {
    return brick && brick.isElite;
  },

  clear() {
    this.isActive = false;
  }
};
