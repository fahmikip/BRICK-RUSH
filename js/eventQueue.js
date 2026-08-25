window.BR = window.BR || {};

BR.EventQueue = {
  queue: [],
  processing: false,
  maxDepth: 10,
  currentDepth: 0,
  delayQueue: [],

  enqueue(type, data, delay) {
    if (delay && delay > 0) {
      this.delayQueue.push({
        type: type,
        data: data,
        timer: delay
      });
    } else {
      this.queue.push({
        type: type,
        data: data,
        depth: this.currentDepth
      });
    }
  },

  process(game) {
    if (this.processing) return;
    this.processing = true;
    this.currentDepth = 0;

    while (this.queue.length > 0) {
      if (this.currentDepth >= this.maxDepth) {
        this.queue = [];
        break;
      }

      const event = this.queue.shift();
      this.currentDepth++;
      this._handleEvent(event, game);
    }

    this.processing = false;
    this.currentDepth = 0;
  },

  updateDelayQueue(dt) {
    for (let i = this.delayQueue.length - 1; i >= 0; i--) {
      this.delayQueue[i].timer -= dt;
      if (this.delayQueue[i].timer <= 0) {
        const event = this.delayQueue[i];
        this.delayQueue.splice(i, 1);
        this.queue.push({
          type: event.type,
          data: event.data,
          depth: 0
        });
      }
    }
  },

  _handleEvent(event, game) {
    switch (event.type) {
      case 'brickDestroyed':
        this._onBrickDestroyed(event.data, game);
        break;
      case 'explosion':
        this._onExplosion(event.data, game);
        break;
      case 'chainHit':
        this._onChainHit(event.data, game);
        break;
      case 'lightningStrike':
        this._onLightningStrike(event.data, game);
        break;
    }
  },

  _onBrickDestroyed(data, game) {
    const { brick, ball } = data;
    if (!brick || !brick.alive) return;

    if (brick.type.id === 'explosive') {
      this.enqueue('explosion', {
        x: brick.x + brick.width / 2,
        y: brick.y + brick.height / 2,
        radius: 100,
        damage: 2,
        sourceBrick: brick
      }, 0);
    }

    if (brick.type.id === 'chain') {
      this.enqueue('chainHit', {
        sourceBrick: brick,
        count: 3,
        damage: 1
      }, 0.06);
    }
  },

  _onExplosion(data, game) {
    const { x, y, radius, damage, sourceBrick } = data;
    if (game._explosionSet && game._explosionSet.has(sourceBrick)) return;
    if (game._explosionSet) game._explosionSet.add(sourceBrick);

    const hit = game.brickManager.damageArea(x, y, radius, damage, sourceBrick);
    for (let i = 0; i < hit.length; i++) {
      const brick = hit[i];
      if (brick.pendingDestroy && brick.alive) {
        brick.destroy();
        BR.Combo.increment();
        BR.Reward.brickReward(brick, game);
        BR.Powerups.trySpawn(brick.x + brick.width / 2, brick.y + brick.height / 2, 0);
        if (BR.Events) BR.Events.emit('chainBrickDestroyed', { brick: brick, depth: this.currentDepth });
      }
    }

    if (BR.Particles) BR.Particles.emitExplosion(x, y, 20);
    if (BR.Effects) BR.Effects.addShockwave(x, y, 5, radius, '#ff3344', 0.4);
    BR.Audio?.explosion();
    if (BR.Juice) BR.Juice.shake(10, 0.3);
  },

  _onChainHit(data, game) {
    const { sourceBrick, count, damage } = data;
    const hit = game.brickManager.chainToNearest(sourceBrick, count, damage);
    for (let i = 0; i < hit.length; i++) {
      const brick = hit[i];
      if (brick.pendingDestroy && brick.alive) {
        brick.destroy();
        BR.Combo.increment();
        BR.Reward.brickReward(brick, game);
        BR.Powerups.trySpawn(brick.x + brick.width / 2, brick.y + brick.height / 2, 0);
        if (BR.Events) BR.Events.emit('chainBrickDestroyed', { brick: brick, depth: this.currentDepth });
        if (BR.Audio) BR.Audio.chainReaction(this.currentDepth);
      }
      if (BR.Particles) {
        BR.Particles.emitBrickHit(brick.x + brick.width / 2, brick.y + brick.height / 2, '#aa44ff', 3);
      }
    }
  },

  _onLightningStrike(data, game) {
    const { bricks, damage } = data;
    for (let i = 0; i < bricks.length; i++) {
      const brick = bricks[i];
      if (!brick.alive) continue;
      const destroyed = brick.hit(damage);
      if (BR.Particles) BR.Particles.emitCritical(brick.x + brick.width / 2, brick.y + brick.height / 2, 5);
      if (BR.Effects) BR.Effects.addShockwave(brick.x + brick.width / 2, brick.y + brick.height / 2, 3, 30, '#ffcc00', 0.2);
      if (destroyed) {
        brick.destroy();
        BR.Combo.increment();
        BR.Reward.brickReward(brick, game);
        BR.Powerups.trySpawn(brick.x + brick.width / 2, brick.y + brick.height / 2, 0);
        if (BR.Events) BR.Events.emit('brickDestroyed', { brick: brick, ball: null });
        if (BR.Audio) BR.Audio.chainReaction(this.currentDepth);
      }
    }
  },

  clear() {
    this.queue = [];
    this.delayQueue = [];
    this.processing = false;
    this.currentDepth = 0;
  },

  get queueLength() {
    return this.queue.length + this.delayQueue.length;
  }
};
