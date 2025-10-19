// Установка хука ("add") сразу в основном контексте
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

// Функция загрузчика с retry, используя XMLHttpRequest вместо fetch
function loadScriptFromGitHub(url, retries = 5) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
            eval(xhr.responseText);  // Eval загруженного кода (без хука)
            console.log('Скрипт с GitHub загружен и выполнен успешно');
        } else {
            console.error(`HTTP error! status: ${xhr.status}`);
            if (retries > 0) {
                console.log(`Повторная попытка... Осталось попыток: ${retries - 1}`);
                setTimeout(() => loadScriptFromGitHub(url, retries - 1), 2000);  // Задержка 2 сек перед retry
            } else {
                console.error('Не удалось загрузить скрипт после всех попыток');
            }
        }
    };
    xhr.onerror = function() {
        console.error('Ошибка сети при загрузке скрипта с GitHub');
        if (retries > 0) {
            console.log(`Повторная попытка... Осталось попыток: ${retries - 1}`);
            setTimeout(() => loadScriptFromGitHub(url, retries - 1), 2000);
        } else {
            console.error('Не удалось загрузить скрипт после всех попыток');
        }
    };
    xhr.send();
}

// Запуск загрузчика (замените URL)
const scriptUrl = 'https://raw.githubusercontent.com/ВАШ_ЮЗЕР/ВАШ_РЕПО/main/main_script.js';
loadScriptFromGitHub(scriptUrl);