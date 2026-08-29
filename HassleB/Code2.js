// Code2.js — АВТОШКОЛА v7 — HASSLE MOBILE
// ════════════════════════════════════════════════════════════════════
// Новое в v7 (изучено из index.js / Hud.js):
//
// 1. ДЖОЙСТИК ЗАПИСЫВАЕТСЯ — хук onScreenControlTouchMove для
//    <Gamepad>/leftStick (X=руль, Y=газ/тормоз)
//
// 2. СТРЕЛКИ ЗАПИСЫВАЮТСЯ — Arrow 37/38/39/40 через keyboard-хук
//    sendChatInput/sendClientEvent перехватывает сервер-путь,
//    поэтому воспроизводим через onKeyDown/Up напрямую
//
// 3. Z-координата теперь включена в снимок позиции (_getPos)
//
// 4. onScreenControlTouchStart(path, t=false) — используем t=false
//    (default) чтобы идти через engine.trigger, не sendClientEvent
//
// 5. Двойное нажатие не происходит: хук проверяет heldKeys и
//    joystickActive, клавиатурный listener не мешает мобильным кнопкам
//
// Типы событий в avto.events:
//   { t, d:1, k:code }            — кнопка нажата  (code ≥ 0)
//   { t, d:0, k:code }            — кнопка отпущена
//   { t, d:1, k:-2 }              — джойстик: TouchStart
//   { t, d:0, k:-2 }              — джойстик: TouchEnd
//   { t, d:2, k:-2, x:f, y:f }   — джойстик: TouchMove (x/y = -1..1)
//   { t, d:-1, k:-1 }             — маркер конца записи
// ════════════════════════════════════════════════════════════════════

(function () {
'use strict';

// ── Карта клавиш (кнопки + стрелки) ─────────────────────────────────
const KEY_MAP = {
    // WASD — газ/тормоз/руль (мобильные кнопки, path = onScreenControlTouchStart)
    87: { label: 'Газ (W)',        path: '<Keyboard>/w',          type: 'touch' },
    83: { label: 'Тормоз (S)',     path: '<Keyboard>/s',          type: 'touch' },
    65: { label: 'Влево (A)',      path: '<Keyboard>/a',          type: 'touch' },
    68: { label: 'Вправо (D)',     path: '<Keyboard>/d',          type: 'touch' },
    32: { label: 'Ручник (Space)', path: '<Keyboard>/space',      type: 'touch' },
    81: { label: 'Пов.лев (Q)',    path: '<Keyboard>/q',          type: 'touch' },
    69: { label: 'Пов.прав (E)',   path: '<Keyboard>/e',          type: 'touch' },
    72: { label: 'Сигнал (H)',     path: '<Keyboard>/h',          type: 'touch' },

    // Стрелки — идут через sendClientEvent/onKeyDown (серверный путь)
    37: { label: 'Стрелка ←',     path: null,                    type: 'key'   },
    38: { label: 'Стрелка ↑',     path: null,                    type: 'key'   },
    39: { label: 'Стрелка →',     path: null,                    type: 'key'   },
    40: { label: 'Стрелка ↓',     path: null,                    type: 'key'   },
};
const RECORD_KEYS  = new Set(Object.keys(KEY_MAP).map(Number));
const PATH_MAP     = {};   // path → keyCode (только touch-кнопки)
Object.keys(KEY_MAP).forEach(code => {
    var info = KEY_MAP[code];
    if (info.path) PATH_MAP[info.path] = Number(code);
});

const JOYSTICK_PATH = '<Gamepad>/leftStick';
const JOYSTICK_CODE = -2;  // специальный код для джойстика в events[]

// ── Пороги ───────────────────────────────────────────────────────────
const POS_LOG_INTERVAL       = 100;   // мс (было 500)
const POS_DRIFT_WARN         = 3;     // м
const POS_DRIFT_CRITICAL     = 8;     // м
const RT_OVERLAY_THRESHOLD   = 0.2;   // м — обновление оверлея
const RT_CHAT_THRESHOLD      = 0.5;   // м — сообщение в чат
const RT_CHAT_COOLDOWN       = 500;   // мс между сообщениями
const RT_JUMP_THRESHOLD      = 2.0;   // м — резкий прыжок
const JOY_DELTA_THRESHOLD    = 0.01;  // мин. изменение джойстика для записи
const POS_THRESHOLD          = 1.5;   // м — несовпадение старта
const END_POS_THRESHOLD      = 15;    // м — несовпадение финиша
const ANGLE_THRESHOLD        = 3;     // °
const TIMING_WARN_THRESHOLD  = 50;    // мс — тайминг-дрифт

// ── Состояние ─────────────────────────────────────────────────────────
const avto = {
    recording:      false,
    events:         [],
    startPerf:      null,
    lastRoute:      null,
    replaying:      false,
    replayRAF:      null,
    heldKeys:       new Set(),   // зажатые кнопки
    joystickActive: false,       // джойстик сейчас активен
    lastJoyX:       null,        // последние значения джойстика
    lastJoyY:       null,
    startSnapshot:  null,
    endSnapshot:    null,
    replayStats:    null,
    posLog:         [],
    lastPosLog:     [],
    posLogIntId:    null,
    maxPosDrift:    0,
    detailedLog:    [],
    keyPressTime:   {},          // code → время начала нажатия
};

// ════════════════════════════════════════════════════════════════════
// ── ВВОД: v7 — один TouchStart без повтора ──────────────────────────
// ════════════════════════════════════════════════════════════════════

function _inputDown(path) {
    // Нативные кнопки Hassle: один TouchStart + SetValue(1.0)
    // Движок держит состояние сам до TouchEnd — повтор НЕ нужен!
    window.onScreenControlTouchStart(path);
    if (typeof window.onScreenControlSetValue === 'function') {
        window.onScreenControlSetValue(path, 1.0);
    }
}

function _inputUp(path) {
    if (typeof window.onScreenControlSetValue === 'function') {
        window.onScreenControlSetValue(path, 0.0);
    }
    window.onScreenControlTouchEnd(path);
}

// Стрелки: воспроизводим через нативный onKeyDown/onKeyUp движка
function _arrowDown(code) {
    if (typeof window.onKeyDown === 'function') {
        try { window.onKeyDown(code); } catch(e) {}
    }
    document.dispatchEvent(new KeyboardEvent('keydown', {
        keyCode: code, which: code, bubbles: true, cancelable: true
    }));
}
function _arrowUp(code) {
    if (typeof window.onKeyUp === 'function') {
        try { window.onKeyUp(code); } catch(e) {}
    }
    document.dispatchEvent(new KeyboardEvent('keyup', {
        keyCode: code, which: code, bubbles: true, cancelable: true
    }));
}

function _releaseAllInputs() {
    RECORD_KEYS.forEach(function(code) {
        var info = KEY_MAP[code];
        if (!info) return;
        try {
            if (info.type === 'touch' && info.path) {
                if (typeof window.onScreenControlSetValue === 'function')
                    window.onScreenControlSetValue(info.path, 0.0);
                window.onScreenControlTouchEnd(info.path);
            } else if (info.type === 'key') {
                _arrowUp(code);
            }
        } catch(e) {}
    });
    // Сбрасываем джойстик
    if (avto.joystickActive) {
        try {
            if (typeof window.onScreenControlSetValue === 'function') {
                window.onScreenControlSetValue(JOYSTICK_PATH, 0.0);
            }
            window.onScreenControlTouchEnd(JOYSTICK_PATH);
        } catch(e) {}
        avto.joystickActive = false;
    }
}

// ════════════════════════════════════════════════════════════════════
// ── Позиция ─────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════

function _getPos() {
    try {
        if (window.App && window.App.$store) {
            var raw = window.App.$store.getters['player/position'];
            if (raw) return {
                x:       raw.x,
                y:       raw.y,
                z:       raw.z || 0,          // z есть в store (UpdatePlayerPosition)
                angle:   raw.angle,
                interior:raw.interior
            };
        }
    } catch(e) {}
    return null;
}

function _getSnapshot() {
    var pos = _getPos(), inVehicle = false;
    try {
        var h = (typeof window.interface === 'function') ? window.interface('Hud') : null;
        if (h) {
            var spd = (h.$data && h.$data.speedometer) || h.speedometer;
            if (spd) inVehicle = !!spd.show;
        }
    } catch(e) {}
    return { pos, inVehicle };
}

function _fmtPos(pos) {
    if (!pos) return '(нет)';
    var z = pos.z != null ? ' Z:' + pos.z.toFixed(1) : '';
    return 'X:' + pos.x.toFixed(2) + ' Y:' + pos.y.toFixed(2) + z;
}
function _fmtAngle(a) { return a != null ? a.toFixed(1) + '°' : '?'; }
function _angleDiff(a, b) {
    if (a == null || b == null) return null;
    var d = Math.abs(a - b) % 360;
    return d > 180 ? 360 - d : d;
}
function _posDistance(p1, p2) {
    if (!p1 || !p2) return null;
    var dx = p1.x - p2.x, dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// ════════════════════════════════════════════════════════════════════
// ── Запись события ──────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════

function _recordEvent(d, code) {
    var t   = performance.now() - avto.startPerf;
    var pos = _getPos();
    var lbl = code === JOYSTICK_CODE ? 'Джойстик'
            : (KEY_MAP[code] ? KEY_MAP[code].label : 'Key' + code);
    var dur = null;

    avto.events.push({ t, d, k: code });

    if (d === 1) {
        avto.keyPressTime[code] = t;
    } else if (d === 0) {
        if (avto.keyPressTime[code] != null) {
            dur = t - avto.keyPressTime[code];
            delete avto.keyPressTime[code];
        }
    }

    avto.detailedLog.push({ t, d, keyCode: code, key: lbl, pos, dur });
    _overlaySetKey(code, d === 1);
    debugLog('[АВТОШКОЛА] ' + (d===1?'⬇ ':'⬆ ') + lbl + ' @' + t.toFixed(1) + 'мс' +
             (pos ? ' ' + _fmtPos(pos) : '') + (dur != null ? ' (' + dur.toFixed(0) + 'мс)' : ''));
}

function _recordJoyMove(x, y) {
    var t = performance.now() - avto.startPerf;
    avto.events.push({ t, d: 2, k: JOYSTICK_CODE, x: +(x.toFixed(4)), y: +(y.toFixed(4)) });
    _overlaySetJoystick(x, y);
}

// ════════════════════════════════════════════════════════════════════
// ── ЗАПИСЬ ──────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════

// Keyboard-listener (стрелки + десктоп WASD)
function onKeyDown(e) {
    if (!avto.recording) return;
    var code = e.keyCode;
    if (!RECORD_KEYS.has(code) || avto.heldKeys.has(code)) return;
    var info = KEY_MAP[code];
    // touch-кнопки записываются только через хук TouchStart, не здесь
    if (info && info.type === 'touch') return;
    avto.heldKeys.add(code);
    _recordEvent(1, code);
}
function onKeyUp(e) {
    if (!avto.recording) return;
    var code = e.keyCode;
    if (!RECORD_KEYS.has(code) || !avto.heldKeys.has(code)) return;
    var info = KEY_MAP[code];
    if (info && info.type === 'touch') return;
    avto.heldKeys.delete(code);
    _recordEvent(0, code);
}

function startRecording() {
    if (avto.recording) { _chat('{FFAA00}Запись уже идёт!'); return; }
    if (avto.replaying) { _chat('{EE4444}Сначала дождись конца повтора'); return; }

    avto.startSnapshot  = _getSnapshot();
    avto.recording      = true;
    avto.events         = [];
    avto.detailedLog    = [];
    avto.posLog         = [];
    avto.startPerf      = performance.now();
    avto.heldKeys.clear();
    avto.joystickActive = false;
    avto.lastJoyX       = null;
    avto.lastJoyY       = null;
    avto.keyPressTime   = {};

    // Запись позиции каждые 100мс
    avto.posLogIntId = setInterval(function() {
        if (!avto.recording) return;
        var pos = _getPos();
        if (pos) avto.posLog.push({
            t:   Math.round(performance.now() - avto.startPerf),
            pos: { x: pos.x, y: pos.y, z: pos.z, angle: pos.angle }
        });
    }, POS_LOG_INTERVAL);

    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('keyup',   onKeyUp,   true);
    _createHudOverlay('record');
    _overlayResetAll();

    var snap = avto.startSnapshot;
    var mode = _detectMode();
    _chat('{33DD77}🔴 Запись НАЧАТА [' + (snap.inVehicle ? '🚗' : '🚶') + ' ' + mode + '] ' + _fmtPos(snap.pos));
    debugLog('[АВТОШКОЛА v7] Запись старт. pos=' + _fmtPos(snap.pos));
}

function _detectMode() {
    // Определяем режим управления из настроек
    try {
        var useJoy = window.App.$store.getters['settings/settings'].useJoystick;
        return useJoy ? '🕹️+кнопки' : '⬆️стрелки+кнопки';
    } catch(e) { return '?'; }
}

function stopRecording() {
    if (!avto.recording) { _chat('{EE4444}Запись не активна'); return; }
    avto.recording = false;
    document.removeEventListener('keydown', onKeyDown, true);
    document.removeEventListener('keyup',   onKeyUp,   true);

    // Принудительно отпустить зажатые кнопки
    avto.heldKeys.forEach(function(code) { _recordEvent(0, code); });
    avto.heldKeys.clear();

    // Завершить джойстик если был активен
    if (avto.joystickActive) {
        avto.joystickActive = false;
        var tj = performance.now() - avto.startPerf;
        avto.events.push({ t: tj, d: 0, k: JOYSTICK_CODE });
        avto.detailedLog.push({ t: tj, d: 0, keyCode: JOYSTICK_CODE, key: 'Джойстик', pos: _getPos(), dur: null });
    }
    avto.keyPressTime = {};

    var stopT = performance.now() - avto.startPerf;
    avto.events.push({ t: stopT, d: -1, k: -1 });

    if (avto.posLogIntId) { clearInterval(avto.posLogIntId); avto.posLogIntId = null; }
    var finalPos = _getPos();
    if (finalPos) avto.posLog.push({ t: Math.round(stopT), pos: { x: finalPos.x, y: finalPos.y, z: finalPos.z, angle: finalPos.angle } });

    avto.lastPosLog  = avto.posLog.slice();
    avto.lastRoute   = avto.events.slice();
    avto.endSnapshot = _getSnapshot();
    _removeHudOverlay();

    var totalSec = (stopT / 1000).toFixed(2);
    var btnCnt   = avto.lastRoute.filter(ev => ev.k >= 0 && ev.d !== -1).length;
    var joyCnt   = avto.lastRoute.filter(ev => ev.k === JOYSTICK_CODE).length;
    _chat('{EE4444}⏹ Запись: ' + btnCnt + ' кнопок, ' + joyCnt + ' джойстик, ' + totalSec + 'с, ' + avto.lastPosLog.length + ' поз.');
    _chat('{AAAAAA}🏁 Финиш: ' + _fmtPos(finalPos));
    debugLog('[АВТОШКОЛА v7] Запись стоп. Кнопок:' + btnCnt + ' Joy:' + joyCnt + ' PosLog:' + avto.posLog.length);
    _sendRecordingToTelegram(totalSec);
}

// ════════════════════════════════════════════════════════════════════
// ── ПОВТОР v7 — джойстик + стрелки + реалтайм координаты ───────────
// ════════════════════════════════════════════════════════════════════

function replayRoute() {
    if (avto.replaying)  { _chat('{FFAA00}Повтор уже идёт'); return; }
    if (!avto.lastRoute || !avto.lastRoute.length) { _chat('{EE4444}Нет маршрута. /arec_on'); return; }
    if (avto.recording)  { _chat('{EE4444}Сначала /arec_off'); return; }

    _checkStartSnapshot().forEach(p => _chat(p));

    avto.replaying   = true;
    avto.replayRAF   = null;
    avto.maxPosDrift = 0;
    avto.replayStats = {
        totalEvents: avto.lastRoute.length, processedEvents: 0,
        maxDrift: 0, totalDrift: 0, driftEvents: [],
        posCheckCount: 0, posDriftTotal: 0, posDriftMax: 0,
    };

    const events  = avto.lastRoute;
    const posLog  = avto.lastPosLog || [];
    const totalMs = events.length ? events[events.length - 1].t : 0;

    var hasTouchCtrl = typeof window.onScreenControlTouchStart === 'function' &&
                       typeof window.onScreenControlTouchEnd   === 'function';
    var hasTouchMove = typeof window.onScreenControlTouchMove  === 'function';
    var hasSetValue  = typeof window.onScreenControlSetValue   === 'function';

    var joyCount  = events.filter(ev => ev.k === JOYSTICK_CODE).length;
    var arrowCount = events.filter(ev => ev.k >= 37 && ev.k <= 40).length;
    var method = 'touch(' + (hasTouchCtrl ? '✅' : '❌') + ')' +
                 '+joy(' + (hasTouchMove ? '✅' : '❌') + ')' +
                 '+SetVal(' + (hasSetValue ? '✅' : '❌') + ')';

    _chat('{33DD77}▶ Повтор (' + (totalMs/1000).toFixed(2) + 'с) | ' + method);
    _chat('{AAAAAA}   Joy: ' + joyCount + ' соб. | Стрелки: ' + arrowCount + ' соб.');
    debugLog('[АВТОШКОЛА v7] Повтор. ' + method);

    _createHudOverlay('replay');
    _overlayResetAll();
    _resetPosDriftOverlay();

    const startPerf = performance.now();
    var eventIndex  = 0;
    var posLogIdx   = 0;
    var rtLastChatMs  = 0;
    var rtLastDist    = 0;
    var rtPrevPos     = null;

    // ── Выполнение одного события ──
    function _execEvent(ev) {
        try {
            // ── Джойстик ──
            if (ev.k === JOYSTICK_CODE) {
                if (ev.d === 1) {
                    window.onScreenControlTouchStart(JOYSTICK_PATH);
                    _overlaySetJoystick(0, 0);
                } else if (ev.d === 0) {
                    if (hasSetValue) window.onScreenControlSetValue(JOYSTICK_PATH, 0.0);
                    window.onScreenControlTouchEnd(JOYSTICK_PATH);
                    _overlaySetJoystick(0, 0);
                } else if (ev.d === 2 && hasTouchMove) {
                    window.onScreenControlTouchMove(JOYSTICK_PATH, ev.x, ev.y);
                    _overlaySetJoystick(ev.x, ev.y);
                }
                return;
            }

            // ── Кнопки ──
            var info = KEY_MAP[ev.k];
            if (!info) return;

            if (info.type === 'touch' && hasTouchCtrl) {
                // Мобильные кнопки через onScreenControlTouchStart/End
                if (ev.d === 1) {
                    _inputDown(info.path);
                } else {
                    _inputUp(info.path);
                }
            } else {
                // Стрелки и десктопные клавиши через keyboard events
                if (ev.d === 1) {
                    _arrowDown(ev.k);
                } else {
                    _arrowUp(ev.k);
                }
            }
            _overlaySetKey(ev.k, ev.d === 1);

        } catch(err) {
            debugLog('[АВТОШКОЛА] exec err: ' + err.message);
        }
    }

    // ── RAF-цикл ──
    function _rafLoop() {
        if (!avto.replaying) { _releaseAllInputs(); _removeHudOverlay(); return; }

        var elapsed = performance.now() - startPerf;
        var nowPerf = performance.now();
        var stats   = avto.replayStats;

        // 1. Выполняем события по времени
        while (eventIndex < events.length && events[eventIndex].t <= elapsed) {
            var ev    = events[eventIndex];
            var drift = elapsed - ev.t;
            stats.processedEvents++;
            stats.totalDrift += drift;
            if (drift > stats.maxDrift) stats.maxDrift = drift;
            if (drift > TIMING_WARN_THRESHOLD)
                stats.driftEvents.push({ expected: ev.t, actual: elapsed, drift, k: ev.k, d: ev.d });
            _execEvent(ev);
            eventIndex++;
        }

        // 2. Плановые проверки позиции по posLog (каждые 100мс)
        while (posLogIdx < posLog.length && posLog[posLogIdx].t <= elapsed) {
            var entry = posLog[posLogIdx];
            var cur   = _getPos();
            if (cur && entry.pos) {
                var d = _posDistance(cur, entry.pos);
                if (d !== null) {
                    if (d > stats.posDriftMax)  stats.posDriftMax  = d;
                    if (d > avto.maxPosDrift)   avto.maxPosDrift   = d;
                    stats.posDriftTotal += d;
                    stats.posCheckCount++;
                    var tLbl = (entry.t / 1000).toFixed(1) + 'с';
                    _updatePosDriftOverlay(d, tLbl);
                    if (d >= POS_DRIFT_CRITICAL) {
                        _chat('{EE4444}❌ ДРЕЙФ ' + d.toFixed(2) + 'м @' + tLbl);
                        _chat('{EE4444}  факт: ' + _fmtPos(cur));
                        _chat('{EE4444}  ожид: ' + _fmtPos(entry.pos));
                    } else if (d >= POS_DRIFT_WARN) {
                        _chat('{FFAA00}⚠ Дрейф ' + d.toFixed(2) + 'м @' + tLbl + ' | ' + _fmtPos(cur));
                    }
                }
            }
            posLogIdx++;
        }

        // 3. РЕАЛТАЙМ координаты — каждый кадр (~16мс)
        var rtPos = _getPos();
        if (rtPos && posLogIdx > 0) {
            var nearIdx = posLogIdx - 1;
            if (posLogIdx < posLog.length &&
                Math.abs(posLog[posLogIdx].t - elapsed) < Math.abs(posLog[nearIdx].t - elapsed))
                nearIdx = posLogIdx;
            var near = posLog[nearIdx];
            if (near && near.pos) {
                var rtDist = _posDistance(rtPos, near.pos);
                if (rtDist !== null) {
                    // Оверлей — каждый кадр
                    if (rtDist >= RT_OVERLAY_THRESHOLD)
                        _updatePosDriftOverlay(rtDist, (elapsed / 1000).toFixed(2) + 'с');

                    // Детект резкого прыжка (машина слетела с пути)
                    var isJump = rtPrevPos && _posDistance(rtPos, rtPrevPos) > RT_JUMP_THRESHOLD * 2;

                    // Чат — при значимом дрейфе
                    if (rtDist >= RT_CHAT_THRESHOLD) {
                        var tooSoon  = (nowPerf - rtLastChatMs) < RT_CHAT_COOLDOWN;
                        var smallDff = Math.abs(rtDist - rtLastDist) < 0.3;
                        if (!tooSoon || isJump || !smallDff) {
                            rtLastChatMs = nowPerf;
                            rtLastDist   = rtDist;
                            var pfx = isJump ? '{EE4444}🚨 ПРЫЖОК'
                                    : rtDist >= POS_DRIFT_CRITICAL ? '{EE4444}❌'
                                    : '{FFAA00}⚡';
                            _chat(pfx + ' Δ' + rtDist.toFixed(2) + 'м @' + (elapsed/1000).toFixed(2) + 'с | ' + _fmtPos(rtPos));
                        }
                    } else if (rtLastDist >= RT_CHAT_THRESHOLD) {
                        rtLastDist = 0;
                        _chat('{33DD77}✔ В норме @' + (elapsed/1000).toFixed(2) + 'с');
                    }
                }
            }
        }
        rtPrevPos = rtPos;

        // 4. Конец повтора
        if (elapsed < totalMs + 400) {
            avto.replayRAF = requestAnimationFrame(_rafLoop);
        } else {
            _releaseAllInputs();
            _removeHudOverlay();
            avto.replaying = false;
            avto.replayRAF = null;
            var endMsgs = _checkEndSnapshot();
            endMsgs.forEach(p => _chat(p));
            _chat('{33DD77}✅ Повтор завершён | Макс.дрейф: ' + avto.maxPosDrift.toFixed(2) + 'м');
            _sendReplayResultToTelegram(stats, endMsgs, method);
        }
    }
    avto.replayRAF = requestAnimationFrame(_rafLoop);
}

function cancelReplay() {
    if (!avto.replaying) return;
    if (avto.replayRAF !== null) { cancelAnimationFrame(avto.replayRAF); avto.replayRAF = null; }
    avto.replaying = false;
    _releaseAllInputs();
    _removeHudOverlay();
    _chat('{FFAA00}⏹ Повтор отменён');
}

// ════════════════════════════════════════════════════════════════════
// ── Проверки позиций старт/финиш ────────────────────────────────────
// ════════════════════════════════════════════════════════════════════

function _checkStartSnapshot() {
    var snap = avto.startSnapshot, cur = _getSnapshot(), msgs = [];
    if (snap && snap.pos && cur.pos) {
        var dx = Math.abs(cur.pos.x - snap.pos.x), dy = Math.abs(cur.pos.y - snap.pos.y);
        if (dx > POS_THRESHOLD || dy > POS_THRESHOLD)
            msgs.push('{EE4444}❌ Старт НЕ совпадает! ΔX:' + dx.toFixed(1) + ' ΔY:' + dy.toFixed(1));
        else
            msgs.push('{33DD77}✅ Старт OK: ' + _fmtPos(cur.pos));
        var da = _angleDiff(cur.pos.angle, snap.pos.angle);
        if (da !== null && da > ANGLE_THRESHOLD) msgs.push('{EE4444}❌ Угол Δ' + da.toFixed(1) + '°');
        else if (da !== null) msgs.push('{33DD77}✅ Угол OK: ' + _fmtAngle(cur.pos.angle));
    }
    return msgs;
}

function _checkEndSnapshot() {
    var endSnap = avto.endSnapshot;
    if (!endSnap || !endSnap.pos) return ['{FFAA00}⚠ Нет данных финиша'];
    var cur = _getSnapshot();
    if (!cur.pos) return ['{FFAA00}⚠ Позиция недоступна'];
    var dx = Math.abs(cur.pos.x - endSnap.pos.x), dy = Math.abs(cur.pos.y - endSnap.pos.y);
    if (dx > END_POS_THRESHOLD || dy > END_POS_THRESHOLD)
        return ['{EE4444}❌ Финиш НЕ совпал! ΔX:' + dx.toFixed(1) + ' ΔY:' + dy.toFixed(1) + ' | ' + _fmtPos(cur.pos)];
    return ['{33DD77}✅ Финиш OK: ' + _fmtPos(cur.pos)];
}

// ════════════════════════════════════════════════════════════════════
// ── Telegram ────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════

function _sendRecordingToTelegram(totalSec) {
    if (typeof sendToTelegram !== 'function') return;
    var snap = avto.startSnapshot, endSnap = avto.endSnapshot;
    var msg  = '🏎 <b>АВТОШКОЛА v7 — Маршрут записан</b>\n\n';
    msg += '⏱ Длительность: <b>' + totalSec + ' сек</b>\n';
    var btnCnt = avto.lastRoute.filter(ev => ev.k >= 0 && ev.d === 1).length;
    var joyCnt = avto.lastRoute.filter(ev => ev.k === JOYSTICK_CODE && ev.d === 2).length;
    msg += '📊 Нажатий кнопок: <b>' + btnCnt + '</b> | Движений джойстика: <b>' + joyCnt + '</b>\n';
    msg += '📍 Точек позиции: <b>' + avto.lastPosLog.length + '</b> (каждые ' + POS_LOG_INTERVAL + 'мс)\n';
    msg += '📍 Старт: <b>' + _fmtPos(snap && snap.pos) + '</b> ∠' + _fmtAngle(snap && snap.pos && snap.pos.angle) + '\n';
    msg += '🏁 Финиш: <b>' + _fmtPos(endSnap && endSnap.pos) + '</b>\n\n';
    msg += '📋 <b>СОБЫТИЯ:</b>\n<code>\n';
    var n = 0;
    avto.detailedLog.forEach(function(e) {
        n++;
        var arrow = e.d === 1 ? '⬇' : (e.d === 0 ? '⬆' : '↔');
        var line  = '#' + String(n).padStart(3,'0') + ' ' + (e.t/1000).toFixed(3) + 'с ' + arrow + ' ' + e.key;
        if (e.dur != null) line += ' (' + (e.dur/1000).toFixed(3) + 'с)';
        if (e.pos) line += ' [' + _fmtPos(e.pos) + ']';
        msg += line + '\n';
    });
    msg += '</code>';
    var MAX = 3800;
    if (msg.length <= MAX) { sendToTelegram(msg, false, null); }
    else {
        var si = msg.indexOf('<code>');
        if (si > 0 && si < MAX) {
            sendToTelegram(msg.substring(0, si), false, null);
            for (var i = si; i < msg.length; i += 3500) sendToTelegram(msg.substring(i, i+3500), true, null);
        } else for (var i = 0; i < msg.length; i += MAX) sendToTelegram(msg.substring(i, i+MAX), i>0, null);
    }
    // Данные маршрута компактно (формат: [t, d, k] или [t, 2, -2, x, y])
    var rj = JSON.stringify(avto.events.map(ev =>
        ev.k === JOYSTICK_CODE && ev.d === 2
            ? [+(ev.t.toFixed(2)), 2, -2, ev.x, ev.y]
            : [+(ev.t.toFixed(2)), ev.d, ev.k]
    ));
    for (var i = 0; i < rj.length; i += 3800)
        sendToTelegram('📦 Маршрут:\n<code>' + rj.slice(i, i+3800) + '</code>', true, null);
}

function _sendReplayResultToTelegram(stats, endMsgs, method) {
    if (typeof sendToTelegram !== 'function') return;
    var avg = stats.processedEvents > 0 ? (stats.totalDrift/stats.processedEvents).toFixed(2) : '0';
    var tq  = stats.maxDrift < 20  ? '🟢 Отлично'
            : stats.maxDrift < 50  ? '🟡 Хорошо'
            : stats.maxDrift < 100 ? '🟠 Удовл.'
            : '🔴 Плохо';
    var msg = '🏁 <b>АВТОШКОЛА v7 — Повтор завершён</b>\n\n';
    msg += '🎮 Метод: ' + method + '\n';
    msg += '🎯 Тайминг: ' + tq + ' (макс ' + stats.maxDrift.toFixed(2) + 'мс, ср ' + avg + 'мс)\n';
    msg += '📊 Событий: <b>' + stats.processedEvents + '/' + stats.totalEvents + '</b>\n';
    if (stats.posCheckCount > 0) {
        var avgPos = (stats.posDriftTotal/stats.posCheckCount).toFixed(2);
        var pq = stats.posDriftMax < 1   ? '🟢 Идеально'
               : stats.posDriftMax < POS_DRIFT_WARN ? '🟡 Хорошо'
               : stats.posDriftMax < POS_DRIFT_CRITICAL ? '🟠 Заметный'
               : '🔴 Критический';
        msg += '\n📍 Позиционный дрейф: ' + pq + '\n';
        msg += '  Макс: <b>' + stats.posDriftMax.toFixed(2) + 'м</b> | Ср: ' + avgPos + 'м\n';
    }
    msg += '\n📍 Финал:\n';
    endMsgs.forEach(m => { msg += '• ' + m.replace(/\{[0-9A-Fa-f]{6}\}/g,'') + '\n'; });
    if (msg.length <= 4000) sendToTelegram(msg, false, null);
    else for (var i = 0; i < msg.length; i += 3800) sendToTelegram(msg.substring(i,i+3800), i>0, null);
}

// ════════════════════════════════════════════════════════════════════
// ── UI Overlay ──────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════

function _chat(txt) {
    if (typeof window.onChatMessage === 'function')
        window.onChatMessage('{999999}АВТОШКОЛА — ' + txt, '999999FF');
}
function debugLog(msg) { console.log(msg); }

var _hudOverlay = null, _hudMode = null;
var _KEY_LABELS = [[87,'⬆W'],[68,'▶D'],[65,'◀A'],[83,'⬇S'],[32,'🅿SP'],[81,'↩Q'],[69,'↪E'],[72,'📯H'],
                   [38,'↑'],[40,'↓'],[37,'←'],[39,'→']];

function _createHudOverlay(mode) {
    _hudMode = mode;
    if (_hudOverlay) { _updateOverlayHeader(mode); return; }
    var wrap = document.createElement('div');
    wrap.id  = 'avto-overlay';
    wrap.style.cssText = 'position:fixed;right:1.5vw;bottom:18vh;z-index:99999;display:flex;flex-direction:column;gap:2px;pointer-events:none;font-size:1.4vh;';

    var hdr = document.createElement('div');
    hdr.id  = 'avto-hdr';
    _applyHeaderStyle(hdr, mode);
    wrap.appendChild(hdr);

    _KEY_LABELS.forEach(function(p) {
        var row = document.createElement('div');
        row.id  = 'avto-k-' + p[0];
        row.textContent = p[1];
        row.style.cssText = 'padding:2px 6px;border-radius:3px;background:rgba(0,0,0,0.5);color:rgba(255,255,255,0.3);border:1px solid rgba(255,255,255,0.1);transition:all 0.05s;';
        wrap.appendChild(row);
    });

    // Джойстик индикатор
    var joy = document.createElement('div');
    joy.id  = 'avto-joy';
    joy.textContent = '🕹️--';
    joy.style.cssText = 'padding:2px 6px;border-radius:3px;background:rgba(0,0,0,0.5);color:rgba(255,255,255,0.3);font-size:1.1vh;';
    wrap.appendChild(joy);

    // Дрейф координат
    var drift = document.createElement('div');
    drift.id  = 'avto-drift';
    drift.textContent = '📍 --';
    drift.style.cssText = 'padding:2px 6px;border-radius:3px;background:rgba(0,0,0,0.5);color:rgba(255,255,255,0.4);font-size:1.1vh;';
    wrap.appendChild(drift);

    document.body.appendChild(wrap);
    _hudOverlay = wrap;
}

function _applyHeaderStyle(el, mode) {
    el.textContent = mode === 'record' ? '🔴 ЗАПИСЬ' : '▶ ПОВТОР';
    var col = mode === 'record' ? '#F44' : '#3D7';
    el.style.cssText = 'padding:2px 6px;border-radius:3px;background:rgba(0,0,0,0.7);color:' + col + ';border:1px solid ' + col + ';font-weight:bold;text-align:center;';
}
function _updateOverlayHeader(mode) { var h=document.getElementById('avto-hdr'); if(h) _applyHeaderStyle(h,mode); }
function _removeHudOverlay()   { if(_hudOverlay){_hudOverlay.remove();_hudOverlay=null;} }

function _overlaySetKey(code, down) {
    var el = document.getElementById('avto-k-' + code);
    if (!el) return;
    el.style.background  = down ? (_hudMode==='record'?'rgba(210,100,0,0.8)':'rgba(30,180,80,0.75)') : 'rgba(0,0,0,0.5)';
    el.style.color       = down ? '#fff' : 'rgba(255,255,255,0.3)';
    el.style.borderColor = down ? (_hudMode==='record'?'#F80':'#3D7') : 'rgba(255,255,255,0.1)';
}
function _overlayResetAll() {
    _KEY_LABELS.forEach(p => _overlaySetKey(p[0], false));
}
function _overlaySetJoystick(x, y) {
    var el = document.getElementById('avto-joy');
    if (!el) return;
    var active = (x !== 0 || y !== 0);
    el.style.background = active ? 'rgba(30,100,200,0.75)' : 'rgba(0,0,0,0.5)';
    el.style.color = active ? '#fff' : 'rgba(255,255,255,0.3)';
    el.textContent = '🕹️' + (active
        ? (x>=0?'+':'') + x.toFixed(2) + '/' + (y>=0?'+':'') + y.toFixed(2)
        : '--');
}
function _updatePosDriftOverlay(dist, timeS) {
    var el = document.getElementById('avto-drift');
    if (!el) return;
    var ok = dist < RT_CHAT_THRESHOLD, warn = dist < POS_DRIFT_WARN;
    el.style.background = ok ? 'rgba(20,130,55,0.75)' : warn ? 'rgba(180,130,0,0.75)' : 'rgba(170,35,35,0.8)';
    el.style.color = '#fff';
    el.textContent = '📍' + (ok?'✅':warn?'⚠':'❌') + ' Δ' + dist.toFixed(2) + 'м @' + timeS;
}
function _resetPosDriftOverlay() {
    var el = document.getElementById('avto-drift');
    if (el) { el.style.background='rgba(0,0,0,0.5)'; el.style.color='rgba(255,255,255,0.4)'; el.textContent='📍 слежу...'; }
}

// ════════════════════════════════════════════════════════════════════
// ── ХУКИ — v7: кнопки + ДЖОЙСТИК + стрелки ─────────────────────────
// ════════════════════════════════════════════════════════════════════

(function hookTouchControls() {
    // ─ TouchStart: кнопки ─
    const _origStart = window.onScreenControlTouchStart;
    window.onScreenControlTouchStart = function(path, isClientKey) {
        if (avto.recording && !isClientKey) {
            // Кнопки A/D/W/S/Space/Q/E/H
            var code = PATH_MAP[path];
            if (code !== undefined && !avto.heldKeys.has(code)) {
                avto.heldKeys.add(code);
                _recordEvent(1, code);
            }
            // Джойстик
            if (path === JOYSTICK_PATH && !avto.joystickActive) {
                avto.joystickActive = true;
                _recordEvent(1, JOYSTICK_CODE);
                _overlaySetJoystick(0, 0);
            }
        }
        return (typeof _origStart === 'function') ? _origStart.apply(this, arguments) : undefined;
    };

    // ─ TouchMove: ДЖОЙСТИК (ключевое для Hassle!) ─
    const _origMove = window.onScreenControlTouchMove;
    window.onScreenControlTouchMove = function(path, x, y) {
        if (avto.recording && path === JOYSTICK_PATH) {
            // Записываем только при значимом изменении позиции
            var lx = avto.lastJoyX, ly = avto.lastJoyY;
            if (lx === null || ly === null ||
                Math.abs(x - lx) > JOY_DELTA_THRESHOLD ||
                Math.abs(y - ly) > JOY_DELTA_THRESHOLD) {
                avto.lastJoyX = x;
                avto.lastJoyY = y;
                _recordJoyMove(x, y);
            }
        }
        return (typeof _origMove === 'function') ? _origMove.apply(this, arguments) : undefined;
    };

    // ─ TouchEnd: кнопки + джойстик ─
    const _origEnd = window.onScreenControlTouchEnd;
    window.onScreenControlTouchEnd = function(path, isClientKey) {
        if (avto.recording && !isClientKey) {
            var code = PATH_MAP[path];
            if (code !== undefined && avto.heldKeys.has(code)) {
                avto.heldKeys.delete(code);
                _recordEvent(0, code);
            }
            if (path === JOYSTICK_PATH && avto.joystickActive) {
                avto.joystickActive = false;
                avto.lastJoyX = null;
                avto.lastJoyY = null;
                _recordEvent(0, JOYSTICK_CODE);
                _overlaySetJoystick(0, 0);
            }
        }
        return (typeof _origEnd === 'function') ? _origEnd.apply(this, arguments) : undefined;
    };
})();

// ─ Хук команд чата ─
(function hookSendChatInput() {
    const _orig = window.sendChatInput;
    window.sendChatInput = function(cmd) {
        if (typeof cmd === 'string') {
            var t = cmd.trim().toLowerCase();
            if (t === '/arec_on')  { startRecording(); return; }
            if (t === '/arec_off') { stopRecording();  return; }
            if (t === '/apov')     { replayRoute();    return; }
            if (t === '/apov_off') { cancelReplay();   return; }
        }
        return (typeof _orig === 'function') ? _orig.apply(this, arguments) : undefined;
    };
})();

// ════════════════════════════════════════════════════════════════════
// ── Инициализация ───────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════

var _initInfo = [
    'v7 | joy+arrows | RT-coords | /arec_on /arec_off /apov /apov_off',
    '   Touch=' + (typeof window.onScreenControlTouchStart === 'function' ? '✅' : '❌'),
    '   Move='  + (typeof window.onScreenControlTouchMove === 'function'  ? '✅' : '❌'),
    '   SetVal='+ (typeof window.onScreenControlSetValue  === 'function'  ? '✅' : '❌'),
];
_initInfo.forEach(function(l, i) {
    setTimeout(function() { _chat('{AAAAAA}' + l); }, i * 50);
});
debugLog('[АВТОШКОЛА v7] загружен. Touch=' + (typeof window.onScreenControlTouchStart === 'function') +
         ' Move=' + (typeof window.onScreenControlTouchMove === 'function') +
         ' SetVal=' + (typeof window.onScreenControlSetValue === 'function'));

})();
