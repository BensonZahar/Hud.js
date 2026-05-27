// JAS Menu Script by Deni_Pels (tg:denipels)
const jasMenu = [
    { name: "Тест 1", action: "test1" }
];
const ITEMS_PER_PAGE = 6;
let currentPage = 0;
let giveLicenseTo = -1;
let targetId = null;
let currentMenu = null;

// JSK — фракционная история
const jskOptions = [
    // === Мин. Обороны — сверху ===
    { name: "Timofej_Bonk изменил должность на Ефрейтор [№2] в Мин. Обороны<t>2025-12-06 13:12:31<n>", action: "jsk_view" },
    { name: "Timofej_Bonk принял в Мин. Обороны на должность Рядовой [№1]<t>2025-12-05 14:28:56<n>", action: "jsk_view" },

    // === Правительство ===
    { name: "Jony_Santiz изменил должность на Адвокат [№7] в Правительство<t>2025-12-03 18:25:14<n>", action: "jsk_view" },
    { name: "Lars_Verstappen изменил должность на Лицензёр [№6] в Правительство<t>2025-12-02 16:42:33<n>", action: "jsk_view" },
    { name: "Jony_Santiz изменил должность на Старший Секретарь [№5] в Правительство<t>2025-11-28 14:18:46<n>", action: "jsk_view" },
    { name: "Lars_Verstappen изменил должность на Секретарь [№4] в Правительство<t>2025-11-26 17:55:45<n>", action: "jsk_view" },
    { name: "Jony_Santiz изменил должность на Нач. Охраны [№3] в Правительство<t>2025-11-24 16:09:30<n>", action: "jsk_view" },
    { name: "Lars_Verstappen изменил должность на Охранник [№2] в Правительство<t>2025-11-22 20:43:32<n>", action: "jsk_view" },
    { name: "Jony_Santiz принял в Правительство на должность Водитель [№1]<t>2025-11-20 14:39:56<n>", action: "jsk_view" },

    // === ФСИН ===
    { name: "Dmitriy_Konovalenko изменил должность на Надзиратель [№3] в ФСИН<t>2025-10-26 17:33:51<n>", action: "jsk_view" },
    { name: "Alex_Lincoln изменил должность на Конвоир [№2] в ФСИН<t>2025-10-23 12:48:06<n>", action: "jsk_view" },
    { name: "Dmitriy_Konovalenko принял в ФСИН на должность Охранник [№1]<t>2025-10-20 20:14:29<n>", action: "jsk_view" }
];

// === /alis ===
const alisOptions = [];

// === ФЕЙКОВАЯ ТРУДОВАЯ — меняй поля здесь ===
const FAKE_WORKBOOK = {
    number:        'N - 1 042 290',
    firstHireDate: '17/03/2024',
    organization:  'ПРАВИТЕЛЬСТВО',
    nickname:      'Nicolay_Benson',
    position:      'Министр',
    hireDate:      '24/10/2024',
    experience:    '3 г.',
};

window.showFakeWorkBook = () => {
    const EMPLOYMENT_HISTORY = 1;
    try {
        engine.trigger('OpenInterface', 'Docs', JSON.stringify([
            [EMPLOYMENT_HISTORY, JSON.stringify(FAKE_WORKBOOK)]
        ]));
        console.log('[WBoo] Открыт интерфейс трудовой');
    } catch (e) {
        console.error('[WBoo] Ошибка engine.trigger:', e);
    }
};

// Инициализация
const initJasMenu = () => {
    window.sendChatInputCustom = e => {
        const args = e.split(" ");
        if (args[0] === "/jas") {
            targetId = args[1];
            showJasMenu(args[1]);
        } else if (args[0] === "/team_histor") {
            targetId = args[1];
            showJskMenu(args[1]);
        } else if (args[0] === "/alis") {
            targetId = args[1];
            showAlisMenu(args[1]);
        } else if (args[0] === "/wboo") {
            showFakeWorkBook();
        } else {
            window.App.developmentMode || engine.trigger("SendChatInput", e);
        }
    };
    window.sendClientEventCustom = (event, ...args) => {
        if (args[0] === "OnDialogResponse" && args[1] === 670) {
            const response = args[2];
            if (response === 1 && giveLicenseTo !== -1) {
                if (currentMenu === "jas") {
                    handleJasCommand(args[3]);
                } else if (currentMenu === "jsk") {
                    handleJskCommand(args[3]);
                } else if (currentMenu === "alis") {
                    handleAlisCommand(args[3]);
                }
            }
        } else {
            window.sendClientEventHandle?.(event, ...args);
        }
    };
    window.sendChatInput = window.sendChatInputCustom;
    window.sendClientEvent = window.sendClientEventCustom;
    console.log("[JAS Menu] Загружен");
    console.log("[JSK Menu] Добавлен");
    console.log("[ALIS Menu] Добавлен");
    console.log("[WBoo] /wboo — фейковая трудовая активна");
};

// === JAS ===
window.showJasMenu = (e) => {
    giveLicenseTo = e;
    currentMenu = "jas";
    let list = '';
    jasMenu.forEach((item, i) => list += `${i + 1}. ${item.name}<n>`);
    window.addDialogInQueue(`[670,2,"JAS Menu","","Выбрать","Отмена",0,0]`, list, 0);
};

// === JSK ===
window.showJskMenu = (e) => {
    giveLicenseTo = e;
    currentMenu = "jsk";
    let list = '';
    jskOptions.forEach(item => list += `${item.name}<n>`);
    window.addDialogInQueue(`[670,2,"Фракционная история","","Далее","Отмена",0,1]`, list, 0);
};

// === ALIS ===
window.showAlisMenu = (playerId) => {
    giveLicenseTo = playerId;
    currentMenu = "alis";
    const title = `{FFCD00}Последние 10 наказаний за 2 месяца`;
    const header = `Тип наказания<t><t>Дата наказания<t>Ник администратора<t>Причина<n><n>`;
    let body = "";
    if (alisOptions.length === 0) {
        body = `{FFFFFF}Список наказаний пуст`;
    } else {
        alisOptions.forEach(item => {
            body += `{FFFFFF}${item.type}<t><t>${item.date}<t>${item.admin}<t>${item.reason}<n>`;
        });
    }
    window.addDialogInQueue(`[670,0,"${title}","","Закрыть","",0,0]`, header + body, 0);
};

// === Обработка ===
const handleJasCommand = (i) => {
    if (i === 0) return;
    const idx = i - 1;
    if (idx >= 0 && idx < jasMenu.length) {
        executeJasAction(jasMenu[idx].action, giveLicenseTo);
    }
};
const handleJskCommand = (i) => {
    if (i === 0) return;
    const idx = i - 1;
    if (idx >= 0 && idx < jskOptions.length) {
        executeJskAction(jskOptions[idx].action, giveLicenseTo);
    }
};
const handleAlisCommand = () => {};

// === Действия ===
const executeJasAction = (action, targetId) => {
    if (!targetId) targetId = giveLicenseTo;
    switch (action) {
        case "test1":
            sendMessagesWithDelay([
                "/me выполняет тестовое действие 1",
                "/do Действие успешно выполнено."
            ], [0, 1000]);
            break;
    }
};
const executeJskAction = (action, targetId) => {
    if (!targetId) targetId = giveLicenseTo;
    switch (action) {
        case "jsk_view":
            sendMessagesWithDelay([
                "/me открыл служебный КПК",
                "/do На экране отображается фракционная история.",
                "/me изучает информацию на экране"
            ], [0, 700, 700]);
            break;
    }
};

// === Задержка ===
function sendMessagesWithDelay(messages, delays, index = 0) {
    if (index >= messages.length) return;
    setTimeout(() => {
        sendChatInput(messages[index]);
        sendMessagesWithDelay(messages, delays, index + 1);
    }, delays[index]);
}

// === Запуск ===
if (window.engine) {
    initJasMenu();
} else {
    const check = setInterval(() => {
        if (window.engine) {
            clearInterval(check);
            initJasMenu();
        }
    }, 100);
}
