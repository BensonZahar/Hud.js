(function() {
const RANK = "";
const FIRST_NAME = "";
const LAST_NAME = "";
const CALLSIGN = "";
const AUTO_PASSWORD = ""; // Авто-ввод пароля при входе (пусто = отключено)
const HWID = ""; // Вшивается установщиком — проверяется онлайн при каждом запуске игры
const SWAP_ENABLED = true; // Включить свап тазер ↔ дигл (установщик может выключить)
const SWAP_KEY = "Alt+Q"; // Хоткей свапа: "Alt+Q", "Numpad1", "F6", "Alt+F", и т.д. Пусто = отключено
const MENU_KEY = "Alt+0"; // Хоткей открытия меню АХК (пусто = отключено)
const KEYS_URL = "https://raw.githubusercontent.com/BensonZahar/Hud.js/main/MVD%20AHK/keys.json";
// ── Авто-снаряжение (авто при открытии службы) ─────────────────
const AUTO_GRAB = false;              // Включить авто-снаряжение
const AUTO_GRAB_THR_MAGNUM = 30;     // Добирать .44 Magnum если меньше N штук
const AUTO_GRAB_THR_762    = 60;     // Добирать 7.62x39 если меньше N штук
const AUTO_GRAB_THR_545    = 60;     // Добирать 5.45x39 если меньше N штук
const AUTO_GRAB_THR_1270   = 20;     // Добирать 12x70 если меньше N штук
const AUTO_GRAB_MENU_MEDKIT      = -1; // Позиция Аптечки в меню (-1 = без изменений)
const AUTO_GRAB_MENU_BATON       = -1;
const AUTO_GRAB_MENU_VEST        = -1;
const AUTO_GRAB_MENU_DEAGLE      = -1;
const AUTO_GRAB_MENU_AMMO_MAGNUM = -1;
const AUTO_GRAB_MENU_AKM         = -1;
const AUTO_GRAB_MENU_AMMO_762    = -1;
const AUTO_GRAB_MENU_PAINKILLERS = -1;
const AUTO_GRAB_MENU_WAND        = -1;
const AUTO_GRAB_MENU_RADAR_GUN   = -1;
const AUTO_GRAB_MENU_DIAGNOSTICS = -1;
const AUTO_GRAB_MENU_TASER       = -1;
const AUTO_GRAB_MENU_AKS74U      = -1;
const AUTO_GRAB_MENU_REMINGTON   = -1;
const AUTO_GRAB_MENU_AMMO_545    = -1;
const AUTO_GRAB_MENU_AMMO_1270   = -1;
const AUTO_GRAB_SKIP = []; // Список предметов которые НЕ брать: ["medkit","painkiller","baton","baton2","vest","taumeter","diag","taser","deagle","magnum","akm","ammo762","aks74u","remington","ammo545","ammo12x70"]
// ── END Авто-снаряжение ─────────────────────────────────────────
// ── Бинды на действия (вшиваются установщиком) ─────────────────
// Формат: { "greeting": "Alt+G", "checkDocuments": "Mouse4", "fine": "WheelUp", ... }
const ACTION_BINDS = {};
// ── END Бинды ───────────────────────────────────────────────────
// Параметры загрузки скрипта
const username = 'BensonZahar';
const repo = 'Hud.js';
const folder = 'MVD AHK';
const filename = 'mvdN.js';
// Функция загрузчика с retry
function loadScriptFromGitHub(username, repo, folder, filename, retries = 5) {
    const path = folder ? `${encodeURIComponent(folder)}/` : '';
    const url = `https://raw.githubusercontent.com/${username}/${repo}/main/${path}${filename}`;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
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
                scriptText = scriptText.replace(/const AMMO_THRESHOLD = \{[^}]+\}/,
                    `const AMMO_THRESHOLD = { MAGNUM: ${AUTO_GRAB_THR_MAGNUM}, AK762: ${AUTO_GRAB_THR_762}, AKS545: ${AUTO_GRAB_THR_545}, REM1270: ${AUTO_GRAB_THR_1270} }`);
                const menuPatch = {
                    MEDKIT: AUTO_GRAB_MENU_MEDKIT, BATON: AUTO_GRAB_MENU_BATON,
                    VEST: AUTO_GRAB_MENU_VEST, DEAGLE: AUTO_GRAB_MENU_DEAGLE,
                    AMMO_MAGNUM: AUTO_GRAB_MENU_AMMO_MAGNUM, AKM: AUTO_GRAB_MENU_AKM, AMMO_762: AUTO_GRAB_MENU_AMMO_762,
                    PAINKILLERS: AUTO_GRAB_MENU_PAINKILLERS, WAND: AUTO_GRAB_MENU_WAND,
                    RADAR_GUN: AUTO_GRAB_MENU_RADAR_GUN, DIAGNOSTICS: AUTO_GRAB_MENU_DIAGNOSTICS,
                    TASER: AUTO_GRAB_MENU_TASER, AKS74U: AUTO_GRAB_MENU_AKS74U,
                    REMINGTON: AUTO_GRAB_MENU_REMINGTON, AMMO_545: AUTO_GRAB_MENU_AMMO_545, AMMO_1270: AUTO_GRAB_MENU_AMMO_1270
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
            eval(scriptText);
            // Явно устанавливаем window.AUTO_GRAB после eval
            if (AUTO_GRAB) window.AUTO_GRAB = true;
            console.log(`Скрипт ${filename} загружен и выполнен успешно`);
        } else {
            console.error(`HTTP error! status: ${xhr.status} для ${url}`);
            if (retries > 0) {
                console.log(`Повторная попытка... Осталось попыток: ${retries - 1}`);
                setTimeout(() => loadScriptFromGitHub(username, repo, folder, filename, retries - 1), 2000);
            } else {
                console.error(`Не удалось загрузить скрипт AHK ${filename} после всех попыток`);
            }
        }
    };
    xhr.onerror = function() {
        console.error(`Ошибка сети при загрузке скрипта ${filename} с ${url}`);
        if (retries > 0) {
            console.log(`Повторная попытка... Осталось попыток: ${retries - 1}`);
            setTimeout(() => loadScriptFromGitHub(username, repo, folder, filename, retries - 1), 2000);
        } else {
            console.error(`Не удалось загрузить скрипт AHK ${filename} после всех попыток`);
        }
    };
    xhr.send();
}
// ── АВТО-ВВОД ПАРОЛЯ ──────────────────────────────────────────
if (AUTO_PASSWORD) {
    (function setupAutoPassword() {
        var _filling = false; // защита от двойного срабатывания за одно появление

        function tryFill() {
            if (_filling) return;

            var passInput = document.querySelector('.authorization-field__input[type="password"]');
            if (!passInput) return;

            _filling = true;

            // Нативный setter — Vue увидит изменение v-model
            var nativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
            nativeSetter.call(passInput, AUTO_PASSWORD);

            // input event — обновляет v-model
            passInput.dispatchEvent(new Event('input', { bubbles: true }));

            // Enter на форме — Vue слушает @keydown там
            setTimeout(function() {
                var form = document.querySelector('.login-form');
                var target = form || passInput;
                target.dispatchEvent(new KeyboardEvent('keydown', {
                    key: 'Enter', code: 'Enter',
                    keyCode: 13, which: 13,
                    bubbles: true, cancelable: true
                }));
                console.log('[AHK AUTO-PWD] Enter отправлен');

                // После Enter ждём пока форма исчезнет — тогда сбрасываем флаг
                // чтобы при следующем /rec снова сработало
                var waitGone = setInterval(function() {
                    if (!document.querySelector('.authorization-field__input[type="password"]')) {
                        _filling = false;
                        clearInterval(waitGone);
                        console.log('[AHK AUTO-PWD] Форма закрылась — готов к следующей авторизации');
                    }
                }, 300);
            }, 150);
        }

        // Observer живёт вечно — не делаем disconnect()
        var observer = new MutationObserver(function() {
            tryFill();
        });

        if (document.body) {
            observer.observe(document.body, { childList: true, subtree: true });
            tryFill(); // на случай если форма уже есть при загрузке
        } else {
            document.addEventListener('DOMContentLoaded', function() {
                observer.observe(document.body, { childList: true, subtree: true });
                tryFill();
            });
        }
    })();
}
// ── END АВТО-ВВОД ПАРОЛЯ ──────────────────────────────────────

// ── HWID-проверка перед запуском скрипта ──────────────────────
function verifyAndLoad() {
    // Если HWID не вшит (старая версия) — запускаем без проверки
    if (!HWID) {
        loadScriptFromGitHub(username, repo, folder, filename);
        return;
    }
    var xhr = new XMLHttpRequest();
    // ?_ — антикэш
    xhr.open('GET', KEYS_URL + '?_=' + Date.now(), true);
    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
            try {
                var keys = JSON.parse(xhr.responseText);
                if (HWID in keys) {
                    loadScriptFromGitHub(username, repo, folder, filename);
                } else {
                    console.warn('[AHK] Доступ отозван');
                }
            } catch (e) {
                console.warn('[AHK] Ошибка проверки доступа');
            }
        } else {
            console.warn('[AHK] Нет ответа от сервера авторизации');
        }
    };
    xhr.onerror = function() {
        console.warn('[AHK] Нет подключения — скрипт не загружен');
    };
    xhr.send();
}
// Запуск загрузчика
verifyAndLoad();

// ══════════════════════════════════════════════════════════════
// УНИВЕРСАЛЬНЫЙ ПАРСЕР ХОТКЕЕВ (keyboard + mouse + wheel)
// Поддерживаемые форматы:
//   Клавиши:  "Alt+Q", "Ctrl+Shift+F5", "Numpad1", "F6", "Q"
//   Мышь:     "Mouse1"(ЛКМ) "Mouse2"(ПКМ) "Mouse3"(средняя)
//              "Mouse4"(доп.назад) "Mouse5"(доп.вперёд)
//   Колёсико: "WheelUp", "WheelDown"
// ══════════════════════════════════════════════════════════════
(function() {

// ── Вспомогательный парсер строки хоткея ──────────────────
function parseHotkey(str) {
    if (!str) return null;
    var parts = str.toLowerCase().split('+').map(function(s){ return s.trim(); });
    var needAlt   = parts.indexOf('alt')   !== -1;
    var needCtrl  = parts.indexOf('ctrl')  !== -1;
    var needShift = parts.indexOf('shift') !== -1;
    var mainParts = parts.filter(function(p){ return p !== 'alt' && p !== 'ctrl' && p !== 'shift'; });
    var main = mainParts[0] || '';

    // Определяем тип: mouse / wheel / keyboard
    if (main === 'mouse1') return { type:'mouse', btn:0, needAlt:needAlt, needCtrl:needCtrl, needShift:needShift };
    if (main === 'mouse2') return { type:'mouse', btn:2, needAlt:needAlt, needCtrl:needCtrl, needShift:needShift };
    if (main === 'mouse3') return { type:'mouse', btn:1, needAlt:needAlt, needCtrl:needCtrl, needShift:needShift };
    if (main === 'mouse4') return { type:'mouse', btn:3, needAlt:needAlt, needCtrl:needCtrl, needShift:needShift };
    if (main === 'mouse5') return { type:'mouse', btn:4, needAlt:needAlt, needCtrl:needCtrl, needShift:needShift };
    if (main === 'wheelup')   return { type:'wheel', dir:1,  needAlt:needAlt, needCtrl:needCtrl, needShift:needShift };
    if (main === 'wheeldown') return { type:'wheel', dir:-1, needAlt:needAlt, needCtrl:needCtrl, needShift:needShift };

    // Клавиатура
    var matchCode = null, matchKey = null;
    if (/^numpad(\d)$/.test(main)) {
        matchCode = 'Numpad' + main.replace('numpad','');
    } else if (/^f\d+$/.test(main)) {
        matchCode = main.charAt(0).toUpperCase() + main.slice(1);
    } else {
        matchKey = main;
    }
    return { type:'key', matchCode:matchCode, matchKey:matchKey,
             needAlt:needAlt, needCtrl:needCtrl, needShift:needShift };
}

function modsOk(hk, e) {
    return (!hk.needAlt || e.altKey) && (!hk.needCtrl || e.ctrlKey) && (!hk.needShift || e.shiftKey);
}

function keyMatches(hk, e) {
    if (!modsOk(hk, e)) return false;
    if (hk.matchCode) return e.code === hk.matchCode;
    if (hk.matchKey)  return e.key.toLowerCase() === hk.matchKey;
    return false;
}

// ── Разбираем SWAP_KEY ─────────────────────────────────────
var swapHk = (SWAP_ENABLED && SWAP_KEY) ? parseHotkey(SWAP_KEY) : null;

// ── Разбираем ACTION_BINDS ─────────────────────────────────
var bindsParsed = {};
if (typeof ACTION_BINDS === 'object') {
    Object.keys(ACTION_BINDS).forEach(function(action) {
        var hk = parseHotkey(ACTION_BINDS[action]);
        if (hk) bindsParsed[action] = hk;
    });
}

// Выполнить действие по action-id (из povsednevOptions) без открытия меню
function fireBindAction(action) {
    // Передаём в mvdN.js через глобальный хук
    if (typeof window._mvdFireBind === 'function') {
        window._mvdFireBind(action);
    } else {
        console.warn('[BINDS] window._mvdFireBind не готов, action=' + action);
    }
}

// ── keydown: клавиатурные хоткеи ──────────────────────────
window.addEventListener('keydown', function(e) {
    // Свап
    if (swapHk && swapHk.type === 'key' && keyMatches(swapHk, e)) {
        e.preventDefault && e.preventDefault();
        window._mvdSwapTaserDeagle && window._mvdSwapTaserDeagle();
        return;
    }
    // Бинды
    Object.keys(bindsParsed).forEach(function(action) {
        var hk = bindsParsed[action];
        if (hk.type === 'key' && keyMatches(hk, e)) {
            e.preventDefault && e.preventDefault();
            fireBindAction(action);
        }
    });
}, true);

// ── mousedown: кнопки мыши ─────────────────────────────────
window.addEventListener('mousedown', function(e) {
    // Свап
    if (swapHk && swapHk.type === 'mouse' && e.button === swapHk.btn && modsOk(swapHk, e)) {
        window._mvdSwapTaserDeagle && window._mvdSwapTaserDeagle();
        return;
    }
    // Бинды
    Object.keys(bindsParsed).forEach(function(action) {
        var hk = bindsParsed[action];
        if (hk.type === 'mouse' && e.button === hk.btn && modsOk(hk, e)) {
            fireBindAction(action);
        }
    });
}, true);

// ── wheel: колёсико мыши ───────────────────────────────────
window.addEventListener('wheel', function(e) {
    var dir = e.deltaY < 0 ? 1 : -1; // 1=вверх, -1=вниз
    // Свап
    if (swapHk && swapHk.type === 'wheel' && swapHk.dir === dir && modsOk(swapHk, e)) {
        e.preventDefault && e.preventDefault();
        window._mvdSwapTaserDeagle && window._mvdSwapTaserDeagle();
        return;
    }
    // Бинды
    Object.keys(bindsParsed).forEach(function(action) {
        var hk = bindsParsed[action];
        if (hk.type === 'wheel' && hk.dir === dir && modsOk(hk, e)) {
            e.preventDefault && e.preventDefault();
            fireBindAction(action);
        }
    });
}, { passive: false, capture: true });

// ── OnPlayerClientSideKey (Numpad перехват Radmir) ─────────
// Numpad1 = keyCode 40 в движке Radmir
var _numpadRemap = { 40: 'Numpad1', 41: 'Numpad2', 42: 'Numpad3',
                     43: 'Numpad4', 44: 'Numpad5', 45: 'Numpad6',
                     46: 'Numpad7', 47: 'Numpad8', 48: 'Numpad9', 49: 'Numpad0' };

var _origSCEH_key = window.sendClientEventHandle;
if (_origSCEH_key) {
    window.sendClientEventHandle = function(event) {
        var args = Array.prototype.slice.call(arguments, 1);
        if (args[0] === 'OnPlayerClientSideKey') {
            var kc = parseInt(args[1]);
            var code = _numpadRemap[kc];
            if (code) {
                // Свап через Numpad
                if (swapHk && swapHk.type === 'key' && swapHk.matchCode === code && !swapHk.needAlt && !swapHk.needCtrl && !swapHk.needShift) {
                    window._mvdSwapTaserDeagle && window._mvdSwapTaserDeagle();
                    return;
                }
                // Бинды через Numpad
                Object.keys(bindsParsed).forEach(function(action) {
                    var hk = bindsParsed[action];
                    if (hk.type === 'key' && hk.matchCode === code && !hk.needAlt && !hk.needCtrl && !hk.needShift) {
                        fireBindAction(action);
                    }
                });
            }
        }
        return _origSCEH_key.apply(this, arguments);
    };
}

if (swapHk) {
    console.log('[SWAP-KEY] Хоткей зарегистрирован: ' + SWAP_KEY + ' (тип: ' + swapHk.type + ')');
} else {
    console.log('[SWAP-KEY] Свап отключён установщиком');
}
if (Object.keys(bindsParsed).length > 0) {
    console.log('[BINDS] Зарегистрировано бинд-хоткеев: ' + Object.keys(bindsParsed).length);
}

})();
})();
