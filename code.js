// ==/BOT HASSLE

(function() {
    'use strict';

    // КОНФИГУРАЦИЯ
    const userConfig = {
        userNumber: "6",
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
        govMessageTrackers: {}
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

    function sendToTelegram(message, silent = false) {
        config.chatIds.forEach(chatId => {
            const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
            const payload = {
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML',
                disable_notification: silent
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
            setTimeout(checkTelegramCommands, 3000);
        };
        xhr.onerror = function(error) {
            debugLog('Ошибка при проверке команд:', error);
            setTimeout(checkTelegramCommands, 3000);
        };
        xhr.send();
    }

    function processUpdates(updates) {
        for (const update of updates) {
            config.lastUpdateId = update.update_id;

            if (update.message && update.message.text) {
                const message = update.message.text.trim();

                if (message.startsWith('/chat ')) {
                    const parts = message.split(' ');
                    if (parts.length >= 3) {
                        const targetNumber = parts[1];
                        const textToSend = parts.slice(2).join(' ').trim();

                        if (targetNumber === config.userNumber) {
                            debugLog(`Получено сообщение для ${displayName}: ${textToSend}`);
                            try {
                                sendChatInput(textToSend);
                                sendToTelegram(`✅ <b>Сообщение отправлено ${displayName}:</b>\n<code>${textToSend.replace(/</g, '<')}</code>`);
                            } catch (err) {
                                const errorMsg = `❌ <b>Ошибка</b>\nНе удалось отправить сообщение\n<code>${err.message}</code>`;
                                debugLog(errorMsg);
                                sendToTelegram(errorMsg);
                            }
                        }
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
                            sendToTelegram(`❌ <b>Ошибка:</b> Не удалось получить ID из HUD`);
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

                        sendToTelegram(`🔄 <b>AFK режим активирован для ${displayName}</b>\nID из HUD: ${hudId}\nФорматы: ${idFormats.join(', ')}`);
                    }
                } else if (message.startsWith('/register ')) {
                    const parts = message.split(' ');
                    if (parts.length >= 3) {
                        const userNumber = parts[1];
                        const nickname = parts.slice(2).join(' ');
                        config.activeUsers[userNumber] = nickname;
                        debugLog(`Зарегистрирован пользователь: ${userNumber} - ${nickname}`);
                    }
                } else if (message === '/list') {
                    let usersList = "📋 <b>Активный аккаунт:</b>\n";
                    if (Object.keys(config.activeUsers).length > 0) {
                        const userIdDisplay = config.lastPlayerId ? ` (ID: ${config.lastPlayerId})` : '';
                        usersList += `Ник: ${config.accountInfo.nickname}${userIdDisplay}\n`;
                        usersList += `Сервер: ${config.accountInfo.server}\n`;
                        usersList += `Номер: ${config.userNumber}\n`;
                        usersList += `Уведомления PayDay: ${config.paydayNotifications ? 'ВКЛ' : 'ВЫКЛ'}\n`;
                        usersList += `Уведомления от сотрудников: ${config.govMessagesEnabled ? 'ВКЛ' : 'ВЫКЛ'}\n`;
                        usersList += `Отслеживание местоположения: ${config.trackLocationRequests ? 'ВКЛ' : 'ВЫКЛ'}`;
                    } else {
                        usersList += "Нет зарегистрированных пользователей";
                    }
                    sendToTelegram(usersList);
                } else if (message === '/p_off') {
                    config.paydayNotifications = false;
                    sendToTelegram(`🔕 <b>Уведомления о PayDay отключены для ${displayName}</b>`);
                } else if (message === '/p_on') {
                    config.paydayNotifications = true;
                    sendToTelegram(`🔔 <b>Уведомления о PayDay включены для ${displayName}</b>`);
                } else if (message === '/soob_off') {
                    config.govMessagesEnabled = false;
                    sendToTelegram(`🔕 <b>Уведомления от сотрудников правительства отключены для ${displayName}</b>`);
                } else if (message === '/soob_on') {
                    config.govMessagesEnabled = true;
                    sendToTelegram(`🔔 <b>Уведомления от сотрудников правительства включены для ${displayName}</b>`);
                } else if (message === '/mesto_on') {
                    config.trackLocationRequests = true;
                    sendToTelegram(`📍 <b>Отслеживание запросов местоположения включено для ${displayName}</b>`);
                } else if (message === '/mesto_off') {
                    config.trackLocationRequests = false;
                    sendToTelegram(`🔕 <b>Отслеживание запросов местоположения отключено для ${displayName}</b>`);
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

    function initializeChatMonitor() {
        if (typeof tt === 'undefined' || typeof tt.methods === 'undefined' || typeof tt.methods.add !== 'function') {
            debugLog('tt.methods.add еще не доступен');
            return false;
        }

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

        const originalAdd = tt.methods.add;

        tt.methods.add = function(e, i, t) {
            originalAdd.call(this, e, i, t);

            const msg = String(e);
            const lowerCaseMessage = msg.toLowerCase();
            const currentTime = Date.now();

            const govMessageRegex = /^- (.+?) \{CCFF00}\(\{v:([^}]+)}\)\[(\d+)\]/;
            const govMatch = msg.match(govMessageRegex);
            if (govMatch) {
                const messageText = govMatch[1];
                const senderName = govMatch[2];
                const senderId = govMatch[3];
                
                debugLog(`Обнаружено сообщение от сотрудника правительства: ${senderName}[${senderId}] - ${messageText}`);
                
                if (checkGovMessageConditions(messageText, senderName, senderId)) {
                    sendToTelegram(`🏛️ <b>Сообщение от сотрудника правительства (${displayName}):</b>\n👤 ${senderName} [ID: ${senderId}]\n💬 ${messageText}`);
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
                        sendToTelegram(`🚨 <b>Обнаружен подброс! (${displayName})</b>\n<code>${msg.replace(/</g, '<')}</code>`);
                        window.playSound("https://raw.githubusercontent.com/ZaharQqqq/Sound/main/uved.mp3", false, 1.0);
                    }

                    if (currentTime - config.lastPodbrosTime > config.podbrosCooldown) {
                        config.podbrosCounter = 0;
                    }
                    config.lastPodbrosTime = currentTime;
                } else {
                    debugLog('Обнаружен администратор!');
                    sendToTelegram(`🚨 <b>Обнаружен администратор! (${displayName})</b>\n<code>${msg.replace(/</g, '<')}</code>`);
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
                        lowerCaseMessage.indexOf("готовность") !== -1 ||
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
                sendToTelegram(`💢 <b>КИК АДМИНИСТРАТОРА! (${displayName})</b>\n<code>${msg.replace(/</g, '<')}</code>`);
                window.playSound("https://raw.githubusercontent.com/ZaharQqqq/Sound/main/kick.mp3", false, 1.0);
            }

            if (!isNonRPMessage(msg) && checkLocationRequest(msg, lowerCaseMessage)) {
                debugLog('Обнаружен запрос местоположения!');
                sendToTelegram(`📍 <b>Обнаружен запрос местоположения (${displayName}):</b>\n<code>${msg.replace(/</g, '<')}</code>`);
            }

            if (!isNonRPMessage(msg) && checkAFKConditions(msg, lowerCaseMessage)) {
                debugLog('Обнаружено AFK условие!');
                sendChatInput("/q");
                sendToTelegram(`⚡ <b>Автоматически отправлено /q (${displayName})</b>\nПо AFK условию для ID: ${config.afkSettings.id}\n<code>${msg.replace(/</g, '<')}</code>`);
            }
        };

        debugLog('Мониторинг успешно активирован');

        if (!config.initialized) {
            const playerIdDisplay = config.lastPlayerId ? ` (ID: ${config.lastPlayerId})` : '';
            const welcomeMessage = `🟢 <b>RP-Chat Monitor</b>\n` +
                `Ник: ${config.accountInfo.nickname}${playerIdDisplay}\n` +
                `Сервер: ${config.accountInfo.server}\n` +
                `Номер: ${config.userNumber}\n` +
                `Уведомления PayDay: ${config.paydayNotifications ? 'ВКЛ' : 'ВЫКЛ'}\n` +
                `Уведомления от сотрудников: ${config.govMessagesEnabled ? 'ВКЛ' : 'ВЫКЛ'}\n` +
                `Отслеживание местоположения: ${config.trackLocationRequests ? 'ВКЛ' : 'ВЫКЛ'}`;
            sendToTelegram(welcomeMessage);
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
})();