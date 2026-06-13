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
    window._duranCustomInterfaces = [
        { name: "LawsHelper", files: ["LawsHelper.js", "LawsHelper.css"], hideHud: false, hideChat: false },
    ];

    // ── Открыть LawsHelper с нужным режимом ──────────────────────────
    function openLawsHelper(mode, targetId) {
        window._duranOpenMode = mode || null;
        if (targetId !== undefined && targetId !== null) {
            if (mode === "wanted") window._duranWantedTargetId = targetId;
            if (mode === "fine")   window._duranFineTargetId   = targetId;
        }
        setTimeout(function () { window.openInterface('LawsHelper'); }, 50);
    }

    // ── Синхронизация состояний mvdN → window._mvd* (для LawsHelper) ─
    // LawsHelper читает эти переменные в dahkToggleState()
    function syncMvdState() {
        // Отслеживание
        try {
            var scanIdDesc = Object.getOwnPropertyDescriptor(window, 'currentScanId');
            if (!scanIdDesc || !scanIdDesc.get) {
                // Проксируем через геттер чтобы LawsHelper всегда видел актуальное значение
                var _scanId = window.currentScanId || null;
                Object.defineProperty(window, '_mvdTrackingActive', {
                    get: function() { return !!_scanId; },
                    configurable: true
                });
            }
        } catch(e) {}

        // Прокидываем геттеры на переменные mvdN (они в замыкании, но mvdN выставляет через window)
        // Поллинг раз в 500мс — просто и надёжно
        setInterval(function() {
            try {
                // Читаем через функцию-хелпер которую mvdN уже выставляет
                if (typeof window._mvdGetState === 'function') {
                    var st = window._mvdGetState();
                    window._mvdTrackingActive      = !!st.currentScanId;
                    window._mvdAutoCuffEnabled     = !!st.autoCuffEnabled;
                    window._mvdPartnerTrackEnabled  = !!st.partnerTrackingEnabled;
                    window._mvdPartnerMessageEnabled= !!st.partnerMessageEnabled;
                    window._mvdPartnerNick          = st.partnerNick || null;
                    window._mvdPartnerId            = st.partnerId   || null;
                    window._mvdRANK                 = st.rank        || "";
                    window._mvdFIRST_NAME           = st.firstName   || "";
                    window._mvdLAST_NAME            = st.lastName    || "";
                    window._mvdRANK_TAG             = st.rankTag     || ("[" + (st.rank||"МВД") + "]");
                }
            } catch(e) {}
        }, 500);
    }

    // ── Главный патч: перехват showMvdSubMenu и showPovsednevMenuPage ─
    function patchMvdMenus() {

        // 1. showMvdSubMenu — главное меню МВД (диалог 677)
        //    Заменяем полностью: вместо системного диалога открываем LawsHelper
        var _origShowMvdSubMenu = window.showMvdSubMenu;
        if (typeof _origShowMvdSubMenu === 'function') {
            window.showMvdSubMenu = function(targetId) {
                window._duranOpenMode = null; // открыть на табе МЕНЮ
                if (targetId !== undefined) window._duranTargetId = targetId;
                openLawsHelper(null, targetId);
            };
            console.log('[IntLoad] Патч showMvdSubMenu установлен');
        }

        // 2. showPovsednevMenuPage — подменю Повседневная (диалог 667)
        //    Тоже перехватываем: открываем LawsHelper на табе МЕНЮ
        //    (LawsHelper сам покажет нужный уровень через dahkLevel)
        var _origShowPovsednev = window.showPovsednevMenuPage;
        if (typeof _origShowPovsednev === 'function') {
            window.showPovsednevMenuPage = function(targetId) {
                window._duranOpenMode = null;
                window._duranInitLevel = "povsednev"; // LawsHelper проверит это при mount
                if (targetId !== undefined) window._duranTargetId = targetId;
                openLawsHelper(null, targetId);
            };
            console.log('[IntLoad] Патч showPovsednevMenuPage установлен');
        }

        // 3. showStroyMenuPage — подменю Строй
        var _origShowStroy = window.showStroyMenuPage;
        if (typeof _origShowStroy === 'function') {
            window.showStroyMenuPage = function(targetId) {
                window._duranOpenMode = null;
                window._duranInitLevel = "stroy";
                if (targetId !== undefined) window._duranTargetId = targetId;
                openLawsHelper(null, targetId);
            };
            console.log('[IntLoad] Патч showStroyMenuPage установлен');
        }

        // 4. Бинд-хоткей (_mvdBindAction)
        var _origBindHandler = window._mvdBindAction;
        if (typeof _origBindHandler === 'function') {
            window._mvdBindAction = function(action, targetId) {
                if (action === 'wantedFine') {
                    window._duranOpenMode = "wanted";
                    window._duranWantedTargetId = targetId || -1;
                    openLawsHelper("wanted", targetId);
                    return;
                }
                if (action === 'fine') {
                    window._duranOpenMode = "fine";
                    window._duranFineTargetId = targetId || -1;
                    openLawsHelper("fine", targetId);
                    return;
                }
                if (action === 'dahk') {
                    window._duranOpenMode = null;
                    window._duranInitLevel = null;
                    openLawsHelper(null, targetId);
                    return;
                }
                return _origBindHandler.apply(this, arguments);
            };
            console.log('[IntLoad] Патч _mvdBindAction установлен');
        }

        // 5. Клик по пункту меню (_mvdMenuAction)
        var _origMenuAction = window._mvdMenuAction;
        if (typeof _origMenuAction === 'function') {
            window._mvdMenuAction = function(option, targetId) {
                if (!option) return _origMenuAction.apply(this, arguments);
                if (option.action === 'wantedFine') {
                    window._duranOpenMode = "wanted";
                    window._duranWantedTargetId = targetId;
                    openLawsHelper("wanted", targetId);
                    return;
                }
                if (option.action === 'fine') {
                    window._duranOpenMode = "fine";
                    window._duranFineTargetId = targetId;
                    openLawsHelper("fine", targetId);
                    return;
                }
                if (option.action === 'dahk') {
                    window._duranOpenMode = null;
                    window._duranInitLevel = null;
                    openLawsHelper(null, targetId);
                    return;
                }
                return _origMenuAction.apply(this, arguments);
            };
            console.log('[IntLoad] Патч _mvdMenuAction установлен');
        }

        window._intLoadWantedFineReady = true;
    }

    // ── Экшены из LawsHelper → mvdN ──────────────────────────────────
    // LawsHelper вызывает эти функции для тогглов и отслеживания

    // Стоп отслеживания
    window._mvdStopTracking = function() {
        if (typeof window.stopTracking === 'function') {
            window.stopTracking();
        } else {
            window.sendChatInput && window.sendChatInput('/pg stop');
        }
    };

    // Старт отслеживания
    window._mvdStartTracking = function(id) {
        if (typeof window.startTracking === 'function') {
            window.startTracking(id);
        } else {
            window.sendChatInput && window.sendChatInput('/id ' + id);
            setTimeout(function() {
                window.sendChatInput && window.sendChatInput('/setmark ' + id);
            }, 500);
        }
    };

    // Тоггл AutoCuff
    window._mvdToggleAutoCuff = function() {
        if (typeof window.toggleAutoCuff === 'function') {
            window.toggleAutoCuff();
        }
    };

    // Тоггл AutoGrab
    window._mvdToggleAutoGrab = function() {
        if (typeof window.toggleAutoGrab === 'function') {
            window.toggleAutoGrab();
        }
    };

    // Тоггл отслеживания напарника
    window._mvdTogglePartnerTrack = function() {
        if (typeof window.togglePartnerTracking === 'function') {
            window.togglePartnerTracking();
        }
    };

    // Тоггл сообщений напарнику
    window._mvdTogglePartnerMessage = function() {
        if (typeof window.togglePartnerMessage === 'function') {
            window.togglePartnerMessage();
        }
    };

    // Задать напарника по ID
    window._mvdSetPartnerId = function(id) {
        if (window.sendChatInput) {
            window._pendingPartnerId = id;
            window.sendChatInput('/id ' + id);
        }
    };

    patchMvdMenus();
    syncMvdState();

    console.log('[IntLoad] Загружен — системное меню /dahk заменено на LawsHelper');

})();
