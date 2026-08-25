window.BR = window.BR || {};

BR.BrickTypes = {
  NORMAL: { id: 'normal', baseHp: 1, scoreValue: 10, coinValue: 1, color: '#00f0ff', glow: '#00a0cc' },
  STRONG: { id: 'strong', baseHp: 3, scoreValue: 25, coinValue: 2, color: '#ff8800', glow: '#cc6600' },
  ARMORED: { id: 'armored', baseHp: 2, armor: 2, scoreValue: 30, coinValue: 2, color: '#aaaaaa', glow: '#888888' },
  EXPLOSIVE: { id: 'explosive', baseHp: 1, scoreValue: 15, coinValue: 1, color: '#ff3344', glow: '#cc0022' },
  CHAIN: { id: 'chain', baseHp: 1, scoreValue: 15, coinValue: 1, color: '#aa44ff', glow: '#8822cc' },
  COIN: { id: 'coin', baseHp: 1, scoreValue: 10, coinValue: 5, color: '#ffcc00', glow: '#ccaa00' },
  MYSTERY: { id: 'mystery', baseHp: 1, scoreValue: 20, coinValue: 3, color: '#ff00aa', glow: '#cc0088' },
  ELITE: { id: 'elite', baseHp: 5, scoreValue: 50, coinValue: 5, color: '#00ff88', glow: '#00cc66' },
};

BR.Brick = class Brick {
  constructor(x, y, width, height, type, waveMultiplier = 1) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
    this.hp = Math.ceil(type.baseHp * waveMultiplier);
    this.maxHp = this.hp;
    this.armor = type.armor ? Math.ceil(type.armor * waveMultiplier) : 0;
    this.maxArmor = this.armor;
    this.scoreValue = type.scoreValue;
    this.coinValue = type.coinValue;
    this.color = type.color;
    this.alive = true;
    this.hitScale = 1;
    this.hitTimer = 0;
    this.opacity = 1;
    this.crackLevel = 0;
    this.shakeX = 0;
    this.shakeY = 0;
  }

  hit(damage) {
    if (!this.alive) return false;

    if (this.armor > 0) {
      this.armor -= damage;
      if (this.armor < 0) {
        this.hp += this.armor;
        this.armor = 0;
      }
    } else {
      this.hp -= damage;
    }

    this.crackLevel = 1 - (this.hp / this.maxHp);
    this.hitScale = 1.15;
    this.hitTimer = 0.12;

    if (BR.Particles) {
      BR.Particles.emitBrickHit(this.x + this.width / 2, this.y + this.height / 2, this.color);
    }

    if (this.hp <= 0) {
      this.alive = false;
      if (BR.Particles) {
        BR.Particles.emitBrickBreak(this.x + this.width / 2, this.y + this.height / 2, this.color);
      }
      return true;
    }

    return false;
  }

  update(dt) {
    if (this.hitTimer > 0) {
      this.hitTimer -= dt;
      this.hitScale = 1 + (this.hitTimer / 0.12) * 0.15;
    } else {
      this.hitScale = 1;
    }

    if (this.shakeX !== 0 || this.shakeY !== 0) {
      this.shakeX *= 0.8;
      this.shakeY *= 0.8;
      if (Math.abs(this.shakeX) < 0.1) this.shakeX = 0;
      if (Math.abs(this.shakeY) < 0.1) this.shakeY = 0;
    }
  }

  draw(ctx) {
    if (!this.alive) return;

    ctx.save();

    const cx = this.x + this.width / 2 + this.shakeX;
    const cy = this.y + this.height / 2 + this.shakeY;
    ctx.translate(cx, cy);
    ctx.scale(this.hitScale, this.hitScale);
    ctx.translate(-cx, -cy);

    const grad = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
    grad.addColorStop(0, this._lighten(this.color, 30));
    grad.addColorStop(0.5, this.color);
    grad.addColorStop(1, this._darken(this.color, 30));

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(this.x + this.shakeX, this.y + this.shakeY, this.width, this.height, 3);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(this.x + 2 + this.shakeX, this.y + 1 + this.shakeY, this.width - 4, 2);

    if (this.armor > 0) {
      const armorRatio = this.armor / this.maxArmor;
      ctx.strokeStyle = `rgba(180, 180, 180, ${0.5 + armorRatio * 0.5})`;
      ctx.lineWidth = 2 + armorRatio * 2;
      ctx.beginPath();
      ctx.roundRect(this.x - 1 + this.shakeX, this.y - 1 + this.shakeY, this.width + 2, this.height + 2, 4);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🛡' + this.armor, this.x + this.width / 2, this.y + this.height / 2 + 3);
    }

    if (this.crackLevel > 0 && this.alive) {
      this._drawCracks(ctx);
    }

    ctx.shadowColor = this.type.glow;
    ctx.shadowBlur = 5;
    ctx.strokeStyle = this.type.glow;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(this.x + this.shakeX, this.y + this.shakeY, this.width, this.height, 3);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  _drawCracks(ctx) {
    ctx.strokeStyle = `rgba(0, 0, 0, ${this.crackLevel * 0.7})`;
    ctx.lineWidth = 1;
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    const numCracks = Math.ceil(this.crackLevel * 3);
    for (let i = 0; i < numCracks; i++) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      const angle = (i * 2.4) + 0.5;
      let px = cx, py = cy;
      for (let j = 0; j < 3; j++) {
        px += Math.cos(angle + (i * 0.7)) * 8 * (j + 1);
        py += Math.sin(angle - (i * 0.3)) * 5 * (j + 1);
        ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  }

  _lighten(color, amount) {
    let r = parseInt(color.slice(1, 3), 16);
    let g = parseInt(color.slice(3, 5), 16);
    let b = parseInt(color.slice(5, 7), 16);
    r = Math.min(255, r + amount);
    g = Math.min(255, g + amount);
    b = Math.min(255, b + amount);
    return `rgb(${r},${g},${b})`;
  }

  _darken(color, amount) {
    let r = parseInt(color.slice(1, 3), 16);
    let g = parseInt(color.slice(3, 5), 16);
    let b = parseInt(color.slice(5, 7), 16);
    r = Math.max(0, r - amount);
    g = Math.max(0, g - amount);
    b = Math.max(0, b - amount);
    return `rgb(${r},${g},${b})`;
  }

  getBounds() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }
};
