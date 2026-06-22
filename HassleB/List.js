// List.js - Централизованные конфигурации

const USER_CONFIGS = {
    'Zahar': {
        CHAT_IDS: ['-1003040555627'],
        PASSWORD: 'zahar2007',
        // sha256(MachineGuid)[:16].upper() — можно несколько устройств
        HWID: ['XXXXXXXXXXXXXXXX'],
        DEBUG_ALLOWED: true,
        RECONNECT_ENABLED_DEFAULT: true,
        // Токены Telegram-ботов для аккаунтов Захара (1–8)
        BOT_TOKENS: {
            '1': '8512909288:AAEoTnIgdkvmrZ6DIVEgVFnG97tOzQQK3KU',
            '2': '8335162903:AAEIIBJJwJybcfk3sZBrMhv3hWm2u4FeRHY',
            '3': '8549354393:AAH3KUXtuSBZJ4SO4qw5s5WmWJ9_kypclBY',
            '4': '7314669193:AAEMOdTUVpuKptq5x-Wf_uqoNtcYnMM12oU', // новые
            '5': '8709864021:AAHCs8QCioLBWfUJLyqxVuS_TCqDIbc3Naw',
            '6': '8692734140:AAEHthG-PpPOoY_0qmG25bzHafLIlcErs3M',
            '7': '8770179898:AAEm93rbx8VGvuTJJX0grD47WSQf1LCvTcI',
            '8': '8789490440:AAHpJUJ4650E2SP62bDn7GEVggD9fiIYh54'
        }
    },
    'Kolya': {
        CHAT_IDS: ['-1003102212423'],
        PASSWORD: 'kol16052011',
        HWID: ['YYYYYYYYYYYYYYYY'],
        DEBUG_ALLOWED: false,
        RECONNECT_ENABLED_DEFAULT: true,
        // Токены Telegram-ботов для аккаунтов Коли (вставь свои)
        BOT_TOKENS: {
            '1': '8496708572:AAHpNdpNEAQs9ecdosZn3sCsQqJhWdLRn7U',
            '2': '7088892553:AAEQiujKWYXpH16m0L-KijpKXRT-i4UIoPE'
        }
    }
};

// Экспортируем в глобальную область
window.USER_CONFIGS = USER_CONFIGS;
console.log('[List.js] Конфигурации пользователей загружены');
