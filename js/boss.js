window.BR = window.BR || {};

BR.Boss = class Boss {
  constructor(areaIndex, level, canvasWidth) {
    this.areaIndex = areaIndex;
    this.level = level;

    this.width = 120;
    this.height = 60;
    this.x = (canvasWidth - this.width) / 2;
    this.y = 20;
    this.hp = 50 + level * 20;
    this.maxHp = this.hp;
    this.alive = true;

    this.speed = 1.5 + areaIndex * 0.3;
    this.direction = 1;
    this.moveTimer = 0;

    this.phase = 1;
    this.phaseTimer = 0;
    this.attackTimer = 0;
    this.attackCooldown = 2;
    this.spawning = false;
    this.spawnTimer = 0;

    this.hitTimer = 0;
    this.pulseTimer = 0;
    this.shakeX = 0;
    this.shakeY = 0;

    this.miniBricks = [];

    const areaColors = ['#00f0ff', '#00ff44', '#aa00ff', '#ff4400', '#00ccff', '#ff00aa'];
    this.color = areaColors[areaIndex] || '#ff0044';
    this.glowColor = this.color;

    this._setupBoss(areaIndex);
  }

  _setupBoss(areaIndex) {
    switch (areaIndex) {
      case 0:
        this.name = 'THE CORE';
        this.phases = 4;
        break;
      case 1:
        this.name = 'HEX GUARDIAN';
        this.phases = 3;
        break;
      case 2:
        this.name = 'VOID WALKER';
        this.phases = 3;
        break;
      default:
        this.name = 'BOSS';
        this.phases = 3;
    }
  }

  update(dt, canvasWidth, canvasHeight) {
    if (!this.alive) return;

    this.hitTimer = Math.max(0, this.hitTimer - dt);
    this.pulseTimer += dt * 3;
    this.phaseTimer += dt;
    this.attackTimer -= dt;

    this.shakeX *= 0.9;
    this.shakeY *= 0.9;

    this.x += this.speed * this.direction * dt * 60;

    if (this.x <= 0) {
      this.x = 0;
      this.direction = 1;
    }
    if (this.x + this.width >= canvasWidth) {
      this.x = canvasWidth - this.width;
      this.direction = -1;
    }

    const hpPercent = this.hp / this.maxHp;
    if (hpPercent < 0.25) this.phase = 4;
    else if (hpPercent < 0.5) this.phase = 3;
    else if (hpPercent < 0.75) this.phase = 2;
    else this.phase = 1;

    if (this.attackTimer <= 0) {
      this._doAttack(canvasWidth, canvasHeight);
      this.attackTimer = Math.max(1, this.attackCooldown - this.phase * 0.3);
    }

    for (let i = this.miniBricks.length - 1; i >= 0; i--) {
      const mb = this.miniBricks[i];
      mb.y += mb.vy * dt * 60;
      mb.x += mb.vx * dt * 60;

      if (mb.y > canvasHeight + 20 || mb.x < -20 || mb.x > canvasWidth + 20) {
        this.miniBricks.splice(i, 1);
      }
    }
  }

  _doAttack(canvasWidth, canvasHeight) {
    if (this.phase >= 2) {
      const count = this.phase;
      for (let i = 0; i < count; i++) {
        this.miniBricks.push({
          x: this.x + Math.random() * this.width,
          y: this.y + this.height,
          width: 25,
          height: 12,
          hp: 1,
          vx: (Math.random() - 0.5) * 2,
          vy: 1 + Math.random() * 1.5,
          color: this.color,
          alive: true
        });
      }
    }
  }

  hit(damage) {
    if (!this.alive) return false;

    this.hp -= damage;
    this.hitTimer = 0.15;
    this.shakeX = (Math.random() - 0.5) * 8;
    this.shakeY = (Math.random() - 0.5) * 8;

    if (BR.Particles) {
      BR.Particles.emitBossHit(this.x + this.width / 2, this.y + this.height / 2);
    }

    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
      this._onDeath();
      return true;
    }
    return false;
  }

  _onDeath() {
    if (BR.Particles) {
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          BR.Particles.emitExplosion(
            this.x + Math.random() * this.width,
            this.y + Math.random() * this.height
          );
        }, i * 100);
      }
    }
    if (BR.Audio) BR.Audio.bossDefeat();
  }

  draw(ctx) {
    if (!this.alive) return;

    ctx.save();
    ctx.translate(this.shakeX, this.shakeY);

    const flashAlpha = this.hitTimer > 0 ? 0.3 : 0;

    ctx.shadowColor = this.glowColor;
    ctx.shadowBlur = 15 + Math.sin(this.pulseTimer) * 5;

    const grad = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
    grad.addColorStop(0, this.color);
    grad.addColorStop(0.5, this._darkenColor(this.color, 40));
    grad.addColorStop(1, this._darkenColor(this.color, 80));

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.width, this.height, 8);
    ctx.fill();

    if (flashAlpha > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, ' + flashAlpha + ')';
      ctx.beginPath();
      ctx.roundRect(this.x, this.y, this.width, this.height, 8);
      ctx.fill();
    }

    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.width, this.height, 8);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    const eyeY = this.y + this.height * 0.4;
    const eyeSpacing = 15;

    ctx.beginPath();
    ctx.arc(this.x + this.width / 2 - eyeSpacing, eyeY, 6, 0, Math.PI * 2);
    ctx.arc(this.x + this.width / 2 + eyeSpacing, eyeY, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = this._darkenColor(this.color, 0);
    const pupilOffset = Math.sin(this.pulseTimer) * 2;
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2 - eyeSpacing + pupilOffset, eyeY, 3, 0, Math.PI * 2);
    ctx.arc(this.x + this.width / 2 + eyeSpacing + pupilOffset, eyeY, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (this.phase <= 2) {
      ctx.moveTo(this.x + this.width / 2 - 20, this.y + this.height * 0.7);
      ctx.lineTo(this.x + this.width / 2 + 20, this.y + this.height * 0.7);
    } else {
      ctx.moveTo(this.x + this.width / 2 - 20, this.y + this.height * 0.65);
      ctx.lineTo(this.x + this.width / 2, this.y + this.height * 0.75);
      ctx.lineTo(this.x + this.width / 2 + 20, this.y + this.height * 0.65);
    }
    ctx.stroke();

    if (this.phase >= 3) {
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
      ctx.lineWidth = 3;
      for (let i = 0; i < this.phase - 2; i++) {
        ctx.beginPath();
        ctx.moveTo(this.x + 10, this.y + 5 + i * 8);
        ctx.lineTo(this.x + this.width - 10, this.y + 5 + i * 8);
        ctx.stroke();
      }
    }

    ctx.shadowBlur = 0;

    // HP bar
    const barWidth = this.width + 20;
    const barHeight = 6;
    const barX = this.x - 10;
    const barY = this.y - 12;
    const hpRatio = this.hp / this.maxHp;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barWidth, barHeight, 3);
    ctx.fill();

    const hpColor = hpRatio > 0.5 ? '#00ff44' : hpRatio > 0.25 ? '#ffaa00' : '#ff0044';
    ctx.fillStyle = hpColor;
    ctx.beginPath();
    ctx.roundRect(barX, barY, barWidth * hpRatio, barHeight, 3);
    ctx.fill();

    // Name label
    ctx.fillStyle = this.color;
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(this.name, this.x + this.width / 2, barY - 4);

    // Draw mini bricks
    for (const mb of this.miniBricks) {
      if (!mb.alive) continue;
      ctx.fillStyle = mb.color;
      ctx.beginPath();
      ctx.roundRect(mb.x, mb.y, mb.width, mb.height, 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(mb.x, mb.y, mb.width, mb.height, 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  _darkenColor(hex, amount) {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    r = Math.max(0, r - amount);
    g = Math.max(0, g - amount);
    b = Math.max(0, b - amount);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  getBounds() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }
};