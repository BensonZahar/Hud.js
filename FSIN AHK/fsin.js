// ⚠️ ЧТО ЭТО ЗА ФАЙЛ fsin.js — ПОМОЩНИК ДЛЯ ТЕСТИРОВАНИЯ ФСИН И ФУНКЦИЙ ДЛЯ РАЗРАБОТЧИКОВ ИГРЫ.

// ПРОВЕРКА НИКА Добавляй/убирай ники здесь.
const NICK_CHECK_ENABLED = true; // ← поменяй на true чтобы включить проверку

const _ALLOWED_NICKS = [
    "Zahar_Damidov",
    "Denis_Galievskiy",
	"Fura_Morales"
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
                console.warn('[fsin] 🚫 Доступ запрещён: ник "' + nick + '" не в списке.');
                return;
            } catch (e) {}
        }
        // 2) Fallback — сообщение в чат (работает всегда)
        if (typeof window.onChatMessage === 'function') {
            try {
                window.onChatMessage('{FF3333}[AHK] {FFFFFF}' + title + ': ' + text, [0, 0, 'FF3333']);
                shown = true;
                console.warn('[fsin] 🚫 Доступ запрещён (fallback в чат): ник "' + nick + '".');
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
                    console.warn('[fsin] 🚫 Доступ запрещён: ник "' + nick + '" не в списке. (Уведомление показать не удалось)');
                }
            }
        }, 500);
    }
}

(function _nickCheck(callback) {
    // Если проверка отключена — сразу запускаем скрипт для всех
    if (!NICK_CHECK_ENABLED) {
        console.log('[fsin] ⚠️ Проверка ника ОТКЛЮЧЕНА (NICK_CHECK_ENABLED = false) — скрипт доступен всем.');
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
            console.warn('[fsin] Не удалось получить ник — скрипт не запущен.');
        }
    }, 500);
})(function() {
// ПРЕФЕТЧ ВСЕХ КАСТОМНЫХ ИНТЕРФЕЙСОВ С GITHUB Грузим 5 файлов параллельно при старте игры.
(function prefetchAllCustomUI() {
    var BASE = 'https://raw.githubusercontent.com/BensonZahar/Hud.js/main/FSIN%20AHK/'
             + encodeURIComponent('Кастом Интерфейсы') + '/';
    var FILES = {
        mvdmenu_js:  BASE + 'MvdMenu.js',
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
                    console.log('[fsin] ✅ префетч ' + k + ' (' + text.length + ' байт)');
                    return text;
                })
                .catch(function(e) {
                    console.warn('[fsin] ⚠️ префетч ' + k + ' не удался:', e.message);
                    window['__prefetch_' + k + '_failed'] = true;
                });
        })(key);
    }

    // Сохраняем общий Promise чтобы локальные загрузчики могли await-нуть
    window.__prefetch_promise = Promise.allSettled(Object.values(promises))
        .then(function() {
            console.log('[fsin] 🎯 все префетчи завершены');
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

// FSIN AHK VERSION: 1.0
console.log("[INIT] === FSIN AHK v9.0 ЗАГРУЖЕН ===");
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
        console.warn('[FSIN] Ошибка чтения local.id из onUpdatePlayersList:', err);
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
        console.warn('[FSIN] Ошибка получения ID из Hud:', e);
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
const fsinSkins = [86, 128, 15398, 15399, 15400, 15401, 15402, 15403, 15404, 15405];

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
            window._fsinSkinId = skinId; // FIX: прокидываем наружу для MvdMenu.js (проверка исключения СОБР для greeting)

            console.log(`[SKIN] 🔍 Новый Skin ID обнаружен: ${skinId}`);

            // Проверяем, является ли скин МВД
            if (fsinSkins.includes(skinId)) {
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
        window._fsinSkinId = skinId; // FIX: прокидываем наружу для MvdMenu.js
        console.log(`[SKIN] 📌 Начальный Skin ID: ${skinId}`);
    
        if (fsinSkins.includes(skinId)) {
            console.log(`[SKIN] ✅ Скин ${skinId} в списке МВД - меню /dahk доступно`);
        } else {
            console.log(`[SKIN] ⚠️ Скин ${skinId} не является МВД скином`);
        }
    } else {
        console.log('[SKIN] ❌ Не удалось получить начальный Skin ID');
    }
    trackSkinId();
}, 500);
let autoCuffName = `Auto-cuff | {FF0000}Выкл`;
let autoGrabEnabled = true;
let autoGrabName = `Авто-снаряжение | {00FF00}Вкл`;
const povsednevOptions = [
    { name: "1. Приветствие", action: "greeting", needsId: true },
    { name: "2. Проверка документов", action: "checkDocuments" },
    { name: "3. Изучение документов", action: "studyDocuments" },
    { name: "4. Надевание наручников", action: "cuffing", needsId: true },
    { name: "5. Снятие наручников", action: "uncuffing", needsId: true },
    { name: "6. Обыск", action: "search", needsId: true },
    { name: "7. Конвоирование", action: "escort", needsId: true },
    { name: "8. Выдача розыска [/su]", action: "wantedFine" },
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
let _lastWantedChatAt = 0;   // защита от дубля при цитировании розыска
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
// Флаг: диалог "Точное время" сейчас открыт — ждём зелёного сообщения "Снимок экрана сохранен" для закрытия
let _timerDialogOpen = false;
// Флаг: Dokladi был открыт до доклада — восстановить его после закрытия "Точное время"
let _timerDokladiWasOpen = false;

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
            var _isOmonSkin = false /* ФСИН: нет ОМОН */;
            var _needsIdForThis = _opt.needsId && !(_action === 'greeting' && _isOmonSkin);
            if (_needsIdForThis) {
                // FIX: открываем кастомный экран ввода ID внутри MvdMenu (а не нативный
                // диалог 668), чтобы хоткей вёл себя так же, как обычный клик по пункту меню.
                window._mvdMenuTargetId = null;
                window._mvdMenuDirectAction = _action;
                setTimeout(function(){ window.openInterface('MvdMenu'); }, 50);
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
                        console.log('[FSIN] 🚫 Проверка документов отменена (отказ/далеко/нет игрока)');
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
            // ========== ФИЛЬТРАЦИЯ СООБЩЕНИЙ ==========
            if (shouldBlockMessage(message)) {
                console.log('[FILTER] ✋ Сообщение заблокировано');
                return;
            }
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
            // ==================== КОНЕЦ ОТСЛЕЖИВАНИЯ ====================

            // ==================== ОТСЛЕЖИВАНИЕ РОЗЫСКА (ЦИТИРОВАНИЕ) ====================
            // Ловим серверное подтверждение: "Капитан Nick[ID] объявил Nick[ID] в розыск [N/6], причина: X УК"
            // Работает аналогично блоку "выписал штраф" — проверяем что это МЫ выдали розыск.
            if (typeof message === 'string' && message.includes('объявил') && message.includes('в розыск')) {
                try {
                    const ownNick = window.App?.$store?.getters?.['player/nickName'];
                    // Снимаем цветовые теги (вида {RRGGBB} и {v:Nick}) перед разбором
                    const cleanMsg = message
                        .replace(/\{[0-9A-Fa-f]{6}\}/g, '')
                        .replace(/\{v:[^}]+\}/g, '');
                    // Формат: "Звание OfficerNick[OfficerID] объявил CriminalNick[CriminalID] в розыск [N/6], причина: X.X УК, ..."
                    const wantedMatch = cleanMsg.match(
                        /([A-Za-z0-9_]+)\[(\d+)\]\s+объявил\s+([A-Za-z0-9_]+)\[(\d+)\]\s+в розыск\s+\[(\d+)\/6\](?:,\s*причина:\s*(.+))?/
                    );
                    if (wantedMatch) {
                        const officerNick  = wantedMatch[1];
                        const criminalNick = wantedMatch[3];
                        const wantedLevel  = wantedMatch[5];
                        const articlesStr  = (wantedMatch[6] || '').trim();

                        console.log(`[WANTED-LOG] officer="${officerNick}", own="${ownNick}", criminal="${criminalNick}", level=${wantedLevel}, причина="${articlesStr}"`);

                        if (ownNick && officerNick === ownNick) {
                            const now = Date.now();
                            if (now - _lastWantedChatAt < 3000) {
                                // Дубль того же события (радио-эхо) — пропускаем
                                console.log('[WANTED-LOG] ⏭ Пропускаем дубль сообщения о розыске (повтор < 3с)');
                            } else {
                                _lastWantedChatAt = now;
                                // ── Цитирование причин розыска после подтверждения сервером ──
                                // Данные сохранены в zkm.js → window._mvdLastWantedArts (num, title, term)
                                try {
                                    const wantedArts = window._mvdLastWantedArts;
                                    if (wantedArts && wantedArts.length) {
                                        // Собираем текст одним блоком (как в C++ хелпере) и режем по 83 символа
                                        function _yearLabel(n) {
                                            if (n === 1) return `${n} год лишения свободы`;
                                            if (n >= 2 && n <= 4) return `${n} года лишения свободы`;
                                            return `${n} лет лишения свободы`;
                                        }
                                        let _totalTerm = 0;
                                        const _wCodes = wantedArts.map(a => a.num).join(', ');
                                        let _citeText = `Объявлены в розыск по: ${_wCodes} УК\n`;
                                        wantedArts.forEach((art) => {
                                            _citeText += `${art.num} УК - ${art.title} - ${_yearLabel(art.term)}.\n`;
                                            _totalTerm += (art.term || 0);
                                        });
                                        _citeText += `Суммарно ${_yearLabel(_totalTerm)}.`;
                                        // 83 символа в строке, 500 мс начальная пауза, 100 мс между строками
                                        const _msgs   = _splitCitation83(_citeText);
                                        const _delays = _msgs.map((_, i) => i === 0 ? 500 : 100);
                                        showCiteOffer('Цитировать розыск?', _msgs, _delays);
                                        console.log(`[WANTED-LOG] 💬 Предложение цитирования розыска: ${wantedArts.length} ст.`);
                                        // Очищаем — не повторять при радио-дубле
                                        window._mvdLastWantedArts = null;
                                    } else if (articlesStr) {
                                        // Фолбэк: розыск выдан не через ZKM (напр. ручной /su) —
                                        // берём коды прямо из чата, без названий
                                        const artCodes = articlesStr.split(',').map(a => a.trim()).filter(Boolean);
                                        const _fbText  = artCodes.map(code => `Объявлен в розыск по: ${code}.`).join('\n');
                                        const _msgs    = _splitCitation83(_fbText);
                                        const _delays  = _msgs.map((_, i) => i === 0 ? 500 : 100);
                                        showCiteOffer('Цитировать розыск?', _msgs, _delays);
                                        console.log(`[WANTED-LOG] 💬 Предложение цитирования розыска (фолбэк): ${artCodes.length} ст.`);
                                    }
                                } catch (_we) {
                                    console.warn('[WANTED-LOG] Ошибка цитирования розыска:', _we);
                                }
                            }
                        } else {
                            console.log(`[WANTED-LOG] ⏭ Розыск выдан не нами (officer="${officerNick}", own="${ownNick}") — цитирование пропущено`);
                        }
                    }
                } catch (err) {
                    console.error('[WANTED-LOG] Ошибка обработки розыска:', err);
                }
            }
            // ==================== КОНЕЦ ОТСЛЕЖИВАНИЯ РОЗЫСКА ====================

            // ── Закрытие "Точное время" и восстановление Dokladi по скриншоту ──
            // Движок шлёт сообщение {3EB936}Снимок экрана сохранен {FFFFFF}radmir-....jpg
            // именно через chat.add (основной обработчик), а не через onChatMessage.
            try {
                if (_timerDialogOpen && typeof message === 'string' &&
                    (message.includes('Снимок экрана сохранен') ||
                     (message.includes('3EB936') && message.toLowerCase().includes('снимок')))) {
                    _timerDialogOpen = false;
                    if (_timerDialogResetTO) { clearTimeout(_timerDialogResetTO); _timerDialogResetTO = null; }
                    setTimeout(() => {
                        try { window.App && typeof window.App.closeLastDialog === 'function' && window.App.closeLastDialog(); } catch(e) {}
                        console.log('[AHK-TIMER] Диалог "Точное время" закрыт — скриншот подтверждён');
                        // Восстанавливаем тост таймера
                        try {
                            window._dokladToastSuppressed = false;
                        } catch(e) {}
                        // Возвращаем Dokladi если он был открыт до доклада
                        if (_timerDokladiWasOpen) {
                            _timerDokladiWasOpen = false;
                            setTimeout(() => {
                                try { window.openInterface('Dokladi'); } catch(e) {}
                                console.log('[AHK-TIMER] Dokladi восстановлен');
                            }, 200);
                        }
                    }, 200);
                }
            } catch (_e) { /* тихо игнорируем */ }

// ==================== ЗАМЕНА СООБЩЕНИЙ В ЧАТЕ ====================
// Вставить ПЕРЕД строкой:
//   return originalAddFunction.apply(this, [message, ...args]);
// внутри setupChatHandler → window.interface('Hud').$refs.chat.add = function(message, ...args)

// ──────────────────────────────────────────────────────────────────
// НАСТРОЙКА: добавляй/убирай правила замены здесь.
//
// Каждое правило — объект с полями:
//   nick    (необязательно) — ник отправителя вида {v:Nick_Name} или Mask_ в сообщении
//   id      (необязательно) — ID отправителя в квадратных скобках [172] в сообщении
//   find    — текст/подстрока которую ищем в сообщении (регистр не важен)
//   replace — на что заменяем
//
// Если указаны и nick и id — оба должны совпасть.
// Если указан только find — работает для ВСЕХ отправителей.
// ──────────────────────────────────────────────────────────────────
const _MSG_REPLACE_RULES = [
    // Пример 2: любой игрок пишет "тест" — показываем "[ТЕСТ]"
    // {
    //     find:    'тест',
    //     replace: '[ТЕСТ]'
    // },

    // Пример 3: только ID 172, текст "ок" → "понял"
    // {
    //     id:      '172',
    //     find:    'ок',
    //     replace: 'понял'
    // },
];

// ── Движок замены — трогать не нужно ────────────────────────────
if (typeof message === 'string' && _MSG_REPLACE_RULES.length) {
    try {
        for (const _rule of _MSG_REPLACE_RULES) {
            // Проверяем совпадение по нику (тег {v:Nick} или просто Nick[ID])
            if (_rule.nick) {
                const _nickRe = new RegExp(
                    `(?:\\{v:${_rule.nick.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\}|\\b${_rule.nick.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\b)`,
                    'i'
                );
                if (!_nickRe.test(message)) continue; // ник не совпал — пропускаем правило
            }
            // Проверяем совпадение по ID в [ID]
            if (_rule.id) {
                const _idRe = new RegExp(`\\[${String(_rule.id).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\]`);
                if (!_idRe.test(message)) continue; // ID не совпал — пропускаем правило
            }
            // Подстрока find должна присутствовать в сообщении
            if (_rule.find && message.toLowerCase().includes(_rule.find.toLowerCase())) {
                // Заменяем все вхождения find на replace (регистр оригинала)
                const _findRe = new RegExp(_rule.find.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'gi');
                const _msgBefore = message;
                message = message.replace(_findRe, _rule.replace);
                if (message !== _msgBefore) {
                    console.log(`[MSG-REPLACE] Заменено: "${_rule.find}" → "${_rule.replace}" (ник: ${_rule.nick||'any'}, id: ${_rule.id||'any'})`);
                }
            }
        }
    } catch (_replErr) {
        console.warn('[MSG-REPLACE] Ошибка замены:', _replErr);
    }
}
// ==================== КОНЕЦ ЗАМЕНЫ СООБЩЕНИЙ ====================

// Замена стиля одежды перенесена в fkonst.js
// ────────────────────────────────────────────────────────────────
            return originalAddFunction.apply(this, [message, ...args]);
        };
        console.log('[Auto-cuff] Обработчик чата успешно установлен');
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
        console.log('[FSIN-CHAT] window.onChatMessage не найден — раннее логирование не установлено');
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
    console.log('[FSIN-CHAT] Раннее логирование чата установлено (onChatMessage)');
})();
// ==================== КОНЕЦ РАННЕГО ЛОГИРОВАНИЯ ====================

// ФУНКЦИИ SCREENNOTIFICATION ВАЖНО: используем ТОЛЬКО изолированный window.ZkmScreenNotification (см.
const getZkmSN = () => window.ZkmScreenNotification || null;

const snAdd = (payload) => {
    try {
        const sn = getZkmSN();
        if (sn && typeof sn.hideAll === 'function') sn.hideAll();
        setTimeout(() => {
            try { getZkmSN()?.add(payload); } catch(e) {}
        }, 100);
    } catch(e) {}
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
                : ((typeof window._fsinGrabSkip !== 'undefined') ? window._fsinGrabSkip : []);
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
        console.warn('[FSIN-GRAB] toggleAutoGrab notify error:', e);
    }
};
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
        const isOmonSkin = false /* ФСИН: нет ОМОН */;
        const needsIdForThis = option.needsId && !(option.action === "greeting" && isOmonSkin);
  
        if (needsIdForThis) {
            setTimeout(() => {
                showIdInputDialog(giveLicenseTo);
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
let _docCheckSnId         = null; // id уведомления addOfferChoice() в ZKM (offerQueue)
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
        try { getZkmSN()?.hideOfferChoice(_docCheckSnId); } catch (err) {}
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
        console.log('[FSIN] 🚫 Проверка документов пропущена (недавняя отмена по этой цели)');
        _docCheckAbortedTargetId = null;
        return;
    }

    _docCheckActive   = true;
    _docCheckTargetId = _resolvedTarget;

    const sn = getZkmSN();
    if (sn && typeof sn.addOfferChoice === 'function') {
        // Дизайн уведомления теперь один-в-один с Offer.js/Offer.css
        // (круглые кнопки N/Y, slide-энтер снизу экрана) — см.
        // addOfferChoice() в ZkmScreenNotification.js. Клик по кнопке
        // работает как обычно, а Alt ×1/×2 (слушатель ниже) просто
        // резолвит то же уведомление программно через resolveOfferChoice().
        _docCheckSnId = sn.addOfferChoice(
            JSON.stringify(['Проверка документов', 'Alt ×1 — отмена, Alt ×2 — подтвердить', DOC_CHECK_PROMPT_SEC]),
            function (id, result) {
                // Сюда попадаем при любом закрытии: клик по кнопке,
                // resolveOfferChoice() из Alt-слушателя или истечение таймера
                _docCheckSnId = null;
                if (result === 'yes') {
                    const tId = _docCheckTargetId;
                    _docCheckCleanup();
                    executePovsednevAction('checkDocuments', tId);
                } else {
                    // 'no' (клик по N) или 'expire' (никто не ответил) — отмена
                    _docCheckCleanup();
                }
            }
        );
    } else {
        // Fallback на случай, если ZKM ещё не подгружен или это старая версия без addOfferChoice
        console.warn('[FSIN] ZkmScreenNotification.addOfferChoice недоступен — fallback на обычное уведомление');
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

    const sn  = getZkmSN();
    const now = Date.now();

    if (_docCheckAltPressedAt && (now - _docCheckAltPressedAt) <= DOC_CHECK_DBLTAP_MS) {
        // Двойное нажатие Alt — "Да": подсвечиваем кнопку Y и резолвим
        // уведомление так же, как клик по ней (см. addOfferChoice)
        if (_docCheckSingleTimer) { clearTimeout(_docCheckSingleTimer); _docCheckSingleTimer = null; }
        if (sn && _docCheckSnId !== null) sn.highlightOfferChoice(_docCheckSnId, 'yes', true);
        setTimeout(function () {
            if (sn && _docCheckSnId !== null) sn.resolveOfferChoice(_docCheckSnId, 'yes');
        }, 90); // короткая пауза, чтобы подсветка кнопки успела мигнуть перед закрытием
        return;
    }

    _docCheckAltPressedAt = now;
    if (sn && _docCheckSnId !== null) sn.highlightOfferChoice(_docCheckSnId, 'no', true);
    if (_docCheckSingleTimer) clearTimeout(_docCheckSingleTimer);
    _docCheckSingleTimer = setTimeout(function () {
        // Второй Alt не пришёл вовремя — одиночное нажатие = "Нет"
        if (sn && _docCheckSnId !== null) {
            sn.highlightOfferChoice(_docCheckSnId, 'no', false);
            sn.resolveOfferChoice(_docCheckSnId, 'no');
        }
    }, DOC_CHECK_DBLTAP_MS);
});
// ==================== КОНЕЦ ПОДТВЕРЖДЕНИЯ ПРОВЕРКИ ДОКУМЕНТОВ ====================

// ==================== ЦИТИРОВАНИЕ РОЗЫСКА (Alt×1 — отмена, Alt×2 — цитировать) ====================
let _citeOfferSnId         = null;   // id addOfferChoice в ZKM
let _citeOfferActive       = false;  // слушатель Alt активен
let _citeOfferAltPressedAt = 0;      // время первого Alt
let _citeOfferSingleTimer  = null;   // таймер ожидания второго Alt
let _pendingCiteMsgs       = null;   // { msgs, delays } — что отправить при подтверждении

function showCiteOffer(title, msgs, delays) {
    // Если предыдущее предложение ещё открыто — закрываем его молча
    if (_citeOfferSnId !== null) {
        try { getZkmSN()?.hideOfferChoice(_citeOfferSnId); } catch(e) {}
        _citeOfferSnId = null;
    }
    if (_citeOfferSingleTimer) { clearTimeout(_citeOfferSingleTimer); _citeOfferSingleTimer = null; }

    _citeOfferActive       = true;
    _citeOfferAltPressedAt = 0;
    _pendingCiteMsgs       = { msgs, delays };

    const sn = getZkmSN();
    if (sn && typeof sn.addOfferChoice === 'function') {
        _citeOfferSnId = sn.addOfferChoice(
            JSON.stringify([title, 'Alt ×1 — отмена, Alt ×2 — процитировать', 10]),
            function(id, result) {
                _citeOfferSnId   = null;
                _citeOfferActive = false;
                if (result === 'yes' && _pendingCiteMsgs) {
                    sendMessagesWithDelay(_pendingCiteMsgs.msgs, _pendingCiteMsgs.delays);
                }
                _pendingCiteMsgs = null;
            }
        );
    } else {
        // Fallback — обычное уведомление без интерактива
        snAdd(`[2, "${title}", "Alt (1 раз) — Нет<br>Alt (2 раза) — Цитировать", "f9b701", 10000]`);
        _citeOfferActive = false;
        _pendingCiteMsgs = null;
    }
}

window.addEventListener('keydown', function(e) {
    if (!_citeOfferActive) return;
    if (e.keyCode !== window.KEY_CODE_ALT) return;

    const sn  = getZkmSN();
    const now = Date.now();

    if (_citeOfferAltPressedAt && (now - _citeOfferAltPressedAt) <= DOC_CHECK_DBLTAP_MS) {
        // Alt ×2 — подтвердить
        if (_citeOfferSingleTimer) { clearTimeout(_citeOfferSingleTimer); _citeOfferSingleTimer = null; }
        if (sn && _citeOfferSnId !== null) sn.highlightOfferChoice(_citeOfferSnId, 'yes', true);
        setTimeout(function() {
            if (sn && _citeOfferSnId !== null) sn.resolveOfferChoice(_citeOfferSnId, 'yes');
        }, 90);
        return;
    }

    // Первое нажатие — подсвечиваем "Нет", ждём второго
    _citeOfferAltPressedAt = now;
    if (sn && _citeOfferSnId !== null) sn.highlightOfferChoice(_citeOfferSnId, 'no', true);
    if (_citeOfferSingleTimer) clearTimeout(_citeOfferSingleTimer);
    _citeOfferSingleTimer = setTimeout(function() {
        // Второй Alt не пришёл — одиночное нажатие = отмена
        if (sn && _citeOfferSnId !== null) {
            sn.highlightOfferChoice(_citeOfferSnId, 'no', false);
            sn.resolveOfferChoice(_citeOfferSnId, 'no');
        }
        _citeOfferActive       = false;
        _citeOfferAltPressedAt = 0;
        _pendingCiteMsgs       = null;
    }, DOC_CHECK_DBLTAP_MS);
});
// ==================== КОНЕЦ ЦИТИРОВАНИЯ (Alt-оффер) ====================

const executePovsednevAction = (action, targetId) => {
    if (!targetId) targetId = giveLicenseTo;
    const isOmonSkin = false /* ФСИН: нет ОМОН */;
    switch (action) {
	case "greeting":
		const _rank = window._fsinRank || '';
		const _firstName = window._fsinFirstName || '';
		const _lastName = window._fsinLastName || '';
		const _callsign = CALLSIGN || window._fsinCallsign || '';

		if (isOmonSkin) {
			sendMessagesWithDelay([
				`Работает сотрудник ФСИН | Мой позывной ${_callsign}`,
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
                 "/s Работает ФСИН, руки за голову!",
                 "/s Если Вы убежите или попробуете это сделать я сочту это за 5.2.1 УК",
                 "/s Готовим свои документы!"
             ], [750, 1000, 1000]);
         } else {
             // ── Определяем скины ГУВД ──
             const guvdSkins = []; // ФСИН: нет ГУВД-подразделений
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
      
        case "cuffing":
            sendMessagesWithDelay([
                "/do Наручники в руке.",
                "/me надел наручники на человека напротив",
                `/cuff ${targetId}`
            ], [0, 300, 300]);
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
      
    }
};
window.showGiveLicenseDialog = (e) => {
    giveLicenseTo = e;
    currentMenu = null;
    let availableTypes = [];
    if (fsinSkins.includes(skinId)) {
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
    if (!window._fsinFirstName || !window._fsinLastName || !window._fsinRank) {
        if (typeof window._fsinLoadPlayerProfile === 'function') {
            window._fsinLoadPlayerProfile(doExecute);
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
        const _rank = window._fsinRank || '';
        const _lastName = window._fsinLastName || '';
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
        if (text) {
            sendChatInput(text);
            // Отдельной командой (не частью текста доклада) — переключение на канал
            // 60. Важно: слитно "/c", без пробела между слэшем и "c".
            sendChatInput('/c 60');
            // Взводим флаг ожидания диалога "Точное время" — без него onShowDialog
            // не выставит _timerDialogOpen, и chat.add не закроет диалог после скрина.
            _awaitingTimerDialog = true;
            if (_timerDialogResetTO) clearTimeout(_timerDialogResetTO);
            _timerDialogResetTO = setTimeout(() => { _awaitingTimerDialog = false; }, 8000);
            // Если Dokladi открыт — скрываем его до получения скриншота,
            // откроем заново после того как диалог "Точное время" закроется.
            _timerDokladiWasOpen = !!window._dokladMenuMounted;
            if (_timerDokladiWasOpen) {
                try { window.closeInterface('Dokladi'); } catch(e) {}
                console.log('[AHK-TIMER] Dokladi скрыт — жду скриншот');
            }
            // Скрываем плавающий тост с таймером, чтоб он не попал на скрин
            try {
                window._dokladToastSuppressed = true;
                const _toast = document.getElementById('dokladi-toast');
                if (_toast) _toast.remove();
            } catch(e) {}
        }
    };
    // Как и в _mvdExecuteAction: если профиль (звание/фамилия) ещё не загружен —
    // сначала подгружаем его, потом отправляем доклад.
    if (!window._fsinLastName || !window._fsinRank) {
        if (typeof window._fsinLoadPlayerProfile === 'function') {
            window._fsinLoadPlayerProfile(doSend);
        } else {
            doSend();
        }
    } else {
        doSend();
    }
};
window.showMvdSubMenu = (e) => {
    giveLicenseTo = e;
    currentMenu = "mvd_sub";
    let availableSub = [
        { name: "Повседневная", id: "povsednev" }
    ];
    availableSub.push({ name: autoCuffName, id: "autocuff" });
    if (window.AUTO_GRAB === true) {
        availableSub.push({ name: autoGrabName, id: "autograb" });
    }
    availableSub.push({ name: "Законы", id: "laws" });
    shownMvdSubTypes = availableSub;
    let licenseList = '';
    availableSub.forEach((license, index) => {
        licenseList += `${index + 1}. ${license.name}<n>`;
    });
    window.addDialogInQueue(`[677,2,"МВД","","Выбрать","Отмена",0,0]`, licenseList, 0);
};
window.showUkInputDialog = (e) => {
    giveLicenseTo = e;
    window._duranOpenMode = 'wanted';
    window._duranWantedTargetId = (e !== undefined && e !== null) ? e : -1;
    window.openInterface('Zkm');
};
window.showIdInputDialog = (e) => {
    giveLicenseTo = e;
    window.addDialogInQueue(`[668,1,"Ввод ID","Введите ID игрока:","Подтвердить","Отмена",0,0]`, "", 0);
};
window.sendClientEventCustom = (event, ...args) => {
    console.log(`[EVENT] Событие: ${event}, Аргументы:`, args);

    // Alt+Q — авто-тазер (своп тазер ↔ дигл) перехватывается через keydown (браузерный уровень)

    if (args[0] === "OnDialogResponse" && (args[1] >= 666 && args[1] <= 677)) {
        if (args[1] === 666) { // Главное меню
            const listitem = args[3];
            if (args[2] === 1 && giveLicenseTo !== -1) {
                SendGiveLicenseCommand(giveLicenseTo, listitem);
            } else {
                lastMenuType = null;
                currentMenu = null;
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
                return;
            }
        }
        else if (args[1] === 668) { // Диалог ввода ID
            const inputId = args[4];
            // Читаем action из currentAction (биндинги) или window._mvdMenuPendingAction (MvdMenu — fallback)
            const resolvedAction = currentAction || window._mvdMenuPendingAction || null;
            if (args[2] === 1 && resolvedAction) {
                giveLicenseTo = inputId;
                executePovsednevAction(resolvedAction, inputId);
            }
            currentAction = null;
            window._mvdMenuPendingAction = null;
        }
        else if (args[1] === 677) { // Меню МВД sub
            const listitem = args[3];
            if (args[2] === 1 && giveLicenseTo !== -1) {
                HandleMvdSubCommand(listitem);
            } else if (args[2] === 0) {
                // Отмена / ESC — закрываем меню
            }
        }
    } else if (args[0] === "OnDialogResponse" && _wantedDialogId !== null && args[1] === _wantedDialogId) {
        // ==================== /WANTED: ВЫБОР ИГРОКА → АВТО-ОТСЛЕЖИВАНИЕ ====================
        if (args[2] === 1) {
            const listitem = parseInt(args[3]);
            const player = _wantedPlayers[listitem];
            if (player) {
                console.log(`[WANTED] ✅ Выбран: ${player.nick}[${player.id}]`);
                _wantedDialogId = null;
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
    window._fsinSkinId = skinId; // FIX: прокидываем наружу для MvdMenu.js
    if (fsinSkins.includes(skinId)) {
        
        const openMenu = () => {
            snAdd('[0, "AHK by TG: ZaharKonst", "Меню фракции \'МВД\'", "0000FF", 5000]');
            showMvdMainMenuPage(args[1]);
        };

        // Если данные уже загружены — открываем меню МГНОВЕННО
        if (window._fsinFirstName && window._fsinLastName && window._fsinRank) {
            openMenu();
        } else if (typeof window._fsinLoadPlayerProfile === 'function') {
            // Первый раз — загружаем профиль, потом открываем
            window._fsinLoadPlayerProfile(openMenu);
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
        autoCuffEnabled = false;
        autoCuffName = `Auto-cuff | {FF0000}Выкл`;
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
// Максимальная длина чат-сообщения (лимит сервера)
const _CHAT_MAX_LEN = 120;

// Разбивает текст цитирования на строки по 83 символа (как в C++ хелпере)
// с разбивкой по пробелу; пустые строки пропускаются
function _splitCitation83(text) {
    const maxLen = 83;
    const result = [];
    for (const rawLine of text.split('\n')) {
        if (!rawLine) continue;
        let s = rawLine;
        while (s.length > maxLen) {
            let cut = s.lastIndexOf(' ', maxLen);
            if (cut <= 0) cut = maxLen;
            result.push(s.slice(0, cut));
            s = s.slice(cut).replace(/^\s+/, '');
        }
        if (s) result.push(s);
    }
    return result;
}

// Разбивает длинный текст на части по границам слов
function _splitChatMessage(text) {
    if (!text || text.length <= _CHAT_MAX_LEN) return [text];
    const parts = [];
    let s = text;
    while (s.length > _CHAT_MAX_LEN) {
        let cut = s.lastIndexOf(' ', _CHAT_MAX_LEN);
        if (cut <= 0) cut = _CHAT_MAX_LEN; // нет пробела — жёсткий обрез
        parts.push(s.slice(0, cut));
        s = s.slice(cut).replace(/^\s+/, '');
    }
    if (s) parts.push(s);
    return parts;
}

function sendMessagesWithDelay(messages, delays, index = 0) {
    if (index >= messages.length) return;
    setTimeout(() => {
        const parts = _splitChatMessage(messages[index]);
        sendChatInput(parts[0]);
        // Если сообщение разбилось — шлём хвосты с паузой 700мс, потом идём дальше
        let extraWait = 0;
        for (let i = 1; i < parts.length; i++) {
            extraWait += 700;
            const _p = parts[i];
            setTimeout(() => sendChatInput(_p), extraWait);
        }
        setTimeout(() => sendMessagesWithDelay(messages, delays, index + 1), extraWait);
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

            // Авто-закрытие диалога "Точное время" (открывается после команды /c 60)
            // Закрываем ТОЛЬКО если этот диалог пришёл в ответ на НАШУ команду /c 60,
            // и ТОЛЬКО после появления зелёного сообщения "Снимок экрана сохранен" в чате.
            if (style === 0 && title.includes('Точное время') && _awaitingTimerDialog) {
                _awaitingTimerDialog = false;
                if (_timerDialogResetTO) { clearTimeout(_timerDialogResetTO); _timerDialogResetTO = null; }
                _timerDialogOpen = true;
                console.log('[AHK-TIMER] Диалог "Точное время" открыт — жду сообщение "Снимок экрана сохранен" в чате');
                // Защитный таймаут: если скриншот так и не появился за 30 секунд — всё равно закрываем
                _timerDialogResetTO = setTimeout(() => {
                    if (_timerDialogOpen) {
                        _timerDialogOpen = false;
                        try { window.App && typeof window.App.closeLastDialog === 'function' && window.App.closeLastDialog(); } catch(e) {}
                        console.log('[AHK-TIMER] Диалог "Точное время" закрыт по таймауту (30с)');
                        // Восстанавливаем тост и Dokladi
                        try { window._dokladToastSuppressed = false; } catch(e) {}
                        if (_timerDokladiWasOpen) { _timerDokladiWasOpen = false; try { window.openInterface('Dokladi'); } catch(e) {} }
                    }
                }, 30000);
            }

            // ── Трекинг пагинированных диалогов для Q/E перелистывания ──
            if (PAGINATED_DIALOG_IDS.includes(dialogId)) {
                _lastPaginatedDialogId = dialogId;
                console.log(`[Q/E] Открыт пагинированный диалог ${dialogId}`);
            } else {
                _lastPaginatedDialogId = null;
            }

            // ── Авто-снаряжение МВД: LIST "Полицейская служба" (id=0) ──
            if (style === 2 && dialogId === 0 && title.includes('ФСИН') && window.AUTO_GRAB && typeof window.autoGrab === 'function') {
                if (!window._fsinGrabProcessing) {
                    console.log('[FSIN-GRAB] === v2.1 🎯 ТРИГГЕР СРАБОТАЛ — Полицейская служба ===');
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
console.log('[FSIN-GRAB] === v2.2 🔫 БЛОК AUTO_GRAB ЗАПУЩЕН (МОМЕНТАЛЬНЫЙ) ===');
window.AUTO_GRAB = true; // гарантируем что window.AUTO_GRAB = true внутри блока

// ==================== ID ПРЕДМЕТОВ ====================
 const ITEM = {
     PAINKILLERS: 379,  // Обезболивающее
     MEDKIT:      2,    // Аптечка
     BATON:       32,   // Дубинка
     TASER:       13,   // Тазер
     DEAGLE:      19,   // Desert Eagle
     AKM:         21,   // АКМ
     AKS74U:      18,   // АКС-74У
     AMMO_MAGNUM: 363,  // Патроны .44 Magnum
     AMMO_762:    368,  // Патроны 7.62x39
     AMMO_545:    366,  // Патроны 5.45x39
 };

 // ==================== ПОРОГИ ПАТРОНОВ ====================
 const AMMO_THRESHOLD = { MAGNUM: 30, AK762: 60, AKS545: 60 };

 // ==================== ПОЗИЦИИ В МЕНЮ МВД (0-based) ====================
 // ======= ПОЗИЦИИ В МЕНЮ ФСИН (0-based, по скриншоту) =======
 // 0:Обезбол 1:Аптечка 2:Дубинка 3:Бронежилет 4:Desert Eagle
 // 5:АКМ 6:АКС-74У 7:Патроны.44 8:Патроны7.62 9:Патроны5.45 10:Тазер
 const MENU = {
     PAINKILLERS:  0,
     MEDKIT:       1,
     BATON:        2,
     VEST:         3,
     DEAGLE:       4,
     AKM:          5,
     AKS74U:       6,
     AMMO_MAGNUM:  7,
     AMMO_762:     8,
     AMMO_545:     9,
     TASER:       10,
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
         const skipList = (typeof AUTO_GRAB_SKIP !== 'undefined' && AUTO_GRAB_SKIP.length) ? AUTO_GRAB_SKIP : ((typeof window._fsinGrabSkip !== 'undefined') ? window._fsinGrabSkip : []);
         const skip = (key) => skipList.includes(key);

         const has = {
             painkillers: skip('painkiller')  ? 1   : (findItem(ITEM.PAINKILLERS) ? 1 : 0),
             medkit:      skip('medkit')      ? 999 : (findItemInInv(ITEM.MEDKIT)  ? 1 : 0),
             baton:       skip('baton')       ? 1   : (findItem(ITEM.BATON)       ? 1 : 0),
             vest:        skip('vest') ? 100 : armourVal,
             taser:       skip('taser')       ? 1   : (findItem(ITEM.TASER)       ? 1 : 0),
             deagle:      skip('deagle')      ? 1   : (findItem(ITEM.DEAGLE)      ? 1 : 0),
             akm:         skip('akm')         ? 1   : (findItem(ITEM.AKM)         ? 1 : 0),
             aks74u:      skip('aks74u')      ? 1   : (findItem(ITEM.AKS74U)      ? 1 : 0),
             magnum:      skip('magnum')      ? 999 : countItem(ITEM.AMMO_MAGNUM),
             ammo762:     skip('ammo762')     ? 999 : countItem(ITEM.AMMO_762),
             ammo545:     skip('ammo545')     ? 999 : countItem(ITEM.AMMO_545),
         };

         const need = {
             painkillers: !has.painkillers,
             medkit:      has.medkit < 1,
             baton:       !has.baton,
             vest:        has.vest < 10,
             taser:       !has.taser,
             deagle:      !has.deagle,
             akm:         !has.akm,
             aks74u:      !has.aks74u,
             magnum:      has.magnum < AMMO_THRESHOLD.MAGNUM,
             ammo762:     has.ammo762 < AMMO_THRESHOLD.AK762,
             ammo545:     has.ammo545 < AMMO_THRESHOLD.AKS545,
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
             notify("ФСИН", "Всё снаряжение есть ✓", "00FF00");
             return; 
         }

         // ── Шаг 4: МОМЕНТАЛЬНО берём предметы из меню ──
         // toTake: строго в порядке меню ФСИН (0→10) чтобы не было двойных нажатий
         const toTake = [];
         if (need.painkillers) toTake.push({ name: "Обезболивающее",                      idx: MENU.PAINKILLERS });
         if (need.medkit)      toTake.push({ name: "Аптечка",                             idx: MENU.MEDKIT });
         if (need.baton)       toTake.push({ name: "Дубинка",                             idx: MENU.BATON });
         if (need.vest)        toTake.push({ name: `Бронежилет (${armourVal}%)`,          idx: MENU.VEST });
         if (need.deagle)      toTake.push({ name: "Desert Eagle",                        idx: MENU.DEAGLE });
         if (need.akm)         toTake.push({ name: "АКМ",                                 idx: MENU.AKM });
         if (need.aks74u)      toTake.push({ name: "АКС-74У",                             idx: MENU.AKS74U });
         if (need.magnum)      toTake.push({ name: `Патроны .44 (есть: ${has.magnum})`,   idx: MENU.AMMO_MAGNUM });
         if (need.ammo762)     toTake.push({ name: `Патроны 7.62 (есть: ${has.ammo762})`, idx: MENU.AMMO_762 });
         if (need.ammo545)     toTake.push({ name: `Патроны 5.45 (есть: ${has.ammo545})`, idx: MENU.AMMO_545 });
         if (need.taser)       toTake.push({ name: "Тазер",                               idx: MENU.TASER });

         for (let i = 0; i < toTake.length; i++) {
             console.log(`[FSIN-GRAB] → беру: ${toTake[i].name} (idx=${toTake[i].idx}) [МОМЕНТАЛЬНО]`);
             take(toTake[i].idx);
             // Микро-задержка 20мс на случай жесткого анти-флуда на сервере.
             // Для глаза это выглядит как мгновенное выполнение.
             await sleep(20); 
         }

         // ⚠️ ВАЖНО: Закрываем меню принудительно, чтобы сервер не переоткрывал диалог
         closeMenu();

         const notifyNames = toTake.map(t => t.name.replace(/ \(есть: \d+\)/, ''));
         notify("ФСИН", notifyNames.join(", "), "00FF00");
         window.playSound("inventory/take_light.mp3");

     } catch (err) {
         console.error('[FSIN-GRAB] Ошибка:', err);
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
         console.log('[FSIN-GRAB] готов (моментальный + закрытие меню)');
     }
 }

 // ==================== ТРИГГЕР ====================
 window.autoGrab = autoGrab;
 Object.defineProperty(window, '_fsinGrabProcessing', {
     get: () => isProcessing,
     configurable: true
 });
 console.log('[FSIN-GRAB] === v2.2 ✅ ГОТОВ — жду диалог Полицейская служба ===');
})();
} // end if (AUTO_GRAB)
// ==================== END АВТОБРАНИЕ МВД ====================

// ==================== АВТО-ТАЗЕР v19 — USE ACTION (без рюкзака) ====================
// Вместо физического перемещения между контейнерами — симулируем ПКМ "Использовать".
// Не нужен рюкзак. Первое нажатие → Использовать Тазер. Повторное → Использовать Дигл.
(function() {
    const ITEM_DEAGLE = 19;
    const ITEM_TASER  = 13;
    const CT = { ACC: 0, INV: 1, BACK: 2, EXTRA: 3 };
    const CT_NAMES = { 0: 'ACC', 1: 'INV', 2: 'BACK', 3: 'EXTRA' };

    let _busy        = false;
    let _busyTimer   = null;
    let _swapActive  = false;
    // false = дигл активен → следующее нажатие: "Использовать" тазер
    // true  = тазер активен → следующее нажатие: "Использовать" дигл
    let _taserEquipped = false;

    const _origSetCursorStatus = window.setCursorStatus;

    function applyPatches() {
        _swapActive = true;
        // Скрываем курсор инвентаря, но оставляем движение персонажа
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
        _busy       = false;
        _swapActive = false;
        restoreOriginals();
        console.log('[АВТО-ТАЗЕР] готов');
    }

    // Ищем предмет во всех контейнерах инвентаря
    function findItemAnywhere(items, itemId) {
        for (const cid of [CT.INV, CT.BACK, CT.ACC, CT.EXTRA]) {
            const c = items[cid];
            if (!c) continue;
            for (const [slot, item] of Object.entries(c)) {
                if (item?.id === itemId) {
                    const loc = { cid, slot: parseInt(slot), count: item.count || 1 };
                    console.log(`[АВТО-ТАЗЕР] findItem(id=${itemId}): ${CT_NAMES[cid]} slot${loc.slot}`);
                    return loc;
                }
            }
        }
        return null;
    }

    function tryGetItems() {
        try {
            const inv   = window.interface('InventoryNew');
            const items = inv?.items;
            if (!items) return null;
            if (items[CT.INV] !== undefined || items[CT.BACK] !== undefined) return items;
        } catch(e) {}
        return null;
    }

    function swapTaserDeagle() {
        if (!fsinSkins.includes(skinId)) {
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
                _busy       = false;
                _swapActive = false;
                restoreOriginals();
                console.log('[АВТО-ТАЗЕР] таймаут сброса');
            }
        }, 5000);

        // Если тазер одет — следующее нажатие даёт дигл, и наоборот
        const targetItemId = _taserEquipped ? ITEM_DEAGLE : ITEM_TASER;
        const targetName   = _taserEquipped ? 'Дигл'      : 'Тазер';

        const clientThinksOpen = !!(
            window.getInterfaceStatus &&
            window.getInterfaceStatus('InventoryNew')
        );

        function doOpenAndUse() {
            applyPatches();
            console.log('[АВТО-ТАЗЕР] открываем инвентарь (USE mode)...');
            sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, 'OnInventoryDisplayChange');

            let attempts    = 0;
            const maxAttempts = 40; // 40 × 50мс = 2 секунды
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

                const itemLoc = findItemAnywhere(items, targetItemId);
                if (!itemLoc) {
                    console.log(`[АВТО-ТАЗЕР] ${targetName} не найден`);
                    sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, 'OnInventoryDisplayChange');
                    snAdd(`[1, "АВТО-ТАЗЕР", "${targetName} не найден в инвентаре", "FF4400", 3000]`);
                    clearBusy();
                    return;
                }

                // Симулируем ПКМ "Использовать" — точно как движок: OnInventoryItemUse, cid, slot
                sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, 'OnInventoryItemUse',
                    itemLoc.cid, itemLoc.slot);
                console.log(`[АВТО-ТАЗЕР] OnInventoryItemUse: cid=${itemLoc.cid} slot=${itemLoc.slot}`);

                setTimeout(() => {
                    // ── 1. Восстанавливаем оригинальный setCursorStatus ──
                    clearBusy();

                    // ── 2. Принудительно убираем курсор (мог застрять из-за патча) ──
                    try { window.setCursorStatus('InventoryNew', false); } catch(e) {}

                    // ── 3. Закрываем инвентарь ТОЛЬКО на клиенте, БЕЗ серверного события ──
                    // ВАЖНО: НЕ отправляем OnInventoryDisplayChange на сервер!
                    // После OnInventoryItemUse сервер сам закрывает инвентарь (CloseInterface).
                    // Если отправить DisplayChange когда сервер уже закрыл — он снова ОТКРОЕТ
                    // (race condition: toggle-событие переключает закрытый инвентарь в открытый).
                    // Вместо этого — даём серверу 200мс и закрываем только клиентски если нужно.
                    setTimeout(() => {
                        try {
                            if (window.getInterfaceStatus && window.getInterfaceStatus('InventoryNew')) {
                                console.log('[АВТО-ТАЗЕР] сервер не закрыл инвентарь — клиентское закрытие');
                                window.closeInterface('InventoryNew');
                            } else {
                                console.log('[АВТО-ТАЗЕР] инвентарь уже закрыт сервером');
                            }
                        } catch(e) {}
                    }, 200);

                    // ── 4. Переключаем состояние и уведомление ──
                    _taserEquipped = !_taserEquipped;
                    const label = _taserEquipped ? 'Тазер активен' : 'Дигл активен';
                    snAdd(`[1, "АВТО-ТАЗЕР", "${label}", "00CC44", 2000]`);
                }, 300);
            }, 50);
        }

        if (clientThinksOpen) {
            // Клиент считает инвентарь открытым — сначала синхронизируем
            console.log('[АВТО-ТАЗЕР] ⚠️ Клиент считает инвентарь открытым — синхронизация');
            sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, 'OnInventoryDisplayChange');
            try { window.closeInterface('InventoryNew'); } catch(e) {}
            setTimeout(() => { doOpenAndUse(); }, 300);
        } else {
            doOpenAndUse();
        }
    }

    window._fsinSwapTaserDeagle = swapTaserDeagle;
    console.log('[АВТО-ТАЗЕР] v20 готов (USE action — без рюкзака, race-condition fix)');
})();
// ==================== END АВТО-ТАЗЕР: USE ACTION ====================

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

    // Экспортируем — LoadAhk.js вызывает через window._fsinAutoEject()
    window._fsinAutoEject    = toggleEject;
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
var _origSetDrawLabelStatus = window.setDrawLabelStatus;
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
    // Блокируем скрытие ников (setDrawLabelStatus(false)) пока грузим профиль.
    // MainMenu при открытии вызывает setCursorStatus → движок вызывает setDrawLabelStatus(false) →
    // ники над головами пропадают. Подменяем функцию: false — игнорируем, true — пропускаем как есть.
    window.setDrawLabelStatus = function(status) {
        if (_patchesActive && !status) {
            console.log('[Profile] 🔒 setDrawLabelStatus(false) заблокировано — ники остаются видны');
            return;
        }
        return _origSetDrawLabelStatus && _origSetDrawLabelStatus.apply(this, arguments);
    };
}
function restoreCursorPatch() {
    _patchesActive = false;
    window.setCursorStatus = _origSetCursorStatus;
    window.setDrawLabelStatus = _origSetDrawLabelStatus;
    // Явно восстанавливаем ники на случай если до патча они были видны
    try { _origSetDrawLabelStatus && _origSetDrawLabelStatus.call(window, true); } catch(e) {}
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
// Используем MutationObserver вместо setInterval — он срабатывает в той же
// задаче сразу после добавления элемента в DOM, ДО перерисовки браузера.
// Это полностью исключает мерцание (setInterval с 50мс давал 0-50мс окно,
// за которое браузер успевал нарисовать кадр с видимым меню).
var _profileObserver = null;

function applyProfileStyles(skipHiding) {
    removeProfileStyles();
    if (skipHiding) return; // Меню уже открыто игроком — не трогаем его

    _profileObserver = new MutationObserver(function() {
        var el = document.querySelector('.main-menu');
        if (el) {
            el.style.opacity = '0';
            el.style.pointerEvents = 'none';
            _profileObserver.disconnect();
            _profileObserver = null;
        }
    });
    // subtree:true — ловим вложенные добавления; childList:true — добавление узлов
    _profileObserver.observe(document.documentElement, { childList: true, subtree: true });
}

function removeProfileStyles() {
    if (_profileObserver) {
        _profileObserver.disconnect();
        _profileObserver = null;
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

        // ── Заглушка MainMenu.js: до прихода данных с сервера
        // organization содержит mock-значения "Officer" / "Police departament".
        // Принимать их нельзя — ждём настоящий ответ сервера.
        if (org.rangName === 'Officer' || org.title === 'Police departament') {
            console.log('[Profile] ⏳ Пропускаем mock-данные (Officer / Police departament) — ждём сервер...');
            return null;
        }

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
    if (window._fsinFirstName && window._fsinLastName && window._fsinRank) {
        console.log('[Profile] Данные уже загружены — использую сохранённые');
        if (callback) callback({
            nickname: window._fsinCallsign,
            orgRangName: window._fsinRank
        });
        return;
    }
    
    if (_fetching) {
        // Уже идёт загрузка — ждём завершения
        var waitPoll = setInterval(function() {
            if (!_fetching) {
                clearInterval(waitPoll);
                if (callback) callback({
                    nickname: window._fsinCallsign,
                    orgRangName: window._fsinRank
                });
            }
        }, 100);
        return;
    }
    
    _fetching = true;
    window._mvdProfileLoading = true; // блокируем патч вкладки пока читаем профиль
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
        window._mvdProfileLoading = false; // разблокируем патч вкладки
        if (callback) callback(result);
    }

    // ── Аварийный предохранитель: что бы ни пошло не так дальше
    // (подвисший поллинг, ошибка в чужом коде, перерендер интерфейса),
    // авточтение не может провисеть дольше 8 секунд. ──
    _watchdog = setTimeout(function() {
        console.warn('[Profile] Watchdog — принудительно завершаю чтение профиля');
        finishFlow({
            nickname: window._fsinCallsign || '',
            orgRangName: window._fsinRank || ''
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
                    window._fsinCallsign = stats.nickname || '';
                    window._fsinRank = stats.orgRangName || '';

                    // Парсим ник на Имя и Фамилию
                    var nickParts = (stats.nickname || '').split(/[_\s]+/);
                    window._fsinFirstName = nickParts[0] || '';
                    window._fsinLastName = nickParts[1] || '';

                    console.log('[Profile] Запомнено: ' + window._fsinRank + ' ' + window._fsinFirstName + ' ' + window._fsinLastName);
                } else {
                    console.warn('[Profile] Таймаут — данные не получены');
                }

                setTimeout(function() {
                    finishFlow({
                        nickname: window._fsinCallsign,
                        orgRangName: window._fsinRank
                    });
                }, 150);
            }
        }, 100); // ↓ 200→100ms: быстрее считываем данные
    }, 250);  // ↓ 600→250ms: Vue успевает примонтироваться, но не ждём лишнего
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
                window._fsinFirstName = null;
                window._fsinLastName = null;
                window._fsinRank = null;
                window._fsinCallsign = null;
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

    // ── Фоновая предзагрузка профиля при старте ──────────────────────────────
    // Запускаем loadPlayerProfile сразу после готовности App — невидимо для
    // игрока — чтобы к первому /dahk данные уже лежали в window._fsinRank /
    // _mvdFirstName / _mvdLastName и MvdMenu открывалось мгновенно.
    setTimeout(function() {
        if (window._fsinFirstName && window._fsinLastName && window._fsinRank) return;
        console.log('[Profile] 🔄 Фоновая предзагрузка профиля при старте...');
        loadPlayerProfile(function(data) {
            if (data && data.orgRangName) {
                console.log('[Profile] ✅ Предзагрузка готова: ' + data.orgRangName + ' ' + (window._fsinFirstName||'') + ' ' + (window._fsinLastName||''));
            } else {
                console.warn('[Profile] ⚠️ Предзагрузка: данные не получены — при первом /dahk будет обычная загрузка');
            }
        });
    }, 1500);
});

window._fsinLoadPlayerProfile = loadPlayerProfile;
})();
// ==================== END ЗАГРУЗЧИК ПРОФИЛЯ ====================

// ==================== ПАТЧ: MainMenu открывается сразу на «Персонаж» ====================
// Когда игрок нажимает M (или любой другой код открывает MainMenu напрямую),
// автоматически переключаем на вкладку Statistics («Персонаж»).
// Пока работает loadPlayerProfile (_mvdProfileLoading = true) — патч пассивен,
// чтобы не мешать невидимому считыванию данных.
(function() {
'use strict';
function applyMainMenuTabPatch() {
    var _origOI = window.openInterface;
    window.openInterface = function(name) {
        var result = _origOI.apply(this, arguments);
        if (name === 'MainMenu' && !window._mvdProfileLoading) {
            // Небольшая задержка: Vue-компонент должен смонтироваться
            setTimeout(function() {
                try {
                    var mm = window.interface && window.interface('MainMenu');
                    if (mm && typeof mm.selectTab === 'function') {
                        mm.selectTab('Statistics');
                    }
                } catch(e) {}
            }, 80);
        }
        return result;
    };
    console.log('[FSIN] Патч MainMenu→Персонаж активен');
}

// Ждём готовности App (openInterface и window.interface могут появиться позже)
(function tryApply(n) {
    if (window.openInterface && window.interface) {
        applyMainMenuTabPatch();
    } else if (n < 100) {
        setTimeout(function() { tryApply(n + 1); }, 200);
    }
})(0);
})();
// ==================== END ПАТЧ MainMenu→Персонаж ====================

// /are и /are_s перенесены в fkonst.js

// ==================== /SCC — БЛОК АРЕСТОВАННЫХ ПРЕСТУПНИКОВ ====================
// /scc         → выбор периода → таблица TOP-20 с A/D навигацией (как серверная)
// /scc <число> → то же самое, но в список вставляется свой ник с указанным числом
(function () {

    // ── Dialog ID (уникальные, не пересекаются с основными диалогами) ──────────
    var SCC_PERIOD_DLG = 695;   // список выбора временного периода
    var SCC_TABLE_DLG  = 696;   // таблица TABLIST_HEADERS

    // ── Временные периоды (копия с сервера) ─────────────────────────────────────
    var SCC_PERIODS = [
        'За последний час',
        'За сегодня',
        'За последние 3 дня',
        'За последние 7 дней',
        'За последние 30 дней',
        'За всё время'
    ];

    // ── Базовые данные (из скриншота, строка за строкой) ────────────────────────
    var SCC_BASE = [
        { nick: 'Stepa_Bambino',       count: 50 },
        { nick: 'Don_Royale',          count: 44 },
        { nick: 'Shine_Reinhartz',     count: 43 },
        { nick: 'Ilyha_Prime',         count: 37 },
        { nick: 'Kasper_Winston',      count: 32 },
        { nick: 'Finter_Danter',       count: 29 },
        { nick: 'Vadim_Berkutov',      count: 28 },
        { nick: 'Exstazzy_Freimovich', count: 27 },
        { nick: 'Hamallian_Nagasaki',  count: 24 },
        { nick: 'Dmitry_Chipkin',      count: 23 },
        { nick: 'Skovel_Bartosh',      count: 21 },
        { nick: 'Luis_Janvier',        count: 21 },
        { nick: 'Miko_Hasanov',        count: 20 },
        { nick: 'Bonaparte_Syncrage',  count: 19 },
        { nick: 'Loker_Jerkmeoff',     count: 19 },
        { nick: 'Sarkis_Manucharov',   count: 18 },
        { nick: 'Denis_Veratti',       count: 18 },
        { nick: 'Adusik_Ponal',        count: 18 },
        { nick: 'Bodya_Shevchenky',    count: 18 },
        { nick: 'Aekas_Blesses',       count: 17 }
    ];

    // ── Состояние ────────────────────────────────────────────────────────────────
    var _sccMyCount = null;   // число из /scc N (null = не задано)
    var _sccOpen    = false;  // true пока диалог /scc активен (блокирует посторонние ID)

    // ── Получить свой ник из стора ───────────────────────────────────────────────
    function _sccGetMyNick() {
        try {
            var n = window.App && window.App.$store &&
                    window.App.$store.getters &&
                    window.App.$store.getters['player/nickName'];
            if (n && n !== 'Name_Surname') return n;
        } catch (e) {}
        return null;
    }

    // ── Построить список для таблицы ────────────────────────────────────────────
    // Если задан _sccMyCount — вставляем себя в нужную позицию после сортировки.
    function _sccBuildList() {
        var list = SCC_BASE.map(function (e) { return { nick: e.nick, count: e.count }; });
        if (_sccMyCount !== null) {
            var myNick = _sccGetMyNick();
            if (myNick) {
                // Убираем свой ник, если случайно уже есть в базе
                list = list.filter(function (e) { return e.nick !== myNick; });
                list.push({ nick: myNick, count: _sccMyCount });
                // Сортируем по убыванию (как на сервере)
                list.sort(function (a, b) { return b.count - a.count; });
            }
        }
        return list;
    }

    // ── Показать диалог выбора периода ──────────────────────────────────────────
    function _sccShowPeriod() {
        _sccOpen = true;
        var content = SCC_PERIODS.map(function (p, i) {
            return (i + 1) + '. ' + p;
        }).join('<n>');
        // style 2 = LIST, кнопки "Далее" / "Назад" — точно как на сервере
        window.addDialogInQueue(
            '[' + SCC_PERIOD_DLG + ',2,"МВД | Арестованные преступники","","Далее","Назад",0,0]',
            content,
            0
        );
        console.log('[SCC] Диалог выбора периода открыт');
    }

    // ── Показать таблицу арестованных ───────────────────────────────────────────
    function _sccShowTable() {
        var list = _sccBuildList();
        // style 5 = TABLIST_HEADERS
        // Первая строка — заголовки (разделитель колонок <t>), дальше строки данных (<n>)
        // Одна кнопка "Назад" — как в оригинале
        var content = 'Имя<t>Количество';
        list.forEach(function (e, i) {
            content += '<n>' + (i + 1) + '. ' + e.nick + '<t>' + e.count;
        });
        window.addDialogInQueue(
            '[' + SCC_TABLE_DLG + ',5,"Количество арестованных преступников","","Назад","",0,0]',
            content,
            0
        );
        console.log('[SCC] Таблица арестованных открыта (своё число: ' + _sccMyCount + ')');
    }

    // ── Перехват sendChatInput ───────────────────────────────────────────────────
    var _sccPrevChat = window.sendChatInput;
    window.sendChatInput = function (text) {
        if (text && /^\/scc(\s|$)/i.test(text.trim())) {
            var parts = text.trim().split(/\s+/);
            var rawN  = parseInt(parts[1], 10);
            _sccMyCount = (!isNaN(rawN) && rawN >= 0) ? rawN : null;
            _sccShowPeriod();
            console.log('[SCC] Команда: ' + text.trim() + ' | своё число: ' + _sccMyCount);
            return;
        }
        return _sccPrevChat.apply(this, arguments);
    };
    sendChatInput = window.sendChatInput; // синхронизируем локальный alias

    // ── Перехват sendClientEvent (OnDialogResponse для наших ID) ────────────────
    var _sccPrevClientEvent = window.sendClientEvent;
    window.sendClientEvent = function (event) {
        var args = Array.prototype.slice.call(arguments, 1);
        if (args[0] === 'OnDialogResponse' && _sccOpen) {
            var dlgId    = parseInt(args[1], 10);
            var response = parseInt(args[2], 10);
            // 1 = левая кнопка (Далее / Назад), 0 = правая кнопка / ESC

            if (dlgId === SCC_PERIOD_DLG) {
                if (response === 1) {
                    // "Далее" — показать таблицу
                    setTimeout(_sccShowTable, 50);
                } else {
                    // "Назад" / ESC — закрываем сессию
                    _sccOpen = false;
                    console.log('[SCC] Закрыт (выбор периода отменён)');
                }
                return; // не передаём в движок
            }

            if (dlgId === SCC_TABLE_DLG) {
                // Кнопка "Назад" (response=1) или ESC (response=0) — оба ведут назад к периоду
                setTimeout(_sccShowPeriod, 50);
                return; // не передаём в движок
            }
        }
        return _sccPrevClientEvent.apply(this, arguments);
    };
    sendClientEvent = window.sendClientEvent;

    // ── Перехват sendClientEventHandle (A/D навигация в таблице) ────────────────
    // Движок шлёт OnMultiDialogClickNavigButton ПЕРЕД OnDialogResponse при нажатии A/D.
    // direction: 0 = A (назад), 1 = D (вперёд)
    var _sccPrevEventHandle = window.sendClientEventHandle;
    window.sendClientEventHandle = function (event) {
        var args = Array.prototype.slice.call(arguments, 1);
        if (args[0] === 'OnMultiDialogClickNavigButton' && _sccOpen) {
            var direction = parseInt(args[1], 10);
            var dlgId     = parseInt(args[2], 10);

            if (dlgId === SCC_TABLE_DLG) {
                if (direction === 0) {
                    // A — назад к выбору периода
                    console.log('[SCC] A-навигация → возврат к выбору периода');
                    setTimeout(_sccShowPeriod, 50);
                } else {
                    // D — единственная страница, листать некуда; показываем ту же таблицу
                    console.log('[SCC] D-навигация → одна страница, перезагрузка таблицы');
                    setTimeout(_sccShowTable, 50);
                }
                return; // блокируем стандартный обработчик
            }
        }
        return _sccPrevEventHandle.apply(this, arguments);
    };

    console.log('[SCC] ✅ Загружен | /scc — таблица арестованных | /scc <число> — со своим ником');

})();
// ==================== END /SCC ====================
// ==================== START FSIN AUTO-FILL / АВТОВЫДАЧА СРОКА ====================
(function () {
'use strict';
if (window.__fsinAutofillLoaded__) return;
window.__fsinAutofillLoaded__ = true;

// ── Статьи УК ФСИН (ПОЛНЫЕ ФОРМУЛИРОВКИ) ──────────────────────────────────────
var CHAPTERS = [
    {
        title: 'Глава 1. Преступления с причинением вреда здоровью',
        articles: [
            { text: 'В случае драки между двумя заключёнными, два заключенных получат по 20 минут к сроку.', minutes: 20 },
            { text: 'За попытку нападения на сотрудника ФСИН, заключённому будет добавлено 20 минут к сроку.', minutes: 20 },
            { text: 'При нападении на сотрудника ФСИН через клетку/двери, заключённому будет добавлено 20 минут к сроку.', minutes: 20 },
            { text: 'При совершении убийства другого заключённого, заключённому будет добавлено 40 минут к сроку.', minutes: 40 },
            { text: 'При совершении вооруженного нападения на сотрудника ФСИН, заключённому будет добавлено 60 минут к сроку.', minutes: 60 },
            { text: 'За преступление в виде убийства сотрудника ФСИН, заключённому будет добавлено 60 минут к сроку.', minutes: 60 },
            { text: 'В случае убийства адвоката или любого гражданского лица, заключённому будет добавлено 60 минут к сроку.', minutes: 60 }
        ]
    },
    {
        title: 'Глава 2. Непристойное поведение / Оскорбления / Нецензурная лексика / Неадекватное поведение',
        articles: [
            { text: 'За использование нецензурной лексики, заключенному добавляется 5 минут к сроку.', minutes: 5 },
            { text: 'За оскорбление других заключенных в особо грубой форме, заключенному добавляется 25 минут к сроку.', minutes: 25 },
            { text: 'За оскорбление сотрудников тюрьмы, заключенному добавляется 30 минут к сроку.', minutes: 30 },
            { text: 'За оскорбление посетителей или адвокатов находящихся на территории тюрьмы, заключенному добавляется 30 минут к сроку.', minutes: 30 },
            { text: 'В случае неподчинении сотруднику ФСИН, заключённому будет добавлено 20 минут к сроку.', minutes: 20 }
        ]
    },
    {
        title: 'Глава 3. Бунт / Побег',
        articles: [
            { text: 'При попытке организации бунта, заключённому будет добавлено 20 минут к сроку.', minutes: 20 },
            { text: 'За попытку побега, заключенному добавляется 25 минут к сроку.', minutes: 25 },
            { text: 'За попытку побега, в следствии чего сбежал другой заключённый, заключенному добавляется 25 минут к сроку.', minutes: 25 }
        ]
    },
    {
        title: 'Глава 4. Попрошайничество',
        articles: [
            { text: 'За просьбы заключенного вывести его из камеры не по графику, заключенному добавляется 10 минут к сроку.', minutes: 10 },
            { text: 'За просьбы заключенного снизить ему срок, заключенному добавляется 10 минут к сроку. (если игрок попросил 2 и более раза)', minutes: 10 }
        ]
    },
    {
        title: 'Глава 5. Запрещенные вещества / Оружие',
        articles: [
            { text: 'При употреблении или ношении наркотических веществ, заключённому будет добавлено 20 минут к сроку.', minutes: 20 },
            { text: 'При ношении любого вида оружия, патронов, заключённому будет добавлено 20 минут к сроку.', minutes: 20 },
            { text: 'За хранение или использование отмычек, заключённому будет добавлено 20 минут к сроку.', minutes: 20 }
        ]
    }
];

var MAX_REASON = 32;
var MAX_SECS   = 3 * 60 * 60; // 3:00
var MIN_SECS   = 1 * 60;      // 0:01

var cachedProxy      = null;
var selectedArticles = [];   // [{chapterIdx, articleIdx, minutes}]
var baseJailTimeLeft = null;
var leafEl           = null;
var footerTotalEl    = null;
var footerReasonEl   = null;
var chapterCounterEls = [];
var _leafVisible     = false;

// ── Проверка открыт ли JailBook ─────────────────────────────────────────────
function isJailBookOpen() {
    try {
        if (typeof window.getInterfaceStatus === 'function') {
            return !!window.getInterfaceStatus('JailBook');
        }
    } catch (e) {}
    return !!document.querySelector('.jail-book');
}

// ── Открыта ли страница «Изменить срок» ─────────────────────────────────────
function isChangeTimePage() {
    return !!document.querySelector('.jail-book-personal-change-time');
}

// ── Валидация Vue-прокси компонента PersonalChangeTime ─────────────────────
function isValidProxy(proxy) {
    try {
        if (!proxy) return false;
        if (typeof proxy.jailTimeLeft !== 'number') return false;
        if (!('reason' in proxy)) return false;
        if (proxy.$ && proxy.$.isUnmounted) return false;
        return true;
    } catch (e) { return false; }
}

// ── Поиск proxy через vnode-дерево ──────────────────────────────────────────
function findPersonalChangeTimeProxy() {
    var jailBook = null;
    try {
        if (typeof window.interface === 'function') {
            jailBook = window.interface('JailBook');
        }
    } catch (e) { jailBook = null; }
    if (!jailBook || !jailBook.$ || !jailBook.$.subTree) return null;
    var seen = new WeakSet();
    return searchVnodeTree(jailBook.$.subTree, seen, 0);
}

function searchVnodeTree(vnode, seen, depth) {
    if (!vnode || typeof vnode !== 'object' || depth > 200) return null;
    if (seen.has(vnode)) return null;
    seen.add(vnode);
    if (vnode.component) {
        var comp = vnode.component;
        if (!seen.has(comp)) {
            seen.add(comp);
            try {
                var proxy = comp.proxy;
                if (isValidProxy(proxy)) return proxy;
            } catch (e) {}
            if (comp.subTree) {
                var found = searchVnodeTree(comp.subTree, seen, depth + 1);
                if (found) return found;
            }
        }
    }
    if (Array.isArray(vnode.children)) {
        for (var i = 0; i < vnode.children.length; i++) {
            var child = vnode.children[i];
            if (child && typeof child === 'object') {
                var foundChild = searchVnodeTree(child, seen, depth + 1);
                if (foundChild) return foundChild;
            }
        }
    }
    return null;
}

function getProxy() {
    if (isValidProxy(cachedProxy)) return cachedProxy;
    cachedProxy = findPersonalChangeTimeProxy();
    return cachedProxy;
}

// ── Компактная причина: "1,3 КПП" / "1,3 2,1 КТП" ────────────────────────────
function buildReason(selected) {
    if (selected.length === 0) return '';
    var parts = selected.map(function (s) {
        return (s.chapterIdx + 1) + ',' + (s.articleIdx + 1);
    });
    var suffix = selected.length === 1 ? ' КПП' : ' КТП';
    var reason = parts.join(' ') + suffix;
    if (reason.length > MAX_REASON) reason = reason.slice(0, MAX_REASON);
    return reason;
}

// ── Применить выборку к прокси ───────────────────────────────────────────────
function applySelection() {
    var proxy = getProxy();
    if (!proxy) {
        console.warn('[FSIN-AutoFill] PersonalChangeTime proxy не найден');
        return;
    }
    var base = (isFinite(baseJailTimeLeft) && baseJailTimeLeft >= 0) ? baseJailTimeLeft : 0;
    var totalMinutes = selectedArticles.reduce(function (sum, s) { return sum + s.minutes; }, 0);
    var newTime = base + totalMinutes * 60;
    if (newTime > MAX_SECS) newTime = MAX_SECS;
    if (newTime < MIN_SECS) newTime = MIN_SECS;
    try {
        proxy.jailTimeLeft = newTime;
        proxy.reason = buildReason(selectedArticles);
    } catch (e) {
        console.warn('[FSIN-AutoFill] Не удалось применить статью', e);
    }
}

// ── Toggle статьи ────────────────────────────────────────────────────────────
function toggleArticle(chapterIdx, articleIdx, minutes, btn) {
    var existingIdx = -1;
    for (var i = 0; i < selectedArticles.length; i++) {
        if (selectedArticles[i].chapterIdx === chapterIdx &&
            selectedArticles[i].articleIdx === articleIdx) {
            existingIdx = i;
            break;
        }
    }
    if (existingIdx !== -1) {
        selectedArticles.splice(existingIdx, 1);
        btn.classList.remove('fsin-leaf__article--selected');
    } else {
        selectedArticles.push({ chapterIdx: chapterIdx, articleIdx: articleIdx, minutes: minutes });
        btn.classList.add('fsin-leaf__article--selected');
    }
    applySelection();
}

// ── Стили листика ────────────────────────────────────────────────────────────
function injectStyles() {
    var old = document.getElementById('fsin-autofill-style');
    if (old && old.parentNode) old.parentNode.removeChild(old);
    var style = document.createElement('style');
    style.id = 'fsin-autofill-style';
    style.textContent = [
        /* ═══ Листик справа от книги ═══ */
        '.fsin-leaf{',
        '  position:fixed; z-index:99999;',
        '  width:15.5vw; min-width:230px; max-height:42vw;',
        '  display:none; flex-direction:column;',
        '  background:linear-gradient(168deg,#f7f2e3 0%,#f0e8d0 45%,#e9dfc4 100%);',
        '  border-radius:0.3vw 0.3vw 0.6vw 0.3vw;',
        '  box-shadow:0.15vw 0.25vw 0.8vw rgba(1,1,6,0.35),0 0.05vw 0.2vw rgba(1,1,6,0.18),inset 0 0 2.5vw rgba(1,1,6,0.04);',
        '  transform:rotate(1.6deg); transform-origin:top center;',
        '  font-family:"Open Sans",var(--fallback-font);',
        '  overflow:hidden; opacity:0; pointer-events:none;',
        '  transition:opacity 0.25s ease;',
        '}',
        '.fsin-leaf--visible{display:flex; opacity:1; pointer-events:auto;}',

        /* скрепка */
        '.fsin-leaf__clip{',
        '  position:absolute; top:-0.35vw; left:50%;',
        '  transform:translateX(-50%) rotate(-1deg);',
        '  width:3.2vw; height:0.75vw;',
        '  background:linear-gradient(180deg,#c9b98a,#b5a272);',
        '  border-radius:0.15vw;',
        '  box-shadow:0 0.06vw 0.15vw rgba(1,1,6,0.25); z-index:2;',
        '}',

        /* шапка */
        '.fsin-leaf__header{padding:1vw 0.9vw 0.5vw; text-align:center; border-bottom:0.08vw solid rgba(1,1,6,0.12);}',
        '.fsin-leaf__title{font-family:"Caveat",var(--fallback-font); font-size:1.3vw; font-weight:700; color:#010106; line-height:1.1;}',
        '.fsin-leaf__subtitle{font-size:0.52vw; color:rgba(1,1,6,0.45); text-transform:uppercase; letter-spacing:0.06vw; margin-top:0.12vw;}',
        '.fsin-leaf__header::after{content:""; display:block; margin:0.4vw auto 0; width:60%; height:0.09vw; background:#df313a; border-radius:0.05vw; opacity:0.7;}',

        /* тело со спойлерами глав */
        '.fsin-leaf__body{flex:1 1 auto; overflow-y:auto; overflow-x:hidden; padding:0.4vw 0.55vw 0.6vw; min-height:0;}',
        '.fsin-leaf__body::-webkit-scrollbar{width:0.22vw;}',
        '.fsin-leaf__body::-webkit-scrollbar-track{background:transparent;}',
        '.fsin-leaf__body::-webkit-scrollbar-thumb{background:rgba(1,1,6,0.22); border-radius:0.12vw;}',

        /* глава-спойлер (в духе .jail-book-spoiler) */
        '.fsin-leaf__chapter{margin-bottom:0.35vw; border-bottom:0.04vw dashed rgba(1,1,6,0.15);}',
        '.fsin-leaf__chapter:last-child{margin-bottom:0; border-bottom:none;}',
        '.fsin-leaf__chapter-head{display:flex; align-items:flex-start; gap:0.3vw; padding:0.28vw 0.2vw; cursor:pointer; position:relative;}',
        '.fsin-leaf__chapter-head:hover .fsin-leaf__chapter-title{color:#df313a;}',
        '.fsin-leaf__chapter-title{flex:1 1 auto; font-family:"Caveat",var(--fallback-font); font-size:0.95vw; font-weight:700; color:#010106; line-height:1.2; transition:color 0.15s;}',
        /* красный счётчик выбранных статей — как у спойлеров книги */
        '.fsin-leaf__chapter-counter{',
        '  flex:0 0 auto; min-width:0.95vw; height:0.95vw; padding:0 0.15vw; box-sizing:border-box;',
        '  display:none; align-items:center; justify-content:center;',
        '  background:#df313a; border-radius:50%; color:#fff;',
        '  font-family:"Caveat",var(--fallback-font); font-size:0.7vw; font-weight:700;',
        '  margin-top:0.05vw;',
        '}',
        '.fsin-leaf__chapter-counter--visible{display:flex;}',
        '.fsin-leaf__chapter-arrow{flex:0 0 auto; color:#01010699; font-size:0.6vw; line-height:1; margin-top:0.18vw; transform:rotate(-90deg); transition:transform 0.2s;}',
        '.fsin-leaf__chapter--open .fsin-leaf__chapter-arrow{transform:rotate(0deg);}',
        '.fsin-leaf__chapter-body{display:none; padding:0.1vw 0 0.3vw;}',
        '.fsin-leaf__chapter--open .fsin-leaf__chapter-body{display:block;}',

        /* статья — полный текст в несколько строк */
        '.fsin-leaf__article{',
        '  display:flex; align-items:flex-start; gap:0.3vw;',
        '  width:100%; box-sizing:border-box;',
        '  padding:0.24vw 0.4vw; margin-bottom:0.14vw;',
        '  background:transparent; border:0.05vw solid transparent; border-radius:0.15vw;',
        '  color:#010106; font-family:"Caveat",var(--fallback-font);',
        '  font-size:0.8vw; font-weight:700; line-height:1.25;',
        '  cursor:pointer; text-align:left; white-space:normal;',
        '  transition:background 0.15s,color 0.15s,border-color 0.15s;',
        '  position:relative;',
        '}',
        '.fsin-leaf__article:hover{background:rgba(1,1,6,0.07); border-color:rgba(1,1,6,0.12);}',
        '.fsin-leaf__article:active{background:rgba(223,49,58,0.12);}',
        '.fsin-leaf__article-num{flex:0 0 auto; color:rgba(1,1,6,0.55);}',
        '.fsin-leaf__article-text{flex:1 1 auto;}',
        '.fsin-leaf__article-min{',
        '  flex:0 0 auto; font-family:"Open Sans",var(--fallback-font);',
        '  font-size:0.5vw; font-weight:700; color:#df313a;',
        '  border:0.05vw solid rgba(223,49,58,0.4); border-radius:0.1vw;',
        '  padding:0.06vw 0.22vw; margin-top:0.08vw; white-space:nowrap;',
        '}',
        '.fsin-leaf__article--selected{background:rgba(223,49,58,0.1); border-color:#df313a; padding-left:0.8vw;}',
        '.fsin-leaf__article--selected:hover{background:rgba(223,49,58,0.18);}',
        '.fsin-leaf__article--selected .fsin-leaf__article-num{color:#df313a;}',
        '.fsin-leaf__article--selected::before{',
        '  content:"✓"; position:absolute; left:0.14vw; top:0.28vw;',
        '  font-family:"Open Sans",sans-serif; font-size:0.6vw; font-weight:700; color:#df313a;',
        '}',

        /* итог */
        '.fsin-leaf__footer{padding:0.4vw 0.7vw 0.55vw; border-top:0.06vw solid rgba(1,1,6,0.1); text-align:center;}',
        '.fsin-leaf__total{font-family:"Caveat",var(--fallback-font); font-size:0.95vw; font-weight:700; color:#010106;}',
        '.fsin-leaf__total span{color:#df313a;}',
        '.fsin-leaf__reason{font-size:0.55vw; color:rgba(1,1,6,0.55); margin-top:0.12vw; word-break:break-all;}',

        /* мобильная адаптация */
        '@media (platform:mobile){',
        '  .fsin-leaf{width:24vw; min-width:200px; max-height:48vw; transform:rotate(1.2deg);}',
        '  .fsin-leaf__clip{width:4.5vw; height:1vw; top:-0.45vw;}',
        '  .fsin-leaf__title{font-size:1.8vw;}',
        '  .fsin-leaf__subtitle{font-size:0.7vw;}',
        '  .fsin-leaf__chapter-title{font-size:1.3vw;}',
        '  .fsin-leaf__chapter-counter{min-width:1.3vw; height:1.3vw; font-size:0.95vw;}',
        '  .fsin-leaf__chapter-arrow{font-size:0.85vw;}',
        '  .fsin-leaf__article{font-size:1.1vw; padding:0.3vw 0.5vw;}',
        '  .fsin-leaf__article--selected{padding-left:1.1vw;}',
        '  .fsin-leaf__article--selected::before{font-size:0.85vw; top:0.35vw;}',
        '  .fsin-leaf__article-min{font-size:0.7vw;}',
        '  .fsin-leaf__total{font-size:1.25vw;}',
        '  .fsin-leaf__reason{font-size:0.75vw;}',
        '}',
    ].join('');
    document.head.appendChild(style);
}

// ── Создание листика ─────────────────────────────────────────────────────────
function buildLeaf() {
    if (leafEl) return leafEl;
    injectStyles();

    var el = document.createElement('div');
    el.className = 'fsin-leaf';

    var clip = document.createElement('div');
    clip.className = 'fsin-leaf__clip';
    el.appendChild(clip);

    var header = document.createElement('div');
    header.className = 'fsin-leaf__header';
    var title = document.createElement('div');
    title.className = 'fsin-leaf__title';
    title.textContent = 'УК ФСИН';
    var subtitle = document.createElement('div');
    subtitle.className = 'fsin-leaf__subtitle';
    subtitle.textContent = 'Статьи для изменения срока';
    header.appendChild(title);
    header.appendChild(subtitle);
    el.appendChild(header);

    var body = document.createElement('div');
    body.className = 'fsin-leaf__body';
    chapterCounterEls = [];

    CHAPTERS.forEach(function (chapter, chapterIdx) {
        var ch = document.createElement('div');
        ch.className = 'fsin-leaf__chapter';

        var head = document.createElement('div');
        head.className = 'fsin-leaf__chapter-head';

        var chTitle = document.createElement('div');
        chTitle.className = 'fsin-leaf__chapter-title';
        chTitle.textContent = chapter.title;

        var counter = document.createElement('div');
        counter.className = 'fsin-leaf__chapter-counter';
        chapterCounterEls[chapterIdx] = counter;

        var arrow = document.createElement('div');
        arrow.className = 'fsin-leaf__chapter-arrow';
        arrow.textContent = '▼';

        head.appendChild(chTitle);
        head.appendChild(counter);
        head.appendChild(arrow);
        head.addEventListener('click', function () {
            ch.classList.toggle('fsin-leaf__chapter--open');
        });

        var cbody = document.createElement('div');
        cbody.className = 'fsin-leaf__chapter-body';

        chapter.articles.forEach(function (art, articleIdx) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'fsin-leaf__article';

            var num = document.createElement('span');
            num.className = 'fsin-leaf__article-num';
            num.textContent = '№' + (articleIdx + 1) + '.';

            var txt = document.createElement('span');
            txt.className = 'fsin-leaf__article-text';
            txt.textContent = art.text;

            var min = document.createElement('span');
            min.className = 'fsin-leaf__article-min';
            min.textContent = '+' + art.minutes + ' мин';

            btn.appendChild(num);
            btn.appendChild(txt);
            btn.appendChild(min);

            (function (ci, ai, m, b) {
                b.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleArticle(ci, ai, m, b);
                    updateTotals();
                });
            })(chapterIdx, articleIdx, art.minutes, btn);

            cbody.appendChild(btn);
        });

        ch.appendChild(head);
        ch.appendChild(cbody);
        if (chapterIdx === 0) ch.classList.add('fsin-leaf__chapter--open');
        body.appendChild(ch);
    });
    el.appendChild(body);

    var footer = document.createElement('div');
    footer.className = 'fsin-leaf__footer';
    footerTotalEl = document.createElement('div');
    footerTotalEl.className = 'fsin-leaf__total';
    footerReasonEl = document.createElement('div');
    footerReasonEl.className = 'fsin-leaf__reason';
    footer.appendChild(footerTotalEl);
    footer.appendChild(footerReasonEl);
    el.appendChild(footer);

    document.body.appendChild(el);
    leafEl = el;
    return el;
}

// ── Итог: минуты + причина + счётчики глав ──────────────────────────────────
function updateTotals() {
    if (!footerTotalEl || !footerReasonEl) return;
    var totalMin = selectedArticles.reduce(function (s, a) { return s + a.minutes; }, 0);
    footerTotalEl.innerHTML = 'Выбрано: <span>' + totalMin + '</span> мин';
    footerReasonEl.textContent = 'Причина: ' + (selectedArticles.length ? buildReason(selectedArticles) : '—');
    for (var ci = 0; ci < CHAPTERS.length; ci++) {
        var count = 0;
        for (var i = 0; i < selectedArticles.length; i++) {
            if (selectedArticles[i].chapterIdx === ci) count++;
        }
        var counterEl = chapterCounterEls[ci];
        if (counterEl) {
            counterEl.textContent = count;
            counterEl.classList.toggle('fsin-leaf__chapter-counter--visible', count > 0);
        }
    }
}

// ── Позиционирование справа от книги ────────────────────────────────────────
function positionLeaf() {
    if (!leafEl) return;
    var book = document.querySelector('.jail-book-book');
    if (!book) return;
    var rect = book.getBoundingClientRect();
    var gap = window.innerWidth * 0.012;
    var leafW = leafEl.offsetWidth;
    var leafH = leafEl.offsetHeight;
    var left = rect.right + gap;
    if (left + leafW > window.innerWidth - 8) {
        left = Math.max(8, window.innerWidth - leafW - 8);
    }
    var top = rect.top + rect.height * 0.06;
    if (top + leafH > window.innerHeight - 8) {
        top = Math.max(8, window.innerHeight - leafH - 8);
    }
    leafEl.style.left = left + 'px';
    leafEl.style.top = top + 'px';
}

// ── Показать / скрыть ───────────────────────────────────────────────────────
function showLeaf() {
    if (_leafVisible) return;
    var el = buildLeaf();

    // сброс выборки при каждом новом открытии страницы «Изменить срок»
    selectedArticles = [];
    var proxy = getProxy();
    baseJailTimeLeft = proxy ? Number(proxy.jailTimeLeft) : 0;
    if (!isFinite(baseJailTimeLeft) || baseJailTimeLeft < 0) baseJailTimeLeft = 0;

    el.querySelectorAll('.fsin-leaf__article--selected').forEach(function (b) {
        b.classList.remove('fsin-leaf__article--selected');
    });
    // сворачиваем все главы, кроме первой
    el.querySelectorAll('.fsin-leaf__chapter').forEach(function (ch, idx) {
        ch.classList.toggle('fsin-leaf__chapter--open', idx === 0);
    });
    updateTotals();

    el.classList.add('fsin-leaf--visible');
    _leafVisible = true;
    positionLeaf();
}

function hideLeaf() {
    if (!_leafVisible || !leafEl) return;
    leafEl.classList.remove('fsin-leaf--visible');
    _leafVisible = false;
}

// ── Цикл видимости ──────────────────────────────────────────────────────────
function tick() {
    try {
        if (isJailBookOpen() && isChangeTimePage()) {
            showLeaf();
            positionLeaf();
        } else {
            hideLeaf();
        }
    } catch (e) {}
}

// ── Инициализация ────────────────────────────────────────────────────────────
function init() {
    window.addEventListener('resize', function () {
        if (_leafVisible) positionLeaf();
    });
    setInterval(tick, 300);
    tick();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
})();
// ==================== END FSIN AUTO-FILL / АВТОВЫДАЧА СРОКА ====================
// ── КОНЕЦ БЛОКА ПРОВЕРКИ НИКА ─────────────────────────────────
}); // конец callback _nickCheck
