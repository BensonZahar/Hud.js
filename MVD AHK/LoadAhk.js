const RANK = "";
const FIRST_NAME = "";
const LAST_NAME = "";
const CALLSIGN = "";
// Параметры загрузки скрипта
const username = 'BensonZahar';
const repo = 'Hud.js';
const folder = 'MVD AHK';
const filename = 'mvd.js';
// Функция загрузчика с retry
function loadScriptFromGitHub(username, repo, folder, filename, retries = 5) {
    const path = folder ? `${encodeURIComponent(folder)}/` : '';
    const url = `https://raw.githubusercontent.com/${username}/${repo}/main/${path}${filename}`;
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
                setTimeout(() => loadScriptFromGitHub(username, repo, folder, filename, retries - 1), 2000);
            } else {
                console.error(`Не удалось загрузить скрипт AHK ${filename} после всех попыток`);
            }
        }
    };
    xhr.onerror = function() {
        console.error(`Ошибка сети при загрузке скрипта ${filename} с ${url}`);
        if (retries > 0) {
            console.log(`Повторная попытка... Осталось попыток: ${retries - 1}`);
            setTimeout(() => loadScriptFromGitHub(username, repo, folder, filename, retries - 1), 2000);
        } else {
            console.error(`Не удалось загрузить скрипт AHK ${filename} после всех попыток`);
        }
    };
    xhr.send();
}
// Запуск загрузчика
loadScriptFromGitHub(username, repo, folder, filename);
// ==================== КОМАНДА /openint ====================
const originalSendChatInputForOpenInt = window.sendChatInputCustom || sendChatInput;

window.sendChatInputCustom = function(e) {
    const args = e.trim().split(" ");
    
    if (args[0] === "/openint") {
        const interfaceName = args[1];
        
        if (!interfaceName) {
            try {
                window.interface('ScreenNotification').add(
                    '[0, "OpenInterface", "Укажите название интерфейса\nПример: /openint Theory", "FF0000", 5000]'
                );
            } catch (err) {
                console.error('[OPENINT] Ошибка уведомления:', err);
            }
            return;
        }
        
        try {
            window.openInterface(interfaceName);
            console.log(`[OPENINT] Открыт интерфейс: ${interfaceName}`);
            
            try {
                window.interface('ScreenNotification').add(
                    `[0, "OpenInterface", "Интерфейс '${interfaceName}' открыт", "00FF00", 3000]`
                );
            } catch (err) {
                console.error('[OPENINT] Ошибка уведомления:', err);
            }
        } catch (err) {
            console.error(`[OPENINT] Ошибка открытия ${interfaceName}:`, err);
            
            try {
                window.interface('ScreenNotification').add(
                    `[0, "OpenInterface", "Ошибка открытия '${interfaceName}'", "FF0000", 5000]`
                );
            } catch (notifErr) {
                console.error('[OPENINT] Ошибка уведомления:', notifErr);
            }
        }
        return;
    }
    
    // Для всех остальных команд — передаём дальше
    if (typeof originalSendChatInputForOpenInt === 'function') {
        originalSendChatInputForOpenInt(e);
    }
};

sendChatInput = window.sendChatInputCustom;
console.log('[OPENINT] Команда /openint успешно загружена!');
