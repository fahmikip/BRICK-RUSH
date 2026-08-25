window.BR = window.BR || {};

BR.Paddle = class Paddle {
  constructor(canvasWidth, canvasHeight) {
    this.width = 100;
    this.baseWidth = 100;
    this.height = 14;
    this.x = (canvasWidth - this.width) / 2;
    this.y = canvasHeight - 40;
    this.color = '#00f0ff';
    this.speed = 8;
    this.magnetActive = false;
    this.shield = false;
    this.shieldUsed = false;
    this.glowIntensity = 0;
    this.hitAnimation = 0;
    this.cornerRadius = 7;
  }

  update(dt, targetX, canvasWidth) {
    const centerX = this.x + this.width / 2;
    const diff = targetX - centerX;

    this.x += diff * 0.15 * dt * 60;

    if (this.x < 0) this.x = 0;
    if (this.x + this.width > canvasWidth) this.x = canvasWidth - this.width;

    if (this.hitAnimation > 0) this.hitAnimation -= dt;

    if (this.shield && !this.shieldUsed) {
      this.glowIntensity = Math.min(this.glowIntensity + dt * 3, 1);
    } else {
      this.glowIntensity = Math.max(this.glowIntensity - dt * 3, 0);
    }
  }

  draw(ctx) {
    ctx.save();

    const squashY = this.hitAnimation > 0 ? 0.7 : 1;
    const squashX = this.hitAnimation > 0 ? 1.1 : 1;

    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.scale(squashX, squashY);
    ctx.translate(-(this.x + this.width / 2), -(this.y + this.height / 2));

    if (this.glowIntensity > 0) {
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 15 * this.glowIntensity;
    }

    const grad = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
    grad.addColorStop(0, '#00d4ff');
    grad.addColorStop(0.5, this.color);
    grad.addColorStop(1, '#0088aa');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.width, this.height, this.cornerRadius);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.roundRect(this.x + 2, this.y + 1, this.width - 4, this.height / 3, 4);
    ctx.fill();

    if (this.shield && !this.shieldUsed) {
      ctx.strokeStyle = `rgba(0, 255, 136, ${0.5 + this.glowIntensity * 0.5})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(this.x - 3, this.y - 3, this.width + 6, this.height + 6, this.cornerRadius + 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  hit() {
    this.hitAnimation = 0.15;
  }

  applyWidthMultiplier(mult) {
    this.width = Math.min(this.baseWidth * mult, 250);
  }

  reset(canvasWidth, canvasHeight) {
    this.x = (canvasWidth - this.width) / 2;
    this.y = canvasHeight - 40;
    this.shieldUsed = false;
  }
};
