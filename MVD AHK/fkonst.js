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
//   ФСИН Инспектор [№4]              2026-09-10 20:35:48  (Feo_Grande)
// ================================================================
const jskOptions = [
    { name: "Feo_Grande изменил должность {nick} на Инспектор [№4] в ФСИН<t>2026-09-10 20:35:48<n>", action: "jsk_view" },
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
// ================================================================
// [FKONST TS BLOCK] — единый блок синхронизации времени
// Активация: открой /c 60, затем зажми заголовок "Точное время" на 5 сек
//            → напишет сообщение в чат, включится режим редактирования
//            → после закрытия диалога режим сбрасывается; для новой правки — снова 5 сек
// В диалоге (когда редактирование активно):
//   клик по "Текущее время:"      → ЧЧ → Enter → ММ → Enter = сохранить
//   клик по "Время в игре ..."    → инлайн-правка цифры → Enter = сохранить
//   клик по "Сегодняшняя дата:"  → ввод даты (ДД.ММ.ГГГГ / "11 сентября 2026")
//   клик по "День недели:"        → +1 день за клик
//   клик по заголовку диалога     → ПОЛНЫЙ СБРОС
// GameText и диалог /c 60 тоже сдвигаются по _tsOffset.
// ================================================================
(function () {
    if (window.__tsMergedLoaded) return;
    window.__tsMergedLoaded = true;

    // ── Константы ──────────────────────────────────────────────────
    const MONTHS   = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
    const MONTHS_RE = MONTHS.join('|');
    const WEEKDAYS  = ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'];
    const p2 = n => String(n).padStart(2, '0');
    const NB = '\u00A0';
    const LIMITS = { h: 23, m: 59 };

    // ── Состояние ───────────────────────────────────────────────────
    if (window._tsOffset         === undefined) window._tsOffset         = 0;
    if (window._tsPendingTarget  === undefined) window._tsPendingTarget  = null;
    if (!window._tsPlaytime)    window._tsPlaytime    = { hour: null, today: { h: null, m: null }, yesterday: { h: null, m: null } };
    if (!window._tsPtServerOrig) window._tsPtServerOrig = null;

    let stage = null, buf = '', committedH = 0, origH = 0, origM = 0;
    let ptEd = null;
    let pendingSwallow = null;
    let _tsDialogViaTs    = false; // редактирование активировано долгим нажатием
    let _tsLongPressTimer = null;  // таймер долгого нажатия на заголовок
    let _tsLongPressFired = false; // долгое нажатие только что сработало — блокируем click

    // ── CSS ─────────────────────────────────────────────────────────
    (function () {
        if (document.getElementById('fk-ts4-css')) return;
        const st = document.createElement('style');
        st.id = 'fk-ts4-css';
        st.textContent = '.fk-ts-ed,[data-tse],[data-dse]{cursor:pointer;}';
        document.head.appendChild(st);
    })();

    // ── Хелперы диалога ─────────────────────────────────────────────
    function getTimeDialog() {
        try {
            const dlg = window.currentDialog && window.currentDialog();
            if (dlg && typeof dlg.stringParam === 'string' && dlg.stringParam.includes('Текущее время:')) return dlg;
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
    function valCol(row) { const c = row.querySelectorAll('.window-text__item-col'); return c.length ? c[c.length - 1] : null; }
    function setRowHtml(dlg, label, html) { const r = findRow(dlg, label); if (r) { const v = valCol(r); if (v) v.innerHTML = html; } }
    function fakeNow() { return new Date(Date.now() + (window._tsOffset || 0)); }
    function digitOf(e) {
        if (/^\d$/.test(e.key || '')) return e.key;
        const c = e.keyCode;
        if (c >= 48 && c <= 57) return String(c - 48);
        if (c >= 96 && c <= 105) return String(c - 96);
        return null;
    }
    function spanText(sp, num) { return (sp.dataset.nb ? NB : '') + num + sp.dataset.u; }

    // ── Применение оффсета к чату ────────────────────────────────────
    function reapplyChat(old, newOff) {
        try {
            const hud = window.interface && window.interface('Hud');
            const chat = hud && hud.$refs && hud.$refs.chat;
            if (!chat || !Array.isArray(chat.messages)) return;
            for (const m of chat.messages) {
                if (m && typeof m.time === 'number') {
                    if (m._tsOrig === undefined) m._tsOrig = m.time - old;
                    m.time = m._tsOrig + newOff;
                }
            }
        } catch (_) {}
    }

    // ── Обёртка span-ов "Текущее время:" ────────────────────────────
    function wrapTimeRow(dlg) {
        const row = findRow(dlg, 'Текущее время:');
        if (!row) return;
        const val = valCol(row);
        if (!val || val.querySelector('[data-tse]')) return;
        const m = val.textContent.match(/(\d{1,2}):(\d{2})/);
        if (!m) return;
        const color = (val.innerHTML.match(/#([0-9A-Fa-f]{6,8})/) || [])[1] || '3399FF';
        val.innerHTML = `<p style="color: #${color}"><span data-tse="h">${p2(+m[1])}:</span><span data-tse="m">${p2(+m[2])}</span></p>`;
    }

    // ── Обёртка span-ов "Сегодняшняя дата:" (день / месяц / год) ────
    function wrapDateRow(dlg) {
        const row = findRow(dlg, 'Сегодняшняя дата:');
        if (!row) return;
        const val = valCol(row);
        if (!val || val.querySelector('[data-dse]')) return;
        // \s* вместо \s+ — на случай если рендерер уже схлопнул пробелы
        const m = val.textContent.match(/(\d{1,2})\s*([а-яё]+)\s*(\d{4})/);
        if (!m) return;
        const color = (val.innerHTML.match(/#([0-9A-Fa-f]{6,8})/) || [])[1] || '66CC00';
        // NB внутри span-а — рендерер игры не схлопывает содержимое тега
        val.innerHTML = `<p style="color: #${color}"><span data-dse="d">${m[1]}${NB}</span><span data-dse="mo">${m[2]}${NB}</span><span data-dse="y">${m[3]}</span>${NB}г.</p>`;
    }

    // ── Перерисовка строк даты/времени/дня в открытом диалоге ───────
    function refreshTimeRows(dlg) {
        dlg = dlg || getTimeDialog();
        if (!dlg || !dlg.$el) return;
        const f = fakeNow();
        setRowHtml(dlg, 'Сегодняшняя дата:', `<p style="color: #66CC00">${f.getDate()} ${MONTHS[f.getMonth()]} ${f.getFullYear()} г.</p>`);
        setRowHtml(dlg, 'День недели:',       `<p style="color: #66CC00">${WEEKDAYS[f.getDay()]}</p>`);
        const row = findRow(dlg, 'Текущее время:');
        if (row) { const v = valCol(row); if (v) v.innerHTML = `<p style="color: #3399FF">${p2(f.getHours())}:${p2(f.getMinutes())}</p>`; }
        wrapTimeRow(dlg);
        wrapDateRow(dlg);  // восстанавливаем кликабельные span-ы даты
    }

    // ── Применить новый оффсет (чат + диалог) ───────────────────────
    function applyOffset(newOff) {
        const old = window._tsOffset || 0;
        window._tsOffset = newOff;
        reapplyChat(old, newOff);
        refreshTimeRows();
        console.log(`[TS] оффсет ${newOff} мс → фейк-время ${fakeNow().toLocaleString('ru-RU')}`);
    }

    // ── "Время в игре": обёртка кликабельных токенов ────────────────
    function wrapPlaytimeRows(dlg) {
        const so = window._tsPtServerOrig;
        [['Время в игре за час:', 'hour'], ['Время в игре сегодня:', 'today'], ['Время в игре вчера:', 'yesterday']].forEach(([label, field]) => {
            const row = findRow(dlg, label);
            if (!row) return;
            const val = valCol(row);
            if (!val || val.querySelector('.fk-ts-ed')) return;
            const color = (val.innerHTML.match(/#([0-9A-Fa-f]{6,8})/) || [])[1] || 'FF7000';
            const txt = val.textContent;
            let html = '';
            if (field === 'hour') {
                const m = txt.match(/(\d+)\s*мин/);
                if (!m) return;
                const oh = (so && so.hour !== null && so.hour !== undefined) ? so.hour : m[1];
                html = `<span class="fk-ts-ed" data-f="hour" data-p="m" data-u=" мин" data-orig="${oh} мин">${m[1]} мин</span>`;
            } else {
                const m = txt.match(/(\d+)\s*ч\s*(\d+)\s*мин/);
                if (!m) return;
                const sv = (so && so[field]) ? so[field] : { h: m[1], m: m[2] };
                html =
                    `<span class="fk-ts-ed" data-f="${field}" data-p="h"  data-u=" ч"   data-orig="${sv.h} ч">${m[1]} ч</span>` +
                    `<span class="fk-ts-ed" data-f="${field}" data-p="m"  data-u=" мин" data-nb="1" data-orig="${NB}${sv.m} мин">${NB}${m[2]} мин</span>`;
            }
            val.innerHTML = `<p style="color: #${color}">${html}</p>`;
        });
    }

    // ── "Время в игре": подстановка сохранённых значений в тело диалога ──
    function applyPlaytimeToBody(body) {
        const pt = window._tsPlaytime;
        if (!pt || typeof body !== 'string') return body;
        const COL = '(?:<t>)*(?:\\{[0-9A-Fa-f]{6,8}\\})?';
        let out = body;
        if (pt.hour !== null && pt.hour !== undefined)
            out = out.replace(new RegExp('(Время в игре за час:' + COL + ')\\s*\\d+\\s*мин'),
                (m, p) => p + pt.hour + ' мин');
        [['сегодня', 'today'], ['вчера', 'yesterday']].forEach(([word, field]) => {
            const v = pt[field];
            if (!v) return;
            const hasH = v.h !== null && v.h !== undefined;
            const hasM = v.m !== null && v.m !== undefined;
            if (!hasH && !hasM) return;
            out = out.replace(new RegExp('(Время в игре ' + word + ':' + COL + ')\\s*(\\d+)\\s*ч\\s*(\\d+)\\s*мин'),
                (m, p, ch, cm) => p + (hasH ? v.h : +ch) + ' ч ' + (hasM ? v.m : +cm) + ' мин');
        });
        return out;
    }

    // ── Подмена времени/даты в теле диалога /c 60 ───────────────────
    function shiftTimeBody(body, off) {
        if (!off || typeof body !== 'string') return body;
        const now = new Date(Date.now() + off);
        const hh  = p2(now.getHours()), mm = p2(now.getMinutes());
        const dateStr = `${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()} г.`;
        const weekday = WEEKDAYS[now.getDay()];
        let out = body;
        out = out.replace(/(Текущее время:(?:<t>)*(?:\{[0-9A-Fa-f]{6,8}\})?)\s*\d{1,2}:\d{2}/,
            (m, p) => p + hh + ':' + mm);
        out = out.replace(/(Сегодняшняя дата:(?:<t>)*(?:\{[0-9A-Fa-f]{6,8}\})?)\s*\d{1,2}\s+[а-яё]+\s+\d{4}\s+г\./,
            (m, p) => p + dateStr);
        out = out.replace(/(День недели:(?:<t>)*(?:\{[0-9A-Fa-f]{6,8}\})?)\s*[А-Яа-яё]+/,
            (m, p) => p + weekday);
        return out;
    }

    // ── GameText: подмена времени/даты ──────────────────────────────
    function shiftGameTextPayload(raw) {
        const off = window._tsOffset || 0;
        if (!off || typeof raw !== 'string') return raw;
        let t;
        try { t = JSON.parse(raw); } catch (_) { return raw; }
        if (!Array.isArray(t) || typeof t[1] !== 'string') return raw;
        const realMs = Date.now(), real = new Date(realMs), fake = new Date(realMs + off);
        let text = t[1];
        // Время ЧЧ:ММ или ЧЧ:ММ:СС (±2 мин от реального "сейчас")
        text = text.replace(/(\d{1,2}):(\d{2})(?::(\d{2}))?/g, (m, h, mi, s) => {
            const H = +h, M = +mi, S = s ? +s : 0;
            if (H > 23 || M > 59 || S > 59) return m;
            const d = new Date(realMs); d.setHours(H, M, S, 0);
            if (Math.abs(d.getTime() - realMs) > 120000) return m;
            return s
                ? `${p2(fake.getHours())}:${p2(fake.getMinutes())}:${p2(fake.getSeconds())}`
                : `${p2(fake.getHours())}:${p2(fake.getMinutes())}`;
        });
        // Дата ДД.ММ.ГГГГ (только реальное сегодня)
        text = text.replace(/(\d{1,2})\.(\d{1,2})\.(\d{4})/g, (m, d, mo, y) => {
            if (+d !== real.getDate() || +mo !== real.getMonth() + 1 || +y !== real.getFullYear()) return m;
            return `${p2(fake.getDate())}.${p2(fake.getMonth() + 1)}.${fake.getFullYear()}`;
        });
        // Дата "Д месяц ГГГГ" (только реальное сегодня)
        text = text.replace(new RegExp(`(\\d{1,2})\\s+(${MONTHS_RE})\\s+(\\d{4})`, 'g'), (m, d, mo, y) => {
            const idx = MONTHS.indexOf(mo);
            if (idx < 0 || +d !== real.getDate() || idx !== real.getMonth() || +y !== real.getFullYear()) return m;
            return `${fake.getDate()} ${MONTHS[fake.getMonth()]} ${fake.getFullYear()}`;
        });
        if (text === t[1]) return raw;
        t[1] = text;
        console.log(`[TS] время в gametext сдвинуто → ${text}`);
        return JSON.stringify(t);
    }
    function patchGT(gt) {
        if (!gt || gt.__tsMergedGtPatched) return;
        const orig = gt.add;
        if (typeof orig !== 'function') return;
        gt.add = function (e) {
            try { e = shiftGameTextPayload(e); } catch (_) {}
            return orig.call(this, e);
        };
        gt.__tsMergedGtPatched = true;
        console.log('[TS] GameText.add перехвачен для подмены времени');
    }
    setInterval(() => {
        try { const gt = window.interface && window.interface('GameText'); if (gt) patchGT(gt); } catch (_) {}
    }, 250);

    // ── Единый патч App.addDialogInQueue ────────────────────────────
    // Делает за раз:
    //   1. Сохраняет оригинальные значения "Время в игре" (для инлайн-правки)
    //   2. Подставляет сохранённые пользовательские значения "Время в игре"
    //   3. Сдвигает время/дату/день недели по _tsOffset
    function installAppPatch() {
        if (!window.App || typeof window.App.addDialogInQueue !== 'function') return false;
        if (window.App.__tsMergedPatched) return true;
        const orig = window.App.addDialogInQueue;
        window.App.addDialogInQueue = function (dialogData, body, priority) {
            try {
                if (typeof body === 'string' && body.includes('Текущее время:')) {
                    // 1. Сохранить оригиналы с сервера
                    const oh = body.match(/Время в игре за час:(?:<t>)*(?:\{[0-9A-Fa-f]{6,8}\})?\s*(\d+)\s*мин/);
                    const ot = body.match(/Время в игре сегодня:(?:<t>)*(?:\{[0-9A-Fa-f]{6,8}\})?\s*(\d+)\s*ч\s*(\d+)\s*мин/);
                    const oy = body.match(/Время в игре вчера:(?:<t>)*(?:\{[0-9A-Fa-f]{6,8}\})?\s*(\d+)\s*ч\s*(\d+)\s*мин/);
                    window._tsPtServerOrig = {
                        hour:      oh ? +oh[1] : null,
                        today:     ot ? { h: +ot[1], m: +ot[2] } : null,
                        yesterday: oy ? { h: +oy[1], m: +oy[2] } : null
                    };
                    // 2. Подставить сохранённые пользовательские значения
                    body = applyPlaytimeToBody(body);
                    // 3. Сдвинуть время/дату по оффсету
                    const off = window._tsOffset || 0;
                    if (off) {
                        const shifted = shiftTimeBody(body, off);
                        if (shifted !== body) console.log('[TS] время в диалоге /c 60 сдвинуто по /ts');
                        body = shifted;
                    }
                    window._tsTimeDialogRaw = { dialogData, body, priority };
                    // Каждый раз сбрасываем — активация только долгим нажатием на заголовок
                    _tsDialogViaTs = false;
                }
            } catch (_) {}
            return orig.call(this, dialogData, body, priority);
        };
        window.App.__tsMergedPatched = true;
        console.log('[TS] перехват App.addDialogInQueue установлен');
        return true;
    }
    if (!installAppPatch()) {
        const p = setInterval(() => { if (installAppPatch()) clearInterval(p); }, 200);
        setTimeout(() => clearInterval(p), 60000);
    }

    // ── Двухэтапная правка "Текущее время:" (клик → ЧЧ → Enter → ММ → Enter) ──
    function timeSpans(dlg) {
        const row = findRow(dlg, 'Текущее время:');
        if (!row) return null;
        const val = valCol(row);
        if (!val) return null;
        return { h: val.querySelector('[data-tse="h"]'), m: val.querySelector('[data-tse="m"]') };
    }
    function startH(dlg) {
        const s = timeSpans(dlg); if (!s || !s.h || !s.m) return;
        origH = parseInt(s.h.textContent, 10) || 0;
        origM = parseInt(s.m.textContent, 10) || 0;
        stage = 'h'; buf = '';
        s.h.textContent = ':'; s.h.style.textDecoration = 'underline';
        s.m.style.textDecoration = '';
    }
    function commitH() { const v = parseInt(buf, 10); committedH = (buf.length && !isNaN(v) && v <= 23) ? v : origH; }
    function startM(dlg) {
        const s = timeSpans(dlg); if (!s || !s.h || !s.m) return;
        stage = 'm'; buf = '';
        s.h.textContent = p2(committedH) + ':'; s.h.style.textDecoration = '';
        s.m.textContent = ''; s.m.style.textDecoration = 'underline';
    }
    function renderStage() {
        const s = timeSpans(getTimeDialog()); if (!s) return;
        if (stage === 'h') s.h.textContent = buf + ':';
        else if (stage === 'm') s.m.textContent = buf;
    }
    function cancelStage() {
        const s = timeSpans(getTimeDialog());
        if (s && s.h && s.m) {
            s.h.textContent = p2(origH) + ':'; s.m.textContent = p2(origM);
            s.h.style.textDecoration = ''; s.m.style.textDecoration = '';
        }
        stage = null; buf = '';
    }
    function saveM() {
        const v = parseInt(buf, 10);
        const M = (buf.length && !isNaN(v) && v <= 59) ? v : origM;
        const f = fakeNow(); f.setHours(committedH, M, f.getSeconds(), 0);
        stage = null;
        applyOffset(f.getTime() - Date.now());
    }

    // ── Инлайн-правка токенов "Время в игре" ────────────────────────
    function startPt(span) {
        if (ptEd) cancelPt();
        ptEd = { span, field: span.dataset.f, part: span.dataset.p, buffer: '', orig: span.textContent };
        span.textContent = spanText(span, '');
        span.style.textDecoration = 'underline';
    }
    function renderPt() { if (ptEd) ptEd.span.textContent = spanText(ptEd.span, ptEd.buffer); }
    function cancelPt() {
        if (!ptEd) return;
        ptEd.span.textContent = ptEd.orig;
        ptEd.span.style.textDecoration = '';
        ptEd = null;
    }
    function commitPt() {
        if (!ptEd) return;
        const span = ptEd.span;
        span.style.textDecoration = '';
        const v = parseInt(ptEd.buffer, 10);
        if (!ptEd.buffer.length || isNaN(v)) { span.textContent = ptEd.orig; ptEd = null; return; }
        const max = LIMITS[ptEd.part];
        if (v < 0 || v > max) {
            console.log(`[TS] ⚠️ недопустимо: ${ptEd.part === 'h' ? 'часы 0–23' : 'минуты 0–59'} (введено ${v}) — значение НЕ изменено`);
            span.textContent = ptEd.orig; ptEd = null; return;
        }
        span.textContent = spanText(span, v);
        const pt = window._tsPlaytime;
        if (ptEd.field === 'hour') pt.hour = v;
        else { pt[ptEd.field] = pt[ptEd.field] || { h: null, m: null }; pt[ptEd.field][ptEd.part] = v; }
        console.log(`[TS] Время в игре: ${ptEd.field}/${ptEd.part} = ${v}`);
        ptEd = null;
    }

    // ── Полный сброс ─────────────────────────────────────────────────
    function resetAll() {
        const old = window._tsOffset || 0;
        window._tsOffset = 0;
        reapplyChat(old, 0);
        window._tsPlaytime = { hour: null, today: { h: null, m: null }, yesterday: { h: null, m: null } };
        if (stage) cancelStage();
        if (ptEd) cancelPt();
        const dlg = getTimeDialog();
        if (dlg && dlg.$el) {
            dlg.$el.querySelectorAll('.fk-ts-ed').forEach(sp => { sp.textContent = sp.dataset.orig; sp.style.textDecoration = ''; });
            const f = new Date();
            setRowHtml(dlg, 'Сегодняшняя дата:', `<p style="color: #66CC00">${f.getDate()} ${MONTHS[f.getMonth()]} ${f.getFullYear()} г.</p>`);
            setRowHtml(dlg, 'День недели:',       `<p style="color: #66CC00">${WEEKDAYS[f.getDay()]}</p>`);
            const row = findRow(dlg, 'Текущее время:');
            if (row) { const v = valCol(row); if (v) v.innerHTML = `<p style="color: #3399FF">${p2(f.getHours())}:${p2(f.getMinutes())}</p>`; }
            wrapTimeRow(dlg);
        }
        console.log('[TS] ♻️ ПОЛНЫЙ СБРОС: оффсет=0, время серверное');
    }

    // ── Клики ────────────────────────────────────────────────────────
    document.addEventListener('click', (e) => {
        const tgt = e.target;
        const closest = sel => (tgt && tgt.closest) ? tgt.closest(sel) : null;
        const dlg = getTimeDialog();

        // Заголовок "Точное время":
        //   — только что отпустили долгое нажатие → блокируем click, сбрасываем флаг
        //   — если редактирование активно → полный сброс
        const title = closest('.modal__title');
        if (title && dlg && /Точное время/.test(title.textContent || '')) {
            e.preventDefault(); e.stopPropagation();
            if (_tsLongPressFired) { _tsLongPressFired = false; return; }
            if (_tsDialogViaTs)   { resetAll(); return; }
            return;
        }
        if (!dlg) return;
        // Всё редактирование — только когда активировано долгим нажатием
        if (!_tsDialogViaTs) return;

        // Клик по часам/минутам "Текущее время:"
        const tspan = closest('[data-tse]');
        if (tspan) {
            e.preventDefault(); e.stopPropagation();
            if (ptEd) cancelPt();
            if (!stage) startH(dlg);
            else if (stage === 'h') { commitH(); startM(dlg); }
            return;
        }

        // Клик по токену "Время в игре"
        const pspan = closest('.fk-ts-ed');
        if (pspan) {
            e.preventDefault(); e.stopPropagation();
            if (stage) cancelStage();
            startPt(pspan); return;
        }

        // Клик по спану дня / месяца / года → +1 к соответствующей части
        const dspan = closest('[data-dse]');
        if (dspan) {
            e.preventDefault(); e.stopPropagation();
            if (stage) cancelStage();
            if (ptEd) cancelPt();
            const f = fakeNow();
            const part = dspan.dataset.dse;
            if      (part === 'd')  { f.setDate(f.getDate() + 1); }
            else if (part === 'mo') { f.setMonth(f.getMonth() + 1); }
            else if (part === 'y')  { f.setFullYear(f.getFullYear() + 1); }
            applyOffset(f.getTime() - Date.now());
            return;
        }

        // Клик по строке "День недели:" → +1 день
        const row = closest('.window-text__item');
        if (row) {
            const cols = row.querySelectorAll('.window-text__item-col');
            if (cols.length >= 2) {
                const label = (cols[0].textContent || '').trim();
                if (label.indexOf('День недели:') === 0) {
                    e.preventDefault(); e.stopPropagation();
                    const f = fakeNow(); f.setDate(f.getDate() + 1);
                    applyOffset(f.getTime() - Date.now()); return;
                }
            }
        }

        if (stage) cancelStage();
        if (ptEd) cancelPt();
    }, true);

    // ── Долгое нажатие (5 сек) на заголовок "Точное время" → активация редактирования ──
    document.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        const tgt = e.target;
        const title = (tgt && tgt.closest) ? tgt.closest('.modal__title') : null;
        if (!title || !/Точное время/.test(title.textContent || '')) return;
        const dlg = getTimeDialog();
        if (!dlg) return;
        if (_tsLongPressTimer) { clearTimeout(_tsLongPressTimer); _tsLongPressTimer = null; }
        _tsLongPressFired = false;
        _tsLongPressTimer = setTimeout(() => {
            _tsLongPressTimer = null;
            _tsLongPressFired = true;
            _tsDialogViaTs = true;
            const d = getTimeDialog();
            if (d) { wrapTimeRow(d); wrapDateRow(d); wrapPlaytimeRows(d); }
            if (typeof window.onChatMessage === 'function') {
                window.onChatMessage('{999999}Редактирование времени — {33DD77}Включено', '999999FF');
                setTimeout(() => {
                    try {
                        const hud = window.interface('Hud');
                        if (!hud || !hud.$refs || !hud.$refs.chat) return;
                        const chat = hud.$refs.chat;
                        if (!Array.isArray(chat.messages)) return;
                        chat.messages = chat.messages.filter(m => {
                            if (!m.content) return true;
                            return !m.content.some(c => c.text && c.text.includes('Редактирование времени'));
                        });
                    } catch (_) {}
                }, 2500);
            }
            console.log('[TS] редактирование активировано долгим нажатием');
        }, 5000);
    }, true);
    // Отпустили кнопку раньше 5 сек — отменяем таймер
    document.addEventListener('mouseup', () => {
        if (_tsLongPressTimer) { clearTimeout(_tsLongPressTimer); _tsLongPressTimer = null; }
    }, true);

    // ── Правая кнопка мыши: везде делает -1 ─────────────────────────
    // Используем mousedown (button=2) — игра может перехватить contextmenu раньше нас,
    // mousedown срабатывает до любой обработки на стороне движка.
    function handleRMB(e) {
        const tgt = e.target;
        const closest = sel => (tgt && tgt.closest) ? tgt.closest(sel) : null;
        const dlg = getTimeDialog();
        if (!dlg || !_tsDialogViaTs) return;

        // ПКМ по числу / месяцу / году → -1
        const dspan = closest('[data-dse]');
        if (dspan) {
            e.preventDefault(); e.stopPropagation();
            if (stage) cancelStage(); if (ptEd) cancelPt();
            const f = fakeNow(); const part = dspan.dataset.dse;
            if      (part === 'd')  { f.setDate(f.getDate() - 1); }
            else if (part === 'mo') { f.setMonth(f.getMonth() - 1); }
            else if (part === 'y')  { f.setFullYear(f.getFullYear() - 1); }
            applyOffset(f.getTime() - Date.now()); return;
        }

        // ПКМ по часам / минутам → -1 ч или -1 мин
        const tspan = closest('[data-tse]');
        if (tspan) {
            e.preventDefault(); e.stopPropagation();
            if (stage) cancelStage(); if (ptEd) cancelPt();
            const f = fakeNow();
            if (tspan.dataset.tse === 'h') { f.setHours(f.getHours() - 1); }
            else                           { f.setMinutes(f.getMinutes() - 1); }
            applyOffset(f.getTime() - Date.now()); return;
        }

        // ПКМ по токену "Время в игре" → -1 к значению
        const pspan = closest('.fk-ts-ed');
        if (pspan) {
            e.preventDefault(); e.stopPropagation();
            if (stage) cancelStage();
            const cur = parseInt((pspan.textContent.match(/\d+/) || ['0'])[0], 10) || 0;
            const newVal = Math.max(0, cur - 1);
            pspan.textContent = spanText(pspan, newVal);
            const pt = window._tsPlaytime;
            if (pspan.dataset.f === 'hour') pt.hour = newVal;
            else { pt[pspan.dataset.f] = pt[pspan.dataset.f] || { h: null, m: null }; pt[pspan.dataset.f][pspan.dataset.p] = newVal; }
            console.log(`[TS] Время в игре (ПКМ): ${pspan.dataset.f}/${pspan.dataset.p} = ${newVal}`);
            return;
        }

        // ПКМ по строке "День недели:" → -1 день
        const row = closest('.window-text__item');
        if (row) {
            const cols = row.querySelectorAll('.window-text__item-col');
            if (cols.length >= 2 && (cols[0].textContent || '').trim().indexOf('День недели:') === 0) {
                e.preventDefault(); e.stopPropagation();
                const f = fakeNow(); f.setDate(f.getDate() - 1);
                applyOffset(f.getTime() - Date.now()); return;
            }
        }
    }
    document.addEventListener('mousedown',   (e) => { if (e.button === 2) handleRMB(e); }, true);
    // Блокируем всплытие контекстного меню браузера пока редактирование активно
    document.addEventListener('contextmenu', (e) => {
        if (getTimeDialog() && _tsDialogViaTs) { e.preventDefault(); e.stopPropagation(); }
    }, true);

    // ── Клавиатура ───────────────────────────────────────────────────
    document.addEventListener('keydown', (e) => {
        if (!stage && !ptEd) return;
        let handled = true;
        const d = digitOf(e);
        if (stage) {
            if (d !== null) { if (buf.length < 2) { buf += d; renderStage(); } }
            else if (e.key === 'Backspace' || e.keyCode === 8)  { buf = buf.slice(0, -1); renderStage(); }
            else if (e.key === 'Enter'     || e.keyCode === 13) { pendingSwallow = 'Enter';  if (stage === 'h') { commitH(); startM(getTimeDialog()); } else saveM(); }
            else if (e.key === 'Escape'    || e.keyCode === 27) { pendingSwallow = 'Escape'; cancelStage(); }
            else handled = false;
        } else {
            if (d !== null) { if (ptEd.buffer.length < 3) { ptEd.buffer += d; renderPt(); } }
            else if (e.key === 'Backspace' || e.keyCode === 8)  { ptEd.buffer = ptEd.buffer.slice(0, -1); renderPt(); }
            else if (e.key === 'Enter'     || e.keyCode === 13) { pendingSwallow = 'Enter';  commitPt(); }
            else if (e.key === 'Escape'    || e.keyCode === 27) { pendingSwallow = 'Escape'; cancelPt(); }
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

    // ── Поллинг: держим span-ы готовыми ─────────────────────────────
    setInterval(() => {
        const dlg = getTimeDialog();
        if (!dlg) { stage = null; ptEd = null; _tsDialogViaTs = false; return; }
        // span-ы для инлайн-правки добавляем ТОЛЬКО когда редактирование активировано
        if (!stage && !ptEd && _tsDialogViaTs) { wrapTimeRow(dlg); wrapDateRow(dlg); wrapPlaytimeRows(dlg); }
    }, 300);

    console.log('════════════════════════════════════════════════');
    console.log('[TS] /c 60                      — открыть диалог "Точное время"');
    console.log('[TS] зажать заголовок 5 сек     — активировать редактирование + сообщение в чат');
    console.log('[TS] клик по времени            — ЧЧ → Enter → ММ → Enter = сохранить');
    console.log('[TS] клик по заголовку (активно) — полный сброс оффсета');
    console.log('════════════════════════════════════════════════');
})();
// ================================================================
// [FKONST INTERFACE-LOG BLOCK] — логгер открытия/закрытия интерфейсов
// Перехватывает window.openInterface / closeInterface / showInterface /
// hideInterface и пишет в консоль полную информацию:
//   имя, данные (парсинг), опции компонента, стек открытых, время.
// Фильтр: добавь имя в IF_LOG_IGNORE чтобы не спамить.
// ================================================================
(function () {
    if (window.__ifLogLoaded) return;
    window.__ifLogLoaded = true;

    // Интерфейсы которые НЕ логировать (частый спам)
    const IF_LOG_IGNORE = new Set(['GameText', 'Hud', 'Notification', 'Overlay', 'ScreenNotification']);

    const OPTION_KEYS = [
        'hud', 'hideHud', 'hideChat', 'hideLabels', 'hideControllers',
        'showControlsButton', 'allowAnyInterfaces', 'style',
        'blockedByFullScreen', 'transient', 'noFade', 'cursorAllowMovement',
        'useInvisibleJoystick', 'showRadarButtons', 'showRadar'
    ];

    function safeParse(data) {
        if (data === null || data === undefined) return null;
        if (typeof data === 'object') return data;
        if (typeof data === 'string') {
            try { return JSON.parse(data); } catch (_) { return data; }
        }
        return data;
    }

    function getComp(name) {
        try { return window.component && window.component(name); } catch (_) { return null; }
    }

    function fmtOptions(comp) {
        if (!comp || !comp.options) return null;
        const o = {};
        for (const k of OPTION_KEYS) {
            if (comp.options[k] !== undefined) o[k] = comp.options[k];
        }
        return Object.keys(o).length ? o : null;
    }

    function stack() {
        try { return window.visibleInterfaceOrder || []; } catch (_) { return []; }
    }

    // ── Лог открытия ──────────────────────────────────────────────
    function logOpen(name, data, stringParams) {
        if (IF_LOG_IGNORE.has(name)) return;
        const comp = getComp(name);
        const opts = fmtOptions(comp);
        const parsed = safeParse(data);
        const st = stack();

        console.groupCollapsed(
            '%c[IF] ✅ OPEN: ' + name,
            'color:#33DD77;font-weight:bold;'
        );
        console.log('[IF] name: ' + name);
        console.log('[IF] already open: ' + (window.getInterfaceStatus ? window.getInterfaceStatus(name) : '?'));
        console.log('[IF] comp.show: ' + (comp ? comp.show : '?'));
        if (parsed !== null && parsed !== undefined) {
            console.log('[IF] data raw: ' + (typeof data === 'string' ? data : JSON.stringify(data)));
            console.log('[IF] data parsed:', parsed);
        } else {
            console.log('[IF] data: (пусто)');
        }
        if (stringParams && stringParams.length) {
            console.log('[IF] stringParams:', stringParams);
        }
        if (opts) {
            console.log('[IF] options:', opts);
        }
        if (comp && comp.open && comp.open.params) {
            console.log('[IF] open.params:', comp.open.params);
        }
        console.log('[IF] visibleOrder (' + st.length + '): [' + st.join(', ') + ']');
        console.log('[IF] time: ' + new Date().toLocaleTimeString());
        console.groupEnd();
    }

    // ── Лог закрытия ──────────────────────────────────────────────
    function logClose(name) {
        if (IF_LOG_IGNORE.has(name)) return;
        const comp = getComp(name);
        const st = stack();

        console.groupCollapsed(
            '%c[IF] ❌ CLOSE: ' + name,
            'color:#EE4444;font-weight:bold;'
        );
        console.log('[IF] name: ' + name);
        console.log('[IF] comp.show (before): ' + (comp ? comp.show : '?'));
        console.log('[IF] visibleOrder (' + st.length + '): [' + st.join(', ') + ']');
        console.log('[IF] time: ' + new Date().toLocaleTimeString());
        console.groupEnd();
    }

    // ── Лог show / hide (вызываются и отдельно от open/close) ────
    function logShow(name) {
        if (IF_LOG_IGNORE.has(name)) return;
        console.log('[IF] 👁 SHOW: ' + name + '  | stack: [' + stack().join(', ') + ']');
    }
    function logHide(name) {
        if (IF_LOG_IGNORE.has(name)) return;
        console.log('[IF] 🚫 HIDE: ' + name + '  | stack: [' + stack().join(', ') + ']');
    }

    // ── Перехватчики ──────────────────────────────────────────────
    const _origOpen  = window.openInterface;
    window.openInterface = function (name, data, ...rest) {
        try { logOpen(name, data, rest[0]); } catch (_) {}
        return _origOpen && _origOpen.call(this, name, data, ...rest);
    };

    const _origClose = window.closeInterface;
    window.closeInterface = function (name) {
        try { logClose(name); } catch (_) {}
        return _origClose && _origClose.call(this, name);
    };

    const _origShow  = window.showInterface;
    window.showInterface = function (name) {
        try { logShow(name); } catch (_) {}
        return _origShow && _origShow.call(this, name);
    };

    const _origHide  = window.hideInterface;
    window.hideInterface = function (name) {
        try { logHide(name); } catch (_) {}
        return _origHide && _origHide.call(this, name);
    };

    console.log('════════════════════════════════════════════════');
    console.log('[IF] 📋 Логгер интерфейсов загружен');
    console.log('[IF]    openInterface  → ✅ OPEN');
    console.log('[IF]    closeInterface → ❌ CLOSE');
    console.log('[IF]    showInterface  → 👁 SHOW');
    console.log('[IF]    hideInterface  → 🚫 HIDE');
    console.log('[IF]    Игнор: ' + [...IF_LOG_IGNORE].join(', '));
    console.log('════════════════════════════════════════════════');
})();
// ================================================================
// END [FKONST INTERFACE-LOG BLOCK]
// ================================================================
}); // конец callback _nickCheck
