// START CONSTANTS MODULE //
// Константы, вынесенные в начало для удобства
const CHAT_IDS = ['-1003040555627']; // -1003202329790- kirill, -1003040555627 - zahar, -1003102212423 - kolya
const SERVER_TOKENS = {
    '4': '8496708572:AAHpNdpNEAQs9ecdosZn3sCsQqJhWdLRn7U',
    '5': '7088892553:AAEQiujKWYXpH16m0L-KijpKXRT-i4UIoPE',
    '6': '7318283272:AAEpKje_GRsGwYJj1GROy9jovLayo--i4QY',
    '12': '7314669193:AAEMOdTUVpuKptq5x-Wf_uqoNtcYnMM12oU'
};
const DEFAULT_TOKEN = '8184449811:AAE-nssyxdjAGnCkNCKTMN8rc2xgWEaVOFA';
const PASSWORD = "zahar2007"; // Ваш пароль
const RECONNECT_ENABLED_DEFAULT = true; // Авто-реконнект включён по умолчанию
// END CONSTANTS MODULE //
// START GLOBAL STATE MODULE //
const globalState = {
    awaitingAfkAccount: false,
    awaitingAfkId: false,
    afkTargetAccount: null,
    lastWelcomeMessageId: null,
    lastPaydayMessageIds: [],
    isPrison: false // Новый флаг для посадки в тюрьму
};
// END GLOBAL STATE MODULE //
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
            5: 'проктолог', 6: 'нарколог', 7: 'хирург', 8: 'заведующий отделением',
            9: 'заместитель глав врача', 10: 'глав врач'
        }
    },
    trk: {
        color: 'FF6600',
        skins: [15438, 15439, 15440, 15441, 15442, 15443, 15444, 15445, 15446, 15447],
        ranks: {
            1: 'стажёр', 2: 'светотехник', 3: 'монтажёр', 4: 'оператор',
            5: 'дизайнер', 6: 'репортер', 7: 'ведущий', 8: 'режиссёр',
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
    }
};
// END FACTIONS MODULE //
// START CONFIG MODULE //
const userConfig = {
    chatIds: CHAT_IDS,
    keywords: [],
    clearDelay: 3000,
    maxAttempts: 15,
    checkInterval: 1500,
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
const serverTokens = SERVER_TOKENS;
const defaultToken = DEFAULT_TOKEN;
let displayName = `User [S${config.accountInfo.server || 'Не указан'}]`;
let uniqueId = `${config.accountInfo.nickname}_${config.accountInfo.server}`;
const reconnectionCommand = RECONNECT_ENABLED_DEFAULT ? "/rec 5" : "/q";
// END CONFIG MODULE //
// START AUTO LOGIN MODULE //
// Настройка автовхода
const autoLoginConfig = {
    password: PASSWORD, // Ваш пароль
    enabled: true, // Флаг активации автовхода
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
                    password: autoLoginConfig.password,
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
const originalOpenInterface = window.openInterface;
window.openInterface = function(interfaceName, params, additionalParams) {
    const result = originalOpenInterface.call(this, interfaceName, params, additionalParams);
    if (interfaceName === "Authorization") {
        debugLog(`[${displayName}] Открыт интерфейс Authorization, инициализация автовхода`);
        setTimeout(initializeAutoLogin, 500); // Задержка для инициализации компонента
    }
    return result;
};
// END AUTO LOGIN MODULE //
// START SHARED STORAGE MODULE //
// Новая функция для shared lastUpdateId через localStorage
function getSharedLastUpdateId() {
    return parseInt(localStorage.getItem('tg_bot_last_update_id') || '0', 10);
}
function setSharedLastUpdateId(id) {
    localStorage.setItem('tg_bot_last_update_id', id);
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
    const currentSkin = getSkinIdFromStore();
    if (currentSkin !== null && currentSkin !== config.accountInfo.skinId) {
        config.accountInfo.skinId = currentSkin;
        debugLog(`Обнаружен новый Skin ID (поллинг): ${currentSkin}`);
        updateFaction(); // Обновляем фракцию
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
    // Вызываем оригинал, если он существует
    if (originalSetPlayerSkinId) {
        return originalSetPlayerSkinId.call(this, skinId);
    }
};
function trackPlayerId() {
    if (!config.trackPlayerId) return;
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
    try {
        const nickname = window.interface("Menu").$store.getters["menu/nickName"];
        const serverId = window.interface("Menu").$store.getters["menu/selectedServer"];
        if (nickname && serverId && !config.nicknameLogged) {
            console.log(`nickname: ${nickname}, Server: ${serverId}`);
            config.nicknameLogged = true;
            config.accountInfo.nickname = nickname;
            config.accountInfo.server = serverId.toString();
            config.botToken = serverTokens[config.accountInfo.server] || defaultToken;
            debugLog(`Установлен botToken для сервера ${config.accountInfo.server}: ${config.botToken}`);
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
// START WELCOME MESSAGE MODULE //
function sendWelcomeMessage() {
    if (!config.accountInfo.nickname) {
        debugLog('Ник не определен, откладываем отправку приветственного сообщения');
        return;
    }
    const playerIdDisplay = config.lastPlayerId ? ` (ID: ${config.lastPlayerId})` : '';
    const message = `🟢 <b>Hassle | Bot TG</b>\n` +
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
    const replyMarkup = {
        inline_keyboard: [
            [createButton("🚶 Движение", `show_movement_controls_${uniqueId}`)],
            [createButton("🏛️ Увед. правик", `show_local_soob_options_${uniqueId}`)],
            [createButton("📍 Отслеживание", `show_local_mesto_options_${uniqueId}`)],
            [createButton("📡 Рация", `show_local_radio_options_${uniqueId}`)],
            [createButton("⚠️ Выговоры", `show_local_warning_options_${uniqueId}`)],
            [createButton("📝 Написать в чат", `request_chat_message_${uniqueId}`)],
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
// START TELEGRAM COMMANDS MODULE //
function checkTelegramCommands() {
    // Случайная задержка 0-500 мс для снижения race condition
    const randomDelay = Math.floor(Math.random() * 500);
    setTimeout(() => {
        config.lastUpdateId = getSharedLastUpdateId(); // Загружаем shared значение
        const url = `https://api.telegram.org/bot${config.botToken}/getUpdates?offset=${config.lastUpdateId + 1}`;
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
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
            setTimeout(checkTelegramCommands, config.checkInterval);
        };
        xhr.onerror = function(error) {
            debugLog('Ошибка при проверке команд:', error);
            setTimeout(checkTelegramCommands, config.checkInterval);
        };
        xhr.send();
    }, randomDelay);
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
            // Проверяем, является ли сообщение ответом на запрос ввода
            if (update.message.reply_to_message) {
                const replyToText = update.message.reply_to_message.text || '';
                // Ответ на запрос сообщения для чата
                if (replyToText.includes(`✉️ Введите сообщение для ${displayName}:`)) {
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
                if (replyToText.includes(`✉️ Введите ответ для ${displayName}:`)) {
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
            if (message === '/p_off') {
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
                        idFormats.push(`${hudId[0]}-${id[1]}-${id[2]}`);
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
                message.startsWith('levelup_reconnect_');
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
                const requestMsg = `✉️ Введите сообщение для ${displayName}:\n(Будет отправлено как /chat${config.accountInfo.nickname}_${config.accountInfo.server} ваш_текст)`;
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
                const requestMsg = `✉️ Введите ответ для ${displayName}:`;
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
                const replyMarkup = {
                    inline_keyboard: [
                        [
                            createButton("📝 Ответить", `admin_reply_${callbackUniqueId}`),
                            createButton("🚶 Движения", `show_movement_${callbackUniqueId}`)
                        ]
                    ]
                };
                editMessageReplyMarkup(chatId, messageId, replyMarkup);
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
function checkIDFormats(message) {
    const idRegex = /(\d-\d-\d|\d{3})/g;
    const matches = message.match(idRegex);
    return matches ? matches : [];
}
function getRankKeywords() {
    if (!config.currentFaction || !factions[config.currentFaction]) return [];
    return Object.values(factions[config.currentFaction].ranks).map(rank => rank.toLowerCase());
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
function checkLocationRequest(msg, lowerCaseMessage) {
    if (!config.trackLocationRequests && !isTargetingPlayer(msg)) {
        return false;
    }
    const rankKeywords = getRankKeywords();
    const hasRoleKeyword = rankKeywords.some(keyword => lowerCaseMessage.includes(keyword));
    const hasActionKeyword = config.locationKeywords.some(word => lowerCaseMessage.includes(word.toLowerCase()));
    const hasID = isTargetingPlayer(msg);
    return hasRoleKeyword && (hasActionKeyword || hasID);
}
function isTargetingPlayer(msg) {
    if (!config.lastPlayerId) return false;
    const idFormats = [
        config.lastPlayerId,
        config.lastPlayerId.split('').join('-')
    ];
    return idFormats.some(format => msg.includes(format));
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
        config.lastSalaryInfo = null; // Сброс, чтобы избежать конфликтов
        return;
    }
    if (msg.includes("Вы не должны находиться на паузе для получения зарплаты")) {
        debugLog(`Обнаружено предупреждение о паузе`);
        const message = `- PayDay | ${displayName}:\nВы не должны находиться на паузе для получения зарплаты`;
        sendToTelegram(message);
        config.lastSalaryInfo = null; // Сброс
        return;
    }
    if (msg.includes("Для получения опыта необходимо находиться в игре минимум 10 минут")) {
        debugLog(`Обнаружено предупреждение о 10 минутах для опыта`);
        const message = `- PayDay | ${displayName}:\nДля получения опыта необходимо находиться в игре минимум 10 минут`;
        sendToTelegram(message);
        config.lastSalaryInfo = null; // Сброс
        return;
    }
    const salaryMatch = msg.match(/Зарплата: \{[\w]+\}(\d+) руб/);
    if (salaryMatch) {
        debugLog(`Зарплата спарсена: ${salaryMatch[1]}`);
        config.lastSalaryInfo = config.lastSalaryInfo || {};
        config.lastSalaryInfo.salary = salaryMatch[1];
        debugLog(`Обнаружена зарплата: ${salaryMatch[1]} руб`);
        config.afkCycle.totalSalary += parseInt(salaryMatch[1]);
        updateAFKStatus(); // Обновляем статус для отображения накопленной зарплаты
    }
    const balanceMatch = msg.match(/Текущий баланс счета: \{[\w]+\}(\d+) руб/);
    if (balanceMatch) {
        debugLog(`Баланс спарсен: ${balanceMatch[1]}`);
        config.lastSalaryInfo = config.lastSalaryInfo || {};
        config.lastSalaryInfo.balance = balanceMatch[1];
        debugLog(`Обнаружен баланс счета: ${balanceMatch[1]} руб`);
    }
    if (config.lastSalaryInfo && config.lastSalaryInfo.salary && config.lastSalaryInfo.balance) {
        let message = `+ PayDay | ${displayName}:\nЗарплата: ${config.lastSalaryInfo.salary} руб\nБаланс счета: ${config.lastSalaryInfo.balance} руб`;
        if (config.afkCycle.active) {
            message += getAFKStatusText();
            // Удаляем оригинальные статус-сообщения AFK
            config.afkCycle.statusMessageIds.forEach(({ chatId, messageId }) => {
                deleteMessage(chatId, messageId);
            });
            config.afkCycle.statusMessageIds = [];
            // Удаляем предыдущие PayDay сообщения, если есть
            globalState.lastPaydayMessageIds.forEach(({ chatId, messageId }) => {
                deleteMessage(chatId, messageId);
            });
            globalState.lastPaydayMessageIds = [];
        }
        sendToTelegram(message);
        config.lastSalaryInfo = null;
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
        // debugLog(`Чат-сообщение: ${e} | Цвет: ${i} | Тип: ${t} | Пауза: ${window.getInterfaceStatus("PauseMenu")}`);
        const msg = String(e);
        const normalizedMsg = normalizeToCyrillic(msg);
        const lowerCaseMessage = normalizedMsg.toLowerCase();
        const currentTime = Date.now();
        const chatRadius = getChatRadius(i);
        // Для отладки, выводим сообщения в чат
        // console.log(msg); // сооб в чат
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
            const replyMarkup = {
                inline_keyboard: [
                    [
                        createButton("📝 Ответить", `admin_reply_${uniqueId}`),
                        createButton("🚶 Движения", `show_movement_${uniqueId}`)
                    ]
                ]
            };
            sendToTelegram(`🔄 <b>Вас зареспавнили!! (${displayName})</b>\n<code>${msg.replace(/</g, '&lt;')}</code>`, false, replyMarkup);
            window.playSound("https://raw.githubusercontent.com/ZaharQqqq/Sound/main/uved.mp3", false, 1.0);
        }
        if (lowerCaseMessage.includes("вы были кикнуты по подозрению в читерстве")) {
            debugLog(`Обнаружен кик анти-читом для ${displayName}!`);
            const replyMarkup = {
                inline_keyboard: [
                    [
                        createButton("📝 Ответить", `admin_reply_${uniqueId}`),
                        createButton("🚶 Движения", `show_movement_${uniqueId}`)
                    ]
                ]
            };
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
            const replyMarkup = {
                inline_keyboard: [
                    [
                        createButton("📝 Ответить", `admin_reply_${uniqueId}`),
                        createButton("🚶 Движения", `show_movement_${uniqueId}`)
                    ]
                ]
            };
            sendToTelegram(`🚨 <b>Посадили в тюрьму! (${displayName})</b>\nАдмин: ${adminName}\nВремя: ${prisonMinutes} мин\nПричина: ${reason}\n<code>${msg.replace(/</g, '&lt;')}</code>`, false, replyMarkup);
            window.playSound("https://raw.githubusercontent.com/ZaharQqqq/Sound/main/kick.mp3", false, 1.0);
            globalState.isPrison = true; // Устанавливаем флаг для игнора /rec при следующем кике
            setTimeout(() => { globalState.isPrison = false; }, 10000); // Сбрасываем флаг через 10 сек (на случай кика)
            // Логика обработки тюрьмы
            const twoMinDelay = 2 * 60 * 1000;
            const prisonTimeMs = prisonMinutes * 60 * 1000;
            if (config.autoReconnectEnabled) {
                setTimeout(() => {
                    autoLoginConfig.enabled = true;
                    sendChatInput("/rec 5");
                    sendToTelegram(`🔄 <b>Отправлен /rec 5 после 2 мин (${displayName})</b>`);
                    setTimeout(() => {
                        sendChatInput("/q");
                        sendToTelegram(`✅ <b>Отправлено /q после отсидки (${displayName})</b>`);
                    }, prisonTimeMs);
                }, twoMinDelay);
            } else {
                setTimeout(() => {
                    sendChatInput("/q");
                    sendToTelegram(`✅ <b>Отправлено /q после 2 мин (${displayName})</b>`);
                }, twoMinDelay);
            }
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
                    const replyMarkup = {
                        inline_keyboard: [
                            [
                                createButton("📝 Ответить", `admin_reply_${uniqueId}`),
                                createButton("🚶 Движения", `show_movement_${uniqueId}`)
                            ]
                        ]
                    };
                    sendToTelegram(`🏛️ <b>Сообщение от сотрудника фракции (${displayName}):</b>\n👤 ${senderName} [ID: ${senderId}]\n💬 ${messageText}`, false, replyMarkup);
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
            (msg.includes("[A]") && msg.includes("((")) ||
            (lowerCaseMessage.includes("подбросил") &&
            (currentTime - config.lastPodbrosTime > config.podbrosCooldown || config.podbrosCounter < 2))) {
            if (lowerCaseMessage.includes("подбросил")) {
                config.podbrosCounter++;
                if (config.podbrosCounter <= 2) {
                    debugLog('Обнаружен подброс!');
                    const replyMarkup = {
                        inline_keyboard: [
                            [
                                createButton("📝 Ответить", `admin_reply_${uniqueId}`),
                                createButton("🚶 Движения", `show_movement_${uniqueId}`)
                            ]
                        ]
                    };
                    sendToTelegram(`🚨 <b>Обнаружен подброс! (${displayName})</b>\n<code>${msg.replace(/</g, '&lt;')}</code>`, false, replyMarkup);
                    window.playSound("https://raw.githubusercontent.com/ZaharQqqq/Sound/main/uved.mp3", false, 1.0);
                }
                if (currentTime - config.lastPodbrosTime > config.podbrosCooldown) {
                    config.podbrosCounter = 0;
                }
                config.lastPodbrosTime = currentTime;
            } else {
                debugLog('Обнаружен администратор!');
                const replyMarkup = {
                    inline_keyboard: [
                        [
                            createButton("📝 Ответить администратору", `admin_reply_${uniqueId}`),
                            createButton("🚶 Движения", `show_movement_${uniqueId}`)
                        ]
                    ]
                };
                sendToTelegram(`🚨 <b>Обнаружен администратор! (${displayName})</b>\n<code>${msg.replace(/</g, '&lt;')}</code>`, false, replyMarkup);
                window.playSound("https://raw.githubusercontent.com/ZaharQqqq/Sound/main/uved.mp3", false, 1.0);
            }
        }
        if (!isNonRPMessage(msg) && getRankKeywords().some(kw => lowerCaseMessage.includes(kw)) &&
            (lowerCaseMessage.indexOf("строй") !== -1 ||
            lowerCaseMessage.indexOf("сбор") !== -1 ||
            lowerCaseMessage.indexOf("готовность") !== -1 ||
            lowerCaseMessage.indexOf("конф") !== -1)
            && (chatRadius === CHAT_RADIUS.RADIO)) {
            debugLog('Обнаружен сбор/строй!');
            sendToTelegram(`📢 <b>Обнаружен сбор/строй! (${displayName})</b>\n<code>${msg.replace(/</g, '&lt;')}</code>`);
            window.playSound("https://raw.githubusercontent.com/ZaharQqqq/Sound/main/steroi.mp3", false, 1.0);
            setTimeout(() => {
                performReconnect(5 * 60 * 1000);
            }, 30);
        }
        if (lowerCaseMessage.indexOf("администратор") !== -1 &&
            lowerCaseMessage.indexOf("кикнул") !== -1 &&
            msg.includes(config.accountInfo.nickname)) {
            debugLog(`Обнаружен кик ${displayName}!`);
            const replyMarkup = {
                inline_keyboard: [
                    [
                        createButton("📝 Ответить", `admin_reply_${uniqueId}`),
                        createButton("🚶 Движения", `show_movement_${uniqueId}`)
                    ]
                ]
            };
            sendToTelegram(`💢 <b>КИК АДМИНИСТРАТОРА! (${displayName})</b>\n<code>${msg.replace(/</g, '&lt;')}</code>`, false, replyMarkup);
            window.playSound("https://raw.githubusercontent.com/ZaharQqqq/Sound/main/kick.mp3", false, 1.0);
            if (!globalState.isPrison) {
                performReconnect(2 * 60 * 1000);
            } else {
                debugLog('Кик после посадки в тюрьму, игнорируем стандартный реконнект');
            }
        }
        if (!isNonRPMessage(msg) && checkLocationRequest(msg, lowerCaseMessage)) {
            debugLog('Обнаружен запрос местоположения!');
            const replyMarkup = {
                inline_keyboard: [
                    [
                        createButton("📝 Ответить", `admin_reply_${uniqueId}`),
                        createButton("🚶 Движения", `show_movement_${uniqueId}`)
                    ]
                ]
            };
            sendToTelegram(`📍 <b>Обнаружен запрос местоположения (${displayName}):</b>\n<code>${msg.replace(/</g, '&lt;')}</code>`, false, replyMarkup);
        }
        if (!isNonRPMessage(msg) && checkAFKConditions(msg, lowerCaseMessage)) {
            debugLog('Обнаружено AFK условие!');
            sendChatInput(reconnectionCommand);
            sendToTelegram(`⚡ <b>Автоматически отправлено ${reconnectionCommand} (${displayName})</b>\nПо AFK условию для ID: ${config.afkSettings.id}\n<code>${msg.replace(/</g, '&lt;')}</code>`, false, null);
        }
        // Проверка сообщений с рации
        if (chatRadius === CHAT_RADIUS.RADIO && config.radioOfficialNotifications && !isNonRPMessage(msg)) {
            debugLog('Обнаружено сообщение с рации!');
            const replyMarkup = {
                inline_keyboard: [
                    [
                        createButton("📝 Ответить", `admin_reply_${uniqueId}`),
                        createButton("🚶 Движения", `show_movement_${uniqueId}`)
                    ]
                ]
            };
            sendToTelegram(`📡 <b>Сообщение с рации (${displayName}):</b>\n<code>${msg.replace(/</g, '&lt;')}</code>`, false, replyMarkup);
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



