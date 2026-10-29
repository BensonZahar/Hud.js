// ╔══════════════════════════════════════════════════════════╗
// ║  Voice.js — «🎙 Голос» в Telegram: ВСЁ в одном файле     ║
// ║  Голос игроков рядом (и рация/телефон — по выбору)       ║
// ║  уходит в Telegram голосовыми сообщениями с ником.       ║
// ║                                                          ║
// ║  Code.js править НЕ нужно. Load.js подклеивает этот файл ║
// ║  как Screen.js: он выполняется в области видимости       ║
// ║  Code.js и сам ставит два перехвата:                     ║
// ║   • editMessageText — добавляет в меню «Управление» две  ║
// ║     кнопки («🎙 Голос в TG» и «🎧 Слышать»), но ТОЛЬКО   ║
// ║     если клиент наш (KONSTT_CLIENT.ours === true);       ║
// ║   • processUpdates — ловит нажатия voice_tg_<uid> и      ║
// ║     voice_mode_<uid>, проверяет чат и аккаунт.           ║
// ║  Нужны из Code.js: config, uniqueId, displayName,        ║
// ║  debugLog, tgApi, answerCallbackQuery, __hassleStale,    ║
// ║  editMessageText, processUpdates.                        ║
// ║                                                          ║
// ║  Кто что делает                                          ║
// ║   • Голос ловит и режет на реплики МОД (hassle_voice.c): ║
// ║     это сжатые Opus-пакеты из сети, из JS их не достать. ║
// ║   • Отправляет в Telegram тоже МОД (JNI → HttpURLConn.): ║
// ║     WebView игры не умеет бинарный POST (как и в Screen).║
// ║   • Здесь: токен и чат моду (на диск не пишутся),        ║
// ║     кнопки, переключатели, возврат настроек после        ║
// ║     перезапуска игры и сообщение об ошибках отправки.    ║
// ║                                                          ║
// ║  Порты мода 17791..17800 (Near 17771.., Screen 17781..). ║
// ║  Экспорт: window.__voiceSet(chatId, on)                  ║
// ║           window.__voiceStatus(cb)                       ║
// ║           window.__voiceCleanup()  (зовёт Load.js)       ║
// ╚══════════════════════════════════════════════════════════╝
(function () {
    'use strict';

    // Если предыдущая копия ещё жива (повторный eval без cleanup) — гасим её опросы.
    try { if (typeof window.__voiceCleanup === 'function') window.__voiceCleanup(); } catch (e) {}

    const PORT_FIRST = 17791, PORT_COUNT = 10;
    const LS_KEY = 'konstt_voice_want';            // что человек включил: переживает /reload и перезапуск игры
    const WATCH_MS = 20000;                        // фоновый опрос состояния мода
    const S = { base: null, busy: false, busyAt: 0, dead: false, timers: [], st: null, failSeen: -1, synced: false };

    // setTimeout, который cleanup умеет отменить
    function later(fn, ms) {
        const id = setTimeout(function () {
            const i = S.timers.indexOf(id); if (i >= 0) S.timers.splice(i, 1);
            if (!S.dead) fn();
        }, ms);
        S.timers.push(id);
    }
    function stale() { return S.dead || __hassleStale(); }
    function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    function parse(t) { try { return JSON.parse(t); } catch (e) { return null; } }

    // ── Что человек включал (localStorage; в WebView его может не быть — тогда просто не помним) ──
    function wantLoad() {
        try { const j = parse(window.localStorage.getItem(LS_KEY)); if (j && typeof j === 'object') return { tg: j.tg ? 1 : 0, mode: j.mode === 'all' ? 'all' : 'near' }; } catch (e) {}
        return { tg: 0, mode: 'near' };
    }
    function wantSave(w) { try { window.localStorage.setItem(LS_KEY, JSON.stringify(w)); } catch (e) {} }
    let want = wantLoad();

    // GET к моду; cb(ошибка|null, ответ)
    function get(url, timeoutMs, cb) {
        let done = false;
        const fin = function (e, r) { if (done) return; done = true; cb(e, r); };
        try {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.timeout = timeoutMs;
            xhr.onload = function () { if (xhr.status === 200) fin(null, xhr.responseText); else fin('http ' + xhr.status); };
            xhr.onerror = function () { fin('network'); };
            xhr.ontimeout = function () { fin('timeout'); };
            xhr.send();
        } catch (e) { fin(e && e.message ? e.message : String(e)); }
    }

    // Ищем порт мода (как Screen.js): сначала запомненный, затем 17791..17800.
    function findBase(cb) {
        const probe = function (i) {
            if (i >= PORT_COUNT) return cb('nobase');
            const base = 'http://127.0.0.1:' + (PORT_FIRST + i);
            get(base + '/voice/status', 800, function (e, t) {
                const j = parse(t);
                if (!e && j && j.v === 1) { S.base = base; S.st = j; cb(null, base); } else probe(i + 1);
            });
        };
        if (S.base) {
            get(S.base + '/voice/status', 1500, function (e) {
                if (!e) return cb(null, S.base);
                S.base = null; probe(0);
            });
        } else probe(0);
    }

    function status(cb) {
        findBase(function (e, base) {
            if (e) return cb(e);
            get(base + '/voice/status', 2500, function (e1, t1) {
                const j = parse(t1);
                if (e1 || !j) return cb(e1 || 'ответ не JSON');
                S.st = j; cb(null, j);
            });
        });
    }

    // Токен и чат для мода: только в память мода, на диск он их не пишет. Чат — первый из config.chatIds (мод шлёт в один).
    function cfgQuery() {
        const chat = (config.chatIds && config.chatIds[0]) ? String(config.chatIds[0]) : '';
        if (!config.botToken || !chat) return null;
        return 'k=' + encodeURIComponent(config.botToken) + '&c=' + encodeURIComponent(chat) + '&who=' + encodeURIComponent(String(displayName));
    }
    // токен в лог не пишем: URL не логируем
    function cfg(base, query, cb) {
        get(base + '/voice/cfg?' + query, 3000, function (e, t) {
            const r = parse(t);
            if (e || !r) return cb('Мод не принял настройки (' + (e || 'ответ не JSON') + '). Нужна сборка клиента с hassle_voice.c.');
            if (!r.ok) return cb(r.err === 'no_token' ? 'У мода нет токена и чата' : 'Мод отказал: ' + (r.err || '?'));
            cb(null);
        });
    }

    // ── Вход: голос пишет мод нашего клиента; на обычном клиенте — отказ ──
    function oursNow() { return !!(window.KONSTT_CLIENT && window.KONSTT_CLIENT.ours === true); }
    function say(chatId, html) {
        tgApi('sendMessage', { chat_id: chatId, text: html, parse_mode: 'HTML', disable_notification: true });
    }
    function head() { return '🎙 <b>Голос ' + displayName + '</b>\n'; }
    function whenOurs(chatId, fn) {
        if (stale()) return;
        const go = function () {
            if (stale()) return;
            if (!oursNow()) return say(chatId, '❌ ' + head() + 'Клиент не наш — мода голоса нет.');
            fn();
        };
        // определение клиента ещё идёт (до 90 с после старта игры) — дожидаемся результата
        if (window.KONSTT_CLIENT && window.KONSTT_CLIENT.ours === null && typeof window.konsttWhenChecked === 'function') window.konsttWhenChecked().then(go, go);
        else go();
    }
    function guard(chatId, name) {
        if (S.busy && Date.now() - S.busyAt < 30000) { say(chatId, '⏳ ' + head() + 'уже выполняется, попробуйте через пару секунд'); return false; }
        S.busy = true; S.busyAt = Date.now();
        return true;
    }
    function fail(chatId, why) {
        S.busy = false;
        debugLog('[VOICE] ' + why);
        say(chatId, '❌ ' + head() + why);
    }
    const modeRu = function (m) { return m === 'all' ? 'всё, что слышит клиент (рядом, рация, телефон, общий канал)' : 'только те, кто рядом'; };

    // ── Включить / выключить отправку голоса в Telegram ──
    function setTg(chatId, on) {
        whenOurs(chatId, function () {
            if (!guard(chatId)) return;
            tgApi('sendChatAction', { chat_id: chatId, action: 'typing' });
            status(function (e, stNow) {
                const base = S.base;
                if (stale()) { S.busy = false; return; }
                if (e) return fail(chatId, 'Мод голоса в клиенте не отвечает. Нужна сборка клиента с hassle_voice.c, а игра должна быть запущена и загружена.');
                if (on === null) on = !(stNow && stNow.tg === 1);   // кнопка: переключаем по свежему состоянию мода
                if (!on) {
                    return cfg(base, 'tg=0', function (err) {
                        if (stale()) { S.busy = false; return; }
                        if (err) return fail(chatId, err);
                        want.tg = 0; wantSave(want); S.busy = false;
                        refreshSoon();
                        say(chatId, head() + 'отправка в Telegram <b>выключена</b>\n<i>запись в файлы на устройстве идёт как шла (/voice off в игре — остановить)</i>');
                    });
                }
                const q = cfgQuery();
                if (!q) return fail(chatId, 'Нет токена бота или чата — нечего передать моду.');
                cfg(base, q + '&mode=' + want.mode + '&tg=1', function (err) {
                    if (stale()) { S.busy = false; return; }
                    if (err) return fail(chatId, err);
                    want.tg = 1; wantSave(want);
                    // Запись и перехват включает поток мода по заявке — ждём, пока перехват встанет
                    const t0 = Date.now();
                    const check = function () {
                        status(function (e2, st) {
                            if (stale()) { S.busy = false; return; }
                            if (!e2 && st.hooked === 1 && st.tg === 1) {
                                S.busy = false; refreshSoon();
                                return say(chatId, head() + 'отправка в Telegram <b>включена</b>\n<i>слышно: ' + modeRu(st.mode) + '. Свои слова не пишутся — голос с вашего микрофона обратно не приходит.</i>');
                            }
                            if (Date.now() - t0 > 6000) {
                                cfg(base, 'tg=0', function () {});
                                want.tg = 0; wantSave(want);
                                return fail(chatId, 'Перехват голоса не встал за 6 с (поддерживается только arm64). Причина — в konstt.log, строки «voice:». Отправку выключил.');
                            }
                            later(check, 400);
                        });
                    };
                    later(check, 400);
                });
            });
        });
    }

    // ── «Слышать»: рядом ⇄ всё ──
    function toggleMode(chatId) {
        whenOurs(chatId, function () {
            if (!guard(chatId)) return;
            status(function (e, st) {
                if (stale()) { S.busy = false; return; }
                if (e) return fail(chatId, 'Мод голоса в клиенте не отвечает. Нужна сборка клиента с hassle_voice.c, а игра должна быть запущена и загружена.');
                const next = st.mode === 'all' ? 'near' : 'all';
                cfg(S.base, 'mode=' + next, function (err) {
                    if (stale()) { S.busy = false; return; }
                    if (err) return fail(chatId, err);
                    want.mode = next; wantSave(want); S.busy = false;
                    refreshSoon();
                    say(chatId, head() + 'теперь слышно: <b>' + modeRu(next) + '</b>');
                });
            });
        });
    }

    // ── Фон: после запуска игры / /reload возвращаем моду токен, чат и то, что было включено; сообщаем об ошибках отправки ──
    function syncOnce(cb) {
        status(function (e, st) {
            if (e) return cb && cb(e);
            const q = cfgQuery();
            if (!q) return cb && cb('нет токена или чата');
            let extra = '&mode=' + want.mode;
            if (want.tg && st.tg !== 1) extra += '&tg=1';
            cfg(S.base, q + extra, function (err) {
                if (!err) S.synced = true;
                cb && cb(err);
            });
        });
    }
    function watch() {
        if (stale()) return;
        const next = function () { later(watch, WATCH_MS); };
        if (!oursNow()) { next(); return; }
        const done = function () {
            status(function (e, st) {
                if (stale()) return;
                if (!e) {
                    if (S.failSeen < 0) S.failSeen = st.fail;
                    else if (st.fail > S.failSeen) {
                        S.failSeen = st.fail;
                        const chat = (config.chatIds && config.chatIds[0]) ? config.chatIds[0] : null;
                        // голосовое не ушло — это сообщение уходит обычным способом, из JS
                        if (chat) say(chat, '⚠️ ' + head() + 'Telegram не принял голосовое' + (st.code ? ' (' + st.code + ')' : '') + (st.msg ? '\n' + esc(st.msg) : ''));
                    }
                }
                next();
            });
        };
        // мод перезапустили без нас (или он ещё не получил токен) — отдаём настройки заново
        if (!S.synced || (S.st && S.st.cfg !== 1)) syncOnce(function () { done(); }); else done();
    }
    function refreshSoon() { status(function () {}); }   // обновить кэш для подписей кнопок

    // Первый запуск: мод поднимает HTTP после готовности игры — пробуем каждые 5 с до 2 минут
    function boot() {
        if (stale()) return;
        const t0 = Date.now();
        const attempt = function () {
            if (stale()) return;
            if (!oursNow()) {
                if (window.KONSTT_CLIENT && window.KONSTT_CLIENT.ours === false) return;   // клиент не наш — Voice не нужен
                return later(attempt, 3000);
            }
            syncOnce(function (err) {
                if (stale()) return;
                if (!err) { debugLog('[VOICE] настройки переданы моду' + (want.tg ? ', отправка в Telegram восстановлена' : '')); return later(watch, WATCH_MS); }
                if (Date.now() - t0 > 120000) { debugLog('[VOICE] мод голоса не найден: ' + err); return later(watch, WATCH_MS); }
                later(attempt, 5000);
            });
        };
        attempt();
    }

    // ── Перехват 1: кнопки в меню «Управление» ──
    function cbOf(b) { return b && typeof b.callback_data === 'string' ? b.callback_data : ''; }
    function isControlsMenu(kb) {
        if (!kb || !Array.isArray(kb.inline_keyboard)) return false;
        let hide = false, reload = false, info = false;
        kb.inline_keyboard.forEach(function (row) {
            (row || []).forEach(function (b) {
                const d = cbOf(b);
                if (d.indexOf('hide_controls_') === 0) hide = true;
                else if (d.indexOf('global_reload_script_') === 0) reload = true;
                else if (d.indexOf('local_account_info_') === 0) info = true;
            });
        });
        return hide && reload && info;
    }
    function withVoiceButtons(kb) {
        try {
            if (!oursNow() || !isControlsMenu(kb)) return kb;
            const rows = kb.inline_keyboard.slice();
            if (rows.some(function (row) { return (row || []).some(function (b) { return cbOf(b).indexOf('voice_') === 0; }); })) return kb;
            const st = S.st;
            const tgOn = !!(st && st.tg === 1), all = !!(st && st.mode === 'all');
            const b1 = { text: '🎙 Голос в TG: ' + (st ? (tgOn ? 'ВКЛ ✅' : 'выкл') : '…'), callback_data: 'voice_tg_' + uniqueId };
            const b2 = { text: '🎧 Слышать: ' + (all ? 'всё' : 'рядом'), callback_data: 'voice_mode_' + uniqueId };
            // ставим после «Инфо об аккаунте» и (если есть) после «📸 Скрин»
            let at = -1;
            rows.forEach(function (row, i) { if ((row || []).some(function (b) { const d = cbOf(b); return d.indexOf('local_account_info_') === 0 || d.indexOf('screen_shot_') === 0; })) at = i; });
            rows.splice(at >= 0 ? at + 1 : rows.length - 1, 0, [b1], [b2]);
            const out = {}; for (const k in kb) out[k] = kb[k];
            out.inline_keyboard = rows;
            return out;
        } catch (e) { debugLog('[VOICE] кнопки не добавлены: ' + (e && e.message)); return kb; }
    }

    // ── Перехват 2: нажатие кнопки ──
    // Свой чат и свой аккаунт проверяем сами (в обход processUpdates), остальное отдаём Code.js как есть.
    function kindOf(u) {
        const cq = u && u.callback_query;
        if (!cq || typeof cq.data !== 'string') return null;
        let kind = null, pre = '';
        if (cq.data.indexOf('voice_tg_') === 0) { kind = 'tg'; pre = 'voice_tg_'; }
        else if (cq.data.indexOf('voice_mode_') === 0) { kind = 'mode'; pre = 'voice_mode_'; }
        else return null;
        if (cq.data.slice(pre.length) !== uniqueId) return null;
        if (!(cq.message && cq.message.chat && config.chatIds.includes(String(cq.message.chat.id)))) return null;
        return kind;
    }
    function isMine(u) { return kindOf(u) !== null; }

    const hooks = [];   // [{orig, wrapped, getter, setter}] — для cleanup
    function hook(name, getter, setter, make) {
        try {
            const orig = getter();
            if (typeof orig !== 'function') { debugLog('[VOICE] не найдена функция ' + name + ' — перехват не поставлен'); return; }
            if (orig.__voiceWrapped) return;
            const wrapped = make(orig);
            wrapped.__voiceWrapped = true;
            setter(wrapped);
            hooks.push({ orig: orig, wrapped: wrapped, getter: getter, setter: setter });
        } catch (e) { console.warn('[VOICE] перехват ' + name + ' не поставлен:', e && e.message); }
    }
    hook('editMessageText', function () { return editMessageText; }, function (f) { editMessageText = f; }, function (orig) {
        return function (chatId, messageId, text, replyMarkup) {
            if (replyMarkup) replyMarkup = withVoiceButtons(replyMarkup);
            return orig.apply(this, [chatId, messageId, text, replyMarkup].concat(Array.prototype.slice.call(arguments, 4)));
        };
    });
    hook('processUpdates', function () { return processUpdates; }, function (f) { processUpdates = f; }, function (orig) {
        return function (updates) {
            if (stale()) return;
            try {
                if (Array.isArray(updates) && updates.some(isMine)) {
                    const rest = [];
                    updates.forEach(function (u) {
                        const kind = kindOf(u);
                        if (!kind) { rest.push(u); return; }
                        try { answerCallbackQuery(u.callback_query.id); } catch (e) {}
                        const chatId = u.callback_query.message.chat.id;
                        if (kind === 'tg') setTg(chatId, null);
                        else toggleMode(chatId);
                    });
                    // lastUpdateId двигает вызывающий (checkTelegramCommands) — пустой список отдавать дальше незачем
                    if (!rest.length) return;
                    updates = rest;
                }
            } catch (e) { debugLog('[VOICE] processUpdates: ' + (e && e.message)); }
            return orig.apply(this, [updates].concat(Array.prototype.slice.call(arguments, 1)));
        };
    });

    window.__voiceSet = function (chatId, on) { setTg(chatId, !!on); };
    window.__voiceStatus = function (cb) { status(cb || function () {}); };
    window.__voiceCleanup = function () {
        S.dead = true; S.busy = false;
        S.timers.forEach(function (id) { try { clearTimeout(id); } catch (e) {} });
        S.timers.length = 0;
        hooks.forEach(function (h) { try { if (h.getter() === h.wrapped) h.setter(h.orig); } catch (e) {} });
        hooks.length = 0;
        window.__voiceSet = null; window.__voiceStatus = null;
        window.__voiceCleanup = null;
    };
    boot();
    try { debugLog('[VOICE] Voice.js загружен'); } catch (e) {}
})();
