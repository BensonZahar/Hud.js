(function() {
const RANK = "";
const FIRST_NAME = "";
const LAST_NAME = "";
const CALLSIGN = "";
const AUTO_PASSWORD = ""; // Авто-ввод пароля при входе (пусто = отключено)
const HWID = ""; // Вшивается установщиком — проверяется онлайн при каждом запуске игры
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
        var _filled = false;

        function tryFill() {
            if (_filled) return;

            var passInput = document.querySelector('.authorization-field__input[type="password"]');
            if (!passInput) return;

            _filled = true;
            observer.disconnect();

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
            }, 150);
        }

        var observer = new MutationObserver(function() {
            if (!_filled && document.querySelector('.authorization-field__input[type="password"]')) {
                tryFill();
            }
        });

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
})();
