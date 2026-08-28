// Code2.js — АВТОШКОЛА v6 (без задержек, реалтайм координаты)
// eval'ится из Code.js — имеет доступ к его переменным
//
// ╔══════════════════════════════════════════════════════════════════╗
// ║  ИСПРАВЛЕНИЯ v6 vs v5:                                          ║
// ║  ✅ УБРАН HOLD_REPEAT_INTERVAL — он был главным источником глюков║
// ║     (повторный TouchStart сбивал движок при каждом повторе)     ║
// ║  ✅ Один TouchStart + SetValue(1.0) при нажатии — как нативные  ║
// ║     кнопки Hassle (см. UIMobileButton в Hud.js)                 ║
// ║  ✅ POS_LOG_INTERVAL = 100мс (было 500мс) — больше точек пути   ║
// ║  ✅ Реалтайм координаты при повторе — каждый кадр RAF (~16мс)   ║
// ║  ✅ Мгновенный репорт при дрейфе > порога                       ║
// ║  ✅ Оверлей обновляется каждый кадр без задержек                ║
// ║  ✅ Упрощён детальный лог — O(1) вместо O(n) на каждое событие  ║
// ║  ℹ️  Джойстик (leftStick/TouchMove) не записывается —           ║
// ║     используйте кнопки A/D для поворота                         ║
// ╚══════════════════════════════════════════════════════════════════╝

(function () {
'use strict';

// ═══════════════════════════════════════════════════════════
// ── Карта клавиш ───────────────────────────────────────────
// ═══════════════════════════════════════════════════════════

const KEY_MAP = {
    87: { label: 'Газ (W)',        path: '<Keyboard>/w'     },
    83: { label: 'Тормоз (S)',     path: '<Keyboard>/s'     },
    65: { label: 'Влево (A)',      path: '<Keyboard>/a'     },
    68: { label: 'Вправо (D)',     path: '<Keyboard>/d'     },
    32: { label: 'Ручник (Space)', path: '<Keyboard>/space' },
    81: { label: 'Пов.влево (Q)', path: '<Keyboard>/q'     },
    69: { label: 'Пов.вправо (E)',path: '<Keyboard>/e'     },
    72: { label: 'Сигнал (H)',     path: '<Keyboard>/h'     },
};
const RECORD_KEYS = new Set(Object.keys(KEY_MAP).map(Number));
const PATH_MAP    = {};
Object.keys(KEY_MAP).forEach(code => { PATH_MAP[KEY_MAP[code].path] = Number(code); });

// ═══════════════════════════════════════════════════════════
// ── Константы ──────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════

const POS_THRESHOLD          = 1.5;  // Несовпадение старта (м)
const END_POS_THRESHOLD      = 15;   // Несовпадение финиша (м)
const ANGLE_THRESHOLD        = 3;    // Порог угла (°)
const TIMING_WARN_THRESHOLD  = 50;   // Порог тайминг-дрифта (мс)
const POS_LOG_INTERVAL       = 100;  // Запись позиции каждые 100мс (было 500)
const POS_DRIFT_WARN         = 3;    // Предупреждение дрейфа (м)
const POS_DRIFT_CRITICAL     = 8;    // Критический дрейф (м)

// Реалтайм контроль при повторе (каждый кадр RAF)
const RT_OVERLAY_THRESHOLD   = 0.2;  // Минимум для обновления оверлея (м)
const RT_CHAT_THRESHOLD      = 0.5;  // Минимум для сообщения в чат (м)
const RT_CHAT_COOLDOWN       = 500;  // Пауза между сообщениями чата (мс)
const RT_CHAT_JUMP_THRESHOLD = 1.5;  // Внезапный скачок — репорт без паузы (м)

// ═══════════════════════════════════════════════════════════
// ── Состояние ──────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════

const avto = {
    recording:     false,
    events:        [],
    startPerf:     null,
    lastRoute:     null,
    replaying:     false,
    replayRAF:     null,
    heldKeys:      new Set(),
    startSnapshot: null,
    endSnapshot:   null,
    replayStats:   null,
    posLog:        [],
    lastPosLog:    [],
    posLogIntId:   null,
    maxPosDrift:   0,
    detailedLog:   [],
    keyPressTime:  {},   // code → время нажатия (для длительности)
};

// ═══════════════════════════════════════════════════════════
// ── v6: ПРАВИЛЬНЫЙ ВВОД — один TouchStart, без повтора ────
// ═══════════════════════════════════════════════════════════
// Нативные кнопки Hassle (UIMobileButton) посылают:
//   touchstart → onScreenControlTouchStart (один раз)
//   touchend   → onScreenControlTouchEnd   (один раз)
// Никаких повторов! Движок держит состояние сам до TouchEnd.
// Повторный TouchStart (как было в v5) сбивал движок.

function _inputDown(path) {
    window.onScreenControlTouchStart(path);
    if (typeof window.onScreenControlSetValue === 'function') {
        window.onScreenControlSetValue(path, 1.0);
    }
    // ✅ Всё. Никаких интервалов, никаких повторов.
}

function _inputUp(path) {
    if (typeof window.onScreenControlSetValue === 'function') {
        window.onScreenControlSetValue(path, 0.0);
    }
    window.onScreenControlTouchEnd(path);
}

function _releaseAllInputs() {
    RECORD_KEYS.forEach(function(code) {
        var info = KEY_MAP[code];
        if (!info) return;
        try {
            if (typeof window.onScreenControlSetValue === 'function') {
                window.onScreenControlSetValue(info.path, 0.0);
            }
            window.onScreenControlTouchEnd(info.path);
        } catch(e) {}
    });
}

// ═══════════════════════════════════════════════════════════
// ── Позиция ────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════

function _getPos() {
    try {
        if (window.App && window.App.$store) {
            var raw = window.App.$store.getters['player/position'];
            if (raw) return { x: raw.x, y: raw.y, z: raw.z, angle: raw.angle, interior: raw.interior };
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
    return 'X:' + pos.x.toFixed(2) + ' Y:' + pos.y.toFixed(2) + ' Z:' + pos.z.toFixed(2);
}
function _fmtAngle(a)     { return a != null ? a.toFixed(1) + '°' : '?'; }
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

// ═══════════════════════════════════════════════════════════
// ── Запись события ─────────────────────────────────────────
// ═══════════════════════════════════════════════════════════
// Единая точка записи для хука (мобильные кнопки) и клавиатуры.
// d=1 нажатие, d=0 отпускание.

function _recordEvent(d, code) {
    var t   = performance.now() - avto.startPerf;
    var pos = _getPos();
    var lbl = KEY_MAP[code] ? KEY_MAP[code].label : 'Key' + code;
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

    var posStr = pos ? ' [' + _fmtPos(pos) + ']' : '';
    var durStr = dur != null ? ' (' + dur.toFixed(0) + 'мс)' : '';
    debugLog('[АВТОШКОЛА] ' + (d === 1 ? '⬇ ' : '⬆ ') + lbl + ' @' + t.toFixed(1) + 'мс' + posStr + durStr);
}

// ═══════════════════════════════════════════════════════════
// ── ЗАПИСЬ ─────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════

function onKeyDown(e) {
    if (!avto.recording) return;
    var code = e.keyCode;
    if (!RECORD_KEYS.has(code) || avto.heldKeys.has(code)) return;
    avto.heldKeys.add(code);
    _recordEvent(1, code);
}

function onKeyUp(e) {
    if (!avto.recording) return;
    var code = e.keyCode;
    if (!RECORD_KEYS.has(code) || !avto.heldKeys.has(code)) return;
    avto.heldKeys.delete(code);
    _recordEvent(0, code);
}

function startRecording() {
    if (avto.recording) { _chat('{FFAA00}Запись уже идёт!'); return; }
    if (avto.replaying) { _chat('{EE4444}Сначала дождись конца повтора'); return; }

    avto.startSnapshot = _getSnapshot();
    avto.recording     = true;
    avto.events        = [];
    avto.detailedLog   = [];
    avto.posLog        = [];
    avto.startPerf     = performance.now();
    avto.heldKeys.clear();
    avto.keyPressTime  = {};

    // Запись позиции каждые 100мс (в v5 было 500мс)
    avto.posLogIntId = setInterval(function() {
        if (!avto.recording) return;
        var pos = _getPos();
        if (pos) {
            avto.posLog.push({
                t:   Math.round(performance.now() - avto.startPerf),
                pos: { x: pos.x, y: pos.y, z: pos.z, angle: pos.angle }
            });
        }
    }, POS_LOG_INTERVAL);

    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('keyup',   onKeyUp,   true);
    _createHudOverlay('record');
    _overlayResetAll();

    var snap = avto.startSnapshot;
    _chat('{33DD77}🔴 Запись НАЧАТА [' + (snap.inVehicle ? '🚗' : '🚶') + '] ' + _fmtPos(snap.pos));
    debugLog('[АВТОШКОЛА] Запись старт. pos=' + _fmtPos(snap.pos) + ' angle=' + _fmtAngle(snap.pos && snap.pos.angle));
}

function stopRecording() {
    if (!avto.recording) { _chat('{EE4444}Запись не активна'); return; }
    avto.recording = false;
    document.removeEventListener('keydown', onKeyDown, true);
    document.removeEventListener('keyup',   onKeyUp,   true);

    // Принудительно отпустить зажатые клавиши
    avto.heldKeys.forEach(function(code) { _recordEvent(0, code); });
    avto.heldKeys.clear();
    avto.keyPressTime = {};

    var stopT = performance.now() - avto.startPerf;
    avto.events.push({ t: stopT, d: -1, k: -1 }); // маркер конца

    if (avto.posLogIntId) { clearInterval(avto.posLogIntId); avto.posLogIntId = null; }
    var finalPos = _getPos();
    if (finalPos) {
        avto.posLog.push({
            t:   Math.round(stopT),
            pos: { x: finalPos.x, y: finalPos.y, z: finalPos.z, angle: finalPos.angle }
        });
    }

    avto.lastPosLog    = avto.posLog.slice();
    avto.lastRoute     = avto.events.slice();
    avto.endSnapshot   = _getSnapshot();
    _removeHudOverlay();

    var totalSec = (stopT / 1000).toFixed(2);
    var cnt      = avto.lastRoute.filter(ev => ev.k !== -1).length;
    _chat('{EE4444}⏹ Запись: ' + cnt + ' событий, ' + totalSec + 'с, ' + avto.lastPosLog.length + ' поз.');
    _chat('{AAAAAA}🏁 Финиш: ' + _fmtPos(finalPos));
    debugLog('[АВТОШКОЛА] Запись стоп. Событий:' + cnt + ' PosLog:' + avto.posLog.length);
    _sendRecordingToTelegram(totalSec);
}

// ═══════════════════════════════════════════════════════════
// ── ПОВТОР v6 — без задержек, реалтайм координаты ─────────
// ═══════════════════════════════════════════════════════════

function replayRoute() {
    if (avto.replaying)  { _chat('{FFAA00}Повтор уже идёт'); return; }
    if (!avto.lastRoute || !avto.lastRoute.length) { _chat('{EE4444}Нет маршрута. /arec_on'); return; }
    if (avto.recording)  { _chat('{EE4444}Сначала /arec_off'); return; }

    _checkStartSnapshot().forEach(p => _chat(p));

    avto.replaying   = true;
    avto.replayRAF   = null;
    avto.maxPosDrift = 0;
    avto.replayStats = {
        totalEvents:    avto.lastRoute.length,
        processedEvents:0,
        maxDrift:       0, totalDrift:    0, driftEvents: [],
        posCheckCount:  0, posDriftTotal: 0, posDriftMax:  0,
    };

    const events  = avto.lastRoute;
    const posLog  = avto.lastPosLog || [];
    const totalMs = events.length ? events[events.length - 1].t : 0;

    // Определяем метод ввода (нет проверки engine/isMobile — просто проверяем функции)
    var hasTouchCtrl = typeof window.onScreenControlTouchStart === 'function' &&
                       typeof window.onScreenControlTouchEnd   === 'function';
    var hasSetValue  = typeof window.onScreenControlSetValue   === 'function';
    var method = hasTouchCtrl
        ? 'touch+SetValue(' + (hasSetValue ? '✅' : '❌') + ') v6'
        : 'keyboard';

    _chat('{33DD77}▶ Повтор (' + (totalMs / 1000).toFixed(2) + 'с) | ' + method);
    debugLog('[АВТОШКОЛА v6] Повтор. Метод=' + method + ' posLog=' + posLog.length);

    _createHudOverlay('replay');
    _overlayResetAll();
    _resetPosDriftOverlay();

    const startPerf = performance.now();
    var eventIndex  = 0;   // Следующее событие для выполнения
    var posLogIdx   = 0;   // Следующая точка posLog для проверки

    // Реалтайм контроль
    var rtLastChatMs  = 0;   // Время последнего сообщения в чат
    var rtLastDist    = 0;   // Последнее задокументированное расстояние
    var rtPrevPos     = null; // Предыдущая позиция (для детекции телепорта)

    // ── Выполнение одного события ──
    function _execEvent(ev) {
        var info = KEY_MAP[ev.k];
        if (!info) return;
        try {
            if (ev.d === 1) {
                if (hasTouchCtrl) {
                    _inputDown(info.path);
                } else {
                    document.dispatchEvent(new KeyboardEvent('keydown', {
                        keyCode: ev.k, which: ev.k, bubbles: true, cancelable: true
                    }));
                }
                _overlaySetKey(ev.k, true);
            } else {
                if (hasTouchCtrl) {
                    _inputUp(info.path);
                } else {
                    document.dispatchEvent(new KeyboardEvent('keyup', {
                        keyCode: ev.k, which: ev.k, bubbles: true, cancelable: true
                    }));
                }
                _overlaySetKey(ev.k, false);
            }
        } catch(err) {
            debugLog('[АВТОШКОЛА] exec err: ' + err.message);
        }
    }

    // ── Основной цикл RAF ──
    function _rafLoop() {
        if (!avto.replaying) {
            _releaseAllInputs();
            _removeHudOverlay();
            return;
        }

        var elapsed = performance.now() - startPerf;
        var nowPerf = performance.now();
        var stats   = avto.replayStats;

        // ── 1. Выполняем все события, время которых пришло ──
        while (eventIndex < events.length && events[eventIndex].t <= elapsed) {
            var ev    = events[eventIndex];
            var drift = elapsed - ev.t;
            stats.processedEvents++;
            stats.totalDrift += drift;
            if (drift > stats.maxDrift) stats.maxDrift = drift;
            if (drift > TIMING_WARN_THRESHOLD) {
                stats.driftEvents.push({ expected: ev.t, actual: elapsed, drift, k: ev.k, d: ev.d });
            }
            _execEvent(ev);
            eventIndex++;
        }

        // ── 2. Плановые проверки по posLog (каждые 100мс) ──
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

        // ── 3. РЕАЛТАЙМ: проверка координат КАЖДЫЙ КАДР (без задержек) ──
        var rtPos = _getPos();
        if (rtPos && posLogIdx > 0) {
            // Берём ближайшую пройденную точку posLog
            var nearIdx = posLogIdx - 1;
            // Уточняем: если следующая точка ближе по времени — берём её
            if (posLogIdx < posLog.length &&
                Math.abs(posLog[posLogIdx].t - elapsed) < Math.abs(posLog[nearIdx].t - elapsed)) {
                nearIdx = posLogIdx;
            }
            var nearEntry = posLog[nearIdx];

            if (nearEntry && nearEntry.pos) {
                var rtDist = _posDistance(rtPos, nearEntry.pos);

                if (rtDist !== null) {
                    // Обновляем оверлей каждый кадр если отклонение > порога
                    if (rtDist >= RT_OVERLAY_THRESHOLD) {
                        _updatePosDriftOverlay(rtDist, (elapsed / 1000).toFixed(2) + 'с');
                    }

                    // Детекция резкого прыжка (машина телепортировалась / сбилась)
                    var isJump = rtPrevPos && _posDistance(rtPos, rtPrevPos) > RT_CHAT_JUMP_THRESHOLD * 3;

                    // Пишем в чат при значимом дрейфе
                    if (rtDist >= RT_CHAT_THRESHOLD) {
                        var tooSoon   = (nowPerf - rtLastChatMs) < RT_CHAT_COOLDOWN;
                        var smallDiff = Math.abs(rtDist - rtLastDist) < 0.3;

                        // Пишем если: достаточно времени прошло, ИЛИ резкий прыжок
                        if (!tooSoon || isJump || !smallDiff) {
                            rtLastChatMs = nowPerf;
                            rtLastDist   = rtDist;
                            var prefix   = isJump ? '{EE4444}🚨 ПРЫЖОК' : (rtDist >= POS_DRIFT_CRITICAL ? '{EE4444}❌ ДРЕЙФ' : '{FFAA00}⚡ Δ');
                            _chat(prefix + ' ' + rtDist.toFixed(2) + 'м @' + (elapsed/1000).toFixed(2) + 'с');
                            _chat('{AAAAAA}  ' + _fmtPos(rtPos));
                        }
                    } else if (rtLastDist >= RT_CHAT_THRESHOLD) {
                        // Вернулись в норму
                        rtLastDist = 0;
                        _chat('{33DD77}✔ Координаты в норме @' + (elapsed/1000).toFixed(2) + 'с');
                    }
                }
            }
        }
        rtPrevPos = rtPos;

        // ── Конец повтора ──
        if (elapsed < totalMs + 400) {
            avto.replayRAF = requestAnimationFrame(_rafLoop);
        } else {
            _releaseAllInputs();
            _removeHudOverlay();
            avto.replaying = false;
            avto.replayRAF = null;
            var endMsgs    = _checkEndSnapshot();
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

// ═══════════════════════════════════════════════════════════
// ── Проверки позиций ───────────────────────────────────────
// ═══════════════════════════════════════════════════════════

function _checkStartSnapshot() {
    var snap = avto.startSnapshot, cur = _getSnapshot(), msgs = [];
    if (snap && snap.pos && cur.pos) {
        var dx = Math.abs(cur.pos.x - snap.pos.x), dy = Math.abs(cur.pos.y - snap.pos.y);
        if (dx > POS_THRESHOLD || dy > POS_THRESHOLD)
            msgs.push('{EE4444}❌ Старт НЕ совпадает! ΔX:' + dx.toFixed(1) + ' ΔY:' + dy.toFixed(1));
        else
            msgs.push('{33DD77}✅ Старт OK: ' + _fmtPos(cur.pos));
        var da = _angleDiff(cur.pos.angle, snap.pos.angle);
        if (da !== null && da > ANGLE_THRESHOLD)
            msgs.push('{EE4444}❌ Угол Δ' + da.toFixed(1) + '°');
        else if (da !== null)
            msgs.push('{33DD77}✅ Угол OK: ' + _fmtAngle(cur.pos.angle));
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
        return ['{EE4444}❌ Финиш НЕ совпал! ΔX:' + dx.toFixed(1) + ' ΔY:' + dy.toFixed(1) +
                ' | факт: ' + _fmtPos(cur.pos)];
    return ['{33DD77}✅ Финиш OK: ' + _fmtPos(cur.pos)];
}

// ═══════════════════════════════════════════════════════════
// ── Telegram отчёты ────────────────────────────────────────
// ═══════════════════════════════════════════════════════════

function _sendRecordingToTelegram(totalSec) {
    if (typeof sendToTelegram !== 'function') return;
    var snap    = avto.startSnapshot, endSnap = avto.endSnapshot;
    var msg     = '🏎 <b>АВТОШКОЛА v6 — Маршрут записан</b>\n\n';
    msg += '⏱ Длительность: <b>' + totalSec + ' сек</b>\n';
    msg += '📊 Событий: <b>' + avto.lastRoute.filter(ev => ev.k !== -1).length + '</b>\n';
    msg += '📍 Точек позиции: <b>' + avto.lastPosLog.length + '</b> (каждые ' + POS_LOG_INTERVAL + 'мс)\n';
    msg += '📍 Старт: <b>' + _fmtPos(snap && snap.pos) + '</b> ∠' + _fmtAngle(snap && snap.pos && snap.pos.angle) + '\n';
    msg += '🏁 Финиш: <b>' + _fmtPos(endSnap && endSnap.pos) + '</b> ∠' + _fmtAngle(endSnap && endSnap.pos && endSnap.pos.angle) + '\n\n';
    msg += '📋 <b>СОБЫТИЯ (нажатия/отпускания):</b>\n<code>\n';

    var n = 0;
    avto.detailedLog.forEach(function(e) {
        n++;
        var arrow = e.d === 1 ? '⬇' : '⬆';
        var line  = '#' + String(n).padStart(3, '0') + ' ' + (e.t / 1000).toFixed(3) + 'с ' + arrow + ' ' + e.key;
        if (e.dur != null) line += ' (' + (e.dur / 1000).toFixed(3) + 'с)';
        if (e.pos) line += ' [' + _fmtPos(e.pos) + ']';
        msg += line + '\n';
    });
    msg += '</code>';

    var MAX = 3800;
    if (msg.length <= MAX) {
        sendToTelegram(msg, false, null);
    } else {
        var si = msg.indexOf('<code>');
        if (si > 0 && si < MAX) {
            sendToTelegram(msg.substring(0, si), false, null);
            for (var i = si; i < msg.length; i += 3500) sendToTelegram(msg.substring(i, i + 3500), true, null);
        } else {
            for (var i = 0; i < msg.length; i += MAX) sendToTelegram(msg.substring(i, i + MAX), i > 0, null);
        }
    }

    // Данные маршрута (для воспроизведения)
    var rj = JSON.stringify(avto.events.map(ev => [+(ev.t.toFixed(2)), ev.d, ev.k]));
    for (var i = 0; i < rj.length; i += 3800)
        sendToTelegram('📦 Маршрут:\n<code>' + rj.slice(i, i + 3800) + '</code>', true, null);
}

function _sendReplayResultToTelegram(stats, endMsgs, method) {
    if (typeof sendToTelegram !== 'function') return;
    var avg = stats.processedEvents > 0 ? (stats.totalDrift / stats.processedEvents).toFixed(2) : '0';
    var tq  = stats.maxDrift < 20  ? '🟢 Отлично (<20мс)'
            : stats.maxDrift < 50  ? '🟡 Хорошо (<50мс)'
            : stats.maxDrift < 100 ? '🟠 Удовл. (<100мс)'
            : '🔴 Плохо (≥100мс)';
    var msg = '🏁 <b>АВТОШКОЛА v6 — Повтор завершён</b>\n\n';
    msg += '🎮 Метод: <b>' + method + '</b>\n';
    msg += '🎯 Тайминг: ' + tq + '\n';
    msg += '⏱ Макс.дрифт: <b>' + stats.maxDrift.toFixed(2) + 'мс</b> | Ср: ' + avg + 'мс\n';
    msg += '📊 Событий: <b>' + stats.processedEvents + '/' + stats.totalEvents + '</b>\n';

    if (stats.posCheckCount > 0) {
        var avgPos = (stats.posDriftTotal / stats.posCheckCount).toFixed(2);
        var pq = stats.posDriftMax < 1   ? '🟢 Идеально'
               : stats.posDriftMax < POS_DRIFT_WARN ? '🟡 Хорошо'
               : stats.posDriftMax < POS_DRIFT_CRITICAL ? '🟠 Заметный'
               : '🔴 Критический';
        msg += '\n📍 <b>Позиционный дрейф</b> (плановые проверки):\n';
        msg += '  Макс: <b>' + stats.posDriftMax.toFixed(2) + 'м</b> | Ср: ' + avgPos + 'м\n';
        msg += '  Оценка: <b>' + pq + '</b>\n';
        msg += '  Проверок: ' + stats.posCheckCount + '\n';
    }
    if (stats.driftEvents.length === 0) {
        msg += '\n✅ <b>Все события в тайминговом допуске!</b>\n';
    } else {
        msg += '\n⚠ Событий с дрифтом >' + TIMING_WARN_THRESHOLD + 'мс: <b>' + stats.driftEvents.length + '</b>\n';
    }
    msg += '\n📍 Финал:\n';
    endMsgs.forEach(m => { msg += '• ' + m.replace(/\{[0-9A-Fa-f]{6}\}/g, '') + '\n'; });

    if (msg.length <= 4000) sendToTelegram(msg, false, null);
    else for (var i = 0; i < msg.length; i += 3800) sendToTelegram(msg.substring(i, i + 3800), i > 0, null);
}

// ═══════════════════════════════════════════════════════════
// ── UI Overlay ─────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════

function _chat(txt) {
    if (typeof window.onChatMessage === 'function')
        window.onChatMessage('{999999}АВТОШКОЛА — ' + txt, '999999FF');
}
function debugLog(msg) { console.log(msg); }

var _hudOverlay    = null;
var _hudMode       = null;
var _KEY_LABELS    = [[87,'⬆W'],[68,'▶D'],[65,'◀A'],[83,'⬇S'],[32,'🅿SP'],[81,'↩Q'],[69,'↪E'],[72,'📯H']];

function _createHudOverlay(mode) {
    _hudMode = mode;
    if (_hudOverlay) { _updateOverlayHeader(mode); return; }
    var wrap = document.createElement('div');
    wrap.id  = 'avto-overlay';
    wrap.style.cssText = 'position:fixed;right:1.5vw;bottom:20vh;z-index:99999;display:flex;flex-direction:column;gap:2px;pointer-events:none;font-size:1.4vh;';

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

    // Реалтайм дрейф (обновляется каждый кадр)
    var drift = document.createElement('div');
    drift.id  = 'avto-drift';
    drift.style.cssText = 'padding:2px 6px;border-radius:3px;background:rgba(0,0,0,0.5);color:rgba(255,255,255,0.4);font-size:1.1vh;';
    drift.textContent = '📍 --';
    wrap.appendChild(drift);

    document.body.appendChild(wrap);
    _hudOverlay = wrap;
}

function _applyHeaderStyle(el, mode) {
    el.textContent = mode === 'record' ? '🔴 ЗАПИСЬ' : '▶ ПОВТОР';
    var col = mode === 'record' ? '#F44' : '#3D7';
    el.style.cssText = 'padding:2px 6px;border-radius:3px;background:rgba(0,0,0,0.7);color:' + col + ';border:1px solid ' + col + ';font-weight:bold;text-align:center;';
}
function _updateOverlayHeader(mode) {
    var h = document.getElementById('avto-hdr');
    if (h) _applyHeaderStyle(h, mode);
}
function _removeHudOverlay() {
    if (_hudOverlay) { _hudOverlay.remove(); _hudOverlay = null; }
}
function _overlaySetKey(code, down) {
    var el = document.getElementById('avto-k-' + code);
    if (!el) return;
    el.style.background  = down ? (_hudMode === 'record' ? 'rgba(210,100,0,0.8)' : 'rgba(30,180,80,0.75)') : 'rgba(0,0,0,0.5)';
    el.style.color       = down ? '#fff' : 'rgba(255,255,255,0.3)';
    el.style.borderColor = down ? (_hudMode === 'record' ? '#F80' : '#3D7') : 'rgba(255,255,255,0.1)';
}
function _overlayResetAll() { RECORD_KEYS.forEach(c => _overlaySetKey(c, false)); }

function _updatePosDriftOverlay(dist, timeS) {
    var el = document.getElementById('avto-drift');
    if (!el) return;
    var ok   = dist < RT_CHAT_THRESHOLD;
    var warn = dist < POS_DRIFT_WARN;
    el.style.background = ok   ? 'rgba(20,130,55,0.75)'
                        : warn ? 'rgba(180,130,0,0.75)'
                        :        'rgba(170,35,35,0.8)';
    el.style.color = '#fff';
    el.textContent = '📍' + (ok ? '✅' : warn ? '⚠' : '❌') +
                     ' Δ' + dist.toFixed(2) + 'м @' + timeS;
}
function _resetPosDriftOverlay() {
    var el = document.getElementById('avto-drift');
    if (el) {
        el.style.background = 'rgba(0,0,0,0.5)';
        el.style.color      = 'rgba(255,255,255,0.4)';
        el.textContent      = '📍 слежу...';
    }
}

// ═══════════════════════════════════════════════════════════
// ── Хуки — перехват мобильных кнопок ──────────────────────
// ═══════════════════════════════════════════════════════════

(function hookTouchControls() {
    // Перехватываем TouchStart для записи нажатий мобильных кнопок
    const _origStart = window.onScreenControlTouchStart;
    window.onScreenControlTouchStart = function(path) {
        if (avto.recording) {
            const code = PATH_MAP[path];
            // Записываем только если это наша клавиша И ещё не зажата
            if (code !== undefined && !avto.heldKeys.has(code)) {
                avto.heldKeys.add(code);
                _recordEvent(1, code);
            }
        }
        // ⚠️ Всегда передаём оригинальному обработчику!
        return (typeof _origStart === 'function') ? _origStart.apply(this, arguments) : undefined;
    };

    // Перехватываем TouchEnd для записи отпускания
    const _origEnd = window.onScreenControlTouchEnd;
    window.onScreenControlTouchEnd = function(path) {
        if (avto.recording) {
            const code = PATH_MAP[path];
            if (code !== undefined && avto.heldKeys.has(code)) {
                avto.heldKeys.delete(code);
                _recordEvent(0, code);
            }
        }
        return (typeof _origEnd === 'function') ? _origEnd.apply(this, arguments) : undefined;
    };
    // Примечание: onScreenControlTouchMove НЕ перехватываем —
    // джойстик (<Gamepad>/leftStick) использует TouchMove для аналогового ввода.
    // Для автошколы используйте кнопки A/D (TurnLeft/TurnRight).
})();

// ── Хук команд чата ──
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

// ═══════════════════════════════════════════════════════════
// ── Инициализация ──────────────────────────────────────────
// ═══════════════════════════════════════════════════════════

_chat('{AAAAAA}v6 | без повторов | RT-координаты | /arec_on /arec_off /apov /apov_off');
debugLog(
    '[АВТОШКОЛА v6] загружен.' +
    ' SetValue=' + (typeof window.onScreenControlSetValue === 'function') +
    ' Touch=' + (typeof window.onScreenControlTouchStart === 'function') +
    ' posInterval=' + POS_LOG_INTERVAL + 'мс'
);

})();
