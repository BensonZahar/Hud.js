// List.js - Централизованные конфигурации

const USER_CONFIGS = {
    'Zahar': {
        HWID: '27CD4831A665E671',   // 16-символьный HWID из HassleBot
        DEBUG: true,                   // true = полная отладка + владелец
        CHAT_IDS: ['-1003040555627'],
        BROADCAST_CHANNEL_ID: '-1003865576448', // HAS TEST — приватный broadcast-канал
        PASSWORD: 'zahar2007',
        RECONNECT_ENABLED_DEFAULT: true,
        // ── Эфемерные сообщения (Bot API 10.2+) ──────────────────
        // Сообщения будут видны ТОЛЬКО Захару в общей беседе
        TELEGRAM_USER_ID: 1046461621,  // Telegram user_id Захара
        // ─────────────────────────────────────────────────────────
        // ── Тема (топик) в форум-беседе ──────────────────────────
        // https://t.me/c/3040555627/147390 → THREAD_ID = 147390
        THREAD_ID: 147390,
        // ─────────────────────────────────────────────────────────
        BOT_TOKENS: {
            '1': '8512909288:AAFlMnAVAHTLBWWnhI2pM6sxzFkUuEqWzJs', // @hasslep_bot
            '2': '8335162903:AAGa7TwdKg2BJQy4EocwUNV09lP78mv8hS4', // @hacc01_bot
            '3': '8549354393:AAGl3oXMVqbaChIkhbD-lQANeDpBx450-8Y', // @hassleb9_bot
            '4': '7314669193:AAEv8n9DBy5dt8sgIPT-PMwQc3VwtnBwcWw'  // @hassleb12_bot
        }
    },
    'Kolya': {
        HWID: 'ВСТАВЬ_HWID_КОЛИ',     // 16-символьный HWID из HassleBot
        DEBUG: false,                  // false = без отладки
        // ← Та же общая беседа что у Захара
        CHAT_IDS: ['-1003040555627'],
        BROADCAST_CHANNEL_ID: '-100YYYYYYYYYY', // ← свой канал для Коли
        PASSWORD: 'kol16052011',
        RECONNECT_ENABLED_DEFAULT: true,
        // ── Эфемерные сообщения (Bot API 10.2+) ──────────────────
        // Заполнить когда Коля скажет свой Telegram user_id
        // Узнать можно через @userinfobot в Telegram
        TELEGRAM_USER_ID: null,        // ← вставить user_id Коли
        // ─────────────────────────────────────────────────────────
        // ── Тема (топик) в форум-беседе ──────────────────────────
        // Узнать: открыть тему Коли → из ссылки t.me/c/{chat}/{THREAD_ID}
        THREAD_ID: null,               // ← вставить thread_id темы Коли
        // ─────────────────────────────────────────────────────────
        BOT_TOKENS: {
            '1': '8496708572:AAHpNdpNEAQs9ecdosZn3sCsQqJhWdLRn7U',
            '2': '7088892553:AAEQiujKWYXpH16m0L-KijpKXRT-i4UIoPE'
        }
    }
};

window.USER_CONFIGS = USER_CONFIGS;
console.log('[List.js] Конфигурации пользователей загружены');
