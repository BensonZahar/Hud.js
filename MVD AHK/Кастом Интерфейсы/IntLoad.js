(function () {
// ══════════════════════════════════════════════════════════════════
//  IntLoad.js  —  реестр кастомных интерфейсов МВД
//
//  CustomUI.js — ЕДИНСТВЕННЫЙ физический файл в assets/.
//  Он сам:
//    1. Делает dynamic import('./index.js') — получает все Webpack-имена
//    2. Загружает все компоненты с GitHub
//    3. Парсит import-строки, маппит минифицированные имена
//    4. Eval'ит через new Function
//    5. Сохраняет готовые Vue-компоненты в window.__customUIComponents
//    6. Инжектит CSS в <head>
//
//  Интерфейсы с files: [] не требуют физического файла —
//  движок берёт их из window.__customUIComponents через Promise.
//  Установщик (ahk_mvd_installer.py) знает об этом и генерирует
//  соответствующий код вставки.
//
//  ZkmScreenNotification убран из реестра — его eval'ит CustomUI.js
//  как sideEffect (вешает window.ZkmScreenNotification сам).
// ══════════════════════════════════════════════════════════════════
window._duranCustomInterfaces = [
    { name: "CustomUI", files: ["CustomUI.js", "CustomUI.css"], type: "sideEffect" },
    { name: "Zkm",     files: [], hideHud: false, hideChat: false, type: "interface" },
    { name: "MvdMenu", files: [], hideHud: false, hideChat: false, type: "interface" },
    { name: "AdvMenu", files: [], hideHud: false, hideChat: false, type: "interface" },
];
console.log('[IntLoad] Загружен');
})();
