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
// ==================== ИСПРАВЛЕНИЕ v2 ====================
// ИСПРАВЛЕНА ПРОБЛЕМА "КНОПКИ НЕ СРАБАТЫВАЮТ С ПЕРВОГО РАЗА"
//
// Причина: Polling каждые 1500мс + случайная задержка 0-500мс
//          = кнопка ждёт ответа до 2 секунд.
//          answerCallbackQuery вызывался ПОСЛЕ обработки — кнопка "крутилась"
//
// Решение:
// 1. Long Polling (timeout=10) — Telegram держит соединение и отвечает
//    МГНОВЕННО при новом апдейте. Нет задержки опроса.
// 2. answerCallbackQuery вызывается СРАЗУ при получении callback_query
//    — кнопка перестаёт "крутиться" немедленно
// 3. Lock через localStorage — защита от дублирования при нескольких
//    аккаунтах без случайных задержек
// ===========================================================

const SERVER_TOKENS = {
    '4': '8496708572:AAHpNdpNEAQs9ecdosZn3sCsQqJhWdLRn7U',
    '5': '7088892553:AAEQiujKWYXpH16m0L-KijpKXRT-i4UIoPE',
    '6': '7318283272:AAEpKje_GRsGwYJj1GROy9jovLayo--i4QY',
	'9': '8549354393:AAH3KUXtuSBZJ4SO4qw5s5WmWJ9_kypclBY',
    '12': '7314669193:AAEMOdTUVpuKptq5x-Wf_uqoNtcYnMM12oU'
};
// остальное в /list
// END CONSTANTS MODULE //
// START GLOBAL STATE MODULE //
const globalState = {
    awaitingAfkAccount: false,
    awaitingAfkId: false,
    afkTargetAccount: null,
    lastWelcomeMessageId: null,
    lastPaydayMessageIds: [],
    isPrison: false
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
            5: 'проктолог', 6: 'нарколог', 7: 'хирург', 8: 'зав. отделом',
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
    autoReconnectEnabled: RECONNECT_ENABLED_DEFAULT
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
    ignoredStroiNicknames: ['Denis_Bymer'],
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
        reconnectEnabled: RECONNECT_ENABLED_DEFAULT,
        restartAction: 'q'
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
const autoLoginConfig = {
    password: PASSWORD,
    enabled: true,
    maxAttempts: 10,
    attemptInterval: 1000
};
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
    if (!window.getInterfaceStatus("Authorization")) {
        debugLog(`Попытка ${attempt}: Интерфейс Authorization не открыт, повтор через ${autoLoginConfig.attemptInterval}мс`);
        setTimeout(() => setupAutoLogin(attempt + 1), autoLoginConfig.attemptInterval);
        return;
    }
    const authInstance = window.interface("Authorization");
    if (!authInstance) {
        debugLog(`Попытка ${attempt}: Экземпляр Authorization не найден, повтор через ${autoLoginConfig.attemptInterval}мс`);
        setTimeout(() => setupAutoLogin(attempt + 1), autoLoginConfig.attemptInterval);
        return;
    }
    const loginInstance = authInstance.getInstance("auth");
    if (!loginInstance) {
        debugLog(`Попытка ${attempt}: Экземпляр Login не найден, повтор через ${autoLoginConfig.attemptInterval}мс`);
        setTimeout(() => setupAutoLogin(attempt + 1), autoLoginConfig.attemptInterval);
        return;
    }
    debugLog(`[${displayName}] Автоввод пароля: ${autoLoginConfig.password}`);
    loginInstance.password.value = autoLoginConfig.password;
    setTimeout(() => {
        if (loginInstance.password.value === autoLoginConfig.password) {
            debugLog(`[${displayName}] Эмуляция нажатия кнопки "Войти"`);
            try {
                loginInstance.onClickEvent("play");
                sendToTelegram(`✅ Автовход выполнен для ${displayName}`, true, null);
                setTimeout(() => {
                    showScreenNotification(
                        "HASSLE", 
                        "Скрипт загружен.<br>Меню /hb или Телеграмм.", 
                        "FFFF00",
                        6000
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
function initializeAutoLogin() {
    if (!autoLoginConfig.enabled) {
        debugLog('Автовход отключен в конфигурации');
        return;
    }
    if (window.getInterfaceStatus("Authorization")) {
        debugLog('Интерфейс Authorization уже открыт, запускаем автовход');
        setupAutoLogin();
    } else {
        const openParams = [
            "auth",
            config.accountInfo.nickname || "Pavel_Nabokov",
            "", "", "", "", "",
            "https://radmir.online/recovery-password",
            { autoLogin: { password: autoLoginConfig.password, enabled: autoLoginConfig.enabled } }
        ];
        debugLog(`Открываем интерфейс Authorization для ${displayName}`);
        try {
            window.openInterface("Authorization", JSON.stringify(openParams));
        } catch (err) {
            debugLog(`Ошибка при открытии Authorization: ${err.message}`);
            sendToTelegram(`❌ <b>Ошибка ${displayName}</b>\nНе удалось открыть интерфейс Authorization\n<code>${err.message}</code>`, false, null);
            return;
        }
        let attempts = 0;
        const checkInterval = setInterval(() => {
            attempts++;
            if (window.getInterfaceStatus("Authorization")) {
                clearInterval(checkInterval);
                debugLog('Интерфейс Authorization открыт, запускаем автовход');
                setTimeout(setupAutoLogin, 1000);
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
const originalOpenInterface = window.openInterface;
window.openInterface = function(interfaceName, params, additionalParams) {
    const result = originalOpenInterface.call(this, interfaceName, params, additionalParams);
    if (interfaceName === "Authorization") {
        debugLog(`[${displayName}] Открыт интерфейс Authorization, инициализация автовхода`);
        setTimeout(initializeAutoLogin, 500);
    }
    return result;
};
// END AUTO LOGIN MODULE //
// START SHARED STORAGE MODULE //
function getSharedLastUpdateId() {
    return parseInt(localStorage.getItem('tg_bot_last_update_id') || '0', 10);
}
function setSharedLastUpdateId(id) {
    localStorage.setItem('tg_bot_last_update_id', id.toString());
    debugLog(`Обновлён shared lastUpdateId: ${id}`);
}

// ==================== LOCK СИСТЕМА ДЛЯ CALLBACK ====================
// Предотвращает обработку одного callback_query несколькими аккаунтами
function tryAcquireCallbackLock(callbackQueryId) {
    const lockKey = `tg_cb_lock_${callbackQueryId}`;
    const existing = localStorage.getItem(lockKey);
    if (existing) {
        debugLog(`Callback ${callbackQueryId} уже обрабатывается другим аккаунтом`);
        return false;
    }
    // Записываем lock с нашим uniqueId и временем
    localStorage.setItem(lockKey, `${uniqueId}_${Date.now()}`);
    // Через 10 секунд автоматически снимаем lock
    setTimeout(() => localStorage.removeItem(lockKey), 10000);
    return true;
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
function normalizeToCyrillic(text) {
    const map = {
        'A': 'А', 'a': 'а',
        'B': 'В', 'b': 'в',
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
        '3': 'З',
    };
    return text.split('').map(char => map[char] || char).join('');
}
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
    const skinId = Number(config.accountInfo.skinId);
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
        updateFaction();
    }
    setTimeout(trackSkinId, config.skinCheckInterval);
}
let originalSetPlayerSkinId = window.setPlayerSkinId;
window.setPlayerSkinId = function(skinId) {
    debugLog(`Перехвачен вызов setPlayerSkinId с Skin ID: ${skinId}`);
    config.accountInfo.skinId = skinId;
    updateFaction();
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
        updateDisplayName();
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
            updateDisplayName();
            uniqueId = `${config.accountInfo.nickname}_${config.accountInfo.server}`;
            sendWelcomeMessage();
            registerUser();
            setTimeout(() => {
                const initialSkin = getSkinIdFromStore();
                if (initialSkin !== null) {
                    config.accountInfo.skinId = initialSkin;
                    debugLog(`Initial Skin ID after login: ${initialSkin}`);
                    updateFaction();
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
                if (message.includes('Hassle | Bot TG') && message.includes('Текущие настройки')) {
                    globalState.lastWelcomeMessageId = messageId;
                }
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
// ==================== ИСПРАВЛЕННАЯ answerCallbackQuery ====================
// Вызывается НЕМЕДЛЕННО при получении callback_query, до любой обработки.
// Это убирает "крутилку" на кнопке моментально.
function answerCallbackQuery(callbackQueryId, text = '') {
    const url = `https://api.telegram.org/bot${config.botToken}/answerCallbackQuery`;
    const payload = {
        callback_query_id: callbackQueryId
    };
    if (text) payload.text = text;
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
    const message = `🟢 <b>Hassle | BotFIX TG</b>\n` +
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
            sendToTelegram(message, false, replyMarkup);
        }
    });
}
// END WELCOME MESSAGE MODULE //
// START AFK MODULE //
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
    if (chatId && messageId) {
        showGlobalFunctionsMenu(chatId, messageId, uniqueId);
    }
}
function startAFKCycle() {
    config.afkCycle.active = true;
    config.afkCycle.startTime = Date.now();
    config.afkCycle.totalPlayTime = 0;
    config.afkCycle.playHistory = [];
    config.afkCycle.pauseHistory = [];
    config.afkCycle.statusMessageIds = [];
    config.afkCycle.totalSalary = 0;
    debugLog(`AFK цикл запущен для ${displayName}`);
    updateAFKStatus(true);
}
function stopAFKCycle() {
    if (config.afkCycle.cycleTimer) { clearTimeout(config.afkCycle.cycleTimer); }
    if (config.afkCycle.playTimer) { clearTimeout(config.afkCycle.playTimer); }
    if (config.afkCycle.pauseTimer) { clearTimeout(config.afkCycle.pauseTimer); }
    if (config.afkCycle.mainTimer) { clearTimeout(config.afkCycle.mainTimer); }
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
        playDurationMs = requiredPlayTime - config.afkCycle.totalPlayTime;
        if (playDurationMs <= 0) {
            handleCycleEnd();
            return;
        }
    }
    const durationMin = Math.floor(playDurationMs / 60000);
    const currentTime = getCurrentTimeString();
    config.afkCycle.playHistory.push(`▶️ Игровой режим [${durationMin} мин] в ${currentTime}`);
    if (config.afkCycle.playHistory.length > 3) { config.afkCycle.playHistory.shift(); }
    updateAFKStatus();
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
    if (config.afkCycle.pauseHistory.length > 3) { config.afkCycle.pauseHistory.shift(); }
    updateAFKStatus();
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
    if (config.afkCycle.pauseHistory.length > 3) { config.afkCycle.pauseHistory.shift(); }
    updateAFKStatus();
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
    if (!config.afkSettings.active) { return; }
    if (config.afkCycle.cycleTimer) { clearTimeout(config.afkCycle.cycleTimer); }
    if (config.afkCycle.playTimer) { clearTimeout(config.afkCycle.playTimer); }
    if (config.afkCycle.pauseTimer) { clearTimeout(config.afkCycle.pauseTimer); }
    if (config.afkCycle.mainTimer) { clearTimeout(config.afkCycle.mainTimer); }
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
    if (!config.afkCycle.active) { startAFKCycle(); }
    config.afkCycle.startTime = Date.now();
    config.afkCycle.totalPlayTime = 0;
    debugLog(`Обнаружено сообщение "Текущее время:", начинаем AFK цикл для ${displayName}`);
    updateAFKStatus();
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
    const replyMarkup = { inline_keyboard: inlineKeyboard };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function showPayDayOptionsMenu(chatId, messageId, uniqueIdParam) {
    const replyMarkup = {
        inline_keyboard: [
            [createButton("🔔 ВКЛ", `global_p_on_${uniqueIdParam}`), createButton("🔕 ВЫКЛ", `global_p_off_${uniqueIdParam}`)],
            [createButton("⬅️ Вернуться назад", `show_global_functions_${uniqueIdParam}`)]
        ]
    };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function showSoobOptionsMenu(chatId, messageId, uniqueIdParam) {
    const replyMarkup = {
        inline_keyboard: [
            [createButton("🔔 ВКЛ", `global_soob_on_${uniqueIdParam}`), createButton("🔕 ВЫКЛ", `global_soob_off_${uniqueIdParam}`)],
            [createButton("⬅️ Вернуться назад", `show_global_functions_${uniqueIdParam}`)]
        ]
    };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function showMestoOptionsMenu(chatId, messageId, uniqueIdParam) {
    const replyMarkup = {
        inline_keyboard: [
            [createButton("🔔 ВКЛ", `global_mesto_on_${uniqueIdParam}`), createButton("🔕 ВЫКЛ", `global_mesto_off_${uniqueIdParam}`)],
            [createButton("⬅️ Вернуться назад", `show_global_functions_${uniqueIdParam}`)]
        ]
    };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function showRadioOptionsMenu(chatId, messageId, uniqueIdParam) {
    const replyMarkup = {
        inline_keyboard: [
            [createButton("🔔 ВКЛ", `global_radio_on_${uniqueIdParam}`), createButton("🔕 ВЫКЛ", `global_radio_off_${uniqueIdParam}`)],
            [createButton("⬅️ Вернуться назад", `show_global_functions_${uniqueIdParam}`)]
        ]
    };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function showWarningOptionsMenu(chatId, messageId, uniqueIdParam) {
    const replyMarkup = {
        inline_keyboard: [
            [createButton("🔔 ВКЛ", `global_warning_on_${uniqueIdParam}`), createButton("🔕 ВЫКЛ", `global_warning_off_${uniqueIdParam}`)],
            [createButton("⬅️ Вернуться назад", `show_global_functions_${uniqueIdParam}`)]
        ]
    };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function showAFKNightModesMenu(chatId, messageId, uniqueIdParam) {
    const replyMarkup = {
        inline_keyboard: [
            [createButton("С паузами", `afk_n_with_pauses_${uniqueIdParam}`), createButton("Без пауз", `afk_n_without_pauses_${uniqueIdParam}`)],
            [createButton("⬅️ Вернуться назад", `show_global_functions_${uniqueIdParam}`)]
        ]
    };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function showAFKWithPausesSubMenu(chatId, messageId, uniqueIdParam) {
    const replyMarkup = {
        inline_keyboard: [
            [createButton("5/5 минут", `afk_n_fixed_${uniqueIdParam}`), createButton("Рандомное время", `afk_n_random_${uniqueIdParam}`)],
            [createButton("⬅️ Вернуться назад", `global_afk_n_${uniqueIdParam}`)]
        ]
    };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function showAFKReconnectMenu(chatId, messageId, uniqueIdParam, selectedMode) {
    const replyMarkup = {
        inline_keyboard: [
            [createButton("Реконнект 🟢", `afk_n_reconnect_on_${uniqueIdParam}_${selectedMode}`), createButton("Реконнект 🔴", `afk_n_reconnect_off_${uniqueIdParam}_${selectedMode}`)],
            [createButton("⬅️ Вернуться назад", `afk_n_with_pauses_${uniqueIdParam}`)]
        ]
    };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function showRestartActionMenu(chatId, messageId, uniqueIdParam, selectedMode) {
    const replyMarkup = {
        inline_keyboard: [
            [createButton("/q", `restart_q_${uniqueIdParam}_${selectedMode}`), createButton("/rec", `restart_rec_${uniqueIdParam}_${selectedMode}`)],
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
    const replyMarkup = { inline_keyboard: [[createButton("🔔 ВКЛ", `local_soob_on_${uniqueId}`), createButton("🔕 ВЫКЛ", `local_soob_off_${uniqueId}`)], [createButton("⬅️ Вернуться назад", `show_local_functions_${uniqueId}`)]] };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function showLocalMestoOptionsMenu(chatId, messageId) {
    const replyMarkup = { inline_keyboard: [[createButton("🔔 ВКЛ", `local_mesto_on_${uniqueId}`), createButton("🔕 ВЫКЛ", `local_mesto_off_${uniqueId}`)], [createButton("⬅️ Вернуться назад", `show_local_functions_${uniqueId}`)]] };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function showLocalRadioOptionsMenu(chatId, messageId) {
    const replyMarkup = { inline_keyboard: [[createButton("🔔 ВКЛ", `local_radio_on_${uniqueId}`), createButton("🔕 ВЫКЛ", `local_radio_off_${uniqueId}`)], [createButton("⬅️ Вернуться назад", `show_local_functions_${uniqueId}`)]] };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function showLocalWarningOptionsMenu(chatId, messageId) {
    const replyMarkup = { inline_keyboard: [[createButton("🔔 ВКЛ", `local_warning_on_${uniqueId}`), createButton("🔕 ВЫКЛ", `local_warning_off_${uniqueId}`)], [createButton("⬅️ Вернуться назад", `show_local_functions_${uniqueId}`)]] };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function hideControlsMenu(chatId, messageId) {
    const replyMarkup = { inline_keyboard: [[createButton("⚙️ Управление", `show_controls_${uniqueId}`)]] };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
// END MENU MODULE //
// START TELEGRAM COMMANDS MODULE //

// ==================== LONG POLLING ====================
// Вместо checkTelegramCommands каждые 1500мс используем Long Polling:
// Telegram держит соединение открытым до 10 секунд и отвечает МГНОВЕННО
// при появлении нового апдейта. Задержка = 0мс вместо 0-2000мс.
let isPollingActive = false;

function startLongPolling() {
    if (isPollingActive) {
        debugLog('Long polling уже запущен');
        return;
    }
    isPollingActive = true;
    debugLog('🚀 Long Polling запущен');
    doLongPoll();
}

function doLongPoll() {
    if (!config.botToken) {
        // Токен ещё не известен — ждём и пробуем снова
        setTimeout(doLongPoll, 1000);
        return;
    }
    
    config.lastUpdateId = getSharedLastUpdateId();
    
    // timeout=10 — Telegram держит соединение 10с, отвечает мгновенно при новом апдейте
    const url = `https://api.telegram.org/bot${config.botToken}/getUpdates?offset=${config.lastUpdateId + 1}&timeout=10&allowed_updates=["message","callback_query"]`;
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.timeout = 15000; // 15с таймаут (больше чем timeout=10)
    
    xhr.onload = function() {
        if (xhr.status === 200) {
            try {
                const data = JSON.parse(xhr.responseText);
                if (data.ok && data.result.length > 0) {
                    processUpdates(data.result);
                }
            } catch (e) {
                debugLog('Ошибка парсинга ответа Telegram: ' + e);
            }
        } else if (xhr.status === 409) {
            // Конфликт — другой экземпляр уже полит этот токен
            debugLog('⚠️ Конфликт polling (409) — пауза 5с');
            setTimeout(doLongPoll, 5000);
            return;
        } else {
            debugLog('Ошибка getUpdates: ' + xhr.status);
        }
        // Сразу начинаем следующий poll без задержки
        doLongPoll();
    };
    
    xhr.ontimeout = function() {
        debugLog('Long poll timeout — переподключаемся');
        doLongPoll();
    };
    
    xhr.onerror = function() {
        debugLog('Ошибка сети в long poll — повтор через 3с');
        setTimeout(doLongPoll, 3000);
    };
    
    xhr.send();
}

// Оставляем checkTelegramCommands как алиас для совместимости
function checkTelegramCommands() {
    startLongPolling();
}

function processUpdates(updates) {
    for (const update of updates) {
        // Атомарно обновляем lastUpdateId
        if (update.update_id > getSharedLastUpdateId()) {
            setSharedLastUpdateId(update.update_id);
        }
        config.lastUpdateId = update.update_id;
        
        let chatId = null;
        if (update.message) {
            chatId = update.message.chat.id;
        } else if (update.callback_query) {
            chatId = update.callback_query.message.chat.id;
        }
        
        if (!config.chatIds.includes(String(chatId))) {
            debugLog(`Игнорируем обновление из неавторизованного чата: ${chatId}`);
            continue;
        }
        
        if (update.message) {
            const message = update.message.text ? update.message.text.trim() : '';
            if (update.message.reply_to_message) {
                const replyToText = update.message.reply_to_message.text || '';
                if (replyToText.includes(`✉️ Введите сообщение для ${displayName}:`) && 
                    replyToText.includes(`🔑 ID: ${uniqueId}`)) {
                    const textToSend = message;
                    if (textToSend) {
                        debugLog(`[${displayName}] Отправка сообщения: ${textToSend}`);
                        try {
                            sendChatInput(textToSend);
                            sendToTelegram(`✅ <b>Сообщение отправлено ${displayName}:</b>\n<code>${textToSend.replace(/</g, '&lt;')}</code>`, false, null);
                        } catch (err) {
                            sendToTelegram(`❌ <b>Ошибка ${displayName}</b>\nНе удалось отправить сообщение\n<code>${err.message}</code>`, false, null);
                        }
                    }
                    continue;
                }
                if (replyToText.includes(`✉️ Введите ответ для ${displayName}:`) && 
                    replyToText.includes(`🔑 ID: ${uniqueId}`)) {
                    const textToSend = message;
                    if (textToSend) {
                        debugLog(`[${displayName}] Отправка ответа: ${textToSend}`);
                        try {
                            sendChatInput(textToSend);
                            sendToTelegram(`✅ <b>Ответ отправлен ${displayName}:</b>\n<code>${textToSend.replace(/</g, '&lt;')}</code>`, false, null);
                        } catch (err) {
                            sendToTelegram(`❌ <b>Ошибка ${displayName}</b>\nНе удалось отправить ответ\n<code>${err.message}</code>`, false, null);
                        }
                    }
                    continue;
                }
                if (replyToText.includes(`✉️ Введите ник аккаунта для активации AFK режима:`)) {
                    const accountNickname = message.trim();
                    if (accountNickname && accountNickname === config.accountInfo.nickname) {
                        globalState.afkTargetAccount = accountNickname;
                        globalState.awaitingAfkAccount = false;
                        globalState.awaitingAfkId = true;
                        sendToTelegram(`✉️ Введите ID для активации AFK режима для ${displayName}:`, false, { force_reply: true });
                    } else {
                        sendToTelegram(`❌ <b>Ошибка:</b> Неверный ник аккаунта. Попробуйте снова.`, false, { force_reply: true });
                    }
                    continue;
                }
                if (replyToText.includes(`✉️ Введите ID для активации AFK режима для`) && globalState.awaitingAfkId) {
                    const id = message.trim();
                    if (globalState.afkTargetAccount === config.accountInfo.nickname) {
                        const idFormats = [id];
                        if (id.includes('-')) { idFormats.push(id.replace(/-/g, '')); }
                        else if (id.length === 3) { idFormats.push(`${id[0]}-${id[1]}-${id[2]}`); }
                        config.afkSettings = { id: id, formats: idFormats, active: true };
                        globalState.awaitingAfkId = false;
                        globalState.afkTargetAccount = null;
                        sendToTelegram(`🔄 <b>AFK режим активирован для ${displayName}</b>\nID: ${id}\nФорматы: ${idFormats.join(', ')}`, false, null);
                    }
                    continue;
                }
            }
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
                try {
                    sendChatInput(textToSend);
                    sendToTelegram(`✅ <b>Сообщение отправлено ${displayName}:</b>\n<code>${textToSend.replace(/</g, '&lt;')}</code>`, false, null);
                } catch (err) {
                    sendToTelegram(`❌ <b>Ошибка ${displayName}</b>\nНе удалось отправить сообщение\n<code>${err.message}</code>`, false, null);
                }
            } else if (message.startsWith('/afk ')) {
                const parts = message.split(' ');
                if (parts.length >= 3 && parts[1] === config.accountInfo.nickname) {
                    const id = parts[2];
                    const idFormats = [id];
                    if (id.includes('-')) { idFormats.push(id.replace(/-/g, '')); }
                    else if (id.length === 3) { idFormats.push(`${id[0]}-${id[1]}-${id[2]}`); }
                    config.afkSettings = { id: id, formats: idFormats, active: true };
                    sendToTelegram(`🔄 <b>AFK режим активирован для ${displayName}</b>\nID: ${id}\nФорматы: ${idFormats.join(', ')}`, false, null);
                }
            } else if (message.startsWith('/afk_n')) {
                const parts = message.split(' ');
                let targetNickname = config.accountInfo.nickname;
                if (parts.length >= 2 && parts[1]) { targetNickname = parts[1]; }
                if (targetNickname === config.accountInfo.nickname) {
                    const hudId = getPlayerIdFromHUD();
                    if (!hudId) {
                        sendToTelegram(`❌ <b>Ошибка ${displayName}:</b> Не удалось получить ID из HUD`, false, null);
                        continue;
                    }
                    const idFormats = [hudId];
                    if (hudId.includes('-')) { idFormats.push(hudId.replace(/-/g, '')); }
                    else if (hudId.length === 3) { idFormats.push(`${hudId[0]}-${hudId[1]}-${hudId[2]}`); }
                    config.afkSettings = { id: hudId, formats: idFormats, active: true };
                    startAFKCycle();
                    sendToTelegram(`🔄 <b>AFK режим активирован для ${displayName}</b>\nID из HUD: ${hudId}\nФорматы: ${idFormats.join(', ')}\n🔁 <b>Запущен AFK цикл для PayDay</b>`, false, null);
                }
            } else if (message === '/list') {
                if (globalState.lastWelcomeMessageId) {
                    config.chatIds.forEach(chatId => { deleteMessage(chatId, globalState.lastWelcomeMessageId); });
                    globalState.lastWelcomeMessageId = null;
                }
                sendWelcomeMessage();
            }
        } else if (update.callback_query) {
            const message = update.callback_query.data;
            const chatId = update.callback_query.message.chat.id;
            const messageId = update.callback_query.message.message_id;
            const callbackQueryId = update.callback_query.id;
            
            // ==================== КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ ====================
            // answerCallbackQuery вызывается НЕМЕДЛЕННО при получении callback.
            // Это убирает "крутилку" на кнопке мгновенно, не ожидая обработки.
            answerCallbackQuery(callbackQueryId);
            
            // Определяем callbackUniqueId
            let callbackUniqueId = null;
            const prefixes = [
                'show_controls_', 'show_local_functions_', 'show_movement_controls_',
                'hide_controls_', 'request_chat_message_', 'local_soob_on_', 'local_soob_off_',
                'local_mesto_on_', 'local_mesto_off_', 'local_radio_on_', 'local_radio_off_',
                'local_warning_on_', 'local_warning_off_', 'admin_reply_', 'back_to_notification_',
                'show_local_soob_options_', 'show_local_mesto_options_', 'show_local_radio_options_',
                'show_local_warning_options_', 'global_p_on_', 'global_p_off_', 'global_soob_on_',
                'global_soob_off_', 'global_mesto_on_', 'global_mesto_off_', 'global_radio_on_',
                'global_radio_off_', 'global_warning_on_', 'global_warning_off_', 'global_afk_n_',
                'global_afk_', 'afk_n_with_pauses_', 'afk_n_without_pauses_', 'afk_n_fixed_',
                'afk_n_random_', 'show_payday_options_', 'show_soob_options_', 'show_mesto_options_',
                'show_radio_options_', 'show_warning_options_', 'show_global_functions_', 'global_levelup_'
            ];
            
            for (const prefix of prefixes) {
                if (message.startsWith(prefix)) {
                    callbackUniqueId = message.replace(prefix, '');
                    break;
                }
            }
            
            // Для движения убираем суффикс _notification
            const movePrefixes = ['move_forward_', 'move_back_', 'move_left_', 'move_right_', 'move_jump_', 'move_punch_', 'move_sit_', 'move_stand_'];
            for (const prefix of movePrefixes) {
                if (message.startsWith(prefix)) {
                    callbackUniqueId = message.replace(prefix, '').replace('_notification', '');
                    break;
                }
            }
            
            // Для составных команд с _mode суффиксом
            if (message.startsWith('afk_n_reconnect_on_') || message.startsWith('afk_n_reconnect_off_') ||
                message.startsWith('restart_q_') || message.startsWith('restart_rec_') ||
                message.startsWith('back_from_restart_')) {
                const parts = message.split('_');
                // Последний элемент — mode, предпоследний — uniqueId (nickname_server)
                // Формат: prefix_nickname_server_mode
                // nickname может содержать _ поэтому берём последние 2 части как server_mode
                // uniqueId = nickname_server, mode = последнее слово
                const lastPart = parts[parts.length - 1];
                const secondLast = parts[parts.length - 2];
                callbackUniqueId = `${secondLast}`; // это server часть uniqueId  
                // Восстанавливаем полный uniqueId
                // Для этих команд uniqueId хранится как предпоследние N частей
                // Лучше искать по uniqueId напрямую
                if (message.includes(uniqueId)) {
                    callbackUniqueId = uniqueId;
                }
            }
            
            // Проверяем, для этого ли аккаунта команда
            const isForThisBot = callbackUniqueId === uniqueId ||
                (update.callback_query.message.text && update.callback_query.message.text.includes(displayName)) ||
                (update.callback_query.message.reply_to_message &&
                update.callback_query.message.reply_to_message.text &&
                update.callback_query.message.reply_to_message.text.includes(displayName));
            
            if (!isForThisBot) {
                debugLog(`Игнорируем callback_query не для этого аккаунта (${displayName}): ${message}`);
                continue;
            }
            
            // ==================== LOCK для предотвращения дублирования ====================
            // Для команд которые что-то ДЕЛАЮТ (не просто меняют меню) используем lock
            const isActionCommand = message.startsWith('global_p_') || message.startsWith('global_soob_') ||
                message.startsWith('global_mesto_') || message.startsWith('global_radio_') ||
                message.startsWith('global_warning_') || message.startsWith('local_') ||
                message.startsWith('move_') || message.startsWith('afk_n_reconnect_') ||
                message.startsWith('restart_') || message.startsWith('global_afk_') ||
                message.startsWith('global_levelup_');
                
            if (isActionCommand && !tryAcquireCallbackLock(callbackQueryId)) {
                debugLog(`Callback ${callbackQueryId} уже обрабатывается — пропускаем`);
                continue;
            }
            
            // Обработка команд
            if (message.startsWith('show_controls_')) {
                showControlsMenu(chatId, messageId);
            } else if (message.startsWith('show_global_functions_')) {
                showGlobalFunctionsMenu(chatId, messageId, callbackUniqueId);
            } else if (message.startsWith('show_local_functions_')) {
                showLocalFunctionsMenu(chatId, messageId);
            } else if (message.startsWith('show_movement_controls_')) {
                showMovementControlsMenu(chatId, messageId);
            } else if (message.startsWith('show_movement_')) {
                showMovementControlsMenu(chatId, messageId, true);
            } else if (message.startsWith('hide_controls_')) {
                hideControlsMenu(chatId, messageId);
            } else if (message.startsWith('request_chat_message_')) {
                const requestMsg = `✉️ Введите сообщение для ${displayName}:\n(Будет отправлено как /chat${config.accountInfo.nickname}_${config.accountInfo.server} ваш_текст)\n🔑 ID: ${uniqueId}`;
                sendToTelegram(requestMsg, false, { force_reply: true });
            } else if (message.startsWith('show_payday_options_')) {
                showPayDayOptionsMenu(chatId, messageId, callbackUniqueId);
            } else if (message.startsWith('show_soob_options_')) {
                showSoobOptionsMenu(chatId, messageId, callbackUniqueId);
            } else if (message.startsWith('show_mesto_options_')) {
                showMestoOptionsMenu(chatId, messageId, callbackUniqueId);
            } else if (message.startsWith('show_radio_options_')) {
                showRadioOptionsMenu(chatId, messageId, callbackUniqueId);
            } else if (message.startsWith('show_warning_options_')) {
                showWarningOptionsMenu(chatId, messageId, callbackUniqueId);
            } else if (message.startsWith('global_p_on_')) {
                config.paydayNotifications = true;
                sendToTelegram(`🔔 <b>Уведомления о PayDay включены для всех аккаунтов</b>`, false, null);
                sendWelcomeMessage();
            } else if (message.startsWith('global_p_off_')) {
                config.paydayNotifications = false;
                sendToTelegram(`🔕 <b>Уведомления о PayDay отключены для всех аккаунтов</b>`, false, null);
                sendWelcomeMessage();
            } else if (message.startsWith('global_soob_on_')) {
                config.govMessagesEnabled = true;
                sendToTelegram(`🔔 <b>Уведомления от сотрудников фракции включены для всех аккаунтов</b>`, false, null);
                sendWelcomeMessage();
            } else if (message.startsWith('global_soob_off_')) {
                config.govMessagesEnabled = false;
                sendToTelegram(`🔕 <b>Уведомления от сотрудников фракции отключены для всех аккаунтов</b>`, false, null);
                sendWelcomeMessage();
            } else if (message.startsWith('global_mesto_on_')) {
                config.trackLocationRequests = true;
                sendToTelegram(`📍 <b>Отслеживание запросов местоположения включено для всех аккаунтов</b>`, false, null);
                sendWelcomeMessage();
            } else if (message.startsWith('global_mesto_off_')) {
                config.trackLocationRequests = false;
                sendToTelegram(`🔕 <b>Отслеживание запросов местоположения отключено для всех аккаунтов</b>`, false, null);
                sendWelcomeMessage();
            } else if (message.startsWith('global_radio_on_')) {
                config.radioOfficialNotifications = true;
                sendToTelegram(`🔔 <b>Уведомления с Рации включены для всех аккаунтов</b>`, false, null);
                sendWelcomeMessage();
            } else if (message.startsWith('global_radio_off_')) {
                config.radioOfficialNotifications = false;
                sendToTelegram(`🔕 <b>Уведомления с Рации отключены для всех аккаунтов</b>`, false, null);
                sendWelcomeMessage();
            } else if (message.startsWith('global_warning_on_')) {
                config.warningNotifications = true;
                sendToTelegram(`🔔 <b>Уведомления о выговорах включены для всех аккаунтов</b>`, false, null);
                sendWelcomeMessage();
            } else if (message.startsWith('global_warning_off_')) {
                config.warningNotifications = false;
                sendToTelegram(`🔕 <b>Уведомления о выговорах отключены для всех аккаунтов</b>`, false, null);
                sendWelcomeMessage();
            } else if (message.startsWith('global_afk_n_')) {
                showAFKNightModesMenu(chatId, messageId, callbackUniqueId);
            } else if (message.startsWith('afk_n_with_pauses_')) {
                showAFKWithPausesSubMenu(chatId, messageId, callbackUniqueId);
            } else if (message.startsWith('afk_n_without_pauses_')) {
                if (config.autoReconnectEnabled) {
                    showAFKReconnectMenu(chatId, messageId, callbackUniqueId, 'none');
                } else {
                    activateAFKWithMode('none', false, 'q', chatId, messageId);
                }
            } else if (message.startsWith('afk_n_fixed_')) {
                if (config.autoReconnectEnabled) {
                    showAFKReconnectMenu(chatId, messageId, callbackUniqueId, 'fixed');
                } else {
                    activateAFKWithMode('fixed', false, 'q', chatId, messageId);
                }
            } else if (message.startsWith('afk_n_random_')) {
                if (config.autoReconnectEnabled) {
                    showAFKReconnectMenu(chatId, messageId, callbackUniqueId, 'random');
                } else {
                    activateAFKWithMode('random', false, 'q', chatId, messageId);
                }
            } else if (message.startsWith('afk_n_reconnect_on_')) {
                // Формат: afk_n_reconnect_on_UNIQUEID_MODE
                const withoutPrefix = message.replace('afk_n_reconnect_on_', '');
                const modeStart = withoutPrefix.lastIndexOf('_');
                const selectedMode = withoutPrefix.substring(modeStart + 1);
                showRestartActionMenu(chatId, messageId, uniqueId, selectedMode);
            } else if (message.startsWith('afk_n_reconnect_off_')) {
                const withoutPrefix = message.replace('afk_n_reconnect_off_', '');
                const modeStart = withoutPrefix.lastIndexOf('_');
                const selectedMode = withoutPrefix.substring(modeStart + 1);
                activateAFKWithMode(selectedMode, false, 'q', chatId, messageId);
            } else if (message.startsWith('restart_q_')) {
                const withoutPrefix = message.replace('restart_q_', '');
                const modeStart = withoutPrefix.lastIndexOf('_');
                const selectedMode = withoutPrefix.substring(modeStart + 1);
                activateAFKWithMode(selectedMode, true, 'q', chatId, messageId);
            } else if (message.startsWith('restart_rec_')) {
                const withoutPrefix = message.replace('restart_rec_', '');
                const modeStart = withoutPrefix.lastIndexOf('_');
                const selectedMode = withoutPrefix.substring(modeStart + 1);
                activateAFKWithMode(selectedMode, true, 'rec', chatId, messageId);
            } else if (message.startsWith('back_from_restart_')) {
                const withoutPrefix = message.replace('back_from_restart_', '');
                const modeStart = withoutPrefix.lastIndexOf('_');
                const selectedMode = withoutPrefix.substring(modeStart + 1);
                if (selectedMode === 'levelup') {
                    showGlobalFunctionsMenu(chatId, messageId, uniqueId);
                } else {
                    showAFKReconnectMenu(chatId, messageId, uniqueId, selectedMode);
                }
            } else if (message.startsWith('global_levelup_')) {
                showRestartActionMenu(chatId, messageId, callbackUniqueId, 'levelup');
            } else if (message.startsWith('global_afk_')) {
                if (!globalState.awaitingAfkAccount) {
                    globalState.awaitingAfkAccount = true;
                    sendToTelegram(`✉️ Введите ник аккаунта для активации AFK режима:`, false, { force_reply: true });
                }
            } else if (message.startsWith('admin_reply_')) {
                const requestMsg = `✉️ Введите ответ для ${displayName}:\n🔑 ID: ${uniqueId}`;
                sendToTelegram(requestMsg, false, { force_reply: true });
            } else if (message.startsWith('move_forward_')) {
                const isNotif = message.endsWith('_notification');
                try {
                    window.onScreenControlTouchStart("<Gamepad>/leftStick");
                    window.onScreenControlTouchMove("<Gamepad>/leftStick", 0, 1);
                    setTimeout(() => { window.onScreenControlTouchEnd("<Gamepad>/leftStick"); }, 500);
                    sendToTelegram(`🚶 <b>Движение вперед на 0.5 сек для ${displayName}</b>`, false, null);
                    showMovementControlsMenu(chatId, messageId, isNotif);
                } catch (err) {
                    sendToTelegram(`❌ <b>Ошибка ${displayName}</b>\n<code>${err.message}</code>`, false, null);
                }
            } else if (message.startsWith('move_back_')) {
                const isNotif = message.endsWith('_notification');
                try {
                    window.onScreenControlTouchStart("<Gamepad>/leftStick");
                    window.onScreenControlTouchMove("<Gamepad>/leftStick", 0, -1);
                    setTimeout(() => { window.onScreenControlTouchEnd("<Gamepad>/leftStick"); }, 500);
                    sendToTelegram(`🚶 <b>Движение назад на 0.5 сек для ${displayName}</b>`, false, null);
                    showMovementControlsMenu(chatId, messageId, isNotif);
                } catch (err) {
                    sendToTelegram(`❌ <b>Ошибка ${displayName}</b>\n<code>${err.message}</code>`, false, null);
                }
            } else if (message.startsWith('move_left_')) {
                const isNotif = message.endsWith('_notification');
                try {
                    window.onScreenControlTouchStart("<Gamepad>/leftStick");
                    window.onScreenControlTouchMove("<Gamepad>/leftStick", -1, 0);
                    setTimeout(() => { window.onScreenControlTouchEnd("<Gamepad>/leftStick"); }, 500);
                    sendToTelegram(`🚶 <b>Движение влево на 0.5 сек для ${displayName}</b>`, false, null);
                    showMovementControlsMenu(chatId, messageId, isNotif);
                } catch (err) {
                    sendToTelegram(`❌ <b>Ошибка ${displayName}</b>\n<code>${err.message}</code>`, false, null);
                }
            } else if (message.startsWith('move_right_')) {
                const isNotif = message.endsWith('_notification');
                try {
                    window.onScreenControlTouchStart("<Gamepad>/leftStick");
                    window.onScreenControlTouchMove("<Gamepad>/leftStick", 1, 0);
                    setTimeout(() => { window.onScreenControlTouchEnd("<Gamepad>/leftStick"); }, 500);
                    sendToTelegram(`🚶 <b>Движение вправо на 0.5 сек для ${displayName}</b>`, false, null);
                    showMovementControlsMenu(chatId, messageId, isNotif);
                } catch (err) {
                    sendToTelegram(`❌ <b>Ошибка ${displayName}</b>\n<code>${err.message}</code>`, false, null);
                }
            } else if (message.startsWith('move_jump_')) {
                const isNotif = message.endsWith('_notification');
                try {
                    window.onScreenControlTouchStart("<Keyboard>/leftShift");
                    setTimeout(() => { window.onScreenControlTouchEnd("<Keyboard>/leftShift"); }, 500);
                    sendToTelegram(`🆙 <b>Прыжок выполнен для ${displayName}</b>`, false, null);
                    showMovementControlsMenu(chatId, messageId, isNotif);
                } catch (err) {
                    sendToTelegram(`❌ <b>Ошибка ${displayName}</b>\n<code>${err.message}</code>`, false, null);
                }
            } else if (message.startsWith('move_punch_')) {
                const isNotif = message.endsWith('_notification');
                try {
                    window.onScreenControlTouchStart("<Mouse>/leftButton");
                    setTimeout(() => window.onScreenControlTouchEnd("<Mouse>/leftButton"), 100);
                    sendToTelegram(`👊 <b>Удар выполнен для ${displayName}</b>`, false, null);
                    showMovementControlsMenu(chatId, messageId, isNotif);
                } catch (err) {
                    sendToTelegram(`❌ <b>Ошибка ${displayName}</b>\n<code>${err.message}</code>`, false, null);
                }
            } else if (message.startsWith('move_sit_')) {
                const isNotif = message.endsWith('_notification');
                try {
                    window.onScreenControlTouchStart("<Keyboard>/c");
                    setTimeout(() => window.onScreenControlTouchEnd("<Keyboard>/c"), 500);
                    config.isSitting = true;
                    sendToTelegram(`✅ <b>Команда "Сесть" отправлена ${displayName}</b>`, false, null);
                    showMovementControlsMenu(chatId, messageId, isNotif);
                } catch (err) {
                    sendToTelegram(`❌ <b>Ошибка ${displayName}</b>\n<code>${err.message}</code>`, false, null);
                }
            } else if (message.startsWith('move_stand_')) {
                const isNotif = message.endsWith('_notification');
                try {
                    window.onScreenControlTouchStart("<Keyboard>/c");
                    setTimeout(() => window.onScreenControlTouchEnd("<Keyboard>/c"), 500);
                    config.isSitting = false;
                    sendToTelegram(`✅ <b>Команда "Встать" отправлена ${displayName}</b>`, false, null);
                    showMovementControlsMenu(chatId, messageId, isNotif);
                } catch (err) {
                    sendToTelegram(`❌ <b>Ошибка ${displayName}</b>\n<code>${err.message}</code>`, false, null);
                }
            } else if (message.startsWith('back_to_notification_')) {
                const replyMarkup = {
                    inline_keyboard: [[
                        createButton("📝 Ответить", `admin_reply_${callbackUniqueId}`),
                        createButton("🚶 Движения", `show_movement_${callbackUniqueId}`)
                    ]]
                };
                editMessageReplyMarkup(chatId, messageId, replyMarkup);
            } else if (message.startsWith('show_local_soob_options_')) {
                showLocalSoobOptionsMenu(chatId, messageId);
            } else if (message.startsWith('show_local_mesto_options_')) {
                showLocalMestoOptionsMenu(chatId, messageId);
            } else if (message.startsWith('show_local_radio_options_')) {
                showLocalRadioOptionsMenu(chatId, messageId);
            } else if (message.startsWith('show_local_warning_options_')) {
                showLocalWarningOptionsMenu(chatId, messageId);
            } else if (message.startsWith('local_soob_on_')) {
                config.govMessagesEnabled = true;
                sendToTelegram(`🔔 <b>Уведомления от сотрудников фракции включены для ${displayName}</b>`, false, null);
                sendWelcomeMessage();
            } else if (message.startsWith('local_soob_off_')) {
                config.govMessagesEnabled = false;
                sendToTelegram(`🔕 <b>Уведомления от сотрудников фракции отключены для ${displayName}</b>`, false, null);
                sendWelcomeMessage();
            } else if (message.startsWith('local_mesto_on_')) {
                config.trackLocationRequests = true;
                sendToTelegram(`📍 <b>Отслеживание запросов местоположения включено для ${displayName}</b>`, false, null);
                sendWelcomeMessage();
            } else if (message.startsWith('local_mesto_off_')) {
                config.trackLocationRequests = false;
                sendToTelegram(`🔕 <b>Отслеживание запросов местоположения отключено для ${displayName}</b>`, false, null);
                sendWelcomeMessage();
            } else if (message.startsWith('local_radio_on_')) {
                config.radioOfficialNotifications = true;
                sendToTelegram(`🔔 <b>Уведомления с Рации включены для ${displayName}</b>`, false, null);
                sendWelcomeMessage();
            } else if (message.startsWith('local_radio_off_')) {
                config.radioOfficialNotifications = false;
                sendToTelegram(`🔕 <b>Уведомления с Рации отключены для ${displayName}</b>`, false, null);
                sendWelcomeMessage();
            } else if (message.startsWith('local_warning_on_')) {
                config.warningNotifications = true;
                sendToTelegram(`🔔 <b>Уведомления о выговорах включены для ${displayName}</b>`, false, null);
                sendWelcomeMessage();
            } else if (message.startsWith('local_warning_off_')) {
                config.warningNotifications = false;
                sendToTelegram(`🔕 <b>Уведомления о выговорах отключены для ${displayName}</b>`, false, null);
                sendWelcomeMessage();
            }
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
function getHighRankKeywords() {
    if (!config.currentFaction || !factions[config.currentFaction]) return [];
    return Object.entries(factions[config.currentFaction].ranks)
        .filter(([rankNum]) => parseInt(rankNum) >= 6)
        .map(([, rank]) => rank.toLowerCase());
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
    if (!config.trackLocationRequests && !isTargetingPlayer(msg)) { return false; }
    const rankKeywords = getRankKeywords();
    const hasRoleKeyword = rankKeywords.some(keyword => lowerCaseMessage.includes(keyword));
    const hasActionKeyword = config.locationKeywords.some(word => lowerCaseMessage.includes(word.toLowerCase()));
    const isValid = hasRoleKeyword && hasActionKeyword;
    const validRadius = (chatRadius === CHAT_RADIUS.RADIO || chatRadius === CHAT_RADIUS.CLOSE);
    return isValid && validRadius;
}
function isTargetingPlayer(msg) {
    if (!config.lastPlayerId) return false;
    const idFormats = [config.lastPlayerId, config.lastPlayerId.split('').join('-')];
    return idFormats.some(format => msg.match(new RegExp(`\\[${format}\\]|\\b${format}\\b`)));
}
function processSalaryAndBalance(msg) {
    if (!config.paydayNotifications) { debugLog('PayDay пропущен: уведомления выкл'); return; }
    if (msg.includes("Для получения зарплаты необходимо находиться в игре минимум 25 минут")) {
        sendToTelegram(`- PayDay | ${displayName}:\nДля получения зарплаты необходимо находиться в игре минимум 25 минут`);
        config.lastSalaryInfo = null;
        return;
    }
    if (msg.includes("Вы не должны находиться на паузе для получения зарплаты")) {
        sendToTelegram(`- PayDay | ${displayName}:\nВы не должны находиться на паузе для получения зарплаты`);
        config.lastSalaryInfo = null;
        return;
    }
    if (msg.includes("Для получения опыта необходимо находиться в игре минимум 10 минут")) {
        sendToTelegram(`- PayDay | ${displayName}:\nДля получения опыта необходимо находиться в игре минимум 10 минут`);
        config.lastSalaryInfo = null;
        return;
    }
    const salaryMatch = msg.match(/Зарплата:\s*\{[A-Fa-f0-9]{6}\}([\d.]+)\s*руб/);
    if (salaryMatch) {
        const salary = salaryMatch[1];
        debugLog(`Зарплата спарсена: ${salary}`);
        config.lastSalaryInfo = config.lastSalaryInfo || {};
        config.lastSalaryInfo.salary = salary;
        config.afkCycle.totalSalary += parseInt(salary.replace(/\./g, ''));
        updateAFKStatus();
    }
    const balanceMatch = msg.match(/Текущий баланс счета:\s*\{[A-Fa-f0-9]{6}\}([\d.]+)\s*руб/);
    if (balanceMatch) {
        const balance = balanceMatch[1];
        config.lastSalaryInfo = config.lastSalaryInfo || {};
        config.lastSalaryInfo.balance = balance;
    }
    if (config.lastSalaryInfo && config.lastSalaryInfo.salary && config.lastSalaryInfo.balance) {
        let message = `+ PayDay | ${displayName}:\nЗарплата: ${config.lastSalaryInfo.salary} руб\nБаланс счета: ${config.lastSalaryInfo.balance} руб`;
        if (config.afkCycle.active) {
            message += getAFKStatusText();
            config.afkCycle.statusMessageIds.forEach(({ chatId, messageId }) => { deleteMessage(chatId, messageId); });
            config.afkCycle.statusMessageIds = [];
            globalState.lastPaydayMessageIds.forEach(({ chatId, messageId }) => { deleteMessage(chatId, messageId); });
            globalState.lastPaydayMessageIds = [];
        }
        sendToTelegram(message);
        config.lastSalaryInfo = null;
    }
}
function checkGovMessageConditions(msg, senderName, senderId) {
    if (!config.govMessagesEnabled) return false;
    const lowerMsg = msg.toLowerCase();
    const hasKeyword = config.govMessageKeywords.some(keyword => lowerMsg.includes(keyword.toLowerCase()));
    const trackerKey = `${senderName}_${senderId}`;
    const now = Date.now();
    let tracker = config.govMessageTrackers[trackerKey];
    if (!tracker) {
        tracker = { count: 1, lastMessageTime: now, cooldownEnd: 0 };
        config.govMessageTrackers[trackerKey] = tracker;
        return true;
    }
    if (hasKeyword && tracker.cooldownEnd > 0) {
        tracker.cooldownEnd = 0;
        tracker.count = 1;
        return true;
    }
    if (now < tracker.cooldownEnd) { return false; }
    if (now - tracker.lastMessageTime > config.govMessageCooldown) {
        tracker.count = 1;
        tracker.lastMessageTime = now;
        return true;
    }
    tracker.count++;
    tracker.lastMessageTime = now;
    if (tracker.count > config.govMessageThreshold) {
        tracker.cooldownEnd = now + config.govMessageCooldown;
        return false;
    }
    return true;
}
// END MESSAGE PROCESSING MODULE //

// START CHAT MONITOR MODULE //
let waitingForPayDay = false;
let stroiReconnectTimer = null;
let payDayResetTimer = null;

function getCurrentMinutes() { return new Date().getMinutes(); }

function isPayDayApproaching() {
    const currentMinutes = getCurrentMinutes();
    return currentMinutes >= 53 && currentMinutes <= 59;
}

function resetPayDayFlag() {
    waitingForPayDay = false;
    if (payDayResetTimer) { clearTimeout(payDayResetTimer); payDayResetTimer = null; }
    debugLog('Флаг ожидания PayDay сброшен');
}

function getTimeUntil58Minutes() {
    const now = new Date();
    const currentMinutes = now.getMinutes();
    const currentSeconds = now.getSeconds();
    if (currentMinutes >= 58) { return 10000; }
    const minutesUntil58 = 58 - currentMinutes;
    const secondsUntil58 = minutesUntil58 * 60 - currentSeconds;
    const timeToStart = (secondsUntil58 - 60) * 1000;
    return Math.max(5000, timeToStart);
}

function getTimeUntilPayDay() {
    const now = new Date();
    const currentMinutes = now.getMinutes();
    const currentSeconds = now.getSeconds();
    let minutesUntilPayDay;
    if (currentMinutes === 0) { minutesUntilPayDay = 0; }
    else { minutesUntilPayDay = 60 - currentMinutes; }
    const secondsUntilPayDay = minutesUntilPayDay * 60 - currentSeconds;
    return secondsUntilPayDay * 1000;
}

function performStroiReconnect() {
    const currentMinutes = getCurrentMinutes();
    if (waitingForPayDay) {
        sendToTelegram(`🔕 <b>Повторный строй проигнорирован (${displayName})</b>\n💰 Уже ждём PayDay, реконнект запланирован`, true, null);
        return;
    }
    if (isPayDayApproaching()) {
        const timeToStart = getTimeUntil58Minutes();
        const timeUntilPayDay = getTimeUntilPayDay();
        const minutesLeft = Math.ceil(timeUntilPayDay / 60000);
        const startInSeconds = Math.ceil(timeToStart / 1000);
        waitingForPayDay = true;
        payDayResetTimer = setTimeout(() => { resetPayDayFlag(); }, 5 * 60 * 1000);
        sendToTelegram(
            `⚠️ <b>Строй обнаружен (${displayName})</b>\n🕐 Текущее время: ${currentMinutes} минут\n⏰ До PayDay: ${minutesLeft} мин\n🔄 Реконнект через ${startInSeconds} сек (заход в ~58 мин)\n💰 После захода ждём PayDay`,
            false, null
        );
        stroiReconnectTimer = setTimeout(() => {
            autoLoginConfig.enabled = false;
            sendChatInput("/rec 5");
            const nowMinutes = getCurrentMinutes();
            sendToTelegram(`🔄 <b>Отключён автовход и отправлен /rec 5 (${displayName})</b>\n🕐 Текущее время: ${nowMinutes} минут`, false, null);
            setTimeout(() => {
                autoLoginConfig.enabled = true;
                sendChatInput("/rec 5");
                const loginMinutes = getCurrentMinutes();
                sendToTelegram(`✅ <b>Включён автовход и отправлен /rec 5 (${displayName})</b>\n🕐 Текущее время: ${loginMinutes} минут\n💰 Готовы к получению PayDay`, false, null);
                const remainingTimeToPayDay = getTimeUntilPayDay();
                setTimeout(() => {
                    autoLoginConfig.enabled = false;
                    sendChatInput("/rec 5");
                    sendToTelegram(`💰 <b>PayDay получен! (${displayName})</b>\n🔄 Отключён автовход и отправлен /rec 5\n⏰ Через 2 минуты вернёмся на строй`, false, null);
                    setTimeout(() => {
                        autoLoginConfig.enabled = true;
                        sendChatInput("/rec 5");
                        resetPayDayFlag();
                        sendToTelegram(`🔄 <b>Возвращаемся после строя (${displayName})</b>\n✅ Включён автовход и отправлен /rec 5\n📢 Готовы к новым строям`, false, null);
                    }, 2 * 60 * 1000);
                }, remainingTimeToPayDay + 15000);
            }, 60 * 1000);
        }, timeToStart);
    } else {
        sendToTelegram(
            `📢 <b>Обнаружен сбор/строй! (${displayName})</b>\n🕐 Текущее время: ${currentMinutes} минут\n⏰ До PayDay: ${60 - currentMinutes} мин\n🔄 Выполняем стандартный реконнект`,
            false, null
        );
        setTimeout(() => { performReconnect(5 * 60 * 1000); }, 30);
    }
}

function cancelStroiReconnect() {
    if (stroiReconnectTimer) { clearTimeout(stroiReconnectTimer); stroiReconnectTimer = null; }
    resetPayDayFlag();
}

function initializeChatMonitor() {
    if (typeof sendChatInput === 'undefined') {
        const errorMsg = '❌ <b>Ошибка</b>\nsendChatInput не найден';
        debugLog(errorMsg);
        sendToTelegram(errorMsg, false, null);
        return false;
    }
    if (typeof window.playSound === 'undefined') {
        window.playSound = function(url, loop, volume) {
            const audio = new Audio(url);
            audio.loop = loop || false;
            audio.volume = volume || 1.0;
            audio.play().catch(e => debugLog('Ошибка воспроизведения звука: ' + e));
        };
    }
    window.OnChatAddMessage = function(e, i, t) {
        debugLog(`Чат-сообщение: ${e} | Цвет: ${i} | Тип: ${t}`);
        const msg = String(e);
        const normalizedMsg = normalizeToCyrillic(msg);
        const lowerCaseMessage = normalizedMsg.toLowerCase();
        const currentTime = Date.now();
        const chatRadius = getChatRadius(i);
        console.log(msg);

        if (msg.includes("Текущее время:") && config.afkSettings.active) {
            handlePayDayTimeMessage();
        }
        if (config.afkSettings.active && config.afkCycle.active && msg.includes("Сервер возобновит работу в течение минуты...")) {
            debugLog('Обнаружено сообщение о возобновлении работы сервера!');
            if (config.afkCycle.reconnectEnabled) {
                let restartMessage;
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
                    config.afkCycle.statusMessageIds.forEach(({ chatId, messageId }) => { deleteMessage(chatId, messageId); });
                    config.afkCycle.statusMessageIds = [];
                }
                sendToTelegram(restartMessage, false, null);
            } else {
                sendChatInput("/q");
                let restartMessage = `⚡ <b>Автоматически отправлено /q (${displayName})</b>\nПо условию AFK ночь: Сервер возобновит работу`;
                if (config.afkCycle.active) {
                    restartMessage += getAFKStatusText();
                    config.afkCycle.statusMessageIds.forEach(({ chatId, messageId }) => { deleteMessage(chatId, messageId); });
                    config.afkCycle.statusMessageIds = [];
                }
                sendToTelegram(restartMessage, false, null);
            }
        }
        if (lowerCaseMessage.includes("зареспавнил вас")) {
            const replyMarkup = { inline_keyboard: [[createButton("📝 Ответить", `admin_reply_${uniqueId}`), createButton("🚶 Движения", `show_movement_${uniqueId}`)]] };
            sendToTelegram(`🔄 <b>Вас зареспавнили!! (${displayName})</b>\n<code>${msg.replace(/</g, '&lt;')}</code>`, false, replyMarkup);
            window.playSound("https://raw.githubusercontent.com/ZaharQqqq/Sound/main/uved.mp3", false, 1.0);
        }
        if (lowerCaseMessage.includes("вы были кикнуты по подозрению в читерстве")) {
            const replyMarkup = { inline_keyboard: [[createButton("📝 Ответить", `admin_reply_${uniqueId}`), createButton("🚶 Движения", `show_movement_${uniqueId}`)]] };
            sendToTelegram(`🚫 <b>Вас кикнул анти-чит! (${displayName})</b>\n<code>${msg.replace(/</g, '&lt;')}</code>`, false, replyMarkup);
            window.playSound("https://raw.githubusercontent.com/ZaharQqqq/Sound/main/kick.mp3", false, 1.0);
            setTimeout(() => { performReconnect(1 * 60 * 1000); }, 30);
        }
        const prisonRegex = /Администратор (.+) посадил в тюрьму игрока (.+) на (\d+) мин\. Причина: (.+)/;
        const prisonMatch = msg.match(prisonRegex);
        if (prisonMatch && prisonMatch[2] === config.accountInfo.nickname) {
            const adminName = prisonMatch[1];
            const prisonMinutes = parseInt(prisonMatch[3]);
            const reason = prisonMatch[4];
            const replyMarkup = { inline_keyboard: [[createButton("📝 Ответить", `admin_reply_${uniqueId}`), createButton("🚶 Движения", `show_movement_${uniqueId}`)]] };
            sendToTelegram(`🚨 <b>Посадили в тюрьму! (${displayName})</b>\nАдмин: ${adminName}\nВремя: ${prisonMinutes} мин\nПричина: ${reason}\n<code>${msg.replace(/</g, '&lt;')}</code>`, false, replyMarkup);
            window.playSound("https://raw.githubusercontent.com/ZaharQqqq/Sound/main/kick.mp3", false, 1.0);
            globalState.isPrison = true;
            setTimeout(() => { globalState.isPrison = false; }, 10000);
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
        // Отладка МЗ
        if (config.currentFaction === 'mz') {
            const mzColor = factions.mz.color;
            const normalizedMzColor = normalizeColor(mzColor);
            const normalizedMsgColor = normalizeColor(i);
            debugLog(`=== ОТЛАДКА МЗ ===`);
            debugLog(`Цвет МЗ: ${normalizedMzColor}, цвет сообщ: ${normalizedMsgColor}, радиус: ${chatRadius}`);
            if (normalizedMzColor === normalizedMsgColor) {
                debugLog(`✅ Цвет совпал!`);
                if (chatRadius === CHAT_RADIUS.CLOSE) { debugLog(`✅ Радиус CLOSE`); }
                else { debugLog(`❌ Радиус не CLOSE: ${chatRadius}`); }
            } else { debugLog(`❌ Цвета не совпали`); }
            debugLog(`=== КОНЕЦ ОТЛАДКИ МЗ ===`);
        }
        let factionColor = 'CCFF00';
        if (config.currentFaction && factions[config.currentFaction] && factions[config.currentFaction].color) {
            factionColor = factions[config.currentFaction].color;
        }
        const govMessageRegex = new RegExp(`^\\- (.+?) \\{${factionColor}\\}\\(\\{v:([^}]+)}\\)\\[(\\d+)\\]`);
        const govMatch = msg.match(govMessageRegex);
        if (govMatch && chatRadius === CHAT_RADIUS.CLOSE) {
            const messageText = govMatch[1];
            const senderName = govMatch[2];
            const senderId = govMatch[3];
            if (checkGovMessageConditions(messageText, senderName, senderId)) {
                const replyMarkup = { inline_keyboard: [[createButton("📝 Ответить", `admin_reply_${uniqueId}`), createButton("🚶 Движения", `show_movement_${uniqueId}`)]] };
                sendToTelegram(`🏛️ <b>Сообщение от сотрудника фракции (${displayName}):</b>\n👤 ${senderName} [ID: ${senderId}]\n💬 ${messageText}`, false, replyMarkup);
            }
        }
        processSalaryAndBalance(msg);
        if (config.keywords.some(kw => lowerCaseMessage.includes(kw.toLowerCase()))) {
            sendToTelegram(`🔔 <b>Обнаружено ключевое слово (${displayName}):</b>\n<code>${msg.replace(/</g, '&lt;')}</code>`);
            setTimeout(() => {
                try { sendChatInput("/c"); } catch (err) {}
            }, config.clearDelay);
        }
        if ((lowerCaseMessage.indexOf("администратор") !== -1 && lowerCaseMessage.indexOf("для") !== -1) ||
            (msg.includes("[A]") && msg.includes("((")) ||
            (lowerCaseMessage.includes("подбросил") &&
            (currentTime - config.lastPodbrosTime > config.podbrosCooldown || config.podbrosCounter < 2))) {
            if (lowerCaseMessage.includes("подбросил")) {
                config.podbrosCounter++;
                if (config.podbrosCounter <= 2) {
                    const replyMarkup = { inline_keyboard: [[createButton("📝 Ответить", `admin_reply_${uniqueId}`), createButton("🚶 Движения", `show_movement_${uniqueId}`)]] };
                    sendToTelegram(`🚨 <b>Обнаружен подброс! (${displayName})</b>\n<code>${msg.replace(/</g, '&lt;')}</code>`, false, replyMarkup);
                    window.playSound("https://raw.githubusercontent.com/ZaharQqqq/Sound/main/uved.mp3", false, 1.0);
                }
                if (currentTime - config.lastPodbrosTime > config.podbrosCooldown) { config.podbrosCounter = 0; }
                config.lastPodbrosTime = currentTime;
            } else {
                const replyMarkup = { inline_keyboard: [[createButton("📝 Ответить администратору", `admin_reply_${uniqueId}`), createButton("🚶 Движения", `show_movement_${uniqueId}`)]] };
                sendToTelegram(`🚨 <b>Обнаружен администратор! (${displayName})</b>\n<code>${msg.replace(/</g, '&lt;')}</code>`, false, replyMarkup);
                window.playSound("https://raw.githubusercontent.com/ZaharQqqq/Sound/main/uved.mp3", false, 1.0);
            }
        }
        if (!isNonRPMessage(msg) && getHighRankKeywords().some(kw => lowerCaseMessage.includes(kw)) &&
            (lowerCaseMessage.indexOf("строй") !== -1 || lowerCaseMessage.indexOf("сбор") !== -1 ||
            lowerCaseMessage.indexOf("готовность") !== -1 || lowerCaseMessage.indexOf("конф") !== -1)
            && (chatRadius === CHAT_RADIUS.RADIO)) {
            const nicknameMatch = msg.match(/\]\s+([A-Za-z]+_[A-Za-z]+)\[/);
            const senderNickname = nicknameMatch ? nicknameMatch[1] : null;
            const isIgnoredSender = senderNickname && config.ignoredStroiNicknames.includes(senderNickname);
            if (isIgnoredSender) {
                sendToTelegram(`🔕 <b>Строй от игнорируемого ника (${displayName})</b>\n👤 ${senderNickname}\n<code>${msg.replace(/</g, '&lt;')}</code>`, true);
            } else {
                const messageTextMatch = msg.match(/:\s*(.+)$/);
                const messageText = messageTextMatch ? messageTextMatch[1].trim().toLowerCase() : lowerCaseMessage;
                const onlyStroyMessage = messageText === "строй";
                const currentMinutes = getCurrentMinutes();
                const payDayStatus = isPayDayApproaching() 
                    ? `⏰ <b>БЛИЗКО К PAYDAY (${currentMinutes} мин)</b>` 
                    : `🕐 До PayDay: ${60 - currentMinutes} мин`;
                if (!waitingForPayDay) {
                    sendToTelegram(
                        `📢 <b>Обнаружен сбор/строй! (${displayName})</b>\n${payDayStatus}\n<code>${msg.replace(/</g, '&lt;')}</code>`
                    );
                    window.playSound("https://raw.githubusercontent.com/ZaharQqqq/Sound/main/steroi.mp3", false, 1.0);
                }
                if (!onlyStroyMessage) { performStroiReconnect(); }
            }
        }
        if (lowerCaseMessage.indexOf("администратор") !== -1 && lowerCaseMessage.indexOf("кикнул") !== -1 && msg.includes(config.accountInfo.nickname)) {
            const replyMarkup = { inline_keyboard: [[createButton("📝 Ответить", `admin_reply_${uniqueId}`), createButton("🚶 Движения", `show_movement_${uniqueId}`)]] };
            sendToTelegram(`💢 <b>КИК АДМИНИСТРАТОРА! (${displayName})</b>\n<code>${msg.replace(/</g, '&lt;')}</code>`, false, replyMarkup);
            window.playSound("https://raw.githubusercontent.com/ZaharQqqq/Sound/main/kick.mp3", false, 1.0);
            if (!globalState.isPrison) { performReconnect(2 * 60 * 1000); }
        }
        if (!isNonRPMessage(msg) && checkLocationRequest(msg, lowerCaseMessage, chatRadius)) {
            const replyMarkup = { inline_keyboard: [[createButton("📝 Ответить", `admin_reply_${uniqueId}`), createButton("🚶 Движения", `show_movement_${uniqueId}`)]] };
            sendToTelegram(`📍 <b>Обнаружен запрос местоположения (${displayName}):</b>\n<code>${msg.replace(/</g, '&lt;')}</code>`, false, replyMarkup);
        }
        if (!isNonRPMessage(msg) && checkAFKConditions(msg, lowerCaseMessage)) {
            sendChatInput(reconnectionCommand);
            sendToTelegram(`⚡ <b>Автоматически отправлено ${reconnectionCommand} (${displayName})</b>\nПо AFK условию для ID: ${config.afkSettings.id}\n<code>${msg.replace(/</g, '&lt;')}</code>`, false, null);
        }
        if (chatRadius === CHAT_RADIUS.RADIO && config.radioOfficialNotifications && !isNonRPMessage(msg)) {
            const replyMarkup = { inline_keyboard: [[createButton("📝 Ответить", `admin_reply_${uniqueId}`), createButton("🚶 Движения", `show_movement_${uniqueId}`)]] };
            sendToTelegram(`📡 <b>Сообщение с рации (${displayName}):</b>\n<code>${msg.replace(/</g, '&lt;')}</code>`, false, replyMarkup);
        }
        if (config.currentFaction && factions[config.currentFaction] && config.warningNotifications) {
            const ranks = factions[config.currentFaction].ranks;
            const rank10 = ranks[10];
            const rank9 = ranks[9];
            const escapedRank10 = rank10.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const escapedRank9 = rank9.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const warningRegex = new RegExp(`(?:${escapedRank10}|${escapedRank9})\\s+([^[]+)\\[(\\d+)\\]\\s+выдал\\s+Вам\\s+Выговор\\s+(\\d+)\\s+из\\s+3\\.\\s+Причина:\\s+(.*)`, 'i');
            const warningMatch = msg.match(warningRegex);
            if (warningMatch) {
                sendToTelegram(`⚠️ <b>Получен выговор (${displayName}) от ${warningMatch[1]} [ID: ${warningMatch[2]}]:</b>\nВыговор ${warningMatch[3]}/3\nПричина: ${warningMatch[4]}\n<code>${msg.replace(/</g, '&lt;')}</code>`);
                window.playSound("https://raw.githubusercontent.com/ZaharQqqq/Sound/main/uved.mp3", false, 1.0);
            }
        }
        if (msg.includes("Потеряно соединение с сервером")) {
            sendToTelegram(`❌ Потеряно соединение с сервером (${displayName})`, false, null);
        }
        if (msg.includes("Вы были неактивны долгое время. Отыгранное время для получения следующего PayDay было обнулено.")) {
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
    // Запускаем Long Polling вместо обычного polling
    startLongPolling();
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
const HB_DIALOG_IDS =  {
    MAIN: 900, CONTROLS: 901, LOCAL_FUNCTIONS: 902, GLOBAL_FUNCTIONS: 903,
    PAYDAY_OPTIONS: 904, SOOB_OPTIONS: 905, MESTO_OPTIONS: 906, RADIO_OPTIONS: 907,
    WARNING_OPTIONS: 908, MOVEMENT_CONTROLS: 909, AFK_MODES: 910,
    AFK_PAUSES: 911, AFK_RECONNECT: 912, AFK_RESTART: 913
};
let currentHBMenu = null;
let currentHBPage = 0;
let currentHBSelectedMode = null;
const HB_ITEMS_PER_PAGE = 6;

function createHBMenu(title, items, dialogId) {
    const start = currentHBPage * HB_ITEMS_PER_PAGE;
    const end = start + HB_ITEMS_PER_PAGE;
    const pageItems = items.slice(start, end);
    let menuList = "← Назад<n>";
    pageItems.forEach((item) => { menuList += `${item.name}<n>`; });
    if ((currentHBPage + 1) * HB_ITEMS_PER_PAGE < items.length) { menuList += "Вперед →<n>"; }
    window.addDialogInQueue(`[${dialogId},2,"${title}","","Выбрать","Закрыть",0,0]`, menuList, 0);
}
function showHBMainMenu() {
    currentHBMenu = "main"; currentHBPage = 0;
    window.addDialogInQueue(
        `[${HB_DIALOG_IDS.MAIN},2,"{00BFFF}Hassle | Bot TG Menu","","Выбрать","Закрыть",0,0]`,
        `{FFD700}> {FFFFFF}Управление<n>`, 0
    );
}
function showHBControlsMenu() {
    currentHBMenu = "controls"; currentHBPage = 0;
    let menuList = "{FFA500}< Назад<n>{FFD700}> {FFFFFF}Функции<n>{FFD700}> {FFFFFF}Общие функции<n>";
    if (RECONNECT_ENABLED_DEFAULT) {
        const reconnectStatus = config.autoReconnectEnabled ? "{00FF00}[ВКЛ]" : "{FF0000}[ВЫКЛ]";
        menuList += `{FFFFFF}Реконнект ${reconnectStatus}<n>`;
    }
    window.addDialogInQueue(`[${HB_DIALOG_IDS.CONTROLS},2,"{00BFFF}Управление","","Выбрать","Закрыть",0,0]`, menuList, 0);
}
function showHBLocalFunctionsMenu() {
    currentHBMenu = "local_functions"; currentHBPage = 0;
    const on = "{00FF00}[ВКЛ]"; const off = "{FF0000}[ВЫКЛ]";
    let menuList = `{FFA500}< Назад<n>{FFD700}> {FFFFFF}Движение<n>` +
        `{FFFFFF}Увед. правик ${config.govMessagesEnabled ? on : off}<n>` +
        `{FFFFFF}Отслеживание ${config.trackLocationRequests ? on : off}<n>` +
        `{FFFFFF}Рация ${config.radioOfficialNotifications ? on : off}<n>` +
        `{FFFFFF}Выговоры ${config.warningNotifications ? on : off}<n>`;
    window.addDialogInQueue(`[${HB_DIALOG_IDS.LOCAL_FUNCTIONS},2,"{00BFFF}Функции","","Выбрать","Закрыть",0,0]`, menuList, 0);
}
function showHBGlobalFunctionsMenu() {
    currentHBMenu = "global_functions"; currentHBPage = 0;
    const on = "{00FF00}[ВКЛ]"; const off = "{FF0000}[ВЫКЛ]";
    let menuList = `{FFA500}< Назад<n>` +
        `{FFFFFF}PayDay ${config.paydayNotifications ? on : off}<n>` +
        `{FFFFFF}Сообщ. ${config.govMessagesEnabled ? on : off}<n>` +
        `{FFFFFF}Место ${config.trackLocationRequests ? on : off}<n>` +
        `{FFFFFF}Рация ${config.radioOfficialNotifications ? on : off}<n>` +
        `{FFFFFF}Выговоры ${config.warningNotifications ? on : off}<n>` +
        `{FFD700}> {FFFFFF}AFK Ночь<n>{FFD700}> {FFFFFF}AFK<n>`;
    if (config.autoReconnectEnabled) { menuList += `{FFD700}> {FFFFFF}Прокачка уровня<n>`; }
    window.addDialogInQueue(`[${HB_DIALOG_IDS.GLOBAL_FUNCTIONS},2,"{00BFFF}Общие функции","","Выбрать","Закрыть",0,0]`, menuList, 0);
}
function showHBMovementMenu() {
    currentHBMenu = "movement"; currentHBPage = 0;
    const sitStandText = config.isSitting ? "{FFFFFF}Встать" : "{FFFFFF}Сесть";
    let menuList = `{FFA500}< Назад<n>{FFFFFF}^ Вперед<n>{FFFFFF}< Влево<n>{FFFFFF}> Вправо<n>{FFFFFF}v Назад<n>{FFFFFF}Прыжок<n>{FFFFFF}Удар<n>${sitStandText}<n>`;
    window.addDialogInQueue(`[${HB_DIALOG_IDS.MOVEMENT_CONTROLS},2,"{00BFFF}Движение","","Выбрать","Закрыть",0,0]`, menuList, 0);
}
function showHBAFKModesMenu() {
    currentHBMenu = "afk_modes"; currentHBPage = 0;
    window.addDialogInQueue(`[${HB_DIALOG_IDS.AFK_MODES},2,"{00BFFF}AFK Ночь - Режим","","Выбрать","Закрыть",0,0]`, `{FFA500}< Назад<n>{FFD700}> {FFFFFF}С паузами<n>{FFD700}> {FFFFFF}Без пауз<n>`, 0);
}
function showHBAFKPausesMenu() {
    currentHBMenu = "afk_pauses"; currentHBPage = 0;
    window.addDialogInQueue(`[${HB_DIALOG_IDS.AFK_PAUSES},2,"{00BFFF}AFK Ночь - Паузы","","Выбрать","Закрыть",0,0]`, `{FFA500}< Назад<n>{FFD700}> {FFFFFF}5/5 минут<n>{FFD700}> {FFFFFF}Рандомное время<n>`, 0);
}
function showHBAFKReconnectMenu(selectedMode) {
    currentHBMenu = "afk_reconnect"; currentHBPage = 0;
    window.addDialogInQueue(`[${HB_DIALOG_IDS.AFK_RECONNECT},2,"{00BFFF}AFK Ночь - Реконнект","","Выбрать","Закрыть",0,0]`, `{FFA500}< Назад<n>{00FF00}Реконнект [ВКЛ]<n>{FF0000}Реконнект [ВЫКЛ]<n>`, 0);
}
function showHBAFKRestartMenu(selectedMode) {
    currentHBMenu = "afk_restart"; currentHBPage = 0;
    window.addDialogInQueue(`[${HB_DIALOG_IDS.AFK_RESTART},2,"{00BFFF}AFK Ночь - Действие","","Выбрать","Закрыть",0,0]`, `{FFA500}< Назад<n>{FFFFFF}/q<n>{FFFFFF}/rec<n>`, 0);
}
function handleHBMenuSelection(dialogId, button, listitem) {
    console.log(`HB Menu: dialogId=${dialogId}, button=${button}, listitem=${listitem}`);
    if (button !== 1) { currentHBMenu = null; currentHBSelectedMode = null; return; }
    switch (dialogId) {
        case HB_DIALOG_IDS.MAIN:
            if (listitem === 0) { setTimeout(() => showHBControlsMenu(), 100); }
            break;
        case HB_DIALOG_IDS.CONTROLS:
            if (listitem === 0) { setTimeout(() => showHBMainMenu(), 100); }
            else if (listitem === 1) { setTimeout(() => showHBLocalFunctionsMenu(), 100); }
            else if (listitem === 2) { setTimeout(() => showHBGlobalFunctionsMenu(), 100); }
            else if (RECONNECT_ENABLED_DEFAULT && listitem === 3) {
                config.autoReconnectEnabled = !config.autoReconnectEnabled;
                const status = config.autoReconnectEnabled ? 'включен' : 'выключен';
                showScreenNotification("Hassle", `Реконнект ${status}`);
                sendToTelegram(`🔄 <b>Реконнект ${status} для ${displayName}</b>`, false, null);
                sendWelcomeMessage();
                setTimeout(() => showHBControlsMenu(), 100);
            }
            break;
        case HB_DIALOG_IDS.LOCAL_FUNCTIONS:
            if (listitem === 0) { setTimeout(() => showHBControlsMenu(), 100); }
            else if (listitem === 1) { setTimeout(() => showHBMovementMenu(), 100); }
            else if (listitem === 2) {
                config.govMessagesEnabled = !config.govMessagesEnabled;
                showScreenNotification("Hassle", `Уведомления от сотрудников ${config.govMessagesEnabled ? 'включены' : 'отключены'}`);
                sendToTelegram(`${config.govMessagesEnabled ? '🔔' : '🔕'} <b>Уведомления сотрудников для ${displayName}</b>`, false, null);
                sendWelcomeMessage();
                setTimeout(() => showHBLocalFunctionsMenu(), 100);
            } else if (listitem === 3) {
                config.trackLocationRequests = !config.trackLocationRequests;
                showScreenNotification("Hassle", `Отслеживание местоположения ${config.trackLocationRequests ? 'включено' : 'отключено'}`);
                sendToTelegram(`${config.trackLocationRequests ? '📍' : '🔕'} <b>Отслеживание местоположения для ${displayName}</b>`, false, null);
                sendWelcomeMessage();
                setTimeout(() => showHBLocalFunctionsMenu(), 100);
            } else if (listitem === 4) {
                config.radioOfficialNotifications = !config.radioOfficialNotifications;
                showScreenNotification("Hassle", `Уведомления рации ${config.radioOfficialNotifications ? 'включены' : 'отключены'}`);
                sendToTelegram(`${config.radioOfficialNotifications ? '📡' : '🔕'} <b>Уведомления рации для ${displayName}</b>`, false, null);
                sendWelcomeMessage();
                setTimeout(() => showHBLocalFunctionsMenu(), 100);
            } else if (listitem === 5) {
                config.warningNotifications = !config.warningNotifications;
                showScreenNotification("Hassle", `Уведомления выговоров ${config.warningNotifications ? 'включены' : 'отключены'}`);
                sendToTelegram(`${config.warningNotifications ? '⚠️' : '🔕'} <b>Уведомления выговоров для ${displayName}</b>`, false, null);
                sendWelcomeMessage();
                setTimeout(() => showHBLocalFunctionsMenu(), 100);
            }
            break;
        case HB_DIALOG_IDS.GLOBAL_FUNCTIONS:
            if (listitem === 0) { setTimeout(() => showHBControlsMenu(), 100); }
            else if (listitem === 1) {
                config.paydayNotifications = !config.paydayNotifications;
                showScreenNotification("Hassle", `PayDay уведомления ${config.paydayNotifications ? 'включены' : 'отключены'}`);
                sendToTelegram(`${config.paydayNotifications ? '🔔' : '🔕'} <b>PayDay уведомления для всех</b>`, false, null);
                sendWelcomeMessage();
                setTimeout(() => showHBGlobalFunctionsMenu(), 100);
            } else if (listitem === 2) {
                config.govMessagesEnabled = !config.govMessagesEnabled;
                showScreenNotification("Hassle", `Уведомления сотрудников ${config.govMessagesEnabled ? 'включены' : 'отключены'}`);
                sendToTelegram(`${config.govMessagesEnabled ? '🔔' : '🔕'} <b>Уведомления сотрудников для всех</b>`, false, null);
                sendWelcomeMessage();
                setTimeout(() => showHBGlobalFunctionsMenu(), 100);
            } else if (listitem === 3) {
                config.trackLocationRequests = !config.trackLocationRequests;
                showScreenNotification("Hassle", `Отслеживание ${config.trackLocationRequests ? 'включено' : 'отключено'}`);
                sendToTelegram(`${config.trackLocationRequests ? '📍' : '🔕'} <b>Отслеживание местоположения для всех</b>`, false, null);
                sendWelcomeMessage();
                setTimeout(() => showHBGlobalFunctionsMenu(), 100);
            } else if (listitem === 4) {
                config.radioOfficialNotifications = !config.radioOfficialNotifications;
                showScreenNotification("Hassle", `Рация ${config.radioOfficialNotifications ? 'включена' : 'отключена'}`);
                sendToTelegram(`${config.radioOfficialNotifications ? '📡' : '🔕'} <b>Уведомления рации для всех</b>`, false, null);
                sendWelcomeMessage();
                setTimeout(() => showHBGlobalFunctionsMenu(), 100);
            } else if (listitem === 5) {
                config.warningNotifications = !config.warningNotifications;
                showScreenNotification("Hassle", `Выговоры ${config.warningNotifications ? 'включены' : 'отключены'}`);
                sendToTelegram(`${config.warningNotifications ? '⚠️' : '🔕'} <b>Уведомления выговоров для всех</b>`, false, null);
                sendWelcomeMessage();
                setTimeout(() => showHBGlobalFunctionsMenu(), 100);
            } else if (listitem === 6) { setTimeout(() => showHBAFKModesMenu(), 100); }
            else if (listitem === 7) {
                const hudId = getPlayerIdFromHUD();
                if (!hudId) {
                    sendToTelegram(`❌ <b>Ошибка:</b> Не удалось получить ID из HUD`, false, null);
                    setTimeout(() => showHBGlobalFunctionsMenu(), 100);
                    return;
                }
                const idFormats = [hudId];
                if (hudId.includes('-')) { idFormats.push(hudId.replace(/-/g, '')); }
                else if (hudId.length === 3) { idFormats.push(`${hudId[0]}-${hudId[1]}-${hudId[2]}`); }
                config.afkSettings = { id: hudId, formats: idFormats, active: true };
                showScreenNotification("Hassle", "AFK режим активирован");
                sendToTelegram(`🔄 <b>AFK режим активирован для ${displayName}</b>\nID: ${hudId}`, false, null);
                setTimeout(() => showHBGlobalFunctionsMenu(), 100);
            } else if (listitem === 8 && config.autoReconnectEnabled) {
                currentHBSelectedMode = 'levelup';
                setTimeout(() => showHBAFKRestartMenu('levelup'), 100);
            }
            break;
        case HB_DIALOG_IDS.MOVEMENT_CONTROLS:
            if (listitem === 0) { setTimeout(() => showHBLocalFunctionsMenu(), 100); }
            else if (listitem === 1) {
                try {
                    window.onScreenControlTouchStart("<Gamepad>/leftStick");
                    window.onScreenControlTouchMove("<Gamepad>/leftStick", 0, 1);
                    setTimeout(() => { window.onScreenControlTouchEnd("<Gamepad>/leftStick"); }, 500);
                    showScreenNotification("Hassle", "Движение вперед");
                    sendToTelegram(`🚶 <b>Движение вперед для ${displayName}</b>`, false, null);
                    setTimeout(() => showHBMovementMenu(), 100);
                } catch (err) { sendToTelegram(`❌ ${err.message}`, false, null); }
            } else if (listitem === 2) {
                try {
                    window.onScreenControlTouchStart("<Gamepad>/leftStick");
                    window.onScreenControlTouchMove("<Gamepad>/leftStick", -1, 0);
                    setTimeout(() => { window.onScreenControlTouchEnd("<Gamepad>/leftStick"); }, 500);
                    showScreenNotification("Hassle", "Движение влево");
                    sendToTelegram(`🚶 <b>Движение влево для ${displayName}</b>`, false, null);
                    setTimeout(() => showHBMovementMenu(), 100);
                } catch (err) { sendToTelegram(`❌ ${err.message}`, false, null); }
            } else if (listitem === 3) {
                try {
                    window.onScreenControlTouchStart("<Gamepad>/leftStick");
                    window.onScreenControlTouchMove("<Gamepad>/leftStick", 1, 0);
                    setTimeout(() => { window.onScreenControlTouchEnd("<Gamepad>/leftStick"); }, 500);
                    showScreenNotification("Hassle", "Движение вправо");
                    sendToTelegram(`🚶 <b>Движение вправо для ${displayName}</b>`, false, null);
                    setTimeout(() => showHBMovementMenu(), 100);
                } catch (err) { sendToTelegram(`❌ ${err.message}`, false, null); }
            } else if (listitem === 4) {
                try {
                    window.onScreenControlTouchStart("<Gamepad>/leftStick");
                    window.onScreenControlTouchMove("<Gamepad>/leftStick", 0, -1);
                    setTimeout(() => { window.onScreenControlTouchEnd("<Gamepad>/leftStick"); }, 500);
                    showScreenNotification("Hassle", "Движение назад");
                    sendToTelegram(`🚶 <b>Движение назад для ${displayName}</b>`, false, null);
                    setTimeout(() => showHBMovementMenu(), 100);
                } catch (err) { sendToTelegram(`❌ ${err.message}`, false, null); }
            } else if (listitem === 5) {
                try {
                    window.onScreenControlTouchStart("<Keyboard>/leftShift");
                    setTimeout(() => { window.onScreenControlTouchEnd("<Keyboard>/leftShift"); }, 500);
                    showScreenNotification("Hassle", "Прыжок");
                    sendToTelegram(`🆙 <b>Прыжок для ${displayName}</b>`, false, null);
                    setTimeout(() => showHBMovementMenu(), 100);
                } catch (err) { sendToTelegram(`❌ ${err.message}`, false, null); }
            } else if (listitem === 6) {
                try {
                    window.onScreenControlTouchStart("<Mouse>/leftButton");
                    setTimeout(() => window.onScreenControlTouchEnd("<Mouse>/leftButton"), 100);
                    showScreenNotification("Hassle", "Удар");
                    sendToTelegram(`👊 <b>Удар для ${displayName}</b>`, false, null);
                    setTimeout(() => showHBMovementMenu(), 100);
                } catch (err) { sendToTelegram(`❌ ${err.message}`, false, null); }
            } else if (listitem === 7) {
                try {
                    window.onScreenControlTouchStart("<Keyboard>/c");
                    setTimeout(() => window.onScreenControlTouchEnd("<Keyboard>/c"), 500);
                    config.isSitting = !config.isSitting;
                    const actionText = config.isSitting ? 'Сесть' : 'Встать';
                    showScreenNotification("Hassle", `Команда "${actionText}"`);
                    sendToTelegram(`✅ <b>Команда "${actionText}" для ${displayName}</b>`, false, null);
                    setTimeout(() => showHBMovementMenu(), 100);
                } catch (err) { sendToTelegram(`❌ ${err.message}`, false, null); }
            }
            break;
        case HB_DIALOG_IDS.AFK_MODES:
            if (listitem === 0) { setTimeout(() => showHBGlobalFunctionsMenu(), 100); }
            else if (listitem === 1) { setTimeout(() => showHBAFKPausesMenu(), 100); }
            else if (listitem === 2) {
                if (config.autoReconnectEnabled) { currentHBSelectedMode = 'none'; setTimeout(() => showHBAFKReconnectMenu('none'), 100); }
                else { activateAFKWithMode('none', false, 'q', null, null); showScreenNotification("Hassle", "AFK без пауз активирован"); }
            }
            break;
        case HB_DIALOG_IDS.AFK_PAUSES:
            if (listitem === 0) { setTimeout(() => showHBAFKModesMenu(), 100); }
            else if (listitem === 1) {
                if (config.autoReconnectEnabled) { currentHBSelectedMode = 'fixed'; setTimeout(() => showHBAFKReconnectMenu('fixed'), 100); }
                else { activateAFKWithMode('fixed', false, 'q', null, null); showScreenNotification("Hassle", "AFK 5/5 мин активирован"); }
            } else if (listitem === 2) {
                if (config.autoReconnectEnabled) { currentHBSelectedMode = 'random'; setTimeout(() => showHBAFKReconnectMenu('random'), 100); }
                else { activateAFKWithMode('random', false, 'q', null, null); showScreenNotification("Hassle", "AFK рандом активирован"); }
            }
            break;
        case HB_DIALOG_IDS.AFK_RECONNECT:
            if (listitem === 0) { setTimeout(() => showHBAFKPausesMenu(), 100); }
            else if (listitem === 1) { setTimeout(() => showHBAFKRestartMenu(currentHBSelectedMode), 100); }
            else if (listitem === 2) { activateAFKWithMode(currentHBSelectedMode, false, 'q', null, null); showScreenNotification("Hassle", "AFK режим активирован (реконнект выкл)"); currentHBSelectedMode = null; }
            break;
        case HB_DIALOG_IDS.AFK_RESTART:
            if (listitem === 0) { setTimeout(() => showHBAFKReconnectMenu(currentHBSelectedMode), 100); }
            else if (listitem === 1) { activateAFKWithMode(currentHBSelectedMode, true, 'q', null, null); showScreenNotification("Hassle", "AFK режим активирован (/q при рестарте)"); currentHBSelectedMode = null; }
            else if (listitem === 2) { activateAFKWithMode(currentHBSelectedMode, true, 'rec', null, null); showScreenNotification("Hassle", "AFK режим активирован (/rec при рестарте)"); currentHBSelectedMode = null; }
            break;
    }
}
const originalSendChatInputCustom = window.sendChatInputCustom || sendChatInput;
window.sendChatInputCustom = function(e) {
    const args = e.split(" ");
    if (args[0] === "/hb") { showHBMainMenu(); return; }
    if (typeof originalSendChatInputCustom === 'function') { originalSendChatInputCustom(e); }
};
const originalSendClientEventCustom = window.sendClientEventCustom || sendClientEvent;
window.sendClientEventCustom = function(event, ...args) {
    console.log(`HB Event: ${event}, Args:`, args);
    if (args[0] === "OnDialogResponse") {
        const dialogId = args[1];
        if (dialogId >= 900 && dialogId <= 913) {
            const button = args[2];
            const listitem = args[3];
            handleHBMenuSelection(dialogId, button, listitem);
            return;
        }
    }
    if (typeof originalSendClientEventCustom === 'function') { originalSendClientEventCustom(event, ...args); }
    else if (typeof window.sendClientEventHandle === 'function') { window.sendClientEventHandle(event, ...args); }
};
sendChatInput = window.sendChatInputCustom;
sendClientEvent = window.sendClientEventCustom;
console.log('[HB Menu] Система меню успешно загружена. Используйте /hb для открытия меню.');
console.log('[Long Polling] Активирован мгновенный режим получения команд Telegram.');
// ==================== END HB MENU SYSTEM ====================
