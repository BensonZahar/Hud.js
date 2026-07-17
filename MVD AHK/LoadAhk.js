(function() {
    const CALLSIGN = " ";
    const AUTO_PASSWORD = " "; // Авто-ввод пароля при входе (пусто = отключено)
    const HWID = " "; // Вшивается установщиком — проверяется онлайн при каждом запуске игры
    const SWAP_ENABLED = true; // Включить свап тазер ↔ дигл
    const SWAP_KEY = "Alt+Q"; // Хоткей свапа
    const MENU_KEY = "Alt+0"; // Хоткей открытия меню АХК
    const MENU_HIDDEN_ITEMS = []; // Скрытые пункты меню
    const MENU_BINDS = {}; // Прямые биндинги
    const MENU_ORDER = []; // Порядок пунктов меню
    const MENU_TIMER_ITEMS = []; // Пункты с таймером "/c 60"
    const KEYS_URL = "https://raw.githubusercontent.com/BensonZahar/Hud.js/main/MVD%20AHK/keys.json";
    
    // ── Авто-снаряжение ─────────────────
    const AUTO_GRAB = false;
    const AUTO_GRAB_THR_MAGNUM = 30;
    const AUTO_GRAB_THR_762    = 60;
    const AUTO_GRAB_THR_545    = 60;
    const AUTO_GRAB_THR_1270   = 20;
    const AUTO_GRAB_MENU_MEDKIT      = -1;
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
    const AUTO_GRAB_SKIP = [];
    // ── END Авто-снаряжение ─────────────────────────────────────────

    const username = 'BensonZahar';
    const repo = 'Hud.js';
    const folder = 'MVD AHK';
    const filename = 'mvdF.js';

    // Функция показа видимой ошибки игроку (если консоль закрыта)
    function showLoadError(msg) {
        console.error('[AHK] ' + msg);
        try {
            if (window.ZkmScreenNotification && typeof window.ZkmScreenNotification.add === 'function') {
                window.ZkmScreenNotification.add(`[1, "Ошибка AHK", "${msg}", "FF0000", 10000]`);
            } else if (window.snAdd && typeof window.snAdd === 'function') {
                window.snAdd(`[1, "Ошибка AHK", "${msg}", "FF0000", 10000]`);
            } else {
                const div = document.createElement('div');
                // ИСПРАВЛЕНО: используем тот же шрифт, что и в ZkmScreenNotification.css, 
                // чтобы избежать квадратиков вместо кириллицы в CEF
                div.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#ff0000;color:#fff;padding:15px 25px;border-radius:8px;z-index:999999;font-family:"Open Sans", var(--fallback-font), Arial, sans-serif;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.5);text-align:center;max-width:80%;';
                div.textContent = '⚠️ Ошибка загрузки AHK: ' + msg;
                document.body.appendChild(div);
                setTimeout(() => div.remove(), 15000);
            }
        } catch(e) {}
    }

    function loadScriptFromGitHub(username, repo, folder, filename, retries = 5, useFallback = false) {
        const path = folder ? `${encodeURIComponent(folder)}/` : '';
        // Если основная ссылка блокируется в РФ, используем jsdelivr как запасной вариант
        const baseUrl = useFallback
            ? `https://cdn.jsdelivr.net/gh/${username}/${repo}@main/${path}`
            : `https://raw.githubusercontent.com/${username}/${repo}/main/${path}`;
        const url = baseUrl + filename;

        const xhr = new XMLHttpRequest();
        xhr.timeout = 10000; // 10 секунд таймаут (критично для РФ)

        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                let scriptText = xhr.responseText;
                
                try {
                    // ── Патчим AUTO_GRAB ──
                    if (AUTO_GRAB) {
                        scriptText = scriptText.replace(/var AUTO_GRAB = false;/, 'var AUTO_GRAB = true;');
                        scriptText = scriptText.replace(/window\.AUTO_GRAB = AUTO_GRAB;/, 'window.AUTO_GRAB = true;');
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
                        
                        scriptText = scriptText.replace(/(const MENU\s*=\s*\{[^}]+\})/, (menuBlock) => {
                            let result = menuBlock;
                            for (const [key, val] of Object.entries(menuPatch)) {
                                if (val >= 0) result = result.replace(new RegExp(`(${key}:\\s*)\\d+`), `$1${val}`);
                            }
                            return result;
                        });

                        if (AUTO_GRAB_SKIP.length > 0) {
                            const skipJson = JSON.stringify(AUTO_GRAB_SKIP);
                            // ИСПРАВЛЕНО: добавлено экранирование \[\s*\]
                            scriptText = scriptText.replace(/var AUTO_GRAB_SKIP = \[\s*\];/, `var AUTO_GRAB_SKIP = ${skipJson};`);
                        }
                    }

                    // ── Патчим настройки меню (ИСПРАВЛЕНЫ ВСЕ REGEX С {} и []) ──
                    scriptText = scriptText.replace(/var MENU_KEY = "Alt\+0";/, `var MENU_KEY = "${MENU_KEY}";`);
                    
                    if (MENU_HIDDEN_ITEMS.length > 0) {
                        const hiddenJson = JSON.stringify(MENU_HIDDEN_ITEMS);
                        scriptText = scriptText.replace(/var MENU_HIDDEN_ITEMS = \[\s*\];/, `var MENU_HIDDEN_ITEMS = ${hiddenJson};`);
                    }
                    if (Object.keys(MENU_BINDS).length > 0) {
                        const bindsJson = JSON.stringify(MENU_BINDS);
                        scriptText = scriptText.replace(/var MENU_BINDS = \{\s*\};/, `var MENU_BINDS = ${bindsJson};`);
                    }
                    if (MENU_ORDER && MENU_ORDER.length > 0) {
                        const orderJson = JSON.stringify(MENU_ORDER);
                        scriptText = scriptText.replace(/var MENU_ORDER = \[\s*\];/, `var MENU_ORDER = ${orderJson};`);
                    }
                    if (MENU_TIMER_ITEMS && MENU_TIMER_ITEMS.length > 0) {
                        const timerJson = JSON.stringify(MENU_TIMER_ITEMS);
                        scriptText = scriptText.replace(/var MENU_TIMER_ITEMS = \[\s*\];/, `var MENU_TIMER_ITEMS = ${timerJson};`);
                    }

                    // ── Выполнение скрипта с защитой try-catch ──
                    eval(scriptText);
                    
                    // ── Перехват окон после успешного eval ──
                    var _origShowUk = window.showUkInputDialog;
                    window.showUkInputDialog = function(targetId) {
                        window._duranWantedTargetId = (targetId !== undefined) ? targetId : -1;
                        window._duranOpenMode = 'wanted';
                        window.openInterface('Zkm');
                    };
                    window._origShowUkInputDialog = _origShowUk;

                    var _origShowKoap = window.showKoapTypeMenu;
                    window.showKoapTypeMenu = function(targetId) {
                        window._duranFineTargetId = (targetId !== undefined) ? targetId : -1;
                        window._duranOpenMode = 'fine';
                        window.openInterface('Zkm');
                    };
                    window._origShowKoapTypeMenu = _origShowKoap;

                    if (AUTO_GRAB) window.AUTO_GRAB = true;
                    console.log(`[AHK] ✅ Скрипт ${filename} загружен и выполнен успешно`);
                    
                } catch (e) {
                    console.error(`[AHK] ❌ КРИТИЧЕСКАЯ ОШИБКА выполнения ${filename}:`, e);
                    showLoadError('Ошибка выполнения скрипта: ' + e.message);
                }
            } else {
                console.error(`[AHK] HTTP error! status: ${xhr.status} для ${url}`);
                if (retries > 0) {
                    if (!useFallback) {
                        console.log('[AHK] ⚠️ Основная ссылка недоступна, переключаюсь на запасной CDN (jsdelivr)...');
                        loadScriptFromGitHub(username, repo, folder, filename, retries, true);
                    } else {
                        console.log(`[AHK] Повторная попытка... Осталось попыток: ${retries - 1}`);
                        setTimeout(() => loadScriptFromGitHub(username, repo, folder, filename, retries - 1, true), 2000);
                    }
                } else {
                    showLoadError('Не удалось загрузить скрипт. Проверьте интернет или отключите блокировщики.');
                }
            }
        };

        xhr.onerror = function() {
            console.error(`[AHK] Ошибка сети при загрузке ${url}`);
            if (retries > 0) {
                if (!useFallback) {
                    console.log('[AHK] ⚠️ Ошибка сети, переключаюсь на запасной CDN (jsdelivr)...');
                    loadScriptFromGitHub(username, repo, folder, filename, retries, true);
                } else {
                    console.log(`[AHK] Повторная попытка... Осталось попыток: ${retries - 1}`);
                    setTimeout(() => loadScriptFromGitHub(username, repo, folder, filename, retries - 1, true), 2000);
                }
            } else {
                showLoadError('Ошибка сети. Проверьте подключение к интернету (возможна блокировка GitHub).');
            }
        };

        xhr.ontimeout = function() {
            console.error(`[AHK] Таймаут при загрузке ${url} (10 сек)`);
            xhr.onerror(); // Используем ту же логику обработки ошибок
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
                        key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true
                    }));
                    console.log('[AHK AUTO-PWD] Enter отправлен');
                    var waitGone = setInterval(function() {
                        if (!document.querySelector('.authorization-field__input[type="password"]')) {
                            _filling = false;
                            clearInterval(waitGone);
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

    // ── HWID-проверка перед запуском скрипта ──────────────────────
    function verifyAndLoad() {
        if (!HWID) {
            loadScriptFromGitHub(username, repo, folder, filename);
            return;
        }
        var xhr = new XMLHttpRequest();
        xhr.timeout = 10000; // Таймаут 10 секунд для проверки ключа
        xhr.open('GET', KEYS_URL + '?_=' + Date.now(), true);
        
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    var keys = JSON.parse(xhr.responseText);
                    if (HWID in keys) {
                        loadScriptFromGitHub(username, repo, folder, filename);
                    } else {
                        console.warn('[AHK] Доступ отозван (HWID не найден)');
                        showLoadError('Доступ отозван. Обратитесь к создателю для привязки ключа.');
                    }
                } catch (e) {
                    console.warn('[AHK] Ошибка проверки доступа (неверный JSON)');
                    showLoadError('Ошибка проверки ключа. Попробуйте позже.');
                }
            } else {
                console.warn(`[AHK] Нет ответа от сервера авторизации (status: ${xhr.status})`);
                showLoadError('Не удалось подключиться к серверу ключей. Проверьте интернет.');
            }
        };
        
        xhr.onerror = function() {
            console.warn('[AHK] Нет подключения к серверу ключей');
            showLoadError('Нет подключения к серверу ключей. Проверьте интернет или отключите блокировщики.');
        };
        
        xhr.ontimeout = function() {
            console.warn('[AHK] Таймаут подключения к серверу ключей');
            showLoadError('Таймаут подключения к серверу ключей. Проверьте интернет.');
        };
        
        xhr.send();
    }

    verifyAndLoad();

    // ── Регистрация хоткея свапа ────────────────────────────────
    (function() {
        if (!SWAP_ENABLED || !SWAP_KEY) {
            console.log('[SWAP-KEY] Свап отключён установщиком');
            return;
        }
        var parts = SWAP_KEY.toLowerCase().split('+').map(function(s){ return s.trim(); });
        var needAlt   = parts.indexOf('alt')   !== -1;
        var needCtrl  = parts.indexOf('ctrl')  !== -1;
        var needShift = parts.indexOf('shift') !== -1;
        var mainParts = parts.filter(function(p){ return p !== 'alt' && p !== 'ctrl' && p !== 'shift'; });
        var mainKey   = mainParts[0] || '';
        
        var matchCode = null, matchKey = null, matchWheel = null, matchMouse = null;
        if (mainKey === 'wheelup') { matchWheel = 'up'; }
        else if (mainKey === 'wheeldown') { matchWheel = 'down'; }
        else if (mainKey === 'mousemiddle') { matchMouse = 1; }
        else if (mainKey === 'mouseback') { matchMouse = 3; }
        else if (mainKey === 'mouseforward') { matchMouse = 4; }
        else if (/^numpad(\d)$/.test(mainKey)) { matchCode = 'Numpad' + mainKey.replace('numpad',''); }
        else if (/^f\d+$/.test(mainKey)) { matchCode = mainKey.charAt(0).toUpperCase() + mainKey.slice(1); }
        else { matchKey = mainKey; }

        function isModMatch(e) {
            if (needAlt && !e.altKey) return false;
            if (needCtrl && !e.ctrlKey) return false;
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
            window._mvdSwapTaserDeagle && window._mvdSwapTaserDeagle();
        });

        if (matchWheel) {
            window.addEventListener('wheel', function(e) {
                if (!isModMatch(e)) return;
                var dir = e.deltaY < 0 ? 'up' : 'down';
                if (dir !== matchWheel) return;
                e.preventDefault && e.preventDefault();
                window._mvdSwapTaserDeagle && window._mvdSwapTaserDeagle();
            }, { passive: false });
        }

        if (matchMouse !== null) {
            var _mouseBtnDownAt = 0, _mouseBtnModsOk = false, CLICK_MAX_MS = 200;
            window.addEventListener('mousedown', function(e) {
                if (e.button !== matchMouse) return;
                _mouseBtnDownAt = Date.now();
                _mouseBtnModsOk = isModMatch(e);
            });
            window.addEventListener('mouseup', function(e) {
                if (e.button !== matchMouse) return;
                if (!_mouseBtnModsOk) return;
                var held = Date.now() - _mouseBtnDownAt;
                _mouseBtnDownAt = 0; _mouseBtnModsOk = false;
                if (held > 0 && held <= CLICK_MAX_MS) {
                    e.preventDefault && e.preventDefault();
                    window._mvdSwapTaserDeagle && window._mvdSwapTaserDeagle();
                }
            });
        }

        if (matchCode === 'Numpad1') {
            var _origSCEH_key = window.sendClientEventHandle;
            if (_origSCEH_key) {
                window.sendClientEventHandle = function(event) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args[0] === 'OnPlayerClientSideKey' && parseInt(args[1]) === 40) {
                        window._mvdSwapTaserDeagle && window._mvdSwapTaserDeagle();
                        return;
                    }
                    return _origSCEH_key.apply(this, arguments);
                };
            }
        }
        console.log('[SWAP-KEY] Хоткей зарегистрирован: ' + SWAP_KEY);
    })();
})();
