// Code2.js — АВТОШКОЛА v6 (только мобилка / Hassle)
// - Точная запись и повтор без искусственных задержек
// - Поддержка джойстика <Gamepad>/leftStick
// - Непрерывный контроль координат каждый кадр
// - Остановка при критическом отклонении
(function () {
'use strict';

// ═══ ТОЧНЫЕ пути управления (БЕЗ пробелов) ═══
const KEY_MAP = {
  87:  { label: 'Газ (W)',        path: '<Keyboard>/w' },
  83:  { label: 'Тормоз (S)',     path: '<Keyboard>/s' },
  65:  { label: 'Влево (A)',      path: '<Keyboard>/a' },
  68:  { label: 'Вправо (D)',     path: '<Keyboard>/d' },
  32:  { label: 'Ручник (Space)', path: '<Keyboard>/space' },
  81:  { label: 'Пов.влево (Q)',  path: '<Keyboard>/q' },
  69:  { label: 'Пов.вправо (E)', path: '<Keyboard>/e' },
  72:  { label: 'Сигнал (H)',     path: '<Keyboard>/h' },
};

const JOYSTICK_PATH = '<Gamepad>/leftStick';
const JOY_CODE = 1000;

const RECORD_KEYS = new Set(Object.keys(KEY_MAP).map(Number));
const PATH_MAP = {};
Object.keys(KEY_MAP).forEach(function(code) {
  PATH_MAP[KEY_MAP[code].path] = Number(code);
});

const IGNORE_PATHS = [
  '<Mouse>/delta',
  '<Keyboard>/x',
  '<Keyboard>/u',
  '<Keyboard>/x<Mouse>2'
];

// Пороги контроля координат
const POS_LOG_INTERVAL    = 30;   // мс, запись позиций во время записи
const POS_WARN            = 1.0;  // предупреждение, метры
const POS_CRITICAL        = 3.0;  // немедленная остановка, метры
const POS_START_THRESHOLD = 1.0;
const ANGLE_START_THRESHOLD = 15;
const END_POS_THRESHOLD   = 5.0;
const ANGLE_END_THRESHOLD = 30;

const avto = {
  recording: false,
  replaying: false,
  events: [],
  lastRoute: null,
  startPerf: null,
  replayRAF: null,
  heldKeys: new Set(),
  joyActive: false,
  lastJoyX: 0,
  lastJoyY: 0,
  startSnapshot: null,
  endSnapshot: null,
  posLog: [],
  lastPosLog: [],
  posLogIntervalId: null,
};

// ═══════════════════════════════════════════════════════════
// ── Позиция / математика ─────────────────────────────────
// ═══════════════════════════════════════════════════════════
function _getSnapshot() {
  var pos = null;
  try {
    if (window.App && window.App.$store) {
      var raw = window.App.$store.getters['player/position'];
      if (raw && typeof raw.x === 'number' && typeof raw.y === 'number') {
        pos = { x: raw.x, y: raw.y, z: raw.z, angle: raw.angle };
      }
    }
  } catch (e) {}
  return { pos: pos };
}

function _fmtPos(pos) {
  if (!pos || typeof pos.x !== 'number') return '(нет)';
  return 'X:' + pos.x.toFixed(2) + ' Y:' + pos.y.toFixed(2) + ' Z:' + pos.z.toFixed(2);
}

function _posDistance(p1, p2) {
  if (!p1 || !p2) return 0;
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

function _angleDiff(a, b) {
  if (a == null || b == null) return null;
  var d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

function _expectedPosAt(timeMs, posLog) {
  if (!posLog.length) return null;
  if (timeMs <= posLog[0].t) return posLog[0].pos;
  if (timeMs >= posLog[posLog.length - 1].t) return posLog[posLog.length - 1].pos;

  var lo = 0, hi = posLog.length - 1;
  while (hi - lo > 1) {
    var mid = (lo + hi) >> 1;
    if (posLog[mid].t <= timeMs) lo = mid; else hi = mid;
  }

  var a = posLog[lo], b = posLog[hi];
  var dt = b.t - a.t;
  var f = dt > 0 ? (timeMs - a.t) / dt : 0;

  return {
    x: a.pos.x + (b.pos.x - a.pos.x) * f,
    y: a.pos.y + (b.pos.y - a.pos.y) * f,
    z: a.pos.z + (b.pos.z - a.pos.z) * f,
  };
}

// ═══════════════════════════════════════════════════════════
// ── Чат / лог ────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════
function _chat(coloredText) {
  if (typeof window.onChatMessage === 'function') {
    window.onChatMessage('{999999}АВТОШКОЛА — ' + coloredText, '999999FF');
  }
}

function debugLog(msg) {
  console.log(msg);
}

// ═══════════════════════════════════════════════════════════
// ── Оверлей ──────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════
var _hudOverlay = null, _hudOverlayMode = null;
var _KEY_LABELS = [
  [87,'⬆W'],[68,'▶D'],[65,'◀A'],[83,'⬇S'],
  [32,'🅿SP'],[81,'↩Q'],[69,'↪E'],[72,'📯H'],
  [JOY_CODE,'🕹']
];

function _createHudOverlay(mode) {
  _hudOverlayMode = mode;
  if (_hudOverlay) {
    _updateOverlayHeader(mode);
    return;
  }

  var wrap = document.createElement('div');
  wrap.id = 'avto-overlay';
  wrap.style.cssText = 'position:fixed;right:1.5vw;bottom:20vh;z-index:99999;display:flex;flex-direction:column;gap:2px;pointer-events:none;font-size:1.4vh;';

  var header = document.createElement('div');
  header.id = 'avto-hdr';
  _applyHeaderStyle(header, mode);
  wrap.appendChild(header);

  _KEY_LABELS.forEach(function(p) {
    var row = document.createElement('div');
    row.id = 'avto-k-' + p[0];
    row.textContent = p[1];
    row.style.cssText = 'padding:2px 6px;border-radius:3px;background:rgba(0,0,0,0.5);color:rgba(255,255,255,0.3);border:1px solid rgba(255,255,255,0.1);transition:all 0.05s;';
    wrap.appendChild(row);
  });

  document.body.appendChild(wrap);
  _hudOverlay = wrap;
}

function _applyHeaderStyle(el, mode) {
  el.textContent = mode === 'record' ? '🔴 ЗАПИСЬ' : '▶ ПОВТОР';
  el.style.cssText = 'padding:2px 6px;border-radius:3px;background:rgba(0,0,0,0.7);color:' +
    (mode === 'record' ? '#F44' : '#3D7') +
    ';border:1px solid ' + (mode === 'record' ? '#F44' : '#3D7') +
    ';font-weight:bold;text-align:center;';
}

function _updateOverlayHeader(mode) {
  var h = document.getElementById('avto-hdr');
  if (h) _applyHeaderStyle(h, mode);
}

function _removeHudOverlay() {
  if (_hudOverlay) {
    _hudOverlay.remove();
    _hudOverlay = null;
  }
}

function _overlaySetKey(code, down) {
  var el = document.getElementById('avto-k-' + code);
  if (!el) return;

  el.style.background = down
    ? (_hudOverlayMode === 'record' ? 'rgba(210,100,0,0.8)' : 'rgba(30,180,80,0.75)')
    : 'rgba(0,0,0,0.5)';

  el.style.color = down ? '#fff' : 'rgba(255,255,255,0.3)';

  el.style.borderColor = down
    ? (_hudOverlayMode === 'record' ? '#F80' : '#3D7')
    : 'rgba(255,255,255,0.1)';
}

function _overlayResetAll() {
  RECORD_KEYS.forEach(function(c) { _overlaySetKey(c, false); });
  _overlaySetKey(JOY_CODE, false);
}

// ═══════════════════════════════════════════════════════════
// ── Запись событий ───────────────────────────────────────
// ═══════════════════════════════════════════════════════════
function _recordDown(code) {
  if (!avto.recording || avto.startPerf == null) return;
  if (avto.heldKeys.has(code)) return;

  avto.heldKeys.add(code);

  var t = performance.now() - avto.startPerf;
  var snap = _getSnapshot();

  avto.events.push({ t: t, d: 1, k: code });

  if (snap.pos) {
    avto.posLog.push({
      t: t,
      pos: { x: snap.pos.x, y: snap.pos.y, z: snap.pos.z, angle: snap.pos.angle }
    });
  }

  _overlaySetKey(code, true);
  debugLog('[АВТОШКОЛА] ⬇ ' + KEY_MAP[code].label + ' @' + t.toFixed(2) + 'мс');
}

function _recordUp(code) {
  if (!avto.recording || avto.startPerf == null) return;
  if (!avto.heldKeys.has(code)) return;

  avto.heldKeys.delete(code);

  var t = performance.now() - avto.startPerf;
  var snap = _getSnapshot();

  avto.events.push({ t: t, d: 0, k: code });

  if (snap.pos) {
    avto.posLog.push({
      t: t,
      pos: { x: snap.pos.x, y: snap.pos.y, z: snap.pos.z, angle: snap.pos.angle }
    });
  }

  _overlaySetKey(code, false);
  debugLog('[АВТОШКОЛА] ⬆ ' + KEY_MAP[code].label + ' @' + t.toFixed(2) + 'мс');
}

function _recordJoyStart() {
  if (!avto.recording || avto.startPerf == null) return;
  if (avto.joyActive) return;

  avto.joyActive = true;

  var t = performance.now() - avto.startPerf;
  avto.events.push({ t: t, d: 10, k: JOY_CODE });

  var snap = _getSnapshot();
  if (snap.pos) {
    avto.posLog.push({
      t: t,
      pos: { x: snap.pos.x, y: snap.pos.y, z: snap.pos.z, angle: snap.pos.angle }
    });
  }

  _overlaySetKey(JOY_CODE, true);
  debugLog('[АВТОШКОЛА] 🕹 Джойстик START @' + t.toFixed(2) + 'мс');
}

function _recordJoyMove(x, y) {
  if (!avto.recording || avto.startPerf == null) return;
  if (!avto.joyActive) return;
  if (typeof x !== 'number' || typeof y !== 'number') return;

  if (x === avto.lastJoyX && y === avto.lastJoyY) return;

  avto.lastJoyX = x;
  avto.lastJoyY = y;

  var t = performance.now() - avto.startPerf;
  avto.events.push({ t: t, d: 11, k: JOY_CODE, x: x, y: y });
}

function _recordJoyEnd() {
  if (!avto.recording || avto.startPerf == null) return;
  if (!avto.joyActive) return;

  avto.joyActive = false;

  var t = performance.now() - avto.startPerf;
  avto.events.push({ t: t, d: 12, k: JOY_CODE });

  var snap = _getSnapshot();
  if (snap.pos) {
    avto.posLog.push({
      t: t,
      pos: { x: snap.pos.x, y: snap.pos.y, z: snap.pos.z, angle: snap.pos.angle }
    });
  }

  _overlaySetKey(JOY_CODE, false);
  avto.lastJoyX = 0;
  avto.lastJoyY = 0;

  debugLog('[АВТОШКОЛА] 🕹 Джойстик END @' + t.toFixed(2) + 'мс');
}

// ═══════════════════════════════════════════════════════════
// ── Управление записью ───────────────────────────────────
// ═══════════════════════════════════════════════════════════
function startRecording() {
  if (!window.App || !window.App.$store) {
    _chat('{EE4444}Нет App/Store');
    return;
  }

  if (!window.App.isMobile) {
    _chat('{EE4444}Только для мобилки');
    return;
  }

  if (window.App.engine === 'legacy') {
    _chat('{EE4444}Не для legacy движка');
    return;
  }

  if (window.App.developmentMode) {
    _chat('{FFAA00}⚠ developmentMode: управление может не работать');
  }

  if (typeof window.onScreenControlTouchStart !== 'function' ||
      typeof window.onScreenControlTouchEnd !== 'function') {
    _chat('{EE4444}Нет функций Touch управления');
    return;
  }

  if (typeof window.onScreenControlTouchMove !== 'function') {
    _chat('{FFAA00}⚠ Нет TouchMove — джойстик не будет записан');
  }

  if (avto.recording) {
    _chat('{FFAA00}Запись уже идёт');
    return;
  }

  if (avto.replaying) {
    _chat('{EE4444}Сначала дождись конца повтора');
    return;
  }

  avto.startSnapshot = _getSnapshot();

  if (!avto.startSnapshot.pos) {
    _chat('{EE4444}Позиция недоступна');
    return;
  }

  avto.recording = true;
  avto.events = [];
  avto.posLog = [];
  avto.startPerf = performance.now();
  avto.heldKeys.clear();
  avto.joyActive = false;
  avto.lastJoyX = 0;
  avto.lastJoyY = 0;
  avto.endSnapshot = null;

  avto.posLog.push({
    t: 0,
    pos: {
      x: avto.startSnapshot.pos.x,
      y: avto.startSnapshot.pos.y,
      z: avto.startSnapshot.pos.z,
      angle: avto.startSnapshot.pos.angle
    }
  });

  avto.posLogIntervalId = setInterval(function() {
    if (!avto.recording) return;

    var s = _getSnapshot();
    if (s.pos) {
      avto.posLog.push({
        t: performance.now() - avto.startPerf,
        pos: { x: s.pos.x, y: s.pos.y, z: s.pos.z, angle: s.pos.angle }
      });
    }
  }, POS_LOG_INTERVAL);

  _createHudOverlay('record');
  _overlayResetAll();

  _chat('{33DD77}🔴 Запись НАЧАТА [' + _fmtPos(avto.startSnapshot.pos) + ']');
  debugLog('[АВТОШКОЛА] Запись старт. Позиция: ' + _fmtPos(avto.startSnapshot.pos));
}

function stopRecording() {
  if (!avto.recording) {
    _chat('{EE4444}Запись не активна');
    return;
  }

  avto.recording = false;

  if (avto.posLogIntervalId) {
    clearInterval(avto.posLogIntervalId);
    avto.posLogIntervalId = null;
  }

  var stopT = performance.now() - avto.startPerf;

  avto.heldKeys.forEach(function(code) {
    var snap = _getSnapshot();

    avto.events.push({ t: stopT, d: 0, k: code });

    if (snap.pos) {
      avto.posLog.push({
        t: stopT,
        pos: { x: snap.pos.x, y: snap.pos.y, z: snap.pos.z, angle: snap.pos.angle }
      });
    }

    _overlaySetKey(code, false);
  });

  avto.heldKeys.clear();

  if (avto.joyActive) {
    avto.events.push({ t: stopT, d: 12, k: JOY_CODE });

    var joySnap = _getSnapshot();
    if (joySnap.pos) {
      avto.posLog.push({
        t: stopT,
        pos: { x: joySnap.pos.x, y: joySnap.pos.y, z: joySnap.pos.z, angle: joySnap.pos.angle }
      });
    }

    avto.joyActive = false;
    _overlaySetKey(JOY_CODE, false);
  }

  avto.events.push({ t: stopT, d: -1, k: -1 });

  var finalSnap = _getSnapshot();
  if (finalSnap.pos) {
    avto.posLog.push({
      t: stopT,
      pos: { x: finalSnap.pos.x, y: finalSnap.pos.y, z: finalSnap.pos.z, angle: finalSnap.pos.angle }
    });
  }

  avto.lastPosLog = avto.posLog.slice();
  avto.lastRoute = avto.events.slice();
  avto.endSnapshot = finalSnap;

  _removeHudOverlay();

  var totalSec = (stopT / 1000).toFixed(2);
  var realCount = avto.lastRoute.filter(function(ev) { return ev.k !== -1; }).length;

  _chat('{EE4444}⏹ Запись: ' + realCount + ' соб., ' + totalSec + 'с, ' + avto.lastPosLog.length + ' точек');
  _chat('{AAAAAA}🏁 Финиш: ' + _fmtPos(finalSnap.pos));
  debugLog('[АВТОШКОЛА] Запись стоп. Событий:' + realCount + ' PosLog:' + avto.posLog.length);
}

// ═══════════════════════════════════════════════════════════
// ── Повтор ───────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════
function replayRoute() {
  if (!window.App || !window.App.$store) {
    _chat('{EE4444}Нет App/Store');
    return;
  }

  if (!window.App.isMobile) {
    _chat('{EE4444}Только для мобилки');
    return;
  }

  if (window.App.engine === 'legacy') {
    _chat('{EE4444}Не для legacy движка');
    return;
  }

  if (window.App.developmentMode) {
    _chat('{FFAA00}⚠ developmentMode: управление может не работать');
  }

  if (typeof window.onScreenControlTouchStart !== 'function' ||
      typeof window.onScreenControlTouchEnd !== 'function') {
    _chat('{EE4444}Нет функций Touch управления');
    return;
  }

  if (avto.replaying) {
    _chat('{FFAA00}Повтор уже идёт');
    return;
  }

  if (avto.recording) {
    _chat('{EE4444}Сначала /arec_off');
    return;
  }

  if (!avto.lastRoute || !avto.lastRoute.length) {
    _chat('{EE4444}Нет маршрута. Сначала /arec_on');
    return;
  }

  var sc = _checkStartSnapshot();
  sc.msgs.forEach(function(p) { _chat(p); });

  if (!sc.ok) {
    _chat('{EE4444}Вернись на стартовую позицию и угол, затем /apov');
    return;
  }

  avto.replaying = true;
  avto.replayRAF = null;

  var events = avto.lastRoute;
  var posLog = avto.lastPosLog || [];
  var totalMs = events.length ? events[events.length - 1].t : 0;

  var hasJoy = events.some(function(ev) { return ev.k === JOY_CODE; });

  if (hasJoy && typeof window.onScreenControlTouchMove !== 'function') {
    _chat('{EE4444}Маршрут содержит джойстик, но нет TouchMove');
    return;
  }

  var method = hasJoy ? 'touch+joystick' : 'touch';

  _chat('{33DD77}▶ Повтор (' + (totalMs / 1000).toFixed(2) + 'с, ' + events.length + ' соб., ' + posLog.length + ' точек) | ' + method);
  debugLog('[АВТОШКОЛА] Повтор. Метод=' + method);

  _createHudOverlay('replay');
  _overlayResetAll();

  var startPerf = performance.now();
  var eventIndex = 0;
  var lastWarnTime = 0;

  function _execEvent(ev) {
    if (ev.k === JOY_CODE) {
      try {
        if (ev.d === 10) {
          window.onScreenControlTouchStart(JOYSTICK_PATH);
          _overlaySetKey(JOY_CODE, true);
        } else if (ev.d === 11) {
          if (typeof ev.x === 'number' && typeof ev.y === 'number') {
            window.onScreenControlTouchMove(JOYSTICK_PATH, ev.x, ev.y);
          }
        } else if (ev.d === 12) {
          window.onScreenControlTouchEnd(JOYSTICK_PATH);
          _overlaySetKey(JOY_CODE, false);
        }
      } catch (e) {
        debugLog('[АВТОШКОЛА] joy exec err: ' + e.message);
      }
      return;
    }

    var info = KEY_MAP[ev.k];
    if (!info) return;

    try {
      if (ev.d === 1) {
        window.onScreenControlTouchStart(info.path);
        _overlaySetKey(ev.k, true);
      } else if (ev.d === 0) {
        window.onScreenControlTouchEnd(info.path);
        _overlaySetKey(ev.k, false);
      }
    } catch (e) {
      debugLog('[АВТОШКОЛА] exec err: ' + e.message);
    }
  }

  function _finish() {
    avto.replaying = false;

    if (avto.replayRAF !== null) {
      cancelAnimationFrame(avto.replayRAF);
      avto.replayRAF = null;
    }

    _releaseAllInputs();
    _removeHudOverlay();

    var endMsgs = _checkEndSnapshot();
    endMsgs.forEach(function(p) { _chat(p); });

    _chat('{33DD77}✅ Повтор завершён');
  }

  function _failReplay(msg) {
    avto.replaying = false;

    if (avto.replayRAF !== null) {
      cancelAnimationFrame(avto.replayRAF);
      avto.replayRAF = null;
    }

    _releaseAllInputs();
    _removeHudOverlay();
    _chat(msg);
  }

  function _rafLoop() {
    if (!avto.replaying) {
      _releaseAllInputs();
      _removeHudOverlay();
      return;
    }

    var elapsed = performance.now() - startPerf;

    // 1. Выполняем все события без задержки
    while (eventIndex < events.length && events[eventIndex].t <= elapsed) {
      _execEvent(events[eventIndex]);
      eventIndex++;
    }

    // 2. Непрерывный контроль координат каждый кадр
    var curSnap = _getSnapshot();

    if (curSnap.pos) {
      var exp = _expectedPosAt(elapsed, posLog);

      if (exp) {
        var dist = _posDistance(curSnap.pos, exp);

        if (isFinite(dist)) {
          if (dist >= POS_CRITICAL) {
            _failReplay('{EE4444}❌ Сбой траектории! Δ' + dist.toFixed(2) + 'м @' + (elapsed / 1000).toFixed(2) + 'с');
            return;
          }

          var now = performance.now();

          if (dist >= POS_WARN && now - lastWarnTime > 2000) {
            _chat('{FFAA00}⚠ Отклонение ' + dist.toFixed(2) + 'м @' + (elapsed / 1000).toFixed(2) + 'с');
            lastWarnTime = now;
          }
        }
      }
    }

    // 3. Завершение
    if (eventIndex >= events.length && elapsed >= totalMs) {
      _finish();
      return;
    }

    if (elapsed > totalMs + 1000) {
      _failReplay('{EE4444}❌ Таймаут повтора');
      return;
    }

    avto.replayRAF = requestAnimationFrame(_rafLoop);
  }

  avto.replayRAF = requestAnimationFrame(_rafLoop);
}

function cancelReplay() {
  if (!avto.replaying) return;

  if (avto.replayRAF !== null) {
    cancelAnimationFrame(avto.replayRAF);
    avto.replayRAF = null;
  }

  avto.replaying = false;
  _releaseAllInputs();
  _removeHudOverlay();
  _chat('{FFAA00}⏹ Повтор отменён');
}

// ═══════════════════════════════════════════════════════════
// ── Проверки позиций ─────────────────────────────────────
// ═══════════════════════════════════════════════════════════
function _checkStartSnapshot() {
  var snap = avto.startSnapshot;
  var current = _getSnapshot();
  var msgs = [];
  var ok = true;

  if (!snap || !snap.pos || !current.pos) {
    return { ok: false, msgs: ['{EE4444}Нет данных о позиции'] };
  }

  var d = _posDistance(current.pos, snap.pos);

  if (d > POS_START_THRESHOLD) {
    msgs.push('{EE4444}❌ Старт НЕ совпадает! Δ' + d.toFixed(2) + 'м');
    ok = false;
  } else {
    msgs.push('{33DD77}✅ Старт OK: ' + _fmtPos(current.pos));
  }

  var da = _angleDiff(current.pos.angle, snap.pos.angle);

  if (da !== null && da > ANGLE_START_THRESHOLD) {
    msgs.push('{EE4444}❌ Угол Δ' + da.toFixed(1) + '°');
    ok = false;
  } else if (da !== null) {
    msgs.push('{33DD77}✅ Угол OK');
  }

  return { ok: ok, msgs: msgs };
}

function _checkEndSnapshot() {
  var endSnap = avto.endSnapshot;

  if (!endSnap || !endSnap.pos) {
    return ['{FFAA00}⚠ Нет данных финиша'];
  }

  var current = _getSnapshot();

  if (!current.pos) {
    return ['{FFAA00}⚠ Позиция недоступна'];
  }

  var d = _posDistance(current.pos, endSnap.pos);
  var da = _angleDiff(current.pos.angle, endSnap.pos.angle);

  if (d > END_POS_THRESHOLD || (da !== null && da > ANGLE_END_THRESHOLD)) {
    return ['{EE4444}❌ Финиш НЕ совпал! Δ' + d.toFixed(2) + 'м' + (da !== null ? ', угол Δ' + da.toFixed(1) + '°' : '')];
  }

  return ['{33DD77}✅ Финиш OK: ' + _fmtPos(current.pos)];
}

// ═══════════════════════════════════════════════════════════
// ── Освобождение всех вводов ─────────────────────────────
// ═══════════════════════════════════════════════════════════
function _releaseAllInputs() {
  if (typeof window.onScreenControlTouchEnd !== 'function') return;

  RECORD_KEYS.forEach(function(code) {
    var info = KEY_MAP[code];
    if (!info) return;

    try {
      window.onScreenControlTouchEnd(info.path);
    } catch (e) {}
  });

  try {
    window.onScreenControlTouchEnd(JOYSTICK_PATH);
  } catch (e) {}
}

// ═══════════════════════════════════════════════════════════
// ── Хуки на управление ───────────────────────────────────
// ═══════════════════════════════════════════════════════════
(function hookTouchControls() {
  var _origStart = window.onScreenControlTouchStart;

  window.onScreenControlTouchStart = function(path) {
    if (avto.recording) {
      if (path === JOYSTICK_PATH) {
        _recordJoyStart();
      } else {
        var code = PATH_MAP[path];

        if (code !== undefined && !avto.heldKeys.has(code)) {
          _recordDown(code);
        } else if (code === undefined && IGNORE_PATHS.indexOf(path) === -1 && path.indexOf('<Mouse>/') !== 0) {
          debugLog('[АВТОШКОЛА] Неизвестный путь нажатия: ' + path);
        }
      }
    }

    if (typeof _origStart === 'function') {
      return _origStart.apply(this, arguments);
    }
  };

  var _origEnd = window.onScreenControlTouchEnd;

  window.onScreenControlTouchEnd = function(path) {
    if (avto.recording) {
      if (path === JOYSTICK_PATH) {
        _recordJoyEnd();
      } else {
        var code = PATH_MAP[path];

        if (code !== undefined && avto.heldKeys.has(code)) {
          _recordUp(code);
        }
      }
    }

    if (typeof _origEnd === 'function') {
      return _origEnd.apply(this, arguments);
    }
  };

  var _origMove = window.onScreenControlTouchMove;

  window.onScreenControlTouchMove = function(path, x, y) {
    if (avto.recording && path === JOYSTICK_PATH) {
      _recordJoyMove(x, y);
    }

    if (typeof _origMove === 'function') {
      return _origMove.apply(this, arguments);
    }
  };
})();

// ═══════════════════════════════════════════════════════════
// ── Хук на команды чата ──────────────────────────────────
// ═══════════════════════════════════════════════════════════
(function hookSendChatInput() {
  var _orig = window.sendChatInput;

  window.sendChatInput = function(cmd) {
    if (typeof cmd === 'string') {
      var t = cmd.trim().toLowerCase();

      if (t === '/arec_on')  { startRecording(); return; }
      if (t === '/arec_off') { stopRecording();  return; }
      if (t === '/apov')     { replayRoute();    return; }
      if (t === '/apov_off') { cancelReplay();   return; }
    }

    if (typeof _orig === 'function') {
      return _orig.apply(this, arguments);
    }
  };
})();

_chat('{AAAAAA}v6 загружен | Точный повтор + джойстик + контроль координат');
debugLog('[АВТОШКОЛА v6] Загружен. Команды: /arec_on /arec_off /apov /apov_off');

})();
