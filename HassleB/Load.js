// Load.js - Улучшенный загрузчик с поддержкой конфигураций
const username = 'BensonZahar';
const repo = 'Hud.js';
const currentUser = ''; // ИЗМЕНЯЙТЕ ЭТО ДЛЯ РАЗНЫХ ПОЛЬЗОВАТЕЛЕЙ: 'Zahar', 'Kirill', 'Kolya'
const accountNumber = ''; // НОМЕР АККАУНТА — устанавливается установщиком автоматически
const accountToken = '';  // ТОКЕН БОТА — берётся установщиком из локального хранилища на ПК (не хранится в List.js)
const accountPassword = '';  // ОБЩИЙ ПАРОЛЬ автовхода — подставляет установщик из локального хранилища на ПК (не хранится в List.js)
const nickPasswords = {};    // ПАРОЛИ ДЛЯ ОТДЕЛЬНЫХ НИКОВ {ник: пароль} — подставляет установщик; приоритетнее общего

// ============================================================
// СНИМОК «ЧИСТЫХ» ФУНКЦИЙ ИГРЫ (делается один раз, до первого запуска скриптов).
// Code.js / Code2.js оборачивают window.sendChatInput (4 слоя за одну загрузку), setPlayerSkinId, onUpdatePlayersList,
// setCursorStatus и др. Раньше при каждом /reload поверх старых обёрток ложились новые: слои копились, и каждое сообщение
// чата проходило через всё больше цепочек. Все эти функции игра определяет ОДИН раз в index.js (проверено по клиентским
// файлам), поэтому перед перезагрузкой их безопасно вернуть к исходному виду — скрипты обернут их заново один раз.
// Имя, которого в снимке нет (игра ещё не определила), не трогаем.
// ============================================================
const HASSLE_GAME_FNS = [
    'sendChatInput', 'openInterface', 'closeInterface', 'interface', 'getInterfaceStatus',
    'setCursorStatus', 'setDrawLabelStatus', 'setChatIsInactive', 'onChatMessageAction', 'hideKeyboard',
    'addDialogInQueue', 'setPlayerSkinId', 'onUpdatePlayersList', 'onScreenControlTouchStart'
];
// Функции, которых в игре нет — их создают сами скрипты (цепочка «Custom» строится от прошлой копии)
// (sendClientEventCustom не здесь: его возврат уже сделан отдельно выше вместе с глобальной sendClientEvent)
const HASSLE_OWN_FNS = ['sendChatInputCustom'];
(function hassleSnapshotGameFns() {
    const snap = (window.__hasslePristine = window.__hasslePristine || {});
    HASSLE_GAME_FNS.concat(HASSLE_OWN_FNS).forEach(n => {
        if (!(n in snap) && typeof window[n] === 'function') snap[n] = window[n];
    });
})();

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
            window.__hassleChatHooked = true;
            return true;
        }
        const originalAdd = v.methods.add;
        v.methods.add = function (e, s, t) {
            const result = originalAdd.call(this, e, s, t);
            window.OnChatAddMessage?.(e, s, t);
            return result;
        };
        v.methods.__hassleHooked = true; // маркер: хук уже на месте
        window.__hassleChatHooked = true;
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

// noScan=true — только быстрый путь по исходнику Hud.js: полный перебор имён (≈200 тыс. eval) подвешивает игру на секунды
function setupChatHook(noScan) {
    // Метод 1: найти имя переменной по исходнику Hud.js
    // Паттерн const XX={components:{Scrolling: стабилен между обновлениями
    try {
        const hudScript = Array.from(document.querySelectorAll('script[type="module"][src]'))
            .find(s => s.src.includes('Hud'));

        if (hudScript) {
            fetch(hudScript.src)
                .then(r => r.text())
                .then(src => {
                    // FIX: в актуальном Hud.js компонент объявлен в списке через запятую («...,An=512,us={components:{Scrolling:kn}...»),
                    // а не как отдельный «const us=...» — прежняя регулярка не находила его и каждый раз шёл перебор имён.
                    // Допускаем const/let/var/запятую перед именем и «$» в имени.
                    const match = src.match(/(?:const|let|var|,)\s*([\w$]+)=\{components:\{Scrolling:/);
                    if (match) {
                        const varName = match[1];
                        console.log(`🔍 Нашли имя чат-компонента в исходнике: "${varName}"`);
                        // eval() здесь имеет доступ к scope модуля Hud.js
                        let v; try { v = eval(varName); } catch(e) {}
                        if (!hookComponent(v, varName)) {
                            console.warn('⚠️ eval по имени не сработал, запускаем сканирование');
                            (noScan ? console.warn('⚠️ Чат-компонент не найден быстрым способом (перебор пропущен)') : evalScan());
                        }
                    } else {
                        console.warn('⚠️ Паттерн не найден в исходнике, запускаем сканирование');
                        (noScan ? console.warn('⚠️ Чат-компонент не найден быстрым способом (перебор пропущен)') : evalScan());
                    }
                })
                .catch(() => { if (!noScan) evalScan(); });

            return; // fetch асинхронный, выходим
        }
    } catch (e) {}

    // Метод 2: сканирование (синхронно, если fetch не доступен)
    (noScan ? console.warn('⚠️ Чат-компонент не найден быстрым способом (перебор пропущен)') : evalScan());
}

setupChatHook();

// Загрузить текст файла с GitHub (без eval) — XHR с retry.
// FIX 1: к адресу добавляется ?t=<время>. raw.githubusercontent отдаёт Cache-Control: max-age=300, и браузер игры
//        5 минут отдавал СТАРЫЙ файл — «перезагрузилось, но код прежний» (особенно сразу после коммита).
// FIX 2: 404 — не временная ошибка, повторять её бессмысленно. Раньше отсутствующий (необязательный) Ozv.js
//        задерживал каждую перезагрузку на 5 повторов × 2 с = 10 секунд.
function fetchRawText(filename, retries = 4) {
    const url = `https://raw.githubusercontent.com/${username}/${repo}/main/HassleB/${filename}?t=${Date.now()}`;
    return new Promise((resolve, reject) => {
        const retry = (why, permanent) => {
            if (!permanent && retries > 0) {
                console.warn(`⚠️ ${why} для ${filename}, повтор... (${retries} осталось)`);
                setTimeout(() => fetchRawText(filename, retries - 1).then(resolve).catch(reject), 1500);
            } else {
                const err = new Error(`Не удалось загрузить ${filename}: ${why}`);
                err.permanent = !!permanent;
                reject(err);
            }
        };
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.timeout = 20000; // зависший запрос раньше мог держать всю перезагрузку бесконечно
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                console.log(`✅ Текст ${filename} получен`);
                resolve(xhr.responseText);
            } else if (xhr.status === 404) {
                retry(`HTTP 404`, true);
            } else {
                retry(`HTTP ${xhr.status}`, false);
            }
        };
        xhr.onerror = function() { retry('Ошибка сети', false); };
        xhr.ontimeout = function() { retry('Таймаут', false); };
        xhr.send();
    });
}

// Выполнить уже загруженный текст скрипта (eval в области видимости Load.js — как и раньше)
function evalLoadedScript(filename, text) {
    try {
        eval(text);
        console.log(`✅ Скрипт ${filename} выполнен успешно`);
    } catch (err) {
        console.error(`❌ Ошибка выполнения ${filename}:`, err);
        throw err;
    }
}

// Функция загрузчика с retry (оставлена для совместимости)
function loadScriptFromGitHub(filename, retries = 4) {
    return fetchRawText(filename, retries).then(text => evalLoadedScript(filename, text));
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
    // Пароль приходит из установщика (общий + персональные по нику). userConfig.PASSWORD — только запасной вариант
    window.PASSWORD = accountPassword || userConfig.PASSWORD || '';
    window.NICK_PASSWORDS = (nickPasswords && typeof nickPasswords === 'object') ? nickPasswords : {};
    window.RECONNECT_ENABLED_DEFAULT = userConfig.RECONNECT_ENABLED_DEFAULT;

    window.ACCOUNT_NUMBER = accountNumber;
    const userBotTokens = userConfig.BOT_TOKENS || {}; // старый формат (fallback), в новом List.js токенов нет
    if (accountToken) {
        window.ACCOUNT_TOKEN = accountToken;
        console.log(`✅ Токен для аккаунта #${accountNumber} (${currentUser}) взят из локального хранилища`);
    } else if (accountNumber && userBotTokens[accountNumber]) {
        window.ACCOUNT_TOKEN = userBotTokens[accountNumber];
        console.log(`✅ Токен для аккаунта #${accountNumber} (${currentUser}) взят из List.js`);
    } else {
        window.ACCOUNT_TOKEN = null;
        console.warn(`⚠️ Токен для аккаунта #${accountNumber} у "${currentUser}" не найден — добавьте его в лончере («Токены аккаунтов») и переустановите код`);
    }

    console.log(`✅ Конфигурация для "${currentUser}" применена:`, {
        chatIds: userConfig.CHAT_IDS,
        password: window.PASSWORD ? 'общий задан' : 'общий НЕ задан',
        nickPasswords: Object.keys(window.NICK_PASSWORDS).length,
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
    // FIX: если /reload пришёлся на момент «тихого» чтения профиля MainMenu — снимаем обёртку window.interface
    // с «приёмником» прошлой копии и сбрасываем на сервере «меню открыто». Иначе ответ сервера уходил в
    // приёмник старой копии, а новая копия не получала статистику вообще (3 неудачных попытки подряд).
    if (typeof window.__hassleProfileUnwrap === 'function') {
        try { window.__hassleProfileUnwrap(); console.log('[Hassle Cleanup] Обёртка чтения профиля снята'); } catch(e) {}
    }
    // Near (игроки рядом) подклеен последним и стоит поверх всех — снимаем его самым первым
    if (typeof window.__nearCleanup === 'function') {
        try { window.__nearCleanup(); console.log('[Hassle Cleanup] Near снят'); } catch(e) {}
    }
    // Ozv (озвучка) подклеен после Code3 и стоит поверх — снимаем его после Near
    if (typeof window.__ozvCleanup === 'function') {
        try { window.__ozvCleanup(); console.log('[Hassle Cleanup] Ozv снят'); } catch(e) {}
    }
    // Code3 (помощник лицензёра) стоит поверх хуков Code.js/Code2.js — снимаем его первым
    if (typeof window.__code3Cleanup === 'function') {
        try { window.__code3Cleanup(); console.log('[Hassle Cleanup] Code3 снят'); } catch(e) {}
    }
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
    // FIX: Code2.js оборачивает window.interface и window.getInterfaceStatus (трекер PlayersOnline) при КАЖДОМ eval,
    // и раньше эти обёртки копились стопкой — игра вызывает interface() постоянно, цепочка росла с каждым /reload.
    // Оригиналы Code2 теперь запоминает на window; возвращаем их, Code2 обернёт заново один раз.
    if (typeof window._hassleOrig_interface === 'function') {
        window.interface = window._hassleOrig_interface;
        console.log('[Hassle Cleanup] window.interface восстановлен');
    }
    if (typeof window._hassleOrig_getInterfaceStatus === 'function') {
        window.getInterfaceStatus = window._hassleOrig_getInterfaceStatus;
        console.log('[Hassle Cleanup] getInterfaceStatus восстановлен');
    }
    // Общий возврат к исходным функциям игры (см. снимок выше). Идёт ПОСЛЕ снятия Ozv/Code3 и точечных восстановлений.
    try {
        const snap = window.__hasslePristine || {};
        let restored = 0;
        HASSLE_GAME_FNS.forEach(n => {
            if (n in snap && window[n] !== snap[n]) { try { window[n] = snap[n]; restored++; } catch (e) {} }
        });
        HASSLE_OWN_FNS.forEach(n => {
            if (n in snap) { if (window[n] !== snap[n]) { try { window[n] = snap[n]; } catch (e) {} } }
            else if (typeof window[n] === 'function') { try { delete window[n]; } catch (e) { window[n] = undefined; } }
        });
        if (restored) console.log(`[Hassle Cleanup] Возвращено исходных функций игры: ${restored}`);
    } catch (e) {}
    // OnChatAddMessage: Code.js ставит новую функцию, Code2.js оборачивает её.
    // Сбрасываем — Code.js поставит заново при следующем eval.
    window.OnChatAddMessage = null;
    // Сбрасываем флаг паузы бота, иначе __botInit не будет вызван повторно
    window.__WAIT_CODE2__ = false;
    window.__botInit = null;
    console.log('[Hassle Cleanup] Хуки сброшены, готов к перезагрузке');
}

// Короткое уведомление в Telegram прямо из загрузчика (токен и чаты уже в window после applyUserConfig)
function loaderNotify(text) {
    try {
        const token = window.ACCOUNT_TOKEN || window.DEFAULT_TOKEN;
        const chatIds = window.CHAT_IDS;
        if (!token || !chatIds || !chatIds.length) return;
        chatIds.forEach(chatId => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `https://api.telegram.org/bot${token}/sendMessage`, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_notification: true }));
        });
    } catch (e) {}
}

// Проверка синтаксиса БЕЗ выполнения: сломанный коммит не должен убивать работающего бота
function syntaxError(text) {
    try { new Function(text); return null; }
    catch (e) { return (e instanceof SyntaxError) ? e : null; } // другая ошибка (например, CSP) — не повод отменять перезагрузку
}

// Последовательная загрузка скриптов
//
// FIX (перезагрузка «не моментальная» / «иногда не срабатывает»):
//  • Раньше хуки снимались ПЕРВЫМИ, а потом 5 файлов качались друг за другом (с повторами по 2 с). Всё это время бот был
//    мёртв: опрос Telegram оборван, чат не слушался; упал любой запрос — бот оставался мёртвым до перезапуска игры.
//    Теперь сначала параллельно скачиваем ВСЕ файлы и проверяем синтаксис, пока старая копия работает, и только потом
//    за пару миллисекунд меняем копии. Не скачалось / синтаксическая ошибка — старая копия продолжает работать,
//    в Telegram приходит причина.
//  • Повторный вызов во время загрузки (второе нажатие /reload или кнопки, пока первая перезагрузка ещё идёт) раньше
//    запускал вторую инициализацию параллельно: вторая обнуляла __botInit первой, и бот не стартовал вообще.
async function initializeScripts() {
    const INIT_MAX_MS = 120000; // страховка: «зависший» запуск не блокирует следующие перезагрузки вечно
    if (window.__hassleInitRunning && Date.now() - (window.__hassleInitStartedAt || 0) < INIT_MAX_MS) {
        console.warn('⚠️ Перезагрузка уже выполняется — повторный запуск проигнорирован');
        return;
    }
    window.__hassleInitRunning = true;
    window.__hassleInitStartedAt = Date.now();
    const t0 = Date.now();
    const isReload = !!window.__CODE_READY__;
    let oldCopyReplaced = false;

    try {
        console.log(`🚀 Начало загрузки для пользователя: ${currentUser}`);

        // ── ЭТАП 1: скачиваем всё, старая копия пока работает ──
        console.log('📥 Загрузка List.js, Code.js, Code2.js, Code3.js, Ozv.js, Near.js (параллельно)...');
        const optional = (name, retries) => fetchRawText(name, retries).catch(e => {
            console.warn(`⚠️ ${name} не загружен (работаем без него):`, e && e.message);
            return null;
        });
        const [listText, code2Text, codeText, code3Raw, ozvText, nearRaw] = await Promise.all([
            fetchRawText('List.js'),
            fetchRawText('Code2.js'),
            fetchRawText('Code.js'),
            optional('Code3.js', 3),   // помощник лицензёра — необязательный
            optional('Ozv.js', 1),     // озвучка — необязательная; 404 не повторяется
            optional('Near.js', 2)     // игроки рядом (нужен APK с модом Near) — необязательный
        ]);

        // ── Проверка синтаксиса до замены копий ──
        let code3Text = code3Raw;
        for (const [name, text] of [['List.js', listText], ['Code.js', codeText], ['Code2.js', code2Text]]) {
            const err = syntaxError(text);
            if (err) throw new Error(`Синтаксическая ошибка в ${name}: ${err.message}`);
        }
        if (code3Text) {
            const err3 = syntaxError(code3Text);
            if (err3) {
                console.warn('⚠️ Code3.js с синтаксической ошибкой — пропущен:', err3.message);
                loaderNotify(`⚠️ <b>Code3.js</b> с синтаксической ошибкой — пропущен (бот работает без него)\n<code>${String(err3.message).replace(/</g, '&lt;')}</code>`);
                code3Text = null;
            }
        }

        let nearText = nearRaw;
        if (nearText) {
            const errN = syntaxError(nearText);
            if (errN) {
                console.warn('⚠️ Near.js с синтаксической ошибкой — пропущен:', errN.message);
                loaderNotify(`⚠️ <b>Near.js</b> с синтаксической ошибкой — пропущен (бот работает без него)\n<code>${String(errN.message).replace(/</g, '&lt;')}</code>`);
                nearText = null;
            }
        }

        // Хук на чат ставится один раз при старте Load.js. Если тогда он не встал (чат-компонент ещё не был создан,
        // игра обновилась) — бот не видит ни одного сообщения чата до перезапуска игры. При перезагрузке пробуем снова.
        if (!window.__hassleChatHooked) {
            console.log('🔁 Хук на чат не был установлен — пробуем ещё раз');
            try { setupChatHook(true); } catch (e) { console.warn('setupChatHook:', e && e.message); }
        }

        // ── ЭТАП 2: меняем копии (синхронно, без ожиданий) ──
        // FIX: снимаем старые хуки перед повторным eval скриптов
        hassleCleanupHooks();
        oldCopyReplaced = true;

        console.log('📋 Применение List.js...');
        evalLoadedScript('List.js', listText);

        console.log(`⚙️ Применение конфигурации для ${currentUser}...`);
        if (!applyUserConfig()) {
            throw new Error('Не удалось применить конфигурацию пользователя');
        }

        // Code2.js — текст нужен до запуска Code.js (Code.js eval'ит его в СВОЕЙ области видимости).
        // Code3.js (помощник лицензёра + вкладка «Лицензёр» в Telegram) подклеиваем к тексту Code2: Code3 видит
        // config/processUpdates и ставит всё через перехваты — Code.js и Code2.js остаются без изменений.
        window.__CODE2_TEXT__ = code2Text;
        if (code3Text) window.__CODE2_TEXT__ += '\n;\n' + code3Text;
        // Ozv.js (озвучка) — тоже подклеиваем к тексту Code2, чтобы он видел sendAdminSpamAlert из Code.js.
        // Вложенный eval в try: если Ozv.js сломан — Code2/Code3 это не ломает.
        if (ozvText) {
            window.__CODE2_TEXT__ += '\n;\ntry { eval(' + JSON.stringify(ozvText) + '); } catch (eOzv) { console.warn("[OZV] не запущен:", eOzv && eOzv.message); }\n';
        }

        // Near.js (игроки рядом: /near, /neartg, /neardist, /neardiag, window.NearPlayers) — подклеиваем последним, поверх Ozv:
        // ему нужен sendToTelegram из области видимости Code.js. Вложенный eval в try: сломанный Near.js остальное не ломает.
        if (nearText) {
            window.__CODE2_TEXT__ += '\n;\ntry { eval(' + JSON.stringify(nearText) + '); } catch (eNear) { console.warn("[NEAR] не запущен:", eNear && eNear.message); }\n';
        }

        // Флаг: Code.js не запускает бота сам — ждёт завершения eval Code2
        window.__WAIT_CODE2__ = true;

        console.log('📦 Выполнение Code.js (+ Code2 внутри)...');
        try {
            evalLoadedScript('Code.js', codeText);
        } catch (errCode) {
            // Code2/Code3 упали уже после того, как Code.js поставил __botInit — запускаем хотя бы базового бота,
            // чтобы Telegram-управление осталось и причина была видна
            if (typeof window.__botInit === 'function') {
                console.error('❌ Ошибка в Code.js/Code2.js — аварийный запуск базового бота:', errCode);
                loaderNotify(`⚠️ <b>Ошибка при выполнении скриптов</b> — запущен базовый режим\n<code>${String(errCode && errCode.message).replace(/</g, '&lt;')}</code>`);
            } else {
                throw errCode;
            }
        }

        // Бот запускается после того как Code.js eval'нул Code2 и установил __botInit
        console.log('🚀 Запускаем бота...');
        if (typeof window.__botInit === 'function') {
            window.__botInit();
            window.__botInit = null;
        } else {
            console.warn('⚠️ __botInit не найден — бот уже запущен или Code.js не установил флаг');
        }

        // Раньше после /reload в Telegram была только строка «Перезагрузка...», и не было понятно, дошло ли дело до конца
        window.__hassleLoadCount = (window.__hassleLoadCount || 0) + 1;
        if (isReload) {
            const sec = ((Date.now() - t0) / 1000).toFixed(1);
            loaderNotify(`✅ <b>Скрипты перезагружены</b> — аккаунт #${accountNumber || '?'} (${currentUser || '—'}), ${sec} с`);
        }

        // Инфо о коммитах грузим в фоне — не блокируем старт бота
        Promise.all([
            fetchLastCommitInfo('Code.js'),
            fetchLastCommitInfo('Code2.js'),
        ]).then(([codeInfo, code2Info]) => {
            window.CODE_COMMIT_INFO  = codeInfo  || null;
            window.CODE2_COMMIT_INFO = code2Info || null;
            console.log('📝 Инфо о коммитах загружено — обновляем велком и меню');
            // Версия Code/Code2 в меню Menu (блок с ником и сервером)
            if (typeof window.updateMenuVersionLabel === 'function') {
                try { window.updateMenuVersionLabel(); } catch (e) {}
            }
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
        const safe = String(error && error.message).replace(/</g, '&lt;');
        if (isReload && !oldCopyReplaced) {
            // Перезагрузка не удалась ДО замены копий — прежняя копия продолжает работать
            loaderNotify(`❌ <b>Перезагрузка не удалась</b> — аккаунт #${accountNumber || '?'} (${currentUser || '—'}) продолжает работать на прежней версии\n<code>${safe}</code>`);
        } else {
            loaderNotify(`❌ <b>Критическая ошибка загрузки</b> — аккаунт #${accountNumber || '?'} (${currentUser || '—'})\n<code>${safe}</code>`);
            // alert блокирует игру, поэтому только если бота нет совсем (первый запуск)
            if (!isReload) alert(`Ошибка загрузки скриптов для ${currentUser}: ${error.message}`);
        }
    } finally {
        window.__hassleInitRunning = false;
    }
}

// ============================================================
// ОПРЕДЕЛЕНИЕ КЛИЕНТА. Наш клиент (APK с загрузчиком konstt) отдаёт константу «KONSTT-CLIENT <сборка>» по GET /konstt на
// 127.0.0.1:17771..17780. Обычный клиент или чужой там ничего не слушает. Нет константы — это только записывается в консоль и приходит в Telegram, функционал НЕ отключается. Сервер мода стартует, когда игра уже готова, поэтому проверяем
// повторно раз в 3 с, пока не найдём (или пока не пройдёт 90 с — тогда считаем клиент не нашим).
//
// Результат (читать можно из любого скрипта: Code / Code2 / Code3 / Near):
//   window.KONSTT_CLIENT = { ours: null|true|false, port, checked, ms }
//     ours === null  — ещё проверяем;  true — наш клиент;  false — обычный/чужой клиент
//   window.konsttWhenChecked() — Promise, который завершается, когда ours стал true/false
//   window.konsttDetectClient() — запустить проверку заново
// ============================================================
window.KONSTT_CLIENT = window.KONSTT_CLIENT || { ours: null, port: 0, build: '', checked: false, ms: 0 };
// Константа, которую отдаёт клиент: GET /konstt -> «KONSTT-CLIENT <сборка>».
// Переходный режим: сборки мода, где /konstt ещё нет, отвечают на /ping строкой «hassle-near» — пока включён KONSTT_ALLOW_LEGACY_PING, это тоже «наш».
// Когда у всех обновится бандл мода (в konstt.log есть строка core_ctor с новой сборкой) — поставить false.
const KONSTT_ALLOW_LEGACY_PING = true;
function konsttGet(port, path) {
    return new Promise(resolve => {
        let done = false;
        const fin = v => { if (!done) { done = true; resolve(v); } };
        try {
            const x = new XMLHttpRequest();
            x.open('GET', 'http://127.0.0.1:' + port + path + '?t=' + Date.now(), true);
            x.timeout = 1500;
            x.onload = () => fin(x.status === 200 ? String(x.responseText || '').trim() : null);
            x.onerror = () => fin(null);
            x.ontimeout = () => fin(null);
            x.send();
        } catch (e) { fin(null); }
    });
}
async function konsttProbePort(port) {
    const id = await konsttGet(port, '/konstt');
    if (id && id.indexOf('KONSTT-CLIENT') === 0) return { build: id.slice(13).trim() || '?' };
    if (KONSTT_ALLOW_LEGACY_PING && (await konsttGet(port, '/ping')) === 'hassle-near') return { build: 'legacy' };
    return null;
}
function konsttDetectClient() {
    const st = window.KONSTT_CLIENT;
    if (st.__running) return window.konsttWhenChecked();
    st.__running = true;
    st.ours = null; st.port = 0; st.build = ''; st.checked = false;
    const t0 = Date.now();
    const GIVE_UP_MS = 90000, EVERY_MS = 3000;
    window.__konsttWait = new Promise(resolve => {
        const attempt = async () => {
            let found = 0, info = null;
            for (let p = 17771; p <= 17780 && !found; p++) {
                info = await konsttProbePort(p);
                if (info) found = p;
            }
            if (found) {
                st.ours = true; st.port = found; st.build = info.build;
            } else if (Date.now() - t0 >= GIVE_UP_MS) {
                st.ours = false;
            } else {
                setTimeout(attempt, EVERY_MS);
                return;
            }
            st.checked = true; st.ms = Date.now() - t0; st.__running = false;
            console.log(st.ours ? `🧩 Клиент: НАШ (сборка ${st.build}, порт ${st.port}, ${st.ms} мс)` : `🧩 Клиент: обычный/чужой (мод не найден за ${st.ms} мс)`);
            if (!st.ours && !window.__konsttWarned) {
                window.__konsttWarned = true;
                console.warn('⚠️ Клиент не наш: константа KONSTT-CLIENT не получена — функционал, завязанный на наш клиент, работать не будет');
                if (typeof loaderNotify === 'function') {
                    loaderNotify(`⚠️ <b>Клиент не наш</b> — аккаунт #${accountNumber || '?'} (${currentUser || '—'}): константа KONSTT-CLIENT не получена за ${Math.round(st.ms / 1000)} с`);
                }
            }
            resolve(st);
        };
        attempt();
    });
    return window.__konsttWait;
}
window.konsttDetectClient = konsttDetectClient;
window.konsttWhenChecked = function () { return window.__konsttWait || konsttDetectClient(); };
konsttDetectClient();

window.CURRENT_USER = currentUser;
window.ACCOUNT_NUMBER = accountNumber;
window.initializeScripts = initializeScripts;

initializeScripts();
