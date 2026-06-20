// ══════════════════════════════════════════════════════════════════
//  zkm.js  —  ЗАГРУЗЧИК (устанавливается один раз, не трогается)
//
//  Тот же принцип, что и в MvdMenu.js-загрузчике:
//
//  1. Импортируем из ./index.js ровно те же имена, что использует
//     реальный zkm.js на GitHub (LawsHelper — Розыск/Штрафы/Законы)
//  2. Параллельно грузим с GitHub реальный zkm.js И реальный zkm.css
//  3. CSS — инжектим как <style id="zkm-style-remote"> в head
//     (реальный zkm.js и сам инжектит свои стили в mounted(), но
//     тянем css отдельно тоже — на случай если self-inject когда-то
//     перестанет покрывать всё)
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
// Оригиналы лежат в MVD AHK/Кастом Интерфейсы/ (encodeURIComponent
// сам корректно закодирует кириллицу и пробел в имени папки).
const _GH_BASE = 'https://raw.githubusercontent.com/BensonZahar/Hud.js/main/MVD%20AHK/'
                + encodeURIComponent('Кастом Интерфейсы') + '/';
const _GH_JS   = _GH_BASE + 'zkm.js';
const _GH_CSS  = _GH_BASE + 'zkm.css';
const _RETRIES = 5;
const _DELAY   = 2000;

// ── XHR-загрузчик (без fetch, с ретраями как в LoadAhk.js) ──────
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
                    console.warn('[Zkm loader] Ошибка ' + url + ', повтор ' + (attempt+1) + ':', err);
                    setTimeout(function() { _xhrGet(url, attempt + 1).then(resolve, reject); }, _DELAY);
                } else { reject(err); }
            }
        };
        xhr.onerror = function() {
            var err = new Error('Network error');
            if (attempt < _RETRIES) {
                console.warn('[Zkm loader] Сеть ' + url + ', повтор ' + (attempt+1));
                setTimeout(function() { _xhrGet(url, attempt + 1).then(resolve, reject); }, _DELAY);
            } else { reject(err); }
        };
        xhr.send();
    });
}

// ── Грузим JS и CSS параллельно ──────────────────────────────────
// top-level await: игра ждёт пока модуль вычислится, т.е. пока
// реальный компонент прилетит с GitHub. Никакой заглушки.
const [_jsText0, _cssText] = await Promise.all([
    _xhrGet(_GH_JS, 0),
    _xhrGet(_GH_CSS, 0)
]);
let _text = _jsText0;

// ── CSS: инжектим как <style> (один раз — модуль выполняется один
//    раз за сессию, повторных вставок при переоткрытии интерфейса
//    не будет) ──────────────────────────────────────────────────
const _style = document.createElement('style');
_style.id = 'zkm-style-remote';
_style.textContent = _cssText;
document.head.appendChild(_style);

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
