window.BR = window.BR || {};

BR.Events = {
  _listeners: {},

  on(event, callback) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(callback);
  },

  off(event, callback) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
  },

  emit(event, data) {
    if (!this._listeners[event]) return;
    for (let i = 0; i < this._listeners[event].length; i++) {
      this._listeners[event][i](data);
    }
  },

  clear() {
    this._listeners = {};
  }
};
