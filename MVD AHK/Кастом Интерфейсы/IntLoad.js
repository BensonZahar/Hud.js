(function () {
    // ══════════════════════════════════════════════════════════════════
    //  IntLoad.js  —  логика кастомных интерфейсов МВД
    //  Репозиторий: BensonZahar/Hud.js
    //  Папка:       MVD AHK/Кастом Интерфейсы/
    //
    //  Вызывается из LoadAhk.js ПОСЛЕ eval(mvdN.js).
    //  Задача: пропатчить mvdN-функции, зарегистрировать хуки
    //  кастомных интерфейсов которые уже лежат в assets/ после установки.
    // ══════════════════════════════════════════════════════════════════

    // ── Реестр кастомных интерфейсов ─────────────────────────────────
    // Установщик (ahk_mvd_installer.py) читает этот массив при установке
    // и автоматически генерирует Object.assign(ld,...) / Object.assign(ud,...)
    // в Index.js. Чтобы добавить новый интерфейс — добавь сюда запись,
    // переустанови через установщик. Менять .py не нужно.
    window._duranCustomInterfaces = [
        { name: "LawsHelper", files: ["LawsHelper.js", "LawsHelper.css"], hideHud: false, hideChat: false },
    ];

    // ── Патч wantedFine → LawsHelper (таб РОЗЫСК) ────────────────────
    function patchWantedFine() {
        var _origBindHandler = window._mvdBindAction;
        if (typeof _origBindHandler === 'function') {
            window._mvdBindAction = function(action, targetId) {
                if (action === 'wantedFine') {
                    window._duranWantedTargetId = targetId || -1;
                    window._duranOpenMode = "wanted";
                    setTimeout(function() { window.openInterface('LawsHelper'); }, 50);
                    return;
                }
                if (action === 'fine') {
                    window._duranFineTargetId = targetId || -1;
                    window._duranOpenMode = "fine";
                    setTimeout(function() { window.openInterface('LawsHelper'); }, 50);
                    return;
                }
                if (action === 'dahk') {
                    window._duranOpenMode = null;
                    setTimeout(function() { window.openInterface('LawsHelper'); }, 50);
                    return;
                }
                return _origBindHandler.apply(this, arguments);
            };
            console.log('[IntLoad] Патч bind (wantedFine / fine / dahk) установлен');
        }

        var _origMenuAction = window._mvdMenuAction;
        if (typeof _origMenuAction === 'function') {
            window._mvdMenuAction = function(option, targetId) {
                if (!option) return _origMenuAction.apply(this, arguments);
                if (option.action === 'wantedFine') {
                    window._duranWantedTargetId = targetId;
                    window._duranOpenMode = "wanted";
                    setTimeout(function() { window.openInterface('LawsHelper'); }, 50);
                    return;
                }
                if (option.action === 'fine') {
                    window._duranFineTargetId = targetId;
                    window._duranOpenMode = "fine";
                    setTimeout(function() { window.openInterface('LawsHelper'); }, 50);
                    return;
                }
                if (option.action === 'dahk') {
                    window._duranOpenMode = null;
                    setTimeout(function() { window.openInterface('LawsHelper'); }, 50);
                    return;
                }
                return _origMenuAction.apply(this, arguments);
            };
            console.log('[IntLoad] Патч menu (wantedFine / fine / dahk) установлен');
        }

        window._intLoadWantedFineReady = true;
    }

    patchWantedFine();

    console.log('[IntLoad] Загружен');

})();
