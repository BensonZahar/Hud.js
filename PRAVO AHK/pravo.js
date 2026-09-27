// ⚠️ ЧТО ЭТО ЗА ФАЙЛ pravo.js — ПОМОЩНИК ДЛЯ ТЕСТИРОВАНИЯ ПРАВО И ФУНКЦИЙ ДЛЯ РАЗРАБОТЧИКОВ ИГРЫ.

// ПРОВЕРКА НИКА Добавляй/убирай ники здесь.
const NICK_CHECK_ENABLED = true; // ← поменяй на true чтобы включить проверку

const _ALLOWED_NICKS = [
    "Zahar_Damidov",
    "Denis_Galievskiy",
	"Fura_Morales",
    "Sergey_Gaben",
	"Steel_Soprano"
];

// Показ уведомления о запрете доступа.
// Приоритет: QuestsProgressInfo (HUD) → ZkmScreenNotification → чат.
function _showAccessDenied(nick) {
    var title = "AHK — Доступ запрещён";
    var text  = "Ник «" + nick + "» не в списке AHK. Обратитесь к создателю.";
    var shown = false;

    function tryShow() {
        if (shown) return;

        // 1) QuestsProgressInfo — HUD-уведомление (правый верхний угол)
        try {
            if (typeof window.openInterface === 'function') {
                // Пропускаем если интерфейс занят активным квестом
                var questBusy = window.getInterfaceStatus && window.getInterfaceStatus("QuestsProgressInfo");
                if (!questBusy) {
                    window.openInterface("QuestsProgressInfo", JSON.stringify([
                        false,  // ручной режим (не из QuestsInfo.js)
                        0,      // currentScores
                        1,      // maxScores
                        title,  // progressName → заголовок
                        text,   // progressTask → текст под заголовком
                        0,      // showedProgress = 0 → без шкалы прогресса
                        false,  // isShowLocateButton
                        0       // progressMode: PERCENT
                    ]));
                    setTimeout(function () {
                        try { window.closeInterface("QuestsProgressInfo"); } catch (e) {}
                    }, 15000);
                    shown = true;
                    console.warn('[pravo] 🚫 Доступ запрещён: ник "' + nick + '" не в списке.');
                    return;
                }
            }
        } catch (e) {}

        // 2) ZKM-уведомление (красивое, сверху экрана)
        var sn = window.ZkmScreenNotification;
        if (sn && typeof sn.add === 'function') {
            try {
                sn.add('[1, "' + title + '", "' + text + '", "FF3333", 15000]');
                shown = true;
                console.warn('[pravo] 🚫 Доступ запрещён (ZKM): ник "' + nick + '".');
                return;
            } catch (e) {}
        }

        // 3) Fallback — сообщение в чат (работает всегда)
        if (typeof window.onChatMessage === 'function') {
            try {
                window.onChatMessage('{FF3333}[AHK] {FFFFFF}' + title + ': ' + text, [0, 0, 'FF3333']);
                shown = true;
                console.warn('[pravo] 🚫 Доступ запрещён (чат): ник "' + nick + '".');
            } catch (e) {}
        }
    }

    // Первая попытка сразу
    tryShow();

    // Если не получилось — повторяем каждые 500мс до 5 секунд
    // (даём время загрузиться интерфейсам)
    if (!shown) {
        var attempts = 0;
        var retryTimer = setInterval(function () {
            attempts++;
            tryShow();
            if (shown || attempts >= 10) {
                clearInterval(retryTimer);
                if (!shown) console.warn('[pravo] 🚫 Ник "' + nick + '" — уведомление показать не удалось.');
            }
        }, 500);
    }
}

(function _nickCheck(callback) {
    // Если проверка отключена — сразу запускаем скрипт для всех
    if (!NICK_CHECK_ENABLED) {
        console.log('[pravo] ⚠️ Проверка ника ОТКЛЮЧЕНА (NICK_CHECK_ENABLED = false) — скрипт доступен всем.');
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
            console.warn('[pravo] Не удалось получить ник — скрипт не запущен.');
        }
    }, 500);
})(function() {
// ПРЕФЕТЧ ВСЕХ КАСТОМНЫХ ИНТЕРФЕЙСОВ С GITHUB Грузим 5 файлов параллельно при старте игры.
(function prefetchAllCustomUI() {
    var BASE = 'https://raw.githubusercontent.com/BensonZahar/Hud.js/main/PRAVO%20AHK/'
             + encodeURIComponent('Кастом Интерфейсы') + '/';
    var FILES = {
        zkm_js:       BASE + 'zkm.js',
        zkm_css:      BASE + 'zkm.css',
        zkmsn_js:     BASE + 'ZkmScreenNotification.js',
        zkmsn_css:    BASE + 'ZkmScreenNotification.css',
        dokladi_js:   BASE + 'dokladi.js',
        dokladi_css:  BASE + 'dokladi.css',
        sidemenu_js:  BASE + 'SideMenu.js',
        sidemenu_css: BASE + 'SideMenu.css'
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
                    console.log('[pravo] ✅ префетч ' + k + ' (' + text.length + ' байт)');
                    return text;
                })
                .catch(function(e) {
                    console.warn('[pravo] ⚠️ префетч ' + k + ' не удался:', e.message);
                    window['__prefetch_' + k + '_failed'] = true;
                });
        })(key);
    }

    // Сохраняем общий Promise чтобы локальные загрузчики могли await-нуть
    window.__prefetch_promise = Promise.allSettled(Object.values(promises))
        .then(function() {
            console.log('[pravo] 🎯 все префетчи завершены');
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

// PRAVO AHK VERSION: 1.0
console.log("[INIT] === СЛУЖБА БЕЗОПАСНОСТИ AHK v9.0 ЗАГРУЖЕН ===");
// ── ПОКАЗ "AHK by konstt" при первом загрузке ──────────────────────
(function showStartupGameText() {
    var attempts = 0;
    var timer = setInterval(function() {
        attempts++;
        try {
            var gt = window.interface && window.interface('GameText');
            if (gt && typeof gt.add === 'function') {
                clearInterval(timer);
                gt.add('[3, "АНК <span style=\\"color:#CCFF00\\">СЛУЖБА БЕЗОПАСНОСТИ</span>&nbsp;by konstt", 5000, 0, 0, false, false, 2.0]');
            }
        } catch(e) {}
        if (attempts >= 40) clearInterval(timer); // макс. 20 секунд ожидания
    }, 500);
})();
// ──────────────────────────────────────────────────────────────────────
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
        console.warn('[PRAVO] Ошибка чтения local.id из onUpdatePlayersList:', err);
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
        console.warn('[PRAVO] Ошибка получения ID из Hud:', e);
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
// Скины СЛУЖБА БЕЗОПАСНОСТИ: 57♂ 141♀ 147♂ 164♀ 165♂ 187♂ 208♂ 227♂ 16360♀
const pravoSkins = [57, 141, 147, 164, 165, 187, 208, 227, 16360];

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
            window._pravoSkinId = skinId; // прокидываем наружу для проверки исключений (например СОБР для greeting)

            console.log(`[SKIN] 🔍 Новый Skin ID обнаружен: ${skinId}`);

            // Проверяем, является ли скин МВД
            if (pravoSkins.includes(skinId)) {
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
        window._pravoSkinId = skinId; // FIX: прокидываем наружу для MvdMenu.js
        console.log(`[SKIN] 📌 Начальный Skin ID: ${skinId}`);
    
        if (pravoSkins.includes(skinId)) {
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
let autoCuffEnabled = false;

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
// Пункты меню, после которых шлём "/c 60" и закрываем диалог "Точное время" через 1.5с
// Формат: ["greeting","fine",...] (пусто = выключено везде) — настраивается установщиком
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
            var _isOmonSkin = false /* ПРАВО: нет ОМОН */;
            var _needsIdForThis = _opt.needsId && !(_action === 'greeting' && _isOmonSkin);
            if (_needsIdForThis) {
                // Открываем серверный диалог ввода ID (668) — нативный путь без MvdMenu
                setTimeout(function(){ showIdInputDialog(giveLicenseTo); }, 50);
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
            setTimeout(() => { _navPending = false; }, 300);
            console.log(`[NAV] A/D dlg=${dlgId} dir=${direction}`);
            if (direction === 0) {
                // A — назад в родительское меню (одна страница — пагинации нет)
                if (dlgId === 667) {
                    lastMenuType = null; currentMenu = null;
                    setTimeout(() => showMvdSubMenu(giveLicenseTo), 50);
                }
            }
            // D — нет следующей страницы, ничего не делаем
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
                        console.log('[PRAVO] 🚫 Проверка документов отменена (отказ/далеко/нет игрока)');
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
        console.log('[PRAVO-CHAT] window.onChatMessage не найден — раннее логирование не установлено');
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
    console.log('[PRAVO-CHAT] Раннее логирование чата установлено (onChatMessage)');
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
                : ((typeof window._pravoGrabSkip !== 'undefined') ? window._pravoGrabSkip : []);
            const skip = (key) => skipList.includes(key);
            const allItems = [
                { key: 'medkit',     label: 'Аптечка' },
                { key: 'painkiller', label: 'Обезболивающее' },
                { key: 'baton',      label: 'Дубинка' },
                { key: 'shield',     label: 'Щит' },
                { key: 'vest',       label: 'Бронежилет' },
                { key: 'deagle',     label: 'Desert Eagle' },
                { key: 'magnum',     label: 'Патроны .44' },
                { key: 'akm',        label: 'АКМ' },
                { key: 'ammo762',    label: 'Патроны 7.62' },
                { key: 'aks74u',     label: 'АКС-74У' },
                { key: 'ammo545',    label: 'Патроны 5.45' },
            ];
            const takenItems = allItems.filter(i => !skip(i.key)).map(i => i.label);
            snAdd(`[1, "Авто-снаряжение", "Берётся: ${takenItems.join(', ')}", "00FF00", 5000]`);
        } else {
            snAdd(`[1, "Авто-снаряжение", "Выключено", "FF4444", 3000]`);
        }
    } catch(e) {
        console.warn('[PRAVO-GRAB] toggleAutoGrab notify error:', e);
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
    const adjustedIndex = optionIndex; // все пункты на одной странице, смещение не нужно
    if (adjustedIndex >= 0 && adjustedIndex < _visible.length) {
        const option = _visible[adjustedIndex];
        currentAction = option.action;
  
        // Динамическая проверка needsId: для "greeting" не запрашивать ID, если скин ОМОН (15340)
        const isOmonSkin = false /* ПРАВО: нет ОМОН */;
        const needsIdForThis = option.needsId && !(option.action === "greeting" && isOmonSkin);
  
        if (needsIdForThis) {
            setTimeout(() => {
                showIdInputDialog(giveLicenseTo);
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
        console.log('[PRAVO] 🚫 Проверка документов пропущена (недавняя отмена по этой цели)');
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
        console.warn('[PRAVO] ZkmScreenNotification.addOfferChoice недоступен — fallback на обычное уведомление');
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



const executePovsednevAction = (action, targetId) => {
    if (!targetId) targetId = giveLicenseTo;
    const isOmonSkin = false /* ПРАВО: нет ОМОН */;
    switch (action) {
	case "greeting":
		const _rank = window._pravoRank || '';
		const _firstName = window._pravoFirstName || '';
		const _lastName = window._pravoLastName || '';
		const _callsign = CALLSIGN || window._pravoCallsign || '';

		if (isOmonSkin) {
			sendMessagesWithDelay([
				`Работает сотрудник ПРАВО | Мой позывной ${_callsign}`,
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
                 "/s Работает ПРАВО, руки за голову!",
                 "/s Если Вы убежите или попробуете это сделать я сочту это за 5.2.1 УК",
                 "/s Готовим свои документы!"
             ], [750, 1000, 1000]);
         } else {
             // ── Определяем скины ГУВД ──
             const guvdSkins = []; // ПРАВО: нет ГУВД-подразделений
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
      
    }
};
window.showGiveLicenseDialog = (e) => {
    giveLicenseTo = e;
    currentMenu = null;
    let availableTypes = [];
    if (pravoSkins.includes(skinId)) {
        availableTypes.push({ name: "СЛУЖБА БЕЗОПАСНОСТИ", id: "mvd_main" });
    }
    shownLicenseTypes = availableTypes;
    let licenseList = '';
    availableTypes.forEach((license, index) => {
        licenseList += `${index + 1}. ${license.name}<n>`;
    });
    window.addDialogInQueue(`[666,2,"АХК tg:ZaharKonst | СБ: ${giveLicenseTo}","","Выбрать","Отмена",0,0]`, licenseList, 0);
};
// ── Внутренний построитель диалога 667 (Повседневная) ───────────────────────
// Используется как window.showPovsednevMenuPage (начальный вызов, сбрасывает страницу),
// так и из A/D-обработчика напрямую (страница уже обновлена до вызова).
function _buildPovsednevDialog() {
    const _visible = povsednevOptions.filter(function(o) {
        return !MENU_HIDDEN_ITEMS.includes(o.action);
    });
    // Стиль 4 = list_title: первая строка — серый нон-кликабельный заголовок,
    // остальные кликабельны. Индексы ответа считаются БЕЗ заголовка (0 = первый пункт).
    let _content = 'AHK by konstt<n>';
    _visible.forEach(function(opt) { _content += opt.name + '<n>'; });
    window.addDialogInQueue(
        '[667,4,"СЛУЖБА БЕЗОПАСНОСТИ | Повседневная","","Выбрать","Назад",0,0]',
        _content, 0
    );
}

window.showPovsednevMenuPage = (e) => {
    giveLicenseTo = e;
    currentMenu = "povsednev";
    currentPage = 0;   // сброс пагинации при каждом свежем открытии
    _buildPovsednevDialog();
};

// Открыть главное меню МВД — для хоткея MENU_KEY: открываем серверный диалог 677
window.showMvdMainMenuPage = (e) => {
    giveLicenseTo = e;
    currentMenu = "main";
    currentPage = 0;
    showMvdSubMenu(e);
};

// Публичный API — выполнить действие Повседневной напрямую (хоткеи, внешний вызов)
window._mvdExecuteAction = function(action, id) {
    giveLicenseTo = (id !== undefined && id !== null && id !== -1) ? id : giveLicenseTo;
    currentAction = action;
    currentMenu = "povsednev";
    // FIX: если профиль ещё не загружен (бинд нажат раньше открытия меню) —
    // сначала загружаем rank/firstName/lastName, потом выполняем действие.
    var doExecute = function() { executePovsednevAction(action, giveLicenseTo); };
    if (!window._pravoFirstName || !window._pravoLastName || !window._pravoRank) {
        if (typeof window._pravoLoadPlayerProfile === 'function') {
            window._pravoLoadPlayerProfile(doExecute);
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
        const _rank = window._pravoRank || '';
        const _lastName = window._pravoLastName || '';
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
    if (!window._pravoLastName || !window._pravoRank) {
        if (typeof window._pravoLoadPlayerProfile === 'function') {
            window._pravoLoadPlayerProfile(doSend);
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
    let licenseList = 'AHK by konstt<n>';
    availableSub.forEach((license, index) => {
        licenseList += `${index + 1}. ${license.name}<n>`;
    });
    window.addDialogInQueue(`[677,4,"СЛУЖБА БЕЗОПАСНОСТИ","","Выбрать","Отмена",0,0]`, licenseList, 0);
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
            // Читаем action из currentAction (биндинги) или _mvdMenuPendingAction (fallback)
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
    window._pravoSkinId = skinId; // FIX: прокидываем наружу для MvdMenu.js
    if (pravoSkins.includes(skinId)) {
        
        const openMenu = () => {
            try {
                const gt = window.interface && window.interface("GameText");
                if (gt && typeof gt.add === 'function') {
                    gt.add('[3, "АНК <span style=\\"color:#CCFF00\\">СЛУЖБА БЕЗОПАСНОСТИ</span>&nbsp;by konstt", 5000, 0, 0, false, false, 2.0]');
                }
            } catch(e) {}
            showMvdMainMenuPage(args[1]);
        };

        // Если данные уже загружены — открываем меню МГНОВЕННО
        if (window._pravoFirstName && window._pravoLastName && window._pravoRank) {
            openMenu();
        } else if (typeof window._pravoLoadPlayerProfile === 'function') {
            // Первый раз — загружаем профиль, потом открываем
            window._pravoLoadPlayerProfile(openMenu);
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
        sendChatInput("Настройки ПРАВО сброшены. Следующее /dahk откроет главное меню.");
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
            if (style === 2 && dialogId === 0 && title.includes('СЛУЖБА БЕЗОПАСНОСТИ') && window.AUTO_GRAB && typeof window.autoGrab === 'function') {
                if (!window._pravoGrabProcessing) {
                    console.log('[PRAVO-GRAB] === v2.1 🎯 ТРИГГЕР СРАБОТАЛ — Полицейская служба ===');
                    setTimeout(() => window.autoGrab(), 150);
                }
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
console.log('[PRAVO-GRAB] === v2.2 🔫 БЛОК AUTO_GRAB ЗАПУЩЕН (МОМЕНТАЛЬНЫЙ) ===');
window.AUTO_GRAB = true; // гарантируем что window.AUTO_GRAB = true внутри блока

// ==================== ID ПРЕДМЕТОВ ====================
 const ITEM = {
     PAINKILLERS: 379,  // Обезболивающее
     MEDKIT:      2,    // Аптечка
     BATON:       32,   // Дубинка
     SHIELD:      385,  // Щит ⚠️ уточни ID предмета в игре
     TASER:       13,   // Тазер (не используется в СЛУЖБА БЕЗОПАСНОСТИ)
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
 // ======= ПОЗИЦИИ В МЕНЮ СЛУЖБА БЕЗОПАСНОСТИ (0-based, по скриншоту) =======
 // 0:Обезбол 1:Аптечка 2:Дубинка 3:Щит 4:Бронежилет 5:Desert Eagle
 // 6:АКМ 7:АКС-74У 8:Патроны.44 9:Патроны7.62 10:Патроны5.45
 const MENU = {
     PAINKILLERS:  0,
     MEDKIT:       1,
     BATON:        2,
     SHIELD:       3,  // Щит
     VEST:         4,
     DEAGLE:       5,
     AKM:          6,
     AKS74U:       7,
     AMMO_MAGNUM:  8,
     AMMO_762:     9,
     AMMO_545:    10,
     // TASER убран из авто-снаряжения СЛУЖБА БЕЗОПАСНОСТИ
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
         const skipList = (typeof AUTO_GRAB_SKIP !== 'undefined' && AUTO_GRAB_SKIP.length) ? AUTO_GRAB_SKIP : ((typeof window._pravoGrabSkip !== 'undefined') ? window._pravoGrabSkip : []);
         const skip = (key) => skipList.includes(key);

         const has = {
             painkillers: skip('painkiller')  ? 1   : (findItem(ITEM.PAINKILLERS) ? 1 : 0),
             medkit:      skip('medkit')      ? 999 : (findItemInInv(ITEM.MEDKIT)  ? 1 : 0),
             baton:       skip('baton')       ? 1   : (findItem(ITEM.BATON)       ? 1 : 0),
             shield:      skip('shield')      ? 1   : (findItem(ITEM.SHIELD)      ? 1 : 0),
             vest:        skip('vest') ? 100 : armourVal,       skip('taser')       ? 1   : (findItem(ITEM.TASER)       ? 1 : 0),
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
             shield:      !has.shield,
             vest:        has.vest < 10,
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
             notify("СЛУЖБА БЕЗОПАСНОСТИ", "Всё снаряжение есть ✓", "00FF00");
             return; 
         }

         // ── Шаг 4: МОМЕНТАЛЬНО берём предметы из меню ──
         // toTake: строго в порядке меню ПРАВО (0→10) чтобы не было двойных нажатий
         const toTake = [];
         if (need.painkillers) toTake.push({ name: "Обезболивающее",                      idx: MENU.PAINKILLERS });
         if (need.medkit)      toTake.push({ name: "Аптечка",                             idx: MENU.MEDKIT });
         if (need.baton)       toTake.push({ name: "Дубинка",                             idx: MENU.BATON });
         if (need.shield)      toTake.push({ name: "Щит",                                 idx: MENU.SHIELD });
         if (need.vest)        toTake.push({ name: `Бронежилет (${armourVal}%)`,          idx: MENU.VEST });
         if (need.deagle)      toTake.push({ name: "Desert Eagle",                        idx: MENU.DEAGLE });
         if (need.akm)         toTake.push({ name: "АКМ",                                 idx: MENU.AKM });
         if (need.aks74u)      toTake.push({ name: "АКС-74У",                             idx: MENU.AKS74U });
         if (need.magnum)      toTake.push({ name: `Патроны .44 (есть: ${has.magnum})`,   idx: MENU.AMMO_MAGNUM });
         if (need.ammo762)     toTake.push({ name: `Патроны 7.62 (есть: ${has.ammo762})`, idx: MENU.AMMO_762 });
         if (need.ammo545)     toTake.push({ name: `Патроны 5.45 (есть: ${has.ammo545})`, idx: MENU.AMMO_545 });
         // Тазер не используется в СЛУЖБА БЕЗОПАСНОСТИ

         for (let i = 0; i < toTake.length; i++) {
             console.log(`[PRAVO-GRAB] → беру: ${toTake[i].name} (idx=${toTake[i].idx}) [МОМЕНТАЛЬНО]`);
             take(toTake[i].idx);
             // Микро-задержка 20мс на случай жесткого анти-флуда на сервере.
             // Для глаза это выглядит как мгновенное выполнение.
             await sleep(20); 
         }

         // ⚠️ ВАЖНО: Закрываем меню принудительно, чтобы сервер не переоткрывал диалог
         closeMenu();

         const notifyNames = toTake.map(t => t.name.replace(/ \(есть: \d+\)/, ''));
         notify("СЛУЖБА БЕЗОПАСНОСТИ", notifyNames.join(", "), "00FF00");
         window.playSound("inventory/take_light.mp3");

     } catch (err) {
         console.error('[PRAVO-GRAB] Ошибка:', err);
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
         console.log('[PRAVO-GRAB] готов (моментальный + закрытие меню)');
     }
 }

 // ==================== ТРИГГЕР ====================
 window.autoGrab = autoGrab;
 Object.defineProperty(window, '_pravoGrabProcessing', {
     get: () => isProcessing,
     configurable: true
 });
 console.log('[PRAVO-GRAB] === v2.2 ✅ ГОТОВ — жду диалог Полицейская служба ===');
})();
} // end if (AUTO_GRAB)
// ==================== END АВТОБРАНИЕ МВД ====================
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
    if (window._pravoFirstName && window._pravoLastName && window._pravoRank) {
        console.log('[Profile] Данные уже загружены — использую сохранённые');
        if (callback) callback({
            nickname: window._pravoCallsign,
            orgRangName: window._pravoRank
        });
        return;
    }
    
    if (_fetching) {
        // Уже идёт загрузка — ждём завершения
        var waitPoll = setInterval(function() {
            if (!_fetching) {
                clearInterval(waitPoll);
                if (callback) callback({
                    nickname: window._pravoCallsign,
                    orgRangName: window._pravoRank
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
            nickname: window._pravoCallsign || '',
            orgRangName: window._pravoRank || ''
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
                    window._pravoCallsign = stats.nickname || '';
                    window._pravoRank = stats.orgRangName || '';

                    // Парсим ник на Имя и Фамилию
                    var nickParts = (stats.nickname || '').split(/[_\s]+/);
                    window._pravoFirstName = nickParts[0] || '';
                    window._pravoLastName = nickParts[1] || '';

                    console.log('[Profile] Запомнено: ' + window._pravoRank + ' ' + window._pravoFirstName + ' ' + window._pravoLastName);
                } else {
                    console.warn('[Profile] Таймаут — данные не получены');
                }

                setTimeout(function() {
                    finishFlow({
                        nickname: window._pravoCallsign,
                        orgRangName: window._pravoRank
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
                window._pravoFirstName = null;
                window._pravoLastName = null;
                window._pravoRank = null;
                window._pravoCallsign = null;
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
    // игрока — чтобы к первому /dahk данные уже лежали в window._pravoRank /
    // _mvdFirstName / _mvdLastName и MvdMenu открывалось мгновенно.
    setTimeout(function() {
        if (window._pravoFirstName && window._pravoLastName && window._pravoRank) return;
        console.log('[Profile] 🔄 Фоновая предзагрузка профиля при старте...');
        loadPlayerProfile(function(data) {
            if (data && data.orgRangName) {
                console.log('[Profile] ✅ Предзагрузка готова: ' + data.orgRangName + ' ' + (window._pravoFirstName||'') + ' ' + (window._pravoLastName||''));
            } else {
                console.warn('[Profile] ⚠️ Предзагрузка: данные не получены — при первом /dahk будет обычная загрузка');
            }
        });
    }, 1500);
});

window._pravoLoadPlayerProfile = loadPlayerProfile;
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
    console.log('[PRAVO] Патч MainMenu→Персонаж активен');
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
// ── КОНЕЦ БЛОКА ПРОВЕРКИ НИКА ─────────────────────────────────

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║                                                                          ║
// ║          ⬇  НАСТРОЙКА SideMenu / СТРОЙ  —  РЕДАКТИРУЙ ЗДЕСЬ  ⬇         ║
// ║                                                                          ║
// ╚══════════════════════════════════════════════════════════════════════════╝

// ── Команда для открытия / закрытия меню ─────────────────────────────────────
//    Поменяй строку ниже, если хочешь другую команду.
var STROI_COMMAND = '/stroi';

// ── Пункты меню и сообщение, которое ПЕЧАТАЕТСЯ В ЧАТ при выборе ─────────────
//    • id      — уникальное имя (латиница, без пробелов)
//    • title   — текст пункта в меню
//    • message — что будет напечатано в чат (посимвольно, как живой набор)
//
//    Добавляй строки, удаляй, меняй title/message — остальное подхватится само.
window._stroiMenuItems = [
    {
        id: 'lecture',
        title: 'Лекция',
        // subItems открывают второй экран в SideMenu.
        // ESC на нём возвращает назад, как в оригинальном Window/Modal.
        // Каждый пункт имеет messages[] — массив /s-команд, отправляемых
        // последовательно с паузой 4 с между ними (см. sendSequentialMessages в SideMenu.js).
        subItems: [
            {
                id: 'lecture_1',
                title: '1. Заключённые',
                messages: [
                    '/s Доброго времени суток, тема лекции, общие положения о заключённых.',
                    '/s Обыскивайте камеры на запрещённые предметы. При бунте, наручники и карцер. При групповом, подмога и дубинки.',
                    '/s Выводите заключённых на улицу, кухню, цех и прачечную. Навещайте карцер.',
                    '/s Лекция окончена.'
                ]
            },
            {
                id: 'lecture_2',
                title: '2. Субординация',
                messages: [
                    '/s Доброго времени суток, тема лекции, субординация.',
                    '/s К старшим по званию "Товарищ [звание]", ко всем сослуживцам на "Вы". Нарушение устава, глава 4 пункт 1.',
                    '/s Лекция окончена.'
                ]
            },
            {
                id: 'lecture_3',
                title: '3. Поведение в строю',
                messages: [
                    '/s Доброго времени суток, тема лекции, поведение в строю.',
                    '/s В строю запрещено разговаривать, выходить, пользоваться телефоном и доставать оружие.',
                    '/s Есть вопрос, говорите "Разрешите обратиться". Глава 6 устава. Лекция окончена.'
                ]
            },
            {
                id: 'lecture_4',
                title: '4. Служебный транспорт',
                messages: [
                    '/s Доброго времени суток, тема лекции, служебный транспорт.',
                    '/s Паркуйтесь только на парковке по ПДД. Блокировать ворота запрещено. У ворот зоны парковаться только в крайних случаях.',
                    '/s Лекция окончена.'
                ]
            },
            {
                id: 'lecture_5',
                title: '5. Несение службы',
                messages: [
                    '/s Доброго времени суток, слушайте внимательно.',
                    '/s Доклады каждые 10 минут. Пост покидать только с разрешения. Транспорт и оружие только с разрешения. Стрелять по гражданам запрещено.',
                    '/s Лекция окончена.'
                ]
            },
            {
                id: 'lecture_6',
                title: '6. Рация',
                messages: [
                    '/s Доброго времени суток, тема лекции, рация.',
                    '/s Рация это средство связи для докладов. Запрещены оскорбления, мат и бессмысленные сообщения. За нарушение выговор.',
                    '/s Лекция окончена.'
                ]
            },
            {
                id: 'lecture_7',
                title: '7. КПП с гражданскими',
                messages: [
                    '/s Доброго времени суток, тема лекции, поведение на КПП.',
                    '/s Приветствуйте гостя, уберите оружие и спросите цель визита. Не допускайте конфликтов.',
                    '/s Если гражданин нарушает, попросите отойти на 30 метров. Не подчиняется, досчитайте до 10 и применяйте силу. Бить и стрелять без причины, увольнение и ЧС ПРАВО.',
                    '/s Лекция окончена.'
                ]
            },
            {
                id: 'lecture_8',
                title: '8. Тренировка',
                messages: [
                    '/s Доброго времени суток, тема лекции, поведение на тренировке.',
                    '/s Слушайтесь старших, оружие по приказу, в строю молчать. Проводит тренировку сотрудник от звания Инспектор и выше.',
                    '/s Устали, подойдите к организатору. Сон в строю, выговор. Лекция окончена.'
                ]
            }
        ]
    },
    { id: 'training', title: 'Тренировка',   message: 'Сейчас пройдет тренировка'  },
    { id: 'special',  title: 'Спец задания', message: 'Сейчас пройдут спец задания' },
    // Примеры — раскомментируй или добавь свои:
    // { id: 'briefing', title: 'Инструктаж',   message: 'Начинается инструктаж'},
    // { id: 'checkout', title: 'Проверка',      message: 'Проводится проверка личного состава'},
];

// ── Регистрация команды (не трогай) ──────────────────────────────────────────
;(function(){
    var _prev = window.sendChatInput;
    window.sendChatInput = function(text){
        if(typeof text === 'string' && text.trim().toLowerCase() === STROI_COMMAND.toLowerCase()){
            if(window.getInterfaceStatus('SideMenu')){
                var comp = window.interface('SideMenu');
                if(comp) comp.close();
            } else {
                window.openInterface('SideMenu');
            }
            return;
        }
        return _prev && _prev(text);
    };
    sendChatInput = window.sendChatInput;
    console.log('[STROI] Команда ' + STROI_COMMAND + ' зарегистрирована. Пунктов меню: ' + window._stroiMenuItems.length);
})();

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║          ⬆  КОНЕЦ НАСТРОЙКИ SideMenu  ⬆                                ║
// ╚══════════════════════════════════════════════════════════════════════════╝



// ==================== WINDOW/MODAL: CURSOR / HIDE / DRAG v5 ====================
// Скрытие курсора (короткий Alt), скрытие диалога (Alt удержание >=500 мс)
// и перетаскивание за заголовок — для серверных диалогов 666–677, 695–696,
// отрисовываемых Window.js / Modal.js. Window.js и Modal.js не трогаем.
//
// Исправлено:
//   • курсор скрывается реально, потому что гасятся настоящие имена Window0/Window1/...
//   • скрытие диалога мгновенное, включая кнопки ControlsContaineredButton;
//   • drag работает через делегирование и переживает замену DOM после переходов;
//   • позиция 677 и 667 общая, так как это один тип меню;
//   • при пагинации / переходах позиция восстанавливается корректно.
;(function () {
'use strict';

// Защита от двойного подключения
if (window.__pravoWindowModalV5) return;
window.__pravoWindowModalV5 = true;

var CURSOR_NAME = 'Window';
var ALT_HOLD_MS = 500;
var STYLE_ID = 'pravo-window-modal-v5-style';

var _active = false;
var _menuHidden = false;
var _altHoldTimer = null;
var _altHoldFired = false;
var _blurredInput = null;
var _cursorVisible = true;
var _hiddenCursorNames = [];

var _currentDialogId = null;
var _currentDialogStyle = null;
var _currentCursorName = null;

var _savedPositions = {};

var _prevOnKeyDown = null;
var _prevOnKeyUp = null;

var _drag = null;
var _pollTimer = null;

// ── Определение движка / платформы ────────────────────────────────────────
// PC (Radmir) : window.App.engine === 'legacy'  → мышь
// Мобилка (Hassle) : window.App.isMobile        → тач + клик
function _isMobile() {
    return !!(window.App && window.App.isMobile);
}

// Флаг: палец сдвинулся после touchstart — нужен для отличия drag от тапа
var _touchMoved = false;

// Сброс сохранённых позиций
window._pravoResetDialogPositions = function () {
    _savedPositions = {};
    console.log('[PRAVO] Позиции диалогов сброшены');
};

function _isOurDialog(id) {
    return (id >= 666 && id <= 677) || id === 695 || id === 696;
}

// ── CSS: мгновенное скрытие диалога ───────────────────────────────────────
function _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    var st = document.createElement('style');
    st.id = STYLE_ID;
    st.textContent = [
        '.pravo-dialog-hidden,',
        '.pravo-dialog-hidden *,',
        '.pravo-dialog-hidden *::before,',
        '.pravo-dialog-hidden *::after{',
        '  display:none !important;',
        '  visibility:hidden !important;',
        '  opacity:0 !important;',
        '  pointer-events:none !important;',
        '  transition:none !important;',
        '  animation:none !important;',
        '}',

        '.modal__title{',
        '  user-select:none !important;',
        '  -webkit-user-select:none !important;',
        '  cursor:grab;',
        '  touch-action:none;',
        '}',

        '.modal__title:active{',
        '  cursor:grabbing;',
        '}'
    ].join('\n');

    document.head.appendChild(st);
}

// ── Ключ позиции ─────────────────────────────────────────────────────────
// 667 и 677 используют одну позицию, потому что это один тип меню.
// Если хочешь, чтобы вообще все ПРАВО-диалоги 666–677 имели одну позицию,
// поставь им всем одну группу, например 'pravo-common'.
function _getPositionKey() {
    var groups = {
        667: 'pravo-list-menu',
        677: 'pravo-list-menu',

        666: 'pravo-select',
        668: 'pravo-input',

        695: 'scc-period',
        696: 'scc-table'
    };

    if (_currentDialogId !== null && groups[_currentDialogId]) {
        return groups[_currentDialogId];
    }

    if (_currentDialogStyle !== null) {
        return 'dialog-style-' + _currentDialogStyle;
    }

    return 'dialog-' + _currentDialogId;
}

// ── Получаем реальные имена курсоров из index.js ─────────────────────────
// index.js открывает диалоговый курсор как Window0, Window1, Window2 и т.д.
// Поэтому нужно гасить именно их, а не абстрактный "Window".
function _getWindowCursorNames() {
    var names = [];

    if (_currentCursorName) {
        names.push(_currentCursorName);
    }

    try {
        if (window.App && Array.isArray(window.App.dialogsQueue)) {
            window.App.dialogsQueue.forEach(function (q) {
                var idx = Array.isArray(q) ? q[0] : q;
                if (idx !== undefined && idx !== null) {
                    names.push('Window' + idx);
                }
            });
        }
    } catch (e) {}

    try {
        if (window.App && window.App.components) {
            Object.keys(window.App.components).forEach(function (key) {
                if (!/^Window\d+$/.test(key)) return;

                var comp = window.App.components[key];
                if (comp && comp.open && comp.open.status) {
                    names.push(key);
                }
            });
        }
    } catch (e) {}

    // Убираем дубли
    return names.filter(function (name, index) {
        return names.indexOf(name) === index;
    });
}

// ── Скрытие / показ курсора ────────────────────────────────────────────────
function hideCursor() {
    if (!_cursorVisible) return;

    _cursorVisible = false;

    var wrapper = _getActiveWrapper();
    var ae = document.activeElement;

    if (
        ae &&
        wrapper &&
        wrapper.contains(ae) &&
        (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA')
    ) {
        _blurredInput = ae;
        ae.blur();
    } else {
        _blurredInput = null;
    }

    var names = _getWindowCursorNames();
    _hiddenCursorNames = names.slice();

    if (typeof window.setCursorStatus === 'function') {
        names.forEach(function (name) {
            try {
                window.setCursorStatus(name, false);
            } catch (e) {}
        });

        // Старое служебное имя — на всякий случай тоже гасим
        try {
            window.setCursorStatus(CURSOR_NAME, false);
        } catch (e) {}
    }
}

function showCursor() {
    if (_cursorVisible) return;

    _cursorVisible = true;

    var names = _getWindowCursorNames();

    if (!names.length && _hiddenCursorNames.length) {
        names = _hiddenCursorNames;
    }

    if (typeof window.setCursorStatus === 'function') {
        names.forEach(function (name) {
            try {
                window.setCursorStatus(name, true);
            } catch (e) {}
        });
    }

    _hiddenCursorNames = [];

    if (
        !(window.App && window.App.developmentMode) &&
        typeof window.setDrawLabelStatus === 'function'
    ) {
        window.setDrawLabelStatus(true);
    }

    var el = _blurredInput;
    _blurredInput = null;

    if (el && el.isConnected) {
        setTimeout(function () {
            if (el.isConnected) el.focus();
        }, 0);
    }
}

// ── DOM-хелперы ───────────────────────────────────────────────────────────
function _getRoots() {
    var roots = [];
    var wrappers = document.querySelectorAll('.modal-container-wrapper');

    Array.prototype.forEach.call(wrappers, function (w) {
        if (!w.isConnected) return;
        if (!w.closest || !w.closest('.window')) return;

        var root = w.closest('.iface-centered') || w;

        if (roots.indexOf(root) === -1) {
            roots.push(root);
        }
    });

    return roots;
}

function _getActiveWrapper() {
    var all = Array.prototype.slice.call(document.querySelectorAll('.modal-container-wrapper'));
    var i, w;

    // Сначала ищем живой wrapper, который не находится в leave-анимации
    for (i = all.length - 1; i >= 0; i--) {
        w = all[i];

        if (!w.isConnected) continue;
        if (!w.closest || !w.closest('.window')) continue;
        if (String(w.className || '').indexOf('leave-active') !== -1) continue;

        if (w.querySelector('.modal__title')) {
            return w;
        }
    }

    // Fallback: любой живой Window-wrapper
    for (i = all.length - 1; i >= 0; i--) {
        w = all[i];

        if (!w.isConnected) continue;
        if (!w.closest || !w.closest('.window')) continue;

        if (w.querySelector('.modal__title')) {
            return w;
        }
    }

    return null;
}

// ── Позиция ───────────────────────────────────────────────────────────────
function _applySavedPosition() {
    if (!_active || _currentDialogId === null) return;

    var w = _getActiveWrapper();
    if (!w) return;

    // Если элемент скрыт или ещё не получил размеры — не применяем позицию,
    // чтобы не записать/не пересчитать её в нулевой размер.
    if (!w.offsetWidth && !w.offsetHeight) return;

    var posKey = _getPositionKey();

    // mark включает и группу, и текущий ID, чтобы при смене диалога внутри
    // одной группы позиция всё равно повторно применялась.
    var mark = 'pravo-pos-' + posKey + '-' + _currentDialogId;

    if (w.getAttribute('data-pravo-pos') === mark) return;

    var pos = _savedPositions[posKey];

    if (pos) {
        var left = parseFloat(pos.left) || 0;
        var top = parseFloat(pos.top) || 0;

        left = Math.max(0, Math.min(left, window.innerWidth - (w.offsetWidth || 0)));
        top = Math.max(0, Math.min(top, window.innerHeight - (w.offsetHeight || 0)));

        w.style.position = 'absolute';
        w.style.margin = '0';
        w.style.transform = 'none';
        w.style.left = left + 'px';
        w.style.top = top + 'px';
    }

    w.setAttribute('data-pravo-pos', mark);
}

// ── Скрытие / показ диалога ───────────────────────────────────────────────
function _syncHidden() {
    if (!_active) return;

    var roots = _getRoots();

    Array.prototype.forEach.call(roots, function (root) {
        if (_menuHidden) {
            root.classList.add('pravo-dialog-hidden');
        } else {
            root.classList.remove('pravo-dialog-hidden');
        }
    });
}

function _updateUi() {
    if (!_active) return;
    _applySavedPosition();
    _syncHidden();
}

function _startPoll() {
    if (_pollTimer) return;

    _pollTimer = setInterval(_updateUi, 100);
    _updateUi();
}

function _stopPoll() {
    if (_pollTimer) {
        clearInterval(_pollTimer);
        _pollTimer = null;
    }
}

function _setHidden(state) {
    if (_menuHidden === state) return;

    _menuHidden = state;

    _injectStyles();
    _syncHidden();

    if (state) {
        hideCursor();
    } else {
        showCursor();
    }
}

// ── Drag ──────────────────────────────────────────────────────────────────
function _ensureAbsolute(wrapper) {
    if (
        wrapper.style.position === 'absolute' &&
        wrapper.style.left !== '' &&
        wrapper.style.top !== ''
    ) {
        return;
    }

    var rect = wrapper.getBoundingClientRect();
    var parent = wrapper.offsetParent || document.body;
    var parentRect = parent.getBoundingClientRect();

    wrapper.style.position = 'absolute';
    wrapper.style.margin = '0';
    wrapper.style.transform = 'none';
    wrapper.style.left = (rect.left - parentRect.left) + 'px';
    wrapper.style.top = (rect.top - parentRect.top) + 'px';
}

function _onMouseDown(e) {
    if (_isMobile()) return;           // Мобилка (Hassle) — только тач, мышь не используем
    if (!_active || _menuHidden) return;
    if (e.button !== 0) return;

    var target = e.target;
    if (!target || !target.closest) return;

    var title = target.closest('.modal__title');
    if (!title) return;

    var wrapper = title.closest('.modal-container-wrapper');
    if (!wrapper || !wrapper.isConnected) return;
    if (!wrapper.closest('.window')) return;

    // Не трогаем старый диалог, который уходит через transition
    if (String(wrapper.className || '').indexOf('leave-active') !== -1) return;

    _ensureAbsolute(wrapper);

    _drag = {
        wrapper: wrapper,
        sx: e.clientX,
        sy: e.clientY,
        sl: parseFloat(wrapper.style.left) || 0,
        st: parseFloat(wrapper.style.top) || 0,
        ew: wrapper.offsetWidth || wrapper.getBoundingClientRect().width,
        eh: wrapper.offsetHeight || wrapper.getBoundingClientRect().height,
        ww: window.innerWidth,
        wh: window.innerHeight
    };

    document.body.style.userSelect = 'none';

    e.preventDefault();
    e.stopPropagation();
}

function _onMouseMove(e) {
    if (_isMobile()) return;           // Мобилка (Hassle) — игнорируем mousemove
    if (!_drag) return;

    var left = _drag.sl + (e.clientX - _drag.sx);
    var top = _drag.st + (e.clientY - _drag.sy);

    left = Math.max(0, Math.min(left, _drag.ww - _drag.ew));
    top = Math.max(0, Math.min(top, _drag.wh - _drag.eh));

    _drag.wrapper.style.left = left + 'px';
    _drag.wrapper.style.top = top + 'px';

    e.preventDefault();
}

function _onMouseUp() {
    if (_isMobile()) return;           // Мобилка (Hassle) — игнорируем mouseup
    if (!_drag) return;

    var wrapper = _drag.wrapper;

    if (_currentDialogId !== null) {
        _savedPositions[_getPositionKey()] = {
            left: wrapper.style.left,
            top: wrapper.style.top
        };
    }

    _drag = null;
    document.body.style.userSelect = '';
}

// ── Touch-drag (мобилка / Hassle) ─────────────────────────────────────────
function _onTouchStart(e) {
    if (!_isMobile()) return;          // ПК (Radmir) — только мышь, тач не используем
    if (!_active || _menuHidden) return;

    _touchMoved = false;               // Сбрасываем флаг для определения тапа

    var touch = e.touches[0];
    if (!touch) return;

    var target = touch.target;
    if (!target || !target.closest) return;

    var title = target.closest('.modal__title');
    if (!title) return;

    var wrapper = title.closest('.modal-container-wrapper');
    if (!wrapper || !wrapper.isConnected) return;
    if (!wrapper.closest('.window')) return;

    if (String(wrapper.className || '').indexOf('leave-active') !== -1) return;

    _ensureAbsolute(wrapper);

    _drag = {
        wrapper: wrapper,
        sx: touch.clientX,
        sy: touch.clientY,
        sl: parseFloat(wrapper.style.left) || 0,
        st: parseFloat(wrapper.style.top) || 0,
        ew: wrapper.offsetWidth || wrapper.getBoundingClientRect().width,
        eh: wrapper.offsetHeight || wrapper.getBoundingClientRect().height,
        ww: window.innerWidth,
        wh: window.innerHeight
    };

    document.body.style.userSelect = 'none';

    e.preventDefault();
    e.stopPropagation();
}

function _onTouchMove(e) {
    if (!_isMobile()) return;          // ПК (Radmir) — игнорируем touchmove
    _touchMoved = true;                // Палец двигается — это drag, не тап
    if (!_drag) return;

    var touch = e.touches[0];
    if (!touch) return;

    var left = _drag.sl + (touch.clientX - _drag.sx);
    var top  = _drag.st + (touch.clientY - _drag.sy);

    left = Math.max(0, Math.min(left, _drag.ww - _drag.ew));
    top  = Math.max(0, Math.min(top,  _drag.wh - _drag.eh));

    _drag.wrapper.style.left = left + 'px';
    _drag.wrapper.style.top  = top  + 'px';

    e.preventDefault();
}

function _onTouchEnd() {
    if (!_isMobile()) return;          // ПК (Radmir) — игнорируем touchend
    if (!_drag) return;

    var wrapper = _drag.wrapper;

    if (_currentDialogId !== null) {
        _savedPositions[_getPositionKey()] = {
            left: wrapper.style.left,
            top: wrapper.style.top
        };
    }

    _drag = null;
    document.body.style.userSelect = '';
}

// ── Клик / тап по заголовку (Hassle / мобилка) ───────────────────────────
// Одиночный тап (без перетаскивания) центрирует диалог на экране.
// _touchMoved исключает срабатывание после drag-жеста.
function _onTitleTap(e) {
    if (!_isMobile() || !_active || _menuHidden) return;
    if (_touchMoved) return;           // Это был drag — клик не обрабатываем

    var target = e.target;
    if (!target || !target.closest) return;

    var title = target.closest('.modal__title');
    if (!title) return;

    var wrapper = title.closest('.modal-container-wrapper');
    if (!wrapper || !wrapper.isConnected) return;
    if (!wrapper.closest('.window')) return;
    if (String(wrapper.className || '').indexOf('leave-active') !== -1) return;

    // Центрируем диалог по экрану
    _ensureAbsolute(wrapper);
    var left = Math.max(0, Math.round((window.innerWidth  - (wrapper.offsetWidth  || 0)) / 2));
    var top  = Math.max(0, Math.round((window.innerHeight - (wrapper.offsetHeight || 0)) / 2));
    wrapper.style.left = left + 'px';
    wrapper.style.top  = top  + 'px';

    if (_currentDialogId !== null) {
        _savedPositions[_getPositionKey()] = {
            left: wrapper.style.left,
            top:  wrapper.style.top
        };
    }
}

// ── Делегирование на document ─────────────────────────────────────────────
// Решает проблему замены DOM после переходов между диалогами.
//
// PC (Radmir)  → engine === 'legacy'  → только мышь (mouse*)
// Мобилка (Hassle) → isMobile = true  → тач (touch*) + клик
//
// Каждый обработчик самостоятельно проверяет платформу через _isMobile(),
// поэтому лишние события просто «проваливаются» на первой строке.

document.addEventListener('mousedown', _onMouseDown, true);
document.addEventListener('mousemove', _onMouseMove, true);
document.addEventListener('mouseup',   _onMouseUp,   true);

// Touch-drag: passive:false обязателен, иначе preventDefault() выбросит ошибку
document.addEventListener('touchstart', _onTouchStart, { capture: true, passive: false });
document.addEventListener('touchmove',  _onTouchMove,  { capture: true, passive: false });
document.addEventListener('touchend',   _onTouchEnd,   { capture: true, passive: true  });

// Клик / тап — Hassle: одиночный тап по заголовку = центрировать диалог
document.addEventListener('click', _onTitleTap, true);

// ── Подключение / отключение ───────────────────────────────────────────────
function _attach() {
    if (_active) return;

    _active = true;
    _menuHidden = false;
    _altHoldFired = false;
    _blurredInput = null;
    _cursorVisible = true;
    _hiddenCursorNames = [];

    _injectStyles();

    if (
        !(window.App && window.App.developmentMode) &&
        typeof window.setDrawLabelStatus === 'function'
    ) {
        window.setDrawLabelStatus(true);
    }

    _prevOnKeyDown = window.onKeyDown;
    _prevOnKeyUp = window.onKeyUp;

    window.onKeyDown = function (e) {
        if (e === window.KEY_CODE_ALT) {
            if (!_altHoldTimer && !_altHoldFired) {
                _altHoldTimer = setTimeout(function () {
                    _altHoldTimer = null;
                    _altHoldFired = true;
                    _setHidden(!_menuHidden);
                }, ALT_HOLD_MS);
            }
            return;
        }

        if (typeof _prevOnKeyDown === 'function') {
            return _prevOnKeyDown(e);
        }
    };

    window.onKeyUp = function (e) {
        if (e === window.KEY_CODE_ALT) {
            if (_altHoldTimer) {
                clearTimeout(_altHoldTimer);
                _altHoldTimer = null;

                if (!_menuHidden) {
                    if (_cursorVisible) {
                        hideCursor();
                    } else {
                        showCursor();
                    }
                }
            }

            _altHoldFired = false;
            return;
        }

        if (typeof _prevOnKeyUp === 'function') {
            return _prevOnKeyUp(e);
        }
    };

    _startPoll();
}

function _detach() {
    if (!_active) return;

    _active = false;

    if (_altHoldTimer) {
        clearTimeout(_altHoldTimer);
        _altHoldTimer = null;
    }

    window.onKeyDown = _prevOnKeyDown;
    window.onKeyUp = _prevOnKeyUp;

    _prevOnKeyDown = null;
    _prevOnKeyUp = null;

    _stopPoll();

    _drag = null;
    _menuHidden = false;
    _blurredInput = null;
    _cursorVisible = true;
    _hiddenCursorNames = [];
    _currentCursorName = null;

    // Страховка: снимаем класс скрытия, если DOM ещё жив
    Array.prototype.forEach.call(
        document.querySelectorAll('.pravo-dialog-hidden'),
        function (el) {
            el.classList.remove('pravo-dialog-hidden');
        }
    );
}

// ── Хук открытия диалога ───────────────────────────────────────────────────
var _prevAddDialog = window.addDialogInQueue;

window.addDialogInQueue = function (dialogParams, content, priority) {
    var dialogId = null;
    var dialogStyle = null;

    try {
        if (dialogParams && typeof dialogParams === 'string') {
            var parsed = JSON.parse(dialogParams.trim());
            dialogId = parseInt(parsed[0], 10);
            dialogStyle = parseInt(parsed[1], 10);
        }
    } catch (e) {}

    var isOur = _isOurDialog(dialogId);

    if (isOur) {
        _currentDialogId = dialogId;
        _currentDialogStyle = dialogStyle;
    }

    var result;

    if (typeof _prevAddDialog === 'function') {
        result = _prevAddDialog.apply(this, arguments);
    } else if (window.App && typeof window.App.addDialogInQueue === 'function') {
        result = window.App.addDialogInQueue(dialogParams, content, priority);
    }

    if (isOur) {
        _currentDialogId = dialogId;
        _currentDialogStyle = dialogStyle;

        // index.js увеличивает dialogIdx после добавления диалога.
        // Реальный курсор будет называться Window(dialogIdx - 1).
        try {
            if (
                window.App &&
                typeof window.App.dialogIdx === 'number' &&
                window.App.dialogIdx > 0
            ) {
                _currentCursorName = 'Window' + (window.App.dialogIdx - 1);
            }
        } catch (e) {}

        setTimeout(function () {
            if (_active) {
                _updateUi();
            } else {
                _attach();
            }
        }, 80);

        // Дополнительные проверки, пока Vue/Transition перерисовывает диалог
        setTimeout(_updateUi, 250);
        setTimeout(_updateUi, 600);
        setTimeout(_updateUi, 1000);
    }

    return result;
};

// ── Хук закрытия диалога ───────────────────────────────────────────────────
var _prevCloseLastDialog = window.closeLastDialog;

window.closeLastDialog = function () {
    _detach();

    if (typeof _prevCloseLastDialog === 'function') {
        return _prevCloseLastDialog.apply(this, arguments);
    }

    if (window.App && typeof window.App.closeLastDialog === 'function') {
        return window.App.closeLastDialog();
    }
};

console.log('[PRAVO] Window/Modal cursor/hide/drag v5 готов (engine detection: PC=mouse / Hassle=touch+tap)');
console.log('[PRAVO]   • Alt (короткий) = скрыть/показать курсор');
console.log('[PRAVO]   • Alt (>=500мс)  = скрыть/показать диалог вместе с курсором');
console.log('[PRAVO]   • 677 и 667 используют одну позицию меню');
console.log('[PRAVO]   • курсор гасится через реальные имена Window0/Window1/...');

})();
// ==================== END WINDOW/MODAL: CURSOR / HIDE / DRAG ====================

// ==================== ZKM / SIDEMENU: DRAG ====================
// Перетаскивание для кастомных интерфейсов ZKM и SideMenu.
// Работает независимо от Window/Modal drag (не требует _active —
// тот взводится только для серверных диалогов через addDialogInQueue,
// а ZKM/SideMenu открываются через openInterface).
//
// PC (Radmir): мышь. Hassle (мобилка): тач.
// Позиционирование: absolute left/top — идентично Window/Modal drag.
// Позиция сохраняется в _savedPos и восстанавливается при повторном
// открытии через setInterval-поллинг (200 мс).
;(function () {
'use strict';

if (window.__pravoCustomIfaceDragV1) return;
window.__pravoCustomIfaceDragV1 = true;

// ── Описание интерфейсов ──────────────────────────────────────────────────
// rootSel    — CSS-селектор корневого .modal элемента интерфейса
// dragZone   — зоны за которые можно тащить (inside card)
// noInteract — элементы внутри dragZone, по которым клик НЕ начинает drag
// posKey     — ключ для _savedPos
var IFACES = [
    {
        rootSel:    '.modal.zkm',
        dragZone:   '.modal__title, .zkm__subheader',
        noInteract: '.laws-helper__icon-btn, .laws-helper__tab',
        posKey:     'zkm'
    },
    {
        rootSel:    '.modal.side-menu',
        dragZone:   '.modal__title',
        noInteract: null,
        posKey:     'side-menu'
    }
];

var _savedPos   = {};       // сохранённые позиции по posKey
var _drag       = null;     // активный drag-стейт
var _touchMoved = false;    // true = палец двигался → это drag, не тап

function _isMobile() {
    return !!(window.App && window.App.isMobile);
}

// Находит wrapper и конфиг по целевому элементу; null — не наша зона
function _resolve(target) {
    if (!target || !target.closest) return null;
    for (var i = 0; i < IFACES.length; i++) {
        var cfg  = IFACES[i];
        var zone = target.closest(cfg.dragZone);
        if (!zone) continue;
        if (cfg.noInteract && target.closest(cfg.noInteract)) return null;
        var wrapper = zone.closest('.modal-container-wrapper');
        if (!wrapper || !wrapper.isConnected) return null;
        if (!wrapper.closest(cfg.rootSel)) return null;
        // Не трогаем карточку, которая уходит через transition
        if (String(wrapper.className || '').indexOf('leave-active') !== -1) return null;
        return { wrapper: wrapper, cfg: cfg };
    }
    return null;
}

// Переводим wrapper в absolute-позиционирование, сохраняя видимую позицию.
// Сбрасываем transform — ZKM ранее использовал translate(), теперь left/top.
function _ensureAbsolute(wrapper) {
    if (
        wrapper.style.position === 'absolute' &&
        wrapper.style.left !== '' &&
        wrapper.style.top  !== ''
    ) return;

    var rect   = wrapper.getBoundingClientRect();
    var parent = wrapper.offsetParent || document.body;
    var pRect  = parent.getBoundingClientRect();

    wrapper.style.position  = 'absolute';
    wrapper.style.margin    = '0';
    wrapper.style.transform = 'none';   // убираем translate() если был
    wrapper.style.left = (rect.left - pRect.left) + 'px';
    wrapper.style.top  = (rect.top  - pRect.top ) + 'px';
}

// Ограничиваем позицию границами экрана
function _clamp(wrapper, left, top) {
    var ew = wrapper.offsetWidth  || wrapper.getBoundingClientRect().width;
    var eh = wrapper.offsetHeight || wrapper.getBoundingClientRect().height;
    return {
        left: Math.max(0, Math.min(left, window.innerWidth  - ew)),
        top:  Math.max(0, Math.min(top,  window.innerHeight - eh))
    };
}

// Применяем сохранённую позицию к wrapper (один раз на жизнь элемента,
// пока тот не будет пересоздан — тогда атрибут data-cif-pos сбросится)
function _applyPos(wrapper, posKey) {
    var pos  = _savedPos[posKey];
    if (!pos) return;
    var mark = 'cif-' + posKey;
    if (wrapper.getAttribute('data-cif-pos') === mark) return;
    if (!wrapper.offsetWidth && !wrapper.offsetHeight) return; // ещё не в DOM

    _ensureAbsolute(wrapper);
    var c = _clamp(wrapper, parseFloat(pos.left) || 0, parseFloat(pos.top) || 0);
    wrapper.style.left = c.left + 'px';
    wrapper.style.top  = c.top  + 'px';
    wrapper.setAttribute('data-cif-pos', mark);
}

// Поллинг: 200 мс — восстанавливаем позицию при повторном открытии интерфейса
setInterval(function () {
    for (var i = 0; i < IFACES.length; i++) {
        var cfg  = IFACES[i];
        var root = document.querySelector(cfg.rootSel);
        if (!root) continue;
        var wrapper = root.querySelector('.modal-container-wrapper');
        if (!wrapper || !wrapper.isConnected) continue;
        if (String(wrapper.className || '').indexOf('leave-active') !== -1) continue;
        _applyPos(wrapper, cfg.posKey);
    }
}, 200);

// ── Мышь (PC / Radmir) ─────────────────────────────────────────────────────

function _onMouseDown(e) {
    if (_isMobile()) return;
    if (e.button !== 0) return;
    var found = _resolve(e.target);
    if (!found) return;

    _ensureAbsolute(found.wrapper);
    _drag = {
        wrapper: found.wrapper,
        posKey:  found.cfg.posKey,
        sx: e.clientX,
        sy: e.clientY,
        sl: parseFloat(found.wrapper.style.left) || 0,
        st: parseFloat(found.wrapper.style.top)  || 0
    };
    document.body.style.userSelect = 'none';
    e.preventDefault();
    e.stopPropagation();
}

function _onMouseMove(e) {
    if (_isMobile()) return;
    if (!_drag) return;
    var c = _clamp(
        _drag.wrapper,
        _drag.sl + (e.clientX - _drag.sx),
        _drag.st + (e.clientY - _drag.sy)
    );
    _drag.wrapper.style.left = c.left + 'px';
    _drag.wrapper.style.top  = c.top  + 'px';
    e.preventDefault();
}

function _onMouseUp() {
    if (_isMobile()) return;
    if (!_drag) return;
    _savedPos[_drag.posKey] = {
        left: _drag.wrapper.style.left,
        top:  _drag.wrapper.style.top
    };
    _drag.wrapper.setAttribute('data-cif-pos', 'cif-' + _drag.posKey);
    _drag = null;
    document.body.style.userSelect = '';
}

// ── Тач (Hassle / мобилка) ─────────────────────────────────────────────────

function _onTouchStart(e) {
    if (!_isMobile()) return;
    _touchMoved = false;
    var touch = e.touches[0];
    if (!touch) return;
    var found = _resolve(touch.target);
    if (!found) return;

    _ensureAbsolute(found.wrapper);
    _drag = {
        wrapper: found.wrapper,
        posKey:  found.cfg.posKey,
        sx: touch.clientX,
        sy: touch.clientY,
        sl: parseFloat(found.wrapper.style.left) || 0,
        st: parseFloat(found.wrapper.style.top)  || 0
    };
    document.body.style.userSelect = 'none';
    e.preventDefault();
    e.stopPropagation();
}

function _onTouchMove(e) {
    if (!_isMobile()) return;
    _touchMoved = true;
    if (!_drag) return;
    var touch = e.touches[0];
    if (!touch) return;
    var c = _clamp(
        _drag.wrapper,
        _drag.sl + (touch.clientX - _drag.sx),
        _drag.st + (touch.clientY - _drag.sy)
    );
    _drag.wrapper.style.left = c.left + 'px';
    _drag.wrapper.style.top  = c.top  + 'px';
    e.preventDefault();
}

function _onTouchEnd() {
    if (!_isMobile()) return;
    if (!_drag) return;
    _savedPos[_drag.posKey] = {
        left: _drag.wrapper.style.left,
        top:  _drag.wrapper.style.top
    };
    _drag.wrapper.setAttribute('data-cif-pos', 'cif-' + _drag.posKey);
    _drag = null;
    document.body.style.userSelect = '';
}

// ── Регистрация событий (delegation на document, capture-фаза) ─────────────
// Capture — чтобы перехватить раньше vue-обработчиков внутри карточки.
// touchstart/move — passive:false обязателен для preventDefault().

document.addEventListener('mousedown', _onMouseDown, true);
document.addEventListener('mousemove', _onMouseMove, true);
document.addEventListener('mouseup',   _onMouseUp,   true);

document.addEventListener('touchstart', _onTouchStart, { capture: true, passive: false });
document.addEventListener('touchmove',  _onTouchMove,  { capture: true, passive: false });
document.addEventListener('touchend',   _onTouchEnd,   { capture: true, passive: true  });

// Утилита для сброса позиций через консоль браузера
window._pravoResetCustomIfacePos = function () {
    _savedPos = {};
    console.log('[PRAVO] Позиции ZKM/SideMenu сброшены');
};

console.log('[PRAVO] ZKM/SideMenu drag v1 готов  (PC=mouse / Hassle=touch)');

})();
// ==================== END ZKM / SIDEMENU: DRAG ====================

// ============================================================
//  TimerK — таймер подачи такси
//  Регистрация: IntLoad.js (name: "TimerK").
//  Логика обводки радара живёт в TimerK.js (_setRadarBorder).
// ============================================================

/* openTimerK(секунды, текст, вариант)
   вариант 1 = жёлтый (activity), 0 = danger (красный) */
window.openTimerK = (e = 254, t = "Время подачи", o = 1) => {
    if (window.getInterfaceStatus("TimerK")) {
        const n = window.interface("TimerK");
        n && n.start(e, t, o);
    } else {
        window.openInterface("TimerK", JSON.stringify([e, t, o]));
    }
};

window.hideTimerK = () => {
    window.closeInterface("TimerK");
};

/* ── /tt — перехват на уровне engine.trigger ──────────────────────────────
   /tt              — 254 с, "Время подачи", вариант 1
   /tt <сек>        — свои секунды
   /tt <сек> <текст> [0|1] — секунды + текст + вариант
   /tt stop / off   — скрыть таймер                                       */
(() => {
    const eng = window.engine;
    if (!eng || !eng.trigger) return;

    const _orig = eng.trigger.bind(eng);
    eng.trigger = function(name) {
        if (name === 'SendChatInput') {
            const msg = ((arguments[1]) || '').trim();
            if (/^\/tt(\s|$)/i.test(msg)) {
                const args = msg.slice(3).trim().split(/\s+/).filter(Boolean);
                if (args.length && /^(stop|off|hide)$/i.test(args[0])) {
                    window.hideTimerK && window.hideTimerK();
                } else if (!args.length) {
                    window.openTimerK && window.openTimerK();
                } else {
                    const dur  = parseInt(args[0]) > 0 ? parseInt(args[0]) : 254;
                    const rest = args.slice(1);
                    const lastIsVar = rest.length && /^[012]$/.test(rest[rest.length - 1]);
                    const v    = lastIsVar ? +rest.pop() : 1;
                    const text = rest.join(' ') || 'Время подачи';
                    window.openTimerK && window.openTimerK(dur, text, v);
                }
                return;
            }
        }
        return _orig.apply(eng, arguments);
    };
})();
// ==================== END TimerK ====================
}); // конец callback _nickCheck
