// rec.js — /rec: реконнект через нативный мод Near (перенесено из Code3.js без изменений логики)
// /rec [секунд] (1–600, по умолчанию 5): мод Near (HTTP 127.0.0.1:17771..17780) РАЗРЫВАЕТ соединение сразу
// (штатный RakPeer::CloseConnection с уведомлением серверу) и подключается заново через N секунд.
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

function recNative(sec) {
    var t = parseInt(sec, 10);
    if (isNaN(t)) t = 5;
    if (t < 1) t = 1;
    if (t > 600) t = 600;
    var ports = [], idx = 0, i;
    for (i = 0; i < 10; i++) ports.push(17771 + i);
    function get(url, ok, fail, timeout) {
        try {
            var r = new XMLHttpRequest();
            r.open('GET', url, true);
            r.timeout = timeout || 800;
            r.onload = function () { r.status === 200 ? ok(r.responseText) : fail(); };
            r.onerror = r.ontimeout = fail;
            r.send();
        } catch (e) { fail(); }
    }
    function next() {
        if (_dead) return;
        if (idx >= ports.length) {
            gtAdd('~r~Реконнект: мод Near не отвечает', 4000, 3);
            warn('/rec: мод Near не найден на портах 17771..17780');
            return;
        }
        var base = 'http://127.0.0.1:' + ports[idx++];
        get(base + '/ping', function (txt) {
            if (txt !== 'hassle-near') return next();
            get(base + '/rec?t=' + t, function (resp) {
                var j = null;
                try { j = JSON.parse(resp); } catch (e) {}
                if (j && j.ok) { gtAdd('~g~Отключено, подключение через ' + t + ' сек', 3000, 3); log('/rec: ок', resp); }
                else { gtAdd('~r~Реконнект: ' + (j && j.why ? j.why : 'ошибка'), 5000, 3); warn('/rec:', resp); }
            }, function () { gtAdd('~r~Реконнект: нет ответа от мода', 4000, 3); warn('/rec: нет ответа'); }, 3000);
        }, next, 400);
    }
    next();
}

// Чат-команда /rec. Цепочка как у Code3: window.sendChatInputCustom || sendChatInput
var origChatWin = window.sendChatInputCustom;
var origChatVar = null;
try { if (typeof sendChatInput === 'function') origChatVar = sendChatInput; } catch (e) {}
var prevChat = origChatWin || origChatVar;
var myChat = function (e) {
    if (!_dead && typeof e === 'string') {
        var a = e.trim().split(/\s+/);
        if ((a[0] || '').toLowerCase() === '/rec') { recNative(a[1]); return; }
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
