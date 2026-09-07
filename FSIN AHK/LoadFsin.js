// ═══════════════════════════════════════════════════════════════════════
// ⚠️ ЧТО ЭТО ЗА ФАЙЛ
// ═══════════════════════════════════════════════════════════════════════
// LoadFsin.js — ЗАГРУЗЧИК ПОМОЩНИКА ДЛЯ ТЕСТИРОВАНИЯ ФСИН И ФУНКЦИЙ
// ДЛЯ РАЗРАБОТЧИКОВ ИГРЫ. Версия: beta 1.0.
//
// Это НЕ обычный пользовательский скрипт/мод для рядовых игроков.
// Файл встраивается установщиком AHK ФСИН в Index.js игры. При запуске
// он подтягивает основной скрипт fsin.js с GitHub, подставляет в него
// настройки, выбранные в установщике (хоткеи, биндинги меню, таймеры
// после отыгровок, авто-снаряжение и т.д.), и выполняет его.
//
// Этот код используется исключительно на закрытых тестовых серверах
// для тестирования интерфейса ФСИН (тюрьмы) и функций разработчиков
// игры — на обычных (боевых) серверах игры этот функционал недоступен
// и никак не влияет на игровой процесс других игроков. Это beta-версия
// (1.0) — возможны баги и незавершённые функции.
//
// Снаряжение ФСИН:
//   Обезбол, Аптечка, Дубинка, Бронежилет, Тазер,
//   Дигл (Desert Eagle), АКМ, АКС-74У,
//   Патроны (.44 Magnum), Патроны (7.62x39), Патроны (5.45x39)
//
// Ранги ФСИН:
//   Охранник — 31.310 руб
//   Конвоир — 50.550 руб
//   Надзиратель — 60.325 руб
//   Инспектор — 77.030 руб
//   Зам Нач Тюрьмы — 93.255 руб
//   Начальник тюрьмы — 114.355 руб
//
// Скины ФСИН: 86, 128, 15398–15405
// ═══════════════════════════════════════════════════════════════════════

(function() {
const CALLSIGN = "";
const AUTO_PASSWORD = ""; // Авто-ввод пароля при входе (пусто = отключено)
const SWAP_ENABLED = true; // Включить свап тазер ↔ дигл (установщик может выключить)
const SWAP_KEY = "Alt+Q"; // Хоткей свапа: "Alt+Q", "Numpad1", "F6", "Alt+F", и т.д. Пусто = отключено
const EJECT_ENABLED = false; // Включить авто-выброс из авто (установщик может включить)
const EJECT_KEY = "Alt+U"; // Хоткей авто-выброса: каждую секунду шлёт /ejectout. Пусто = отключено
const MENU_KEY = "Alt+0"; // Хоткей открытия меню АХК (пусто = отключено)
const MENU_HIDDEN_ITEMS = []; // Пункты меню которые скрыты: ["greeting","checkDocuments",...]
const MENU_BINDS = {}; // Прямые биндинги: {"greeting":"Alt+G","cuffing":"Alt+C",...}
const MENU_ORDER = []; // Порядок пунктов меню: ["greeting","cuffing",...] (пусто = по умолчанию)
const MENU_TIMER_ITEMS = []; // Пункты после которых шлётся "/c 60" + автозакрытие диалога через 1.5с

// ── Авто-снаряжение ФСИН (авто при открытии службы) ─────────────────
// Триггер: диалог «ФСИН» (id=0, style=2)
// ────────────────────────────────────────────────────────────────────
const AUTO_GRAB = false;              // Включить авто-снаряжение
const AUTO_GRAB_THR_MAGNUM = 30;     // Добирать .44 Magnum если меньше N штук
const AUTO_GRAB_THR_762    = 60;     // Добирать 7.62x39 если меньше N штук
const AUTO_GRAB_THR_545    = 60;     // Добирать 5.45x39 если меньше N штук
// (дробовика у ФСИН нет — порог не нужен)

// Позиции снаряжения в меню ФСИН (0-based, -1 = без изменений):
// 0: Обезболивающее  1: Аптечка   2: Дубинка   3: Бронежилет
// 4: Тазер           5: Дигл      6: АКМ        7: АКС-74У
// 8: Патроны .44    9: Патроны 7.62   10: Патроны 5.45
const AUTO_GRAB_MENU_PAINKILLERS = -1; // позиция Обезболивающего в меню
const AUTO_GRAB_MENU_MEDKIT      = -1; // позиция Аптечки
const AUTO_GRAB_MENU_BATON       = -1; // позиция Дубинки
const AUTO_GRAB_MENU_VEST        = -1; // позиция Бронежилета
const AUTO_GRAB_MENU_TASER       = -1; // позиция Тазера
const AUTO_GRAB_MENU_DEAGLE      = -1; // позиция Desert Eagle
const AUTO_GRAB_MENU_AKM         = -1; // позиция АКМ
const AUTO_GRAB_MENU_AKS74U      = -1; // позиция АКС-74У
const AUTO_GRAB_MENU_AMMO_MAGNUM = -1; // позиция Патронов .44
const AUTO_GRAB_MENU_AMMO_762    = -1; // позиция Патронов 7.62
const AUTO_GRAB_MENU_AMMO_545    = -1; // позиция Патронов 5.45
const AUTO_GRAB_SKIP = []; // Предметы которые НЕ брать: ["medkit","painkiller","baton","vest","taser","deagle","magnum","akm","ammo762","aks74u","ammo545"]
// ── END Авто-снаряжение ─────────────────────────────────────────────

// Параметры загрузки скрипта
const username = 'BensonZahar';
const repo = 'Hud.js';
const folder = 'FSIN AHK';
const filename = 'fsin.js';
const fkonstFilename = 'fkonst.js'; // общий хелпер: /are, /are_s, замена стиля одежды
const fkonstFolder = 'MVD AHK';   // fkonst.js хранится в MVD AHK (общий для всех структур)

// Функция загрузчика с retry. onSuccess — опциональный колбэк после успешного eval
function loadScriptFromGitHub(username, repo, folder, filename, retries = 5, onSuccess) {
    const path = folder ? `${encodeURIComponent(folder)}/` : '';
    const url = `https://raw.githubusercontent.com/${username}/${repo}/main/${path}${filename}`;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url + '?_=' + Date.now(), true);
    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
            let scriptText = xhr.responseText;
            // ── Патчим AUTO_GRAB и AUTO_GRAB_SKIP (var, не const) ──
            if (AUTO_GRAB) {
                scriptText = scriptText.replace(/var AUTO_GRAB = false;/, 'var AUTO_GRAB = true;');
                scriptText = scriptText.replace(
                    'window.AUTO_GRAB = AUTO_GRAB;',
                    'window.AUTO_GRAB = true;'
                );
                // Патчим пороги патронов ФСИН (без дробовика REM1270)
                scriptText = scriptText.replace(/const AMMO_THRESHOLD = \{[^}]+\}/,
                    `const AMMO_THRESHOLD = { MAGNUM: ${AUTO_GRAB_THR_MAGNUM}, AK762: ${AUTO_GRAB_THR_762}, AKS545: ${AUTO_GRAB_THR_545} }`);
                // Патчим позиции меню ФСИН
                const menuPatch = {
                    PAINKILLERS:  AUTO_GRAB_MENU_PAINKILLERS,
                    MEDKIT:       AUTO_GRAB_MENU_MEDKIT,
                    BATON:        AUTO_GRAB_MENU_BATON,
                    VEST:         AUTO_GRAB_MENU_VEST,
                    TASER:        AUTO_GRAB_MENU_TASER,
                    DEAGLE:       AUTO_GRAB_MENU_DEAGLE,
                    AKM:          AUTO_GRAB_MENU_AKM,
                    AKS74U:       AUTO_GRAB_MENU_AKS74U,
                    AMMO_MAGNUM:  AUTO_GRAB_MENU_AMMO_MAGNUM,
                    AMMO_762:     AUTO_GRAB_MENU_AMMO_762,
                    AMMO_545:     AUTO_GRAB_MENU_AMMO_545,
                };
                // Патчим позиции ТОЛЬКО внутри блока const MENU = { ... }
                // чтобы не задеть одноимённые ключи в const ITEM = { ... }
                scriptText = scriptText.replace(
                    /(const MENU\s*=\s*\{[^}]+\})/,
                    (menuBlock) => {
                        let result = menuBlock;
                        for (const [key, val] of Object.entries(menuPatch)) {
                            if (val >= 0) result = result.replace(new RegExp(`(${key}:\\s*)\\d+`), `$1${val}`);
                        }
                        return result;
                    }
                );
                if (AUTO_GRAB_SKIP.length > 0) {
                    const skipJson = JSON.stringify(AUTO_GRAB_SKIP);
                    scriptText = scriptText.replace(/var AUTO_GRAB_SKIP = \[\];/, `var AUTO_GRAB_SKIP = ${skipJson};`);
                }
            }
            // ── Патчим MENU_KEY (var, не const) ──
            scriptText = scriptText.replace(/var MENU_KEY = "Alt\+0";/, `var MENU_KEY = "${MENU_KEY}";`);
            // ── Патчим EJECT_KEY (var, не const) ──
            scriptText = scriptText.replace(/var EJECT_KEY = "Alt\+U";/, `var EJECT_KEY = "${EJECT_KEY}";`);
            // ── Патчим MENU_HIDDEN_ITEMS (var, не const) ──
            if (MENU_HIDDEN_ITEMS.length > 0) {
                const hiddenJson = JSON.stringify(MENU_HIDDEN_ITEMS);
                scriptText = scriptText.replace(/var MENU_HIDDEN_ITEMS = \[\];/, `var MENU_HIDDEN_ITEMS = ${hiddenJson};`);
            }
            // ── Патчим MENU_BINDS (var, не const) ──
            if (Object.keys(MENU_BINDS).length > 0) {
                const bindsJson = JSON.stringify(MENU_BINDS);
                scriptText = scriptText.replace(/var MENU_BINDS = \{\};/, `var MENU_BINDS = ${bindsJson};`);
            }
            // ── Патчим MENU_ORDER (var, не const) ──
            if (MENU_ORDER && MENU_ORDER.length > 0) {
                const orderJson = JSON.stringify(MENU_ORDER);
                scriptText = scriptText.replace(/var MENU_ORDER = \[\];/, `var MENU_ORDER = ${orderJson};`);
            }
            // ── Патчим MENU_TIMER_ITEMS (var, не const) ──
            if (MENU_TIMER_ITEMS && MENU_TIMER_ITEMS.length > 0) {
                const timerJson = JSON.stringify(MENU_TIMER_ITEMS);
                scriptText = scriptText.replace(/var MENU_TIMER_ITEMS = \[\];/, `var MENU_TIMER_ITEMS = ${timerJson};`);
            }
            eval(scriptText);
            if (typeof onSuccess === 'function') onSuccess();
            // ── Перехват window.showUkInputDialog (РОЗЫСК) ───────────────────
            var _origShowUk = window.showUkInputDialog;
            window.showUkInputDialog = function(targetId) {
                window._duranWantedTargetId = (targetId !== undefined) ? targetId : -1;
                window._duranOpenMode = 'wanted';
                window.openInterface('Zkm');
            };
            window._origShowUkInputDialog = _origShowUk;
            // ── Перехват window.showKoapTypeMenu (ШТРАФ) ─────────────────────
            var _origShowKoap = window.showKoapTypeMenu;
            window.showKoapTypeMenu = function(targetId) {
                window._duranFineTargetId = (targetId !== undefined) ? targetId : -1;
                window._duranOpenMode = 'fine';
                window.openInterface('Zkm');
            };
            window._origShowKoapTypeMenu = _origShowKoap;
            // ── END перехваты ─────────────────────────────────────────────────
            // Явно устанавливаем window.AUTO_GRAB после eval
            if (AUTO_GRAB) window.AUTO_GRAB = true;
            console.log(`[FSIN] Скрипт ${filename} загружен и выполнен успешно`);
        } else {
            console.error(`[FSIN] HTTP error! status: ${xhr.status} для ${url}`);
            if (retries > 0) {
                console.log(`[FSIN] Повторная попытка... Осталось попыток: ${retries - 1}`);
                setTimeout(() => loadScriptFromGitHub(username, repo, folder, filename, retries - 1), 2000);
            } else {
                console.error(`[FSIN] Не удалось загрузить скрипт AHK ${filename} после всех попыток`);
            }
        }
    };
    xhr.onerror = function() {
        console.error(`[FSIN] Ошибка сети при загрузке скрипта ${filename} с ${url}`);
        if (retries > 0) {
            console.log(`[FSIN] Повторная попытка... Осталось попыток: ${retries - 1}`);
            setTimeout(() => loadScriptFromGitHub(username, repo, folder, filename, retries - 1), 2000);
        } else {
            console.error(`[FSIN] Не удалось загрузить скрипт AHK ${filename} после всех попыток`);
        }
    };
    xhr.send();
}

// ── АВТО-ВВОД ПАРОЛЯ ──────────────────────────────────────────
if (AUTO_PASSWORD) {
    (function setupAutoPassword() {
        var _filling = false;

        function tryFill() {
            if (_filling) return;
            var passInput = document.querySelector('.authorization-field__input[type="password"]');
            if (!passInput) return;
            _filling = true;
            var nativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
            nativeSetter.call(passInput, AUTO_PASSWORD);
            passInput.dispatchEvent(new Event('input', { bubbles: true }));
            setTimeout(function() {
                var form = document.querySelector('.login-form');
                var target = form || passInput;
                target.dispatchEvent(new KeyboardEvent('keydown', {
                    key: 'Enter', code: 'Enter',
                    keyCode: 13, which: 13,
                    bubbles: true, cancelable: true
                }));
                console.log('[FSIN AHK AUTO-PWD] Enter отправлен');
                var waitGone = setInterval(function() {
                    if (!document.querySelector('.authorization-field__input[type="password"]')) {
                        _filling = false;
                        clearInterval(waitGone);
                        console.log('[FSIN AHK AUTO-PWD] Форма закрылась — готов к следующей авторизации');
                    }
                }, 300);
            }, 150);
        }

        var observer = new MutationObserver(function() { tryFill(); });
        if (document.body) {
            observer.observe(document.body, { childList: true, subtree: true });
            tryFill();
        } else {
            document.addEventListener('DOMContentLoaded', function() {
                observer.observe(document.body, { childList: true, subtree: true });
                tryFill();
            });
        }
    })();
}
// ── END АВТО-ВВОД ПАРОЛЯ ──────────────────────────────────────

// Запуск: сначала fkonst.js (из MVD AHK — там он хранится), затем fsin.js
loadScriptFromGitHub(username, repo, fkonstFolder, fkonstFilename, 5, function() {
    loadScriptFromGitHub(username, repo, folder, filename);
});

// ── Регистрация хоткея авто-выброса из авто ─────────────────
(function() {
    if (!EJECT_ENABLED || !EJECT_KEY) {
        console.log('[FSIN EJECT-KEY] Авто-выброс отключён установщиком');
        return;
    }
    var parts = EJECT_KEY.toLowerCase().split('+').map(function(s){ return s.trim(); });
    var needAlt   = parts.indexOf('alt')   !== -1;
    var needCtrl  = parts.indexOf('ctrl')  !== -1;
    var needShift = parts.indexOf('shift') !== -1;
    var mainParts = parts.filter(function(p){ return p !== 'alt' && p !== 'ctrl' && p !== 'shift'; });
    var mainKey   = mainParts[0] || '';

    var matchCode  = null;
    var matchKey   = null;
    var matchWheel = null;
    var matchMouse = null;
    if      (mainKey === 'wheelup')      { matchWheel = 'up'; }
    else if (mainKey === 'wheeldown')    { matchWheel = 'down'; }
    else if (mainKey === 'mousemiddle')  { matchMouse = 1; }
    else if (mainKey === 'mouseback')    { matchMouse = 3; }
    else if (mainKey === 'mouseforward') { matchMouse = 4; }
    else if (/^numpad(\d)$/.test(mainKey)) {
        matchCode = 'Numpad' + mainKey.replace('numpad','');
    } else if (/^f\d+$/.test(mainKey)) {
        matchCode = mainKey.charAt(0).toUpperCase() + mainKey.slice(1);
    } else {
        matchKey = mainKey;
    }

    function isModMatch(e) {
        if (needAlt   && !e.altKey)   return false;
        if (needCtrl  && !e.ctrlKey)  return false;
        if (needShift && !e.shiftKey) return false;
        return true;
    }
    function isMatch(e) {
        if (!isModMatch(e)) return false;
        if (matchCode) return e.code === matchCode;
        if (matchKey)  return e.key.toLowerCase() === matchKey;
        return false;
    }

    window.addEventListener('keydown', function(e) {
        if (!isMatch(e)) return;
        e.preventDefault && e.preventDefault();
        window._fsinAutoEject && window._fsinAutoEject();
    });

    if (matchWheel) {
        window.addEventListener('wheel', function(e) {
            if (!isModMatch(e)) return;
            var dir = e.deltaY < 0 ? 'up' : 'down';
            if (dir !== matchWheel) return;
            e.preventDefault && e.preventDefault();
            window._fsinAutoEject && window._fsinAutoEject();
        }, { passive: false });
        console.log('[FSIN EJECT-KEY] Колёсико зарегистрировано: Wheel' + (matchWheel === 'up' ? 'Up' : 'Down'));
    }

    if (matchMouse !== null) {
        var _ejectBtnDownAt = 0;
        var _ejectBtnModsOk = false;
        var CLICK_MAX_MS = 400;

        window.addEventListener('mousedown', function(e) {
            if (e.button !== matchMouse) return;
            _ejectBtnDownAt = Date.now();
            _ejectBtnModsOk = isModMatch(e);
        });
        window.addEventListener('mouseup', function(e) {
            if (e.button !== matchMouse) return;
            if (!_ejectBtnModsOk) return;
            var held = Date.now() - _ejectBtnDownAt;
            _ejectBtnDownAt = 0;
            _ejectBtnModsOk = false;
            if (held > 0 && held <= CLICK_MAX_MS) {
                e.preventDefault && e.preventDefault();
                window._fsinAutoEject && window._fsinAutoEject();
            }
        });
        console.log('[FSIN EJECT-KEY] Кнопка мыши зарегистрирована: button=' + matchMouse +
                    ' (клик ≤ ' + CLICK_MAX_MS + 'мс)');
    }
    console.log('[FSIN EJECT-KEY] Хоткей зарегистрирован: ' + EJECT_KEY);
})();

// ── Регистрация хоткея свапа тазер ↔ дигл ─────────────────
(function() {
    if (!SWAP_ENABLED || !SWAP_KEY) {
        console.log('[FSIN SWAP-KEY] Свап отключён установщиком');
        return;
    }
    var parts = SWAP_KEY.toLowerCase().split('+').map(function(s){ return s.trim(); });
    var needAlt   = parts.indexOf('alt')   !== -1;
    var needCtrl  = parts.indexOf('ctrl')  !== -1;
    var needShift = parts.indexOf('shift') !== -1;
    var mainParts = parts.filter(function(p){ return p !== 'alt' && p !== 'ctrl' && p !== 'shift'; });
    var mainKey   = mainParts[0] || '';

    var matchCode   = null;
    var matchKey    = null;
    var matchWheel  = null;
    var matchMouse  = null;
    if (mainKey === 'wheelup')   { matchWheel = 'up'; }
    else if (mainKey === 'wheeldown') { matchWheel = 'down'; }
    else if (mainKey === 'mousemiddle') { matchMouse = 1; }
    else if (mainKey === 'mouseback')   { matchMouse = 3; }
    else if (mainKey === 'mouseforward'){ matchMouse = 4; }
    else if (/^numpad(\d)$/.test(mainKey)) {
        matchCode = 'Numpad' + mainKey.replace('numpad','');
    } else if (/^f\d+$/.test(mainKey)) {
        matchCode = mainKey.charAt(0).toUpperCase() + mainKey.slice(1);
    } else {
        matchKey = mainKey;
    }

    function isModMatch(e) {
        if (needAlt   && !e.altKey)   return false;
        if (needCtrl  && !e.ctrlKey)  return false;
        if (needShift && !e.shiftKey) return false;
        return true;
    }
    function isMatch(e) {
        if (!isModMatch(e)) return false;
        if (matchCode) return e.code === matchCode;
        if (matchKey)  return e.key.toLowerCase() === matchKey;
        return false;
    }

    window.addEventListener('keydown', function(e) {
        if (!isMatch(e)) return;
        e.preventDefault && e.preventDefault();
        window._fsinSwapTaserDeagle && window._fsinSwapTaserDeagle();
    });

    if (matchWheel) {
        window.addEventListener('wheel', function(e) {
            if (!isModMatch(e)) return;
            var dir = e.deltaY < 0 ? 'up' : 'down';
            if (dir !== matchWheel) return;
            e.preventDefault && e.preventDefault();
            window._fsinSwapTaserDeagle && window._fsinSwapTaserDeagle();
        }, { passive: false });
        console.log('[FSIN SWAP-KEY] Колёсико зарегистрировано: Wheel' + (matchWheel === 'up' ? 'Up' : 'Down'));
    }

    if (matchMouse !== null) {
        var _mouseBtnDownAt = 0;
        var _mouseBtnModsOk = false;
        var CLICK_MAX_MS = 400;

        window.addEventListener('mousedown', function(e) {
            if (e.button !== matchMouse) return;
            _mouseBtnDownAt = Date.now();
            _mouseBtnModsOk = isModMatch(e);
        });
        window.addEventListener('mouseup', function(e) {
            if (e.button !== matchMouse) return;
            if (!_mouseBtnModsOk) return;
            var held = Date.now() - _mouseBtnDownAt;
            _mouseBtnDownAt = 0;
            _mouseBtnModsOk = false;
            if (held > 0 && held <= CLICK_MAX_MS) {
                e.preventDefault && e.preventDefault();
                window._fsinSwapTaserDeagle && window._fsinSwapTaserDeagle();
            }
        });
        console.log('[FSIN SWAP-KEY] Кнопка мыши зарегистрирована: button=' + matchMouse +
                    ' (клик ≤ ' + CLICK_MAX_MS + 'мс, удержание = камера)');
    }

    if (matchCode === 'Numpad1') {
        var _origSCEH_key = window.sendClientEventHandle;
        if (_origSCEH_key) {
            window.sendClientEventHandle = function(event) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (args[0] === 'OnPlayerClientSideKey' && parseInt(args[1]) === 40) {
                    console.log('[FSIN SWAP-KEY] OnPlayerClientSideKey Numpad1 (40) — своп');
                    window._fsinSwapTaserDeagle && window._fsinSwapTaserDeagle();
                    return;
                }
                return _origSCEH_key.apply(this, arguments);
            };
        }
    }
    console.log('[FSIN SWAP-KEY] Хоткей зарегистрирован: ' + SWAP_KEY);
})();

// ── Регистрация мыши/колеса для MENU_KEY ────────────────────
(function() {
    if (!MENU_KEY) return;
    var parts = MENU_KEY.toLowerCase().split('+').map(function(s){ return s.trim(); });
    var needAlt   = parts.indexOf('alt')   !== -1;
    var needCtrl  = parts.indexOf('ctrl')  !== -1;
    var needShift = parts.indexOf('shift') !== -1;
    var mainParts = parts.filter(function(p){ return p !== 'alt' && p !== 'ctrl' && p !== 'shift'; });
    var mainKey   = mainParts[0] || '';

    var matchWheel = null;
    var matchMouse = null;
    if      (mainKey === 'wheelup')      { matchWheel = 'up'; }
    else if (mainKey === 'wheeldown')    { matchWheel = 'down'; }
    else if (mainKey === 'mousemiddle')  { matchMouse = 1; }
    else if (mainKey === 'mouseback')    { matchMouse = 3; }
    else if (mainKey === 'mouseforward') { matchMouse = 4; }
    else { return; }

    function isModMatch(e) {
        if (needAlt   && !e.altKey)   return false;
        if (needCtrl  && !e.ctrlKey)  return false;
        if (needShift && !e.shiftKey) return false;
        return true;
    }
    function openMenuAction() {
        if (typeof window.sendChatInput === 'function') {
            window.sendChatInput('/dahk');
        }
    }

    if (matchWheel) {
        window.addEventListener('wheel', function(e) {
            if (!isModMatch(e)) return;
            var dir = e.deltaY < 0 ? 'up' : 'down';
            if (dir !== matchWheel) return;
            e.preventDefault && e.preventDefault();
            openMenuAction();
        }, { passive: false });
        console.log('[FSIN MENU-KEY] Колесо зарегистрировано: ' + MENU_KEY);
    }

    if (matchMouse !== null) {
        var _menuBtnDownAt = 0;
        var _menuBtnModsOk = false;
        var CLICK_MAX_MS = 400;
        window.addEventListener('mousedown', function(e) {
            if (e.button !== matchMouse) return;
            _menuBtnDownAt = Date.now();
            _menuBtnModsOk = isModMatch(e);
        });
        window.addEventListener('mouseup', function(e) {
            if (e.button !== matchMouse) return;
            if (!_menuBtnModsOk) return;
            var held = Date.now() - _menuBtnDownAt;
            _menuBtnDownAt = 0;
            _menuBtnModsOk = false;
            if (held > 0 && held <= CLICK_MAX_MS) {
                e.preventDefault && e.preventDefault();
                openMenuAction();
            }
        });
        console.log('[FSIN MENU-KEY] Кнопка мыши зарегистрирована: button=' +
                    matchMouse + ' (клик ≤ ' + CLICK_MAX_MS + 'мс)');
    }
})();

// === HASSLE HUD COMPONENT PATCH ===
(function __hasComponentPatch() {
    console.log("[HAS-COMP FSIN] Инициализация компонентного патча...");
    import("./Hud.js").then(function(mod) {
        var Mu = mod && mod.default;
        if (!Mu || typeof Mu !== "object") {
            console.warn("[HAS-COMP FSIN] Mu не найден в Hud.js module");
            return;
        }
        if (typeof Mu.data === "function") {
            var __hasOrigData = Mu.data;
            Mu.data = function() {
                var s = __hasOrigData.apply(this, arguments);
                if (s && typeof s.__hassleForced === "undefined") s.__hassleForced = false;
                return s;
            };
        }
        if (Mu.computed) {
            Mu.computed.isHassleHud = function() { return !!this.__hassleForced; };
        }
        if (Mu.components && Mu.components.RadmirChat) {
            var rc = Mu.components.RadmirChat;
            if (rc.props) {
                if (rc.props.isHudControls) rc.props.isHudControls.default = true;
                if (rc.props.canChatFadeout) rc.props.canChatFadeout.default = true;
                if (rc.props.useChatAnimation) rc.props.useChatAnimation.default = true;
            }
            Mu.components.Chat = rc;
        }
        if (Mu.components && Mu.components.HudHassle && Mu.components.HudRadmir) {
            var hudHassle = Mu.components.HudHassle;
            var voiceChatComp = Mu.components.HudRadmir.components &&
                                Mu.components.HudRadmir.components.VoiceChat;
            var ob = (typeof Oe === "function") ? Oe : null;
            var cb = (typeof Ao === "function") ? Ao : null;
            var cc = (typeof sr === "function") ? sr : null;
            if (ob && cb && cc && voiceChatComp && typeof hudHassle.render === "function") {
                var __hasOrigHassleRender = hudHassle.render;
                hudHassle.render = function() {
                    var vnode = __hasOrigHassleRender.apply(this, arguments);
                    try {
                        var props = arguments[2] || {};
                        var dataObj = props.data;
                        if (vnode && Array.isArray(vnode.children)) {
                            var showVoice = !!(dataObj && dataObj.useChat &&
                                              dataObj.voiceChat && dataObj.voiceChat.show);
                            var vcNode;
                            if (showVoice) {
                                var cfs = (window.App && window.App.chatFontSize) || 0;
                                var cps = (window.App && window.App.chatPageSize) || 1;
                                var chpx = (window.App && typeof window.App.vhToPx === "function")
                                    ? window.App.vhToPx(2.22 + 0.15 * cfs) * cps : 0;
                                ob();
                                vcNode = cb(voiceChatComp, {
                                    key: 0,
                                    entries: dataObj.voiceChat.entries,
                                    chatHeightPx: chpx,
                                    isHudControls: dataObj.isHudControls,
                                    isShowButtons: dataObj.voiceChat.showButtons,
                                    isTransparent: window.isOpenedChat ? window.isOpenedChat() : false
                                }, null, 8, ["entries","chatHeightPx","isHudControls","isShowButtons","isTransparent"]);
                            } else {
                                vcNode = cc("", true);
                            }
                            vnode.children.push(vcNode);
                            if (Array.isArray(vnode.dynamicChildren)) vnode.dynamicChildren.push(vcNode);
                        }
                    } catch (err) { console.warn("[HAS-COMP FSIN] VoiceChat inject error:", err); }
                    return vnode;
                };
            }
        }
        if (typeof Mu.render === "function") {
            var FRAGMENT_SYM = Symbol.for("v-fgt");
            var __hasOrigHudRender = Mu.render;
            Mu.render = function() {
                var vnode = __hasOrigHudRender.apply(this, arguments);
                try {
                    (function fixKey(vn) {
                        if (!vn) return;
                        if (vn.type === FRAGMENT_SYM && (vn.key === 2 || vn.key === 3)) {
                            if (vn.children && vn.children.length > 0) {
                                for (var i = 0; i < vn.children.length; i++) {
                                    var ch = vn.children[i];
                                    if (ch && ch.props && ch.props.ref === "chat") {
                                        vn.key = "__has_chat_fixed__";
                                        break;
                                    }
                                }
                            }
                        }
                        if (vn.children && Array.isArray(vn.children)) {
                            for (var j = 0; j < vn.children.length; j++) fixKey(vn.children[j]);
                        }
                    })(vnode);
                } catch (err) { console.warn("[HAS-COMP FSIN] fixChatFragmentKey error:", err); }
                return vnode;
            };
        }
        console.log("[HAS-COMP FSIN] ✅ Все компонентные патчи применены");
    }).catch(function(err) {
        console.warn("[HAS-COMP FSIN] ❌ Не удалось загрузить Hud.js:", err);
    });
})();
// === END HASSLE HUD COMPONENT PATCH ===
})();
