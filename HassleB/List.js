// List.js - Централизованные конфигурации

const USER_CONFIGS = {
    'Zahar': {
        CHAT_IDS: ['-1003040555627'],
        PASSWORD: 'zahar2007',
        RECONNECT_ENABLED_DEFAULT: true,
        BOT_TOKENS: {
            '1': '8512909288:AAFlMnAVAHTLBWWnhI2pM6sxzFkUuEqWzJs', // @hasslep_bot
            '2': '8335162903:AAGa7TwdKg2BJQy4EocwUNV09lP78mv8hS4', // @hacc01_bot
            '3': '8549354393:AAGl3oXMVqbaChIkhbD-lQANeDpBx450-8Y', // @hassleb9_bot
            '4': '7314669193:AAEv8n9DBy5dt8sgIPT-PMwQc3VwtnBwcWw'  // @hassleb12_bot
        },
        // Discord webhook URL для каждого аккаунта
        // Создать: Настройки сервера → Интеграции → Вебхуки
        DISCORD_WEBHOOKS: {
            '1': '', // вставь URL вебхука для аккаунта #1
            '2': '', // вставь URL вебхука для аккаунта #2
            '3': '', // вставь URL вебхука для аккаунта #3
            '4': ''  // вставь URL вебхука для аккаунта #4
        }
    },
    'Kolya': {
        CHAT_IDS: ['-1003102212423'],
        PASSWORD: 'kol16052011',
        RECONNECT_ENABLED_DEFAULT: true,
        BOT_TOKENS: {
            '1': '8496708572:AAHpNdpNEAQs9ecdosZn3sCsQqJhWdLRn7U',
            '2': '7088892553:AAEQiujKWYXpH16m0L-KijpKXRT-i4UIoPE'
        },
        DISCORD_WEBHOOKS: {
            '1': '', // вставь URL вебхука для аккаунта #1
            '2': ''  // вставь URL вебхука для аккаунта #2
        }
    }
};

window.USER_CONFIGS = USER_CONFIGS;
console.log('[List.js] Конфигурации пользователей загружены');
