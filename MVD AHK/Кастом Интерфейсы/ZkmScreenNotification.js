// ZKM Screen Notification — v4.0 "Glass"
// Glassmorphism · 6-сегментный lightbar сверху · каскадная мигалка
;(function () {
    'use strict';

    if (window._zkmSNLoaded) return;
    window._zkmSNLoaded = true;

    /* Убираем мусор-теги цвета {RRGGBB} из строки */
    function strip(s) {
        return String(s || '').replace(/\{[0-9A-Fa-f]{6}\}/g, '').trim();
    }

    /* Нормализует hex-акцент к набору цветов (как в v3) */
    function resolveAccent(hex) {
        if (!hex) return '#f9b701';
        var h = String(hex).replace(/^#/, '').padStart(6, '0');
        var r = parseInt(h.slice(0, 2), 16),
            g = parseInt(h.slice(2, 4), 16),
            b = parseInt(h.slice(4, 6), 16);
        if (r > 160 && r >= g * 1.5 && r >= b * 1.5) return '#e25544'; // красный → сирена
        if (g > 160 && g >= r * 1.5 && g >= b * 1.5) return '#0a9947'; // зелёный
        if (b > 160 && b >= r * 2   && b >= g * 1.5) return '#2d7dd2'; // синий
        if (r > 180 && g > 120      && b < 60)        return '#f9b701'; // золото
        if (r > 170 && g > 170      && b > 170)       return '#c8cad4'; // серый
        return '#' + h;
    }

    var POS   = { 0: 'top', 1: 'left', 2: 'bottom' };
    var last  = 0;
    var queue = new Map();

    /* Убирает уведомление с анимацией leave */
    function removeSN(id) {
        var item = queue.get(id);
        if (!item) return;
        clearTimeout(item.t);
        queue.delete(id);
        item.el.classList.add('zkm-sn--leave');
        setTimeout(function () {
            try { item.el.remove(); } catch (_) {}
        }, 340);
    }

    var ZkmSN = {
        add: function (payload) {
            try {
                var d      = JSON.parse(payload);
                var pos    = POS[d[0]] || 'top';
                var title  = strip(d[1]);
                var text   = strip(d[2]);
                var accent = resolveAccent(d[3]);
                var dur    = Number(d[4]) || 3000;
                var id     = ++last;

                var isSiren = (accent === '#e25544');

                /* ── Lightbar ──────────────────────────────────────
                   Сирена → 6 прямоугольных сегментов (s1–s3 красные,
                   s4–s6 синие), каскадная анимация из CSS.
                   Обычное → один залитый блок с акцентным цветом.
                ─────────────────────────────────────────────────── */
                var barHtml = isSiren
                    ? '<div class="zkm-sn__lb-s1"></div>' +
                      '<div class="zkm-sn__lb-s2"></div>' +
                      '<div class="zkm-sn__lb-s3"></div>' +
                      '<div class="zkm-sn__lb-s4"></div>' +
                      '<div class="zkm-sn__lb-s5"></div>' +
                      '<div class="zkm-sn__lb-s6"></div>'
                    : '<div class="zkm-sn__lb-fill" style="background:' + accent + '"></div>';

                /* ── Строки текста (поддержка <br>) ─────────────── */
                var lineHtml = text.split(/<br\s*\/?>/i).map(function (l) {
                    return '<span class="zkm-sn__text-line">' + (l || '&zwj;') + '</span>';
                }).join('');

                /* ── Элемент ─────────────────────────────────────── */
                var el = document.createElement('div');
                el.className = 'zkm-sn zkm-sn--' + pos + ' zkm-sn--enter'
                             + (isSiren ? ' zkm-sn--siren' : '');

                el.innerHTML =
                    '<div class="zkm-sn__lightbar">' +
                        barHtml +
                    '</div>' +
                    '<div class="zkm-sn__body">' +
                        '<div class="zkm-sn__header">' +
                            '<div class="zkm-sn__dot" style="background:' + accent + '"></div>' +
                            '<div class="zkm-sn__title" style="color:' + accent + '">' +
                                title +
                            '</div>' +
                        '</div>' +
                        '<div class="zkm-sn__text">' + lineHtml + '</div>' +
                    '</div>';

                document.body.appendChild(el);

                /* Двойной rAF: гарантирует enter-кадр до transition */
                requestAnimationFrame(function () {
                    requestAnimationFrame(function () {
                        el.classList.remove('zkm-sn--enter');
                    });
                });

                queue.set(id, {
                    el: el,
                    t:  setTimeout(function () { removeSN(id); }, dur)
                });

            } catch (e) {
                console.error('[ZKM-SN] add:', e);
            }
        },

        hideAll: function () {
            Array.from(queue.keys()).forEach(removeSN);
        }
    };

    /* ── Подключение к App.$refs или window.interface ─────────── */
    function patch() {
        if (window.App && window.App.$refs) {
            try {
                Object.defineProperty(window.App.$refs, 'ScreenNotification', {
                    get: function () { return ZkmSN; },
                    configurable: true,
                    enumerable:   true
                });
                console.log('[ZKM-SN] v4.0 готов');
                return;
            } catch (_) {}
        }
        if (typeof window.interface === 'function') {
            var _orig = window.interface;
            window.interface = function (name) {
                if (name === 'ScreenNotification') return ZkmSN;
                return _orig.apply(this, arguments);
            };
            console.log('[ZKM-SN] v4.0 готов (hook)');
            return;
        }
        setTimeout(patch, 100);
    }
    patch();

})();
