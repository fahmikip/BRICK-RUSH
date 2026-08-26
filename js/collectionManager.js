window.BR = window.BR || {};

BR.CollectionManager = {
  BALL_SKINS: [
    { id: 'ball_default', name: 'CLASSIC', unlockId: null, color: '#00f0ff', glow: '#00f0ff', trailColor: '#00f0ff', description: 'Default ball skin' },
    { id: 'ball_neon', name: 'NEON', unlockId: 'ball_neon', color: '#00ff88', glow: '#00ff88', trailColor: '#00ff88', description: 'Bright neon green' },
    { id: 'ball_plasma', name: 'PLASMA', unlockId: 'ball_plasma', color: '#aa44ff', glow: '#aa44ff', trailColor: '#aa44ff', description: 'Purple plasma energy' },
    { id: 'ball_fire', name: 'FIRE', unlockId: 'ball_fire', color: '#ff4400', glow: '#ff6600', trailColor: '#ff3300', description: 'Burning fire ball' },
    { id: 'ball_ice', name: 'ICE', unlockId: 'ball_ice', color: '#88ddff', glow: '#00ccff', trailColor: '#aaddff', description: 'Frozen ice crystal' },
    { id: 'ball_galaxy', name: 'GALAXY', unlockId: 'ball_galaxy', color: '#ff00aa', glow: '#ff00cc', trailColor: '#ff44cc', description: 'Galaxy pink energy' }
  ],

  PADDLE_SKINS: [
    { id: 'paddle_default', name: 'CLASSIC', unlockId: null, color: '#00f0ff', gradient: ['#00d4ff', '#00f0ff', '#0088aa'], description: 'Default paddle skin' },
    { id: 'paddle_neon', name: 'NEON', unlockId: 'paddle_neon', color: '#00ff88', gradient: ['#00cc66', '#00ff88', '#00aa44'], description: 'Bright neon green' },
    { id: 'paddle_cyber', name: 'CYBER', unlockId: 'paddle_cyber', color: '#00ff44', gradient: ['#00dd33', '#00ff44', '#00bb22'], description: 'Cyber green chrome' },
    { id: 'paddle_fire', name: 'FIRE', unlockId: 'paddle_fire', color: '#ff4400', gradient: ['#ff6600', '#ff4400', '#cc2200'], description: 'Molten fire paddle' },
    { id: 'paddle_ice', name: 'ICE', unlockId: 'paddle_ice', color: '#00ccff', gradient: ['#88ddff', '#00ccff', '#0088cc'], description: 'Frozen ice paddle' },
    { id: 'paddle_void', name: 'VOID', unlockId: 'paddle_void', color: '#aa44ff', gradient: ['#cc66ff', '#aa44ff', '#8822cc'], description: 'Void energy paddle' }
  ],

  activeBallSkin: 'ball_default',
  activePaddleSkin: 'paddle_default',

  init() {
    var save = BR.Storage.load();
    if (!save.skins) save.skins = { balls: ['ball_default'], paddles: ['paddle_default'], activeBall: 'ball_default', activePaddle: 'paddle_default' };
    this.activeBallSkin = save.skins.activeBall || 'ball_default';
    this.activePaddleSkin = save.skins.activePaddle || 'paddle_default';
    if (!save.skins.balls) save.skins.balls = ['ball_default'];
    if (!save.skins.paddles) save.skins.paddles = ['paddle_default'];
    if (save.skins.balls.indexOf('ball_default') === -1) save.skins.balls.unshift('ball_default');
    if (save.skins.paddles.indexOf('paddle_default') === -1) save.skins.paddles.unshift('paddle_default');
    BR.Storage.save();
  },

  isUnlocked(skinId) {
    var save = BR.Storage.load();
    var skins = save.skins || {};
    var list = skinId.indexOf('ball_') === 0 ? (skins.balls || []) : (skins.paddles || []);
    return list.indexOf(skinId) !== -1;
  },

  equipBall(skinId) {
    if (!this.isUnlocked(skinId)) return false;
    this.activeBallSkin = skinId;
    var save = BR.Storage.load();
    save.skins.activeBall = skinId;
    BR.Storage.save();
    return true;
  },

  equipPaddle(skinId) {
    if (!this.isUnlocked(skinId)) return false;
    this.activePaddleSkin = skinId;
    var save = BR.Storage.load();
    save.skins.activePaddle = skinId;
    BR.Storage.save();
    return true;
  },

  getBallSkin(id) {
    for (var i = 0; i < this.BALL_SKINS.length; i++) {
      if (this.BALL_SKINS[i].id === id) return this.BALL_SKINS[i];
    }
    return this.BALL_SKINS[0];
  },

  getPaddleSkin(id) {
    for (var i = 0; i < this.PADDLE_SKINS.length; i++) {
      if (this.PADDLE_SKINS[i].id === id) return this.PADDLE_SKINS[i];
    }
    return this.PADDLE_SKINS[0];
  },

  getActiveBallSkin() {
    return this.getBallSkin(this.activeBallSkin);
  },

  getActivePaddleSkin() {
    return this.getPaddleSkin(this.activePaddleSkin);
  }
};
