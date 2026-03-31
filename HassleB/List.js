// List.js - Централизованные конфигурации

// Токены Telegram-ботов для каждого аккаунта (1–8)
// Замените PLACEHOLDER_TOKEN_N на реальные токены от @BotFather
const ACCOUNT_BOT_TOKENS = {
    '1': '8335162903:AAEIIBJJwJybcfk3sZBrMhv3hWm2u4FeRHY',
    '2': '8689391102:AAFoas9FUjBhPwaJsJ9yJixzTAJ2Bjhom5I',
    '3': '8641308857:AAGyBkHJu3OGLiDZD8bXbIfFJuOEh2_dz-Y',
    '4': '8437476753:AAHiWXIFByf2s2TCO7JbKVj4LMKO_plrAKk',
    '5': '8709864021:AAHCs8QCioLBWfUJLyqxVuS_TCqDIbc3Naw',
    '6': '8692734140:AAEHthG-PpPOoY_0qmG25bzHafLIlcErs3M',   // СТАРЫЙ (бывший сервер 6) — заменить
    '7': '8770179898:AAEm93rbx8VGvuTJJX0grD47WSQf1LCvTcI',   // СТАРЫЙ (бывший сервер 9) — заменить
    '8': '8789490440:AAHpJUJ4650E2SP62bDn7GEVggD9fiIYh54'    // СТАРЫЙ (бывший сервер 12) — заменить
};
window.ACCOUNT_BOT_TOKENS = ACCOUNT_BOT_TOKENS;

const USER_CONFIGS = {
    'Zahar': {
        CHAT_IDS: ['-1003040555627'],
        PASSWORD: 'zahar2007',
        RECONNECT_ENABLED_DEFAULT: true
    },
    'Kirill': {
        CHAT_IDS: ['-1003040555627'],
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
console.log('[List.js] Конфигурации пользователей и токены аккаунтов загружены');
