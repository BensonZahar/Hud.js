const licenseTypes = [ 
    { name: "МВД" },
    { name: `Отслеживание | {FF0000}Выкл` },
    { name: `Auto-cuff | {FF0000}Выкл` }
];

const mvdOptions = [
    { name: "1. Приветствие", action: "greeting", needsId: true },
    { name: "2. Проверка документов", action: "checkDocuments" },
    { name: "3. Изучение документов", action: "studyDocuments" },
    { name: "4. Объявление в розыск", action: "wanted", needsId: true },
    { name: "5. Сканирование", action: "scanningTablet" },
    { name: "6. Надевание наручников", action: "cuffing", needsId: true },
    { name: "7. Посадка в машину", action: "putInCar", needsId: true },
    { name: "8. Доставка в участок", action: "arrest", needsId: true },
    { name: "9. Снятие наручников", action: "uncuffing", needsId: true },
    { name: "10. Преследование преступника", action: "chase", needsId: true },
    { name: "11. Обыск", action: "search", needsId: true },
    { name: "12. Конвоирование", action: "escort", needsId: true },
    { name: "13. Снятие розыска", action: "clearWanted", needsId: true },
    { name: "14. Выдача штрафа [Самому /ticket]", action: "fine" },
    { name: "15. Изъятие веществ", action: "confiscate", needsId: true },
    { name: "16. Разбитие стекла", action: "breakGlass", needsId: true },
    { name: "17. Снятие маски", action: "removeMask" },
    { name: "18. Сканирование отпечатков", action: "fingerprint" },
    { name: "19. Изъятие прав", action: "takeLicense", needsId: true }
];

const ITEMS_PER_PAGE = 6;
let currentPage = 0;
let licenseList = '';
licenseTypes.forEach((license, index) => {
    licenseList += `${index + 1}. ${license.name}<n>`;
});

let giveLicenseTo = -1;
let lastLicenseType = -1;
let targetId = null;
let currentMenu = null;
let currentAction = null;
let scanInterval = null;
let currentScanId = null;
let autoCuffEnabled = false;

// Обработчик горячих клавиш
window.addEventListener('keydown', function(e) {
    if (e.altKey && e.key === '1') {
        const targetId = window.getTargetPlayerId(); // Функция должна быть реализована в вашем клиенте
        if (targetId) {
            window.onChatMessage("AHK by Deni_Pels [tg:denipels] thanks to R.Shadow", "FFFFFF");
            if (lastLicenseType === 0) {
                showMvdMenuPage(targetId);
            } else {
                showGiveLicenseDialog(targetId);
            }
        }
    }
});

const setupChatHandler = () => {
    if (window.interface && window.interface('Hud')?.$refs?.chat?.add) {
        const originalAddFunction = window.interface('Hud').$refs.chat.add;
        
        window.interface('Hud').$refs.chat.add = function(message, ...args) {
            if (autoCuffEnabled && typeof message === 'string') {
                const stunMatch = message.match(/Вы оглушили (\w+) на \d+ секунд/);
                if (stunMatch) {
                    const nickname = stunMatch[1];
                    setTimeout(() => {
                        sendChatInput(`/id ${nickname}`);
                    }, 500);
                }
                
                const idMatch = message.match(/\d+\. {[A-F0-9]{6}}(\w+){ffffff}, ID: (\d+),/);
                if (idMatch && idMatch[2]) {
                    const id = idMatch[2];
                    setTimeout(() => {
                        sendMessagesWithDelay([
                            "/me снял наручники с пояса",
                            "/do Наручники в правой руке.",
                            "/me резким движением схватил руки человека",
                            "/me надел наручники на человека напротив",
                            "/do Наручники надеты.",
                            `/cuff ${id}`,
                            "/do Человек свободен.",
                            "/me схватил руку человка",
                            "/do Человек схвачен.",
                            `/escort ${id}`
                        ], [0, 700, 700, 700, 700, 700, 700, 700, 700, 700]);
                    }, 1000);
                }
            }
            
            return originalAddFunction.apply(this, [message, ...args]);
        };
        console.log('[Auto-cuff] Обработчик чата успешно установлен');
    } else {
        setTimeout(setupChatHandler, 100);
    }
};

setupChatHandler();

const getPaginatedMenu = () => {
    const start = currentPage * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const pageItems = mvdOptions.slice(start, end);
    
    let menuList = "← Назад<n>";
    
    pageItems.forEach((option) => {
        menuList += `${option.name}<n>`;
    });
    
    if ((currentPage + 1) * ITEMS_PER_PAGE < mvdOptions.length) {
        menuList += "Вперед →<n>";
    }
    
    return menuList;
};

const startTracking = (id) => {
    if (scanInterval) {
        clearInterval(scanInterval);
        scanInterval = null;
    }
    
    currentScanId = id;
    licenseTypes[1].name = `Отслеживание | {00FF00}Вкл`;
    
    sendMessagesWithDelay([
        `/setmark ${currentScanId}`
    ], [0, 1000, 0]);
    
    scanInterval = setInterval(() => {
        if (currentScanId) {
            sendChatInput(`/setmark ${currentScanId}`);
        }
    }, 7000);
    
    if (currentMenu === null && giveLicenseTo !== -1) {
        setTimeout(() => {
            showGiveLicenseDialog(giveLicenseTo);
        }, 100);
    }
};

const stopTracking = () => {
    if (scanInterval) {
        clearInterval(scanInterval);
        scanInterval = null;
    }
    currentScanId = null;
    licenseTypes[1].name = `Отслеживание | {FF0000}Выкл`;
};

const toggleAutoCuff = () => {
    autoCuffEnabled = !autoCuffEnabled;
    licenseTypes[2].name = `Auto-cuff | ${autoCuffEnabled ? "{00FF00}Вкл" : "{FF0000}Выкл"}`;
};

const SendGiveLicenseCommand = (to, index) => {
    if (index < 0 || index >= licenseTypes.length)
        return;

    lastLicenseType = index;

    switch (index) {
        case 0: // МВД
            setTimeout(() => {
                showMvdMenuPage(giveLicenseTo);
            }, 100);
            break;
        case 1: // Отслеживание
            if (currentScanId) {
                stopTracking();
            } else {
                setTimeout(() => {
                    showTrackingInputDialog(giveLicenseTo);
                }, 100);
            }
            break;
        case 2: // Auto-cuff
            toggleAutoCuff();
            if (currentMenu === null && giveLicenseTo !== -1) {
                setTimeout(() => {
                    showGiveLicenseDialog(giveLicenseTo);
                }, 50);
            }
            break;
    }
};

const HandleMvdCommand = (optionIndex) => {
    const totalPages = Math.ceil(mvdOptions.length / ITEMS_PER_PAGE);
    const isBackButton = optionIndex === 0;
    const isForwardButton = optionIndex === ITEMS_PER_PAGE + 1 && currentPage < totalPages - 1;
    
    if (isBackButton) {
        if (currentPage > 0) {
            currentPage--;
            setTimeout(() => {
                showMvdMenuPage(giveLicenseTo);
            }, 50);
        } else {
            lastLicenseType = -1;
            currentMenu = null;
            setTimeout(() => {
                showGiveLicenseDialog(giveLicenseTo);
            }, 50);
        }
        return;
    }
    
    if (isForwardButton) {
        currentPage++;
        setTimeout(() => {
            showMvdMenuPage(giveLicenseTo);
        }, 50);
        return;
    }
    
    const adjustedIndex = currentPage * ITEMS_PER_PAGE + optionIndex - 1;
    
    if (adjustedIndex >= 0 && adjustedIndex < mvdOptions.length) {
        const option = mvdOptions[adjustedIndex];
        currentAction = option.action;
        
        if (option.needsId) {
            setTimeout(() => {
                showIdInputDialog(giveLicenseTo);
            }, 50);
        } else {
            executeMvdAction(option.action, giveLicenseTo);
        }
    }
};

const executeMvdAction = (action, targetId) => {
    if (!targetId) targetId = giveLicenseTo;
    
    switch (action) {
        case "greeting":
            sendMessagesWithDelay([
                "Здравия желаю, Лейтенант - Дени Пелс.",
                "/do Жетон [Сотрудника МВД] на груди.",
                "/do В нагрудном кармане удостоверение сотрудника МВД.",
                "/me достал удостоверение в развернутом виде",
                "/me предъявил документ человеку напротив",
                `/doc ${targetId}`
            ], [0, 700, 700, 700, 700, 700]);
            break;
            
        case "checkDocuments":
            sendMessagesWithDelay([
                "Будьте добры, предъявите Ваши документы.",
                "/n Введите: /pass ID"
            ], [0, 900]);
            break;
            
        case "studyDocuments":
            sendMessagesWithDelay([
                "/me взял документы и открыл их",
                "/do Документы в развернутом виде.",
                "/me изучил документы",
                "/do Документы изучены.",
                "/me вернул документы владельцу"
            ], [0, 700, 700, 700, 700]);
            break;
            
        case "wanted":
            sendMessagesWithDelay([
                "/me взял рацию в руки, затем зажал кнопку",
                "/do Кнопка зажата.",
                "/me сообщил данные нарушителя диспетчеру",
                "/do Нарушитель объявлен в розыск.",
                `/su ${targetId}`
            ], [0, 700, 700, 700, 700]);
            break;
            
        case "scanningTablet":
            sendMessagesWithDelay([
                "/me достал планшет по определению личности, затем сфотографировал человека",
                "/do Человек сфотографирован.",
                "/me получил выписку из базы данных МВД",
                "/do Личность гражданина определена.",
                "/me убрал планшет в карман",
                "/do Планшет в кармане."
            ], [700, 700, 700, 700, 700, 700]);
            break;
            
        case "cuffing":
            sendMessagesWithDelay([
                "/me снял наручники с пояса",
                "/do Наручники в правой руке.",
                "/me резким движением схватил руки человека",
                "/me надел наручники на человека напротив",
                "/do Наручники надеты.",
                `/cuff ${targetId}`
            ], [0, 700, 700, 700, 700, 700]);
            break;
            
        case "putInCar":
            sendMessagesWithDelay([
                "/me открыл дверь патрульного автомобиля",
                "/do Дверь открыта.",
                "/todo Посадил человека в машину*Осторожно, пригните голову.",
                "/do Человек в машине.",
                "/me закрыл дверь",
                "/do Дверь закрыта.",
                `/putpl ${targetId}`
            ], [0, 700, 700, 700, 700, 500, 700]);
            break;
            
        case "arrest":
            sendMessagesWithDelay([
                "/me открыл двери МВД",
                "/do Двери открыты.",
                "/me провел человека в участок",
                "/do Человек в участке.",
                `/arrest ${targetId}`
            ], [0, 700, 700, 500, 700]);
            break;
            
        case "uncuffing":
            sendMessagesWithDelay([
                "/do Наручники на руках у человека.",
                "/me снял наручники с рук подозреваемого",
                "/do Наручники сняты.",
                "/me повесил наручники на пояс",
                "/do Наручники на поясе.",
                `/uncuff ${targetId}`
            ], [0, 700, 700, 700, 700, 700]);
            break;
            
        case "chase":
            sendMessagesWithDelay([
                "/do Рация на поясе.",
                "/me достал рацию",
                "/todo Зажав кнопку*Преследую преступника, прием.",
                `/pg ${targetId}`
            ], [0, 600, 600, 500]);
            break;
            
        case "search":
            sendMessagesWithDelay([
                "/do На поясе висит сумка для обыска.",
                "/me достал перчатки из сумки",
                "/do Перчатки в руках.",
                "/me показал ориентировку человеку напротив",
                "/todo Надев перчатки на руки*Расслабьтесь. Если ничего не найду, больно не будет.",
                "/me провел руками по верхним частям тела в области груди и рук",
                "/me провел руками по туловищу в области пояса и карманов",
                "/me провел руками по нижним частям тела в области ног",
                `/search ${targetId}`
            ], [0, 900, 900, 1100, 1100, 1100, 1100, 700, 700]);
            break;
            
        case "escort":
            sendMessagesWithDelay([
                "/do Человек свободен.",
                "/me схватил руку человка",
                "/do Человек схвачен.",
                `/escort ${targetId}`
            ], [0, 700, 700, 700]);
            break;
            
        case "clearWanted":
            sendMessagesWithDelay([
                "/me взял рацию в руки, затем зажал кнопку",
                "/do Кнопка зажата.",
                "/me сообщил данные подозреваемого диспетчеру",
                "/do Данные сообщены диспетчеру.",
                "/do Диспетчер: С подозреваемого снят розыск.",
                `/clear ${targetId}`
            ], [0, 700, 700, 700, 700, 700]);
            break;
            
        case "fine":
            sendMessagesWithDelay([
                "/me достал планшет",
                "/do Планшет в руке.",
                "/me записал данные о нарушении и нарушителе",
                "/do Данные заполнены.",
                "/me отправил данные в базу данных",
                "/do Данные отправлены.",
                "/me убрал планшет"
            ], [0, 1000, 1000, 1000, 1000, 1000, 1000]);
            break;
            
        case "confiscate":
            sendMessagesWithDelay([
                "/me изъял запрещенные вещества",
                "/do Вещества в руке.",
                "/me достал полиэтиленовый пакет",
                "/do Полиэтилоновый пакет в руке.",
                "/todo Положив вещества в пакет*Так, это будет передано криминалистам.",
                "/do Вещества в пакете.",
                `/remove ${targetId}`
            ], [0, 700, 700, 700, 1000, 700, 700]);
            break;
            
        case "breakGlass":
            sendMessagesWithDelay([
                "/me ударил прикладом стекло транспортного средства",
                "/me разбил стекло транспортного средства",
                "/do Стекло разбито.",
                "/me открыл дверь транспортного средства, затем вытащил человека из нее",
                `/ejectout ${targetId}`
            ], [0, 900, 900, 900, 900]);
            break;
            
        case "removeMask":
            sendMessagesWithDelay([
                "/do Человек напротив находится в маске.",
                "/me протянув правую руку вперёд, сорвал маску с лица у человека напротив",
                "/do Маска сорвана, человек находится без маски на лице.",
                "/n Команда для снятие маски: /reset или /maskoff"
            ], [0, 400, 400, 400]);
            break;
            
        case "fingerprint":
            sendMessagesWithDelay([
                "/do Аппарат 'CТОЛ' в кармане.",
                "/me резким движением достал Аппарат",
                "/do Аппарат 'СТОЛ' в руке.",
                "/me резким движением потянул руку гражданина напротив и приложил его палец к аппарату",
                "/do Процесс сканирования начат.",
                "/do Процесс завершен.",
                "/do Личность установлена."
            ], [0, 700, 700, 700, 700, 700, 700]);
            break;
            
        case "takeLicense":
            sendMessagesWithDelay([
                "/me взял планшет",
                "/do Планшет в руке.",
                "/me записал данные о нарушении и нарушителе",
                "/do Данные обновены.",
                "/me забрал водительские удостоверение",
                "/do Водительское удостоверение забрано.",
                `/takelic ${targetId}`
            ], [0, 750, 750, 750, 750, 750, 1000]);
            break;
    }
};

window.showGiveLicenseDialog = (e) => {
    giveLicenseTo = e;
    currentMenu = null;
    
    licenseList = '';
    licenseTypes.forEach((license, index) => {
        licenseList += `${index + 1}. ${license.name}<n>`;
    });
    
    window.addDialogInQueue(`[666,2,"АХК tg:denipels | P: ${giveLicenseTo}","","Выбрать","Отмена",0,0]`, licenseList, 0);
};

window.showMvdMenuPage = (e) => {
    giveLicenseTo = e;
    currentMenu = "mvd";
    const menuList = getPaginatedMenu();
    window.addDialogInQueue(
        `[667,2,"МВД (Стр. ${currentPage + 1})","","Выбрать","Отмена",0,0]`, 
        menuList, 
        0
    );
};

window.showIdInputDialog = (e) => {
    giveLicenseTo = e;
    window.addDialogInQueue(`[668,1,"Ввод ID","Введите ID игрока:","Подтвердить","Отмена",0,0]`, "", 0);
};

window.showTrackingInputDialog = (e) => {
    giveLicenseTo = e;
    window.addDialogInQueue(`[669,1,"Отслеживание","Введите ID для отслеживания:","Начать","Отмена",0,0]`, "", 0);
};

window.sendClientEventCustom = (event, ...args) => {
    console.log(`Событие: ${event}, Аргументы:`, args);
    if (args[0] === "OnDialogResponse" && (args[1] >= 666 && args[1] <= 669)) {
        if (args[1] === 666) { // Главное меню
            const listitem = args[3];
            if (args[2] === 1 && giveLicenseTo !== -1) {
                SendGiveLicenseCommand(giveLicenseTo, listitem);
            } else {
                lastLicenseType = -1;
                currentMenu = null;
            }
        } 
        else if (args[1] === 667) { // Меню МВД
            const optionIndex = args[3];
            if (args[2] === 1 && giveLicenseTo !== -1) {
                HandleMvdCommand(optionIndex);
            }
        }
        else if (args[1] === 668) { // Диалог ввода ID для МВД
            const inputId = args[4];
            if (args[2] === 1 && giveLicenseTo !== -1 && currentAction) {
                executeMvdAction(currentAction, inputId);
            }
            currentAction = null;
        }
        else if (args[1] === 669) { // Диалог ввода ID для отслеживания
            const inputId = args[4];
            if (args[2] === 1 && giveLicenseTo !== -1) {
                startTracking(inputId);
            } else {
                stopTracking();
            }
        }
    } else {
        window.sendClientEventHandle(event, ...args);
    }
};

window.sendChatInputCustom = e => {
    const args = e.split(" ");
    if (args[0] == "/dahk") {
        targetId = args[1];
        window.onChatMessage("AHK by Deni_Pels [tg:denipels] thanks to R.Shadow", "FFFFFF");
        if (lastLicenseType === 0) {
            showMvdMenuPage(args[1]);
        } else {
            showGiveLicenseDialog(args[1]);
        }
    } else if (args[0] == "/mvdreset") {
        lastLicenseType = -1;
        currentMenu = null;
        currentAction = null;
        currentPage = 0;
        stopTracking();
        autoCuffEnabled = false;
        licenseTypes[1].name = `Отслеживание | {FF0000}Выкл`;
        licenseTypes[2].name = `Auto-cuff | {FF0000}Выкл`;
        sendChatInput("Настройки МВД сброшены. Следующее /mvd откроет главное меню.");
    } else {
        window.App.developmentMode || engine.trigger("SendChatInput", e);
    }
};

function sendMessagesWithDelay(messages, delays, index = 0) {
    if (index >= messages.length) return;
    setTimeout(() => {
        sendChatInput(messages[index]);
        sendMessagesWithDelay(messages, delays, index + 1);
    }, delays[index]);
}

sendChatInput = sendChatInputCustom;
sendClientEvent = sendClientEventCustom;
