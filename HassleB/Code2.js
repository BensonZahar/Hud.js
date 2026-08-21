// Code2.js — FRIEND TRACKER v3
// Специально под Hassle mobile: уровень друга определяется постоянно, каждую секунду.
//
// Команды в чате игры:
//   /check Nick_Name     — добавить в слежение
//   /uncheck Nick_Name   — убрать из слежения
//   /checklist           — список слежения
//   /checklevel          — текущие уровни отслеживаемых
//
// Команды в Telegram:
//   /check Nick_Name
//   /check_ Nick_Name
//   /uncheck Nick_Name
//   /uncheck_ Nick_Name
//   /checklist
//   /checklevel
//
// Важно:
// - FT_POLL_MS = 1000, проверка каждую секунду.
// - На Hassle mobile модуль может временно монтировать скрытый PlayersOnline,
//   потому что именно оттуда приходит уровень.
// - FT_SEND_LEVEL_EVERY_SECOND = false по умолчанию, чтобы не спамить Telegram.
//   Если хочешь буквально каждую секунду получать уровень в Telegram — поставь true.
//
(function () {
    'use strict';

    // ============================================================
    // ======================= НАСТРОЙКИ ==========================
    // ============================================================

    const FT_POLL_MS = 1000;                       // период опроса, 1 секунда
    const FT_COOLDOWN_MS = 60 * 1000;              // антифлуд на повторный вход
    const FT_MOUNT_HIDDEN_FOR_LEVEL = true;        // монтировать скрытый PlayersOnline на Hassle mobile
    const FT_UNMOUNT_AFTER_MS = 5000;              // через сколько скрыть источник, если все офлайн
    const FT_NOTIFY_LEVEL_CHANGE = true;           // уведомлять, если уровень изменился
    const FT_SEND_LEVEL_EVERY_SECOND = false;      // true = слать уровень в TG каждую секунду (спам!)
    const FT_DEBUG_LEVEL_EVERY_SECOND = false;     // true = писать уровень в debugLog каждую секунду

    // ============================================================
    // ======================= СОСТОЯНИЕ ==========================
    // ============================================================

    const ft = {
        watchList: new Set(),       // нормализованные ники
        onlineNow: new Set(),       // кто сейчас онлайн
        lastLevel: {},              // последний известный уровень
        lastNotifyTs: {},           // время последнего уведомления о входе
        lastSeenNick: {},           // оригинальный регистр ника
        levelUnknownSince: {},      // когда уровень начал быть неизвестным
        lastLevelChangeTs: {},      // антифлуд на смену уровня
        lastLevelReportTs: {},      // для FT_SEND_LEVEL_EVERY_SECOND
        pollTimer: null,            // интервал опроса
        hiddenMounted: false,       // мы сами подняли скрытый PlayersOnline
        hiddenClosedByUserTs: 0,    // если пользователь закрыл наш скрытый интерфейс
        lastAnyOnlineTs: 0          // когда последний раз кто-то из списка был онлайн
    };

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
        } catch (e) {
            // тихо
        }
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
        } catch (e) {
            // тихо
        }
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

    function _ftAppReady() {
        return !!(
            window.App &&
            window.App.components &&
            (typeof window.component === 'function' || window.App.components.PlayersOnline)
        );
    }

    function _ftGetComponent(name) {
        try {
            if (typeof window.component === 'function') {
                const c = window.component(name);
                if (c) return c;
            }
        } catch (e) {
            // тихо
        }

        try {
            if (window.App && window.App.components) {
                return window.App.components[name] || null;
            }
        } catch (e) {
            // тихо
        }

        return null;
    }

    function _ftIsHassleMobile() {
        try {
            return !!(
                window.App &&
                window.App.isMobile &&
                window.App.engine &&
                window.App.engine !== 'legacy'
            );
        } catch (e) {
            return false;
        }
    }

    // ============================================================
    // ================== СКРЫТЫЙ PLAYERS ONLINE ==================
    // ============================================================
    //
    // На Hassle mobile уровень приходит в PlayersOnline.
    // Если интерфейс закрыт, движок может не отдавать level.
    // Поэтому мы поднимаем PlayersOnline в скрытом режиме:
    // open.status = true, show = false.
    //
    // Это даёт источник уровня, но не мешает чату/HUD.
    // ============================================================

    function _ftMountHiddenPlayersOnline() {
        if (!_ftAppReady()) return;

        const c = _ftGetComponent('PlayersOnline');
        if (!c) {
            _ftDebug('[TRACKER] PlayersOnline component not found');
            return;
        }

        // Уже открыт пользователем или нашим прошлым циклом — не лезем.
        if (c.open && c.open.status) {
            return;
        }

        try {
            c.show = false;
            c.open.status = true;

            if (window.App && typeof window.App.$forceUpdate === 'function') {
                window.App.$forceUpdate();
            }

            ft.hiddenMounted = true;
            _ftDebug('[TRACKER] Hidden PlayersOnline mounted (level source for Hassle mobile)');
        } catch (e) {
            _ftDebug(`[TRACKER] mount hidden PlayersOnline error: ${e.message}`);
        }
    }

    function _ftUnmountHiddenPlayersOnline() {
        if (!ft.hiddenMounted) return;

        const c = _ftGetComponent('PlayersOnline');
        if (!c) {
            ft.hiddenMounted = false;
            return;
        }

        // Если пользователь вдруг сделал интерфейс видимым — не закрываем.
        if (c.show) {
            ft.hiddenMounted = false;
            return;
        }

        try {
            if (c.open && c.open.status) {
                c.open.status = false;

                if (window.App && typeof window.App.$forceUpdate === 'function') {
                    window.App.$forceUpdate();
                }

                _ftDebug('[TRACKER] Hidden PlayersOnline unmounted');
            }
        } catch (e) {
            _ftDebug(`[TRACKER] unmount hidden PlayersOnline error: ${e.message}`);
        }

        ft.hiddenMounted = false;
    }

    function _ftMaintainLevelSource() {
        const now = Date.now();

        // Если наш скрытый интерфейс кто-то закрыл — запоминаем и не мешаем.
        if (ft.hiddenMounted) {
            const c = _ftGetComponent('PlayersOnline');
            if (!c || !c.open || !c.open.status) {
                ft.hiddenMounted = false;
                ft.hiddenClosedByUserTs = now;
                _ftDebug('[TRACKER] Hidden PlayersOnline was closed externally');
            }
        }

        if (!ft.watchList.size) {
            _ftUnmountHiddenPlayersOnline();
            return;
        }

        const anyOnline = ft.onlineNow.size > 0;
        if (anyOnline) {
            ft.lastAnyOnlineTs = now;
        }

        if (!FT_MOUNT_HIDDEN_FOR_LEVEL) return;
        if (!_ftIsHassleMobile()) return;

        const c = _ftGetComponent('PlayersOnline');
        const alreadyOpenedBySomeone = !!(c && c.open && c.open.status);

        // Если кто-то из отслеживаемых онлайн — держим источник уровня.
        if (anyOnline && !alreadyOpenedBySomeone) {
            // Не открываем сразу после того, как пользователь закрыл руками.
            if (now - ft.hiddenClosedByUserTs > 5000) {
                _ftMountHiddenPlayersOnline();
            }
        }

        // Если все офлайн и прошло достаточно времени — закрываем скрытый источник.
        if (!anyOnline && now - ft.lastAnyOnlineTs > FT_UNMOUNT_AFTER_MS) {
            _ftUnmountHiddenPlayersOnline();
        }
    }

    // ============================================================
    // ======================= ОПРОС ==============================
    // ============================================================

    function _ftEnsurePoll() {
        if (ft.pollTimer !== null) return;

        ft.pollTimer = setInterval(() => {
            if (!ft.watchList.size) {
                _ftStopPoll();
                _ftUnmountHiddenPlayersOnline();
                return;
            }

            try {
                const po = _ftGetComponent('PlayersOnline');
                const playersOnlineOpened = !!(po && po.open && po.open.status);

                // Если PlayersOnline уже открыт (пользователем или нашим скрытым mount),
                // он сам опрашивает список раз в секунду.
                // Если нет — опрашиваем вручную.
                if (!playersOnlineOpened && typeof window.updatePlayerList === 'function') {
                    window.updatePlayerList();
                }
            } catch (e) {
                _ftDebug(`[TRACKER] updatePlayerList error: ${e.message}`);
            }

            _ftMaintainLevelSource();
        }, FT_POLL_MS);

        _ftDebug(`[TRACKER] Level poll started: every ${FT_POLL_MS / 1000}s`);
    }

    function _ftStopPoll() {
        if (ft.pollTimer === null) return;

        clearInterval(ft.pollTimer);
        ft.pollTimer = null;

        _ftDebug('[TRACKER] Level poll stopped');
    }

    // ============================================================
    // ======================= КОМАНДЫ ============================
    // ============================================================

    function _ftAdd(rawNick) {
        const norm = _ftNorm(rawNick);
        if (!norm) return;

        const isNew = !ft.watchList.has(norm);
        ft.watchList.add(norm);

        _ftEnsurePoll();

        // Сразу запрашиваем список игроков.
        try {
            if (typeof window.updatePlayerList === 'function') {
                window.updatePlayerList();
            }
        } catch (e) {
            // тихо
        }

        _ftMaintainLevelSource();

        const listStr = [...ft.watchList].join(', ') || '—';

        _ftChatNotify(`Слежение: +${rawNick}`);
        _ftTg(
            `👁 <b>Слежение добавлено — ${_ftDisplayName()}</b>\n` +
            `🎯 Ник: <code>${rawNick}</code>\n` +
            `📋 Список [${ft.watchList.size}]: ${listStr}\n` +
            `⏱ Проверка уровня: каждую секунду`
        );

        _ftDebug(`[TRACKER] Added "${norm}" (${isNew ? 'new' : 'already in list'})`);
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
            _ftUnmountHiddenPlayersOnline();
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

        _ftDebug(`[TRACKER] Removed "${norm}" (was in list: ${existed})`);
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
        _ftDebug(`[TRACKER] /checklist sent (${ft.watchList.size})`);
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
        _ftDebug('[TRACKER] /checklevel sent');
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
                            // level 0 -> level > 0
                            _ftChatNotify(`✅ ${displayNick} авторизовался (уровень ${currLevel})`);
                            _ftTg(
                                `✅ <b>Игрок авторизовался — ${_ftDisplayName()}</b>\n` +
                                `👤 <code>${displayNick}</code>\n` +
                                `📈 Уровень: <b>${currLevel}</b>`
                            );

                            _ftDebug(`[TRACKER] AUTH DONE: "${displayNick}", level=${currLevel}`);
                        } else if (prevLevel !== currLevel) {
                            // уровень изменился
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

                        // Опциональный спам уровнем каждую секунду.
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
                        // Не затираем известный уровень нулём, если это пришёл пустой канал.
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

        if (ft.onlineNow.size > 0) {
            ft.lastAnyOnlineTs = now;
        }
    }

    // ============================================================
    // ============ КАНАЛ 1: onUpdatePlayersList ==================
    // ============================================================

    let _ftInsideUpdate = false;

    const _ftOrigOnUpdatePlayers = window.onUpdatePlayersList;
    window.onUpdatePlayersList = function (e) {
        try {
            _ftCheck(e);
        } catch (err) {
            _ftDebug(`[TRACKER] onUpdatePlayersList error: ${err.message}`);
        }

        if (typeof _ftOrigOnUpdatePlayers === 'function') {
            _ftInsideUpdate = true;
            try {
                return _ftOrigOnUpdatePlayers.apply(this, arguments);
            } finally {
                _ftInsideUpdate = false;
            }
        }
    };

    // ============================================================
    // ======= getInterfaceStatus hook (только на момент апдейта) =
    // ============================================================
    //
    // Это нужно, чтобы оригинальный код:
    //   window.getInterfaceStatus("PlayersOnline") && window.interface("PlayersOnline")...
    // мог передать данные в наш перехватчик, даже если интерфейс не открыт.
    //
    // Важно: мы НЕ подделываем статус глобально, только внутри onUpdatePlayersList,
    // чтобы не ломать TAB и другие проверки.
    // ============================================================

    const _ftOrigGetInterfaceStatus = window.getInterfaceStatus;
    if (typeof _ftOrigGetInterfaceStatus === 'function') {
        window.getInterfaceStatus = function (name) {
            if (
                name === 'PlayersOnline' &&
                ft.watchList.size > 0 &&
                _ftInsideUpdate
            ) {
                return true;
            }

            return _ftOrigGetInterfaceStatus.apply(this, arguments);
        };

        _ftDebug('[TRACKER] getInterfaceStatus hook installed (scoped)');
    }

    // ============================================================
    // ========== КАНАЛ 2: window.interface Proxy =================
    // ============================================================

    function _ftInstallInterfaceProxy() {
        if (typeof window.interface !== 'function') {
            return false;
        }

        if (window.interface.__ftPatched) {
            return true;
        }

        const _origIface = window.interface;

        const patched = function (name) {
            const inst = _origIface.apply(this, arguments);

            if (name !== 'PlayersOnline') {
                return inst;
            }

            const realInst =
                inst !== null &&
                inst !== undefined &&
                inst !== false
                    ? inst
                    : null;

            // Если интерфейс реально не смонтирован и слежение пустое —
            // не мешаем оригинальному поведению.
            if (!realInst && ft.watchList.size === 0) {
                return inst;
            }

            const target = realInst || {};

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
                                _ftDebug(`[TRACKER] PO proxy error: ${e.message}`);
                            }

                            if (realInst) {
                                const fn = realInst[prop];
                                if (typeof fn === 'function') {
                                    return fn.apply(realInst, arguments);
                                }
                            }
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

        _ftDebug('[TRACKER] window.interface proxy installed for PlayersOnline');
        return true;
    }

    if (!_ftInstallInterfaceProxy()) {
        let tries = 0;
        const proxyTimer = setInterval(() => {
            if (_ftInstallInterfaceProxy()) {
                clearInterval(proxyTimer);
            } else {
                tries++;
                if (tries > 30) {
                    clearInterval(proxyTimer);
                    _ftDebug('[TRACKER] window.interface proxy not installed after 30 tries');
                }
            }
        }, 1000);
    }

    // ============================================================
    // ============ ХУК ЧАТА ИГРЫ: /check /uncheck ================
    // ============================================================

    const _ftOrigChat = window.sendChatInput;
    window.sendChatInput = function (input) {
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
        }

        if (typeof _ftOrigChat === 'function') {
            return _ftOrigChat.apply(this, arguments);
        }

        return undefined;
    };

    // ============================================================
    // ============ ХУК TELEGRAM: processUpdates ==================
    // ============================================================

    function _ftInstallProcessUpdatesHook() {
        if (typeof processUpdates !== 'function') {
            return false;
        }

        if (processUpdates.__ftPatched) {
            return true;
        }

        const _ftOrigProcUpd = processUpdates;

        const patched = function (updates) {
            const pass = [];

            for (const upd of updates) {
                let consumed = false;

                try {
                    if (upd && upd.message && upd.message.text) {
                        const msgText = upd.message.text.trim();
                        const msgChatId = String(
                            upd.message.chat && upd.message.chat.id
                        );

                        const allowed =
                            typeof config !== 'undefined' &&
                            Array.isArray(config.chatIds) &&
                            config.chatIds.includes(msgChatId);

                        if (allowed) {
                            let m;

                            // /check Nick_Name
                            // /check Nick Name
                            // Но не /checklist и не /checklevel
                            m = msgText.match(/^\/check(?!list|level)[_ ](.+)$/i);
                            if (m) {
                                _ftAdd(m[1].trim().replace(/_/g, ' '));
                                consumed = true;
                            }

                            // /uncheck Nick_Name
                            if (!consumed) {
                                m = msgText.match(/^\/uncheck[_ ](.+)$/i);
                                if (m) {
                                    _ftRemove(m[1].trim().replace(/_/g, ' '));
                                    consumed = true;
                                }
                            }

                            if (!consumed && /^\/checklist$/i.test(msgText)) {
                                _ftList();
                                consumed = true;
                            }

                            if (!consumed && /^\/checklevel$/i.test(msgText)) {
                                _ftLevelReport();
                                consumed = true;
                            }

                            if (consumed) {
                                try {
                                    config.lastUpdateId = upd.update_id;
                                    if (typeof setSharedLastUpdateId === 'function') {
                                        setSharedLastUpdateId(config.lastUpdateId);
                                    }
                                } catch (e) {
                                    // тихо
                                }
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
                return _ftOrigProcUpd.apply(this, [pass]);
            }
        };

        patched.__ftPatched = true;
        processUpdates = patched;

        _ftDebug('[TRACKER] processUpdates hook installed');
        return true;
    }

    if (!_ftInstallProcessUpdatesHook()) {
        let tries = 0;
        const puTimer = setInterval(() => {
            if (_ftInstallProcessUpdatesHook()) {
                clearInterval(puTimer);
            } else {
                tries++;
                if (tries > 30) {
                    clearInterval(puTimer);
                    _ftDebug('[TRACKER] processUpdates hook not installed after 30 tries');
                }
            }
        }, 1000);
    }

    // ============================================================
    // ======================= ФИНАЛЬНЫЙ ЛОГ ======================
    // ============================================================

    _ftDebug(
        '[TRACKER] Friend Tracker v3 loaded.\n' +
        '  - Poll every 1 second\n' +
        '  - Hassle mobile level source: hidden PlayersOnline\n' +
        '  - Channels: onUpdatePlayersList + interface proxy + manual poll\n' +
        '  - Commands: /check, /uncheck, /checklist, /checklevel'
    );
})();
// ==================== END FRIEND TRACKER v3 ====================
