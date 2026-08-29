// Code2.js — АВТОШКОЛА v8 — УНИВЕРСАЛЬНАЯ ЗАПИСЬ
// eval'ится из Code.js
//
// v8: записывает ВСЕ нажатия без фильтра — ходьба, бег,
// прыжок, удар, сесть в машину, джойстик, все кнопки HUD
//
// Формат events:
//   { t, d:1,  pi }            — кнопка нажата   (pi = индекс пути в pathTable)
//   { t, d:0,  pi }            — кнопка отпущена
//   { t, d:2,  pi, x, y }     — аналог (джойстик) TouchMove
//   { t, d:-1, pi:-1 }        — маркер конца

(function () {
'use strict';

// ════════════════════════════════════════════════════════════════════
// ── PATH → LABEL ──────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════

const PATH_LABELS = {
    '<Keyboard>/w':          '⬆ Газ/Вперёд',
    '<Keyboard>/s':          '⬇ Тормоз/Назад',
    '<Keyboard>/a':          '◀ Влево',
    '<Keyboard>/d':          '▶ Вправо',
    '<Keyboard>/space':      '🅿 Прыжок/Ручник',
    '<Keyboard>/f':          '🚗 Войти/Действие',
    '<Keyboard>/g':          '🚪 Выйти',
    '<Keyboard>/c':          '🦆 Присесть',
    '<Keyboard>/leftCtrl':   '🤜 Атака',
    '<Keyboard>/lctrl':      '🤜 Атака',
    '<Keyboard>/leftAlt':    '👊 Удар',
    '<Keyboard>/r':          '🔄 Перезарядка',
    '<Keyboard>/z':          '🔫 Прицел',
    '<Keyboard>/leftShift':  '🏃 Бег',
    '<Keyboard>/q':          '↩ Сигнал Л',
    '<Keyboard>/e':          '↪ Сигнал П',
    '<Keyboard>/h':          '📯 Гудок',
    '<Keyboard>/b':          '🎒 Инвентарь',
    '<Keyboard>/m':          '🗺 Карта',
    '<Keyboard>/t':          '💬 Чат',
    '<Keyboard>/y':          '💬 Чат команды',
    '<Keyboard>/tab':        '📋 Таб',
    '<Keyboard>/escape':     '✖ ESC',
    '<Keyboard>/enter':      '✔ Ввод',
    '<Keyboard>/backspace':  '⌫ Back',
    '<Keyboard>/1':          '1️⃣ Слот 1',
    '<Keyboard>/2':          '2️⃣ Слот 2',
    '<Keyboard>/3':          '3️⃣ Слот 3',
    '<Keyboard>/4':          '4️⃣ Слот 4',
    '<Keyboard>/5':          '5️⃣ Слот 5',
    '<Keyboard>/x':          '🎤 Голос',
    '<Keyboard>/u':          '📻 Радио',
    '<Keyboard>/v':          '📷 Камера',
    '<Keyboard>/p':          '📊 Статы',
    '<Keyboard>/n':          '🔢 Слоты',
    '<Keyboard>/i':          'ℹ️ Инфо',
    '<Keyboard>/k':          '🔑 K',
    '<Keyboard>/l':          '🔓 L',
    '<Keyboard>/j':          '🏷 J',
    '<Keyboard>/o':          '⭕ O',
    '<Keyboard>/leftArrow':  '← ←',
    '<Keyboard>/rightArrow': '→ →',
    '<Keyboard>/upArrow':    '↑ ↑',
    '<Keyboard>/downArrow':  '↓ ↓',
    '<Gamepad>/leftStick':   '🕹️ Джойстик Л',
    '<Gamepad>/rightStick':  '🕹️ Джойстик П',
    '<Gamepad>/leftStickPress': '🕹️↓ Нажать Л',
    '<Mouse>/leftButton':    '🖱️ ЛКМ',
    '<Mouse>/rightButton':   '🖱️ ПКМ',
    '<Mouse>/delta':         '🖱️ Курсор',
};

function _pathLabel(path) {
    if (!path) return '?';
    if (PATH_LABELS[path]) return PATH_LABELS[path];
    return path
        .replace('<Keyboard>/', '⌨ ')
        .replace('<Gamepad>/',  '🎮 ')
        .replace('<Mouse>/',    '🖱️ ');
}

// ════════════════════════════════════════════════════════════════════
// ── Константы ─────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════

const POS_LOG_INTERVAL      = 100;
const POS_DRIFT_WARN        = 3;
const POS_DRIFT_CRITICAL    = 8;
const RT_OVERLAY_THRESHOLD  = 0.2;
const RT_CHAT_THRESHOLD     = 0.5;
const RT_CHAT_COOLDOWN      = 500;
const JOY_DELTA_THRESHOLD   = 0.01;
const POS_THRESHOLD         = 1.5;
const END_POS_THRESHOLD     = 15;
const ANGLE_THRESHOLD       = 3;
const TIMING_WARN_THRESHOLD = 50;
const OVERLAY_MAX_SLOTS     = 8;

// Пути с аналоговым вводом (используют TouchMove)
const ANALOG_PATHS = new Set([
    '<Gamepad>/leftStick',
    '<Gamepad>/rightStick',
    '<Mouse>/delta',
]);

// ════════════════════════════════════════════════════════════════════
// ── Состояние ─────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════

const avto = {
    recording:     false,
    events:        [],        // { t, d, pi } | { t, d:2, pi, x, y }
    pathTable:     [],        // уникальные пути (для сжатия)
    pathIndex:     {},        // path → индекс
    startPerf:     null,
    lastRoute:     null,
    lastPathTable: null,
    replaying:     false,
    replayRAF:     null,
    heldPaths:     new Set(), // зажатые пути (чтоб не дублировать)
    analogState:   {},        // path → { lastX, lastY }
    startSnapshot: null,
    endSnapshot:   null,
    replayStats:   null,
    posLog:        [],
    lastPosLog:    [],
    posLogIntId:   null,
    maxPosDrift:   0,
    detailedLog:   [],
    pressStart:    {},        // path → время нажатия (для длительности)
};

// ── Индексация путей (экономия в JSON) ────────────────────────────
function _pi(path) {
    if (avto.pathIndex[path] == null) {
        avto.pathIndex[path] = avto.pathTable.length;
        avto.pathTable.push(path);
    }
    return avto.pathIndex[path];
}

// ════════════════════════════════════════════════════════════════════
// ── Ввод: воспроизведение ─────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════
// Один TouchStart + SetValue — никаких повторов (исправлено в v6)

function _inputDown(path) {
    window.onScreenControlTouchStart(path);
    if (typeof window.onScreenControlSetValue === 'function')
        window.onScreenControlSetValue(path, 1.0);
}
function _inputUp(path) {
    if (typeof window.onScreenControlSetValue === 'function')
        window.onScreenControlSetValue(path, 0.0);
    window.onScreenControlTouchEnd(path);
}
function _inputMove(path, x, y) {
    if (typeof window.onScreenControlTouchMove === 'function')
        window.onScreenControlTouchMove(path, x, y);
}

function _releaseAllInputs() {
    avto.heldPaths.forEach(function(path) {
        try {
            if (typeof window.onScreenControlSetValue === 'function')
                window.onScreenControlSetValue(path, 0.0);
            window.onScreenControlTouchEnd(path);
        } catch(e) {}
    });
    Object.keys(avto.analogState).forEach(function(path) {
        try {
            if (typeof window.onScreenControlSetValue === 'function')
                window.onScreenControlSetValue(path, 0.0);
            window.onScreenControlTouchEnd(path);
        } catch(e) {}
    });
    avto.heldPaths.clear();
    avto.analogState = {};
}

// ════════════════════════════════════════════════════════════════════
// ── Позиция ───────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════

function _getPos() {
    try {
        if (window.App && window.App.$store) {
            var raw = window.App.$store.getters['player/position'];
            if (raw) return { x: raw.x, y: raw.y, z: raw.z || 0, angle: raw.angle, interior: raw.interior };
        }
    } catch(e) {}
    return null;
}
function _getSnapshot() {
    var pos = _getPos(), inVehicle = false;
    try {
        var h = (typeof window.interface === 'function') ? window.interface('Hud') : null;
        if (h) { var s = (h.$data && h.$data.speedometer) || h.speedometer; if (s) inVehicle = !!s.show; }
    } catch(e) {}
    return { pos, inVehicle };
}
function _fmtPos(pos) {
    if (!pos) return '(нет)';
    return 'X:' + pos.x.toFixed(2) + ' Y:' + pos.y.toFixed(2) + (pos.z != null ? ' Z:' + pos.z.toFixed(1) : '');
}
function _fmtAngle(a)     { return a != null ? a.toFixed(1) + '°' : '?'; }
function _angleDiff(a, b) { if (a==null||b==null) return null; var d=Math.abs(a-b)%360; return d>180?360-d:d; }
function _posDistance(p1, p2) {
    if (!p1 || !p2) return null;
    var dx = p1.x - p2.x, dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// ════════════════════════════════════════════════════════════════════
// ── Запись одного события ─────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════

function _recButton(d, path) {
    var t   = performance.now() - avto.startPerf;
    var pi  = _pi(path);
    var pos = _getPos();
    var dur = null;
    avto.events.push({ t, d, pi });
    if (d === 1) {
        avto.pressStart[path] = t;
    } else if (d === 0 && avto.pressStart[path] != null) {
        dur = t - avto.pressStart[path];
        delete avto.pressStart[path];
    }
    var lbl = _pathLabel(path);
    avto.detailedLog.push({ t, d, path, key: lbl, pos, dur });
    _overlayActivate(path, d === 1, lbl);
    debugLog('[АВТОШКОЛА] ' + (d===1?'⬇ ':'⬆ ') + lbl + ' @' + t.toFixed(1) + 'мс' +
             (pos ? ' ['+_fmtPos(pos)+']' : '') + (dur!=null?' ('+dur.toFixed(0)+'мс)':''));
}

function _recMove(path, x, y) {
    var t = performance.now() - avto.startPerf;
    avto.events.push({ t, d: 2, pi: _pi(path), x: +(x.toFixed(4)), y: +(y.toFixed(4)) });
    _overlaySetAnalog(path, x, y);
}

// ════════════════════════════════════════════════════════════════════
// ── ЗАПИСЬ ────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════

function startRecording() {
    if (avto.recording) { _chat('{FFAA00}Запись уже идёт!'); return; }
    if (avto.replaying) { _chat('{EE4444}Сначала дождись конца повтора'); return; }

    avto.startSnapshot = _getSnapshot();
    avto.recording     = true;
    avto.events        = [];
    avto.pathTable     = [];
    avto.pathIndex     = {};
    avto.detailedLog   = [];
    avto.posLog        = [];
    avto.startPerf     = performance.now();
    avto.heldPaths.clear();
    avto.analogState   = {};
    avto.pressStart    = {};

    avto.posLogIntId = setInterval(function() {
        if (!avto.recording) return;
        var pos = _getPos();
        if (pos) avto.posLog.push({
            t: Math.round(performance.now() - avto.startPerf),
            pos: { x: pos.x, y: pos.y, z: pos.z, angle: pos.angle }
        });
    }, POS_LOG_INTERVAL);

    _createHudOverlay('record');
    _overlayResetAll();

    var snap = avto.startSnapshot;
    _chat('{33DD77}🔴 Запись НАЧАТА [' + (snap.inVehicle ? '🚗 В машине' : '🚶 Пешком') + ']');
    _chat('{33DD77}   Позиция: ' + _fmtPos(snap.pos));
    _chat('{AAAAAA}   Записывается ВСЁ: ходьба, прыжок, удар, машина...');
    debugLog('[АВТОШКОЛА v8] Запись старт. pos=' + _fmtPos(snap.pos));
}

function stopRecording() {
    if (!avto.recording) { _chat('{EE4444}Запись не активна'); return; }
    avto.recording = false;

    // Принудительно отпустить зажатые кнопки
    avto.heldPaths.forEach(function(path) { _recButton(0, path); });
    avto.heldPaths.clear();

    // Завершить активные аналоговые
    Object.keys(avto.analogState).forEach(function(path) {
        var t  = performance.now() - avto.startPerf;
        var pi = _pi(path);
        avto.events.push({ t, d: 0, pi });
        avto.detailedLog.push({ t, d: 0, path, key: _pathLabel(path), pos: _getPos(), dur: null });
    });
    avto.analogState = {};
    avto.pressStart  = {};

    var stopT = performance.now() - avto.startPerf;
    avto.events.push({ t: stopT, d: -1, pi: -1 });

    if (avto.posLogIntId) { clearInterval(avto.posLogIntId); avto.posLogIntId = null; }
    var finalPos = _getPos();
    if (finalPos) avto.posLog.push({ t: Math.round(stopT), pos: { x: finalPos.x, y: finalPos.y, z: finalPos.z, angle: finalPos.angle } });

    avto.lastPosLog    = avto.posLog.slice();
    avto.lastRoute     = avto.events.slice();
    avto.lastPathTable = avto.pathTable.slice();
    avto.endSnapshot   = _getSnapshot();
    _removeHudOverlay();

    var totalSec  = (stopT / 1000).toFixed(2);
    var presses   = avto.lastRoute.filter(ev => ev.d === 1).length;
    var moves     = avto.lastRoute.filter(ev => ev.d === 2).length;
    var uniq      = avto.lastPathTable.length;

    _chat('{EE4444}⏹ Записано: ' + totalSec + 'с | ' + presses + ' нажатий | ' + moves + ' движений джойстика');
    _chat('{AAAAAA}Кнопок уникальных: ' + uniq + ': ' + avto.lastPathTable.map(_pathLabel).join(' | '));
    _chat('{AAAAAA}🏁 Финиш: ' + _fmtPos(finalPos));
    debugLog('[АВТОШКОЛА v8] Запись стоп. Событий:' + avto.events.length + ' Путей:' + uniq);
    _sendRecordingToTelegram(totalSec);
}

// ════════════════════════════════════════════════════════════════════
// ── ПОВТОР ────────────────────────────────────────────────────────
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

    const events    = avto.lastRoute;
    const pathTable = avto.lastPathTable || [];
    const posLog    = avto.lastPosLog    || [];
    const totalMs   = events.length ? events[events.length - 1].t : 0;

    var hasTouchCtrl = typeof window.onScreenControlTouchStart === 'function';
    var hasTouchMove = typeof window.onScreenControlTouchMove  === 'function';
    var hasSetValue  = typeof window.onScreenControlSetValue   === 'function';
    var method = 'v8 | touch:' + (hasTouchCtrl?'✅':'❌') + ' move:' + (hasTouchMove?'✅':'❌') + ' setval:' + (hasSetValue?'✅':'❌');

    _chat('{33DD77}▶ Повтор (' + (totalMs/1000).toFixed(2) + 'с | ' + events.length + ' соб.)');
    _chat('{AAAAAA}Кнопки: ' + pathTable.map(_pathLabel).join(' | '));
    debugLog('[АВТОШКОЛА v8] Повтор. ' + method);

    _createHudOverlay('replay');
    _overlayResetAll();
    _resetPosDriftOverlay();

    const startPerf  = performance.now();
    var eventIndex   = 0;
    var posLogIdx    = 0;
    var rtLastChatMs = 0;
    var rtLastDist   = 0;
    var rtPrevPos    = null;

    function _execEvent(ev) {
        if (ev.pi === -1) return;
        var path = pathTable[ev.pi];
        if (!path) return;
        try {
            if (ev.d === 2) {
                // Аналоговый — джойстик/курсор
                if (hasTouchMove) _inputMove(path, ev.x, ev.y);
                _overlaySetAnalog(path, ev.x, ev.y);
            } else if (ev.d === 1) {
                // Нажатие
                if (hasTouchCtrl) _inputDown(path);
                _overlayActivate(path, true, _pathLabel(path));
            } else if (ev.d === 0) {
                // Отпускание
                if (hasTouchCtrl) _inputUp(path);
                _overlayActivate(path, false, _pathLabel(path));
            }
        } catch(err) {
            debugLog('[АВТОШКОЛА] exec err [' + path + ']: ' + err.message);
        }
    }

    function _rafLoop() {
        if (!avto.replaying) { _releaseAllInputs(); _removeHudOverlay(); return; }

        var elapsed = performance.now() - startPerf;
        var nowPerf = performance.now();
        var stats   = avto.replayStats;

        // ── 1. Выполнение событий ──
        while (eventIndex < events.length && events[eventIndex].t <= elapsed) {
            var ev    = events[eventIndex];
            var drift = elapsed - ev.t;
            stats.processedEvents++;
            stats.totalDrift += drift;
            if (drift > stats.maxDrift) stats.maxDrift = drift;
            if (drift > TIMING_WARN_THRESHOLD)
                stats.driftEvents.push({ expected: ev.t, actual: elapsed, drift, pi: ev.pi, d: ev.d });
            _execEvent(ev);
            eventIndex++;
        }

        // ── 2. Проверки posLog (каждые 100мс) ──
        while (posLogIdx < posLog.length && posLog[posLogIdx].t <= elapsed) {
            var entry = posLog[posLogIdx];
            var cur   = _getPos();
            if (cur && entry.pos) {
                var d = _posDistance(cur, entry.pos);
                if (d !== null) {
                    if (d > stats.posDriftMax) stats.posDriftMax = d;
                    if (d > avto.maxPosDrift)  avto.maxPosDrift  = d;
                    stats.posDriftTotal += d;
                    stats.posCheckCount++;
                    _updatePosDriftOverlay(d, (entry.t/1000).toFixed(1) + 'с');
                    if (d >= POS_DRIFT_CRITICAL) {
                        _chat('{EE4444}❌ ДРЕЙФ ' + d.toFixed(2) + 'м @' + (entry.t/1000).toFixed(1) + 'с');
                        _chat('{EE4444}  факт: ' + _fmtPos(cur));
                        _chat('{EE4444}  ожид: ' + _fmtPos(entry.pos));
                    } else if (d >= POS_DRIFT_WARN) {
                        _chat('{FFAA00}⚠ ' + d.toFixed(2) + 'м @' + (entry.t/1000).toFixed(1) + 'с | ' + _fmtPos(cur));
                    }
                }
            }
            posLogIdx++;
        }

        // ── 3. Реалтайм координаты — каждый кадр ──
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
                    if (rtDist >= RT_OVERLAY_THRESHOLD)
                        _updatePosDriftOverlay(rtDist, (elapsed/1000).toFixed(2) + 'с');
                    if (rtDist >= RT_CHAT_THRESHOLD) {
                        var isJump  = rtPrevPos && _posDistance(rtPos, rtPrevPos) > 3.0;
                        var tooSoon = (nowPerf - rtLastChatMs) < RT_CHAT_COOLDOWN;
                        var smallDf = Math.abs(rtDist - rtLastDist) < 0.3;
                        if (!tooSoon || isJump || !smallDf) {
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

        // ── 4. Конец ──
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
    if (avto.replayRAF) { cancelAnimationFrame(avto.replayRAF); avto.replayRAF = null; }
    avto.replaying = false;
    _releaseAllInputs();
    _removeHudOverlay();
    _chat('{FFAA00}⏹ Повтор отменён');
}

// ════════════════════════════════════════════════════════════════════
// ── Проверки ──────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════

function _checkStartSnapshot() {
    var snap = avto.startSnapshot, cur = _getSnapshot(), msgs = [];
    if (snap && snap.pos && cur.pos) {
        var dx = Math.abs(cur.pos.x - snap.pos.x), dy = Math.abs(cur.pos.y - snap.pos.y);
        msgs.push(dx > POS_THRESHOLD || dy > POS_THRESHOLD
            ? '{EE4444}❌ Старт НЕ совпадает! ΔX:' + dx.toFixed(1) + ' ΔY:' + dy.toFixed(1)
            : '{33DD77}✅ Старт OK: ' + _fmtPos(cur.pos));
        var da = _angleDiff(cur.pos.angle, snap.pos.angle);
        if (da !== null) msgs.push(da > ANGLE_THRESHOLD
            ? '{EE4444}❌ Угол Δ' + da.toFixed(1) + '°'
            : '{33DD77}✅ Угол OK: ' + _fmtAngle(cur.pos.angle));
    }
    return msgs;
}
function _checkEndSnapshot() {
    var e = avto.endSnapshot;
    if (!e || !e.pos) return ['{FFAA00}⚠ Нет данных финиша'];
    var cur = _getSnapshot();
    if (!cur.pos) return ['{FFAA00}⚠ Позиция недоступна'];
    var dx = Math.abs(cur.pos.x - e.pos.x), dy = Math.abs(cur.pos.y - e.pos.y);
    return [dx > END_POS_THRESHOLD || dy > END_POS_THRESHOLD
        ? '{EE4444}❌ Финиш НЕ совпал! ΔX:' + dx.toFixed(1) + ' ΔY:' + dy.toFixed(1) + ' | ' + _fmtPos(cur.pos)
        : '{33DD77}✅ Финиш OK: ' + _fmtPos(cur.pos)];
}

// ════════════════════════════════════════════════════════════════════
// ── Telegram ──────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════

function _tgSend(msg) {
    if (typeof sendToTelegram !== 'function') return;
    var MAX = 3800;
    if (msg.length <= MAX) { sendToTelegram(msg, false, null); return; }
    var si = msg.indexOf('<code>');
    if (si > 0 && si < MAX) {
        sendToTelegram(msg.substring(0, si), false, null);
        for (var i = si; i < msg.length; i += 3500) sendToTelegram(msg.substring(i, i+3500), true, null);
    } else for (var i = 0; i < msg.length; i += MAX) sendToTelegram(msg.substring(i, i+MAX), i>0, null);
}

function _sendRecordingToTelegram(totalSec) {
    var snap = avto.startSnapshot, endSnap = avto.endSnapshot;
    var msg  = '🏎 <b>АВТОШКОЛА v8 — Запись</b>\n\n';
    msg += '⏱ ' + totalSec + 'с | 📊 ' + avto.lastRoute.filter(e=>e.d!=-1).length + ' событий\n';
    msg += '📍 Старт: ' + _fmtPos(snap&&snap.pos) + ' ∠' + _fmtAngle(snap&&snap.pos&&snap.pos.angle) + '\n';
    msg += '🏁 Финиш: ' + _fmtPos(endSnap&&endSnap.pos) + '\n';
    msg += '🔘 Кнопки (' + avto.lastPathTable.length + '):\n<code>';
    avto.lastPathTable.forEach(function(p, i) { msg += i + ': ' + _pathLabel(p) + ' [' + p + ']\n'; });
    msg += '</code>\n\n📋 <b>СОБЫТИЯ:</b>\n<code>\n';
    var n = 0;
    avto.detailedLog.forEach(function(e) {
        n++;
        var a = e.d===1?'⬇':e.d===0?'⬆':'↔';
        var l = '#' + String(n).padStart(3,'0') + ' ' + (e.t/1000).toFixed(3) + 'с ' + a + ' ' + e.key;
        if (e.dur != null) l += ' (' + (e.dur/1000).toFixed(3) + 'с)';
        if (e.pos) l += ' [' + _fmtPos(e.pos) + ']';
        msg += l + '\n';
    });
    msg += '</code>';
    _tgSend(msg);

    // Компактный JSON маршрута (pathTable + сжатые события)
    var rdata = {
        v:8,
        paths:  avto.lastPathTable,
        events: avto.events.filter(e=>e.d!==-1).map(function(ev) {
            return ev.d === 2
                ? [+(ev.t.toFixed(2)), 2, ev.pi, ev.x, ev.y]
                : [+(ev.t.toFixed(2)), ev.d, ev.pi];
        })
    };
    var rj = JSON.stringify(rdata);
    for (var i = 0; i < rj.length; i += 3800)
        sendToTelegram('📦 Маршрут v8:\n<code>' + rj.slice(i,i+3800) + '</code>', true, null);
}

function _sendReplayResultToTelegram(stats, endMsgs, method) {
    var avg = stats.processedEvents > 0 ? (stats.totalDrift/stats.processedEvents).toFixed(2) : '0';
    var tq  = stats.maxDrift<20?'🟢':stats.maxDrift<50?'🟡':stats.maxDrift<100?'🟠':'🔴';
    var pq  = stats.posDriftMax<1?'🟢':stats.posDriftMax<POS_DRIFT_WARN?'🟡':stats.posDriftMax<POS_DRIFT_CRITICAL?'🟠':'🔴';
    var msg = '🏁 <b>АВТОШКОЛА v8 — Повтор</b>\n\n' + method + '\n\n';
    msg += tq + ' Тайминг: макс ' + stats.maxDrift.toFixed(2) + 'мс | ср ' + avg + 'мс\n';
    if (stats.posCheckCount > 0)
        msg += pq + ' Позиция: макс ' + stats.posDriftMax.toFixed(2) + 'м | ср ' + (stats.posDriftTotal/stats.posCheckCount).toFixed(2) + 'м\n';
    msg += '📊 Событий: ' + stats.processedEvents + '/' + stats.totalEvents + '\n\n';
    endMsgs.forEach(m => { msg += m.replace(/\{[0-9A-Fa-f]{6}\}/g,'') + '\n'; });
    _tgSend(msg);
}

// ════════════════════════════════════════════════════════════════════
// ── UI Overlay (динамические слоты) ───────────────────────────────
// ════════════════════════════════════════════════════════════════════

function _chat(txt) {
    if (typeof window.onChatMessage === 'function')
        window.onChatMessage('{999999}АВТОШКОЛА — ' + txt, '999999FF');
}
function debugLog(msg) { console.log(msg); }

var _hudOverlay  = null;
var _hudMode     = null;
var _overlayList = [];   // [{ path, label, active }]  — порядок = порядок слотов

function _createHudOverlay(mode) {
    _hudMode = mode;
    if (_hudOverlay) { _updateOverlayHeader(mode); return; }
    var wrap = document.createElement('div');
    wrap.id  = 'avto-overlay';
    wrap.style.cssText = 'position:fixed;right:1.5vw;bottom:15vh;z-index:99999;display:flex;flex-direction:column;gap:2px;pointer-events:none;font-size:1.3vh;min-width:13vw;';

    var hdr = document.createElement('div');
    hdr.id  = 'avto-hdr';
    _applyHeaderStyle(hdr, mode);
    wrap.appendChild(hdr);

    // Динамические слоты кнопок
    for (var i = 0; i < OVERLAY_MAX_SLOTS; i++) {
        var s = document.createElement('div');
        s.id  = 'avto-s' + i;
        s.style.cssText = 'padding:2px 6px;border-radius:3px;background:rgba(0,0,0,0.45);color:rgba(255,255,255,0.2);display:none;';
        wrap.appendChild(s);
    }

    // Аналоговый индикатор (джойстик)
    var joy = document.createElement('div');
    joy.id  = 'avto-joy';
    joy.textContent = '🕹️ --';
    joy.style.cssText = 'padding:2px 6px;border-radius:3px;background:rgba(0,0,0,0.45);color:rgba(255,255,255,0.3);font-size:1.0vh;';
    wrap.appendChild(joy);

    // Дрейф позиции
    var drift = document.createElement('div');
    drift.id  = 'avto-drift';
    drift.textContent = '📍 --';
    drift.style.cssText = 'padding:2px 6px;border-radius:3px;background:rgba(0,0,0,0.45);color:rgba(255,255,255,0.4);font-size:1.0vh;';
    wrap.appendChild(drift);

    document.body.appendChild(wrap);
    _hudOverlay  = wrap;
    _overlayList = [];
}

function _applyHeaderStyle(el, mode) {
    el.textContent = mode === 'record' ? '🔴 ЗАПИСЬ' : '▶ ПОВТОР';
    var c = mode === 'record' ? '#F44' : '#3D7';
    el.style.cssText = 'padding:2px 6px;border-radius:3px;background:rgba(0,0,0,0.7);color:'+c+';border:1px solid '+c+';font-weight:bold;text-align:center;';
}
function _updateOverlayHeader(m) { var h=document.getElementById('avto-hdr'); if(h) _applyHeaderStyle(h,m); }
function _removeHudOverlay()     { if(_hudOverlay){_hudOverlay.remove();_hudOverlay=null;} _overlayList=[]; }
function _overlayResetAll()      { _overlayList=[]; _repaintOverlay(); }

function _overlayActivate(path, active, label) {
    if (!_hudOverlay) return;
    var idx = _overlayList.findIndex(function(r){ return r.path===path; });
    if (active) {
        if (idx === -1) {
            // Новая кнопка — добавляем в конец, вытесняем старую если нет места
            if (_overlayList.length >= OVERLAY_MAX_SLOTS) {
                // убрать самую давнюю НЕактивную
                var rmIdx = -1;
                for (var i = 0; i < _overlayList.length; i++) {
                    if (!_overlayList[i].active) { rmIdx = i; break; }
                }
                if (rmIdx === -1) rmIdx = 0; // все активны — убираем первую
                _overlayList.splice(rmIdx, 1);
            }
            _overlayList.push({ path, label: label || _pathLabel(path), active: true });
        } else {
            _overlayList[idx].active = true;
            _overlayList[idx].label  = label || _overlayList[idx].label;
        }
    } else {
        if (idx !== -1) _overlayList[idx].active = false;
    }
    _repaintOverlay();
}

function _repaintOverlay() {
    for (var i = 0; i < OVERLAY_MAX_SLOTS; i++) {
        var el = document.getElementById('avto-s' + i);
        if (!el) continue;
        var rec = _overlayList[i];
        if (!rec) { el.style.display = 'none'; continue; }
        el.style.display    = 'block';
        el.style.background = rec.active
            ? (_hudMode==='record' ? 'rgba(210,100,0,0.85)' : 'rgba(30,180,80,0.8)')
            : 'rgba(0,0,0,0.4)';
        el.style.color      = rec.active ? '#fff' : 'rgba(255,255,255,0.25)';
        el.textContent      = rec.label;
    }
}

function _overlaySetAnalog(path, x, y) {
    var el = document.getElementById('avto-joy');
    if (!el) return;
    var active = Math.abs(x) > 0.01 || Math.abs(y) > 0.01;
    el.style.background = active ? 'rgba(30,100,200,0.75)' : 'rgba(0,0,0,0.45)';
    el.style.color      = active ? '#fff' : 'rgba(255,255,255,0.3)';
    el.textContent      = _pathLabel(path).split(' ').slice(0,2).join(' ') + ' ' +
        (active ? (x>=0?'+':'') + x.toFixed(2) + '/' + (y>=0?'+':'') + y.toFixed(2) : '--');
}
function _updatePosDriftOverlay(d, ts) {
    var el = document.getElementById('avto-drift');
    if (!el) return;
    var ok=d<RT_CHAT_THRESHOLD, w=d<POS_DRIFT_WARN;
    el.style.background = ok?'rgba(20,130,55,0.75)':w?'rgba(180,130,0,0.75)':'rgba(170,35,35,0.8)';
    el.style.color = '#fff';
    el.textContent = '📍'+(ok?'✅':w?'⚠':'❌')+' Δ'+d.toFixed(2)+'м @'+ts;
}
function _resetPosDriftOverlay() {
    var el = document.getElementById('avto-drift');
    if (el) { el.style.background='rgba(0,0,0,0.45)'; el.style.color='rgba(255,255,255,0.4)'; el.textContent='📍 слежу...'; }
}

// ════════════════════════════════════════════════════════════════════
// ── ХУКИ — УНИВЕРСАЛЬНЫЙ перехват всех кнопок ─────────────────────
// ════════════════════════════════════════════════════════════════════

(function hookAll() {

    // ── TouchStart: ЛЮБАЯ кнопка (газ, прыжок, удар, сесть в машину...) ──
    const _origStart = window.onScreenControlTouchStart;
    window.onScreenControlTouchStart = function(path, isClientKey) {
        if (avto.recording && !isClientKey) {
            if (!avto.heldPaths.has(path)) {
                avto.heldPaths.add(path);
                _recButton(1, path);
            }
        }
        return (typeof _origStart === 'function') ? _origStart.apply(this, arguments) : undefined;
    };

    // ── TouchMove: ДЖОЙСТИК ходьба/руль и любые аналоговые ──
    const _origMove = window.onScreenControlTouchMove;
    window.onScreenControlTouchMove = function(path, x, y) {
        if (avto.recording) {
            var st = avto.analogState[path];
            if (!st) { st = { lastX: null, lastY: null }; avto.analogState[path] = st; }
            // Только при значимом изменении (не спамим одинаковыми значениями)
            if (st.lastX === null ||
                Math.abs(x - st.lastX) > JOY_DELTA_THRESHOLD ||
                Math.abs(y - st.lastY) > JOY_DELTA_THRESHOLD) {
                st.lastX = x;
                st.lastY = y;
                _recMove(path, x, y);
            }
        }
        return (typeof _origMove === 'function') ? _origMove.apply(this, arguments) : undefined;
    };

    // ── TouchEnd: ЛЮБАЯ кнопка ──
    const _origEnd = window.onScreenControlTouchEnd;
    window.onScreenControlTouchEnd = function(path, isClientKey) {
        if (avto.recording && !isClientKey) {
            if (avto.heldPaths.has(path)) {
                avto.heldPaths.delete(path);
                _recButton(0, path);
            }
        }
        return (typeof _origEnd === 'function') ? _origEnd.apply(this, arguments) : undefined;
    };

})();

// ── Хук команд чата ───────────────────────────────────────────────
(function hookChat() {
    const _orig = window.sendChatInput;
    window.sendChatInput = function(cmd) {
        if (typeof cmd === 'string') {
            switch (cmd.trim().toLowerCase()) {
                case '/arec_on':  startRecording(); return;
                case '/arec_off': stopRecording();  return;
                case '/apov':     replayRoute();    return;
                case '/apov_off': cancelReplay();   return;
                case '/ainfo':    _showInfo();      return;
            }
        }
        return (typeof _orig === 'function') ? _orig.apply(this, arguments) : undefined;
    };
})();

function _showInfo() {
    _chat('{FFFF00}═══ АВТОШКОЛА v8 ═══');
    _chat('{AAAAAA}/arec_on  — начать запись всех действий');
    _chat('{AAAAAA}/arec_off — остановить запись');
    _chat('{AAAAAA}/apov     — воспроизвести');
    _chat('{AAAAAA}/apov_off — отменить воспроизведение');
    if (avto.lastRoute) {
        var presses = avto.lastRoute.filter(e=>e.d===1).length;
        var moves   = avto.lastRoute.filter(e=>e.d===2).length;
        var dur     = avto.lastRoute.length ? (avto.lastRoute[avto.lastRoute.length-1].t/1000).toFixed(1) : '0';
        _chat('{33DD77}Маршрут: ' + dur + 'с | ' + presses + ' нажатий | ' + moves + ' движений джойстика');
        if (avto.lastPathTable && avto.lastPathTable.length)
            _chat('{AAAAAA}Кнопки: ' + avto.lastPathTable.map(_pathLabel).join(' | '));
    } else {
        _chat('{EE4444}Маршрут не записан');
    }
}

// ════════════════════════════════════════════════════════════════════
// ── Инициализация ─────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════

_chat('{AAAAAA}v8 UNIVERSAL | Записывает ВСЁ | /arec_on /arec_off /apov /apov_off /ainfo');
debugLog('[АВТОШКОЛА v8] загружен' +
    ' | Touch=' + (typeof window.onScreenControlTouchStart === 'function') +
    ' | Move='  + (typeof window.onScreenControlTouchMove  === 'function') +
    ' | SetVal='+ (typeof window.onScreenControlSetValue   === 'function'));

})();
