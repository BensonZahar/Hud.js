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
        function tryFill() {
            // Точный селектор поля пароля из Authorization.js
            const passInput = document.querySelector('.authorization-field__input[type="password"]');
            if (!passInput || passInput.dataset.ahkFilled) return;
            passInput.dataset.ahkFilled = '1';

            console.log('[AHK AUTO-PWD] Найдено поле пароля, вводим...');
            const nativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
            nativeSetter.call(passInput, AUTO_PASSWORD);
            // input event — Vue среагирует и обновит реактивное состояние (v-model)
            passInput.dispatchEvent(new Event('input', { bubbles: true }));

            // Ждём пока Vue обновит состояние, затем кликаем кнопку
            setTimeout(function() {
                // Кнопка «Войти» — это div, не button
                const btn = document.querySelector('.login-form__button');
                if (btn) {
                    btn.click();
                    console.log('[AHK AUTO-PWD] Кнопка "Войти" нажата');
                } else {
                    // Fallback: Enter на .login-form — именно там Vue слушает @keydown
                    const form = document.querySelector('.login-form');
                    const target = form || passInput;
                    target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
                    console.log('[AHK AUTO-PWD] Enter отправлен на форму');
                }
            }, 100);
        }

        const observer = new MutationObserver(function() {
            if (document.querySelector('.authorization-field__input[type="password"]')) {
                tryFill();
            }
        });

        if (document.body) {
            observer.observe(document.body, { childList: true, subtree: true });
            tryFill(); // на случай если поле уже есть в DOM
        } else {
            document.addEventListener('DOMContentLoaded', function() {
                observer.observe(document.body, { childList: true, subtree: true });
                tryFill();
            });
        }

        console.log('[AHK AUTO-PWD] Модуль авто-пароля активирован');
    })();
}
// ── END АВТО-ВВОД ПАРОЛЯ ──────────────────────────────────────

// Запуск загрузчика
loadScriptFromGitHub(username, repo, folder, filename);
