// ╔══════════════════════════════════════════════════════════════════════╗
// ║  Ozv.js — ОЗВУЧКА событий для HassleB                               ║
// ║  Работает рядом с Code.js / Code2.js / Code3.js (грузится Load.js    ║
// ║  тем же способом, что и Code3: текст подклеивается к Code2 и         ║
// ║  eval'ится в области видимости Code.js).                             ║
// ║                                                                      ║
// ║  Что есть:                                                           ║
// ║   • когда пишет АДМИНИСТРАТОР — в игре звучит mp3 с GitHub:          ║
// ║     HassleB/Озвучка/Администратор.mp3  (репозиторий BensonZahar/Hud.js)║
// ║                                                                      ║
// ║  Как ловит администратора (два независимых входа, звук играет один   ║
// ║  раз — второй вход отсекается по паузе COOLDOWN_MS):                 ║
// ║   1) перехват sendAdminSpamAlert из Code.js — ровно то же условие,   ║
// ║      по которому в Telegram уходит «🚨 Обнаружен администратор!»     ║
// ║   2) свой разбор строк чата через Hud.$refs.chat.add (видит каждое   ║
// ║      сообщение, как главный перехват Code3) — работает, даже если    ║
// ║      Code.js строку пропустил                                        ║
// ║                                                                      ║
// ║  Что считается «пишет администратор» (как в Code.js):                 ║
// ║   • личное сообщение  «Администратор X[ID] для МойНик[ID]:» (FF9945) ║
// ║   • «[Уведомление от администратора] Администратор X[ID]: …»         ║
// ║   • админ-чат «[A] … ((…))» вне рации                                ║
// ║   • рация [A] (в Code.js — тихое уведомление) и «подбросил Вас» —    ║
// ║     по умолчанию БЕЗ звука, включаются в OPTS ниже                   ║
// ║                                                                      ║
// ║  Воспроизведение: window.playSound(url, …) — родной звук игры        ║
// ║  (движок, как у такси/UI; принимает http-ссылки). Если его нет или   ║
// ║  он упал — запасной вариант через HTMLAudio (mp3 → blob).            ║
// ║                                                                      ║
// ║  Команды в игровом чате (на сервер не уходят):                       ║
// ║   /ozv — проверка (проиграть + статус) · /ozv on · /ozv off          ║
// ║   /ozv engine · /ozv html · /ozv auto — способ воспроизведения       ║
// ║   /ozv uved — эталонный звук из старой версии (проверка движка)      ║
// ║   /ozv slot 8 — другой канал звука · /ozv status — только статус     ║
// ║  Консоль: __ozv.test() · __ozv.status() · __ozv.play()               ║
// ║                                                                      ║
// ║  Настройки (необязательно): window.OZV_OPTS = { ... } или            ║
// ║  USER_CONFIGS[<пользователь>].OZV = { ... } в List.js.               ║
// ╚══════════════════════════════════════════════════════════════════════╝
try { (function () {

// ── Повторная загрузка: сначала снимаем всё, что поставил прошлый запуск ──
if (typeof window.__ozvCleanup === 'function') { try { window.__ozvCleanup(); } catch (e) {} }

var VERSION = 'ozv v1.1';
var GEN = (window.__ozvGen = (window.__ozvGen || 0) + 1);   // номер запуска: метка на чате, чтобы не вешать обёртку дважды
var _dead = false;          // true после cleanup — «старые» обёртки становятся прозрачными
var _undo = [];
function onUndo(fn) { _undo.push(fn); }
window.__ozvCleanup = function () {
    _dead = true;
    while (_undo.length) { try { _undo.pop()(); } catch (e) {} }
    window.__ozvCleanup = null;
};

function log() { try { console.log.apply(console, ['[OZV]'].concat([].slice.call(arguments))); } catch (e) {} }
function warn() { try { console.warn.apply(console, ['[OZV]'].concat([].slice.call(arguments))); } catch (e) {} }

// ══════════════════════════ НАСТРОЙКИ ══════════════════════════
var OPTS = (function () {
    var o = {
        ENABLED: true,            // главный выключатель (переключается командой /ozv on|off, запоминается)
        REPO_OWNER: 'BensonZahar',
        REPO_NAME: 'Hud.js',
        BRANCH: 'main',
        FILE_ADMIN: 'HassleB/Озвучка/Администратор.mp3',   // путь к файлу в репозитории
        ENGINE: 'auto',           // 'auto' — родной playSound игры, если есть; 'engine' — только он; 'html' — только HTMLAudio
        VOLUME: 0,                // 0 — громкость игры (globalVolume), как в старой версии Code.js (там playSound(url, false, 1.0) → слот 1, громкость по умолчанию). >0 — своя громкость, например 1.5
        SLOT: 1,                  // канал звука движка. Слот 1 — тот, что точно работал в старой версии. Слоты 0–9 игра использует и для UI (клики), поэтому клик может оборвать звук; пробуйте /ozv slot 8
        COOLDOWN_MS: 4000,        // не чаще одного раза за это время (админ часто шлёт несколько строк подряд)
        SOUND_PRIVATE: true,      // личное сообщение от администратора
        SOUND_NOTICE: true,       // «[Уведомление от администратора] …»
        SOUND_ADMIN_CHAT: true,   // админ-чат «[A] … ((…))» вне рации
        SOUND_RADIO: false,       // [A] в рации (Code.js для него тоже без спама)
        SOUND_PODBROS: false,     // «Администратор X[ID] подбросил Вас»
        SOUND_BOT_ALERT: true,    // вход №1: любой вызов sendAdminSpamAlert из Code.js
        PRELOAD: true,            // один раз скачать mp3 после старта: проверка доступности + готовый blob для запасного варианта
        DEBUG: false
    };
    try { var g = window.OZV_OPTS; if (g) for (var k in g) o[k] = g[k]; } catch (e) {}
    try {
        var u = window.USER_CONFIGS && window.USER_CONFIGS[window.CURRENT_USER];
        var uo = u && u.OZV;
        if (uo) for (var k2 in uo) o[k2] = uo[k2];
    } catch (e) {}
    return o;
})();
function dbg() { if (!OPTS.DEBUG) return; try { console.log.apply(console, ['[OZV][dbg]'].concat([].slice.call(arguments))); } catch (e) {} }

// ── Запоминаем выбор пользователя (/ozv on|off, /ozv engine|html|auto) ──
var LS_ON = 'hassle_ozv_enabled', LS_MODE = 'hassle_ozv_engine', LS_SLOT = 'hassle_ozv_slot';
function lsGet(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { window.localStorage.setItem(k, v); } catch (e) {} }
(function () {
    var on = lsGet(LS_ON);
    if (on === '0') OPTS.ENABLED = false; else if (on === '1') OPTS.ENABLED = true;
    var md = lsGet(LS_MODE);
    if (md === 'engine' || md === 'html' || md === 'auto') OPTS.ENGINE = md;
    var sl = parseInt(lsGet(LS_SLOT), 10);
    if (!isNaN(sl) && sl >= 0 && sl <= 60) OPTS.SLOT = sl;
})();

// ══════════════════════════ ССЫЛКА НА ФАЙЛ ══════════════════════════
// Путь содержит кириллицу — кодируем каждую часть отдельно (слэши остаются слэшами)
function rawUrl(path) {
    var segs = String(path).split('/').map(function (s) {
        return encodeURIComponent(s.normalize ? s.normalize('NFC') : s);
    });
    return 'https://raw.githubusercontent.com/' + OPTS.REPO_OWNER + '/' + OPTS.REPO_NAME + '/' + OPTS.BRANCH + '/' + segs.join('/');
}
var SOUNDS = { admin: function () { return rawUrl(OPTS.FILE_ADMIN); } };
function soundUrl(key) { var f = SOUNDS[key]; return f ? f() : null; }

// ══════════════════════════ ВОСПРОИЗВЕДЕНИЕ ══════════════════════════
var _blobUrl = null, _blobBusy = false, _blobWaiters = [], _blobFailedAt = 0, _blobSize = 0;

// mp3 → blob (XHR, как Load.js; у raw.githubusercontent есть CORS). Нужен только запасному варианту и проверке доступности
function fetchBlob(cb, retries) {
    if (_blobUrl) { cb(_blobUrl); return; }
    _blobWaiters.push(cb);
    if (_blobBusy) return;
    _blobBusy = true;
    var url = soundUrl('admin');
    function done(u) {
        _blobBusy = false;
        var w = _blobWaiters; _blobWaiters = [];
        if (!u) _blobFailedAt = Date.now();
        w.forEach(function (f) { try { f(u); } catch (e) {} });
    }
    function attempt(left) {
        if (_dead) { done(null); return; }
        try {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = 'arraybuffer';
            xhr.onload = function () {
                if (xhr.status >= 200 && xhr.status < 300 && xhr.response) {
                    try {
                        _blobSize = xhr.response.byteLength || 0;
                        var blob = new Blob([xhr.response], { type: 'audio/mpeg' });
                        _blobUrl = (window.URL || window.webkitURL).createObjectURL(blob);
                        log('✅ mp3 доступен (' + _blobSize + ' байт): ' + url);
                        done(_blobUrl);
                        return;
                    } catch (e) {
                        warn('blob не создан:', e && e.message);
                        done(null);
                        return;
                    }
                }
                warn('HTTP ' + xhr.status + ' для ' + url + (left > 0 ? ' — повтор…' : ' — файл не найден? проверьте путь в репозитории'));
                if (left > 0) setTimeout(function () { attempt(left - 1); }, 2000); else done(null);
            };
            xhr.onerror = function () {
                warn('ошибка сети при загрузке mp3' + (left > 0 ? ' — повтор…' : ''));
                if (left > 0) setTimeout(function () { attempt(left - 1); }, 2000); else done(null);
            };
            xhr.send();
        } catch (e) {
            warn('XHR недоступен:', e && e.message);
            done(null);
        }
    }
    attempt(retries === undefined ? 3 : retries);
}

function gameVolume() {
    var gv = window.globalVolume;
    return (typeof gv === 'number' && isFinite(gv)) ? gv : 1;
}

// Родной звук игры: Sound_Create2D через window.playSound (http-ссылки поддерживаются — см. isValidHttpUrl в index.js)
// Вызов такой же, как в старой версии Code.js: playSound(url, false, слот, громкость). Громкость 0 → движок берёт globalVolume сам.
// onEnd (необязательно) — колбэк движка OnSoundEnded: по нему /ozv понимает, что звук реально отыграл
function playEngine(url, vol, onEnd) {
    if (typeof window.playSound !== 'function') return false;
    if (typeof onEnd === 'function') window.playSound(url, false, OPTS.SLOT, vol, true, onEnd);
    else window.playSound(url, false, OPTS.SLOT, vol);
    return true;
}

// Запасной вариант: HTMLAudio (как playAdditionalSound в игре), но через blob — у raw.githubusercontent тип файла может быть text/plain
function playHtml(url, vol) {
    var v = Math.max(0, Math.min(1, vol));
    function go(src) {
        try {
            var a = new Audio();
            a.src = src;
            a.volume = v;
            var p = a.play();
            if (p && typeof p.catch === 'function') p.catch(function (e) { warn('Audio.play отклонён:', e && e.message); });
        } catch (e) { warn('HTMLAudio не сработал:', e && e.message); }
    }
    if (_blobUrl) { go(_blobUrl); return; }
    fetchBlob(function (u) { go(u || url); }, 1);
}

var _lastPlay = { at: 0, via: '', url: '' };
var _stats = { seen: 0, hits: 0, last: '', lastAt: 0 };   // seen — сколько строк чата увидел наш перехват (доказывает, что он жив), hits — сколько раз сработал звук
var KNOWN_GOOD_URL = 'https://raw.githubusercontent.com/ZaharQqqq/Sound/main/uved.mp3';   // звук из старой рабочей версии Code.js — для проверки «/ozv uved»
function play(key, reason, urlOverride, onEnd) {
    key = key || 'admin';
    var url = urlOverride || soundUrl(key);
    if (!url) return false;
    var gv = gameVolume();
    if (gv <= 0) { warn('громкость игры = 0 (window.globalVolume) — звук не запускаю. Поднимите громкость в настройках игры или задайте OZV_OPTS.VOLUME (например 1.5)'); if (!(OPTS.VOLUME > 0)) return false; }
    var engVol = OPTS.VOLUME > 0 ? OPTS.VOLUME : 0;          // 0 → движок берёт globalVolume сам
    var htmlVol = OPTS.VOLUME > 0 ? OPTS.VOLUME * gv : gv;   // HTMLAudio ограничим 1 внутри playHtml
    var via = '';
    if (OPTS.ENGINE !== 'html') {
        try { if (playEngine(url, engVol, onEnd)) via = 'engine'; } catch (e) { warn('playSound упал:', e && e.message); }
    }
    if (!via && OPTS.ENGINE !== 'engine') { playHtml(url, htmlVol); via = 'html'; }
    _lastPlay = { at: Date.now(), via: via || 'нет способа', url: url };
    log('🔊 ' + key + (reason ? ' (' + reason + ')' : '') + ' → ' + (via || 'нет способа воспроизведения') +
        (via === 'engine' ? ' · playSound(url, false, ' + OPTS.SLOT + ', ' + engVol + ')' : '') + ' · ' + url);
    return !!via;
}

// ══════════════════════════ ПРИЗНАКИ АДМИНИСТРАТОРА ══════════════════════════
function escRe(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

// Цвет строки чата → «RRGGBB» (как normalizeColor в Code.js: «0x…», «#…», число, RGBA → первые 6 символов)
function normColor(c) {
    if (c === undefined || c === null) return '';
    if (typeof c === 'number') return c.toString(16).toUpperCase().padStart(6, '0').slice(-6);
    var s = String(c).toUpperCase();
    if (s.charAt(0) === '#') s = s.slice(1);
    if (s.indexOf('0X') === 0) s = s.slice(2);
    if (s.length === 8) s = s.slice(0, 6);
    return s;
}

// Ник нашего персонажа — Code.js держит его в config.accountInfo.nickname (config виден, пока мы в его области видимости)
function myNick() {
    try { if (typeof config !== 'undefined' && config && config.accountInfo && config.accountInfo.nickname) return String(config.accountInfo.nickname); } catch (e) {}
    try { var c = window.config; if (c && c.accountInfo && c.accountInfo.nickname) return String(c.accountInfo.nickname); } catch (e) {}
    return '';
}

// Что за строка: 'private' | 'notice' | 'adminchat' | 'radio' | 'podbros' | null
function classify(raw, color) {
    var msg = String(raw);
    var clean = msg.replace(/\{[0-9A-Fa-f]{6}\}/g, '');
    var col = normColor(color);

    // «Администратор X[ID] подбросил Вас» — отдельное событие (в Code.js своё уведомление «Обнаружен подброс»)
    if (/Администратор\s+\S+\[\d+\]\s+подбросил\s+Вас/i.test(clean)) return 'podbros';

    // Личное сообщение: Администратор X[ID] для МойНик[МойID]:  (цвет FF9945)
    if (col === 'FF9945') {
        var nick = myNick();
        var re = nick
            ? new RegExp('администратор\\s+\\S+\\[\\d+\\]\\s+для\\s+' + escRe(nick) + '\\[', 'i')
            : /администратор\s+\S+\[\d+\]\s+для\s+\S+\[/i;   // ник ещё не известен — не пропускаем
        if (re.test(clean)) return 'private';
    }

    // [Уведомление от администратора] Администратор X[ID]: …
    if (/\[Уведомление от администратора\]\s*Администратор\s+.+\[\d+\]:/i.test(clean)) return 'notice';

    // Админ-чат [A] … (( … )). Строки департамента [D] с розовым {FF8877} игнорируем (как Code.js)
    if (msg.indexOf('[A]') !== -1 && msg.indexOf('((') !== -1) {
        if (msg.indexOf('[D]') !== -1 && msg.indexOf('{FF8877}') !== -1) return null;
        return col === '33CC66' ? 'radio' : 'adminchat';   // 33CC66 — цвет рации (CHAT_RADIUS.RADIO)
    }
    return null;
}

var REASON_OPT = { private: 'SOUND_PRIVATE', notice: 'SOUND_NOTICE', adminchat: 'SOUND_ADMIN_CHAT', radio: 'SOUND_RADIO', podbros: 'SOUND_PODBROS' };

// Общая точка: пауза между звуками одна на все входы — так дубль (Code.js + разбор чата) не играет дважды
var _lastAt = 0;
function trigger(reason, text) {
    if (_dead || !OPTS.ENABLED) return false;
    var now = Date.now();
    if (now - _lastAt < OPTS.COOLDOWN_MS) { dbg('пауза — пропуск (' + reason + ')'); return false; }
    _lastAt = now;
    _stats.hits++; _stats.last = reason; _stats.lastAt = now;
    log('🔔 админ → ' + reason + (text ? ': ' + String(text).replace(/\{[0-9A-Fa-f]{6}\}/g, '').slice(0, 100) : ''));
    return play('admin', reason);
}

function onChatLine(raw, color) {
    if (_dead || typeof raw !== 'string') return;
    _stats.seen++;
    if (!OPTS.ENABLED) return;
    var r = classify(raw, color);
    if (!r) return;
    if (OPTS[REASON_OPT[r]] === false || !OPTS[REASON_OPT[r]]) { dbg('тип «' + r + '» выключен в OPTS'); return; }
    trigger(r, raw);
}

// ══════════════════════════ ПЕРЕХВАТЫ ══════════════════════════
// Копируем служебные флаги исходной функции (__code3, __sobesWrapped, …) на нашу обёртку: циклы «поставь хук, если нет флага»
// в Code.js/Code2/Code3 тогда считают цепочку уже обработанной и не наматывают обёртки друг на друга
function inherit(w, orig) {
    try { Object.keys(orig).forEach(function (k) { if (!(k in w)) w[k] = orig[k]; }); } catch (e) {}
    return w;
}

// Вход №1: sendAdminSpamAlert из Code.js. Функция объявлена в его области видимости, а мы в ней — меняем привязку напрямую.
// Вызывается Code.js только когда он действительно признал сообщение «Обнаружен администратор!» (не рация, не подброс)
function ensureBotAlertHook() {
    if (_dead || !OPTS.SOUND_BOT_ALERT) return;
    try {
        if (typeof sendAdminSpamAlert !== 'function' || sendAdminSpamAlert.__ozv) return;
        var orig = sendAdminSpamAlert;
        var w = function (adminMsg) {
            if (!_dead) { try { trigger('Code.js', adminMsg); } catch (e) { warn('trigger:', e && e.message); } }
            return orig.apply(this, arguments);
        };
        inherit(w, orig);
        w.__ozv = true;
        sendAdminSpamAlert = w;
        onUndo(function () { try { if (sendAdminSpamAlert === w) sendAdminSpamAlert = orig; } catch (e) {} });
        dbg('перехват sendAdminSpamAlert установлен');
    } catch (e) { /* не в области видимости Code.js — остаётся вход №2 */ }
}

// Вход №2: Hud.$refs.chat.add — видит каждую строку чата (то же место, что у Code3). Звук ставим ДО исходной функции — меньше задержка
function iface(name) { try { return (window.interface && window.interface(name)) || null; } catch (e) { return null; } }
var _chatHooked = false;
function ensureChatAddHook() {
    if (_dead) return;
    try {
        var hud = iface('Hud');
        var chat = hud && hud.$refs && hud.$refs.chat;
        if (!chat || typeof chat.add !== 'function') return;
        if (chat.__ozvGen === GEN) return;   // наша обёртка этого запуска уже на месте (другие могли обернуть поверх — не трогаем)
        var orig = chat.add;
        var w = function (message, color) {
            if (!_dead && typeof message === 'string') { try { onChatLine(message, color); } catch (e) { warn('onChatLine:', e && e.message); } }
            return orig.apply(this, arguments);
        };
        inherit(w, orig);
        w.__ozv = true;
        chat.add = w;
        chat.__ozvGen = GEN;
        _chatHooked = true;
        dbg('перехват Hud.chat.add установлен');
        onUndo(function () { try { if (chat.add === w) chat.add = orig; chat.__ozvGen = 0; } catch (e) {} _chatHooked = false; });
    } catch (e) {}
}

// Запасной вход, если Hud-чат недоступен: OnChatAddMessage (его Code.js пересоздаёт при инициализации, поэтому ограничиваем число обёрток)
var _ocamInstalls = 0;
function ensureOnChatFallback() {
    if (_dead || _chatHooked || _ocamInstalls >= 3) return;
    var cur = window.OnChatAddMessage;
    if (typeof cur !== 'function' || cur.__ozv) return;
    var w = function (e, c, t) {
        if (!_dead) { try { onChatLine(String(e), c); } catch (er) {} }
        return cur.apply(this, arguments);
    };
    inherit(w, cur);
    w.__ozv = true;
    window.OnChatAddMessage = w;
    _ocamInstalls++;
    dbg('запасной перехват OnChatAddMessage установлен (' + _ocamInstalls + ')');
    onUndo(function () { if (window.OnChatAddMessage === w) window.OnChatAddMessage = cur; });
}

function ensureHooks() { ensureBotAlertHook(); ensureChatAddHook(); ensureOnChatFallback(); }

// ══════════════════════════ КОМАНДЫ /ozv ══════════════════════════
function say(text) {
    try {
        var hud = iface('Hud'), chat = hud && hud.$refs && hud.$refs.chat;
        if (chat && typeof chat.add === 'function') { chat.add(text, '00BFFF'); return true; }
    } catch (e) {}
    log(text);
    return false;
}
function statusText() {
    return '[OZV] ' + VERSION + ' · звук админа: ' + (OPTS.ENABLED ? 'ВКЛ' : 'ВЫКЛ') + ' · способ: ' + OPTS.ENGINE + ' · слот: ' + OPTS.SLOT +
        ' · громкость игры: ' + gameVolume() + ' · playSound: ' + (typeof window.playSound === 'function' ? 'есть' : 'НЕТ') +
        ' · файл на GitHub: ' + (_blobUrl ? 'доступен' : (_blobFailedAt ? 'НЕ загрузился' : 'не проверен')) +
        ' · строк чата перехвачено: ' + _stats.seen + (_chatHooked ? '' : ' (Hud-чат не найден!)') +
        ' · срабатываний на админа: ' + _stats.hits + (_stats.last ? ' (последнее: ' + _stats.last + ')' : '');
}
// Проигрываем и ждём ответ движка (OnSoundEnded): так видно, звучал ли файл на самом деле
function testPlay(label, urlOverride) {
    var done = false;
    var ok = play('admin', 'тест «' + label + '»', urlOverride, function () { done = true; say('[OZV] ✅ движок сообщил: звук «' + label + '» отыграл'); });
    say('[OZV] запущен «' + label + '» · способ: ' + (_lastPlay.via || '—') + ' · слот ' + OPTS.SLOT + (ok ? '' : ' · НЕ запущен'));
    if (ok && _lastPlay.via === 'engine') {
        setTimeout(function () {
            if (!done && !_dead) say('[OZV] ⚠️ за 12 с движок не сообщил, что «' + label + '» отыграл — звука, скорее всего, не было. Если эталон «/ozv uved» играет, а админ — нет, проблема в файле/пути; если не играют оба — в слоте: «/ozv slot 8»');
        }, 12000);
    }
}
function handleCmd(arg, arg2) {
    if (arg === 'slot') {
        var n = parseInt(arg2, 10);
        if (isNaN(n) || n < 0 || n > 60) { say('[OZV] слот сейчас ' + OPTS.SLOT + ' · задать: /ozv slot 8 (0–60)'); return; }
        OPTS.SLOT = n; lsSet(LS_SLOT, String(n)); say('[OZV] слот звука: ' + n); testPlay('Администратор'); return;
    }
    if (arg === 'uved' || arg === 'old') { testPlay('эталон uved.mp3 из старой версии', KNOWN_GOOD_URL); return; }
    if (arg === 'status' || arg === 'статус') { say(statusText()); return; }
    if (arg === 'on' || arg === '1' || arg === 'вкл') { OPTS.ENABLED = true; lsSet(LS_ON, '1'); say('[OZV] звук админа включён'); return; }
    if (arg === 'off' || arg === '0' || arg === 'выкл') { OPTS.ENABLED = false; lsSet(LS_ON, '0'); say('[OZV] звук админа выключен'); return; }
    if (arg === 'engine' || arg === 'html' || arg === 'auto') { OPTS.ENGINE = arg; lsSet(LS_MODE, arg); say('[OZV] способ воспроизведения: ' + arg); }
    // /ozv, /ozv test, а также после смены способа — сразу проигрываем для проверки
    say(statusText());
    testPlay('Администратор');
    if (!_blobUrl && !_blobBusy) fetchBlob(function (u) { say(u ? '[OZV] mp3 на GitHub доступен' : '[OZV] mp3 на GitHub НЕ загрузился — проверьте путь: ' + OPTS.FILE_ADMIN); }, 1);
}
(function installCommand() {
    var origWin = window.sendChatInputCustom;
    var origVar = null;
    try { if (typeof sendChatInput === 'function') origVar = sendChatInput; } catch (e) {}
    var prev = origWin || origVar;
    var mine = function (e) {
        if (!_dead && typeof e === 'string') {
            var m = e.trim().match(/^\/ozv(?:\s+(\S+))?(?:\s+(\S+))?\s*$/i);
            if (m) { try { handleCmd((m[1] || '').toLowerCase(), m[2] || ''); } catch (er) { warn('/ozv:', er && er.message); } return; }
        }
        if (typeof prev === 'function') return prev.apply(this, arguments);
    };
    if (typeof prev === 'function') inherit(mine, prev);
    window.sendChatInputCustom = mine;
    try { if (typeof sendChatInput === 'function') sendChatInput = mine; } catch (e) {}
    onUndo(function () {
        if (window.sendChatInputCustom === mine) window.sendChatInputCustom = origWin;
        try { if (sendChatInput === mine) sendChatInput = origVar || origWin; } catch (e) {}
    });
})();

// ══════════════════════════ СТАРТ ══════════════════════════
ensureHooks();
var _hookTimer = setInterval(ensureHooks, 1500);   // Hud-чат может появиться позже или пересоздаться
onUndo(function () { clearInterval(_hookTimer); });
if (OPTS.PRELOAD) setTimeout(function () { if (!_dead) fetchBlob(function () {}, 3); }, 3000);

window.__ozv = {
    version: VERSION,
    opts: OPTS,
    url: function () { return soundUrl('admin'); },
    play: function () { return play('admin', 'вручную'); },
    test: function () { return play('admin', 'тест'); },
    classify: classify,
    status: function () { var s = statusText(); log(s); return s; }
};

log('✅ ' + VERSION + ' загружен · звук админа: ' + (OPTS.ENABLED ? 'ВКЛ' : 'ВЫКЛ') + ' · ' + soundUrl('admin'));

})(); } catch (e) { try { console.error('[OZV] ошибка запуска:', e); } catch (e2) {} }
