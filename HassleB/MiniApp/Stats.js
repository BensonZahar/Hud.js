// ╔══════════════════════════════════════════════════════════════════════╗
// ║  MiniApp/Stats.js — статистика персонажа в Telegram Mini App         ║
// ║  Отдельный файл (раньше был блоком внизу Code3.js). Грузится через   ║
// ║  MiniApp/MiniApp.js (список FILES) и выполняется в области видимости ║
// ║  Code.js (нужны config, processUpdates, tgApi…).                     ║
// ║  Нет файла / ошибка в нём — кнопка «Инфо об аккаунте» шлёт обычный   ║
// ║  текст, как раньше.                                                  ║
// ║                                                                      ║
// ║  Страница stats.html лежит рядом (HassleB/MiniApp/, GitHub Pages) в  ║
// ║  стиле MainMenu игры. Данные — тот же профиль, что читается из       ║
// ║  вкладки «Персонаж» (config.accountInfo.profile) + живые деньги.     ║
// ║  Профиль ещё не загружен / APP_URL не задан — работает старый текст. ║
// ║                                                                      ║
// ║  Кнопка «💰 Инфо об аккаунте» в Telegram → карточка с мини-аппом.    ║
// ║  /statapp — то же самое командой из игрового чата.                   ║
// ╚══════════════════════════════════════════════════════════════════════╝
try { (function () {
    function dbg(m) { try { console.log('[CODE3][STATAPP] ' + m); } catch (e) {} }
    if (typeof config === 'undefined' || typeof processUpdates !== 'function' || typeof tgApi !== 'function') {
        try { console.warn('[CODE3][STATAPP] мини-апп статистики не установлен: нет доступа к Code.js'); } catch (e) {}
        return;
    }
    const APP_URL = 'https://bensonzahar.github.io/Hud.js/HassleB/MiniApp/stats.html';
    const URL_MAX = 1900;

    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    function stale() { try { return typeof __hassleStale === 'function' && !!__hassleStale(); } catch (e) { return false; } }
    function who() { return (typeof displayName !== 'undefined' && displayName) ? String(displayName) : (window.CURRENT_USER || '?'); }
    function ready() { const p = config.accountInfo && config.accountInfo.profile; return !!(p && p.loaded) && APP_URL.indexOf('ВАШ_') === -1; }

    function b64url(str) {   // вручную, как в блоке Near: TextEncoder/btoa в движке игры могут отсутствовать
        const bytes = [];
        for (let i = 0; i < str.length; i++) {
            let c = str.charCodeAt(i);
            if (c >= 0xD800 && c <= 0xDBFF && i + 1 < str.length) {
                const c2 = str.charCodeAt(i + 1);
                if (c2 >= 0xDC00 && c2 <= 0xDFFF) { c = 0x10000 + ((c - 0xD800) << 10) + (c2 - 0xDC00); i++; }
            }
            if (c < 0x80) bytes.push(c);
            else if (c < 0x800) bytes.push(0xC0 | (c >> 6), 0x80 | (c & 63));
            else if (c < 0x10000) bytes.push(0xE0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
            else bytes.push(0xF0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
        }
        const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
        let out = '';
        for (let i = 0; i < bytes.length; i += 3) {
            const b0 = bytes[i], b1 = bytes[i + 1], b2 = bytes[i + 2];
            out += A[b0 >> 2] + A[((b0 & 3) << 4) | ((b1 || 0) >> 4)];
            if (b1 !== undefined) out += A[((b1 & 15) << 2) | ((b2 || 0) >> 6)];
            if (b2 !== undefined) out += A[b2 & 63];
        }
        return out;
    }

    // ── Последняя з/п ──
    // Code.js обнуляет config.lastSalaryInfo сразу после PayDay-чека, поэтому «Последняя з/п» почти всегда пустая.
    // Перехватываем присваивание: при обнулении кладём копию в window.__hassleLastSal (переживает /reload).
    try {
        let _ls = config.lastSalaryInfo;
        Object.defineProperty(config, 'lastSalaryInfo', {
            configurable: true, enumerable: true,
            get: function () { return _ls; },
            set: function (v) {
                try { if (_ls && _ls.salary && (v === null || v === undefined)) window.__hassleLastSal = { salary: String(_ls.salary), balance: _ls.balance ? String(_ls.balance) : '', time: _ls.time || '' }; } catch (e) {}
                _ls = v;
            }
        });
    } catch (e) { dbg('перехват з/п не установлен: ' + e.message); }

    // Снимок профиля в компактном виде (ключи см. stats.html)
    function collect() {
        const p = config.accountInfo.profile, ai = config.accountInfo;
        let hours = null, donate = null, vip = 0, cash = p.cash, bank = p.bank, fac = '';
        try { const s = window.App && window.App.$store; if (s) { const hr = s.getters['player/passedHours'], dn = s.getters['player/donate'], vp = s.getters['player/vip']; if (hr != null) hours = hr; if (dn != null && dn > 0) donate = dn; if (vp && vp > 0) vip = vp; } } catch (e) {}
        if (!vip) vip = ['silver', 'gold', 'platinum'].indexOf(p.subscribe) + 1;
        try { const m = getPlayerMoneyFromStore(); if (m) { if (m.money != null) cash = m.money; if (m.bankMoney != null) bank = m.bankMoney; } } catch (e) {}
        try { if (config.currentFaction) fac = getFactionLabel(config.currentFaction); } catch (e) {}
        const cur = config.lastSalaryInfo, ls = (cur && cur.salary) ? cur : window.__hassleLastSal;
        const d = {
            t: Date.now(), n: ai.nickname, s: ai.server, f: fac,
            o: [p.orgTitle, p.rank, p.rankNum, p.status], l: [p.level, p.xpCurrent, p.xpTarget], h: hours,
            m: [cash, bank, donate, p.simBalance], ph: p.phone, v: vip,
            st: [p.stamina, p.strength], lw: p.lawLevel, pr: [p.housesCount, p.bizCount, p.carsCount],
            pd: (p.propertiesDetail || []).map(function (x) { return [x.isApartment ? 'Квартира' : x.name, x.days ? x.days.current : 0, x.days ? x.days.max : 0, x.days && x.days.isDanger ? 1 : 0]; }),
            b: (p.buffs || []).map(function (x) { return [x.text, x.debuff ? 1 : 0]; }),
            j: (p.jobs || []).map(function (x) { return [x.title, x.lvl]; }),
            sal: (ls && ls.salary) ? [String(ls.salary), ls.time || '', ls.balance ? String(ls.balance) : ''] : null
        };
        if (config.lastPlayerId) d.id = config.lastPlayerId;
        if (ai.skinId !== null && ai.skinId !== undefined) d.sk = ai.skinId;

        // Выговоры: [текущие, максимум, состояние] — 0 проверено, 1 не удалось, 2 проверяем
        if (p.warningsChecked && p.warnings != null) d.w = [p.warnings, p.maxWarnings || 3, 0];
        else if (p.warningsFailed) d.w = [0, 0, 1];
        else if (p.loaded && !p.warningsChecked && config.currentFaction) d.w = [0, 0, 2];

        // Live HUD
        try {
            const h = getHudInfoFull();
            if (h) {
                const r = function (v) { return v != null ? Math.round(v) : null; };
                d.hud = [r(h.health), r(h.armour), r(h.hunger), h.wanted != null ? h.wanted : null, h.breath != null ? h.breath : null,
                    h.weapon ? String(h.weapon).split('/').pop().replace(/\.\w+$/, '') : '',
                    h.ammoInClip != null ? h.ammoInClip : null, h.totalAmmo != null ? h.totalAmmo : null];
            }
        } catch (e) {}

        // Позиция
        try {
            const pos = getPlayerPositionFromStore();
            if (pos) d.pos = [Math.round(pos.x), Math.round(pos.y), Math.round(pos.z || 0), Math.round(pos.angle || 0), isInInterior(pos) ? 1 : 0];
        } catch (e) {}

        // Сессия: онлайн, тюрьма, AFK-цикл
        try {
            if (globalState.sessionStartTime) d.on = Math.floor((Date.now() - globalState.sessionStartTime) / 1000);
            if (globalState.inPrison) d.pz = 1;
            const af = config.afkCycle;
            if (af && af.active) {
                const modes = { fixed: '5/5 мин', random: 'Рандом', none: 'Без паузы' };
                d.afk = [modes[af.mode] || af.mode, Math.floor((af.totalPlayTime || 0) / 60000), fm(af.totalSalary || 0)];
            }
        } catch (e) {}

        // Настройки уведомлений — порядок как в блоке «Текущие настройки уведомлений»
        d.ns = [config.paydayNotifications, config.govMessagesEnabled, config.radioOfficialNotifications,
            config.radioImportantFilter, config.warningNotifications, config.trackLocationRequests, config.kacAutoReply]
            .map(function (x) { return x ? 1 : 0; });
        return d;
    }

    // Ссылка со снимком; не влезает в лимит Telegram — по шагам убираем второстепенное
    function buildUrl(d) {
        const steps = [
            function () {},
            function () { delete d.ns; delete d.afk; },
            function () { delete d.pos; delete d.on; },
            function () { d.sal = null; },
            function () { d.b = d.b.slice(0, 4); },
            function () { d.pd = d.pd.slice(0, 8); d.j = d.j.slice(0, 4); },
            function () { d.pd = d.pd.slice(0, 4); d.b = d.b.slice(0, 1); },
            function () { d.pd = []; d.b = []; d.j = []; delete d.hud; }
        ];
        let url = '';
        for (let i = 0; i < steps.length; i++) {
            steps[i]();
            url = APP_URL + (APP_URL.indexOf('?') === -1 ? '?' : '&') + 'd=' + b64url(JSON.stringify(d));
            if (url.length <= URL_MAX) break;
        }
        return url;
    }

    function fm(n) { try { return fmtMoney(n); } catch (e) { return String(n); } }

    // web_app-кнопка работает только в личке с ботом; в группе — запасная кнопка-ссылка
    function sendCard() {
        const d = collect(), url = buildUrl(d);
        const text = '📊 <b>Статистика (' + esc(who()) + ')</b>\nУр. <b>' + (d.l[0] != null ? d.l[0] : '—') + '</b> · нал ' + (d.m[0] != null ? fm(d.m[0]) : '—') + ' ₽ · банк ' + (d.m[1] != null ? fm(d.m[1]) : '—') + ' ₽' + ((d.w && d.w[2] === 0 && d.w[0] > 0) ? '\n⚠️ Выговоры: <b>' + d.w[0] + '/' + d.w[1] + '</b>' : '');
        (config.chatIds || []).forEach(function (chatId) {
            const base = { chat_id: chatId, text: text, parse_mode: 'HTML' };
            const kb = function (b) { return JSON.stringify({ inline_keyboard: [[b]] }); };
            tgApi('sendMessage', Object.assign({}, base, { reply_markup: kb({ text: '📱 Открыть статистику', web_app: { url: url } }) }), null, function (status) {
                dbg('web_app-кнопка не принята (' + status + ') — шлю обычной ссылкой');
                tgApi('sendMessage', Object.assign({}, base, { reply_markup: kb({ text: '🌐 Открыть статистику', url: url }) }), null, function (s2) {
                    console.warn('[CODE3][STATAPP] не доставлено в ' + chatId + ': ' + s2);
                });
            });
        });
    }

    // ── Кнопка «Инфо об аккаунте» (callback_data local_account_info_<uniqueId>) ──
    const origProc = processUpdates;
    processUpdates = function (updates) {
        if (stale() || !ready()) return origProc.apply(this, arguments);
        const rest = [];
        for (const u of updates) {
            const cq = u.callback_query;
            if (cq && cq.data === 'local_account_info_' + uniqueId && cq.message && config.chatIds.includes(String(cq.message.chat.id))) {
                config.lastUpdateId = u.update_id;
                try { setSharedLastUpdateId(config.lastUpdateId); } catch (e) {}
                try { answerCallbackQuery(cq.id); } catch (e) {}
                try { sendCard(); } catch (e) { dbg('ошибка: ' + e.message); }
                continue;
            }
            rest.push(u);
        }
        if (rest.length) return origProc.call(this, rest);
    };

    // ── Команда в игровом чате: /statapp ──
    const prevWin = window.sendChatInputCustom;
    let prevVar = null;
    try { if (typeof sendChatInput === 'function') prevVar = sendChatInput; } catch (e) {}
    const prevChat = prevWin || prevVar;
    const myChat = function (e) {
        if (!stale() && typeof e === 'string' && e.trim().toLowerCase() === '/statapp') {
            if (ready()) sendCard(); else { try { sendToTelegram('⏳ <b>Профиль ещё не загружен (' + esc(who()) + ')</b>', true, null); } catch (x) {} }
            return;
        }
        if (typeof prevChat === 'function') return prevChat.apply(this, arguments);
    };
    window.sendChatInputCustom = myChat;
    try { sendChatInput = myChat; } catch (e) {}

    dbg('Мини-апп статистики загружен (кнопка «Инфо об аккаунте», /statapp)');
})(); } catch (e) { try { console.error('[STATAPP] ошибка Stats.js:', e); } catch (e2) {} }
// END Stats.js //
