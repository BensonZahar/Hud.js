// List.js - Централизованные конфигурации
const USER_CONFIGS = {
    'Zahar': {
        CHAT_IDS: ['-1003040555627'],
        SERVER_TOKENS: {
            '4': '8496708572:AAHpNdpNEAQs9ecdosZn3sCsQqJhWdLRn7U',
            '5': '7088892553:AAEQiujKWYXpH16m0L-KijpKXRT-i4UIoPE',
            '6': '7318283272:AAEpKje_GRsGwYJj1GROy9jovLayo--i4QY',
            '12': '7314669193:AAEMOdTUVpuKptq5x-Wf_uqoNtcYnMM12oU'
        },
        DEFAULT_TOKEN: '8184449811:AAE-nssyxdjAGnCkNCKTMN8rc2xgWEaVOFA',
        PASSWORD: 'zahar2007',
        RECONNECT_ENABLED_DEFAULT: true
    },
    'Kirill': {
        CHAT_IDS: ['-1003202329790'],
        SERVER_TOKENS: {
            '4': '8496708572:AAHpNdpNEAQs9ecdosZn3sCsQqJhWdLRn7U',
            '5': '7088892553:AAEQiujKWYXpH16m0L-KijpKXRT-i4UIoPE',
            '6': '7318283272:AAEpKje_GRsGwYJj1GROy9jovLayo--i4QY',
            '12': '7314669193:AAEMOdTUVpuKptq5x-Wf_uqoNtcYnMM12oU'
        },
        DEFAULT_TOKEN: '8184449811:AAE-nssyxdjAGnCkNCKTMN8rc2xgWEaVOFA',
        PASSWORD: 'kirill2007',
        RECONNECT_ENABLED_DEFAULT: true
    },
    'Kolya': {
        CHAT_IDS: ['-1003102212423'],
        SERVER_TOKENS: {
            '4': '8496708572:AAHpNdpNEAQs9ecdosZn3sCsQqJhWdLRn7U',
            '5': '7088892553:AAEQiujKWYXpH16m0L-KijpKXRT-i4UIoPE',
            '6': '7318283272:AAEpKje_GRsGwYJj1GROy9jovLayo--i4QY',
            '12': '7314669193:AAEMOdTUVpuKptq5x-Wf_uqoNtcYnMM12oU'
        },
        DEFAULT_TOKEN: '8184449811:AAE-nssyxdjAGnCkNCKTMN8rc2xgWEaVOFA',
        PASSWORD: 'kolya2007',
        RECONNECT_ENABLED_DEFAULT: false
    }
};

// Экспортируем в глобальную область
window.USER_CONFIGS = USER_CONFIGS;
console.log('[List.js] Конфигурации пользователей загружены');
