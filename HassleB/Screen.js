// ╔══════════════════════════════════════════════════════════╗
// ║  Screen.js — «📸 Скрин» в Telegram: ВСЁ в одном файле    ║
// ║  Снимок кадра игры уходит в Telegram.                    ║
// ║                                                          ║
// ║  Code.js править НЕ нужно (годится версия без скрина).   ║
// ║  Load.js подклеивает этот файл как Near.js: он           ║
// ║  выполняется в области видимости Code.js и сам ставит    ║
// ║  два перехвата:                                          ║
// ║   • editMessageText — добавляет кнопку «📸 Скрин» в меню ║
// ║     «Управление», но ТОЛЬКО если клиент наш              ║
// ║     (KONSTT_CLIENT.ours === true; на стоке мода нет);    ║
// ║   • processUpdates — ловит нажатие screen_shot_<uid>,    ║
// ║     проверяет чат и аккаунт и запускает скрин.           ║
// ║  Нужны из Code.js: config, uniqueId, displayName,        ║
// ║  debugLog, tgApi, sendChatInput, answerCallbackQuery,    ║
// ║  __hassleStale, editMessageText, processUpdates.         ║
// ║                                                          ║
// ║  Кто что делает                                          ║
// ║   • Кадр снимает МОД (hassle_screen.c): Unity-кадр с 3D, ║
// ║     HUD и чатом из JS не достать.                        ║
// ║   • Отправляет в Telegram тоже МОД (JNI → HttpURLConn.): ║
// ║     WebView игры (Cohtml) не умеет бинарный POST — ни    ║
// ║     FormData, ни Blob, ни ArrayBuffer; игра сама делает  ║
// ║     только GET-XHR. Строка в XHR уходит как UTF-8, а в   ║
// ║     PNG байты ≥0x80 — картинка ломается.                 ║
// ║   • Здесь: кнопка, перехваты и оркестрация (заявка →     ║
// ║     снимок → команда «отправь» → результат → ошибка).    ║
// ║                                                          ║
// ║  📺 Live: кнопка рядом со «Скрин» — одно сообщение с     ║
// ║  фото, картинка в нём заменяется (editMessageText-стиль, ║
// ║  editMessageMedia на стороне мода) примерно раз в 4 с;   ║
// ║  кнопка «⏹ Стоп» под фото; сам гаснет через 5 минут.     ║
// ║  Кадр Live меньше (854x480), чтобы игра не тормозила.    ║
// ║                                                          ║
// ║  Экспорт: window.__screenTake(chatId)                    ║
// ║           window.__screenLive(chatId)  /  __screenLiveStop() ║
// ║           window.takeScreenshotToTelegram(chatId)        ║
// ║           window.__screenCleanup()  (зовёт Load.js)      ║
// ╚══════════════════════════════════════════════════════════╝
(function () {
    'use strict';

    // Если предыдущая копия ещё жива (повторный eval без cleanup) — гасим её опросы.
    try { if (typeof window.__screenCleanup === 'function') window.__screenCleanup(); } catch (e) {}

    const PORT_FIRST = 17781, PORT_COUNT = 10;            // порты мода (Near занимает 17771..17780)
    const LIVE_EVERY = 4000;           // период кадров Live, мс (Telegram не любит частые правки)
    const LIVE_MAX = 5 * 60 * 1000;    // Live сам выключается через это время
    const STALE = '__stale__';         // «скрипт перезагружен» — молча выходим
    const S = { base: null, busy: false, busyAt: 0, dead: false, timers: [], live: null };

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

    // Ищем порт мода (как Near.js): сначала запомненный, затем 17781..17790.
    function findBase(cb) {
        const probe = function (i) {
            if (i >= PORT_COUNT) return cb('nobase');
            const base = 'http://127.0.0.1:' + (PORT_FIRST + i);
            get(base + '/screen/status', 800, function (e, t) {
                const j = parse(t);
                if (!e && j && j.v === 1) { S.base = base; cb(null, base); } else probe(i + 1);
            });
        };
        if (S.base) {
            get(S.base + '/screen/status', 1500, function (e) {
                if (!e) return cb(null, S.base);
                S.base = null; probe(0);
            });
        } else probe(0);
    }

    // Снимок: заявка моду → ждём, пока вырастет seq. cb(ошибка|null). live — кадр поменьше для Live.
    function capture(base, live, cb) {
        get(base + '/screen/status', 3000, function (e1, t1) {
            const st0 = parse(t1);
            if (stale()) return cb(STALE);
            if (e1 || !st0) return cb('Не удалось получить статус мода скрина (' + (e1 || 'ответ не JSON') + ')');
            const poll = function (since, maxMs) {
                get(base + '/screen/status', 2500, function (e3, t3) {
                    if (stale()) return cb(STALE);
                    const s = parse(t3);
                    if (s && s.seq > st0.seq) return cb(null);
                    if (s && s.fails > st0.fails) return cb('Снимок не вышел (подробности в чате игры и в konstt.log, строки «скрин:»)');
                    if (Date.now() - since > maxMs) return cb('Снимок не готов за ' + Math.round(maxMs / 1000) + ' с — кадр не отрисовывался (игра свёрнута или зависла?)');
                    later(function () { poll(since, maxMs); }, 250);
                });
            };
            get(base + '/screen/shot?delay=0' + (live ? '&live=1' : ''), 3000, function (e2, t2) {
                if (stale()) return cb(STALE);
                const r = parse(t2);
                if (e2 || !r) return cb('Мод не принял заявку на снимок (' + (e2 || 'ответ не JSON') + ')');
                if (!r.ok && r.err === 'busy') return cb('Мод ещё делает предыдущий снимок, попробуйте через пару секунд');
                if (!r.ok && r.err === 'need_cmd') {
                    // первый снимок после запуска игры: подписку на кадр делает только команда /screen (главный поток игры)
                    try { sendChatInput('/screen 0'); } catch (x) { return cb('Не удалось отправить /screen 0 в чат игры: ' + x.message); }
                    return poll(Date.now(), 12000);
                }
                if (!r.ok) return cb('Мод отказал: ' + (r.err || '?'));
                poll(Date.now(), 10000);
            });
        });
    }

    // Отправка последнего снимка модом. opts: { mid — заменить картинку в этом сообщении, kb — inline-клавиатура (объект), live }.
    // cb(ошибка|null, message_id). Единственное место, где PNG покидает игру.
    function upload(base, chatId, opts, cb) {
        const d = new Date(), p2 = function (n) { return (n < 10 ? '0' : '') + n; };
        const caption = (opts.live ? '📺 <b>' : '📸 <b>') + displayName + '</b> · ' + p2(d.getHours()) + ':' + p2(d.getMinutes()) + ':' + p2(d.getSeconds()) + (opts.live ? ' · live' : '');
        // токен в лог не пишем: URL не логируем
        let url = base + '/screen/tg?k=' + encodeURIComponent(config.botToken) + '&c=' + encodeURIComponent(String(chatId)) + '&doc=0&cap=' + encodeURIComponent(caption);
        if (opts.mid) url += '&m=' + opts.mid;
        if (opts.kb) {
            // в моде кнопки идут обычным текстом: не-ASCII в JSON записываем как \uXXXX
            const js = JSON.stringify(opts.kb).replace(/[\u0080-\uffff]/g, function (c) { return '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4); });
            url += '&kb=' + encodeURIComponent(js);
        }
        const pollTg = function (id, since) {
            get(base + '/screen/tgstatus', 2500, function (e6, t6) {
                if (stale()) return cb(STALE);
                const s6 = parse(t6);
                if (s6 && s6.id === id && s6.state === 2) return cb(null, s6.mid || opts.mid || 0);
                if (s6 && s6.id === id && s6.state === 3) {
                    if (opts.mid && /not modified/i.test(String(s6.msg || ''))) return cb(null, opts.mid);   // кадр не изменился — не беда
                    return cb('Telegram не принял картинку' + (s6.code ? ' (' + s6.code + ')' : '') + '\n' + esc(s6.msg || 'причина — в konstt.log, строки «скрин:»'));
                }
                if (Date.now() - since > 90000) return cb('Отправка в Telegram не завершилась за 90 с');
                later(function () { pollTg(id, since); }, 400);
            });
        };
        get(url, 5000, function (e4, t4) {
            if (stale()) return cb(STALE);
            const r4 = parse(t4);
            if (e4 || !r4) return cb('Мод не принял отправку в Telegram (' + (e4 || 'ответ не JSON') + '). Нужна свежая сборка клиента с обновлённым hassle_screen.c.');
            if (!r4.ok) return cb(r4.err === 'busy' ? 'Мод ещё отправляет предыдущий снимок, попробуйте через пару секунд'
                : r4.err === 'no_snapshot' ? 'У мода нет готового снимка'
                : 'Мод отказал в отправке: ' + (r4.err || '?'));
            pollTg(r4.id, Date.now());
        });
    }

    function busyNow() { return S.busy && Date.now() - S.busyAt < 120000; }

    function run(chatId) {
        if (stale()) return;
        if (busyNow()) {
            tgApi('sendMessage', { chat_id: chatId, text: '⏳ <b>' + displayName + '</b>: ' + (S.live ? 'идёт Live — сначала нажмите «⏹ Стоп»' : 'скрин уже делается'), parse_mode: 'HTML', disable_notification: true });
            return;
        }
        S.busy = true; S.busyAt = Date.now();
        const finish = function () { S.busy = false; };
        const fail = function (why) {
            finish();
            if (why === STALE) return;
            debugLog('[SCREEN] ' + why);
            tgApi('sendMessage', { chat_id: chatId, text: '❌ <b>Скрин ' + displayName + '</b>\n' + why, parse_mode: 'HTML' });
        };
        tgApi('sendChatAction', { chat_id: chatId, action: 'upload_photo' });
        findBase(function (e, base) {
            if (stale()) { finish(); return; }
            if (e) return fail('Мод скрина в клиенте не отвечает. Нужна сборка клиента с hassle_screen.c, а игра должна быть запущена и загружена.');
            capture(base, false, function (ec) {
                if (ec) return fail(ec);
                upload(base, chatId, {}, function (eu) {
                    if (eu) return fail(eu);
                    finish(); debugLog('[SCREEN] отправлено модом в Telegram');
                });
            });
        });
    }

    // ── 📺 Live: одно сообщение, картинка в нём заменяется каждые LIVE_EVERY мс ──
    function liveKb() { return { inline_keyboard: [[{ text: '⏹ Стоп', callback_data: 'screen_stop_' + uniqueId }]] }; }

    // Конец Live: убираем кнопку и пишем причину в подписи (если сообщение уже есть), иначе — обычным сообщением. Повторный вызов безопасен.
    function liveEnd(L, reason, isErr) {
        if (!L || L.ended) return;
        L.ended = true;
        if (S.live === L) S.live = null;
        S.busy = false;
        debugLog('[SCREEN] Live закончен: ' + reason + ' (кадров: ' + L.frames + ')');
        if (stale()) return;
        const text = (isErr ? '❌ ' : '⏹ ') + reason;
        if (L.mid) {
            tgApi('editMessageCaption', { chat_id: L.chatId, message_id: L.mid, caption: '📺 <b>' + displayName + '</b> · ' + text, parse_mode: 'HTML', reply_markup: { inline_keyboard: [] } });
        } else if (isErr) {
            tgApi('sendMessage', { chat_id: L.chatId, text: '❌ <b>Live ' + displayName + '</b>\n' + esc(reason), parse_mode: 'HTML' });
        }
    }

    function liveLoop(L, base) {
        if (stale()) return liveEnd(L, 'скрипт перезагружен', false);
        if (L.ended || S.live !== L) return;
        if (L.stop) return liveEnd(L, 'Live остановлен', false);
        if (Date.now() > L.until) return liveEnd(L, 'Live завершён (лимит ' + Math.round(LIVE_MAX / 60000) + ' мин) — нажмите «📺 Live», чтобы продолжить', false);
        const t0 = Date.now();
        S.busyAt = t0;
        const next = function () { later(function () { liveLoop(L, base); }, Math.max(500, LIVE_EVERY - (Date.now() - t0))); };
        const oops = function (why) {
            L.errs++;
            debugLog('[SCREEN] Live: ' + why);
            if (L.errs >= 3) return liveEnd(L, 'Live остановлен: ' + why, true);
            next();
        };
        capture(base, true, function (ec) {
            if (ec === STALE) return liveEnd(L, 'скрипт перезагружен', false);
            if (L.ended || S.live !== L) return;
            if (ec) return oops(ec);
            upload(base, L.chatId, { live: true, mid: L.mid, kb: liveKb() }, function (eu, mid) {
                if (eu === STALE) return liveEnd(L, 'скрипт перезагружен', false);
                if (L.ended || S.live !== L) return;
                if (eu) {
                    // сообщение удалили вручную — Live закончен без шума
                    if (L.mid && /message to edit not found|MESSAGE_ID_INVALID|message can't be edited/i.test(eu)) { L.mid = 0; return liveEnd(L, 'сообщение удалено', false); }
                    return oops(eu);
                }
                L.errs = 0; L.frames++;
                if (!L.mid && mid) L.mid = mid;
                next();
            });
        });
    }

    function liveStart(chatId) {
        if (stale()) return;
        if (S.live) {
            tgApi('sendMessage', { chat_id: chatId, text: '⏳ <b>' + displayName + '</b>: Live уже идёт — кнопка «⏹ Стоп» под фото', parse_mode: 'HTML', disable_notification: true });
            return;
        }
        if (busyNow()) {
            tgApi('sendMessage', { chat_id: chatId, text: '⏳ <b>' + displayName + '</b>: скрин уже делается, попробуйте через пару секунд', parse_mode: 'HTML', disable_notification: true });
            return;
        }
        const L = { chatId: chatId, mid: 0, stop: false, ended: false, errs: 0, frames: 0, until: Date.now() + LIVE_MAX };
        S.live = L; S.busy = true; S.busyAt = Date.now();
        tgApi('sendChatAction', { chat_id: chatId, action: 'upload_photo' });
        findBase(function (e, base) {
            if (stale()) { liveEnd(L, 'скрипт перезагружен', false); return; }
            if (e) return liveEnd(L, 'Мод скрина в клиенте не отвечает. Нужна сборка клиента с hassle_screen.c, а игра должна быть запущена и загружена.', true);
            liveLoop(L, base);
        });
    }
    function liveStop() { const L = S.live; if (L) { L.stop = true; liveEnd(L, 'Live остановлен', false); } }

    // ── Вход: скрин делает мод нашего клиента; на обычном клиенте — отказ (например, по кнопке из старого сообщения) ──
    function oursNow() { return !!(window.KONSTT_CLIENT && window.KONSTT_CLIENT.ours === true); }
    function say(chatId, why) {
        tgApi('sendMessage', { chat_id: chatId, text: '❌ <b>Скрин ' + displayName + '</b>\n' + why, parse_mode: 'HTML' });
    }
    function take(chatId, live) {
        if (stale()) return;
        const go = function () {
            if (stale()) return;
            if (!oursNow()) return say(chatId, 'Клиент не наш — мода скрина нет.');
            if (live) liveStart(chatId); else run(chatId);
        };
        // определение клиента ещё идёт (до 90 с после старта игры) — дожидаемся результата
        if (window.KONSTT_CLIENT && window.KONSTT_CLIENT.ours === null && typeof window.konsttWhenChecked === 'function') window.konsttWhenChecked().then(go, go);
        else go();
    }

    // ── Перехват 1: кнопка в меню «Управление» ──
    // Меню узнаём по набору кнопок (скрин, как и раньше, стоит после «Инфо об аккаунте»).
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
    function withScreenButton(kb) {
        try {
            if (!oursNow() || !isControlsMenu(kb)) return kb;
            const rows = kb.inline_keyboard.slice();
            if (rows.some(function (row) { return (row || []).some(function (b) { return cbOf(b).indexOf('screen_shot_') === 0; }); })) return kb;
            const btn = [{ text: '📸 Скрин', callback_data: 'screen_shot_' + uniqueId }, { text: '📺 Live', callback_data: 'screen_live_' + uniqueId }];
            let at = -1;
            rows.forEach(function (row, i) { if ((row || []).some(function (b) { return cbOf(b).indexOf('local_account_info_') === 0; })) at = i; });
            rows.splice(at >= 0 ? at + 1 : rows.length - 1, 0, btn);
            const out = {}; for (const k in kb) out[k] = kb[k];
            out.inline_keyboard = rows;
            return out;
        } catch (e) { debugLog('[SCREEN] кнопка не добавлена: ' + (e && e.message)); return kb; }
    }

    // ── Перехват 2: нажатие кнопки ──
    // Свой чат и свой аккаунт проверяем сами (в обход processUpdates), остальное отдаём Code.js как есть.
    function actOf(d) { return ['screen_shot_', 'screen_live_', 'screen_stop_'].filter(function (p) { return d.indexOf(p) === 0; })[0] || null; }
    function isMine(u) {
        const cq = u && u.callback_query;
        if (!cq || typeof cq.data !== 'string') return false;
        const pre = actOf(cq.data);
        if (!pre || cq.data.slice(pre.length) !== uniqueId) return false;
        return !!(cq.message && cq.message.chat && config.chatIds.includes(String(cq.message.chat.id)));
    }

    const hooks = [];   // [{name, orig, wrapped}] — для cleanup
    function hook(name, getter, setter, make) {
        try {
            const orig = getter();
            if (typeof orig !== 'function') { debugLog('[SCREEN] не найдена функция ' + name + ' — перехват не поставлен'); return; }
            if (orig.__screenWrapped) return;
            const wrapped = make(orig);
            wrapped.__screenWrapped = true;
            setter(wrapped);
            hooks.push({ orig: orig, wrapped: wrapped, getter: getter, setter: setter });
        } catch (e) { console.warn('[SCREEN] перехват ' + name + ' не поставлен:', e && e.message); }
    }
    hook('editMessageText', function () { return editMessageText; }, function (f) { editMessageText = f; }, function (orig) {
        return function (chatId, messageId, text, replyMarkup) {
            if (replyMarkup) replyMarkup = withScreenButton(replyMarkup);
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
                        if (!isMine(u)) { rest.push(u); return; }
                        try { answerCallbackQuery(u.callback_query.id); } catch (e) {}
                        const act = actOf(u.callback_query.data);
                        if (act === 'screen_stop_') {
                            if (S.live) liveStop();
                            else {   // Live уже закончен, а кнопка осталась под старым фото — убираем её
                                const m = u.callback_query.message;
                                if (m && m.message_id) tgApi('editMessageReplyMarkup', { chat_id: m.chat.id, message_id: m.message_id, reply_markup: { inline_keyboard: [] } });
                            }
                        }
                        else take(u.callback_query.message.chat.id, act === 'screen_live_');
                    });
                    // lastUpdateId двигает вызывающий (checkTelegramCommands) — пустой список отдавать дальше незачем
                    if (!rest.length) return;
                    updates = rest;
                }
            } catch (e) { debugLog('[SCREEN] processUpdates: ' + (e && e.message)); }
            return orig.apply(this, [updates].concat(Array.prototype.slice.call(arguments, 1)));
        };
    });

    window.__screenTake = take;
    window.__screenLive = function (chatId) { take(chatId, true); };
    window.__screenLiveStop = liveStop;
    window.takeScreenshotToTelegram = take;
    window.__screenCleanup = function () {
        try { if (S.live) { S.live.stop = true; S.live.ended = true; S.live = null; } } catch (e) {}
        S.dead = true; S.busy = false;
        S.timers.forEach(function (id) { try { clearTimeout(id); } catch (e) {} });
        S.timers.length = 0;
        hooks.forEach(function (h) { try { if (h.getter() === h.wrapped) h.setter(h.orig); } catch (e) {} });
        hooks.length = 0;
        if (window.__screenTake === take) window.__screenTake = null;
        if (window.takeScreenshotToTelegram === take) window.takeScreenshotToTelegram = null;
        window.__screenLive = null; window.__screenLiveStop = null;
        window.__screenCleanup = null;
    };
    try { debugLog('[SCREEN] Screen.js загружен'); } catch (e) {}
})();
