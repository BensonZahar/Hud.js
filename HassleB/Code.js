// ============================================================================
// НОВЫЙ МОДУЛЬНЫЙ CODE.JS - ВЕРСИЯ 2.0
// ============================================================================

// ============================================================================
// БЛОК 1: КОНСТАНТЫ И КОНФИГУРАЦИЯ
// ============================================================================
const SERVER_TOKENS = {
    '4': '8496708572:AAHpNdpNEAQs9ecdosZn3sCsQqJhWdLRn7U',
    '5': '7088892553:AAEQiujKWYXpH16m0L-KijpKXRT-i4UIoPE',
    '6': '7318283272:AAEpKje_GRsGwYJj1GROy9jovLayo--i4QY',
    '12': '7314669193:AAEMOdTUVpuKptq5x-Wf_uqoNtcYnMM12oU'
};

const config = {
    botToken: null,
    chatIds: CHAT_IDS,
    accountInfo: { nickname: null, server: null, skinId: null },
    lastUpdateId: 0,
    debug: true,
    checkInterval: 1500
};

let displayName = 'User';
let uniqueId = 'unknown';

// ============================================================================
// БЛОК 2: УТИЛИТЫ И ХЕЛПЕРЫ
// ============================================================================
function debugLog(msg) { if (config.debug) console.log(`[${new Date().toLocaleTimeString()}] [${config.accountInfo.nickname || 'Unknown'}]`, msg); }
function getCurrentTimeString() { const n = new Date(); return `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}:${String(n.getSeconds()).padStart(2,'0')}`; }
function updateDisplayName() { displayName = `${config.accountInfo.nickname || 'User'} [S${config.accountInfo.server || '?'}]`; uniqueId = `${config.accountInfo.nickname}_${config.accountInfo.server}`; debugLog(`displayName обновлён: ${displayName}`); }

// ============================================================================
// БЛОК 3: SHARED STORAGE (localStorage для lastUpdateId)
// ============================================================================
function getSharedLastUpdateId() { return parseInt(localStorage.getItem('tg_bot_last_update_id') || '0', 10); }
function setSharedLastUpdateId(id) { localStorage.setItem('tg_bot_last_update_id', id); debugLog(`Shared lastUpdateId: ${id}`); }

// ============================================================================
// БЛОК 4: TELEGRAM API - БАЗОВЫЕ ФУНКЦИИ
// ============================================================================
function sendToTelegram(message, silent = false, replyMarkup = null) {
    config.chatIds.forEach(chatId => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.telegram.org/bot${config.botToken}/sendMessage`, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = () => { if (xhr.status === 200) debugLog(`Сообщение отправлено в ${chatId}`); else debugLog(`Ошибка TG API для ${chatId}: ${xhr.status}`); };
        xhr.send(JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML', disable_notification: silent, reply_markup: replyMarkup ? JSON.stringify(replyMarkup) : undefined }));
    });
}

function deleteMessage(chatId, messageId) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.telegram.org/bot${config.botToken}/deleteMessage`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({ chat_id: chatId, message_id: messageId }));
}

function editMessageText(chatId, messageId, text, replyMarkup = null) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.telegram.org/bot${config.botToken}/editMessageText`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = () => { if (xhr.status === 200) debugLog(`Сообщение отредактировано в ${chatId}`); };
    xhr.send(JSON.stringify({ chat_id: chatId, message_id: messageId, text: text, parse_mode: 'HTML', reply_markup: replyMarkup ? JSON.stringify(replyMarkup) : undefined }));
}

function editMessageReplyMarkup(chatId, messageId, replyMarkup) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.telegram.org/bot${config.botToken}/editMessageReplyMarkup`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({ chat_id: chatId, message_id: messageId, reply_markup: replyMarkup }));
}

function answerCallbackQuery(callbackQueryId) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.telegram.org/bot${config.botToken}/answerCallbackQuery`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({ callback_query_id: callbackQueryId }));
}

// ============================================================================
// БЛОК 5: TELEGRAM - СОЗДАНИЕ КНОПОК
// ============================================================================
function createButton(text, command) { return { text: text, callback_data: command }; }

// ============================================================================
// БЛОК 6: ОТСЛЕЖИВАНИЕ НИКНЕЙМА И СЕРВЕРА
// ============================================================================
let nicknameLogged = false;

function trackNicknameAndServer() {
    try {
        const nickname = window.interface("Menu").$store.getters["menu/nickName"];
        const serverId = window.interface("Menu").$store.getters["menu/selectedServer"];
        if (nickname && serverId && !nicknameLogged) {
            nicknameLogged = true;
            config.accountInfo.nickname = nickname;
            config.accountInfo.server = serverId.toString();
            config.botToken = SERVER_TOKENS[config.accountInfo.server] || SERVER_TOKENS['4'];
            debugLog(`Установлен botToken для сервера ${config.accountInfo.server}`);
            updateDisplayName();
            sendWelcomeMessage();
        }
    } catch (e) { debugLog(`Ошибка получения ника/сервера: ${e.message}`); }
    setTimeout(trackNicknameAndServer, 900);
}

// ============================================================================
// БЛОК 7: ПРИВЕТСТВЕННОЕ СООБЩЕНИЕ
// ============================================================================
let lastWelcomeMessageId = null;

function sendWelcomeMessage() {
    if (!config.accountInfo.nickname) return;
    const message = `🟢 <b>Hassle | Bot TG</b>\nНик: ${config.accountInfo.nickname}\nСервер: ${config.accountInfo.server || 'Не указан'}`;
    const replyMarkup = { inline_keyboard: [[createButton("⚙️ Управление", `show_controls_${uniqueId}`)]] };
    
    config.chatIds.forEach(chatId => {
        if (lastWelcomeMessageId) {
            editMessageText(chatId, lastWelcomeMessageId, message, replyMarkup);
        } else {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `https://api.telegram.org/bot${config.botToken}/sendMessage`, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onload = () => { if (xhr.status === 200) { const data = JSON.parse(xhr.responseText); lastWelcomeMessageId = data.result.message_id; } };
            xhr.send(JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML', reply_markup: JSON.stringify(replyMarkup) }));
        }
    });
}

// ============================================================================
// БЛОК 8: МЕНЮ - БАЗОВЫЕ ФУНКЦИИ
// ============================================================================
function showControlsMenu(chatId, messageId) {
    const replyMarkup = { inline_keyboard: [[createButton("📋 Общие функции", `show_global_functions_${uniqueId}`)], [createButton("⬅️ Вернуться назад", `hide_controls_${uniqueId}`)]] };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}

function hideControlsMenu(chatId, messageId) {
    const replyMarkup = { inline_keyboard: [[createButton("⚙️ Управление", `show_controls_${uniqueId}`)]] };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}

function showGlobalFunctionsMenu(chatId, messageId) {
    const replyMarkup = { inline_keyboard: [[createButton("⬅️ Вернуться назад", `show_controls_${uniqueId}`)]] };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}

// ============================================================================
// БЛОК 9: ОБРАБОТКА TELEGRAM КОМАНД
// ============================================================================
function processUpdates(updates) {
    for (const update of updates) {
        config.lastUpdateId = update.update_id;
        setSharedLastUpdateId(config.lastUpdateId);
        
        let chatId = null;
        if (update.message) chatId = update.message.chat.id;
        else if (update.callback_query) chatId = update.callback_query.message.chat.id;
        
        if (!config.chatIds.includes(String(chatId))) { debugLog(`Игнорируем чат: ${chatId}`); continue; }
        
        if (update.callback_query) {
            const message = update.callback_query.data;
            const messageId = update.callback_query.message.message_id;
            const callbackQueryId = update.callback_query.id;
            
            const isForThisBot = message.includes(uniqueId) || (update.callback_query.message.text && update.callback_query.message.text.includes(displayName));
            if (!isForThisBot) { answerCallbackQuery(callbackQueryId); continue; }
            
            if (message.startsWith('show_controls_')) showControlsMenu(chatId, messageId);
            else if (message.startsWith('hide_controls_')) hideControlsMenu(chatId, messageId);
            else if (message.startsWith('show_global_functions_')) showGlobalFunctionsMenu(chatId, messageId);
            
            answerCallbackQuery(callbackQueryId);
        }
    }
}

function checkTelegramCommands() {
    const randomDelay = Math.floor(Math.random() * 500);
    setTimeout(() => {
        config.lastUpdateId = getSharedLastUpdateId();
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `https://api.telegram.org/bot${config.botToken}/getUpdates?offset=${config.lastUpdateId + 1}`, true);
        xhr.onload = () => {
            if (xhr.status === 200) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    if (data.ok && data.result.length > 0) processUpdates(data.result);
                } catch (e) { debugLog('Ошибка парсинга ответа Telegram:', e); }
            }
            setTimeout(checkTelegramCommands, config.checkInterval);
        };
        xhr.onerror = () => { debugLog('Ошибка сети при проверке команд'); setTimeout(checkTelegramCommands, config.checkInterval); };
        xhr.send();
    }, randomDelay);
}

// ============================================================================
// БЛОК 10: ИНИЦИАЛИЗАЦИЯ
// ============================================================================
debugLog('Скрипт запущен');
trackNicknameAndServer();
checkTelegramCommands();

console.log('✅ Hassle Bot v2.0 загружен - Модульная версия');
