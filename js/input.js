window.BR = window.BR || {};

BR.Input = {
  mouseX: 0,
  mouseY: 0,
  touchActive: false,
  keys: {},
  targetX: 0.5,
  isTouchDevice: false,
  launched: false,
  _canvas: null,

  init(canvas) {
    this._canvas = canvas;

    this.isTouchDevice = ('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0) ||
      (navigator.msMaxTouchPoints > 0);

    canvas.addEventListener('mousemove', this._onMouseMove.bind(this));

    canvas.addEventListener('touchstart', this._onTouchStart.bind(this), { passive: false });
    canvas.addEventListener('touchmove', this._onTouchMove.bind(this), { passive: false });
    canvas.addEventListener('touchend', this._onTouchEnd.bind(this), { passive: false });
    canvas.addEventListener('touchcancel', this._onTouchEnd.bind(this), { passive: false });

    window.addEventListener('keydown', this._onKeyDown.bind(this));
    window.addEventListener('keyup', this._onKeyUp.bind(this));

    document.addEventListener('touchmove', (e) => {
      if (e.target.closest && e.target.closest('#gameCanvas')) {
        e.preventDefault();
      }
    }, { passive: false });
  },

  _getCanvasCoords(clientX, clientY) {
    if (!this._canvas) return { x: 0.5, y: 0.5 };

    const rect = this._canvas.getBoundingClientRect();
    const scaleX = this._canvas.width / rect.width;
    const scaleY = this._canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX / this._canvas.width,
      y: (clientY - rect.top) * scaleY / this._canvas.height
    };
  },

  _onMouseMove(e) {
    const coords = this._getCanvasCoords(e.clientX, e.clientY);
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
    this.targetX = Math.max(0, Math.min(1, coords.x));
  },

  _onTouchStart(e) {
    e.preventDefault();
    this.touchActive = true;

    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const coords = this._getCanvasCoords(touch.clientX, touch.clientY);
      this.mouseX = touch.clientX;
      this.mouseY = touch.clientY;
      this.targetX = Math.max(0, Math.min(1, coords.x));
    }

    if (!this.launched) {
      this.launched = true;
    }
  },

  _onTouchMove(e) {
    e.preventDefault();

    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const coords = this._getCanvasCoords(touch.clientX, touch.clientY);
      this.mouseX = touch.clientX;
      this.mouseY = touch.clientY;
      this.targetX = Math.max(0, Math.min(1, coords.x));
    }
  },

  _onTouchEnd(e) {
    e.preventDefault();
    this.touchActive = false;
  },

  _onKeyDown(e) {
    this.keys[e.code] = true;

    if ((e.code === 'Space' || e.code === 'Enter') && !this.launched) {
      e.preventDefault();
      this.launched = true;
    }

    if (e.code === 'Space' || e.code === 'ArrowLeft' || e.code === 'ArrowRight' ||
        e.code === 'ArrowUp' || e.code === 'ArrowDown') {
      e.preventDefault();
    }
  },

  _onKeyUp(e) {
    this.keys[e.code] = false;
  },

  isKeyDown(code) {
    return this.keys[code] || false;
  },

  reset() {
    this.launched = false;
    this.keys = {};
    this.touchActive = false;
    this.targetX = 0.5;
  },

  getTargetPixel(canvasWidth, paddleWidth) {
    return this.targetX * canvasWidth;
  }
};
