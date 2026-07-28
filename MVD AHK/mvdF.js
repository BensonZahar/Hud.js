// ⚠️ ЧТО ЭТО ЗА ФАЙЛ mvdF.js — ПОМОЩНИК ДЛЯ ТЕСТИРОВАНИЯ МВД И ФУНКЦИЙ ДЛЯ РАЗРАБОТЧИКОВ ИГРЫ.

// ПРОВЕРКА НИКА Добавляй/убирай ники здесь.
const NICK_CHECK_ENABLED = true; // ← поменяй на true чтобы включить проверку

const _ALLOWED_NICKS = [
    "Zahar_Konstov",
    "Maxim_Vortex",
    "Denis_Galievskiy",
    "Cosmos_Dissapointed",
	"Egor_Hlebov",
	"Artemka_Hasanov",
	"Lev_Bennet",
	"Andrey_Pulya",
//  "Maksimka_DeMontana",
	"Kirill_Dogadin",
	"Cooper_Lorenzo"
];

// Показ уведомления о запрете доступа Пытаемся показать фирменное ZKM-уведомление.
function _showAccessDenied(nick) {
    var title = "AHK — Доступ запрещён";
    var text  = "Вашего никнейма (" + nick + ") нет в списке доступа AHK. Обратитесь к создателю.";
    var shown = false;

    function tryShow() {
        if (shown) return;
        // 1) Пробуем ZKM-уведомление (красивое, сверху экрана)
        var sn = window.ZkmScreenNotification;
        if (sn && typeof sn.add === 'function') {
            try {
                sn.add('[1, "' + title + '", "' + text + '", "FF3333", 15000]');
                shown = true;
                console.warn('[mvdF] 🚫 Доступ запрещён: ник "' + nick + '" не в списке.');
                return;
            } catch (e) {}
        }
        // 2) Fallback — сообщение в чат (работает всегда)
        if (typeof window.onChatMessage === 'function') {
            try {
                window.onChatMessage('{FF3333}[AHK] {FFFFFF}' + title + ': ' + text, [0, 0, 'FF3333']);
                shown = true;
                console.warn('[mvdF] 🚫 Доступ запрещён (fallback в чат): ник "' + nick + '".');
                return;
            } catch (e) {}
        }
    }

    // Первая попытка сразу
    tryShow();

    // Если не получилось — повторяем каждые 500мс до 5 секунд
    // (даём время загрузиться ZkmScreenNotification.js)
    if (!shown) {
        var attempts = 0;
        var retryTimer = setInterval(function() {
            attempts++;
            tryShow();
            if (shown || attempts >= 10) {
                clearInterval(retryTimer);
                if (!shown) {
                    // Совсем крайний случай — просто в консоль
                    console.warn('[mvdF] 🚫 Доступ запрещён: ник "' + nick + '" не в списке. (Уведомление показать не удалось)');
                }
            }
        }, 500);
    }
}

(function _nickCheck(callback) {
    // Если проверка отключена — сразу запускаем скрипт для всех
    if (!NICK_CHECK_ENABLED) {
        console.log('[mvdF] ⚠️ Проверка ника ОТКЛЮЧЕНА (NICK_CHECK_ENABLED = false) — скрипт доступен всем.');
        callback();
        return;
    }

    function getNick() {
        try {
            var n = window.App && window.App.$store &&
                    window.App.$store.getters &&
                    window.App.$store.getters['player/nickName'];
            // Игнорируем дефолтное значение стора ("Name_Surname")
            if (n && n !== "Name_Surname") return n;
            return null;
        } catch (e) { return null; }
    }

    var nick = getNick();
    if (nick) {
        if (_ALLOWED_NICKS.indexOf(nick) !== -1) {
            callback();
        } else {
            _showAccessDenied(nick);
        }
        return;
    }

    // Стор ещё не готов — ждём до 30 секунд
    var attempts = 0;
    var timer = setInterval(function() {
        attempts++;
        var n = getNick();
        if (n) {
            clearInterval(timer);
            if (_ALLOWED_NICKS.indexOf(n) !== -1) {
                callback();
            } else {
                _showAccessDenied(n);
            }
        } else if (attempts >= 60) { // 60 × 500мс = 30 сек
            clearInterval(timer);
            console.warn('[mvdF] Не удалось получить ник — скрипт не запущен.');
        }
    }, 500);
})(function() {
// ПРЕФЕТЧ ВСЕХ КАСТОМНЫХ ИНТЕРФЕЙСОВ С GITHUB Грузим 5 файлов параллельно при старте игры.
(function prefetchAllCustomUI() {
    var BASE = 'https://raw.githubusercontent.com/BensonZahar/Hud.js/main/MVD%20AHK/'
             + encodeURIComponent('Кастом Интерфейсы') + '/';
    var FILES = {
        mvdmenu_js:  BASE + 'MvdMenu.js',
        advmenu_js:  BASE + 'AdvMenu.js',
        zkm_js:      BASE + 'zkm.js',
        zkm_css:     BASE + 'zkm.css',
        zkmsn_js:    BASE + 'ZkmScreenNotification.js',
        zkmsn_css:   BASE + 'ZkmScreenNotification.css',
        dokladi_js:  BASE + 'dokladi.js',
        dokladi_css: BASE + 'dokladi.css'
    };
    var RETRIES = 5, BASE_DELAY = 1000;

    function xhrGet(url, attempt) {
        return new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url + '?_=' + Date.now(), true);
            xhr.onload = function() {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.responseText);
                } else if (attempt < RETRIES) {
                    var d = Math.min(BASE_DELAY * Math.pow(2, attempt), 16000);
                    setTimeout(function() { xhrGet(url, attempt + 1).then(resolve, reject); }, d);
                } else reject(new Error('HTTP ' + xhr.status));
            };
            xhr.onerror = function() {
                if (attempt < RETRIES) {
                    var d = Math.min(BASE_DELAY * Math.pow(2, attempt), 16000);
                    setTimeout(function() { xhrGet(url, attempt + 1).then(resolve, reject); }, d);
                } else reject(new Error('Network'));
            };
            xhr.send();
        });
    }

    var promises = {};
    for (var key in FILES) {
        (function(k) {
            promises[k] = xhrGet(FILES[k], 0)
                .then(function(text) {
                    window['__prefetch_' + k] = text;
                    console.log('[mvdF] ✅ префетч ' + k + ' (' + text.length + ' байт)');
                    return text;
                })
                .catch(function(e) {
                    console.warn('[mvdF] ⚠️ префетч ' + k + ' не удался:', e.message);
                    window['__prefetch_' + k + '_failed'] = true;
                });
        })(key);
    }

    // Сохраняем общий Promise чтобы локальные загрузчики могли await-нуть
    window.__prefetch_promise = Promise.allSettled(Object.values(promises))
        .then(function() {
            console.log('[mvdF] 🎯 все префетчи завершены');
        });
})();
// END ПРЕФЕТЧ Загрузчик startup-интерфейсов Вставить в НАЧАЛО mvdF.js.
;(function loadStartupInterfaces() {
    var ifaces = window._duranCustomInterfaces;
    if (!ifaces || !ifaces.length) return;

    ifaces.forEach(function (iface) {
        if (!iface.startup) return;
        (iface.files || []).forEach(function (filename) {
            var ext = filename.split('.').pop().toLowerCase();
            if (ext === 'css') {
                var link  = document.createElement('link');
                link.rel  = 'stylesheet';
                link.href = './' + filename;
                document.head.appendChild(link);
            } else if (ext === 'js') {
                var script = document.createElement('script');
                script.src = './' + filename;
                document.head.appendChild(script);
            }
        });
    });
})();
// ── конец загрузчика ──────────────────────────────────────────────────


// ── ВСЁ ЧТО НИЖЕ ВЫПОЛНЯЕТСЯ ТОЛЬКО ЕСЛИ НИК ПРОШЁЛ ПРОВЕРКУ ──

// MVD AHK VERSION: 2.3 (NAPARNICK)
console.log("[INIT] === MVD AHK v0.6 ЗАГРУЖЕН ===");
// Надёжное получение своего ID через список игроков window.updatePlayerList() дёргает движковое событие "UpdatePlayersList", ответ на котор...
let cachedMyId = 0;
const _origOnUpdatePlayersList = window.onUpdatePlayersList;
window.onUpdatePlayersList = function(e) {
    try {
        if (e && e.local && e.local.id !== undefined && e.local.id !== null) {
            const id = parseInt(e.local.id, 10);
            if (!isNaN(id) && id > 0) {
                cachedMyId = id;
            }
        }
    } catch(err) {
        console.warn('[MVD] Ошибка чтения local.id из onUpdatePlayersList:', err);
    }
    if (typeof _origOnUpdatePlayersList === 'function') {
        return _origOnUpdatePlayersList.apply(this, arguments);
    }
};

// Получить свой ID: кэш из списка игроков, либо фолбэк на HUD
function getMyId() {
    if (cachedMyId > 0) return cachedMyId;
    try {
        const hud = window.interface && window.interface("Hud");
        if (hud && hud.info && hud.info.id) {
            return parseInt(hud.info.id, 10) || 0;
        }
    } catch(e) {
        console.warn('[MVD] Ошибка получения ID из Hud:', e);
    }
    return 0;
}

// ── Авто-обновление собственного ID (каждые 30 секунд) ──
setInterval(function() {
    try {
        if (window.updatePlayerList) window.updatePlayerList();
    } catch(e) {}
}, 30000);
// Первый запрос — через 1 секунду после загрузки
setTimeout(function() {
    try { if (window.updatePlayerList) window.updatePlayerList(); } catch(e) {}
}, 1000);
// 1. СНАЧАЛА объявляем все константы и массивы
const mvdSkins = [15321, 15323, 15325, 15330, 15332, 15334, 15335, 190, 148, 15340, 15341, 15342, 15343, 15344, 15348, 15351];

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
        console.log(`[SKIN] Ошибка при получении Skin ID: ${e.message}`);
        return null;
    }
}
// 4. Функция отслеживания скина (ИСПРАВЛЕНА)
function trackSkinId() {
    const currentSkin = getSkinIdFromStore();
    if (currentSkin !== null) {
        const numericSkin = Number(currentSkin);
        // ВАЖНО: сравниваем уже приведённые к числу значения,
        // иначе store иногда отдаёт строку и проверка ложно
        // считает это "изменением" скина каждый цикл опроса
        if (numericSkin !== skinId) {
            skinId = numericSkin;
            window._mvdSkinId = skinId; // FIX: прокидываем наружу для MvdMenu.js (проверка исключения СОБР для greeting)

            console.log(`[SKIN] 🔍 Новый Skin ID обнаружен: ${skinId}`);

            // Проверяем, является ли скин МВД
            if (mvdSkins.includes(skinId)) {
                console.log(`[SKIN] ✅ Скин ${skinId} - это МВД скин!`);
            } else {
                console.log(`[SKIN] ❌ Скин ${skinId} НЕ входит в список МВД`);
            }
        }
    }
    setTimeout(trackSkinId, 5000);
}
// 5. ЗАПУСК после загрузки
setTimeout(() => {
    console.log('[SKIN] 🚀 Запуск отслеживания скина МВД...');
    const initialSkin = getSkinIdFromStore();
    if (initialSkin !== null) {
        // Приводим к числу сразу
        skinId = Number(initialSkin);
        window._mvdSkinId = skinId; // FIX: прокидываем наружу для MvdMenu.js
        console.log(`[SKIN] 📌 Начальный Skin ID: ${skinId}`);
    
        if (mvdSkins.includes(skinId)) {
            console.log(`[SKIN] ✅ Скин ${skinId} в списке МВД - меню /dahk доступно`);
        } else {
            console.log(`[SKIN] ⚠️ Скин ${skinId} не является МВД скином`);
        }
    } else {
        console.log('[SKIN] ❌ Не удалось получить начальный Skin ID');
    }
    trackSkinId();
}, 500);
let trackingName = `Отслеживание | {FF0000}Выкл`;
let autoCuffName = `Auto-cuff | {FF0000}Выкл`;
let autoGrabEnabled = true;
let autoGrabName = `Авто-снаряжение | {00FF00}Вкл`;
const povsednevOptions = [
    { name: "1. Приветствие", action: "greeting", needsId: true },
    { name: "2. Проверка документов", action: "checkDocuments" },
    { name: "3. Изучение документов", action: "studyDocuments" },
    { name: "4. Сканирование", action: "scanningTablet" },
    { name: "5. Надевание наручников", action: "cuffing", needsId: true },
    { name: "6. Посадка в машину", action: "putInCar", needsId: true },
    { name: "7. Доставка в участок", action: "arrest", needsId: true },
    { name: "8. Снятие наручников", action: "uncuffing", needsId: true },
    { name: "9. Преследование преступника", action: "chase", needsId: true },
    { name: "10. Обыск", action: "search", needsId: true },
    { name: "11. Конвоирование", action: "escort", needsId: true },
    { name: "12. Снятие розыска", action: "clearWanted", needsId: true },
    { name: "13. Выдача штрафа [/ticket]", action: "fine" },
    { name: "14. Выдача розыска [/su]", action: "wantedFine" },
    { name: "15. Изъятие веществ", action: "confiscate", needsId: true },
    { name: "16. Разбитие стекла", action: "breakGlass", needsId: true },
    { name: "17. Снятие маски", action: "removeMask" },
    { name: "18. Сканирование отпечатков", action: "fingerprint" },
    { name: "19. Изъятие прав", action: "takeLicense", needsId: true },
    { name: "20. Права Миранды", action: "miranda" }
];
const ITEMS_PER_PAGE = 7;
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
let currentPage = 0;
let shownLicenseTypes = [];
let shownMvdSubTypes = [];
let lastMenuType = null; // "povsednev" or "omon" or null
let giveLicenseTo = -1;
let targetId = null;
let currentMenu = null;
let currentSubMenu = null;
let currentAction = null;
let scanInterval = null;
let setmarkInterval = null;
let pgInterval = null;
let trackingNotificationOpen = false;
let chaseNotificationOpen = false;
let trackingNickname = null;
let trackingLevel  = null;   // уровень отслеживаемого игрока (из списка)
let trackingDevice = null;   // 'Radmir' (ПК) или 'Hassle' (телефон)
let lastFineTimerOpenAt = 0; // защита от повторного открытия таймера на радио-дубль сообщения
let fineTimerSnId = null;    // id текущего ZKM-таймера КД штрафа (для возможной ручной отмены)
const FINE_CD_TIMER_ENABLED = false; // [ВЫКЛ] таймер КД штрафа временно отключён (убрали КД)
let currentScanId = null;
let autoCuffEnabled = false;
let lastWantedCode = null; // последняя статья УК для авто-подстановки в серверный диалог
let _autoWantedActive = false; // флаг: /su отправлен через меню авторозыска — только тогда авто-причина работает
let lastTakeLicCode = null;    // статья КоАП для авто-подстановки в серверный диалог изъятия прав
let _autoTakeLicActive = false; // флаг: /takelic отправлен через наш диалог → авто-выбор "Водительские права"
let _awaitingTakeLicInput = false; // флаг: ожидаем INPUT диалог "Укажите причину" после выбора лицензии
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
let partnerMessageName = `Сообщение для напарника | {FF0000}Выкл`;
function getPartnerTrackingLabel() {
    if (partnerTrackingEnabled && partnerNick && partnerId) {
        return `Следить: {00FF00}${partnerNick}[${partnerId}]`;
    }
    return `Следить за напарником | {FF0000}Выкл`;
}
function getPartnerMenuLabel() {
    if (partnerTrackingEnabled && partnerNick && partnerId) {
        return `Напарник | {00FF00}${partnerNick}[${partnerId}]`;
    }
    return `Напарник | {FF0000}Выкл`;
}
// КОНЕЦ НАПАРНИК STATE Обновление ID напарника по нику (/id ник) При открытии меню отправляем /id partnerNick вместо /id partnerId.
let _partnerNickSearch = false;       // идёт поиск напарника по нику
let _partnerNickSearchTarget = null;  // ник, который ищём сейчас
function refreshPartnerNickSilent() {
    if (!partnerTrackingEnabled || !partnerNick) return; // нужен ник для поиска
    if (_partnerNickSearch) return; // уже ищем

    // Сначала ищем актуальный ID напарника в списке игроков — без /id в чат
    const foundId = getIdByNickFromList(partnerNick);
    if (foundId !== null) {
        if (String(foundId) !== String(partnerId)) {
            const _oldId = partnerId;
            partnerId = String(foundId);
            console.log(`[PARTNER] 🔄 ID напарника обновлён из списка: ${_oldId} → ${partnerId} (${partnerNick})`);
            snAdd(`[1, "Напарник", "${partnerNick}: ID ${_oldId}→${partnerId}", "00FF00", 3000]`);
        } else {
            console.log(`[PARTNER] ✅ Напарник в сети (список): ${partnerNick}[${partnerId}]`);
        }
        return;
    }

    // Напарник не найден в списке игроков — возможно, вышел из игры
    console.log(`[PARTNER] ⚠️ Напарник ${partnerNick} не найден в списке игроков (возможно, не в сети)`);
    snAdd(`[1, "Напарник", "${partnerNick} — не в сети", "FF4444", 3000]`);
}
// ── END обновление по нику ────────────────────────────────────────────────────
// Хоткей открытия меню МВД — настраивается установщиком через MENU_KEY (по умолчанию Alt+0)
var MENU_KEY = "Alt+0";
// Хоткей авто-выброса из авто — настраивается установщиком через EJECT_KEY
var EJECT_KEY = "Alt+U";
// Скрытые пункты меню «Повседневная» — настраивается установщиком
var MENU_HIDDEN_ITEMS = [];
// Биндинги прямого вызова пунктов меню — настраивается установщиком
// Формат: { "greeting": "Alt+G", "cuffing": "Alt+C", ... }
var MENU_BINDS = {};
// Порядок пунктов меню «Повседневная» — настраивается установщиком
// Формат: ["greeting","cuffing","checkDocuments",...] (пусто = по умолчанию)
var MENU_ORDER = [];
// Пункты меню, после которых шлём "/c 60" и закрываем диалог "Точное время" через 1.5с
// Формат: ["greeting","fine","wantedFine",...] (пусто = выключено везде) — настраивается установщиком
var MENU_TIMER_ITEMS = [];

// Флаг: ждём диалог "Точное время" именно как ОТВЕТ на нашу команду "/c 60" после отыгровки.
let _awaitingTimerDialog = false;
let _timerDialogResetTO = null;

// Таймер после отыгровки: "/c 60" (латинская C, слитно) + автозакрытие диалога "Точное время" Если для конкретного пункта включено в устано...
function runPostActionTimer(actionKey) {
    if (!Array.isArray(MENU_TIMER_ITEMS) || !MENU_TIMER_ITEMS.includes(actionKey)) return;
    sendChatInput("/c 60");
    console.log(`[AHK-TIMER] "${actionKey}": отправлена команда /c 60`);
    // Взводим флаг ожидания — закрыть можно только диалог, пришедший, пока флаг взведён
    _awaitingTimerDialog = true;
    if (_timerDialogResetTO) clearTimeout(_timerDialogResetTO);
    // Если сервер по какой-то причине не прислал диалог за 5с — снимаем флаг,
    // чтобы случайный более поздний "Точное время" не закрылся по ошибке
    _timerDialogResetTO = setTimeout(() => { _awaitingTimerDialog = false; }, 5000);
}

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
            currentAction = _action;
            currentMenu = "povsednev"; // FIX: устанавливаем currentMenu чтобы диалог 668 сработал
            // FIX: СОБР-скин (15340) для greeting не требует ID — как в HandlePovsednevCommand
            var _isOmonSkin = skinId === 15340;
            var _needsIdForThis = _opt.needsId && !(_action === 'greeting' && _isOmonSkin);
            if (_needsIdForThis) {
                // FIX: открываем кастомный экран ввода ID внутри MvdMenu (а не нативный
                // диалог 668), чтобы хоткей вёл себя так же, как обычный клик по пункту меню.
                window._mvdMenuTargetId = null;
                window._mvdMenuDirectAction = _action;
                setTimeout(function(){ window.openInterface('MvdMenu'); }, 50);
            } else if (_action === 'fine') {
                setTimeout(function(){ showKoapTypeMenu(giveLicenseTo || -1); }, 50);
            } else if (_action === 'wantedFine') {
                setTimeout(function(){ showUkInputDialog(giveLicenseTo || -1); }, 50);
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

// ==================== НАТИВНАЯ A/D НАВИГАЦИЯ (TABLIST_HEADERS) ====================
// Диалоги с пагинацией используют стиль 5 (TABLIST_HEADERS) — движок сам добавляет A/D кнопки
// и вызывает OnMultiDialogClickNavigButton при их нажатии
const PAGINATED_DIALOG_IDS = [667];
let _lastPaginatedDialogId = null; // ID последнего открытого пагинированного диалога
let _navPending = false; // флаг: A/D навигация обработана, блокируем следующий OnDialogResponse(response=0)

// Перехватываем нативные A/D кнопки навигации TABLIST_HEADERS диалогов
const _origSendClientEventHandle = window.sendClientEventHandle;
window.sendClientEventHandle = function(event, ...args) {
    if (args[0] === 'OnMultiDialogClickNavigButton') {
        const direction = parseInt(args[1]); // 0 = назад (A), 1 = вперёд (D)
        const dlgId = parseInt(args[2]);
        if (PAGINATED_DIALOG_IDS.includes(dlgId)) {
            _navPending = true;
            setTimeout(() => { _navPending = false; }, 300); // сброс на случай если OnDialogResponse не пришёл
            console.log(`[NAV] A/D dlg=${dlgId} dir=${direction}`);
            if (direction === 1) {
                // D — следующая страница
                currentPage++;
            } else {
                // A — предыдущая страница или выход в родительское меню
                if (currentPage > 0) {
                    currentPage--;
                } else {
                    // Первая страница — выход назад
                    currentPage = 0;
                    if (dlgId === 667) {
                        lastMenuType = null; currentMenu = null;
                        setTimeout(() => showMvdSubMenu(giveLicenseTo), 50);
                    }
                    return;
                }
            }
            // Перезагружаем текущее меню с новой страницей
            setTimeout(() => {
                if (dlgId === 667) showPovsednevMenuPage(giveLicenseTo);
            }, 50);
            return;
        }
    }
    return _origSendClientEventHandle.call(this, event, ...args);
};
// ==================== END A/D ====================

// ==================== CHAT LOGGING HELPERS ====================
function normalizeColor(color) {
    let normalized = String(color).toUpperCase();
    if (normalized.startsWith('#')) normalized = normalized.slice(1);
    if (normalized.length === 8) normalized = normalized.slice(0, 6);
    return '0x' + normalized;
}
// Экранирует спецсимволы regex (на случай нестандартных ников)
function escapeRegex(str) {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
// ==================== END CHAT LOGGING HELPERS ====================

// ── Поиск ника по ID из актуального списка игроков ────────────────────────
// Возвращает строку-ник или null. Список живёт в window._mvdPlayerList и
// обновляется движком через onUpdatePlayersList (каждые ~30с + по запросу).
function getNickByIdFromList(id) {
    try {
        const list = window._mvdPlayerList;
        if (!list) return null;
        const strId = String(id);
        if (list.local && String(list.local.id) === strId) return list.local.name;
        if (Array.isArray(list.players)) {
            const found = list.players.find(p => String(p.id) === strId);
            return found ? found.name : null;
        }
        return null;
    } catch (e) { return null; }
}

// ── Поиск ID по нику из актуального списка игроков ────────────────────────
// Возвращает числовой/строковый ID или null. Используется там, где раньше
// отправлялась команда /id <ник> ради получения ID через ответ чата.
function getIdByNickFromList(nick) {
    try {
        const list = window._mvdPlayerList;
        if (!list || !nick) return null;
        if (list.local && list.local.name === nick) return list.local.id;
        if (Array.isArray(list.players)) {
            const found = list.players.find(p => p.name === nick);
            return found ? found.id : null;
        }
        return null;
    } catch (e) { return null; }
}

// ── Полная информация об игроке по ID из списка ────────────────────────────
// Возвращает { nick, level, device } где device = 'Radmir' (ПК) или 'Hassle' (телефон).
// Все поля null если игрок не найден в списке.
function getPlayerInfoFromList(id) {
    try {
        const list = window._mvdPlayerList;
        if (!list) return { nick: null, level: null, device: null };
        const strId = String(id);
        let player = null;
        if (list.local && String(list.local.id) === strId) {
            player = list.local;
        } else if (Array.isArray(list.players)) {
            player = list.players.find(p => String(p.id) === strId) || null;
        }
        if (!player) return { nick: null, level: null, device: null };
        return {
            nick:   player.name   || null,
            level:  player.level  != null ? player.level : null,
            device: player.mobile ? 'Hassle' : 'Radmir'
        };
    } catch (e) { return { nick: null, level: null, device: null }; }
}

let _mainChatHandlerReady = false;


const setupChatHandler = () => {
    if (window.interface && window.interface('Hud')?.$refs?.chat?.add) {
        const originalAddFunction = window.interface('Hud').$refs.chat.add;
 
        window.interface('Hud').$refs.chat.add = function(message, ...args) {
            // ========== ЛОГИРОВАНИЕ ЧАТА (как в Code.js) ==========
            try {
                const _msg    = String(message);
                const _color  = args[0];          // первый arg — цвет (если есть)
                const _now    = new Date();
                const _ts     = `${String(_now.getHours()).padStart(2,'0')}:${String(_now.getMinutes()).padStart(2,'0')}:${String(_now.getSeconds()).padStart(2,'0')}`;
                const _actualColor = normalizeColor(_color).replace('0x', '');
                const _colorTag = `[#${_actualColor}]`;
                console.log(`[${_ts}]${_colorTag} ${_msg}`);
            } catch (_e) { /* тихо игнорируем */ }
            // КОНЕЦ ЛОГИРОВАНИЯ ОТМЕНА ПОДТВЕРЖДЕНИЯ ПРОВЕРКИ ДОКУМЕНТОВ Если игрок явно отказался показать документы ("Vlad_Giovanni отказался от Ваше...
            if (typeof message === 'string') {
                if (message.includes('отказался от Вашего предложения') ||
                    message.includes('Игрок слишком далеко') ||
                    message.includes('Такого игрока нет')) {

                    if (_docCheckActive) {
                        console.log('[MVD] 🚫 Проверка документов отменена (отказ/далеко/нет игрока)');
                        _docCheckCleanup();
                        _docCheckHideNotif();
                    }

                    // Гонка: сервер может ответить "слишком далеко" / "такого игрока нет" РАНЬШЕ, чем showDocCheckPrompt() успеет выставить docCheckActive = tr...
                    _docCheckAbortedTargetId = (_docCheckTargetId !== -1)
                        ? _docCheckTargetId
                        : (giveLicenseTo || -1);
                    _docCheckAbortedAt = Date.now();
                }
            }
            // КОНЕЦ ОТМЕНЫ ПОДТВЕРЖДЕНИЯ ОБНОВЛЕНИЕ ID НАПАРНИКА ПО НИКУ (/id ник) Ловим ответ /id partnerNick при авто-обновлении, скрываем из чата.
            if (_partnerNickSearch && _partnerNickSearchTarget && typeof message === 'string') {
                // Формат: "1. {COLOR}Nick{COLOR}, ID: X, ..." или "1. Nick, ID: X, ..."
                const _pNickMatch = message.match(
                    /^\d+\.\s*(?:\{[A-Fa-f0-9]{6,8}\})*([A-Za-z0-9_]+)(?:\{[A-Fa-f0-9]{6,8}\})?,\s*ID:\s*(\d+),/
                );
                if (_pNickMatch) {
                    const _foundNick = _pNickMatch[1];
                    const _foundId   = _pNickMatch[2];
                    if (_foundNick === _partnerNickSearchTarget) {
                        // Это наш напарник — обновляем ID если изменился после рекоша
                        _partnerNickSearch = false;
                        _partnerNickSearchTarget = null;
                        if (String(_foundId) !== String(partnerId)) {
                            const _oldId = partnerId;
                            partnerId = _foundId;
                            console.log(`[PARTNER] 🔄 ID напарника обновлён: ${_oldId} → ${_foundId} (${partnerNick})`);
                            snAdd(`[1, "Напарник", "${partnerNick}: ID ${_oldId}→${_foundId}", "00FF00", 3000]`);
                        } else {
                            console.log(`[PARTNER] ✅ Напарник в сети: ${partnerNick}[${partnerId}]`);
                        }
                    } else {
                        // Другой игрок с похожим ником — ждём дальше (может прийти несколько строк)
                        console.log(`[PARTNER] /id ник — пропуск: ${_foundNick} ≠ ${_partnerNickSearchTarget}`);
                    }
                    return; // Блокируем строку numbered-list из чата (любую, пока ищем)
                }
                // "Совпадений не найдено" — напарник вышел из игры
                if (message.includes('Совпадений не найдено')) {
                    _partnerNickSearch = false;
                    _partnerNickSearchTarget = null;
                    console.log(`[PARTNER] ⚠️ Не удалось определить напарника: "${partnerNick}" не найден`);
                    snAdd('[1, "Напарник", "Не удалось определить напарника", "FF4400", 5000]');
                    return; // Блокируем "Совпадений не найдено" из чата
                }
            }
            // ==================== КОНЕЦ ОБНОВЛЕНИЯ ID ПО НИКУ ====================
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

                // ── Игрок вышел из игры во время погони: показываем обратный отсчёт ──
                // Сообщение сервера: "Игрок за которым Вы вели погоню вышел из игры.
                //                    У него есть X секунд, чтобы вернуться в игру."
                const exitChaseMatch = message.match(
                    /Игрок за которым Вы вели погоню вышел из игры[^.]*\.\s*У него есть (\d+) секунд/
                );
                if (exitChaseMatch) {
                    const returnSecs = parseInt(exitChaseMatch[1]);
                    const exitLabel  = trackingNickname
                        ? `${trackingNickname} — вернётся через`
                        : `Подозреваемый — вернётся через`;
                    console.log(`[CHASE] ⚠️ Игрок вышел из игры — ${returnSecs} сек на возвращение`);
                    try {
                        const _snExit = getZkmSN();
                        if (_snExit && typeof _snExit.addTimer === 'function') {
                            _snExit.addTimer(`[1, "Вышел из игры", "${exitLabel}", "FF6729", ${returnSecs}]`);
                        }
                    } catch(_e) {}
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
                        trackingName = `Отслеживание | {00FF00}${nick}[${currentScanId}]`;
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

            // ОБНАРУЖЕНИЕ FM-СООБЩЕНИЙ <Интерпол> Ловим /fm от любого члена семьи <Интерпол>: {FFCF00}<Интерпол> NickName [ID]: Отслеживаю жетон 232 Ни...
            if (typeof message === 'string' && partnerTrackingEnabled) {
                const _fmRaw = String(message);
                const _fmM   = _fmRaw.match(/<Интерпол>\s+([A-Za-z0-9_]+)\s*\[(\d+)\]:\s*([\s\S]+)/);
                if (_fmM) {
                    const _fmNick = _fmM[1];
                    const _fmId   = _fmM[2];
                    const _fmBody = _fmM[3];

                    // Тихая синхронизация ID напарника если ник совпадает с сохранённым
                    if (partnerNick && _fmNick === partnerNick && String(_fmId) !== String(partnerId)) {
                        const _oldFmId = partnerId;
                        partnerId = _fmId;
                        console.log(`[PARTNER-FM] ID обновлён из <Интерпол> /fm: ${_oldFmId} -> ${_fmId} (${_fmNick})`);
                        snAdd(`[1, "Напарник", "${_fmNick}: ID ${_oldFmId ?? '?'}->${_fmId}", "00FF00", 3000]`);
                    }

                    const _fmTrack = _fmBody.match(/Отслеживаю жетон\s+(\d+)/);
                    if (_fmTrack) {
                        const _fmSid    = _fmTrack[1];
                        const _fmSInfo  = getPlayerInfoFromList(_fmSid);
                        const _fmSLabel = _fmSInfo.nick ? `${_fmSInfo.nick}[${_fmSid}]` : `ID ${_fmSid}`;
                        const _fmSExtra = _fmSInfo.nick ? ` | Лвл ${_fmSInfo.level ?? '?'} | ${_fmSInfo.device}` : '';
                        console.log(`[PARTNER-FM] <Интерпол> ${_fmNick}[${_fmId}] -> отслеживание ${_fmSLabel}${_fmSExtra}`);
                        snAdd(`[1, "Напарник отслеживает", "${_fmSLabel}${_fmSExtra}", "00AAFF", 5000]`);
                        if (currentScanId === _fmSid || currentScanId === String(_fmSid)) {
                            console.log('[PARTNER-FM] Уже отслеживаем эту же цель — перезапуск пропущен');
                        } else {
                            setTimeout(() => startTracking(_fmSid), 600);
                        }
                        console.log('[FILTER] ℹ️ /fm отслеживание — показываем в чате семьи');
                        // return; // ОТКЛЮЧЕНО: больше не скрываем "Отслеживаю жетон X" из семейного чата
                    }

                    const _fmStop = _fmBody.match(/Закончил отслеживание за жетоном\s+(\d+)/);
                    if (_fmStop) {
                        const _fmSid = _fmStop[1];
                        console.log(`[PARTNER-FM] <Интерпол> ${_fmNick}[${_fmId}] закончил отслеживание ID: ${_fmSid}`);
                        snAdd(`[1, "Напарник", "${_fmNick}[${_fmId}]: закончил отслеживание ${_fmSid}", "FF4444", 3000]`);
                        if (currentScanId === _fmSid || currentScanId === String(_fmSid)) {
                            stopTracking();
                        }
                        console.log('[FILTER] ℹ️ /fm конец отслеживания — показываем в чате семьи');
                        // return; // ОТКЛЮЧЕНО: больше не скрываем "Закончил отслеживание за жетоном X" из семейного чата
                    }
                }
            }
            // ==================== КОНЕЦ FM-СООБЩЕНИЙ <Интерпол> ====================

            // РЕЗЕРВНЫЙ ФИЛЬТР /FM ОТСЛЕЖИВАНИЯ (ОТКЛЮЧЁН) ОТКЛЮЧЕНО: сообщения об отслеживании теперь показываются в чате семьи.

            // ОБНАРУЖЕНИЕ СООБЩЕНИЯ НАПАРНИКА Реальный формат в консоли: [CLOSE|#CECECE] - Отслеживаю 395 {0000FF}({v:Calvin_Miller})[294] Сервер сам д...
            if (typeof message === 'string' && partnerTrackingEnabled && partnerNick && !String(message).includes('<Интерпол>')) {
                const msgStr = String(message);
                const _escNick = escapeRegex(partnerNick);

                // Ник напарника + любой ID рядом: ({v:NICK})[ID] / {v:NICK}[ID] / NICK[ID] / NICK [ID]
                // \\s* — позволяет ловить FM-формат "<Семья> Nick [ID]: сообщение" (пробел перед [ID])
                const partnerTagRe = new RegExp(
                    `(?:\\(\\{v:${_escNick}\\}\\)|\\{v:${_escNick}\\}|\\b${_escNick})\\s*\\[(\\d+)\\]`
                );
                const partnerTagMatch = msgStr.match(partnerTagRe);

                // Маска: ник скрыт (Mask_XXXXX), но ID в [] совпадает с последним
                // известным partnerId — такие сообщения тоже считаем напарниковыми
                // (по нику в этом случае сматчить нельзя, т.к. ника не видно).
                const hasMaskedPartner = !!partnerId && (
                    (new RegExp(`\\{v:Mask_[^}]+\\}\\s*\\[${partnerId}\\]`)).test(msgStr) ||
                    (new RegExp(`\\bMask_[A-Za-z0-9_]+\\s*\\[${partnerId}\\]`)).test(msgStr)
                );

                const hasPartnerTag = !!partnerTagMatch || hasMaskedPartner;

                if (hasPartnerTag) {
                    // ── Тихая синхронизация ID напарника прямо из сообщения чата ──
                    // (без /id-запроса и без открытия меню МВД)
                    if (partnerTagMatch) {
                        const seenId = partnerTagMatch[1];
                        if (String(seenId) !== String(partnerId)) {
                            const _oldId = partnerId;
                            partnerId = seenId;
                            console.log(`[PARTNER] 🔄 ID напарника обновлён из чата: ${_oldId} → ${seenId} (${partnerNick})`);
                            snAdd(`[1, "Напарник", "${partnerNick}: ID ${_oldId == null ? '?' : _oldId}→${seenId}", "00FF00", 3000]`);
                        }
                    }

                    const trackMatch = msgStr.match(/Отслеживаю жетон\s+(\d+)/);
                    if (trackMatch) {
                        const suspectId = trackMatch[1];
                        // Берём полную инфу из списка игроков — ник, уровень, устройство
                        const _spInfo   = getPlayerInfoFromList(suspectId);
                        const _spNick   = _spInfo.nick;
                        const _spLabel  = _spNick ? `${_spNick}[${suspectId}]` : `ID ${suspectId}`;
                        const _spExtra  = _spNick
                            ? ` | Лвл ${_spInfo.level ?? '?'} | ${_spInfo.device}`
                            : '';
                        console.log(`[PARTNER] 🔔 Напарник ${partnerNick}[${partnerId}] начал отслеживание: ${_spLabel}${_spExtra}`);
                        snAdd(`[1, "Напарник отслеживает", "${_spLabel}${_spExtra}", "00AAFF", 5000]`);
                        // Если мы УЖЕ отслеживаем именно этого подозреваемого (например, сами выбрали его из /WANTED и ник уже известен) — НЕ перезапускаем startTr...
                        if (currentScanId === suspectId || currentScanId === String(suspectId)) {
                            console.log('[PARTNER] ⏭️ Уже отслеживаем эту же цель — перезапуск пропущен (ник сохранён)');
                        } else {
                            setTimeout(() => startTracking(suspectId), 600);
                        }
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
                    if (setmarkInterval) { clearTimeout(setmarkInterval);  setmarkInterval = null; } // setTimeout-цепочка
                    if (pgInterval)      { clearInterval(pgInterval);      pgInterval      = null; }
                    _cdTimerActive = false;
                    trackingNotificationOpen = false;
                    chaseNotificationOpen    = false;
                    currentScanId            = null;
                    trackingNickname         = null;
                    trackingName             = `Отслеживание | {FF0000}Выкл`;
                    isInActiveChase          = false;
                    lastSetmarkSentAt        = 0;

                    // Показываем серое уведомление синхронно — без setTimeout,
                    // чтобы никакой другой snAdd не успел сделать hideAll между hideAll и add
                    try {
                        const sn = getZkmSN();
                        if (sn) {
                            if (typeof sn.hideAll === 'function') sn.hideAll();
                            hideTrackingTimer();   // гасим таймер-уведомление отслеживания (timerQueue)
                            clearSetmarkCdTimer(); // и КД-таймер, если он был активен
                            sn.add(`[1, "Отслеживание", "${reason}", "CECECE", 5000]`);
                        }
                    } catch(e) {}

                    setTimeout(() => { window._trackingStopPending = false; }, 3000);
                    console.log(`[TRACKING] 🛑 Авто-стоп: ${reason}`);
                }
            }
            // ==================== КОНЕЦ АВТО-СТОП ====================

            // ==================== АВТО-СТОП: ИГРОК НЕ В РОЗЫСКЕ ====================
            // "Этот игрок не в розыске" с цветом #CECECE (CLOSE) — отменяем погоню и закрываем меню
            if (typeof message === 'string' && currentScanId &&
                message.includes('Этот игрок не в розыске')) {
                const _wantedColor = normalizeColor(args[0]);
                if (_wantedColor === '0xCECECE') {
                    console.log('[TRACKING] ⚠️ Игрок не в розыске (#CECECE) — стоп отслеживания + закрытие меню');
                    stopTracking();
                    // Закрываем открытые МВД интерфейсы
                    try { window.closeInterface('MvdMenu'); } catch(e) {}
                    try { window.App && typeof window.App.closeLastDialog === 'function' && window.App.closeLastDialog(); } catch(e) {}
                    snAdd('[1, "Погоня", "Игрок не в розыске — погоня отменена", "FF4400", 5000]');
                }
            }
            // ==================== КОНЕЦ АВТО-СТОП: ИГРОК НЕ В РОЗЫСКЕ ====================

            // ==================== КД /setmark: ПОВТОР ЧЕРЕЗ N СЕКУНД ====================
            if (typeof message === 'string' && currentScanId) {
                // Сервер пишет на /setmark: "Система отслеживания ещё загружает актуальное местоположение подозреваемого. Подождите X сек."
                const cdMatch = message.match(/[Пп]одождите\s+(\d+)\s*сек/);
                if (cdMatch) {
                    const waitSec = parseInt(cdMatch[1]);
                    console.log(`[TRACKING] ⏳ КД /setmark: ${waitSec} сек`);
                    // Блокируем восстановление красного таймера пока идёт жёлтый КД
                    _cdTimerActive = true;
                    // Прячем таймер обычного отслеживания и показываем жёлтый
                    // таймер-уведомление с реальным обратным отсчётом КД
                    hideTrackingTimer();
                    try {
                        const sn = getZkmSN();
                        if (sn && typeof sn.hideAll === 'function') sn.hideAll();
                    } catch(e) {}
                    setTimeout(() => {
                        try {
                            clearSetmarkCdTimer();
                            setmarkCdTimerId = getZkmSN()?.addTimer(
                                `[1, "Система загружает", "Обновление /setmark через", "FFAA00", ${waitSec}]`
                            );
                        } catch(e) {}
                    }, 100);
                    // Приостанавливаем setmarkInterval на время КД чтобы не спамить
                    if (setmarkInterval) {
                        clearTimeout(setmarkInterval); // setTimeout-цепочка → clearTimeout
                        setmarkInterval = null;
                        console.log('[TRACKING] setmarkInterval приостановлен на время КД');
                    }
                    // Через waitSec секунд повторяем /setmark, прячем КД-таймер
                    // и возвращаем обычный таймер отслеживания (31с)
                    setTimeout(() => {
                        _cdTimerActive = false; // разрешаем восстановление красного таймера
                        clearSetmarkCdTimer();
                        if (currentScanId) {
                            console.log(`[TRACKING] 🔄 Повтор /setmark после КД (${waitSec}с)`);
                            sendSetmarkCommand(currentScanId);
                            // Возобновляем цепочку /setmark
                            if (!setmarkInterval) {
                                scheduleSetmark();
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
                    // Ищем ID оглушённого напрямую из списка игроков
                    const foundId = getIdByNickFromList(nickname);
                    if (foundId !== null) {
                        console.log(`[AUTO-CUFF] ✅ ID из списка: ${nickname} → ${foundId}`);
                        setTimeout(() => {
                            sendMessagesWithDelay([`/cuff ${foundId}`, `/escort ${foundId}`], [0, 700]);
                        }, 1000);
                    } else {
                        // Фолбэк — запрашиваем через /id (ответ поймает блок ниже)
                        setTimeout(() => { sendChatInput(`/id ${nickname}`); }, 500);
                    }
                }
         
                // Фолбэк: разбираем ответ сервера на /id когда ID не нашёлся в списке
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
                if (message.includes('выписал штраф')) {
                    console.log('[FINE-LOG] ✅ Нашли "выписал штраф"!');
                    try {
                        const ownNick = window.App?.$store?.getters?.['player/nickName'];

                        // Извлекаем НИК ИМЕННО ТОГО, КТО ВЫПИСАЛ штраф — он стоит в формате {v:НИК}[ID] выписал штраф ПОЛУЧАТЕЛЬ.
                        const issuerMatch = message.match(/\{v:([^}]+)\}\s*\[\d+\]\s*выписал штраф/);
                        const issuerNick = issuerMatch ? issuerMatch[1] : null;

                        console.log(`[FINE-LOG] ownNick из store: "${ownNick}"`);
                        console.log(`[FINE-LOG] issuerNick из сообщения: "${issuerNick}"`);

                        if (ownNick && issuerNick && issuerNick === ownNick) {
                            const now = Date.now();
                            if (now - lastFineTimerOpenAt < 3000) {
                                // Это дубль того же события (например, радио-эхо "{v:...}"),
                                // пришедший в течение 3с после первого срабатывания — пропускаем
                                console.log('[FINE-LOG] ⏭ Пропускаем дубль сообщения о штрафе (повтор < 3с)');
                            } else {
                                lastFineTimerOpenAt = now;
                                runPostActionTimer('fine');
                                if (FINE_CD_TIMER_ENABLED) {
                                    console.log('[FINE-LOG] 🚀 Показываем таймер-уведомление КД штрафа...');
                                    try {
                                        const sn = getZkmSN();
                                        if (sn && typeof sn.addTimer === 'function') {
                                            fineTimerSnId = sn.addTimer('[2, "ШТРАФ К/Д", "Повторная выдача будет доступна через", "f9b701", 300]');
                                            console.log(`[FINE] ZKM-таймер запущен ✅ (id=${fineTimerSnId})`);
                                        } else {
                                            console.warn('[FINE] ZKM ScreenNotification.addTimer ещё не загружен — fallback на InformationTimer');
                                            window.openInterface('InformationTimer', ['К/Д Выдача штрафа', 300, false]);
                                        }
                                    } catch (snErr) {
                                        console.error('[FINE] Ошибка ZKM addTimer:', snErr);
                                    }
                                } else {
                                    console.log('[FINE-LOG] ⏭ Таймер КД штрафа отключён (FINE_CD_TIMER_ENABLED=false)');
                                }
                            }
                            // ── Авто-изъятие прав: если ZKM выставил pending ID — запускаем /takelic
                            // сразу после подтверждения штрафа (диалог уже закрыт)
                            if (window._mvdPendingTakeLicId) {
                                const _pendingId = window._mvdPendingTakeLicId;
                                window._mvdPendingTakeLicId = null;
                                console.log(`[AUTO-TAKELIC] ✅ Штраф подтверждён — запускаем /takelic для ID ${_pendingId}`);
                                setTimeout(() => { executePovsednevAction('takeLicense', _pendingId); }, 600);
                            }
                        } else {
                            console.log(`[FINE-LOG] ⏭ Штраф выписан не нами (issuer="${issuerNick}", ownNick="${ownNick}") — таймер не запускаем`);
                        }
                    } catch (err) {
                        console.error('[FINE] Ошибка InformationTimer:', err);
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

// РАННЕЕ ЛОГИРОВАНИЕ ВСЕХ ЧАТ-СООБЩЕНИЙ window.onChatMessage вызывается движком для КАЖДОГО сообщения с сервера, доступен с самого старта (...
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
                const _now    = new Date();
                const _ts     = `${String(_now.getHours()).padStart(2,'0')}:${String(_now.getMinutes()).padStart(2,'0')}:${String(_now.getSeconds()).padStart(2,'0')}`;
                const _actualColor = normalizeColor(_color).replace('0x', '');
                const _colorTag = `[#${_actualColor}]`;
                console.log(`[${_ts}]${_colorTag} ${_msg}`);
            } catch (_e) { /* тихо игнорируем */ }
        }
        return originalOnChatMessage.apply(this, arguments);
    };
    console.log('[MVD-CHAT] Раннее логирование чата установлено (onChatMessage)');
})();
// ==================== КОНЕЦ РАННЕГО ЛОГИРОВАНИЯ ====================

// ФУНКЦИИ SCREENNOTIFICATION ВАЖНО: используем ТОЛЬКО изолированный window.ZkmScreenNotification (см.
const getZkmSN = () => window.ZkmScreenNotification || null;

// ТАЙМЕР-УВЕДОМЛЕНИЕ ОТСЛЕЖИВАНИЯ Основное уведомление "Идет отслеживание/Начата погоня" теперь живёт как addTimer() (timerQueue), а не как...
const SETMARK_INTERVAL_SEC = 31;
let trackingTimerId   = null;  // id addTimer() для "Идет отслеживание/Начата погоня"
let setmarkCdTimerId  = null;  // id addTimer() для жёлтого КД /setmark
let lastSetmarkSentAt = 0;     // Date.now() последней реальной отправки /setmark
let _cdTimerActive    = false; // true пока активен жёлтый КД-таймер — блокирует восстановление красного таймера

const getSetmarkRemainingSec = () => {
    if (!lastSetmarkSentAt) return SETMARK_INTERVAL_SEC;
    const elapsed   = Math.floor((Date.now() - lastSetmarkSentAt) / 1000);
    const remaining = SETMARK_INTERVAL_SEC - elapsed;
    return remaining > 0 ? remaining : SETMARK_INTERVAL_SEC;
};

const hideTrackingTimer = () => {
    if (trackingTimerId !== null) {
        try { getZkmSN()?.hideTimer(trackingTimerId); } catch(e) {}
        trackingTimerId = null;
    }
};

const clearSetmarkCdTimer = () => {
    if (setmarkCdTimerId !== null) {
        try { getZkmSN()?.hideTimer(setmarkCdTimerId); } catch(e) {}
        setmarkCdTimerId = null;
    }
};

// Показывает/обновляет таймер-уведомление, используя АКТУАЛЬНОЕ состояние
// на момент вызова (а не закэшированное на момент постановки в setTimeout)
const showTrackingTimer = () => {
    if (!currentScanId) return;
    if (!(trackingNotificationOpen || chaseNotificationOpen)) return;
    if (_cdTimerActive) return; // жёлтый КД-таймер активен — не перекрываем его

    // Строка с ником/ID + уровень + устройство + суффикс "через"
    // Пример: "Ivan_Petrov [42] | Лвл 35 | Hassle — метка через MM:SS"
    let _extraTrkInfo = '';
    if (trackingNickname) {
        if (trackingLevel != null) _extraTrkInfo += ` | Лвл ${trackingLevel}`;
        if (trackingDevice)        _extraTrkInfo += ` | ${trackingDevice}`;
    }
    const label   = trackingNickname
        ? `${trackingNickname} [${currentScanId}]${_extraTrkInfo} — метка через`
        : `[${currentScanId}] — метка через`;
    const isChase = chaseNotificationOpen;
    const title   = isChase ? 'Начата погоня' : 'Идет отслеживание';
    const accent  = isChase ? '0000FF' : 'FF0000';
    const secs    = Math.max(2, getSetmarkRemainingSec());
    // 6-й параметр — полная длительность цикла /setmark (31с).
    const payload = `[1, "${title}", "${label}", "${accent}", ${secs}, ${SETMARK_INTERVAL_SEC}]`;

    try {
        const sn = getZkmSN();

        // Если уведомление уже висит на экране — просто обновляем текст/
        // таймер в существующем DOM-узле, БЕЗ leave+enter анимации.
        if (trackingTimerId !== null && sn?.updateTimer(trackingTimerId, payload) !== null) {
            return;
        }

        // Узла ещё нет (или он уже был закрыт) — создаём заново, тут
        // анимация появления оправдана.
        hideTrackingTimer();
        trackingTimerId = sn?.addTimer(payload);
    } catch(e) {}
};

// Отложенное восстановление таймер-уведомления после показа мелкого snAdd
const restoreTrackingTimer = (delay = 150) => {
    setTimeout(showTrackingTimer, delay);
};

const snAdd = (payload) => {
    try {
        // Если показывается финальное уведомление (серое) — не трогаем его через hideAll
        if (window._trackingStopPending) return;
        const sn = getZkmSN();
        if (sn && typeof sn.hideAll === 'function') sn.hideAll();

        // ZkmScreenNotification.js теперь сам стекует уведомления в одной точке экрана (см.
        setTimeout(() => {
            try { getZkmSN()?.add(payload); } catch(e) {}
        }, 100);
    } catch(e) {}
};
let currentNotificationId = 0;
let isInActiveChase = false; // Флаг активной погони
const openTrackingNotification = (id) => {
    currentNotificationId++;
    trackingNotificationOpen = true;
    chaseNotificationOpen = false;
    if (!lastSetmarkSentAt) lastSetmarkSentAt = Date.now();
    // Скрываем любые временные уведомления (например "Напарник: отслеживает")
    // чтобы они не перекрывали таймер-уведомление отслеживания
    try { getZkmSN()?.hideAll(); } catch(e) {}
    showTrackingTimer();
    console.log('[TRACKING] Таймер-уведомление открыто (красное)');
};
const openChaseNotification = (id) => {
    currentNotificationId++;
    trackingNotificationOpen = false;
    chaseNotificationOpen = true;
    if (!lastSetmarkSentAt) lastSetmarkSentAt = Date.now();
    try { getZkmSN()?.hideAll(); } catch(e) {}
    showTrackingTimer();
    console.log('[CHASE] Таймер-уведомление открыто (синее)');
};
const closeTrackingNotifications = () => {
    try {
        const screenNotif = getZkmSN();
        if (screenNotif && typeof screenNotif.hideAll === 'function') {
            screenNotif.hideAll();
        }
        hideTrackingTimer();
        clearSetmarkCdTimer();
        trackingNotificationOpen = false;
        chaseNotificationOpen = false;
        console.log('[TRACKING] Все уведомления закрыты (включая таймер)');
    } catch (err) {
        console.error('[TRACKING] Ошибка закрытия ScreenNotification:', err);
    }
};

// Обёртка над отправкой /setmark: фиксирует момент отправки (для точного
// обратного отсчёта в showTrackingTimer) и, если сейчас не идёт КД-таймер,
// сразу обновляет таймер-уведомление на свежие 31с
const sendSetmarkCommand = (id) => {
    if (!id) return; // защита от гонки: отслеживание уже остановлено к моменту вызова
    lastSetmarkSentAt = Date.now();
    sendChatInput(`/setmark ${id}`);
    if (setmarkCdTimerId === null) {
        showTrackingTimer();
    }
};

// scheduleSetmark: цепочка setTimeout вместо setInterval.
const scheduleSetmark = () => {
    setmarkInterval = setTimeout(() => {
        if (!currentScanId) return;
        sendSetmarkCommand(currentScanId);
        scheduleSetmark(); // следующий через 31с
    }, SETMARK_INTERVAL_SEC * 1000);
};

const startTracking = (id, knownNick = null) => {
    // Очищаем старые таймеры
    if (scanInterval) {
        clearInterval(scanInterval);
        scanInterval = null;
    }
    if (setmarkInterval) {
        clearTimeout(setmarkInterval); // setTimeout-цепочка → clearTimeout
        setmarkInterval = null;
    }
    if (pgInterval) {
        clearInterval(pgInterval);
        pgInterval = null;
    }
    _cdTimerActive = false; // сброс флага КД при перезапуске отслеживания
 
    // Немедленно гасим старое уведомление погони openTrackingNotification сбросит chaseNotificationOpen только через 800мс, из-за чего синий та...
    if (chaseNotificationOpen || trackingNotificationOpen) {
        chaseNotificationOpen    = false;
        trackingNotificationOpen = false;
        isInActiveChase          = false;
        hideTrackingTimer();
        clearSetmarkCdTimer();
        console.log('[TRACKING] 🔄 Старое уведомление погони закрыто (смена цели)');
    }
 
    currentScanId = id;
    // Ник, уровень и устройство берём из списка игроков — /id в чат не отправляем.
    // Приоритет knownNick (явно передан из /WANTED-диалога и т.п.), затем список.
    const _pInfo    = getPlayerInfoFromList(id);
    const nickFromList = knownNick || _pInfo.nick;
    trackingNickname = nickFromList || null;
    trackingLevel    = _pInfo.level;
    trackingDevice   = _pInfo.device;
    trackingName = nickFromList
        ? `Отслеживание | {00FF00}${nickFromList}[${id}]`
        : `Отслеживание | {00FF00}ID: ${id}`;
    if (nickFromList) {
        const _devStr = trackingDevice ? ` | ${trackingDevice}` : '';
        const _lvlStr = trackingLevel != null ? ` | Лвл ${trackingLevel}` : '';
        console.log(`[TRACKING] ✅ Игрок из списка: ${nickFromList}[${id}]${_lvlStr}${_devStr}`);
    }
    isInActiveChase = false; // Сброс флага погони
    lastSetmarkSentAt = 0;
    setTimeout(() => {
        openTrackingNotification(id);
    }, 800);

    // СООБЩЕНИЕ НАПАРНИКУ (через /fm — семейное радио) Если включено "Сообщение для напарника" — шлём в семью (/fm), чтобы напарник получил соб...
    if (partnerMessageEnabled) {
        setTimeout(() => {
            if (!currentScanId) {
                console.log(`[PARTNER] ⛔ Сообщение не отправлено — отслеживание уже остановлено`);
                return;
            }
            sendChatInput(`/fm Отслеживаю жетон ${id}`);
            console.log(`[PARTNER] 📡 Отправлено в /fm: Отслеживаю жетон ${id}`);
        }, 1200);
    }
    // ==================== КОНЕЦ СООБЩЕНИЯ НАПАРНИКУ ====================
 
    // Начальные команды (без /id — обработан выше) /setmark идёт через sendSetmarkCommand, чтобы зафиксировать время отправки.
    setTimeout(() => {
        if (!currentScanId) return; // защита от гонки: отслеживание уже остановлено (например "невозможно определить местоположение")
        sendSetmarkCommand(currentScanId);
        scheduleSetmark(); // следующий /setmark ровно через 31с (синхронно с таймером)
        setTimeout(() => {
            if (currentScanId) {                 // повторная проверка — стоп мог произойти за эту секунду
                sendChatInput(`/pg ${currentScanId}`);
            }
        }, 1000);
    }, 500);
 
    // Интервал /pg каждые 2 секунды (только если НЕ в активной погоне)
    pgInterval = setInterval(() => {
        if (currentScanId && !isInActiveChase) {
            sendChatInput(`/pg ${currentScanId}`);
        }
    }, 2000);
 
};
const stopTracking = () => {
    // Очищаем все таймеры
    if (scanInterval) {
        clearInterval(scanInterval);
        scanInterval = null;
    }
    if (setmarkInterval) {
        clearTimeout(setmarkInterval); // setTimeout-цепочка → clearTimeout
        setmarkInterval = null;
    }
    if (pgInterval) {
        clearInterval(pgInterval);
        pgInterval = null;
    }
    _cdTimerActive = false; // сброс флага КД
 
    // Закрываем все уведомления (включая таймер-уведомление и КД-таймер)
    closeTrackingNotifications();

    // ==================== СООБЩЕНИЕ НАПАРНИКУ О КОНЦЕ ОТСЛЕЖИВАНИЯ (через /fm) ====================
    if (partnerMessageEnabled && currentScanId) {
        const stoppedId = currentScanId;
        sendChatInput(`/fm Закончил отслеживание за жетоном ${stoppedId}`);
        console.log(`[PARTNER] 📡 Отправлено в /fm: Закончил отслеживание за жетоном ${stoppedId}`);
    }
    // ==================== КОНЕЦ СООБЩЕНИЯ О КОНЦЕ ОТСЛЕЖИВАНИЯ ====================
 
    currentScanId    = null;
    trackingNickname = null;
    trackingLevel    = null;
    trackingDevice   = null;
    trackingName     = `Отслеживание | {FF0000}Выкл`;
    isInActiveChase  = false;
    lastSetmarkSentAt = 0;
 
    console.log('[TRACKING] Отслеживание остановлено');
};
const toggleAutoCuff = () => {
    autoCuffEnabled = !autoCuffEnabled;
    autoCuffName = `Auto-cuff | ${autoCuffEnabled ? "{00FF00}Вкл" : "{FF0000}Выкл"}`;
};
const toggleAutoGrab = () => {
    autoGrabEnabled = !autoGrabEnabled;
    autoGrabName = `Авто-снаряжение | ${autoGrabEnabled ? "{00FF00}Вкл" : "{FF0000}Выкл"}`;
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
// ── Публичные флаги состояния для MvdMenu ─────────────────────────────────────
// MvdMenu читает эти свойства при каждом открытии mainMenuItems
Object.defineProperty(window, '_mvdCurrentScanId',   { get: () => currentScanId,   configurable: true });
Object.defineProperty(window, '_mvdTrackingNick',    { get: () => trackingNickname, configurable: true });
Object.defineProperty(window, '_mvdAutoCuffEnabled', { get: () => autoCuffEnabled, configurable: true });
Object.defineProperty(window, '_mvdAutoGrabEnabled', { get: () => autoGrabEnabled, configurable: true });
// Геттер метки напарника
window._mvdGetPartnerLabel = function() {
    if (partnerTrackingEnabled && partnerNick && partnerId) {
        return 'Напарник: ' + partnerNick + '[' + partnerId + ']';
    }
    return 'Напарник | Выкл';
};
// Toggle-обёртки для MvdMenu
window._mvdToggleAutoCuff = () => { toggleAutoCuff(); };
window._mvdToggleAutoGrab = () => { toggleAutoGrab(); };
// Отслеживание: если активно — останавливает; иначе открывает диалог ввода
window._mvdToggleTracking = () => {
    if (currentScanId) {
        stopTracking();
    } else {
        setTimeout(() => showTrackingInputDialog(giveLicenseTo), 50);
    }
};
// Запуск отслеживания по ID напрямую (для кастомного экрана MvdMenu)
window._mvdStartTracking = (id) => { startTracking(id); };

// ── Публичные API напарника для MvdMenu (кастомный интерфейс) ────────────────
window._mvdPartnerGetState = function() {
    return {
        tracking: partnerTrackingEnabled,
        message:  partnerMessageEnabled,
        nick:     partnerNick,
        id:       partnerId,
    };
};
window._mvdPartnerDisable = function() {
    partnerNick = null;
    partnerId = null;
    partnerTrackingEnabled = false;
    _awaitingPartnerId = false;
    snAdd('[1, "Напарник", "Слежка за напарником отключена", "FF0000", 2500]');
};
window._mvdPartnerSetId = function(rawId) {
    partnerId = rawId;
    partnerNick = null;
    partnerTrackingEnabled = true;

    // Пробуем найти ник из актуального списка игроков — без /id в чат
    const nickFromList = getNickByIdFromList(rawId);
    if (nickFromList) {
        partnerNick = nickFromList;
        _awaitingPartnerId = false;
        window._pendingPartnerId = null;
        snAdd(`[1, "Напарник", "Напарник: ${nickFromList}[${rawId}]", "00FF00", 3000]`);
        console.log(`[PARTNER] ✅ Напарник из списка: ${nickFromList}[${rawId}]`);
    } else {
        // Игрок с таким ID не найден в списке — возможно, не в сети
        snAdd(`[1, "Напарник", "ID ${rawId} — не найден в списке", "FF4444", 3000]`);
        console.log(`[PARTNER] ⚠️ ID ${rawId} не найден в списке игроков`);
    }
};
window._mvdPartnerSetMessage = function(val) {
    partnerMessageEnabled = val;
    partnerMessageName = `Сообщение для напарника | ${val ? '{00FF00}Вкл' : '{FF0000}Выкл'}`;
    snAdd(`[1, "Напарник", "Сообщение: ${val ? 'Вкл' : 'Выкл'}", "${val ? '00FF00' : 'FF0000'}", 2500]`);
};
// ── END публичные флаги ───────────────────────────────────────────────────────

const SendGiveLicenseCommand = (to, index) => {
    if (index < 0 || index >= shownLicenseTypes.length)
        return;
    const selected = shownLicenseTypes[index];
    switch (selected.id) {
        case "mvd_main": // МВД
            lastMenuType = "mvd_sub";
            setTimeout(() => {
                showMvdSubMenu(giveLicenseTo);
            }, 100);
            break;
    }
};
const HandlePovsednevCommand = (optionIndex) => {
    const _visible = povsednevOptions.filter(o => !MENU_HIDDEN_ITEMS.includes(o.action));
    const adjustedIndex = currentPage * ITEMS_PER_PAGE + optionIndex;
    if (adjustedIndex >= 0 && adjustedIndex < _visible.length) {
        const option = _visible[adjustedIndex];
        currentAction = option.action;
  
        // Динамическая проверка needsId: для "greeting" не запрашивать ID, если скин ОМОН (15340)
        const isOmonSkin = skinId === 15340;
        const needsIdForThis = option.needsId && !(option.action === "greeting" && isOmonSkin);
  
        if (needsIdForThis) {
            setTimeout(() => {
                showIdInputDialog(giveLicenseTo);
            }, 50);
        } else if (option.action === "fine") {
            setTimeout(() => {
                showKoapTypeMenu(giveLicenseTo);
            }, 50);
        } else if (option.action === "wantedFine") {
            setTimeout(() => {
                showUkInputDialog(giveLicenseTo);
            }, 50);
        } else {
            executePovsednevAction(option.action, giveLicenseTo);
        }
    }
};
const HandleMvdSubCommand = (index) => {
    if (index < 0 || index >= shownMvdSubTypes.length)
        return;
    const selected = shownMvdSubTypes[index];
    switch (selected.id) {
        case "povsednev":
            lastMenuType = "povsednev";
            currentPage = 0;
            setTimeout(() => {
                showPovsednevMenuPage(giveLicenseTo);
            }, 50);
            break;
        case "tracking":
            if (currentScanId) {
                stopTracking();
                setTimeout(() => {
                    showMvdSubMenu(giveLicenseTo);
                }, 50);
            } else {
                setTimeout(() => {
                    showTrackingInputDialog(giveLicenseTo);
                }, 100);
            }
            break;
        case "autocuff":
            toggleAutoCuff();
            setTimeout(() => {
                showMvdSubMenu(giveLicenseTo);
            }, 50);
            break;
        case "autograb":
            toggleAutoGrab();
            setTimeout(() => {
                showMvdSubMenu(giveLicenseTo);
            }, 50);
            break;
        case "naparnick":
            setTimeout(() => showPartnerMenu(giveLicenseTo), 50);
            break;
        case "laws":
            window._duranOpenMode = 'laws';
            window.openInterface('Zkm');
            break;
    }
};
// ПОДТВЕРЖДЕНИЕ ПРОВЕРКИ ДОКУМЕНТОВ (Alt x1 / Alt x2) После "Приветствия" снизу экрана показывается фирменное ZKM-уведомление с двумя карто...
const DOC_CHECK_PROMPT_SEC = 10;  // длительность таймера уведомления, сек
const DOC_CHECK_DBLTAP_MS  = 400; // макс. интервал между двумя Alt для "Да"

let _docCheckActive       = false;
let _docCheckAltPressedAt = 0;
let _docCheckSingleTimer  = null;
let _docCheckExpireTimer  = null; // fallback-таймер, см. ниже
let _docCheckTargetId     = -1;
let _docCheckSnId         = null; // id уведомления addChoice() в ZKM (timerQueue)
let _docCheckAbortedTargetId = null; // цель, по которой недавно пришла отмена
let _docCheckAbortedAt       = 0;    // Date.now() момента отмены
const DOC_CHECK_ABORT_WINDOW_MS = 3000; // окно, в течение которого отмена ещё "свежая"

function _docCheckCleanup() {
    _docCheckActive = false;
    if (_docCheckSingleTimer) { clearTimeout(_docCheckSingleTimer); _docCheckSingleTimer = null; }
    if (_docCheckExpireTimer) { clearTimeout(_docCheckExpireTimer); _docCheckExpireTimer = null; }
    _docCheckAltPressedAt = 0;
}

// Убирает ZKM-уведомление вручную (решение принято раньше, чем истёк таймер)
function _docCheckHideNotif() {
    if (_docCheckSnId !== null) {
        try { getZkmSN()?.hideTimer(_docCheckSnId); } catch (err) {}
        _docCheckSnId = null;
    }
}

function showDocCheckPrompt(targetId) {
    _docCheckCleanup();
    _docCheckHideNotif();

    const _resolvedTarget = (targetId != null && targetId !== -1) ? targetId : (giveLicenseTo || -1);

    // Если по этой же цели только что (в пределах окна) уже пришло "слишком
    // далеко" / "такого игрока нет" / отказ — это гонка: ответ сервера обогнал
    // открытие уведомления. Не показываем уведомление вовсе.
    if (_docCheckAbortedTargetId !== null &&
        String(_docCheckAbortedTargetId) === String(_resolvedTarget) &&
        (Date.now() - _docCheckAbortedAt) < DOC_CHECK_ABORT_WINDOW_MS) {
        console.log('[MVD] 🚫 Проверка документов пропущена (недавняя отмена по этой цели)');
        _docCheckAbortedTargetId = null;
        return;
    }

    _docCheckActive   = true;
    _docCheckTargetId = _resolvedTarget;

    const sn = getZkmSN();
    if (sn && typeof sn.addChoice === 'function') {
        _docCheckSnId = sn.addChoice(
            `[2, "Проверка документов", "Нет", "Да", "f9b701", ${DOC_CHECK_PROMPT_SEC}]`,
            function () {
                // Таймер естественно истёк, второго Alt не было — трактуем как "Нет"
                _docCheckSnId = null;
                _docCheckCleanup();
            }
        );
    } else {
        // Fallback на случай, если ZKM ещё не подгружен или это старая версия без addChoice
        console.warn('[MVD] ZkmScreenNotification.addChoice недоступен — fallback на обычное уведомление');
        snAdd(`[2, "Проверка документов", "Alt (1 раз) — Нет<br>Alt (2 раза) — Да", "f9b701", ${DOC_CHECK_PROMPT_SEC * 1000}]`);
        _docCheckExpireTimer = setTimeout(_docCheckCleanup, DOC_CHECK_PROMPT_SEC * 1000);
    }
}

// Отдельный слушатель Alt — реагирует ТОЛЬКО пока активно окно решения
// (_docCheckActive), поэтому не пересекается с существующей логикой
// курсора в консоли (см. KEY_CODE_ALT выше) и с MENU_BINDS.
window.addEventListener('keydown', function (e) {
    if (!_docCheckActive) return;
    if (e.keyCode !== window.KEY_CODE_ALT) return;

    const now = Date.now();
    if (_docCheckAltPressedAt && (now - _docCheckAltPressedAt) <= DOC_CHECK_DBLTAP_MS) {
        // Двойное нажатие Alt — "Да": запускаем проверку документов
        const tId = _docCheckTargetId;
        _docCheckCleanup();
        _docCheckHideNotif();
        executePovsednevAction('checkDocuments', tId);
        return;
    }

    _docCheckAltPressedAt = now;
    if (_docCheckSingleTimer) clearTimeout(_docCheckSingleTimer);
    _docCheckSingleTimer = setTimeout(function () {
        // Второй Alt не пришёл вовремя — одиночное нажатие = "Нет"
        _docCheckCleanup();
        _docCheckHideNotif();
    }, DOC_CHECK_DBLTAP_MS);
});
// ==================== КОНЕЦ ПОДТВЕРЖДЕНИЯ ПРОВЕРКИ ДОКУМЕНТОВ ====================

const executePovsednevAction = (action, targetId) => {
    if (!targetId) targetId = giveLicenseTo;
    const isOmonSkin = skinId === 15340;
    switch (action) {
	case "greeting":
		const _rank = window._mvdRank || '';
		const _firstName = window._mvdFirstName || '';
		const _lastName = window._mvdLastName || '';
		const _callsign = CALLSIGN || window._mvdCallsign || '';

		if (isOmonSkin) {
			sendMessagesWithDelay([
				`Работает сотрудник СОБР | Мой позывной ${_callsign}`,
				"Предъявите, пожалуйста, Ваши документы, удостоверяющие Вашу личность.",
				"Если Вы в течение 30 секунд не предъявите мне документы я сочту это за 5.2 УК.",
				"Если Вы убежите или попробуете это сделать я сочту это за 5.2.1 УК."
			], [0, 500, 500, 500]);
			setTimeout(() => showDocCheckPrompt(targetId), 1800);
			setTimeout(() => runPostActionTimer('greeting'), 1800);
		} else {
			sendMessagesWithDelay([
				`Здравия желаю, Вас беспокоит ${_rank} - ${_firstName} ${_lastName}.`,
				`/doc ${targetId}` 
			], [0, 1000]);
			setTimeout(() => showDocCheckPrompt(targetId), 1300);
			setTimeout(() => runPostActionTimer('greeting'), 1300);
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
             // ── Определяем скины ГУВД ──
             const guvdSkins = [190, 148, 15341, 15342, 15343, 15344, 15348, 15351];
             const isGuvdSkin = guvdSkins.includes(skinId);
             
             // ── Получаем свой ID (список игроков, с фолбэком на HUD) ──
             let myId = getMyId();
             
             if (isGuvdSkin) {
                 // ── ГУВД: только паспорт, без прав и ремня ──
                 sendMessagesWithDelay([
                     "Будьте добры предъявить Ваши документы, а именно:",
                     "Паспорт.",
                     `/n /pass ${myId}`
                 ], [0, 1000, 1000]);
             } else {
                 // ── Остальные скины: полный комплект (паспорт + права + документы на т/с + ремень) ──
                 sendMessagesWithDelay([
                     "Будьте добры предъявить Ваши документы, а именно:",
                     "Паспорт, вод.права и документы на т/с.",
                     `/n /pass ${myId}, /carpass ${myId}`,
                     "А также, отстегните пожалуйста ремень безопасности.",
                     "/n /rem"
                 ], [0, 1000, 1000, 1000, 1000]);
             }
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
            runPostActionTimer('wantedFine');
            break;

        case "wanted":
            sendMessagesWithDelay([
                "/me взял рацию в руки",
                "/me сообщил данные о нарушителе диспетчеру",
                "/do Данные сообщены.",
                "/do Нарушитель объявлен в розыск.",
                `/su ${targetId}`
            ], [0, 1000, 1000, 1000, 1000]);
            setTimeout(() => runPostActionTimer('wanted'), 4000);
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
                /* Отыгровка изъятия прав — временно отключена
                "/me взял права, затем переложил их в левую руку",
                "/me взял блокнот и ручку в правую руку",
                "/do Блокнот и ручка в руке.",
                "/me записал данные о нарушении и нарушителе в блокнот",
                "/do Данные заполнены.",
                "/me забрал водительские права",
                "/do Водительские права изъяты.",
                */
                `/takelic ${targetId}`
            ], [0]);
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
window.showGiveLicenseDialog = (e) => {
    giveLicenseTo = e;
    currentMenu = null;
    let availableTypes = [];
    if (mvdSkins.includes(skinId)) {
        availableTypes.push({ name: "МВД", id: "mvd_main" });
    }
    shownLicenseTypes = availableTypes;
    let licenseList = '';
    availableTypes.forEach((license, index) => {
        licenseList += `${index + 1}. ${license.name}<n>`;
    });
    window.addDialogInQueue(`[666,2,"АХК tg:ZaharKonst | P: ${giveLicenseTo}","","Выбрать","Отмена",0,0]`, licenseList, 0);
};
window.showPovsednevMenuPage = (e) => {
    giveLicenseTo = e;
    currentMenu = "povsednev";
    currentPage = 0;
    // Передаём targetId и стартовый экран компоненту через глобальные переменные
    window._mvdMenuTargetId = (e !== undefined && e !== null) ? e : null;
    window._mvdMenuStartScreen = 'povsednev';
    window.openInterface('MvdMenu');
};

// Открыть главное меню МВД (экран "main") — для общего хоткея MENU_KEY
window.showMvdMainMenuPage = (e) => {
    giveLicenseTo = e;
    currentMenu = "main";
    currentPage = 0;
    window._mvdMenuTargetId = (e !== undefined && e !== null) ? e : null;
    window._mvdMenuStartScreen = 'main';
    window.openInterface('MvdMenu');
};

// Публичный API для MvdMenu — выполнить действие Повседневной напрямую
window._mvdExecuteAction = function(action, id) {
    giveLicenseTo = (id !== undefined && id !== null && id !== -1) ? id : giveLicenseTo;
    currentAction = action;
    currentMenu = "povsednev";
    // FIX: если профиль ещё не загружен (бинд нажат раньше открытия меню) —
    // сначала загружаем rank/firstName/lastName, потом выполняем действие.
    var doExecute = function() { executePovsednevAction(action, giveLicenseTo); };
    if (!window._mvdFirstName || !window._mvdLastName || !window._mvdRank) {
        if (typeof window._mvdLoadPlayerProfile === 'function') {
            window._mvdLoadPlayerProfile(doExecute);
        } else {
            doExecute();
        }
    } else {
        doExecute();
    }
};
// Публичный API для Dokladi — отправить доклад по посту/патрулю (стадия: start/middle/end)
// reportType: "post" | "patrol", stage: "start" | "middle" | "end"
window._mvdExecuteDoklad = function(reportType, reportName, stage) {
    var doSend = function() {
        const _rank = window._mvdRank || '';
        const _lastName = window._mvdLastName || '';
        const name = reportName || '';
        let text = '';
        if (reportType === 'post') {
            if (stage === 'start')       text = `/r Докладывает: ${_rank} ${_lastName}. Занял пост ${name}. Сост.: Стабильное.`;
            else if (stage === 'middle') text = `/r Докладывает: ${_rank} ${_lastName}. Продолжаю стоять на посту ${name}. Сост.: Стабильное.`;
            else if (stage === 'end')    text = `/r Докладывает: ${_rank} ${_lastName}. Закончил стоять на посту ${name}. Сост.: Стабильное.`;
        } else if (reportType === 'patrol') {
            if (stage === 'start')       text = `/r Докладывает: ${_rank} ${_lastName}. Выехал в патруль ${name}. Сост.: Стабильное.`;
            else if (stage === 'middle') text = `/r Докладывает: ${_rank} ${_lastName}. Продолжаю патрулировать ${name}. Сост.: Стабильное.`;
            else if (stage === 'end')    text = `/r Докладывает: ${_rank} ${_lastName}. Завершаю патрулировать ${name}. Сост.: Стабильное.`;
        }
        if (text) sendChatInput(text);
    };
    // Как и в _mvdExecuteAction: если профиль (звание/фамилия) ещё не загружен —
    // сначала подгружаем его, потом отправляем доклад.
    if (!window._mvdLastName || !window._mvdRank) {
        if (typeof window._mvdLoadPlayerProfile === 'function') {
            window._mvdLoadPlayerProfile(doSend);
        } else {
            doSend();
        }
    } else {
        doSend();
    }
};
// Публичный API для LawsHelper — передаёт статью КоАП и активирует авто-подстановку в серверный диалог /takelic
window._mvdSetTakeLicReason = function(reason) {
    lastTakeLicCode = reason;
    _autoTakeLicActive = true;
    setTimeout(() => { _autoTakeLicActive = false; }, 10000);
    console.log(`[AUTO-TAKELIC] Причина установлена через LawsHelper: "${reason}"`);
};
window.showMvdSubMenu = (e) => {
    giveLicenseTo = e;
    currentMenu = "mvd_sub";
    let availableSub = [
        { name: "Повседневная", id: "povsednev" }
    ];
    availableSub.push({ name: trackingName, id: "tracking" });
    availableSub.push({ name: autoCuffName, id: "autocuff" });
    if (window.AUTO_GRAB === true) {
        availableSub.push({ name: autoGrabName, id: "autograb" });
    }
    availableSub.push({ name: getPartnerMenuLabel(), id: "naparnick" });
    availableSub.push({ name: "Законы", id: "laws" });
    shownMvdSubTypes = availableSub;
    let licenseList = '';
    availableSub.forEach((license, index) => {
        licenseList += `${index + 1}. ${license.name}<n>`;
    });
    window.addDialogInQueue(`[677,2,"МВД","","Выбрать","Отмена",0,0]`, licenseList, 0);
};
// ==================== МЕНЮ НАПАРНИКА ====================
window.showPartnerMenu = (e) => {
    giveLicenseTo = e;
    // Тихо обновляем ник напарника каждый раз при открытии раздела
    refreshPartnerNickSilent();
    const trackLabel = getPartnerTrackingLabel();
    const menuList =
        `1. ${trackLabel}<n>` +
        `2. ${partnerMessageName}`;
    window.addDialogInQueue(`[682,2,"Напарник","","Выбрать","Назад",0,0]`, menuList, 0);
};
window.showPartnerIdInputDialog = (e) => {
    giveLicenseTo = e;
    const cur = (partnerNick && partnerId) ? `Текущий: ${partnerNick}[${partnerId}]` : `Не задан`;
    window.addDialogInQueue(
        `[683,1,"Напарник — Ввод ID","Введите ID напарника (${cur}):","Подтвердить","Отмена",0,0]`,
        "", 0
    );
};
// ==================== КОНЕЦ МЕНЮ НАПАРНИКА ====================
window.showKoapTypeMenu = (e) => {
    giveLicenseTo = e;
    window._duranOpenMode = 'fine';
    window._duranFineTargetId = (e !== undefined && e !== null) ? e : -1;
    window.openInterface('Zkm');
};
window.showUkInputDialog = (e) => {
    giveLicenseTo = e;
    window._duranOpenMode = 'wanted';
    window._duranWantedTargetId = (e !== undefined && e !== null) ? e : -1;
    window.openInterface('Zkm');
};
window.showTakeLicReasonDialog = (e) => {
    giveLicenseTo = e;
    window.addDialogInQueue(`[684,1,"Причина изъятия прав","Введите статью КоАП (пр.: 3.1):","Подтвердить","Отмена",0,0]`, "", 0);
};
window.showIdInputDialog = (e) => {
    giveLicenseTo = e;
    window.addDialogInQueue(`[668,1,"Ввод ID","Введите ID игрока:","Подтвердить","Отмена",0,0]`, "", 0);
};
window.showTrackingInputDialog = (e) => {
    giveLicenseTo = e;
    window.addDialogInQueue(`[669,1,"Отслеживание","Введите ID для отслеживания:","Начать","Отмена",0,0]`, "", 0);
};
window.sendClientEventCustom = (event, ...args) => {
    console.log(`[EVENT] Событие: ${event}, Аргументы:`, args);

    // Alt+Q — авто-тазер (своп тазер ↔ дигл) перехватывается через keydown (браузерный уровень)

    if (args[0] === "OnDialogResponse" && (args[1] >= 666 && args[1] <= 684)) {
        if (args[1] === 666) { // Главное меню
            const listitem = args[3];
            if (args[2] === 1 && giveLicenseTo !== -1) {
                SendGiveLicenseCommand(giveLicenseTo, listitem);
            } else {
                lastMenuType = null;
                currentMenu = null;
                restoreTrackingTimer();
            }
        }
        else if (args[1] === 667) { // Меню Повседневная
            const optionIndex = args[3];
            if (args[2] === 1 && giveLicenseTo !== -1) {
                HandlePovsednevCommand(optionIndex);
            } else if (args[2] === 0 && _navPending) {
                _navPending = false;
                return;
            } else if (args[2] === 0) {
                // ESC — возврат в МВД подменю
                currentPage = 0;
                lastMenuType = null; currentMenu = null;
                setTimeout(() => showMvdSubMenu(giveLicenseTo), 50);
                restoreTrackingTimer();
                return;
            }
        }
        else if (args[1] === 668) { // Диалог ввода ID
            const inputId = args[4];
            // Читаем action из currentAction (биндинги) или window._mvdMenuPendingAction (MvdMenu — fallback)
            const resolvedAction = currentAction || window._mvdMenuPendingAction || null;
            if (args[2] === 1 && resolvedAction) {
                giveLicenseTo = inputId;
                if (resolvedAction === 'takeLicense') {
                    // Перед выполнением изъятия — запросить статью КоАП (причина для серверного диалога)
                    currentAction = null;
                    window._mvdMenuPendingAction = null;
                    setTimeout(() => showTakeLicReasonDialog(giveLicenseTo), 50);
                    return;
                }
                executePovsednevAction(resolvedAction, inputId);
            }
            currentAction = null;
            window._mvdMenuPendingAction = null;
        }
        else if (args[1] === 669) { // Диалог ввода ID для отслеживания
            const inputId = args[4];
            if (args[2] === 1 && giveLicenseTo !== -1) {
                startTracking(inputId);
            } else {
                stopTracking();
                setTimeout(() => {
                    showMvdSubMenu(giveLicenseTo);
                }, 50);
            }
        }
        else if (args[1] === 677) { // Меню МВД sub
            const listitem = args[3];
            if (args[2] === 1 && giveLicenseTo !== -1) {
                HandleMvdSubCommand(listitem);
            } else if (args[2] === 0) {
                // Отмена / ESC — закрываем меню, восстанавливаем уведомление
                restoreTrackingTimer();
            }
        }
        // ==================== НАПАРНИК ДИАЛОГИ ====================
        else if (args[1] === 682) { // Меню Напарник
            const listitem = args[3];
            if (args[2] === 1) {
                if (listitem === 0) {
                    // "Следить за напарником" — если уже включено, отключаем; иначе запрашиваем ID
                    if (partnerTrackingEnabled) {
                        partnerNick = null;
                        partnerId = null;
                        partnerTrackingEnabled = false;
                        _awaitingPartnerId = false;
                        snAdd('[1, "Напарник", "Слежка за напарником отключена", "FF0000", 2500]');
                        console.log('[PARTNER] Слежка отключена');
                        setTimeout(() => showPartnerMenu(giveLicenseTo), 50);
                    } else {
                        setTimeout(() => showPartnerIdInputDialog(giveLicenseTo), 50);
                    }
                } else if (listitem === 1) {
                    // "Сообщение для напарника" — переключатель
                    partnerMessageEnabled = !partnerMessageEnabled;
                    partnerMessageName = `Сообщение для напарника | ${partnerMessageEnabled ? '{00FF00}Вкл' : '{FF0000}Выкл'}`;
                    snAdd(`[1, "Напарник", "Сообщение: ${partnerMessageEnabled ? 'Вкл' : 'Выкл'}", "${partnerMessageEnabled ? '00FF00' : 'FF0000'}", 2500]`);
                    console.log(`[PARTNER] Сообщение для напарника: ${partnerMessageEnabled ? 'вкл' : 'выкл'}`);
                    setTimeout(() => showPartnerMenu(giveLicenseTo), 50);
                }
            } else if (args[2] === 0) {
                // Назад — в МВД подменю
                setTimeout(() => showMvdSubMenu(giveLicenseTo), 50);
            }
        }
        else if (args[1] === 683) { // Ввод ID напарника
            const inputId = args[4];
            if (args[2] === 1 && inputId && inputId.trim()) {
                const rawId = inputId.trim();
                partnerId = rawId;
                partnerNick = null;
                partnerTrackingEnabled = true;

                // Пробуем найти ник из актуального списка игроков — без /id в чат
                const nickFromList = getNickByIdFromList(rawId);
                if (nickFromList) {
                    partnerNick = nickFromList;
                    _awaitingPartnerId = false;
                    window._pendingPartnerId = null;
                    snAdd(`[1, "Напарник", "Напарник: ${nickFromList}[${rawId}]", "00FF00", 3000]`);
                    console.log(`[PARTNER] ✅ Напарник из списка: ${nickFromList}[${rawId}]`);
                } else {
                    // Игрок с таким ID не найден в списке — возможно, не в сети
                    snAdd(`[1, "Напарник", "ID ${rawId} — не найден в списке", "FF4444", 3000]`);
                    console.log(`[PARTNER] ⚠️ ID ${rawId} не найден в списке игроков`);
                }
            } else {
                // Отмена — возврат в меню напарника
                setTimeout(() => showPartnerMenu(giveLicenseTo), 50);
            }
        }
        // ==================== КОНЕЦ НАПАРНИК ДИАЛОГИ ====================
        else if (args[1] === 684) { // Причина изъятия прав (статья КоАП)
            const reason = args[4];
            if (args[2] === 1 && reason && reason.trim()) {
                const trimmed = reason.trim();
                // Добавить " КоАП" если ещё не указан тип
                lastTakeLicCode = /КоАП|УК/i.test(trimmed) ? trimmed : trimmed + ' КоАП';
                _autoTakeLicActive = true;
                setTimeout(() => { _autoTakeLicActive = false; }, 10000);
                console.log(`[AUTO-TAKELIC] Причина установлена: "${lastTakeLicCode}" — запускаем изъятие`);
                executePovsednevAction('takeLicense', giveLicenseTo);
            }
            // Отмена — ничего не делаем (закрываем без действия)
        }
    } else if (args[0] === "OnDialogResponse" && _wantedDialogId !== null && args[1] === _wantedDialogId) {
        // ==================== /WANTED: ВЫБОР ИГРОКА → АВТО-ОТСЛЕЖИВАНИЕ ====================
        if (args[2] === 1) {
            const listitem = parseInt(args[3]);
            const player = _wantedPlayers[listitem];
            if (player) {
                console.log(`[WANTED] ✅ Выбран: ${player.nick}[${player.id}] — запускаем отслеживание`);
                _wantedDialogId = null;
                setTimeout(() => startTracking(player.id, player.nick), 100);
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
var __mvdPrevSendChatInput = window.sendChatInput;
window.sendChatInputCustom = e => {
    const args = e.split(" ");
    if (args[0] == "/dahk") {
    targetId = args[1];
    const freshSkin = getSkinIdFromStore();
    if (freshSkin !== null) skinId = Number(freshSkin);
    window._mvdSkinId = skinId; // FIX: прокидываем наружу для MvdMenu.js
    if (mvdSkins.includes(skinId)) {
        
        const openMenu = () => {
            snAdd('[0, "AHK by TG: ZaharKonst", "Меню фракции \'МВД\'", "0000FF", 5000]');
            restoreTrackingTimer();
            refreshPartnerNickSilent();
            showMvdMainMenuPage(args[1]);
        };

        // Если данные уже загружены — открываем меню МГНОВЕННО
        if (window._mvdFirstName && window._mvdLastName && window._mvdRank) {
            openMenu();
        } else if (typeof window._mvdLoadPlayerProfile === 'function') {
            // Первый раз — загружаем профиль, потом открываем
            window._mvdLoadPlayerProfile(openMenu);
        } else {
            openMenu();
        }
    } else {
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
            if (!willOpen && window.App && typeof window.App.setConsoleActive === "function") {
                // Было открыто — теперь закрываем не просто сворачивая, а полностью прячем виджет
                window.App.setConsoleActive(false);
            }
            if (!willOpen && typeof window.setCursorStatus === "function") {
                // Курсор мог быть включён через Alt пока консоль была открыта — гасим его при закрытии
                window.cursorStatus = false;
                window.setCursorStatus('Console', false);
            }
        } catch (e) {
            console.log('[CONSOLE] Ошибка переключения консоли:', e.message);
        }
    } else if (args[0] == "/mvdreset") {
        lastMenuType = null;
        currentMenu = null;
        currentSubMenu = null;
        currentAction = null;
        currentPage = 0;
        stopTracking();
        autoCuffEnabled = false;
        trackingName = `Отслеживание | {FF0000}Выкл`;
        autoCuffName = `Auto-cuff | {FF0000}Выкл`;
        // Сброс напарника
        partnerNick = null;
        partnerId = null;
        partnerTrackingEnabled = false;
        partnerMessageEnabled = false;
        _awaitingPartnerId = false;
        partnerMessageName = `Сообщение для напарника | {FF0000}Выкл`;
        sendChatInput("Настройки МВД сброшены. Следующее /mvd откроет главное меню.");
    } else if (args[0] == "/int") {
        // Просмотрщик интерфейсов (см.
        try {
            if (window.zkInterfaceViewer && typeof window.zkInterfaceViewer.toggle === "function") {
                window.zkInterfaceViewer.toggle();
            } else {
                console.warn('[ZK-VIEW] window.zkInterfaceViewer ещё не готов (интерфейс не успел загрузиться)');
            }
        } catch (err) {
            console.warn('[ZK-VIEW] /int toggle error:', err);
        }
    } else if (typeof __mvdPrevSendChatInput === "function") {
        // отдаём команду предыдущему обработчику
        __mvdPrevSendChatInput(e);
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

            // Авто-закрытие диалога "Точное время" (открывается после команды /c 60) Закрываем ТОЛЬКО если этот диалог пришёл в ответ на НАШУ команду /...
            if (style === 0 && title.includes('Точное время') && _awaitingTimerDialog) {
                _awaitingTimerDialog = false;
                if (_timerDialogResetTO) { clearTimeout(_timerDialogResetTO); _timerDialogResetTO = null; }
                setTimeout(() => {
                    try { window.App && typeof window.App.closeLastDialog === 'function' && window.App.closeLastDialog(); } catch(e) {}
                    console.log('[AHK-TIMER] Диалог "Точное время" закрыт');
                }, 1500);
            }

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
                    console.log('[MVD-GRAB] === v2.1 🎯 ТРИГГЕР СРАБОТАЛ — Полицейская служба ===');
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

            // ── Авто-"Да" при смене цели погони: MSGBOX "Подтверждение → хотите окончить погоню за X?" ──
            // Если ник в диалоге НЕ совпадает с текущим trackingNickname → авто-подтверждаем смену
            if (style === 0 && title.includes('Подтверждение') && contentText.includes('хотите окончить погоню за')) {
                const _chaseMsgNickM = contentText.match(/погоню за ([A-Za-z0-9_]+)/);
                if (_chaseMsgNickM && currentScanId) {
                    const _chaseMsgNick = _chaseMsgNickM[1];
                    const _isCurrentNick = trackingNickname && _chaseMsgNick === trackingNickname;
                    if (!_isCurrentNick) {
                        console.log(`[CHASE-MSGBOX] ✅ Авто-"Да": диалог для "${_chaseMsgNick}", наш ник="${trackingNickname||'ещё нет'}" (id=${currentScanId}) — подтверждаем`);
                        const _chaseMsgDlgId = dialogId;
                        setTimeout(() => {
                            sendClientEvent(
                                (window.gm && window.gm.EVENT_EXECUTE_PUBLIC !== undefined) ? window.gm.EVENT_EXECUTE_PUBLIC : 0,
                                'OnDialogResponse', _chaseMsgDlgId, 1, -1, ''
                            );
                            console.log('[CHASE-MSGBOX] "Да" отправлен — старая погоня прекращена');
                            try { window.App && typeof window.App.closeLastDialog === 'function' && window.App.closeLastDialog(); } catch(e) {}
                        }, 150);
                    } else {
                        console.log(`[CHASE-MSGBOX] Ник совпадает (${_chaseMsgNick}) — не трогаем`);
                    }
                }
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

            // ── Авто-изъятие: LIST "Выберите лицензию" → авто-выбор "Водительские права" (listitem=1) ──
            if (style === 2 && title.includes('Выберите лицензию') && _autoTakeLicActive) {
                _autoTakeLicActive = false;
                _awaitingTakeLicInput = true;
                const _takeLicListDlgId = dialogId;
                console.log('[AUTO-TAKELIC] Обнаружен диалог выбора лицензии — авто-выбор "Водительские права"');
                setTimeout(() => {
                    sendClientEvent(
                        (window.gm && window.gm.EVENT_EXECUTE_PUBLIC !== undefined)
                            ? window.gm.EVENT_EXECUTE_PUBLIC
                            : 'server',
                        'OnDialogResponse', _takeLicListDlgId, 1, 1, ''
                    );
                    console.log('[AUTO-TAKELIC] Отправлен выбор "Водительские права" (listitem=1)');
                }, 200);
            }

            // ── Авто-изъятие: INPUT "Укажите причину" → авто-ввод статьи КоАП ──
            if (style === 1 && title.includes('Укажите причину') && _awaitingTakeLicInput) {
                _awaitingTakeLicInput = false;
                const reason = lastTakeLicCode || '3.1 КоАП';
                const _takeLicInputDlgId = dialogId;
                console.log(`[AUTO-TAKELIC] Обнаружен диалог ввода причины — авто-ввод "${reason}"`);
                setTimeout(() => {
                    _origSendClientEventHandle.call(
                        window,
                        (window.gm && window.gm.EVENT_EXECUTE_PUBLIC !== undefined)
                            ? window.gm.EVENT_EXECUTE_PUBLIC
                            : 'server',
                        'OnDialogResponse', _takeLicInputDlgId, 1, 0, reason
                    );
                    console.log(`[AUTO-TAKELIC] Причина "${reason}" отправлена`);
                    lastTakeLicCode = null;
                    setTimeout(() => {
                        try { window.App && typeof window.App.closeLastDialog === 'function' && window.App.closeLastDialog(); } catch(e) {}
                        console.log('[AUTO-TAKELIC] Диалог закрыт');
                    }, 100);
                }, 300);
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
                    // Закрываем UI диалога
                    setTimeout(() => {
                        try { window.App && typeof window.App.closeLastDialog === 'function' && window.App.closeLastDialog(); } catch(e) {}
                        console.log('[AUTO-РОЗЫСК] Диалог закрыт');
                        runPostActionTimer('wantedFine');
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

// АВТОБРАНИЕ МВД Авто-снаряжение — включается только если AUTO_GRAB === true (LoadAhk патчит константы ниже перед eval) Используем var чтоб...
var AUTO_GRAB = false;
var AUTO_GRAB_SKIP = [];
// Явно пишем в window чтобы showMvdSubMenu (загруженный ДО eval) видел значение
window.AUTO_GRAB = AUTO_GRAB;
window.AUTO_GRAB_SKIP = AUTO_GRAB_SKIP;
// Проверяем и локальную переменную и window (на случай если патч LoadAhk сработал через window)
if (AUTO_GRAB || window.AUTO_GRAB === true) {
(function() {
console.log('[MVD-GRAB] === v2.2 🔫 БЛОК AUTO_GRAB ЗАПУЩЕН (МОМЕНТАЛЬНЫЙ) ===');
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

 function findItemInInv(itemId) {
     try {
         const inv = window.interface("InventoryNew");
         if (!inv?.items) return null;
         const c = inv.items[CT.INV];
         if (!c) return null;
         for (const [slot, item] of Object.entries(c)) {
             if (item?.id === itemId) {
                 console.log(`[GRAB] findItemInInv(id=${itemId}): найден в INV slot${slot} x${item.count||1}`);
                 return { cid: CT.INV, slot: parseInt(slot), count: item.count || 1 };
             }
         }
     } catch(e) {}
     console.log(`[GRAB] findItemInInv(id=${itemId}): НЕ НАЙДЕН (в поясе)`);
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
 	console.log('[GRAB] closeInventory() — через сервер (синхронизация)');
 	sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, "OnInventoryDisplayChange");
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

     // ── ПАТЧИ: скрываем визуал инвентаря на ВЕСЬ авто-граб ──
     const _grabOrigPlaySound         = window.playSound;
     const _grabOrigSetHudStatus      = window.setHudStatus;
     const _grabOrigSetDrawLabel      = window.setDrawLabelStatus;
     let _grabPatchesActive = true;

     function applyGrabPatches() {
         _grabPatchesActive = true;
         window.playSound = function(path, ...rest) {
             if (_grabPatchesActive && typeof path === 'string' && path.includes('inventory')) {
                 return;
             }
             return _grabOrigPlaySound.apply(this, [path, ...rest]);
         };
         window.setHudStatus = function(status) {
             if (_grabPatchesActive) return;
             return _grabOrigSetHudStatus.apply(this, arguments);
         };
         window.setDrawLabelStatus = function(status) {
             if (_grabPatchesActive) return;
             return _grabOrigSetDrawLabel.apply(this, arguments);
         };
     }

     function restoreGrabPatches() {
         _grabPatchesActive = false;
         window.playSound          = _grabOrigPlaySound;
         window.setHudStatus       = _grabOrigSetHudStatus;
         window.setDrawLabelStatus = _grabOrigSetDrawLabel;
     }

     function hideInventoryUI() {
         const id = setInterval(() => {
             const el = document.querySelector('.iface-container.inventory')
                     || document.querySelector('.inventory')
                     || document.querySelector('[class*="InventoryNew"]')
                     || document.querySelector('.iface-container');
             if (el && el.style.visibility !== 'hidden') {
                 el.style.visibility = 'hidden';
                 el.style.pointerEvents = 'none';
                 el.style.opacity = '0';
             }
             const dlg = document.querySelector('.dialog-container')
                      || document.querySelector('[class*="Dialog"]');
             if (dlg && dlg.style.visibility !== 'hidden') {
                 dlg.style.visibility = 'hidden';
                 dlg.style.pointerEvents = 'none';
                 dlg.style.opacity = '0';
             }
         }, 10);
         return id;
     }

     applyGrabPatches();
     const hideInterval = hideInventoryUI();

     try {
         const armourVal = getArmourValue();

         // ── Шаг 1: открываем инвентарь (невидимо благодаря патчам выше) ──
         let ready = false;
         for (let attempt = 0; attempt < 2 && !ready; attempt++) {
             if (attempt > 0) await sleep(300);
             openInventory();
             ready = await waitInventory(1500);
         }
         if (!ready) {
             notify("Ошибка", "Инвентарь не открылся", "FF0000");
             return; 
         }

         // ── Шаг 2: читаем что нужно ──
         logInventoryGrab('GRAB ДО ВЗЯТИЯ');
         const skipList = (typeof AUTO_GRAB_SKIP !== 'undefined' && AUTO_GRAB_SKIP.length) ? AUTO_GRAB_SKIP : ((typeof window._mvdGrabSkip !== 'undefined') ? window._mvdGrabSkip : []);
         const skip = (key) => skipList.includes(key);

         const has = {
             medkit:      skip('medkit')      ? 999 : (findItemInInv(ITEM.MEDKIT)  ? 1 : 0),
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
             wand:        skip('baton2')      ? 1   : 0,
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

         // ── Шаг 3: запоминаем слоты и закрываем инвентарь (невидимо) ──
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
         
         closeInventory();
         await sleep(50);

         // ── ВСЁ ЕСТЬ: выходим, инвентарь уже закрыт и невидим ──
         if (!Object.values(need).some(Boolean)) {
             notify("МВД", "Всё снаряжение есть ✓", "00FF00");
             return; 
         }

         // ── Шаг 4: МОМЕНТАЛЬНО берём предметы из меню ──
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

         for (let i = 0; i < toTake.length; i++) {
             console.log(`[MVD-GRAB] → беру: ${toTake[i].name} (idx=${toTake[i].idx}) [МОМЕНТАЛЬНО]`);
             take(toTake[i].idx);
             // Микро-задержка 20мс на случай жесткого анти-флуда на сервере.
             // Для глаза это выглядит как мгновенное выполнение.
             await sleep(20); 
         }

         // ⚠️ ВАЖНО: Закрываем меню принудительно, чтобы сервер не переоткрывал диалог
         closeMenu();

         const notifyNames = toTake.map(t => t.name.replace(/ \(есть: \d+\)/, ''));
         notify("МВД", notifyNames.join(", "), "00FF00");
         window.playSound("inventory/take_light.mp3");

     } catch (err) {
         console.error('[MVD-GRAB] Ошибка:', err);
         notify("Ошибка", err.message, "FF0000");
     } finally {
         // ── Гарантированное восстановление при ЛЮБОМ выходе ──
         clearInterval(hideInterval);
         try {
             document.querySelectorAll('.iface-container.inventory, .inventory, [class*="InventoryNew"], .dialog-container, [class*="Dialog"]').forEach(el => {
                 el.style.visibility = '';
                 el.style.pointerEvents = '';
                 el.style.opacity = '';
             });
         } catch(e) {}
         restoreGrabPatches();
         isProcessing = false;
         console.log('[MVD-GRAB] готов (моментальный + закрытие меню)');
     }
 }

 // ==================== ТРИГГЕР ====================
 window.autoGrab = autoGrab;
 Object.defineProperty(window, '_mvdGrabProcessing', {
     get: () => isProcessing,
     configurable: true
 });
 console.log('[MVD-GRAB] === v2.2 ✅ ГОТОВ — жду диалог Полицейская служба ===');
})();
} // end if (AUTO_GRAB)
// ==================== END АВТОБРАНИЕ МВД ====================

// ==================== АВТО-ТАЗЕР: СВОП ТАЗЕР ↔ ДИГЛ (v18 — sync + no-freeze) ====================
(function() {
    const ITEM_DEAGLE = 19;
    const CT = { ACC: 0, INV: 1, BACK: 2, EXTRA: 3 };
    const CT_NAMES = { 0: 'ACC', 1: 'INV', 2: 'BACK', 3: 'EXTRA' };

    let _busy = false;
    let _busyTimer = null;
    let _swapActive = false;

    // Сохраняем оригинал для восстановления
    const _origSetCursorStatus = window.setCursorStatus;

    function applyPatches() {
        _swapActive = true;
        // Патчим setCursorStatus: для InventoryNew курсор НЕ показываем,
        // но allowMovement=true — персонаж продолжает двигаться
        window.setCursorStatus = function(name, status, allowMovement) {
            if (_swapActive && name === 'InventoryNew') {
                try {
                    if (typeof engine !== 'undefined' && engine.trigger) {
                        engine.trigger("SetCursorStatus", false, true);
                    }
                } catch(e) {}
                return;
            }
            return _origSetCursorStatus.apply(this, arguments);
        };
    }

    function restoreOriginals() {
        window.setCursorStatus = _origSetCursorStatus;
    }

    function clearBusy() {
        clearTimeout(_busyTimer);
        _busy = false;
        _swapActive = false;
        restoreOriginals();
        console.log('[АВТО-ТАЗЕР] готов');
    }

    function findItem(items, itemId) {
        for (const cid of [CT.INV, CT.BACK, CT.ACC, CT.EXTRA]) {
            const c = items[cid];
            if (!c) continue;
            for (const [slot, item] of Object.entries(c)) {
                if (item?.id === itemId) {
                    const loc = { cid, slot: parseInt(slot), count: item.count || 1 };
                    console.log(`[АВТО-ТАЗЕР] findItem(Дигл): ${CT_NAMES[cid]} slot${loc.slot} x${loc.count}`);
                    return loc;
                }
            }
        }
        return null;
    }

	function hasBackpack() {
		try {
			const inv = window.interface('InventoryNew');
			const containers = inv?.containers || inv?.$data?.containers || {};
			const back = containers[CT.BACK];

			if (!back) {
				return false;
			}

			const slots = back.countSlots ?? back.capacity?.max;

			if (slots !== undefined && Number(slots) <= 0) {
				return false;
			}

			return true;
		} catch (e) {
			return false;
		}
	}

	function findFreeSlot(items, targetCid) {
		const container = items[targetCid];

		if (!container) {
			if (targetCid === CT.BACK && hasBackpack()) {
				return 0;
			}

			return -1;
		}

		for (let s = 0; s < 50; s++) {
			if (!container[s]) {
				console.log(`[АВТО-ТАЗЕР] freeSlot(${CT_NAMES[targetCid]}): ${s}`);
				return s;
			}
		}

		return -1;
	}

	function tryGetItems() {
		try {
			const inv = window.interface('InventoryNew');
			const items = inv?.items;

			if (!items) {
				return null;
			}

			if (items[CT.INV] !== undefined || items[CT.BACK] !== undefined) {
				return items;
			}
		} catch(e) {}

		return null;
	}

    function swapTaserDeagle() {
        if (!mvdSkins.includes(skinId)) {
            console.log('[АВТО-ТАЗЕР] не МВД форма, пропуск');
            return;
        }
        if (_busy) {
            console.log('[АВТО-ТАЗЕР] занят, пропуск');
            return;
        }
        _busy = true;
        _busyTimer = setTimeout(() => {
            if (_busy) {
                _busy = false;
                _swapActive = false;
                restoreOriginals();
                console.log('[АВТО-ТАЗЕР] таймаут сброса');
            }
        }, 5000);

        // ГЛАВНАЯ ЛОГИКА С УЧЁТОМ РАССИНХРОНИЗАЦИИ Проверяем: считает ли КЛИЕНТ инвентарь открытым? Это бывает после: диалогов Window (склад, /id и...
        const clientThinksOpen = !!(
            window.getInterfaceStatus &&
            window.getInterfaceStatus('InventoryNew')
        );

        function doOpenAndSwap() {
            // Активируем патч курсора ПЕРЕД открытием
            applyPatches();

            console.log('[АВТО-ТАЗЕР] открываем инвентарь (no-freeze)...');
            sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, 'OnInventoryDisplayChange');

            let attempts = 0;
            const maxAttempts = 40;
            const poll = setInterval(() => {
                attempts++;
                const items = tryGetItems();

                if (!items) {
                    if (attempts >= maxAttempts) {
                        clearInterval(poll);
                        console.log('[АВТО-ТАЗЕР] items не появились, отмена');
                        sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, 'OnInventoryDisplayChange');
                        snAdd('[1, "АВТО-ТАЗЕР", "Ошибка: инвентарь не открылся", "FF0000", 3000]');
                        clearBusy();
                    }
                    return;
                }

                clearInterval(poll);
                console.log(`[АВТО-ТАЗЕР] items получены (попытка ${attempts})`);

                if (!hasBackpack()) {
                    console.log('[АВТО-ТАЗЕР] рюкзак не одет');
                    sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, 'OnInventoryDisplayChange');
                    snAdd('[1, "АВТО-ТАЗЕР", "Рюкзак не одет", "FF4400", 3000]');
                    clearBusy();
                    return;
                }

                const deagleLoc = findItem(items, ITEM_DEAGLE);
                if (!deagleLoc) {
                    console.log('[АВТО-ТАЗЕР] дигл не найден');
                    sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, 'OnInventoryDisplayChange');
                    snAdd('[1, "АВТО-ТАЗЕР", "Дигл не найден в инвентаре", "FF4400", 3000]');
                    clearBusy();
                    return;
                }

				let fromCid, toCid;

				if (deagleLoc.cid === CT.INV) {
					fromCid = CT.INV;
					toCid = CT.BACK;
				} else if (deagleLoc.cid === CT.BACK) {
					fromCid = CT.BACK;
					toCid = CT.INV;
				} else {
					console.log('[АВТО-ТАЗЕР] дигл не в INV/BACK');
					sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, 'OnInventoryDisplayChange');
					clearBusy();
					return;
				}

				if ((fromCid === CT.BACK || toCid === CT.BACK) && !hasBackpack()) {
					console.log('[АВТО-ТАЗЕР] рюкзак не одет');
					sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, 'OnInventoryDisplayChange');
					snAdd('[1, "АВТО-ТАЗЕР", "Рюкзак не одет", "FF4400", 3000]');
					clearBusy();
					return;
				}

				const toSlot = findFreeSlot(items, toCid);

				if (toSlot < 0) {
					console.log('[АВТО-ТАЗЕР] нет свободного слота или контейнер отсутствует');
					sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, 'OnInventoryDisplayChange');
					snAdd('[1, "АВТО-ТАЗЕР", "Нет свободного слота!", "FF4400", 3000]');
					clearBusy();
					return;
				}

                const direction = (fromCid === CT.INV) ? 'Дигл → Рюкзак' : 'Дигл → Инвентарь';
                console.log(`[АВТО-ТАЗЕР] ${CT_NAMES[fromCid]}[${deagleLoc.slot}] → ${CT_NAMES[toCid]}[${toSlot}]`);
                sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, 'OnInventoryItemMove',
                    fromCid, deagleLoc.slot, toCid, toSlot, deagleLoc.count);

                setTimeout(() => {
                    sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, 'OnInventoryDisplayChange');
                    snAdd(`[1, "АВТО-ТАЗЕР", "${direction}", "00CC44", 2000]`);
                    clearBusy();
                }, 150);
            }, 50);
        }

        if (clientThinksOpen) {
            // ── КЛИЕНТ СЧИТАЕТ ИНВЕНТАРЬ ОТКРЫТЫМ ──
            // Сервер может быть рассинхронизирован. Сначала закрываем через
            // серверный toggle, ждём 300мс, потом открываем заново.
            console.log('[АВТО-ТАЗЕР] ⚠️ Клиент считает инвентарь открытым — синхронизация');

            // Закрываем через сервер (toggle)
            sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, 'OnInventoryDisplayChange');

            // Также закрываем локально на всякий случай
            try { window.closeInterface('InventoryNew'); } catch(e) {}

            // Ждём 300мс чтобы сервер обработал закрытие
            setTimeout(() => {
                // Теперь открываем — сервер точно знает что инвентарь закрыт
                doOpenAndSwap();
            }, 300);
        } else {
            // ── КЛИЕНТ СЧИТАЕТ ИНВЕНТАРЬ ЗАКРЫТЫМ ──
            // Но сервер может думать обратное (после старого авто-граба).
            // Пробуем открыть. Если не получится — повторим с синхронизацией.
            doOpenAndSwap();
        }
    }

    window._mvdSwapTaserDeagle = swapTaserDeagle;
    console.log('[АВТО-ТАЗЕР] v18 готов (sync + no-freeze)');
})();
// ==================== END АВТО-ТАЗЕР: СВОП ТАЗЕР ↔ ДИГЛ ====================
// ==================== АВТО-ВЫБРОС ИЗ АВТО (Alt+U — /ejectout каждую секунду) ====================
(function() {
    var _ejectActive = false;   // флаг: выброс сейчас работает
    var _ejectTimer  = null;    // setInterval id
    var _ejectTick   = 0;       // счётчик тиков (для лога)

    function startEject() {
        if (_ejectActive) {
            // Повторное нажатие — останавливаем
            stopEject();
            return;
        }
        _ejectActive = true;
        _ejectTick   = 0;

        // Уведомление: выброс начат
        snAdd('[1, "АВТО-ВЫБРОС", "Выбрасываем из авто...", "FF8800", 2000]');
        console.log('[АВТО-ВЫБРОС] запущен');

        // Первый /ejectout немедленно
        sendChatInput('/ejectout');
        _ejectTick++;

        // Далее каждую секунду
        _ejectTimer = setInterval(function() {
            if (!_ejectActive) {
                clearInterval(_ejectTimer);
                _ejectTimer = null;
                return;
            }
            sendChatInput('/ejectout');
            _ejectTick++;
            console.log('[АВТО-ВЫБРОС] тик #' + _ejectTick);
        }, 1000);
    }

    function stopEject() {
        if (!_ejectActive) return;
        _ejectActive = false;
        if (_ejectTimer) {
            clearInterval(_ejectTimer);
            _ejectTimer = null;
        }
        snAdd('[1, "АВТО-ВЫБРОС", "Остановлен", "FF4444", 2000]');
        console.log('[АВТО-ВЫБРОС] остановлен после ' + _ejectTick + ' тиков');
    }

    function toggleEject() {
        if (_ejectActive) {
            stopEject();
        } else {
            startEject();
        }
    }

    // Экспортируем — LoadAhk.js вызывает через window._mvdAutoEject()
    window._mvdAutoEject    = toggleEject;
    window._mvdStopEject    = stopEject;   // на случай принудительной остановки снаружи

    console.log('[АВТО-ВЫБРОС] v1 готов (Alt+U → /ejectout каждую секунду)');
})();
// ==================== END АВТО-ВЫБРОС ИЗ АВТО ====================
// ==================== ПРОСМОТРЩИК ИНТЕРФЕЙСОВ (/int, доступ: Zahar_Loidov) ====================

/* ============================================================
   [ZK-INTERFACE-VIEWER START]
   Дев-команда: список всех зарегистрированных интерфейсов с
   возможностью пролистывать стрелками ↑ / ↓ или кликать прямо
   по списку. Чат при этом не перекрывается.

   Запуск/выход: команда в чате  /int
   Навигация:    ↑  /  ↓  — переключить на предыдущий/следующий
                 клик по строке в списке — открыть конкретный
                 поле поиска вверху панели — фильтрует список по
                 имени, Enter — открыть первый найденный
   Выход:        Esc  /  /int ещё раз  /  window.zkInterfaceViewer.stop()

   Доступ:       /int работает ТОЛЬКО на аккаунте с ником Zahar_Loidov —
                 ник читаем тем же способом, что и при определении
                 выписавшего штраф (window.App.$store.getters['player/nickName']),
                 см. ALLOWED_NICK / getOwnNick() ниже. На любом другом
                 аккаунте команда молча ничего не делает.

   Снять блок целиком — удалить всё между START и END.
   ============================================================ */
(function () {
  const STEP_DEBOUNCE_MS = 120;

  // Просмотрщик интерфейсов — дев-инструмент, доступ к нему выдан только одному конкретному аккаунту.
  const ALLOWED_NICK = "Zahar_Konstov";

  function getOwnNick() {
    try {
      return window.App && window.App.$store && window.App.$store.getters && window.App.$store.getters['player/nickName'];
    } catch (e) {
      return null;
    }
  }

  function isAllowed() {
    return getOwnNick() === ALLOWED_NICK;
  }

  let active = false;
  let names = [];
  let idx = -1;
  let openedByUs = null;
  let panelEl = null;
  let listEl = null;
  let counterEl = null;
  let searchInputEl = null;
  let query = "";
  let lastStepAt = 0;

  function getAllInterfaceNames() {
    try {
      return Object.keys((window.App && window.App.components) || {}).sort();
    } catch (e) {
      return [];
    }
  }

  function getHudChatEl() {
    try {
      const hud = window.interface("Hud");
      return hud && hud.$refs && hud.$refs.chat ? hud.$refs.chat.$el : null;
    } catch (e) {
      return null;
    }
  }

  // Раньше тут была попытка "перебить" скрытие чата через CSS (z-index/position у $refs.chat.$el).
  function neutralizeHideChat() {
    if (typeof window.shouldHideChat !== "function" || window.shouldHideChat.__zkPatched) return;
    const original = window.shouldHideChat;
    const patched = function () {
      return false;
    };
    patched.__zkPatched = true;
    patched.__zkOriginal = original;
    window.shouldHideChat = patched;
  }

  function restoreHideChat() {
    if (typeof window.shouldHideChat === "function" && window.shouldHideChat.__zkPatched) {
      window.shouldHideChat = window.shouldHideChat.__zkOriginal;
    }
  }

  // Курсор и блокировка движения персонажа управляются через window.setCursorStatus(name, isOn, allowMovement).
  const CURSOR_LOCK_NAME = "zkInterfaceViewer";

  function lockCursorAndMovement() {
    try {
      window.setCursorStatus(CURSOR_LOCK_NAME, true, false);
    } catch (e) {
      console.warn("[ZK-VIEW] setCursorStatus error:", e);
    }
  }

  function unlockCursorAndMovement() {
    try {
      window.setCursorStatus(CURSOR_LOCK_NAME, false);
    } catch (e) {
      console.warn("[ZK-VIEW] setCursorStatus error:", e);
    }
  }

  // Панель живёт вне дерева Vue-приложения (просто appendChild к body), поэтому жёстко заданный системный шрифт ("Segoe UI") иногда рисует ки...
  function getGameFontFamily() {
    try {
      const appEl = document.getElementById("app");
      if (appEl) {
        const f = getComputedStyle(appEl).fontFamily;
        if (f && f.trim()) return f;
      }
    } catch (e) {}
    return '"Segoe UI", Arial, sans-serif';
  }

  function buildPanel() {
    if (panelEl) return panelEl;

    panelEl = document.createElement("div");
    panelEl.id = "zk-interface-viewer-panel";
    Object.assign(panelEl.style, {
      position: "fixed",
      zIndex: "2147483647",
      fontFamily: getGameFontFamily(),
      color: "#f5e9d3",
      background: "#0d1117",
      border: "1px solid #d2a65e",
      borderRadius: "6px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.6)",
      width: "260px",
      maxHeight: "70vh",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    });

    const header = document.createElement("div");
    Object.assign(header.style, {
      padding: "8px 10px",
      borderBottom: "1px solid #30363d",
      fontSize: "13px",
      fontWeight: "600",
      color: "#d2a65e",
      flex: "0 0 auto",
    });
    header.textContent = "Просмотр интерфейсов";
    panelEl.appendChild(header);

    // Поиск по имени интерфейса.
    const searchWrap = document.createElement("div");
    Object.assign(searchWrap.style, {
      padding: "6px 10px",
      borderBottom: "1px solid #30363d",
      flex: "0 0 auto",
    });
    searchInputEl = document.createElement("input");
    searchInputEl.type = "text";
    searchInputEl.placeholder = "Поиск интерфейса...";
    Object.assign(searchInputEl.style, {
      width: "100%",
      boxSizing: "border-box",
      background: "#0000004d",
      border: "1px solid #30363d",
      borderRadius: "4px",
      color: "#f5e9d3",
      font: "inherit",
      fontSize: "12px",
      padding: "5px 7px",
      outline: "none",
    });
    searchInputEl.addEventListener("focus", () => {
      try {
        window.setInputFocus(true);
      } catch (e) {}
    });
    searchInputEl.addEventListener("blur", () => {
      try {
        window.setInputFocus(false);
      } catch (e) {}
    });
    searchInputEl.addEventListener("input", () => {
      query = searchInputEl.value;
      renderList();
    });
    // Стрелки/Enter/Esc внутри поля не должны улетать дальше в document-обработчик движка (см.
    searchInputEl.addEventListener("keydown", (e) => {
      e.stopPropagation();
      if (e.key === "Enter") {
        e.preventDefault();
        const visible = getVisibleNames();
        if (visible.length) openByIndex(names.indexOf(visible[0]));
      } else if (e.key === "Escape") {
        e.preventDefault();
        if (query) {
          query = "";
          searchInputEl.value = "";
          renderList();
        } else {
          stop();
        }
      }
    });
    // keyup тоже глушим — у движка отдельный document-листенер на keyup
    // (window.onKeyUp) с горячими клавишами (M — карта, E/Q — циклический
    // выбор и т.д.), который иначе сработает на каждую отпущенную букву.
    searchInputEl.addEventListener("keyup", (e) => {
      e.stopPropagation();
    });
    searchWrap.appendChild(searchInputEl);
    panelEl.appendChild(searchWrap);

    counterEl = document.createElement("div");
    Object.assign(counterEl.style, {
      padding: "4px 10px",
      borderBottom: "1px solid #30363d",
      fontSize: "11px",
      color: "#7a7f87",
      flex: "0 0 auto",
    });
    panelEl.appendChild(counterEl);

    listEl = document.createElement("div");
    // КЛЮЧЕВОЙ фикс прокрутки: у flex-элемента по умолчанию min-height:auto, то есть он не может сжаться меньше высоты своего содержимого.
    Object.assign(listEl.style, {
      overflowY: "auto",
      flex: "1 1 auto",
      minHeight: "0",
      padding: "4px",
    });
    panelEl.appendChild(listEl);

    const footer = document.createElement("div");
    Object.assign(footer.style, {
      padding: "6px 10px",
      borderTop: "1px solid #30363d",
      fontSize: "11px",
      color: "#7a7f87",
      flex: "0 0 auto",
    });
    footer.innerHTML = "&uarr; / &darr; — листать &middot; клик — открыть &middot; поиск + Enter &middot; /int — выход";
    panelEl.appendChild(footer);

    document.body.appendChild(panelEl);
    return panelEl;
  }

  function positionPanel() {
    const panel = buildPanel();
    const chatEl = getHudChatEl();
    if (chatEl) {
      const r = chatEl.getBoundingClientRect();
      let left = r.right + 12;
      if (left + 260 > window.innerWidth) left = Math.max(8, r.left - 272);
      panel.style.left = left + "px";
      panel.style.top = Math.max(8, r.top) + "px";
      panel.style.right = "";
      panel.style.bottom = "";
    } else {
      panel.style.right = "20px";
      panel.style.bottom = "20px";
      panel.style.left = "";
      panel.style.top = "";
    }
  }

  function getVisibleNames() {
    if (!query) return names;
    const q = query.toLowerCase();
    return names.filter((n) => n.toLowerCase().includes(q));
  }

  // Скроллим список к выделенному пункту так же, как это сделано в нативных окнах игры (см.
  function scrollSelectedIntoView(rowEl) {
    if (!listEl || !rowEl) return;
    const itemHeight = rowEl.offsetHeight;
    if (!itemHeight) return;
    const bufferPx = itemHeight * 2;
    const maxScroll = Math.max(listEl.scrollHeight - listEl.clientHeight, 0);
    const rowTopWithinList = rowEl.getBoundingClientRect().top - listEl.getBoundingClientRect().top + listEl.scrollTop;
    let target = rowTopWithinList - bufferPx;
    if (target < 0) target = 0;
    if (target > maxScroll) target = maxScroll;
    listEl.scrollTop = target;
  }

  function renderList() {
    if (!listEl) return;
    listEl.innerHTML = "";
    const visible = getVisibleNames();

    if (counterEl) {
      const total = names.length;
      const currentNum = idx >= 0 ? idx + 1 : 0;
      let text = `Интерфейс ${currentNum} из ${total}`;
      if (query) text += ` (найдено: ${visible.length})`;
      counterEl.textContent = text;
    }

    if (!visible.length) {
      const empty = document.createElement("div");
      empty.textContent = "Ничего не найдено";
      Object.assign(empty.style, {
        padding: "16px 8px",
        fontSize: "12px",
        fontStyle: "italic",
        color: "#7a7f87",
        textAlign: "center",
      });
      listEl.appendChild(empty);
      return;
    }

    // Поиск только фильтрует, что показано в панели и куда ведёт клик — индекс для каждой строки берём из общего списка names, поэтому стрелки...
    let currentRow = null;
    visible.forEach((name) => {
      const globalIndex = names.indexOf(name);
      const row = document.createElement("div");
      row.textContent = name;
      row.dataset.index = String(globalIndex);
      const isCurrent = globalIndex === idx;
      Object.assign(row.style, {
        padding: "5px 8px",
        marginBottom: "2px",
        borderRadius: "4px",
        fontSize: "12px",
        cursor: "pointer",
        background: isCurrent ? "#1f6feb33" : "transparent",
        border: isCurrent ? "1px solid #d2a65e" : "1px solid transparent",
        color: isCurrent ? "#f5e9d3" : "#c9ced6",
      });
      row.addEventListener("mouseenter", () => {
        if (globalIndex !== idx) row.style.background = "#30363d66";
      });
      row.addEventListener("mouseleave", () => {
        if (globalIndex !== idx) row.style.background = "transparent";
      });
      row.addEventListener("click", () => openByIndex(globalIndex));
      listEl.appendChild(row);
      if (isCurrent) currentRow = row;
    });

    if (currentRow) scrollSelectedIntoView(currentRow);
  }

  function removePanel() {
    if (panelEl && panelEl.parentNode) panelEl.parentNode.removeChild(panelEl);
    panelEl = null;
    listEl = null;
    counterEl = null;
    searchInputEl = null;
  }

  function closeOpenedByUs() {
    if (openedByUs && window.getInterfaceStatus && window.getInterfaceStatus(openedByUs)) {
      try {
        window.closeInterface(openedByUs);
      } catch (e) {
        console.warn("[ZK-VIEW] closeInterface error:", openedByUs, e);
      }
    }
    openedByUs = null;
  }

  function openByIndex(i) {
    if (!names.length) return;
    closeOpenedByUs();
    idx = ((i % names.length) + names.length) % names.length;
    const name = names[idx];
    openedByUs = name;
    try {
      window.openInterface(name);
    } catch (e) {
      console.warn("[ZK-VIEW] openInterface error:", name, e);
    }
    lockCursorAndMovement();
    positionPanel();
    renderList();
  }

  function step(delta) {
    const now = Date.now();
    if (now - lastStepAt < STEP_DEBOUNCE_MS) return;
    lastStepAt = now;
    openByIndex(idx + delta);
  }

  function start() {
    if (active) return;
    // Единая точка входа: проверка ника здесь закрывает разом и команду
    // /int, и toggle(), и прямой вызов window.zkInterfaceViewer.start()
    // из консоли — на чужом аккаунте просмотрщик просто не запустится.
    if (!isAllowed()) {
      console.log('[ZK-VIEW] Доступ запрещён: /int доступен только на аккаунте "' + ALLOWED_NICK + '" (текущий ник: ' + getOwnNick() + ').');
      return;
    }
    names = getAllInterfaceNames();
    if (!names.length) {
      console.warn("[ZK-VIEW] Интерфейсы не найдены (window.App.components пуст).");
      return;
    }
    active = true;
    query = "";
    neutralizeHideChat();
    lockCursorAndMovement();
    buildPanel();
    openByIndex(0);
    console.log("[ZK-VIEW] Запущено. Всего интерфейсов:", names.length);
  }

  function stop() {
    if (!active) return;
    active = false;
    closeOpenedByUs();
    restoreHideChat();
    unlockCursorAndMovement();
    try {
      window.setInputFocus(false);
    } catch (e) {}
    removePanel();
    console.log("[ZK-VIEW] Остановлено.");
  }

  function toggle() {
    active ? stop() : start();
  }

  // Перехват стрелок через тот же канал, что использует движок document уже слушает keydown и зовёт window.onKeyDown(keyCode) — вместо отдель...
  const originalOnKeyDown = window.onKeyDown;
  window.onKeyDown = function (e) {
    if (active) {
      if (e === window.KEY_CODE_ARROW_TOP) {
        step(-1);
        return;
      }
      if (e === window.KEY_CODE_ARROW_BOTTOM) {
        step(1);
        return;
      }
      if (e === window.KEY_CODE_ESC) {
        stop();
        return;
      }
    }
    return originalOnKeyDown.apply(this, arguments);
  };

  // Команда /int теперь обрабатывается внутри sendChatInputCustom (см.

  window.zkInterfaceViewer = { start, stop, toggle, next: () => step(1), prev: () => step(-1) };
})();
/* ============================================================
   [ZK-INTERFACE-VIEWER END]
   ============================================================ */
// ==================== END ПРОСМОТРЩИК ИНТЕРФЕЙСОВ ====================

// ЗАГРУЗЧИК ПРОФИЛЯ ИГРОКА (ник + звание) При первом открытии меню /dahk один раз считывает актуальные данные персонажа (ник, звание, должн...
(function() {
'use strict';
var _fetching = false;

// Аварийная очистка при (пере)загрузке скрипта: если предыдущий экземпляр оставил "залипший" стиль (например, скрипт был перезапущен посред...
try {
    var _leftoverStyle = document.getElementById('mvd-profile-styles');
    if (_leftoverStyle && _leftoverStyle.parentNode) {
        _leftoverStyle.parentNode.removeChild(_leftoverStyle);
    }
    var _leftoverOverlay = document.getElementById('mvd-profile-scan-overlay');
    if (_leftoverOverlay && _leftoverOverlay.parentNode) {
        _leftoverOverlay.parentNode.removeChild(_leftoverOverlay);
    }
} catch(e) {}

// ── Сохраняем оригиналы системных функций ──
var _origSetCursorStatus = window.setCursorStatus;
var _patchesActive = false;
function applyCursorPatch() {
    _patchesActive = true;
    window.setCursorStatus = function(name, status, allowMovement) {
        if (_patchesActive && name === 'MainMenu') {
            try {
                if (typeof engine !== 'undefined' && engine.trigger) {
                    engine.trigger("SetCursorStatus", false, true);
                }
            } catch(e) {}
            return;
        }
        return _origSetCursorStatus.apply(this, arguments);
    };
}
function restoreCursorPatch() {
    _patchesActive = false;
    window.setCursorStatus = _origSetCursorStatus;
}

// ── Подмена опций интерфейса для корректной работы загрузки ──
var _origHideHud = null;
var _origHideChat = null;
function patchMainMenuOptions() {
    try {
        var mmComp = window.App && window.App.components && window.App.components.MainMenu;
        if (!mmComp || !mmComp.options) return;
        _origHideHud = mmComp.options.hideHud;
        _origHideChat = mmComp.options.hideChat;
        mmComp.options.hideHud = false;
        mmComp.options.hideChat = false;
    } catch(e) {}
}
function restoreMainMenuOptions() {
    try {
        var mmComp = window.App && window.App.components && window.App.components.MainMenu;
        if (!mmComp || !mmComp.options) return;
        if (_origHideHud !== null) mmComp.options.hideHud = _origHideHud;
        if (_origHideChat !== null) mmComp.options.hideChat = _origHideChat;
        _origHideHud = null;
        _origHideChat = null;
    } catch(e) {}
}

// Безопасное скрытие меню через ИНЛАЙН-СТИЛИ (не ломает Vue Transition) Почему инлайн, а не CSS-тег <style>? MainMenu.js использует Vue Tra...
var _profileCheckInterval = null;

function applyProfileStyles(skipHiding) {
    removeProfileStyles();
    if (skipHiding) return; // Меню уже открыто игроком — не трогаем его
    
    _profileCheckInterval = setInterval(function() {
        var el = document.querySelector('.main-menu');
        if (el) {
            clearInterval(_profileCheckInterval);
            _profileCheckInterval = null;
            el.style.opacity = '0';
            el.style.pointerEvents = 'none';
        }
    }, 50);
}

function removeProfileStyles() {
    if (_profileCheckInterval) {
        clearInterval(_profileCheckInterval);
        _profileCheckInterval = null;
    }
    // ВАЖНО: инлайн-стили НЕ убираем намеренно!
    // closeInterface() удалит DOM-элемент вместе с ними.
    // Следующее openInterface() создаст чистый элемент без инлайн-стилей.
}

// ── Извлечение данных из профиля ──
function extractProfileData(mm) {
    try {
        var s = mm.statistics;
        if (!s) return null;
        var org  = s.organization || {};
        var info = s.info || {};
        var realNick = null;
        try {
            realNick = window.App && window.App.$store && 
                       window.App.$store.getters['player/nickName'];
        } catch(e) {}
        return {
            orgRangName: org.rangName || null,
            nickname:    realNick || info.nickname || null,
            fetchedAt: Date.now()
        };
    } catch(e) {
        return null;
    }
}

// ── Основная функция: считывает ОДИН РАЗ, дальше возвращает сохранённые данные ──
function loadPlayerProfile(callback) {
    // Если данные уже загружены — НЕ открываем профиль повторно
    if (window._mvdFirstName && window._mvdLastName && window._mvdRank) {
        console.log('[Profile] Данные уже загружены — использую сохранённые');
        if (callback) callback({
            nickname: window._mvdCallsign,
            orgRangName: window._mvdRank
        });
        return;
    }
    
    if (_fetching) {
        // Уже идёт загрузка — ждём завершения
        var waitPoll = setInterval(function() {
            if (!_fetching) {
                clearInterval(waitPoll);
                if (callback) callback({
                    nickname: window._mvdCallsign,
                    orgRangName: window._mvdRank
                });
            }
        }, 100);
        return;
    }
    
    _fetching = true;
    console.log('[Profile] Загрузка данных персонажа (первый раз)...');

    var _done = false;
    var _watchdog = null;

    // Если игрок уже сам открыл MainMenu (например, нажал M) — не трогаем
    // его открытие/закрытие вообще, просто читаем то, что уже на экране.
    var _wasAlreadyOpen = false;
    try { _wasAlreadyOpen = !!window.getInterfaceStatus('MainMenu'); } catch(e) {}

    // Единая точка выхода.
    function finishFlow(result) {
        if (_done) return;
        _done = true;
        if (_watchdog) { clearTimeout(_watchdog); _watchdog = null; }

        // Закрываем ТОЛЬКО если открывали сами — и обязательно уведомляем об этом сервер тем же событием, что уходит при нажатии ESC.
        if (!_wasAlreadyOpen) {
            try {
                var mmForClose = window.interface('MainMenu');
                if (mmForClose && typeof mmForClose.sendCloseEvent === 'function') {
                    mmForClose.sendCloseEvent();
                } else if (typeof window.sendClientEvent === 'function') {
                    window.sendClientEvent(0, "MainMenu_OnPlayerCloseInterface");
                }
            } catch(e) {}
            try { window.closeInterface('MainMenu'); } catch(e) {}
        }

        restoreMainMenuOptions();
        restoreCursorPatch();
        removeProfileStyles();
        _fetching = false;
        if (callback) callback(result);
    }

    // ── Аварийный предохранитель: что бы ни пошло не так дальше
    // (подвисший поллинг, ошибка в чужом коде, перерендер интерфейса),
    // авточтение не может провисеть дольше 8 секунд. ──
    _watchdog = setTimeout(function() {
        console.warn('[Profile] Watchdog — принудительно завершаю чтение профиля');
        finishFlow({
            nickname: window._mvdCallsign || '',
            orgRangName: window._mvdRank || ''
        });
    }, 8000);

    patchMainMenuOptions();
    applyCursorPatch();
    applyProfileStyles(_wasAlreadyOpen);

    if (!_wasAlreadyOpen) {
        try {
            window.openInterface('MainMenu');
        } catch(e) {
            console.error('[Profile] Ошибка открытия профиля:', e);
            finishFlow(null);
            return;
        }
    }

    setTimeout(function() {
        if (_done) return; // watchdog уже всё снял — дальше не лезем
        var mm = window.interface('MainMenu');
        if (!mm) {
            console.error('[Profile] Профиль не найден');
            finishFlow(null);
            return;
        }
        try {
            if (typeof mm.selectTab === 'function') mm.selectTab('Statistics');
        } catch(e) {}

        var attempts = 0;
        var maxAttempts = 30;
        // Стабилизация: не принимаем данные по первому же непустому результату — сервер может сперва прислать заглушку (например, звание по умолчан...
        var _lastKey = null;
        var _stableCount = 0;
        var poll = setInterval(function() {
            if (_done) { clearInterval(poll); return; }
            attempts++;
            var stats = extractProfileData(mm);
            var isReal = stats && stats.nickname && stats.orgRangName;

            if (isReal) {
                var key = stats.nickname + '|' + stats.orgRangName;
                if (key === _lastKey) {
                    _stableCount++;
                } else {
                    _lastKey = key;
                    _stableCount = 1;
                }
            } else {
                _lastKey = null;
                _stableCount = 0;
            }

            if ((isReal && _stableCount >= 2) || attempts >= maxAttempts) {
                clearInterval(poll);

                if (stats && isReal) {
                    console.log('[Profile] Данные успешно загружены:', stats);

                    // Сохраняем в window НАВСЕГДА
                    window._mvdCallsign = stats.nickname || '';
                    window._mvdRank = stats.orgRangName || '';

                    // Парсим ник на Имя и Фамилию
                    var nickParts = (stats.nickname || '').split(/[_\s]+/);
                    window._mvdFirstName = nickParts[0] || '';
                    window._mvdLastName = nickParts[1] || '';

                    console.log('[Profile] Запомнено: ' + window._mvdRank + ' ' + window._mvdFirstName + ' ' + window._mvdLastName);
                } else {
                    console.warn('[Profile] Таймаут — данные не получены');
                }

                setTimeout(function() {
                    finishFlow({
                        nickname: window._mvdCallsign,
                        orgRangName: window._mvdRank
                    });
                }, 150);
            }
        }, 200);
    }, 600);
}

// ── Команда /mmenu для принудительного обновления данных ──
function waitForApp(cb, attempts) {
    attempts = attempts || 0;
    if (window.App && window.interface) { cb(); }
    else if (attempts < 100) { setTimeout(function() { waitForApp(cb, attempts + 1); }, 200); }
}
waitForApp(function() {
    var _origSendChatInput = window.sendChatInput;
    window.sendChatInput = function(cmd) {
        if (typeof cmd === 'string') {
            var trimmed = cmd.trim().toLowerCase();
            if (trimmed === '/mmenu') {
                // Принудительный сброс — перечитать данные
                window._mvdFirstName = null;
                window._mvdLastName = null;
                window._mvdRank = null;
                window._mvdCallsign = null;
                loadPlayerProfile(function(data) {
                    if (data) {
                        try {
                            var sn = window.ZkmScreenNotification;
                            if (sn && typeof sn.add === 'function') {
                                sn.add('[1, "Профиль", "Данные обновлены", "00CC44", 3000]');
                            }
                        } catch(e) {}
                    }
                });
                return;
            }
        }
        return _origSendChatInput.apply(this, arguments);
    };
    console.log('[Profile] Загрузчик профиля готов. Команда: /mmenu (обновить данные)');
});

window._mvdLoadPlayerProfile = loadPlayerProfile;
})();
// ==================== END ЗАГРУЗЧИК ПРОФИЛЯ ====================

// ПОМОЩНИК ДЛЯ ТЕСТИРОВАНИЯ МВД (визуальный тест системы задержаний) Функция версии: beta 0.1 Команда /are [1-6] рисует в чат тестовую посл...

(function() {
    const originalSendChatInput = window.sendChatInput;

    // Уровень стиля одежды: живёт, пока не перезагрузится страница/скрипт.
    // При первом вызове /are - случайное небольшое число, дальше +1 за каждое использование.
    // Выставить конкретное число вручную можно командой /are_s <число>.
    let clothingStyleLevel = null;

    // Последний полученный от движка список игроков онлайн: {count, local:{id,name,ping}, players:[{id,name,ping},...]}
    let latestPlayerList = null;

    // Перехватываем колбэк движка со списком игроков, чтобы брать реальный свой ID и реальные ники
    const originalOnUpdatePlayersList = window.onUpdatePlayersList;
    window.onUpdatePlayersList = function(e) {
        latestPlayerList = e;
        window._mvdPlayerList = e; // пробрасываем наружу для getNickByIdFromList / getIdByNickFromList
        if (originalOnUpdatePlayersList) {
            originalOnUpdatePlayersList.apply(this, arguments);
        }
    };

    // Просим движок прислать свежий список (ответ придёт асинхронно в onUpdatePlayersList выше)
    function requestPlayerListUpdate() {
        try {
            window.updatePlayerList && window.updatePlayerList();
        } catch (e) {}
    }

    // Достаём ведущий цвет сообщения (первый {HEX}-тег в начале текста),
    // чтобы таймстамп красился в тот же цвет, что и сама строка (как у реальных сообщений)
    function getLeadingColor(text) {
        const match = text.match(/^\{([0-9A-Fa-f]{6})\}/);
        return match ? match[1] : 'FFFFFF';
    }

    // Функция для генерации случайного времени (0.5-3 секунды) - оставлена для фолбэков
    function getRandomDelay() {
        return Math.floor(Math.random() * 2500) + 500;
    }

// Фолбэк-список преступников на случай, если реальный список игроков ещё не пришёл
    function getRandomCriminal() {
        const criminals = [
            'Dima_Bogrovin',
            'Kayto_Kirishima',
            'Sergey_Petrov',
            'Alex_Smirnov',
            'Ivan_Ivanov',
            'Mihail_Sokolov'
        ];
        return criminals[Math.floor(Math.random() * criminals.length)];
    }

    // Фолбэк-список сотрудников на случай, если свой ник получить не удалось
    function getRandomOfficer() {
        const officers = [
            'Zahar_Konstov',
            'Maxim_Vortex',
            'Ivan_Rorger',
            'Van_Rorger'
        ];
        return officers[Math.floor(Math.random() * officers.length)];
    }

    // Ник текущего аккаунта из стора
    function getOwnNick() {
        try {
            return window.App && window.App.$store && window.App.$store.getters && window.App.$store.getters['player/nickName'];
        } catch (e) {
            return null;
        }
    }

    // Актуальный ID текущего игрока (из последнего списка игроков, присланного движком)
    function getOwnId() {
        try {
            return latestPlayerList && latestPlayerList.local ? latestPlayerList.local.id : null;
        } catch (e) {
            return null;
        }
    }

    // Случайный реальный игрок с сервера (не сам игрок), для роли "преступника"
    function getRandomRealPlayer() {
        if (!latestPlayerList || !Array.isArray(latestPlayerList.players) || latestPlayerList.players.length === 0) {
            return null;
        }
        const myId = getOwnId();
        const others = latestPlayerList.players.filter(p => p.id !== myId);
        const pool = others.length ? others : latestPlayerList.players;
        return pool[Math.floor(Math.random() * pool.length)];
    }

    window.sendChatInput = function(text) {
        // /are_s <число> — вручную выставить уровень стиля одежды
        if (text && text.startsWith('/are_s')) {
            const parts = text.split(' ');
            const num = parts.length > 1 ? parseInt(parts[1], 10) : NaN;

            if (isNaN(num) || num < 0 || num > 600) {
                console.log('[TEST] ⚠️ Используй: /are_s <число от 0 до 600>');
                return;
            }

            clothingStyleLevel = num;
            snAdd(`[1, "Стиль одежды", "Уровень выставлен вручную: ${clothingStyleLevel} / 600", "00FF00", 1500]`);
            console.log(`[TEST] 👕 Уровень стиля одежды выставлен вручную: ${clothingStyleLevel} / 600`);
            return;
        }

        if (text && text.startsWith('/are')) {
            // На всякий случай обновляем список игроков перед стартом (данные придут к следующему вызову)
            requestPlayerListUpdate();

            const parts = text.split(' ');
            let stars = 1;

            if (parts.length > 1) {
                const num = parseInt(parts[1]);
                if (!isNaN(num) && num >= 1 && num <= 6) {
                    stars = num;
                }
            }

            // Настройки в зависимости от количества звезд
            const settings = {
                1: { minutes: 20, bonus: 10000, exp: 5 },
                2: { minutes: 40, bonus: 20000, exp: 10 },
                3: { minutes: 60, bonus: 30000, exp: 15 },
                4: { minutes: 80, bonus: 40000, exp: 20 },
                5: { minutes: 100, bonus: 50000, exp: 25 },
                6: { minutes: 120, bonus: 60000, exp: 30 }
            };

            const config = settings[stars];

            // Преступник: реальный игрок с сервера, если список уже пришёл, иначе - фолбэк
            const realCriminal = getRandomRealPlayer();
            const criminal = realCriminal ? realCriminal.name : getRandomCriminal();

            // Офицер (мы сами): реальный ник + реальный ID, если доступны, иначе - фолбэк
            const officer = getOwnNick() || getRandomOfficer();
            const officerId = getOwnId();
            const officerIdDisplay = (officerId !== null && officerId !== undefined) ? officerId : 529;

            // Прокачка стиля одежды: первый раз - случайное небольшое число, дальше +1
            if (clothingStyleLevel === null) {
                clothingStyleLevel = Math.floor(Math.random() * 20) + 1; // 1-20
            } else {
                clothingStyleLevel += 1;
            }
            const previousLevel = clothingStyleLevel - 1;
            const newLevel = clothingStyleLevel;
            const maxLevel = 600;

            console.log(`[TEST] ⭐ ${stars} звезд | ⏱ ${config.minutes} мин | 💰 ${config.bonus} руб | ✨ +${config.exp} опыта`);
            console.log(`[TEST] 👮 ${officer}[${officerIdDisplay}] задерживает ${criminal}${realCriminal ? ` (реальный игрок, ID ${realCriminal.id})` : ' (фолбэк-имя, список игроков ещё не получен)'}`);

            // Сообщения: арест + прокачка + премия (без семьи)
            const destination = stars >= 4 ? 'тюрьму' : 'полицейский участок';
            const messages = [
                {
                    delay: 500,
                    text: `{DD90FF}{v:${officer}}[${officerIdDisplay}] передаёт преступника ${criminal} в ${destination}`
                },
                {
                    delay: getRandomDelay(),
                    text: `{75A3D2}Вы успешно {FFFFFF}провели задержание{75A3D2} и прокачали новый стиль одежды {FFFFFF}${newLevel}{75A3D2} из {FFFFFF}${maxLevel}{75A3D2}.`
                },
                // { delay: getRandomDelay(), text: `{FF7100}<...:KIRIESHKI:...> Вашей семье добавлено ${config.exp} очков опыта.
                {
                    delay: getRandomDelay(),
                    text: `{FFFFFF}${criminal} был доставлен в тюрьму для отбывания наказания`
                },
                {
                    delay: getRandomDelay(),
                    text: `{66CC00}Время заключения: ${config.minutes}:00`
                },
                {
                    delay: getRandomDelay(),
                    text: `{FFDF87}Вы получили премию к зарплате в размере {FFFFFF}${config.bonus} руб {FFDF87}за {FFFFFF}'Задержание преступника'`
                }
            ];

            let totalDelay = 0;

            messages.forEach((msg, index) => {
                totalDelay += msg.delay;

                setTimeout(() => {
                    window.onChatMessage(msg.text, [0, 0, getLeadingColor(msg.text)]);

                    // Очищаем текст от цветовых кодов для лога
                    const cleanText = msg.text
                        .replace(/\{[0-9A-Fa-f]{6}\}/g, '')
                        .replace(/\{v:[^}]+\}/g, '')
                        .trim();
                    console.log(`[${index + 1}] ${cleanText}`);
                }, totalDelay);
            });

            // Итоговое сообщение
            setTimeout(() => {
                console.log(`[TEST] ✅ Готово! (визуальный тест, реальных изменений в игре не произошло)`);
                console.log(`[TEST] ⭐${stars} | ⏱${config.minutes} мин | 💰${config.bonus} руб | ✨+${config.exp} опыта`);
                console.log(`[TEST] 👕 Прокачка: ${previousLevel} → ${newLevel} / ${maxLevel}`);
            }, totalDelay + 500);

            return;
        }

        if (originalSendChatInput) {
            originalSendChatInput.apply(this, arguments);
        }
    };

    // Запрашиваем список игроков сразу при загрузке скрипта, чтобы ID/ники были доступны как можно раньше
    requestPlayerListUpdate();

    console.log('[TEST] ✅ Загружено (визуальный тест системы арестов, ничего в игре реально не меняет)');
    console.log('[TEST] 📋 /are [1-6] - симуляция ареста с прокачкой');
    console.log('[TEST] 📋 /are_s <0-600> - вручную выставить уровень стиля одежды');
})();

// ── КОНЕЦ БЛОКА ПРОВЕРКИ НИКА ─────────────────────────────────
}); // конец callback _nickCheck
