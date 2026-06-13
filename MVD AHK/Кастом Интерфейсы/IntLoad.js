(function () {
    // ══════════════════════════════════════════════════════════════════
    //  IntLoad.js  —  реестр кастомных интерфейсов МВД
    //  Репозиторий: BensonZahar/Hud.js
    //  Папка:       MVD AHK/Кастом Интерфейсы/
    //
    //  Вся логика открытия интерфейсов живёт в mvdN.js напрямую:
    //    window.showKoapTypeMenu  → openInterface('LawsHelper') с mode='fine'
    //    window.showUkInputDialog → openInterface('LawsHelper') с mode='wanted'
    //  LoadAhk.js дополнительно перехватывает эти же функции после eval()
    //  как страховку.
    // ══════════════════════════════════════════════════════════════════

    window._duranCustomInterfaces = [
        { name: "LawsHelper", files: ["LawsHelper.js", "LawsHelper.css"], hideHud: false, hideChat: false },
    ];

    console.log('[IntLoad] Загружен');

})();
