// ╔══════════════════════════════════════════════════════════════════════╗
// ║  MiniApp/ChatApp.js — игровой чат в Telegram Mini App                ║
// ║  Грузится через MiniApp/MiniApp.js (добавить 'ChatApp.js' в FILES) и ║
// ║  выполняется в области видимости Code.js (config, tgApi, …).         ║
// ║                                                                      ║
// ║  • Перехватывает window.OnChatAddMessage (как блок KAC в Code.js) и  ║
// ║    копит последние сообщения чата: [время, цвет, текст].             ║
// ║  • Каждые ~1.5 с (если были новые) пишет их в Firebase               ║
// ║    /chat/<ключ>.json — строкой, как /stats (лимит < 4000 символов).  ║
// ║  • В меню «Функции» добавляет кнопку «💬 Чат» (рядом с «Написать»):  ║
// ║    в личке — web_app, в беседе — ссылка. Не приняли — callback-кнопка║
// ║    (local_chat_app_<id>) шлёт карточку с кнопкой.                    ║
// ║  • /chatapp в игровом чате — прислать карточку с кнопкой.            ║
// ║  • /chatsnap — то же, но без Firebase: только снимок из ссылки.      ║
// ║  • СТРОКА ВВОДА в мини-аппе (как в игре): страница кладёт сообщение  ║
// ║    в Firebase /chatin/<ключ отправки>.json, игра опрашивает эту      ║
// ║    очередь и отправляет текст тем же sendChatInput, что и «Написать  ║
// ║    в чат». Ключ отправки — ОТДЕЛЬНЫЙ от ключа чата (как у джойстика):║
// ║    ссылка с ним даёт писать и выполнять команды от имени персонажа.  ║
// ║    Обычный текст режется на куски ≤ 83 символов, между отправками    ║
// ║    пауза и учёт антифлуда (как в Code3.js). Подтверждение доставки   ║
// ║    — поле «a» в /chat/<ключ> (id принятых сообщений).                ║
// ║    ВАЖНО: в Firebase → Realtime Database → Rules нужно правило для   ║
// ║    /chatin (см. конец файла), иначе запись из мини-аппа вернёт 401.  ║
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
    const URL_MAX = 1900;         // лимит ссылки-кнопки Telegram (как в Stats.js)
    const SNAP_TXT = 150;         // обрезка строки в снимке-ссылке
    // ── Отправка из мини-аппа (строка ввода) ──
    const IN_IDLE = 2000;         // как часто игра смотрит очередь /chatin, пока мини-апп молчит, мс
    const IN_HOT = 400;           // …и пока мини-апп «рядом» (человек печатает / только что отправил), мс
    const IN_HOT_MS = 25000;      // сколько держим быстрый режим после последней активности, мс
    const IN_MAX = 512;           // как в игре: MAX_INPUT_LENGTH поля ввода
    const SAY_LIMIT = 83;         // обычный чат длиннее сервер отбрасывает — режем на куски (как Code3.js)
    const SAY_GAP = 700;          // пауза между кусками/командами, мс
    const ACK_MAX = 12;           // сколько последних принятых id отдаём в /chat (подтверждение доставки)
    const SEEN_MAX = 80;          // сколько последних id помним, чтобы не отправить дважды

    // Часовой пояс игры (минуты, как Date.getTimezoneOffset): игра пишет [ЧЧ:ММ:СС] по своему времени — мини-апп показывает так же
    function TZ() { try { return new Date().getTimezoneOffset(); } catch (e) { return 0; } }
    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    function stale() { try { return typeof __hassleStale === 'function' && !!__hassleStale(); } catch (e) { return false; } }
    function who() { return (typeof displayName !== 'undefined' && displayName) ? String(displayName) : (window.CURRENT_USER || '?'); }

    // Секретные ключи — свои, случайные, хранятся в localStorage игры.
    // chatKey — чтение чата (/chat), sendKey — отправка из мини-аппа (/chatin): отдельный, как ctlKey у джойстика.
    function secretKey(lsBase, winProp) {
        const lsName = lsBase + (window.ACCOUNT_NUMBER ? '_' + window.ACCOUNT_NUMBER : '');
        let k = null;
        try { k = localStorage.getItem(lsName); } catch (e) {}
        if (!k) k = window[winProp];
        if (!k || !/^[A-Za-z0-9]{20,}$/.test(k)) {
            const A = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let r = [];
            try { const u = new Uint8Array(28); crypto.getRandomValues(u); r = Array.prototype.slice.call(u); } catch (e) {}
            k = '';
            for (let i = 0; i < 28; i++) k += A[(r.length ? r[i] : Math.floor(Math.random() * 62)) % 62];
            try { localStorage.setItem(lsName, k); } catch (e) {}
        }
        window[winProp] = k;
        return k;
    }
    function chatKey() { return secretKey('hassleChatKey', '__hassleChatKey'); }
    function sendKey() { return secretKey('hassleChatSendKey', '__hassleChatSendKey'); }
    // Компактная упаковка снимка (вмещает вдвое больше сообщений, чем JSON): кириллица — 1 байт (как cp1251),
    // «{RRGGBB}» — 4 байта (0x01 R G B), прочее вне ASCII — 0x02 + код символа. Обратно разбирает chatapp.html.
    function packStr(str) {
        const out = [];
        str = String(str);
        for (let i = 0; i < str.length; i++) {
            const c = str.charCodeAt(i);
            if (c === 0x7B) {
                const m = /^\{([0-9A-Fa-f]{6})\}/.exec(str.slice(i, i + 8));
                if (m) { out.push(1, parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4, 6), 16)); i += 7; continue; }
            }
            if (c >= 0x20 && c <= 0x7E) out.push(c);
            else if (c === 0x0A) out.push(0x0A);
            else if (c >= 0x410 && c <= 0x44F) out.push(0xC0 + c - 0x410);
            else if (c === 0x401) out.push(0xA8);
            else if (c === 0x451) out.push(0xB8);
            else if (c < 0x20) out.push(0x20);
            else out.push(2, c >> 8, c & 255);
        }
        return out;
    }
    function b64urlBytes(bytes) {
        const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
        let out = '';
        for (let i = 0; i < bytes.length; i += 3) {
            const b0 = bytes[i], b1 = bytes[i + 1], b2 = bytes[i + 2];
            out += A[b0 >> 2] + A[((b0 & 3) << 4) | ((b1 || 0) >> 4)];
            if (b1 !== undefined) out += A[((b1 & 15) << 2) | ((b2 || 0) >> 6)];
            if (b2 !== undefined) out += A[b2 & 63];
        }
        return out;
    }

    // Ссылка: ключ k (по нему мини-апп сам берёт свежий чат из Firebase) + снимок s последних сообщений как запасной
    // вариант (Firebase недоступен — апп покажет снимок на момент отправки кнопки). Берём сколько влезает в лимит ссылки.
    // Формат до упаковки: первая строка «время(с)|пояс», дальше «секунд назад|цвет|текст» (цвет пуст — как у предыдущей).
    function appUrl(snapOnly) {   // snapOnly — без ключа k: страница не ходит в Firebase, показывает только снимок из ссылки
        // w — ключ отправки (строка ввода в мини-аппе); в снимке (snapOnly) его нет — там писать некуда
        const base = APP_URL + (APP_URL.indexOf('?') === -1 ? '?' : '&') + (snapOnly ? '' : 'k=' + chatKey() + '&w=' + sendKey() + '&') + 'n=' + encodeURIComponent(who()) + '&s=';
        const now = Date.now(), room = URL_MAX - base.length, head = Math.round(now / 1000) + '|' + TZ() + '\n';
        let used = packStr(head).length;
        const pick = [];
        for (let i = buf.length - 1; i >= 0; i--) {   // с самых свежих
            const r = buf[i], text = String(r[2]).slice(0, SNAP_TXT).replace(/[\r\n\t]+/g, ' ');
            const ago = Math.max(0, Math.round((now - r[0]) / 1000));
            const len = packStr(ago + '|' + r[1] + '|' + text + '\n').length;   // с запасом: цвет считаем всегда
            if (Math.ceil((used + len) * 4 / 3) > room) break;
            used += len;
            pick.unshift({ ago: ago, col: r[1], text: text });
        }
        let prev = '', body = head;
        pick.forEach(function (r) { body += r.ago + '|' + (r.col === prev ? '' : r.col) + '|' + r.text + '\n'; prev = r.col; });
        return base + b64urlBytes(packStr(body));
    }

    // ── Буфер сообщений (на window — переживает /reload) ──
    const buf = window.__hassleChatBuf = window.__hassleChatBuf || [];
    let dirty = true, seq = window.__hassleChatSeq || 0;
    // id сообщений из мини-аппа, принятых игрой (уходят в /chat как «a» — по ним страница видит «доставлено»)
    const acks = window.__hassleChatAck = window.__hassleChatAck || [];

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
            str = JSON.stringify({ t: now, z: TZ(), a: acks, m: m });
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

    // ── Приём сообщений из мини-аппа (строка ввода) ──
    // Страница кладёт в /chatin/<ключ отправки> строку-JSON {p: метка «я рядом», m: [[id, текст], …]} — в m все ещё
    // не подтверждённые сообщения по порядку. Игра берёт те id, которых ещё не видела, и отправляет их так же, как игрок
    // из поля ввода / Telegram «Написать в чат»: sendChatInput(текст) — через всю цепочку хуков (/hb, /zon и т.д. работают).
    // Первое чтение после запуска игры только запоминает то, что уже лежит в очереди: сообщения, написанные, пока игры не было, не уходят.
    const seen = window.__hassleChatSeen = window.__hassleChatSeen || [];   // пережили /reload — повторно не отправляем
    let inFirst = !window.__hassleChatInInit, inBusy = false, inFails = 0, lastP = null, hotUntil = 0, inWarned = false;
    window.__hassleChatInInit = true;

    // Лимит сервера: за раз ≥ 3 сообщений подряд — «Не флудите». Модель как в Code3.js: каждое +1000, убывает со временем.
    const fl = { rate: 0, last: Date.now() };
    function floodWait() {
        const n = Date.now(); fl.rate = Math.max(0, fl.rate - (n - fl.last)); fl.last = n;
        const over = fl.rate + 1000 - (3000 - 200);
        return over > 0 ? Math.ceil(over) : 0;
    }
    function floodNote() { floodWait(); fl.rate += 1000; }

    // Обычный текст режем на куски ≤ max по концу предложения/запятой/пробелу; команды («/…») не трогаем
    function splitSay(text, max) {
        text = String(text).trim();
        if (text.charAt(0) === '/' || text.length <= max) return [text];
        const parts = [];
        let s = text;
        while (s.length > max) {
            const win = s.slice(0, max + 1);
            let cut = -1, i, k;
            const enders = ['. ', '! ', '? '], commas = [', ', '; '];
            for (k = 0; k < enders.length; k++) { i = win.lastIndexOf(enders[k]); if (i >= max * 0.4) cut = Math.max(cut, i + 1); }
            if (cut === -1) for (k = 0; k < commas.length; k++) { i = win.lastIndexOf(commas[k]); if (i >= max * 0.4) cut = Math.max(cut, i + 1); }
            if (cut === -1) { i = win.lastIndexOf(' '); if (i > 0) cut = i; }
            if (cut <= 0) cut = max;
            parts.push(s.slice(0, cut).trim());
            s = s.slice(cut).trim();
        }
        if (s) parts.push(s);
        return parts.filter(Boolean);
    }
    function chatSend(t) {
        if (typeof sendChatInput === 'function') return sendChatInput(t);
        if (typeof window.sendChatInput === 'function') return window.sendChatInput(t);
        throw new Error('sendChatInput недоступен');
    }
    const sayQ = [];
    let sayBusy = false;
    function sayDrain() {
        if (stale()) { sayQ.length = 0; sayBusy = false; return; }
        if (!sayQ.length) { sayBusy = false; return; }
        sayBusy = true;
        const w = floodWait();
        if (w > 0) { setTimeout(sayDrain, w + 5); return; }
        const t = sayQ.shift();
        floodNote();
        try { chatSend(t); } catch (e) { dbg('не отправилось: ' + (e && e.message)); }
        setTimeout(sayDrain, SAY_GAP);
    }
    function enqueue(text) {
        splitSay(text, SAY_LIMIT).forEach(function (p) { sayQ.push(p); });
        if (!sayBusy) sayDrain();
    }

    function inHandle(o) {
        const list = Array.isArray(o.m) ? o.m : [];
        let got = 0;
        if (inFirst) {                                   // первый раз после запуска: старое не отправляем
            list.forEach(function (r) { if (r && r[0] != null && seen.indexOf(String(r[0])) < 0) seen.push(String(r[0])); });
            inFirst = false;
            lastP = o.p == null ? null : o.p;
        } else {
            list.forEach(function (r) {
                if (!r || r[0] == null) return;
                const id = String(r[0]);
                if (id.length > 40 || seen.indexOf(id) >= 0) return;
                seen.push(id);
                const text = String(r[1] == null ? '' : r[1]).replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, IN_MAX);
                acks.push(id);                            // принято (даже пустое — чтобы страница не ждала зря)
                if (!text) return;
                got++;
                dbg('из мини-аппа: ' + (text.charAt(0) === '/' ? text.split(/\s+/)[0] + ' …' : '«' + text.slice(0, 40) + (text.length > 40 ? '…' : '') + '»'));
                enqueue(text);
            });
            if (o.p != null && o.p !== lastP) { lastP = o.p; hotUntil = Date.now() + IN_HOT_MS; }   // страница открыта и человек пишет
        }
        if (seen.length > SEEN_MAX) seen.splice(0, seen.length - SEEN_MAX);
        if (acks.length > ACK_MAX) acks.splice(0, acks.length - ACK_MAX);
        if (got) { hotUntil = Date.now() + IN_HOT_MS; dirty = true; try { push(true); } catch (e) {} }   // подтверждение — в /chat сразу
    }
    function inPoll() {
        if (stale()) return;
        const next = function () {
            try { window.clearTimeout(window.__hassleChatInTimer); } catch (e) {}
            window.__hassleChatInTimer = window.setTimeout(inPoll, inFails >= 5 ? 10000 : (Date.now() < hotUntil ? IN_HOT : IN_IDLE));
        };
        if (inBusy) return next();
        inBusy = true;
        const x = new XMLHttpRequest();
        x.open('GET', DB_URL + '/chatin/' + sendKey() + '.json?_=' + Date.now(), true);
        x.timeout = 4000;
        const fin = function (ok, st) {
            inBusy = false;
            if (ok) { if (inFails >= 5) dbg('очередь /chatin снова доступна'); inFails = 0; }
            else {
                inFails++;
                if (inFails === 1 && !inWarned && (st === 401 || st === 403)) { inWarned = true; dbg('нет доступа к /chatin — добавьте правило в Rules (см. ChatApp.js), строка ввода в мини-аппе работать не будет'); }
            }
            next();
        };
        x.onload = function () {
            if (x.status >= 200 && x.status < 300) {
                try {
                    const v = JSON.parse(x.responseText);
                    if (typeof v === 'string') inHandle(JSON.parse(v));
                    else if (inFirst) { inFirst = false; }   // очереди ещё нет — всё, что появится потом, новое
                } catch (e) {}
                fin(true, x.status);
            } else fin(false, x.status);
        };
        x.onerror = function () { fin(false, 0); };
        x.ontimeout = function () { fin(false, 0); };
        x.send();
    }
    try { window.clearTimeout(window.__hassleChatInTimer); } catch (e) {}
    window.__hassleChatInTimer = window.setTimeout(inPoll, 3000);

    // ── Карточка с кнопкой (запасной путь и команды /chatapp, /chatsnap) ──
    // snapOnly (/chatsnap): ссылка без ключа — страница НЕ ходит в Firebase и показывает только снимок последних сообщений из самой ссылки
    function sendCard(snapOnly) {
        if (!snapOnly) { try { push(true); } catch (e) {} }
        const url = appUrl(snapOnly), text = snapOnly
            ? '💬 <b>Чат — снимок (' + esc(who()) + ')</b>\n<i>Без Firebase: только то, что вошло в ссылку, не обновляется.</i>'
            : '💬 <b>Чат (' + esc(who()) + ')</b>';
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
    // uniqueId в Code.js — let и меняется, когда игра определит ник/сервер. Раньше id запоминался один раз при загрузке
    // (const), и если ChatApp.js успевал загрузиться раньше ника — кнопка не находила «Написать в чат» и не появлялась.
    const CB_PREFIX = 'local_chat_app_';
    const ANC_PREFIX = 'request_chat_message_';
    function curCb() { return CB_PREFIX + uniqueId; }
    const origProc = processUpdates;
    processUpdates = function (updates) {
        if (stale()) return origProc.apply(this, arguments);
        const rest = [];
        for (const u of updates) {
            const cq = u.callback_query;
            if (cq && cq.data === curCb() && cq.message && config.chatIds.includes(String(cq.message.chat.id))) {
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
        if (!stale() && typeof e === 'string') {
            const c = e.trim().toLowerCase();
            if (c === '/chatapp') { sendCard(false); return; }
            if (c === '/chatsnap') { sendCard(true); return; }   // только Telegram, без Firebase — посмотреть, как выглядит снимок
        }
        if (typeof prevChat === 'function') return prevChat.apply(this, arguments);
    };
    window.sendChatInputCustom = myChat;
    try { sendChatInput = myChat; } catch (e) {}

    // ── Кнопка «💬 Чат» в меню «Функции» — в одном ряду с «📝 Написать в чат» ──
    // Меню «Функции» есть и в Code.js, и в Code2.js (там своя копия showFunctionsMenu) — обе содержат кнопку request_chat_message_.
    // Вставляем на лету в tgApi, код меню не трогаем.
    const BTN_ERR = /BUTTON_|WEB_APP|wrong HTTP URL|URL_INVALID/i;
    // «📝 Написать в чат» (request_chat_message_<id>) — рядом с ней встаёт «💬 Чат»; ищем по префиксу, id берём из самой кнопки
    function isAnc(b) { return !!(b && typeof b.callback_data === 'string' && b.callback_data.indexOf(ANC_PREFIX) === 0); }
    function isCb(b)  { return !!(b && typeof b.callback_data === 'string' && b.callback_data.indexOf(CB_PREFIX) === 0); }

    function addChatButton(payload) {
        const mk = payload.reply_markup, isStr = typeof mk === 'string';
        if (isStr && mk.indexOf(ANC_PREFIX) === -1 && mk.indexOf(CB_PREFIX) === -1) return false;
        let obj;
        try { obj = JSON.parse(isStr ? mk : JSON.stringify(mk)); } catch (e) { return false; }
        if (!obj || !obj.inline_keyboard) return false;
        const rows = obj.inline_keyboard;
        let idx = -1, has = false;
        rows.forEach(function (row, i) {
            row.forEach(function (b) {
                if (!b) return;
                if (isAnc(b) && idx < 0) idx = i;
                if (isCb(b) || (b.text && b.text.indexOf('💬 Чат') === 0)) has = true;
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
            rows.forEach(function (row) { row.forEach(function (b, i) { if (isCb(b)) row[i] = mkBtn(); }); });
        } else {
            rows[idx].push(mkBtn());
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
                        const a = rows[i].filter(isAnc)[0];
                        if (a) { rows[i].push({ text: '💬 Чат', callback_data: CB_PREFIX + a.callback_data.slice(ANC_PREFIX.length) }); break; }
                    }
                    payload.reply_markup = typeof backup === 'string' ? JSON.stringify(o) : o;
                } catch (e) { payload.reply_markup = backup; }
                return origTgApi.call(self, method, payload, onSuccess, onError, retryCount);
            }
            if (onError) return onError.apply(self, arguments);
        };
        return origTgApi.call(this, method, payload, onSuccess, failBack, retryCount);
    };

    dbg('Мини-апп чата загружен (кнопка «💬 Чат», /chatapp, live через Firebase /chat, строка ввода через /chatin)');
})(); } catch (e) { try { console.error('[CHATAPP] ошибка ChatApp.js:', e); } catch (e2) {} }

/* ════════════ Правила Firebase для строки ввода (один раз) ════════════
   Firebase Console → Realtime Database → Rules. Рядом с уже существующими "chat" / "ctl" добавьте:

     "chatin": {
       "$key": {
         ".read": true,
         ".write": true,
         ".validate": "newData.isString() && newData.val().length < 4000"
       }
     }

   Без этого правила страница при отправке получит 401/403 и покажет «Firebase не принял запись». Всё остальное (чтение чата) работает как раньше.
   Если ссылка с ключом отправки утекла — удалите в localStorage игры ключ hassleChatSendKey и перезапустите игру: появится новый,
   а старые ссылки перестанут работать (новую кнопку «💬 Чат» выдаст меню «Функции»). */
// END ChatApp.js //
