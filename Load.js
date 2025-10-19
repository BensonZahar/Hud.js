// Параметры загрузки скрипта
const username = 'BensonZahar';
const repo = 'Hud.js';
const filename = '';

// Установка хука на чат
if (tt?.methods?.add) {
    const originalAdd = tt.methods.add;
    tt.methods.add = function(e, s, t) {
        const result = originalAdd.call(this, e, s, t);
        window.OnChatAddMessage?.(e, s, t);
        return result;
    };
    console.log('Хук на чат установлен');
} else {
    console.error('tt.methods.add не найден, хук не установлен');
}

// Функция загрузчика с retry
function loadScriptFromGitHub(username, repo, filename, retries = 5) {
    const url = `https://raw.githubusercontent.com/${username}/${repo}/main/${filename}`;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
            eval(xhr.responseText);
            console.log(`Скрипт ${filename} загружен и выполнен успешно`);
        } else {
            console.error(`HTTP error! status: ${xhr.status} для ${url}`);
            if (retries > 0) {
                console.log(`Повторная попытка... Осталось попыток: ${retries - 1}`);
                setTimeout(() => loadScriptFromGitHub(username, repo, filename, retries - 1), 2000);
            } else {
                console.error(`Не удалось загрузить скрипт ${filename} после всех попыток`);
            }
        }
    };
    xhr.onerror = function() {
        console.error(`Ошибка сети при загрузке скрипта ${filename} с ${url}`);
        if (retries > 0) {
            console.log(`Повторная попытка... Осталось попыток: ${retries - 1}`);
            setTimeout(() => loadScriptFromGitHub(username, repo, filename, retries - 1), 2000);
        } else {
            console.error(`Не удалось загрузить скрипт ${filename} после всех попыток`);
        }
    };
    xhr.send();
}

// Запуск загрузчика
loadScriptFromGitHub(username, repo, filename);
