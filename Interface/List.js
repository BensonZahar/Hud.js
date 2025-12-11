// ============================================
// 🌐 ФУНКЦИИ ЗАГРУЗКИ С GITHUB
// ============================================

function loadCssFromGitHub(username, repo, folder, filename, retries = 5) {
    return new Promise((resolve, reject) => {
        const path = folder ? `${encodeURIComponent(folder)}/` : '';
        const url = `https://raw.githubusercontent.com/${username}/${repo}/main/${path}${filename}`;
        
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                const style = document.createElement('style');
                style.setAttribute('data-source', `github:${username}/${repo}/${folder}/${filename}`);
                style.textContent = xhr.responseText;
                document.head.appendChild(style);
                
                console.log(`✅ CSS ${filename} загружен с GitHub`);
                resolve(true);
            } else {
                console.error(`❌ HTTP error! status: ${xhr.status} для ${url}`);
                if (retries > 0) {
                    console.log(`🔄 Повторная попытка CSS... Осталось попыток: ${retries - 1}`);
                    setTimeout(() => {
                        loadCssFromGitHub(username, repo, folder, filename, retries - 1)
                            .then(resolve)
                            .catch(reject);
                    }, 2000);
                } else {
                    reject(new Error(`Не удалось загрузить CSS ${filename}`));
                }
            }
        };
        
        xhr.onerror = function() {
            console.error(`❌ Ошибка сети при загрузке CSS ${filename}`);
            if (retries > 0) {
                console.log(`🔄 Повторная попытка CSS... Осталось попыток: ${retries - 1}`);
                setTimeout(() => {
                    loadCssFromGitHub(username, repo, folder, filename, retries - 1)
                        .then(resolve)
                        .catch(reject);
                }, 2000);
            } else {
                reject(new Error(`Не удалось загрузить CSS ${filename}`));
            }
        };
        
        xhr.send();
    });
}

function loadJsFromGitHub(username, repo, folder, filename, retries = 5) {
    return new Promise((resolve, reject) => {
        const path = folder ? `${encodeURIComponent(folder)}/` : '';
        const url = `https://raw.githubusercontent.com/${username}/${repo}/main/${path}${filename}`;
        
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                console.log(`✅ JS ${filename} загружен с GitHub`);
                resolve(xhr.responseText);
            } else {
                console.error(`❌ HTTP error! status: ${xhr.status} для ${url}`);
                if (retries > 0) {
                    console.log(`🔄 Повторная попытка JS... Осталось попыток: ${retries - 1}`);
                    setTimeout(() => {
                        loadJsFromGitHub(username, repo, folder, filename, retries - 1)
                            .then(resolve)
                            .catch(reject);
                    }, 2000);
                } else {
                    reject(new Error(`Не удалось загрузить JS ${filename}`));
                }
            }
        };
        
        xhr.onerror = function() {
            console.error(`❌ Ошибка сети при загрузке JS ${filename}`);
            if (retries > 0) {
                console.log(`🔄 Повторная попытка JS... Осталось попыток: ${retries - 1}`);
                setTimeout(() => {
                    loadJsFromGitHub(username, repo, folder, filename, retries - 1)
                        .then(resolve)
                        .catch(reject);
                }, 2000);
            } else {
                reject(new Error(`Не удалось загрузить JS ${filename}`));
            }
        };
        
        xhr.send();
    });
}

// ============================================
// 📦 СЕКЦИЯ 1: Регистрация кастомных интерфейсов (БЕЗ import.meta)
// ============================================

const customComponents = {
    Theory2: () => import("./Theory2.js"),
    CustomInterface1: () => import("./CustomInterface1.js"),
    MyAwesomeUI: () => import("./MyAwesomeUI.js")
};

// ============================================
// ⚙️ СЕКЦИЯ 2: Конфигурация интерфейсов
// ============================================

const customConfig = {
    Theory2: {
        open: {
            status: !1
        },
        show: !0,
        options: {
            hideHud: !0,
            hideChat: !0
        }
    },
    
    CustomInterface1: {
        open: {
            status: !1
        },
        show: !0,
        options: {
            hideHud: !1,
            hideChat: !1
        }
    },
    
    MyAwesomeUI: {
        open: {
            status: !1
        },
        show: !0,
        options: {
            hideHud: !0,
            hideChat: !0,
            showControlsButton: !0
        }
    }
};

// ============================================
// 🚀 АВТОМАТИЧЕСКАЯ ЗАГРУЗКА С GITHUB
// ============================================

(async function loadInterfacesFromGitHub() {
    console.log('🌐 Проверка интерфейсов для загрузки с GitHub...');
    
    const githubConfig = {
        username: 'BensonZahar',
        repo: 'Hud.js',
        folder: 'Interface/JsCss'
    };
    
    // Проходим по всем интерфейсам и загружаем те, у которых совпадают имена
    for (const interfaceName of Object.keys(customConfig)) {
        const jsFileName = `${interfaceName}.js`;
        const cssFileName = `${interfaceName}.css`;
        
        console.log(`🔍 Проверка ${interfaceName}...`);
        
        try {
            // Пробуем загрузить CSS
            await loadCssFromGitHub(
                githubConfig.username,
                githubConfig.repo,
                githubConfig.folder,
                cssFileName
            );
        } catch (error) {
            console.log(`ℹ️ CSS ${cssFileName} не найден на GitHub, используем локальный`);
        }
        
        try {
            // Пробуем загрузить JS
            const jsCode = await loadJsFromGitHub(
                githubConfig.username,
                githubConfig.repo,
                githubConfig.folder,
                jsFileName
            );
            
            if (jsCode) {
                eval(jsCode);
                console.log(`✅ ${interfaceName} загружен с GitHub`);
            }
        } catch (error) {
            console.log(`ℹ️ JS ${jsFileName} не найден на GitHub, используем локальный`);
        }
    }
    
    console.log('✅ Загрузка с GitHub завершена');
})();

// ============================================
// 🔧 РЕГИСТРАЦИЯ КАСТОМНЫХ ИНТЕРФЕЙСОВ
// ============================================

Object.keys(customConfig).forEach(name => {
    td[name] = customComponents[name];
    od[name] = customConfig[name];
});

console.log(`✅ Зарегистрировано ${Object.keys(customConfig).length} кастомных интерфейсов`);

// ============================================
// 🔧 ФИКС ЗАКРЫТИЯ НА ESC ДЛЯ КАСТОМНЫХ ИНТЕРФЕЙСОВ
// ============================================

if (!window.customInterfacesEscHandlerInstalled) {
    const originalCheckAndOpenPauseMenu = window.checkAndOpenPauseMenu;

    window.checkAndOpenPauseMenu = function(e) {
        const closeableInterfaces = ['Theory', 'Theory2', 'CustomInterface1', 'MyAwesomeUI'];
        
        if (e === KEY_CODE_ESC && !window.inputFocus) {
            for (const interfaceName of closeableInterfaces) {
                if (window.getInterfaceStatus(interfaceName)) {
                    window.closeInterface(interfaceName);
                    console.log(`[ESC] Закрыт: ${interfaceName}`);
                    return;
                }
            }
        }
        
        if (originalCheckAndOpenPauseMenu) {
            originalCheckAndOpenPauseMenu(e);
        }
    };
    
    window.customInterfacesEscHandlerInstalled = true;
    console.log('✅ Закрытие кастомных интерфейсов на ESC активировано');
}

// ============================================
// 🎮 СИСТЕМА ПРОЛИСТЫВАНИЯ ИНТЕРФЕЙСОВ
// ============================================

if (typeof window.intBrowserMode === 'undefined') {
    window.intBrowserMode = false;
    window.intBrowserIndex = 0;
    window.intBrowserList = [];
}

if (!window.switchInterface) {
    window.switchInterface = function(direction) {
        if (!window.intBrowserMode) return;
        
        const list = window.intBrowserList;
        const oldIndex = window.intBrowserIndex;
        
        try {
            window.closeInterface(list[oldIndex]);
        } catch (err) {
            console.error(`Ошибка закрытия ${list[oldIndex]}:`, err);
        }
        
        if (direction === 'next') {
            window.intBrowserIndex = (oldIndex + 1) % list.length;
        } else if (direction === 'prev') {
            window.intBrowserIndex = (oldIndex - 1 + list.length) % list.length;
        }
        
        const newInterface = list[window.intBrowserIndex];
        
        try {
            window.openInterface(newInterface);
            console.log(`[${window.intBrowserIndex + 1}/${list.length}] 🔍 ${newInterface}`);
            
            if (window.safeNotification) {
                window.safeNotification(
                    `Просмотр (${window.intBrowserIndex + 1}/${list.length})`,
                    newInterface,
                    "00FFFF",
                    3000
                );
            }
        } catch (err) {
            console.error(`Ошибка открытия ${newInterface}:`, err);
        }
    };
}

// ============================================
// 🔧 ОБРАБОТЧИК КЛАВИШ (БЕЗОПАСНАЯ УСТАНОВКА)
// ============================================

if (!window.intBrowserKeyHandlerInstalled) {
    const previousOnKeyDown = window.onkeydown;

    window.onkeydown = function(e) {
        const keyCode = e.keyCode || e.which;
        
        if (window.intBrowserMode && !window.inputFocus) {
            if (keyCode === 39) {
                e.preventDefault();
                window.switchInterface('next');
                return false;
            }
            
            if (keyCode === 37) {
                e.preventDefault();
                window.switchInterface('prev');
                return false;
            }
            
            if (keyCode === 27) {
                e.preventDefault();
                
                try {
                    window.closeInterface(window.intBrowserList[window.intBrowserIndex]);
                } catch (err) {
                    console.error('Ошибка закрытия:', err);
                }
                
                window.intBrowserMode = false;
                console.log('⛔ Режим просмотра интерфейсов выключен');
                
                if (window.safeNotification) {
                    window.safeNotification(
                        "Режим просмотра",
                        "Выключен",
                        "FF6600",
                        3000
                    );
                }
                return false;
            }
        }
        
        if (previousOnKeyDown) {
            return previousOnKeyDown.call(this, e);
        }
    };
    
    window.intBrowserKeyHandlerInstalled = true;
    console.log('⌨️  Обработчик клавиш ← → установлен');
}

// ============================================
// 🔧 ФУНКЦИЯ ПЕРЕЗАПУСКА SCREENNOTIFICATION
// ============================================

if (!window.resetScreenNotification) {
    window.resetScreenNotification = function() {
        try {
            if (window.getInterfaceStatus && window.getInterfaceStatus('ScreenNotification')) {
                window.closeInterface('ScreenNotification');
            }
            
            setTimeout(() => {
                try {
                    window.openInterface('ScreenNotification');
                    console.log('🔄 ScreenNotification перезапущен');
                } catch (err) {
                    console.error('❌ Ошибка открытия ScreenNotification:', err);
                }
            }, 50);
        } catch (err) {
            console.error('❌ Ошибка перезапуска ScreenNotification:', err);
        }
    };
}

if (!window.safeNotification) {
    window.safeNotification = function(title, message, color = "00FFFF", duration = 3000) {
        try {
            window.resetScreenNotification();
            
            setTimeout(() => {
                try {
                    window.interface('ScreenNotification').add(
                        `[0, "${title}", "${message}", "${color}", ${duration}]`
                    );
                } catch (err) {
                    console.error('❌ Ошибка показа уведомления:', err);
                    setTimeout(() => {
                        try {
                            window.interface('ScreenNotification').add(
                                `[0, "${title}", "${message}", "${color}", ${duration}]`
                            );
                        } catch (e) {
                            console.error('❌ Повторная ошибка уведомления:', e);
                        }
                    }, 1000);
                }
            }, 100);
        } catch (err) {
            console.error('❌ Критическая ошибка safeNotification:', err);
        }
    };
}

// ============================================
// 🎮 КОМАНДЫ ДЛЯ УПРАВЛЕНИЯ ИНТЕРФЕЙСАМИ
// ============================================

const previousSendChatInput = window.sendChatInputCustom || window.sendChatInput;

window.sendChatInputCustom = function(e) {
    const args = e.trim().split(" ");
    
    if (args[0] === "/intbrowse" || args[0] === "/intview") {
        window.intBrowserList = Object.keys(window.App.components);
        window.intBrowserIndex = 0;
        window.intBrowserMode = true;
        
        const firstInterface = window.intBrowserList[0];
        
        try {
            window.openInterface(firstInterface);
            console.log(`🔍 Режим просмотра: ${window.intBrowserList.length} интерфейсов`);
            console.log(`[1/${window.intBrowserList.length}] ${firstInterface}`);
            console.log('⌨️  Используйте ← → для переключения, ESC для выхода');
            
            if (window.safeNotification) {
                window.safeNotification(
                    "Режим просмотра",
                    `← → для переключения, ESC для выхода. [1/${window.intBrowserList.length}] ${firstInterface}`,
                    "00FFFF",
                    5000
                );
            }
        } catch (err) {
            console.error(`Ошибка открытия ${firstInterface}:`, err);
        }
        return;
    }
    
    if (args[0] === "/intstop") {
        if (window.intBrowserMode) {
            try {
                window.closeInterface(window.intBrowserList[window.intBrowserIndex]);
            } catch (err) {
                console.error('Ошибка закрытия:', err);
            }
            
            window.intBrowserMode = false;
            console.log('⛔ Режим просмотра выключен');
            
            if (window.safeNotification) {
                window.safeNotification(
                    "Режим просмотра",
                    "Выключен",
                    "FF6600",
                    3000
                );
            }
        } else {
            console.log('ℹ️ Режим просмотра не активен');
        }
        return;
    }
    
    if (args[0] === "/resetnotif") {
        window.resetScreenNotification();
        console.log('🔄 ScreenNotification перезапущен вручную');
        
        setTimeout(() => {
            if (window.safeNotification) {
                window.safeNotification(
                    "Тест уведомлений",
                    "ScreenNotification работает корректно!",
                    "00FF00",
                    3000
                );
            }
        }, 200);
        return;
    }
    
    if (args[0] === "/openint") {
        const interfaceName = args[1];
        
        if (!interfaceName) {
            if (window.safeNotification) {
                window.safeNotification(
                    "Открытие интерфейса",
                    "Использование: /openint <Название>",
                    "FF0000",
                    5000
                );
            }
            return;
        }
        
        if (window.App.components[interfaceName]) {
            window.openInterface(interfaceName);
            console.log(`✅ Открыт: ${interfaceName}`);
            
            if (window.safeNotification) {
                window.safeNotification(
                    "Открытие интерфейса",
                    `Интерфейс '${interfaceName}' открыт`,
                    "00FF00",
                    3000
                );
            }
        } else {
            console.error(`❌ Не найден: ${interfaceName}`);
            
            if (window.safeNotification) {
                window.safeNotification(
                    "Ошибка",
                    `Интерфейс '${interfaceName}' не найден`,
                    "FF0000",
                    5000
                );
            }
        }
        return;
    }
    
    if (args[0] === "/closeint") {
        const interfaceName = args[1];
        
        if (!interfaceName) {
            if (window.safeNotification) {
                window.safeNotification(
                    "Закрытие интерфейса",
                    "Использование: /closeint <Название>",
                    "FF0000",
                    5000
                );
            }
            return;
        }
        
        if (window.App.components[interfaceName]) {
            window.closeInterface(interfaceName);
            console.log(`✅ Закрыт: ${interfaceName}`);
            
            if (window.safeNotification) {
                window.safeNotification(
                    "Закрытие интерфейса",
                    `Интерфейс '${interfaceName}' закрыт`,
                    "00FF00",
                    3000
                );
            }
        } else {
            console.error(`❌ Не найден: ${interfaceName}`);
            
            if (window.safeNotification) {
                window.safeNotification(
                    "Ошибка",
                    `Интерфейс '${interfaceName}' не найден`,
                    "FF0000",
                    5000
                );
            }
        }
        return;
    }
    
    if (args[0] === "/listint") {
        const interfaces = Object.keys(window.App.components).join(", ");
        console.log(`📋 Доступные интерфейсы (${Object.keys(window.App.components).length}): ${interfaces}`);
        
        if (window.safeNotification) {
            window.safeNotification(
                "Список интерфейсов",
                `Найдено ${Object.keys(window.App.components).length} интерфейсов. Список в консоли (F8)`,
                "0000FF",
                5000
            );
        }
        return;
    }
    
    if (typeof previousSendChatInput === 'function') {
        return previousSendChatInput(e);
    } else {
        window.App.developmentMode || engine.trigger("SendChatInput", e);
    }
};

sendChatInput = window.sendChatInputCustom;

console.log('✅ Загрузчик интерфейсов полностью загружен');
console.log('📦 Кастомные интерфейсы: Theory2, CustomInterface1, MyAwesomeUI');
console.log('📋 Команды: /intbrowse, /intstop, /openint, /closeint, /listint, /resetnotif');
console.log('⌨️  Стрелки ← → для переключения, ESC для выхода');
console.log('🔄 Совместим с другими скриптами');
