// List.js - Централизованные конфигурации

const USER_CONFIGS = {
    'Zahar': {
        HWID: '27CD4831A665E671',   // 16-символьный HWID из HassleBot
        DEBUG: true,                   // true = полная отладка + владелец
        CHAT_IDS: ['-1003040555627'],
        PASSWORD: 'zahar2007',
        RECONNECT_ENABLED_DEFAULT: true
    },
    'Kolya': {
        HWID: 'ВСТАВЬ_HWID_КОЛИ',     // 16-символьный HWID из HassleBot
        DEBUG: false,                  // false = без отладки
        CHAT_IDS: ['-1003102212423'],
        PASSWORD: 'kol16052011',
        RECONNECT_ENABLED_DEFAULT: true
    }
};

// Токены ботов здесь НЕ хранятся: каждый пользователь добавляет свои аккаунты и токены
// в лончере (кнопка «Токены аккаунтов»), они сохраняются локально на ПК.
window.USER_CONFIGS = USER_CONFIGS;
console.log('[List.js] Конфигурации пользователей загружены');
