// ╔══════════════════════════════════════════════════════════════════════╗
// ║  MiniApp/ChatApp.js — игровой чат в Telegram Mini App                ║
// ║  Грузится через MiniApp/MiniApp.js (добавить 'ChatApp.js' в FILES) и ║
// ║  выполняется в области видимости Code.js (config, tgApi, …).         ║
// ║                                                                      ║
// ║  • Перехватывает window.OnChatAddMessage (как блок KAC в Code.js) и  ║
// ║    копит последние сообщения чата: [время, цвет, текст].             ║
// ║  • Каждые ~1.5 с (если были новые) пишет их в Firebase               ║
// ║    /chat/<ключ>.json — строкой, как /stats (лимит < 4000 символов).  ║
// ║  • В welcome-сообщение и в «Управление» добавляет кнопку «💬 Чат»:   ║
// ║    в личке — web_app, в беседе — ссылка. Не приняли — callback-кнопка║
// ║    (local_chat_app_<id>) шлёт карточку с кнопкой.                    ║
// ║  • /chatapp в игровом чате — прислать карточку с кнопкой.            ║
// ║  Страница лежит рядом: HassleB/MiniApp/chatapp.html                  ║
// ╚══════════════════════════════════════════════════════════════════════╝
try { (function () {
    function dbg(m) { try { console.log('[CHATAPP] ' + m); } catch (e) {} }
    if (typeof config === 'undefined' || typeof processUpdates !== 'function' || typeof tgApi !== 'function') {
        try { console.warn('[CHATAPP] не установлен: нет доступа к Code.js'); } catch (e) {}
        return;
    }
    const APP_URL = 'https://bensonzahar.github.io/Hud.js/HassleB/MiniApp/chatapp.html';
    const DB_URL = 'https://haeb-41fcc-default-rtdb.firebaseio.com';
    const DB_MAX = 3900;          // правило Firebase: строка короче 4000 символов
    const BUF_MAX = 80;           // сколько сообщений помним в игре
    const MSG_MAX = 260;          // обрезка одной строки
    const EVERY = 1500;           // как часто проверяем, есть ли новое, мс
    const HEARTBEAT = 20000;      // новых нет — всё равно обновляем метку времени, мс

    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    function stale() { try { return typeof __hassleStale === 'function' && !!__hassleStale(); } catch (e) { return false; } }
    function who() { return (typeof displayName !== 'undefined' && displayName) ? String(displayName) : (window.CURRENT_USER || '?'); }

    // Секретный ключ чата — свой, случайный, хранится в localStorage игры
    function chatKey() {
        const lsName = 'hassleChatKey' + (window.ACCOUNT_NUMBER ? '_' + window.ACCOUNT_NUMBER : '');
        let k = null;
        try { k = localStorage.getItem(lsName); } catch (e) {}
        if (!k) k = window.__hassleChatKey;
        if (!k || !/^[A-Za-z0-9]{20,}$/.test(k)) {
            const A = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let r = [];
            try { const u = new Uint8Array(28); crypto.getRandomValues(u); r = Array.prototype.slice.call(u); } catch (e) {}
            k = '';
            for (let i = 0; i < 28; i++) k += A[(r.length ? r[i] : Math.floor(Math.random() * 62)) % 62];
            try { localStorage.setItem(lsName, k); } catch (e) {}
        }
        window.__hassleChatKey = k;
        return k;
    }
    function appUrl() { return APP_URL + (APP_URL.indexOf('?') === -1 ? '?' : '&') + 'k=' + chatKey() + '&n=' + encodeURIComponent(who()); }

    // ── Буфер сообщений (на window — переживает /reload) ──
    const buf = window.__hassleChatBuf = window.__hassleChatBuf || [];
    let dirty = true, seq = window.__hassleChatSeq || 0;

    function onMsg(text, color, hidden) {
        try {
            if (hidden) return;   // третий аргумент хука — метка фильтра запрещённых фраз: игра такую строку прячет («СКРЫТО»/«УДАЛЕНО»)
            // Разметка чата игры (Hud.js): {v:Ник} → «Ник», {btn:a:b:c} — кнопка в строке, в мини-аппе не нужна
            const s = String(text == null ? '' : text)
                .replace(/\{v:((?:(?!\{v:).)+?)\}/g, '$1')
                .replace(/\{btn:\d+:\d+:\d+\}/g, '');
            if (!s.replace(/\{[a-zA-Z0-9]{6}\}|\{[a-zA-Z0-9]{8}\}/g, '').trim()) return;
            let col = '000000';
            try { col = normalizeColor(color).slice(2); } catch (e) {}
            buf.push([Date.now(), col, s.slice(0, MSG_MAX), ++seq]);
            window.__hassleChatSeq = seq;
            if (buf.length > BUF_MAX) buf.splice(0, buf.length - BUF_MAX);
            dirty = true;
        } catch (e) {}
    }

    // Обёртка поверх уже установленного хука Code.js (тем же способом, что патч KAC)
    const prevHook = window.OnChatAddMessage;
    if (!prevHook || !prevHook.__chatApp) {
        const wrapped = function (e, c, t) {
            let r;
            if (typeof prevHook === 'function') r = prevHook.call(this, e, c, t);
            if (!stale()) onMsg(e, c, t);
            return r;
        };
        wrapped.__chatApp = true;
        window.OnChatAddMessage = wrapped;
    }

    // ── Отправка в Firebase ──
    let at = 0, busy = false, fails = 0;
    function push(force) {
        if (stale() || busy) return;
        const now = Date.now();
        if (!force && !dirty && now - at < HEARTBEAT) return;
        const m = buf.slice();
        let str = '';
        for (;;) {
            str = JSON.stringify({ t: now, m: m });
            if (str.length <= DB_MAX || m.length <= 1) break;
            m.shift();   // не влезает в лимит — выкидываем самые старые
        }
        busy = true; dirty = false;
        const x = new XMLHttpRequest();
        x.open('PUT', DB_URL + '/chat/' + chatKey() + '.json', true);
        x.timeout = 10000;
        const fin = function (ok, st) {
            busy = false;
            if (ok) { if (fails) dbg('связь с Firebase восстановлена'); fails = 0; at = Date.now(); }
            else {
                dirty = true; fails++;
                if (fails === 1 || fails % 30 === 0) dbg('не записалось в Firebase (' + (st || 'сеть') + ')' + (st === 401 || st === 403 ? ' — добавьте правило для /chat в Rules' : ''));
            }
        };
        x.onload = function () { fin(x.status >= 200 && x.status < 300, x.status); };
        x.onerror = function () { fin(false, 0); };
        x.ontimeout = function () { fin(false, 0); };
        x.send(JSON.stringify(str));   // база принимает только строку — кладём JSON как строку
    }
    try { if (window.__hassleChatTimer) clearInterval(window.__hassleChatTimer); } catch (e) {}
    const timer = setInterval(function () {
        if (stale()) { clearInterval(timer); return; }
        try { push(false); } catch (e) {}
    }, EVERY);
    window.__hassleChatTimer = timer;

    // ── Карточка с кнопкой (запасной путь и команда /chatapp) ──
    function sendCard() {
        try { push(true); } catch (e) {}
        const url = appUrl(), text = '💬 <b>Чат (' + esc(who()) + ')</b>';
        (config.chatIds || []).forEach(function (chatId) {
            const base = { chat_id: chatId, text: text, parse_mode: 'HTML' };
            const kb = function (b) { return JSON.stringify({ inline_keyboard: [[b]] }); };
            tgApi('sendMessage', Object.assign({}, base, { reply_markup: kb({ text: '📱 Открыть чат', web_app: { url: url } }) }), null, function (status) {
                dbg('web_app-кнопка не принята (' + status + ') — шлю обычной ссылкой');
                tgApi('sendMessage', Object.assign({}, base, { reply_markup: kb({ text: '🌐 Открыть чат', url: url }) }), null, function (s2) {
                    console.warn('[CHATAPP] не доставлено в ' + chatId + ': ' + s2);
                });
            });
        });
    }

    // ── Callback-кнопка «💬 Чат» (если Telegram не принял web_app/url) ──
    const CB = 'local_chat_app_' + uniqueId;
    const origProc = processUpdates;
    processUpdates = function (updates) {
        if (stale()) return origProc.apply(this, arguments);
        const rest = [];
        for (const u of updates) {
            const cq = u.callback_query;
            if (cq && cq.data === CB && cq.message && config.chatIds.includes(String(cq.message.chat.id))) {
                config.lastUpdateId = u.update_id;
                try { setSharedLastUpdateId(config.lastUpdateId); } catch (e) {}
                try { answerCallbackQuery(cq.id); } catch (e) {}
                try { sendCard(); } catch (e) { dbg('ошибка: ' + e.message); }
                continue;
            }
            rest.push(u);
        }
        if (rest.length) return origProc.call(this, rest);
    };

    // ── Команда в игровом чате: /chatapp ──
    const prevWin = window.sendChatInputCustom;
    let prevVar = null;
    try { if (typeof sendChatInput === 'function') prevVar = sendChatInput; } catch (e) {}
    const prevChat = prevWin || prevVar;
    const myChat = function (e) {
        if (!stale() && typeof e === 'string' && e.trim().toLowerCase() === '/chatapp') { sendCard(); return; }
        if (typeof prevChat === 'function') return prevChat.apply(this, arguments);
    };
    window.sendChatInputCustom = myChat;
    try { sendChatInput = myChat; } catch (e) {}

    // ── Кнопка «💬 Чат» рядом с «Инфо об аккаунте» (welcome и «Управление») ──
    // Вставляем отдельным рядом на лету в tgApi, код меню в Code.js не трогаем.
    const BTN_ERR = /BUTTON_|WEB_APP|wrong HTTP URL|URL_INVALID/i;
    const ACC = 'local_account_info_' + uniqueId;

    function addChatButton(payload) {
        const mk = payload.reply_markup, isStr = typeof mk === 'string';
        if (isStr && mk.indexOf(ACC) === -1 && mk.indexOf(CB) === -1) return false;
        let obj;
        try { obj = JSON.parse(isStr ? mk : JSON.stringify(mk)); } catch (e) { return false; }
        if (!obj || !obj.inline_keyboard) return false;
        const rows = obj.inline_keyboard;
        let idx = -1, has = false;
        rows.forEach(function (row, i) {
            row.forEach(function (b) {
                if (!b) return;
                if (b.callback_data === ACC && idx < 0) idx = i;
                if (b.callback_data === CB || (b.text && b.text.indexOf('💬 Чат') === 0)) has = true;
            });
        });
        if (idx < 0 && !has) return false;
        let url = null;
        const priv = Number(payload.chat_id) > 0;   // web_app Telegram принимает только в личке
        const mkBtn = function () {
            if (!url) url = appUrl();
            return priv ? { text: '💬 Чат', web_app: { url: url } } : { text: '💬 Чат', url: url };
        };
        if (has) {   // кнопка уже есть (например, от старой копии) — только подменяем callback на ссылку
            rows.forEach(function (row) { row.forEach(function (b, i) { if (b && b.callback_data === CB) row[i] = mkBtn(); }); });
        } else {
            rows.splice(idx + 1, 0, [mkBtn()]);
        }
        payload.reply_markup = isStr ? JSON.stringify(obj) : obj;
        return true;
    }

    const origTgApi = tgApi;
    tgApi = function (method, payload, onSuccess, onError, retryCount) {
        let backup = null;
        try {
            if ((method === 'sendMessage' || method === 'editMessageText' || method === 'editMessageReplyMarkup') &&
                payload && payload.reply_markup && !stale()) {
                const before = payload.reply_markup;
                const copy = typeof before === 'string' ? before : JSON.parse(JSON.stringify(before));
                if (addChatButton(payload)) backup = copy;
            }
        } catch (e) { dbg('добавление кнопки не удалось: ' + e.message); backup = null; }
        if (backup === null) return origTgApi.apply(this, arguments);
        const self = this;
        const failBack = function (status, body) {
            if (status === 400 && BTN_ERR.test(String(body || ''))) {   // Telegram не принял кнопку — callback-вариант
                dbg('кнопка-ссылка не принята — ставлю callback-кнопку');
                try {
                    const o = JSON.parse(typeof backup === 'string' ? backup : JSON.stringify(backup));
                    const rows = o.inline_keyboard;
                    for (let i = 0; i < rows.length; i++) {
                        if (rows[i].some(function (b) { return b && b.callback_data === ACC; })) { rows.splice(i + 1, 0, [{ text: '💬 Чат', callback_data: CB }]); break; }
                    }
                    payload.reply_markup = typeof backup === 'string' ? JSON.stringify(o) : o;
                } catch (e) { payload.reply_markup = backup; }
                return origTgApi.call(self, method, payload, onSuccess, onError, retryCount);
            }
            if (onError) return onError.apply(self, arguments);
        };
        return origTgApi.call(this, method, payload, onSuccess, failBack, retryCount);
    };

    dbg('Мини-апп чата загружен (кнопка «💬 Чат», /chatapp, live через Firebase /chat)');
})(); } catch (e) { try { console.error('[CHATAPP] ошибка ChatApp.js:', e); } catch (e2) {} }
// END ChatApp.js //
