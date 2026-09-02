// MvdMenu.js — загрузчик. Берёт код из window.__prefetch_mvdmenu_js (префетч mvdF.js).
import{r as resolveComponent,o as openBlock,c as createElementBlock,a as createBaseVNode,F as Fragment,i as renderList,n as normalizeClass,t as toDisplayString,f as createCommentVNode,h as createBlock,b as createVNode,_ as _export_sfc}from"./index.js";
import{C as ControlsContaineredButton}from"./ContaineredButton.js";

const _GH_URL = 'https://raw.githubusercontent.com/BensonZahar/Hud.js/main/MVD%20AHK/'
              + encodeURIComponent('Кастом Интерфейсы') + '/MvdMenu.js';

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

// Ждём префетч если он ещё идёт, иначе fallback на XHR
let _text = window.__prefetch_mvdmenu_js;
if (!_text) {
    if (window.__prefetch_promise) {
        console.log('[MvdMenu] жду префетч из mvdF.js...');
        await window.__prefetch_promise;
        _text = window.__prefetch_mvdmenu_js;
    }
    if (!_text) {
        console.warn('[MvdMenu] префетч не готов — делаю XHR сам');
        _text = await _xhrGet(_GH_URL, 0);
    }
} else {
    console.log('[MvdMenu] ✅ использую префетч (мгновенно)');
}

_text = _text.replace(/^import\s*\{[^}]+\}\s*from\s*["'][^"']+["'];?\n?/gm, '');
_text = _text.replace(/^export\s*\{\s*([^}]+)\s*\}[;\s]*$/m, function(_, exp) {
    return 'window.__mvdComp = ' + exp.split(' as ')[0].trim() + ';';
});
try { eval(_text); } catch (e) { console.error('[MvdMenu] eval упал:', e); throw e; }
const MvdMenu = window.__mvdComp; delete window.__mvdComp;
if (!MvdMenu) throw new Error('[MvdMenu] компонент не загружен');
console.log('[MvdMenu] готов:', MvdMenu?.name);
export { MvdMenu as default };
