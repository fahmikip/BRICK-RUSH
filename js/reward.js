window.BR = window.BR || {};

BR.Reward = {
  grant(config, game) {
    if (!game) return;

    const comboScoreMult = BR.Combo.getScoreMultiplier();
    const comboCoinMult = BR.Combo.getCoinMultiplier();

    if (config.score) {
      const finalScore = Math.floor(config.score * comboScoreMult * (config.scoreMultiplier || 1));
      game.score += finalScore;

      if (BR.Effects && config.x !== undefined) {
        let text = '+' + finalScore;
        let color = '#ffffff';
        if (comboScoreMult > 1) {
          color = '#ffcc00';
        }
        BR.Effects.addFloatingText(config.x, config.y - 10, text, color, {
          fontSize: config.crit ? 18 : 14,
          speed: 2,
          life: config.crit ? 1.2 : 0.8
        });
      }
    }

    if (config.coins) {
      let coinGain = Math.floor(config.coins * comboCoinMult * (game.doubleCoinActive ? 2 : 1) * (game.modifiers?.coinMult || 1));
      coinGain = Math.max(0, coinGain);
      game.runCoins += coinGain;

      if (BR.Effects && config.x !== undefined) {
        BR.Effects.addFloatingText(config.x, config.y - 20, '+' + coinGain + ' C', '#ffcc00', {
          fontSize: 12,
          speed: 1.5,
          life: 0.7
        });
      }

      if (config.x !== undefined && config.y !== undefined) {
        BR.Juice.coinCollect();
      }
    }

    if (config.powerup) {
      BR.Powerups.trySpawn(
        config.x || game.width / 2,
        config.y || game.height / 2,
        1
      );
    }
  },

  brickReward(brick, game) {
    if (!brick || !game) return;

    const scoreMult = BR.Combo.getScoreMultiplier();
    const coinMult = BR.Combo.getCoinMultiplier();
    const isDoubleCoin = game.doubleCoinActive;
    const globalCoinMult = game.modifiers?.coinMult || 1;

    const scoreGain = Math.floor(brick.scoreValue * scoreMult);
    game.score += scoreGain;

    let coinGain = Math.floor(brick.coinValue * coinMult * (isDoubleCoin ? 2 : 1) * globalCoinMult);
    coinGain = Math.max(0, coinGain);
    game.runCoins += coinGain;

    if (BR.Effects) {
      BR.Effects.addFloatingText(
        brick.x + brick.width / 2, brick.y,
        '+' + scoreGain, '#ffffff',
        { fontSize: 13, speed: 1.8, life: 0.8 }
      );
    }

    if (coinGain > 0 && BR.Effects) {
      BR.Effects.addFloatingText(
        brick.x + brick.width / 2, brick.y - 15,
        '+' + coinGain + ' C', '#ffcc00',
        { fontSize: 11, speed: 1.2, life: 0.6 }
      );
    }

    if (coinGain > 0) {
      BR.Juice.coinCollect();
    }

    return { score: scoreGain, coins: coinGain };
  },

  comboBonus(combo, x, y, game) {
    if (!game || combo <= 0) return;

    const bonusScore = combo * 10;
    game.score += bonusScore;

    if (BR.Effects) {
      BR.Effects.addFloatingText(x, y - 30, 'COMBO BONUS +' + bonusScore, '#ff00aa', {
        fontSize: 14,
        speed: 2,
        life: 1
      });
    }
  }
};
