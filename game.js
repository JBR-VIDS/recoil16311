/* 16311 Recoil: "Viper Recoil", a small spring-launcher game.
   The robot's spring fires a coiled viper (our school mascot is the Viper) into a snake charmer's basket.
   Snake springs on the floor bounce it back up. You normally never need to edit this file.
   Settings (number of launches, on/off) live in content.js under "game". */
(function () {
  'use strict';

  var canvas = document.getElementById('game-canvas');
  if (!canvas || !canvas.getContext) return;
  var wrap = canvas.closest('.game-wrap');
  var ctx = canvas.getContext('2d');
  var cfg = (window.SITE && window.SITE.game) || {};
  var SHOTS = Math.max(1, parseInt(cfg.launches, 10) || 10);
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- World (logical units; the canvas scales to fit) ---------- */
  var W = 960, H = 540, FLOOR = 468;
  var G = 1000;          // gravity
  var MAXPULL = 130;     // longest pull-back
  var KV = 8.4;          // launch speed per pixel of pull
  var R = 12;            // viper (ball) radius
  var BW = 104, BH = 64; // basket size
  var PADW = 76, PADH = 46; // snake spring pad
  var WALL = 9;          // basket wall thickness
  var PIVOT = { x: 125, y: FLOOR - 82 };
  var TAU = Math.PI * 2;

  var STORE = 'recoil16311-best';
  var COLORS = { maroon: '#a3132f', maroonDark: '#86102a', steel: '#c9ccd1', gold: '#f5b82e', ink: '#1d2026', snake: '#d11f45', wicker: '#c99a5b', wickerDark: '#8f6733' };

  /* ---------- Page bits ---------- */
  function q(s) { return wrap.querySelector(s); }
  var elScore = q('[data-g="score"]'), elLeft = q('[data-g="left"]'), elBest = q('[data-g="best"]');
  var live = q('[data-g="live"]'), overlay = q('.game-overlay');
  var ovTitle = q('[data-g="title"]'), ovText = q('[data-g="text"]'), startBtn = q('[data-g="start"]');

  var best = 0;
  try { best = parseInt(localStorage.getItem(STORE), 10) || 0; } catch (e) { best = 0; }

  /* ---------- State ---------- */
  var state = 'idle';            // idle, ready, flying, over
  var shots = SHOTS, score = 0, streak = 0, baskets = 0;
  var aim = { len: 0, ang: 0.82, dragging: false, keyPower: 0.55 };
  var ball = null, parts = [], floats = [], tm = 0, shake = 0;
  var robot = { x: 0, v: 0 };    // recoil kick of the whole robot (spring)
  var knob = { x: 0, v: 0 };     // plunger snap (spring)
  var basket = { baseX: 700, y: FLOOR - BH - 60, amp: 0, phase: 0, pop: 1, x: 700 };
  var endTimer = 0;
  var pad = { x: 0, on: false, sp: { x: 0, v: 0 } }; // snake spring: compression spring

  function setState(s) { state = s; canvas.dataset.state = s; }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function say(msg) { if (live) live.textContent = msg; }

  function updateHud() {
    if (elScore) elScore.textContent = score;
    if (elLeft) elLeft.textContent = shots;
    if (elBest) elBest.textContent = best;
  }

  function placeBasket(first) {
    basket.baseX = first ? 700 : rnd(420, W - BW - 70);
    basket.y = first ? FLOOR - BH - 60 : FLOOR - BH - rnd(10, 190);
    basket.amp = baskets >= 3 ? Math.min(130, (baskets - 2) * 32) : 0;
    basket.phase = rnd(0, TAU);
    basket.pop = first ? 1 : 0;
    pad.on = !first && baskets >= 2;
    if (pad.on) pad.x = rnd(300, Math.max(330, basket.baseX - basket.amp - 150));
    pad.sp.x = pad.on ? 1 : 0; pad.sp.v = 0;
    canvas.dataset.padX = pad.on ? Math.round(pad.x) : '';
    canvas.dataset.basketX = Math.round(basket.baseX);
    canvas.dataset.basketY = Math.round(basket.y);
  }
  function basketX() {
    var x = basket.baseX + Math.sin(tm * 1.35 + basket.phase) * basket.amp;
    return clamp(x, 360, W - BW - 14);
  }

  /* ---------- Game flow ---------- */
  function startGame() {
    shots = SHOTS; score = 0; streak = 0; baskets = 0;
    ball = null; parts = []; floats = []; aim.len = 0; aim.dragging = false;
    placeBasket(true);
    updateHud();
    overlay.hidden = true;
    setState('ready');
    say('Game started. ' + shots + ' launches. Drag back from the launcher and release, or use the arrow keys and space.');
    canvas.focus({ preventScroll: true });
  }

  function gameOver() {
    setState('over');
    var newBest = score > best;
    if (newBest) {
      best = score;
      try { localStorage.setItem(STORE, String(best)); } catch (e) { /* private mode: fine */ }
    }
    updateHud();
    ovTitle.textContent = newBest && score > 0 ? 'New best: ' + score : 'Final score: ' + score;
    ovText.textContent = newBest && score > 0
      ? 'That is your highest score on this device. Think you can beat it?'
      : 'Your best is ' + best + '. Pull the spring back and try again.';
    startBtn.textContent = 'Play again';
    overlay.hidden = false;
    say('Game over. Final score ' + score + '.');
    startBtn.focus({ preventScroll: true });
  }

  function dir() { return { x: Math.cos(aim.ang), y: -Math.sin(aim.ang) }; }
  function mouth() { var d = dir(); return { x: PIVOT.x + robot.x + d.x * 58, y: PIVOT.y + d.y * 58 }; }

  function fire() {
    if (state !== 'ready' || aim.len < 16) return false;
    var d = dir(), sp = aim.len * KV, m = mouth(), power = aim.len / MAXPULL;
    ball = { x: m.x, y: m.y, py: m.y, vx: d.x * sp, vy: d.y * sp, touched: false, scored: false, age: 0, rest: 0, scoredAt: 0, trail: [], bounces: 0 };
    shots--;
    setState('flying');
    robot.v = -power * 460;          // the whole robot kicks back...
    knob.x = aim.len * 0.55; knob.v = 0; // ...and the plunger snaps forward
    shake = reduce ? 0 : 0.2 * power;
    aim.len = 0; aim.dragging = false;
    updateHud();
    return true;
  }

  function endShot(scored) {
    ball = null;
    if (!scored) { streak = 0; say('Missed. ' + shots + (shots === 1 ? ' launch left.' : ' launches left.')); }
    if (shots <= 0) { setState('flying'); endTimer = 0.7; } else setState('ready');
  }

  function burst(x, y) {
    if (reduce) return;
    var cols = [COLORS.gold, COLORS.maroon, '#ffffff', COLORS.steel];
    for (var i = 0; i < 30; i++) {
      var a = rnd(-Math.PI, 0), s = rnd(120, 460);
      parts.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rnd(0.7, 1.3), size: rnd(4, 9), rot: rnd(0, TAU), vr: rnd(-8, 8), c: cols[i % cols.length] });
    }
  }

  function score_(bk) {
    var distBonus = Math.max(0, Math.round((bk.x + BW / 2 - PIVOT.x) / 40));
    var swish = !ball.touched;
    streak++;
    baskets++;
    var pts = 10 + distBonus + (swish ? 5 : 0) + (streak - 1) * 2;
    score += pts;
    ball.scored = true; ball.scoredAt = ball.age;
    floats.push({ text: '+' + pts + (swish ? ' Clean strike!' : ''), x: bk.x + BW / 2, y: bk.y - 10, life: 1.3 });
    burst(bk.x + BW / 2, bk.y + 8);
    updateHud();
    say('Into the basket! ' + pts + ' points. Score ' + score + '. ' + shots + (shots === 1 ? ' launch left.' : ' launches left.'));
  }

  /* ---------- Physics ---------- */
  function circleRect(b, rx, ry, rw, rh, rest) {
    var cx = clamp(b.x, rx, rx + rw), cy = clamp(b.y, ry, ry + rh);
    var dx = b.x - cx, dy = b.y - cy, d2 = dx * dx + dy * dy;
    if (d2 >= R * R) return false;
    var nx, ny, pen;
    if (d2 < 1e-6) { nx = 0; ny = -1; pen = R; }
    else { var d = Math.sqrt(d2); nx = dx / d; ny = dy / d; pen = R - d; }
    b.x += nx * pen; b.y += ny * pen;
    var vn = b.vx * nx + b.vy * ny;
    if (vn < 0) { b.vx -= (1 + rest) * vn * nx; b.vy -= (1 + rest) * vn * ny; }
    return true;
  }

  function stepBall(b, h) {
    b.py = b.y;
    b.vy += G * h; b.x += b.vx * h; b.y += b.vy * h; b.age += h;
    if (b.y + R > FLOOR) {
      b.y = FLOOR - R;
      if (Math.abs(b.vy) > 80) b.vy = -b.vy * 0.55; else b.vy = 0;
      b.vx *= 1 - Math.min(1, 2.4 * h);
    }
    if (b.x + R > W) { b.x = W - R; b.vx = -Math.abs(b.vx) * 0.5; }
    if (pad.on && b.vy > 0 && b.x > pad.x - PADW / 2 && b.x < pad.x + PADW / 2) {
      var top = FLOOR - PADH * (1 - 0.4 * pad.sp.x);
      if (b.y + R > top && b.y < top) {
        b.y = top - R;
        b.vy = -Math.min(1000, Math.max(700, Math.abs(b.vy) * 0.8 + 380));
        b.touched = true; b.bounces++; b.rest = 0;
        pad.sp.x = 1; pad.sp.v = 0;
        floats.push({ text: 'Boing!', x: pad.x, y: FLOOR - PADH - 24, life: 0.9 });
        if (!reduce) shake = 0.12;
        say('Bounced off a snake spring.');
      }
    }
    var bx = basket.x, hit = false;
    hit = circleRect(b, bx, basket.y, WALL, BH, 0.5) || hit;
    hit = circleRect(b, bx + BW - WALL, basket.y, WALL, BH, 0.5) || hit;
    hit = circleRect(b, bx, basket.y + BH - WALL, BW, WALL, 0.35) || hit;
    if (hit && !b.scored) b.touched = true;
    var lineY = basket.y + 12;
    if (!b.scored && b.vy > 0 && b.py < lineY && b.y >= lineY && b.x > bx + WALL && b.x < bx + BW - WALL) {
      score_({ x: bx, y: basket.y });
    }
    if (b.y + R >= FLOOR - 0.5 && Math.abs(b.vx) < 25) b.rest += h; else b.rest = 0;
  }

  function spring(s, k, c, h) { s.v += (-k * s.x - c * s.v) * h; s.x += s.v * h; }

  function update(dt) {
    tm += dt;
    var steps = Math.max(1, Math.ceil(dt / (1 / 120))), h = dt / steps;
    for (var i = 0; i < steps; i++) {
      spring(robot, 110, 9, h);
      spring(knob, 420, 15, h);
      spring(pad.sp, 300, 7, h);
      basket.x = basketX();
      if (ball) stepBall(ball, h);
    }
    if (ball && !ball.scored) { ball.trail.push({ x: ball.x, y: ball.y }); if (ball.trail.length > 14) ball.trail.shift(); }
    if (basket.pop < 1) basket.pop = Math.min(1, basket.pop + dt * 2.2);
    if (ball) {
      if (ball.scored && ball.age - ball.scoredAt > 0.9) endShot(true);
      else if (!ball.scored && (ball.rest > 0.7 || ball.x < -40 || ball.age > 9)) endShot(false);
    }
    if (endTimer > 0) { endTimer -= dt; if (endTimer <= 0) gameOver(); }
    for (var p = parts.length - 1; p >= 0; p--) {
      var a = parts[p]; a.life -= dt; a.vy += 900 * dt; a.x += a.vx * dt; a.y += a.vy * dt; a.rot += a.vr * dt;
      if (a.life <= 0) parts.splice(p, 1);
    }
    for (var f = floats.length - 1; f >= 0; f--) { floats[f].life -= dt; floats[f].y -= 38 * dt; if (floats[f].life <= 0) floats.splice(f, 1); }
    if (shake > 0) shake = Math.max(0, shake - dt);
    if (ball && ball.scored && ball.age - ball.scoredAt > 0.35 && basket.pop >= 1 && !ball.moved) { ball.moved = true; placeBasket(false); }
  }

  /* ---------- Drawing ---------- */
  function rr(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
  }

  function drawBackground() {
    var g = ctx.createLinearGradient(0, 0, 0, FLOOR);
    g.addColorStop(0, '#171a1f'); g.addColorStop(1, '#2a2f37');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.font = '900 250px "Big Shoulders Display", Impact, sans-serif';
    ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillText('RECOIL', W / 2, FLOOR - 70);
    ctx.restore();
    ctx.fillStyle = '#3a3f47'; ctx.fillRect(0, FLOOR, W, H - FLOOR);
    ctx.strokeStyle = 'rgba(255,255,255,0.09)'; ctx.lineWidth = 2;
    for (var x = 0; x <= W; x += 96) { ctx.beginPath(); ctx.moveTo(x, FLOOR); ctx.lineTo(x, H); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(0, FLOOR + 36); ctx.lineTo(W, FLOOR + 36); ctx.stroke();
    ctx.fillStyle = COLORS.maroon; ctx.fillRect(0, FLOOR, W, 6);
  }

  // The launcher spring is drawn as a snake body: maroon with gold scale marks. Compressing it makes the coils fatter.
  function snakeBody(pts, w) {
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.setLineDash([]);
    ctx.strokeStyle = COLORS.maroonDark; ctx.lineWidth = w + 3;
    ctx.beginPath(); pts.forEach(function (p, k) { k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.stroke();
    ctx.strokeStyle = COLORS.snake; ctx.lineWidth = w;
    ctx.beginPath(); pts.forEach(function (p, k) { k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.stroke();
    ctx.strokeStyle = COLORS.gold; ctx.lineWidth = Math.max(1.4, w * 0.28); ctx.setLineDash([2, w * 1.3]);
    ctx.beginPath(); pts.forEach(function (p, k) { k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.stroke();
    ctx.setLineDash([]);
  }
  function coilPoints(x1, y1, x2, y2, amp, coils) {
    var dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len, nx = -uy, ny = ux, pts = [], n = coils * 12;
    for (var i = 0; i <= n; i++) {
      var t = i / n, a = t * coils * TAU;
      pts.push([x1 + dx * t + nx * Math.sin(a) * amp + ux * (1 - Math.cos(a)) * amp * 0.5, y1 + dy * t + ny * Math.sin(a) * amp + uy * (1 - Math.cos(a)) * amp * 0.5]);
    }
    return pts;
  }
  // A viper head: wedge shape, eye, and a flicking tongue. (x, y) is the nose, ang is the facing direction.
  function viperHead(x, y, ang, size, tongue) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    if (tongue) {
      ctx.strokeStyle = '#ff5a6e'; ctx.lineWidth = 1.6; ctx.lineCap = 'round'; ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(size * 0.7, 0); ctx.lineTo(size * 1.0, -size * 0.25);
      ctx.moveTo(size * 0.7, 0); ctx.lineTo(size * 1.0, size * 0.25); ctx.stroke();
    }
    ctx.fillStyle = COLORS.snake; ctx.strokeStyle = COLORS.maroonDark; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-size * 0.45, -size * 0.62, -size * 1.25, -size * 0.55);
    ctx.lineTo(-size * 1.25, size * 0.55); ctx.quadraticCurveTo(-size * 0.45, size * 0.62, 0, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = COLORS.gold; ctx.beginPath(); ctx.arc(-size * 0.55, -size * 0.2, size * 0.2, 0, TAU); ctx.fill();
    ctx.fillStyle = COLORS.ink; ctx.beginPath(); ctx.ellipse(-size * 0.55, -size * 0.2, size * 0.07, size * 0.17, 0, 0, TAU); ctx.fill();
    ctx.restore();
  }

  function drawRobot() {
    var ox = robot.x, d = dir();
    // wheels and chassis
    ctx.fillStyle = '#12151a';
    ctx.beginPath(); ctx.arc(70 + ox, FLOOR - 15, 17, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(152 + ox, FLOOR - 15, 17, 0, TAU); ctx.fill();
    ctx.fillStyle = '#6b727c';
    ctx.beginPath(); ctx.arc(70 + ox, FLOOR - 15, 6, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(152 + ox, FLOOR - 15, 6, 0, TAU); ctx.fill();
    ctx.fillStyle = COLORS.maroonDark; rr(38 + ox, FLOOR - 62, 150, 34, 8); ctx.fill();
    ctx.fillStyle = COLORS.steel; rr(46 + ox, FLOOR - 66, 134, 8, 4); ctx.fill();
    ctx.fillStyle = '#f4f5f7'; ctx.font = '800 19px "Big Shoulders Display", Impact, sans-serif'; ctx.textAlign = 'right';
    ctx.fillText('16311', 178 + ox, FLOOR - 37);
    // mast
    ctx.fillStyle = '#6b727c'; ctx.fillRect(PIVOT.x - 7 + ox, PIVOT.y + 6, 14, FLOOR - 66 - PIVOT.y - 6);
    // launcher: spring and plunger behind the tube, tube on top
    var px = PIVOT.x + ox, py = PIVOT.y;
    var backX = px - d.x * 30, backY = py - d.y * 30;
    var pull = aim.dragging || aim.len > 0 ? aim.len * 0.55 : 0;
    var kx = backX - d.x * (pull + knob.x), ky = backY - d.y * (pull + knob.x);
    var squeeze = Math.min(1, Math.max(0, (pull + knob.x) / 80));
    snakeBody(coilPoints(backX, backY, kx, ky, 7 + squeeze * 4, 5), 5.5);
    ctx.fillStyle = COLORS.gold; ctx.beginPath(); ctx.arc(kx, ky, 7, 0, TAU); ctx.fill();
    ctx.strokeStyle = COLORS.maroonDark; ctx.lineWidth = 2; ctx.stroke();
    ctx.save(); ctx.translate(px, py); ctx.rotate(Math.atan2(d.y, d.x));
    ctx.fillStyle = '#d9dce1'; rr(-34, -13, 98, 26, 8); ctx.fill();
    ctx.fillStyle = COLORS.maroon; rr(-34, -13, 22, 26, 8); ctx.fill();
    ctx.fillStyle = '#12151a'; ctx.fillRect(58, -9, 6, 18);
    ctx.restore();
    ctx.beginPath(); ctx.fillStyle = '#12151a'; ctx.arc(px, py, 9, 0, TAU); ctx.fill();
    ctx.fillStyle = COLORS.steel; ctx.beginPath(); ctx.arc(px, py, 4, 0, TAU); ctx.fill();
  }

  // The projectile: a viper coiled tight like a spring, spinning in flight, tail streaming behind.
  function drawBall(x, y, vx, vy, trail) {
    var moving = !!trail, spin = moving ? tm * 16 : 0, face = moving ? Math.atan2(vy, vx) : -0.6;
    if (trail && trail.length > 2) {
      for (var i = 1; i < trail.length; i++) {
        var f = i / trail.length;
        ctx.strokeStyle = 'rgba(209,31,69,' + (0.1 + 0.55 * f) + ')'; ctx.lineWidth = 2 + 6 * f; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(trail[i - 1].x, trail[i - 1].y); ctx.lineTo(trail[i].x, trail[i].y); ctx.stroke();
      }
    }
    ctx.save(); ctx.translate(x, y); ctx.rotate(spin);
    var pts = [], turns = 2.1, n = 36;
    for (var k = 0; k <= n; k++) { var t = k / n, a = t * turns * TAU, r = 2.5 + (R - 5) * t; pts.push([Math.cos(a) * r, Math.sin(a) * r]); }
    snakeBody(pts, 4);
    ctx.restore();
    var e = pts[n], ca = Math.cos(spin), sa = Math.sin(spin);
    viperHead(x + e[0] * ca - e[1] * sa + Math.cos(face) * 3, y + e[0] * sa + e[1] * ca + Math.sin(face) * 3, face, 7, moving && Math.sin(tm * 28) > 0);
  }

  function drawBasket() {
    var x = basket.x, y = basket.y, s = basket.pop;
    var e = s < 1 ? 1 + Math.sin(s * Math.PI) * 0.12 - (1 - s) * 0.5 : 1;
    ctx.save();
    ctx.translate(x + BW / 2, y + BH); ctx.scale(e, e); ctx.translate(-(x + BW / 2), -(y + BH));
    // post
    ctx.fillStyle = '#5b626d'; ctx.fillRect(x + BW / 2 - 5, y + BH, 10, FLOOR - y - BH);
    // inside of the basket, with a viper watching from the back
    ctx.fillStyle = '#3a2a16'; ctx.fillRect(x + WALL, y + 4, BW - 2 * WALL, BH - WALL - 4);
    var peek = ball && ball.scored ? 16 : 0;
    ctx.save(); ctx.beginPath(); ctx.rect(x + WALL, y - 30, BW - 2 * WALL, BH + 30); ctx.clip();
    var hx = x + BW / 2 + 14, hy = y + 24 - peek - Math.sin(tm * 2.2 + basket.phase) * 3;
    snakeBody([[hx - 3, y + BH], [hx - 3, hy + 6], [hx, hy]], 7);
    viperHead(hx - 2, hy - 2, -Math.PI / 2 - 0.35, 8, Math.sin(tm * 6 + basket.phase) > 0.5);
    ctx.restore();
    // wicker walls: tan with a weave
    ctx.fillStyle = COLORS.wicker; ctx.fillRect(x, y, WALL, BH); ctx.fillRect(x + BW - WALL, y, WALL, BH); ctx.fillRect(x, y + BH - WALL, BW, WALL);
    ctx.strokeStyle = COLORS.wickerDark; ctx.lineWidth = 1.6;
    for (var wy = y + 6; wy < y + BH; wy += 9) {
      ctx.beginPath(); ctx.moveTo(x, wy); ctx.lineTo(x + WALL, wy + 5); ctx.moveTo(x + BW - WALL, wy); ctx.lineTo(x + BW, wy + 5); ctx.stroke();
    }
    for (var wx = x + 8; wx < x + BW - 4; wx += 11) { ctx.beginPath(); ctx.moveTo(wx, y + BH - WALL); ctx.lineTo(wx + 6, y + BH); ctx.stroke(); }
    // rims
    ctx.fillStyle = COLORS.maroon; rr(x - 5, y - 5, WALL + 10, 9, 4); ctx.fill(); rr(x + BW - WALL - 5, y - 5, WALL + 10, 9, 4); ctx.fill();
    ctx.restore();
  }

  // A snake spring pad: a snake coiled like a spring. Land on it and it launches the viper back up.
  function drawPad() {
    if (!pad.on) return;
    var c = pad.sp.x, h = PADH * (1 - 0.4 * c), x = pad.x;
    ctx.fillStyle = '#5b626d'; rr(x - PADW / 2, FLOOR - 7, PADW, 9, 4); ctx.fill();
    var bot = FLOOR - 7, topY = bot - h + 6;
    snakeBody(coilPoints(x, bot, x, topY, 20 + c * 4, 3), 7);
    viperHead(x + 20, topY - 4, -0.3 - c * 0.3, 9, Math.sin(tm * 5) > 0.6);
  }

  function drawTrajectory() {
    var d = dir(), m = mouth(), sp = aim.len * KV;
    var x = m.x, y = m.y, vx = d.x * sp, vy = d.y * sp, h = 1 / 60;
    for (var i = 0; i < 70; i++) {
      vy += G * h; x += vx * h; y += vy * h;
      if (y > FLOOR - R || x > W) break;
      if (i % 3 === 2) {
        ctx.globalAlpha = 0.85 * (1 - i / 70);
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 3.2, 0, TAU); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawHudText() {
    ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = '700 20px "Hanken Grotesk", system-ui, sans-serif';
    if (streak > 1 && state !== 'idle') { ctx.fillStyle = COLORS.gold; ctx.fillText('Streak x' + streak, 24, 36); }
    if ((aim.dragging || aim.len > 0) && state === 'ready') {
      ctx.fillStyle = '#fff';
      ctx.fillText('Power ' + Math.round(aim.len / MAXPULL * 100) + '%   Angle ' + Math.round(aim.ang * 180 / Math.PI) + '°', 24, 66);
    }
    if (basket.amp > 0 && state !== 'idle') { ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillText('Moving target', W - 24, 36); }
  }

  function draw() {
    ctx.save();
    if (shake > 0) ctx.translate((Math.random() - 0.5) * 12 * shake * 5, (Math.random() - 0.5) * 8 * shake * 5);
    drawBackground();
    drawBasket();
    drawPad();
    if (state === 'ready' && (aim.dragging || aim.len > 0)) drawTrajectory();
    drawRobot();
    if (state === 'ready') { var m = mouth(); drawBall(m.x, m.y); }
    if (ball) drawBall(ball.x, ball.y, ball.vx, ball.vy, ball.trail);
    parts.forEach(function (a) {
      ctx.save(); ctx.globalAlpha = Math.max(0, Math.min(1, a.life)); ctx.translate(a.x, a.y); ctx.rotate(a.rot);
      ctx.fillStyle = a.c; ctx.fillRect(-a.size / 2, -a.size / 2, a.size, a.size * 0.6); ctx.restore();
    });
    ctx.textAlign = 'center'; ctx.font = '900 34px "Big Shoulders Display", Impact, sans-serif';
    floats.forEach(function (f) { ctx.globalAlpha = Math.max(0, Math.min(1, f.life)); ctx.fillStyle = COLORS.gold; ctx.fillText(f.text, f.x, f.y); });
    ctx.globalAlpha = 1;
    drawHudText();
    ctx.restore();
  }

  /* ---------- Sizing ---------- */
  function resize() {
    var r = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (!r.width) return;
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.width * (H / W) * dpr);
    ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
  }
  window.addEventListener('resize', resize);

  /* ---------- Input: drag the spring back, or use the keyboard ---------- */
  function toWorld(e) {
    var r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
  }
  function aimFromPointer(e) {
    var p = toWorld(e), dx = PIVOT.x - p.x, dy = PIVOT.y - p.y;
    aim.len = Math.min(Math.hypot(dx, dy), MAXPULL);
    aim.ang = clamp(Math.atan2(-dy, Math.max(dx, 0.001)), -0.1, 1.5);
  }

  canvas.addEventListener('pointerdown', function (e) {
    if (state !== 'ready' || (e.pointerType === 'mouse' && e.button !== 0)) return;
    aim.dragging = true;
    canvas.setPointerCapture(e.pointerId);
    aimFromPointer(e);
    e.preventDefault();
  });
  canvas.addEventListener('pointermove', function (e) { if (aim.dragging) aimFromPointer(e); });
  function release() {
    if (!aim.dragging) return;
    aim.dragging = false;
    if (!fire()) aim.len = 0;
  }
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', function () { aim.dragging = false; aim.len = 0; });

  canvas.addEventListener('keydown', function (e) {
    if (state !== 'ready') return;
    var used = true;
    if (e.key === 'ArrowUp') aim.ang = clamp(aim.ang + 0.035, -0.1, 1.5);
    else if (e.key === 'ArrowDown') aim.ang = clamp(aim.ang - 0.035, -0.1, 1.5);
    else if (e.key === 'ArrowRight') aim.keyPower = clamp(aim.keyPower + 0.025, 0.15, 1);
    else if (e.key === 'ArrowLeft') aim.keyPower = clamp(aim.keyPower - 0.025, 0.15, 1);
    else if (e.key === ' ' || e.key === 'Enter') { if (aim.len < 16) aim.len = aim.keyPower * MAXPULL; fire(); e.preventDefault(); return; }
    else used = false;
    if (used) { aim.len = aim.keyPower * MAXPULL; e.preventDefault(); }
  });

  startBtn.addEventListener('click', startGame);

  /* ---------- Loop: only runs while the game is on screen ---------- */
  var raf = 0, last = 0, onScreen = false;
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (!last) last = now;
    var dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;
    update(dt);
    draw();
  }
  function sync() {
    var run = onScreen && document.visibilityState === 'visible';
    if (run && !raf) { last = 0; raf = requestAnimationFrame(frame); }
    if (!run && raf) { cancelAnimationFrame(raf); raf = 0; }
  }
  document.addEventListener('visibilitychange', sync);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { onScreen = es[0].isIntersecting; if (onScreen) resize(); sync(); }, { threshold: 0.05 }).observe(canvas);
  } else { onScreen = true; sync(); }

  setState('idle');
  placeBasket(true);
  updateHud();
  resize();
  draw();
  if (document.fonts && document.fonts.load) document.fonts.load('900 40px "Big Shoulders Display"');
})();
