// ══════════════════════════════════════════════════════════════════
//  zkm.js  —  ЗАГРУЗЧИК (устанавливается один раз, не трогается)
//
//  Тот же принцип, что и в MvdMenu.js-загрузчике:
//
//  1. Импортируем из ./index.js ровно те же имена, что использует
//     реальный zkm.js на GitHub (LawsHelper — Розыск/Штрафы/Законы)
//  2. Параллельно грузим с GitHub реальный zkm.js И реальный zkm.css
//     JS — обязателен (падение = throw). CSS — опционален (падение игнорируется).
//  3. CSS — инжектим как <style id="zkm-style-remote"> в head
//     (один раз за сессию, повторной вставки нет)
//  4. JS  — вырезаем строку import{…}from"./index.js" (эти имена
//     уже есть в скоупе текущего модуля), заменяем
//     export{Zkm as default} на window.__zkmComp = Zkm, eval()
//  5. Экспортируем window.__zkmComp как default
//
//  IntLoad.js / установщик / index.js — не трогать.
//  Тип остаётся "interface", имя "Zkm" — без изменений.
// ══════════════════════════════════════════════════════════════════

// Импортируем точно те же имена, что использует GitHub-версия zkm.js.
// После strip'а import-строки они окажутся в скоупе eval().
import{
    r as resolveComponent,
    o as openBlock,
    c as createElementBlock,
    b as createVNode,
    a as createBaseVNode,
    F as Fragment,
    h as renderList,
    n as normalizeClass,
    e as createTextVNode,
    t as toDisplayString,
    f as createCommentVNode,
    w as withCtx,
    T as Transition,
    _ as _export_sfc
}from"./index.js";

// ── Пути к оригиналам на GitHub ──────────────────────────────────
const _GH_BASE = 'https://raw.githubusercontent.com/BensonZahar/Hud.js/main/MVD%20AHK/'
                + encodeURIComponent('Кастом Интерфейсы') + '/';
const _GH_JS   = _GH_BASE + 'zkm.js';
const _GH_CSS  = _GH_BASE + 'zkm.css';
const _RETRIES = 8;
const _BASE_DELAY = 1000; // экспоненциальный backoff: 1s, 2s, 4s, 8s...

// ── XHR-загрузчик с экспоненциальным backoff ─────────────────────
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
                    console.warn('[Zkm loader] HTTP ' + xhr.status + ' на ' + url + ', повтор ' + (attempt+1) + ' через ' + delay + 'мс');
                    setTimeout(function() { _xhrGet(url, attempt + 1).then(resolve, reject); }, delay);
                } else { reject(err); }
            }
        };
        xhr.onerror = function() {
            var err = new Error('Network error');
            if (attempt < _RETRIES) {
                var delay = Math.min(_BASE_DELAY * Math.pow(2, attempt), 16000);
                console.warn('[Zkm loader] Сеть ' + url + ', повтор ' + (attempt+1) + ' через ' + delay + 'мс');
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
    console.error('[Zkm loader] КРИТИЧНО: JS не загружен после ' + _RETRIES + ' попыток:', _jsResult.reason);
    throw _jsResult.reason;
}

let _text = _jsResult.value;

// CSS необязателен — без него просто не будет кастомных стилей
if (_cssResult.status === 'rejected') {
    console.warn('[Zkm loader] CSS не загружен (меню откроется без стилей):', _cssResult.reason);
}
const _cssText = _cssResult.status === 'fulfilled' ? _cssResult.value : null;

// ── CSS: инжектим один раз за сессию ─────────────────────────────
if (_cssText && !document.getElementById('zkm-style-remote')) {
    var _style = document.createElement('style');
    _style.id = 'zkm-style-remote';
    _style.textContent = _cssText;
    document.head.appendChild(_style);
}

// ── JS: патчим, eval() ───────────────────────────────────────────
// 1. Убираем import-строку — нужные имена уже в скоупе этого модуля
_text = _text.replace(/^import\{[^}]+\}from["'][^"']+["'];?\n?/m, '');

// 2. Заменяем export{Zkm as default} → window.__zkmComp = Zkm;
_text = _text.replace(/^export\{([^}]+)\}[;\s]*$/m, function(_, exp) {
    var localName = exp.split(' as ')[0].trim(); // "Zkm"
    return 'window.__zkmComp = ' + localName + ';';
});

// 3. eval в скоупе модуля: openBlock, createElementBlock и т.д. — все
//    видны из import-а выше, _export_sfc тоже, всё работает
eval(_text);

// ── Экспортируем реальный компонент ─────────────────────────────
const Zkm = window.__zkmComp;
delete window.__zkmComp;
console.log('[Zkm loader] Загружен с GitHub:', Zkm?.name);

export { Zkm as default };
