window.BR = window.BR || {};

BR.Debug = {
  enabled: false,
  fps: 0,
  frameCount: 0,
  fpsTimer: 0,
  collisionCount: 0,
  draw: function(ctx, game) {
    if (!this.enabled) return;
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(4, 4, 200, 130);
    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const lines = [
      'FPS: ' + this.fps,
      'Bricks: ' + (game.brickManager ? game.brickManager.count : 0),
      'Ball: (' + (game.balls[0] ? game.balls[0].x.toFixed(0) : '-') + ', ' + (game.balls[0] ? game.balls[0].y.toFixed(0) : '-') + ')',
      'Collisions: ' + this.collisionCount,
      'Level: ' + BR.Level.level + '  Wave: ' + BR.Level.wave,
      'Pattern: ' + (game._currentPattern || '-'),
      'State: ' + game.state,
      'Score: ' + game.score
    ];
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], 10, 10 + i * 15);
    }
    ctx.restore();
  },
  tick: function(dt) {
    this.frameCount++;
    this.fpsTimer += dt;
    if (this.fpsTimer >= 1) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsTimer -= 1;
    }
  }
};

BR.Game = {
  canvas: null,
  ctx: null,
  width: 0,
  height: 0,

  state: 'idle',
  balls: [],
  paddle: null,
  brickManager: null,
  boss: null,

  score: 0,
  runCoins: 0,
  combo: 0,
  comboTimer: 0,
  comboTimeout: 3,

  modifiers: null,
  doubleCoinActive: false,

  lastTime: 0,
  animFrameId: null,

  _waveCompletePending: false,
  _pendingWaveType: null,
  _currentPattern: '',
  _explosionSet: null,

  init() {
    this.canvas = BR.UI?.elements?.gameCanvas || document.getElementById('gameCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this._resize();
    window.addEventListener('resize', () => this._resize());
  },

  _resize() {
    if (!this.canvas) return;
    const isMobile = window.innerWidth < 768;
    const maxW = isMobile ? window.innerWidth : Math.min(window.innerWidth * 0.6, 600);
    const maxH = isMobile ? window.innerHeight * 0.75 : window.innerHeight * 0.85;
    this.width = Math.floor(maxW);
    this.height = Math.floor(maxH);
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
  },

  start() {
    this._resize();
    BR.Storage.load();
    const save = BR.Storage._data;
    this.modifiers = BR.Upgrades.calculateModifiers(save.permanentUpgrades);

    this.score = 0;
    this.runCoins = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.doubleCoinActive = false;
    this.boss = null;
    this._waveCompletePending = false;
    this._explosionSet = null;

    BR.Level.reset();
    BR.Level.currentArea = save.currentArea || 0;
    BR.Upgrades.init();
    BR.Powerups.init();
    BR.Input.reset();
    BR.Particles.clear();
    BR.Effects.clear();

    this.brickManager = new BR.BrickManager();

    this.paddle = new BR.Paddle(this.width, this.height);
    this.paddle.applyWidthMultiplier(this.modifiers.paddleWidthMult);

    this.balls = [];
    const ball = new BR.Ball(this.width / 2, this.paddle.y - 10);
    ball.baseDamage = Math.ceil(this.modifiers.damageMultiplier);
    ball.damage = ball.baseDamage;
    ball.baseSpeed = 5 * this.modifiers.ballSpeedMult;
    ball.speed = ball.baseSpeed;
    if (this.modifiers.ballSizeMult !== 1) {
      ball.radius = Math.floor(8 * this.modifiers.ballSizeMult);
    }
    this.balls.push(ball);

    this._loadWave();

    if (this.modifiers.autoShield) {
      this.paddle.shield = true;
      this.paddle.shieldUsed = false;
    }

    this.state = 'playing';
    BR.Input.launched = false;
    BR.UI.showScreen('game');

    if (!this.animFrameId) {
      this.lastTime = performance.now();
      this._loop();
    }
  },

  _loadWave() {
    this.brickManager.clear();
    this.boss = null;
    this._explosionSet = null;
    BR.UI.hideBossBar();

    if (BR.Level.shouldBossWave()) {
      this.state = 'boss';
      this.boss = new BR.Boss(BR.Level.currentArea, BR.Level.level, this.width);
      BR.UI.showScreen('boss');
      BR.UI.updateBossBar(this.boss.name, this.boss.hp, this.boss.maxHp);
      return;
    }

    const waveBricks = BR.Level.generateWave(
      BR.Level.level, BR.Level.wave, this.width, this.height
    );
    for (let i = 0; i < waveBricks.length; i++) {
      this.brickManager.addBrick(waveBricks[i]);
    }

    const config = BR.LevelGenerator.getConfig(BR.Level.level, BR.Level.wave, this.width, this.height);
    this._currentPattern = config.pattern;
  },

  pause() {
    if (this.state === 'playing' || this.state === 'boss') {
      this.state = 'paused';
    }
  },

  resume() {
    if (this.state === 'paused') {
      this.state = this.boss ? 'boss' : 'playing';
      this.lastTime = performance.now();
    }
  },

  quit() {
    this.state = 'idle';
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    BR.Particles.clear();
    BR.Effects.clear();
    BR.Powerups.clear();
    BR.Input.reset();
  },

  _loop() {
    const now = performance.now();
    let dt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    if (dt > 0.05) dt = 0.05;

    BR.Debug.tick(dt);

    if (this.state === 'playing' || this.state === 'boss') {
      this._update(dt);
    }

    if (this.state !== 'idle' && this.state !== 'gameover') {
      this._draw();
    }

    if (this.state !== 'idle' && this.state !== 'gameover') {
      this.animFrameId = requestAnimationFrame(() => this._loop());
    } else {
      this.animFrameId = null;
    }
  },

  _update(dt) {
    const targetPx = BR.Input.targetX * this.width;
    this.paddle.update(dt, targetPx, this.width);

    const kSpeed = 6 * dt * 60 * this.modifiers.paddleSpeedMult;
    if (BR.Input.isKeyDown('ArrowLeft') || BR.Input.isKeyDown('KeyA')) {
      this.paddle.x -= kSpeed;
    }
    if (BR.Input.isKeyDown('ArrowRight') || BR.Input.isKeyDown('KeyD')) {
      this.paddle.x += kSpeed;
    }
    if (this.paddle.x < 0) this.paddle.x = 0;
    if (this.paddle.x + this.paddle.width > this.width) {
      this.paddle.x = this.width - this.paddle.width;
    }

    for (let i = this.balls.length - 1; i >= 0; i--) {
      const ball = this.balls[i];

      if (ball.attached) {
        ball.update(dt, this.paddle);
        if (BR.Input.launched) {
          ball.launch();
        }
        continue;
      }

      ball.update(dt, this.paddle);

      if (this.state === 'boss' && this.boss) {
        this._checkBallBossCollision(ball);
      }

      const wallResult = BR.Physics.checkWallCollision(ball, this.width, this.height);
      if (wallResult === 'wall') {
        BR.Audio?.ballBounce();
      } else if (wallResult === 'bottom') {
        if (this.paddle.shield && !this.paddle.shieldUsed) {
          this.paddle.shieldUsed = true;
          ball.reset(this.paddle);
          BR.Audio?.powerup();
          if (BR.Particles) BR.Particles.emitPaddleHit(ball.x, this.paddle.y);
        } else {
          ball.active = false;
          this.balls.splice(i, 1);
          if (this.balls.length === 0) {
            setTimeout(() => this._gameOver(), 300);
          }
        }
        continue;
      }

      if (BR.Physics.checkPaddleCollision(ball, this.paddle)) {
        BR.Audio?.ballBounce();
        if (BR.Particles) BR.Particles.emitPaddleHit(ball.x, this.paddle.y);
        this.combo = 0;
      }

      this._explosionSet = new Set();
      const activeBricks = this.brickManager.getActiveBricks();
      for (let j = activeBricks.length - 1; j >= 0; j--) {
        const brick = activeBricks[j];
        if (BR.Physics.checkBrickCollision(ball, brick)) {
          BR.Debug.collisionCount++;
          this._hitBrick(brick, ball);
          if (!ball.piercing) break;
        }
      }
      this._explosionSet = null;

      if (this.paddle.magnetActive || this.modifiers.magnetStrength > 0) {
        const magnetStr = this.paddle.magnetActive ? 3 : this.modifiers.magnetStrength * 2;
        const dx = (this.paddle.x + this.paddle.width / 2) - ball.x;
        const dy = this.paddle.y - ball.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0 && dist < 200) {
          ball.vx += (dx / dist) * magnetStr * dt * 60;
          ball.vy += (dy / dist) * magnetStr * 0.5 * dt * 60;
        }
      }

      const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
      const minSpeed = ball.baseSpeed * 0.8;
      const maxSpeed = ball.baseSpeed * 2.5;
      if (speed > 0) {
        if (speed < minSpeed) {
          ball.vx = (ball.vx / speed) * minSpeed;
          ball.vy = (ball.vy / speed) * minSpeed;
        } else if (speed > maxSpeed) {
          ball.vx = (ball.vx / speed) * maxSpeed;
          ball.vy = (ball.vy / speed) * maxSpeed;
        }
      }
    }

    if (this.boss && this.boss.alive) {
      this.boss.update(dt, this.width, this.height);

      for (let i = this.boss.miniBricks.length - 1; i >= 0; i--) {
        const mb = this.boss.miniBricks[i];
        if (!mb.alive) continue;
        for (let j = this.balls.length - 1; j >= 0; j--) {
          const ball = this.balls[j];
          if (ball.attached) continue;
          if (BR.Physics.rectsOverlap(
            { x: ball.x - ball.radius, y: ball.y - ball.radius, width: ball.radius * 2, height: ball.radius * 2 },
            { x: mb.x, y: mb.y, width: mb.width, height: mb.height }
          )) {
            mb.hp -= ball.damage;
            if (mb.hp <= 0) {
              mb.alive = false;
              this.boss.miniBricks.splice(i, 1);
              if (BR.Particles) BR.Particles.emitBrickBreak(mb.x + mb.width / 2, mb.y + mb.height / 2, mb.color, 4);
            }
            if (!ball.piercing) {
              ball.vy = -ball.vy;
            }
          }
        }
      }
    }

    this.brickManager.update(dt);

    BR.Powerups.update(dt, this.width, this.height, this.paddle, this);

    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.combo = 0;
      }
    }

    BR.Particles.update(dt);
    BR.Effects.update(dt);

    BR.UI.updateHUD(this.score, this.runCoins, BR.Level.level, BR.Level.wave, this.combo);

    if (this.boss && this.boss.alive) {
      BR.UI.updateBossBar(this.boss.name, this.boss.hp, this.boss.maxHp);
    }

    if (this._waveCompletePending) {
      this._waveCompletePending = false;
      this._handleWaveComplete(this._pendingWaveType);
    }
  },

  _hitBrick(brick, ball) {
    let damage = ball.damage;

    const isCrit = Math.random() < this.modifiers.critChance;
    if (isCrit) {
      damage = Math.floor(damage * this.modifiers.critDamageMultiplier);
      BR.Audio?.criticalHit();
      if (BR.Particles) {
        BR.Particles.emitCritical(brick.x + brick.width / 2, brick.y + brick.height / 2);
      }
      if (BR.Effects) {
        BR.Effects.damageNumber(brick.x + brick.width / 2, brick.y, damage, true);
      }
      BR.UI.shake(8, 0.15);
    } else {
      if (BR.Effects) {
        BR.Effects.damageNumber(brick.x + brick.width / 2, brick.y, damage, false);
      }
    }

    if (this.modifiers.doubleStrike > 0 && Math.random() < this.modifiers.doubleStrike) {
      damage *= 2;
      if (BR.Particles) {
        BR.Particles.emitText(brick.x + brick.width / 2, brick.y - 10, 'DOUBLE!', '#FF00AA');
      }
    }

    const destroyed = brick.hit(damage);

    if (!destroyed) {
      BR.Audio?.brickHit();
    }

    if (destroyed) {
      brick.destroy();

      this.combo++;
      this.comboTimer = this.comboTimeout;

      const scoreGain = Math.floor(brick.scoreValue * (1 + this.combo * 0.1));
      this.score += scoreGain;

      let coinGain = brick.coinValue;
      if (this.doubleCoinActive) coinGain *= 2;
      coinGain = Math.floor(coinGain * this.modifiers.coinMult);
      this.runCoins += coinGain;

      if (this.combo > 0 && this.combo % 5 === 0) {
        BR.Audio?.combo(this.combo);
        BR.UI.shake(3, 0.1);
      }

      BR.Powerups.trySpawn(
        brick.x + brick.width / 2,
        brick.y + brick.height / 2,
        this.modifiers.powerupChance
      );

      switch (brick.type.id) {
        case 'explosive':
          if (!this._explosionSet || !this._explosionSet.has(brick)) {
            this._chainExplosion(brick.x + brick.width / 2, brick.y + brick.height / 2, 100, brick);
            BR.Audio?.explosion();
            if (BR.Effects) {
              BR.Effects.addShockwave(brick.x + brick.width / 2, brick.y + brick.height / 2, 5, 80, '#ff3344', 0.4);
            }
            BR.UI.shake(10, 0.3);
          }
          break;
        case 'chain':
          this._chainHit(brick, 2 + this.modifiers.chainCount);
          break;
        case 'mystery':
          this._mysteryReward(brick);
          break;
        case 'coin':
          if (BR.Particles) {
            BR.Particles.emitCoin(brick.x + brick.width / 2, brick.y);
          }
          break;
      }

      if (this.modifiers.explosiveHits) {
        if (!this._explosionSet || !this._explosionSet.has(brick)) {
          this._chainExplosion(brick.x + brick.width / 2, brick.y + brick.height / 2, 60, brick);
        }
      }

      if (this.modifiers.vampireHeal && this.balls.length > 0) {
        this.paddle.applyWidthMultiplier(Math.min(this.paddle.width / this.paddle.baseWidth + 0.05, 2.5));
      }

      BR.Storage._data.totalBricksDestroyed = (BR.Storage._data.totalBricksDestroyed || 0) + 1;
      if (BR.Storage._data.totalBricksDestroyed === 1) {
        this._unlockAchievement('first_break');
      }

      this._checkWaveComplete();
    }

    if (!ball.piercing) {
      ball.hitFlash = 0.1;
    }
  },

  _chainExplosion(cx, cy, radius, sourceBrick) {
    if (this._explosionSet && sourceBrick) {
      if (this._explosionSet.has(sourceBrick)) return;
      this._explosionSet.add(sourceBrick);
    }

    const hit = this.brickManager.damageArea(cx, cy, radius, 2, sourceBrick);
    for (let i = 0; i < hit.length; i++) {
      const brick = hit[i];
      if (!brick.alive || brick.pendingDestroy) {
        brick.destroy();
        this.score += brick.scoreValue;
        this.runCoins += Math.floor(brick.coinValue * this.modifiers.coinMult);
      }
    }
    if (BR.Particles) BR.Particles.emitExplosion(cx, cy, 20);
  },

  _chainHit(hitBrick, chainCount) {
    const hit = this.brickManager.chainToNearest(hitBrick, chainCount, 1);
    if (BR.Particles) {
      for (let i = 0; i < hit.length; i++) {
        BR.Particles.emitBrickHit(
          hit[i].x + hit[i].width / 2,
          hit[i].y + hit[i].height / 2,
          '#aa44ff', 3
        );
      }
    }
    if (BR.Events) {
      BR.Events.emit('chainTriggered', { source: hitBrick, count: hit.length });
    }
  },

  _mysteryReward(brick) {
    const roll = Math.random();
    if (roll < 0.4) {
      this.runCoins += 10;
      if (BR.Particles) BR.Particles.emitCoin(brick.x + brick.width / 2, brick.y);
      if (BR.Effects) {
        BR.Effects.addFloatingText(brick.x + brick.width / 2, brick.y, '+10 COINS', '#ffcc00', { fontSize: 14 });
      }
    } else if (roll < 0.7) {
      this.score += 100;
      if (BR.Effects) {
        BR.Effects.addFloatingText(brick.x + brick.width / 2, brick.y, '+100', '#ff00aa', { fontSize: 14 });
      }
    } else {
      BR.Powerups._spawn(BR.Powerups.TYPES.MULTIBALL, brick.x + brick.width / 2, brick.y);
      if (BR.Effects) {
        BR.Effects.addFloatingText(brick.x + brick.width / 2, brick.y, 'POWER UP!', '#aa44ff', { fontSize: 12 });
      }
    }
  },

  _checkWaveComplete() {
    if (this.state === 'boss') return;
    if (this.brickManager.destructibleCount > 0) return;

    BR.Audio?.levelComplete();
    const waveType = BR.Level.nextWave();
    this._waveCompletePending = true;
    this._pendingWaveType = waveType;
  },

  _handleWaveComplete(waveType) {
    if (waveType === 'boss') {
      this._loadWave();
    } else {
      const choices = BR.Upgrades.getChoices(3);
      this.state = 'upgrading';
      BR.UI.showUpgradeSelection(choices);
    }
  },

  onUpgradeChosen() {
    this.modifiers = BR.Upgrades.calculateModifiers(BR.Storage._data.permanentUpgrades);

    for (const ball of this.balls) {
      ball.baseDamage = Math.ceil(this.modifiers.damageMultiplier);
      ball.damage = ball.baseDamage;
      ball.baseSpeed = 5 * this.modifiers.ballSpeedMult;
      ball.speed = ball.baseSpeed;
      if (this.modifiers.ballSizeMult !== 1) {
        ball.radius = Math.floor(8 * this.modifiers.ballSizeMult);
      }
    }

    this.paddle.applyWidthMultiplier(this.modifiers.paddleWidthMult);

    this._loadWave();
    this.state = this.boss ? 'boss' : 'playing';
    BR.UI.showScreen('game');
    BR.Input.launched = false;

    this._unlockAchievement('first_upgrade');
  },

  _checkBallBossCollision(ball) {
    if (!this.boss || !this.boss.alive) return;

    const bossRect = this.boss.getBounds();
    const ballRect = {
      x: ball.x - ball.radius,
      y: ball.y - ball.radius,
      width: ball.radius * 2,
      height: ball.radius * 2
    };

    if (BR.Physics.rectsOverlap(ballRect, bossRect)) {
      const destroyed = this.boss.hit(ball.damage);
      ball.hitFlash = 0.1;
      BR.Audio?.bossHit();

      if (!ball.piercing) {
        ball.vy = Math.abs(ball.vy);
        ball.y = bossRect.y + bossRect.height + ball.radius + 2;
      }

      if (destroyed) {
        this._onBossDefeated();
      }
    }
  },

  _onBossDefeated() {
    this.score += 500;
    const coinReward = 100 + BR.Level.level * 50;
    this.runCoins += coinReward;
    this.boss = null;

    BR.Storage._data.bossesDefeated = (BR.Storage._data.bossesDefeated || 0) + 1;
    this._unlockAchievement('boss_slayer');

    BR.UI.hideBossBar();

    setTimeout(() => {
      this.state = 'idle';
      BR.UI.showVictory(coinReward);
    }, 800);
  },

  continueAfterBoss() {
    const result = BR.Level.completeLevel();
    BR.Storage.set('currentArea', BR.Level.currentArea);

    if (result === 'area_unlock') {
      const areas = BR.Storage.get('unlockedAreas') || [0];
      if (!areas.includes(BR.Level.currentArea)) {
        areas.push(BR.Level.currentArea);
        BR.Storage.set('unlockedAreas', areas);
      }
    }

    this._loadWave();
    this.state = 'playing';
    BR.Input.launched = false;
    BR.UI.showScreen('game');

    for (const ball of this.balls) {
      ball.reset(this.paddle);
    }

    if (this.balls.length === 0) {
      const ball = new BR.Ball(this.width / 2, this.paddle.y - 10);
      ball.baseDamage = Math.ceil(this.modifiers.damageMultiplier);
      ball.damage = ball.baseDamage;
      ball.baseSpeed = 5 * this.modifiers.ballSpeedMult;
      ball.speed = ball.baseSpeed;
      if (this.modifiers.ballSizeMult !== 1) {
        ball.radius = Math.floor(8 * this.modifiers.ballSizeMult);
      }
      this.balls.push(ball);
    }

    if (this.modifiers.autoShield) {
      this.paddle.shield = true;
      this.paddle.shieldUsed = false;
    }
  },

  onPowerupMultiball() {
    const existing = this.balls.filter(b => !b.attached && b.active);
    if (existing.length === 0) return;

    const src = existing[0];
    for (let i = 0; i < 2; i++) {
      const newBall = new BR.Ball(src.x, src.y);
      newBall.attached = false;
      newBall.active = true;
      newBall.baseDamage = src.baseDamage;
      newBall.damage = src.damage;
      newBall.baseSpeed = src.baseSpeed;
      newBall.speed = src.speed;
      newBall.radius = src.radius;
      newBall.color = src.color;
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.8;
      newBall.vx = Math.cos(angle) * newBall.speed;
      newBall.vy = Math.sin(angle) * newBall.speed;
      this.balls.push(newBall);
    }
  },

  onPowerupBomb() {
    let closest = null;
    let closestDist = Infinity;
    for (let i = 0; i < this.brickManager.bricks.length; i++) {
      const brick = this.brickManager.bricks[i];
      if (!brick.alive) continue;
      const bx = brick.x + brick.width / 2;
      const by = brick.y + brick.height / 2;
      const dist = Math.sqrt(
        Math.pow(bx - this.width / 2, 2) + Math.pow(by - this.height / 2, 2)
      );
      if (dist < closestDist) {
        closestDist = dist;
        closest = brick;
      }
    }

    if (closest) {
      this._chainExplosion(closest.x + closest.width / 2, closest.y + closest.height / 2, 150, closest);
    }
    BR.Audio?.explosion();
    BR.UI.shake(10, 0.3);
    if (BR.Effects) {
      BR.Effects.addShockwave(this.width / 2, this.height / 2, 10, 200, '#ff0044', 0.5);
    }
  },

  onPowerupLightning() {
    const chain = 3;
    const alive = this.brickManager.getActiveBricks();
    alive.sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(chain, alive.length); i++) {
      alive[i].hit(3);
      if (BR.Particles) {
        BR.Particles.emitCritical(alive[i].x + alive[i].width / 2, alive[i].y + alive[i].height / 2, 5);
      }
      if (BR.Effects) {
        BR.Effects.addShockwave(alive[i].x + alive[i].width / 2, alive[i].y + alive[i].height / 2, 3, 30, '#ffcc00', 0.2);
      }
    }
  },

  _gameOver() {
    if (this.state === 'gameover') return;
    this.state = 'gameover';
    BR.Audio?.gameOver();
    BR.Input.reset();

    const saveData = BR.Storage.load();
    const isNew = this.score > (saveData.bestScore || 0);

    if (isNew) {
      BR.Storage.set('bestScore', this.score);
    }

    const earned = BR.Storage.addCoins(this.runCoins);

    BR.Storage._data.highestWave = Math.max(
      BR.Storage._data.highestWave || 0,
      (BR.Level.level - 1) * BR.Level.wavesPerLevel + BR.Level.wave
    );

    if (this.combo >= 50) this._unlockAchievement('combo_master');
    if ((BR.Storage._data.totalBricksDestroyed || 0) >= 1000) this._unlockAchievement('demolition');
    if ((BR.Storage._data.totalCoinsEarned || 0) >= 10000) this._unlockAchievement('millionaire');
    if (BR.Storage._data.highestWave >= 50) this._unlockAchievement('unstoppable');
    if (BR.Level.wave >= 5 || BR.Level.level > 1) this._unlockAchievement('survivor');

    BR.Storage.save();

    BR.UI.showGameOver(this.score, BR.Storage.get('bestScore'), earned, isNew);
  },

  _unlockAchievement(id) {
    const achs = BR.Storage.get('achievements') || {};
    if (!achs[id]) {
      achs[id] = true;
      BR.Storage.set('achievements', achs);
    }
  },

  _draw() {
    if (!this.ctx) return;
    const ctx = this.ctx;

    const area = BR.Level.getCurrentArea();
    ctx.fillStyle = area ? area.bgColor : '#0a0a1a';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.save();

    this.brickManager.draw(ctx);

    for (const ball of this.balls) {
      ball.draw(ctx);
    }

    if (this.paddle) {
      this.paddle.draw(ctx);
    }

    if (this.boss && this.boss.alive) {
      this.boss.draw(ctx);
    }

    BR.Powerups.draw(ctx);
    BR.Particles.draw(ctx);
    BR.Effects.draw(ctx);

    ctx.restore();

    if (this.state === 'playing' || this.state === 'boss') {
      const hasAttached = this.balls.some(b => b.attached);
      if (hasAttached) {
        ctx.save();
        ctx.globalAlpha = 0.5 + Math.sin(performance.now() / 300) * 0.3;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        const tapText = BR.Input.isTouchDevice ? 'TAP TO LAUNCH' : 'CLICK / SPACE TO LAUNCH';
        ctx.fillText(tapText, this.width / 2, this.height - 80);
        ctx.restore();
      }
    }

    BR.Debug.draw(ctx, this);
  }
};
