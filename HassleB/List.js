// List.js - Централизованные конфигурации

const USER_CONFIGS = {
    'Zahar': {
        HWID: '27CD4831A665E671',   // 16-символьный HWID из HassleBot
        DEBUG: true,                   // true = полная отладка + владелец
        CHAT_IDS: ['-1003040555627'],
        BROADCAST_CHANNEL_ID: '-1003865576448', // HAS TEST — приватный broadcast-канал (все боты — админы)
        PASSWORD: 'zahar2007',
        RECONNECT_ENABLED_DEFAULT: true,
        BOT_TOKENS: {
            '1': '8768203857:AAHF3VSCkegALLLLhrwdnsOCanRf2EKTH-c', // @hb_z01_bot
            '2': '8568137706:AAGWKSxG7Pf5R3dszSd3UErYh8GzZHdTlKY', // @hb_z02_bot
            '3': '8931904688:AAExb1DAyPU2ReLSMus4L-1VNKFhqy3FP_s', // @hb_z03_bot
            '4': '8869177802:AAE3bFckaVlFNnFD9V4ezuaUMAcch_nWjvo', // @hb_z04_bot
            '5': '8973172922:AAE-5cVFDy_dG_Ll-S-naAs2Vqz9ZJ8KMmI'  // @hb_z05_bot
        }
    },
    'Kolya': {
        HWID: 'ВСТАВЬ_HWID_КОЛИ',     // 16-символьный HWID из HassleBot
        DEBUG: false,                  // false = без отладки
        CHAT_IDS: ['-1003102212423'],
        BROADCAST_CHANNEL_ID: '-100YYYYYYYYYY', // ← свой канал для Коли
        PASSWORD: 'kol16052011',
        RECONNECT_ENABLED_DEFAULT: true,
        BOT_TOKENS: {
            '1': '8496708572:AAHpNdpNEAQs9ecdosZn3sCsQqJhWdLRn7U',
            '2': '7088892553:AAEQiujKWYXpH16m0L-KijpKXRT-i4UIoPE'
        }
    }
};

window.USER_CONFIGS = USER_CONFIGS;
console.log('[List.js] Конфигурации пользователей загружены');
