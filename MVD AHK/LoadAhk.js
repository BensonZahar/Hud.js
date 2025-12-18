const RANK = "";
const FIRST_NAME = "";
const LAST_NAME = "";
const CALLSIGN = "";
// Параметры загрузки скрипта
const username = 'BensonZahar';
const repo = 'Hud.js';
const folder = 'MVD AHK';
const filename = 'mvd.js';
// Функция загрузчика с retry
function loadScriptFromGitHub(username, repo, folder, filename, retries = 5) {
    const path = folder ? `${encodeURIComponent(folder)}/` : '';
    const url = `https://raw.githubusercontent.com/${username}/${repo}/main/${path}${filename}`;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
            eval(xhr.responseText);
            console.log(`Скрипт ${filename} загружен и выполнен успешно`);
        } else {
            console.error(`HTTP error! status: ${xhr.status} для ${url}`);
            if (retries > 0) {
                console.log(`Повторная попытка... Осталось попыток: ${retries - 1}`);
                setTimeout(() => loadScriptFromGitHub(username, repo, folder, filename, retries - 1), 2000);
            } else {
                console.error(`Не удалось загрузить скрипт AHK ${filename} после всех попыток`);
            }
        }
    };
    xhr.onerror = function() {
        console.error(`Ошибка сети при загрузке скрипта ${filename} с ${url}`);
        if (retries > 0) {
            console.log(`Повторная попытка... Осталось попыток: ${retries - 1}`);
            setTimeout(() => loadScriptFromGitHub(username, repo, folder, filename, retries - 1), 2000);
        } else {
            console.error(`Не удалось загрузить скрипт AHK ${filename} после всех попыток`);
        }
    };
    xhr.send();
}
// Запуск загрузчика
loadScriptFromGitHub(username, repo, folder, filename);
// ============================================
// 📦 УНИВЕРСАЛЬНЫЙ ЗАГРУЗЧИК ИНТЕРФЕЙСОВ
// ⚠️ Полностью совместим с другими скриптами
// ============================================

// ============================================
// 📦 СЕКЦИЯ 1: Регистрация кастомных интерфейсов
// ============================================
const customComponents = {
    Theory2: p(() => d(() => import("./Theory2.js"), ["./Theory2.js", "./speed.js", "./Close.js", "./telegram-authenticator.js", "./long-arrow-left-secondary.js", "./close2.js", "./Button.js", "./donate.js", "./money.js", "./Button.css", "./Close.css", "./ScrollableContainer.js", "./dom.js", "./ScrollableContainer.css", "./Theory2.css"], import.meta.url)),
   
    CustomInterface1: p(() => d(() => import("./CustomInterface1.js"), ["./CustomInterface1.js", "./CustomInterface1.css"], import.meta.url)),
   
    MyAwesomeUI: p(() => d(() => import("./MyAwesomeUI.js"), ["./MyAwesomeUI.js", "./Button.js", "./Button.css", "./Close.js", "./Close.css", "./MyAwesomeUI.css"], import.meta.url))
};

// ============================================
// ⚙️ СЕКЦИЯ 2: Конфигурация интерфейсов
// ============================================
const customConfig = {
    Theory2: {
        open: { status: !1 },
        show: !0,
        options: { hideHud: !0, hideChat: !0 }
    },
   
    CustomInterface1: {
        open: { status: !1 },
        show: !0,
        options: { hideHud: !1, hideChat: !1 }
    },
   
    MyAwesomeUI: {
        open: { status: !1 },
        show: !0,
        options: { hideHud: !0, hideChat: !0, showControlsButton: !0 }
    }
};

// ============================================
// 🔧 РЕГИСТРАЦИЯ КАСТОМНЫХ ИНТЕРФЕЙСОВ
// ============================================
Object.keys(customConfig).forEach(name => {
    td[name] = customComponents[name];
    od[name] = customConfig[name];
});
console.log(`✅ Зарегистрировано ${Object.keys(customConfig).length} кастомных интерфейсов`);



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
    console.log('⌨️ Обработчик клавиш ← → установлен');
        }
};
