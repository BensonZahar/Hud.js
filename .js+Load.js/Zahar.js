// Для удобства изменения: chatIds и serverTokens вынесены в начало
const CHAT_IDS = ['-1003040555627']; // 1046461621 - Zahar, 5515408606 = Kolya
const SERVER_TOKENS = {
    '4': '8496708572:AAHpNdpNEAQs9ecdosZn3sCsQqJhWdLRn7U',
    '5': '7088892553:AAEQiujKWYXpH16m0L-KijpKXRT-i4UIoPE',
    '6': '7318283272:AAEpKje_GRsGwYJj1GROy9jovLayo--i4QY',
    '12': '7314669193:AAEMOdTUVpuKptq5x-Wf_uqoNtcYnMM12oU'
};
const DEFAULT_TOKEN = '8184449811:AAE-nssyxdjAGnCkNCKTMN8rc2xgWEaVOFA';
// Перехват window.setPlayerSkinId для отслеживания изменений скина
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
// Глобальный объект для хранения состояния AFK-запроса и ID последнего приветственного сообщения
const globalState = {
    awaitingAfkAccount: false,
    awaitingAfkId: false,
    afkTargetAccount: null,
    lastWelcomeMessageId: null, // Для хранения ID последнего приветственного сообщения
    lastPaydayMessageIds: [] // Для хранения ID сообщений PayDay для редактирования
};
// Определяем радиусы чата
const CHAT_RADIUS = {
    SELF: 0, // Собственное сообщение
    CLOSE: 1, // Близко (< radius/4)
    MEDIUM: 2, // Средне (< radius/2)
    FAR: 3, // Далеко (>= radius/2)
    RADIO: 4, // Рация
    UNKNOWN: -1 // Неизвестный цвет
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
// Определение фракций и их рангов
const factions = {
    government: { color: 'CCFF00', skins: [57, 141, 147, 164, 165, 187, 208, 227], ranks: {1: 'водитель',2: 'охранник',3: 'нач. охраны',4: 'секретарь',5: 'старший секретарь',6: 'лицензёр',7: 'адвокат',8: 'депутат',9: 'вице-губернатор',10: 'губернатор'} },
    mz: { color: 'FF6666', skins: [276, 15381, 15382, 15383, 15384, 15385, 15386, 15387, 15388, 15389], ranks: {1: 'интерн',2: 'фельдшер',3: 'участковый врач',4: 'терапевт',5: 'проктолог',6: 'нарколог',7: 'хирург',8: 'заведующий отделением',9: 'заместитель глав врача',10: 'глав врач'} },
    trk: { color: 'FF6600', skins: [15438, 15439, 15440, 15441, 15442, 15443, 15444, 15445, 15446, 15447], ranks: {1: 'стажёр',2: 'светотехник',3: 'монтажёр',4: 'оператор',5: 'дизайнер',6: 'репортер',7: 'ведущий',8: 'режиссёр',9: 'редактор',10: 'гл. редактор'} },
    mo: { color: '996633', skins: [30, 61, 179, 191, 253, 255, 287, 162, 218, 220], ranks: {1: 'рядовой',2: 'ефрейтор',3: 'сержант',4: 'прапорщик',5: 'лейтенант',6: 'капитан',7: 'майор',8: 'подполковник',9: 'полковник',10: 'генерал'} },
    mchs: { color: '009999', skins: [15316, 15365, 15366, 15367, 15368, 15369, 15370, 15371, 15372, 15373, 15374, 15375, 15376, 15377, 15378, 15396, 15397], ranks: {1: 'рядовой',2: 'сержант',3: 'старшина',4: 'прапорщик',5: 'лейтенант',6: 'капитан',7: 'майор',8: 'подполковник',9: 'полковник',10: 'генерал'} }
};
// КОНФИГУРАЦИЯ
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
    autoReconnectEnabled: true
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
        reconnectEnabled: false
    },
    nicknameLogged: false
};
const serverTokens = SERVER_TOKENS;
const defaultToken = DEFAULT_TOKEN;
let displayName = `User [S${config.accountInfo.server || 'Не указан'}]`;
let uniqueId = `${config.accountInfo.nickname}_${config.accountInfo.server}`;
// Настройка автовхода
const autoLoginConfig = {
    password: "zahar2007",
    enabled: true,
    maxAttempts: 10,
    attemptInterval: 1000
};
// Новая функция для shared lastUpdateId через localStorage
function getSharedLastUpdateId() {
    return parseInt(localStorage.getItem('tg_bot_last_update_id') || '0', 10);
}
function setSharedLastUpdateId(id) {
    localStorage.setItem('tg_bot_last_update_id', id);
    debugLog(`Обновлён shared lastUpdateId: ${id}`);
}
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
            return menuInterface.$store.getters["player/skinId"];
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
        }
    } catch (e) {
        debugLog(`Ошибка при получении ника/сервера: ${e.message}`);
    }
    setTimeout(trackNicknameAndServer, 900);
}
function createButton(text, command) {
    return { text: text, callback_data: command };
}
function deleteMessage(chatId, messageId) {
    const url = `https://api.telegram.org/bot${config.botToken}/deleteMessage`;
    const payload = { chat_id: chatId, message_id: messageId };
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
            }
        };
        xhr.send(JSON.stringify(payload));
    });
}
function getAFKStatusText() {
    if (!config.afkCycle.active) return '';
    const modeText = config.afkCycle.mode === 'fixed' ? '5 мин играем, 5 мин пауза' :
                     config.afkCycle.mode === 'random' ? 'рандомное время игры/паузы' :
                     config.afkCycle.mode === 'none' ? '25 мин без пауз' : 'без пауз';
    let reconnectText = '';
    if (config.autoReconnectEnabled && config.afkCycle.mode !== 'none' || config.afkCycle.reconnectEnabled) {
        reconnectText = `\nРеконнект: ${config.afkCycle.reconnectEnabled ? 'ВКЛ' : 'ВЫКЛ'}`;
    }
    let statusText = `\n\n<b>AFK цикл для ${displayName}</b>\nРежим: ${modeText}${reconnectText}\nОбщее игровое время: ${Math.floor(config.afkCycle.totalPlayTime / 60000)} мин\n\n`;
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
    const fullText = `<b>AFK цикл для ${displayName}</b>${statusText}`;
    if (isNew) {
        config.afkCycle.statusMessageIds = [];
        config.chatIds.forEach(chatId => {
            const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
            const payload = { chat_id: chatId, text: fullText, parse_mode: 'HTML' };
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
function editMessageReplyMarkup(chatId, messageId, replyMarkup) {
    const url = `https://api.telegram.org/bot${config.botToken}/editMessageReplyMarkup`;
    const payload = { chat_id: chatId, message_id: messageId, reply_markup: replyMarkup };
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(payload));
}
function editMessageText(chatId, messageId, text, replyMarkup = null) {
    const url = `https://api.telegram.org/bot${config.botToken}/editMessageText`;
    const payload = { chat_id: chatId, message_id: messageId, text: text, parse_mode: 'HTML', reply_markup: replyMarkup ? JSON.stringify(replyMarkup) : undefined };
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() { if (xhr.status === 200) debugLog(`Сообщение отредактировано в чате ${chatId}`); };
    xhr.send(JSON.stringify(payload));
}
function answerCallbackQuery(callbackQueryId) {
    const url = `https://api.telegram.org/bot${config.botToken}/answerCallbackQuery`;
    const payload = { callback_query_id: callbackQueryId };
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(payload));
}
function sendWelcomeMessage() {
    if (!config.accountInfo.nickname) return;
    const playerIdDisplay = config.lastPlayerId ? ` (ID: ${config.lastPlayerId})` : '';
    const message = `<b>Hassle | Bot TG</b>\nНик: ${config.accountInfo.nickname}${playerIdDisplay}\nСервер: ${config.accountInfo.server || 'Не указан'}\n\n<b>Текущие настройки:</b>\n├ Уведомления PayDay: ${config.paydayNotifications ? 'ВКЛ' : 'ВЫКЛ'}\n├ Уведомления от сотрудников: ${config.govMessagesEnabled ? 'ВКЛ' : 'ВЫКЛ'}\n├ Уведомления рации: ${config.radioOfficialNotifications ? 'ВКЛ' : 'ВЫКЛ'}\n├ Уведомления выговоры: ${config.warningNotifications ? 'ВКЛ' : 'ВЫКЛ'}\n└ Отслеживание местоположения: ${config.trackLocationRequests ? 'ВКЛ' : 'ВЫКЛ'}`;
    const replyMarkup = { inline_keyboard: [[createButton("Управление", `show_controls_${uniqueId}`)]] };
    config.chatIds.forEach(chatId => {
        if (globalState.lastWelcomeMessageId) {
            editMessageText(chatId, globalState.lastWelcomeMessageId, message, replyMarkup);
        } else {
            sendToTelegram(message, false, replyMarkup);
        }
    });
}
function showControlsMenu(chatId, messageId) {
    if (!config.accountInfo.nickname) return sendToTelegram(`<b>Ошибка ${displayName}</b>\nНик не определен`, false, null);
    const replyMarkup = { inline_keyboard: [[createButton("Функции", `show_local_functions_${uniqueId}`)],[createButton("Общие функции", `show_global_functions_${uniqueId}`)],[createButton("Назад", `hide_controls_${uniqueId}`)]] };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function showGlobalFunctionsMenu(chatId, messageId, uniqueIdParam) {
    const replyMarkup = { inline_keyboard: [[createButton("PayDay", `show_payday_options_${uniqueIdParam}`)],[createButton("Сообщ.", `show_soob_options_${uniqueIdParam}`)],[createButton("Место", `show_mesto_options_${uniqueIdParam}`)],[createButton("Рация", `show_radio_options_${uniqueIdParam}`)],[createButton("Выговоры", `show_warning_options_${uniqueIdParam}`)],[createButton("AFK Ночь", `global_afk_n_${uniqueIdParam}`),createButton("AFK", `global_afk_${uniqueIdParam}`)],[createButton("Назад", `show_controls_${uniqueIdParam}`)]] };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function showPayDayOptionsMenu(chatId, messageId, uniqueIdParam) {
    const replyMarkup = { inline_keyboard: [[createButton("ВКЛ", `global_p_on_${uniqueIdParam}`),createButton("ВЫКЛ", `global_p_off_${uniqueIdParam}`)],[createButton("Назад", `show_global_functions_${uniqueIdParam}`)]] };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function showSoobOptionsMenu(chatId, messageId, uniqueIdParam) {
    const replyMarkup = { inline_keyboard: [[createButton("ВКЛ", `global_soob_on_${uniqueIdParam}`),createButton("ВЫКЛ", `global_soob_off_${uniqueIdParam}`)],[createButton("Назад", `show_global_functions_${uniqueIdParam}`)]] };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function showMestoOptionsMenu(chatId, messageId, uniqueIdParam) {
    const replyMarkup = { inline_keyboard: [[createButton("ВКЛ", `global_mesto_on_${uniqueIdParam}`),createButton("ВЫКЛ", `global_mesto_off_${uniqueIdParam}`)],[createButton("Назад", `show_global_functions_${uniqueIdParam}`)]] };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function showRadioOptionsMenu(chatId, messageId, uniqueIdParam) {
    const replyMarkup = { inline_keyboard: [[createButton("ВКЛ", `global_radio_on_${uniqueIdParam}`),createButton("ВЫКЛ", `global_radio_off_${uniqueIdParam}`)],[createButton("Назад", `show_global_functions_${uniqueIdParam}`)]] };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function showWarningOptionsMenu(chatId, messageId, uniqueIdParam) {
    const replyMarkup = { inline_keyboard: [[createButton("ВКЛ", `global_warning_on_${uniqueIdParam}`),createButton("ВЫКЛ", `global_warning_off_${uniqueIdParam}`)],[createButton("Назад", `show_global_functions_${uniqueIdParam}`)]] };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function showAFKNightModesMenu(chatId, messageId, uniqueIdParam) {
    const replyMarkup = { inline_keyboard: [[createButton("С паузами", `afk_n_with_pauses_${uniqueIdParam}`)],[createButton("Без пауз", `afk_n_without_pauses_${uniqueIdParam}`)],[createButton("Назад", `show_global_functions_${uniqueIdParam}`)]] };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function showAFKWithPausesSubMenu(chatId, messageId, uniqueIdParam) {
    const replyMarkup = { inline_keyboard: [[createButton("5/5 минут", `afk_n_fixed_${uniqueIdParam}`),createButton("Рандомное время", `afk_n_random_${uniqueIdParam}`)],[createButton("Назад", `global_afk_n_${uniqueIdParam}`)]] };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function showAFKReconnectMenu(chatId, messageId, uniqueIdParam, selectedMode) {
    const backCmd = selectedMode === 'none' ? `global_afk_n_${uniqueIdParam}` : `afk_n_with_pauses_${uniqueIdParam}`;
    const replyMarkup = { inline_keyboard: [[createButton("Реконнект ВКЛ", `afk_n_reconnect_on_${uniqueIdParam}_${selectedMode}`),createButton("Реконнект ВЫКЛ", `afk_n_reconnect_off_${uniqueIdParam}_${selectedMode}`)],[createButton("Назад", backCmd)]] };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function showLocalFunctionsMenu(chatId, messageId) {
    if (!config.accountInfo.nickname) return sendToTelegram(`<b>Ошибка ${displayName}</b>\nНик не определен`, false, null);
    const replyMarkup = { inline_keyboard: [[createButton("Движение", `show_movement_controls_${uniqueId}`)],[createButton("Увед. правик", `show_local_soob_options_${uniqueId}`)],[createButton("Отслеживание", `show_local_mesto_options_${uniqueId}`)],[createButton("Рация", `show_local_radio_options_${uniqueId}`)],[createButton("Выговоры", `show_local_warning_options_${uniqueId}`)],[createButton("Написать в чат", `request_chat_message_${uniqueId}`)],[createButton("Назад", `show_controls_${uniqueId}`)]] };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function showMovementControlsMenu(chatId, messageId, isNotification = false) {
    if (!config.accountInfo.nickname) return sendToTelegram(`<b>Ошибка ${displayName}</b>\nНик не определен`, false, null);
    const backButton = isNotification ? [[createButton("Назад", `back_to_notification_${uniqueId}`)]] : [[createButton("Назад", `show_local_functions_${uniqueId}`)]];
    const sitStandButton = config.isSitting ? createButton("Встать", `move_stand_${uniqueId}${isNotification ? '_notification' : ''}`) : createButton("Сесть", `move_sit_${uniqueId}${isNotification ? '_notification' : ''}`);
    const replyMarkup = { inline_keyboard: [[createButton("Вперед", `move_forward_${uniqueId}${isNotification ? '_notification' : ''}`)],[createButton("Влево", `move_left_${uniqueId}${isNotification ? '_notification' : ''}`), createButton("Вправо", `move_right_${uniqueId}${isNotification ? '_notification' : ''}`)],[createButton("Назад", `move_back_${uniqueId}${isNotification ? '_notification' : ''}`)],[createButton("Прыжок", `move_jump_${uniqueId}${isNotification ? '_notification' : ''}`)],[createButton("Удар", `move_punch_${uniqueId}${isNotification ? '_notification' : ''}`)],[sitStandButton], ...backButton] };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function showLocalSoobOptionsMenu(chatId, messageId) {
    const replyMarkup = { inline_keyboard: [[createButton("ВКЛ", `local_soob_on_${uniqueId}`),createButton("ВЫКЛ", `local_soob_off_${uniqueId}`)],[createButton("Назад", `show_local_functions_${uniqueId}`)]] };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function showLocalMestoOptionsMenu(chatId, messageId) {
    const replyMarkup = { inline_keyboard: [[createButton("ВКЛ", `local_mesto_on_${uniqueId}`),createButton("ВЫКЛ", `local_mesto_off_${uniqueId}`)],[createButton("Назад", `show_local_functions_${uniqueId}`)]] };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function showLocalRadioOptionsMenu(chatId, messageId) {
    const replyMarkup = { inline_keyboard: [[createButton("ВКЛ", `local_radio_on_${uniqueId}`),createButton("ВЫКЛ", `local_radio_off_${uniqueId}`)],[createButton("Назад", `show_local_functions_${uniqueId}`)]] };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function showLocalWarningOptionsMenu(chatId, messageId) {
    const replyMarkup = { inline_keyboard: [[createButton("ВКЛ", `local_warning_on_${uniqueId}`),createButton("ВЫКЛ", `local_warning_off_${uniqueId}`)],[createButton("Назад", `show_local_functions_${uniqueId}`)]] };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function hideControlsMenu(chatId, messageId) {
    const replyMarkup = { inline_keyboard: [[createButton("Управление", `show_controls_${uniqueId}`)]] };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}
function checkTelegramCommands() {
    const randomDelay = Math.floor(Math.random() * 500);
    setTimeout(() => {
        config.lastUpdateId = getSharedLastUpdateId();
        const url = `https://api.telegram.org/bot${config.botToken}/getUpdates?offset=${config.lastUpdateId + 1}`;
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onload = function() {
            if (xhr.status === 200) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    if (data.ok && data.result.length > 0) processUpdates(data.result);
                } catch (e) { debugLog('Ошибка парсинга:', e); }
            }
            setTimeout(checkTelegramCommands, config.checkInterval);
        };
        xhr.onerror = () => setTimeout(checkTelegramCommands, config.checkInterval);
        xhr.send();
    }, randomDelay);
}
function processUpdates(updates) {
    for (const update of updates) {
        config.lastUpdateId = update.update_id;
        setSharedLastUpdateId(config.lastUpdateId);
        if (update.message) {
            const message = update.message.text ? update.message.text.trim() : '';
            if (update.message.reply_to_message) {
                const replyToText = update.message.reply_to_message.text || '';
                if (replyToText.includes(`Введите сообщение для ${displayName}:`)) {
                    const textToSend = message;
                    if (textToSend) {
                        try { sendChatInput(textToSend); sendToTelegram(`Сообщение отправлено ${displayName}:\n<code>${textToSend.replace(/</g, '&lt;')}</code>`); } catch (err) { sendToTelegram(`Ошибка ${displayName}\n<code>${err.message}</code>`); }
                    }
                    continue;
                }
                if (replyToText.includes(`Введите ответ для ${displayName}:`)) {
                    const textToSend = message;
                    if (textToSend) {
                        try { sendChatInput(textToSend); sendToTelegram(`Ответ отправлен ${displayName}:\n<code>${textToSend.replace(/</g, '&lt;')}</code>`); } catch (err) { sendToTelegram(`Ошибка ${displayName}\n<code>${err.message}</code>`); }
                    }
                    continue;
                }
                if (replyToText.includes(`Введите ник аккаунта для активации AFK режима:`)) {
                    const accountNickname = message.trim();
                    if (accountNickname && accountNickname === config.accountInfo.nickname) {
                        globalState.afkTargetAccount = accountNickname;
                        globalState.awaitingAfkAccount = false;
                        globalState.awaitingAfkId = true;
                        sendToTelegram(`Введите ID для активации AFK режима для ${displayName}:`, false, { force_reply: true });
                    } else {
                        sendToTelegram(`Неверный ник. Попробуйте снова.`, false, { force_reply: true });
                    }
                    continue;
                }
                if (replyToText.includes(`Введите ID для активации AFK режима для`) && globalState.awaitingAfkId) {
                    const id = message.trim();
                    if (globalState.afkTargetAccount === config.accountInfo.nickname) {
                        const idFormats = [id];
                        if (id.includes('-')) idFormats.push(id.replace(/-/g, ''));
                        else if (id.length === 3) idFormats.push(`${id[0]}-${id[1]}-${id[2]}`);
                        config.afkSettings = { id: id, formats: idFormats, active: true };
                        globalState.awaitingAfkId = false;
                        globalState.afkTargetAccount = null;
                        sendToTelegram(`AFK режим активирован для ${displayName}\nID: ${id}\nФорматы: ${idFormats.join(', ')}`);
                    }
                    continue;
                }
            }
            if (message === '/p_off') { config.paydayNotifications = false; sendWelcomeMessage(); }
            else if (message === '/p_on') { config.paydayNotifications = true; sendWelcomeMessage(); }
            else if (message === '/soob_off') { config.govMessagesEnabled = false; sendWelcomeMessage(); }
            else if (message === '/soob_on') { config.govMessagesEnabled = true; sendWelcomeMessage(); }
            else if (message === '/mesto_on') { config.trackLocationRequests = true; sendWelcomeMessage(); }
            else if (message === '/mesto_off') { config.trackLocationRequests = false; sendWelcomeMessage(); }
            else if (message.startsWith(`/chat${config.accountInfo.nickname}_${config.accountInfo.server} `)) {
                const textToSend = message.replace(`/chat${config.accountInfo.nickname}_${config.accountInfo.server} `, '').trim();
                try { sendChatInput(textToSend); sendToTelegram(`Сообщение отправлено ${displayName}:\n<code>${textToSend.replace(/</g, '&lt;')}</code>`); } catch (err) { sendToTelegram(`Ошибка ${displayName}\n<code>${err.message}</code>`); }
            }
            else if (message.startsWith('/afk ')) {
                const parts = message.split(' ');
                if (parts.length >= 3 && parts[1] === config.accountInfo.nickname) {
                    const id = parts[2];
                    const idFormats = [id];
                    if (id.includes('-')) idFormats.push(id.replace(/-/g, ''));
                    else if (id.length === 3) idFormats.push(`${id[0]}-${id[1]}-${id[2]}`);
                    config.afkSettings = { id: id, formats: idFormats, active: true };
                    sendToTelegram(`AFK режим активирован для ${displayName}\nID: ${id}\nФорматы: ${idFormats.join(', ')}`);
                }
            }
            else if (message.startsWith('/afk_n')) {
                const parts = message.split(' ');
                let targetNickname = config.accountInfo.nickname;
                if (parts.length >= 2 && parts[1]) targetNickname = parts[1];
                if (targetNickname === config.accountInfo.nickname) {
                    const hudId = getPlayerIdFromHUD();
                    if (!hudId) { sendToTelegram(`Ошибка ${displayName}: Не удалось получить ID из HUD`); continue; }
                    const idFormats = [hudId];
                    if (hudId.includes('-')) idFormats.push(hudId.replace(/-/g, ''));
                    else if (hudId.length === 3) idFormats.push(`${hudId[0]}-${hudId[1]}-${hudId[2]}`);
                    config.afkSettings = { id: hudId, formats: idFormats, active: true };
                    startAFKCycle();
                    sendToTelegram(`AFK режим активирован для ${displayName}\nID: ${hudId}\nЗапущен AFK цикл для PayDay`);
                }
            }
            else if (message === '/list') {
                if (globalState.lastWelcomeMessageId) {
                    config.chatIds.forEach(chatId => deleteMessage(chatId, globalState.lastWelcomeMessageId));
                    globalState.lastWelcomeMessageId = null;
                }
                sendWelcomeMessage();
            }
        } else if (update.callback_query) {
            const message = update.callback_query.data;
            const chatId = update.callback_query.message.chat.id;
            const messageId = update.callback_query.message.message_id;
            const callbackQueryId = update.callback_query.id;
            let callbackUniqueId = null;
            if (message.startsWith('show_controls_')) callbackUniqueId = message.replace('show_controls_', '');
            else if (message.startsWith('show_local_functions_')) callbackUniqueId = message.replace('show_local_functions_', '');
            else if (message.startsWith('show_movement_controls_')) callbackUniqueId = message.replace('show_movement_controls_', '');
            else if (message.startsWith('hide_controls_')) callbackUniqueId = message.replace('hide_controls_', '');
            else if (message.startsWith('request_chat_message_')) callbackUniqueId = message.replace('request_chat_message_', '');
            else if (message.startsWith('local_soob_on_')) callbackUniqueId = message.replace('local_soob_on_', '');
            else if (message.startsWith('local_soob_off_')) callbackUniqueId = message.replace('local_soob_off_', '');
            else if (message.startsWith('local_mesto_on_')) callbackUniqueId = message.replace('local_mesto_on_', '');
            else if (message.startsWith('local_mesto_off_')) callbackUniqueId = message.replace('local_mesto_off_', '');
            else if (message.startsWith('local_radio_on_')) callbackUniqueId = message.replace('local_radio_on_', '');
            else if (message.startsWith('local_radio_off_')) callbackUniqueId = message.replace('local_radio_off_', '');
            else if (message.startsWith('local_warning_on_')) callbackUniqueId = message.replace('local_warning_on_', '');
            else if (message.startsWith('local_warning_off_')) callbackUniqueId = message.replace('local_warning_off_', '');
            else if (message.startsWith('move_forward_')) callbackUniqueId = message.replace('move_forward_', '').replace('_notification', '');
            else if (message.startsWith('move_back_')) callbackUniqueId = message.replace('move_back_', '').replace('_notification', '');
            else if (message.startsWith('move_left_')) callbackUniqueId = message.replace('move_left_', '').replace('_notification', '');
            else if (message.startsWith('move_right_')) callbackUniqueId = message.replace('move_right_', '').replace('_notification', '');
            else if (message.startsWith('move_jump_')) callbackUniqueId = message.replace('move_jump_', '').replace('_notification', '');
            else if (message.startsWith('move_punch_')) callbackUniqueId = message.replace('move_punch_', '').replace('_notification', '');
            else if (message.startsWith('move_sit_')) callbackUniqueId = message.replace('move_sit_', '').replace('_notification', '');
            else if (message.startsWith('move_stand_')) callbackUniqueId = message.replace('move_stand_', '').replace('_notification', '');
            else if (message.startsWith('admin_reply_')) callbackUniqueId = message.replace('admin_reply_', '');
            else if (message.startsWith('back_to_notification_')) callbackUniqueId = message.replace('back_to_notification_', '');
            else if (message.startsWith('show_local_soob_options_')) callbackUniqueId = message.replace('show_local_soob_options_', '');
            else if (message.startsWith('show_local_mesto_options_')) callbackUniqueId = message.replace('show_local_mesto_options_', '');
            else if (message.startsWith('show_local_radio_options_')) callbackUniqueId = message.replace('show_local_radio_options_', '');
            else if (message.startsWith('show_local_warning_options_')) callbackUniqueId = message.replace('show_local_warning_options_', '');
            else if (message.startsWith('global_p_on_')) callbackUniqueId = message.replace('global_p_on_', '');
            else if (message.startsWith('global_p_off_')) callbackUniqueId = message.replace('global_p_off_', '');
            else if (message.startsWith('global_soob_on_')) callbackUniqueId = message.replace('global_soob_on_', '');
            else if (message.startsWith('global_soob_off_')) callbackUniqueId = message.replace('global_soob_off_', '');
            else if (message.startsWith('global_mesto_on_')) callbackUniqueId = message.replace('global_mesto_on_', '');
            else if (message.startsWith('global_mesto_off_')) callbackUniqueId = message.replace('global_mesto_off_', '');
            else if (message.startsWith('global_radio_on_')) callbackUniqueId = message.replace('global_radio_on_', '');
            else if (message.startsWith('global_radio_off_')) callbackUniqueId = message.replace('global_radio_off_', '');
            else if (message.startsWith('global_warning_on_')) callbackUniqueId = message.replace('global_warning_on_', '');
            else if (message.startsWith('global_warning_off_')) callbackUniqueId = message.replace('global_warning_off_', '');
            else if (message.startsWith('global_afk_n_')) callbackUniqueId = message.replace('global_afk_n_', '');
            else if (message.startsWith('global_afk_')) callbackUniqueId = message.replace('global_afk_', '');
            else if (message.startsWith('afk_n_with_pauses_')) callbackUniqueId = message.replace('afk_n_with_pauses_', '');
            else if (message.startsWith('afk_n_without_pauses_')) callbackUniqueId = message.replace('afk_n_without_pauses_', '');
            else if (message.startsWith('afk_n_fixed_')) callbackUniqueId = message.replace('afk_n_fixed_', '');
            else if (message.startsWith('afk_n_random_')) callbackUniqueId = message.replace('afk_n_random_', '');
            else if (message.startsWith('show_payday_options_')) callbackUniqueId = message.replace('show_payday_options_', '');
            else if (message.startsWith('show_soob_options_')) callbackUniqueId = message.replace('show_soob_options_', '');
            else if (message.startsWith('show_mesto_options_')) callbackUniqueId = message.replace('show_mesto_options_', '');
            else if (message.startsWith('show_radio_options_')) callbackUniqueId = message.replace('show_radio_options_', '');
            else if (message.startsWith('show_warning_options_')) callbackUniqueId = message.replace('show_warning_options_', '');
            else if (message.startsWith('show_global_functions_')) callbackUniqueId = message.replace('show_global_functions_', '');
            else if (message.startsWith('afk_n_reconnect_on_')) {
                const parts = message.split('_');
                callbackUniqueId = parts[parts.length - 2];
                const selectedMode = parts[parts.length - 1];
                activateAFKWithMode(selectedMode, true, chatId, messageId);
            } else if (message.startsWith('afk_n_reconnect_off_')) {
                const parts = message.split('_');
                callbackUniqueId = parts[parts.length - 2];
                const selectedMode = parts[parts.length - 1];
                activateAFKWithMode(selectedMode, false, chatId, messageId);
            }
            const isForThisBot = message.startsWith('global_') || message.startsWith('afk_n_') || (callbackUniqueId && callbackUniqueId === uniqueId);
            if (!isForThisBot) { answerCallbackQuery(callbackQueryId); continue; }
            if (message.startsWith(`show_controls_`)) showControlsMenu(chatId, messageId);
            else if (message.startsWith(`show_global_functions_`)) showGlobalFunctionsMenu(chatId, messageId, callbackUniqueId);
            else if (message.startsWith(`show_local_functions_`)) showLocalFunctionsMenu(chatId, messageId);
            else if (message.startsWith(`show_movement_controls_`)) showMovementControlsMenu(chatId, messageId);
            else if (message.startsWith("show_movement_")) showMovementControlsMenu(chatId, messageId, true);
            else if (message.startsWith(`hide_controls_`)) hideControlsMenu(chatId, messageId);
            else if (message.startsWith(`request_chat_message_`)) sendToTelegram(`Введите сообщение для ${displayName}:`, false, { force_reply: true });
            else if (message.startsWith(`show_payday_options_`)) showPayDayOptionsMenu(chatId, messageId, callbackUniqueId);
            else if (message.startsWith(`show_soob_options_`)) showSoobOptionsMenu(chatId, messageId, callbackUniqueId);
            else if (message.startsWith(`show_mesto_options_`)) showMestoOptionsMenu(chatId, messageId, callbackUniqueId);
            else if (message.startsWith(`show_radio_options_`)) showRadioOptionsMenu(chatId, messageId, callbackUniqueId);
            else if (message.startsWith(`show_warning_options_`)) showWarningOptionsMenu(chatId, messageId, callbackUniqueId);
            else if (message.startsWith(`global_p_on_`)) { config.paydayNotifications = true; sendWelcomeMessage(); }
            else if (message.startsWith(`global_p_off_`)) { config.paydayNotifications = false; sendWelcomeMessage(); }
            else if (message.startsWith(`global_soob_on_`)) { config.govMessagesEnabled = true; sendWelcomeMessage(); }
            else if (message.startsWith(`global_soob_off_`)) { config.govMessagesEnabled = false; sendWelcomeMessage(); }
            else if (message.startsWith(`global_mesto_on_`)) { config.trackLocationRequests = true; sendWelcomeMessage(); }
            else if (message.startsWith(`global_mesto_off_`)) { config.trackLocationRequests = false; sendWelcomeMessage(); }
            else if (message.startsWith(`global_radio_on_`)) { config.radioOfficialNotifications = true; sendWelcomeMessage(); }
            else if (message.startsWith(`global_radio_off_`)) { config.radioOfficialNotifications = false; sendWelcomeMessage(); }
            else if (message.startsWith(`global_warning_on_`)) { config.warningNotifications = true; sendWelcomeMessage(); }
            else if (message.startsWith(`global_warning_off_`)) { config.warningNotifications = false; sendWelcomeMessage(); }
            else if (message.startsWith(`global_afk_n_`)) showAFKNightModesMenu(chatId, messageId, callbackUniqueId);
            else if (message.startsWith(`afk_n_with_pauses_`)) showAFKWithPausesSubMenu(chatId, messageId, callbackUniqueId);
            else if (message.startsWith(`afk_n_without_pauses_`)) showAFKReconnectMenu(chatId, messageId, callbackUniqueId, 'none');
            else if (message.startsWith(`afk_n_fixed_`)) showAFKReconnectMenu(chatId, messageId, callbackUniqueId, 'fixed');
            else if (message.startsWith(`afk_n_random_`)) showAFKReconnectMenu(chatId, messageId, callbackUniqueId, 'random');
            else if (message.startsWith("admin_reply_")) sendToTelegram(`Введите ответ для ${displayName}:`, false, { force_reply: true });
            else if (message.startsWith("move_forward_")) {
                const isNotif = message.endsWith('_notification');
                try { window.onScreenControlTouchStart("<Gamepad>/leftStick"); window.onScreenControlTouchMove("<Gamepad>/leftStick", 0, 1); setTimeout(() => window.onScreenControlTouchEnd("<Gamepad>/leftStick"), 500); sendToTelegram(`Движение вперед на 0.5 сек для ${displayName}`); showMovementControlsMenu(chatId, messageId, isNotif); } catch (err) { sendToTelegram(`Ошибка ${displayName}\n<code>${err.message}</code>`); }
            }
            // ... (остальные move_ команды аналогично)
            answerCallbackQuery(callbackQueryId);
        }
    }
}
function registerUser() {
    if (!config.accountInfo.nickname) return;
    config.activeUsers[config.accountInfo.nickname] = config.accountInfo.nickname;
    debugLog(`Пользователь ${displayName} зарегистрирован локально`);
}
function isNonRPMessage(message) { return message.includes('((') && message.includes('))'); }
function checkIDFormats(message) { const idRegex = /(\d-\d-\d|\d{3})/g; return message.match(idRegex) || []; }
function getRankKeywords() { return config.currentFaction && factions[config.currentFaction] ? Object.values(factions[config.currentFaction].ranks).map(rank => rank.toLowerCase()) : []; }
function checkRoleAndActionConditions(lowerCaseMessage) {
    const rankKeywords = getRankKeywords();
    const hasRoleKeyword = rankKeywords.some(keyword => lowerCaseMessage.includes(keyword));
    const hasActionKeyword = lowerCaseMessage.includes("место") || lowerCaseMessage.includes("ваше") || lowerCaseMessage.includes("жетон");
    return hasRoleKeyword && hasActionKeyword;
}
function checkAFKConditions(msg, lowerCaseMessage) {
    if (!config.afkSettings.active) return false;
    const hasConditions = checkRoleAndActionConditions(lowerCaseMessage);
    const hasID = config.afkSettings.formats.some(format => msg.includes(format));
    return hasConditions && hasID;
}
function checkLocationRequest(msg, lowerCaseMessage) {
    if (!config.trackLocationRequests && !isTargetingPlayer(msg)) return false;
    const rankKeywords = getRankKeywords();
    const hasRoleKeyword = rankKeywords.some(keyword => lowerCaseMessage.includes(keyword));
    const hasActionKeyword = config.locationKeywords.some(word => lowerCaseMessage.includes(word.toLowerCase()));
    const hasID = isTargetingPlayer(msg);
    return hasRoleKeyword && (hasActionKeyword || hasID);
}
function isTargetingPlayer(msg) {
    if (!config.lastPlayerId) return false;
    const idFormats = [config.lastPlayerId, config.lastPlayerId.split('').join('-')];
    return idFormats.some(format => msg.includes(format));
}
function processSalaryAndBalance(msg) {
    if (!config.paydayNotifications) return;
    if (msg.includes("Для получения зарплаты необходимо находиться в игре минимум 25 минут") || msg.includes("Вы не должны находиться на паузе") || msg.includes("Для получения опыта необходимо находиться в игре минимум 10 минут")) {
        sendToTelegram(`- PayDay | ${displayName}:\n${msg.match(/(Для получения.*)/)[1]}`);
        config.lastSalaryInfo = null;
        return;
    }
    const salaryMatch = msg.match(/Зарплата: \{[\w]+\}(\d+) руб/);
    if (salaryMatch) {
        config.lastSalaryInfo = config.lastSalaryInfo || {};
        config.lastSalaryInfo.salary = salaryMatch[1];
        config.afkCycle.totalSalary += parseInt(salaryMatch[1]);
        updateAFKStatus();
    }
    const balanceMatch = msg.match(/Текущий баланс счета: \{[\w]+\}(\d+) руб/);
    if (balanceMatch) {
        config.lastSalaryInfo = config.lastSalaryInfo || {};
        config.lastSalaryInfo.balance = balanceMatch[1];
    }
    if (config.lastSalaryInfo && config.lastSalaryInfo.salary && config.lastSalaryInfo.balance) {
        let message = `+ PayDay | ${displayName}:\nЗарплата: ${config.lastSalaryInfo.salary} руб\nБаланс счета: ${config.lastSalaryInfo.balance} руб`;
        if (config.afkCycle.active) {
            message += getAFKStatusText();
            config.afkCycle.statusMessageIds.forEach(({ chatId, messageId }) => deleteMessage(chatId, messageId));
            config.afkCycle.statusMessageIds = [];
            globalState.lastPaydayMessageIds.forEach(({ chatId, messageId }) => deleteMessage(chatId, messageId));
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
    if (!tracker) { config.govMessageTrackers[trackerKey] = { count: 1, lastMessageTime: now, cooldownEnd: 0 }; return true; }
    if (hasKeyword && tracker.cooldownEnd > 0) { tracker.cooldownEnd = 0; tracker.count = 1; return true; }
    if (now < tracker.cooldownEnd) return false;
    if (now - tracker.lastMessageTime > config.govMessageCooldown) { tracker.count = 1; tracker.lastMessageTime = now; return true; }
    tracker.count++;
    tracker.lastMessageTime = now;
    if (tracker.count > config.govMessageThreshold) { tracker.cooldownEnd = now + config.govMessageCooldown; return false; }
    return true;
}
function getCurrentTimeString() {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
}
function activateAFKWithMode(mode, reconnect, chatId, messageId) {
    if (config.afkSettings.active) return sendToTelegram(`AFK режим уже активирован для ${displayName}`);
    const hudId = getPlayerIdFromHUD();
    if (!hudId) return sendToTelegram(`Ошибка ${displayName}: Не удалось получить ID из HUD`);
    const idFormats = [hudId];
    if (hudId.includes('-')) idFormats.push(hudId.replace(/-/g, ''));
    else if (hudId.length === 3) idFormats.push(`${hudId[0]}-${hudId[1]}-${hudId[2]}`);
    config.afkSettings = { id: hudId, formats: idFormats, active: true };
    config.afkCycle.mode = mode;
    config.afkCycle.reconnectEnabled = reconnect;
    startAFKCycle();
    sendToTelegram(`AFK режим активирован для ${displayName}\nID: ${hudId}\nРежим: ${mode === 'none' ? '25 мин без пауз' : mode === 'fixed' ? '5/5 мин' : 'Рандом'}\nРеконнект: ${reconnect ? 'ВКЛ' : 'ВЫКЛ'}`);
    showGlobalFunctionsMenu(chatId, messageId, uniqueId);
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
    [config.afkCycle.cycleTimer, config.afkCycle.playTimer, config.afkCycle.pauseTimer, config.afkCycle.mainTimer].forEach(timer => timer && clearTimeout(timer));
    config.afkCycle.statusMessageIds.forEach(({ chatId, messageId }) => deleteMessage(chatId, messageId));
    config.afkCycle.statusMessageIds = [];
    config.afkCycle.active = false;
    sendToTelegram(`AFK цикл остановлен для ${displayName}`);
}
function startPlayPhase() {
    if (!config.afkCycle.active) return;
    let playDurationMs;
    if (config.afkCycle.mode === 'none') {
        playDurationMs = 25 * 60 * 1000 - config.afkCycle.totalPlayTime;
        if (playDurationMs <= 0) { enterPauseUntilEnd(); return; }
    } else if (config.afkCycle.mode === 'fixed') playDurationMs = 5 * 60 * 1000;
    else if (config.afkCycle.mode === 'random') {
        const remaining = 25 * 60 * 1000 - config.afkCycle.totalPlayTime;
        if (remaining <= 0) { enterPauseUntilEnd(); return; }
        const maxPossible = Math.min(8 * 60 * 1000, remaining);
        const minPossible = Math.min(2 * 60 * 1000, maxPossible);
        playDurationMs = Math.floor(Math.random() * (maxPossible - minPossible + 1) + minPossible);
    }
    const durationMin = Math.floor(playDurationMs / 60000);
    const currentTime = getCurrentTimeString();
    config.afkCycle.playHistory.push(`Игровой режим [${durationMin} мин] в ${currentTime}`);
    if (config.afkCycle.playHistory.length > 3) config.afkCycle.playHistory.shift();
    updateAFKStatus();
    try { if (typeof closeInterface === 'function') closeInterface("PauseMenu"); } catch (e) {}
    config.afkCycle.playTimer = setTimeout(() => {
        config.afkCycle.totalPlayTime += playDurationMs;
        if (config.afkCycle.totalPlayTime >= 25 * 60 * 1000) enterPauseUntilEnd();
        else if (config.afkCycle.mode !== 'none') startPausePhase();
    }, playDurationMs);
}
function startPausePhase() {
    if (!config.afkCycle.active) return;
    let pauseDurationMs;
    if (config.afkCycle.mode === 'fixed') pauseDurationMs = 5 * 60 * 1000;
    else if (config.afkCycle.mode === 'random') pauseDurationMs = Math.floor(Math.random() * (6 * 60 * 1000 + 1) + 2 * 60 * 1000);
    const durationMin = Math.floor(pauseDurationMs / 60000);
    const currentTime = getCurrentTimeString();
    config.afkCycle.pauseHistory.push(`Режим паузы [${durationMin} мин] в ${currentTime}`);
    if (config.afkCycle.pauseHistory.length > 3) config.afkCycle.pauseHistory.shift();
    updateAFKStatus();
    try { if (typeof openInterface === 'function') openInterface("PauseMenu"); } catch (e) {}
    config.afkCycle.pauseTimer = setTimeout(startPlayPhase, pauseDurationMs);
}
function enterPauseUntilEnd() {
    const currentTime = getCurrentTimeString();
    config.afkCycle.pauseHistory.push(`Пауза до PayDay (до 59 мин) в ${currentTime}`);
    if (config.afkCycle.pauseHistory.length > 3) config.afkCycle.pauseHistory.shift();
    updateAFKStatus();
    if (config.afkCycle.reconnectEnabled) {
        autoLoginConfig.enabled = false;
        sendChatInput("/rec 5");
        debugLog(`Реконнект: /rec 5, автовход отключён (${displayName})`);
        config.afkCycle.mainTimer = setTimeout(() => {
            autoLoginConfig.enabled = true;
            sendChatInput("/rec 5");
            setTimeout(initializeAutoLogin, 5000);
            debugLog(`Реконнект: второй /rec 5 + автовход (${displayName})`);
        }, 59 * 60 * 1000);
    } else {
        try { if (typeof openInterface === 'function') openInterface("PauseMenu"); } catch (e) {}
    }
}
function handlePayDayTimeMessage() {
    if (!config.afkSettings.active || config.afkCycle.mode === 'none') return;
    [config.afkCycle.cycleTimer, config.afkCycle.playTimer, config.afkCycle.pauseTimer, config.afkCycle.mainTimer].forEach(timer => timer && clearTimeout(timer));
    config.afkCycle.mainTimer = setTimeout(() => {
        if (config.afkCycle.reconnectEnabled) {
            autoLoginConfig.enabled = true;
            initializeAutoLogin();
            setTimeout(() => sendChatInput("/rec 5"), 5000);
        } else {
            try { if (typeof closeInterface === 'function') closeInterface("PauseMenu"); } catch (e) {}
        }
    }, 59 * 60 * 1000);
    if (!config.afkCycle.active) startAFKCycle();
    config.afkCycle.startTime = Date.now();
    config.afkCycle.totalPlayTime = 0;
    updateAFKStatus();
    startPlayPhase();
}
function setupAutoLogin(attempt = 1) {
    if (!autoLoginConfig.enabled) return;
    if (attempt > autoLoginConfig.maxAttempts) return sendToTelegram(`Ошибка ${displayName}\nНе удалось выполнить автовход после ${autoLoginConfig.maxAttempts} попыток`);
    if (!window.getInterfaceStatus("Authorization")) return setTimeout(() => setupAutoLogin(attempt + 1), autoLoginConfig.attemptInterval);
    const authInstance = window.interface("Authorization");
    if (!authInstance) return setTimeout(() => setupAutoLogin(attempt + 1), autoLoginConfig.attemptInterval);
    const loginInstance = authInstance.getInstance("auth");
    if (!loginInstance) return setTimeout(() => setupAutoLogin(attempt + 1), autoLoginConfig.attemptInterval);
    loginInstance.password.value = autoLoginConfig.password;
    setTimeout(() => {
        if (loginInstance.password.value === autoLoginConfig.password) {
            try { loginInstance.onClickEvent("play"); } catch (err) { sendToTelegram(`Ошибка ${displayName}\n<code>${err.message}</code>`); setTimeout(() => setupAutoLogin(attempt + 1), autoLoginConfig.attemptInterval); }
        } else setTimeout(() => setupAutoLogin(attempt + 1), autoLoginConfig.attemptInterval);
    }, 100);
}
function initializeAutoLogin() {
    if (!autoLoginConfig.enabled) return;
    if (window.getInterfaceStatus("Authorization")) return setupAutoLogin();
    const openParams = ["auth", config.accountInfo.nickname || "Pavel_Nabokov", "", "", "", "", "", "https://radmir.online/recovery-password", { autoLogin: { password: autoLoginConfig.password, enabled: autoLoginConfig.enabled } }];
    try { window.openInterface("Authorization", JSON.stringify(openParams)); } catch (err) { sendToTelegram(`Ошибка ${displayName}\n<code>${err.message}</code>`); return; }
    let attempts = 0;
    const checkInterval = setInterval(() => {
        attempts++;
        if (window.getInterfaceStatus("Authorization")) { clearInterval(checkInterval); setTimeout(setupAutoLogin, 1000); }
        else if (attempts >= autoLoginConfig.maxAttempts) { clearInterval(checkInterval); sendToTelegram(`Ошибка ${displayName}\nНе удалось открыть Authorization`); }
    }, autoLoginConfig.attemptInterval);
}
const originalOpenInterface = window.openInterface;
window.openInterface = function(interfaceName, params, additionalParams) {
    const result = originalOpenInterface.call(this, interfaceName, params, additionalParams);
    if (interfaceName === "Authorization") setTimeout(initializeAutoLogin, 500);
    return result;
};
function normalizeToCyrillic(text) {
    const map = { 'A': 'А', 'a': 'а', 'B': 'В', 'b': 'в', 'C': 'С', 'c': 'с', 'E': 'Е', 'e': 'е', 'H': 'Н', 'h': 'н', 'K': 'К', 'k': 'к', 'M': 'М', 'm': 'м', 'O': 'О', 'o': 'о', 'P': 'Р', 'p': 'р', 'T': 'Т', 't': 'т', 'X': 'Х', 'x': 'х', 'Y': 'У', 'y': 'у', '3': 'З' };
    return text.split('').map(char => map[char] || char).join('');
}
function initializeChatMonitor() {
    if (typeof sendChatInput === 'undefined') return false;
    if (typeof window.playSound === 'undefined') window.playSound = (url, loop, volume) => { const audio = new Audio(url); audio.loop = loop || false; audio.volume = volume || 1.0; audio.play().catch(e => debugLog('Ошибка звука:', e)); };
    window.OnChatAddMessage = function(e, i, t) {
        const msg = String(e);
        const normalizedMsg = normalizeToCyrillic(msg);
        const lowerCaseMessage = normalizedMsg.toLowerCase();
        const chatRadius = getChatRadius(i);
        if (msg.includes("Текущее время:") && config.afkSettings.active) handlePayDayTimeMessage();
        if (config.afkSettings.active && config.afkCycle.active && msg.includes("Сервер возобновит работу в течение минуты...")) {
            debugLog('Обнаружено сообщение о рестарте сервера!');
            const command = config.afkCycle.reconnectEnabled ? "/rec 5" : "/q";
            sendChatInput(command);
            let restartMessage = `Автоматически отправлено <b>${command}</b> (${displayName})\nСервер возобновит работу`;
            if (config.afkCycle.active) {
                restartMessage += getAFKStatusText();
                config.afkCycle.statusMessageIds.forEach(({ chatId, messageId }) => deleteMessage(chatId, messageId));
                config.afkCycle.statusMessageIds = [];
            }
            sendToTelegram(restartMessage);
            if (config.afkCycle.reconnectEnabled) {
                setTimeout(() => {
                    sendChatInput("/rec 5");
                    autoLoginConfig.enabled = true;
                    setTimeout(initializeAutoLogin, 5000);
                    sendToTelegram(`Повторный /rec 5 + автовход (${displayName})`);
                }, 5 * 60 * 1000);
            }
        }
        if (lowerCaseMessage.includes("зареспавнил вас")) {
            const replyMarkup = { inline_keyboard: [[createButton("Ответить", `admin_reply_${uniqueId}`),createButton("Движения", `show_movement_${uniqueId}`)]] };
            sendToTelegram(`Вас зареспавнили!! (${displayName})\n<code>${msg.replace(/</g, '&lt;')}</code>`, false, replyMarkup);
            window.playSound("https://raw.githubusercontent.com/ZaharQqqq/Sound/main/uved.mp3", false, 1.0);
        }
        if (lowerCaseMessage.includes("вы были кикнуты по подозрению в читерстве")) {
            const replyMarkup = { inline_keyboard: [[createButton("Ответить", `admin_reply_${uniqueId}`),createButton("Движения", `show_movement_${uniqueId}`)]] };
            sendToTelegram(`Вас кикнул анти-чит! (${displayName})\n<code>${msg.replace(/</g, '&lt;')}</code>`, false, replyMarkup);
            window.playSound("https://raw.githubusercontent.com/ZaharQqqq/Sound/main/kick.mp3", false, 1.0);
            sendChatInput("/rec 5");
        }
        let factionColor = config.currentFaction && factions[config.currentFaction] ? factions[config.currentFaction].color : 'CCFF00';
        const govMessageRegex = new RegExp(`^\\- (.+?) \\{${factionColor}\\}\\(\\{v:([^}]+)}\\)\\[(\\d+)\\]`);
        const govMatch = msg.match(govMessageRegex);
        if (govMatch && chatRadius === CHAT_RADIUS.CLOSE) {
            const messageText = govMatch[1], senderName = govMatch[2], senderId = govMatch[3];
            if (checkGovMessageConditions(messageText, senderName, senderId)) {
                const replyMarkup = { inline_keyboard: [[createButton("Ответить", `admin_reply_${uniqueId}`),createButton("Движения", `show_movement_${uniqueId}`)]] };
                sendToTelegram(`Сообщение от сотрудника фракции (${displayName}):\n${senderName} [ID: ${senderId}]\n${messageText}`, false, replyMarkup);
            }
        }
        processSalaryAndBalance(msg);
        if (config.keywords.some(kw => lowerCaseMessage.includes(kw.toLowerCase()))) {
            sendToTelegram(`Обнаружено ключевое слово (${displayName}):\n<code>${msg.replace(/</g, '&lt;')}</code>`);
            setTimeout(() => { try { sendChatInput("/c"); } catch (err) { sendToTelegram(`Ошибка ${displayName}\n<code>${err.message}</code>`); } }, config.clearDelay);
        }
        if (!isNonRPMessage(msg) && checkLocationRequest(msg, lowerCaseMessage)) {
            const replyMarkup = { inline_keyboard: [[createButton("Ответить", `admin_reply_${uniqueId}`),createButton("Движения", `show_movement_${uniqueId}`)]] };
            sendToTelegram(`Обнаружен запрос местоположения (${displayName}):\n<code>${msg.replace(/</g, '&lt;')}</code>`, false, replyMarkup);
        }
        if (!isNonRPMessage(msg) && checkAFKConditions(msg, lowerCaseMessage)) {
            sendChatInput("/q");
            sendToTelegram(`Автоматически отправлено /q (${displayName})\nПо AFK условию для ID: ${config.afkSettings.id}\n<code>${msg.replace(/</g, '&lt;')}</code>`);
        }
        if (chatRadius === CHAT_RADIUS.RADIO && config.radioOfficialNotifications && !isNonRPMessage(msg)) {
            const replyMarkup = { inline_keyboard: [[createButton("Ответить", `admin_reply_${uniqueId}`),createButton("Движения", `show_movement_${uniqueId}`)]] };
            sendToTelegram(`Сообщение с рации (${displayName}):\n<code>${msg.replace(/</g, '&lt;')}</code>`, false, replyMarkup);
        }
        if (config.currentFaction && factions[config.currentFaction] && config.warningNotifications) {
            const ranks = factions[config.currentFaction].ranks;
            const rank10 = ranks[10].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const rank9 = ranks[9].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const warningRegex = new RegExp(`(?:${rank10}|${rank9})\\s+([^[]+)\\[(\\d+)\\]\\s+выдал\\s+Вам\\s+Выговор\\s+(\\d+)\\s+из\\s+3\\.\\s+Причина:\\s+(.*)`, 'i');
            const warningMatch = msg.match(warningRegex);
            if (warningMatch) {
                sendToTelegram(`Получен выговор (${displayName}) от ${warningMatch[1]} [ID: ${warningMatch[2]}]:\nВыговор ${warningMatch[3]}/3\nПричина: ${warningMatch[4]}\n<code>${msg.replace(/</g, '&lt;')}</code>`);
                window.playSound("https://raw.githubusercontent.com/ZaharQqqq/Sound/main/uved.mp3", false, 1.0);
            }
        }
    };
    debugLog('Мониторинг успешно активирован');
    if (!config.initialized) {
        trackNicknameAndServer();
        config.initialized = true;
        if (config.trackPlayerId) trackPlayerId();
    }
    checkTelegramCommands();
    return true;
}
debugLog('Скрипт запущен');
if (!initializeChatMonitor()) {
    let attempts = 0;
    const intervalId = setInterval(() => {
        attempts++;
        if (initializeChatMonitor()) clearInterval(intervalId);
        else if (attempts >= config.maxAttempts) {
            clearInterval(intervalId);
            sendToTelegram(`Ошибка\nНе удалось инициализировать после ${config.maxAttempts} попыток`);
        }
    }, config.checkInterval);
}
