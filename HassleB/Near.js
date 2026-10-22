// Near.js — игроки рядом через нативный мод Near (отдельный файл, Code3.js не тронут).
// Мод Near (libHassleExtended в APK) отдаёт по HTTP на 127.0.0.1:17771..17780:
//   /ping -> 'hassle-near'   /near -> JSON игроков рядом   /diag -> журнал мода   /rec?t=N -> реконнект (его делает rec.js)
// JSON /near: {ok, stage, ago, me:{id,x,y,z,vx,vy,vz,age,ping}, n:[{id,nick,label,x,y,z,vx,vy,vz,age,d,d2,hp,ar,ping,score,veh}]};
//   d — дистанция 3D, d2 — по горизонтали (м); список, сортировка и радиус считаются по d (3D); vx,vy,vz — скорость м/с; age — мс с последней смены позиции; ago — мс от тика мода до ответа.
//
// АКТУАЛЬНОСТЬ ПОЗИЦИИ (v2). Позиции берутся из sync-пакетов, поэтому отстают: мод читает их 10 раз/с, а Near.js знает возраст снимка
// (ago + пол-RTT запроса + время с получения) и скорости. Сервер проверяет дальность (/givelic: IsPlayerInRangeOfPoint 6.0, 3D) по СВОИМ
// позициям в момент прихода команды — они новее наших примерно на (ваш пинг + возраст данных). Поэтому цель сдвигается по скорости на
// этот горизонт, а к дистанции добавляется неопределённость err = 0.3 + 0.2·(скорость цели + ваша) м. Итог — вердикт для радиуса R:
//   'yes'   — точно в радиусе (dp + err ≤ R)     'no' — точно вне (dp − err > R)     'maybe' — серая зона, решает сервер.
//
// Чат-команды:
//   /near [м]      — игроки рядом (ближайшие первыми), показывает GameText внизу экрана; [м] — только ближе этого радиуса
//   /neartg [м]    — то же, но список уходит в Telegram (если бот запущен)
//   /neardiag      — журнал мода (консоль + Telegram) — для отладки, если /near не работает
//   /neardist <ID|ник> [м] — свежая проверка дальности до игрока: сырая и прогнозная дистанция, возраст данных, вердикт (по умолчанию 6 м)
//
// API для других скриптов (Code3 и т.д.), window.NearPlayers:
//   .list()          — массив игроков рядом, ближайшие первыми
//   .within(м)       — те, кто ближе м метров (3D)
//   .byNick('ivan')  — по части ника (без учёта регистра)
//   .byId(123)       — игрок по ID или null
//   .me()            — {id,x,y,z} или null
//   .status()        — {alive, ok, stage, age, ping}; alive=false — мода в APK нет / не отвечает; age — возраст данных, мс
//   .measure(p)      — {d, dp, err, h, age, vt, vm}: d — сырая 3D-дистанция, dp — прогноз на момент команды, err — неопределённость
//   .check(кто, R, cb) — СВЕЖИЙ запрос + вердикт: кто = ID или точный ник; cb({ok, found, p, d, dp, err, age, verdict, why})
//   .reach(R)        — те, кого сервер, скорее всего, посчитает в радиусе R (вердикт yes/maybe), по текущему снимку, с полями dp/err/verdict
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
var FRESH_MS = 1500, POLL_MS = 200, IDLE_MS = 15000;
var V_CAP = 40, H_CAP = 1500, ERR_BASE = 0.3, ERR_K = 0.2;   // потолок скорости (м/с), потолок горизонта прогноза (мс), параметры неопределённости
var base = null, snap = null, stamp = 0, snapAgo = 0, snapRtt = 0, busy = false, portIdx = 0;
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

// Принять снимок: запоминаем, когда получили, сколько мод держал его до ответа (ago) и сколько шёл запрос (RTT)
function ingest(j, t0) {
    var now = Date.now();
    snap = j; stamp = now;
    snapRtt = Math.max(0, now - t0);
    snapAgo = (j && typeof j.ago === 'number' && j.ago >= 0) ? j.ago : 0;
}
// Возраст данных на сейчас (мс): от тика мода до этого мгновения
function dataAge() { return stamp ? (Date.now() - stamp) + snapAgo + snapRtt / 2 : null; }

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
    var t0 = Date.now();
    xhr(base + '/near', function (t) {
        try { ingest(JSON.parse(t), t0); } catch (e) {}
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
        var t0 = Date.now();
        xhr(b + '/near', function (t) {
            var j = null;
            try { j = JSON.parse(t); } catch (e) {}
            if (j) ingest(j, t0);
            cb(j);
        }, function () { base = null; cb(null); }, 1500);
    });
}

function fresh() { return !!(snap && Date.now() - stamp < FRESH_MS); }
// Расстояние для списка/сортировки/радиуса — 3D (p.d), как проверяет сервер; если d нет — по горизонтали (d2)
function dist(p) { return p.d != null ? p.d : (p.d2 != null ? p.d2 : null); }
function sorted(arr) {
    return arr.slice().sort(function (a, b) { var da = dist(a), db = dist(b); return (da == null ? 1e9 : da) - (db == null ? 1e9 : db); });
}

// ── Прогноз дистанции на момент прихода команды на сервер ──
function spd(a, b, c) { return Math.sqrt(a * a + b * b + c * c); }
function hasPos(o) { return !!o && typeof o.x === 'number' && typeof o.y === 'number' && typeof o.z === 'number'; }
// p — игрок из снимка, me — ваша запись из снимка, age — возраст данных (мс)
function measure(p, me, age) {
    if (!hasPos(p) || !hasPos(me)) return null;
    var pvx = p.vx || 0, pvy = p.vy || 0, pvz = p.vz || 0, mvx = me.vx || 0, mvy = me.vy || 0, mvz = me.vz || 0;
    var st = spd(pvx, pvy, pvz), sm = spd(mvx, mvy, mvz);
    var k = st > V_CAP ? V_CAP / st : 1;                                // телепорт/скачок не считаем скоростью
    var rtt = me.ping > 0 ? me.ping : (p.ping || 0);                     // сервер видит цель новее нас на ≈ ваш RTT + возраст данных
    var h = Math.min(H_CAP, (age || 0) + rtt);
    var tx = p.x + pvx * k * h / 1000, ty = p.y + pvy * k * h / 1000, tz = p.z + pvz * k * h / 1000;
    var d = Math.sqrt(Math.pow(p.x - me.x, 2) + Math.pow(p.y - me.y, 2) + Math.pow(p.z - me.z, 2));
    var dp = Math.sqrt(Math.pow(tx - me.x, 2) + Math.pow(ty - me.y, 2) + Math.pow(tz - me.z, 2));   // вашу позицию не двигаем: сервер знает то, что вы отправили
    return { d: d, dp: dp, err: ERR_BASE + ERR_K * (st + sm), h: h, age: age == null ? null : Math.round(age), vt: st, vm: sm };
}
function verdictFor(m, r) {
    if (!m) return 'unknown';
    if (m.dp + m.err <= r) return 'yes';
    if (m.dp - m.err > r) return 'no';
    return 'maybe';
}
function normNick(s) { return String(s === undefined || s === null ? '' : s).replace(/\s+/g, '_').toLowerCase(); }
// кто — ID (число или строка из цифр) или ТОЧНЫЙ ник; вернёт игрока, 'many' (несколько совпадений) или null
function findWho(arr, who) {
    var i, hit = [];
    if (typeof who === 'number' || /^\d+$/.test(String(who))) {
        var id = Number(who);
        for (i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i];
        return null;
    }
    var w = normNick(who);
    if (!w) return null;
    for (i = 0; i < arr.length; i++) if (normNick(arr[i].nick) === w || normNick(arr[i].label) === w) hit.push(arr[i]);
    return hit.length === 1 ? hit[0] : (hit.length > 1 ? 'many' : null);
}

var API = {
    version: 2,
    list: function () {
        want();
        if (!fresh() || !snap.ok) return [];
        var arr = sorted(snap.n || []), age = dataAge(), i, m;
        for (i = 0; i < arr.length; i++) {
            m = measure(arr[i], snap.me, age);
            if (m) { arr[i].dp = m.dp; arr[i].err = m.err; }
        }
        return arr;
    },
    measure: function (p) { return fresh() ? measure(p, snap.me, dataAge()) : null; },
    reach: function (r) {
        var out = [], arr = this.list(), age = dataAge(), i, m, v;
        for (i = 0; i < arr.length; i++) {
            m = measure(arr[i], snap && snap.me, age); v = verdictFor(m, r);
            if (v === 'yes' || v === 'maybe') { arr[i].verdict = v; out.push(arr[i]); }
        }
        return out;
    },
    // Свежий запрос и вердикт «в радиусе R (по умолчанию 6 м, как /givelic) или нет»
    check: function (who, r, cb) {
        if (typeof r === 'function') { cb = r; r = 6; }
        r = r > 0 ? r : 6;
        refresh(function (j) {
            if (!j) return cb({ ok: false, why: 'мод Near не отвечает' });
            if (!j.ok) return cb({ ok: false, why: 'мод ещё не готов: ' + (j.stage || 'нет данных') });
            var p = findWho(j.n || [], who);
            if (p === 'many') return cb({ ok: true, found: false, ambiguous: true, verdict: 'unknown', why: 'несколько игроков с таким ником' });
            if (!p) return cb({ ok: true, found: false, verdict: 'unknown', why: 'игрока нет в зоне видимости клиента' });
            var m = measure(p, j.me, dataAge());
            if (!m) return cb({ ok: true, found: true, p: p, id: p.id, nick: p.nick, verdict: 'unknown', why: 'нет позиции (своей или игрока)' });
            cb({ ok: true, found: true, p: p, id: p.id, nick: p.nick, d: m.d, dp: m.dp, err: m.err, age: m.age, vt: m.vt, vm: m.vm, verdict: verdictFor(m, r), radius: r });
        });
    },
    within: function (m) { return this.list().filter(function (p) { var d = dist(p); return d != null && d <= m; }); },
    byNick: function (s) {
        s = String(s).toLowerCase();
        return this.list().filter(function (p) { return (p.nick || '').toLowerCase().indexOf(s) >= 0; });
    },
    byId: function (id) { return this.list().filter(function (p) { return p.id === id; })[0] || null; },
    me: function () { want(); return fresh() ? snap.me : null; },
    status: function () {
        want();
        return { alive: fresh(), ok: !!(snap && snap.ok), stage: snap ? snap.stage : 'нет связи с модом', age: stamp ? Math.round(dataAge()) : null, ping: snap && snap.me ? snap.me.ping : null };
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
    var d = dist(p);
    if (d == null) return '?';
    return (d < 10 ? d.toFixed(1) : String(Math.round(d))) + ' м';
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
        if (radius) arr = arr.filter(function (p) { var d = dist(p); return d != null && d <= radius; });
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

// /neardist <ID|ник> [м] — проверка дальности по свежему снимку
function showDist(who, radius) {
    if (!who) { gtAdd('~y~/neardist <ID|ник> [м]', 3000, 3); return; }
    API.check(who, radius || 6, function (r) {
        if (_dead) return;
        if (!r.ok) { gtAdd('~r~Near: ' + gtSafe(r.why), 4000, 3); return; }
        if (!r.found) { gtAdd('~y~Near: ' + gtSafe(r.why) + '~n~~w~' + gtSafe(who), 4000, 3); log('/neardist:', who, '—', r.why); return; }
        var col = r.verdict === 'yes' ? '~g~' : r.verdict === 'no' ? '~r~' : '~y~';
        var vtxt = r.verdict === 'yes' ? 'в радиусе' : r.verdict === 'no' ? 'вне радиуса' : r.verdict === 'maybe' ? 'серая зона — решает сервер' : 'нет данных';
        var line = gtSafe(r.nick || '?') + ' [' + r.id + ']';
        var l2 = 'сейчас ' + r.d.toFixed(1) + ' м → на сервере ~' + r.dp.toFixed(1) + ' ± ' + r.err.toFixed(1) + ' м';
        var l3 = 'возраст данных ' + r.age + ' мс · скорость цели ' + r.vt.toFixed(1) + ' / вы ' + r.vm.toFixed(1) + ' м/с';
        gtAdd(col + line + '~n~~w~' + l2 + '~n~~w~' + l3 + '~n~' + col + vtxt + ' (' + r.radius + ' м)', 6000, 3);
        log('/neardist:', line, l2, '|', l3, '|', r.verdict);
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
        if (cmd === '/neardist') { showDist(a[1], parseRadius(a[2])); return; }
    }
    if (typeof prevChat === 'function') return prevChat.apply(this, arguments);
};
window.sendChatInputCustom = myChat;
try { sendChatInput = myChat; } catch (e) {}
onUndo(function () {
    if (window.sendChatInputCustom === myChat) window.sendChatInputCustom = origChatWin;
    try { if (sendChatInput === myChat) sendChatInput = origChatVar || origChatWin; } catch (e) {}
});

log('Near.js v2 загружен: /near [м], /neartg [м], /neardist <ID|ник> [м], /neardiag; API: window.NearPlayers');

})(); } catch (e) { try { console.error('[NEAR] ошибка загрузки Near.js:', e); } catch (e2) {} }
