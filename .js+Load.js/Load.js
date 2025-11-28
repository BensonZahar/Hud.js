// Load.js — Умный загрузчик 2025

const username = 'BensonZahar';
const repo = 'Hud.js';
const basePath = '.js%2BLoad.js';

// ИМЯ ПРОФИЛЯ ПРИХОДИТ ИЗ hasslebot_exe.py
const selectedProfile = 'Zahar.js'; // ← будет заменяться автоматически

function loadProfileAndStart() {
    const listUrl = `https://raw.githubusercontent.com/${username}/${repo}/main/${basePath}/List.js`;

    fetch(listUrl)
        .then(r => r.ok ? r.text() : Promise.reject(r.status))
        .then(text => {
            // Выполняем List.js
            eval(text);

            if (!PROFILES || !PROFILES[selectedProfile]) {
                console.error(`Профиль "${selectedProfile}" не найден в List.js`);
                return;
            }

            // Внедряем константы профиля в глобальную область
            const profile = PROFILES[selectedProfile];
            Object.assign(window, profile); // Теперь CHAT_IDS, PASSWORD и т.д. доступны везде

            console.log(`Профиль "${selectedProfile}" загружен`);

            // Загружаем основной код
            const codeUrl = `https://raw.githubusercontent.com/${username}/${repo}/main/${basePath}/Code.js`;
            fetch(codeUrl)
                .then(r => r.ok ? r.text() : Promise.reject())
                .then(code => {
                    eval(code);
                    console.log('Основной код успешно загружен');
                })
                .catch(() => console.error('Ошибка загрузки Code.js'));
        })
        .catch(err => {
            console.error('Ошибка загрузки List.js:', err);
        });
}

// Запуск
console.log(`Запуск HASSLE BOT → Профиль: ${selectedProfile}`);
loadProfileAndStart();
