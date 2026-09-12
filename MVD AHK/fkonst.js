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
// [FKONST TS v5] — единый модуль синхронизации времени
// /ts           → открывает диалог «Точное время» (/c 60)
// /ts reset     → полный сброс (оффсет, время в игре)
// В диалоге «Точное время»:
//   клик «Текущее время:»  → часы (набор) → Enter/клик → минуты → Enter
//   клик «Время в игре ...»→ правка токена (набор) → Enter; >23ч/>59мин — без изменений
//   клик «Сегодняшняя дата:» → ввод даты (ДД.ММ.ГГГГ или «11 сентября 2026»)
//   клик «День недели:»    → +1 день за клик
//   клик по ЗАГОЛОВКУ      → полный сброс
//   Escape                 → отмена текущего ввода
// ================================================================
(function () {
    if (window.__fkTsLoaded) return;
    window.__fkTsLoaded = true;

    // ── Константы ──────────────────────────────────────────────────
    const MONTHS   = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
    const WEEKDAYS = ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'];
    const p2       = n => String(n).padStart(2, '0');
    const NB       = '\u00A0';
    const LIMITS   = { h: 23, m: 59 };
    const MARK     = 'Текущее время:';
    const MONTHS_RE = MONTHS.join('|');

    // ── Состояние ──────────────────────────────────────────────────
    if (window._tsOffset      === undefined) window._tsOffset      = 0;
    if (!window._tsPlaytime)   window._tsPlaytime   = { hour: null, today: { h: null, m: null }, yesterday: { h: null, m: null } };
    if (!window._tsPtServerOrig) window._tsPtServerOrig = null;

    let stage = null, buf = '', committedH = 0, origH = 0, origM = 0;
    let ptEd  = null, pendingSwallow = null;

    // ── CSS ────────────────────────────────────────────────────────
    if (!document.getElementById('fk-ts-css')) {
        const st = document.createElement('style');
        st.id = 'fk-ts-css';
        st.textContent = '.fk-ts-ed,[data-tse]{cursor:pointer;}';
        document.head.appendChild(st);
    }

    // ════════════════════ ЧАТ ══════════════════════════════════════
    function getChat() {
        try {
            const hud  = window.interface && window.interface('Hud');
            const chat = hud && hud.$refs && hud.$refs.chat;
            return (chat && Array.isArray(chat.messages)) ? chat : null;
        } catch (_) { return null; }
    }
    function ensureOrig(chat) {
        for (const m of chat.messages)
            if (m && typeof m.time === 'number' && m._tsOrig === undefined) m._tsOrig = m.time;
    }
    function applyChatOffset(off) {
        const chat = getChat(); if (!chat) return;
        ensureOrig(chat);
        for (const m of chat.messages)
            if (m && m._tsOrig !== undefined) m.time = m._tsOrig + off;
    }
    function patchChatAdd(chat) {
        if (!chat || chat._fkTsPatchedAdd) return;
        const origAdd = chat.add; if (typeof origAdd !== 'function') return;
        chat.add = function (...args) {
            const r = origAdd.apply(this, args);
            const off = window._tsOffset || 0;
            if (off) { ensureOrig(this); for (const m of this.messages) if (m && m._tsOrig !== undefined) m.time = m._tsOrig + off; }
            return r;
        };
        chat._fkTsPatchedAdd = true;
    }

    // ── notify ─────────────────────────────────────────────────────
    function notify(text) {
        if (typeof window.onChatMessage !== 'function') return;
        window.onChatMessage(text, '999999FF');
        setTimeout(() => {
            try {
                const chat = getChat(); if (!chat) return;
                chat.messages = chat.messages.filter(m =>
                    !m.content || !m.content.some(c => c.text && c.text.includes('FKONST /ts')));
            } catch (_) {}
        }, 3000);
    }

    // ════════════════════ ОФФСЕТ ════════════════════════════════════
    function fakeNow() { return new Date(Date.now() + (window._tsOffset || 0)); }

    function applyOffset(newOff) {
        window._tsOffset = newOff;
        applyChatOffset(newOff);
        refreshDialogDom();
        console.log(`[TS] оффсет ${newOff} мс → ${fakeNow().toLocaleString('ru-RU')}`);
    }

    function resetAll() {
        window._tsOffset  = 0;
        applyChatOffset(0);
        window._tsPlaytime = { hour: null, today: { h: null, m: null }, yesterday: { h: null, m: null } };
        if (stage) cancelStage();
        if (ptEd)  cancelPt();
        const dlg = getTimeDialog();
        if (dlg && dlg.$el) {
            dlg.$el.querySelectorAll('.fk-ts-ed').forEach(sp => { sp.textContent = sp.dataset.orig; sp.style.textDecoration = ''; });
            const f = new Date();
            setRowHtml(dlg, 'Сегодняшняя дата:', `<p style="color:#66CC00">${f.getDate()} ${MONTHS[f.getMonth()]} ${f.getFullYear()} г.</p>`);
            setRowHtml(dlg, 'День недели:',       `<p style="color:#66CC00">${WEEKDAYS[f.getDay()]}</p>`);
            const row = findRow(dlg, MARK);
            if (row) { const v = valCol(row); if (v) v.innerHTML = `<p style="color:#3399FF">${p2(f.getHours())}:${p2(f.getMinutes())}</p>`; }
            wrapTimeRow(dlg);
        }
        notify('{999999}FKONST /ts — {EE4444}сброшено на реальное время');
        console.log('[TS] ♻️ ПОЛНЫЙ СБРОС');
    }

    // ════════════════════ ДИАЛОГ ════════════════════════════════════
    function getTimeDialog() {
        try {
            const dlg = window.currentDialog && window.currentDialog();
            if (dlg && typeof dlg.stringParam === 'string' && dlg.stringParam.includes(MARK)) return dlg;
        } catch (_) {}
        return null;
    }
    function findRow(dlg, label) {
        if (!dlg || !dlg.$el) return null;
        for (const row of dlg.$el.querySelectorAll('.window-text__item')) {
            const cols = row.querySelectorAll('.window-text__item-col');
            if (cols.length >= 2 && (cols[0].textContent || '').trim().indexOf(label) === 0) return row;
        }
        return null;
    }
    function valCol(row)                  { const c = row.querySelectorAll('.window-text__item-col'); return c.length ? c[c.length - 1] : null; }
    function setRowHtml(dlg, label, html) { const r = findRow(dlg, label); if (r) { const v = valCol(r); if (v) v.innerHTML = html; } }

    function refreshDialogDom() {
        const dlg = getTimeDialog(); if (!dlg || !dlg.$el) return;
        const f = fakeNow();
        setRowHtml(dlg, 'Сегодняшняя дата:', `<p style="color:#66CC00">${f.getDate()} ${MONTHS[f.getMonth()]} ${f.getFullYear()} г.</p>`);
        setRowHtml(dlg, 'День недели:',       `<p style="color:#66CC00">${WEEKDAYS[f.getDay()]}</p>`);
        const row = findRow(dlg, MARK);
        if (row) { const v = valCol(row); if (v) v.innerHTML = `<p style="color:#3399FF">${p2(f.getHours())}:${p2(f.getMinutes())}</p>`; }
        wrapTimeRow(dlg);
    }

    // ── Подмена времени/даты/дня в теле диалога /c 60 ──────────────
    function shiftTimeBody(body) {
        const off = window._tsOffset || 0;
        if (!off || typeof body !== 'string') return body;
        const now     = new Date(Date.now() + off);
        const hh      = p2(now.getHours()), mm = p2(now.getMinutes());
        const dateStr = `${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()} г.`;
        const weekday = WEEKDAYS[now.getDay()];
        let out = body;
        out = out.replace(/(Текущее время:(?:<t>)*(?:\{[0-9A-Fa-f]{6,8}\})?) *\d{1,2}:\d{2}/,          (_, p) => p + hh + ':' + mm);
        out = out.replace(/(Сегодняшняя дата:(?:<t>)*(?:\{[0-9A-Fa-f]{6,8}\})?) *\d{1,2} +[а-яё]+ +\d{4} +г\./, (_, p) => p + dateStr);
        out = out.replace(/(День недели:(?:<t>)*(?:\{[0-9A-Fa-f]{6,8}\})?) *[А-Яа-яё]+/,               (_, p) => p + weekday);
        return out;
    }

    // ── Подстановка сохранённых значений playtime ──────────────────
    function applyPlaytimeToBody(body) {
        const pt = window._tsPlaytime;
        if (!pt || typeof body !== 'string') return body;
        const COL = '(?:<t>)*(?:\\{[0-9A-Fa-f]{6,8}\\})?';
        let out = body;
        if (pt.hour !== null && pt.hour !== undefined)
            out = out.replace(new RegExp('(Время в игре за час:' + COL + ')\\s*\\d+\\s*мин'), (m, p) => p + pt.hour + ' мин');
        [['сегодня','today'],['вчера','yesterday']].forEach(([key, field]) => {
            const v = pt[field]; if (!v) return;
            const hasH = v.h !== null && v.h !== undefined, hasM = v.m !== null && v.m !== undefined;
            if (!hasH && !hasM) return;
            out = out.replace(new RegExp('(Время в игре ' + key + ':' + COL + ')\\s*(\\d+)\\s*ч\\s*(\\d+)\\s*мин'),
                (m, p, ch, cm) => p + (hasH ? v.h : +ch) + ' ч ' + (hasM ? v.m : +cm) + ' мин');
        });
        return out;
    }

    // ── Патч App.addDialogInQueue (время + playtime) ───────────────
    function installAppPatch() {
        if (!window.App || typeof window.App.addDialogInQueue !== 'function') return false;
        if (window.App.__fkTsPatched) return true;
        const orig = window.App.addDialogInQueue;
        window.App.addDialogInQueue = function (dialogData, body, priority) {
            try {
                if (typeof body === 'string' && body.includes(MARK)) {
                    const oh = body.match(/Время в игре за час:(?:<t>)*(?:\{[0-9A-Fa-f]{6,8}\})?\s*(\d+)\s*мин/);
                    const ot = body.match(/Время в игре сегодня:(?:<t>)*(?:\{[0-9A-Fa-f]{6,8}\})?\s*(\d+)\s*ч\s*(\d+)\s*мин/);
                    const oy = body.match(/Время в игре вчера:(?:<t>)*(?:\{[0-9A-Fa-f]{6,8}\})?\s*(\d+)\s*ч\s*(\d+)\s*мин/);
                    window._tsPtServerOrig = {
                        hour:      oh ? +oh[1]                   : null,
                        today:     ot ? { h: +ot[1], m: +ot[2] } : null,
                        yesterday: oy ? { h: +oy[1], m: +oy[2] } : null
                    };
                    body = applyPlaytimeToBody(shiftTimeBody(body));
                }
            } catch (_) {}
            return orig.call(this, dialogData, body, priority);
        };
        window.App.__fkTsPatched = true;
        return true;
    }

    // ════════════════════ GAMETEXT ══════════════════════════════════
    function shiftGameTextPayload(raw) {
        const off = window._tsOffset || 0;
        if (!off || typeof raw !== 'string') return raw;
        let t; try { t = JSON.parse(raw); } catch (_) { return raw; }
        if (!Array.isArray(t) || typeof t[1] !== 'string') return raw;
        const realMs = Date.now(), real = new Date(realMs), fake = new Date(realMs + off);
        let text = t[1];
        text = text.replace(/(\d{1,2}):(\d{2})(?::(\d{2}))?/g, (m, h, mi, s) => {
            const H = +h, M = +mi, S = s ? +s : 0;
            if (H > 23 || M > 59 || S > 59) return m;
            const d = new Date(realMs); d.setHours(H, M, S, 0);
            if (Math.abs(d.getTime() - realMs) > 120000) return m;
            return s ? `${p2(fake.getHours())}:${p2(fake.getMinutes())}:${p2(fake.getSeconds())}` : `${p2(fake.getHours())}:${p2(fake.getMinutes())}`;
        });
        text = text.replace(/(\d{1,2})\.(\d{1,2})\.(\d{4})/g, (m, d, mo, y) => {
            if (+d !== real.getDate() || +mo !== real.getMonth() + 1 || +y !== real.getFullYear()) return m;
            return `${p2(fake.getDate())}.${p2(fake.getMonth() + 1)}.${fake.getFullYear()}`;
        });
        text = text.replace(new RegExp(`(\\d{1,2})\\s+(${MONTHS_RE})\\s+(\\d{4})`, 'g'), (m, d, mo, y) => {
            const idx = MONTHS.indexOf(mo);
            if (idx < 0 || +d !== real.getDate() || idx !== real.getMonth() || +y !== real.getFullYear()) return m;
            return `${fake.getDate()} ${MONTHS[fake.getMonth()]} ${fake.getFullYear()}`;
        });
        if (text === t[1]) return raw;
        t[1] = text; return JSON.stringify(t);
    }
    function patchGameText(gt) {
        if (!gt || gt.__fkTsGtPatched) return;
        const orig = gt.add; if (typeof orig !== 'function') return;
        gt.add = function (e) { try { e = shiftGameTextPayload(e); } catch (_) {} return orig.call(this, e); };
        gt.__fkTsGtPatched = true;
        console.log('[TS] GameText.add перехвачен');
    }

    // ════════════════════ ПРАВКА SPAN-ОВ «ТЕКУЩЕЕ ВРЕМЯ» ═══════════
    function wrapTimeRow(dlg) {
        const row = findRow(dlg, MARK); if (!row) return;
        const val = valCol(row); if (!val || val.querySelector('[data-tse]')) return;
        const m = val.textContent.match(/(\d{1,2}):(\d{2})/); if (!m) return;
        const color = (val.innerHTML.match(/#([0-9A-Fa-f]{6,8})/) || [])[1] || '3399FF';
        val.innerHTML = `<p style="color:#${color}"><span data-tse="h">${p2(+m[1])}:</span><span data-tse="m">${p2(+m[2])}</span></p>`;
    }
    function timeSpans(dlg) {
        const row = findRow(dlg, MARK); if (!row) return null;
        const val = valCol(row);        if (!val) return null;
        return { h: val.querySelector('[data-tse="h"]'), m: val.querySelector('[data-tse="m"]') };
    }
    function startH(dlg) {
        const s = timeSpans(dlg); if (!s || !s.h || !s.m) return;
        origH = parseInt(s.h.textContent, 10) || 0; origM = parseInt(s.m.textContent, 10) || 0;
        stage = 'h'; buf = '';
        s.h.textContent = ':'; s.h.style.textDecoration = 'underline'; s.m.style.textDecoration = '';
    }
    function commitH() { const v = parseInt(buf, 10); committedH = (buf.length && !isNaN(v) && v <= 23) ? v : origH; }
    function startM(dlg) {
        const s = timeSpans(dlg); if (!s || !s.h || !s.m) return;
        stage = 'm'; buf = '';
        s.h.textContent = p2(committedH) + ':'; s.h.style.textDecoration = '';
        s.m.textContent = '';               s.m.style.textDecoration = 'underline';
    }
    function renderStage() {
        const s = timeSpans(getTimeDialog()); if (!s) return;
        if (stage === 'h') s.h.textContent = buf + ':';
        else if (stage === 'm') s.m.textContent = buf;
    }
    function cancelStage() {
        const s = timeSpans(getTimeDialog());
        if (s && s.h && s.m) { s.h.textContent = p2(origH) + ':'; s.m.textContent = p2(origM); s.h.style.textDecoration = ''; s.m.style.textDecoration = ''; }
        stage = null; buf = '';
    }
    function saveM() {
        const v = parseInt(buf, 10);
        const M = (buf.length && !isNaN(v) && v <= 59) ? v : origM;
        const f = fakeNow(); f.setHours(committedH, M, f.getSeconds(), 0);
        stage = null; applyOffset(f.getTime() - Date.now());
    }

    // ════════════════════ ПРАВКА SPAN-ОВ «ВРЕМЯ В ИГРЕ» ════════════
    function spanText(sp, num) { return (sp.dataset.nb ? NB : '') + num + sp.dataset.u; }
    function wrapPlaytimeRows(dlg) {
        const so = window._tsPtServerOrig;
        [['Время в игре за час:','hour'],['Время в игре сегодня:','today'],['Время в игре вчера:','yesterday']].forEach(([label, field]) => {
            const row = findRow(dlg, label); if (!row) return;
            const val = valCol(row);          if (!val || val.querySelector('.fk-ts-ed')) return;
            const color = (val.innerHTML.match(/#([0-9A-Fa-f]{6,8})/) || [])[1] || 'FF7000';
            const txt   = val.textContent; let html = '';
            if (field === 'hour') {
                const m = txt.match(/(\d+)\s*мин/); if (!m) return;
                const oh = (so && so.hour !== null && so.hour !== undefined) ? so.hour : m[1];
                html = `<span class="fk-ts-ed" data-f="hour" data-p="m" data-u=" мин" data-orig="${oh} мин">${m[1]} мин</span>`;
            } else {
                const m = txt.match(/(\d+)\s*ч\s*(\d+)\s*мин/); if (!m) return;
                const sv = (so && so[field]) ? so[field] : { h: m[1], m: m[2] };
                html = `<span class="fk-ts-ed" data-f="${field}" data-p="h" data-u=" ч" data-orig="${sv.h} ч">${m[1]} ч</span>` +
                       `<span class="fk-ts-ed" data-f="${field}" data-p="m" data-u=" мин" data-nb="1" data-orig="${NB}${sv.m} мин">${NB}${m[2]} мин</span>`;
            }
            val.innerHTML = `<p style="color:#${color}">${html}</p>`;
        });
    }
    function startPt(span) {
        if (ptEd) cancelPt();
        ptEd = { span, field: span.dataset.f, part: span.dataset.p, buffer: '', orig: span.textContent };
        span.textContent = spanText(span, ''); span.style.textDecoration = 'underline';
    }
    function renderPt()  { if (ptEd) ptEd.span.textContent = spanText(ptEd.span, ptEd.buffer); }
    function cancelPt()  { if (!ptEd) return; ptEd.span.textContent = ptEd.orig; ptEd.span.style.textDecoration = ''; ptEd = null; }
    function commitPt()  {
        if (!ptEd) return;
        const span = ptEd.span; span.style.textDecoration = '';
        const v    = parseInt(ptEd.buffer, 10);
        if (!ptEd.buffer.length || isNaN(v)) { span.textContent = ptEd.orig; ptEd = null; return; }
        if (v < 0 || v > LIMITS[ptEd.part]) {
            console.log(`[TS] ⚠️ недопустимо: ${ptEd.part === 'h' ? 'часы 0–23' : 'минуты 0–59'} (введено ${v})`);
            span.textContent = ptEd.orig; ptEd = null; return;
        }
        span.textContent = spanText(span, v);
        const pt = window._tsPlaytime;
        if (ptEd.field === 'hour') pt.hour = v;
        else { pt[ptEd.field] = pt[ptEd.field] || { h: null, m: null }; pt[ptEd.field][ptEd.part] = v; }
        console.log(`[TS] ✅ время в игре: ${ptEd.field}/${ptEd.part} = ${v}`);
        ptEd = null;
    }

    // ════════════════════ СОБЫТИЯ ════════════════════════════════════
    function digitOf(e) {
        if (/^\d$/.test(e.key || '')) return e.key;
        const c = e.keyCode;
        if (c >= 48 && c <= 57) return String(c - 48);
        if (c >= 96 && c <= 105) return String(c - 96);
        return null;
    }

    document.addEventListener('click', (e) => {
        const closest = sel => (e.target && e.target.closest) ? e.target.closest(sel) : null;
        const dlg = getTimeDialog();

        // Заголовок → полный сброс
        const title = closest('.modal__title');
        if (title && dlg && /Точное время/.test(title.textContent || '')) {
            e.preventDefault(); e.stopPropagation(); resetAll(); return;
        }
        if (!dlg) return;

        // Спан «Текущее время» (часы/минуты)
        const tspan = closest('[data-tse]');
        if (tspan) {
            e.preventDefault(); e.stopPropagation();
            if (ptEd) cancelPt();
            if (!stage) startH(dlg); else if (stage === 'h') { commitH(); startM(dlg); }
            return;
        }

        // Спан «Время в игре»
        const pspan = closest('.fk-ts-ed');
        if (pspan) {
            e.preventDefault(); e.stopPropagation();
            if (stage) cancelStage(); startPt(pspan); return;
        }

        // Строки даты / дня недели
        const row = closest('.window-text__item');
        if (row) {
            const cols  = row.querySelectorAll('.window-text__item-col');
            const label = cols.length >= 2 ? (cols[0].textContent || '').trim() : '';
            if (label.indexOf('Сегодняшняя дата:') === 0) {
                e.preventDefault(); e.stopPropagation();
                const f   = fakeNow();
                const inp = prompt('Новая дата (ДД.ММ.ГГГГ или "11 сентября 2026"):', `${p2(f.getDate())}.${p2(f.getMonth() + 1)}.${f.getFullYear()}`);
                if (inp !== null) {
                    let d, mo, y;
                    let m = inp.trim().match(/^(\d{1,2})[.\/](\d{1,2})[.\/](\d{4})$/);
                    if (m) { d = +m[1]; mo = +m[2] - 1; y = +m[3]; }
                    else {
                        m = inp.trim().replace(/г\.?$/i, '').match(/^(\d{1,2})\s+([а-яё]+)\s+(\d{4})$/);
                        if (m) { d = +m[1]; mo = MONTHS.indexOf(m[2]); y = +m[3]; }
                    }
                    if (m && d >= 1 && d <= 31 && mo >= 0 && mo <= 11) { const f2 = fakeNow(); f2.setFullYear(y, mo, d); applyOffset(f2.getTime() - Date.now()); }
                }
                return;
            }
            if (label.indexOf('День недели:') === 0) {
                e.preventDefault(); e.stopPropagation();
                const f = fakeNow(); f.setDate(f.getDate() + 1); applyOffset(f.getTime() - Date.now()); return;
            }
        }
        if (stage) cancelStage();
        if (ptEd)  cancelPt();
    }, true);

    document.addEventListener('keydown', (e) => {
        if (!stage && !ptEd) return;
        let handled = true;
        const d = digitOf(e);
        if (stage) {
            if (d !== null)                              { if (buf.length < 2) { buf += d; renderStage(); } }
            else if (e.key === 'Backspace' || e.keyCode === 8)  { buf = buf.slice(0, -1); renderStage(); }
            else if (e.key === 'Enter'    || e.keyCode === 13)  { pendingSwallow = 'Enter';  if (stage === 'h') { commitH(); startM(getTimeDialog()); } else saveM(); }
            else if (e.key === 'Escape'   || e.keyCode === 27)  { pendingSwallow = 'Escape'; cancelStage(); }
            else handled = false;
        } else {
            if (d !== null)                              { if (ptEd.buffer.length < 3) { ptEd.buffer += d; renderPt(); } }
            else if (e.key === 'Backspace' || e.keyCode === 8)  { ptEd.buffer = ptEd.buffer.slice(0, -1); renderPt(); }
            else if (e.key === 'Enter'    || e.keyCode === 13)  { pendingSwallow = 'Enter';  commitPt(); }
            else if (e.key === 'Escape'   || e.keyCode === 27)  { pendingSwallow = 'Escape'; cancelPt();  }
            else handled = false;
        }
        if (handled) { e.preventDefault(); e.stopImmediatePropagation(); }
    }, true);

    document.addEventListener('keyup', (e) => {
        const active = stage !== null || ptEd !== null;
        const sw = pendingSwallow !== null && (pendingSwallow === e.key ||
            (pendingSwallow === 'Enter' && e.keyCode === 13) || (pendingSwallow === 'Escape' && e.keyCode === 27));
        if (sw) pendingSwallow = null;
        if (!active && !sw) return;
        e.preventDefault(); e.stopImmediatePropagation();
    }, true);

    // ════════════════════ ПОЛЛИНГ ════════════════════════════════════
    setInterval(() => {
        // Диалог: поддерживаем span-обёртки
        const dlg = getTimeDialog();
        if (!dlg) { stage = null; ptEd = null; }
        else if (!stage && !ptEd) { wrapTimeRow(dlg); wrapPlaytimeRows(dlg); }
        // Чат: держим chat.add запатченным (пересоздания HUD и т.п.)
        const chat = getChat(); if (chat) patchChatAdd(chat);
        // GameText
        try { const gt = window.interface && window.interface('GameText'); if (gt) patchGameText(gt); } catch (_) {}
    }, 300);

    // App.addDialogInQueue
    if (!installAppPatch()) {
        const ap = setInterval(() => { if (installAppPatch()) clearInterval(ap); }, 200);
        setTimeout(() => clearInterval(ap), 60000);
    }

    // ════════════════════ ХУК sendChatInput ══════════════════════════
    // /ts → /c 60 (открывает диалог); /ts reset → полный сброс
    const hook = function (text) {
        if (typeof text === 'string' && /^\/ts(\s|$)/i.test(text)) {
            const arg = (text.trim().split(/\s+/)[1] || '').toLowerCase();
            if (arg === 'reset') { resetAll(); return; }
            console.log('[TS] /ts → /c 60');
            return hook._prev ? hook._prev.call(this, '/c 60') : undefined;
        }
        return hook._prev ? hook._prev.apply(this, arguments) : undefined;
    };
    hook._prev  = null;
    hook.__fkTsHook = true;

    function install() {
        const cur = window.sendChatInput;
        if (cur === hook) return true;
        if (typeof cur !== 'function') return false;
        hook._prev = cur;
        window.sendChatInput = hook;
        console.log('[TS] хук sendChatInput установлен');
        return true;
    }
    // Ждём готовности sendChatInputCustom (признак завершения fkonst init)
    const installPoll = setInterval(() => {
        if (typeof window.sendChatInputCustom === 'function' && install()) clearInterval(installPoll);
    }, 100);
    setTimeout(() => clearInterval(installPoll), 60000);

    console.log('[TS] v5 загружен: /ts → /c 60 | /ts reset → сброс | клик по времени в диалоге → правка');
})();
