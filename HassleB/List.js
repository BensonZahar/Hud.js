// List.js - Централизованные конфигурации

const USER_CONFIGS = {
    'Zahar': {
        HWID: '27CD4831A665E671',   // 16-символьный HWID из HassleBot
        DEBUG: true,                   // true = полная отладка + владелец
        CHAT_IDS: ['-1003040555627'],
        RECONNECT_ENABLED_DEFAULT: true
    },
    'Kolya': {
        HWID: '7F1D49243EE66277',     // 16-символьный HWID из HassleBot
        DEBUG: false,                  // false = без отладки
        CHAT_IDS: ['-1003102212423'],
        RECONNECT_ENABLED_DEFAULT: true
    }
};

// Токены ботов и пароли автовхода здесь НЕ хранятся: каждый пользователь добавляет их
// в установщике (кнопки «Токены аккаунтов» и «Пароли»), они сохраняются локально на ПК.
window.USER_CONFIGS = USER_CONFIGS;
console.log('[List.js] Конфигурации пользователей загружены');
