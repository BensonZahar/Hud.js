// ══════════════════════════════════════════════════════════════════
//  CustomUI.js  —  ЕДИНЫЙ загрузчик всех кастомных интерфейсов
// ══════════════════════════════════════════════════════════════════
window.__customUIComponents = {};

window.__customUIPromise = (async function loadAllCustomUI() {
    const GH_BASE = 'https://raw.githubusercontent.com/BensonZahar/Hud.js/main/MVD%20AHK/'
                  + encodeURIComponent('Кастом Интерфейсы') + '/';

    // 1. Получаем Webpack-модули
    let indexModule, containeredModule;
    try {
        indexModule = await import('./index.js');
        containeredModule = await import('./ContaineredButton.js');
        console.log('[CustomUI] ✅ Webpack-модули получены');
    } catch (e) {
        console.error('[CustomUI] ❌ Не удалось импортировать:', e);
        return;
    }

    // 2. Загружаем все файлы с GitHub
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

    // 3. Инжектим CSS
    const cssTexts = [];
    if (results.zkm_css) cssTexts.push(results.zkm_css);
    if (results.zkmsn_css) cssTexts.push(results.zkmsn_css);
    if (cssTexts.length > 0 && !document.getElementById('custom-ui-styles')) {
        const style = document.createElement('style');
        style.id = 'custom-ui-styles';
        style.textContent = cssTexts.join('\n\n');
        document.head.appendChild(style);
    }

    // 4. Eval компонентов
    function evalComponent(text, componentName) {
        const scope = {};
        
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

        let code = text.replace(/^import\s*\{[^}]+\}\s*from\s*["'][^"']+["'];?\n?/gm, '');
        code = code.replace(/^export\s*\{\s*([^}]+)\s*\}[;\s]*$/m, function(_, exp) {
            const localName = exp.split(' as ')[0].trim();
            return '__componentResult = ' + localName + ';';
        });

        const wrappedCode = 'let __componentResult;\n' + code + '\nreturn __componentResult;';
        const scopeKeys = Object.keys(scope);
        const scopeValues = Object.values(scope);

        try {
            const fn = new Function(...scopeKeys, wrappedCode);
            const result = fn(...scopeValues);
            if (!result) throw new Error('export не найден');
            console.log(`[CustomUI] ✅ ${componentName} eval'нут (${scopeKeys.length} имён в scope)`);
            return result;
        } catch (e) {
            console.error(`[CustomUI] ❌ eval ${componentName} упал:`, e);
            throw e;
        }
    }

    // Eval интерфейсов
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

    // ZkmScreenNotification
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

    // ══════════════════════════════════════════════════════════════
    //  РЕГИСТРАЦИЯ КОМПОНЕНТОВ В VUE-ПРИЛОЖЕНИИ
    //  Object.assign(dd, {...}) не работает т.к. Vue уже создан.
    //  Регистрируем через window.App.component() глобально.
    // ══════════════════════════════════════════════════════════════
    function registerInApp() {
        if (!window.App) return false;
        const comps = window.__customUIComponents;
        
        // f() из index.js создаёт AsyncComponentWrapper
        // Используем f() из window.App._context или напрямую
        const f = window.App._context?.app?.component ? null : null; // f доступна через dd
        
        if (comps.MvdMenu?.default) {
            // Регистрируем компонент глобально
            window.App.$.appContext.app.component('MvdMenu', comps.MvdMenu.default);
            console.log('[CustomUI] ✅ MvdMenu зарегистрирован в Vue');
        }
        if (comps.AdvMenu?.default) {
            window.App.$.appContext.app.component('AdvMenu', comps.AdvMenu.default);
            console.log('[CustomUI] ✅ AdvMenu зарегистрирован в Vue');
        }
        if (comps.Zkm?.default) {
            window.App.$.appContext.app.component('Zkm', comps.Zkm.default);
            console.log('[CustomUI] ✅ Zkm зарегистрирован в Vue');
        }
        return true;
    }

    // Ждём window.App если ещё не создан
    if (window.App) {
        registerInApp();
    } else {
        const checkApp = setInterval(() => {
            if (window.App) {
                clearInterval(checkApp);
                registerInApp();
            }
        }, 100);
    }

    console.log('[CustomUI] 🎯 Все компоненты готовы');
})().catch(e => {
    console.error('[CustomUI] Критическая ошибка:', e);
});
