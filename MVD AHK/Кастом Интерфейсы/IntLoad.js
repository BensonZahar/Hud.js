(function () {
    // ══════════════════════════════════════════════════════════════════
    //  IntLoad.js  —  логика кастомных интерфейсов МВД
    //  Репозиторий: BensonZahar/Hud.js
    //  Папка:       MVD AHK/Кастом Интерфейсы/
    //
    //  Вызывается из LoadAhk.js ПОСЛЕ eval(mvdN.js).
    //  Все патчи меню и публичное API живут в mvdN.js напрямую.
    //  Задача этого файла: зарегистрировать реестр кастомных
    //  интерфейсов и прокинуть тоггл-хелперы для LawsHelper.
    // ══════════════════════════════════════════════════════════════════

    // ── Реестр кастомных интерфейсов ─────────────────────────────────
    window._duranCustomInterfaces = [
        { name: "LawsHelper", files: ["LawsHelper.js", "LawsHelper.css"], hideHud: false, hideChat: false },
    ];

    // ── Тоггл-хелперы: LawsHelper вызывает их для управления mvdN ────
    // mvdN уже содержит stopTracking/startTracking/toggleAutoCuff и т.д.
    // в замыкании — прокидываем через window чтобы LawsHelper мог дотянуться.

    window._mvdStopTracking = function() {
        if (typeof window.stopTracking === 'function') window.stopTracking();
    };

    window._mvdStartTracking = function(id) {
        if (typeof window.startTracking === 'function') window.startTracking(id);
    };

    window._mvdToggleAutoCuff = function() {
        if (typeof window.toggleAutoCuff === 'function') window.toggleAutoCuff();
    };

    window._mvdToggleAutoGrab = function() {
        if (typeof window.toggleAutoGrab === 'function') window.toggleAutoGrab();
    };

    window._mvdTogglePartnerTrack = function() {
        if (typeof window.togglePartnerTracking === 'function') window.togglePartnerTracking();
    };

    window._mvdTogglePartnerMessage = function() {
        if (typeof window.togglePartnerMessage === 'function') window.togglePartnerMessage();
    };

    window._mvdSetPartnerId = function(id) {
        if (window.sendChatInput) {
            window._pendingPartnerId = id;
            window.sendChatInput('/id ' + id);
        }
    };

    console.log('[IntLoad] Загружен — реестр интерфейсов и тоггл-хелперы готовы');

})();
