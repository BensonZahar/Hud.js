// ПРОВЕРКА НИКА — добавляй/убирай ники здесь.
const NICK_CHECK_ENABLED = true; // ← поменяй на false чтобы выключить проверку

const _ALLOWED_NICKS = [
    "Zahar_Konst",
    "Fura_Morales",
    "Egor_Hlebov"
];

(function _nickCheck(callback) {
    if (!NICK_CHECK_ENABLED) { callback(); return; }

    function getNick() {
        try {
            var n = window.App && window.App.$store &&
                    window.App.$store.getters &&
                    window.App.$store.getters['player/nickName'];
            if (n && n !== "Name_Surname") return n;
            return null;
        } catch (e) { return null; }
    }

    var nick = getNick();
    if (nick) {
        if (_ALLOWED_NICKS.indexOf(nick) !== -1) callback();
        return;
    }

    // Стор ещё не готов — ждём до 30 секунд
    var attempts = 0;
    var timer = setInterval(function() {
        attempts++;
        var n = getNick();
        if (n) {
            clearInterval(timer);
            if (_ALLOWED_NICKS.indexOf(n) !== -1) callback();
        } else if (attempts >= 60) {
            clearInterval(timer);
        }
    }, 500);
})(function() {
// ── КОНЕЦ ПРОВЕРКИ НИКА — всё ниже выполняется только если ник прошёл проверку ──

// Hud.js by Deni_Pels (tg:denipels)

// ================================================================
// JSK — фракционная история
//
// Хронология (от старого к новому):
//   МВД Рядовой [№1]        принят:  2026-04-20 14:31:33
//   МВД Сержант [№2]                 2026-04-22 16:45:12  (+2 дня)
//   МВД Старшина [№3]                2026-04-25 18:20:44  (+3 дня)
//   МВД Прапорщик [№4]               2026-04-29 15:10:33  (+4 дня)
//   МВД Лейтенант [№5]               2026-05-03 17:35:21  (+4 дня)
//   МВД Капитан [№6]                 2026-05-07 14:55:08  (+4 дня)
//   МВД Майор [№7]                   2026-05-12 16:30:47  (+5 дней)
//   МВД Подполковник [№8]            2026-05-16 11:05:32  (+4 дня)
//   МВД уволился:                    2026-07-14 13:22:47  ← 27 дней назад (10.08.2026)
// ================================================================
const jskOptions = [
    { name: "{nick} покинул организацию Мин. внутренних дел по собственному желанию<t>2026-07-14 13:22:47<n>", action: "jsk_view" },
    { name: "Ronnie_Coleman изменил должность {nick} на Подполковник [№8] в Мин. внутренних дел<t>2026-05-16 11:05:32<n>", action: "jsk_view" },
    { name: "Maksim_Forestry изменил должность {nick} на Майор [№7] в Мин. внутренних дел<t>2026-05-12 16:30:47<n>", action: "jsk_view" },
    { name: "Daria_Zubenko изменил должность {nick} на Капитан [№6] в Мин. внутренних дел<t>2026-05-07 14:55:08<n>", action: "jsk_view" },
    { name: "Ronnie_Coleman изменил должность {nick} на Лейтенант [№5] в Мин. внутренних дел<t>2026-05-03 17:35:21<n>", action: "jsk_view" },
    { name: "Maksim_Forestry изменил должность {nick} на Прапорщик [№4] в Мин. внутренних дел<t>2026-04-29 15:10:33<n>", action: "jsk_view" },
    { name: "Daria_Zubenko изменил должность {nick} на Старшина [№3] в Мин. внутренних дел<t>2026-04-25 18:20:44<n>", action: "jsk_view" },
    { name: "Ronnie_Coleman изменил должность {nick} на Сержант [№2] в Мин. внутренних дел<t>2026-04-22 16:45:12<n>", action: "jsk_view" },
    { name: "Maksim_Forestry принял {nick} в Мин. внутренних дел на должность Рядовой [№1]<t>2026-04-20 14:31:33<n>", action: "jsk_view" }
];

// ================================================================
// ТРУДОВАЯ v1 — пустая
// ================================================================
const FAKE_WB = {
    personalNumber: 1042290,
    issueDate:      0,
    jobs:           []
};

window.showFakeWorkBook = (playerId) => {
    const EMPLOYMENT_HISTORY = 15;
    const autoNick = window.App?.$store?.getters["player/nickName"] || 'Name_Surname';
    const autoSkin = window.App?.$store?.getters["player/skinId"]  || 206;
    const data = [
        [autoNick, FAKE_WB.personalNumber, autoSkin, FAKE_WB.issueDate],
        FAKE_WB.jobs.map(j => [
            j.title, autoNick, j.post, j.status,
            j.fireStatus, j.inviteDate, j.fireDate,
            j.experience, j.reason, autoNick
        ])
    ];
    try {
        window.openInterface('Docs', JSON.stringify([[EMPLOYMENT_HISTORY, JSON.stringify(data)]]));
        setTimeout(() => {
            const nick = window.App?.$store?.getters["player/nickName"] || autoNick;
            const fakeMsg = `{v:${nick}}${playerId ? `[${playerId}]` : ''} просматривает свою трудовую книгу`;
            if (typeof window.onChatMessage === 'function') window.onChatMessage(fakeMsg, 'FFDD90FF');
        }, 300);
    } catch (e) { console.error('[WBoo] Ошибка:', e); }
};

// ================================================================
// ТРУДОВАЯ v2 — МВД (Подполковник, 2 мес.)
//
// Расчёт дат (Unix UTC):
//   Впервые выдана:              2026-03-11 12:00:00  →  1773230400
//   МВД принят (Рядовой):        2026-04-20 14:31:33  →  1776695493
//   МВД уволился:                2026-07-14 13:22:47  →  1784035367  (27 дн. назад от 10.08.2026)
//   Стаж в МВД:                  2 мес.
//   status 1 = уволен | fireStatus 0 = серый квадрат даты
// ================================================================
const FAKE_WB2 = {
    personalNumber: 1042290,
    issueDate:      1773230400,   // 2026-03-11 12:00:00 — дата выдачи трудовой книги
    jobs: [
        {
            title:      "Мин. внутренних дел",
            post:       "Подполковник",
            status:     1,
            fireStatus: 0,
            inviteDate: 1776695493,   // 2026-04-20 14:31:33 — принят в МВД
            fireDate:   1784035367,   // 2026-07-14 13:22:47 — уволился (27 дн. назад)
            experience: "2 мес.",
            reason:     "Не указана"
        }
    ]
};

window.showFakeWorkBook2 = (playerId) => {
    const EMPLOYMENT_HISTORY = 15;
    const autoNick = window.App?.$store?.getters["player/nickName"] || 'Name_Surname';
    const autoSkin = window.App?.$store?.getters["player/skinId"]  || 206;
    const data = [
        [autoNick, FAKE_WB2.personalNumber, autoSkin, FAKE_WB2.issueDate],
        FAKE_WB2.jobs.map(j => [
            j.title, autoNick, j.post, j.status,
            j.fireStatus, j.inviteDate, j.fireDate,
            j.experience, j.reason, autoNick
        ])
    ];
    try {
        window.openInterface('Docs', JSON.stringify([[EMPLOYMENT_HISTORY, JSON.stringify(data)]]));
        setTimeout(() => {
            const nick = window.App?.$store?.getters["player/nickName"] || autoNick;
            //const fakeMsg = `{v:${nick}}${playerId ? `[${playerId}]` : ''} просматривает свою трудовую книгу`;
            if (typeof window.onChatMessage === 'function') window.onChatMessage(fakeMsg, 'FFDD90FF');
        }, 300);
    } catch (e) { console.error('[WBoo2] Ошибка:', e); }
};

// ================================================================
// ALIS — фейк список наказаний
// ================================================================
const alisOptions = [];

window.showAlisMenu = (playerId) => {
    giveLicenseTo = playerId;
    const title = `{FFCD00}Последние 10 наказаний за 2 месяца`;
    const header = `Тип наказания<t><t>Дата наказания<t>Ник администратора<t>Причина<n><n>`;
    const body = alisOptions.length === 0
        ? `{FFFFFF}Список наказаний пуст`
        : alisOptions.map(item => `{FFFFFF}${item.type}<t><t>${item.date}<t>${item.admin}<t>${item.reason}<n>`).join('');
    // Используем window.addDialogInQueue напрямую — к этому моменту _expectCmd уже null,
    // поэтому рекурсии нет
    window.addDialogInQueue(`[670,0,"${title}","","Закрыть","",0,0]`, header + body, 0);
};

// ================================================================
// ================================================================
// ПЕРЕКЛЮЧАТЕЛЬ — Alt+9 (по умолчанию ВЫКЛЮЧЕН)
// ================================================================
// ================================================================
let jskEnabled = false;

// Флаги ожидания серверного ответа
let _expectCmd   = null;  // 'wbook' | 'team' | 'alist'
let _expectId    = -1;
let _expectTimer = null;

function _clearExpect() {
    _expectCmd = null;
    _expectId  = -1;
    if (_expectTimer) { clearTimeout(_expectTimer); _expectTimer = null; }
}

function _setExpect(cmd, id) {
    _clearExpect();
    _expectCmd  = cmd;
    _expectId   = id;
    // Автосброс через 5 сек, если сервер не ответил
    _expectTimer = setTimeout(_clearExpect, 5000);
}

// Уведомление в чате о состоянии переключателя
function _notifyToggle() {
    if (typeof window.onChatMessage !== 'function') return;
    if (jskEnabled) {
        window.onChatMessage('{999999}FKONST — {33DD77}Включён', '999999FF');
    } else {
        window.onChatMessage('{999999}FKONST — {EE4444}Выключён', '999999FF');
    }

    // Автоудаление уведомления через 3 секунды
    setTimeout(() => {
        try {
            const hud = window.interface('Hud');
            if (!hud || !hud.$refs || !hud.$refs.chat) return;
            const chat = hud.$refs.chat;
            if (!Array.isArray(chat.messages)) return;
            chat.messages = chat.messages.filter(m => {
                if (!m.content) return true;
                return !m.content.some(c => c.text && c.text.includes('FKONST'));
            });
        } catch (_) { /* тихо */ }
    }, 3000);
}

// Слушатель Alt+9 (без зависимости от engine — вешаем сразу)
document.addEventListener('keydown', (e) => {
    if (e.altKey && (e.code === 'Digit9' || e.key === '9')) {
        jskEnabled = !jskEnabled;
        _notifyToggle();
        console.log(`[JSK] jskEnabled = ${jskEnabled}`);
    }
});

// ================================================================

let giveLicenseTo = -1;

const init = () => {

    // ============================================================
    // ПЕРЕХВАТ window.openInterface
    // Цель: /wbook (сервер открывает трудовую, тип 15) → /wboo2
    // ============================================================
    const _origOpenInterface = window.openInterface;

    window.openInterface = function(name, data, ...rest) {
        if (jskEnabled && name === 'Docs' && _expectCmd === 'wbook') {
            try {
                const parsed = JSON.parse(data);
                // Трудовая книга = первый элемент массива с type === 15 (EMPLOYMENT_HISTORY)
                if (Array.isArray(parsed) && Array.isArray(parsed[0]) && parsed[0][0] === 15) {
                    const id = (_expectCmd === 'wbook') ? _expectId : -1;
                    _clearExpect();
                    console.log('[JSK] Перехват /wbook → showFakeWorkBook2', id);
                    window.showFakeWorkBook2(id);
                    return; // блокируем оригинальный вызов
                }
            } catch (_) { /* не валидный JSON — пропускаем */ }
        }
        // Всё остальное — оригинал
        return _origOpenInterface && _origOpenInterface.call(this, name, data, ...rest);
    };

    // ============================================================
    // ПЕРЕХВАТ window.addDialogInQueue
    // Цель: /team_history → /team_histor | /alist → /alis
    //
    // ВАЖНО: сохраняем ссылку на оригинал ДО замены, чтобы
    // избежать рекурсии при вызове из showAlisMenu и наших
    // фейк-обработчиков.
    // ============================================================
    const _origAddDialog = window.addDialogInQueue;

    window.addDialogInQueue = function(dialogData, body, type) {
        if (jskEnabled && _expectCmd) {
            const cmd = _expectCmd;
            const id  = _expectId;
            _clearExpect(); // сбрасываем ДО любых дальнейших вызовов

            if (cmd === 'team') {
                console.log('[JSK] Перехват /team_history → фейк фракционная история');
                const autoNick = window.App?.$store?.getters["player/nickName"] || 'Name_Surname';
                let list = '';
                jskOptions.forEach(item =>
                    list += item.name.replace(/\{nick\}/g, autoNick) + '<n>');
                // Вызываем ОРИГИНАЛ напрямую, минуя наш перехват
                _origAddDialog && _origAddDialog.call(window,
                    `[670,2,"Фракционная история","","Далее","Отмена",0,1]`,
                    list,
                    0
                );
                return;
            }

            if (cmd === 'alist') {
                console.log('[JSK] Перехват /alist → фейк список наказаний');
                // showAlisMenu вызовет window.addDialogInQueue,
                // но к этому моменту _expectCmd уже null → рекурсии нет
                showAlisMenu(id);
                return;
            }
        }
        // Всё остальное (включая вызовы из наших /team_histor, /alis, showAlisMenu)
        return _origAddDialog && _origAddDialog.call(this, dialogData, body, type);
    };

    // ============================================================
    // sendChatInput — обработка команд
    // ============================================================
    window.sendChatInputCustom = e => {
        const args = e.split(" ");

        // ---------- Наши собственные команды (всегда работают) ----------

        if (args[0] === "/team_histor") {
            giveLicenseTo = args[1];
            const autoNick = window.App?.$store?.getters["player/nickName"] || 'Name_Surname';
            let list = '';
            jskOptions.forEach(item => list += item.name.replace(/\{nick\}/g, autoNick) + '<n>');
            window.addDialogInQueue(`[670,2,"Фракционная история","","Далее","Отмена",0,1]`, list, 0);

        } else if (args[0] === "/alis") {
            showAlisMenu(args[1]);

        } else if (args[0] === "/wboo") {
            showFakeWorkBook(args[1]);

        } else if (args[0] === "/wboo2") {
            showFakeWorkBook2(args[1]);

        // ---------- Перехват серверных команд (только когда включён) ----------

        } else if (jskEnabled && args[0] === "/wbook") {
            // Ставим флаг и отправляем на сервер.
            // Ответ (openInterface 'Docs' тип 15) поймаем выше.
            _setExpect('wbook', args[1]);
            window.App.developmentMode || engine.trigger("SendChatInput", e);

        } else if (jskEnabled && (args[0] === "/team_history" || args[0] === "/teamhistory")) {
            // Ставим флаг и отправляем на сервер.
            // Ответ (addDialogInQueue) поймаем выше.
            _setExpect('team', args[1]);
            window.App.developmentMode || engine.trigger("SendChatInput", e);

        } else if (jskEnabled && args[0] === "/alist") {
            // Ставим флаг и отправляем на сервер.
            // Ответ (addDialogInQueue) поймаем выше.
            _setExpect('alist', args[1]);
            window.App.developmentMode || engine.trigger("SendChatInput", e);

        // ---------- Всё остальное — на сервер ----------

        } else {
            window.App.developmentMode || engine.trigger("SendChatInput", e);
        }
    };

    // ============================================================
    // sendClientEvent — обработка ответов на диалог 670
    // ============================================================
    window.sendClientEventCustom = (event, ...args) => {
        if (args[0] === "OnDialogResponse" && args[1] === 670) {
            if (args[2] === 1) {
                // Нажата кнопка "Далее" (button1) в нашем диалоге фракционной истории
                const idx = args[3] - 1;
                if (idx >= 0 && idx < jskOptions.length) {
                    sendMessagesWithDelay([
                        "/me открыл служебный КПК",
                        "/do На экране отображается фракционная история.",
                        "/me изучает информацию на экране"
                    ], [0, 700, 700]);
                }
            }
            // Диалог 670 — наш, серверу не отправляем
            return;
        }
        window.sendClientEventHandle?.(event, ...args);
    };

    window.sendChatInput   = window.sendChatInputCustom;
    window.sendClientEvent = window.sendClientEventCustom;

    console.log("════════════════════════════════════════════════");
    console.log("[JSK]   Alt+9            — включить/выключить перехват");
    console.log("[JSK]   /team_histor     — фракционная история (напрямую)");
    console.log("[JSK]   /wbook  [id]     — трудовая МВД (при вкл. перехватит сервер)");
    console.log("[JSK]   /team_history    — история фракции (при вкл. перехватит сервер)");
    console.log("[JSK]   /alist  [id]     — наказания (при вкл. перехватит сервер)");
    console.log("[ALIS]  /alis   [id]     — фейк наказания (напрямую)");
    console.log("[WBoo]  /wboo   [id]     — пустая трудовая (напрямую)");
    console.log("[WBoo2] /wboo2  [id]     — трудовая МВД (напрямую)");
    console.log("════════════════════════════════════════════════");
};

function sendMessagesWithDelay(messages, delays, index = 0) {
    if (index >= messages.length) return;
    setTimeout(() => {
        sendChatInput(messages[index]);
        sendMessagesWithDelay(messages, delays, index + 1);
    }, delays[index]);
}

if (window.engine) {
    init();
} else {
    const check = setInterval(() => {
        if (window.engine) { clearInterval(check); init(); }
    }, 100);
}

// ================================================================
// ЛОГГЕР — перехватываем onChatMessage, пишем цвет в консоль
// Открой оригинальный /wbook — в консоли появится точный цвет
// ================================================================
const _origOnChatMsg = window.onChatMessage;
window.onChatMessage = function(text, color) {
    if (/трудовую книгу/i.test(String(text))) {
        console.log(`[WBOOK COLOR] raw color="${color}" | text="${text}"`);
    }

    // ── Замена уровня стиля одежды (перенесено из mvdF.js) ──────────────────
    // Серверное сообщение вида: "...прокачали новый () стиль одежды {FFFFFF}29{75A3D2} из {FFFFFF}600..."
    if (typeof text === 'string' && text.includes('стиль одежды')) {
        try {
            const _before = text;
            if (window._mvdClothingStyleLevel !== null && window._mvdClothingStyleLevel !== undefined) {
                const _lvl = window._mvdClothingStyleLevel;
                text = text.replace(
                    /(\{FFFFFF\})\d+(\{75A3D2\} из \{FFFFFF\}600)/g,
                    '$1' + _lvl + '$2'
                );
                if (text !== _before) {
                    window._mvdClothingStyleLevel = _lvl + 1;
                    console.log('[STYLE] Уровень стиля: ' + _lvl + ' / 600 → следующий: ' + window._mvdClothingStyleLevel);
                }
            }
        } catch (_e) {
            console.warn('[STYLE-FIX] Ошибка замены стиля:', _e);
        }
    }
    // ────────────────────────────────────────────────────────────────────────

    if (typeof _origOnChatMsg === 'function') _origOnChatMsg.call(this, text, color);
};


// ================================================================
// /are [1-6] — визуальный тест системы арестов (перенесено из mvdF.js)
// /are_s <0-600> — вручную выставить уровень стиля одежды
// Замена числа в серверном сообщении работает через onChatMessage выше
// ================================================================
(function() {
    // Локальный snAdd — работает без ZkmScreenNotification из mvdF
    function snAdd(payload) {
        try {
            const sn = window.ZkmScreenNotification;
            if (sn && typeof sn.add === 'function') sn.add(payload);
        } catch(e) {}
    }

    const originalSendChatInput = window.sendChatInput;

    // Уровень стиля одежды: глобальный (window._mvdClothingStyleLevel), живёт пока не перезагрузится страница.
    // /are_s <число> — установить уровень для СЛЕДУЮЩЕГО ареста.
    // При первом /are без /are_s — случайное небольшое число (1-20).
    // Сокращение к глобальной переменной для удобства:
    if (window._mvdClothingStyleLevel === undefined) window._mvdClothingStyleLevel = null;

    // Последний полученный от движка список игроков онлайн: {count, local:{id,name,ping}, players:[{id,name,ping},...]}
    let latestPlayerList = null;

    // Перехватываем колбэк движка со списком игроков, чтобы брать реальный свой ID и реальные ники
    const originalOnUpdatePlayersList = window.onUpdatePlayersList;
    window.onUpdatePlayersList = function(e) {
        latestPlayerList = e;
        window._mvdPlayerList = e; // пробрасываем наружу для getNickByIdFromList / getIdByNickFromList
        if (originalOnUpdatePlayersList) {
            originalOnUpdatePlayersList.apply(this, arguments);
        }
    };

    // Просим движок прислать свежий список (ответ придёт асинхронно в onUpdatePlayersList выше)
    function requestPlayerListUpdate() {
        try {
            window.updatePlayerList && window.updatePlayerList();
        } catch (e) {}
    }

    // Достаём ведущий цвет сообщения (первый {HEX}-тег в начале текста),
    // чтобы таймстамп красился в тот же цвет, что и сама строка (как у реальных сообщений)
    function getLeadingColor(text) {
        const match = text.match(/^\{([0-9A-Fa-f]{6})\}/);
        return match ? match[1] : 'FFFFFF';
    }

    // Функция для генерации случайного времени (0.5-3 секунды) - оставлена для фолбэков
    function getRandomDelay() {
        return Math.floor(Math.random() * 2500) + 500;
    }

// Фолбэк-список преступников на случай, если реальный список игроков ещё не пришёл
    function getRandomCriminal() {
        const criminals = [
            'Dima_Bogrovin',
            'Kayto_Kirishima',
            'Sergey_Petrov',
            'Alex_Smirnov',
            'Ivan_Ivanov',
            'Mihail_Sokolov'
        ];
        return criminals[Math.floor(Math.random() * criminals.length)];
    }

    // Фолбэк-список сотрудников на случай, если свой ник получить не удалось
    function getRandomOfficer() {
        const officers = [
            'Zahar_Konstov',
            'Maxim_Vortex',
            'Ivan_Rorger',
            'Van_Rorger'
        ];
        return officers[Math.floor(Math.random() * officers.length)];
    }

    // Ник текущего аккаунта из стора
    function getOwnNick() {
        try {
            return window.App && window.App.$store && window.App.$store.getters && window.App.$store.getters['player/nickName'];
        } catch (e) {
            return null;
        }
    }

    // Актуальный ID текущего игрока (из последнего списка игроков, присланного движком)
    function getOwnId() {
        try {
            return latestPlayerList && latestPlayerList.local ? latestPlayerList.local.id : null;
        } catch (e) {
            return null;
        }
    }

    // ── ФРАКЦИОННЫЙ ФИЛЬТР ──────────────────────────────────────────────────
    // Цвета ников фракций (6-символьный RGB, lowercase).
    // PAWN формат 0xRRGGBBAA → берём только RRGGBB (сдвиг на 8 бит).
    const FACTION_COLORS = new Set([
        'ccff00', // Правительство
        '996633', // Воинская часть
        'ff6666', // Больница
        'ff6600', // ГТРК «Ритм»
        '170000', // ФСБ
        '0000ff', // МВД (Отдел полиции №2)
        '000000', // ФСИН
    ]);

    /**
     * Конвертирует цвет игрока в нижнеcased 6-char RGB hex.
     * Поддерживает: number (PAWN RGBA int), string "RRGGBBAA", string "RRGGBB", string "#RRGGBB".
     */
    function playerColorToHex6(color) {
        if (color === null || color === undefined) return null;
        if (typeof color === 'number') {
            // PAWN RGBA: 0xRRGGBBAA — сдвигаем вправо на 8, берём 24 бита RGB
            const rgb = (color >>> 8) & 0xFFFFFF;
            return rgb.toString(16).padStart(6, '0');
        }
        if (typeof color === 'string') {
            const c = color.replace(/^#/, '').toLowerCase();
            if (c.length === 8) return c.slice(0, 6); // RRGGBBAA → RRGGBB
            if (c.length === 6) return c;
        }
        return null;
    }

    /**
     * Возвращает true если игрок — участник фракции (по цвету ника).
     * Если поле color отсутствует — считаем обычным игроком (безопасный fallback).
     */
    function isFactionPlayer(player) {
        if (!player) return false;
        const hex = playerColorToHex6(player.color);
        if (hex === null) return false; // нет данных о цвете → не фильтруем
        const isFaction = FACTION_COLORS.has(hex);
        if (isFaction) {
            console.log(`[ARE] 🚫 Пропускаем фракционного игрока: ${player.name} (цвет: #${hex})`);
        }
        return isFaction;
    }
    // ── КОНЕЦ ФРАКЦИОННОГО ФИЛЬТРА ──────────────────────────────────────────

    // Случайный реальный игрок с сервера (не сам игрок), для роли "преступника"
    function getRandomRealPlayer() {
        if (!latestPlayerList || !Array.isArray(latestPlayerList.players) || latestPlayerList.players.length === 0) {
            return null;
        }
        const myId = getOwnId();

        // Исключаем: себя + фракционных игроков (по цвету ника) + NPC с ником Mask_
        const civils = latestPlayerList.players.filter(p =>
            p.id !== myId &&
            !isFactionPlayer(p) &&
            !(p.name && p.name.startsWith('Mask_'))
        );

        if (civils.length > 0) {
            console.log(`[ARE] ✅ Пул гражданских: ${civils.length} чел. (из ${latestPlayerList.players.length} онлайн)`);
            return civils[Math.floor(Math.random() * civils.length)];
        }

        // Fallback: нет цветовых данных или все оказались фракционными — берём кого угодно кроме себя и Mask_
        const others = latestPlayerList.players.filter(p =>
            p.id !== myId &&
            !(p.name && p.name.startsWith('Mask_'))
        );
        const pool = others.length ? others : latestPlayerList.players;
        console.log(`[ARE] ⚠️ Фракционный фильтр не сработал (нет color-данных?), берём случайного из ${pool.length}`);
        return pool[Math.floor(Math.random() * pool.length)];
    }

    window.sendChatInput = function(text) {
        // /are_s <число> — вручную выставить уровень стиля одежды
        if (text && text.startsWith('/are_s')) {
            const parts = text.split(' ');
            const num = parts.length > 1 ? parseInt(parts[1], 10) : NaN;

            if (isNaN(num) || num < 0 || num > 600) {
                console.log('[TEST] ⚠️ Используй: /are_s <число от 0 до 600>');
                return;
            }

            window._mvdClothingStyleLevel = num;
            snAdd(`[1, "Стиль одежды", "Уровень выставлен: ${num} / 600. Следующий арест покажет ${num}", "00FF00", 2500]`);
            console.log(`[TEST] 👕 Уровень стиля одежды выставлен: ${num} / 600 (следующий арест → ${num})`);
            return;
        }

        if (text && text.startsWith('/are')) {
            // На всякий случай обновляем список игроков перед стартом (данные придут к следующему вызову)
            requestPlayerListUpdate();

            const parts = text.split(' ');
            let stars = 1;

            if (parts.length > 1) {
                const num = parseInt(parts[1]);
                if (!isNaN(num) && num >= 1 && num <= 6) {
                    stars = num;
                }
            }

            // Настройки в зависимости от количества звезд
            const settings = {
                1: { minutes: 20, bonus: 10000, exp: 5 },
                2: { minutes: 40, bonus: 20000, exp: 10 },
                3: { minutes: 60, bonus: 30000, exp: 15 },
                4: { minutes: 80, bonus: 40000, exp: 20 },
                5: { minutes: 100, bonus: 50000, exp: 25 },
                6: { minutes: 120, bonus: 60000, exp: 30 }
            };

            const config = settings[stars];

            // Преступник: реальный игрок с сервера, если список уже пришёл, иначе - фолбэк
            const realCriminal = getRandomRealPlayer();
            const criminal = realCriminal ? realCriminal.name : getRandomCriminal();

            // Офицер (мы сами): реальный ник + реальный ID, если доступны, иначе - фолбэк
            const officer = getOwnNick() || getRandomOfficer();
            const officerId = getOwnId();
            const officerIdDisplay = (officerId !== null && officerId !== undefined) ? officerId : 529;

            // Прокачка стиля одежды: первый раз без /are_s — случайное небольшое число (1-20)
            // После /are_s <N>: первый арест → N, второй → N+1, и т.д.
            if (window._mvdClothingStyleLevel === null || window._mvdClothingStyleLevel === undefined) {
                window._mvdClothingStyleLevel = Math.floor(Math.random() * 20) + 1; // 1-20
            }
            const newLevel = window._mvdClothingStyleLevel;     // показываем текущее значение
            window._mvdClothingStyleLevel = newLevel + 1;       // следующий арест → +1
            const previousLevel = newLevel - 1;
            const maxLevel = 600;

            console.log(`[TEST] ⭐ ${stars} звезд | ⏱ ${config.minutes} мин | 💰 ${config.bonus} руб | ✨ +${config.exp} опыта`);
            console.log(`[TEST] 👮 ${officer}[${officerIdDisplay}] задерживает ${criminal}${realCriminal ? ` (реальный игрок, ID ${realCriminal.id})` : ' (фолбэк-имя, список игроков ещё не получен)'}`);

            // Сообщения: арест + прокачка + премия (без семьи)
            const destination = stars >= 4 ? 'тюрьму' : 'полицейский участок';
            const messages = [
                {
                    delay: 500,
                    text: `{DD90FF}{v:${officer}}[${officerIdDisplay}] передаёт преступника ${criminal} в ${destination}`
                },
                {
                    delay: getRandomDelay(),
                    text: `{75A3D2}Вы успешно {FFFFFF}провели задержание{75A3D2} и прокачали новый () стиль одежды {FFFFFF}${newLevel}{75A3D2} из {FFFFFF}${maxLevel}{75A3D2}.`
                },
                // { delay: getRandomDelay(), text: `{FF7100}<...:KIRIESHKI:...> Вашей семье добавлено ${config.exp} очков опыта.
                {
                    delay: getRandomDelay(),
                    text: `{FFFFFF}${criminal} был доставлен в тюрьму для отбывания наказания`
                },
                {
                    delay: getRandomDelay(),
                    text: `{66CC00}Время заключения: ${config.minutes}:00`
                },
                {
                    delay: getRandomDelay(),
                    text: `{FFDF87}Вы получили премию к зарплате в размере {FFFFFF}${config.bonus} руб {FFDF87}за {FFFFFF}'Задержание преступника'`
                }
            ];

            let totalDelay = 0;

            messages.forEach((msg, index) => {
                totalDelay += msg.delay;

                setTimeout(() => {
                    window.onChatMessage(msg.text, [0, 0, getLeadingColor(msg.text)]);

                    // Очищаем текст от цветовых кодов для лога
                    const cleanText = msg.text
                        .replace(/\{[0-9A-Fa-f]{6}\}/g, '')
                        .replace(/\{v:[^}]+\}/g, '')
                        .trim();
                    console.log(`[${index + 1}] ${cleanText}`);
                }, totalDelay);
            });

            // Итоговое сообщение
            setTimeout(() => {
                console.log(`[TEST] ✅ Готово! (визуальный тест, реальных изменений в игре не произошло)`);
                console.log(`[TEST] ⭐${stars} | ⏱${config.minutes} мин | 💰${config.bonus} руб | ✨+${config.exp} опыта`);
                console.log(`[TEST] 👕 Прокачка: ${previousLevel} → ${newLevel} / ${maxLevel}`);
            }, totalDelay + 500);

            return;
        }

        if (originalSendChatInput) {
            originalSendChatInput.apply(this, arguments);
        }
    };

    // Запрашиваем список игроков сразу при загрузке скрипта, чтобы ID/ники были доступны как можно раньше
    requestPlayerListUpdate();

    console.log('[TEST] ✅ /are загружен в fkonst.js (визуальный тест арестов)');
    console.log('[TEST] 📋 /are [1-6] - симуляция ареста с прокачкой');
    console.log('[TEST] 📋 /are_s <0-600> - вручную выставить уровень стиля одежды');
})();

}); // конец callback _nickCheck
