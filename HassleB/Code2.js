// Code2.js — продолжение Code.js в отдельном файле
// eval'ится изнутри Code.js — имеет доступ ко всем его переменным напрямую


// ╔══════════════════════════════════════════════════════════════╗
// ║  MODULE: FRIEND TRACKER v2                                   ║
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
// ║  FIX (Hassle mobile): раньше прокси возвращал inst=false   ║
// ║  (компонент не смонтирован) и крашился на false.method.     ║
// ║  Теперь прокси ВСЕГДА возвращает валидный объект — даже     ║
// ║  когда PlayersOnline не открыт. Движок вызывает             ║
// ║  setPlayersOnlineData() напрямую, мы перехватываем.         ║
// ║                                                              ║
// ║  3. Авто-опрос window.updatePlayerList()                    ║
// ║     Вызываем каждые 1 сек пока watchList не пуст.           ║
// ║     Даёт быстрое обнаружение входа/выхода через Канал 1     ║
// ║     (без level, но с именем — этого достаточно для выхода). ║
// ║                                                              ║
// ║  Зависимости: sendToTelegram, debugLog, config,             ║
// ║               displayName, processUpdates,                  ║
// ║               setSharedLastUpdateId                         ║
// ║                                                              ║
// ║  Детект авторизации: lastLevel (level 0 → >0)              ║
// ║  Level поступает только через Канал 2 (PlayersOnline Proxy).║
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
    };

    // Cooldown между повторными уведомлениями (защита от флуда)
    const FT_COOLDOWN_MS = 60 * 1000; // 1 минута

    // Частота авто-опроса updatePlayerList() — канал 3.
    // 1 сек: мгновенная реакция на вход/выход друга.
    const FT_POLL_MS = 1 * 1000;


    // ── Нормализация ника ──────────────────────────────────────
    // "Иван_Петров" → "иван петров", "Иван Петров" → "иван петров"
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

    // ── Добавить в слежение ───────────────────────────────────
    function _ftAdd(rawNick) {
        const norm = _ftNorm(rawNick);
        if (!norm) return;
        const isNew = !ft.watchList.has(norm);
        ft.watchList.add(norm);

        // Запустить авто-опрос (канал 3) если ещё не запущен
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

        // Если список опустел — останавливаем авто-опрос
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
    // Принимает данные из любого канала.
    // Формат (из PlayersOnline.js / onUpdatePlayersList):
    //   JSON-строка или объект:
    //   {
    //     count?: number, serverName?: string,
    //     local:   { id, name, ping, level?, ... },
    //     players: [{ id, name, ping, level?, ... }, ...]
    //   }
    function _ftCheck(rawData) {
        if (!ft.watchList.size) return;

        try {
            const data = (typeof rawData === 'string')
                ? JSON.parse(rawData)
                : rawData;
            if (!data) return;

            // ── Собираем всех игроков из снимка (имя + уровень) ──
            const allPlayers = [];
            if (data.local && data.local.name) {
                allPlayers.push({
                    name:  data.local.name,
                    level: Number(data.local.level) || 0
                });
            }
            if (Array.isArray(data.players)) {
                data.players.forEach(p => {
                    if (p && p.name) allPlayers.push({
                        name:  p.name,
                        level: Number(p.level) || 0
                    });
                });
            }

            const now = Date.now();
            for (const watched of ft.watchList) {
                const matchedPlayer = allPlayers.find(p => _ftMatch(p.name, watched));
                const wasOnline     = ft.onlineNow.has(watched);

                if (matchedPlayer) {
                    // ── Игрок в списке — обновляем регистр ника ──────
                    ft.lastSeenNick[watched] = matchedPlayer.name;
                    const displayNick = matchedPlayer.name.replace(/_/g, ' ');
                    const currLevel   = Number(matchedPlayer.level) || 0;

                    if (!wasOnline) {
                        // ── Новый заход ───────────────────────────────
                        ft.onlineNow.add(watched);
                        ft.lastLevel[watched] = currLevel;
                        const lastTs = ft.lastNotifyTs[watched] || 0;
                        if ((now - lastTs) > FT_COOLDOWN_MS) {
                            ft.lastNotifyTs[watched] = now;
                            if (currLevel === 0) {
                                debugLog(`[TRACKER] 🔐 "${displayNick}" зашёл — авторизация`);
                                _ftChatNotify(`🔐 ${displayNick} зашёл (авторизация)`);
                                sendToTelegram(
                                    `🔐 <b>Игрок зашёл — ${displayName}</b>\n` +
                                    `👤 <code>${displayNick}</code> находится на авторизации`,
                                    false, null
                                );
                            } else {
                                // Редкий случай: появился сразу авторизованным
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
                            // ── Авторизовался (level 0 → level > 0) ──
                            ft.lastLevel[watched] = currLevel;
                            debugLog(`[TRACKER] ✅ "${displayNick}" авторизовался на сервере (level ${currLevel})`);
                            _ftChatNotify(`✅ ${displayNick} авторизовался`);
                            sendToTelegram(
                                `✅ <b>Игрок авторизовался — ${displayName}</b>\n` +
                                `👤 <code>${displayNick}</code> находится на сервере`,
                                false, null
                            );
                        } else {
                            // Просто обновляем уровень (без уведомления)
                            // FIX Hassle: Канал 1 на Hassle не несёт level (всегда 0).
                            // Не перезаписываем реальный level нулём из Канала 1.
                            if (currLevel > 0) {
                                ft.lastLevel[watched] = currLevel;
                            }
                        }
                    }
                    // level > 0 → 0 в норме невозможно, игнорируем

                } else if (wasOnline) {
                    // ── Игрок вышел ──────────────────────────────────
                    ft.onlineNow.delete(watched);
                    delete ft.lastLevel[watched];
                    delete ft.lastNotifyTs[watched]; // сбрасываем cooldown — следующий вход всегда уведомит
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
    //  КАНАЛ 3: Авто-опрос window.updatePlayerList()
    //
    //  Вызываем updatePlayerList() каждую секунду пока watchList
    //  не пуст. Это даёт быстрое срабатывание Канала 1 (вход/
    //  выход без level). Level приходит отдельно через Канал 2.
    //
    //  Таймер запускается при первом /check и останавливается
    //  когда watchList становится пустым.
    // ═══════════════════════════════════════════════════════════
    function _ftEnsurePoll() {
        if (ft.pollTimer !== null) return; // уже запущен
        ft.pollTimer = setInterval(() => {
            if (!ft.watchList.size) {
                _ftStopPoll();
                return;
            }
            try {
                if (typeof window.updatePlayerList === 'function') {
                    window.updatePlayerList();
                }
            } catch (e) {
                debugLog(`[TRACKER] poll err: ${e.message}`);
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
    //
    //  Движок вызывает этот глобальный колбэк каждый раз когда
    //  кто-то дёрнул window.updatePlayerList():
    //    • PlayersOnline.vue — раз в 1 сек (когда открыт)
    //    • mvdF.js           — раз в 30 сек (всегда)
    //    • Наш авто-опрос   — раз в 1 сек (Канал 3, когда watchList не пуст)
    //
    //  На Hassle: данные приходят БЕЗ поля level.
    //  Level детектируется только через Канал 2.
    // ═══════════════════════════════════════════════════════════
    const _ftOrigOnUpdatePlayers = window.onUpdatePlayersList;
    window.onUpdatePlayersList = function (e) {
        try { _ftCheck(e); } catch (err) {
            debugLog(`[TRACKER] onUpdatePlayersList err: ${err.message}`);
        }
        // Hassle FIX: Канал 1 не несёт level. Если есть игроки онлайн с level=0
        // (застряли на авторизации) и у нас есть сохранённые данные с level
        // от Канала 2 — прогоняем их снова. Это поймает переход 0→>0 даже если
        // Канал 2 стрелял редко или до того как игрок добавлен в watchList.
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
    //
    //  КАК РАБОТАЕТ:
    //  Оборачиваем window.interface() в Proxy. При любом вызове
    //  window.interface('PlayersOnline') — независимо от того,
    //  смонтирован компонент или нет — возвращаем прокси-объект,
    //  который перехватывает setPlayersOnlineData и
    //  setInterfaceParams и прогоняет данные через _ftCheck().
    //
    //  ПОЧЕМУ БЫЛ БАГ НА HASSLE MOBILE:
    //  Когда PlayersOnline не открыт, window.interface('PlayersOnline')
    //  возвращает false (не null). Старый код проверял inst == null,
    //  что не ловило false, и следующая строка
    //    typeof inst.setPlayersOnlineData
    //  бросала TypeError — движок замолкал и переставал слать данные.
    //
    //  ЧТО ИСПРАВЛЕНО:
    //  Теперь прокси возвращается ВСЕГДА:
    //    • Если компонент смонтирован (inst — Vue-объект) →
    //      target = inst, методы перехватываются + форвардятся.
    //    • Если не смонтирован (inst = false/null/undefined) →
    //      target = {}, создаём виртуальный таргет.
    //      Hassle-движок вызывает setPlayersOnlineData() на нём,
    //      мы перехватываем данные с level и зовём _ftCheck().
    //
    //  КОГДА РАБОТАЕТ:
    //  • Hassle mobile — PlayersOnline НЕ открыт (основной кейс).
    //  • Hassle/Legacy — PlayersOnline открыт пользователем.
    //  • Любой движок, когда другой скрипт дёргает interface().
    //
    //  КОГДА НЕ РАБОТАЕТ:
    //  • Legacy PC — кэширует ссылку на компонент при старте,
    //    не вызывает window.interface() повторно. Там достаточно
    //    Канала 1 + 3.
    //
    //  PlayersOnline.js expose():
    //    { setPlayersOnlineData(json), setInterfaceParams(json) }
    //  Формат данных: JSON-строка или объект
    //    { count, serverName, local: {name, level, ...}, players: [{name, level, ...}] }
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

                // Перехватываем только PlayersOnline
                if (name !== 'PlayersOnline') return inst;

                // ── FIX: раньше здесь был `inst == null` — не ловило false.
                // Теперь: если компонент смонтирован — используем его как таргет,
                // иначе создаём пустой объект-заглушку. Прокси возвращается ВСЕГДА.
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
                                // Прогоняем данные через трекер (здесь есть level!)
                                // Сохраняем для реиграя при Канале 1 (Hassle FIX)
                                if (arguments[0]) ft.lastLevelData = arguments[0];
                                try { _ftCheck(arguments[0]); } catch (e) {
                                    debugLog(`[TRACKER] PO Proxy err: ${e.message}`);
                                }
                                // Если компонент реально смонтирован — зовём оригинал
                                // чтобы Vue-компонент тоже обновил UI
                                if (realInst) {
                                    const fn = realInst[prop];
                                    if (typeof fn === 'function') {
                                        return fn.apply(realInst, arguments);
                                    }
                                }
                            };
                        }
                        // Остальные свойства — из реального компонента или undefined
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
    //  Цепочка: этот хук → ZAVOD-хук → оригинал sendChatInput
    // ═══════════════════════════════════════════════════════════
    const _ftOrigChat = window.sendChatInput;
    window.sendChatInput = function (input) {
        if (typeof input === 'string') {
            const raw   = input.trim();
            const parts = raw.split(/\s+/);
            const cmd   = (parts[0] || '').toLowerCase();

            if (cmd === '/check' && parts.length >= 2) {
                _ftAdd(parts.slice(1).join(' '));
                return; // не передаём в игру
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
    //  /check Иван Петров      /check_Иван_Петров
    //  /uncheck Иван Петров    /uncheck_Иван_Петров
    //  /checklist
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
                    // Отрицательный lookahead: не матчить /checklist
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
        '[TRACKER] Friend Tracker v2 загружен.\n' +
        '  Каналы: [1] onUpdatePlayersList  [2] interface Proxy (fixed)  [3] авто-опрос\n' +
        '  Команды: /check <ник> | /uncheck <ник> | /checklist\n' +
        '  Детект авторизации: lastLevel (level 0 → >0) via Канал 2'
    );

})();
// ==================== END FRIEND TRACKER MODULE ====================
