// ═══════════════════════════════════════════════════════════════════════
// LoadGang.js — загрузчик АХК «Банда» (beta 1.0)
//
// Встраивается установщиком в Index.js игры. При запуске сначала подтягивает
// общий хелпер fkonst.js (из «MVD AHK»), затем gang.js с GitHub, подставляет
// в gang.js настройки из установщика (сейчас — только хоткей меню) и выполняет.
//
// В gang.js сейчас: проверка ника + авто-угон + меню АХК (вкл/выкл).
// Авто-угона в fkonst.js больше нет — он живёт только в gang.js.
// Сам загрузчик также содержит авто-вход (AUTO_PASSWORD) — работает без gang.js.
// ═══════════════════════════════════════════════════════════════════════

(function () {

// ==================== СТАРТОВОЕ УВЕДОМЛЕНИЕ AHK ====================
// Подтверждает игроку, что АХК установлен и загружен.
(function _showAhkLoaded() {
    function _tryShow() {
        try {
            var gt = window.interface && window.interface('GameText');
            if (gt && typeof gt.add === 'function') {
                // Тип 3 = нижний GameText; ~n~ = перенос строки, ~g~ = зелёный цвет
                gt.add('[3, "АХК <span style=\\"color:#E25544\\">Банда</span>&nbsp;by konstt~n~~g~Запущен", 5000, 0, 0, false, false, 2.0]');
                console.log('[GANG] ✅ Стартовое уведомление показано');
                return true;
            }
        } catch (e) {}
        return false;
    }

    // Интерфейс GameText может быть ещё не готов — опрашиваем каждые 500 мс, до 30 сек
    if (!_tryShow()) {
        var _att = 0;
        var _tmr = setInterval(function () {
            _att++;
            if (_tryShow() || _att >= 60) clearInterval(_tmr);
        }, 500);
    }
})();
// ==================== КОНЕЦ СТАРТОВОГО УВЕДОМЛЕНИЯ ====================

// Хоткей открытия меню АХК (пусто = только команда /dahk). Меняется установщиком.
const MENU_KEY = "Alt+0";

// Авто-ввод пароля при входе (пусто = отключено). Подставляется установщиком.
const AUTO_PASSWORD = ""; // Авто-ввод пароля при входе (пусто = отключено)

// Параметры загрузки скрипта
const username = 'BensonZahar';
const repo = 'Hud.js';
const folder = 'AHK konst/GANG AHK';
const filename = 'gang.js';
const fkonstFilename = 'fkonst.js'; // общий хелпер (хранится в MVD AHK, общий для всех структур)
const fkonstFolder = 'MVD AHK';

// Загрузка с GitHub с повторными попытками.
// onSuccess — колбэк после успешного eval; onFail — после исчерпания попыток.
function loadScriptFromGitHub(folder, filename, retries, onSuccess, onFail) {
    // Папка может быть вложенной («AHK konst/GANG AHK») — кодируем каждую часть отдельно, слэши оставляем
    const path = folder ? folder.split('/').map(encodeURIComponent).join('/') + '/' : '';
    const url = `https://raw.githubusercontent.com/${username}/${repo}/main/${path}${filename}`;

    function retry(reason) {
        console.error(`[GANG] ${reason} (${url})`);
        if (retries > 0) {
            console.log(`[GANG] Повторная попытка... Осталось: ${retries - 1}`);
            setTimeout(function () { loadScriptFromGitHub(folder, filename, retries - 1, onSuccess, onFail); }, 2000);
        } else {
            console.error(`[GANG] Не удалось загрузить ${filename} после всех попыток`);
            if (typeof onFail === 'function') onFail();
        }
    }

    const xhr = new XMLHttpRequest();
    xhr.open('GET', url + '?_=' + Date.now(), true);
    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            let scriptText = xhr.responseText;
            // ── Патчим MENU_KEY (в gang.js это var, не const) ──
            if (filename === 'gang.js') {
                scriptText = scriptText.replace(/var MENU_KEY = "Alt\+0";/, function () {
                    return 'var MENU_KEY = ' + JSON.stringify(MENU_KEY) + ';';
                });
            }
            eval(scriptText);
            console.log(`[GANG] Скрипт ${filename} загружен и выполнен успешно`);
            if (typeof onSuccess === 'function') onSuccess();
        } else {
            retry(`HTTP error! status: ${xhr.status}`);
        }
    };
    xhr.onerror = function () { retry('Ошибка сети'); };
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
        var HIDE_CLASS = 'gang-autologin';

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
            console.log('[GANG AHK AUTO-PWD] ' + why + ' — окно показано');
        }

        // Оборачиваем методы компонента Login: setError / setStage вызывает сервер
        function patchAuth(c) {
            try {
                var inst = c && c.$refs && c.$refs.auth;
                if (!inst) return;
                if (patched) { if (patched.has(inst)) return; patched.add(inst); }
                else { if (inst.__gangP) return; inst.__gangP = true; }

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
            } catch (e) { console.error('[GANG AHK AUTO-PWD] patch error:', e); }
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
                    console.log('[GANG AHK AUTO-PWD] Нужен ручной ввод — окно показано');
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
                console.log('[GANG AHK AUTO-PWD] Пароль отправлен мгновенно');
            } catch (e) {
                showUI();
                console.error('[GANG AHK AUTO-PWD] Ошибка авто-входа:', e);
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

// Запуск: сначала fkonst.js (из MVD AHK), затем gang.js.
// Если fkonst.js не загрузился — gang.js всё равно запускается (он самостоятельный).
function _loadGang() { loadScriptFromGitHub(folder, filename, 5); }
loadScriptFromGitHub(fkonstFolder, fkonstFilename, 5, _loadGang, _loadGang);

})();
