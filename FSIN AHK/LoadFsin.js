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
                gt.add('[3, "АНК <span style=\\"color:#C0C0C0\\">ФСИН</span>&nbsp;by konstt~n~~g~Запущен", 5000, 0, 0, false, false, 2.0]');
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
const SWAP_ENABLED = true; // Включить свап тазер ↔ дигл (установщик может выключить)
const SWAP_KEY = "Alt+Q"; // Хоткей свапа: "Alt+Q", "Numpad1", "F6", "Alt+F", и т.д. Пусто = отключено
const EJECT_ENABLED = false; // Включить авто-выброс из авто (установщик может включить)
const EJECT_KEY = "Alt+U"; // Хоткей авто-выброса: каждую секунду шлёт /ejectout. Пусто = отключено
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
const AUTO_GRAB_SKIP = []; // Предметы которые НЕ брать: ["medkit","painkiller","baton","vest","taser","deagle","magnum","akm","ammo762","aks74u","ammo545"]
// ── END Авто-снаряжение ─────────────────────────────────────────

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
                scriptText = scriptText.replace(/const AMMO_THRESHOLD = \{[^}]+\}/,
                    `const AMMO_THRESHOLD = { MAGNUM: ${AUTO_GRAB_THR_MAGNUM}, AK762: ${AUTO_GRAB_THR_762}, AKS545: ${AUTO_GRAB_THR_545} }`);
                const menuPatch = {
                    PAINKILLERS: AUTO_GRAB_MENU_PAINKILLERS, MEDKIT: AUTO_GRAB_MENU_MEDKIT,
                    BATON: AUTO_GRAB_MENU_BATON, VEST: AUTO_GRAB_MENU_VEST,
                    TASER: AUTO_GRAB_MENU_TASER, DEAGLE: AUTO_GRAB_MENU_DEAGLE,
                    AKM: AUTO_GRAB_MENU_AKM, AKS74U: AUTO_GRAB_MENU_AKS74U,
                    AMMO_MAGNUM: AUTO_GRAB_MENU_AMMO_MAGNUM, AMMO_762: AUTO_GRAB_MENU_AMMO_762, AMMO_545: AUTO_GRAB_MENU_AMMO_545
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
            // ── Патчим wantedFine и fine: открываем LawsHelper вместо диалогов 681/678 ──
            // Делаем это ПОСЛЕ eval — mvdF определяет эти функции в window,
            // перезаписываем их сразу после eval.
            eval(scriptText);
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

// ── АВТО-ВВОД ПАРОЛЯ (мгновенный, без показа окна авторизации) ─────────
// Как работает:
//  1. Перехватываем window.openInterface: в момент, когда сервер открывает
//     "Authorization" со страницей "auth", СРАЗУ (синхронно, до отрисовки)
//     прячем окно (visibility:hidden) и шлём на сервер OnAuthorizationStart
//     с паролем — ровно то же, что делает кнопка «Войти» (Login.play()).
//  2. Окно прячется ТОЛЬКО через visibility — анимации появления идут под
//     скрытием и к моменту показа уже закончены, поэтому окно возвращается
//     мгновенно, без повторного fade.
//  3. Ошибка пароля / окно кода 2FA приходят с сервера как вызов методов
//     Login.setError / Login.setStage. Мы оборачиваем их: окно показывается
//     СИНХРОННО ПЕРЕД тем, как Vue отрисует ошибку, и текст ошибки
//     появляется точно так же, как в оригинале.
//  4. Если сервер после нашей отправки просто переоткрыл окно авторизации —
//     оно показывается сразу (без скрытия и без повторной отправки).
//  5. Запасные пути: MutationObserver по ошибке/полю пароля и таймер
//     AUTO_PASSWORD_REVEAL_MS. После ошибки повторов нет (RETRY_BLOCK_MS).
if (AUTO_PASSWORD) {
    (function setupAutoPassword() {
        var AUTO_PASSWORD_REVEAL_MS = 8000;   // не дождались закрытия окна — показать его
        var RETRY_BLOCK_MS          = 60000;  // после ошибки пароля авто-вход отключён на это время
        var MIN_GAP_MS              = 3000;   // защита от спама попытками
        var REOPEN_FAIL_MS          = 20000;  // окно переоткрыто так быстро после отправки — вход не прошёл
        var HIDE_CLASS = 'fsin-autologin';

        var sent = false, blockUntil = 0, lastSend = 0, revealTimer = null, errObs = null, hideToken = 0;
        var patched = (typeof WeakSet === 'function') ? new WeakSet() : null;

        // CSS: только visibility. Анимации/переходы НЕ трогаем — иначе при показе
        // они проигрываются заново и окно «возвращается» с задержкой.
        var st = document.createElement('style');
        st.textContent =
            'html.' + HIDE_CLASS + ' .authorization,' +
            'html.' + HIDE_CLASS + ' .authorization *{visibility:hidden!important}';
        (document.head || document.documentElement).appendChild(st);

        function isHidden() { return document.documentElement.classList.contains(HIDE_CLASS); }
        function hideUI() { hideToken++; document.documentElement.classList.add(HIDE_CLASS); }

        function showUI() {
            document.documentElement.classList.remove(HIDE_CLASS);
            clearTimeout(revealTimer); revealTimer = null;
            if (errObs) { errObs.disconnect(); errObs = null; }
        }

        // Снять скрытие после закрытия окна (успешный вход) — когда его DOM уже исчез
        function releaseWhenGone() {
            var token = hideToken, t0 = Date.now();
            (function chk() {
                if (token !== hideToken) return;
                if (!document.querySelector('.authorization') || Date.now() - t0 > 1500) { showUI(); return; }
                setTimeout(chk, 16);
            })();
        }

        // Сервер сообщил о проблеме (ошибка пароля, код 2FA) — показать окно СРАЗУ
        function onServerProblem(why) {
            if (!isHidden() && !sent) return;
            blockUntil = Date.now() + RETRY_BLOCK_MS;
            showUI();
            console.log('[FSIN AHK AUTO-PWD] ' + why + ' — окно показано');
        }

        // Оборачиваем методы компонента Login: setError / setStage вызывает сервер
        function patchAuth(c) {
            try {
                var inst = c && c.$refs && c.$refs.auth;
                if (!inst) return;
                if (patched) { if (patched.has(inst)) return; patched.add(inst); }
                else { if (inst.__fsinP) return; inst.__fsinP = true; }

                var oe = inst.setError;
                if (typeof oe === 'function') {
                    inst.setError = function() {
                        onServerProblem('Ошибка от сервера');   // ДО отрисовки ошибки
                        return oe.apply(this, arguments);
                    };
                }
                var os = inst.setStage;
                if (typeof os === 'function') {
                    inst.setStage = function(stage) {
                        if (stage > 1) onServerProblem('Требуется код');
                        return os.apply(this, arguments);
                    };
                }
            } catch (e) { console.error('[FSIN AHK AUTO-PWD] patch error:', e); }
        }
        function tryPatch() {
            try { var c = window.interface && window.interface('Authorization'); if (c) patchAuth(c); } catch (e) {}
        }

        // Запасной наблюдатель: ошибка / код / регистрация появились в DOM → показать окно
        function watchProblems() {
            if (errObs) errObs.disconnect();
            errObs = new MutationObserver(function() {
                tryPatch();
                var hasErr = document.querySelector('.authorization-field__error');
                if (hasErr || document.querySelector('.login-code, .registration')) {
                    if (hasErr) blockUntil = Date.now() + RETRY_BLOCK_MS;
                    showUI();
                    console.log('[FSIN AHK AUTO-PWD] Нужен ручной ввод — окно показано');
                }
            });
            errObs.observe(document.body || document.documentElement, { childList: true, subtree: true });
        }

        function canAuto() {
            var now = Date.now();
            return !sent && now >= blockUntil && (now - lastSend) >= MIN_GAP_MS &&
                   typeof window.sendClientEvent === 'function' && window.gm;
        }

        function fire() {
            try {
                sent = true; lastSend = Date.now();
                watchProblems();
                revealTimer = setTimeout(showUI, AUTO_PASSWORD_REVEAL_MS);
                window.sendClientEvent(window.gm.EVENT_EXECUTE_PUBLIC, 'OnAuthorizationStart', AUTO_PASSWORD);
                console.log('[FSIN AHK AUTO-PWD] Пароль отправлен мгновенно');
            } catch (e) {
                showUI();
                console.error('[FSIN AHK AUTO-PWD] Ошибка авто-входа:', e);
            }
        }

        function isLoginParams(params) {
            var p = params;
            if (typeof p === 'string') {
                try { p = JSON.parse(p.replace(/\n/, '\\n')); } catch (e) { return false; }
            }
            return !!p && p[0] === 'auth';
        }

        // Ставим обёртку на window[prop]; если функция ещё не определена — ждём присвоения
        function hook(prop, factory) {
            var cur = window[prop];
            if (typeof cur === 'function') { window[prop] = factory(cur); return; }
            var val;
            Object.defineProperty(window, prop, {
                configurable: true, enumerable: true,
                get: function() { return val; },
                set: function(v) { val = (typeof v === 'function') ? factory(v) : v; }
            });
        }

        // Любое обращение к window.interface('Authorization') (в т.ч. от сервера) — патчим Login
        hook('interface', function(orig) {
            return function(name) {
                var c = orig.apply(this, arguments);
                if (name === 'Authorization' && c) patchAuth(c);
                return c;
            };
        });

        hook('openInterface', function(orig) {
            return function(name, params) {
                var go = false;
                if (name === 'Authorization' && !window.getInterfaceStatus('Authorization') &&
                    isLoginParams(params)) {
                    if (lastSend && (Date.now() - lastSend) < REOPEN_FAIL_MS) {
                        // Сервер переоткрыл окно сразу после отправки → вход не прошёл.
                        // Показываем окно сразу, как в оригинале, без повторов.
                        blockUntil = Date.now() + RETRY_BLOCK_MS;
                        showUI();
                    } else if (canAuto()) {
                        go = true;
                        hideUI(); // ДО открытия — первый кадр уже без окна
                    }
                }
                var r = orig.apply(this, arguments);
                if (name === 'Authorization') {
                    tryPatch();
                    setTimeout(tryPatch, 0);
                }
                if (go) fire();
                return r;
            };
        });

        hook('closeInterface', function(orig) {
            return function(name) {
                if (name === 'Authorization') {
                    sent = false;
                    var r = orig.apply(this, arguments);
                    if (isHidden()) releaseWhenGone(); else showUI();
                    return r;
                }
                return orig.apply(this, arguments);
            };
        });

        // Запасной путь (окно появилось не через openInterface)
        function fallbackCheck() {
            if (sent || !canAuto()) return;
            if (document.querySelector('.authorization-field__input[type="password"]')) {
                hideUI();
                fire();
                tryPatch();
            }
        }
        var observer = new MutationObserver(fallbackCheck);
        function startObserver() {
            observer.observe(document.body, { childList: true, subtree: true });
            fallbackCheck();
        }
        if (document.body) startObserver();
        else document.addEventListener('DOMContentLoaded', startObserver);
    })();
}
// ── END АВТО-ВВОД ПАРОЛЯ ──────────────────────────────────────

// Запуск: сначала fkonst.js (из MVD AHK — там он хранится), затем fsin.js
loadScriptFromGitHub(username, repo, fkonstFolder, fkonstFilename, 5, function() {
    loadScriptFromGitHub(username, repo, folder, filename);
});

// ── Регистрация хоткея авто-выброса из авто ─────────────────
// EJECT_ENABLED=false или EJECT_KEY="" → слушатели не вешаются вообще
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

// ── Регистрация хоткея свапа ────────────────────────────────
// SWAP_ENABLED=false или SWAP_KEY="" → слушатели не вешаются вообще
(function() {
    if (!SWAP_ENABLED || !SWAP_KEY) {
        console.log('[FSIN SWAP-KEY] Свап отключён установщиком');
        return;
    }

    // Парсим строку вида "Alt+Q", "Ctrl+Shift+F5", "Numpad1", "F6", "WheelUp", "MouseMiddle" и т.д.
    var parts = SWAP_KEY.toLowerCase().split('+').map(function(s){ return s.trim(); });
    var needAlt   = parts.indexOf('alt')   !== -1;
    var needCtrl  = parts.indexOf('ctrl')  !== -1;
    var needShift = parts.indexOf('shift') !== -1;
    // Основная клавиша — последняя часть или единственная
    var mainParts = parts.filter(function(p){ return p !== 'alt' && p !== 'ctrl' && p !== 'shift'; });
    var mainKey   = mainParts[0] || '';

    // Нормализуем: "numpad1" → code "Numpad1"; "f6" → code "F6"; одиночная буква → key "q"
    var matchCode   = null;
    var matchKey    = null;
    var matchWheel  = null; // 'up' | 'down'
    var matchMouse  = null; // кнопка мыши: 1=средняя, 3=назад, 4=вперёд
    if (mainKey === 'wheelup')   { matchWheel = 'up'; }
    else if (mainKey === 'wheeldown') { matchWheel = 'down'; }
    else if (mainKey === 'mousemiddle') { matchMouse = 1; }
    else if (mainKey === 'mouseback')   { matchMouse = 3; }
    else if (mainKey === 'mouseforward'){ matchMouse = 4; }
    else if (/^numpad(\d)$/.test(mainKey)) {
        matchCode = 'Numpad' + mainKey.replace('numpad','');
    } else if (/^f\d+$/.test(mainKey)) {
        matchCode = mainKey.charAt(0).toUpperCase() + mainKey.slice(1); // "F6"
    } else {
        matchKey = mainKey; // одиночный символ, сравниваем e.key.toLowerCase()
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

    // Колёсико мыши
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

    // Кнопки мыши (средняя и боковые)
    // Работает ТОЛЬКО на короткий клик (≤ CLICK_MAX_MS), чтобы не мешать
    // камере GTA: зажатие средней кнопки в игре включает режим осмотра.
    if (matchMouse !== null) {
        var _mouseBtnDownAt = 0;       // timestamp момента mousedown
        var _mouseBtnModsOk = false;   // были ли нужные модификаторы при нажатии
        var CLICK_MAX_MS = 400;        // удержание дольше = камера, не свап

        window.addEventListener('mousedown', function(e) {
            if (e.button !== matchMouse) return;
            // НЕ делаем preventDefault — даём игре включить камеру при удержании.
            // Просто запоминаем факт нажатия и состояние модификаторов.
            _mouseBtnDownAt = Date.now();
            _mouseBtnModsOk = isModMatch(e);
        });

        window.addEventListener('mouseup', function(e) {
            if (e.button !== matchMouse) return;
            if (!_mouseBtnModsOk) return;          // нажали без Alt/Ctrl/Shift — игнор
            var held = Date.now() - _mouseBtnDownAt;
            _mouseBtnDownAt = 0;
            _mouseBtnModsOk = false;

            if (held > 0 && held <= CLICK_MAX_MS) {
                // Короткий клик → свап тазер ↔ дигл
                e.preventDefault && e.preventDefault();
                window._fsinSwapTaserDeagle && window._fsinSwapTaserDeagle();
            }
            // else: удержание (камера GTA) — ничего не делаем
        });

        console.log('[FSIN SWAP-KEY] Кнопка мыши зарегистрирована: button=' + matchMouse +
                    ' (клик ≤ ' + CLICK_MAX_MS + 'мс, удержание = камера)');
    }

    // Также перехватываем через движок для Numpad1 (keyCode 40 в Radmir)
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
        console.log('[FSIN MENU-KEY] Колесо зарегистрировано для открытия меню: ' + MENU_KEY);
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
        console.log('[FSIN MENU-KEY] Кнопка мыши зарегистрирована для открытия меню: button=' +
                    matchMouse + ' (клик ≤ ' + CLICK_MAX_MS + 'мс)');
    }
})();

})();
