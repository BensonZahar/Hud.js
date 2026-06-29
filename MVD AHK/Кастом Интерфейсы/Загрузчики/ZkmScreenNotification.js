// ══════════════════════════════════════════════════════════════════
//  ZkmScreenNotification.js  —  ЗАГРУЗЧИК (sideEffect, не трогается)
//
//  Тот же принцип, что и в zkm.js / MvdMenu.js загрузчиках, но
//  без import/export — оригинал это обычный IIFE без ES-модульных
//  имён из ./index.js, поэтому стрипать тут нечего.
//
//  1. Параллельно грузим с GitHub реальный ZkmScreenNotification.js
//     и реальный ZkmScreenNotification.css
//     JS — обязателен (падение = throw). CSS — опционален.
//  2. CSS — инжектим как <style id="zkm-sn-style-remote"> в head
//     (один раз за сессию, повторной вставки нет)
//  3. JS  — eval() прямо в скоупе модуля; оригинал сам вешает себя
//     на window.ZkmScreenNotification, как и раньше
//
//  IntLoad.js / установщик — не трогать.
//  Тип остаётся "sideEffect", имя "ZkmScreenNotification" — без изменений.
// ══════════════════════════════════════════════════════════════════

// ── Пути к оригиналам на GitHub ──────────────────────────────────
const _GH_BASE = 'https://raw.githubusercontent.com/BensonZahar/Hud.js/main/MVD%20AHK/'
                + encodeURIComponent('Кастом Интерфейсы') + '/';
const _GH_JS   = _GH_BASE + 'ZkmScreenNotification.js';
const _GH_CSS  = _GH_BASE + 'ZkmScreenNotification.css';
const _RETRIES = 5;
const _BASE_DELAY = 2000;

// ── XHR-загрузчик с ретраями ─────────────────────────────────────
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
                    var delay = Math.min(_BASE_DELAY * Math.pow(2, attempt), 16000);
                    console.warn('[ZkmSN loader] Ошибка ' + url + ', повтор ' + (attempt+1) + ' через ' + delay + 'мс:', err);
                    setTimeout(function() { _xhrGet(url, attempt + 1).then(resolve, reject); }, delay);
                } else { reject(err); }
            }
        };
        xhr.onerror = function() {
            var err = new Error('Network error');
            if (attempt < _RETRIES) {
                var delay = Math.min(_BASE_DELAY * Math.pow(2, attempt), 16000);
                console.warn('[ZkmSN loader] Сеть ' + url + ', повтор ' + (attempt+1) + ' через ' + delay + 'мс');
                setTimeout(function() { _xhrGet(url, attempt + 1).then(resolve, reject); }, delay);
            } else { reject(err); }
        };
        xhr.send();
    });
}

// ── Грузим JS (критично) и CSS (опционально) параллельно ─────────
// Promise.allSettled — падение CSS не убивает загрузку компонента.
// top-level await: игра ждёт пока модуль вычислится.
const [_jsResult, _cssResult] = await Promise.allSettled([
    _xhrGet(_GH_JS, 0),
    _xhrGet(_GH_CSS, 0)
]);

// JS обязателен — без него нечего eval'ить
if (_jsResult.status === 'rejected') {
    console.error('[ZkmSN loader] КРИТИЧНО: JS не загружен после ' + _RETRIES + ' попыток:', _jsResult.reason);
    throw _jsResult.reason;
}

// CSS необязателен — без него уведомления появятся без стилей
if (_cssResult.status === 'rejected') {
    console.warn('[ZkmSN loader] CSS не загружен (уведомления без стилей):', _cssResult.reason);
}
const _cssText = _cssResult.status === 'fulfilled' ? _cssResult.value : null;

// ── CSS: инжектим один раз за сессию ─────────────────────────────
// Guard обязателен: sideEffect-модуль может быть reinit'нут, а дублирующий
// <style> нарушит специфичность и сломает визуал уведомлений.
if (_cssText && !document.getElementById('zkm-sn-style-remote')) {
    var _style = document.createElement('style');
    _style.id = 'zkm-sn-style-remote';
    _style.textContent = _cssText;
    document.head.appendChild(_style);
}

// ── JS: eval — оригинал сам вешает window.ZkmScreenNotification ──
// try/catch обязателен: без него ошибка eval() никуда не логируется,
// window.ZkmScreenNotification остаётся undefined, уведомления молча не работают.
try {
    eval(_jsResult.value);
} catch (e) {
    console.error('[ZkmSN loader] eval() упал — уведомления не будут работать:', e);
    throw e;
}

if (typeof window.ZkmScreenNotification === 'undefined') {
    console.error('[ZkmSN loader] window.ZkmScreenNotification не установлен после eval().',
        'Проверь, что оригинальный файл сам вешает себя на window.ZkmScreenNotification.');
    throw new Error('[ZkmSN loader] компонент не загружен');
}

console.log('[ZkmSN loader] Загружен с GitHub');
