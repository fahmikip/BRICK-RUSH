window.BR = window.BR || {};

BR.NotificationManager = {
  _queue: [],
  _showing: false,
  _container: null,

  init() {
    this._container = document.getElementById('notificationContainer');
    if (!this._container) {
      this._container = document.createElement('div');
      this._container.id = 'notificationContainer';
      this._container.style.cssText = 'position:fixed;top:12px;right:12px;z-index:900;display:flex;flex-direction:column;gap:8px;pointer-events:none;max-width:320px;';
      document.body.appendChild(this._container);
    }
  },

  show(type, title, message, reward, duration) {
    duration = duration || 3000;
    var item = { type: type, title: title, message: message, reward: reward, duration: duration };
    this._queue.push(item);
    this._processQueue();
  },

  _processQueue() {
    if (this._showing || this._queue.length === 0) return;
    this._showing = true;
    var item = this._queue.shift();
    this._render(item);
  },

  _render(item) {
    var el = document.createElement('div');
    el.className = 'notification-toast notification-' + (item.type || 'info');

    var html = '<div class="notification-header">';
    var icon = '✓';
    if (item.type === 'achievement') icon = '🏆';
    else if (item.type === 'mission') icon = '📋';
    else if (item.type === 'levelup') icon = '⬆';
    else if (item.type === 'unlock') icon = '🔓';
    else if (item.type === 'reward') icon = '🎁';
    else if (item.type === 'streak') icon = '🔥';
    html += '<span class="notification-icon">' + icon + '</span>';
    html += '<span class="notification-title">' + (item.title || '') + '</span>';
    html += '</div>';

    if (item.message) {
      html += '<div class="notification-message">' + item.message + '</div>';
    }

    if (item.reward) {
      html += '<div class="notification-reward">' + item.reward + '</div>';
    }

    el.innerHTML = html;
    el.style.opacity = '0';
    el.style.transform = 'translateX(100%)';
    el.style.transition = 'all 0.3s ease';
    this._container.appendChild(el);

    var self = this;
    requestAnimationFrame(function() {
      el.style.opacity = '1';
      el.style.transform = 'translateX(0)';
    });

    setTimeout(function() {
      el.style.opacity = '0';
      el.style.transform = 'translateX(100%)';
      setTimeout(function() {
        if (el.parentNode) el.parentNode.removeChild(el);
        self._showing = false;
        self._processQueue();
      }, 300);
    }, item.duration);
  },

  clear() {
    this._queue = [];
    this._showing = false;
    if (this._container) {
      this._container.innerHTML = '';
    }
  },

  achievement(title, message, reward) {
    this.show('achievement', title, message, reward, 4000);
  },

  mission(title, message, reward) {
    this.show('mission', title, message, reward, 3000);
  },

  levelUp(title, message, reward) {
    this.show('levelup', title, message, reward, 4000);
  },

  unlock(title, message) {
    this.show('unlock', title, message, '', 3000);
  },

  streak(title, message) {
    this.show('streak', title, message, '', 3000);
  }
};
