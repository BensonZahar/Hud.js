// ==================== ВАЖНЫЕ ИЗМЕНЕНИЯ ====================
// ИСПРАВЛЕНА ПРОБЛЕМА С ОТВЕТАМИ ПРИ НЕСКОЛЬКИХ АККАУНТАХ
// 
// Проблема: Когда работают несколько аккаунтов, все они создавали
// одинаковый запрос "Введите ответ для..." и все обрабатывали одно 
// и то же сообщение, из-за чего приходилось отправлять ответ дважды.
//
// Решение: Добавлен уникальный идентификатор 🔑 ID: к каждому запросу.
// Теперь каждый аккаунт проверяет, что ответ предназначен именно ему.
//
// Изменения внесены в:
// 1. Запрос на ответ администратору (строка ~1673)
// 2. Обработка ответа администратору (строка ~1257)
// 3. Запрос на ввод сообщения (строка ~1589)
// 4. Обработка ввода сообщения (строка ~1241)
// ===========================================================

// END CONSTANTS MODULE //
// START GLOBAL STATE MODULE //
const globalState = {
    awaitingAfkAccount: false,
    awaitingAfkId: false,
    afkTargetAccount: null,
    lastWelcomeMessageId: null,
    lastPaydayMessageIds: [],
    isPrison: false,       // Флаг для игнора /rec при кике после посадки
    inPrison: false,       // Активный режим тюрьмы (скин 50)
    prisonTimeRequested: false, // Флаг: уже запросили /time
    prisonTimeTimer: null  // Таймер периодического опроса /time
};
// END GLOBAL STATE MODULE //
// START MESSAGE BUFFER MODULE //
// Буфер для НОН-РП ЧАТ, Сообщений игрока и НОН-РП Рации.
// Сообщения собираются и отправляются пачками раз в 35 секунд.
const MESSAGE_BUFFER_INTERVAL = 35000; // 35 секунд
const MESSAGE_BUFFER_MAX_LEN  = 3800;  // безопасный лимит Telegram (4096 - запас)
const _msgBuffer = {}; // ключ: topicId, значение: string[]

function pushToMessageBuffer(text, topicId) {
    if (!_msgBuffer[topicId]) _msgBuffer[topicId] = [];
    _msgBuffer[topicId].push(text);
}

function flushMessageBuffer() {
    try {
        for (const topicId in _msgBuffer) {
            const lines = _msgBuffer[topicId];
            if (!lines || lines.length === 0) continue;
            delete _msgBuffer[topicId];

            // Разбиваем на порции, не превышающие MESSAGE_BUFFER_MAX_LEN
            let chunk = '';
            for (const line of lines) {
                const separator = chunk ? '\n\n' : '';
                if ((chunk + separator + line).length > MESSAGE_BUFFER_MAX_LEN) {
                    if (chunk) sendToTelegramTopic(chunk, topicId, true);
                    chunk = line;
                } else {
                    chunk += separator + line;
                }
            }
            if (chunk) sendToTelegramTopic(chunk, topicId, true);
        }
    } catch (e) {
        debugLog(`[MSG_BUFFER] Ошибка флаша: ${e.message}`);
    }
    setTimeout(flushMessageBuffer, MESSAGE_BUFFER_INTERVAL);
}
// Запускаем таймер флаша (первый запуск через 35 секунд)
setTimeout(flushMessageBuffer, MESSAGE_BUFFER_INTERVAL);
// END MESSAGE BUFFER MODULE //
// START PENDING INPUTS MODULE (iOS fix) //
// Хранит ожидаемые вводы для совместимости с iOS (без reply)
// Ключ: `${chatId}_${uniqueId}`, значение: { type, timestamp }
const pendingInputs = {};
const PENDING_INPUT_TTL = 45 * 1000; // 45 секунд (было 5 минут — слишком долго для мультиаккаунта)
// END PENDING INPUTS MODULE //
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
    let normalized = color.toString().toUpperCase();
    if (normalized.startsWith('#')) normalized = normalized.slice(1);
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
    }
};
// END FACTIONS MODULE //
// START CONFIG MODULE //
const userConfig = {
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
    locationKeywords: ["местоположение", "место", "позиция", "координаты", "нахож"],
    radioOfficialNotifications: true,
    warningNotifications: true,
    notificationDeleteDelay: 5000,
    trackSkinId: true,
    skinCheckInterval: 5000,
    autoReconnectEnabled: RECONNECT_ENABLED_DEFAULT // <-- используем константу
};
const config = {
    ...userConfig,
    lastUpdateId: 0,
    activeUsers: {},
    lastPodbrosTime: 0,
    podbrosCounter: 0,
    initialized: false,
    accountInfo: { nickname: null, server: null, skinId: null },
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
const defaultToken = DEFAULT_TOKEN;
// Токен берётся по номеру аккаунта из List.js (ACCOUNT_BOT_TOKENS), установленному через установщик
const accountToken = window.ACCOUNT_TOKEN || defaultToken;
let displayName = `User [S${config.accountInfo.server || 'Не указан'}]`;
let uniqueId = `${config.accountInfo.nickname}_${config.accountInfo.server}`;
const reconnectionCommand = RECONNECT_ENABLED_DEFAULT ? "/rec 5" : "/q";
// END CONFIG MODULE //
// START AUTO LOGIN MODULE //
// Настройка автовхода
// ИСПРАВЛЕНО: enabled теперь берётся из константы AUTO_LOGIN_ENABLED (List.js),
// как это сделано с RECONNECT_ENABLED_DEFAULT. Добавь в List.js:
//   const AUTO_LOGIN_ENABLED = true; // или false для отключения
const autoLoginConfig = {
    password: PASSWORD, // Ваш пароль
    enabled: (typeof AUTO_LOGIN_ENABLED !== 'undefined') ? AUTO_LOGIN_ENABLED : true, // Управляется из List.js
    maxAttempts: 10, // Максимум попыток
    attemptInterval: 1000 // Интервал между попытками (мс)
};
// Функция для автоматического ввода пароля
function setupAutoLogin(attempt = 1) {
    if (!autoLoginConfig.enabled) {
        debugLog('Автовход отключен');
        return;
    }
    if (attempt > autoLoginConfig.maxAttempts) {
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
                sendToTelegram(`✅ Автовход выполнен для ${displayName}`, true, null); // Без звука
                // PDC: если строй прервал отыгровку — возобновляем
                setTimeout(() => pdcOnReloginAfterStroi(), 3000);
                // Уведомление через 3 секунды после успешного входа
                setTimeout(() => {
                    showScreenNotification(
                        "HASSLE", 
                        "Скрипт загружен.<br>Меню /hb или Телеграмм.", 
                        "FFFF00",   // жёлтый цвет
                        6000        // видно 6 секунд (можно изменить)
                    );
                }, 3000);

            } catch (err) {
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
    // Проверяем, открыт ли интерфейс Authorization
    if (window.getInterfaceStatus("Authorization")) {
        debugLog('Интерфейс Authorization уже открыт, запускаем автовход');
        setupAutoLogin();
    } else {
        // Открываем интерфейс Authorization с параметрами
        // ИСПРАВЛЕНО: пароль передаётся только если автовход включён,
        // иначе игровой движок мог входить сам по паролю из openParams
        const openParams = [
            "auth", // Страница авторизации
            config.accountInfo.nickname || "Pavel_Nabokov", // Логин (замените на ваш, если известен)
            "", // Сервер
            "", // Бонусы
            "", // Хэллоуин
            "", // Новый год
            "", // Пасха
            "https://radmir.online/recovery-password", // Восстановление пароля
            { // Дополнительные параметры
                autoLogin: {
                    password: autoLoginConfig.enabled ? autoLoginConfig.password : '', // ← пароль только если enabled
                    enabled: autoLoginConfig.enabled
                }
            }
        ];
        debugLog(`Открываем интерфейс Authorization для ${displayName}`);
        try {
            window.openInterface("Authorization", JSON.stringify(openParams));
        } catch (err) {
            debugLog(`Ошибка при открытии Authorization: ${err.message}`);
            sendToTelegram(`❌ <b>Ошибка ${displayName}</b>\nНе удалось открыть интерфейс Authorization\n<code>${err.message}</code>`, false, null);
            return;
        }
        // Ожидаем открытия интерфейса
        let attempts = 0;
        const checkInterval = setInterval(() => {
            attempts++;
            if (window.getInterfaceStatus("Authorization")) {
                clearInterval(checkInterval);
                debugLog('Интерфейс Authorization открыт, запускаем автовход');
                setTimeout(setupAutoLogin, 1000); // Задержка для полной инициализации
            } else if (attempts >= autoLoginConfig.maxAttempts) {
                clearInterval(checkInterval);
                const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось открыть Authorization после ${autoLoginConfig.maxAttempts} попыток`;
                debugLog(errorMsg);
                sendToTelegram(errorMsg, false, null);
            } else {
                debugLog(`Попытка ${attempts}: Ожидание открытия Authorization`);
            }
        }, autoLoginConfig.attemptInterval);
    }
}
// Перехват window.openInterface для автоматического входа (хуком)
// ИСПРАВЛЕНО: добавлена проверка autoLoginConfig.enabled — без неё хук вызывал
// initializeAutoLogin даже при disabled, и создавал двойной цикл вызовов
const originalOpenInterface = window.openInterface;
window.openInterface = function(interfaceName, params, additionalParams) {
    const result = originalOpenInterface.call(this, interfaceName, params, additionalParams);
    if (interfaceName === "Authorization" && autoLoginConfig.enabled) { // ← проверка enabled
        debugLog(`[${displayName}] Открыт интерфейс Authorization, инициализация автовхода`);
        setTimeout(initializeAutoLogin, 500); // Задержка для инициализации компонента
    }
    return result;
};
// END AUTO LOGIN MODULE //
// START SHARED STORAGE MODULE //
// localStorage не работает в CEF-среде — используем in-memory переменную
// При перезагрузке (/reload) восстанавливаем lastUpdateId из window, чтобы не получить
// тот же /reload повторно и не попасть в бесконечный цикл перезагрузок.
let _sharedLastUpdateId = (typeof window._hassleLastUpdateId === 'number' && window._hassleLastUpdateId > 0)
    ? window._hassleLastUpdateId
    : 0;
function getSharedLastUpdateId() {
    return _sharedLastUpdateId;
}
function setSharedLastUpdateId(id) {
    _sharedLastUpdateId = id;
    debugLog(`Обновлён shared lastUpdateId: ${id}`);
}
// END SHARED STORAGE MODULE //
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
// END DEBUG AND UTILS MODULE //
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
function updateFaction() {
    const skinId = Number(config.accountInfo.skinId); // Приводим к числу
    if (!skinId) return;
    for (const faction in factions) {
        if (factions[faction].skins.includes(skinId)) {
            if (config.currentFaction !== faction) {
                config.currentFaction = faction;
                debugLog(`Фракция обновлена: ${faction} (Skin ID: ${skinId})`);
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
    try {
        const nickname = window.interface("Menu").$store.getters["menu/nickName"];
        const serverId = window.interface("Menu").$store.getters["menu/selectedServer"];
        if (nickname && serverId && !config.nicknameLogged) {
            console.log(`nickname: ${nickname}, Server: ${serverId}`);
            config.nicknameLogged = true;
            config.accountInfo.nickname = nickname;
            config.accountInfo.server = serverId.toString();
            config.botToken = accountToken;
            debugLog(`Установлен botToken для аккаунта #${window.ACCOUNT_NUMBER}: ${config.botToken}`);
            updateDisplayName(); // Обновляем displayName при получении ника
            uniqueId = `${config.accountInfo.nickname}_${config.accountInfo.server}`;
            sendWelcomeMessage();
            registerUser();
            // Запуск отслеживания скина с задержкой 5с
            setTimeout(() => {
                const initialSkin = getSkinIdFromStore();
                if (initialSkin !== null) {
                    config.accountInfo.skinId = initialSkin;
                    debugLog(`Initial Skin ID after login: ${initialSkin}`);
                    updateFaction(); // Обновляем фракцию
                    // Проверка: если скин 50 при входе = аккаунт в тюрьме
                    if (Number(initialSkin) === 50) {
                        startPrisonMode();
                    }
                }
                trackSkinId();
            }, 5000);
        } else if (!nickname || !serverId) {
            debugLog(`Ник или сервер не получены: nickname=${nickname}, server=${serverId}`);
        }
    } catch (e) {
        debugLog(`Ошибка при получении ника/сервера: ${e.message}`);
    }
    setTimeout(trackNicknameAndServer, 900);
}
// END PLAYER INFO MODULE //
// START TELEGRAM API MODULE //
function createButton(text, command) {
    return {
        text: text,
        callback_data: command
    };
}
function deleteMessage(chatId, messageId) {
    const url = `https://api.telegram.org/bot${config.botToken}/deleteMessage`;
    const payload = {
        chat_id: chatId,
        message_id: messageId
    };
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(payload));
}
// Функция спам-пингов при обнаружении администратора.
// Отправляет 15 сообщений каждые 2 секунды — каждое удаляет предыдущее.
// Следующий пинг запускается строго внутри onload, после получения message_id.
// Последнее (15-е) сообщение остаётся навсегда.
function sendAdminSpamAlert(adminMsg) {
    const TOTAL_PINGS = 9;
    const INTERVAL_MS = 2000;
    const replyMarkup = getNotificationReplyMarkup();

    config.chatIds.forEach(chatId => {
        let pingCount = 0;
        let lastMessageId = null;

        function sendPing() {
            if (window._hassleReloading) return;
            pingCount++;
            const pingText =
                `⚠️ <b>АДМИН! ОТВЕТЬ! (${pingCount}/${TOTAL_PINGS})</b>\n` +
                `🚨 <b>Обнаружен администратор! (${displayName})</b>\n` +
                `<code>${adminMsg.replace(/</g, '&lt;')}</code>`;

            if (lastMessageId) {
                deleteMessage(chatId, lastMessageId);
                lastMessageId = null;
            }

            const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
            const payload = {
                chat_id: chatId,
                text: pingText,
                parse_mode: 'HTML',
                disable_notification: false,
                reply_markup: replyMarkup ? JSON.stringify(replyMarkup) : undefined
            };
            const xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onload = function() {
                if (xhr.status === 200) {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        lastMessageId = data.result.message_id;
                    } catch (e) {
                        debugLog(`[AdminSpam] Ошибка парсинга: ${e.message}`);
                    }
                }
                if (pingCount < TOTAL_PINGS) {
                    setTimeout(sendPing, INTERVAL_MS);
                }
            };
            xhr.onerror = function() {
                debugLog(`[AdminSpam] Ошибка сети при пинге ${pingCount}`);
                if (pingCount < TOTAL_PINGS) {
                    setTimeout(sendPing, INTERVAL_MS);
                }
            };
            xhr.send(JSON.stringify(payload));
        }

        sendPing();
    });
}
function sendToTelegram(message, silent = false, replyMarkup = null, deleteAfter = null) {
    config.chatIds.forEach(chatId => {
        const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
        const payload = {
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML',
            disable_notification: silent,
            reply_markup: replyMarkup ? JSON.stringify(replyMarkup) : undefined
        };
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function() {
            if (xhr.status === 200) {
                debugLog(`Сообщение отправлено в Telegram чат ${chatId}`);
                const data = JSON.parse(xhr.responseText);
                const messageId = data.result.message_id;
                // Сохраняем ID приветственного сообщения
                if (message.includes('Hassle | Bot TG') && message.includes('Текущие настройки')) {
                    globalState.lastWelcomeMessageId = messageId;
                }
                // Сохраняем ID PayDay сообщения
                if (message.includes('+ PayDay |')) {
                    globalState.lastPaydayMessageIds.push({ chatId, messageId });
                }
            } else {
                debugLog(`Ошибка Telegram API для чата ${chatId}:`, xhr.status, xhr.responseText);
            }
        };
        xhr.onerror = function() {
            debugLog(`Ошибка сети при отправке в чат ${chatId}`);
        };
        xhr.send(JSON.stringify(payload));
    });
}
function editMessageReplyMarkup(chatId, messageId, replyMarkup) {
    const url = `https://api.telegram.org/bot${config.botToken}/editMessageReplyMarkup`;
    const payload = {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: replyMarkup
    };
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(payload));
}
function editMessageText(chatId, messageId, text, replyMarkup = null) {
    const url = `https://api.telegram.org/bot${config.botToken}/editMessageText`;
    const payload = {
        chat_id: chatId,
        message_id: messageId,
        text: text,
        parse_mode: 'HTML',
        reply_markup: replyMarkup ? JSON.stringify(replyMarkup) : undefined
    };
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status === 200) {
            debugLog(`Сообщение отредактировано в Telegram чате ${chatId}`);
        } else {
            debugLog(`Ошибка редактирования сообщения в чате ${chatId}:`, xhr.status, xhr.responseText);
        }
    };
    xhr.onerror = function() {
        debugLog(`Ошибка сети при редактировании в чате ${chatId}`);
    };
    xhr.send(JSON.stringify(payload));
}
// Новая функция для подтверждения callback_query
function answerCallbackQuery(callbackQueryId) {
    const url = `https://api.telegram.org/bot${config.botToken}/answerCallbackQuery`;
    const payload = {
        callback_query_id: callbackQueryId
    };
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status === 200) {
            debugLog(`Callback_query ${callbackQueryId} подтверждён`);
        } else {
            debugLog(`Ошибка подтверждения callback_query ${callbackQueryId}: ${xhr.status}`);
        }
    };
    xhr.send(JSON.stringify(payload));
}
// END TELEGRAM API MODULE //
// Отправка в тему (message_thread_id) — для перенаправления рации в "Офф уведы"
function sendToTelegramTopic(message, topicId, silent = true) {
    config.chatIds.forEach(chatId => {
        const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
        const payload = {
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML',
            disable_notification: silent,
            message_thread_id: parseInt(topicId)
        };
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function() {
            if (xhr.status === 200) {
                debugLog(`Сообщение отправлено в тему ${topicId} чата ${chatId}`);
            } else {
                debugLog(`Ошибка отправки в тему ${topicId} чата ${chatId}: ${xhr.status}`);
            }
        };
        xhr.onerror = function() {
            debugLog(`Ошибка сети при отправке в тему ${topicId}`);
        };
        xhr.send(JSON.stringify(payload));
    });
}
// START WELCOME MESSAGE MODULE //
function sendWelcomeMessage() {
    if (!config.accountInfo.nickname) {
        debugLog('Ник не определен, откладываем отправку приветственного сообщения');
        return;
    }
    const playerIdDisplay = config.lastPlayerId ? ` (ID: ${config.lastPlayerId})` : '';
    const message = `🟢 <b>Hassle | Bot v2</b>\n` +
        `Ник: ${config.accountInfo.nickname}${playerIdDisplay}\n` +
        `Сервер: ${config.accountInfo.server || 'Не указан'}\n\n` +
        `🔔 <b>Текущие настройки:</b>\n` +
        `├ Уведомления PayDay: ${config.paydayNotifications ? '🟢 ВКЛ' : '🔴 ВЫКЛ'}\n` +
        `├ Уведомления от сотрудников: ${config.govMessagesEnabled ? '🟢 ВКЛ' : '🔴 ВЫКЛ'}\n` +
        `├ Уведомления рации: ${config.radioOfficialNotifications ? '🟢 ВКЛ' : '🔴 ВЫКЛ'}\n` +
        `├ Уведомления выговоры: ${config.warningNotifications ? '🟢 ВКЛ' : '🔴 ВЫКЛ'}\n` +
        `└ Отслеживание местоположения: ${config.trackLocationRequests ? '🟢 ВКЛ' : '🔴 ВЫКЛ'}`;
    const replyMarkup = {
        inline_keyboard: [
            [createButton("⚙️ Управление", `show_controls_${uniqueId}`)]
        ]
    };
    config.chatIds.forEach(chatId => {
        if (globalState.lastWelcomeMessageId) {
            editMessageText(chatId, globalState.lastWelcomeMessageId, message, replyMarkup);
        } else {
            // Если нет ID, отправляем новое и сохраняем ID в onload sendToTelegram
            sendToTelegram(message, false, replyMarkup);
        }
    });
}
// END WELCOME MESSAGE MODULE //
// START AFK MODULE //
// Функция для обновления статуса AFK в одном редактируемом сообщении
function getAFKStatusText() {
    if (!config.afkCycle.active) return '';
    const modeText = config.afkCycle.mode === 'fixed' ? '5 мин играем, 5 мин пауза' :
        config.afkCycle.mode === 'random' ? 'рандомное время игры/паузы' :
        config.afkCycle.mode === 'levelup' ? 'прокачка уровня (10 мин игры без пауз)' :
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
    if (config.afkCycle.mode === 'none' || config.afkCycle.mode === 'levelup') {
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
            const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
            const payload = {
                chat_id: chatId,
                text: fullText,
                parse_mode: 'HTML'
            };
            const xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onload = function() {
                if (xhr.status === 200) {
                    const data = JSON.parse(xhr.responseText);
                    const messageId = data.result.message_id;
                    config.afkCycle.statusMessageIds.push({ chatId, messageId });
                    debugLog(`Новое AFK статус-сообщение отправлено в чат ${chatId}: ID ${messageId}`);
                }
            };
            xhr.send(JSON.stringify(payload));
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
    const requiredPlayTime = (config.afkCycle.mode === 'levelup') ? 10 * 60 * 1000 : 25 * 60 * 1000;
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
        if (config.afkCycle.totalPlayTime < requiredPlayTime && config.afkCycle.mode !== 'none' && config.afkCycle.mode !== 'levelup') {
            startPausePhase();
        } else {
            debugLog(`Отыграно ${requiredPlayTime / 60000} минут для ${displayName}`);
            handleCycleEnd();
        }
    }, playDurationMs);
}
function handleCycleEnd() {
    if (config.afkCycle.mode === 'levelup') {
        handleLevelUpEnd();
    } else if (config.afkCycle.mode === 'none' && config.afkCycle.reconnectEnabled) {
        handleNoneReconnectEnd();
    } else {
        enterPauseUntilEnd();
    }
}
function handleLevelUpEnd() {
    autoLoginConfig.enabled = false;
    sendChatInput("/rec 5");
    sendToTelegram(`🔄 <b>LevelUp: Отключен автовход и отправлен /rec 5 (${displayName})</b>` + getAFKStatusText());
    const timePassed = Date.now() - config.afkCycle.startTime;
    const timeToReconnect = 59 * 60 * 1000 - timePassed;
    if (timeToReconnect > 0) {
        setTimeout(() => {
            autoLoginConfig.enabled = true;
            sendChatInput("/rec 5");
            sendToTelegram(`🔄 <b>LevelUp: Включен автовход и отправлен /rec 5 (${displayName})</b>`);
        }, timeToReconnect);
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
    const modeText = config.afkCycle.mode === 'fixed' ? '5 мин играем, 5 мин пауза' : config.afkCycle.mode === 'random' ? 'рандомное время игры/паузы' : config.afkCycle.mode === 'levelup' ? 'прокачка уровня (10 мин игры без пауз)' : 'без пауз';
    debugLog(`Обнаружено сообщение "Текущее время:", начинаем AFK цикл для ${displayName}`);
    updateAFKStatus(); // Обновляем с начальным статусом
    startPlayPhase();
}
// END AFK MODULE //
// ==================== START PAYDAY CYCLE MODULE ====================
// Цикл: вход → 30с → отыгровка 25-26 мин → авторизация → ждём :59 → вход → пэйдэй → повтор
// Включение/выключение на одном аккаунте → все аккаунты реагируют (общий chatId)
// Аккаунты заходят со сдвигом 20-25 сек (по номеру аккаунта), localStorage НЕ используется

const pdCycle = {
    active: false,
    phase: 'idle',    // 'idle' | 'initial' | 'playing' | 'auth_wait' | 'reconnecting' | 'stroi_interrupted'
    playTimer: null,
    authTimer: null,
    startTimer: null,
    playStartTime: null,
    cycleCount: 0,
    totalPlayedMs: 0,    // накопленное игровое время с последнего PayDay
    stroiInterrupted: false  // флаг: строй прервал отыгровку
};

// Сдвиг для данного аккаунта: (номер - 1) × 20-25 сек, чтоб не заходили одновременно
// Стаггер при первом старте: 20–25 сек между аккаунтами
function pdcGetStartStagger() {
    const num = parseInt(window.ACCOUNT_NUMBER) || 1;
    const perAcc = Math.floor(Math.random() * 5001) + 20000; // 20 000 – 25 000 мс
    return (num - 1) * perAcc;
}
// Стаггер при реконнекте перед пэйдэем: 5–10 сек между аккаунтами
// #1=0с, #2=5-10с, ..., #8=35-70с — все в игре до :00
function pdcGetReconnectStagger() {
    const num = parseInt(window.ACCOUNT_NUMBER) || 1;
    const perAcc = Math.floor(Math.random() * 5001) + 5000; // 5 000 – 10 000 мс
    return (num - 1) * perAcc;
}

// Миллисекунды до следующей :59:00
// Сколько мс до момента когда надо слать /rec 5 перед пэйдэем.
// PayDay в :00, /rec 5 занимает ~25 сек → шлём за 85 сек до :00 (= :58:35)
// Аналогично строю: строй шлёт за 60 сек, мы шлём на 25 сек раньше с учётом подключения
function pdcMsUntilReenter() {
    const now    = new Date();
    const nowMs  = now.getMinutes() * 60000 + now.getSeconds() * 1000 + now.getMilliseconds();
    const hourMs = 60 * 60000;
    let msUntil00 = hourMs - nowMs;          // мс до следующего :00:00
    if (msUntil00 <= 0) msUntil00 += hourMs;
    let result = msUntil00 - 85000;          // за 85 сек до :00
    if (result <= 0) result += hourMs;       // уже прошло — следующий час
    return result;
}

// Очистить все таймеры цикла
function pdcClearTimers() {
    ['playTimer', 'authTimer', 'startTimer'].forEach(t => {
        if (pdCycle[t]) { clearTimeout(pdCycle[t]); pdCycle[t] = null; }
    });
}

// Сколько мс до следующего :00:00
function pdcMsUntil00() {
    const now   = new Date();
    const nowMs = now.getMinutes() * 60000 + now.getSeconds() * 1000 + now.getMilliseconds();
    let result  = 60 * 60000 - nowMs;
    if (result <= 0) result += 60 * 60000;
    return result;
}

// Сохраняем отыгранное время текущей сессии в totalPlayedMs
// (вызывать перед любым прерыванием play-фазы)
function pdcSnapshotPlay() {
    if (pdCycle.phase === 'playing' && pdCycle.playStartTime) {
        const elapsed = Date.now() - pdCycle.playStartTime;
        pdCycle.totalPlayedMs += elapsed;
        pdCycle.playStartTime = null;
        debugLog(`[PDC] Snapshot: +${Math.round(elapsed/1000)}с → итого ${Math.round(pdCycle.totalPlayedMs/1000)}с`);
    }
}

// Вызывается из performStroiReconnect когда PDC-цикл активен и мы в фазе 'playing'
function pdcOnStroiInterrupt() {
    if (!pdCycle.active || pdCycle.phase !== 'playing') return;
    pdcClearTimers();      // останавливаем playTimer — строй сам управляет реконнектом
    pdcSnapshotPlay();     // сохраняем сколько отыграли

    pdCycle.phase            = 'stroi_interrupted';
    pdCycle.stroiInterrupted = true;

    const playedMin  = Math.floor(pdCycle.totalPlayedMs / 60000);
    const playedSec  = Math.floor((pdCycle.totalPlayedMs % 60000) / 1000);
    const remaining  = Math.max(0, 25 * 60000 - pdCycle.totalPlayedMs);
    const remMin     = Math.floor(remaining / 60000);
    const remSec     = Math.floor((remaining % 60000) / 1000);

    sendToTelegram(
        `⚠️ <b>Строй прервал отыгровку! (${displayName})</b>
` +
        `✅ Отыграно: ${playedMin} мин ${playedSec} сек
` +
        `⏳ Осталось: ${remMin} мин ${remSec} сек до 25 мин
` +
        `🔄 Строй обрабатывает реконнект — после входа продолжим`,
        false, null
    );
    debugLog(`[PDC] Строй прервал. Отыграно ${playedMin}м ${playedSec}с, осталось ${remMin}м ${remSec}с`);
}

// Вызывается из setupAutoLogin после успешного входа в игру
// Если строй прервал отыгровку — возобновляем
function pdcOnReloginAfterStroi() {
    if (!pdCycle.active || !pdCycle.stroiInterrupted) return;
    pdCycle.stroiInterrupted = false;

    const remaining = Math.max(0, 25 * 60000 - pdCycle.totalPlayedMs);
    const msUntil00 = pdcMsUntil00();
    // Запас: 90с (85с до :00 + ~5с на вход+загрузку)
    const BUFFER_MS = 90000;

    if (remaining === 0) {
        // Уже отыграли 25 мин — просто ждём пэйдэй
        pdCycle.phase = 'reconnecting';
        const minLeft = Math.floor(msUntil00 / 60000);
        const secLeft = Math.floor((msUntil00 % 60000) / 1000);
        sendToTelegram(
            `✅ <b>Вернулись после строя (${displayName})</b>
` +
            `💰 25 мин уже отыграны — ждём PayDay через ${minLeft} мин ${secLeft} сек`,
            false, null
        );
        return;
    }

    if (msUntil00 - BUFFER_MS >= remaining) {
        // Успеваем доиграть
        const remMin = Math.floor(remaining / 60000);
        const remSec = Math.floor((remaining % 60000) / 1000);
        sendToTelegram(
            `▶️ <b>Возобновляем отыгровку после строя (${displayName})</b>
` +
            `⏳ Осталось доиграть: ${remMin} мин ${remSec} сек
` +
            `🕐 До PayDay: ${Math.floor((msUntil00)/60000)} мин`,
            false, null
        );
        debugLog(`[PDC] Возобновляем: осталось ${remMin}м ${remSec}с, до :00 ${Math.floor(msUntil00/60000)}м`);
        // Не прибавляем cycleCount — это продолжение той же отыгровки
        pdCycle.phase         = 'playing';
        pdCycle.playStartTime = Date.now();
        pdCycle.playTimer     = setTimeout(() => pdcEndPlay(), remaining);
    } else if (msUntil00 > BUFFER_MS + 5 * 60000) {
        // Времени мало, но хоть что-то доиграем (> 5 мин до :00)
        const canPlay = msUntil00 - BUFFER_MS;
        const canMin  = Math.floor(canPlay / 60000);
        const canSec  = Math.floor((canPlay % 60000) / 1000);
        sendToTelegram(
            `⚠️ <b>Не успеваем доиграть 25 мин (${displayName})</b>
` +
            `⏳ Нужно ещё: ${Math.floor(remaining/60000)} мин, есть: ${canMin} мин ${canSec} сек
` +
            `▶️ Играем сколько успеем`,
            false, null
        );
        pdCycle.phase         = 'playing';
        pdCycle.playStartTime = Date.now();
        pdCycle.playTimer     = setTimeout(() => pdcEndPlay(), canPlay);
    } else {
        // До :00 < 5 мин — уже не успеть ничего, просто ждём
        pdCycle.phase = 'reconnecting';
        sendToTelegram(
            `⏰ <b>До PayDay меньше 5 мин (${displayName})</b>
` +
            `💤 Ждём пэйдэй — не успеваем набрать 25 мин`,
            false, null
        );
        debugLog(`[PDC] До :00 < 5 мин — ждём пэйдэй без отыгровки`);
    }
}

// Запустить цикл (из кнопки или команды — все аккаунты получают через общий chatId)
function pdcStart() {
    if (pdCycle.active) {
        sendToTelegram(`⏱️ <b>PayDay цикл уже активен (${displayName})</b>`, true, null);
        return;
    }
    pdcClearTimers();
    pdCycle.active   = true;
    pdCycle.phase    = 'initial';
    pdCycle.cycleCount = 0;

    const stagger = pdcGetStartStagger();
    const totalDelay = stagger + 30000; // сдвиг + 30 сек после входа

    sendToTelegram(
        `⏱️ <b>PayDay цикл запущен! (${displayName})</b>\n` +
        `🔢 Аккаунт #${window.ACCOUNT_NUMBER || '?'}, сдвиг: ${Math.round(stagger / 1000)} сек\n` +
        `▶️ Отыгровка начнётся через ${Math.round(totalDelay / 1000)} сек`,
        true, null
    );

    debugLog(`[PDC] Старт. Аккаунт #${window.ACCOUNT_NUMBER || '?'}, задержка ${Math.round(totalDelay / 1000)}с`);
    pdCycle.startTimer = setTimeout(() => pdcBeginPlay(), totalDelay);
}

// Начало фазы отыгровки
function pdcBeginPlay() {
    if (!pdCycle.active) return;
    pdcClearTimers();

    // Выходим с паузы если вдруг на ней
    try { if (typeof closeInterface === 'function') closeInterface("PauseMenu"); } catch(e) {}

    pdCycle.cycleCount++;
    pdCycle.phase         = 'playing';
    pdCycle.playStartTime = Date.now();

    const REQUIRED_MS = 25 * 60000;
    const remaining   = Math.max(0, REQUIRED_MS - pdCycle.totalPlayedMs);

    let playMs;
    if (remaining <= 0) {
        // Уже отыграно 25+ мин (напр. сразу после строя) — не нужна отыгровка
        pdCycle.phase = 'reconnecting';
        sendToTelegram(
            `✅ <b>25 мин уже отыграны (${displayName})</b>\n` +
            `💰 Ждём PayDay`,
            true, null
        );
        debugLog(`[PDC] 25 мин уже набраны (${Math.round(pdCycle.totalPlayedMs/60000)} мин), ждём PayDay`);
        return;
    }

    // Рандом +0–60с сверху только если это первая отыгровка без накопленного времени
    const extra  = (pdCycle.totalPlayedMs === 0) ? Math.floor(Math.random() * 60001) : 0;
    playMs       = remaining + extra;

    const minStr = Math.floor(playMs / 60000);
    const secStr = Math.floor((playMs % 60000) / 1000);
    const playedMin = Math.floor(pdCycle.totalPlayedMs / 60000);

    sendToTelegram(
        `▶️ <b>Отыгровка #${pdCycle.cycleCount} (${displayName})</b>\n` +
        `⏱ ${minStr} мин ${secStr} сек` +
        (pdCycle.totalPlayedMs > 0 ? `\n📊 Уже отыграно: ${playedMin} мин` : ''),
        true, null
    );
    debugLog(`[PDC] Отыгровка #${pdCycle.cycleCount}: ${minStr}м ${secStr}с (накоплено ${playedMin}м)`);

    pdCycle.playTimer = setTimeout(() => pdcEndPlay(), playMs);
}

// Конец отыгровки → выход из игры, ждём :58:35
function pdcEndPlay() {
    if (!pdCycle.active) return;
    pdcClearTimers();
    pdcSnapshotPlay();    // сохраняем время текущей сессии
    pdCycle.phase = 'auth_wait';

    // Как в строе: отключаем автовход и /rec 5 — висим на авторизации
    autoLoginConfig.enabled = false;
    sendChatInput('/rec 5');

    // Реконнект: за 85 сек до :00 (= :58:35) + индивидуальный сдвиг 5–10 сек
    // Аккаунт #1 в :58:35, #2 в :58:40–45, ..., #8 в :59:20–27 — все до :00
    const reStagger  = pdcGetReconnectStagger();
    const totalMs    = pdcMsUntilReenter() + reStagger;
    const minLeft    = Math.floor(totalMs / 60000);
    const secLeft    = Math.floor((totalMs % 60000) / 1000);

    sendToTelegram(
        `🔒 <b>Авторизация (${displayName})</b>\n` +
        `✅ Отыгровка #${pdCycle.cycleCount} завершена\n` +
        `⏰ /rec 5 через ${minLeft} мин ${secLeft} сек\n` +
        `🔢 Сдвиг #${window.ACCOUNT_NUMBER || '?'}: +${Math.round(reStagger / 1000)} сек от :58:35`,
        true, null
    );
    debugLog(`[PDC] Ждём авторизации. До реконнекта: ${minLeft}м ${secLeft}с, сдвиг: ${Math.round(reStagger/1000)}с`);

    pdCycle.authTimer = setTimeout(() => pdcReenter(), totalMs);
}

// Входим на сервер (в :59 + сдвиг аккаунта)
function pdcReenter() {
    if (!pdCycle.active) return;
    pdcClearTimers();
    pdCycle.phase = 'reconnecting';

    sendToTelegram(
        `🔓 <b>Вход на сервер (${displayName})</b>\n` +
        `💰 Аккаунт #${window.ACCOUNT_NUMBER || '?'} — ждём PayDay в :00...\n` +
        `🔑 Включён автовход и отправлен /rec 5`,
        true, null
    );
    debugLog(`[PDC] Вход на сервер. Аккаунт #${window.ACCOUNT_NUMBER || '?'}`);

    // Как в строе: включаем автовход и /rec 5 — заходим на сервер
    autoLoginConfig.enabled = true;
    sendChatInput('/rec 5');
}

// Вызывается из processSalaryAndBalance когда PayDay получен и цикл активен
function pdcOnPayDayReceived() {
    if (!pdCycle.active) return;
    // Принимаем PayDay в любой фазе кроме idle и auth_wait
    if (pdCycle.phase === 'idle' || pdCycle.phase === 'auth_wait') return;
    pdcClearTimers();
    pdcSnapshotPlay(); // на случай если таймер не успел сработать

    // Сбрасываем накопленное время — новый часовой цикл
    pdCycle.totalPlayedMs    = 0;
    pdCycle.playStartTime    = null;
    pdCycle.stroiInterrupted = false;
    pdCycle.phase            = 'initial';

    debugLog('[PDC] PayDay получен — сброс времени, новая отыгровка через 30 сек');
    sendToTelegram(
        `💰 <b>PayDay получен! (${displayName})</b>\n` +
        `▶️ Новая отыгровка начнётся через 30 сек`,
        true, null
    );

    pdCycle.startTimer = setTimeout(() => pdcBeginPlay(), 30000);
}

// Остановка цикла
function pdcStop() {
    pdcClearTimers();
    pdcSnapshotPlay();
    pdCycle.active           = false;
    pdCycle.phase            = 'idle';
    pdCycle.totalPlayedMs    = 0;
    pdCycle.stroiInterrupted = false;
    autoLoginConfig.enabled  = true; // Возвращаем автологин
    sendToTelegram(`⏹️ <b>PayDay цикл остановлен (${displayName})</b>`, false, null);
    debugLog('[PDC] Цикл остановлен');
}

// Меню управления циклом
function showPdcMenu(chatId, messageId, uid) {
    const status = pdCycle.active
        ? `🟢 Активен | Фаза: ${pdCycle.phase} | Цикл #${pdCycle.cycleCount}`
        : '🔴 Выключен';
    const replyMarkup = {
        inline_keyboard: [
            [
                createButton("▶️ Запустить", `pdc_start_${uid}`),
                createButton("⏹️ Остановить", `pdc_stop_${uid}`)
            ],
            [createButton("⬅️ Назад", `show_global_functions_${uid}`)]
        ]
    };
    editMessageText(chatId, messageId,
        `⏱️ <b>PayDay цикл (${displayName})</b>\n` +
        `Статус: ${status}\n\n` +
        `<i>Вход→30с→отыгровка 25-26 мин→авторизация→:59→пэйдэй→повтор</i>`,
        replyMarkup
    );
}
// ==================== END PAYDAY CYCLE MODULE ====================
// START MENU MODULE //
function showControlsMenu(chatId, messageId) {
    if (!config.accountInfo.nickname) {
        sendToTelegram(`❌ <b>Ошибка ${displayName}</b>\nНик не определен`, false, null);
        return;
    }
    const replyMarkup = {
        inline_keyboard: [
            [createButton("⚙️ Функции", `show_local_functions_${uniqueId}`)],
            [createButton("📋 Общие функции", `show_global_functions_${uniqueId}`)],
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
        [
            createButton("🌙 AFK Ночь", `global_afk_n_${uniqueIdParam}`),
            createButton("🔄 AFK", `global_afk_${uniqueIdParam}`)
        ],
        [createButton("⏱️ PayDay Цикл", `show_pdc_menu_${uniqueIdParam}`)],
    ];
    if (config.autoReconnectEnabled) {
        inlineKeyboard.push([createButton("📈 Прокачка уровня", `global_levelup_${uniqueIdParam}`)]);
    }
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
                createButton("🔔 ВКЛ", `global_p_on_${uniqueIdParam}`),
                createButton("🔕 ВЫКЛ", `global_p_off_${uniqueIdParam}`)
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
                createButton("🔔 ВКЛ", `global_soob_on_${uniqueIdParam}`),
                createButton("🔕 ВЫКЛ", `global_soob_off_${uniqueIdParam}`)
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
                createButton("🔔 ВКЛ", `global_mesto_on_${uniqueIdParam}`),
                createButton("🔕 ВЫКЛ", `global_mesto_off_${uniqueIdParam}`)
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
                createButton("🔔 ВКЛ", `global_radio_on_${uniqueIdParam}`),
                createButton("🔕 ВЫКЛ", `global_radio_off_${uniqueIdParam}`)
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
                createButton("🔔 ВКЛ", `global_warning_on_${uniqueIdParam}`),
                createButton("🔕 ВЫКЛ", `global_warning_off_${uniqueIdParam}`)
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
                createButton("С паузами", `afk_n_with_pauses_${uniqueIdParam}`),
                createButton("Без пауз", `afk_n_without_pauses_${uniqueIdParam}`)
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
                createButton("🔔 ВКЛ", `local_radio_on_${uniqueId}`),
                createButton("🔕 ВЫКЛ", `local_radio_off_${uniqueId}`)
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
function hideControlsMenu(chatId, messageId) {
    if (!config.accountInfo.nickname) {
        sendToTelegram(`❌ <b>Ошибка ${displayName}</b>\nНик не определен`, false, null);
        return;
    }
    const replyMarkup = {
        inline_keyboard: [
            [createButton("⚙️ Управление", `show_controls_${uniqueId}`)]
        ]
    };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
// END MENU MODULE //
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
// START TELEGRAM COMMANDS MODULE //
function checkTelegramCommands() {
    if (window._hassleReloading) return;
    // У каждого аккаунта свой бот — race condition невозможен, random delay не нужен
    config.lastUpdateId = getSharedLastUpdateId();
    const url = `https://api.telegram.org/bot${config.botToken}/getUpdates?offset=${config.lastUpdateId + 1}&timeout=25`;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.timeout = 30000; // 30с — чуть больше чем timeout=25 у Telegram
    xhr.onload = function() {
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
        // Сразу следующий запрос — задержка не нужна, long-polling сам ждёт
        setTimeout(checkTelegramCommands, 0);
    };
    xhr.onerror = function(error) {
        debugLog('Ошибка при проверке команд:', error);
        setTimeout(checkTelegramCommands, config.checkInterval);
    };
    xhr.ontimeout = function() {
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
        if (update.message) {
            const message = update.message.text ? update.message.text.trim() : '';
            // ===== iOS FIX: Проверяем pendingInputs если нет reply_to_message =====
            if (!update.message.reply_to_message && message) {
                const pendingKey = `${chatId}_${uniqueId}`;
                const pending = pendingInputs[pendingKey];
                if (pending && (Date.now() - pending.timestamp < PENDING_INPUT_TTL)) {
                    // Доп. защита: сообщение пользователя должно быть отправлено ПОСЛЕ создания pending-записи
                    const msgDate = (update.message.date || 0) * 1000; // Telegram date в секундах
                    if (msgDate < pending.timestamp) {
                        debugLog(`[${displayName}] (iOS) Пропуск устаревшей pending-записи: сообщение (${msgDate}) старше pending (${pending.timestamp})`);
                    } else {
                    delete pendingInputs[pendingKey];
                    if (pending.type === 'chat_message') {
                        debugLog(`[${displayName}] (iOS) Отправка сообщения: ${message}`);
                        try {
                            sendChatInput(message);
                            sendToTelegram(`✅ <b>Сообщение отправлено ${displayName}:</b>\n<code>${message.replace(/</g, '&lt;')}</code>`, false, null);
                        } catch (err) {
                            sendToTelegram(`❌ <b>Ошибка ${displayName}</b>\nНе удалось отправить сообщение\n<code>${err.message}</code>`, false, null);
                        }
                        continue;
                    } else if (pending.type === 'admin_reply') {
                        debugLog(`[${displayName}] (iOS) Отправка ответа: ${message}`);
                        try {
                            sendChatInput(message);
                            sendToTelegram(`✅ <b>Ответ отправлен ${displayName}:</b>\n<code>${message.replace(/</g, '&lt;')}</code>`, false, null);
                        } catch (err) {
                            sendToTelegram(`❌ <b>Ошибка ${displayName}</b>\nНе удалось отправить ответ\n<code>${err.message}</code>`, false, null);
                        }
                        continue;
                    }
                    }
                }
            }
            // ===== END iOS FIX =====
            // Проверяем, является ли сообщение ответом на запрос ввода
            if (update.message.reply_to_message) {
                const replyToText = update.message.reply_to_message.text || '';
                // Ответ на запрос сообщения для чата
                if (replyToText.includes(`✉️ Введите сообщение для ${displayName}:`) && 
                    replyToText.includes(`🔑 ID: ${uniqueId}`)) {
                    const textToSend = message;
                    // Очищаем pendingInputs чтобы iOS-фоллбэк не сработал повторно
                    delete pendingInputs[`${chatId}_${uniqueId}`];
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
                    // Очищаем pendingInputs чтобы iOS-фоллбэк не сработал повторно
                    delete pendingInputs[`${chatId}_${uniqueId}`];
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
                // Ответ на запрос ника для AFK
                if (replyToText.includes(`✉️ Введите ник аккаунта для активации AFK режима:`)) {
                    const accountNickname = message.trim();
                    if (accountNickname && accountNickname === config.accountInfo.nickname) {
                        globalState.afkTargetAccount = accountNickname;
                        globalState.awaitingAfkAccount = false;
                        globalState.awaitingAfkId = true;
                        sendToTelegram(`✉️ Введите ID для активации AFK режима для ${displayName}:`, false, {
                            force_reply: true
                        });
                    } else {
                        sendToTelegram(`❌ <b>Ошибка:</b> Неверный ник аккаунта. Попробуйте снова.`, false, {
                            force_reply: true
                        });
                    }
                    continue;
                }
                // Ответ на запрос ID для AFK
                if (replyToText.includes(`✉️ Введите ID для активации AFK режима для`) && globalState.awaitingAfkId) {
                    const id = message.trim();
                    if (globalState.afkTargetAccount === config.accountInfo.nickname) {
                        const idFormats = [id];
                        if (id.includes('-')) {
                            idFormats.push(id.replace(/-/g, ''));
                        } else if (id.length === 3) {
                            idFormats.push(`${id[0]}-${id[1]}-${id[2]}`);
                        }
                        config.afkSettings = {
                            id: id,
                            formats: idFormats,
                            active: true
                        };
                        globalState.awaitingAfkId = false;
                        globalState.afkTargetAccount = null;
                        sendToTelegram(`🔄 <b>AFK режим активирован для ${displayName}</b>\nID: ${id}\nФорматы: ${idFormats.join(', ')}`, false, null);
                    }
                    continue;
                }
            }
            // Глобальные команды (работают на все аккаунты)
            if (message === '/reload') {
                if (window._hassleReloading) {
                    debugLog(`[${displayName}] /reload уже выполняется, игнорируем`);
                } else {
                    sendToTelegram(`🔄 <b>Перезагрузка скриптов для ${displayName}...</b>`, false, null);
                    debugLog(`[${displayName}] Получена команда /reload, перезапуск...`);
                    window._hassleReloading = true;
                    // Сохраняем текущий update_id в window, чтобы после перезагрузки
                    // Code.js не начал снова с offset=0 и не повторил /reload бесконечно
                    window._hassleLastUpdateId = config.lastUpdateId;
                    setTimeout(() => {
                        window._hassleReloading = false;
                        try {
                            if (typeof window.initializeScripts === 'function') {
                                window.initializeScripts();
                            } else {
                                sendToTelegram(`❌ <b>Ошибка ${displayName}:</b> initializeScripts не найден`, false, null);
                            }
                        } catch (err) {
                            window._hassleReloading = false;
                            sendToTelegram(`❌ <b>Ошибка перезагрузки ${displayName}:</b>\n<code>${err.message}</code>`, false, null);
                        }
                    }, 800);
                }
            } else if (message === '/p_off') {
                config.paydayNotifications = false;
                sendToTelegram(`🔕 <b>Уведомления о PayDay отключены для ${displayName}</b>`, false, null);
                sendWelcomeMessage();
            } else if (message === '/pdc_start') {
                pdcStart();
            } else if (message === '/pdc_stop') {
                pdcStop();
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
            } else if (message.startsWith('/afk ')) {
                const parts = message.split(' ');
                if (parts.length >= 3) {
                    const targetNickname = parts[1];
                    const id = parts[2];
                    if (targetNickname === config.accountInfo.nickname) {
                        const idFormats = [id];
                        if (id.includes('-')) {
                            idFormats.push(id.replace(/-/g, ''));
                        } else if (id.length === 3) {
                            idFormats.push(`${id[0]}-${id[1]}-${id[2]}`);
                        }
                        config.afkSettings = {
                            id: id,
                            formats: idFormats,
                            active: true
                        };
                        sendToTelegram(`🔄 <b>AFK режим активирован для ${displayName}</b>\nID: ${id}\nФорматы: ${idFormats.join(', ')}`, false, null);
                    }
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
                if (globalState.lastWelcomeMessageId) {
                    config.chatIds.forEach(chatId => {
                        deleteMessage(chatId, globalState.lastWelcomeMessageId);
                    });
                    globalState.lastWelcomeMessageId = null;
                }
                sendWelcomeMessage();
            }
        } else if (update.callback_query) {
            const message = update.callback_query.data;
            const chatId = update.callback_query.message.chat.id;
            const messageId = update.callback_query.message.message_id;
            const callbackQueryId = update.callback_query.id; // Для answerCallbackQuery
            // Определяем глобальные команды, которые должны применяться ко всем аккаунтам
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
                message.startsWith('show_global_functions_') ||
                message.startsWith('levelup_reconnect_') ||
                message.startsWith('show_pdc_menu_') ||
                message.startsWith('pdc_start_') ||
                message.startsWith('pdc_stop_');
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
            } else if (message.startsWith('local_warning_on_')) {
                callbackUniqueId = message.replace('local_warning_on_', '');
            } else if (message.startsWith('local_warning_off_')) {
                callbackUniqueId = message.replace('local_warning_off_', '');
            } else if (message.startsWith('local_pause_toggle_')) {
                callbackUniqueId = message.replace('local_pause_toggle_', '');
            } else if (message.startsWith('local_autologin_toggle_')) {
                callbackUniqueId = message.replace('local_autologin_toggle_', '');
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
            } else if (message.startsWith('global_warning_on_')) {
                callbackUniqueId = message.replace('global_warning_on_', '');
            } else if (message.startsWith('global_warning_off_')) {
                callbackUniqueId = message.replace('global_warning_off_', '');
            } else if (message.startsWith('global_afk_n_')) {
                callbackUniqueId = message.replace('global_afk_n_', '');
            } else if (message.startsWith('global_afk_')) {
                callbackUniqueId = message.replace('global_afk_', '');
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
                if (selectedMode === 'levelup') {
                    showGlobalFunctionsMenu(chatId, messageId, callbackUniqueId);
                } else {
                    showAFKReconnectMenu(chatId, messageId, callbackUniqueId, selectedMode);
                }
            } else if (message.startsWith('global_levelup_')) {
                callbackUniqueId = message.replace('global_levelup_', '');
                showRestartActionMenu(chatId, messageId, callbackUniqueId, 'levelup');
            } else if (message.startsWith('show_pdc_menu_')) {
                callbackUniqueId = message.replace('show_pdc_menu_', '');
            } else if (message.startsWith('pdc_start_')) {
                callbackUniqueId = message.replace('pdc_start_', '');
            } else if (message.startsWith('pdc_stop_')) {
                callbackUniqueId = message.replace('pdc_stop_', '');
            } else if (message.startsWith('prison_reconnect_')) {
                callbackUniqueId = message.replace('prison_reconnect_', '');
            } else if (message.startsWith('prison_quit_')) {
                callbackUniqueId = message.replace('prison_quit_', '');
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
                // Всё равно подтверждаем, чтобы кнопка не висела
                answerCallbackQuery(callbackQueryId);
                continue;
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
                // iOS fix: сохраняем ожидание ввода
                config.chatIds.forEach(cId => {
                    pendingInputs[`${cId}_${uniqueId}`] = { type: 'chat_message', timestamp: Date.now() };
                });
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
                sendToTelegram(`🔔 <b>Уведомления с Рации включены для всех аккаунтов</b>`, false, null);
                sendWelcomeMessage();
            } else if (message.startsWith(`global_radio_off_`)) {
                config.radioOfficialNotifications = false;
                sendToTelegram(`🔕 <b>Уведомления с Рации отключены для всех аккаунтов</b>`, false, null);
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
            } else if (message.startsWith('show_pdc_menu_')) {
                showPdcMenu(chatId, messageId, callbackUniqueId);
            } else if (message.startsWith('pdc_start_')) {
                pdcStart();
                setTimeout(() => showPdcMenu(chatId, messageId, callbackUniqueId), 300);
            } else if (message.startsWith('pdc_stop_')) {
                pdcStop();
                setTimeout(() => showPdcMenu(chatId, messageId, callbackUniqueId), 300);
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
            } else if (message.startsWith(`global_afk_`)) {
                if (!globalState.awaitingAfkAccount) {
                    globalState.awaitingAfkAccount = true;
                    const requestMsg = `✉️ Введите ник аккаунта для активации AFK режима:`;
                    sendToTelegram(requestMsg, false, {
                        force_reply: true
                    });
                }
            } else if (message.startsWith("admin_reply_")) {
                const requestMsg = `✉️ Введите ответ для ${displayName}:\n🔑 ID: ${uniqueId}`;
                // iOS fix: сохраняем ожидание ввода
                config.chatIds.forEach(cId => {
                    pendingInputs[`${cId}_${uniqueId}`] = { type: 'admin_reply', timestamp: Date.now() };
                });
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
                setTimeout(() => editMessageReplyMarkup(chatId, messageId, getNotificationReplyMarkup()), 300);
            } else if (message.startsWith("pause_exit_")) {
                // Выйти с паузы
                try {
                    closeInterface("PauseMenu");
                    sendToTelegram(`▶️ <b>Вышли из паузы (${displayName})</b>`, true, null);
                } catch(e) {
                    sendToTelegram(`❌ <b>Ошибка выхода из паузы (${displayName}):</b> ${e.message}`, false, null);
                }
                setTimeout(() => editMessageReplyMarkup(chatId, messageId, getNotificationReplyMarkup()), 300);
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
                sendToTelegram(`🔔 <b>Уведомления с Рации включены для ${displayName}</b>`, false, null);
                sendWelcomeMessage();
            } else if (message.startsWith("local_radio_off_")) {
                config.radioOfficialNotifications = false;
                sendToTelegram(`🔕 <b>Уведомления с Рации отключены для ${displayName}</b>`, false, null);
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
                setTimeout(() => showLocalFunctionsMenu(chatId, messageId), 300);
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
                setTimeout(() => showLocalFunctionsMenu(chatId, messageId), 100);
            } else if (message.startsWith('prison_reconnect_')) {
                // Кнопка "Выйти с автр." — включаем автовход и делаем /rec 5
                autoLoginConfig.enabled = true;
                debugLog(`[PRISON] "Выйти с автр." нажата — включаем автовход, отправляем /rec 5`);
                sendToTelegram(`🔓 <b>Автовход включён (${displayName})</b>\nПодключаемся к серверу...`, false, null);
                deleteMessage(chatId, messageId);
                setTimeout(() => {
                    sendChatInput("/rec 5");
                }, 500);
            } else if (message.startsWith('prison_quit_')) {
                // Кнопка "Выйти с игры" — /q
                debugLog(`[PRISON] "Выйти с игры" нажата — отправляем /q`);
                sendToTelegram(`🚪 <b>Выходим из игры (${displayName})</b>`, false, null);
                deleteMessage(chatId, messageId);
                setTimeout(() => {
                    sendChatInput("/q");
                }, 500);
            }
            // Подтверждаем callback_query после обработки
            answerCallbackQuery(callbackQueryId);
        }
    }
}
// END TELEGRAM COMMANDS MODULE //
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
// START MESSAGE PROCESSING MODULE //
function isNonRPMessage(message) {
    return message.includes('((') && message.includes('))');
}
// Убирает цветовые коды {RRGGBB} и {v:Nick} → Nick из сообщения для читаемого вывода
function stripColors(str) {
    return str.replace(/\{[A-Fa-f0-9]{6}\}/g, '').replace(/\{v:([^}]+)\}/g, '$1').trim();
}
// Фильтр системных сообщений рации (Приказ от, Часовой и т.д.) — не отправлять в Telegram
const SYSTEM_RADIO_PATTERNS = [
    /^\[R\]\s+Приказ от\s/i,
    /^\[R\]\s+Часовой\s*:/i,
];
function isSystemRadioMessage(message) {
    return SYSTEM_RADIO_PATTERNS.some(pattern => pattern.test(message));
}
function checkIDFormats(message) {
    const idRegex = /(\d-\d-\d|\d{3})/g;
    const matches = message.match(idRegex);
    return matches ? matches : [];
}
function getRankKeywords() {
    if (!config.currentFaction || !factions[config.currentFaction]) return [];
    return Object.values(factions[config.currentFaction].ranks).map(rank => rank.toLowerCase());
}
function getHighRankKeywords() {
    if (!config.currentFaction || !factions[config.currentFaction]) return [];
    return Object.entries(factions[config.currentFaction].ranks)
        .filter(([rankNum]) => parseInt(rankNum) >= 6) // Только 6-10
        .map(([, rank]) => rank.toLowerCase());
}
// Возвращает все звания 6-10 ранга из ВСЕХ фракций (для проверки рации)
function getAllHighRankKeywords() {
    const highRanks = [];
    for (const faction in factions) {
        const ranks = factions[faction].ranks;
        for (const rankNum in ranks) {
            if (parseInt(rankNum) >= 6) {
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
    const hasID = isTargetingPlayer(msg);
   
    // Строгая проверка: обязательно action keyword, если нет targeting
    const isValid = hasRoleKeyword && hasActionKeyword && (hasID || true); // Если нужно, уберите || true для еще большей строгости
   
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

        // PayDay цикл — новая отыгровка
        if (pdCycle.active && pdCycle.phase === 'reconnecting') {
            pdcOnPayDayReceived();
        }

        // Если ждём PayDay после строя — выходим из игры НЕМЕДЛЕННО
        if (waitingForPayDay) {
            debugLog('PayDay получен во время ожидания после строя — выходим немедленно');
            exitAfterStroiPayDay('processSalaryAndBalance');
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

// Функция для получения времени до 58 минуты в миллисекундах
function getTimeUntil58Minutes() {
    const now = new Date();
    const currentMinutes = now.getMinutes();
    const currentSeconds = now.getSeconds();
    
    if (currentMinutes >= 58) {
        // Уже 58-59 минут, заходим через 10 секунд
        return 10000;
    }
    
    // Рассчитываем время до 58 минуты
    const minutesUntil58 = 58 - currentMinutes;
    const secondsUntil58 = minutesUntil58 * 60 - currentSeconds;
    
    // Вычитаем ~60 секунд на реконнект (с запасом)
    const timeToStart = (secondsUntil58 - 60) * 1000;
    
    // Минимум 5 секунд, максимум рассчитанное время
    return Math.max(5000, timeToStart);
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
function performStroiReconnect() {
    const now = new Date();
    const currentMinutes = now.getMinutes();
    const currentSeconds = now.getSeconds();

    // Если PDC-цикл активен и мы в фазе отыгровки — сохраняем прогресс
    if (pdCycle.active && pdCycle.phase === 'playing') {
        pdcOnStroiInterrupt();
    }

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

		// Стало — после PayDay + запас:
		payDayResetTimer = setTimeout(() => {
		    resetPayDayFlag();
		    debugLog('Автоматический сброс флага PayDay по таймауту');
		}, timeToPayDay + 2 * 60 * 1000);

        // ШАГ 1: Немедленно отключаемся
        autoLoginConfig.enabled = false;
        sendChatInput("/rec 5");

        sendToTelegram(
            `⚠️ <b>Строй обнаружен (${displayName})</b>\n` +
            `🕐 Текущее время: ${currentMinutes} мин ${currentSeconds} сек\n` +
            `⏰ До PayDay: ${minutesLeft} мин\n` +
            `🔌 /rec 5 отправлен — ждём на авторизации\n` +
            `🔑 Переподключимся за 60 сек до PayDay`,
            false, null
        );

        // ШАГ 2: За 60 секунд до PayDay — включаем автовход и /rec 5
        const timeToReconnect = Math.max(1000, timeToPayDay - 60 * 1000);

        stroiAutoLoginTimer = setTimeout(() => {
            autoLoginConfig.enabled = true;
            sendChatInput("/rec 5");

            const loginMinutes = getCurrentMinutes();
            const loginSecs = new Date().getSeconds();
            sendToTelegram(
                `🔄 <b>Включён автовход и отправлен /rec 5 (${displayName})</b>\n` +
                `🕐 Текущее время: ${loginMinutes} мин ${loginSecs} сек\n` +
                `💰 PayDay через ~60 сек — входим в игру`,
                false, null
            );
        }, timeToReconnect);

    } else {
        // До PayDay далеко (0-52 минуты) — стандартный реконнект
        debugLog(`Строй обнаружен в ${currentMinutes} минут, до PayDay далеко - стандартный реконнект`);

        sendToTelegram(
            `📢 <b>Обнаружен сбор/строй! (${displayName})</b>\n` +
            `🕐 Текущее время: ${currentMinutes} минут\n` +
            `⏰ До PayDay: ${60 - currentMinutes} мин\n` +
            `🔄 Выполняем стандартный реконнект`,
            false, null
        );

        setTimeout(() => {
            performReconnect(5 * 60 * 1000);
        }, 30);
    }
}

// Функция для отмены ожидания PayDay (на случай нештатных ситуаций)
function cancelStroiReconnect() {
    if (stroiReconnectTimer) {
        clearTimeout(stroiReconnectTimer);
        stroiReconnectTimer = null;
    }
    resetPayDayFlag();
    debugLog('Отменено ожидание PayDay после строя');
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
        debugLog(`Чат-сообщение: ${e} | Цвет: ${normalizeColor(i).replace('0x', '')} | Тип: ${t} | Пауза: ${window.getInterfaceStatus("PauseMenu")}`);
        const msg = String(e);
        const normalizedMsg = normalizeToCyrillic(msg);
        const lowerCaseMessage = normalizedMsg.toLowerCase();
        const currentTime = Date.now();
        const chatRadius = getChatRadius(i);
        // Для отладки, выводим сообщения в чат
        console.log(msg); // сооб в чат
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
                setTimeout(() => {
                    sendChatInput("/rec 5");
                }, 1000);
            } else {
                sendToTelegram(`✅ <b>Срок отсижен! Выходим из игры (${displayName})</b>`, false, null);
                setTimeout(() => {
                    sendChatInput("/q");
                }, 1000);
            }
        }
		// ОТЛАДКА: Выводим ВСЕ сообщения с цветом фракции МЗ
		if (config.currentFaction === 'mz') {
		    const mzColor = factions.mz.color;
		    const normalizedMzColor = normalizeColor(mzColor);
		    const normalizedMsgColor = normalizeColor(i);
		    
		    debugLog(`=== ОТЛАДКА МЗ ===`);
		    debugLog(`Текущая фракция: ${config.currentFaction}`);
		    debugLog(`Цвет фракции МЗ: ${mzColor} -> ${normalizedMzColor}`);
		    debugLog(`Цвет сообщения: ${i} -> ${normalizedMsgColor}`);
		    debugLog(`Радиус чата: ${chatRadius} (нужен CLOSE=${CHAT_RADIUS.CLOSE})`);
		    debugLog(`Сообщение: "${msg}"`);
		    debugLog(`govMessagesEnabled: ${config.govMessagesEnabled}`);
		    
		    // Проверяем совпадение цветов
		    if (normalizedMzColor === normalizedMsgColor) {
		        debugLog(`✅ ЦВЕТ СОВПАЛ! Проверяем regex...`);
		        
		        const govMessageRegex = new RegExp(`^\\- (.+?) \\{${mzColor}\\}\\(\\{v:([^}]+)}\\)\\[(\\d+)\\]`);
		        debugLog(`Regex pattern: ${govMessageRegex}`);
		        
		        const govMatch = msg.match(govMessageRegex);
		        if (govMatch) {
		            debugLog(`✅ REGEX СРАБОТАЛ!`);
		            debugLog(`Текст: ${govMatch[1]}, Отправитель: ${govMatch[2]}, ID: ${govMatch[3]}`);
		        } else {
		            debugLog(`❌ REGEX НЕ СРАБОТАЛ`);
		            debugLog(`Пробуем упрощенный regex...`);
		            
		            // Пробуем более простой regex
		            const simpleRegex = /\{([A-Fa-f0-9]{6})\}\(\{v:([^}]+)\}\)\[(\d+)\]/;
		            const simpleMatch = msg.match(simpleRegex);
		            if (simpleMatch) {
		                debugLog(`✅ Упрощенный regex сработал!`);
		                debugLog(`Цвет: ${simpleMatch[1]}, Имя: ${simpleMatch[2]}, ID: ${simpleMatch[3]}`);
		            } else {
		                debugLog(`❌ Даже упрощенный regex не сработал`);
		            }
		        }
		        
		        // Проверяем радиус
		        if (chatRadius === CHAT_RADIUS.CLOSE) {
		            debugLog(`✅ Радиус CLOSE подтвержден`);
		        } else {
		            debugLog(`❌ Радиус не CLOSE! Текущий: ${chatRadius}`);
		        }
		    } else {
		        debugLog(`❌ Цвета не совпали`);
		    }
		    debugLog(`=== КОНЕЦ ОТЛАДКИ МЗ ===`);
		}
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
                    sendToTelegram(`🏛️ <b>Сообщение от сотрудника фракции (${displayName}):</b>\n👤 ${senderName} [ID: ${senderId}]\n💬 ${messageText}`, false, replyMarkup);
                }
            }
        }
        // Сообщения других игроков (НЕ своей фракции, НЕ своё, НЕ уже обработанное) → тихо в тему
        if (window.OFF_UVED_TOPIC_ID && !govMatch &&
            (chatRadius === CHAT_RADIUS.CLOSE || chatRadius === CHAT_RADIUS.SELF)) {
            // Формат: - текст {COLOR}({v:Nick})[ID]
            const otherPlayerRegex = /^-\s+(.+?)\s+\{[A-Fa-f0-9]{6}\}\(\{v:([^}]+)\}\)\[(\d+)\]/;
            const otherMatch = msg.match(otherPlayerRegex);
            if (otherMatch) {
                const senderName = otherMatch[2];
                const senderId = otherMatch[3];
                // Фильтруем собственные сообщения
                if (senderName !== config.accountInfo.nickname) {
                    const cleanMsg = stripColors(msg);
                    debugLog(`[ЧАТ ДРУГИХ] ${senderName}[${senderId}]: ${cleanMsg}`);
                    pushToMessageBuffer(
                        `💬 <b>Сообщение игрока (${displayName}):</b>\n👤 ${senderName} [ID: ${senderId}]\n💬 ${cleanMsg}`,
                        window.OFF_UVED_TOPIC_ID
                    );
                }
            }
        }
        // Нон-РП чат: (( {v:Nick}[ID]: текст )) — цвет CCCC99
        if (window.OFF_UVED_TOPIC_ID && normalizeColor(i) === '0xCCCC99') {
            const nonRpChatRegex = /^\(\(\s*\{v:([^}]+)\}\[(\d+)\]:\s*(.+?)\s*\)\)$/;
            const nonRpChatMatch = msg.match(nonRpChatRegex);
            if (nonRpChatMatch) {
                const senderName = nonRpChatMatch[1];
                const senderId = nonRpChatMatch[2];
                // Фильтруем собственные сообщения
                if (senderName !== config.accountInfo.nickname) {
                    const cleanMsg = stripColors(msg);
                    debugLog(`[НОН-РП ЧАТ] ${senderName}[${senderId}]: ${cleanMsg}`);
                    pushToMessageBuffer(
                        `💬 <b>[НОН-РП ЧАТ] (${displayName}):</b>\n👤 ${senderName} [ID: ${senderId}]\n💬 ${cleanMsg}`,
                        window.OFF_UVED_TOPIC_ID
                    );
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
                    const errorMsg = '❌ <b>Ошибка ${displayName}</b>\nНе удалось отправить /c\n<code>${err.message}</code>';
                    debugLog(errorMsg);
                    sendToTelegram(errorMsg, false, null);
                }
            }, config.clearDelay);
        }
        if ((lowerCaseMessage.indexOf("администратор") !== -1 && lowerCaseMessage.indexOf("для") !== -1) ||
            normalizeColor(i) === '0xFF9945' ||
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
            }
        }
		if (!isNonRPMessage(msg) && getHighRankKeywords().some(kw => lowerCaseMessage.includes(kw)) &&
			(lowerCaseMessage.indexOf("строй") !== -1 ||
			lowerCaseMessage.indexOf("сбор") !== -1 ||
			lowerCaseMessage.indexOf("готовность") !== -1 ||
			lowerCaseMessage.indexOf("конф") !== -1)
			&& (chatRadius === CHAT_RADIUS.RADIO)) {
			
			// Извлекаем ник отправителя из сообщения рации
			const nicknameMatch = msg.match(/\]\s+([A-Za-z]+_[A-Za-z]+)\[/);
			const senderNickname = nicknameMatch ? nicknameMatch[1] : null;
			
			// Проверяем, находится ли отправитель в списке игнорируемых
			const isIgnoredSender = senderNickname && config.ignoredStroiNicknames.includes(senderNickname);
			
			if (isIgnoredSender) {
				debugLog(`Сообщение от игнорируемого ника: ${senderNickname} - пропускаем`);
				sendToTelegram(`🔕 <b>Строй от игнорируемого ника (${displayName})</b>\n👤 ${senderNickname}\n<code>${msg.replace(/</g, '&lt;')}</code>`, true);
			} else {
				// Извлекаем текст сообщения после последнего двоеточия
				const messageTextMatch = msg.match(/:\s*(.+)$/);
				const messageText = messageTextMatch ? messageTextMatch[1].trim().toLowerCase() : lowerCaseMessage;
				
				// Проверяем, является ли сообщение только словом "строй"
				const onlyStroyMessage = messageText === "строй";
				
				debugLog('Обнаружен сбор/строй!');
				
				const currentMinutes = getCurrentMinutes();
				const payDayStatus = isPayDayApproaching() 
					? `⏰ <b>БЛИЗКО К PAYDAY (${currentMinutes} мин)</b>` 
					: `🕐 До PayDay: ${60 - currentMinutes} мин`;
				
				// Если не ждём PayDay - показываем обычное уведомление
				if (!waitingForPayDay) {
					sendToTelegram(
						`📢 <b>Обнаружен сбор/строй! (${displayName})</b>\n` +
						`${payDayStatus}\n` +
						`<code>${msg.replace(/</g, '&lt;')}</code>`
					);
					
					window.playSound("https://raw.githubusercontent.com/ZaharQqqq/Sound/main/steroi.mp3", false, 1.0);
				}
				
				// Выполняем умный реконнект только если это НЕ просто слово "строй"
				if (!onlyStroyMessage) {
					performStroiReconnect();
				} else {
					debugLog('Сообщение содержит только "строй" - реконнект не выполняется');
				}
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
        // Проверка сообщений с рации
        // Нон-РП рация: [R] Звание Nick[ID]: (( текст )) → тихо в тему
        if (window.OFF_UVED_TOPIC_ID && chatRadius === CHAT_RADIUS.RADIO && isNonRPMessage(msg)) {
            const nonRpRadioRegex = /^\[R\]\s+\S+\s+([A-Za-z]+_[A-Za-z]+)\[(\d+)\]:\s*\(\(\s*(.+?)\s*\)\)/;
            const nonRpRadioMatch = msg.match(nonRpRadioRegex);
            if (nonRpRadioMatch) {
                const senderName = nonRpRadioMatch[1];
                const senderId = nonRpRadioMatch[2];
                // Фильтруем собственные сообщения
                if (senderName !== config.accountInfo.nickname) {
                    const cleanMsg = stripColors(msg);
                    debugLog(`[НОН-РП РАЦИЯ] ${senderName}[${senderId}]: ${cleanMsg}`);
                    pushToMessageBuffer(
                        `📡 <b>[НОН-РП] Рация (${displayName}):</b>\n👤 ${senderName} [ID: ${senderId}]\n💬 ${cleanMsg}`,
                        window.OFF_UVED_TOPIC_ID
                    );
                }
            } else {
                // Формат не совпал — отправляем как есть
                pushToMessageBuffer(
                    `📡 <b>[НОН-РП] Рация (${displayName}):</b>\n<code>${msg.replace(/</g, '&lt;')}</code>`,
                    window.OFF_UVED_TOPIC_ID
                );
            }
        }
        if (chatRadius === CHAT_RADIUS.RADIO && config.radioOfficialNotifications && !isNonRPMessage(msg) && !isSystemRadioMessage(msg)) {
            debugLog('Обнаружено сообщение с рации!');
            const offUvedTopicId = window.OFF_UVED_TOPIC_ID || null;

            // Является ли сообщение строем/сбором?
            const isStroiMsg = getHighRankKeywords().some(kw => lowerCaseMessage.includes(kw)) &&
                (lowerCaseMessage.includes('строй') || lowerCaseMessage.includes('сбор') ||
                 lowerCaseMessage.includes('готовность') || lowerCaseMessage.includes('конф'));
            // Является ли сообщение запросом местоположения?
            const isLocationMsg = checkLocationRequest(msg, lowerCaseMessage, chatRadius);

            if (offUvedTopicId && !isStroiMsg && !isLocationMsg) {
                // Обычная рация → тихо в тему "Офф уведы"
                sendToTelegramTopic(
                    `📡 <b>Сообщение с рации (${displayName}):</b>\n<code>${msg.replace(/</g, '&lt;')}</code>`,
                    offUvedTopicId,
                    true
                );
            } else {
                // Строй / местоположение / тема не задана → основной чат как раньше
                const replyMarkup = getNotificationReplyMarkup();
                const radioHighRank = isHighRankRadioMessage(msg);
                sendToTelegram(`📡 <b>Сообщение с рации (${displayName}):</b>\n<code>${msg.replace(/</g, '&lt;')}</code>`, !radioHighRank, replyMarkup);
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
            sendToTelegram(`❌ Потеряно соединение с сервером (${displayName})`, false, null);
        }
        if (msg.includes("Вы были неактивны долгое время. Отыгранное время для получения следующего PayDay было обнулено.")) {
            debugLog('Обнаружено предупреждение о неактивности!');
            sendToTelegram(`⚠️ Вы были неактивны долгое время. Отыгранное время для PayDay обнулено (${displayName})`, false, null);
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
    }
    checkTelegramCommands();
    return true;
}
// END CHAT MONITOR MODULE //
// START RECONNECT MODULE //
function performReconnect(delay) {
    if (config.autoReconnectEnabled) {
        autoLoginConfig.enabled = false;
        sendChatInput("/rec 5");
        sendToTelegram(`🔄 <b>Отключен автовход и отправлен /rec 5 (${displayName})</b>`);
        setTimeout(() => {
            autoLoginConfig.enabled = true;
            sendChatInput("/rec 5");
            sendToTelegram(`🔄 <b>Включен автовход и отправлен /rec 5 (${displayName})</b>`);
        }, delay);
    } else {
        sendChatInput("/q");
        sendToTelegram(`✅ <b>Отправлено /q (${displayName})</b>`);
    }
}
// END RECONNECT MODULE //
// START INITIALIZATION MODULE //
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
// END INITIALIZATION MODULE //
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
        { name: "{FFD700}> {FFFFFF}Общие функции", action: "global_functions" }
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
        { name: `{FFFFFF}Рация ${config.radioOfficialNotifications ? statusOn : statusOff}`, action: "toggle_radio_local" },
        { name: `{FFFFFF}Выговоры ${config.warningNotifications ? statusOn : statusOff}`, action: "toggle_warning_local" }
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
        { name: `{FFFFFF}Рация ${config.radioOfficialNotifications ? statusOn : statusOff}`, action: "toggle_radio" },
        { name: `{FFFFFF}Выговоры ${config.warningNotifications ? statusOn : statusOff}`, action: "toggle_warning" },
        { name: "{FFD700}> {FFFFFF}AFK Ночь", action: "afk_night" },
        { name: "{FFD700}> {FFFFFF}AFK", action: "afk_standard" }
    ];
    if (config.autoReconnectEnabled) {
        menuItems.push({ name: "{FFD700}> {FFFFFF}Прокачка уровня", action: "levelup" });
    }
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
            } else if (RECONNECT_ENABLED_DEFAULT && listitem === 3) {
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
                showScreenNotification("Hassle", `Уведомления рации ${status}`);
                sendToTelegram(`${config.radioOfficialNotifications ? '📡' : '🔕'} <b>Уведомления рации ${status} для ${displayName}</b>`, false, null);
                sendWelcomeMessage();
                setTimeout(() => showHBLocalFunctionsMenu(), 100);
            } else if (listitem === 5) {
                config.warningNotifications = !config.warningNotifications;
                const status = config.warningNotifications ? 'включены' : 'отключены';
                showScreenNotification("Hassle", `Уведомления выговоров ${status}`);
                sendToTelegram(`${config.warningNotifications ? '⚠️' : '🔕'} <b>Уведомления выговоров ${status} для ${displayName}</b>`, false, null);
                sendWelcomeMessage();
                setTimeout(() => showHBLocalFunctionsMenu(), 100);
            }
            break;
        case HB_DIALOG_IDS.GLOBAL_FUNCTIONS:
            if (listitem === 0) {
                setTimeout(() => showHBControlsMenu(), 100);
            } else if (listitem === 1) {
                config.paydayNotifications = !config.paydayNotifications;
                const status = config.paydayNotifications ? 'включены' : 'отключены';
                showScreenNotification("Hassle", `PayDay уведомления ${status}`);
                sendToTelegram(`${config.paydayNotifications ? '🔔' : '🔕'} <b>PayDay уведомления ${status} для всех</b>`, false, null);
                sendWelcomeMessage();
                setTimeout(() => showHBGlobalFunctionsMenu(), 100);
            } else if (listitem === 2) {
                config.govMessagesEnabled = !config.govMessagesEnabled;
                const status = config.govMessagesEnabled ? 'включены' : 'отключены';
                showScreenNotification("Hassle", `Уведомления от сотрудников фракции ${status}`);
                sendToTelegram(`${config.govMessagesEnabled ? '🔔' : '🔕'} <b>Уведомления от сотрудников фракции ${status} для всех</b>`, false, null);
                sendWelcomeMessage();
                setTimeout(() => showHBGlobalFunctionsMenu(), 100);
            } else if (listitem === 3) {
                config.trackLocationRequests = !config.trackLocationRequests;
                const status = config.trackLocationRequests ? 'включено' : 'отключено';
                showScreenNotification("Hassle", `Отслеживание местоположения ${status}`);
                sendToTelegram(`${config.trackLocationRequests ? '📍' : '🔕'} <b>Отслеживание местоположения ${status} для всех</b>`, false, null);
                sendWelcomeMessage();
                setTimeout(() => showHBGlobalFunctionsMenu(), 100);
            } else if (listitem === 4) {
                config.radioOfficialNotifications = !config.radioOfficialNotifications;
                const status = config.radioOfficialNotifications ? 'включены' : 'отключены';
                showScreenNotification("Hassle", `Уведомления рации ${status}`);
                sendToTelegram(`${config.radioOfficialNotifications ? '📡' : '🔕'} <b>Уведомления рации ${status} для всех</b>`, false, null);
                sendWelcomeMessage();
                setTimeout(() => showHBGlobalFunctionsMenu(), 100);
            } else if (listitem === 5) {
                config.warningNotifications = !config.warningNotifications;
                const status = config.warningNotifications ? 'включены' : 'отключены';
                showScreenNotification("Hassle", `Уведомления выговоров ${status}`);
                sendToTelegram(`${config.warningNotifications ? '⚠️' : '🔕'} <b>Уведомления выговоров ${status} для всех</b>`, false, null);
                sendWelcomeMessage();
                setTimeout(() => showHBGlobalFunctionsMenu(), 100);
            } else if (listitem === 6) {
                setTimeout(() => showHBAFKModesMenu(), 100);
            } else if (listitem === 7) {
                // Стандартный AFK
                const hudId = getPlayerIdFromHUD();
                if (!hudId) {
                    sendToTelegram(`❌ <b>Ошибка:</b> Не удалось получить ID из HUD`, false, null);
                    setTimeout(() => showHBGlobalFunctionsMenu(), 100);
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
                showScreenNotification("Hassle", "AFK режим активирован");
                sendToTelegram(`🔄 <b>AFK режим активирован для ${displayName}</b>\nID: ${hudId}\nФорматы: ${idFormats.join(', ')}`, false, null);
                setTimeout(() => showHBGlobalFunctionsMenu(), 100);
            } else if (listitem === 8 && config.autoReconnectEnabled) {
                currentHBSelectedMode = 'levelup';
                setTimeout(() => showHBAFKRestartMenu('levelup'), 100);
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
    console.log(`HB Event: ${event}, Args:`, args);
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


// ==================== Все режимы ====================
/* // ==================== TEST COMMANDS (ScreenNotification + GameText) ====================
const originalSendChatInput = window.sendChatInputCustom || sendChatInput;
window.sendChatInputCustom = function(e) {
    const args = e.trim().split(" ");
    // ===================== /test — ScreenNotification =====================
    if (args[0] === "/test") {
        try {
            window.interface('ScreenNotification').add(
                '[0, "Тест уведомления", "Это тестовый текст с переносом строки", "FF66FF", 5000]'
            );
            console.log('[TEST] ScreenNotification отправлен');
        } catch (err) {
            console.error('[TEST] Ошибка ScreenNotification:', err);
        }
        return;
    }
    // ===================== /test2 — GameText =====================
    if (args[0] === "/test2") {
        try {
            window.interface('GameText').add(
                '[0, "Большой GameText~n~~r~Красный~w~ и ~g~зелёный~w~ текст", 6000, 0, 0, 1, 1, 3.5]'
            );
            console.log('[TEST2] GameText отправлен');
        } catch (err) {
            console.error('[TEST2] Ошибка GameText:', err);
        }
        return;
    }
    // Для всех остальных команд — передаём дальше
    if (typeof originalSendChatInput === 'function') {
        originalSendChatInput(e);
    }
};
sendChatInput = window.sendChatInputCustom;
console.log('[TEST COMMANDS] /test и /test2 успешно загружены!');
// ScreenNotification:
// Формат: [позиция, "Заголовок", "Текст перенос", "ЦветHEX", время_мс]
// Позиции:
// 0 — Сверху (top)
// 1 — Слева (left)
// 2 — Снизу (bottom)
// GameText:
// Формат: [тип, "Текст~n~перенос~~r~цвет", длительность, offset, keyCode, force, звук, размер]
// Типы (0-4):
// 0 — Центр экрана (center-type)
// 1 — Верх экрана (top-type)
// 2 — Справа внизу (right-type)
// 3 — Низ экрана (bottom-type)
// 4 — Центр + ожидание клавиши (key-type)
// Цвета: ~r~красный ~y~жёлтый ~g~зелёный ~b~синий ~p~фиолетовый ~w~белый ~o~оранжевый
*/

// ==================== DIALOG MONITOR MODULE v2 ====================
// Перехват серверных диалогов игры и управление ими через Telegram
// Расположение: в самом конце Code.js (после // END HB MENU SYSTEM)
//
// ИСПРАВЛЕНИЯ v2:
// 1. TABLIST_HEADERS (style=5): первая строка — заголовок, не кнопка
// 2. <t> (разделитель колонок) → " │ " для читаемого отображения
// 3. HTML-теги в тексте диалога — текст сохраняется, тег удаляется
// 4. Защита от краша: проверка dlg.active перед dlgRespond
// 5. Пустой info для INPUT-диалогов — исправлен парсинг HTML
// ==================================================================

// ── Константы ──────────────────────────────────────────────────
const DIALOG_STYLE = {
    MSGBOX:          0,
    INPUT:           1,
    LIST:            2,
    PASSWORD:        3,
    TABLIST:         4,
    TABLIST_HEADERS: 5
};

const DLG_ITEMS_PER_PAGE = 8;  // Элементов списка на одну страницу
const DLG_LABEL_MAX_LEN  = 24; // Макс. длина подписи кнопки

// Диапазон HB-диалогов — не трогаем
const DLG_HB_MIN = 900;
const DLG_HB_MAX = 913;

// ── Состояние диалога ─────────────────────────────────────────
const dlg = {
    active:        false,
    dialogId:      null,
    style:         null,
    title:         '',
    info:          '',
    contentText:   '',  // FIX: текст для INPUT/MSGBOX/PASSWORD диалогов
    headers:       [],
    items:         [],
    button1:       '',
    button2:       '',
    tgMsgs:        [],
    page:          0,
    awaitingInput: false
};

// ── Вспомогательные функции ───────────────────────────────────

/**
 * Очищает текст от цветовых кодов игры и HTML-тегов,
 * сохраняя текстовое содержимое.
 * FIX v2: <t> → " │ ", <br>/<p> → перенос строки, текст из тегов сохраняется
 */
function dlgStripColors(text) {
    return (text || '')
        .replace(/<t>/gi, ' │ ')              // Разделитель колонок tablist
        .replace(/\{[A-Fa-f0-9]{6}\}/g, '')   // {RRGGBB} цветовые коды игры
        .replace(/<br\s*\/?>/gi, '\n')         // <br> → перенос
        .replace(/<\/p>/gi, '\n')              // </p> → перенос
        .replace(/<p[^>]*>/gi, '')             // Убираем открывающий <p ...>
        .replace(/<[^>]+>/g, '')               // Все остальные HTML-теги
        .replace(/\n{3,}/g, '\n\n')            // Схлопываем лишние переносы
        .trim();
}

/** Экранирует HTML для Telegram HTML-разметки */
function dlgHtml(text) {
    return (text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/** Иконка типа диалога */
function dlgStyleIcon(style) {
    const MAP = { 0: '📋', 1: '✏️', 2: '📜', 3: '🔐', 4: '📊', 5: '📊' };
    return MAP[style] || '💬';
}
function dlgStyleName(style) {
    const MAP = {
        0: 'Сообщение', 1: 'Ввод текста', 2: 'Список',
        3: 'Ввод пароля', 4: 'Таблица', 5: 'Таблица'
    };
    return MAP[style] || 'Диалог';
}

// ── Формирование текста и клавиатуры ─────────────────────────

function dlgBuildText() {
    const totalPages = Math.ceil(dlg.items.length / DLG_ITEMS_PER_PAGE);
    const startIdx   = dlg.page * DLG_ITEMS_PER_PAGE;
    const endIdx     = Math.min(startIdx + DLG_ITEMS_PER_PAGE, dlg.items.length);

    let text = `🗔 <b>Диалог — ${displayName}</b>  `;
    text += `<i>${dlgStyleIcon(dlg.style)} ${dlgStyleName(dlg.style)}</i>\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n`;

    if (dlg.title) text += `📌 <b>${dlgHtml(dlg.title)}</b>\n`;

    // FIX: текст диалога для INPUT/MSGBOX/PASSWORD (хранится в contentText)
    if (dlg.contentText) {
        text += `${dlgHtml(dlg.contentText)}\n`;
    } else if (dlg.info) {
        text += `${dlgHtml(dlg.info)}\n`;
    }

    // FIX v2: заголовки колонок (только для TABLIST_HEADERS)
    if (dlg.headers.length > 0) {
        text += `\n📊 <b>${dlgHtml(dlg.headers.join(' │ '))}</b>\n`;
    }

    // Элементы списка с пагинацией
    if (dlg.items.length > 0) {
        const pageLabel = totalPages > 1
            ? ` (стр. ${dlg.page + 1}/${totalPages})`
            : '';
        text += `\n<b>Пункты${pageLabel}:</b>\n`;
        for (let i = startIdx; i < endIdx; i++) {
            text += `${i + 1}. ${dlgHtml(dlg.items[i])}\n`;
        }
    }

    if (dlg.style === DIALOG_STYLE.INPUT || dlg.style === DIALOG_STYLE.PASSWORD) {
        text += `\n💡 <i>Нажмите «Ввести», введите текст в ответном сообщении — он будет отправлен в диалог</i>`;
    }

    return text;
}

function dlgBuildKeyboard() {
    const uid = uniqueId;
    const kb  = [];
    const startIdx = dlg.page * DLG_ITEMS_PER_PAGE;
    const endIdx   = Math.min(startIdx + DLG_ITEMS_PER_PAGE, dlg.items.length);

    // ── LIST / TABLIST / TABLIST_HEADERS ───────────────────────
    // FIX v2: dlg.items уже НЕ содержит строку заголовков — индексы верные
    if (dlg.style === DIALOG_STYLE.LIST ||
        dlg.style === DIALOG_STYLE.TABLIST ||
        dlg.style === DIALOG_STYLE.TABLIST_HEADERS) {

        for (let i = startIdx; i < endIdx; i += 2) {
            const lbl1 = `${i + 1}. ${dlg.items[i].substring(0, DLG_LABEL_MAX_LEN)}`;
            const row  = [createButton(lbl1, `dlg_item_${i}_${uid}`)];
            if (i + 1 < endIdx) {
                const lbl2 = `${i + 2}. ${dlg.items[i + 1].substring(0, DLG_LABEL_MAX_LEN)}`;
                row.push(createButton(lbl2, `dlg_item_${i + 1}_${uid}`));
            }
            kb.push(row);
        }

        // Пагинация
        const totalPages = Math.ceil(dlg.items.length / DLG_ITEMS_PER_PAGE);
        if (totalPages > 1) {
            const nav = [];
            if (dlg.page > 0)
                nav.push(createButton('◀️ Назад', `dlg_page_${dlg.page - 1}_${uid}`));
            nav.push(createButton(`📄 ${dlg.page + 1}/${totalPages}`, `dlg_noop_${uid}`));
            if (dlg.page < totalPages - 1)
                nav.push(createButton('▶️ Далее', `dlg_page_${dlg.page + 1}_${uid}`));
            kb.push(nav);
        }

        // FIX: если button2 пустая — сервер всё равно показывает "Назад", добавляем fallback
        const b2label = dlg.button2 || 'Назад';
        kb.push([createButton(`❌ ${b2label}`, `dlg_btn2_${uid}`)]);

    // ── INPUT / PASSWORD ────────────────────────────────────────
    } else if (dlg.style === DIALOG_STYLE.INPUT ||
               dlg.style === DIALOG_STYLE.PASSWORD) {

        const icon = dlg.style === DIALOG_STYLE.PASSWORD ? '🔐' : '✏️';
        kb.push([createButton(`${icon} Ввести текст`, `dlg_input_${uid}`)]);

        // FIX: всегда показываем кнопку отмены, даже если button2 пустая
        const cancelLabel = dlg.button2 || 'Назад';
        kb.push([createButton(`❌ ${cancelLabel}`, `dlg_btn2_${uid}`)]);

    // ── MSGBOX ──────────────────────────────────────────────────
    } else {
        const btnRow = [];
        if (dlg.button1) btnRow.push(createButton(`✅ ${dlg.button1}`, `dlg_btn1_${uid}`));
        // FIX: всегда показываем кнопку отмены, даже если button2 пустая
        const cancelLabel = dlg.button2 || 'Закрыть';
        btnRow.push(createButton(`❌ ${cancelLabel}`, `dlg_btn2_${uid}`));
        if (btnRow.length) kb.push(btnRow);
    }

    return { inline_keyboard: kb };
}

// ── Telegram-операции ────────────────────────────────────────

function dlgSendToTelegram() {
    dlg.tgMsgs.forEach(({ chatId, messageId }) => deleteMessage(chatId, messageId));
    dlg.tgMsgs = [];

    const text     = dlgBuildText();
    const keyboard = dlgBuildKeyboard();

    config.chatIds.forEach(chatId => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.telegram.org/bot${config.botToken}/sendMessage`, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function() {
            if (xhr.status === 200) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    dlg.tgMsgs.push({ chatId, messageId: data.result.message_id });
                    debugLog(`[DLG] Отправлено в чат ${chatId}: msg ${data.result.message_id}`);
                } catch (e) {}
            }
        };
        xhr.send(JSON.stringify({
            chat_id:      chatId,
            text:         text,
            parse_mode:   'HTML',
            reply_markup: JSON.stringify(keyboard)
        }));
    });
}

function dlgUpdateTelegram() {
    const text     = dlgBuildText();
    const keyboard = dlgBuildKeyboard();
    dlg.tgMsgs.forEach(({ chatId, messageId }) => {
        editMessageText(chatId, messageId, text, keyboard);
    });
}

function dlgClose(showClosedMsg = true) {
    if (!dlg.active) return;
    dlg.active        = false;
    dlg.awaitingInput = false;
    if (showClosedMsg) {
        dlg.tgMsgs.forEach(({ chatId, messageId }) => {
            editMessageText(chatId, messageId,
                `✅ <b>Диалог закрыт — ${displayName}</b>`, null);
        });
    }
    dlg.tgMsgs = [];
    // FIX: закрываем Vue-компонент диалога в игре (иначе игра крашит)
    try { window.closeLastDialog(); } catch(e) {}
    debugLog('[DLG] Диалог завершён');
}

/**
 * Отправляет ответ на диалог через sendClientEvent.
 * FIX v2: Защита — проверяем dlg.active перед вызовом
 */
function dlgRespond(dialogId, response, listitem, inputText) {
    // Если диалог уже закрыт — не отправляем
    if (!dlg.active && response !== 0) {
        debugLog(`[DLG] dlgRespond: диалог ${dialogId} уже не активен, пропускаем`);
        sendToTelegram(
            `⚠️ <b>Диалог уже закрыт, ответ не отправлен (${displayName})</b>`,
            false, null);
        return;
    }
    try {
        // Используем gm.EVENT_EXECUTE_PUBLIC как в Window.js, с fallback
        const evtType = (window.gm && window.gm.EVENT_EXECUTE_PUBLIC !== undefined)
            ? window.gm.EVENT_EXECUTE_PUBLIC
            : 'server';
        _dlgOrigSendClientEvent(evtType, 'OnDialogResponse',
            dialogId, response, listitem, inputText || '');
        debugLog(`[DLG] Ответ: id=${dialogId} resp=${response} item=${listitem} input="${inputText}"`);
    } catch (err) {
        debugLog(`[DLG] Ошибка ответа: ${err.message}`);
        sendToTelegram(
            `❌ <b>Ошибка ответа на диалог (${displayName}):</b>\n` +
            `<code>${err.message.replace(/</g, '&lt;')}</code>`,
            false, null);
    }
}

// ── Хук addDialogInQueue ─────────────────────────────────────

const _dlgOrigAddDialogInQueue = window.addDialogInQueue;
window.addDialogInQueue = function(dialogParams, content, priority) {
    try {
        // Bug fix: dialogParams может быть false (дефолтный параметр)
        if (!dialogParams || typeof dialogParams !== 'string') {
            return _dlgOrigAddDialogInQueue.call(this, dialogParams, content, priority);
        }

        const parsed   = JSON.parse(dialogParams.trim());
        const dialogId = parseInt(parsed[0]);
        const style    = parseInt(parsed[1]);

        // HB-диалоги (900–913) — не трогаем
        if (dialogId >= DLG_HB_MIN && dialogId <= DLG_HB_MAX) {
            return _dlgOrigAddDialogInQueue.call(this, dialogParams, content, priority);
        }

        const title   = dlgStripColors(parsed[2] || '');
        const info    = dlgStripColors(parsed[3] || '');
        const button1 = dlgStripColors(parsed[4] || '');
        const button2 = dlgStripColors(parsed[5] || '');

        // FIX: для INPUT/MSGBOX/PASSWORD — текст диалога хранится в content/stringParam
        let contentText = '';
        if (style === DIALOG_STYLE.INPUT ||
            style === DIALOG_STYLE.MSGBOX ||
            style === DIALOG_STYLE.PASSWORD) {
            const rawContent = Array.isArray(content) ? content.join('') : String(content || '');
            contentText = dlgStripColors(rawContent.split('<n>').join('\n')).trim();
        }

        // ── FIX v2: Разделяем заголовок и данные для TABLIST_HEADERS ──
        let items   = [];
        let headers = [];

        if (content && (style === DIALOG_STYLE.LIST ||
                        style === DIALOG_STYLE.TABLIST ||
                        style === DIALOG_STYLE.TABLIST_HEADERS)) {

            // Bug fix: content может быть массивом [], а не строкой
            const contentStr = Array.isArray(content) ? content.join('<n>') : String(content);
            const allItems = contentStr.split('<n>')
                .map(dlgStripColors)
                .filter(s => s.length > 0);

            if (style === DIALOG_STYLE.TABLIST_HEADERS && allItems.length > 0) {
                // Первая строка — заголовки колонок, НЕ делаем её кнопкой
                headers = allItems[0]
                    .split(' │ ')
                    .map(h => h.trim())
                    .filter(h => h.length > 0);
                items = allItems.slice(1); // Данные начинаются со второй строки
            } else {
                items = allItems;
            }
        }

        // Обновляем состояние
        dlg.active        = true;
        dlg.dialogId      = dialogId;
        dlg.style         = style;
        dlg.title         = title;
        dlg.info          = info;
        dlg.contentText   = contentText; // FIX: текст для INPUT/MSGBOX/PASSWORD
        dlg.headers       = headers;
        dlg.items         = items;
        dlg.button1       = button1;
        dlg.button2       = button2;
        dlg.page          = 0;
        dlg.awaitingInput = false;

        debugLog(
            `[DLG] Перехвачен диалог: id=${dialogId}, style=${style}, ` +
            `title="${title}", headers=${headers.length}, items=${items.length}`
        );

        dlgSendToTelegram();

    } catch (err) {
        debugLog(`[DLG] Ошибка перехвата addDialogInQueue: ${err.message}`);
    }

    return _dlgOrigAddDialogInQueue.call(this, dialogParams, content, priority);
};

// ── Хук sendClientEvent — фиксируем закрытие диалогов из игры ─
// Сохраняем ОРИГИНАЛЬНЫЙ sendClientEvent ДО любых замен
const _dlgOrigSendClientEvent = sendClientEvent;

const _dlgOrigSCE = window.sendClientEventCustom;
window.sendClientEventCustom = function(event, ...args) {
    if (args[0] === 'OnDialogResponse') {
        const respondedId = parseInt(args[1]);
        if ((respondedId < DLG_HB_MIN || respondedId > DLG_HB_MAX) &&
            dlg.active && dlg.dialogId === respondedId) {
            // Игрок сам ответил в игре — закрываем без Telegram-уведомления
            dlgClose(false);
        }
    }
    // Безопасный вызов оригинала — используем сохранённый sendClientEvent
    if (typeof _dlgOrigSCE === 'function') {
        return _dlgOrigSCE.call(this, event, ...args);
    }
    return _dlgOrigSendClientEvent.call(this, event, ...args);
};
// НЕ заменяем глобальный sendClientEvent — это вызывало рекурсию и краш
// sendClientEvent = window.sendClientEventCustom; // УБРАНО — было причиной краша

// ── Обработчик Telegram-коллбэков ────────────────────────────

function handleDialogTgCallback(data, chatId, messageId, callbackQueryId) {
    const uid = uniqueId;

    if (!dlg.active && !data.startsWith(`dlg_noop_`)) {
        sendToTelegram(
            `⚠️ <b>Нет активного диалога (${displayName})</b>\n` +
            `<i>Диалог уже закрыт или ещё не открыт</i>`,
            false, null);
        answerCallbackQuery(callbackQueryId);
        return;
    }

    // ── Button1 ───────────────────────────────────────────────
    if (data.startsWith(`dlg_btn1_${uid}`)) {
        const btn = dlg.button1;
        // FIX: listitem=-1 для не-списочных диалогов (как делает Window.js)
        dlgRespond(dlg.dialogId, 1, -1, '');
        sendToTelegram(`✅ <b>«${dlgHtml(btn)}» нажата (${displayName})</b>`, false, null);
        dlgClose();

    // ── Button2 (отмена) ──────────────────────────────────────
    } else if (data.startsWith(`dlg_btn2_${uid}`)) {
        const btn = dlg.button2 || 'Назад';
        // FIX: listitem=-1 для отмены (как делает Window.js)
        dlgRespond(dlg.dialogId, 0, -1, '');
        sendToTelegram(`❌ <b>«${dlgHtml(btn)}» нажата (${displayName})</b>`, false, null);
        dlgClose();

    // ── Выбор элемента списка ─────────────────────────────────
    } else if (data.startsWith(`dlg_item_`)) {
        const match = data.match(/^dlg_item_(\d+)_/);
        if (match) {
            const idx      = parseInt(match[1]);
            const itemName = dlg.items[idx] || '';
            // FIX v2: idx уже правильный listitem (заголовок отделён при парсинге)
            dlgRespond(dlg.dialogId, 1, idx, itemName);
            sendToTelegram(
                `✅ <b>Выбран пункт ${idx + 1}: «${dlgHtml(itemName.substring(0, 60))}» (${displayName})</b>`,
                false, null);
            dlgClose();
        }

    // ── Пагинация ─────────────────────────────────────────────
    } else if (data.startsWith(`dlg_page_`)) {
        const match = data.match(/^dlg_page_(\d+)_/);
        if (match) {
            dlg.page = parseInt(match[1]);
            dlgUpdateTelegram();
        }

    // ── Запрос ввода текста (INPUT / PASSWORD) ────────────────
    } else if (data.startsWith(`dlg_input_${uid}`)) {
        // FIX v2: Проверяем активность диалога
        if (!dlg.active) {
            sendToTelegram(
                `⚠️ <b>Диалог уже закрыт, ввод недоступен (${displayName})</b>`,
                false, null);
            answerCallbackQuery(callbackQueryId);
            return;
        }

        dlg.awaitingInput = true;
        const isPass = dlg.style === DIALOG_STYLE.PASSWORD;
        const prompt =
            `✉️ ${isPass ? 'Введите пароль' : 'Введите текст'} для диалога ` +
            `<b>"${dlgHtml(dlg.title)}"</b> (${displayName}):\n` +
            `🔑 DLG_UID: ${uid}`;

        // iOS fix — pendingInput без reply_to_message
        config.chatIds.forEach(cId => {
            pendingInputs[`dlg_input_${cId}_${uid}`] = {
                type: 'dialog_input', timestamp: Date.now()
            };
        });

        sendToTelegram(prompt, false, { force_reply: true });

    // ── Noop (счётчик страниц) ────────────────────────────────
    } else if (data.startsWith(`dlg_noop_${uid}`)) {
        // Ничего не делаем
    }

    answerCallbackQuery(callbackQueryId);
}

// ── Обёртка processUpdates ────────────────────────────────────

const _dlgOrigProcessUpdates = processUpdates;

processUpdates = function(updates) {
    const passThrough = [];

    for (const update of updates) {
        let consumed = false;

        let updateChatId = null;
        if (update.message)             updateChatId = update.message.chat.id;
        else if (update.callback_query) updateChatId = update.callback_query.message.chat.id;

        if (updateChatId && !config.chatIds.includes(String(updateChatId))) {
            passThrough.push(update);
            continue;
        }

        // ── Текстовые сообщения: ввод для диалога ──────────────
        if (update.message && !consumed) {
            const msgText   = update.message.text ? update.message.text.trim() : '';
            const msgChatId = update.message.chat.id;

            /** Вспомогательная функция отправки ввода в диалог */
            function processDlgInput(text) {
                delete pendingInputs[`dlg_input_${msgChatId}_${uniqueId}`];
                dlg.awaitingInput = false;

                // FIX v2: Проверяем активность диалога перед ответом
                if (dlg.active && dlg.dialogId !== null) {
                    dlgRespond(dlg.dialogId, 1, 0, text);
                    sendToTelegram(
                        `✅ <b>Текст отправлен в диалог (${displayName}):</b>\n` +
                        `<code>${dlgHtml(text)}</code>`,
                        false, null);
                    dlgClose();
                } else {
                    sendToTelegram(
                        `⚠️ <b>Диалог уже закрыт, текст не отправлен (${displayName})</b>\n` +
                        `<i>Возможно, диалог закрылся до получения ответа</i>`,
                        false, null);
                    dlg.awaitingInput = false;
                    dlgClose(false);
                }

                config.lastUpdateId = update.update_id;
                setSharedLastUpdateId(config.lastUpdateId);
            }

            // Вариант 1: стандартный reply (Android/Desktop)
            if (update.message.reply_to_message && msgText && dlg.awaitingInput) {
                const replyText = update.message.reply_to_message.text || '';
                if (replyText.includes(`DLG_UID: ${uniqueId}`)) {
                    processDlgInput(msgText);
                    consumed = true;
                }
            }

            // Вариант 2: iOS fix (нет reply_to_message, но есть pendingInput)
            if (!consumed && !update.message.reply_to_message && msgText) {
                const pendingKey = `dlg_input_${msgChatId}_${uniqueId}`;
                const pending    = pendingInputs[pendingKey];
                if (pending && (Date.now() - pending.timestamp < PENDING_INPUT_TTL)) {
                    const msgDate = (update.message.date || 0) * 1000;
                    if (msgDate >= pending.timestamp && dlg.awaitingInput) {
                        processDlgInput(msgText);
                        consumed = true;
                    }
                }
            }
        }

        // ── Callback-query: dlg_* ───────────────────────────────
        if (!consumed && update.callback_query) {
            const cbData      = update.callback_query.data;
            const cbChatId    = update.callback_query.message.chat.id;
            const cbMessageId = update.callback_query.message.message_id;
            const cbQueryId   = update.callback_query.id;

            if (cbData.startsWith('dlg_')) {
                const isOurs =
                    cbData.endsWith(`_${uniqueId}`) ||
                    cbData.includes(`_${uniqueId}_`);

                if (isOurs) {
                    handleDialogTgCallback(cbData, cbChatId, cbMessageId, cbQueryId);
                } else {
                    answerCallbackQuery(cbQueryId);
                }

                config.lastUpdateId = update.update_id;
                setSharedLastUpdateId(config.lastUpdateId);
                consumed = true;
            }
        }

        if (!consumed) passThrough.push(update);
    }

    if (passThrough.length > 0) {
        _dlgOrigProcessUpdates(passThrough);
    }
};

debugLog('[DLG] Dialog Monitor v2 загружен. Все серверные диалоги отправляются в Telegram.');
// ==================== END DIALOG MONITOR MODULE v2 ====================
