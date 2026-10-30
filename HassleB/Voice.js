// ╔══════════════════════════════════════════════════════════╗
// ║  Voice.js — «🎙 Голос TG» в Telegram: ВСЁ в одном файле  ║
// ║  Голос игроков рядом (и рация/телефон — по выбору)       ║
// ║  уходит в Telegram голосовыми сообщениями с ником.       ║
// ║                                                          ║
// ║  Code.js править НЕ нужно. Load.js подклеивает этот файл ║
// ║  как Screen.js: он выполняется в области видимости       ║
// ║  Code.js и сам ставит два перехвата:                     ║
// ║   • editMessageText — добавляет в меню «Управление» ОДНУ ║
// ║     кнопку «🎙 Голос TG: …» (подпись = живое состояние   ║
// ║     мода), но ТОЛЬКО если клиент наш                     ║
// ║     (KONSTT_CLIENT.ours === true);                       ║
// ║   • processUpdates — ловит нажатия voice_* для своего    ║
// ║     аккаунта, проверяет чат.                             ║
// ║                                                          ║
// ║  Кнопка «🎙 Голос TG 🟢/🔴» (цвет = состояние, как в     ║
// ║  «Функциях») открывает меню в том же сообщении:          ║
// ║   1) «Для кого?»  👤 Для этого аккаунта / 👥 Для всех;   ║
// ║   2) настройки: одна кнопка-переключатель отправки       ║
// ║      (🟢 ВКЛ / 🔴 ВЫКЛ) и выбор режима 👥 Рядом / 🌐 Всё ║
// ║  «Для всех» — применяется здесь и рассылается остальным  ║
// ║  аккаунтам (broadcastGlobalCommand 'voice_set', принимает║
// ║  обёртка handleGlobalBroadcastCommand, как у собеса).    ║
// ║  После каждого нажатия меню перерисовывается по СВЕЖЕМУ  ║
// ║  состоянию мода — перезаходить в меню не нужно.          ║
// ║                                                          ║
// ║  Кнопки под голосовыми (как под сообщением сотрудника):  ║
// ║   • мод получает клавиатуру getNotificationReplyMarkup() ║
// ║     параметром kb (reply_markup для sendVoice) — Ответить,║
// ║     Движения, Пауза, Авторизация, Управление; подписи    ║
// ║     паузы/авторизации обновляются при смене состояния;   ║
// ║   • «Управление»/«Движения» правят подпись голосового    ║
// ║     (editMessageCaption вместо editMessageText).         ║
// ║                                                          ║
// ║  Нужны из Code.js: config, uniqueId, displayName,        ║
// ║  debugLog, tgApi, answerCallbackQuery, __hassleStale,    ║
// ║  editMessageText, editMessageReplyMarkup, processUpdates ║
// ║  (+ _ctl — необязательно).                               ║
// ║                                                          ║
// ║  Кто что делает                                          ║
// ║   • Голос ловит и режет на реплики МОД (hassle_voice.c): ║
// ║     это сжатые Opus-пакеты из сети, из JS их не достать. ║
// ║   • Отправляет в Telegram тоже МОД (JNI → HttpURLConn.): ║
// ║     WebView игры не умеет бинарный POST (как и в Screen).║
// ║   • Здесь: токен и чат моду (на диск не пишутся),        ║
// ║     кнопки, подменю, возврат настроек после перезапуска  ║
// ║     игры и сообщение об ошибках отправки.                ║
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
    const FRESH_MS = 4000;                         // статус моложе этого считаем свежим и лишний раз не опрашиваем
    const NO_MOD = 'Мод голоса в клиенте не отвечает. Нужна сборка клиента с hassle_voice.c, а игра должна быть запущена и загружена.';
    const S = { base: null, busy: false, busyAt: 0, dead: false, timers: [], st: null, stAt: 0, down: false, failSeen: -1, synced: false, shown: {}, voiceKeys: {}, kbSig: '', scope: {}, lastBc: null };

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
    function key(chatId, messageId) { return chatId + ':' + messageId; }

    // ── Что человек включал (localStorage; в WebView его может не быть — тогда просто не помним) ──
    function wantLoad() {
        try { const j = parse(window.localStorage.getItem(LS_KEY)); if (j && typeof j === 'object') return { tg: j.tg ? 1 : 0, mode: j.mode === 'all' ? 'all' : 'near' }; } catch (e) {}
        return { tg: 0, mode: 'near' };
    }
    function wantSave(w) { try { window.localStorage.setItem(LS_KEY, JSON.stringify(w)); } catch (e) {} }
    let want = wantLoad();

    // GET к моду; cb(ошибка|null, ответ)
    function get(url, timeoutMs, cb) {
        let done = false, wd = 0, xhr = null;
        const fin = function (e, r) { if (done) return; done = true; if (wd) clearTimeout(wd); cb(e, r); };
        // свой сторож: если XHR завис молча (ни onload, ни onerror, ни ontimeout), цепочка всё равно продолжится
        wd = setTimeout(function () { try { if (xhr) xhr.abort(); } catch (e) {} fin('timeout'); }, timeoutMs + 700);
        try {
            xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.timeout = timeoutMs;
            xhr.onload = function () { if (xhr.status === 200) fin(null, xhr.responseText); else fin('http ' + xhr.status); };
            xhr.onerror = function () { fin('network'); };
            xhr.ontimeout = function () { fin('timeout'); };
            xhr.send();
        } catch (e) { fin(e && e.message ? e.message : String(e)); }
    }

    // Состояние мода. Один запрос на запомненный порт; если не ответил — ищем порт заново (17791..17800).
    // S.down = true, пока мод не отвечает: подписи кнопок не врут «ВКЛ», когда на деле связи нет.
    function status(cb) {
        const finish = function (e, j) {
            if (e) { S.down = true; return cb(e); }
            S.st = j; S.stAt = Date.now(); S.down = false;
            cb(null, j);
        };
        const probe = function (i) {
            if (i >= PORT_COUNT) return finish('nobase');
            const base = 'http://127.0.0.1:' + (PORT_FIRST + i);
            get(base + '/voice/status', 800, function (e, t) {
                const j = parse(t);
                if (!e && j && j.v === 1) { S.base = base; finish(null, j); } else probe(i + 1);
            });
        };
        if (S.base) {
            get(S.base + '/voice/status', 2500, function (e, t) {
                const j = parse(t);
                if (!e && j && j.v === 1) return finish(null, j);
                S.base = null; probe(0);
            });
        } else probe(0);
    }

    // Токен и чат для мода: только в память мода, на диск он их не пишет. Чат — первый из config.chatIds (мод шлёт в один).
    function cfgQuery() {
        const chat = (config.chatIds && config.chatIds[0]) ? String(config.chatIds[0]) : '';
        if (!config.botToken || !chat) return null;
        // Только токен, чат и метка: запрос короткий. Клавиатуры — отдельными запросами (pushKb): длинный URL игровой XHR мог «проглотить» без ответа.
        return 'k=' + encodeURIComponent(config.botToken) + '&c=' + encodeURIComponent(chat) + '&who=' + encodeURIComponent(String(displayName));
    }
    // Значение параметра покороче: «:» и «,» в запросе допустимы как есть (мод декодирует только %XX)
    function encKb(js) { return encodeURIComponent(js).replace(/%3A/g, ':').replace(/%2C/g, ','); }
    // Кнопки под голосовыми — двумя короткими запросами: kb (всем) и kbp (игроку, с «Выдача лицензии»). Пустое значение сбрасывает.
    // Ошибка не фатальна: голосовые уйдут с прежними кнопками, а watch() через 20 с повторит (подпись S.kbSig не обновляется).
    function pushKb(base, cb) {
        const kb = voiceKbJson(), kbp = voiceKbpJson(), sig = kb + '\n' + kbp;
        cfg(base, 'kb=' + encKb(kb), function (e1) {
            if (stale()) return;
            if (e1) { debugLog('[VOICE] кнопки (kb) не переданы: ' + e1); return cb && cb(e1); }
            cfg(base, 'kbp=' + encKb(kbp), function (e2) {
                if (stale()) return;
                if (e2) { debugLog('[VOICE] кнопки (kbp) не переданы: ' + e2); return cb && cb(e2); }
                S.kbSig = sig;
                cb && cb(null);
            });
        });
    }
    // Кнопки под голосовым — те же, что под сообщением сотрудника фракции (подписи паузы/авторизации — по живому состоянию)
    function voiceKbJson() {
        // в моде кнопки идут обычным текстом (как kb= у Screen): не-ASCII в JSON записываем как \uXXXX
        try {
            return typeof getNotificationReplyMarkup === 'function'
                ? JSON.stringify(getNotificationReplyMarkup()).replace(/[\u0080-\uffff]/g, function (c) { return '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4); })
                : '';
        } catch (e) { return ''; }
    }
    // Кнопки под голосом ИГРОКА: те же + внизу «Выдача лицензии» (только для лицензёра). «%P» в callback_data мод заменяет на ID говорящего.
    function voiceKbpJson() {
        try {
            if (typeof getNotificationReplyMarkup !== 'function' || typeof window.__licVoiceRow !== 'function') return '';
            const lic = window.__licVoiceRow();
            if (!lic) return '';   // не лицензёр / помощник не готов — для игроков пойдёт общая клавиатура
            const m = getNotificationReplyMarkup();
            const kb = { inline_keyboard: ((m && m.inline_keyboard) || []).map(function (r) { return r.slice(); }) };
            kb.inline_keyboard.push(lic);
            return JSON.stringify(kb).replace(/[\u0080-\uffff]/g, function (c) { return '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4); });
        } catch (e) { return ''; }
    }
    function voiceKbSig() { return voiceKbJson() + '\n' + voiceKbpJson(); }
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
    const modeRu = function (m) { return m === 'all' ? 'всё, что слышит клиент (рядом, рация, телефон, общий канал)' : 'только те, кто рядом'; };

    // ── Текущий выбор по состоянию мода: 'off' | 'near' | 'all' | null (мод не отвечает / ещё не спрашивали) ──
    function cur() {
        const st = S.st;
        if (!st || S.down) return null;
        return st.tg === 1 ? (st.mode === 'all' ? 'all' : 'near') : 'off';
    }
    // Кнопка в «Управлении» — как в «Функциях»: 🟢/🔴 и цвет по состоянию
    function btnText() {
        const c = cur();
        if (c === null) return S.down ? '🎙 Голос TG: мод не отвечает' : '🎙 Голос TG …';
        if (c === 'off') return '🎙 Голос TG 🔴';
        return '🎙 Голос TG 🟢 ' + (c === 'all' ? 'всё' : 'рядом');
    }
    function btnStyle() { const c = cur(); return c === null ? undefined : (c === 'off' ? 'danger' : 'success'); }
    function mkBtn(text, data, style) { const b = { text: text, callback_data: data }; if (style) b.style = style; return b; }
    const scopeRu = function (s) { return s === 'global' ? '👥 Для всех аккаунтов' : '👤 Для этого аккаунта'; };
    function scopeOf(chatId, messageId) { return S.scope[key(chatId, messageId)] === 'global' ? 'global' : 'local'; }

    // ── Шаг 1: «Для кого применить?» (как у уведомлений и функций) ──
    function scopeText() { return '🎙 <b>Голос в Telegram</b>\n\nДля кого применить изменения?'; }
    function scopeKb() {
        return {
            inline_keyboard: [
                [mkBtn('👤 Для этого аккаунта', 'voice_open_local_' + uniqueId, 'primary'), mkBtn('👥 Для всех аккаунтов', 'voice_open_global_' + uniqueId, 'primary')],
                [mkBtn('⬅️ Вернуться назад', 'show_controls_' + uniqueId)]
            ]
        };
    }
    function openScope(chatId, messageId) {
        if (stale()) return;
        const text = scopeText(), kb = scopeKb();
        S.shown[key(chatId, messageId)] = text + JSON.stringify(kb);
        editMessageText(chatId, messageId, text, kb);
    }

    // ── Шаг 2: настройки (правим то же сообщение). Кнопки-переключатели с состоянием, без отдельных «Включить/Выключить» ──
    function menuText(note, scope) {
        const c = cur(), st = S.st;
        let t = '🎙 <b>Голос в Telegram — ' + esc(displayName) + '</b>\n' + scopeRu(scope) + '\n\n';
        if (c === null) t += S.down ? 'Мод голоса: <b>не отвечает</b>\n' : 'Состояние: <i>проверяю…</i>\n';
        else {
            t += 'Отправка: ' + (c === 'off' ? '🔴 <b>ВЫКЛ</b>' : '🟢 <b>ВКЛ</b>') + '\n';
            if (c !== 'off') t += 'Слышно: <b>' + modeRu(st.mode) + '</b>\n';
        }
        t += '\n👥 <b>Рядом</b> — только те, кто рядом\n🌐 <b>Всё</b> — всё, что слышит клиент (рация, телефон, общий канал)\n';
        if (scope === 'global') t += '\n<i>Нажатие применится у всех аккаунтов (выше — состояние этого).</i>\n';
        if (st && !S.down && !(st.kb >= 1)) t += '\n⚠️ <i>Сборка клиента без кнопок под голосовыми — нужен обновлённый hassle_voice.c.</i>\n';
        if (note) t += '\n' + note + '\n';
        t += '\n<i>Свои слова не пишутся — голос с вашего микрофона обратно не приходит.</i>';
        return t;
    }
    function menuKb(scope) {
        const c = cur(), s = scope === 'global' ? 'global' : 'local', u = uniqueId;
        const act = function (choice) { return 'voice_do_' + s + '_' + choice + '_' + u; };
        const rows = [];
        // одна кнопка вместо пары «Включить / Выключить»: показывает состояние и переключает
        if (c === null) rows.push([mkBtn(S.down ? '⚠️ Мод не отвечает — повторить' : '⏳ Проверяю мод…', 'voice_refresh_' + s + '_' + u, S.down ? 'danger' : undefined)]);
        else if (c === 'off') rows.push([mkBtn('🔴 Отправка в Telegram: ВЫКЛ', act(want.mode === 'all' ? 'all' : 'near'), 'danger')]);
        else rows.push([mkBtn('🟢 Отправка в Telegram: ВКЛ', act('off'), 'success')]);
        // режим: выбранный — зелёный; нажатие на любой включает отправку в этом режиме
        rows.push([
            mkBtn((c === 'near' ? '🟢 ' : '👥 ') + 'Рядом', act('near'), c === 'near' ? 'success' : undefined),
            mkBtn((c === 'all' ? '🟢 ' : '🌐 ') + 'Всё', act('all'), c === 'all' ? 'success' : undefined)
        ]);
        rows.push([mkBtn('🔄 Обновить', 'voice_refresh_' + s + '_' + u), mkBtn('⬅️ Назад', 'voice_menu_' + u)]);
        return { inline_keyboard: rows };
    }
    // Сообщение сейчас показывает наши НАСТРОЙКИ? (Code.js запоминает последнюю клавиатуру в _ctl.kb.)
    // Нет записи — считаем, что да (иначе после перезапуска кнопка «молчала» бы).
    function onSettings(chatId, messageId) {
        try {
            const raw = _ctl.kb[key(chatId, messageId)];
            return !raw || raw.indexOf('voice_do_') >= 0;
        } catch (e) { return true; }
    }
    function render(chatId, messageId, note, force) {
        const sc = scopeOf(chatId, messageId);
        const text = menuText(note, sc), kb = menuKb(sc);
        const k = key(chatId, messageId), sig = text + JSON.stringify(kb);
        if (!force && S.shown[k] === sig) return;   // ничего не поменялось — Telegram не дёргаем
        S.shown[k] = sig;
        const ks = Object.keys(S.shown);
        if (ks.length > 100) ks.slice(0, 50).forEach(function (x) { delete S.shown[x]; delete S.scope[x]; });
        editMessageText(chatId, messageId, text, kb);
    }
    // Итог операции: в настройках (если пользователь ещё в них), а у вызова без сообщения (__voiceSet, broadcast) — отдельным сообщением
    function report(chatId, messageId, note) {
        if (messageId) { if (onSettings(chatId, messageId)) render(chatId, messageId, note, true); }
        else say(chatId, head() + note);
    }
    // Открыть/обновить настройки: сразу рисуем, что есть, затем уточняем по свежему статусу
    function openMenu(chatId, messageId, forceFresh) {
        if (stale()) return;
        const fresh = S.st && !S.down && Date.now() - S.stAt < FRESH_MS && !forceFresh;
        render(chatId, messageId, fresh ? '' : '⏳ проверяю мод…', true);
        if (fresh) return;
        status(function () {
            if (stale() || !onSettings(chatId, messageId)) return;
            render(chatId, messageId, '', false);
        });
    }

    function whenOurs(chatId, messageId, fn) {
        if (stale()) return;
        const go = function () {
            if (stale()) return;
            if (!oursNow()) return report(chatId, messageId, '❌ Клиент не наш — мода голоса нет.');
            fn();
        };
        // определение клиента ещё идёт (до 90 с после старта игры) — дожидаемся результата
        if (window.KONSTT_CLIENT && window.KONSTT_CLIENT.ours === null && typeof window.konsttWhenChecked === 'function') window.konsttWhenChecked().then(go, go);
        else go();
    }
    function guard(chatId, messageId) {
        if (S.busy && Date.now() - S.busyAt < 30000) { report(chatId, messageId, '⏳ уже выполняется, подождите пару секунд'); return false; }
        S.busy = true; S.busyAt = Date.now();
        return true;
    }

    // ── Выбор в подменю: off | near | all ──
    function choose(chatId, messageId, choice) {
        whenOurs(chatId, messageId, function () {
            if (!guard(chatId, messageId)) return;
            if (messageId) render(chatId, messageId, '⏳ применяю…', true);
            else tgApi('sendChatAction', { chat_id: chatId, action: 'typing' });
            let over = false;   // операция завершена (итог показан) — сторож ниже молчит
            const done = function (note) { if (over) return; over = true; S.busy = false; report(chatId, messageId, note); };
            const bad = function (why) { if (over) return; over = true; debugLog('[VOICE] ' + why); S.busy = false; report(chatId, messageId, '❌ ' + why); };
            // что бы ни зависло по дороге, «⏳ применяю…» не остаётся навсегда
            later(function () { bad('Нет ответа от мода за 20 с. Нажмите «🔄 Обновить» и попробуйте ещё раз.'); }, 20000);
            // любая ошибка внутри цепочки снимает «занято» и показывается в подменю — кнопки не залипают
            const sf = function (fn) { return function () { try { fn.apply(null, arguments); } catch (e) { bad('Внутренняя ошибка: ' + esc(e && e.message ? e.message : e)); } }; };

            status(sf(function (e) {
                if (stale()) { S.busy = false; return; }
                if (e) return bad(NO_MOD);
                const base = S.base;

                if (choice === 'off') {
                    return cfg(base, 'tg=0', sf(function (err) {
                        if (stale()) { S.busy = false; return; }
                        if (err) return bad(err);
                        want.tg = 0; wantSave(want);
                        status(sf(function () {
                            if (stale()) { S.busy = false; return; }
                            done('отправка в Telegram <b>выключена</b>\n<i>запись в файлы на устройстве идёт как шла (/voice off в игре — остановить)</i>');
                        }));
                    }));
                }

                const q = cfgQuery();
                if (!q) return bad('Нет токена бота или чата — нечего передать моду.');
                cfg(base, q + '&mode=' + choice + '&tg=1', sf(function (err) {
                    if (stale()) { S.busy = false; return; }
                    if (err) return bad(err);
                    want.tg = 1; want.mode = choice; wantSave(want);
                    pushKb(base);   // кнопки под голосовыми — отдельно и без ожидания
                    // Запись и перехват включает поток мода по заявке — ждём, пока перехват встанет и применится режим
                    const t0 = Date.now();
                    const check = function () {
                        status(sf(function (e2, st) {
                            if (stale()) { S.busy = false; return; }
                            if (!e2 && st.hooked === 1 && st.tg === 1 && st.mode === choice) {
                                return done('✅ применено: <b>' + (choice === 'all' ? 'всё' : 'рядом') + '</b>');
                            }
                            if (Date.now() - t0 > 6000) {
                                if (!e2 && st.hooked === 1 && st.tg === 1) return done('⚠️ мод пока сообщает другой режим — нажмите «🔄 Обновить»');
                                cfg(base, 'tg=0', function () {});
                                want.tg = 0; wantSave(want);
                                return bad('Перехват голоса не встал за 6 с (поддерживается только arm64). Причина — в konstt.log, строки «voice:». Отправку выключил.');
                            }
                            later(check, 400);
                        }));
                    };
                    later(check, 300);
                }));
            }));
        });
    }

    // ── «Для всех аккаунтов»: у себя применяем сразу, остальным — broadcast (беседа + BroadcastChannel, как у уведомлений и собеса) ──
    function setGlobal(chatId, messageId, choice) {
        S.lastBc = { val: choice, t: Date.now() };   // эхо своего же broadcast второй раз не применять
        choose(chatId, messageId, choice);
        try {
            if (typeof broadcastGlobalCommand === 'function') broadcastGlobalCommand('voice_set', choice);
            else debugLog('[VOICE] broadcastGlobalCommand не найден — другим аккаунтам не отправлено');
        } catch (e) { debugLog('[VOICE] broadcast: ' + (e && e.message)); }
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
                if (err) return cb && cb(err);
                S.synced = true;
                pushKb(S.base, function () { cb && cb(null); });   // ошибка кнопок не мешает: watch() повторит
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
        if (!S.synced || S.down || (S.st && S.st.cfg !== 1) || voiceKbSig() !== S.kbSig) syncOnce(function () { done(); }); else done();
    }

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

    // ── Перехват 1: кнопка в меню «Управление» ──
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
    // Ставит ОДНУ кнопку «🎙 Голос TG: …». Если голосовая строка уже есть (старая клавиатура из _ctl.kb, фоновое обновление welcome) —
    // заменяем её свежей, а не оставляем как есть: именно из-за этого подписи раньше «залипали».
    function withVoiceButtons(kb) {
        try {
            if (!oursNow() || !isControlsMenu(kb)) return kb;
            const isVoiceRow = function (row) { return (row || []).some(function (b) { return cbOf(b).indexOf('voice_') === 0; }); };
            const rows = kb.inline_keyboard.filter(function (row) { return !isVoiceRow(row); });
            // ставим после «Инфо об аккаунте» и (если есть) после «📸 Скрин»
            let at = -1;
            rows.forEach(function (row, i) { if ((row || []).some(function (b) { const d = cbOf(b); return d.indexOf('local_account_info_') === 0 || d.indexOf('screen_shot_') === 0; })) at = i; });
            rows.splice(at >= 0 ? at + 1 : rows.length - 1, 0, [mkBtn(btnText(), 'voice_menu_' + uniqueId, btnStyle())]);
            const out = {}; for (const k in kb) out[k] = kb[k];
            out.inline_keyboard = rows;
            return out;
        } catch (e) { debugLog('[VOICE] кнопка не добавлена: ' + (e && e.message)); return kb; }
    }
    // Меню «Управление» уже на экране с подписью из кэша → уточняем по живому состоянию мода и, если подпись изменилась,
    // правим только клавиатуру этого сообщения (если пользователь ещё в «Управлении»).
    function refreshControls(chatId, messageId) {
        if (stale() || !oursNow()) return;
        if (S.st && !S.down && Date.now() - S.stAt < FRESH_MS) return;
        status(function () {
            if (stale()) return;
            try {
                const raw = _ctl.kb[key(chatId, messageId)];
                if (!raw || raw.indexOf('voice_menu_') < 0) return;   // сообщение уже не в «Управлении»
                const next = withVoiceButtons(JSON.parse(raw));
                if (JSON.stringify(next) === raw) return;
                editMessageReplyMarkup(chatId, messageId, next);
            } catch (e) { debugLog('[VOICE] обновление подписи: ' + (e && e.message)); }
        });
    }

    // ── Перехват 2: нажатие кнопки ──
    // Свой чат и свой аккаунт проверяем сами (в обход processUpdates), остальное отдаём Code.js как есть.
    // Старые сообщения с прежними кнопками (voice_tg_ / voice_mode_) тоже открывают подменю.
    function parseCb(u) {
        const cq = u && u.callback_query;
        if (!cq || typeof cq.data !== 'string') return null;
        const d = cq.data;
        let kind = null, arg = null, scope = 'local';
        const test = function (pre, k, a, sc) { if (kind === null && d.indexOf(pre) === 0 && d.slice(pre.length) === uniqueId) { kind = k; arg = a; if (sc) scope = sc; } };
        // с выбором «этот аккаунт / все аккаунты»
        test('voice_open_local_', 'open', null, 'local'); test('voice_open_global_', 'open', null, 'global');
        test('voice_refresh_local_', 'refresh', null, 'local'); test('voice_refresh_global_', 'refresh', null, 'global');
        ['local', 'global'].forEach(function (sc) { ['off', 'near', 'all'].forEach(function (c) { test('voice_do_' + sc + '_' + c + '_', 'set', c, sc); }); });
        // прежние кнопки (старые сообщения): открывают выбор охвата, «Обновить» и «выбор режима» — для этого аккаунта
        test('voice_menu_', 'menu'); test('voice_tg_', 'menu'); test('voice_mode_', 'menu');
        test('voice_refresh_', 'refresh', null, 'local');
        ['off', 'near', 'all'].forEach(function (c) { test('voice_set_' + c + '_', 'set', c, 'local'); });
        if (!kind) return null;
        if (!(cq.message && cq.message.chat && config.chatIds.includes(String(cq.message.chat.id)))) return null;
        return { kind: kind, arg: arg, scope: scope, chatId: cq.message.chat.id, messageId: cq.message.message_id };
    }
    function isMine(u) { return parseCb(u) !== null; }

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
            if (replyMarkup && oursNow() && isControlsMenu(replyMarkup)) {
                replyMarkup = withVoiceButtons(replyMarkup);
                later(function () { refreshControls(chatId, messageId); }, 0);   // после orig: он запомнит клавиатуру в _ctl.kb
            }
            return orig.apply(this, [chatId, messageId, text, replyMarkup].concat(Array.prototype.slice.call(arguments, 4)));
        };
    });
    // editMessageText у голосового (текста нет) Telegram отклоняет — правим подпись (caption). Остальная логика Code.js (_ctl.kb, «Назад») остаётся.
    hook('tgApi', function () { return tgApi; }, function (f) { tgApi = f; }, function (orig) {
        return function (method, payload) {
            try {
                if (method === 'editMessageText' && payload && S.voiceKeys[key(payload.chat_id, payload.message_id)]) {
                    let cap = String(payload.text == null ? '' : payload.text);
                    if (cap.length > 1000) cap = '⚙️ <b>' + esc(displayName) + '</b>';   // у подписи лимит 1024 знака: длинное меню не влезает — кнопки важнее текста
                    const p = { chat_id: payload.chat_id, message_id: payload.message_id, caption: cap, parse_mode: payload.parse_mode, reply_markup: payload.reply_markup };
                    return orig.apply(this, ['editMessageCaption', p].concat(Array.prototype.slice.call(arguments, 2)));
                }
            } catch (e) { debugLog('[VOICE] caption: ' + (e && e.message)); }
            return orig.apply(this, arguments);
        };
    });
    // Нажатие под голосовым: запоминаем сообщение (для caption) и после паузы/авторизации отдаём моду свежую клавиатуру
    function noteVoiceUpdates(updates) {
        let resync = false;
        updates.forEach(function (u) {
            const cq = u && u.callback_query, m = cq && cq.message;
            if (!m || !m.chat) return;
            if (m.voice || m.audio) {
                S.voiceKeys[key(m.chat.id, m.message_id)] = 1;
                const ks = Object.keys(S.voiceKeys);
                if (ks.length > 300) ks.slice(0, 100).forEach(function (x) { delete S.voiceKeys[x]; });
            }
            if (typeof cq.data === 'string' && /^(pause_|autologin_)/.test(cq.data)) resync = true;
        });
        if (resync) later(function () { if (oursNow() && S.base) syncOnce(); }, 1500);
    }
    hook('processUpdates', function () { return processUpdates; }, function (f) { processUpdates = f; }, function (orig) {
        return function (updates) {
            if (stale()) return;
            try { if (Array.isArray(updates)) noteVoiceUpdates(updates); } catch (e) { debugLog('[VOICE] noteVoiceUpdates: ' + (e && e.message)); }
            try {
                if (Array.isArray(updates) && updates.some(isMine)) {
                    const rest = [];
                    updates.forEach(function (u) {
                        const c = parseCb(u);
                        if (!c) { rest.push(u); return; }
                        try { answerCallbackQuery(u.callback_query.id); } catch (e) {}
                        try { _mvUntrackMenu(c.chatId, c.messageId); } catch (e) {}   // ушли из меню движения — не перерисовывать его поверх
                        if (c.kind === 'menu') { openScope(c.chatId, c.messageId); return; }
                        S.scope[key(c.chatId, c.messageId)] = c.scope;   // в каком охвате открыты настройки этого сообщения
                        if (c.kind === 'set') { if (c.scope === 'global') setGlobal(c.chatId, c.messageId, c.arg); else choose(c.chatId, c.messageId, c.arg); }
                        else openMenu(c.chatId, c.messageId, c.kind === 'refresh');
                    });
                    // lastUpdateId двигает вызывающий (checkTelegramCommands) — пустой список отдавать дальше незачем
                    if (!rest.length) return;
                    updates = rest;
                }
            } catch (e) { debugLog('[VOICE] processUpdates: ' + (e && e.message)); }
            return orig.apply(this, [updates].concat(Array.prototype.slice.call(arguments, 1)));
        };
    });

    // Команда «для всех аккаунтов»: voice_set = off | near | all. Остальные команды отдаём дальше (Code.js / Code2.js).
    hook('handleGlobalBroadcastCommand', function () { return handleGlobalBroadcastCommand; }, function (f) { handleGlobalBroadcastCommand = f; }, function (orig) {
        return function (cmd, val, fromBroadcast) {
            if (cmd !== 'voice_set' || S.dead) return orig.apply(this, arguments);
            try {
                if (stale()) return;
                const choice = (val === 'off' || val === 'near' || val === 'all') ? val : null;
                if (!choice) { debugLog('[VOICE] [GLOBAL] неизвестное значение voice_set = ' + val); return; }
                const now = Date.now();
                if (S.lastBc && S.lastBc.val === choice && now - S.lastBc.t < 4000) { debugLog('[VOICE] [GLOBAL] дубль voice_set = ' + choice + ' — пропущен'); return; }   // эхо (беседа + BroadcastChannel)
                S.lastBc = { val: choice, t: now };
                if (window.KONSTT_CLIENT && window.KONSTT_CLIENT.ours === false) { debugLog('[VOICE] [GLOBAL] клиент не наш — пропущено'); return; }
                const chat = (config.chatIds && config.chatIds[0]) ? config.chatIds[0] : null;
                if (!chat) return;
                const run = function (tries) {
                    if (stale()) return;
                    if (S.busy && Date.now() - S.busyAt < 30000) {   // предыдущее применение ещё идёт — подождём, а не молчим
                        if (tries < 3) later(function () { run(tries + 1); }, 3000);
                        else debugLog('[VOICE] [GLOBAL] занято — voice_set = ' + choice + ' не применён');
                        return;
                    }
                    choose(chat, null, choice);   // итог — отдельным сообщением с ником (как у остальных глобальных команд)
                };
                run(0);
            } catch (e) { debugLog('[VOICE] [GLOBAL] ' + (e && e.message)); }
        };
    });

    window.__voiceSet = function (chatId, on) { choose(chatId, null, on ? want.mode : 'off'); };
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
