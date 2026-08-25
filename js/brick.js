window.BR = window.BR || {};

BR.BrickStates = {
  HEALTHY: 'healthy',
  DAMAGED: 'damaged',
  CRITICAL: 'critical',
  DESTROYING: 'destroying',
  DESTROYED: 'destroyed'
};

BR.BrickTypes = {
  NORMAL:     { id: 'normal',     name: 'Normal',     baseHp: 1, armor: 0, scoreValue: 10,  coinValue: 1, color: '#00f0ff', glow: '#00a0cc', weight: 70 },
  STRONG:     { id: 'strong',     name: 'Strong',     baseHp: 3, armor: 0, scoreValue: 25,  coinValue: 2, color: '#ff8800', glow: '#cc6600', weight: 15 },
  ARMORED:    { id: 'armored',    name: 'Armored',    baseHp: 3, armor: 2, scoreValue: 30,  coinValue: 2, color: '#aaaaaa', glow: '#888888', weight: 7  },
  EXPLOSIVE:  { id: 'explosive',  name: 'Explosive',  baseHp: 1, armor: 0, scoreValue: 15,  coinValue: 1, color: '#ff3344', glow: '#cc0022', weight: 2  },
  CHAIN:      { id: 'chain',      name: 'Chain',      baseHp: 1, armor: 0, scoreValue: 15,  coinValue: 1, color: '#aa44ff', glow: '#8822cc', weight: 2  },
  COIN:       { id: 'coin',       name: 'Coin',       baseHp: 1, armor: 0, scoreValue: 10,  coinValue: 5, color: '#ffcc00', glow: '#ccaa00', weight: 4  },
  MYSTERY:    { id: 'mystery',    name: 'Mystery',    baseHp: 1, armor: 0, scoreValue: 20,  coinValue: 3, color: '#ff00aa', glow: '#cc0088', weight: 2  }
};

BR.BrickTypeById = {};
(function() {
  for (const key in BR.BrickTypes) {
    BR.BrickTypeById[BR.BrickTypes[key].id] = BR.BrickTypes[key];
  }
})();

BR.Brick = class Brick {
  constructor(x, y, width, height, type, waveMultiplier) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type || BR.BrickTypes.NORMAL;
    this.alive = true;

    this.maxHp = Math.ceil(this.type.baseHp * (waveMultiplier || 1));
    this.hp = this.maxHp;
    this.maxArmor = Math.ceil((this.type.armor || 0) * (waveMultiplier || 1));
    this.armor = this.maxArmor;

    this.scoreValue = this.type.scoreValue;
    this.coinValue = this.type.coinValue;
    this.color = this.type.color;

    this.state = BR.BrickStates.HEALTHY;
    this.hitScale = 1;
    this.hitTimer = 0;
    this.flashTimer = 0;
    this.shakeX = 0;
    this.shakeY = 0;
    this.crackLevel = 0;
    this.opacity = 1;

    this.deathTimer = 0;
    this.deathDuration = 0.25;
    this.deathScale = 1;
    this.deathAlpha = 1;
    this.pendingDestroy = false;

    this._crackSeed = Math.random() * 1000;
  }

  get effectiveHp() {
    return this.hp + this.armor;
  }

  get maxEffectiveHp() {
    return this.maxHp + this.maxArmor;
  }

  getState() {
    if (this.state === BR.BrickStates.DESTROYING || this.state === BR.BrickStates.DESTROYED) {
      return this.state;
    }
    const ratio = this.effectiveHp / this.maxEffectiveHp;
    if (ratio > 0.6) return BR.BrickStates.HEALTHY;
    if (ratio > 0.3) return BR.BrickStates.DAMAGED;
    return BR.BrickStates.CRITICAL;
  }

  hit(damage) {
    if (!this.alive) return false;

    this.hitTimer = 0.15;
    this.flashTimer = 0.1;
    this.hitScale = 1.2;
    this.shakeX = (Math.random() - 0.5) * 6;
    this.shakeY = (Math.random() - 0.5) * 6;

    if (this.armor > 0) {
      this.armor -= damage;
      if (this.armor < 0) {
        this.hp += this.armor;
        this.armor = 0;
      }
    } else {
      this.hp -= damage;
    }

    this.crackLevel = 1 - (this.effectiveHp / this.maxEffectiveHp);
    this.state = this.getState();

    if (BR.Particles) {
      BR.Particles.emitBrickHit(this.x + this.width / 2, this.y + this.height / 2, this.color, 3);
    }

    if (BR.Events) {
      BR.Events.emit('brickHit', { brick: this, damage: damage });
    }

    if (this.hp <= 0) {
      this.pendingDestroy = true;
      return true;
    }
    return false;
  }

  destroy() {
    this.alive = false;
    this.state = BR.BrickStates.DESTROYING;
    this.deathTimer = this.deathDuration;
    this.deathScale = 1;
    this.deathAlpha = 1;

    if (BR.Particles) {
      BR.Particles.emitBrickBreak(this.x + this.width / 2, this.y + this.height / 2, this.color, 8);
    }

    if (BR.Events) {
      BR.Events.emit('brickDestroyed', { brick: this });
    }
  }

  update(dt) {
    if (this.state === BR.BrickStates.DESTROYING) {
      this.deathTimer -= dt;
      const progress = 1 - (this.deathTimer / this.deathDuration);
      this.deathScale = 1 + progress * 0.4;
      this.deathAlpha = 1 - progress;
      this.shakeX = (Math.random() - 0.5) * 4 * (1 - progress);
      this.shakeY = (Math.random() - 0.5) * 4 * (1 - progress);
      if (this.deathTimer <= 0) {
        this.state = BR.BrickStates.DESTROYED;
      }
      return;
    }

    if (this.state === BR.BrickStates.DESTROYED) return;

    if (this.hitTimer > 0) {
      this.hitTimer -= dt;
      this.hitScale = 1 + (this.hitTimer / 0.15) * 0.2;
    } else {
      this.hitScale = 1;
    }

    if (this.flashTimer > 0) {
      this.flashTimer -= dt;
    }

    if (this.shakeX !== 0 || this.shakeY !== 0) {
      this.shakeX *= 0.85;
      this.shakeY *= 0.85;
      if (Math.abs(this.shakeX) < 0.1) this.shakeX = 0;
      if (Math.abs(this.shakeY) < 0.1) this.shakeY = 0;
    }

    this.state = this.getState();
  }

  draw(ctx) {
    if (this.state === BR.BrickStates.DESTROYED) return;

    ctx.save();

    const cx = this.x + this.width / 2 + this.shakeX;
    const cy = this.y + this.height / 2 + this.shakeY;

    if (this.state === BR.BrickStates.DESTROYING) {
      ctx.globalAlpha = this.deathAlpha;
      ctx.translate(cx, cy);
      ctx.scale(this.deathScale, this.deathScale);
      ctx.translate(-cx, -cy);
    } else {
      ctx.translate(cx, cy);
      ctx.scale(this.hitScale, this.hitScale);
      ctx.translate(-cx, -cy);
    }

    this._drawBody(ctx);

    if (this.flashTimer > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, ' + (this.flashTimer / 0.1) * 0.4 + ')';
      ctx.fillRect(this.x + this.shakeX, this.y + this.shakeY, this.width, this.height);
    }

    if (this.armor > 0) {
      this._drawArmor(ctx);
    }

    this._drawCracks(ctx);
    this._drawGlow(ctx);

    ctx.restore();
  }

  _drawBody(ctx) {
    const grad = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
    grad.addColorStop(0, this._lighten(this.color, 40));
    grad.addColorStop(0.5, this.color);
    grad.addColorStop(1, this._darken(this.color, 40));

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(this.x + this.shakeX, this.y + this.shakeY, this.width, this.height, 3);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(
      this.x + 2 + this.shakeX,
      this.y + 1 + this.shakeY,
      this.width - 4,
      this.height * 0.25
    );

    this._drawTypeIcon(ctx);
  }

  _drawTypeIcon(ctx) {
    if (this.state === BR.BrickStates.DESTROYING) return;
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    switch (this.type.id) {
      case 'explosive':
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold ' + Math.floor(this.height * 0.6) + 'px sans-serif';
        ctx.fillText('\u2622', cx, cy + 1);
        break;
      case 'chain':
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold ' + Math.floor(this.height * 0.55) + 'px sans-serif';
        ctx.fillText('\u26A1', cx, cy + 1);
        break;
      case 'coin':
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold ' + Math.floor(this.height * 0.55) + 'px sans-serif';
        ctx.fillText('$', cx, cy + 1);
        break;
      case 'mystery':
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold ' + Math.floor(this.height * 0.6) + 'px sans-serif';
        ctx.fillText('?', cx, cy + 1);
        break;
      case 'strong':
        if (this.hp < this.maxHp) {
          ctx.fillStyle = 'rgba(255,255,255,0.5)';
          ctx.font = 'bold ' + Math.floor(this.height * 0.45) + 'px monospace';
          ctx.fillText(this.hp + '', cx, cy + 1);
        }
        break;
    }
    ctx.restore();
  }

  _drawArmor(ctx) {
    const ratio = this.maxArmor > 0 ? this.armor / this.maxArmor : 0;
    ctx.strokeStyle = 'rgba(200, 200, 220, ' + (0.4 + ratio * 0.6) + ')';
    ctx.lineWidth = 1.5 + ratio * 2;
    ctx.beginPath();
    ctx.roundRect(
      this.x - 1 + this.shakeX,
      this.y - 1 + this.shakeY,
      this.width + 2,
      this.height + 2,
      4
    );
    ctx.stroke();

    ctx.fillStyle = 'rgba(200, 200, 220, 0.7)';
    ctx.font = 'bold ' + Math.floor(this.height * 0.4) + 'px monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText('A' + this.armor, this.x + this.width - 2 + this.shakeX, this.y + 1 + this.shakeY);
  }

  _drawCracks(ctx) {
    if (this.crackLevel <= 0) return;

    const cx = this.x + this.width / 2 + this.shakeX;
    const cy = this.y + this.height / 2 + this.shakeY;
    const intensity = Math.min(1, this.crackLevel);

    ctx.strokeStyle = 'rgba(0, 0, 0, ' + (intensity * 0.7) + ')';
    ctx.lineWidth = 1;

    const seed = this._crackSeed;
    const numCracks = Math.ceil(intensity * 3);

    for (let i = 0; i < numCracks; i++) {
      ctx.beginPath();
      const startAngle = ((seed + i * 2.4) % (Math.PI * 2));
      const startDist = 2 + ((seed + i * 7) % 5);
      const sx = cx + Math.cos(startAngle) * startDist;
      const sy = cy + Math.sin(startAngle) * startDist;
      ctx.moveTo(sx, sy);

      let px = sx;
      let py = sy;
      const segments = 2 + Math.floor(intensity * 2);

      for (let j = 0; j < segments; j++) {
        const angle = startAngle + Math.sin(seed + i * 3.7 + j * 1.3) * 1.2;
        const len = 4 + j * 3 + ((seed + i + j) % 4);
        px += Math.cos(angle) * len;
        py += Math.sin(angle) * len;
        ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    if (intensity > 0.5) {
      ctx.fillStyle = 'rgba(255, 255, 255, ' + ((intensity - 0.5) * 0.2) + ')';
      ctx.beginPath();
      ctx.roundRect(
        this.x + this.shakeX,
        this.y + this.shakeY,
        this.width,
        this.height,
        3
      );
      ctx.fill();
    }
  }

  _drawGlow(ctx) {
    ctx.shadowColor = this.type.glow;
    ctx.shadowBlur = this.state === BR.BrickStates.CRITICAL ? 8 : 4;
    ctx.strokeStyle = this.type.glow;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(this.x + this.shakeX, this.y + this.shakeY, this.width, this.height, 3);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  _lighten(color, amount) {
    const r = Math.min(255, parseInt(color.slice(1, 3), 16) + amount);
    const g = Math.min(255, parseInt(color.slice(3, 5), 16) + amount);
    const b = Math.min(255, parseInt(color.slice(5, 7), 16) + amount);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  _darken(color, amount) {
    const r = Math.max(0, parseInt(color.slice(1, 3), 16) - amount);
    const g = Math.max(0, parseInt(color.slice(3, 5), 16) - amount);
    const b = Math.max(0, parseInt(color.slice(5, 7), 16) - amount);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  getBounds() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }
};
