// AdvMenu.js — загрузчик. Префетч из window.__prefetch_advmenu_js
//
// ── Что изменилось по сравнению с предыдущей версией загрузчика ─────────────
//
// Компонент AdvMenu переведён на Modal (тот же подход, что у SideMenu.js):
// вместо инжектированной самодельной карточки теперь использует нативный
// компонент Modal из ./Modal.js, а также resolveComponent/createBlock/withCtx
// из ./index.js (они нужны рендер-функции, которая вызывает resolveComponent("Modal")).
//
// Все эти зависимости загрузчик импортирует СРАЗУ — до eval() скачанного
// AdvMenu.js — потому что eval() в модуле видит локальный скоуп загрузчика.
// Затем регекс _text.replace(...) снимает строки import { … } from "…" из
// скачанного текста (они уже выполнены здесь), и eval получает чистый JS,
// где Modal / MODAL_TYPES / MODAL_COLOR_TYPES / resolveComponent / createBlock
// / withCtx / toMoscowTime и т.д. уже находятся в замыкании.
//
// IntLoad.js менять не надо:
//   • AdvMenu не использует Window.css (не нужен deps: ["./Window.css"])
//   • CSS компонента инжектируется самим AdvMenu.js через mounted() →
//     document.createElement('style'), отдельного .css-файла нет
//   • тип остаётся "interface", файл — ["AdvMenu.js"]
// ─────────────────────────────────────────────────────────────────────────────

import{o as openBlock,c as createElementBlock,a as createBaseVNode,F as Fragment,n as normalizeClass,t as toDisplayString,f as createCommentVNode,_ as _export_sfc,r as resolveComponent,h as createBlock,w as withCtx}from"./index.js";
import{c as toMoscowTime}from"./timeZone.js";
import{M as Modal,a as MODAL_TYPES,b as MODAL_COLOR_TYPES}from"./Modal.js";

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

// Снимаем все import-строки — они уже выполнены выше в загрузчике
// (включая новые: Modal.js, resolveComponent, createBlock, withCtx)
_text = _text.replace(/^import\s*\{[^}]+\}\s*from\s*["'][^"']+["'];?\n?/gm, '');
// export{AdvMenu as default} → window.__advComp = AdvMenu;
_text = _text.replace(/^export\s*\{\s*([^}]+)\s*\}[;\s]*$/m, function(_, exp) {
    return 'window.__advComp = ' + exp.split(' as ')[0].trim() + ';';
});
try { eval(_text); } catch (e) { console.error('[AdvMenu] eval упал:', e); throw e; }
const AdvMenu = window.__advComp; delete window.__advComp;
if (!AdvMenu) throw new Error('[AdvMenu] компонент не загружен');
console.log('[AdvMenu] готов:', AdvMenu?.name);
export { AdvMenu as default };
