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
            '1': '8768203857:AAGXwptl11WPvHZ_FI72z4G7SlR-EE-RHvE', // @hb_z01_bot
            '2': '8568137706:AAFO8hUCwR7fV0k3cSQEc8PmfUnhw4gHxb8', // @hb_z02_bot (обновлён)
            '3': '8931904688:AAEIQA4staB0WAnt4QXduYWyC60WonOYDTM',  // @hb_z03_bot (обновлён)
            '4': '8869177802:AAHwbKc7ViQccwnTb81L_enZbz7-8Gy9XVg', // @hb_z04_bot (обновлён)
            '5': '8973172922:AAE-5cVFDy_dG_Ll-S-naAs2Vqz9ZJ8KMmI',  // @hb_z05_bot
            '6': '8604126341:AAGPf5k4iRLy6pXZqpBsB8-FGI0k8xnmPv8',  // @hb_z06_bot
            '7': '8843502295:AAG-DkiSX5imJf25g89ROws17T10IEZceLs',   // @hb_z07_bot
            '8': '8976072206:AAGW3wXfEgj0mvq_5tjGuihNTkhofQfpVgo'    // @hb_z08_bot
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
