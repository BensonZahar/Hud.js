// Near.js — игроки рядом через нативный мод Near (отдельный файл, Code3.js не тронут).
// Мод Near (libHassleExtended в APK) отдаёт по HTTP на 127.0.0.1:17771..17780:
//   /ping -> 'hassle-near'   /near -> JSON игроков рядом   /diag -> журнал мода   /rec?t=N -> реконнект (его делает rec.js)
// JSON /near: {ok, stage, me:{id,x,y,z}, n:[{id,nick,label,x,y,z,d,d2,hp,ar,ping,score,veh}]}; d — дистанция 3D, d2 — по горизонтали (м).
//
// Чат-команды:
//   /near [м]      — игроки рядом (ближайшие первыми), показывает GameText внизу экрана; [м] — только ближе этого радиуса
//   /neartg [м]    — то же, но список уходит в Telegram (если бот запущен)
//   /neardiag      — журнал мода (консоль + Telegram) — для отладки, если /near не работает
//
// API для других скриптов (Code3 и т.д.), window.NearPlayers:
//   .list()          — массив игроков рядом, ближайшие первыми
//   .within(м)       — те, кто ближе м метров (по горизонтали)
//   .byNick('ivan')  — по части ника (без учёта регистра)
//   .byId(123)       — игрок по ID или null
//   .me()            — {id,x,y,z} или null
//   .status()        — {alive, ok, stage, age}; alive=false — мода в APK нет / не отвечает
//   .refresh(cb)     — один свежий запрос: cb(снимок | null)
//   .diag(cb)        — cb(текст журнала мода)
//   .start() / .stop() — постоянный опрос раз в 0,5 с (по умолчанию опрос включается сам при вызове list/within/… и гаснет через 15 с без вызовов)
// Первый вызов list() после паузы вернёт [] (опрос только стартует) — через ~0,5 с данные уже есть; если нужен ответ сразу — refresh(cb).
try { (function () {

if (typeof window.__nearCleanup === 'function') { try { window.__nearCleanup(); } catch (e) {} }

var _dead = false;
var _undo = [];
function onUndo(fn) { _undo.push(fn); }
window.__nearCleanup = function () {
    _dead = true;
    while (_undo.length) { try { _undo.pop()(); } catch (e) {} }
    window.__nearCleanup = null;
};

function log() { try { console.log.apply(console, ['[NEAR]'].concat([].slice.call(arguments))); } catch (e) {} }
function warn() { try { console.warn.apply(console, ['[NEAR]'].concat([].slice.call(arguments))); } catch (e) {} }
function iface(name) { try { return (window.interface && window.interface(name)) || null; } catch (e) { return null; } }

// GameText-уведомление: ~n~ перенос, ~r~ ~g~ ~y~ ~w~ ~b~ ~o~ ~d~ цвета; type 3 = низ экрана
function gtAdd(text, duration, type) {
    try {
        var gt = iface('GameText');
        if (gt && typeof gt.add === 'function') {
            gt.add(JSON.stringify([type !== undefined ? type : 3, text, duration !== undefined ? duration : 3000, 0, 0, true, false, 2.0]));
        }
    } catch (e) {}
}
function esc(s) { return String(s === undefined || s === null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function gtSafe(s) { return String(s === undefined || s === null ? '' : s).replace(/~/g, ''); }   // '~' в нике сломал бы разметку GameText
// Telegram: sendToTelegram живёт в области видимости Code.js (сюда файл подклеивается eval'ом в неё же, как Code3)
function tgSend(html) {
    try { if (typeof sendToTelegram === 'function') { sendToTelegram(html, false, null); return true; } } catch (e) { warn('Telegram:', e && e.message); }
    return false;
}

// ══════════════════════════ СВЯЗЬ С МОДОМ ══════════════════════════
var PORTS = [], i0;
for (i0 = 0; i0 < 10; i0++) PORTS.push(17771 + i0);
var FRESH_MS = 3000, POLL_MS = 500, IDLE_MS = 15000;
var base = null, snap = null, stamp = 0, busy = false, portIdx = 0;
var wantUntil = 0, keepOn = false, timer = null;

function xhr(url, ok, fail, timeout) {
    try {
        var r = new XMLHttpRequest();
        r.open('GET', url, true);
        r.timeout = timeout || 800;
        r.onload = function () { r.status === 200 ? ok(r.responseText) : fail(); };
        r.onerror = r.ontimeout = fail;
        r.send();
    } catch (e) { fail(); }
}

// Фоновый опрос: пока base неизвестен — по одному порту за такт (/ping), дальше — /near
function tick() {
    if (_dead || busy) return;
    if (!keepOn && Date.now() > wantUntil) { stopTimer(); return; }
    busy = true;
    var done = function () { busy = false; };
    if (!base) {
        var p = PORTS[portIdx++ % PORTS.length];
        xhr('http://127.0.0.1:' + p + '/ping', function (t) {
            if (t === 'hassle-near') base = 'http://127.0.0.1:' + p;
            done();
        }, done, 400);
        return;
    }
    xhr(base + '/near', function (t) {
        try { snap = JSON.parse(t); stamp = Date.now(); } catch (e) {}
        done();
    }, function () { base = null; done(); });
}
function startTimer() { if (timer || _dead) return; timer = setInterval(tick, POLL_MS); tick(); }
function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
function want() { wantUntil = Date.now() + IDLE_MS; startTimer(); }
onUndo(stopTimer);

// Разовые запросы (для чат-команд): сами ищут порт, ждут ответ
function findBase(cb) {
    if (base) return cb(base);
    var i = 0;
    (function nextPort() {
        if (_dead || i >= PORTS.length) return cb(null);
        var p = PORTS[i++];
        xhr('http://127.0.0.1:' + p + '/ping', function (t) {
            if (t === 'hassle-near') { base = 'http://127.0.0.1:' + p; cb(base); } else nextPort();
        }, nextPort, 400);
    })();
}
function refresh(cb) {
    findBase(function (b) {
        if (!b) return cb(null);
        xhr(b + '/near', function (t) {
            var j = null;
            try { j = JSON.parse(t); } catch (e) {}
            if (j) { snap = j; stamp = Date.now(); }
            cb(j);
        }, function () { base = null; cb(null); }, 1500);
    });
}

function fresh() { return !!(snap && Date.now() - stamp < FRESH_MS); }
function sorted(arr) {
    return arr.slice().sort(function (a, b) { return (a.d2 == null ? 1e9 : a.d2) - (b.d2 == null ? 1e9 : b.d2); });
}

var API = {
    list: function () { want(); if (!fresh() || !snap.ok) return []; return sorted(snap.n || []); },
    within: function (m) { return this.list().filter(function (p) { return p.d2 != null && p.d2 <= m; }); },
    byNick: function (s) {
        s = String(s).toLowerCase();
        return this.list().filter(function (p) { return (p.nick || '').toLowerCase().indexOf(s) >= 0; });
    },
    byId: function (id) { return this.list().filter(function (p) { return p.id === id; })[0] || null; },
    me: function () { want(); return fresh() ? snap.me : null; },
    status: function () {
        want();
        return { alive: fresh(), ok: !!(snap && snap.ok), stage: snap ? snap.stage : 'нет связи с модом', age: stamp ? Date.now() - stamp : null };
    },
    refresh: refresh,
    diag: function (cb) {
        findBase(function (b) {
            if (!b) return cb('нет связи с модом');
            xhr(b + '/diag', cb, function () { cb('ошибка'); }, 1500);
        });
    },
    start: function () { keepOn = true; startTimer(); },
    stop: function () { keepOn = false; }
};
window.NearPlayers = API;
onUndo(function () { if (window.NearPlayers === API) { try { delete window.NearPlayers; } catch (e) { window.NearPlayers = undefined; } } });

// ══════════════════════════ КОМАНДЫ ЧАТА ══════════════════════════
function fmtDist(p) {
    if (p.d2 == null) return '?';
    return (p.d2 < 10 ? p.d2.toFixed(1) : String(Math.round(p.d2))) + ' м';
}
function pName(p) { return p.nick || p.label || '?'; }
function parseRadius(s) {
    var r = parseFloat(String(s === undefined ? '' : s).replace(',', '.'));
    if (isNaN(r) || r <= 0) return 0;
    return r > 2000 ? 2000 : r;
}

// toTg=false — GameText в игре; true — HTML-сообщение в Telegram
function showNear(radius, toTg) {
    refresh(function (j) {
        if (_dead) return;
        var why = null;
        if (!j) why = 'мод Near не отвечает (нужен APK с модом)';
        else if (!j.ok) why = 'мод ещё не готов: ' + (j.stage || 'нет данных');
        if (why) {
            gtAdd('~r~Near: ' + gtSafe(why), 4500, 3);
            warn('/near:', why);
            if (toTg) tgSend('📍 <b>Игроки рядом</b>\n❌ ' + esc(why));
            return;
        }
        var arr = sorted(j.n || []);
        if (radius) arr = arr.filter(function (p) { return p.d2 != null && p.d2 <= radius; });
        var head = 'Рядом: ' + arr.length + (radius ? ' (до ' + radius + ' м)' : '');
        log(head);
        var k;
        for (k = 0; k < arr.length; k++) {
            var q = arr[k];
            log((k + 1) + '. ' + pName(q) + ' [' + q.id + '] ' + fmtDist(q) + ' hp ' + q.hp + ' ar ' + q.ar + ' ping ' + q.ping + (q.veh ? ' veh ' + q.veh : ''));
        }
        if (toTg) {
            var TG_MAX = 40, tl = ['📍 <b>' + esc(head) + '</b>'];
            for (k = 0; k < arr.length && k < TG_MAX; k++) {
                var t = arr[k];
                tl.push((k + 1) + '. <b>' + esc(pName(t)) + '</b> [' + esc(t.id) + '] — ' + esc(fmtDist(t)) + ' · HP ' + esc(t.hp) + (t.ar ? ' · бр. ' + esc(t.ar) : '') + (t.veh ? ' · 🚗' : ''));
            }
            if (arr.length > TG_MAX) tl.push('… и ещё ' + (arr.length - TG_MAX));
            if (!arr.length) tl.push('никого нет');
            if (tgSend(tl.join('\n'))) gtAdd('~g~Near: список отправлен в Telegram (' + arr.length + ')', 3000, 3);
            else gtAdd('~r~Near: Telegram недоступен', 3500, 3);
            return;
        }
        if (!arr.length) { gtAdd('~y~Рядом никого нет' + (radius ? '~n~~w~в радиусе ' + radius + ' м' : ''), 3500, 3); return; }
        var MAX = 8, lines = [];
        for (k = 0; k < arr.length && k < MAX; k++) lines.push(gtSafe(pName(arr[k])) + ' [' + arr[k].id + '] ' + fmtDist(arr[k]));
        if (arr.length > MAX) lines.push('~y~… и ещё ' + (arr.length - MAX));
        gtAdd('~g~' + head + '~n~~w~' + lines.join('~n~'), 6000, 3);
    });
}

function showDiag() {
    API.diag(function (txt) {
        if (_dead) return;
        txt = String(txt === undefined || txt === null ? '' : txt);
        log('журнал мода:\n' + txt);
        var ok = txt && txt !== 'нет связи с модом' && txt !== 'ошибка';
        if (!ok) { gtAdd('~r~Near: ' + gtSafe(txt || 'нет ответа'), 4000, 3); return; }
        var sent = tgSend('📍 <b>Журнал мода Near</b>\n<pre>' + esc(txt.length > 3500 ? txt.slice(-3500) : txt) + '</pre>');
        gtAdd(sent ? '~g~Near: журнал отправлен в Telegram' : '~g~Near: журнал в консоли', 3000, 3);
    });
}

// Цепочка чата как у Code3 / rec.js: window.sendChatInputCustom || sendChatInput
var origChatWin = window.sendChatInputCustom;
var origChatVar = null;
try { if (typeof sendChatInput === 'function') origChatVar = sendChatInput; } catch (e) {}
var prevChat = origChatWin || origChatVar;
var myChat = function (e) {
    if (!_dead && typeof e === 'string') {
        var a = e.trim().split(/\s+/), cmd = (a[0] || '').toLowerCase();
        if (cmd === '/near') { showNear(parseRadius(a[1]), false); return; }
        if (cmd === '/neartg') { showNear(parseRadius(a[1]), true); return; }
        if (cmd === '/neardiag') { showDiag(); return; }
    }
    if (typeof prevChat === 'function') return prevChat.apply(this, arguments);
};
window.sendChatInputCustom = myChat;
try { sendChatInput = myChat; } catch (e) {}
onUndo(function () {
    if (window.sendChatInputCustom === myChat) window.sendChatInputCustom = origChatWin;
    try { if (sendChatInput === myChat) sendChatInput = origChatVar || origChatWin; } catch (e) {}
});

log('Near.js загружен: /near [м], /neartg [м], /neardiag; API: window.NearPlayers');

})(); } catch (e) { try { console.error('[NEAR] ошибка загрузки Near.js:', e); } catch (e2) {} }
