(function () {
    // ══════════════════════════════════════════════════════════════════
    //  IntLoad.js  —  реестр кастомных интерфейсов МВД
    //  Репозиторий: BensonZahar/Hud.js
    //  Папка:       MVD AHK/Кастом Интерфейсы/
    //
    //  Этот файл НЕ выполняется в браузере как часть рантайма —
    //  это просто манифест, который установщик (ahk_mvd_installer.py)
    //  скачивает и парсит, чтобы сгенерировать код для вставки в index.js.
    //  См. _fetch_custom_interfaces() / _build_interfaces_block() в .py.
    //
    //  Вся логика открытия интерфейсов живёт в mvdN.js напрямую:
    //    window.showKoapTypeMenu  → openInterface('LawsHelper') с mode='fine'
    //    window.showUkInputDialog → openInterface('LawsHelper') с mode='wanted'
    //    window.showPovsednevMenuPage → openInterface('MvdMenu')
    //  LoadAhk.js дополнительно перехватывает эти же функции после eval()
    //  как страховку.
    //
    //  CSS для MvdMenu не нужен — стили инжектятся внутри MvdMenu.js
    //  через document.createElement('style') в mounted(), как в zkm.js.
    //
    //  ── Поле "type" ──────────────────────────────────────────────────
    //  "interface"  (по умолчанию, можно не указывать) —
    //      регистрируется как настоящий Vue-компонент в ld/ud движка
    //      под именем "name" (через openInterface(name)/closeInterface(name)).
    //      ВАЖНО: "name" обязан быть уникальным и НЕ совпадать ни с одним
    //      нативным интерфейсом игры (ScreenNotification, Menu, Hud, Dialog,
    //      InventoryNew, Console, BattlePassWelcome, BlackMarket,
    //      FullScreenPreloader и т.д.) — иначе родной интерфейс будет
    //      ПОЛНОСТЬЮ подменён нашим компонентом для всей игры, а не только
    //      для МВД (история ZkmScreenNotification — это было ровно это).
    //      Установщик дополнительно проверяет это и сам откажется
    //      регистрировать совпадающее имя (см. NATIVE_INTERFACE_NAMES в .py).
    //
    //  "sideEffect" —
    //      файл просто импортируется один раз при старте клиента (через
    //      голый import(), без f()-обёртки и без записи в ld/ud). Никак
    //      не связан с системой интерфейсов движка, ничего не подменяет.
    //      Используется для скриптов, которым нужно просто выполниться
    //      и повесить себя на window.* (как ZkmScreenNotification.js,
    //      который выставляет window.ZkmScreenNotification и рисует
    //      уведомления сам, через document.body.appendChild — без Vue).
    // ══════════════════════════════════════════════════════════════════

    window._duranCustomInterfaces = [
        { name: "Zkm",     files: ["zkm.js", "zkm.css"], hideHud: false, hideChat: false, type: "interface" },
        // MvdMenu — vanilla DOM, грузится в LoadAhk.js как MvdMenu_dom.js (XHR + eval).
        // Не регистрировать здесь — иначе движок захватит openInterface('MvdMenu') глобально.
        { name: "ZkmScreenNotification", files: ["ZkmScreenNotification.js", "ZkmScreenNotification.css"], type: "sideEffect" },
    ];

    console.log('[IntLoad] Загружен');

})();
