// ══════════════════════════════════════════════════════════════════
//  CustomUI.js  —  ЕДИНЫЙ загрузчик всех кастомных интерфейсов
//
//  Загружается как sideEffect при старте игры.
//  1. import('./index.js') — получает все Webpack-имена Vue
//  2. Загружает компоненты с GitHub как текст
//  3. Парсит import-строки, маппит минифицированные имена
//  4. Eval'ит через new Function (правильно!)
//  5. Сохраняет готовые Vue-компоненты в window.__customUIComponents
// ══════════════════════════════════════════════════════════════════
window.__customUIComponents = {};

window.__customUIPromise = (async function loadAllCustomUI() {
    const GH_BASE = 'https://raw.githubusercontent.com/BensonZahar/Hud.js/main/MVD%20AHK/'
        + encodeURIComponent('Кастом Интерфейсы') + '/';

    // ── 1. Получаем Webpack-модули ──────────────────────────────
    let indexModule, containeredModule;
    try {
        indexModule = await import('./index.js');
        try {
            containeredModule = await import('./ContaineredButton.js');
        } catch (e) {
            console.warn('[CustomUI] ContaineredButton.js не найден, пропускаю');
            containeredModule = null;
        }
        console.log('[CustomUI] ✅ Webpack-модули получены');
    } catch (e) {
        console.error('[CustomUI] ❌ Не удалось импортировать index.js:', e);
        return;
    }

    // ── 2. Загружаем все файлы с GitHub ─────────────────────────
    const FILES = {
        mvdmenu_js:  GH_BASE + 'MvdMenu.js',
        advmenu_js:  GH_BASE + 'AdvMenu.js',
        zkm_js:      GH_BASE + 'zkm.js',
        zkm_css:     GH_BASE + 'zkm.css',
        zkmsn_js:    GH_BASE + 'ZkmScreenNotification.js',
        zkmsn_css:   GH_BASE + 'ZkmScreenNotification.css'
    };

    const results = {};
    await Promise.all(Object.keys(FILES).map(function(key) {
        var url = FILES[key] + '?_=' + Date.now();
        return fetch(url)
            .then(function(resp) {
                if (resp.ok) return resp.text();
                throw new Error('HTTP ' + resp.status);
            })
            .then(function(text) {
                results[key] = text;
                console.log('[CustomUI] ✅ ' + key + ' загружен (' + text.length + ' байт)');
            })
            .catch(function(err) {
                console.warn('[CustomUI] ⚠️ ' + key + ' не загружен:', err.message);
            });
    }));

    // ── 3. Инжектим CSS ─────────────────────────────────────────
    var cssTexts = [];
    if (results.zkm_css) cssTexts.push(results.zkm_css);
    if (results.zkmsn_css) cssTexts.push(results.zkmsn_css);
    if (cssTexts.length > 0 && !document.getElementById('custom-ui-styles')) {
        var style = document.createElement('style');
        style.id = 'custom-ui-styles';
        style.textContent = cssTexts.join('\n\n');
        document.head.appendChild(style);
        console.log('[CustomUI] CSS инжектён (' + cssTexts.length + ' файлов)');
    }

    // ── 4. Функция eval компонента (ИСПРАВЛЕНА!) ────────────────
    function evalComponent(text, componentName) {
        var scope = {};

        // Парсим import{...}from"./index.js"
        var indexMatch = text.match(/import\s*\{([^}]+)\}\s*from\s*["']\.\/index\.js["']/);
        if (indexMatch) {
            indexMatch[1].split(',').forEach(function(m) {
                var parts = m.trim().split(/\s+as\s+/);
                if (parts.length === 2) {
                    var minified = parts[0].trim();
                    var realName = parts[1].trim();
                    if (indexModule[minified] !== undefined) {
                        scope[realName] = indexModule[minified];
                    }
                }
            });
        }

        // Парсим import{...}from"./ContaineredButton.js"
        var cbMatch = text.match(/import\s*\{([^}]+)\}\s*from\s*["']\.\/ContaineredButton\.js["']/);
        if (cbMatch && containeredModule) {
            cbMatch[1].split(',').forEach(function(m) {
                var parts = m.trim().split(/\s+as\s+/);
                if (parts.length === 2) {
                    var minified = parts[0].trim();
                    var realName = parts[1].trim();
                    if (containeredModule[minified] !== undefined) {
                        scope[realName] = containeredModule[minified];
                    }
                }
            });
        }

        // Удаляем ВСЕ import-строки
        var code = text.replace(/^import\s*\{[^}]+\}\s*from\s*["'][^"']+["'];?\s*\n?/gm, '');

        // Заменяем export{X as default} на присваивание
        code = code.replace(/^export\s*\{\s*([^}]+)\s*\}[;\s]*$/m, function(_, exp) {
            var localName = exp.split(' as ')[0].trim();
            return '__componentResult = ' + localName + ';';
        });

        // Оборачиваем в Function
        var wrappedCode = 'var __componentResult;\n' + code + '\nreturn __componentResult;';
        var scopeKeys = Object.keys(scope);
        var scopeValues = [];
        for (var i = 0; i < scopeKeys.length; i++) {
            scopeValues.push(scope[scopeKeys[i]]);
        }

        try {
            // ═══════════════════════════════════════════════════════
            // ИСПРАВЛЕНО: было new (Function.prototype.bind.apply(...))
            // Теперь правильно: new Function(...scopeKeys, wrappedCode)
            // ═══════════════════════════════════════════════════════
            var fn = new Function(scopeKeys, wrappedCode);
            var result = fn.apply(null, scopeValues);
            if (!result) {
                throw new Error('export не найден в тексте компонента');
            }
            console.log('[CustomUI] ✅ ' + componentName + ' eval\'нут (' + scopeKeys.length + ' имён в scope)');
            return result;
        } catch (e) {
            console.error('[CustomUI] ❌ eval ' + componentName + ' упал:', e);
            console.error('[CustomUI] Первые 500 символов кода:', code.slice(0, 500));
            throw e;
        }
    }

    // ── 5. Eval интерфейсов ─────────────────────────────────────
    if (results.mvdmenu_js) {
        try {
            window.__customUIComponents.MvdMenu = {
                default: evalComponent(results.mvdmenu_js, 'MvdMenu')
            };
        } catch (e) { console.error('[CustomUI] MvdMenu не собран:', e); }
    }

    if (results.advmenu_js) {
        try {
            window.__customUIComponents.AdvMenu = {
                default: evalComponent(results.advmenu_js, 'AdvMenu')
            };
        } catch (e) { console.error('[CustomUI] AdvMenu не собран:', e); }
    }

    if (results.zkm_js) {
        try {
            window.__customUIComponents.Zkm = {
                default: evalComponent(results.zkm_js, 'Zkm')
            };
        } catch (e) { console.error('[CustomUI] Zkm не собран:', e); }
    }

    // ── 6. ZkmScreenNotification — sideEffect ───────────────────
    if (results.zkmsn_js) {
        try {
            // ZkmScreenNotification не имеет import/export — eval как есть
            // Но на случай если там есть import — удаляем их
            var snCode = results.zkmsn_js.replace(/^import\s*\{[^}]+\}\s*from\s*["'][^"']+["'];?\s*\n?/gm, '');
            eval(snCode);
            if (typeof window.ZkmScreenNotification !== 'undefined') {
                console.log('[CustomUI] ✅ ZkmScreenNotification готов');
            } else {
                console.warn('[CustomUI] ⚠️ ZkmScreenNotification не установился на window');
            }
        } catch (e) {
            console.error('[CustomUI] ❌ ZkmScreenNotification eval упал:', e);
        }
    }

    console.log('[CustomUI] 🎯 Все компоненты готовы');
    console.log('[CustomUI] window.__customUIComponents:', Object.keys(window.__customUIComponents));
})().catch(function(e) {
    console.error('[CustomUI] Критическая ошибка:', e);
});
