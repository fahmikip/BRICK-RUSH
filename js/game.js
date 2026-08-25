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
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(4, 4, 220, 185);
    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const ball = game.balls[0];
    const lines = [
      'FPS: ' + this.fps,
      'Bricks: ' + (game.brickManager ? game.brickManager.count : 0),
      'Ball: ' + (ball ? '(' + ball.x.toFixed(0) + ',' + ball.y.toFixed(0) + ')' : 'none'),
      'Balls: ' + game.balls.length,
      'Collisions: ' + this.collisionCount,
      'Level: ' + BR.Level.level + '  Wave: ' + BR.Level.wave,
      'Pattern: ' + (game._currentPattern || '-'),
      'State: ' + game.state,
      'Combo: ' + BR.Combo.count + ' (x' + BR.Combo.getScoreMultiplier().toFixed(2) + ')',
      'Score: ' + game.score,
      'Queue: ' + BR.EventQueue.queueLength,
      'Particles: ' + (BR.Particles ? BR.Particles.active.length : 0),
      'Powerups: ' + BR.Powerups.activeEffects.length
    ];
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], 10, 10 + i * 14);
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
  displayScore: 0,
  runCoins: 0,
  displayCoins: 0,
  combo: 0,
  doubleCoinActive: false,

  modifiers: null,

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
    this.displayScore = 0;
    this.runCoins = 0;
    this.displayCoins = 0;
    this.doubleCoinActive = false;
    this.boss = null;
    this._waveCompletePending = false;
    this._explosionSet = null;

    BR.Level.reset();
    BR.Level.currentArea = save.currentArea || 0;
    BR.Upgrades.init();
    BR.Powerups.init();
    BR.Combo.init();
    BR.EventQueue.clear();
    BR.Juice.init();
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
    BR.EventQueue.clear();
    BR.Combo.init();
    BR.Input.reset();
  },

  _loop() {
    const now = performance.now();
    let dt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    if (dt > 0.05) dt = 0.05;

    BR.Debug.tick(dt);

    const timeScale = BR.Juice.getTimeScale();
    const scaledDt = dt * timeScale;

    if (this.state === 'playing' || this.state === 'boss') {
      this._update(scaledDt);
      BR.EventQueue.updateDelayQueue(dt);
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

    const kSpeed = 6 * dt * 60 * (this.modifiers.paddleSpeedMult || 1);
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
          BR.Juice.shieldBreak();
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
        BR.Combo.reset();
      }

      this._explosionSet = new Set();
      const activeBricks = this.brickManager.getActiveBricks();
      for (let j = activeBricks.length - 1; j >= 0; j--) {
        const brick = activeBricks[j];
        if (BR.Physics.checkBrickCollision(ball, brick)) {
          BR.Debug.collisionCount++;
          this._hitBrick(brick, ball);
          if (!ball.modifiers.piercing) break;
        }
      }
      this._explosionSet = null;

      if (this.paddle.magnetActive || (this.modifiers && this.modifiers.magnetStrength > 0)) {
        const magnetStr = this.paddle.magnetActive ? 3 : (this.modifiers.magnetStrength || 0) * 2;
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
            if (!ball.modifiers.piercing) {
              ball.vy = -ball.vy;
            }
          }
        }
      }
    }

    this.brickManager.update(dt);
    BR.Powerups.update(dt, this.width, this.height, this.paddle, this);
    BR.Combo.update(dt);
    BR.Juice.update(dt);
    BR.EventQueue.process(this);

    this.displayScore += (this.score - this.displayScore) * 0.15;
    this.displayCoins += (this.runCoins - this.displayCoins) * 0.15;
    if (Math.abs(this.displayScore - this.score) < 1) this.displayScore = this.score;
    if (Math.abs(this.displayCoins - this.runCoins) < 1) this.displayCoins = this.runCoins;

    BR.Particles.update(dt);
    BR.Effects.update(dt);

    BR.UI.updateHUD(
      Math.floor(this.displayScore),
      Math.floor(this.displayCoins),
      BR.Level.level,
      BR.Level.wave,
      BR.Combo.count,
      BR.Combo.getTimerRatio()
    );

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
    let isCrit = false;

    const critChance = this.modifiers ? this.modifiers.critChance : 0.05;
    isCrit = Math.random() < critChance;
    if (isCrit) {
      damage = Math.floor(damage * (this.modifiers ? this.modifiers.critDamageMultiplier : 3));
    }

    const destroyed = brick.hit(damage);

    if (isCrit) {
      BR.Audio?.criticalHit();
      if (BR.Particles) BR.Particles.emitCritical(brick.x + brick.width / 2, brick.y + brick.height / 2);
      if (BR.Effects) BR.Effects.damageNumber(brick.x + brick.width / 2, brick.y, damage, true);
      BR.Juice.criticalHit(brick.x + brick.width / 2, brick.y);
    } else {
      if (BR.Effects) BR.Effects.damageNumber(brick.x + brick.width / 2, brick.y, damage, false);
      BR.Juice.brickHit(brick.x, brick.y);
    }

    if (!destroyed) {
      BR.Audio?.brickHit();
    }

    if (destroyed) {
      brick.destroy();
      BR.Audio?.brickBreak();

      BR.Combo.increment();
      const milestone = BR.Combo._getMilestone(BR.Combo.count);
      if (milestone) {
        BR.Juice.comboMilestone(BR.Combo.count);
        BR.Audio?.megaCombo();
        if (BR.Particles) BR.Particles.emitMegaCombo(brick.x + brick.width / 2, brick.y + brick.height / 2, BR.Combo.count);
        if (BR.Effects) {
          BR.Effects.addFloatingText(this.width / 2, 80, milestone + ' COMBO x' + BR.Combo.count, '#ff00aa', {
            fontSize: 22,
            speed: 1,
            life: 1.5,
            drift: 0
          });
        }
        if (BR.Events) BR.Events.emit('comboMilestone', { combo: BR.Combo.count, name: milestone });
      } else if (BR.Combo.count >= 5) {
        if (BR.Particles) BR.Particles.emitCombo(brick.x + brick.width / 2, brick.y + brick.height / 2, BR.Combo.count);
        BR.Audio?.combo(BR.Combo.count);
      }

      const reward = BR.Reward.brickReward(brick, this);

      BR.Powerups.trySpawn(
        brick.x + brick.width / 2,
        brick.y + brick.height / 2,
        this.modifiers ? this.modifiers.powerupChance : 0
      );

      if (BR.Events) {
        BR.Events.emit('brickDestroyed', { brick: brick, ball: ball });
        BR.EventQueue.enqueue('brickDestroyed', { brick: brick, ball: ball });
      }

      BR.Storage._data.totalBricksDestroyed = (BR.Storage._data.totalBricksDestroyed || 0) + 1;
      if (BR.Storage._data.totalBricksDestroyed === 1) {
        this._unlockAchievement('first_break');
      }

      this._checkWaveComplete();
    }

    if (!ball.modifiers.piercing) {
      ball.hitFlash = 0.1;
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
      ball.damage = ball.calculateDamage();
      ball.baseSpeed = 5 * this.modifiers.ballSpeedMult;
      ball.speed = ball.baseSpeed;
      if (this.modifiers.ballSizeMult !== 1) {
        ball.radius = Math.floor(8 * this.modifiers.ballSizeMult);
      }
    }

    this.paddle.applyWidthMultiplier(this.modifiers.paddleWidthMult);
    BR.Powerups.applyToActiveEffects(this);

    this._loadWave();
    this.state = this.boss ? 'boss' : 'playing';
    BR.UI.showScreen('game');
    BR.Input.launched = false;

    this._unlockAchievement('first_upgrade');
  },

  _checkBallBossCollision(ball) {
    if (!this.boss || !this.boss.alive) return;
    const bossRect = this.boss.getBounds();
    const ballRect = { x: ball.x - ball.radius, y: ball.y - ball.radius, width: ball.radius * 2, height: ball.radius * 2 };

    if (BR.Physics.rectsOverlap(ballRect, bossRect)) {
      const destroyed = this.boss.hit(ball.damage);
      ball.hitFlash = 0.1;
      BR.Audio?.bossHit();
      if (!ball.modifiers.piercing) {
        ball.vy = Math.abs(ball.vy);
        ball.y = bossRect.y + bossRect.height + ball.radius + 2;
      }
      if (destroyed) this._onBossDefeated();
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
      BR.Powerups.applyToNewBall(ball, this);
    }

    if (this.balls.length === 0) {
      const ball = new BR.Ball(this.width / 2, this.paddle.y - 10);
      ball.baseDamage = Math.ceil(this.modifiers.damageMultiplier);
      ball.damage = ball.calculateDamage();
      ball.baseSpeed = 5 * this.modifiers.ballSpeedMult;
      ball.speed = ball.baseSpeed;
      if (this.modifiers.ballSizeMult !== 1) {
        ball.radius = Math.floor(8 * this.modifiers.ballSizeMult);
      }
      BR.Powerups.applyToNewBall(ball, this);
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
    if (this.balls.length >= BR.Powerups.maxBalls) return;

    const src = existing[0];
    const toSpawn = Math.min(2, BR.Powerups.maxBalls - this.balls.length);

    for (let i = 0; i < toSpawn; i++) {
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
      BR.Powerups.applyToNewBall(newBall, this);
      this.balls.push(newBall);
    }
  },

  onPowerupBomb() {
    let closest = null;
    let closestDist = Infinity;
    const bricks = this.brickManager.bricks;
    for (let i = 0; i < bricks.length; i++) {
      const brick = bricks[i];
      if (!brick.alive) continue;
      const bx = brick.x + brick.width / 2;
      const by = brick.y + brick.height / 2;
      const dist = Math.sqrt(Math.pow(bx - this.width / 2, 2) + Math.pow(by - this.height / 2, 2));
      if (dist < closestDist) { closestDist = dist; closest = brick; }
    }

    if (closest) {
      this._explosionSet = new Set();
      const cx = closest.x + closest.width / 2;
      const cy = closest.y + closest.height / 2;
      const hit = this.brickManager.damageArea(cx, cy, 150, 2, closest);
      for (let i = 0; i < hit.length; i++) {
        if (hit[i].pendingDestroy && hit[i].alive) {
          hit[i].destroy();
          BR.Reward.brickReward(hit[i], this);
        }
      }
      this._explosionSet = null;

      if (BR.Particles) BR.Particles.emitExplosion(cx, cy, 20);
      if (BR.Effects) BR.Effects.addShockwave(cx, cy, 10, 200, '#ff0044', 0.5);
    }

    BR.Audio?.explosion();
    BR.Juice.explosion(this.width / 2, this.height / 2);
  },

  onPowerupLightning() {
    const chain = 5;
    const alive = this.brickManager.getActiveBricks();
    alive.sort(() => Math.random() - 0.5);
    const hit = alive.slice(0, Math.min(chain, alive.length));

    BR.EventQueue.enqueue('lightningStrike', { bricks: hit, damage: 3 });
    BR.Audio?.chainReaction(0);
  },

  _gameOver() {
    if (this.state === 'gameover') return;
    this.state = 'gameover';
    BR.Audio?.gameOver();
    BR.Input.reset();

    if (BR.Combo.highestCombo > (BR.Storage.get('highestCombo') || 0)) {
      BR.Storage.set('highestCombo', BR.Combo.highestCombo);
    }

    const saveData = BR.Storage.load();
    const isNew = this.score > (saveData.bestScore || 0);
    if (isNew) BR.Storage.set('bestScore', this.score);

    const earned = BR.Storage.addCoins(this.runCoins);
    BR.Storage._data.highestWave = Math.max(
      BR.Storage._data.highestWave || 0,
      (BR.Level.level - 1) * BR.Level.wavesPerLevel + BR.Level.wave
    );

    if (BR.Combo.highestCombo >= 50) this._unlockAchievement('combo_master');
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

    if (this.paddle) this.paddle.draw(ctx);
    if (this.boss && this.boss.alive) this.boss.draw(ctx);

    BR.Powerups.draw(ctx);
    BR.Particles.draw(ctx);
    BR.Effects.draw(ctx);
    BR.Juice.drawFlash(ctx, this.width, this.height);

    BR.Powerups.drawActiveEffects(ctx, 10, this.height - 30);

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
