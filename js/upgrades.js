window.BR = window.BR || {};

BR.Upgrades = {
  roguelike: [],

  ROGUELIKE_DEFS: [
    { id: 'fire_core', name: 'FIRE CORE', description: 'Damage +30%', category: 'attack', color: '#ff4400', icon: '🔥', apply(g) { g.damageMultiplier *= 1.3; } },
    { id: 'magnetic_paddle', name: 'MAGNETIC PADDLE', description: 'Ball attraction +20%', category: 'defense', color: '#ff00aa', icon: '🧲', apply(g) { g.magnetStrength += 0.2; } },
    { id: 'critical_core', name: 'CRITICAL CORE', description: 'Critical chance +10%', category: 'attack', color: '#ffcc00', icon: '⚡', apply(g) { g.critChance += 0.1; } },
    { id: 'thick_skin', name: 'THICK SKIN', description: 'Paddle width +20%', category: 'defense', color: '#00ff88', icon: '🛡', apply(g) { g.paddleWidthMult *= 1.2; } },
    { id: 'swift_feet', name: 'SWIFT FEET', description: 'Paddle speed +25%', category: 'defense', color: '#4488ff', icon: '💨', apply(g) { g.paddleSpeedMult *= 1.25; } },
    { id: 'coin_magnet', name: 'COIN MAGNET', description: 'Coin gain +40%', category: 'economy', color: '#ffcc00', icon: '💰', apply(g) { g.coinMult *= 1.4; } },
    { id: 'lucky_drop', name: 'LUCKY DROP', description: 'Power-up chance +15%', category: 'special', color: '#aa44ff', icon: '🎲', apply(g) { g.powerupChance += 0.15; } },
    { id: 'piercing_shot', name: 'PIERCING SHOT', description: 'Ball pierces 1 brick', category: 'attack', color: '#ff8800', icon: '🔫', apply(g) { g.pierceCount += 1; } },
    { id: 'chain_lightning', name: 'CHAIN LIGHTNING', description: 'Hits chain to 2 nearby bricks', category: 'special', color: '#ffcc00', icon: '⚡', apply(g) { g.chainCount += 2; } },
    { id: 'shield_generator', name: 'SHIELD GENERATOR', description: 'Shield activates each wave', category: 'defense', color: '#00ff88', icon: '🛡', apply(g) { g.autoShield = true; } },
    { id: 'explosive_touch', name: 'EXPLOSIVE TOUCH', description: 'Hits cause small explosion', category: 'special', color: '#ff0044', icon: '💣', apply(g) { g.explosiveHits = true; } },
    { id: 'double_strike', name: 'DOUBLE STRIKE', description: '15% chance to hit twice', category: 'attack', color: '#ff00aa', icon: '⚔', apply(g) { g.doubleStrike += 0.15; } },
    { id: 'frozen_shard', name: 'FROZEN SHARD', description: 'Ball slows bricks on hit', category: 'special', color: '#00ccff', icon: '❄', apply(g) { g.slowBricks = true; } },
    { id: 'vampire_touch', name: 'VAMPIRE TOUCH', description: 'Heal paddle (wider) on kill', category: 'special', color: '#ff0044', icon: '🧛', apply(g) { g.vampireHeal = true; } },
    { id: 'mega_ball', name: 'MEGA BALL', description: 'Ball size +40%, damage +50%', category: 'attack', color: '#ff8800', icon: '🔴', apply(g) { g.ballSizeMult *= 1.4; g.damageMultiplier *= 1.5; } },
  ],

  init() {
    this.roguelike = [];
  },

  getChoices(count = 3) {
    const available = this.ROGUELIKE_DEFS.filter(
      d => !this.roguelike.find(r => r.id === d.id)
    );

    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  },

  applyRoguelike(choice) {
    this.roguelike.push(choice);
  },

  getDefaultModifiers() {
    return {
      damageMultiplier: 1,
      critChance: 0.05,
      critDamageMultiplier: 3,
      paddleWidthMult: 1,
      paddleSpeedMult: 1,
      ballSpeedMult: 1,
      coinMult: 1,
      powerupChance: 0,
      pierceCount: 0,
      chainCount: 0,
      autoShield: false,
      explosiveHits: false,
      doubleStrike: 0,
      slowBricks: false,
      vampireHeal: false,
      ballSizeMult: 1,
      magnetStrength: 0,
    };
  },

  calculateModifiers(permanentUpgrades) {
    const mods = this.getDefaultModifiers();
    const p = permanentUpgrades || {};

    mods.damageMultiplier *= 1 + (p.damage || 0) * 0.15;
    mods.paddleWidthMult *= 1 + (p.paddleWidth || 0) * 0.10;
    mods.ballSpeedMult *= 1 + (p.ballSpeed || 0) * 0.05;
    mods.coinMult *= 1 + (p.coinMultiplier || 0) * 0.20;
    mods.critChance += (p.critChance || 0) * 0.05;
    mods.powerupChance += (p.powerupChance || 0) * 0.05;

    for (const upgrade of this.roguelike) {
      if (upgrade.apply) {
        upgrade.apply(mods);
      }
    }

    return mods;
  },

  PERMANENT_DEFS: [
    { id: 'damage', name: 'STARTING DAMAGE', description: '+15% base damage per level', icon: '⚔', color: '#ff4400' },
    { id: 'paddleWidth', name: 'STARTING WIDTH', description: '+10% paddle width per level', icon: '↔', color: '#00ff88' },
    { id: 'ballSpeed', name: 'STARTING SPEED', description: '+5% ball speed per level', icon: '💨', color: '#4488ff' },
    { id: 'coinMultiplier', name: 'COIN MULTIPLIER', description: '+20% coins per level', icon: '💰', color: '#ffcc00' },
    { id: 'critChance', name: 'CRITICAL CHANCE', description: '+5% crit chance per level', icon: '⚡', color: '#ff00aa' },
    { id: 'powerupChance', name: 'LUCK', description: '+5% power-up drop per level', icon: '🎲', color: '#aa44ff' },
  ],

  getCost(level) {
    return Math.floor(50 * Math.pow(1.8, level));
  },

  getLevel(upgradeId, permanentUpgrades) {
    return (permanentUpgrades && permanentUpgrades[upgradeId]) || 0;
  }
};
