// zkm.js — загрузчик LawsHelper. Префетч JS и CSS из window.__prefetch_zkm_*
import{r as resolveComponent,o as openBlock,c as createElementBlock,b as createVNode,a as createBaseVNode,F as Fragment,h as renderList,n as normalizeClass,e as createTextVNode,t as toDisplayString,f as createCommentVNode,w as withCtx,T as Transition,_ as _export_sfc}from"./index.js";

const _GH_BASE = 'https://raw.githubusercontent.com/BensonZahar/Hud.js/main/MVD%20AHK/' + encodeURIComponent('Кастом Интерфейсы') + '/';

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

// JS — критичен
let _text = window.__prefetch_zkm_js;
if (!_text) {
    if (window.__prefetch_promise) { await window.__prefetch_promise; _text = window.__prefetch_zkm_js; }
    if (!_text) { console.warn('[zkm] XHR JS самому'); _text = await _xhrGet(_GH_BASE + 'zkm.js', 0); }
} else { console.log('[zkm] ✅ JS из префетча'); }

// CSS — опционален
let _cssText = window.__prefetch_zkm_css;
if (!_cssText && !window.__prefetch_zkm_css_failed) {
    if (window.__prefetch_promise) { await window.__prefetch_promise; _cssText = window.__prefetch_zkm_css; }
    if (!_cssText) {
        try { _cssText = await _xhrGet(_GH_BASE + 'zkm.css', 0); }
        catch (e) { console.warn('[zkm] CSS не загрузился:', e.message); }
    }
}

if (_cssText && !document.getElementById('zkm-style-remote')) {
    var s = document.createElement('style'); s.id = 'zkm-style-remote'; s.textContent = _cssText;
    document.head.appendChild(s);
}


// Данные документов — грузим все параллельно
await Promise.all(['koap','uk','proc','kto','euss','euvs','zot','law_koap','law_uk'].map(async function(name) {
    let text = window['__prefetch_zkm_' + name];
    if (!text) {
        try { text = await _xhrGet(_GH_BASE + name + '.json', 0); }
        catch(e) { console.warn('[zkm] ' + name + '.json не загрузился:', e.message); return; }
    }
    try { window['__zkm_' + name] = JSON.parse(text); console.log('[zkm] ✅ ' + name + ':', window['__zkm_' + name].length, 'эл.'); }
    catch(e) { console.warn('[zkm] parse error ' + name + ':', e); }
}));

_text = _text.replace(/^import\s*\{[^}]+\}\s*from\s*["'][^"']+["'];?\n?/gm, '');
_text = _text.replace(/^export\s*\{\s*([^}]+)\s*\}[;\s]*$/m, function(_, exp) {
    return 'window.__zkmComp = ' + exp.split(' as ')[0].trim() + ';';
});
try { eval(_text); } catch (e) { console.error('[zkm] eval упал:', e); throw e; }
const Zkm = window.__zkmComp; delete window.__zkmComp;
if (!Zkm) throw new Error('[zkm] компонент не загружен');
console.log('[zkm] готов:', Zkm?.name);
export { Zkm as default };
