window.BR = window.BR || {};

BR.Particles = {
  pool: [],
  active: [],
  maxParticles: 500,

  init() {
    this.pool = [];
    this.active = [];
    for (let i = 0; i < 200; i++) {
      this.pool.push(this._create());
    }
  },

  _create() {
    return {
      x: 0, y: 0,
      vx: 0, vy: 0,
      life: 0, maxLife: 1,
      size: 2, color: '#ffffff',
      alpha: 1, decay: 1,
      gravity: 0,
      type: 'circle',
      text: '',
      rotation: 0,
      rotSpeed: 0,
      shrink: true
    };
  },

  _get() {
    if (this.pool.length > 0) {
      return this.pool.pop();
    }
    if (this.active.length < this.maxParticles) {
      return this._create();
    }
    return null;
  },

  _release(p) {
    if (this.pool.length < this.maxParticles) {
      this.pool.push(p);
    }
  },

  update(dt) {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const p = this.active[i];

      p.life -= dt;
      if (p.life <= 0) {
        this.active.splice(i, 1);
        this._release(p);
        continue;
      }

      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      const lifeRatio = p.life / p.maxLife;
      p.alpha = lifeRatio * p.decay;

      if (p.shrink && p.type !== 'text') {
        p.size *= (1 - dt * 2);
      }

      p.rotation += p.rotSpeed * dt;
    }
  },

  draw(ctx) {
    for (let i = 0; i < this.active.length; i++) {
      const p = this.active[i];

      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));

      if (p.type === 'text') {
        ctx.font = `bold ${Math.round(p.size)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = p.color;
        ctx.fillText(p.text, p.x, p.y);
      } else if (p.type === 'circle') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, p.size), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      } else if (p.type === 'square') {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size, -p.size, p.size * 2, p.size * 2);
      } else if (p.type === 'star') {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        this._drawStar(ctx, 0, 0, 5, p.size, p.size * 0.4);
        ctx.fillStyle = p.color;
        ctx.fill();
      }

      ctx.restore();
    }
  },

  _drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);

    for (let i = 0; i < spikes; i++) {
      const xOuter = cx + Math.cos(rot) * outerRadius;
      const yOuter = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(xOuter, yOuter);
      rot += step;

      const xInner = cx + Math.cos(rot) * innerRadius;
      const yInner = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(xInner, yInner);
      rot += step;
    }

    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  },

  _spawn(count, opts) {
    for (let i = 0; i < count; i++) {
      const p = this._get();
      if (!p) break;

      p.x = opts.x + (Math.random() - 0.5) * (opts.spread || 0);
      p.y = opts.y + (Math.random() - 0.5) * (opts.spread || 0);

      const angle = opts.angle !== undefined
        ? opts.angle + (Math.random() - 0.5) * (opts.angleSpread || Math.PI * 2)
        : Math.random() * Math.PI * 2;
      const speed = (opts.speed || 100) + (Math.random() - 0.5) * (opts.speedVariance || 50);

      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;

      p.life = (opts.life || 0.5) + Math.random() * (opts.lifeVariance || 0.3);
      p.maxLife = p.life;

      p.size = (opts.size || 3) + Math.random() * (opts.sizeVariance || 2);
      p.color = Array.isArray(opts.color)
        ? opts.color[Math.floor(Math.random() * opts.color.length)]
        : opts.color || '#ffffff';
      p.alpha = 1;
      p.decay = opts.decay || 1;
      p.gravity = opts.gravity || 0;
      p.type = opts.type || 'circle';
      p.text = opts.text || '';
      p.rotation = Math.random() * Math.PI * 2;
      p.rotSpeed = (Math.random() - 0.5) * 6;
      p.shrink = opts.shrink !== undefined ? opts.shrink : true;

      this.active.push(p);
    }
  },

  emitBrickBreak(x, y, color, count) {
    count = count || 12;

    this._spawn(Math.floor(count * 0.6), {
      x, y,
      speed: 180,
      speedVariance: 120,
      life: 0.6,
      lifeVariance: 0.3,
      size: 2,
      sizeVariance: 3,
      color: color,
      type: 'square',
      gravity: 200,
      shrink: true
    });

    this._spawn(Math.floor(count * 0.4), {
      x, y,
      speed: 80,
      speedVariance: 60,
      life: 0.4,
      lifeVariance: 0.2,
      size: 1.5,
      sizeVariance: 1,
      color: color,
      type: 'circle',
      gravity: 100,
      shrink: true
    });
  },

  emitBrickHit(x, y, color, count) {
    count = count || 5;

    this._spawn(count, {
      x, y,
      speed: 80,
      speedVariance: 40,
      life: 0.25,
      lifeVariance: 0.1,
      size: 1.5,
      sizeVariance: 1,
      color: color || '#ffffff',
      type: 'circle',
      shrink: true
    });
  },

  emitCritical(x, y, count) {
    count = count || 20;

    this._spawn(Math.floor(count * 0.5), {
      x, y,
      speed: 250,
      speedVariance: 150,
      life: 0.8,
      lifeVariance: 0.3,
      size: 3,
      sizeVariance: 4,
      color: ['#FFD700', '#FFA500', '#FFEC8B', '#FF6347'],
      type: 'star',
      gravity: 50,
      shrink: false
    });

    this._spawn(Math.floor(count * 0.5), {
      x, y,
      speed: 150,
      speedVariance: 100,
      life: 0.6,
      lifeVariance: 0.2,
      size: 2,
      sizeVariance: 2,
      color: ['#FFD700', '#FFA500', '#FFFFFF'],
      type: 'circle',
      gravity: 80,
      shrink: true
    });
  },

  emitCombo(x, y, combo) {
    const count = Math.min(5 + combo * 2, 30);
    let colors;

    if (combo < 5) {
      colors = ['#FFFFFF', '#CCCCCC'];
    } else if (combo < 10) {
      colors = ['#FFD700', '#FFA500'];
    } else if (combo < 20) {
      colors = ['#FF6347', '#FF4500', '#FF0000'];
    } else {
      colors = ['#FF00FF', '#FF00AA', '#FF00FF', '#FFFF00'];
    }

    this._spawn(count, {
      x, y,
      speed: 100 + combo * 10,
      speedVariance: 80,
      life: 0.4 + combo * 0.02,
      lifeVariance: 0.2,
      size: 2 + combo * 0.2,
      sizeVariance: 2,
      color: colors,
      type: 'circle',
      gravity: -30,
      shrink: true
    });
  },

  emitCoin(x, y) {
    this._spawn(8, {
      x, y,
      angle: -Math.PI / 2,
      angleSpread: Math.PI * 0.8,
      speed: 60,
      speedVariance: 40,
      life: 0.6,
      lifeVariance: 0.3,
      size: 2,
      sizeVariance: 1.5,
      color: ['#FFD700', '#FFC107', '#FFEB3B', '#FFFFFF'],
      type: 'star',
      gravity: -80,
      shrink: true
    });
  },

  emitExplosion(x, y, count) {
    count = count || 30;

    this._spawn(Math.floor(count * 0.5), {
      x, y,
      speed: 200,
      speedVariance: 150,
      life: 0.7,
      lifeVariance: 0.3,
      size: 3,
      sizeVariance: 4,
      color: ['#FF4500', '#FF6347', '#FF0000', '#FFA500'],
      type: 'circle',
      gravity: 100,
      shrink: true
    });

    this._spawn(Math.floor(count * 0.3), {
      x, y,
      speed: 120,
      speedVariance: 80,
      life: 0.9,
      lifeVariance: 0.3,
      size: 4,
      sizeVariance: 5,
      color: ['#FFD700', '#FFA500', '#FFFFFF'],
      type: 'star',
      gravity: 50,
      shrink: false
    });

    this._spawn(Math.floor(count * 0.2), {
      x, y,
      speed: 60,
      speedVariance: 40,
      life: 0.5,
      lifeVariance: 0.2,
      size: 2,
      sizeVariance: 2,
      color: '#333333',
      type: 'circle',
      gravity: -40,
      shrink: true
    });
  },

  emitBallTrail(x, y, color) {
    this._spawn(2, {
      x, y,
      speed: 20,
      speedVariance: 15,
      life: 0.2,
      lifeVariance: 0.1,
      size: 2,
      sizeVariance: 1,
      color: color || '#FFFFFF',
      type: 'circle',
      shrink: true
    });
  },

  emitPaddleHit(x, y) {
    this._spawn(6, {
      x, y,
      angle: -Math.PI / 2,
      angleSpread: Math.PI * 0.6,
      speed: 100,
      speedVariance: 60,
      life: 0.3,
      lifeVariance: 0.15,
      size: 1.5,
      sizeVariance: 1.5,
      color: ['#FFFFFF', '#CCCCFF', '#9999FF'],
      type: 'circle',
      gravity: 0,
      shrink: true
    });
  },

  emitBossHit(x, y, count) {
    count = count || 15;

    this._spawn(Math.floor(count * 0.6), {
      x, y,
      speed: 200,
      speedVariance: 120,
      life: 0.6,
      lifeVariance: 0.3,
      size: 3,
      sizeVariance: 4,
      color: ['#FF0000', '#FF4500', '#FF6347', '#FFA500'],
      type: 'circle',
      gravity: 80,
      shrink: true
    });

    this._spawn(Math.floor(count * 0.4), {
      x, y,
      speed: 150,
      speedVariance: 100,
      life: 0.8,
      lifeVariance: 0.3,
      size: 4,
      sizeVariance: 3,
      color: ['#FFD700', '#FFFFFF', '#FFA500'],
      type: 'star',
      gravity: 40,
      shrink: false
    });
  },

  emitText(x, y, text, color) {
    this._spawn(1, {
      x, y,
      speed: 30,
      speedVariance: 20,
      life: 0.9,
      lifeVariance: 0.2,
      size: 18,
      sizeVariance: 4,
      color: color || '#FFFFFF',
      type: 'text',
      text: text,
      gravity: -40,
      shrink: false,
      decay: 1
    });
  },

  emitPowerupCollect(x, y, color) {
    this._spawn(12, {
      x: x,
      y: y,
      color: color,
      size: 3,
      speed: 150,
      speedVariance: 100,
      gravity: 0,
      life: 0.6,
      shrink: true,
      decay: 1.5
    });
    this._spawn(6, {
      x: x,
      y: y,
      type: 'star',
      color: '#ffffff',
      size: 2,
      speed: 100,
      speedVariance: 60,
      gravity: 0,
      life: 0.8,
      shrink: true,
      decay: 1.2
    });
  },

  emitComboBreak(x, y) {
    this._spawn(8, {
      x: x,
      y: y,
      type: 'square',
      color: '#ff4444',
      size: 3,
      speed: 200,
      speedVariance: 100,
      gravity: 200,
      life: 0.8,
      shrink: true,
      decay: 1
    });
  },

  emitMegaCombo(x, y, combo) {
    const count = Math.min(30, 10 + Math.floor(combo / 5));
    this._spawn(count, {
      x: x,
      y: y,
      type: 'star',
      color: '#ff00aa',
      size: 4,
      speed: 250,
      speedVariance: 150,
      gravity: -50,
      life: 1.5,
      shrink: false,
      decay: 0.8
    });
    this._spawn(Math.floor(count / 2), {
      x: x,
      y: y,
      color: '#ffcc00',
      size: 2,
      speed: 150,
      speedVariance: 80,
      gravity: -30,
      life: 1.2,
      shrink: true,
      decay: 1
    });
  },

  emitLightning(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.max(3, Math.floor(dist / 15));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const px = x1 + dx * t + (Math.random() - 0.5) * 10;
      const py = y1 + dy * t + (Math.random() - 0.5) * 10;
      this._spawn(1, {
        x: px,
        y: py,
        color: '#ffcc00',
        size: 2,
        speed: 15,
        speedVariance: 10,
        gravity: 0,
        life: 0.3,
        shrink: true,
        decay: 2
      });
    }
  },

  clear() {
    while (this.active.length > 0) {
      const p = this.active.pop();
      this._release(p);
    }
  }
};
