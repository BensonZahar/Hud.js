// Глобальный объект для хранения состояния AFK-запроса
const globalState = {
    awaitingAfkAccount: false,
    awaitingAfkId: false,
    afkTargetAccount: null,
    awaitingAfkNightMode: false,
    awaitingAfkNightPauseType: false // Флаг для ожидания выбора типа пауз
};

// в случае index оставить это в hud.js 
if (tt?.methods?.add) {
    const originalAdd = tt.methods.add;
    tt.methods.add = function(e, s, t) {
        const result = originalAdd.call(this, e, s, t);
        window.OnChatAddMessage?.(e, s, t);
        return result;
    };
}

// КОНФИГУРАЦИЯ
const userConfig = {
    userNumber: "5",
    botToken: '8184449811:AAE-nssyxdjAGnCkNCKTMN8rc2xgWEaVOFA',
    chatIds: ['1046461621'],
    keywords: [],
    clearDelay: 3000,
    maxAttempts: 15,
    checkInterval: 1000,
    debug: true,
    podbrosCooldown: 30000,
    afkSettings: {},
    lastSalaryInfo: null,
    paydayNotifications: true,
    trackPlayerId: true,
    idCheckInterval: 10000,
    govMessagesEnabled: true,
    govMessageCooldown: 360000,
    govMessageThreshold: 6,
    govMessageKeywords: ["тут", "здесь"],
    trackLocationRequests: false,
    locationKeywords: ["местоположение", "место", "позиция", "координаты"]
};

const accountMapping = {
    "1": { nickname: "Zahar-Deni", server: "01" },
    "2": { nickname: "Yarik_Alihan", server: "12" },
    "3": { nickname: "Fors_Guevara", server: "12" },
    "4": { nickname: "Yarik_Alihan", server: "06" },
    "5": { nickname: "Fors_Guevara", server: "06" },
    "6": { nickname: "Dmitriy_Take", server: "04" },
    "7": { nickname: "Grand_Mamonov", server: "04" },
    "8": { nickname: "Andrey_Sudu", server: "04" },
    "9": { nickname: "Nicolas_Lyashov", server: "04" },
    "10": { nickname: "Sergey_Ast", server: "04" },
    "11": { nickname: "Artur_Vart", server: "04" }
};

const config = {
    ...userConfig,
    lastUpdateId: 0,
    activeUsers: {},
    lastPodbrosTime: 0,
    podbrosCounter: 0,
    initialized: false,
    accountInfo: accountMapping[userConfig.userNumber] || { nickname: `User_${userConfig.userNumber}`, server: "Не указан" },
    lastPlayerId: null,
    govMessageTrackers: {},
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
        withPauses: true,
        randomIntervals: [], // Массив для хранения случайных интервалов
        currentCycleIndex: 0, // Индекс текущего цикла
        useRandomIntervals: false // Флаг для использования случайных интервалов
    }
};

const displayName = `${config.accountInfo.nickname} [S${config.accountInfo.server}]`;

function debugLog(message) {
    if (config.debug) {
        console.log(`[DEBUG][${config.accountInfo.nickname}]`, message);
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

function trackPlayerId() {
    if (!config.trackPlayerId) return;

    const currentId = getPlayerIdFromHUD();
        
    if (currentId && currentId !== config.lastPlayerId) {
        debugLog(`Обнаружен новый ID (HUD): ${currentId}`);
        config.lastPlayerId = currentId;
    }

    setTimeout(trackPlayerId, config.idCheckInterval);
}

function createButton(text, command) {
    return {
        text: text,
        callback_data: command
    };
}

function sendToTelegram(message, silent = false, replyMarkup = null) {
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
    xhr.send(JSON.stringify(payload));
}

function sendWelcomeMessage() {
    const playerIdDisplay = config.lastPlayerId ? ` (ID: ${config.lastPlayerId})` : '';
    const message = `🟢 <b>Hassle | Bot TG</b>\n` +
        `Ник: ${config.accountInfo.nickname}${playerIdDisplay}\n` +
        `Сервер: ${config.accountInfo.server}\n` +
        `Номер: ${config.userNumber}\n\n` +
        `🔔 <b>Текущие настройки:</b>\n` +
        `├ Уведомления PayDay: ${config.paydayNotifications ? '🟢 ВКЛ' : '🔴 ВЫКЛ'}\n` +
        `├ Уведомления от сотрудников: ${config.govMessagesEnabled ? '🟢 ВКЛ' : '🔴 ВЫКЛ'}\n` +
        `└ Отслеживание местоположения: ${config.trackLocationRequests ? '🟢 ВКЛ' : '🔴 ВЫКЛ'}`;

    const replyMarkup = {
        inline_keyboard: [
            [createButton("⚙️ Управление", "show_controls")]
        ]
    };

    sendToTelegram(message, false, replyMarkup);
}

function showControlsMenu(chatId, messageId) {
    const replyMarkup = {
        inline_keyboard: [
            [createButton("⚙️ Функции", "show_local_functions")],
            [createButton("📋 Общие функции", "show_global_functions")],
            [createButton("⬆️ Свернуть", "hide_controls")]
        ]
    };

    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}

function showGlobalFunctionsMenu(chatId, messageId) {
    const replyMarkup = {
        inline_keyboard: [
            [
                createButton("🔔 PayDay ВКЛ", "global_p_on"),
                createButton("🔕 PayDay ВЫКЛ", "global_p_off")
            ],
            [
                createButton("🏛️ Сообщ. ВКЛ", "global_soob_on"),
                createButton("🔕 Сообщ. ВЫКЛ", "global_soob_off")
            ],
            [
                createButton("📍 Место ВКЛ", "global_mesto_on"),
                createButton("🔕 Место ВЫКЛ", "global_mesto_off")
            ],
            [
                createButton("🌙 AFK Ночь", "global_afk_n"),
                createButton("🔄 AFK", "global_afk")
            ],
            [createButton("⬅️ Назад", "show_controls")]
        ]
    };

    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}

function showLocalFunctionsMenu(chatId, messageId) {
    const replyMarkup = {
        inline_keyboard: [
            [
                createButton("🏛️Выкл увед. правик", "local_soob_off"),
                createButton("🔔Вкл увед. правик", "local_soob_on")
            ],
            [
                createButton("📍Вкл отслеживание", "local_mesto_on"),
                createButton("🔕Выкл отслеживание", "local_mesto_off")
            ],
            [createButton("📝 Написать в чат", "request_chat_message")],
            [createButton("⬅️ Назад", "show_controls")]
        ]
    };

    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}

function hideControlsMenu(chatId, messageId) {
    const replyMarkup = {
        inline_keyboard: [
            [createButton("⚙️ Управление", "show_controls")]
        ]
    };

    editMessageReplyMarkup(chatId, messageId, replyMarkup);
}

function showAfkNightModeMenu() {
    const message = `🌙 <b>Выберите режим AFK Ночь для всех аккаунтов:</b>`;
    const replyMarkup = {
        inline_keyboard: [
            [
                createButton("С паузами", "global_afk_n_with_pauses"),
                createButton("Без пауз", "global_afk_n_without_pauses")
            ]
        ]
    };
    sendToTelegram(message, false, replyMarkup);
}

function showAfkNightPauseTypeMenu() {
    const message = `🌙 <b>Выберите тип пауз для AFK Ночь:</b>`;
    const replyMarkup = {
        inline_keyboard: [
            [
                createButton("5/5 минут", "global_afk_n_pauses_fixed"),
                createButton("Рандомное время", "global_afk_n_pauses_random")
            ]
        ]
    };
    sendToTelegram(message, false, replyMarkup);
}

function generateRandomIntervals() {
    const totalCycleTime = 3595000; // 59 минут 55 секунд в мс
    const targetPlayTime = 1500000; // 25 минут в мс
    const minInterval = 120000; // 2 минуты в мс
    const maxInterval = 480000; // 8 минут в мс
    const numCycles = Math.floor(Math.random() * 3) + 4; // 4–6 циклов

    let intervals = [];
    let totalPlay = 0;
    let totalPause = 0;

    // Генерируем случайные интервалы для игры
    for (let i = 0; i < numCycles - 1; i++) {
        const playTime = Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval;
        totalPlay += playTime;
        intervals.push({ play: playTime, pause: 0 });
    }

    // Последний игровой интервал для достижения ровно 25 минут
    const lastPlayTime = targetPlayTime - totalPlay;
    if (lastPlayTime >= minInterval && lastPlayTime <= maxInterval) {
        intervals.push({ play: lastPlayTime, pause: 0 });
        totalPlay += lastPlayTime;
    } else {
        // Если последний интервал выходит за пределы, корректируем
        intervals = [];
        totalPlay = 0;
        const evenPlayTime = Math.floor(targetPlayTime / numCycles);
        for (let i = 0; i < numCycles; i++) {
            intervals.push({ play: evenPlayTime, pause: 0 });
            totalPlay += evenPlayTime;
        }
        // Корректируем последний интервал для точного времени
        intervals[numCycles - 1].play += targetPlayTime - totalPlay;
        totalPlay = targetPlayTime;
    }

    // Генерируем паузы
    const remainingTime = totalCycleTime - targetPlayTime;
    const minPauseTime = Math.max(minInterval, Math.floor(remainingTime / numCycles));
    for (let i = 0; i < numCycles - 1; i++) {
        const pauseTime = Math.floor(Math.random() * (maxInterval - minPauseTime + 1)) + minPauseTime;
        intervals[i].pause = pauseTime;
        totalPause += pauseTime;
    }

    // Последняя пауза до конца цикла
    intervals[numCycles - 1].pause = remainingTime - totalPause;

    debugLog(`Сгенерированы интервалы: ${JSON.stringify(intervals)}`);
    return intervals;
}

function checkTelegramCommands() {
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
        setTimeout(checkTelegramCommands, 1000);
    };
    xhr.onerror = function(error) {
        debugLog('Ошибка при проверке команд:', error);
        setTimeout(checkTelegramCommands, 1000);
    };
    xhr.send();
}

function processUpdates(updates) {
    for (const update of updates) {
        config.lastUpdateId = update.update_id;

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
                            sendToTelegram(`✅ <b>Сообщение отправлено ${displayName}:</b>\n<code>${textToSend.replace(/</g, '<')}</code>`);
                        } catch (err) {
                            const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось отправить сообщение\n<code>${err.message}</code>`;
                            debugLog(errorMsg);
                            sendToTelegram(errorMsg);
                        }
                    }
                    continue;
                }
                    
                // Ответ на запрос ответа администратору
                if (replyToText.includes(`✉️ Введите ответ администратору для ${displayName}:`)) {
                    const textToSend = message;
                    if (textToSend) {
                        debugLog(`[${displayName}] Отправка ответа администратору: ${textToSend}`);
                        try {
                            sendChatInput(textToSend);
                            sendToTelegram(`✅ <b>Ответ администратору отправлен ${displayName}:</b>\n<code>${textToSend.replace(/</g, '<')}</code>`);
                        } catch (err) {
                            const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось отправить ответ\n<code>${err.message}</code>`;
                            debugLog(errorMsg);
                            sendToTelegram(errorMsg);
                        }
                    }
                    continue;
                }

                // Ответ на запрос номера аккаунта для AFK
                if (replyToText.includes(`✉️ Введите номер аккаунта для активации AFK режима:`)) {
                    const accountNumber = message.trim();
                    if (accountNumber && !isNaN(accountNumber) && accountMapping[accountNumber]) {
                        globalState.afkTargetAccount = accountNumber;
                        globalState.awaitingAfkAccount = false;
                        globalState.awaitingAfkId = true;
                        const accountInfo = accountMapping[accountNumber];
                        sendToTelegram(`✉️ Введите ID для активации AFK режима для ${accountInfo.nickname} [S${accountInfo.server}]:`, false, {
                            force_reply: true
                        });
                    } else {
                        sendToTelegram(`❌ <b>Ошибка:</b> Неверный номер аккаунта. Попробуйте снова.`, false, {
                            force_reply: true
                        });
                    }
                    continue;
                }

                // Ответ на запрос ID для AFK
                if (replyToText.includes(`✉️ Введите ID для активации AFK режима для`) && globalState.awaitingAfkId) {
                    const id = message.trim();
                    if (globalState.afkTargetAccount === config.userNumber) {
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

                        sendToTelegram(`🔄 <b>AFK режим активирован для ${displayName}</b>\nID: ${id}\nФорматы: ${idFormats.join(', ')}`);
                    }
                    continue;
                }
            }

            // Глобальные команды (работают на все аккаунты)
            if (message === '/p_off') {
                config.paydayNotifications = false;
                sendToTelegram(`🔕 <b>Уведомления о PayDay отключены для ${displayName}</b>`);
                sendWelcomeMessage();
            } else if (message === '/p_on') {
                config.paydayNotifications = true;
                sendToTelegram(`🔔 <b>Уведомления о PayDay включены для ${displayName}</b>`);
                sendWelcomeMessage();
            } else if (message === '/soob_off') {
                config.govMessagesEnabled = false;
                sendToTelegram(`🔕 <b>Уведомления от сотрудников правительства отключены для ${displayName}</b>`);
                sendWelcomeMessage();
            } else if (message === '/soob_on') {
                config.govMessagesEnabled = true;
                sendToTelegram(`🔔 <b>Уведомления от сотрудников правительства включены для ${displayName}</b>`);
                sendWelcomeMessage();
            } else if (message === '/mesto_on') {
                config.trackLocationRequests = true;
                sendToTelegram(`📍 <b>Отслеживание запросов местоположения включено для ${displayName}</b>`);
                sendWelcomeMessage();
            } else if (message === '/mesto_off') {
                config.trackLocationRequests = false;
                sendToTelegram(`🔕 <b>Отслеживание запросов местоположения отключено для ${displayName}</b>`);
                sendWelcomeMessage();
            } else if (message.startsWith(`/chat${config.userNumber} `)) {
                const textToSend = message.replace(`/chat${config.userNumber} `, '').trim();
                debugLog(`[${displayName}] Получено сообщение: ${textToSend}`);
                try {
                    sendChatInput(textToSend);
                    sendToTelegram(`✅ <b>Сообщение отправлено ${displayName}:</b>\n<code>${textToSend.replace(/</g, '<')}</code>`);
                } catch (err) {
                    const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось отправить сообщение\n<code>${err.message}</code>`;
                    debugLog(errorMsg);
                    sendToTelegram(errorMsg);
                }
            } else if (message.startsWith('/afk ')) {
                const parts = message.split(' ');
                if (parts.length >= 3) {
                    const targetNumber = parts[1];
                    const id = parts[2];

                    if (targetNumber === config.userNumber) {
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

                        sendToTelegram(`🔄 <b>AFK режим активирован для ${displayName}</b>\nID: ${id}\nФорматы: ${idFormats.join(', ')}`);
                    }
                }
            } else if (message.startsWith('/afk_n')) {
                const parts = message.split(' ');
                let targetNumber = config.userNumber;
                    
                if (parts.length >= 2 && parts[1]) {
                    targetNumber = parts[1];
                }

                if (targetNumber === config.userNumber) {
                    const hudId = getPlayerIdFromHUD();
                    if (!hudId) {
                        sendToTelegram(`❌ <b>Ошибка ${displayName}:</b> Не удалось получить ID из HUD`);
                        continue;
                    }

                    const idFormats = [hudId];
                    if (hudId.includes('-')) {
                        idFormats.push(hudId.replace(/-/g, ''));
                    } else if (id.length === 3) {
                        idFormats.push(`${hudId[0]}-${hudId[1]}-${hudId[2]}`);
                    }

                    config.afkSettings = {
                        id: hudId,
                        formats: idFormats,
                        active: true
                    };

                    // Запускаем AFK цикл для PayDay
                    startAFKCycle(false);

                    sendToTelegram(`🔄 <b>AFK режим активирован для ${displayName}</b>\nID из HUD: ${hudId}\nФорматы: ${idFormats.join(', ')}\n🔁 <b>Запущен AFK цикл для PayDay</b>`);
                }
            } else if (message.startsWith('/register ')) {
                const parts = message.split(' ');
                if (parts.length >= 3) {
                    const userNumber = parts[1];
                    const nickname = parts.slice(2).join(' ');
                    config.activeUsers[userNumber] = nickname;
                    debugLog(`[${displayName}] Зарегистрирован пользователь: ${userNumber} - ${nickname}`);
                }
            } else if (message === '/list') {
                sendWelcomeMessage();
            }
        } else if (update.callback_query) {
            const message = update.callback_query.data;
            const chatId = update.callback_query.message.chat.id;
            const messageId = update.callback_query.message.message_id;

            // Проверяем, является ли команда глобальной
            const isGlobalCommand = message.startsWith('global_');

            // Проверка, что callback относится к текущему боту, только для локальных команд
            const messageText = update.callback_query.message.text || '';
            const isForThisBot = isGlobalCommand || 
                                messageText.includes(`Номер: ${config.userNumber}`) || 
                                messageText.includes(displayName) ||
                                (update.callback_query.message.reply_to_message && 
                                    update.callback_query.message.reply_to_message.text && 
                                    update.callback_query.message.reply_to_message.text.includes(displayName));
                
            if (!isForThisBot) {
                debugLog(`Игнорируем callback_query, так как он не для этого бота (${displayName})`);
                continue;
            }

            if (message === "show_controls") {
                showControlsMenu(chatId, messageId);
            } else if (message === "show_global_functions") {
                showGlobalFunctionsMenu(chatId, messageId);
            } else if (message === "show_local_functions") {
                showLocalFunctionsMenu(chatId, messageId);
            } else if (message === "hide_controls") {
                hideControlsMenu(chatId, messageId);
            } else if (message === "request_chat_message") {
                const requestMsg = `✉️ Введите сообщение для ${displayName}:\n(Будет отправлено как /chat${config.userNumber} ваш_текст)`;
                sendToTelegram(requestMsg, false, {
                    force_reply: true
                });
            } else if (message === "global_p_on") {
                config.paydayNotifications = true;
                sendToTelegram(`🔔 <b>Уведомления о PayDay включены для ${displayName}</b>`);
                sendWelcomeMessage();
            } else if (message === "global_p_off") {
                config.paydayNotifications = false;
                sendToTelegram(`🔕 <b>Уведомления о PayDay отключены для ${displayName}</b>`);
                sendWelcomeMessage();
            } else if (message === "global_soob_on") {
                config.govMessagesEnabled = true;
                sendToTelegram(`🔔 <b>Уведомления от сотрудников правительства включены для ${displayName}</b>`);
                sendWelcomeMessage();
            } else if (message === "global_soob_off") {
                config.govMessagesEnabled = false;
                sendToTelegram(`🔕 <b>Уведомления от сотрудников правительства отключены для ${displayName}</b>`);
                sendWelcomeMessage();
            } else if (message === "global_mesto_on") {
                config.trackLocationRequests = true;
                sendToTelegram(`📍 <b>Отслеживание запросов местоположения включено для ${displayName}</b>`);
                sendWelcomeMessage();
            } else if (message === "global_mesto_off") {
                config.trackLocationRequests = false;
                sendToTelegram(`🔕 <b>Отслеживание запросов местоположения отключено для ${displayName}</b>`);
                sendWelcomeMessage();
            } else if (message === "global_afk_n") {
                if (!globalState.awaitingAfkNightMode) {
                    globalState.awaitingAfkNightMode = true;
                    showAfkNightModeMenu();
                }
            } else if (message === "global_afk_n_with_pauses") {
                if (globalState.awaitingAfkNightMode) {
                    globalState.awaitingAfkNightMode = false;
                    globalState.awaitingAfkNightPauseType = true;
                    showAfkNightPauseTypeMenu();
                }
            } else if (message === "global_afk_n_without_pauses") {
                if (globalState.awaitingAfkNightMode) {
                    const hudId = getPlayerIdFromHUD();
                    if (!hudId) {
                        sendToTelegram(`❌ <b>Ошибка ${displayName}:</b> Не удалось получить ID из HUD`);
                    } else {
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
                        config.afkCycle.withPauses = false;
                        config.afkCycle.randomIntervals = [];
                        config.afkCycle.useRandomIntervals = false;

                        globalState.awaitingAfkNightMode = false;
                        startAFKCycle();

                        sendToTelegram(`🔄 <b>AFK Ночь (без пауз) активирован для ${displayName}</b>\nID из HUD: ${hudId}\nФорматы: ${idFormats.join(', ')}\n🔁 <b>Игра остается активной без пауз</b>`);
                    }
                }
            } else if (message === "global_afk_n_pauses_fixed") {
                if (globalState.awaitingAfkNightPauseType) {
                    const hudId = getPlayerIdFromHUD();
                    if (!hudId) {
                        sendToTelegram(`❌ <b>Ошибка ${displayName}:</b> Не удалось получить ID из HUD`);
                    } else {
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
                        config.afkCycle.withPauses = true;
                        config.afkCycle.randomIntervals = [];
                        config.afkCycle.useRandomIntervals = false;

                        globalState.awaitingAfkNightPauseType = false;
                        startAFKCycle();

                        sendToTelegram(`🔄 <b>AFK Ночь (с паузами, 5/5 минут) активирован для ${displayName}</b>\nID из HUD: ${hudId}\nФорматы: ${idFormats.join(', ')}\n🔁 <b>Запущен AFK цикл для PayDay (5 мин игра/5 мин пауза)</b>`);
                    }
                }
            } else if (message === "global_afk_n_pauses_random") {
                if (globalState.awaitingAfkNightPauseType) {
                    const hudId = getPlayerIdFromHUD();
                    if (!hudId) {
                        sendToTelegram(`❌ <b>Ошибка ${displayName}:</b> Не удалось получить ID из HUD`);
                    } else {
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
                        config.afkCycle.withPauses = true;
                        config.afkCycle.randomIntervals = generateRandomIntervals();
                        config.afkCycle.useRandomIntervals = true;

                        globalState.awaitingAfkNightPauseType = false;
                        startAFKCycle();

                        sendToTelegram(`🔄 <b>AFK Ночь (с паузами, рандомное время) активирован для ${displayName}</b>\nID из HUD: ${hudId}\nФорматы: ${idFormats.join(', ')}\n🔁 <b>Запущен AFK цикл для PayDay (случайные интервалы)</b>`);
                    }
                }
            } else if (message === "global_afk") {
                if (!globalState.awaitingAfkAccount) {
                    globalState.awaitingAfkAccount = true;
                    const requestMsg = `✉️ Введите номер аккаунта для активации AFK режима:`;
                    sendToTelegram(requestMsg, false, {
                        force_reply: true
                    });
                }
            } else if (message.startsWith("admin_reply_")) {
                const accountNumber = message.replace("admin_reply_", "");
                if (accountNumber === config.userNumber) {
                    const requestMsg = `✉️ Введите ответ администратору для ${displayName}:`;
                    sendToTelegram(requestMsg, false, {
                        force_reply: true
                    });
                }
            } else if (message.startsWith("sit_command_")) {
                const accountNumber = message.replace("sit_command_", "");
                if (accountNumber === config.userNumber) {
                    try {
                        window.onScreenControlTouchStart("<Keyboard>/c");
                        setTimeout(() => window.onScreenControlTouchEnd("<Keyboard>/c"), 500);
                        sendToTelegram(`✅ <b>Команда "Сесть" отправлена ${displayName}</b>`);
                    } catch (err) {
                        const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось отправить команду "Сесть"\n<code>${err.message}</code>`;
                        debugLog(errorMsg);
                        sendToTelegram(errorMsg);
                    }
                }
            } else if (message.startsWith("jump_command_")) {
                const accountNumber = message.replace("jump_command_", "");
                if (accountNumber === config.userNumber) {
                    try {
                        window.onScreenControlTouchStart("<Keyboard>/leftShift");
                        setTimeout(() => window.onScreenControlTouchEnd("<Keyboard>/leftShift"), 500);
                        sendToTelegram(`✅ <b>Команда "Прыжок" отправлена ${displayName}</b>`);
                    } catch (err) {
                        const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось отправить команду "Прыжок"\n<code>${err.message}</code>`;
                        debugLog(errorMsg);
                        sendToTelegram(errorMsg);
                    }
                }
            } else if (message === "local_soob_off") {
                config.govMessagesEnabled = false;
                sendToTelegram(`🔕 <b>Уведомления от сотрудников правительства отключены для ${displayName}</b>`);
                sendWelcomeMessage();
            } else if (message === "local_soob_on") {
                config.govMessagesEnabled = true;
                sendToTelegram(`🔔 <b>Уведомления от сотрудников правительства включены для ${displayName}</b>`);
                sendWelcomeMessage();
            } else if (message === "local_mesto_on") {
                config.trackLocationRequests = true;
                sendToTelegram(`📍 <b>Отслеживание запросов местоположения включено для ${displayName}</b>`);
                sendWelcomeMessage();
            } else if (message === "local_mesto_off") {
                config.trackLocationRequests = false;
                sendToTelegram(`🔕 <b>Отслеживание запросов местоположения отключено для ${displayName}</b>`);
                sendWelcomeMessage();
            }
        }
    }
}

function registerUser() {
    config.activeUsers[config.userNumber] = config.accountInfo.nickname;
    debugLog(`Пользователь ${displayName} зарегистрирован локально`);
}

function isNonRPMessage(message) {
    return message.includes('((') && message.includes('))');
}

function checkIDFormats(message) {
    const idRegex = /(\d-\d-\d|\d{3})/g;
    const matches = message.match(idRegex);
    return matches ? matches : [];
}

function checkRoleAndActionConditions(lowerCaseMessage) {
    const hasRoleKeyword = (
        lowerCaseMessage.indexOf("депутат") !== -1 ||
        lowerCaseMessage.indexOf("вице-губернатор") !== -1 ||
        lowerCaseMessage.indexOf("губернатор") !== -1 ||
        lowerCaseMessage.indexOf("лицензёр") !== -1
    );

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

    const hasRoleKeyword = /(депутат|вице-губернатор|губернатор|лицензёр)/i.test(lowerCaseMessage);
    const hasActionKeyword = config.locationKeywords.some(word => lowerCaseMessage.includes(word));
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
    if (!config.paydayNotifications) return;

    const salaryMatch = msg.match(/Зарплата: \{[\w]+\}(\d+) руб/);
    if (salaryMatch) {
        config.lastSalaryInfo = config.lastSalaryInfo || {};
        config.lastSalaryInfo.salary = salaryMatch[1];
        debugLog(`Обнаружена зарплата: ${salaryMatch[1]} руб`);
    }

    const balanceMatch = msg.match(/Текущий баланс счета: \{[\w]+\}(\d+) руб/);
    if (balanceMatch) {
        config.lastSalaryInfo = config.lastSalaryInfo || {};
        config.lastSalaryInfo.balance = balanceMatch[1];
        debugLog(`Обнаружен баланс счета: ${balanceMatch[1]} руб`);
    }

    if (config.lastSalaryInfo && config.lastSalaryInfo.salary && config.lastSalaryInfo.balance) {
        const message = `+ PayDay | ${displayName}:\nЗарплата: ${config.lastSalaryInfo.salary} руб\nБаланс счета: ${config.lastSalaryInfo.balance} руб`;
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

// Функции для AFK цикла PayDay
function startAFKCycle() {
    config.afkCycle.active = true;
    config.afkCycle.startTime = Date.now();
    config.afkCycle.totalPlayTime = 0;
    config.afkCycle.currentCycleIndex = 0;
    
    // Выходим из паузы, если она была активна
    try {
        if (typeof closeInterface === 'function') {
            closeInterface("PauseMenu");
            debugLog(`Выход из паузы для ${displayName} при запуске AFK цикла`);
        }
    } catch (e) {
        debugLog(`Ошибка при выходе из паузы: ${e.message}`);
    }

    if (!config.afkCycle.withPauses) {
        debugLog(`AFK режим запущен для ${displayName} (без пауз)`);
        sendToTelegram(`🔄 <b>AFK режим запущен для ${displayName}</b>\nРежим: без пауз\nИгра остается активной`);
        return;
    }

    const cycleDescription = config.afkCycle.useRandomIntervals ? 
        'с паузами (случайные интервалы)' : 'с паузами (5 мин игра/5 мин пауза)';
    debugLog(`AFK цикл запущен для ${displayName} (${cycleDescription})`);
    sendToTelegram(`🔄 <b>AFK цикл запущен для ${displayName}</b>\nРежим: ${cycleDescription}\nОжидание PayDay сообщения "Текущее время:"`);

    // Запускаем игровой цикл
    startPlayPhase();
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
    
    config.afkCycle.active = false;
    config.afkCycle.randomIntervals = [];
    config.afkCycle.currentCycleIndex = 0;
    config.afkCycle.useRandomIntervals = false;
    debugLog(`AFK цикл остановлен для ${displayName}`);
    sendToTelegram(`⏹️ <b>AFK цикл остановлен для ${displayName}</b>`);

    // Выходим из паузы при остановке
    try {
        if (typeof closeInterface === 'function') {
            closeInterface("PauseMenu");
            debugLog(`Выход из паузы при остановке AFK цикла для ${displayName}`);
        }
    } catch (e) {
        debugLog(`Ошибка при выходе из паузы: ${e.message}`);
    }
}

function startPlayPhase() {
    if (!config.afkCycle.active || !config.afkCycle.withPauses) return;

    let playDuration;
    if (config.afkCycle.useRandomIntervals && config.afkCycle.randomIntervals.length > 0) {
        playDuration = config.afkCycle.randomIntervals[config.afkCycle.currentCycleIndex].play;
    } else {
        playDuration = 5 * 60 * 1000; // 5 минут для фиксированного режима
    }

    debugLog(`Начинаем игровую фазу (${playDuration / 60000} мин) для ${displayName}`);
    sendToTelegram(`▶️ Игровая фаза начата для ${displayName}\n${playDuration / 60000} минут игры`);
    
    // Выходим из паузы
    try {
        if (typeof closeInterface === 'function') {
            closeInterface("PauseMenu");
            debugLog(`Выход из паузы для ${displayName}`);
        }
    } catch (e) {
        debugLog(`Ошибка при выходе из паузы: ${e.message}`);
    }
    
    config.afkCycle.currentPlayTime = 0;
    
    // Запускаем таймер для игровой фазы
    config.afkCycle.playTimer = setTimeout(() => {
        config.afkCycle.totalPlayTime += playDuration;
        
        if (config.afkCycle.totalPlayTime < 25 * 60 * 1000) {
            // Еще не отыграли 25 минут, продолжаем цикл
            startPausePhase();
        } else {
            // Отыграли 25 минут, ставим на паузу до следующего PayDay
            debugLog(`Отыграно 25 минут, ставим на паузу до следующего PayDay для ${displayName}`);
            sendToTelegram(`💤 <b>Отыграно 25 минут для ${displayName}</b>\nСтавим на паузу до следующего PayDay`);
            
            // Входим в паузу после 25 минут игры
            try {
                if (typeof openInterface === 'function') {
                    openInterface("PauseMenu");
                    debugLog(`Вход в паузу после 25 минут игры для ${displayName}`);
                }
            } catch (e) {
                debugLog(`Ошибка при входе в паузу после 25 минут: ${e.message}`);
            }
        }
    }, playDuration);
}

function startPausePhase() {
    if (!config.afkCycle.active || !config.afkCycle.withPauses) return;

    let pauseDuration;
    if (config.afkCycle.useRandomIntervals && config.afkCycle.randomIntervals.length > 0) {
        pauseDuration = config.afkCycle.randomIntervals[config.afkCycle.currentCycleIndex].pause;
        config.afkCycle.currentCycleIndex++;
    } else {
        pauseDuration = 5 * 60 * 1000; // 5 минут для фиксированного режима
    }
    
    debugLog(`Начинаем фазу паузы (${pauseDuration / 60000} мин) для ${displayName}`);
    
    // Входим в паузу
    try {
        if (typeof openInterface === 'function') {
            openInterface("PauseMenu");
            debugLog(`Вход в паузу для ${displayName}`);
        }
    } catch (e) {
        debugLog(`Ошибка при входе в паузу: ${e.message}`);
    }
    
    config.afkCycle.currentPauseTime = 0;
    
    // Запускаем таймер для фазы паузы
    config.afkCycle.pauseTimer = setTimeout(() => {
        startPlayPhase();
    }, pauseDuration);
}

function handlePayDayTimeMessage() {
    if (!config.afkSettings.active || !config.afkCycle.withPauses) return;
    
    // Останавливаем предыдущие таймеры
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
    
    // Запускаем главный таймер на 59 минут 55 секунд
    const mainTimerDuration = 59 * 60 * 1000 + 55 * 1000; // 59 минут 55 секунд
    
    config.afkCycle.mainTimer = setTimeout(() => {
        // Выходим из паузы перед следующим PayDay
        try {
            if (typeof closeInterface === 'function') {
                closeInterface("PauseMenu");
                debugLog(`Выход из паузы перед следующим PayDay для ${displayName}`);
                sendToTelegram(`▶️ <b>Выход из паузы перед следующим PayDay для ${displayName}</b>`);
            }
        } catch (e) {
            debugLog(`Ошибка при выходе из паузы: ${e.message}`);
        }
        
        // Останавливаем цикл
        if (config.afkCycle.playTimer) clearTimeout(config.afkCycle.playTimer);
        if (config.afkCycle.pauseTimer) clearTimeout(config.afkCycle.pauseTimer);
        
        debugLog(`Готов к следующему PayDay для ${displayName}`);
        sendToTelegram(`⏰ <b>Готов к следующему PayDay для ${displayName}</b>\nОжидание сообщения "Текущее время:"`);
    }, mainTimerDuration);
    
    // Запускаем AFK цикл если он еще не активен
    if (!config.afkCycle.active) {
        startAFKCycle();
    }
    
    // Начинаем цикл
    config.afkCycle.startTime = Date.now();
    config.afkCycle.totalPlayTime = 0;
    config.afkCycle.currentCycleIndex = 0;
    
    // Генерируем новые интервалы для случайного режима
    if (config.afkCycle.useRandomIntervals) {
        config.afkCycle.randomIntervals = generateRandomIntervals();
    }
    
    debugLog(`Обнаружено сообщение "Текущее время:", начинаем AFK цикл для ${displayName}`);
    const cycleDescription = config.afkCycle.useRandomIntervals ? 
        'случайные интервалы' : '5 минут играем, 5 минут пауза';
    sendToTelegram(`⏰ <b>Обнаружен PayDay для ${displayName}</b>\nНачинаем AFK цикл: ${cycleDescription}\nГлавный таймер: 59 минут 55 секунд`);
    
    // Начинаем с игровой фазы
    startPlayPhase();
}

function initializeChatMonitor() {
    if (typeof sendChatInput === 'undefined') {
        const errorMsg = '❌ <b>Ошибка</b>\nsendChatInput не найден';
        debugLog(errorMsg);
        sendToTelegram(errorMsg);
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
    }

    // Добавляем глобальную функцию для обработки сообщений
    window.OnChatAddMessage = function(e, i, t) {
        const msg = String(e);
        const lowerCaseMessage = msg.toLowerCase();
        const currentTime = Date.now();

        // Проверяем сообщение о текущем времени только для режима с паузами
        if (msg.includes("Текущее время:") && config.afkSettings.active && config.afkCycle.withPauses) {
            handlePayDayTimeMessage();
        }

        // Проверка на респавн
        if (lowerCaseMessage.includes("зареспавнил вас")) {
            debugLog(`Обнаружен респавн для ${displayName}!`);
            const replyMarkup = {
                inline_keyboard: [
                    [
                        createButton("📝 Ответить", `admin_reply_${config.userNumber}`),
                        createButton("🪑 Сесть (C)", `sit_command_${config.userNumber}`),
                        createButton("🦘 Прыжок (Shift)", `jump_command_${config.userNumber}`)
                    ]
                ]
            };
            sendToTelegram(`🔄 <b>Вас зареспавнили! (${displayName})</b>\n<code>${msg.replace(/</g, '<')}</code>`, false, replyMarkup);
            window.playSound("https://raw.githubusercontent.com/ZaharQqqq/Sound/main/uved.mp3", false, 1.0);
        }

        // Проверка на кик анти-читом
        if (lowerCaseMessage.includes("вы были кикнуты по подозрению в читерстве")) {
            debugLog(`Обнаружен кик анти-читом для ${displayName}!`);
            const replyMarkup = {
                inline_keyboard: [
                    [
                        createButton("📝 Ответить", `admin_reply_${config.userNumber}`)
                    ]
                ]
            };
            sendToTelegram(`🚫 <b>Вас кикнул анти-чит! (${displayName})</b>\n<code>${msg.replace(/</g, '<')}</code>`, false, replyMarkup);
            window.playSound("https://raw.githubusercontent.com/ZaharQqqq/Sound/main/kick.mp3", false, 1.0);
        }

        const govMessageRegex = /^- (.+?) \{CCFF00}\(\{v:([^}]+)}\)\[(\d+)\]/;
        const govMatch = msg.match(govMessageRegex);
        if (govMatch) {
            const messageText = govMatch[1];
            const senderName = govMatch[2];
            const senderId = govMatch[3];
                
            debugLog(`Обнаружено сообщение от сотрудника правительства: ${senderName}[${senderId}] - ${messageText}`);
                
            if (checkGovMessageConditions(messageText, senderName, senderId)) {
                const replyMarkup = {
                    inline_keyboard: [
                        [
                            createButton("📝 Ответить", `admin_reply_${config.userNumber}`),
                            createButton("🪑 Сесть (C)", `sit_command_${config.userNumber}`),
                            createButton("🦘 Прыжок (Shift)", `jump_command_${config.userNumber}`)
                        ]
                    ]
                };
                sendToTelegram(`🏛️ <b>Сообщение от сотрудника правительства (${displayName}):</b>\n👤 ${senderName} [ID: ${senderId}]\n💬 ${messageText}`, false, replyMarkup);
            }
        }

        processSalaryAndBalance(msg);

        if (config.keywords.some(kw => lowerCaseMessage.includes(kw.toLowerCase()))) {
            debugLog('Найдено ключевое слово:', e);
            sendToTelegram(`🔔 <b>Обнаружено ключевое слово (${displayName}):</b>\n<code>${msg.replace(/</g, '<')}</code>`);

            setTimeout(() => {
                try {
                    debugLog('Отправка команды /c');
                    sendChatInput("/c");
                    debugLog('Команда /c отправлена');
                } catch (err) {
                    const errorMsg = `❌ <b>Ошибка</b>\nНе удалось отправить /c\n<code>${err.message}</code>`;
                    debugLog(errorMsg);
                    sendToTelegram(errorMsg);
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
                                createButton("📝 Ответить", `admin_reply_${config.userNumber}`),
                                createButton("🪑 Сесть (C)", `sit_command_${config.userNumber}`),
                                createButton("🦘 Прыжок (Shift)", `jump_command_${config.userNumber}`)
                            ]
                        ]
                    };
                    sendToTelegram(`🚨 <b>Обнаружен подброс! (${displayName})</b>\n<code>${msg.replace(/</g, '<')}</code>`, false, replyMarkup);
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
                            createButton("📝 Ответить администратору", `admin_reply_${config.userNumber}`),
                            createButton("🪑 Сесть (C)", `sit_command_${config.userNumber}`),
                            createButton("🦘 Прыжок (Shift)", `jump_command_${config.userNumber}`)
                        ]
                    ]
                };
                sendToTelegram(`🚨 <b>Обнаружен администратор! (${displayName})</b>\n<code>${msg.replace(/</g, '<')}</code>`, false, replyMarkup);
                window.playSound("https://raw.githubusercontent.com/ZaharQqqq/Sound/main/uved.mp3", false, 1.0);
            }
        }

        if (!isNonRPMessage(msg) && (
                (lowerCaseMessage.indexOf("депутат") !== -1 ||
                    lowerCaseMessage.indexOf("вице-губернатор") !== -1 ||
                    lowerCaseMessage.indexOf("губернатор") !== -1 ||
                    lowerCaseMessage.indexOf("лицензёр") !== -1) &&
                (lowerCaseMessage.indexOf("строй") !== -1 ||
                    lowerCaseMessage.indexOf("сбор") !== -1 ||
                    lowerCaseMessage.indexOf(" готовность") !== -1 ||
                    lowerCaseMessage.indexOf("конф") !== -1)
            )) {
            debugLog('Обнаружен сбор/строй!');
            sendToTelegram(`📢 <b>Обнаружен сбор/строй! (${displayName})</b>\n<code>${msg.replace(/</g, '<')}</code>`);
            window.playSound("https://raw.githubusercontent.com/ZaharQqqq/Sound/main/steroi.mp3", false, 1.0);

            setTimeout(() => {
                sendChatInput("/q");
                debugLog('Отправлена команда /q');
                sendToTelegram(`✅ <b>Отправлено /q (${displayName})</b>`);
            }, 30);
        }

        if (lowerCaseMessage.indexOf("администратор") !== -1 &&
            lowerCaseMessage.indexOf("кикнул") !== -1 &&
            msg.includes(config.accountInfo.nickname)) {
            debugLog(`Обнаружен кик ${displayName}!`);
            const replyMarkup = {
                inline_keyboard: [
                    [
                        createButton("📝 Ответить", `admin_reply_${config.userNumber}`),
                        createButton("🪑 Сесть (C)", `sit_command_${config.userNumber}`),
                        createButton("🦘 Прыжок (Shift)", `jump_command_${config.userNumber}`)
                    ]
                ]
            };
            sendToTelegram(`💢 <b>КИК АДМИНИСТРАТОРА! (${displayName})</b>\n<code>${msg.replace(/</g, '<')}</code>`, false, replyMarkup);
            window.playSound("https://raw.githubusercontent.com/ZaharQqqq/Sound/main/kick.mp3", false, 1.0);
        }

        if (!isNonRPMessage(msg) && checkLocationRequest(msg, lowerCaseMessage)) {
            debugLog('Обнаружен запрос местоположения!');
            const replyMarkup = {
                inline_keyboard: [
                    [
                        createButton("📝 Ответить", `admin_reply_${config.userNumber}`),
                        createButton("🪑 Сесть (C)", `sit_command_${config.userNumber}`),
                        createButton("🦘 Прыжок (Shift)", `jump_command_${config.userNumber}`)
                    ]
                ]
            };
            sendToTelegram(`📍 <b>Обнаружен запрос местоположения (${displayName}):</b>\n<code>${msg.replace(/</g, '<')}</code>`, false, replyMarkup);
        }

        if (!isNonRPMessage(msg) && checkAFKConditions(msg, lowerCaseMessage)) {
            debugLog('Обнаружено AFK условие!');
            sendChatInput("/q");
            sendToTelegram(`⚡ <b>Автоматически отправлено /q (${displayName})</b>\nПо AFK условию для ID: ${config.afkSettings.id}\n<code>${msg.replace(/</g, '<')}</code>`);
        }
    };

    debugLog('Мониторинг успешно активирован');

    if (!config.initialized) {
        sendWelcomeMessage();
        registerUser();
        config.initialized = true;
            
        if (config.trackPlayerId) {
            debugLog('Запуск отслеживания ID игрока через HUD...');
            trackPlayerId();
        }
    }

    checkTelegramCommands();
    return true;
}

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
            sendToTelegram(errorMsg);
        } else {
            debugLog(`Попытка инициализации #${attempts}`);
        }
    }, config.checkInterval);
}