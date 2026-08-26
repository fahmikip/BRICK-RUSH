window.BR = window.BR || {};

BR.Juice = {
  slowMotionActive: false,
  slowMotionTimer: 0,
  slowMotionSpeed: 1,
  screenFlash: 0,
  screenFlashColor: '#ffffff',

  init() {
    this.slowMotionActive = false;
    this.slowMotionTimer = 0;
    this.slowMotionSpeed = 1;
    this.screenFlash = 0;
  },

  update(dt) {
    if (this.slowMotionActive) {
      this.slowMotionTimer -= dt;
      if (this.slowMotionTimer <= 0) {
        this.slowMotionActive = false;
        this.slowMotionSpeed = 1;
      }
    }
    if (this.screenFlash > 0) {
      this.screenFlash -= dt;
    }
  },

  getTimeScale() {
    return this.slowMotionActive ? this.slowMotionSpeed : 1;
  },

  shake(intensity, duration) {
    if (BR.Storage?.get('settings')?.reduceMotion) return;
    if (BR.UI) BR.UI.shake(intensity, duration);
  },

  flash(color, duration) {
    this.screenFlash = duration || 0.1;
    this.screenFlashColor = color || '#ffffff';
  },

  slowMotion(speed, duration) {
    this.slowMotionActive = true;
    this.slowMotionSpeed = speed || 0.7;
    this.slowMotionTimer = duration || 0.15;
  },

  vibrate(pattern) {
    if (BR.Storage?.get('settings')?.reduceMotion) return;
    if (!navigator.vibrate) return;
    navigator.vibrate(pattern);
  },

  criticalHit(x, y) {
    this.shake(8, 0.15);
    this.slowMotion(0.7, 0.15);
    this.flash('#FFD700', 0.08);
    this.vibrate(30);
  },

  explosion(x, y) {
    this.shake(12, 0.3);
    this.slowMotion(0.6, 0.2);
    this.flash('#ff3344', 0.1);
    this.vibrate([50, 30, 50]);
  },

  comboMilestone(combo) {
    const tier = BR.Combo.getTier();
    if (tier >= 3) {
      this.shake(10, 0.25);
      this.slowMotion(0.5, 0.3);
      this.flash('#ff00aa', 0.12);
      this.vibrate([30, 20, 30, 20, 30]);
    } else if (tier >= 2) {
      this.shake(6, 0.2);
      this.slowMotion(0.7, 0.15);
      this.flash('#ffcc00', 0.08);
      this.vibrate(40);
    } else if (tier >= 1) {
      this.shake(4, 0.15);
      this.vibrate(20);
    }
  },

  powerUpPickup(type) {
    this.flash(type.color || '#ffffff', 0.06);
    this.vibrate(25);
  },

  brickHit(x, y) {
    this.vibrate(10);
  },

  coinCollect() {
    this.vibrate(8);
  },

  shieldBreak() {
    this.shake(6, 0.2);
    this.flash('#00ff88', 0.1);
    this.vibrate(30);
  },

  drawFlash(ctx, width, height) {
    if (this.screenFlash <= 0) return;
    const alpha = Math.min(0.3, this.screenFlash * 3);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.screenFlashColor;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  },

  bossHit(x, y) {
    this.shake(6, 0.15);
    this.flash('#ffffff', 0.06);
    this.vibrate(15);
  },

  weakPoint(x, y) {
    this.shake(10, 0.2);
    this.slowMotion(0.6, 0.2);
    this.flash('#ff0044', 0.1);
    this.vibrate(30);
  },

  phaseTransition(x, y) {
    this.shake(12, 0.3);
    this.slowMotion(0.5, 0.4);
    this.flash('#ffaa00', 0.15);
    this.vibrate([30, 20, 30, 20, 30]);
  },

  bossDefeat() {
    this.shake(20, 0.6);
    this.slowMotion(0.3, 1);
    this.flash('#ffffff', 0.3);
    this.vibrate([100, 50, 100, 50, 100]);
  },

  bossWarning() {
    this.shake(3, 0.5);
    this.flash('#ff0044', 0.08);
    this.vibrate([50, 30, 50, 30, 50]);
  },

  levelUp() {
    this.shake(10, 0.4);
    this.flash('#ffcc00', 0.2);
    this.slowMotion(0.5, 0.3);
    this.vibrate([50, 30, 50, 30, 100]);
  },

  missionComplete() {
    this.shake(6, 0.2);
    this.flash('#00ff88', 0.15);
    this.vibrate([30, 20, 30]);
  },

  achievementPopup() {
    this.shake(8, 0.3);
    this.flash('#ffcc00', 0.1);
    this.vibrate([40, 20, 40]);
  }
};
