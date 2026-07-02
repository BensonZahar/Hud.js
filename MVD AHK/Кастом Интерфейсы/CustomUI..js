// ══════════════════════════════════════════════════════════════════
//  CustomUI.js  —  ЕДИНЫЙ загрузчик всех кастомных интерфейсов
//
//  Принцип:
//  1. Делаем dynamic import('./index.js') — получаем ВСЕ Webpack-имена
//     (resolveComponent, openBlock, createElementBlock и т.д.) как объект
//  2. Загружаем реальные компоненты с GitHub как ТЕКСТ
//  3. Парсим строку import{r as resolveComponent,...}from"./index.js"
//     из каждого файла — извлекаем маппинг минифицированных имён
//  4. Через new Function(...scopeKeys, code) eval'им код в правильном скоупе
//  5. Сохраняем ГОТОВЫЕ Vue-компоненты в window.__customUIComponents
//  6. Движок берёт их через Promise.resolve(window.__customUIComponents.MvdMenu)
//
//  Файлы MvdMenu.js, AdvMenu.js, zkm.js, ZkmScreenNotification.js
//  в папке assets/ БОЛЬШЕ НЕ НУЖНЫ.
// ══════════════════════════════════════════════════════════════════

window.__customUIComponents = {};

window.__customUIPromise = (async function loadAllCustomUI() {
    const GH_BASE = 'https://raw.githubusercontent.com/BensonZahar/Hud.js/main/MVD%20AHK/'
                  + encodeURIComponent('Кастом Интерфейсы') + '/';

    // ── 1. Получаем Webpack-модули (источник ВСХ render-функций Vue) ──
    let indexModule, containeredModule;
    try {
        indexModule = await import('./index.js');
        containeredModule = await import('./ContaineredButton.js');
        console.log('[CustomUI] ✅ Webpack-модули получены');
    } catch (e) {
        console.error('[CustomUI] ❌ Не удалось импортировать index.js/ContaineredButton.js:', e);
        return;
    }

    // ── 2. Загружаем все файлы с GitHub параллельно ──
    const FILES = {
        mvdmenu_js:  GH_BASE + 'MvdMenu.js',
        advmenu_js:  GH_BASE + 'AdvMenu.js',
        zkm_js:      GH_BASE + 'zkm.js',
        zkm_css:     GH_BASE + 'zkm.css',
        zkmsn_js:    GH_BASE + 'ZkmScreenNotification.js',
        zkmsn_css:   GH_BASE + 'ZkmScreenNotification.css'
    };

    const results = {};
    await Promise.all(Object.entries(FILES).map(async ([key, url]) => {
        try {
            const resp = await fetch(url + '?_=' + Date.now());
            if (resp.ok) {
                results[key] = await resp.text();
                console.log(`[CustomUI] ✅ ${key} загружен (${results[key].length} байт)`);
            }
        } catch (e) {
            console.warn(`[CustomUI] ⚠️ ${key} не загружен:`, e.message);
        }
    }));

    // ── 3. Инжектим CSS ──
    const cssTexts = [];
    if (results.zkm_css) cssTexts.push(results.zkm_css);
    if (results.zkmsn_css) cssTexts.push(results.zkmsn_css);
    if (cssTexts.length > 0 && !document.getElementById('custom-ui-styles')) {
        const style = document.createElement('style');
        style.id = 'custom-ui-styles';
        style.textContent = cssTexts.join('\n\n');
        document.head.appendChild(style);
        console.log(`[CustomUI] CSS инжектён (${cssTexts.length} файлов)`);
    }

    // ── 4. Универсальная функция eval компонента ──
    // Парсит import-строки из текста, строит scope из Webpack-модулей,
    // и eval'ит через new Function (безопаснее чем eval, работает в любом скоупе)
    function evalComponent(text, componentName) {
        const scope = {};

        // Парсим import{...}from"./index.js"
        const indexMatch = text.match(/import\s*\{([^}]+)\}\s*from\s*["']\.\/index\.js["']/);
        if (indexMatch) {
            indexMatch[1].split(',').forEach(m => {
                const parts = m.trim().split(/\s+as\s+/);
                if (parts.length === 2) {
                    const minified = parts[0].trim();
                    const realName = parts[1].trim();
                    if (indexModule[minified] !== undefined) {
                        scope[realName] = indexModule[minified];
                    }
                }
            });
        }

        // Парсим import{...}from"./ContaineredButton.js"
        const cbMatch = text.match(/import\s*\{([^}]+)\}\s*from\s*["']\.\/ContaineredButton\.js["']/);
        if (cbMatch && containeredModule) {
            cbMatch[1].split(',').forEach(m => {
                const parts = m.trim().split(/\s+as\s+/);
                if (parts.length === 2) {
                    const minified = parts[0].trim();
                    const realName = parts[1].trim();
                    if (containeredModule[minified] !== undefined) {
                        scope[realName] = containeredModule[minified];
                    }
                }
            });
        }

        // Удаляем все import-строки
        let code = text.replace(/^import\s*\{[^}]+\}\s*from\s*["'][^"']+["'];?\n?/gm, '');

        // Заменяем export{X as default} на присваивание
        code = code.replace(/^export\s*\{\s*([^}]+)\s*\}[;\s]*$/m, function(_, exp) {
            const localName = exp.split(' as ')[0].trim();
            return '__componentResult = ' + localName + ';';
        });

        // Оборачиваем в Function с параметрами из scope
        const wrappedCode = 'let __componentResult;\n' + code + '\nreturn __componentResult;';
        const scopeKeys = Object.keys(scope);
        const scopeValues = Object.values(scope);

        try {
            const fn = new Function(...scopeKeys, wrappedCode);
            const result = fn(...scopeValues);
            if (!result) {
                throw new Error('export не найден в тексте компонента');
            }
            console.log(`[CustomUI] ✅ ${componentName} eval'нут (${scopeKeys.length} имён в scope)`);
            return result;
        } catch (e) {
            console.error(`[CustomUI] ❌ eval ${componentName} упал:`, e);
            throw e;
        }
    }

    // ── 5. Eval интерфейсов (сохраняем как {default: Component}) ──
    // Движок ожидает модуль с default-экспортом
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

    // ── 6. ZkmScreenNotification — sideEffect, eval как есть ──
    if (results.zkmsn_js) {
        try {
            eval(results.zkmsn_js);
            if (typeof window.ZkmScreenNotification !== 'undefined') {
                console.log('[CustomUI] ✅ ZkmScreenNotification готов');
            }
        } catch (e) {
            console.error('[CustomUI] ❌ ZkmScreenNotification eval упал:', e);
        }
    }

    console.log('[CustomUI] 🎯 Все компоненты готовы');
})().catch(e => {
    console.error('[CustomUI] Критическая ошибка:', e);
    // Promise должен всегда resolve'иться — чтобы движок не завис
});