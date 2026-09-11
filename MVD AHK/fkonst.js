// ПРОВЕРКА НИКА — добавляй/убирай ники здесь.
const NICK_CHECK_ENABLED = true; // ← поменяй на false чтобы выключить проверку

const _ALLOWED_NICKS = [
    "Zahar_Damidov",
    "Fura_Morales",
    "Casper_Paradise",
    "Denis_Galievskiy"
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
//   МВД уволился:                    2026-07-23 13:22:47
//
//   ТРК `Ритм` Стажер [№1]  принят:  2026-08-03 14:31:33
//   ТРК `Ритм` Светотехник [№2]      2026-08-04 15:22:44  (+1 день)
//   ТРК `Ритм` Монтажер [№3]         2026-08-05 16:45:11  (+1 день)
//   ТРК `Ритм` уволился:             2026-08-09 13:22:47  (стаж Монтажёр: 4 дн., 05.08–09.08)
//
//   ФСИН Охранник [№1]      принят:  2026-08-10 19:41:29  (тот же день, вечером)
//   ФСИН Конвоир [№2]                2026-08-12 14:46:25  (+2 дня)
//   ФСИН Надзиратель [№3]            2026-08-14 17:28:52  (+2 дня)  → итого 4 дня с 1 по 3
//   ФСИН Инспектор [№4]              2026-08-16 13:59:10  (+2 дня)  → за 2 дня до 4
//   ФСИН уволился:                   2026-08-18 15:30:22             (+2 дня после Инспектора)
//
//   ФСИН восстановление:
//   ФСИН Охранник [№1]      принят:  2026-09-09 17:38:23  (Roberto_Thugger)
//   ФСИН Надзиратель [№3]            2026-09-09 17:38:31  (Roberto_Thugger)
// ================================================================
const jskOptions = [
    { name: "Roberto_Thugger изменил должность {nick} на Надзиратель [№3] в ФСИН<t>2026-09-09 17:38:31<n>", action: "jsk_view" },
    { name: "Roberto_Thugger принял {nick} в ФСИН должность на Охранник [№1]<t>2026-09-09 17:38:23<n>", action: "jsk_view" },
    { name: "{nick} покинул организацию ФСИН по собственному желанию<t>2026-08-18 15:30:22<n>", action: "jsk_view" },
    { name: "Jeffery_Pall изменил должность {nick} на Инспектор [№4] в ФСИН<t>2026-08-16 13:59:10<n>", action: "jsk_view" },
    { name: "German_Crown изменил должность {nick} на Надзиратель [№3] в ФСИН<t>2026-08-14 17:28:52<n>", action: "jsk_view" },
    { name: "Miron_Carrington изменил должность {nick} на Конвоир [№2] в ФСИН<t>2026-08-12 14:46:25<n>", action: "jsk_view" },
    { name: "Jeffery_Pall принял {nick} в ФСИН должность на Охранник [№1]<t>2026-08-10 19:41:29<n>", action: "jsk_view" },
    { name: "{nick} покинул организацию ТРК `Ритм` по собственному желанию<t>2026-08-10 17:30:00<n>", action: "jsk_view" },
    { name: "Nikita_Boston изменил должность {nick} на Монтажер [№3] в ТРК `Ритм`<t>2026-08-10 16:45:11<n>", action: "jsk_view" },
    { name: "Ernest_Bavars изменил должность {nick} на Светотехник [№2] в ТРК `Ритм`<t>2026-08-09 15:22:44<n>", action: "jsk_view" },
    { name: "Nikita_Boston принял {nick} в ТРК `Ритм` на должность Стажер [№1]<t>2026-08-08 14:31:33<n>", action: "jsk_view" },
    { name: "{nick} покинул организацию Мин. внутренних дел по собственному желанию<t>2026-07-23 13:22:47<n>", action: "jsk_view" },
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

window.showFakeWorkBook = (playerId, showRoleplay = true) => {
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
        if (showRoleplay) {
            setTimeout(() => {
                const nick = window.App?.$store?.getters["player/nickName"] || autoNick;
                const fakeMsg = `{v:${nick}}${playerId ? `[${playerId}]` : ''} просматривает свою трудовую книгу`;
                if (typeof window.onChatMessage === 'function') window.onChatMessage(fakeMsg, 'FFDD90FF');
            }, 300);
        }
    } catch (e) { console.error('[WBoo] Ошибка:', e); }
};

// ================================================================
// ТРУДОВАЯ v2 — МВД (Подполковник, 3 мес.) + ТРК Ритм (Монтажёр) + ФСИН (Инспектор, текущее)
//
// Расчёт дат (Unix UTC):
//   Впервые выдана:              2026-03-11 12:00:00  →  1773230400
//   МВД принят (Рядовой):        2026-04-20 14:31:33  →  1776695493
//   МВД уволился:                2026-07-23 13:22:47  →  1784812967
//   Стаж в МВД:                  3 мес.
//   ТРК Ритм принят (Стажёр):    2026-08-08 14:31:33  →  1786199493
//   ТРК Ритм последняя должность: Монтажёр [№3]
//   ТРК Ритм уволился:            2026-08-10 17:30:00  →  1786383000
//   Стаж в ТРК Ритм:             2 дн.
//   ФСИН принят (Охранник):      2026-08-10 19:41:29  →  1786390889  (тот же день, вечером)
//   ФСИН последняя должность:    Инспектор [№4]
//   ФСИН уволился:               2026-08-18 15:30:22  →  1787067022  (+2 дня после Инспектора)
//   Стаж в ФСИН:                 8 дн.
//   status 0 = работает | status 1 = уволен | fireStatus 0 = серый квадрат даты
// ================================================================
const FAKE_WB2 = {
    personalNumber: 1042290,
    issueDate:      1773230400,   // 2026-03-11 12:00:00 — дата выдачи трудовой книги
    jobs: [
        {
            title:      "ФСИН",
            post:       "Инспектор",
            status:     1,            // уволен
            fireStatus: 0,
            inviteDate: 1786390889,   // 2026-08-10 19:41:29 — принят в ФСИН
            fireDate:   1787067022,   // 2026-08-18 15:30:22 — уволился (+2 дня после Инспектора)
            experience: "8 дн.",
            reason:     "Не указана"
        },
        {
            title:      "ТРК `Ритм`",
            post:       "Монтажёр",
            status:     1,
            fireStatus: 0,
            inviteDate: 1786199493,   // 2026-08-08 14:31:33 — принят в ТРК Ритм
            fireDate:   1786383000,   // 2026-08-10 17:30:00 — уволился
            experience: "2 дн.",
            reason:     "Не указана"
        },
        {
            title:      "Мин. внутренних дел",
            post:       "Подполковник",
            status:     1,
            fireStatus: 0,
            inviteDate: 1776695493,   // 2026-04-20 14:31:33 — принят в МВД
            fireDate:   1784812967,   // 2026-07-23 13:22:47 — уволился (23 дн. назад)
            experience: "3 мес.",
            reason:     "Не указана"
        }
    ]
};

window.showFakeWorkBook2 = (playerId, showRoleplay = true) => {
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
        if (showRoleplay) {
            setTimeout(() => {
                const nick = window.App?.$store?.getters["player/nickName"] || autoNick;
                const fakeMsg = `{v:${nick}}${playerId ? `[${playerId}]` : ''} просматривает свою трудовую книгу`;
                if (typeof window.onChatMessage === 'function') window.onChatMessage(fakeMsg, 'FFDD90FF');
            }, 300);
        }
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
    // ФИКС КОНФЛИКТА С mvdF.js
    // Сохраняем обработчики, которые были ДО нас (это mvdF.js).
    // Всё, что мы не обрабатываем сами, передаём им, а не в engine.
    // Так /dahk и команды mvdF работают в любом порядке загрузки.
    // ============================================================
    const _fkonstPrevSendChatInput   = window.sendChatInput;
    const _fkonstPrevSendClientEvent = window.sendClientEvent;

    const _fkonstForwardChat = (e) => {
        if (typeof _fkonstPrevSendChatInput === "function") {
            _fkonstPrevSendChatInput(e);
        } else {
            window.App.developmentMode || engine.trigger("SendChatInput", e);
        }
    };

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
                    window.showFakeWorkBook2(id, false); // сервер сам пишет "просматривает" — не дублируем
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
            _fkonstForwardChat(e);

        } else if (jskEnabled && (args[0] === "/team_history" || args[0] === "/teamhistory")) {
            // Ставим флаг и отправляем на сервер.
            // Ответ (addDialogInQueue) поймаем выше.
            _setExpect('team', args[1]);
            _fkonstForwardChat(e);

        } else if (jskEnabled && args[0] === "/alist") {
            // Ставим флаг и отправляем на сервер.
            // Ответ (addDialogInQueue) поймаем выше.
            _setExpect('alist', args[1]);
            _fkonstForwardChat(e);

        // ---------- Всё остальное — на сервер (или предыдущий обработчик mvdF) ----------

        } else {
            _fkonstForwardChat(e);
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
        if (typeof _fkonstPrevSendClientEvent === "function") {
            _fkonstPrevSendClientEvent(event, ...args);
        } else {
            window.sendClientEventHandle?.(event, ...args);
        }
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
// /are [1-6]   — визуальный тест системы арестов (МВД)
//               — визуальный тест сопровождения (ФСИН, без числа)
// /are_s <N>   — МВД:  вручную выставить уровень стиля одежды (0–600)
//               — ФСИН: вручную выставить счётчик вызовов X/10
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

    // ── Скины ФСИН (из fsin.js — fsinSkins) ──────────────────────────────────
    const FSIN_SKINS = [86, 128, 15398, 15399, 15400, 15401, 15402, 15403, 15404, 15405];

    // ── Скины МВД (переданы пользователем) ───────────────────────────────────
    const MVD_SKINS = [15321, 15323, 15325, 15330, 15332, 15334, 15335,
                       190, 148, 15340, 15341, 15342, 15343, 15344, 15348, 15351];

    // ── Получить текущий ID скина ─────────────────────────────────────────────
    function getCurrentSkinId() {
        // Сначала смотрим на window._fsinSkinId (выставляется трекером в fsin.js)
        if (window._fsinSkinId !== undefined && window._fsinSkinId !== null) {
            return window._fsinSkinId;
        }
        // Фолбэк: читаем из стора напрямую
        try {
            const menuInterface = window.interface && window.interface("Menu");
            if (menuInterface && menuInterface.$store) {
                const sid = menuInterface.$store.getters["player/skinId"];
                if (sid !== undefined) return Number(sid);
            }
        } catch (e) {}
        return null;
    }

    // ── Определить тип формы: 'fsin' | 'mvd' | 'unknown' ────────────────────
    function getSkinType() {
        const skinId = getCurrentSkinId();
        if (skinId === null) return 'unknown';
        if (FSIN_SKINS.includes(skinId)) return 'fsin';
        if (MVD_SKINS.includes(skinId))  return 'mvd';
        return 'unknown'; // не МВД и не ФСИН — по умолчанию МВД-поведение
    }

    // Уровень стиля одежды (МВД): глобальный, живёт пока не перезагрузится страница.
    if (window._mvdClothingStyleLevel === undefined) window._mvdClothingStyleLevel = null;

    // Счётчик вызовов ФСИН: null = ещё не использовался, стартует с 1
    if (window._fsinCallsCount === undefined) window._fsinCallsCount = null;

    // Последний полученный от движка список игроков онлайн
    let latestPlayerList = null;

    const originalOnUpdatePlayersList = window.onUpdatePlayersList;
    window.onUpdatePlayersList = function(e) {
        latestPlayerList = e;
        window._mvdPlayerList = e;
        if (originalOnUpdatePlayersList) {
            originalOnUpdatePlayersList.apply(this, arguments);
        }
    };

    function requestPlayerListUpdate() {
        try { window.updatePlayerList && window.updatePlayerList(); } catch (e) {}
    }

    function getLeadingColor(text) {
        const match = text.match(/^\{([0-9A-Fa-f]{6})\}/);
        return match ? match[1] : 'FFFFFF';
    }

    function getRandomDelay() {
        return Math.floor(Math.random() * 2500) + 500;
    }

    function getRandomCriminal() {
        const criminals = [
            'Dima_Bogrovin', 'Kayto_Kirishima', 'Sergey_Petrov',
            'Alex_Smirnov', 'Ivan_Ivanov', 'Mihail_Sokolov'
        ];
        return criminals[Math.floor(Math.random() * criminals.length)];
    }

    function getRandomOfficer() {
        const officers = ['Zahar_Konstov', 'Maxim_Vortex', 'Ivan_Rorger', 'Van_Rorger'];
        return officers[Math.floor(Math.random() * officers.length)];
    }

    function getOwnNick() {
        try {
            return window.App && window.App.$store &&
                   window.App.$store.getters &&
                   window.App.$store.getters['player/nickName'];
        } catch (e) { return null; }
    }

    function getOwnId() {
        try {
            return latestPlayerList && latestPlayerList.local
                ? latestPlayerList.local.id : null;
        } catch (e) { return null; }
    }

    // ── Фракционный фильтр ────────────────────────────────────────────────────
    const FACTION_COLORS = new Set([
        'ccff00', '996633', 'ff6666', 'ff6600', '170000', '0000ff', '000000',
    ]);

    function playerColorToHex6(color) {
        if (color === null || color === undefined) return null;
        if (typeof color === 'number') {
            const rgb = (color >>> 8) & 0xFFFFFF;
            return rgb.toString(16).padStart(6, '0');
        }
        if (typeof color === 'string') {
            const c = color.replace(/^#/, '').toLowerCase();
            if (c.length === 8) return c.slice(0, 6);
            if (c.length === 6) return c;
        }
        return null;
    }

    function isFactionPlayer(player) {
        if (!player) return false;
        const hex = playerColorToHex6(player.color);
        if (hex === null) return false;
        const isFaction = FACTION_COLORS.has(hex);
        if (isFaction) console.log(`[ARE] 🚫 Пропускаем фракционного игрока: ${player.name} (цвет: #${hex})`);
        return isFaction;
    }

    function getRandomRealPlayer() {
        if (!latestPlayerList || !Array.isArray(latestPlayerList.players) || latestPlayerList.players.length === 0) {
            return null;
        }
        const myId = getOwnId();
        const civils = latestPlayerList.players.filter(p =>
            p.id !== myId &&
            !isFactionPlayer(p) &&
            !(p.name && p.name.startsWith('Mask_'))
        );
        if (civils.length > 0) {
            console.log(`[ARE] ✅ Пул гражданских: ${civils.length} чел.`);
            return civils[Math.floor(Math.random() * civils.length)];
        }
        const others = latestPlayerList.players.filter(p =>
            p.id !== myId && !(p.name && p.name.startsWith('Mask_'))
        );
        const pool = others.length ? others : latestPlayerList.players;
        return pool[Math.floor(Math.random() * pool.length)];
    }

    // ── Хелпер: отправить серию сообщений с задержками ───────────────────────
    function sendDelayedMessages(messages) {
        let totalDelay = 0;
        messages.forEach((msg, index) => {
            totalDelay += msg.delay;
            setTimeout(() => {
                window.onChatMessage(msg.text, [0, 0, getLeadingColor(msg.text)]);
                const cleanText = msg.text
                    .replace(/\{[0-9A-Fa-f]{6}\}/g, '')
                    .replace(/\{v:[^}]+\}/g, '')
                    .trim();
                console.log(`[${index + 1}] ${cleanText}`);
            }, totalDelay);
        });
        return totalDelay;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ОСНОВНОЙ ПЕРЕХВАТЧИК КОМАНД
    // ═══════════════════════════════════════════════════════════════════════════
    window.sendChatInput = function(text) {

        // ── /are_s <число> ────────────────────────────────────────────────────
        if (text && text.startsWith('/are_s')) {
            const parts = text.split(' ');
            const num = parts.length > 1 ? parseInt(parts[1], 10) : NaN;
            const skinType = getSkinType();

            if (skinType === 'fsin') {
                // ФСИН: выставляем счётчик вызовов X/10
                if (isNaN(num) || num < 1 || num > 600) {
                    console.log('[TEST] ⚠️ ФСИН: /are_s <число от 1 до 600>');
                    return;
                }
                window._fsinCallsCount = num;
                snAdd(`[1, "Вызовы ФСИН", "Счётчик выставлен: ${num}/10. Следующий вызов покажет ${num}/10", "00FF00", 2500]`);
                console.log(`[TEST] 📋 ФСИН: счётчик вызовов → ${num}/10`);
                return;

            } else {
                // МВД: выставляем уровень стиля одежды
                if (isNaN(num) || num < 0 || num > 600) {
                    console.log('[TEST] ⚠️ МВД: /are_s <число от 0 до 600>');
                    return;
                }
                window._mvdClothingStyleLevel = num;
                snAdd(`[1, "Стиль одежды", "Уровень выставлен: ${num} / 600. Следующий арест покажет ${num}", "00FF00", 2500]`);
                console.log(`[TEST] 👕 МВД: уровень стиля одежды → ${num} / 600`);
                return;
            }
        }

        // ── /are ─────────────────────────────────────────────────────────────
        if (text && text.startsWith('/are')) {
            requestPlayerListUpdate();

            const skinType = getSkinType();
            const officer         = getOwnNick()  || getRandomOfficer();
            const officerId       = getOwnId();
            const officerIdDisplay = (officerId !== null && officerId !== undefined) ? officerId : 529;
            const realCriminal    = getRandomRealPlayer();
            const criminal        = realCriminal ? realCriminal.name : getRandomCriminal();

            // ── ФСИН: сопровождение заключённого ─────────────────────────────
            if (skinType === 'fsin') {
                // Инициализируем счётчик если ещё не задан
                if (window._fsinCallsCount === null || window._fsinCallsCount === undefined) {
                    window._fsinCallsCount = 1;
                }

                const currentCount = window._fsinCallsCount;
                window._fsinCallsCount = currentCount + 1; // следующий вызов +1

                console.log(`[TEST] 🔒 ФСИН: сопровождение ${currentCount}/10 | ${officer}[${officerIdDisplay}] → ${criminal}`);

				const messages = [
					{
						delay: 100,
						text: `{DD90FF}{v:${officer}}[${officerIdDisplay}] сопроводил заключённого ${criminal}`
					},
					{
						delay: 100,  // ← было getRandomDelay()
						text: `{75A3D2}Вы успешно сопроводили заключенного. {FFFFFF}Вызов завершен.`
					},
					{
						delay: 100,  // ← было getRandomDelay()
						text: `{75A3D2}Вы сопроводили заключенного и заработали {FFFFFF}1500 руб. {75A3D2}Выполненных вызовов: {FFFFFF}${currentCount}/10.`
					}
				];

                const totalDelay = sendDelayedMessages(messages);
                setTimeout(() => {
                    console.log(`[TEST] ✅ ФСИН: вызов ${currentCount}/10 завершён. Следующий будет ${currentCount + 1}/10`);
                    console.log(`[TEST] 💰 Заработано: 1500 руб.`);
                }, totalDelay + 500);

                return;
            }

            // ── МВД: задержание преступника (текущее поведение) ───────────────
            {
                const parts = text.split(' ');
                let stars = 1;
                if (parts.length > 1) {
                    const num = parseInt(parts[1]);
                    if (!isNaN(num) && num >= 1 && num <= 6) stars = num;
                }

                const settings = {
                    1: { minutes: 20, bonus: 10000, exp: 5 },
                    2: { minutes: 40, bonus: 20000, exp: 10 },
                    3: { minutes: 60, bonus: 30000, exp: 15 },
                    4: { minutes: 80, bonus: 40000, exp: 20 },
                    5: { minutes: 100, bonus: 50000, exp: 25 },
                    6: { minutes: 120, bonus: 60000, exp: 30 }
                };
                const config = settings[stars];

                if (window._mvdClothingStyleLevel === null || window._mvdClothingStyleLevel === undefined) {
                    window._mvdClothingStyleLevel = Math.floor(Math.random() * 20) + 1;
                }
                const newLevel      = window._mvdClothingStyleLevel;
                window._mvdClothingStyleLevel = newLevel + 1;
                const previousLevel = newLevel - 1;
                const maxLevel      = 600;

                console.log(`[TEST] ⭐ ${stars} звезд | ⏱ ${config.minutes} мин | 💰 ${config.bonus} руб | ✨ +${config.exp} опыта`);
                console.log(`[TEST] 👮 ${officer}[${officerIdDisplay}] задерживает ${criminal}${realCriminal ? ` (реальный игрок, ID ${realCriminal.id})` : ' (фолбэк-имя)'}`);

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

                const totalDelay = sendDelayedMessages(messages);
                setTimeout(() => {
                    console.log(`[TEST] ✅ Готово! (визуальный тест, реальных изменений в игре не произошло)`);
                    console.log(`[TEST] ⭐${stars} | ⏱${config.minutes} мин | 💰${config.bonus} руб | ✨+${config.exp} опыта`);
                    console.log(`[TEST] 👕 Прокачка: ${previousLevel} → ${newLevel} / ${maxLevel}`);
                }, totalDelay + 500);

                return;
            }
        }

        if (originalSendChatInput) {
            originalSendChatInput.apply(this, arguments);
        }
    };

    // Запрашиваем список игроков сразу при загрузке скрипта
    requestPlayerListUpdate();

    console.log('[TEST] ✅ /are загружен в fkonst.js (МВД + ФСИН режимы)');
    console.log('[TEST] 📋 МВД:  /are [1-6]    — симуляция ареста с прокачкой');
    console.log('[TEST] 📋 МВД:  /are_s <0-600> — вручную выставить уровень стиля одежды');
    console.log('[TEST] 📋 ФСИН: /are          — симуляция сопровождения заключённого (1500 руб.)');
    console.log('[TEST] 📋 ФСИН: /are_s <1-600> — вручную выставить счётчик вызовов X/10');
})();
// ================================================================
// [FKONST /TS BLOCK v2] — вставить в самый низ файла (старый блок удалить!)
// /ts 13 50 43 | /ts 13:50:43 — ПОСЛЕДНЕЕ сообщение чата получит это время,
//   а все остальные отстанут от него на свою реальную разницу (убавление).
//   Новые сообщения продолжают линию времени дальше.
// /ts reset — вернуть настоящее время; /ts — справка
// ================================================================
(function () {
    if (window.__tsBlockLoaded) return;
    window.__tsBlockLoaded = true;

    if (window._tsOffset === undefined) window._tsOffset = 0;
    if (window._tsPendingTarget === undefined) window._tsPendingTarget = null;

    // ── Доступ к чату (Hud.js: hud.$refs.chat, messages[].time) ──
    function getChat() {
        try {
            const hud = window.interface && window.interface('Hud');
            if (!hud || !hud.$refs || !hud.$refs.chat) return null;
            const chat = hud.$refs.chat;
            return (chat && Array.isArray(chat.messages)) ? chat : null;
        } catch (_) { return null; }
    }
    function ensureOrig(chat) {
        for (const m of chat.messages) {
            if (m && typeof m.time === 'number' && m._tsOrig === undefined) m._tsOrig = m.time;
        }
    }
    function applyOffset(chat) {
        const off = window._tsOffset || 0;
        for (const m of chat.messages) {
            if (m && m._tsOrig !== undefined) m.time = m._tsOrig + off;
        }
    }
    function fixNew(chat) {
        if (!chat) return;
        ensureOrig(chat);
        // чат был пуст в момент /ts — якорим цель по последнему (первому пришедшему) сообщению
        if (window._tsPendingTarget !== null && chat.messages.length) {
            const last = chat.messages[chat.messages.length - 1];
            window._tsOffset = window._tsPendingTarget - last._tsOrig;
            window._tsPendingTarget = null;
            console.log(`[TS] отложенный оффсет применён: ${window._tsOffset} мс`);
        }
        if (window._tsOffset) applyOffset(chat);
    }
    function patchChat(chat) {
        if (!chat || chat._tsPatched) return;
        const origAdd = chat.add;
        if (typeof origAdd !== 'function') return;
        chat.add = function (...args) {
            const r = origAdd.apply(this, args);
            fixNew(this); // синхронно, без мигания реального времени
            return r;
        };
        chat._tsPatched = true;
        console.log('[TS] chat.add перехвачен');
    }
    function notify(text) {
        if (typeof window.onChatMessage !== 'function') return;
        window.onChatMessage(text, '999999FF');
        setTimeout(() => {
            try {
                const chat = getChat();
                if (!chat) return;
                chat.messages = chat.messages.filter(m =>
                    !m.content || !m.content.some(c => c.text && c.text.includes('FKONST /ts')));
            } catch (_) { /* тихо */ }
        }, 3000);
    }
    // ── Обработчик /ts ──
    function handleTs(rawText) {
        const chat = getChat();
        if (chat) patchChat(chat);
        const raw = String(rawText).replace(/^\/ts/i, '').trim();
        if (!raw) {
            console.log('[TS] ⚠️ Использование: /ts <ЧЧ ММ СС> | /ts <ЧЧ:ММ:СС> | /ts reset');
            notify('{999999}FKONST /ts — {EE4444}формат: /ts 13 50 43 | сброс: /ts reset');
            return;
        }
        if (raw === 'reset' || raw === 'off') {
            window._tsOffset = 0;
            window._tsPendingTarget = null;
            if (chat) { ensureOrig(chat); applyOffset(chat); }
            console.log('[TS] оффсет сброшен');
            notify('{999999}FKONST /ts — {EE4444}timestamp сброшен на реальное время');
            return;
        }
        const p  = raw.split(/[:\s]+/).filter(Boolean);
        const h  = parseInt(p[0], 10);
        const mi = p.length > 1 ? parseInt(p[1], 10) : 0;
        const s  = p.length > 2 ? parseInt(p[2], 10) : 0;
        if (isNaN(h) || h < 0 || h > 23 || isNaN(mi) || mi < 0 || mi > 59 || isNaN(s) || s < 0 || s > 59) {
            console.log('[TS] ⚠️ Использование: /ts <ЧЧ ММ СС> | /ts <ЧЧ:ММ:СС> | /ts reset');
            notify('{999999}FKONST /ts — {EE4444}формат: /ts 13 50 43');
            return;
        }
        const d = new Date();
        d.setHours(h, mi, s, 0);
        const target = d.getTime();
        const hh = String(h).padStart(2, '0'), mm = String(mi).padStart(2, '0'), ss = String(s).padStart(2, '0');
        if (chat && chat.messages.length) {
            ensureOrig(chat);
            // ═══ ЯКОРЬ ПО ПОСЛЕДНЕМУ СООБЩЕНИЮ ═══
            // последнее = введённое время, остальные = введённое − разница (убавление)
            const last = chat.messages[chat.messages.length - 1];
            window._tsOffset = target - last._tsOrig;
            window._tsPendingTarget = null;
            applyOffset(chat);
            console.log(`[TS] оффсет ${window._tsOffset} мс → последнее сообщение = ${hh}:${mm}:${ss}, остальные назад по разнице`);
        } else {
            window._tsPendingTarget = target; // чат пуст — цель ляжет на первое пришедшее сообщение
            console.log('[TS] чат пуст — время применится к первому сообщению');
        }
        notify(`{999999}FKONST /ts — {33DD77}последнее сообщение = ${hh}:${mm}:${ss}`);
    }
    window._tsSet = handleTs; // из консоли: _tsSet('/ts 13 50 43')

    // ── Перехват window.sendChatInput (один раз, после init fkonst) ──
    const tsWrap = function (text) {
        if (typeof text === 'string' && /^\/ts(\s|$)/i.test(text)) {
            handleTs(text.trim());
            return; // на сервер не уходит
        }
        if (typeof tsWrap._prev === 'function') return tsWrap._prev.apply(this, arguments);
    };
    tsWrap._prev = null;
    function install() {
        if (window.sendChatInput === tsWrap) return true;
        if (typeof window.sendChatInput !== 'function') return false;
        tsWrap._prev = window.sendChatInput;
        window.sendChatInput = tsWrap;
        console.log('[TS] перехват window.sendChatInput установлен');
        return true;
    }
    const poll = setInterval(() => {
        if (typeof window.sendChatInputCustom === 'function' && install()) clearInterval(poll);
    }, 100);
    setTimeout(() => clearInterval(poll), 60000);

    // ── Страховка: держим chat.add запатченным (смена HUD и т.п.) ──
    setInterval(() => {
        const chat = getChat();
        if (!chat) return;
        patchChat(chat);
        if (window._tsOffset || window._tsPendingTarget !== null) fixNew(chat);
    }, 500);

    console.log('════════════════════════════════════════════════');
    console.log('[TS] /ts 13 50 43 — последнее сообщение чата = 13:50:43,');
    console.log('[TS]                  остальные назад с реальной разницей');
    console.log('[TS] /ts reset     — вернуть реальное время чата');
    console.log('════════════════════════════════════════════════');
})();
// ================================================================
// [FKONST GT-LOG BLOCK] — логгер GameText: вставить в самый низ файла
// Каждое появление gametext пишется в консоль в ПОЛНОМ формате:
// RAW JSON + расшифровка всех полей + строки текста с цветами
// ================================================================
(function () {
    if (window.__gtLogLoaded) return;
    window.__gtLogLoaded = true;

    const GT_TYPES = ['center-type', 'top-type', 'right-type', 'bottom-type', 'key-type'];
    const GT_TYPE_NAMES = ['CENTER', 'TOP', 'RIGHT', 'BOTTOM', 'KEY'];
    const GT_COLORS = { r: 'red', y: 'yellow', p: 'purple', w: 'white', b: 'blue', g: 'green', d: 'gray', o: 'orange' };

    // ──_plain text из HTML (без тегов) ──
    function htmlToPlain(html) {
        try {
            const d = document.createElement('div');
            d.innerHTML = String(html).split('_').join(' ');
            return d.textContent || '';
        } catch (_) { return String(html); }
    }

    // ── Полный лог одного gametext ──
    function logGameText(raw, gt) {
        let t = raw;
        try { if (typeof raw === 'string') t = JSON.parse(raw); } catch (_) {}
        if (!Array.isArray(t)) { console.log('[GT] ⚠️ не массив:', raw); return; }
        const [type, text, duration, offset, keyCode, force, sound, fontSize] = t;
        console.log('═══════════════ GAME TEXT ═══════════════');
        console.log(`[GT] RAW: ${typeof raw === 'string' ? raw : JSON.stringify(raw)}`);
        console.log(`[GT] type:     ${type} (${GT_TYPE_NAMES[type] || '?'} / ${GT_TYPES[type] || '?'})`);
        console.log(`[GT] duration: ${duration} мс ${duration > 0 ? '(самоудаление)' : '(без таймера)'}`);
        console.log(`[GT] offset:   ${offset}`);
        console.log(`[GT] keyCode:  ${keyCode}`);
        console.log(`[GT] force:    ${force} ${force ? '(показ поверх интерфейсов/диалогов)' : ''}`);
        console.log(`[GT] sound:    ${sound} ${sound ? '(UI_Notification_01.mp3)' : ''}`);
        console.log(`[GT] fontSize: ${fontSize} vh`);
        console.log(`[GT] text raw: ${text}`);
        // Построчно с расшифровкой цветовых кодов
        String(text).split('~n~').forEach((line, i) => {
            const decoded = line.replace(/~([rypwbgdo])~/g, (m, c) => `{${GT_COLORS[c]}}`);
            console.log(`[GT]   строка ${i}: ${decoded}`);
        });
        // Как это выглядит на экране (plain)
        try {
            if (gt && typeof gt.formatText === 'function') {
                console.log(`[GT] на экране: ${htmlToPlain(gt.formatText(text, fontSize))}`);
            }
        } catch (_) {}
        console.log('═════════════════════════════════════════');
    }

    // ── Патч экземпляра компонента GameText (add — единственная точка входа) ──
    function patchInstance(gt) {
        if (!gt || gt.__gtPatched) return;
        const orig = gt.add;
        if (typeof orig !== 'function') return;
        gt.add = function (e) {
            try { logGameText(e, this); } catch (_) {}
            return orig.apply(this, arguments);
        };
        gt.__gtPatched = true;
        console.log('[GT] ✅ GameText.add перехвачен — логгер активен');
    }

    // ── Перехват openInterface: GameText пересоздаётся при каждом открытии ──
    const _gtOrigOpen = window.openInterface;
    window.openInterface = function (name, data, ...rest) {
        if (name === 'GameText') {
            console.log(`[GT] openInterface('GameText') data: ${data}`);
            setTimeout(() => { try { patchInstance(window.interface('GameText')); } catch (_) {} }, 30);
            setTimeout(() => { try { patchInstance(window.interface('GameText')); } catch (_) {} }, 150);
        }
        return _gtOrigOpen && _gtOrigOpen.call(this, name, data, ...rest);
    };

    // ── Страховка: компонент ленивый, ловим экземпляр поллингом ──
    setInterval(() => {
        try {
            const gt = window.interface && window.interface('GameText');
            if (gt) patchInstance(gt);
        } catch (_) {}
    }, 250);

    console.log('[GT] 📋 Логгер GameText загружен (полный формат в консоли)');
})();
// ================================================================
// [FKONST DIALOG-LOG BLOCK] — вставить в самый низ файла
// Логирует каждое открытие диалога (Window) в консоль в ПОЛНОМ формате:
//   RAW dialogData + расшифровка всех полей openParams (id/type/title/
//   subtitle/buttons/paginate/prefill) + тело по строкам <n> и колонкам
//   <t> с цветами строк {RRGGBB}/{RRGGBBAA} (учитывает перенос цвета,
//   как setRowsColors в Window.js: carry для text/input, без carry для list)
// Последний диалог всегда доступен в window._dlgLogLast
// ================================================================
(function () {
    if (window.__dlgLogLoaded) return;
    window.__dlgLogLoaded = true;

    const TYPE_NAMES = ['TEXT', 'INPUT', 'LIST (normal)', 'INPUT PRIVATE', 'LIST (title)', 'LIST (title)', 'IMAGE'];
    const COLOR_RE = /{([a-zA-Z0-9]{6}|[a-zA-Z0-9]{8})}/g;

    const stripColors = s => String(s).replace(COLOR_RE, '');
    const extractColors = s => {
        const out = [];
        String(s).replace(COLOR_RE, (m, c) => { if (!out.includes(c)) out.push(c); return m; });
        return out;
    };

    // Декодер тела: carry=true → цвет тянется через строки/колонки (text/input/image),
    // carry=false → цвет только от кода, стоящего перед текстом (list)
    function decodeBody(body, carry) {
        const rows = String(body).split('<n>');
        let cur = '';
        return rows.map((raw, ri) => {
            const cols = raw.split('<t>').map(colRaw => {
                if (!carry) cur = '';
                const segs = [];
                let last = 0, prev = null, m;
                const re = new RegExp(COLOR_RE.source, 'g');
                while ((m = re.exec(colRaw))) {
                    const text = colRaw.slice(last, m.index);
                    if (text.length) segs.push({ color: carry ? cur : (prev || ''), text });
                    prev = m[1]; cur = m[1];
                    last = m.index + m[0].length;
                }
                const tail = colRaw.slice(last);
                if (tail.length) segs.push({ color: carry ? cur : (prev || ''), text: tail });
                return segs;
            });
            return { index: ri, raw, cols };
        });
    }

    const fmtSegs = segs => segs.length
        ? segs.map(s => s.color ? `[#${s.color}]${JSON.stringify(s.text)}` : `[без цвета]${JSON.stringify(s.text)}`).join(' + ')
        : '(пусто)';

    function logDialog(dialogData, body, priority) {
        let params = null;
        try { params = dialogData ? JSON.parse(dialogData) : null; } catch (_) {}
        const id       = params ? params[0] : '?';
        const typeIdx  = params ? params[1] : -1;
        const title    = params ? String(params[2] ?? '') : '';
        const subtitle = params ? String(params[3] ?? '') : '';
        const btn1     = params ? String(params[4] ?? '') : '';
        const btn2     = params ? String(params[5] ?? '') : '';
        const pagPrev  = params ? !!params[6] : false;
        const pagNext  = params ? !!params[7] : false;
        const prefill  = params ? String(params[8] ?? '') : '';
        const typeName = TYPE_NAMES[typeIdx] || `UNKNOWN(${typeIdx})`;
        const isList   = typeIdx === 2 || typeIdx === 4 || typeIdx === 5;
        const carry    = !isList;

        console.groupCollapsed(`[DLG] #${id} ${typeName} — ${stripColors(title) || '(без заголовка)'}`);
        console.log(`[DLG] RAW dialogData: ${dialogData}`);
        console.log(`[DLG] id=${id} | type=${typeIdx} (${typeName}) | priority=${priority === undefined ? 0 : priority}`);
        console.log(`[DLG] title:    raw=${JSON.stringify(title)} | цвета=${JSON.stringify(extractColors(title))}`);
        console.log(`[DLG] subtitle: raw=${JSON.stringify(subtitle)} | цвета=${JSON.stringify(extractColors(subtitle))}`);
        console.log(`[DLG] buttons:  [${JSON.stringify(btn1)}, ${JSON.stringify(btn2)}] | paginate: [${pagPrev}, ${pagNext}] | prefill: ${JSON.stringify(prefill)}`);
        console.log(`[DLG] RAW body: ${JSON.stringify(body)}`);
        decodeBody(body ?? '', carry).forEach(r => {
            const rowColors = [];
            r.cols.forEach(segs => segs.forEach(s => { if (s.color && !rowColors.includes(s.color)) rowColors.push(s.color); }));
            console.log(`[DLG] строка ${r.index}: цвет строки=${rowColors[0] ? '#' + rowColors[0] : 'нет'} | все цвета=${JSON.stringify(rowColors)}`);
            console.log(`[DLG]   raw: ${JSON.stringify(r.raw)}`);
            if (isList || r.cols.length > 1) {
                r.cols.forEach((segs, ci) => console.log(`[DLG]   колонка ${ci}: ${fmtSegs(segs)}`));
            } else {
                console.log(`[DLG]   сегменты: ${fmtSegs(r.cols[0] || [])}`);
            }
        });
        console.groupEnd();
        window._dlgLogLast = { dialogData, body, priority, params };
    }

    // Патчим ЕДИНУЮ точку входа всех диалогов — App.addDialogInQueue
    function install() {
        if (!window.App || typeof window.App.addDialogInQueue !== 'function') return false;
        if (window.App.__dlgLogPatched) return true;
        const orig = window.App.addDialogInQueue;
        window.App.addDialogInQueue = function (dialogData, body, priority) {
            try { logDialog(dialogData, body, priority); } catch (e) { console.warn('[DLG] ошибка лога:', e); }
            return orig.apply(this, arguments);
        };
        window.App.__dlgLogPatched = true;
        console.log('[DLG] ✅ перехват App.addDialogInQueue установлен — диалоги логируются');
        return true;
    }
    if (!install()) {
        const p = setInterval(() => { if (install()) clearInterval(p); }, 200);
        setTimeout(() => clearInterval(p), 60000);
    }
    console.log('[DLG] 📋 Логгер диалогов загружен (полный формат + цвета строк)');
})();
}); // конец callback _nickCheck
// ================================================================
// [FKONST TS-DIALOG BLOCK] — вставить в самый низ файла
// Синхронизация /ts с серверным диалогом "Точное время" (/c 60):
//  — при открытии /c 60 время/дата/день недели подменяются на
//    Date.now() + window._tsOffset (формат сервера сохраняется)
//  — если диалог уже открыт в момент /ts — он перезаоткрывается
//    с новым временем
// ================================================================
(function () {
    if (window.__tsDlgLoaded) return;
    window.__tsDlgLoaded = true;

    const MONTHS_RU  = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
    const WEEKDAYS_RU = ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'];
    const MARK = 'Текущее время:';

    function isTimeDialog(body) {
        return typeof body === 'string' && body.includes(MARK);
    }

    // Переписывает время/дату/день недели в теле диалога /c 60 по оффсету /ts
    function shiftTimeBody(body) {
        const off = window._tsOffset || 0;
        if (!off || typeof body !== 'string') return body;
        const now     = new Date(Date.now() + off);
        const hh      = String(now.getHours()).padStart(2, '0');
        const mm      = String(now.getMinutes()).padStart(2, '0');
        const dateStr = `${now.getDate()} ${MONTHS_RU[now.getMonth()]} ${now.getFullYear()} г.`;
        const weekday = WEEKDAYS_RU[now.getDay()];
        let out = body;
        out = out.replace(/(Текущее время:(?:<t>)*(?:\{[0-9A-Fa-f]{6,8}\})?)\s*\d{1,2}:\d{2}/,
            (m, p) => p + hh + ':' + mm);
        out = out.replace(/(Сегодняшняя дата:(?:<t>)*(?:\{[0-9A-Fa-f]{6,8}\})?)\s*\d{1,2}\s+[а-яё]+\s+\d{4}\s+г\./,
            (m, p) => p + dateStr);
        out = out.replace(/(День недели:(?:<t>)*(?:\{[0-9A-Fa-f]{6,8}\})?)\s*[А-Яа-яё]+/,
            (m, p) => p + weekday);
        return out;
    }

    // ── Перехват App.addDialogInQueue: подмена тела диалога /c 60 на входе ──
    function installAppPatch() {
        if (!window.App || typeof window.App.addDialogInQueue !== 'function') return false;
        if (window.App.__tsDlgPatched) return true;
        const orig = window.App.addDialogInQueue;
        window.App.addDialogInQueue = function (dialogData, body, priority) {
            try {
                if (isTimeDialog(body)) {
                    window._tsTimeDialogRaw = { dialogData, body, priority }; // сырое тело для перезаоткрытия
                    const shifted = shiftTimeBody(body);
                    if (shifted !== body) console.log('[TS-DLG] время в диалоге /c 60 сдвинуто по /ts');
                    body = shifted;
                }
            } catch (_) {}
            return orig.call(this, dialogData, body, priority);
        };
        window.App.__tsDlgPatched = true;
        console.log('[TS-DLG] перехват App.addDialogInQueue установлен');
        return true;
    }
    if (!installAppPatch()) {
        const p = setInterval(() => { if (installAppPatch()) clearInterval(p); }, 200);
        setTimeout(() => clearInterval(p), 60000);
    }

    // ── Диалог уже открыт в момент /ts → перезаоткрыть с новым временем ──
    function refreshOpenTimeDialog() {
        const raw = window._tsTimeDialogRaw;
        if (!raw) return;
        let dlg = null;
        try { dlg = window.currentDialog && window.currentDialog(); } catch (_) {}
        if (!dlg || typeof dlg.stringParam !== 'string' || !dlg.stringParam.includes(MARK)) return;
        try {
            window.closeLastDialog();
            window.App.addDialogInQueue(raw.dialogData, raw.body, raw.priority); // наш патч применит новый оффсет
            console.log('[TS-DLG] открытый диалог /c 60 обновлён по /ts');
        } catch (_) {}
    }

    // ── Хук поверх window.sendChatInput (встаёт ПОСЛЕ tsWrap из /ts-блока) ──
    const chatHook = function (text) {
        const isTs = typeof text === 'string' && /^\/ts(\s|$)/i.test(text);
        const r = chatHook._prev ? chatHook._prev.apply(this, arguments) : undefined;
        if (isTs) setTimeout(refreshOpenTimeDialog, 0);
        return r;
    };
    chatHook._prev = null;
    chatHook.__tsDlgHook = true;
    function installChatHook() {
        const cur = window.sendChatInput;
        if (cur === chatHook) return true;
        // ждём, пока /ts-блок поставит свой tsWrap (у него есть свойство _prev)
        if (!(typeof cur === 'function' && '_prev' in cur && !cur.__tsDlgHook)) return false;
        chatHook._prev = cur;
        window.sendChatInput = chatHook;
        console.log('[TS-DLG] хук sendChatInput установлен (live-обновление /c 60)');
        return true;
    }
    const poll = setInterval(() => { if (installChatHook()) clearInterval(poll); }, 100);
    setTimeout(() => clearInterval(poll), 60000);

    console.log('[TS-DLG] 📋 Синхронизация /ts ↔ диалог /c 60 загружена');
})();
// ================================================================
// [FKONST TS-GT BLOCK] — вставить в самый низ файла
// Синхронизация /ts с GameText: время/дата в gametext-уведомлениях
// (например "~y~21:17~n~~w~11.09.2026") подменяются на
// Date.now() + window._tsOffset. Меняются только токены, совпадающие
// с реальным текущим моментом (±2 мин) и реальной сегодняшней датой,
// поэтому посторонние времена/даты не затрагиваются.
// ================================================================
(function () {
    if (window.__tsGtLoaded) return;
    window.__tsGtLoaded = true;

    const MONTHS = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
    const MONTHS_RE = MONTHS.join('|');
    const p2 = n => String(n).padStart(2, '0');

    function shiftGameTextPayload(raw) {
        const off = window._tsOffset || 0;
        if (!off || typeof raw !== 'string') return raw;
        let t;
        try { t = JSON.parse(raw); } catch (_) { return raw; }
        if (!Array.isArray(t) || typeof t[1] !== 'string') return raw;

        const realMs  = Date.now();
        const real    = new Date(realMs);
        const fake    = new Date(realMs + off);
        let text = t[1];

        // ── Время ЧЧ:ММ или ЧЧ:ММ:СС, равное реальному "сейчас" (±2 мин) ──
        text = text.replace(/(\d{1,2}):(\d{2})(?::(\d{2}))?/g, (m, h, mi, s) => {
            const H = +h, M = +mi, S = s ? +s : 0;
            if (H > 23 || M > 59 || S > 59) return m;
            const d = new Date(realMs);
            d.setHours(H, M, S, 0);
            if (Math.abs(d.getTime() - realMs) > 120000) return m; // не "сейчас" — не трогаем
            return s
                ? `${p2(fake.getHours())}:${p2(fake.getMinutes())}:${p2(fake.getSeconds())}`
                : `${p2(fake.getHours())}:${p2(fake.getMinutes())}`;
        });

        // ── Дата ДД.ММ.ГГГГ, равная реальному сегодня ──
        text = text.replace(/(\d{1,2})\.(\d{1,2})\.(\d{4})/g, (m, d, mo, y) => {
            if (+d !== real.getDate() || +mo !== real.getMonth() + 1 || +y !== real.getFullYear()) return m;
            return `${p2(fake.getDate())}.${p2(fake.getMonth() + 1)}.${fake.getFullYear()}`;
        });

        // ── Дата "Д месяц ГГГГ" (рус. месяцы), равная реальному сегодня ──
        text = text.replace(new RegExp(`(\\d{1,2})\\s+(${MONTHS_RE})\\s+(\\d{4})`, 'g'), (m, d, mo, y) => {
            const idx = MONTHS.indexOf(mo);
            if (idx < 0 || +d !== real.getDate() || idx !== real.getMonth() || +y !== real.getFullYear()) return m;
            return `${fake.getDate()} ${MONTHS[fake.getMonth()]} ${fake.getFullYear()}`;
        });

        if (text === t[1]) return raw;
        t[1] = text;
        console.log(`[TS-GT] время в gametext сдвинуто по /ts → ${text}`);
        return JSON.stringify(t);
    }

    // ── Патч экземпляра GameText (add — единственная точка входа) ──
    function patchGT(gt) {
        if (!gt || gt.__tsGtPatched) return;
        const orig = gt.add;
        if (typeof orig !== 'function') return;
        gt.add = function (e) {
            try { e = shiftGameTextPayload(e); } catch (_) {}
            return orig.call(this, e);
        };
        gt.__tsGtPatched = true;
        console.log('[TS-GT] GameText.add перехвачен для подмены времени');
    }

    // Компонент ленивый и может пересоздаваться — держим патч поллингом
    const poll = setInterval(() => {
        try {
            const gt = window.interface && window.interface('GameText');
            if (gt) patchGT(gt);
        } catch (_) {}
    }, 250);
    setTimeout(() => clearInterval(poll), 300000);

    console.log('[TS-GT] 📋 Синхронизация /ts ↔ GameText загружена');
})();
// ================================================================
// [FKONST TS-EDITOR BLOCK] — вставить в самый низ файла
// /ts теперь требует открытого диалога "Точное время" (/c 60).
// При открытом диалоге /ts включает режим правки:
//   клик по "Сегодняшняя дата:"  → ввод новой даты (ДД.ММ.ГГГГ или "11 сентября 2026")
//   клик по "День недели:"       → +1 день за клик
//   клик по "Текущее время:"     → ввод нового времени (ЧЧ:ММ или ЧЧ:ММ:СС)
// Любая правка мгновенно меняет window._tsOffset → чат, gametext
// и следующие /c 60 идут по новому времени.
// ================================================================
(function () {
    if (window.__tsEditLoaded) return;
    window.__tsEditLoaded = true;

    const MONTHS  = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
    const WEEKDAYS = ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'];
    const p2 = n => String(n).padStart(2, '0');

    function isTimeDialogOpen() {
        try {
            const dlg = window.currentDialog && window.currentDialog();
            return !!(dlg && typeof dlg.stringParam === 'string' && dlg.stringParam.includes('Текущее время:'));
        } catch (_) { return false; }
    }
    function notify(text) {
        if (typeof window.onChatMessage !== 'function') return;
        window.onChatMessage(text, '999999FF');
        setTimeout(() => {
            try {
                const hud = window.interface && window.interface('Hud');
                const chat = hud && hud.$refs && hud.$refs.chat;
                if (!chat || !Array.isArray(chat.messages)) return;
                chat.messages = chat.messages.filter(m =>
                    !m.content || !m.content.some(c => c.text && c.text.includes('FKONST /ts')));
            } catch (_) {}
        }, 3000);
    }
    // ── Перерисовать значения в ОТКРЫТОМ диалоге без перезаоткрытия ──
    function updateDialogDom(fake) {
        try {
            const dlg = window.currentDialog && window.currentDialog();
            if (!dlg || !dlg.$el) return;
            dlg.$el.querySelectorAll('.window-text__item').forEach(row => {
                const cols = row.querySelectorAll('.window-text__item-col');
                if (cols.length < 2) return;
                const label = (cols[0].textContent || '').trim();
                const val = cols[cols.length - 1];
                if (label.indexOf('Сегодняшняя дата') === 0)
                    val.innerHTML = `<p style="color: #66CC00">${fake.getDate()} ${MONTHS[fake.getMonth()]} ${fake.getFullYear()} г.</p>`;
                else if (label.indexOf('День недели') === 0)
                    val.innerHTML = `<p style="color: #66CC00">${WEEKDAYS[fake.getDay()]}</p>`;
                else if (label.indexOf('Текущее время') === 0)
                    val.innerHTML = `<p style="color: #3399FF">${p2(fake.getHours())}:${p2(fake.getMinutes())}</p>`;
            });
        } catch (_) {}
    }
    // ── Применить новый оффсет ко всему (чат + диалог + будущее) ──
    function applyOffset(newOff) {
        const old = window._tsOffset || 0;
        window._tsOffset = newOff;
        try {
            const hud = window.interface && window.interface('Hud');
            const chat = hud && hud.$refs && hud.$refs.chat;
            if (chat && Array.isArray(chat.messages)) {
                for (const m of chat.messages) {
                    if (m && typeof m.time === 'number') {
                        if (m._tsOrig === undefined) m._tsOrig = m.time - old;
                        m.time = m._tsOrig + newOff;
                    }
                }
            }
        } catch (_) {}
        updateDialogDom(new Date(Date.now() + newOff));
        console.log(`[TS-EDIT] оффсет ${newOff} мс → фейк-время ${new Date(Date.now() + newOff).toLocaleString('ru-RU')}`);
    }
    // ── Правки кликом ──
    function editTime(fake) {
        const cur = `${p2(fake.getHours())}:${p2(fake.getMinutes())}`;
        const inp = prompt('Новое текущее время (ЧЧ:ММ или ЧЧ:ММ:СС):', cur);
        if (inp === null) return;
        const m = inp.trim().match(/^(\d{1,2})[:.](\d{2})(?:[:.](\d{2}))?$/);
        if (!m || +m[1] > 23 || +m[2] > 59 || (m[3] !== undefined && +m[3] > 59)) { console.log('[TS-EDIT] ⚠️ формат: ЧЧ:ММ или ЧЧ:ММ:СС'); return; }
        const f = new Date(fake);
        f.setHours(+m[1], +m[2], m[3] !== undefined ? +m[3] : f.getSeconds(), 0);
        applyOffset(f.getTime() - Date.now());
    }
    function editDate(fake) {
        const cur = `${p2(fake.getDate())}.${p2(fake.getMonth() + 1)}.${fake.getFullYear()}`;
        const inp = prompt('Новая дата (ДД.ММ.ГГГГ или "11 сентября 2026"):', cur);
        if (inp === null) return;
        let d, mo, y;
        let m = inp.trim().match(/^(\d{1,2})[.\/](\d{1,2})[.\/](\d{4})$/);
        if (m) { d = +m[1]; mo = +m[2] - 1; y = +m[3]; }
        else {
            m = inp.trim().replace(/г\.?$/i, '').match(/^(\d{1,2})\s+([а-яё]+)\s+(\d{4})$/);
            if (m) { d = +m[1]; mo = MONTHS.indexOf(m[2]); y = +m[3]; }
        }
        if (m === null || d === undefined || mo < 0 || mo > 11 || d < 1 || d > 31) { console.log('[TS-EDIT] ⚠️ формат: ДД.ММ.ГГГГ или "11 сентября 2026"'); return; }
        const f = new Date(fake);
        f.setFullYear(y, mo, d);
        applyOffset(f.getTime() - Date.now());
    }
    function editWeekday(fake) {
        // +1 день за клик — быстро докликиваешь до нужного дня недели
        applyOffset(fake.getTime() + 86400000 - Date.now());
    }
    document.addEventListener('click', (e) => {
        if (!window._tsEditMode) return;
        if (!isTimeDialogOpen()) return;
        const row = e.target && e.target.closest ? e.target.closest('.window-text__item') : null;
        if (!row) return;
        const cols = row.querySelectorAll('.window-text__item-col');
        if (cols.length < 2) return;
        const label = (cols[0].textContent || '').trim();
        const fake = new Date(Date.now() + (window._tsOffset || 0));
        if (label.indexOf('Сегодняшняя дата') === 0)      { e.preventDefault(); e.stopPropagation(); editDate(fake); }
        else if (label.indexOf('День недели') === 0)       { e.preventDefault(); e.stopPropagation(); editWeekday(fake); }
        else if (label.indexOf('Текущее время') === 0)     { e.preventDefault(); e.stopPropagation(); editTime(fake); }
    }, true);

    // ── Гейт /ts: только при открытом диалоге /c 60 + включение правки ──
    const editHook = function (text) {
        if (typeof text === 'string' && /^\/ts(\s|$)/i.test(text)) {
            const args = text.trim().split(/\s+/);
            const hasArgs = args.length > 1;
            if (!isTimeDialogOpen()) {
                if (!hasArgs) return editHook._prev ? editHook._prev.apply(this, arguments) : undefined; // справка без изменений
                notify('{999999}FKONST /ts — {EE4444}сначала открой диалог: /c 60');
                console.log('[TS-EDIT] ⚠️ /ts заблокирован: диалог "Точное время" не открыт (/c 60)');
                return; // НЕ отправляем на сервер и не меняем время
            }
            window._tsEditMode = !window._tsEditMode; // /ts переключает режим правки
            notify(window._tsEditMode
                ? '{999999}FKONST /ts — {33DD77}правка ВКЛ: клик по дате / дню недели / времени в диалоге'
                : '{999999}FKONST /ts — {EE4444}правка ВЫКЛ');
            return editHook._prev ? editHook._prev.apply(this, arguments) : undefined; // /ts-блок применит аргументы
        }
        return editHook._prev ? editHook._prev.apply(this, arguments) : undefined;
    };
    editHook._prev = null;
    editHook.__tsEditHook = true;
    function install() {
        const cur = window.sendChatInput;
        if (cur === editHook) return true;
        if (!(typeof cur === 'function' && '_prev' in cur && !cur.__tsEditHook)) return false;
        editHook._prev = cur;
        window.sendChatInput = editHook;
        console.log('[TS-EDIT] хук sendChatInput установлен (гейт /ts + правка кликом)');
        return true;
    }
    if (!install()) {
        const p = setInterval(() => { if (install()) clearInterval(p); }, 100);
        setTimeout(() => clearInterval(p), 60000);
    }

    console.log('════════════════════════════════════════════════');
    console.log('[TS-EDIT] /ts работает ТОЛЬКО при открытом диалоге /c 60');
    console.log('[TS-EDIT] клик по "Сегодняшняя дата:"  → ввод даты');
    console.log('[TS-EDIT] клик по "День недели:"       → +1 день за клик');
    console.log('[TS-EDIT] клик по "Текущее время:"     → ввод времени');
    console.log('════════════════════════════════════════════════');
})();
// ================================================================
// [FKONST TS-PLAYTIME v3] — вставить в самый низ файла (старый удалить!)
// Инлайн-правка строк "Время в игре ..." в диалоге /c 60 (режим /ts):
//   клик по токену (цифра или ч/мин) → стирается цифра → набор → Enter
//   Backspace = стереть символ, Escape / клик мимо = отмена
//   Лимиты: минуты 0–59, часы 0–23 (иначе значение не применяется)
//   Формат вывода всегда с пробелами: "1 ч 33 мин" / "30 мин"
//   Сброс: консоль → _tsPtReset()
// ================================================================
(function () {
    if (window.__fkPt3Loaded) return;
    window.__fkPt3Loaded = true;

    if (!window._tsPlaytime) window._tsPlaytime = { hour: null, today: { h: null, m: null }, yesterday: { h: null, m: null } };
    window._tsPtReset = () => {
        window._tsPlaytime = { hour: null, today: { h: null, m: null }, yesterday: { h: null, m: null } };
        console.log('[TS-PT] сохранённые значения времени в игре сброшены');
    };

    const LIMITS = { h: 23, m: 59 };                 // часы 0–23, минуты 0–59
    const fmtH  = v => `${v} ч`;
    const fmtM  = v => `${v} мин`;
    const fmtHM = (h, m) => `${h} ч ${m} мин`;       // ВСЕГДА с пробелами

    (function () {
        if (document.getElementById('fk-pt-css')) return;
        const st = document.createElement('style');
        st.id = 'fk-pt-css';
        st.textContent = '.fk-ts-ed{cursor:pointer;} .fk-ts-ed:hover{text-decoration:underline;}';
        document.head.appendChild(st);
    })();

    let ed = null;
    let pendingSwallow = null;

    function getTimeDialog() {
        try {
            const dlg = window.currentDialog && window.currentDialog();
            if (dlg && typeof dlg.stringParam === 'string' && dlg.stringParam.includes('Текущее время:')) return dlg;
        } catch (_) {}
        return null;
    }

    function store(field, part, val) {
        const pt = window._tsPlaytime;
        val = Math.max(0, Math.min(LIMITS[part], val));
        if (field === 'hour') pt.hour = val;
        else { pt[field] = pt[field] || { h: null, m: null }; pt[field][part] = val; }
    }

    // ── Подстановка сохранённых значений в тело диалога при открытии ──
    function applyPlaytimeToBody(body) {
        const pt = window._tsPlaytime;
        if (!pt || typeof body !== 'string') return body;
        const COL = '(?:<t>)*(?:\\{[0-9A-Fa-f]{6,8}\\})?';
        let out = body;
        if (pt.hour !== null && pt.hour !== undefined)
            out = out.replace(new RegExp('(Время в игре за час:' + COL + ')\\s*\\d+\\s*мин'),
                (m, p) => p + fmtM(pt.hour));
        [['сегодня', 'today'], ['вчера', 'yesterday']].forEach(pair => {
            const v = pt[pair[1]];
            if (!v) return;
            const hasH = v.h !== null && v.h !== undefined;
            const hasM = v.m !== null && v.m !== undefined;
            if (!hasH && !hasM) return;
            out = out.replace(new RegExp('(Время в игре ' + pair[0] + ':' + COL + ')\\s*\\d+\\s*ч\\s*\\d+\\s*мин'),
                (m, p, ch, cm) => p + fmtHM(hasH ? v.h : +ch, hasM ? v.m : +cm));
        });
        return out;
    }
    function installAppPatch() {
        if (!window.App || typeof window.App.addDialogInQueue !== 'function') return false;
        if (window.App.__fkPt3Patched) return true;
        const orig = window.App.addDialogInQueue;
        window.App.addDialogInQueue = function (dialogData, body, priority) {
            try {
                if (typeof body === 'string' && body.includes('Текущее время:')) body = applyPlaytimeToBody(body);
            } catch (_) {}
            return orig.call(this, dialogData, body, priority);
        };
        window.App.__fkPt3Patched = true;
        return true;
    }
    if (!installAppPatch()) {
        const p = setInterval(() => { if (installAppPatch()) clearInterval(p); }, 200);
        setTimeout(() => clearInterval(p), 60000);
    }

    // ── Обёртка токенов в кликабельные span ──
    function wrap(dlg) {
        if (!dlg || !dlg.$el || ed) return;
        if (dlg.$el.querySelector('.fk-ts-ed')) return;
        let found = 0;
        dlg.$el.querySelectorAll('.window-text__item').forEach(row => {
            const cols = row.querySelectorAll('.window-text__item-col');
            if (cols.length < 2) return;
            const label = (cols[0].textContent || '').trim();
            const val = cols[cols.length - 1];
            const cm = val.innerHTML.match(/#([0-9A-Fa-f]{6,8})/);
            const color = cm ? cm[1] : 'FF7000';
            let m;
            if (label.indexOf('Время в игре за час') === 0) {
                m = val.textContent.match(/(\d+)\s*мин/);
                if (m) { val.innerHTML = `<p style="color: #${color}"><span class="fk-ts-ed" data-f="hour" data-p="m" data-u=" мин">${fmtM(+m[1])}</span></p>`; found++; }
            } else if (label.indexOf('Время в игре сегодня') === 0 || label.indexOf('Время в игре вчера') === 0) {
                const f = label.indexOf('сегодня') !== -1 ? 'today' : 'yesterday';
                m = val.textContent.match(/(\d+)\s*ч\s*(\d+)\s*мин/);
                if (m) {
                    val.innerHTML = `<p style="color: #${color}"><span class="fk-ts-ed" data-f="${f}" data-p="h" data-u=" ч">${fmtH(+m[1])}</span> <span class="fk-ts-ed" data-f="${f}" data-p="m" data-u=" мин">${fmtM(+m[2])}</span></p>`;
                    found++;
                }
            }
        });
        if (found) console.log(`[TS-PT] зоны правки готовы: ${found} (клик → набор → Enter)`);
    }
    setInterval(() => {
        const dlg = getTimeDialog();
        if (!dlg || !window._tsEditMode) { if (ed) cancelEdit(); return; }
        wrap(dlg);
    }, 300);

    // ── Инлайн-правка ──
    function startEdit(span) {
        if (ed) cancelEdit();
        ed = {
            span, field: span.dataset.f, part: span.dataset.p,
            unit: span.dataset.u || (span.dataset.p === 'h' ? ' ч' : ' мин'),
            buffer: '', orig: span.textContent
        };
        span.textContent = ed.unit;                  // стирается ТОЛЬКО цифра
        span.style.textDecoration = 'underline';
        console.log(`[TS-PT] правка ${ed.field}/${ed.part}: набери число и нажми Enter`);
    }
    function render() { if (ed) ed.span.textContent = ed.buffer + ed.unit; }
    function cancelEdit() {
        if (!ed) return;
        ed.span.textContent = ed.orig;
        ed.span.style.textDecoration = '';
        ed = null;
    }
    function commitEdit() {
        if (!ed) return;
        const span = ed.span;
        span.style.textDecoration = '';
        const v = parseInt(ed.buffer, 10);
        if (!ed.buffer.length || isNaN(v)) { span.textContent = ed.orig; ed = null; return; }
        const max = LIMITS[ed.part];
        if (v < 0 || v > max) {
            console.log(`[TS-PT] ⚠️ недопустимо: ${ed.part === 'h' ? 'часы 0–23' : 'минуты 0–59'} (введено ${v}) — значение не изменено`);
            span.textContent = ed.orig;
            ed = null;
            return;
        }
        span.textContent = ed.part === 'h' ? fmtH(v) : fmtM(v);
        store(ed.field, ed.part, v);
        console.log(`[TS-PT] ✅ сохранено: ${ed.field}/${ed.part} = ${v}`);
        ed = null;
    }

    document.addEventListener('click', (e) => {
        const onSpan = e.target && e.target.closest ? e.target.closest('.fk-ts-ed') : null;
        if (ed && !onSpan) { cancelEdit(); return; }
        if (!window._tsEditMode) return;
        if (!onSpan) return;
        e.preventDefault();
        e.stopPropagation();
        startEdit(onSpan);
    }, true);

    // ── Клавиатура: цифры / Backspace / Enter / Escape ──
    function digitOf(e) {
        if (/^\d$/.test(e.key || '')) return e.key;
        const c = e.keyCode;
        if (c >= 48 && c <= 57) return String(c - 48);
        if (c >= 96 && c <= 105) return String(c - 96);
        return null;
    }
    document.addEventListener('keydown', (e) => {
        if (!ed) return;
        let handled = true;
        const d = digitOf(e);
        if (d !== null) { if (ed.buffer.length < 3) { ed.buffer += d; render(); } }
        else if (e.key === 'Backspace' || e.keyCode === 8) { ed.buffer = ed.buffer.slice(0, -1); render(); }
        else if (e.key === 'Enter' || e.keyCode === 13) { pendingSwallow = 'Enter'; commitEdit(); }
        else if (e.key === 'Escape' || e.keyCode === 27) { pendingSwallow = 'Escape'; cancelEdit(); }
        else handled = false;
        if (handled) { e.preventDefault(); e.stopImmediatePropagation(); }
    }, true);
    document.addEventListener('keyup', (e) => {
        const active = ed !== null;
        const sw = pendingSwallow !== null && (pendingSwallow === e.key ||
            (pendingSwallow === 'Enter' && e.keyCode === 13) || (pendingSwallow === 'Escape' && e.keyCode === 27));
        if (sw) pendingSwallow = null;
        if (!active && !sw) return;
        e.preventDefault();
        e.stopImmediatePropagation();
    }, true);

    console.log('[TS-PT] v3: формат с пробелами ("1 ч 33 мин"), лимиты: минуты 0–59, часы 0–23');
})();
