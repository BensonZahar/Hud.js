// ╔══════════════════════════════════════════════════════════╗
// ║  Ozv.js — озвучка событий для HassleB                    ║
// ║  Играет mp3 из HassleB/Озвучка/ (репозиторий) через      ║
// ║  родной window.playSound игры.                           ║
// ║                                                          ║
// ║  ВСЕ ЗВУКИ ИЗНАЧАЛЬНО ВЫКЛЮЧЕНЫ. Включаются в Telegram:  ║
// ║  Функции → «🔊 Озвучка» → выбрать событие →              ║
// ║  «этот аккаунт» / «все аккаунты» → ВКЛ / ВЫКЛ.           ║
// ║  Там же есть «Все звуки» и кнопка «Проверить звук».      ║
// ║                                                          ║
// ║  Как ловим события (Code.js / Code2.js / Code3.js        ║
// ║  не меняются — только перехваты):                        ║
// ║   • Администратор / Агент поддержки — перехват           ║
// ║     sendAdminSpamAlert + разбор строк Hud.$refs.chat.add ║
// ║   • всё остальное — перехват sendToTelegram: звук        ║
// ║     играет ровно тогда, когда Code.js шлёт в Telegram    ║
// ║     соответствующее уведомление (со всеми его            ║
// ║     фильтрами: свой /rec, дубли, переключатели и т.д.)   ║
// ║   • «для всех аккаунтов» — через #HBGLOBAL (cmd ozv_set) ║
// ║                                                          ║
// ║  Грузится Load.js вместе с Code2/Code3 (eval в области   ║
// ║  видимости Code.js).                                     ║
// ╚══════════════════════════════════════════════════════════╝
try { (function () {

if (typeof window.__ozvCleanup === 'function') { try { window.__ozvCleanup(); } catch (e) {} }

var REPO = 'BensonZahar/Hud.js', BRANCH = 'main';
var DIR = 'HassleB/Озвучка/';
var SLOT = 1;            // канал звука движка
var COOLDOWN_MS = 4000;  // один и тот же звук — не чаще, чем раз в это время
var GAP_MS = 2600;       // между РАЗНЫМИ звуками — пауза, чтобы один не обрывал другой (озвучки короткие)

// Порядок = порядок в меню Telegram. file — имя mp3 без расширения (как в HassleB/Озвучка/).
// prio — звуки про админа: при очереди идут вперёд.
var EVENTS = [
    { key: 'admin',      file: 'Администратор',   label: 'Администратор',        prio: true },
    { key: 'support',    file: 'Поддержка',       label: 'Агент поддержки',      prio: true },
    { key: 'podbros',    file: 'Подброс',         label: 'Подброс',              prio: true },
    { key: 'kick',       file: 'Кик админа',      label: 'Кик админа' },
    { key: 'prison',     file: 'Тюрьма',          label: 'Тюрьма' },
    { key: 'anticheat',  file: 'Антикик',         label: 'Кик анти-чита' },
    { key: 'disconnect', file: 'Дисконнект',      label: 'Дисконнект' },
    { key: 'autologin',  file: 'Автовход',        label: 'Автовход не сработал' },
    { key: 'warn',       file: 'Выговор',         label: 'Выговор' },
    { key: 'location',   file: 'Местоположение',  label: 'Местоположение' },
    { key: 'respawn',    file: 'Респавн',         label: 'Респавн' },
    { key: 'keyword',    file: 'Ключевое слово',  label: 'Ключевое слово' },
    { key: 'staff',      file: 'Сотрудник',       label: 'Сотрудник фракции' }
];
var BY_KEY = {};
EVENTS.forEach(function (ev) { BY_KEY[ev.key] = ev; });
var KEYS_RE = EVENTS.map(function (ev) { return ev.key; }).concat('all').join('|');

// Настройки живут в window — переживают перезагрузку скриптов (/reload), но не перезапуск игры. Изначально всё выключено.
var PREFS = (window.__ozvPrefs = window.__ozvPrefs || {});
EVENTS.forEach(function (ev) { if (typeof PREFS[ev.key] !== 'boolean') PREFS[ev.key] = false; });
try { if (typeof config !== 'undefined') config.ozvSounds = PREFS; } catch (e) {}

var GEN = (window.__ozvGen = (window.__ozvGen || 0) + 1);
var _dead = false, _undo = [], _lastAt = {};
function onUndo(fn) { _undo.push(fn); }
function dbg(m) { try { if (typeof debugLog === 'function') debugLog('[OZV] ' + m); else console.log('[OZV] ' + m); } catch (e) {} }
window.__ozvCleanup = function () {
    _dead = true;
    while (_undo.length) { try { _undo.pop()(); } catch (e) {} }
    window.__ozvCleanup = null;
};

// ── Воспроизведение ──────────────────────────────────────────
function urlFor(ev) {
    return 'https://raw.githubusercontent.com/' + REPO + '/' + BRANCH + '/' +
        (DIR + ev.file + '.mp3').split('/').map(function (s) { return encodeURIComponent(s.normalize ? s.normalize('NFC') : s); }).join('/');
}
function playNow(ev) {
    try { window.playSound(urlFor(ev), false, SLOT); return true; }
    catch (e) { console.warn('[OZV] playSound:', e && e.message); return false; }
}

// Очередь: если за раз сработало несколько событий (кик админа → дисконнект, посадка → подброс…) — играем по очереди
var _queue = [], _busyUntil = 0, _pumpTimer = null;
function pump() {
    _pumpTimer = null;
    if (_dead || !_queue.length) return;
    var wait = _busyUntil - Date.now();
    if (wait > 0) { _pumpTimer = setTimeout(pump, wait + 20); return; }
    var ev = _queue.shift();
    _busyUntil = Date.now() + GAP_MS;
    playNow(ev);
    if (_queue.length) _pumpTimer = setTimeout(pump, GAP_MS + 20);
}
function enqueue(ev) {
    if (_queue.indexOf(ev) !== -1 || _queue.length >= 4) return;
    if (ev.prio) _queue.unshift(ev); else _queue.push(ev);
    if (!_pumpTimer) pump();
}
onUndo(function () { if (_pumpTimer) clearTimeout(_pumpTimer); _pumpTimer = null; _queue.length = 0; });

// test=true — проверка из меню: играет сразу, без учёта «включено» и кулдауна
function trigger(key, test) {
    if (_dead) return false;
    var ev = BY_KEY[key];
    if (!ev) return false;
    if (test) return playNow(ev);
    if (!PREFS[key]) return false;
    var now = Date.now();
    if (now - (_lastAt[key] || 0) < COOLDOWN_MS) return false;   // дубль от второго входа или несколько строк подряд
    _lastAt[key] = now;
    enqueue(ev);
    return true;
}

function setPref(key, on) {
    if (key === 'all') { EVENTS.forEach(function (ev) { PREFS[ev.key] = !!on; }); return true; }
    if (!BY_KEY[key]) return false;
    PREFS[key] = !!on;
    return true;
}
function enabledCount() { var n = 0; EVENTS.forEach(function (ev) { if (PREFS[ev.key]) n++; }); return n; }

// Копируем служебные флаги исходной функции на обёртку — чтобы циклы «поставь хук, если нет флага» в Code.js/Code2/Code3 не наматывали обёртки
function inherit(w, orig) {
    try { Object.keys(orig).forEach(function (k) { if (!(k in w)) w[k] = orig[k]; }); } catch (e) {}
    return w;
}

// ══ Вход 1: Администратор / Агент поддержки ═══════════════════
function normColor(c) {
    if (c === undefined || c === null) return '';
    if (typeof c === 'number') return c.toString(16).toUpperCase().padStart(6, '0').slice(-6);
    var s = String(c).toUpperCase();
    if (s.charAt(0) === '#') s = s.slice(1);
    if (s.indexOf('0X') === 0) s = s.slice(2);
    if (s.length === 8) s = s.slice(0, 6);
    return s;
}
function myNick() {
    try { if (typeof config !== 'undefined' && config.accountInfo && config.accountInfo.nickname) return String(config.accountInfo.nickname); } catch (e) {}
    return '';
}
function stripColors(s) { return String(s).replace(/\{[0-9A-Fa-f]{6}\}/g, ''); }
// пишет агент поддержки → «support», иначе «admin»
function adminKindOf(text) { return /агент\s+поддержки/i.test(stripColors(text)) ? 'support' : 'admin'; }

// null — не про админа; иначе 'admin' / 'support'
function adminLineKind(raw, color) {
    var msg = String(raw);
    var clean = stripColors(msg);
    var col = normColor(color);
    if (/Администратор\s+\S+\[\d+\]\s+подбросил\s+Вас/i.test(clean)) return null;   // подброс — отдельное событие (из sendToTelegram)
    // личное: Администратор / Агент поддержки X[ID] для МойНик[ID]: (цвет FF9945)
    if (col === 'FF9945') {
        var nick = myNick();
        var re = nick
            ? new RegExp('(?:администратор|агент\\s+поддержки)\\s+\\S+\\[\\d+\\]\\s+для\\s+' + nick.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\[', 'i')
            : /(?:администратор|агент\s+поддержки)\s+\S+\[\d+\]\s+для\s+\S+\[/i;
        if (re.test(clean)) return adminKindOf(clean);
    }
    // [Уведомление от администратора] Администратор X[ID]: …
    if (/\[Уведомление от администратора\]\s*Администратор\s+.+\[\d+\]:/i.test(clean)) return 'admin';
    // админ-чат [A] … (( … )) вне рации (рация 33CC66 — тихое уведомление, без звука); департамент [D] {FF8877} игнорируем
    if (msg.indexOf('[A]') !== -1 && msg.indexOf('((') !== -1) {
        if (msg.indexOf('[D]') !== -1 && msg.indexOf('{FF8877}') !== -1) return null;
        return col !== '33CC66' ? adminKindOf(clean) : null;
    }
    return null;
}

// sendAdminSpamAlert из Code.js (его вызывают, когда Code.js признал сообщение «Обнаружен администратор!»)
function hookBotAlert() {
    try {
        if (typeof sendAdminSpamAlert !== 'function' || sendAdminSpamAlert.__ozv) return;
        var orig = sendAdminSpamAlert;
        var w = function (adminMsg) {
            try { trigger(adminKindOf(adminMsg)); } catch (e) {}
            return orig.apply(this, arguments);
        };
        inherit(w, orig);
        w.__ozv = true;
        sendAdminSpamAlert = w;
        onUndo(function () { try { if (sendAdminSpamAlert === w) sendAdminSpamAlert = orig; } catch (e) {} });
    } catch (e) {}
}

// Hud.$refs.chat.add — видит каждую строку чата (как главный перехват Code3)
function hookChat() {
    try {
        var hud = window.interface && window.interface('Hud');
        var chat = hud && hud.$refs && hud.$refs.chat;
        if (!chat || typeof chat.add !== 'function' || chat.__ozvGen === GEN) return;
        var orig = chat.add;
        var w = function (message, color) {
            if (!_dead && typeof message === 'string') {
                try { var k = adminLineKind(message, color); if (k) trigger(k); } catch (e) {}
            }
            return orig.apply(this, arguments);
        };
        inherit(w, orig);
        w.__ozv = true;
        chat.add = w;
        chat.__ozvGen = GEN;
        onUndo(function () { try { if (chat.add === w) chat.add = orig; chat.__ozvGen = 0; } catch (e) {} });
    } catch (e) {}
}

// ══ Вход 2: все остальные события — по уведомлению в Telegram ═
// Code.js шлёт заголовок первой строкой: «<эмодзи> <b>Заголовок (ник)</b>». Сверяем начало заголовка.
var STAFF_RE = /^🏛\uFE0F?\s*<b>[\s\S]*?<\/b>\n👤[^\n]*?\[ID:\s*\d+\]\nСообщение от сотрудника \[/;
var TG_RULES = [
    ['podbros',    'Обнаружен подброс!'],
    ['kick',       'КИК АДМИНИСТРАТОРА!'],
    ['prison',     'Посадили в '],
    ['anticheat',  'Вас кикнул анти-чит!'],
    ['disconnect', 'Потеряно соединение с сервером'],
    ['disconnect', 'Вы были отключены от сервера'],
    ['autologin',  'Автовход не удался'],
    ['autologin',  'Автовход завис'],
    ['autologin',  'Автовход не прошёл'],
    ['autologin',  'Автовход не сработал'],
    ['warn',       'Получен выговор'],
    ['location',   'Обнаружен запрос местоположения'],
    ['respawn',    'Вас зареспавнили'],
    ['keyword',    'Обнаружено ключевое слово']
];
function tgKey(text) {
    if (STAFF_RE.test(text)) return 'staff';
    var head = text.split('\n', 1)[0];
    if (head.indexOf('💬') === 0) return null;   // пересылка реплики игрока (Code3) — текст чужой, по нему звук не включаем
    var t = head.replace(/^[^\s<]{1,4}\s+/, '').replace(/^<b>/, '');   // без эмодзи и <b>
    for (var i = 0; i < TG_RULES.length; i++) {
        if (t.indexOf(TG_RULES[i][1]) === 0) return TG_RULES[i][0];
    }
    return null;
}
function hookSend() {
    try {
        if (typeof sendToTelegram !== 'function' || sendToTelegram.__ozv) return;
        var orig = sendToTelegram;
        var w = function (message) {
            if (!_dead && typeof message === 'string') { try { var k = tgKey(message); if (k) trigger(k); } catch (e) {} }
            return orig.apply(this, arguments);
        };
        inherit(w, orig);
        w.__ozv = true;
        sendToTelegram = w;
        onUndo(function () { try { if (sendToTelegram === w) sendToTelegram = orig; } catch (e) {} });
    } catch (e) {}
}

function ensureHooks() { hookBotAlert(); hookSend(); hookChat(); }
ensureHooks();
var timer = setInterval(ensureHooks, 1500);   // Hud-чат может появиться позже или пересоздаться
onUndo(function () { clearInterval(timer); });

// ══ Меню Telegram: Функции → «🔊 Озвучка» ═════════════════════
// Всё ходит в функции Code.js (createButton, editMessageText, processUpdates…). Нет доступа — меню не ставим, звуки всё равно работают (выключены).
function menuReady() {
    return typeof config !== 'undefined' && typeof processUpdates === 'function' && typeof showFunctionsMenu === 'function' &&
        typeof createButton === 'function' && typeof editMessageText === 'function';
}
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function btn(t, d, st) { return createButton(t, d, st); }
function who() { try { return typeof displayName !== 'undefined' ? displayName : ''; } catch (e) { return ''; } }
function myUid() { try { return uniqueId; } catch (e) { return ''; } }

// Список событий
function showList(chatId, messageId, uid) {
    var n = enabledCount(), total = EVENTS.length;
    var rows = [[btn((n === total ? '🟢' : n ? '🟡' : '🔴') + ' Все звуки (' + n + '/' + total + ')', 'ozv_k_all_' + uid, n === total ? 'success' : n ? undefined : 'danger')]];
    for (var i = 0; i < total; i += 2) {
        rows.push(EVENTS.slice(i, i + 2).map(function (ev) {
            return btn((PREFS[ev.key] ? '🟢 ' : '🔴 ') + ev.label, 'ozv_k_' + ev.key + '_' + uid, PREFS[ev.key] ? 'success' : 'danger');
        }));
    }
    rows.push([btn('⬅️ Вернуться назад', 'show_functions_' + uid)]);
    editMessageText(chatId, messageId,
        '🔊 <b>Озвучка</b> · ' + esc(who()) + '\n\n' +
        '🟢 — звук включён, 🔴 — выключен (изначально всё выключено).\n' +
        'Выберите событие — затем для кого применить: для этого аккаунта или для всех.',
        { inline_keyboard: rows });
}
// Одно событие (или «Все звуки»): для кого и ВКЛ / ВЫКЛ
function showKey(chatId, messageId, key, uid) {
    var all = key === 'all', ev = BY_KEY[key];
    var nowTxt = all ? ('включено ' + enabledCount() + ' из ' + EVENTS.length) : (PREFS[key] ? '🟢 ВКЛ' : '🔴 ВЫКЛ');
    var rows = [
        [btn('👤 Этот · 🔔 ВКЛ', 'ozv_s_l_on_' + key + '_' + uid, 'success'), btn('👤 Этот · 🔕 ВЫКЛ', 'ozv_s_l_off_' + key + '_' + uid, 'danger')],
        [btn('👥 Все · 🔔 ВКЛ', 'ozv_s_g_on_' + key + '_' + uid, 'success'), btn('👥 Все · 🔕 ВЫКЛ', 'ozv_s_g_off_' + key + '_' + uid, 'danger')]
    ];
    if (!all) rows.push([btn('▶️ Проверить звук', 'ozv_t_' + key + '_' + uid)]);
    rows.push([btn('⬅️ К списку озвучки', 'ozv_m_' + uid)]);
    editMessageText(chatId, messageId,
        '🔊 <b>Озвучка: ' + esc(all ? 'все звуки' : ev.label) + '</b>\n' +
        (all ? '' : 'Файл: <code>' + esc(ev.file + '.mp3') + '</code>\n') +
        'Сейчас (' + esc(who()) + '): ' + nowTxt + '\n\n' +
        'Для кого применить?\n👤 Этот — только ' + esc(who()) + '\n👥 Все — все аккаунты',
        { inline_keyboard: rows });
}

var CB_RE = new RegExp('^ozv_(?:m_(.+)|k_(' + KEYS_RE + ')_(.+)|s_(l|g)_(on|off)_(' + KEYS_RE + ')_(.+)|t_(' + KEYS_RE + ')_(.+))$');
function parseCb(data) {
    var m = CB_RE.exec(data);
    if (!m) return null;
    if (m[1] !== undefined) return { type: 'menu', uid: m[1] };
    if (m[2] !== undefined) return { type: 'key', key: m[2], uid: m[3] };
    if (m[4] !== undefined) return { type: 'set', scope: m[4] === 'g' ? 'global' : 'local', on: m[5] === 'on', key: m[6], uid: m[7] };
    return { type: 'test', key: m[8], uid: m[9] };
}
function handleCb(cq, p) {
    var chatId = cq.message.chat.id, messageId = cq.message.message_id;
    if (typeof answerCallbackQuery === 'function') answerCallbackQuery(cq.id);
    if (typeof _ctlOnCallback === 'function') _ctlOnCallback(cq);   // запомнить исходное сообщение для «Назад»
    if (p.type === 'menu') { showList(chatId, messageId, p.uid); return; }
    if (p.type === 'key') { showKey(chatId, messageId, p.key, p.uid); return; }
    if (p.type === 'test') {
        if (p.key !== 'all' && !trigger(p.key, true)) {
            try { sendToTelegram('❌ <b>Не удалось проиграть звук (' + esc(who()) + ')</b>\nwindow.playSound недоступен.', true, null); } catch (e) {}
        }
        return;
    }
    // ВКЛ / ВЫКЛ
    setPref(p.key, p.on);
    if (p.scope === 'global') {
        try { broadcastGlobalCommand('ozv_set', (p.on ? 'on' : 'off') + '_' + p.key); } catch (e) { dbg('broadcast: ' + e.message); }   // остальным аккаунтам; у себя уже применили
    }
    showList(chatId, messageId, p.uid);   // остаёмся в списке — можно сразу выбрать следующее событие
}

if (menuReady()) {
    // Кнопка в «Функции» (строка перед «Вернуться назад»)
    if (!showFunctionsMenu.__ozvPatched) {
        var origShow = showFunctionsMenu;
        var patchedShow = function () {
            var origEdit = editMessageReplyMarkup, origEditText = editMessageText;
            var inject = function (markup) {
                try {
                    if (!_dead && markup && Array.isArray(markup.inline_keyboard)) {
                        var on = enabledCount() > 0;
                        var rows = markup.inline_keyboard;
                        rows.splice(Math.max(0, rows.length - 1), 0,
                            [btn('🔊 Озвучка ' + (on ? '🟢' : '🔴'), 'ozv_m_' + myUid(), on ? 'success' : 'danger')]);
                    }
                } catch (e) {}
            };
            // меню «Функции» может уйти и через editMessageReplyMarkup, и через editMessageText (когда возвращается текст сообщения)
            editMessageReplyMarkup = function (chatId, messageId, markup) { inject(markup); return origEdit.apply(this, arguments); };
            editMessageText = function (chatId, messageId, text, markup) { inject(markup); return origEditText.apply(this, arguments); };
            try { return origShow.apply(this, arguments); }
            finally { editMessageReplyMarkup = origEdit; editMessageText = origEditText; }
        };
        patchedShow.__ozvPatched = true;
        inherit(patchedShow, origShow);
        showFunctionsMenu = patchedShow;
        onUndo(function () { try { if (showFunctionsMenu === patchedShow) showFunctionsMenu = origShow; } catch (e) {} });
    }

    // Наши кнопки (ozv_*): забираем из апдейтов до остальных обработчиков
    var origProcess = processUpdates;
    var patchedProcess = function (updates) {
        if (_dead) return origProcess.apply(this, arguments);
        var rest = [];
        for (var i = 0; i < updates.length; i++) {
            var u = updates[i], cq = u && u.callback_query;
            if (cq && typeof cq.data === 'string' && cq.data.indexOf('ozv_') === 0 && cq.message && config.chatIds.includes(String(cq.message.chat.id))) {
                var p = parseCb(cq.data);
                if (p) {
                    config.lastUpdateId = u.update_id;
                    setSharedLastUpdateId(config.lastUpdateId);
                    if (p.uid === myUid()) { try { handleCb(cq, p); } catch (e) { dbg('callback error: ' + e.message); } }
                    else if (typeof answerCallbackQuery === 'function') answerCallbackQuery(cq.id);   // кнопка другого аккаунта
                    continue;
                }
            }
            rest.push(u);
        }
        if (rest.length) return origProcess.call(this, rest);
    };
    inherit(patchedProcess, origProcess);
    processUpdates = patchedProcess;
    onUndo(function () { try { if (processUpdates === patchedProcess) processUpdates = origProcess; } catch (e) {} });

    // «Для всех аккаунтов»: #HBGLOBAL:ozv_set:<on|off>_<ключ> приходит из беседы / BroadcastChannel. Тихо — без сообщений, чтобы N аккаунтов не спамили
    if (typeof handleGlobalBroadcastCommand === 'function') {
        var origGlobal = handleGlobalBroadcastCommand;
        var patchedGlobal = function (cmd, val) {
            if (cmd === 'ozv_set') {
                var m = /^(on|off)_(\w+)$/.exec(String(val));
                if (m && setPref(m[2], m[1] === 'on')) dbg('[Global] ' + m[2] + ' = ' + m[1]);
                return;
            }
            return origGlobal.apply(this, arguments);
        };
        inherit(patchedGlobal, origGlobal);
        handleGlobalBroadcastCommand = patchedGlobal;
        onUndo(function () { try { if (handleGlobalBroadcastCommand === patchedGlobal) handleGlobalBroadcastCommand = origGlobal; } catch (e) {} });
    }
} else {
    try { console.warn('[OZV] меню «Озвучка» не установлено: нет доступа к Code.js (звуки выключены и включить их нельзя)'); } catch (e) {}
}

// Для отладки из консоли: __ozv.test('kick'), __ozv.prefs
window.__ozv = { test: function (key) { return trigger(key, true); }, prefs: PREFS, events: EVENTS, tgKey: tgKey };
onUndo(function () { try { delete window.__ozv; } catch (e) { window.__ozv = null; } });

dbg('Загружен. Включено звуков: ' + enabledCount() + ' из ' + EVENTS.length);

})(); } catch (e) { try { console.error('[OZV] ошибка запуска:', e); } catch (e2) {} }
