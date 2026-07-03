// ZKM Screen Notification — v5.1 "App Match"
// Редизайн под визуальный язык zkm.js / laws-helper: #141419 фон,
// #f4f1e1 текст, золотой акцент, светящаяся градиентная полоса
// сверху вместо плоской рамки.
//
// ВАЖНО: цвет акцента задаётся ТОЛЬКО через инлайн-стили (не через
// CSS custom properties/var()) — в этом CEF-движке кастомные CSS-
// переменные, выставленные из JS через style.setProperty, ведут себя
// ненадёжно (title проваливался в чёрный, border-top не рисовался
// вовсе). Сам zkm.css тоже нигде не использует var(--свой-токен) —
// только один системный var(--fallback-font), который прокидывает
// сам движок. Поэтому весь акцент — обычные инлайн style="".
;(function () {
    'use strict';

    if (window._zkmSNLoaded) return;
    window._zkmSNLoaded = true;

    /* Убираем мусор-теги цвета {RRGGBB} из строки */
    function strip(s) {
        return String(s || '').replace(/\{[0-9A-Fa-f]{6}\}/g, '').trim();
    }

    /* Мягкая замена текста в узле: если текст реально другой — короткий
       opacity-кроссфейд (120мс из/120мс в), а не мгновенная жёсткая
       подмена. Если текст совпадает — вообще не трогаем узел (не будет
       ни мигания, ни лишнего reflow). Используется в updateTimer(), где
       узел уже на экране и его "дёрганое" обновление особенно заметно. */
    function swapText(el, newText) {
        if (!el) return;
        newText = newText || '';
        if (el.textContent === newText) return;
        el.style.transition = 'opacity .12s ease';
        el.style.opacity = '0';
        setTimeout(function () {
            el.textContent = newText;
            el.style.opacity = '1';
        }, 120);
    }

    /* Нормализует hex-акцент к палитре приложения (см. zkm.css) */
    function resolveAccent(hex) {
        if (!hex) return '#f9b701';
        var h = String(hex).replace(/^#/, '').padStart(6, '0');
        var r = parseInt(h.slice(0, 2), 16),
            g = parseInt(h.slice(2, 4), 16),
            b = parseInt(h.slice(4, 6), 16);
        if (r > 160 && r >= g * 1.5 && r >= b * 1.5) return '#e25544'; // красный → сирена
        if (g > 160 && g >= r * 1.5 && g >= b * 1.5) return '#0a9947'; // зелёный (как fine/yes в приложении)
        if (b > 160 && b >= r * 2   && b >= g * 1.5) return '#6495ed'; // синий (как "Проц." таб в zkm.js)
        if (r > 180 && g > 120      && b < 60)        return '#f9b701'; // золото (основной акцент приложения)
        if (r > 170 && g > 170      && b > 170)       return '#c8cad4'; // серый/нейтральный
        return '#' + h;
    }

    /* hex → "r, g, b" строка для сборки rgba(...) на лету */
    function hexToRgbStr(hex) {
        var h = String(hex).replace('#', '');
        var r = parseInt(h.substr(0, 2), 16) || 0,
            g = parseInt(h.substr(2, 2), 16) || 0,
            b = parseInt(h.substr(4, 2), 16) || 0;
        return r + ', ' + g + ', ' + b;
    }

    /* Готовый набор инлайн-стилей под конкретный акцент — считаем один
       раз на уведомление и подставляем во все нужные узлы */
    function accentKit(accent) {
        var rgb = hexToRgbStr(accent);
        return {
            accent: accent,
            rgb: rgb,
            /* Светящаяся градиентная полоса сверху (замена плоскому border-top) */
            lineStyle:
                'background:linear-gradient(90deg, transparent, ' + accent + ' 18%, ' + accent + ' 82%, transparent);' +
                'box-shadow:0 0 1.3vh 0.06vh rgba(' + rgb + ', 0.85);',
            /* Мягкое цветное свечение внутри карточки под полосой */
            panelGlow: 'inset 0 3.2vh 4vh -2.7vh rgba(' + rgb + ', 0.28)',
            dotStyle: 'background:' + accent + ';box-shadow:0 0 0.85vh rgba(' + rgb + ', 0.8);',
            titleStyle: 'color:' + accent + ';',
            fillStyle: 'background:' + accent + ';'
        };
    }

    var BASE_SHADOW =
        '0 1.6vh 3.9vh rgba(0, 0, 0, 0.52), ' +
        '0 0.5vh 1.3vh rgba(0, 0, 0, 0.3), ';

    var POS        = { 0: 'top', 1: 'left', 2: 'bottom' };
    var last       = 0;
    var queue      = new Map();   // обычные уведомления
    var timerQueue = new Map();   // таймер-уведомления (не убиваются hideAll)

    function removeSN(id) {
        var item = queue.get(id);
        if (!item) return;
        clearTimeout(item.t);
        queue.delete(id);
        item.el.classList.add('zkm-sn--leave');
        setTimeout(function () {
            try { item.el.remove(); } catch (_) {}
        }, 260);
    }

    function removeTimer(id) {
        var item = timerQueue.get(id);
        if (!item) return;
        clearInterval(item.iv);
        timerQueue.delete(id);
        item.el.classList.add('zkm-sn--leave');
        setTimeout(function () {
            try { item.el.remove(); } catch (_) {}
        }, 260);
    }

    var CLOCK_SVG =
        '<svg class="zkm-sn__timer-icon" viewBox="0 0 16 16" fill="none" ' +
            'xmlns="http://www.w3.org/2000/svg">' +
            '<circle cx="8" cy="8.5" r="5.4" stroke="currentColor" stroke-width="1.2"/>' +
            '<path d="M8 5.6V8.5l2 1.4" stroke="currentColor" ' +
                'stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round"/>' +
            '<path d="M8 2.1v1" stroke="currentColor" stroke-width="1.15" stroke-linecap="round"/>' +
        '</svg>';

    /* Иконки да/нет для addChoice — вместо текстовых плашек "ALT ×1/×2" */
    var CROSS_SVG =
        '<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '<path d="M4.2 4.2L11.8 11.8M11.8 4.2L4.2 11.8" stroke="currentColor" ' +
                'stroke-width="1.6" stroke-linecap="round"/>' +
        '</svg>';

    var CHECK_SVG =
        '<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '<path d="M3.6 8.6L6.6 11.6L12.4 4.8" stroke="currentColor" ' +
                'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>' +
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
                var kit    = accentKit(accent);

                var isSiren = (accent === '#e25544');

                /* ── Верхний акцент ────────────────────────────────────
                   Обычное уведомление: тонкая светящаяся градиентная
                   полоса (совр. "glow line" приём).
                   Сирена: полноценный каскадный lightbar 6 сегментов —
                   единственный случай, где это оправдано.
                ─────────────────────────────────────────────────── */
                var barHtml = isSiren
                    ? '<div class="zkm-sn__lightbar">' +
                          '<div class="zkm-sn__lb-s1"></div>' +
                          '<div class="zkm-sn__lb-s2"></div>' +
                          '<div class="zkm-sn__lb-s3"></div>' +
                          '<div class="zkm-sn__lb-s4"></div>' +
                          '<div class="zkm-sn__lb-s5"></div>' +
                          '<div class="zkm-sn__lb-s6"></div>' +
                      '</div>'
                    : '<div class="zkm-sn__accent-line" style="' + kit.lineStyle + '"></div>';

                var lineHtml = text.split(/<br\s*\/?>/i).map(function (l) {
                    return '<span class="zkm-sn__text-line">' + (l || '&zwj;') + '</span>';
                }).join('');

                var el = document.createElement('div');
                el.className = 'zkm-sn zkm-sn--' + pos + ' zkm-sn--enter'
                             + (isSiren ? ' zkm-sn--siren' : '');
                el.style.boxShadow = isSiren ? '' : (BASE_SHADOW + kit.panelGlow);

                el.innerHTML =
                    barHtml +
                    '<div class="zkm-sn__body">' +
                        '<div class="zkm-sn__header">' +
                            '<div class="zkm-sn__dot" style="' + kit.dotStyle + '"></div>' +
                            '<div class="zkm-sn__title" style="' + kit.titleStyle + '">' + title + '</div>' +
                        '</div>' +
                        '<div class="zkm-sn__text">' + lineHtml + '</div>' +
                    '</div>';

                document.body.appendChild(el);

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
        },

        /* ── Таймер-уведомление ────────────────────────────────────────
           Payload: [position, title, label, accent, seconds, totalSeconds?]
           totalSeconds — необязательный 6-й элемент: полная длительность
           цикла (напр. интервал /setmark = 31с), по которой считается
           заполнение прогресс-бара. Если не передан — используется сам
           seconds (старое поведение, полностью обратно совместимо).
           Нужен для updateTimer(): когда снаружи периодически освежают
           один и тот же таймер новым "остатком" от общего цикла, бар
           должен ПРОДОЛЖАТЬ движение от текущей точки, а не прыгать на
           100% и снова считать вниз.
        ─────────────────────────────────────────────────────────────── */
        addTimer: function (payload) {
            try {
                var d      = JSON.parse(payload);
                var pos    = POS[d[0]] || 'bottom';
                var title  = strip(d[1]);
                var label  = strip(d[2]);
                var accent = resolveAccent(d[3]);
                var secs   = Number(d[4]) || 60;
                var total  = Number(d[5]) || secs;
                var id     = ++last;
                var kit    = accentKit(accent);

                var remaining  = secs;
                var startWidth = Math.max(0, Math.min(100, (remaining / total) * 100));

                var el = document.createElement('div');
                el.className = 'zkm-sn zkm-sn--' + pos +
                               ' zkm-sn--enter zkm-sn--timer-notif';
                el.style.boxShadow = BASE_SHADOW + kit.panelGlow;

                el.innerHTML =
                    '<div class="zkm-sn__accent-line" style="' + kit.lineStyle + '"></div>' +
                    '<div class="zkm-sn__body">' +
                        '<div class="zkm-sn__header">' +
                            '<div class="zkm-sn__dot" style="' + kit.dotStyle + '"></div>' +
                            '<div class="zkm-sn__title" style="' + kit.titleStyle + '">' + title + '</div>' +
                        '</div>' +
                        (label
                            ? '<div class="zkm-sn__text">' +
                              '<span class="zkm-sn__text-line">' + label + '</span>' +
                              '</div>'
                            : '') +
                        '<div class="zkm-sn__timer-row">' +
                            CLOCK_SVG +
                            '<div class="zkm-sn__timer-time"></div>' +
                            '<div class="zkm-sn__timer-bar-wrap">' +
                                '<div class="zkm-sn__timer-bar-fill" style="width:' + startWidth + '%;' + kit.fillStyle + '"></div>' +
                            '</div>' +
                        '</div>' +
                    '</div>';

                document.body.appendChild(el);

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
                        Math.max(0, (remaining / total) * 100) + '%';
                    if (remaining <= 0) {
                        clearInterval(iv);
                        removeTimer(id);
                    }
                }, 1000);

                timerQueue.set(id, { el: el, iv: iv, total: total });
                return id;

            } catch (e) {
                console.error('[ZKM-SN] addTimer:', e);
            }
        },

        /* ── Уведомление-выбор ──────────────────────────────────────────
           Payload: [position, title, noLabel, yesLabel, accent, seconds]
        ─────────────────────────────────────────────────────────────── */
        addChoice: function (payload, onFinish) {
            try {
                var d       = JSON.parse(payload);
                var pos     = POS[d[0]] || 'bottom';
                var title   = strip(d[1]);
                var noLabel = strip(d[2]) || 'Нет';
                var yesLabel= strip(d[3]) || 'Да';
                var accent  = resolveAccent(d[4]);
                var secs    = Number(d[5]) || 7;
                var id      = ++last;
                var kit     = accentKit(accent);

                var remaining = secs;

                var el = document.createElement('div');
                el.className = 'zkm-sn zkm-sn--' + pos +
                               ' zkm-sn--enter zkm-sn--choice';
                el.style.boxShadow = BASE_SHADOW + kit.panelGlow;

                el.innerHTML =
                    '<div class="zkm-sn__accent-line" style="' + kit.lineStyle + '"></div>' +
                    '<div class="zkm-sn__body">' +
                        '<div class="zkm-sn__header">' +
                            '<div class="zkm-sn__dot" style="' + kit.dotStyle + '"></div>' +
                            '<div class="zkm-sn__title" style="' + kit.titleStyle + '">' + title + '</div>' +
                        '</div>' +
                        '<div class="zkm-sn__choice-row">' +
                            '<div class="zkm-sn__choice-opt zkm-sn__choice-opt--no">' +
                                '<div class="zkm-sn__choice-icon">' + CROSS_SVG + '</div>' +
                                '<div class="zkm-sn__choice-info">' +
                                    '<span class="zkm-sn__choice-label">' + noLabel + '</span>' +
                                    '<span class="zkm-sn__choice-key">Alt<b>×1</b></span>' +
                                '</div>' +
                            '</div>' +
                            '<div class="zkm-sn__choice-opt zkm-sn__choice-opt--yes">' +
                                '<div class="zkm-sn__choice-icon">' + CHECK_SVG + '</div>' +
                                '<div class="zkm-sn__choice-info">' +
                                    '<span class="zkm-sn__choice-label">' + yesLabel + '</span>' +
                                    '<span class="zkm-sn__choice-key">Alt<b>×2</b></span>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                        '<div class="zkm-sn__timer-row">' +
                            CLOCK_SVG +
                            '<div class="zkm-sn__timer-time"></div>' +
                            '<div class="zkm-sn__timer-bar-wrap">' +
                                '<div class="zkm-sn__timer-bar-fill" style="width:100%;' + kit.fillStyle + '"></div>' +
                            '</div>' +
                        '</div>' +
                    '</div>';

                document.body.appendChild(el);

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

                    if (remaining <= 2 && remaining > 0) {
                        if (fillEl) fillEl.classList.add('zkm-sn__timer-bar-fill--urgent');
                        if (timeEl) timeEl.classList.add('zkm-sn__timer-time--urgent');
                    }

                    if (remaining <= 0) {
                        clearInterval(iv);
                        removeTimer(id);
                        if (typeof onFinish === 'function') {
                            try { onFinish(id); } catch (e) {}
                        }
                    }
                }, 1000);

                timerQueue.set(id, { el: el, iv: iv });
                return id;

            } catch (e) {
                console.error('[ZKM-SN] addChoice:', e);
            }
        },

        /* ── Обновление уже открытого таймер-уведомления БЕЗ пересоздания
           DOM-узла (а значит без leave/enter анимации). Используется,
           когда снаружи (mvdF.js) нужно просто освежить текст/оставшееся
           время у уведомления, которое и так висит на экране.

           Прогресс-бар считается от total (см. addTimer) — если total
           не передан явно, используется предыдущий total этого таймера
           (а не текущий secs), иначе бар при каждом обновлении прыгал
           бы на 100% вместо того чтобы продолжать плавно идти вниз.

           Текст (заголовок/подпись) меняется мгновенно, ЕСЛИ реально
           изменился — короткий opacity-кроссфейд, а не жёсткая замена,
           чтобы обновление не выглядело "дёргано". Если текст не
           поменялся — вообще не трогаем узел, чтобы не было лишнего
           reflow/мигания.

           Возвращает id при успехе, null — если такого таймера нет
           (тогда вызывающий код должен создать новый через addTimer). ── */
        updateTimer: function (id, payload) {
            var item = timerQueue.get(id);
            if (!item) return null;

            try {
                var d      = JSON.parse(payload);
                var title  = strip(d[1]);
                var label  = strip(d[2]);
                var accent = resolveAccent(d[3]);
                var secs   = Number(d[4]) || 60;
                var total  = Number(d[5]) || item.total || secs;
                var kit    = accentKit(accent);

                var el      = item.el;
                var titleEl = el.querySelector('.zkm-sn__title');
                var textEl  = el.querySelector('.zkm-sn__text-line');
                var lineEl  = el.querySelector('.zkm-sn__accent-line');
                var dotEl   = el.querySelector('.zkm-sn__dot');
                var fillEl  = el.querySelector('.zkm-sn__timer-bar-fill');
                var timeEl  = el.querySelector('.zkm-sn__timer-time');

                /* Мягкая смена текста — только если реально другой текст */
                swapText(titleEl, title);
                swapText(textEl, label);

                if (titleEl) titleEl.style.color = accent;
                if (lineEl)  lineEl.setAttribute('style', kit.lineStyle);
                if (dotEl)   dotEl.setAttribute('style', kit.dotStyle);
                if (fillEl)  fillEl.style.background = accent;
                el.style.boxShadow = BASE_SHADOW + kit.panelGlow;

                /* сбрасываем urgent-состояние — оно относилось к старому отсчёту */
                if (fillEl) fillEl.classList.remove('zkm-sn__timer-bar-fill--urgent');
                if (timeEl) timeEl.classList.remove('zkm-sn__timer-time--urgent');

                clearInterval(item.iv);
                item.total = total;

                var remaining = secs;
                if (timeEl) timeEl.textContent = fmt(remaining);
                /* Ставим долю от ПОЛНОГО цикла, а не от текущего secs —
                   бар продолжает движение с той же точки, без прыжка на 100% */
                if (fillEl) fillEl.style.width =
                    Math.max(0, Math.min(100, (remaining / total) * 100)) + '%';

                item.iv = setInterval(function () {
                    remaining--;
                    if (timeEl) timeEl.textContent = fmt(remaining);
                    if (fillEl) fillEl.style.width =
                        Math.max(0, (remaining / total) * 100) + '%';
                    if (remaining <= 0) {
                        clearInterval(item.iv);
                        removeTimer(id);
                    }
                }, 1000);

                return id;
            } catch (e) {
                console.error('[ZKM-SN] updateTimer:', e);
                return null;
            }
        },

        hideTimer: function (id) {
            removeTimer(id);
        },

        hideAllTimers: function () {
            Array.from(timerQueue.keys()).forEach(removeTimer);
        }
    };

    /* ── Регистрация как ОТДЕЛЬНЫЙ namespace ──────────────────────
       ВАЖНО: не подменяет глобальный родной 'ScreenNotification' —
       родные уведомления игры продолжают работать как обычно.
       МВД-код обращается явно через window.ZkmScreenNotification.
    ─────────────────────────────────────────────────────────────── */
    window.ZkmScreenNotification = ZkmSN;
    console.log('[ZKM-SN] v5.1 готов (акцент через инлайн-стили — надёжно в этом CEF, без CSS var())');

})();
