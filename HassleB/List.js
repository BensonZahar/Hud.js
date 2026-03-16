// List.js - Централизованные конфигурации

// Токены Telegram-ботов для каждого аккаунта (1–8)
// Замените PLACEHOLDER_TOKEN_N на реальные токены от @BotFather
const ACCOUNT_BOT_TOKENS = {
    '1': '8335162903:AAEIIBJJwJybcfk3sZBrMhv3hWm2u4FeRHY',
    '2': '8689391102:AAFoas9FUjBhPwaJsJ9yJixzTAJ2Bjhom5I',
    '3': '8641308857:AAGyBkHJu3OGLiDZD8bXbIfFJuOEh2_dz-Y',
    '4': '8437476753:AAHiWXIFByf2s2TCO7JbKVj4LMKO_plrAKk',
    '5': '8709864021:AAHCs8QCioLBWfUJLyqxVuS_TCqDIbc3Naw',
    '6': '7318283272:AAEpKje_GRsGwYJj1GROy9jovLayo--i4QY',   // СТАРЫЙ (бывший сервер 6) — заменить
    '7': '8549354393:AAH3KUXtuSBZJ4SO4qw5s5WmWJ9_kypclBY',   // СТАРЫЙ (бывший сервер 9) — заменить
    '8': '7314669193:AAEMOdTUVpuKptq5x-Wf_uqoNtcYnMM12oU'    // СТАРЫЙ (бывший сервер 12) — заменить
};
window.ACCOUNT_BOT_TOKENS = ACCOUNT_BOT_TOKENS;

const USER_CONFIGS = {
    'Zahar': {
        CHAT_IDS: ['-1003040555627'],
        PASSWORD: 'zahar2007',
        RECONNECT_ENABLED_DEFAULT: true
    },
    'Kirill1': {
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
console.log('[List.js] Конфигурации пользователей и токены аккаунтов загружены');
