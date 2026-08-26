window.BR = window.BR || {};

BR.Powerups = {
  active: [],
  activeEffects: [],
  maxBalls: 5,

  TYPES: {
    MULTIBALL: { id: 'multiball', name: 'MULTIBALL', icon: '\u26A1', color: '#00f0ff', duration: 0, spawnChance: 0.08, description: '+2 balls (max 5)' },
    FIREBALL:  { id: 'fireball',  name: 'FIREBALL',  icon: '\uD83D\uDD25', color: '#ff4400', duration: 8, spawnChance: 0.07, description: 'Pierces bricks' },
    BOMB:      { id: 'bomb',      name: 'BOMB',      icon: '\uD83D\uDCA3', color: '#ff0044', duration: 0, spawnChance: 0.08, description: 'Area damage' },
    LIGHTNING: { id: 'lightning', name: 'LIGHTNING', icon: '\u26A1', color: '#ffcc00', duration: 0, spawnChance: 0.06, description: 'Chain to 5 bricks' },
    MAGNET:    { id: 'magnet',    name: 'MAGNET',    icon: '\uD83E\uDDF2', color: '#ff00aa', duration: 8, spawnChance: 0.08, description: 'Attracts ball' },
    SHIELD:    { id: 'shield',    name: 'SHIELD',    icon: '\uD83D\uDEE1', color: '#00ff88', duration: 0, spawnChance: 0.07, description: 'Save ball once' },
    GIANT:     { id: 'giant',     name: 'GIANT',     icon: '\u2B1C', color: '#aa44ff', duration: 10, spawnChance: 0.07, description: 'Paddle +80%' },
    SLOW:      { id: 'slow',      name: 'SLOW',      icon: '\uD83D\uDD50', color: '#4488ff', duration: 6, spawnChance: 0.07, description: 'Ball -40% speed' },
    DOUBLE:    { id: 'double',    name: '2x COIN',   icon: '\uD83D\uDCB0', color: '#ffcc00', duration: 15, spawnChance: 0.07, description: 'Double coins' },
    BERSERK:   { id: 'berserk',   name: 'BERSERK',   icon: '\uD83D\uDC80', color: '#ff0044', duration: 8, spawnChance: 0.05, description: '+100% dmg, +20% crit' }
  },

  init() {
    this.active = [];
    this.activeEffects = [];
  },

  trySpawn(x, y, powerupChanceBonus) {
    const bonus = powerupChanceBonus || 0;
    let totalChance = 0;
    const types = Object.values(this.TYPES);
    for (let i = 0; i < types.length; i++) totalChance += types[i].spawnChance;

    if (Math.random() > totalChance + bonus) return;

    let roll = Math.random() * (totalChance + bonus);
    for (let i = 0; i < types.length; i++) {
      roll -= types[i].spawnChance;
      if (roll <= 0) {
        this._spawn(types[i], x, y);
        return;
      }
    }
  },

  spawnSpecific(typeId, x, y) {
    const types = Object.values(this.TYPES);
    for (let i = 0; i < types.length; i++) {
      if (types[i].id === typeId) {
        this._spawn(types[i], x, y);
        return;
      }
    }
  },

  _spawn(type, x, y) {
    this.active.push({
      type: type,
      x: x,
      y: y,
      width: 28,
      height: 28,
      vy: 1.5,
      rotation: 0,
      pulse: 0,
      active: true,
      glowPulse: 0
    });
  },

  update(dt, canvasWidth, canvasHeight, paddle, game) {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const pu = this.active[i];
      pu.y += pu.vy * dt * 60;
      pu.rotation += dt * 2;
      pu.pulse += dt * 5;
      pu.glowPulse += dt * 4;

      if (pu.y > canvasHeight + 40) {
        this.active.splice(i, 1);
        continue;
      }

      const puRect = { x: pu.x - pu.width / 2, y: pu.y - pu.height / 2, width: pu.width, height: pu.height };
      const paddleRect = { x: paddle.x, y: paddle.y, width: paddle.width, height: paddle.height };

      const hit = BR.Physics ? BR.Physics.rectsOverlap(puRect, paddleRect) : false;

      if (hit) {
        this._activate(pu.type, game);
        if (BR.Particles) BR.Particles.emitPowerupCollect(pu.x, pu.y, pu.type.color);
        if (BR.Juice) BR.Juice.powerUpPickup(pu.type);
        BR.Audio?.powerup();
        this.active.splice(i, 1);
      }
    }

    for (let i = this.activeEffects.length - 1; i >= 0; i--) {
      const eff = this.activeEffects[i];
      eff.timer -= dt;
      if (eff.timer <= 0) {
        this._deactivate(eff.type, game);
        BR.Audio?.powerupExpire();
        this.activeEffects.splice(i, 1);
      }
    }
  },

  _activate(type, game) {
    if (BR.MissionManager) BR.MissionManager.handleEvent('powerUpCollected', { amount: 1 });
    var stats = BR.Storage._data.statistics || {};
    stats.totalPowerUps = (stats.totalPowerUps || 0) + 1;
    BR.Storage._data.statistics = stats;

    if (type.duration === 0) {
      switch (type.id) {
        case 'multiball':
          if (game && game.onPowerupMultiball) game.onPowerupMultiball();
          break;
        case 'bomb':
          if (game && game.onPowerupBomb) game.onPowerupBomb();
          break;
        case 'lightning':
          if (game && game.onPowerupLightning) game.onPowerupLightning();
          break;
        case 'shield':
          if (game && game.paddle) {
            game.paddle.shield = true;
            game.paddle.shieldUsed = false;
          }
          break;
      }
      return;
    }

    const existing = this.activeEffects.find(e => e.type.id === type.id);
    if (existing) {
      existing.timer = type.duration;
      existing.maxTimer = type.duration;
      return;
    }

    this.activeEffects.push({
      type: type,
      timer: type.duration,
      maxTimer: type.duration
    });

    switch (type.id) {
      case 'fireball':
        if (game.balls) {
          game.balls.forEach(b => { b.modifiers.piercing = true; });
        }
        break;
      case 'magnet':
        if (game.paddle) game.paddle.magnetActive = true;
        break;
      case 'giant':
        if (game.paddle) game.paddle.applyWidthMultiplier(1.8);
        break;
      case 'slow':
        if (game.balls) {
          game.balls.forEach(b => { b.modifiers.speedMult = 0.6; b.applySpeedMultiplier(0.6); });
        }
        break;
      case 'berserk':
        if (game.balls) {
          game.balls.forEach(b => { b.modifiers.berserk = true; });
        }
        if (game.modifiers) game.modifiers.critChance += 0.2;
        break;
      case 'double':
        game.doubleCoinActive = true;
        break;
    }
  },

  _deactivate(type, game) {
    switch (type.id) {
      case 'fireball':
        if (game.balls) {
          game.balls.forEach(b => { b.modifiers.piercing = false; });
        }
        break;
      case 'magnet':
        if (game.paddle) game.paddle.magnetActive = false;
        break;
      case 'giant':
        if (game.paddle) game.paddle.applyWidthMultiplier(game.modifiers?.paddleWidthMult || 1);
        break;
      case 'slow':
        if (game.balls) {
          game.balls.forEach(b => { b.modifiers.speedMult = 1; b.applySpeedMultiplier(1); });
        }
        break;
      case 'berserk':
        if (game.balls) {
          game.balls.forEach(b => { b.modifiers.berserk = false; });
        }
        if (game.modifiers) game.modifiers.critChance = Math.max(0.05, game.modifiers.critChance - 0.2);
        break;
      case 'double':
        game.doubleCoinActive = false;
        break;
    }
  },

  applyToNewBall(ball, game) {
    for (let i = 0; i < this.activeEffects.length; i++) {
      const eff = this.activeEffects[i];
      switch (eff.type.id) {
        case 'fireball':
          ball.modifiers.piercing = true;
          break;
        case 'slow':
          ball.modifiers.speedMult = 0.6;
          ball.applySpeedMultiplier(0.6);
          break;
        case 'berserk':
          ball.modifiers.berserk = true;
          break;
      }
    }
  },

  applyToActiveEffects(game) {
    for (let i = 0; i < this.activeEffects.length; i++) {
      const eff = this.activeEffects[i];
      switch (eff.type.id) {
        case 'fireball':
          if (game.balls) {
            game.balls.forEach(b => { b.modifiers.piercing = true; });
          }
          break;
        case 'magnet':
          if (game.paddle) game.paddle.magnetActive = true;
          break;
        case 'giant':
          if (game.paddle) game.paddle.applyWidthMultiplier(1.8);
          break;
        case 'slow':
          if (game.balls) {
            game.balls.forEach(b => { b.modifiers.speedMult = 0.6; b.applySpeedMultiplier(0.6); });
          }
          break;
        case 'berserk':
          if (game.balls) {
            game.balls.forEach(b => { b.modifiers.berserk = true; });
          }
          if (game.modifiers) game.modifiers.critChance += 0.2;
          break;
        case 'double':
          game.doubleCoinActive = true;
          break;
      }
    }
  },

  draw(ctx) {
    for (let i = 0; i < this.active.length; i++) {
      const pu = this.active[i];
      ctx.save();
      ctx.translate(pu.x, pu.y);

      const glow = 10 + Math.sin(pu.glowPulse) * 5;
      ctx.shadowColor = pu.type.color;
      ctx.shadowBlur = glow;

      const size = pu.width / 2;

      ctx.globalAlpha = 0.2 + Math.sin(pu.pulse) * 0.1;
      ctx.fillStyle = pu.type.color;
      ctx.beginPath();
      ctx.arc(0, 0, size + 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.strokeStyle = pu.type.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.stroke();

      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pu.type.icon, 0, 0);

      ctx.shadowBlur = 0;
      ctx.restore();
    }
  },

  drawActiveEffects(ctx, x, y) {
    let offsetX = 0;
    for (let i = 0; i < this.activeEffects.length; i++) {
      const eff = this.activeEffects[i];
      const iconX = x + offsetX;
      const iconY = y;
      const barW = 50;
      const barH = 18;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(iconX, iconY, barW, barH, 3);
      else ctx.rect(iconX, iconY, barW, barH);
      ctx.fill();

      const ratio = Math.max(0, eff.timer / eff.maxTimer);
      ctx.fillStyle = eff.type.color;
      ctx.globalAlpha = 0.4;
      ctx.fillRect(iconX + 1, iconY + barH - 4, (barW - 2) * ratio, 3);
      ctx.globalAlpha = 1;

      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(eff.type.icon + ' ' + eff.timer.toFixed(1) + 's', iconX + 3, iconY + barH / 2);

      offsetX += barW + 4;
    }
  },

  isEffectActive(effectId) {
    return this.activeEffects.some(e => e.type.id === effectId);
  },

  clear() {
    this.active = [];
    this.activeEffects = [];
  }
};
