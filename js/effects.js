window.BR = window.BR || {};

BR.Effects = {
  floatingTexts: [],
  shockwaves: [],
  maxFloating: 50,
  maxShockwaves: 10,

  update(dt) {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
        continue;
      }
      ft.y -= ft.speed * dt * 60;
      ft.x += ft.drift * dt * 60;
      ft.alpha = Math.min(1, ft.life / ft.maxLife * 2);
      ft.scale = 1 + (1 - ft.life / ft.maxLife) * 0.3;
    }

    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.life -= dt;
      if (sw.life <= 0) {
        this.shockwaves.splice(i, 1);
        continue;
      }
      const progress = 1 - sw.life / sw.maxLife;
      sw.radius = sw.minRadius + (sw.maxRadius - sw.minRadius) * progress;
      sw.alpha = 1 - progress;
      sw.lineWidth = Math.max(0.5, 3 * (1 - progress));
    }
  },

  draw(ctx) {
    for (let i = 0; i < this.shockwaves.length; i++) {
      const sw = this.shockwaves[i];
      ctx.save();
      ctx.globalAlpha = sw.alpha * 0.6;
      ctx.strokeStyle = sw.color || '#ffffff';
      ctx.lineWidth = sw.lineWidth;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    for (let i = 0; i < this.floatingTexts.length; i++) {
      const ft = this.floatingTexts[i];
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.fillStyle = ft.color;
      ctx.font = 'bold ' + ft.fontSize + 'px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (ft.scale !== 1) {
        ctx.translate(ft.x, ft.y);
        ctx.scale(ft.scale, ft.scale);
        ctx.translate(-ft.x, -ft.y);
      }
      if (ft.stroke) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeText(ft.text, ft.x, ft.y);
      }
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  },

  addFloatingText(x, y, text, color, options) {
    if (this.floatingTexts.length >= this.maxFloating) {
      this.floatingTexts.shift();
    }
    const opts = options || {};
    this.floatingTexts.push({
      x: x,
      y: y,
      text: text,
      color: color || '#ffffff',
      fontSize: opts.fontSize || 14,
      speed: opts.speed || 1.5,
      drift: opts.drift || (Math.random() - 0.5) * 0.5,
      life: opts.life || 1.0,
      maxLife: opts.life || 1.0,
      alpha: 1,
      scale: 1,
      stroke: opts.stroke !== false
    });
  },

  addShockwave(x, y, minRadius, maxRadius, color, duration) {
    if (this.shockwaves.length >= this.maxShockwaves) {
      this.shockwaves.shift();
    }
    this.shockwaves.push({
      x: x,
      y: y,
      minRadius: minRadius || 5,
      maxRadius: maxRadius || 60,
      radius: minRadius || 5,
      color: color || '#ffffff',
      life: duration || 0.3,
      maxLife: duration || 0.3,
      alpha: 1,
      lineWidth: 3
    });
  },

  damageNumber(x, y, damage, isCrit) {
    const text = '-' + damage;
    const color = isCrit ? '#FFD700' : '#ffffff';
    this.addFloatingText(x, y - 10, text, color, {
      fontSize: isCrit ? 18 : 13,
      speed: 2,
      life: isCrit ? 1.2 : 0.8,
      drift: (Math.random() - 0.5) * 1
    });
    if (isCrit) {
      this.addFloatingText(x, y - 25, 'CRITICAL!', '#FFD700', {
        fontSize: 11,
        speed: 1.5,
        life: 1.0
      });
    }
  },

  clear() {
    this.floatingTexts = [];
    this.shockwaves = [];
  }
};
