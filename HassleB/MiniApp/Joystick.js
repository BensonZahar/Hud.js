// ╔══════════════════════════════════════════════════════════════════════╗
// ║  MiniApp/Joystick.js — мини-апп «Джойстик» (Telegram Mini App)       ║
// ║                                                                      ║
// ║  Кнопка «🕹 Джойстик» добавляется в меню «Движение». Мини-апп шлёт   ║
// ║  вектор стика и кнопки в Firebase (/ctl/<ключ>), игра читает и       ║
// ║  подаёт в тот же стик, что и родной HUD (<Gamepad>/leftStick).       ║
// ║  Безопасность: ключ отдельный от статистики; нет новых данных        ║
// ║  ~0.7 с — стик и кнопки сами отпускаются.                            ║
// ║  Запуск: добавить 'Joystick.js' в FILES в MiniApp.js (после Stats.js)║
// ╚══════════════════════════════════════════════════════════════════════╝
try { (function () {
    function dbg(m) { try { console.log('[CODE3][JOY] ' + m); } catch (e) {} }
    if (typeof config === 'undefined' || typeof tgApi !== 'function' || typeof _mvCheckApi !== 'function' || typeof _mvHeld === 'undefined') {
        try { console.warn('[CODE3][JOY] мини-апп джойстика не установлен: нет доступа к Code.js'); } catch (e) {}
        return;
    }
    const APP_URL = 'https://bensonzahar.github.io/Hud.js/HassleB/MiniApp/joystick.html';
    const DB_URL = 'https://haeb-41fcc-default-rtdb.firebaseio.com';
    const FAST_MS = 70, SLOW_MS = 1000, ACTIVE_MS = 6000, DEADMAN_MS = 700;
    const P_STICK = '<Gamepad>/leftStick', P_JUMP = '<Keyboard>/leftShift', P_ATK = '<Mouse>/leftButton', P_SPRINT = '<Keyboard>/Space', P_CROUCH = (typeof _MV_CROUCH === 'string' ? _MV_CROUCH : '<Keyboard>/c');

    function stale() { try { return typeof __hassleStale === 'function' && !!__hassleStale(); } catch (e) { return false; } }

    // Отдельный секретный ключ управления (не тот, что у статистики): ссылка с ним даёт управление персонажем
    function ctlKey() {
        const ls = 'hassleCtlKey' + (window.ACCOUNT_NUMBER ? '_' + window.ACCOUNT_NUMBER : '');
        let k = null;
        try { k = localStorage.getItem(ls); } catch (e) {}
        if (!k) k = window.__hassleCtlKey;
        if (!k || !/^[A-Za-z0-9]{20,}$/.test(k)) {
            const A = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let r = [];
            try { const u = new Uint8Array(28); crypto.getRandomValues(u); r = Array.prototype.slice.call(u); } catch (e) {}
            k = '';
            for (let i = 0; i < 28; i++) k += A[(r.length ? r[i] : Math.floor(Math.random() * 62)) % 62];
            try { localStorage.setItem(ls, k); } catch (e) {}
        }
        window.__hassleCtlKey = k;
        return k;
    }
    const KEY = ctlKey();

    // ── Применение состояния ──
    let lastSeq = null, lastChange = 0, lastC = null, lastJc = null, lastAc = null;
    let ST = null;                          // последнее состояние из мини-аппа
    const tapUntil = { j: 0, a: 0, c: 0 };        // короткое нажатие держим минимум TAP_MS, даже если палец уже отпущен
    const TAP_MS = 160;
    function hold(path, kind, on) {
        const h = _mvHeld[path];
        if (on && !h) {
            _mvCheckApi(); _mvCreate(path, kind);
            window.onScreenControlTouchStart(path);
            _mvHeld[path] = { kind: kind, tick: null, timer: null, joy: true };
        } else if (!on && h && h.joy) _mvRelease(path);
    }
    function releaseAll() {
        ST = null; tapUntil.j = tapUntil.a = tapUntil.c = 0;
        [P_STICK, P_JUMP, P_ATK, P_SPRINT, P_CROUCH].forEach(function (p) { const h = _mvHeld[p]; if (h && h.joy) _mvRelease(p); });
    }
    // Каждый тик (~70 мс): выставляем стик и кнопки по последнему состоянию
    function drive() {
        if (!ST) return;
        try {
            if (typeof _mvBusy !== 'undefined' && _mvBusy) return;   // идёт шаг от кнопок Telegram
            const now = Date.now(), moving = Math.abs(ST.x) > 0.001 || Math.abs(ST.y) > 0.001;
            hold(P_STICK, 'stick', moving);
            if (moving && _mvHeld[P_STICK] && _mvHeld[P_STICK].joy) window.onScreenControlTouchMove(P_STICK, ST.x, ST.y);
            hold(P_SPRINT, 'button', ST.sp && moving);
            hold(P_JUMP, 'button', ST.j || now < tapUntil.j);
            hold(P_ATK, 'button', ST.at || now < tapUntil.a);
            _mvEnsureCrouchHook();                                   // хук приседа: кнопка «Сесть/Встать» в Telegram узнает о нажатии C
            hold(P_CROUCH, 'button', ST.cr || now < tapUntil.c);     // как в Hud.js: C держится, пока палец на втором касании
        } catch (e) { dbg('ошибка применения: ' + (e && e.message)); releaseAll(); }
    }
    function apply(str) {
        const a = String(str).split('|');
        if (a.length < 7) return;
        const seq = +a[0], c = +a[5], jc = +(a[7] || 0), ac = +(a[8] || 0);
        if (seq !== lastSeq) { lastSeq = seq; lastChange = Date.now(); }
        if (lastC === null) { lastC = c; lastJc = jc; lastAc = ac; return; }   // первое чтение: старые нажатия не повторяем
        const now = Date.now();
        if (jc !== lastJc) { lastJc = jc; tapUntil.j = now + TAP_MS; }          // счётчик нажатий не теряется, даже если
        if (ac !== lastAc) { lastAc = ac; tapUntil.a = now + TAP_MS; }          // «нажал-отпустил» склеились в одну запись
        ST = { x: +a[1], y: +a[2], j: +a[3] === 1, at: +a[4] === 1, sp: +a[6] === 1, cr: +(a[9] || 0) === 1 };
        if (c !== lastC) { lastC = c; tapUntil.c = now + TAP_MS; }               // двойной тап: C нажимается минимум TAP_MS
        drive();
    }

    // ── Опрос Firebase: быстро, пока мини-апп открыт (идут новые seq), иначе редко ──
    let busy = false, fails = 0;
    function poll() {
        if (stale()) { releaseAll(); return; }
        const active = Date.now() - lastChange < ACTIVE_MS;
        const next = function () { window.setTimeout(poll, active ? FAST_MS : SLOW_MS); };
        // «мёртвая рука»: мини-апп замолчал — отпускаем всё
        if (Date.now() - lastChange > DEADMAN_MS) releaseAll();
        drive();
        if (busy) return next();
        busy = true;
        const x = new XMLHttpRequest();
        x.open('GET', DB_URL + '/ctl/' + KEY + '.json?_=' + Date.now(), true);
        x.timeout = 3000;
        const fin = function (ok) { busy = false; if (!ok) { fails++; if (fails === 1 || fails % 60 === 0) dbg('нет связи с Firebase'); } else fails = 0; next(); };
        x.onload = function () {
            if (x.status >= 200 && x.status < 300) { try { const v = JSON.parse(x.responseText); if (typeof v === 'string') apply(v); } catch (e) {} fin(true); }
            else fin(false);
        };
        x.onerror = function () { fin(false); };
        x.ontimeout = function () { fin(false); };
        x.send();
    }
    try { if (window.__hassleJoyPoll) window.clearTimeout(window.__hassleJoyPoll); } catch (e) {}
    window.setTimeout(poll, 2000);

    // ── Кнопка «🕹 Джойстик» в меню «Движение» (по move_jump_<uniqueId>) ──
    const BTN_ERR = /BUTTON_|WEB_APP|wrong HTTP URL|URL_INVALID/i;
    function addButton(payload) {
        const mk = payload.reply_markup, isStr = typeof mk === 'string';
        if (isStr && mk.indexOf('move_jump_' + uniqueId) === -1) return false;
        let obj;
        try { obj = JSON.parse(isStr ? mk : JSON.stringify(mk)); } catch (e) { return false; }
        if (!obj || !obj.inline_keyboard) return false;
        const rows = obj.inline_keyboard;
        let at = -1;
        rows.forEach(function (row, i) { row.forEach(function (b) { if (b && String(b.callback_data || '').indexOf('move_jump_' + uniqueId) === 0) at = i; }); });
        if (at < 0) return false;
        const url = APP_URL + '?k=' + KEY, priv = Number(payload.chat_id) > 0;
        const nb = { text: '🕹 Джойстик' };
        if (priv) nb.web_app = { url: url }; else nb.url = url;
        rows.splice(at, 0, [nb]);
        payload.reply_markup = isStr ? JSON.stringify(obj) : obj;
        return true;
    }
    const origTgApi = tgApi;
    tgApi = function (method, payload, onSuccess, onError, retryCount) {
        let backup = null;
        try {
            if ((method === 'sendMessage' || method === 'editMessageText' || method === 'editMessageReplyMarkup') && payload && payload.reply_markup && !stale()) {
                const before = payload.reply_markup;
                if (addButton(payload)) backup = before;
            }
        } catch (e) { dbg('кнопка не добавлена: ' + e.message); backup = null; }
        if (backup === null) return origTgApi.apply(this, arguments);
        const self = this;
        const failBack = function (status, body) {
            if (status === 400 && BTN_ERR.test(String(body || ''))) { payload.reply_markup = backup; return origTgApi.call(self, method, payload, onSuccess, onError, retryCount); }
            if (onError) return onError.apply(self, arguments);
        };
        return origTgApi.call(this, method, payload, onSuccess, failBack, retryCount);
    };

    dbg('Мини-апп джойстика загружен (кнопка «🕹 Джойстик» в меню «Движение»)');
})(); } catch (e) { try { console.warn('[CODE3][JOY] ошибка: ' + (e && e.message)); } catch (e2) {} }
// END Joystick.js //
