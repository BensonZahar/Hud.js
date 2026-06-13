// MVD AHK VERSION: 2.3 (NAPARNICK)
console.log("=== MVD AK v2. ЗАГРУЖЕН (SWAP: хоткей из LoadAhk/установщика) ===");
// 1. СНАЧАЛА объявляем все константы и массивы
const rankTags = {
    "Рядовой": "[Р]",
    "Сержант": "[С]",
    "Старшина": "[СТ]",
    "Прапорщик": "[ПР]",
    "Лейтенант": "[Л]",
    "Капитан": "[К]",
    "Майор": "[М]",
    "Подполковник": "[ПП]",
    "Командир ДПС": "[Ком.ДПС]",
    "Командир ППС": "[Ком.ППС]",
    "Командир ОМОН": "[Ком.ОМОН]",
    "Заместитель командира ОМОН": "[Зам.Ком.ОМОН]",
    "Командир мотобатальона": "[Ком.МБ]",
    "Полковник": "[П]",
    "Генерал": "[Г]"
};
const mvdSkins = [15321, 15323, 15325, 15330, 15332, 15334, 15335, 190, 148, 15340, 15341, 15342, 15343, 15344, 15348, 15351];
const stroyRanks = ["Капитан", "Майор", "Подполковник", "Полковник", "Генерал"];
let skinId = null;
// 3. Функция получения скина
function getSkinIdFromStore() {
    try {
        const menuInterface = window.interface("Menu");
        if (menuInterface && menuInterface.$store && menuInterface.$store.getters["player/skinId"] !== undefined) {
            return menuInterface.$store.getters["player/skinId"];
        }
        return null;
    } catch (e) {
        console.log(`Ошибка при получении Skin ID: ${e.message}`);
        return null;
    }
}
// 4. Функция отслеживания скина (ИСПРАВЛЕНА)
function trackSkinId() {
    const currentSkin = getSkinIdFromStore();
    if (currentSkin !== null && currentSkin !== skinId) {
        // ВАЖНО: Приводим к числу сразу!
        skinId = Number(currentSkin);
    
        console.log(`🔍 Новый Skin ID обнаружен: ${skinId}`);
    
        // Проверяем, является ли скин МВД
        if (mvdSkins.includes(skinId)) {
            console.log(`✅ Скин ${skinId} - это МВД скин!`);
        } else {
            console.log(`❌ Скин ${skinId} НЕ входит в список МВД`);
        }
    }
    setTimeout(trackSkinId, 5000);
}
// 5. ЗАПУСК после загрузки
setTimeout(() => {
    console.log('🚀 Запуск отслеживания скина МВД...');
    const initialSkin = getSkinIdFromStore();
    if (initialSkin !== null) {
        // Приводим к числу сразу
        skinId = Number(initialSkin);
        console.log(`📌 Начальный Skin ID: ${skinId}`);
    
        if (mvdSkins.includes(skinId)) {
            console.log(`✅ Скин ${skinId} в списке МВД - меню /dahk доступно`);
        } else {
            console.log(`⚠️ Скин ${skinId} не является МВД скином`);
        }
    } else {
        console.log('❌ Не удалось получить начальный Skin ID');
    }
    trackSkinId();
}, 500);
// Список действий «Повседневная» — используется только для прямых
// хоткеев (MENU_BINDS) и для проверки needsId. Отображение пунктов
// в интерфейсе целиком на стороне LawsHelper (DAHK_POVSEDNEV).
const povsednevOptions = [
    { name: "Приветствие", action: "greeting", needsId: true },
    { name: "Проверка документов", action: "checkDocuments" },
    { name: "Изучение документов", action: "studyDocuments" },
    { name: "Сканирование", action: "scanningTablet" },
    { name: "Надевание наручников", action: "cuffing", needsId: true },
    { name: "Посадка в машину", action: "putInCar", needsId: true },
    { name: "Доставка в участок", action: "arrest", needsId: true },
    { name: "Снятие наручников", action: "uncuffing", needsId: true },
    { name: "Преследование преступника", action: "chase", needsId: true },
    { name: "Обыск", action: "search", needsId: true },
    { name: "Конвоирование", action: "escort", needsId: true },
    { name: "Снятие розыска", action: "clearWanted", needsId: true },
    { name: "Выдача штрафа [/ticket]", action: "fine" },
    { name: "Выдача розыска [/su]", action: "wantedFine" },
    { name: "Изъятие веществ", action: "confiscate", needsId: true },
    { name: "Разбитие стекла", action: "breakGlass", needsId: true },
    { name: "Снятие маски", action: "removeMask" },
    { name: "Сканирование отпечатков", action: "fingerprint" },
    { name: "Изъятие прав", action: "takeLicense", needsId: true },
    { name: "Права Миранды", action: "miranda" }
];
let autoGrabEnabled = true;
// ==================== БЛОКИРОВКА СООБЩЕНИЯ "* Игрок слишком далеко" ====================
const messageFilters = [
    "* Игрок слишком далеко"
];
function shouldBlockMessage(message) {
    if (typeof message !== 'string') return false;
    const lowerMsg = message.toLowerCase();
    for (const filter of messageFilters) {
        if (lowerMsg.includes(filter.toLowerCase())) {
            console.log(`[FILTER] Заблокировано: "${filter}"`);
            return true;
        }
    }
    return false;
}
let giveLicenseTo = -1;
let targetId = null;
let scanInterval = null;
let setmarkInterval = null;
let pgInterval = null;
let idPgInterval = null;
let trackingNotificationOpen = false;
let chaseNotificationOpen = false;
let trackingNickname = null;
let currentScanId = null;
let autoCuffEnabled = false;
let lastWantedCode = null; // последняя статья УК для авто-подстановки в серверный диалог
let _autoWantedActive = false; // флаг: /su отправлен через меню авторозыска — только тогда авто-причина работает
// Публичный API для LawsHelper — устанавливает причину и активирует авто-розыск
window._mvdSetLastWantedCode = function(code) {
    lastWantedCode = code;
    _autoWantedActive = true;
    // Страховочный сброс — если сервер не открыл диалог за 5 секунд
    setTimeout(function() { _autoWantedActive = false; }, 5000);
    console.log('[AUTO-РОЗЫСК] lastWantedCode="' + code + '", _autoWantedActive=true (через LawsHelper)');
};
// ==================== НАПАРНИК ====================
let partnerNick = null;            // Ник напарника (из ответа /id)
let partnerId = null;              // ID напарника
let partnerTrackingEnabled = false; // "Следить за напарником" включено
let partnerMessageEnabled = false;  // "Сообщение для напарника" включено
let _awaitingPartnerId = false;    // Ждём ответ /id для установки напарника
// ==================== КОНЕЦ НАПАРНИК STATE ====================
// Хоткей открытия меню МВД — настраивается установщиком через MENU_KEY (по умолчанию Alt+0)
var MENU_KEY = "Alt+0";
// Скрытые пункты меню «Повседневная» — настраивается установщиком
var MENU_HIDDEN_ITEMS = [];
// Биндинги прямого вызова пунктов меню — настраивается установщиком
// Формат: { "greeting": "Alt+G", "cuffing": "Alt+C", ... }
var MENU_BINDS = {};
// Порядок пунктов меню «Повседневная» — настраивается установщиком
// Формат: ["greeting","cuffing","checkDocuments",...] (пусто = по умолчанию)
var MENU_ORDER = [];

// Применяем порядок пунктов если задан
(function() {
    if (!MENU_ORDER || !MENU_ORDER.length) return;
    var ordered = [];
    // Сначала — пункты в заданном порядке
    MENU_ORDER.forEach(function(action) {
        var found = povsednevOptions.find(function(o) { return o.action === action; });
        if (found) ordered.push(found);
    });
    // Затем — любые пункты которых не было в MENU_ORDER (новые, добавленные позже)
    povsednevOptions.forEach(function(o) {
        if (!ordered.find(function(x) { return x.action === o.action; })) {
            ordered.push(o);
        }
    });
    // Переписываем массив на месте чтобы все ссылки на povsednevOptions остались валидны
    povsednevOptions.length = 0;
    ordered.forEach(function(o) { povsednevOptions.push(o); });
})();

// Вспомогательная функция: проверяет совпадение e с комбо-строкой вида "Alt+G"
function _matchesCombo(e, combo) {
    if (!combo) return false;
    var parts = combo.toLowerCase().split('+').map(function(s){ return s.trim(); });
    var needAlt   = parts.indexOf('alt')   !== -1;
    var needCtrl  = parts.indexOf('ctrl')  !== -1;
    var needShift = parts.indexOf('shift') !== -1;
    var mainParts = parts.filter(function(p){ return p !== 'alt' && p !== 'ctrl' && p !== 'shift'; });
    var mainKey   = mainParts[0] || '';
    var modOk = (!needAlt   || e.altKey)   &&
                (!needCtrl  || e.ctrlKey)  &&
                (!needShift || e.shiftKey) &&
                (needAlt   || !e.altKey)   &&
                (needCtrl  || !e.ctrlKey)  &&
                (needShift || !e.shiftKey);
    return modOk && (e.key.toLowerCase() === mainKey || e.code.toLowerCase() === mainKey);
}

// Обработчик горячих клавиш
window.addEventListener('keydown', function(e) {
    if (MENU_KEY) {
        var parts = MENU_KEY.toLowerCase().split('+').map(function(s){ return s.trim(); });
        var needAlt   = parts.indexOf('alt')   !== -1;
        var needCtrl  = parts.indexOf('ctrl')  !== -1;
        var needShift = parts.indexOf('shift') !== -1;
        var mainParts = parts.filter(function(p){ return p !== 'alt' && p !== 'ctrl' && p !== 'shift'; });
        var mainKey   = mainParts[0] || '';
        var modOk = (!needAlt || e.altKey) && (!needCtrl || e.ctrlKey) && (!needShift || e.shiftKey);
        var keyOk = e.key.toLowerCase() === mainKey || e.code.toLowerCase() === mainKey;
        if (modOk && keyOk) {
            sendChatInput('/dahk');
        }
    }
    // Прямые биндинги пунктов меню «Повседневная»
    if (MENU_BINDS && typeof MENU_BINDS === 'object') {
        for (var _action in MENU_BINDS) {
            if (!_matchesCombo(e, MENU_BINDS[_action])) continue;
            e.preventDefault && e.preventDefault();
            var _opt = povsednevOptions.find(function(o){ return o.action === _action; });
            if (!_opt) break;
            // FIX: СОБР-скин (15340) для greeting не требует ID
            var _isOmonSkin = skinId === 15340;
            var _needsIdForThis = _opt.needsId && !(_action === 'greeting' && _isOmonSkin);
            if (_action === 'fine') {
                window._duranOpenMode = 'fine';
                window._duranFineTargetId = giveLicenseTo || -1;
                window.openInterface('LawsHelper');
            } else if (_action === 'wantedFine') {
                window._duranOpenMode = 'wanted';
                window._duranWantedTargetId = giveLicenseTo || -1;
                window.openInterface('LawsHelper');
            } else if (_needsIdForThis) {
                // Открываем LawsHelper на экране ввода ID для этого действия
                window._duranOpenMode = null;
                window._duranInitLevel = 'povsednevAction';
                window._duranInitAction = _action;
                window._duranTargetId = giveLicenseTo || -1;
                window.openInterface('LawsHelper');
            } else {
                executePovsednevAction(_action, giveLicenseTo || -1);
            }
            break;
        }
    }
    // Хоткей свапа тазер ↔ дигл теперь регистрируется в LoadAhk.js
    // на основе настройки SWAP_KEY из установщика.
    // Прямые хоткеи здесь убраны — не дублируем.

    // ==================== ALT — ПОКАЗАТЬ/СКРЫТЬ КУРСОР ПРИ ОТКРЫТОЙ КОНСОЛИ ====================
    if (e.keyCode === window.KEY_CODE_ALT) {
        const consoleRef = window.App && window.App.$refs && window.App.$refs.console;
        if (consoleRef && consoleRef.isOpened) {
            window.cursorStatus = !window.cursorStatus;
            window.setCursorStatus('Console', window.cursorStatus);
        }
    }
});

// Сохраняем оригинальный обработчик — используется в авто-розыске (см. ниже)
const _origSendClientEventHandle = window.sendClientEventHandle;
// ==================== END A/D ====================

// ==================== CHAT LOGGING HELPERS ====================
function normalizeColor(color) {
    let normalized = String(color).toUpperCase();
    if (normalized.startsWith('#')) normalized = normalized.slice(1);
    if (normalized.length === 8) normalized = normalized.slice(0, 6);
    return '0x' + normalized;
}
const CHAT_RADIUS = { SELF: 0, CLOSE: 1, MEDIUM: 2, FAR: 3, RADIO: 4, UNKNOWN: -1 };
function getChatRadius(color) {
    switch (normalizeColor(color)) {
        case '0xEEEEEE': return CHAT_RADIUS.SELF;
        case '0xCECECE': return CHAT_RADIUS.CLOSE;
        case '0x999999': return CHAT_RADIUS.MEDIUM;
        case '0x6B6B6B': return CHAT_RADIUS.FAR;
        case '0x33CC66': return CHAT_RADIUS.RADIO;
        default:         return CHAT_RADIUS.UNKNOWN;
    }
}
function normalizeToCyrillic(text) {
    const map = {
        'A':'А','a':'а','B':'В','b':'в','C':'С','c':'с','E':'Е','e':'е',
        'H':'Н','h':'н','K':'К','k':'к','M':'М','m':'м','O':'О','o':'о',
        'P':'Р','p':'р','T':'Т','x':'х','X':'Х','y':'у','Y':'У'
    };
    return String(text).replace(/[A-Za-z]/g, ch => map[ch] || ch);
}
const RADIUS_LABELS = {
    [CHAT_RADIUS.SELF]:    { label: 'SELF',   color: '#EEEEEE' },
    [CHAT_RADIUS.CLOSE]:   { label: 'CLOSE',  color: '#CECECE' },
    [CHAT_RADIUS.MEDIUM]:  { label: 'MEDIUM', color: '#999999' },
    [CHAT_RADIUS.FAR]:     { label: 'FAR',    color: '#6B6B6B' },
    [CHAT_RADIUS.RADIO]:   { label: 'RADIO',  color: '#33CC66' },
    [CHAT_RADIUS.UNKNOWN]: { label: '?',      color: '#AAAAAA' },
};
// Извлекает первый встроенный цветовой код {RRGGBB} из текста сообщения
function getInlineColor(text) {
    const m = String(text).match(/\{([0-9A-Fa-f]{6})\}/);
    return m ? m[1].toUpperCase() : null;
}
// ==================== END CHAT LOGGING HELPERS ====================

let _mainChatHandlerReady = false;

const setupChatHandler = () => {
    if (window.interface && window.interface('Hud')?.$refs?.chat?.add) {
        const originalAddFunction = window.interface('Hud').$refs.chat.add;
 
        window.interface('Hud').$refs.chat.add = function(message, ...args) {
            // ========== ЛОГИРОВАНИЕ ЧАТА (как в Code.js) ==========
            try {
                const _msg    = String(message);
                const _color  = args[0];          // первый arg — цвет (если есть)
                const _radius = getChatRadius(_color);
                const _rl     = RADIUS_LABELS[_radius] || RADIUS_LABELS[CHAT_RADIUS.UNKNOWN];
                const _now    = new Date();
                const _ts     = `${String(_now.getHours()).padStart(2,'0')}:${String(_now.getMinutes()).padStart(2,'0')}:${String(_now.getSeconds()).padStart(2,'0')}`;
                const _actualColor = normalizeColor(_color).replace('0x', '');
                const _colorTag = `[${_rl.label}|#${_actualColor}]`;
                console.log(`[${_ts}]${_colorTag} ${_msg}`);
            } catch (_e) { /* тихо игнорируем */ }
            // ========== КОНЕЦ ЛОГИРОВАНИЯ ==========
            // ========== ФИЛЬТРАЦИЯ СООБЩЕНИЙ ==========
            if (shouldBlockMessage(message)) {
                console.log('[FILTER] ✋ Сообщение заблокировано');
                return;
            }
            // ==================== ОТСЛЕЖИВАНИЕ ПОГОНИ ====================
            if (typeof message === 'string' && currentScanId) {
                // Погоня началась или присоединились
                if (message.includes('Вы начали погоню за игроком') ||
                    message.includes('Вы присоединились к погоне')) {
                  
                    isInActiveChase = true;
                    console.log('[CHASE] 🚨 Погоня активна - /pg отключен');
                  
                    // Открываем синее уведомление
                    openChaseNotification(currentScanId);
                }
              
                // Преступник ушел от погони
                if (message.includes('Разыскиваемый ушел от погони!')) {
                    isInActiveChase = false;
                    console.log('[CHASE] ⚠️ Преступник ушел - /pg возобновлен');
                  
                    // Возвращаем красное уведомление
                    openTrackingNotification(currentScanId);
                }
            }
            // ==================== КОНЕЦ ОТСЛЕЖИВАНИЯ ПОГОНИ ====================

            // ==================== ПИК НИКА ИЗ /id ====================
            // Ловим ответ сервера на /id: "Ник, ID: 43, уровень: 44, PING: 59, клиент: RADMIR (PC)"
            // Поддержка CLEO-префикса времени: "[17:59:42:606]: Ник, ID: ..."
            if (typeof message === 'string' && currentScanId) {
                const idInfoMatch = message.match(/(?:^\[\d{2}:\d{2}:\d{2}(?::\d+)?\]:\s*)?([A-Za-z0-9_]+),\s*ID:\s*(\d+),/);
                if (idInfoMatch && idInfoMatch[2] === String(currentScanId)) {
                    const nick = idInfoMatch[1];
                    if (nick !== trackingNickname) {
                        trackingNickname = nick;
                        console.log(`[TRACKING] 👤 Ник получен: ${nick}`);
                        // Если уведомление уже открыто без ника — обновляем
                        if (trackingNotificationOpen || chaseNotificationOpen) {
                            openTrackingNotification(currentScanId);
                        }
                    }
                }
            }
            // ==================== КОНЕЦ ПИКА НИКА ====================

            // ==================== ПИК НИКА НАПАРНИКА ИЗ /id ====================
            if (typeof message === 'string' && _awaitingPartnerId && window._pendingPartnerId) {
                const idPartnerMatch = message.match(/(?:^\[\d{2}:\d{2}:\d{2}(?::\d+)?\]:\s*)?([A-Za-z0-9_]+),\s*ID:\s*(\d+),/);
                if (idPartnerMatch && idPartnerMatch[2] === String(window._pendingPartnerId)) {
                    const nick = idPartnerMatch[1];
                    partnerNick = nick;
                    partnerTrackingEnabled = true;
                    _awaitingPartnerId = false;
                    window._pendingPartnerId = null;
                    snAdd(`[1, "Напарник", "Напарник: ${nick}[${partnerId}]", "00FF00", 3000]`);
                    console.log(`[PARTNER] ✅ Напарник установлен: ${nick}[${partnerId}]`);
                }
            }
            // ==================== КОНЕЦ ПИКА НИКА НАПАРНИКА ====================

            // ==================== ОБНАРУЖЕНИЕ СООБЩЕНИЯ НАПАРНИКА ====================
            // Реальный формат в консоли:
            // [CLOSE|#CECECE] - Отслеживаю 395 {0000FF}({v:Calvin_Miller})[294]
            // Сервер сам добавляет {COLOR}({v:NICK})[ID] в конец любого локального сообщения
            if (typeof message === 'string' && partnerTrackingEnabled && partnerNick && partnerId) {
                const msgStr = String(message);
                // Формат имени со скобками: ({v:NICK})[ID]
                const hasPartnerTag =
                    msgStr.includes(`({v:${partnerNick}})[${partnerId}]`) || // основной формат
                    msgStr.includes(`{v:${partnerNick}}[${partnerId}]`) ||    // без скобок (запасной)
                    msgStr.includes(`${partnerNick}[${partnerId}]`);           // радио/другие каналы
                if (hasPartnerTag) {
                    const trackMatch = msgStr.match(/Отслеживаю жетон\s+(\d+)/);
                    if (trackMatch) {
                        const suspectId = trackMatch[1];
                        console.log(`[PARTNER] 🔔 Напарник ${partnerNick}[${partnerId}] начал отслеживание ID: ${suspectId}`);
                        snAdd(`[1, "Напарник", "${partnerNick}: отслеживает ID ${suspectId}", "00AAFF", 3000]`);
                        setTimeout(() => startTracking(suspectId), 600);
                    }
                    const stopMatch = msgStr.match(/Закончил отслеживание за жетоном\s+(\d+)/);
                    if (stopMatch) {
                        const suspectId = stopMatch[1];
                        console.log(`[PARTNER] 🔔 Напарник ${partnerNick}[${partnerId}] закончил отслеживание ID: ${suspectId}`);
                        snAdd(`[1, "Напарник", "${partnerNick}: закончил отслеживание ${suspectId}", "FF4444", 3000]`);
                        if (currentScanId === suspectId || currentScanId === String(suspectId)) {
                            stopTracking();
                        }
                    }
                }
            }
            // ==================== КОНЕЦ ОБНАРУЖЕНИЯ СООБЩЕНИЯ НАПАРНИКА ====================

            // ==================== АВТО-СТОП: НЕВОЗМОЖНО ОПРЕДЕЛИТЬ / ТАКОГО ИГРОКА НЕТ ====================
            if (typeof message === 'string' && currentScanId && !window._trackingStopPending) {
                const isNoLocation = message.includes('Невозможно определить местоположение игрока');
                const isNoPlayer   = message.includes('Такого игрока нет');

                if (isNoLocation || isNoPlayer) {
                    const reason = isNoPlayer
                        ? 'Такого игрока нет'
                        : 'Невозможно определить местоположение';
                    console.log(`[TRACKING] ⚠️ ${reason} — стоп немедленно`);
                    window._trackingStopPending = true;

                    // Останавливаем всё сразу (интервалы, флаги) — но БЕЗ hideAll
                    // чтобы серое уведомление успело показаться и догореть само
                    if (scanInterval)    { clearInterval(scanInterval);    scanInterval    = null; }
                    if (setmarkInterval) { clearInterval(setmarkInterval); setmarkInterval = null; }
                    if (pgInterval)      { clearInterval(pgInterval);      pgInterval      = null; }
                    trackingNotificationOpen = false;
                    chaseNotificationOpen    = false;
                    currentScanId            = null;
                    trackingNickname         = null;
                    isInActiveChase          = false;

                    // Показываем серое уведомление синхронно — без setTimeout,
                    // чтобы никакой другой snAdd не успел сделать hideAll между hideAll и add
                    try {
                        const sn = window.interface('ScreenNotification');
                        if (sn) {
                            if (typeof sn.hideAll === 'function') sn.hideAll();
                            sn.add(`[1, "Отслеживание", "${reason}", "CECECE", 2500]`);
                        }
                    } catch(e) {}

                    setTimeout(() => { window._trackingStopPending = false; }, 3000);
                    console.log(`[TRACKING] 🛑 Авто-стоп: ${reason}`);
                }
            }
            // ==================== КОНЕЦ АВТО-СТОП ====================

            // ==================== КД /setmark: ПОВТОР ЧЕРЕЗ N СЕКУНД ====================
            if (typeof message === 'string' && currentScanId) {
                // Сервер пишет на /setmark: "Система отслеживания ещё загружает актуальное местоположение подозреваемого. Подождите X сек."
                const cdMatch = message.match(/[Пп]одождите\s+(\d+)\s*сек/);
                if (cdMatch) {
                    const waitSec = parseInt(cdMatch[1]);
                    console.log(`[TRACKING] ⏳ КД /setmark: ${waitSec} сек`);
                    // Показываем оранжевое уведомление со счётчиком
                    try {
                        const sn = window.interface('ScreenNotification');
                        if (sn && typeof sn.hideAll === 'function') sn.hideAll();
                        setTimeout(() => {
                            try {
                                window.interface('ScreenNotification').add(
                                    `[1, "Отслеживание", "/setmark КД: ${waitSec} сек", "FFAA00", ${(waitSec + 1) * 1000}]`
                                );
                            } catch(e) {}
                        }, 100);
                    } catch(e) {}
                    // Приостанавливаем setmarkInterval на время КД чтобы не спамить
                    if (setmarkInterval) {
                        clearInterval(setmarkInterval);
                        setmarkInterval = null;
                        console.log('[TRACKING] setmarkInterval приостановлен на время КД');
                    }
                    // Через waitSec секунд повторяем /setmark и возобновляем интервал
                    setTimeout(() => {
                        if (currentScanId) {
                            console.log(`[TRACKING] 🔄 Повтор /setmark после КД (${waitSec}с)`);
                            sendChatInput(`/setmark ${currentScanId}`);
                            // Возобновляем интервал /setmark каждые 31с
                            if (!setmarkInterval) {
                                setmarkInterval = setInterval(() => {
                                    if (currentScanId) sendChatInput(`/setmark ${currentScanId}`);
                                }, 31000);
                            }
                        }
                    }, waitSec * 1000);
                }
            }
            // ==================== КОНЕЦ КД /setmark ====================

            // Auto-cuff logic
            if (autoCuffEnabled && typeof message === 'string') {
                const stunMatch = message.match(/Вы оглушили (\w+) на \d+ секунд/);
                if (stunMatch) {
                    const nickname = stunMatch[1];
                    setTimeout(() => {
                        sendChatInput(`/id ${nickname}`);
                    }, 500);
                }
         
                const idMatch = message.match(/\d+\. {[A-F0-9]{6}}(\w+){ffffff}, ID: (\d+),/);
                if (idMatch && idMatch[2]) {
                    const id = idMatch[2];
                    setTimeout(() => {
                        sendMessagesWithDelay([
                            `/cuff ${id}`,
                            `/escort ${id}`
                        ], [0, 700]);
                    }, 1000);
                }
            }
            // ==================== ОТСЛЕЖИВАНИЕ ШТРАФОВ ====================
            if (typeof message === 'string') {
                if (message.includes('Вы получили премию к зарплате в размере')) {
                    try {
                        window.openInterface('InformationTimer', ['К/Д Выдача штрафа', 300, false]);
                        console.log('[FINE] InformationTimer запущен на 5 минут');
                    } catch (err) {
                        console.error('[FINE] Ошибка открытия InformationTimer:', err);
                    }
                }
             
                if (message.includes('Вы недавно выдавали штраф')) {
                    snAdd('[1, "Выдача штрафа", "У вас еще к/д на выдачу штрафа", "FF0000", 5000]');
                    console.log('[FINE] ScreenNotification: кулдаун штрафа');
                }
            }
            // ==================== КОНЕЦ ОТСЛЕЖИВАНИЯ ====================
     
            return originalAddFunction.apply(this, [message, ...args]);
        };
        console.log('[Auto-cuff] Обработчик чата успешно установлен');
        console.log('[CHASE] Отслеживание погони активировано');
        console.log('[FINE] Отслеживание штрафов активировано');
        _mainChatHandlerReady = true;
    } else {
        setTimeout(setupChatHandler, 100);
    }
};
setupChatHandler();

// ==================== РАННЕЕ ЛОГИРОВАНИЕ ВСЕХ ЧАТ-СООБЩЕНИЙ ====================
// window.onChatMessage вызывается движком для КАЖДОГО сообщения с сервера,
// доступен с самого старта (не зависит от монтирования Vue/Hud), поэтому
// здесь не теряются сообщения, пришедшие до setupChatHandler.
(() => {
    const originalOnChatMessage = window.onChatMessage;
    if (typeof originalOnChatMessage !== 'function') {
        console.log('[MVD-CHAT] window.onChatMessage не найден — раннее логирование не установлено');
        return;
    }
    window.onChatMessage = function(message, args) {
        if (!_mainChatHandlerReady) {
            try {
                const _msg    = String(message);
                // args приходит как массив, args[2] (после .slice(2) внутри оригинала) — цвет
                const _color  = Array.isArray(args) ? args[2] : undefined;
                const _radius = getChatRadius(_color);
                const _rl     = RADIUS_LABELS[_radius] || RADIUS_LABELS[CHAT_RADIUS.UNKNOWN];
                const _now    = new Date();
                const _ts     = `${String(_now.getHours()).padStart(2,'0')}:${String(_now.getMinutes()).padStart(2,'0')}:${String(_now.getSeconds()).padStart(2,'0')}`;
                const _actualColor = normalizeColor(_color).replace('0x', '');
                const _colorTag = `[${_rl.label}|#${_actualColor}]`;
                console.log(`[${_ts}]${_colorTag} ${_msg}`);
            } catch (_e) { /* тихо игнорируем */ }
        }
        return originalOnChatMessage.apply(this, arguments);
    };
    console.log('[MVD-CHAT] Раннее логирование чата установлено (onChatMessage)');
})();
// ==================== КОНЕЦ РАННЕГО ЛОГИРОВАНИЯ ====================

// ==================== ФУНКЦИИ SCREENNOTIFICATION ====================
// Восстанавливает уведомление отслеживания/погони если оно активно
const restoreTrackingNotification = () => {
    if (!currentScanId) return;
    const text = trackingNickname ? `${trackingNickname}<br>ID: ${currentScanId}` : `ID: ${currentScanId}`;
    if (chaseNotificationOpen) {
        setTimeout(() => {
            try { window.interface('ScreenNotification').add(`[1, "Начата погоня", "${text}", "0000FF", 36000000]`); } catch(e) {}
        }, 150);
    } else if (trackingNotificationOpen) {
        setTimeout(() => {
            try { window.interface('ScreenNotification').add(`[1, "Идет отслеживание", "${text}", "FF0000", 36000000]`); } catch(e) {}
        }, 150);
    }
};
const snAdd = (payload, skipRestore = false) => {
    try {
        // Если показывается финальное уведомление (серое) — не трогаем его через hideAll
        if (window._trackingStopPending) return;
        const sn = window.interface('ScreenNotification');
        if (sn && typeof sn.hideAll === 'function') sn.hideAll();
        setTimeout(() => {
            try { window.interface('ScreenNotification').add(payload); } catch(e) {}
        }, 100);
        // Если активно отслеживание/погоня — восстанавливаем уведомление после показа нового
        // skipRestore=true когда вызов идёт из самих openTracking/openChase (чтобы не затирать ник)
        if (!skipRestore && currentScanId && (trackingNotificationOpen || chaseNotificationOpen)) {
            restoreTrackingNotification();
        }
    } catch(e) {}
};
let currentNotificationId = 0;
let isInActiveChase = false; // Флаг активной погони
const openTrackingNotification = (id) => {
    currentNotificationId++;
    const text = trackingNickname ? `${trackingNickname}<br>ID: ${id}` : `ID: ${id}`;
    trackingNotificationOpen = true;
    chaseNotificationOpen = false;
    snAdd(`[1, "Идет отслеживание", "${text}", "FF0000", 36000000]`, true);
    console.log('[TRACKING] ScreenNotification открыт (красный)');
};
const openChaseNotification = (id) => {
    currentNotificationId++;
    const text = trackingNickname ? `${trackingNickname}<br>ID: ${id}` : `ID: ${id}`;
    trackingNotificationOpen = false;
    chaseNotificationOpen = true;
    snAdd(`[1, "Начата погоня", "${text}", "0000FF", 36000000]`, true);
    console.log('[CHASE] ScreenNotification открыт (синий)');
};
const closeTrackingNotifications = () => {
    try {
        const screenNotif = window.interface('ScreenNotification');
        if (screenNotif && typeof screenNotif.hideAll === 'function') {
            screenNotif.hideAll();
            trackingNotificationOpen = false;
            chaseNotificationOpen = false;
            console.log('[TRACKING] Все уведомления закрыты через hideAll');
        }
    } catch (err) {
        console.error('[TRACKING] Ошибка закрытия ScreenNotification:', err);
    }
};
const startTracking = (id) => {
    // Очищаем старые интервалы
    if (scanInterval) {
        clearInterval(scanInterval);
        scanInterval = null;
    }
    if (setmarkInterval) {
        clearInterval(setmarkInterval);
        setmarkInterval = null;
    }
    if (pgInterval) {
        clearInterval(pgInterval);
        pgInterval = null;
    }
 
    currentScanId = id;
    trackingNickname = null;
    isInActiveChase = false; // Сброс флага погони
 
    // Сначала отправляем /id — ждём 800мс ответа, потом открываем уведомление с ником
    sendChatInput(`/id ${currentScanId}`);
    setTimeout(() => {
        openTrackingNotification(id);
    }, 800);

    // ==================== СООБЩЕНИЕ НАПАРНИКУ ====================
    // Если включено "Сообщение для напарника" — отправляем в радио чтобы напарник
    // получил событие и тоже начал отслеживание этого же ID
    if (partnerMessageEnabled) {
        setTimeout(() => {
            if (!currentScanId) {
                console.log(`[PARTNER] ⛔ Сообщение не отправлено — отслеживание уже остановлено`);
                return;
            }
            sendChatInput(`Отслеживаю жетон ${id}`);
            console.log(`[PARTNER] 📡 Отправлено сообщение напарнику: Отслеживаю жетон ${id}`);
        }, 1200);
    }
    // ==================== КОНЕЦ СООБЩЕНИЯ НАПАРНИКУ ====================
 
    // Начальные команды (без /id — уже отправлен выше)
    sendMessagesWithDelay([
        `/setmark ${currentScanId}`,
        `/pg ${currentScanId}`
    ], [500, 1000]);
 
    // Интервал /pg каждые 2 секунды (только если НЕ в активной погоне)
    pgInterval = setInterval(() => {
        if (currentScanId && !isInActiveChase) {
            sendChatInput(`/pg ${currentScanId}`);
        }
    }, 2000);
 
    // Интервал /setmark каждые 31 секунду
    setmarkInterval = setInterval(() => {
        if (currentScanId) {
            sendChatInput(`/setmark ${currentScanId}`);
        }
    }, 31000);
 
};
const stopTracking = () => {
    // Очищаем все интервалы
    if (scanInterval) {
        clearInterval(scanInterval);
        scanInterval = null;
    }
    if (setmarkInterval) {
        clearInterval(setmarkInterval);
        setmarkInterval = null;
    }
    if (pgInterval) {
        clearInterval(pgInterval);
        pgInterval = null;
    }
 
    // Закрываем все уведомления
    closeTrackingNotifications();

    // ==================== СООБЩЕНИЕ НАПАРНИКУ О КОНЦЕ ОТСЛЕЖИВАНИЯ ====================
    if (partnerMessageEnabled && currentScanId) {
        const stoppedId = currentScanId;
        sendChatInput(`Закончил отслеживание за жетоном ${stoppedId}`);
        console.log(`[PARTNER] 📡 Отправлено: Закончил отслеживание за жетоном ${stoppedId}`);
    }
    // ==================== КОНЕЦ СООБЩЕНИЯ О КОНЦЕ ОТСЛЕЖИВАНИЯ ====================
 
    currentScanId = null;
    trackingNickname = null;
    isInActiveChase = false;
 
    console.log('[TRACKING] Отслеживание остановлено');
};
const toggleAutoCuff = () => {
    autoCuffEnabled = !autoCuffEnabled;
};
const togglePartnerTracking = () => {
    partnerTrackingEnabled = !partnerTrackingEnabled;
    console.log(`[PARTNER] partnerTrackingEnabled = ${partnerTrackingEnabled}`);
};
const togglePartnerMessage = () => {
    partnerMessageEnabled = !partnerMessageEnabled;
    console.log(`[PARTNER] partnerMessageEnabled = ${partnerMessageEnabled}`);
};
window.togglePartnerTracking = togglePartnerTracking;
window.togglePartnerMessage  = togglePartnerMessage;
const toggleAutoGrab = () => {
    autoGrabEnabled = !autoGrabEnabled;
    try {
        if (autoGrabEnabled) {
            const skipList = (typeof AUTO_GRAB_SKIP !== 'undefined' && AUTO_GRAB_SKIP.length)
                ? AUTO_GRAB_SKIP
                : ((typeof window._mvdGrabSkip !== 'undefined') ? window._mvdGrabSkip : []);
            const skip = (key) => skipList.includes(key);
            const allItems = [
                { key: 'medkit',     label: 'Аптечка' },
                { key: 'painkiller', label: 'Обезболивающее' },
                { key: 'baton',      label: 'Дубинка' },
                { key: 'baton2',     label: 'Жезл' },
                { key: 'vest',       label: 'Бронежилет' },
                { key: 'taumeter',   label: 'Тауметр' },
                { key: 'diag',       label: 'Диагностика' },
                { key: 'taser',      label: 'Тазер' },
                { key: 'deagle',     label: 'Desert Eagle' },
                { key: 'magnum',     label: 'Патроны .44' },
                { key: 'akm',        label: 'АКМ' },
                { key: 'ammo762',    label: 'Патроны 7.62' },
                { key: 'aks74u',     label: 'АКС-74У' },
                { key: 'ammo545',    label: 'Патроны 5.45' },
                { key: 'remington',  label: 'Remington 870' },
                { key: 'ammo12x70',  label: 'Патроны 12x70' },
            ];
            const takenItems = allItems.filter(i => !skip(i.key)).map(i => i.label);
            snAdd(`[1, "Авто-снаряжение", "Берётся: ${takenItems.join(', ')}", "00FF00", 5000]`);
        } else {
            snAdd(`[1, "Авто-снаряжение", "Выключено", "FF4444", 3000]`);
        }
    } catch(e) {
        console.warn('[MVD-GRAB] toggleAutoGrab notify error:', e);
    }
};
const executePovsednevAction = (action, targetId) => {
    if (!targetId) targetId = giveLicenseTo;
    const isOmonSkin = skinId === 15340;
    switch (action) {
        case "greeting":
            if (isOmonSkin) {
                sendMessagesWithDelay([
                    `Работает сотрудник СОБР | Мой позывной ${CALLSIGN}`,
                    "Предъявите, пожалуйста, Ваши документы, удостоверяющие Вашу личность.",
                    "Если Вы в течение 30 секунд не предъявите мне документы я сочту это за 5.2 УК.",
                    "Если Вы убежите или попробуете это сделать я сочту это за 5.2.1 УК."
                ], [0, 500, 500, 500]);
            } else {
                sendMessagesWithDelay([
                    `Здравия желаю, Вас беспокоит ${RANK} - ${FIRST_NAME} ${LAST_NAME}.`,
                    `/doc ${targetId}`
                ], [0, 1000]);
            }
            break;
      
        case "checkDocuments":
            if (isOmonSkin) {
                sendMessagesWithDelay([
                    "/s Работает СОБР, руки за голову!",
                    "/s Если Вы убежите или попробуете это сделать я сочту это за 5.2.1 УК",
                    "/s Готовим свои документы!"
                ], [750, 1000, 1000]);
            } else {
                sendMessagesWithDelay([
                    "Будьте добры предъявить Ваши документы, а именно:",
                    "Паспорт, вод.права и документы на т/с.",
                    "/n /pass [id], /carpass [id]",
                    "А также, отстегните пожалуйста ремень безопасности.",
                    "/n /rem"
                ], [0, 1000, 1000, 1000, 1000]);
            }
            break;
      
        case "studyDocuments":
            sendMessagesWithDelay([
                "/me взял документы",
                "/do Документы в руке.",
                "/me открыл документы на нужной странице",
                "/do Документы открыты.",
                "/me осмотрел страницу",
                "/do Страница осмотрена.",
                "/me закрыл документы",
                "/do Документы закрыты.",
                "/me вернул документы"
            ], [0, 1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500]);
            break;
      
        case "wantedFine":
            sendChatInput(`/su ${targetId}`);
            break;

        case "wanted":
            sendMessagesWithDelay([
                "/me взял рацию в руки",
                "/me сообщил данные о нарушителе диспетчеру",
                "/do Данные сообщены.",
                "/do Нарушитель объявлен в розыск.",
                `/su ${targetId}`
            ], [0, 1000, 1000, 1000, 1000]);
            break;
      
        case "scanningTablet":
            sendMessagesWithDelay([
                "/me достал фоторобот из кармана",
                "/do Фоторобот в руке.",
                "/me сделал снимок лица, затем сравнил с подозреваемым",
                "Вы задержаны так как находитесь в федеральном розыске."
            ], [0, 1000, 1000, 1000]);
            break;
      
        case "cuffing":
            sendMessagesWithDelay([
                "/do Наручники в руке.",
                "/me надел наручники на человека напротив",
                `/cuff ${targetId}`
            ], [0, 300, 300]);
            break;
      
        case "putInCar":
            sendMessagesWithDelay([
                "/me открыл дверь автомобиля",
                "/do Дверь открыта.",
                "/me посадил преступника в патрульный автомобиль",
                `/putpl ${targetId}`
            ], [0, 1000, 1000, 1000]);
            break;
      
        case "arrest":
            sendMessagesWithDelay([
                "/me открыл двери ППС",
                "/do Двери открыты.",
                "/me провел человека в участок",
                "/do Человек в участке.",
                `/arrest ${targetId}`
            ], [0, 1000, 1000, 1000, 1000]);
            break;
      
        case "uncuffing":
            sendMessagesWithDelay([
                "/me снял наручники с преступника",
                "/me повесил наручники на пояс",
                "/do Наручники на поясе.",
                `/uncuff ${targetId}`,
                "/me отпустил преступника",
                "/do Человек свободен.",
                `/escort ${targetId}`
            ], [0, 600, 600, 600, 600, 600, 600]);
            break;
      
        case "chase":
            sendMessagesWithDelay([
                "/me взял рацию в руки",
                "/do Рация в руках.",
                "/me сообщил диспетчеру, о погоне за нарушителем",
                `/Pg ${targetId}`
            ], [0, 500, 500, 500]);
            break;
      
        case "search":
            sendMessagesWithDelay([
                "Сейчас я проведу у вас обыск.",
                "Повернитесь спиной и поднимите руки.",
                "/me достал резиновые перчатки",
                "/me надел перчатки на руки",
                "/me провёл руками по верхним частям тела",
                "/me провёл руками по нижним частям тела",
                `/search ${targetId}`
            ], [0, 1000, 1004, 1007, 1010, 1000, 1000]);
            break;
      
        case "escort":
            sendMessagesWithDelay([
                "/me схватил задержанного за руки",
                "/me заломал задержанного и повёл задержанного",
                `/escort ${targetId}`
            ], [0, 300, 300]);
            break;
      
        case "clearWanted":
            sendMessagesWithDelay([
                "/me взял рацию в руки, затем зажал кнопку",
                "/do Кнопка зажата.",
                "/me сообщил данные подозреваемого диспетчеру",
                "/do Данные сообщены диспетчеру.",
                "/do Диспетчер: С подозреваемого снят розыск.",
                `/clear ${targetId}`
            ], [0, 700, 700, 700, 700, 700]);
            break;
      
        case "confiscate":
            sendMessagesWithDelay([
                "Я нащупал что то.",
                "/me аккуратно нащупал и достал запрещенный предмет/вещество",
                "/do Пакет для вещественных докозательств в кармане.",
                "/me достал этот пакет и положил туда запрещенную вещь/вещество и закрыл пакет",
                `/remove ${targetId}`
            ], [0, 500, 500, 500, 500]);
            break;
      
        case "breakGlass":
            sendMessagesWithDelay([
                "/me открыл дверь авто.",
                "/me вытащил человека с авто",
                `/ejectout ${targetId}`
            ], [0, 300, 300]);
            break;
      
        case "removeMask":
            sendMessagesWithDelay([
                "/do Человек напротив находится в маске.",
                "/me протянув правую руку вперёд, сорвал маску с лица у человека напротив",
                "/do Маска сорвана, человек находится без маски на лице.",
                "/n Команда для снятие маски: /reset или /maskoff"
            ], [0, 400, 400, 400]);
            break;
      
        case "fingerprint":
            sendMessagesWithDelay([
                "/do Аппарат 'CТОЛ' в кармане.",
                "/me резким движением достал Аппарат",
                "/do Аппарат 'СТОЛ' в руке.",
                "/me резким движением потянул руку гражданина напротив и приложил его палец к аппарату",
                "/do Процесс сканирования начат.",
                "/do Процесс завершен.",
                "/do Личность установлена."
            ], [0, 700, 700, 700, 700, 700, 700]);
            break;
      
        case "takeLicense":
            sendMessagesWithDelay([
                "/me взял права, затем переложил их в левую руку",
                "/me взял блокнот и ручку в правую руку",
                "/do Блокнот и ручка в руке.",
                "/me записал данные о нарушении и нарушителе в блокнот",
                "/do Данные заполнены.",
                "/me забрал водительские права",
                "/do Водительские права изъяты.",
                `/takelic ${targetId}`
            ], [0, 1000, 1000, 1000, 1000, 1000, 1000, 1000]);
            break;
        case "miranda":
            sendMessagesWithDelay([
                "Вы задержаны. Вам необходимо знать ваши права.",
                "Вы имеете право хранить молчание.",
                "Вы имеете право на получение адвокатской помощи.",
                "Вы имеете право на обжалование действий сотрудника силовой структуры.",
                "Вам ясны ваши права?"
            ], [0, 1500, 1500, 1500, 1500]);
            break;
    }
};
const executeStroyAction = (action, hour = null, minute = null) => {
    const tag = rankTags[RANK] || `[${RANK}]`;
    switch (action) {
        case "stroy1":
            sendMessagesWithDelay([
                `/r ${tag} Внимание.`,
                `/r ${tag} Прошу прийти на плац.`,
                `/r ${tag} Напомню, строй начнется в ${hour}:${minute} по МСК.`,
                `/r ${tag} Касается это всего младшего состава.`,
                `/r ${tag} Спасибо за внимание.`
            ], [0, 1700, 1700, 1700, 1700]);
            break;
        case "stroy2":
            sendMessagesWithDelay([
                `/r ${tag} Внимание.*Повторяя*`,
                `/r ${tag} Прошу прийти на плац.*Повторяя*`,
                `/r ${tag} Напомню, строй начнется в ${hour}:${minute} по МСК.*Повторяя*`,
                `/r ${tag} Касается это всего младшего состава.*Повторяя*`,
                `/r ${tag} Спасибо за внимание.*Повторяя*`
            ], [0, 1500, 1500, 1500, 1500]);
            break;
        case "ust1":
            sendMessagesWithDelay([
                "/s Итак бойцы, сейчас я вам проведу лекцию на тему \"Устав\".",
                "/s Устав устанавливает стандарты служебной деятельности.",
                "/s Следование Уставу способствует дисциплине. Каждый сотрудник обязан знать свои права и обязанности",
                "/s Знать устав - ваша обязанность. Незнание не освобождает от наказания.",
                "/s Следование Уставу положительно сказывается на нашем имидже в глазах граждан",
                "/s Соблюдение Устава — это не только ваша обязанность, но и залог успешной службы.",
                "/s Лекция окончена.",
                "/c 060"
            ], [0, 1000, 1000, 1000, 1000, 1000, 1000, 1000]);
            break;
        case "sub1":
            sendMessagesWithDelay([
                "/s Коллеги,я хочу прочитать лекцию на тему \"Субординцация\"",
                "/s В силовых структурах нет слов: \"можно\",\"да\",\"нет\",\"привет\"",
                "/s Обращаться нужно так:",
                "/s \"Разрешите\",\"Так точно\",\"Никак нет\",\"Здравия желаю\"",
                "/s Ко всем обращаться строго по званию.К примеру:",
                "Т.Полковник,т.Сержант,т.Подполковник и т.д",
                "/s Обращаться ко всем сослуживцам без исключения только на \"Вы\"",
                "/s Запрещенно перечить или огрызаться со старшими по званию.",
                "/s Не соблюдение субординации, это прямое нарушение",
                "/c 060"
            ], [0, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000]);
            break;
        case "trenya1":
            sendMessagesWithDelay([
                `/s Здравия. Я ${RANK} ${LAST_NAME}.`,
                "/s Сегодня я проведу вам тренировку",
                "/s Начнём с приседаний."
            ], [0, 1700, 1700]);
            break;
        case "trenya2":
            sendMessagesWithDelay([
                "/s Закончили.",
                "/s Дальше разминка рук.",
                "/n /anim 8 1",
                "/c 60"
            ], [0, 1700, 1700, 1700]);
            break;
        case "trenya3":
            sendMessagesWithDelay([
                "/s Закончили.",
                "/s Отжимания.",
                "/n /anim 6 23",
                "/c 60"
            ], [0, 1500, 1500, 1500]);
            break;
        case "trenya4":
            sendMessagesWithDelay([
                "/s Закончили.",
                "/s Бег по плацу 3 круга.",
                "/s Без прыжков."
            ], [0, 1500, 1500]);
            break;
        case "trenya5":
            sendMessagesWithDelay([
                "/s Восточное единоборство.",
                "/n /anim 8 2"
            ], [0, 1500]);
            break;
        case "trenya6":
            sendMessagesWithDelay([
                "/s Закончили.",
                "/s На этом наша тренировка закончена, но не расходимся."
            ], [0, 1500]);
            break;
        case "rp1":
            sendMessagesWithDelay([
                "/s Хочу вам сказать.",
                "/s У меня для вас есть задания."
            ], [0, 1700]);
            break;
        case "rp2":
            sendMessagesWithDelay([
                "/s Всем спасибо за помощь.",
                "/s Помогли очень сильно.",
                "/s На этой ноте я хочу вам сказать...",
                "/s Вы свободны, можете идти."
            ], [0, 1500, 1500, 1500]);
            break;
    }
};
// ════════════════════════════════════════════════════════════════
//  ОТКРЫТИЕ LAWSHELPER — вместо системных диалогов
// ════════════════════════════════════════════════════════════════
// Главное меню МВД (раньше диалог 677)
window.showMvdSubMenu = (e) => {
    giveLicenseTo = e;
    window._duranOpenMode = null;
    window._duranInitLevel = null;
    window._duranTargetId = (e !== undefined && e !== null) ? e : -1;
    window.openInterface('LawsHelper');
};
// Подменю «Повседневная» (раньше диалог 667)
window.showPovsednevMenuPage = (e) => {
    giveLicenseTo = e;
    window._duranOpenMode = null;
    window._duranInitLevel = 'povsednev';
    window._duranTargetId = (e !== undefined && e !== null) ? e : -1;
    window.openInterface('LawsHelper');
};
// Подменю «Строй» (раньше диалог 671)
window.showStroyMenuPage = (e) => {
    giveLicenseTo = e;
    window._duranOpenMode = null;
    window._duranInitLevel = 'stroy';
    window._duranTargetId = (e !== undefined && e !== null) ? e : -1;
    window.openInterface('LawsHelper');
};
// Розыск (раньше диалог 681)
window.showUkInputDialog = (e) => {
    giveLicenseTo = e;
    window._duranOpenMode = 'wanted';
    window._duranWantedTargetId = (e !== undefined && e !== null) ? e : -1;
    window.openInterface('LawsHelper');
};
// Штрафы (раньше диалог 678/679)
window.showKoapTypeMenu = (e) => {
    giveLicenseTo = e;
    window._duranOpenMode = 'fine';
    window._duranFineTargetId = (e !== undefined && e !== null) ? e : -1;
    window.openInterface('LawsHelper');
};

// ════════════════════════════════════════════════════════════════
//  ПУБЛИЧНОЕ API ДЛЯ LAWSHELPER
// ════════════════════════════════════════════════════════════════

// Текущее состояние — читается LawsHelper напрямую (без поллинга)
window._mvdGetState = function() {
    return {
        currentScanId: currentScanId,
        autoCuffEnabled: autoCuffEnabled,
        autoGrabEnabled: autoGrabEnabled,
        partnerTrackingEnabled: partnerTrackingEnabled,
        partnerMessageEnabled: partnerMessageEnabled,
        partnerNick: partnerNick,
        partnerId: partnerId,
        rank: RANK || '',
        firstName: FIRST_NAME || '',
        lastName: LAST_NAME || '',
        rankTag: rankTags[RANK] || ('[' + (RANK || 'МВД') + ']'),
        stroyAccess: stroyRanks.includes(RANK),
        // Настройки меню «Повседневная» из установщика — LawsHelper фильтрует/сортирует DAHK_POVSEDNEV
        menuHiddenItems: (typeof MENU_HIDDEN_ITEMS !== 'undefined' && MENU_HIDDEN_ITEMS) || [],
        menuOrder: (typeof MENU_ORDER !== 'undefined' && MENU_ORDER) || [],
    };
};

// Хоткей открытия меню МВД (Alt+0 и т.д.) — вызывается из обработчика keydown ниже
window._mvdBindAction = function(action, targetId) {
    if (action === 'wantedFine') {
        window._duranOpenMode = 'wanted';
        window._duranWantedTargetId = targetId || -1;
        window.openInterface('LawsHelper');
        return;
    }
    if (action === 'fine') {
        window._duranOpenMode = 'fine';
        window._duranFineTargetId = targetId || -1;
        window.openInterface('LawsHelper');
        return;
    }
    // По умолчанию — главное меню МВД
    window._duranOpenMode = null;
    window._duranInitLevel = null;
    window._duranTargetId = targetId || -1;
    window.openInterface('LawsHelper');
};

// Клик по пункту меню в LawsHelper, требующий действия от mvdN
window._mvdMenuAction = function(option, targetId) {
    if (!option) return;
    if (option.action === 'wantedFine') {
        window._duranOpenMode = 'wanted';
        window._duranWantedTargetId = targetId || -1;
        window.openInterface('LawsHelper');
        return;
    }
    if (option.action === 'fine') {
        window._duranOpenMode = 'fine';
        window._duranFineTargetId = targetId || -1;
        window.openInterface('LawsHelper');
        return;
    }
};

window.sendClientEventCustom = (event, ...args) => {

    console.log(`Событие: ${event}, Аргументы:`, args);

    // Alt+Q — автотазер (своп тазер ↔ дигл) перехватывается через keydown (браузерный уровень)

    if (args[0] === "OnDialogResponse" && _wantedDialogId !== null && args[1] === _wantedDialogId) {
        // ==================== /WANTED: ВЫБОР ИГРОКА → АВТО-ОТСЛЕЖИВАНИЕ ====================
        if (args[2] === 1) {
            const listitem = parseInt(args[3]);
            const player = _wantedPlayers[listitem];
            if (player) {
                console.log(`[WANTED] ✅ Выбран: ${player.nick}[${player.id}] — запускаем отслеживание`);
                _wantedDialogId = null;
                setTimeout(() => startTracking(player.id), 100);
            } else {
                console.log(`[WANTED] ⚠️ Не найден игрок с listitem=${listitem}, всего=${_wantedPlayers.length}`);
                _wantedDialogId = null;
            }
        } else {
            _wantedDialogId = null;
        }
        window.sendClientEventHandle(event, ...args);
        // ==================== КОНЕЦ /WANTED ====================
    } else {
        window.sendClientEventHandle(event, ...args);
    }
};
window.sendChatInputCustom = e => {
    const args = e.split(" ");
    if (args[0] == "/dahk") {
        targetId = args[1];
        // Получаем актуальный скин напрямую перед проверкой
        const freshSkin = getSkinIdFromStore();
        if (freshSkin !== null) skinId = Number(freshSkin);
        if (mvdSkins.includes(skinId)) {
            // Успешное открытие меню МВД
            snAdd('[0, "AHK by TG: ZaharKonst", "Меню фракции \'МВД\'", "0000FF", 5000]');
            restoreTrackingNotification();
            showMvdSubMenu(args[1]);
        } else {
            // Ошибка: скин не подходит
            snAdd('[0, "AHK by TG: ZaharKonst", "Не удалось определить фракцию попробуйте ещё раз", "FFFFFF", 5000]');
        }
    } else if (args[0] == "/console") {
        try {
            const consoleRef = window.App && window.App.$refs && window.App.$refs.console;
            const willOpen = !consoleRef || !consoleRef.isOpened;
            if (willOpen && window.App) {
                if (!window.App.isDevelopment) {
                    window.App.isDevelopment = true;
                    if (window.App.engine != "legacy" && typeof engine !== "undefined") {
                        engine.trigger("ActivateDevelopmentMode");
                    }
                }
                if (typeof window.App.setConsoleActive === "function") {
                    window.App.setConsoleActive(true);
                }
            }
            if (consoleRef && typeof consoleRef.toggle === 'function') {
                consoleRef.toggle();
            } else {
                console.log('[CONSOLE] Интерфейс console не найден');
            }
        } catch (e) {
            console.log('[CONSOLE] Ошибка переключения консоли:', e.message);
        }
    } else if (args[0] == "/mvdreset") {
        stopTracking();
        autoCuffEnabled = false;
        // Сброс напарника
        partnerNick = null;
        partnerId = null;
        partnerTrackingEnabled = false;
        partnerMessageEnabled = false;
        _awaitingPartnerId = false;
        sendChatInput("Настройки МВД сброшены.");
    } else {
        window.App.developmentMode || engine.trigger("SendChatInput", e);
    }
};
function sendMessagesWithDelay(messages, delays, index = 0) {
    if (index >= messages.length) return;
    setTimeout(() => {
        sendChatInput(messages[index]);
        sendMessagesWithDelay(messages, delays, index + 1);
    }, delays[index]);
}


sendChatInput = sendChatInputCustom;
sendClientEvent = sendClientEventCustom;




// ==================== DIALOG MONITOR (console only) ====================
// Перехват серверных диалогов — вывод в консоль + авто-действия

// Флаг: ожидаем INPUT диалог розыска после выбора "ввести вручную"
let _awaitingRoziskInput = false;

// ── /wanted список: сохраняем ID игроков при открытии диалога ──
let _wantedDialogId = null;      // ID серверного диалога /wanted
let _wantedPlayers = [];         // [ { nick, id }, ... ] — в порядке строк

const _dlgOrigAddDialogInQueue = window.addDialogInQueue;
window.addDialogInQueue = function(dialogParams, content, priority) {
    try {
        if (dialogParams && typeof dialogParams === 'string') {
            const parsed = JSON.parse(dialogParams.trim());
            const dialogId = parseInt(parsed[0]);
            const style    = parseInt(parsed[1]);
            const title    = (parsed[2] || '').replace(/\{[A-Fa-f0-9]{6}\}/g, '');
            const info     = (parsed[3] || '').replace(/\{[A-Fa-f0-9]{6}\}/g, '');
            const button1  = (parsed[4] || '');
            const button2  = (parsed[5] || '');

            const styleNames = {0:'MSGBOX', 1:'INPUT', 2:'LIST', 3:'PASSWORD', 4:'TABLIST', 5:'TABLIST_HEADERS'};

            let contentText = '';
            if (content) {
                const raw = Array.isArray(content) ? content.join('') : String(content);
                contentText = raw
                    .replace(/<t>/gi, ' | ')
                    .replace(/\{[A-Fa-f0-9]{6}\}/g, '')
                    .replace(/<br\s*\/?>/gi, '\n')
                    .replace(/<[^>]+>/g, '')
                    .split('<n>').join('\n')
                    .trim();
            }

            console.log(
                `[DIALOG] id=${dialogId} style=${styleNames[style] || style}\n` +
                `  Заголовок: ${title}\n` +
                `  Инфо: ${info}\n` +
                (contentText ? `  Контент:\n${contentText.split('\n').map(l => '    ' + l).join('\n')}\n` : '') +
                `  Кнопки: [${button1}] [${button2}]`
            );

            // ── Трекинг пагинированных диалогов для Q/E перелистывания ──
            if (PAGINATED_DIALOG_IDS.includes(dialogId)) {
                _lastPaginatedDialogId = dialogId;
                console.log(`[Q/E] Открыт пагинированный диалог ${dialogId}`);
            } else {
                _lastPaginatedDialogId = null;
            }

            // ── Авто-снаряжение МВД: LIST "Полицейская служба" (id=0) ──
            if (style === 2 && dialogId === 0 && title.includes('Полицейская служба') && window.AUTO_GRAB && typeof window.autoGrab === 'function') {
                if (!window._mvdGrabProcessing) {
                    console.log('=== [MVD-GRAB v2.1] 🎯 ТРИГГЕР СРАБОТАЛ — Полицейская служба ===');
                    setTimeout(() => window.autoGrab(), 150);
                }
            }

            // ── /wanted: TABLIST_HEADERS "Список разыскиваемых" — сохраняем игроков ──
            if ((style === 4 || style === 5) && title.includes('разыскиваемых')) {
                _wantedDialogId = dialogId;
                _wantedPlayers = [];
                if (content) {
                    const raw = Array.isArray(content) ? content.join('') : String(content);
                    // Строки разделены <n>, каждая строка: "Ник[ID]<t>Дистанция" или "Ник[ID]	Дистанция"
                    const rows = raw.split('<n>');
                    rows.forEach(row => {
                        // Извлекаем Ник[ID] из строки — формат "Nick_Name[123]"
                        const m = row.match(/([A-Za-z0-9_]+)\[(\d+)\]/);
                        if (m) _wantedPlayers.push({ nick: m[1], id: m[2] });
                    });
                }
                console.log(`[WANTED] Диалог id=${dialogId}, игроков: ${_wantedPlayers.length}`, _wantedPlayers.map(p => p.nick + '[' + p.id + ']').join(', '));
            }

            // ── Авто-розыск: LIST "Причина выдачи розыска" → выбрать "Ввести вручную" ──
            // Срабатывает ТОЛЬКО если /su был отправлен через наш диалог (пункт 14 меню)
            if (style === 2 && title.includes('Причина выдачи розыска') && _autoWantedActive) {
                _autoWantedActive = false; // сбрасываем — чтоб следующий ручной /su не сработал
                console.log('[AUTO-РОЗЫСК] Обнаружен диалог выбора причины — авто-выбор "Ввести в ручную"');
                _awaitingRoziskInput = true;
                setTimeout(() => {
                    // listitem=1 — второй пункт ("Ввести причину в ручную"), response=1
                    sendClientEvent(
                        (window.gm && window.gm.EVENT_EXECUTE_PUBLIC !== undefined)
                            ? window.gm.EVENT_EXECUTE_PUBLIC
                            : 'server',
                        'OnDialogResponse', dialogId, 1, 1, ''
                    );
                    console.log('[AUTO-РОЗЫСК] Отправлен выбор пункта 2 (ввести вручную)');
                }, 200);
            }

            // ── Авто-розыск: INPUT "Причина выдачи розыска" → вставить причину и закрыть диалог ──
            if (style === 1 && title.includes('Причина выдачи розыска') && _awaitingRoziskInput) {
                _awaitingRoziskInput = false;
                const reason = lastWantedCode || '1.1 УК';
                const _roziskDialogId = dialogId;
                console.log(`[AUTO-РОЗЫСК] Обнаружен INPUT диалог — авто-ввод причины "${reason}"`);
                setTimeout(() => {
                    // Отправляем ответ серверу напрямую через оригинальный обработчик
                    _origSendClientEventHandle.call(
                        window,
                        (window.gm && window.gm.EVENT_EXECUTE_PUBLIC !== undefined)
                            ? window.gm.EVENT_EXECUTE_PUBLIC
                            : 'server',
                        'OnDialogResponse', _roziskDialogId, 1, 0, reason
                    );
                    console.log(`[AUTO-РОЗЫСК] Причина "${reason}" отправлена`);
                    lastWantedCode = null;
                    // Закрываем UI диалога несколькими способами
                    setTimeout(() => {
                        try { if (typeof window.removeDialogFromQueue === 'function') window.removeDialogFromQueue(); } catch(e) {}
                        try { if (typeof window.closeDialog === 'function') window.closeDialog(); } catch(e) {}
                        try {
                            const dlgInterface = window.interface && window.interface('Dialog');
                            if (dlgInterface && typeof dlgInterface.close === 'function') dlgInterface.close();
                            if (dlgInterface && typeof dlgInterface.hide === 'function') dlgInterface.hide();
                        } catch(e) {}
                        // Эмулируем нажатие ESC для закрытия диалога
                        try {
                            const escEvent = new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true });
                            document.dispatchEvent(escEvent);
                        } catch(e) {}
                        console.log('[AUTO-РОЗЫСК] Диалог закрыт');
                    }, 100);
                }, 300);
            }
        }
    } catch (err) {
        console.error('[DIALOG] Ошибка перехвата:', err.message);
    }
    return _dlgOrigAddDialogInQueue.call(this, dialogParams, content, priority);
};

console.log('[DIALOG MONITOR] Загружен. Все диалоги выводятся в консоль.');
// ==================== END DIALOG MONITOR ====================

// ==================== АВТОБРАНИЕ МВД ====================
// Авто-снаряжение — включается только если AUTO_GRAB === true
// (LoadAhk патчит константы ниже перед eval)
// Используем var чтобы избежать SyntaxError при повторном объявлении через eval
var AUTO_GRAB = false;
var AUTO_GRAB_SKIP = [];
// Явно пишем в window чтобы showMvdSubMenu (загруженный ДО eval) видел значение
window.AUTO_GRAB = AUTO_GRAB;
window.AUTO_GRAB_SKIP = AUTO_GRAB_SKIP;
// Проверяем и локальную переменную и window (на случай если патч LoadAhk сработал через window)
if (AUTO_GRAB || window.AUTO_GRAB === true) {
(function() {
    console.log('=== [MVD-GRAB v2.1] 🔫 БЛОК AUTO_GRAB ЗАПУЩЕН ===');
    window.AUTO_GRAB = true; // гарантируем что window.AUTO_GRAB = true внутри блока

    // ==================== ID ПРЕДМЕТОВ ====================
    const ITEM = {
        DEAGLE:      19,   // Desert Eagle
        AMMO_MAGNUM: 363,  // Патроны .44 Magnum
        AKM:         21,   // АКМ
        AMMO_762:    368,  // Патроны 7.62x39
        BATON:       32,   // Дубинка
        MEDKIT:      2,    // Аптечка
        PAINKILLERS: 379,  // Обезболивающее
        RADAR_GUN:   276,  // Тауметр
        DIAGNOSTICS: 254,  // Набор диагностики
        TASER:       13,   // Тазер
        AKS74U:      18,   // АКС-74У
        REMINGTON:   14,   // Remington 870
        AMMO_545:    366,  // Патроны 5.45x39
        AMMO_1270:   365,  // Патроны 12x70
    };

    // ==================== ПОРОГИ ПАТРОНОВ ====================
    const AMMO_THRESHOLD = { MAGNUM: 30, AK762: 60, AKS545: 60, REM1270: 20 };

    // ==================== ПОЗИЦИИ В МЕНЮ МВД (0-based) ====================
    const MENU = {
        PAINKILLERS:  0,
        MEDKIT:       1,
        BATON:        2,
        WAND:         3,
        VEST:         4,
        RADAR_GUN:    5,
        DIAGNOSTICS:  6,
        TASER:        7,
        DEAGLE:       8,
        AKM:          9,
        AKS74U:      10,
        REMINGTON:   11,
        AMMO_MAGNUM: 12,
        AMMO_762:    13,
        AMMO_545:    14,
        AMMO_1270:   15,
    };

    const DIALOG_ID = 0;
    const CT = { ACC: 0, INV: 1, BACK: 2, EXTRA: 3 };

    let isProcessing = false;

    function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

    function notify(title, text, color = "FFFFFF") {
        snAdd(`[1, "${title}", "${text}", "${color}", 2500]`);
    }

    // ==================== БРОНЯ ЧЕРЕЗ ХУД ====================
    function getArmourValue() {
        try {
            const hud = window.interface("Hud");
            if (!hud) return 0;
            const armour = hud.$data?.info?.armour ?? hud.data?.info?.armour ?? 0;
            return Number(armour) || 0;
        } catch(e) { return 0; }
    }

    // ==================== ИНВЕНТАРЬ ====================
    const CT_NAMES_GRAB = { 0: 'ACC', 1: 'INV', 2: 'BACK', 3: 'EXTRA' };

    function logInventoryGrab(label) {
        try {
            const inv = window.interface("InventoryNew");
            if (!inv?.items) { console.log(`[GRAB-LOG] ${label}: items недоступны`); return; }
            const lines = [`[GRAB-LOG] ── ${label} ──`];
            for (const cid of [0, 1, 2, 3]) {
                const c = inv.items[cid];
                if (!c) { lines.push(`  ${CT_NAMES_GRAB[cid]}(${cid}): нет контейнера`); continue; }
                const entries = Object.entries(c);
                if (entries.length === 0) { lines.push(`  ${CT_NAMES_GRAB[cid]}(${cid}): пусто`); continue; }
                for (const [slot, item] of entries) {
                    if (!item) continue;
                    lines.push(`  ${CT_NAMES_GRAB[cid]}(${cid}) slot${slot}: id=${item.id} x${item.count||1} w=${item.weight}`);
                }
            }
            console.log(lines.join('\n'));
        } catch(e) { console.log(`[GRAB-LOG] ${label}: ошибка`, e); }
    }

    function findItem(itemId) {
        try {
            const inv = window.interface("InventoryNew");
            if (!inv?.items) return null;
            for (const cid of [CT.INV, CT.BACK, CT.ACC]) {
                const c = inv.items[cid];
                if (!c) continue;
                for (const [slot, item] of Object.entries(c)) {
                    if (item?.id === itemId) {
                        console.log(`[GRAB] findItem(id=${itemId}): найден в ${CT_NAMES_GRAB[cid]} slot${slot} x${item.count||1}`);
                        return { cid, slot: parseInt(slot), count: item.count || 1 };
                    }
                }
            }
        } catch(e) {}
        console.log(`[GRAB] findItem(id=${itemId}): НЕ НАЙДЕН`);
        return null;
    }

    function countItem(itemId) {
        try {
            const inv = window.interface("InventoryNew");
            if (!inv?.items) return 0;
            let total = 0;
            for (const cid of [CT.INV, CT.BACK]) {
                const c = inv.items[cid];
                if (!c) continue;
                for (const item of Object.values(c)) {
                    if (item?.id === itemId) total += (item.count || 1);
                }
            }
            console.log(`[GRAB] countItem(id=${itemId}): итого x${total}`);
            return total;
        } catch(e) { return 0; }
    }

    function openInventory() {
        console.log('[GRAB] openInventory()');
        sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, "OnInventoryDisplayChange");
    }
    function closeInventory() {
        console.log('[GRAB] closeInventory()');
        window.closeInterface("InventoryNew");
    }

    async function waitInventory(maxMs = 1000) {
        console.log(`[GRAB] waitInventory(${maxMs}ms)...`);
        for (let i = 0; i < maxMs; i += 50) {
            try {
                const inv = window.interface("InventoryNew");
                if (inv?.items?.[CT.INV] !== undefined) {
                    console.log(`[GRAB] waitInventory: готов за ${i}мс`);
                    return true;
                }
            } catch(e) {}
            await sleep(50);
        }
        console.error(`[GRAB] waitInventory: таймаут!`);
        return false;
    }

    // ==================== МЕНЮ ====================
    function take(index) {
        sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, "OnDialogResponse", DIALOG_ID, 1, index, "");
    }

    function closeMenu() {
        sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, "OnDialogResponse", DIALOG_ID, 0, 0, "");
    }

    function openMenu() {
        sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, "OnPlayerClientSideKey", 18);
    }

    // ==================== ОСНОВНАЯ ЛОГИКА ====================
    async function autoGrab() {
        if (typeof autoGrabEnabled !== 'undefined' && !autoGrabEnabled) return;
        if (isProcessing) return;
        isProcessing = true;

        try {
            const armourVal = getArmourValue();

            // ── Шаг 1: открываем инвентарь — диалог меню остаётся открытым ──
            // НЕ закрываем меню перед чтением инвентаря (диалог живой на сервере)
            let ready = false;
            for (let attempt = 0; attempt < 2 && !ready; attempt++) {
                if (attempt > 0) await sleep(300);
                openInventory();
                ready = await waitInventory(1500);
            }
            if (!ready) {
                notify("Ошибка", "Инвентарь не открылся", "FF0000");
                isProcessing = false;
                return;
            }

            // ── Шаг 2: читаем что нужно ──
            logInventoryGrab('GRAB ДО ВЗЯТИЯ');
            const skipList = (typeof AUTO_GRAB_SKIP !== 'undefined' && AUTO_GRAB_SKIP.length) ? AUTO_GRAB_SKIP : ((typeof window._mvdGrabSkip !== 'undefined') ? window._mvdGrabSkip : []);
            const skip = (key) => skipList.includes(key);
            console.log(`[GRAB] skipList:`, skipList);

            const has = {
                medkit:      skip('medkit')      ? 999 : (findItem(ITEM.MEDKIT)      ? 1 : 0),
                baton:       skip('baton')       ? 1   : (findItem(ITEM.BATON)       ? 1 : 0),
                vest:        skip('vest') ? 100 : armourVal,
                deagle:      skip('deagle')      ? 1   : (findItem(ITEM.DEAGLE)      ? 1 : 0),
                magnum:      skip('magnum')      ? 999 : countItem(ITEM.AMMO_MAGNUM),
                akm:         skip('akm')         ? 1   : (findItem(ITEM.AKM)         ? 1 : 0),
                ammo762:     skip('ammo762')     ? 999 : countItem(ITEM.AMMO_762),
                painkillers: skip('painkiller')  ? 1   : (findItem(ITEM.PAINKILLERS) ? 1 : 0),
                radarGun:    skip('taumeter')    ? 1   : (findItem(ITEM.RADAR_GUN)   ? 1 : 0),
                diagnostics: skip('diag')        ? 1   : (findItem(ITEM.DIAGNOSTICS) ? 1 : 0),
                taser:       skip('taser')       ? 1   : (findItem(ITEM.TASER)       ? 1 : 0),
                aks74u:      skip('aks74u')      ? 1   : (findItem(ITEM.AKS74U)      ? 1 : 0),
                ammo545:     skip('ammo545')     ? 999 : countItem(ITEM.AMMO_545),
                remington:   skip('remington')   ? 1   : (findItem(ITEM.REMINGTON)   ? 1 : 0),
                ammo1270:    skip('ammo12x70')   ? 999 : countItem(ITEM.AMMO_1270),
                wand:        skip('baton2')      ? 1   : 0, // жезл — нет ID, берём всегда
            };

            const need = {
                painkillers: !has.painkillers,
                medkit:      has.medkit < 1,
                baton:       !has.baton,
                wand:        !has.wand,
                vest:        has.vest < 10,
                radarGun:    !has.radarGun,
                diagnostics: !has.diagnostics,
                taser:       !has.taser,
                deagle:      !has.deagle,
                magnum:      has.magnum < AMMO_THRESHOLD.MAGNUM,
                akm:         !has.akm,
                ammo762:     has.ammo762 < AMMO_THRESHOLD.AK762,
                aks74u:      !has.aks74u,
                ammo545:     has.ammo545 < AMMO_THRESHOLD.AKS545,
                remington:   !has.remington,
                ammo1270:    has.ammo1270 < AMMO_THRESHOLD.REM1270,
            };

            console.log('[GRAB] has:', JSON.stringify(has));
            console.log('[GRAB] need:', JSON.stringify(need));

            // ── Шаг 3: запоминаем свободные слоты и закрываем инвентарь ──
            // Сохраняем список свободных INV-слотов — используем в шаге 5
            const freeInvSlots = [];
            const freeBACKSlots = [];
            try {
                const inv0 = window.interface("InventoryNew");
                if (inv0?.items) {
                    const invMap  = inv0.items[CT.INV]  || {};
                    const backMap = inv0.items[CT.BACK] || {};
                    for (let s = 0; s < 20; s++) if (!invMap[s])  freeInvSlots.push(s);
                    for (let s = 0; s < 50; s++) if (!backMap[s]) freeBACKSlots.push(s);
                }
            } catch(e) {}
            console.log(`[GRAB] freeInvSlots (до взятия):`, freeInvSlots);
            console.log(`[GRAB] freeBACKSlots (до взятия):`, freeBACKSlots);
            closeInventory();
            await sleep(150);

            if (!Object.values(need).some(Boolean)) {
                notify("МВД", "Всё снаряжение есть ✓", "00FF00");
                isProcessing = false;
                return;
            }

            // ── Шаг 4: диалог открыт, сразу берём — НЕ переоткрываем меню ──

            // ── Тазер всегда живёт в рюкзаке (Alt+H только двигает дигл).
            //    need.taser будет false если тазер уже в рюкзаке — пост-обработка не нужна.

            const toTake = [];
            if (need.painkillers) toTake.push({ name: "Обезболивающее",                          idx: MENU.PAINKILLERS });
            if (need.medkit)      toTake.push({ name: "Аптечка",                                 idx: MENU.MEDKIT });
            if (need.baton)       toTake.push({ name: "Дубинка",                                 idx: MENU.BATON });
            if (need.wand)        toTake.push({ name: "Жезл",                                    idx: MENU.WAND });
            if (need.vest)        toTake.push({ name: `Бронежилет (${armourVal}%)`,              idx: MENU.VEST });
            if (need.radarGun)    toTake.push({ name: "Тауметр",                                 idx: MENU.RADAR_GUN });
            if (need.diagnostics) toTake.push({ name: "Диагностика",                             idx: MENU.DIAGNOSTICS });
            if (need.deagle)      toTake.push({ name: "Desert Eagle",                            idx: MENU.DEAGLE });
            if (need.taser)       toTake.push({ name: "Тазер",                                   idx: MENU.TASER });
            if (need.magnum)      toTake.push({ name: `Патроны .44 (есть: ${has.magnum})`,       idx: MENU.AMMO_MAGNUM });
            if (need.akm)         toTake.push({ name: "АКМ",                                     idx: MENU.AKM });
            if (need.ammo762)     toTake.push({ name: `Патроны 7.62 (есть: ${has.ammo762})`,     idx: MENU.AMMO_762 });
            if (need.aks74u)      toTake.push({ name: "АКС-74У",                                 idx: MENU.AKS74U });
            if (need.ammo545)     toTake.push({ name: `Патроны 5.45 (есть: ${has.ammo545})`,     idx: MENU.AMMO_545 });
            if (need.remington)   toTake.push({ name: "Remington 870",                           idx: MENU.REMINGTON });
            if (need.ammo1270)    toTake.push({ name: `Патроны 12x70 (есть: ${has.ammo1270})`,   idx: MENU.AMMO_1270 });

            console.log(`[GRAB] toTake:`, toTake.map(t => `${t.name}(idx=${t.idx})`).join(', '));

            for (let i = 0; i < toTake.length; i++) {
                const delay = Math.floor(Math.random() * 700) + 500; // рандом 500–1200мс
                console.log(`[MVD-GRAB] → беру: ${toTake[i].name} (idx=${toTake[i].idx}) [задержка: ${delay}мс]`);
                take(toTake[i].idx);
                await sleep(delay); // случайная задержка между предметами
            }

            const notifyNames = toTake.map(t => t.name.replace(/ \(есть: \d+\)/, ''));
            notify("МВД", notifyNames.join(", "), "00FF00");
            window.playSound("inventory/take_light.mp3");

        } catch (err) {
            console.error('[MVD-GRAB] Ошибка:', err);
            notify("Ошибка", err.message, "FF0000");
        } finally {
            isProcessing = false;
        }
    }

    // ==================== ТРИГГЕР ====================
    // Авто-снаряжение запускается из общего хука addDialogInQueue (строка ~1541)
    // который ловит диалог style=LIST title="Полицейская служба" и вызывает window.autoGrab().
    // Публикуем autoGrab и флаг isProcessing через window._mvdGrabProcessing.
    window.autoGrab = autoGrab;
    Object.defineProperty(window, '_mvdGrabProcessing', {
        get: () => isProcessing,
        configurable: true
    });
    console.log('=== [MVD-GRAB v2.1] ✅ ГОТОВ — жду диалог Полицейская служба ===');
})();
} // end if (AUTO_GRAB)
// ==================== END АВТОБРАНИЕ МВД ====================

// ==================== СВОП ТАЗЕР ↔ ДИГЛ (v15 — polling) ====================
(function() {
    const ITEM_DEAGLE = 19;
    const CT = { ACC: 0, INV: 1, BACK: 2, EXTRA: 3 };
    const CT_NAMES = { 0: 'ACC', 1: 'INV', 2: 'BACK', 3: 'EXTRA' };

    let _busy = false;
    let _busyTimer = null;

    function clearBusy() {
        clearTimeout(_busyTimer);
        _busy = false;
        console.log('[SWAP] готов');
    }

    function findItem(items, itemId) {
        for (const cid of [CT.INV, CT.BACK, CT.ACC, CT.EXTRA]) {
            const c = items[cid];
            if (!c) continue;
            for (const [slot, item] of Object.entries(c)) {
                if (item?.id === itemId) {
                    const loc = { cid, slot: parseInt(slot), count: item.count || 1 };
                    console.log(`[SWAP] findItem(Дигл): ${CT_NAMES[cid]} slot${loc.slot} x${loc.count}`);
                    return loc;
                }
            }
        }
        return null;
    }

    function findFreeSlot(items, targetCid) {
        const container = items[targetCid];
        if (!container) return 0;
        for (let s = 0; s < 50; s++) {
            if (!container[s]) {
                console.log(`[SWAP] freeSlot(${CT_NAMES[targetCid]}): ${s}`);
                return s;
            }
        }
        return -1;
    }

    function tryGetItems() {
        try {
            const inv = window.interface('InventoryNew');
            // items доступны только когда инвентарь открыт и Vue компонент смонтирован
            const items = inv?.items;
            if (!items) return null;
            // проверяем что хотя бы один контейнер есть
            if (items[CT.INV] !== undefined || items[CT.BACK] !== undefined) return items;
        } catch(e) {}
        return null;
    }

    function swapTaserDeagle() {
        if (_busy) {
            console.log('[SWAP] занят, пропуск');
            return;
        }
        _busy = true;
        _busyTimer = setTimeout(() => {
            if (_busy) { _busy = false; console.log('[SWAP] таймаут сброса'); }
        }, 5000);

        console.log('[SWAP] открываем инвентарь...');
        sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, 'OnInventoryDisplayChange');

        // Polling: ждём пока items появятся (инвентарь открылся)
        let attempts = 0;
        const maxAttempts = 40; // 40 * 50ms = 2 секунды
        const poll = setInterval(() => {
            attempts++;
            const items = tryGetItems();

            if (!items) {
                if (attempts >= maxAttempts) {
                    clearInterval(poll);
                    console.log('[SWAP] items не появились, отмена');
                    sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, 'OnInventoryDisplayChange');
                    snAdd('[1, "СВОП", "Ошибка: инвентарь не открылся", "FF0000", 3000]');
                    clearBusy();
                }
                return;
            }

            clearInterval(poll);
            console.log(`[SWAP] items получены (попытка ${attempts})`);

            const deagleLoc = findItem(items, ITEM_DEAGLE);
            if (!deagleLoc) {
                console.log('[SWAP] дигл не найден');
                sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, 'OnInventoryDisplayChange');
                snAdd('[1, "СВОП", "Дигл не найден в инвентаре", "FF4400", 3000]');
                clearBusy();
                return;
            }

            let fromCid, toCid;
            if (deagleLoc.cid === CT.INV) {
                fromCid = CT.INV; toCid = CT.BACK;
            } else if (deagleLoc.cid === CT.BACK) {
                fromCid = CT.BACK; toCid = CT.INV;
            } else {
                console.log('[SWAP] дигл не в INV/BACK');
                sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, 'OnInventoryDisplayChange');
                clearBusy();
                return;
            }

            const toSlot = findFreeSlot(items, toCid);
            if (toSlot < 0) {
                console.log('[SWAP] нет свободного слота');
                sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, 'OnInventoryDisplayChange');
                snAdd('[1, "СВОП", "Нет свободного слота!", "FF4400", 3000]');
                clearBusy();
                return;
            }

            const direction = (fromCid === CT.INV) ? 'Дигл -> Рюкзак' : 'Дигл -> Инвентарь';
            console.log(`[SWAP] ${CT_NAMES[fromCid]}[${deagleLoc.slot}] -> ${CT_NAMES[toCid]}[${toSlot}]`);
            sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, 'OnInventoryItemMove',
                fromCid, deagleLoc.slot, toCid, toSlot, deagleLoc.count);

            // Закрываем инвентарь через 150мс после хода
            setTimeout(() => {
                sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, 'OnInventoryDisplayChange');
                snAdd(`[1, "СВОП", "${direction}", "00CC44", 2000]`);
                clearBusy();
            }, 150);

        }, 50);
    }

    window._mvdSwapTaserDeagle = swapTaserDeagle;
    console.log('[SWAP] v15 готов');
})();
// ==================== END СВОП ТАЗЕР ↔ ДИГЛ ====================
