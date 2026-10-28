// ╔══════════════════════════════════════════════════════════╗
// ║  Screen.js — кнопка «📸 Скрин» (Telegram → Управление)    ║
// ║  Снимок кадра игры уходит в Telegram.                    ║
// ║                                                          ║
// ║  Подключается Load.js так же, как Near.js: текст скрипта ║
// ║  дописывается к Code2 и выполняется в области видимости  ║
// ║  Code.js (видны config, displayName, debugLog, tgApi,    ║
// ║  sendChatInput, __hassleStale). Сломанный Screen.js      ║
// ║  остальное не ломает.                                    ║
// ║                                                          ║
// ║  Кто что делает                                          ║
// ║   • Кадр снимает МОД (hassle_screen.c): Unity-кадр с 3D, ║
// ║     HUD и чатом из JS не достать.                        ║
// ║   • Отправляет в Telegram тоже МОД (JNI → HttpURLConn.): ║
// ║     WebView игры (Cohtml) не умеет бинарный POST — ни    ║
// ║     FormData, ни Blob, ни ArrayBuffer; игра сама делает  ║
// ║     только GET-XHR. Строка в XHR уходит как UTF-8, а в   ║
// ║     PNG байты ≥0x80 — картинка ломается.                 ║
// ║   • Этот файл — только оркестрация: заявка → ожидание    ║
// ║     готового снимка → команда «отправь» → ожидание       ║
// ║     результата → сообщение об ошибке в Telegram.         ║
// ║                                                          ║
// ║  Экспорт: window.__screenTake(chatId)                    ║
// ║           window.takeScreenshotToTelegram(chatId)        ║
// ║           window.__screenCleanup()  (зовёт Load.js)      ║
// ╚══════════════════════════════════════════════════════════╝
(function () {
    'use strict';

    // Если предыдущая копия ещё жива (повторный eval без cleanup) — гасим её опросы.
    try { if (typeof window.__screenCleanup === 'function') window.__screenCleanup(); } catch (e) {}

    const PORT_FIRST = 17781, PORT_COUNT = 10;            // порты мода (Near занимает 17771..17780)
    const S = { base: null, busy: false, busyAt: 0, dead: false, timers: [] };

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

    function take(chatId) {
        if (stale()) return;
        if (S.busy && Date.now() - S.busyAt < 120000) {
            tgApi('sendMessage', { chat_id: chatId, text: '⏳ <b>' + displayName + '</b>: скрин уже делается', parse_mode: 'HTML', disable_notification: true });
            return;
        }
        S.busy = true; S.busyAt = Date.now();
        const finish = function () { S.busy = false; };
        const fail = function (why) {
            finish();
            debugLog('[SCREEN] ' + why);
            tgApi('sendMessage', { chat_id: chatId, text: '❌ <b>Скрин ' + displayName + '</b>\n' + why, parse_mode: 'HTML' });
        };
        tgApi('sendChatAction', { chat_id: chatId, action: 'upload_photo' });

        findBase(function (e, base) {
            if (stale()) { finish(); return; }
            if (e) return fail('Мод скрина в клиенте не отвечает. Нужна сборка клиента с hassle_screen.c, а игра должна быть запущена и загружена.');
            get(base + '/screen/status', 3000, function (e1, t1) {
                const st0 = parse(t1);
                if (stale()) { finish(); return; }
                if (e1 || !st0) return fail('Не удалось получить статус мода скрина (' + (e1 || 'ответ не JSON') + ')');

                // ── 3. Результат отправки модом в Telegram ──
                const pollTg = function (id, since) {
                    get(base + '/screen/tgstatus', 2500, function (e6, t6) {
                        if (stale()) { finish(); return; }
                        const s6 = parse(t6);
                        if (s6 && s6.id === id && s6.state === 2) { finish(); debugLog('[SCREEN] отправлено модом в Telegram'); return; }
                        if (s6 && s6.id === id && s6.state === 3) return fail('Telegram не принял картинку' + (s6.code ? ' (' + s6.code + ')' : '') + '\n' + esc(s6.msg || 'причина — в konstt.log, строки «скрин:»'));
                        if (Date.now() - since > 90000) return fail('Отправка в Telegram не завершилась за 90 с');
                        later(function () { pollTg(id, since); }, 400);
                    });
                };

                // ── 2. Команда моду «отправь последний снимок в Telegram» ──
                // Единственное место, где PNG покидает игру. Если когда-нибудь появится JS-способ бинарной отправки,
                // менять нужно только эту функцию.
                const upload = function () {
                    const d = new Date(), p2 = function (n) { return (n < 10 ? '0' : '') + n; };
                    const caption = '📸 <b>' + displayName + '</b> · ' + p2(d.getHours()) + ':' + p2(d.getMinutes()) + ':' + p2(d.getSeconds());
                    // токен в лог не пишем: URL не логируем
                    const url = base + '/screen/tg?k=' + encodeURIComponent(config.botToken) + '&c=' + encodeURIComponent(String(chatId)) + '&doc=0&cap=' + encodeURIComponent(caption);
                    get(url, 5000, function (e4, t4) {
                        if (stale()) { finish(); return; }
                        const r4 = parse(t4);
                        if (e4 || !r4) return fail('Мод не принял отправку в Telegram (' + (e4 || 'ответ не JSON') + '). Нужна свежая сборка клиента с обновлённым hassle_screen.c.');
                        if (!r4.ok) return fail(r4.err === 'busy' ? 'Мод ещё отправляет предыдущий снимок, попробуйте через пару секунд'
                            : r4.err === 'no_snapshot' ? 'У мода нет готового снимка'
                            : 'Мод отказал в отправке: ' + (r4.err || '?'));
                        pollTg(r4.id, Date.now());
                    });
                };

                // ── 1. Ждём готовый снимок: seq вырос — готов, fails вырос — не вышло ──
                const poll = function (since, maxMs) {
                    get(base + '/screen/status', 2500, function (e3, t3) {
                        if (stale()) { finish(); return; }
                        const s = parse(t3);
                        if (s && s.seq > st0.seq) return upload();
                        if (s && s.fails > st0.fails) return fail('Снимок не вышел (подробности в чате игры и в konstt.log, строки «скрин:»)');
                        if (Date.now() - since > maxMs) return fail('Снимок не готов за ' + Math.round(maxMs / 1000) + ' с — кадр не отрисовывался (игра свёрнута или зависла?)');
                        later(function () { poll(since, maxMs); }, 250);
                    });
                };

                get(base + '/screen/shot?delay=0', 3000, function (e2, t2) {
                    if (stale()) { finish(); return; }
                    const r = parse(t2);
                    if (e2 || !r) return fail('Мод не принял заявку на снимок (' + (e2 || 'ответ не JSON') + ')');
                    if (!r.ok && r.err === 'busy') return fail('Мод ещё делает предыдущий снимок, попробуйте через пару секунд');
                    if (!r.ok && r.err === 'need_cmd') {
                        // первый снимок после запуска игры: подписку на кадр делает только команда /screen (главный поток игры)
                        try { sendChatInput('/screen 0'); } catch (x) { return fail('Не удалось отправить /screen 0 в чат игры: ' + x.message); }
                        return poll(Date.now(), 12000);
                    }
                    if (!r.ok) return fail('Мод отказал: ' + (r.err || '?'));
                    poll(Date.now(), 10000);
                });
            });
        });
    }

    window.__screenTake = take;
    window.takeScreenshotToTelegram = take;
    window.__screenCleanup = function () {
        S.dead = true; S.busy = false;
        S.timers.forEach(function (id) { try { clearTimeout(id); } catch (e) {} });
        S.timers.length = 0;
        if (window.__screenTake === take) window.__screenTake = null;
        if (window.takeScreenshotToTelegram === take) window.takeScreenshotToTelegram = null;
        window.__screenCleanup = null;
    };
    try { debugLog('[SCREEN] Screen.js загружен'); } catch (e) {}
})();
