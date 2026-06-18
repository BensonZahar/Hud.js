// ZKM Screen Notification — v3.0
// Стиль: Laws Helper / Modal (zkm.css)
// Мигалки: автоматически для красных уведомлений (розыск/отслеживание)
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
        if (r > 160 && r >= g * 1.5 && r >= b * 1.5) return '#e25544'; // красный → сирена
        if (g > 160 && g >= r * 1.5 && g >= b * 1.5) return '#0a9947'; // зелёный
        if (b > 160 && b >= r * 2   && b >= g * 1.5) return '#2d7dd2'; // синий
        if (r > 180 && g > 120      && b < 60)        return '#f9b701'; // жёлтый/золото
        if (r > 170 && g > 170      && b > 170)       return '#f4f1e166'; // серый
        return '#' + h;
    }

    var ACCENT_RGB = {
        '#e25544':   '226,85,68',
        '#0a9947':   '10,153,71',
        '#2d7dd2':   '45,125,210',
        '#f9b701':   '249,183,1',
        '#f4f1e166': '244,241,225'
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
                var title  = strip(d[1]);
                var text   = strip(d[2]);
                var accent = resolveAccent(d[3]);
                var rgb    = ACCENT_RGB[accent] || '249,183,1';
                var dur    = Number(d[4]) || 3000;
                var id     = ++last;

                var isSiren = (accent === '#e25544');

                // ── Внешняя обёртка ──────────────────────────────────
                var el = document.createElement('div');
                el.className = 'zkm-sn zkm-sn--' + pos + ' zkm-sn--enter'
                             + (isSiren ? ' zkm-sn--siren' : '');

                // ── Внутренний контейнер (laws-helper__inner style) ──
                // Для сирены border-top анимируется через CSS, не ставим инлайн
                var innerStyle =
                    'border-radius:.7vh;overflow:hidden;position:relative;padding:.93vh 1.11vh 1.11vh;' +
                    'border:.19vh solid #fff0;' +
                    (isSiren
                        ? 'border-top:.19vh solid #e25544;' +
                          'box-shadow:inset 0 3.89vh 4.81vh -2.96vh rgba(226,85,68,.22);'
                        : 'border-top:.19vh solid ' + accent + ';' +
                          'box-shadow:inset 0 3.89vh 4.81vh -2.96vh rgba(' + rgb + ',.22);'
                    );

                // ── Строки текста ────────────────────────────────────
                var lineHtml = text.split(/<br\s*\/?>/i).map(function (l) {
                    return '<span class="zkm-sn__text-line">' + (l || '&zwj;') + '</span>';
                }).join('');

                el.innerHTML =
                    '<div class="zkm-sn__inner" style="' + innerStyle + '">' +
                        '<div class="zkm-sn__shimmer"></div>' +
                        '<div class="zkm-sn__header">' +
                            '<div class="zkm-sn__title" style="color:' + accent + '">' +
                                title +
                            '</div>' +
                            '<div class="zkm-sn__siren-lights">' +
                                '<div class="zkm-sn__siren-r"></div>' +
                                '<div class="zkm-sn__siren-b"></div>' +
                            '</div>' +
                        '</div>' +
                        '<div class="zkm-sn__text">' + lineHtml + '</div>' +
                    '</div>';

                document.body.appendChild(el);

                // Двойной rAF: гарантирует enter-кадр до transition
                requestAnimationFrame(function () {
                    requestAnimationFrame(function () {
                        el.classList.remove('zkm-sn--enter');
                    });
                });

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

    // ── Подключение ──────────────────────────────────────────────
    function patch() {
        if (window.App && window.App.$refs) {
            try {
                Object.defineProperty(window.App.$refs, 'ScreenNotification', {
                    get: function () { return ZkmSN; },
                    configurable: true,
                    enumerable:   true
                });
                console.log('[ZKM-SN] v3.0 готов');
                return;
            } catch (_) {}
        }
        if (typeof window.interface === 'function') {
            var _orig = window.interface;
            window.interface = function (name) {
                if (name === 'ScreenNotification') return ZkmSN;
                return _orig.apply(this, arguments);
            };
            console.log('[ZKM-SN] v3.0 готов (hook)');
            return;
        }
        setTimeout(patch, 100);
    }
    patch();

})();
