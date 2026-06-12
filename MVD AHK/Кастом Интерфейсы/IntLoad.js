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

    // ── Патч wantedFine → LawsHelper ─────────────────────────────────
    // mvdN.js уже выполнен. Патчим через monkey-patch window-функций,
    // которые mvdN выставляет наружу.
    //
    // mvdN регистрирует обработчик биндов через window._mvdBindHandler,
    // а клик по пункту меню — через window._mvdMenuAction.
    // Перехватываем оба.

    function patchWantedFine() {
        // ── Патч 1: бинд-хоткей ─────────────────────────────────────
        // LoadAhk передаёт scriptText в IntLoad через window._intLoadPatchFn
        // ПЕРЕД eval(mvdN) — поэтому текстовые замены уже сделаны.
        // Этот патч — страховка на случай если текстовый патч не сработал
        // (например mvdN обновился и изменился текст).

        var _origBindHandler = window._mvdBindAction;
        if (typeof _origBindHandler === 'function') {
            window._mvdBindAction = function(action, targetId) {
                if (action === 'wantedFine') {
                    window._duranWantedTargetId = targetId || -1;
                    setTimeout(function() { window.openInterface('LawsHelper'); }, 50);
                    return;
                }
                return _origBindHandler.apply(this, arguments);
            };
            console.log('[IntLoad] Патч wantedFine (bind) установлен');
        }

        // ── Патч 2: клик по пункту меню ─────────────────────────────
        var _origMenuAction = window._mvdMenuAction;
        if (typeof _origMenuAction === 'function') {
            window._mvdMenuAction = function(option, targetId) {
                if (option && option.action === 'wantedFine') {
                    window._duranWantedTargetId = targetId;
                    setTimeout(function() { window.openInterface('LawsHelper'); }, 50);
                    return;
                }
                return _origMenuAction.apply(this, arguments);
            };
            console.log('[IntLoad] Патч wantedFine (menu) установлен');
        }

        // Если mvdN ещё не выставил хуки — ставим флаг, mvdN проверит его
        window._intLoadWantedFineReady = true;
    }

    patchWantedFine();

    console.log('[IntLoad] Загружен');

})();
