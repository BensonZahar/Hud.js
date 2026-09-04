// Load.js - Улучшенный загрузчик с поддержкой конфигураций
const username = 'BensonZahar';
const repo = 'Hud.js';
const currentUser = ''; // ИЗМЕНЯЙТЕ ЭТО ДЛЯ РАЗНЫХ ПОЛЬЗОВАТЕЛЕЙ: 'Zahar', 'Kirill', 'Kolya'
const accountNumber = ''; // НОМЕР АККАУНТА (1–8) — устанавливается установщиком автоматически

// ============================================================
// Автоматический поиск чат-компонента — два метода:
//
// Метод 1 (быстрый): читаем исходник Hud.js через fetch и ищем
//   уникальный паттерн:  const XX={components:{Scrolling:
//   Этот паттерн стабилен — меняется только имя XX
//
// Метод 2 (резервный): eval-сканирование всех переменных
//   в scope модуля (1, 2, 3 символа)
// ============================================================

function hookComponent(v, name) {
    if (
        v &&
        typeof v === 'object' &&
        !Array.isArray(v) &&
        v.methods &&
        typeof v.methods.add === 'function' &&
        typeof v.data === 'function' &&
        v.components
    ) {
        // FIX: не вешаем хук повторно при перезагрузке скрипта
        if (v.methods.__hassleHooked) {
            console.log(`✅ Хук на чат уже установлен ("${name}"), пропускаем`);
            return true;
        }
        const originalAdd = v.methods.add;
        v.methods.add = function (e, s, t) {
            const result = originalAdd.call(this, e, s, t);
            window.OnChatAddMessage?.(e, s, t);
            return result;
        };
        v.methods.__hassleHooked = true; // маркер: хук уже на месте
        console.log(`✅ Хук на чат установлен (переменная: "${name}")`);
        return true;
    }
    return false;
}

function evalScan() {
    // Все возможные символы для минифицированных имён
    const starts = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$'.split('');
    const rest   = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_$'.split('');

    // 1 символ
    for (const c of starts) {
        let v; try { v = eval(c); } catch(e) { continue; }
        if (hookComponent(v, c)) return true;
    }
    // 2 символа
    for (const c1 of starts) {
        for (const c2 of rest) {
            const n = c1 + c2;
            let v; try { v = eval(n); } catch(e) { continue; }
            if (hookComponent(v, n)) return true;
        }
    }
    // 3 символа
    for (const c1 of starts) {
        for (const c2 of rest) {
            for (const c3 of rest) {
                const n = c1 + c2 + c3;
                let v; try { v = eval(n); } catch(e) { continue; }
                if (hookComponent(v, n)) return true;
            }
        }
    }

    console.error('❌ Компонент чата не найден после полного сканирования');
    return false;
}

function setupChatHook() {
    // Метод 1: найти имя переменной по исходнику Hud.js
    // Паттерн const XX={components:{Scrolling: стабилен между обновлениями
    try {
        const hudScript = Array.from(document.querySelectorAll('script[type="module"][src]'))
            .find(s => s.src.includes('Hud'));

        if (hudScript) {
            fetch(hudScript.src)
                .then(r => r.text())
                .then(src => {
                    const match = src.match(/const\s+(\w+)=\{components:\{Scrolling:/);
                    if (match) {
                        const varName = match[1];
                        console.log(`🔍 Нашли имя чат-компонента в исходнике: "${varName}"`);
                        // eval() здесь имеет доступ к scope модуля Hud.js
                        let v; try { v = eval(varName); } catch(e) {}
                        if (!hookComponent(v, varName)) {
                            console.warn('⚠️ eval по имени не сработал, запускаем сканирование');
                            evalScan();
                        }
                    } else {
                        console.warn('⚠️ Паттерн не найден в исходнике, запускаем сканирование');
                        evalScan();
                    }
                })
                .catch(() => evalScan());

            return; // fetch асинхронный, выходим
        }
    } catch (e) {}

    // Метод 2: сканирование (синхронно, если fetch не доступен)
    evalScan();
}

setupChatHook();

// Загрузить текст файла с GitHub (без eval) — XHR с retry
function fetchRawText(filename, retries = 5) {
    const url = `https://raw.githubusercontent.com/${username}/${repo}/main/HassleB/${filename}`;
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                console.log(`✅ Текст ${filename} получен`);
                resolve(xhr.responseText);
            } else {
                if (retries > 0) {
                    console.warn(`⚠️ HTTP ${xhr.status} для ${filename}, повтор... (${retries} осталось)`);
                    setTimeout(() => fetchRawText(filename, retries - 1).then(resolve).catch(reject), 2000);
                } else {
                    reject(new Error(`Не удалось загрузить текст ${filename}`));
                }
            }
        };
        xhr.onerror = function() {
            if (retries > 0) {
                console.warn(`⚠️ Ошибка сети ${filename}, повтор... (${retries} осталось)`);
                setTimeout(() => fetchRawText(filename, retries - 1).then(resolve).catch(reject), 2000);
            } else {
                reject(new Error(`Сетевая ошибка при загрузке текста ${filename}`));
            }
        };
        xhr.send();
    });
}

// Функция загрузчика с retry
function loadScriptFromGitHub(filename, retries = 5) {
    const url = `https://raw.githubusercontent.com/${username}/${repo}/main/HassleB/${filename}`;

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);

        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    eval(xhr.responseText);
                    console.log(`✅ Скрипт ${filename} загружен и выполнен успешно`);
                    resolve();
                } catch (err) {
                    console.error(`❌ Ошибка выполнения ${filename}:`, err);
                    reject(err);
                }
            } else {
                console.error(`HTTP error! status: ${xhr.status} для ${url}`);
                if (retries > 0) {
                    console.log(`🔄 Повторная попытка ${filename}... Осталось попыток: ${retries - 1}`);
                    setTimeout(() => {
                        loadScriptFromGitHub(filename, retries - 1).then(resolve).catch(reject);
                    }, 2000);
                } else {
                    reject(new Error(`Не удалось загрузить ${filename} после всех попыток`));
                }
            }
        };

        xhr.onerror = function () {
            console.error(`Ошибка сети при загрузке ${filename}`);
            if (retries > 0) {
                console.log(`🔄 Повторная попытка ${filename}... Осталось попыток: ${retries - 1}`);
                setTimeout(() => {
                    loadScriptFromGitHub(filename, retries - 1).then(resolve).catch(reject);
                }, 2000);
            } else {
                reject(new Error(`Не удалось загрузить ${filename} после всех попыток`));
            }
        };

        xhr.send();
    });
}

// Функция для применения конфигурации пользователя
function applyUserConfig() {
    if (!window.USER_CONFIGS) {
        console.error('❌ USER_CONFIGS не загружен!');
        return false;
    }

    const userConfig = window.USER_CONFIGS[currentUser];
    if (!userConfig) {
        console.error(`❌ Конфигурация для пользователя "${currentUser}" не найдена!`);
        return false;
    }

    window.CHAT_IDS = userConfig.CHAT_IDS;
    window.DEFAULT_TOKEN = null;
    window.PASSWORD = userConfig.PASSWORD;
    window.RECONNECT_ENABLED_DEFAULT = userConfig.RECONNECT_ENABLED_DEFAULT;
    window.BROADCAST_CHANNEL_ID = userConfig.BROADCAST_CHANNEL_ID || null;

    window.ACCOUNT_NUMBER = accountNumber;
    const userBotTokens = userConfig.BOT_TOKENS || {};
    if (accountNumber && userBotTokens[accountNumber]) {
        window.ACCOUNT_TOKEN = userBotTokens[accountNumber];
        console.log(`✅ Токен для аккаунта #${accountNumber} (${currentUser}) установлен`);
    } else {
        window.ACCOUNT_TOKEN = null;
        console.warn(`⚠️ Токен для аккаунта #${accountNumber} у "${currentUser}" не найден`);
    }

    console.log(`✅ Конфигурация для "${currentUser}" применена:`, {
        chatIds: userConfig.CHAT_IDS,
        password: '***' + userConfig.PASSWORD.slice(-4),
        reconnect: userConfig.RECONNECT_ENABLED_DEFAULT
    });

    return true;
}

// Получить информацию о последнем коммите файла с GitHub API
async function fetchLastCommitInfo(filename) {
    const apiUrl = `https://api.github.com/repos/${username}/${repo}/commits?path=HassleB/${filename}&per_page=1`;
    try {
        const xhr = await new Promise((resolve, reject) => {
            const x = new XMLHttpRequest();
            x.open('GET', apiUrl, true);
            x.setRequestHeader('Accept', 'application/vnd.github.v3+json');
            x.onload = () => resolve(x);
            x.onerror = () => reject(new Error('network error'));
            x.send();
        });
        if (xhr.status === 200) {
            const commits = JSON.parse(xhr.responseText);
            if (commits && commits.length > 0) {
                const c = commits[0];
                const msg   = c.commit.message.split('\n')[0].slice(0, 80); // первая строка, макс 80 символов
                const author = c.commit.author.name;
                const rawDate = c.commit.author.date; // ISO 8601
                // Форматируем дату в DD.MM.YYYY HH:MM
                const d = new Date(rawDate);
                const pad = n => String(n).padStart(2, '0');
                const dateStr = `${pad(d.getDate())}.${pad(d.getMonth()+1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
                return { msg, author, date: dateStr, sha: c.sha.slice(0, 7) };
            }
        }
    } catch (e) {
        console.warn('[CommitInfo] Ошибка получения информации о коммите:', e.message);
    }
    return null;
}

// Отправить в Telegram уведомление о загруженном файле с инфой о коммите
function sendCodeLoadedNotification(filename, commitInfo) {
    // Берём токен и chatIds из window (уже установлены через applyUserConfig)
    const token = window.ACCOUNT_TOKEN || window.DEFAULT_TOKEN;
    const chatIds = window.CHAT_IDS;
    if (!token || !chatIds || chatIds.length === 0) return;

    let text;
    if (commitInfo) {
        text =
            `📦 <b>${filename} загружен</b>\n` +
            `📝 ${commitInfo.msg}\n` +
            `📅 ${commitInfo.date}\n` +
            `👤 ${commitInfo.author}  <code>#${commitInfo.sha}</code>`;
    } else {
        text = `📦 <b>${filename} загружен</b>\n<i>Информация о коммите недоступна</i>`;
    }

    const tgUrl = `https://api.telegram.org/bot${token}/sendMessage`;
    chatIds.forEach(chatId => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', tgUrl, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: 'HTML',
            disable_notification: true
        }));
    });
}

// ============================================================
// FIX: Очистка хуков перед повторной загрузкой скриптов.
// Каждый eval Code.js/Code2.js оборачивает window-функции.
// Без очистки после N перезагрузок накапливается N обёрток,
// и каждое событие (чат, диалог, авторизация) срабатывает N раз.
// ============================================================
function hassleCleanupHooks() {
    // FIX: обрываем старый long-poll XHR — он не должен завершиться после перезагрузки
    // и сдвинуть _hbOffset в неправильное место (пропуск обновлений)
    if (window._hassleCurrentPollXhr) {
        try { window._hassleCurrentPollXhr.abort(); } catch(e) {}
        window._hassleCurrentPollXhr = null;
        console.log('[Hassle Cleanup] Старый long-poll XHR оборван');
    }
    // openInterface: Code.js вешает 2 обёртки при каждом eval
    if (typeof window._hassleOrig_openInterface === 'function') {
        window.openInterface = window._hassleOrig_openInterface;
        console.log('[Hassle Cleanup] openInterface восстановлен');
    }
    // addDialogInQueue: Code2.js вешает обёртку при каждом eval
    if (typeof window._hassleOrig_addDialogInQueue === 'function') {
        window.addDialogInQueue = window._hassleOrig_addDialogInQueue;
        console.log('[Hassle Cleanup] addDialogInQueue восстановлен');
    }
    // sendClientEventCustom: Code2.js вешает обёртку при каждом eval
    if (typeof window._hassleOrig_sendClientEventCustom === 'function') {
        window.sendClientEventCustom = window._hassleOrig_sendClientEventCustom;
        // sendClientEvent — глобальная переменная уровня модуля игры,
        // Code2.js присваивает её напрямую: sendClientEvent = window.sendClientEventCustom
        if (typeof sendClientEvent !== 'undefined') {
            try { sendClientEvent = window._hassleOrig_sendClientEventCustom; } catch(e) {}
        }
        console.log('[Hassle Cleanup] sendClientEventCustom восстановлен');
    }
    // OnChatAddMessage: Code.js ставит новую функцию, Code2.js оборачивает её.
    // Сбрасываем — Code.js поставит заново при следующем eval.
    window.OnChatAddMessage = null;
    // Сбрасываем флаг паузы бота, иначе __botInit не будет вызван повторно
    window.__WAIT_CODE2__ = false;
    window.__botInit = null;
    console.log('[Hassle Cleanup] Хуки сброшены, готов к перезагрузке');
}

// Последовательная загрузка скриптов
async function initializeScripts() {
    try {
        // FIX: снимаем старые хуки перед повторным eval скриптов
        hassleCleanupHooks();

        console.log(`🚀 Начало загрузки для пользователя: ${currentUser}`);

        console.log('📋 Загрузка List.js...');
        await loadScriptFromGitHub('List.js');

        console.log(`⚙️ Применение конфигурации для ${currentUser}...`);
        if (!applyUserConfig()) {
            throw new Error('Не удалось применить конфигурацию пользователя');
        }

        // Сначала получаем текст Code2.js — он нужен до запуска Code.js
        console.log('📥 Загрузка текста Code2.js...');
        window.__CODE2_TEXT__ = await fetchRawText('Code2.js');

        // Флаг: Code.js не запускает бота сам — ждёт завершения eval Code2
        window.__WAIT_CODE2__ = true;

        console.log('📦 Загрузка Code.js (+ Code2 внутри)...');
        await loadScriptFromGitHub('Code.js');

        // Бот запускается после того как Code.js eval'нул Code2 и установил __botInit
        console.log('🚀 Запускаем бота...');
        if (typeof window.__botInit === 'function') {
            window.__botInit();
            window.__botInit = null;
        } else {
            console.warn('⚠️ __botInit не найден — бот уже запущен или Code.js не установил флаг');
        }

        // Инфо о коммитах грузим в фоне — не блокируем старт бота
        Promise.all([
            fetchLastCommitInfo('Code.js'),
            fetchLastCommitInfo('Code2.js'),
        ]).then(([codeInfo, code2Info]) => {
            window.CODE_COMMIT_INFO  = codeInfo  || null;
            window.CODE2_COMMIT_INFO = code2Info || null;
            console.log('📝 Инфо о коммитах загружено — обновляем велком');
            // Редактируем уже отправленное велком-сообщение с версиями
            if (typeof window.sendWelcomeMessage === 'function') {
                window.sendWelcomeMessage();
            }
        }).catch(() => {
            console.warn('⚠️ Не удалось получить инфо о коммитах');
        });

        console.log(`🎉 Все скрипты успешно загружены для ${currentUser}!`);

        // === ЗАЖАТИЕ ЛОГОТИПА H → /hb ===
        (function setupHBLongPress() {
            const LONG_PRESS_MS = 600; // мс — сколько держать для открытия меню

            function attachLongPress() {
                const fist = document.querySelector('.hud-hassle-info__fist-content');
                if (!fist) {
                    setTimeout(attachLongPress, 1000);
                    return;
                }
                if (fist.dataset.hbAttached) return;
                fist.dataset.hbAttached = '1';

                let timer = null;

                // Touch (мобилка)
                fist.addEventListener('touchstart', () => {
                    timer = setTimeout(() => {
                        timer = null;
                        window.sendChatInput('/hb');
                    }, LONG_PRESS_MS);
                }, { passive: true });

                fist.addEventListener('touchend', () => {
                    if (timer) { clearTimeout(timer); timer = null; }
                });

                fist.addEventListener('touchmove', () => {
                    if (timer) { clearTimeout(timer); timer = null; }
                });

                // Mouse (ПК)
                fist.addEventListener('mousedown', () => {
                    timer = setTimeout(() => {
                        timer = null;
                        window.sendChatInput('/hb');
                    }, LONG_PRESS_MS);
                });

                fist.addEventListener('mouseup', () => {
                    if (timer) { clearTimeout(timer); timer = null; }
                });

                fist.addEventListener('mouseleave', () => {
                    if (timer) { clearTimeout(timer); timer = null; }
                });

                console.log('✅ [HB] Зажатие логотипа H → /hb подключено');
            }

            setTimeout(attachLongPress, 3000);
        })();
        // === END ЗАЖАТИЕ ЛОГОТИПА H ===

        setTimeout(() => {
            if (window.OnChatAddMessage) {
                console.log('✅ OnChatAddMessage успешно инициализирован');
            } else {
                console.warn('⚠️ OnChatAddMessage не найден, но это может быть нормально');
            }
        }, 1000);

    } catch (error) {
        console.error('❌ Критическая ошибка при инициализации:', error);
        alert(`Ошибка загрузки скриптов для ${currentUser}: ${error.message}`);
    }
}

window.CURRENT_USER = currentUser;
window.ACCOUNT_NUMBER = accountNumber;
window.initializeScripts = initializeScripts;

initializeScripts();
