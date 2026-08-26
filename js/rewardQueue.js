window.BR = window.BR || {};

BR.RewardQueue = {
  _queue: [],
  _showing: false,

  enqueue(rewards, onComplete) {
    if (!rewards || rewards.length === 0) {
      if (onComplete) onComplete();
      return;
    }
    for (var i = 0; i < rewards.length; i++) {
      this._queue.push({
        reward: rewards[i],
        isLast: i === rewards.length - 1,
        onComplete: rewards.length === 1 ? onComplete : null
      });
    }
    if (rewards.length > 1) {
      this._queue[this._queue.length - 1].onComplete = onComplete;
    }
    this._processQueue();
  },

  enqueueSingle(reward, onComplete) {
    this._queue.push({ reward: reward, isLast: true, onComplete: onComplete });
    this._processQueue();
  },

  _processQueue() {
    if (this._showing || this._queue.length === 0) return;
    this._showing = true;
    var item = this._queue.shift();
    this._showReward(item);
  },

  _showReward(item) {
    var r = item.reward;

    BR.NotificationManager.show(
      r.type || 'reward',
      r.title || 'REWARD',
      r.message || '',
      r.rewardText || '',
      r.duration || 3000
    );

    if (r.coins) BR.Storage.addCoins(r.coins);
    if (r.xp) {
      var levelUp = BR.MetaProgression.addXP(r.xp);
      if (levelUp) {
        setTimeout(function() {
          BR.NotificationManager.show('levelup', 'LEVEL UP!', 'Level ' + levelUp.newLevel, '', 4000);
          BR.MetaProgression.grantLevelUpRewards(levelUp.newLevel);
        }, 3500);
      }
    }
    if (r.tokens && BR.WorldManager) {
      BR.WorldManager.addCoreTokens(r.tokens);
    }

    var self = this;
    setTimeout(function() {
      self._showing = false;
      if (item.onComplete) item.onComplete();
      self._processQueue();
    }, r.duration || 3000);
  },

  clear() {
    this._queue = [];
    this._showing = false;
  },

  add(rewards, onComplete) {
    this.enqueue(rewards, onComplete);
  },

  process() {
    this._processQueue();
  }
};
