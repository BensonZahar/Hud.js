// ══════════════════════════════════════════════════════════════════
//  ZkmScreenNotification.js  —  ЗАГРУЗЧИК (sideEffect, не трогается)
//
//  Тот же принцип, что и в zkm.js / MvdMenu.js загрузчиках, но
//  без import/export — оригинал это обычный IIFE без ES-модульных
//  имён из ./index.js, поэтому стрипать тут нечего.
//
//  1. Параллельно грузим с GitHub реальный ZkmScreenNotification.js
//     и реальный ZkmScreenNotification.css
//  2. CSS — инжектим как <style id="zkm-sn-style-remote"> в head
//     (в отличие от zkm.js, оригинальный ZkmScreenNotification.js
//     сам ничего не инжектит — здесь это делает загрузчик)
//  3. JS  — eval() прямо в скоупе модуля; оригинал сам вешает себя
//     на window.ZkmScreenNotification, как и раньше
//
//  IntLoad.js / установщик — не трогать.
//  Тип остаётся "sideEffect", имя "ZkmScreenNotification" — без изменений.
// ══════════════════════════════════════════════════════════════════

// ── Пути к оригиналам на GitHub ──────────────────────────────────
// Оригиналы лежат в MVD AHK/Кастом Интерфейсы/ (encodeURIComponent
// сам корректно закодирует кириллицу и пробел в имени папки).
const _GH_BASE = 'https://raw.githubusercontent.com/BensonZahar/Hud.js/main/MVD%20AHK/'
                + encodeURIComponent('Кастом Интерфейсы') + '/';
const _GH_JS   = _GH_BASE + 'ZkmScreenNotification.js';
const _GH_CSS  = _GH_BASE + 'ZkmScreenNotification.css';
const _RETRIES = 5;
const _DELAY   = 2000;

// ── XHR-загрузчик (без fetch, с ретраями как в LoadAhk.js) ──────
function _xhrGet(url, attempt) {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url + '?_=' + Date.now(), true);
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.responseText);
            } else {
                var err = new Error('HTTP ' + xhr.status);
                if (attempt < _RETRIES) {
                    console.warn('[ZkmSN loader] Ошибка ' + url + ', повтор ' + (attempt+1) + ':', err);
                    setTimeout(function() { _xhrGet(url, attempt + 1).then(resolve, reject); }, _DELAY);
                } else { reject(err); }
            }
        };
        xhr.onerror = function() {
            var err = new Error('Network error');
            if (attempt < _RETRIES) {
                console.warn('[ZkmSN loader] Сеть ' + url + ', повтор ' + (attempt+1));
                setTimeout(function() { _xhrGet(url, attempt + 1).then(resolve, reject); }, _DELAY);
            } else { reject(err); }
        };
        xhr.send();
    });
}

// ── Грузим JS и CSS параллельно ──────────────────────────────────
// top-level await: игра ждёт пока модуль вычислится, т.е. пока
// реальный код прилетит с GitHub. Никакой заглушки.
const [_jsText, _cssText] = await Promise.all([
    _xhrGet(_GH_JS, 0),
    _xhrGet(_GH_CSS, 0)
]);

// ── CSS: инжектим как <style> ────────────────────────────────────
const _style = document.createElement('style');
_style.id = 'zkm-sn-style-remote';
_style.textContent = _cssText;
document.head.appendChild(_style);

// ── JS: eval — оригинал сам вешает window.ZkmScreenNotification ──
eval(_jsText);

console.log('[ZkmSN loader] Загружен с GitHub');
