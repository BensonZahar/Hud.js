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
    ];

    // ══════════════════════════════════════════════════════════════════
    //  buildInterfacesBlock — генератор блока регистрации интерфейсов
    //  для вставки в Index.js: Object.assign(ld,...);Object.assign(ud,...);
    //
    //  Инсталлятор скачивает этот файл, выполняет его (eval/evaluate_js)
    //  и вызывает window.__buildInterfacesBlock(window._duranCustomInterfaces).
    //  Формат вставки правится здесь — переустановка/пересборка не нужна.
    // ══════════════════════════════════════════════════════════════════
    function buildInterfacesBlock(ifaces) {
        if (!ifaces || !ifaces.length) return "";

        const ldParts = [];
        const udParts = [];

        for (const iface of ifaces) {
            const name = iface.name;
            const files = iface.files || [];
            const jsFile = files.find(f => f.endsWith(".js")) || files[0];
            const filesJs = "[" + files.map(f => `"${f}"`).join(",") + "]";
            const hideHud = iface.hideHud ? "!0" : "!1";
            const hideChat = iface.hideChat ? "!0" : "!1";

            ldParts.push(`${name}:f(()=>d(()=>import("./${jsFile}"),${filesJs},import.meta.url))`);
            udParts.push(`${name}:{open:{status:!1},show:!0,options:{hideHud:${hideHud},hideChat:${hideChat}}}`);
        }

        return `Object.assign(ld,{${ldParts.join(",")}});Object.assign(ud,{${udParts.join(",")}});`;
    }

    window.__buildInterfacesBlock = buildInterfacesBlock;

    console.log('[IntLoad] Загружен');

})();
