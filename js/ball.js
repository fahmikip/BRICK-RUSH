window.BR = window.BR || {};

BR.Ball = class Ball {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 8;
    this.vx = 0;
    this.vy = 0;
    this.speed = 5;
    this.baseSpeed = 5;
    this.damage = 1;
    this.baseDamage = 1;
    this.color = '#00f0ff';
    this.trail = [];
    this.trailLength = 8;
    this.active = true;
    this.piercing = false;
    this.piercingTimer = 0;
    this.attached = true;
    this.glowSize = 4;
    this.hitFlash = 0;
  }

  update(dt, paddle) {
    if (this.attached) {
      this.x = paddle.x + paddle.width / 2;
      this.y = paddle.y - this.radius - 2;
      return;
    }

    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > this.trailLength) this.trail.shift();

    this.x += this.vx * dt * 60;
    this.y += this.vy * dt * 60;

    if (this.hitFlash > 0) this.hitFlash -= dt;
    if (this.piercingTimer > 0) {
      this.piercingTimer -= dt;
      if (this.piercingTimer <= 0) this.piercing = false;
    }

    if (!this.attached && BR.Particles) {
      BR.Particles.emitBallTrail(this.x, this.y, this.color);
    }
  }

  launch() {
    if (!this.attached) return;
    this.attached = false;
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI / 3;
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
  }

  draw(ctx) {
    for (let i = 0; i < this.trail.length; i++) {
      const t = this.trail[i];
      const alpha = (i / this.trail.length) * 0.5;
      const size = (i / this.trail.length) * this.radius;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(t.x, t.y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.shadowColor = this.color;
    ctx.shadowBlur = this.glowSize + (this.hitFlash > 0 ? 10 : 0);

    ctx.fillStyle = this.hitFlash > 0 ? '#ffffff' : this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.arc(this.x - 2, this.y - 2, this.radius * 0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
  }

  reset(paddle) {
    this.attached = true;
    this.active = true;
    this.x = paddle.x + paddle.width / 2;
    this.y = paddle.y - this.radius - 2;
    this.vx = 0;
    this.vy = 0;
    this.trail = [];
    this.piercing = false;
  }

  applySpeedMultiplier(mult) {
    const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (currentSpeed > 0) {
      const ratio = this.speed * mult / currentSpeed;
      this.vx *= ratio;
      this.vy *= ratio;
    }
    this.speed = this.baseSpeed * mult;
  }
};
