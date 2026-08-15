// List.js - Централизованные конфигурации
// Один BOT_TOKEN на пользователя — все аккаунты различаются по номеру #N

const USER_CONFIGS = {
    'Zahar': {
        CHAT_IDS: ['-1003040555627'],
        PASSWORD: 'zahar2007',
        RECONNECT_ENABLED_DEFAULT: true,
        BOT_TOKEN: '8512909288:AAFlMnAVAHTLBWWnhI2pM6sxzFkUuEqWzJs' // @hasslep_bot — один на все аккаунты
    },
    'Kolya': {
        CHAT_IDS: ['-1003102212423'],
        PASSWORD: 'kol16052011',
        RECONNECT_ENABLED_DEFAULT: true,
        BOT_TOKEN: '8496708572:AAHpNdpNEAQs9ecdosZn3sCsQqJhWdLRn7U' // один на все аккаунты
    }
};

window.USER_CONFIGS = USER_CONFIGS;
console.log('[List.js] Конфигурации пользователей загружены');
