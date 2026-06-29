// ══════════════════════════════════════════════════════════════════
//  AdvMenu.js  —  ЗАГРУЗЧИК (устанавливается один раз, не трогается)
//
//  Тот же принцип, что и в MvdMenu.js-загрузчике:
//
//  1. Импортируем из ./index.js ровно те же имена, что использует
//     реальный AdvMenu.js на GitHub (трекер вызова адвоката)
//  2. Грузим реальный файл с GitHub через XMLHttpRequest
//  3. Вырезаем строки import{…}from"..." (все, с флагом g)
//  4. Заменяем export{AdvMenu as default} на window.__advComp = AdvMenu
//  5. eval() — код выполняется в скоупе модуля, все имена доступны
//  6. Экспортируем window.__advComp как default
//
//  CSS отдельным файлом не нужен — реальный AdvMenu.js сам инжектит
//  <style id="adv-menu-style"> внутри mounted().
//
//  IntLoad.js / установщик / index.js — не трогать.
//  Тип остаётся "interface", имя "AdvMenu" — без изменений.
// ══════════════════════════════════════════════════════════════════

// Импортируем точно те же имена, что использует GitHub-версия AdvMenu.js.
// После strip'а import-строки они окажутся в скоупе eval().
import{
    o as openBlock,
    c as createElementBlock,
    a as createBaseVNode,
    F as Fragment,
    n as normalizeClass,
    t as toDisplayString,
    f as createCommentVNode,
    _ as _export_sfc
}from"./index.js";

// ── Путь к оригиналу на GitHub ────────────────────────────────────
const _GH_URL = 'https://raw.githubusercontent.com/BensonZahar/Hud.js/main/MVD%20AHK/'
              + encodeURIComponent('Кастом Интерфейсы') + '/AdvMenu.js';
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
                    console.warn('[AdvMenu loader] HTTP ' + xhr.status + ', повтор ' + (attempt+1) + ' через ' + delay + 'мс:', err);
                    setTimeout(function() { _xhrGet(url, attempt + 1).then(resolve, reject); }, delay);
                } else { reject(err); }
            }
        };
        xhr.onerror = function() {
            var err = new Error('Network error');
            if (attempt < _RETRIES) {
                var delay = Math.min(_BASE_DELAY * Math.pow(2, attempt), 16000);
                console.warn('[AdvMenu loader] Сеть, повтор ' + (attempt+1) + ' через ' + delay + 'мс');
                setTimeout(function() { _xhrGet(url, attempt + 1).then(resolve, reject); }, delay);
            } else { reject(err); }
        };
        xhr.send();
    });
}

// ── Загружаем, патчим, eval() ────────────────────────────────────
// top-level await: игра ждёт пока модуль вычислится, т.е. пока
// реальный компонент прилетит с GitHub. Никакой заглушки.
let _text = await _xhrGet(_GH_URL, 0);

// 1. Убираем ВСЕ import-строки — нужные имена уже в скоупе этого модуля.
//    Флаг g обязателен: без него удаляется только первая строка import,
//    остальные попадают в eval() и вызывают SyntaxError.
//    \s* — пробел между import и { тоже допускается (import { ... } from "...")
_text = _text.replace(/^import\s*\{[^}]+\}\s*from\s*["'][^"']+["'];?\n?/gm, '');

// 2. Заменяем export{AdvMenu as default} → window.__advComp = AdvMenu
//    \s* — пробелы внутри и снаружи скобок (export { ... } и export{...})
_text = _text.replace(/^export\s*\{\s*([^}]+)\s*\}[;\s]*$/m, function(_, exp) {
    var localName = exp.split(' as ')[0].trim(); // "AdvMenu"
    return 'window.__advComp = ' + localName + ';';
});

// 3. eval в скоупе модуля: openBlock, createElementBlock и т.д. — все
//    видны из import-а выше, _export_sfc тоже, всё работает.
//    try/catch обязателен: без него ошибка в eval() не видна нигде,
//    window.__advComp не устанавливается, и меню молча не открывается.
try {
    eval(_text);
} catch (e) {
    console.error('[AdvMenu loader] eval() упал — меню не откроется:', e);
    throw e; // пробрасываем, чтобы модуль не завис в broken-состоянии
}

// ── Экспортируем реальный компонент ─────────────────────────────
const AdvMenu = window.__advComp;
delete window.__advComp;

// Если компонент не установился — eval отработал, но export не нашёлся
if (!AdvMenu) {
    console.error('[AdvMenu loader] window.__advComp не установлен после eval().',
        'Проверь: export regex не сматчил строку export в реальном AdvMenu.js.',
        'Первые 200 символов после патча:\n', _text.slice(0, 200));
    throw new Error('[AdvMenu loader] компонент не загружен');
}

console.log('[AdvMenu loader] Загружен с GitHub:', AdvMenu?.name);

export { AdvMenu as default };
