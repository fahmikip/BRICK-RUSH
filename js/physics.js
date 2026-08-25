window.BR = window.BR || {};

BR.Physics = {
  checkWallCollision(ball, canvasWidth, canvasHeight) {
    if (ball.x - ball.radius <= 0) {
      ball.x = ball.radius;
      ball.vx = Math.abs(ball.vx);
      return 'wall';
    }
    if (ball.x + ball.radius >= canvasWidth) {
      ball.x = canvasWidth - ball.radius;
      ball.vx = -Math.abs(ball.vx);
      return 'wall';
    }
    if (ball.y - ball.radius <= 0) {
      ball.y = ball.radius;
      ball.vy = Math.abs(ball.vy);
      return 'wall';
    }
    if (ball.y - ball.radius > canvasHeight) {
      return 'bottom';
    }
    return null;
  },

  checkPaddleCollision(ball, paddle) {
    if (ball.vy < 0) return false;

    if (ball.x + ball.radius < paddle.x ||
      ball.x - ball.radius > paddle.x + paddle.width ||
      ball.y + ball.radius < paddle.y ||
      ball.y - ball.radius > paddle.y + paddle.height) {
      return false;
    }

    const hitPos = ((ball.x - paddle.x) / paddle.width) * 2 - 1;
    const maxAngle = 70 * (Math.PI / 180);
    const angle = hitPos * maxAngle;

    const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    ball.vx = Math.sin(angle) * speed;
    ball.vy = -Math.abs(Math.cos(angle) * speed);

    if (Math.abs(ball.vy) < 2) {
      ball.vy = -2;
    }

    ball.y = paddle.y - ball.radius - 1;
    paddle.hit();
    return true;
  },

  checkBrickCollision(ball, brick) {
    if (!brick.alive) return false;

    if (ball.x + ball.radius < brick.x ||
      ball.x - ball.radius > brick.x + brick.width ||
      ball.y + ball.radius < brick.y ||
      ball.y - ball.radius > brick.y + brick.height) {
      return false;
    }

    if (ball.piercing) return true;

    const overlapLeft   = (ball.x + ball.radius) - brick.x;
    const overlapRight  = (brick.x + brick.width) - (ball.x - ball.radius);
    const overlapTop    = (ball.y + ball.radius) - brick.y;
    const overlapBottom = (brick.y + brick.height) - (ball.y - ball.radius);

    const minOverlapX = Math.min(overlapLeft, overlapRight);
    const minOverlapY = Math.min(overlapTop, overlapBottom);

    if (minOverlapX < minOverlapY) {
      if (overlapLeft < overlapRight) {
        ball.vx = -Math.abs(ball.vx);
        ball.x = brick.x - ball.radius - 0.5;
      } else {
        ball.vx = Math.abs(ball.vx);
        ball.x = brick.x + brick.width + ball.radius + 0.5;
      }
    } else {
      if (overlapTop < overlapBottom) {
        ball.vy = -Math.abs(ball.vy);
        ball.y = brick.y - ball.radius - 0.5;
      } else {
        ball.vy = Math.abs(ball.vy);
        ball.y = brick.y + brick.height + ball.radius + 0.5;
      }
    }

    return true;
  },

  rectsOverlap(a, b) {
    return a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y;
  },

  pointInRect(px, py, rect) {
    return px >= rect.x && px <= rect.x + rect.width &&
      py >= rect.y && py <= rect.y + rect.height;
  },

  distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  },

  normalize(vx, vy) {
    const len = Math.sqrt(vx * vx + vy * vy);
    if (len === 0) return { x: 0, y: -1 };
    return { x: vx / len, y: vy / len };
  }
};
