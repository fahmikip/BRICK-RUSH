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
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(4, 4, 260, 320);
    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    var ball = game.balls[0];
    var run = BR.RunManager.state;
    var lines = [
      'FPS: ' + this.fps,
      'Bricks: ' + (game.brickManager ? game.brickManager.count : 0),
      'Ball: ' + (ball ? '(' + ball.x.toFixed(0) + ',' + ball.y.toFixed(0) + ')' : 'none'),
      'Balls: ' + game.balls.length,
      'Collisions: ' + this.collisionCount,
      'Level: ' + (run ? run.level : BR.Level.level) + '  Wave: ' + (run ? run.wave : BR.Level.wave),
      'State: ' + game.state,
      'Combo: ' + BR.Combo.count + ' (x' + BR.Combo.getScoreMultiplier().toFixed(2) + ')',
      'Score: ' + (run ? run.score : game.score),
      'Coins: ' + (run ? run.coins : 0),
      'Queue: ' + BR.EventQueue.queueLength,
      'Particles: ' + (BR.Particles ? BR.Particles.active.length : 0),
      'Powerups: ' + BR.Powerups.activeEffects.length,
      'DMG: ' + Math.round(BR.BuildManager.getStat('damageMultiplier') * 100) + '%',
      'CRIT: ' + Math.round(BR.BuildManager.getStat('criticalChance') * 100) + '%',
      'MULTI: ' + Math.round(BR.BuildManager.getStat('coinMultiplier') * 100) + '%',
      'Boss: ' + (BR.BossManager && BR.BossManager.currentBoss ? BR.BossManager.currentBoss.name + ' ' + BR.BossManager.state : 'none'),
      'Tokens: ' + (BR.WorldManager ? BR.WorldManager.getCoreTokens() : 0)
    ];
    for (var i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], 10, 10 + i * 16);
    }
    ctx.restore();
    this._drawDebugButtons(ctx, game);
  },
  _drawDebugButtons: function(ctx, game) {
    if (!this.enabled) return;
    var btns = [
      { label: '+1000 COINS', action: function() { BR.Storage.addCoins(1000); BR.UI.updateMenuInfo(); } },
      { label: 'MAX TEMP UPGRADES', action: function() { for (var i = 0; i < 5; i++) { var ch = BR.UpgradeManager.getChoices(1); if (ch.length > 0) BR.UpgradeManager.selectUpgrade(ch[0]); } } },
      { label: 'RESET RUN', action: function() { game._gameOver(); } },
      { label: 'UNLOCK ALL', action: function() { var save = BR.Storage.load(); save.unlocks = {}; for (var i = 0; i < BR.UnlockManager.DEFINITIONS.length; i++) { save.unlocks[BR.UnlockManager.DEFINITIONS[i].id] = true; } BR.Storage.save(); BR.UnlockManager.init(); } },
      { label: 'DEFEAT BOSS', action: function() { if (BR.BossManager && BR.BossManager.currentBoss) { BR.BossManager.currentBoss.hp = 0; BR.BossManager.currentBoss.alive = false; BR.BossManager._onBossDefeated(); } } }
    ];
    var y = 275;
    for (var i = 0; i < btns.length; i++) {
      var bx = 10, by = y + i * 28, bw = 240, bh = 24;
      ctx.fillStyle = 'rgba(0, 240, 255, 0.2)';
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, by, bw, bh);
      ctx.fillStyle = '#00f0ff';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(btns[i].label, bx + bw / 2, by + 8);
    }
  },
  handleDebugClick: function(x, y, game) {
    if (!this.enabled) return false;
    var y0 = 275;
    var btns = [
      function() { BR.Storage.addCoins(1000); BR.UI.updateMenuInfo(); },
      function() { for (var i = 0; i < 5; i++) { var ch = BR.UpgradeManager.getChoices(1); if (ch.length > 0) BR.UpgradeManager.selectUpgrade(ch[0]); } },
      function() { game._gameOver(); },
      function() { var save = BR.Storage.load(); save.unlocks = {}; for (var i = 0; i < BR.UnlockManager.DEFINITIONS.length; i++) { save.unlocks[BR.UnlockManager.DEFINITIONS[i].id] = true; } BR.Storage.save(); BR.UnlockManager.init(); },
      function() { if (BR.BossManager && BR.BossManager.currentBoss) { BR.BossManager.currentBoss.hp = 0; BR.BossManager.currentBoss.alive = false; BR.BossManager._onBossDefeated(); } }
    ];
    for (var i = 0; i < btns.length; i++) {
      var by = y0 + i * 28;
      if (x >= 10 && x <= 250 && y >= by && y <= by + 24) {
        btns[i]();
        return true;
      }
    }
    return false;
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
  doubleCoinActive: false,

  modifiers: null,

  lastTime: 0,
  animFrameId: null,

  _waveCompletePending: false,
  _pendingWaveType: null,
  _currentPattern: '',
  _explosionSet: null,
  _pendingUpgradeChoices: null,
  _bossEncounterArea: 0,

  init() {
    this.canvas = BR.UI?.elements?.gameCanvas || document.getElementById('gameCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this._resize();
    window.addEventListener('resize', () => this._resize());
    this.canvas.addEventListener('click', function(e) {
      if (BR.Debug.enabled) {
        var rect = BR.Game.canvas.getBoundingClientRect();
        var scaleX = BR.Game.canvas.width / rect.width;
        var scaleY = BR.Game.canvas.height / rect.height;
        var cx = (e.clientX - rect.left) * scaleX;
        var cy = (e.clientY - rect.top) * scaleY;
        BR.Debug.handleDebugClick(cx, cy, BR.Game);
      }
    });
  },

  _resize() {
    if (!this.canvas) return;
    var isMobile = window.innerWidth < 768;
    var maxW = isMobile ? window.innerWidth : Math.min(window.innerWidth * 0.6, 600);
    var hudH = isMobile ? 44 : 56;
    var maxH = window.innerHeight - hudH - 20;
    this.width = Math.floor(maxW);
    this.height = Math.floor(Math.max(200, maxH));
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.canvas.style.marginTop = hudH + 'px';
  },

  start(isDaily) {
    this._resize();
    BR.Storage.load();

    var run = BR.RunManager.newRun(isDaily);
    this.modifiers = BR.BuildManager.getStats();

    if (BR.HardcoreManager.active) {
      BR.HardcoreManager.applyToModifiers(this.modifiers);
    }

    this.score = 0;
    this.displayScore = 0;
    this.runCoins = 0;
    this.displayCoins = 0;
    this.doubleCoinActive = false;
    this.boss = null;
    this._waveCompletePending = false;
    this._explosionSet = null;
    this._pendingUpgradeChoices = null;
    this._bossEncounterArea = 0;
    this.lives = BR.HardcoreManager.active ? BR.HardcoreManager.config.hardcore.lives : 1;

    if (BR.BossManager) BR.BossManager.clear();
    if (BR.BossAttack) BR.BossAttack.clear();
    if (BR.EliteManager) BR.EliteManager.clear();
    if (BR.WorldManager) BR.WorldManager.init();
    if (BR.EnduranceManager && BR.EnduranceManager.active) BR.EnduranceManager.start();
    if (BR.RageEvents && BR.HardcoreManager.active) BR.RageEvents.start();
    else if (BR.RageEvents) BR.RageEvents.stop();

    BR.Level.reset();
    var savedArea = BR.Storage.get('currentArea') || 0;
    if (isDaily) {
      var daily = BR.DailyChallenge.getData();
      this.modifiers.damageMultiplier = daily.modifiers.damageMultiplier;
      this.modifiers.ballSpeed = daily.modifiers.ballSpeed;
      this.modifiers.paddleWidth = daily.modifiers.paddleWidth;
      this.modifiers.coinMultiplier = daily.modifiers.coinMultiplier;
    }
    BR.Level.currentArea = savedArea;
    this._bossEncounterArea = savedArea;
    BR.Upgrades.init();
    BR.Powerups.init();
    BR.Combo.init();
    BR.EventQueue.clear();
    BR.Juice.init();
    BR.Input.reset();
    BR.Particles.clear();
    BR.Effects.clear();
    if (BR.RageEvents && BR.HardcoreManager.active) BR.RageEvents.init();

    this.brickManager = new BR.BrickManager();

    this.paddle = new BR.Paddle(this.width, this.height);
    this.paddle.applyWidthMultiplier(this.modifiers.paddleWidth);
    if (BR.HardcoreManager.active) {
      BR.HardcoreManager.applyToPaddle(this.paddle);
    }

    this.balls = [];
    var ball = new BR.Ball(this.width / 2, this.paddle.y - 10);
    ball.baseDamage = Math.ceil(this.modifiers.damageMultiplier);
    ball.damage = ball.baseDamage;
    ball.baseSpeed = 5 * this.modifiers.ballSpeed;
    ball.speed = ball.baseSpeed;
    if (this.modifiers.ballSizeMult !== 1) {
      ball.radius = Math.floor(8 * this.modifiers.ballSizeMult);
    }
    if (BR.HardcoreManager.active) {
      BR.HardcoreManager.applyToBall(ball);
    }
    var skin = BR.CollectionManager.getActiveBallSkin();
    ball.color = skin.color;
    this.balls.push(ball);

    if (this.paddle) {
      var pskin = BR.CollectionManager.getActivePaddleSkin();
      this.paddle.color = pskin.color;
    }

    if (BR.HardcoreManager.active) {
      BR.HardcoreManager.applyToComboDuration();
    }

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

    var run = BR.RunManager.getState();

    // Check if previous level was a boss level (every 10 levels)
    // Level is already incremented by RunManager, so check (level-1)
    var bossInterval = BR.EnduranceManager && BR.EnduranceManager.active ? BR.EnduranceManager.bossEvery : 10;
    if (run.level > 1 && (run.level - 1) % bossInterval === 0 && run.wave === 1) {
      BR.Level.isBossWave = true;
    }

    if (run.wave === BR.Level.wavesPerLevel && !BR.Level.isBossWave) {
      BR.Level.isEliteWave = true;
    } else if (!BR.Level.isBossWave) {
      BR.Level.isEliteWave = false;
    }

    if (BR.Level.shouldBossWave()) {
      this.state = 'boss_intro';
      BR.BossManager.startEncounter(this._bossEncounterArea, run.level, this.width, this.height, false);
      BR.UI.showScreen('boss_intro');
      return;
    }

    if (BR.Level.isEliteWave) {
      var eliteBricks = BR.EliteManager.generateEliteWave(run.level, run.wave, this.width, this.height);
      for (var i = 0; i < eliteBricks.length; i++) {
        this.brickManager.addBrick(eliteBricks[i]);
      }
      BR.UI.showScreen('elite_announce');
      setTimeout(function() {
        if (BR.Game.state === 'playing' || BR.Game.state === 'elite_announce') {
          BR.UI.showScreen('game');
        }
      }, 2000);
      return;
    }

    var waveBricks = BR.Level.generateWave(
      run.level, run.wave, this.width, this.height
    );
    for (var i = 0; i < waveBricks.length; i++) {
      this.brickManager.addBrick(waveBricks[i]);
    }

    var config = BR.LevelGenerator.getConfig(run.level, run.wave, this.width, this.height);
    this._currentPattern = config.pattern;
  },

  pause() {
    if (this.state === 'playing' || this.state === 'boss' || this.state === 'boss_intro') {
      this.state = 'paused';
    }
  },

  resume() {
    if (this.state === 'paused') {
      this.state = this.boss || (BR.BossManager && BR.BossManager.isActive()) ? 'boss' : 'playing';
      this.lastTime = performance.now();
    }
  },

  quit() {
    this.state = 'idle';
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    BR.RunManager.state = null;
    BR.Particles.clear();
    BR.Effects.clear();
    BR.Powerups.clear();
    BR.EventQueue.clear();
    BR.Combo.init();
    BR.Input.reset();
    if (BR.BossManager) BR.BossManager.clear();
    if (BR.BossAttack) BR.BossAttack.clear();
    if (BR.EliteManager) BR.EliteManager.clear();
    if (BR.RageEvents) BR.RageEvents.stop();
    if (BR.EnduranceManager && BR.EnduranceManager.active) BR.EnduranceManager.stop();
  },

  _loop() {
    var now = performance.now();
    var dt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    if (dt > 0.05) dt = 0.05;

    BR.Debug.tick(dt);

    var timeScale = BR.Juice.getTimeScale();
    var scaledDt = dt * timeScale;

    if (this.state === 'playing' || this.state === 'boss' || this.state === 'boss_intro' || this.state === 'boss_result') {
      this._update(scaledDt);
      BR.EventQueue.updateDelayQueue(dt);
    }

    if (this.state !== 'idle' && this.state !== 'gameover' && this.state !== 'run_summary') {
      this._draw();
    }

    if (this.state !== 'idle' && this.state !== 'gameover' && this.state !== 'run_summary') {
      this.animFrameId = requestAnimationFrame(() => this._loop());
    } else {
      this.animFrameId = null;
    }
  },

  _update(dt) {
    var targetPx = BR.Input.targetX * this.width;
    if (BR.RageEvents && BR.RageEvents.isInverted()) {
      targetPx = this.width - targetPx;
    }
    this.paddle.update(dt, targetPx, this.width);

    var kSpeed = 6 * dt * 60 * (this.modifiers.paddleSpeed || 1);
    var kLeft = BR.Input.isKeyDown('ArrowLeft') || BR.Input.isKeyDown('KeyA');
    var kRight = BR.Input.isKeyDown('ArrowRight') || BR.Input.isKeyDown('KeyD');
    if (BR.RageEvents && BR.RageEvents.isInverted()) {
      var tmp = kLeft;
      kLeft = kRight;
      kRight = tmp;
    }
    if (kLeft) {
      this.paddle.x -= kSpeed;
    }
    if (kRight) {
      this.paddle.x += kSpeed;
    }
    if (this.paddle.x < 0) this.paddle.x = 0;
    if (this.paddle.x + this.paddle.width > this.width) {
      this.paddle.x = this.width - this.paddle.width;
    }

    if (BR.RageEvents) BR.RageEvents.update(dt);

    for (var i = this.balls.length - 1; i >= 0; i--) {
      var ball = this.balls[i];

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

      var wallResult = BR.Physics.checkWallCollision(ball, this.width, this.height);
      if (wallResult === 'wall') {
        BR.Audio?.ballBounce();
      } else if (wallResult === 'bottom') {
        if (this.paddle.shield && !this.paddle.shieldUsed) {
          this.paddle.shieldUsed = true;
          ball.reset(this.paddle);
          BR.Audio?.powerup();
          BR.Juice.shieldBreak();
          if (BR.Particles) BR.Particles.emitPaddleHit(ball.x, this.paddle.y);
        } else if (this.modifiers.autoShield && !this.paddle.shieldUsed) {
          this.paddle.shieldUsed = true;
          ball.reset(this.paddle);
          BR.Audio?.powerup();
          BR.Juice.shieldBreak();
          if (BR.Particles) BR.Particles.emitPaddleHit(ball.x, this.paddle.y);
        } else {
          ball.active = false;
          this.balls.splice(i, 1);
          if (this.balls.length === 0) {
            this.lives--;
            if (this.lives > 0) {
              var newBall = new BR.Ball(this.width / 2, this.paddle.y - 10);
              newBall.baseDamage = Math.ceil(this.modifiers.damageMultiplier);
              newBall.damage = newBall.calculateDamage();
              newBall.baseSpeed = 5 * this.modifiers.ballSpeed;
              newBall.speed = newBall.baseSpeed;
              if (this.modifiers.ballSizeMult !== 1) {
                newBall.radius = Math.floor(8 * this.modifiers.ballSizeMult);
              }
              var skin = BR.CollectionManager.getActiveBallSkin();
              newBall.color = skin.color;
              BR.Powerups.applyToNewBall(newBall, this);
              this.balls.push(newBall);
              if (this.paddle) {
                var pskin = BR.CollectionManager.getActivePaddleSkin();
                this.paddle.color = pskin.color;
              }
              BR.Input.launched = false;
              if (BR.Effects) {
                BR.Effects.addFloatingText(this.width / 2, this.height / 2, 'LIVES: ' + this.lives, '#ff3344', {
                  fontSize: 22, speed: 0.5, life: 1.5, drift: 0
                });
              }
              if (BR.RageEvents) BR.RageEvents.stop();
            } else {
              setTimeout(() => this._gameOver(), 300);
            }
          }
        }
        continue;
      }

      if (BR.Physics.checkPaddleCollision(ball, this.paddle)) {
        BR.Audio?.ballBounce();
        if (BR.Particles) BR.Particles.emitPaddleHit(ball.x, this.paddle.y);
        BR.Combo.reset();
        if (BR.HardcoreManager.active) {
          BR.HardcoreManager.addRandomAngleToBall(ball);
        }
      }

      this._explosionSet = new Set();
      var activeBricks = this.brickManager.getActiveBricks();
      for (var j = activeBricks.length - 1; j >= 0; j--) {
        var brick = activeBricks[j];
        if (BR.Physics.checkBrickCollision(ball, brick)) {
          BR.Debug.collisionCount++;
          this._hitBrick(brick, ball);
          if (!ball.modifiers.piercing) break;
        }
      }
      this._explosionSet = null;

      if (this.paddle.magnetActive || (this.modifiers && this.modifiers.magnetStrength > 0)) {
        var magnetStr = this.paddle.magnetActive ? 3 : (this.modifiers.magnetStrength || 0) * 2;
        var dx = (this.paddle.x + this.paddle.width / 2) - ball.x;
        var dy = this.paddle.y - ball.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0 && dist < 200) {
          ball.vx += (dx / dist) * magnetStr * dt * 60;
          ball.vy += (dy / dist) * magnetStr * 0.5 * dt * 60;
        }
      }

      var speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
      var minSpeed = ball.baseSpeed * 0.8;
      var maxSpeed = ball.baseSpeed * 2.5;
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
      for (var i = this.boss.miniBricks.length - 1; i >= 0; i--) {
        var mb = this.boss.miniBricks[i];
        if (!mb.alive) continue;
        for (var j = this.balls.length - 1; j >= 0; j--) {
          var ball = this.balls[j];
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

    if (BR.BossManager && BR.BossManager.isActive()) {
      BR.BossManager.update(dt, this.width, this.height, this.paddle, this.balls);
      if (BR.BossManager.state === 'intro') {
        this.state = 'boss_intro';
      } else if (BR.BossManager.state === 'active') {
        this.state = 'boss';
      }
    }

    if (this.paddle && this.paddle.invulnerable !== undefined && this.paddle.invulnerable > 0) {
      this.paddle.invulnerable -= dt;
    }

    this.brickManager.update(dt);

    var activeBricks = this.brickManager.getActiveBricks();
    for (var bi = 0; bi < activeBricks.length; bi++) {
      var brick = activeBricks[bi];
      if (brick.turretProjectile && brick.turretProjectile.active) {
        var tp = brick.turretProjectile;
        if (this.paddle && tp.y >= this.paddle.y && tp.y <= this.paddle.y + this.paddle.height &&
            tp.x >= this.paddle.x && tp.x <= this.paddle.x + this.paddle.width) {
          tp.active = false;
          brick.turretProjectile = null;
          if (BR.Particles) BR.Particles.emitPaddleHit(tp.x, this.paddle.y);
          if (BR.Effects) BR.Effects.addFloatingText(tp.x, tp.y - 10, 'HIT!', '#ff6600', { fontSize: 12, speed: 1, life: 0.6 });
        }
      }
    }

    BR.Powerups.update(dt, this.width, this.height, this.paddle, this);
    BR.Combo.update(dt);
    BR.Juice.update(dt);
    BR.EventQueue.process(this);

    var run = BR.RunManager.getState();
    this.displayScore += ((run.score || 0) - this.displayScore) * 0.15;
    this.displayCoins += ((run.coins || 0) - this.displayCoins) * 0.15;
    if (Math.abs(this.displayScore - (run.score || 0)) < 1) this.displayScore = run.score || 0;
    if (Math.abs(this.displayCoins - (run.coins || 0)) < 1) this.displayCoins = run.coins || 0;

    BR.Particles.update(dt);
    BR.Effects.update(dt);

    BR.UI.updateHUD(
      Math.floor(this.displayScore),
      Math.floor(this.displayCoins),
      run.level,
      run.wave,
      BR.Combo.count,
      BR.Combo.getTimerRatio()
    );

    if (BR.BossManager && BR.BossManager.currentBoss && BR.BossManager.currentBoss.alive) {
      var b = BR.BossManager.currentBoss;
      BR.UI.updateBossBar(b.name, b.hp, b.maxHp);
      var phaseEl = document.getElementById('bossPhase');
      if (phaseEl) phaseEl.textContent = b.getCurrentPhase().name;
    } else if (this.boss && this.boss.alive) {
      BR.UI.updateBossBar(this.boss.name, this.boss.hp, this.boss.maxHp);
    }

    if (this._waveCompletePending) {
      this._waveCompletePending = false;
      this._handleWaveComplete(this._pendingWaveType);
    }
  },

  _hitBrick(brick, ball) {
    var damage = ball.damage;
    var isCrit = false;

    var critChance = this.modifiers ? this.modifiers.criticalChance : 0.05;
    isCrit = Math.random() < critChance;
    if (isCrit) {
      damage = Math.floor(damage * (this.modifiers ? this.modifiers.criticalDamage : 3));
    }

    var destroyed = brick.hit(damage);

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
      BR.RunManager.updateBestCombo(BR.Combo.count);
      var milestone = BR.Combo._getMilestone(BR.Combo.count);
      if (milestone) {
        BR.Juice.comboMilestone(BR.Combo.count);
        BR.Audio?.megaCombo();
        if (BR.Particles) BR.Particles.emitMegaCombo(brick.x + brick.width / 2, brick.y + brick.height / 2, BR.Combo.count);
        if (BR.Effects) {
          BR.Effects.addFloatingText(this.width / 2, 80, milestone + ' COMBO x' + BR.Combo.count, '#ff00aa', {
            fontSize: 22, speed: 1, life: 1.5, drift: 0
          });
        }
        if (BR.Events) BR.Events.emit('comboMilestone', { combo: BR.Combo.count, name: milestone });
      } else if (BR.Combo.count >= 5) {
        if (BR.Particles) BR.Particles.emitCombo(brick.x + brick.width / 2, brick.y + brick.height / 2, BR.Combo.count);
        BR.Audio?.combo(BR.Combo.count);
      }

      var scoreGain = BR.RunManager.addScore(brick.scoreValue);
      var coinGain = BR.RunManager.addCoins(brick.coinValue);
      BR.RunManager.trackBrickDestroyed();

      if (BR.Effects) {
        BR.Effects.addFloatingText(brick.x + brick.width / 2, brick.y, '+' + scoreGain, '#ffffff', { fontSize: 13, speed: 1.8, life: 0.8 });
        if (coinGain > 0) {
          BR.Effects.addFloatingText(brick.x + brick.width / 2, brick.y - 15, '+' + coinGain + ' C', '#ffcc00', { fontSize: 11, speed: 1.2, life: 0.6 });
        }
      }
      if (coinGain > 0 && BR.Juice) BR.Juice.coinCollect();
      if (coinGain > 0 && BR.Audio) BR.Audio.coin();

      var powerupChanceBonus = this.modifiers ? this.modifiers.powerUpChance : 0;
      BR.Powerups.trySpawn(
        brick.x + brick.width / 2,
        brick.y + brick.height / 2,
        powerupChanceBonus
      );

      if (BR.Events) {
        BR.Events.emit('brickDestroyed', { brick: brick, ball: ball });
        BR.EventQueue.enqueue('brickDestroyed', { brick: brick, ball: ball });
      }

      var save = BR.Storage.load();
      BR.Storage._data.totalBricksDestroyed = (save.totalBricksDestroyed || 0) + 1;
      if (BR.Storage._data.totalBricksDestroyed === 1) {
        this._unlockAchievement('first_break');
      }

      if (BR.MissionManager) BR.MissionManager.handleEvent('brickDestroyed', { amount: 1 });
      if (isCrit && BR.MissionManager) BR.MissionManager.handleEvent('criticalHit', { amount: 1 });
      if (isCrit) {
        var stats = BR.Storage._data.statistics || {};
        stats.totalCriticalHits = (stats.totalCriticalHits || 0) + 1;
        BR.Storage._data.statistics = stats;
      }
      if (BR.MissionManager && BR.Combo.count > 0) {
        BR.MissionManager.handleEvent('comboReached', { combo: BR.Combo.count });
      }

      if (BR.MetaProgression) {
        var brickXP = isCrit ? BR.MetaProgression.XP_VALUES.criticalHit : BR.MetaProgression.XP_VALUES.brick;
        BR.MetaProgression.addXP(brickXP);
      }

      this._checkWaveComplete();
    }

    if (!ball.modifiers.piercing) {
      ball.hitFlash = 0.1;
    }
  },

  _checkWaveComplete() {
    if (this.state === 'boss' || this.state === 'boss_intro' || this.state === 'boss_result') return;
    if (this.brickManager.destructibleCount > 0) return;

    BR.Audio?.levelComplete();
    var waveType = BR.RunManager.nextWave();
    this._waveCompletePending = true;
    this._pendingWaveType = waveType;
  },

  _handleWaveComplete(waveType) {
    var run = BR.RunManager.getState();
    BR.Level.level = run.level;
    BR.Level.wave = run.wave;

    if (waveType === 'level_complete') {
      if (BR.MissionManager) BR.MissionManager.handleEvent('levelCompleted', {});
      var xpResult = BR.MetaProgression ? BR.MetaProgression.addXP(BR.MetaProgression.XP_VALUES.levelComplete) : null;

      var choices = BR.UpgradeManager.getChoices(3);
      if (choices.length > 0) {
        this._pendingUpgradeChoices = choices;
        this.state = 'upgrading';
        BR.UI.showUpgradeSelection(choices);
        return;
      }
      BR.Level.level = run.level;
      BR.Level.wave = run.wave;
      this._loadWave();
    } else if (waveType === 'elite') {
      if (BR.MissionManager) BR.MissionManager.handleEvent('eliteDefeated', {});
      var xpResult2 = BR.MetaProgression ? BR.MetaProgression.addXP(BR.MetaProgression.XP_VALUES.elite) : null;

      var choices2 = BR.UpgradeManager.getChoices(3);
      if (choices2.length > 0) {
        this._pendingUpgradeChoices = choices2;
        this.state = 'upgrading';
        BR.UI.showUpgradeSelection(choices2);
      } else {
        this._loadWave();
      }
    }
  },

  onUpgradeChosen() {
    this.modifiers = BR.BuildManager.getStats();

    for (var i = 0; i < this.balls.length; i++) {
      var ball = this.balls[i];
      ball.baseDamage = Math.ceil(this.modifiers.damageMultiplier);
      ball.damage = ball.calculateDamage();
      ball.baseSpeed = 5 * this.modifiers.ballSpeed;
      ball.speed = ball.baseSpeed;
      if (this.modifiers.ballSizeMult !== 1) {
        ball.radius = Math.floor(8 * this.modifiers.ballSizeMult);
      }
    }

    this.paddle.applyWidthMultiplier(this.modifiers.paddleWidth);
    BR.Powerups.applyToActiveEffects(this);

    var run = BR.RunManager.getState();
    BR.Level.level = run.level;
    BR.Level.wave = run.wave;
    this._loadWave();
    if (BR.BossManager && BR.BossManager.isActive()) {
      this.state = 'boss_intro';
    } else if (this.boss) {
      this.state = 'boss';
    } else {
      this.state = 'playing';
    }
    BR.UI.showScreen('game');
    BR.Input.launched = false;

    this._unlockAchievement('first_upgrade');
  },

  _checkBallBossCollision(ball) {
    if (BR.BossManager && BR.BossManager.isActive()) return;
    if (!this.boss || !this.boss.alive) return;
    var bossRect = this.boss.getBounds();
    var ballRect = { x: ball.x - ball.radius, y: ball.y - ball.radius, width: ball.radius * 2, height: ball.radius * 2 };

    if (BR.Physics.rectsOverlap(ballRect, bossRect)) {
      var destroyed = this.boss.hit(ball.damage);
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
    var run = BR.RunManager.getState();
    var scoreGain = BR.RunManager.addScore(500);
    var coinReward = 100 + run.level * 50;
    var coinGain = BR.RunManager.addCoins(coinReward);
    var bossId = this.boss ? this.boss.id : 'unknown';
    this.boss = null;
    BR.RunManager.state.bossesDefeated++;
    if (!BR.RunManager.state.bossesDefeatedList) BR.RunManager.state.bossesDefeatedList = [];
    BR.RunManager.state.bossesDefeatedList.push(bossId);
    this._unlockAchievement('boss_slayer');
    BR.UI.hideBossBar();
    setTimeout(function() {
      BR.Game.state = 'idle';
      BR.UI.showVictory(coinGain);
    }, 800);
  },

  continueAfterBoss() {
    var run = BR.RunManager.getState();
    var result = BR.Level.completeLevel();
    run.level = BR.Level.level;
    run.wave = BR.Level.wave;
    run.currentArea = BR.Level.currentArea;
    this._bossEncounterArea = BR.Level.currentArea;
    BR.Storage.set('currentArea', BR.Level.currentArea);

    if (BR.MissionManager) BR.MissionManager.handleEvent('bossDefeated', {});
    if (BR.MissionManager) BR.MissionManager.handleEvent('levelCompleted', {});
    if (BR.MetaProgression) {
      var levelUp = BR.MetaProgression.addXP(BR.MetaProgression.XP_VALUES.boss);
      if (levelUp) BR.MetaProgression.grantLevelUpRewards(levelUp.newLevel);
    }

    if (result === 'area_unlock') {
      var areas = BR.Storage.get('unlockedAreas') || [0];
      if (areas.indexOf(BR.Level.currentArea) === -1) {
        areas.push(BR.Level.currentArea);
        BR.Storage.set('unlockedAreas', areas);
      }
    }

    if (BR.BossManager) BR.BossManager.clear();
    if (BR.BossAttack) BR.BossAttack.clear();
    if (BR.EliteManager) BR.EliteManager.clear();

    this._loadWave();
    this.state = 'playing';
    BR.Input.launched = false;
    BR.UI.showScreen('game');

    for (var i = 0; i < this.balls.length; i++) {
      this.balls[i].reset(this.paddle);
      BR.Powerups.applyToNewBall(this.balls[i], this);
    }

    if (this.balls.length === 0) {
      var ball = new BR.Ball(this.width / 2, this.paddle.y - 10);
      ball.baseDamage = Math.ceil(this.modifiers.damageMultiplier);
      ball.damage = ball.calculateDamage();
      ball.baseSpeed = 5 * this.modifiers.ballSpeed;
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
    var existing = this.balls.filter(function(b) { return !b.attached && b.active; });
    if (existing.length === 0) return;
    if (this.balls.length >= BR.Powerups.maxBalls) return;

    var src = existing[0];
    var extraCount = BR.BuildManager.getStat('multiball_bonus') > 0 ? 3 : 2;
    var toSpawn = Math.min(extraCount, BR.Powerups.maxBalls - this.balls.length);

    for (var i = 0; i < toSpawn; i++) {
      var newBall = new BR.Ball(src.x, src.y);
      newBall.attached = false;
      newBall.active = true;
      newBall.baseDamage = src.baseDamage;
      newBall.damage = src.damage;
      newBall.baseSpeed = src.baseSpeed;
      newBall.speed = src.speed;
      newBall.radius = src.radius;
      newBall.color = src.color;
      var angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.8;
      newBall.vx = Math.cos(angle) * newBall.speed;
      newBall.vy = Math.sin(angle) * newBall.speed;
      BR.Powerups.applyToNewBall(newBall, this);
      this.balls.push(newBall);
    }
  },

  onPowerupBomb() {
    var closest = null;
    var closestDist = Infinity;
    var bricks = this.brickManager.bricks;
    for (var i = 0; i < bricks.length; i++) {
      var brick = bricks[i];
      if (!brick.alive) continue;
      var bx = brick.x + brick.width / 2;
      var by = brick.y + brick.height / 2;
      var dist = Math.sqrt(Math.pow(bx - this.width / 2, 2) + Math.pow(by - this.height / 2, 2));
      if (dist < closestDist) { closestDist = dist; closest = brick; }
    }

    if (closest) {
      this._explosionSet = new Set();
      var cx = closest.x + closest.width / 2;
      var cy = closest.y + closest.height / 2;
      var radius = 150 * (1 + (this.modifiers.explosionRadius || 0));
      var hit = this.brickManager.damageArea(cx, cy, radius, 2, closest);
      for (var i = 0; i < hit.length; i++) {
        if (hit[i].pendingDestroy && hit[i].alive) {
          hit[i].destroy();
          BR.RunManager.addScore(hit[i].scoreValue);
          BR.RunManager.addCoins(hit[i].coinValue);
          BR.RunManager.trackBrickDestroyed();
        }
      }
      this._explosionSet = null;

      if (BR.Particles) BR.Particles.emitExplosion(cx, cy, 20);
      if (BR.Effects) BR.Effects.addShockwave(cx, cy, 10, radius, '#ff0044', 0.5);
    }

    BR.Audio?.explosion();
    BR.Juice.explosion(this.width / 2, this.height / 2);
  },

  onPowerupLightning() {
    var chain = 5;
    var alive = this.brickManager.getActiveBricks();
    alive.sort(function() { return Math.random() - 0.5; });
    var hit = alive.slice(0, Math.min(chain, alive.length));

    BR.EventQueue.enqueue('lightningStrike', { bricks: hit, damage: 3 });
    BR.Audio?.chainReaction(0);
  },

  _gameOver() {
    if (this.state === 'gameover' || this.state === 'run_summary') return;
    this.state = 'gameover';
    BR.Audio?.gameOver();
    BR.Input.reset();

    if (BR.BossManager) BR.BossManager.clear();
    if (BR.BossAttack) BR.BossAttack.clear();
    if (BR.EliteManager) BR.EliteManager.clear();
    if (BR.RageEvents) BR.RageEvents.stop();
    if (BR.EnduranceManager && BR.EnduranceManager.active) BR.EnduranceManager.stop();

    if (BR.MissionManager) BR.MissionManager.handleEvent('playTime', { seconds: Math.floor((performance.now() - (BR.RunManager.getState().startTime || performance.now())) / 1000) });

    var run = BR.RunManager.getState();
    if (BR.HardcoreManager.active && run) {
      var coinPenalty = BR.HardcoreManager.getCoinPenalty(run.coins);
      var scorePenalty = BR.HardcoreManager.getScorePenalty(run.score);
      run.coins = Math.max(0, run.coins - coinPenalty);
      run.score = Math.max(0, run.score - scorePenalty);
    }

    var endResult = BR.RunManager.endRun();
    if (!endResult) return;

    if (BR.AchievementManager) BR.AchievementManager.checkAll();

    this.state = 'run_summary';
    BR.UI.showRunSummary(endResult);
  },

  _unlockAchievement(id) {
    var achs = BR.Storage.get('achievements') || {};
    if (!achs[id]) {
      achs[id] = true;
      BR.Storage.set('achievements', achs);
    }
  },

  _draw() {
    if (!this.ctx) return;
    var ctx = this.ctx;

    var area = BR.Level.getCurrentArea();
    ctx.fillStyle = area ? area.bgColor : '#0a0a1a';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.save();

    this.brickManager.draw(ctx);

    for (var i = 0; i < this.balls.length; i++) {
      var ball = this.balls[i];
      if (BR.RageEvents && BR.RageEvents.isBallInvisible()) {
        if (ball.trail && ball.trail.length > 0) {
          ctx.save();
          for (var t = 0; t < ball.trail.length; t++) {
            var tr = ball.trail[t];
            var alpha = (t / ball.trail.length) * 0.3;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = ball.color;
            ctx.beginPath();
            ctx.arc(tr.x, tr.y, (t / ball.trail.length) * ball.radius * 0.6, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      } else {
        ball.draw(ctx);
      }
    }

    if (this.paddle) {
      var pAlpha = (this.paddle.invulnerable && this.paddle.invulnerable > 0) ? (Math.sin(performance.now() / 50) > 0 ? 0.4 : 1) : 1;
      ctx.save();
      ctx.globalAlpha = pAlpha;
      this.paddle.draw(ctx);
      if (this.paddle.invulnerable && this.paddle.invulnerable > 0) {
        ctx.strokeStyle = 'rgba(255, 0, 68, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(this.paddle.x - 3, this.paddle.y - 3, this.paddle.width + 6, this.paddle.height + 6, 9);
        ctx.stroke();
      }
      ctx.restore();
    }

    if (BR.BossManager && BR.BossManager.isActive()) {
      BR.BossManager.draw(ctx);
    } else if (this.boss && this.boss.alive) {
      this.boss.draw(ctx);
    }

    BR.Powerups.draw(ctx);
    BR.Particles.draw(ctx);
    BR.Effects.draw(ctx);
    BR.Juice.drawFlash(ctx, this.width, this.height);

    if (BR.RageEvents) BR.RageEvents.drawBlindSpots(ctx);

    BR.Powerups.drawActiveEffects(ctx, 10, this.height - 30);

    ctx.restore();

    if (this.state === 'playing' || this.state === 'boss') {
      var hasAttached = this.balls.some(function(b) { return b.attached; });
      if (hasAttached) {
        ctx.save();
        ctx.globalAlpha = 0.5 + Math.sin(performance.now() / 300) * 0.3;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        var tapText = BR.Input.isTouchDevice ? 'TAP TO LAUNCH' : 'CLICK / SPACE TO LAUNCH';
        ctx.fillText(tapText, this.width / 2, this.height - 80);
        ctx.restore();
      }
    }

    if (BR.HardcoreManager.active) {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 51, 68, 0.15)';
      ctx.fillRect(0, 0, this.width, 3);
      ctx.fillRect(0, this.height - 3, this.width, 3);
      ctx.fillRect(0, 0, 3, this.height);
      ctx.fillRect(this.width - 3, 0, 3, this.height);
      ctx.restore();
    }

    BR.Debug.draw(ctx, this);
  }
};
