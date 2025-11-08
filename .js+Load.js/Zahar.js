// ==UserScript==
// @name         Hassle AutoLogin (Password Saver)
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Сохраняет пароль при первом вводе и использует его для автологина
// @author       You
// @match        *://radmir.online/*
// @match        *://localhost/*
// @match        *://127.0.0.1/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    const debugLog = (msg) => console.log('[AutoLogin]', msg);

    const autoLoginConfig = {
        password: GM_getValue('saved_password', ''), // Загружаем из GM
        enabled: true,
        maxAttempts: 15,
        attemptInterval: 800
    };

    function savePassword(pwd) {
        GM_setValue('saved_password', pwd);
        debugLog(`Пароль сохранён: ${pwd}`);
        alert(`Пароль сохранён! Теперь будет автологин.`);
    }

    function clearPassword() {
        GM_deleteValue('saved_password');
        autoLoginConfig.password = '';
        debugLog('Пароль удалён');
        alert('Пароль удалён из памяти');
    }

    function setupAutoLogin(attempt = 1) {
        if (!autoLoginConfig.enabled) return;

        if (attempt > autoLoginConfig.maxAttempts) {
            debugLog('Превышено количество попыток');
            return;
        }

        if (!window.getInterfaceStatus || !window.getInterfaceStatus("Authorization")) {
            debugLog(`Ожидание интерфейса Authorization... (${attempt})`);
            setTimeout(() => setupAutoLogin(attempt + 1), autoLoginConfig.attemptInterval);
            return;
        }

        const authInstance = window.interface("Authorization");
        if (!authInstance) {
            setTimeout(() => setupAutoLogin(attempt + 1), autoLoginConfig.attemptInterval);
            return;
        }

        const loginInstance = authInstance.getInstance("auth");
        if (!loginInstance) {
            setTimeout(() => setupAutoLogin(attempt + 1), autoLoginConfig.attemptInterval);
            return;
        }

        // === ПАРОЛЬ УЖЕ ЕСТЬ — АВТОВХОД ===
        if (autoLoginConfig.password) {
            debugLog(`Автоввод сохранённого пароля: ${autoLoginConfig.password}`);
            loginInstance.password.value = autoLoginConfig.password;

            setTimeout(() => {
                if (loginInstance.password.value === autoLoginConfig.password) {
                    try {
                        loginInstance.onClickEvent("play");
                        debugLog('Автовход выполнен');
                        alert(`Автовход выполнен с сохранённым паролем`);
                    } catch (e) {
                        debugLog('Ошибка входа: ' + e.message);
                    }
                }
            }, 200);
            return;
        }

        // === ПАРОЛЯ НЕТ — ПЕРЕХВАТ ВВОДА ===
        if (!loginInstance._hooked) {
            debugLog('Ожидаем ручного ввода пароля...');
            const originalClick = loginInstance.onClickEvent;

            loginInstance.onClickEvent = function(action) {
                if (action === "play") {
                    const entered = loginInstance.password.value.trim();
                    if (entered && entered.length >= 3) {
                        debugLog(`Захвачен пароль: ${entered}`);
                        autoLoginConfig.password = entered;
                        savePassword(entered);
                        alert(`Пароль "${entered}" сохранён! Теперь будет автологин.`);
                    }
                }
                return originalClick.apply(this, arguments);
            };

            loginInstance._hooked = true;
        }
    }

    // === ПЕРЕХВАТ ОТКРЫТИЯ АВТОРИЗАЦИИ ===
    const origOpen = window.openInterface;
    window.openInterface = function(name, ...args) {
        const result = origOpen.apply(this, arguments);
        if (name === "Authorization") {
            debugLog('Открыт интерфейс Authorization — запускаем автовход');
            setTimeout(setupAutoLogin, 1000);
        }
        return result;
    };

    // === КНОПКИ В КОНСОЛИ ДЛЯ ТЕСТА ===
    window.clearSavedPassword = clearPassword;
    window.showSavedPassword = () => alert(GM_getValue('saved_password', 'НЕТ'));

    debugLog('Скрипт автовхода загружен. Введите пароль вручную — он сохранится.');

    // Запуск при старте
    setTimeout(setupAutoLogin, 2000);
})();
