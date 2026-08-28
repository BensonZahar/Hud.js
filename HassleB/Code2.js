// Code2.js — АВТОШКОЛА v7 (только мобилка / Hassle)
// - Запись и повтор: кнопки, джойстик, камера
// - Камера: <Mouse>/delta
// - Джойстик: <Gamepad>/leftStick
// - Позиция: UpdatePlayerPosition + резервный интервал
// - Контроль траектории: предупреждения, остановка только при сильном отклонении
(function () {
'use strict';

// ═══ Пути управления ТС ═══
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
const CAMERA_PATH   = '<Mouse>/delta';

const JOY_CODE    = 1000;
const CAMERA_CODE = 1001;

const RECORD_KEYS = new Set(Object.keys(KEY_MAP).map(Number));

const PATH_MAP = {};
Object.keys(KEY_MAP).forEach(function(code) {
  PATH_MAP[KEY_MAP[code].path] = Number(code);
});

// Голос/рация/мегафон не пишем
const IGNORE_PATHS = [
  '<Keyboard>/x',
  '<Keyboard>/u',
  '<Keyboard>/x<Mouse>2'
];

// ═══ Пороги ═══
const POS_LOG_INTERVAL    = 50;    // резервная запись позиции
const POS_WARN            = 1.5;   // предупреждение, метры
const POS_CRITICAL        = 50.0;  // остановка только если реально улетел далеко
const POS_START_THRESHOLD = 2.0;   // допуск старта
const ANGLE_START_THRESHOLD = 20;  // допуск угла старта
const END_POS_THRESHOLD   = 10.0;  // допуск финиша
const ANGLE_END_THRESHOLD = 45;    // допуск угла финиша

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

  camActive: false,

  startSnapshot: null,
  endSnapshot: null,

  posLog: [],
  lastPosLog: [],
  posLogIntervalId: null,
};

let _posUpdateClear = null;

// ═══════════════════════════════════════════════════════════
// ── Позиция / математика ─────────────────────────────────
// ═══════════════════════════════════════════════════════════
function _getSnapshot() {
  let pos = null;

  try {
    if (window.App && window.App.$store) {
      const raw = window.App.$store.getters['player/position'];
      if (raw && typeof raw.x === 'number' && typeof raw.y === 'number') {
        pos = {
          x: raw.x,
          y: raw.y,
          z: raw.z,
          angle: raw.angle
        };
      }
    }
  } catch (e) {}

  return { pos };
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
  let d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

function _expectedPosAt(timeMs, posLog) {
  if (!posLog.length) return null;
  if (timeMs <= posLog[0].t) return posLog[0].pos;
  if (timeMs >= posLog[posLog.length - 1].t) return posLog[posLog.length - 1].pos;

  let lo = 0;
  let hi = posLog.length - 1;

  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (posLog[mid].t <= timeMs) lo = mid;
    else hi = mid;
  }

  const a = posLog[lo];
  const b = posLog[hi];
  const dt = b.t - a.t;
  const f = dt > 0 ? (timeMs - a.t) / dt : 0;

  return {
    x: a.pos.x + (b.pos.x - a.pos.x) * f,
    y: a.pos.y + (b.pos.y - a.pos.y) * f,
    z: a.pos.z + (b.pos.z - a.pos.z) * f,
  };
}

// ═══════════════════════════════════════════════════════════
// ── Подписка на UpdatePlayerPosition ─────────────────────
// ═══════════════════════════════════════════════════════════
function _subscribePosUpdates() {
  if (!window.engine || typeof window.engine.on !== 'function') return;

  const handle = window.engine.on('UpdatePlayerPosition', function(x, y, z, angle, interior) {
    if (!avto.recording) return;

    avto.posLog.push({
      t: performance.now() - avto.startPerf,
      pos: { x: x, y: y, z: z, angle: angle }
    });
  });

  if (handle && typeof handle.clear === 'function') {
    _posUpdateClear = handle.clear;
  }
}

function _unsubscribePosUpdates() {
  if (_posUpdateClear) {
    try { _posUpdateClear(); } catch (e) {}
    _posUpdateClear = null;
  }
}

// ═══════════════════════════════════════════════════════════
// ── Чат / лог / оверлей ──────────────────────────────────
// ═══════════════════════════════════════════════════════════
function _chat(coloredText) {
  if (typeof window.onChatMessage === 'function') {
    window.onChatMessage('{999999}АВТОШКОЛА — ' + coloredText, '999999FF');
  }
}

function debugLog(msg) {
  console.log(msg);
}

let _hudOverlay = null;
let _hudOverlayMode = null;

const _KEY_LABELS = [
  [87, '⬆W'],
  [68, '▶D'],
  [65, '◀A'],
  [83, '⬇S'],
  [32, '🅿SP'],
  [81, '↩Q'],
  [69, '↪E'],
  [72, '📯H'],
  [JOY_CODE, '🕹'],
  [CAMERA_CODE, '🎥']
];

function _createHudOverlay(mode) {
  _hudOverlayMode = mode;

  if (_hudOverlay) {
    _updateOverlayHeader(mode);
    return;
  }

  const wrap = document.createElement('div');
  wrap.id = 'avto-overlay';
  wrap.style.cssText = 'position:fixed;right:1.5vw;bottom:20vh;z-index:99999;display:flex;flex-direction:column;gap:2px;pointer-events:none;font-size:1.4vh;';

  const header = document.createElement('div');
  header.id = 'avto-hdr';
  _applyHeaderStyle(header, mode);
  wrap.appendChild(header);

  _KEY_LABELS.forEach(function(p) {
    const row = document.createElement('div');
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
  const h = document.getElementById('avto-hdr');
  if (h) _applyHeaderStyle(h, mode);
}

function _removeHudOverlay() {
  if (_hudOverlay) {
    _hudOverlay.remove();
    _hudOverlay = null;
  }
}

function _overlaySetKey(code, down) {
  const el = document.getElementById('avto-k-' + code);
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
  _overlaySetKey(CAMERA_CODE, false);
}

// ═══════════════════════════════════════════════════════════
// ── Запись: кнопки ───────────────────────────────────────
// ═══════════════════════════════════════════════════════════
function _recordDown(code) {
  if (!avto.recording || avto.startPerf == null) return;
  if (avto.heldKeys.has(code)) return;

  avto.heldKeys.add(code);

  const t = performance.now() - avto.startPerf;
  const snap = _getSnapshot();

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

  const t = performance.now() - avto.startPerf;
  const snap = _getSnapshot();

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

// ═══════════════════════════════════════════════════════════
// ── Запись: джойстик ─────────────────────────────────────
// ═══════════════════════════════════════════════════════════
function _recordJoyStart() {
  if (!avto.recording || avto.startPerf == null) return;
  if (avto.joyActive) return;

  avto.joyActive = true;

  const t = performance.now() - avto.startPerf;

  avto.events.push({ t: t, d: 10, k: JOY_CODE });

  const snap = _getSnapshot();
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

  const t = performance.now() - avto.startPerf;
  avto.events.push({ t: t, d: 11, k: JOY_CODE, x: x, y: y });
}

function _recordJoyEnd() {
  if (!avto.recording || avto.startPerf == null) return;
  if (!avto.joyActive) return;

  avto.joyActive = false;

  const t = performance.now() - avto.startPerf;

  avto.events.push({ t: t, d: 12, k: JOY_CODE });

  const snap = _getSnapshot();
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
// ── Запись: камера ───────────────────────────────────────
// ═══════════════════════════════════════════════════════════
function _recordCamStart() {
  if (!avto.recording || avto.startPerf == null) return;
  if (avto.camActive) return;

  avto.camActive = true;

  const t = performance.now() - avto.startPerf;
  avto.events.push({ t: t, d: 20, k: CAMERA_CODE });

  _overlaySetKey(CAMERA_CODE, true);
  debugLog('[АВТОШКОЛА] 🎥 Камера START @' + t.toFixed(2) + 'мс');
}

function _recordCamMove(x, y) {
  if (!avto.recording || avto.startPerf == null) return;
  if (!avto.camActive) return;
  if (typeof x !== 'number' || typeof y !== 'number') return;

  // Нулевые сдвиги камеры не нужны
  if (x === 0 && y === 0) return;

  const t = performance.now() - avto.startPerf;
  avto.events.push({ t: t, d: 21, k: CAMERA_CODE, x: x, y: y });
}

function _recordCamEnd() {
  if (!avto.recording || avto.startPerf == null) return;
  if (!avto.camActive) return;

  avto.camActive = false;

  const t = performance.now() - avto.startPerf;
  avto.events.push({ t: t, d: 22, k: CAMERA_CODE });

  _overlaySetKey(CAMERA_CODE, false);
  debugLog('[АВТОШКОЛА] 🎥 Камера END @' + t.toFixed(2) + 'мс');
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
    _chat('{FFAA00}⚠ Нет TouchMove — джойстик/камера не будут записаны');
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

  avto.camActive = false;

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

  _subscribePosUpdates();

  avto.posLogIntervalId = setInterval(function() {
    if (!avto.recording) return;

    const s = _getSnapshot();
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

  _unsubscribePosUpdates();

  if (avto.posLogIntervalId) {
    clearInterval(avto.posLogIntervalId);
    avto.posLogIntervalId = null;
  }

  const stopT = performance.now() - avto.startPerf;

  // Отпускаем зажатые кнопки
  avto.heldKeys.forEach(function(code) {
    avto.events.push({ t: stopT, d: 0, k: code });
    _overlaySetKey(code, false);
  });
  avto.heldKeys.clear();

  // Отпускаем джойстик
  if (avto.joyActive) {
    avto.events.push({ t: stopT, d: 12, k: JOY_CODE });
    avto.joyActive = false;
    _overlaySetKey(JOY_CODE, false);
  }

  // Отпускаем камеру
  if (avto.camActive) {
    avto.events.push({ t: stopT, d: 22, k: CAMERA_CODE });
    avto.camActive = false;
    _overlaySetKey(CAMERA_CODE, false);
  }

  // Маркер конца
  avto.events.push({ t: stopT, d: -1, k: -1 });

  const finalSnap = _getSnapshot();
  if (finalSnap.pos) {
    avto.posLog.push({
      t: stopT,
      pos: {
        x: finalSnap.pos.x,
        y: finalSnap.pos.y,
        z: finalSnap.pos.z,
        angle: finalSnap.pos.angle
      }
    });
  }

  avto.lastPosLog = avto.posLog.slice();
  avto.lastRoute = avto.events.slice();
  avto.endSnapshot = finalSnap;

  _removeHudOverlay();

  const totalSec = (stopT / 1000).toFixed(2);
  const realCount = avto.lastRoute.filter(function(ev) { return ev.k !== -1; }).length;

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

  const sc = _checkStartSnapshot();
  sc.msgs.forEach(function(p) { _chat(p); });

  if (!sc.ok) {
    _chat('{EE4444}Вернись на стартовую позицию и угол, затем /apov');
    return;
  }

  avto.replaying = true;
  avto.replayRAF = null;

  const events = avto.lastRoute;
  const posLog = avto.lastPosLog || [];
  const totalMs = events.length ? events[events.length - 1].t : 0;

  const hasJoy = events.some(function(ev) { return ev.k === JOY_CODE; });
  const hasCam = events.some(function(ev) { return ev.k === CAMERA_CODE; });

  if ((hasJoy || hasCam) && typeof window.onScreenControlTouchMove !== 'function') {
    _chat('{EE4444}Маршрут содержит джойстик/камеру, но нет TouchMove');
    return;
  }

  let method = 'touch';
  if (hasJoy) method += '+joy';
  if (hasCam) method += '+cam';

  _chat('{33DD77}▶ Повтор (' + (totalMs / 1000).toFixed(2) + 'с, ' + events.length + ' соб., ' + posLog.length + ' точек) | ' + method);
  debugLog('[АВТОШКОЛА] Повтор. Метод=' + method);

  _createHudOverlay('replay');
  _overlayResetAll();

  const startPerf = performance.now();
  let eventIndex = 0;
  let lastWarnTime = 0;

  function _execEvent(ev) {
    // Джойстик
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

    // Камера
    if (ev.k === CAMERA_CODE) {
      try {
        if (ev.d === 20) {
          window.onScreenControlTouchStart(CAMERA_PATH);
          _overlaySetKey(CAMERA_CODE, true);
        } else if (ev.d === 21) {
          if (typeof ev.x === 'number' && typeof ev.y === 'number') {
            window.onScreenControlTouchMove(CAMERA_PATH, ev.x, ev.y);
          }
        } else if (ev.d === 22) {
          window.onScreenControlTouchEnd(CAMERA_PATH);
          _overlaySetKey(CAMERA_CODE, false);
        }
      } catch (e) {
        debugLog('[АВТОШКОЛА] cam exec err: ' + e.message);
      }
      return;
    }

    // Кнопки
    const info = KEY_MAP[ev.k];
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

    const endMsgs = _checkEndSnapshot();
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

    const elapsed = performance.now() - startPerf;

    // 1. Выполняем все события без искусственной задержки
    while (eventIndex < events.length && events[eventIndex].t <= elapsed) {
      _execEvent(events[eventIndex]);
      eventIndex++;
    }

    // 2. Постоянный контроль координат
    const curSnap = _getSnapshot();

    if (curSnap.pos) {
      const exp = _expectedPosAt(elapsed, posLog);

      if (exp) {
        const dist = _posDistance(curSnap.pos, exp);

        if (isFinite(dist)) {
          if (dist >= POS_CRITICAL) {
            _failReplay('{EE4444}❌ Критический сбой траектории! Δ' + dist.toFixed(2) + 'м @' + (elapsed / 1000).toFixed(2) + 'с');
            return;
          }

          const now = performance.now();

          if (dist >= POS_WARN && now - lastWarnTime > 1000) {
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

    if (elapsed > totalMs + 2000) {
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
  const snap = avto.startSnapshot;
  const current = _getSnapshot();
  const msgs = [];
  let ok = true;

  if (!snap || !snap.pos || !current.pos) {
    return { ok: false, msgs: ['{EE4444}Нет данных о позиции'] };
  }

  const d = _posDistance(current.pos, snap.pos);

  if (d > POS_START_THRESHOLD) {
    msgs.push('{EE4444}❌ Старт НЕ совпадает! Δ' + d.toFixed(2) + 'м');
    ok = false;
  } else {
    msgs.push('{33DD77}✅ Старт OK: ' + _fmtPos(current.pos));
  }

  const da = _angleDiff(current.pos.angle, snap.pos.angle);

  if (da !== null && da > ANGLE_START_THRESHOLD) {
    msgs.push('{EE4444}❌ Угол Δ' + da.toFixed(1) + '°');
    ok = false;
  } else if (da !== null) {
    msgs.push('{33DD77}✅ Угол OK');
  }

  return { ok: ok, msgs: msgs };
}

function _checkEndSnapshot() {
  const endSnap = avto.endSnapshot;

  if (!endSnap || !endSnap.pos) {
    return ['{FFAA00}⚠ Нет данных финиша'];
  }

  const current = _getSnapshot();

  if (!current.pos) {
    return ['{FFAA00}⚠ Позиция недоступна'];
  }

  const d = _posDistance(current.pos, endSnap.pos);
  const da = _angleDiff(current.pos.angle, endSnap.pos.angle);

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
    const info = KEY_MAP[code];
    if (!info) return;

    try {
      window.onScreenControlTouchEnd(info.path);
    } catch (e) {}
  });

  try {
    window.onScreenControlTouchEnd(JOYSTICK_PATH);
  } catch (e) {}

  try {
    window.onScreenControlTouchEnd(CAMERA_PATH);
  } catch (e) {}
}

// ═══════════════════════════════════════════════════════════
// ── Хуки на управление ───────────────────────────────────
// ═══════════════════════════════════════════════════════════
(function hookTouchControls() {
  const _origStart = window.onScreenControlTouchStart;

  window.onScreenControlTouchStart = function(path) {
    if (avto.recording) {
      if (path === JOYSTICK_PATH) {
        _recordJoyStart();
      } else if (path === CAMERA_PATH) {
        _recordCamStart();
      } else {
        const code = PATH_MAP[path];

        if (code !== undefined && !avto.heldKeys.has(code)) {
          _recordDown(code);
        } else if (code === undefined && IGNORE_PATHS.indexOf(path) === -1) {
          debugLog('[АВТОШКОЛА] Неизвестный путь нажатия: ' + path);
        }
      }
    }

    if (typeof _origStart === 'function') {
      return _origStart.apply(this, arguments);
    }
  };

  const _origEnd = window.onScreenControlTouchEnd;

  window.onScreenControlTouchEnd = function(path) {
    if (avto.recording) {
      if (path === JOYSTICK_PATH) {
        _recordJoyEnd();
      } else if (path === CAMERA_PATH) {
        _recordCamEnd();
      } else {
        const code = PATH_MAP[path];

        if (code !== undefined && avto.heldKeys.has(code)) {
          _recordUp(code);
        }
      }
    }

    if (typeof _origEnd === 'function') {
      return _origEnd.apply(this, arguments);
    }
  };

  const _origMove = window.onScreenControlTouchMove;

  window.onScreenControlTouchMove = function(path, x, y) {
    if (avto.recording) {
      if (path === JOYSTICK_PATH) {
        _recordJoyMove(x, y);
      } else if (path === CAMERA_PATH) {
        _recordCamMove(x, y);
      }
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
  const _orig = window.sendChatInput;

  window.sendChatInput = function(cmd) {
    if (typeof cmd === 'string') {
      const t = cmd.trim().toLowerCase();

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

_chat('{AAAAAA}v7 загружен | ТС + джойстик + камера | /arec_on /arec_off /apov /apov_off');
debugLog('[АВТОШКОЛА v7] Загружен. Камера: ' + CAMERA_PATH + ', джойстик: ' + JOYSTICK_PATH);

})();
