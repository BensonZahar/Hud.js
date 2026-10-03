// ═══════════════════════════════════════════════════════════════════════
// LoadGang.js — загрузчик АХК «Банда» (beta 1.0)
//
// Встраивается установщиком в Index.js игры. При запуске подтягивает
// gang.js с GitHub, подставляет в него настройки из установщика
// (сейчас — только хоткей меню) и выполняет его.
//
// В gang.js сейчас: авто-угон + меню АХК (вкл/выкл).
// ═══════════════════════════════════════════════════════════════════════

(function () {

// ==================== СТАРТОВОЕ УВЕДОМЛЕНИЕ AHK ====================
// Подтверждает игроку, что АХК установлен и загружен.
(function _showAhkLoaded() {
    function _tryShow() {
        try {
            var gt = window.interface && window.interface('GameText');
            if (gt && typeof gt.add === 'function') {
                // Тип 3 = нижний GameText; ~n~ = перенос строки, ~g~ = зелёный цвет
                gt.add('[3, "АХК <span style=\\"color:#E25544\\">Банда</span>&nbsp;by konstt~n~~g~Запущен", 5000, 0, 0, false, false, 2.0]');
                console.log('[GANG] ✅ Стартовое уведомление показано');
                return true;
            }
        } catch (e) {}
        return false;
    }

    // Интерфейс GameText может быть ещё не готов — опрашиваем каждые 500 мс, до 30 сек
    if (!_tryShow()) {
        var _att = 0;
        var _tmr = setInterval(function () {
            _att++;
            if (_tryShow() || _att >= 60) clearInterval(_tmr);
        }, 500);
    }
})();
// ==================== КОНЕЦ СТАРТОВОГО УВЕДОМЛЕНИЯ ====================

// Хоткей открытия меню АХК (пусто = только команда /dahk). Меняется установщиком.
const MENU_KEY = "Alt+0";

// Параметры загрузки скрипта
const username = 'BensonZahar';
const repo = 'Hud.js';
const folder = 'GANG AHK';
const filename = 'gang.js';

// Загрузка с GitHub с повторными попытками
function loadScriptFromGitHub(retries) {
    const path = folder ? `${encodeURIComponent(folder)}/` : '';
    const url = `https://raw.githubusercontent.com/${username}/${repo}/main/${path}${filename}`;

    function retry(reason) {
        console.error(`[GANG] ${reason} (${url})`);
        if (retries > 0) {
            console.log(`[GANG] Повторная попытка... Осталось: ${retries - 1}`);
            setTimeout(function () { loadScriptFromGitHub(retries - 1); }, 2000);
        } else {
            console.error(`[GANG] Не удалось загрузить ${filename} после всех попыток`);
        }
    }

    const xhr = new XMLHttpRequest();
    xhr.open('GET', url + '?_=' + Date.now(), true);
    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            let scriptText = xhr.responseText;
            // ── Патчим MENU_KEY (в gang.js это var, не const) ──
            scriptText = scriptText.replace(/var MENU_KEY = "Alt\+0";/, function () {
                return 'var MENU_KEY = ' + JSON.stringify(MENU_KEY) + ';';
            });
            eval(scriptText);
            console.log(`[GANG] Скрипт ${filename} загружен и выполнен успешно`);
        } else {
            retry(`HTTP error! status: ${xhr.status}`);
        }
    };
    xhr.onerror = function () { retry('Ошибка сети'); };
    xhr.send();
}

loadScriptFromGitHub(5);

})();
