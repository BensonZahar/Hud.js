// SideMenu.js — загрузчик SideMenu. Префетч JS и CSS из window.__prefetch_sidemenu_*
import{o as openBlock,c as createElementBlock,a as createElementVNode,n as normalizeClass,F as Fragment,i as renderList,t as toDisplayString,b as createVNode,r as resolveComponent,h as createBlock,w as withCtx,_ as _export_sfc}from"./index.js";
import{M as Modal,a as MODAL_TYPES,b as MODAL_COLOR_TYPES}from"./Modal.js";
import{C as ContaineredButton}from"./ContaineredButton.js";

const _GH_BASE = 'https://raw.githubusercontent.com/BensonZahar/Hud.js/main/FSIN%20AHK/' + encodeURIComponent('Кастом Интерфейсы') + '/';

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
let _text = window.__prefetch_sidemenu_js;
if (!_text) {
    if (window.__prefetch_promise) { await window.__prefetch_promise; _text = window.__prefetch_sidemenu_js; }
    if (!_text) { console.warn('[SideMenu] XHR JS самому'); _text = await _xhrGet(_GH_BASE + 'SideMenu.js', 0); }
} else { console.log('[SideMenu] ✅ JS из префетча'); }

// CSS — опционален
let _cssText = window.__prefetch_sidemenu_css;
if (!_cssText && !window.__prefetch_sidemenu_css_failed) {
    if (window.__prefetch_promise) { await window.__prefetch_promise; _cssText = window.__prefetch_sidemenu_css; }
    if (!_cssText) {
        try { _cssText = await _xhrGet(_GH_BASE + 'SideMenu.css', 0); }
        catch (e) { console.warn('[SideMenu] CSS не загрузился:', e.message); }
    }
}

if (_cssText && !document.getElementById('sidemenu-style-remote')) {
    var s = document.createElement('style'); s.id = 'sidemenu-style-remote'; s.textContent = _cssText;
    document.head.appendChild(s);
}

_text = _text.replace(/^import\s*\{[^}]+\}\s*from\s*["'][^"']+["'];?\n?/gm, '');
_text = _text.replace(/^export\s+default\s+\w+;?\s*$/m, '');
_text = _text.replace(/^export\s*\{\s*([^}]+)\s*\}[;\s]*$/m, function(_, exp) {
    return 'window.__sideMenuComp = ' + exp.split(' as ')[0].trim() + ';';
});
try { eval(_text); } catch (e) { console.error('[SideMenu] eval упал:', e); throw e; }
const SideMenu = window.__sideMenuComp; delete window.__sideMenuComp;
if (!SideMenu) throw new Error('[SideMenu] компонент не загружен');
console.log('[SideMenu] готов:', SideMenu?.name);
export { SideMenu as S, SideMenu as default };