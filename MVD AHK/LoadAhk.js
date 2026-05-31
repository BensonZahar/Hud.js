const RANK = "";
const FIRST_NAME = "";
const LAST_NAME = "";
const CALLSIGN = "";
const AUTO_PASSWORD = ""; // Авто-ввод пароля при входе (пусто = отключено)

// Параметры загрузки скрипта
const username = 'BensonZahar';
const repo = 'Hud.js';
const folder = 'MVD AHK';
const filename = 'mvd.js';

// Функция загрузчика с retry
function loadScriptFromGitHub(username, repo, folder, filename, retries = 5) {
    const path = folder ? `${encodeURIComponent(folder)}/` : '';
    const url = `https://raw.githubusercontent.com/${username}/${repo}/main/${path}${filename}`;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
            eval(xhr.responseText);
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

            // Шаг 1: нативный value
            var nativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
            nativeSetter.call(passInput, AUTO_PASSWORD);

            // Шаг 2: input event — Vue обновит v-model
            passInput.dispatchEvent(new Event('input', { bubbles: true }));

            // Шаг 3: Enter на форме — Vue слушает @keydown там
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

// Запуск загрузчика
loadScriptFromGitHub(username, repo, folder, filename);
