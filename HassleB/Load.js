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
        const originalAdd = v.methods.add;
        v.methods.add = function (e, s, t) {
            const result = originalAdd.call(this, e, s, t);
            window.OnChatAddMessage?.(e, s, t);
            return result;
        };
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

// Последовательная загрузка скриптов
async function initializeScripts() {
    try {
        console.log(`🚀 Начало загрузки для пользователя: ${currentUser}`);

        console.log('📋 Загрузка List.js...');
        await loadScriptFromGitHub('List.js');

        console.log(`⚙️ Применение конфигурации для ${currentUser}...`);
        if (!applyUserConfig()) {
            throw new Error('Не удалось применить конфигурацию пользователя');
        }

        console.log('📦 Загрузка Code.js...');
        // Получаем инфо о коммите до загрузки (параллельно, не блокируем загрузку)
        const codeCommitInfoPromise = fetchLastCommitInfo('Code.js');
        await loadScriptFromGitHub('Code.js');

        // Сохраняем инфо о коммите глобально — Code.js читает его в велком-сообщении
        const codeCommitInfo = await codeCommitInfoPromise;
        window.CODE_COMMIT_INFO = codeCommitInfo || null;
        sendCodeLoadedNotification('Code.js', codeCommitInfo);

        console.log(`🎉 Все скрипты успешно загружены для ${currentUser}!`);

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
