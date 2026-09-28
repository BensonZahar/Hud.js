// ═══════════════════════════════════════════════════════════════════════
// ⚠️ ЧТО ЭТО ЗА ФАЙЛ
// ═══════════════════════════════════════════════════════════════════════
// LoadPravo.js — ЗАГРУЗЧИК ПОМОЩНИКА ДЛЯ ТЕСТИРОВАНИЯ ПРАВО И ФУНКЦИЙ
// ДЛЯ РАЗРАБОТЧИКОВ ИГРЫ. Версия: beta 1.0.
//
// Это НЕ обычный пользовательский скрипт/мод для рядовых игроков.
// Файл встраивается установщиком AHK ПРАВО в Index.js игры. При запуске
// он подтягивает основной скрипт pravo.js с GitHub, подставляет в него
// настройки, выбранные в установщике (хоткеи, биндинги меню, таймеры
// после отыгровок, авто-снаряжение и т.д.), и выполняет его.
//
// Этот код используется исключительно на закрытых тестовых серверах
// для тестирования интерфейса ПРАВО (тюрьмы) и функций разработчиков
// игры — на обычных (боевых) серверах игры этот функционал недоступен
// и никак не влияет на игровой процесс других игроков. Это beta-версия
// (1.0) — возможны баги и незавершённые функции.
// ═══════════════════════════════════════════════════════════════════════

(function() {

// ==================== СТАРТОВОЕ УВЕДОМЛЕНИЕ AHK ====================
// Показывается при каждом запуске игры — даже если ник не в списке доступа.
// Подтверждает игроку что AHK установлен и загружен.
(function _showAhkLoaded() {
    function _tryShow() {
        try {
            var gt = window.interface && window.interface('GameText');
            if (gt && typeof gt.add === 'function') {
                // Тип 3 = нижний GameText (как в /me, /do)
                // ~n~ = перенос строки, ~g~ = зелёный цвет
                gt.add('[3, "АНК <span style=\\"color:#CCFF00\\">ПРАВИТЕЛЬСТВО</span>&nbsp;by konstt~n~~g~Запущен", 5000, 0, 0, false, false, 2.0]');
                console.log('[AHK] ✅ Стартовое уведомление показано');
                return true;
            }
        } catch(e) {}
        return false;
    }

    // Интерфейс GameText может ещё не быть готов — опрашиваем каждые 500 мс, до 30 сек
    if (!_tryShow()) {
        var _att = 0;
        var _tmr = setInterval(function() {
            _att++;
            if (_tryShow() || _att >= 60) {
                clearInterval(_tmr);
            }
        }, 500);
    }
})();
// ==================== КОНЕЦ СТАРТОВОГО УВЕДОМЛЕНИЯ ====================

const CALLSIGN = "";
const AUTO_PASSWORD = ""; // Авто-ввод пароля при входе (пусто = отключено)
const MENU_KEY = "Alt+0"; // Хоткей открытия меню АХК (пусто = отключено)
const MENU_HIDDEN_ITEMS = []; // Пункты меню «Повседневная» которые скрыты: ["greeting","checkDocuments",...]
const MENU_BINDS = {}; // Прямые биндинги: {"greeting":"Alt+G","cuffing":"Alt+C",...}
const MENU_ORDER = []; // Порядок пунктов меню: ["greeting","cuffing",...] (пусто = по умолчанию)
const MENU_TIMER_ITEMS = []; // Пункты после которых шлётся "/c 60" + автозакрытие диалога через 1.5с: ["greeting","fine","wantedFine",...]

// ── Авто-снаряжение (авто при открытии службы) ─────────────────
const AUTO_GRAB = false;              // Включить авто-снаряжение
const AUTO_GRAB_THR_MAGNUM = 30;     // Добирать .44 Magnum если меньше N штук
const AUTO_GRAB_THR_762    = 60;     // Добирать 7.62x39 если меньше N штук
const AUTO_GRAB_THR_545    = 60;     // Добирать 5.45x39 если меньше N штук
const AUTO_GRAB_MENU_MEDKIT      = -1; // Позиция Аптечки в меню (-1 = без изменений)
const AUTO_GRAB_MENU_PAINKILLERS = -1; // Обезболивающее
const AUTO_GRAB_MENU_BATON       = -1; // Дубинка
const AUTO_GRAB_MENU_VEST        = -1; // Бронежилет
const AUTO_GRAB_MENU_TASER       = -1; // Тазер
const AUTO_GRAB_MENU_DEAGLE      = -1; // Desert Eagle
const AUTO_GRAB_MENU_AKM         = -1; // АКМ
const AUTO_GRAB_MENU_AKS74U      = -1; // АКС-74У
const AUTO_GRAB_MENU_AMMO_MAGNUM = -1; // Патроны .44
const AUTO_GRAB_MENU_AMMO_762    = -1; // Патроны 7.62
const AUTO_GRAB_MENU_AMMO_545    = -1; // Патроны 5.45
const AUTO_GRAB_MENU_SHIELD      = -1; // Щит
const AUTO_GRAB_SKIP = []; // Предметы которые НЕ брать: ["medkit","painkiller","baton","vest","taser","deagle","magnum","akm","ammo762","aks74u","ammo545"]
// ── END Авто-снаряжение ─────────────────────────────────────────

// ── Авто-перевыдача лицензии (только для Лицензёра / Правительство) ────────
const AUTO_REISSUE_LIC = false;  // Включить: установщик меняет на true
const REISSUE_KEY = "Alt+R";    // Хоткей авто-перевыдачи: установщик заменяет значение
// ── END Авто-перевыдача ──────────────────────────────────────────

// ── Быстрая выдача лицензии (только для Лицензёра / Правительство) ──────────
const GIVELIC_KEY = "";  // Хоткей прямого открытия диалога /givelic: установщик заменяет значение
// ── END Быстрая выдача ───────────────────────────────────────────

// ── Помощник лицензёра (флаг — патчится установщиком) ──────────
const LICENSOR_HELPER_ENABLED = false;  // установщик меняет на true если помощник включён
// ── END Помощник лицензёра ───────────────────────────────────────

// Параметры загрузки скрипта
const username = 'BensonZahar';
const repo = 'Hud.js';
const folder = 'PRAVO AHK';
const filename = 'pravo.js';
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
                scriptText = scriptText.replace(/const AMMO_THRESHOLD = \{[^}]+\}/,
                    `const AMMO_THRESHOLD = { MAGNUM: ${AUTO_GRAB_THR_MAGNUM}, AK762: ${AUTO_GRAB_THR_762}, AKS545: ${AUTO_GRAB_THR_545} }`);
                const menuPatch = {
                    PAINKILLERS: AUTO_GRAB_MENU_PAINKILLERS, MEDKIT: AUTO_GRAB_MENU_MEDKIT,
                    BATON: AUTO_GRAB_MENU_BATON, VEST: AUTO_GRAB_MENU_VEST,
                    TASER: AUTO_GRAB_MENU_TASER, DEAGLE: AUTO_GRAB_MENU_DEAGLE,
                    AKM: AUTO_GRAB_MENU_AKM, AKS74U: AUTO_GRAB_MENU_AKS74U,
                    AMMO_MAGNUM: AUTO_GRAB_MENU_AMMO_MAGNUM, AMMO_762: AUTO_GRAB_MENU_AMMO_762, AMMO_545: AUTO_GRAB_MENU_AMMO_545,
                    SHIELD: AUTO_GRAB_MENU_SHIELD
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
            // ── Патчим AUTO_REISSUE_LIC (авто-перевыдача лицензии) ──────────────────
            if (AUTO_REISSUE_LIC) {
                scriptText = scriptText.replace(/var AUTO_REISSUE_LIC = false;/, 'var AUTO_REISSUE_LIC = true;');
                scriptText = scriptText.replace(
                    'window.AUTO_REISSUE_LIC = AUTO_REISSUE_LIC;',
                    'window.AUTO_REISSUE_LIC = true;'
                );
            }
            // ── Патчим REISSUE_KEY (хоткей авто-перевыдачи) ─────────────────────────
            if (REISSUE_KEY) {
                scriptText = scriptText.replace(/var REISSUE_KEY = "Alt\+R";/, `var REISSUE_KEY = "${REISSUE_KEY}";`);
                scriptText = scriptText.replace(
                    'window.REISSUE_KEY = REISSUE_KEY;',
                    `window.REISSUE_KEY = "${REISSUE_KEY}";`
                );
            }
            // ── Патчим GIVELIC_KEY (хоткей прямого открытия диалога /givelic) ──────────
            if (GIVELIC_KEY) {
                scriptText = scriptText.replace(/var GIVELIC_KEY = "";/, `var GIVELIC_KEY = "${GIVELIC_KEY}";`);
            }
            // ── Патчим LICENSOR_HELPER_ENABLED (флаг помощника лицензёра) ────────────
            if (LICENSOR_HELPER_ENABLED) {
                scriptText = scriptText.replace(/var LICENSOR_HELPER_ENABLED = false;/, 'var LICENSOR_HELPER_ENABLED = true;');
                scriptText = scriptText.replace(
                    'window.LICENSOR_HELPER_ENABLED = LICENSOR_HELPER_ENABLED;',
                    'window.LICENSOR_HELPER_ENABLED = true;'
                );
            }
            // ── Патчим wantedFine и fine: открываем LawsHelper вместо диалогов 681/678 ──
            // Делаем это ПОСЛЕ eval — mvdF определяет эти функции в window,
            // перезаписываем их сразу после eval.
            eval(scriptText);
            // Прокидываем LICENSOR_HELPER_ENABLED в window после eval
            window.LICENSOR_HELPER_ENABLED = LICENSOR_HELPER_ENABLED;
            if (typeof onSuccess === 'function') onSuccess();
            // ── Перехват window.showUkInputDialog (РОЗЫСК) ───────────────────
            // Вызывается mvdF при action === 'wantedFine'.
            // Открываем LawsHelper в режиме 'wanted' — только таб РОЗЫСК.
            var _origShowUk = window.showUkInputDialog;
            window.showUkInputDialog = function(targetId) {
                window._duranWantedTargetId = (targetId !== undefined) ? targetId : -1;
                window._duranOpenMode = 'wanted';
                window.openInterface('Zkm');
            };
            window._origShowUkInputDialog = _origShowUk;
            // ── Перехват window.showKoapTypeMenu (ШТРАФ) ─────────────────────
            // Вызывается mvdF при action === 'fine'.
            // Открываем LawsHelper в режиме 'fine' — только таб ШТРАФЫ.
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
            console.log(`[PRAVO] Скрипт ${filename} загружен и выполнен успешно`);
        } else {
            console.error(`[PRAVO] HTTP error! status: ${xhr.status} для ${url}`);
            if (retries > 0) {
                console.log(`[PRAVO] Повторная попытка... Осталось попыток: ${retries - 1}`);
                setTimeout(() => loadScriptFromGitHub(username, repo, folder, filename, retries - 1), 2000);
            } else {
                console.error(`[PRAVO] Не удалось загрузить скрипт AHK ${filename} после всех попыток`);
            }
        }
    };
    xhr.onerror = function() {
        console.error(`[PRAVO] Ошибка сети при загрузке скрипта ${filename} с ${url}`);
        if (retries > 0) {
            console.log(`[PRAVO] Повторная попытка... Осталось попыток: ${retries - 1}`);
            setTimeout(() => loadScriptFromGitHub(username, repo, folder, filename, retries - 1), 2000);
        } else {
            console.error(`[PRAVO] Не удалось загрузить скрипт AHK ${filename} после всех попыток`);
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
                console.log('[PRAVO AHK AUTO-PWD] Enter отправлен');

                // После Enter ждём пока форма исчезнет — тогда сбрасываем флаг
                // чтобы при следующем /rec снова сработало
                var waitGone = setInterval(function() {
                    if (!document.querySelector('.authorization-field__input[type="password"]')) {
                        _filling = false;
                        clearInterval(waitGone);
                        console.log('[PRAVO AHK AUTO-PWD] Форма закрылась — готов к следующей авторизации');
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

// Запуск: сначала fkonst.js (из MVD AHK — там он хранится), затем pravo.js
loadScriptFromGitHub(username, repo, fkonstFolder, fkonstFilename, 5, function() {
    loadScriptFromGitHub(username, repo, folder, filename);
});
// ── Регистрация мыши/колеса для MENU_KEY ────────────────────
// Клавиатурный обработчик MENU_KEY живёт внутри mvdF.js (keydown).
// Боковые кнопки мыши и колёсико mvdF.js не слушает — добавляем здесь.
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
    else { return; } // обычная клавиша — обрабатывается в mvdF.js, выходим

    function isModMatch(e) {
        if (needAlt   && !e.altKey)   return false;
        if (needCtrl  && !e.ctrlKey)  return false;
        if (needShift && !e.shiftKey) return false;
        return true;
    }
    function openMenuAction() {
        if (!window._isPravoSkin || !window._isPravoSkin()) return;
        // sendChatInput доступен после загрузки mvdF.js (после eval в onload xhr)
        if (typeof window.sendChatInput === 'function') {
            window.sendChatInput('/dahk');
        }
    }

    // Колёсико мыши
    if (matchWheel) {
        window.addEventListener('wheel', function(e) {
            if (!isModMatch(e)) return;
            var dir = e.deltaY < 0 ? 'up' : 'down';
            if (dir !== matchWheel) return;
            e.preventDefault && e.preventDefault();
            openMenuAction();
        }, { passive: false });
        console.log('[PRAVO MENU-KEY] Колесо зарегистрировано для открытия меню: ' + MENU_KEY);
    }

    // Боковые/средняя кнопки мыши
    if (matchMouse !== null) {
        var _menuBtnDownAt = 0;
        var _menuBtnModsOk = false;
        var CLICK_MAX_MS = 400; // удержание дольше = камера GTA, не меню

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
        console.log('[PRAVO MENU-KEY] Кнопка мыши зарегистрирована для открытия меню: button=' +
                    matchMouse + ' (клик ≤ ' + CLICK_MAX_MS + 'мс)');
    }
})();

// ── Регистрация мыши/колеса для GIVELIC_KEY ─────────────────
// Клавиатурный обработчик GIVELIC_KEY живёт внутри pravo.js (keydown).
// Мышь и колесо pravo.js не слушает — регистрируем здесь.
(function() {
    if (!GIVELIC_KEY) return;

    var parts = GIVELIC_KEY.toLowerCase().split('+').map(function(s){ return s.trim(); });
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
    else { return; } // обычная клавиша — обрабатывается в pravo.js keydown, выходим

    function isModMatch(e) {
        if (needAlt   && !e.altKey)   return false;
        if (needCtrl  && !e.ctrlKey)  return false;
        if (needShift && !e.shiftKey) return false;
        return true;
    }

    function doGivelic() {
        if (!window._isPravoSkin || !window._isPravoSkin()) return;
        window.showGiveLicIdInputDialog && window.showGiveLicIdInputDialog();
    }

    // Колёсико мыши
    if (matchWheel) {
        window.addEventListener('wheel', function(e) {
            if (!isModMatch(e)) return;
            var dir = e.deltaY < 0 ? 'up' : 'down';
            if (dir !== matchWheel) return;
            e.preventDefault && e.preventDefault();
            doGivelic();
        }, { passive: false });
        console.log('[PRAVO GIVELIC-KEY] Колесо зарегистрировано: Wheel' + (matchWheel === 'up' ? 'Up' : 'Down'));
    }

    // Боковые/средняя кнопки мыши
    if (matchMouse !== null) {
        var _gBtnDownAt = 0;
        var _gBtnModsOk = false;
        var CLICK_MAX_MS = 400; // удержание дольше = камера GTA, не диалог

        window.addEventListener('mousedown', function(e) {
            if (e.button !== matchMouse) return;
            _gBtnDownAt = Date.now();
            _gBtnModsOk = isModMatch(e);
        });
        window.addEventListener('mouseup', function(e) {
            if (e.button !== matchMouse) return;
            if (!_gBtnModsOk) return;
            var held = Date.now() - _gBtnDownAt;
            _gBtnDownAt = 0;
            _gBtnModsOk = false;
            if (held > 0 && held <= CLICK_MAX_MS) {
                e.preventDefault && e.preventDefault();
                doGivelic();
            }
        });
        console.log('[PRAVO GIVELIC-KEY] Кнопка мыши зарегистрирована: button=' +
                    matchMouse + ' (клик ≤ ' + CLICK_MAX_MS + 'мс)');
    }
})();

// ── Регистрация мыши/колеса для REISSUE_KEY ─────────────────
// Клавиатурный обработчик REISSUE_KEY живёт внутри pravo.js (keydown).
// Мышь и колесо pravo.js не слушает — регистрируем здесь, как у SWAP/EJECT в FSIN.
(function() {
    if (!AUTO_REISSUE_LIC || !REISSUE_KEY) return;

    var parts = REISSUE_KEY.toLowerCase().split('+').map(function(s){ return s.trim(); });
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
    else { return; } // обычная клавиша — обрабатывается в pravo.js keydown, выходим

    function isModMatch(e) {
        if (needAlt   && !e.altKey)   return false;
        if (needCtrl  && !e.ctrlKey)  return false;
        if (needShift && !e.shiftKey) return false;
        return true;
    }

    // Делегируем в pravo.js — там живёт вся логика + snAdd + __mvdPrevSendChatInput.
    // Та же схема что у FSIN: LoadFsin.js вызывает window._fsinSwapTaserDeagle().
    function doReissue() {
        if (!window._isPravoSkin || !window._isPravoSkin()) return;
        window._pravoDoReissue && window._pravoDoReissue();
    }

    // Колёсико мыши
    if (matchWheel) {
        window.addEventListener('wheel', function(e) {
            if (!isModMatch(e)) return;
            var dir = e.deltaY < 0 ? 'up' : 'down';
            if (dir !== matchWheel) return;
            e.preventDefault && e.preventDefault();
            doReissue();
        }, { passive: false });
        console.log('[PRAVO REISSUE-KEY] Колесо зарегистрировано: Wheel' + (matchWheel === 'up' ? 'Up' : 'Down'));
    }

    // Боковые/средняя кнопки мыши
    if (matchMouse !== null) {
        var _rBtnDownAt = 0;
        var _rBtnModsOk = false;
        var CLICK_MAX_MS = 400; // удержание дольше = камера GTA, не перевыдача

        window.addEventListener('mousedown', function(e) {
            if (e.button !== matchMouse) return;
            _rBtnDownAt = Date.now();
            _rBtnModsOk = isModMatch(e);
        });
        window.addEventListener('mouseup', function(e) {
            if (e.button !== matchMouse) return;
            if (!_rBtnModsOk) return;
            var held = Date.now() - _rBtnDownAt;
            _rBtnDownAt = 0;
            _rBtnModsOk = false;
            if (held > 0 && held <= CLICK_MAX_MS) {
                e.preventDefault && e.preventDefault();
                doReissue();
            }
        });
        console.log('[PRAVO REISSUE-KEY] Кнопка мыши зарегистрирована: button=' +
                    matchMouse + ' (клик ≤ ' + CLICK_MAX_MS + 'мс, удержание = камера)');
    }
})();

})()
