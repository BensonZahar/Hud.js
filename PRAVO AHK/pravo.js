// ⚠️ ЧТО ЭТО ЗА ФАЙЛ pravo.js — ПОМОЩНИК ДЛЯ ТЕСТИРОВАНИЯ ПРАВО И ФУНКЦИЙ ДЛЯ РАЗРАБОТЧИКОВ ИГРЫ.

// ПРОВЕРКА НИКА Добавляй/убирай ники здесь.
const NICK_CHECK_ENABLED = true; // ← поменяй на true чтобы включить проверку

const _ALLOWED_NICKS = [
    "Zahar_Damidov",
    "Denis_Galievskiy",
	"Fura_Morales",
    "Sergey_Gaben",
	"Steel_Soprano",
	"Kiramo_Vultures",
	"Nikita_Sahar"
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
console.log("[INIT] === ПРАВИТЕЛЬСТВО AHK v0.999 ЗАГРУЖЕН ===");
// ── ПОКАЗ "AHK by konstt" при первом загрузке ──────────────────────
(function showStartupGameText() {
    var attempts = 0;
    var timer = setInterval(function() {
        attempts++;
        try {
            var gt = window.interface && window.interface('GameText');
            if (gt && typeof gt.add === 'function') {
                clearInterval(timer);
                gt.add('[3, "АНК <span style=\\"color:#CCFF00\\">ПРАВИТЕЛЬСТВО</span>&nbsp;by konstt", 5000, 0, 0, false, false, 2.0]');
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
        // FIX: сохраняем полный список — нужен для getPlayerInfoFromList (device, nick, level)
        window._mvdPlayerList = e;
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
// Скины ПРАВИТЕЛЬСТВО: 57♂ 141♀ 147♂ 164♀ 165♂ 187♂ 208♂ 227♂ 16360♀
const pravoSkins = [57, 141, 147, 164, 165, 187, 208, 227, 16360];

// Хелпер для проверки правительственного скина — используется и в LoadPravo.js
window._isPravoSkin = function() { return pravoSkins.includes(skinId); };

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
// ── Общий обработчик смены скина (вызывается как watcher-ом, так и при старте) ──
function _onSkinChange(numericSkin) {
    skinId = numericSkin;
    window._pravoSkinId = skinId;

    if (pravoSkins.includes(skinId)) {
        console.log(`[SKIN] ✅ Скин ${skinId} — правительственный, открываем Interactions`);
    } else {
        console.log(`[SKIN] ❌ Скин ${skinId} — не правительственный, закрываем Interactions`);
    }

    // Небольшая задержка чтобы store и DOM успели обновиться
    setTimeout(function() {
        if (typeof _pravoUpdateHassleInteraction === 'function') {
            _pravoUpdateHassleInteraction(
                typeof giveLicenseTo !== 'undefined' ? (giveLicenseTo || -1) : -1
            );
        }
    }, 150);
}

// 5. ЗАПУСК после загрузки — реактивный Vuex watcher вместо поллинга каждые 5с.
// index.js: window.setPlayerSkinId = e => W.commit("player/setSkin", e)
// Каждый раз когда сервер меняет скин — store.state.player.skinId обновляется,
// watcher срабатывает мгновенно (в том же тике Vue), без любых задержек.
setTimeout(() => {
    console.log('[SKIN] 🚀 Запуск отслеживания скина МВД...');
    const initialSkin = getSkinIdFromStore();
    if (initialSkin !== null) {
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

    // Vuex store.watch — мгновенная реакция на смену скина без поллинга
    (function _startSkinWatcher() {
        var store = window.App && window.App.$store;
        if (!store || !store.state || !store.state.player) {
            // store ещё не готов — повторим через 200ms
            setTimeout(_startSkinWatcher, 200);
            return;
        }
        store.watch(
            function(state) { return state.player.skinId; },
            function(newVal) {
                var numericSkin = Number(newVal);
                if (numericSkin !== skinId) {
                    _onSkinChange(numericSkin);
                }
            }
        );
        console.log('[SKIN] 👁️ Реактивный watcher установлен — смена скина определяется мгновенно');
    })();
}, 500);
let autoGrabEnabled = true;
let autoGrabName = `Авто-снаряжение | {00FF00}Вкл`;

// ── Авто-снаряжение: разрешённые звания (Охранник[2] и Нач. Охраны[3]) ──
// Проверяет window._pravoRank — данные приходят из MainMenu (профиль персонажа).
// Возвращает true только для этих двух рангов, для всех остальных — false.
function _isGrabAllowedRank() {
    var r = (window._pravoRank || '').trim();
    // Поддерживаем оба формата: «Охранник» и «Охранник [2]» / «Охранник[2]»
    return /Охранник/i.test(r) || /Нач[\.\s]*\s*Охран/i.test(r);
}
// Проверяет, является ли текущее звание «Лицензёр» — открывает доступ к /givelic меню.
// Учитываем оба написания: Лицензёр / Лицензер (е/ё).
function _isLicensorRank() {
    var r = (window._pravoRank || '').trim();
    return /Лицензёр/i.test(r) || /Лицензер/i.test(r);
}
const povsednevOptions = [
    { name: "1. Приветствие", action: "greeting", needsId: true },
    { name: "2. Проверка документов", action: "checkDocuments" },
];
// ── РЕЕСТР ПУНКТОВ ГЛАВНОГО МЕНЮ ДЛЯ БИНДОВ (читается установщиком) ──────────────
// Пункты диалога «ПРАВИТЕЛЬСТВО» (showMvdSubMenu). Пункты «Повседневной» берутся из
// povsednevOptions, типы лицензий — из _GIVE_LIC_TYPES; здесь их дублировать не нужно.
// Добавили пункт в showMvdSubMenu — добавьте его сюда и в _pravoRunMenuBind,
// и он появится во вкладке «Бинды» установщика.
const mainMenuOptions = [
    { name: "Повседневная (открыть меню)",  action: "povsednev" },
    { name: "Выдача лицензии",              action: "givelic" },
    { name: "Круговое меню (вкл/выкл)",     action: "circle_lic" },
    { name: "Просьба о чае (вкл/выкл)",     action: "tea_ask" },
    { name: "Авто-перевыдача лицензии",     action: "auto_reissue_lic" },
    { name: "Авто-снаряжение (вкл/выкл)",   action: "autograb" },
];
// Запуск бинда пункта, которого нет в «Повседневной»: пункты главного меню и «lic_<тип>»
// (быстрая выдача конкретной лицензии: бинд → ввод ID → /givelic без выбора типа).
// Условия доступности те же, что у пунктов в showMvdSubMenu.
function _pravoRunMenuBind(action) {
    var _label = action;
    var _lic = /^lic_(\d+)$/.exec(action);
    var _licIdx = -1;
    if (_lic) {
        for (var _i = 0; _i < _GIVE_LIC_TYPES.length; _i++) {
            if (_GIVE_LIC_TYPES[_i].type === Number(_lic[1])) { _licIdx = _i; break; }
        }
        if (_licIdx < 0) return;
        _label = 'Выдача: ' + _GIVE_LIC_TYPES[_licIdx].name;
    } else {
        var _m = mainMenuOptions.find(function(o) { return o.action === action; });
        if (!_m) return;
        _label = _m.name;
    }
    var _deny = function() {
        console.log('[AHK-BIND] "' + action + '" сейчас недоступен');
        try { gtAdd('~y~АХК~n~~w~Пункт «' + _label + '» сейчас недоступен', 2500, 3); } catch (e) {}
    };
    var _run = function() {
        var _quickGive = _isLicensorRank() && window._pravoQuickGiveOn();
        if (_licIdx >= 0) {
            if (!_quickGive) return _deny();
            window._pravoPendingLic = { idx: _licIdx, ts: Date.now() };
            window.showGiveLicIdInputDialog();
            return;
        }
        switch (action) {
            case "povsednev":
                lastMenuType = "povsednev";
                currentPage = 0;
                showPovsednevMenuPage(giveLicenseTo === -1 ? undefined : giveLicenseTo);
                break;
            case "givelic":
                if (!_quickGive) return _deny();
                window._pravoPendingLic = null;
                window.showGiveLicIdInputDialog();
                break;
            case "circle_lic":
                if (!(window._pravoCircleAllowed() && window._pravoQuickGiveOn())) return _deny();
                toggleCircleLic();
                break;
            case "tea_ask":
                if (!window._pravoCircleAllowed()) return _deny();
                toggleTeaAsk();
                break;
            case "auto_reissue_lic":
                if (!((AUTO_REISSUE_LIC || window.AUTO_REISSUE_LIC === true) && _isLicensorRank())) return _deny();
                if (_lastGiveLicData) {
                    _pravoReissueLic({});
                } else {
                    gtAdd('~r~Авто-перевыдача~n~~w~Нет данных — сначала выдайте лицензию через меню', 3500, 3);
                }
                break;
            case "autograb":
                if (!(window.AUTO_GRAB === true && _isGrabAllowedRank())) return _deny();
                toggleAutoGrab();
                break;
        }
    };
    // Звание нужно для проверок выше — если профиль ещё не загружен, грузим и повторяем
    if (!window._pravoRank && typeof window._pravoLoadPlayerProfile === 'function') {
        window._pravoLoadPlayerProfile(_run);
    } else {
        _run();
    }
}
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
let _giveLicTargetId = -1; // ID игрока для быстрой выдачи лицензии (/givelic)
let targetId = null;
let currentMenu = null;
let currentSubMenu = null;
let currentAction = null;

// ── Авто-перевыдача лицензии (/givelic → /cancel → повтор) ──────────────
// Включается через LoadPravo.js (патч) и переключатель в установщике.
// Используем var, чтобы LoadPravo мог патчить текст до eval.
var AUTO_REISSUE_LIC = false;
// Прокидываем наружу чтобы showMvdSubMenu видел значение
window.AUTO_REISSUE_LIC = AUTO_REISSUE_LIC;

// ── Hassle-режим: постоянный Interaction вместо хоткея ───────────────────────
// Если цель использует мобильный клиент (Hassle), вместо нажатия клавиш
// AUTO_REISSUE_LIC / GIVELIC_KEY показывается постоянный Interaction на экране.
var _PRAVO_INT_REISSUE  = 9901;  // тип: авто-перевыдача лицензии
var _PRAVO_INT_GIVELIC  = 9902;  // тип: быстрая выдача лицензии
var _pravoHassleIntOpen = false;  // флаг: именно мы открыли Interactions
var _pravoLastServerItems = [];   // FIX: кэш серверных пунктов — сохраняем, чтобы восстановить после наших диалогов
var _pravoSkipIntReopen  = false; // FIX: true пока диалог открыт кнопкой 9900 — блокирует повторное появление Interactions в showMvdSubMenu

// ── Hassle Interaction hook: обработка перенесена в sendClientEventCustom ──────
// Хранит данные последней успешно отправленной команды /givelic
let _lastGiveLicData = null; // { targetId, type, price, name }

// ══════════════════════════════════════════════════════════════════════════
// АНТИФЛУД-ПЛАНИРОВЩИК — зеркало серверного антифлуда мода (CheckPlayerFlood)
//   Сервер на КАЖДУЮ команду/сообщение (даже заблокированную): rate += 1000,
//   затем rate -= (мс с прошлой проверки), не ниже 0.
//   rate >= 3000 → «Не флудите», команда НЕ выполняется (счётчик всё равно растёт);
//   rate >= 6000 → кик «Flood».
// Перевыдача = /cancel + /givelic = 2 команды = +2000. Поэтому:
//   • из «тишины» перевыдача уходит МГНОВЕННО;
//   • если лимит исчерпан — команды НЕ отправляются (не раздуваем счётчик),
//     а одна отложенная перевыдача уходит в первый же допустимый момент.
// ══════════════════════════════════════════════════════════════════════════
var PRAVO_FLOOD_MAX    = 3000; // MAX_FLOOD_RATE на сервере
var PRAVO_FLOOD_INC    = 1000; // FLOOD_RATE_INC на сервере (цена одной команды)
var PRAVO_FLOOD_MARGIN = 200;  // запас (мс) на разброс пинга; 0 = впритык
var _pravoFlood = { rate: 0, last: Date.now() };
var _pravoReissueTimer = null;

function _pravoFloodDecay() {
    var now = Date.now();
    _pravoFlood.rate = Math.max(0, _pravoFlood.rate - (now - _pravoFlood.last));
    _pravoFlood.last = now;
}
// Учесть n отправленных серверу команд/сообщений
function _pravoFloodNote(n) {
    _pravoFloodDecay();
    _pravoFlood.rate += (n || 1) * PRAVO_FLOOD_INC;
}
// Сколько мс надо подождать, чтобы n команд подряд прошли без «Не флудите» (0 = можно сейчас)
function _pravoFloodWait(n) {
    _pravoFloodDecay();
    var over = _pravoFlood.rate + n * PRAVO_FLOOD_INC - (PRAVO_FLOOD_MAX - PRAVO_FLOOD_MARGIN);
    return over > 0 ? Math.ceil(over) : 0;
}
// Сервер сам сказал «Не флудите» — подтягиваем нашу модель к реальности
function _pravoFloodServerSaid(hard) {
    _pravoFloodDecay();
    _pravoFlood.rate = Math.max(_pravoFlood.rate, PRAVO_FLOOD_MAX + (hard ? 500 : 0));
}
// Отправка команды серверу (обёртка sendChatInput ниже сама считает в счётчик)
function _pravoSendCmd(text) {
    if (typeof __mvdPrevSendChatInput === "function") {
        __mvdPrevSendChatInput(text);
    } else {
        _pravoFloodNote(1);
        engine.trigger("SendChatInput", text);
    }
}
// Реальная отправка перевыдачи: /cancel + повтор /givelic (без задержки между ними)
function _pravoReissueSend(opts) {
    opts = opts || {};
    var d = _lastGiveLicData;
    if (!d) return;
    var cmd = '/givelic ' + d.targetId + ' ' + d.type + ' ' + d.price;
    _pravoSendCmd('/cancel');
    _pravoSendCmd(cmd);
    console.log('[REISSUE] /cancel + повтор отправлены: ' + cmd);
    gtAdd(`~g~Авто-перевыдача~n~~w~${d.name} → ID: ${d.targetId} | ${d.price.toLocaleString('ru-RU')} ₽`, 3000, 3);
    // Hassle: переоткрываем Interaction (пауза 550 мс — даём нотификации появиться)
    if (opts.hassle) {
        setTimeout(function() { _pravoUpdateHassleInteraction(d.targetId); }, 550);
    }
}
// Точка входа для ВСЕХ способов перевыдачи (хоткей, мышь/колесо, меню, Hassle-кнопка)
function _pravoReissueLic(opts) {
    if (!_lastGiveLicData) return false;
    if (_pravoReissueTimer) return true;          // уже стоит в очереди — повторные нажатия не плодим
    var wait = _pravoFloodWait(2);
    if (wait <= 0) { _pravoReissueSend(opts); return true; }   // МГНОВЕННО
    gtAdd('~y~Антифлуд~n~~w~Перевыдача через ' + (wait / 1000).toFixed(1) + ' с', Math.min(wait + 300, 2500), 3);
    var _tick = function() {
        _pravoReissueTimer = null;
        var w = _pravoFloodWait(2);                 // пере-проверяем: за время ожидания могли уйти другие сообщения
        if (w > 0) { _pravoReissueTimer = setTimeout(_tick, w + 5); return; }
        _pravoReissueSend(opts);
    };
    _pravoReissueTimer = setTimeout(_tick, wait + 5);
    return true;
}
// ── END АНТИФЛУД-ПЛАНИРОВЩИК ────────────────────────────────────────────────

// Хоткей открытия меню МВД — настраивается установщиком через MENU_KEY (по умолчанию Alt+0)
var MENU_KEY = "Alt+0";
// Хоткей авто-перевыдачи лицензии — настраивается установщиком (по умолчанию Alt+R)
var REISSUE_KEY = "Alt+R";
// Хоткей прямого открытия диалога /givelic — настраивается установщиком (пусто = отключено)
var GIVELIC_KEY = "";
// Флаг "Помощник лицензёра" — патчится установщиком через LoadPravo.js (false = выключено)
var LICENSOR_HELPER_ENABLED = false;
// Прокидываем наружу чтобы LoadPravo.js мог получить актуальное значение
window.LICENSOR_HELPER_ENABLED = LICENSOR_HELPER_ENABLED;
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
// ── Универсальный матчер хоткеев (по физической клавише e.code, не зависит от раскладки) ──
var _HK_ALIAS = {up:'arrowup',down:'arrowdown',left:'arrowleft',right:'arrowright',esc:'escape'};
var _HK_PUNCT = {'-':'minus','=':'equal','[':'bracketleft',']':'bracketright',';':'semicolon',"'":'quote',',':'comma','.':'period','/':'slash','\\':'backslash','`':'backquote'};
var _HK_BTN = {0:'mouseleft',1:'mousemiddle',2:'mouseright',3:'mouseback',4:'mouseforward'};
var _hkCache = {};
function _hkParse(combo) {
    if (!combo) return null;
    if (_hkCache[combo]) return _hkCache[combo];
    var s = String(combo).trim(), parts = s.toLowerCase().split('+').map(function(x){ return x.trim(); }), main = '';
    if (s.charAt(s.length - 1) === '+') { main = '+'; parts = parts.filter(Boolean); }
    var h = { alt: parts.indexOf('alt') !== -1, ctrl: parts.indexOf('ctrl') !== -1, shift: parts.indexOf('shift') !== -1, main: main };
    if (!h.main) { for (var i = 0; i < parts.length; i++) { if (parts[i] !== 'alt' && parts[i] !== 'ctrl' && parts[i] !== 'shift') { h.main = parts[i]; break; } } }
    return (_hkCache[combo] = h);
}
function _hkMainMatch(e, m) {
    var t = e.type;
    if (t === 'wheel') return m === (e.deltaY < 0 ? 'wheelup' : 'wheeldown');
    if (t === 'mousedown' || t === 'mouseup') return m === _HK_BTN[e.button];
    var code = String(e.code || '').toLowerCase(), key = String(e.key || '').toLowerCase();
    if (!code || code === 'unidentified') return key === m || key === (_HK_ALIAS[m] || m);
    if (/^[a-z]$/.test(m))  return code === 'key' + m;
    if (/^[0-9]$/.test(m))  return code === 'digit' + m;
    if (m === 'enter')      return code === 'enter' || code === 'numpadenter';
    if (_HK_ALIAS[m])       return code === _HK_ALIAS[m];
    if (_HK_PUNCT[m])       return code === _HK_PUNCT[m];
    return code === m || key === m;   // F1-F24, Numpad*, Space, Tab, Home, Minus, Comma ... (+ старые сохранённые значения)
}
function _hkMatch(e, combo) {
    var h = _hkParse(combo);
    if (!h || !h.main) return false;
    if (h.alt !== !!e.altKey || h.ctrl !== !!e.ctrlKey || h.shift !== !!e.shiftKey) return false;
    var _ok = _hkMainMatch(e, h.main);
    if (_ok && e.type === 'keydown' && window.__hkGuard) window.__hkGuard.arm(e);   // HK-GUARD: символ клавиши не должен попасть в диалог
    return _ok;
}
// Печатаем в чате/поле ввода — «голые» клавиши не должны срабатывать как бинд
function _hkTyping(e) {
    var t = e.target; if (!t || !t.tagName) return false;
    var editable = t.isContentEditable || t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT';
    return editable && !e.altKey && !e.ctrlKey;
}
// ── HK-GUARD: хоткей открывает диалог, но символ самой клавиши НЕ попадает в поле ввода ──
// Причина утечки: диалог (addDialogInQueue) открывается прямо внутри keydown и сразу получает фокус,
// поэтому keypress / beforeinput / автоповтор / «запоздавший» символ той же клавиши падает в новое поле.
// Решение: при совпадении хоткея (_hkMatch → __hkGuard.arm) физическая клавиша (e.code) помечается «занятой»
// на время удержания (+ короткий хвост после отпускания), и любой ввод её символа в поля глушится.
(function() {
    if (window.__hkGuard) return;
    var GRACE = 300, MAX_HOLD = 5000;          // хвост после keyup, мс / страховка от залипания
    var armed = {};                            // e.code -> { ev, key, lat, t, up }
    var snap = (typeof WeakMap === 'function') ? new WeakMap() : null;   // поле -> последнее «законное» значение
    function now() { return Date.now(); }
    function isText(t) {
        if (!t || !t.tagName) return false;
        if (t.isContentEditable || t.tagName === 'TEXTAREA') return true;
        if (t.tagName !== 'INPUT') return false;
        var ty = String(t.type || 'text').toLowerCase();
        return ty === 'text' || ty === 'password' || ty === 'search' || ty === 'number' || ty === 'tel' || ty === 'email' || ty === 'url';
    }
    function codeChar(code) {                  // латинский символ физической клавиши: Digit7→7, KeyG→g
        var m = /^(?:Digit|Numpad)([0-9])$/.exec(code) || /^Key([A-Z])$/.exec(code);
        return m ? m[1].toLowerCase() : '';
    }
    function live(code) {
        var a = armed[code]; if (!a) return null;
        var n = now();
        if ((a.up && n - a.up > GRACE) || n - a.t > MAX_HOLD) { delete armed[code]; return null; }
        return a;
    }
    function hit(ch) {                         // есть ли активная клавиша, чей символ == ch
        ch = String(ch || '').toLowerCase(); if (!ch) return null;
        for (var c in armed) {
            var a = live(c); if (!a) continue;
            if (ch === a.key || ch === a.lat) return a;
        }
        return null;
    }
    function hasArmed() { for (var c in armed) if (live(c)) return true; return false; }
    function kill(e) { e.preventDefault(); e.stopImmediatePropagation(); }
    function arm(e) {
        if (!e || e.type !== 'keydown' || !e.code || e.code === 'Unidentified') return;
        var k = (typeof e.key === 'string' && e.key.length === 1) ? e.key.toLowerCase() : '';
        armed[e.code] = { ev: e, key: k, lat: codeChar(e.code), t: now(), up: 0 };
    }

    // автоповтор удерживаемой клавиши (в т.ч. если Alt уже отпущен) — в поле не пускаем
    window.addEventListener('keydown', function(e) {
        var a = armed[e.code] && live(e.code);
        if (!a || e === a.ev) return;
        if (!e.repeat) { delete armed[e.code]; return; }   // это новое нажатие (keyup потерялся) — не блокируем
        if (!isText(e.target)) return;
        a.t = now(); kill(e);
    }, true);
    window.addEventListener('keyup', function(e) {
        var a = armed[e.code]; if (!a) return;
        a.up = now();
        setTimeout(function() { if (armed[e.code] === a) delete armed[e.code]; }, GRACE + 20);
    }, true);
    window.addEventListener('keypress', function(e) {
        if (!isText(e.target)) return;
        var ch = (typeof e.key === 'string' && e.key.length === 1) ? e.key : (e.charCode ? String.fromCharCode(e.charCode) : '');
        if (hit(ch)) kill(e);
    }, true);
    window.addEventListener('beforeinput', function(e) {
        if (!isText(e.target) || e.inputType !== 'insertText' || !e.data || e.data.length !== 1) return;
        if (hit(e.data)) kill(e);
    }, true);

    // запасной путь: символ всё-таки попал в value (движок/CEF вставил мимо keydown) — откатываем к снимку
    window.addEventListener('focusin', function(e) {
        var el = e.target; if (snap && el && typeof el.value === 'string') snap.set(el, el.value);
    }, true);
    window.addEventListener('input', function(e) {
        var el = e.target; if (!snap || !el || typeof el.value !== 'string') return;
        var cur = el.value, prev = snap.has(el) ? snap.get(el) : '';   // снимка нет → считаем, что поле было пустым
        if (cur !== prev && hasArmed()) {
            var max = Math.min(prev.length, cur.length), pre = 0, suf = 0;
            while (pre < max && prev.charAt(pre) === cur.charAt(pre)) pre++;
            while (suf < max - pre && prev.charAt(prev.length - 1 - suf) === cur.charAt(cur.length - 1 - suf)) suf++;
            var added = cur.slice(pre, cur.length - suf), removed = prev.slice(pre, prev.length - suf);
            if (!removed && added.length === 1 && hit(added)) {
                el.value = prev;
                try { el.setSelectionRange(pre, pre); } catch (_e) {}
                e.stopImmediatePropagation();   // Vue-обработчик поля не увидит символ
                return;
            }
        }
        snap.set(el, cur);
    }, true);
    window.addEventListener('blur', function() { armed = {}; });   // окно потеряло фокус — keyup может не прийти

    window.__hkGuard = { arm: arm, active: hasArmed };
})();
function _matchesCombo(e, combo) { return _hkMatch(e, combo); }

// Диспетчер прямых биндингов пунктов меню «Повседневная»: клавиатура, колесо, боковые/средняя кнопки мыши
function _menuBindsDispatch(e) {
    if (!pravoSkins.includes(skinId)) return; // все хоткеи работают только при правительственном скине
    if (e.type === 'keydown' && (e.repeat || _hkTyping(e))) return;
    if (MENU_BINDS && typeof MENU_BINDS === 'object') {
        for (var _action in MENU_BINDS) {
            if (!_matchesCombo(e, MENU_BINDS[_action])) continue;
            e.preventDefault && e.preventDefault();
            var _opt = povsednevOptions.find(function(o){ return o.action === _action; });
            if (!_opt) { _pravoRunMenuBind(_action); break; }
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
}
window.addEventListener('keydown', function(e) { _menuBindsDispatch(e); }, true);

// Мышь/колесо для MENU_BINDS (раньше бинды ловили только клавиатуру)
(function() {
    var wheel = false, btn = false;
    for (var a in MENU_BINDS) {
        var h = _hkParse(MENU_BINDS[a]); if (!h) continue;
        if (h.main === 'wheelup' || h.main === 'wheeldown') wheel = true;
        else if (h.main === 'mousemiddle' || h.main === 'mouseback' || h.main === 'mouseforward') btn = true;
    }
    if (wheel) window.addEventListener('wheel', function(e) { _menuBindsDispatch(e); }, { passive: false, capture: true });
    if (btn) {
        var downAt = {}, CLICK_MAX_MS = 400; // удержание дольше = камера GTA, не бинд
        window.addEventListener('mousedown', function(e) { downAt[e.button] = Date.now(); }, true);
        window.addEventListener('mouseup', function(e) {
            var t0 = downAt[e.button]; downAt[e.button] = 0;
            if (t0 && Date.now() - t0 <= CLICK_MAX_MS) _menuBindsDispatch(e);
        }, true);
    }
})();

// Обработчик горячих клавиш
window.addEventListener('keydown', function(e) {
    // Все хоткеи работают только при правительственном скине
    if (!pravoSkins.includes(skinId)) return;
    if (MENU_KEY && !e.repeat && !_hkTyping(e) && _hkMatch(e, MENU_KEY)) {
        sendChatInput('/dahk');
    }
    // Прямые биндинги пунктов меню — теперь обрабатываются в _menuBindsDispatch (capture, клавиатура + мышь)

    // Хоткей авто-перевыдачи лицензии (REISSUE_KEY) — только если AUTO_REISSUE_LIC включён
    if (REISSUE_KEY && (AUTO_REISSUE_LIC || window.AUTO_REISSUE_LIC === true)) {
        if (!e.repeat && !_hkTyping(e) && _hkMatch(e, REISSUE_KEY)) {
            e.preventDefault && e.preventDefault();
            // Тот же путь, что у мыши/колеса: если данных ещё нет — покажет подсказку, а не промолчит
            window._pravoDoReissue && window._pravoDoReissue();
        }
    }
    // Хоткей прямого открытия диалога выдачи лицензии (GIVELIC_KEY)
    if (GIVELIC_KEY && _isLicensorRank()) {
        if (!e.repeat && !_hkTyping(e) && _hkMatch(e, GIVELIC_KEY)) {
            e.preventDefault && e.preventDefault();
            window.showGiveLicIdInputDialog && window.showGiveLicIdInputDialog();
        }
    }
    // Хоткей свапа тазер ↔ дигл теперь регистрируется в LoadAhk.js
    // на основе настройки SWAP_KEY из установщика.
    // Прямые хоткеи здесь убраны — не дублируем.
    // Мышь/колесо для REISSUE_KEY и GIVELIC_KEY — НЕ здесь: keydown мышь не ловит.
    // Обработчики живут в LoadPravo.js.

}, true); // HK-CAPTURE: хоткеи ловим в фазе перехвата — диалог/поле не может съесть событие через stopPropagation

window.addEventListener('keydown', function(e) {
    if (!pravoSkins.includes(skinId)) return;
    // ==================== ALT — ПОКАЗАТЬ/СКРЫТЬ КУРСОР ПРИ ОТКРЫТОЙ КОНСОЛИ ====================
    if (e.keyCode === window.KEY_CODE_ALT) {
        const consoleRef = window.App && window.App.$refs && window.App.$refs.console;
        if (consoleRef && consoleRef.isOpened) {
            window.cursorStatus = !window.cursorStatus;
            window.setCursorStatus('Console', window.cursorStatus);
        }
    }
});

// ── Экспорт авто-перевыдачи для LoadPravo.js (мышь/колесо) ──────────────────
// LoadPravo.js регистрирует mousedown/mouseup/wheel для REISSUE_KEY и вызывает
// window._pravoDoReissue() — точно так же как LoadFsin.js вызывает
// window._fsinSwapTaserDeagle(). keydown здесь мышь не ловит никогда.
window._pravoDoReissue = function() {
    if (!(AUTO_REISSUE_LIC || window.AUTO_REISSUE_LIC === true)) return;
    if (!_lastGiveLicData) {
        gtAdd('~r~Авто-перевыдача~n~~w~Нет данных — сначала выдайте лицензию через меню', 3500, 3);
        // FIX: возвращаем Interactions — панель была закрыта перед вызовом, нужно восстановить
        setTimeout(function() { _pravoUpdateHassleInteraction(giveLicenseTo || -1); }, 200);
        return;
    }
    _pravoReissueLic({ hassle: true }); // мгновенно, либо в первый допустимый момент (антифлуд)
};
// ── END Экспорт авто-перевыдачи ──────────────────────────────────────────────

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

// ── Hassle: показать/обновить постоянный Interaction вместо хоткея ───────────
// Вызывается при загрузке профиля, открытии подменю, после выдачи/перевыдачи.
// targetId == -1 допустим — кнопка «Выдать лицензию» не привязана к конкретному игроку.
// Если МЫ не на Hassle (или нет активных функций) — закрывает наш Interaction.
function _pravoUpdateHassleInteraction(targetId) {
    // FIX: проверяем устройство ОПЕРАТОРА скрипта, а не цели.
    // Interaction нужен нам самим — когда мы на мобилке и не можем жать клавиши.
    var _isLocalHassle = !!(window.App && window.App.isMobile);

    if (!_isLocalHassle) {
        if (_pravoHassleIntOpen) {
            _pravoHassleIntOpen = false; // FIX: флаг ДО close, иначе closeInterface-хук зациклится
            try { window.closeInterface('Interactions'); } catch(e) {}
            console.log('[PRAVO] 📱 Hassle Interaction закрыт (мы на ПК, хоткеи доступны)');
        }
        return;
    }

    // Если скин не правительственный — закрываем наш Interaction и выходим
    if (!pravoSkins.includes(skinId)) {
        // FIX: проверяем реальный статус через getInterfaceStatus, а не только флаг.
        // _pravoHassleIntOpen может быть false если сервер успел сбросить флаг
        // через closeInterface-хук до того как trackSkinId это зафиксировал —
        // но панель при этом могла быть снова открыта сервером уже без нашего флага.
        var _intReallyOpen = typeof window.getInterfaceStatus === 'function'
            && window.getInterfaceStatus('Interactions');
        if (_pravoHassleIntOpen || _intReallyOpen) {
            _pravoHassleIntOpen = false;
            try { window.closeInterface('Interactions'); } catch(e) {}
            console.log('[PRAVO] 🚫 Hassle Interaction закрыт (не правительственный скин)');
        }
        return;
    }

    var _items = [];

    // ── НОВОЕ: кнопка главного меню АНК — всегда для Hassle ──
    _items.push([9900, 'АНК Меню (ПРАВИТЕЛЬСТВО)']);

    // Авто-перевыдача — показываем только если есть сохранённая цель
    if ((AUTO_REISSUE_LIC || window.AUTO_REISSUE_LIC === true) && _lastGiveLicData) {
        var _rNickRaw = getNickByIdFromList(_lastGiveLicData.targetId);
        var _rDisplay = _rNickRaw
            ? _rNickRaw.split('_').join(' ')
            : _lastGiveLicData.name;
        var _reissueLabel = 'Перевыдать на ' + _lastGiveLicData.name + ': ' + _rDisplay;
        _items.push([_PRAVO_INT_REISSUE, _reissueLabel]);
    }

    // Быстрая выдача — показываем если помощник лицензёра включён И звание Лицензёр.
    // На ПК есть хоткей GIVELIC_KEY, на Hassle клавиш нет — кнопка обязательна.
    // LICENSOR_HELPER_ENABLED теперь корректно патчится при Hassle-вставке через insert_hassle_code.
    if (_isLicensorRank() && (LICENSOR_HELPER_ENABLED || window.LICENSOR_HELPER_ENABLED)) {
        _items.push([_PRAVO_INT_GIVELIC, 'Выдать лицензию']);
    }

    // _items теперь НИКОГДА не пустой на Hassle (есть минимум кнопка АНК Меню)

    try {
        var _mergedItems = _items.concat(_pravoLastServerItems);

        // ─────────────────────────────────────────────────────────────────────
        // FIX МЕРЦАНИЕ: openInterface делает early-return если интерфейс уже
        // открыт (index.js: `if(getInterfaceStatus(e)||blockInterfaces)return`).
        // Поэтому при открытой панели обновляем список НАПРЯМУЮ через setInfo
        // на экземпляре компонента — без закрытия и повторного открытия.
        // openInterface используем только при первом открытии панели.
        // ─────────────────────────────────────────────────────────────────────
        var _icInst = window.interface && window.interface('Interactions');
        var _alreadyOpen = _pravoHassleIntOpen
            && _icInst
            && typeof window.getInterfaceStatus === 'function'
            && window.getInterfaceStatus('Interactions');

        if (_alreadyOpen) {
            // Панель открыта — обновляем список без перезагрузки (нет мерцания)
            _icInst.setInfo(JSON.stringify(_mergedItems));
            console.log('[PRAVO] 🔄 Hassle Interaction обновлён (setInfo, без перезагрузки)'
                + ': ' + _items.map(function(i){ return i[1]; }).join(' / ')
                + (_pravoLastServerItems.length ? ' + ' + _pravoLastServerItems.length + ' серверных' : ''));
        } else {
            // Панель закрыта — открываем её впервые
            window.openInterface('Interactions', JSON.stringify(_mergedItems));
            _pravoHassleIntOpen = true;
            console.log('[PRAVO] 📱 Hassle Interaction открыт'
                + (targetId && targetId != -1 ? ' для ID ' + targetId : ' (старт/ранг)')
                + ': ' + _items.map(function(i){ return i[1]; }).join(' / ')
                + (_pravoLastServerItems.length ? ' + ' + _pravoLastServerItems.length + ' серверных' : ''));
        }
    } catch(e) {
        console.warn('[PRAVO] ⚠️ Ошибка обновления Interactions:', e);
    }
}
window._pravoUpdateHassleInteraction = _pravoUpdateHassleInteraction;
// ── END _pravoUpdateHassleInteraction ────────────────────────────────────────

// ══════════════════════════════════════════════════════════════════════════════
// ПАТЧ: Interactions — всегда показываем наши пункты вместе с серверными.
//
// Проблема: движок вызывает component.setInfo(serverItems) НАПРЯМУЮ уже
// после того как openInterface отработал с нашим merged-списком —
// в результате наши пункты перезатираются.
// Решение: хукаем setInfo на экземпляре компонента сразу после его открытия,
// а после closeInterface восстанавливаем наши пункты.
// ══════════════════════════════════════════════════════════════════════════════

// ── Вспомогательная функция: строит массив наших пунктов ──────────────────
function _pravoGetOwnItems() {
    // FIX: если скин не правительственный — ничего не добавляем
    if (!pravoSkins.includes(skinId)) return [];
    var items = [];
    items.push([9900, 'АНК Меню (ПРАВИТЕЛЬСТВО)']);
    // Авто-перевыдача — показываем только если есть сохранённая цель
    if ((AUTO_REISSUE_LIC || window.AUTO_REISSUE_LIC === true) && _lastGiveLicData) {
        var _rNickRaw = getNickByIdFromList(_lastGiveLicData.targetId);
        var _rDisplay = _rNickRaw
            ? _rNickRaw.split('_').join(' ')
            : _lastGiveLicData.name;
        var _reissueLabel = 'Перевыдать на ' + _lastGiveLicData.name + ': ' + _rDisplay;
        items.push([_PRAVO_INT_REISSUE, _reissueLabel]);
    }
    if (typeof _isLicensorRank === 'function' && _isLicensorRank()
        && (LICENSOR_HELPER_ENABLED || window.LICENSOR_HELPER_ENABLED)) {
        items.push([_PRAVO_INT_GIVELIC, 'Выдать лицензию']);
    }
    return items;
}

// ── Хук setInfo на экземпляре компонента ──────────────────────────────────
// Устанавливается каждый раз после открытия Interactions.
// Перехватывает любой вызов setInfo (от движка, от сервера) и
// добавляет наши пункты поверх серверных.
function _pravoHookInteractionsSetInfo() {
    try {
        var _ic = window.interface && window.interface('Interactions');
        if (!_ic || _ic.__pravoSetInfoHooked) return false;

        var _origSI = _ic.setInfo;
        _ic.setInfo = function(rawData) {
            // Парсим входящие данные
            var serverItems = [];
            try {
                var d = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
                for (var k in d) {
                    var item = d[k];
                    // Поддержка обоих форматов: [type,title] и {type,title}
                    var tp = Array.isArray(item) ? item[0] : (item && item.type);
                    // Фильтруем наши пункты чтобы не дублировать
                    if (tp !== 9900 && tp !== _PRAVO_INT_REISSUE && tp !== _PRAVO_INT_GIVELIC) {
                        serverItems.push(Array.isArray(item) ? item : [item.type, item.title]);
                    }
                }
            } catch(_e) {}

            // FIX: сохраняем серверные пункты для восстановления после наших диалогов
            if (serverItems.length > 0) {
                _pravoLastServerItems = serverItems;
            }

            var pravoItems = _pravoGetOwnItems();
            var combined  = pravoItems.concat(serverItems);
            console.log('[PRAVO] 🔀 setInfo merged: '
                + pravoItems.length + ' наших + ' + serverItems.length + ' серверных');
            _origSI.call(this, combined);
        };
        _ic.__pravoSetInfoHooked = true;
        console.log('[PRAVO] ✅ Interactions.setInfo hooked');
        return true;
    } catch(_e) { return false; }
}
window._pravoHookInteractionsSetInfo = _pravoHookInteractionsSetInfo;

// ── Хуки openInterface и closeInterface ───────────────────────────────────
(function _patchInteractionsHooks() {
    // -- openInterface: передаём уже слитый список + сразу хукаем setInfo ---
    var _oiOrig = window.openInterface;
    window.openInterface = function(name, params) {
        if (name === 'Interactions' && !!(window.App && window.App.isMobile)) {
            // Парсим серверные пункты, отбрасываем наши (чтобы не дублировать)
            var serverItems = [];
            try {
                var _p = typeof params === 'string' ? JSON.parse(params) : (params || []);
                for (var _k in _p) {
                    var _it = _p[_k];
                    var _tp = Array.isArray(_it) ? _it[0] : (_it && _it[0]);
                    if (_tp !== 9900 && _tp !== _PRAVO_INT_REISSUE && _tp !== _PRAVO_INT_GIVELIC) {
                        serverItems.push(_it);
                    }
                }
            } catch(_e) {}

            // FIX: сохраняем серверные пункты для восстановления после наших диалогов
            if (serverItems.length > 0) {
                _pravoLastServerItems = serverItems;
            }

            var pravoItems = _pravoGetOwnItems();
            // FIX: не правительственный скин — не внедряем наши пункты,
            // не ставим флаг, просто пропускаем в оригинальный openInterface
            if (pravoItems.length === 0) {
                return _oiOrig.apply(this, arguments);
            }

            var combined   = pravoItems.concat(serverItems);
            _pravoHassleIntOpen = true;

            // FIX: оригинальный openInterface делает early-return если интерфейс уже открыт
            // (`if(getInterfaceStatus(e)||blockInterfaces)return` — index.js).
            // В этом случае combined-список теряется и серверные пункты не отображаются.
            // Решение: если панель уже открыта — обновляем напрямую через setInfo.
            var _icNow = window.interface && window.interface('Interactions');
            var _isAlreadyOpen = _icNow
                && typeof window.getInterfaceStatus === 'function'
                && window.getInterfaceStatus('Interactions');

            if (_isAlreadyOpen) {
                // Ставим хук если ещё не установлен, затем обновляем список.
                // combined содержит наши + серверные пункты.
                // Если хук установлен — он отфильтрует наши дубли и добавит свежие.
                // Если нет — combined уже содержит всё нужное.
                _pravoHookInteractionsSetInfo();
                _icNow.setInfo(JSON.stringify(combined));
                console.log('[PRAVO] 🔀 openInterface (уже открыт, direct setInfo): '
                    + pravoItems.length + ' наших + ' + serverItems.length + ' серверных');
                return;
            }

            // Панель закрыта — открываем впервые с объединённым списком
            var _res = _oiOrig.call(this, name, JSON.stringify(combined));

            // Хукаем setInfo на компоненте — движок может вызвать его
            // напрямую уже после openInterface, перезатерев наш список
            setTimeout(_pravoHookInteractionsSetInfo, 50);

            console.log('[PRAVO] 🔀 openInterface merged: '
                + pravoItems.length + ' наших + ' + serverItems.length + ' серверных');
            return _res;
        }
        return _oiOrig.apply(this, arguments);
    };

    // -- closeInterface: сервер закрывает Interactions — НЕ закрываем панель,
    // просто убираем серверные пункты из списка.
    // Наш код ВСЕГДА делает _pravoHassleIntOpen = false ДО вызова closeInterface,
    // поэтому _shouldRestore = true только когда закрывает кто-то другой (сервер).
    var _ciOrig = window.closeInterface;
    window.closeInterface = function(name) {
        var _shouldRestore = (name === 'Interactions' && _pravoHassleIntOpen);
        if (_shouldRestore) {
            // Сервер пытается закрыть Interactions, но наши пункты должны остаться.
            // Не вызываем _ciOrig — панель остаётся открытой.
            // Просто убираем серверные пункты и обновляем список.
            _pravoLastServerItems = [];
            try {
                var _ic = window.interface && window.interface('Interactions');
                if (_ic && typeof _ic.setInfo === 'function') {
                    var _ownItems = _pravoGetOwnItems();
                    _ic.setInfo(JSON.stringify(_ownItems));
                    console.log('[PRAVO] 🔄 closeInterface Interactions перехвачен: убрали серверные, осталось ' + _ownItems.length + ' наших');
                }
            } catch(_e) {}
            return;
        }
        return _ciOrig.apply(this, arguments);
    };

    console.log('[PRAVO] ✅ Interactions hooks (open + close + setInfo) установлены');
})();

// ══════════════════════════════════════════════════════════════════════════════
// «Круговое меню» (window.PRAVO_CIRCLE_LIC, переключатель в диалоге «ПРАВИТЕЛЬСТВО»).
// Если ВКЛ и сервер открывает PlayerInteraction для ИГРОКА — сам компонент не открываем
// (как в блоке E+ПКМ ниже: открыть-и-закрыть ломало следующие открытия), а сразу
// открываем showGiveLicTypeDialog(ID). Если ID не нашёлся — показываем обычное меню.
// Действует только у Лицензёра в правительственном скине при включённом помощнике.
// Стоит РАНЬШЕ блока E+ПКМ и кнопки в круге, поэтому они видят открытие первыми.
// ══════════════════════════════════════════════════════════════════════════════
(function _pravoCircleLicenseAuto() {
    if (window.__pravoCircleLic) return;
    window.__pravoCircleLic = true;

    var pending = false, bypass = false, pendTimer = null;

    function norm(s) { return String(s).trim().split(' ').join('_').toLowerCase(); }

    function parseNick(params) {
        try {
            var p = (typeof params === 'string') ? JSON.parse(params.replace(/\n/, '\\n')) : params;
            var raw = Array.isArray(p) ? p[0] : null;
            return (typeof raw === 'string') ? raw.trim().split(' ').join('_') : '';
        } catch (e) { return ''; }
    }

    function findId(nick) {
        try {
            var list = window._mvdPlayerList, n = norm(nick);
            if (!list || !nick) return null;
            if (list.local && norm(list.local.name) === n) return list.local.id;
            if (Array.isArray(list.players)) {
                var f = list.players.find(function (p) { return norm(p.name) === n; });
                return f ? f.id : null;
            }
        } catch (e) {}
        return null;
    }

    function notify(text) {
        try { if (typeof gtAdd === 'function') gtAdd(text, 3000, 3); } catch (e) {}
    }

    function canIntercept(nick) {
        if (window.PRAVO_CIRCLE_LIC !== true) return false;
        if (typeof window._pravoQuickGiveOn !== 'function' || !window._pravoQuickGiveOn()) return false;
        if (typeof window._pravoCircleAllowed !== 'function' || !window._pravoCircleAllowed()) return false;
        if (typeof window.showGiveLicTypeDialog !== 'function') return false;
        // только меню игрока «Имя_Фамилия» (у машин/домов/NPC другой заголовок)
        return /^[^\s_]+_[^\s_]+$/.test(nick);
    }

    // Сообщаем серверу, что меню «закрыто» (компонент мы не открывали)
    function tellServerClosed() {
        try {
            var f = (typeof window.sendClientEventHandle === 'function') ? window.sendClientEventHandle : window.sendClientEvent;
            f(window.gm.EVENT_EXECUTE_PUBLIC, 'MenuInt_OnCloseInterface', 0);
        } catch (e) {}
    }

    function resolveId(nick, tries, cb) {
        var id = findId(nick);
        if (id !== null) return cb(id);
        if (tries >= 4) return cb(null);
        // список игроков обновляется редко — просим движок обновить
        if (tries === 0 && typeof window.updatePlayerList === 'function') {
            try { window.updatePlayerList(); } catch (e) {}
        }
        setTimeout(function () { resolveId(nick, tries + 1, cb); }, 250);
    }

    function done() {
        pending = false;
        if (pendTimer) { clearTimeout(pendTimer); pendTimer = null; }
    }

    // Не смогли определить цель — показываем обычное круговое меню
    function showNormal(params) {
        done();
        bypass = true;
        try { _oi.call(window, 'PlayerInteraction', params); } catch (e) {}
        bypass = false;
    }

    function handle(nick, params) {
        pending = true;
        if (pendTimer) clearTimeout(pendTimer);
        pendTimer = setTimeout(function () { if (pending) { showNormal(params); } }, 3000); // страховка
        resolveId(nick, 0, function (id) {
            if (!pending) return;
            if (id === null) {
                showNormal(params);
                notify('~r~Круговое меню~n~~w~Не удалось определить ID игрока');
                return;
            }
            done();
            window._pravoLastInteractionTarget = { nick: nick, id: id, src: 'circlelic', time: Date.now() };
            console.log('[PRAVO] 🪪 Круговое меню: выдача лицензии → "' + nick + '" | ID: ' + id);
            tellServerClosed();
            setTimeout(function () {
                if (typeof window.showGiveLicTypeDialog === 'function') window.showGiveLicTypeDialog(id);
            }, 80);
        });
    }

    var _oi = window.openInterface;
    window.openInterface = function (name, params) {
        if (name === 'PlayerInteraction' && !bypass) {
            var was = false;
            try { was = !!window.getInterfaceStatus('PlayerInteraction'); } catch (e) {}
            if (!was) {
                if (pending) return Promise.resolve(); // уже обрабатываем это открытие
                var nick = '';
                try { nick = parseNick(params); } catch (e) {}
                var ok = false;
                try { ok = !!nick && canIntercept(nick); } catch (e) {}
                if (ok) {
                    try { handle(nick, params); } catch (e) { return showNormal(params); }
                    return Promise.resolve();
                }
            }
        }
        return _oi.apply(this, arguments);
    };

    console.log('[PRAVO] ✅ «Круговое меню» (сразу выдача лицензии) установлено');
})();
// ══════════════════════════════════════════════════════════════════════════════

// ── PlayerInteraction: лог ника и ID цели при открытии радиального меню ──────
// Вставить в pravo.js ПОСЛЕ блока _patchInteractionsHooks (после его `})();`)
// или просто в конец файла.
//
// Как это работает: сервер (MenuInteraction / OnEntitySelected) кладёт ник цели
// в params[0] при openInterface('PlayerInteraction', ...) — именно его интерфейс
// показывает как «Взаимодействие с Имя Фамилия». ID в params нет, поэтому ищем его
// по нику в window._mvdPlayerList (его уже заполняет onUpdatePlayersList).
(function _pravoInteractionTargetLog() {
    if (window.__pravoIntTargetLog) return;
    window.__pravoIntTargetLog = true;

    function findId(nick) {
        try {
            var list = window._mvdPlayerList;
            if (!list || !nick) return null;
            if (list.local && list.local.name === nick) return list.local.id;
            if (Array.isArray(list.players)) {
                var f = list.players.find(function (p) { return p.name === nick; });
                return f ? f.id : null;
            }
        } catch (e) {}
        return null;
    }

    function parseParams(params) {
        try {
            if (typeof params === 'string') params = JSON.parse(params.replace(/\n/, '\\n'));
            return Array.isArray(params) ? params : null;
        } catch (e) { return null; }
    }

    function logTarget(params, src) {
        var p = parseParams(params);
        var raw = p && p[0];
        if (typeof raw !== 'string' || !raw) return;

        // сервер шлёт «Ivan_Petrov»; на случай пробелов пробуем оба варианта
        var nick = raw.trim();
        var nickAlt = nick.split(' ').join('_');

        function report(idSuffix) {
            var id = findId(nick);
            if (id === null) id = findId(nickAlt);
            window._pravoLastInteractionTarget = { nick: nick, id: id, src: src, time: Date.now() };
            console.log('[PRAVO] 🎯 PlayerInteraction (' + src + '): цель "' + nick + '" | ID: '
                + (id !== null ? id : 'не найден в списке игроков') + (idSuffix || ''));
            return id;
        }

        if (report() === null && typeof window.updatePlayerList === 'function') {
            // список игроков обновляется раз в ~30с — просим движок обновить и пробуем ещё раз
            try { window.updatePlayerList(); } catch (e) {}
            setTimeout(function () { report(' (после обновления списка)'); }, 700);
        }
    }

    // openInterface('PlayerInteraction', params)
    var _oi = window.openInterface;
    window.openInterface = function (name, params) {
        var wasOpen = false;
        if (name === 'PlayerInteraction') {
            try { wasOpen = !!window.getInterfaceStatus('PlayerInteraction'); } catch (e) {}
            // если уже открыт — оригинальный openInterface вызов проигнорирует, не логируем
            if (!wasOpen) { try { logTarget(params, 'open'); } catch (e) {} }
        }
        return _oi.apply(this, arguments);
    };

    // updateParams('PlayerInteraction', json) — сервер может обновлять меню на лету
    var _up = window.updateParams;
    if (typeof _up === 'function') {
        window.updateParams = function (name, params) {
            if (name === 'PlayerInteraction') {
                try {
                    var p = parseParams(params);
                    var last = window._pravoLastInteractionTarget;
                    if (p && typeof p[0] === 'string' && (!last || last.nick !== p[0].trim())) {
                        logTarget(params, 'update');
                    }
                } catch (e) {}
            }
            return _up.apply(this, arguments);
        };
    }

    console.log('[PRAVO] ✅ PlayerInteraction target logger установлен');
})();
// ══════════════════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════════════════
// E + ПКМ по игроку → сразу диалог выбора лицензии (/givelic) для этого игрока.
//
// Как работает: комбинация шлёт на сервер то же событие, что и клавиша R
// (MenuInt_OnPlayerKey) — сервер определяет цель, на которую ты навёл ПКМ, и
// открывает PlayerInteraction. Блок ловит это открытие (openInterface), достаёт ник
// из params[0], находит ID в window._mvdPlayerList, прячет и закрывает радиальное
// меню и открывает showGiveLicTypeDialog(ID).
// Работает только у Лицензёра (как и GIVELIC_KEY) и только в правительственном скине.
// Обычный ПКМ + R не затронут. С версии «Круговое меню» ОТКЛЮЧЕНО по умолчанию;
// включить обратно: window.PRAVO_QUICKLIC_ENABLED = true.
// ══════════════════════════════════════════════════════════════════════════════
(function _pravoQuickLicenseOnTarget() {
    if (window.__pravoQuickLic) return;
    window.__pravoQuickLic = true;

    var KEY_E = 69, MOUSE_RIGHT = 2;
    var ARM_TIMEOUT = 2500;   // сколько ждём, пока сервер откроет PlayerInteraction
    var COOLDOWN = 1200;      // антиспам комбинации
    var rmbDown = false, eDown = false;
    var armed = false, armTimer = null, lastFire = 0;
    var dropE = false, dropETimer = null;
    var styleEl = null;
    var lastRKey = 0;         // когда игрок сам нажал R (обычное открытие меню)

    // Отладка: window.PRAVO_QUICKLIC_DEBUG = true — пишет в консоль ход комбинации
    function dbg() {
        if (!window.PRAVO_QUICKLIC_DEBUG) return;
        try { console.log.apply(console, ['[PRAVO][QL]'].concat([].slice.call(arguments))); } catch (e) {}
    }

    function notify(text) {
        try { if (typeof gtAdd === 'function') gtAdd(text, 3000, 3); } catch (e) {}
    }

    function norm(s) { return String(s).trim().split(' ').join('_').toLowerCase(); }

    function findId(nick) {
        try {
            var list = window._mvdPlayerList, n = norm(nick);
            if (!list || !nick) return null;
            if (list.local && norm(list.local.name) === n) return list.local.id;
            if (Array.isArray(list.players)) {
                var f = list.players.find(function (p) { return norm(p.name) === n; });
                return f ? f.id : null;
            }
        } catch (e) {}
        return null;
    }

    // Прячем радиальное меню на время «невидимого» открытия, чтобы оно не мигало
    function hideUi(on) {
        try {
            if (on && !styleEl) {
                styleEl = document.createElement('style');
                styleEl.textContent = '.player-interaction,.player-interaction-layer{opacity:0!important;transition:none!important}';
                (document.head || document.documentElement).appendChild(styleEl);
            } else if (!on && styleEl) {
                styleEl.remove();
                styleEl = null;
            }
        } catch (e) {}
    }

    function disarm() {
        armed = false;
        if (armTimer) { clearTimeout(armTimer); armTimer = null; }
        hideUi(false);
    }

    // Закрываем так же, как это делает сам компонент (close()): интерфейс + событие серверу
    // Компонент PlayerInteraction мы НЕ открываем вообще (см. обёртку openInterface ниже),
    // поэтому закрывать нечего — только говорим серверу, что меню «закрыто».
    function closeInteraction() {
        try { window.sendClientEventHandle(window.gm.EVENT_EXECUTE_PUBLIC, 'MenuInt_OnCloseInterface', 0); } catch (e) {}
    }

    // Если комбинация не сработала (нет ID / нажали R) — показываем перехваченное меню как обычно
    var swallowedParams = null;
    function restoreMenu() {
        var p = swallowedParams;
        swallowedParams = null;
        if (p === null) return;
        disarm();
        dbg('restore: открываю обычное меню');
        try { _oi.call(window, 'PlayerInteraction', p); } catch (e) {}
    }

    function canFire() {
        // По умолчанию комбинация ОТКЛЮЧЕНА — её заменяет «Круговое меню» (ПРАВИТЕЛЬСТВО).
        // Вернуть старое поведение: window.PRAVO_QUICKLIC_ENABLED = true.
        if (window.PRAVO_QUICKLIC_ENABLED !== true) return false;
        try {
            if (typeof pravoSkins !== 'undefined' && typeof skinId !== 'undefined' && !pravoSkins.includes(skinId)) return false;
        } catch (e) {}
        if (typeof _isLicensorRank === 'function' && !_isLicensorRank()) return false;
        // те же условия, при которых клиент вообще отправляет R
        if (window.inputFocus || window.isBluredInput === false) return false;
        if (typeof window.IsDialogOpened === 'function' && window.IsDialogOpened()) return false;
        if (typeof window.isOpenedChat === 'function' && window.isOpenedChat()) return false;
        if (window.getInterfaceStatus('PlayerInteraction') || window.getInterfaceStatus('Police')) return false;
        return true;
    }

    function fire() {
        var now = Date.now();
        if (armed || now - lastFire < COOLDOWN || !canFire()) return;
        // игрок только что сам нажал R — его меню не трогаем (иначе оно спрячется/закроется)
        if (now - lastRKey < 700) { dbg('skip: только что нажат R'); return; }
        lastFire = now;
        armed = true;
        swallowedParams = null;
        dbg('fire: отправляю MenuInt_OnPlayerKey');
        dropE = true; // не отправлять серверу «E» при отпускании клавиши
        if (dropETimer) clearTimeout(dropETimer);
        dropETimer = setTimeout(function () { dropE = false; }, 3000); // страховка
        armTimer = setTimeout(function () {
            if (!armed) return;
            disarm();
            notify('~r~Выдача лицензии~n~~w~Игрок не найден — наведитесь на него ПКМ');
        }, ARM_TIMEOUT);
        window.sendClientEvent(window.gm.EVENT_EXECUTE_PUBLIC, 'MenuInt_OnPlayerKey'); // как клавиша R
    }

    function resolveId(nick, tries, cb) {
        var id = findId(nick);
        if (id !== null) return cb(id);
        if (tries >= 4) return cb(null);
        // список игроков обновляется редко — просим движок обновить
        if (tries === 0 && typeof window.updatePlayerList === 'function') {
            try { window.updatePlayerList(); } catch (e) {}
        }
        setTimeout(function () { resolveId(nick, tries + 1, cb); }, 250);
    }

    function onInteractionOpened(params) {
        if (armTimer) { clearTimeout(armTimer); armTimer = null; }
        var p = null;
        try {
            p = (typeof params === 'string') ? JSON.parse(params.replace(/\n/, '\\n')) : params;
        } catch (e) {}
        var raw = Array.isArray(p) ? p[0] : null;
        var nick = (typeof raw === 'string') ? raw.trim() : '';

        function fail() {
            restoreMenu(); // не смогли определить цель — показываем обычное меню
            console.warn('[PRAVO] ⚠ Быстрая выдача: не удалось определить ID. params =', params);
            notify('~r~Выдача лицензии~n~~w~Не удалось определить ID цели');
        }
        if (!nick) return fail();

        resolveId(nick, 0, function (id) {
            if (!armed) return restoreMenu(); // комбинацию отменили (например, нажали R) — отдаём меню
            if (id === null) return fail();
            window._pravoLastInteractionTarget = { nick: nick, id: id, src: 'quicklic', time: Date.now() };
            console.log('[PRAVO] 🪪 E+ПКМ: выдача лицензии → "' + nick + '" | ID: ' + id);
            swallowedParams = null;
            closeInteraction();
            disarm();
            setTimeout(function () {
                if (typeof window.showGiveLicTypeDialog === 'function') window.showGiveLicTypeDialog(id);
            }, 80);
        });
    }

    // ── перехват открытия PlayerInteraction (оборачиваем уже обёрнутый логгер цели) ──
    var _oi = window.openInterface;
    window.openInterface = function (name, params) {
        if (name === 'PlayerInteraction' && armed && swallowedParams === null) {
            // Компонент НЕ открываем: открыть-и-сразу-закрыть ломало следующие открытия меню
            // (счётчики скрытия HUD/меток, mount/unmount компонента). Просто забираем параметры.
            swallowedParams = (params === undefined || params === null) ? '' : params;
            dbg('open перехвачен, params =', params);
            setTimeout(function () { try { onInteractionOpened(params); } catch (e) { restoreMenu(); } }, 0);
            return Promise.resolve();
        }
        return _oi.apply(this, arguments);
    };

    // ── при комбинации не отправляем серверу «E» (клиент шлёт его на keyup) ──
    var _sce = window.sendClientEvent;
    if (typeof _sce === 'function') {
        window.sendClientEvent = function () {
            if (dropE && arguments[1] === 'OnPlayerClientSideKey' && arguments[2] === KEY_E) return;
            return _sce.apply(this, arguments);
        };
    }

    // ── отслеживание E и ПКМ (capture — раньше остальных обработчиков) ──
    window.addEventListener('keydown', function (e) {
        if (e.keyCode !== KEY_E) {
            if (e.repeat) return;
            // любая другая клавиша сбрасывает «залипший» E (keyup мог не дойти до страницы)
            eDown = false;
            // игрок сам открывает меню клавишей R — снимаем наш «невидимый» режим,
            // чтобы обычное радиальное меню не пряталось и не закрывалось
            if (e.keyCode === 82) {
                lastRKey = Date.now();
                if (armed) { dbg('R во время armed → disarm'); if (swallowedParams !== null) restoreMenu(); else disarm(); }
            }
            return;
        }
        if (e.repeat) return;
        eDown = true;
        if (rmbDown) fire();
    }, true);
    window.addEventListener('keyup', function (e) {
        if (e.keyCode !== KEY_E) return;
        eDown = false;
        // флаг снимаем чуть позже: обработчик игры отправит «E» в этом же событии
        if (dropE) setTimeout(function () { dropE = false; }, 80);
    }, true);
    window.addEventListener('mousedown', function (e) {
        if (e.button !== MOUSE_RIGHT) return;
        rmbDown = true;
        if (eDown) fire();
    }, true);
    window.addEventListener('mouseup', function (e) {
        if (e.button === MOUSE_RIGHT) rmbDown = false;
    }, true);
    // ПКМ «залип» (mouseup не дошёл) — синхронизируемся по e.buttons
    window.addEventListener('mousemove', function (e) {
        if (rmbDown && !(e.buttons & 2)) rmbDown = false;
    }, true);
    window.addEventListener('blur', function () { rmbDown = false; eDown = false; });

    console.log('[PRAVO] ✅ Быстрая выдача лицензии (E + ПКМ) установлена');
})();
// ══════════════════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════════════════
// Hassle (мобилка) И ПК (Radmir): пункт «Выдача лицензии» В КРУГЕ радиального меню PlayerInteraction.
//
// Пункт добавляется ПРЯМО В ДАННЫЕ компонента (vm.menu) — как обычная категория («Персонаж», «Транспорт»…):
//   • иконку рисует сама игра (родной компонент «Персонаж»), сверху добавляется карточка-лицензия;
//   • по нажатию открывается ВЫБОР В КРУГЕ (подпункты кольца, как у «Персонажа»): Права / Проф. права /
//     Оружие / Рыбалка / Охота; выбор типа → меню закрывается → уходит /givelic <ID> <тип> <цена>;
//   • серверу ничего лишнего не отправляется: клики по нашему пункту перехватываются локально.
// Если нативный способ не удался (нет нужных методов у компонента / нет свободного сектора), включается
// запасная кнопка-DOM поверх круга (нажатие открывает старый диалог выбора лицензии).
//
// Ник цели — params[0] при openInterface/updateParams('PlayerInteraction'), ID — из window._mvdPlayerList.
// Условия показа: window._pravoCircleAllowed (Лицензёр в правительственном скине; на мобилке ещё помощник)
//   + на ПК и на мобилке обязательно включённая в установщике «Быстрая выдача лицензии»
//   (задан хоткей GIVELIC_KEY или включён LICENSOR_HELPER_ENABLED) — иначе пункта в круге нет.
// Отладка: window.PRAVO_MOBLIC_DEBUG = true — в консоль пишется режим работы и причины, почему кнопки нет.
//
// Настройки:
//   PRAVO_MOBLIC_ICON  — своя картинка вместо встроенной иконки: URL или data:image/... (пусто = встроенная)
//   По умолчанию пункт ставится СЛЕВА от категории «Персонаж» (соседний сектор против часовой стрелки).
//     Сектор свободен — занимаем его (сектора между ним и категориями сервера заполняются пустышками);
//     занят — вставляем вплотную перед «Персонажем», а его и следующие категории сдвигаем на сектор по кругу.
//   window.PRAVO_MOBLIC_SIDE = 'right' — ставить справа от «Персонажа» (по часовой), а не слева.
//   window.PRAVO_MOBLIC_SLOT — жёстко задать номер сектора 0..7 (0 сверху, дальше по часовой); главнее SIDE.
//                              Если сектор занят категорией сервера — она и следующие сдвигаются на один.
//   window.PRAVO_MOBLIC_NATIVE = false — не встраивать в круг, сразу использовать запасную DOM-кнопку.
//   window.PRAVO_MOBLIC_BTN_ENABLED = false — отключить кнопку совсем.
//   window.PRAVO_MOBLIC_LABELS = false — не показывать ники над игроками при раскрытом выборе лицензии.
//
// Ники над игроками: PlayerInteraction в игре открывается с hideLabels (ники скрыты). Пока в круге раскрыт
// выбор типа лицензии нашего пункта — включаем ники (setDrawLabelStatus(true)); вернулись «Назад», выбрали
// другую категорию или закрыли меню — снова скрываем / игра сама возвращает ники при закрытии меню.
// ══════════════════════════════════════════════════════════════════════════════
(function _pravoMobileLicenseButton() {
    if (window.__pravoMobLicBtn) return;
    window.__pravoMobLicBtn = true;

    var VERSION = 'native-v5';
    var PRAVO_MOBLIC_ICON = '';   // ← сюда свою картинку (URL или data:image/png;base64,...)
    var ENTRY_ID = 'pravo_lic';   // id нашего пункта в vm.menu (строка — не пересечётся с числовыми id сервера)
    var MASK_ID = 'pravoLicMask';
    var BTN_ID = 'pravo-moblic-btn';
    var HOV_ID = 'pravo-moblic-hover';
    var TITLE = 'Выдача лицензии';
    var SVG_NS = 'http://www.w3.org/2000/svg';
    var lastNick = '', busy = false, syncTimer = null, mode = '', patchedFor = null, capBox = null, warned = false;
    var labelsOn = false, watchedFor = null;   // labelsOn — мы сами включили ники (setDrawLabelStatus(true))

    function norm(s) { return String(s).trim().split(' ').join('_').toLowerCase(); }

    function parseNick(params) {
        try {
            var p = (typeof params === 'string') ? JSON.parse(params.replace(/\n/, '\\n')) : params;
            var raw = Array.isArray(p) ? p[0] : null;
            return (typeof raw === 'string') ? raw.trim().split(' ').join('_') : '';
        } catch (e) { return ''; }
    }

    function notify(text) {
        try { if (typeof gtAdd === 'function') gtAdd(text, 3000, 3); } catch (e) {}
    }

    function findId(nick) {
        try {
            var list = window._mvdPlayerList, n = norm(nick);
            if (!list || !nick) return null;
            if (list.local && norm(list.local.name) === n) return list.local.id;
            if (Array.isArray(list.players)) {
                var f = list.players.find(function (p) { return norm(p.name) === n; });
                return f ? f.id : null;
            }
        } catch (e) {}
        return null;
    }

    function dbg() {
        if (!window.PRAVO_MOBLIC_DEBUG) return;
        try { console.log.apply(console, ['[PRAVO][MOBLIC]'].concat([].slice.call(arguments))); } catch (e) {}
    }

    function canShow(nick) {
        if (window.PRAVO_MOBLIC_BTN_ENABLED === false) { dbg('off: PRAVO_MOBLIC_BTN_ENABLED=false'); return false; }
        if (typeof window.showGiveLicTypeDialog !== 'function') { dbg('off: нет showGiveLicTypeDialog'); return false; }
        // Платформа-зависимые условия (скин + Лицензёр + на мобилке помощник) — в одном месте,
        // ровно так же, как у «Кругового меню». На ПК флаг помощника НЕ нужен.
        if (typeof window._pravoCircleAllowed !== 'function' || !window._pravoCircleAllowed()) {
            dbg('off: _pravoCircleAllowed()=false | skin:', window._pravoSkinId, '| rank:', window._pravoRank,
                '| mobile:', !!(window.App && window.App.isMobile), '| helper:', !!(LICENSOR_HELPER_ENABLED || window.LICENSOR_HELPER_ENABLED));
            return false;
        }
        // «Быстрая выдача лицензии» выключена в установщике → пункта в круге нет (и на ПК тоже).
        // Тот же критерий, что у пункта «Выдача лицензии» в диалоге «ПРАВИТЕЛЬСТВО»: хоткей или флаг помощника.
        if (typeof window._pravoQuickGiveOn !== 'function' || !window._pravoQuickGiveOn()) {
            dbg('off: «Быстрая выдача лицензии» выключена в установщике');
            return false;
        }
        // только меню игрока: «Имя_Фамилия» (у машин/гаражей/NPC другой заголовок)
        var ok = /^[^\s_]+_[^\s_]+$/.test(nick);
        if (!ok) dbg('off: params[0] не похож на ник игрока:', JSON.stringify(nick));
        return ok;
    }

    function isOpen() {
        try { return !!window.getInterfaceStatus('PlayerInteraction'); } catch (e) { return false; }
    }
    function getVm() {
        try { return window.interface('PlayerInteraction') || null; } catch (e) { return null; }
    }

    // Координаты сектора i (0 — верх, по часовой) — те же, что игра считает для кнопок категорий
    function coordsFor(vm, slot) {
        try {
            var ang = (vm.k * slot + Math.PI / 2) % (Math.PI * 2);
            return vm.getCoords(vm.innerRadius, ang);
        } catch (e) { return null; }
    }

    function scopeAttr(box) {
        try {
            var ref = box.querySelector('.player-interaction__item') || box;
            for (var i = 0; i < ref.attributes.length; i++) {
                if (ref.attributes[i].name.indexOf('data-v-') === 0) return ref.attributes[i].name;
            }
        } catch (e) {}
        return 'data-v-96e76c6f';
    }

    function hideHover() {
        var h = document.getElementById(HOV_ID);
        if (h && h.parentNode) h.parentNode.removeChild(h);
    }
    function stopSync() {
        if (syncTimer) { clearInterval(syncTimer); syncTimer = null; }
    }
    function removeBtn() {
        hideHover();
        var old = document.getElementById(BTN_ID);
        if (old && old.parentNode) old.parentNode.removeChild(old);
    }
    function cleanup() {
        if (window.__pravoLicPick === true) {
            window.__pravoLicPick = false;
            if (typeof window.__pravoChatSync === 'function') window.__pravoChatSync();
        }
        window.__pravoLicPick = false;
        releaseLabels();
        stopSync();
        removeBtn();
        detachCapture();
        mode = '';
        patchedFor = null;
    }

    // Закрываем как компонент: closeInterface + событие серверу
    function closeMenu() {
        try { window.closeInterface('PlayerInteraction'); } catch (e) {}
        try { window.sendClientEvent(window.gm.EVENT_EXECUTE_PUBLIC, 'MenuInt_OnCloseInterface', 0); } catch (e) {}
    }

    // Определяем ID цели по нику; список игроков обновляется редко — просим движок обновить и ждём до ~1с
    function withTargetId(cb) {
        var nick = lastNick;
        if (!nick) { busy = false; notify('~r~Выдача лицензии~n~~w~Не удалось определить игрока'); return; }
        var id = findId(nick);
        if (id !== null) return cb(id);
        try { if (typeof window.updatePlayerList === 'function') window.updatePlayerList(); } catch (er) {}
        var tries = 0;
        var t = setInterval(function () {
            if (!isOpen()) { clearInterval(t); busy = false; return; }
            var f = findId(nick);
            if (f !== null) { clearInterval(t); return cb(f); }
            if (++tries >= 4) {
                clearInterval(t);
                busy = false;
                notify('~r~Выдача лицензии~n~~w~Не удалось определить ID игрока');
            }
        }, 250);
    }

    // Выдача по индексу типа лицензии (Права / Проф. права / …); запасной путь — старый диалог
    function giveLicense(id, idx) {
        try {
            if (typeof window.pravoGiveLicenseByIndex === 'function' && window.pravoGiveLicenseByIndex(id, idx)) return;
        } catch (er) { console.warn('[PRAVO] выдача лицензии из круга:', er); }
        if (typeof window.showGiveLicTypeDialog === 'function') window.showGiveLicTypeDialog(id);
    }

    // ══════════════ НАТИВНЫЙ РЕЖИМ: пункт внутри vm.menu ══════════════

    function hasEntry(vm) {
        try { return vm.menu.some(function (m) { return m && m._pravoLic; }); } catch (e) { return false; }
    }
    function ownIndex(vm) {
        try {
            for (var i = 0; i < vm.menu.length; i++) if (vm.menu[i] && vm.menu[i]._pravoLic) return i;
        } catch (e) {}
        return -1;
    }
    function isOwnSelected(vm) {
        try { var m = vm.menu[vm.selectedOption]; return !!(m && m._pravoLic); } catch (e) { return false; }
    }

    // ── Ники над игроками ─────────────────────────────────────────────────────────────────────
    // Игра открывает PlayerInteraction с hideLabels → ники скрыты. Показываем их только пока раскрыт
    // выбор типа лицензии нашего пункта. Счётчики игры (Wa в openInterface/closeInterface) не трогаем:
    // при закрытии меню игра сама шлёт setDrawLabelStatus(true).
    function setLabels(on) {
        if (labelsOn === on) return;
        labelsOn = on;
        try {
            if (typeof window.setDrawLabelStatus === 'function') window.setDrawLabelStatus(on);
            dbg('ники над игроками:', on ? 'показаны (выбор лицензии раскрыт)' : 'скрыты (вернулись в круг)');
        } catch (er) { dbg('setLabels:', er); }
    }
    // Привести ники в соответствие с состоянием круга (идемпотентно, можно дёргать сколько угодно)
    function syncLabels(vm) {
        var want = false, pick = false;
        try { pick = isOpen() && isOwnSelected(vm); } catch (er) {}
        var prevPick = window.__pravoLicPick === true;
        window.__pravoLicPick = pick;   // выбор лицензии раскрыт — по нему же чат выводится над затемнением (блок ниже)
        if (pick !== prevPick && typeof window.__pravoChatSync === 'function') window.__pravoChatSync();   // подмена затемнения в этом же кадре
        try { want = window.PRAVO_MOBLIC_LABELS !== false && pick; } catch (er) {}
        if (want === labelsOn) return;
        if (want) { setLabels(true); return; }
        // гасим только если меню всё ещё открыто; если закрыто — игра уже вернула ники сама
        if (isOpen()) setLabels(false); else labelsOn = false;
    }
    function releaseLabels() {
        if (!labelsOn) return;
        if (isOpen()) setLabels(false); else labelsOn = false;
    }

    // Подпункты кольца — типы лицензий из _GIVE_LIC_TYPES (Права, Проф. права, Оружие, Рыбалка, Охота)
    function licOptions() {
        var list = [];
        try { list = _GIVE_LIC_TYPES; } catch (e) {}
        var out = [];
        for (var i = 0; i < list.length; i++) out.push({ id: 'pravo_lic_' + i, title: list[i].name, _pravoLicIdx: i });
        // Порядок веера на экране. Сетка игры кладёт 1-й пункт ПРАВЕЕ всех, а остальные идут по часовой (справа налево),
        // поэтому при чтении слева направо первой оказывалась «Охота». Разворачиваем массив: слева направо теперь
        // Права → Проф. права → Оружие → Рыбалка → Охота. Тип лицензии берётся из _pravoLicIdx, так что выдача не путается.
        // window.PRAVO_MOBLIC_LAYER_REVERSE = false — вернуть прежний порядок (Права справа, Охота слева).
        if (window.PRAVO_MOBLIC_LAYER_REVERSE !== false) out.reverse();
        return out;
    }

    // Индекс родной категории «Персонаж» (наш собственный пункт с той же иконкой не считаем)
    function characterIndex(vm) {
        try {
            for (var i = 0; i < vm.menu.length; i++) {
                var m = vm.menu[i];
                if (m && !m._pravoLic && !m._pravoPad && (m.icon === 'Character' || m.title === 'Персонаж')) return i;
            }
        } catch (e) {}
        return -1;
    }

    // Куда ставим пункт. Порядок секторов: 0 — сверху, дальше по часовой (3 — справа снизу, 7 — слева сверху).
    // Слот кнопки по умолчанию: 4 = низ по центру (под персонажем, по часовой от верха: 0 верх, 2 право, 4 низ, 6 лево).
    // Внешний слой с типами лицензий раскрывается снизу, и чат (сверху-слева) его не перекрывает.
    // Переопределить: window.PRAVO_MOBLIC_SLOT = 0..7; значение -1 вернёт прежнее поведение (рядом с «Персонаж», см. SIDE).
    function configuredSlot() {
        var s = window.PRAVO_MOBLIC_SLOT;
        return (typeof s === 'number') ? s : 4;
    }

    // Сдвиг внешнего слоя (типы лицензий) по кругу, в секторах по 22.5°. Положительное значение двигает веер ВПРАВО
    // (против часовой на экране). Штатная сетка кладёт первый тип в сектор сразу справа от низа, и веер уходит влево;
    // при слоте 4 по умолчанию сдвигаем на 2 сектора. Переопределить: window.PRAVO_MOBLIC_LAYER_SHIFT = 0..3 (0 = без сдвига).
    // Сдвиг включается, только если удалось подменить вычисляемый угол подсветки (shiftOn), иначе подсветка разъедется с пунктами.
    var shiftOn = false;
    function layerShift() {
        var n = window.PRAVO_MOBLIC_LAYER_SHIFT;
        if (typeof n === 'number') return n;
        return configuredSlot() === 4 ? 2 : 0;
    }
    function patchLayerRotation(vm) {
        var ctx = vm.$ && vm.$.ctx;
        if (!ctx) { dbg('layer shift: нет vm.$.ctx'); return false; }
        var d = Object.getOwnPropertyDescriptor(ctx, 'hoveredLayerRotation');
        if (!d || typeof d.get !== 'function') { dbg('layer shift: нет hoveredLayerRotation'); return false; }
        if (d.get.__pravoShift) return true;
        var og = d.get;
        var ng = function () {
            var r = og.apply(this, arguments);
            try {
                var n = layerShift();
                if (shiftOn && n && isOwnSelected(vm)) r -= n * (vm.k / 2) * 180 / Math.PI;
            } catch (er) {}
            return r;
        };
        ng.__pravoShift = true;
        Object.defineProperty(ctx, 'hoveredLayerRotation', { enumerable: d.enumerable, configurable: true, get: ng, set: d.set });
        return true;
    }

    function targetSlot(vm, total) {
        var len = vm.menu.length;
        var want = configuredSlot();
        if (typeof want === 'number' && want >= 0 && want < total) return want;
        var ch = characterIndex(vm);
        if (ch < 0) return len;                                   // «Персонажа» нет — как раньше, за последней категорией
        var right = (window.PRAVO_MOBLIC_SIDE === 'right');
        var t = right ? (ch + 1) % total : (ch - 1 + total) % total;
        if (t >= len) return t;                                    // соседний сектор свободен — занимаем его, ничего не сдвигая
        return right ? t : ch;                                     // занят — вставляем вплотную к «Персонажу», остальных сдвигаем
    }

    // Пересчитать координаты секторов и позиции подпунктов у пунктов начиная с индекса from
    function relayout(vm, from) {
        for (var i = from; i < vm.menu.length; i++) {
            var m = vm.menu[i], c = coordsFor(vm, i);
            if (!m || !c) continue;
            m.x = c.x; m.y = c.y;
            if (m.options && m.options.length) m.options = vm.setOptionsPositions(i, m.options);
        }
    }

    function addEntry(vm) {
        var total = vm.DEFAULT_MENU_COUNT || 8;
        var len = vm.menu.length;
        if (len >= total) return false;
        var opts = licOptions();
        if (!opts.length) return false;
        var idx = targetSlot(vm, total);
        if (idx < 0 || idx >= total) return false;
        var c = coordsFor(vm, idx);
        if (!c) return false;
        var entry = { id: ENTRY_ID, icon: 'Character', title: TITLE, _pravoLic: true, x: c.x, y: c.y };
        if (idx >= len) {
            // сектор свободен: пустышки до него + сам пункт
            var adds = [];
            for (var p = len; p < idx; p++) {
                var pc = coordsFor(vm, p);
                if (!pc) return false;
                adds.push({ id: 'pravo_pad_' + p, title: '', options: [], _pravoPad: true, x: pc.x, y: pc.y });
            }
            entry.options = vm.setOptionsPositions(idx, opts);     // позиции подпунктов считает сам компонент
            adds.push(entry);
            for (var a = 0; a < adds.length; a++) vm.menu.push(adds[a]);
        } else {
            // сектор занят категорией сервера: вставляем и сдвигаем её и следующие на один сектор по часовой
            entry.options = vm.setOptionsPositions(idx, opts);
            vm.menu.splice(idx, 0, entry);
            relayout(vm, idx + 1);
        }
        return true;
    }

    function removeEntry(vm) {
        try {
            var first = -1;
            for (var i = vm.menu.length - 1; i >= 0; i--) {
                var m = vm.menu[i];
                if (m && (m._pravoLic || m._pravoPad)) { vm.menu.splice(i, 1); first = i; }
            }
            if (first >= 0) relayout(vm, first);                   // вернуть сдвинутые категории на свои места
        } catch (e) {}
    }

    // Нажатие на наш пункт: как ответ сервера для обычной категории — выбираем её локально, серверу ничего не шлём
    function openOwn(vm, t) {
        var m = vm.menu[t];
        if (!m) return;
        vm.onSelectOption(m.id);
        syncLabels(vm);                                // выбор раскрылся — показываем ники над игроками
    }

    // Выбор типа лицензии в кольце: закрываем меню и отправляем /givelic
    function pickType(vm, i) {
        var m = vm.menu[vm.selectedOption];
        var o = m && m.options && m.options[i];
        if (!o || !o.title || busy) return;
        var typeIdx = (typeof o._pravoLicIdx === 'number') ? o._pravoLicIdx : i;
        busy = true;
        try { window.playSound('player_interaction/click-fast.mp3'); } catch (er) {}
        withTargetId(function (id) {
            closeMenu();
            setTimeout(function () { busy = false; giveLicense(id, typeIdx); }, 80);
        });
    }

    // Подменяем методы компонента — на случай, если игра вызовет их сама (клик в центре круга и т.п.)
    function patchVm(vm) {
        if (patchedFor === vm) return true;
        var oSel = vm.selectOption, oLay = vm.selectLayerOption, oTS = vm.onTouchStart, oTE = vm.onTouchEnd;
        if (typeof oSel !== 'function' || typeof oLay !== 'function') return false;
        vm.selectOption = function (e, t) {
            try {
                var m = vm.menu[t];
                if (m && m._pravoLic) {
                    if (!(e && e.target && e.target._prevClass === 'controls-button--text')) openOwn(vm, t);
                    return;
                }
            } catch (er) { dbg('selectOption:', er); }
            return oSel.apply(this, arguments);
        };
        vm.selectLayerOption = function (i) {
            try {
                if (isOwnSelected(vm)) { pickType(vm, i); return; }
            } catch (er) { dbg('selectLayerOption:', er); }
            return oLay.apply(this, arguments);
        };
        // на мобилке долгое нажатие на подпункт перетаскивает его в «избранное» и шлёт серверу его id — для нашего не нужно
        if (typeof oTS === 'function') vm.onTouchStart = function () { if (isOwnSelected(vm)) return; return oTS.apply(this, arguments); };
        if (typeof oTE === 'function') vm.onTouchEnd = function () { if (isOwnSelected(vm)) return; return oTE.apply(this, arguments); };
        // Баг игры: подсветка сектора считает угол как k*индекс+π/2 БЕЗ приведения к 0..2π. Для сектора 7
        // (слева сверху) угол = 9π/4, и getCoords переворачивает Y — подсветка рисуется снизу. Нормализуем угол.
        var oGC = vm.getCoords;
        if (typeof oGC === 'function') vm.getCoords = function (e, t) {
            if (typeof t === 'number' && t >= Math.PI * 2) t = t % (Math.PI * 2);
            return oGC.call(this, e, t);
        };
        //  Сдвиг веера типов лицензий: пункты, подсветка (позиция + угол) считаем со сдвигом на layerShift() секторов
        shiftOn = false;
        try { shiftOn = patchLayerRotation(vm); } catch (er) { dbg('layer shift:', er); }
        var oSOP = vm.setOptionsPositions, oOML = vm.onMouseOverLayer;
        if (typeof oSOP === 'function') vm.setOptionsPositions = function (e, t) {
            try {
                var n = layerShift();
                if (shiftOn && n && typeof e === 'number' && t && t.length && t[0] && typeof t[0]._pravoLicIdx === 'number') {
                    //  +полный оборот (DEFAULT_FIRST_LAYER_SECTORS «пунктов» = 2π), чтобы угол не ушёл в минус; 1 пункт = 2 сектора
                    return oSOP.call(this, e + (vm.DEFAULT_FIRST_LAYER_SECTORS || 8) - n / 2, t);
                }
            } catch (er) { dbg('setOptionsPositions:', er); }
            return oSOP.apply(this, arguments);
        };
        if (typeof oOML === 'function') vm.onMouseOverLayer = function (e) {
            var r = oOML.apply(this, arguments);
            try {
                var n = layerShift();
                if (shiftOn && n && isOwnSelected(vm)) {
                    vm.$nextTick(function () {   //  выполняется сразу после штатного $nextTick оригинала и перезаписывает X/Y
                        try {
                            if (vm.hoveredLayerOption !== e || !isOwnSelected(vm)) return;
                            var rad = vm.$refs.container.getBoundingClientRect().height / 2 + vm.convert(vm.defaultMenuGap);
                            var s = Math.PI * 2 / ((vm.DEFAULT_FIRST_LAYER_SECTORS || 8) * 2);
                            var a = s * (e + vm.selectedOption * 2 - n) + s / 2 + Math.PI * 3 / 8;
                            a = ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
                            var c = vm.getCoords(rad, a);
                            vm.hoveredLayerSectorX = +c.x;
                            vm.hoveredLayerSectorY = +c.y;
                        } catch (er2) { dbg('hover shift:', er2); }
                    });
                }
            } catch (er) { dbg('onMouseOverLayer:', er); }
            return r;
        };
        // Наведение мышью на центр круга: родная формула игры сравнивает углы в разных системах отсчёта и для
        // дальних секторов выбирает «не тот». Пока в круге есть наш пункт — считаем сектор под курсором честно.
        var oMM = vm.onMouseMove;
        if (typeof oMM === 'function') vm.onMouseMove = function (ev) {
            try {
                if (hasEntry(vm) && ev && vm.$refs && vm.$refs.inner && vm.k) {
                    var u = vm.$refs.inner.getBoundingClientRect();
                    var th = Math.atan2(ev.x - u.x - u.width / 2, -(ev.y - u.y - u.height / 2));   // от верха по часовой
                    if (th < 0) th += Math.PI * 2;
                    var j = Math.round(th / vm.k) % (vm.DEFAULT_MENU_COUNT || 8);
                    var mj = vm.menu[j];
                    if (mj && mj.title) {
                        vm.hoveredOption = j;
                        vm.$nextTick(function () {
                            var cc = vm.getCoords(vm.innerRadius - vm.convert(48 * 0.9) / 4, (vm.k * j + Math.PI / 2) % (Math.PI * 2));
                            vm.hoveredSectorX = cc.x; vm.hoveredSectorY = cc.y;
                        });
                    }
                    return;
                }
            } catch (er) { dbg('onMouseMove:', er); }
            return oMM.apply(this, arguments);
        };
        // Ники: следим за selectedOption — «Назад»/ESC, выбор другой категории и т.п. меняют его не через наши методы
        if (watchedFor !== vm) {
            try {
                if (typeof vm.$watch === 'function') {
                    try { vm.$watch('selectedOption', function () { syncLabels(vm); }, { flush: 'sync' }); }
                    catch (er0) { vm.$watch('selectedOption', function () { syncLabels(vm); }); }
                    watchedFor = vm;
                }
            } catch (er) { dbg('watch selectedOption:', er); }
        }
        var ok = vm.selectOption !== oSel && vm.selectLayerOption !== oLay;
        if (ok) patchedFor = vm;
        return ok;
    }

    // Перехват кликов на контейнере (capture) — независимо от того, как именно шаблон вызывает методы
    function stopEv(e) { try { e.stopPropagation(); e.preventDefault(); } catch (er) {} }
    function onCapClick(e) {
        try {
            var v = getVm();
            if (!v || !hasEntry(v)) return;
            var t = e.target;
            if (!t || !t.closest) return;
            if (t.closest('[data-pravo-lic-item]')) {                       // клик по нашему пункту круга
                stopEv(e); openOwn(v, ownIndex(v)); return;
            }
            if (isOwnSelected(v)) {                                         // подпункт нашей категории
                var li = t.closest('.player-interaction-layer__item');
                if (li && li.parentNode) {
                    var all = li.parentNode.querySelectorAll('.player-interaction-layer__item');
                    var pos = Array.prototype.indexOf.call(all, li);
                    if (pos >= 0) {
                        stopEv(e);
                        pickType(v, ((v.pageOptions && v.pageOptions.startIndex) || 0) + pos);
                    }
                    return;
                }
            }
            var inner = t.closest('.player-interaction__inner');            // клик в центре по наведённому сектору
            var h = v.hoveredOption;
            if (inner && h !== null && h !== undefined && v.menu[h] && v.menu[h]._pravoLic && t._prevClass !== 'controls-button--text') {
                stopEv(e); openOwn(v, h);
            }
        } catch (er) { dbg('capture click:', er); }
    }
    function onCapTouch(e) {
        try {
            var v = getVm();
            if (!v || !isOwnSelected(v)) return;
            var t = e.target;
            if (t && t.closest && t.closest('.player-interaction-layer__item')) e.stopPropagation();
        } catch (er) {}
    }
    function attachCapture(box) {
        if (capBox === box) return;
        detachCapture();
        box.addEventListener('click', onCapClick, true);
        box.addEventListener('touchstart', onCapTouch, true);
        capBox = box;
    }
    function detachCapture() {
        if (!capBox) return;
        capBox.removeEventListener('click', onCapClick, true);
        capBox.removeEventListener('touchstart', onCapTouch, true);
        capBox = null;
    }

    // Иконка: берём родной <svg> «Персонажа» (его отрисовала игра) и дорисовываем карточку-лицензию.
    // Если дорисовка почему-то не сработает — останется обычная иконка «Персонаж», пункт без картинки не бывает.
    var CARD_D = 'M17.5 17.4H29A2.5 2.5 0 0 1 31.5 19.9V28.5A2.5 2.5 0 0 1 29 31H17.5A2.5 2.5 0 0 1 15 28.5V19.9A2.5 2.5 0 0 1 17.5 17.4Z' +
        'M17 20.2H20.6V24.6H17ZM22.2 20.4H29.4V21.9H22.2ZM22.2 23.2H29.4V24.7H22.2ZM17 26.6H29.4V28.1H17Z';
    function mk(tag, attrs) {
        var el = document.createElementNS(SVG_NS, tag);
        for (var k in attrs) el.setAttribute(k, attrs[k]);
        return el;
    }
    function paintIcon(svg) {
        var paths = svg.querySelectorAll('path');             // сначала берём родные path — карточку добавим после
        if (PRAVO_MOBLIC_ICON) {
            for (var q = 0; q < paths.length; q++) paths[q].style.display = 'none';
            var im = mk('image', { x: '0', y: '0', width: '32', height: '32', href: PRAVO_MOBLIC_ICON });
            im.setAttributeNS('http://www.w3.org/1999/xlink', 'href', PRAVO_MOBLIC_ICON);
            svg.appendChild(im);
            return;
        }
        var defs = mk('defs', {});
        var mask = mk('mask', { id: MASK_ID, maskUnits: 'userSpaceOnUse', x: '0', y: '0', width: '32', height: '32' });
        mask.appendChild(mk('rect', { width: '32', height: '32', fill: '#fff' }));
        mask.appendChild(mk('rect', { x: '13.4', y: '15.6', width: '20', height: '17', rx: '4', fill: '#000' }));
        defs.appendChild(mask);
        svg.appendChild(defs);
        for (var i = 0; i < paths.length; i++) paths[i].setAttribute('mask', 'url(#' + MASK_ID + ')');
        svg.appendChild(mk('path', { 'fill-rule': 'evenodd', d: CARD_D }));
    }
    function decorate(vm) {
        var box = document.querySelector('.player-interaction__container');
        var idx = ownIndex(vm);
        if (!box || idx < 0) return;
        var el = box.querySelectorAll('.player-interaction__item')[idx];
        if (!el || (el.textContent || '').indexOf(TITLE) < 0) return;     // элемент ещё не отрисован
        var stale = box.querySelectorAll('[data-pravo-lic-item]');
        for (var sI = 0; sI < stale.length; sI++) if (stale[sI] !== el) stale[sI].removeAttribute('data-pravo-lic-item');
        if (!el.hasAttribute('data-pravo-lic-item')) el.setAttribute('data-pravo-lic-item', '1');
        var svg = el.querySelector('svg');
        if (!svg || svg.hasAttribute('data-pravo-lic')) return;
        svg.setAttribute('data-pravo-lic', '1');
        try { paintIcon(svg); dbg('иконка дорисована'); } catch (er) { dbg('иконка: ошибка дорисовки', er); }
    }

    function syncNative() {
        var v = getVm();
        if (!isOpen() || !v) { cleanup(); return; }
        try {
            if (!hasEntry(v) && Array.isArray(v.menu) && v.k != null && v.innerRadius != null && canShow(lastNick)) {
                patchVm(v);
                addEntry(v);                                   // сервер пересобрал меню — возвращаем пункт
            }
            syncLabels(v);                                     // страховка: если $watch недоступен или ники сбросил кто-то ещё
            decorate(v);
        } catch (er) { dbg('sync:', er); }
    }

    function tryNative(vm, box) {
        if (window.PRAVO_MOBLIC_NATIVE === false) { dbg('native: выключено PRAVO_MOBLIC_NATIVE=false'); return false; }
        try {
            if (!Array.isArray(vm.menu) || typeof vm.onSelectOption !== 'function' || typeof vm.setOptionsPositions !== 'function') {
                dbg('native: у компонента нет нужных данных/методов'); return false;
            }
            if (!patchVm(vm)) { dbg('native: не удалось подменить методы компонента'); return false; }
            if (!hasEntry(vm) && !addEntry(vm)) { dbg('native: нет свободного сектора или пустой список лицензий'); return false; }
            stopSync();
            removeBtn();
            attachCapture(box);
            mode = 'native';
            syncTimer = setInterval(syncNative, 200);
            setTimeout(syncNative, 30);
            dbg('режим: native | слот:', ownIndex(vm), '| ник:', lastNick, '| mobile:', !!(window.App && window.App.isMobile));
            return true;
        } catch (er) {
            dbg('native: ошибка', er);
            try { removeEntry(vm); } catch (e2) {}
            return false;
        }
    }

    // ══════════════ ЗАПАСНОЙ РЕЖИМ: отдельная кнопка-DOM поверх круга ══════════════

    // выбор сектора: явный PRAVO_MOBLIC_SLOT, иначе самый левый свободный
    function pickSlot(vm) {
        var total = vm.DEFAULT_MENU_COUNT || 8;
        var slot = configuredSlot();
        if (typeof slot === 'number' && slot >= 0 && slot < total) return slot;
        var want = targetSlot(vm, total);                     // «слева от Персонажа», если сектор свободен (сдвигать в DOM-режиме нельзя)
        if (want >= vm.menu.length && want < total) return want;
        var best = -1, bestX = Infinity;
        for (var i = vm.menu.length; i < total; i++) {
            var c = coordsFor(vm, i);
            if (c && c.x < bestX) { bestX = c.x; best = i; }
        }
        return best;
    }

    function openDialog(id) {
        closeMenu();
        setTimeout(function () {
            busy = false;
            if (typeof window.showGiveLicTypeDialog === 'function') window.showGiveLicTypeDialog(id);
        }, 80);
    }
    function onClick(e) {
        try { e.stopPropagation(); e.preventDefault(); } catch (er) {}
        if (busy) return;
        try { window.playSound('player_interaction/click-fast.mp3'); } catch (er) {}
        busy = true;
        withTargetId(openDialog);
    }

    // Иконка запасной кнопки: <img> с SVG в data-URI (не зависит от CSS страницы)
    var LIC_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="#e0bf3e"><defs><mask id="m" maskUnits="userSpaceOnUse" x="0" y="0" width="32" height="32"><rect width="32" height="32" fill="#fff"/><rect x="13.4" y="15.6" width="20" height="17" rx="4" fill="#000"/></mask></defs><g mask="url(#m)"><path d="M24 8C24 12.4183 20.4183 16 16 16C11.5817 16 8 12.4183 8 8C8 3.58172 11.5817 0 16 0C20.4183 0 24 3.58172 24 8Z"/><path d="M26.0113 32H32C32 27.7565 30.3143 23.6869 27.3137 20.6863C24.3131 17.6857 20.2435 16 16 16C11.7565 16 7.68688 17.6857 4.68629 20.6863C1.68571 23.6869 0 27.7565 0 32H6.65881C7.17634 28.7259 8.34695 25.3575 10.3003 23.1111C9.45815 24.9955 8.58027 28.4528 9.12668 32L23.5435 32C24.0899 28.4528 23.212 24.9955 22.3698 23.1111C24.3232 25.3575 25.4938 28.7259 26.0113 32Z"/></g><path fill-rule="evenodd" d="' + CARD_D + '"/></svg>';
    var LIC_ICON_URI = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(LIC_ICON_SVG);

    function buildIcon(sa) {
        return '<img ' + sa + ' class="player-interaction__icon-lic" draggable="false" alt="" src="' + LIC_ICON_URI + '"' +
            ' style="display:block;width:2.96vh;height:2.96vh;object-fit:contain;pointer-events:none;user-select:none;-webkit-user-drag:none">';
    }

    function injectDom(vm, box) {
        stopSync();
        removeBtn();
        var slot = pickSlot(vm);
        if (slot < 0) { console.warn('[PRAVO] Нет свободного сектора в PlayerInteraction для кнопки лицензии'); return; }
        var c = coordsFor(vm, slot);
        if (!c) return;

        var sa = scopeAttr(box);
        var b = document.createElement('div');
        b.id = BTN_ID;
        b.className = 'player-interaction__item';
        b.setAttribute(sa, '');
        b.style.transform = 'translate(' + c.x + 'px, ' + c.y + 'px)';
        b.style.cursor = 'pointer';
        b.style.webkitTapHighlightColor = 'transparent';
        var icon = PRAVO_MOBLIC_ICON
            ? '<img ' + sa + ' src="' + PRAVO_MOBLIC_ICON + '" style="width:2.96vh;height:2.96vh;object-fit:contain;display:block">'
            : buildIcon(sa);
        b.innerHTML = icon + '<div ' + sa + ' class="player-interaction__title">' + TITLE + '</div>';
        try {   // для отладки: видно, загрузилась ли картинка
            var _im = b.querySelector('img');
            if (_im) {
                _im.addEventListener('load', function () { dbg('иконка загружена', _im.naturalWidth + 'x' + _im.naturalHeight); });
                _im.addEventListener('error', function () { dbg('иконка НЕ загрузилась (data-URI)'); });
            }
        } catch (er) {}
        b.addEventListener('click', onClick);
        b.addEventListener('touchstart', function () { b.style.filter = 'brightness(0.6)'; }, { passive: true });
        b.addEventListener('touchend', function () { b.style.filter = ''; }, { passive: true });
        b.addEventListener('touchcancel', function () { b.style.filter = ''; }, { passive: true });
        // ПК: при наведении подсвечиваем СВОЙ сектор (родной hoveredOption игры про нашу кнопку не знает
        // и держит подсветку на последней категории), сбрасываем чужую подсветку и играем звук круга.
        // На мобилке не вешаем: после тапа браузер эмулирует mouse-события.
        if (!(window.App && window.App.isMobile)) {
            var showHover = function () {
                try {
                    var v = getVm();
                    if (!v || v.k == null || v.innerRadius == null) return;
                    hideHover();
                    if (typeof v.resetMainHover === 'function') v.resetMainHover();
                    var r = v.innerRadius - v.convert(48 * 0.9) / 4;   // как в onMouseOver компонента
                    var cc = v.getCoords(r, (v.k * slot + Math.PI / 2) % (Math.PI * 2));
                    var img = document.createElement('img');
                    img.id = HOV_ID;
                    img.setAttribute(sa, '');
                    img.className = 'player-interaction__sector';
                    img.src = v.images['/src/assets/images/player-interaction/option_hover.svg'];
                    img.style.transform = 'translate(' + cc.x + 'px, ' + cc.y + 'px) rotate(' + (v.k * slot * 180 / Math.PI) + 'deg)';
                    img.style.pointerEvents = 'none';
                    box.appendChild(img);
                    window.playSound('player_interaction/wheel.mp3');
                } catch (er) { dbg('hover error', er); }
            };
            b.addEventListener('mouseenter', showHover);
            b.addEventListener('mouseleave', hideHover);
            b.addEventListener('mousedown', function () { b.style.filter = 'brightness(0.6)'; });
            b.addEventListener('mouseup', function () { b.style.filter = ''; });
        }
        box.appendChild(b);
        mode = 'dom';
        if (!warned) { warned = true; console.warn('[PRAVO][MOBLIC] пункт в круге не встроился — включена запасная кнопка (включите PRAVO_MOBLIC_DEBUG для причин)'); }
        dbg('режим: dom | слот:', slot, '| ник:', lastNick, '| mobile:', !!(window.App && window.App.isMobile));

        // как у остальных кнопок: когда открыта подкатегория — приглушаем (opacity .6)
        syncTimer = setInterval(function () {
            var el = document.getElementById(BTN_ID), v = getVm();
            if (!el || !isOpen()) { cleanup(); return; }
            if (v) el.style.opacity = (v.selectedOption !== null && v.selectedOption !== undefined) ? '0.6' : '1';
        }, 200);
    }

    // Компонент строит секторы асинхронно (после mounted + ответа сервера) — ждём готовности
    function inject(tries) {
        if (!isOpen()) return;
        var box = document.querySelector('.player-interaction__container');
        var vm = getVm();
        var ready = box && vm && vm.k != null && vm.innerRadius != null && vm.menu && vm.menu.length
            && typeof vm.menu[vm.menu.length - 1].x === 'number';
        if (!ready) {
            if (tries < 40) setTimeout(function () { inject(tries + 1); }, 100);
            return;
        }
        if (!canShow(lastNick)) { removeEntry(vm); cleanup(); return; }
        if (tryNative(vm, box)) return;
        injectDom(vm, box);
    }

    // openInterface('PlayerInteraction', params)
    var _oi = window.openInterface;
    window.openInterface = function (name, params) {
        var was = false;
        if (name === 'PlayerInteraction') { try { was = isOpen(); } catch (e) {} }
        var r = _oi.apply(this, arguments);
        if (name === 'PlayerInteraction' && !was) {
            try {
                lastNick = parseNick(params);
                busy = false;
                setTimeout(function () { inject(0); }, 0);
            } catch (e) {}
        }
        return r;
    };

    // updateParams('PlayerInteraction', json) — сервер может обновить меню на лету
    var _up = window.updateParams;
    if (typeof _up === 'function') {
        window.updateParams = function (name, params) {
            var r = _up.apply(this, arguments);
            if (name === 'PlayerInteraction') {
                try {
                    var n = parseNick(params);
                    if (n) lastNick = n;
                    setTimeout(function () { inject(0); }, 250);
                } catch (e) {}
            }
            return r;
        };
    }

    console.log('[PRAVO] ✅ Пункт «Выдача лицензии» в круге PlayerInteraction установлен (' + VERSION + ')');
})();
// ══════════════════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════════════════
// ЧАТ ПРИ ОТКРЫТОМ РАДИАЛЬНОМ МЕНЮ (PlayerInteraction) — Radmir (ПК) и Hassle (мобилка).
//
// Почему чат был тёмным: Hud и PlayerInteraction — два соседних .interface (оба z-index:1), а
// PlayerInteraction в DOM позже, поэтому весь его слой (тёмная подложка круга :after на 600% экрана
// и картинка bg14.png в :before) лежит ВЫШЕ всего Hud, включая чат. Кроме того, при открытии меню
// игра ставит чату «неактивное» состояние (setChatIsInactive(true)) и он выцветает.
//
// Работает ТОЛЬКО пока в круге раскрыт выбор типа лицензии нашего пункта (ровно тогда же, когда
// включаются ники); в остальных меню и в самом круге всё как в игре.
//
// Что делаем:
//   1) штатные :before (bg14) и :after (подложка) круга прячем и рисуем ровно то же самое сами —
//      отдельным слоем ВНУТРИ Hud (в том же .interface, что и чат);
//   2) на время открытого меню поднимаем чату z-index выше нашего слоя. Итог по порядку снизу вверх:
//      остальной Hud → подложка + bg14 → ЧАТ → (слой PlayerInteraction) круг, пункты, сектора.
//      Подложка и bg14 остаются на месте целиком (никаких «дыр»), просто лежат под чатом;
//   3) чат не даём погасить (isInactive), пока меню открыто.
// Никаких файлов игры не трогаем — только pravo.js.
//
// Hassle (мобилка): чат — другой компонент (.chat-container > .chat), и игра вообще прячет его, пока открыт
// PlayerInteraction (hideChat: "mobile" → Hud.setChatStatus(false)). На время выбора лицензии чат
// показываем обратно (Hud.setChatStatus(true)), при возврате в круг — прячем, как в игре.
//
// Настройки:
//   window.PRAVO_CHAT_UNDIM = false — вернуть как в игре (чат затемняется / на мобилке скрыт).
// ══════════════════════════════════════════════════════════════════════════════
(function _pravoChatUnderRadial() {
    if (window.__pravoChatUndim) return;
    window.__pravoChatUndim = true;

    var DIM_ID = 'pravo-pi-dim', STYLE_ID = 'pravo-pi-undim-css', HTML_CLS = 'pravo-pi-undim';
    var Z_DIM = 4000, Z_CHAT = 4001;   // Hud-овские z-index ≤ 10 (кроме окна помощи 9999) — оба выше остального Hud
    var bgUrl = null, lastSig = '';

    function dbg() {
        if (!window.PRAVO_MOBLIC_DEBUG) return;
        try { console.log.apply(console, ['[PRAVO][CHAT]'].concat([].slice.call(arguments))); } catch (e) {}
    }
    function isMobile() { return !!(window.App && window.App.isMobile); }
    function isOpen() { try { return !!window.getInterfaceStatus('PlayerInteraction'); } catch (e) { return false; } }
    // только пока в круге раскрыт выбор типа лицензии (тот же момент, когда включаются ники)
    function enabled() { return window.PRAVO_CHAT_UNDIM !== false && window.__pravoLicPick === true && isOpen(); }
    function getChat() {
        try {
            var hud = window.interface && window.interface('Hud');
            return (hud && hud.$refs && hud.$refs.chat) || null;
        } catch (e) { return null; }
    }
    function getHud() {
        try { return (window.interface && window.interface('Hud')) || null; } catch (e) { return null; }
    }
    // корневой элемент чата: Radmir — .radmir-chat, Hassle — .chat-container (внутри .chat)
    function chatEl() {
        var c = getChat();
        return (c && c.$el && c.$el.nodeType === 1 && c.$el) ||
            document.querySelector('.radmir-chat') || document.querySelector('.chat-container');
    }
    // .interface-обёртка Hud: в ней лежат и чат, и остальной Hud (.hud без z-index контекст не создаёт)
    function hudLayer() {
        var el = chatEl();
        return el ? el.closest('.interface') : null;
    }
    // Hassle (мобилка): игра скрыла чат (hideChat:"mobile") — на время выбора лицензии показываем
    var chatForced = false;
    function forceChatShown() {
        if (!isMobile()) return;
        var hud = getHud();
        if (!hud || typeof hud.setChatStatus !== 'function') return;
        if (hud.chatStatus === false) {
            try { hud.setChatStatus(true); chatForced = true; dbg('чат показан (Hassle)'); } catch (e) {}
        }
    }
    function restoreChatHidden() {
        if (!chatForced) return;
        chatForced = false;
        // вернулись в круг (меню открыто) — прячем чат, как это делает игра; если меню закрыто, чат вернёт сама игра
        if (!isOpen()) return;
        var hud = getHud();
        try { if (hud && typeof hud.setChatStatus === 'function') hud.setChatStatus(false); } catch (e) {}
    }
    function html() { return document.documentElement; }

    (function injectCss() {
        if (document.getElementById(STYLE_ID)) return;
        var st = document.createElement('style');
        st.id = STYLE_ID;
        st.textContent =
            // штатные подложка (:after) и bg14 (:before) круга прячем — вместо них наш слой под чатом
            'html.' + HTML_CLS + ' .player-interaction__container:before,' +
            'html.' + HTML_CLS + ' .player-interaction__container:after{display:none!important}' +
            // чат поднимаем над нашим слоем; z-index из transition:all не анимируем, чтобы чат не «проныривал» под слой
            'html.' + HTML_CLS + ' .radmir-chat{z-index:' + Z_CHAT + '!important;' +
                'transition-property:opacity,left,top,transform!important}' +
            'html.' + HTML_CLS + ' .chat-container>.chat{z-index:' + Z_CHAT + '!important}' +
            // без fade: подмена штатной подложки нашей должна произойти в одном кадре, иначе видно «провал» затемнения
            '#' + DIM_ID + '{position:fixed;left:0;top:0;width:100vw;height:100vh;overflow:hidden;' +
                'pointer-events:none;z-index:' + Z_DIM + '}' +
            '#' + DIM_ID + ' .pravo-pi-bg{position:absolute}';
        (document.head || document.documentElement).appendChild(st);
    })();

    // Пока меню открыто, чат не должен выцветать (в том числе по 20-секундному таймеру неактивности)
    function keepChatActive() {
        var c = getChat();
        if (!c || !c.isInactive) return;
        try {
            if (typeof c.clearInactiveTimeout === 'function') c.clearInactiveTimeout();
            c.isInactive = false;
        } catch (e) {}
    }

    // Адрес bg14.png берём у самого круга (хэш в имени файла у сборок разный)
    function readBgUrl(box) {
        try {
            var bg = getComputedStyle(box, '::before').backgroundImage || '';
            var m = /url\((['"]?)(.*?)\1\)/.exec(bg);
            return m ? m[2] : null;
        } catch (e) { return null; }
    }

    // Убираем наш слой и возвращаем штатные :before/:after в ТОМ ЖЕ кадре — без промежутка без затемнения
    function teardown() {
        var dim = document.getElementById(DIM_ID);
        if (dim && dim.parentNode) dim.parentNode.removeChild(dim);
        html().classList.remove(HTML_CLS);
        lastSig = '';
        restoreChatHidden();
        // вернулись в круг (меню открыто) — чат снова «неактивный», как в игре
        if (isOpen() && !chatForced && !isMobile() && window.PRAVO_CHAT_UNDIM !== false && typeof window.setChatIsInactive === 'function') {
            try { window.setChatIsInactive(true); } catch (e) {}
        }
        dbg('слой убран');
    }

    function tick() {
        if (!enabled()) {
            if (document.getElementById(DIM_ID) || html().classList.contains(HTML_CLS)) teardown();
            return;
        }
        keepChatActive();
        forceChatShown();
        var box = document.querySelector('.player-interaction__container');
        var host = hudLayer();
        if (!box || !host) return;                   // чата/круга ещё нет — остаётся штатное поведение игры
        var cr = box.getBoundingClientRect();
        if (!cr.width || !cr.height) return;
        if (!bgUrl) bgUrl = readBgUrl(box);          // читаем ДО того, как спрячем штатный :before
        if (!bgUrl) return;                          // не смогли прочитать — ничего не ломаем

        var dim = document.getElementById(DIM_ID);
        if (dim && dim.parentNode !== host) { dim.parentNode && dim.parentNode.removeChild(dim); dim = null; }
        if (!dim) {
            dim = document.createElement('div');
            dim.id = DIM_ID;
            var bg = document.createElement('div');
            bg.className = 'pravo-pi-bg';
            dim.appendChild(bg);
            host.appendChild(dim);
            lastSig = '';
            dbg('слой создан');
        }
        html().classList.add(HTML_CLS);              // штатные :before/:after прячутся тем же кадром, в котором уже есть наш слой (ниже стили считаются синхронно)

        var vh = window.innerHeight, vhp = vh / 100;
        var cx = cr.left + cr.width / 2, cy = cr.top + cr.height / 2;
        var sig = [Math.round(cx), Math.round(cy), Math.round(cr.width), window.innerWidth, vh].join(',');
        if (sig === lastSig) return;
        lastSig = sig;

        // 1) подложка: тот же радиальный градиент, что у штатного :after (50% от 600% ширины круга = 3 ширины)
        var R = Math.round(cr.width * 3);
        dim.style.background = 'radial-gradient(circle ' + R + 'px at ' + Math.round(cx) + 'px ' + Math.round(cy) + 'px,' +
            '#141414e6 30%,#141414cc 40%,#141414b3 50%,#14141499 60%,#14141480 70%)';

        // 2) bg14.png: тот же размер (106.5vh) и по центру круга, как штатный :before
        var b = dim.firstChild, bW = 106.5 * vhp;
        b.style.width = bW + 'px';
        b.style.height = bW + 'px';
        b.style.left = Math.round(cx - bW / 2) + 'px';
        b.style.top = Math.round(cy - bW / 2) + 'px';
        b.style.background = 'url("' + bgUrl + '") 50%/cover no-repeat';

        dbg('слой обновлён: центр', Math.round(cx) + ',' + Math.round(cy), '| R', R, '| bg14', Math.round(bW) + 'px');
    }

    // setChatIsInactive(true) от самого PlayerInteraction (mounted) — гасим, пока меню открыто
    (function hookInactive() {
        var orig = window.setChatIsInactive;
        if (typeof orig !== 'function' || orig.__pravoUndim) return;
        var wrapped = function (e) {
            try {
                if (e && enabled()) {
                    var r = orig.call(this, false);
                    var c = getChat();
                    if (c && typeof c.clearInactiveTimeout === 'function') c.clearInactiveTimeout();
                    return r;
                }
            } catch (er) { dbg('setChatIsInactive:', er); }
            return orig.apply(this, arguments);
        };
        wrapped.__pravoUndim = true;
        window.setChatIsInactive = wrapped;
    })();

    // Мгновенная подмена: её дёргает блок кнопки лицензии в момент, когда выбор раскрылся / закрылся
    window.__pravoChatSync = function () { try { lastSig = ''; tick(); } catch (e) { dbg('sync:', e); } };

    // Быстрые тики сразу после открытия меню (контейнер строится асинхронно), дальше — по интервалу
    var _oi = window.openInterface;
    window.openInterface = function (name) {
        var r = _oi.apply(this, arguments);
        if (name === 'PlayerInteraction') {
            lastSig = '';
            [30, 120, 300].forEach(function (ms) { setTimeout(tick, ms); });
            if (window.PRAVO_MOBLIC_DEBUG) setTimeout(function () { if (isOpen()) window.pravoChatProbe(); }, 700);
        }
        return r;
    };
    // Закрытие меню: слой гасим сразу (иначе он провисит до ближайшего тика)
    var _ci = window.closeInterface;
    if (typeof _ci === 'function') {
        window.closeInterface = function (name) {
            var r = _ci.apply(this, arguments);
            if (name === 'PlayerInteraction') { try { teardown(); } catch (e) {} }
            return r;
        };
    }
    setInterval(tick, 250);

    // ── Диагностика ────────────────────────────────────────────────────────────────────────────
    // window.pravoChatProbe() — вручную; при window.PRAVO_MOBLIC_DEBUG = true запускается сама через 700 мс
    // после открытия круга. Пишет в консоль с префиксом [PRAVO][PROBE].
    window.pravoChatProbe = function () {
        try {
            var L = function () { console.log.apply(console, ['[PRAVO][PROBE]'].concat([].slice.call(arguments))); };
            var chat = chatEl(), dim = document.getElementById(DIM_ID);
            var box = document.querySelector('.player-interaction__container');
            var cs = chat && getComputedStyle(chat);
            L('круг открыт:', isOpen(), '| выбор лицензии раскрыт:', window.__pravoLicPick === true, '| html-класс:', html().classList.contains(HTML_CLS),
              '| bg14:', bgUrl ? 'url найден' : 'url НЕ найден', '| isInactive:', (getChat() || {}).isInactive);
            var chatZ = chat && (chat.querySelector(':scope > .chat') || chat);
            L('платформа:', isMobile() ? 'Hassle (мобилка)' : 'ПК', '| чат:', chat ? chat.className : 'НЕ НАЙДЕН',
              '| chatStatus:', (getHud() || {}).chatStatus, '| показан нами:', chatForced);
            L('чат: z=' + (chatZ ? getComputedStyle(chatZ).zIndex : '—'), 'opacity=' + (cs ? cs.opacity : '—'),
              '| в .interface:', !!(chat && chat.closest('.interface')));
            if (dim) {
                var dc = getComputedStyle(dim);
                L('слой: z=' + dc.zIndex, 'opacity=' + dc.opacity, '| в одном .interface с чатом:',
                  !!(chat && dim.parentNode === chat.closest('.interface')));
            } else L('нашего слоя НЕТ в DOM');
            if (box) L('штатные :before/:after круга скрыты:',
                getComputedStyle(box, '::before').display === 'none' && getComputedStyle(box, '::after').display === 'none');
            if (chat && chat.getBoundingClientRect().width > 1) {
                var r = chat.getBoundingClientRect();
                var els = document.elementsFromPoint(r.left + 30, r.top + 14);
                L('сверху вниз над чатом:', els.slice(0, 8).map(function (e) {
                    return e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') +
                        (e.className && e.className.baseVal === undefined && e.className ? '.' + String(e.className).trim().split(/\s+/)[0] : '');
                }).join(' > '));
            }
        } catch (e) { try { console.log('[PRAVO][PROBE] ошибка:', e); } catch (_) {} }
    };

    console.log('[PRAVO] ✅ Чат над затемнением радиального меню при выборе лицензии (Radmir + Hassle) установлен');
})();
// ══════════════════════════════════════════════════════════════════════════════

// ══════ Кнопка авто-ответа «Нахожусь в правительстве» у входящих SMS ══════
var PRAVO_SMS_BTN_ENABLED = true;
var PRAVO_SMS_TEXT = 'Здравствуйте, нахожусь в правительстве [/gps - Правительство]'; // текст пункта «Место»
// Пункты, в которые раскрывается кнопка SMS: подпись -> что отправить в /sms
var PRAVO_SMS_LABEL_PLACE = 'Место';
var PRAVO_SMS_LABEL_PRICE = 'Ценовая политика';
// Текст «Ценовой политики» собирается из _GIVE_LIC_TYPES (те же цены, что в меню выдачи). Хочешь свой текст - впиши строку сюда.
var PRAVO_SMS_TEXT_PRICE = '';
// ── Отправка SMS с разбиением на части и очередью ─────────────────────────────
// Сервер отвечает «Слишком длинное сообщение», если текст SMS длинный: 61 символ проходил, 80 - нет (точный лимит /sms в дампе мода не найден).
// Поэтому режем на части <= PRAVO_SMS_MAX_LEN и шлём подряд. Если снова увидите «Слишком длинное сообщение» - уменьшите число.
var PRAVO_SMS_MAX_LEN = 61;
var PRAVO_SMS_PART_DELAY = 700; // мс между частями (как PRAVO_CHAT_PART_DELAY у обычного чата); плюс ждём по модели антифлуда
var _pravoSmsQueue = [];
var _pravoSmsBusy = false;
var _pravoSmsLastAt = 0;

// Режем по ", " (запятая остаётся в конце строки); слишком длинный кусок без запятых - общим резаком по словам
function _pravoSmsSplit(text, max) {
    text = String(text == null ? '' : text).trim();
    max = max || PRAVO_SMS_MAX_LEN;
    if (text.length <= max) return text ? [text] : [];
    var toks = text.split(', '), parts = [], cur = '';
    for (var i = 0; i < toks.length; i++) {
        var piece = toks[i] + (i < toks.length - 1 ? ',' : '');
        var cand = cur ? cur + ' ' + piece : piece;
        if (cand.length <= max) { cur = cand; continue; }
        if (cur) parts.push(cur);
        cur = piece;
        if (cur.length > max) {
            var sub = _pravoSplitChat(cur, max);
            cur = sub.pop() || '';
            parts = parts.concat(sub);
        }
    }
    if (cur) parts.push(cur);
    return parts;
}
function _pravoSmsDrain() {
    if (_pravoSmsBusy) return;
    _pravoSmsBusy = true;
    (function next() {
        if (!_pravoSmsQueue.length) { _pravoSmsBusy = false; return; }
        var now = Date.now();
        var gap = Math.max(0, PRAVO_SMS_PART_DELAY - (now - _pravoSmsLastAt)); // пауза между частями
        var fw = _pravoFloodWait(1);                                            // антифлуд сервера (3000/1000 за команду)
        var w = Math.max(gap, fw);
        if (w > 0) {
            if (fw >= 700) { try { gtAdd('~y~Антифлуд~n~~w~SMS через ' + (fw / 1000).toFixed(1) + ' с', Math.min(fw + 300, 2500), 3); } catch (_) {} }
            setTimeout(next, w + 5);
            return;
        }
        var job = _pravoSmsQueue.shift();
        _pravoSendCmd('/sms ' + job.number + ' ' + job.text);
        _pravoSmsLastAt = Date.now();
        setTimeout(next, PRAVO_SMS_PART_DELAY);
    })();
}
function _pravoSmsSend(number, text) {
    var parts = _pravoSmsSplit(text, PRAVO_SMS_MAX_LEN);
    for (var i = 0; i < parts.length; i++) _pravoSmsQueue.push({ number: number, text: parts[i] });
    try { console.log('[PRAVO][SMS] -> ' + number + ': ' + parts.length + ' сообщ.', parts); } catch (_) {}
    _pravoSmsDrain();
}

function _pravoSmsPriceText() {
    if (PRAVO_SMS_TEXT_PRICE) return PRAVO_SMS_TEXT_PRICE;
    try {
        var parts = _GIVE_LIC_TYPES.map(function (t) { return t.name + ' ' + Math.round(t.price / 1000) + 'к'; });
        return 'Ценовая политика: ' + parts.join(', ');
    } catch (e) {
        return 'Ценовая политика: Права 10к, Проф. права 40к, Оружие 85к, Рыбалка 40к, Охота 65к';
    }
}
// Входящее: "SMS: текст | Отправитель: {v:Ник} [т.333351]"; группа 1 = номер
var PRAVO_SMS_RE = /SMS:.*\|\s*Отправитель:.*?\[т\.(\d+)\]/;
var PRAVO_SMS_ACTION = 9001; // числовой id: парсер чата принимает только {btn:число:число:число}
var PRAVO_SMS_ICON = 4;      // id иконки кнопки. В Hud.js есть только 0..3 (0 = трубка), у 4 иконки нет -> рисуем текст «SMS»
var PRAVO_SMS_LABEL = 'Ответ'; // надпись на кнопке (закрыто: стрелка вниз = можно открыть)
var PRAVO_SMS_LABEL_CLOSE = 'Закрыть'; // надпись, пока выбор раскрыт (стрелка вверх = можно закрыть)
var PRAVO_SMS_OPT_SCALE = 1; // размер кнопок «Место / Ценовая политика» относительно «Ответ» / «Закрыть» (1 = одинаковые)
var PRAVO_SMS_OPT_LINE = 1.15; // высота кнопок выбора в размерах шрифта (так движок рисует «Ответ»: ~19px при шрифте ~16.8px); выросла/упала разница - подправьте
var PRAVO_SMS_OUTLINE_COLOR = 'rgba(255,255,255,.65)'; // цвет контура вокруг сообщения + кнопок при раскрытии ('' = без контура)
var PRAVO_SMS_OUTLINE_RADIUS = '1.4vh'; // скругление углов рамки
var PRAVO_SMS_MENU_TIMEOUT = 30000; // мс: через сколько авто-свернуть раскрытый выбор, если ничего не нажали (0 = не сворачивать)
var PRAVO_SMS_MOBILE_SCALE = 2; // Хасл: во сколько раз кнопка больше, чем стандартная мобильная (2.78vh)
var PRAVO_SMS_PC_SCALE = 1.5;    // ПК: во сколько раз кнопка больше штатного кружка (1.85vh); 1.5 = 2.78vh
var PRAVO_SMS_HOVER_INVERT = true; // при наведении: белый фон + чёрный текст (как у штатных кнопок чата); false = без подсветки

// ── Стили кнопки «SMS» (вместо круглой иконки-трубки) ─────────────────────────
(function _pravoSmsBtnStyle() {
    var id = 'pravo-sms-btn-css';
    if (document.getElementById(id)) return;
    var pcH = 1.85 * PRAVO_SMS_PC_SCALE;              // высота на ПК (штатный кружок 1.85vh * scale)
    var mbH = 2.78 * PRAVO_SMS_MOBILE_SCALE;          // высота на Хасле (штатные 2.78vh * scale)
    var cssOpt = function (h) {
        return 'height:auto!important;min-width:' + (h * 1.85).toFixed(2) + 'vh!important;' +
               'padding:0 ' + (h * 0.38).toFixed(2) + 'vh!important;border-radius:' + (h / 2).toFixed(2) + 'vh!important;' +
               'font-size:' + (h * 0.56).toFixed(2) + 'vh!important;line-height:' + PRAVO_SMS_OPT_LINE + '!important;';
    };
    var css = function (h) {
        return 'height:' + h + 'vh!important;min-width:' + (h * 1.85).toFixed(2) + 'vh!important;' +
               'padding:0 ' + (h * 0.38).toFixed(2) + 'vh!important;border-radius:' + (h / 2).toFixed(2) + 'vh!important;' +
               'font-size:' + (h * 0.56).toFixed(2) + 'vh!important;';
    };
    var s = document.createElement('style');
    s.id = id;
    s.textContent =
        '.chat-message-content__action.pravo-sms-btn{' + css(pcH) +
            'box-sizing:border-box;background:rgba(255,255,255,.25);color:inherit;font-weight:700;line-height:1;' +
            'letter-spacing:.05em;font-family:"Open Sans",var(--fallback-font),sans-serif;user-select:none;-webkit-user-select:none;}' +
        (PRAVO_SMS_HOVER_INVERT ? '.chat-message-content__action.pravo-sms-btn:hover{background:#fff;color:#000;}' : '') +
        '.chat-message-content__action.pravo-sms-btn>*{display:none!important;}' +
        // подпись + стрелка-треугольник (рисуется границами, не глифом - в шрифте чата может не быть символов-стрелок)
        '.chat-message-content__action.pravo-sms-btn::before{content:"' + PRAVO_SMS_LABEL + '";}' +
        '.chat-message-content__action.pravo-sms-btn::after{content:"";display:block;width:0;height:0;margin-left:.45em;' +
            'border-left:.36em solid transparent;border-right:.36em solid transparent;border-top:.46em solid currentColor;}' +
        // раскрыто: «Закрыть» + стрелка вверх + подсветка (белая заливка, как при наведении)
        '.chat-message-content__action.pravo-sms-btn.pravo-sms-btn--open{background:#fff;color:#000;}' +
        '.chat-message-content__action.pravo-sms-btn.pravo-sms-btn--open::before{content:"' + PRAVO_SMS_LABEL_CLOSE + '";}' +
        '.chat-message-content__action.pravo-sms-btn.pravo-sms-btn--open::after{border-top:0;border-bottom:.46em solid currentColor;}' +
        '.chat-message-content__action.pravo-sms-btn.pravo-sms-btn--mobile{' + css(mbH) + '}' +
        // раскрытый выбор - отдельная строка под сообщением; вид тот же, что у кнопки «Ответ» (свои элементы без data-v -> штатные стили чата не действуют)
        '.pravo-sms-menu{display:flex;align-items:center;flex-wrap:wrap;box-sizing:border-box;padding:.3vh .6vh .35vh;color:#fff;font-weight:700;}' +
        // контур: сообщение (верх+бока) и строка кнопок (бока+низ) = одна скруглённая рамка из настоящих границ (углы ровные).
        // Ширину обеих частей выставляет _pravoSmsFit() по реальным размерам
        (PRAVO_SMS_OUTLINE_COLOR ?
            '.chat-message.pravo-sms-row--active{background-color:rgba(255,255,255,.08)!important;border:.16vh solid ' + PRAVO_SMS_OUTLINE_COLOR + '!important;border-bottom:0!important;' +
                'border-radius:' + PRAVO_SMS_OUTLINE_RADIUS + ' ' + PRAVO_SMS_OUTLINE_RADIUS + ' 0 0!important;}' +
            '.pravo-sms-menu.pravo-sms-menu--attached{background-color:rgba(255,255,255,.08);border:.16vh solid ' + PRAVO_SMS_OUTLINE_COLOR + ';border-top:0;' +
                'border-radius:0 0 ' + PRAVO_SMS_OUTLINE_RADIUS + ' ' + PRAVO_SMS_OUTLINE_RADIUS + ';}'
        : '') +
        // кнопки выбора = тот же вид, что у «Ответ / Закрыть»: тот же шрифт, отступы, скругление, межбуквенный интервал, обводка текста.
        // Высоту НЕ задаём: у «Ответ» (она внутри строки чата) движок игнорирует height и берёт высоту по шрифту, поэтому и тут высота по шрифту.
        '.pravo-sms-opt{' + cssOpt(pcH * PRAVO_SMS_OPT_SCALE) +
            'display:inline-flex;align-items:center;justify-content:center;cursor:pointer;margin-right:.6vh;position:relative;' +
            'box-sizing:border-box;white-space:nowrap;background:rgba(255,255,255,.25);color:#fff;font-weight:700;' +
            'letter-spacing:.05em;font-family:"Open Sans",var(--fallback-font),sans-serif;user-select:none;-webkit-user-select:none;transition:all .25s ease;' +
            'text-shadow:-0.05vw -0.05vw 0 #000,0 -0.05vw 0 #000,0.05vw -0.05vw 0 #000,0.05vw 0 0 #000,0.05vw 0.05vw 0 #000,0 0.05vw 0 #000,-0.05vw 0.05vw 0 #000,-0.05vw 0 0 #000;}' +
        '.pravo-sms-opt.pravo-sms-opt--mobile{' + cssOpt(mbH * PRAVO_SMS_OPT_SCALE) + '}' +
        '.pravo-sms-opt:hover{background:#fff;color:#000;}' +
        // сообщение в одну строку не переносим: «Ответ» -> «Закрыть» длиннее, иначе кнопка уезжает на вторую строку
        '.chat-message.pravo-sms-row--nowrap .chat-message-content{white-space:nowrap!important;}';
    document.head.appendChild(s);
})();

// Помечаем кнопки SMS в чате: у них нет иконки (id PRAVO_SMS_ICON не существует) и рядом текст «SMS:»
function _pravoMarkSmsBtns(root) {
    try {
        var scope = (root && root.querySelectorAll) ? root : document;
        var imgs = scope.querySelectorAll('.chat-message-content__action-image');
        var mobile = !!(window.App && window.App.isMobile);
        for (var i = 0; i < imgs.length; i++) {
            var src = imgs[i].getAttribute('src');
            if (src && !/undefined$/.test(src)) continue;         // у обычных кнопок иконка есть
            var btn = imgs[i].parentNode;
            if (!btn || !btn.classList || btn.classList.contains('pravo-sms-btn')) continue;
            var p = btn.parentNode;
            if (!p || String(p.textContent || '').indexOf('SMS:') === -1) continue;
            btn.classList.add('pravo-sms-btn');
            if (mobile) btn.classList.add('pravo-sms-btn--mobile');
        }
    } catch (e) {}
}
(function _pravoSmsBtnObserver() {
    var tries = 0;
    (function start() {
        if (!document.body) { if (++tries < 100) setTimeout(start, 100); return; }
        try {
            new MutationObserver(function (muts) {
                for (var i = 0; i < muts.length; i++) {
                    var added = muts[i].addedNodes;
                    for (var j = 0; j < added.length; j++) {
                        if (added[j].nodeType === 1) _pravoMarkSmsBtns(added[j]);
                    }
                }
            }).observe(document.body, { childList: true, subtree: true });
        } catch (e) {}
        _pravoMarkSmsBtns(document);
    })();
})();

// ── Раскрытие кнопки SMS в выбор «Место / Ценовая политика» ───────────────────
var _pravoSmsLastBtn = null; // кнопка SMS, по которой кликнули (DOM-элемент); значение номера придёт в onChatMessageAction

function _pravoSmsCollapse(menu) {
    try {
        if (!menu) return;
        if (menu._pravoTimer) { clearTimeout(menu._pravoTimer); menu._pravoTimer = 0; }
        var btn = menu._pravoBtn;
        if (btn) { btn._pravoMenu = null; if (btn.classList) btn.classList.remove('pravo-sms-btn--open'); }
        if (menu._pravoRow && menu._pravoRow.classList) {
            var r = menu._pravoRow;
            r.classList.remove('pravo-sms-row--active');
            r.classList.remove('pravo-sms-row--nowrap');
            r.style.width = r.style.boxSizing = r.style.paddingLeft = r.style.paddingRight = '';
            r.style.flexGrow = r.style.flexShrink = r.style.alignSelf = '';
        }
        if (menu.parentNode) menu.parentNode.removeChild(menu);
    } catch (e) {}
}
function _pravoSmsCollapseAll() {
    try {
        var menus = document.querySelectorAll('.pravo-sms-menu');
        for (var i = 0; i < menus.length; i++) _pravoSmsCollapse(menus[i]);
    } catch (e) {}
}
// Строка сообщения чата (flex: время + текст), под которой показываем выбор
function _pravoSmsRow(btn) {
    var el = btn;
    for (var i = 0; i < 6 && el && el.parentNode; i++) {
        if (el.classList && el.classList.contains('chat-message')) return el;
        el = el.parentNode;
    }
    return null;
}
// Подгоняем рамку: одна скруглённая рамка по ширине самого длинного из двух - сообщения или строки кнопок (а не на весь чат).
// Размеры берём из getBoundingClientRect (экранные px) и переводим в px вёрстки через эталон: у чата может быть scale/transform.
function _pravoSmsFit(row, menu, btn) {
    try {
        if (!PRAVO_SMS_OUTLINE_COLOR || !row || !menu || !menu.parentNode) return;
        var kids = row.children, lastR = kids && kids.length ? kids[kids.length - 1] : null;
        var lastM = menu.lastElementChild;
        if (!lastR || !lastM) return;
        // 1) масштаб чата (экранные px -> px вёрстки): отношение экранной ширины строки к её offsetWidth; без масштаба = 1
        var scale = 1;
        try {
            var _rw = row.getBoundingClientRect().width, _ow = row.offsetWidth;
            if (_rw > 0 && _ow > 0) scale = _rw / _ow;
            if (!(scale > 0.4 && scale < 2.5) || Math.abs(scale - 1) < 0.03) scale = 1;
        } catch (_) { scale = 1; }
        // 2) естественные ширины (до наших отступов)
        var rr = row.getBoundingClientRect(), mm = menu.getBoundingClientRect();
        var lr = lastR.getBoundingClientRect(), lm = lastM.getBoundingClientRect();
        var padM = parseFloat(getComputedStyle(menu).paddingLeft) || 0;
        var padR = padM;
        var bw = parseFloat(getComputedStyle(row).borderLeftWidth) || 0; // толщина границы рамки
        var mR = parseFloat(getComputedStyle(lastM).marginRight) || 0;
        var w1 = (lr.right - rr.left) / scale + padR * 2 + bw * 2; // сообщение
        var w2 = (lm.right - mm.left) / scale + mR + padM + bw * 2; // кнопки
        // 2b) подпись «Ответ» -> «Закрыть» длиннее на ~2 буквы, а движок пересчитывает её не сразу.
        //     Движок отдаёт размеры прошлого кадра (с подписью «Ответ»), поэтому запас закладываем вручную, иначе «Закрыть» не влезает и переносится вниз.
        var reserve = 0;
        try {
            var bfs = parseFloat(getComputedStyle(btn).fontSize) || 16;
            reserve = Math.max(0, PRAVO_SMS_LABEL_CLOSE.length - PRAVO_SMS_LABEL.length) * bfs * 0.62;
        } catch (_) {}
        w1 += reserve;
        var full = rr.width / scale;                        // ширина списка сообщений
        var W = Math.ceil(Math.max(w1, w2)) + 4;            // +4px запаса: иначе из-за округления текст/кнопки могут перенестись
        if (full > 0) W = Math.min(W, Math.floor(full));
        try { console.log('[PRAVO][SMS] рамка: scale=' + scale.toFixed(3) + ' сообщение=' + Math.round(w1) + ' (запас ' + Math.round(reserve) + ') кнопки=' + Math.round(w2) + ' список=' + Math.round(full) + ' -> ' + W + 'px'); } catch (_) {}
        if (!(W > 0)) return;
        // 3) обе части одной ширины = одна рамка
        row.style.boxSizing = 'border-box';
        row.style.paddingLeft = padR + 'px';
        row.style.paddingRight = padR + 'px';
        row.style.width = W + 'px';
        row.style.flexGrow = '0'; row.style.flexShrink = '0'; row.style.alignSelf = 'flex-start';
        menu.style.width = W + 'px';
        menu.style.flexWrap = 'nowrap';
        menu.style.flexGrow = '0'; menu.style.flexShrink = '0'; menu.style.alignSelf = 'flex-start';
        // 4) сообщение, которое и так умещалось в одну строку, держим в одну строку; длинные (в несколько строк) переносятся как обычно
        if (full > 0 && w1 + 40 < full) row.classList.add('pravo-sms-row--nowrap');
    } catch (e) { try { console.log('[PRAVO][SMS] ошибка подгонки рамки', e); } catch (_) {} }
}
function _pravoSmsExpand(btn, number) {
    try {
        if (!btn || !btn.parentNode) return false;
        // повторный клик по «Ответ» сворачивает выбор
        if (btn._pravoMenu && btn._pravoMenu.parentNode) { _pravoSmsCollapse(btn._pravoMenu); return true; }
        _pravoSmsCollapseAll(); // одновременно раскрыта только одна кнопка
        var mobile = btn.classList.contains('pravo-sms-btn--mobile');
        var menu = document.createElement('div');
        menu.className = 'pravo-sms-menu';
        menu._pravoBtn = btn;
        var opts = [
            { label: PRAVO_SMS_LABEL_PLACE, text: function () { return PRAVO_SMS_TEXT; } },
            { label: PRAVO_SMS_LABEL_PRICE, text: _pravoSmsPriceText }
        ];
        opts.forEach(function (o) {
            var b = document.createElement('span');
            b.className = 'pravo-sms-opt' + (mobile ? ' pravo-sms-opt--mobile' : '');
            b.textContent = o.label;
            b.addEventListener('click', function (ev) {
                try { ev.stopPropagation(); ev.preventDefault(); } catch (_) {}
                try { _pravoSmsSend(number, o.text()); } catch (e) {
                    try { console.log('[PRAVO] SMS: ошибка отправки', e); } catch (_) {}
                }
                _pravoSmsCollapse(menu); // отправили -> выбор убирается, остаётся одна кнопка «Ответ»
            });
            menu.appendChild(b);
        });
        btn.classList.add('pravo-sms-btn--open'); // «Закрыть» + стрелка вверх (до замеров рамки: подпись меняет ширину)
        var row = _pravoSmsRow(btn);
        if (row && row.parentNode) {
            row.parentNode.insertBefore(menu, row.nextSibling); // отдельной строкой под сообщением
            row.classList.add('pravo-sms-row--active');        // контур вокруг «своего» сообщения + строки кнопок
            menu.classList.add('pravo-sms-menu--attached');
            menu._pravoRow = row;
            _pravoSmsFit(row, menu, btn);
        } else btn.parentNode.appendChild(menu);
        btn._pravoMenu = menu;
        if (PRAVO_SMS_MENU_TIMEOUT > 0) menu._pravoTimer = setTimeout(function () { _pravoSmsCollapse(menu); }, PRAVO_SMS_MENU_TIMEOUT);
        return true;
    } catch (e) { return false; }
}
// Запоминаем, по какой именно кнопке SMS кликнули (capture: срабатывает раньше обработчика Vue)
(function _pravoSmsClickTracker() {
    var tries = 0;
    (function start() {
        if (!document.body) { if (++tries < 100) setTimeout(start, 100); return; }
        document.addEventListener('click', function (e) {
            try {
                var t = e.target;
                _pravoSmsLastBtn = (t && t.closest) ? t.closest('.pravo-sms-btn') : null;
            } catch (_) { _pravoSmsLastBtn = null; }
        }, true);
    })();
})();

function _pravoAddSmsButton(message) {
    try {
        if (!PRAVO_SMS_BTN_ENABLED || typeof message !== 'string') return message;
        if (!_isLicensorRank()) return message;
        if (message.indexOf('{btn:') !== -1) return message; // уже есть кнопка
        var m = message.match(PRAVO_SMS_RE);
        if (!m) return message;
        return message + ' {btn:' + PRAVO_SMS_ICON + ':' + PRAVO_SMS_ACTION + ':' + m[1] + '}';
    } catch (e) { return message; }
}

(function _pravoHookChatAction() {
    var tries = 0;
    (function hook() {
        var orig = window.onChatMessageAction;
        if (typeof orig !== 'function') {
            if (++tries < 100) setTimeout(hook, 100);
            return;
        }
        window.onChatMessageAction = function (button, action, value) {
            if (String(action) === String(PRAVO_SMS_ACTION)) {
                var _b = _pravoSmsLastBtn; _pravoSmsLastBtn = null;
                // Раскрываем выбор «Место / Ценовая политика»; если кнопку в DOM не нашли - шлём «Место» как раньше
                if (!_pravoSmsExpand(_b, value)) _pravoSmsSend(value, PRAVO_SMS_TEXT);
                return;
            }
            return orig.apply(this, arguments);
        };
    })();
})();

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
                // Сервер сказал «Не флудите» — подтягиваем модель антифлуда к реальному счётчику
                if (message.includes('Пожалуйста, подождите несколько секунд')) _pravoFloodServerSaid(true);
                else if (message.includes('Не флудите')) _pravoFloodServerSaid(false);
                if (message.includes('отказался от Вашего предложения') ||
                    message.includes('слишком далеко') ||   // сервер: "Игрок находится слишком далеко"
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

                // ── Авто-сообщение о штрафах после /givelic ──────────────────────────
                if (message.includes('У человека есть неоплаченные штрафы') && _lastGiveLicData) {
                    const _fId = _lastGiveLicData.targetId;
                    setTimeout(() => {
                        // Пытаемся взять ник из списка игроков, фолбэк — "Жетон ID"
                        const _fNickRaw = getNickByIdFromList(_fId);
                        const _fAddr   = _fNickRaw
                            ? _fNickRaw.split('_').join(' ')   // Ivan_Petrov → Ivan Petrov
                            : `Жетон ${_fId}`;
                        const _fMsg = `${_fAddr}, у вас имеются неоплаченные штрафы. Оплатить их можно в любом банкомате`;
                        if (typeof __mvdPrevSendChatInput === "function") {
                            __mvdPrevSendChatInput(_fMsg);
                        } else {
                            engine.trigger("SendChatInput", _fMsg);
                        }
                        console.log(`[PRAVO] 💬 Отправлено уведомление о штрафах → ${_fAddr} (ID ${_fId})`);
                    }, 300);
                }
                // ── «Просьба о чае»: сервер подтвердил выдачу (покупатель принял оффер) ──
                // Пример: Вы выдали "Лицензия на ношение и хранение оружия" игроку Allishka_Holod за 85.000 руб
                // Формат в исходнике мода (offer.pwn): Вы выдали лицензию `Название` игроку Ник за N руб — тоже ловим
                if (window.PRAVO_TEA_ASK === true && message.includes('Вы выдали')) {
                    try {
                        const _tm = message.replace(/\{[0-9a-fA-F]{6}\}/g, '')
                            .match(/Вы выдали\s+(?:лицензию\s+)?["«“`'][^"»”`']+["»”`']\s+игроку\s+(\S+)\s+за\s+[\d.\s]+\s*руб/i);
                        if (_tm && _isLicensorRank()) {
                            const _tNick = _tm[1];
                            const _tNow = Date.now();
                            // защита от дубля одного и того же сообщения
                            if (!(window._pravoTeaLast && window._pravoTeaLast.nick === _tNick && _tNow - window._pravoTeaLast.t < 5000)) {
                                window._pravoTeaLast = { nick: _tNick, t: _tNow };
                                const _tText = '/n ' + String(window.PRAVO_TEA_TEXT).split('{nick}').join(_tNick);
                                const _tSend = () => {
                                    const _w = _pravoFloodWait(1);   // антифлуд: не раздуваем счётчик
                                    if (_w > 0) { setTimeout(_tSend, _w + 5); return; }
                                    _pravoSendCmd(_tText);
                                    console.log('[PRAVO] ☕ Просьба о чае → ' + _tNick);
                                };
                                setTimeout(_tSend, 1500);
                            }
                        }
                    } catch (_te) {}
                }
                // ── Авто-сообщение о запрете на покупку лицензии на оружие ──────────
                // FIX: раньше условие было includes('наложен запрет на покупку лицензии на оружие') —
                // это совпадало и с ЭХОМ нашего же сообщения в чате («на вас наложен запрет...»),
                // отсюда цикл: своё сообщение → эхо → новое сообщение → ... → «Не флудите».
                // Теперь реагируем только на системную строку сервера «У покупателя наложен запрет...»,
                // не на строки чата игроков (они кончаются на «(Ник)[id]»), плюс кулдаун.
                const _bClean = message.replace(/\{[0-9a-fA-F]{6}\}/g, '');
                if (_bClean.includes('У покупателя наложен запрет на покупку лицензии на оружие') &&
                    !/\(\S+\)\[\d+\]\s*$/.test(_bClean) &&
                    _lastGiveLicData &&
                    !(window._pravoBanMsgAt && Date.now() - window._pravoBanMsgAt < 8000)) {
                    window._pravoBanMsgAt = Date.now();
                    const _bId = _lastGiveLicData.targetId;
                    const _bHoursMatch = _bClean.match(/Осталось\s+(\d+)\s+час/i);
                    const _bHours = _bHoursMatch ? _bHoursMatch[1] : null;
                    setTimeout(() => {
                        const _bNickRaw = getNickByIdFromList(_bId);
                        const _bAddr = _bNickRaw
                            ? _bNickRaw.split('_').join(' ')
                            : `Жетон ${_bId}`;
                        const _bMsg = `${_bAddr}, на вас наложен запрет на покупку лицензии на оружие` +
                            (_bHours ? `. Осталось ${_bHours} час(а)` : '');
                        if (typeof __mvdPrevSendChatInput === "function") {
                            __mvdPrevSendChatInput(_bMsg);
                        } else {
                            engine.trigger("SendChatInput", _bMsg);
                        }
                        console.log(`[PRAVO] 💬 Отправлено уведомление о запрете лицензии → ${_bAddr} (ID ${_bId})`);
                    }, 300);
                }
                // ── Авто-ответ: недостаточно денег / лицензия уже есть ──────────────
                if (_lastGiveLicData &&
                    (message.includes('У покупателя недостаточно денег') ||
                     message.includes('У покупателя уже есть этот тип лицензии'))) {
                    const _ld = _lastGiveLicData;
                    const _noMoney = message.includes('У покупателя недостаточно денег');
                    setTimeout(() => {
                        const _nickRaw = getNickByIdFromList(_ld.targetId);
                        const _addr = _nickRaw ? _nickRaw.split('_').join(' ') : `Жетон ${_ld.targetId}`;
                        const _priceStr = Number(_ld.price).toLocaleString('ru-RU').replace(/\s/g, ' ');
                        const _LIC_PHRASE = {
                            1: { nom: 'водительские права',        acc: 'водительские права' },
                            2: { nom: 'профессиональные права',    acc: 'профессиональные права' },
                            3: { nom: 'лицензия на оружие',        acc: 'лицензию на оружие' },
                            4: { nom: 'лицензия на рыбалку',       acc: 'лицензию на рыбалку' },
                            5: { nom: 'лицензия на охоту',         acc: 'лицензию на охоту' }
                        };
                        const _ph = _LIC_PHRASE[_ld.type] || { nom: _ld.name, acc: _ld.name };
                        const _txt = _noMoney
                            ? `${_addr}, у вас недостаточно денег на ${_ph.acc}. Стоимость: ${_priceStr} руб.`
                            : `${_addr}, у вас уже есть ${_ph.nom}`;
                        if (typeof __mvdPrevSendChatInput === "function") {
                            __mvdPrevSendChatInput(_txt);
                        } else {
                            engine.trigger("SendChatInput", _txt);
                        }
                        console.log(`[PRAVO] 💬 Авто-ответ (${_noMoney ? 'нет денег' : 'уже есть'}) → ${_addr} (ID ${_ld.targetId})`);
                    }, 300);
                }
                // ─────────────────────────────────────────────────────────────────────
            }
            // ========== ФИЛЬТРАЦИЯ СООБЩЕНИЙ ==========
            if (shouldBlockMessage(message)) {
                console.log('[FILTER] ✋ Сообщение заблокировано');
                return;
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
            message = _pravoAddSmsButton(message);
            return originalAddFunction.apply(this, [message, ...args]);
        };
        console.log('[PRAVO] Обработчик чата успешно установлен');
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
// GameText-уведомление (замена ZKM для авто-перевыдачи и др.)
// gtAdd(text, duration, type)
//   text     — строка с ~n~ (перенос) и ~r~/~g~/~y~/~w~/~b~/~o~/~d~ (цвет)
//   duration — мс (по умолчанию 3000)
//   type     — 0=center, 1=top, 2=right, 3=bottom (по умолчанию 3)
const gtAdd = (text, duration, type) => {
    try {
        const gt = window.interface && window.interface('GameText');
        if (gt && typeof gt.add === 'function') {
            const t    = (type     !== undefined) ? type     : 3;
            const dur  = (duration !== undefined) ? duration : 3000;
            gt.add(JSON.stringify([t, text, dur, 0, 0, true, false, 2.0]));
        }
    } catch(e) {}
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
            gtAdd(`~g~Авто-снаряжение~n~~w~Берётся: ${takenItems.join(', ')}`, 5000, 3);
        } else {
            gtAdd('~r~Авто-снаряжение~n~~w~Выключено', 3000, 3);
        }
    } catch(e) {
        console.warn('[PRAVO-GRAB] toggleAutoGrab notify error:', e);
    }
};
// ── «Круговое меню»: при открытии PlayerInteraction игрока сразу открывается выдача лицензии ──
// Изначально ВЫКЛ. Включается пунктом «Круговое меню» в диалоге «ПРАВИТЕЛЬСТВО».
// Само поведение — в блоке _pravoCircleLicenseAuto (перед логгером цели PlayerInteraction).
if (typeof window.PRAVO_CIRCLE_LIC !== 'boolean') window.PRAVO_CIRCLE_LIC = false;
// Доступность режима: ПК — Лицензёр в правительственном скине (как раньше у E+ПКМ);
// мобилка — дополнительно нужен помощник лицензёра (как у кнопки в круге).
// «Быстрая выдача лицензии» включена в установщике: задан хоткей GIVELIC_KEY или включён флаг помощника.
window._pravoQuickGiveOn = function () {
    return !!(GIVELIC_KEY || LICENSOR_HELPER_ENABLED || window.LICENSOR_HELPER_ENABLED);
};
window._pravoCircleAllowed = function () {
    try { if (!pravoSkins.includes(skinId)) return false; } catch (e) { return false; }
    if (typeof _isLicensorRank !== 'function' || !_isLicensorRank()) return false;
    if (window.App && window.App.isMobile) return !!(GIVELIC_KEY || LICENSOR_HELPER_ENABLED || window.LICENSOR_HELPER_ENABLED);
    return true;
};
// ── «Просьба о чае»: после успешной выдачи лицензии (игрок купил) пишем в /n просьбу о чае ──
// Изначально ВЫКЛ. Триггер — сообщение сервера лицензёру после покупки:
//   Вы выдали "Лицензия на ..." игроку Ник_Фамилия за 85.000 руб
// Текст меняется через window.PRAVO_TEA_TEXT ({nick} подставится ником игрока).
if (typeof window.PRAVO_TEA_ASK !== 'boolean') window.PRAVO_TEA_ASK = false;
if (typeof window.PRAVO_TEA_TEXT !== 'string') window.PRAVO_TEA_TEXT = '{nick}, на чай не найдётся? А то 10 процентов с лицензии, буду благодарен';
const teaAskName = () => `Просьба о чае | ${window.PRAVO_TEA_ASK ? "{00FF00}Вкл" : "{FF0000}Выкл"}`;
const toggleTeaAsk = () => {
    window.PRAVO_TEA_ASK = !window.PRAVO_TEA_ASK;
    if (window.PRAVO_TEA_ASK) {
        gtAdd('~g~Просьба о чае~n~~w~Вкл: после выдачи лицензии напишу игроку в /n', 4000, 3);
    } else {
        gtAdd('~r~Просьба о чае~n~~w~Выкл', 3000, 3);
    }
};
const circleLicName = () => `Круговое меню | ${window.PRAVO_CIRCLE_LIC ? "{00FF00}Вкл" : "{FF0000}Выкл"}`;
const toggleCircleLic = () => {
    window.PRAVO_CIRCLE_LIC = !window.PRAVO_CIRCLE_LIC;
    if (window.PRAVO_CIRCLE_LIC) {
        gtAdd('~g~Круговое меню~n~~w~Вкл: при открытии меню игрока сразу откроется выдача лицензии', 4000, 3);
    } else {
        gtAdd('~r~Круговое меню~n~~w~Выкл: меню игрока открывается как обычно', 3000, 3);
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
        case "givelic":
            setTimeout(() => window.showGiveLicIdInputDialog(), 50);
            break;
        case "tea_ask":
            toggleTeaAsk();
            setTimeout(() => {
                showMvdSubMenu(giveLicenseTo);
            }, 50);
            break;
        case "circle_lic":
            toggleCircleLic();
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
        case "auto_reissue_lic":
            // ── Авто-перевыдача: /cancel → повтор последней команды /givelic ──────
            if (_lastGiveLicData) {
                _pravoReissueLic({}); // мгновенно, либо в первый допустимый момент (антифлуд)
                // Закрываем меню сразу, не ждём
                setTimeout(() => showMvdSubMenu(giveLicenseTo), 150);
            } else {
                gtAdd('~r~Авто-перевыдача~n~~w~Нет данных — сначала выдайте лицензию через меню', 3500, 3);
                setTimeout(() => showMvdSubMenu(giveLicenseTo), 100);
            }
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
        gtAdd(`~y~Проверка документов~n~~w~Alt (1 раз) — Нет | Alt (2 раза) — Да`, DOC_CHECK_PROMPT_SEC * 1000, 3);
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
        availableTypes.push({ name: "ПРАВИТЕЛЬСТВО", id: "mvd_main" });
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
        '[667,4,"ПРАВИТЕЛЬСТВО | Повседневная","","Выбрать","Назад",0,0]',
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
    // Выдача лицензии: только для Лицензёра И если фича включена в установщике.
    // ПК: проверяем GIVELIC_KEY (хоткей «Быстрой выдачи»).
    // Hassle: проверяем LICENSOR_HELPER_ENABLED (галочка «Быстрая выдача» в установщике).
    if (_isLicensorRank() && (GIVELIC_KEY || LICENSOR_HELPER_ENABLED || window.LICENSOR_HELPER_ENABLED)) {
        availableSub.push({ name: "Выдача лицензии", id: "givelic" });
    }
    // «Круговое меню» открывает диалог выдачи лицензии — значит нужна включённая в установщике «Быстрая выдача»
    if (window._pravoCircleAllowed() && window._pravoQuickGiveOn()) {
        availableSub.push({ name: circleLicName(), id: "circle_lic" });
    }
    // «Просьба о чае» — после «Круговое меню» (те же условия: Лицензёр; на мобилке + помощник)
    if (window._pravoCircleAllowed()) {
        availableSub.push({ name: teaAskName(), id: "tea_ask" });
    }
    // Авто-перевыдача: только для Лицензёра, если включена в установщике и есть сохранённая команда
    if ((AUTO_REISSUE_LIC || window.AUTO_REISSUE_LIC === true) && _isLicensorRank() && _lastGiveLicData) {
        const _rl = _lastGiveLicData;
        availableSub.push({
            name: `Авто-перевыдача | {00FF00}${_rl.name} [ID: ${_rl.targetId}]`,
            id: "auto_reissue_lic"
        });
    }
    // Авто-снаряжение: только для Охранник[2] и Нач. Охраны[3]
    if (window.AUTO_GRAB === true && _isGrabAllowedRank()) {
        availableSub.push({ name: autoGrabName, id: "autograb" });
    }
    shownMvdSubTypes = availableSub;
    let licenseList = 'AHK by konstt<n>';
    availableSub.forEach((license, index) => {
        licenseList += `${index + 1}. ${license.name}<n>`;
    });
    window.addDialogInQueue(`[677,4,"ПРАВИТЕЛЬСТВО","","Выбрать","Отмена",0,0]`, licenseList, 0);
    // ── Hassle: показываем Interaction поверх диалога (только если диалог открыт НЕ из кнопки Interactions) ──
    // Если диалог открыт кнопкой 9900 (АНК Меню) — Interactions уже были закрыты и не должны появляться
    // поверх диалога. Флаг _pravoSkipIntReopen выставляется обработчиком 9900 и сбрасывается здесь.
    if (!_pravoSkipIntReopen) {
        (function(_glt) {
            setTimeout(function() { _pravoUpdateHassleInteraction(_glt); }, 120);
        })(giveLicenseTo);
    }
    _pravoSkipIntReopen = false; // сбрасываем флаг в любом случае
};
// ==================== KEYBOARD PATCH: 123-РАСКЛАДКА + НИКИ ДЛЯ НАШИХ ДИАЛОГОВ ====================
// При открытии ввода ID (диалоги 668 и 678) клавиатура на Hassle автоматически:
//   1) Открывается на числовой раскладке "123" (toggleNumbers)
//   2) Показывает ники над головами (setDrawLabelStatus остаётся true)
// Для всех обычных диалогов и обычной клавиатуры поведение НЕ меняется.
;(function _pravoKeyboardPatch() {
    window._pravoIsOurKeyboard = false;

    // ── Есть ли открытый интерфейс, который штатно должен скрывать ники (hideHud/hideLabels) ──
    window._pravoShouldHideLabels = function() {
        try {
            if (window._pravoIsOurKeyboard) return false; // наш диалог ввода ID — ники нужны
            var comps = window.App && window.App.components;
            if (!comps) return false;
            for (var name in comps) {
                var c = comps[name];
                if (c && c.open && c.open.status && c.options && !c.options.hud &&
                    (c.options.hideHud || c.options.hideLabels)) return true;
            }
        } catch (e) {}
        return false;
    };

    // ── Блокируем скрытие ников ТОЛЬКО пока наша клавиатура реально открыта ──────────
    function _patchSdls() {
        var _orig = window.setDrawLabelStatus;
        if (typeof _orig !== 'function') return false;
        // Сохраняем оригинал для прямого вызова внутри патча
        window._pravoSdlsOrig = _orig;
        window.setDrawLabelStatus = function(value) {
            // Обычная клавиатура (наш флаг не выставлен) — пропускаем всё как есть
            if (!window._pravoIsOurKeyboard) return _orig.apply(this, arguments);
            // Наш диалог: блокируем только вызовы false (скрытие ников)
            if (!value) {
                var _pauseOpen = false;
                try {
                    _pauseOpen = !!(window.getInterfaceStatus &&
                        (window.getInterfaceStatus('PauseMenu') || window.getInterfaceStatus('MainMenu')));
                } catch (e) {}
                var _kbVisible = !!document.querySelector('.keyboard-container');
                if (_kbVisible && !_pauseOpen) {
                    console.log('[PRAVO-KB] setDrawLabelStatus(false) заблокирован — ники остаются видны');
                    return;
                }
                // Клавиатуры уже нет или открыта пауза/меню — флаг залип, сбрасываем и пропускаем вызов
                window._pravoIsOurKeyboard = false;
            }
            return _orig.apply(this, arguments);
        };
        return true;
    }
    if (!_patchSdls()) {
        // setDrawLabelStatus ещё не появилась (маловероятно) — ждём
        var _sdlsTimer = setInterval(function() {
            if (_patchSdls()) clearInterval(_sdlsTimer);
        }, 200);
    }

    // ── Страховка: ESC тоже сбрасывает флаг ──────────────────────────────────
    window.addEventListener('keyup', function(e) {
        if (e.keyCode === 27) window._pravoIsOurKeyboard = false;
    });

    // ── Сбрасываем флаг при закрытии клавиатуры ──────────────────────────────
    function _patchHideKb() {
        var _origHK = window.hideKeyboard;
        if (typeof _origHK !== 'function') return false;
        window.hideKeyboard = function() {
            window._pravoIsOurKeyboard = false;
            return _origHK.apply(this, arguments);
        };
        return true;
    }
    if (!_patchHideKb()) {
        var _hkTimer = setInterval(function() {
            if (_patchHideKb()) clearInterval(_hkTimer);
        }, 200);
    }

    // ── Переключение на 123 + восстановление ников после mount клавиатуры ────
    // Три уровня: interface() → Vue internal → DOM-клик по кнопке "123"
    window._pravoScheduleKeyboardNumeric = function() {
        window._pravoIsOurKeyboard = true;
        var _a = 0;
        var _t = setInterval(function() {
            _a++;
            try {
                // .keyboard-container рендерится только при state=1 (клавиатура видна)
                var _kbContainer = document.querySelector('.keyboard-container');
                if (!_kbContainer) return; // ещё не показалась — ждём

                var _switched = false;

                // А: window.interface('Keyboard')
                try {
                    var kb = window.interface && window.interface('Keyboard');
                    if (kb && typeof kb.toggleNumbers === 'function') {
                        if (!kb.isNumbers) kb.toggleNumbers();
                        _switched = true;
                        console.log('[PRAVO-KB] A: toggleNumbers() via interface');
                    }
                } catch(_e) {}

                // Б: Vue internal (__vueParentComponent)
                if (!_switched) {
                    try {
                        var _kbEl = document.querySelector('.keyboard');
                        var _vc = _kbEl && (_kbEl.__vueParentComponent || _kbEl._vueParentComponent || _kbEl.__vue__);
                        var _proxy = _vc && (_vc.proxy || _vc);
                        if (_proxy && typeof _proxy.toggleNumbers === 'function') {
                            if (!_proxy.isNumbers) _proxy.toggleNumbers();
                            _switched = true;
                            console.log('[PRAVO-KB] Б: toggleNumbers() via __vueParentComponent');
                        }
                    } catch(_e) {}
                }

                // В: прямой DOM-клик по кнопке «123» — самый надёжный
                // <div class="keyboard-key keyboard-key_controller"> ← onClick=toggleNumbers
                //   <div class="keyboard-key__value">123</div>
                // </div>
                if (!_switched) {
                    try {
                        var _vals = _kbContainer.querySelectorAll('.keyboard-key__value');
                        for (var _i = 0; _i < _vals.length; _i++) {
                            if ((_vals[_i].textContent || '').trim() === '123') {
                                var _keyEl = _vals[_i].parentElement;
                                if (_keyEl) {
                                    _keyEl.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
                                    _switched = true;
                                    console.log('[PRAVO-KB] В: DOM-клик по кнопке 123 ✅');
                                }
                                break;
                            }
                        }
                    } catch(_e) {}
                }

                if (!_switched) console.warn('[PRAVO-KB] Все три метода не сработали');

                // Показываем ники (перекрываем возможный mounted()-вызов false)
                var _sdls = window._pravoSdlsOrig;
                if (typeof _sdls === 'function') {
                    _sdls.call(window, true);
                    console.log('[PRAVO-KB] setDrawLabelStatus(true) — ники видны');
                }

                // ── FIX: hook send() → авто-подтверждение диалога 678/668 ──────────────
                // Перехватываем ctx.send Vue-компонента клавиатуры.
                // При нажатии «Send» сами вызываем sendClientEventCustom(OnDialogResponse) —
                // диалог не слушает Enter-событие на document, которое шлёт оригинальный send().
                try {
                    var _kbElH = document.querySelector('.keyboard');
                    var _vcH   = _kbElH && (
                        _kbElH.__vueParentComponent ||
                        _kbElH._vueParentComponent  ||
                        _kbElH.__vue__
                    );
                    var _ctxH  = _vcH && _vcH.ctx;

                    if (_ctxH && typeof _ctxH.send === 'function' && !_ctxH._pravoSendHooked) {
                        (function(_orig) {
                            _ctxH.send = function() {
                                // Читаем текст ДО вызова оригинала (this = proxy → this.text реактивен)
                                var _sv  = (this && this.text != null)
                                             ? String(this.text)
                                             : ((window.currentKeyboardInput && window.currentKeyboardInput.value) || '');
                                var _sid = window._pravoKbDialogId || null;

                                // Сбрасываем ДО _orig.apply() — Enter-fallback (ниже) увидит null и не задублирует
                                if (_sid) window._pravoKbDialogId = null;

                                // Оригинальное поведение: addHistory → hide → Enter-диспатч
                                _orig.apply(this, arguments);

                                // Авто-подтверждение: только если мы открыли этот диалог и есть ввод
                                if (_sid && _sv.trim() !== '') {
                                    setTimeout(function() {
                                        window.sendClientEventCustom(0, 'OnDialogResponse', _sid, 1, 0, _sv);
                                        console.log('[PRAVO-KB] ✅ авто-ответ dlg=' + _sid + ' val="' + _sv + '"');
                                    }, 80);
                                }

                                // Hook одноразовый — восстанавливаем оригинал
                                _ctxH.send = _orig;
                                _ctxH._pravoSendHooked = false;
                            };
                            _ctxH._pravoSendHooked = true;
                        })(_ctxH.send);

                        console.log('[PRAVO-KB] 🎣 send() hook → dlg=' + (window._pravoKbDialogId || 'none'));
                    }
                } catch (_he) {
                    console.warn('[PRAVO-KB] send() hook ошибка:', _he);
                }
                // ─────────────────────────────────────────────────────────────────────────

                clearInterval(_t);
            } catch(e) {
                console.warn('[PRAVO-KB] Ошибка в поллинге:', e);
            }
            if (_a >= 30) {
                clearInterval(_t);
                window._pravoIsOurKeyboard = false;
                console.warn('[PRAVO-KB] Таймаут — .keyboard-container не появился за 3 сек');
            }
        }, 100);
    };

    // ── FALLBACK: синтетический Enter от keyboard.send() ──────────────────────────
    // keyboard.send() всегда вызывает dispatchEvent(new KeyboardEvent("keydown",...))
    // Такой ивент имеет isTrusted=false — отличаем от реального нажатия Enter.
    // Срабатывает если ctx.send hook не установился (основной баг на Hassle).
    // ctx.send hook при успешной установке обнуляет _pravoKbDialogId ДО _orig.apply(),
    // поэтому здесь увидим null и не задублируем вызов.
    document.addEventListener('keydown', function(e) {
        if ((e.key !== 'Enter' && e.keyCode !== 13) || e.isTrusted) return;
        var sid = window._pravoKbDialogId;
        if (!sid) return;
        window._pravoKbDialogId = null;
        var sv = (window.currentKeyboardInput && window.currentKeyboardInput.value) || '';
        if (sv.trim() !== '') {
            setTimeout(function() {
                window.sendClientEventCustom(0, 'OnDialogResponse', sid, 1, 0, sv);
                console.log('[PRAVO-KB] ✅ Enter-fallback dlg=' + sid + ' val="' + sv + '"');
            }, 80);
        }
    }, true); // capture — перехватываем ДО Vue и движка

    console.log('[PRAVO-KB] Патч клавиатуры (123 + ники) установлен + Enter-fallback');
})();
// ==================== END KEYBOARD PATCH ====================

window.showIdInputDialog = (e) => {
    giveLicenseTo = e;
    window._pravoKbDialogId = 668; // FIX: авто-подтверждение через клавиатуру
    window._pravoScheduleKeyboardNumeric && window._pravoScheduleKeyboardNumeric();
    window.addDialogInQueue(`[668,1,"Ввод ID","Введите ID игрока:","Подтвердить","Отмена",0,0]`, "", 0);
};

// ==================== /givelic — БЫСТРАЯ ВЫДАЧА ЛИЦЕНЗИИ ====================
// Типы лицензий: name — отображаемое название, type — код команды, price — цена
const _GIVE_LIC_TYPES = [
    { name: "Права",       type: 1, price: 10000 },
    { name: "Проф. права", type: 2, price: 40000 },
    { name: "Оружие",      type: 3, price: 85000 },
    { name: "Рыбалка",     type: 4, price: 40000 },
    { name: "Охота",       type: 5, price: 65000 },
];

// Диалог 678 — ввод ID игрока для /givelic
window.showGiveLicIdInputDialog = () => {
    window._pravoKbDialogId = 678; // FIX: авто-подтверждение через клавиатуру
    window._pravoScheduleKeyboardNumeric && window._pravoScheduleKeyboardNumeric();
    window.addDialogInQueue(`[678,1,"Выдача лицензии","Введите ID игрока:","Далее","Отмена",0,0]`, "", 0);
};

// Диалог 679 — выбор типа лицензии после ввода ID
window.showGiveLicTypeDialog = (id) => {
    _giveLicTargetId = id;
    let list = 'Выберите тип лицензии:<n>';
    _GIVE_LIC_TYPES.forEach((t, i) => {
        list += `${i + 1}. ${t.name}  [${t.price.toLocaleString('ru-RU')} ₽]<n>`;
    });
    window.addDialogInQueue(`[679,4,"Выдача лицензии | ID: ${id}","","Выдать","Отмена",0,0]`, list, 0);
};
// Прямая выдача по индексу типа лицензии — для выбора в кольце PlayerInteraction (без диалога 679).
// Делает то же, что ветка диалога 679: шлёт /givelic, запоминает данные для авто-перевыдачи, обновляет Interaction.
window.pravoGiveLicenseByIndex = (targetId, idx) => {
    const chosen = _GIVE_LIC_TYPES[idx];
    if (!chosen || targetId === null || targetId === undefined || targetId === '') return false;
    const cmd = `/givelic ${targetId} ${chosen.type} ${chosen.price}`;
    console.log(`[GIVELIC] (круг) Отправка команды: ${cmd}`);
    if (typeof __mvdPrevSendChatInput === "function") {
        __mvdPrevSendChatInput(cmd);
    } else {
        engine.trigger("SendChatInput", cmd);
    }
    _lastGiveLicData = {
        targetId: targetId,
        type:     chosen.type,
        price:    chosen.price,
        name:     chosen.name
    };
    window._lastGiveLicData = _lastGiveLicData;
    setTimeout(function () { _pravoUpdateHassleInteraction(targetId); }, 350);
    return true;
};
// ==================== END /givelic ====================
window.sendClientEventCustom = (event, ...args) => {
    console.log(`[EVENT] Событие: ${event}, Аргументы:`, args);

    // ── HASSLE: перехват кликов по Interaction-типам (9900/9901/9902) ───────
    if (args[0] === 'OnInteractionsClick') {
        const _hInt = parseInt(args[1]);
        if (_hInt === 9900) {
            _pravoHassleIntOpen = false;
            _pravoSkipIntReopen = true; // FIX: диалог открывается из кнопки — блокируем повторное появление Interactions в showMvdSubMenu
            try { window.closeInterface('Interactions'); } catch(e) {}
            setTimeout(function() { window.sendChatInput('/dahk'); }, 50);
            return;
        }
        if (_hInt === _PRAVO_INT_REISSUE) {
            // FIX: НЕ закрываем Interactions перед вызовом — панель остаётся открытой.
            // После выдачи _pravoDoReissue вызовет _pravoUpdateHassleInteraction,
            // которая теперь обновляет список через setInfo (без мерцания).
            if (typeof window._pravoDoReissue === 'function') window._pravoDoReissue();
            return;
        }
        if (_hInt === _PRAVO_INT_GIVELIC) {
            _pravoHassleIntOpen = false;
            try { window.closeInterface('Interactions'); } catch(e) {}
            if (typeof window.showGiveLicIdInputDialog === 'function') window.showGiveLicIdInputDialog();
            return;
        }
    }
    // ────────────────────────────────────────────────────────────────────────

    // Alt+Q — авто-тазер (своп тазер ↔ дигл) перехватывается через keydown (браузерный уровень)

    if (args[0] === "OnDialogResponse" && (args[1] >= 666 && args[1] <= 679)) {
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
                // Отмена / ESC — закрываем меню и восстанавливаем Interaction
                // (актуально когда диалог был открыт кнопкой 9900 и Interactions были скрыты)
                setTimeout(function() { _pravoUpdateHassleInteraction(giveLicenseTo || -1); }, 120);
            }
        }
        else if (args[1] === 678) { // /givelic: ввод ID игрока
            // Бинд на конкретную лицензию (lic_<тип>) оставляет здесь выбранный тип (актуален 60 с)
            const _pend = window._pravoPendingLic;
            window._pravoPendingLic = null;
            if (args[2] === 1) {
                const inputId = (args[4] || '').trim();
                if (inputId) {
                    if (_pend && (Date.now() - _pend.ts) < 60000) {
                        setTimeout(() => window.pravoGiveLicenseByIndex(inputId, _pend.idx), 50);
                    } else {
                        setTimeout(() => window.showGiveLicTypeDialog(inputId), 50);
                    }
                }
            } else {
                // Отмена — возвращаем Interaction (FIX: раньше не появлялся)
                setTimeout(function() { _pravoUpdateHassleInteraction(giveLicenseTo || -1); }, 100);
            }
        }
        else if (args[1] === 679) { // /givelic: выбор типа лицензии
            if (args[2] !== 1) {
                // Отмена — возвращаем Interaction (FIX: раньше не появлялся)
                setTimeout(function() { _pravoUpdateHassleInteraction(giveLicenseTo || -1); }, 100);
            }
            if (args[2] === 1) {
                const idx = parseInt(args[3]);
                if (idx >= 0 && idx < _GIVE_LIC_TYPES.length) {
                    const chosen = _GIVE_LIC_TYPES[idx];
                    const cmd = `/givelic ${_giveLicTargetId} ${chosen.type} ${chosen.price}`;
                    console.log(`[GIVELIC] Отправка команды: ${cmd}`);
                    // Отправляем напрямую на сервер, минуя наш перехватчик
                    if (typeof __mvdPrevSendChatInput === "function") {
                        __mvdPrevSendChatInput(cmd);
                    } else {
                        engine.trigger("SendChatInput", cmd);
                    }
                    // ── Сохраняем данные для Авто-перевыдачи ──────────────────────────────
                    _lastGiveLicData = {
                        targetId: _giveLicTargetId,
                        type:     chosen.type,
                        price:    chosen.price,
                        name:     chosen.name
                    };
                    window._lastGiveLicData = _lastGiveLicData;
                    console.log(`[GIVELIC] Данные сохранены для авто-перевыдачи: ${chosen.name} → ID: ${_giveLicTargetId}`);
                    // ── Hassle: проверяем устройство цели и показываем Interaction ──────────
                    // Захватываем _giveLicTargetId ДО его сброса в -1 ниже.
                    (function(_savedTid) {
                        setTimeout(function() { _pravoUpdateHassleInteraction(_savedTid); }, 350);
                    })(_giveLicTargetId);
                }
            }
            _giveLicTargetId = -1; // сброс после выбора или отмены
        }
    } else {
        window.sendClientEventHandle(event, ...args);
    }
};
var __mvdPrevSendChatInput = window.sendChatInput;
// Считаем в антифлуд-счётчик всё, что мы отправляем серверу (команды, авто-ответы, чат)
// ── ЗАЩИТА ОТ «Слишком длинное сообщение» ────────────────────────────────────
// Сервер (OnPlayerText) отбрасывает обычный чат длиннее 83 символов: if(str_len > 83).
// Команды (/...) под этот лимит не попадают, их не трогаем.
// Любой обычный текст, который уходит через __mvdPrevSendChatInput (авто-ответы
// лицензёра, приветствия, ручной ввод), автоматически режется на части ≤ 83
// и отправляется по очереди, чтобы порядок и антифлуд сохранялись.
const PRAVO_SERVER_CHAT_LIMIT = 83;
const PRAVO_CHAT_PART_DELAY   = 700; // мс между частями одного сообщения

function _pravoSplitChat(text, max) {
    max = max || PRAVO_SERVER_CHAT_LIMIT;
    if (typeof text !== 'string') return [text];
    if (text.charAt(0) === '/') return [text];          // команды не режем
    text = text.trim();
    if (text.length <= max) return [text];
    const parts = [];
    let s = text;
    while (s.length > max) {
        const win = s.slice(0, max + 1);                 // окно с запасом в 1 символ
        let cut = -1;
        // 1) конец предложения (. ! ?), если он не слишком близко к началу
        for (const m of ['. ', '! ', '? ']) {
            const i = win.lastIndexOf(m);
            if (i >= max * 0.4) cut = Math.max(cut, i + 1);
        }
        // 2) запятая / точка с запятой
        if (cut === -1) {
            for (const m of [', ', '; ']) {
                const i = win.lastIndexOf(m);
                if (i >= max * 0.4) cut = Math.max(cut, i + 1);
            }
        }
        // 3) любой пробел
        if (cut === -1) {
            const i = win.lastIndexOf(' ');
            if (i > 0) cut = i;
        }
        // 4) нет пробелов вообще — жёсткий обрез
        if (cut <= 0) cut = max;
        parts.push(s.slice(0, cut).trim());
        s = s.slice(cut).trim();
    }
    if (s) parts.push(s);
    return parts.filter(Boolean);
}

if (typeof __mvdPrevSendChatInput === "function") {
    (function(_rawSend) {
        const _queue = [];
        let _draining = false;
        function _drain() {
            if (!_queue.length) { _draining = false; return; }
            _draining = true;
            const part = _queue.shift();
            _pravoFloodNote(1);
            _rawSend.call(window, part);
            setTimeout(_drain, PRAVO_CHAT_PART_DELAY);
        }
        __mvdPrevSendChatInput = function(t) {
            // команды и не-строки — как раньше
            if (typeof t !== 'string' || t.charAt(0) === '/') {
                _pravoFloodNote(1);
                return _rawSend.apply(window, arguments);
            }
            const parts = _pravoSplitChat(t);
            // короткое сообщение и очередь пуста — отправляем сразу
            if (parts.length === 1 && !_draining) {
                _pravoFloodNote(1);
                return _rawSend.call(window, parts[0]);
            }
            // иначе — в очередь (сохраняем порядок)
            for (const p of parts) _queue.push(p);
            if (!_draining) _drain();
        };
    })(__mvdPrevSendChatInput);
}
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
                    gt.add('[3, "АНК <span style=\\"color:#CCFF00\\">ПРАВИТЕЛЬСТВО</span>&nbsp;by konstt", 5000, 0, 0, false, false, 2.0]');
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
        gtAdd('~w~AHK by TG: ZaharKonst~n~~d~Не удалось определить фракцию — попробуйте ещё раз', 5000, 3);
    }
    } else if (args[0] == "/givelic" && args.length === 1) {
        // Всегда пропускаем оригинальную команду на сервер
        if (typeof __mvdPrevSendChatInput === "function") {
            __mvdPrevSendChatInput(e);
        } else {
            engine.trigger("SendChatInput", e);
        }
        // Дополнительно показываем наше меню только если помощник лицензёра включён И звание Лицензёр
        if (_isLicensorRank() && (LICENSOR_HELPER_ENABLED || window.LICENSOR_HELPER_ENABLED)) {
            window.showGiveLicIdInputDialog();
        }
    } else if (args[0] == "/givelic" && args.length === 2) {
        // Всегда пропускаем оригинальную команду на сервер
        if (typeof __mvdPrevSendChatInput === "function") {
            __mvdPrevSendChatInput(e);
        } else {
            engine.trigger("SendChatInput", e);
        }
        // Дополнительно показываем наше меню только если помощник лицензёра включён И звание Лицензёр
        if (_isLicensorRank() && (LICENSOR_HELPER_ENABLED || window.LICENSOR_HELPER_ENABLED)) {
            window.showGiveLicTypeDialog(args[1]);
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
const _CHAT_MAX_LEN = PRAVO_SERVER_CHAT_LIMIT; // было 120 — сервер режет всё, что длиннее 83

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

// Разбивает длинный текст на части по границам предложений/слов (команды не трогает)
function _splitChatMessage(text) {
    return _pravoSplitChat(text, _CHAT_MAX_LEN);
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
            if (style === 2 && dialogId === 0 && title.includes('СЛУЖБА БЕЗОПАСНОСТИ') && window.AUTO_GRAB && typeof window.autoGrab === 'function' && _isGrabAllowedRank()) {
                if (!window._pravoGrabProcessing) {
                    console.log('[PRAVO-GRAB] === v2.1 🎯 ТРИГГЕР СРАБОТАЛ — Полицейская служба ===');
                    setTimeout(() => window.autoGrab(), 150);
                }
            }


        }
    } catch (err) {
        console.error('[DIALOG] Ошибка перехвата:', err.message);
    }
    const _dlgResult = _dlgOrigAddDialogInQueue.call(this, dialogParams, content, priority);

    // ── МОБИЛА (Hassle): авто-открытие клавиатуры при INPUT-диалогах ввода ID ──
    // Диалоги 668 («Ввод ID»)  и  678 («Выдача лицензии — Введите ID игрока»)
    try {
        if (
            window.App && window.App.isMobile &&
            dialogParams && typeof dialogParams === 'string'
        ) {
            const _kb_p     = JSON.parse(dialogParams.trim());
            const _kb_style = parseInt(_kb_p[1]);  // 1 = INPUT dialog
            const _kb_dlgId = parseInt(_kb_p[0]);

            if (_kb_style === 1 && (_kb_dlgId === 668 || _kb_dlgId === 678)) {
                // Ждём ~200 мс — Vue успеет отрисовать Window-компонент
                setTimeout(function _pravoOpenHassleKeyboard() {
                    try {
                        const _kb_q = window.App.dialogsQueue;
                        if (!_kb_q || !_kb_q.length) return;

                        // dialogsQueue.unshift([idx, priority]) → свежий диалог первый
                        const _kb_idx = _kb_q[0][0];
                        let _kb_dlg = window.App.$refs['Window' + _kb_idx];
                        if (Array.isArray(_kb_dlg)) _kb_dlg = _kb_dlg[0];
                        if (!_kb_dlg || !_kb_dlg.$el) return;

                        // Берём <input> из диалога (type=INPUT рендерит текстовое поле)
                        const _kb_inp = _kb_dlg.$el.querySelector('input, textarea');
                        if (!_kb_inp) return;

                        // Устанавливаем target и открываем клавиатуру Hassle
                        window.currentKeyboardInput = _kb_inp;
                        if (typeof window.showKeyboard === 'function') {
                            window.showKeyboard('game');
                            console.log(
                                '[PRAVO-KB] ⌨️ Клавиатура Hassle открыта для диалога ID=' +
                                _kb_dlgId + ' (Window' + _kb_idx + ')'
                            );
                        }
                    } catch (_kb_e2) {
                        console.warn('[PRAVO-KB] Авто-клавиатура — ошибка:', _kb_e2.message);
                    }
                }, 200);
            }
        }
    } catch (_kb_e) { /* не критично */ }
    // ── END МОБИЛА авто-клавиатура ─────────────────────────────────────────

    return _dlgResult;
};

console.log('[DIALOG MONITOR] Загружен. Все диалоги выводятся в консоль.');
// ==================== END DIALOG MONITOR ====================

// АВТОБРАНИЕ МВД Авто-снаряжение — включается только если AUTO_GRAB === true (LoadAhk патчит константы ниже перед eval) Используем var чтоб...
var AUTO_GRAB = false;
var AUTO_GRAB_SKIP = [];
// Явно пишем в window чтобы showMvdSubMenu (загруженный ДО eval) видел значение
window.AUTO_GRAB = AUTO_GRAB;
window.AUTO_GRAB_SKIP = AUTO_GRAB_SKIP;
// Синхронизируем AUTO_REISSUE_LIC и REISSUE_KEY в window после eval (патч LoadPravo применяется ДО eval)
window.AUTO_REISSUE_LIC = AUTO_REISSUE_LIC;
window.REISSUE_KEY = REISSUE_KEY;
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
     TASER:       13,   // Тазер (не используется в ПРАВИТЕЛЬСТВО)
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
 // ======= ПОЗИЦИИ В МЕНЮ ПРАВИТЕЛЬСТВО (0-based, по скриншоту) =======
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
     // TASER убран из авто-снаряжения ПРАВИТЕЛЬСТВО
 };

 const DIALOG_ID = 0;
 const CT = { ACC: 0, INV: 1, BACK: 2, EXTRA: 3 };

 let isProcessing = false;

 function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

 function notify(title, text, color = "FFFFFF") {
     const _colorMap = { "00FF00": "g", "FF0000": "r", "FFA500": "o", "f9b701": "y", "FFFF00": "y", "FF4444": "r" };
     const _c = _colorMap[(color || "").toUpperCase()] || _colorMap[color] || "w";
     gtAdd(`~${_c}~${title}~n~~w~${text}`, 2500, 3);
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
     // Проверка звания: авто-снаряжение работает только для Охранник[2] и Нач. Охраны[3]
     if (!_isGrabAllowedRank()) {
         console.log(`[PRAVO-GRAB] ⛔ Звание "${window._pravoRank}" не в списке — авто-снаряжение пропущено`);
         return;
     }
     if (isProcessing) return;
     isProcessing = true;

     // ── ПАТЧИ: скрываем визуал инвентаря на ВЕСЬ авто-граб ──
     const _grabOrigPlaySound         = window.playSound;
     const _grabOrigSetHudStatus      = window.setHudStatus;
     const _grabOrigSetDrawLabel      = window.setDrawLabelStatus;
     let _grabPatchesActive = true;
     let _grabSdlsWrapper = null;

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
         _grabSdlsWrapper = function(status) {
             if (_grabPatchesActive) return;
             return _grabOrigSetDrawLabel.apply(this, arguments);
         };
         window.setDrawLabelStatus = _grabSdlsWrapper;
     }

     function restoreGrabPatches() {
         _grabPatchesActive = false;
         window.playSound          = _grabOrigPlaySound;
         window.setHudStatus       = _grabOrigSetHudStatus;
         // Восстанавливаем только если наша обёртка всё ещё стоит (не затираем чужие патчи)
         if (window.setDrawLabelStatus === _grabSdlsWrapper) window.setDrawLabelStatus = _grabOrigSetDrawLabel;
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
             vest:        skip('vest') ? 100 : armourVal,
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
             notify("ПРАВИТЕЛЬСТВО", "Всё снаряжение есть ✓", "00FF00");
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
         // Тазер не используется в ПРАВИТЕЛЬСТВО

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
         notify("ПРАВИТЕЛЬСТВО", notifyNames.join(", "), "00FF00");
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
var _profileSdlsWrapper = null;
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
    _profileSdlsWrapper = function(status) {
        if (_patchesActive && !status) {
            console.log('[Profile] 🔒 setDrawLabelStatus(false) заблокировано — ники остаются видны');
            return;
        }
        return _origSetDrawLabelStatus && _origSetDrawLabelStatus.apply(this, arguments);
    };
    window.setDrawLabelStatus = _profileSdlsWrapper;
}
function restoreCursorPatch() {
    _patchesActive = false;
    window.setCursorStatus = _origSetCursorStatus;
    if (window.setDrawLabelStatus === _profileSdlsWrapper) window.setDrawLabelStatus = _origSetDrawLabelStatus;
    // Возвращаем ники только если сейчас не открыт интерфейс, который должен их скрывать (пауза, меню и т.д.)
    try {
        var _menuOpen = false;
        try {
            _menuOpen = !!(window.getInterfaceStatus &&
                (window.getInterfaceStatus('PauseMenu') || window.getInterfaceStatus('MainMenu')));
        } catch(e2) {}
        if (!_menuOpen && !(window._pravoShouldHideLabels && window._pravoShouldHideLabels())) {
            window.setDrawLabelStatus && window.setDrawLabelStatus(true);
        }
    } catch(e) {}
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

    // Сначала пробуем «тихо»: без открытия MainMenu вообще (нет мерцания и подвисания).
    // Если сервер не ответил — откатываемся на старый путь через открытие меню.
    silentReadProfile(function(data) {
        if (data && data.nickname && data.orgRangName) {
            applyProfileResult(data.nickname, data.orgRangName);
            console.log('[Profile] ✅ Тихое чтение: ' + window._pravoRank + ' ' + window._pravoFirstName + ' ' + window._pravoLastName);
            _fetching = false;
            window._mvdProfileLoading = false;
            if (callback) callback({ nickname: window._pravoCallsign, orgRangName: window._pravoRank });
            return;
        }
        if (data) { // ответ пришёл, но звания нет (не в организации) — запоминать нечего
            console.log('[Profile] Тихое чтение: звания нет');
            _fetching = false;
            window._mvdProfileLoading = false;
            if (callback) callback({ nickname: window._pravoCallsign, orgRangName: window._pravoRank });
            return;
        }
        console.warn('[Profile] Тихое чтение не удалось — открываю меню по-старому');
        readViaUI();
    });

    function readViaUI() {

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
                // sendClientEventHandle минует проверку «открыт чат», из-за которой событие терялось
                // и сервер считал MainMenu открытым (MainMenu:Open → return false: /gps, M, /menu молча не работали)
                if (typeof window.sendClientEventHandle === 'function') {
                    window.sendClientEventHandle(0, "MainMenu_OnPlayerCloseInterface");
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
    } // конец readViaUI
}

function applyProfileResult(nick, rank) {
    window._pravoCallsign = nick || '';
    window._pravoRank = rank || '';
    var nickParts = (nick || '').split(/[_\s]+/);
    window._pravoFirstName = nickParts[0] || '';
    window._pravoLastName = nickParts[1] || '';
}

// ── ТИХОЕ чтение профиля ─────────────────────────────────────────────────────
// Сервер на событие MainMenu_OnPlayerChangeTab(1) шлёт статистику строкой
//   interface('MainMenu').onServerResponse(0, '[ник, статус, ..., [ранг, звание, орг.]...]')
// Окно для этого открывать не нужно: на время ответа подставляем вместо окна «приёмник»,
// забираем ник и звание и тут же шлём серверу MainMenu_OnPlayerCloseInterface.
// Индексы как в MainMenu.js (updateMainStats): [0] — ник, [9] — [rang, rangName, title].
function silentReadProfile(cb) {
    var origInterface = window.interface;
    var alreadyOpen = false;
    try { alreadyOpen = !!window.getInterfaceStatus('MainMenu'); } catch(e) {}
    if (alreadyOpen || typeof origInterface !== 'function' || typeof window.sendClientEventHandle !== 'function') {
        cb(null); // меню уже открыто игроком / нет нужных функций — обычный путь
        return;
    }

    var settled = false;
    var timer = null;
    var EVT = (window.gm && window.gm.EVENT_EXECUTE_PUBLIC) || 0;

    function finish(result) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (window.interface === wrapper) window.interface = origInterface;
        // Сообщаем серверу, что «окно закрыто», иначе MainMenu:Open (M, /menu, /gps) будет игнорироваться
        try { window.sendClientEventHandle(EVT, 'MainMenu_OnPlayerCloseInterface'); } catch(e) {}
        cb(result);
    }

    function onResponse(type, json) {
        if (Number(type) !== 0) return; // 0 = UPDATE_MAIN_STATS
        try {
            var arr = typeof json === 'string' ? JSON.parse(json) : json;
            var realNick = null;
            try { realNick = window.App.$store.getters['player/nickName']; } catch(e) {}
            var org = Array.isArray(arr[9]) ? arr[9] : [];
            finish({ nickname: realNick || arr[0] || '', orgRangName: org[1] || '' });
        } catch(e) {
            finish(null);
        }
    }

    var sink = new Proxy({}, {
        get: function(_, prop) {
            if (typeof prop === 'symbol') return undefined;
            if (prop === 'onServerResponse') return onResponse;
            return function() {};
        }
    });
    var wrapper = function(name) {
        var r = origInterface.apply(this, arguments);
        if (!r && name === 'MainMenu' && !settled) return sink;
        return r;
    };

    window.interface = wrapper;
    timer = setTimeout(function() { finish(null); }, 2500);
    try {
        window.sendClientEventHandle(EVT, 'MainMenu_OnPlayerChangeTab', 1); // 1 = «Персонаж»
    } catch(e) {
        finish(null);
    }
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
    function _pravoWaitConnected(cb, n) {
        var ok = false;
        try { ok = !!window.App.$store.getters['player/isPlayerConnected']; } catch(e) {}
        if (ok) { setTimeout(cb, 1500); return; }
        if ((n || 0) < 600) setTimeout(function() { _pravoWaitConnected(cb, (n || 0) + 1); }, 1000);
    }
    _pravoWaitConnected(function() {
        if (window._pravoFirstName && window._pravoLastName && window._pravoRank) return;
        console.log('[Profile] 🔄 Фоновая предзагрузка профиля после входа в игру...');
        loadPlayerProfile(function(data) {
            if (data && data.orgRangName) {
                console.log('[Profile] ✅ Предзагрузка готова: ' + data.orgRangName + ' ' + (window._pravoFirstName||'') + ' ' + (window._pravoLastName||''));
                // Если мы на Hassle — сразу показываем Interaction для всех рангов,
                // не дожидаясь первого открытия меню.
                if (window.App && window.App.isMobile) {
                    setTimeout(function() {
                        _pravoUpdateHassleInteraction(-1);
                        console.log('[PRAVO] 📱 Hassle Interaction показан при старте');
                    }, 500); // небольшая пауза — даём интерфейсам полностью смонтироваться
                }
            } else {
                console.warn('[Profile] ⚠️ Предзагрузка: данные не получены — при первом /dahk будет обычная загрузка');
            }
        });
    });
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
// Открытия с сервера (MainMenu:Open → SHOW_INTERFACE) приходят с массивом [тип_данных:число, вкладка, json]
// и уже содержат нужную вкладку: M и /menu сервер открывает на «Персонаж», /gps — на «Карту», J — на «Задания».
// Переключаем ТОЛЬКО прямые клиентские открытия без вкладки (params пуст или ['not_from_server', 0, ...]).
function _pravoIsBareClientOpen(p) {
    try {
        if (p === undefined || p === null || p === '') return true;
        if (typeof p === 'string') p = JSON.parse(p.replace(/\n/, '\\n'));
        return Array.isArray(p) && p[0] === 'not_from_server' && Number(p[1]) === 0;
    } catch(e) { return false; }
}
function applyMainMenuTabPatch() {
    var _origOI = window.openInterface;
    window.openInterface = function(name, params) {
        var result = _origOI.apply(this, arguments);
        if (name === 'MainMenu' && !window._mvdProfileLoading && _pravoIsBareClientOpen(params)) {
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



// ==================== DRAG ENGINE (общий для всех drag-модулей) ====================
// Один набор обработчиков mouse/touch/click на document (capture-фаза).
// Каждый модуль ниже регистрирует «зону» через _pravoDrag.add({...}):
//   find(target)          → { el, key } | null — что тащим за этот target
//   save(el, key)         — вызывается при отпускании (запомнить позицию)
//   tap: true             — (мобилка) одиночный тап по зоне центрирует элемент
//   absolute / info / clamp — необязательно: своя математика (по умолчанию —
//                           позиционирование по offsetParent и границы экрана)
// PC (Radmir): мышь. Hassle (App.isMobile): тач + тап.
var _pravoDrag = window._pravoDrag || (window._pravoDrag = (function () {
    var zones = [], drag = null, touchMoved = false;

    function isMobile() { return !!(window.App && window.App.isMobile); }
    function leaving(el) { return String(el.className || '').indexOf('leave-active') !== -1; }

    // Переводим элемент в absolute, сохраняя видимую позицию (сбрасываем transform)
    function absolute(el) {
        if (el.style.position === 'absolute' && el.style.left !== '' && el.style.top !== '') return;
        var r = el.getBoundingClientRect();
        var p = (el.offsetParent || document.body).getBoundingClientRect();
        el.style.position = 'absolute';
        el.style.margin = '0';
        el.style.transform = 'none';
        el.style.left = (r.left - p.left) + 'px';
        el.style.top = (r.top - p.top) + 'px';
    }

    // Границы экрана
    function clamp(el, left, top) {
        var w = el.offsetWidth || el.getBoundingClientRect().width;
        var h = el.offsetHeight || el.getBoundingClientRect().height;
        return {
            left: Math.max(0, Math.min(left, window.innerWidth - w)),
            top: Math.max(0, Math.min(top, window.innerHeight - h))
        };
    }

    // Применяет сохранённую позицию один раз на элемент (mark хранится в атрибуте,
    // при пересоздании DOM атрибут пропадает и позиция применится заново)
    function place(el, pos, attr, mark) {
        if (el.getAttribute(attr) === mark) return;
        if (!el.offsetWidth && !el.offsetHeight) return; // ещё не в DOM
        if (pos) {
            var c = clamp(el, parseFloat(pos.left) || 0, parseFloat(pos.top) || 0);
            el.style.position = 'absolute';
            el.style.margin = '0';
            el.style.transform = 'none';
            el.style.left = c.left + 'px';
            el.style.top = c.top + 'px';
        }
        el.setAttribute(attr, mark);
    }

    function find(target) {
        if (!target || !target.closest) return null;
        for (var i = 0; i < zones.length; i++) {
            var f = zones[i].find(target);
            if (f) { f.zone = zones[i]; return f; }
        }
        return null;
    }

    function begin(e, pt) {
        var f = find(pt.target);
        if (!f) return;
        var z = f.zone;
        (z.absolute || absolute)(f.el);
        drag = {
            zone: z, el: f.el, key: f.key,
            info: z.info ? z.info(f.el) : null,
            sx: pt.clientX, sy: pt.clientY,
            sl: parseFloat(f.el.style.left) || 0,
            st: parseFloat(f.el.style.top) || 0
        };
        document.body.style.userSelect = 'none';
        e.preventDefault();
        e.stopPropagation();
    }

    function move(e, pt) {
        var d = drag, i = d.info;
        var c = (d.zone.clamp || clamp)(
            d.el,
            d.sl + (pt.clientX - d.sx) / (i ? i.sx : 1),
            d.st + (pt.clientY - d.sy) / (i ? i.sy : 1),
            i
        );
        d.el.style.left = c.left + 'px';
        d.el.style.top = c.top + 'px';
        e.preventDefault();
    }

    function end() {
        if (!drag) return;
        var d = drag;
        drag = null;
        d.zone.save(d.el, d.key);
        document.body.style.userSelect = '';
    }

    // Мышь (PC)
    document.addEventListener('mousedown', function (e) {
        if (isMobile() || e.button !== 0) return;
        begin(e, e);
    }, true);
    document.addEventListener('mousemove', function (e) {
        if (isMobile() || !drag) return;
        move(e, e);
    }, true);
    document.addEventListener('mouseup', function () {
        if (!isMobile()) end();
    }, true);

    // Тач (мобилка): passive:false обязателен для preventDefault()
    document.addEventListener('touchstart', function (e) {
        if (!isMobile()) return;
        touchMoved = false;
        if (e.touches[0]) begin(e, e.touches[0]);
    }, { capture: true, passive: false });
    document.addEventListener('touchmove', function (e) {
        if (!isMobile()) return;
        touchMoved = true; // палец двигался → это drag, не тап
        if (drag && e.touches[0]) move(e, e.touches[0]);
    }, { capture: true, passive: false });
    document.addEventListener('touchend', function () {
        if (isMobile()) end();
    }, { capture: true, passive: true });

    // Тап (мобилка): одиночный тап по зоне с tap:true центрирует элемент
    document.addEventListener('click', function (e) {
        if (!isMobile() || touchMoved) return;
        var f = find(e.target);
        if (!f || !f.zone.tap) return;
        var el = f.el;
        absolute(el);
        el.style.left = Math.max(0, Math.round((window.innerWidth - (el.offsetWidth || 0)) / 2)) + 'px';
        el.style.top = Math.max(0, Math.round((window.innerHeight - (el.offsetHeight || 0)) / 2)) + 'px';
        f.zone.save(el, f.key);
    }, true);

    return {
        add: function (z) { zones.push(z); },
        cancel: function () { drag = null; },
        isMobile: isMobile, leaving: leaving, place: place
    };
})());
// ==================== END DRAG ENGINE ====================

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

var _pollTimer = null;

// Сброс сохранённых позиций
window._pravoResetDialogPositions = function () {
    _savedPositions = {};
    console.log('[PRAVO] Позиции диалогов сброшены');
};

function _isOurDialog(id) {
    return (id >= 666 && id <= 679) || id === 695 || id === 696;
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
// 678 и 679 — диалоги выдачи лицензий, у каждого своя отдельная позиция,
// не связанная с остальными АХК-диалогами.
function _getPositionKey() {
    var groups = {
        667: 'pravo-list-menu',
        677: 'pravo-list-menu',

        666: 'pravo-select',
        668: 'pravo-input',

        678: 'givelic-id-input',   // ввод ID игрока — своя позиция
        679: 'givelic-type-list',  // выбор типа лицензии — своя позиция

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
        typeof window.setDrawLabelStatus === 'function' &&
        !(window._pravoShouldHideLabels && window._pravoShouldHideLabels())
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

    // mark включает и группу, и текущий ID, чтобы при смене диалога внутри
    // одной группы позиция всё равно повторно применялась.
    var key = _getPositionKey();
    _pravoDrag.place(w, _savedPositions[key], 'data-pravo-pos', 'pravo-pos-' + key + '-' + _currentDialogId);
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
// Логика перетаскивания/тапа — в общем _pravoDrag. Здесь только: что считается
// заголовком нашего диалога и куда сохранять позицию.
_pravoDrag.add({
    tap: true,
    find: function (t) {
        if (!_active || _menuHidden) return null;
        var title = t.closest('.modal__title');
        if (!title) return null;
        var w = title.closest('.modal-container-wrapper');
        if (!w || !w.isConnected || !w.closest('.window') || _pravoDrag.leaving(w)) return null;
        return { el: w };
    },
    save: function (w) {
        if (_currentDialogId === null) return;
        _savedPositions[_getPositionKey()] = { left: w.style.left, top: w.style.top };
    }
});

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
        typeof window.setDrawLabelStatus === 'function' &&
        !(window._pravoShouldHideLabels && window._pravoShouldHideLabels())
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

    _pravoDrag.cancel();
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

console.log('[PRAVO] Window/Modal cursor/hide/drag v5 готов (Alt=курсор, Alt>=500мс=диалог)');

})();
// ==================== END WINDOW/MODAL: CURSOR / HIDE / DRAG ====================

// ==================== ZKM / SIDEMENU: DRAG ====================
// Перетаскивание кастомных интерфейсов ZKM и SideMenu (открываются через
// openInterface, поэтому не зависят от Window/Modal drag). Сама механика — в _pravoDrag.
// Позиция хранится в _savedPos и восстанавливается поллингом (200 мс).
;(function () {
'use strict';

if (window.__pravoCustomIfaceDragV1) return;
window.__pravoCustomIfaceDragV1 = true;

// rootSel    — корневой .modal интерфейса
// dragZone   — зоны, за которые тащим
// noInteract — элементы внутри dragZone, по которым drag НЕ начинается
// posKey     — ключ для _savedPos
var IFACES = [
    { rootSel: '.modal.zkm', dragZone: '.modal__title, .zkm__subheader',
      noInteract: '.laws-helper__icon-btn, .laws-helper__tab', posKey: 'zkm' },
    { rootSel: '.modal.side-menu', dragZone: '.modal__title', noInteract: null, posKey: 'side-menu' }
];

var _savedPos = {};

_pravoDrag.add({
    find: function (t) {
        for (var i = 0; i < IFACES.length; i++) {
            var cfg = IFACES[i], zone = t.closest(cfg.dragZone);
            if (!zone) continue;
            if (cfg.noInteract && t.closest(cfg.noInteract)) return null;
            var w = zone.closest('.modal-container-wrapper');
            // не трогаем карточку, которая уходит через transition
            if (!w || !w.isConnected || !w.closest(cfg.rootSel) || _pravoDrag.leaving(w)) return null;
            return { el: w, key: cfg.posKey };
        }
        return null;
    },
    save: function (w, key) {
        _savedPos[key] = { left: w.style.left, top: w.style.top };
        w.setAttribute('data-cif-pos', 'cif-' + key);
    }
});

// Восстановление позиции при повторном открытии интерфейса
setInterval(function () {
    IFACES.forEach(function (cfg) {
        var root = document.querySelector(cfg.rootSel);
        var w = root && root.querySelector('.modal-container-wrapper');
        if (!w || !w.isConnected || _pravoDrag.leaving(w)) return;
        _pravoDrag.place(w, _savedPos[cfg.posKey], 'data-cif-pos', 'cif-' + cfg.posKey);
    });
}, 200);

// Сброс позиций через консоль браузера
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
// ==================== INTERACTIONS: DRAG ====================
// Drag для .interactions__container. У Interactions масштабируемый контейнер
// (transform: scale), поэтому своя математика координат: info/absolute/clamp.
;(function () {
'use strict';

if (window.__pravoInteractionsDragV1) return;
window.__pravoInteractionsDragV1 = true;

var ROOT = '.interactions', CONT = '.interactions__container',
    NO_DRAG = '.interactions-list, .interactions-hint', HANDLE = 'pravo-inter-handle',
    _savedPos = null;

(function () {
    var id = 'pravo-inter-drag-css';
    if (document.getElementById(id)) return;
    var s = document.createElement('style');
    s.id = id;
    s.textContent = '.interactions__container{pointer-events:auto!important;cursor:grab}.interactions-list,.interactions-hint{cursor:default}.' + HANDLE + '{display:flex;align-items:center;justify-content:center;width:100%;height:3vh;pointer-events:auto;cursor:grab;flex-basis:100%;flex-shrink:0;order:-1}.' + HANDLE + ':active{cursor:grabbing}.' + HANDLE + '::after{content:"";display:block;width:5vh;height:.35vh;background:rgba(255,255,255,.35);border-radius:1vh}';
    document.head.appendChild(s);
})();

// Ближайший предок с transform/position: его rect и масштаб
function _cb(el) {
    for (var p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        var cs = window.getComputedStyle(p), t = cs.transform;
        if ((t && t !== 'none' && t !== 'matrix(1, 0, 0, 1, 0, 0)') || cs.position !== 'static') {
            var r = p.getBoundingClientRect();
            return { rect: r, sx: r.width / (p.offsetWidth || 1), sy: r.height / (p.offsetHeight || 1) };
        }
    }
    return { rect: { left: 0, top: 0 }, sx: 1, sy: 1 };
}

function _abs(el) {
    if (el.style.position === 'absolute' && el.style.left !== '' && el.style.top !== '') return;
    var i = _cb(el), r = el.getBoundingClientRect();
    el.style.position = 'absolute';
    el.style.right = 'auto';
    el.style.margin = '0';
    el.style.left = ((r.left - i.rect.left) / i.sx) + 'px';
    el.style.top = ((r.top - i.rect.top) / i.sy) + 'px';
}

function _clampS(el, left, top, i) {
    i = i || _cb(el);
    var maxL = (window.innerWidth - i.rect.left) / i.sx - el.offsetWidth,
        maxT = (window.innerHeight - i.rect.top) / i.sy - el.offsetHeight;
    return {
        left: Math.max(-i.rect.left / i.sx, Math.min(left, maxL)),
        top: Math.max(-i.rect.top / i.sy, Math.min(top, maxT))
    };
}

_pravoDrag.add({
    info: _cb, absolute: _abs, clamp: _clampS,
    find: function (t) {
        var c = t.closest(CONT);
        if (!c || !c.closest(ROOT) || t.closest(NO_DRAG)) return null;
        return { el: c };
    },
    save: function (el) {
        _savedPos = { left: parseFloat(el.style.left), top: parseFloat(el.style.top) };
        el.setAttribute('data-pr-inter-pos', '1');
    }
});

// Поллинг: ручка для тача (мобилка) + восстановление позиции
setInterval(function () {
    var c = document.querySelector(ROOT + ' ' + CONT);
    if (!c || !c.isConnected) return;
    if (_pravoDrag.isMobile() && !c.querySelector('.' + HANDLE)) {
        var h = document.createElement('div');
        h.className = HANDLE;
        c.insertBefore(h, c.firstChild);
    }
    if (!_savedPos || c.getAttribute('data-pr-inter-pos') === '1' || !c.offsetWidth) return;
    _abs(c);
    var p = _clampS(c, _savedPos.left, _savedPos.top, _cb(c));
    c.style.left = p.left + 'px';
    c.style.top = p.top + 'px';
    c.setAttribute('data-pr-inter-pos', '1');
}, 200);

window._pravoResetInteractionsPos = function () {
    _savedPos = null;
    var el = document.querySelector(ROOT + ' ' + CONT);
    if (el) el.removeAttribute('data-pr-inter-pos');
    console.log('[PRAVO] Interactions позиция сброшена');
};

console.log('[PRAVO] Interactions drag v1 готов  (PC=mouse / Hassle=touch)');

})();
// ==================== END INTERACTIONS: DRAG ====================
}); // конец callback _nickCheck
