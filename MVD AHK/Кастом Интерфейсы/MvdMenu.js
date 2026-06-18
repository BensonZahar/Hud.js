// Автогенерируется инсталлятором — реальный код MvdMenu.js правится на GitHub
// (XHR + eval, без fetch/import — для окружений без fetch)

const GITHUB_USER = "BensonZahar";
const GITHUB_REPO = "Hud.js";
const FOLDER = "MVD AHK/Кастом Интерфейсы";
const JS_FILE = "MvdMenu.js";
const EXPORT_NAME = "MvdMenu";
const CSS_FILE = null;

function buildUrl(filename) {
    const path = FOLDER ? `${encodeURIComponent(FOLDER).replace(/%2F/g, "/")}/` : "";
    return `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/${path}${filename}?t=${Date.now()}`;
}

function xhrGet(url, retries = 5) {
    return new Promise((resolve, reject) => {
        const attempt = (n) => {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.responseText);
                } else {
                    console.error(`HTTP error! status: ${xhr.status} для ${url}`);
                    if (n > 0) setTimeout(() => attempt(n - 1), 2000);
                    else reject(new Error(`Не удалось загрузить ${url} после всех попыток (status ${xhr.status})`));
                }
            };
            xhr.onerror = () => {
                console.error(`Ошибка сети при загрузке ${url}`);
                if (n > 0) setTimeout(() => attempt(n - 1), 2000);
                else reject(new Error(`Не удалось загрузить ${url} после всех попыток (сетевая ошибка)`));
            };
            xhr.send();
        };
        attempt(retries);
    });
}

function loadCss() {
    if (!CSS_FILE) return Promise.resolve();
    const styleId = EXPORT_NAME.toLowerCase() + "-remote-style";
    return xhrGet(buildUrl(CSS_FILE)).then(cssText => {
        const existing = document.getElementById(styleId);
        if (existing) existing.remove();
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = cssText;
        document.head.appendChild(style);
    }).catch(e => console.error(`Не удалось загрузить ${CSS_FILE} с GitHub:`, e));
}

let _helpersPromise = null;
function getVueHelpers() {
    // Достаём хелперы рендера прямо из текущего бандла через динамический import().
    // Это языковая конструкция (не fetch), поэтому работает даже там, где fetch недоступен.
    if (!_helpersPromise) {
        _helpersPromise = import(/* @vite-ignore */ new URL("./index.js", import.meta.url).href);
    }
    return _helpersPromise;
}

function loadJs(retries = 5) {
    return xhrGet(buildUrl(JS_FILE), retries).then(code => {
        // Исходный файл — ES-модуль:
        //   import{r as resolveComponent, ...}from"./index.js";
        //   ...
        //   export{EXPORT_NAME as default};
        // eval не умеет import/export, поэтому:
        // 1) хелперы достаём через getVueHelpers() (динамический import() того же index.js)
        // 2) убираем строку import(...) из текста кода
        // 3) заменяем export{EXPORT_NAME as default} на window[globalKey] = EXPORT_NAME

        const importMatch = code.match(/^import\{([^}]+)\}from["'][^"']+["'];?/);
        if (!importMatch) {
            throw new Error("Не найден import-блок в начале файла " + JS_FILE + " — формат файла изменился");
        }

        const destructure = importMatch[1]
            .split(",")
            .map(pair => {
                const [orig, , alias] = pair.trim().split(/\s+/);
                return alias ? `${orig}:${alias}` : orig;
            })
            .join(",");

        code = code.slice(importMatch[0].length);

        const exportRe = new RegExp("export\\{" + EXPORT_NAME + " as default\\};?\\s*$");
        if (!exportRe.test(code)) {
            throw new Error("Не найден export{" + EXPORT_NAME + " as default} в конце файла " + JS_FILE);
        }
        const globalKey = "__" + EXPORT_NAME + "_Module__";
        const helpersKey = "__" + EXPORT_NAME + "_VueHelpers__";
        code = code.replace(exportRe, `window.${globalKey} = ${EXPORT_NAME};`);

        const wrapped =
            `(function(helpers){ const {${destructure}} = helpers;\n${code}\n})(window.${helpersKey});`;

        return getVueHelpers().then(helpers => {
            window[helpersKey] = helpers;
            eval(wrapped);

            const mod = window[globalKey];
            window[globalKey] = undefined;
            window[helpersKey] = undefined;

            if (!mod) throw new Error(EXPORT_NAME + " не определился после eval");

            console.log(EXPORT_NAME + " загружен с GitHub успешно");
            return mod;
        });
    });
}

const [__mod] = await Promise.all([loadJs(), loadCss()]);
export default __mod;
