// AdvMenu.js — загрузчик. Префетч из window.__prefetch_advmenu_js
import{o as openBlock,c as createElementBlock,a as createBaseVNode,F as Fragment,n as normalizeClass,t as toDisplayString,f as createCommentVNode,_ as _export_sfc}from"./index.js";
import{c as toMoscowTime}from"./timeZone.js";  // ← ДОБАВИТЬ ЭТУ СТРОКУ

const _GH_URL = 'https://raw.githubusercontent.com/BensonZahar/Hud.js/main/MVD%20AHK/'
              + encodeURIComponent('Кастом Интерфейсы') + '/AdvMenu.js';

function _xhrGet(url, attempt) {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url + '?_=' + Date.now(), true);
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.responseText);
            else if (attempt < 8) setTimeout(function() { _xhrGet(url, attempt+1).then(resolve, reject); }, Math.min(1000*Math.pow(2, attempt), 16000));
            else reject(new Error('HTTP ' + xhr.status));
        };
        xhr.onerror = function() {
            if (attempt < 8) setTimeout(function() { _xhrGet(url, attempt+1).then(resolve, reject); }, Math.min(1000*Math.pow(2, attempt), 16000));
            else reject(new Error('Network'));
        };
        xhr.send();
    });
}

let _text = window.__prefetch_advmenu_js;
if (!_text) {
    if (window.__prefetch_promise) { await window.__prefetch_promise; _text = window.__prefetch_advmenu_js; }
    if (!_text) { console.warn('[AdvMenu] XHR самому'); _text = await _xhrGet(_GH_URL, 0); }
} else { console.log('[AdvMenu] ✅ префетч'); }

_text = _text.replace(/^import\s*\{[^}]+\}\s*from\s*["'][^"']+["'];?\n?/gm, '');
_text = _text.replace(/^export\s*\{\s*([^}]+)\s*\}[;\s]*$/m, function(_, exp) {
    return 'window.__advComp = ' + exp.split(' as ')[0].trim() + ';';
});
try { eval(_text); } catch (e) { console.error('[AdvMenu] eval упал:', e); throw e; }
const AdvMenu = window.__advComp; delete window.__advComp;
if (!AdvMenu) throw new Error('[AdvMenu] компонент не загружен');
console.log('[AdvMenu] готов:', AdvMenu?.name);
export { AdvMenu as default };
