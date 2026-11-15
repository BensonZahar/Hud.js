// ZKM Screen Notification — v6.0 "Native Toast"
//
// Раньше здесь был собственный интерфейс уведомлений (~40 КБ JS + ~18 КБ CSS).
// Теперь это тонкий АДАПТЕР с тем же API: window.ZkmScreenNotification
// (add / hideAll / addTimer / updateTimer / hideTimer / hideAllTimers /
//  addOfferChoice / highlightOfferChoice / resolveOfferChoice / hideOfferChoice / hideAllOffers),
// поэтому вызовы в mvdF.js / fsin.js / pravo.js / fsb.js / fkonst.js менять не нужно.
//
//   • add(...)            → РОДНОЙ тост игры: window.pushToast([...])   (стек до 2 шт., иконка и звук по типу)
//   • addTimer(...)       → компактная карточка-таймер в стиле тоста (inline-стили, без CSS-файла).
//                           InformationTimer не подходит: он один на всех, а таймеры АХК бывают одновременно
//                           (отслеживание + КД /setmark + КД штрафа + «Вышел из игры»).
//   • addOfferChoice(...) → тост с подсказкой «Alt ×1 — отмена, Alt ×2 — подтвердить». Alt-логика живёт
//                           снаружи (mvdF.js), здесь только таймаут и колбэк onFinish(id, 'yes'|'no'|'expire').
//
// Тип тоста выбирается по цвету-акценту из payload:
//   красный → failure, зелёный → success, оранжевый/золотой → warning, остальное (синий, серый) → info.
//
// ВАЖНО: родной тост не умеет убирать ОДИН тост — только clearToasts() (стирает и тосты самой игры).
// Поэтому hideAll() по умолчанию ничего не стирает (HIDE_ALL_CLEARS = false): старые тосты сами
// уходят по таймеру, а третий вытесняет самый старый.
;(function () {
    'use strict';

    /* ═════════════════════════ НАСТРОЙКИ ═════════════════════════ */
    // Колонка слева сбоку (как было у Zkm: left, top 54vh).
    // У родного тоста CUSTOM-позиция — это vw/vh центра по горизонтали и верхней точки по вертикали.
    // Подбор на месте:  window.pushToast([false, "тест", 0, 5000, 6, [15, 54]])
    var TOAST_LEFT_VW = 15;
    var TOAST_LEFT_VH = 54;

    // true — любые позиции из payload (0 сверху / 1 слева / 2 снизу) показывать слева.
    // false — 1 слева, 0 сверху по центру, 2 снизу по центру.
    var FORCE_LEFT = true;

    // hideAll() стирает тосты (в т.ч. игровые), если наш тост ещё на экране.
    var HIDE_ALL_CLEARS = false;

    // Когда оффер закрыт (Alt×2 / Alt×1 / отмена снаружи) — стереть его тост, чтобы подсказка не висела.
    var CLEAR_ON_OFFER_END = true;

    /* ═════════════════════════ СЛУЖЕБНОЕ ═════════════════════════ */
    var T_INFO = 0, T_SUCCESS = 1, T_FAILURE = 2, T_WARNING = 3;
    var P_TOP_CENTER = 1, P_BOTTOM_CENTER = 4, P_CUSTOM = 6;

    var last = 0;                 // счётчик id (общий для таймеров и офферов)
    var ownToastUntil = 0;        // до какого момента наш тост ещё на экране
    var warnedNoToast = false;

    /* Убираем мусор: цвет-теги {RRGGBB}, <br> → " · ", любые HTML-теги, &nbsp; */
    function strip(s) {
        return String(s == null ? '' : s)
            .replace(/\{[0-9A-Fa-f]{6}\}/g, '')
            .replace(/<br\s*\/?>/gi, ' · ')
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function parse(payload) {
        try { return typeof payload === 'string' ? JSON.parse(payload) : payload; }
        catch (e) { console.error('[ZKM-SN] payload не разобран:', e && e.message, payload); return null; }
    }

    /* Цвет-акцент → '#rrggbb' + hue/saturation */
    function normHex(hex) {
        var h = String(hex == null ? '' : hex).replace(/^#/, '');
        if (!/^[0-9a-fA-F]{1,6}$/.test(h)) return '#f9b701';
        while (h.length < 6) h = '0' + h;
        return '#' + h.toLowerCase();
    }
    function hsv(hex) {
        var h = hex.replace('#', '');
        var r = parseInt(h.substr(0, 2), 16) / 255,
            g = parseInt(h.substr(2, 2), 16) / 255,
            b = parseInt(h.substr(4, 2), 16) / 255;
        var mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, hue = 0;
        if (d > 0) {
            if (mx === r) hue = ((g - b) / d) % 6;
            else if (mx === g) hue = (b - r) / d + 2;
            else hue = (r - g) / d + 4;
            hue *= 60; if (hue < 0) hue += 360;
        }
        return { h: hue, s: mx === 0 ? 0 : d / mx, v: mx };
    }
    function toastType(hex) {
        var c = hsv(normHex(hex));
        if (c.s < 0.35 || c.v < 0.35) return T_INFO;        // серый / тёмный
        if (c.h < 14 || c.h >= 345) return T_FAILURE;        // красный
        if (c.h < 70) return T_WARNING;                      // оранжевый / золотой
        if (c.h < 170) return T_SUCCESS;                     // зелёный
        return T_INFO;                                       // голубой / синий / фиолетовый
    }

    /* Позиция из payload → [enum, [vw, vh]] для родного pushToast */
    function toastPos(code) {
        if (FORCE_LEFT || Number(code) === 1) return [P_CUSTOM, [TOAST_LEFT_VW, TOAST_LEFT_VH]];
        if (Number(code) === 2) return [P_BOTTOM_CENTER, [0, 0]];
        return [P_TOP_CENTER, [0, 0]];
    }

    function pushNative(text, type, ms, posCode) {
        ms = Number(ms) || 4000;
        if (typeof window.pushToast === 'function') {
            var p = toastPos(posCode);
            window.pushToast([false, text, type, ms, p[0], p[1]]);
            ownToastUntil = Math.max(ownToastUntil, Date.now() + ms);
            return true;
        }
        // Запасной путь для старого клиента без ToastNotifications: родной ScreenNotification (тот же формат payload)
        try {
            var sn = window.interface && window.interface('ScreenNotification');
            if (sn && typeof sn.add === 'function') {
                sn.add(JSON.stringify([1, '', text, '#f9b701', ms]));
                ownToastUntil = Math.max(ownToastUntil, Date.now() + ms);
                return true;
            }
        } catch (e) {}
        if (!warnedNoToast) { warnedNoToast = true; console.warn('[ZKM-SN] window.pushToast недоступен — уведомления не показываются'); }
        return false;
    }

    function clearOwnToasts() {
        if (Date.now() < ownToastUntil && typeof window.clearToasts === 'function') {
            try { window.clearToasts(); } catch (e) {}
            ownToastUntil = 0;
        }
    }

    function joinText(title, text) {
        title = strip(title); text = strip(text);
        return (title && text) ? (title + ' — ' + text) : (title || text);
    }

    /* ═══════════════ КАРТОЧКИ-ТАЙМЕРЫ (в стиле родного тоста) ═══════════════ */
    var timers = {};      // id → { el, iv, remaining, total, nodes... }
    var stackEl = null;

    function isMobile() { try { return !!(window.App && window.App.isMobile); } catch (e) { return false; } }
    function fs() { return isMobile() ? 2.41 : 1.3; }   // размер текста как у MainNotification (vh)

    function fmt(s) {
        if (s < 0) s = 0;
        if (typeof window.getTimeFormatSeconds === 'function') {
            try { return window.getTimeFormatSeconds(s, true); } catch (e) {}
        }
        var m = Math.floor(s / 60), ss = s % 60;
        return (m > 0 ? String(m) + ':' : '') + (ss < 10 ? '0' : '') + ss;
    }

    function ensureStack() {
        if (stackEl && stackEl.parentNode) return stackEl;
        stackEl = document.createElement('div');
        stackEl.style.cssText =
            'position:fixed;z-index:99999;pointer-events:none;' +
            'left:' + TOAST_LEFT_VW + 'vw;bottom:' + (100 - TOAST_LEFT_VH + 1.5) + 'vh;' +
            'transform:translateX(-50%);display:flex;flex-direction:column-reverse;align-items:center;gap:1vh;';
        document.body.appendChild(stackEl);
        return stackEl;
    }

    function accentOf(a) {
        var c = normHex(a), raw = c.replace('#', '');
        var lum = 0.2126 * parseInt(raw.substr(0, 2), 16) / 255 +
                  0.7152 * parseInt(raw.substr(2, 2), 16) / 255 +
                  0.0722 * parseInt(raw.substr(4, 2), 16) / 255;
        // слишком тёмные акценты (напр. чисто синий 0000FF) на тёмной карточке не видны — слегка осветляем
        if (lum < 0.15) {
            var out = '#';
            for (var i = 0; i < 3; i++) {
                var v = parseInt(raw.substr(i * 2, 2), 16);
                v = Math.min(255, Math.round(v + (255 - v) * 0.45));
                out += (v < 16 ? '0' : '') + v.toString(16);
            }
            return out;
        }
        return c;
    }

    function buildCard(title, label, accent) {
        var f = fs();
        var root = document.createElement('div');
        root.style.cssText =
            'box-sizing:border-box;min-width:' + (f * 17) + 'vh;max-width:' + (f * 31) + 'vh;' +
            'padding:' + (f * 0.85) + 'vh ' + (f * 1.14) + 'vh;border-radius:1.11vh;' +
            'background:linear-gradient(127deg,#292524 9.34%,#1c1917 149.66%);' +
            'box-shadow:0 0.09vh 0.74vh 0 #0c0a0666,0 0.09vh 0.09vh 0 #0c0a0699;' +
            'color:#eeeee6;font-family:"Hassle Open Sans","Open Sans",Arial,sans-serif;font-weight:700;' +
            'font-size:' + f + 'vh;line-height:1.35;opacity:0;transform:translateY(1vh);' +
            'transition:opacity .3s ease,transform .3s ease;';

        var head = document.createElement('div');
        head.style.cssText = 'display:flex;align-items:center;gap:' + (f * 0.45) + 'vh;';
        var dot = document.createElement('div');
        dot.style.cssText = 'flex-shrink:0;width:' + (f * 0.45) + 'vh;height:' + (f * 0.45) + 'vh;border-radius:50%;';
        var titleEl = document.createElement('div');
        titleEl.style.cssText = 'flex:1;min-width:0;overflow-wrap:break-word;';
        head.appendChild(dot); head.appendChild(titleEl);
        root.appendChild(head);

        var labelEl = document.createElement('div');
        labelEl.style.cssText = 'margin-top:' + (f * 0.3) + 'vh;opacity:.8;font-weight:600;overflow-wrap:break-word;';
        root.appendChild(labelEl);

        var foot = document.createElement('div');
        foot.style.cssText = 'display:flex;align-items:center;gap:' + (f * 0.5) + 'vh;margin-top:' + (f * 0.5) + 'vh;';
        var timeEl = document.createElement('div');
        timeEl.style.cssText = 'min-width:' + (f * 2.8) + 'vh;font-variant-numeric:tabular-nums;';
        var wrap = document.createElement('div');
        wrap.style.cssText = 'flex:1;height:' + (f * 0.26) + 'vh;border-radius:' + (f * 0.13) + 'vh;background:rgba(238,238,230,.12);overflow:hidden;';
        var fill = document.createElement('div');
        fill.style.cssText = 'height:100%;border-radius:' + (f * 0.13) + 'vh;transition:width 1s linear;';
        wrap.appendChild(fill);
        foot.appendChild(timeEl); foot.appendChild(wrap);
        root.appendChild(foot);

        var card = { el: root, dot: dot, titleEl: titleEl, labelEl: labelEl, timeEl: timeEl, fill: fill };
        paintCard(card, title, label, accent);
        return card;
    }

    function paintCard(card, title, label, accent) {
        var col = accentOf(accent);
        card.titleEl.textContent = title;
        card.titleEl.style.color = col;
        card.dot.style.background = col;
        card.dot.style.boxShadow = '0 0 0.8vh ' + col;
        card.fill.style.background = col;
        card.labelEl.textContent = label;
        card.labelEl.style.display = label ? 'block' : 'none';
    }

    function renderCard(t) {
        t.card.timeEl.textContent = fmt(t.remaining);
        var pct = t.total > 0 ? Math.max(0, Math.min(100, (t.remaining / t.total) * 100)) : 0;
        t.card.fill.style.width = pct + '%';
    }

    function startTick(id, t) {
        clearInterval(t.iv);
        t.iv = setInterval(function () {
            t.remaining--;
            renderCard(t);
            if (t.remaining <= 0) removeTimer(id);
        }, 1000);
    }

    function removeTimer(id) {
        var t = timers[id];
        if (!t) return;
        clearInterval(t.iv);
        delete timers[id];
        var el = t.card.el;
        el.style.opacity = '0';
        el.style.transform = 'translateY(1vh)';
        setTimeout(function () { try { el.remove(); } catch (e) {} }, 320);
    }

    /* ═══════════════ ОФФЕРЫ (подтверждение, Alt-логика снаружи) ═══════════════ */
    var offers = {};      // id → { t, onFinish }

    function finishOffer(id, result, silent) {
        var o = offers[id];
        if (!o) return;
        clearTimeout(o.t);
        delete offers[id];
        if (CLEAR_ON_OFFER_END) clearOwnToasts();
        if (!silent && typeof o.onFinish === 'function') {
            try { o.onFinish(id, result); } catch (e) { console.error('[ZKM-SN] onFinish:', e); }
        }
    }

    /* ═══════════════════════════ ПУБЛИЧНЫЙ API ═══════════════════════════ */
    var ZkmSN = {
        /* [position, title, text, accent, durationMs] */
        add: function (payload) {
            try {
                var d = parse(payload); if (!d) return;
                var text = joinText(d[1], d[2]);
                if (!text) return;
                pushNative(text, toastType(d[3]), Number(d[4]) || 3000, d[0]);
            } catch (e) { console.error('[ZKM-SN] add:', e); }
        },

        hideAll: function () {
            if (HIDE_ALL_CLEARS) clearOwnToasts();
        },

        /* [position, title, label, accent, seconds, totalSeconds?] → id */
        addTimer: function (payload) {
            try {
                var d = parse(payload); if (!d) return;
                var title  = strip(d[1]), label = strip(d[2]);
                var secs   = Number(d[4]) || 60;
                var total  = Number(d[5]) || secs;
                var id     = ++last;
                var card   = buildCard(title, label, d[3]);
                var t      = { card: card, remaining: secs, total: total, iv: null };
                timers[id] = t;
                renderCard(t);
                ensureStack().appendChild(card.el);
                var show = function () { card.el.style.opacity = '1'; card.el.style.transform = 'translateY(0)'; };
                if (typeof requestAnimationFrame === 'function') requestAnimationFrame(function () { requestAnimationFrame(show); });
                else setTimeout(show, 16);
                startTick(id, t);
                return id;
            } catch (e) { console.error('[ZKM-SN] addTimer:', e); }
        },

        /* Обновить уже висящий таймер без пересоздания. null — такого таймера нет (вызывающий создаст новый). */
        updateTimer: function (id, payload) {
            var t = timers[id];
            if (!t) return null;
            try {
                var d = parse(payload); if (!d) return null;
                var secs  = Number(d[4]) || 60;
                var total = Number(d[5]) || t.total || secs;
                paintCard(t.card, strip(d[1]), strip(d[2]), d[3]);
                t.remaining = secs;
                t.total = total;
                renderCard(t);
                startTick(id, t);
                return id;
            } catch (e) { console.error('[ZKM-SN] updateTimer:', e); return null; }
        },

        hideTimer: function (id) { removeTimer(id); },

        hideAllTimers: function () { Object.keys(timers).forEach(removeTimer); },

        /* [position, title, noLabel, yesLabel, accent, seconds] — выбор «Да/Нет» (в АХК не используется) */
        addChoice: function (payload, onFinish) {
            try {
                var d = parse(payload); if (!d) return;
                var secs = Number(d[5]) || 7;
                var no = strip(d[2]) || 'Нет', yes = strip(d[3]) || 'Да';
                return ZkmSN.addOfferChoice(JSON.stringify([d[1], no + ' / ' + yes, secs]), onFinish);
            } catch (e) { console.error('[ZKM-SN] addChoice:', e); }
        },

        /* ["title", "text", seconds, noBtnText?, yesBtnText?] → id.
           onFinish(id, 'yes'|'no'|'expire'). Тост показывает подсказку, решение приходит снаружи
           (resolveOfferChoice) или по таймауту. */
        addOfferChoice: function (payload, onFinish) {
            try {
                var d = parse(payload); if (!d) return;
                var secs = Number(d[2]) || 10;
                var id = ++last;
                pushNative(joinText(d[0], d[1]), T_INFO, secs * 1000, 1);
                offers[id] = {
                    onFinish: onFinish,
                    t: setTimeout(function () { finishOffer(id, 'expire'); }, secs * 1000)
                };
                return id;
            } catch (e) { console.error('[ZKM-SN] addOfferChoice:', e); }
        },

        /* Подсветки кнопок в тосте нет — оставлено для совместимости с вызовами из АХК */
        highlightOfferChoice: function () {},

        /* Закрыть как будто выбрали «Да»/«Нет» */
        resolveOfferChoice: function (id, which) {
            finishOffer(id, which === 'yes' ? 'yes' : 'no', false);
        },

        /* Закрыть молча — БЕЗ onFinish */
        hideOfferChoice: function (id) { finishOffer(id, 'no', true); },

        hideAllOffers: function () {
            Object.keys(offers).forEach(function (k) { finishOffer(Number(k), 'expire', false); });
        }
    };

    window.ZkmScreenNotification = ZkmSN;
    console.log('[ZKM-SN] v6.0 готов (родные тосты игры: window.pushToast)');
})();
