// Load.js - Улучшенный загрузчик с поддержкой конфигураций
const username = 'BensonZahar';
const repo = 'Hud.js';
const currentUser = ''; // ИЗМЕНЯЙТЕ ЭТО ДЛЯ РАЗНЫХ ПОЛЬЗОВАТЕЛЕЙ: 'Zahar', 'Kirill', 'Kolya'

// Функция для поиска объекта чата по сигнатуре
function findChatObject() {
    // Ищем в глобальном объекте window
    for (let key in window) {
        try {
            const obj = window[key];
            // Проверяем, что это объект с нужной структурой
            if (obj && 
                typeof obj === 'object' && 
                obj.methods && 
                typeof obj.methods === 'object' &&
                typeof obj.methods.add === 'function') {
                
                console.log(`✅ Найден объект чата: ${key}`);
                return obj;
            }
        } catch (e) {
            // Игнорируем ошибки доступа к свойствам
        }
    }
    return null;
}

// Установка хука на чат с автопоиском
function setupChatHook() {
    const chatObject = findChatObject();
    
    if (chatObject && chatObject.methods && chatObject.methods.add) {
        const originalAdd = chatObject.methods.add;
        
        chatObject.methods.add = function(e, s, t) {
            const result = originalAdd.call(this, e, s, t);
            
            // Вызываем наш кастомный обработчик
            if (window.OnChatAddMessage) {
                window.OnChatAddMessage(e, s, t);
            }
            
            return result;
        };
        
        console.log('✅ Хук на чат установлен успешно');
        return true;
    } else {
        console.error('❌ Объект чата не найден');
        return false;
    }
}

// Пытаемся установить хук
if (!setupChatHook()) {
    // Если не получилось сразу, пробуем через небольшую задержку
    console.log('🔄 Повторная попытка через 1 секунду...');
    setTimeout(() => {
        if (!setupChatHook()) {
            console.error('❌ Не удалось установить хук на чат');
        }
    }, 1000);
}

// Функция загрузчика с retry
function loadScriptFromGitHub(filename, retries = 5) {
    const url = `https://raw.githubusercontent.com/${username}/${repo}/main/HassleB/${filename}`;
    
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    eval(xhr.responseText);
                    console.log(`✅ Скрипт ${filename} загружен и выполнен успешно`);
                    resolve();
                } catch (err) {
                    console.error(`❌ Ошибка выполнения ${filename}:`, err);
                    reject(err);
                }
            } else {
                console.error(`HTTP error! status: ${xhr.status} для ${url}`);
                if (retries > 0) {
                    console.log(`🔄 Повторная попытка ${filename}... Осталось попыток: ${retries - 1}`);
                    setTimeout(() => {
                        loadScriptFromGitHub(filename, retries - 1).then(resolve).catch(reject);
                    }, 2000);
                } else {
                    reject(new Error(`Не удалось загрузить ${filename} после всех попыток`));
                }
            }
        };
        
        xhr.onerror = function() {
            console.error(`Ошибка сети при загрузке ${filename}`);
            if (retries > 0) {
                console.log(`🔄 Повторная попытка ${filename}... Осталось попыток: ${retries - 1}`);
                setTimeout(() => {
                    loadScriptFromGitHub(filename, retries - 1).then(resolve).catch(reject);
                }, 2000);
            } else {
                reject(new Error(`Не удалось загрузить ${filename} после всех попыток`));
            }
        };
        
        xhr.send();
    });
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
    
    // Применяем константы глобально
    window.CHAT_IDS = userConfig.CHAT_IDS;
    window.DEFAULT_TOKEN = userConfig.DEFAULT_TOKEN;
    window.PASSWORD = userConfig.PASSWORD;
    window.RECONNECT_ENABLED_DEFAULT = userConfig.RECONNECT_ENABLED_DEFAULT;
    
    console.log(`✅ Конфигурация для пользователя "${currentUser}" применена:`, {
        chatIds: userConfig.CHAT_IDS,
        password: '***' + userConfig.PASSWORD.slice(-4),
        reconnect: userConfig.RECONNECT_ENABLED_DEFAULT
    });
    
    return true;
}

// Последовательная загрузка скриптов
async function initializeScripts() {
    try {
        console.log(`🚀 Начало загрузки для пользователя: ${currentUser}`);
        
        // 1. Загружаем List.js (конфигурации)
        console.log('📋 Загрузка List.js...');
        await loadScriptFromGitHub('List.js');
        
        // 2. Применяем конфигурацию для текущего пользователя
        console.log(`⚙️ Применение конфигурации для ${currentUser}...`);
        if (!applyUserConfig()) {
            throw new Error('Не удалось применить конфигурацию пользователя');
        }
        
        // 3. Загружаем Code.js (основной код)
        console.log('📦 Загрузка Code.js...');
        await loadScriptFromGitHub('Code.js');
        
        console.log(`🎉 Все скрипты успешно загружены для ${currentUser}!`);
        
        // 4. Проверяем установку хука после загрузки всех скриптов
        setTimeout(() => {
            if (window.OnChatAddMessage) {
                console.log('✅ OnChatAddMessage успешно инициализирован');
            } else {
                console.warn('⚠️ OnChatAddMessage не найден, но это может быть нормально');
            }
        }, 1000);
        
    } catch (error) {
        console.error('❌ Критическая ошибка при инициализации:', error);
        alert(`Ошибка загрузки скриптов для ${currentUser}: ${error.message}`);
    }
}

// Запуск загрузчика
initializeScripts();
