// dokladi.js — загрузчик. Берёт код из window.__prefetch_dokladi_js (префетч mvdF.js).
import{r as resolveComponent,o as openBlock,c as createElementBlock,a as createBaseVNode,F as Fragment,i as renderList,n as normalizeClass,t as toDisplayString,f as createCommentVNode,h as createBlock,b as createVNode,_ as _export_sfc}from"./index.js";
import{C as ControlsContaineredButton}from"./ContaineredButton.js";

const _GH_URL = 'https://raw.githubusercontent.com/BensonZahar/Hud.js/main/PRAVO%20AHK/'
              + encodeURIComponent('Кастом Интерфейсы') + '/' + encodeURIComponent('Загрузчики') + '/dokladi.js';

function _ghAlt(u) { var i = u.indexOf('/main/'); return i < 0 ? u : u.slice(0, i + 6) + u.slice(i + 6).replace(/%/g, '%25'); }
// Radmir (CEF): путь как есть (%20). Unreal (Gameface): раскодирует путь один раз -> нужен %2520. Пробуем оба.
function _xhrGet(url, attempt, v) {
    v = v || 0;
    return new Promise(function(resolve, reject) {
        var idx = (((window.__ghEncVariant | 0) + v) % 2);
        var xhr = new XMLHttpRequest();
        xhr.open('GET', (idx ? _ghAlt(url) : url) + '?_=' + Date.now(), true);
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) { window.__ghEncVariant = idx; resolve(xhr.responseText); }
            else if (v < 1) _xhrGet(url, attempt, v + 1).then(resolve, reject);
            else if (attempt < 8) setTimeout(function() { _xhrGet(url, attempt+1, 0).then(resolve, reject); }, Math.min(1000*Math.pow(2, attempt), 16000));
            else reject(new Error('HTTP ' + xhr.status));
        };
        xhr.onerror = function() {
            if (attempt < 8) setTimeout(function() { _xhrGet(url, attempt+1, 0).then(resolve, reject); }, Math.min(1000*Math.pow(2, attempt), 16000));
            else reject(new Error('Network'));
        };
        xhr.send();
    });
}

// Ждём префетч если он ещё идёт, иначе fallback на XHR
let _text = window.__prefetch_dokladi_js;
if (!_text) {
    if (window.__prefetch_promise) {
        console.log('[Dokladi] жду префетч из mvdF.js...');
        await window.__prefetch_promise;
        _text = window.__prefetch_dokladi_js;
    }
    if (!_text) {
        console.warn('[Dokladi] префетч не готов — делаю XHR сам');
        _text = await _xhrGet(_GH_URL, 0);
    }
} else {
    console.log('[Dokladi] ✅ использую префетч (мгновенно)');
}

_text = _text.replace(/^import\s*\{[^}]+\}\s*from\s*["'][^"']+["'];?\n?/gm, '');
_text = _text.replace(/^export\s*\{\s*([^}]+)\s*\}[;\s]*$/m, function(_, exp) {
    return 'window.__dokladiComp = ' + exp.split(' as ')[0].trim() + ';';
});
try { eval(_text); } catch (e) { console.error('[Dokladi] eval упал:', e); throw e; }
const Dokladi = window.__dokladiComp; delete window.__dokladiComp;
if (!Dokladi) throw new Error('[Dokladi] компонент не загружен');
console.log('[Dokladi] готов:', Dokladi?.name);
export { Dokladi as default };
