// List.js - Централизованные конфигурации

// ┌─────────────────────────────────────────────────────────┐
// │  ОБЩАЯ БЕСЕДА — одна для всех пользователей и ботов    │
// │  Все боты шлют ephemeral-сообщения с receiver_user_id  │
// │  → каждый видит только свои сообщения от бота          │
// └─────────────────────────────────────────────────────────┘
const SHARED_CHAT_ID = '-1003040555627'; // Беседа Захара (общая)

const USER_CONFIGS = {
    'Zahar': {
        CHAT_IDS: [SHARED_CHAT_ID],
        TELEGRAM_USER_ID: '1046461621',          // Telegram ID Захара
        BROADCAST_CHANNEL_ID: '-1003865576448',  // HAS TEST — приватный broadcast-канал
        PASSWORD: 'zahar2007',
        RECONNECT_ENABLED_DEFAULT: true,
        BOT_TOKENS: {
            '1': '8512909288:AAFlMnAVAHTLBWWnhI2pM6sxzFkUuEqWzJs', // @hasslep_bot
            '2': '8335162903:AAGa7TwdKg2BJQy4EocwUNV09lP78mv8hS4', // @hacc01_bot
            '3': '8549354393:AAGl3oXMVqbaChIkhbD-lQANeDpBx450-8Y', // @hassleb9_bot
            '4': '7314669193:AAEv8n9DBy5dt8sgIPT-PMwQc3VwtnBwcWw'  // @hassleb12_bot
        }
    },
    'Kolya': {
        CHAT_IDS: [SHARED_CHAT_ID],
        TELEGRAM_USER_ID: '',                    // ← Telegram ID Коли (скинет позже)
        BROADCAST_CHANNEL_ID: '-100YYYYYYYYYY',  // ← свой канал для Коли (уточнить)
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
