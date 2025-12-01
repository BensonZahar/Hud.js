// List.js - Централизованные конфигурации
const USER_CONFIGS = {
    'Zahar': {
        CHAT_IDS: ['-1003040555627'],
        PASSWORD: 'zahar2007',
        ACCOUNT_NUMBER = "2",
        RECONNECT_ENABLED_DEFAULT: true
    },
    'Kirill': {
        CHAT_IDS: ['-1003202329790'],
        PASSWORD: '09230923',
        RECONNECT_ENABLED_DEFAULT: false
    },
    'Kolya': {
        CHAT_IDS: ['-1003102212423'],
        PASSWORD: 'kol16052011',
        RECONNECT_ENABLED_DEFAULT: true
    }
};

// Экспортируем в глобальную область
window.USER_CONFIGS = USER_CONFIGS;
console.log('[List.js] Конфигурации пользователей загружены');
