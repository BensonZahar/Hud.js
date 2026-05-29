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
// Если AUTO_PASSWORD задан — перехватываем диалог входа и вводим пароль автоматически
if (AUTO_PASSWORD) {
    (function setupAutoPassword() {
        // Проверяем наличие оригинального обработчика диалогов
        function tryHook() {
            // Radmir использует addDialogInQueue для показа диалогов
            // Ищем его в window или через interface
            const iface = (typeof window.interface === 'function') ? window.interface('Dialog') : null;

            // Перехватываем onDialogCreate / addDialogInQueue
            if (window._ahkPwdHooked) return;

            // Способ 1: хук на sendClientEvent (ловим входящий диалог пароля)
            const _origSend = window.sendClientEvent;

            // Способ 2: MutationObserver — ждём появления input[type=password] в DOM
            const observer = new MutationObserver(function() {
                // Ищем поле ввода пароля в диалоге
                const passInput = document.querySelector('input[type="password"], input.dialog-input');
                if (passInput && !passInput.dataset.ahkFilled) {
                    passInput.dataset.ahkFilled = '1';
                    console.log('[AHK AUTO-PWD] Найдено поле пароля, вводим...');
                    // Нативный setter чтобы Vue/React увидели изменение
                    const nativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
                    nativeSetter.call(passInput, AUTO_PASSWORD);
                    passInput.dispatchEvent(new Event('input', { bubbles: true }));
                    passInput.dispatchEvent(new Event('change', { bubbles: true }));

                    // Небольшая задержка и нажимаем кнопку подтверждения
                    setTimeout(function() {
                        // Ищем кнопку "Войти" / "OK" / первую кнопку диалога
                        const btn =
                            document.querySelector('.dialog-button-ok') ||
                            document.querySelector('.dialog button:first-of-type') ||
                            document.querySelector('[class*="dialog"] button');
                        if (btn) {
                            btn.click();
                            console.log('[AHK AUTO-PWD] Кнопка подтверждения нажата');
                        } else {
                            // Fallback — эмулируем Enter
                            passInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
                            console.log('[AHK AUTO-PWD] Enter отправлен (кнопка не найдена)');
                        }
                    }, 150);
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });

            // Способ 3: перехват addDialogInQueue (если уже существует)
            if (typeof window.addDialogInQueue === 'function' && !window._ahkPwdHooked) {
                const _origAddDlg = window.addDialogInQueue;
                window.addDialogInQueue = function(params, content, priority) {
                    // style=3 — PASSWORD диалог в SAMP/Radmir
                    try {
                        const parsed = Array.isArray(params) ? params : JSON.parse(params);
                        const style = parseInt(parsed[1]);
                        const title = (parsed[2] || '').toLowerCase();
                        if (style === 3 || title.includes('пароль') || title.includes('password') || title.includes('вход')) {
                            console.log('[AHK AUTO-PWD] Перехвачен PASSWORD диалог, авто-ввод...');
                            // Даём диалогу отрисоваться, потом вводим
                            setTimeout(function() {
                                const inp = document.querySelector('input[type="password"], input.dialog-input');
                                if (inp && !inp.dataset.ahkFilled) {
                                    inp.dataset.ahkFilled = '1';
                                    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
                                    setter.call(inp, AUTO_PASSWORD);
                                    inp.dispatchEvent(new Event('input', { bubbles: true }));
                                    inp.dispatchEvent(new Event('change', { bubbles: true }));
                                    setTimeout(function() {
                                        const btn = document.querySelector('.dialog-button-ok, .dialog button:first-of-type');
                                        if (btn) btn.click();
                                        else inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
                                    }, 150);
                                }
                            }, 200);
                        }
                    } catch(e) {}
                    return _origAddDlg.call(this, params, content, priority);
                };
                window._ahkPwdHooked = true;
                console.log('[AHK AUTO-PWD] Хук addDialogInQueue установлен');
            } else {
                window._ahkPwdHooked = true;
                console.log('[AHK AUTO-PWD] MutationObserver установлен (хук addDialogInQueue недоступен)');
            }
        }

        // Ждём загрузки DOM
        if (document.body) {
            tryHook();
        } else {
            document.addEventListener('DOMContentLoaded', tryHook);
        }
        // Дополнительная попытка через 2 сек (на случай позднего появления addDialogInQueue)
        setTimeout(tryHook, 2000);
    })();
    console.log(`[AHK AUTO-PWD] Модуль авто-пароля активирован`);
}
// ── END АВТО-ВВОД ПАРОЛЯ ──────────────────────────────────────

// Запуск загрузчика
loadScriptFromGitHub(username, repo, folder, filename);

