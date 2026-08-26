window.BR = window.BR || {};

BR.BossReward = {
  calculate(bossConfig, isReplay, bestCombo, duration) {
    var rewards = isReplay ? bossConfig.rewards.replay : bossConfig.rewards.firstClear;
    var comboBonus = Math.floor(bestCombo * 2);
    return {
      coins: rewards.coins,
      tokens: rewards.tokens,
      score: rewards.score + comboBonus,
      isReplay: isReplay
    };
  }
};

BR.BossAttack = {
  projectiles: [],
  lasers: [],
  minions: [],
  shockwaves: [],
  _warningTimers: [],

  update(dt, boss, paddle, canvasWidth, canvasHeight) {
    for (var i = this.projectiles.length - 1; i >= 0; i--) {
      var p = this.projectiles[i];
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      p.life -= dt;
      if (p.life <= 0 || p.x < -20 || p.x > canvasWidth + 20 || p.y < -20 || p.y > canvasHeight + 20) {
        this.projectiles.splice(i, 1);
      }
    }

    for (var i = this.lasers.length - 1; i >= 0; i--) {
      var l = this.lasers[i];
      if (l.state === 'warning') {
        l.warningTimer -= dt;
        if (l.warningTimer <= 0) {
          l.state = 'active';
          l.activeTimer = l.duration;
        }
      } else if (l.state === 'active') {
        l.activeTimer -= dt;
        if (l.activeTimer <= 0) {
          this.lasers.splice(i, 1);
        }
      }
    }

    for (var i = this.minions.length - 1; i >= 0; i--) {
      var m = this.minions[i];
      m.x += m.vx * dt * 60;
      m.y += m.vy * dt * 60;
      m.hitTimer = Math.max(0, m.hitTimer - dt);

      if (m.x <= 0 || m.x + m.width >= canvasWidth) {
        m.vx = -m.vx;
        m.x = Math.max(0, Math.min(m.x, canvasWidth - m.width));
      }

      if (m.y > canvasHeight + 30) {
        this.minions.splice(i, 1);
      }
    }

    for (var i = this.shockwaves.length - 1; i >= 0; i--) {
      var s = this.shockwaves[i];
      s.radius += s.speed * dt * 60;
      s.life -= dt;
      if (s.radius >= s.maxRadius || s.life <= 0) {
        this.shockwaves.splice(i, 1);
      }
    }
  },

  fireProjectile(boss, targetX, targetY) {
    var cx = boss.x + boss.width / 2;
    var cy = boss.y + boss.height;
    var dx = targetX - cx;
    var dy = targetY - cy;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return;
    var speed = 4;
    this.projectiles.push({
      x: cx, y: cy,
      vx: (dx / dist) * speed,
      vy: (dy / dist) * speed,
      radius: 5,
      damage: 1,
      color: boss.config.color,
      life: 5,
      glow: boss.config.glowColor
    });
    if (BR.Audio) BR.Audio._play(200, 'square', 0.1, 0.2);
  },

  fireLaser(boss, paddle, canvasWidth) {
    var lw = Math.min(canvasWidth, 300);
    var lx = boss.x + boss.width / 2 - lw / 2;
    var ly = boss.y + boss.height;
    this.lasers.push({
      x: lx, y: ly,
      width: lw, height: 6,
      damage: 1,
      duration: 1.5,
      activeTimer: 0,
      warningTimer: 0.8,
      state: 'warning',
      color: boss.config.color,
      glow: boss.config.glowColor,
      targetY: paddle.y
    });
    if (BR.Audio) BR.Audio._play(400, 'sine', 0.3, 0.15);
  },

  spawnMinions(boss, canvasWidth, count) {
    count = count || 3;
    var maxMinions = 10;
    var toSpawn = Math.min(count, maxMinions - this.minions.length);
    for (var i = 0; i < toSpawn; i++) {
      this.minions.push({
        x: boss.x + Math.random() * boss.width,
        y: boss.y + boss.height,
        width: 28,
        height: 14,
        hp: 2,
        maxHp: 2,
        vx: (Math.random() - 0.5) * 2,
        vy: 1 + Math.random() * 1.5,
        color: boss.config.color,
        glow: boss.config.glowColor,
        hitTimer: 0,
        active: true
      });
    }
    if (BR.Audio) BR.Audio._play(150, 'square', 0.15, 0.15);
  },

  fireShockwave(boss, canvasWidth, canvasHeight) {
    var cx = boss.x + boss.width / 2;
    var cy = boss.y + boss.height;
    this.shockwaves.push({
      x: cx, y: cy,
      radius: 10,
      maxRadius: Math.max(canvasWidth, canvasHeight),
      speed: 6,
      damage: 1,
      life: 2,
      color: boss.config.color,
      thickness: 3
    });
    if (BR.Audio) BR.Audio._play(100, 'sawtooth', 0.3, 0.25);
  },

  checkProjectilePaddle(proj, paddle) {
    return BR.Physics.rectsOverlap(
      { x: proj.x - proj.radius, y: proj.y - proj.radius, width: proj.radius * 2, height: proj.radius * 2 },
      { x: paddle.x, y: paddle.y, width: paddle.width, height: paddle.height }
    );
  },

  checkLaserPaddle(laser, paddle) {
    if (laser.state !== 'active') return false;
    var laserRect = { x: laser.x, y: laser.y - 2, width: laser.width, height: laser.height + 4 };
    var padRect = { x: paddle.x, y: paddle.y, width: paddle.width, height: paddle.height };
    return BR.Physics.rectsOverlap(laserRect, padRect);
  },

  checkShockwavePaddle(sw, paddle) {
    var px = paddle.x + paddle.width / 2;
    var py = paddle.y + paddle.height / 2;
    var dist = BR.Physics.distance(sw.x, sw.y, px, py);
    return Math.abs(dist - sw.radius) < 20;
  },

  checkMinionBallCollision(minion, ball) {
    var ballRect = { x: ball.x - ball.radius, y: ball.y - ball.radius, width: ball.radius * 2, height: ball.radius * 2 };
    var minRect = { x: minion.x, y: minion.y, width: minion.width, height: minion.height };
    return BR.Physics.rectsOverlap(ballRect, minRect);
  },

  drawProjectiles(ctx) {
    for (var i = 0; i < this.projectiles.length; i++) {
      var p = this.projectiles[i];
      ctx.save();
      ctx.shadowColor = p.glow || p.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius + 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fill();
      ctx.restore();
    }
  },

  drawLasers(ctx) {
    for (var i = 0; i < this.lasers.length; i++) {
      var l = this.lasers[i];
      ctx.save();
      if (l.state === 'warning') {
        var flash = Math.sin(performance.now() / 50) * 0.3 + 0.7;
        ctx.globalAlpha = flash;
        ctx.fillStyle = '#ff0044';
        ctx.fillRect(l.x, l.y, l.width, l.height);
      } else {
        ctx.shadowColor = l.glow || l.color;
        ctx.shadowBlur = 15;
        var grad = ctx.createLinearGradient(l.x, l.y - 2, l.x, l.y + l.height + 2);
        grad.addColorStop(0, 'rgba(255,255,255,0.3)');
        grad.addColorStop(0.3, l.color);
        grad.addColorStop(0.5, '#ffffff');
        grad.addColorStop(0.7, l.color);
        grad.addColorStop(1, 'rgba(255,255,255,0.3)');
        ctx.fillStyle = grad;
        ctx.fillRect(l.x, l.y - 3, l.width, l.height + 6);
      }
      ctx.restore();
    }
  },

  drawMinions(ctx) {
    for (var i = 0; i < this.minions.length; i++) {
      var m = this.minions[i];
      if (!m.active) continue;
      ctx.save();
      var flash = m.hitTimer > 0 ? 0.4 : 0;
      ctx.shadowColor = m.glow || m.color;
      ctx.shadowBlur = 8;
      var grad = ctx.createLinearGradient(m.x, m.y, m.x, m.y + m.height);
      grad.addColorStop(0, m.color);
      grad.addColorStop(1, '#000000');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(m.x, m.y, m.width, m.height, 3);
      ctx.fill();
      if (flash > 0) {
        ctx.fillStyle = 'rgba(255,255,255,' + flash + ')';
        ctx.beginPath();
        ctx.roundRect(m.x, m.y, m.width, m.height, 3);
        ctx.fill();
      }
      var hpRatio = m.hp / m.maxHp;
      if (hpRatio < 1) {
        ctx.fillStyle = '#ff0044';
        ctx.fillRect(m.x, m.y - 4, m.width * hpRatio, 2);
      }
      ctx.restore();
    }
  },

  drawShockwaves(ctx) {
    for (var i = 0; i < this.shockwaves.length; i++) {
      var s = this.shockwaves[i];
      ctx.save();
      var alpha = Math.max(0, s.life / 2) * 0.6;
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.thickness;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = s.thickness * 0.5;
      ctx.globalAlpha = alpha * 0.5;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius * 0.95, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  },

  clear() {
    this.projectiles = [];
    this.lasers = [];
    this.minions = [];
    this.shockwaves = [];
    this._warningTimers = [];
  }
};

BR.Boss = class Boss {
  constructor(config, areaIndex, level, canvasWidth, canvasHeight) {
    this.config = config;
    this.areaIndex = areaIndex;
    this.level = level;

    var diffMult = BR.BossConfig.getDifficultyMultiplier(areaIndex, level);
    this.width = config.width;
    this.height = config.height;
    this.x = (canvasWidth - this.width) / 2;
    this.y = 30;

    this.maxHp = Math.ceil(config.baseHp * diffMult);
    this.hp = this.maxHp;

    this.shieldMaxHp = Math.ceil(config.shield.maxHp * diffMult);
    this.shieldHp = this.shieldMaxHp;
    this.shieldActive = true;
    this.shieldRegenTimer = 0;

    this.weakPointRadius = config.weakPoint.radius;
    this.weakPointActive = true;
    this.weakPointTimer = 0;
    this.weakPointCooldown = 8;
    this.weakPointDuration = 4;
    this.weakPointAngle = 0;

    this.speed = config.moveSpeed * diffMult * 0.15;
    this.direction = 1;
    this.moveTimer = 0;
    this.movePattern = 0;

    this.phaseIndex = 0;
    this.phases = config.phases;
    this.phaseTransitionTimer = 0;
    this.isTransitioning = false;

    this.attackTimer = 0;
    this.attackCooldown = config.baseAttackCooldown / 1000;
    this.attackPattern = 0;
    this.availableAttacks = ['projectile'];

    this.alive = true;
    this.hitTimer = 0;
    this.pulseTimer = 0;
    this.shakeX = 0;
    this.shakeY = 0;

    this.name = config.name;
    this.color = config.color;
    this.glowColor = config.glowColor;

    this.contactDamage = config.contactDamage || 1;
  }

  update(dt, canvasWidth, canvasHeight) {
    if (!this.alive) return;

    this.hitTimer = Math.max(0, this.hitTimer - dt);
    this.pulseTimer += dt * 3;
    this.shakeX *= 0.9;
    this.shakeY *= 0.9;

    if (this.isTransitioning) {
      this.phaseTransitionTimer -= dt;
      if (this.phaseTransitionTimer <= 0) {
        this.isTransitioning = false;
      }
      return;
    }

    var phase = this.getCurrentPhase();
    var moveSpd = this.speed * phase.moveSpeedMult;

    this.moveTimer += dt;
    if (this.moveTimer > 3) {
      this.movePattern = (this.movePattern + 1) % 3;
      this.moveTimer = 0;
    }

    if (this.movePattern === 0) {
      this.x += moveSpd * this.direction * dt * 60;
    } else if (this.movePattern === 1) {
      this.x += moveSpd * this.direction * dt * 60 * 0.5;
      this.y += Math.sin(this.pulseTimer * 2) * 0.5;
    } else {
      var targetX = canvasWidth / 2 - this.width / 2;
      var dx = targetX - this.x;
      this.x += dx * 0.02 * dt * 60;
    }

    if (this.x <= 0) { this.x = 0; this.direction = 1; }
    if (this.x + this.width >= canvasWidth) { this.x = canvasWidth - this.width; this.direction = -1; }

    this.y = Math.max(20, Math.min(this.y, canvasHeight * 0.3));

    this.weakPointTimer += dt;
    if (this.weakPointActive) {
      this.weakPointAngle += dt * 3;
      if (this.weakPointTimer >= this.weakPointDuration) {
        this.weakPointActive = false;
        this.weakPointTimer = 0;
      }
    } else {
      if (this.weakPointTimer >= this.weakPointCooldown) {
        this.weakPointActive = true;
        this.weakPointTimer = 0;
      }
    }

    if (this.shieldActive && this.shieldHp < this.shieldMaxHp) {
      this.shieldRegenTimer += dt;
      if (this.shieldRegenTimer >= 5) {
        this.shieldHp = Math.min(this.shieldMaxHp, this.shieldHp + 50 * dt);
      }
    }

    this.attackTimer -= dt;
    if (this.attackTimer <= 0) {
      this._performAttack(canvasWidth, canvasHeight);
      this.attackTimer = Math.max(0.8, this.attackCooldown * phase.attackCooldownMult);
    }

    this._updateAvailableAttacks(phase);
  }

  _updateAvailableAttacks(phase) {
    this.availableAttacks = ['projectile'];
    for (var key in this.config.attackUnlock) {
      if (this.config.attackUnlock[key] <= this.phaseIndex) {
        if (this.availableAttacks.indexOf(key) === -1) {
          this.availableAttacks.push(key);
        }
      }
    }
  }

  _performAttack(canvasWidth, canvasHeight) {
    if (this.isTransitioning) return;
    var pattern = this.attackPattern % this.availableAttacks.length;
    var attackType = this.availableAttacks[pattern];
    this.attackPattern++;

    switch (attackType) {
      case 'projectile':
        var targetX = canvasWidth / 2 + (Math.random() - 0.5) * canvasWidth * 0.6;
        var targetY = canvasHeight - 40;
        BR.BossAttack.fireProjectile(this, targetX, targetY);
        break;
      case 'laser':
        BR.BossAttack.fireLaser(this, null, canvasWidth);
        break;
      case 'spawn_minions':
        var phase = this.getCurrentPhase();
        var count = phase.spawnMinions ? 3 : 2;
        BR.BossAttack.spawnMinions(this, canvasWidth, count);
        break;
      case 'shockwave':
        BR.BossAttack.fireShockwave(this, canvasWidth, canvasHeight);
        break;
    }
  }

  getCurrentPhase() {
    if (!this.phases || this.phases.length === 0) return { name: 'ACTIVE', moveSpeedMult: 1, attackCooldownMult: 1 };
    return this.phases[this.phaseIndex] || this.phases[0];
  }

  checkPhaseTransition() {
    var hpRatio = this.hp / this.maxHp;
    for (var i = this.phases.length - 1; i >= 0; i--) {
      if (hpRatio <= this.phases[i].hpThreshold && i > this.phaseIndex) {
        this.phaseIndex = i;
        this.isTransitioning = true;
        this.phaseTransitionTimer = 1.5;
        this.attackTimer = 2;

        if (BR.Audio) BR.Audio._play(300, 'sawtooth', 0.3, 0.3);
        if (BR.Juice) { BR.Juice.shake(10, 0.3); BR.Juice.flash(this.color, 0.15); }
        if (BR.Particles) {
          BR.Particles.emitExplosion(this.x + this.width / 2, this.y + this.height / 2, 25);
        }
        if (BR.Effects) {
          BR.Effects.addFloatingText(this.x + this.width / 2, this.y - 10, this.getCurrentPhase().name + '!', this.color, {
            fontSize: 18, speed: 0.8, life: 2, drift: 0
          });
        }

        return this.phases[i];
      }
    }
    return null;
  }

  hit(damage, isCrit) {
    if (!this.alive || this.isTransitioning) return false;

    var actualDamage = damage;
    if (this.shieldActive && this.shieldHp > 0) {
      var shieldReduction = this.config.shield.damageReduction;
      var shieldDmg = Math.ceil(damage * shieldReduction);
      var bodyDmg = damage - shieldDmg;
      this.shieldHp = Math.max(0, this.shieldHp - shieldDmg);
      actualDamage = bodyDmg;
      if (this.shieldHp <= 0) {
        this.shieldActive = false;
        if (BR.Audio) BR.Audio._play(100, 'sawtooth', 0.3, 0.3);
        if (BR.Juice) BR.Juice.shieldBreak();
        if (BR.Effects) {
          BR.Effects.addFloatingText(this.x + this.width / 2, this.y + this.height / 2, 'SHIELD BREAK!', '#00ff88', {
            fontSize: 16, speed: 0.5, life: 1.5, drift: 0
          });
        }
      }
    }

    this.hp -= actualDamage;
    this.hitTimer = 0.15;
    this.shakeX = (Math.random() - 0.5) * 6;
    this.shakeY = (Math.random() - 0.5) * 6;

    if (BR.Particles) BR.Particles.emitBossHit(this.x + this.width / 2, this.y + this.height / 2, 10);
    if (BR.Effects) {
      var text = actualDamage.toString();
      if (isCrit) text = 'CRIT ' + actualDamage;
      BR.Effects.damageNumber(this.x + this.width / 2, this.y, actualDamage, !!isCrit);
    }

    this.shieldRegenTimer = 0;

    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
      this._onDeath();
      return true;
    }

    var phaseChanged = this.checkPhaseTransition();
    return false;
  }

  hitWeakPoint(damage, isCrit) {
    if (!this.alive || !this.weakPointActive || this.isTransitioning) return false;

    var wpDmg = Math.ceil(damage * this.config.weakPoint.damageMultiplier);
    if (isCrit) wpDmg = Math.ceil(wpDmg * this.config.weakPoint.critMultiplier);

    this.hp -= wpDmg;
    this.hitTimer = 0.2;
    this.shakeX = (Math.random() - 0.5) * 10;
    this.shakeY = (Math.random() - 0.5) * 10;

    if (BR.Particles) {
      var wp = this.getWeakPointPosition();
      BR.Particles.emitBossHit(wp.x, wp.y, 20);
      BR.Particles.emitCritical(wp.x, wp.y, 15);
    }
    if (BR.Effects) {
      var wp = this.getWeakPointPosition();
      BR.Effects.addFloatingText(wp.x, wp.y, 'WEAK POINT ' + wpDmg, '#ff0044', {
        fontSize: 14, speed: 1, life: 1.2, drift: 0
      });
    }
    if (BR.Juice) BR.Juice.criticalHit(this.x + this.width / 2, this.y + this.height / 2);

    this.shieldRegenTimer = 0;

    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
      this._onDeath();
      return true;
    }

    this.checkPhaseTransition();
    return false;
  }

  _onDeath() {
    if (BR.Audio) BR.Audio.bossDefeat();
    if (BR.Particles) {
      for (var i = 0; i < 6; i++) {
        setTimeout(function() {
          if (BR.Particles) {
            BR.Particles.emitExplosion(
              this.x + Math.random() * this.width,
              this.y + Math.random() * this.height,
              30
            );
          }
        }.bind(this), i * 120);
      }
    }
    if (BR.Juice) {
      BR.Juice.shake(15, 0.5);
      BR.Juice.slowMotion(0.5, 0.8);
      BR.Juice.flash('#ffffff', 0.2);
    }
    if (BR.Effects) {
      BR.Effects.addFloatingText(this.x + this.width / 2, this.y, this.name + ' DEFEATED!', this.color, {
        fontSize: 20, speed: 0.5, life: 2.5, drift: 0
      });
    }
  }

  getWeakPointPosition() {
    var cx = this.x + this.width / 2;
    var cy = this.y + this.height / 2;
    var offset = this.weakPointRadius * 2;
    return {
      x: cx + Math.cos(this.weakPointAngle) * offset,
      y: cy + Math.sin(this.weakPointAngle) * offset
    };
  }

  draw(ctx) {
    if (!this.alive) return;

    ctx.save();
    ctx.translate(this.shakeX, this.shakeY);

    if (this.isTransitioning) {
      var flash = Math.sin(performance.now() / 30) * 0.3 + 0.5;
      ctx.globalAlpha = flash;
    }

    var flashAlpha = this.hitTimer > 0 ? 0.3 : 0;

    ctx.shadowColor = this.glowColor;
    ctx.shadowBlur = 15 + Math.sin(this.pulseTimer) * 5;

    var grad = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
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
    var eyeY = this.y + this.height * 0.4;
    var eyeSpacing = 15;
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2 - eyeSpacing, eyeY, 6, 0, Math.PI * 2);
    ctx.arc(this.x + this.width / 2 + eyeSpacing, eyeY, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = this._darkenColor(this.color, 0);
    var pupilOffset = Math.sin(this.pulseTimer) * 2;
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2 - eyeSpacing + pupilOffset, eyeY, 3, 0, Math.PI * 2);
    ctx.arc(this.x + this.width / 2 + eyeSpacing + pupilOffset, eyeY, 3, 0, Math.PI * 2);
    ctx.fill();

    var phase = this.getCurrentPhase();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (this.phaseIndex < 2) {
      ctx.moveTo(this.x + this.width / 2 - 20, this.y + this.height * 0.7);
      ctx.lineTo(this.x + this.width / 2 + 20, this.y + this.height * 0.7);
    } else {
      ctx.moveTo(this.x + this.width / 2 - 20, this.y + this.height * 0.65);
      ctx.lineTo(this.x + this.width / 2, this.y + this.height * 0.75);
      ctx.lineTo(this.x + this.width / 2 + 20, this.y + this.height * 0.65);
    }
    ctx.stroke();

    if (this.phaseIndex >= 2) {
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
      ctx.lineWidth = 3;
      for (var i = 0; i < this.phaseIndex - 1; i++) {
        ctx.beginPath();
        ctx.moveTo(this.x + 10, this.y + 5 + i * 8);
        ctx.lineTo(this.x + this.width - 10, this.y + 5 + i * 8);
        ctx.stroke();
      }
    }

    ctx.shadowBlur = 0;

    this._drawShield(ctx);

    if (this.weakPointActive) {
      this._drawWeakPoint(ctx);
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  _drawShield(ctx) {
    if (!this.shieldActive || this.shieldHp <= 0) return;
    var ratio = this.shieldHp / this.shieldMaxHp;
    var alpha = 0.15 + ratio * 0.35;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(this.x - 5, this.y - 5, this.width + 10, this.height + 10, 12);
    ctx.stroke();
    ctx.globalAlpha = alpha * 0.3;
    ctx.fillStyle = '#00ff88';
    ctx.beginPath();
    ctx.roundRect(this.x - 5, this.y - 5, this.width + 10, this.height + 10, 12);
    ctx.fill();
    ctx.restore();
  }

  _drawWeakPoint(ctx) {
    var wp = this.getWeakPointPosition();
    var pulse = Math.sin(performance.now() / 100) * 0.3 + 0.7;
    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.shadowColor = '#ff0044';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(wp.x, wp.y, this.weakPointRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#ff0044';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(wp.x, wp.y, this.weakPointRadius * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();
  }

  _darkenColor(hex, amount) {
    if (!hex || hex.charAt(0) !== '#') return hex || '#888888';
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    r = Math.max(0, r - amount);
    g = Math.max(0, g - amount);
    b = Math.max(0, b - amount);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  getBounds() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }
};

BR.BossManager = {
  currentBoss: null,
  state: 'inactive',
  introTimer: 0,
  defeatTimer: 0,
  resultTimer: 0,
  encounterStartTime: 0,
  bestCombo: 0,
  isReplay: false,
  bossId: '',
  _updateCallback: null,

  startEncounter(areaIndex, level, canvasWidth, canvasHeight, isReplay) {
    var bossConfig = BR.BossConfig.getBossForArea(areaIndex);
    if (!bossConfig) return false;

    this.bossId = bossConfig.id;
    this.isReplay = isReplay || false;
    this.currentBoss = new BR.Boss(bossConfig, areaIndex, level, canvasWidth, canvasHeight);
    this.state = 'intro';
    this.introTimer = 2.5;
    this.defeatTimer = 0;
    this.resultTimer = 0;
    this.encounterStartTime = Date.now();
    this.bestCombo = BR.Combo ? BR.Combo.count : 0;

    BR.BossAttack.clear();

    if (BR.Audio) BR.Audio._play(80, 'sawtooth', 0.5, 0.3);
    setTimeout(function() {
      if (BR.Audio) BR.Audio._play(120, 'sawtooth', 0.4, 0.25);
    }, 300);
    setTimeout(function() {
      if (BR.Audio) BR.Audio._play(160, 'sawtooth', 0.3, 0.2);
    }, 600);

    if (BR.Effects) {
      BR.Effects.addFloatingText(canvasWidth / 2, canvasHeight / 2, 'WARNING: ' + bossConfig.name + ' INCOMING', '#ff0044', {
        fontSize: 16, speed: 0.3, life: 2.5, drift: 0
      });
    }

    return true;
  },

  update(dt, canvasWidth, canvasHeight, paddle, balls) {
    switch (this.state) {
      case 'intro':
        this.introTimer -= dt;
        if (this.introTimer <= 0) {
          this.state = 'active';
        }
        break;

      case 'active':
        if (!this.currentBoss || !this.currentBoss.alive) break;

        this.currentBoss.update(dt, canvasWidth, canvasHeight);

        BR.BossAttack.update(dt, this.currentBoss, paddle, canvasWidth, canvasHeight);

        this._checkBossBallCollisions(balls);
        this._checkBossPaddleCollisions(paddle);

        if (BR.Combo && BR.Combo.count > this.bestCombo) {
          this.bestCombo = BR.Combo.count;
        }

        var run = BR.RunManager.getState();
        if (run) run.bossHp = this.currentBoss.hp;
        break;

      case 'defeated':
        this.defeatTimer -= dt;
        if (this.defeatTimer <= 0) {
          this._showResult();
        }
        break;

      case 'result':
        break;
    }
  },

  _checkBossBallCollisions(balls) {
    if (!this.currentBoss || !this.currentBoss.alive) return;
    var boss = this.currentBoss;

    for (var i = 0; i < balls.length; i++) {
      var ball = balls[i];
      if (ball.attached || !ball.active) continue;

      var ballRect = { x: ball.x - ball.radius, y: ball.y - ball.radius, width: ball.radius * 2, height: ball.radius * 2 };

      if (boss.weakPointActive) {
        var wp = boss.getWeakPointPosition();
        var wpRect = { x: wp.x - boss.weakPointRadius, y: wp.y - boss.weakPointRadius, width: boss.weakPointRadius * 2, height: boss.weakPointRadius * 2 };
        if (BR.Physics.rectsOverlap(ballRect, wpRect)) {
          var killed = boss.hitWeakPoint(ball.damage, Math.random() < (BR.BuildManager ? BR.BuildManager.getStat('criticalChance') : 0.05));
          ball.hitFlash = 0.1;
          if (!ball.modifiers.piercing) {
            ball.vy = Math.abs(ball.vy);
            ball.y = wp.y + boss.weakPointRadius + ball.radius + 2;
          }
          if (killed) {
            this._onBossDefeated();
            return;
          }
          continue;
        }
      }

      if (boss.shieldActive && boss.shieldHp > 0) {
        var shieldRect = { x: boss.x - 5, y: boss.y - 5, width: boss.width + 10, height: boss.height + 10 };
        if (BR.Physics.rectsOverlap(ballRect, shieldRect)) {
          var killed = boss.hit(ball.damage, false);
          ball.hitFlash = 0.1;
          if (BR.Audio) BR.Audio.bossHit();
          if (!ball.modifiers.piercing) {
            ball.vy = Math.abs(ball.vy);
            ball.y = boss.y + boss.height + 5 + ball.radius + 2;
          }
          if (killed) {
            this._onBossDefeated();
            return;
          }
          continue;
        }
      }

      var bossRect = boss.getBounds();
      if (BR.Physics.rectsOverlap(ballRect, bossRect)) {
        var isCrit = Math.random() < (BR.BuildManager ? BR.BuildManager.getStat('criticalChance') : 0.05);
        var killed = boss.hit(ball.damage, isCrit);
        ball.hitFlash = 0.1;
        if (BR.Audio) BR.Audio.bossHit();
        if (!ball.modifiers.piercing) {
          ball.vy = Math.abs(ball.vy);
          ball.y = bossRect.y + bossRect.height + ball.radius + 2;
        }
        if (killed) {
          this._onBossDefeated();
          return;
        }
      }
    }

    for (var i = BR.BossAttack.minions.length - 1; i >= 0; i--) {
      var m = BR.BossAttack.minions[i];
      if (!m.active) continue;
      for (var j = balls.length - 1; j >= 0; j--) {
        var ball = balls[j];
        if (ball.attached || !ball.active) continue;
        if (BR.BossAttack.checkMinionBallCollision(m, ball)) {
          m.hp -= ball.damage;
          m.hitTimer = 0.1;
          if (m.hp <= 0) {
            m.active = false;
            BR.BossAttack.minions.splice(i, 1);
            if (BR.Particles) BR.Particles.emitBrickBreak(m.x + m.width / 2, m.y + m.height / 2, m.color, 8);
            var run = BR.RunManager.getState();
            if (run) BR.RunManager.addScore(50);
          }
          if (!ball.modifiers.piercing) {
            ball.vy = -ball.vy;
          }
          break;
        }
      }
    }
  },

  _checkBossPaddleCollisions(paddle) {
    if (!paddle) return;

    if (paddle.invulnerable && paddle.invulnerable > 0) return;

    for (var i = BR.BossAttack.projectiles.length - 1; i >= 0; i--) {
      var p = BR.BossAttack.projectiles[i];
      if (BR.BossAttack.checkProjectilePaddle(p, paddle)) {
        BR.BossAttack.projectiles.splice(i, 1);
        paddle.hit();
        paddle.invulnerable = 1;
        if (BR.Juice) BR.Juice.shake(8, 0.2);
        if (BR.Audio) BR.Audio._play(200, 'sawtooth', 0.15, 0.25);
        this._onPlayerHit();
      }
    }

    for (var i = BR.BossAttack.lasers.length - 1; i >= 0; i--) {
      var l = BR.BossAttack.lasers[i];
      if (BR.BossAttack.checkLaserPaddle(l, paddle)) {
        paddle.hit();
        paddle.invulnerable = 1;
        if (BR.Juice) BR.Juice.shake(5, 0.15);
        this._onPlayerHit();
      }
    }

    for (var i = BR.BossAttack.shockwaves.length - 1; i >= 0; i--) {
      var s = BR.BossAttack.shockwaves[i];
      if (BR.BossAttack.checkShockwavePaddle(s, paddle)) {
        paddle.hit();
        paddle.invulnerable = 1;
        var pushDir = paddle.x + paddle.width / 2 < s.x ? -1 : 1;
        paddle.x += pushDir * 30;
        if (BR.Juice) BR.Juice.shake(10, 0.25);
        this._onPlayerHit();
      }
    }
  },

  _onPlayerHit() {
    if (BR.Events) BR.Events.emit('bossAttackHit', {});
    if (BR.Effects) {
      BR.Effects.addFloatingText(BR.Game.width / 2, BR.Game.height - 50, 'DANGER!', '#ff0044', {
        fontSize: 14, speed: 0.5, life: 1, drift: 0
      });
    }
  },

  _onBossDefeated() {
    this.state = 'defeated';
    this.defeatTimer = 2;
    BR.BossAttack.clear();

    var run = BR.RunManager.getState();
    if (run) run.bossesDefeated++;

    var save = BR.Storage.load();
    if (!save.defeatedBosses) save.defeatedBosses = {};
    save.defeatedBosses[this.bossId] = true;
    BR.Storage.save();

    BR.WorldManager.setBossBestScore(
      this.bossId,
      BR.RunManager.getRunScore(),
      Date.now() - this.encounterStartTime,
      this.bestCombo
    );
  },

  _showResult() {
    this.state = 'result';
    if (!this.currentBoss) return;

    var duration = Date.now() - this.encounterStartTime;
    var rewards = BR.BossReward.calculate(this.currentBoss.config, this.isReplay, this.bestCombo, duration);

    BR.RunManager.addScore(rewards.score);
    BR.RunManager.addCoins(rewards.coins);

    if (rewards.tokens > 0) {
      BR.WorldManager.addCoreTokens(rewards.tokens);
    }

    var save = BR.Storage.load();
    BR.Storage.set('bossesDefeated', (save.bossesDefeated || 0) + 1);
    BR.Storage.set('totalBricksDestroyed', save.totalBricksDestroyed || 0);

    if (BR.Game) BR.Game.state = 'boss_result';
    if (BR.UI) BR.UI.showBossResult(this.currentBoss, rewards, duration, this.bestCombo);
  },

  continueAfterBoss() {
    if (!BR.Game) return;

    var run = BR.RunManager.getState();
    if (!run) return;

    BR.Level.level = run.level;
    BR.Level.wave = run.wave;
    BR.Level.isBossWave = false;
    BR.Level.isEliteWave = false;

    BR.Game.continueAfterBoss();
  },

  draw(ctx) {
    switch (this.state) {
      case 'intro':
        this._drawIntro(ctx);
        break;
      case 'active':
      case 'defeated':
        if (this.currentBoss && this.currentBoss.alive) {
          this.currentBoss.draw(ctx);
        }
        BR.BossAttack.drawProjectiles(ctx);
        BR.BossAttack.drawLasers(ctx);
        BR.BossAttack.drawMinions(ctx);
        BR.BossAttack.drawShockwaves(ctx);
        break;
      case 'result':
        break;
    }
  },

  _drawIntro(ctx) {
    if (!this.currentBoss) return;
    var progress = 1 - (this.introTimer / 2.5);
    var alpha = Math.min(1, progress * 2);

    ctx.save();
    ctx.globalAlpha = alpha;

    var cx = ctx.canvas.width / 2;
    var cy = ctx.canvas.height / 2;

    ctx.fillStyle = this.currentBoss.color;
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.currentBoss.name, cx, cy - 20);

    ctx.font = '12px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = alpha * 0.7;
    ctx.fillText('HP: ' + this.currentBoss.maxHp.toLocaleString(), cx, cy + 10);

    if (this.currentBoss.shieldMaxHp > 0) {
      ctx.fillText('SHIELD: ' + this.currentBoss.shieldMaxHp.toLocaleString(), cx, cy + 28);
    }

    ctx.restore();
  },

  clear() {
    this.currentBoss = null;
    this.state = 'inactive';
    this.introTimer = 0;
    this.defeatTimer = 0;
    this.resultTimer = 0;
    this.bestCombo = 0;
    this.isReplay = false;
    this.bossId = '';
    BR.BossAttack.clear();
  },

  isActive() {
    return this.state === 'active' || this.state === 'intro';
  }
};
