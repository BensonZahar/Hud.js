// в случае index оставить это в hud.js 
if (tt?.methods?.add) {
	const originalAdd = tt.methods.add;
	tt.methods.add = function(e, s, t) {
		const result = originalAdd.call(this, e, s, t);
		window.OnChatAddMessage?.(e, s, t);
		return result;
	};
} 
// Глобальный объект для хранения состояния AFK-запроса и ID последнего приветственного сообщения
const globalState = {
	awaitingAfkAccount: false,
	awaitingAfkId: false,
	afkTargetAccount: null,
	lastWelcomeMessageId: null // Для хранения ID последнего приветственного сообщения
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
	// Удаляем префикс #, если есть
	if (normalized.startsWith('#')) {
		normalized = normalized.slice(1);
	}
	// Если цвет в формате RGBA (8 символов), убираем альфа-канал
	if (normalized.length === 8) {
		normalized = normalized.slice(0, 6);
	}
	// Добавляем префикс 0x
	return '0x' + normalized;
}

function getChatRadius(color) {
	const normalizedColor = normalizeColor(color);

	switch (normalizedColor) {
		case '0xEEEEEE':
			return CHAT_RADIUS.SELF;
		case '0xCECECE':
			return CHAT_RADIUS.CLOSE;
		case '0x999999':
			return CHAT_RADIUS.MEDIUM;
		case '0x6B6B6B':
			return CHAT_RADIUS.FAR;
		case '0x33CC66':
			return CHAT_RADIUS.RADIO;
		default:
			return CHAT_RADIUS.UNKNOWN;
	}
}

// КОНФИГУРАЦИЯ
const userConfig = {
	botToken: '8184449811:AAE-nssyxdjAGnCkNCKTMN8rc2xgWEaVOFA',
	chatIds: ['5515408606'], // 1046461621 - Zahar, 5515408606 = Kolya, 
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
	govMessageThreshold: 10,
	govMessageKeywords: ["тут", "здесь"],
	trackLocationRequests: false,
	locationKeywords: ["местоположение", "место", "позиция", "координаты"],
	radioOfficialNotifications: true,
	warningNotifications: true,
	notificationDeleteDelay: 5000 // Задержка для удаления уведомлений об изменении настроек
};

const config = {
	...userConfig,
	lastUpdateId: 0,
	activeUsers: {},
	lastPodbrosTime: 0,
	podbrosCounter: 0,
	initialized: false,
	accountInfo: {
		nickname: null,
		server: null
	},
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
		mode: 'fixed'
	},
	nicknameLogged: false
};

let displayName = `User [S${config.accountInfo.server || 'Не указан'}]`;
let uniqueId = `${config.accountInfo.nickname}_${config.accountInfo.server}`;

// Настройка автовхода
const autoLoginConfig = {
	password: "zahar2007", // Ваш пароль
	enabled: true, // Флаг активации автовхода
	maxAttempts: 10, // Максимум попыток
	attemptInterval: 1000 // Интервал между попытками (мс)
};

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

function trackPlayerId() {
	if (!config.trackPlayerId) return;

	const currentId = getPlayerIdFromHUD();

	if (currentId && currentId !== config.lastPlayerId) {
		debugLog(`Обнаружен новый ID (HUD): ${currentId}`);
		config.lastPlayerId = currentId;
	}

	setTimeout(trackPlayerId, config.idCheckInterval);
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
			displayName = `${config.accountInfo.nickname} [S${config.accountInfo.server}]`;
			uniqueId = `${config.accountInfo.nickname}_${config.accountInfo.server}`;
			sendWelcomeMessage();
			registerUser();
		} else if (!nickname || !serverId) {
			debugLog(`Ник или сервер не получены: nickname=${nickname}, server=${serverId}`);
		}
	} catch (e) {
		debugLog(`Ошибка при получении ника/сервера: ${e.message}`);
	}
	setTimeout(trackNicknameAndServer, 900);
}

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
				if (deleteAfter) {
					setTimeout(() => {
						deleteMessage(chatId, messageId);
					}, deleteAfter);
				}
				// Сохраняем ID приветственного сообщения
				if (message.includes('Hassle | Bot TG') && message.includes('Текущие настройки')) {
					globalState.lastWelcomeMessageId = messageId;
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

function showControlsMenu(chatId, messageId) {
	if (!config.accountInfo.nickname) {
		sendToTelegram(`❌ <b>Ошибка ${displayName}</b>\nНик не определен`, false, null, config.notificationDeleteDelay);
		return;
	}
	const replyMarkup = {
		inline_keyboard: [
			[createButton("⚙️ Функции", `show_local_functions_${uniqueId}`)],
			[createButton("📋 Общие функции", `show_global_functions_${uniqueId}`)],
			[createButton("⬆️ Свернуть", `hide_controls_${uniqueId}`)]
		]
	};

	editMessageReplyMarkup(chatId, messageId, replyMarkup);
}

function showGlobalFunctionsMenu(chatId, messageId, uniqueIdParam) {
	const replyMarkup = {
		inline_keyboard: [
			[createButton("🔔 PayDay", `show_payday_options_${uniqueIdParam}`)],
			[createButton("🏛️ Сообщ.", `show_soob_options_${uniqueIdParam}`)],
			[createButton("📍 Место", `show_mesto_options_${uniqueIdParam}`)],
			[createButton("📡 Рация", `show_radio_options_${uniqueIdParam}`)],
			[createButton("⚠️ Выговоры", `show_warning_options_${uniqueIdParam}`)],
			[
				createButton("🌙 AFK Ночь", `global_afk_n_${uniqueIdParam}`),
				createButton("🔄 AFK", `global_afk_${uniqueIdParam}`)
			],
			[createButton("⬅️ Назад", `show_controls_${uniqueIdParam}`)]
		]
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
			[createButton("⬅️ Назад", `show_global_functions_${uniqueIdParam}`)]
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
			[createButton("⬅️ Назад", `show_global_functions_${uniqueIdParam}`)]
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
			[createButton("⬅️ Назад", `show_global_functions_${uniqueIdParam}`)]
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
			[createButton("⬅️ Назад", `show_global_functions_${uniqueIdParam}`)]
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
			[createButton("⬅️ Назад", `show_global_functions_${uniqueIdParam}`)]
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
			[createButton("⬅️ Назад", `show_global_functions_${uniqueIdParam}`)]
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
			[createButton("⬅️ Назад", `global_afk_n_${uniqueIdParam}`)]
		]
	};

	editMessageReplyMarkup(chatId, messageId, replyMarkup);
}

function showLocalFunctionsMenu(chatId, messageId) {
	if (!config.accountInfo.nickname) {
		sendToTelegram(`❌ <b>Ошибка ${displayName}</b>\nНик не определен`, false, null, config.notificationDeleteDelay);
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
			[createButton("⬅️ Назад", `show_controls_${uniqueId}`)]
		]
	};

	editMessageReplyMarkup(chatId, messageId, replyMarkup);
}

function showMovementControlsMenu(chatId, messageId, isNotification = false) {
	if (!config.accountInfo.nickname) {
		sendToTelegram(`❌ <b>Ошибка ${displayName}</b>\nНик не определен`, false, null, config.notificationDeleteDelay);
		return;
	}
	const backButton = isNotification ? [] : [
		[createButton("⬆️ Свернуть", `show_local_functions_${uniqueId}`)]
	];
	const sitStandButton = config.isSitting ?
		createButton("🧍 Встать", `move_stand_${uniqueId}`) :
		createButton("🪑 Сесть", `move_sit_${uniqueId}`);
	const replyMarkup = {
		inline_keyboard: [
			[createButton("⬆️ Вперед", `move_forward_${uniqueId}`)],
			[createButton("⬅️ Влево", `move_left_${uniqueId}`), createButton("➡️ Вправо", `move_right_${uniqueId}`)],
			[createButton("⬇️ Назад", `move_back_${uniqueId}`)],
			[createButton("🆙 Прыжок", `move_jump_${uniqueId}`)],
			[sitStandButton],
			...backButton
		]
	};

	editMessageReplyMarkup(chatId, messageId, replyMarkup);
}

function showLocalSoobOptionsMenu(chatId, messageId) {
	if (!config.accountInfo.nickname) {
		sendToTelegram(`❌ <b>Ошибка ${displayName}</b>\nНик не определен`, false, null, config.notificationDeleteDelay);
		return;
	}
	const replyMarkup = {
		inline_keyboard: [
			[
				createButton("🔔 ВКЛ", `local_soob_on_${uniqueId}`),
				createButton("🔕 ВЫКЛ", `local_soob_off_${uniqueId}`)
			],
			[createButton("⬅️ Назад", `show_local_functions_${uniqueId}`)]
		]
	};

	editMessageReplyMarkup(chatId, messageId, replyMarkup);
}

function showLocalMestoOptionsMenu(chatId, messageId) {
	if (!config.accountInfo.nickname) {
		sendToTelegram(`❌ <b>Ошибка ${displayName}</b>\nНик не определен`, false, null, config.notificationDeleteDelay);
		return;
	}
	const replyMarkup = {
		inline_keyboard: [
			[
				createButton("🔔 ВКЛ", `local_mesto_on_${uniqueId}`),
				createButton("🔕 ВЫКЛ", `local_mesto_off_${uniqueId}`)
			],
			[createButton("⬅️ Назад", `show_local_functions_${uniqueId}`)]
		]
	};

	editMessageReplyMarkup(chatId, messageId, replyMarkup);
}

function showLocalRadioOptionsMenu(chatId, messageId) {
	if (!config.accountInfo.nickname) {
		sendToTelegram(`❌ <b>Ошибка ${displayName}</b>\nНик не определен`, false, null, config.notificationDeleteDelay);
		return;
	}
	const replyMarkup = {
		inline_keyboard: [
			[
				createButton("🔔 ВКЛ", `local_radio_on_${uniqueId}`),
				createButton("🔕 ВЫКЛ", `local_radio_off_${uniqueId}`)
			],
			[createButton("⬅️ Назад", `show_local_functions_${uniqueId}`)]
		]
	};

	editMessageReplyMarkup(chatId, messageId, replyMarkup);
}

function showLocalWarningOptionsMenu(chatId, messageId) {
	if (!config.accountInfo.nickname) {
		sendToTelegram(`❌ <b>Ошибка ${displayName}</b>\nНик не определен`, false, null, config.notificationDeleteDelay);
		return;
	}
	const replyMarkup = {
		inline_keyboard: [
			[
				createButton("🔔 ВКЛ", `local_warning_on_${uniqueId}`),
				createButton("🔕 ВЫКЛ", `local_warning_off_${uniqueId}`)
			],
			[createButton("⬅️ Назад", `show_local_functions_${uniqueId}`)]
		]
	};

	editMessageReplyMarkup(chatId, messageId, replyMarkup);
}

function hideControlsMenu(chatId, messageId) {
	if (!config.accountInfo.nickname) {
		sendToTelegram(`❌ <b>Ошибка ${displayName}</b>\nНик не определен`, false, null, config.notificationDeleteDelay);
		return;
	}
	const replyMarkup = {
		inline_keyboard: [
			[createButton("⚙️ Управление", `show_controls_${uniqueId}`)]
		]
	};

	editMessageReplyMarkup(chatId, messageId, replyMarkup);
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
							sendToTelegram(`✅ <b>Сообщение отправлено ${displayName}:</b>\n<code>${textToSend.replace(/</g, '&lt;')}</code>`, false, null, config.notificationDeleteDelay);
						} catch (err) {
							const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось отправить сообщение\n<code>${err.message}</code>`;
							debugLog(errorMsg);
							sendToTelegram(errorMsg, false, null, config.notificationDeleteDelay);
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
							sendToTelegram(`✅ <b>Ответ администратору отправлен ${displayName}:</b>\n<code>${textToSend.replace(/</g, '&lt;')}</code>`, false, null, config.notificationDeleteDelay);
						} catch (err) {
							const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось отправить ответ\n<code>${err.message}</code>`;
							debugLog(errorMsg);
							sendToTelegram(errorMsg, false, null, config.notificationDeleteDelay);
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
						}, config.notificationDeleteDelay);
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

						sendToTelegram(`🔄 <b>AFK режим активирован для ${displayName}</b>\nID: ${id}\nФорматы: ${idFormats.join(', ')}`, false, null, config.notificationDeleteDelay);
					}
					continue;
				}
			}

			// Глобальные команды (работают на все аккаунты)
			if (message === '/p_off') {
				config.paydayNotifications = false;
				sendToTelegram(`🔕 <b>Уведомления о PayDay отключены для ${displayName}</b>`, false, null, config.notificationDeleteDelay);
				sendWelcomeMessage();
			} else if (message === '/p_on') {
				config.paydayNotifications = true;
				sendToTelegram(`🔔 <b>Уведомления о PayDay включены для ${displayName}</b>`, false, null, config.notificationDeleteDelay);
				sendWelcomeMessage();
			} else if (message === '/soob_off') {
				config.govMessagesEnabled = false;
				sendToTelegram(`🔕 <b>Уведомления от сотрудников правительства отключены для ${displayName}</b>`, false, null, config.notificationDeleteDelay);
				sendWelcomeMessage();
			} else if (message === '/soob_on') {
				config.govMessagesEnabled = true;
				sendToTelegram(`🔔 <b>Уведомления от сотрудников правительства включены для ${displayName}</b>`, false, null, config.notificationDeleteDelay);
				sendWelcomeMessage();
			} else if (message === '/mesto_on') {
				config.trackLocationRequests = true;
				sendToTelegram(`📍 <b>Отслеживание запросов местоположения включено для ${displayName}</b>`, false, null, config.notificationDeleteDelay);
				sendWelcomeMessage();
			} else if (message === '/mesto_off') {
				config.trackLocationRequests = false;
				sendToTelegram(`🔕 <b>Отслеживание запросов местоположения отключено для ${displayName}</b>`, false, null, config.notificationDeleteDelay);
				sendWelcomeMessage();
			} else if (message.startsWith(`/chat${config.accountInfo.nickname}_${config.accountInfo.server} `)) {
				const textToSend = message.replace(`/chat${config.accountInfo.nickname}_${config.accountInfo.server} `, '').trim();
				debugLog(`[${displayName}] Получено сообщение: ${textToSend}`);
				try {
					sendChatInput(textToSend);
					sendToTelegram(`✅ <b>Сообщение отправлено ${displayName}:</b>\n<code>${textToSend.replace(/</g, '&lt;')}</code>`, false, null, config.notificationDeleteDelay);
				} catch (err) {
					const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось отправить сообщение\n<code>${err.message}</code>`;
					debugLog(errorMsg);
					sendToTelegram(errorMsg, false, null, config.notificationDeleteDelay);
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

						sendToTelegram(`🔄 <b>AFK режим активирован для ${displayName}</b>\nID: ${id}\nФорматы: ${idFormats.join(', ')}`, false, null, config.notificationDeleteDelay);
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
						sendToTelegram(`❌ <b>Ошибка ${displayName}:</b> Не удалось получить ID из HUD`, false, null, config.notificationDeleteDelay);
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

					sendToTelegram(`🔄 <b>AFK режим активирован для ${displayName}</b>\nID из HUD: ${hudId}\nФорматы: ${idFormats.join(', ')}\n🔁 <b>Запущен AFK цикл для PayDay</b>`, false, null, config.notificationDeleteDelay);
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

			// Определяем глобальные команды, которые должны применяться ко всем аккаунтам
			const isGlobalCommand = message.startsWith('global_') ||
				message.startsWith('afk_n_') ||
				message.startsWith('show_payday_options_') ||
				message.startsWith('show_soob_options_') ||
				message.startsWith('show_mesto_options_') ||
				message.startsWith('show_radio_options_') ||
				message.startsWith('show_warning_options_') ||
				message.startsWith('show_global_functions_');

			let callbackUniqueId = null;
			if (message.startsWith('show_controls_')) {
				callbackUniqueId = message.replace('show_controls_', '');
			} else if (message.startsWith('show_local_functions_')) {
				callbackUniqueId = message.replace('show_local_functions_', '');
			} else if (message.startsWith('show_movement_controls_')) {
				callbackUniqueId = message.replace('show_movement_controls_', '');
			} else if (message.startsWith('show_movement_')) {
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
				callbackUniqueId = message.replace('move_forward_', '');
			} else if (message.startsWith('move_back_')) {
				callbackUniqueId = message.replace('move_back_', '');
			} else if (message.startsWith('move_left_')) {
				callbackUniqueId = message.replace('move_left_', '');
			} else if (message.startsWith('move_right_')) {
				callbackUniqueId = message.replace('move_right_', '');
			} else if (message.startsWith('move_jump_')) {
				callbackUniqueId = message.replace('move_jump_', '');
			} else if (message.startsWith('move_sit_')) {
				callbackUniqueId = message.replace('move_sit_', '');
			} else if (message.startsWith('move_stand_')) {
				callbackUniqueId = message.replace('move_stand_', '');
			} else if (message.startsWith('admin_reply_')) {
				callbackUniqueId = message.replace('admin_reply_', '');
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
				sendToTelegram(`🔔 <b>Уведомления о PayDay включены для всех аккаунтов</b>`, false, null, config.notificationDeleteDelay);
				sendWelcomeMessage();
			} else if (message.startsWith(`global_p_off_`)) {
				config.paydayNotifications = false;
				sendToTelegram(`🔕 <b>Уведомления о PayDay отключены для всех аккаунтов</b>`, false, null, config.notificationDeleteDelay);
				sendWelcomeMessage();
			} else if (message.startsWith(`global_soob_on_`)) {
				config.govMessagesEnabled = true;
				sendToTelegram(`🔔 <b>Уведомления от сотрудников правительства включены для всех аккаунтов</b>`, false, null, config.notificationDeleteDelay);
				sendWelcomeMessage();
			} else if (message.startsWith(`global_soob_off_`)) {
				config.govMessagesEnabled = false;
				sendToTelegram(`🔕 <b>Уведомления от сотрудников правительства отключены для всех аккаунтов</b>`, false, null, config.notificationDeleteDelay);
				sendWelcomeMessage();
			} else if (message.startsWith(`global_mesto_on_`)) {
				config.trackLocationRequests = true;
				sendToTelegram(`📍 <b>Отслеживание запросов местоположения включено для всех аккаунтов</b>`, false, null, config.notificationDeleteDelay);
				sendWelcomeMessage();
			} else if (message.startsWith(`global_mesto_off_`)) {
				config.trackLocationRequests = false;
				sendToTelegram(`🔕 <b>Отслеживание запросов местоположения отключено для всех аккаунтов</b>`, false, null, config.notificationDeleteDelay);
				sendWelcomeMessage();
			} else if (message.startsWith(`global_radio_on_`)) {
				config.radioOfficialNotifications = true;
				sendToTelegram(`🔔 <b>Уведомления с Рации включены для всех аккаунтов</b>`, false, null, config.notificationDeleteDelay);
				sendWelcomeMessage();
			} else if (message.startsWith(`global_radio_off_`)) {
				config.radioOfficialNotifications = false;
				sendToTelegram(`🔕 <b>Уведомления с Рации отключены для всех аккаунтов</b>`, false, null, config.notificationDeleteDelay);
				sendWelcomeMessage();
			} else if (message.startsWith(`global_warning_on_`)) {
				config.warningNotifications = true;
				sendToTelegram(`🔔 <b>Уведомления о выговорах включены для всех аккаунтов</b>`, false, null, config.notificationDeleteDelay);
				sendWelcomeMessage();
			} else if (message.startsWith(`global_warning_off_`)) {
				config.warningNotifications = false;
				sendToTelegram(`🔕 <b>Уведомления о выговорах отключены для всех аккаунтов</b>`, false, null, config.notificationDeleteDelay);
				sendWelcomeMessage();
			} else if (message.startsWith(`global_afk_n_`)) {
				showAFKNightModesMenu(chatId, messageId, callbackUniqueId);
			} else if (message.startsWith(`afk_n_with_pauses_`)) {
				showAFKWithPausesSubMenu(chatId, messageId, callbackUniqueId);
			} else if (message.startsWith(`afk_n_without_pauses_`)) {
				if (config.afkSettings.active) {
					sendToTelegram(`🔄 <b>AFK режим уже активирован для ${displayName}</b>`, false, null, config.notificationDeleteDelay);
				} else {
					const hudId = getPlayerIdFromHUD();
					if (!hudId) {
						sendToTelegram(`❌ <b>Ошибка ${displayName}:</b> Не удалось получить ID из HUD`, false, null, config.notificationDeleteDelay);
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
						config.afkCycle.mode = 'none';

						sendToTelegram(`🔄 <b>AFK режим (без пауз) активирован для ${displayName}</b>\nID из HUD: ${hudId}\nФорматы: ${idFormats.join(', ')}`, false, null, config.notificationDeleteDelay);
					}
				}
			} else if (message.startsWith(`afk_n_fixed_`)) {
				if (config.afkSettings.active) {
					sendToTelegram(`🔄 <b>AFK режим уже активирован для ${displayName}</b>`, false, null, config.notificationDeleteDelay);
				} else {
					const hudId = getPlayerIdFromHUD();
					if (!hudId) {
						sendToTelegram(`❌ <b>Ошибка ${displayName}:</b> Не удалось получить ID из HUD`, false, null, config.notificationDeleteDelay);
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
						config.afkCycle.mode = 'fixed';
						startAFKCycle();

						sendToTelegram(`🔄 <b>AFK режим (с паузами 5/5) активирован для ${displayName}</b>\nID из HUD: ${hudId}\nФорматы: ${idFormats.join(', ')}\n🔁 <b>Запущен AFK цикл для PayDay</b>`, false, null, config.notificationDeleteDelay);
					}
				}
			} else if (message.startsWith(`afk_n_random_`)) {
				if (config.afkSettings.active) {
					sendToTelegram(`🔄 <b>AFK режим уже активирован для ${displayName}</b>`, false, null, config.notificationDeleteDelay);
				} else {
					const hudId = getPlayerIdFromHUD();
					if (!hudId) {
						sendToTelegram(`❌ <b>Ошибка ${displayName}:</b> Не удалось получить ID из HUD`, false, null, config.notificationDeleteDelay);
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
						config.afkCycle.mode = 'random';
						startAFKCycle();

						sendToTelegram(`🔄 <b>AFK режим (с рандомными паузами) активирован для ${displayName}</b>\nID из HUD: ${hudId}\nФорматы: ${idFormats.join(', ')}\n🔁 <b>Запущен AFK цикл для PayDay</b>`, false, null, config.notificationDeleteDelay);
					}
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
				const requestMsg = `✉️ Введите ответ администратору для ${displayName}:`;
				sendToTelegram(requestMsg, false, {
					force_reply: true
				});
			} else if (message.startsWith("move_forward_")) {
				try {
					window.onScreenControlTouchStart("<Gamepad>/leftStick");
					window.onScreenControlTouchMove("<Gamepad>/leftStick", 0, 1);
					setTimeout(() => {
						window.onScreenControlTouchEnd("<Gamepad>/leftStick");
					}, 500);
					sendToTelegram(`🚶 <b>Движение вперед на 0.5 сек для ${displayName}</b>`, false, null, config.notificationDeleteDelay);
				} catch (err) {
					const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось симулировать движение вперед\n<code>${err.message}</code>`;
					debugLog(errorMsg);
					sendToTelegram(errorMsg, false, null, config.notificationDeleteDelay);
				}
			} else if (message.startsWith("move_back_")) {
				try {
					window.onScreenControlTouchStart("<Gamepad>/leftStick");
					window.onScreenControlTouchMove("<Gamepad>/leftStick", 0, -1);
					setTimeout(() => {
						window.onScreenControlTouchEnd("<Gamepad>/leftStick");
					}, 500);
					sendToTelegram(`🚶 <b>Движение назад на 0.5 сек для ${displayName}</b>`, false, null, config.notificationDeleteDelay);
				} catch (err) {
					const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось симулировать движение назад\n<code>${err.message}</code>`;
					debugLog(errorMsg);
					sendToTelegram(errorMsg, false, null, config.notificationDeleteDelay);
				}
			} else if (message.startsWith("move_left_")) {
				try {
					window.onScreenControlTouchStart("<Gamepad>/leftStick");
					window.onScreenControlTouchMove("<Gamepad>/leftStick", -1, 0);
					setTimeout(() => {
						window.onScreenControlTouchEnd("<Gamepad>/leftStick");
					}, 500);
					sendToTelegram(`🚶 <b>Движение влево на 0.5 сек для ${displayName}</b>`, false, null, config.notificationDeleteDelay);
				} catch (err) {
					const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось симулировать движение влево\n<code>${err.message}</code>`;
					debugLog(errorMsg);
					sendToTelegram(errorMsg, false, null, config.notificationDeleteDelay);
				}
			} else if (message.startsWith("move_right_")) {
				try {
					window.onScreenControlTouchStart("<Gamepad>/leftStick");
					window.onScreenControlTouchMove("<Gamepad>/leftStick", 1, 0);
					setTimeout(() => {
						window.onScreenControlTouchEnd("<Gamepad>/leftStick");
					}, 500);
					sendToTelegram(`🚶 <b>Движение вправо на 0.5 сек для ${displayName}</b>`, false, null, config.notificationDeleteDelay);
				} catch (err) {
					const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось симулировать движение вправо\n<code>${err.message}</code>`;
					debugLog(errorMsg);
					sendToTelegram(errorMsg, false, null, config.notificationDeleteDelay);
				}
			} else if (message.startsWith("move_jump_")) {
				try {
					window.onScreenControlTouchStart("<Keyboard>/leftShift");
					setTimeout(() => {
						window.onScreenControlTouchEnd("<Keyboard>/leftShift");
					}, 500);
					sendToTelegram(`🆙 <b>Прыжок выполнен для ${displayName}</b>`, false, null, config.notificationDeleteDelay);
				} catch (err) {
					const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось симулировать прыжок\n<code>${err.message}</code>`;
					debugLog(errorMsg);
					sendToTelegram(errorMsg, false, null, config.notificationDeleteDelay);
				}
			} else if (message.startsWith("move_sit_")) {
				try {
					window.onScreenControlTouchStart("<Keyboard>/c");
					setTimeout(() => window.onScreenControlTouchEnd("<Keyboard>/c"), 500);
					config.isSitting = true;
					sendToTelegram(`✅ <b>Команда "Сесть" отправлена ${displayName}</b>`, false, null, config.notificationDeleteDelay);
					showMovementControlsMenu(chatId, messageId, false);
				} catch (err) {
					const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось отправить команду "Сесть"\n<code>${err.message}</code>`;
					debugLog(errorMsg);
					sendToTelegram(errorMsg, false, null, config.notificationDeleteDelay);
				}
			} else if (message.startsWith("move_stand_")) {
				try {
					window.onScreenControlTouchStart("<Keyboard>/c");
					setTimeout(() => window.onScreenControlTouchEnd("<Keyboard>/c"), 500);
					config.isSitting = false;
					sendToTelegram(`✅ <b>Команда "Встать" отправлена ${displayName}</b>`, false, null, config.notificationDeleteDelay);
					showMovementControlsMenu(chatId, messageId, false);
				} catch (err) {
					const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось отправить команду "Встать"\n<code>${err.message}</code>`;
					debugLog(errorMsg);
					sendToTelegram(errorMsg, false, null, config.notificationDeleteDelay);
				}
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
				sendToTelegram(`🔔 <b>Уведомления от сотрудников правительства включены для ${displayName}</b>`, false, null, config.notificationDeleteDelay);
				sendWelcomeMessage();
			} else if (message.startsWith("local_soob_off_")) {
				config.govMessagesEnabled = false;
				sendToTelegram(`🔕 <b>Уведомления от сотрудников правительства отключены для ${displayName}</b>`, false, null, config.notificationDeleteDelay);
				sendWelcomeMessage();
			} else if (message.startsWith("local_mesto_on_")) {
				config.trackLocationRequests = true;
				sendToTelegram(`📍 <b>Отслеживание запросов местоположения включено для ${displayName}</b>`, false, null, config.notificationDeleteDelay);
				sendWelcomeMessage();
			} else if (message.startsWith("local_mesto_off_")) {
				config.trackLocationRequests = false;
				sendToTelegram(`🔕 <b>Отслеживание запросов местоположения отключено для ${displayName}</b>`, false, null, config.notificationDeleteDelay);
				sendWelcomeMessage();
			} else if (message.startsWith("local_radio_on_")) {
				config.radioOfficialNotifications = true;
				sendToTelegram(`🔔 <b>Уведомления с Рации включены для ${displayName}</b>`, false, null, config.notificationDeleteDelay);
				sendWelcomeMessage();
			} else if (message.startsWith("local_radio_off_")) {
				config.radioOfficialNotifications = false;
				sendToTelegram(`🔕 <b>Уведомления с Рации отключены для ${displayName}</b>`, false, null, config.notificationDeleteDelay);
				sendWelcomeMessage();
			} else if (message.startsWith("local_warning_on_")) {
				config.warningNotifications = true;
				sendToTelegram(`🔔 <b>Уведомления о выговорах включены для ${displayName}</b>`, false, null, config.notificationDeleteDelay);
				sendWelcomeMessage();
			} else if (message.startsWith("local_warning_off_")) {
				config.warningNotifications = false;
				sendToTelegram(`🔕 <b>Уведомления о выговорах отключены для ${displayName}</b>`, false, null, config.notificationDeleteDelay);
				sendWelcomeMessage();
			}
		}
	}
}

function registerUser() {
	if (!config.accountInfo.nickname) {
		debugLog('Ник не определен, регистрация отложена');
		return;
	}
	config.activeUsers[config.accountInfo.nickname] = config.accountInfo.nickname;
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
	}

	const balanceMatch = msg.match(/Текущий баланс счета: \{[\w]+\}(\d+) руб/);
	if (balanceMatch) {
		debugLog(`Баланс спарсен: ${balanceMatch[1]}`);
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

function startAFKCycle() {
	config.afkCycle.active = true;
	config.afkCycle.startTime = Date.now();
	config.afkCycle.totalPlayTime = 0;

	debugLog(`AFK цикл запущен для ${displayName}`);
	sendToTelegram(`🔄 <b>AFK цикл запущен для ${displayName}</b>\nОжидание PayDay сообщения "Текущее время:"`, false, null, config.notificationDeleteDelay);
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
	debugLog(`AFK цикл остановлен для ${displayName}`);
	sendToTelegram(`⏹️ <b>AFK цикл остановлен для ${displayName}</b>`, false, null, config.notificationDeleteDelay);
}

function startPlayPhase() {
	if (!config.afkCycle.active) return;

	debugLog(`Начинаем игровую фазу для ${displayName}`);
	sendToTelegram(`▶️ Игровая фаза начата для ${displayName}`, false, null, config.notificationDeleteDelay);

	try {
		if (typeof closeInterface === 'function') {
			closeInterface("PauseMenu");
			debugLog(`Выход из паузы для ${displayName}`);
		}
	} catch (e) {
		debugLog(`Ошибка при выходе из паузы: ${e.message}`);
	}

	config.afkCycle.currentPlayTime = 0;

	let playDurationMs;
	if (config.afkCycle.mode === 'fixed') {
		playDurationMs = 5 * 60 * 1000;
	} else if (config.afkCycle.mode === 'random') {
		const minMin = 2;
		const maxMin = 8;
		const remainingPlay = 25 * 60 * 1000 - config.afkCycle.totalPlayTime;
		if (remainingPlay <= 0) {
			enterPauseUntilEnd();
			return;
		}
		const maxPossible = Math.min(maxMin * 60 * 1000, remainingPlay);
		const minPossible = Math.min(minMin * 60 * 1000, maxPossible);
		playDurationMs = Math.floor(Math.random() * (maxPossible - minPossible + 1) + minPossible);
	}

	debugLog(`Игровая фаза: ${playDurationMs / 60000} минут`);

	config.afkCycle.playTimer = setTimeout(() => {
		config.afkCycle.totalPlayTime += playDurationMs;

		if (config.afkCycle.totalPlayTime < 25 * 60 * 1000) {
			startPausePhase();
		} else {
			debugLog(`Отыграно 25 минут, ставим на паузу до следующего PayDay для ${displayName}`);
			sendToTelegram(`💤 <b>Отыграно 25 минут для ${displayName}</b>\nСтавим на паузу до следующего PayDay`, false, null, config.notificationDeleteDelay);
			enterPauseUntilEnd();
		}
	}, playDurationMs);
}

function startPausePhase() {
	if (!config.afkCycle.active) return;

	debugLog(`Начинаем фазу паузы для ${displayName}`);

	try {
		if (typeof openInterface === 'function') {
			openInterface("PauseMenu");
			debugLog(`Вход в паузу для ${displayName}`);
		}
	} catch (e) {
		debugLog(`Ошибка при входе в паузу: ${e.message}`);
	}

	config.afkCycle.currentPauseTime = 0;

	let pauseDurationMs;
	if (config.afkCycle.mode === 'fixed') {
		pauseDurationMs = 5 * 60 * 1000;
	} else if (config.afkCycle.mode === 'random') {
		const minMin = 2;
		const maxMin = 8;
		pauseDurationMs = Math.floor(Math.random() * ((maxMin - minMin) * 60 * 1000 + 1) + minMin * 60 * 1000);
	}

	debugLog(`Пауза: ${pauseDurationMs / 60000} минут`);

	config.afkCycle.pauseTimer = setTimeout(() => {
		startPlayPhase();
	}, pauseDurationMs);
}

function enterPauseUntilEnd() {
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
	if (!config.afkSettings.active || config.afkCycle.mode === 'none') {
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
				sendToTelegram(`▶️ <b>Выход из паузы перед следующим PayDay для ${displayName}</b>`, false, null, config.notificationDeleteDelay);
			}
		} catch (e) {
			debugLog(`Ошибка при выходе из паузы: ${e.message}`);
		}

		if (config.afkCycle.playTimer) clearTimeout(config.afkCycle.playTimer);
		if (config.afkCycle.pauseTimer) clearTimeout(config.afkCycle.pauseTimer);

		debugLog(`Готов к следующему PayDay для ${displayName}`);
		sendToTelegram(`⏰ <b>Готов к следующему PayDay для ${displayName}</b>\nОжидание сообщения "Текущее время:"`, false, null, config.notificationDeleteDelay);
	}, mainTimerDuration);

	if (!config.afkCycle.active) {
		startAFKCycle();
	}

	config.afkCycle.startTime = Date.now();
	config.afkCycle.totalPlayTime = 0;

	const modeText = config.afkCycle.mode === 'fixed' ? '5 мин играем, 5 мин пауза' : 'рандомное время игры/паузы';
	debugLog(`Обнаружено сообщение "Текущее время:", начинаем AFK цикл для ${displayName}`);
	sendToTelegram(`⏰ <b>Обнаружен PayDay для ${displayName}</b>\nНачинаем AFK цикл: ${modeText}\nГлавный таймер: 59 минут`, false, null, config.notificationDeleteDelay);

	startPlayPhase();
}

// Функция для автоматического ввода пароля
function setupAutoLogin(attempt = 1) {
	if (!autoLoginConfig.enabled) {
		debugLog('Автовход отключен');
		return;
	}

	if (attempt > autoLoginConfig.maxAttempts) {
		const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось выполнить автовход после ${autoLoginConfig.maxAttempts} попыток`;
		debugLog(errorMsg);
		sendToTelegram(errorMsg, false, null, config.notificationDeleteDelay);
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
				sendToTelegram(`✅ <b>Автовход выполнен для ${displayName}</b>`, false, null, config.notificationDeleteDelay);
			} catch (err) {
				const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось выполнить вход\n<code>${err.message}</code>`;
				debugLog(errorMsg);
				sendToTelegram(errorMsg, false, null, config.notificationDeleteDelay);
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
			sendToTelegram(`❌ <b>Ошибка ${displayName}</b>\nНе удалось открыть интерфейс Authorization\n<code>${err.message}</code>`, false, null, config.notificationDeleteDelay);
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
				sendToTelegram(errorMsg, false, null, config.notificationDeleteDelay);
			} else {
				debugLog(`Попытка ${attempts}: Ожидание открытия Authorization`);
			}
		}, autoLoginConfig.attemptInterval);
	}
}

// Перехват window.openInterface для автоматического входа
const originalOpenInterface = window.openInterface;
window.openInterface = function(interfaceName, params, additionalParams) {
	const result = originalOpenInterface.call(this, interfaceName, params, additionalParams);

	if (interfaceName === "Authorization") {
		debugLog(`[${displayName}] Открыт интерфейс Authorization, инициализация автовхода`);
		setTimeout(initializeAutoLogin, 500); // Задержка для инициализации компонента
	}

	return result;
};

function initializeChatMonitor() {
	if (typeof sendChatInput === 'undefined') {
		const errorMsg = '❌ <b>Ошибка</b>\nsendChatInput не найден';
		debugLog(errorMsg);
		sendToTelegram(errorMsg, false, null, config.notificationDeleteDelay);
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

	window.OnChatAddMessage = function(e, i, t) {
	// если что убрать
    debugLog(`Чат-сообщение: ${e} | Цвет: ${i} | Тип: ${t} | Пауза: ${window.getInterfaceStatus("PauseMenu")}`);
		const msg = String(e);
		const lowerCaseMessage = msg.toLowerCase();
		const currentTime = Date.now();
		const chatRadius = getChatRadius(i);

		// Для отладки, выводим сообщения в консоль
		// console.log(msg); // сооб в чат

        // Проверка сообщения "Текущее время:" для AFK
	    if (msg.includes("Текущее время:") && config.afkSettings.active) {
	        handlePayDayTimeMessage();
	    }
	
	    // Проверка сообщения о возобновлении работы сервера для AFK ночь
	    if (config.afkSettings.active && config.afkCycle.active && msg.includes("Сервер возобновит работу в течение минуты...")) {
	        debugLog('Обнаружено сообщение о возобновлении работы сервера!');
	        sendChatInput("/q");
	        sendToTelegram(`⚡ <b>Автоматически отправлено /q (${displayName})</b>\nПо условию AFK ночь: Сервер возобновит работу`, false, null, config.notificationDeleteDelay);
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
			sendToTelegram(`🔄 <b>Вас зареспавнили! (${displayName})</b>\n<code>${msg.replace(/</g, '&lt;')}</code>`, false, replyMarkup);
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
		}

		const govMessageRegex = /^- (.+?) \{CCFF00}\(\{v:([^}]+)}\)\[(\d+)\]/;
		const govMatch = msg.match(govMessageRegex);
		if (govMatch) {
			const messageText = govMatch[1];
			const senderName = govMatch[2];
			const senderId = govMatch[3];

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
					sendToTelegram(`🏛️ <b>Сообщение от сотрудника правительства (${displayName}):</b>\n👤 ${senderName} [ID: ${senderId}]\n💬 ${messageText}`, false, replyMarkup);
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
					const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось отправить /c\n<code>${err.message}</code>`;
					debugLog(errorMsg);
					sendToTelegram(errorMsg, false, null, config.notificationDeleteDelay);
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

		if (!isNonRPMessage(msg) && (
				(lowerCaseMessage.indexOf("депутат") !== -1 ||
					lowerCaseMessage.indexOf("вице-губернатор") !== -1 ||
					lowerCaseMessage.indexOf("губернатор") !== -1 ||
					lowerCaseMessage.indexOf("лицензёр") !== -1 ||
					lowerCaseMessage.indexOf("адвокат") !== -1) &&
				(lowerCaseMessage.indexOf("строй") !== -1 ||
					lowerCaseMessage.indexOf("сбор") !== -1 ||
					lowerCaseMessage.indexOf("готовность") !== -1 ||
					lowerCaseMessage.indexOf("конф") !== -1)
			) && (chatRadius === CHAT_RADIUS.RADIO)) {
			debugLog('Обнаружен сбор/строй!');
			sendToTelegram(`📢 <b>Обнаружен сбор/строй! (${displayName})</b>\n<code>${msg.replace(/</g, '&lt;')}</code>`);
			window.playSound("https://raw.githubusercontent.com/ZaharQqqq/Sound/main/steroi.mp3", false, 1.0);

			setTimeout(() => {
				sendChatInput("/q");
				debugLog('Отправлена команда /q');
				sendToTelegram(`✅ <b>Отправлено /q (${displayName})</b>`, false, null, config.notificationDeleteDelay);
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
			sendChatInput("/q");
			sendToTelegram(`⚡ <b>Автоматически отправлено /q (${displayName})</b>\nПо AFK условию для ID: ${config.afkSettings.id}\n<code>${msg.replace(/</g, '&lt;')}</code>`, false, null, config.notificationDeleteDelay);
		}

		// Проверка сообщений с рации
		if (chatRadius === CHAT_RADIUS.RADIO && config.radioOfficialNotifications &&
		    (lowerCaseMessage.includes('губернатор') || lowerCaseMessage.includes('вице-губернатор') ||
		     lowerCaseMessage.includes('депутат') || lowerCaseMessage.includes('адвокат') || lowerCaseMessage.includes('лицензёр')) &&
		    !isNonRPMessage(msg)) {  // Добавляем проверку на non-RP сообщения
		    debugLog('Обнаружено сообщение с рации!');
		    sendToTelegram(`📡 <b>Сообщение с рации (${displayName}):</b>\n<code>${msg.replace(/</g, '&lt;')}</code>`);
		}

		// Проверка выговоров
		const warningMatch = msg.match(/(?:Губернатор|Вице-Губернатор)\s+([^[]+)\[(\d+)\]\s+выдал\s+Вам\s+Выговор\s+(\d+)\s+из\s+3\.\s+Причина:\s+(.*)/i);
		if (warningMatch && config.warningNotifications) {
			debugLog('Обнаружен выговор!');
			sendToTelegram(`⚠️ <b>Получен выговор (${displayName}):</b>\n<code>${msg.replace(/</g, '&lt;')}</code>`);
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
			sendToTelegram(errorMsg, false, null, config.notificationDeleteDelay);
		} else {
			debugLog(`Попытка инициализации #${attempts}`);
		}
	}, config.checkInterval);
}
