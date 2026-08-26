window.BR = window.BR || {};

BR.Upgrades = {
  roguelike: [],

  RARITY: {
    COMMON:    { id: 'common',    name: 'COMMON',    color: '#aaaaaa', weight: 60 },
    RARE:      { id: 'rare',      name: 'RARE',      color: '#4488ff', weight: 25 },
    EPIC:      { id: 'epic',      name: 'EPIC',      color: '#aa44ff', weight: 10 },
    LEGENDARY: { id: 'legendary', name: 'LEGENDARY', color: '#ffcc00', weight: 5 }
  },

  getRarityWeight(rarityId) {
    for (var key in this.RARITY) {
      if (this.RARITY[key].id === rarityId) return this.RARITY[key].weight;
    }
    return 60;
  },

  getRarityDef(rarityId) {
    for (var key in this.RARITY) {
      if (this.RARITY[key].id === rarityId) return this.RARITY[key];
    }
    return this.RARITY.COMMON;
  },

  TEMP_DEFS: [
    { id: 'damage_core', name: 'DAMAGE CORE', description: 'Damage +20%', icon: '⚔', color: '#ff4400', rarity: 'common', category: 'attack', baseValue: 0.20, scale: 1, statName: 'Damage' },
    { id: 'critical_core', name: 'CRITICAL CORE', description: 'Crit chance +5%', icon: '⚡', color: '#ffcc00', rarity: 'common', category: 'attack', baseValue: 0.05, scale: 1, statName: 'Crit' },
    { id: 'critical_damage', name: 'CRITICAL DAMAGE', description: 'Crit damage +25%', icon: '💥', color: '#ff00aa', rarity: 'rare', category: 'attack', baseValue: 0.25, scale: 1, statName: 'Crit Dmg' },
    { id: 'ball_speed', name: 'BALL SPEED', description: 'Ball speed +12%', icon: '💨', color: '#4488ff', rarity: 'common', category: 'attack', baseValue: 0.12, scale: 1, statName: 'Speed' },
    { id: 'piercing', name: 'PIERCING SHOT', description: 'Ball pierces bricks', icon: '🔫', color: '#ff8800', rarity: 'epic', category: 'attack', baseValue: 0.15, scale: 1, statName: 'Pierce' },
    { id: 'fire_damage', name: 'FIRE DAMAGE', description: 'Fire damage +18%', icon: '🔥', color: '#ff3300', rarity: 'rare', category: 'attack', baseValue: 0.18, scale: 1, statName: 'Fire Dmg' },
    { id: 'paddle_width', name: 'PADDLE WIDTH', description: 'Paddle width +15%', icon: '↔', color: '#00ff88', rarity: 'common', category: 'defense', baseValue: 0.15, scale: 1, statName: 'Width' },
    { id: 'paddle_speed', name: 'PADDLE SPEED', description: 'Paddle speed +18%', icon: '🏃', color: '#00ccff', rarity: 'common', category: 'defense', baseValue: 0.18, scale: 1, statName: 'P. Speed' },
    { id: 'shield', name: 'SHIELD GENERATOR', description: 'Auto shield each wave', icon: '🛡', color: '#00ff88', rarity: 'rare', category: 'defense', baseValue: 1, scale: 1, statName: 'Shield' },
    { id: 'ball_save', name: 'BALL SAVE', description: 'Chance to save ball', icon: '🔰', color: '#00ff88', rarity: 'epic', category: 'defense', baseValue: 0.15, scale: 1, statName: 'Save' },
    { id: 'coin_bonus', name: 'COIN BONUS', description: 'Coins +25%', icon: '💰', color: '#ffcc00', rarity: 'common', category: 'economy', baseValue: 0.25, scale: 1, statName: 'Coins' },
    { id: 'score_bonus', name: 'SCORE BONUS', description: 'Score +20%', icon: '📊', color: '#00f0ff', rarity: 'common', category: 'economy', baseValue: 0.20, scale: 1, statName: 'Score' },
    { id: 'reward_bonus', name: 'REWARD BONUS', description: 'All rewards +15%', icon: '🎁', color: '#ffcc00', rarity: 'rare', category: 'economy', baseValue: 0.15, scale: 1, statName: 'Rewards' },
    { id: 'magnet', name: 'MAGNET CORE', description: 'Ball magnet +20%', icon: '🧲', color: '#ff00aa', rarity: 'common', category: 'special', baseValue: 0.20, scale: 1, statName: 'Magnet' },
    { id: 'explosion_radius', name: 'EXPLOSION RADIUS', description: 'Explosion +25%', icon: '💣', color: '#ff3344', rarity: 'rare', category: 'special', baseValue: 0.25, scale: 1, statName: 'Explode' },
    { id: 'lightning_chance', name: 'LIGHTNING', description: 'Lightning strike chance', icon: '⚡', color: '#ffcc00', rarity: 'epic', category: 'special', baseValue: 0.08, scale: 1, statName: 'Lightning' },
    { id: 'chain_chance', name: 'CHAIN CORE', description: 'Chain hit chance +10%', icon: '🔗', color: '#aa44ff', rarity: 'rare', category: 'special', baseValue: 0.10, scale: 1, statName: 'Chain' },
    { id: 'powerup_chance', name: 'POWER-UP LUCK', description: 'Power-up chance +15%', icon: '🎲', color: '#aa44ff', rarity: 'rare', category: 'special', baseValue: 0.15, scale: 1, statName: 'P-Up' },
    { id: 'powerup_duration', name: 'POWER-UP DURATION', description: 'Duration +20%', icon: '⏳', color: '#00ccff', rarity: 'rare', category: 'special', baseValue: 0.20, scale: 1, statName: 'Duration' },
    { id: 'multiball_bonus', name: 'MULTIBALL+', description: 'Extra ball on multi', icon: '⚡', color: '#00f0ff', rarity: 'legendary', category: 'special', baseValue: 1, scale: 1, statName: 'Multi+' },
    { id: 'berserk', name: 'BERSERK', description: 'Double dmg, +20% crit', icon: '💀', color: '#ff0044', rarity: 'legendary', category: 'attack', baseValue: 0.20, scale: 1, statName: 'Berserk' },
    { id: 'frozen_shard', name: 'FROZEN SHARD', description: 'Slow bricks on hit', icon: '❄', color: '#88ddff', rarity: 'epic', category: 'special', baseValue: 1, scale: 1, statName: 'Freeze' }
  ],

  SYNERGIES: [
    {
      id: 'inferno',
      name: '🔥 INFERNO',
      description: '+25% Fire Damage',
      color: '#ff3300',
      requirements: [
        { id: 'fire_damage', level: 1 },
        { id: 'piercing', level: 1 },
        { id: 'explosion_radius', level: 1 }
      ],
      apply: function(stats) { stats.damageMultiplier += 0.25; }
    },
    {
      id: 'executioner',
      name: '⚔ EXECUTIONER',
      description: '+15% Critical Damage',
      color: '#ffcc00',
      requirements: [
        { id: 'critical_core', level: 1 },
        { id: 'critical_damage', level: 1 },
        { id: 'berserk', level: 1 }
      ],
      apply: function(stats) { stats.criticalDamage += 0.15; }
    },
    {
      id: 'chain_reaction',
      name: '⚡ CHAIN REACTION',
      description: '+20% Chain Damage',
      color: '#aa44ff',
      requirements: [
        { id: 'chain_chance', level: 1 },
        { id: 'lightning_chance', level: 1 },
        { id: 'explosion_radius', level: 1 }
      ],
      apply: function(stats) { stats.chainChance += 0.20; stats.explosionRadius += 0.20; }
    },
    {
      id: 'treasure_hunter',
      name: '💰 TREASURE HUNTER',
      description: '+30% Coin Gain',
      color: '#ffcc00',
      requirements: [
        { id: 'coin_bonus', level: 1 },
        { id: 'score_bonus', level: 1 },
        { id: 'reward_bonus', level: 1 }
      ],
      apply: function(stats) { stats.coinMultiplier += 0.30; }
    },
    {
      id: 'fortress',
      name: '🛡 FORTRESS',
      description: 'Auto Shield + Width',
      color: '#00ff88',
      requirements: [
        { id: 'shield', level: 1 },
        { id: 'paddle_width', level: 1 },
        { id: 'ball_save', level: 1 }
      ],
      apply: function(stats) { stats.autoShield = true; stats.paddleWidth += 0.15; }
    }
  ],

  PERMANENT_DEFS: [
    { id: 'startingDamage', name: 'STARTING DAMAGE', description: '+5% base damage per level', icon: '⚔', color: '#ff4400', category: 'attack', baseCost: 100, growthRate: 1.6, maxLevel: 10, effectPerLevel: 0.05 },
    { id: 'startingCritical', name: 'STARTING CRITICAL', description: '+2% crit chance per level', icon: '⚡', color: '#ffcc00', category: 'attack', baseCost: 120, growthRate: 1.6, maxLevel: 10, effectPerLevel: 0.02 },
    { id: 'criticalDamage', name: 'CRITICAL DAMAGE', description: '+8% crit damage per level', icon: '💥', color: '#ff00aa', category: 'attack', baseCost: 150, growthRate: 1.6, maxLevel: 10, effectPerLevel: 0.08 },
    { id: 'startingPaddleWidth', name: 'STARTING WIDTH', description: '+5% paddle width per level', icon: '↔', color: '#00ff88', category: 'defense', baseCost: 80, growthRate: 1.5, maxLevel: 10, effectPerLevel: 0.05 },
    { id: 'paddleSpeed', name: 'PADDLE SPEED', description: '+5% paddle speed per level', icon: '🏃', color: '#00ccff', category: 'defense', baseCost: 100, growthRate: 1.5, maxLevel: 10, effectPerLevel: 0.05 },
    { id: 'startingShield', name: 'STARTING SHIELD', description: 'Begin with shield', icon: '🛡', color: '#00ff88', category: 'defense', baseCost: 500, growthRate: 2.0, maxLevel: 5, effectPerLevel: 0.20 },
    { id: 'coinGain', name: 'COIN BOOST', description: '+5% coin gain per level', icon: '💰', color: '#ffcc00', category: 'economy', baseCost: 100, growthRate: 1.5, maxLevel: 10, effectPerLevel: 0.05 },
    { id: 'scoreGain', name: 'SCORE BOOST', description: '+5% score per level', icon: '📊', color: '#00f0ff', category: 'economy', baseCost: 100, growthRate: 1.5, maxLevel: 10, effectPerLevel: 0.05 },
    { id: 'rewardMultiplier', name: 'REWARD MULTIPLIER', description: '+8% all rewards per level', icon: '🎁', color: '#ffcc00', category: 'economy', baseCost: 200, growthRate: 1.7, maxLevel: 10, effectPerLevel: 0.08 },
    { id: 'powerUpChance', name: 'POWER-UP LUCK', description: '+3% power-up chance per level', icon: '🎲', color: '#aa44ff', category: 'special', baseCost: 150, growthRate: 1.6, maxLevel: 10, effectPerLevel: 0.03 },
    { id: 'powerUpDuration', name: 'POWER-UP TIME', description: '+8% duration per level', icon: '⏳', color: '#00ccff', category: 'special', baseCost: 120, growthRate: 1.5, maxLevel: 10, effectPerLevel: 0.08 },
    { id: 'startingBallSpeed', name: 'STARTING SPEED', description: '+3% ball speed per level', icon: '💨', color: '#4488ff', category: 'special', baseCost: 120, growthRate: 1.5, maxLevel: 10, effectPerLevel: 0.03 }
  ],

  init() {
    this.roguelike = [];
  },

  getDefaultModifiers() {
    return BR.BuildManager.getStats();
  },

  calculateModifiers(permanentUpgrades) {
    return BR.BuildManager.getStats();
  },

  getChoices(count) {
    return BR.UpgradeManager.getChoices(count);
  },

  applyRoguelike(choice) {
    BR.UpgradeManager.selectUpgrade(choice);
  }
};
