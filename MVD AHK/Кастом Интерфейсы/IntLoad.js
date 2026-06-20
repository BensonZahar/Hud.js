(function () {
    // ══════════════════════════════════════════════════════════════════
    //  IntLoad.js  —  реестр кастомных интерфейсов МВД
    //  Репозиторий: BensonZahar/Hud.js
    //  Папка:       MVD AHK/Кастом Интерфейсы/
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
    // ══════════════════════════════════════════════════════════════════

    window._duranCustomInterfaces = [
        { name: "Zkm",     files: ["zkm.js", "zkm.css"], hideHud: false, hideChat: false },
        { name: "MvdMenu", files: ["MvdMenu.js"],         hideHud: false, hideChat: false },
        { name: "ScreenNotification", files: ["ZkmScreenNotification.js", "ZkmScreenNotification.css"], hideHud: false, hideChat: false, startup: true },
    ];

    console.log('[IntLoad] Загружен');

})();
