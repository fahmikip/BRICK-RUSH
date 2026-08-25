window.BR = window.BR || {};

BR.Powerups = {
  active: [],
  activeEffects: [],

  TYPES: {
    MULTIBALL: {
      id: 'multiball',
      name: 'MULTIBALL',
      color: '#00f0ff',
      icon: '⚡',
      duration: 0,
      description: 'Add 2 extra balls',
      chance: 0.08
    },
    FIREBALL: {
      id: 'fireball',
      name: 'FIREBALL',
      color: '#ff4400',
      icon: '🔥',
      duration: 8,
      description: 'Ball pierces through bricks',
      chance: 0.07
    },
    BOMB: {
      id: 'bomb',
      name: 'BOMB',
      color: '#ff0044',
      icon: '💣',
      duration: 0,
      description: 'Destroy nearby bricks',
      chance: 0.08
    },
    LIGHTNING: {
      id: 'lightning',
      name: 'LIGHTNING',
      color: '#ffcc00',
      icon: '⚡',
      duration: 0,
      description: 'Chain damage to nearby bricks',
      chance: 0.06
    },
    MAGNET: {
      id: 'magnet',
      name: 'MAGNET',
      color: '#ff00aa',
      icon: '🧲',
      duration: 10,
      description: 'Ball attracts to paddle',
      chance: 0.08
    },
    SHIELD: {
      id: 'shield',
      name: 'SHIELD',
      color: '#00ff88',
      icon: '🛡',
      duration: 0,
      description: 'Save ball once from falling',
      chance: 0.07
    },
    GIANT: {
      id: 'giant',
      name: 'GIANT PADDLE',
      color: '#aa44ff',
      icon: '⬛',
      duration: 10,
      description: 'Paddle becomes bigger',
      chance: 0.07
    },
    SLOW: {
      id: 'slow',
      name: 'SLOW MOTION',
      color: '#4488ff',
      icon: '🕐',
      duration: 6,
      description: 'Ball moves slower',
      chance: 0.07
    },
    DOUBLE_COIN: {
      id: 'double_coin',
      name: 'DOUBLE COIN',
      color: '#ffcc00',
      icon: '💰',
      duration: 12,
      description: 'Earn double coins',
      chance: 0.07
    },
    BERSERK: {
      id: 'berserk',
      name: 'BERSERK',
      color: '#ff0044',
      icon: '💀',
      duration: 6,
      description: 'Damage increased 3x',
      chance: 0.05
    }
  },

  init() {
    this.active = [];
    this.activeEffects = [];
  },

  trySpawn(x, y, powerupChanceBonus = 0) {
    const types = Object.values(this.TYPES);

    let totalChance = 0;
    for (const t of types) totalChance += t.chance;

    if (Math.random() > totalChance + powerupChanceBonus) return;

    let roll = Math.random() * (totalChance + powerupChanceBonus);
    for (const type of types) {
      roll -= type.chance;
      if (roll <= 0) {
        this._spawn(type, x, y);
        return;
      }
    }
  },

  _spawn(type, x, y) {
    this.active.push({
      type,
      x,
      y,
      width: 30,
      height: 30,
      vy: 1.5,
      rotation: 0,
      pulse: 0,
      active: true
    });

    if (BR.Particles) {
      BR.Particles.emitCoin(x, y);
    }
  },

  update(dt, canvasWidth, canvasHeight, paddle, game) {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const pu = this.active[i];
      pu.y += pu.vy * dt * 60;
      pu.rotation += dt * 3;
      pu.pulse += dt * 5;

      if (pu.y > canvasHeight + 40) {
        this.active.splice(i, 1);
        continue;
      }

      const puRect = {
        x: pu.x - pu.width / 2,
        y: pu.y - pu.height / 2,
        width: pu.width,
        height: pu.height
      };
      const paddleRect = {
        x: paddle.x,
        y: paddle.y,
        width: paddle.width,
        height: paddle.height
      };

      const hit = BR.Physics
        ? BR.Physics.rectsOverlap(puRect, paddleRect)
        : this._basicOverlap(puRect, paddleRect);

      if (hit) {
        this._activate(pu.type, game);
        this.active.splice(i, 1);
      }
    }

    for (let i = this.activeEffects.length - 1; i >= 0; i--) {
      const eff = this.activeEffects[i];
      eff.timer -= dt;
      if (eff.timer <= 0) {
        this._deactivate(eff.type, game);
        this.activeEffects.splice(i, 1);
      }
    }
  },

  _basicOverlap(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  },

  _activate(type, game) {
    if (BR.Audio) BR.Audio.powerup();

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
      type,
      timer: type.duration,
      maxTimer: type.duration
    });

    switch (type.id) {
      case 'fireball':
        if (game.balls) {
          game.balls.forEach(b => {
            b.piercing = true;
            b.piercingTimer = type.duration;
          });
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
          game.balls.forEach(b => b.applySpeedMultiplier(0.5));
        }
        break;
      case 'berserk':
        if (game.balls) {
          game.balls.forEach(b => { b.damage = b.baseDamage * 3; });
        }
        break;
      case 'double_coin':
        game.doubleCoinActive = true;
        break;
    }
  },

  _deactivate(type, game) {
    switch (type.id) {
      case 'fireball':
        if (game.balls) {
          game.balls.forEach(b => {
            b.piercing = false;
            b.piercingTimer = 0;
          });
        }
        break;
      case 'magnet':
        if (game.paddle) game.paddle.magnetActive = false;
        break;
      case 'giant':
        if (game.paddle) game.paddle.applyWidthMultiplier(1.0);
        break;
      case 'slow':
        if (game.balls) {
          game.balls.forEach(b => b.applySpeedMultiplier(1.0));
        }
        break;
      case 'berserk':
        if (game.balls) {
          game.balls.forEach(b => { b.damage = b.baseDamage; });
        }
        break;
      case 'double_coin':
        game.doubleCoinActive = false;
        break;
    }
  },

  draw(ctx) {
    for (const pu of this.active) {
      ctx.save();
      ctx.translate(pu.x, pu.y);

      ctx.shadowColor = pu.type.color;
      ctx.shadowBlur = 10 + Math.sin(pu.pulse) * 5;

      const size = pu.width / 2;

      ctx.fillStyle = pu.type.color;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.strokeStyle = pu.type.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.stroke();

      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pu.type.icon, 0, 0);

      ctx.shadowBlur = 0;
      ctx.restore();
    }
  },

  drawActiveEffects(ctx, x, y) {
    let offsetX = 0;
    for (const eff of this.activeEffects) {
      const iconX = x + offsetX;
      const iconY = y;
      const size = 24;
      const barWidth = size + 20;

      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(iconX, iconY, barWidth, size, 4);
      } else {
        ctx.rect(iconX, iconY, barWidth, size);
      }
      ctx.fill();

      const ratio = eff.timer / eff.maxTimer;
      ctx.fillStyle = eff.type.color;
      ctx.globalAlpha = 0.5;
      ctx.fillRect(iconX, iconY + size - 3, barWidth * ratio, 3);
      ctx.globalAlpha = 1;

      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(eff.type.icon, iconX + 2, iconY + size / 2);

      offsetX += barWidth + 5;
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
