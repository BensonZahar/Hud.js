// zkm.js — загрузчик LawsHelper. Префетч JS и CSS из window.__prefetch_zkm_*
import{r as resolveComponent,o as openBlock,c as createElementBlock,b as createVNode,a as createBaseVNode,F as Fragment,i as renderList,n as normalizeClass,e as createTextVNode,t as toDisplayString,f as createCommentVNode,w as withCtx,T as Transition,_ as _export_sfc}from"./index.js";

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

// Данные законов (7 файлов: koap/uk/proc/kto/euss/euvs/zot) — опциональны
// для этого модуля, но нужны компоненту LawsHelper. Не блокируют загрузку/eval
// основного JS: компонент сам подождёт этот промис (window.__prefetch_zkm_lawdocs_promise)
// в фоне, когда откроет окно. Путь другой — это отдельный репозиторий "Законы AHK",
// подпапка выбирается по номеру текущего сервера игрока (12, 13, ...).
function _getServerId() {
    try {
        var id = window.App && window.App.$store &&
                 window.App.$store.getters['player/serverId'];
        id = parseInt(id, 10);
        return Number.isFinite(id) && id > 0 ? id : 12; // фолбэк на 12, если ещё не определён
    } catch (e) {
        return 12;
    }
}

var _SERVER_ID = _getServerId();
var _GH_BASE_LAWS = 'https://raw.githubusercontent.com/BensonZahar/Hud.js/main/' +
    encodeURIComponent('Законы AHK') + '/' + _SERVER_ID + '/';
var _LAW_DOC_FILES = ['koap', 'uk', 'proc', 'kto', 'euss', 'euvs', 'zot'];

if (!window.__prefetch_zkm_lawdocs && !window.__prefetch_zkm_lawdocs_promise) {
    window.__prefetch_zkm_lawdocs_promise = Promise.all(_LAW_DOC_FILES.map(function(id) {
        return _xhrGet(_GH_BASE_LAWS + id + '.json', 0)
            .catch(function(e) { console.warn('[zkm] ' + id + '.json (сервер ' + _SERVER_ID + ') не загрузился (загрузится лениво позже):', e.message); return null; });
    })).then(function(results) {
        var map = {};
        _LAW_DOC_FILES.forEach(function(id, i) { if (results[i]) map[id] = results[i]; });
        window.__prefetch_zkm_lawdocs = map;
        return map;
    });
}

_text = _text.replace(/^import\s*\{[^}]+\}\s*from\s*["'][^"']+["'];?\n?/gm, '');
_text = _text.replace(/^export\s*\{\s*([^}]+)\s*\}[;\s]*$/m, function(_, exp) {
    return 'window.__zkmComp = ' + exp.split(' as ')[0].trim() + ';';
});
try { eval(_text); } catch (e) { console.error('[zkm] eval упал:', e); throw e; }
const Zkm = window.__zkmComp; delete window.__zkmComp;
if (!Zkm) throw new Error('[zkm] компонент не загружен');
console.log('[zkm] готов:', Zkm?.name);
export { Zkm as default };
