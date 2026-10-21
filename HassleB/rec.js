// rec.js — /rec: реконнект через нативный мод Near
// /rec [секунд] (1–600, по умолчанию 5): мод Near (HTTP 127.0.0.1:17771..17780) РАЗРЫВАЕТ соединение сразу
// (штатный RakPeer::CloseConnection с уведомлением серверу) и подключается заново через N секунд.
// /rec diag — диагностика: на каком порту/почему мод не отвечает, стадия сборщика (/near) и журнал (/diag) в консоль.
try { (function () {

if (typeof window.__recCleanup === 'function') { try { window.__recCleanup(); } catch (e) {} }

var _dead = false;
var _undo = [];
function onUndo(fn) { _undo.push(fn); }
window.__recCleanup = function () {
    _dead = true;
    while (_undo.length) { try { _undo.pop()(); } catch (e) {} }
    window.__recCleanup = null;
};

var PORT_FIRST = 17771, PORT_COUNT = 10;
var HOSTS = ['127.0.0.1'];            // при необходимости можно добавить 'localhost'
var PING_TIMEOUT = 2000;              // мс на один порт (раньше было 400 — на медленном устройстве/эмуляторе мало)

function log() { try { console.log.apply(console, ['[REC]'].concat([].slice.call(arguments))); } catch (e) {} }
function warn() { try { console.warn.apply(console, ['[REC]'].concat([].slice.call(arguments))); } catch (e) {} }
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

// Один GET. cb({ok, status, text, kind}) вызывается ровно один раз.
// kind: 'ok' | 'http' (ответ не 200) | 'error' (onerror) | 'timeout' | 'guard' (наш таймер) | 'throw:<текст>'
function httpGet(url, timeout, cb) {
    var done = false, r = null, guard = null;
    function fin(res) {
        if (done) return;
        done = true;
        if (guard) { try { clearTimeout(guard); } catch (e) {} }
        try { cb(res); } catch (e) { warn('cb:', e && e.message); }
    }
    try {
        r = new XMLHttpRequest();
        r.open('GET', url, true);
        try { r.timeout = timeout; } catch (e) {}
        r.onload = function () {
            var t = '';
            try { t = String(r.responseText || ''); } catch (e) {}
            fin({ ok: r.status === 200, status: r.status, text: t, kind: r.status === 200 ? 'ok' : 'http' });
        };
        r.onerror = function () { fin({ ok: false, status: 0, text: '', kind: 'error' }); };
        r.ontimeout = function () { fin({ ok: false, status: 0, text: '', kind: 'timeout' }); };
        // свой таймер на случай, если движок не поддерживает XHR.timeout/ontimeout
        guard = setTimeout(function () {
            fin({ ok: false, status: 0, text: '', kind: 'guard' });
            try { r.abort(); } catch (e) {}
        }, timeout + 500);
        r.send();
    } catch (e) {
        fin({ ok: false, status: 0, text: '', kind: 'throw:' + (e && e.message ? e.message : e) });
    }
}

// Пробуем все порты параллельно. cb(found, results): found = {base, port} или null
function findMod(cb) {
    var tasks = [], i, h;
    for (i = 0; i < PORT_COUNT; i++) for (h = 0; h < HOSTS.length; h++) tasks.push({ host: HOSTS[h], port: PORT_FIRST + i });
    var left = tasks.length, results = [], found = null, finished = false;
    function check() {
        if (finished) return;
        if (found || left === 0) { finished = true; cb(found, results); }
    }
    // сначала запомненный порт (если был) — без сканирования
    tasks.forEach(function (t) {
        var base = 'http://' + t.host + ':' + t.port;
        httpGet(base + '/ping', PING_TIMEOUT, function (res) {
            left--;
            var isNear = res.ok && res.text.indexOf('hassle-near') !== -1;
            results.push({ base: base, port: t.port, res: res, near: isNear });
            if (isNear && !found) { found = { base: base, port: t.port }; window.__recPort = found; }
            check();
        });
    });
}

function summarize(results) {
    var cnt = {}, k, parts = [];
    results.forEach(function (r) {
        var key = r.res.kind + (r.res.status ? ' ' + r.res.status : '') + (r.res.ok && !r.near ? ' (чужой ответ: ' + r.res.text.slice(0, 20) + ')' : '');
        cnt[key] = (cnt[key] || 0) + 1;
    });
    for (k in cnt) parts.push(k + '×' + cnt[k]);
    return parts.join(', ');
}

function clampSec(sec) {
    var t = parseInt(sec, 10);
    if (isNaN(t)) t = 5;
    if (t < 1) t = 1;
    if (t > 600) t = 600;
    return t;
}

function doRec(base, t) {
    httpGet(base + '/rec?t=' + t, 4000, function (res) {
        if (_dead) return;
        if (!res.ok) {
            window.__recPort = null;
            gtAdd('~r~Реконнект: нет ответа от мода (' + res.kind + ')', 5000, 3);
            warn('/rec: нет ответа', res);
            return;
        }
        var j = null;
        try { j = JSON.parse(res.text); } catch (e) {}
        if (j && j.ok) { gtAdd('~g~Отключено, подключение через ' + t + ' сек', 3000, 3); log('/rec: ок', res.text); }
        else { gtAdd('~r~Реконнект: ' + (j && j.why ? j.why : 'ошибка'), 5000, 3); warn('/rec:', res.text); }
    });
}

function recNative(sec) {
    var t = clampSec(sec);
    // быстрый путь: порт уже находили в этой сессии
    var known = window.__recPort;
    if (known && known.base) { doRec(known.base, t); return; }
    findMod(function (found, results) {
        if (_dead) return;
        if (found) { doRec(found.base, t); return; }
        var s = summarize(results);
        gtAdd('~r~Реконнект: мод Near не отвечает~n~~y~' + s, 7000, 3);
        warn('/rec: мод Near не найден на портах ' + PORT_FIRST + '..' + (PORT_FIRST + PORT_COUNT - 1) + '. Итог: ' + s);
        results.forEach(function (r) { warn('  ' + r.base + ' -> ' + JSON.stringify(r.res)); });
    });
}

// /rec diag — что именно происходит
function recDiag() {
    window.__recPort = null;
    findMod(function (found, results) {
        if (_dead) return;
        if (!found) {
            var s = summarize(results);
            gtAdd('~r~Near diag: не отвечает~n~~y~' + s, 8000, 3);
            warn('diag: мод не найден. Итог: ' + s);
            results.forEach(function (r) { warn('  ' + r.base + ' -> ' + JSON.stringify(r.res)); });
            return;
        }
        httpGet(found.base + '/near', 3000, function (res) {
            var stage = '?', n = '?', tick = '?';
            try { var j = JSON.parse(res.text); stage = j.stage; n = (j.n || []).length; tick = j.tick; } catch (e) {}
            gtAdd('~g~Near OK, порт ' + found.port + '~n~~w~стадия: ' + stage + '~n~игроков рядом: ' + n + ', tick ' + tick, 8000, 3);
            log('diag: порт ' + found.port + ', /near:', res.text.slice(0, 300));
            httpGet(found.base + '/diag', 3000, function (d) { log('diag: журнал мода:\n' + d.text); });
        });
    });
}

// Чат-команда /rec. Цепочка как у Code3: window.sendChatInputCustom || sendChatInput
var origChatWin = window.sendChatInputCustom;
var origChatVar = null;
try { if (typeof sendChatInput === 'function') origChatVar = sendChatInput; } catch (e) {}
var prevChat = origChatWin || origChatVar;
var myChat = function (e) {
    if (!_dead && typeof e === 'string') {
        var a = e.trim().split(/\s+/);
        if ((a[0] || '').toLowerCase() === '/rec') {
            if ((a[1] || '').toLowerCase() === 'diag') recDiag(); else recNative(a[1]);
            return;
        }
    }
    if (typeof prevChat === 'function') return prevChat.apply(this, arguments);
};
window.sendChatInputCustom = myChat;
try { sendChatInput = myChat; } catch (e) {}
onUndo(function () {
    if (window.sendChatInputCustom === myChat) window.sendChatInputCustom = origChatWin;
    try { if (sendChatInput === myChat) sendChatInput = origChatVar || origChatWin; } catch (e) {}
});

})(); } catch (e) { try { console.error('[REC] ошибка загрузки rec.js:', e); } catch (e2) {} }
