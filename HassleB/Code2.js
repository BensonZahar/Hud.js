// Code2.js — FRIEND TRACKER v4
// FIX: не открывает TAB автоматически.
// FIX: не ломает закрытие PlayersOnline.
// FIX: на Hassle mobile использует updatePlayers + updatePlayerList + перехват интерфейса.
//
// Команды в чате:
//   /check Nick_Name
//   /uncheck Nick_Name
//   /checklist
//   /checklevel
//   /closetab
//   /opentab
//
// Команды в Telegram:
//   /check Nick_Name
//   /check_ Nick_Name
//   /uncheck Nick_Name
//   /uncheck_ Nick_Name
//   /checklist
//   /checklevel
//   /closetab
//   /opentab
//
(function () {
    'use strict';

    // Защита от двойной загрузки
    if (window.__friendTrackerV4Loaded) {
        try {
            if (typeof debugLog === 'function') {
                debugLog('[TRACKER] Friend Tracker v4 уже загружен — повторный запуск пропущен');
            }
        } catch (e) {}
        return;
    }
    window.__friendTrackerV4Loaded = true;

    // ============================================================
    // ======================= НАСТРОЙКИ ==========================
    // ============================================================

    const FT_POLL_MS = 1000;                       // проверка каждую секунду
    const FT_COOLDOWN_MS = 60 * 1000;              // антифлуд на вход
    const FT_CALL_UPDATE_PLAYER_LIST = true;       // window.updatePlayerList()
    const FT_CALL_UPDATE_PLAYERS = true;           // window.updatePlayers() — важно для Hassle
    const FT_NOTIFY_LEVEL_CHANGE = true;           // уведомлять, если уровень изменился
    const FT_SEND_LEVEL_EVERY_SECOND = false;      // true = спам уровнем в TG каждую секунду
    const FT_DEBUG_LEVEL_EVERY_SECOND = false;     // true = писать уровень в debugLog каждую секунду

    // ============================================================
    // ======================= СОСТОЯНИЕ ==========================
    // ============================================================

    const ft = {
        watchList: new Set(),
        onlineNow: new Set(),
        lastLevel: {},
        lastNotifyTs: {},
        lastSeenNick: {},
        levelUnknownSince: {},
        lastLevelChangeTs: {},
        lastLevelReportTs: {},
        pollTimer: null
    };

    let _ftInsideUpdatePlayersList = false;

    // ============================================================
    // ======================= УТИЛИТЫ ============================
    // ============================================================

    function _ftDebug(msg) {
        try {
            if (typeof debugLog === 'function') {
                debugLog(msg);
            } else {
                console.log(msg);
            }
        } catch (e) {}
    }

    function _ftDisplayName() {
        try {
            return typeof displayName !== 'undefined' ? displayName : 'игрок';
        } catch (e) {
            return 'игрок';
        }
    }

    function _ftTg(text) {
        try {
            if (typeof sendToTelegram === 'function') {
                sendToTelegram(text, false, null);
            }
        } catch (e) {
            _ftDebug(`[TRACKER] sendToTelegram error: ${e.message}`);
        }
    }

    function _ftChatNotify(msg) {
        try {
            if (typeof window.onChatMessage === 'function') {
                window.onChatMessage(
                    `{9999FF}[TRACKER] {FFFFFF}${msg}`,
                    'FFFFFFFF'
                );
            }
        } catch (e) {}
    }

    function _ftGetComponent(name) {
        try {
            if (typeof window.component === 'function') {
                const c = window.component(name);
                if (c) return c;
            }
        } catch (e) {}

        try {
            if (window.App && window.App.components) {
                return window.App.components[name] || null;
            }
        } catch (e) {}

        return null;
    }

    function _ftNorm(nick) {
        return (nick || '').replace(/_/g, ' ').trim().toLowerCase();
    }

    function _ftMatch(playerNick, watched) {
        const pn = _ftNorm(playerNick);
        return pn === watched || pn.includes(watched) || watched.includes(pn);
    }

    function _ftExtractLevel(p) {
        if (!p) return 0;

        const candidates = [
            p.level,
            p.data && p.data.level,
            p.player && p.player.level,
            p.info && p.info.level
        ];

        for (let i = 0; i < candidates.length; i++) {
            const n = Number(candidates[i]);
            if (Number.isFinite(n) && n >= 0) {
                return n;
            }
        }

        return 0;
    }

    // ============================================================
    // ================== ЗАКРЫТИЕ / ОТКРЫТИЕ TAB =================
    // ============================================================

    function _ftClosePlayersTab(silent) {
        try {
            // Сначала пытаемся закрыть штатно
            try {
                if (
                    typeof window.getInterfaceStatus === 'function' &&
                    typeof window.closeInterface === 'function' &&
                    window.getInterfaceStatus('PlayersOnline')
                ) {
                    window.closeInterface('PlayersOnline');
                }
            } catch (e) {
                _ftDebug(`[TRACKER] closeInterface error: ${e.message}`);
            }

            // Принудительно гасим состояние, если штатное закрытие не сработало
            const c = _ftGetComponent('PlayersOnline');
            if (c) {
                c.show = false;
                if (c.open) {
                    c.open.status = false;
                }
            }

            if (window.App && typeof window.App.$forceUpdate === 'function') {
                window.App.$forceUpdate();
            }

            if (!silent) {
                _ftChatNotify('PlayersOnline закрыт');
                _ftTg(
                    `🧹 <b>PlayersOnline закрыт — ${_ftDisplayName()}</b>\n` +
                    `TAB список игроков был принудительно закрыт трекером.`
                );
            }

            _ftDebug('[TRACKER] PlayersOnline closed by command');
        } catch (e) {
            _ftDebug(`[TRACKER] _ftClosePlayersTab error: ${e.message}`);
        }
    }

    function _ftOpenPlayersTab() {
        try {
            if (typeof window.openInterface === 'function') {
                window.openInterface('PlayersOnline');
                _ftChatNotify('Открываю PlayersOnline');
                _ftDebug('[TRACKER] PlayersOnline opened by command');
            }
        } catch (e) {
            _ftDebug(`[TRACKER] _ftOpenPlayersTab error: ${e.message}`);
        }
    }

    // ============================================================
    // ======================= ОПРОС ДАННЫХ =======================
    // ============================================================

    function _ftRequestNow() {
        try {
            if (
                FT_CALL_UPDATE_PLAYER_LIST &&
                typeof window.updatePlayerList === 'function'
            ) {
                window.updatePlayerList();
            }
        } catch (e) {
            _ftDebug(`[TRACKER] updatePlayerList error: ${e.message}`);
        }

        try {
            if (
                FT_CALL_UPDATE_PLAYERS &&
                typeof window.updatePlayers === 'function'
            ) {
                window.updatePlayers();
            }
        } catch (e) {
            _ftDebug(`[TRACKER] updatePlayers error: ${e.message}`);
        }
    }

    function _ftEnsurePoll() {
        if (ft.pollTimer !== null) return;

        ft.pollTimer = setInterval(() => {
            if (!ft.watchList.size) {
                _ftStopPoll();
                return;
            }

            _ftRequestNow();
        }, FT_POLL_MS);

        _ftDebug(`[TRACKER] Poll started: every ${FT_POLL_MS / 1000}s`);
    }

    function _ftStopPoll() {
        if (ft.pollTimer === null) return;

        clearInterval(ft.pollTimer);
        ft.pollTimer = null;

        _ftDebug('[TRACKER] Poll stopped');
    }

    // ============================================================
    // ======================= КОМАНДЫ ============================
    // ============================================================

    function _ftAdd(rawNick) {
        const norm = _ftNorm(rawNick);
        if (!norm) return;

        ft.watchList.add(norm);

        _ftEnsurePoll();
        _ftRequestNow();

        const listStr = [...ft.watchList].join(', ') || '—';

        _ftChatNotify(`Слежение: +${rawNick}`);
        _ftTg(
            `👁 <b>Слежение добавлено — ${_ftDisplayName()}</b>\n` +
            `🎯 Ник: <code>${rawNick}</code>\n` +
            `📋 Список [${ft.watchList.size}]: ${listStr}\n` +
            `⏱ Проверка: каждую секунду\n` +
            `🧷 TAB автоматически не открывается`
        );

        _ftDebug(`[TRACKER] Added "${norm}"`);
    }

    function _ftRemove(rawNick) {
        const norm = _ftNorm(rawNick);
        const existed = ft.watchList.delete(norm);

        ft.onlineNow.delete(norm);
        delete ft.lastNotifyTs[norm];
        delete ft.lastLevel[norm];
        delete ft.lastSeenNick[norm];
        delete ft.levelUnknownSince[norm];
        delete ft.lastLevelChangeTs[norm];
        delete ft.lastLevelReportTs[norm];

        if (!ft.watchList.size) {
            _ftStopPoll();
        }

        if (existed) {
            _ftChatNotify(`Слежение: −${rawNick}`);
            _ftTg(
                `🗑 <b>Слежение удалено — ${_ftDisplayName()}</b>\n` +
                `❌ Ник: <code>${rawNick}</code>`
            );
        } else {
            _ftChatNotify(`Не найден в списке: ${rawNick}`);
        }

        _ftDebug(`[TRACKER] Removed "${norm}"`);
    }

    function _ftList() {
        const list = [...ft.watchList];

        if (!list.length) {
            _ftTg(
                `👁 <b>Список слежения пуст — ${_ftDisplayName()}</b>\n` +
                `<i>Добавь ник командой /check Имя_Фамилия</i>`
            );
        } else {
            const rows = list.map((n, i) => {
                const online = ft.onlineNow.has(n);
                const lvl = ft.lastLevel[n] || 0;

                let status;
                if (!online) {
                    status = '⚫ офлайн';
                } else if (lvl > 0) {
                    status = `🟢 онлайн, уровень ${lvl}`;
                } else {
                    status = '🟢 онлайн, уровень определяется / авторизация';
                }

                return `${i + 1}. <code>${n}</code> — ${status}`;
            });

            _ftTg(
                `👁 <b>Список слежения [${list.length}] — ${_ftDisplayName()}</b>\n` +
                rows.join('\n')
            );
        }

        _ftChatNotify('Список → Telegram');
    }

    function _ftLevelReport() {
        const list = [...ft.watchList];

        if (!list.length) {
            _ftTg(
                `📊 <b>Нет отслеживаемых игроков — ${_ftDisplayName()}</b>\n` +
                `<i>Добавь ник командой /check Имя_Фамилия</i>`
            );
            return;
        }

        const rows = list.map((n, i) => {
            const online = ft.onlineNow.has(n);
            const lvl = ft.lastLevel[n] || 0;
            const nick = (ft.lastSeenNick[n] || n).replace(/_/g, ' ');

            if (!online) {
                return `${i + 1}. <code>${nick}</code> — ⚫ офлайн`;
            }

            if (lvl > 0) {
                return `${i + 1}. <code>${nick}</code> — 🟢 онлайн, уровень: <b>${lvl}</b>`;
            }

            return `${i + 1}. <code>${nick}</code> — 🟢 онлайн, уровень: <b>определяется</b>`;
        });

        _ftTg(
            `📊 <b>Уровни отслеживаемых — ${_ftDisplayName()}</b>\n` +
            rows.join('\n')
        );

        _ftChatNotify('Уровни → Telegram');
    }

    // ============================================================
    // ===================== ПРОВЕРКА ДАННЫХ ======================
    // ============================================================

    function _ftCheck(rawData) {
        if (!ft.watchList.size) return;
        if (rawData === null || rawData === undefined) return;

        let data = rawData;

        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (e) {
                return;
            }
        }

        if (!data) return;

        const allPlayers = [];

        function pushPlayer(p) {
            if (!p) return;

            const name =
                p.name ||
                p.nick ||
                p.playerName ||
                (p.player && p.player.name);

            if (!name || typeof name !== 'string') return;

            allPlayers.push({
                name: name,
                level: _ftExtractLevel(p)
            });
        }

        if (Array.isArray(data)) {
            data.forEach(pushPlayer);
        } else {
            if (data.local) pushPlayer(data.local);
            if (data.player) pushPlayer(data.player);
            if (Array.isArray(data.players)) data.players.forEach(pushPlayer);
        }

        if (!allPlayers.length) return;

        const now = Date.now();

        for (const watched of ft.watchList) {
            const exact = allPlayers.find(p => _ftNorm(p.name) === watched);
            const matched = exact || allPlayers.find(p => _ftMatch(p.name, watched));
            const wasOnline = ft.onlineNow.has(watched);

            if (matched) {
                ft.lastSeenNick[watched] = matched.name;
                const displayNick = matched.name.replace(/_/g, ' ');
                const currLevel = matched.level;

                if (!wasOnline) {
                    // ================= ВХОД =================
                    ft.onlineNow.add(watched);
                    ft.lastLevel[watched] = currLevel;

                    if (currLevel > 0) {
                        delete ft.levelUnknownSince[watched];
                    } else {
                        ft.levelUnknownSince[watched] = now;
                    }

                    const lastTs = ft.lastNotifyTs[watched] || 0;
                    if ((now - lastTs) > FT_COOLDOWN_MS || lastTs === 0) {
                        ft.lastNotifyTs[watched] = now;

                        if (currLevel > 0) {
                            _ftChatNotify(`✅ ${displayNick} зашёл в игру (уровень ${currLevel})`);
                            _ftTg(
                                `✅ <b>Игрок зашёл — ${_ftDisplayName()}</b>\n` +
                                `👤 <code>${displayNick}</code>\n` +
                                `📈 Уровень: <b>${currLevel}</b>`
                            );
                        } else {
                            _ftChatNotify(`🔐 ${displayNick} зашёл (уровень определяется / авторизация)`);
                            _ftTg(
                                `🔐 <b>Игрок зашёл — ${_ftDisplayName()}</b>\n` +
                                `👤 <code>${displayNick}</code>\n` +
                                `⏳ Уровень пока определяется / авторизация`
                            );
                        }
                    }

                    _ftDebug(`[TRACKER] ENTER: "${displayNick}", level=${currLevel}`);
                } else {
                    // =============== УЖЕ ОНЛАЙН ===============
                    const prevLevel = ft.lastLevel[watched] || 0;

                    if (currLevel > 0) {
                        delete ft.levelUnknownSince[watched];

                        if (prevLevel === 0) {
                            _ftChatNotify(`✅ ${displayNick} авторизовался (уровень ${currLevel})`);
                            _ftTg(
                                `✅ <b>Игрок авторизовался — ${_ftDisplayName()}</b>\n` +
                                `👤 <code>${displayNick}</code>\n` +
                                `📈 Уровень: <b>${currLevel}</b>`
                            );

                            _ftDebug(`[TRACKER] AUTH DONE: "${displayNick}", level=${currLevel}`);
                        } else if (prevLevel !== currLevel) {
                            if (
                                FT_NOTIFY_LEVEL_CHANGE &&
                                (now - (ft.lastLevelChangeTs[watched] || 0)) > 5000
                            ) {
                                ft.lastLevelChangeTs[watched] = now;

                                _ftChatNotify(`📈 ${displayNick}: уровень ${prevLevel} → ${currLevel}`);
                                _ftTg(
                                    `📈 <b>Уровень изменился — ${_ftDisplayName()}</b>\n` +
                                    `👤 <code>${displayNick}</code>\n` +
                                    `📊 ${prevLevel} → <b>${currLevel}</b>`
                                );
                            }

                            _ftDebug(`[TRACKER] LEVEL CHANGE: "${displayNick}" ${prevLevel} -> ${currLevel}`);
                        }

                        ft.lastLevel[watched] = currLevel;

                        if (
                            FT_SEND_LEVEL_EVERY_SECOND &&
                            (now - (ft.lastLevelReportTs[watched] || 0)) >= 1000
                        ) {
                            ft.lastLevelReportTs[watched] = now;
                            _ftTg(
                                `⏱ <code>${displayNick}</code> уровень: <b>${currLevel}</b>`
                            );
                        }

                        if (FT_DEBUG_LEVEL_EVERY_SECOND) {
                            _ftDebug(`[TRACKER] LEVEL: "${displayNick}" = ${currLevel}`);
                        }
                    } else {
                        // currLevel === 0
                        // Не затираем известный уровень нулём.
                        if (prevLevel === 0 && !ft.levelUnknownSince[watched]) {
                            ft.levelUnknownSince[watched] = now;
                        }
                    }
                }
            } else if (wasOnline) {
                // ================= ВЫХОД =================
                ft.onlineNow.delete(watched);

                delete ft.lastLevel[watched];
                delete ft.lastNotifyTs[watched];
                delete ft.levelUnknownSince[watched];
                delete ft.lastLevelChangeTs[watched];
                delete ft.lastLevelReportTs[watched];

                const rawLeave = ft.lastSeenNick[watched] || watched;
                delete ft.lastSeenNick[watched];

                const leaveNick = rawLeave.replace(/_/g, ' ');

                _ftChatNotify(`💤 ${leaveNick} покинул игру`);
                _ftTg(
                    `💤 <b>Игрок вышел — ${_ftDisplayName()}</b>\n` +
                    `👤 <code>${leaveNick}</code> покинул игру`
                );

                _ftDebug(`[TRACKER] LEAVE: "${leaveNick}"`);
            }
        }
    }

    // ============================================================
    // ================== ХУК onUpdatePlayersList =================
    // ============================================================

    function _ftInstallUpdatePlayersListHook() {
        if (typeof window.onUpdatePlayersList !== 'function') {
            return false;
        }

        if (window.onUpdatePlayersList.__ftPatched) {
            return true;
        }

        const orig = window.onUpdatePlayersList;

        const patched = function (e) {
            try {
                _ftCheck(e);
            } catch (err) {
                _ftDebug(`[TRACKER] onUpdatePlayersList error: ${err.message}`);
            }

            _ftInsideUpdatePlayersList = true;
            try {
                return orig.apply(this, arguments);
            } finally {
                _ftInsideUpdatePlayersList = false;
            }
        };

        patched.__ftPatched = true;
        window.onUpdatePlayersList = patched;

        _ftDebug('[TRACKER] onUpdatePlayersList hook installed');
        return true;
    }

    // ============================================================
    // ================ ХУК getInterfaceStatus ====================
    // ============================================================
    //
    // ВАЖНО:
    // Мы НЕ подделываем PlayersOnline глобально.
    // Иначе TAB ломается.
    //
    // true возвращаем только внутри onUpdatePlayersList,
    // чтобы оригинальный код мог передать данные в наш перехватчик.
    //
    // Для TAB/closeInterface/openInterface возвращаем реальный статус.
    // ============================================================

    function _ftInstallInterfaceStatusHook() {
        if (typeof window.getInterfaceStatus !== 'function') {
            return false;
        }

        if (window.getInterfaceStatus.__ftPatched) {
            return true;
        }

        const orig = window.getInterfaceStatus;

        const patched = function (name) {
            if (name === 'PlayersOnline') {
                if (ft.watchList.size > 0 && _ftInsideUpdatePlayersList) {
                    return true;
                }

                const c = _ftGetComponent('PlayersOnline');
                return !!(c && c.open && c.open.status);
            }

            return orig.apply(this, arguments);
        };

        patched.__ftPatched = true;
        window.getInterfaceStatus = patched;

        _ftDebug('[TRACKER] getInterfaceStatus hook installed (safe for TAB)');
        return true;
    }

    // ============================================================
    // ================== ХУК window.interface ====================
    // ============================================================

    function _ftInstallInterfaceProxy() {
        if (typeof window.interface !== 'function') {
            return false;
        }

        if (window.interface.__ftPatched) {
            return true;
        }

        const orig = window.interface;

        const patched = function (name) {
            const inst = orig.apply(this, arguments);

            if (name !== 'PlayersOnline') {
                return inst;
            }

            const realInst =
                inst !== null &&
                inst !== undefined &&
                inst !== false
                    ? inst
                    : null;

            // Если слежения нет и компонент не смонтирован — не мешаем игре.
            if (!realInst && ft.watchList.size === 0) {
                return inst;
            }

            const target = realInst || {};

            function callRealMethod(method, args) {
                if (!realInst) return;

                try {
                    const fn = realInst[method];
                    if (typeof fn === 'function') {
                        return fn.apply(realInst, args);
                    }
                } catch (e) {
                    _ftDebug(`[TRACKER] interface proxy method error: ${e.message}`);
                }

                try {
                    if (
                        realInst.$ &&
                        realInst.$.exposed &&
                        typeof realInst.$.exposed[method] === 'function'
                    ) {
                        return realInst.$.exposed[method].apply(realInst, args);
                    }
                } catch (e) {}
            }

            return new Proxy(target, {
                get(t, prop) {
                    if (
                        prop === 'setPlayersOnlineData' ||
                        prop === 'setInterfaceParams'
                    ) {
                        return function () {
                            try {
                                _ftCheck(arguments[0]);
                            } catch (e) {
                                _ftDebug(`[TRACKER] PO proxy check error: ${e.message}`);
                            }

                            callRealMethod(prop, arguments);
                        };
                    }

                    if (realInst) {
                        const val = realInst[prop];
                        return typeof val === 'function' ? val.bind(realInst) : val;
                    }

                    return t[prop];
                },

                set(t, prop, value) {
                    if (realInst) {
                        realInst[prop] = value;
                        return true;
                    }

                    t[prop] = value;
                    return true;
                },

                has(t, prop) {
                    if (realInst) {
                        return prop in realInst;
                    }

                    return prop in t;
                }
            });
        };

        patched.__ftPatched = true;
        window.interface = patched;

        _ftDebug('[TRACKER] window.interface proxy installed');
        return true;
    }

    // ============================================================
    // ===================== ХУК ЧАТА ИГРЫ ========================
    // ============================================================

    function _ftInstallChatHook() {
        if (typeof window.sendChatInput !== 'function') {
            return false;
        }

        if (window.sendChatInput.__ftPatched) {
            return true;
        }

        const orig = window.sendChatInput;

        const patched = function (input) {
            if (typeof input === 'string') {
                const raw = input.trim();
                const parts = raw.split(/\s+/);
                const cmd = (parts[0] || '').toLowerCase();

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

                if (cmd === '/checklevel') {
                    _ftLevelReport();
                    return;
                }

                if (cmd === '/closetab') {
                    _ftClosePlayersTab(false);
                    return;
                }

                if (cmd === '/opentab') {
                    _ftOpenPlayersTab();
                    return;
                }
            }

            if (typeof orig === 'function') {
                return orig.apply(this, arguments);
            }

            return undefined;
        };

        patched.__ftPatched = true;
        window.sendChatInput = patched;

        _ftDebug('[TRACKER] sendChatInput hook installed');
        return true;
    }

    // ============================================================
    // ==================== ХУК TELEGRAM ==========================
    // ============================================================

    function _ftHandleTelegramCommand(text) {
        if (!text) return false;

        let m;

        if (/^\/closetab$/i.test(text)) {
            _ftClosePlayersTab(false);
            return true;
        }

        if (/^\/opentab$/i.test(text)) {
            _ftOpenPlayersTab();
            return true;
        }

        if (/^\/checklist$/i.test(text)) {
            _ftList();
            return true;
        }

        if (/^\/checklevel$/i.test(text)) {
            _ftLevelReport();
            return true;
        }

        m = text.match(/^\/check(?!list|level|tab)[_ ](.+)$/i);
        if (m) {
            _ftAdd(m[1].trim().replace(/_/g, ' '));
            return true;
        }

        m = text.match(/^\/uncheck[_ ](.+)$/i);
        if (m) {
            _ftRemove(m[1].trim().replace(/_/g, ' '));
            return true;
        }

        return false;
    }

    function _ftInstallProcessUpdatesHook() {
        if (typeof processUpdates !== 'function') {
            return false;
        }

        if (processUpdates.__ftPatched) {
            return true;
        }

        const orig = processUpdates;

        const patched = function (updates) {
            const pass = [];

            for (const upd of updates) {
                let consumed = false;

                try {
                    if (upd && upd.message && upd.message.text) {
                        const text = upd.message.text.trim();
                        const chatId = String(upd.message.chat && upd.message.chat.id);

                        const allowed =
                            typeof config !== 'undefined' &&
                            Array.isArray(config.chatIds) &&
                            config.chatIds.includes(chatId);

                        if (allowed) {
                            consumed = _ftHandleTelegramCommand(text);

                            if (consumed) {
                                try {
                                    config.lastUpdateId = upd.update_id;
                                    if (typeof setSharedLastUpdateId === 'function') {
                                        setSharedLastUpdateId(config.lastUpdateId);
                                    }
                                } catch (e) {}
                            }
                        }
                    }
                } catch (e) {
                    _ftDebug(`[TRACKER] processUpdates parse error: ${e.message}`);
                }

                if (!consumed) {
                    pass.push(upd);
                }
            }

            if (pass.length > 0) {
                return orig.call(this, pass);
            }
        };

        patched.__ftPatched = true;
        processUpdates = patched;

        _ftDebug('[TRACKER] processUpdates hook installed');
        return true;
    }

    // ============================================================
    // ======================= ИНИЦИАЛИЗАЦИЯ ======================
    // ============================================================

    function _ftInstallAllHooks() {
        const a = _ftInstallUpdatePlayersListHook();
        const b = _ftInstallInterfaceStatusHook();
        const c = _ftInstallInterfaceProxy();
        const d = _ftInstallChatHook();
        const e = _ftInstallProcessUpdatesHook();

        return a && b && c && d && e;
    }

    let _ftInitTries = 0;
    const _ftInitTimer = setInterval(() => {
        _ftInitTries++;

        if (_ftInstallAllHooks()) {
            clearInterval(_ftInitTimer);
            _ftDebug('[TRACKER] Friend Tracker v4 fully installed');
        } else if (_ftInitTries > 60) {
            clearInterval(_ftInitTimer);
            _ftDebug('[TRACKER] Friend Tracker v4: some hooks were not installed after 60 tries');
        }
    }, 500);

    _ftDebug(
        '[TRACKER] Friend Tracker v4 loaded.\n' +
        '  - TAB автоматически НЕ открывается\n' +
        '  - updatePlayerList + updatePlayers каждую секунду\n' +
        '  - Команды: /check /uncheck /checklist /checklevel /closetab /opentab'
    );
})();
// ==================== END FRIEND TRACKER v4 ====================
