window.BR = window.BR || {};

BR.RageEvents = {
  active: false,
  enabled: true,
  currentEvent: null,
  eventTimer: 0,
  eventCooldown: 0,
  eventDuration: 0,
  warningTimer: 0,
  isWarning: false,
  nextEventMin: 15,
  nextEventMax: 30,
  blindSpotZones: [],
  invertedControls: false,

  events: [
    {
      id: 'paddle_shrink',
      name: 'PADDLE SHRINK',
      icon: '缩小',
      duration: 5,
      color: '#ff3344',
      apply: function(game) {
        if (game.paddle) {
          game.paddle._preRageWidth = game.paddle.width;
          game.paddle.width = Math.floor(game.paddle.width * 0.6);
        }
      },
      revert: function(game) {
        if (game.paddle && game.paddle._preRageWidth !== undefined) {
          game.paddle.width = game.paddle._preRageWidth;
          delete game.paddle._preRageWidth;
        }
      }
    },
    {
      id: 'ball_slow',
      name: 'BALL SLOW',
      icon: '减速',
      duration: 4,
      color: '#4488ff',
      apply: function(game) {
        for (var i = 0; i < game.balls.length; i++) {
          var b = game.balls[i];
          b._preRageSpeedMult = 1;
          b.applySpeedMultiplier(0.5);
        }
      },
      revert: function(game) {
        for (var i = 0; i < game.balls.length; i++) {
          var b = game.balls[i];
          if (b._preRageSpeedMult !== undefined) {
            b.applySpeedMultiplier(1);
            delete b._preRageSpeedMult;
          }
        }
      }
    },
    {
      id: 'blind_spots',
      name: 'BLIND SPOTS',
      icon: '遮挡',
      duration: 4,
      color: '#aa00ff',
      apply: function(game) {
        BR.RageEvents.blindSpotZones = [];
        var count = 2 + Math.floor(Math.random() * 2);
        for (var i = 0; i < count; i++) {
          BR.RageEvents.blindSpotZones.push({
            x: Math.random() * game.width * 0.7,
            y: Math.random() * game.height * 0.6 + 20,
            w: 60 + Math.random() * 80,
            h: 60 + Math.random() * 80,
            alpha: 0.7 + Math.random() * 0.3
          });
        }
      },
      revert: function(game) {
        BR.RageEvents.blindSpotZones = [];
      }
    },
    {
      id: 'reverse_controls',
      name: 'REVERSE',
      icon: '反转',
      duration: 3,
      color: '#ff00aa',
      apply: function(game) {
        BR.RageEvents.invertedControls = true;
      },
      revert: function(game) {
        BR.RageEvents.invertedControls = false;
      }
    },
    {
      id: 'screen_shake',
      name: 'VIBRATE',
      icon: '震动',
      duration: 5,
      color: '#ffcc00',
      apply: function(game) {
        BR.RageEvents._shakeInterval = setInterval(function() {
          if (BR.UI) BR.UI.shake(4, 0.1);
        }, 150);
      },
      revert: function(game) {
        if (BR.RageEvents._shakeInterval) {
          clearInterval(BR.RageEvents._shakeInterval);
          BR.RageEvents._shakeInterval = null;
        }
      }
    },
    {
      id: 'invisible_ball',
      name: 'GHOST BALL',
      icon: '隐形',
      duration: 3,
      color: '#00ff88',
      apply: function(game) {
        for (var i = 0; i < game.balls.length; i++) {
          game.balls[i]._preRageAlpha = game.balls[i]._rageAlpha || 1;
          game.balls[i]._rageAlpha = 0;
        }
      },
      revert: function(game) {
        for (var i = 0; i < game.balls.length; i++) {
          if (game.balls[i]._preRageAlpha !== undefined) {
            game.balls[i]._rageAlpha = game.balls[i]._preRageAlpha;
            delete game.balls[i]._preRageAlpha;
          }
        }
      }
    }
  ],

  init() {
    this.active = false;
    this.enabled = true;
    this.currentEvent = null;
    this.eventTimer = 0;
    this.eventCooldown = 0;
    this.eventDuration = 0;
    this.warningTimer = 0;
    this.isWarning = false;
    this.blindSpotZones = [];
    this.invertedControls = false;
    this._scheduleNext();
  },

  start() {
    this.active = true;
    this._scheduleNext();
  },

  stop() {
    this.active = false;
    if (this.currentEvent) {
      this._revertCurrent();
    }
    this.currentEvent = null;
    this.eventTimer = 0;
  },

  _scheduleNext() {
    this.eventCooldown = this.nextEventMin + Math.random() * (this.nextEventMax - this.nextEventMin);
  },

  _revertCurrent() {
    if (this.currentEvent && this.currentEvent.revert) {
      this.currentEvent.revert(BR.Game);
    }
  },

  update(dt) {
    if (!this.active || !this.enabled) return;
    if (BR.Game.state !== 'playing' && BR.Game.state !== 'boss') return;

    if (this.isWarning) {
      this.warningTimer -= dt;
      if (this.warningTimer <= 0) {
        this.isWarning = false;
        this._activateEvent();
      }
      return;
    }

    if (this.currentEvent) {
      this.eventDuration -= dt;
      if (this.eventDuration <= 0) {
        this._revertCurrent();
        if (BR.Effects) {
          BR.Effects.addFloatingText(BR.Game.width / 2, BR.Game.height / 2, this.currentEvent.name + ' ENDED', '#00ff88', {
            fontSize: 16, speed: 1, life: 1
          });
        }
        this.currentEvent = null;
        this._scheduleNext();
      }
      return;
    }

    this.eventCooldown -= dt;
    if (this.eventCooldown <= 0) {
      this._triggerRandomEvent();
    }
  },

  _triggerRandomEvent() {
    var available = this.events.filter(function(e) { return e.id !== 'blind_spots' || BR.Game.width > 300; });
    var event = available[Math.floor(Math.random() * available.length)];

    this.currentEvent = event;
    this.isWarning = true;
    this.warningTimer = 1;

    var self = this;
    this._warningInterval = setInterval(function() {
      if (BR.UI) BR.UI.shake(2, 0.05);
    }, 100);

    if (BR.Effects) {
      BR.Effects.addFloatingText(BR.Game.width / 2, 60, 'WARNING: ' + event.name, event.color, {
        fontSize: 18, speed: 0.5, life: 1.2, drift: 0
      });
    }

    if (BR.Audio) BR.Audio.bossHit();
  },

  _activateEvent() {
    if (this._warningInterval) {
      clearInterval(this._warningInterval);
      this._warningInterval = null;
    }

    if (this.currentEvent && this.currentEvent.apply) {
      this.currentEvent.apply(BR.Game);
    }

    this.eventDuration = this.currentEvent.duration;
    this.isWarning = false;
  },

  isInverted() {
    return this.invertedControls;
  },

  drawBlindSpots(ctx) {
    if (this.blindSpotZones.length === 0) return;
    for (var i = 0; i < this.blindSpotZones.length; i++) {
      var z = this.blindSpotZones[i];
      ctx.fillStyle = 'rgba(0, 0, 0, ' + z.alpha + ')';
      ctx.fillRect(z.x, z.y, z.w, z.h);
      ctx.strokeStyle = 'rgba(170, 0, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(z.x, z.y, z.w, z.h);
    }
  },

  isBallInvisible() {
    if (!this.currentEvent) return false;
    return this.currentEvent.id === 'invisible_ball';
  }
};
