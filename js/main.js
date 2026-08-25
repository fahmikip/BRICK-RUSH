window.BR = window.BR || {};

if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    if (typeof r === 'number') r = [r, r, r, r];
    if (!Array.isArray(r)) r = [5, 5, 5, 5];
    const [tl, tr, br, bl] = r;
    this.moveTo(x + tl, y);
    this.lineTo(x + w - tr, y);
    this.quadraticCurveTo(x + w, y, x + w, y + tr);
    this.lineTo(x + w, y + h - br);
    this.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
    this.lineTo(x + bl, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - bl);
    this.lineTo(x, y + tl);
    this.quadraticCurveTo(x, y, x + tl, y);
    this.closePath();
    return this;
  };
}

BR.Main = {
  bgParticles: [],
  bgCanvas: null,
  bgCtx: null,
  lastTime: 0,

  init: function () {
    BR.Storage.load();

    var canvas = BR.UI?.elements?.gameCanvas || document.getElementById('gameCanvas');
    var bgCanvas = document.getElementById('bgCanvas');

    BR.Audio.init();

    if (canvas) BR.Input.init(canvas);

    BR.Particles.init();
    BR.Powerups.init();
    BR.Upgrades.init();
    BR.UI.init();
    BR.Game.init();

    var settings = BR.Storage.get('settings');
    BR.Audio.musicEnabled = settings.music;
    BR.Audio.soundEnabled = settings.sound;

    this.initBackground(bgCanvas);

    this.lastTime = performance.now();
    this.bgLoop();

    window.addEventListener('resize', function () { BR.Main.resize(); });
    this.resize();

    var resumeAudio = function () {
      BR.Audio.resume();
      document.removeEventListener('click', resumeAudio);
      document.removeEventListener('touchstart', resumeAudio);
      document.removeEventListener('keydown', resumeAudio);
    };
    document.addEventListener('click', resumeAudio);
    document.addEventListener('touchstart', resumeAudio);
    document.addEventListener('keydown', resumeAudio);

    console.log('BRICK RUSH initialized!');
  },

  initBackground: function (bgCanvas) {
    if (!bgCanvas) return;

    var ctx = bgCanvas.getContext('2d');
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;

    this.bgParticles = [];
    for (var i = 0; i < 50; i++) {
      this.bgParticles.push({
        x: Math.random() * bgCanvas.width,
        y: Math.random() * bgCanvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.3 - 0.2,
        alpha: Math.random() * 0.5 + 0.1,
        color: ['#00f0ff', '#ff00aa', '#00ff88', '#ffcc00'][Math.floor(Math.random() * 4)]
      });
    }

    this.bgCtx = ctx;
    this.bgCanvas = bgCanvas;
  },

  bgLoop: function () {
    this.bgUpdate();
    this.bgDraw();
    requestAnimationFrame(function () { BR.Main.bgLoop(); });
  },

  bgUpdate: function () {
    if (!this.bgCanvas) return;

    var w = this.bgCanvas.width;
    var h = this.bgCanvas.height;
    for (var i = 0; i < this.bgParticles.length; i++) {
      var p = this.bgParticles[i];
      p.x += p.speedX;
      p.y += p.speedY;

      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;
    }
  },

  bgDraw: function () {
    if (!this.bgCtx || !this.bgCanvas) return;

    this.bgCtx.clearRect(0, 0, this.bgCanvas.width, this.bgCanvas.height);

    for (var i = 0; i < this.bgParticles.length; i++) {
      var p = this.bgParticles[i];
      this.bgCtx.globalAlpha = p.alpha;
      this.bgCtx.fillStyle = p.color;
      this.bgCtx.beginPath();
      this.bgCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.bgCtx.fill();
    }

    this.bgCtx.globalAlpha = 1;
  },

  resize: function () {
    if (this.bgCanvas) {
      this.bgCanvas.width = window.innerWidth;
      this.bgCanvas.height = window.innerHeight;
    }
  }
};

document.addEventListener('DOMContentLoaded', function () {
  BR.Main.init();
});
