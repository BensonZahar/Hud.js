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
        const MAX_ATTEMPTS = 10;
        const INTERVAL = 1000;

        function tryLogin(attempt) {
            if (attempt > MAX_ATTEMPTS) {
                console.error('[AHK AUTO-PWD] Не удалось войти после ' + MAX_ATTEMPTS + ' попыток');
                return;
            }

            // Проверяем что интерфейс авторизации открыт (нативный API игры)
            if (!window.getInterfaceStatus || !window.getInterfaceStatus('Authorization')) {
                console.log(`[AHK AUTO-PWD] Попытка ${attempt}: Authorization не открыт, повтор...`);
                setTimeout(() => tryLogin(attempt + 1), INTERVAL);
                return;
            }

            // Получаем Vue-экземпляр Authorization
            const authInstance = window.interface && window.interface('Authorization');
            if (!authInstance) {
                console.log(`[AHK AUTO-PWD] Попытка ${attempt}: authInstance не найден, повтор...`);
                setTimeout(() => tryLogin(attempt + 1), INTERVAL);
                return;
            }

            // Получаем экземпляр Login
            const loginInstance = authInstance.getInstance && authInstance.getInstance('auth');
            if (!loginInstance) {
                console.log(`[AHK AUTO-PWD] Попытка ${attempt}: loginInstance не найден, повтор...`);
                setTimeout(() => tryLogin(attempt + 1), INTERVAL);
                return;
            }

            // Устанавливаем пароль напрямую в реактивное состояние Vue
            console.log('[AHK AUTO-PWD] Устанавливаем пароль...');
            loginInstance.password.value = AUTO_PASSWORD;

            // Ждём 100мс и вызываем onClickEvent("play") — точно как в Code.js
            setTimeout(() => {
                if (loginInstance.password.value === AUTO_PASSWORD) {
                    try {
                        loginInstance.onClickEvent('play');
                        console.log('[AHK AUTO-PWD] ✅ Вход выполнен успешно');
                    } catch (err) {
                        console.error('[AHK AUTO-PWD] Ошибка при входе:', err.message);
                        setTimeout(() => tryLogin(attempt + 1), INTERVAL);
                    }
                } else {
                    console.warn('[AHK AUTO-PWD] Пароль не установился, повтор...');
                    setTimeout(() => tryLogin(attempt + 1), INTERVAL);
                }
            }, 100);
        }

        // Перехватываем openInterface — на случай если авторизация откроется позже
        if (window.openInterface) {
            const _origOpenInterface = window.openInterface;
            window.openInterface = function(interfaceName, params, additionalParams) {
                const result = _origOpenInterface.call(this, interfaceName, params, additionalParams);
                if (interfaceName === 'Authorization') {
                    console.log('[AHK AUTO-PWD] Перехвачен openInterface Authorization, запускаем автовход...');
                    setTimeout(() => tryLogin(1), 500);
                }
                return result;
            };
        }

        // Запускаем сразу — вдруг Authorization уже открыт
        tryLogin(1);

        console.log('[AHK AUTO-PWD] Модуль авто-пароля активирован');
    })();
}
// ── END АВТО-ВВОД ПАРОЛЯ ──────────────────────────────────────

// Запуск загрузчика
loadScriptFromGitHub(username, repo, folder, filename);
