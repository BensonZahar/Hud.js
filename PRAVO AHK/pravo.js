// ── PlayerInteraction: лог ника и ID цели при открытии радиального меню ──────
// Вставить в pravo.js ПОСЛЕ блока _patchInteractionsHooks (после его `})();`)
// или просто в конец файла.
//
// Как это работает: сервер (MenuInteraction / OnEntitySelected) кладёт ник цели
// в params[0] при openInterface('PlayerInteraction', ...) — именно его интерфейс
// показывает как «Взаимодействие с Имя Фамилия». ID в params нет, поэтому ищем его
// по нику в window._mvdPlayerList (его уже заполняет onUpdatePlayersList).
(function _pravoInteractionTargetLog() {
    if (window.__pravoIntTargetLog) return;
    window.__pravoIntTargetLog = true;

    function findId(nick) {
        try {
            var list = window._mvdPlayerList;
            if (!list || !nick) return null;
            if (list.local && list.local.name === nick) return list.local.id;
            if (Array.isArray(list.players)) {
                var f = list.players.find(function (p) { return p.name === nick; });
                return f ? f.id : null;
            }
        } catch (e) {}
        return null;
    }

    function parseParams(params) {
        try {
            if (typeof params === 'string') params = JSON.parse(params.replace(/\n/, '\\n'));
            return Array.isArray(params) ? params : null;
        } catch (e) { return null; }
    }

    function logTarget(params, src) {
        var p = parseParams(params);
        var raw = p && p[0];
        if (typeof raw !== 'string' || !raw) return;

        // сервер шлёт «Ivan_Petrov»; на случай пробелов пробуем оба варианта
        var nick = raw.trim();
        var nickAlt = nick.split(' ').join('_');

        function report(idSuffix) {
            var id = findId(nick);
            if (id === null) id = findId(nickAlt);
            window._pravoLastInteractionTarget = { nick: nick, id: id, src: src, time: Date.now() };
            console.log('[PRAVO] 🎯 PlayerInteraction (' + src + '): цель "' + nick + '" | ID: '
                + (id !== null ? id : 'не найден в списке игроков') + (idSuffix || ''));
            return id;
        }

        if (report() === null && typeof window.updatePlayerList === 'function') {
            // список игроков обновляется раз в ~30с — просим движок обновить и пробуем ещё раз
            try { window.updatePlayerList(); } catch (e) {}
            setTimeout(function () { report(' (после обновления списка)'); }, 700);
        }
    }

    // openInterface('PlayerInteraction', params)
    var _oi = window.openInterface;
    window.openInterface = function (name, params) {
        var wasOpen = false;
        if (name === 'PlayerInteraction') {
            try { wasOpen = !!window.getInterfaceStatus('PlayerInteraction'); } catch (e) {}
            // если уже открыт — оригинальный openInterface вызов проигнорирует, не логируем
            if (!wasOpen) { try { logTarget(params, 'open'); } catch (e) {} }
        }
        return _oi.apply(this, arguments);
    };

    // updateParams('PlayerInteraction', json) — сервер может обновлять меню на лету
    var _up = window.updateParams;
    if (typeof _up === 'function') {
        window.updateParams = function (name, params) {
            if (name === 'PlayerInteraction') {
                try {
                    var p = parseParams(params);
                    var last = window._pravoLastInteractionTarget;
                    if (p && typeof p[0] === 'string' && (!last || last.nick !== p[0].trim())) {
                        logTarget(params, 'update');
                    }
                } catch (e) {}
            }
            return _up.apply(this, arguments);
        };
    }

    console.log('[PRAVO] ✅ PlayerInteraction target logger установлен');
})();
