// ══════════════════════════════════════════════════════════════════
//  MvdMenu.js  —  ЗАГРУЗЧИК (устанавливается один раз, не трогается)
//
//  Принцип работы (как LoadAhk.js, но для ES-модуля):
//
//  1. Импортируем из ./index.js ровно те же имена, что использует
//     реальный MvdMenu.js на GitHub (openBlock, createElementBlock …)
//  2. Грузим реальный файл с GitHub через XMLHttpRequest
//  3. Вырезаем строку import{…}from"./index.js" —
//     эти имена уже есть в скоупе текущего модуля
//  4. Заменяем export{MvdMenu as default} на window.__mvdComp = MvdMenu
//  5. eval() — код выполняется в скоупе модуля, все имена доступны
//  6. Экспортируем window.__mvdComp как default
//
//  IntLoad.js / установщик / index.js — не трогать.
//  Тип остаётся "interface", имя "MvdMenu" — без изменений.
// ══════════════════════════════════════════════════════════════════

// Импортируем точно те же имена, что использует GitHub-версия MvdMenu.js.
// После strip'а import-строки они окажутся в скоупе eval().
import{
    r as resolveComponent,
    o as openBlock,
    c as createElementBlock,
    a as createBaseVNode,
    F as Fragment,
    h as renderList,
    n as normalizeClass,
    t as toDisplayString,
    f as createCommentVNode,
    g as createBlock,
    b as createVNode,
    _ as _export_sfc
}from"./index.js";
// Нужен футеру (ESC/Enter снизу, как в Window.js) — реальный MvdMenu.js
// теперь импортирует и использует этот компонент напрямую.
import{C as ControlsContaineredButton}from"./ContaineredButton.js";

// ── XHR-загрузчик (без fetch, с ретраями как в LoadAhk.js) ──────
// Оригинал лежит в MVD AHK/Кастом Интерфейсы/ (encodeURIComponent
// сам корректно закодирует кириллицу и пробел в имени папки).
const _GH_URL  = 'https://raw.githubusercontent.com/BensonZahar/Hud.js/main/MVD%20AHK/'
                + encodeURIComponent('Кастом Интерфейсы') + '/MvdMenu.js';
const _RETRIES = 5;
const _DELAY   = 2000;

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
                    console.warn('[MvdMenu loader] Ошибка, повтор ' + (attempt+1) + ':', err);
                    setTimeout(function() { _xhrGet(url, attempt + 1).then(resolve, reject); }, _DELAY);
                } else { reject(err); }
            }
        };
        xhr.onerror = function() {
            var err = new Error('Network error');
            if (attempt < _RETRIES) {
                console.warn('[MvdMenu loader] Сеть, повтор ' + (attempt+1));
                setTimeout(function() { _xhrGet(url, attempt + 1).then(resolve, reject); }, _DELAY);
            } else { reject(err); }
        };
        xhr.send();
    });
}

// ── Загружаем, патчим, eval() ────────────────────────────────────
// top-level await: игра ждёт пока модуль вычислится, т.е. пока
// реальный компонент прилетит с GitHub. Никакой заглушки.
let _text = await _xhrGet(_GH_URL, 0);

// 1. Убираем import-строки — нужные имена уже в скоупе этого модуля.
//    Флаг g обязателен: реальный файл может импортировать из нескольких
//    модулей (./index.js, ./ContaineredButton.js и т.д.), а не только из index.js.
_text = _text.replace(/^import\{[^}]+\}from["'][^"']+["'];?\n?/gm, '');

// 2. Заменяем export{MvdMenu as default} → window.__mvdComp = MvdMenu
_text = _text.replace(/^export\{([^}]+)\}[;\s]*$/m, function(_, exp) {
    var localName = exp.split(' as ')[0].trim(); // "MvdMenu"
    return 'window.__mvdComp = ' + localName + ';';
});

// 3. eval в скоупе модуля: openBlock, createElementBlock и т.д. — все
//    видны из import-а выше, _export_sfc тоже, всё работает
eval(_text);

// ── Экспортируем реальный компонент ─────────────────────────────
const MvdMenu = window.__mvdComp;
delete window.__mvdComp;
console.log('[MvdMenu loader] Загружен с GitHub:', MvdMenu?.name);

export { MvdMenu as default };
