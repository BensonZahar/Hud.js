// ZkmScreenNotification.js — sideEffect загрузчик
// У оригинала нет import/export, только IIFE который вешает window.ZkmScreenNotification
const _GH_BASE = 'https://raw.githubusercontent.com/BensonZahar/Hud.js/main/MVD%20AHK/' + encodeURIComponent('Кастом Интерфейсы') + '/';

function _xhrGet(url, attempt) {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url + '?_=' + Date.now(), true);
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.responseText);
            else if (attempt < 5) setTimeout(function() { _xhrGet(url, attempt+1).then(resolve, reject); }, Math.min(2000*Math.pow(2, attempt), 16000));
            else reject(new Error('HTTP ' + xhr.status));
        };
        xhr.onerror = function() {
            if (attempt < 5) setTimeout(function() { _xhrGet(url, attempt+1).then(resolve, reject); }, Math.min(2000*Math.pow(2, attempt), 16000));
            else reject(new Error('Network'));
        };
        xhr.send();
    });
}

// JS — критичен (без него snAdd молча не работает)
let _jsText = window.__prefetch_zkmsn_js;
if (!_jsText) {
    if (window.__prefetch_promise) { await window.__prefetch_promise; _jsText = window.__prefetch_zkmsn_js; }
    if (!_jsText) { console.warn('[ZkmSN] XHR JS самому'); _jsText = await _xhrGet(_GH_BASE + 'ZkmScreenNotification.js', 0); }
} else { console.log('[ZkmSN] ✅ JS из префетча'); }

// CSS — опционален
let _cssText = window.__prefetch_zkmsn_css;
if (!_cssText && !window.__prefetch_zkmsn_css_failed) {
    if (window.__prefetch_promise) { await window.__prefetch_promise; _cssText = window.__prefetch_zkmsn_css; }
    if (!_cssText) {
        try { _cssText = await _xhrGet(_GH_BASE + 'ZkmScreenNotification.css', 0); }
        catch (e) { console.warn('[ZkmSN] CSS не загрузился:', e.message); }
    }
}

if (_cssText && !document.getElementById('zkm-sn-style-remote')) {
    var s = document.createElement('style'); s.id = 'zkm-sn-style-remote'; s.textContent = _cssText;
    document.head.appendChild(s);
}

// eval как есть — без strip'а import (их нет) и без замены export (его нет)
try { eval(_jsText); } catch (e) { console.error('[ZkmSN] eval упал:', e); throw e; }
if (typeof window.ZkmScreenNotification === 'undefined') {
    console.error('[ZkmSN] window.ZkmScreenNotification не установлен');
    throw new Error('[ZkmSN] компонент не загружен');
}
console.log('[ZkmSN] готов');