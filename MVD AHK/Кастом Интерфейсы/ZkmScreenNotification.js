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

    var POS        = { 0: 'top', 1: 'left', 2: 'bottom' };
    var last       = 0;
    var queue      = new Map();   // обычные уведомления
    var timerQueue = new Map();   // таймер-уведомления (не убиваются hideAll)

    /* Убирает обычное уведомление с анимацией leave */
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

    /* Убирает таймер-уведомление с анимацией leave */
    function removeTimer(id) {
        var item = timerQueue.get(id);
        if (!item) return;
        clearInterval(item.iv);
        timerQueue.delete(id);
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
            /* Убивает только обычные уведомления; таймеры (timerQueue) не трогаем */
            Array.from(queue.keys()).forEach(removeSN);
        },

        /* ── Таймер-уведомление ────────────────────────────────────────
           Payload: JSON-массив [position, title, label, accent, seconds]
           Пример: '[2, "ШТРАФ КД", "К/Д Выдача штрафа", "f9b701", 300]'
           Отличие от add(): не убивается hideAll(), живёт до конца таймера.
           Возвращает id (число) для ручной отмены через hideTimer(id).
        ─────────────────────────────────────────────────────────────── */
        addTimer: function (payload) {
            try {
                var d      = JSON.parse(payload);
                var pos    = POS[d[0]] || 'bottom';
                var title  = strip(d[1]);
                var label  = strip(d[2]);
                var accent = resolveAccent(d[3]);
                var secs   = Number(d[4]) || 60;
                var id     = ++last;

                var remaining = secs;

                var barHtml = '<div class="zkm-sn__lb-fill" style="background:' + accent + '"></div>';

                /* Inline SVG часы — не зависит от внешних шрифтов / иконок */
                var clockSvg =
                    '<svg class="zkm-sn__timer-icon" viewBox="0 0 16 16" fill="none" ' +
                        'xmlns="http://www.w3.org/2000/svg">' +
                        '<circle cx="8" cy="8.5" r="5.5" stroke="currentColor" stroke-width="1.3"/>' +
                        '<path d="M8 5.5V8.5l2 1.5" stroke="currentColor" ' +
                            'stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>' +
                        '<path d="M8 2v1" stroke="currentColor" ' +
                            'stroke-width="1.2" stroke-linecap="round"/>' +
                    '</svg>';

                function fmt(s) {
                    if (typeof window.getTimeFormatSeconds === 'function') {
                        return window.getTimeFormatSeconds(s, true);
                    }
                    var m  = Math.floor(s / 60);
                    var ss = s % 60;
                    return (m > 0 ? String(m) + ':' : '') +
                           (ss < 10 ? '0' : '') + ss;
                }

                var el = document.createElement('div');
                el.className = 'zkm-sn zkm-sn--' + pos +
                               ' zkm-sn--enter zkm-sn--timer-notif';

                el.innerHTML =
                    '<div class="zkm-sn__lightbar">' + barHtml + '</div>' +
                    '<div class="zkm-sn__body">' +
                        '<div class="zkm-sn__header">' +
                            '<div class="zkm-sn__dot" style="background:' + accent + '"></div>' +
                            '<div class="zkm-sn__title" style="color:' + accent + '">' +
                                title +
                            '</div>' +
                        '</div>' +
                        (label
                            ? '<div class="zkm-sn__text">' +
                              '<span class="zkm-sn__text-line">' + label + '</span>' +
                              '</div>'
                            : '') +
                        '<div class="zkm-sn__timer-row">' +
                            clockSvg +
                            '<div class="zkm-sn__timer-time"></div>' +
                            '<div class="zkm-sn__timer-bar-wrap">' +
                                '<div class="zkm-sn__timer-bar-fill" ' +
                                     'style="width:100%;background:' + accent + '"></div>' +
                            '</div>' +
                        '</div>' +
                    '</div>';

                document.body.appendChild(el);

                /* Ссылки на DOM-элементы (живут пока el в DOM) */
                var timeEl = el.querySelector('.zkm-sn__timer-time');
                var fillEl = el.querySelector('.zkm-sn__timer-bar-fill');
                if (timeEl) timeEl.textContent = fmt(remaining);

                requestAnimationFrame(function () {
                    requestAnimationFrame(function () {
                        el.classList.remove('zkm-sn--enter');
                    });
                });

                var iv = setInterval(function () {
                    remaining--;
                    if (timeEl) timeEl.textContent = fmt(remaining);
                    if (fillEl) fillEl.style.width =
                        Math.max(0, (remaining / secs) * 100) + '%';
                    if (remaining <= 0) {
                        clearInterval(iv);
                        removeTimer(id);
                    }
                }, 1000);

                timerQueue.set(id, { el: el, iv: iv });
                return id;

            } catch (e) {
                console.error('[ZKM-SN] addTimer:', e);
            }
        },

        /* Принудительно убрать таймер-уведомление по id */
        hideTimer: function (id) {
            removeTimer(id);
        },

        /* Убрать все таймер-уведомления */
        hideAllTimers: function () {
            Array.from(timerQueue.keys()).forEach(removeTimer);
        }
    };

    /* ── Регистрация как ОТДЕЛЬНЫЙ namespace ──────────────────────
       ВАЖНО: раньше здесь подменялся ГЛОБАЛЬНЫЙ родной интерфейс
       'ScreenNotification' (через App.$refs или window.interface),
       из-за чего ВСЕ уведомления игры (не только МВД) уходили через
       наш кастомный glass-стиль — родные уведомления пропадали или
       рисовались неправильно.

       Теперь ZKM-уведомление НЕ трогает родной 'ScreenNotification' —
       он продолжает работать как обычно для всей остальной игры.
       МВД-код обращается к кастомному UI явно, через отдельный
       глобальный объект window.ZkmScreenNotification.
    ─────────────────────────────────────────────────────────────── */
    window.ZkmScreenNotification = ZkmSN;
    console.log('[ZKM-SN] v4.1 готов (изолированный namespace, родной ScreenNotification не тронут)');

})();
