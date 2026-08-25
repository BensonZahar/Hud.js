// ┌──────────────────────────────────────────────────────────┐
// │  НАСТРОЙКИ — меняй здесь                                │
// └──────────────────────────────────────────────────────────┘
const BOT_NAME = 'Hassle | BotЗавод'; // Имя бота в приветственном сообщении

// ╔══════════════════════════════════════════════════════════╗
// ║  MODULE: GLOBAL STATE                                    ║
// ║  Описание: Глобальные флаги состояния                    ║
// ║             (AFK, тюрьма, ID последних сообщений)        ║
// ║  Зависимости: нет                                        ║
// ╚══════════════════════════════════════════════════════════╝
// START GLOBAL STATE MODULE //
const globalState = {
    lastWelcomeMessageId: null,
    lastPaydayMessageIds: [],
    isPrison: false,       // Флаг для игнора /rec при кике после посадки
    inPrison: false,       // Активный режим тюрьмы (скин 50)
    prisonTimeRequested: false, // Флаг: уже запросили /time
    prisonTimeTimer: null,  // Таймер периодического опроса /time
    // Лог сессии (последние 20 событий)
    sessionLog: [],
    sessionStartTime: null,
    // HP alert state
    hpAlertMessageIds: [],   // { chatId, messageId }
    hpLastHitTime: null,     // Время последнего удара
    hpLastValue: null,       // Предыдущее значение HP
    _hpSendPending: false,   // Флаг ожидания callback sendMessage (защита от дублей)
    _hpGraceUntil: null,     // Время окончания grace period после спавна (игнорируем изменения HP)

    welcomeShowSettings: false, // Флаг показа блока настроек в приветственном сообщении
    otygrovkaMode: false,       // Режим «Отыгровка 27 мин» — ждём /c 60 и считываем время
    otygrovkaTimeInHour: null,  // Последнее считанное «Время в игре за час»
    // ── Авто-цикл отыгровки ────────────────────────────────────
    otygrovkaAuto: false,          // Полный автоматический 27-мин цикл активен
    otygrovkaInitialSec: 0,        // Секунды «Время в игре за час» из /c 60 (начальная точка)
    otygrovkaPlaySec: 0,           // Накопленное время IN-GAME (spawned + не пауза), секунды
    otygrovkaTrackInterval: null,  // setInterval — тикает каждую секунду
    otygrovkaExitTimer: null,      // setTimeout — выход в :59:20
    otygrovkaCurrentTime: null,    // «Текущее время» из последнего /c 60
    scriptLoadTime: null // не используется (версия берётся из CODE_COMMIT_INFO)
};
// END GLOBAL STATE MODULE //



// ╔══════════════════════════════════════════════════════════╗
// ║  MODULE: CHAT RADIUS                                     ║
// ║  Описание: Определение радиуса чата по цвету сообщения   ║
// ║             SELF / CLOSE / MEDIUM / FAR / RADIO          ║
// ║  Зависимости: нет                                        ║
// ╚══════════════════════════════════════════════════════════╝
// START CHAT RADIUS MODULE //
const CHAT_RADIUS = {
    SELF: 0,
    CLOSE: 1,
    MEDIUM: 2,
    FAR: 3,
    RADIO: 4,
    UNKNOWN: -1
};
function normalizeColor(color) {
    // FIX: защита от undefined/null — системные сообщения иногда приходят без цвета
    if (color === undefined || color === null) return '0x000000';
    // FIX: если цвет пришёл как число (например 16420864 = 0xF68C00) — конвертируем через toString(16)
    if (typeof color === 'number') {
        return '0x' + color.toString(16).toUpperCase().padStart(6, '0').slice(-6);
    }
    let normalized = color.toString().toUpperCase();
    if (normalized.startsWith('#')) normalized = normalized.slice(1);
    if (normalized.startsWith('0X')) normalized = normalized.slice(2);
    if (normalized.length === 8) normalized = normalized.slice(0, 6);
    return '0x' + normalized;
}
function getChatRadius(color) {
    const normalizedColor = normalizeColor(color);
    switch (normalizedColor) {
        case '0xEEEEEE': return CHAT_RADIUS.SELF;
        case '0xCECECE': return CHAT_RADIUS.CLOSE;
        case '0x999999': return CHAT_RADIUS.MEDIUM;
        case '0x6B6B6B': return CHAT_RADIUS.FAR;
        case '0x33CC66': return CHAT_RADIUS.RADIO;
        default: return CHAT_RADIUS.UNKNOWN;
    }
}
// END CHAT RADIUS MODULE //

// ╔══════════════════════════════════════════════════════════╗
// ║  MODULE: FACTIONS                                        ║
// ║  Описание: Данные фракций — цвета, скины, ранги          ║
// ║             (government, mz, trk, mo, mchs, mvd, fsb)   ║
// ║  Зависимости: нет                                        ║
// ╚══════════════════════════════════════════════════════════╝
// START FACTIONS MODULE //
const factions = {
    government: {
        color: 'CCFF00',
        skins: [57, 141, 147, 164, 165, 187, 208, 227],
        ranks: {
            1: 'водитель', 2: 'охранник', 3: 'нач. охраны', 4: 'секретарь',
            5: 'старший секретарь', 6: 'лицензёр', 7: 'адвокат', 8: 'депутат',
            9: 'вице-губернатор', 10: 'губернатор'
        }
    },
    mz: {
        color: 'FF6666',
        skins: [276, 15381, 15382, 15383, 15384, 15385, 15386, 15387, 15388, 15389],
        ranks: {
            1: 'интерн', 2: 'фельдшер', 3: 'участковый врач', 4: 'терапевт',
            5: 'проктолог', 6: 'нарколог', 7: 'хирург', 8: 'зав. отделом',
            9: 'заместитель глав врача', 10: 'глав врач'
        }
    },
    trk: {
        color: 'FF6600',
        skins: [15438, 15439, 15440, 15441, 15442, 15443, 15444, 15445, 15446, 15447],
        ranks: {
            1: 'стажер', 2: 'светотехник', 3: 'монтажер', 4: 'оператор',
            5: 'дизайнер', 6: 'репортер', 7: 'ведущий', 8: 'режиссер',
            9: 'редактор', 10: 'гл. редактор'
        }
    },
    mo: {
        color: '996633',
        skins: [30, 61, 179, 191, 253, 255, 287, 162, 218, 220],
        ranks: {
            1: 'рядовой', 2: 'ефрейтор', 3: 'сержант', 4: 'прапорщик',
            5: 'лейтенант', 6: 'капитан', 7: 'майор', 8: 'подполковник',
            9: 'полковник', 10: 'генерал'
        }
    },
    mchs: {
        color: '009999',
        skins: [15316, 15365, 15366, 15367, 15368, 15369, 15370, 15371, 15372, 15373, 15374, 15375, 15376, 15377, 15378, 15396, 15397],
        ranks: {
            1: 'рядовой', 2: 'сержант', 3: 'старшина', 4: 'прапорщик',
            5: 'лейтенант', 6: 'капитан', 7: 'майор', 8: 'подполковник',
            9: 'полковник', 10: 'генерал'
        }
    },
    mvd: {
        color: '0000FF',
        skins: [15321, 15323, 15325, 15330, 15332, 15334, 15335, 190, 148, 15340, 15341, 15342, 15343, 15344, 15348, 15351],
        ranks: {
            1: 'рядовой', 2: 'сержант', 3: 'старшина', 4: 'прапорщик',
            5: 'лейтенант', 6: 'капитан', 7: 'майор', 8: 'подполковник',
            9: 'полковник', 10: 'генерал'
        }
    },
    fsb: {
        color: '7F7F7F',
        skins: [15346, 15349, 17034, 17035, 17036, 17037, 17082, 17083, 17084],
        highRankThreshold: 4, // Строй/рация: учитываем с 4 ранга (подполковник, полковник, генерал)
        ranks: {
            1: 'старший лейтенант', 2: 'капитан', 3: 'майор',
            4: 'подполковник', 5: 'полковник', 6: 'генерал'
        }
    }
};
// Короткие русские названия фракций для отображения в Telegram
const FACTION_NAMES = {
    government: 'Правительство',
    mz:         'МЗ',
    trk:        'ТРК',
    mo:         'МО',
    mchs:       'МЧС',
    mvd:        'МВД',
    fsb:        'ФСБ'
};
function getFactionLabel(factionKey) {
    return factionKey ? (FACTION_NAMES[factionKey] || factionKey.toUpperCase()) : null;
}
// END FACTIONS MODULE //

// ╔══════════════════════════════════════════════════════════╗
// ║  MODULE: CONFIG                                          ║
// ║  Описание: Основной конфиг бота, настройки и состояние   ║
// ║             аккаунта (ник, сервер, скин, фракция)        ║
// ║  Зависимости: CHAT_IDS, DEFAULT_TOKEN, ACCOUNT_TOKEN,    ║
// ║               PASSWORD, RECONNECT_ENABLED_DEFAULT        ║
// ║               (инжектируются из List.js через Load.js)   ║
// ╚══════════════════════════════════════════════════════════╝
// START CONFIG MODULE //
const config = {
    chatIds: CHAT_IDS,
    keywords: [],
    clearDelay: 3000,
    maxAttempts: 15,
    checkInterval: 2000, // пауза перед retry только при ошибке сети
    debug: true,
    podbrosCooldown: 30000,
    afkSettings: {},
    lastSalaryInfo: null,
    paydayNotifications: true,
    trackPlayerId: true,
    idCheckInterval: 10000,
    govMessagesEnabled: true,
    govMessageCooldown: 360000,
    govMessageThreshold: 10,
    govMessageKeywords: ["тут", "здесь"],
    trackLocationRequests: false,
    locationKeywords: ["местоположение", "место", "позиция", "координаты"],
    radioOfficialNotifications: false,  // Все сообщения рации — изначально ВЫКЛ
    radioImportantFilter: true,         // Фильтр важных сообщений рации (строй/место/ID) — изначально ВКЛ
    warningNotifications: true,
    trackSkinId: true,
    skinCheckInterval: 5000,
    locationLogging: false,        // Логировать координаты персонажа в консоль
    locationLogInterval: 3000,    // Интервал логирования координат (мс)
    moneyLogging: false,           // Логировать Нал и Банк персонажа в консоль
    moneyLogInterval: 5000,       // Интервал логирования денег (мс)
    autoReconnectEnabled: RECONNECT_ENABLED_DEFAULT,
    hpTracking: true,              // Отслеживание HP и уведомление об уроне
    kacAutoReply: false,           // Автоответ КАЧ/ЗП
    botToken: window.ACCOUNT_TOKEN || DEFAULT_TOKEN, // FIX: botToken был undefined — AFK-статус и диалоги не отправлялись
    lastUpdateId: 0,
    activeUsers: {},
    lastPodbrosTime: 0,
    podbrosCounter: 0,
    initialized: false,
    accountInfo: {
        nickname: null,
        server: null,
        skinId: null,
        profile: {
            loaded:      false,
            rank:        null,   // organization.rangName  — название звания
            rankNum:     null,   // organization.rang      — номер звания
            orgTitle:    null,   // organization.title     — название фракции
            status:      null,   // info.status            — должность/статус
            level:       null,   // level.value            — уровень
            xpCurrent:   null,   // level.score.current    — текущий опыт
            xpTarget:    null,   // level.score.target     — опыт до след. уровня
            cash:        null,   // about[0].value         — наличные
            bank:        null,   // about[1].value         — банковский счёт
            phone:       null,   // contacts.phone.value   — номер телефона
            simBalance:  null,   // contacts.simBalance    — баланс SIM
            stamina:     null,   // physicalStats.stamina  — выносливость %
            strength:    null,   // physicalStats.strength — сила %
            housesCount: null,   // property.houses        — кол-во домов
            bizCount:    null,   // property.businesses    — кол-во бизнесов
            carsCount:   null,   // property.cars          — кол-во машин
            subscribe:   null,   // info.subscribe.type    — подписка
            buffs:       [],     // активные баффы
            jobs:        [],     // работы
        }
    },
    currentFaction: null,
    lastPlayerId: null,
    govMessageTrackers: {},
    isSitting: false,
    ignoredStroiNicknames: ['Denis_Bymer'], // <-- ДОБАВЬТЕ ЭТУ СТРОКУ
    afkCycle: {
        active: false,
        startTime: null,
        totalPlayTime: 0,
        currentPlayTime: 0,
        currentPauseTime: 0,
        cycleTimer: null,
        playTimer: null,
        pauseTimer: null,
        mainTimer: null,
        mode: 'fixed',
        playHistory: [],
        pauseHistory: [],
        statusMessageIds: [],
        totalSalary: 0,
        reconnectEnabled: RECONNECT_ENABLED_DEFAULT, // <-- по умолчанию включён
        restartAction: 'q' // Новый параметр: 'q' или 'rec' для действия при рестарте сервера
    },
    nicknameLogged: false
};
const accountToken = window.ACCOUNT_TOKEN || DEFAULT_TOKEN;
let displayName = `User [S${config.accountInfo.server || 'Не указан'}]`;
let uniqueId = `${config.accountInfo.nickname}_${config.accountInfo.server}`;
// ┌─────────────────────────────────────────────────────────┐
// │  Флаг подавления "потеряно соединение" после /rec 5     │
// └─────────────────────────────────────────────────────────┘
(function() {
    const _orig = window.sendChatInput;
    let _recInFlight = false;

    window.sendChatInput = function(cmd) {
        const isRec = typeof cmd === 'string' && /^\/rec\b/i.test(cmd.trim());

        if (isRec) {
            // Защита: не пускаем второй /rec, пока первый ещё обрабатывается
            if (_recInFlight) {
                debugLog('[REC] Повторный /rec во время реконнекта — проигнорирован');
                return undefined;
            }
            _recInFlight = true;
            window.__afterRec5 = true;

            // Сбрасываем hpLastValue и grace period — следующий тик после спавна
            // только запишет baseline, без сравнения (как при первом входе).
            // Grace period запустится заново в trackPlayerHp при первом connected тике.
            if (typeof globalState !== 'undefined') {
                globalState.hpLastValue    = null;
                globalState._hpGraceUntil  = null;
                globalState._hpGraceActive = false;
            }
        }

        const result = typeof _orig === 'function'
            ? _orig.apply(this, arguments)
            : undefined; // FIX: защита от undefined если sendChatInput ещё не инициализирован

        if (isRec) {
            // ⚠️ НЕ вызываем setPlayerConnectedStatus(false)!
            // Движок сам сменит статус при реальном дисконнекте.
            // Ручной commit запускал второй параллельный disconnect-flow
            // и двойное открытие Authorization → вылет.
            setTimeout(() => { _recInFlight = false; }, 5000);
        }

        return result;
    };
})();

const reconnectionCommand = RECONNECT_ENABLED_DEFAULT ? "/rec 5" : "/q";
// END CONFIG MODULE //

// ╔══════════════════════════════════════════════════════════╗
// ║  MODULE: PLAYER PROFILE LOADER                           ║
// ║  Описание: При входе в игру один раз невидимо открывает  ║
// ║             MainMenu → Statistics и считывает все данные ║
// ║             профиля: звание, фракция, уровень, деньги,   ║
// ║             телефон, физ. хар-ки, имущество, баффы.      ║
// ║  Зависимости: config, debugLog, sendToTelegram,          ║
// ║               displayName, tgApi, uniqueId               ║
// ╚══════════════════════════════════════════════════════════╝
// START PLAYER PROFILE LOADER MODULE //
(function() {
    'use strict';
    var _fetching  = false;
    var _origCursor = null, _origLabel = null, _patchActive = false, _obs = null;
    // Счётчик повторов хранится в globalState — доступен снаружи IIFE
    if (!globalState.profileRetry) globalState.profileRetry = 0;

    // ── Скрываем курсор меню и ники не пропадают ──
    function _applyPatch() {
        _patchActive = true;
        _origCursor = window.setCursorStatus;
        _origLabel  = window.setDrawLabelStatus;
        window.setCursorStatus = function(name, status, allow) {
            if (_patchActive && name === 'MainMenu') {
                try { if (typeof engine !== 'undefined') engine.trigger('SetCursorStatus', false, true); } catch(e) {}
                return;
            }
            return _origCursor && _origCursor.apply(this, arguments);
        };
        window.setDrawLabelStatus = function(s) {
            if (_patchActive && !s) return; // блокируем скрытие ников
            return _origLabel && _origLabel.apply(this, arguments);
        };
    }
    function _restorePatch() {
        _patchActive = false;
        if (_origCursor) window.setCursorStatus = _origCursor;
        if (_origLabel)  { window.setDrawLabelStatus = _origLabel; try { _origLabel.call(window, true); } catch(e) {} }
    }

    // ── Прячем DOM главного меню через MutationObserver (без мерцания) ──
    function _hideMenu() {
        if (_obs) { _obs.disconnect(); _obs = null; }
        _obs = new MutationObserver(function() {
            var el = document.querySelector('.main-menu');
            if (el) { el.style.opacity = '0'; el.style.pointerEvents = 'none'; _obs.disconnect(); _obs = null; }
        });
        _obs.observe(document.documentElement, { childList: true, subtree: true });
    }
    function _unobserve() { if (_obs) { _obs.disconnect(); _obs = null; } }

    // ── Отключаем hideHud/hideChat чтобы меню не ломало интерфейс ──
    function _patchOptions() {
        try {
            var c = window.App && window.App.components && window.App.components.MainMenu;
            if (!c || !c.options) return;
            c.__rHud = c.options.hideHud; c.__rChat = c.options.hideChat;
            c.options.hideHud = false; c.options.hideChat = false;
        } catch(e) {}
    }
    function _restoreOptions() {
        try {
            var c = window.App && window.App.components && window.App.components.MainMenu;
            if (!c || !c.options) return;
            if (c.__rHud  !== undefined) c.options.hideHud  = c.__rHud;
            if (c.__rChat !== undefined) c.options.hideChat = c.__rChat;
        } catch(e) {}
    }

    // ── Проверка: это mock-данные сервера или уже реальные? ──
    function _isMock(org) {
        return !org || org.rangName === 'Officer' || org.title === 'Police departament';
    }

    // ── Извлекаем все поля из mm.statistics ──
    function _extract(mm) {
        try {
            var s = mm.statistics;
            if (!s || s.isLoading) return null;
            var org  = s.organization || {};
            var info = s.info         || {};
            var lvl  = s.level        || {};
            var ph   = s.physicalStats || {};
            var ct   = s.contacts     || {};
            var ab   = s.about        || [];
            var prop = s.property     || {};
            var sub  = (info.subscribe || {}).type;

            if (_isMock(org)) return null;

            return {
                rank:        org.rangName   || null,
                rankNum:     org.rang       || null,
                orgTitle:    org.title      || null,
                status:      info.status    || null,
                level:       lvl.value      || null,
                xpCurrent:   (lvl.score || {}).current || null,
                xpTarget:    (lvl.score || {}).target  || null,
                cash:        (ab[0] || {}).value       || null,
                bank:        (ab[1] || {}).value       || null,
                phone:       (ct.phone      || {}).value      || null,
                simBalance:  (ct.simBalance || {}).value      || null,
                stamina:     (ph.stamina    || {}).value      || null,
                strength:    (ph.strength   || {}).value      || null,
                housesCount: prop.houses    || 0,
                bizCount:    prop.businesses|| 0,
                carsCount:   prop.cars      || 0,
                propertiesDetail: (s.properties || []).map(function(pr) {
                    return {
                        name:        pr.name || '',
                        icon:        pr.icon || '',
                        days:        pr.days || null,
                        isApartment: !!(pr.name && (pr.name.indexOf('Квартира') !== -1 || pr.name.indexOf('квартира') !== -1)),
                    };
                }),
                subscribe:   sub            || null,
                buffs:       (s.buffs       || []).map(function(b) { return { text: b.text, leftTime: b.leftTime, debuff: !!b.debuff }; }),
                jobs:        (s.jobs        || []).map(function(j) { return { id: j.id, title: j.title, lvl: j.lvl }; }),
            };
        } catch(e) { return null; }
    }

    // ── Главная функция: считывает профиль ОДИН РАЗ ──
    function loadPlayerProfile(callback) {
        // Уже загружено
        if (config.accountInfo.profile && config.accountInfo.profile.loaded) {
            if (callback) callback(config.accountInfo.profile);
            return;
        }
        // Уже идёт загрузка — встаём в очередь
        if (_fetching) {
            var wait = setInterval(function() {
                if (!_fetching) { clearInterval(wait); if (callback) callback(config.accountInfo.profile); }
            }, 100);
            return;
        }

        _fetching = true;
        window._hassleProfileLoading = true;
        debugLog('[Profile] 🔄 Загружаем профиль через MainMenu...');

        var _done = false, _wd = null;
        var _wasOpen = false;
        try { _wasOpen = !!window.getInterfaceStatus('MainMenu'); } catch(e) {}

        function _finish(data) {
            if (_done) return;
            _done = true;
            if (_wd) { clearTimeout(_wd); _wd = null; }

            if (!_wasOpen) {
                try {
                    var mmC = window.interface('MainMenu');
                    if (mmC && typeof mmC.sendCloseEvent === 'function') mmC.sendCloseEvent();
                    else if (typeof window.sendClientEvent === 'function') window.sendClientEvent(0, 'MainMenu_OnPlayerCloseInterface');
                } catch(e) {}
                try { window.closeInterface('MainMenu'); } catch(e) {}
            }
            _restoreOptions();
            _restorePatch();
            _unobserve();
            _fetching = false;
            window._hassleProfileLoading = false;

            if (data) {
                Object.assign(config.accountInfo.profile, data);
                config.accountInfo.profile.loaded = true;
                globalState.profileRetry = 0; // сбрасываем счётчик — успех
                debugLog('[Profile] ✅ Профиль загружен: ' + data.rank + ' / ' + data.orgTitle + ' / Ур.' + data.level);
                // Обновляем приветственное сообщение с полными данными профиля
                setTimeout(function() { if (typeof sendWelcomeMessage === 'function') sendWelcomeMessage(); }, 500);
            } else {
                debugLog('[Profile] ⚠️ Профиль не получен — данные недоступны');
                if (globalState.profileRetry < 3) {
                    globalState.profileRetry++;
                    var retryDelaySec = globalState.profileRetry * 15; // 15с, 30с, 45с
                    debugLog('[Profile] 🔄 Повтор через ' + retryDelaySec + 'с (попытка ' + globalState.profileRetry + '/3)');
                    // Обновляем сообщение — покажем частичные данные (фракция/скин уже известны)
                    setTimeout(function() { if (typeof sendWelcomeMessage === 'function') sendWelcomeMessage(); }, 500);
                    setTimeout(function() { loadPlayerProfile(callback); }, retryDelaySec * 1000);
                } else {
                    globalState.profileRetry = 0;
                    debugLog('[Profile] ❌ Все попытки загрузки профиля исчерпаны');
                    // Всё равно обновляем сообщение — хотя бы скин/фракция отобразятся
                    setTimeout(function() { if (typeof sendWelcomeMessage === 'function') sendWelcomeMessage(); }, 500);
                }
            }
            if (callback) callback(data ? config.accountInfo.profile : null);
        }

        // Аварийный предохранитель 8 сек
        _wd = setTimeout(function() {
            debugLog('[Profile] ⏰ Watchdog — завершаем принудительно');
            _finish(null);
        }, 8000);

        _patchOptions();
        _applyPatch();
        if (!_wasOpen) _hideMenu();

        if (!_wasOpen) {
            try { window.openInterface('MainMenu'); }
            catch(e) { _finish(null); return; }
        }

        setTimeout(function() {
            if (_done) return;
            var mm = window.interface('MainMenu');
            if (!mm) { _finish(null); return; }
            try { if (typeof mm.selectTab === 'function') mm.selectTab('Statistics'); } catch(e) {}

            var attempts = 0, lastKey = null, stable = 0;
            var poll = setInterval(function() {
                if (_done) { clearInterval(poll); return; }
                attempts++;
                var d = _extract(mm);
                if (d) {
                    var key = (d.rank || '') + '|' + (d.orgTitle || '') + '|' + (d.level || '');
                    if (key === lastKey) { stable++; } else { lastKey = key; stable = 1; }
                } else {
                    lastKey = null; stable = 0;
                }
                if ((d && stable >= 2) || attempts >= 35) {
                    clearInterval(poll);
                    setTimeout(function() { _finish(d || null); }, 150);
                }
            }, 200);
        }, 600);
    }

    // ── Отправляем карточку профиля в Telegram после загрузки ──
    function _sendProfileNotification(p) {
        try {
            var sub = p.subscribe ? '✅ ' + p.subscribe : '❌ Нет';
            // Нал и банк берём из Vuex store — там актуальные значения
            var _liveMoneyData = (function() { try { return getPlayerMoneyFromStore(); } catch(e) { return null; } })();
            var cash = (_liveMoneyData && _liveMoneyData.money !== null)
                ? _liveMoneyData.money.toLocaleString('ru-RU') + ' руб'
                : (p.cash !== null ? p.cash.toLocaleString('ru-RU') + ' руб' : '—');
            var bank = (_liveMoneyData && _liveMoneyData.bankMoney !== null)
                ? _liveMoneyData.bankMoney.toLocaleString('ru-RU') + ' руб'
                : (p.bank !== null ? p.bank.toLocaleString('ru-RU') + ' руб' : '—');
            var simB = p.simBalance !== null ? p.simBalance.toLocaleString('ru-RU') + ' руб' : '—';
            var phone = p.phone  !== null ? String(p.phone) : '—';
            var lvlBar = (p.xpCurrent !== null && p.xpTarget) ? ' (' + p.xpCurrent + '/' + p.xpTarget + ' XP)' : '';
            var buffsLine = p.buffs && p.buffs.length
                ? p.buffs.filter(function(b){ return !b.debuff; }).map(function(b){ return b.text; }).join(', ') || '—'
                : '—';
            var debuffsLine = p.buffs && p.buffs.length
                ? p.buffs.filter(function(b){ return b.debuff; }).map(function(b){ return b.text; }).join(', ') || '—'
                : '—';
            var jobsLine = p.jobs && p.jobs.length
                ? p.jobs.map(function(j){ return j.title + ' (ур.' + j.lvl + ')'; }).join(', ')
                : '—';

            // Donate из Vuex store
            var donateLineNotif = '';
            try {
                var _sn = window.App && window.App.$store;
                if (_sn) {
                    var dn = _sn.getters['player/donate'];
                    if (dn !== undefined && dn !== null && dn > 0) donateLineNotif = '├ 💎 Donate: ' + dn + '\n';
                }
            } catch(e) {}

            // Детали имущества
            var propDetailLines = '';
            var _pList = p.propertiesDetail || [];
            if (_pList.length > 0) {
                _pList.forEach(function(pr, idx) {
                    var isLast = idx === _pList.length - 1;
                    var prefix = isLast ? '└' : '├';
                    var typeLabel = pr.isApartment ? 'Квартира' : pr.name;
                    var dDays = pr.days;
                    var daysStr = dDays ? (dDays.current + '/' + dDays.max + ' дн.') : '—';
                    var dangerIcon = dDays && dDays.isDanger ? ' ⚠️' : '';
                    propDetailLines += prefix + ' ' + typeLabel + ': оплачен ' + daysStr + dangerIcon + '\n';
                });
                propDetailLines += 'Итого: Домов ' + (p.housesCount || 0) + '  Бизнесов ' + (p.bizCount || 0) + '  Машин ' + (p.carsCount || 0);
            } else {
                propDetailLines =
                    '├ Домов: '    + (p.housesCount || 0) + '\n' +
                    '├ Бизнесов: ' + (p.bizCount    || 0) + '\n' +
                    '└ Машин: '    + (p.carsCount   || 0);
            }

            var msg =
                '📋 <b>Профиль загружен — ' + displayName + '</b>\n' +
                '\n<b>🏛 Фракция / Звание</b>\n' +
                '├ Фракция: ' + (p.orgTitle   || '—') + '\n' +
                '├ Звание: '  + (p.rank       || '—') + (p.rankNum !== null ? ' (#' + p.rankNum + ')' : '') + '\n' +
                '└ Статус: '  + (p.status     || '—') + '\n' +
                '\n<b>📊 Прогресс</b>\n' +
                '├ Уровень: ' + (p.level !== null ? p.level : '—') + lvlBar + '\n' +
                '├ Выносливость: ' + (p.stamina  !== null ? p.stamina  + '%' : '—') + '\n' +
                '└ Сила: '         + (p.strength !== null ? p.strength + '%' : '—') + '\n' +
                '\n<b>💰 Финансы</b>\n' +
                '├ Наличные: '  + cash  + '\n' +
                '├ Банк: '      + bank  + '\n' +
                donateLineNotif +
                '├ Телефон: '   + phone + '\n' +
                '├ Баланс SIM: '+ simB  + '\n' +
                '└ Подписка: '  + sub   + '\n' +
                '\n<b>🏠 Имущество</b>\n' +
                propDetailLines + '\n' +
                '\n<b>⚡ Баффы:</b> ' + buffsLine  + '\n' +
                '<b>💀 Дебаффы:</b> ' + debuffsLine + '\n' +
                '\n<b>💼 Работы:</b> ' + jobsLine;

            sendToTelegram(msg, true, null);
        } catch(e) {
            debugLog('[Profile] Ошибка отправки профиля: ' + e.message);
        }
    }

    // ── Экспорт глобально — запуск через updateFaction() ──
    // Не используем waitForApp: на мобильном клиенте (Hassle mobile)
    // window.App готов раньше, чем сервер назначает скин.
    // Загружаем профиль только после того как подтверждён фракционный скин.
    window._hassleLoadPlayerProfile = loadPlayerProfile;
    window._hassleProfileNotification = _sendProfileNotification;  // экспорт для кнопки «Инфо об аккаунте»
    debugLog('[Profile] Модуль готов. Загрузка произойдёт при определении фракционного скина.');
})();
// END PLAYER PROFILE LOADER MODULE //


// ==================== ПАТЧ: MainMenu открывается сразу на «Персонаж» ====================
// Когда игрок нажимает M (или любой другой код открывает MainMenu напрямую),
// автоматически переключаем на вкладку Statistics («Персонаж»).
// Пока работает loadPlayerProfile (_hassleProfileLoading = true) — патч пассивен,
// чтобы не мешать невидимому считыванию данных.
(function() {
'use strict';
function applyMainMenuTabPatch() {
    var _origOI = window.openInterface;
    window.openInterface = function(name) {
        var result = _origOI.apply(this, arguments);
        if (name === 'MainMenu' && !window._hassleProfileLoading) {
            // Небольшая задержка: Vue-компонент должен смонтироваться
            setTimeout(function() {
                try {
                    var mm = window.interface && window.interface('MainMenu');
                    if (mm && typeof mm.selectTab === 'function') {
                        mm.selectTab('Statistics');
                    }
                } catch(e) {}
            }, 80);
        }
        return result;
    };
    console.log('[Hassle] Патч MainMenu→Персонаж активен');
}

// Ждём готовности App (openInterface и window.interface могут появиться позже)
(function tryApply(n) {
    if (window.openInterface && window.interface) {
        applyMainMenuTabPatch();
    } else if (n < 100) {
        setTimeout(function() { tryApply(n + 1); }, 200);
    }
})(0);
})();
// ==================== END ПАТЧ MainMenu→Персонаж ====================


// ╔══════════════════════════════════════════════════════════╗
// ║  MODULE: GLOBAL BROADCAST                                ║
// ║  Описание: Рассылка команд всем аккаунтам через          ║
// ║             Telegram-чат. Нажатие в «Общие функции»      ║
// ║             меняет config сразу у всех аккаунтов.        ║
// ║  Зависимости: config, displayName, sendToTelegram,       ║
// ║               showScreenNotification, debugLog           ║
// ╚══════════════════════════════════════════════════════════╝
// START GLOBAL BROADCAST MODULE //

// Тег, по которому все аккаунты распознают broadcast-команду
const HBGLOBAL_TAG = '#HBGLOBAL';

// Отправить глобальную команду в Telegram — её подхватят все аккаунты
function broadcastGlobalCommand(cmd, val) {
    const tag = `${HBGLOBAL_TAG}:${cmd}:${val}`;
    sendToTelegram(
        `🌐 <b>Глобальная команда от ${displayName}</b>\n` +
        `<code>${tag}</code>`,
        true, null
    );
    debugLog(`[GLOBAL] Broadcast отправлен: ${cmd} = ${val}`);
}

// Перезагрузить ТЕКУЩИЙ аккаунт + broadcast для остальных
// (боты не получают свои собственные сообщения, поэтому текущий перезагружаем напрямую)
function reloadAllAccounts() {
    if (window._hassleReloading) {
        debugLog(`[RELOAD] Уже выполняется, игнорируем`);
        return;
    }
    // Broadcast — другие аккаунты получат и перезагрузятся через handleGlobalBroadcastCommand('reload')
    broadcastGlobalCommand('reload', 'on');
    // Текущий аккаунт — перезагружаем сразу (не ждём своего же сообщения)
    window._hassleReloading = true;
    sendToTelegram(`🔄 <b>Перезагрузка скриптов для ${displayName}...</b>`, false, null);
    setTimeout(() => {
        window._hassleReloading = false;
        try {
            if (typeof window.initializeScripts === 'function') {
                window.initializeScripts();
            } else {
                sendToTelegram(`❌ <b>Ошибка ${displayName}:</b> initializeScripts не найден`, false, null);
            }
        } catch (e) {
            window._hassleReloading = false;
            sendToTelegram(`❌ <b>Ошибка перезагрузки ${displayName}:</b>\n<code>${e.message}</code>`, false, null);
        }
    }, 800);
}

// Применить глобальную команду на текущем аккаунте
function handleGlobalBroadcastCommand(cmd, val) {
    const isOn = val === 'on';
    switch (cmd) {
        case 'toggle_payday':
            config.paydayNotifications = isOn;
            showScreenNotification("Hassle", `[Global] PayDay ${isOn ? 'ВКЛ' : 'ВЫКЛ'}`);
            break;
        case 'toggle_soob':
            config.govMessagesEnabled = isOn;
            showScreenNotification("Hassle", `[Global] Сообщ. ${isOn ? 'ВКЛ' : 'ВЫКЛ'}`);
            break;
        case 'toggle_mesto':
            config.trackLocationRequests = isOn;
            showScreenNotification("Hassle", `[Global] Место ${isOn ? 'ВКЛ' : 'ВЫКЛ'}`);
            break;
        case 'toggle_radio':
            config.radioOfficialNotifications = isOn;
            showScreenNotification("Hassle", `[Global] Рация все ${isOn ? 'ВКЛ' : 'ВЫКЛ'}`);
            break;
        case 'toggle_radio_filter':
            config.radioImportantFilter = isOn;
            showScreenNotification("Hassle", `[Global] Фильтр рации ${isOn ? 'ВКЛ' : 'ВЫКЛ'}`);
            break;
        case 'toggle_warning':
            config.warningNotifications = isOn;
            showScreenNotification("Hassle", `[Global] Выговоры ${isOn ? 'ВКЛ' : 'ВЫКЛ'}`);
            break;
        case 'toggle_kac':
            config.kacAutoReply = isOn;
            showScreenNotification("Hassle", `[Global] КАЧ/ЗП автоответ ${isOn ? 'ВКЛ' : 'ВЫКЛ'}`);
            break;
        case 'reload':
            // Перезагрузка скрипта — откладываем чтобы offset успел сохраниться
            debugLog(`[GLOBAL] Получена команда перезагрузки для ${displayName}`);
            if (!window._hassleReloading) {
                window._hassleReloading = true;
                setTimeout(() => {
                    window._hassleReloading = false;
                    try {
                        if (typeof window.initializeScripts === 'function') {
                            window.initializeScripts();
                        }
                    } catch (e) {
                        window._hassleReloading = false;
                        debugLog(`[GLOBAL] Ошибка перезагрузки: ${e.message}`);
                    }
                }, 800);
            }
            break;
        default:
            debugLog(`[GLOBAL] Неизвестная команда: ${cmd}`);
    }
    debugLog(`[GLOBAL] Применена команда: ${cmd} = ${val}`);
}
// END GLOBAL BROADCAST MODULE //

// ╔══════════════════════════════════════════════════════════╗
// ║  MODULE: AUTO LOGIN                                      ║
// ║  Описание: Автоматический ввод пароля при открытии       ║
// ║             интерфейса Authorization                     ║
// ║  Зависимости: config, displayName, debugLog,             ║
// ║               sendToTelegram, showScreenNotification     ║
// ╚══════════════════════════════════════════════════════════╝
// START AUTO LOGIN MODULE //
// Настройка автовхода
const autoLoginConfig = {
    password: PASSWORD, // Ваш пароль
    enabled: true, // Флаг активации автовхода
    maxAttempts: 10, // Максимум попыток
    attemptInterval: 1000 // Интервал между попытками (мс)
};
// Функция для автоматического ввода пароля
let _autoLoginRunning = false;

function setupAutoLogin(attempt = 1) {
    if (!autoLoginConfig.enabled) {
        debugLog('Автовход отключен');
        _autoLoginRunning = false;
        return;
    }
    // Мьютекс: только одна цепочка одновременно
    if (attempt === 1) {
        if (_autoLoginRunning) {
            debugLog('[AUTOLOGIN] Цепочка уже активна — дубль пропущен');
            return;
        }
        _autoLoginRunning = true;
    }
    if (attempt > autoLoginConfig.maxAttempts) {
        _autoLoginRunning = false;
        const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось выполнить автовход после ${autoLoginConfig.maxAttempts} попыток`;
        debugLog(errorMsg);
        sendToTelegram(errorMsg, false, null);
        return;
    }
    // Проверяем, открыт ли интерфейс Authorization
    if (!window.getInterfaceStatus("Authorization")) {
        debugLog(`Попытка ${attempt}: Интерфейс Authorization не открыт, повтор через ${autoLoginConfig.attemptInterval}мс`);
        setTimeout(() => setupAutoLogin(attempt + 1), autoLoginConfig.attemptInterval);
        return;
    }
    // Получаем экземпляр Authorization
    const authInstance = window.interface("Authorization");
    if (!authInstance) {
        debugLog(`Попытка ${attempt}: Экземпляр Authorization не найден, повтор через ${autoLoginConfig.attemptInterval}мс`);
        setTimeout(() => setupAutoLogin(attempt + 1), autoLoginConfig.attemptInterval);
        return;
    }
    // Получаем экземпляр Login через getInstance("auth")
    const loginInstance = authInstance.getInstance("auth");
    if (!loginInstance) {
        debugLog(`Попытка ${attempt}: Экземпляр Login не найден, повтор через ${autoLoginConfig.attemptInterval}мс`);
        setTimeout(() => setupAutoLogin(attempt + 1), autoLoginConfig.attemptInterval);
        return;
    }
    // Устанавливаем пароль
    debugLog(`[${displayName}] Автоввод пароля: ${autoLoginConfig.password}`);
    loginInstance.password.value = autoLoginConfig.password;
    // Ждем обновления DOM и эмулируем нажатие кнопки "Войти"
    setTimeout(() => {
        if (loginInstance.password.value === autoLoginConfig.password) {
            debugLog(`[${displayName}] Эмуляция нажатия кнопки "Войти"`);
            try {
                loginInstance.onClickEvent("play");
                _autoLoginRunning = false; // освобождаем мьютекс после клика
                sendToTelegram(`✅ Автовход выполнен для ${displayName}`, true, null); // Без звука
                // /rec 5 уже сбросил isPlayerConnected → false через перехватчик.
                // hpLastValue = null означает: следующий тик после спавна
                // только запишет baseline, без сравнения — как при первом входе.
                // Grace period сбрасывается здесь тоже — trackPlayerHp запустит его заново.
                globalState.hpLastValue       = null;
                globalState._hpGraceUntil     = null;
                globalState._hpGraceActive    = false;
                globalState.hpLastHitTime     = null;
                globalState.hpAlertMessageIds = [];
                // Сброс флага спавна и профиля для нового входа
                globalState._spawnProfileLoaded = false;
                config.accountInfo.profile.loaded = false;
                // Уведомление через 3 секунды после успешного входа
                setTimeout(() => {
                    showScreenNotification(
                        "HASSLE", 
                        "Скрипт загружен.<br>Меню /hb или Телеграмм.", 
                        "FFFF00",   // жёлтый цвет
                        6000        // видно 6 секунд (можно изменить)
                    );
                }, 3000);
                // /c 60 теперь отправляется только через кнопку «Отыгровка 27 мин» в Telegram

            } catch (err) {
                _autoLoginRunning = false;
                const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось выполнить вход\n<code>${err.message}</code>`;
                debugLog(errorMsg);
                sendToTelegram(errorMsg, false, null);
                setTimeout(() => setupAutoLogin(attempt + 1), autoLoginConfig.attemptInterval);
            }
        } else {
            debugLog(`[${displayName}] Ошибка: пароль не установлен, повтор через ${autoLoginConfig.attemptInterval}мс`);
            setTimeout(() => setupAutoLogin(attempt + 1), autoLoginConfig.attemptInterval);
        }
    }, 100);
}
// Функция инициализации автовхода
function initializeAutoLogin() {
    if (!autoLoginConfig.enabled) {
        debugLog('Автовход отключен в конфигурации');
        return;
    }
    // Только реагируем на уже открытый движком интерфейс.
    // Скрипт НЕ должен сам открывать Authorization — это вызывает
    // конфликт с тем, что движок открывает его параллельно после /rec.
    if (window.getInterfaceStatus("Authorization")) {
        debugLog('Интерфейс Authorization уже открыт, запускаем автовход');
        setupAutoLogin();
    } else {
        debugLog('[AUTOLOGIN] Authorization ещё не открыт движком — ждём хука openInterface');
    }
}
// Перехват window.openInterface для автоматического входа (хуком)
const originalOpenInterface = window.openInterface;
let _authHookScheduled = false;
window.openInterface = function(interfaceName, params, additionalParams) {
    const result = originalOpenInterface.call(this, interfaceName, params, additionalParams);
    if (interfaceName === "Authorization" && !_authHookScheduled) {
        _authHookScheduled = true;
        debugLog(`[${displayName}] Открыт интерфейс Authorization, инициализация автовхода`);
        setTimeout(() => {
            _authHookScheduled = false;
            initializeAutoLogin();
        }, 500); // Дебаунс: даже если Authorization откроется несколько раз подряд,
                 // initializeAutoLogin вызовется только один раз
    }
    // ── INTERACTIONS LOGGER ──────────────────────────────────────
    if (interfaceName === "Interactions") {
        try {
            let list = [];
            if (params) {
                const parsed = typeof params === 'object' ? params : JSON.parse(params);
                for (const key in parsed) {
                    list.push({ type: parsed[key][0], title: parsed[key][1] });
                }
            }
            const nick = (config && config.accountInfo && config.accountInfo.nickname) || 'Unknown';
            console.log(`[INTERACTIONS][${nick}] ══════════════════════════════`);
            if (list.length === 0) {
                console.log(`[INTERACTIONS][${nick}] Список пуст`);
            } else if (list.length === 1) {
                console.log(`[INTERACTIONS][${nick}] Одно действие: "${list[0].title}" (тип: ${list[0].type})`);
                console.log(`[INTERACTIONS][${nick}] Нажмите ALT чтобы выполнить`);
            } else {
                console.log(`[INTERACTIONS][${nick}] Доступных вариантов: ${list.length}`);
                list.forEach((item, i) => {
                    console.log(`[INTERACTIONS][${nick}]   ${i + 1}. "${item.title}"  (тип: ${item.type})`);
                });
                console.log(`[INTERACTIONS][${nick}] Нажмите ALT — появится курсор, кликните нужный пункт`);
            }
            console.log(`[INTERACTIONS][${nick}] ══════════════════════════════`);

            // ── Авто-клик "Выключить анимацию" — только после /c 60 → MainMenu ─
            const animItem = list.find(item => item.type === 75);
            if (animItem && window._awaitAnimInteraction) {
                window._awaitAnimInteraction = false; // Одноразово
                const animIdx = list.indexOf(animItem);
                setTimeout(() => {
                    try {
                        const iface = window.interface("Interactions");
                        if (iface && typeof iface.onClick === 'function') {
                            iface.onClick(animIdx);
                            console.log(`[INTERACTIONS][${nick}] Авто-клик: "${animItem.title}"`);
                        } else {
                            sendClientEvent(
                                window.gm ? window.gm.EVENT_EXECUTE_PUBLIC : 0,
                                "OnInteractionsClick", animItem.type
                            );
                            console.log(`[INTERACTIONS][${nick}] Авто-клик (fallback): "${animItem.title}"`);
                        }
                    } catch (e2) {
                        console.log(`[INTERACTIONS] Ошибка авто-клика: ${e2.message}`);
                    }
                }, 80);
            }
            // ── END Авто-клик ─────────────────────────────────────────────

        } catch (e) {
            console.log(`[INTERACTIONS] Ошибка парсинга параметров: ${e.message}`);
        }
    }
    // ── END INTERACTIONS LOGGER ──────────────────────────────────
    return result;
};
// END AUTO LOGIN MODULE //

// ╔══════════════════════════════════════════════════════════╗
// ║  MODULE: SHARED STORAGE                                  ║
// ║  Описание: In-memory хранилище lastUpdateId              ║
// ║             (localStorage недоступен в CEF-среде)        ║
// ║  Зависимости: debugLog                                   ║
// ╚══════════════════════════════════════════════════════════╝
// START SHARED STORAGE MODULE //
// Храним offset per-account, чтобы разные боты не перезаписывали друг другу значения.
// Ключ: window._hbOffset_<ACCOUNT_NUMBER>
function _getOffsetKey() {
    return `_hbOffset_${window.ACCOUNT_NUMBER || '0'}`;
}
function getSharedLastUpdateId() {
    const v = window[_getOffsetKey()];
    return (typeof v === 'number') ? v : 0;
}
function setSharedLastUpdateId(id) {
    window[_getOffsetKey()] = id;
    debugLog(`Обновлён shared lastUpdateId [acc#${window.ACCOUNT_NUMBER || '0'}]: ${id}`);
}
// END SHARED STORAGE MODULE //

// ╔══════════════════════════════════════════════════════════╗
// ║  MODULE: DEBUG & UTILS                                   ║
// ║  Описание: Логирование, форматирование времени,          ║
// ║             нормализация текста (кириллица),             ║
// ║             показ ScreenNotification                     ║
// ║  Зависимости: config                                     ║
// ╚══════════════════════════════════════════════════════════╝
// START DEBUG AND UTILS MODULE //
function debugLog(message) {
    if (config.debug) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const currentTime = `${hours}:${minutes}:${seconds}`;
        console.log(`[${currentTime}] [DEBUG][${config.accountInfo.nickname || 'Unknown'}]`, message);
    }
}
function getCurrentTimeString() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}
// Новая функция для нормализации текста: замена латинских букв на кириллические эквиваленты
function normalizeToCyrillic(text) {
    const map = {
        'A': 'А', 'a': 'а',
        'B': 'В', 'b': 'в', // B часто путают с В
        'C': 'С', 'c': 'с',
        'E': 'Е', 'e': 'е',
        'H': 'Н', 'h': 'н',
        'K': 'К', 'k': 'к',
        'M': 'М', 'm': 'м',
        'O': 'О', 'o': 'о',
        'P': 'Р', 'p': 'р',
        'T': 'Т', 't': 'т',
        'X': 'Х', 'x': 'х',
        'Y': 'У', 'y': 'у',
        '3': 'З', // Иногда 3 вместо З
        // Добавьте другие возможные замены по необходимости
    };
    return text.split('').map(char => map[char] || char).join('');
}
// Функция для показа ScreenNotification
function showScreenNotification(title, text, color = "FFFF00", duration = 3000) {
    try {
        window.interface('ScreenNotification').add(
            `[0, "${title}", "${text.replace(/\n/g, '<br>')}", "${color}", ${duration}]`
        );
        debugLog(`ScreenNotification показан: ${title} - ${text}`);
    } catch (err) {
        debugLog(`Ошибка ScreenNotification: ${err.message}`);
    }
}

// ── Добавить сообщение в локальный чат (видит только игрок) ──────────
// Использует метод .add() чат-компонента из Hud.js напрямую
// color: hex без # (например "00BFFF"), text: строка (без форматирования)
function addLocalChatMessage(text, color = "00FFFF") {
    try {
        // Правильный путь: Hud.$refs.chat (а не window.App.$refs.chat — chat вложен внутри Hud)
        const hudRef = window.interface("Hud");
        const chatRef = hudRef?.$refs?.chat;
        if (chatRef && typeof chatRef.add === 'function') {
            chatRef.add(text, color);
            return true;
        }
        // Fallback: OnChatAddMessage (серверный хук — тоже работает для локального добавления)
        if (typeof window.OnChatAddMessage === 'function') {
            window.OnChatAddMessage(text, color);
            return true;
        }
        debugLog('[CHAT] addLocalChatMessage: чат-компонент не найден');
        return false;
    } catch (err) {
        debugLog(`[CHAT] addLocalChatMessage ошибка: ${err.message}`);
        return false;
    }
}
function addSessionLog(event) {
    const timeStr = getCurrentTimeString();
    const entry = `[${timeStr}] ${event}`;
    globalState.sessionLog.push(entry);
    if (globalState.sessionLog.length > 40) globalState.sessionLog.shift();
    debugLog(`[SESSION] ${entry}`);
}
// END DEBUG AND UTILS MODULE //

// ╔══════════════════════════════════════════════════════════╗
// ║  MODULE: PLAYER INFO                                     ║
// ║  Описание: Отслеживание ID, скина, ника, сервера,        ║
// ║             фракции игрока через поллинг и хуки          ║
// ║  Зависимости: config, factions, globalState, debugLog,   ║
// ║               sendWelcomeMessage, registerUser,          ║
// ║               startPrisonMode, stopPrisonTimePolling,    ║
// ║               accountToken                               ║
// ╚══════════════════════════════════════════════════════════╝
// START PLAYER INFO MODULE //
function getPlayerIdFromHUD() {
    try {
        const hudElements = document.querySelectorAll('.hud-hassle-info-data');
        if (hudElements.length > 0) {
            const idElement = hudElements[0].querySelector('div:nth-child(3)');
            if (idElement) {
                const idText = idElement.textContent;
                const idMatch = idText.match(/ID\s*(\d+)/);
                if (idMatch) return idMatch[1];
            }
        }
        return null;
    } catch (e) {
        debugLog(`Ошибка при получении HUD ID: ${e.message}`);
        return null;
    }
}
function getSkinIdFromStore() {
    try {
        const menuInterface = window.interface("Menu");
        if (menuInterface && menuInterface.$store && menuInterface.$store.getters["player/skinId"] !== undefined) {
            const skinId = menuInterface.$store.getters["player/skinId"];
            return skinId;
        }
        return null;
    } catch (e) {
        debugLog(`Ошибка при получении Skin ID из store: ${e.message}`);
        return null;
    }
}
// ── Получить позицию персонажа из Vuex store ─────────────────
function getPlayerPositionFromStore() {
    try {
        // Вариант 1: через window.App (прямой доступ)
        if (window.App && window.App.$store) {
            const pos = window.App.$store.getters["player/position"];
            if (pos) return pos;
        }
        // Вариант 2: через window.interface("Menu") (как getSkinIdFromStore)
        const menuInterface = window.interface("Menu");
        if (menuInterface && menuInterface.$store) {
            const pos = menuInterface.$store.getters["player/position"];
            if (pos) return pos;
        }
        return null;
    } catch (e) {
        debugLog(`[LOC] Ошибка при получении позиции из store: ${e.message}`);
        return null;
    }
}

// ── Определение интерьера ────────────────────────────────────
// pos.interior из store не всегда работает в хасле,
// поэтому дополнительный фолбэк: z >= 500 = интерьер по любому
function isInInterior(pos) {
    if (!pos) return false;
    if (pos.interior) return true;
    if (typeof pos.z === 'number' && pos.z >= 500) return true;
    return false;
}

// ── Периодическое логирование координат персонажа ─────────────
function trackPlayerLocation() {
    if (!config.locationLogging) return;
    if (window._hassleReloading) return;
    const pos = getPlayerPositionFromStore();
    if (pos) {
        const nick = config.accountInfo.nickname || 'Unknown';
        const interior = isInInterior(pos) ? ' [interior]' : '';
        console.log(
            `[LOC][${nick}] x=${Math.round(pos.x)} y=${Math.round(pos.y)} z=${Math.round(pos.z ?? 0)} angle=${Math.round(pos.angle ?? 0)}°${interior}`
        );
    } else {
        debugLog('[LOC] Позиция недоступна (store ещё не инициализирован?)');
    }
    setTimeout(trackPlayerLocation, config.locationLogInterval);
}

// ── Получить Нал и Банк персонажа из Vuex store ──────────────
function getPlayerMoneyFromStore() {
    try {
        if (window.App && window.App.$store) {
            const money     = window.App.$store.getters["player/money"];
            const bankMoney = window.App.$store.getters["player/bankMoney"];
            if (money !== undefined || bankMoney !== undefined) {
                return { money: money ?? null, bankMoney: bankMoney ?? null };
            }
        }
        const menuInterface = window.interface("Menu");
        if (menuInterface && menuInterface.$store) {
            const money     = menuInterface.$store.getters["player/money"];
            const bankMoney = menuInterface.$store.getters["player/bankMoney"];
            if (money !== undefined || bankMoney !== undefined) {
                return { money: money ?? null, bankMoney: bankMoney ?? null };
            }
        }
        return null;
    } catch (e) {
        debugLog(`[MONEY] Ошибка при получении денег из store: ${e.message}`);
        return null;
    }
}

// ── Периодическое логирование Нала и Банка ────────────────────
function trackPlayerMoney() {
    if (!config.moneyLogging) return;
    if (window._hassleReloading) return;
    const data = getPlayerMoneyFromStore();
    if (data) {
        const nick = config.accountInfo.nickname || 'Unknown';
        console.log(
            `[MONEY][${nick}] Нал=₽${data.money !== null ? data.money.toLocaleString() : '?'} Банк=₽${data.bankMoney !== null ? data.bankMoney.toLocaleString() : '?'}`
        );
    } else {
        debugLog('[MONEY] Данные недоступны (store ещё не инициализирован?)');
    }
    setTimeout(trackPlayerMoney, config.moneyLogInterval);
}


// ── Получить HP персонажа из HUD-компонента ──────────────────
// HP не хранится в Vuex (getter "player/hp" не существует).
// Значение живёт в data.info.health компонента Hud,
// который доступен через window.interface("Hud").
function getPlayerHpFromStore() {
    try {
        const hud = window.interface("Hud");
        if (hud && hud.info && hud.info.health !== undefined && hud.info.health !== null) {
            return hud.info.health;
        }
        return null;
    } catch (e) {
        debugLog(`[HP] Ошибка при получении HP из HUD: ${e.message}`);
        return null;
    }
}

// ── Поиск ника ближайшего атакующего игрока ───────────────────
// ⚠️  ВАЖНО (по анализу Hud.js):
//
// 1. Нэймтеги над игроками ("Ivan_Berins (192)") рендерятся нативным
//    движком игры (не в CEF/HTML слое) → из JS НЕДОСТУПНЫ.
//
// 2. nearbyPlayers в HudMap-компоненте содержит только:
//    [x, y, angle, r, g, b, opacity] — имён нет.
//
// 3. hud.playerList.players — TAB-список ВСЕХ игроков сервера:
//    [[serverId, "Nick_Name", level], ...] — имена есть, но
//    нельзя определить кто конкретно нас бьёт.
//
// 4. hud.voiceChat.entries — говорящие в войс:
//    [{ name, id, type, channel, streamId }] — если атакующий
//    говорит в войс одновременно, его ник можно поймать здесь.
//
// Стратегия: возвращаем ник из войс-чата (если кто-то говорит),
// иначе null. В будущем можно расширить при появлении нативного
// события урона от движка.
function getNearestAttacker() {
    try {
        const hud = window.interface("Hud");
        if (!hud) return null;

        // Путь 1: Кто сейчас говорит в войс-чат?
        // hud.voiceChat.entries = [{ type, name, id, channel, streamId }, ...]
        const voiceEntries = hud.voiceChat && hud.voiceChat.entries;
        if (Array.isArray(voiceEntries) && voiceEntries.length > 0) {
            const speaker = voiceEntries.find(e => e && e.name);
            if (speaker) {
                debugLog(`[HP] Атакующий из войс-чата: ${speaker.name} (ID: ${speaker.id})`);
                return speaker.name;
            }
        }

        // Путь 2: playerList — TAB-список всех игроков сервера.
        // Формат: [[serverId, "Nick_Name", level], ...]
        // Нельзя точно определить атакующего, но если на сервере
        // очень мало игроков — запишем всех в debug для анализа.
        const players = hud.playerList && hud.playerList.players;
        if (Array.isArray(players) && players.length > 0 && players.length <= 5) {
            // На малолюдном сервере (≤5 чел.) логируем список
            const names = players.map(p => `${p[1]}(${p[0]})`).join(', ');
            debugLog(`[HP] Игроки на сервере (мало, возможные атакующие): ${names}`);
        }

        // Нэймтеги нативные → недоступны из JS
        // Если нужна надёжная идентификация атакующего — требуется
        // серверный ивент (например, chat-сообщение о ране от игрока).
    } catch (e) {
        debugLog(`[HP] Ошибка при поиске атакующего: ${e.message}`);
    }
    return null;
}

// ── Периодическое отслеживание HP и уведомление об уроне ──────
const HP_ALERT_WINDOW_MS = 3 * 60 * 1000; // 3 минуты

function trackPlayerHp() {
    if (!config.hpTracking) return;
    if (window._hassleReloading) return;

    // В тюрьме — урон не отслеживаем, сбрасываем baseline
    if (globalState.inPrison) {
        globalState.hpLastValue    = null;
        globalState._hpGraceUntil  = null;
        globalState._hpGraceActive = false;
        setTimeout(trackPlayerHp, 2000);
        return;
    }

    const currentHp = getPlayerHpFromStore();

    // Первый тик в игре — только ставим baseline, урон не считаем
    if (currentHp !== null && globalState.hpLastValue === null) {
        globalState.hpLastValue   = currentHp;
        // Grace period: HUD после спавна/rec ещё может показывать 100
        // пока сервер не прислал реальный HP — ждём 4 сек без учёта урона
        globalState._hpGraceUntil  = Date.now() + 4000;
        globalState._hpGraceActive = true;
        debugLog('[HP] ✅ В игре — baseline HP=' + Math.round(currentHp) + ', grace 4s');
        setTimeout(trackPlayerHp, 500);
        return;
    }

    // Сравниваем только когда в игре и baseline уже есть
    if (currentHp !== null && globalState.hpLastValue !== null) {
        // Grace period: пока HUD не синхронизировался с сервером после спавна/rec —
        // молча обновляем baseline, урон не считаем
        if (globalState._hpGraceActive && globalState._hpGraceUntil && Date.now() < globalState._hpGraceUntil) {
            globalState.hpLastValue = currentHp;
            setTimeout(trackPlayerHp, 500);
            return;
        }
        // Grace period истёк — сбрасываем флаг
        if (globalState._hpGraceActive) {
            globalState._hpGraceActive = false;
            globalState._hpGraceUntil  = null;
            debugLog('[HP] Grace period завершён, baseline HP=' + Math.round(currentHp));
        }

        if (currentHp < globalState.hpLastValue) {
            const damage = Math.round(globalState.hpLastValue - currentHp);

            if (damage >= 1) {
                const now = Date.now();

                addSessionLog(`💔 Урон: HP ${Math.round(globalState.hpLastValue)} → ${Math.round(currentHp)} (-${damage})`);

                globalState.hpLastHitTime = now;
                if (!globalState._dmgAccum) {
                    globalState._dmgAccum = { total: 0, hpBefore: Math.round(globalState.hpLastValue) };
                }
                globalState._dmgAccum.total += damage;

                if (globalState._dmgTimer) clearTimeout(globalState._dmgTimer);
                globalState._dmgTimer = setTimeout(function () {
                    const acc   = globalState._dmgAccum;
                    const hpNow = Math.round(getPlayerHpFromStore() ?? currentHp);
                    sendToTelegram(
                        `💔 <b>Урон (${displayName})</b>\n` +
                        `HP: ${acc.hpBefore} → ${hpNow} (-${Math.round(acc.total)})`,
                        false, null
                    );
                    globalState._dmgAccum = null;
                    globalState._dmgTimer  = null;
                }, 1500);
            }
        }

        globalState.hpLastValue = currentHp;
    }

    setTimeout(trackPlayerHp, 500);
}

// ── DEBUG: каждую секунду пишет HP / координаты / скин / спавн ──
let _debugStatTimer = null;

function startDebugStatTracker() {
    if (_debugStatTimer) clearInterval(_debugStatTimer);
    _debugStatTimer = setInterval(() => {
        try {
            const s = window.App.$store;

            // Уже было
            let spawned = false;
            try { spawned = !!s.getters['player/isPlayerConnected']; } catch(e) {}
            const hp  = getPlayerHpFromStore();
            const pos = getPlayerPositionFromStore();
            const skin = getSkinIdFromStore();

            // НОВОЕ — сервер
            const serverId = s.getters['player/serverId'];
            const isTest   = +serverId === 0;
            const serverStr = isTest
                ? `🧪 ТЕСТ (id=${serverId})`
                : `🟢 Боевой (id=${serverId})`;

            // НОВОЕ — уровень, VIP, ник
            const level = s.getters['player/level'];
            const vip   = s.getters['player/vip'];
            const vipMap = { 0:'', 1:'Шпана', 2:'Бывалый', 3:'Меченый', 4:'Коронованный' };
            const nick  = s.getters['player/nickName'];

            // НОВОЕ — деньги
            const money     = s.getters['player/money'];
            const bankMoney = s.getters['player/bankMoney'];

            // НОВОЕ — interior + angle из позиции
            const interior = pos ? (pos.interior ? '🏠 интерьер' : '🌍 улица') : '—';
            const angle    = pos ? Math.round(pos.angle ?? 0) + '°' : '—';

            // НОВОЕ — версия игры, часы
            const gameVer  = s.getters['player/gameVersion'];
            const hours    = s.getters['player/passedHours'];

            const hpStr   = hp   !== null ? Math.round(hp) : '—';
            const skinStr = skin !== null ? skin : '—';
            const posStr  = pos
                ? `x=${Math.round(pos.x)} y=${Math.round(pos.y)} z=${Math.round(pos.z ?? 0)}`
                : 'недоступны';
            const spawnStr = spawned ? '✅ заспавнен' : '❌ не в игре';

            console.log(
                `[DBG][${nick || displayName}] ${spawnStr} | Сервер: ${serverStr}` +
                ` | HP: ${hpStr} | Lv: ${level} | VIP: ${vipMap[vip] || vip}` +
                ` | Скин: ${skinStr} | Нал: ${money} | Банк: ${bankMoney}` +
                ` | Поз: ${posStr} | Угол: ${angle} | ${interior}` +
                ` | Часы: ${hours} | v${gameVer}`
            );
        } catch (e) {
            console.log(`[DBG][${displayName}] Ошибка: ${e.message}`);
        }
    }, 1000);
}

function stopDebugStatTracker() {
    if (_debugStatTimer) {
        clearInterval(_debugStatTimer);
        _debugStatTimer = null;
    }
}

// ── Ожидание спавна → загрузка профиля независимо от фракции ──────────────
// Аналог trackPlayerHp: ждём player/isPlayerConnected = true, затем
// открываем MainMenu → Statistics и считываем профиль.
// Работает для всех аккаунтов, не только фракционных.
function waitForSpawnThenLoadProfile() {
    if (globalState._spawnProfileLoaded) return;
    if (window._hassleReloading) { setTimeout(waitForSpawnThenLoadProfile, 1000); return; }

    let isConnected = false;
    try {
        if (window.App && window.App.$store) {
            isConnected = window.App.$store.getters['player/isPlayerConnected'];
        }
    } catch(e) {}

    if (!isConnected) {
        // Ещё не заспавнились — ждём как HP-трекер
        setTimeout(waitForSpawnThenLoadProfile, 500);
        return;
    }

    // Спавн подтверждён — помечаем чтобы не запускать повторно в этой сессии
    globalState._spawnProfileLoaded = true;
    debugLog('[Profile] 🎮 Спавн подтверждён (isPlayerConnected=true) — загружаем профиль через 3 сек...');

    setTimeout(function() {
        // Если профиль уже загружен (например, фракционный скин пришёл раньше спавна) — не дублируем
        if (!config.accountInfo.profile.loaded && typeof window._hassleLoadPlayerProfile === 'function') {
            window._hassleLoadPlayerProfile(null);
        } else {
            debugLog('[Profile] ℹ️ Профиль уже загружен (фракция определена раньше спавна), пропускаем дублирование.');
        }
    }, 3000);
}


function updateFaction() {
    const skinId = Number(config.accountInfo.skinId); // Приводим к числу
    if (!skinId) return;
    for (const faction in factions) {
        if (factions[faction].skins.includes(skinId)) {
            if (config.currentFaction !== faction) {
                config.currentFaction = faction;
                debugLog(`Фракция обновлена: ${faction} (Skin ID: ${skinId})`);
                // Загружаем профиль при первом определении фракционного скина.
                // Именно здесь — сервер уже назначил скин, значит мы точно в игре
                // и MainMenu отдаст реальные данные (не mock).
                if (!config.accountInfo.profile.loaded && typeof window._hassleLoadPlayerProfile === 'function') {
                    debugLog('[Profile] Фракция определена → загружаем профиль через 1 сек...');
                    // Помечаем спавн как обработанный — spawn-трекер дублировать не будет
                    globalState._spawnProfileLoaded = true;
                    setTimeout(function() {
                        window._hassleLoadPlayerProfile(null);
                    }, 1000);
                }
                // Если профиль уже загружен (игрок был без фракции, потом надел форму) —
                // пересчитываем: фракционный статус мог измениться.
                else if (config.accountInfo.profile.loaded && typeof window._hassleLoadPlayerProfile === 'function') {
                    let isConnected = false;
                    try {
                        if (window.App && window.App.$store) {
                            isConnected = window.App.$store.getters['player/isPlayerConnected'];
                        }
                    } catch(e) {}
                    if (isConnected) {
                        debugLog('[Profile] 👔 Надета форма фракции → сбрасываем профиль и перезагружаем...');
                        config.accountInfo.profile.loaded = false;
                        setTimeout(function() {
                            window._hassleLoadPlayerProfile(null);
                        }, 1500);
                    }
                }
                // /c 60 теперь запускается только через кнопку «Отыгровка 27 мин» в Telegram
                debugLog('[ANIM] Фракционный скин определён; /c 60 не отправляем (используй Отыгровку в Telegram)');
            }
            return;
        }
    }
    config.currentFaction = null;
    debugLog(`Фракция не определена для Skin ID: ${skinId}`);
}
function trackSkinId() {
    if (!config.trackSkinId) return;
    if (window._hassleReloading) return;
    const currentSkin = getSkinIdFromStore();
    if (currentSkin !== null && currentSkin !== config.accountInfo.skinId) {
        config.accountInfo.skinId = currentSkin;
        debugLog(`Обнаружен новый Skin ID (поллинг): ${currentSkin}`);
        updateFaction(); // Обновляем фракцию
        // Проверка скина заключённого
        if (Number(currentSkin) === 50) {
            startPrisonMode();
        } else if (globalState.inPrison) {
                globalState.inPrison = false;
                globalState.prisonTimeRequested = false;
                stopPrisonTimePolling();
                debugLog(`[PRISON] Скин сменился на ${currentSkin} — режим тюрьмы деактивирован`);
        }
    }
    setTimeout(trackSkinId, config.skinCheckInterval);
}
// Перехват window.setPlayerSkinId для отслеживания изменений скина (хуком)
let originalSetPlayerSkinId = window.setPlayerSkinId; // Сохраняем оригинал, если он существует
window.setPlayerSkinId = function(skinId) {
    debugLog(`Перехвачен вызов setPlayerSkinId с Skin ID: ${skinId}`);
    // Сохраняем Skin ID
    config.accountInfo.skinId = skinId;
    updateFaction(); // Обновляем фракцию при изменении скина
    // Проверка скина заключённого (50 = тюремный скин)
    if (Number(skinId) === 50) {
        setTimeout(() => startPrisonMode(), 3000); // Небольшая задержка для стабилизации игры
    } else if (globalState.inPrison) {
        globalState.inPrison = false;
        globalState.prisonTimeRequested = false;
        stopPrisonTimePolling();
        debugLog(`[PRISON] Скин сменился на ${skinId} — режим тюрьмы деактивирован`);
    }
    // Вызываем оригинал, если он существует
    if (originalSetPlayerSkinId) {
        return originalSetPlayerSkinId.call(this, skinId);
    }
};
function trackPlayerId() {
    if (!config.trackPlayerId) return;
    if (window._hassleReloading) return;
    const currentId = getPlayerIdFromHUD();
    if (currentId && currentId !== config.lastPlayerId) {
        debugLog(`Обнаружен новый ID (HUD): ${currentId}`);
        config.lastPlayerId = currentId;
        updateDisplayName(); // Обновляем displayName при изменении ID
    }
    setTimeout(trackPlayerId, config.idCheckInterval);
}
function updateDisplayName() {
    const idPart = config.lastPlayerId ? `[${config.lastPlayerId}]` : '';
    displayName = `${config.accountInfo.nickname || 'User'}${idPart} [S${config.accountInfo.server || 'Не указан'}]`;
    debugLog(`Обновлён displayName: ${displayName}`);
}
function trackNicknameAndServer() {
    if (window._hassleReloading) return;

    // Пробуем получить store через MainMenu (в игре).
    // Повторяем каждые 900мс пока store не станет доступен.
    let store = null;
    // Пробуем все известные интерфейсы где есть $store с данными игрока
    const ifaceNames = ["MainMenu", "Authorization", "Menu", "Hud"];
    for (const name of ifaceNames) {
        try {
            const iface = window.interface(name);
            if (iface && iface.$store) { store = iface.$store; break; }
        } catch (e) {}
    }

    if (!store) {
        // Молча повторяем — без debugLog чтобы не спамить консоль
        setTimeout(trackNicknameAndServer, 900);
        return;
    }

    // Читает текущие значения из store и применяет изменения
    function applyNicknameServer() {
        if (window._hassleReloading) return;
        let nickname, serverId;

        // Пробуем in-game геттеры (MainMenu, в игре)
        try {
            const n = store.getters["player/nickName"];
            const s = store.getters["player/serverId"];
            if (n && n !== "Name_Surname" && s !== undefined && s !== null && String(s) !== "-1") {
                nickname = n; serverId = s;
            }
        } catch (e) {}

        // Если не получили — пробуем геттеры экрана входа (Authorization)
        if (!nickname) {
            try {
                const n = store.getters["menu/nickName"];
                const s = store.getters["menu/selectedServer"];
                if (n && n !== "Имя_Фамилия" && s !== undefined && s !== null && String(s) !== "-1") {
                    nickname = n; serverId = s;
                }
            } catch (e) {}
        }

        if (!nickname || serverId === undefined || serverId === null) return;

        const nicknameStr = String(nickname);
        const serverStr   = String(serverId);
        const isFirstTime = !config.nicknameLogged;
        const changed     = config.accountInfo.nickname !== nicknameStr ||
                            config.accountInfo.server   !== serverStr;

        if (!isFirstTime && !changed) return;

        config.accountInfo.nickname = nicknameStr;
        config.accountInfo.server   = serverStr;

        if (isFirstTime) {
            // Первый вход
            config.nicknameLogged = true;
            config.botToken = accountToken;
            debugLog(`[NICK] Первый вход. botToken аккаунта #${window.ACCOUNT_NUMBER} установлен`);
            console.log(`nickname: ${nicknameStr}, Server: ${serverStr}`);
            updateDisplayName();
            uniqueId = `${nicknameStr}_${serverStr}`;
            sendWelcomeMessage();
            registerUser();
            addSessionLog(`🔐 Вход: ${nicknameStr} [S${serverStr}]`);
            // Запуск отслеживания скина с задержкой 5с
            setTimeout(() => {
                const initialSkin = getSkinIdFromStore();
                if (initialSkin !== null) {
                    config.accountInfo.skinId = initialSkin;
                    debugLog(`Initial Skin ID after login: ${initialSkin}`);
                    updateFaction();
                    if (Number(initialSkin) === 50) startPrisonMode();
                }
                trackSkinId();
            }, 5000);
        } else {
            // Ник или сервер изменились — обновляем без перезахода
            debugLog(`[NICK] Изменение: ${nicknameStr} [S${serverStr}]`);
            updateDisplayName();
            uniqueId = `${nicknameStr}_${serverStr}`;
            sendWelcomeMessage(); // редактирует уже отправленное сообщение
        }
    }

    // Первоначальный вызов — если данные уже есть в store
    applyNicknameServer();

    // Подписка через Vuex $store.watch — реагирует мгновенно без поллинга
    // Следим за обоими наборами геттеров: в игре (player/) и на экране входа (menu/)
    const watchGetter = (getterKey) => {
        try {
            store.watch(
                (state, getters) => getters[getterKey],
                (newVal) => {
                    debugLog(`[NICK] ${getterKey} -> ${newVal}`);
                    applyNicknameServer();
                }
            );
        } catch(e) { debugLog(`[NICK] watch не удался для ${getterKey}: ${e.message}`); }
    };
    watchGetter("player/nickName");
    watchGetter("player/serverId");
    watchGetter("menu/nickName");
    watchGetter("menu/selectedServer");

    debugLog("[NICK] $store.watch активен — смена ника/сервера отслеживается реактивно");
}
// END PLAYER INFO MODULE //

// ╔══════════════════════════════════════════════════════════╗
// ║  MODULE: TELEGRAM API                                    ║
// ║  Описание: Все запросы к Telegram Bot API.               ║
// ║             Базовый: tgApi(method, payload, cb, err)     ║
// ║             sendToTelegram, editMessageText,             ║
// ║             deleteMessage, answerCallbackQuery,          ║
// ║             editMessageReplyMarkup, sendAdminSpamAlert   ║
// ║  Зависимости: config, debugLog, globalState,             ║
// ║               displayName, getNotificationReplyMarkup   ║
// ╚══════════════════════════════════════════════════════════╝
// START TELEGRAM API MODULE //
function createButton(text, command, style = null) {
    const btn = { text, callback_data: command };
    if (style) btn.style = style;
    return btn;
}
// Универсальная функция для всех запросов к Telegram Bot API
// FIX: обработка 429 Too Many Requests — повтор через retry_after секунд
function tgApi(method, payload, onSuccess, onError, _retryCount) {
    _retryCount = _retryCount || 0;
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.telegram.org/bot${config.botToken}/${method}`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status === 200) {
            try {
                const data = JSON.parse(xhr.responseText);
                if (onSuccess) onSuccess(data);
                else debugLog(`tgApi ${method} OK`);
            } catch(e) { debugLog(`tgApi ${method} parse error: ${e.message}`); }
        } else if (xhr.status === 429 && _retryCount < 3) {
            // FIX: Telegram вернул "Too Many Requests" — ждём retry_after и повторяем
            let retryAfter = 5;
            try {
                const errData = JSON.parse(xhr.responseText);
                if (errData.parameters && errData.parameters.retry_after) {
                    retryAfter = errData.parameters.retry_after;
                }
            } catch(e) {}
            debugLog(`tgApi ${method} 429 — повтор через ${retryAfter}с (попытка ${_retryCount + 1}/3)`);
            setTimeout(() => tgApi(method, payload, onSuccess, onError, _retryCount + 1), retryAfter * 1000);
        } else {
            debugLog(`tgApi ${method} error: ${xhr.status} ${xhr.responseText}`);
            if (onError) onError(xhr.status);
        }
    };
    xhr.onerror = function() {
        debugLog(`tgApi ${method} network error`);
        if (onError) onError('network');
    };
    xhr.send(JSON.stringify(payload));
}
function deleteMessage(chatId, messageId) {
    tgApi('deleteMessage', { chat_id: chatId, message_id: messageId });
}
function editMessageReplyMarkup(chatId, messageId, replyMarkup) {
    tgApi('editMessageReplyMarkup', { chat_id: chatId, message_id: messageId, reply_markup: replyMarkup ? JSON.stringify(replyMarkup) : undefined });
}
function editMessageText(chatId, messageId, text, replyMarkup = null) {
    tgApi('editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'HTML',
        reply_markup: replyMarkup ? JSON.stringify(replyMarkup) : undefined
    }, () => debugLog(`Сообщение отредактировано в Telegram чате ${chatId}`),
    (status) => {
        // 400 = сообщение удалено или недоступно — сбрасываем ID и шлём новое
        if (status === 400) {
            debugLog(`[EDIT] Сообщение ${messageId} не найдено в чате ${chatId} — отправляем новое`);
            if (globalState.welcomeMessageIds && globalState.welcomeMessageIds[chatId] === messageId) {
                delete globalState.welcomeMessageIds[chatId];
                if (globalState.welcomeSending) globalState.welcomeSending[chatId] = false;
                sendWelcomeMessage();
            }
        }
    });
}
function answerCallbackQuery(callbackQueryId) {
    tgApi('answerCallbackQuery', { callback_query_id: callbackQueryId },
        () => debugLog(`Callback_query ${callbackQueryId} подтверждён`));
}
// Функция спам-пингов при обнаружении администратора.
// Основное сообщение с кнопками стоит на месте (editMessage).
// Короткие пинг-сообщения со звуком появляются и удаляются через 1.5 сек.
// Защита от двойного запуска: если уже идут пинги — сбрасываем и перезапускаем.
let _adminSpamActive = false;      // FIX: флаг активного цикла пингов
let _adminSpamCancel = false;      // FIX: сигнал отмены текущего цикла
function sendAdminSpamAlert(adminMsg) {
    // FIX: если цикл уже идёт — отменяем старый и запускаем новый с актуальным сообщением
    if (_adminSpamActive) {
        _adminSpamCancel = true;
        debugLog('[AdminSpam] Новый вызов — старый цикл отменён, перезапуск');
    }
    _adminSpamActive = true;
    _adminSpamCancel = false;

    const TOTAL_PINGS = 4;    // было 9 — меньше спама в чате, меньше API-вызовов
    const INTERVAL_MS = 1200; // было 2000 — пинги чаще, но их меньше
    const replyMarkup = getNotificationReplyMarkup();

    config.chatIds.forEach(chatId => {
        let pingCount = 0;
        let mainMessageId = null; // стабильное сообщение с кнопками — стоит на месте

        function buildMainText() {
            return `🚨 <b>Обнаружен администратор! (${displayName})</b>\n` +
                   `⚠️ Пинг ${pingCount}/${TOTAL_PINGS}\n` +
                   `<code>${adminMsg.replace(/</g, '&lt;')}</code>`;
        }

        function sendPingNotification() {
            // Короткий пинг со звуком — появляется и удаляется через 1.5 сек
            // Только для уведомления, не мешает нажать кнопку в основном сообщении
            tgApi('sendMessage', {
                chat_id: chatId,
                text: `🔔 <b>АДМИН! ОТВЕТЬ! (${pingCount}/${TOTAL_PINGS})</b>`,
                parse_mode: 'HTML',
                disable_notification: false
            }, data => {
                if (!data || !data.result) return;
                const pid = data.result.message_id;
                setTimeout(() => deleteMessage(chatId, pid), 1500);
            });
        }

        function sendPing() {
            // FIX: если запущен новый цикл — прекращаем старый
            if (window._hassleReloading || _adminSpamCancel) {
                _adminSpamActive = false;
                return;
            }
            pingCount++;

            if (!mainMessageId) {
                // Первый раз — отправляем основное сообщение с кнопками
                tgApi('sendMessage', {
                    chat_id: chatId,
                    text: buildMainText(),
                    parse_mode: 'HTML',
                    disable_notification: false,
                    reply_markup: replyMarkup ? JSON.stringify(replyMarkup) : undefined
                }, data => {
                    if (_adminSpamCancel) { _adminSpamActive = false; return; }
                    mainMessageId = data.result.message_id;
                    if (pingCount < TOTAL_PINGS) setTimeout(sendPing, INTERVAL_MS);
                    else _adminSpamActive = false;
                }, () => {
                    debugLog(`[AdminSpam] Ошибка сети при первом пинге`);
                    if (pingCount < TOTAL_PINGS && !_adminSpamCancel) setTimeout(sendPing, INTERVAL_MS);
                    else _adminSpamActive = false;
                });
            } else {
                // Следующие разы — редактируем счётчик (кнопки не двигаются)
                tgApi('editMessageText', {
                    chat_id: chatId,
                    message_id: mainMessageId,
                    text: buildMainText(),
                    parse_mode: 'HTML',
                    reply_markup: replyMarkup ? JSON.stringify(replyMarkup) : undefined
                }, () => {}, () => {});

                // Отдельный пинг со звуком — пропадёт сам
                sendPingNotification();

                if (pingCount < TOTAL_PINGS) setTimeout(sendPing, INTERVAL_MS);
                else _adminSpamActive = false; // FIX: сбрасываем флаг по завершении
            }
        }

        sendPing();
    });
}
function sendToTelegram(message, silent = false, replyMarkup = null) {
    config.chatIds.forEach(chatId => {
        tgApi('sendMessage', {
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML',
            disable_notification: silent,
            reply_markup: replyMarkup ? JSON.stringify(replyMarkup) : undefined
        }, data => {
            debugLog(`Сообщение отправлено в Telegram чат ${chatId}`);
            if (!data || !data.result) return;
            const messageId = data.result.message_id;
            if (message.includes('+ PayDay |')) {
                globalState.lastPaydayMessageIds.push({ chatId, messageId });
            }
        });
    });
}
// END TELEGRAM API MODULE //

// ╔══════════════════════════════════════════════════════════╗
// ║  MODULE: WELCOME MESSAGE                                 ║
// ║  Описание: Отправка/обновление приветственного           ║
// ║             сообщения при входе в игру                   ║
// ║  Зависимости: config, globalState, displayName,          ║
// ║               uniqueId, sendToTelegram,                  ║
// ║               editMessageText, createButton              ║
// ╚══════════════════════════════════════════════════════════╝
// START WELCOME MESSAGE MODULE //

// ── Читает полный объект info из HUD-компонента ──────────────
// (health, armour, hunger, wanted, weapon, ammoInClip, totalAmmo, breath)
function getHudInfoFull() {
    try {
        const hud = window.interface('Hud');
        if (hud && hud.info) return hud.info;
    } catch(e) {}
    return null;
}

// ── Строит блок «Информация об аккаунте» для встраивания в welcome-сообщение ──
// Показывает полный блок только когда фракция определена и профиль загружен.
// До этого момента выводит единственную строку «Информация об аккаунте ещё не загружена».
function buildWelcomeAccountInfo() {
    try {
        const p = config.accountInfo.profile;

        // Если профиль ещё не готов (фракция не обязательна)
        if (!p || !p.loaded) {
            const logLines = globalState.sessionLog && globalState.sessionLog.length > 0
                ? globalState.sessionLog.slice(-8).map(e => `<code>${e}</code>`).join('\n')
                : '<i>Нет событий</i>';

            // Скин и фракция уже определены — показываем частичные данные
            if (config.currentFaction && config.accountInfo.skinId) {
                const fLabel = getFactionLabel(config.currentFaction);
                const nick   = config.accountInfo.nickname || '—';
                const srv    = config.accountInfo.server   || '?';
                const skin   = config.accountInfo.skinId;
                const retryNum = globalState.profileRetry || 0;
                const retryTip = retryNum > 0
                    ? `\n🔄 <i>Повтор загрузки (попытка ${retryNum}/3)...</i>`
                    : `\n⏳ <i>Данные профиля загружаются...</i>`;
                return `\n\n📊 <b>Информация об аккаунте:</b>\n` +
                       `👤 <b>Ник:</b> ${nick}  |  <b>Сервер:</b> S${srv}\n` +
                       `🎭 <b>Скин:</b> ${skin}  [${fLabel}]` +
                       retryTip +
                       `\n\n📋 <b>Лог сессии:</b>\n${logLines}`;
            }

            return `\n\n📊 <i>Информация об аккаунте ещё не загружена</i>` +
                   `\n\n📋 <b>Лог сессии:</b>\n${logLines}`;
        }

        const pos = getPlayerPositionFromStore();
        const nick = config.accountInfo.nickname || 'Unknown';
        const server = config.accountInfo.server || '?';
        const skinId = (config.accountInfo.skinId !== null && config.accountInfo.skinId !== undefined)
            ? config.accountInfo.skinId : '❓';
        const factionLabel = config.currentFaction ? `[${getFactionLabel(config.currentFaction)}]` : '';

        // Данные часов / VIP / donate из Vuex store
        // Уровень убран отсюда — он уже есть в блоке Прогресс с полным XP-баром
        let passedHours = '❓', vipLine = '', donateVal = null;
        try {
            const _s = window.App && window.App.$store;
            if (_s) {
                const hr = _s.getters['player/passedHours'];
                const vp = _s.getters['player/vip'];
                const dn = _s.getters['player/donate'];
                if (hr !== undefined && hr !== null) passedHours = hr;
                const vipMap = { 0: '', 1: '🥈 Silver VIP', 2: '🥇 Gold VIP', 3: '💎 Platinum VIP' };
                if (vp && vp > 0) vipLine = `\n🎖 <b>VIP:</b> ${vipMap[vp] || 'VIP'}`;
                if (dn !== undefined && dn !== null && dn > 0) donateVal = dn;
            }
        } catch (e) { debugLog('[ACINFO] store err: ' + e.message); }

        const posStr = pos
            ? `x=${Math.round(pos.x)} y=${Math.round(pos.y)} z=${Math.round(pos.z ?? 0)} угол=${Math.round(pos.angle ?? 0)}° interior=${isInInterior(pos) ? 'В интерьере' : 'Не в интерьере'}`
            : '❓ Позиция недоступна';

        // Нал и банк — приоритет live store
        const _lm = (function() { try { return getPlayerMoneyFromStore(); } catch(e) { return null; } })();
        const pCash = (_lm && _lm.money !== null) ? `₽${_lm.money.toLocaleString()}` : (p.cash !== null ? `₽${p.cash.toLocaleString()}` : '—');
        const pBank = (_lm && _lm.bankMoney !== null) ? `₽${_lm.bankMoney.toLocaleString()}` : (p.bank !== null ? `₽${p.bank.toLocaleString()}` : '—');

        const sub = p.subscribe ? '✅ ' + p.subscribe : '❌ Нет';
        const phone = p.phone !== null ? String(p.phone) : '—';
        const simB = p.simBalance !== null ? `₽${p.simBalance.toLocaleString()}` : '—';
        const lvlBar = (p.xpCurrent !== null && p.xpTarget) ? ` (${p.xpCurrent}/${p.xpTarget} XP)` : '';

        // ── Заголовок ─────────────────────────────────────────────
        let block = `\n\n📊 <b>Информация об аккаунте:</b>\n`;
        block += `👤 <b>Ник:</b> ${nick}  |  <b>Сервер:</b> S${server}\n`;
        block += `🎭 <b>Скин:</b> ${skinId}  ${factionLabel}${vipLine}\n`;

        // ── Фракция / Звание ──────────────────────────────────────
        block += `\n🏛 <b>Фракция / Звание:</b>\n`;
        block += `├ Фракция: ${p.orgTitle || '—'}\n`;
        block += `├ Звание: ${p.rank || '—'}${p.rankNum !== null ? ` (#${p.rankNum})` : ''}\n`;
        block += `└ Статус: ${p.status || '—'}\n`;

        // ── Прогресс (уровень + XP здесь — полная версия; часы тоже перенесены сюда) ──
        block += `\n📈 <b>Прогресс:</b>\n`;
        block += `├ Уровень: ${p.level !== null ? p.level : '—'}${lvlBar}\n`;
        block += `├ Часов в игре: ${passedHours}\n`;
        block += `├ Выносливость: ${p.stamina !== null ? p.stamina + '%' : '—'}\n`;
        block += `└ Сила: ${p.strength !== null ? p.strength + '%' : '—'}\n`;

        // ── Финансы ───────────────────────────────────────────────
        block += `\n💰 <b>Финансы:</b>\n`;
        block += `├ Нал: ${pCash}\n`;
        block += `├ Банк: ${pBank}\n`;
        if (donateVal !== null) block += `├ 💎 Donate: ${donateVal}\n`;
        block += `├ Телефон: ${phone}\n`;
        block += `├ Баланс SIM: ${simB}\n`;
        block += `└ Подписка: ${sub}\n`;

        // ── Имущество ─────────────────────────────────────────────
        block += `\n🏠 <b>Имущество:</b>\n`;
        const _propList = p.propertiesDetail || [];
        if (_propList.length > 0) {
            _propList.forEach((pr, idx) => {
                const isLast = idx === _propList.length - 1;
                const prefix = isLast ? '└' : '├';
                const typeLabel = pr.isApartment ? 'Квартира' : pr.name;
                const dDays = pr.days;
                const daysStr = dDays ? `${dDays.current}/${dDays.max} дн.` : '—';
                const dangerIcon = dDays && dDays.isDanger ? ' ⚠️' : '';
                block += `${prefix} ${typeLabel}: оплачен ${daysStr}${dangerIcon}\n`;
            });
            block += `Итого: Домов ${p.housesCount || 0}  Бизнесов ${p.bizCount || 0}  Машин ${p.carsCount || 0}`;
        } else {
            block += `├ Домов: ${p.housesCount || 0}\n`;
            block += `├ Бизнесов: ${p.bizCount || 0}\n`;
            block += `└ Машин: ${p.carsCount || 0}`;
        }

        // ── Баффы / Дебаффы / Работы ──────────────────────────────
        const buffsLine = (p.buffs && p.buffs.length)
            ? p.buffs.filter(b => !b.debuff).map(b => b.text).join(', ') || '—' : '—';
        const debuffsLine = (p.buffs && p.buffs.length)
            ? p.buffs.filter(b => b.debuff).map(b => b.text).join(', ') || '—' : '—';
        const jobsLine = (p.jobs && p.jobs.length)
            ? p.jobs.map(j => `${j.title} (ур.${j.lvl})`).join(', ') : '—';

        block += `\n\n⚡ <b>Баффы:</b> ${buffsLine}\n`;
        block += `💀 <b>Дебаффы:</b> ${debuffsLine}\n`;
        block += `💼 <b>Работы:</b> ${jobsLine}`;

        // ── Live HUD: состояние персонажа ─────────────────────────
        const hInfo = getHudInfoFull();
        if (hInfo) {
            const hp     = hInfo.health  !== undefined ? Math.round(hInfo.health)  + '%' : '❓';
            const armour = hInfo.armour  !== undefined ? Math.round(hInfo.armour)  + '%' : '—';
            const hunger = hInfo.hunger  !== undefined ? Math.round(hInfo.hunger)  + '%' : '—';
            const wantedCount = hInfo.wanted !== undefined ? hInfo.wanted : null;
            const wantedStr   = wantedCount !== null
                ? (wantedCount > 0 ? '⭐'.repeat(wantedCount) : 'Нет') : '—';

            block += `\n\n❤️ <b>Состояние персонажа:</b>\n`;
            block += `├ HP: ${hp}  |  🛡 Броня: ${armour}\n`;
            block += `├ 🍖 Голод: ${hunger}  |  🚨 Розыск: ${wantedStr}\n`;

            if (hInfo.breath !== undefined && hInfo.breath < 99) {
                block += `├ 🌊 Дыхание: ${hInfo.breath}%\n`;
            }

            if (hInfo.weapon) {
                const wName = String(hInfo.weapon).split('/').pop().replace(/\.\w+$/, '');
                const clip  = hInfo.ammoInClip !== undefined ? hInfo.ammoInClip  : '—';
                const total = hInfo.totalAmmo  !== undefined ? hInfo.totalAmmo   : '—';
                block += `└ 🔫 Оружие: ${wName}  (${clip} / ${total})\n`;
            }
        }

        // ── Позиция ───────────────────────────────────────────────
        block += `\n📍 <b>Позиция:</b>\n<code>${posStr}</code>`;

        // ── Время онлайна / Тюрьма ───────────────────────────────
        if (globalState.sessionStartTime) {
            const onlineSec = Math.floor((Date.now() - globalState.sessionStartTime) / 1000);
            const hh  = Math.floor(onlineSec / 3600);
            const mm  = Math.floor((onlineSec % 3600) / 60);
            const ss  = onlineSec % 60;
            const pad = n => String(n).padStart(2, '0');
            block += `\n⏰ <b>Онлайн:</b> ${hh}ч ${pad(mm)}м ${pad(ss)}с`;
        }
        if (globalState.inPrison) {
            block += `\n🔒 <b>Тюрьма: АКТИВНА</b>`;
        }

        // ── AFK цикл (только если активен) ───────────────────────
        if (config.afkCycle && config.afkCycle.active) {
            const afkMins = Math.floor(config.afkCycle.totalPlayTime / 60000);
            const afkSal  = (config.afkCycle.totalSalary || 0).toLocaleString('ru-RU');
            const modeNames = { fixed: '5/5 мин', random: 'Рандом', none: 'Без паузы' };
            const modeLabel = modeNames[config.afkCycle.mode] || config.afkCycle.mode;
            block += `\n\n🔄 <b>AFK цикл активен</b>  [${modeLabel}]\n`;
            block += `└ Наиграно: ${afkMins} мин  |  Накоплено: ₽${afkSal}`;
        }

        // ── Лог сессии (последние 8 событий) ─────────────────────
        const logLines = globalState.sessionLog && globalState.sessionLog.length > 0
            ? globalState.sessionLog.slice(-8).map(e => `<code>${e}</code>`).join('\n')
            : '<i>Нет событий</i>';
        block += `\n\n📋 <b>Лог сессии:</b>\n${logLines}`;

        return block;
    } catch (e) {
        return `\n\n❌ <i>Ошибка получения инфо: ${e.message}</i>`;
    }
}

// ── Строит полный текст приветственного сообщения ──
function buildWelcomeText() {
    const _ci  = window.CODE_COMMIT_INFO;
    const _ci2 = window.CODE2_COMMIT_INFO;

    let _versionLine = '';
    if (_ci)  _versionLine += `\n  <i>Code: ${_ci.date} — ${_ci.msg}</i>`;
    if (_ci2) _versionLine += `\n  <i>Code2: ${_ci2.date} — ${_ci2.msg}</i>`;
    const playerIdDisplay = config.lastPlayerId ? ` (ID: ${config.lastPlayerId})` : '';

    let text = `🟢 <b>${BOT_NAME}</b>${_versionLine}\n` +
        `Ник: ${config.accountInfo.nickname || '...'}${playerIdDisplay}\n` +
        `Сервер: ${config.accountInfo.server || 'Не указан'}`;

    // Блок инфо об аккаунте (всегда если ник известен)
    if (config.accountInfo.nickname) {
        text += buildWelcomeAccountInfo();
    }

    // Блок настроек (только если пользователь раскрыл)
    if (globalState.welcomeShowSettings) {
        text += `\n\n🔔 <b>Текущие настройки уведомлений:</b>\n` +
            `├ Уведомления PayDay: ${config.paydayNotifications ? '🟢 ВКЛ' : '🔴 ВЫКЛ'}\n` +
            `├ Уведомления от сотрудников: ${config.govMessagesEnabled ? '🟢 ВКЛ' : '🔴 ВЫКЛ'}\n` +
            `├ Уведомления рации (все): ${config.radioOfficialNotifications ? '🟢 ВКЛ' : '🔴 ВЫКЛ'}\n` +
            `├ Рация — важные (строй/место/ID): ${config.radioImportantFilter ? '🟢 ВКЛ' : '🔴 ВЫКЛ'}\n` +
            `├ Уведомления выговоры: ${config.warningNotifications ? '🟢 ВКЛ' : '🔴 ВЫКЛ'}\n` +
            `├ Отслеживание местоположения: ${config.trackLocationRequests ? '🟢 ВКЛ' : '🔴 ВЫКЛ'}\n` +
            `└ Автоответ КАЧ/ЗП: ${config.kacAutoReply ? '🟢 ВКЛ' : '🔴 ВЫКЛ'}`;
    }

    return text;
}

// ── Строит inline-клавиатуру приветственного сообщения ──
function buildWelcomeKeyboard() {
    const settingsBtn = globalState.welcomeShowSettings
        ? createButton('🙈 Скрыть настройки уведомлений', `hide_welcome_settings_${uniqueId}`)
        : createButton('🔔 Настройки уведомлений', `show_welcome_settings_${uniqueId}`);

    return {
        inline_keyboard: [
            [createButton('⚙️ Управление', `show_controls_${uniqueId}`, 'primary')],
            [createButton('💰 Инфо об аккаунте', `local_account_info_${uniqueId}`, 'primary'), settingsBtn]
        ]
    };
}

function sendWelcomeMessage() {
    if (!config.accountInfo.nickname) {
        debugLog('Ник не определен, откладываем отправку приветственного сообщения');
        return;
    }

    const message = buildWelcomeText();
    const replyMarkup = buildWelcomeKeyboard();

    // Хранилище ID приветственного сообщения отдельно по каждому чату
    if (!globalState.welcomeMessageIds) globalState.welcomeMessageIds = {};
    if (!globalState.welcomeSending) globalState.welcomeSending = {};

    config.chatIds.forEach(chatId => {
        const existingId = globalState.welcomeMessageIds[chatId];
        if (existingId) {
            // Редактируем уже отправленное сообщение — не шлём новое
            editMessageText(chatId, existingId, message, replyMarkup);
        } else if (globalState.welcomeSending[chatId]) {
            // Уже летит запрос на отправку — не дублируем
            debugLog(`[WELCOME] Чат ${chatId}: отправка уже в процессе, пропускаем`);
        } else {
            // Первый запуск: ставим флаг и отправляем
            globalState.welcomeSending[chatId] = true;
            tgApi('sendMessage', {
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML',
                disable_notification: false,
                reply_markup: JSON.stringify(replyMarkup)
            }, data => {
                globalState.welcomeSending[chatId] = false;
                if (data && data.result) {
                    globalState.welcomeMessageIds[chatId] = data.result.message_id;
                    globalState.lastWelcomeMessageId = data.result.message_id;
                    debugLog(`[WELCOME] Отправлено в чат ${chatId}, ID: ${data.result.message_id}`);
                }
            }, () => {
                // На ошибке сети — снимаем флаг, следующий вызов попробует снова
                globalState.welcomeSending[chatId] = false;
                debugLog(`[WELCOME] Ошибка отправки в чат ${chatId}`);
            });
        }
    });
}
// END WELCOME MESSAGE MODULE //

// ╔══════════════════════════════════════════════════════════╗
// ║  MODULE: AFK                                             ║
// ║  Описание: AFK-циклы (fixed / random / none)             ║
// ║             управление паузами, реконнект, зарплата,     ║
// ║             статус в Telegram                            ║
// ║  Зависимости: config, displayName, debugLog,             ║
// ║               sendToTelegram, editMessageText,           ║
// ║               createButton, sendChatInput,               ║
// ║               autoLoginConfig, reconnectionCommand       ║
// ╚══════════════════════════════════════════════════════════╝
// START AFK MODULE //
// Функция для обновления статуса AFK в одном редактируемом сообщении
function getAFKStatusText() {
    if (!config.afkCycle.active) return '';
    const modeText = config.afkCycle.mode === 'fixed' ? '5 мин играем, 5 мин пауза' :
        config.afkCycle.mode === 'random' ? 'рандомное время игры/паузы' :
        'без пауз';
    let reconnectText = '';
    if (config.autoReconnectEnabled) {
        reconnectText = `\nРеконнект: ${config.afkCycle.reconnectEnabled ? '🟢 ВКЛ' : '🔴 ВЫКЛ'}`;
    }
    let statusText = `\n\n🔄 <b>AFK цикл для ${displayName}</b>\nРежим: ${modeText}${reconnectText}\nОбщее игровое время: ${Math.floor(config.afkCycle.totalPlayTime / 60000)} мин\n\n`;
    statusText += '<b>Последние игровые фазы:</b>\n';
    config.afkCycle.playHistory.slice(-3).forEach((entry, index) => {
        statusText += `${index + 1}. ${entry}\n`;
    });
    statusText += '\n<b>Последние паузы:</b>\n';
    config.afkCycle.pauseHistory.slice(-3).forEach((entry, index) => {
        statusText += `${index + 1}. ${entry}\n`;
    });
    if (config.afkCycle.mode === 'none') {
        statusText += `\n\n<b>Накоплено с зарплат:</b> ${config.afkCycle.totalSalary} руб`;
    }
    return statusText;
}
function updateAFKStatus(isNew = false) {
    if (!config.afkCycle.active) return;
    const statusText = getAFKStatusText().replace(/^\n\n/, '');
    const fullText = `🔄 <b>AFK цикл для ${displayName}</b>${statusText}`;
    if (isNew) {
        // Отправляем новое сообщение и сохраняем IDs
        config.afkCycle.statusMessageIds = [];
        config.chatIds.forEach(chatId => {
            tgApi('sendMessage', {
                chat_id: chatId,
                text: fullText,
                parse_mode: 'HTML'
            }, data => {
                if (data && data.result) {
                    const messageId = data.result.message_id;
                    config.afkCycle.statusMessageIds.push({ chatId, messageId });
                    debugLog(`Новое AFK статус-сообщение отправлено в чат ${chatId}: ID ${messageId}`);
                }
            }, () => debugLog(`[AFK] Ошибка отправки статус-сообщения в чат ${chatId}`));
        });
    } else {
        // Редактируем существующие сообщения
        config.afkCycle.statusMessageIds.forEach(({ chatId, messageId }) => {
            editMessageText(chatId, messageId, fullText);
        });
    }
}
function activateAFKWithMode(mode, reconnect, restartAction, chatId, messageId) {
    if (config.afkSettings.active) {
        sendToTelegram(`🔄 <b>AFK режим уже активирован для ${displayName}</b>`, false, null);
        return;
    }
    const hudId = getPlayerIdFromHUD();
    if (!hudId) {
        sendToTelegram(`❌ <b>Ошибка ${displayName}:</b> Не удалось получить ID из HUD`, false, null);
        return;
    }
    const idFormats = [hudId];
    if (hudId.includes('-')) {
        idFormats.push(hudId.replace(/-/g, ''));
    } else if (hudId.length === 3) {
        idFormats.push(`${hudId[0]}-${hudId[1]}-${hudId[2]}`);
    }
    config.afkSettings = {
        id: hudId,
        formats: idFormats,
        active: true
    };
    config.afkCycle.mode = mode;
    config.afkCycle.reconnectEnabled = reconnect;
    config.afkCycle.restartAction = restartAction || 'q';
    startAFKCycle();
    sendToTelegram(`🔄 <b>AFK режим активирован для ${displayName}</b>\nID из HUD: ${hudId}\nФорматы: ${idFormats.join(', ')}\n🔁 <b>Запущен AFK цикл для PayDay</b>`, false, null);
    // Возвращаемся в главное меню или скрываем кнопки
    showGlobalFunctionsMenu(chatId, messageId, uniqueId);
}
function startAFKCycle() {
    config.afkCycle.active = true;
    config.afkCycle.startTime = Date.now();
    config.afkCycle.totalPlayTime = 0;
    config.afkCycle.playHistory = [];
    config.afkCycle.pauseHistory = [];
    config.afkCycle.statusMessageIds = [];
    config.afkCycle.totalSalary = 0; // Сбрасываем накопленную зарплату при старте цикла
    debugLog(`AFK цикл запущен для ${displayName}`);
    updateAFKStatus(true); // Создаем новое сообщение
}
function stopAFKCycle() {
    if (config.afkCycle.cycleTimer) {
        clearTimeout(config.afkCycle.cycleTimer);
    }
    if (config.afkCycle.playTimer) {
        clearTimeout(config.afkCycle.playTimer);
    }
    if (config.afkCycle.pauseTimer) {
        clearTimeout(config.afkCycle.pauseTimer);
    }
    if (config.afkCycle.mainTimer) {
        clearTimeout(config.afkCycle.mainTimer);
    }
    // Удаляем статус-сообщения
    config.afkCycle.statusMessageIds.forEach(({ chatId, messageId }) => {
        deleteMessage(chatId, messageId);
    });
    config.afkCycle.statusMessageIds = [];
    config.afkCycle.active = false;
    debugLog(`AFK цикл остановлен для ${displayName}`);
    sendToTelegram(`⏹️ <b>AFK цикл остановлен для ${displayName}</b>`, false, null);
}
function startPlayPhase() {
    if (!config.afkCycle.active) return;
    debugLog(`Начинаем игровую фазу для ${displayName}`);
    config.afkCycle.currentPlayTime = 0;
    const requiredPlayTime = 25 * 60 * 1000;
    let playDurationMs;
    if (config.afkCycle.mode === 'fixed') {
        playDurationMs = 5 * 60 * 1000;
    } else if (config.afkCycle.mode === 'random') {
        const minMin = 2;
        const maxMin = 8;
        const remainingPlay = requiredPlayTime - config.afkCycle.totalPlayTime;
        if (remainingPlay <= 0) {
            handleCycleEnd();
            return;
        }
        const maxPossible = Math.min(maxMin * 60 * 1000, remainingPlay);
        const minPossible = Math.min(minMin * 60 * 1000, maxPossible);
        playDurationMs = Math.floor(Math.random() * (maxPossible - minPossible + 1) + minPossible);
    } else {
        // Без пауз: играем до requiredPlayTime
        playDurationMs = requiredPlayTime - config.afkCycle.totalPlayTime;
        if (playDurationMs <= 0) {
            handleCycleEnd();
            return;
        }
    }
    const durationMin = Math.floor(playDurationMs / 60000);
    const currentTime = getCurrentTimeString();
    config.afkCycle.playHistory.push(`▶️ Игровой режим [${durationMin} мин] в ${currentTime}`);
    if (config.afkCycle.playHistory.length > 3) {
        config.afkCycle.playHistory.shift(); // Удаляем самую старую (сверху вниз)
    }
    updateAFKStatus(); // Обновляем статус-сообщение
    try {
        if (typeof closeInterface === 'function') {
            closeInterface("PauseMenu");
            debugLog(`Выход из паузы для ${displayName}`);
        }
    } catch (e) {
        debugLog(`Ошибка при выходе из паузы: ${e.message}`);
    }
    debugLog(`Игровая фаза: ${durationMin} минут`);
    config.afkCycle.playTimer = setTimeout(() => {
        config.afkCycle.totalPlayTime += playDurationMs;
        if (config.afkCycle.totalPlayTime < requiredPlayTime && config.afkCycle.mode !== 'none') {
            startPausePhase();
        } else {
            debugLog(`Отыграно ${requiredPlayTime / 60000} минут для ${displayName}`);
            handleCycleEnd();
        }
    }, playDurationMs);
}
function handleCycleEnd() {
    if (config.afkCycle.mode === 'none' && config.afkCycle.reconnectEnabled) {
        handleNoneReconnectEnd();
    } else {
        enterPauseUntilEnd();
    }
}
function handleNoneReconnectEnd() {
    autoLoginConfig.enabled = false;
    sendChatInput("/rec 5");
    sendToTelegram(`🔄 <b>None: Отключен автовход и отправлен /rec 5 (${displayName})</b>` + getAFKStatusText());
    const timePassed = Date.now() - config.afkCycle.startTime;
    const timeToReconnect = 59 * 60 * 1000 - timePassed;
    if (timeToReconnect > 0) {
        setTimeout(() => {
            autoLoginConfig.enabled = true;
            sendChatInput("/rec 5");
            sendToTelegram(`🔄 <b>None: Включен автовход и отправлен /rec 5 (${displayName})</b>`);
        }, timeToReconnect);
    }
}
function startPausePhase() {
    if (!config.afkCycle.active) return;
    debugLog(`Начинаем фазу паузы для ${displayName}`);
    config.afkCycle.currentPauseTime = 0;
    let pauseDurationMs;
    if (config.afkCycle.mode === 'fixed') {
        pauseDurationMs = 5 * 60 * 1000;
    } else if (config.afkCycle.mode === 'random') {
        const minMin = 2;
        const maxMin = 8;
        pauseDurationMs = Math.floor(Math.random() * ((maxMin - minMin) * 60 * 1000 + 1) + minMin * 60 * 1000);
    }
    const durationMin = Math.floor(pauseDurationMs / 60000);
    const currentTime = getCurrentTimeString();
    config.afkCycle.pauseHistory.push(`💤 Режим паузы [${durationMin} мин] в ${currentTime}`);
    if (config.afkCycle.pauseHistory.length > 3) {
        config.afkCycle.pauseHistory.shift(); // Удаляем самую старую (сверху вниз)
    }
    updateAFKStatus(); // Обновляем статус-сообщение
    try {
        if (typeof openInterface === 'function') {
            openInterface("PauseMenu");
            debugLog(`Вход в паузу для ${displayName}`);
        }
    } catch (e) {
        debugLog(`Ошибка при входе в паузу: ${e.message}`);
    }
    debugLog(`Пауза: ${durationMin} минут`);
    config.afkCycle.pauseTimer = setTimeout(() => {
        startPlayPhase();
    }, pauseDurationMs);
}
function enterPauseUntilEnd() {
    const currentTime = getCurrentTimeString();
    config.afkCycle.pauseHistory.push(`💤 Пауза до PayDay (до 59 мин) в ${currentTime}`);
    if (config.afkCycle.pauseHistory.length > 3) {
        config.afkCycle.pauseHistory.shift();
    }
    updateAFKStatus(); // Обновляем статус-сообщение
    try {
        if (typeof openInterface === 'function') {
            openInterface("PauseMenu");
            debugLog(`Вход в паузу до конца для ${displayName}`);
        }
    } catch (e) {
        debugLog(`Ошибка при входе в паузу до конца: ${e.message}`);
    }
}
function handlePayDayTimeMessage() {
    if (!config.afkSettings.active) {
        return;
    }
    if (config.afkCycle.cycleTimer) {
        clearTimeout(config.afkCycle.cycleTimer);
    }
    if (config.afkCycle.playTimer) {
        clearTimeout(config.afkCycle.playTimer);
    }
    if (config.afkCycle.pauseTimer) {
        clearTimeout(config.afkCycle.pauseTimer);
    }
    if (config.afkCycle.mainTimer) {
        clearTimeout(config.afkCycle.mainTimer);
    }
    const mainTimerDuration = 59 * 60 * 1000;
    config.afkCycle.mainTimer = setTimeout(() => {
        try {
            if (typeof closeInterface === 'function') {
                closeInterface("PauseMenu");
                debugLog(`Выход из паузы перед следующим PayDay для ${displayName}`);
            }
        } catch (e) {
            debugLog(`Ошибка при выходе из паузы: ${e.message}`);
        }
        if (config.afkCycle.playTimer) clearTimeout(config.afkCycle.playTimer);
        if (config.afkCycle.pauseTimer) clearTimeout(config.afkCycle.pauseTimer);
        debugLog(`Готов к следующему PayDay для ${displayName}`);
        config.afkCycle.totalPlayTime = 0;
        startPlayPhase();
    }, mainTimerDuration);
    if (!config.afkCycle.active) {
        startAFKCycle();
    }
    config.afkCycle.startTime = Date.now();
    config.afkCycle.totalPlayTime = 0;
    const modeText = config.afkCycle.mode === 'fixed' ? '5 мин играем, 5 мин пауза' : config.afkCycle.mode === 'random' ? 'рандомное время игры/паузы' : 'без пауз';
    debugLog(`Обнаружено сообщение "Текущее время:", начинаем AFK цикл для ${displayName}`);
    updateAFKStatus(); // Обновляем с начальным статусом
    startPlayPhase();
}
// END AFK MODULE //

// ╔══════════════════════════════════════════════════════════╗
// ║  MODULE: OTYGROVKA AUTO                                  ║
// ║  Описание: Автоматический 25-мин цикл отыгровки.         ║
// ║    • Считает ТОЛЬКО время when isPlayerConnected=true    ║
// ║      и PauseMenu закрыто (авторизация/пауза — не считаем)║
// ║    • После 27 мин → выход /rec 5 в :59:20 + автовход    ║
// ║    • Ловим PayDay в :00 → сбрасываем и повторяем         ║
// ║  Зависимости: globalState, autoLoginConfig,              ║
// ║               sendChatInput, sendToTelegram, debugLog,   ║
// ║               displayName                                ║
// ╚══════════════════════════════════════════════════════════╝
// START OTYGROVKA AUTO MODULE //

const OTYGROVKA_TARGET_SEC = 27 * 60; // 1620 сек = 27 мин

// ── Суммарное in-game время в секундах (начальное + накопленное) ──────────
function _otygrovkaTotalSec() {
    return (globalState.otygrovkaInitialSec || 0) + (globalState.otygrovkaPlaySec || 0);
}

// ── Остановить трекинг и все таймеры ─────────────────────────────────────
function stopOtygrovkaTracking() {
    if (globalState.otygrovkaTrackInterval) {
        clearInterval(globalState.otygrovkaTrackInterval);
        globalState.otygrovkaTrackInterval = null;
    }
    if (globalState.otygrovkaExitTimer) {
        clearTimeout(globalState.otygrovkaExitTimer);
        globalState.otygrovkaExitTimer = null;
    }
    debugLog('[OTYGROVKA] Трекинг остановлен');
}

// ── Проверка: игрок заспавнен и не на паузе ──────────────────────────────
function _otygrovkaIsActive() {
    let isConnected = false;
    try { isConnected = !!window.App.$store.getters['player/isPlayerConnected']; } catch(e) {}
    if (!isConnected) return false;
    let isPaused = false;
    try { isPaused = !!window.getInterfaceStatus('PauseMenu'); } catch(e) {}
    return !isPaused;
}

// ── Запустить трекинг секунд ──────────────────────────────────────────────
// initialMinutes — «Время в игре за час» из /c 60 (число минут)
function startOtygrovkaTracking(initialMinutes) {
    stopOtygrovkaTracking(); // Сбрасываем предыдущий интервал

    const initSec = (initialMinutes || 0) * 60;
    globalState.otygrovkaInitialSec = initSec;
    globalState.otygrovkaPlaySec    = 0;

    debugLog(`[OTYGROVKA] Запуск трекинга. Начало: ${initialMinutes} мин (${initSec} сек). Цель: 27 мин.`);

    // Уже 25+ мин? Сразу планируем выход
    if (initSec >= OTYGROVKA_TARGET_SEC) {
        debugLog('[OTYGROVKA] Уже ≥27 мин — немедленно планируем выход в :59:20');
        scheduleOtygrovkaExit();
        return;
    }

    globalState.otygrovkaTrackInterval = setInterval(function() {
        if (!globalState.otygrovkaAuto) {
            clearInterval(globalState.otygrovkaTrackInterval);
            globalState.otygrovkaTrackInterval = null;
            return;
        }
        if (!_otygrovkaIsActive()) return; // Не считаем: не в игре / пауза

        globalState.otygrovkaPlaySec++;

        if (_otygrovkaTotalSec() >= OTYGROVKA_TARGET_SEC && !globalState.otygrovkaExitTimer) {
            clearInterval(globalState.otygrovkaTrackInterval);
            globalState.otygrovkaTrackInterval = null;
            scheduleOtygrovkaExit();
        }
    }, 1000);
}

// ── Запланировать выход и реконнект ──────────────────────────────────────
// ШАГ 1 (сейчас):    autoLogin ВЫКЛ + /rec 5 → висим на авторизации
// ШАГ 2 (в :59:20):  autoLogin ВКЛ  + /rec 5 → заходим, ловим PayDay в :00
function scheduleOtygrovkaExit() {
    if (globalState.otygrovkaExitTimer) return; // Уже запланирован

    const now = new Date();
    const min = now.getMinutes();
    const sec = now.getSeconds();

    // ШАГ 1 — немедленно выходим на авторизацию
    autoLoginConfig.enabled = false;
    sendChatInput('/rec 5');

    // Секунды до :59:20 текущего (или следующего) часа
    let secsUntilReconnect = (59 - min) * 60 + (20 - sec);
    if (secsUntilReconnect < 0) secsUntilReconnect += 3600;
    // Если уже почти :59:20 — даём хотя бы 5 сек
    if (secsUntilReconnect < 5) secsUntilReconnect += 3600;

    const totalSec  = _otygrovkaTotalSec();
    const totalMin  = Math.floor(totalSec / 60);
    const totalSecR = totalSec % 60;
    const reconnTime = new Date(Date.now() + secsUntilReconnect * 1000);
    const reconnStr  = `${String(reconnTime.getHours()).padStart(2,'0')}:59:20`;

    debugLog(`[OTYGROVKA] 27 мин выполнено (${totalMin}:${String(totalSecR).padStart(2,'0')}). autoLogin ВЫКЛ, /rec 5. Реконнект в ${reconnStr} через ${secsUntilReconnect} сек`);

    sendToTelegram(
        `🎭 <b>Отыгровка 27 мин — ${displayName}</b>\n` +
        `✅ <b>${totalMin} мин ${totalSecR} сек отыграно!</b>\n` +
        `🔴 Автовход ВЫКЛ — висим на авторизации\n` +
        `⏰ Включим автовход и зайдём в <b>${reconnStr}</b>\n` +
        `🕐 Через ${Math.floor(secsUntilReconnect/60)} мин ${secsUntilReconnect%60} сек`,
        false, null
    );

    // ШАГ 2 — в :59:20 включаем автовход и заходим
    globalState.otygrovkaExitTimer = setTimeout(function() {
        globalState.otygrovkaExitTimer = null;
        otygrovkaDoReconnect();
    }, secsUntilReconnect * 1000);
}

// ── ШАГ 2: включить автовход и зайти для поимки PayDay ───────────────────
function otygrovkaDoReconnect() {
    if (!globalState.otygrovkaAuto) return;

    autoLoginConfig.enabled = true;
    sendChatInput('/rec 5');

    debugLog('[OTYGROVKA] :59:20 — autoLogin ВКЛ, /rec 5 — заходим для PayDay в :00');
    sendToTelegram(
        `🎭 <b>Отыгровка — заходим для PayDay (${displayName})</b>\n` +
        `🟢 Автовход ВКЛ + /rec 5\n` +
        `💰 Ловим PayDay в :00 → новый цикл`,
        false, null
    );
}

// ── Сброс и запуск нового цикла после PayDay ──────────────────────────────
function otygrovkaResetAfterPayday() {
    if (!globalState.otygrovkaAuto) return;

    debugLog('[OTYGROVKA] PayDay получен — сбрасываем счётчик, ждём спавна для нового цикла');
    stopOtygrovkaTracking();
    globalState.otygrovkaInitialSec = 0;
    globalState.otygrovkaPlaySec    = 0;

    // Ждём спавна (isPlayerConnected = true), затем запускаем новый цикл
    var _waitSpawn = setInterval(function() {
        if (!globalState.otygrovkaAuto) { clearInterval(_waitSpawn); return; }

        let isConnected = false;
        try { isConnected = !!window.App.$store.getters['player/isPlayerConnected']; } catch(e) {}

        if (isConnected) {
            clearInterval(_waitSpawn);
            debugLog('[OTYGROVKA] Спавн после PayDay — новый цикл трекинга (0 мин → 27 мин)');
            startOtygrovkaTracking(0);
            sendToTelegram(
                `🎭 <b>Отыгровка — новый цикл (${displayName})</b>\n` +
                `▶️ Трекинг запущен: 0 → 27 мин`,
                false, null
            );
        }
    }, 2000);
}

// END OTYGROVKA AUTO MODULE //







// ╔══════════════════════════════════════════════════════════╗
// ║  MODULE: MENU                                            ║
// ║  Описание: Telegram inline-меню управления ботом         ║
// ║             (настройки, AFK-режимы, функции)             ║
// ║  Зависимости: config, displayName, uniqueId, debugLog,   ║
// ║               sendToTelegram, editMessageText,           ║
// ║               createButton, answerCallbackQuery          ║
// ╚══════════════════════════════════════════════════════════╝
// START MENU MODULE //
function showControlsMenu(chatId, messageId) {
    if (!config.accountInfo.nickname) {
        sendToTelegram(`❌ <b>Ошибка ${displayName}</b>\nНик не определен`, false, null);
        return;
    }
    const replyMarkup = {
        inline_keyboard: [
            [createButton("⚙️ Функции", `show_local_functions_${uniqueId}`, 'primary')],
            [createButton("📋 Общие функции", `show_global_functions_${uniqueId}`, 'primary')],
            [createButton("💰 Инфо об аккаунте", `local_account_info_${uniqueId}`, 'primary')],
            [createButton("🔔 Настройки уведомлений", `show_welcome_settings_${uniqueId}`)],
            [createButton("🔄 Перезагрузить скрипт", `global_reload_script_${uniqueId}`, 'danger')],
            [createButton("⬅️ Вернуться назад", `hide_controls_${uniqueId}`)]
        ]
    };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function showGlobalFunctionsMenu(chatId, messageId, uniqueIdParam) {
    let inlineKeyboard = [
        [createButton("🔔 PayDay", `show_payday_options_${uniqueIdParam}`)],
        [createButton("🏛️ Сообщ.", `show_soob_options_${uniqueIdParam}`)],
        [createButton("📍 Место", `show_mesto_options_${uniqueIdParam}`)],
        [createButton("📡 Рация", `show_radio_options_${uniqueIdParam}`)],
        [createButton("⚠️ Выговоры", `show_warning_options_${uniqueIdParam}`)],
        [createButton("🌙 AFK Ночь", `global_afk_n_${uniqueIdParam}`, 'primary')],

        [createButton(`🛡️ КАЧ/ЗП автоответ ${config.kacAutoReply ? '🟢' : '🔴'}`, `show_kac_options_${uniqueIdParam}`)],
    ];
    inlineKeyboard.push([createButton("⬅️ Вернуться назад", `show_controls_${uniqueIdParam}`)]);
    const replyMarkup = {
        inline_keyboard: inlineKeyboard
    };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function showPayDayOptionsMenu(chatId, messageId, uniqueIdParam) {
    const replyMarkup = {
        inline_keyboard: [
            [
                createButton("🔔 ВКЛ", `global_p_on_${uniqueIdParam}`, 'success'),
                createButton("🔕 ВЫКЛ", `global_p_off_${uniqueIdParam}`, 'danger')
            ],
            [createButton("⬅️ Вернуться назад", `show_global_functions_${uniqueIdParam}`)]
        ]
    };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function showSoobOptionsMenu(chatId, messageId, uniqueIdParam) {
    const replyMarkup = {
        inline_keyboard: [
            [
                createButton("🔔 ВКЛ", `global_soob_on_${uniqueIdParam}`, 'success'),
                createButton("🔕 ВЫКЛ", `global_soob_off_${uniqueIdParam}`, 'danger')
            ],
            [createButton("⬅️ Вернуться назад", `show_global_functions_${uniqueIdParam}`)]
        ]
    };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function showMestoOptionsMenu(chatId, messageId, uniqueIdParam) {
    const replyMarkup = {
        inline_keyboard: [
            [
                createButton("🔔 ВКЛ", `global_mesto_on_${uniqueIdParam}`, 'success'),
                createButton("🔕 ВЫКЛ", `global_mesto_off_${uniqueIdParam}`, 'danger')
            ],
            [createButton("⬅️ Вернуться назад", `show_global_functions_${uniqueIdParam}`)]
        ]
    };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function showRadioOptionsMenu(chatId, messageId, uniqueIdParam) {
    const replyMarkup = {
        inline_keyboard: [
            [
                createButton(`📡 Все ${config.radioOfficialNotifications ? '🟢' : '🔴'}`, `global_radio_on_${uniqueIdParam}`, 'success'),
                createButton(`🔕 Выкл все`, `global_radio_off_${uniqueIdParam}`, 'danger')
            ],
            [
                createButton(`🎯 Фильтр ${config.radioImportantFilter ? '🟢' : '🔴'}`, `global_radio_filter_on_${uniqueIdParam}`, 'success'),
                createButton(`🚫 Фильтр выкл`, `global_radio_filter_off_${uniqueIdParam}`, 'danger')
            ],
            [createButton("⬅️ Вернуться назад", `show_global_functions_${uniqueIdParam}`)]
        ]
    };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function showWarningOptionsMenu(chatId, messageId, uniqueIdParam) {
    const replyMarkup = {
        inline_keyboard: [
            [
                createButton("🔔 ВКЛ", `global_warning_on_${uniqueIdParam}`, 'success'),
                createButton("🔕 ВЫКЛ", `global_warning_off_${uniqueIdParam}`, 'danger')
            ],
            [createButton("⬅️ Вернуться назад", `show_global_functions_${uniqueIdParam}`)]
        ]
    };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function showKacOptionsMenu(chatId, messageId, uniqueIdParam) {
    const replyMarkup = {
        inline_keyboard: [
            [
                createButton("🟢 ВКЛ", `global_kac_on_${uniqueIdParam}`, 'success'),
                createButton("🔴 ВЫКЛ", `global_kac_off_${uniqueIdParam}`, 'danger')
            ],
            [createButton("⬅️ Вернуться назад", `show_global_functions_${uniqueIdParam}`)]
        ]
    };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function showAFKNightModesMenu(chatId, messageId, uniqueIdParam) {
    const replyMarkup = {
        inline_keyboard: [
            [
                createButton("С паузами", `afk_n_with_pauses_${uniqueIdParam}`, 'success'),
                createButton("Без пауз", `afk_n_without_pauses_${uniqueIdParam}`, 'primary')
            ],
            [createButton("⬅️ Вернуться назад", `show_global_functions_${uniqueIdParam}`)]
        ]
    };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function showAFKWithPausesSubMenu(chatId, messageId, uniqueIdParam) {
    const replyMarkup = {
        inline_keyboard: [
            [
                createButton("5/5 минут", `afk_n_fixed_${uniqueIdParam}`),
                createButton("Рандомное время", `afk_n_random_${uniqueIdParam}`)
            ],
            [createButton("⬅️ Вернуться назад", `global_afk_n_${uniqueIdParam}`)]
        ]
    };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function showAFKReconnectMenu(chatId, messageId, uniqueIdParam, selectedMode) {
    const replyMarkup = {
        inline_keyboard: [
            [
                createButton("Реконнект 🟢", `afk_n_reconnect_on_${uniqueIdParam}_${selectedMode}`),
                createButton("Реконнект 🔴", `afk_n_reconnect_off_${uniqueIdParam}_${selectedMode}`)
            ],
            [createButton("⬅️ Вернуться назад", `afk_n_with_pauses_${uniqueIdParam}`)]
        ]
    };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function showRestartActionMenu(chatId, messageId, uniqueIdParam, selectedMode) {
    const replyMarkup = {
        inline_keyboard: [
            [
                createButton("/q", `restart_q_${uniqueIdParam}_${selectedMode}`),
                createButton("/rec", `restart_rec_${uniqueIdParam}_${selectedMode}`)
            ],
            [createButton("⬅️ Вернуться назад", `back_from_restart_${uniqueIdParam}_${selectedMode}`)]
        ]
    };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function showLocalFunctionsMenu(chatId, messageId) {
    if (!config.accountInfo.nickname) {
        sendToTelegram(`❌ <b>Ошибка ${displayName}</b>\nНик не определен`, false, null);
        return;
    }
    const isPaused = !!window.getInterfaceStatus("PauseMenu");
    const isAutoLoginDisabled = !autoLoginConfig.enabled;
    const pauseBtn = isPaused
        ? createButton("▶️ Выйти с паузы", `local_pause_toggle_${uniqueId}`)
        : createButton("⏸️ Уйти на паузу", `local_pause_toggle_${uniqueId}`);
    const autoLoginBtn = isAutoLoginDisabled
        ? createButton("✅ Выйти с автр.", `local_autologin_toggle_${uniqueId}`)
        : createButton("🚫 Уйти на автр.", `local_autologin_toggle_${uniqueId}`);
    const replyMarkup = {
        inline_keyboard: [
            [createButton("🚶 Движение", `show_movement_controls_${uniqueId}`)],
            [createButton("🏛️ Увед. правик", `show_local_soob_options_${uniqueId}`)],
            [createButton("📍 Отслеживание", `show_local_mesto_options_${uniqueId}`)],
            [createButton("📡 Рация", `show_local_radio_options_${uniqueId}`)],
            [createButton("⚠️ Выговоры", `show_local_warning_options_${uniqueId}`)],
            [createButton(`🛡️ КАЧ/ЗП автоответ ${config.kacAutoReply ? '🟢' : '🔴'}`, `show_local_kac_options_${uniqueId}`)],
            [createButton(`🎭 Отыгровка 27 мин ${globalState.otygrovkaMode ? '🟢' : '🔴'}`, `show_otygrovka_options_${uniqueId}`)],
            [createButton("📝 Написать в чат", `request_chat_message_${uniqueId}`)],
            [pauseBtn, autoLoginBtn],
            [createButton("⬅️ Вернуться назад", `show_controls_${uniqueId}`)]
        ]
    };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function showMovementControlsMenu(chatId, messageId, isNotification = false) {
    if (!config.accountInfo.nickname) {
        sendToTelegram(`❌ <b>Ошибка ${displayName}</b>\nНик не определен`, false, null);
        return;
    }
    const backButton = isNotification ?
        [[createButton("⬅️ Вернуться назад", `back_to_notification_${uniqueId}`)]] :
        [[createButton("⬅️ Вернуться назад", `show_local_functions_${uniqueId}`)]];
    const sitStandButton = config.isSitting ?
        createButton("🧍 Встать", `move_stand_${uniqueId}${isNotification ? '_notification' : ''}`)
        : createButton("🪑 Сесть", `move_sit_${uniqueId}${isNotification ? '_notification' : ''}`);
    const replyMarkup = {
        inline_keyboard: [
            [createButton("⬆️ Вперед", `move_forward_${uniqueId}${isNotification ? '_notification' : ''}`)],
            [createButton("⬅️ Влево", `move_left_${uniqueId}${isNotification ? '_notification' : ''}`), createButton("➡️ Вправо", `move_right_${uniqueId}${isNotification ? '_notification' : ''}`)],
            [createButton("⬇️ Назад", `move_back_${uniqueId}${isNotification ? '_notification' : ''}`)],
            [createButton("🆙 Прыжок", `move_jump_${uniqueId}${isNotification ? '_notification' : ''}`)],
            [createButton("👊 Удар", `move_punch_${uniqueId}${isNotification ? '_notification' : ''}`)],
            [sitStandButton],
            ...backButton
        ]
    };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function showLocalSoobOptionsMenu(chatId, messageId) {
    if (!config.accountInfo.nickname) {
        sendToTelegram(`❌ <b>Ошибка ${displayName}</b>\nНик не определен`, false, null);
        return;
    }
    const replyMarkup = {
        inline_keyboard: [
            [
                createButton("🔔 ВКЛ", `local_soob_on_${uniqueId}`),
                createButton("🔕 ВЫКЛ", `local_soob_off_${uniqueId}`)
            ],
            [createButton("⬅️ Вернуться назад", `show_local_functions_${uniqueId}`)]
        ]
    };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function showLocalMestoOptionsMenu(chatId, messageId) {
    if (!config.accountInfo.nickname) {
        sendToTelegram(`❌ <b>Ошибка ${displayName}</b>\nНик не определен`, false, null);
        return;
    }
    const replyMarkup = {
        inline_keyboard: [
            [
                createButton("🔔 ВКЛ", `local_mesto_on_${uniqueId}`),
                createButton("🔕 ВЫКЛ", `local_mesto_off_${uniqueId}`)
            ],
            [createButton("⬅️ Вернуться назад", `show_local_functions_${uniqueId}`)]
        ]
    };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function showLocalRadioOptionsMenu(chatId, messageId) {
    if (!config.accountInfo.nickname) {
        sendToTelegram(`❌ <b>Ошибка ${displayName}</b>\nНик не определен`, false, null);
        return;
    }
    const replyMarkup = {
        inline_keyboard: [
            [
                createButton(`📡 Все ${config.radioOfficialNotifications ? '🟢' : '🔴'}`, `local_radio_on_${uniqueId}`),
                createButton(`🔕 Выкл все`, `local_radio_off_${uniqueId}`)
            ],
            [
                createButton(`🎯 Фильтр ${config.radioImportantFilter ? '🟢' : '🔴'}`, `local_radio_filter_on_${uniqueId}`),
                createButton(`🚫 Фильтр выкл`, `local_radio_filter_off_${uniqueId}`)
            ],
            [createButton("⬅️ Вернуться назад", `show_local_functions_${uniqueId}`)]
        ]
    };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function showLocalWarningOptionsMenu(chatId, messageId) {
    if (!config.accountInfo.nickname) {
        sendToTelegram(`❌ <b>Ошибка ${displayName}</b>\nНик не определен`, false, null);
        return;
    }
    const replyMarkup = {
        inline_keyboard: [
            [
                createButton("🔔 ВКЛ", `local_warning_on_${uniqueId}`),
                createButton("🔕 ВЫКЛ", `local_warning_off_${uniqueId}`)
            ],
            [createButton("⬅️ Вернуться назад", `show_local_functions_${uniqueId}`)]
        ]
    };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function showLocalKacOptionsMenu(chatId, messageId) {
    if (!config.accountInfo.nickname) {
        sendToTelegram(`❌ <b>Ошибка ${displayName}</b>\nНик не определен`, false, null);
        return;
    }
    const replyMarkup = {
        inline_keyboard: [
            [
                createButton("🟢 ВКЛ", `local_kac_on_${uniqueId}`),
                createButton("🔴 ВЫКЛ", `local_kac_off_${uniqueId}`)
            ],
            [createButton("⬅️ Вернуться назад", `show_local_functions_${uniqueId}`)]
        ]
    };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function showOtygrovkaMenu(chatId, messageId) {
    if (!config.accountInfo.nickname) {
        sendToTelegram(`❌ <b>Ошибка ${displayName}</b>\nНик не определен`, false, null);
        return;
    }
    const isAuto = globalState.otygrovkaAuto;
    const lastTime = globalState.otygrovkaTimeInHour;

    // Прогресс трекинга
    const totalSec  = (globalState.otygrovkaInitialSec || 0) + (globalState.otygrovkaPlaySec || 0);
    const totalMin  = Math.floor(totalSec / 60);
    const totalSecR = totalSec % 60;
    const pctDone   = Math.min(100, Math.round(totalSec / OTYGROVKA_TARGET_SEC * 100));

    const replyMarkup = {
        inline_keyboard: [
            [
                createButton(`🎭 ВКЛ ${isAuto ? '🟢' : '⚪'}`, `otygrovka_on_${uniqueId}`),
                createButton(`⏹️ ВЫКЛ ${!isAuto ? '🔴' : '⚪'}`, `otygrovka_off_${uniqueId}`)
            ],
            [createButton(`⬅️ Вернуться назад`, `show_local_functions_${uniqueId}`)]
        ]
    };

    let statusText;
    if (isAuto) {
        if (globalState.otygrovkaExitTimer) {
            // Фаза 2: висим на авторизации, ждём :59:20
            statusText =
                `\nСтатус: 🟡 <b>Ждём :59:20</b> — на авторизации` +
                `\n📊 ${totalMin} мин ${totalSecR} сек отыграно ✅` +
                `\n🔴 Автовход ВЫКЛ — зайдём в :59:20`;
        } else if (globalState.otygrovkaTrackInterval) {
            // Фаза 1: трекинг идёт
            statusText =
                `\nСтатус: 🟢 <b>Трекинг идёт</b>` +
                `\n📊 ${totalMin} мин ${totalSecR} сек / 27 мин (${pctDone}%)` +
                `\n⚡ Счёт: только in-game (без паузы/авторизации)`;
        } else {
            // Ждём диалог /c 60
            statusText =
                `\nСтатус: 🟢 <b>Активна</b> — ожидаем данные /c 60` +
                (lastTime !== null && lastTime !== undefined ? `\nВремя за час: <b>${lastTime}</b>` : '');
        }
    } else {
        statusText =
            `\nСтатус: ⏹️ Неактивна` +
            (lastTime !== null && lastTime !== undefined ? `\nПоследнее время за час: <b>${lastTime}</b>` : '') +
            (globalState.otygrovkaCurrentTime ? `\nПоследнее реальное время: <b>${globalState.otygrovkaCurrentTime}</b>` : '');
    }

    editMessageText(
        chatId, messageId,
        `🎭 <b>Отыгровка 27 мин — ${displayName}</b>${statusText}`,
        replyMarkup
    );
}
function hideControlsMenu(chatId, messageId) {
    if (!config.accountInfo.nickname) {
        sendToTelegram(`❌ <b>Ошибка ${displayName}</b>\nНик не определен`, false, null);
        return;
    }
    // Восстанавливаем полную welcome-клавиатуру (Управление + Инфо об аккаунте + Настройки уведомлений)
    editMessageReplyMarkup(chatId, messageId, buildWelcomeKeyboard());
}
// END MENU MODULE //

// ╔══════════════════════════════════════════════════════════╗
// ║  MODULE: NOTIFICATION BUTTONS HELPER                     ║
// ║  Описание: Генерация inline-кнопок для уведомлений       ║
// ║             (ответить, проигнорировать и др.)            ║
// ║  Зависимости: config, uniqueId, createButton             ║
// ╚══════════════════════════════════════════════════════════╝
// START NOTIFICATION BUTTONS HELPER //
// Возвращает разметку кнопок для уведомлений (Ответить, Движения, Пауза, Авторизация)
function getNotificationReplyMarkup() {
    const isPaused = !!window.getInterfaceStatus("PauseMenu");
    const isAutoLoginDisabled = !autoLoginConfig.enabled;
    const pauseBtn = isPaused
        ? createButton("▶️ Выйти с паузы", `pause_exit_${uniqueId}`)
        : createButton("⏸️ Уйти на паузу", `pause_enter_${uniqueId}`);
    const autoLoginBtn = isAutoLoginDisabled
        ? createButton("✅ Выйти с автр.", `autologin_on_${uniqueId}`)
        : createButton("🚫 Уйти на автр.", `autologin_off_${uniqueId}`);
    return {
        inline_keyboard: [
            [
                createButton("📝 Ответить", `admin_reply_${uniqueId}`),
                createButton("🚶 Движения", `show_movement_${uniqueId}`)
            ],
            [pauseBtn, autoLoginBtn],
            [createButton("⚙️ Управление", `show_controls_${uniqueId}`)]
        ]
    };
}
// END NOTIFICATION BUTTONS HELPER //

// ╔══════════════════════════════════════════════════════════╗
// ║  MODULE: TELEGRAM COMMANDS                               ║
// ║  Описание: Обработка входящих сообщений и callback       ║
// ║             от пользователя в Telegram.                  ║
// ║             Команды: /hb, /afk, /rec, /stop, /msg и др. ║
// ║             Точка входа: processUpdates()                ║
// ║  Зависимости: config, globalState, displayName,          ║
// ║               uniqueId, debugLog,                        ║
// ║               sendToTelegram, editMessageText,           ║
// ║               deleteMessage, answerCallbackQuery,        ║
// ║               createButton, sendChatInput,               ║
// ║               showControlsMenu, activateAFKWithMode,     ║
// ║               stopAFKCycle, setSharedLastUpdateId        ║
// ╚══════════════════════════════════════════════════════════╝
// START TELEGRAM COMMANDS MODULE //
// Ссылка на текущий long-poll XHR — для прерывания при необходимости
let _pollXhr = null;
let _pollRestartScheduled = false; // FIX: предотвращает двойной запуск poll-цикла

// Прерывает текущий long-poll и немедленно перезапускает с timeout=0.
// Вызывать перед sendMessage — освобождает соединение для срочных API-вызовов.
function _abortPollAndRestartFast() {
    _pollRestartScheduled = true;
    if (_pollXhr) {
        _pollXhr.abort();
        _pollXhr = null;
        debugLog('[POLL] Long-poll прерван для быстрого режима');
    }
    setTimeout(checkTelegramCommands, 0);
}

function checkTelegramCommands() {
    if (window._hassleReloading) return;
    _pollRestartScheduled = false;
    config.lastUpdateId = getSharedLastUpdateId();

    const url = `https://api.telegram.org/bot${config.botToken}/getUpdates?offset=${config.lastUpdateId + 1}&timeout=25`;
    const xhr = new XMLHttpRequest();
    _pollXhr = xhr;
    xhr.open('GET', url, true);
    xhr.timeout = 30000;
    xhr.onload = function() {
        if (_pollXhr === xhr) _pollXhr = null;
        if (xhr.status === 200) {
            try {
                const data = JSON.parse(xhr.responseText);
                if (data.ok && data.result.length > 0) {
                    processUpdates(data.result);
                }
            } catch (e) {
                debugLog('Ошибка парсинга ответа Telegram:', e);
            }
        }
        // Если _abortPollAndRestartFast уже запланировал новый цикл — не дублируем
        if (!_pollRestartScheduled) {
            setTimeout(checkTelegramCommands, 0);
        }
    };
    xhr.onerror = function(error) {
        if (_pollXhr === xhr) _pollXhr = null;
        debugLog('Ошибка при проверке команд:', error);
        setTimeout(checkTelegramCommands, config.checkInterval);
    };
    xhr.ontimeout = function() {
        if (_pollXhr === xhr) _pollXhr = null;
        debugLog('Long-polling timeout, перезапуск...');
        setTimeout(checkTelegramCommands, 0);
    };
    xhr.send();
}
function processUpdates(updates) {
    for (const update of updates) {
        config.lastUpdateId = update.update_id;
        setSharedLastUpdateId(config.lastUpdateId); // Обновляем shared после обработки
        let chatId = null;
        if (update.message) {
            chatId = update.message.chat.id;
        } else if (update.callback_query) {
            chatId = update.callback_query.message.chat.id;
        }
        // Проверяем, что chat_id входит в config.chatIds
        if (!config.chatIds.includes(String(chatId))) {
            debugLog(`Игнорируем обновление из неавторизованного чата: ${chatId}`);
            continue;
        }

        // ===== GLOBAL BROADCAST: перехват команд #HBGLOBAL =====
        if (update.message && update.message.text) {
            const globalMatch = update.message.text.match(/#HBGLOBAL:(\w+):(\w+)/);
            if (globalMatch) {
                const [, cmd, val] = globalMatch;
                handleGlobalBroadcastCommand(cmd, val);
                config.lastUpdateId = update.update_id;
                setSharedLastUpdateId(config.lastUpdateId);
                continue; // не передавать дальше в обычный обработчик
            }
        }
        // ===== END GLOBAL BROADCAST =====

        if (update.message) {
            const message = update.message.text ? update.message.text.trim() : '';
            // Проверяем, является ли сообщение ответом на запрос ввода
            if (update.message.reply_to_message) {
                const replyToText = update.message.reply_to_message.text || '';
                // Ответ на запрос сообщения для чата
                if (replyToText.includes(`✉️ Введите сообщение для ${displayName}:`) && 
                    replyToText.includes(`🔑 ID: ${uniqueId}`)) {
                    const textToSend = message;
                    if (textToSend) {
                        debugLog(`[${displayName}] Отправка сообщения: ${textToSend}`);
                        try {
                            sendChatInput(textToSend);
                            sendToTelegram(`✅ <b>Сообщение отправлено ${displayName}:</b>\n<code>${textToSend.replace(/</g, '&lt;')}</code>`, false, null);
                        } catch (err) {
                            const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось отправить сообщение\n<code>${err.message}</code>`;
                            debugLog(errorMsg);
                            sendToTelegram(errorMsg, false, null);
                        }
                    }
                    continue;
                }
                // Ответ на запрос ответа администратору
                if (replyToText.includes(`✉️ Введите ответ для ${displayName}:`) && 
                    replyToText.includes(`🔑 ID: ${uniqueId}`)) {
                    const textToSend = message;
                    if (textToSend) {
                        debugLog(`[${displayName}] Отправка ответа: ${textToSend}`);
                        try {
                            sendChatInput(textToSend);
                            sendToTelegram(`✅ <b>Ответ отправлен ${displayName}:</b>\n<code>${textToSend.replace(/</g, '&lt;')}</code>`, false, null);
                        } catch (err) {
                            const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось отправить ответ\n<code>${err.message}</code>`;
                            debugLog(errorMsg);
                            sendToTelegram(errorMsg, false, null);
                        }
                    }
                    continue;
                }

            }
            // Глобальные команды (работают на все аккаунты)
            if (message === '/reload') {
                reloadAllAccounts();
            } else if (message === '/dbg_on') {
                startDebugStatTracker();
                sendToTelegram(`🔍 <b>Debug-трекер запущен для ${displayName}</b>\nКаждую секунду в консоль: HP, координаты, скин, спавн.\n/dbg_off — остановить`, false, null);
            } else if (message === '/dbg_off') {
                stopDebugStatTracker();
                sendToTelegram(`⏹ <b>Debug-трекер остановлен для ${displayName}</b>`, false, null);
            } else if (message === '/p_off') {
                config.paydayNotifications = false;
                sendToTelegram(`🔕 <b>Уведомления о PayDay отключены для ${displayName}</b>`, false, null);
                sendWelcomeMessage();
            } else if (message === '/p_on') {
                config.paydayNotifications = true;
                sendToTelegram(`🔔 <b>Уведомления о PayDay включены для ${displayName}</b>`, false, null);
                sendWelcomeMessage();
            } else if (message === '/soob_off') {
                config.govMessagesEnabled = false;
                sendToTelegram(`🔕 <b>Уведомления от сотрудников фракции отключены для ${displayName}</b>`, false, null);
                sendWelcomeMessage();
            } else if (message === '/soob_on') {
                config.govMessagesEnabled = true;
                sendToTelegram(`🔔 <b>Уведомления от сотрудников фракции включены для ${displayName}</b>`, false, null);
                sendWelcomeMessage();
            } else if (message === '/mesto_on') {
                config.trackLocationRequests = true;
                sendToTelegram(`📍 <b>Отслеживание запросов местоположения включено для ${displayName}</b>`, false, null);
                sendWelcomeMessage();
            } else if (message === '/mesto_off') {
                config.trackLocationRequests = false;
                sendToTelegram(`🔕 <b>Отслеживание запросов местоположения отключено для ${displayName}</b>`, false, null);
                sendWelcomeMessage();
            } else if (message.startsWith(`/chat${config.accountInfo.nickname}_${config.accountInfo.server} `)) {
                const textToSend = message.replace(`/chat${config.accountInfo.nickname}_${config.accountInfo.server} `, '').trim();
                debugLog(`[${displayName}] Получено сообщение: ${textToSend}`);
                try {
                    sendChatInput(textToSend);
                    sendToTelegram(`✅ <b>Сообщение отправлено ${displayName}:</b>\n<code>${textToSend.replace(/</g, '&lt;')}</code>`, false, null);
                } catch (err) {
                    const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось отправить сообщение\n<code>${err.message}</code>`;
                    debugLog(errorMsg);
                    sendToTelegram(errorMsg, false, null);
                }
            } else if (message.startsWith('/afk_n')) {
                const parts = message.split(' ');
                let targetNickname = config.accountInfo.nickname;
                if (parts.length >= 2 && parts[1]) {
                    targetNickname = parts[1];
                }
                if (targetNickname === config.accountInfo.nickname) {
                    const hudId = getPlayerIdFromHUD();
                    if (!hudId) {
                        sendToTelegram(`❌ <b>Ошибка ${displayName}:</b> Не удалось получить ID из HUD`, false, null);
                        continue;
                    }
                    const idFormats = [hudId];
                    if (hudId.includes('-')) {
                        idFormats.push(hudId.replace(/-/g, ''));
                    } else if (hudId.length === 3) {
                        idFormats.push(`${hudId[0]}-${hudId[1]}-${hudId[2]}`);
                    }
                    config.afkSettings = {
                        id: hudId,
                        formats: idFormats,
                        active: true
                    };
                    startAFKCycle();
                    sendToTelegram(`🔄 <b>AFK режим активирован для ${displayName}</b>\nID из HUD: ${hudId}\nФорматы: ${idFormats.join(', ')}\n🔁 <b>Запущен AFK цикл для PayDay</b>`, false, null);
                }
            } else if (message.startsWith('/register ')) {
                const parts = message.split(' ');
                if (parts.length >= 2) {
                    const nickname = parts[1];
                    config.activeUsers[nickname] = config.accountInfo.nickname || `User_${nickname}`;
                    debugLog(`[${displayName}] Зарегистрирован пользователь: ${nickname} - ${config.accountInfo.nickname}`);
                }
            } else if (message === '/list') {
                // Удаляем все старые welcome-сообщения и сбрасываем оба хранилища ID
                if (!globalState.welcomeMessageIds) globalState.welcomeMessageIds = {};
                config.chatIds.forEach(cid => {
                    const oldId = globalState.welcomeMessageIds[cid];
                    if (oldId) {
                        deleteMessage(cid, oldId);
                        delete globalState.welcomeMessageIds[cid];
                    }
                });
                globalState.lastWelcomeMessageId = null;
                sendWelcomeMessage();
            }
        } else if (update.callback_query) {
            const message = update.callback_query.data;
            const chatId = update.callback_query.message.chat.id;
            const messageId = update.callback_query.message.message_id;
            const callbackQueryId = update.callback_query.id; // Для answerCallbackQuery
            // FIX: отвечаем на callback СРАЗУ — кнопка перестаёт крутиться мгновенно.
            // Раньше это делалось в конце после всей обработки → задержка до нескольких секунд.
            // dlg_* тоже нужно ответить здесь, иначе Dialog Monitor ответит позже сам.
            answerCallbackQuery(callbackQueryId);
            // ── FIX: dlg_* коллбэки обрабатываются исключительно Dialog Monitor ──
            // Основной processUpdates их НЕ трогает — передаём дальше через continue
            if (message.startsWith('dlg_')) {
                continue;
            }

            const isGlobalCommand = message.startsWith('global_') ||
                message.startsWith('afk_n_') ||
                message.startsWith('restart_q_') ||
                message.startsWith('restart_rec_') ||
                message.startsWith('back_from_restart_') ||
                message.startsWith('show_payday_options_') ||
                message.startsWith('show_soob_options_') ||
                message.startsWith('show_mesto_options_') ||
                message.startsWith('show_radio_options_') ||
                message.startsWith('show_warning_options_') ||
                message.startsWith('show_kac_options_') ||
                message.startsWith('show_global_functions_');
            let callbackUniqueId = null;
            if (message.startsWith('show_controls_')) {
                callbackUniqueId = message.replace('show_controls_', '');
            } else if (message.startsWith('show_local_functions_')) {
                callbackUniqueId = message.replace('show_local_functions_', '');
            } else if (message.startsWith('show_movement_controls_')) {
                callbackUniqueId = message.replace('show_movement_controls_', '');
            } else if (message.startsWith("show_movement_")) {
                callbackUniqueId = message.replace('show_movement_', '');
            } else if (message.startsWith('hide_controls_')) {
                callbackUniqueId = message.replace('hide_controls_', '');
            } else if (message.startsWith('request_chat_message_')) {
                callbackUniqueId = message.replace('request_chat_message_', '');
            } else if (message.startsWith('local_soob_on_')) {
                callbackUniqueId = message.replace('local_soob_on_', '');
            } else if (message.startsWith('local_soob_off_')) {
                callbackUniqueId = message.replace('local_soob_off_', '');
            } else if (message.startsWith('local_mesto_on_')) {
                callbackUniqueId = message.replace('local_mesto_on_', '');
            } else if (message.startsWith('local_mesto_off_')) {
                callbackUniqueId = message.replace('local_mesto_off_', '');
            } else if (message.startsWith('local_radio_on_')) {
                callbackUniqueId = message.replace('local_radio_on_', '');
            } else if (message.startsWith('local_radio_off_')) {
                callbackUniqueId = message.replace('local_radio_off_', '');
            } else if (message.startsWith('local_radio_filter_on_')) {
                callbackUniqueId = message.replace('local_radio_filter_on_', '');
            } else if (message.startsWith('local_radio_filter_off_')) {
                callbackUniqueId = message.replace('local_radio_filter_off_', '');
            } else if (message.startsWith('local_warning_on_')) {
                callbackUniqueId = message.replace('local_warning_on_', '');
            } else if (message.startsWith('local_warning_off_')) {
                callbackUniqueId = message.replace('local_warning_off_', '');
            } else if (message.startsWith('local_pause_toggle_')) {
                callbackUniqueId = message.replace('local_pause_toggle_', '');
            } else if (message.startsWith('local_autologin_toggle_')) {
                callbackUniqueId = message.replace('local_autologin_toggle_', '');
            } else if (message.startsWith('local_account_info_')) {
                callbackUniqueId = message.replace('local_account_info_', '');
            } else if (message.startsWith('show_welcome_settings_')) {
                callbackUniqueId = message.replace('show_welcome_settings_', '');
            } else if (message.startsWith('hide_welcome_settings_')) {
                callbackUniqueId = message.replace('hide_welcome_settings_', '');
            } else if (message.startsWith('show_otygrovka_options_')) {
                callbackUniqueId = message.replace('show_otygrovka_options_', '');
            } else if (message.startsWith('otygrovka_on_')) {
                callbackUniqueId = message.replace('otygrovka_on_', '');
            } else if (message.startsWith('otygrovka_off_')) {
                callbackUniqueId = message.replace('otygrovka_off_', '');
            } else if (message.startsWith('move_forward_')) {
                callbackUniqueId = message.replace('move_forward_', '').replace('_notification', '');
            } else if (message.startsWith('move_back_')) {
                callbackUniqueId = message.replace('move_back_', '').replace('_notification', '');
            } else if (message.startsWith('move_left_')) {
                callbackUniqueId = message.replace('move_left_', '').replace('_notification', '');
            } else if (message.startsWith('move_right_')) {
                callbackUniqueId = message.replace('move_right_', '').replace('_notification', '');
            } else if (message.startsWith('move_jump_')) {
                callbackUniqueId = message.replace('move_jump_', '').replace('_notification', '');
            } else if (message.startsWith('move_punch_')) {
                callbackUniqueId = message.replace('move_punch_', '').replace('_notification', '');
            } else if (message.startsWith('move_sit_')) {
                callbackUniqueId = message.replace('move_sit_', '').replace('_notification', '');
            } else if (message.startsWith('move_stand_')) {
                callbackUniqueId = message.replace('move_stand_', '').replace('_notification', '');
            } else if (message.startsWith('admin_reply_')) {
                callbackUniqueId = message.replace('admin_reply_', '');
            } else if (message.startsWith('back_to_notification_')) {
                callbackUniqueId = message.replace('back_to_notification_', '');
            } else if (message.startsWith('pause_enter_')) {
                callbackUniqueId = message.replace('pause_enter_', '');
            } else if (message.startsWith('pause_exit_')) {
                callbackUniqueId = message.replace('pause_exit_', '');
            } else if (message.startsWith('autologin_off_')) {
                callbackUniqueId = message.replace('autologin_off_', '');
            } else if (message.startsWith('autologin_on_')) {
                callbackUniqueId = message.replace('autologin_on_', '');
            } else if (message.startsWith('show_local_soob_options_')) {
                callbackUniqueId = message.replace('show_local_soob_options_', '');
            } else if (message.startsWith('show_local_mesto_options_')) {
                callbackUniqueId = message.replace('show_local_mesto_options_', '');
            } else if (message.startsWith('show_local_radio_options_')) {
                callbackUniqueId = message.replace('show_local_radio_options_', '');
            } else if (message.startsWith('show_local_warning_options_')) {
                callbackUniqueId = message.replace('show_local_warning_options_', '');
            } else if (message.startsWith('show_local_kac_options_')) {
                callbackUniqueId = message.replace('show_local_kac_options_', '');
            } else if (message.startsWith('local_kac_on_')) {
                callbackUniqueId = message.replace('local_kac_on_', '');
            } else if (message.startsWith('local_kac_off_')) {
                callbackUniqueId = message.replace('local_kac_off_', '');
            } else if (message.startsWith('global_p_on_')) {
                callbackUniqueId = message.replace('global_p_on_', '');
            } else if (message.startsWith('global_p_off_')) {
                callbackUniqueId = message.replace('global_p_off_', '');
            } else if (message.startsWith('global_soob_on_')) {
                callbackUniqueId = message.replace('global_soob_on_', '');
            } else if (message.startsWith('global_soob_off_')) {
                callbackUniqueId = message.replace('global_soob_off_', '');
            } else if (message.startsWith('global_mesto_on_')) {
                callbackUniqueId = message.replace('global_mesto_on_', '');
            } else if (message.startsWith('global_mesto_off_')) {
                callbackUniqueId = message.replace('global_mesto_off_', '');
            } else if (message.startsWith('global_radio_on_')) {
                callbackUniqueId = message.replace('global_radio_on_', '');
            } else if (message.startsWith('global_radio_off_')) {
                callbackUniqueId = message.replace('global_radio_off_', '');
            } else if (message.startsWith('global_radio_filter_on_')) {
                callbackUniqueId = message.replace('global_radio_filter_on_', '');
            } else if (message.startsWith('global_radio_filter_off_')) {
                callbackUniqueId = message.replace('global_radio_filter_off_', '');
            } else if (message.startsWith('global_warning_on_')) {
                callbackUniqueId = message.replace('global_warning_on_', '');
            } else if (message.startsWith('global_warning_off_')) {
                callbackUniqueId = message.replace('global_warning_off_', '');
            } else if (message.startsWith('global_afk_n_')) {
                callbackUniqueId = message.replace('global_afk_n_', '');
            } else if (message.startsWith('afk_n_with_pauses_')) {
                callbackUniqueId = message.replace('afk_n_with_pauses_', '');
            } else if (message.startsWith('afk_n_without_pauses_')) {
                callbackUniqueId = message.replace('afk_n_without_pauses_', '');
            } else if (message.startsWith('afk_n_fixed_')) {
                callbackUniqueId = message.replace('afk_n_fixed_', '');
            } else if (message.startsWith('afk_n_random_')) {
                callbackUniqueId = message.replace('afk_n_random_', '');
            } else if (message.startsWith('show_payday_options_')) {
                callbackUniqueId = message.replace('show_payday_options_', '');
            } else if (message.startsWith('show_soob_options_')) {
                callbackUniqueId = message.replace('show_soob_options_', '');
            } else if (message.startsWith('show_mesto_options_')) {
                callbackUniqueId = message.replace('show_mesto_options_', '');
            } else if (message.startsWith('show_radio_options_')) {
                callbackUniqueId = message.replace('show_radio_options_', '');
            } else if (message.startsWith('show_warning_options_')) {
                callbackUniqueId = message.replace('show_warning_options_', '');
            } else if (message.startsWith('show_kac_options_')) {
                callbackUniqueId = message.replace('show_kac_options_', '');
            } else if (message.startsWith('global_kac_on_')) {
                callbackUniqueId = message.replace('global_kac_on_', '');
            } else if (message.startsWith('global_kac_off_')) {
                callbackUniqueId = message.replace('global_kac_off_', '');
            } else if (message.startsWith('show_global_functions_')) {
                callbackUniqueId = message.replace('show_global_functions_', '');
            } else if (message.startsWith('afk_n_reconnect_on_')) {
                const parts = message.split('_');
                callbackUniqueId = parts[parts.length - 2];
                const selectedMode = parts[parts.length - 1];
                showRestartActionMenu(chatId, messageId, callbackUniqueId, selectedMode);
            } else if (message.startsWith('afk_n_reconnect_off_')) {
                const parts = message.split('_');
                callbackUniqueId = parts[parts.length - 2];
                const selectedMode = parts[parts.length - 1];
                activateAFKWithMode(selectedMode, false, 'q', chatId, messageId);
            } else if (message.startsWith('restart_q_')) {
                const parts = message.split('_');
                callbackUniqueId = parts[parts.length - 2];
                const selectedMode = parts[parts.length - 1];
                activateAFKWithMode(selectedMode, true, 'q', chatId, messageId);
            } else if (message.startsWith('restart_rec_')) {
                const parts = message.split('_');
                callbackUniqueId = parts[parts.length - 2];
                const selectedMode = parts[parts.length - 1];
                activateAFKWithMode(selectedMode, true, 'rec', chatId, messageId);
            } else if (message.startsWith('back_from_restart_')) {
                const parts = message.split('_');
                callbackUniqueId = parts[parts.length - 2];
                const selectedMode = parts[parts.length - 1];
                showAFKReconnectMenu(chatId, messageId, callbackUniqueId, selectedMode);
            } else if (message.startsWith('prison_reconnect_')) {
                callbackUniqueId = message.replace('prison_reconnect_', '');
            } else if (message.startsWith('prison_quit_')) {
                callbackUniqueId = message.replace('prison_quit_', '');
            } else if (message.startsWith('local_account_info_')) {
                callbackUniqueId = message.replace('local_account_info_', '');
            }
            // Проверяем, является ли команда локальной (только для текущего аккаунта)
            const isForThisBot = isGlobalCommand ||
                (callbackUniqueId && callbackUniqueId === uniqueId) ||
                (update.callback_query.message.text && update.callback_query.message.text.includes(displayName)) ||
                (update.callback_query.message.reply_to_message &&
                update.callback_query.message.reply_to_message.text &&
                update.callback_query.message.reply_to_message.text.includes(displayName));
            if (!isForThisBot) {
                debugLog(`Игнорируем callback_query, так как он не для этого бота (${displayName}): ${message}`);
                continue; // answerCallbackQuery уже вызван в начале блока
            }
            // Обработка команд
            if (message.startsWith(`show_controls_`)) {
                showControlsMenu(chatId, messageId);
            } else if (message.startsWith(`show_global_functions_`)) {
                showGlobalFunctionsMenu(chatId, messageId, callbackUniqueId);
            } else if (message.startsWith(`show_local_functions_`)) {
                showLocalFunctionsMenu(chatId, messageId);
            } else if (message.startsWith(`show_movement_controls_`)) {
                showMovementControlsMenu(chatId, messageId);
            } else if (message.startsWith("show_movement_")) {
                showMovementControlsMenu(chatId, messageId, true);
            } else if (message.startsWith(`hide_controls_`)) {
                hideControlsMenu(chatId, messageId);
            } else if (message.startsWith(`request_chat_message_`)) {
                const requestMsg = `✉️ Введите сообщение для ${displayName}:\n(Будет отправлено как /chat${config.accountInfo.nickname}_${config.accountInfo.server} ваш_текст)\n🔑 ID: ${uniqueId}`;
                // Прерываем текущий long-poll — освобождаем соединение для sendMessage
                _abortPollAndRestartFast();
                sendToTelegram(requestMsg, false, {
                    force_reply: true
                });
            } else if (message.startsWith(`show_payday_options_`)) {
                showPayDayOptionsMenu(chatId, messageId, callbackUniqueId);
            } else if (message.startsWith(`show_soob_options_`)) {
                showSoobOptionsMenu(chatId, messageId, callbackUniqueId);
            } else if (message.startsWith(`show_mesto_options_`)) {
                showMestoOptionsMenu(chatId, messageId, callbackUniqueId);
            } else if (message.startsWith(`show_radio_options_`)) {
                showRadioOptionsMenu(chatId, messageId, callbackUniqueId);
            } else if (message.startsWith(`show_warning_options_`)) {
                showWarningOptionsMenu(chatId, messageId, callbackUniqueId);
            } else if (message.startsWith(`show_kac_options_`)) {
                showKacOptionsMenu(chatId, messageId, callbackUniqueId);
            } else if (message.startsWith(`global_kac_on_`)) {
                broadcastGlobalCommand('toggle_kac', 'on');
                sendWelcomeMessage();
            } else if (message.startsWith(`global_kac_off_`)) {
                broadcastGlobalCommand('toggle_kac', 'off');
                sendWelcomeMessage();
            } else if (message.startsWith(`global_p_on_`)) {
                config.paydayNotifications = true;
                sendToTelegram(`🔔 <b>Уведомления о PayDay включены для всех аккаунтов</b>`, false, null);
                sendWelcomeMessage();
            } else if (message.startsWith(`global_p_off_`)) {
                config.paydayNotifications = false;
                sendToTelegram(`🔕 <b>Уведомления о PayDay отключены для всех аккаунтов</b>`, false, null);
                sendWelcomeMessage();
            } else if (message.startsWith(`global_soob_on_`)) {
                config.govMessagesEnabled = true;
                sendToTelegram(`🔔 <b>Уведомления от сотрудников фракции включены для всех аккаунтов</b>`, false, null);
                sendWelcomeMessage();
            } else if (message.startsWith(`global_soob_off_`)) {
                config.govMessagesEnabled = false;
                sendToTelegram(`🔕 <b>Уведомления от сотрудников фракции отключены для всех аккаунтов</b>`, false, null);
                sendWelcomeMessage();
            } else if (message.startsWith(`global_mesto_on_`)) {
                config.trackLocationRequests = true;
                sendToTelegram(`📍 <b>Отслеживание запросов местоположения включено для всех аккаунтов</b>`, false, null);
                sendWelcomeMessage();
            } else if (message.startsWith(`global_mesto_off_`)) {
                config.trackLocationRequests = false;
                sendToTelegram(`🔕 <b>Отслеживание запросов местоположения отключено для всех аккаунтов</b>`, false, null);
                sendWelcomeMessage();
            } else if (message.startsWith(`global_radio_on_`)) {
                config.radioOfficialNotifications = true;
                sendToTelegram(`🔔 <b>Рация (все сообщения) включена для всех аккаунтов</b>`, false, null);
                sendWelcomeMessage();
            } else if (message.startsWith(`global_radio_off_`)) {
                config.radioOfficialNotifications = false;
                sendToTelegram(`🔕 <b>Рация (все сообщения) отключена для всех аккаунтов</b>`, false, null);
                sendWelcomeMessage();
            } else if (message.startsWith(`global_radio_filter_on_`)) {
                config.radioImportantFilter = true;
                sendToTelegram(`🎯 <b>Фильтр рации (строй/место/ID) включён для всех аккаунтов</b>`, false, null);
                sendWelcomeMessage();
            } else if (message.startsWith(`global_radio_filter_off_`)) {
                config.radioImportantFilter = false;
                sendToTelegram(`🚫 <b>Фильтр рации (строй/место/ID) отключён для всех аккаунтов</b>`, false, null);
                sendWelcomeMessage();
            } else if (message.startsWith(`global_warning_on_`)) {
                config.warningNotifications = true;
                sendToTelegram(`🔔 <b>Уведомления о выговорах включены для всех аккаунтов</b>`, false, null);
                sendWelcomeMessage();
            } else if (message.startsWith(`global_warning_off_`)) {
                config.warningNotifications = false;
                sendToTelegram(`🔕 <b>Уведомления о выговорах отключены для всех аккаунтов</b>`, false, null);
                sendWelcomeMessage();
            } else if (message.startsWith(`global_afk_n_`)) {
                showAFKNightModesMenu(chatId, messageId, callbackUniqueId);
            } else if (message.startsWith(`afk_n_with_pauses_`)) {
                showAFKWithPausesSubMenu(chatId, messageId, callbackUniqueId);
            } else if (message.startsWith(`afk_n_without_pauses_`)) {
                if (config.autoReconnectEnabled) {
                    showAFKReconnectMenu(chatId, messageId, callbackUniqueId, 'none');
                } else {
                    activateAFKWithMode('none', false, 'q', chatId, messageId);
                }
            } else if (message.startsWith(`afk_n_fixed_`)) {
                if (config.autoReconnectEnabled) {
                    showAFKReconnectMenu(chatId, messageId, callbackUniqueId, 'fixed');
                } else {
                    activateAFKWithMode('fixed', false, 'q', chatId, messageId);
                }
            } else if (message.startsWith(`afk_n_random_`)) {
                if (config.autoReconnectEnabled) {
                    showAFKReconnectMenu(chatId, messageId, callbackUniqueId, 'random');
                } else {
                    activateAFKWithMode('random', false, 'q', chatId, messageId);
                }
            } else if (message.startsWith("admin_reply_")) {
                const requestMsg = `✉️ Введите ответ для ${displayName}:\n🔑 ID: ${uniqueId}`;
                _abortPollAndRestartFast();
                sendToTelegram(requestMsg, false, {
                    force_reply: true
                });
            } else if (message.startsWith("move_forward_")) {
                const isNotif = message.endsWith('_notification');
                try {
                    window.onScreenControlTouchStart("<Gamepad>/leftStick");
                    window.onScreenControlTouchMove("<Gamepad>/leftStick", 0, 1);
                    setTimeout(() => {
                        window.onScreenControlTouchEnd("<Gamepad>/leftStick");
                    }, 500);
                    sendToTelegram(`🚶 <b>Движение вперед на 0.5 сек для ${displayName}</b>`, false, null);
                    showMovementControlsMenu(chatId, messageId, isNotif);
                } catch (err) {
                    const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось симулировать движение вперед\n<code>${err.message}</code>`;
                    debugLog(errorMsg);
                    sendToTelegram(errorMsg, false, null);
                }
            } else if (message.startsWith("move_back_")) {
                const isNotif = message.endsWith('_notification');
                try {
                    window.onScreenControlTouchStart("<Gamepad>/leftStick");
                    window.onScreenControlTouchMove("<Gamepad>/leftStick", 0, -1);
                    setTimeout(() => {
                        window.onScreenControlTouchEnd("<Gamepad>/leftStick");
                    }, 500);
                    sendToTelegram(`🚶 <b>Движение назад на 0.5 сек для ${displayName}</b>`, false, null);
                    showMovementControlsMenu(chatId, messageId, isNotif);
                } catch (err) {
                    const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось симулировать движение назад\n<code>${err.message}</code>`;
                    debugLog(errorMsg);
                    sendToTelegram(errorMsg, false, null);
                }
            } else if (message.startsWith("move_left_")) {
                const isNotif = message.endsWith('_notification');
                try {
                    window.onScreenControlTouchStart("<Gamepad>/leftStick");
                    window.onScreenControlTouchMove("<Gamepad>/leftStick", -1, 0);
                    setTimeout(() => {
                        window.onScreenControlTouchEnd("<Gamepad>/leftStick");
                    }, 500);
                    sendToTelegram(`🚶 <b>Движение влево на 0.5 сек для ${displayName}</b>`, false, null);
                    showMovementControlsMenu(chatId, messageId, isNotif);
                } catch (err) {
                    const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось симулировать движение влево\n<code>${err.message}</code>`;
                    debugLog(errorMsg);
                    sendToTelegram(errorMsg, false, null);
                }
            } else if (message.startsWith("move_right_")) {
                const isNotif = message.endsWith('_notification');
                try {
                    window.onScreenControlTouchStart("<Gamepad>/leftStick");
                    window.onScreenControlTouchMove("<Gamepad>/leftStick", 1, 0);
                    setTimeout(() => {
                        window.onScreenControlTouchEnd("<Gamepad>/leftStick");
                    }, 500);
                    sendToTelegram(`🚶 <b>Движение вправо на 0.5 сек для ${displayName}</b>`, false, null);
                    showMovementControlsMenu(chatId, messageId, isNotif);
                } catch (err) {
                    const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось симулировать движение вправо\n<code>${err.message}</code>`;
                    debugLog(errorMsg);
                    sendToTelegram(errorMsg, false, null);
                }
            } else if (message.startsWith("move_jump_")) {
                const isNotif = message.endsWith('_notification');
                try {
                    window.onScreenControlTouchStart("<Keyboard>/leftShift");
                    setTimeout(() => {
                        window.onScreenControlTouchEnd("<Keyboard>/leftShift");
                    }, 500);
                    sendToTelegram(`🆙 <b>Прыжок выполнен для ${displayName}</b>`, false, null);
                    showMovementControlsMenu(chatId, messageId, isNotif);
                } catch (err) {
                    const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось симулировать прыжок\n<code>${err.message}</code>`;
                    debugLog(errorMsg);
                    sendToTelegram(errorMsg, false, null);
                }
            } else if (message.startsWith("move_punch_")) {
                const isNotif = message.endsWith('_notification');
                try {
                    window.onScreenControlTouchStart("<Mouse>/leftButton");
                    setTimeout(() => window.onScreenControlTouchEnd("<Mouse>/leftButton"), 100);
                    sendToTelegram(`👊 <b>Удар выполнен для ${displayName}</b>`, false, null);
                    showMovementControlsMenu(chatId, messageId, isNotif);
                } catch (err) {
                    const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось симулировать удар\n<code>${err.message}</code>`;
                    debugLog(errorMsg);
                    sendToTelegram(errorMsg, false, null);
                }
            } else if (message.startsWith("move_sit_")) {
                const isNotif = message.endsWith('_notification');
                try {
                    window.onScreenControlTouchStart("<Keyboard>/c");
                    setTimeout(() => window.onScreenControlTouchEnd("<Keyboard>/c"), 500);
                    config.isSitting = true;
                    sendToTelegram(`✅ <b>Команда "Сесть" отправлена ${displayName}</b>`, false, null);
                    showMovementControlsMenu(chatId, messageId, isNotif);
                } catch (err) {
                    const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось отправить команду "Сесть"\n<code>${err.message}</code>`;
                    debugLog(errorMsg);
                    sendToTelegram(errorMsg, false, null);
                }
            } else if (message.startsWith("move_stand_")) {
                const isNotif = message.endsWith('_notification');
                try {
                    window.onScreenControlTouchStart("<Keyboard>/c");
                    setTimeout(() => window.onScreenControlTouchEnd("<Keyboard>/c"), 500);
                    config.isSitting = false;
                    sendToTelegram(`✅ <b>Команда "Встать" отправлена ${displayName}</b>`, false, null);
                    showMovementControlsMenu(chatId, messageId, isNotif);
                } catch (err) {
                    const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось отправить команду "Встать"\n<code>${err.message}</code>`;
                    debugLog(errorMsg);
                    sendToTelegram(errorMsg, false, null);
                }
            } else if (message.startsWith("back_to_notification_")) {
                editMessageReplyMarkup(chatId, messageId, getNotificationReplyMarkup());
            } else if (message.startsWith("pause_enter_")) {
                // Уйти на паузу
                try {
                    openInterface("PauseMenu");
                    sendToTelegram(`⏸️ <b>Вошли в паузу (${displayName})</b>`, true, null);
                } catch(e) {
                    sendToTelegram(`❌ <b>Ошибка паузы (${displayName}):</b> ${e.message}`, false, null);
                }
                editMessageReplyMarkup(chatId, messageId, getNotificationReplyMarkup());
            } else if (message.startsWith("pause_exit_")) {
                // Выйти с паузы
                try {
                    closeInterface("PauseMenu");
                    sendToTelegram(`▶️ <b>Вышли из паузы (${displayName})</b>`, true, null);
                } catch(e) {
                    sendToTelegram(`❌ <b>Ошибка выхода из паузы (${displayName}):</b> ${e.message}`, false, null);
                }
                editMessageReplyMarkup(chatId, messageId, getNotificationReplyMarkup());
            } else if (message.startsWith("autologin_off_")) {
                // Уйти на авторизацию (отключить автовход + /rec 5)
                autoLoginConfig.enabled = false;
                sendChatInput("/rec 5");
                sendToTelegram(`🚫 <b>Автовход отключён, отправлен /rec 5 (${displayName})</b>`, false, null);
                editMessageReplyMarkup(chatId, messageId, getNotificationReplyMarkup());
            } else if (message.startsWith("autologin_on_")) {
                // Вернуться с авторизации (включить автовход + /rec 5)
                autoLoginConfig.enabled = true;
                sendChatInput("/rec 5");
                sendToTelegram(`✅ <b>Автовход включён, отправлен /rec 5 (${displayName})</b>`, false, null);
                editMessageReplyMarkup(chatId, messageId, getNotificationReplyMarkup());
            } else if (message.startsWith("show_local_soob_options_")) {
                showLocalSoobOptionsMenu(chatId, messageId);
            } else if (message.startsWith("show_local_mesto_options_")) {
                showLocalMestoOptionsMenu(chatId, messageId);
            } else if (message.startsWith("show_local_radio_options_")) {
                showLocalRadioOptionsMenu(chatId, messageId);
            } else if (message.startsWith("show_local_warning_options_")) {
                showLocalWarningOptionsMenu(chatId, messageId);
            } else if (message.startsWith("show_local_kac_options_")) {
                showLocalKacOptionsMenu(chatId, messageId);
            } else if (message.startsWith("local_kac_on_")) {
                config.kacAutoReply = true;
                sendToTelegram(`🛡️ <b>Автоответ КАЧ/ЗП включён для ${displayName}</b>`, false, null);
                sendWelcomeMessage();
            } else if (message.startsWith("local_kac_off_")) {
                config.kacAutoReply = false;
                sendToTelegram(`🛡️ <b>Автоответ КАЧ/ЗП отключён для ${displayName}</b>`, false, null);
                sendWelcomeMessage();
            } else if (message.startsWith("local_soob_on_")) {
                config.govMessagesEnabled = true;
                sendToTelegram(`🔔 <b>Уведомления от сотрудников фракции включены для ${displayName}</b>`, false, null);
                sendWelcomeMessage();
            } else if (message.startsWith("local_soob_off_")) {
                config.govMessagesEnabled = false;
                sendToTelegram(`🔕 <b>Уведомления от сотрудников фракции отключены для ${displayName}</b>`, false, null);
                sendWelcomeMessage();
            } else if (message.startsWith("local_mesto_on_")) {
                config.trackLocationRequests = true;
                sendToTelegram(`📍 <b>Отслеживание запросов местоположения включено для ${displayName}</b>`, false, null);
                sendWelcomeMessage();
            } else if (message.startsWith("local_mesto_off_")) {
                config.trackLocationRequests = false;
                sendToTelegram(`🔕 <b>Отслеживание запросов местоположения отключено для ${displayName}</b>`, false, null);
                sendWelcomeMessage();
            } else if (message.startsWith("local_radio_on_")) {
                config.radioOfficialNotifications = true;
                sendToTelegram(`🔔 <b>Рация (все сообщения) включена для ${displayName}</b>`, false, null);
                sendWelcomeMessage();
            } else if (message.startsWith("local_radio_off_")) {
                config.radioOfficialNotifications = false;
                sendToTelegram(`🔕 <b>Рация (все сообщения) отключена для ${displayName}</b>`, false, null);
                sendWelcomeMessage();
            } else if (message.startsWith("local_radio_filter_on_")) {
                config.radioImportantFilter = true;
                sendToTelegram(`🎯 <b>Фильтр рации (строй/место/ID) включён для ${displayName}</b>`, false, null);
                sendWelcomeMessage();
            } else if (message.startsWith("local_radio_filter_off_")) {
                config.radioImportantFilter = false;
                sendToTelegram(`🚫 <b>Фильтр рации (строй/место/ID) отключён для ${displayName}</b>`, false, null);
                sendWelcomeMessage();
            } else if (message.startsWith("local_warning_on_")) {
                config.warningNotifications = true;
                sendToTelegram(`🔔 <b>Уведомления о выговорах включены для ${displayName}</b>`, false, null);
                sendWelcomeMessage();
            } else if (message.startsWith("local_warning_off_")) {
                config.warningNotifications = false;
                sendToTelegram(`🔕 <b>Уведомления о выговорах отключены для ${displayName}</b>`, false, null);
                sendWelcomeMessage();
            } else if (message.startsWith("local_pause_toggle_")) {
                // Переключение паузы из меню Функции
                const isPaused = !!window.getInterfaceStatus("PauseMenu");
                try {
                    if (isPaused) {
                        closeInterface("PauseMenu");
                        sendToTelegram(`▶️ <b>Вышли из паузы (${displayName})</b>`, true, null);
                    } else {
                        openInterface("PauseMenu");
                        sendToTelegram(`⏸️ <b>Вошли в паузу (${displayName})</b>`, true, null);
                    }
                } catch(e) {
                    sendToTelegram(`❌ <b>Ошибка паузы (${displayName}):</b> ${e.message}`, false, null);
                }
                showLocalFunctionsMenu(chatId, messageId);
            } else if (message.startsWith("local_autologin_toggle_")) {
                // Переключение автовхода из меню Функции
                if (autoLoginConfig.enabled) {
                    autoLoginConfig.enabled = false;
                    sendChatInput("/rec 5");
                    sendToTelegram(`🚫 <b>Автовход отключён, отправлен /rec 5 (${displayName})</b>`, false, null);
                } else {
                    autoLoginConfig.enabled = true;
                    sendChatInput("/rec 5");
                    sendToTelegram(`✅ <b>Автовход включён, отправлен /rec 5 (${displayName})</b>`, false, null);
                }
                showLocalFunctionsMenu(chatId, messageId);
            } else if (message.startsWith('show_welcome_settings_')) {
                // Кнопка "🔔 Настройки" — раскрываем блок настроек в welcome-сообщении
                globalState.welcomeShowSettings = true;
                sendWelcomeMessage();
            } else if (message.startsWith('hide_welcome_settings_')) {
                // Кнопка "🙈 Скрыть настройки" — скрываем блок настроек в welcome-сообщении
                globalState.welcomeShowSettings = false;
                sendWelcomeMessage();
            } else if (message.startsWith('prison_reconnect_')) {
                // Кнопка "Выйти с автр." — включаем автовход и делаем /rec 5
                autoLoginConfig.enabled = true;
                debugLog(`[PRISON] "Выйти с автр." нажата — включаем автовход, отправляем /rec 5`);
                sendToTelegram(`🔓 <b>Автовход включён (${displayName})</b>\nПодключаемся к серверу...`, false, null);
                deleteMessage(chatId, messageId);
                sendChatInput("/rec 5");
            } else if (message.startsWith('prison_quit_')) {
                // Кнопка "Выйти с игры" — /q
                debugLog(`[PRISON] "Выйти с игры" нажата — отправляем /q`);
                sendToTelegram(`🚪 <b>Выходим из игры (${displayName})</b>`, false, null);
                deleteMessage(chatId, messageId);
                sendChatInput("/q");
            } else if (message.startsWith('show_otygrovka_options_')) {
                showOtygrovkaMenu(chatId, messageId);
            } else if (message.startsWith('otygrovka_on_')) {
                // Включаем авто-режим отыгровки — /c 60 считывает начальное время,
                // затем трекинг сам считает in-game секунды и выходит в :59:20
                globalState.otygrovkaAuto = true;    // Авто-цикл активен
                globalState.otygrovkaMode = true;    // Ждём диалог /c 60
                window._awaitC60Dialog    = true;
                window._awaitAnimInteraction = true;
                sendChatInput("/c 60");
                sendChatInput("/anim 1 1");
                debugLog('[OTYGROVKA] Авто-цикл ВКЛ. /c 60 + /anim 1 1 отправлены — ждём диалог «Точное время»');
                showOtygrovkaMenu(chatId, messageId);
            } else if (message.startsWith('otygrovka_off_')) {
                // Полностью останавливаем авто-цикл
                globalState.otygrovkaAuto = false;
                globalState.otygrovkaMode = false;
                window._awaitC60Dialog    = false;
                stopOtygrovkaTracking();
                // Восстанавливаем автовход если отыгровка его отключила
                autoLoginConfig.enabled = true;
                sendToTelegram(`⏹️ <b>Отыгровка остановлена (${displayName})</b>\n🟢 Автовход восстановлен`, false, null);
                showOtygrovkaMenu(chatId, messageId);
            } else if (message.startsWith('local_account_info_')) {
                // Одно объединённое сообщение — тот же формат что и в welcome-сообщении
                try {
                    const infoBlock = buildWelcomeAccountInfo();
                    sendToTelegram(
                        `📊 <b>Информация об аккаунте (${displayName})</b>${infoBlock}`,
                        false, null
                    );
                } catch (err) {
                    sendToTelegram(`❌ <b>Ошибка получения инфо (${displayName}):</b>\n<code>${err.message}</code>`, false, null);
                }
            } else if (message.startsWith('global_reload_script_')) {
                // Кнопка "Перезагрузить скрипт" — текущий аккаунт + broadcast остальным
                reloadAllAccounts();
            } else if (message.startsWith('send_rec_cmd_')) {
                // Кнопка "Отправить /rec 5" из уведомления rate-limit / disconnect
                callbackUniqueId = message.replace('send_rec_cmd_', '');
                if (callbackUniqueId === uniqueId) {
                    deleteMessage(chatId, messageId);
                    sendChatInput('/rec 5');
                    debugLog('[RateLimit] Отправлен /rec 5 по кнопке из Telegram');
                }
            }
            // answerCallbackQuery уже вызван в самом начале блока callback_query
        }
    }
}
// END TELEGRAM COMMANDS MODULE //

// ╔══════════════════════════════════════════════════════════╗
// ║  MODULE: USER REGISTRATION                               ║
// ║  Описание: Регистрация пользователя при подключении      ║
// ║  Зависимости: config, displayName, debugLog,             ║
// ║               sendToTelegram                             ║
// ╚══════════════════════════════════════════════════════════╝
// START USER REGISTRATION MODULE //
function registerUser() {
    if (!config.accountInfo.nickname) {
        debugLog('Ник не определен, регистрация отложена');
        return;
    }
    config.activeUsers[config.accountInfo.nickname] = config.accountInfo.nickname;
    debugLog(`Пользователь ${displayName} зарегистрирован локально`);
}
// END USER REGISTRATION MODULE //

// ╔══════════════════════════════════════════════════════════╗
// ║  MODULE: MESSAGE PROCESSING                              ║
// ║  Описание: Обработка системных сообщений чата            ║
// ║             (PayDay, зарплата, кик, варн и др.)          ║
// ║  Зависимости: config, globalState, displayName,          ║
// ║               debugLog, sendToTelegram, createButton,    ║
// ║               getNotificationReplyMarkup,                ║
// ║               sendAdminSpamAlert, stopAFKCycle           ║
// ╚══════════════════════════════════════════════════════════╝
// START MESSAGE PROCESSING MODULE //
function isNonRPMessage(message) {
    return message.includes('((') && message.includes('))');
}
// Фильтр системных сообщений рации (Приказ от, Часовой и т.д.) — не отправлять в Telegram
const SYSTEM_RADIO_PATTERNS = [
    /^\[R\]\s+Приказ от\s/i,
    /^\[R\]\s+Часовой\s*:/i,
];
function isSystemRadioMessage(message) {
    return SYSTEM_RADIO_PATTERNS.some(pattern => pattern.test(message));
}
// Проверяет, является ли радиосообщение "важным":
// строй/сбор, местоположение, или упоминание ID игрока из HUD
function isImportantRadioMessage(msg) {
    const lower = msg.toLowerCase();

    // Ключевые слова строя/сбора
    const stroiKeywords = ['строй', 'сбор', 'готовность', 'конф'];
    // Ключевые слова местоположения
    const locationKeywords = ['местоположение', 'место', 'позиция', 'координаты', 'локация'];

    if (stroiKeywords.some(kw => lower.includes(kw))) return true;
    if (locationKeywords.some(kw => lower.includes(kw))) return true;

    // Проверка по ID из HUD — если ещё не получен, пропускаем эту проверку
    if (config.lastPlayerId) {
        const idPlain  = config.lastPlayerId.toString().replace(/-/g, ''); // напр. '232'
        const idDashed = idPlain.split('').join('-');                       // напр. '2-3-2'
        if (msg.includes(idPlain) || msg.includes(idDashed)) return true;
    }

    return false;
}
function getRankKeywords() {
    if (!config.currentFaction || !factions[config.currentFaction]) return [];
    return Object.values(factions[config.currentFaction].ranks).map(rank => rank.toLowerCase());
}
function getHighRankKeywords() {
    if (!config.currentFaction || !factions[config.currentFaction]) return [];
    const faction = factions[config.currentFaction];
    const threshold = faction.highRankThreshold !== undefined ? faction.highRankThreshold : 6;
    return Object.entries(faction.ranks)
        .filter(([rankNum]) => parseInt(rankNum) >= threshold)
        .map(([, rank]) => rank.toLowerCase());
}
// Возвращает все звания высокого ранга из ВСЕХ фракций (для проверки рации)
// Порог берётся из highRankThreshold фракции (по умолчанию 6)
function getAllHighRankKeywords() {
    const highRanks = [];
    for (const faction in factions) {
        const f = factions[faction];
        const threshold = f.highRankThreshold !== undefined ? f.highRankThreshold : 6;
        const ranks = f.ranks;
        for (const rankNum in ranks) {
            if (parseInt(rankNum) >= threshold) {
                highRanks.push(ranks[rankNum].toLowerCase());
            }
        }
    }
    return highRanks;
}
// Проверяет, отправлено ли радиосообщение игроком с 6-10 рангом (любой фракции)
// Формат: [R] <Звание> <Ник>[ID]: текст  или  [R] <Звание> [{цвет}Фракция{цвет}] <Ник>[ID]: текст
function isHighRankRadioMessage(msg) {
    const radioMatch = msg.match(/^\[R\]\s+(.+)/i);
    if (!radioMatch) return false;
    const afterR = radioMatch[1].toLowerCase();
    const highRanks = getAllHighRankKeywords();
    // Сортируем по убыванию длины, чтобы "заместитель глав врача" проверялось раньше "заместитель"
    highRanks.sort((a, b) => b.length - a.length);
    return highRanks.some(rank => {
        // После звания должен идти пробел или двоеточие (не вхождение внутри слова)
        return afterR.startsWith(rank + ' ') || afterR.startsWith(rank + ':');
    });
}
function checkRoleAndActionConditions(lowerCaseMessage) {
    const rankKeywords = getRankKeywords();
    const hasRoleKeyword = rankKeywords.some(keyword => lowerCaseMessage.includes(keyword));
    const hasActionKeyword = (
        lowerCaseMessage.indexOf("место") !== -1 ||
        lowerCaseMessage.indexOf("ваше") !== -1 ||
        lowerCaseMessage.indexOf("жетон") !== -1
    );
    return hasRoleKeyword && hasActionKeyword;
}
function checkAFKConditions(msg, lowerCaseMessage) {
    if (!config.afkSettings.active) return false;
    const hasConditions = checkRoleAndActionConditions(lowerCaseMessage);
    const hasID = config.afkSettings.formats.some(format => msg.includes(format));
    return hasConditions && hasID;
}
function checkLocationRequest(msg, lowerCaseMessage, chatRadius) {
    if (!config.trackLocationRequests && !isTargetingPlayer(msg)) {
        return false;
    }
    const rankKeywords = getRankKeywords();
    const hasRoleKeyword = rankKeywords.some(keyword => lowerCaseMessage.includes(keyword));
    const hasActionKeyword = config.locationKeywords.some(word => lowerCaseMessage.includes(word.toLowerCase()));
    const isValid = hasRoleKeyword && hasActionKeyword;
   
    // Добавляем фильтр по радиусу чата (игнорируем UNKNOWN или SELF)
    const validRadius = (chatRadius === CHAT_RADIUS.RADIO || chatRadius === CHAT_RADIUS.CLOSE);
   
    return isValid && validRadius;
}
function isTargetingPlayer(msg) {
    if (!config.lastPlayerId) return false;
    const idFormats = [
        config.lastPlayerId,
        config.lastPlayerId.split('').join('-')
    ];
    // Проверяем наличие в контексте, например "[ID]" или "ID"
    return idFormats.some(format => msg.match(new RegExp(`\\[${format}\\]|\\b${format}\\b`)));
}
function processSalaryAndBalance(msg) {
    if (!config.paydayNotifications) {
        debugLog('PayDay пропущен: уведомления выкл');
        return;
    }
    
    // Проверка на новые тексты (отрицательные сценарии)
    if (msg.includes("Для получения зарплаты необходимо находиться в игре минимум 25 минут")) {
        debugLog(`Обнаружено предупреждение о 25 минутах`);
        const message = `- PayDay | ${displayName}:\nДля получения зарплаты необходимо находиться в игре минимум 25 минут`;
        sendToTelegram(message);
        config.lastSalaryInfo = null;
        return;
    }
    
    if (msg.includes("Вы не должны находиться на паузе для получения зарплаты")) {
        debugLog(`Обнаружено предупреждение о паузе`);
        const message = `- PayDay | ${displayName}:\nВы не должны находиться на паузе для получения зарплаты`;
        sendToTelegram(message);
        config.lastSalaryInfo = null;
        return;
    }
    
    if (msg.includes("Для получения опыта необходимо находиться в игре минимум 10 минут")) {
        debugLog(`Обнаружено предупреждение о 10 минутах для опыта`);
        const message = `- PayDay | ${displayName}:\nДля получения опыта необходимо находиться в игре минимум 10 минут`;
        sendToTelegram(message);
        config.lastSalaryInfo = null;
        return;
    }
    
    // Regex для зарплаты с учетом цветовых кодов
    // Ищем: Зарплата: {цвет}число руб
    const salaryMatch = msg.match(/Зарплата:\s*\{[A-Fa-f0-9]{6}\}([\d.]+)\s*руб/);
    if (salaryMatch) {
        const salary = salaryMatch[1]; // Оставляем как есть с точками
        debugLog(`Зарплата спарсена: ${salary}`);
        config.lastSalaryInfo = config.lastSalaryInfo || {};
        config.lastSalaryInfo.salary = salary;
        debugLog(`Обнаружена зарплата: ${salary} руб`);
        // Для подсчета totalSalary убираем точки
        config.afkCycle.totalSalary += parseInt(salary.replace(/\./g, ''));
        updateAFKStatus();
    }
    
    // Regex для баланса с учетом цветовых кодов
    // Ищем: Текущий баланс счета: {цвет}число руб
    const balanceMatch = msg.match(/Текущий баланс счета:\s*\{[A-Fa-f0-9]{6}\}([\d.]+)\s*руб/);
    if (balanceMatch) {
        const balance = balanceMatch[1]; // Оставляем как есть с точками
        debugLog(`Баланс спарсен: ${balance}`);
        config.lastSalaryInfo = config.lastSalaryInfo || {};
        config.lastSalaryInfo.balance = balance;
        debugLog(`Обнаружен баланс счета: ${balance} руб`);
    }
    
    if (config.lastSalaryInfo && config.lastSalaryInfo.salary && config.lastSalaryInfo.balance) {
        let message = `+ PayDay | ${displayName}:\nЗарплата: ${config.lastSalaryInfo.salary} руб\nБаланс счета: ${config.lastSalaryInfo.balance} руб`;
        
        if (config.afkCycle.active) {
            message += getAFKStatusText();
            config.afkCycle.statusMessageIds.forEach(({ chatId, messageId }) => {
                deleteMessage(chatId, messageId);
            });
            config.afkCycle.statusMessageIds = [];
            
            globalState.lastPaydayMessageIds.forEach(({ chatId, messageId }) => {
                deleteMessage(chatId, messageId);
            });
            globalState.lastPaydayMessageIds = [];
        }
        
        sendToTelegram(message);
        config.lastSalaryInfo = null;

        // Если ждём PayDay после строя — выходим из игры НЕМЕДЛЕННО
        if (waitingForPayDay) {
            debugLog('PayDay получен во время ожидания после строя — выходим немедленно');
            exitAfterStroiPayDay('processSalaryAndBalance');
        }

        // Если отыгровка в авто-режиме — сбрасываем счётчик и ждём нового спавна
        if (globalState.otygrovkaAuto) {
            debugLog('[OTYGROVKA] PayDay получен — сбрасываем цикл, ждём спавна для нового трекинга');
            otygrovkaResetAfterPayday();
        }
    }
}
function checkGovMessageConditions(msg, senderName, senderId) {
    if (!config.govMessagesEnabled) return false;
    const lowerMsg = msg.toLowerCase();
    const hasKeyword = config.govMessageKeywords.some(keyword =>
        lowerMsg.includes(keyword.toLowerCase())
    );
    const trackerKey = `${senderName}_${senderId}`;
    const now = Date.now();
    let tracker = config.govMessageTrackers[trackerKey];
    if (!tracker) {
        tracker = {
            count: 1,
            lastMessageTime: now,
            cooldownEnd: 0
        };
        config.govMessageTrackers[trackerKey] = tracker;
        return true;
    }
    if (hasKeyword && tracker.cooldownEnd > 0) {
        debugLog(`Ключевое слово найдено — снимаем блокировку для ${senderName}`);
        tracker.cooldownEnd = 0;
        tracker.count = 1;
        return true;
    }
    if (now < tracker.cooldownEnd) {
        return false;
    }
    if (now - tracker.lastMessageTime > config.govMessageCooldown) {
        tracker.count = 1;
        tracker.lastMessageTime = now;
        return true;
    }
    tracker.count++;
    tracker.lastMessageTime = now;
    if (tracker.count > config.govMessageThreshold) {
        tracker.cooldownEnd = now + config.govMessageCooldown;
        debugLog(`Блокируем уведомления от ${senderName} на 6 минут`);
        return false;
    }
    return true;
}
// END MESSAGE PROCESSING MODULE //

// ╔══════════════════════════════════════════════════════════╗
// ║  MODULE: CHAT MONITOR                                    ║
// ║  Описание: Перехват чата игры, маршрутизация сообщений.  ║
// ║             Включает:                                    ║
// ║               • Smart Stroi System (строй-реконнект)     ║
// ║               • Prison Module (режим тюрьмы, скин 50)   ║
// ║  Зависимости: config, globalState, factions,             ║
// ║               displayName, uniqueId, CHAT_RADIUS,        ║
// ║               debugLog, sendToTelegram, createButton,    ║
// ║               getNotificationReplyMarkup,                ║
// ║               sendAdminSpamAlert, processMessage,        ║
// ║               normalizeToCyrillic, sendChatInput,        ║
// ║               autoLoginConfig, OnChatAddMessage (hook)   ║
// ╚══════════════════════════════════════════════════════════╝
// START CHAT MONITOR MODULE //
// ==================== SMART STROI SYSTEM ====================

// Флаг для отслеживания ожидания PayDay
let waitingForPayDay = false;
let stroiReconnectTimer = null;
let payDayResetTimer = null;
let stroiKeepAliveTimer = null;  // Таймер для повторных /rec 5 пока ждём на авторизации
let stroiAutoLoginTimer = null;  // Таймер для включения автовхода перед PayDay

// Функция для получения текущих минут
function getCurrentMinutes() {
    return new Date().getMinutes();
}

// Функция для проверки, скоро ли PayDay (в пределах 7 минут до :00)
function isPayDayApproaching() {
    const currentMinutes = getCurrentMinutes();
    // PayDay только с 53 по 59 минуту включительно
    // НЕ в 0-6 минут нового часа
    return currentMinutes >= 53 && currentMinutes <= 59;
}

// Функция для сброса флага PayDay
function resetPayDayFlag() {
    waitingForPayDay = false;
    if (payDayResetTimer) { clearTimeout(payDayResetTimer); payDayResetTimer = null; }
    if (stroiKeepAliveTimer) { clearTimeout(stroiKeepAliveTimer); stroiKeepAliveTimer = null; }
    if (stroiAutoLoginTimer) { clearTimeout(stroiAutoLoginTimer); stroiAutoLoginTimer = null; }
    if (stroiReconnectTimer) { clearTimeout(stroiReconnectTimer); stroiReconnectTimer = null; }
    debugLog('Флаг ожидания PayDay сброшен');
}

// Функция для получения времени до следующего PayDay в миллисекундах
function getTimeUntilPayDay() {
    const now = new Date();
    const currentMinutes = now.getMinutes();
    const currentSeconds = now.getSeconds();
    
    let minutesUntilPayDay;
    if (currentMinutes === 0) {
        minutesUntilPayDay = 0;
    } else {
        minutesUntilPayDay = 60 - currentMinutes;
    }
    
    const secondsUntilPayDay = minutesUntilPayDay * 60 - currentSeconds;
    return secondsUntilPayDay * 1000;
}

// Улучшенная функция реконнекта при строе
function performStroiReconnect(msg) {
    const now = new Date();
    const currentMinutes = now.getMinutes();
    const currentSeconds = now.getSeconds();
    const msgHtml = msg ? `\n<code>${msg.replace(/</g, '&lt;')}</code>` : '';

    // Если уже ждём PayDay - игнорируем повторные сообщения о строе
    if (waitingForPayDay) {
        debugLog(`Игнорируем повторное сообщение о строе - уже ждём PayDay`);
        sendToTelegram(
            `🔕 <b>Повторный строй проигнорирован (${displayName})</b>\n` +
            `💰 Уже ждём PayDay, реконнект запланирован`,
            true, null
        );
        return;
    }

    if (isPayDayApproaching()) {
        const timeToPayDay = getTimeUntilPayDay();
        const minutesLeft = Math.ceil(timeToPayDay / 60000);

        waitingForPayDay = true;

        payDayResetTimer = setTimeout(() => {
            resetPayDayFlag();
            debugLog('Автоматический сброс флага PayDay по таймауту');
        }, timeToPayDay + 2 * 60 * 1000);

        // ШАГ 1: Немедленно отключаемся
        autoLoginConfig.enabled = false;
        sendChatInput("/rec 5");

        sendToTelegram(
            `📢 <b>Строй обнаружен (${displayName})</b>\n` +
            `⏰ До PayDay: ${minutesLeft} мин — ждём на авторизации\n` +
            `🔑 Переподключимся за 60 сек до PayDay` +
            msgHtml,
            false, null
        );

        // ШАГ 2: За 60 секунд до PayDay — включаем автовход и /rec 5
        const timeToReconnect = Math.max(1000, timeToPayDay - 60 * 1000);

        stroiAutoLoginTimer = setTimeout(() => {
            autoLoginConfig.enabled = true;
            sendChatInput("/rec 5");
            sendToTelegram(
                `🔄 <b>Включён автовход и отправлен /rec 5 (${displayName})</b>\n` +
                `💰 PayDay через ~60 сек — входим в игру`,
                false, null
            );
        }, timeToReconnect);

    } else {
        // До PayDay далеко — стандартный реконнект
        const actionText = config.autoReconnectEnabled
            ? `🔄 /rec 5 отправлен — вернёмся через 5 мин`
            : `🚪 /q отправлен`;

        sendToTelegram(
            `📢 <b>Строй обнаружен (${displayName})</b>\n` +
            `🕐 До PayDay: ${60 - currentMinutes} мин\n` +
            `${actionText}` +
            msgHtml,
            false, null
        );

        setTimeout(() => {
            performReconnect(5 * 60 * 1000, true); // silent — сообщение уже отправлено выше
        }, 30);
    }
}

// Выход из игры сразу после получения PayDay при строе
function exitAfterStroiPayDay(source) {
    if (!waitingForPayDay) return; // Уже обработано
    debugLog(`exitAfterStroiPayDay вызван из: ${source}`);

    // Останавливаем все таймеры ожидания
    if (stroiReconnectTimer) { clearTimeout(stroiReconnectTimer); stroiReconnectTimer = null; }
    if (stroiKeepAliveTimer) { clearTimeout(stroiKeepAliveTimer); stroiKeepAliveTimer = null; }
    if (stroiAutoLoginTimer) { clearTimeout(stroiAutoLoginTimer); stroiAutoLoginTimer = null; }

    // Немедленно выходим из игры
    autoLoginConfig.enabled = false;
    sendChatInput("/rec 5");

    const exitMinutes = getCurrentMinutes();
    const exitSecs = new Date().getSeconds();
    sendToTelegram(
        `💰 <b>PayDay получен — выходим СРАЗУ! (${displayName})</b>\n` +
        `🕐 Время выхода: ${exitMinutes} мин ${exitSecs} сек\n` +
        `🔄 Отключён автовход и отправлен /rec 5\n` +
        `⏰ Вернёмся через 2 минуты`,
        false, null
    );

    // Через 2 минуты включаем автовход и возвращаемся
    setTimeout(() => {
        autoLoginConfig.enabled = true;
        sendChatInput("/rec 5");

        resetPayDayFlag(); // Сбрасываем флаг ожидания

        sendToTelegram(
            `🔄 <b>Возвращаемся после строя (${displayName})</b>\n` +
            `✅ Включён автовход и отправлен /rec 5\n` +
            `📢 Готовы к новым строям`,
            false, null
        );
    }, 2 * 60 * 1000);
}


// ==================== END SMART STROI SYSTEM ====================
// ==================== PRISON MODULE ====================

// Одиночный запрос /time через рандомную задержку 10–40 сек
function schedulePrisonTimeCheck() {
    const delay = Math.floor(Math.random() * (40000 - 10000 + 1)) + 10000;
    debugLog(`[PRISON] Разовый запрос /time через ${Math.round(delay / 1000)} сек`);
    setTimeout(() => {
        if (globalState.inPrison) {
            sendChatInput("/time");
            debugLog(`[PRISON] Команда /time отправлена`);
        }
    }, delay);
}

// Периодический опрос /time каждые ~30 мин с рандомным смещением ±1–2 мин
function startPrisonTimePolling() {
    stopPrisonTimePolling(); // Сбрасываем предыдущий таймер если был
    function scheduleNext() {
        const baseInterval = 30 * 60 * 1000;                          // 30 минут
        const minOffset    = 60 * 1000;                                // 1 мин
        const maxOffset    = 2 * 60 * 1000;                           // 2 мин
        const offset       = Math.floor(Math.random() * (maxOffset - minOffset + 1)) + minOffset;
        const sign         = Math.random() < 0.5 ? 1 : -1;
        const interval     = baseInterval + sign * offset;
        debugLog(`[PRISON] Следующий /time через ${Math.round(interval / 60000)} мин`);
        globalState.prisonTimeTimer = setTimeout(() => {
            if (globalState.inPrison) {
                sendChatInput("/time");
                debugLog(`[PRISON] Периодический /time отправлен`);
                scheduleNext();
            }
        }, interval);
    }
    scheduleNext();
}

// Остановка периодического опроса
function stopPrisonTimePolling() {
    if (globalState.prisonTimeTimer) {
        clearTimeout(globalState.prisonTimeTimer);
        globalState.prisonTimeTimer = null;
        debugLog(`[PRISON] Периодический опрос /time остановлен`);
    }
}

// Запускается при обнаружении скина 50 (заключённый) — при входе или смене скина
function startPrisonMode() {
    if (globalState.inPrison) return; // Уже в режиме тюрьмы
    globalState.inPrison = true;
    globalState.prisonTimeRequested = false;
    debugLog(`[PRISON] Обнаружен скин заключённого (50). Запускаем режим тюрьмы для ${displayName}`);
    sendToTelegram(`🔒 <b>Находимся в тюрьме (${displayName})</b>\nЗапрашиваем оставшееся время...`, true, null);
    // Первый разовый запрос /time через 10–40 сек
    schedulePrisonTimeCheck();
    // Периодические запросы /time каждые ~30 мин
    startPrisonTimePolling();
}
// ==================== END PRISON MODULE ====================
function initializeChatMonitor() {
    if (typeof sendChatInput === 'undefined') {
        const errorMsg = '❌ <b>Ошибка</b>\nsendChatInput не найден';
        debugLog(errorMsg);
        sendToTelegram(errorMsg, false, null);
        return false;
    }
    if (typeof window.playSound === 'undefined') {
        debugLog('Функция playSound не найдена, создаем свою');
        window.playSound = function(url, loop, volume) {
            const audio = new Audio(url);
            audio.loop = loop || false;
            audio.volume = volume || 1.0;
            audio.play().catch(e => debugLog('Ошибка воспроизведения звука:', e));
        };
    };
    window.OnChatAddMessage = function(e, i, t) {
        debugLog(`Чат-сообщение: ${e.replace(/\{[0-9A-Fa-f]{6}\}/g, '')} | Цвет: ${normalizeColor(i).replace('0x', '')} | Тип: ${t} | Пауза: ${window.getInterfaceStatus("PauseMenu")}`);
        const msg = String(e);
        const normalizedMsg = normalizeToCyrillic(msg);
        const lowerCaseMessage = normalizedMsg.toLowerCase();
        const currentTime = Date.now();
        const chatRadius = getChatRadius(i);
        // Для отладки, выводим сообщения в чат
        console.log(msg.replace(/\{[0-9A-Fa-f]{6}\}/g, '')); // сооб в чат (без цветовых кодов)
        // Проверка сообщения "Текущее время:" для AFK
        if (msg.includes("Текущее время:") && config.afkSettings.active) {
            handlePayDayTimeMessage();
        }

        // Проверка сообщения о возобновлении работы сервера для AFK
        if (config.afkSettings.active && config.afkCycle.active && msg.includes("Сервер возобновит работу в течение минуты...")) {
            debugLog('Обнаружено сообщение о возобновлении работы сервера!');
            if (config.afkCycle.reconnectEnabled) {
                let restartMessage = `⚡ <b>Автоматически отправлено действие по рестарту (${displayName})</b>\nПо условию AFK ночь: Сервер возобновит работу`;
                if (config.afkCycle.restartAction === 'rec') {
                    autoLoginConfig.enabled = false;
                    sendChatInput("/rec 5");
                    restartMessage = `🔄 <b>Отключен автовход и отправлен /rec 5 (${displayName})</b>\nПо условию AFK ночь: Сервер возобновит работу`;
                    setTimeout(() => {
                        autoLoginConfig.enabled = true;
                        sendChatInput("/rec 5");
                        sendToTelegram(`🔄 <b>Включен автовход и отправлен /rec 5 (${displayName})</b>`);
                    }, 5 * 60 * 1000);
                } else {
                    sendChatInput("/q");
                    restartMessage = `⚡ <b>Автоматически отправлено /q (${displayName})</b>\nПо условию AFK ночь: Сервер возобновит работу`;
                }
                if (config.afkCycle.active) {
                    restartMessage += getAFKStatusText();
                    // Удаляем оригинальные статус-сообщения AFK
                    config.afkCycle.statusMessageIds.forEach(({ chatId, messageId }) => {
                        deleteMessage(chatId, messageId);
                    });
                    config.afkCycle.statusMessageIds = [];
                }
                sendToTelegram(restartMessage, false, null);
            } else {
                sendChatInput("/q");
                let restartMessage = `⚡ <b>Автоматически отправлено /q (${displayName})</b>\nПо условию AFK ночь: Сервер возобновит работу`;
                if (config.afkCycle.active) {
                    restartMessage += getAFKStatusText();
                    // Удаляем оригинальные статус-сообщения AFK
                    config.afkCycle.statusMessageIds.forEach(({ chatId, messageId }) => {
                        deleteMessage(chatId, messageId);
                    });
                    config.afkCycle.statusMessageIds = [];
                }
                sendToTelegram(restartMessage, false, null);
            }
        }
        if (lowerCaseMessage.includes("зареспавнил вас")) {
            debugLog(`Обнаружен респавн для ${displayName}!`);
            const replyMarkup = getNotificationReplyMarkup();
            sendToTelegram(`🔄 <b>Вас зареспавнили!! (${displayName})</b>\n<code>${msg.replace(/</g, '&lt;')}</code>`, false, replyMarkup);
            window.playSound("https://raw.githubusercontent.com/ZaharQqqq/Sound/main/uved.mp3", false, 1.0);
        }
        if (lowerCaseMessage.includes("вы были кикнуты по подозрению в читерстве")) {
            debugLog(`Обнаружен кик анти-читом для ${displayName}!`);
            const replyMarkup = getNotificationReplyMarkup();
            sendToTelegram(`🚫 <b>Вас кикнул анти-чит! (${displayName})</b>\n<code>${msg.replace(/</g, '&lt;')}</code>`, false, replyMarkup);
            window.playSound("https://raw.githubusercontent.com/ZaharQqqq/Sound/main/kick.mp3", false, 1.0);
            setTimeout(() => {
                performReconnect(1 * 60 * 1000);
            }, 30);
        }
        // Обработка посадки в тюрьму администратором
        const prisonRegex = /Администратор (.+) посадил в тюрьму игрока (.+) на (\d+) мин\. Причина: (.+)/;
        const prisonMatch = msg.match(prisonRegex);
        if (prisonMatch && prisonMatch[2] === config.accountInfo.nickname) {
            const adminName = prisonMatch[1];
            const prisonMinutes = parseInt(prisonMatch[3]);
            const reason = prisonMatch[4];
            debugLog(`Обнаружена посадка в тюрьму для ${displayName} на ${prisonMinutes} мин!`);
            const replyMarkup = getNotificationReplyMarkup();
            sendToTelegram(`🚨 <b>Посадили в тюрьму! (${displayName})</b>\nАдмин: ${adminName}\nВремя: ${prisonMinutes} мин\nПричина: ${reason}\n<code>${msg.replace(/</g, '&lt;')}</code>`, false, replyMarkup);
            window.playSound("https://raw.githubusercontent.com/ZaharQqqq/Sound/main/kick.mp3", false, 1.0);
            globalState.isPrison = true; // Флаг для игнора /rec при кике
            setTimeout(() => { globalState.isPrison = false; }, 10000); // Сбрасываем через 10 сек
            // Запускаем режим тюрьмы — первый /time + периодический поллинг каждые ~30 мин
            startPrisonMode();
            // Реконнект /rec через 2 минуты — беспалевно, автовход включён, продолжаем отсидку
            debugLog(`[PRISON] Планируем реконнект /rec через 2 минуты`);
            setTimeout(() => {
                if (globalState.inPrison) {
                    autoLoginConfig.enabled = true;
                    sendChatInput("/rec 5");
                    sendToTelegram(`🔄 <b>Реконнект в тюрьме (${displayName})</b>\nОтправлен /rec — продолжаем отсидку`, true, null);
                    debugLog(`[PRISON] /rec 5 отправлен для беспалевного реконнекта`);
                }
            }, 2 * 60 * 1000); // 2 минуты
        }
        // Обработка ответа на /time — время до выхода из тюрьмы (цвет 66CC00)
        const normalizedMsgColor = normalizeColor(i);
        if (normalizedMsgColor === '0x66CC00' && msg.includes("Время до выхода на свободу:")) {
            const timeMatch = msg.match(/Время до выхода на свободу:\s*(\d+:\d+)/);
            if (timeMatch && globalState.inPrison) {
                const remainingTime = timeMatch[1];
                debugLog(`[PRISON] Время до выхода: ${remainingTime}`);
                sendToTelegram(`⏰ <b>Время до выхода из тюрьмы (${displayName}):</b>\n🔒 Осталось: ${remainingTime}`, false, null);
            }
        }
        // Обработка освобождения из тюрьмы (цвет FFFF00)
        if (normalizedMsgColor === '0xFFFF00' && msg.includes("Вы отбыли свой срок и можете идти на свободу")) {
            debugLog(`[PRISON] Срок отсижен!`);
            stopPrisonTimePolling();
            globalState.inPrison = false;
            globalState.prisonTimeRequested = false;

            if (RECONNECT_ENABLED_DEFAULT) {
                // Отключаем автовход, делаем /rec 5, ждём команды из Telegram
                autoLoginConfig.enabled = false;
                debugLog(`[PRISON] Автовход отключён. Отправляем /rec 5 и ждём выбора из Telegram`);
                const prisonExitButtons = {
                    inline_keyboard: [[
                        createButton('🔓 Выйти с автр.', `prison_reconnect_${uniqueId}`),
                        createButton('🚪 Выйти с игры', `prison_quit_${uniqueId}`)
                    ]]
                };
                sendToTelegram(
                    `✅ <b>Срок отсижен! (${displayName})</b>\n` +
                    `⏸ Автовход отключён — висим на авторизации.\n` +
                    `Выберите действие:`,
                    false, prisonExitButtons
                );
                sendChatInput("/rec 5");
            } else {
                sendToTelegram(`✅ <b>Срок отсижен! Выходим из игры (${displayName})</b>`, false, null);
                sendChatInput("/q");
            }
        }
		// МЗ отладочный блок удалён
        let factionColor = 'CCFF00'; // По умолчанию
        if (config.currentFaction && factions[config.currentFaction] && factions[config.currentFaction].color) {
            factionColor = factions[config.currentFaction].color;
        }
        const govMessageRegex = new RegExp(`^\\- (.+?) \\{${factionColor}\\}\\(\\{v:([^}]+)}\\)\\[(\\d+)\\]`);
        const govMatch = msg.match(govMessageRegex);
        if (govMatch) {
            const messageText = govMatch[1]; // Текст сообщения
            const senderName = govMatch[2]; // Имя отправителя
            const senderId = govMatch[3]; // ID отправителя
            // Проверяем, что сообщение отправлено из радиуса CLOSE
            if (chatRadius === CHAT_RADIUS.CLOSE) {
                if (checkGovMessageConditions(messageText, senderName, senderId)) {
                    const replyMarkup = getNotificationReplyMarkup();
                    const factionLabel = getFactionLabel(config.currentFaction) || 'фракции';
                    sendToTelegram(`🏛️ <b>${messageText}</b>\n👤 ${senderName} [ID: ${senderId}]\nСообщение от сотрудника [${factionLabel}] (${displayName})`, false, replyMarkup);
                }
            }
        }
        processSalaryAndBalance(msg);
        if (config.keywords.some(kw => lowerCaseMessage.includes(kw.toLowerCase()))) {
            debugLog('Найдено ключевое слово:', msg);
            sendToTelegram(`🔔 <b>Обнаружено ключевое слово (${displayName}):</b>\n<code>${msg.replace(/</g, '&lt;')}</code>`);
            setTimeout(() => {
                try {
                    sendChatInput("/c");
                    debugLog('Команда /c отправлена');
                } catch (err) {
                    const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось отправить /c\n<code>${err.message}</code>`; // FIX: были одинарные кавычки — переменные не подставлялись
                    debugLog(errorMsg);
                    sendToTelegram(errorMsg, false, null);
                }
            }, config.clearDelay);
        }
        // FF9945 — только личное сообщение от администратора (Администратор X[ID] для МойНик[МойАйди]:)
        const myNick = config.accountInfo.nickname;
        const isAdminPrivateMsg = normalizeColor(i) === '0xFF9945' &&
            myNick &&
            new RegExp('администратор\\s+\\S+\\[\\d+\\]\\s+для\\s+' + myNick.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\[', 'i').test(msg);
        // [A] в рации — тихое уведомление без звука и спама
        const isAdminRadioMsg = msg.includes("[A]") && msg.includes("((") && chatRadius === CHAT_RADIUS.RADIO;
        if (isAdminRadioMsg) {
            debugLog('Обнаружен [A] в рации — тихое уведомление');
            sendToTelegram(`📻 <b>Администратор в рации [A] (${displayName})</b>\n<code>${msg.replace(/</g, '&lt;')}</code>`, true, null);
        } else if (isAdminPrivateMsg ||
            (msg.includes("[A]") && msg.includes("((")) ||
            /\{FF4444\}\[Уведомление от администратора\] \{FFFFFF\}Администратор .+\[\d+\]:/.test(msg) ||
            (lowerCaseMessage.includes("подбросил") &&
            (currentTime - config.lastPodbrosTime > config.podbrosCooldown || config.podbrosCounter < 2))) {
            // Игнорируем сообщения от департамента [D] с розовым цветом {FF8877}
            const isDepartmentMessage = msg.includes('[D]') && msg.includes('{FF8877}');
            if (isDepartmentMessage) {
                debugLog('Сообщение от департамента [D] — игнорируем');
            } else if (lowerCaseMessage.includes("подбросил")) {
                config.podbrosCounter++;
                if (config.podbrosCounter <= 2) {
                    debugLog('Обнаружен подброс!');
                    const replyMarkup = getNotificationReplyMarkup();
                    sendToTelegram(`🚨 <b>Обнаружен подброс! (${displayName})</b>\n<code>${msg.replace(/</g, '&lt;')}</code>`, false, replyMarkup);
                    window.playSound("https://raw.githubusercontent.com/ZaharQqqq/Sound/main/uved.mp3", false, 1.0);
                }
                if (currentTime - config.lastPodbrosTime > config.podbrosCooldown) {
                    config.podbrosCounter = 0;
                }
                config.lastPodbrosTime = currentTime;
            } else {
                debugLog('Обнаружен администратор!');
                const replyMarkup = getNotificationReplyMarkup();
                sendToTelegram(`🚨 <b>Обнаружен администратор! (${displayName})</b>\n<code>${msg.replace(/</g, '&lt;')}</code>`, false, replyMarkup);
                window.playSound("https://raw.githubusercontent.com/ZaharQqqq/Sound/main/uved.mp3", false, 1.0);
                // 9 пингов каждые 2 сек — каждый удаляет предыдущий, последний остаётся
                sendAdminSpamAlert(msg);
                addSessionLog(`🚨 Обнаружен администратор`);
            }
        }
        // ── Строй / сбор ───────────────────────────────────────────
        let radioHandled = false;
		if (!isNonRPMessage(msg) && getHighRankKeywords().some(kw => lowerCaseMessage.includes(kw)) &&
			(lowerCaseMessage.indexOf("строй") !== -1 ||
			lowerCaseMessage.indexOf("сбор") !== -1 ||
			lowerCaseMessage.indexOf("готовность") !== -1 ||
			lowerCaseMessage.indexOf("конф") !== -1)
			&& (chatRadius === CHAT_RADIUS.RADIO)) {
			
			const nicknameMatch = msg.match(/\]\s+([A-Za-z]+_[A-Za-z]+)\[/);
			const senderNickname = nicknameMatch ? nicknameMatch[1] : null;
			const isIgnoredSender = senderNickname && config.ignoredStroiNicknames.includes(senderNickname);
			
			if (isIgnoredSender) {
				debugLog(`Сообщение от игнорируемого ника: ${senderNickname} - пропускаем`);
				sendToTelegram(`🔕 <b>Строй от игнорируемого ника (${displayName})</b>\n👤 ${senderNickname}\n<code>${msg.replace(/</g, '&lt;')}</code>`, true);
			} else {
				const messageTextMatch = msg.match(/:\s*(.+)$/);
				const messageText = messageTextMatch ? messageTextMatch[1].trim().toLowerCase() : lowerCaseMessage;
				const onlyStroyMessage = messageText === "строй";
				
				debugLog('Обнаружен сбор/строй!');
				window.playSound("https://raw.githubusercontent.com/ZaharQqqq/Sound/main/steroi.mp3", false, 1.0);
				
				if (!onlyStroyMessage) {
					performStroiReconnect(msg); // одно сообщение с msg внутри
				} else {
					// Только слово "строй" — просто уведомление, без реконнекта
					const payDayStatus = isPayDayApproaching()
						? `⏰ <b>БЛИЗКО К PAYDAY (${getCurrentMinutes()} мин)</b>`
						: `🕐 До PayDay: ${60 - getCurrentMinutes()} мин`;
					sendToTelegram(
						`📢 <b>Строй (${displayName})</b>\n${payDayStatus}\n` +
						`<code>${msg.replace(/</g, '&lt;')}</code>`
					);
					debugLog('Сообщение содержит только "строй" — реконнект не выполняется');
				}
				radioHandled = true; // рация уже обработана строй-блоком
			}
		}
        if (lowerCaseMessage.indexOf("администратор") !== -1 &&
            lowerCaseMessage.indexOf("кикнул") !== -1 &&
            msg.includes(config.accountInfo.nickname)) {
            debugLog(`Обнаружен кик ${displayName}!`);
            const replyMarkup = getNotificationReplyMarkup();
            sendToTelegram(`💢 <b>КИК АДМИНИСТРАТОРА! (${displayName})</b>\n<code>${msg.replace(/</g, '&lt;')}</code>`, false, replyMarkup);
            window.playSound("https://raw.githubusercontent.com/ZaharQqqq/Sound/main/kick.mp3", false, 1.0);
            if (!globalState.isPrison) {
                performReconnect(2 * 60 * 1000);
            } else {
                debugLog('Кик после посадки в тюрьму, игнорируем стандартный реконнект');
            }
        }
        if (!isNonRPMessage(msg) && checkLocationRequest(msg, lowerCaseMessage, chatRadius)) {
            debugLog('Обнаружен запрос местоположения!');
            const replyMarkup = getNotificationReplyMarkup();
            sendToTelegram(`📍 <b>Обнаружен запрос местоположения (${displayName}):</b>\n<code>${msg.replace(/</g, '&lt;')}</code>`, false, replyMarkup);
        }
        if (!isNonRPMessage(msg) && checkAFKConditions(msg, lowerCaseMessage)) {
            debugLog('Обнаружено AFK условие!');
            sendChatInput(reconnectionCommand);
            sendToTelegram(`⚡ <b>Автоматически отправлено ${reconnectionCommand} (${displayName})</b>\nПо AFK условию для ID: ${config.afkSettings.id}\n<code>${msg.replace(/</g, '&lt;')}</code>`, false, null);
        }
        // ── Проверка сообщений с рации ─────────────────────────────
        if (!radioHandled && chatRadius === CHAT_RADIUS.RADIO && !isNonRPMessage(msg) && !isSystemRadioMessage(msg)) {
            const radioHighRank = isHighRankRadioMessage(msg);
            const replyMarkup = getNotificationReplyMarkup();

            if (config.radioOfficialNotifications) {
                // Режим «всё»: шлём каждое сообщение рации
                debugLog('Обнаружено сообщение с рации (полный режим)!');
                sendToTelegram(
                    `📡 <b>Сообщение с рации (${displayName}):</b>\n<code>${msg.replace(/</g, '&lt;')}</code>`,
                    !radioHighRank, replyMarkup
                );
            } else if (config.radioImportantFilter && isImportantRadioMessage(msg)) {
                // Режим «фильтр»: только строй / местоположение / мой ID
                debugLog('Обнаружено важное сообщение с рации (фильтр)!');
                sendToTelegram(
                    `📡 <b>Важное сообщение с рации (${displayName}):</b>\n<code>${msg.replace(/</g, '&lt;')}</code>`,
                    !radioHighRank, replyMarkup
                );
            }
        }
        // Проверка выговоров (динамически только для определённой фракции)
        if (config.currentFaction && factions[config.currentFaction] && config.warningNotifications) {
            const ranks = factions[config.currentFaction].ranks;
            const rank10 = ranks[10]; // Высший ранг (например, губернатор, глав врач)
            const rank9 = ranks[9]; // Второй высший (например, вице-губернатор, заместитель глав врача)
            // Экранируем специальные символы в названиях рангов, если они есть (на всякий случай)
            const escapedRank10 = rank10.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const escapedRank9 = rank9.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const warningRegex = new RegExp(`(?:${escapedRank10}|${escapedRank9})\\s+([^[]+)\\[(\\d+)\\]\\s+выдал\\s+Вам\\s+Выговор\\s+(\\d+)\\s+из\\s+3\\.\\s+Причина:\\s+(.*)`, 'i');
            const warningMatch = msg.match(warningRegex);
            if (warningMatch) {
                debugLog(`Обнаружен выговор от ${warningMatch[1]} в фракции ${config.currentFaction}!`);
                sendToTelegram(`⚠️ <b>Получен выговор (${displayName}) от ${warningMatch[1]} [ID: ${warningMatch[2]}]:</b>\nВыговор ${warningMatch[3]}/3\nПричина: ${warningMatch[4]}\n<code>${msg.replace(/</g, '&lt;')}</code>`);
                window.playSound("https://raw.githubusercontent.com/ZaharQqqq/Sound/main/uved.mp3", false, 1.0); // Опционально: звук для выговора
            }
        }
        // Новые проверки сообщений в чате
        if (msg.includes("Потеряно соединение с сервером")) {
            debugLog('Обнаружено потеря соединения!');
            if (!window.__afterRec5) {
                sendToTelegram(`❌ Потеряно соединение с сервером (${displayName})`, false, null);
            } else {
                window.__afterRec5 = false; // сброс: следующее "потеряно" уже не от /rec 5
            }
        }
        // Подождите 15 секунд перед следующим входом (цвет FF6600 — оранжевый, rate-limit сервера)
        if (lowerCaseMessage.includes("подождите") && lowerCaseMessage.includes("секунд") && lowerCaseMessage.includes("входом на сервер")) {
            debugLog('Обнаружен rate-limit сервера (15 секунд)!');
            window.__afterRateLimit = true; // Флаг: следующий disconnect — следствие rate-limit, подавить его
            const rateLimitMarkup = {
                inline_keyboard: [
                    [createButton("🔄 Отправить /rec 5", `send_rec_cmd_${uniqueId}`)],
                    [createButton("⚙️ Управление", `show_controls_${uniqueId}`)]
                ]
            };
            sendToTelegram(
                `⏳ <b>Rate-limit сервера (${displayName})</b>\n` +
                `<code>${msg.replace(/\{[0-9A-Fa-f]{6}\}/g, '').replace(/</g, '&lt;')}</code>`,
                false, rateLimitMarkup
            );
        }
        // Вы были отключены от сервера (цвет BEBEBE)
        if (msg.includes("Вы были отключены от сервера")) {
            debugLog('Обнаружено отключение от сервера!');
            if (!window.__afterRec5) {
                if (window.__afterRateLimit) {
                    // Это отключение — прямое следствие rate-limit, уже уведомили выше
                    debugLog('Отключение после rate-limit — повторное уведомление подавлено');
                    window.__afterRateLimit = false; // сброс флага
                } else if (window.__afterAuthDialog) {
                    // Это отключение — уже показано в диалоге авторизации, дубль не нужен
                    debugLog('Отключение после диалога авторизации — повторное уведомление подавлено');
                    window.__afterAuthDialog = false; // сброс флага
                } else {
                    const disconnectMarkup = {
                        inline_keyboard: [
                            [createButton("🔄 Отправить /rec 5", `send_rec_cmd_${uniqueId}`)],
                            [createButton("⚙️ Управление", `show_controls_${uniqueId}`)]
                        ]
                    };
                    sendToTelegram(`🔌 <b>Вы были отключены от сервера (${displayName})</b>`, false, disconnectMarkup);
                }
            } else {
                window.__afterRec5 = false; // после /rec 5 не дублируем
            }
        }
        // Проверка неактивности — только по тексту (цвет может прийти как undefined у системных сообщений)
        if (msg.includes("Вы были неактивны долгое время. Отыгранное время для получения следующего PayDay было обнулено.")) {
            debugLog('Обнаружено предупреждение о неактивности (цвет F68C00 подтверждён)!');
            const replyMarkup = getNotificationReplyMarkup();
            sendToTelegram(
                `🔴 <b>НЕАКТИВНОСТЬ ОБНАРУЖЕНА! (${displayName})</b>
` +
                `⚠️ Вы были неактивны долгое время.
` +
                `💔 Отыгранное время для получения следующего PayDay было <b>обнулено</b>.
` +
                `⏰ Время: ${new Date().toLocaleTimeString('ru-RU')}`,
                false, replyMarkup
            );
            window.playSound("https://raw.githubusercontent.com/ZaharQqqq/Sound/main/uved.mp3", false, 1.0);
        }
    };
    debugLog('Мониторинг успешно активирован');
    if (!config.initialized) {
        trackNicknameAndServer();
        config.initialized = true;
        if (config.trackPlayerId) {
            debugLog('Запуск отслеживания ID игрока через HUD...');
            trackPlayerId();
        }
        if (config.locationLogging) {
            debugLog('[LOC] Запуск логирования координат персонажа...');
            setTimeout(trackPlayerLocation, 5000); // небольшая задержка, чтобы store точно загрузился
        }
        if (config.moneyLogging) {
            debugLog('[MONEY] Запуск логирования Нала и Банка...');
            setTimeout(trackPlayerMoney, 5000); // та же задержка для синхронизации со store
        }
        if (config.hpTracking) {
            debugLog('[HP] Запуск отслеживания HP персонажа...');
            setTimeout(trackPlayerHp, 5000);
        }
        // Запуск ожидания спавна для загрузки профиля (работает для всех аккаунтов,
        // не только фракционных — аналог HP-трекера, но для профиля).
        debugLog('[Profile] 🚀 Запуск ожидания спавна для загрузки профиля через MainMenu...');
        setTimeout(waitForSpawnThenLoadProfile, 5000);
        globalState.sessionStartTime = Date.now();
        addSessionLog('🟢 Сессия начата');
    }
    checkTelegramCommands();
    return true;
}
// END CHAT MONITOR MODULE //

// ╔══════════════════════════════════════════════════════════╗
// ║  MODULE: RECONNECT                                       ║
// ║  Описание: Перехват события разрыва соединения,          ║
// ║             отправка уведомления в Telegram              ║
// ║  Зависимости: config, displayName, debugLog,             ║
// ║               sendToTelegram, autoLoginConfig,           ║
// ║               reconnectionCommand                        ║
// ╚══════════════════════════════════════════════════════════╝
// START RECONNECT MODULE //
function performReconnect(delay, silent = false) {
    if (config.autoReconnectEnabled) {
        autoLoginConfig.enabled = false;
        sendChatInput("/rec 5");
        if (!silent) sendToTelegram(`🔄 <b>Отключен автовход и отправлен /rec 5 (${displayName})</b>`);
        setTimeout(() => {
            autoLoginConfig.enabled = true;
            sendChatInput("/rec 5");
            if (!silent) sendToTelegram(`🔄 <b>Включен автовход и отправлен /rec 5 (${displayName})</b>`);
        }, delay);
    } else {
        sendChatInput("/q");
        if (!silent) sendToTelegram(`✅ <b>Отправлено /q (${displayName})</b>`);
    }
}
// END RECONNECT MODULE //

// ╔══════════════════════════════════════════════════════════╗
// ║  MODULE: INITIALIZATION                                  ║
// ║  Описание: Точка запуска — инициализация ChatMonitor     ║
// ║             с retry-логикой                              ║
// ║  Зависимости: config, debugLog, sendToTelegram,          ║
// ║               initializeChatMonitor                      ║
// ╚══════════════════════════════════════════════════════════╝
// START INITIALIZATION MODULE //
function __initBot() {
    debugLog('Скрипт запущен');
    if (!initializeChatMonitor()) {
        let attempts = 0;
        const intervalId = setInterval(() => {
            attempts++;
            if (initializeChatMonitor()) {
                clearInterval(intervalId);
            } else if (attempts >= config.maxAttempts) {
                clearInterval(intervalId);
                const errorMsg = `❌ <b>Ошибка</b>\nНе удалось инициализировать после ${config.maxAttempts} попыток`;
                debugLog(errorMsg);
                sendToTelegram(errorMsg, false, null);
            } else {
                debugLog(`Попытка инициализации #${attempts}`);
            }
        }, config.checkInterval);
    }
}

if (window.__WAIT_CODE2__) {
    // Load.js запустит __initBot() после загрузки Code2.js
    window.__botInit = __initBot;
    debugLog('⏳ Бот на паузе — ждём загрузки Code2.js...');
} else {
    __initBot();
}
// END INITIALIZATION MODULE //

// ╔══════════════════════════════════════════════════════════╗
// ║  MODULE: HB MENU SYSTEM                                  ║
// ║  Описание: Внутриигровое меню /hb через диалоговую       ║
// ║             систему игры. Управление AFK, настройками    ║
// ║             и движением прямо из игры (без Telegram)     ║
// ║  Зависимости: config, displayName, debugLog,             ║
// ║               sendToTelegram, activateAFKWithMode,       ║
// ║               stopAFKCycle, sendChatInput,               ║
// ║               addDialogInQueue, showScreenNotification   ║
// ╚══════════════════════════════════════════════════════════╝
// ==================== HB MENU SYSTEM ====================
// Добавьте этот код в конец вашего основного скрипта
// Константы для меню HB
const HB_DIALOG_IDS =  {
    MAIN: 900,
    CONTROLS: 901,
    LOCAL_FUNCTIONS: 902,
    GLOBAL_FUNCTIONS: 903,
    PAYDAY_OPTIONS: 904,
    SOOB_OPTIONS: 905,
    MESTO_OPTIONS: 906,
    RADIO_OPTIONS: 907,
    WARNING_OPTIONS: 908,
    MOVEMENT_CONTROLS: 909,
    AFK_MODES: 910,
    AFK_PAUSES: 911,
    AFK_RECONNECT: 912,
    AFK_RESTART: 913
};
let currentHBMenu = null;
let currentHBPage = 0;
let currentHBSelectedMode = null;
const HB_ITEMS_PER_PAGE = 6;
// Функция для создания меню с пагинацией
function createHBMenu(title, items, dialogId) {
    const start = currentHBPage * HB_ITEMS_PER_PAGE;
    const end = start + HB_ITEMS_PER_PAGE;
    const pageItems = items.slice(start, end);
    let menuList = "← Назад<n>";
    pageItems.forEach((item) => {
        menuList += `${item.name}<n>`;
    });
    if ((currentHBPage + 1) * HB_ITEMS_PER_PAGE < items.length) {
        menuList += "Вперед →<n>";
    }
    window.addDialogInQueue(
        `[${dialogId},2,"${title}","","Выбрать","Закрыть",0,0]`,
        menuList,
        0
    );
}
// Главное меню
function showHBMainMenu() {
    currentHBMenu = "main";
    currentHBPage = 0;
    const menuItems = [
        { name: "{FFD700}> {FFFFFF}Управление", action: "controls" }
    ];
    let menuList = "";
    menuItems.forEach((item) => {
        menuList += `${item.name}<n>`;
    });
    window.addDialogInQueue(
        `[${HB_DIALOG_IDS.MAIN},2,"{00BFFF}Hassle | Bot TG Menu","","Выбрать","Закрыть",0,0]`,
        menuList,
        0
    );
}
// Меню управления
function showHBControlsMenu() {
    currentHBMenu = "controls";
    currentHBPage = 0;
    const menuItems = [
        { name: "{FFD700}> {FFFFFF}Функции", action: "local_functions" },
        { name: "{FFD700}> {FFFFFF}Общие функции", action: "global_functions" },
        { name: "{FFD700}> {FFFFFF}Инфо об аккаунте", action: "account_info" },
        { name: "{FF6600}> {FFFFFF}Перезагрузить скрипт", action: "reload_script" }
    ];
    if (RECONNECT_ENABLED_DEFAULT) {
        const reconnectStatus = config.autoReconnectEnabled ? "{00FF00}[ВКЛ]" : "{FF0000}[ВЫКЛ]";
        menuItems.push({ name: `{FFFFFF}Реконнект ${reconnectStatus}`, action: "toggle_reconnect" });
    }
    let menuList = "{FFA500}< Назад<n>";
    menuItems.forEach((item) => {
        menuList += `${item.name}<n>`;
    });
    window.addDialogInQueue(
        `[${HB_DIALOG_IDS.CONTROLS},2,"{00BFFF}Управление","","Выбрать","Закрыть",0,0]`,
        menuList,
        0
    );
}
// Меню локальных функций
function showHBLocalFunctionsMenu() {
    currentHBMenu = "local_functions";
    currentHBPage = 0;
    const statusOn = "{00FF00}[ВКЛ]";
    const statusOff = "{FF0000}[ВЫКЛ]";
    const menuItems = [
        { name: "{FFD700}> {FFFFFF}Движение", action: "movement" },
        { name: `{FFFFFF}Увед. правик ${config.govMessagesEnabled ? statusOn : statusOff}`, action: "toggle_soob_local" },
        { name: `{FFFFFF}Отслеживание ${config.trackLocationRequests ? statusOn : statusOff}`, action: "toggle_mesto_local" },
        { name: `{FFFFFF}Рация все ${config.radioOfficialNotifications ? statusOn : statusOff}`, action: "toggle_radio_local" },
        { name: `{FFFFFF}Рация фильтр ${config.radioImportantFilter ? statusOn : statusOff}`, action: "toggle_radio_filter_local" },
        { name: `{FFFFFF}Выговоры ${config.warningNotifications ? statusOn : statusOff}`, action: "toggle_warning_local" },
        { name: `{FFFFFF}Автоответ КАЧ/ЗП ${config.kacAutoReply ? statusOn : statusOff}`, action: "toggle_kac_local" }
    ];
    let menuList = "{FFA500}< Назад<n>";
    menuItems.forEach((item) => {
        menuList += `${item.name}<n>`;
    });
    window.addDialogInQueue(
        `[${HB_DIALOG_IDS.LOCAL_FUNCTIONS},2,"{00BFFF}Функции","","Выбрать","Закрыть",0,0]`,
        menuList,
        0
    );
}
// Меню глобальных функций
function showHBGlobalFunctionsMenu() {
    currentHBMenu = "global_functions";
    currentHBPage = 0;
    const statusOn = "{00FF00}[ВКЛ]";
    const statusOff = "{FF0000}[ВЫКЛ]";
    const menuItems = [
        { name: `{FFFFFF}PayDay ${config.paydayNotifications ? statusOn : statusOff}`, action: "toggle_payday" },
        { name: `{FFFFFF}Сообщ. ${config.govMessagesEnabled ? statusOn : statusOff}`, action: "toggle_soob" },
        { name: `{FFFFFF}Место ${config.trackLocationRequests ? statusOn : statusOff}`, action: "toggle_mesto" },
        { name: `{FFFFFF}Рация все ${config.radioOfficialNotifications ? statusOn : statusOff}`, action: "toggle_radio" },
        { name: `{FFFFFF}Рация фильтр ${config.radioImportantFilter ? statusOn : statusOff}`, action: "toggle_radio_filter" },
        { name: `{FFFFFF}Выговоры ${config.warningNotifications ? statusOn : statusOff}`, action: "toggle_warning" },
        { name: `{FFFFFF}Автоответ КАЧ/ЗП ${config.kacAutoReply ? statusOn : statusOff}`, action: "toggle_kac_global" },
        { name: "{FFD700}> {FFFFFF}AFK Ночь", action: "afk_night" }
    ];
    let menuList = "{FFA500}< Назад<n>";
    menuItems.forEach((item) => {
        menuList += `${item.name}<n>`;
    });
    window.addDialogInQueue(
        `[${HB_DIALOG_IDS.GLOBAL_FUNCTIONS},2,"{00BFFF}Общие функции","","Выбрать","Закрыть",0,0]`,
        menuList,
        0
    );
}
// Меню движения
function showHBMovementMenu() {
    currentHBMenu = "movement";
    currentHBPage = 0;
    const sitStandText = config.isSitting ? "{FFFFFF}Встать" : "{FFFFFF}Сесть";
    const menuItems = [
        { name: "{FFFFFF}^ Вперед", action: "move_forward" },
        { name: "{FFFFFF}< Влево", action: "move_left" },
        { name: "{FFFFFF}> Вправо", action: "move_right" },
        { name: "{FFFFFF}v Назад", action: "move_back" },
        { name: "{FFFFFF}Прыжок", action: "move_jump" },
        { name: "{FFFFFF}Удар", action: "move_punch" },
        { name: sitStandText, action: "move_sit_stand" }
    ];
    let menuList = "{FFA500}< Назад<n>";
    menuItems.forEach((item) => {
        menuList += `${item.name}<n>`;
    });
    window.addDialogInQueue(
        `[${HB_DIALOG_IDS.MOVEMENT_CONTROLS},2,"{00BFFF}Движение","","Выбрать","Закрыть",0,0]`,
        menuList,
        0
    );
}
// Меню AFK режимов
function showHBAFKModesMenu() {
    currentHBMenu = "afk_modes";
    currentHBPage = 0;
    const menuItems = [
        { name: "{FFD700}> {FFFFFF}С паузами", action: "afk_with_pauses" },
        { name: "{FFD700}> {FFFFFF}Без пауз", action: "afk_without_pauses" }
    ];
    let menuList = "{FFA500}< Назад<n>";
    menuItems.forEach((item) => {
        menuList += `${item.name}<n>`;
    });
    window.addDialogInQueue(
        `[${HB_DIALOG_IDS.AFK_MODES},2,"{00BFFF}AFK Ночь - Режим","","Выбрать","Закрыть",0,0]`,
        menuList,
        0
    );
}
// Меню AFK с паузами
function showHBAFKPausesMenu() {
    currentHBMenu = "afk_pauses";
    currentHBPage = 0;
    const menuItems = [
        { name: "{FFD700}> {FFFFFF}5/5 минут", action: "afk_fixed" },
        { name: "{FFD700}> {FFFFFF}Рандомное время", action: "afk_random" }
    ];
    let menuList = "{FFA500}< Назад<n>";
    menuItems.forEach((item) => {
        menuList += `${item.name}<n>`;
    });
    window.addDialogInQueue(
        `[${HB_DIALOG_IDS.AFK_PAUSES},2,"{00BFFF}AFK Ночь - Паузы","","Выбрать","Закрыть",0,0]`,
        menuList,
        0
    );
}
// Меню реконнекта для AFK
function showHBAFKReconnectMenu(selectedMode) {
    currentHBMenu = "afk_reconnect";
    currentHBPage = 0;
    const menuItems = [
        { name: "{00FF00}Реконнект [ВКЛ]", action: `reconnect_on_${selectedMode}` },
        { name: "{FF0000}Реконнект [ВЫКЛ]", action: `reconnect_off_${selectedMode}` }
    ];
    let menuList = "{FFA500}< Назад<n>";
    menuItems.forEach((item) => {
        menuList += `${item.name}<n>`;
    });
    window.addDialogInQueue(
        `[${HB_DIALOG_IDS.AFK_RECONNECT},2,"{00BFFF}AFK Ночь - Реконнект","","Выбрать","Закрыть",0,0]`,
        menuList,
        0
    );
}
// Меню выбора действия при рестарте
function showHBAFKRestartMenu(selectedMode) {
    currentHBMenu = "afk_restart";
    currentHBPage = 0;
    const menuItems = [
        { name: "{FFFFFF}/q", action: `restart_q_${selectedMode}` },
        { name: "{FFFFFF}/rec", action: `restart_rec_${selectedMode}` }
    ];
    let menuList = "{FFA500}< Назад<n>";
    menuItems.forEach((item) => {
        menuList += `${item.name}<n>`;
    });
    window.addDialogInQueue(
        `[${HB_DIALOG_IDS.AFK_RESTART},2,"{00BFFF}AFK Ночь - Действие","","Выбрать","Закрыть",0,0]`,
        menuList,
        0
    );
}
// Обработчик выбора в меню
function handleHBMenuSelection(dialogId, button, listitem) {
    console.log(`HB Menu: dialogId=${dialogId}, button=${button}, listitem=${listitem}`);
    if (button !== 1) {
        currentHBMenu = null;
        currentHBSelectedMode = null;
        return;
    }
    switch (dialogId) {
        case HB_DIALOG_IDS.MAIN:
            if (listitem === 0) {
                setTimeout(() => showHBControlsMenu(), 100);
            }
            break;
        case HB_DIALOG_IDS.CONTROLS:
            if (listitem === 0) {
                setTimeout(() => showHBMainMenu(), 100);
            } else if (listitem === 1) {
                setTimeout(() => showHBLocalFunctionsMenu(), 100);
            } else if (listitem === 2) {
                setTimeout(() => showHBGlobalFunctionsMenu(), 100);
            } else if (listitem === 3) {
                // Инфо об аккаунте — единый формат как в welcome-сообщении
                try {
                    const infoBlock = buildWelcomeAccountInfo();
                    sendToTelegram(
                        `📊 <b>Информация об аккаунте (${displayName})</b>${infoBlock}`,
                        false, null
                    );

                    // Краткий дубль в игровой чат
                    const _pos = getPlayerPositionFromStore();
                    const _money = getPlayerMoneyFromStore();
                    const _nick = config.accountInfo.nickname || 'Unknown';
                    const _server = config.accountInfo.server || '?';
                    const _skinId = (config.accountInfo.skinId !== null && config.accountInfo.skinId !== undefined) ? config.accountInfo.skinId : '?';
                    const _faction = config.currentFaction ? `[${getFactionLabel(config.currentFaction)}]` : '[не фракционный]';
                    const _cashChat = (_money && _money.money !== null) ? _money.money.toLocaleString() : '?';
                    const _bankChat = (_money && _money.bankMoney !== null) ? _money.bankMoney.toLocaleString() : '?';
                    const _posChat = _pos
                        ? `x=${Math.round(_pos.x)} y=${Math.round(_pos.y)} z=${Math.round(_pos.z ?? 0)} угол=${Math.round(_pos.angle ?? 0)}°`
                        : 'Позиция недоступна';

                    addLocalChatMessage(`{00BFFF}[HB Info] {FFFFFF}${_nick} | S${_server} | Скин: ${_skinId} ${_faction}`, "FFFFFF");
                    addLocalChatMessage(`{00BFFF}[HB Info] {FFFFFF}Нал: ${_cashChat} ₽ | Банк: ${_bankChat} ₽`, "FFFFFF");
                    addLocalChatMessage(`{00BFFF}[HB Info] {FFFFFF}${_posChat}`, "FFFFFF");

                    showScreenNotification("Hassle", "Инфо отправлено в Telegram");
                } catch(err) {
                    showScreenNotification("Hassle", "Ошибка получения инфо");
                    sendToTelegram(`❌ <b>Ошибка инфо (${displayName}):</b>\n<code>${err.message}</code>`, false, null);
                }
                setTimeout(() => showHBControlsMenu(), 100);
            } else if (listitem === 4) {
                // Перезагрузить скрипт — текущий + broadcast остальным
                showScreenNotification("Hassle", "Перезагрузка всех скриптов...");
                reloadAllAccounts();
            } else if (RECONNECT_ENABLED_DEFAULT && listitem === 5) {
                config.autoReconnectEnabled = !config.autoReconnectEnabled;
                const status = config.autoReconnectEnabled ? 'включен' : 'выключен';
                showScreenNotification("Hassle", `Реконнект ${status}`);
                sendToTelegram(`🔄 <b>Реконнект ${status} для ${displayName}</b>`, false, null);
                sendWelcomeMessage();
                setTimeout(() => showHBControlsMenu(), 100);
            }
            break;
        case HB_DIALOG_IDS.LOCAL_FUNCTIONS:
            if (listitem === 0) {
                setTimeout(() => showHBControlsMenu(), 100);
            } else if (listitem === 1) {
                setTimeout(() => showHBMovementMenu(), 100);
            } else if (listitem === 2) {
                config.govMessagesEnabled = !config.govMessagesEnabled;
                const status = config.govMessagesEnabled ? 'включены' : 'отключены';
                showScreenNotification("Hassle", `Уведомления от сотрудников фракции ${status}`);
                sendToTelegram(`${config.govMessagesEnabled ? '🔔' : '🔕'} <b>Уведомления от сотрудников фракции ${status} для ${displayName}</b>`, false, null);
                sendWelcomeMessage();
                setTimeout(() => showHBLocalFunctionsMenu(), 100);
            } else if (listitem === 3) {
                config.trackLocationRequests = !config.trackLocationRequests;
                const status = config.trackLocationRequests ? 'включено' : 'отключено';
                showScreenNotification("Hassle", `Отслеживание местоположения ${status}`);
                sendToTelegram(`${config.trackLocationRequests ? '📍' : '🔕'} <b>Отслеживание местоположения ${status} для ${displayName}</b>`, false, null);
                sendWelcomeMessage();
                setTimeout(() => showHBLocalFunctionsMenu(), 100);
            } else if (listitem === 4) {
                config.radioOfficialNotifications = !config.radioOfficialNotifications;
                const status = config.radioOfficialNotifications ? 'включены' : 'отключены';
                showScreenNotification("Hassle", `Рация (все) ${status}`);
                sendToTelegram(`${config.radioOfficialNotifications ? '📡' : '🔕'} <b>Рация (все) ${status} для ${displayName}</b>`, false, null);
                sendWelcomeMessage();
                setTimeout(() => showHBLocalFunctionsMenu(), 100);
            } else if (listitem === 5) {
                config.radioImportantFilter = !config.radioImportantFilter;
                const status = config.radioImportantFilter ? 'включён' : 'отключён';
                showScreenNotification("Hassle", `Фильтр рации ${status}`);
                sendToTelegram(`${config.radioImportantFilter ? '🎯' : '🚫'} <b>Фильтр рации (строй/место/ID) ${status} для ${displayName}</b>`, false, null);
                sendWelcomeMessage();
                setTimeout(() => showHBLocalFunctionsMenu(), 100);
            } else if (listitem === 6) {
                config.warningNotifications = !config.warningNotifications;
                const status = config.warningNotifications ? 'включены' : 'отключены';
                showScreenNotification("Hassle", `Уведомления выговоров ${status}`);
                sendToTelegram(`${config.warningNotifications ? '⚠️' : '🔕'} <b>Уведомления выговоров ${status} для ${displayName}</b>`, false, null);
                sendWelcomeMessage();
                setTimeout(() => showHBLocalFunctionsMenu(), 100);
            } else if (listitem === 7) {
                // Автоответ КАЧ/ЗП (локально)
                config.kacAutoReply = !config.kacAutoReply;
                showScreenNotification("Hassle", `Автоответ КАЧ/ЗП: ${config.kacAutoReply ? 'ВКЛ' : 'ВЫКЛ'}`);
                sendToTelegram(`🛡️ <b>Автоответ КАЧ/ЗП ${config.kacAutoReply ? 'ВКЛ' : 'ВЫКЛ'} для ${displayName}</b>`, false, null);
                setTimeout(() => showHBLocalFunctionsMenu(), 100);
            }
            break;
        case HB_DIALOG_IDS.GLOBAL_FUNCTIONS:
            if (listitem === 0) {
                setTimeout(() => showHBControlsMenu(), 100);
            } else if (listitem === 1) {
                const newValPd = !config.paydayNotifications;
                handleGlobalBroadcastCommand('toggle_payday', newValPd ? 'on' : 'off');
                broadcastGlobalCommand('toggle_payday', newValPd ? 'on' : 'off');
                setTimeout(() => showHBGlobalFunctionsMenu(), 100);
            } else if (listitem === 2) {
                const newValSoob = !config.govMessagesEnabled;
                handleGlobalBroadcastCommand('toggle_soob', newValSoob ? 'on' : 'off');
                broadcastGlobalCommand('toggle_soob', newValSoob ? 'on' : 'off');
                setTimeout(() => showHBGlobalFunctionsMenu(), 100);
            } else if (listitem === 3) {
                const newValMesto = !config.trackLocationRequests;
                handleGlobalBroadcastCommand('toggle_mesto', newValMesto ? 'on' : 'off');
                broadcastGlobalCommand('toggle_mesto', newValMesto ? 'on' : 'off');
                setTimeout(() => showHBGlobalFunctionsMenu(), 100);
            } else if (listitem === 4) {
                const newValRadio = !config.radioOfficialNotifications;
                handleGlobalBroadcastCommand('toggle_radio', newValRadio ? 'on' : 'off');
                broadcastGlobalCommand('toggle_radio', newValRadio ? 'on' : 'off');
                setTimeout(() => showHBGlobalFunctionsMenu(), 100);
            } else if (listitem === 5) {
                const newValFilter = !config.radioImportantFilter;
                handleGlobalBroadcastCommand('toggle_radio_filter', newValFilter ? 'on' : 'off');
                broadcastGlobalCommand('toggle_radio_filter', newValFilter ? 'on' : 'off');
                setTimeout(() => showHBGlobalFunctionsMenu(), 100);
            } else if (listitem === 6) {
                const newValWarn = !config.warningNotifications;
                handleGlobalBroadcastCommand('toggle_warning', newValWarn ? 'on' : 'off');
                broadcastGlobalCommand('toggle_warning', newValWarn ? 'on' : 'off');
                setTimeout(() => showHBGlobalFunctionsMenu(), 100);
            } else if (listitem === 7) {
                // Автоответ КАЧ/ЗП (глобально)
                const newValKac = !config.kacAutoReply;
                handleGlobalBroadcastCommand('toggle_kac', newValKac ? 'on' : 'off');
                broadcastGlobalCommand('toggle_kac', newValKac ? 'on' : 'off');
                setTimeout(() => showHBGlobalFunctionsMenu(), 100);
            } else if (listitem === 8) {
                setTimeout(() => showHBAFKModesMenu(), 100);
            }
            break;
        case HB_DIALOG_IDS.MOVEMENT_CONTROLS:
            if (listitem === 0) {
                setTimeout(() => showHBLocalFunctionsMenu(), 100);
            } else if (listitem === 1) {
                // Вперед
                try {
                    window.onScreenControlTouchStart("<Gamepad>/leftStick");
                    window.onScreenControlTouchMove("<Gamepad>/leftStick", 0, 1);
                    setTimeout(() => {
                        window.onScreenControlTouchEnd("<Gamepad>/leftStick");
                    }, 500);
                    showScreenNotification("Hassle", "Движение вперед выполнено");
                    sendToTelegram(`🚶 <b>Движение вперед для ${displayName}</b>`, false, null);
                    setTimeout(() => showHBMovementMenu(), 100);
                } catch (err) {
                    sendToTelegram(`❌ <b>Ошибка:</b> ${err.message}`, false, null);
                }
            } else if (listitem === 2) {
                // Влево
                try {
                    window.onScreenControlTouchStart("<Gamepad>/leftStick");
                    window.onScreenControlTouchMove("<Gamepad>/leftStick", -1, 0);
                    setTimeout(() => {
                        window.onScreenControlTouchEnd("<Gamepad>/leftStick");
                    }, 500);
                    showScreenNotification("Hassle", "Движение влево выполнено");
                    sendToTelegram(`🚶 <b>Движение влево для ${displayName}</b>`, false, null);
                    setTimeout(() => showHBMovementMenu(), 100);
                } catch (err) {
                    sendToTelegram(`❌ <b>Ошибка:</b> ${err.message}`, false, null);
                }
            } else if (listitem === 3) {
                // Вправо
                try {
                    window.onScreenControlTouchStart("<Gamepad>/leftStick");
                    window.onScreenControlTouchMove("<Gamepad>/leftStick", 1, 0);
                    setTimeout(() => {
                        window.onScreenControlTouchEnd("<Gamepad>/leftStick");
                    }, 500);
                    showScreenNotification("Hassle", "Движение вправо выполнено");
                    sendToTelegram(`🚶 <b>Движение вправо для ${displayName}</b>`, false, null);
                    setTimeout(() => showHBMovementMenu(), 100);
                } catch (err) {
                    sendToTelegram(`❌ <b>Ошибка:</b> ${err.message}`, false, null);
                }
            } else if (listitem === 4) {
                // Назад
                try {
                    window.onScreenControlTouchStart("<Gamepad>/leftStick");
                    window.onScreenControlTouchMove("<Gamepad>/leftStick", 0, -1);
                    setTimeout(() => {
                        window.onScreenControlTouchEnd("<Gamepad>/leftStick");
                    }, 500);
                    showScreenNotification("Hassle", "Движение назад выполнено");
                    sendToTelegram(`🚶 <b>Движение назад для ${displayName}</b>`, false, null);
                    setTimeout(() => showHBMovementMenu(), 100);
                } catch (err) {
                    sendToTelegram(`❌ <b>Ошибка:</b> ${err.message}`, false, null);
                }
            } else if (listitem === 5) {
                // Прыжок
                try {
                    window.onScreenControlTouchStart("<Keyboard>/leftShift");
                    setTimeout(() => {
                        window.onScreenControlTouchEnd("<Keyboard>/leftShift");
                    }, 500);
                    showScreenNotification("Hassle", "Прыжок выполнен");
                    sendToTelegram(`🆙 <b>Прыжок для ${displayName}</b>`, false, null);
                    setTimeout(() => showHBMovementMenu(), 100);
                } catch (err) {
                    sendToTelegram(`❌ <b>Ошибка:</b> ${err.message}`, false, null);
                }
            } else if (listitem === 6) {
                // Удар
                try {
                    window.onScreenControlTouchStart("<Mouse>/leftButton");
                    setTimeout(() => window.onScreenControlTouchEnd("<Mouse>/leftButton"), 100);
                    showScreenNotification("Hassle", "Удар выполнен");
                    sendToTelegram(`👊 <b>Удар для ${displayName}</b>`, false, null);
                    setTimeout(() => showHBMovementMenu(), 100);
                } catch (err) {
                    sendToTelegram(`❌ <b>Ошибка:</b> ${err.message}`, false, null);
                }
            } else if (listitem === 7) {
                // Сесть/Встать
                try {
                    window.onScreenControlTouchStart("<Keyboard>/c");
                    setTimeout(() => window.onScreenControlTouchEnd("<Keyboard>/c"), 500);
                    config.isSitting = !config.isSitting;
                    const actionText = config.isSitting ? 'Сесть' : 'Встать';
                    showScreenNotification("Hassle", `Команда "${actionText}" выполнена`);
                    sendToTelegram(`✅ <b>Команда "${actionText}" для ${displayName}</b>`, false, null);
                    setTimeout(() => showHBMovementMenu(), 100);
                } catch (err) {
                    sendToTelegram(`❌ <b>Ошибка:</b> ${err.message}`, false, null);
                }
            }
            break;
        case HB_DIALOG_IDS.AFK_MODES:
            if (listitem === 0) {
                setTimeout(() => showHBGlobalFunctionsMenu(), 100);
            } else if (listitem === 1) {
                setTimeout(() => showHBAFKPausesMenu(), 100);
            } else if (listitem === 2) {
                if (config.autoReconnectEnabled) {
                    currentHBSelectedMode = 'none';
                    setTimeout(() => showHBAFKReconnectMenu('none'), 100);
                } else {
                    activateAFKWithMode('none', false, 'q', null, null);
                    showScreenNotification("Hassle", "AFK без пауз активирован");
                }
            }
            break;
        case HB_DIALOG_IDS.AFK_PAUSES:
            if (listitem === 0) {
                setTimeout(() => showHBAFKModesMenu(), 100);
            } else if (listitem === 1) {
                if (config.autoReconnectEnabled) {
                    currentHBSelectedMode = 'fixed';
                    setTimeout(() => showHBAFKReconnectMenu('fixed'), 100);
                } else {
                    activateAFKWithMode('fixed', false, 'q', null, null);
                    showScreenNotification("Hassle", "AFK 5/5 мин активирован");
                }
            } else if (listitem === 2) {
                if (config.autoReconnectEnabled) {
                    currentHBSelectedMode = 'random';
                    setTimeout(() => showHBAFKReconnectMenu('random'), 100);
                } else {
                    activateAFKWithMode('random', false, 'q', null, null);
                    showScreenNotification("Hassle", "AFK рандом активирован");
                }
            }
            break;
        case HB_DIALOG_IDS.AFK_RECONNECT:
            if (listitem === 0) {
                setTimeout(() => showHBAFKPausesMenu(), 100);
            } else if (listitem === 1) {
                // Реконнект включен
                setTimeout(() => showHBAFKRestartMenu(currentHBSelectedMode), 100);
            } else if (listitem === 2) {
                // Реконнект выключен
                activateAFKWithMode(currentHBSelectedMode, false, 'q', null, null);
                showScreenNotification("Hassle", "AFK режим активирован (реконнект выкл)");
                currentHBSelectedMode = null;
            }
            break;
        case HB_DIALOG_IDS.AFK_RESTART:
            if (listitem === 0) {
                setTimeout(() => showHBAFKReconnectMenu(currentHBSelectedMode), 100);
            } else if (listitem === 1) {
                // /q
                activateAFKWithMode(currentHBSelectedMode, true, 'q', null, null);
                showScreenNotification("Hassle", "AFK режим активирован (/q при рестарте)");
                currentHBSelectedMode = null;
            } else if (listitem === 2) {
                // /rec
                activateAFKWithMode(currentHBSelectedMode, true, 'rec', null, null);
                showScreenNotification("Hassle", "AFK режим активирован (/rec при рестарте)");
                currentHBSelectedMode = null;
            }
            break;
    }
}
// Перехватываем оригинальную команду sendChatInput для добавления /hb
const originalSendChatInputCustom = window.sendChatInputCustom || sendChatInput;
window.sendChatInputCustom = function(e) {
    const args = e.split(" ");
    if (args[0] === "/hb") {
        showHBMainMenu();
        return;
    }
    // Вызываем оригинальную функцию для других команд
    if (typeof originalSendChatInputCustom === 'function') {
        originalSendChatInputCustom(e);
    }
};
// Перехватываем sendClientEvent для обработки диалогов HB
const originalSendClientEventCustom = window.sendClientEventCustom || sendClientEvent;
window.sendClientEventCustom = function(event, ...args) {
    if (args[0] === "OnDialogResponse") {
        const dialogId = args[1];
        // Проверяем, является ли это нашим HB меню (900-913)
        if (dialogId >= 900 && dialogId <= 913) {
            const button = args[2];
            const listitem = args[3];
            handleHBMenuSelection(dialogId, button, listitem);
            return;
        }
    }
    // Вызываем оригинальную функцию для других событий
    if (typeof originalSendClientEventCustom === 'function') {
        originalSendClientEventCustom(event, ...args);
    } else if (typeof window.sendClientEventHandle === 'function') {
        window.sendClientEventHandle(event, ...args);
    }
};
// Применяем перехваты
sendChatInput = window.sendChatInputCustom;
sendClientEvent = window.sendClientEventCustom;
console.log('[HB Menu] Система меню успешно загружена. Используйте /hb для открытия меню.');
// ==================== END HB MENU SYSTEM ====================


// ╔══════════════════════════════════════════════════════════╗
// ║  MODULE: ADMIN KAC/ZP AUTO-REPLY                         ║
// ║  Описание: Автоответ на проверку администратора          ║
// ║             (кач.зп / кач зп) — /n ответ через 20-30с   ║
// ║  Зависимости: sendChatInput, sendToTelegram,             ║
// ║               normalizeToCyrillic, ACCOUNT_NUMBER        ║
// ╚══════════════════════════════════════════════════════════╝
// ==================== START ADMIN KAC/ZP AUTO-REPLY MODULE ====================

(function() {

// ─────────────────────────────────────────────────────────────────────────────
//  Ответы разбиты на ГРУППЫ (A / B / C / D).
//  Каждый аккаунт имеет УНИКАЛЬНЫЙ набор фраз — нет пересечений между номерами.
//  При повторной проверке от того же админа (<5 мин) выбирается СЛЕДУЮЩАЯ группа
//  и исключается последний ответ → каждый раз по-другому.
//
//  Стиль по аккаунтам:
//    1 — минимальный (одно слово, без знаков)
//    2 — небрежный набор (тута / здеся)
//    3 — с точкой в конце (взрослый стиль)
//    4 — удвоение слов (тут тут / да да)
//    5 — украинский акцент (так / є)
//    6 — с глаголом (играю / сижу)
//    7 — развёрнутые живые фразы
//    8 — с восклицанием
// ─────────────────────────────────────────────────────────────────────────────

const REPLY_GROUPS = {
    '1': {
        A: ['дэ', '/n дэ', 'ок', '/n ок'],
        B: ['тут', '/n тут', 'вот тут', '/n вот тут'],
        C: ['здесь', '/n здесь', 'вот здесь', '/n вот здесь'],
        D: ['тут я', '/n тут я', 'я тут', '/n я тут'],
    },
    '2': {
        A: ['дэ)', '/n дэ)', 'дда', '/n дда'],
        B: ['тута', '/n тута', 'да тута', '/n да тута'],
        C: ['здеся', '/n здеся', 'да здеся', '/n да здеся'],
        D: ['я тута', '/n я тута', 'тута я', '/n тута я'],
    },
    '3': {
        A: ['да.', '/n да.', 'ок.', '/n ок.'],
        B: ['тут.', '/n тут.', 'да тут.', '/n да тут.'],
        C: ['здесь.', '/n здесь.', 'да здесь.', '/n да здесь.'],
        D: ['я тут.', '/n я тут.', 'тут я.', '/n тут я.'],
    },
    '4': {
        A: ['да да', '/n да да', 'ага ага', '/n ага ага'],
        B: ['тут тут', '/n тут тут', 'да тут тут', '/n да тут тут'],
        C: ['здесь здесь', '/n здесь здесь', 'да здесь здесь', '/n да здесь здесь'],
        D: ['я тут да тут', '/n тут тут я', 'тут я тут', '/n я да тут'],
    },
    '5': {
        A: ['так', '/n так', 'так так', '/n так так'],
        B: ['тут є', '/n тут є', 'єсть тут', '/n єсть тут'],
        C: ['здесь є', '/n здесь є', 'є здесь', '/n є здесь'],
        D: ['так тут', '/n так тут', 'тут я так', '/n тут я так'],
    },
    '6': {
        A: ['играю', '/n играю', 'да играю', '/n да играю'],
        B: ['тут сижу', '/n тут сижу', 'сижу тут', '/n сижу тут'],
        C: ['здесь сижу', '/n здесь сижу', 'сижу здесь', '/n сижу здесь'],
        D: ['играю тут', '/n играю тут', 'тут играю', '/n тут играю'],
    },
    '7': {
        A: ['ага конечно', '/n ага конечно', 'да конечно', '/n да конечно'],
        B: ['да я тут', '/n да я тут', 'тут нахожусь', '/n тут нахожусь'],
        C: ['я здесь нахожусь', '/n здесь нахожусь', 'да я здесь', '/n да я здесь'],
        D: ['тут я да', '/n тут я да', 'да здесь нахожусь', '/n да здесь нахожусь'],
    },
    '8': {
        A: ['да!', '/n да!', 'ага!', '/n ага!'],
        B: ['тут!', '/n тут!', 'да тут!', '/n да тут!'],
        C: ['здесь!', '/n здесь!', 'да здесь!', '/n да здесь!'],
        D: ['я тут!', '/n я тут!', 'тут я!', '/n тут я!'],
    },
};

// Порядок обхода групп — у каждого аккаунта свой, чтобы
// первый ответ тоже был разным между аккаунтами
const GROUP_ORDER = {
    '1': ['A', 'B', 'D', 'C'],
    '2': ['B', 'D', 'A', 'C'],
    '3': ['D', 'A', 'C', 'B'],
    '4': ['C', 'B', 'A', 'D'],
    '5': ['A', 'D', 'B', 'C'],
    '6': ['B', 'C', 'D', 'A'],
    '7': ['D', 'C', 'A', 'B'],
    '8': ['C', 'A', 'D', 'B'],
};

// ── Инициализация флага в config ──────────────────────────────
// По умолчанию ВЫКЛ — включается через глобальный toggle_kac
if (typeof config !== 'undefined' && config.kacAutoReply === undefined) {
    config.kacAutoReply = false;
}

// ── Состояние ─────────────────────────────────────────────────
const SAME_ADMIN_WINDOW_MS = 5 * 60 * 1000; // 5 минут

// adminName → { lastTime, lastGroup, lastReply, checkCount }
const _kacAdminHistory = {};

let _kacPending = false;
let _kacTimer   = null;

// ── Парсинг ника администратора из сообщения ──────────────────
function parseAdminName(msg) {
    const m = msg.match(/[Аа]дминистратор\s+([A-Za-z_]+)\[/);
    return m ? m[1].toLowerCase() : 'unknown';
}

// ── Выбор ответа ──────────────────────────────────────────────
function pickReply(adminName) {
    const accNum = String(window.ACCOUNT_NUMBER || '1');
    const groups = REPLY_GROUPS[accNum] || REPLY_GROUPS['1'];
    const order  = GROUP_ORDER[accNum]  || GROUP_ORDER['1'];

    const hist     = _kacAdminHistory[adminName] || { checkCount: 0 };
    const groupKey = order[hist.checkCount % order.length];
    const pool     = groups[groupKey];

    // Убираем последний использованный ответ из кандидатов
    const candidates = (hist.lastReply && pool.length > 1)
        ? pool.filter(r => r !== hist.lastReply)
        : pool;

    const reply = candidates[Math.floor(Math.random() * candidates.length)];
    return { reply, groupKey };
}

// ── Основной обработчик ───────────────────────────────────────
function handleKacAdminMessage(rawMsg) {
    // Проверяем флаг
    if (typeof config !== 'undefined' && !config.kacAutoReply) {
        debugLog('[KAC] Автоответ отключён (config.kacAutoReply = false)');
        return;
    }

    if (_kacPending) {
        debugLog('[KAC] Уже ожидаем ответа — пропускаем');
        return;
    }

    const adminName   = parseAdminName(rawMsg);
    const now         = Date.now();
    const hist        = _kacAdminHistory[adminName];
    const isSameAdmin = hist && (now - hist.lastTime < SAME_ADMIN_WINDOW_MS);

    // Первый раз — 20–31 сек, повтор от того же админа — 5–9 сек
    const delay = isSameAdmin
        ? 5000  + Math.floor(Math.random() * 4001)
        : 20000 + Math.floor(Math.random() * 11001);

    const { reply, groupKey } = pickReply(adminName);
    const delaySec = (delay / 1000).toFixed(1);

    _kacPending = true;

    debugLog(`[KAC] Админ: ${adminName} | Повтор: ${isSameAdmin} | Группа: ${groupKey} | Задержка: ${delaySec}с | Ответ: "${reply}"`);

    sendToTelegram(
        `🛡️ <b>Проверка КАЧ/ЗП (${displayName})</b>\n` +
        (isSameAdmin ? `🔁 <i>Повторно от ${adminName} — быстрый ответ</i>\n` : '') +
        `<code>${rawMsg.replace(/</g, '&lt;').slice(0, 200)}</code>\n` +
        `⏱ Ответ через <b>${delaySec}с</b>: <code>${reply}</code>`,
        false, null
    );

    _kacTimer = setTimeout(() => {
        try {
            sendChatInput(reply);
            debugLog(`[KAC] Отправлено: "${reply}"`);

            _kacAdminHistory[adminName] = {
                lastTime   : Date.now(),
                lastGroup  : groupKey,
                lastReply  : reply,
                checkCount : (hist ? hist.checkCount : 0) + 1,
            };

            sendToTelegram(
                `✅ <b>Автоответ отправлен (${displayName})</b>\n` +
                `<code>${reply}</code>`,
                false, null
            );
            addSessionLog(`🛡️ КАЧ/ЗП автоответ: ${reply}`);
        } catch (e) {
            debugLog(`[KAC] Ошибка отправки: ${e.message}`);
        }
        _kacPending = false;
        _kacTimer   = null;
    }, delay);
}

// ── Патч OnChatAddMessage ─────────────────────────────────────
const _kacOrigOnChat = window.OnChatAddMessage;
window.OnChatAddMessage = function(e, colorArg, t) {

    if (typeof _kacOrigOnChat === 'function') {
        _kacOrigOnChat.call(this, e, colorArg, t);
    }

    const msg        = String(e);
    const normalized = (typeof normalizeToCyrillic === 'function')
        ? normalizeToCyrillic(msg).toLowerCase()
        : msg.toLowerCase();

    if (!normalized.includes('кач') && !normalized.includes('зп')) return;

    const colorNorm = (typeof normalizeColor === 'function')
        ? normalizeColor(colorArg) : '';

    // Формат 1 — FF9945 прямой PM
    const isPrivatePM = colorNorm === '0xFF9945' &&
        /администратор\s+\S+\[\d+\]\s+для\s+/i.test(msg);

    // Формат 2 — {FF4444} broadcast уведомление
    const isBroadcastPM =
        /\{FF4444\}\[Уведомление от администратора\]/.test(msg) ||
        /\{FF4444\}.*администратор.*\{FFFFFF\}/i.test(msg);

    if (isPrivatePM || isBroadcastPM) {
        debugLog(`[KAC] Обнаружена проверка (${isPrivatePM ? 'PM' : 'broadcast'})`);
        handleKacAdminMessage(msg);
    }
};

debugLog('[KAC] Auto-Reply загружен. Аккаунт #' + (window.ACCOUNT_NUMBER || '?') + ' | Статус: ' + (typeof config !== 'undefined' ? (config.kacAutoReply ? 'ВКЛ' : 'ВЫКЛ') : '?'));

})();
// ==================== END ADMIN KAC/ZP AUTO-REPLY MODULE ====================

// ==================== WARNING CHECK MODULE ====================
// Автоматическая проверка выговоров через /find после загрузки профиля.
// Алгоритм:
//  1. Ждём загрузки профиля (config.accountInfo.profile.loaded === true)
//  2. Отправляем /find (без ника — открывается диалог со списком игроков)
//  3. Перехватываем диалог TABLIST_HEADERS с заголовком "В игре:"
//     — НЕ пропускаем его в Telegram (тихий режим)
//  4. Ищем строку с нашим ником
//     — Нашли → сохраняем X/3, закрываем диалог, обновляем сообщение
//     — Не нашли → листаем на следующую страницу через OnMultiDialogClickNavigButton
//  5. Если прошли все страницы и не нашли → выговоры = 0/3
// ==============================================================

(function () {
    'use strict';

    // ── Состояние ────────────────────────────────────────────────
    const warnCheck = {
        active:      false,
        nickname:    null,
        pageIndex:   0,       // Текущая страница (0-based)
        lastCount:   -1,      // Кол-во строк на прошлой странице (-1 = ещё не было)
        dialogId:    null,
        timeout:     null
    };

    // ── Утилиты ──────────────────────────────────────────────────
    function _strip(text) {
        return (text || '')
            .replace(/<t>/gi, ' ')
            .replace(/\{[A-Fa-f0-9]{6}\}/g, '')
            .replace(/<[^>]+>/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function _log(msg) {
        if (typeof debugLog === 'function') debugLog(msg);
        else console.log(msg);
    }

    // ── Отправить событие навигации — листнуть страницу вперёд ──
    function _navNext() {
        try {
            const evtType = (window.gm && window.gm.EVENT_EXECUTE_PUBLIC !== undefined)
                ? window.gm.EVENT_EXECUTE_PUBLIC : 0;
            _dlgOrigSendClientEvent(evtType, 'OnMultiDialogClickNavigButton',
                1, warnCheck.pageIndex, 0);
            _log(`[WARN] → Следующая страница (pageIndex=${warnCheck.pageIndex})`);
            warnCheck.pageIndex++;
        } catch (e) {
            _log('[WARN] Ошибка навигации: ' + e.message);
            _abort();
        }
    }

    // ── Закрыть диалог /find через серверный ответ ────────────────
    function _closeDialog(dialogId) {
        try {
            const evtType = (window.gm && window.gm.EVENT_EXECUTE_PUBLIC !== undefined)
                ? window.gm.EVENT_EXECUTE_PUBLIC : 0;
            _dlgOrigSendClientEvent(evtType, 'OnDialogResponse', dialogId, 0, -1, '');
            _log('[WARN] Диалог /find закрыт');
        } catch (e) {
            _log('[WARN] Ошибка закрытия диалога: ' + e.message);
        }
        try { window.closeLastDialog(); } catch (e) {}
    }

    // ── Найти выговоры в строке ────────────────────────────────────
    // Строка: "Nick_Name[ID] | Должность[ранг] - (статус) [ФРАКЦИЯ] | телефон [X / Y]"
    // Нас интересует последний паттерн [X / Y] — это выговоры.
    function _parseWarnings(row) {
        const m = row.match(/\[(\d+)\s*\/\s*(\d+)\]\s*$/);
        if (m) return { current: parseInt(m[1], 10), max: parseInt(m[2], 10) };
        const m2 = row.match(/(\d+)\s*\/\s*(\d+)\s*$/);
        if (m2) return { current: parseInt(m2[1], 10), max: parseInt(m2[2], 10) };
        return null;
    }

    // ── Обработать страницу /find ──────────────────────────────────
    function _processPage(dialogId, rawContent) {
        const contentStr = Array.isArray(rawContent)
            ? rawContent.join('<n>') : String(rawContent || '');
        const allRows = contentStr.split('<n>').map(_strip).filter(Boolean);

        if (allRows.length === 0) {
            _log('[WARN] Пустой диалог /find — завершаем с 0 выговоров');
            _finalize(dialogId, 0, 3);
            return;
        }

        // Первая строка — заголовок колонок (Имя | Должность | Телефон)
        const dataRows = allRows.slice(1);
        _log(`[WARN] Страница ${warnCheck.pageIndex}: ${dataRows.length} строк`);

        const targetNick = (warnCheck.nickname || '').trim();
        // RegExp: строка должна начинаться с нашего ника (возможно с номером "N. ")
        const re = new RegExp(
            '(?:^\\d+\\.\\s*)?' +
            targetNick.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
            '\\[',
            'i'
        );

        for (const row of dataRows) {
            if (re.test(row)) {
                _log(`[WARN] ✅ Найден: "${row}"`);
                const warnData = _parseWarnings(row);
                const cur = warnData ? warnData.current : 0;
                const max = warnData ? warnData.max     : 3;
                _finalize(dialogId, cur, max);
                return;
            }
        }

        // Не нашли — проверяем последняя ли это страница
        const isFinalPage = (warnCheck.lastCount >= 0 && dataRows.length < warnCheck.lastCount)
                         || dataRows.length === 0;
        warnCheck.lastCount = dataRows.length;

        if (isFinalPage) {
            _log('[WARN] Последняя страница, ник не найден → 0 выговоров');
            _finalize(dialogId, 0, 3);
        } else {
            _navNext();
        }
    }

    // ── Сохранить результат, закрыть диалог, обновить приветствие ─
    function _finalize(dialogId, current, max) {
        if (warnCheck.timeout) { clearTimeout(warnCheck.timeout); warnCheck.timeout = null; }
        warnCheck.active   = false;
        warnCheck.dialogId = null;

        _closeDialog(dialogId);

        const p = config.accountInfo.profile;
        if (p) {
            p.warnings        = current;
            p.maxWarnings     = max;
            p.warningsChecked = true;
        }
        _log(`[WARN] Выговоры: ${current}/${max} — сохранено в профиль`);

        setTimeout(function () {
            if (typeof sendWelcomeMessage === 'function') sendWelcomeMessage();
        }, 400);
    }

    // ── Прервать проверку (таймаут/ошибка) ───────────────────────
    function _abort() {
        if (warnCheck.timeout) { clearTimeout(warnCheck.timeout); warnCheck.timeout = null; }
        warnCheck.active   = false;
        warnCheck.dialogId = null;
        _log('[WARN] Проверка выговоров прервана (таймаут/ошибка)');
    }

    // ── Публичная точка входа ─────────────────────────────────────
    function startWarningCheck() {
        // Выговоры актуальны только для фракционных игроков
        if (!config.currentFaction) {
            _log('[WARN] Не во фракции — проверка выговоров пропущена');
            const p = config && config.accountInfo && config.accountInfo.profile;
            if (p) { p.warnings = 0; p.maxWarnings = 3; p.warningsChecked = true; }
            return;
        }
        const nick = (config && config.accountInfo && config.accountInfo.nickname) || null;
        if (!nick) {
            _log('[WARN] Ник не определён — откладываем проверку');
            return;
        }
        if (warnCheck.active) {
            _log('[WARN] Проверка уже идёт — пропускаем');
            return;
        }

        warnCheck.active    = true;
        warnCheck.nickname  = nick;
        warnCheck.pageIndex = 0;
        warnCheck.lastCount = -1;
        warnCheck.dialogId  = null;

        // Аварийный таймаут 30 секунд
        warnCheck.timeout = setTimeout(function () {
            _log('[WARN] ⏰ Таймаут 30 сек — прерываем');
            _abort();
        }, 30000);

        // Отправляем /find БЕЗ ника — откроется диалог со списком всех игроков
        // В этом диалоге ищем наш ник
        _log(`[WARN] Отправляем /find (ищем ник: ${nick})`);
        try { sendChatInput('/find'); } catch (e) {
            _log('[WARN] Ошибка отправки /find: ' + e.message);
            _abort();
        }
    }

    // ── Перехват addDialogInQueue (поверх существующего патча DIALOG MONITOR v2) ─
    const _warnPrevAddDialog = window.addDialogInQueue;

    window.addDialogInQueue = function (dialogParams, content, priority) {
        if (!warnCheck.active) {
            return _warnPrevAddDialog
                ? _warnPrevAddDialog.call(this, dialogParams, content, priority)
                : undefined;
        }

        try {
            if (dialogParams && typeof dialogParams === 'string') {
                const parsed   = JSON.parse(dialogParams.trim());
                const dialogId = parseInt(parsed[0], 10);
                const style    = parseInt(parsed[1], 10);
                const title    = _strip(parsed[2] || '');

                // style=5 = TABLIST_HEADERS; заголовок /find содержит "В игре:"
                if (style === 5 && /в игре/i.test(title)) {
                    _log(`[WARN] Перехвачен /find диалог id=${dialogId}, title="${title}"`);
                    warnCheck.dialogId = dialogId;

                    // Регистрируем в Vue (оригинальная игровая функция), но НЕ в Telegram
                    const gameResult = typeof _dlgOrigAddDialogInQueue === 'function'
                        ? _dlgOrigAddDialogInQueue.call(this, dialogParams, content, priority)
                        : undefined;

                    // Асинхронно (чтобы Vue успел отрисовать) парсим содержимое
                    setTimeout(function () {
                        _processPage(dialogId, content);
                    }, 80);

                    return gameResult;
                }
            }
        } catch (e) {
            _log('[WARN] Ошибка патча addDialogInQueue: ' + e.message);
        }

        return _warnPrevAddDialog
            ? _warnPrevAddDialog.call(this, dialogParams, content, priority)
            : undefined;
    };

    // ── Monkey-patch buildWelcomeAccountInfo ──────────────────────
    // Добавляем строку "Выговоры" в блок "Фракция / Звание", после "Статус".
    // "└ Статус: X\n"  →  "├ Статус: X\n└ ⚠️ Выговоры: X/3\n"
    const _origBuildWelcomeAccountInfo = (typeof buildWelcomeAccountInfo === 'function')
        ? buildWelcomeAccountInfo : null;

    if (_origBuildWelcomeAccountInfo) {
        window.buildWelcomeAccountInfo = buildWelcomeAccountInfo = function () {
            let block = _origBuildWelcomeAccountInfo.apply(this, arguments);
            try {
                const p = config && config.accountInfo && config.accountInfo.profile;
                if (!p) return block;

                let warnLine;
                if (p.warningsChecked && p.warnings !== null && p.warnings !== undefined) {
                    const cur  = p.warnings;
                    const max  = p.maxWarnings || 3;
                    // Если выговоров 0 — не отображаем строку вообще
                    if (cur === 0) return block;
                    const icon = cur >= max ? '🚫' : '⚠️';
                    warnLine = `${icon} <b>Выговоры:</b> ${cur}/${max}`;
                } else if (p.loaded && !p.warningsChecked && config.currentFaction) {
                    warnLine = '⏳ <b>Выговоры:</b> проверяем...';
                } else {
                    return block;
                }

                // Заменяем "└ Статус:" на "├ Статус:" и добавляем строку выговоров
                let replaced = false;
                block = block.replace(
                    /└ Статус: ([^\n]*)\n/,
                    (_, statusText) => { replaced = true; return `├ Статус: ${statusText}\n└ ${warnLine}\n`; }
                );
                if (!replaced) {
                    block = block.replace(
                        /(Статус: [^\n]*\n)/,
                        `$1└ ${warnLine}\n`
                    );
                }
                if (!block.includes(warnLine)) {
                    block += `\n└ ${warnLine}`;
                }
            } catch (e) {
                _log('[WARN] Ошибка monkey-patch buildWelcomeAccountInfo: ' + e.message);
            }
            return block;
        };
        _log('[WARN] buildWelcomeAccountInfo пропатчена — строка выговоров добавлена');
    } else {
        _log('[WARN] buildWelcomeAccountInfo не найдена — выговоры отображаться не будут');
    }

    // ── Автозапуск: ждём загрузки профиля, потом запускаем check ─
    (function _waitForProfile() {
        const p = config && config.accountInfo && config.accountInfo.profile;
        if (p && p.loaded && !p.warningsChecked) {
            // Вне фракции — пропускаем /find, выставляем 0 выговоров
            if (!config.currentFaction) {
                p.warnings = 0; p.maxWarnings = 3; p.warningsChecked = true;
                _log('[WARN] Не во фракции — выговоры не проверяем');
                return;
            }
            _log('[WARN] Профиль загружен → запускаем проверку выговоров через 2 сек');
            setTimeout(startWarningCheck, 2000);
        } else if (!p || !p.loaded) {
            setTimeout(_waitForProfile, 3000);
        }
        // Если warningsChecked уже true — ничего не делаем
    })();

    // Экспортируем для ручного вызова из Telegram (/find команда)
    window._hassleCheckWarnings = startWarningCheck;

    _log('[WARN] Модуль проверки выговоров загружен. /find запустится после загрузки профиля.');

})();
// ==================== END WARNING CHECK MODULE ====================



// Сигнал готовности — Code2.js ждёт этот флаг перед стартом
// Code2.js запускается прямо здесь — в нашем scope — чтобы видел все переменные
if (window.__CODE2_TEXT__) {
    eval(window.__CODE2_TEXT__);
    delete window.__CODE2_TEXT__;
}

// Экспортируем для вызова из Load.js (например, обновить велком после загрузки коммитов)
window.sendWelcomeMessage = sendWelcomeMessage;

window.__CODE_READY__ = true;
