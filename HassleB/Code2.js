// Code2.js — продолжение Code.js в отдельном файле
// eval'ится изнутри Code.js — имеет доступ ко всем его переменным напрямую


// ╔══════════════════════════════════════════════════════════════╗
// ║  MODULE: FRIEND TRACKER v2.1 (Hassle auth-detection fix)    ║
// ║  Описание: Отслеживание входа друзей.                       ║
// ║             При появлении ника в списке онлайн —            ║
// ║             уведомление в Telegram.                          ║
// ║                                                              ║
// ║  Команды в ЧАТЕ ИГРЫ:                                       ║
// ║    /check <ник>   — добавить в слежение                     ║
// ║    /uncheck <ник> — убрать из слежения                      ║
// ║    /checklist     — список онлайн → Telegram                ║
// ║                                                              ║
// ║  Команды в TELEGRAM:                                        ║
// ║    /check_Иван_Петров  или  /check Иван Петров              ║
// ║    /uncheck_Иван_Петров или  /uncheck Иван Петров           ║
// ║    /checklist                                                ║
// ║                                                              ║
// ║  КАНАЛЫ ДАННЫХ (все три работают одновременно):             ║
// ║                                                              ║
// ║  1. window.onUpdatePlayersList                              ║
// ║     Глобальный колбэк движка. Срабатывает когда кто-то     ║
// ║     вызывает window.updatePlayerList(). Данные приходят     ║
// ║     БЕЗ поля level на Hassle. Ловит присутствие/отсутствие.║
// ║                                                              ║
// ║  2. window.interface('PlayersOnline') Proxy                 ║
// ║     Перехватывает setPlayersOnlineData / setInterfaceParams  ║
// ║     на уровне window.interface(). Данные приходят С полем   ║
// ║     level — это единственный источник level на Hassle.      ║
// ║                                                              ║
// ║  HASSLE MOBILE FIX (3 слоя):                               ║
// ║  Проблема: на Hassle mobile index.js вызывает               ║
// ║    setInterfaceParams ТОЛЬКО когда PlayersOnline открыт:    ║
// ║    getInterfaceStatus("PlayersOnline") && ...setInterfaceParams║
// ║  → Channel 2 никогда не срабатывает → level всегда 0.      ║
// ║                                                              ║
// ║  Слой A: Принудительный вызов Channel 2 из Channel 1.      ║
// ║    Вызываем window.interface('PlayersOnline').setInterfaceParams║
// ║    напрямую из нашего хука, минуя getInterfaceStatus().     ║
// ║    Данные из Channel 1 не несут level, но это страхует     ║
// ║    на случай если движок всё же добавит level в будущем.    ║
// ║                                                              ║
// ║  Слой B: Stealth-монтирование PlayersOnline.               ║
// ║    Когда игрок на авторизации (level=0), открываем           ║
// ║    PlayersOnline невидимо (show=false). Компонент            ║
// ║    монтируется и регистрирует собственные engine-хуки.      ║
// ║    После монтирования перехватываем методы компонента        ║
// ║    напрямую (через setupState). Если движок посылает level  ║
// ║    через свои хуки компонента — мы его поймаем.             ║
// ║                                                              ║
// ║  Слой C: Time-based fallback (30 сек).                     ║
// ║    Если Channel 2 так и не сработал и игрок всё ещё         ║
// ║    присутствует в списке через 30 сек после уведомления     ║
// ║    «авторизация» — считаем его авторизованным.              ║
// ║                                                              ║
// ║  3. Авто-опрос window.updatePlayerList()                    ║
// ║     Вызываем каждые 1 сек пока watchList не пуст.           ║
// ║                                                              ║
// ║  Зависимости: sendToTelegram, debugLog, config,             ║
// ║               displayName, processUpdates,                  ║
// ║               setSharedLastUpdateId                         ║
// ║                                                              ║
// ╚══════════════════════════════════════════════════════════════╝

// ==================== FRIEND TRACKER MODULE ====================
(function () {
    'use strict';

    // ── Состояние модуля ───────────────────────────────────────
    const ft = {
        watchList:     new Set(), // нормализованные ники под наблюдением
        onlineNow:     new Set(), // кто из них сейчас онлайн (de-dup)
        lastLevel:     {},        // { [watched]: number } — последний известный level (0 = авторизация)
        lastNotifyTs:  {},        // когда последний раз слали уведомление
        lastSeenNick:  {},        // оригинальный регистр ника (для уведомления о выходе)
        pollTimer:     null,      // ID интервала авто-опроса (канал 3)
        lastLevelData: null,      // последние данные с level (Канал 2) — для реиграя при Канале 1
        authEntryTs:   {},        // { [watched]: timestamp } — когда отправили уведомление «авторизация»
    };

    // Cooldown между повторными уведомлениями (защита от флуда)
    const FT_COOLDOWN_MS = 60 * 1000; // 1 минута

    // Частота авто-опроса updatePlayerList() — канал 3.
    const FT_POLL_MS = 1 * 1000;

    // Слой C: если за это время Channel 2 не дал level — считаем авторизованным
    const FT_AUTH_FALLBACK_MS = 30 * 1000; // 30 секунд

    // Слой B: stealth-монтирование PlayersOnline
    let _ftStealthActive  = false; // сейчас выполняется stealth-монтирование
    let _ftPatchedPO      = false; // уже патчили методы компонента


    // ── Нормализация ника ──────────────────────────────────────
    function _ftNorm(nick) {
        return (nick || '').replace(/_/g, ' ').trim().toLowerCase();
    }

    // ── Сравнение ников (поддерживает частичный ввод) ─────────
    function _ftMatch(playerNick, watched) {
        const pn = _ftNorm(playerNick);
        return pn === watched
            || pn.includes(watched)
            || watched.includes(pn);
    }

    // ── Уведомление в чат игры ────────────────────────────────
    function _ftChatNotify(msg) {
        try {
            if (typeof window.onChatMessage === 'function') {
                window.onChatMessage(
                    `{9999FF}[TRACKER] {FFFFFF}${msg}`,
                    'FFFFFFFF'
                );
            }
        } catch (e) { /* тихо */ }
    }

    // ── Отправить уведомление «авторизовался» ─────────────────
    function _ftSendAuthorizedNotify(watched, displayNick) {
        // Сбрасываем таймер авторизации
        delete ft.authEntryTs[watched];
        ft.lastLevel[watched] = 1; // Помечаем как авторизованного (level > 0)

        debugLog(`[TRACKER] ✅ "${displayNick}" авторизовался на сервере`);
        _ftChatNotify(`✅ ${displayNick} авторизовался`);
        sendToTelegram(
            `✅ <b>Игрок авторизовался — ${displayName}</b>\n` +
            `👤 <code>${displayNick}</code> находится на сервере`,
            false, null
        );
    }

    // ── Добавить в слежение ───────────────────────────────────
    function _ftAdd(rawNick) {
        const norm = _ftNorm(rawNick);
        if (!norm) return;
        const isNew = !ft.watchList.has(norm);
        ft.watchList.add(norm);

        _ftEnsurePoll();

        const listStr = [...ft.watchList].join(', ') || '—';
        _ftChatNotify(`Слежение: +${rawNick}`);
        sendToTelegram(
            `👁 <b>Слежение добавлено — ${displayName}</b>\n` +
            `🎯 Ник: <code>${rawNick}</code>\n` +
            `📋 Список [${ft.watchList.size}]: ${listStr}`,
            false, null
        );
        debugLog(`[TRACKER] Добавлен: "${norm}" (${isNew ? 'новый' : 'уже был в списке'})`);
    }

    // ── Убрать из слежения ────────────────────────────────────
    function _ftRemove(rawNick) {
        const norm    = _ftNorm(rawNick);
        const existed = ft.watchList.delete(norm);
        ft.onlineNow.delete(norm);
        delete ft.lastNotifyTs[norm];
        delete ft.lastLevel[norm];
        delete ft.lastSeenNick[norm];
        delete ft.authEntryTs[norm]; // Слой C: чистим таймер

        if (!ft.watchList.size) _ftStopPoll();

        if (existed) {
            _ftChatNotify(`Слежение: −${rawNick}`);
            sendToTelegram(
                `🗑 <b>Слежение удалено — ${displayName}</b>\n` +
                `❌ Ник: <code>${rawNick}</code>`,
                false, null
            );
        } else {
            _ftChatNotify(`Не найден в списке: ${rawNick}`);
        }
        debugLog(`[TRACKER] Удалён: "${norm}" (был в списке: ${existed})`);
    }

    // ── Показать список → Telegram ────────────────────────────
    function _ftList() {
        const list = [...ft.watchList];
        if (!list.length) {
            sendToTelegram(
                `👁 <b>Список слежения пуст — ${displayName}</b>\n` +
                `<i>Добавьте ник командой /check Имя_Фамилия</i>`,
                false, null
            );
        } else {
            const rows = list.map((n, i) => {
                const status = ft.onlineNow.has(n) ? ' 🟢 онлайн' : ' ⚫ офлайн';
                return `${i + 1}. <code>${n}</code>${status}`;
            });
            sendToTelegram(
                `👁 <b>Список слежения [${list.length}] — ${displayName}</b>\n` +
                rows.join('\n'),
                false, null
            );
        }
        _ftChatNotify('Список → Telegram');
        debugLog(`[TRACKER] /checklist отправлен (${ft.watchList.size} ников)`);
    }

    // ── Анализ входящих данных ────────────────────────────────
    function _ftCheck(rawData) {
        if (!ft.watchList.size) return;

        try {
            const data = (typeof rawData === 'string')
                ? JSON.parse(rawData)
                : rawData;
            if (!data) return;

            const allPlayers = [];
            if (data.local && data.local.name) {
                allPlayers.push({
                    name:     data.local.name,
                    level:    Number(data.local.level) || 0,
                    rawLevel: data.local.level
                });
            }
            if (Array.isArray(data.players)) {
                data.players.forEach(p => {
                    if (p && p.name) allPlayers.push({
                        name:     p.name,
                        level:    Number(p.level) || 0,
                        rawLevel: p.level
                    });
                });
            }

            const now = Date.now();
            for (const watched of ft.watchList) {
                const matchedPlayer = allPlayers.find(p => _ftMatch(p.name, watched));
                const wasOnline     = ft.onlineNow.has(watched);

                if (matchedPlayer) {
                    ft.lastSeenNick[watched] = matchedPlayer.name;
                    const displayNick = matchedPlayer.name.replace(/_/g, ' ');
                    const currLevel   = Number(matchedPlayer.level) || 0;

                    // Диагностика
                    const rawLvStr = (matchedPlayer.rawLevel === undefined || matchedPlayer.rawLevel === null)
                        ? 'undef'
                        : String(matchedPlayer.rawLevel);
                    console.log(
                        `[TRACKER] "${watched}"` +
                        ` | raw=${rawLvStr}` +
                        ` | curr=${currLevel}` +
                        ` | prev=${ft.lastLevel[watched] ?? '–'}` +
                        ` | online=${wasOnline}`
                    );

                    if (!wasOnline) {
                        // ── Новый заход ───────────────────────────────────
                        ft.onlineNow.add(watched);
                        ft.lastLevel[watched] = currLevel;
                        const lastTs = ft.lastNotifyTs[watched] || 0;
                        if ((now - lastTs) > FT_COOLDOWN_MS) {
                            ft.lastNotifyTs[watched] = now;
                            if (currLevel === 0) {
                                // Авторизация — запускаем таймер Слоя C
                                ft.authEntryTs[watched] = now;
                                debugLog(`[TRACKER] 🔐 "${displayNick}" зашёл — авторизация`);
                                _ftChatNotify(`🔐 ${displayNick} зашёл (авторизация)`);
                                sendToTelegram(
                                    `🔐 <b>Игрок зашёл — ${displayName}</b>\n` +
                                    `👤 <code>${displayNick}</code> находится на авторизации`,
                                    false, null
                                );
                                // Слой B: запускаем stealth-монтирование для получения level
                                if (!ft.lastLevelData) {
                                    setTimeout(_ftStealthMountPO, 3000);
                                }
                            } else {
                                // Появился сразу авторизованным
                                debugLog(`[TRACKER] ✅ "${displayNick}" зашёл — сразу на сервере (level ${currLevel})`);
                                _ftChatNotify(`✅ ${displayNick} зашёл в игру`);
                                sendToTelegram(
                                    `✅ <b>Игрок зашёл — ${displayName}</b>\n` +
                                    `👤 <code>${displayNick}</code> находится на сервере`,
                                    false, null
                                );
                            }
                        } else {
                            debugLog(`[TRACKER] "${watched}" онлайн, но cooldown — не спамим`);
                        }

                    } else {
                        // ── Игрок уже онлайн — проверяем переход level 0 → >0 ──
                        const prevLevel = ft.lastLevel[watched] ?? 0;
                        if (prevLevel === 0 && currLevel > 0) {
                            // Авторизовался через Channel 2 (реальный level пришёл)
                            delete ft.authEntryTs[watched]; // Слой C: отменяем таймер
                            ft.lastLevel[watched] = currLevel;
                            debugLog(`[TRACKER] ✅ "${displayNick}" авторизовался на сервере (level ${currLevel})`);
                            _ftChatNotify(`✅ ${displayNick} авторизовался`);
                            sendToTelegram(
                                `✅ <b>Игрок авторизовался — ${displayName}</b>\n` +
                                `👤 <code>${displayNick}</code> находится на сервере`,
                                false, null
                            );
                        } else {
                            // Просто обновляем уровень
                            // FIX Hassle: Канал 1 не несёт level (всегда 0 или undef).
                            // Не перезаписываем реальный level нулём из Канала 1.
                            if (currLevel > 0) {
                                ft.lastLevel[watched] = currLevel;
                            }
                        }
                    }

                } else if (wasOnline) {
                    // ── Игрок вышел ──────────────────────────────────────
                    ft.onlineNow.delete(watched);
                    delete ft.lastLevel[watched];
                    delete ft.lastNotifyTs[watched];
                    delete ft.authEntryTs[watched]; // Слой C: чистим таймер
                    const rawLeave = ft.lastSeenNick[watched] || watched;
                    delete ft.lastSeenNick[watched];
                    const leaveNick = rawLeave.replace(/_/g, ' ');
                    debugLog(`[TRACKER] 💤 "${leaveNick}" покинул игру`);
                    _ftChatNotify(`💤 ${leaveNick} покинул игру`);
                    sendToTelegram(
                        `💤 <b>Игрок вышел — ${displayName}</b>\n` +
                        `👤 <code>${leaveNick}</code> покинул игру`,
                        false, null
                    );
                }
            }

        } catch (e) {
            debugLog(`[TRACKER] Ошибка _ftCheck: ${e.message}`);
        }
    }


    // ═══════════════════════════════════════════════════════════
    //  СЛОЙ B: Stealth-монтирование PlayersOnline
    //
    //  На Hassle mobile Channel 2 не срабатывает потому что
    //  index.js проверяет getInterfaceStatus("PlayersOnline")
    //  и вызывает setInterfaceParams ТОЛЬКО когда интерфейс открыт.
    //
    //  Решение: временно монтируем PlayersOnline невидимо
    //  (open.status=true, show=false), компонент монтируется
    //  и может зарегистрировать свои engine-хуки. Затем
    //  патчим его методы напрямую через setupState, чтобы
    //  перехватить данные с level.
    //
    //  Даже если уровень через engine-хуки компонента
    //  не придёт, через 30 сек сработает Слой C (fallback).
    // ═══════════════════════════════════════════════════════════
    function _ftStealthMountPO() {
        if (_ftStealthActive) return;
        if (typeof window.getInterfaceStatus !== 'function') return;
        if (window.getInterfaceStatus('PlayersOnline')) return; // Уже открыт пользователем

        // Проверяем, есть ли хоть один игрок на авторизации
        const needsLevel = [...ft.watchList].some(
            w => ft.onlineNow.has(w) && (ft.lastLevel[w] || 0) === 0
        );
        if (!needsLevel) return;

        try {
            const app = window.App;
            if (!app || !app.components || !app.components.PlayersOnline) return;

            _ftStealthActive = true;
            _ftPatchedPO = false;

            const comp = app.components.PlayersOnline;
            debugLog('[TRACKER] 🔍 Stealth-монтирование PlayersOnline для получения level...');

            // Монтируем невидимо: компонент рендерится но скрыт CSS
            comp.show = false;
            comp.open.status = true;

            // Через 1.5 сек компонент должен смонтироваться
            // Патчим его методы и вызываем updatePlayerList
            setTimeout(() => {
                try {
                    // Попытка перехватить методы компонента
                    _ftTryPatchPOInstance();

                    // Вызываем updatePlayerList — теперь getInterfaceStatus("PlayersOnline")=true,
                    // поэтому index.js вызовет window.interface("PlayersOnline").setInterfaceParams()
                    // что сработает через наш Channel 2 proxy
                    if (typeof window.updatePlayerList === 'function') {
                        window.updatePlayerList();
                    }
                } catch(e) {}
            }, 1500);

            // Восстанавливаем через 5 сек
            setTimeout(() => {
                try {
                    const c = window.App && window.App.components && window.App.components.PlayersOnline;
                    if (c && _ftStealthActive) {
                        c.open.status = false;
                        c.show = true; // Восстанавливаем дефолт
                        debugLog('[TRACKER] 🔍 Stealth-монтирование завершено. lastLevelData: ' +
                            (ft.lastLevelData ? '✅' : '❌'));
                    }
                } catch(e) {}
                _ftStealthActive = false;
            }, 5000);

        } catch (e) {
            _ftStealthActive = false;
            debugLog('[TRACKER] Stealth-монтирование: ошибка — ' + e.message);
        }
    }

    // ── Патчинг методов компонента PlayersOnline напрямую ─────
    // Пытаемся перехватить setPlayersOnlineData/setInterfaceParams
    // на уровне Vue internal setupState — это позволяет поймать данные
    // даже если движок вызывает методы напрямую на компоненте,
    // минуя window.interface()
    function _ftTryPatchPOInstance() {
        if (_ftPatchedPO) return;
        try {
            const inst = window.interface('PlayersOnline');
            if (!inst) return;

            // В Vue 3 internal instance доступен через inst._
            const internal = inst._ || inst.$;
            if (!internal) return;

            const setupState = internal.setupState;
            if (!setupState) return;

            const methodsToPatch = ['setPlayersOnlineData', 'setInterfaceParams'];
            let patched = 0;

            for (const method of methodsToPatch) {
                if (typeof setupState[method] !== 'function') continue;
                const orig = setupState[method];
                setupState[method] = function(data) {
                    if (data) {
                        ft.lastLevelData = data;
                        try { _ftCheck(data); } catch(e2) {}
                        debugLog('[TRACKER] 🎯 Stealth-патч поймал ' + method + ' с данными!');
                    }
                    return orig.apply(this, arguments);
                };
                patched++;
            }

            if (patched > 0) {
                _ftPatchedPO = true;
                debugLog(`[TRACKER] 🎯 Stealth-патч: перехвачено ${patched} метод(ов) PlayersOnline`);
            }
        } catch(e) {
            // Тихо — не все версии Vue доступны так
        }
    }


    // ═══════════════════════════════════════════════════════════
    //  КАНАЛ 3: Авто-опрос window.updatePlayerList()
    // ═══════════════════════════════════════════════════════════
    function _ftEnsurePoll() {
        if (ft.pollTimer !== null) return;
        ft.pollTimer = setInterval(() => {
            if (!ft.watchList.size) {
                _ftStopPoll();
                return;
            }

            const now = Date.now();

            // ── Диагностика: состояние level для каждого онлайн-игрока ──
            for (const w of ft.watchList) {
                if (ft.onlineNow.has(w)) {
                    const authTs = ft.authEntryTs[w];
                    const sinceAuth = authTs ? Math.round((now - authTs) / 1000) : '–';
                    console.log(
                        `[POLL] "${w}"` +
                        ` | lastLevel=${ft.lastLevel[w] ?? 0}` +
                        ` | ch2=${ft.lastLevelData ? '✅fired' : '❌never'}` +
                        ` | authSec=${sinceAuth}`
                    );
                }
            }

            // ══ СЛОЙ C: Time-based fallback ══════════════════════════
            // Если игрок в auth-состоянии > FT_AUTH_FALLBACK_MS — считаем авторизованным
            for (const w of ft.watchList) {
                if (!ft.onlineNow.has(w)) continue;
                if ((ft.lastLevel[w] || 0) > 0) continue; // Уже авторизован
                const authTs = ft.authEntryTs[w];
                if (!authTs) continue;
                if ((now - authTs) < FT_AUTH_FALLBACK_MS) continue;

                // Fallback: считаем авторизованным через таймаут
                const displayNick = (ft.lastSeenNick[w] || w).replace(/_/g, ' ');
                debugLog(`[TRACKER] ⏱ "${displayNick}" авторизовался (таймаут ${FT_AUTH_FALLBACK_MS/1000}с, level не получен)`);
                _ftChatNotify(`✅ ${displayNick} авторизовался (авто)`);
                sendToTelegram(
                    `✅ <b>Игрок авторизовался — ${displayName}</b>\n` +
                    `👤 <code>${displayNick}</code> находится на сервере`,
                    false, null
                );
                delete ft.authEntryTs[w];
                ft.lastLevel[w] = 1; // Помечаем как авторизованного
            }

            // ── Авто-опрос updatePlayerList ──────────────────────────
            try {
                if (typeof window.updatePlayerList === 'function') {
                    window.updatePlayerList();
                }
            } catch (e) {
                debugLog(`[TRACKER] poll err: ${e.message}`);
            }

            // ── Слой B: Попытка stealth-монтирования ─────────────────
            // Если есть игроки на авторизации и channel 2 ни разу не сработал
            if (!ft.lastLevelData && !_ftStealthActive) {
                const hasAuthPlayers = [...ft.watchList].some(
                    w => ft.onlineNow.has(w) && (ft.lastLevel[w] || 0) === 0 && ft.authEntryTs[w]
                );
                if (hasAuthPlayers) {
                    _ftStealthMountPO();
                }
            }

            // ── Replay lastLevelData для застрявших игроков ─────────
            if (ft.lastLevelData) {
                for (const w of ft.watchList) {
                    if (ft.onlineNow.has(w) && (ft.lastLevel[w] || 0) === 0) {
                        try { _ftCheck(ft.lastLevelData); } catch (err) {}
                        break;
                    }
                }
            }
        }, FT_POLL_MS);
        debugLog(`[TRACKER] Авто-опрос запущен (каждые ${FT_POLL_MS / 1000} сек)`);
    }

    function _ftStopPoll() {
        if (ft.pollTimer === null) return;
        clearInterval(ft.pollTimer);
        ft.pollTimer = null;
        debugLog('[TRACKER] Авто-опрос остановлен (watchList пуст)');
    }


    // ═══════════════════════════════════════════════════════════
    //  КАНАЛ 1: window.onUpdatePlayersList
    // ═══════════════════════════════════════════════════════════
    const _ftOrigOnUpdatePlayers = window.onUpdatePlayersList;
    window.onUpdatePlayersList = function (e) {
        // ── Диагностика Channel 1 ─────────────────────────────
        if (ft.watchList.size) {
            try {
                const raw1 = typeof e === 'string' ? JSON.parse(e) : (e || {});
                const p1 = [];
                if (raw1.local && raw1.local.name) p1.push({ name: raw1.local.name, lv: raw1.local.level });
                if (Array.isArray(raw1.players)) raw1.players.forEach(p => p && p.name && p1.push({ name: p.name, lv: p.level }));
                for (const w of ft.watchList) {
                    const found = p1.find(x => _ftMatch(x.name, w));
                    if (found) {
                        const lvStr = (found.lv === undefined || found.lv === null) ? 'UNDEFINED' : String(found.lv);
                        console.log(`[CH1] "${w}" level_raw=${lvStr}`);
                    }
                }
            } catch (_) {}
        }

        // ── Channel 1: основная проверка ─────────────────────
        try { _ftCheck(e); } catch (err) {
            debugLog(`[TRACKER] onUpdatePlayersList err: ${err.message}`);
        }

        // ══ СЛОЙ A: Принудительный вызов Channel 2 ═══════════
        // index.js вызывает setInterfaceParams ТОЛЬКО когда PlayersOnline открыт:
        //   getInterfaceStatus("PlayersOnline") && window.interface("PlayersOnline").setInterfaceParams(e)
        // Мы вызываем ВСЕГДА, минуя эту проверку.
        // Наш proxy перехватит вызов. Данные из Channel 1 не несут level,
        // но это помогает если движок вдруг добавит level в ответе.
        if (ft.watchList.size) {
            try {
                const poProxy = window.interface('PlayersOnline');
                if (poProxy && typeof poProxy.setInterfaceParams === 'function') {
                    // Вызываем только если PlayersOnline НЕ открыт
                    // (когда открыт — оригинал уже вызовет сам)
                    if (!window.getInterfaceStatus('PlayersOnline')) {
                        poProxy.setInterfaceParams(e);
                    }
                }
            } catch(_) {}
        }

        // ── Replay lastLevelData если channel 2 уже срабатывал ─
        if (ft.lastLevelData) {
            for (const w of ft.watchList) {
                if (ft.onlineNow.has(w) && (ft.lastLevel[w] || 0) === 0) {
                    try { _ftCheck(ft.lastLevelData); } catch (err) {}
                    break;
                }
            }
        }

        if (typeof _ftOrigOnUpdatePlayers === 'function') {
            return _ftOrigOnUpdatePlayers.apply(this, arguments);
        }
    };


    // ═══════════════════════════════════════════════════════════
    //  КАНАЛ 2: window.interface('PlayersOnline') Proxy  [FIXED]
    // ═══════════════════════════════════════════════════════════
    (function _ftSetupInterfaceProxy() {
        try {
            const _origIface = window.interface;
            if (typeof _origIface !== 'function') {
                debugLog('[TRACKER] window.interface не найден — Proxy пропущен');
                return;
            }

            window.interface = function (name) {
                const inst = _origIface.apply(this, arguments);

                if (name !== 'PlayersOnline') return inst;

                const realInst = (inst !== null && inst !== undefined && inst !== false)
                    ? inst
                    : null;

                return new Proxy(realInst || {}, {
                    get(target, prop) {
                        if (
                            prop === 'setPlayersOnlineData' ||
                            prop === 'setInterfaceParams'
                        ) {
                            return function () {
                                const _arg0 = arguments[0];
                                if (_arg0) ft.lastLevelData = _arg0;

                                // ── Диагностика Channel 2 ──────────────────────────
                                try {
                                    const raw2 = typeof _arg0 === 'string' ? JSON.parse(_arg0) : (_arg0 || {});
                                    const onlineWatched = [...ft.watchList].filter(w => ft.onlineNow.has(w));
                                    console.log(`[CH2] ${prop}() FIRED! Online watched: [${onlineWatched.join(', ') || 'none'}]`);
                                    const p2 = [];
                                    if (raw2.local && raw2.local.name) p2.push({ name: raw2.local.name, lv: raw2.local.level });
                                    if (Array.isArray(raw2.players)) raw2.players.forEach(p => p && p.name && p2.push({ name: p.name, lv: p.level }));
                                    for (const w of ft.watchList) {
                                        const found = p2.find(x => _ftMatch(x.name, w));
                                        if (found) {
                                            const lvStr = (found.lv === undefined || found.lv === null) ? 'UNDEFINED' : String(found.lv);
                                            console.log(`[CH2] "${w}" level_raw=${lvStr}`);
                                        }
                                    }
                                } catch (_) {}

                                try { _ftCheck(_arg0); } catch (e) {
                                    debugLog(`[TRACKER] PO Proxy err: ${e.message}`);
                                }
                                if (realInst) {
                                    const fn = realInst[prop];
                                    if (typeof fn === 'function') {
                                        return fn.apply(realInst, arguments);
                                    }
                                }
                            };
                        }
                        return realInst ? realInst[prop] : undefined;
                    }
                });
            };

            debugLog('[TRACKER] Канал 2: window.interface Proxy установлен (PlayersOnline, Hassle-ready)');
        } catch (e) {
            debugLog(`[TRACKER] Ошибка установки interface Proxy: ${e.message}`);
        }
    })();


    // ═══════════════════════════════════════════════════════════
    //  ХУК: window.sendChatInput — команды в чате игры
    // ═══════════════════════════════════════════════════════════
    const _ftOrigChat = window.sendChatInput;
    window.sendChatInput = function (input) {
        if (typeof input === 'string') {
            const raw   = input.trim();
            const parts = raw.split(/\s+/);
            const cmd   = (parts[0] || '').toLowerCase();

            if (cmd === '/check' && parts.length >= 2) {
                _ftAdd(parts.slice(1).join(' '));
                return;
            }
            if (cmd === '/uncheck' && parts.length >= 2) {
                _ftRemove(parts.slice(1).join(' '));
                return;
            }
            if (cmd === '/checklist') {
                _ftList();
                return;
            }
        }
        return (typeof _ftOrigChat === 'function')
            ? _ftOrigChat.apply(this, arguments)
            : undefined;
    };


    // ═══════════════════════════════════════════════════════════
    //  ХУК: processUpdates — команды из Telegram
    // ═══════════════════════════════════════════════════════════
    const _ftOrigProcUpd = processUpdates;
    processUpdates = function (updates) {
        const pass = [];

        for (const upd of updates) {
            let consumed = false;

            if (upd.message && upd.message.text) {
                const msgText   = upd.message.text.trim();
                const msgChatId = String(upd.message.chat.id);

                if (config.chatIds.includes(msgChatId)) {

                    // /check Иван Петров  или  /check_Иван_Петров
                    const addM = msgText.match(/^\/check(?!list)[_ ](.+)$/i);
                    if (addM) {
                        _ftAdd(addM[1].trim().replace(/_/g, ' '));
                        config.lastUpdateId = upd.update_id;
                        setSharedLastUpdateId(config.lastUpdateId);
                        consumed = true;
                    }

                    // /uncheck Иван Петров  или  /uncheck_Иван_Петров
                    if (!consumed) {
                        const remM = msgText.match(/^\/uncheck[_ ](.+)$/i);
                        if (remM) {
                            _ftRemove(remM[1].trim().replace(/_/g, ' '));
                            config.lastUpdateId = upd.update_id;
                            setSharedLastUpdateId(config.lastUpdateId);
                            consumed = true;
                        }
                    }

                    // /checklist
                    if (!consumed && /^\/checklist$/i.test(msgText)) {
                        _ftList();
                        config.lastUpdateId = upd.update_id;
                        setSharedLastUpdateId(config.lastUpdateId);
                        consumed = true;
                    }
                }
            }

            if (!consumed) pass.push(upd);
        }

        if (pass.length > 0) _ftOrigProcUpd(pass);
    };


    debugLog(
        '[TRACKER] Friend Tracker v2.1 загружен.\n' +
        '  Каналы: [1] onUpdatePlayersList  [2] interface Proxy (fixed)  [3] авто-опрос\n' +
        '  Hassle auth-fix: [A] forced CH2 call  [B] stealth mount  [C] 30s fallback\n' +
        '  Команды: /check <ник> | /uncheck <ник> | /checklist'
    );

})();
// ==================== END FRIEND TRACKER MODULE ====================
