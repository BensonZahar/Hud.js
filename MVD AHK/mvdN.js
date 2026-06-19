// ──────────────────────────────────────────────────────────────────────
// ЗАГЛУШКА mvdN.js
// Реальный скрипт переехал в mvdF.js. Этот файл оставлен по старому
// имени специально для пользователей со старой версией LoadAhk.js —
// она по-прежнему запрашивает файл "mvdN.js" и делает eval() над ним.
//
// Ничего из основной логики МВД-АХК тут нет. Единственная задача —
// ничего не сломать (eval должен пройти без ошибок) и при попытке
// открыть меню (нажатие хоткея MENU_KEY) показать игроку уведомление
// о необходимости переустановки.
//
// LoadAhk.js (старая версия, уже встроенная в Index.js у пользователя)
// перед eval() патчит строку `var MENU_KEY = "Alt+0";` на реальный
// хоткей, который этот пользователь настраивал через установщик —
// поэтому строка ниже оставлена ИМЕННО в таком виде, как ожидает регэкс.
// ──────────────────────────────────────────────────────────────────────
var MENU_KEY = "Alt+0";

function _mvdOutdatedNotify() {
    var title = "АХК устарел";
    var text  = "У вас старая версия АХК. Переустановите через установщик.";
    try {
        var sn = window.interface && window.interface('ScreenNotification');
        if (sn && typeof sn.add === 'function') {
            if (typeof sn.hideAll === 'function') sn.hideAll();
            sn.add(`[1, "${title}", "${text}", "FF3030", 6000]`);
            console.log('[AHK-STUB] Показано уведомление об устаревшей версии (ScreenNotification)');
            return;
        }
    } catch (e) {}
    // Фолбэк, если ScreenNotification ещё не загружен в этой версии бандла
    try {
        window.openInterface('InformationTimer', [text, 6, false]);
        console.log('[AHK-STUB] Показано уведомление об устаревшей версии (InformationTimer)');
        return;
    } catch (e) {}
    console.warn('[AHK-STUB] ' + title + ': ' + text);
}

// Слушатель хоткея меню — копия парсинга комбо из основного скрипта,
// чтобы сработать на ТОТ ЖЕ хоткей, который уже настроен у пользователя.
window.addEventListener('keydown', function(e) {
    if (!MENU_KEY) return;
    var parts = MENU_KEY.toLowerCase().split('+').map(function (s) { return s.trim(); });
    var needAlt = parts.indexOf('alt') !== -1;
    var needCtrl = parts.indexOf('ctrl') !== -1;
    var needShift = parts.indexOf('shift') !== -1;
    var mainParts = parts.filter(function (p) { return p !== 'alt' && p !== 'ctrl' && p !== 'shift'; });
    var mainKey = mainParts[0] || '';
    var modOk = (!needAlt || e.altKey) && (!needCtrl || e.ctrlKey) && (!needShift || e.shiftKey);
    var keyOk = e.key.toLowerCase() === mainKey || e.code.toLowerCase() === mainKey;
    if (modOk && keyOk) {
        e.preventDefault && e.preventDefault();
        _mvdOutdatedNotify();
    }
});

console.log('[AHK-STUB] mvdN.js — заглушка. Установлена устаревшая версия, требуется переустановка через установщик.');
