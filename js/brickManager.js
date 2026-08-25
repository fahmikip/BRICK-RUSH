window.BR = window.BR || {};

BR.BrickManager = class BrickManager {
  constructor() {
    this.bricks = [];
  }

  addBrick(brick) {
    this.bricks.push(brick);
  }

  removeBrick(brick) {
    const idx = this.bricks.indexOf(brick);
    if (idx !== -1) this.bricks.splice(idx, 1);
  }

  update(dt) {
    for (let i = this.bricks.length - 1; i >= 0; i--) {
      const brick = this.bricks[i];
      brick.update(dt);
      if (brick.state === BR.BrickStates.DESTROYED) {
        this.bricks.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    for (let i = 0; i < this.bricks.length; i++) {
      this.bricks[i].draw(ctx);
    }
  }

  getActiveBricks() {
    return this.bricks.filter(b => b.alive && b.state !== BR.BrickStates.DESTROYING);
  }

  getBrickAt(x, y) {
    for (let i = 0; i < this.bricks.length; i++) {
      const b = this.bricks[i];
      if (!b.alive) continue;
      if (x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height) {
        return b;
      }
    }
    return null;
  }

  damageArea(cx, cy, radius, damage, sourceBrick) {
    const hit = [];
    for (let i = 0; i < this.bricks.length; i++) {
      const brick = this.bricks[i];
      if (!brick.alive || brick === sourceBrick) continue;
      const bx = brick.x + brick.width / 2;
      const by = brick.y + brick.height / 2;
      const dx = bx - cx;
      const dy = by - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < radius) {
        brick.hit(damage);
        hit.push(brick);
      }
    }
    return hit;
  }

  chainToNearest(sourceBrick, count, damage) {
    const candidates = [];
    const sx = sourceBrick.x + sourceBrick.width / 2;
    const sy = sourceBrick.y + sourceBrick.height / 2;

    for (let i = 0; i < this.bricks.length; i++) {
      const brick = this.bricks[i];
      if (!brick.alive || brick === sourceBrick) continue;
      const bx = brick.x + brick.width / 2;
      const by = brick.y + brick.height / 2;
      const dx = bx - sx;
      const dy = by - sy;
      candidates.push({ brick: brick, dist: Math.sqrt(dx * dx + dy * dy) });
    }

    candidates.sort((a, b) => a.dist - b.dist);
    const hit = [];
    const limit = Math.min(count, candidates.length);
    for (let i = 0; i < limit; i++) {
      candidates[i].brick.hit(damage);
      hit.push(candidates[i].brick);

      if (BR.Events) {
        BR.Events.emit('chainTriggered', {
          source: sourceBrick,
          target: candidates[i].brick,
          index: i
        });
      }
    }
    return hit;
  }

  clear() {
    this.bricks = [];
  }

  get count() {
    return this.bricks.length;
  }

  get aliveCount() {
    let n = 0;
    for (let i = 0; i < this.bricks.length; i++) {
      if (this.bricks[i].alive) n++;
    }
    return n;
  }

  get destructibleCount() {
    let n = 0;
    for (let i = 0; i < this.bricks.length; i++) {
      if (this.bricks[i].alive) n++;
    }
    return n;
  }

  isLevelComplete() {
    return this.destructibleCount === 0;
  }
};
