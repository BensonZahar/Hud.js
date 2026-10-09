// ╔══════════════════════════════════════════════════════════════════════╗
// ║  Code3.js — ПОМОЩНИК ЛИЦЕНЗЁРА (Правительство) для HassleB          ║
// ║  Порт функций Лицензёра из pravo.js. Работает рядом с Code.js/Code2.js║
// ║                                                                      ║
// ║  Что есть:                                                           ║
// ║   • панель Interactions: «Лицензёр: меню» / «Перевыдать» / «Выдать»  ║
// ║   • пункт «Выдача лицензии» в радиальном меню игрока (PlayerInter.)  ║
// ║   • «Круговое меню»: меню игрока сразу открывает выбор лицензии      ║
// ║   • диалоги: ввод ID → тип лицензии → /givelic <ID> <тип> <цена>     ║
// ║   • авто-перевыдача (/cancel + повтор) с учётом антифлуда сервера    ║
// ║   • «Просьба о чае» и авто-ответы игроку (штрафы, запрет, нет денег) ║
// ║   • /code3 — вкл/выкл режим «в консоли только логи Code3» (логи      ║
// ║     Code.js и Code2.js скрываются; /code3 on · /code3 off)           ║
// ║   • /dahk — меню лицензёра; /givelic и /givelic <ID> показывают наши ║
// ║     диалоги поверх штатной команды                                   ║
// ║   • кнопка «Ответ» у входящих SMS → «Место» / «Ценовая политика»     ║
// ║   • Telegram: «Ответ» под входящим SMS (ответ SMS) и под сообщениями ║
// ║     собеседника в разговоре — после ответа на входящий звонок или   ║
// ║     когда ответили на ваш исходящий (текст прямо в разговор, без /p);║
// ║     «Круговое меню» и                                                ║
// ║     «Просьба о чае» в меню «Лицензёр» (как в игре)                   ║
// ║                                                                      ║
// ║   • проверка ник ↔ ID через серверный /id перед /givelic (v1.17):    ║
// ║     ID не тот / игрока нет → выдача отменяется, ник берётся с сервера ║
// ║   • v1.19: список игроков (PlayersOnline) УДАЛЁН полностью —         ║
// ║     ID по нику и проверка идут только через серверный /id            ║
// ║                                                                      ║
// ║   • v1.20 (тест): внизу файла блок TAB TEST — /tab открывает         ║
// ║     PlayersOnline, читает ВЕСЬ список игроков и шлёт его в Telegram, ║
// ║     пишет, удалось ли; поверх окна есть кнопка ✕ (закрыть с телефона)║
// ║     /tab quiet — без окна; кнопка «Скрыть»; ID по нику сверяется со  ║
// ║     списком игроков, совпадение → Telegram                           ║
// ║                                                                      ║
// ║  Чего НЕТ (специально): авто-снаряжение, «Повседневная», хоткеи,     ║
// ║  мышь/колесо, перетаскивание окон.                                   ║
// ║                                                                      ║
// ║  Доступно только в правительственном скине со званием «Лицензёр».    ║
// ║  Звание берётся из профиля, который уже грузит Code.js               ║
// ║  (window._hassleLoadPlayerProfile) — своего загрузчика профиля нет.  ║
// ║                                                                      ║
// ║  Настройки (необязательно): window.CODE3_OPTS = { ... } или          ║
// ║  USER_CONFIGS[<пользователь>].CODE3 = { ... } в List.js. Ключи — в   ║
// ║  объекте OPTS ниже.                                                  ║
// ╚══════════════════════════════════════════════════════════════════════╝
try { (function () {

// ── Повторная загрузка: сначала снимаем всё, что поставил прошлый запуск ──
if (typeof window.__code3Cleanup === 'function') { try { window.__code3Cleanup(); } catch (e) {} }

var VERSION = 'code3 v1.19';
var _dead = false;          // true после cleanup — «старые» обёртки становятся прозрачными
var _undo = [];
function onUndo(fn) { _undo.push(fn); }
window.__code3Cleanup = function () {
    _dead = true;
    while (_undo.length) { try { _undo.pop()(); } catch (e) {} }
    window.__code3Cleanup = null;
};

function log() { try { console.log.apply(console, ['[CODE3]'].concat([].slice.call(arguments))); } catch (e) {} }
function warn() { try { console.warn.apply(console, ['[CODE3]'].concat([].slice.call(arguments))); } catch (e) {} }

// ══════════════════════════ НАСТРОЙКИ ══════════════════════════
var OPTS = (function () {
    var o = {
        LICENSOR_HELPER: true,   // главный выключатель всего помощника
        PANEL: true,             // кнопки в панели Interactions
        AUTO_REISSUE: true,      // «Перевыдать» (/cancel + повтор последнего /givelic)
        AUTO_REPLIES: true,      // авто-сообщения игроку: штрафы / запрет на оружие / нет денег / уже есть
        TEA_ASK: false,          // «Просьба о чае» по умолчанию (переключается в меню)
        TEA_TEXT: '{nick}, на чай не найдётся? А то 10 процентов с лицензии, буду благодарен',
        CIRCLE_LIC: false,       // «Круговое меню» по умолчанию (переключается в меню)
        RADIAL_BTN: true,        // пункт «Выдача лицензии» в радиальном меню игрока
        RADIAL_NATIVE: true,     // false — сразу запасная DOM-кнопка вместо пункта в круге
        RADIAL_SLOT: 4,          // сектор 0..7 (0 сверху, по часовой; 4 — низ)
        RADIAL_SIDE: 'left',     // 'right' — ставить справа от «Персонажа» (если RADIAL_SLOT не число)
        RADIAL_LABELS: true,     // показывать ники над игроками, пока раскрыт выбор лицензии
        RADIAL_LAYER_REVERSE: true,
        RADIAL_LAYER_SHIFT: null,
        RADIAL_ICON: '',         // своя иконка пункта: URL или data:image/...
        CHAT_UNDIM: true,        // чат поверх затемнения круга, пока раскрыт выбор лицензии
        SMS_BTN: true,           // кнопка «Ответ» у входящих SMS → «Место» / «Ценовая политика» (как в pravo.js)
        SMS_TEXT: '',            // свой текст пункта «Место» (пусто = «Здравствуйте, нахожусь в правительстве [/gps - Правительство]»)
        SMS_TEXT_PRICE: '',      // свой текст «Ценовой политики» (пусто = собирается из цен лицензий)
        ID_CHECK: true,          // перед /givelic спрашиваем сервер «/id <ID>» и сверяем ник (false — как раньше, без проверки)
        ID_CHECK_STRICT: false,  // true — если сервер на /id не ответил, выдачу отменяем; false — выдаём без проверки
        ID_CHECK_TTL: 15000,     // мс: подтверждённая пара ник↔ID не перепроверяется (перевыдача подряд)
        ID_CHECK_MS: 2500,       // мс: сколько ждать ответ сервера на /id
        TRACE: true,             // полное логирование радиального меню / поиска ID (консоль + буфер: __code3.trace())
        DEBUG: false
    };
    try { var g = window.CODE3_OPTS; if (g) for (var k in g) o[k] = g[k]; } catch (e) {}
    try {
        var u = window.USER_CONFIGS && window.USER_CONFIGS[window.CURRENT_USER];
        var uo = u && u.CODE3;
        if (uo) for (var k2 in uo) o[k2] = uo[k2];
    } catch (e) {}
    return o;
})();
function dbg() {
    var a = [].slice.call(arguments);
    if (OPTS.TRACE !== false) { try { tr.apply(null, ['dbg'].concat(a)); } catch (e) {} return; }   // dbg теперь пишется в трассировку всегда
    if (!OPTS.DEBUG) return;
    try { console.log.apply(console, ['[CODE3][dbg]'].concat(a)); } catch (e) {}
}

// ══════════════════════════ ТРАССИРОВКА (полное логирование радиального меню) ══════════════════════════
// Каждая строка уходит в консоль «[CODE3][RM] …» и в кольцевой буфер (последние 600 событий, переживает перезагрузку скрипта).
// «м12 +340мс» = номер открытия меню и миллисекунды с момента открытия. Одинаковые строки подряд (<1.5 с) схлопываются.
// Смотреть из консоли:  __code3.trace(80)  ·  __code3.traceText(150)  ·  __code3.traceCopy()  ·  __code3.lastFail()  ·  __code3.diag()
// Выключить: CODE3_OPTS = { TRACE: false }
var TRACE_MAX = 600;
var _trBuf = window.__code3Trace || (window.__code3Trace = []);
var _trSeq = window.__code3TraceSeq || 0;
var _rmSid = 0, _rmT0 = 0, _trPrev = '', _trPrevAt = 0, _trSkipped = 0, _trOnceKeys = {}, _lastFail = null;
function tstr(v) {
    try {
        if (v === undefined) return 'undefined';
        if (v === null) return 'null';
        if (typeof v === 'string') return v;
        if (typeof v === 'function') return 'fn';
        if (v instanceof Error) return (v.name || 'Error') + ': ' + v.message;
        return JSON.stringify(v);
    } catch (e) { return String(v); }
}
function tpad(n, w) { n = String(n); while (n.length < w) n = '0' + n; return n; }
function tstamp(t) { var d = new Date(t); return tpad(d.getHours(), 2) + ':' + tpad(d.getMinutes(), 2) + ':' + tpad(d.getSeconds(), 2) + '.' + tpad(d.getMilliseconds(), 3); }
function trEmit(body) {
    var now = Date.now();
    var line = '#' + (++_trSeq) + ' ' + tstamp(now) + (_rmSid ? ' м' + _rmSid + ' +' + (now - _rmT0) + 'мс' : '') + ' ' + body;
    window.__code3TraceSeq = _trSeq;
    _trBuf.push(line);
    if (_trBuf.length > TRACE_MAX) _trBuf.splice(0, _trBuf.length - TRACE_MAX);
    try { console.log('[CODE3][RM] ' + line); } catch (e) {}
}
function tr(tag) {
    if (OPTS.TRACE === false) return;
    try {
        var parts = [];
        for (var i = 1; i < arguments.length; i++) parts.push(tstr(arguments[i]));
        var body = tag + (parts.length ? ' | ' + parts.join(' | ') : '');
        var now = Date.now();
        if (body === _trPrev && now - _trPrevAt < 1500) { _trSkipped++; _trPrevAt = now; return; }
        if (_trSkipped) { trEmit('… предыдущая запись повторилась ещё ' + _trSkipped + ' раз(а)'); _trSkipped = 0; }
        _trPrev = body; _trPrevAt = now;
        trEmit(body);
    } catch (e) {}
}
function trOnce(key) {   // не чаще одного раза за одно открытие меню
    var k = _rmSid + ':' + key;
    if (_trOnceKeys[k]) return;
    _trOnceKeys[k] = 1;
    tr.apply(null, [].slice.call(arguments, 1));
}
function nickInfo(n) {
    if (n === undefined || n === null) return String(n);
    var s = String(n), out = JSON.stringify(s) + ' (длина ' + s.length + ')';
    if (/[^A-Za-z0-9_]/.test(s)) { var codes = []; for (var i = 0; i < s.length && i < 40; i++) codes.push(s.charCodeAt(i)); out += ' коды=[' + codes.join(',') + ']'; }
    return out;
}
function stateInfo() {
    var ready = false, gov = false, lic = false;
    try { ready = licensorReady(); gov = isGovSkin(); lic = isLicensor(); } catch (e) {}
    return 'скин=' + _skin + ' gov=' + gov + ' звание=' + JSON.stringify(_rank) + ' лицензёр=' + lic + ' ready=' + ready +
        ' | круговое(STATE.circle)=' + STATE.circle + ' RADIAL_BTN=' + OPTS.RADIAL_BTN + ' NATIVE=' + OPTS.RADIAL_NATIVE + ' | мобайл=' + isMobile();
}
// Полный дамп в консоль сразу при провале (без ручных команд): причина, состояние, последние 60 событий
function trFail(title, extra) {
    if (OPTS.TRACE === false) return;
    try {
        var txt = '═══ ' + title + ' ═══\n' + (extra ? extra + '\n' : '') + stateInfo() + '\n--- последние события ---\n' + _trBuf.slice(-60).join('\n');
        console.error('[CODE3][RM] ' + txt);
    } catch (e) {}
}
// Начало нового открытия меню игрока: новая «сессия» трассировки + полный снимок состояния
function rmBegin(params, nick) {
    _rmSid++; _rmT0 = Date.now(); _trOnceKeys = {};
    var raw = '';
    try { raw = (typeof params === 'string') ? params : JSON.stringify(params); } catch (e) { raw = String(params); }
    tr('═══ ОТКРЫТИЕ МЕНЮ ИГРОКА ═══', 'версия ' + VERSION);
    tr('OPEN/params', raw.length > 400 ? raw.slice(0, 400) + '…(' + raw.length + ')' : raw);
    tr('OPEN/ник', nickInfo(nick), 'NICK_RE=' + NICK_RE.test(nick));
    tr('OPEN/состояние', stateInfo());
}

// Состояние, которое переживает перезагрузку скрипта
var STATE = window.__code3State || (window.__code3State = { tea: !!OPTS.TEA_ASK, circle: !!OPTS.CIRCLE_LIC, last: null });

if (typeof STATE.only !== 'boolean') STATE.only = false;   // режим «в консоли только логи Code3» (/code3)

// ══════════════════════════ /code3: В КОНСОЛИ ТОЛЬКО ЛОГИ CODE3 ══════════════════════════
// Игра перенаправляет console.log/info/warn/error/debug в свою консоль, и Code.js/Code2.js пишут туда же ([DEBUG], [INTERACTIONS],
// [DBG3], [HB Menu]…). Пока STATE.only = true, пропускаем только вызовы, первый аргумент которых начинается с «[CODE3]»
// (все наши логи именно такие), остальное отбрасываем. /code3 ещё раз — всё возвращается.
var _conWrap = {};
var CON_METHODS = ['log', 'info', 'warn', 'error', 'debug'];
function isC3Line(args) { var a = args && args[0]; return typeof a === 'string' && /^\s*\[CODE3\]/.test(a); }
function ensureConsoleFilter() {
    if (_dead) return;
    CON_METHODS.forEach(function (m) {
        try {
            var cur = console[m];
            if (typeof cur !== 'function' || cur.__code3Filter === RUN) return;
            var w = function () {
                if (STATE.only && !_dead && !isC3Line(arguments)) return;
                return cur.apply(this, arguments);
            };
            w.__code3Filter = RUN;
            console[m] = w;
            _conWrap[m] = { w: w, prev: cur };
        } catch (e) {}
    });
}
onUndo(function () { CON_METHODS.forEach(function (m) { try { var c = _conWrap[m]; if (c && console[m] === c.w) console[m] = c.prev; } catch (e) {} }); });
function setOnly(v) {
    STATE.only = !!v;
    ensureConsoleFilter();
    log(STATE.only ? 'режим «только логи Code3» ВКЛ — логи Code.js/Code2.js скрыты (/code3 — вернуть)' : 'режим «только логи Code3» ВЫКЛ — логи Code.js/Code2.js снова видны');
    gtAdd(STATE.only ? '~g~/code3: Вкл~n~~w~В консоли только логи Code3' : '~r~/code3: Выкл~n~~w~Логи Code и Code2 снова видны', 3500, 3);
    return STATE.only;
}

// ══════════════════════════ ОБЩИЕ ХЕЛПЕРЫ ══════════════════════════
var GOV_SKINS = [57, 141, 147, 164, 165, 187, 208, 227, 16360];
var LIC_TYPES = [
    { name: 'Права',       type: 1, price: 10000 },
    { name: 'Проф. права', type: 2, price: 40000 },
    { name: 'Оружие',      type: 3, price: 85000 },
    { name: 'Рыбалка',     type: 4, price: 40000 },
    { name: 'Охота',       type: 5, price: 65000 }
];
var LIC_PHRASE = {
    1: { nom: 'водительские права',     acc: 'водительские права' },
    2: { nom: 'профессиональные права', acc: 'профессиональные права' },
    3: { nom: 'лицензия на оружие',     acc: 'лицензию на оружие' },
    4: { nom: 'лицензия на рыбалку',    acc: 'лицензию на рыбалку' },
    5: { nom: 'лицензия на охоту',      acc: 'лицензию на охоту' }
};

function iface(name) { try { return (window.interface && window.interface(name)) || null; } catch (e) { return null; } }
function isOpen(name) { try { return !!window.getInterfaceStatus(name); } catch (e) { return false; } }
function isMobile() { return !!(window.App && window.App.isMobile); }
function every(fn, ms) { var id = setInterval(fn, ms); onUndo(function () { clearInterval(id); }); return id; }

// Ставит обёртку на window[prop]. Откат — только если поверх нас никто не обернул
function hookProp(prop, factory) {
    var prev = window[prop];
    var mine = factory(prev);
    window[prop] = mine;
    onUndo(function () { if (window[prop] === mine) window[prop] = prev; });
    return mine;
}

// Отправка серверу «сырого» события (минуя наши и чужие обёртки и проверку «чат открыт»)
function srvSend(name, arg) {
    var evt = (window.gm && window.gm.EVENT_EXECUTE_PUBLIC !== undefined) ? window.gm.EVENT_EXECUTE_PUBLIC : 0;
    try { if (typeof window.sendClientEventHandle === 'function') { window.sendClientEventHandle(evt, name, arg); return true; } } catch (e) {}
    try { if (typeof window.sendClientEvent === 'function') { window.sendClientEvent(evt, name, arg); return true; } } catch (e) {}
    return false;
}

// GameText-уведомление: ~n~ перенос, ~r~ ~g~ ~y~ ~w~ ~b~ ~o~ ~d~ цвета; type 3 = низ экрана
function gtAdd(text, duration, type) {
    try {
        var gt = iface('GameText');
        if (gt && typeof gt.add === 'function') {
            gt.add(JSON.stringify([type !== undefined ? type : 3, text, duration !== undefined ? duration : 3000, 0, 0, true, false, 2.0]));
        }
    } catch (e) {}
}

// ══════════════════════════ НИК ЦЕЛИ ══════════════════════════
// Списка игроков движка (PlayersOnline / updatePlayerList) больше нет. И ID по нику, и проверка ник ↔ ID идут ТОЛЬКО через
// серверную команду /id (см. ниже «ПРОВЕРКА НИК ↔ ID ЧЕРЕЗ СЕРВЕРНЫЙ /id»).
// «1. Ник» → «Ник»: серверный «/id <ник>» отвечает нумерованным списком («1. Имя_Фамилия, ID: …»), а «/id <ID>» — без номера.
// Номер списка (и возможный префикс-время «[21:30:27]») — не часть ника, поэтому режем его везде, где ник берётся из ответа сервера.
function stripListPrefix(s) { return String(s === undefined || s === null ? '' : s).replace(/^\s*(?:\[\d{1,2}:\d{2}(?::\d{2})?\]\s*)?(?:\d+\s*[.)]\s*)?/, '').trim(); }
function norm(s) { return stripListPrefix(s).split(' ').join('_').toLowerCase(); }
var RUN = {};              // метка этого запуска (фильтр консоли /code3 отличает свои обёртки от обёрток прошлого запуска)
var _lastResolve = null;   // что и как определили в последний раз (смотреть: __code3.diag().lastResolve)
function noteResolve(nick, id, how) {
    _lastResolve = { nick: nick, id: id, how: how, at: Date.now() };
    log('ID цели:', nick, '→', id, '|', how);
    tr('ID/НАЙДЕН', nickInfo(nick), '→ ID ' + id, 'как: ' + how);
}
// ── Ник цели ПОСЛЕДНЕЙ выдачи ──
// ID в SA-MP переиспользуются, поэтому ник запоминаем в момент /givelic в STATE.last.rawNick: это ответ сервера на «/id <ID>»
// (verifiedNick), а если сервер не ответил — ник из меню игрока (hintRaw). Ответы сервера («штрафы», «нет денег»…) приходят позже и
// не содержат ника — берём запомненный.
function lastRaw(id) {
    var l = STATE.last;
    return (l && l.nickFresh && String(l.targetId) === String(id) && l.rawNick) ? l.rawNick : null;
}
function refreshLastNick() {
    var l = STATE.last; if (!l) return;
    var rn = stripListPrefix(l.verifiedNick || l.hintRaw || '') || null;
    l.rawNick = rn; l.nickFresh = true; l.nickAt = Date.now();
    if (rn) l.nick = String(rn).split('_').join(' ');
    tr('GIVE/ник цели', 'ID ' + l.targetId, 'ник: ' + (rn || '—'), 'источник: ' + (l.verifiedNick ? 'сервер (/id)' : (l.hintRaw ? 'меню игрока' : 'нет')));
    var w = l._nw || []; l._nw = [];
    for (var i = 0; i < w.length; i++) { try { w[i](l.rawNick); } catch (er) {} }
}
// cb(rawНик|null): сразу, если ник последней выдачи уже определён, иначе — как только определится
function whenNick(id, cb) {
    var l = STATE.last;
    if (l && String(l.targetId) === String(id)) {
        if (l.nickFresh) return cb(l.rawNick);
        if (l._nw) { l._nw.push(cb); return; }
    }
    cb(null);
}

// ── ID по нику через сервер: «/id Имя_Фамилия» → «Имя_Фамилия, ID: N, уровень: …» ──
var _idWhy = '';   // почему последний поиск не удался: none | timeout | flood | busy
function srvWhy() {
    return _idWhy === 'none' ? 'игрока с таким ником нет (маска/фейк-ник?)' : _idWhy === 'timeout' ? 'сервер не ответил на /id' : _idWhy === 'flood' ? 'антифлуд сервера, повторите' : _idWhy === 'busy' ? 'предыдущая проверка ещё идёт' : 'не удалось определить ID';
}
// cb(id|null) — id строкой; при неудаче причина в srvWhy()
function resolveId(nick, cb) {
    _idWhy = '';
    lookupIdByNick(nick, function (res) {
        if (_dead) return;
        var id = null;
        if (res.ok === true && res.id !== undefined && res.id !== null) {
            id = String(res.id); noteResolve(nick, id, 'сервер /id (' + (res.name || '') + ')');
            // сверка со списком игроков (блок TAB TEST внизу файла): ничего не ждём и не шлём в игру; совпало → пишем в Telegram
            try { if (window.__code3tab && typeof window.__code3tab.crossCheck === 'function') window.__code3tab.crossCheck(nick, id, res.name || ''); } catch (e) {}
        }
        else {
            _idWhy = res.reason || 'timeout';
            tr('ID/НЕ НАЙДЕН', nickInfo(nick), 'сервер /id: ' + _idWhy);
            _lastFail = { at: new Date().toISOString(), nick: nick, why: srvWhy(), state: stateInfo(), trace: _trBuf.slice(-60) };
        }
        try { cb(id); } catch (e) { warn('resolveId cb:', e); }
    });
}

// ══════════════════════════ СКИН И ЗВАНИЕ ══════════════════════════
var _skin = null, _rank = '', _rankTimer = null, _announced = false;

function getStore() {
    try { if (window.App && window.App.$store) return window.App.$store; } catch (e) {}
    var names = ['Menu', 'Hud', 'MainMenu'];
    for (var i = 0; i < names.length; i++) { var c = iface(names[i]); if (c && c.$store) return c.$store; }
    return null;
}
function readSkin() {
    try { var st = getStore(); if (st && st.getters['player/skinId'] !== undefined) return Number(st.getters['player/skinId']); } catch (e) {}
    return null;
}
function isGovSkin() { return GOV_SKINS.indexOf(_skin) !== -1; }
function isLicensor() { return /лиценз[её]р/i.test(_rank || ''); }
// Всё, что делает помощник, доступно только при выполнении трёх условий сразу
function licensorReady() { return !!OPTS.LICENSOR_HELPER && isGovSkin() && isLicensor(); }

// Звание берём из профиля Code.js (config.accountInfo.profile.rank). Если профиль уже загружен —
// колбэк вызывается сразу; если нет — Code.js сам его догружает, мы просто ждём
function pullRank(cb) {
    var f = window._hassleLoadPlayerProfile;
    if (typeof f !== 'function') { if (cb) cb(false); return; }
    try {
        f(function (p) {
            if (_dead) return;
            var r = (p && p.rank) ? String(p.rank) : '';
            if (!r && _rank) { tr('RANK/пустой ответ профиля — оставляем прежнее звание', JSON.stringify(_rank)); if (cb) cb(true); return; }
            if (r !== _rank) {
                _rank = r;
                log('звание:', r || '—', licensorReady() ? '→ помощник лицензёра активен' : '');
                if (licensorReady() && !_announced) { _announced = true; gtAdd('~g~Помощник лицензёра~n~~w~Готов к работе', 3000, 3); }
                updatePanel();
            }
            if (cb) cb(!!r);
        });
    } catch (e) { if (cb) cb(false); }
}
function ensureRank() {
    if (_rankTimer) { clearTimeout(_rankTimer); _rankTimer = null; }
    if (!isGovSkin()) return;
    var tries = 0;
    (function step() {
        if (_dead || !isGovSkin()) return;
        pullRank(function (ok) {
            if (_dead) return;
            tries++;
            if (!ok && tries < 8) _rankTimer = setTimeout(step, 5000 + tries * 2000);
        });
    })();
}
function onSkin(n) {
    if (n === null || n === undefined || isNaN(n) || n === _skin) return;
    _skin = n;
    log('скин', n, isGovSkin() ? '— правительственный' : '— не правительственный');
    ensureRank();
    setTimeout(updatePanel, 150);
}
(function startSkinWatch() {
    if (_dead) return;
    var st = getStore();
    if (!st || !st.state || !st.state.player) { setTimeout(startSkinWatch, 300); return; }
    onSkin(readSkin());
    try {
        var un = st.watch(function (state) { return state.player.skinId; }, function (v) { onSkin(Number(v)); });
        onUndo(function () { try { if (typeof un === 'function') un(); } catch (e) {} });
    } catch (e) { warn('store.watch не удался, скин проверяется поллингом', e); every(function () { onSkin(readSkin()); }, 3000); }
})();

// ══════════════════════════ АНТИФЛУД И ОТПРАВКА ══════════════════════════
// Зеркало серверного антифлуда: каждая команда/сообщение rate += 1000, затем rate -= прошедшее время.
// rate >= 3000 → «Не флудите», команда НЕ выполняется; rate >= 6000 → кик. Перевыдача = /cancel + /givelic = 2 команды.
var FLOOD_MAX = 3000, FLOOD_INC = 1000, FLOOD_MARGIN = 200;
var _flood = { rate: 0, last: Date.now() };
function floodDecay() { var n = Date.now(); _flood.rate = Math.max(0, _flood.rate - (n - _flood.last)); _flood.last = n; }
function floodNote(n) { floodDecay(); _flood.rate += (n || 1) * FLOOD_INC; }
function floodWait(n) { floodDecay(); var over = _flood.rate + n * FLOOD_INC - (FLOOD_MAX - FLOOD_MARGIN); return over > 0 ? Math.ceil(over) : 0; }
function floodServerSaid(hard) { floodDecay(); _flood.rate = Math.max(_flood.rate, FLOOD_MAX + (hard ? 500 : 0)); }

// Предыдущее звено цепочки sendChatInput (ставится в installHooks); наши команды идут мимо наших же перехватчиков
var prevChat = null;
function rawSend(text) {
    floodNote(1);
    try { if (typeof prevChat === 'function') return prevChat.call(window, text); } catch (e) {}
    try { if (typeof window.sendChatInput === 'function') return window.sendChatInput(text); } catch (e) {}
    try { if (typeof engine !== 'undefined') engine.trigger('SendChatInput', text); } catch (e) {}
}

// Обычный чат режется на части ≤ 83 символов (сервер отбрасывает длиннее), команды не режем
var SAY_LIMIT = 83, SAY_GAP = 700;
function splitSay(text, max) {
    if (typeof text !== 'string') return [text];
    if (text.charAt(0) === '/') return [text];
    text = text.trim();
    if (text.length <= max) return [text];
    var parts = [], s = text;
    while (s.length > max) {
        var win = s.slice(0, max + 1), cut = -1, i, m;
        var enders = ['. ', '! ', '? '];
        for (m = 0; m < enders.length; m++) { i = win.lastIndexOf(enders[m]); if (i >= max * 0.4) cut = Math.max(cut, i + 1); }
        if (cut === -1) { var commas = [', ', '; ']; for (m = 0; m < commas.length; m++) { i = win.lastIndexOf(commas[m]); if (i >= max * 0.4) cut = Math.max(cut, i + 1); } }
        if (cut === -1) { i = win.lastIndexOf(' '); if (i > 0) cut = i; }
        if (cut <= 0) cut = max;
        parts.push(s.slice(0, cut).trim());
        s = s.slice(cut).trim();
    }
    if (s) parts.push(s);
    return parts.filter(Boolean);
}
var _sayQ = [], _sayBusy = false;
function sayDrain() {
    if (_dead) { _sayQ = []; _sayBusy = false; return; }
    if (!_sayQ.length) { _sayBusy = false; return; }
    _sayBusy = true;
    var w = floodWait(1);
    if (w > 0) { setTimeout(sayDrain, w + 5); return; }
    rawSend(_sayQ.shift());
    setTimeout(sayDrain, SAY_GAP);
}
function sendSay(text) {
    splitSay(text, SAY_LIMIT).forEach(function (p) { _sayQ.push(p); });
    if (!_sayBusy) sayDrain();
}
// Команда с ожиданием антифлуда (не раздуваем счётчик, если лимит исчерпан)
function sendCmdPaced(text) {
    (function go() {
        if (_dead) return;
        var w = floodWait(1);
        if (w > 0) { setTimeout(go, w + 5); return; }
        rawSend(text);
    })();
}

// ══════════════════════════ ДИАЛОГИ ══════════════════════════
// Наши диалоги 677/678/679 — только на клиенте: открываем через ОРИГИНАЛ игры (минуя монитор диалогов
// Code2.js, чтобы они не зеркалились в Telegram), ответы перехватываем в sendClientEventCustom и серверу не шлём.
var DLG_MENU = 677, DLG_ID = 678, DLG_TYPE = 679;
function addDialog(params, content, prio) {
    var f = window._hassleOrig_addDialogInQueue || window.addDialogInQueue;
    if (typeof f !== 'function') { warn('addDialogInQueue недоступен'); return; }
    return f.call(window, params, content, prio === undefined ? 0 : prio);
}

// ── Клавиатура Hassle: числовая раскладка «123», ники остаются видны, авто-подтверждение по «Send» ──
var kbOurs = false, kbDialogId = null, kbTimer = null, kbDialogAt = 0;
// Клавиатура у чата и у диалога ОДНА (Keyboard + window.currentKeyboardInput). Раньше kbDialogId залипал, если диалог ID закрыли
// (Отмена/ESC/игра закрыла) — и следующая отправка чата/команды уходила как «ответ диалога 678»: открывалась выдача лицензии с этим текстом.
// Теперь ввод считается ответом диалога, только если наш диалог ID РЕАЛЬНО открыт (.input-window, поле ввода внутри него); иначе это обычный ввод.
function dlgInputVisible() {
    try {
        var ci = window.currentKeyboardInput;
        if (ci && typeof ci.closest === 'function') return !!ci.closest('.input-window');
        return !!document.querySelector('.input-window');
    } catch (e) { return false; }
}
function kbDialogLive() { return !!kbDialogId && dlgInputVisible(); }   // диалог ID открыт → ввод его; нет → к диалогу не относится (без лимита по времени)
function kbDialogDrop(why) { if (kbDialogId) { tr('KB/сброс диалога ID', why); } kbDialogId = null; }
function sdlsOrig() { var f = window.setDrawLabelStatus; return (f && f.__orig) || f; }
function kbEnsureHooks() {
    var sd = window.setDrawLabelStatus;
    if (typeof sd === 'function' && !sd.__code3) {
        var origSd = sd;
        var wsd = function (value) {
            if (_dead || !kbOurs) return origSd.apply(this, arguments);
            if (!value) {   // блокируем только скрытие ников, пока наша клавиатура реально открыта
                var pauseOpen = isOpen('PauseMenu') || isOpen('MainMenu');
                var kbVisible = !!document.querySelector('.keyboard-container');
                if (kbVisible && !pauseOpen) return;
                kbOurs = false;   // клавиатуры уже нет — флаг залип, сбрасываем
            }
            return origSd.apply(this, arguments);
        };
        wsd.__code3 = true; wsd.__orig = origSd;
        window.setDrawLabelStatus = wsd;
        onUndo(function () { if (window.setDrawLabelStatus === wsd) window.setDrawLabelStatus = origSd; });
    }
    var hk = window.hideKeyboard;
    if (typeof hk === 'function' && !hk.__code3) {
        var origHk = hk;
        var whk = function () { kbOurs = false; return origHk.apply(this, arguments); };
        whk.__code3 = true;
        window.hideKeyboard = whk;
        onUndo(function () { if (window.hideKeyboard === whk) window.hideKeyboard = origHk; });
    }
}
function scheduleKeyboardNumeric() {
    kbEnsureHooks();
    kbOurs = true;
    if (kbTimer) clearInterval(kbTimer);
    var a = 0;
    kbTimer = setInterval(function () {
        if (_dead) { clearInterval(kbTimer); kbTimer = null; return; }
        a++;
        try {
            var cont = document.querySelector('.keyboard-container');   // рендерится только когда клавиатура видна
            if (!cont) { if (a >= 30) { clearInterval(kbTimer); kbTimer = null; kbOurs = false; warn('клавиатура не появилась за 3 с'); } return; }
            var switched = false;
            // А: через interface('Keyboard')
            try { var kb = iface('Keyboard'); if (kb && typeof kb.toggleNumbers === 'function') { if (!kb.isNumbers) kb.toggleNumbers(); switched = true; } } catch (e) {}
            // Б: через Vue-инстанс элемента
            if (!switched) {
                try {
                    var kbEl = document.querySelector('.keyboard');
                    var vc = kbEl && (kbEl.__vueParentComponent || kbEl._vueParentComponent || kbEl.__vue__);
                    var px = vc && (vc.proxy || vc);
                    if (px && typeof px.toggleNumbers === 'function') { if (!px.isNumbers) px.toggleNumbers(); switched = true; }
                } catch (e) {}
            }
            // В: прямой клик по кнопке «123»
            if (!switched) {
                try {
                    var vals = cont.querySelectorAll('.keyboard-key__value');
                    for (var i = 0; i < vals.length; i++) {
                        if ((vals[i].textContent || '').trim() === '123') {
                            if (vals[i].parentElement) { vals[i].parentElement.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })); switched = true; }
                            break;
                        }
                    }
                } catch (e) {}
            }
            if (!switched) warn('переключить клавиатуру на «123» не удалось');
            // Ники над игроками — чтобы ввести нужный ID
            try { var so = sdlsOrig(); if (typeof so === 'function') so.call(window, true); } catch (e) {}
            // Перехват send() компонента клавиатуры: сами шлём OnDialogResponse (диалог не слушает синтетический Enter)
            try {
                var kbElH = document.querySelector('.keyboard');
                var vcH = kbElH && (kbElH.__vueParentComponent || kbElH._vueParentComponent || kbElH.__vue__);
                var ctxH = vcH && vcH.ctx;
                if (ctxH && typeof ctxH.send === 'function' && !ctxH._code3SendHooked) {
                    (function (orig) {
                        ctxH.send = function () {
                            var sv = (this && this.text != null) ? String(this.text) : ((window.currentKeyboardInput && window.currentKeyboardInput.value) || '');
                            var sid = kbDialogId;
                            if (sid && !kbDialogLive()) { kbDialogDrop('отправка при закрытом диалоге — это обычный ввод (чат/команда), не ответ диалога'); sid = null; }
                            if (sid) kbDialogId = null;   // сброс ДО оригинала — Enter-fallback ниже увидит null и не задублирует
                            orig.apply(this, arguments);
                            if (sid && sv.trim() !== '') {
                                setTimeout(function () { if (!_dead) window.sendClientEventCustom(0, 'OnDialogResponse', sid, 1, 0, sv); }, 0);
                            }
                            ctxH.send = orig;               // хук одноразовый
                            ctxH._code3SendHooked = false;
                        };
                        ctxH._code3SendHooked = true;
                    })(ctxH.send);
                }
            } catch (e) { warn('send() hook:', e); }
            clearInterval(kbTimer); kbTimer = null;
        } catch (e) { warn('клавиатура:', e); }
        if (a >= 30 && kbTimer) { clearInterval(kbTimer); kbTimer = null; kbOurs = false; }
    }, 100);
}
onUndo(function () { if (kbTimer) { clearInterval(kbTimer); kbTimer = null; } kbOurs = false; });
// Запасной путь: синтетический Enter от keyboard.send() (isTrusted=false) — если хук send() не встал
(function () {
    function onKey(e) {
        if ((e.key !== 'Enter' && e.keyCode !== 13) || e.isTrusted) return;
        var sid = kbDialogId;
        if (!sid) return;
        if (!kbDialogLive()) { kbDialogDrop('Enter при закрытом диалоге — обычный ввод'); return; }
        kbDialogId = null;
        var sv = (window.currentKeyboardInput && window.currentKeyboardInput.value) || '';
        if (sv.trim() !== '') setTimeout(function () { if (!_dead) window.sendClientEventCustom(0, 'OnDialogResponse', sid, 1, 0, sv); }, 0);
    }
    document.addEventListener('keydown', onKey, true);
    onUndo(function () { document.removeEventListener('keydown', onKey, true); });
})();
every(function () {   // диалог ID не появился за 3 с или уже закрыт (ESC/игра) — сбросить, чтобы не перехватить чат
    if (kbDialogId && Date.now() - kbDialogAt > 3000 && !dlgInputVisible()) kbDialogDrop('диалога ID нет на экране');   // 3 с — даём диалогу появиться; пока он открыт — висит сколько угодно
}, 500);
// Страховка как в pravo.js: ESC тоже сбрасывает флаг «наша клавиатура»
(function () {
    function onEsc(e) { if (e.keyCode === 27) kbOurs = false; }
    window.addEventListener('keyup', onEsc);
    onUndo(function () { window.removeEventListener('keyup', onEsc); });
})();

// ── Диалог 678: ввод ID игрока ──
function showIdInput() {
    kbDialogId = DLG_ID; kbDialogAt = Date.now();
    scheduleKeyboardNumeric();
    addDialog('[678,1,"Выдача лицензии","Введите ID игрока:","Далее","Отмена",0,0]', '', 0);
}
// ── Диалог 679: выбор типа лицензии ──
var giveTarget = -1, giveNick = '', giveExact = false;
// Ник для показа: «Имя_Фамилия» → «Имя Фамилия» (из подсказки, иначе ник последней выдачи)
function nickDisp(id, hint) {
    var n = stripListPrefix(hint) || lastRaw(id);
    return n ? stripListPrefix(n).split('_').join(' ') : '';
}
function showTypeDialog(id, nickHint, exact) {
    giveTarget = id;
    nickHint = stripListPrefix(nickHint);
    giveNick = nickHint || '';
    giveExact = !!exact;   // ID введён вручную
    var nk = nickDisp(id, nickHint);
    var list = 'Выберите тип лицензии:<n>';
    LIC_TYPES.forEach(function (t, i) { list += (i + 1) + '. ' + t.name + '  [' + t.price.toLocaleString('ru-RU') + ' ₽]<n>'; });
    addDialog('[679,4,"Выдача лицензии | ID: ' + id + (nk ? ' | ' + nk : '') + '","","Выдать","Отмена",0,0]', list, 0);
}
// ── Диалог 677: меню лицензёра ──
var menuItems = [];
var skipIntReopen = false;   // как _pravoSkipIntReopen: меню открыто кнопкой панели — панель поверх диалога не возвращаем
function onOff(v) { return v ? '{00FF00}Вкл' : '{FF0000}Выкл'; }
function showLicMenu() {
    if (!licensorReady()) {
        gtAdd('~r~Лицензёр~n~~w~Нужен правительственный скин и звание Лицензёр', 3500, 3);
        return;
    }
    menuItems = [{ id: 'givelic', name: 'Выдача лицензии' },
                 { id: 'circle',  name: 'Круговое меню | ' + onOff(STATE.circle) },
                 { id: 'tea',     name: 'Просьба о чае | ' + onOff(STATE.tea) }];
    if (OPTS.AUTO_REISSUE && STATE.last) {
        menuItems.push({ id: 'reissue', name: 'Авто-перевыдача | {00FF00}' + STATE.last.name + ' [ID: ' + STATE.last.targetId + ']' + ((nickDisp(STATE.last.targetId) || STATE.last.nick) ? ' ' + (nickDisp(STATE.last.targetId) || STATE.last.nick) : '') });
    }
    var list = 'Помощник лицензёра<n>';
    menuItems.forEach(function (it, i) { list += (i + 1) + '. ' + it.name + '<n>'; });
    addDialog('[677,4,"ПРАВИТЕЛЬСТВО | Лицензёр","","Выбрать","Отмена",0,0]', list, 0);
    // Hassle: панель Interactions остаётся/возвращается поверх диалога (если он открыт не её кнопкой)
    if (!skipIntReopen) setTimeout(function () { if (!_dead) updatePanel(); }, 0);
    skipIntReopen = false;
}
function toggleTea() {
    STATE.tea = !STATE.tea;
    gtAdd(STATE.tea ? '~g~Просьба о чае~n~~w~Вкл: после выдачи лицензии напишу игроку в /n' : '~r~Просьба о чае~n~~w~Выкл', STATE.tea ? 4000 : 3000, 3);
}
function toggleCircle() {
    STATE.circle = !STATE.circle;
    gtAdd(STATE.circle ? '~g~Круговое меню~n~~w~Вкл: при открытии меню игрока сразу откроется выдача лицензии'
                       : '~r~Круговое меню~n~~w~Выкл: меню игрока открывается как обычно', STATE.circle ? 4000 : 3000, 3);
}

// Обработка ответов на наши диалоги. true = обработано (серверу не передаём)
function onDialogResponse(args) {
    var id = parseInt(args[1]);
    if (id !== DLG_MENU && id !== DLG_ID && id !== DLG_TYPE) return false;
    var btn = Number(args[2]), li = parseInt(args[3]);
    if (id === DLG_MENU) {
        if (btn !== 1) { setTimeout(updatePanel, 0); return true; }   // отмена — возвращаем панель
        var it = menuItems[li];
        if (!it) return true;
        if (it.id === 'givelic') setTimeout(showIdInput, 0);
        else if (it.id === 'circle') { toggleCircle(); setTimeout(showLicMenu, 0); }
        else if (it.id === 'tea')    { toggleTea();    setTimeout(showLicMenu, 0); }
        else if (it.id === 'reissue') { doReissue(); setTimeout(showLicMenu, 0); }
        return true;
    }
    if (id === DLG_ID) {
        kbDialogId = null;   // диалог закрыт (любой кнопкой) — клавиатура больше не «его»
        if (btn === 1) {
            var inputId = String(args[4] || '').trim();
            if (inputId) setTimeout(function () { showTypeDialogChecked(inputId); }, 0);
        } else setTimeout(updatePanel, 0);   // отмена
        return true;
    }
    // DLG_TYPE
    if (btn !== 1) setTimeout(updatePanel, 0);
    else if (li >= 0 && li < LIC_TYPES.length) giveByIndex(giveTarget, li, giveNick, giveExact);
    giveTarget = -1; giveNick = ''; giveExact = false;
    return true;
}

// ══════════════════════════ ПРОВЕРКА НИК ↔ ID ЧЕРЕЗ СЕРВЕРНЫЙ /id ══════════════════════════
// /givelic принимает только ID и ничего не знает про ник. ID в SA-MP переиспользуются, поэтому ID по нику узнаём у сервера «/id <ник>»,
// а прямо перед выдачей спрашиваем у сервера «/id <ID>» (он отвечает
// «Ник, ID: N, уровень: …» или «Такого игрока нет») и сверяем ник. Совпало → выдаём; нет → отмена и подсказка,
// у кого сейчас этот ID. Ответ сервера — единственный источник истины.
var ID_LINE_RE = /^\s*(?:\[\d{1,2}:\d{2}(?::\d{2})?\]\s*)?(?:\d+\s*[.)]\s*)?(.*?),\s*ID:\s*(\d+),\s*уровень:/;   // «[время] N. Ник, ID: …» → группа 1 = Ник (без номера списка)
var _idq = null;                                   // идущая проверка: { id, want, cb, timer, sentAt }
var _idOk = { id: null, name: '', at: 0 };         // последняя подтверждённая серверная пара ник↔ID
onUndo(function () { if (_idq) { clearTimeout(_idq.timer); _idq = null; } });
function sameNick(name, want) {
    var raw = stripListPrefix(name).toLowerCase();
    want = stripListPrefix(want).split(' ').join('_').toLowerCase();
    if (raw === want) return true;
    var t = raw.split(/\s+/);
    return t.length > 1 && t[t.length - 1] === want;   // перед ником стоит префикс (время и т.п.)
}
function whenFloodFree(n, fn) {                    // ждём, пока антифлуд пропустит n команд подряд
    (function go() {
        if (_dead) return;
        var w = floodWait(n);
        if (w > 0) { setTimeout(go, w + 5); return; }
        fn();
    })();
}
function idCheckFinish(res) {
    var q = _idq; if (!q) return;
    clearTimeout(q.timer); _idq = null;
    tr('ID/ПРОВЕРКА', 'ID ' + q.id, 'ждали ник: ' + (q.want || '—'), 'итог: ' + (res.ok === true ? 'СОВПАЛО' : res.ok === false ? 'ОТКАЗ ' + res.reason : 'нет ответа ' + res.reason), res.name ? 'сервер назвал: ' + res.name : '', 'за ' + (q.sentAt ? Date.now() - q.sentAt : 0) + 'мс');
    try { q.cb(res); } catch (e) { warn('idCheck cb:', e); }
}
// cb({ok:true,name} | {ok:false,reason:'mismatch'|'none'|'busy',name?} | {ok:null,reason:'timeout'|'flood'})
function verifyTarget(id, nick, cb) {
    if (OPTS.ID_CHECK === false) return cb({ ok: true, skipped: true, name: '' });
    id = String(id).trim();
    var want = nick ? norm(nick) : '';
    var ttl = Number(OPTS.ID_CHECK_TTL) || 0;
    if (_idOk.id === id && Date.now() - _idOk.at < ttl && (!want || sameNick(_idOk.name, want))) {
        tr('ID/ПРОВЕРКА', 'ID ' + id, 'уже подтверждён сервером ' + (Date.now() - _idOk.at) + 'мс назад', _idOk.name);
        return cb({ ok: true, cached: true, name: _idOk.name });
    }
    if (_idq) return cb({ ok: false, reason: 'busy' });   // предыдущая проверка ещё идёт (двойной тап)
    _idq = { id: id, want: want, cb: cb, timer: null, sentAt: 0 };
    var q = _idq;
    whenFloodFree(2, function () {                        // /id + следующая команда не должны упереться в «Не флудите»
        if (_idq !== q) return;
        q.sentAt = Date.now();
        q.timer = setTimeout(function () { if (_idq === q) idCheckFinish({ ok: null, reason: 'timeout' }); }, Number(OPTS.ID_CHECK_MS) || 2500);
        rawSend('/id ' + id);
    });
}
// cb({ok:true,id,name} | {ok:false,reason:'none'|'busy'} | {ok:null,reason:'timeout'|'flood'})
function lookupIdByNick(nick, cb) {
    var want = norm(nick || '');
    if (!want) return cb({ ok: false, reason: 'none' });
    var ttl = Number(OPTS.ID_CHECK_TTL) || 0;
    if (_idOk.id !== null && Date.now() - _idOk.at < ttl && sameNick(_idOk.name, want)) {   // сервер только что сам назвал эту пару
        tr('ID/ПОИСК', nickInfo(nick), 'из подтверждения сервера ' + (Date.now() - _idOk.at) + 'мс назад', 'ID ' + _idOk.id);
        return cb({ ok: true, id: _idOk.id, name: _idOk.name, cached: true });
    }
    if (_idq) return cb({ ok: false, reason: 'busy' });
    _idq = { id: null, byNick: true, want: want, cb: cb, timer: null, sentAt: 0 };
    var q = _idq;
    whenFloodFree(2, function () {
        if (_idq !== q) return;
        q.sentAt = Date.now();
        q.timer = setTimeout(function () { if (_idq === q) idCheckFinish({ ok: null, reason: 'timeout' }); }, Number(OPTS.ID_CHECK_MS) || 2500);
        rawSend('/id ' + stripListPrefix(nick).split(' ').join('_'));
    });
}
function idCheckOnChat(clean) {
    var q = _idq; if (!q || !q.sentAt) return;
    var m = ID_LINE_RE.exec(clean);
    if (q.byNick) {   // ищем ID по нику: берём строку с ТОЧНО этим ником (частичные совпадения игнорируем)
        if (m) {
            var nm = stripListPrefix(m[1]);
            if (sameNick(nm, q.want)) { _idOk = { id: m[2], name: nm, at: Date.now() }; idCheckFinish({ ok: true, id: m[2], name: nm }); }
        } else if (clean.indexOf('Такого игрока нет') !== -1) idCheckFinish({ ok: false, reason: 'none' });
        else if (clean.indexOf('Не флудите') !== -1 || clean.indexOf('Пожалуйста, подождите несколько секунд') !== -1) idCheckFinish({ ok: null, reason: 'flood' });
        return;
    }
    if (m) {
        if (m[2] !== q.id) return;                         // строка про другого игрока
        var name = stripListPrefix(m[1]);
        if (!q.want || sameNick(name, q.want)) { _idOk = { id: q.id, name: name, at: Date.now() }; idCheckFinish({ ok: true, name: name }); }
        else { _idOk = { id: null, name: '', at: 0 }; idCheckFinish({ ok: false, reason: 'mismatch', name: name }); }
        return;
    }
    if (clean.indexOf('Такого игрока нет') !== -1) { _idOk = { id: null, name: '', at: 0 }; idCheckFinish({ ok: false, reason: 'none' }); }
    else if (clean.indexOf('Не флудите') !== -1 || clean.indexOf('Пожалуйста, подождите несколько секунд') !== -1) idCheckFinish({ ok: null, reason: 'flood' });
}
// true — можно слать /givelic. Иначе уже показано уведомление.
function idGuardPass(res, id, nick) {
    if (res.ok === true) return true;
    var who = nick ? stripListPrefix(nick).split('_').join(' ') : '';
    if (res.ok === false) {
        if (res.reason === 'busy') return false;
        if (res.reason === 'none') gtAdd('~r~ID ' + id + '~n~~w~Игрока с таким ID нет — выдача отменена', 4500, 3);
        else gtAdd('~r~Не тот игрок~n~~w~ID ' + id + ' сейчас у ' + stripListPrefix(res.name).split('_').join(' ') + (who ? ', а нужен ' + who : '') + ' — выдача отменена', 6000, 3);
        return false;
    }
    if (OPTS.ID_CHECK_STRICT) { gtAdd('~r~Проверка /id~n~~w~Сервер не ответил — выдача отменена', 4000, 3); return false; }
    gtAdd('~y~Проверка /id~n~~w~Сервер не ответил — выдаю без проверки', 2500, 3);
    return true;
}
// ID введён вручную: сначала узнаём у сервера, чей он, и показываем ник в заголовке диалога выбора типа
function showTypeDialogChecked(id) {
    id = String(id).trim();
    if (!/^\d+$/.test(id)) { gtAdd('~r~Выдача лицензии~n~~w~ID должен быть числом', 3000, 3); setTimeout(showIdInput, 0); return; }
    verifyTarget(id, '', function (res) {
        if (_dead) return;
        if (res.ok === true) return showTypeDialog(id, res.name || '', true);
        if (res.ok === false && res.reason !== 'busy') { idGuardPass(res, id, ''); setTimeout(showIdInput, 0); return; }
        showTypeDialog(id, '', true);   // сервер не ответил — как раньше, без ника
    });
}

// ══════════════════════════ ВЫДАЧА ЛИЦЕНЗИИ И ПЕРЕВЫДАЧА ══════════════════════════
// Шлёт /givelic <ID> <тип> <цена>, запоминает данные для перевыдачи и авто-ответов
function giveByIndex(targetId, idx, nickHint, exact) {
    var c = LIC_TYPES[idx];
    if (!c || targetId === null || targetId === undefined || targetId === '') return false;
    var tid = targetId;
    nickHint = stripListPrefix(nickHint);
    verifyTarget(tid, nickHint, function (res) {   // сверка ник ↔ ID у сервера (/id) — только потом /givelic
        if (_dead) return;
        if (!idGuardPass(res, tid, nickHint)) { setTimeout(updatePanel, 0); return; }
        whenFloodFree(1, function () {
            if (_dead) return;
            var vn = (res.ok === true && !res.skipped && res.name) ? res.name : null;
            var hint = nickHint || vn || '';
            var cmd = '/givelic ' + tid + ' ' + c.type + ' ' + c.price;
            var nk = nickDisp(tid, hint);
            log('отправка:', cmd, '| ник:', nk || '—');
            tr('GIVE/отправка', cmd, 'ID ' + tid, 'ник: ' + (nk || '—'), 'тип: ' + c.name, vn ? 'проверено /id' : 'без проверки');
            rawSend(cmd);
            STATE.last = { targetId: tid, type: c.type, price: c.price, name: c.name, nick: nk, at: Date.now(), rawNick: null, nickFresh: false, _nw: [], hintRaw: hint || null, verifiedNick: vn };
            refreshLastNick();
            setTimeout(updatePanel, 0);
        });
    });
    return true;
}
var reissueTimer = null;
function reissueSend() {
    var d = STATE.last; if (!d) return;
    var want = stripListPrefix(d.verifiedNick || d.hintRaw || d.rawNick || '');
    verifyTarget(d.targetId, want, function (res) {   // ID мог сменить владельца с прошлой выдачи — перепроверяем (если подтверждение старше ID_CHECK_TTL)
        if (_dead || STATE.last !== d) return;
        if (!idGuardPass(res, d.targetId, want)) { setTimeout(updatePanel, 0); return; }
        d.verifiedNick = (res.ok === true && !res.skipped && res.name) ? res.name : null;
        whenFloodFree(2, function () {
            if (_dead || STATE.last !== d) return;
            var cmd = '/givelic ' + d.targetId + ' ' + d.type + ' ' + d.price;
            d.at = Date.now();
            rawSend('/cancel');
            rawSend(cmd);
            refreshLastNick();
            log('перевыдача: /cancel +', cmd);
            var rnk = nickDisp(d.targetId) || d.nick || '';
            tr('GIVE/перевыдача', cmd, 'ID ' + d.targetId, 'ник: ' + (rnk || '—'), 'тип: ' + d.name);
            gtAdd('~g~Авто-перевыдача~n~~w~' + d.name + ' → ' + (rnk ? rnk + ' ' : '') + 'ID: ' + d.targetId + ' | ' + Number(d.price).toLocaleString('ru-RU') + ' ₽', 3000, 3);
            setTimeout(updatePanel, 0);
        });
    });
}
// Из «тишины» уходит мгновенно; если лимит исчерпан — одна отложенная перевыдача в первый допустимый момент
function reissueLic() {
    if (!STATE.last) return false;
    if (reissueTimer) return true;
    var wait = floodWait(2);
    if (wait <= 0) { reissueSend(); return true; }
    gtAdd('~y~Антифлуд~n~~w~Перевыдача через ' + (wait / 1000).toFixed(1) + ' с', Math.min(wait + 300, 2500), 3);
    var tick = function () {
        reissueTimer = null;
        if (_dead) return;
        var w = floodWait(2);
        if (w > 0) { reissueTimer = setTimeout(tick, w + 5); return; }
        reissueSend();
    };
    reissueTimer = setTimeout(tick, wait + 5);
    return true;
}
onUndo(function () { if (reissueTimer) { clearTimeout(reissueTimer); reissueTimer = null; } });
function doReissue() {
    if (!OPTS.AUTO_REISSUE) return;
    if (!STATE.last) {
        gtAdd('~r~Авто-перевыдача~n~~w~Нет данных — сначала выдайте лицензию через меню', 3500, 3);
        setTimeout(updatePanel, 0);
        return;
    }
    reissueLic();
}

// ══════════════════════════ ПАНЕЛЬ INTERACTIONS (кнопки вместо клавиш) ══════════════════════════
var INT_MENU = 9900, INT_REISSUE = 9901, INT_GIVE = 9902;
var intOpen = false;          // панель Interactions открыта нами (или с нашими пунктами)
var lastServerItems = [];     // серверные пункты — чтобы не терять их при наших обновлениях

function panelAllowed() { return !!OPTS.PANEL && licensorReady() && isMobile(); }
function ownItems() {
    if (!panelAllowed()) return [];
    var items = [[INT_MENU, 'Лицензёр: меню']];
    if (OPTS.AUTO_REISSUE && STATE.last) {
        var raw = lastRaw(STATE.last.targetId);
        var who = raw ? stripListPrefix(raw).split('_').join(' ') : STATE.last.name;
        items.push([INT_REISSUE, 'Перевыдать на ' + STATE.last.name + ': ' + who]);
    }
    items.push([INT_GIVE, 'Выдать лицензию']);
    return items;
}
function isOwnType(tp) { return tp === INT_MENU || tp === INT_REISSUE || tp === INT_GIVE; }
function parseServerItems(params) {
    var out = [];
    try {
        var p = (typeof params === 'string') ? JSON.parse(params) : (params || []);
        for (var k in p) {
            var it = p[k];
            var arr = Array.isArray(it) ? it : (it && it.type !== undefined ? [it.type, it.title] : null);
            if (arr && !isOwnType(arr[0])) out.push(arr);
        }
    } catch (e) {}
    return out;
}
// setInfo на экземпляре компонента: движок может вызвать его напрямую и затереть наш список
function hookSetInfo() {
    try {
        var ic = iface('Interactions');
        if (!ic || ic.__code3SetInfo || typeof ic.setInfo !== 'function') return false;
        var orig = ic.setInfo;
        ic.setInfo = function (raw) {
            if (_dead || !panelAllowed()) return orig.apply(this, arguments);
            var server = parseServerItems(raw);
            if (server.length) lastServerItems = server;
            return orig.call(this, ownItems().concat(server));
        };
        ic.__code3SetInfo = true;
        return true;
    } catch (e) { return false; }
}
// Показать/обновить панель. Если нам она больше не положена — закрыть (только если открывали мы)
function updatePanel() {
    if (_dead) return;
    if (!panelAllowed()) {
        if (intOpen) { intOpen = false; try { window.closeInterface('Interactions'); } catch (e) {} log('панель Interactions закрыта (условия не выполнены)'); }
        return;
    }
    try {
        var merged = ownItems().concat(lastServerItems);
        var inst = iface('Interactions');
        var already = intOpen && inst && isOpen('Interactions');
        if (already) {
            hookSetInfo();
            inst.setInfo(JSON.stringify(merged));                 // без перезагрузки — нет мерцания
        } else {
            window.openInterface('Interactions', JSON.stringify(merged));   // наш wrapper сам смержит списки
            intOpen = true;
        }
    } catch (e) { warn('обновление Interactions:', e); }
}
window.__code3UpdatePanel = updatePanel;

function onInteractionsClick(tp) {
    if (tp === INT_MENU) {
        intOpen = false;
        skipIntReopen = true;
        try { window.closeInterface('Interactions'); } catch (e) {}
        setTimeout(showLicMenu, 0);
        return true;
    }
    if (tp === INT_REISSUE) { doReissue(); return true; }       // панель остаётся — обновится после выдачи
    if (tp === INT_GIVE) {
        intOpen = false;
        try { window.closeInterface('Interactions'); } catch (e) {}
        showIdInput();
        return true;
    }
    return false;
}

// ══════════════════════════ КРУГОВОЕ МЕНЮ (PlayerInteraction → сразу выбор лицензии) ══════════════════════════
var openPrev = null;   // предыдущее звено цепочки openInterface (ставится в installHooks)
var NICK_RE = /^[^\s_]+(?:_[^\s_]+)+$/;   // «Имя_Фамилия» (2+ части через «_») — ник игрока
// ══════════════════════════ ОПРЕДЕЛЕНИЕ ЦЕЛИ (ник) — с нуля ══════════════════════════
// Источник истины — сам компонент PlayerInteraction (исходник: PlayerInteraction.js игры):
//   • data.actionName — «Ivan Petrov» (игра делает split('_').join(' ') из params[0] и пишет «Взаимодействие с …»);
//     сервер кладёт туда ник цели (GetPlayerNameEx), а для не-игрока (машина/дом/NPC) — пустую строку;
//   • проп openParams — сырые params ПЕРВОГО открытия (при повторном ответе сервера НЕ обновляется — это «протухший» источник).
// Читаем то, что реально нарисовано на экране, поэтому кнопка всегда относится к тому, чьё меню открыто.
// Порядок: actionName → (если в сессии он уже был заполнен, пустой actionName = «не игрок») → openParams только
// в первые 1.5с жизни компонента → DOM «.player-interaction__action» → ник из события openInterface/updateParams.
var Target = (function () {
    var ev = { nick: '', at: 0, src: '' };
    function clean(raw) {
        if (typeof raw !== 'string') return '';
        var s = stripListPrefix(raw.replace(/\{[0-9A-Fa-f]{6,8}\}/g, '').replace(/\s+/g, ' '));
        if (!s || /[{}\[\]"<>]/.test(s)) return '';
        var parts = s.split(/[ _]+/).filter(Boolean);
        return parts.length >= 2 ? parts.join('_') : '';
    }
    function looseParse(s) {
        try { return JSON.parse(s); } catch (e1) {}
        try { return JSON.parse(s.replace(/\r?\n/g, '\\n')); } catch (e2) {}
        var m = /^\s*\[\s*"((?:[^"\\]|\\.)*)"/.exec(s);
        if (m) { try { return [JSON.parse('"' + m[1].replace(/\r?\n/g, '\\n') + '"')]; } catch (e3) {} }
        tr('TARGET/parse', 'не удалось разобрать params', String(s).slice(0, 160));
        return null;
    }
    function first(p) {
        try {
            if (typeof p === 'string') p = looseParse(p);
            if (p && typeof p === 'object') return p[0];
        } catch (e) { tr('TARGET/parse ОШИБКА', e); }
        return undefined;
    }
    function nickFromParams(params) { var f = first(params); return typeof f === 'string' ? clean(f) : ''; }
    // что сейчас показывает компонент: { nick, src, known }; st — состояние сессии (sawAction, at)
    function read(vm, st) {
        var r = { nick: '', src: 'нет данных', known: false };
        st = st || {};
        try {
            var an = vm && vm.actionName;
            if (typeof an === 'string' && an) { st.sawAction = true; r.nick = clean(an); r.src = 'actionName'; r.known = true; return r; }
            if (typeof an === 'string' && st.sawAction) { r.src = 'actionName пуст (был заполнен) → не игрок'; r.known = true; return r; }
        } catch (e) {}
        try {
            var op = vm && vm.openParams;
            if (op !== undefined && op !== null) {
                var f = first(op);
                if (typeof f === 'string') {
                    var young = !st.at || Date.now() - st.at < 1500;
                    if (young) { r.nick = clean(f); r.src = 'openParams'; r.known = true; return r; }
                    r.src = 'actionName пуст, openParams устарел → не игрок'; r.known = true; return r;
                }
            }
        } catch (e) {}
        try {
            var el = document.querySelector('.player-interaction__action');
            var tx = el && (el.textContent || '');
            if (tx) { var cn = clean(tx.replace(/^\s*Взаимодействие с\s*/i, '')); if (cn) { r.nick = cn; r.src = 'DOM'; r.known = true; return r; } }
        } catch (e) {}
        if (ev.at && ev.nick && Date.now() - ev.at < 5000) { r.nick = ev.nick; r.src = 'событие ' + ev.src; }
        return r;
    }
    function event(params, src) {
        ev = { nick: nickFromParams(params), at: Date.now(), src: src || '?' };
        tr('TARGET/событие', ev.src, 'ник из params=' + nickInfo(ev.nick));
    }
    return {
        clean: clean, nickFromParams: nickFromParams, read: read, event: event,
        setNick: function (n, src) { ev = { nick: clean(String(n || '')), at: Date.now(), src: src || 'setNick' }; },
        last: function () { return ev; }
    };
})();
function parseNick(params) { return Target.nickFromParams(params); }
var circle = { pending: false, timer: null };
function circleDone(why) {
    if (circle.pending || circle.timer) tr('CIRCLE/конец', why || '');
    circle.pending = false; if (circle.timer) { clearTimeout(circle.timer); circle.timer = null; }
}
function circleCanIntercept(nick) {
    var re = NICK_RE.test(nick), lr = licensorReady(), r = !!(STATE.circle && lr && re);
    tr('CIRCLE/перехват?', r ? 'ДА — сразу выбор лицензии' : 'нет — откроется обычное меню', 'STATE.circle=' + STATE.circle, 'licensorReady=' + lr, 'NICK_RE=' + re);
    return r;
}
// Не смогли определить цель — открываем обычное круговое меню
function circleShowNormal(params, nick, why) {
    tr('CIRCLE/обычное меню', 'причина: ' + (why || '?'), nickInfo(nick));
    circleDone('showNormal');
    try { openPrev.call(window, 'PlayerInteraction', params); } catch (e) { tr('CIRCLE/ОШИБКА', 'openPrev бросил', e); }
    Radial.onOpen(params, false);
}
function circleHandle(nick, params) {
    circle.pending = true;
    tr('CIRCLE/старт', nickInfo(nick), 'страховочный таймер 3000мс');
    if (circle.timer) clearTimeout(circle.timer);
    circle.timer = setTimeout(function () {
        if (circle.pending && !_dead) { tr('CIRCLE/ТАЙМЕР 3с', 'resolveId не ответил вовремя'); trFail('КРУГОВОЕ МЕНЮ: сработала страховка 3с', 'ник: ' + nickInfo(nick)); circleShowNormal(params, nick, 'сработала страховка 3с'); }
    }, 3000);   // страховка
    resolveId(nick, function (id) {
        if (!circle.pending || _dead) { tr('CIRCLE/ответ resolveId ПРОИГНОРИРОВАН', 'pending=' + circle.pending, '_dead=' + _dead, 'id=' + id); return; }
        if (id === null) { circleShowNormal(params, nick, 'ID не определён: ' + srvWhy()); gtAdd('~y~Круговое меню~n~~w~/id: ' + srvWhy() + ' — откроется обычное меню', 3000, 3); tr('CIRCLE/уведомление', 'обычное меню: ' + srvWhy()); return; }
        circleDone('ID получен');
        log('круговое меню: выдача лицензии →', nick, '| ID:', id);
        tr('CIRCLE/выдача', nickInfo(nick), 'ID ' + id);
        var sent = srvSend('MenuInt_OnCloseInterface', 0);   // сам компонент мы не открывали — сообщаем серверу, что меню «закрыто»
        tr('CIRCLE/MenuInt_OnCloseInterface', 'отправлено=' + sent);
        tr('CIRCLE/showTypeDialog', 'ID ' + id, 'ник ' + nick); showTypeDialog(id, nick);   // сразу, без паузы
    });
}

// ══════════════════════════ ПУНКТ «ВЫДАЧА ЛИЦЕНЗИИ» В РАДИАЛЬНОМ МЕНЮ ИГРОКА ══════════════════════════
// Пункт добавляется ПРЯМО В ДАННЫЕ компонента (vm.menu) как обычная категория: иконку рисует сама игра
// (родной «Персонаж» + карточка-лицензия), по нажатию раскрывается выбор типа в кольце (Права / Проф. права /
// Оружие / Рыбалка / Охота), выбор → меню закрывается → /givelic <ID> <тип> <цена>. Серверу лишнего не шлём.
// Если встроиться в круг не удалось — запасная DOM-кнопка (открывает диалог выбора лицензии).
var pickOn = false;   // выбор лицензии в кольце раскрыт (по нему включаются ники и подмена затемнения под чат)
var Radial = (function () {
    var ENTRY_ID = 'code3_lic', MASK_ID = 'code3LicMask', BTN_ID = 'code3-moblic-btn';
    var TITLE = 'Выдача лицензии';
    var SVG_NS = 'http://www.w3.org/2000/svg';
    var lastNick = '', busy = false, capBox = null, warned = false;
    var labelsOn = false, shiftOn = false;

    function notify(text) { gtAdd(text, 3000, 3); }
    function piOpen() { return isOpen('PlayerInteraction'); }
    function getVm() { return iface('PlayerInteraction'); }


    // Координаты сектора i (0 — верх, по часовой) — те же, что игра считает для кнопок категорий
    function coordsFor(vm, slot) {
        try { var ang = (vm.k * slot + Math.PI / 2) % (Math.PI * 2); return vm.getCoords(vm.innerRadius, ang); } catch (e) { return null; }
    }
    function scopeAttr(box) {
        try {
            var ref = box.querySelector('.player-interaction__item') || box;
            for (var i = 0; i < ref.attributes.length; i++) if (ref.attributes[i].name.indexOf('data-v-') === 0) return ref.attributes[i].name;
        } catch (e) {}
        return 'data-v-96e76c6f';
    }
    function removeBtn() { var old = document.getElementById(BTN_ID); if (old && old.parentNode) old.parentNode.removeChild(old); }
    // Закрываем как компонент: closeInterface + событие серверу
    function closeMenu() {
        tr('RADIAL/closeMenu', 'closeInterface + MenuInt_OnCloseInterface');
        try { window.closeInterface('PlayerInteraction'); } catch (e) { tr('RADIAL/ОШИБКА', 'closeInterface бросил', e); }
        var sent = srvSend('MenuInt_OnCloseInterface', 0);
        tr('RADIAL/MenuInt_OnCloseInterface', 'отправлено=' + sent);
    }
    // ID цели по нику — только через сервер (/id), см. resolveId

    // ══════════ НАТИВНЫЙ РЕЖИМ: пункт внутри vm.menu ══════════
    function hasEntry(vm) { try { return vm.menu.some(function (m) { return m && m._code3Lic; }); } catch (e) { return false; } }
    function ownIndex(vm) { try { for (var i = 0; i < vm.menu.length; i++) if (vm.menu[i] && vm.menu[i]._code3Lic) return i; } catch (e) {} return -1; }
    function isOwnSelected(vm) { try { var m = vm.menu[vm.selectedOption]; return !!(m && m._code3Lic); } catch (e) { return false; } }

    // Ники над игроками: PlayerInteraction открывается с hideLabels. Включаем их, пока раскрыт выбор лицензии
    function setLabels(on) {
        if (labelsOn === on) return;
        labelsOn = on;
        try { if (typeof window.setDrawLabelStatus === 'function') window.setDrawLabelStatus(on); dbg('ники:', on ? 'показаны' : 'скрыты'); } catch (er) { dbg('setLabels:', er); }
    }
    function syncLabels(vm) {
        var pick = false;
        try { pick = piOpen() && isOwnSelected(vm); } catch (er) {}
        var prev = pickOn;
        pickOn = pick;
        if (pick !== prev) Chat.sync();   // подмена затемнения под чат — в этом же кадре
        var want = OPTS.RADIAL_LABELS !== false && pick;
        if (want === labelsOn) return;
        if (want) { setLabels(true); return; }
        if (piOpen()) setLabels(false); else labelsOn = false;   // закрыто — игра вернула ники сама
    }
    function releaseLabels() { if (!labelsOn) return; if (piOpen()) setLabels(false); else labelsOn = false; }

    // Подпункты кольца — типы лицензий
    function licOptions() {
        var out = [];
        for (var i = 0; i < LIC_TYPES.length; i++) out.push({ id: 'code3_lic_' + i, title: LIC_TYPES[i].name, _code3LicIdx: i });
        // Сетка игры кладёт 1-й пункт правее всех и идёт справа налево — разворачиваем, чтобы слева направо было Права → … → Охота
        if (OPTS.RADIAL_LAYER_REVERSE !== false) out.reverse();
        return out;
    }
    function characterIndex(vm) {
        try {
            for (var i = 0; i < vm.menu.length; i++) {
                var m = vm.menu[i];
                if (m && !m._code3Lic && !m._code3Pad && (m.icon === 'Character' || m.title === 'Персонаж')) return i;
            }
        } catch (e) {}
        return -1;
    }
    function configuredSlot() { return (typeof OPTS.RADIAL_SLOT === 'number') ? OPTS.RADIAL_SLOT : 4; }
    // Сдвиг внешнего слоя (типы лицензий) по кругу в секторах по 22.5°; работает только если удалось подменить угол подсветки
    function layerShift() {
        if (typeof OPTS.RADIAL_LAYER_SHIFT === 'number') return OPTS.RADIAL_LAYER_SHIFT;
        return configuredSlot() === 4 ? 2 : 0;
    }
    function patchLayerRotation(vm) {
        var ctx = vm.$ && vm.$.ctx;
        if (!ctx) { dbg('layer shift: нет vm.$.ctx'); return false; }
        var d = Object.getOwnPropertyDescriptor(ctx, 'hoveredLayerRotation');
        if (!d || typeof d.get !== 'function') { dbg('layer shift: нет hoveredLayerRotation'); return false; }
        if (d.get.__code3Shift) return true;
        var og = d.get;
        var ng = function () {
            var r = og.apply(this, arguments);
            try { var n = layerShift(); if (shiftOn && n && isOwnSelected(vm)) r -= n * (vm.k / 2) * 180 / Math.PI; } catch (er) {}
            return r;
        };
        ng.__code3Shift = true;
        Object.defineProperty(ctx, 'hoveredLayerRotation', { enumerable: d.enumerable, configurable: true, get: ng, set: d.set });
        return true;
    }
    function targetSlot(vm, total) {
        var len = vm.menu.length, want = configuredSlot();
        if (typeof want === 'number' && want >= 0 && want < total) return want;
        var ch = characterIndex(vm);
        if (ch < 0) return len;
        var right = (OPTS.RADIAL_SIDE === 'right');
        var t = right ? (ch + 1) % total : (ch - 1 + total) % total;
        if (t >= len) return t;
        return right ? t : ch;
    }
    function relayout(vm, from) {
        for (var i = from; i < vm.menu.length; i++) {
            var m = vm.menu[i], c = coordsFor(vm, i);
            if (!m || !c) continue;
            m.x = c.x; m.y = c.y;
            if (m.options && m.options.length) m.options = vm.setOptionsPositions(i, m.options);
        }
    }
    function addEntry(vm) {
        var total = vm.DEFAULT_MENU_COUNT || 8, len = vm.menu.length;
        if (len >= total) return false;
        var opts = licOptions();
        if (!opts.length) return false;
        var idx = targetSlot(vm, total);
        if (idx < 0 || idx >= total) return false;
        var c = coordsFor(vm, idx);
        if (!c) return false;
        var entry = { id: ENTRY_ID, icon: 'Character', title: TITLE, _code3Lic: true, x: c.x, y: c.y };
        if (idx >= len) {   // сектор свободен: пустышки до него + сам пункт
            var adds = [];
            for (var p = len; p < idx; p++) {
                var pc = coordsFor(vm, p);
                if (!pc) return false;
                adds.push({ id: 'code3_pad_' + p, title: '', options: [], _code3Pad: true, x: pc.x, y: pc.y });
            }
            entry.options = vm.setOptionsPositions(idx, opts);
            adds.push(entry);
            for (var a = 0; a < adds.length; a++) vm.menu.push(adds[a]);
        } else {            // сектор занят категорией сервера: вставляем и сдвигаем остальные на один сектор
            entry.options = vm.setOptionsPositions(idx, opts);
            vm.menu.splice(idx, 0, entry);
            relayout(vm, idx + 1);
        }
        return true;
    }
    function removeEntry(vm) {
        try {
            var first = -1;
            for (var i = vm.menu.length - 1; i >= 0; i--) {
                var m = vm.menu[i];
                if (m && (m._code3Lic || m._code3Pad)) { vm.menu.splice(i, 1); first = i; }
            }
            if (first >= 0) relayout(vm, first);
        } catch (e) {}
    }
    function openOwn(vm, t) {
        var m = vm.menu[t];
        tr('RADIAL/openOwn', 'раскрыт пункт «Выдача лицензии»', 'сектор=' + t, 'ник=' + nickInfo(lastNick));
        if (!m) return;
        vm.onSelectOption(m.id);   // как ответ сервера для обычной категории — выбираем локально
        syncLabels(vm);
    }
    // Подменяем методы компонента — на случай, если игра вызовет их сама
    function patchVm(vm) {
        if (patchedVms && patchedVms.has(vm)) return true;
        var oSel = vm.selectOption, oLay = vm.selectLayerOption, oTS = vm.onTouchStart, oTE = vm.onTouchEnd;
        if (typeof oSel !== 'function' || typeof oLay !== 'function') return false;
        vm.selectOption = function (e, t) {
            try {
                var m = vm.menu[t];
                if (m && m._code3Lic) { if (!(e && e.target && e.target._prevClass === 'controls-button--text')) openOwn(vm, t); return; }
            } catch (er) { dbg('selectOption:', er); }
            return oSel.apply(this, arguments);
        };
        vm.selectLayerOption = function (i) {
            try { if (isOwnSelected(vm)) { pickType(vm, i); return; } } catch (er) { dbg('selectLayerOption:', er); }
            return oLay.apply(this, arguments);
        };
        // долгое нажатие на подпункт перетаскивает его в «избранное» и шлёт серверу его id — для нашего не нужно
        if (typeof oTS === 'function') vm.onTouchStart = function () { if (isOwnSelected(vm)) return; return oTS.apply(this, arguments); };
        if (typeof oTE === 'function') vm.onTouchEnd = function () { if (isOwnSelected(vm)) return; return oTE.apply(this, arguments); };
        // Баг игры: угол подсветки сектора не приводится к 0..2π (для сектора 7 подсветка рисуется снизу) — нормализуем
        var oGC = vm.getCoords;
        if (typeof oGC === 'function') vm.getCoords = function (e, t) {
            if (typeof t === 'number' && t >= Math.PI * 2) t = t % (Math.PI * 2);
            return oGC.call(this, e, t);
        };
        // Сдвиг веера типов лицензий: позиции пунктов и подсветка считаются со сдвигом на layerShift() секторов
        shiftOn = false;
        try { shiftOn = patchLayerRotation(vm); } catch (er) { dbg('layer shift:', er); }
        var oSOP = vm.setOptionsPositions, oOML = vm.onMouseOverLayer;
        if (typeof oSOP === 'function') vm.setOptionsPositions = function (e, t) {
            try {
                var n = layerShift();
                if (shiftOn && n && typeof e === 'number' && t && t.length && t[0] && typeof t[0]._code3LicIdx === 'number') {
                    return oSOP.call(this, e + (vm.DEFAULT_FIRST_LAYER_SECTORS || 8) - n / 2, t);
                }
            } catch (er) { dbg('setOptionsPositions:', er); }
            return oSOP.apply(this, arguments);
        };
        if (typeof oOML === 'function') vm.onMouseOverLayer = function (e) {
            var r = oOML.apply(this, arguments);
            try {
                var n = layerShift();
                if (shiftOn && n && isOwnSelected(vm)) {
                    vm.$nextTick(function () {
                        try {
                            if (vm.hoveredLayerOption !== e || !isOwnSelected(vm)) return;
                            var rad = vm.$refs.container.getBoundingClientRect().height / 2 + vm.convert(vm.defaultMenuGap);
                            var s = Math.PI * 2 / ((vm.DEFAULT_FIRST_LAYER_SECTORS || 8) * 2);
                            var a = s * (e + vm.selectedOption * 2 - n) + s / 2 + Math.PI * 3 / 8;
                            a = ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
                            var c = vm.getCoords(rad, a);
                            vm.hoveredLayerSectorX = +c.x;
                            vm.hoveredLayerSectorY = +c.y;
                        } catch (er2) { dbg('hover shift:', er2); }
                    });
                }
            } catch (er) { dbg('onMouseOverLayer:', er); }
            return r;
        };
        // Следим за selectedOption: «Назад»/выбор другой категории меняют его не через наши методы
        {
            try {
                if (typeof vm.$watch === 'function') {
                    try { vm.$watch('selectedOption', function () { syncLabels(vm); }, { flush: 'sync' }); }
                    catch (er0) { vm.$watch('selectedOption', function () { syncLabels(vm); }); }
                }
            } catch (er) { dbg('watch selectedOption:', er); }
        }
        var ok = vm.selectOption !== oSel && vm.selectLayerOption !== oLay;
        if (ok && patchedVms) patchedVms.add(vm);
        return ok;
    }
    // Перехват кликов на контейнере (capture) — независимо от того, как шаблон вызывает методы
    function stopEv(e) { try { e.stopPropagation(); e.preventDefault(); } catch (er) {} }
    function onCapClick(e) {
        try {
            var v = getVm();
            if (!v || !hasEntry(v)) return;
            var t = e.target;
            if (!t || !t.closest) return;
            if (t.closest('[data-code3-lic-item]')) { stopEv(e); openOwn(v, ownIndex(v)); return; }   // клик по нашему пункту круга
            if (isOwnSelected(v)) {                                                                    // подпункт нашей категории
                var li = t.closest('.player-interaction-layer__item');
                if (li && li.parentNode) {
                    var all = li.parentNode.querySelectorAll('.player-interaction-layer__item');
                    var pos = Array.prototype.indexOf.call(all, li);
                    if (pos >= 0) { stopEv(e); pickType(v, ((v.pageOptions && v.pageOptions.startIndex) || 0) + pos); }
                    return;
                }
            }
            var inner = t.closest('.player-interaction__inner');
            var h = v.hoveredOption;
            if (inner && h !== null && h !== undefined && v.menu[h] && v.menu[h]._code3Lic && t._prevClass !== 'controls-button--text') { stopEv(e); openOwn(v, h); }
        } catch (er) { dbg('capture click:', er); }
    }
    function onCapTouch(e) {
        try {
            var v = getVm();
            if (!v || !isOwnSelected(v)) return;
            var t = e.target;
            if (t && t.closest && t.closest('.player-interaction-layer__item')) e.stopPropagation();
        } catch (er) {}
    }
    function attachCapture(box) {
        if (capBox === box) return;
        detachCapture();
        box.addEventListener('click', onCapClick, true);
        box.addEventListener('touchstart', onCapTouch, true);
        capBox = box;
    }
    function detachCapture() {
        if (!capBox) return;
        capBox.removeEventListener('click', onCapClick, true);
        capBox.removeEventListener('touchstart', onCapTouch, true);
        capBox = null;
    }

    // Иконка: берём родной <svg> «Персонажа» (его отрисовала игра) и дорисовываем карточку-лицензию
    var CARD_D = 'M17.5 17.4H29A2.5 2.5 0 0 1 31.5 19.9V28.5A2.5 2.5 0 0 1 29 31H17.5A2.5 2.5 0 0 1 15 28.5V19.9A2.5 2.5 0 0 1 17.5 17.4Z' +
        'M17 20.2H20.6V24.6H17ZM22.2 20.4H29.4V21.9H22.2ZM22.2 23.2H29.4V24.7H22.2ZM17 26.6H29.4V28.1H17Z';
    function mk(tag, attrs) {
        var el = document.createElementNS(SVG_NS, tag);
        for (var k in attrs) el.setAttribute(k, attrs[k]);
        return el;
    }
    function paintIcon(svg) {
        var paths = svg.querySelectorAll('path');
        if (OPTS.RADIAL_ICON) {
            for (var q = 0; q < paths.length; q++) paths[q].style.display = 'none';
            var im = mk('image', { x: '0', y: '0', width: '32', height: '32', href: OPTS.RADIAL_ICON });
            im.setAttributeNS('http://www.w3.org/1999/xlink', 'href', OPTS.RADIAL_ICON);
            svg.appendChild(im);
            return;
        }
        var defs = mk('defs', {});
        var mask = mk('mask', { id: MASK_ID, maskUnits: 'userSpaceOnUse', x: '0', y: '0', width: '32', height: '32' });
        mask.appendChild(mk('rect', { width: '32', height: '32', fill: '#fff' }));
        mask.appendChild(mk('rect', { x: '13.4', y: '15.6', width: '20', height: '17', rx: '4', fill: '#000' }));
        defs.appendChild(mask);
        svg.appendChild(defs);
        for (var i = 0; i < paths.length; i++) paths[i].setAttribute('mask', 'url(#' + MASK_ID + ')');
        svg.appendChild(mk('path', { 'fill-rule': 'evenodd', d: CARD_D }));
    }
    function decorate(vm) {
        var box = document.querySelector('.player-interaction__container');
        var idx = ownIndex(vm);
        if (!box || idx < 0) return;
        var el = box.querySelectorAll('.player-interaction__item')[idx];
        if (!el || (el.textContent || '').indexOf(TITLE) < 0) return;   // элемент ещё не отрисован
        var stale = box.querySelectorAll('[data-code3-lic-item]');
        for (var s = 0; s < stale.length; s++) if (stale[s] !== el) stale[s].removeAttribute('data-code3-lic-item');
        if (!el.hasAttribute('data-code3-lic-item')) el.setAttribute('data-code3-lic-item', '1');
        var svg = el.querySelector('svg');
        if (!svg || svg.hasAttribute('data-code3-lic')) return;
        svg.setAttribute('data-code3-lic', '1');
        try { paintIcon(svg); } catch (er) { dbg('иконка:', er); }
    }

    // ══════════ ЗАПАСНОЙ РЕЖИМ: отдельная кнопка-DOM поверх круга ══════════
    var LIC_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="#e0bf3e"><defs><mask id="m" maskUnits="userSpaceOnUse" x="0" y="0" width="32" height="32"><rect width="32" height="32" fill="#fff"/><rect x="13.4" y="15.6" width="20" height="17" rx="4" fill="#000"/></mask></defs><g mask="url(#m)"><path d="M24 8C24 12.4183 20.4183 16 16 16C11.5817 16 8 12.4183 8 8C8 3.58172 11.5817 0 16 0C20.4183 0 24 3.58172 24 8Z"/><path d="M26.0113 32H32C32 27.7565 30.3143 23.6869 27.3137 20.6863C24.3131 17.6857 20.2435 16 16 16C11.7565 16 7.68688 17.6857 4.68629 20.6863C1.68571 23.6869 0 27.7565 0 32H6.65881C7.17634 28.7259 8.34695 25.3575 10.3003 23.1111C9.45815 24.9955 8.58027 28.4528 9.12668 32L23.5435 32C24.0899 28.4528 23.212 24.9955 22.3698 23.1111C24.3232 25.3575 25.4938 28.7259 26.0113 32Z"/></g><path fill-rule="evenodd" d="' + CARD_D + '"/></svg>';
    var LIC_ICON_URI = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(LIC_ICON_SVG);
    function buildIcon(sa) {
        return '<img ' + sa + ' class="player-interaction__icon-lic" draggable="false" alt="" src="' + LIC_ICON_URI + '"' +
            ' style="display:block;width:2.96vh;height:2.96vh;object-fit:contain;pointer-events:none;user-select:none;-webkit-user-drag:none">';
    }
    // Компонент строит секторы асинхронно (mounted + ответ сервера) — ждём готовности

    // ═══════════ НОВЫЙ ДВИЖОК: состояние + опрос раз в 100 мс ═══════════
    // Не зависит от того, увидели мы событие открытия или нет: каждый тик сравниваем то, что ДОЛЖНО быть в круге
    // (пункт «Выдача лицензии», если цель — игрок и мы лицензёр), с тем, что ЕСТЬ, и чиним расхождение.
    // Новый экземпляр компонента = новая сессия (игра создаёт PlayerInteraction заново при каждом открытии).
    var patchedVms = (typeof WeakSet === 'function') ? new WeakSet() : null;
    function emptyS() { return { vm: null, nick: '', src: '', mode: '', sig: '', stall: 0, decision: '', nativeFailedSig: null, at: 0, sawAction: false }; }
    var S = emptyS();

    function piBox() { return document.querySelector('.player-interaction__container'); }
    function isReady(vm, box) {
        try {
            var last = vm && Array.isArray(vm.menu) && vm.menu.length ? vm.menu[vm.menu.length - 1] : null;
            return !!(box && vm && vm.k != null && vm.innerRadius != null && last && typeof last.x === 'number');
        } catch (e) { return false; }
    }
    function menuSig(vm) {
        try { return vm.menu.length + ':' + vm.menu.map(function (m) { return m ? String(m.id) + '/' + (m.title || '') : '-'; }).join('|'); } catch (e) { return '?'; }
    }
    function whyNot(nick) {
        if (!OPTS.RADIAL_BTN) return 'RADIAL_BTN=false';
        if (!licensorReady()) return 'не лицензёр: скин=' + _skin + ' gov=' + isGovSkin() + ' звание=' + JSON.stringify(_rank);
        if (!nick) return 'ник цели не определён (меню не игрока или компонент ещё не заполнен)';
        if (!NICK_RE.test(nick)) return 'ник не похож на ник игрока: ' + JSON.stringify(nick);
        return '';
    }
    function setDecision(d) {
        if (S.decision === d) return;
        S.decision = d;
        tr('RADIAL/решение', d, 'ник=' + nickInfo(S.nick) + ' (' + S.src + ')');
    }
    function release(why) {
        if (S.vm || S.mode || S.nick || pickOn) tr('RADIAL/release', why, 'режим=' + (S.mode || '—'), 'ник=' + nickInfo(S.nick));
        if (pickOn) { pickOn = false; Chat.sync(); }
        releaseLabels();
        removeBtn();
        detachCapture();
        S = emptyS();
        busy = false;
    }
    function cleanup() { release('cleanup'); }

    function begin(vm) {
        if (S.vm) release('компонент заменён новым');
        S = emptyS();
        S.vm = vm; S.at = Date.now();
        busy = false;
        if (!_rmT0 || Date.now() - _rmT0 > 4000) rmBegin('(событие open не видели — сессия начата по появлению компонента)', '');
        tr('RADIAL/новая сессия', 'создан PlayerInteraction', 'пунктов=' + ((vm.menu && vm.menu.length) || 0), 'actionName=' + JSON.stringify(vm.actionName), 'openParams=' + (vm.openParams === undefined ? 'нет' : tstr(vm.openParams).slice(0, 120)));
    }
    function onTarget(vm, t) {
        var prev = S.nick;
        S.nick = t.nick; S.src = t.src; lastNick = t.nick;
        tr('TARGET/цель', nickInfo(t.nick), 'источник=' + t.src, 'known=' + t.known);
        if (prev && t.nick !== prev) {   // в уже открытом меню цель поменялась — старый пункт снимаем, соберём заново
            tr('TARGET/СМЕНА ЦЕЛИ', prev + ' → ' + (t.nick || '—'));
            try { removeEntry(vm); } catch (e) {}
            S.mode = ''; S.nativeFailedSig = null; busy = false; S.decision = '';
        }
        var ev = Target.last();
        if (ev.nick && t.nick && ev.nick !== t.nick && Date.now() - ev.at < 5000)
            tr('TARGET/РАСХОЖДЕНИЕ', 'сервер открывал меню для ' + ev.nick + ', а на экране ' + t.nick + ' — берём то, что на экране');
    }

    function tryNative(vm, box) {
        if (OPTS.RADIAL_NATIVE === false) { tr('RADIAL/native', 'выключен опцией RADIAL_NATIVE=false'); return false; }
        try {
            if (!Array.isArray(vm.menu) || typeof vm.onSelectOption !== 'function' || typeof vm.setOptionsPositions !== 'function') { tr('RADIAL/native', 'у компонента нет нужных методов'); return false; }
            if (!patchVm(vm)) { tr('RADIAL/native', 'не удалось подменить методы компонента'); return false; }
            if (!hasEntry(vm) && !addEntry(vm)) { tr('RADIAL/native', 'нет свободного сектора', 'пунктов=' + vm.menu.length, 'секторов=' + (vm.DEFAULT_MENU_COUNT || 8)); return false; }
            removeBtn();
            attachCapture(box);
            S.mode = 'native'; S.sig = menuSig(vm);
            tr('RADIAL/режим', 'native: пункт встроен в круг', 'слот=' + ownIndex(vm), 'ник=' + nickInfo(S.nick));
            return true;
        } catch (er) {
            tr('RADIAL/native', 'ОШИБКА при встраивании', er);
            try { removeEntry(vm); } catch (e2) {}
            return false;
        }
    }
    function ensureEntry(vm, box) {
        if (S.mode === 'native') {
            if (hasEntry(vm)) { attachCapture(box); return; }
            tr('RADIAL/пункт пропал', 'меню пересобрано — возвращаем', menuSig(vm));
            S.mode = '';
        }
        if (S.mode === 'dom') {
            if (document.getElementById(BTN_ID)) return;
            S.mode = '';
        }
        var sig = menuSig(vm);
        if (S.nativeFailedSig !== sig) {
            if (tryNative(vm, box)) return;
            S.nativeFailedSig = sig;
        }
        if (!document.getElementById(BTN_ID)) injectDom(vm, box);
    }
    function tick() {
        if (_dead) return;
        var open = piOpen(), vm = open ? getVm() : null;
        if (!open || !vm) { if (S.vm || S.mode || S.nick) release(open ? 'компонента нет' : 'меню закрыто'); return; }
        if (vm !== S.vm) begin(vm);
        var t = Target.read(vm, S);
        if (t.nick !== S.nick || t.src !== S.src) onTarget(vm, t);
        var box = piBox();
        if (!isReady(vm, box)) {
            S.stall++;
            if (S.stall === 1) tr('RADIAL/ждём компонент', { box: !!box, k: vm.k != null, innerRadius: vm.innerRadius != null, menuLen: (vm.menu && vm.menu.length) || 0 });
            if (S.stall === 40) { tr('RADIAL/компонент не готов 4с (продолжаем ждать)'); trFail('РАДИАЛЬНОЕ МЕНЮ: компонент не готов 4с', 'ник: ' + nickInfo(S.nick)); }
            return;
        }
        if (S.stall) { tr('RADIAL/компонент готов', 'ждали тиков: ' + S.stall); S.stall = 0; }
        var why = whyNot(S.nick);
        if (why) {
            setDecision('НЕ показываем: ' + why);
            if (hasEntry(vm)) { try { removeEntry(vm); } catch (e) {} }
            if (S.mode) { removeBtn(); detachCapture(); S.mode = ''; }
            return;
        }
        setDecision('показываем «Выдача лицензии»');
        try {
            ensureEntry(vm, box);
            syncLabels(vm);
            if (S.mode === 'native') decorate(vm);
            else if (S.mode === 'dom') { var el = document.getElementById(BTN_ID); if (el) el.style.opacity = (vm.selectedOption !== null && vm.selectedOption !== undefined) ? '0.6' : '1'; }
        } catch (er) { tr('RADIAL/ОШИБКА в tick', er); }
    }

    // ID цели по нику — ник перечитываем с экрана в момент нажатия; ID узнаём у сервера (/id), см. resolveId
    function withTargetId(cb) {
        var vm = getVm();
        var t = vm ? Target.read(vm, S) : { nick: '', src: 'нет компонента' };
        var nick = t.nick || S.nick || '';
        tr('RADIAL/withTargetId', 'на экране=' + nickInfo(t.nick) + ' (' + t.src + ')', 'S.nick=' + nickInfo(S.nick), 'режим=' + (S.mode || '—'));
        if (!nick) { busy = false; tr('RADIAL/ОШИБКА', 'ник пуст → «Не удалось определить игрока»'); trFail('РАДИАЛЬНОЕ МЕНЮ: ник цели пуст'); notify('~r~Выдача лицензии~n~~w~Не удалось определить игрока'); return; }
        resolveId(nick, function (id) {
            if (_dead || !piOpen()) { busy = false; tr('RADIAL/ответ resolveId ПРОИГНОРИРОВАН', '_dead=' + _dead, 'piOpen=' + piOpen(), 'id=' + id, '(меню закрыли, пока искали ID)'); return; }
            if (id === null) { busy = false; tr('RADIAL/уведомление', 'ID не определён: ' + srvWhy(), nickInfo(nick)); notify('~r~Выдача лицензии~n~~w~/id: ' + srvWhy()); return; }
            tr('RADIAL/ID получен', nickInfo(nick), 'ID ' + id);
            cb(id, nick);
        });
    }
    function giveLicense(id, idx, nick) {
        tr('RADIAL/giveLicense', 'ID ' + id, 'ник ' + nickInfo(nick), 'тип #' + idx + (LIC_TYPES[idx] ? ' ' + LIC_TYPES[idx].name : ''));
        try { if (giveByIndex(id, idx, nick)) { tr('RADIAL/giveByIndex', 'команда отправлена'); return; } tr('RADIAL/giveByIndex', 'вернул false → запасной диалог'); } catch (er) { warn('выдача из круга:', er); tr('RADIAL/ОШИБКА', 'giveByIndex бросил', er); }
        showTypeDialog(id, nick);   // запасной путь — диалог выбора
    }
    function pickType(vm, i) {
        var m = vm.menu[vm.selectedOption];
        var o = m && m.options && m.options[i];
        if (!o || !o.title || busy) { tr('RADIAL/pickType ОТКЛОНЁН', 'i=' + i, 'пункт=' + (o ? JSON.stringify(o.title) : 'нет'), 'busy=' + busy); return; }
        var typeIdx = (typeof o._code3LicIdx === 'number') ? o._code3LicIdx : i;
        tr('RADIAL/pickType', 'нажат подпункт i=' + i, 'тип #' + typeIdx + (LIC_TYPES[typeIdx] ? ' ' + LIC_TYPES[typeIdx].name : ''), 'ник=' + nickInfo(S.nick));
        busy = true;
        try { window.playSound('player_interaction/click-fast.mp3'); } catch (er) {}
        withTargetId(function (id, nick) {
            closeMenu();
            setTimeout(function () { busy = false; giveLicense(id, typeIdx, nick); }, 0);
        });
    }

    // ══════════ ЗАПАСНОЙ РЕЖИМ: отдельная кнопка-DOM поверх круга ══════════
    function pickSlot(vm) {
        var total = vm.DEFAULT_MENU_COUNT || 8;
        var slot = configuredSlot();
        if (typeof slot === 'number' && slot >= 0 && slot < total) return slot;
        var want = targetSlot(vm, total);
        if (want >= vm.menu.length && want < total) return want;
        var best = -1, bestX = Infinity;
        for (var i = vm.menu.length; i < total; i++) { var c = coordsFor(vm, i); if (c && c.x < bestX) { bestX = c.x; best = i; } }
        return best;
    }
    function openDialog(id, nick) {
        closeMenu();
        setTimeout(function () { busy = false; showTypeDialog(id, nick); }, 0);
    }
    function onBtnClick(e) {
        try { e.stopPropagation(); e.preventDefault(); } catch (er) {}
        if (busy) return;
        try { window.playSound('player_interaction/click-fast.mp3'); } catch (er) {}
        tr('RADIAL/onBtnClick', 'нажата запасная DOM-кнопка', 'ник=' + nickInfo(S.nick));
        busy = true;
        withTargetId(openDialog);
    }
    function injectDom(vm, box) {
        removeBtn();
        var slot = pickSlot(vm);
        if (slot < 0) { warn('нет свободного сектора в PlayerInteraction для кнопки лицензии'); tr('RADIAL/dom', 'нет свободного сектора — кнопку поставить некуда', menuSig(vm)); return; }
        var c = coordsFor(vm, slot);
        if (!c) { tr('RADIAL/dom', 'не удалось посчитать координаты сектора', slot); return; }
        var sa = scopeAttr(box);
        var b = document.createElement('div');
        b.id = BTN_ID;
        b.className = 'player-interaction__item';
        b.setAttribute(sa, '');
        b.style.transform = 'translate(' + c.x + 'px, ' + c.y + 'px)';
        b.style.cursor = 'pointer';
        b.style.webkitTapHighlightColor = 'transparent';
        var icon = OPTS.RADIAL_ICON
            ? '<img ' + sa + ' src="' + OPTS.RADIAL_ICON + '" style="width:2.96vh;height:2.96vh;object-fit:contain;display:block">'
            : buildIcon(sa);
        b.innerHTML = icon + '<div ' + sa + ' class="player-interaction__title">' + TITLE + '</div>';
        b.addEventListener('click', onBtnClick);
        b.addEventListener('touchstart', function () { b.style.filter = 'brightness(0.6)'; }, { passive: true });
        b.addEventListener('touchend', function () { b.style.filter = ''; }, { passive: true });
        b.addEventListener('touchcancel', function () { b.style.filter = ''; }, { passive: true });
        box.appendChild(b);
        S.mode = 'dom';
        if (!warned) { warned = true; warn('пункт в круге не встроился — включена запасная кнопка'); }
        tr('RADIAL/режим', 'dom: запасная кнопка', 'слот=' + slot, 'ник=' + nickInfo(S.nick));
    }
    every(tick, 100);
    onUndo(function () { try { cleanup(); } catch (e) {} });
    return {
        // события открытия/обновления только «подталкивают» движок — решает он сам по состоянию компонента
        onOpen: function (params, was) { Target.event(params, was ? 'open(меню уже было открыто)' : 'open'); if (!was) busy = false; setTimeout(tick, 0); },
        onUpdate: function (params) { Target.event(params, 'update'); setTimeout(tick, 0); },
        setNick: function (n) { Target.setNick(n, 'setNick'); },
        resetBusy: function () { if (busy) tr('RADIAL/resetBusy', 'busy сброшен (было true)'); busy = false; },
        inject: function () { setTimeout(tick, 0); },
        cleanup: cleanup,
        tick: tick,
        state: function () { return { nick: S.nick, src: S.src, mode: S.mode, decision: S.decision, stall: S.stall, open: piOpen(), busy: busy, sessionAgeMs: S.at ? Date.now() - S.at : null }; }
    };
})();

// ══════════════════════════ ЧАТ ПОВЕРХ ЗАТЕМНЕНИЯ РАДИАЛЬНОГО МЕНЮ ══════════════════════════
// Hud и PlayerInteraction — соседние .interface с одинаковым z-index, поэтому подложка круга лежит выше чата, а на
// Hassle игра ещё и прячет чат (hideChat:"mobile"). Пока раскрыт выбор типа лицензии (тот же момент, когда включаются
// ники): штатные :before/:after круга прячем и рисуем то же самое слоем ВНУТРИ Hud под чатом, чат поднимаем выше слоя
// и возвращаем на экран. В остальных меню и в самом круге — всё как в игре. OPTS.CHAT_UNDIM=false — отключить.
var Chat = (function () {
    var DIM_ID = 'code3-pi-dim', STYLE_ID = 'code3-pi-undim-css', HTML_CLS = 'code3-pi-undim';
    var Z_DIM = 4000, Z_CHAT = 4001;
    var bgUrl = null, lastSig = '', chatForced = false;

    function enabled() { return OPTS.CHAT_UNDIM !== false && pickOn === true && isOpen('PlayerInteraction'); }
    function getChat() { var hud = iface('Hud'); return (hud && hud.$refs && hud.$refs.chat) || null; }
    function chatEl() {
        var c = getChat();
        return (c && c.$el && c.$el.nodeType === 1 && c.$el) || document.querySelector('.chat-container') || document.querySelector('.radmir-chat');
    }
    function hudLayer() { var el = chatEl(); return el ? el.closest('.interface') : null; }
    function html() { return document.documentElement; }
    function forceChatShown() {      // Hassle: игра скрыла чат — на время выбора лицензии показываем обратно
        if (!isMobile()) return;
        var hud = iface('Hud');
        if (!hud || typeof hud.setChatStatus !== 'function') return;
        if (hud.chatStatus === false) { try { hud.setChatStatus(true); chatForced = true; } catch (e) {} }
    }
    function restoreChatHidden() {   // вернулись в круг — прячем чат, как это делает игра
        if (!chatForced) return;
        chatForced = false;
        if (!isOpen('PlayerInteraction')) return;
        var hud = iface('Hud');
        try { if (hud && typeof hud.setChatStatus === 'function') hud.setChatStatus(false); } catch (e) {}
    }
    (function injectCss() {
        if (document.getElementById(STYLE_ID)) return;
        var st = document.createElement('style');
        st.id = STYLE_ID;
        st.textContent =
            'html.' + HTML_CLS + ' .player-interaction__container:before,' +
            'html.' + HTML_CLS + ' .player-interaction__container:after{display:none!important}' +
            'html.' + HTML_CLS + ' .chat-container>.chat{z-index:' + Z_CHAT + '!important}' +
            'html.' + HTML_CLS + ' .radmir-chat{z-index:' + Z_CHAT + '!important;transition-property:opacity,left,top,transform!important}' +
            '#' + DIM_ID + '{position:fixed;left:0;top:0;width:100vw;height:100vh;overflow:hidden;pointer-events:none;z-index:' + Z_DIM + '}' +
            '#' + DIM_ID + ' .code3-pi-bg{position:absolute}';
        (document.head || document.documentElement).appendChild(st);
        onUndo(function () { var s = document.getElementById(STYLE_ID); if (s && s.parentNode) s.parentNode.removeChild(s); });
    })();
    function keepChatActive() {      // пока меню открыто, чат не должен выцветать
        var c = getChat();
        if (!c || !c.isInactive) return;
        try { if (typeof c.clearInactiveTimeout === 'function') c.clearInactiveTimeout(); c.isInactive = false; } catch (e) {}
    }
    function readBgUrl(box) {        // адрес bg14.png берём у самого круга (хэш в имени файла у сборок разный)
        try {
            var bg = getComputedStyle(box, '::before').backgroundImage || '';
            var m = /url\((['"]?)(.*?)\1\)/.exec(bg);
            return m ? m[2] : null;
        } catch (e) { return null; }
    }
    function teardown() {            // убираем наш слой и возвращаем штатные :before/:after в ТОМ ЖЕ кадре
        var dim = document.getElementById(DIM_ID);
        if (dim && dim.parentNode) dim.parentNode.removeChild(dim);
        html().classList.remove(HTML_CLS);
        lastSig = '';
        restoreChatHidden();
    }
    function tick() {
        if (_dead) return;
        if (!enabled()) { if (document.getElementById(DIM_ID) || html().classList.contains(HTML_CLS)) teardown(); return; }
        keepChatActive();
        forceChatShown();
        var box = document.querySelector('.player-interaction__container');
        var host = hudLayer();
        if (!box || !host) return;
        var cr = box.getBoundingClientRect();
        if (!cr.width || !cr.height) return;
        if (!bgUrl) bgUrl = readBgUrl(box);   // читаем ДО того, как спрячем штатный :before
        if (!bgUrl) return;
        var dim = document.getElementById(DIM_ID);
        if (dim && dim.parentNode !== host) { if (dim.parentNode) dim.parentNode.removeChild(dim); dim = null; }
        if (!dim) {
            dim = document.createElement('div');
            dim.id = DIM_ID;
            var bgd = document.createElement('div');
            bgd.className = 'code3-pi-bg';
            dim.appendChild(bgd);
            host.appendChild(dim);
            lastSig = '';
        }
        html().classList.add(HTML_CLS);
        var vh = window.innerHeight, vhp = vh / 100;
        var cx = cr.left + cr.width / 2, cy = cr.top + cr.height / 2;
        var sig = [Math.round(cx), Math.round(cy), Math.round(cr.width), window.innerWidth, vh].join(',');
        if (sig === lastSig) return;
        lastSig = sig;
        // подложка: тот же радиальный градиент, что у штатного :after (50% от 600% ширины круга = 3 ширины)
        var R = Math.round(cr.width * 3);
        dim.style.background = 'radial-gradient(circle ' + R + 'px at ' + Math.round(cx) + 'px ' + Math.round(cy) + 'px,' +
            '#141414e6 30%,#141414cc 40%,#141414b3 50%,#14141499 60%,#14141480 70%)';
        // bg14.png: тот же размер (106.5vh) и по центру круга, как штатный :before
        var b = dim.firstChild, bW = 106.5 * vhp;
        b.style.width = bW + 'px';
        b.style.height = bW + 'px';
        b.style.left = Math.round(cx - bW / 2) + 'px';
        b.style.top = Math.round(cy - bW / 2) + 'px';
        b.style.background = 'url("' + bgUrl + '") 50%/cover no-repeat';
    }
    // setChatIsInactive(true) от самого PlayerInteraction — гасим, пока наш выбор раскрыт
    (function hookInactive() {
        var orig = window.setChatIsInactive;
        if (typeof orig !== 'function' || orig.__code3Undim) return;
        var wrapped = function (e) {
            try {
                if (!_dead && e && enabled()) {
                    var r = orig.call(this, false);
                    var c = getChat();
                    if (c && typeof c.clearInactiveTimeout === 'function') c.clearInactiveTimeout();
                    return r;
                }
            } catch (er) { dbg('setChatIsInactive:', er); }
            return orig.apply(this, arguments);
        };
        wrapped.__code3Undim = true;
        window.setChatIsInactive = wrapped;
        onUndo(function () { if (window.setChatIsInactive === wrapped) window.setChatIsInactive = orig; });
    })();
    every(tick, 250);
    onUndo(function () { try { teardown(); } catch (e) {} });
    return {
        sync: function () { try { lastSig = ''; tick(); } catch (e) { dbg('chat sync:', e); } },
        kick: function () { lastSig = ''; [30, 120, 300].forEach(function (ms) { setTimeout(tick, ms); }); },
        teardown: teardown
    };
})();

// ══════════════════════════ РЕАКЦИИ НА ЧАТ ══════════════════════════
var _cool = {};
function cooled(key, ms) { var n = Date.now(); if (_cool[key] && n - _cool[key] < ms) return false; _cool[key] = n; return true; }
var _lastChat = { msg: '', at: 0 };

function addr(id) { var raw = lastRaw(id); return raw ? raw.split('_').join(' ') : ('Жетон ' + id); }

function onChat(message) {
    var msg = String(message);
    // защита от двойной обработки, если обёртка чата оказалась в цепочке дважды
    var now = Date.now();
    if (msg === _lastChat.msg && now - _lastChat.at < 150) return;
    _lastChat.msg = msg; _lastChat.at = now;
    if (!licensorReady()) return;   // не правительственный скин или не Лицензёр — ничего не делаем

    // Сервер сказал «Не флудите» — подтягиваем нашу модель антифлуда к реальному счётчику
    if (msg.indexOf('Пожалуйста, подождите несколько секунд') !== -1) floodServerSaid(true);
    else if (msg.indexOf('Не флудите') !== -1) floodServerSaid(false);
    // SMS: «Подождите несколько секунд...» = часть не ушла (повторим); эхо «SMS: ... | Получатель: ...» = ушла
    if (msg.indexOf('Подождите несколько секунд') !== -1) { try { _c3SmsOnWait(); } catch (e) {} }
    else if (msg.indexOf('SMS:') !== -1 && msg.indexOf('Получатель:') !== -1) { try { _c3SmsOnAck(); } catch (e) {} }

    var clean = msg.replace(/\{[0-9a-fA-F]{6}\}/g, '');
    try { idCheckOnChat(clean); } catch (eIc) { warn('idCheck:', eIc); }   // ответ сервера на нашу проверку «/id <ID>»
    _c3CallOnChat(clean);   // входящие звонки / подтверждение ответа на звонок (кнопка «Ответ» в Telegram)
    var last = STATE.last;
    // Меню игрока открывается с 8 м (MIU: IsPlayerInRangeOfPlayer 8.0), а /givelic требует не дальше 6 м
    if (last && last.at && Date.now() - last.at < 20000 && clean.indexOf('Игрок находится слишком далеко') !== -1 && cooled('far', 3000)) {
        gtAdd('~y~Игрок далеко~n~~w~ID ' + last.targetId + (last.nick ? ' (' + last.nick + ')' : '') + ' · /givelic работает до 6 м, меню открывается с 8 м. Если рядом — проверьте ID', 4500, 3);
    }

    if (OPTS.AUTO_REPLIES && last && licensorReady()) {
        // Неоплаченные штрафы у покупателя
        if (clean.indexOf('У человека есть неоплаченные штрафы') !== -1) {
            var fid = last.targetId;
            setTimeout(function () { if (!_dead) whenNick(fid, function () { if (!_dead) sendSay(addr(fid) + ', у вас имеются неоплаченные штрафы. Оплатить их можно в любом банкомате'); }); }, 300);
        }
        // Запрет на покупку лицензии на оружие. Реагируем только на системную строку сервера, не на чат игроков
        // (они кончаются на «(Ник)[id]») — иначе эхо нашего же сообщения запускает цикл
        if (clean.indexOf('У покупателя наложен запрет на покупку лицензии на оружие') !== -1 &&
            !/\(\S+\)\[\d+\]\s*$/.test(clean) && cooled('ban', 8000)) {
            var bid = last.targetId;
            var hm = clean.match(/Осталось\s+(\d+)\s+час/i);
            setTimeout(function () {
                if (!_dead) whenNick(bid, function () { if (!_dead) sendSay(addr(bid) + ', на вас наложен запрет на покупку лицензии на оружие' + (hm ? '. Осталось ' + hm[1] + ' час(а)' : '')); });
            }, 300);
        }
        // Недостаточно денег / лицензия уже есть
        var noMoney = clean.indexOf('У покупателя недостаточно денег') !== -1;
        var hasLic = clean.indexOf('У покупателя уже есть этот тип лицензии') !== -1;
        if (noMoney || hasLic) {
            var ld = last;
            setTimeout(function () {
                if (_dead) return;
                var ph = LIC_PHRASE[ld.type] || { nom: ld.name, acc: ld.name };
                var price = Number(ld.price).toLocaleString('ru-RU');
                whenNick(ld.targetId, function () {
                    if (_dead) return;
                    sendSay(noMoney ? addr(ld.targetId) + ', у вас недостаточно денег на ' + ph.acc + '. Стоимость: ' + price + ' руб.'
                                    : addr(ld.targetId) + ', у вас уже есть ' + ph.nom);
                });
            }, 300);
        }
    }

    // «Просьба о чае»: сервер подтвердил выдачу (покупатель принял оффер)
    // Пример: Вы выдали "Лицензия на ношение и хранение оружия" игроку Ник_Фамилия за 85.000 руб
    if (STATE.tea && clean.indexOf('Вы выдали') !== -1 && licensorReady()) {
        var tm = clean.match(/Вы выдали\s+(?:лицензию\s+)?["«“`'][^"»”`']+["»”`']\s+игроку\s+(\S+)\s+за\s+[\d.\s]+\s*руб/i);
        if (tm && cooled('tea_' + tm[1], 5000)) {
            var tNick = tm[1];
            var tText = '/n ' + String(OPTS.TEA_TEXT).split('{nick}').join(tNick);
            setTimeout(function () { if (!_dead) { sendCmdPaced(tText); log('просьба о чае →', tNick); } }, 1500);
        }
    }
}

// Code.js перезаписывает window.OnChatAddMessage при (пере)инициализации чата — поэтому следим и
// при необходимости ставим обёртку заново (дубль обработки отсекается в onChat)
function ensureChatHook() {
    if (_dead) return;
    var cur = window.OnChatAddMessage;
    if (typeof cur === 'function' && !cur.__code3) {
        var w = function (e, c, t) {
            var r;
            if (typeof cur === 'function') r = cur.apply(this, arguments);
            if (!_dead) { try { onChat(e); } catch (er) { warn('onChat:', er); } }
            return r;
        };
        w.__code3 = true;
        window.OnChatAddMessage = w;
        dbg('хук чата установлен');
    }
}

// ══════ Кнопка авто-ответа «Нахожусь в правительстве» у входящих SMS ══════
var SMS_BTN_ENABLED = OPTS.SMS_BTN !== false;
var SMS_TEXT = 'Здравствуйте, нахожусь в правительстве [/gps - Правительство]'; // текст пункта «Место»
// Пункты, в которые раскрывается кнопка SMS: подпись -> что отправить в /sms
var SMS_LABEL_PLACE = 'Место';
var SMS_LABEL_PRICE = 'Ценовая политика';
// Текст «Ценовой политики» собирается из LIC_TYPES (те же цены, что в меню выдачи). Хочешь свой текст - впиши строку сюда.
var SMS_TEXT_PRICE = '';
if (OPTS.SMS_TEXT) SMS_TEXT = String(OPTS.SMS_TEXT);
if (OPTS.SMS_TEXT_PRICE) SMS_TEXT_PRICE = String(OPTS.SMS_TEXT_PRICE);
// ── Отправка SMS с разбиением на части и очередью ─────────────────────────────
// Сервер отвечает «Слишком длинное сообщение», если текст SMS длинный: 61 символ проходил, 80 - нет (точный лимит /sms в дампе мода не найден).
// Поэтому режем на части <= SMS_MAX_LEN и шлём подряд. Если снова увидите «Слишком длинное сообщение» - уменьшите число.
var SMS_MAX_LEN = 61;
var SMS_PART_DELAY = 700; // мс между частями (как PRAVO_CHAT_PART_DELAY у обычного чата); плюс ждём по модели антифлуда
var _c3SmsQueue = [];
var _c3SmsBusy = false;
var _c3SmsLastAt = 0;
// Сервер режет частые SMS ответом «Подождите несколько секунд...» (серый текст в чате, команда НЕ выполняется).
// Своего кулдауна /sms в дампе мода нет (PHONE_SMS_INTERVAL = 500 мс нигде не применяется, проверка в закрытой части), поэтому подстраиваемся:
// получили «Подождите...» -> часть возвращается в начало очереди, пауза между частями растёт и запоминается.
var SMS_GAP_STEP = 1500;   // мс: на сколько растёт пауза между частями после каждого «Подождите...»
var SMS_GAP_MAX = 8000;    // мс: потолок паузы
var SMS_RETRIES = 4;       // сколько раз повторяем одну часть, прежде чем сдаться
var SMS_ACK_WINDOW = 2500; // мс после отправки части, в течение которых «Подождите...» считаем ответом именно на неё
var _c3SmsGap = SMS_PART_DELAY;
var _c3SmsLast = null;        // { job, at, done } - последняя отправленная часть

// Режем по ", " (запятая остаётся в конце строки); слишком длинный кусок без запятых - общим резаком по словам
function _c3SmsSplit(text, max) {
    text = String(text == null ? '' : text).trim();
    max = max || SMS_MAX_LEN;
    if (text.length <= max) return text ? [text] : [];
    var toks = text.split(', '), parts = [], cur = '';
    for (var i = 0; i < toks.length; i++) {
        var piece = toks[i] + (i < toks.length - 1 ? ',' : '');
        var cand = cur ? cur + ' ' + piece : piece;
        if (cand.length <= max) { cur = cand; continue; }
        if (cur) parts.push(cur);
        cur = piece;
        if (cur.length > max) {
            var sub = splitSay(cur, max);
            cur = sub.pop() || '';
            parts = parts.concat(sub);
        }
    }
    if (cur) parts.push(cur);
    return parts;
}
function _c3SmsDrain() {
    if (_c3SmsBusy) return;
    _c3SmsBusy = true;
    (function next() {
        if (!_c3SmsQueue.length) { _c3SmsBusy = false; return; }
        var now = Date.now();
        var gap = Math.max(0, _c3SmsGap - (now - _c3SmsLastAt));         // пауза между частями (растёт, если сервер просил подождать)
        var fw = floodWait(1);                                            // антифлуд сервера (3000/1000 за команду)
        var w = Math.max(gap, fw);
        if (w > 0) {
            if (fw >= 700) { try { gtAdd('~y~Антифлуд~n~~w~SMS через ' + (fw / 1000).toFixed(1) + ' с', Math.min(fw + 300, 2500), 3); } catch (_) {} }
            setTimeout(next, w + 5);
            return;
        }
        var job = _c3SmsQueue.shift();
        rawSend('/sms ' + job.number + ' ' + job.text);
        _c3SmsLastAt = Date.now();
        _c3SmsLast = { job: job, at: _c3SmsLastAt, done: false };
        setTimeout(next, _c3SmsGap);
    })();
}
// Сервер ответил «Подождите несколько секунд...» на только что отправленную часть -> повторяем её позже
function _c3SmsOnWait() {
    var l = _c3SmsLast;
    if (!l || l.done || Date.now() - l.at > SMS_ACK_WINDOW) return; // это «Подождите» от другой команды
    l.done = true;
    var job = l.job;
    job.tries = (job.tries || 0) + 1;
    _c3SmsGap = Math.min(SMS_GAP_MAX, _c3SmsGap + SMS_GAP_STEP);
    try { console.log('[CODE3][SMS] «Подождите...» -> повтор части (' + job.tries + '), пауза ' + _c3SmsGap + ' мс', job.text); } catch (_) {}
    if (job.tries > SMS_RETRIES) {
        try { gtAdd('~r~SMS не ушло~n~~w~Сервер не принял сообщение', 3000, 3); } catch (_) {}
        return;
    }
    try { gtAdd('~y~SMS~n~~w~Сервер просит подождать, повтор через ' + (_c3SmsGap / 1000).toFixed(1) + ' с', Math.min(_c3SmsGap + 300, 3500), 3); } catch (_) {}
    _c3SmsQueue.unshift(job);
    _c3SmsDrain(); // если цикл уже остановился (очередь опустела) - запускаем заново
}
// Эхо отправителю «SMS: ... | Получатель: ...» = часть дошла, «Подождите» после неё уже не к ней
function _c3SmsOnAck() {
    if (_c3SmsLast) _c3SmsLast.done = true;
}
function _c3SmsSend(number, text) {
    var parts = _c3SmsSplit(text, SMS_MAX_LEN);
    for (var i = 0; i < parts.length; i++) _c3SmsQueue.push({ number: number, text: parts[i] });
    try { console.log('[CODE3][SMS] -> ' + number + ': ' + parts.length + ' сообщ.', parts); } catch (_) {}
    _c3SmsDrain();
}

// ── Ответ на входящий звонок прямо в разговоре (для кнопки «Ответ» в Telegram) ───────────────
// В моде (phone.pwn + OnPlayerText) после /p обычный текст из чата уходит собеседнику как «[Тел] Ник: текст» (лимит 83 символа).
// Поэтому: шлём /p, ждём подтверждение «Вы ответили на звонок ...» и только потом говорим текст. Если звонок уже сброшен
// («Нет входящих вызовов») - текст НЕ шлём, иначе он ушёл бы в обычный чат.
var CALL_IN_TTL = 120000;   // мс: сколько помним входящий звонок как «ещё можно ответить»
var CALL_ANS_WAIT = 4000;   // мс: сколько ждём «Вы ответили на звонок» после /p
var _c3CallIn = {};         // номер -> время входящего звонка (по строке «Входящий звонок | Номер: N»)
var _c3CallJob = null;      // { text, cb, timer } - ждём подтверждение ответа
var _c3CallWho = {};        // номер -> имя звонящего (по строке «Входящий звонок | Номер: N | Вызывает Ник»)
var _c3CallOut = {};        // номер -> { who, at } - мы позвонили, ждём ответа (по строке «Исходящий звонок | Номер: N | Ожидание ответа от Ник...»)
var _c3CallActive = null;   // { num, who, at } - разговор, на который уже ответили (вручную или кнопкой): в него можно говорить без /p
var CALL_ACTIVE_TTL = 30 * 60 * 1000;   // мс: страховка, если «Звонок окончен» не пришёл
// Имя из строки чата: без {btn:..}, {v:Ник} -> Ник, без цветовых кодов и хвостового «...»
function _c3CleanName(s) {
    return String(s == null ? '' : s).replace(/\{btn:[^}]*\}/g, '').replace(/\{v:([^}]*)\}/g, '$1').replace(/\{[0-9a-fA-F]{6}\}/g, '')
        .replace(/\s+/g, ' ').replace(/(\.{2,}|…)\s*$/, '').trim();
}
function _c3Norm(s) { return String(s == null ? '' : s).toLowerCase().replace(/ё/g, 'е').replace(/[_\s]+/g, ' ').trim(); }
function _c3CallJobEnd(res) {
    var j = _c3CallJob;
    if (!j) return;
    _c3CallJob = null;
    try { clearTimeout(j.timer); } catch (e) {}
    try { j.cb(res); } catch (e) {}
}
function _c3CallOnChat(clean) {
    try {
        var m = clean.match(/^\s*Входящий звонок\s*\|\s*Номер:\s*(\d+)(?:\s*\|\s*Вызывает\s+(.+))?/);
        if (m) { _c3CallIn[m[1]] = Date.now(); if (m[2]) _c3CallWho[m[1]] = _c3CleanName(m[2]); return; }
        // Мы позвонили: «Исходящий звонок | Номер: N | Ожидание ответа от Ник...» - запоминаем, кому звоним
        var om = clean.match(/^\s*Исходящий звонок\s*\|\s*Номер:\s*(\d+)\s*\|\s*Ожидание ответа от\s+(.+)$/);
        if (om) { _c3CallOut[om[1]] = { who: _c3CleanName(om[2]), at: Date.now() }; return; }
        if (/^\s*(Звонок окончен|Вы отклонили входящий вызов)/.test(clean)) { _c3CallIn = {}; _c3CallWho = {}; _c3CallOut = {}; _c3CallActive = null; return; }
        // Ответили на звонок: мы сами («Вы ответили на звонок Ник» - входящий, вручную или кнопкой) или нам («Ник ответил на Ваш звонок» - исходящий).
        // Запоминаем собеседника и номер - дальше его реплики «[Тел] Ник: текст» идут в Telegram с кнопкой «Ответ»
        var am = clean.match(/^\s*Вы ответили на звонок\s+(.+?)\s*$/), outAns = false;
        if (!am) { am = clean.match(/^\s*(.+?)\s+ответил на Ваш звонок\s*$/); outAns = !!am; }
        if (am) {
            var who = _c3CleanName(am[1]), wn = _c3Norm(who), anum = '', src = outAns ? _c3CallOut : _c3CallIn, names = outAns ? null : _c3CallWho;
            var keys = Object.keys(src), nowT = Date.now();
            for (var ki = 0; ki < keys.length; ki++) {
                var kn = outAns ? src[keys[ki]].who : names[keys[ki]], kat = outAns ? src[keys[ki]].at : src[keys[ki]];
                if (nowT - kat <= CALL_IN_TTL && kn && _c3Norm(kn) === wn) anum = keys[ki];
            }
            if (!anum && keys.length === 1) anum = keys[0];
            _c3CallActive = { num: anum, who: who, at: nowT, out: outAns };
            _c3CallIn = {}; _c3CallWho = {}; _c3CallOut = {};
        }
        var j = _c3CallJob;
        if (!j) return;
        if (am && !outAns) {
            _c3CallIn = {};
            _c3CallJob = null;
            try { clearTimeout(j.timer); } catch (e) {}
            setTimeout(function () {   // пауза: сервер должен успеть выставить состояние звонка
                if (_dead) return;
                sendSay(j.text);
                try { j.cb({ ok: true, text: j.text }); } catch (e) {}
            }, 500);
        } else if (/^\s*(Нет входящих вызовов|Сейчас Вы не можете пользоваться телефоном)/.test(clean)) {
            _c3CallIn = {};
            _c3CallJobEnd({ ok: false, reason: 'no_call' });
        }
    } catch (e) {}
}
// kind: 'place' | 'price'; cb({ok, text, reason}) reason: not_ready | no_call | busy | timeout
function _c3CallReply(number, kind, cb) {
    cb = typeof cb === 'function' ? cb : function () {};
    var num = String(number == null ? '' : number).replace(/\D/g, '');
    if (!licensorReady()) return cb({ ok: false, reason: 'not_ready' });
    var at = _c3CallIn[num];
    if (!at || Date.now() - at > CALL_IN_TTL) return cb({ ok: false, reason: 'no_call' });   // звонка с этим номером сейчас нет
    if (_c3CallJob) return cb({ ok: false, reason: 'busy' });
    var job = { text: kind === 'price' ? _c3SmsPriceText() : SMS_TEXT, cb: cb, timer: 0 };
    job.timer = setTimeout(function () { if (_c3CallJob === job) _c3CallJobEnd({ ok: false, reason: 'timeout' }); }, CALL_ANS_WAIT);
    _c3CallJob = job;
    sendCmdPaced('/p');
}
// Ответ в уже идущем разговоре: просто говорим текст (после /p обычный чат уходит собеседнику). kind: 'place' | 'price'
// cb({ok, text, reason}) reason: not_ready | no_call
function _c3CallSay(number, kind, cb) {
    cb = typeof cb === 'function' ? cb : function () {};
    if (!licensorReady()) return cb({ ok: false, reason: 'not_ready' });
    var a = _c3CallActive, num = String(number == null ? '' : number).replace(/\D/g, '');
    if (!a || Date.now() - a.at > CALL_ACTIVE_TTL || (num && a.num && num !== a.num)) return cb({ ok: false, reason: 'no_call' });
    var text = kind === 'price' ? _c3SmsPriceText() : SMS_TEXT;
    sendSay(text);
    cb({ ok: true, text: text });
}
onUndo(function () { try { if (_c3CallJob) clearTimeout(_c3CallJob.timer); } catch (e) {} _c3CallJob = null; _c3CallIn = {}; _c3CallWho = {}; _c3CallOut = {}; _c3CallActive = null; });

function _c3SmsPriceText() {
    if (SMS_TEXT_PRICE) return SMS_TEXT_PRICE;
    try {
        // Одним SMS: короткие названия («Проф. права» -> «Проф»), префикс «Цены: » - только если влезает в SMS_MAX_LEN
        var list = LIC_TYPES.map(function (t) { return t.name.replace(/^Проф\.? права$/i, 'Проф') + ' ' + Math.round(t.price / 1000) + 'к'; }).join(', ');
        var cands = ['Цены: ' + list, list];
        for (var i = 0; i < cands.length; i++) if (cands[i].length <= SMS_MAX_LEN) return cands[i];
        return cands[0]; // не влезло даже без префикса - _c3SmsSend порежет на части
    } catch (e) {
        return 'Цены: Права 10к, Проф 40к, Оружие 85к, Рыбалка 40к, Охота 65к';
    }
}
// Входящее: "SMS: текст | Отправитель: {v:Ник} [т.333351]"; группа 1 = номер
var SMS_RE = /SMS:.*\|\s*Отправитель:.*?\[т\.(\d+)\]/;
var SMS_ACTION = 9001; // числовой id: парсер чата принимает только {btn:число:число:число}
var SMS_ICON = 4;      // id иконки кнопки. В Hud.js есть только 0..3 (0 = трубка), у 4 иконки нет -> рисуем текст «SMS»
var SMS_LABEL = 'Ответ'; // надпись на кнопке (закрыто: стрелка вниз = можно открыть)
var SMS_LABEL_CLOSE = 'Закрыть'; // надпись, пока выбор раскрыт (стрелка вверх = можно закрыть)
var SMS_OPT_SCALE = 1; // размер кнопок «Место / Ценовая политика» относительно «Ответ» / «Закрыть» (1 = одинаковые)
var SMS_OPT_LINE = 1.15; // высота кнопок выбора в размерах шрифта (так движок рисует «Ответ»: ~19px при шрифте ~16.8px); выросла/упала разница - подправьте
var SMS_OUTLINE_COLOR = 'rgba(255,255,255,.65)'; // цвет контура вокруг сообщения + кнопок при раскрытии ('' = без контура)
var SMS_OUTLINE_RADIUS = '1.4vh'; // скругление углов рамки
var SMS_MENU_TIMEOUT = 30000; // мс: через сколько авто-свернуть раскрытый выбор, если ничего не нажали (0 = не сворачивать)
var SMS_MOBILE_SCALE = 2; // Хасл: во сколько раз кнопка больше, чем стандартная мобильная (2.78vh)
var SMS_PC_SCALE = 1.5;    // ПК: во сколько раз кнопка больше штатного кружка (1.85vh); 1.5 = 2.78vh
var SMS_HOVER_TEXT = 'inherit'; // цвет текста «Ответ»/«Закрыть» при наведении и в раскрытом виде: 'inherit' = цвет самого сообщения (жёлтый), либо любой CSS-цвет, например '#000'
var SMS_HOVER_INVERT = true; // при наведении: белый фон + чёрный текст (как у штатных кнопок чата); false = без подсветки

// ── Стили кнопки «SMS» (вместо круглой иконки-трубки) ─────────────────────────
(function _c3SmsBtnStyle() {
    var id = 'code3-sms-btn-css';
    if (document.getElementById(id)) return;
    var pcH = 1.85 * SMS_PC_SCALE;              // высота на ПК (штатный кружок 1.85vh * scale)
    var mbH = 2.78 * SMS_MOBILE_SCALE;          // высота на Хасле (штатные 2.78vh * scale)
    var cssOpt = function (h) {
        return 'height:auto!important;min-width:' + (h * 1.85).toFixed(2) + 'vh!important;' +
               'padding:0 ' + (h * 0.38).toFixed(2) + 'vh!important;border-radius:' + (h / 2).toFixed(2) + 'vh!important;' +
               'font-size:' + (h * 0.56).toFixed(2) + 'vh!important;line-height:' + SMS_OPT_LINE + '!important;';
    };
    var css = function (h) {
        return 'height:' + h + 'vh!important;min-width:' + (h * 1.85).toFixed(2) + 'vh!important;' +
               'padding:0 ' + (h * 0.38).toFixed(2) + 'vh!important;border-radius:' + (h / 2).toFixed(2) + 'vh!important;' +
               'font-size:' + (h * 0.56).toFixed(2) + 'vh!important;';
    };
    var s = document.createElement('style');
    s.id = id;
    s.textContent =
        '.chat-message-content__action.code3-sms-btn{' + css(pcH) +
            'box-sizing:border-box;background:rgba(255,255,255,.25);color:inherit;font-weight:700;line-height:1;' +
            'letter-spacing:.05em;font-family:"Open Sans",var(--fallback-font),sans-serif;user-select:none;-webkit-user-select:none;}' +
        (SMS_HOVER_INVERT ? '.chat-message-content__action.code3-sms-btn:hover{background:#fff;color:' + SMS_HOVER_TEXT + ';}' : '') +
        '.chat-message-content__action.code3-sms-btn>*{display:none!important;}' +
        // подпись + стрелка-треугольник (рисуется границами, не глифом - в шрифте чата может не быть символов-стрелок)
        '.chat-message-content__action.code3-sms-btn::before{content:"' + SMS_LABEL + '";}' +
        '.chat-message-content__action.code3-sms-btn::after{content:"";display:block;width:0;height:0;margin-left:.45em;' +
            'border-left:.36em solid transparent;border-right:.36em solid transparent;border-top:.46em solid currentColor;}' +
        // раскрыто: «Закрыть» + стрелка вверх, фон как у обычной «Ответ» (не белый); белым становится только при наведении
        '.chat-message-content__action.code3-sms-btn.code3-sms-btn--open{background:rgba(255,255,255,.25);color:inherit;}' +
        (SMS_HOVER_INVERT ? '.chat-message-content__action.code3-sms-btn.code3-sms-btn--open:hover{background:#fff;color:' + SMS_HOVER_TEXT + ';}' : '') +
        '.chat-message-content__action.code3-sms-btn.code3-sms-btn--open::before{content:"' + SMS_LABEL_CLOSE + '";}' +
        '.chat-message-content__action.code3-sms-btn.code3-sms-btn--open::after{border-top:0;border-bottom:.46em solid currentColor;}' +
        '.chat-message-content__action.code3-sms-btn.code3-sms-btn--mobile{' + css(mbH) + '}' +
        // раскрытый выбор - отдельная строка под сообщением; вид тот же, что у кнопки «Ответ» (свои элементы без data-v -> штатные стили чата не действуют)
        '.code3-sms-menu{display:flex;align-items:center;flex-wrap:wrap;box-sizing:border-box;padding:.3vh .6vh .35vh;color:#fff;font-weight:700;}' +
        // контур: сообщение (верх+бока) и строка кнопок (бока+низ) = одна скруглённая рамка из настоящих границ (углы ровные).
        // Ширину обеих частей выставляет _c3SmsFit() по реальным размерам
        (SMS_OUTLINE_COLOR ?
            '.chat-message.code3-sms-row--active{background-color:rgba(255,255,255,.08)!important;border:.16vh solid ' + SMS_OUTLINE_COLOR + '!important;border-bottom:0!important;' +
                'border-radius:' + SMS_OUTLINE_RADIUS + ' ' + SMS_OUTLINE_RADIUS + ' 0 0!important;}' +
            '.code3-sms-menu.code3-sms-menu--attached{background-color:rgba(255,255,255,.08);border:.16vh solid ' + SMS_OUTLINE_COLOR + ';border-top:0;' +
                'border-radius:0 0 ' + SMS_OUTLINE_RADIUS + ' ' + SMS_OUTLINE_RADIUS + ';}'
        : '') +
        // кнопки выбора = тот же вид, что у «Ответ / Закрыть»: тот же шрифт, отступы, скругление, межбуквенный интервал, обводка текста.
        // Высоту НЕ задаём: у «Ответ» (она внутри строки чата) движок игнорирует height и берёт высоту по шрифту, поэтому и тут высота по шрифту.
        '.code3-sms-opt{' + cssOpt(pcH * SMS_OPT_SCALE) +
            'display:inline-flex;align-items:center;justify-content:center;cursor:pointer;margin-right:.6vh;position:relative;' +
            'box-sizing:border-box;white-space:nowrap;background:rgba(255,255,255,.25);color:#fff;font-weight:700;' +
            'letter-spacing:.05em;font-family:"Open Sans",var(--fallback-font),sans-serif;user-select:none;-webkit-user-select:none;transition:all .25s ease;' +
            'text-shadow:-0.05vw -0.05vw 0 #000,0 -0.05vw 0 #000,0.05vw -0.05vw 0 #000,0.05vw 0 0 #000,0.05vw 0.05vw 0 #000,0 0.05vw 0 #000,-0.05vw 0.05vw 0 #000,-0.05vw 0 0 #000;}' +
        '.code3-sms-opt.code3-sms-opt--mobile{' + cssOpt(mbH * SMS_OPT_SCALE) + '}' +
        '.code3-sms-opt:hover{background:#fff;color:#000;}' +
        // сообщение в одну строку не переносим: «Ответ» -> «Закрыть» длиннее, иначе кнопка уезжает на вторую строку
        '.chat-message.code3-sms-row--nowrap .chat-message-content{white-space:nowrap!important;}';
    document.head.appendChild(s);
    onUndo(function () { if (s.parentNode) s.parentNode.removeChild(s); });
})();

// Помечаем кнопки SMS в чате: у них нет иконки (id SMS_ICON не существует) и рядом текст «SMS:»
function _c3MarkSmsBtns(root) {
    try {
        var scope = (root && root.querySelectorAll) ? root : document;
        var imgs = scope.querySelectorAll('.chat-message-content__action-image');
        var mobile = !!(window.App && window.App.isMobile);
        for (var i = 0; i < imgs.length; i++) {
            var src = imgs[i].getAttribute('src');
            if (src && !/undefined$/.test(src)) continue;         // у обычных кнопок иконка есть
            var btn = imgs[i].parentNode;
            if (!btn || !btn.classList || btn.classList.contains('code3-sms-btn')) continue;
            var p = btn.parentNode;
            if (!p || String(p.textContent || '').indexOf('SMS:') === -1) continue;
            btn.classList.add('code3-sms-btn');
            if (mobile) btn.classList.add('code3-sms-btn--mobile');
        }
    } catch (e) {}
}
(function _c3SmsBtnObserver() {
    var tries = 0;
    (function start() {
        if (!document.body) { if (++tries < 100) setTimeout(start, 100); return; }
        try {
            var mo = new MutationObserver(function (muts) {
                if (_dead) return;
                for (var i = 0; i < muts.length; i++) {
                    var added = muts[i].addedNodes;
                    for (var j = 0; j < added.length; j++) {
                        if (added[j].nodeType === 1) _c3MarkSmsBtns(added[j]);
                    }
                }
            });
            mo.observe(document.body, { childList: true, subtree: true });
            onUndo(function () { try { mo.disconnect(); } catch (e) {} });
        } catch (e) {}
        if (!_dead) _c3MarkSmsBtns(document);
    })();
})();

// ── Раскрытие кнопки SMS в выбор «Место / Ценовая политика» ───────────────────
var _c3SmsLastBtn = null; // кнопка SMS, по которой кликнули (DOM-элемент); значение номера придёт в onChatMessageAction

function _c3SmsCollapse(menu) {
    try {
        if (!menu) return;
        if (menu._c3Timer) { clearTimeout(menu._c3Timer); menu._c3Timer = 0; }
        var btn = menu._c3Btn;
        if (btn) { btn._c3Menu = null; if (btn.classList) btn.classList.remove('code3-sms-btn--open'); }
        if (menu._c3Row && menu._c3Row.classList) {
            var r = menu._c3Row;
            r.classList.remove('code3-sms-row--active');
            r.classList.remove('code3-sms-row--nowrap');
            r.style.width = r.style.boxSizing = r.style.paddingLeft = r.style.paddingRight = '';
            r.style.flexGrow = r.style.flexShrink = r.style.alignSelf = '';
        }
        if (menu.parentNode) menu.parentNode.removeChild(menu);
    } catch (e) {}
}
function _c3SmsCollapseAll() {
    try {
        var menus = document.querySelectorAll('.code3-sms-menu');
        for (var i = 0; i < menus.length; i++) _c3SmsCollapse(menus[i]);
    } catch (e) {}
}
// Строка сообщения чата (flex: время + текст), под которой показываем выбор
function _c3SmsRow(btn) {
    var el = btn;
    for (var i = 0; i < 6 && el && el.parentNode; i++) {
        if (el.classList && el.classList.contains('chat-message')) return el;
        el = el.parentNode;
    }
    return null;
}
// Подгоняем рамку: одна скруглённая рамка по ширине самого длинного из двух - сообщения или строки кнопок (а не на весь чат).
// Размеры берём из getBoundingClientRect (экранные px) и переводим в px вёрстки через эталон: у чата может быть scale/transform.
// getComputedStyle в этом движке может вернуть значение в vh/vw/em (напр. "1.55vh"), а не в px - переводим в px вёрстки сами
function _c3Px(val, el) {
    try {
        var str = String(val == null ? '' : val).trim();
        var n = parseFloat(str);
        if (!isFinite(n)) return 0;
        if (/vh\s*$/i.test(str)) return n * (window.innerHeight || 1080) / 100;
        if (/vw\s*$/i.test(str)) return n * (window.innerWidth || 1920) / 100;
        if (/em\s*$/i.test(str) && !/rem\s*$/i.test(str)) {
            var fs = el ? _c3Px(getComputedStyle(el).fontSize, null) : 16;
            return n * (fs || 16);
        }
        return n;
    } catch (e) { return 0; }
}
function _c3SmsFit(row, menu, btn) {
    try {
        if (!SMS_OUTLINE_COLOR || !row || !menu || !menu.parentNode) return;
        var kids = row.children, lastR = kids && kids.length ? kids[kids.length - 1] : null;
        var lastM = menu.lastElementChild;
        if (!lastR || !lastM) return;
        // 1) масштаб чата (экранные px -> px вёрстки): отношение экранной ширины строки к её offsetWidth; без масштаба = 1
        var scale = 1;
        try {
            var _rw = row.getBoundingClientRect().width, _ow = row.offsetWidth;
            if (_rw > 0 && _ow > 0) scale = _rw / _ow;
            if (!(scale > 0.4 && scale < 2.5) || Math.abs(scale - 1) < 0.03) scale = 1;
        } catch (_) { scale = 1; }
        // 2) естественные ширины (до наших отступов)
        var rr = row.getBoundingClientRect(), mm = menu.getBoundingClientRect();
        var lr = lastR.getBoundingClientRect(), lm = lastM.getBoundingClientRect();
        var padM = _c3Px(getComputedStyle(menu).paddingLeft, menu);
        var padR = padM;
        var bw = _c3Px(getComputedStyle(row).borderLeftWidth, row); // толщина границы рамки
        var mR = _c3Px(getComputedStyle(lastM).marginRight, lastM);
        var w1 = (lr.right - rr.left) / scale + padR * 2 + bw * 2; // сообщение
        var w2 = (lm.right - mm.left) / scale + mR + padM + bw * 2; // кнопки
        // 2b) подпись «Ответ» -> «Закрыть» длиннее на ~2 буквы, а движок пересчитывает её не сразу.
        //     Движок отдаёт размеры прошлого кадра (с подписью «Ответ»), поэтому запас закладываем вручную, иначе «Закрыть» не влезает и переносится вниз.
        var reserve = 0;
        try {
            var bfs = _c3Px(getComputedStyle(btn).fontSize, btn) || 16;
            if (bfs < 6) bfs = (window.innerHeight || 1080) * 0.0155; // страховка: шрифт кнопки ~1.55vh
            // «Закрыть» шире «Ответ» на ~25px при шрифте ~16.8px (замер по скриншотам: 100px против 75px) = ~0.75 шрифта на лишнюю букву.
            // + запас 0.6 шрифта (~10px), чтобы кнопка гарантированно не переносилась на вторую строку. Свойство min-width на кнопку в чате движок игнорирует
            reserve = Math.max(0, SMS_LABEL_CLOSE.length - SMS_LABEL.length) * bfs * 0.75 + bfs * 0.6;
        } catch (_) {}
        w1 += reserve;
        var full = rr.width / scale;                        // ширина списка сообщений
        var W = Math.ceil(Math.max(w1, w2)) + 4;            // +4px запаса: иначе из-за округления текст/кнопки могут перенестись
        if (full > 0) W = Math.min(W, Math.floor(full));
        try { console.log('[CODE3][SMS] рамка: scale=' + scale.toFixed(3) + ' сообщение=' + Math.round(w1) + ' (запас ' + Math.round(reserve) + ') кнопки=' + Math.round(w2) + ' список=' + Math.round(full) + ' -> ' + W + 'px'); } catch (_) {}
        if (!(W > 0)) return;
        // 3) обе части одной ширины = одна рамка
        row.style.boxSizing = 'border-box';
        row.style.paddingLeft = padR + 'px';
        row.style.paddingRight = padR + 'px';
        row.style.width = W + 'px';
        row.style.flexGrow = '0'; row.style.flexShrink = '0'; row.style.alignSelf = 'flex-start';
        menu.style.width = W + 'px';
        menu.style.flexWrap = 'nowrap';
        menu.style.flexGrow = '0'; menu.style.flexShrink = '0'; menu.style.alignSelf = 'flex-start';
        // 4) сообщение, которое и так умещалось в одну строку, держим в одну строку; длинные (в несколько строк) переносятся как обычно
        if (full > 0 && w1 + 40 < full) row.classList.add('code3-sms-row--nowrap');
    } catch (e) { try { console.log('[CODE3][SMS] ошибка подгонки рамки', e); } catch (_) {} }
}
function _c3SmsExpand(btn, number) {
    try {
        if (!btn || !btn.parentNode) return false;
        // повторный клик по «Ответ» сворачивает выбор
        if (btn._c3Menu && btn._c3Menu.parentNode) { _c3SmsCollapse(btn._c3Menu); return true; }
        _c3SmsCollapseAll(); // одновременно раскрыта только одна кнопка
        var mobile = btn.classList.contains('code3-sms-btn--mobile');
        var menu = document.createElement('div');
        menu.className = 'code3-sms-menu';
        menu._c3Btn = btn;
        var opts = [
            { label: SMS_LABEL_PLACE, text: function () { return SMS_TEXT; } },
            { label: SMS_LABEL_PRICE, text: _c3SmsPriceText }
        ];
        opts.forEach(function (o) {
            var b = document.createElement('span');
            b.className = 'code3-sms-opt' + (mobile ? ' code3-sms-opt--mobile' : '');
            b.textContent = o.label;
            b.addEventListener('click', function (ev) {
                try { ev.stopPropagation(); ev.preventDefault(); } catch (_) {}
                try { _c3SmsSend(number, o.text()); } catch (e) {
                    try { console.log('[CODE3] SMS: ошибка отправки', e); } catch (_) {}
                }
                _c3SmsCollapse(menu); // отправили -> выбор убирается, остаётся одна кнопка «Ответ»
            });
            menu.appendChild(b);
        });
        btn.classList.add('code3-sms-btn--open'); // «Закрыть» + стрелка вверх (до замеров рамки: подпись меняет ширину)
        var row = _c3SmsRow(btn);
        if (row && row.parentNode) {
            row.parentNode.insertBefore(menu, row.nextSibling); // отдельной строкой под сообщением
            row.classList.add('code3-sms-row--active');        // контур вокруг «своего» сообщения + строки кнопок
            menu.classList.add('code3-sms-menu--attached');
            menu._c3Row = row;
            _c3SmsFit(row, menu, btn);
        } else btn.parentNode.appendChild(menu);
        btn._c3Menu = menu;
        if (SMS_MENU_TIMEOUT > 0) menu._c3Timer = setTimeout(function () { _c3SmsCollapse(menu); }, SMS_MENU_TIMEOUT);
        return true;
    } catch (e) { return false; }
}
// Запоминаем, по какой именно кнопке SMS кликнули (capture: срабатывает раньше обработчика Vue)
(function _c3SmsClickTracker() {
    var tries = 0;
    (function start() {
        if (!document.body) { if (++tries < 100) setTimeout(start, 100); return; }
        var onClk = function (e) {
            try {
                var t = e.target;
                _c3SmsLastBtn = (t && t.closest) ? t.closest('.code3-sms-btn') : null;
            } catch (_) { _c3SmsLastBtn = null; }
        };
        document.addEventListener('click', onClk, true);
        onUndo(function () { document.removeEventListener('click', onClk, true); });
    })();
})();

function _c3AddSmsButton(message) {
    try {
        if (!SMS_BTN_ENABLED || typeof message !== 'string') return message;
        if (!licensorReady()) return message;
        if (message.indexOf('{btn:') !== -1) return message; // уже есть кнопка
        var m = message.match(SMS_RE);
        if (!m) return message;
        return message + ' {btn:' + SMS_ICON + ':' + SMS_ACTION + ':' + m[1] + '}';
    } catch (e) { return message; }
}

(function _c3HookChatAction() {
    var tries = 0;
    (function hook() {
        var orig = window.onChatMessageAction;
        if (typeof orig !== 'function') {
            if (++tries < 100 && !_dead) setTimeout(hook, 100);
            return;
        }
        if (orig.__code3Sms) return;   // уже обёрнуто (повторный запуск после cleanup обёртку снимает)
        var wrapped = function (button, action, value) {
            if (!_dead && String(action) === String(SMS_ACTION)) {
                var _b = _c3SmsLastBtn; _c3SmsLastBtn = null;
                // Раскрываем выбор «Место / Ценовая политика»; если кнопку в DOM не нашли - шлём «Место» как раньше
                if (!_c3SmsExpand(_b, value)) _c3SmsSend(value, SMS_TEXT);
                return;
            }
            return orig.apply(this, arguments);
        };
        wrapped.__code3Sms = true;
        window.onChatMessageAction = wrapped;
        onUndo(function () { if (window.onChatMessageAction === wrapped) window.onChatMessageAction = orig; });
    })();
})();
onUndo(function () { try { _c3SmsCollapseAll(); } catch (e) {} });


// Главный перехват чата — как в pravo.js: Hud.$refs.chat.add видит КАЖДОЕ сообщение (OnChatAddMessage остаётся запасным
// путём; дубль одного и того же сообщения отсекается в onChat). Заодно дописывает кнопку SMS к входящим SMS.
function ensureChatAddHook() {
    if (_dead) return;
    try {
        var hud = iface('Hud');
        var chat = hud && hud.$refs && hud.$refs.chat;
        if (!chat || typeof chat.add !== 'function' || chat.add.__code3) return;
        var orig = chat.add;
        var w = function (message) {
            var args = arguments;
            if (!_dead && typeof message === 'string') {
                try { onChat(message); } catch (er) { warn('onChat:', er); }
                try {
                    var m2 = _c3AddSmsButton(message);
                    if (m2 !== message) { args = [].slice.call(arguments); args[0] = m2; }
                } catch (er2) {}
            }
            return orig.apply(this, args);
        };
        w.__code3 = true;
        chat.add = w;
        dbg('хук Hud.chat.add установлен');
        onUndo(function () { if (chat.add === w) chat.add = orig; });
    } catch (e) {}
}

// ══════════════════════════ УСТАНОВКА ХУКОВ ══════════════════════════
(function installHooks() {

    // Консоль: режим /code3 (если игра/другой скрипт переприсвоит console.* — ставим фильтр заново)
    ensureConsoleFilter();
    every(ensureConsoleFilter, 2000);
    // Чат-команды + счёт отправленного в антифлуд. Цепочка как у Code.js: window.sendChatInputCustom || sendChatInput
    var origChatWin = window.sendChatInputCustom;
    var origChatVar = null;
    try { if (typeof sendChatInput === 'function') origChatVar = sendChatInput; } catch (e) {}
    prevChat = origChatWin || origChatVar;
    var myChat = function (e) {
        if (!_dead && typeof e === 'string') {
            var a = e.trim().split(/\s+/), cmd = (a[0] || '').toLowerCase();
            if (cmd === '/code3') {   // работает всегда (не только лицензёру): вкл/выкл «в консоли только логи Code3»
                var ca = (a[1] || '').toLowerCase();
                setOnly((ca === 'on' || ca === '1' || ca === 'вкл') ? true : (ca === 'off' || ca === '0' || ca === 'выкл') ? false : !STATE.only);
                return;
            }
            if (cmd === '/licmenu' || (cmd === '/dahk' && licensorReady())) { showLicMenu(); return; }
            // /givelic и /givelic <ID>: штатная команда уходит на сервер как раньше + наш диалог поверх (если мы лицензёр)
            if (cmd === '/givelic' && a.length <= 2) {
                floodNote(1);
                if (typeof prevChat === 'function') prevChat.apply(this, arguments);
                if (licensorReady()) { if (a.length === 1) showIdInput(); else showTypeDialog(a[1]); }
                return;
            }
        }
        floodNote(1);
        if (typeof prevChat === 'function') return prevChat.apply(this, arguments);
    };
    window.sendChatInputCustom = myChat;
    try { sendChatInput = myChat; } catch (e) {}
    onUndo(function () {
        if (window.sendChatInputCustom === myChat) window.sendChatInputCustom = origChatWin;
        try { if (sendChatInput === myChat) sendChatInput = origChatVar || origChatWin; } catch (e) {}
    });

    // События клиента: клики по нашим кнопкам Interactions и ответы на наши диалоги
    var origEvtWin = window.sendClientEventCustom;
    var origEvtVar = null;
    try { if (typeof sendClientEvent === 'function') origEvtVar = sendClientEvent; } catch (e) {}
    var prevEvt = origEvtWin || origEvtVar;
    var myEvt = function (event) {
        if (!_dead) {
            var args = [].slice.call(arguments, 1);
            try {
                if (args[0] === 'OnInteractionsClick' && onInteractionsClick(parseInt(args[1]))) return;
                if (args[0] === 'OnDialogResponse' && onDialogResponse(args)) return;
            } catch (er) { warn('sendClientEvent:', er); }
        }
        if (typeof prevEvt === 'function') return prevEvt.apply(this, arguments);
        if (typeof window.sendClientEventHandle === 'function') return window.sendClientEventHandle.apply(window, arguments);
    };
    window.sendClientEventCustom = myEvt;
    try { sendClientEvent = myEvt; } catch (e) {}
    onUndo(function () {
        if (window.sendClientEventCustom === myEvt) window.sendClientEventCustom = origEvtWin;
        try { if (sendClientEvent === myEvt) sendClientEvent = origEvtVar || origEvtWin; } catch (e) {}
    });

    // openInterface: Interactions (наши пункты поверх серверных) и PlayerInteraction (круговое меню + пункт в круге)
    hookProp('openInterface', function (prev) {
        openPrev = prev;
        return function (name, params) {
            if (_dead) return prev.apply(this, arguments);

            if (name === 'Interactions' && panelAllowed()) {
                var server = parseServerItems(params);
                if (server.length) lastServerItems = server;
                var combined = ownItems().concat(server);
                intOpen = true;
                var inst = iface('Interactions');
                if (inst && isOpen('Interactions')) {
                    // оригинал делает early-return, если интерфейс уже открыт, — обновляем список напрямую
                    hookSetInfo();
                    inst.setInfo(JSON.stringify(combined));
                    return;
                }
                var res = prev.call(this, name, JSON.stringify(combined));
                setTimeout(hookSetInfo, 50);   // движок может вызвать setInfo уже после открытия и затереть список
                return res;
            }

            if (name === 'PlayerInteraction') {
                var was = isOpen('PlayerInteraction');
                if (!was) {
                    if (circle.pending) { tr('OPEN/ПРОПУСК', 'повторный openInterface, пока идёт определение ID (circle.pending)'); return Promise.resolve(); }   // это открытие уже обрабатываем
                    var nick = parseNick(params);
                    if (STATE.circle && nick && giveTarget !== -1 && typeof window.IsDialogOpened === 'function' && window.IsDialogOpened() && norm(giveNick) === norm(nick)) {
                        // выбор типа для этого игрока уже на экране — второй перехват заменил бы диалог (визуально «переоткрывается»)
                        tr('OPEN/ПРОПУСК', 'выбор лицензии для ' + nickInfo(nick) + ' уже открыт — повторно не открываем');
                        srvSend('MenuInt_OnCloseInterface', 0);   // сервер считает меню открытым — сбрасываем
                        return Promise.resolve();
                    }
                    rmBegin(params, nick);
                    var intercept = false;
                    try { intercept = !!nick && circleCanIntercept(nick); } catch (e) { tr('OPEN/ОШИБКА', 'circleCanIntercept', e); }
                    if (!nick) tr('OPEN/ник пуст', 'не меню игрока (машина/дом/NPC) или params не разобрались — перехвата не будет');
                    if (intercept) {
                        try { circleHandle(nick, params); } catch (e) { tr('OPEN/ОШИБКА', 'circleHandle бросил', e); circleShowNormal(params, nick, 'исключение в circleHandle'); }
                        return Promise.resolve();
                    }
                } else {
                    tr('OPEN/уже открыто', 'openInterface(PlayerInteraction) при открытом меню', 'params=' + tstr(params).slice(0, 200));
                }
                var r = prev.apply(this, arguments);
                if (!was) {
                    tr('OPEN/штатное меню открыто', 'piOpen=' + isOpen('PlayerInteraction'), 'дальше inject пункта «Выдача лицензии»');
                }
                try { Radial.onOpen(params, was); Chat.kick(); } catch (e) { tr('OPEN/ОШИБКА', 'после открытия', e); }
                return r;
            }
            return prev.apply(this, arguments);
        };
    });

    // closeInterface: сервер закрывает Interactions — наши пункты должны остаться; PlayerInteraction — убираем слой под чат
    hookProp('closeInterface', function (prev) {
        return function (name) {
            if (!_dead && name === 'Interactions' && intOpen) {
                if (panelAllowed()) {
                    lastServerItems = [];
                    try {
                        var ic = iface('Interactions');
                        if (ic && typeof ic.setInfo === 'function') ic.setInfo(JSON.stringify(ownItems()));
                    } catch (e) {}
                    return;
                }
                intOpen = false;   // нам панель больше не положена — закрываем по-настоящему
            }
            var r = prev.apply(this, arguments);
            if (!_dead && name === 'PlayerInteraction') { tr('CLOSE/closeInterface', 'PlayerInteraction закрыт', 'circle.pending=' + circle.pending); try { Chat.teardown(); } catch (e) {} }
            return r;
        };
    });

    // updateParams: сервер может обновить меню игрока на лету
    hookProp('updateParams', function (prev) {
        if (typeof prev !== 'function') return prev;
        return function (name, params) {
            var r = prev.apply(this, arguments);
            if (!_dead && name === 'PlayerInteraction') {
                try { tr('UPDATE/updateParams', 'PlayerInteraction', 'params=' + tstr(params).slice(0, 200)); Radial.onUpdate(params); } catch (e) { tr('UPDATE/ОШИБКА', e); }
            }
            return r;
        };
    });

    // Чат
    ensureChatHook();
    every(ensureChatHook, 1500);
    ensureChatAddHook();
    every(ensureChatAddHook, 1500);   // чат (Hud) может появиться позже или пересоздаться — ставим заново

    // Клавиатура: хуки на setDrawLabelStatus / hideKeyboard
    kbEnsureHooks();
})();

// ══════════════════════════ ЗАПУСК ══════════════════════════
// Звание могло смениться (повышение/понижение): раз в минуту перечитываем уже загруженный профиль (без запросов к серверу)
every(function () { if (isGovSkin() && _rank) pullRank(); }, 60000);
setTimeout(function () { if (!_dead) { ensureRank(); updatePanel(); } }, 1500);

// Для отладки из консоли: __code3.state(), __code3.menu(), __code3.opts
window.__code3 = {
    version: VERSION,
    opts: OPTS,
    state: function () { return { skin: _skin, gov: isGovSkin(), rank: _rank, licensor: isLicensor(), ready: licensorReady(), last: STATE.last, tea: STATE.tea, circle: STATE.circle, panel: intOpen }; },
    menu: showLicMenu,
    only: function (v) { return (v === undefined) ? !!STATE.only : setOnly(v); },   // __code3.only() — состояние, __code3.only(true/false) — переключить
    panel: updatePanel,
    refreshRank: ensureRank,
    // API для Telegram-вкладки «Лицензёр» (Code2.js)
    types: LIC_TYPES,
    ready: licensorReady,
    give: function (id, idx) { return licensorReady() && giveByIndex(String(id), idx); },
    reissue: function () { if (!licensorReady() || !STATE.last) return false; reissueLic(); return true; },
    // Переключатели из меню лицензёра (то же, что пункты «Круговое меню» / «Просьба о чае» в игре); возвращают новое состояние или null
    toggleTea: function () { if (!licensorReady()) return null; toggleTea(); return !!STATE.tea; },
    toggleCircle: function () { if (!licensorReady()) return null; toggleCircle(); return !!STATE.circle; },
    // Ответ по SMS (кнопка «Ответ» в Telegram): kind = 'place' («Место») | 'price' («Ценовая политика»); возвращает отправленный текст или ''
    smsReply: function (number, kind) {
        var num = String(number == null ? '' : number).replace(/\D/g, '');
        if (!num || !licensorReady()) return '';
        var text = kind === 'price' ? _c3SmsPriceText() : SMS_TEXT;
        _c3SmsSend(num, text);
        return text;
    },
    // Ответ на входящий звонок в разговоре: /p + текст «Место» / «Ценовая политика»; результат приходит в cb({ ok, text, reason })
    callReply: function (number, kind, cb) { _c3CallReply(number, kind, cb); },
    // Разговор, на который уже ответили: { num, who } или null (нужен Telegram-вкладке, чтобы узнать, чьи реплики пересылать)
    callActive: function () { var a = _c3CallActive; return a && Date.now() - a.at <= CALL_ACTIVE_TTL ? { num: a.num, who: a.who } : null; },
    // Ответ текстом в идущем разговоре (без /p): cb({ ok, text, reason })
    callSay: function (number, kind, cb) { _c3CallSay(number, kind, cb); },
    last: function () { return STATE.last; },
    whenNick: function (id, cb) { whenNick(id, cb); },
    // Логирование: __code3.trace(80) — последние 80 строк (массив) · traceText(150) — текстом · traceCopy() — в буфер обмена
    trace: function (n) { return n ? _trBuf.slice(-n) : _trBuf.slice(); },
    traceText: function (n) { return (n ? _trBuf.slice(-n) : _trBuf).join('\n'); },
    traceClear: function () { _trBuf.length = 0; return true; },
    traceCopy: function (n) {
        var txt = (n ? _trBuf.slice(-n) : _trBuf).join('\n');
        try {
            var ta = document.createElement('textarea');
            ta.value = txt; ta.style.cssText = 'position:fixed;left:-9999px;top:0';
            document.body.appendChild(ta); ta.select();
            var ok = document.execCommand('copy');
            document.body.removeChild(ta);
            return ok ? 'скопировано строк: ' + (n ? Math.min(n, _trBuf.length) : _trBuf.length) : 'не удалось скопировать — используйте __code3.traceText()';
        } catch (e) { return 'не удалось скопировать: ' + tstr(e); }
    },
    lastFail: function () { return _lastFail; },   // снимок последнего «не удалось определить ID»: ник, причина, состояние, 60 строк трассы
    diag: function () { return { version: VERSION, state: stateInfo(), lastResolve: _lastResolve, session: _rmSid, circle: { pending: circle.pending }, radial: Radial.state(), target: Target.last() }; }
};
tr('INIT', VERSION + ' загружен', stateInfo());
log(VERSION + ' загружен. Помощник лицензёра активен только в правительственном скине со званием «Лицензёр». /dahk — меню.');

})(); } catch (e) { try { console.error('[CODE3] ошибка загрузки помощника лицензёра:', e); } catch (e2) {} }

// ╔══════════════════════════════════════════════════════════╗
// ║  MODULE: LICENSOR (Telegram)                             ║
// ║  Описание: вкладка «🪪 Лицензёр» в «Функции»:            ║
// ║   • «Сообщения игроков рядом» — пересылка в Telegram     ║
// ║     сообщений игроков из чата, сказанных РЯДОМ (радиус   ║
// ║     CLOSE), а не только фракции; config.licNearOnly=false ║
// ║     вернёт пересылку всех радиусов;                      ║
// ║   • «Круговое меню» и «Просьба о чае» — переключатели    ║
// ║     как в игровом меню лицензёра;                        ║
// ║   • «Ответ» под входящим SMS и под сообщениями           ║
// ║     собеседника в разговоре (входящий или исходящий      ║
// ║     звонок, после ответа):                               ║
// ║     «Место» / «Ценовая политика»; SMS — ответ по /sms,   ║
// ║     в разговоре — текст сразу в звонок (без /p);         ║
// ║   • «Выдача лицензий» — выбор лицензии → ID игрока →     ║
// ║     /givelic через Code3.js (window.__code3);            ║
// ║   • под сообщением игрока — те же кнопки, что у сообщений ║
// ║     сотрудников фракции + внизу «Выдача лицензии»        ║
// ║     (выдача / перевыдача этому игроку);                  ║
// ║   • под сообщением сотрудника фракции (от Code.js) тоже   ║
// ║     есть «Выдача лицензии»; дубль этого сообщения не шлётся ║
// ║   • кнопка выдачи в одно нажатие сверху, если по тексту  ║
// ║     игрока определился тип лицензии; необязательный      ║
// ║     фильтр «только про лицензии» (по умолчанию выкл).    ║
// ║  Работает только в правительственном скине (любом из     ║
// ║  списка) и со званием «Лицензёр», иначе всё молчит.      ║
// ║  Всё через перехваты — Code.js и Code2.js НЕ меняются:   ║
// ║  showFunctionsMenu, processUpdates, OnChatAddMessage.    ║
// ╚══════════════════════════════════════════════════════════╝
// START LICENSOR TG MODULE //
try { (function () {
    'use strict';
    function c3Dbg(m) { try { console.log('[CODE3][TG] ' + m); } catch (e) {} }   // раньше debugLog из Code.js — под /code3 он скрыт
    // Модуль ходит в переменные Code.js (config, uniqueId, processUpdates…): работает, только если Code3 выполнен
    // в той же области видимости (Load.js подклеивает Code3.js к Code2.js перед eval). Иначе тихо пропускаем.
    if (typeof config === 'undefined' || typeof processUpdates !== 'function' || typeof showFunctionsMenu !== 'function') {
        try { console.warn('[CODE3] Telegram-вкладка «Лицензёр» не установлена: нет доступа к Code.js'); } catch (e) {}
        return;
    }
    if (typeof config.licAllMessages !== 'boolean') config.licAllMessages = false;
    if (typeof config.licNearOnly !== 'boolean') config.licNearOnly = true;   // true — «Все сообщения игроков» пересылает только те, что сказаны рядом (радиус CLOSE); false — как раньше, все радиусы
    if (typeof config.licFilter !== 'boolean') config.licFilter = false;  // false — пересылаются все сообщения; true — только про лицензии (радиус «рядом»)

    const PFX = 'lic|';   // callback_data: lic|<действие>|<арг...>|<uid>
    const PROMPT_MARK = 'LIC_UID: ';

    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    function money(n) { return Number(n).toLocaleString('ru-RU') + ' ₽'; }
    function api() { return window.__code3 || null; }
    function ready() { try { const a = api(); return !!(a && a.ready && a.ready()); } catch (e) { return false; } }
    function types() { const a = api(); return (a && a.types) || []; }
    function btn(t, d, st) { return createButton(t, d, st); }

    function notReadyText() {
        const a = api();
        if (!a) return '❌ <b>Помощник лицензёра не загружен</b>\nCode3.js не найден (' + esc(displayName) + ').';
        let st = {};
        try { st = a.state() || {}; } catch (e) {}
        return '❌ <b>Выдача недоступна (' + esc(displayName) + ')</b>\n' +
            'Нужен правительственный скин и звание «Лицензёр».\n' +
            'Скин: ' + (st.gov ? '✅' : '❌') + ' | Звание: ' + esc(st.rank || '—');
    }

    // ── Вкладка «Лицензёр» (правим только клавиатуру — текст сообщения остаётся, «назад» в «Функции» работает) ──
    function apiState() { try { return (api() && api().state && api().state()) || {}; } catch (e) { return {}; } }
    function showMenu(chatId, messageId, uid) {
        const last = (api() && api().last && api().last()) || null;
        const stt = apiState();   // круговое меню / чай — то же состояние, что в игровом меню лицензёра
        const rows = [
            [btn('Помощник: ' + (ready() ? '🟢 активен' : '🔴 недоступен'), PFX + 'menu|' + uid)],
            [btn('💬 Сообщения игроков рядом ' + (config.licAllMessages ? '🟢' : '🔴'), PFX + 'toggle|' + uid, config.licAllMessages ? 'success' : 'danger')],
            [btn('🎯 Только про лицензии ' + (config.licFilter ? '🟢' : '🔴'), PFX + 'filter|' + uid, config.licFilter ? 'success' : 'danger')],
            [btn('⭕ Круговое меню ' + (stt.circle ? '🟢' : '🔴'), PFX + 'circle|' + uid, stt.circle ? 'success' : 'danger')],
            [btn('☕ Просьба о чае ' + (stt.tea ? '🟢' : '🔴'), PFX + 'tea|' + uid, stt.tea ? 'success' : 'danger')],
            [btn('🪪 Выдача лицензий', PFX + 'types|' + uid, 'primary')]
        ];
        if (last) rows.push([btn('🔁 Перевыдать: ' + last.name + ' → ' + last.targetId, PFX + 'reissue|' + uid)]);
        rows.push([btn('⬅️ Вернуться назад', 'show_functions_' + uid)]);
        editMessageReplyMarkup(chatId, messageId, { inline_keyboard: rows });
    }
    // Выбор лицензии → потом спросим ID ответом на сообщение
    function showTypes(chatId, messageId, uid) {
        const rows = types().map(function (t, i) {
            return [btn(t.name + ' — ' + money(t.price), PFX + 'pick|' + i + '|' + uid)];
        });
        rows.push([btn('⬅️ Вернуться назад', PFX + 'menu|' + uid)]);
        editMessageReplyMarkup(chatId, messageId, { inline_keyboard: rows });
    }
    function doGive(target, idx) {
        const t = types()[idx];
        if (!t) return false;
        if (!ready()) { sendToTelegram(notReadyText(), false, null); return false; }
        const ok = !!api().give(target, idx);
        if (ok) {
            sendToTelegram('✅ <b>Отправлено (' + esc(displayName) + ')</b>\n<code>/givelic ' + esc(target) + ' ' + t.type + ' ' + t.price + '</code>\n🪪 ' + esc(t.name) + ' — ' + money(t.price), false, null);
        } else {
            sendToTelegram('❌ <b>Не удалось отправить /givelic (' + esc(displayName) + ')</b>', false, null);
        }
        return ok;
    }

    // Перевыдача последней лицензии — только если она всё ещё предназначена этому игроку
    function reissueFor(tid) {
        if (!ready()) { sendToTelegram(notReadyText(), false, null); return false; }
        const last = lastGive();
        if (!last) { sendToTelegram('❌ <b>Нет данных для перевыдачи (' + esc(displayName) + ')</b>', false, null); return false; }
        if (String(last.targetId) !== String(tid)) {
            sendToTelegram('⚠️ <b>Перевыдача отменена (' + esc(displayName) + ')</b>\nПоследняя выдача была другому игроку: ID <code>' + esc(last.targetId) + '</code> (' + esc(nickOf(last.targetId) || '—') + ').', false, null);
            return false;
        }
        const ok = !!api().reissue();
        sendToTelegram(ok
            ? '🔁 <b>Перевыдача запущена (' + esc(displayName) + ')</b>\n🪪 ' + esc(last.name) + ' → ' + esc(nickOf(tid) || 'ID') + ' [ID: ' + esc(tid) + ']'
            : '❌ <b>Не удалось перевыдать (' + esc(displayName) + ')</b>', false, null);
        return ok;
    }

    // ── Кнопки под сообщением игрока ────────────────────────────
    // Верх — те же кнопки, что под сообщением сотрудника фракции (Ответить / Движения / Пауза / Авторизация / Управление),
    // низ — «Выдача лицензии». По нажатию кнопки заменяются на: [Перевыдать, если этому игроку уже выдавали] + типы лицензий + «Назад».
    function licOpenRow(id) { return [btn('🪪 Выдача лицензии', PFX + 'open|' + id + '|' + uniqueId, 'primary')]; }

    // Какую лицензию просит игрок — по словам в его сообщении (регистр и «ё» не важны)
    const LIC_WORD = {
        1: /(^|[^а-я])права(ми|х|м)?(?![а-я])|водительск|водит\.?\s*удост|удостоверен/,
        2: /проф[а-я.]*\s*(?:прав|удост|вод)|профессиональн/,
        3: /оруж|(^|[^а-я])ствол/,
        4: /рыбал|рыболов/,
        5: /охот(?:[ауые]|ой)(?![а-я])|охотнич/
    };
    const LIC_ANY = /лиценз|лицух|лицк|(^|[^а-я])лиц(?![а-я])/;
    function normTxt(x) { return String(x).toLowerCase().replace(/ё/g, 'е'); }
    function detectTypes(text) {   // → номера типов (как поле type в types()): 1 права, 2 проф., 3 оружие, 4 рыбалка, 5 охота
        const t = normTxt(text);
        let out = [1, 2, 3, 4, 5].filter(function (k) { return LIC_WORD[k].test(t); });
        if (out.indexOf(2) !== -1) out = out.filter(function (k) { return k !== 1; });   // «проф права» — только проф., без обычных
        return out;
    }
    function isLicText(text) { return detectTypes(text).length > 0 || LIC_ANY.test(normTxt(text)); }
    // Кнопки «в одно нажатие» (до 3 штук) — сразу выдают то, что просит игрок
    function quickRows(id, text) {
        if (!ready()) return [];
        const all = types();
        return detectTypes(text).slice(0, 3).map(function (k) {
            const i = all.findIndex(function (t) { return Number(t.type) === k; });
            return i < 0 ? null : [btn('⚡ ' + all[i].name + ' — ' + money(all[i].price), PFX + 'qgive|' + id + '|' + i + '|' + uniqueId, 'success')];
        }).filter(Boolean);
    }
    function wrapRows(rows, id, text) {   // быстрые кнопки — сверху, «Выдача лицензии» — снизу
        return quickRows(id, text).concat(rows, ready() ? [licOpenRow(id)] : []);
    }
    function playerMarkup(id, text) {
        let rows = [];
        try { const m = getNotificationReplyMarkup(); rows = ((m && m.inline_keyboard) || []).map(function (r) { return r.slice(); }); } catch (e) {}
        return { inline_keyboard: wrapRows(rows, id, text || '') };
    }
    function licMenuMarkup(id) {
        const rows = [];
        const l = lastGive();
        if (l && String(l.targetId) === String(id)) rows.push([btn('🔁 Перевыдать: ' + l.name, PFX + 'pre|' + id + '|' + uniqueId, 'primary')]);
        types().forEach(function (t, i) { rows.push([btn(t.name + ' — ' + money(t.price), PFX + 'pgive|' + id + '|' + i + '|' + uniqueId)]); });
        rows.push([btn('⬅️ Назад', PFX + 'back|' + id + '|' + uniqueId)]);
        return { inline_keyboard: rows };
    }

    // ── «Ответ» под входящим SMS и звонком ──────────────────────
    // Кнопка «💬 Ответ ▾» раскрывается в «📍 Место» / «💰 Ценовая политика» (те же тексты, что у кнопки «Ответ» в игровом чате).
    //  • под SMS — ответ уходит SMS на номер отправителя (/sms <номер> <текст>, с разбиением и антифлудом из Code3);
    //  • под звонком — отвечаем на звонок (/p) и говорим текст прямо в разговоре (в SMS не пишем).
    // callback_data: lic|aro|<номер>|<s/c>|<uid> (раскрыть), lic|arb|<номер>|<s/c>|<uid> (свернуть),
    //                lic|ars|<номер>|<0 место / 1 цены>|<uid> (SMS), lic|arc|<номер>|<0/1>|<uid> (в звонке)
    const AR = PFX + 'ar';
    const CALL_CARD_BTN = false;   // true — вернуть «Ответ» ещё и на карточку входящего звонка (ответ /p + текст); по умолчанию кнопка только под репликами собеседника после ответа на звонок
    const _arMsgs = {};   // 'chatId:messageId' → { num, kind } — сообщения с кнопкой «Ответ» (переживают перерисовку клавиатуры)
    function arK(kind) { return kind === 'call' ? 'c' : kind === 'talk' ? 't' : 's'; }
    function arKind(k) { return k === 'c' ? 'call' : k === 't' ? 'talk' : 'sms'; }
    function arOpenRow(num, kind) { return [btn('💬 Ответ ▾', PFX + 'aro|' + num + '|' + arK(kind) + '|' + uniqueId, 'primary')]; }
    function arOptionRows(num, kind) {
        const act = kind === 'talk' ? 'art' : kind === 'call' ? 'arc' : 'ars';
        return [
            [btn('📍 Место', PFX + act + '|' + num + '|0|' + uniqueId, 'success'), btn('💰 Ценовая политика', PFX + act + '|' + num + '|1|' + uniqueId, 'success')],
            [btn('🔼 Закрыть', PFX + 'arb|' + num + '|' + arK(kind) + '|' + uniqueId)]
        ];
    }
    function arIsRow(r) { return r.some(function (b) { return b && typeof b.callback_data === 'string' && b.callback_data.indexOf(AR) === 0; }); }
    function arMarkup(cq, num, kind, open) {   // клавиатура сообщения без наших строк + свёрнутая/раскрытая «Ответ»
        let rows = [];
        try { rows = ((cq.message && cq.message.reply_markup && cq.message.reply_markup.inline_keyboard) || []).filter(function (r) { return !arIsRow(r); }); } catch (e) {}
        return { inline_keyboard: rows.concat(open ? arOptionRows(num, kind) : [arOpenRow(num, kind)]) };
    }
    const AR_FAIL = {
        no_call: 'Звонок уже завершён или сброшен — ответ не отправлен',
        busy: 'Ответ на звонок уже выполняется',
        timeout: 'Не удалось ответить на звонок (нет подтверждения от сервера)',
        not_ready: 'Помощник лицензёра недоступен'
    };

    // Что уже ушло в Telegram (последние сообщения): если Code.js сам прислал уведомление об этом звонке/SMS, дописываем кнопку к нему, а не шлём второе
    const _sent = [];
    let _ownSend = false;   // true, пока мы сами шлём уведомление (чтобы не принять его за чужое)
    function trackSent(message, replyMarkup, onMessageSent) {
        if (typeof message !== 'string' || _ownSend) return onMessageSent;
        const rec = { text: message, rows: ((replyMarkup && replyMarkup.inline_keyboard) || []).map(function (r) { return r.slice(); }), at: Date.now(), cid: null, mid: null };
        _sent.push(rec);
        while (_sent.length > 20) _sent.shift();
        return function (cid, mid) {
            rec.cid = cid; rec.mid = mid;
            if (typeof onMessageSent === 'function') onMessageSent(cid, mid);
        };
    }
    // Карточки звонков/SMS из модуля PHONE & OFFERS (Code2.js) уходят через tgApi('sendMessage'), а не через sendToTelegram:
    //  «📞 <b>Входящий звонок (ник)</b>\n👤 …\n📱 Номер: <code>N</code>» и «✉️ <b>SMS (ник)</b>\n👤 …  📱 <code>N</code>\n💬 …».
    // Дописываем к ним строку «Ответ» прямо при отправке (второе уведомление не шлём) и запоминаем, что карточка для номера есть.
    const CARD_CALL_RE = /^📞\s*<b>Входящий звонок[^\n]*<\/b>\n[\s\S]*?Номер:\s*<code>(\d+)<\/code>/;
    const CARD_SMS_RE = /^✉\uFE0F?\s*<b>SMS[^\n]*<\/b>\n[\s\S]*?📱\s*<code>(\d+)<\/code>/;
    const _cards = [];   // { num, kind, at } — карточки Code2, к которым «Ответ» уже дописан
    if (typeof tgApi === 'function' && !tgApi.__licApiWrapped) {
        const origApi = tgApi;
        const wrappedApi = function (method, payload, onSuccess, onError, retryCount) {
            try {
                if (method === 'sendMessage' && !retryCount && payload && typeof payload.text === 'string' && typeof payload.reply_markup === 'string' && ready()) {
                    const mc = CALL_CARD_BTN ? payload.text.match(CARD_CALL_RE) : null, ms = mc ? null : payload.text.match(CARD_SMS_RE);
                    if (mc || ms) {
                        const num = (mc || ms)[1], kind = mc ? 'call' : 'sms';
                        const kb = JSON.parse(payload.reply_markup);
                        if (kb && Array.isArray(kb.inline_keyboard) && !kb.inline_keyboard.some(arIsRow)) {
                            kb.inline_keyboard.push(arOpenRow(num, kind));
                            payload = Object.assign({}, payload, { reply_markup: JSON.stringify(kb) });
                            _cards.push({ num: num, kind: kind, at: Date.now() });
                            while (_cards.length > 20) _cards.shift();
                            const prevOk = onSuccess, chatId = payload.chat_id;
                            onSuccess = function (data) {
                                try { if (data && data.result) _arMsgs[chatId + ':' + data.result.message_id] = { num: num, kind: kind }; } catch (e) {}
                                if (typeof prevOk === 'function') prevOk(data);
                            };
                        }
                    }
                }
            } catch (e) { c3Dbg('[LIC] tgApi wrap error: ' + e.message); }
            return origApi.call(this, method, payload, onSuccess, onError, retryCount);
        };
        wrappedApi.__licApiWrapped = true;
        tgApi = wrappedApi;
    }
    function normNick(x) { return String(x).toLowerCase().replace(/ё/g, 'е').replace(/[_\s]+/g, ' ').trim(); }

    // Форматы строк чата (phone.pwn мода): «SMS: текст | Отправитель: Ник [т.123456]» и «Входящий звонок | Номер: 123456 | Вызывает Ник»
    const SMS_IN_RE = /^SMS:\s*([\s\S]*)\s*\|\s*Отправитель:\s*(.+?)\s*\[т\.(\d+)\]/;
    const CALL_IN_RE = /^Входящий звонок\s*\|\s*Номер:\s*(\d+)\s*\|\s*Вызывает\s+(.+)$/;
    function handleIncoming(cm) {   // true — это входящее SMS/звонок (дальше строку не разбираем)
        let kind = null, num = '', who = '', text = '';
        const sm = cm.match(SMS_IN_RE);
        if (sm) { kind = 'sms'; text = sm[1].trim(); who = sm[2].trim(); num = sm[3]; }
        else {
            const cl = cm.match(CALL_IN_RE);
            if (cl) { kind = 'call'; num = cl[1]; who = cl[2].trim(); }
        }
        if (!kind) return false;
        if (kind === 'call' && !CALL_CARD_BTN) return true;   // под входящим звонком кнопки нет: «Ответ» появится под репликами собеседника, когда вы ответите
        if (/^(оператор|банк)$/i.test(who)) return true;   // служебные SMS оператора связи / банка — без кнопки
        if (kind === 'sms' && config.sobesNotifications && /набор/i.test(text)) return true;   // «набор» ловит модуль SOBESED (как в Code2)
        if (!ready()) return true;                   // не лицензёр — авто-ответ не нужен
        if (!once('in|' + kind + '|' + num + '|' + text, 3000)) return true;
        // небольшая пауза: Code.js (если он шлёт своё уведомление) успевает отправить его раньше нас
        setTimeout(function () {
            try { deliverIncoming(kind, num, who, text); } catch (e) { c3Dbg('[LIC] incoming error: ' + e.message); }
        }, 1800);
        return true;
    }
    function deliverIncoming(kind, num, who, text) {
        if (!ready()) return;
        const now0 = Date.now();
        if (_cards.some(function (c) { return c.num === num && c.kind === kind && now0 - c.at < 15000; })) return;   // «Ответ» уже дописан к карточке Code2
        const now = Date.now(), numRe = new RegExp('(^|\\D)' + num + '(\\D|$)'), nk = normNick(who);
        const kindRe = kind === 'call' ? /звон|вызов/i : /sms|смс/i;
        let found = null;
        for (let i = _sent.length - 1; i >= 0 && !found; i--) {
            const r = _sent[i];
            if (!r.mid || now - r.at > 8000 || PLAYER_TG_RE.test(r.text)) continue;   // ещё не отправлено / старое / сообщение игрока
            if (numRe.test(r.text) || (nk && normNick(r.text).indexOf(nk) !== -1 && kindRe.test(r.text))) found = r;
        }
        if (found) {   // дописываем кнопку к уведомлению Code.js
            _arMsgs[found.cid + ':' + found.mid] = { num: num, kind: kind };
            editMessageReplyMarkup(found.cid, found.mid, { inline_keyboard: found.rows.filter(function (r) { return !arIsRow(r); }).concat([arOpenRow(num, kind)]) });
            return;
        }
        const head = kind === 'call' ? '📞 <b>Входящий звонок</b>' : '📩 <b>' + esc(text) + '</b>';
        _ownSend = true;
        try {
            sendToTelegram(head + '\n👤 ' + esc(who) + ' · т.' + esc(num) + (kind === 'sms' ? ' · SMS' : '') + '\n(' + esc(displayName) + ')', false,
                { inline_keyboard: [arOpenRow(num, kind)] },
                function (cid, mid) { _arMsgs[cid + ':' + mid] = { num: num, kind: kind }; });
        } finally { _ownSend = false; }
    }

    // ── Реплики собеседника в разговоре (после ответа на звонок) → Telegram с кнопкой «Ответ» ──
    // Формат строки чата (phone.pwn): «[Тел] Ник: текст». Пересылаем только реплики того, с кем идёт разговор
    // (свои реплики и «[Тел]» чужих звонков рядом игнорируем).
    const CALL_TALK_RE = /^\[Тел\]\s*(.+?):\s+([\s\S]+)$/;
    function handleCallTalk(cm) {
        const tm = cm.match(CALL_TALK_RE);
        if (!tm) return false;
        let act = null;
        try { act = api().callActive && api().callActive(); } catch (e) {}
        if (!act || normNick(tm[1]) !== normNick(act.who)) return false;   // не наш собеседник
        const who = tm[1].trim(), text = tm[2].trim(), num = act.num || '';
        if (!text) return true;
        if (!once('talk|' + num + '|' + text, 1500)) return true;   // дубль строки чата
        _ownSend = true;
        try {
            sendToTelegram('📞 <b>' + esc(text) + '</b>\n👤 ' + esc(who) + (num ? ' · т.' + esc(num) : '') + ' · в разговоре\n(' + esc(displayName) + ')', false,
                { inline_keyboard: [arOpenRow(num, 'talk')] },
                function (cid, mid) { _arMsgs[cid + ':' + mid] = { num: num, kind: 'talk' }; });
        } finally { _ownSend = false; }
        return true;
    }

    // ── Нажатия кнопок ──────────────────────────────────────────
    function parse(data) {   // lic|action|a|b|uid → {action, args, uid}
        const p = data.split('|');
        return { action: p[1], args: p.slice(2, -1), uid: p[p.length - 1] };
    }
    function msgText(cq) {   // текст игрока из Telegram-сообщения «💬 текст / 👤 ник [ID: n]»
        const m = ((cq.message && cq.message.text) || '').match(PLAYER_TG_RE);
        return m ? m[1] : '';
    }
    function handleCallback(cq) {
        if (!ready()) { sendToTelegram(notReadyText(), false, null); return; }   // скин сменили / звание не Лицензёр — кнопки неактивны
        const d = parse(cq.data), chatId = cq.message.chat.id, messageId = cq.message.message_id;
        answerCallbackQuery(cq.id);
        switch (d.action) {
            case 'menu':   showMenu(chatId, messageId, d.uid); break;
            case 'toggle':
                config.licAllMessages = !config.licAllMessages;
                c3Dbg('[LIC] Все сообщения игроков: ' + (config.licAllMessages ? 'ВКЛ' : 'ВЫКЛ'));
                showMenu(chatId, messageId, d.uid);
                break;
            case 'filter':
                config.licFilter = !config.licFilter;
                c3Dbg('[LIC] Фильтр «только про лицензии»: ' + (config.licFilter ? 'ВКЛ' : 'ВЫКЛ'));
                showMenu(chatId, messageId, d.uid);
                break;
            case 'circle': {   // «Круговое меню» — как пункт игрового меню лицензёра
                const r = api().toggleCircle();
                c3Dbg('[LIC] Круговое меню: ' + (r ? 'ВКЛ' : 'ВЫКЛ'));
                showMenu(chatId, messageId, d.uid);
                break;
            }
            case 'tea': {      // «Просьба о чае» — как пункт игрового меню лицензёра
                const r = api().toggleTea();
                c3Dbg('[LIC] Просьба о чае: ' + (r ? 'ВКЛ' : 'ВЫКЛ'));
                showMenu(chatId, messageId, d.uid);
                break;
            }
            // ── «Ответ» под входящим SMS / звонком: раскрыть, свернуть, отправить ──
            case 'aro': editMessageReplyMarkup(chatId, messageId, arMarkup(cq, d.args[0], arKind(d.args[1]), true)); break;
            case 'arb': editMessageReplyMarkup(chatId, messageId, arMarkup(cq, d.args[0], arKind(d.args[1]), false)); break;
            case 'ars': {   // под SMS: ответ SMS
                const num = d.args[0], kind = d.args[1] === '1' ? 'price' : 'place', label = kind === 'price' ? 'Ценовая политика' : 'Место';
                if (once('ars|' + num + '|' + kind, 4000)) {   // повторное нажатие в течение 4 с игнорируем
                    const sent = api().smsReply(num, kind);
                    sendToTelegram(sent
                        ? '✅ <b>Ответ отправлен SMS (' + esc(displayName) + ')</b>\n📱 т.' + esc(num) + ' · ' + label + '\n💬 ' + esc(sent)
                        : '❌ <b>Не удалось отправить ответ (' + esc(displayName) + ')</b>', true, null);
                }
                editMessageReplyMarkup(chatId, messageId, arMarkup(cq, num, 'sms', false));   // как в игре: после отправки выбор сворачивается
                break;
            }
            case 'arc': {   // под звонком: /p и текст в разговоре
                const num = d.args[0], kind = d.args[1] === '1' ? 'price' : 'place', label = kind === 'price' ? 'Ценовая политика' : 'Место';
                if (once('arc|' + num + '|' + kind, 4000)) {
                    api().callReply(num, kind, function (r) {
                        sendToTelegram(r && r.ok
                            ? '✅ <b>Ответил на звонок (' + esc(displayName) + ')</b>\n📱 т.' + esc(num) + ' · ' + label + '\n🗣 ' + esc(r.text)
                            : '❌ <b>' + esc(AR_FAIL[r && r.reason] || 'Не удалось ответить на звонок') + ' (' + esc(displayName) + ')</b>\n📱 т.' + esc(num), true, null);
                    });
                }
                editMessageReplyMarkup(chatId, messageId, arMarkup(cq, num, 'call', false));
                break;
            }
            case 'art': {   // под репликой собеседника в разговоре: текст сразу в звонок (без /p)
                const num = d.args[0], kind = d.args[1] === '1' ? 'price' : 'place', label = kind === 'price' ? 'Ценовая политика' : 'Место';
                if (once('art|' + num + '|' + kind, 4000)) {
                    api().callSay(num, kind, function (r) {
                        sendToTelegram(r && r.ok
                            ? '✅ <b>Ответил в разговоре (' + esc(displayName) + ')</b>\n📱 ' + (num ? 'т.' + esc(num) + ' · ' : '') + label + '\n🗣 ' + esc(r.text)
                            : '❌ <b>' + esc(AR_FAIL[r && r.reason] || 'Не удалось ответить в разговоре') + ' (' + esc(displayName) + ')</b>' + (num ? '\n📱 т.' + esc(num) : ''), true, null);
                    });
                }
                editMessageReplyMarkup(chatId, messageId, arMarkup(cq, num, 'talk', false));
                break;
            }
            case 'types':
                if (!ready()) { sendToTelegram(notReadyText(), false, null); break; }
                showTypes(chatId, messageId, d.uid);
                break;
            case 'to':   // из пересланного сообщения игрока
                if (!ready()) { sendToTelegram(notReadyText(), false, null); break; }
                sendToTelegram('🪪 <b>Выдача лицензии — ' + esc(displayName) + '</b>\n👤 Игрок: ID <code>' + esc(d.args[0]) + '</code>\nКакую лицензию выдать?', false, {
                    inline_keyboard: types().map(function (t, i) {
                        return [btn(t.name + ' — ' + money(t.price), PFX + 'give|' + d.args[0] + '|' + i + '|' + d.uid)];
                    }).concat([[btn('✖️ Закрыть', PFX + 'close|' + d.uid)]])
                });
                break;
            case 'pick': {   // тип выбран → просим ID ответом на сообщение
                const idx = parseInt(d.args[0], 10), t = types()[idx];
                if (!t) break;
                sendToTelegram('🪪 <b>' + esc(t.name) + ' — ' + money(t.price) + '</b>\nОтветьте на это сообщение ID игрока.\n' +
                    '🔑 ' + PROMPT_MARK + d.uid + ' | тип ' + idx, false, { force_reply: true });
                break;
            }
            case 'give': {
                const r = doGive(d.args[0], parseInt(d.args[1], 10));
                if (r) deleteMessage(chatId, messageId);
                break;
            }
            case 'reissue':
                if (!ready()) { sendToTelegram(notReadyText(), false, null); break; }
                sendToTelegram(api().reissue() ? '🔁 <b>Перевыдача запущена (' + esc(displayName) + ')</b>' : '❌ <b>Нет данных для перевыдачи (' + esc(displayName) + ')</b>', false, null);
                break;
            case 're':   // кнопка «Перевыдать» под событием выдачи: только если это всё ещё последняя цель
                reissueFor(d.args[0]);
                break;
            // ── Кнопка «Выдача лицензии» под сообщением игрока: клавиатура меняется на месте (сообщение не удаляется) ──
            case 'open':
                if (!ready()) { sendToTelegram(notReadyText(), false, null); break; }
                editMessageReplyMarkup(chatId, messageId, licMenuMarkup(d.args[0]));
                break;
            case 'back':
                editMessageReplyMarkup(chatId, messageId, playerMarkup(d.args[0], msgText(cq)));
                break;
            case 'pgive':
                if (doGive(d.args[0], parseInt(d.args[1], 10))) editMessageReplyMarkup(chatId, messageId, playerMarkup(d.args[0], msgText(cq)));
                break;
            case 'pre':
                if (reissueFor(d.args[0])) editMessageReplyMarkup(chatId, messageId, playerMarkup(d.args[0], msgText(cq)));
                break;
            case 'qgive':   // выдача в одно нажатие: клавиатура не меняется; повторное нажатие в течение 4 с игнорируем
                if (once('qg|' + d.args[0] + '|' + d.args[1], 4000)) doGive(d.args[0], parseInt(d.args[1], 10));
                break;
            case 'close': deleteMessage(chatId, messageId); break;
        }
    }

    // ── Кнопка в «Функции» (строка перед «Вернуться назад») ─────
    if (typeof showFunctionsMenu === 'function' && !showFunctionsMenu.__licPatched) {
        const origShow = showFunctionsMenu;
        const patched = function () {
            const origEdit = editMessageReplyMarkup;
            editMessageReplyMarkup = function (chatId, messageId, markup) {
                try {
                    if (ready() && markup && Array.isArray(markup.inline_keyboard)) {
                        const rows = markup.inline_keyboard;
                        rows.splice(Math.max(0, rows.length - 1), 0,
                            [btn('🪪 Лицензёр ' + (config.licAllMessages ? '🟢' : '🔴'), PFX + 'menu|' + uniqueId)]);
                    }
                } catch (e) {}
                return origEdit.apply(this, arguments);
            };
            try { return origShow.apply(this, arguments); }
            finally { editMessageReplyMarkup = origEdit; }
        };
        patched.__licPatched = true;
        showFunctionsMenu = patched;
    }

    // ── Кнопка лицензии переживает перерисовку клавиатуры ───────
    // Code.js после «Пауза», «Авторизация», «Назад из движений» перерисовывает клавиатуру через getNotificationReplyMarkup() —
    // для сообщений игроков дописываем обратно строку «Выдача лицензии».
    const _playerMsgs = {};   // 'chatId:messageId' → { id: ID игрока, text: его сообщение }
    const PLAYER_TG_RE = /^(?:💬|🏛\uFE0F?)\s*([\s\S]*?)\n👤[^\n]*?\[ID:\s*(\d+)\]/;   // 💬 — игрок (наш пересыл), 🏛️ — сотрудник фракции (пересыл Code.js)
    if (typeof editMessageReplyMarkup === 'function' && !editMessageReplyMarkup.__licWrapped) {
        const origEditMarkup = editMessageReplyMarkup;
        const wrappedEdit = function (chatId, messageId, markup) {
            try {
                const ent = _playerMsgs[chatId + ':' + messageId];
                if (ent && markup && Array.isArray(markup.inline_keyboard) && ready()) {
                    const rows = markup.inline_keyboard;
                    const has = function (prefix) {
                        return rows.some(function (r) { return r.some(function (b) { return b && typeof b.callback_data === 'string' && b.callback_data.indexOf(prefix) === 0; }); });
                    };
                    if (has('admin_reply_') && !has(PFX + 'open|')) markup = { inline_keyboard: wrapRows(rows, ent.id, ent.text) };
                }
                const ar = _arMsgs[chatId + ':' + messageId];   // уведомление о SMS/звонке: «Ответ» не пропадает после «Пауза» / «Движения» и т.п.
                if (ar && markup && Array.isArray(markup.inline_keyboard) && ready() && !markup.inline_keyboard.some(arIsRow)) {
                    markup = { inline_keyboard: markup.inline_keyboard.concat([arOpenRow(ar.num, ar.kind)]) };
                }
            } catch (e) {}
            return origEditMarkup.call(this, chatId, messageId, markup);
        };
        wrappedEdit.__licWrapped = true;
        editMessageReplyMarkup = wrappedEdit;
    }

    // ── processUpdates: свои кнопки + ответ с ID игрока ─────────
    const origProcess = processUpdates;
    processUpdates = function (updates) {
        const rest = [];
        for (const u of updates) {
            const cq = u.callback_query;
            try {   // сообщение игрока (💬 … 👤 Ник [ID: n]) — запоминаем, чтобы кнопка лицензии не пропадала после «Пауза» / «Движения» и т.п.
                if (cq && cq.message && typeof cq.message.text === 'string') {
                    const pm = cq.message.text.match(PLAYER_TG_RE);
                    if (pm) _playerMsgs[cq.message.chat.id + ':' + cq.message.message_id] = { id: pm[2], text: pm[1] };
                }
            } catch (e) {}
            if (cq && typeof cq.data === 'string' && cq.data.indexOf(PFX) === 0 && config.chatIds.includes(String(cq.message.chat.id))) {
                config.lastUpdateId = u.update_id;
                setSharedLastUpdateId(config.lastUpdateId);
                if (parse(cq.data).uid === uniqueId) {
                    try { handleCallback(cq); } catch (e) { c3Dbg('[LIC] callback error: ' + e.message); }
                }
                continue;
            }
            const m = u.message;
            if (m && m.reply_to_message && m.text && config.chatIds.includes(String(m.chat.id))) {
                const rt = m.reply_to_message.text || '';
                if (rt.indexOf(PROMPT_MARK + uniqueId) !== -1) {
                    config.lastUpdateId = u.update_id;
                    setSharedLastUpdateId(config.lastUpdateId);
                    const idm = m.text.trim().match(/^\d{1,5}$/);
                    const tm = rt.match(/\| тип (\d+)/);
                    if (!idm || !tm) {
                        sendToTelegram('❌ <b>Нужен числовой ID игрока (' + esc(displayName) + ')</b>', false, null);
                    } else {
                        try { doGive(idm[0], parseInt(tm[1], 10)); } catch (e) { c3Dbg('[LIC] give error: ' + e.message); }
                    }
                    continue;
                }
            }
            rest.push(u);
        }
        if (rest.length) origProcess(rest);
    };

    // ── Все сообщения игроков → Telegram ────────────────────────
    // Формат строки чата: «- текст {RRGGBB}({v:Ник})[ID]» (тот же, что разбирает проверка сообщений фракции),
    // но цвет ника любой, а не только цвет своей фракции.
    const PLAYER_MSG_RE = /^\s*-\s+(.+?)\s*(?:\{[0-9A-Fa-f]{6}\})?\s*\(\{v:([^}]+)\}\)\[(\d+)\]/;
    const _recent = {};
    function once(key, ms) {
        const now = Date.now();
        if (_recent[key] && now - _recent[key] < ms) return false;
        _recent[key] = now;
        return true;
    }
    function cleanMsg(s) {
        return String(s).replace(/\{btn:[^}]*\}/g, '').replace(/\{v:([^}]*)\}/g, '$1').replace(/\{[0-9A-Fa-f]{6}\}/g, '').replace(/\s+/g, ' ').trim();
    }
    function lastGive() { try { return (api() && api().last && api().last()) || null; } catch (e) { return null; } }
    function nickOf(id) {
        try {
            const lg = lastGive();   // ник, запомненный при /givelic (ответ сервера на /id)
            if (lg && lg.nickFresh && lg.rawNick && String(lg.targetId) === String(id)) return lg.rawNick;
            return null;
        } catch (e) { return null; }
    }
    function isTarget(id) { const l = lastGive(); return !!(l && String(l.targetId) === String(id)); }
    function reissueBtn(id) {
        const l = lastGive();
        return btn('🔁 Перевыдать: ' + (l ? l.name : 'лицензию'), PFX + 're|' + id + '|' + uniqueId, 'primary');
    }

    // Ответы сервера на нашу выдачу: пишем в Telegram (в течение EVENT_WINDOW после /givelic), независимо от переключателя.
    const EVENT_WINDOW = 3 * 60 * 1000;
    const EVENTS = [
        { re: /У человека есть неоплаченные штрафы/i,                    icon: '⚠️', title: 'Есть неоплаченные штрафы', redo: true },
        { re: /У покупателя наложен запрет на покупку лицензии на оружие/i, icon: '🚫', title: 'Запрет на покупку лицензии на оружие', redo: true },
        { re: /У покупателя недостаточно денег/i,                         icon: '💸', title: 'Недостаточно денег', redo: true },
        { re: /У покупателя уже есть этот тип лицензии/i,                 icon: 'ℹ️', title: 'Такая лицензия уже есть', redo: false },
        { re: /отказался от Вашего предложения/i,                         icon: '❌', title: 'Отказался от предложения', redo: true },
        { re: /^\*?\s*Игрок (?:находится )?слишком далеко/i,            icon: '📏', title: 'Игрок слишком далеко', redo: true },
        { re: /^\*?\s*Такого игрока нет/i,                                icon: '❓', title: 'Такого игрока нет', redo: false },
        { re: /^Вы выдали\s/i,                                            icon: '✅', title: 'Лицензия выдана', redo: false, silent: false }
    ];
    function handleEvent(text) {
        if (!ready()) return false;
        const l = lastGive();
        if (!l || !l.at || Date.now() - l.at > EVENT_WINDOW) return false;
        const ev = EVENTS.find(function (e) { return e.re.test(text); });
        if (!ev) return false;
        if (/^\s*-\s/.test(text) || PLAYER_MSG_RE.test(text)) return false;       // строки чата игроков — не события
        if (!once('ev|' + ev.title, 3000)) return true;
        const send = function () {
            const nick = nickOf(l.targetId);
            const rows = [];
            if (ev.redo) rows.push([reissueBtn(l.targetId)]);
            rows.push([btn('🪪 Выдать лицензию (ID ' + l.targetId + ')', PFX + 'to|' + l.targetId + '|' + uniqueId)]);
            sendToTelegram(ev.icon + ' <b>' + ev.title + '</b>\n🪪 ' + esc(l.name) + ' → ' + esc(nick || 'игрок') + ' [ID: ' + esc(l.targetId) + ']\n' +
                '<i>' + esc(text) + '</i>\n(' + esc(displayName) + ')', !!ev.silent, { inline_keyboard: rows });
        };
        try { const a = api(); if (a && typeof a.whenNick === 'function') a.whenNick(l.targetId, send); else send(); } catch (e) { send(); }   // ждём, пока ник цели определится (ответ сервера на /id)
        return true;
    }

    // «Просьба о чае» включена → когда игрок переводит нам деньги (/pay), пишем в Telegram.
    // Сервер шлёт строку «<Ник> передал Вам деньги <сумма> руб» цветом 3399FF (/pay в new.pwn).
    const TIP_RE = /^\s*(.+?)\s+передал(?:а)?\s+Вам\s+деньги\s+(\d+)\s*руб/i;
    function teaOn() {
        try { const a = api(); return !!(a && a.state && a.state().tea); } catch (e) { return false; }
    }
    function handleTip(text, colorArg) {
        if (!teaOn()) return false;
        if (/^\s*-\s/.test(text) || PLAYER_MSG_RE.test(text)) return false;   // строки чата игроков — не переводы
        if (!colorOk(colorArg, '3399FF')) return false;                           // системная строка, а не текст игрока
        const tm = text.match(TIP_RE);
        if (!tm) return false;
        const nick = tm[1].trim(), sum = parseInt(tm[2], 10);
        if (!sum || !once('tip|' + nick + '|' + sum, 3000)) return true;
        sendToTelegram('☕ <b>Вам перевели деньги: ' + money(sum) + '</b>\n👤 ' + esc(nick) + '\n(' + esc(displayName) + ')', true, null);
        return true;
    }

    function onChat(raw, colorArg) {
        if (!ready()) return;   // форма не правительственная или звание не Лицензёр — в Telegram ничего не пересылаем
        const msg = String(raw);
        const m = msg.match(PLAYER_MSG_RE);
        if (!m) {
            try { const cm = cleanMsg(msg); if (!handleIncoming(cm) && !handleCallTalk(cm) && !handleEvent(cm)) handleTip(cm, colorArg); } catch (e) { c3Dbg('[LIC] event error: ' + e.message); }
            return;
        }
        if (!config.licAllMessages) return;
        const radius = getChatRadius(colorArg);
        if (radius === CHAT_RADIUS.RADIO) return;                       // рацию обрабатывает свой модуль
        if (config.licNearOnly && radius !== CHAT_RADIUS.CLOSE) return; // только сообщения «рядом» (средний/дальний радиус не пересылаем)
        const text = m[1].replace(/\{[0-9A-Fa-f]{6}\}/g, '').trim(), nick = m[2], id = m[3];
        if (!text) return;
        const gs = _govSent[id];   // это сообщение сотрудника фракции уже ушло из Code.js (там же и кнопка лицензии) — второй раз не шлём
        if (gs && Date.now() - gs.at < 3000 && gs.t === govNorm(text)) return;
        if (config.licFilter && (radius !== CHAT_RADIUS.CLOSE || !isLicText(text))) return;   // «только про лицензии»: рядом (/givelic до 6 м) + ключевые слова
        if (config.accountInfo.nickname && nick === config.accountInfo.nickname) return;   // свои не пересылаем
        if (!once(nick + '|' + text, 2000)) return;                     // дубль строки чата
        const where = radius === CHAT_RADIUS.CLOSE ? '🔈 рядом' : radius === CHAT_RADIUS.MEDIUM ? '🔉 средний' : radius === CHAT_RADIUS.FAR ? '🔊 далеко' : '💬';
        const markup = playerMarkup(id, text);                              // как у сотрудников фракции + внизу «Выдача лицензии» (там же перевыдача)
        sendToTelegram('💬 <b>' + esc(text) + '</b>\n👤 ' + esc(nick) + ' [ID: ' + esc(id) + ']' + (isTarget(id) ? ' 🪪' : '') + ' · ' + where + '\n(' + esc(displayName) + ')', false, markup,
            function (cid, mid) { _playerMsgs[cid + ':' + mid] = { id: id, text: text }; });   // запоминаем сообщение: кнопки переживут «Пауза» / «Движения»
    }
    function installChatHook() {
        const cur = window.OnChatAddMessage;
        if (typeof cur === 'function' && !cur.__licWrapped) {
            const wrapped = function (e, colorArg, t) {
                cur.call(this, e, colorArg, t);
                try { onChat(String(e), colorArg); } catch (err) { c3Dbg('[LIC] chat error: ' + err.message); }
            };
            wrapped.__licWrapped = true;
            window.OnChatAddMessage = wrapped;
            c3Dbg('[LIC] ✅ Хук OnChatAddMessage установлен');
        }
    }
    installChatHook();
    if (typeof initializeChatMonitor === 'function' && !initializeChatMonitor.__licPatched) {
        const origInit = initializeChatMonitor;
        const patchedInit = function () {
            const res = origInit.apply(this, arguments);
            installChatHook();
            return res;
        };
        patchedInit.__licPatched = true;
        initializeChatMonitor = patchedInit;
    }

    // ── Сообщения сотрудников фракции (их шлёт Code.js) ─────────
    // Code.js отправляет «🏛️ текст / 👤 Ник [ID] / Сообщение от сотрудника [фракция]» через sendToTelegram. Перехватываем отправку:
    // дописываем под сообщением «Выдача лицензии» (как у сообщений игроков) и запоминаем, что оно уже ушло, —
    // тогда «Все сообщения игроков» не пришлёт то же самое второй раз. Code.js не меняется.
    const GOV_OUT_RE = /^🏛\uFE0F?\s*<b>([\s\S]*?)<\/b>\n👤[^\n]*?\[ID:\s*(\d+)\]\nСообщение от сотрудника \[/;
    const _govSent = {};   // ID отправителя → { t: нормализованный текст, at: время }
    function govNorm(x) { return String(x).replace(/\{[0-9A-Fa-f]{6}\}/g, '').replace(/\s+/g, ' ').trim(); }
    if (typeof sendToTelegram === 'function' && !sendToTelegram.__licGovWrapped) {
        const origSend = sendToTelegram;
        const wrappedSend = function (message, silent, replyMarkup, onMessageSent) {
            try { onMessageSent = trackSent(message, replyMarkup, onMessageSent); } catch (e) { c3Dbg('[LIC] track send error: ' + e.message); }
            try {
                const gm = (typeof message === 'string') ? message.match(GOV_OUT_RE) : null;
                if (gm) {
                    const gid = gm[2], gtext = govNorm(gm[1]);
                    _govSent[gid] = { t: gtext, at: Date.now() };
                    if (ready()) {
                        const rows = ((replyMarkup && replyMarkup.inline_keyboard) || []).map(function (r) { return r.slice(); });
                        replyMarkup = { inline_keyboard: wrapRows(rows, gid, gtext) };
                        const prevCb = onMessageSent;
                        onMessageSent = function (cid, mid) {
                            _playerMsgs[cid + ':' + mid] = { id: gid, text: gtext };   // кнопки переживут «Пауза» / «Движения»
                            if (typeof prevCb === 'function') prevCb(cid, mid);
                        };
                    }
                }
            } catch (e) { c3Dbg('[LIC] gov send error: ' + e.message); }
            return origSend.call(this, message, silent, replyMarkup, onMessageSent);
        };
        wrappedSend.__licGovWrapped = true;
        sendToTelegram = wrappedSend;
    }

    c3Dbg('[LIC] Вкладка «Лицензёр» загружена. Все сообщения игроков: ' + (config.licAllMessages ? 'ВКЛ' : 'ВЫКЛ'));
})(); } catch (e) { try { console.error('[CODE3] ошибка Telegram-вкладки «Лицензёр»:', e); } catch (e2) {} }
// END LICENSOR TG MODULE //

// ╔══════════════════════════════════════════════════════════════════════╗
// ║  MODULE: TAB TEST (тестовый блок) — /tab                             ║
// ║  Открывает окно PlayersOnline, читает ПОЛНЫЙ список игроков и шлёт   ║
// ║  его в Telegram, а потом честно пишет, что получилось:               ║
// ║   • «Список» — получен ли список (и полный ли он);                   ║
// ║   • «Telegram» — сколько сообщений ушло и сколько подтвердил ТГ.     ║
// ║  Итог — в панели поверх окна, в GameText и в консоли «[CODE3][TAB]»; ║
// ║  если список получить не удалось — причина уходит и в Telegram.      ║
// ║                                                                      ║
// ║  Закрытие с телефона: пока открыт PlayersOnline (как бы его ни       ║
// ║  открыли), поверх него висит большая кнопка ✕ (+ кнопка «В ТГ»).     ║
// ║  Также: /tab ещё раз — закрыть, /tab close — закрыть.                ║
// ║                                                                      ║
// ║  Как это устроено: игра сама зовёт window.onUpdatePlayersList(данные)║
// ║  после engine.trigger('UpdatePlayersList') (window.updatePlayerList).║
// ║  Окно рисует только видимые строки (виртуальный скролл), поэтому     ║
// ║  читаем данные из хука, а не из DOM. DOM — только запасной вариант.  ║
// ║                                                                      ║
// ║  Команды: /tab · /tab quiet · /tab tg · /tab raw · /tab hide|show ·  ║
// ║  /tab close. raw — сырой ответ движка (почему в списке только мы).   ║
// ║  (алиасы: /таб, /ефи). quiet — прочитать список БЕЗ открытия окна.   ║
// ║                                                                      ║
// ║  Сверка ID: когда Code3 узнаёт ID по нику через серверный /id, список║
// ║  игроков сверяется с ответом сервера (окно не открывается). Совпало →║
// ║  сообщение в Telegram; не совпало → предупреждение в Telegram.       ║
// ║  Свежесть: пока окно открыто, игра сама обновляет список раз в 3 с;  ║
// ║  закрыто — список запрашивается по требованию (AUTO_REFRESH_S — фон).║
// ║  Отладка: __code3tab.run() · .close() · .last() · .state()           ║
// ║  Настройки: CODE3_OPTS = { TAB: { CLOSE_POS: 'tl', ... } }, ключи в O║
// ╚══════════════════════════════════════════════════════════════════════╝
// START TAB TEST MODULE //
try { (function () {
'use strict';

if (typeof window.__code3TabCleanup === 'function') { try { window.__code3TabCleanup(); } catch (e) {} }
var TVER = 'tab-test v1.2';
var dead = false, undo = [], MYID = String(Date.now()) + '_' + Math.random();
function onUndo(fn) { undo.push(fn); }
window.__code3TabCleanup = function () {
    dead = true;
    while (undo.length) { try { undo.pop()(); } catch (e) {} }
    window.__code3TabCleanup = null;
};

// Логи под /code3 не скрываются: первый аргумент начинается с «[CODE3]»
function tlog(m) { try { console.log('[CODE3][TAB] ' + m); } catch (e) {} }
function every(fn, ms) {
    var id = setInterval(function () { if (dead) return; try { fn(); } catch (e) { tlog('ошибка: ' + (e && e.message || e)); } }, ms);
    onUndo(function () { clearInterval(id); });
    return id;
}
function later(fn, ms) {
    var id = setTimeout(function () { if (dead) return; try { fn(); } catch (e) { tlog('ошибка: ' + (e && e.message || e)); } }, ms);
    onUndo(function () { clearTimeout(id); });
    return id;
}

// ══════════════════════════ НАСТРОЙКИ ══════════════════════════
var O = (function () {
    var o = {
        OPEN_UI: true,        // /tab открывает окно PlayersOnline (false — читать список, не открывая окно)
        CLOSE_POS: 'tr',      // угол кнопок ✕ / «В ТГ»: 'tr' · 'tl' · 'br' · 'bl'
        AUTO_CLOSE_S: 0,      // >0 — через столько секунд после итога закрыть окно само
        WAIT_LIST_MS: 8000,   // сколько ждать список от движка
        WAIT_TG_MS: 15000,    // сколько ждать подтверждения Telegram после последней отправки
        TG_CHUNK: 3500,       // размер части списка в символах (лимит Telegram 4096)
        TG_MAX_MSGS: 15,      // не больше стольких сообщений со списком за раз
        TG_GAP_MS: 1200,      // пауза между сообщениями (у Telegram лимит ~1 сообщение/сек в чат)
        TG_SILENT_PARTS: true,// части списка — без звука (со звуком только заголовок)
        XCHECK: true,         // сверять ID, найденный через /id, со списком игроков
        XCHECK_MAX_AGE_MS: 3000, // список моложе этого возраста считается свежим; старше — запрашиваем заново
        XCHECK_WAIT_MS: 2500, // сколько ждать свежий список для сверки
        XCHECK_TG_MISS: false,// true — писать в Telegram и когда игрока нет в списке / список не получен (по умолчанию только в консоль)
        MERGE: true,          // во время /tab копить игроков из всех ответов движка и объединять (если список приходит кусками)
        RETRY_MS: 4000,       // если список неполный (игроков меньше, чем «онлайн») — перезапрашивать у движка столько мс, потом отдать что есть
        AUTO_REFRESH_S: 0     // >0 — запрашивать список в фоне каждые N с, пока окно закрыто (открытое окно обновляется само раз в 3 с)
    };
    try { var g = window.CODE3_OPTS && window.CODE3_OPTS.TAB; if (g) for (var k in g) o[k] = g[k]; } catch (e) {}
    try {
        var u = window.USER_CONFIGS && window.USER_CONFIGS[window.CURRENT_USER];
        var uo = u && u.CODE3 && u.CODE3.TAB;
        if (uo) for (var k2 in uo) o[k2] = uo[k2];
    } catch (e) {}
    return o;
})();

// ══════════════════════════ ОБЩЕЕ ══════════════════════════
var UI_NAME = 'PlayersOnline';
function iface(name) { try { return (window.interface && window.interface(name)) || null; } catch (e) { return null; } }
function isOpen() { try { return !!window.getInterfaceStatus(UI_NAME); } catch (e) { return false; } }
function esc(s) { return String(s === undefined || s === null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function padL(s, n) { s = String(s); while (s.length < n) s = ' ' + s; return s; }
function padR(s, n) { s = String(s); while (s.length < n) s += ' '; return s; }
function p2(n) { return (n < 10 ? '0' : '') + n; }
function stamp(t) { var d = new Date(t); return p2(d.getDate()) + '.' + p2(d.getMonth() + 1) + '.' + d.getFullYear() + ' ' + p2(d.getHours()) + ':' + p2(d.getMinutes()) + ':' + p2(d.getSeconds()); }
function nick() { try { return (typeof displayName !== 'undefined' && displayName) ? String(displayName) : ''; } catch (e) { return ''; } }
function tgFn() { try { return (typeof sendToTelegram === 'function') ? sendToTelegram : null; } catch (e) { return null; } }

// GameText-уведомление (низ экрана), как gtAdd выше: ~g~ ~r~ ~y~ ~w~ — цвета
function toast(text, ms) {
    try {
        var gt = iface('GameText');
        if (gt && typeof gt.add === 'function') gt.add(JSON.stringify([3, text, ms || 4000, 0, 0, true, false, 2.0]));
    } catch (e) {}
}

// ══════════════════════════ ДАННЫЕ ОТ ДВИЖКА ══════════════════════════
// Формат (по PlayersOnline.js): { count, serverName, local:{id,name,level,ping,...}, players:[{id,name,level,ping,mobile,admin,vip,muted,color}] }
// count — без нас самих (игра показывает count + 1), local — это мы; в players нас может не быть.
var snap = null;   // последний полученный снимок: { at, src:'engine', serverName, online, list:[...] }
var hookInfo = { installed: false, calls: 0, lastAt: 0, lastErr: '' };

function rec(p, me) {
    return {
        id: Number(p.id) || 0,
        name: String(p.name === undefined || p.name === null ? '' : p.name),
        level: Number(p.level) || 0,
        ping: Number(p.ping) || 0,
        mobile: !!(p.mobile && Number(p.mobile) !== 0),
        admin: !!Number(p.admin),
        vip: !!Number(p.vip),
        muted: !!Number(p.muted),
        me: !!me
    };
}
function toObj(x) { if (typeof x === 'string') { try { return JSON.parse(x); } catch (e) { return null; } } return x; }
// Где в ответе движка лежат игроки. Игра ждёт players:[...], но на всякий случай понимаем и другие виды:
// объект-словарь {id: {...}}, ключи list/playerList/..., вложенность в data, JSON-строку вместо массива.
function pickPlayers(e) {
    var keys = ['players', 'list', 'playerList', 'playersList', 'onlinePlayers'];
    var srcs = [e];
    var dd = toObj(e.data); if (dd && typeof dd === 'object') srcs.push(dd);
    for (var s = 0; s < srcs.length; s++) {
        for (var k = 0; k < keys.length; k++) {
            var v = toObj(srcs[s][keys[k]]);
            if (Array.isArray(v)) return { arr: v, key: (s ? 'data.' : '') + keys[k], src: srcs[s] };
            if (v && typeof v === 'object') {
                var vals = [];
                for (var q in v) {
                    if (!Object.prototype.hasOwnProperty.call(v, q)) continue;
                    var it = v[q];
                    if (!it || typeof it !== 'object') continue;
                    if (it.id === undefined || it.id === null) { var c = {}; for (var z in it) c[z] = it[z]; c.id = q; it = c; }
                    vals.push(it);
                }
                return { arr: vals, key: (s ? 'data.' : '') + keys[k] + '(объект)', src: srcs[s] };
            }
        }
    }
    return null;
}
function parseEngine(e) {
    e = toObj(e);
    if (!e || typeof e !== 'object') return null;
    var pk = pickPlayers(e);
    if (!pk) return null;
    var list = [], seen = {};
    var loc = toObj(pk.src.local); if (!loc || typeof loc !== 'object') loc = toObj(e.local);
    var hasLoc = !!(loc && typeof loc === 'object' && loc.id !== undefined && loc.id !== null);
    if (hasLoc) { list.push(rec(loc, true)); seen[String(loc.id)] = 1; }
    for (var i = 0; i < pk.arr.length; i++) {
        var p = pk.arr[i];
        if (!p || typeof p !== 'object') continue;
        if (p.id !== undefined && p.id !== null) {      // без id не склеиваем (раньше все такие строки схлопывались в одну)
            var key = String(p.id);
            if (seen[key]) continue;
            seen[key] = 1;
        }
        list.push(rec(p, false));
    }
    var cnt = (pk.src.count !== undefined && pk.src.count !== null) ? Number(pk.src.count) : pk.arr.length;
    var sn = pk.src.serverName;
    return {
        at: Date.now(), src: 'engine',
        serverName: String(sn === undefined || sn === null ? '' : sn),
        online: (isNaN(cnt) ? pk.arr.length : cnt) + 1,
        list: list,
        meta: { key: pk.key, rawPlayers: pk.arr.length, count: pk.src.count, hasLocal: hasLoc, merged: 0 }
    };
}

// ── Сырой ответ движка: что именно пришло (чтобы видеть, ПОЧЕМУ в списке только мы) ──
var rawLast = null, rawObjLast = null, rawHist = [];
function noteRaw(e, obj) {
    var d = { at: Date.now(), type: typeof e, keys: '', count: undefined, playersLen: '—', sample: '', local: '' };
    try {
        if (typeof e === 'string') d.bytes = e.length;
        if (obj && typeof obj === 'object') {
            d.keys = Object.keys(obj).join(',');
            d.count = obj.count;
            var pl = toObj(obj.players);
            if (Array.isArray(pl)) { d.playersLen = pl.length; d.sample = JSON.stringify(pl.slice(0, 2)).slice(0, 500); }
            else if (pl && typeof pl === 'object') { d.playersLen = 'объект:' + Object.keys(pl).length; d.sample = JSON.stringify(pl).slice(0, 500); }
            else if (obj.players !== undefined) d.playersLen = typeof obj.players;
            d.local = JSON.stringify(obj.local).slice(0, 300);
        }
    } catch (x) {}
    var prev = rawHist.length ? rawHist[rawHist.length - 1] : null;
    rawLast = d; rawObjLast = obj;
    rawHist.push(d); if (rawHist.length > 8) rawHist.shift();
    // в консоль — только первый ответ и каждое изменение размера списка (иначе спам каждые 3 с)
    if (!prev || prev.playersLen !== d.playersLen || prev.count !== d.count) tlog('движок прислал: ' + rawLine(d));
}
function rawLine(d) {
    d = d || rawLast; if (!d) return 'ответов от движка ещё не было';
    return 'тип ' + d.type + ' · ключи [' + d.keys + '] · count ' + d.count + ' · players ' + d.playersLen + ' · вызовов хука ' + hookInfo.calls;
}

function onEngineList(e) {
    hookInfo.calls++; hookInfo.lastAt = Date.now();
    var obj = toObj(e);
    noteRaw(e, obj);
    var s = parseEngine(obj);
    if (!s) { hookInfo.lastErr = 'неожиданный формат данных: ' + typeof e + (obj && typeof obj === 'object' ? ' · ключи [' + Object.keys(obj).join(',') + ']' : ''); return; }
    hookInfo.lastErr = '';
    snap = s;
    // во время /tab копим игроков из всех ответов движка (если движок отдаёт список кусками — соберём целиком)
    var r = RUN;
    if (r && r.active && O.MERGE) {
        r.calls = (r.calls || 0) + 1;
        if (!r.acc) r.acc = {};
        for (var i = 0; i < s.list.length; i++) { var q = s.list[i]; r.acc[q.me ? 'me' : String(q.id) + '|' + q.name] = q; }
        r.maxOnline = Math.max(r.maxOnline || 0, s.online);
    }
    flushWaiters();
}
// Итоговый снимок запуска: последний ответ, а если ответов было несколько и список неполный — объединение всех
function mergedSnap(r) {
    var s = snap;
    if (!O.MERGE || !r || !r.acc || (r.calls || 0) < 2) return s;
    var list = [];
    for (var k in r.acc) if (Object.prototype.hasOwnProperty.call(r.acc, k)) list.push(r.acc[k]);
    if (list.length <= s.list.length) return s;
    var m = { at: s.at, src: 'engine', serverName: s.serverName, online: Math.max(s.online, r.maxOnline || 0), list: list, meta: {} };
    for (var z in s.meta) m.meta[z] = s.meta[z];
    m.meta.merged = r.calls;
    return m;
}
var waiters = [], lastReqAt = 0;
function flushWaiters() {
    var w = waiters; waiters = [];
    for (var i = 0; i < w.length; i++) { if (w[i].done) continue; w[i].done = true; try { w[i].cb(snap, 'fresh'); } catch (e) { tlog('ошибка сверки: ' + (e && e.message || e)); } }
}
// cb(снимок|null, 'cache'|'fresh'|'timeout'): список без открытия окна. Не чаще одного запроса к движку в 1.2 с.
function refresh(maxAge, cb) {
    var now = Date.now();
    if (snap && snap.src === 'engine' && now - snap.at <= maxAge) { cb(snap, 'cache'); return; }
    var w = { cb: cb, done: false };
    waiters.push(w);
    if (now - lastReqAt >= 1200) { lastReqAt = now; requestList(); }
    later(function () { if (w.done) return; w.done = true; cb(snap && snap.src === 'engine' ? snap : null, 'timeout'); }, O.XCHECK_WAIT_MS);
}

// Игра присваивает window.onUpdatePlayersList один раз и зовёт его по имени — оборачиваем. Если кто-то переприсвоил — ставим заново.
function installHook() {
    var cur = window.onUpdatePlayersList;
    if (typeof cur !== 'function') { hookInfo.installed = false; return false; }
    if (cur.__c3tab === MYID) { hookInfo.installed = true; return true; }
    var prev = cur;
    var mine = function (e) {
        if (!dead) { try { onEngineList(e); } catch (x) { hookInfo.lastErr = String(x && x.message || x); } }
        return prev.apply(this, arguments);
    };
    mine.__c3tab = MYID;
    window.onUpdatePlayersList = mine;
    onUndo(function () { if (window.onUpdatePlayersList === mine) window.onUpdatePlayersList = prev; });
    hookInfo.installed = true;
    tlog('хук onUpdatePlayersList установлен');
    return true;
}

function requestList() {
    try {
        if (typeof window.updatePlayerList === 'function') { window.updatePlayerList(); return true; }
    } catch (e) {}
    return false;
}

// Запасной вариант: читаем то, что нарисовано в окне. Окно рисует только видимые строки (виртуальный скролл) — список НЕПОЛНЫЙ.
function scrapeDom() {
    var P = '.players-online__content__table__players__player';
    var rows = document.querySelectorAll(P);
    if (!rows || !rows.length) return null;
    var list = [];
    for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        var t = function (sel) { var n = r.querySelector(sel); return n ? String(n.textContent || '').trim() : ''; };
        var id = t(P + '__item_id'), name = t(P + '__item_name ' + P + '__item__text');
        if (!id && !name) continue;
        list.push({ id: Number(id) || 0, name: name, level: Number(t(P + '__item_level')) || 0, ping: Number(t(P + '__item_ping')) || 0, mobile: false, admin: false, vip: false, muted: false, me: false });
    }
    if (!list.length) return null;
    var cntEl = document.querySelector('.players-online__content__header__info__players__count');
    var srvEl = document.querySelector('.players-online__content__header__info__server__number');
    return { at: Date.now(), src: 'dom', serverName: srvEl ? String(srvEl.textContent || '').trim() : '', online: cntEl ? (Number(String(cntEl.textContent).replace(/\D/g, '')) || list.length) : list.length, list: list };
}

// ══════════════════════════ TELEGRAM ══════════════════════════
function fmtRow(p) {
    return padL(p.id, 4) + ' ' + padR(p.name, 24) + ' ' + padL(p.level, 3) + ' ' + padL(p.ping, 4) + ' ' + (p.mobile ? '📱' : '💻') + (p.admin ? '👑' : '') + (p.vip ? '💎' : '') + (p.muted ? '🔇' : '') + (p.me ? ' ←я' : '');
}
function buildOk(s, complete) {
    var rows = s.list.slice().sort(function (a, b) { return a.id - b.id; }).map(fmtRow);
    var parts = [], cur = '';
    for (var i = 0; i < rows.length; i++) {
        if (cur && cur.length + rows[i].length + 1 > O.TG_CHUNK) { parts.push(cur); cur = ''; }
        cur += (cur ? '\n' : '') + rows[i];
    }
    if (cur) parts.push(cur);
    var cut = 0;
    if (parts.length > O.TG_MAX_MSGS) { cut = parts.length - O.TG_MAX_MSGS; parts = parts.slice(0, O.TG_MAX_MSGS); }
    var got = s.list.length, dn = nick();
    var sentRows = 0;
    for (var q = 0; q < parts.length; q++) sentRows += parts[q].split('\n').length;
    var head = '📋 <b>/tab — список игроков</b>' + (dn ? ' (' + esc(dn) + ')' : '') + '\n' +
        '🌐 Сервер: ' + esc(s.serverName || '—') + '\n' +
        '👥 Онлайн: <b>' + s.online + '</b> · получено: <b>' + got + '</b> ' + (got >= s.online ? '✅' : '⚠️') + '\n' +
        '🔎 Источник: ' + (s.src === 'engine' ? 'движок (полный список)' : 'окно (только видимые строки — неполный)') + '\n' +
        '🕒 ' + stamp(s.at) + '\n' +
        '📨 Частей со списком: ' + parts.length + (cut ? ' (ещё ' + cut + ' не отправлено: лимит TG_MAX_MSGS)' : '') + '\n' +
        'ID · Ник · Ур. · Пинг · 📱моб/💻пк · 👑адм 💎vip 🔇мут';
    if (s.src === 'engine' && !complete) {
        head += '\n\n🧪 <b>Список неполный — что прислал движок</b>\n' + esc(rawLine()) +
            (s.meta ? '\nplayers в ответе: ' + s.meta.rawPlayers + ' · найден в: ' + esc(s.meta.key) + ' · local: ' + (s.meta.hasLocal ? 'есть' : 'нет') : '') +
            (rawLast && rawLast.sample ? '\nобразец players: <code>' + esc(rawLast.sample.slice(0, 300)) + '</code>' : '\nplayers пустой — движок/сервер не прислал ни одного игрока кроме нас (это не ошибка разбора в Code3)') +
            '\nПодробнее: /tab raw';
    }
    var msgs = [{ text: head, silent: false }];
    for (var j = 0; j < parts.length; j++) {
        msgs.push({ text: '<b>Часть ' + (j + 1) + '/' + parts.length + '</b>\n<pre>' + esc(parts[j]) + '</pre>', silent: !!O.TG_SILENT_PARTS });
    }
    msgs.rowsSent = sentRows; msgs.rowsAll = got;
    return msgs;
}
function buildFail(why, diag) {
    var dn = nick();
    return [{ text: '❌ <b>/tab — не удалось получить список игроков</b>' + (dn ? ' (' + esc(dn) + ')' : '') + '\n' +
        'Причина: ' + esc(why) + '\n' + esc(diag) + '\n🕒 ' + stamp(Date.now()), silent: false }];
}

// Отправляет сообщения по одному с паузой. Сообщение «подтверждено», когда сработал onMessageSent (его зовёт Code.js после ответа Telegram).
function tgSend(msgs, onChange) {
    var job = { rowsSent: msgs.rowsSent, rowsAll: msgs.rowsAll, total: msgs.length, sent: 0, ok: 0, soft: 0, err: 0, done: false, lastErr: '', lastSendAt: 0, items: [], unavailable: false };
    var send = tgFn();
    if (!send) { job.unavailable = true; job.done = true; onChange(job); return job; }
    var i = 0;
    function mark(it, st, why) {
        if (it.st === 'ok' || it.st === 'err') return;       // итог уже есть
        if (it.st === 'soft' && st === 'soft') return;
        if (it.st === 'soft') job.soft--;
        it.st = st;
        if (st === 'ok') job.ok++; else if (st === 'soft') job.soft++; else { job.err++; job.lastErr = why || ''; }
        onChange(job);
    }
    function next() {
        if (dead) return;
        if (i >= msgs.length) { waitDone(); return; }
        var m = msgs[i++], it = { st: '' };
        job.items.push(it);
        var s = tgFn();
        try {
            var ret = s(m.text, m.silent, null, function () { mark(it, 'ok'); });
            job.sent++; job.lastSendAt = Date.now();
            if (ret && typeof ret.then === 'function') {
                ret.then(function (res) { mark(it, res === false ? 'err' : 'soft', res === false ? 'sendToTelegram вернул false' : ''); },
                         function (er) { mark(it, 'err', String(er && er.message || er)); });
            }
        } catch (e) { job.sent++; mark(it, 'err', String(e && e.message || e)); }
        onChange(job);
        later(next, O.TG_GAP_MS);
    }
    function waitDone() {
        var t0 = Date.now();
        (function chk() {
            if (dead) return;
            var settled = job.ok + job.err >= job.total;
            if (settled || Date.now() - t0 >= O.WAIT_TG_MS) { job.done = true; onChange(job); return; }
            later(chk, 300);
        })();
    }
    next();
    return job;
}
function tgLine(job) {
    if (job.unavailable) return { t: 'Telegram: ❌ недоступен (sendToTelegram не найден — Code3 запущен без Code.js?)', c: 'err' };
    var base = 'Telegram: ';
    if (!job.done) return { t: base + '⏳ ' + job.sent + '/' + job.total + ' отправлено, подтверждено ' + job.ok, c: 'wait' };
    if (job.err) return { t: base + '❌ ошибка отправки (' + job.err + ' из ' + job.total + ')' + (job.lastErr ? ': ' + job.lastErr : '') + (job.ok ? ' · подтверждено ' + job.ok : ''), c: 'err' };
    var cutNote = (job.rowsAll && job.rowsSent < job.rowsAll) ? ' · ⚠️ игроков в ТГ: ' + job.rowsSent + ' из ' + job.rowsAll + ' (лимит TG_MAX_MSGS)' : '';
    if (job.ok >= job.total) return { t: base + '✅ сохранено ' + job.ok + '/' + job.total + cutNote, c: cutNote ? 'warn' : 'ok' };
    if (job.ok > 0) return { t: base + '⚠️ подтверждено ' + job.ok + ' из ' + job.total, c: 'warn' };
    return { t: base + '⚠️ отправлено ' + job.sent + '/' + job.total + ', подтверждения от Telegram нет', c: 'warn' };
}

// ══════════════════════════ СВЕРКА ID: /id ↔ СПИСОК ИГРОКОВ ══════════════════════════
// Вызывается из resolveId (первый модуль) сразу после ответа сервера на «/id <ник>». Сервер остаётся источником истины,
// список — вторая пара глаз: ID в SA-MP переиспользуются, и совпадение двух независимых источников — хорошая страховка.
function nrm(x) {
    return String(x === undefined || x === null ? '' : x).replace(/^\s*(?:\[\d{1,2}:\d{2}(?::\d{2})?\]\s*)?(?:\d+\s*[.)]\s*)?/, '').trim().split(' ').join('_').toLowerCase();
}
function devIcon(p) { return p.mobile ? '📱' : '💻'; }
var xcSeen = {};
function crossCheck(nickRaw, id, srvName) {
    if (dead || !O.XCHECK) return;
    var sid = String(id), want = nrm(srvName || nickRaw);
    if (!want || !/^\d+$/.test(sid)) return;
    var key = want + '|' + sid, now = Date.now();
    if (xcSeen[key] && now - xcSeen[key] < 20000) return;   // та же пара — не спамим
    xcSeen[key] = now;
    refresh(O.XCHECK_MAX_AGE_MS, function (s, how) {
        var shown = String(srvName || nickRaw).replace(/^\s*(?:\[\d{1,2}:\d{2}(?::\d{2})?\]\s*)?(?:\d+\s*[.)]\s*)?/, '').trim();
        var dn = nick();
        if (!s || (how === 'timeout' && Date.now() - s.at > O.XCHECK_MAX_AGE_MS * 3)) {
            tlog('сверка ID: ' + shown + ' → ' + sid + ' — список не получен (' + how + '), сверить нечем');
            if (O.XCHECK_TG_MISS) tgOnce('ℹ️ <b>Сверка ID: список игроков не получен</b>' + (dn ? ' (' + esc(dn) + ')' : '') + '\n👤 <code>' + esc(shown) + '</code> → ID <code>' + esc(sid) + '</code> (только /id)', true);
            return;
        }
        var byId = null, byNick = [];
        for (var i = 0; i < s.list.length; i++) {
            var p = s.list[i];
            if (String(p.id) === sid) byId = p;
            if (nrm(p.name) === want) byNick.push(p);
        }
        var age = Math.round((Date.now() - s.at) / 100) / 10;
        if (byId && nrm(byId.name) === want) {
            tlog('сверка ID: ✅ ' + shown + ' → ' + sid + ' — /id и список совпали (возраст списка ' + age + ' с, ' + how + ')');
            tgOnce('🔎 <b>Сверка ID: /id и /tab совпали ✅</b>' + (dn ? ' (' + esc(dn) + ')' : '') + '\n👤 <code>' + esc(shown) + '</code> → ID <code>' + esc(sid) + '</code>\n' +
                '📊 ур. ' + byId.level + ' · пинг ' + byId.ping + ' · ' + devIcon(byId) + '\n🕒 ' + stamp(Date.now()) + ' · список ' + age + ' с назад', true);
            return;
        }
        if (byNick.length || byId) {
            var tabSays = byNick.length ? 'ник у ID ' + byNick.map(function (q) { return q.id; }).join(', ') : 'такого ника нет';
            var idSays = byId ? 'ID ' + sid + ' у «' + byId.name + '»' : 'ID ' + sid + ' в списке нет';
            tlog('сверка ID: ⚠️ НЕ СОВПАЛО: /id: ' + shown + ' → ' + sid + ' · список: ' + tabSays + '; ' + idSays);
            tgOnce('⚠️ <b>Сверка ID: /id и /tab НЕ совпали</b>' + (dn ? ' (' + esc(dn) + ')' : '') + '\n' +
                '🖥 /id: <code>' + esc(shown) + '</code> → ID <code>' + esc(sid) + '</code>\n' +
                '📋 /tab: ' + esc(tabSays) + '; ' + esc(idSays) + '\n' +
                'Возможно, игрок только что зашёл/вышел или ID переиспользован — список мог устареть (' + age + ' с).', false);
            return;
        }
        tlog('сверка ID: ' + shown + ' → ' + sid + ' — в списке игроков не найден (ни ник, ни ID); список ' + age + ' с');
        if (O.XCHECK_TG_MISS) tgOnce('ℹ️ <b>Сверка ID: игрока нет в списке</b>' + (dn ? ' (' + esc(dn) + ')' : '') + '\n👤 <code>' + esc(shown) + '</code> → ID <code>' + esc(sid) + '</code> (только /id)', true);
    });
}
function tgOnce(text, silent) {
    var send = tgFn();
    if (!send) { tlog('Telegram недоступен — сверка только в консоли'); return false; }
    try { send(text, !!silent, null); return true; } catch (e) { tlog('Telegram: ' + (e && e.message || e)); return false; }
}

// ══════════════════════════ ПАНЕЛЬ (✕ / В ТГ / статус) ══════════════════════════
var UI = { el: null, bar: null, bTg: null, bX: null, bHide: null, abs: false };
var hidden = false;            // окно списка скрыто (visibility:hidden), панель остаётся
var LINES = [];                 // [{t, c}] — строки статуса
var lastTap = 0;
var STYLE_ID = 'code3-tab-style';

function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent =
        '#c3tab-ui{position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;z-index:2147483000;font-family:"Open Sans",Arial,sans-serif}' +
        '#c3tab-ui.c3tab-abs{position:absolute;width:100%;height:100%}' +
        '#c3tab-ui .c3tab-btns{position:absolute;display:flex;align-items:center;gap:1.4vh;pointer-events:none}' +
        '#c3tab-ui.c3tab-tr .c3tab-btns{top:2vh;right:2vh;flex-direction:row-reverse}' +
        '#c3tab-ui.c3tab-tl .c3tab-btns{top:2vh;left:2vh}' +
        '#c3tab-ui.c3tab-br .c3tab-btns{bottom:2vh;right:2vh;flex-direction:row-reverse}' +
        '#c3tab-ui.c3tab-bl .c3tab-btns{bottom:2vh;left:2vh}' +
        '#c3tab-ui .c3tab-b{pointer-events:auto;box-sizing:border-box;height:8.4vh;min-width:8.4vh;padding:0 2.4vh;border-radius:4.2vh;' +
            'background:rgba(18,18,18,.92);border:.3vh solid rgba(255,255,255,.65);color:#fff;font-weight:700;font-size:2.8vh;' +
            'display:flex;align-items:center;justify-content:center;position:relative;cursor:pointer;' +
            'user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;touch-action:manipulation}' +
        '#c3tab-ui .c3tab-b:active{filter:brightness(1.7)}' +
        '#c3tab-ui.c3tab-nobtn .c3tab-btns{display:none}' +
        // скрытое окно: ничего не рисует и не ловит касания (игра под ним доступна), наша панель остаётся
        '.players-online.c3tab-hidden .players-online__wrapper{visibility:hidden!important;pointer-events:none!important}' +
        // крестик рисуем границами/полосками — без глифов (в шрифте игры их может не быть)
        '#c3tab-ui #c3tab-x{padding:0;width:8.4vh}' +
        '#c3tab-ui #c3tab-x:before,#c3tab-ui #c3tab-x:after{content:"";position:absolute;left:50%;top:50%;width:4vh;height:.6vh;margin:-.3vh 0 0 -2vh;background:#fff;border-radius:.3vh;transform:rotate(45deg)}' +
        '#c3tab-ui #c3tab-x:after{transform:rotate(-45deg)}' +
        '#c3tab-ui .c3tab-bar{position:absolute;max-width:62vw;box-sizing:border-box;padding:1.1vh 1.6vh;border-radius:1.2vh;background:rgba(0,0,0,.74);' +
            'color:#fff;font-size:2.2vh;line-height:1.4;pointer-events:none}' +
        '#c3tab-ui.c3tab-tr .c3tab-bar,#c3tab-ui.c3tab-br .c3tab-bar{left:2vh}' +
        '#c3tab-ui.c3tab-tl .c3tab-bar,#c3tab-ui.c3tab-bl .c3tab-bar{right:2vh}' +
        '#c3tab-ui.c3tab-tr .c3tab-bar,#c3tab-ui.c3tab-tl .c3tab-bar{bottom:2vh}' +
        '#c3tab-ui.c3tab-br .c3tab-bar,#c3tab-ui.c3tab-bl .c3tab-bar{top:2vh}' +
        '#c3tab-ui .c3tab-bar div{margin:.2vh 0}' +
        '#c3tab-ui .c3tab-bar .ok{color:#8dff9a}#c3tab-ui .c3tab-bar .err{color:#ff8a8a}#c3tab-ui .c3tab-bar .warn{color:#ffd37a}#c3tab-ui .c3tab-bar .wait{color:#cfd8ff}';
    (document.head || document.documentElement).appendChild(s);
    onUndo(function () { var n = document.getElementById(STYLE_ID); if (n && n.parentNode) n.parentNode.removeChild(n); });
}
function posCls() { var p = String(O.CLOSE_POS || 'tr').toLowerCase(); return (p === 'tl' || p === 'br' || p === 'bl') ? p : 'tr'; }
function applyCls() {
    if (!UI.el) return;
    var c = 'c3tab-' + posCls() + (UI.abs ? ' c3tab-abs' : '') + (isOpen() ? '' : ' c3tab-nobtn');   // окно закрыто (тихий режим) — кнопки не нужны, только статус
    if (UI.el.className !== c) UI.el.className = c;
}
function setMode(abs) { UI.abs = !!abs; applyCls(); }
function applyHidden() {
    var h = hostEl();
    if (h && h.classList) { if (hidden) h.classList.add('c3tab-hidden'); else h.classList.remove('c3tab-hidden'); }
    if (UI.bHide) UI.bHide.textContent = hidden ? 'Показать' : 'Скрыть';
}
function setHidden(v) { hidden = !!v; applyHidden(); tlog(hidden ? 'окно списка скрыто' : 'окно списка показано'); }

// Один тап = одно действие (touchend + click не должны срабатывать оба)
function tap(el, fn) {
    var h = function (ev) {
        try { ev.stopPropagation(); ev.preventDefault(); } catch (e) {}
        var n = Date.now();
        if (n - lastTap < 350) return;
        lastTap = n;
        try { fn(); } catch (e) { tlog('ошибка кнопки: ' + (e && e.message || e)); }
    };
    el.addEventListener('click', h);
    el.addEventListener('touchend', h);
}
function buildUi() {
    ensureStyle();
    var el = document.createElement('div'); el.id = 'c3tab-ui';
    var btns = document.createElement('div'); btns.className = 'c3tab-btns';
    var bX = document.createElement('div'); bX.id = 'c3tab-x'; bX.className = 'c3tab-b';
    var bTg = document.createElement('div'); bTg.id = 'c3tab-tg'; bTg.className = 'c3tab-b'; bTg.textContent = 'В ТГ';
    var bHide = document.createElement('div'); bHide.id = 'c3tab-hide'; bHide.className = 'c3tab-b'; bHide.textContent = 'Скрыть';
    var bar = document.createElement('div'); bar.className = 'c3tab-bar'; bar.style.display = 'none';
    tap(bX, function () { closeAll('кнопка ✕'); });
    tap(bTg, function () { run({ fromButton: true }); });
    tap(bHide, function () { setHidden(!hidden); });
    btns.appendChild(bX); btns.appendChild(bHide); btns.appendChild(bTg);
    el.appendChild(btns); el.appendChild(bar);
    UI.el = el; UI.bar = bar; UI.bTg = bTg; UI.bX = bX; UI.bHide = bHide;
    setMode(false);
    applyHidden();
    renderBar();
}
function removeUi() {
    if (UI.el && UI.el.parentNode) UI.el.parentNode.removeChild(UI.el);
    UI.el = UI.bar = UI.bTg = UI.bX = UI.bHide = null;
}
function renderBar() {
    if (!UI.bar) return;
    while (UI.bar.firstChild) UI.bar.removeChild(UI.bar.firstChild);
    for (var i = 0; i < LINES.length; i++) {
        var d = document.createElement('div'); d.className = LINES[i].c || ''; d.textContent = LINES[i].t;
        UI.bar.appendChild(d);
    }
    UI.bar.style.display = LINES.length ? 'block' : 'none';
    if (UI.bTg) UI.bTg.textContent = (RUN && RUN.active) ? '…' : 'В ТГ';
}
function setLines(arr) { LINES = arr.filter(function (x) { return !!x; }); renderBar(); }

// Держим панель над окном списка: внутри .players-online (там касания точно доходят — как у кнопок самого окна), иначе в body.
// Окно закрылось (✕, повторный TAB, игра) — панель убираем, когда закончилась работа.
function hostEl() { try { return document.querySelector('.players-online'); } catch (e) { return null; } }
function tick() {
    var open = isOpen(), now = Date.now();
    if (open) {
        if (!UI.el) buildUi();
        var host = hostEl();
        if (host) { if (UI.el.parentNode !== host) { host.appendChild(UI.el); setMode(true); } }
        else if (UI.el.parentNode !== document.body) { document.body.appendChild(UI.el); setMode(false); }
        applyCls(); applyHidden();
        return;
    }
    if (hidden) hidden = false;   // окно закрыли — при следующем открытии оно снова видно
    if (UI.el) {
        var keep = RUN && (RUN.active || (RUN.doneAt && now - RUN.doneAt < 7000));
        if (!keep) { removeUi(); if (!(RUN && RUN.active)) LINES = []; }
        else if (UI.el.parentNode !== document.body) { document.body.appendChild(UI.el); setMode(false); }
        applyCls();
    }
}

function closeAll(why) {
    var was = isOpen();
    if (was) { try { window.closeInterface(UI_NAME); } catch (e) {} }
    hidden = false;
    removeUi();
    tlog('закрыто: ' + why + (was ? ' (окно списка закрыто)' : ''));
    if (was) later(function () {
        if (isOpen()) { try { window.closeInterface(UI_NAME); } catch (e) {} tlog('окно не закрылось с первого раза — закрываю повторно'); }
    }, 400);
}

// ══════════════════════════ ЗАПУСК /tab ══════════════════════════
var RUN = null, runN = 0;

function openUi(r, quiet) {
    if (!O.OPEN_UI || quiet) { r.uiOpen = 'skip'; return; }
    if (isOpen()) { r.uiOpen = true; return; }
    // чат после отправки команды ещё закрывается — открываем чуть позже
    later(function () {
        try { window.openInterface(UI_NAME); } catch (e) { tlog('openInterface: ' + (e && e.message || e)); }
    }, 250);
    later(function () {
        if (isOpen()) { r.uiOpen = true; return; }
        try { window.openInterface(UI_NAME); } catch (e) {}
    }, 900);
    later(function () { r.uiOpen = isOpen(); if (!r.uiOpen) tlog('окно PlayersOnline не открылось'); }, 1700);
}

function diagText(r) {
    return 'Окно списка: ' + (r.uiOpen === 'skip' ? 'не открывалось (OPEN_UI=false)' : (isOpen() ? 'открыто' : 'не открылось')) +
        ' · updatePlayerList: ' + (typeof window.updatePlayerList === 'function' ? 'есть' : 'нет') +
        ' · хук: ' + (hookInfo.installed ? 'стоит' : 'не встал') + ', вызовов ' + hookInfo.calls +
        (hookInfo.lastErr ? ' · ' + hookInfo.lastErr : '') +
        ' · ' + rawLine() +
        (window.App && window.App.developmentMode ? ' · developmentMode (движок не отвечает)' : '');
}

function run(opt) {
    if (RUN && RUN.active) { tlog('уже идёт, подожди итог'); return false; }
    var r = RUN = { n: ++runN, t0: Date.now(), active: true, uiOpen: null, list: null, tg: null, doneAt: 0, lastReq: 0 };
    LINES = [{ t: 'Список: ⏳ запрашиваю у движка…', c: 'wait' }];
    installHook();
    openUi(r, !!(opt && opt.quiet));
    // мгновенно сделать ✕, не дожидаясь окна (если окно не откроется — панель всё равно покажет итог в body)
    if (!UI.el) { buildUi(); (hostEl() || document.body).appendChild(UI.el); setMode(!!hostEl()); }
    renderBar();
    tlog('запуск #' + r.n + (opt && opt.fromButton ? ' (кнопка «В ТГ»)' : '') + (opt && opt.quiet ? ' (тихо, без окна)' : '') + ' · updatePlayerList: ' + (typeof window.updatePlayerList === 'function' ? 'есть' : 'нет') + ' · хук: ' + (hookInfo.installed ? 'стоит' : 'не встал'));

    (function poll() {
        if (dead || !r.active) return;
        var now = Date.now();
        if (snap && snap.at >= r.t0 && snap.src === 'engine') {
            if (!r.firstAt) r.firstAt = now;
            var ms = mergedSnap(r);
            // полный список — сразу; неполный — ещё пару раз спрашиваем движок (RETRY_MS), потом отдаём что есть, но с пометкой
            if (ms.list.length >= ms.online || now - r.firstAt >= O.RETRY_MS) return gotList(r, ms);
        }
        if (now - r.lastReq >= 1000) { r.lastReq = now; requestList(); }
        if (now - r.t0 >= O.WAIT_LIST_MS && !(snap && snap.at >= r.t0 && snap.src === 'engine')) {
            var d = scrapeDom();
            if (d) { tlog('движок не ответил за ' + O.WAIT_LIST_MS + ' мс — беру то, что нарисовано в окне (неполный список)'); return gotList(r, d); }
            return failList(r, 'движок не прислал список за ' + (O.WAIT_LIST_MS / 1000) + ' с');
        }
        later(poll, 400);
    })();
    return true;
}

function gotList(r, s) {
    r.list = s;
    var complete = s.src === 'engine' && s.list.length >= s.online;
    var l1 = s.src === 'engine'
        ? { t: 'Список: ' + (complete ? '✅ ' : '⚠️ ') + s.list.length + ' из ' + s.online + ' игроков (движок' + (complete ? ', полный' : ', неполный') + (s.meta && s.meta.merged ? ', объединено ответов: ' + s.meta.merged : '') + ')', c: complete ? 'ok' : 'warn' }
        : { t: 'Список: ⚠️ ' + s.list.length + ' из ' + s.online + ' (только видимые строки окна — неполный)', c: 'warn' };
    tlog(l1.t + ' · сервер: ' + (s.serverName || '—'));
    setLines([l1, { t: 'Telegram: ⏳ готовлю отправку…', c: 'wait' }]);
    var msgs = buildOk(s, complete);
    r.tg = tgSend(msgs, function (job) {
        if (!r.active) return;
        setLines([l1, tgLine(job)]);
        if (job.done) finish(r, l1, tgLine(job));
    });
}
function failList(r, why) {
    var l1 = { t: 'Список: ❌ не получен — ' + why, c: 'err' };
    var diag = diagText(r);
    tlog(l1.t + ' · ' + diag);
    setLines([l1, { t: diag, c: 'warn' }, { t: 'Telegram: ⏳ отправляю отчёт об ошибке…', c: 'wait' }]);
    r.tg = tgSend(buildFail(why, diag), function (job) {
        if (!r.active) return;
        var tl = tgLine(job);
        setLines([l1, { t: diag, c: 'warn' }, tl]);
        if (job.done) finish(r, l1, tl);
    });
}
function finish(r, l1, tl) {
    if (!r.active) return;
    r.active = false; r.doneAt = Date.now();
    renderBar();
    tlog(tl.t);
    var okT = tl.c === 'ok';
    toast('~y~/tab: ~w~' + (r.list ? 'список ' + (l1.c === 'ok' ? '~g~' : '~y~') + r.list.list.length : '~r~список не получен') + ' ~w~· Telegram ' + (okT ? '~g~сохранено' : (tl.c === 'err' ? '~r~ошибка' : '~y~не подтверждено')), 5000);
    if (O.AUTO_CLOSE_S > 0) later(function () { if (isOpen()) closeAll('автозакрытие'); }, O.AUTO_CLOSE_S * 1000);
}

// /tab raw — сырой ответ движка (без окна): в консоль и в Telegram. Players урезаны до первых 3, чтобы влезло в сообщение.
function dumpRaw() {
    installHook();
    var t0 = Date.now();
    lastReqAt = t0; requestList();
    tlog('raw: запрашиваю у движка…');
    later(function () {
        var o = rawObjLast, shown = null;
        try {
            if (o && typeof o === 'object') {
                shown = {};
                for (var k in o) shown[k] = o[k];
                var pl = toObj(o.players);
                if (Array.isArray(pl)) shown.players = { length: pl.length, first3: pl.slice(0, 3) };
            }
        } catch (x) {}
        var js = ''; try { js = JSON.stringify(shown); } catch (x) { js = String(x); }
        if (js && js.length > 2500) js = js.slice(0, 2500) + '…';
        var fresh = !!(rawLast && rawLast.at >= t0);
        var hist = rawHist.map(function (d) { return stamp(d.at).slice(11) + ' players ' + d.playersLen + ' count ' + d.count; }).join('\n');
        tlog('raw: ' + (fresh ? 'свежий ответ' : 'свежего ответа нет, показываю последний') + ' · ' + rawLine());
        try { console.log('[CODE3][TAB] raw JSON (players урезан): ' + js); } catch (x) {}
        var dn = nick();
        tgOnce('🧪 <b>/tab raw — ответ движка</b>' + (dn ? ' (' + esc(dn) + ')' : '') + '\n' + (fresh ? '' : '⚠️ свежего ответа за 2 с нет — последний из памяти\n') +
            esc(rawLine()) + '\n<pre>' + esc(js || '—') + '</pre>\nИстория ответов (последние 8):\n<pre>' + esc(hist || '—') + '</pre>', false);
        toast('~y~/tab raw: ~w~' + (fresh ? 'ответ получен' : '~r~нет свежего ответа') + ' · players ' + (rawLast ? rawLast.playersLen : '—'), 4000);
    }, 2000);
}

// ══════════════════════════ КОМАНДА /tab ══════════════════════════
function onTabCmd(arg) {
    if (arg === 'close' || arg === 'off' || arg === 'x') { closeAll('/tab close'); return; }
    if (arg === 'tg') { run({}); return; }
    if (arg === 'raw' || arg === 'dump' || arg === 'сырое') { dumpRaw(); return; }
    if (arg === 'quiet' || arg === 'q' || arg === 'silent' || arg === 'тихо') { run({ quiet: true }); return; }
    if (arg === 'hide' || arg === 'скрыть') { if (isOpen()) setHidden(true); return; }
    if (arg === 'show' || arg === 'показать') { if (isOpen()) setHidden(false); return; }
    if (isOpen() && !(RUN && RUN.active)) { closeAll('/tab (повторно)'); return; }   // /tab как переключатель
    run({});
}
(function installChat() {
    var origWin = window.sendChatInputCustom, origVar = null;
    try { if (typeof sendChatInput === 'function') origVar = sendChatInput; } catch (e) {}
    var prev = origWin || origVar;
    var myChat = function (e) {
        if (!dead && typeof e === 'string') {
            var a = e.trim().split(/\s+/), cmd = (a[0] || '').toLowerCase();
            if (cmd === '/tab' || cmd === '/таб' || cmd === '/ефи') {
                try { onTabCmd((a[1] || '').toLowerCase()); } catch (x) { tlog('ошибка /tab: ' + (x && x.message || x)); }
                return;   // серверу не отправляем
            }
        }
        if (typeof prev === 'function') return prev.apply(this, arguments);
    };
    window.sendChatInputCustom = myChat;
    try { sendChatInput = myChat; } catch (e) {}
    onUndo(function () {
        if (window.sendChatInputCustom === myChat) window.sendChatInputCustom = origWin;
        try { if (sendChatInput === myChat) sendChatInput = origVar || origWin; } catch (e) {}
    });
})();

// ══════════════════════════ СТАРТ ══════════════════════════
installHook();
every(installHook, 3000);   // страховка: если кто-то переприсвоил window.onUpdatePlayersList
every(tick, 250);
if (O.AUTO_REFRESH_S > 0) every(function () { if (!isOpen()) { lastReqAt = Date.now(); requestList(); } }, Math.max(2, O.AUTO_REFRESH_S) * 1000);   // открытое окно обновляется само раз в 3 с
onUndo(function () { removeUi(); });

var api = {
    version: TVER,
    opts: O,
    run: function () { return run({}); },
    close: function () { closeAll('api'); },
    last: function () { return snap; },
    scrape: scrapeDom,
    raw: dumpRaw,                     // сырой ответ движка → консоль + Telegram
    hist: function () { return rawHist; },
    refresh: refresh,                 // refresh(maxAgeMs, cb(снимок, 'cache'|'fresh'|'timeout')) — список без окна
    crossCheck: crossCheck,           // crossCheck(ник, id, ник_от_сервера) — сверка с ответом /id
    find: function (q) { if (!snap) return []; var w = nrm(q), n = /^\d+$/.test(String(q)); return snap.list.filter(function (p) { return n ? String(p.id) === String(q) : nrm(p.name) === w; }); },
    state: function () { return { version: TVER, open: isOpen(), hook: hookInfo, snap: snap ? { src: snap.src, got: snap.list.length, online: snap.online, ageMs: Date.now() - snap.at, meta: snap.meta } : null, raw: rawLast, run: RUN ? { n: RUN.n, active: RUN.active, uiOpen: RUN.uiOpen } : null, tg: !!tgFn() }; }
};
window.__code3tab = api;
onUndo(function () { if (window.__code3tab === api) window.__code3tab = null; });
tlog(TVER + ' загружен. /tab — открыть список и отправить в Telegram, ✕ — закрыть, /tab raw — сырой ответ движка.');

})(); } catch (e) { try { console.error('[CODE3] ошибка блока TAB TEST:', e); } catch (e2) {} }
// END TAB TEST MODULE //
