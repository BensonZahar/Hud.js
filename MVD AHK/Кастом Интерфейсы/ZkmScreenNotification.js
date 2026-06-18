// ═══════════════════════════════════════════════════════════════════
//  ZKM Screen Notification — v2.0
//  Грузится через _duranCustomInterfaces (startup:true) в IntLoad.js.
//  CSS подключается отдельно: ZkmScreenNotification.css
// ═══════════════════════════════════════════════════════════════════
;(function () {
    'use strict';

    if (window._zkmSNLoaded) return;
    window._zkmSNLoaded = true;

    function strip(s) {
        return String(s || '').replace(/\{[0-9A-Fa-f]{6}\}/g, '').trim();
    }

    function resolveAccent(hex) {
        if (!hex) return '#f9b701';
        var h = String(hex).replace(/^#/, '').padStart(6, '0');
        var r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
        if (r > 160 && r >= g*1.5 && r >= b*1.5) return '#e25544';
        if (g > 160 && g >= r*1.5 && g >= b*1.5) return '#0a9947';
        if (b > 160 && b >= r*2   && b >= g*1.5) return '#2d7dd2';
        if (r > 180 && g > 120   && b < 60)      return '#f9b701';
        if (r > 170 && g > 170   && b > 170)     return '#f4f1e166';
        return '#' + h;
    }

    var ACCENT_RGB = {
        '#e25544':'226,85,68',  '#0a9947':'10,153,71',
        '#2d7dd2':'45,125,210', '#f9b701':'249,183,1', '#f4f1e166':'244,241,225'
    };
    var POS   = { 0:'top', 1:'left', 2:'bottom' };
    var last  = 0;
    var queue = new Map();

    function removeSN(id) {
        var item = queue.get(id); if (!item) return;
        clearTimeout(item.t); queue.delete(id);
        item.el.classList.add('zkm-sn--leave');
        setTimeout(function () { try { item.el.remove(); } catch (_) {} }, 380);
    }

    var ZkmSN = {
        add: function (payload) {
            try {
                var d      = JSON.parse(payload);
                var pos    = POS[d[0]] || 'top';
                var accent = resolveAccent(d[3]);
                var rgb    = ACCENT_RGB[accent] || '249,183,1';
                var dur    = Number(d[4]) || 3000;
                var id     = ++last;

                var el = document.createElement('div');
                el.className = 'zkm-sn zkm-sn--' + pos + ' zkm-sn--enter';
                el.style.borderTop = '.19vh solid ' + accent;
                el.style.boxShadow =
                    'inset 0 3.89vh 4.81vh -2.96vh rgba(' + rgb + ',.18),' +
                    '0 .28vh 1.48vh 0 #00000055';

                el.innerHTML =
                    '<div class="zkm-sn__shimmer"></div>' +
                    '<div class="zkm-sn__header">' +
                        '<div class="zkm-sn__bar" style="background:' + accent + '"></div>' +
                        '<div class="zkm-sn__title" style="color:' + accent + '">' +
                            strip(d[1]) +
                        '</div>' +
                    '</div>' +
                    '<div class="zkm-sn__text">' +
                        strip(d[2]).split(/<br\s*\/?>/i).map(function (l) {
                            return '<span class="zkm-sn__text-line">' + (l || '&zwj;') + '</span>';
                        }).join('') +
                    '</div>';

                document.body.appendChild(el);
                setTimeout(function () { el.classList.remove('zkm-sn--enter'); }, 20);
                queue.set(id, {
                    el: el,
                    t:  setTimeout(function () { removeSN(id); }, dur)
                });
            } catch (e) { console.error('[ZKM-SN] add:', e); }
        },
        hideAll: function () {
            Array.from(queue.keys()).forEach(removeSN);
        }
    };

    function patch() {
        var hooked = false;

        // Основной способ: хук window.interface — именно так ScreenNotification
        // вызывается из mvdN.js (window.interface('ScreenNotification').add(...)).
        if (typeof window.interface === 'function' && !window.interface.__zkmSNHooked) {
            var _orig = window.interface;
            var hookFn = function (name) {
                if (name === 'ScreenNotification') return ZkmSN;
                return _orig.apply(this, arguments);
            };
            hookFn.__zkmSNHooked = true;
            window.interface = hookFn;
            hooked = true;
            console.log('[ZKM-SN] v2.0 готов (hook window.interface)');
        }

        // Бонус: если что-то обращается напрямую к $refs.ScreenNotification —
        // подкладываем туда же. Не критично, поэтому в try/catch и не мешает хуку.
        if (window.App && window.App.$refs) {
            try {
                Object.defineProperty(window.App.$refs, 'ScreenNotification', {
                    get: function () { return ZkmSN; },
                    set: function () {}, // глушим переприсвоение Vue, чтобы не падало в strict-режиме
                    configurable: true,
                    enumerable:   true
                });
                console.log('[ZKM-SN] $refs.ScreenNotification также подменён');
            } catch (_) {}
        }

        if (!hooked) setTimeout(patch, 100);
    }
    patch();

})();
