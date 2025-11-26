let skinId = null;
function getSkinIdFromStore() {
    try {
        const menuInterface = window.interface("Menu");
        if (menuInterface && menuInterface.$store && menuInterface.$store.getters["player/skinId"] !== undefined) {
            return menuInterface.$store.getters["player/skinId"];
        }
        return null;
    } catch (e) {
        console.log(`Ошибка при получении Skin ID: ${e.message}`);
        return null;
    }
}
function trackSkinId() {
    const currentSkin = getSkinIdFromStore();
    if (currentSkin !== null && currentSkin !== skinId) {
        skinId = currentSkin;
        console.log(`Новый Skin ID: ${skinId}`);
    }
    setTimeout(trackSkinId, 5000);
}
trackSkinId();
const rankTags = {
    "Рядовой": "[Р]",
    "Сержант": "[С]",
    "Старшина": "[СТ]",
    "Прапорщик": "[ПР]",
    "Лейтенант": "[Л]",
    "Капитан": "[К]",
    "Майор": "[М]",
    "Подполковник": "[ПП]",
    "Командир ДПС": "[Ком.ДПС]",
    "Командир ППС": "[Ком.ППС]",
    "Командир ОМОН": "[Ком.ОМОН]",
    "Заместитель командира ОМОН": "[Зам.Ком.ОМОН]",
    "Командир мотобатальона": "[Ком.МБ]",
    "Полковник": "[П]",
    "Генерал": "[Г]"
};
const licenseTypes = [
    { name: "МВД", id: "mvd" },
    { name: "ОМОН", id: "omon" },
    { name: "Строй", id: "stroy" },
    { name: `Отслеживание | {FF0000}Выкл`, id: "tracking" },
    { name: `Auto-cuff | {FF0000}Выкл`, id: "autocuff" }
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
    { name: "19. Изъятие прав", action: "takeLicense", needsId: true },
    { name: "20. Права Миранды", action: "miranda" }
];
const omonOptions = [
    { name: "1. Стандартное задержание", action: "omonStandard", needsId: true },
    { name: "2. Проверка документов", action: "omonCheckDocs" },
    { name: "3. Выход из ТС", action: "omonExitVehicle" },
    { name: "4. Изучение документов", action: "omonStudyDocs" },
    { name: "5. Объявление в розыск", action: "omonWanted", needsId: true },
    { name: "6. Снятие маски", action: "omonRemoveMask", needsId: true },
    { name: "7. Обыск", action: "omonSearch", needsId: true },
    { name: "8. Доставка в участок", action: "omonArrest", needsId: true },
    { name: "9. Разбитие стекла", action: "omonBreakGlass", needsId: true },
    { name: "10. Выбивание двери", action: "omonBreakDoor", needsId: true },
    { name: "11. Сканирование отпечатков", action: "omonFingerprint", needsId: true },
    { name: "12. Посадка в машину", action: "omonPutInCar", needsId: true },
    { name: "13. Выдача штрафа", action: "omonFine", needsId: true },
    { name: "14. Крик ОМОН", action: "omonShout" },
    { name: "15. Показать ордер на обыск", action: "showWarrant" }
];
const stroyOptions = [
    { name: "1. Объявление о строе (Основное)", action: "stroy1", needsInput: true },
    { name: "2. Объявление о строе (Повтор)", action: "stroy2", needsInput: true },
    { name: "3. Лекция", action: "lecture", sub: true },
    { name: "4. Тренировка", action: "training", sub: true },
    { name: "5. Спец.Задание", action: "special", sub: true }
];
const lectureOptions = [
    { name: "1. Устав", action: "ust1" },
    { name: "2. Субординация", action: "sub1" }
];
const trainingOptions = [
    { name: "1. Начало тренировки", action: "trenya1" },
    { name: "2. Разминка рук", action: "trenya2" },
    { name: "3. Отжимания", action: "trenya3" },
    { name: "4. Бег по плацу", action: "trenya4" },
    { name: "5. Восточное единоборство", action: "trenya5" },
    { name: "6. Завершение тренировки", action: "trenya6" }
];
const specialOptions = [
    { name: "1. Начало задания", action: "rp1" },
    { name: "2. Завершение задания", action: "rp2" }
];
const ITEMS_PER_PAGE = 6;
let currentPage = 0;
let shownLicenseTypes = [];
let lastMenuType = null; // "mvd" or "omon" or "stroy" or null
let giveLicenseTo = -1;
let targetId = null;
let currentMenu = null;
let currentSubMenu = null;
let currentAction = null;
let currentStroyAction = null;
let tempHour = null;
let scanInterval = null;
let currentScanId = null;
let autoCuffEnabled = false;
// Обработчик горячих клавиш
window.addEventListener('keydown', function(e) {
    if (e.altKey && e.key === '0') {
        sendChatInput('/dahk');
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
                            "/do Наручники в руке.",
                            "/me надел наручники на человека напротив",
                            `/cuff ${id}`,
                            "/me схватил задержанного за руки",
                            "/me заломал задержанного и повёл задержанного",
                            `/escort ${id}`
                        ], [0, 300, 300, 300, 300, 300]);
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
const getPaginatedMenu = (options) => {
    const start = currentPage * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const pageItems = options.slice(start, end);
  
    let menuList = "← Назад<n>";
  
    pageItems.forEach((option) => {
        menuList += `${option.name}<n>`;
    });
  
    if ((currentPage + 1) * ITEMS_PER_PAGE < options.length) {
        menuList += "Вперед →<n>";
    }
  
    return menuList;
};
function getLicenseById(id) {
    return licenseTypes.find(t => t.id === id);
}
const startTracking = (id) => {
    if (scanInterval) {
        clearInterval(scanInterval);
        scanInterval = null;
    }
  
    currentScanId = id;
    getLicenseById("tracking").name = `Отслеживание | {00FF00}Вкл`;
  
    sendMessagesWithDelay([
        `/setmark ${currentScanId}`
    ], [0, 1000, 0]);
  
    scanInterval = setInterval(() => {
        if (currentScanId) {
            sendChatInput(`/setmark ${currentScanId}`);
        }
    }, 31000);
  
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
    getLicenseById("tracking").name = `Отслеживание | {FF0000}Выкл`;
};
const toggleAutoCuff = () => {
    autoCuffEnabled = !autoCuffEnabled;
    getLicenseById("autocuff").name = `Auto-cuff | ${autoCuffEnabled ? "{00FF00}Вкл" : "{FF0000}Выкл"}`;
};
const SendGiveLicenseCommand = (to, index) => {
    if (index < 0 || index >= shownLicenseTypes.length)
        return;
    const selected = shownLicenseTypes[index];
    switch (selected.id) {
        case "mvd": // МВД
            lastMenuType = "mvd";
            setTimeout(() => {
                showMvdMenuPage(giveLicenseTo);
            }, 100);
            break;
        case "omon": // ОМОН
            lastMenuType = "omon";
            setTimeout(() => {
                showOmonMenuPage(giveLicenseTo);
            }, 100);
            break;
        case "stroy": // Строй
            lastMenuType = "stroy";
            setTimeout(() => {
                showStroyMenuPage(giveLicenseTo);
            }, 100);
            break;
        case "tracking": // Отслеживание
            if (currentScanId) {
                stopTracking();
            } else {
                setTimeout(() => {
                    showTrackingInputDialog(giveLicenseTo);
                }, 100);
            }
            break;
        case "autocuff": // Auto-cuff
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
            lastMenuType = null;
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
const HandleOmonCommand = (optionIndex) => {
    const totalPages = Math.ceil(omonOptions.length / ITEMS_PER_PAGE);
    const isBackButton = optionIndex === 0;
    const isForwardButton = optionIndex === ITEMS_PER_PAGE + 1 && currentPage < totalPages - 1;
  
    if (isBackButton) {
        if (currentPage > 0) {
            currentPage--;
            setTimeout(() => {
                showOmonMenuPage(giveLicenseTo);
            }, 50);
        } else {
            lastMenuType = null;
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
            showOmonMenuPage(giveLicenseTo);
        }, 50);
        return;
    }
  
    const adjustedIndex = currentPage * ITEMS_PER_PAGE + optionIndex - 1;
  
    if (adjustedIndex >= 0 && adjustedIndex < omonOptions.length) {
        const option = omonOptions[adjustedIndex];
        currentAction = option.action;
      
        if (option.needsId) {
            setTimeout(() => {
                showIdInputDialog(giveLicenseTo);
            }, 50);
        } else {
            executeOmonAction(option.action, giveLicenseTo);
        }
    }
};
const HandleStroyCommand = (optionIndex) => {
    const totalPages = Math.ceil(stroyOptions.length / ITEMS_PER_PAGE);
    const isBackButton = optionIndex === 0;
    const isForwardButton = optionIndex === ITEMS_PER_PAGE + 1 && currentPage < totalPages - 1;
  
    if (isBackButton) {
        if (currentPage > 0) {
            currentPage--;
            setTimeout(() => {
                showStroyMenuPage(giveLicenseTo);
            }, 50);
        } else {
            lastMenuType = null;
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
            showStroyMenuPage(giveLicenseTo);
        }, 50);
        return;
    }
  
    const adjustedIndex = currentPage * ITEMS_PER_PAGE + optionIndex - 1;
  
    if (adjustedIndex >= 0 && adjustedIndex < stroyOptions.length) {
        const option = stroyOptions[adjustedIndex];
        currentStroyAction = option.action;
      
        if (option.needsInput) {
            setTimeout(() => {
                showHourInputDialog(giveLicenseTo);
            }, 50);
        } else if (option.sub) {
            currentSubMenu = option.action;
            currentPage = 0;
            setTimeout(() => {
                if (option.action === "lecture") {
                    showLectureMenuPage(giveLicenseTo);
                } else if (option.action === "training") {
                    showTrainingMenuPage(giveLicenseTo);
                } else if (option.action === "special") {
                    showSpecialMenuPage(giveLicenseTo);
                }
            }, 50);
        } else {
            executeStroyAction(option.action);
        }
    }
};
const HandleLectureCommand = (optionIndex) => {
    const totalPages = Math.ceil(lectureOptions.length / ITEMS_PER_PAGE);
    const isBackButton = optionIndex === 0;
    const isForwardButton = optionIndex === ITEMS_PER_PAGE + 1 && currentPage < totalPages - 1;
  
    if (isBackButton) {
        if (currentPage > 0) {
            currentPage--;
            setTimeout(() => {
                showLectureMenuPage(giveLicenseTo);
            }, 50);
        } else {
            currentSubMenu = null;
            currentPage = 0;
            setTimeout(() => {
                showStroyMenuPage(giveLicenseTo);
            }, 50);
        }
        return;
    }
  
    if (isForwardButton) {
        currentPage++;
        setTimeout(() => {
            showLectureMenuPage(giveLicenseTo);
        }, 50);
        return;
    }
  
    const adjustedIndex = currentPage * ITEMS_PER_PAGE + optionIndex - 1;
  
    if (adjustedIndex >= 0 && adjustedIndex < lectureOptions.length) {
        const option = lectureOptions[adjustedIndex];
        executeStroyAction(option.action);
    }
};
const HandleTrainingCommand = (optionIndex) => {
    const totalPages = Math.ceil(trainingOptions.length / ITEMS_PER_PAGE);
    const isBackButton = optionIndex === 0;
    const isForwardButton = optionIndex === ITEMS_PER_PAGE + 1 && currentPage < totalPages - 1;
  
    if (isBackButton) {
        if (currentPage > 0) {
            currentPage--;
            setTimeout(() => {
                showTrainingMenuPage(giveLicenseTo);
            }, 50);
        } else {
            currentSubMenu = null;
            currentPage = 0;
            setTimeout(() => {
                showStroyMenuPage(giveLicenseTo);
            }, 50);
        }
        return;
    }
  
    if (isForwardButton) {
        currentPage++;
        setTimeout(() => {
            showTrainingMenuPage(giveLicenseTo);
        }, 50);
        return;
    }
  
    const adjustedIndex = currentPage * ITEMS_PER_PAGE + optionIndex - 1;
  
    if (adjustedIndex >= 0 && adjustedIndex < trainingOptions.length) {
        const option = trainingOptions[adjustedIndex];
        executeStroyAction(option.action);
    }
};
const HandleSpecialCommand = (optionIndex) => {
    const totalPages = Math.ceil(specialOptions.length / ITEMS_PER_PAGE);
    const isBackButton = optionIndex === 0;
    const isForwardButton = optionIndex === ITEMS_PER_PAGE + 1 && currentPage < totalPages - 1;
  
    if (isBackButton) {
        if (currentPage > 0) {
            currentPage--;
            setTimeout(() => {
                showSpecialMenuPage(giveLicenseTo);
            }, 50);
        } else {
            currentSubMenu = null;
            currentPage = 0;
            setTimeout(() => {
                showStroyMenuPage(giveLicenseTo);
            }, 50);
        }
        return;
    }
  
    if (isForwardButton) {
        currentPage++;
        setTimeout(() => {
            showSpecialMenuPage(giveLicenseTo);
        }, 50);
        return;
    }
  
    const adjustedIndex = currentPage * ITEMS_PER_PAGE + optionIndex - 1;
  
    if (adjustedIndex >= 0 && adjustedIndex < specialOptions.length) {
        const option = specialOptions[adjustedIndex];
        executeStroyAction(option.action);
    }
};
const executeMvdAction = (action, targetId) => {
    if (!targetId) targetId = giveLicenseTo;
  
    switch (action) {
        case "greeting":
            sendMessagesWithDelay([
                `Здравия желаю, Вас беспокоит ${RANK} - ${FIRST_NAME} ${LAST_NAME}.`,
                "/anim 1 7",
                "/do Удостоверение в кармане.",
                "/me засунул руку, затем резким движением достал удостоверение",
                "/do Удостоверение в руке.",
                "/me открыл удостоверение и показал человеку напротив",
                `/doc ${targetId}`
            ], [0, 1000, 1000, 1000, 1000, 1000, 1000]);
            break;
          
        case "checkDocuments":
            sendMessagesWithDelay([
                "Будьте добры предъявить Ваши документы, а именно:",
                "Паспорт, вод.права и документы на т/с.",
                "/n /pass [id], /carpass [id]",
                "А также, отстегните пожалуйста ремень безопасности.",
                "/n /rem"
            ], [0, 1000, 1000, 1000, 1000]);
            break;
          
        case "studyDocuments":
            sendMessagesWithDelay([
                "/me взял документы",
                "/do Документы в руке.",
                "/me открыл документы на нужной странице",
                "/do Документы открыты.",
                "/me осмотрел страницу",
                "/do Страница осмотрена.",
                "/me закрыл документы",
                "/do Документы закрыты.",
                "/me вернул документы"
            ], [0, 1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500]);
            break;
          
        case "wanted":
            sendMessagesWithDelay([
                "/me взял рацию в руки",
                "/me сообщил данные о нарушителе диспетчеру",
                "/do Данные сообщены.",
                "/do Нарушитель объявлен в розыск.",
                `/su ${targetId}`
            ], [0, 1000, 1000, 1000, 1000]);
            break;
          
        case "scanningTablet":
            sendMessagesWithDelay([
                "/me достал фоторобот из кармана",
                "/do Фоторобот в руке.",
                "/me сделал снимок лица, затем сравнил с подозреваемым",
                "Вы задержаны так как находитесь в федеральном розыске."
            ], [0, 1000, 1000, 1000]);
            break;
          
        case "cuffing":
            sendMessagesWithDelay([
                "/do Наручники в руке.",
                "/me надел наручники на человека напротив",
                `/cuff ${targetId}`
            ], [0, 300, 300]);
            break;
          
        case "putInCar":
            sendMessagesWithDelay([
                "/me открыл дверь автомобиля",
                "/do Дверь открыта.",
                "/me посадил преступника в патрульный автомобиль",
                `/putpl ${targetId}`
            ], [0, 1000, 1000, 1000]);
            break;
          
        case "arrest":
            sendMessagesWithDelay([
                "/me открыл двери ППС",
                "/do Двери открыты.",
                "/me провел человека в участок",
                "/do Человек в участке.",
                `/arrest ${targetId}`
            ], [0, 1000, 1000, 1000, 1000]);
            break;
          
        case "uncuffing":
            sendMessagesWithDelay([
                "/me снял наручники с преступника",
                "/me повесил наручники на пояс",
                "/do Наручники на поясе.",
                `/uncuff ${targetId}`,
                "/me отпустил преступника",
                "/do Человек свободен.",
                `/escort ${targetId}`
            ], [0, 600, 600, 600, 600, 600, 600]);
            break;
          
        case "chase":
            sendMessagesWithDelay([
                "/me взял рацию в руки",
                "/do Рация в руках.",
                "/me сообщил диспетчеру, о погоне за нарушителем",
                `/Pg ${targetId}`
            ], [0, 500, 500, 500]);
            break;
          
        case "search":
            sendMessagesWithDelay([
                "Сейчас я проведу у вас обыск.",
                "Повернитесь спиной и поднимите руки.",
                "/me достал резиновые перчатки",
                "/me надел перчатки на руки",
                "/me провёл руками по верхним частям тела",
                "/me провёл руками по нижним частям тела",
                `/search ${targetId}`
            ], [0, 1000, 1004, 1007, 1010, 1000, 1000]);
            break;
          
        case "escort":
            sendMessagesWithDelay([
                "/me схватил задержанного за руки",
                "/me заломал задержанного и повёл задержанного",
                `/escort ${targetId}`
            ], [0, 300, 300]);
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
                "Я нащупал что то.",
                "/me аккуратно нащупал и достал запрещенный предмет/вещество",
                "/do Пакет для вещественных докозательств в кармане.",
                "/me достал этот пакет и положил туда запрещенную вещь/вещество и закрыл пакет",
                `/remove ${targetId}`
            ], [0, 500, 500, 500, 500]);
            break;
          
        case "breakGlass":
            sendMessagesWithDelay([
                "/me открыл дверь авто.",
                "/me вытащил человека с авто",
                `/ejectout ${targetId}`
            ], [0, 300, 300]);
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
                "/me взял права, затем переложил их в левую руку",
                "/me взял блокнот и ручку в правую руку",
                "/do Блокнот и ручка в руке.",
                "/me записал данные о нарушении и нарушителе в блокнот",
                "/do Данные заполнены.",
                "/me забрал водительские права",
                "/do Водительские права изъяты.",
                `/takelic ${targetId}`
            ], [0, 1000, 1000, 1000, 1000, 1000, 1000, 1000]);
            break;
        case "miranda":
            sendMessagesWithDelay([
                "У вас есть право на молчание, телефонный звонок",
                "Так же есть право на адвоката, если у вас нет средств его оплатить...",
                "Его предоставит государство",
                "Так-же все что вы скажете будет использовано против вас в суде"
            ], [0, 1500, 1500, 1500]);
            break;
    }
};
const executeOmonAction = (action, targetId) => {
    if (!targetId) targetId = giveLicenseTo;
  
    switch (action) {
        case "omonStandard":
            sendMessagesWithDelay([
                "/s Всем стоять.",
                "/s Всем лечь на пол.",
                "/s Работает ОМОН.",
                "/do Наручники свисают с пояса.",
                "/me снял наручники с пояса",
                "/do В руке наручники.",
                "/me схватил человека за руку, затем заломил руку",
                "/me заковал человека в наручники",
                "/do Процесс...",
                "/me начинает вести задержанного",
                `/cuff ${targetId}`,
                `/escort ${targetId}`
            ], [0, 1000, 1000, 0, 900, 800, 800, 700, 700, 650, 1000, 1000]);
            break;
          
        case "omonCheckDocs":
            sendMessagesWithDelay([
                `/s Работает сотрудник ОМОН | Позывной: '${CALLSIGN}'`,
                "/s Предьявите пожалуйста ваши документы, удостоверяющие вашу личность.",
                "/s Если вы в течении 30 секунд не предъявите мне документы я сочту это за 7.3 УК.",
                "/s Если вы убежите или попробуете это сделать я сочту это за 8.1 УК."
            ], [0, 500, 500, 500]);
            break;
          
        case "omonExitVehicle":
            sendMessagesWithDelay([
                "/s Будьте добры, выйдите из своего транспортного средства."
            ], [0]);
            break;
          
        case "omonStudyDocs":
            sendMessagesWithDelay([
                "/me взял документы",
                "/do Документы в руке.",
                "/me открыл документы на нужной странице",
                "/do Документы открыты.",
                "/me осмотрел страницу",
                "/do Страница осмотрена.",
                "/me закрыл документы",
                "/do Документы закрыты.",
                "/me вернул документы"
            ], [0, 1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500]);
            break;
          
        case "omonWanted":
            sendMessagesWithDelay([
                "/me взял рацию в руки",
                "/do Рация в руках.",
                "/me зажал кнопку",
                "/do Кнопка зажата.",
                "/me сообщил данные о нарушителе диспетчеру",
                "/do Данные сообщены.",
                "/do Нарушитель объявлен в розыск.",
                `/su ${targetId}`
            ], [0, 800, 800, 800, 800, 800, 800, 800]);
            break;
          
        case "omonRemoveMask":
            sendMessagesWithDelay([
                "/do Маска на лице человека.",
                "/me снял маску с лица человека",
                "/anim 6 7",
                "/do Маска снята.",
                "/me положил маску в рюкзак с шевроном 'ОМОН'",
                "/do Человек напротив без маски."
            ], [0, 800, 800, 800, 800, 800]);
            break;
          
        case "omonSearch":
            sendMessagesWithDelay([
                "/s СЕЙЧАС Я ПРОВЕДУ ОБЫСК, ПРОСЬБА НЕ ДВИГАТЬСЯ...",
                "/me протянул руку в карман, затем взял Ордер",
                "/do 'Орден на обыск признан №2024г., Губернатором Нижегородской области'.",
                "/me показал документ человеку напротив",
                "/do Перчатки с надписью 'ОМОН' на руках.",
                "/me начал ощупывать человека напротив",
                "/do Верхняя часть осмотрена.",
                "/me начал щупать в области ног",
                "/do Нижняя часть осмотрена.",
                "/me усмехнулся",
                `/search ${targetId}`
            ], [0, 700, 900, 900, 800, 800, 800, 800, 800, 800, 800]);
            break;
          
        case "omonArrest":
            sendMessagesWithDelay([
                "/me открыл двери МВД",
                "/do Двери открыты.",
                "/me провел человека в участок",
                "/do Человек в участке.",
                `/arrest ${targetId}`
            ], [0, 1000, 1000, 1000, 1000]);
            break;
          
        case "omonBreakGlass":
            sendMessagesWithDelay([
                "/me разбил окно прикладом",
                "/do Окно разбито.",
                "/me открывает дверь",
                "/me вытащил подозреваемого из машины",
                `/ejectout ${targetId}`
            ], [0, 700, 700, 700, 700]);
            break;
          
        case "omonBreakDoor":
            sendMessagesWithDelay([
                "/do Лом на земле.",
                "/me взял лом в руки",
                "/do Лом в руках.",
                "/me начал ломать замок двери",
                "/do Процесс..",
                "/do Замок сломан.",
                "/break_door"
            ], [0, 1000, 1000, 1000, 1000, 1000, 1000]);
            break;
          
        case "omonFingerprint":
            sendMessagesWithDelay([
                "/do Аппарат 'CТОЛ' в кармане.",
                "/me резким движением достал Аппарат",
                "/do Аппарат 'СТОЛ' в руке.",
                "/me резким движением потянул руку гражданина напротив и приложил его палец к аппарату",
                "/do Процесс сканирования начат.",
                "/do Процесс завершен.",
                "/do Личность установленна."
            ], [0, 700, 700, 700, 700, 700, 700]);
            break;
          
        case "omonPutInCar":
            sendMessagesWithDelay([
                "/do Двери автомобиля закрыты.",
                "/me открыл дверь автомобиля",
                "/do Дверь открыта.",
                "/me наклонил голову преступника",
                "/do Голова наклонена.",
                "/me посадил преступника в патрульный автомобиль",
                "/do Преступник в патрульном автомобиле.",
                "/me закрыл дверь патрульного автомобиля",
                "/do Дверь закрыта.",
                `/putpl ${targetId}`
            ], [0, 900, 900, 900, 900, 900, 900, 900, 900, 900]);
            break;
          
        case "omonFine":
            sendMessagesWithDelay([
                "/me достал планшет",
                "/do Планшет в руке.",
                "/me записал данные о нарушении и нарушителе",
                "/do Данные заполнены.",
                "/me отправил данные в базу данных",
                "/do Данные отправлены.",
                "/me убрал планшет",
                `/ticket ${targetId}`
            ], [0, 1000, 1000, 1000, 1000, 1000, 1000, 1000]);
            break;
        case "omonShout":
            sendMessagesWithDelay([
                "/s Всем лежать работает ОМОН.",
                "/s В случае неподчинения вынужден буду открыть огонь на поражение."
            ], [0, 1000]);
            break;
        case "showWarrant":
            sendMessagesWithDelay([
                "/me достал ордер на обыск",
                "/do Ордер в руке.",
                "/me показал ордер человеку напротив",
                "/do Процесс...",
                "/me положил ордер в рюкзак",
                "/do Процесс...",
                "/do Ордер в рюкзаке.",
                "Я имею полное право вас обыскать"
            ], [0, 1000, 1000, 1000, 1000, 1000, 1000, 1000]);
            break;
    }
};
const executeStroyAction = (action, hour = null, minute = null) => {
    const tag = rankTags[RANK] || `[${RANK}]`;
    switch (action) {
        case "stroy1":
            sendMessagesWithDelay([
                `/r ${tag} Внимание.`,
                `/r ${tag} Прошу прийти на плац.`,
                `/r ${tag} Напомню, строй начнется в ${hour}:${minute} по МСК.`,
                `/r ${tag} Касается это всего младшего состава.`,
                `/r ${tag} Спасибо за внимание.`
            ], [0, 1700, 1700, 1700, 1700]);
            break;
        case "stroy2":
            sendMessagesWithDelay([
                `/r ${tag} Внимание.*Повторяя*`,
                `/r ${tag} Прошу прийти на плац.*Повторяя*`,
                `/r ${tag} Напомню, строй начнется в ${hour}:${minute} по МСК.*Повторяя*`,
                `/r ${tag} Касается это всего младшего состава.*Повторяя*`,
                `/r ${tag} Спасибо за внимание.*Повторяя*`
            ], [0, 1500, 1500, 1500, 1500]);
            break;
        case "ust1":
            sendMessagesWithDelay([
                "/s Итак бойцы, сейчас я вам проведу лекцию на тему \"Устав\".",
                "/s Устав устанавливает стандарты служебной деятельности.",
                "/s Следование Уставу способствует дисциплине. Каждый сотрудник обязан знать свои права и обязанности",
                "/s Знать устав - ваша обязанность. Незнание не освобождает от наказания.",
                "/s Следование Уставу положительно сказывается на нашем имидже в глазах граждан",
                "/s Соблюдение Устава — это не только ваша обязанность, но и залог успешной службы.",
                "/s Лекция окончена.",
                "/c 060"
            ], [0, 1000, 1000, 1000, 1000, 1000, 1000, 1000]);
            break;
        case "sub1":
            sendMessagesWithDelay([
                "/s Коллеги,я хочу прочитать лекцию на тему \"Субординцация\"",
                "/s В силовых структурах нет слов: \"можно\",\"да\",\"нет\",\"привет\"",
                "/s Обращаться нужно так:",
                "/s \"Разрешите\",\"Так точно\",\"Никак нет\",\"Здравия желаю\"",
                "/s Ко всем обращаться строго по званию.К примеру:",
                "Т.Полковник,т.Сержант,т.Подполковник и т.д",
                "/s Обращаться ко всем сослуживцам без исключения только на \"Вы\"",
                "/s Запрещенно перечить или огрызаться со старшими по званию.",
                "/s Не соблюдение субординации, это прямое нарушение",
                "/c 060"
            ], [0, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000]);
            break;
        case "trenya1":
            sendMessagesWithDelay([
                `/s Здравия. Я ${RANK} ${LAST_NAME}.`,
                "/s Сегодня я проведу вам тренировку",
                "/s Начнём с приседаний."
            ], [0, 1700, 1700]);
            break;
        case "trenya2":
            sendMessagesWithDelay([
                "/s Закончили.",
                "/s Дальше разминка рук.",
                "/n /anim 8 1",
                "/c 60"
            ], [0, 1700, 1700, 1700]);
            break;
        case "trenya3":
            sendMessagesWithDelay([
                "/s Закончили.",
                "/s Отжимания.",
                "/n /anim 6 23",
                "/c 60"
            ], [0, 1500, 1500, 1500]);
            break;
        case "trenya4":
            sendMessagesWithDelay([
                "/s Закончили.",
                "/s Бег по плацу 3 круга.",
                "/s Без прыжков."
            ], [0, 1500, 1500]);
            break;
        case "trenya5":
            sendMessagesWithDelay([
                "/s Восточное единоборство.",
                "/n /anim 8 2"
            ], [0, 1500]);
            break;
        case "trenya6":
            sendMessagesWithDelay([
                "/s Закончили.",
                "/s На этом наша тренировка закончена, но не расходимся."
            ], [0, 1500]);
            break;
        case "rp1":
            sendMessagesWithDelay([
                "/s Хочу вам сказать.",
                "/s У меня для вас есть задания."
            ], [0, 1700]);
            break;
        case "rp2":
            sendMessagesWithDelay([
                "/s Всем спасибо за помощь.",
                "/s Помогли очень сильно.",
                "/s На этой ноте я хочу вам сказать...",
                "/s Вы свободны, можете идти."
            ], [0, 1500, 1500, 1500]);
            break;
    }
};
window.showGiveLicenseDialog = (e) => {
    giveLicenseTo = e;
    currentMenu = null;
  
    let availableTypes = licenseTypes;
    if (skinId !== 15340) {
        availableTypes = availableTypes.filter(t => t.id !== "omon");
    }
    shownLicenseTypes = availableTypes;
  
    let licenseList = '';
    availableTypes.forEach((license, index) => {
        licenseList += `${index + 1}. ${license.name}<n>`;
    });
  
    window.addDialogInQueue(`[666,2,"АХК tg:denipels | P: ${giveLicenseTo}","","Выбрать","Отмена",0,0]`, licenseList, 0);
};
window.showMvdMenuPage = (e) => {
    giveLicenseTo = e;
    currentMenu = "mvd";
    const menuList = getPaginatedMenu(mvdOptions);
    window.addDialogInQueue(
        `[667,2,"МВД (Стр. ${currentPage + 1})","","Выбрать","Отмена",0,0]`,
        menuList,
        0
    );
};
window.showOmonMenuPage = (e) => {
    giveLicenseTo = e;
    currentMenu = "omon";
    const menuList = getPaginatedMenu(omonOptions);
    window.addDialogInQueue(
        `[670,2,"ОМОН (Стр. ${currentPage + 1})","","Выбрать","Отмена",0,0]`,
        menuList,
        0
    );
};
window.showStroyMenuPage = (e) => {
    giveLicenseTo = e;
    currentMenu = "stroy";
    const menuList = getPaginatedMenu(stroyOptions);
    window.addDialogInQueue(
        `[671,2,"Строй (Стр. ${currentPage + 1})","","Выбрать","Отмена",0,0]`,
        menuList,
        0
    );
};
window.showLectureMenuPage = (e) => {
    giveLicenseTo = e;
    const menuList = getPaginatedMenu(lectureOptions);
    window.addDialogInQueue(
        `[672,2,"Лекция (Стр. ${currentPage + 1})","","Выбрать","Отмена",0,0]`,
        menuList,
        0
    );
};
window.showTrainingMenuPage = (e) => {
    giveLicenseTo = e;
    const menuList = getPaginatedMenu(trainingOptions);
    window.addDialogInQueue(
        `[673,2,"Тренировка (Стр. ${currentPage + 1})","","Выбрать","Отмена",0,0]`,
        menuList,
        0
    );
};
window.showSpecialMenuPage = (e) => {
    giveLicenseTo = e;
    const menuList = getPaginatedMenu(specialOptions);
    window.addDialogInQueue(
        `[674,2,"Спец.Задание (Стр. ${currentPage + 1})","","Выбрать","Отмена",0,0]`,
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
window.showHourInputDialog = (e) => {
    giveLicenseTo = e;
    window.addDialogInQueue(`[675,1,"Ввод часа","Введите когда начнется строй (Час. по МСК):","Подтвердить","Отмена",0,0]`, "", 0);
};
window.showMinuteInputDialog = (e) => {
    giveLicenseTo = e;
    window.addDialogInQueue(`[676,1,"Ввод минуты","Введите когда начнется строй (Мин. по МСК):","Подтвердить","Отмена",0,0]`, "", 0);
};
window.sendClientEventCustom = (event, ...args) => {
    console.log(`Событие: ${event}, Аргументы:`, args);
    if (args[0] === "OnDialogResponse" && (args[1] >= 666 && args[1] <= 676)) {
        if (args[1] === 666) { // Главное меню
            const listitem = args[3];
            if (args[2] === 1 && giveLicenseTo !== -1) {
                SendGiveLicenseCommand(giveLicenseTo, listitem);
            } else {
                lastMenuType = null;
                currentMenu = null;
            }
        }
        else if (args[1] === 667) { // Меню МВД
            const optionIndex = args[3];
            if (args[2] === 1 && giveLicenseTo !== -1) {
                HandleMvdCommand(optionIndex);
            }
        }
        else if (args[1] === 668) { // Диалог ввода ID
            const inputId = args[4];
            if (args[2] === 1 && giveLicenseTo !== -1 && currentAction) {
                if (currentMenu === "mvd") {
                    executeMvdAction(currentAction, inputId);
                } else if (currentMenu === "omon") {
                    executeOmonAction(currentAction, inputId);
                }
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
        else if (args[1] === 670) { // Меню ОМОН
            const optionIndex = args[3];
            if (args[2] === 1 && giveLicenseTo !== -1) {
                HandleOmonCommand(optionIndex);
            }
        }
        else if (args[1] === 671) { // Меню Строй
            const optionIndex = args[3];
            if (args[2] === 1 && giveLicenseTo !== -1) {
                HandleStroyCommand(optionIndex);
            }
        }
        else if (args[1] === 672) { // Меню Лекция
            const optionIndex = args[3];
            if (args[2] === 1 && giveLicenseTo !== -1) {
                HandleLectureCommand(optionIndex);
            }
        }
        else if (args[1] === 673) { // Меню Тренировка
            const optionIndex = args[3];
            if (args[2] === 1 && giveLicenseTo !== -1) {
                HandleTrainingCommand(optionIndex);
            }
        }
        else if (args[1] === 674) { // Меню Спец.Задание
            const optionIndex = args[3];
            if (args[2] === 1 && giveLicenseTo !== -1) {
                HandleSpecialCommand(optionIndex);
            }
        }
        else if (args[1] === 675) { // Ввод часа
            const inputHour = args[4];
            if (args[2] === 1 && giveLicenseTo !== -1 && currentStroyAction) {
                tempHour = inputHour;
                setTimeout(() => {
                    showMinuteInputDialog(giveLicenseTo);
                }, 50);
            }
            else {
                currentStroyAction = null;
            }
        }
        else if (args[1] === 676) { // Ввод минуты
            const inputMinute = args[4];
            if (args[2] === 1 && giveLicenseTo !== -1 && currentStroyAction && tempHour) {
                executeStroyAction(currentStroyAction, tempHour, inputMinute);
            }
            currentStroyAction = null;
            tempHour = null;
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
        if (lastMenuType === "mvd") {
            showMvdMenuPage(args[1]);
        } else if (lastMenuType === "omon") {
            showOmonMenuPage(args[1]);
        } else if (lastMenuType === "stroy") {
            showStroyMenuPage(args[1]);
        } else {
            showGiveLicenseDialog(args[1]);
        }
    } else if (args[0] == "/mvdreset") {
        lastMenuType = null;
        currentMenu = null;
        currentSubMenu = null;
        currentAction = null;
        currentStroyAction = null;
        currentPage = 0;
        stopTracking();
        autoCuffEnabled = false;
        getLicenseById("tracking").name = `Отслеживание | {FF0000}Выкл`;
        getLicenseById("autocuff").name = `Auto-cuff | {FF0000}Выкл`;
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
