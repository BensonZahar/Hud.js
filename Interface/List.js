// ============================================
// 🌐 ЗАГРУЗЧИК LIST.JS С GITHUB
// ============================================
// Вставьте этот код в index.js

console.log('🚀 Инициализация загрузчика List.js...');

const username = 'BensonZahar';
const repo = 'Hud.js';
const folder = 'Interface';
const filename = 'List.js';

function loadScriptFromGitHub(username, repo, folder, filename, retries = 5) {
    const path = folder ? `${encodeURIComponent(folder)}/` : '';
    const url = `https://raw.githubusercontent.com/${username}/${repo}/main/${path}${filename}`;
    
    console.log(`🌐 Загрузка ${filename} с GitHub...`);
    console.log(`📍 URL: ${url}`);
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    
    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
            eval(xhr.responseText);
            console.log(`✅ Скрипт ${filename} загружен и выполнен успешно`);
        } else {
            console.error(`❌ HTTP error! status: ${xhr.status} для ${url}`);
            if (retries > 0) {
                console.log(`🔄 Повторная попытка... Осталось попыток: ${retries - 1}`);
                setTimeout(() => loadScriptFromGitHub(username, repo, folder, filename, retries - 1), 2000);
            } else {
                console.error(`❌ Не удалось загрузить скрипт ${filename} после всех попыток`);
            }
        }
    };
    
    xhr.onerror = function() {
        console.error(`❌ Ошибка сети при загрузке скрипта ${filename} с ${url}`);
        if (retries > 0) {
            console.log(`🔄 Повторная попытка... Осталось попыток: ${retries - 1}`);
            setTimeout(() => loadScriptFromGitHub(username, repo, folder, filename, retries - 1), 2000);
        } else {
            console.error(`❌ Не удалось загрузить скрипт ${filename} после всех попыток`);
        }
    };
    
    xhr.send();
}

// Запуск загрузчика
console.log('▶️ Запуск загрузки List.js...');
loadScriptFromGitHub(username, repo, folder, filename);
