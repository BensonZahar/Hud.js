// ==================== CORE SYSTEM ====================
// Система управления модулями
const ModuleSystem = {
    modules: {},
    hooks: {},
    
    register(name, module) {
        this.modules[name] = module;
        if (module.init) module.init();
        console.log(`[ModuleSystem] Модуль "${name}" загружен`);
    },
    
    unregister(name) {
        if (this.modules[name]?.destroy) {
            this.modules[name].destroy();
        }
        delete this.modules[name];
        console.log(`[ModuleSystem] Модуль "${name}" удален`);
    },
    
    get(name) {
        return this.modules[name];
    },
    
    addHook(hookName, callback) {
        if (!this.hooks[hookName]) this.hooks[hookName] = [];
        this.hooks[hookName].push(callback);
    },
    
    runHook(hookName, ...args) {
        if (!this.hooks[hookName]) return;
        this.hooks[hookName].forEach(cb => cb(...args));
    }
};

// ==================== CONFIG MODULE ====================
ModuleSystem.register('Config', {
    data: {
        SERVER_TOKENS: {
            '4': '8496708572:AAHpNdpNEAQs9ecdosZn3sCsQqJhWdLRn7U',
            '5': '7088892553:AAEQiujKWYXpH16m0L-KijpKXRT-i4UIoPE',
            '6': '7318283272:AAEpKje_GRsGwYJj1GROy9jovLayo--i4QY',
            '12': '7314669193:AAEMOdTUVpuKptq5x-Wf_uqoNtcYnMM12oU'
        },
        DEFAULT_TOKEN: '7318283272:AAEpKje_GRsGwYJj1GROy9jovLayo--i4QY',
        CHAT_IDS: ['1070726946', '6588963111', '6009415806'],
        PASSWORD: 'CHTGHJ',
        RECONNECT_ENABLED: true,
        
        accountInfo: { nickname: null, server: null, skinId: null },
        botToken: null,
        lastUpdateId: 0,
        debug: true,
        chatIds: ['1070726946', '6588963111', '6009415806']
    },
    
    get(key) {
        return this.data[key];
    },
    
    set(key, value) {
        this.data[key] = value;
    }
});

// ==================== UTILS MODULE ====================
ModuleSystem.register('Utils', {
    debugLog(message) {
        const config = ModuleSystem.get('Config');
        if (!config.get('debug')) return;
        const now = new Date();
        const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        const nickname = config.get('accountInfo').nickname || 'Unknown';
        console.log(`[${time}] [DEBUG][${nickname}]`, message);
    },
    
    getCurrentTimeString() {
        const now = new Date();
        return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    },
    
    normalizeToCyrillic(text) {
        const map = {
            'A': 'А', 'a': 'а', 'B': 'В', 'b': 'в', 'C': 'С', 'c': 'с',
            'E': 'Е', 'e': 'е', 'H': 'Н', 'h': 'н', 'K': 'К', 'k': 'к',
            'M': 'М', 'm': 'м', 'O': 'О', 'o': 'о', 'P': 'Р', 'p': 'р',
            'T': 'Т', 't': 'т', 'X': 'Х', 'x': 'х', 'Y': 'У', 'y': 'у', '3': 'З'
        };
        return text.split('').map(char => map[char] || char).join('');
    },
    
    showScreenNotification(title, text, color = "FFFF00", duration = 3000) {
        try {
            window.interface('ScreenNotification').add(
                `[0, "${title}", "${text.replace(/\n/g, '<br>')}", "${color}", ${duration}]`
            );
        } catch (err) {
            this.debugLog(`Ошибка ScreenNotification: ${err.message}`);
        }
    }
});

// ==================== TELEGRAM API MODULE ====================
ModuleSystem.register('TelegramAPI', {
    sendMessage(message, silent = false, replyMarkup = null) {
        const config = ModuleSystem.get('Config');
        const chatIds = config.get('chatIds');
        const botToken = config.get('botToken');
        
        if (!botToken) return;
        
        chatIds.forEach(chatId => {
            const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
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
                    ModuleSystem.runHook('telegram:message:sent', JSON.parse(xhr.responseText));
                }
            };
            xhr.send(JSON.stringify(payload));
        });
    },
    
    deleteMessage(chatId, messageId) {
        const config = ModuleSystem.get('Config');
        const botToken = config.get('botToken');
        
        const url = `https://api.telegram.org/bot${botToken}/deleteMessage`;
        const payload = { chat_id: chatId, message_id: messageId };
        
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(payload));
    },
    
    editMessageText(chatId, messageId, text, replyMarkup = null) {
        const config = ModuleSystem.get('Config');
        const botToken = config.get('botToken');
        
        const url = `https://api.telegram.org/bot${botToken}/editMessageText`;
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
    },
    
    editMessageReplyMarkup(chatId, messageId, replyMarkup) {
        const config = ModuleSystem.get('Config');
        const botToken = config.get('botToken');
        
        const url = `https://api.telegram.org/bot${botToken}/editMessageReplyMarkup`;
        const payload = {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: replyMarkup
        };
        
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(payload));
    },
    
    answerCallbackQuery(callbackQueryId) {
        const config = ModuleSystem.get('Config');
        const botToken = config.get('botToken');
        
        const url = `https://api.telegram.org/bot${botToken}/answerCallbackQuery`;
        const payload = { callback_query_id: callbackQueryId };
        
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(payload));
    },
    
    createButton(text, command) {
        return { text: text, callback_data: command };
    }
});

// ==================== AUTO LOGIN MODULE ====================
ModuleSystem.register('AutoLogin', {
    config: {
        enabled: true,
        maxAttempts: 10,
        attemptInterval: 1000
    },
    
    init() {
        this.hookOpenInterface();
        ModuleSystem.addHook('player:info:updated', () => this.onPlayerInfoUpdated());
    },
    
    hookOpenInterface() {
        const self = this;
        const original = window.openInterface;
        window.openInterface = function(interfaceName, params, additionalParams) {
            const result = original.call(this, interfaceName, params, additionalParams);
            if (interfaceName === "Authorization") {
                setTimeout(() => self.initialize(), 500);
            }
            return result;
        };
    },
    
    initialize() {
        if (!this.config.enabled) return;
        
        if (window.getInterfaceStatus("Authorization")) {
            this.setup();
        } else {
            this.openAuthorizationInterface();
        }
    },
    
    openAuthorizationInterface() {
        const config = ModuleSystem.get('Config');
        const nickname = config.get('accountInfo').nickname || "Pavel_Nabokov";
        
        const openParams = [
            "auth", nickname, "", "", "", "", "https://radmir.online/recovery-password",
            { autoLogin: { password: config.get('PASSWORD'), enabled: this.config.enabled } }
        ];
        
        try {
            window.openInterface("Authorization", JSON.stringify(openParams));
            this.waitForInterface();
        } catch (err) {
            ModuleSystem.get('Utils').debugLog(`Ошибка открытия Authorization: ${err.message}`);
        }
    },
    
    waitForInterface() {
        let attempts = 0;
        const checkInterval = setInterval(() => {
            attempts++;
            if (window.getInterfaceStatus("Authorization")) {
                clearInterval(checkInterval);
                setTimeout(() => this.setup(), 1000);
            } else if (attempts >= this.config.maxAttempts) {
                clearInterval(checkInterval);
            }
        }, this.config.attemptInterval);
    },
    
    setup(attempt = 1) {
        if (attempt > this.config.maxAttempts) return;
        
        if (!window.getInterfaceStatus("Authorization")) {
            setTimeout(() => this.setup(attempt + 1), this.config.attemptInterval);
            return;
        }
        
        const authInstance = window.interface("Authorization");
        if (!authInstance) {
            setTimeout(() => this.setup(attempt + 1), this.config.attemptInterval);
            return;
        }
        
        const loginInstance = authInstance.getInstance("auth");
        if (!loginInstance) {
            setTimeout(() => this.setup(attempt + 1), this.config.attemptInterval);
            return;
        }
        
        const config = ModuleSystem.get('Config');
        loginInstance.password.value = config.get('PASSWORD');
        
        setTimeout(() => {
            if (loginInstance.password.value === config.get('PASSWORD')) {
                try {
                    loginInstance.onClickEvent("play");
                    ModuleSystem.get('TelegramAPI').sendMessage(`✅ Автовход выполнен`, true);
                    
                    setTimeout(() => {
                        ModuleSystem.get('Utils').showScreenNotification(
                            "HASSLE", "Скрипт загружен.<br>Меню /hb или Телеграмм.", "FFFF00", 6000
                        );
                    }, 3000);
                } catch (err) {
                    setTimeout(() => this.setup(attempt + 1), this.config.attemptInterval);
                }
            }
        }, 100);
    },
    
    onPlayerInfoUpdated() {
        // Placeholder для реакции на обновление информации о игроке
    },
    
    destroy() {
        // Cleanup если нужно
    }
});

// ==================== PLAYER INFO MODULE ====================
ModuleSystem.register('PlayerInfo', {
    data: {
        lastPlayerId: null,
        displayName: 'User',
        uniqueId: null,
        nicknameLogged: false
    },
    
    init() {
        this.trackNicknameAndServer();
        this.hookSetPlayerSkinId();
    },
    
    trackNicknameAndServer() {
        try {
            const nickname = window.interface("Menu").$store.getters["menu/nickName"];
            const serverId = window.interface("Menu").$store.getters["menu/selectedServer"];
            
            if (nickname && serverId && !this.data.nicknameLogged) {
                const config = ModuleSystem.get('Config');
                config.set('accountInfo', {
                    ...config.get('accountInfo'),
                    nickname: nickname,
                    server: serverId.toString()
                });
                
                const serverTokens = config.get('SERVER_TOKENS');
                const defaultToken = config.get('DEFAULT_TOKEN');
                config.set('botToken', serverTokens[serverId.toString()] || defaultToken);
                
                this.data.nicknameLogged = true;
                this.updateDisplayName();
                
                ModuleSystem.runHook('player:info:updated');
                
                setTimeout(() => {
                    const initialSkin = this.getSkinIdFromStore();
                    if (initialSkin !== null) {
                        config.set('accountInfo', {
                            ...config.get('accountInfo'),
                            skinId: initialSkin
                        });
                    }
                }, 5000);
            }
        } catch (e) {
            ModuleSystem.get('Utils').debugLog(`Ошибка получения ника/сервера: ${e.message}`);
        }
        
        setTimeout(() => this.trackNicknameAndServer(), 900);
    },
    
    getSkinIdFromStore() {
        try {
            const menuInterface = window.interface("Menu");
            if (menuInterface?.$store?.getters["player/skinId"] !== undefined) {
                return menuInterface.$store.getters["player/skinId"];
            }
        } catch (e) {
            ModuleSystem.get('Utils').debugLog(`Ошибка получения Skin ID: ${e.message}`);
        }
        return null;
    },
    
    hookSetPlayerSkinId() {
        const self = this;
        const original = window.setPlayerSkinId;
        window.setPlayerSkinId = function(skinId) {
            const config = ModuleSystem.get('Config');
            config.set('accountInfo', {
                ...config.get('accountInfo'),
                skinId: skinId
            });
            ModuleSystem.runHook('player:skin:changed', skinId);
            if (original) return original.call(this, skinId);
        };
    },
    
    updateDisplayName() {
        const config = ModuleSystem.get('Config');
        const accountInfo = config.get('accountInfo');
        const idPart = this.data.lastPlayerId ? `[${this.data.lastPlayerId}]` : '';
        this.data.displayName = `${accountInfo.nickname || 'User'}${idPart} [S${accountInfo.server || 'Не указан'}]`;
        this.data.uniqueId = `${accountInfo.nickname}_${accountInfo.server}`;
    },
    
    getDisplayName() {
        return this.data.displayName;
    },
    
    getUniqueId() {
        return this.data.uniqueId;
    }
});

// ==================== FACTIONS MODULE ====================
ModuleSystem.register('Factions', {
    data: {
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
    },
    
    currentFaction: null,
    
    init() {
        ModuleSystem.addHook('player:skin:changed', (skinId) => this.updateFaction(skinId));
    },
    
    updateFaction(skinId) {
        const numSkinId = Number(skinId);
        if (!numSkinId) return;
        
        for (const faction in this.data) {
            if (this.data[faction].skins.includes(numSkinId)) {
                if (this.currentFaction !== faction) {
                    this.currentFaction = faction;
                    ModuleSystem.get('Utils').debugLog(`Фракция обновлена: ${faction}`);
                }
                return;
            }
        }
        
        this.currentFaction = null;
    },
    
    getCurrentFaction() {
        return this.currentFaction ? this.data[this.currentFaction] : null;
    },
    
    getCurrentFactionName() {
        return this.currentFaction;
    }
});

// ==================== CHAT MONITOR MODULE ====================
ModuleSystem.register('ChatMonitor', {
    CHAT_RADIUS: {
        SELF: 0,
        CLOSE: 1,
        MEDIUM: 2,
        FAR: 3,
        RADIO: 4,
        UNKNOWN: -1
    },
    
    init() {
        this.hookChatMessages();
        if (typeof window.playSound === 'undefined') {
            window.playSound = function(url, loop, volume) {
                const audio = new Audio(url);
                audio.loop = loop || false;
                audio.volume = volume || 1.0;
                audio.play().catch(e => console.log('Ошибка звука:', e));
            };
        }
    },
    
    hookChatMessages() {
        const self = this;
        window.OnChatAddMessage = function(message, color, type) {
            self.processMessage(message, color, type);
        };
    },
    
    normalizeColor(color) {
        let normalized = color.toString().toUpperCase();
        if (normalized.startsWith('#')) normalized = normalized.slice(1);
        if (normalized.length === 8) normalized = normalized.slice(0, 6);
        return '0x' + normalized;
    },
    
    getChatRadius(color) {
        const normalizedColor = this.normalizeColor(color);
        switch (normalizedColor) {
            case '0xEEEEEE': return this.CHAT_RADIUS.SELF;
            case '0xCECECE': return this.CHAT_RADIUS.CLOSE;
            case '0x999999': return this.CHAT_RADIUS.MEDIUM;
            case '0x6B6B6B': return this.CHAT_RADIUS.FAR;
            case '0x33CC66': return this.CHAT_RADIUS.RADIO;
            default: return this.CHAT_RADIUS.UNKNOWN;
        }
    },
    
    processMessage(msg, color, type) {
        const utils = ModuleSystem.get('Utils');
        const normalizedMsg = utils.normalizeToCyrillic(String(msg));
        const lowerCaseMessage = normalizedMsg.toLowerCase();
        const chatRadius = this.getChatRadius(color);
        
        // Вызываем хук для обработки сообщений другими модулями
        ModuleSystem.runHook('chat:message', {
            original: msg,
            normalized: normalizedMsg,
            lowercase: lowerCaseMessage,
            color: color,
            chatRadius: chatRadius,
            type: type
        });
    }
});

// ==================== PAYDAY MODULE ====================
ModuleSystem.register('PayDay', {
    data: {
        enabled: true,
        lastSalaryInfo: null,
        lastMessageIds: []
    },
    
    init() {
        ModuleSystem.addHook('chat:message', (data) => this.onChatMessage(data));
        ModuleSystem.addHook('telegram:menu:build', (items) => this.addMenuItems(items));
        ModuleSystem.addHook('telegram:command', (cmd, chatId, msgId) => this.handleCommand(cmd, chatId, msgId));
    },
    
    onChatMessage(data) {
        if (!this.data.enabled) return;
        
        const msg = data.original;
        
        // Проверка на предупреждения
        if (msg.includes("Для получения зарплаты необходимо находиться в игре минимум 25 минут")) {
            this.sendNotification("Для получения зарплаты необходимо находиться в игре минимум 25 минут");
            return;
        }
        
        if (msg.includes("Вы не должны находиться на паузе для получения зарплаты")) {
            this.sendNotification("Вы не должны находиться на паузе для получения зарплаты");
            return;
        }
        
        // Парсинг зарплаты
        const salaryMatch = msg.match(/Зарплата: \{[\w]+\}(\d+) руб/);
        if (salaryMatch) {
            this.data.lastSalaryInfo = this.data.lastSalaryInfo || {};
            this.data.lastSalaryInfo.salary = salaryMatch[1];
        }
        
        // Парсинг баланса
        const balanceMatch = msg.match(/Текущий баланс счета: \{[\w]+\}(\d+) руб/);
        if (balanceMatch) {
            this.data.lastSalaryInfo = this.data.lastSalaryInfo || {};
            this.data.lastSalaryInfo.balance = balanceMatch[1];
        }
        
        // Если есть оба значения - отправляем
        if (this.data.lastSalaryInfo?.salary && this.data.lastSalaryInfo?.balance) {
            const playerInfo = ModuleSystem.get('PlayerInfo');
            let message = `+ PayDay | ${playerInfo.getDisplayName()}:\nЗарплата: ${this.data.lastSalaryInfo.salary} руб\nБаланс счета: ${this.data.lastSalaryInfo.balance} руб`;
            
            ModuleSystem.get('TelegramAPI').sendMessage(message);
            this.data.lastSalaryInfo = null;
        }
    },
    
    sendNotification(text) {
        const playerInfo = ModuleSystem.get('PlayerInfo');
        ModuleSystem.get('TelegramAPI').sendMessage(`- PayDay | ${playerInfo.getDisplayName()}:\n${text}`);
    },
    
    addMenuItems(items) {
        const status = this.data.enabled ? '🟢 ВКЛ' : '🔴 ВЫКЛ';
        items.global.push({
            text: `🔔 PayDay ${status}`,
            command: 'payday_toggle'
        });
    },
    
    handleCommand(cmd, chatId, msgId) {
        if (cmd === 'payday_toggle') {
            this.data.enabled = !this.data.enabled;
            const status = this.data.enabled ? 'включены' : 'отключены';
            ModuleSystem.get('TelegramAPI').sendMessage(`${this.data.enabled ? '🔔' : '🔕'} <b>PayDay уведомления ${status}</b>`);
            return true;
        }
        return false;
    },
    
    destroy() {
        this.data.lastSalaryInfo = null;
        this.data.lastMessageIds = [];
    }
});

// ==================== ПРОДОЛЖЕНИЕ AFK NIGHT MODULE ====================
    
    handleServerRestart() {
        const playerInfo = ModuleSystem.get('PlayerInfo');
        const telegram = ModuleSystem.get('TelegramAPI');
        
        if (this.data.reconnectEnabled) {
            let message = `⚡ <b>Рестарт сервера (${playerInfo.getDisplayName()})</b>\n`;
            
            if (this.data.restartAction === 'rec') {
                ModuleSystem.get('AutoLogin').config.enabled = false;
                sendChatInput("/rec 5");
                message += "Действие: /rec 5 (автовход отключен)";
                
                setTimeout(() => {
                    ModuleSystem.get('AutoLogin').config.enabled = true;
                    sendChatInput("/rec 5");
                    telegram.sendMessage(`🔄 <b>Автовход включен, /rec 5 отправлен</b>`);
                }, 5 * 60 * 1000);
            } else {
                sendChatInput("/q");
                message += "Действие: /q";
            }
            
            telegram.sendMessage(message);
        } else {
            sendChatInput("/q");
            telegram.sendMessage(`⚡ <b>Рестарт: /q (${playerInfo.getDisplayName()})</b>`);
        }
    },
    
    startCycle() {
        this.data.active = true;
        this.data.startTime = Date.now();
        this.data.totalPlayTime = 0;
        this.data.playHistory = [];
        this.data.pauseHistory = [];
        this.data.statusMessageIds = [];
        this.data.totalSalary = 0;
        
        this.updateStatus(true);
    },
    
    stopCycle() {
        this.clearTimers();
        
        // Удаляем статус-сообщения
        this.data.statusMessageIds.forEach(({ chatId, messageId }) => {
            ModuleSystem.get('TelegramAPI').deleteMessage(chatId, messageId);
        });
        
        this.data.statusMessageIds = [];
        this.data.active = false;
        
        ModuleSystem.get('TelegramAPI').sendMessage(`⏹️ <b>AFK цикл остановлен</b>`);
    },
    
    clearTimers() {
        Object.values(this.data.timers).forEach(timer => clearTimeout(timer));
        this.data.timers = {};
    },
    
    startPlayPhase() {
        if (!this.data.active) return;
        
        const requiredPlayTime = (this.data.mode === 'levelup') ? 10 * 60 * 1000 : 25 * 60 * 1000;
        let playDurationMs;
        
        if (this.data.mode === 'fixed') {
            playDurationMs = 5 * 60 * 1000;
        } else if (this.data.mode === 'random') {
            const minMin = 2, maxMin = 8;
            const remainingPlay = requiredPlayTime - this.data.totalPlayTime;
            if (remainingPlay <= 0) {
                this.handleCycleEnd();
                return;
            }
            const maxPossible = Math.min(maxMin * 60 * 1000, remainingPlay);
            const minPossible = Math.min(minMin * 60 * 1000, maxPossible);
            playDurationMs = Math.floor(Math.random() * (maxPossible - minPossible + 1) + minPossible);
        } else {
            playDurationMs = requiredPlayTime - this.data.totalPlayTime;
            if (playDurationMs <= 0) {
                this.handleCycleEnd();
                return;
            }
        }
        
        const durationMin = Math.floor(playDurationMs / 60000);
        const utils = ModuleSystem.get('Utils');
        const currentTime = utils.getCurrentTimeString();
        
        this.data.playHistory.push(`▶️ Игра [${durationMin} мин] в ${currentTime}`);
        if (this.data.playHistory.length > 3) this.data.playHistory.shift();
        
        this.updateStatus();
        
        try {
            if (typeof closeInterface === 'function') {
                closeInterface("PauseMenu");
            }
        } catch (e) {}
        
        this.data.timers.play = setTimeout(() => {
            this.data.totalPlayTime += playDurationMs;
            if (this.data.totalPlayTime < requiredPlayTime && this.data.mode !== 'none' && this.data.mode !== 'levelup') {
                this.startPausePhase();
            } else {
                this.handleCycleEnd();
            }
        }, playDurationMs);
    },
    
    startPausePhase() {
        if (!this.data.active) return;
        
        let pauseDurationMs;
        if (this.data.mode === 'fixed') {
            pauseDurationMs = 5 * 60 * 1000;
        } else if (this.data.mode === 'random') {
            const minMin = 2, maxMin = 8;
            pauseDurationMs = Math.floor(Math.random() * ((maxMin - minMin) * 60 * 1000 + 1) + minMin * 60 * 1000);
        }
        
        const durationMin = Math.floor(pauseDurationMs / 60000);
        const utils = ModuleSystem.get('Utils');
        const currentTime = utils.getCurrentTimeString();
        
        this.data.pauseHistory.push(`💤 Пауза [${durationMin} мин] в ${currentTime}`);
        if (this.data.pauseHistory.length > 3) this.data.pauseHistory.shift();
        
        this.updateStatus();
        
        try {
            if (typeof openInterface === 'function') {
                openInterface("PauseMenu");
            }
        } catch (e) {}
        
        this.data.timers.pause = setTimeout(() => {
            this.startPlayPhase();
        }, pauseDurationMs);
    },
    
    handleCycleEnd() {
        if (this.data.mode === 'levelup') {
            this.handleLevelUpEnd();
        } else if (this.data.mode === 'none' && this.data.reconnectEnabled) {
            this.handleNoneReconnectEnd();
        } else {
            this.enterPauseUntilEnd();
        }
    },
    
    handleLevelUpEnd() {
        ModuleSystem.get('AutoLogin').config.enabled = false;
        sendChatInput("/rec 5");
        ModuleSystem.get('TelegramAPI').sendMessage(`🔄 <b>LevelUp: Автовход выкл, /rec 5</b>`);
        
        const timePassed = Date.now() - this.data.startTime;
        const timeToReconnect = 59 * 60 * 1000 - timePassed;
        
        if (timeToReconnect > 0) {
            setTimeout(() => {
                ModuleSystem.get('AutoLogin').config.enabled = true;
                sendChatInput("/rec 5");
                ModuleSystem.get('TelegramAPI').sendMessage(`🔄 <b>LevelUp: Автовход вкл, /rec 5</b>`);
            }, timeToReconnect);
        }
    },
    
    handleNoneReconnectEnd() {
        ModuleSystem.get('AutoLogin').config.enabled = false;
        sendChatInput("/rec 5");
        ModuleSystem.get('TelegramAPI').sendMessage(`🔄 <b>None: Автовход выкл, /rec 5</b>`);
        
        const timePassed = Date.now() - this.data.startTime;
        const timeToReconnect = 59 * 60 * 1000 - timePassed;
        
        if (timeToReconnect > 0) {
            setTimeout(() => {
                ModuleSystem.get('AutoLogin').config.enabled = true;
                sendChatInput("/rec 5");
                ModuleSystem.get('TelegramAPI').sendMessage(`🔄 <b>None: Автовход вкл, /rec 5</b>`);
            }, timeToReconnect);
        }
    },
    
    enterPauseUntilEnd() {
        const utils = ModuleSystem.get('Utils');
        const currentTime = utils.getCurrentTimeString();
        
        this.data.pauseHistory.push(`💤 Пауза до PayDay в ${currentTime}`);
        if (this.data.pauseHistory.length > 3) this.data.pauseHistory.shift();
        
        this.updateStatus();
        
        try {
            if (typeof openInterface === 'function') {
                openInterface("PauseMenu");
            }
        } catch (e) {}
    },
    
    updateStatus(isNew = false) {
        if (!this.data.active) return;
        
        const playerInfo = ModuleSystem.get('PlayerInfo');
        const config = ModuleSystem.get('Config');
        
        const modeText = this.data.mode === 'fixed' ? '5 мин играем, 5 мин пауза' :
            this.data.mode === 'random' ? 'рандомное время игры/паузы' :
            this.data.mode === 'levelup' ? 'прокачка уровня (10 мин игры без пауз)' : 'без пауз';
        
        let reconnectText = '';
        if (config.get('RECONNECT_ENABLED')) {
            reconnectText = `\nРеконнект: ${this.data.reconnectEnabled ? '🟢 ВКЛ' : '🔴 ВЫКЛ'}`;
        }
        
        let statusText = `🔄 <b>AFK цикл для ${playerInfo.getDisplayName()}</b>\n`;
        statusText += `Режим: ${modeText}${reconnectText}\n`;
        statusText += `Общее время: ${Math.floor(this.data.totalPlayTime / 60000)} мин\n\n`;
        statusText += '<b>Последние игровые фазы:</b>\n';
        this.data.playHistory.slice(-3).forEach((entry, index) => {
            statusText += `${index + 1}. ${entry}\n`;
        });
        statusText += '\n<b>Последние паузы:</b>\n';
        this.data.pauseHistory.slice(-3).forEach((entry, index) => {
            statusText += `${index + 1}. ${entry}\n`;
        });
        
        if (this.data.mode === 'none' || this.data.mode === 'levelup') {
            statusText += `\n<b>Накоплено:</b> ${this.data.totalSalary} руб`;
        }
        
        const telegram = ModuleSystem.get('TelegramAPI');
        
        if (isNew) {
            this.data.statusMessageIds = [];
            config.get('chatIds').forEach(chatId => {
                // Отправка через прямой XHR для получения message_id
                const url = `https://api.telegram.org/bot${config.get('botToken')}/sendMessage`;
                const payload = {
                    chat_id: chatId,
                    text: statusText,
                    parse_mode: 'HTML'
                };
                
                const xhr = new XMLHttpRequest();
                xhr.open('POST', url, true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.onload = function() {
                    if (xhr.status === 200) {
                        const data = JSON.parse(xhr.responseText);
                        const messageId = data.result.message_id;
                        ModuleSystem.get('AFKNight').data.statusMessageIds.push({ chatId, messageId });
                    }
                };
                xhr.send(JSON.stringify(payload));
            });
        } else {
            this.data.statusMessageIds.forEach(({ chatId, messageId }) => {
                telegram.editMessageText(chatId, messageId, statusText);
            });
        }
    },
    
    activate(mode, reconnect, restartAction) {
        if (this.settings.active) {
            ModuleSystem.get('TelegramAPI').sendMessage(`🔄 <b>AFK режим уже активирован</b>`);
            return;
        }
        
        // Получаем ID из HUD
        const hudId = this.getPlayerIdFromHUD();
        if (!hudId) {
            ModuleSystem.get('TelegramAPI').sendMessage(`❌ <b>Ошибка:</b> Не удалось получить ID из HUD`);
            return;
        }
        
        const idFormats = [hudId];
        if (hudId.includes('-')) {
            idFormats.push(hudId.replace(/-/g, ''));
        } else if (hudId.length === 3) {
            idFormats.push(`${hudId[0]}-${hudId[1]}-${hudId[2]}`);
        }
        
        this.settings = {
            id: hudId,
            formats: idFormats,
            active: true
        };
        
        this.data.mode = mode;
        this.data.reconnectEnabled = reconnect;
        this.data.restartAction = restartAction || 'q';
        
        this.startCycle();
        
        ModuleSystem.get('TelegramAPI').sendMessage(
            `🔄 <b>AFK режим активирован</b>\nID: ${hudId}\nФорматы: ${idFormats.join(', ')}`
        );
    },
    
    getPlayerIdFromHUD() {
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
        } catch (e) {}
        return null;
    },
    
    addMenuItems(items) {
        items.global.push({
            text: '🌙 AFK Ночь',
            command: 'afk_night_menu'
        });
        
        const config = ModuleSystem.get('Config');
        if (config.get('RECONNECT_ENABLED')) {
            items.global.push({
                text: '📈 Прокачка уровня',
                command: 'afk_levelup'
            });
        }
    },
    
    addHBMenuItems(items) {
        items.global.push({
            name: "{FFD700}> {FFFFFF}AFK Ночь",
            action: 'afk_night'
        });
        
        const config = ModuleSystem.get('Config');
        if (config.get('RECONNECT_ENABLED')) {
            items.global.push({
                name: "{FFD700}> {FFFFFF}Прокачка уровня",
                action: 'levelup'
            });
        }
    },
    
    handleCommand(cmd, chatId, msgId) {
        if (cmd === 'afk_night_menu') {
            // Показать подменю выбора режима
            return true;
        }
        
        if (cmd === 'afk_levelup') {
            // Показать меню для прокачки уровня
            return true;
        }
        
        if (cmd.startsWith('afk_activate_')) {
            const parts = cmd.split('_');
            const mode = parts[2];
            const reconnect = parts[3] === 'on';
            const restartAction = parts[4] || 'q';
            this.activate(mode, reconnect, restartAction);
            return true;
        }
        
        return false;
    },
    
    handleHBCommand(cmd) {
        if (cmd === 'afk_night') {
            // Показать HB меню для AFK ночь
            return true;
        }
        
        if (cmd === 'levelup') {
            // Показать HB меню для прокачки
            return true;
        }
        
        return false;
    },
    
    destroy() {
        this.stopCycle();
        this.settings = { id: null, formats: [], active: false };
    }
});

// ==================== TELEGRAM MENU MODULE ====================
ModuleSystem.register('TelegramMenu', {
    data: {
        lastWelcomeMessageId: null
    },
    
    init() {
        ModuleSystem.addHook('player:info:updated', () => this.sendWelcomeMessage());
        ModuleSystem.addHook('telegram:callback', (data) => this.handleCallback(data));
    },
    
    sendWelcomeMessage() {
        const playerInfo = ModuleSystem.get('PlayerInfo');
        const config = ModuleSystem.get('Config');
        const accountInfo = config.get('accountInfo');
        
        if (!accountInfo.nickname) return;
        
        const message = `🟢 <b>Hassle | Bot TG</b>\n` +
            `Ник: ${accountInfo.nickname}\n` +
            `Сервер: ${accountInfo.server || 'Не указан'}\n\n` +
            `🔔 <b>Текущие настройки:</b>\n` +
            this.getSettingsText();
        
        const telegram = ModuleSystem.get('TelegramAPI');
        const replyMarkup = {
            inline_keyboard: [
                [telegram.createButton("⚙️ Управление", `show_controls_${playerInfo.getUniqueId()}`)]
            ]
        };
        
        const chatIds = config.get('chatIds');
        chatIds.forEach(chatId => {
            if (this.data.lastWelcomeMessageId) {
                telegram.editMessageText(chatId, this.data.lastWelcomeMessageId, message, replyMarkup);
            } else {
                telegram.sendMessage(message, false, replyMarkup);
            }
        });
    },
    
    getSettingsText() {
        let text = '';
        
        // Собираем настройки из всех модулей
        const settingsItems = [];
        ModuleSystem.runHook('telegram:settings:collect', settingsItems);
        
        settingsItems.forEach(item => {
            text += `├ ${item.name}: ${item.value ? '🟢 ВКЛ' : '🔴 ВЫКЛ'}\n`;
        });
        
        return text.slice(0, -1); // Убираем последний \n
    },
    
    buildMenu(menuType) {
        const items = {
            local: [],
            global: []
        };
        
        ModuleSystem.runHook('telegram:menu:build', items);
        
        return items[menuType] || [];
    },
    
    handleCallback(data) {
        const { command, chatId, messageId, callbackQueryId } = data;
        
        const telegram = ModuleSystem.get('TelegramAPI');
        telegram.answerCallbackQuery(callbackQueryId);
        
        // Проверяем обработку командами модулей
        const handled = ModuleSystem.runHook('telegram:command', command, chatId, messageId);
        
        if (!handled.includes(true)) {
            // Обработка стандартных команд меню
            if (command.startsWith('show_controls_')) {
                this.showControlsMenu(chatId, messageId);
            }
        }
    },
    
    showControlsMenu(chatId, messageId) {
        const telegram = ModuleSystem.get('TelegramAPI');
        const playerInfo = ModuleSystem.get('PlayerInfo');
        
        const replyMarkup = {
            inline_keyboard: [
                [telegram.createButton("⚙️ Функции", `show_local_${playerInfo.getUniqueId()}`)],
                [telegram.createButton("📋 Общие функции", `show_global_${playerInfo.getUniqueId()}`)],
                [telegram.createButton("⬅️ Назад", `hide_controls_${playerInfo.getUniqueId()}`)]
            ]
        };
        
        telegram.editMessageReplyMarkup(chatId, messageId, replyMarkup);
    }
});

// ==================== HB MENU MODULE ====================
ModuleSystem.register('HBMenu', {
    DIALOG_IDS: {
        MAIN: 900,
        CONTROLS: 901,
        LOCAL: 902,
        GLOBAL: 903
    },
    
    currentMenu: null,
    currentPage: 0,
    
    init() {
        this.hookSendChatInput();
        this.hookSendClientEvent();
    },
    
    hookSendChatInput() {
        const self = this;
        const original = window.sendChatInput || function() {};
        
        window.sendChatInput = function(text) {
            if (text === "/hb") {
                self.showMainMenu();
                return;
            }
            original.call(this, text);
        };
    },
    
    hookSendClientEvent() {
        const self = this;
        const original = window.sendClientEvent || function() {};
        
        window.sendClientEvent = function(event, ...args) {
            if (args[0] === "OnDialogResponse") {
                const dialogId = args[1];
                if (dialogId >= 900 && dialogId <= 920) {
                    const button = args[2];
                    const listitem = args[3];
                    self.handleSelection(dialogId, button, listitem);
                    return;
                }
            }
            original.call(this, event, ...args);
        };
    },
    
    showMainMenu() {
        this.currentMenu = "main";
        const menuList = "{FFD700}> {FFFFFF}Управление<n>";
        
        window.addDialogInQueue(
            `[${this.DIALOG_IDS.MAIN},2,"{00BFFF}Hassle | Bot TG Menu","","Выбрать","Закрыть",0,0]`,
            menuList,
            0
        );
    },
    
    showControlsMenu() {
        this.currentMenu = "controls";
        
        let menuList = "{FFA500}< Назад<n>";
        menuList += "{FFD700}> {FFFFFF}Функции<n>";
        menuList += "{FFD700}> {FFFFFF}Общие функции<n>";
        
        const config = ModuleSystem.get('Config');
        if (config.get('RECONNECT_ENABLED')) {
            const status = config.get('autoReconnectEnabled') ? "{00FF00}[ВКЛ]" : "{FF0000}[ВЫКЛ]";
            menuList += `{FFFFFF}Реконнект ${status}<n>`;
        }
        
        window.addDialogInQueue(
            `[${this.DIALOG_IDS.CONTROLS},2,"{00BFFF}Управление","","Выбрать","Закрыть",0,0]`,
            menuList,
            0
        );
    },
    
    showLocalMenu() {
        this.currentMenu = "local";
        
        let menuList = "{FFA500}< Назад<n>";
        
        const items = [];
        ModuleSystem.runHook('hb:menu:build', { local: items, global: [] });
        
        items.forEach(item => {
            menuList += `${item.name}<n>`;
        });
        
        window.addDialogInQueue(
            `[${this.DIALOG_IDS.LOCAL},2,"{00BFFF}Функции","","Выбрать","Закрыть",0,0]`,
            menuList,
            0
        );
    },
    
    showGlobalMenu() {
        this.currentMenu = "global";
        
        let menuList = "{FFA500}< Назад<n>";
        
        const items = { local: [], global: [] };
        ModuleSystem.runHook('hb:menu:build', items);
        
        items.global.forEach(item => {
            menuList += `${item.name}<n>`;
        });
        
        window.addDialogInQueue(
            `[${this.DIALOG_IDS.GLOBAL},2,"{00BFFF}Общие функции","","Выбрать","Закрыть",0,0]`,
            menuList,
            0
        );
    },
    
    handleSelection(dialogId, button, listitem) {
        if (button !== 1) {
            this.currentMenu = null;
            return;
        }
        
        switch (dialogId) {
            case this.DIALOG_IDS.MAIN:
                if (listitem === 0) {
                    setTimeout(() => this.showControlsMenu(), 100);
                }
                break;
                
            case this.DIALOG_IDS.CONTROLS:
                if (listitem === 0) {
                    setTimeout(() => this.showMainMenu(), 100);
                } else if (listitem === 1) {
                    setTimeout(() => this.showLocalMenu(), 100);
                } else if (listitem === 2) {
                    setTimeout(() => this.showGlobalMenu(), 100);
                }
                break;
                
            case this.DIALOG_IDS.LOCAL:
            case this.DIALOG_IDS.GLOBAL:
                if (listitem === 0) {
                    setTimeout(() => this.showControlsMenu(), 100);
                } else {
                    // Передаем команду модулям
                    ModuleSystem.runHook('hb:command', `item_${listitem}`);
                }
                break;
        }
    }
});

// ==================== INITIALIZATION ====================
console.log('[Hassle Bot] Модульная система загружена');
console.log('[Hassle Bot] Активные модули:', Object.keys(ModuleSystem.modules));
console.log('[Hassle Bot] Для удаления модуля: ModuleSystem.unregister("ModuleName")');

// Пример удаления модуля:
// ModuleSystem.unregister('AFKNight'); // Полностью удалит AFK Night со всеми следами
