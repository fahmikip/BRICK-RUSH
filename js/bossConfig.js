window.BR = window.BR || {};

BR.BossConfig = {
  bosses: {
    'the-core': {
      id: 'the-core',
      name: 'THE CORE',
      areaId: 0,
      baseHp: 5000,
      contactDamage: 1,
      moveSpeed: 80,
      baseAttackCooldown: 3000,
      width: 120,
      height: 60,
      color: '#00f0ff',
      glowColor: '#00f0ff',
      phases: [
        { hpThreshold: 0.75, name: 'STABLE', description: 'Stable energy output', moveSpeedMult: 1.0, attackCooldownMult: 1.0 },
        { hpThreshold: 0.50, name: 'OVERLOAD', description: 'Overloading power core', moveSpeedMult: 1.3, attackCooldownMult: 0.7, spawnMinions: true },
        { hpThreshold: 0.25, name: 'CRITICAL', description: 'Critical systems failing', moveSpeedMult: 1.5, attackCooldownMult: 0.5, laserEnabled: true, shieldRegen: true },
        { hpThreshold: 0.00, name: 'ENRAGED', description: 'Total system failure', moveSpeedMult: 2.0, attackCooldownMult: 0.3, shockwaveEnabled: true }
      ],
      shield: {
        maxHp: 1500,
        regenDelay: 5000,
        regenRate: 200,
        damageReduction: 0.5
      },
      weakPoint: {
        radius: 20,
        damageMultiplier: 2.0,
        critMultiplier: 2.0
      },
      attacks: ['projectile', 'spawn_minions', 'laser', 'shockwave'],
      attackUnlock: {
        projectile: 0,
        spawn_minions: 1,
        laser: 2,
        shockwave: 3
      },
      rewards: {
        firstClear: { coins: 1000, tokens: 1, score: 500 },
        replay: { coins: 250, tokens: 0, score: 250 }
      }
    },
    'hex-guardian': {
      id: 'hex-guardian',
      name: 'HEX GUARDIAN',
      areaId: 1,
      baseHp: 8000,
      contactDamage: 1,
      moveSpeed: 90,
      baseAttackCooldown: 2800,
      width: 130,
      height: 65,
      color: '#00ff44',
      glowColor: '#00ff44',
      phases: [
        { hpThreshold: 0.66, name: 'CALCULATED', moveSpeedMult: 1.0, attackCooldownMult: 1.0 },
        { hpThreshold: 0.33, name: 'GLITCHING', moveSpeedMult: 1.4, attackCooldownMult: 0.6, spawnMinions: true, laserEnabled: true },
        { hpThreshold: 0.00, name: 'CORRUPTED', moveSpeedMult: 1.8, attackCooldownMult: 0.4, shockwaveEnabled: true }
      ],
      shield: { maxHp: 2000, regenDelay: 4000, regenRate: 250, damageReduction: 0.5 },
      weakPoint: { radius: 18, damageMultiplier: 2.0, critMultiplier: 2.0 },
      attacks: ['projectile', 'spawn_minions', 'laser', 'shockwave'],
      attackUnlock: { projectile: 0, spawn_minions: 0, laser: 1, shockwave: 2 },
      rewards: { firstClear: { coins: 1500, tokens: 2, score: 1000 }, replay: { coins: 375, tokens: 1, score: 500 } }
    },
    'void-walker': {
      id: 'void-walker',
      name: 'THE NULL',
      areaId: 2,
      baseHp: 12000,
      contactDamage: 1,
      moveSpeed: 100,
      baseAttackCooldown: 2500,
      width: 140,
      height: 70,
      color: '#aa00ff',
      glowColor: '#aa00ff',
      phases: [
        { hpThreshold: 0.50, name: 'PHANTOM', moveSpeedMult: 1.0, attackCooldownMult: 1.0 },
        { hpThreshold: 0.00, name: 'ANNIHILATION', moveSpeedMult: 2.0, attackCooldownMult: 0.4, spawnMinions: true, laserEnabled: true, shockwaveEnabled: true }
      ],
      shield: { maxHp: 3000, regenDelay: 3000, regenRate: 300, damageReduction: 0.5 },
      weakPoint: { radius: 16, damageMultiplier: 2.5, critMultiplier: 2.0 },
      attacks: ['projectile', 'spawn_minions', 'laser', 'shockwave'],
      attackUnlock: { projectile: 0, spawn_minions: 0, laser: 0, shockwave: 1 },
      rewards: { firstClear: { coins: 2000, tokens: 3, score: 2000 }, replay: { coins: 500, tokens: 1, score: 1000 } }
    },
    'molten-lord': {
      id: 'molten-lord', name: 'THE MOLTEN LORD', areaId: 3, baseHp: 18000, contactDamage: 2, moveSpeed: 95, baseAttackCooldown: 2200,
      width: 150, height: 75, color: '#ff4400', glowColor: '#ff4400',
      phases: [
        { hpThreshold: 0.50, name: 'SMOLDERING', moveSpeedMult: 1.0, attackCooldownMult: 1.0 },
        { hpThreshold: 0.00, name: 'ERUPTION', moveSpeedMult: 1.8, attackCooldownMult: 0.3, spawnMinions: true, laserEnabled: true, shockwaveEnabled: true }
      ],
      shield: { maxHp: 4000, regenDelay: 2500, regenRate: 350, damageReduction: 0.5 },
      weakPoint: { radius: 22, damageMultiplier: 2.0, critMultiplier: 2.0 },
      attacks: ['projectile', 'spawn_minions', 'laser', 'shockwave'],
      attackUnlock: { projectile: 0, spawn_minions: 0, laser: 0, shockwave: 0 },
      rewards: { firstClear: { coins: 2500, tokens: 4, score: 3000 }, replay: { coins: 625, tokens: 1, score: 1500 } }
    },
    'frost-queen': {
      id: 'frost-queen', name: 'THE FROST QUEEN', areaId: 4, baseHp: 25000, contactDamage: 2, moveSpeed: 110, baseAttackCooldown: 2000,
      width: 160, height: 80, color: '#00ccff', glowColor: '#00ccff',
      phases: [
        { hpThreshold: 0.50, name: 'FREEZING', moveSpeedMult: 1.0, attackCooldownMult: 1.0 },
        { hpThreshold: 0.00, name: 'ABSOLUTE ZERO', moveSpeedMult: 2.0, attackCooldownMult: 0.3, spawnMinions: true, laserEnabled: true, shockwaveEnabled: true }
      ],
      shield: { maxHp: 5000, regenDelay: 2000, regenRate: 400, damageReduction: 0.5 },
      weakPoint: { radius: 20, damageMultiplier: 2.5, critMultiplier: 2.0 },
      attacks: ['projectile', 'spawn_minions', 'laser', 'shockwave'],
      attackUnlock: { projectile: 0, spawn_minions: 0, laser: 0, shockwave: 0 },
      rewards: { firstClear: { coins: 3000, tokens: 5, score: 5000 }, replay: { coins: 750, tokens: 2, score: 2500 } }
    },
    'galactic-core': {
      id: 'galactic-core', name: 'THE GALACTIC CORE', areaId: 5, baseHp: 35000, contactDamage: 3, moveSpeed: 120, baseAttackCooldown: 1800,
      width: 170, height: 85, color: '#ff00aa', glowColor: '#ff00aa',
      phases: [
        { hpThreshold: 0.50, name: 'STELLAR', moveSpeedMult: 1.0, attackCooldownMult: 1.0 },
        { hpThreshold: 0.00, name: 'SUPERNOVA', moveSpeedMult: 2.2, attackCooldownMult: 0.25, spawnMinions: true, laserEnabled: true, shockwaveEnabled: true }
      ],
      shield: { maxHp: 7000, regenDelay: 1500, regenRate: 500, damageReduction: 0.5 },
      weakPoint: { radius: 24, damageMultiplier: 3.0, critMultiplier: 2.0 },
      attacks: ['projectile', 'spawn_minions', 'laser', 'shockwave'],
      attackUnlock: { projectile: 0, spawn_minions: 0, laser: 0, shockwave: 0 },
      rewards: { firstClear: { coins: 5000, tokens: 10, score: 10000 }, replay: { coins: 1250, tokens: 3, score: 5000 } }
    }
  },

  getBossForArea(areaIndex) {
    const keys = Object.keys(this.bosses);
    if (areaIndex < keys.length) return this.bosses[keys[areaIndex]];
    return this.bosses[keys[0]];
  },

  getBossById(id) {
    return this.bosses[id] || null;
  },

  getDifficultyMultiplier(areaIndex, runLevel) {
    return 1 + areaIndex * 0.3 + (runLevel - 1) * 0.1;
  },

  getEliteHpMultiplier(areaIndex) {
    return 3 + areaIndex * 0.5;
  }
};
