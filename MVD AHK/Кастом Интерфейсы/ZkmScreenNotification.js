// ZKM Screen Notification — v5.0 "App Match"
// Редизайн под визуальный язык zkm.js / laws-helper: #141419 фон,
// #f4f1e1 текст, тонкие 0.19vh рамки, золотой акцент, border-top
// вместо полноценного lightbar (кроме сирены — там он остаётся,
// это единственный случай, где нужна каскадная анимация).
;(function () {
    'use strict';

    if (window._zkmSNLoaded) return;
    window._zkmSNLoaded = true;

    /* Убираем мусор-теги цвета {RRGGBB} из строки */
    function strip(s) {
        return String(s || '').replace(/\{[0-9A-Fa-f]{6}\}/g, '').trim();
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

    /* hex → "r, g, b" строка для rgba(var(--zkm-accent-rgb), a) в CSS */
    function hexToRgbStr(hex) {
        var h = String(hex).replace('#', '');
        var r = parseInt(h.substr(0, 2), 16) || 0,
            g = parseInt(h.substr(2, 2), 16) || 0,
            b = parseInt(h.substr(4, 2), 16) || 0;
        return r + ', ' + g + ', ' + b;
    }

    /* Прописывает акцент через CSS-переменные на самом элементе —
       вся остальная раскраска (dot/title/border-top/glow/fill) берёт
       цвет из CSS, инлайн-стилей на дочерних узлах больше нет */
    function applyAccentVars(el, accent) {
        el.style.setProperty('--zkm-accent', accent);
        el.style.setProperty('--zkm-accent-rgb', hexToRgbStr(accent));
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
        }, 260);
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
        }, 260);
    }

    /* Inline SVG часы — тонкий stroke как в zkm.js (SVG_DOC/SVG_CHEVRON и т.д.) */
    var CLOCK_SVG =
        '<svg class="zkm-sn__timer-icon" viewBox="0 0 16 16" fill="none" ' +
            'xmlns="http://www.w3.org/2000/svg">' +
            '<circle cx="8" cy="8.5" r="5.4" stroke="currentColor" stroke-width="1.2"/>' +
            '<path d="M8 5.6V8.5l2 1.4" stroke="currentColor" ' +
                'stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round"/>' +
            '<path d="M8 2.1v1" stroke="currentColor" stroke-width="1.15" stroke-linecap="round"/>' +
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

                var isSiren = (accent === '#e25544');

                /* ── Верхний акцент ────────────────────────────────────
                   Обычное уведомление: просто border-top цвета акцента
                   (как border-top у .laws-helper__inner в самом приложении) —
                   без лишней разметки.
                   Сирена: единственный случай, где нужен полноценный
                   каскадный lightbar с 6 сегментами.
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
                    : '';

                /* ── Строки текста (поддержка <br>) ─────────────── */
                var lineHtml = text.split(/<br\s*\/?>/i).map(function (l) {
                    return '<span class="zkm-sn__text-line">' + (l || '&zwj;') + '</span>';
                }).join('');

                /* ── Элемент ─────────────────────────────────────── */
                var el = document.createElement('div');
                el.className = 'zkm-sn zkm-sn--' + pos + ' zkm-sn--enter'
                             + (isSiren ? ' zkm-sn--siren' : '');
                applyAccentVars(el, accent);

                el.innerHTML =
                    barHtml +
                    '<div class="zkm-sn__body">' +
                        '<div class="zkm-sn__header">' +
                            '<div class="zkm-sn__dot"></div>' +
                            '<div class="zkm-sn__title">' + title + '</div>' +
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

                var el = document.createElement('div');
                el.className = 'zkm-sn zkm-sn--' + pos +
                               ' zkm-sn--enter zkm-sn--timer-notif';
                applyAccentVars(el, accent);

                el.innerHTML =
                    '<div class="zkm-sn__body">' +
                        '<div class="zkm-sn__header">' +
                            '<div class="zkm-sn__dot"></div>' +
                            '<div class="zkm-sn__title">' + title + '</div>' +
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
                                '<div class="zkm-sn__timer-bar-fill" style="width:100%"></div>' +
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

        /* ── Уведомление-выбор ──────────────────────────────────────────
           Payload: [position, title, noLabel, yesLabel, accent, seconds]
           Пример: '[2, "Проверка документов", "Нет", "Да", "f9b701", 7]'
           Две карточки-кнопки ALT×1 / ALT×2 (стиль как у кнопок панели
           laws-helper__wanted-btn) + таймер обратного отсчёта с
           прогресс-баром (в последние 2с — тревожная подсветка).
           Живёт в timerQueue (как addTimer) — не гасится через hideAll().

           onFinish(id) вызывается ОДИН раз, когда время естественно
           истекло само по себе. НЕ вызывается, если уведомление было
           закрыто вручную через hideTimer(id) (например, решение уже
           принято раньше срока) — так вызывающий код может отличить
           "время вышло" от "мы сами его убрали".

           Возвращает id для ручной отмены через hideTimer(id).
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

                var remaining = secs;

                var el = document.createElement('div');
                el.className = 'zkm-sn zkm-sn--' + pos +
                               ' zkm-sn--enter zkm-sn--choice';
                applyAccentVars(el, accent);

                el.innerHTML =
                    '<div class="zkm-sn__body">' +
                        '<div class="zkm-sn__header">' +
                            '<div class="zkm-sn__dot"></div>' +
                            '<div class="zkm-sn__title">' + title + '</div>' +
                        '</div>' +
                        '<div class="zkm-sn__choice-row">' +
                            '<div class="zkm-sn__choice-opt zkm-sn__choice-opt--no">' +
                                '<span class="zkm-sn__choice-key">ALT' +
                                    '<span class="zkm-sn__choice-mult">×1</span>' +
                                '</span>' +
                                '<span class="zkm-sn__choice-label">' + noLabel + '</span>' +
                            '</div>' +
                            '<div class="zkm-sn__choice-opt zkm-sn__choice-opt--yes">' +
                                '<span class="zkm-sn__choice-key">ALT' +
                                    '<span class="zkm-sn__choice-mult">×2</span>' +
                                '</span>' +
                                '<span class="zkm-sn__choice-label">' + yesLabel + '</span>' +
                            '</div>' +
                        '</div>' +
                        '<div class="zkm-sn__timer-row">' +
                            CLOCK_SVG +
                            '<div class="zkm-sn__timer-time"></div>' +
                            '<div class="zkm-sn__timer-bar-wrap">' +
                                '<div class="zkm-sn__timer-bar-fill" style="width:100%"></div>' +
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

                    /* Тревожная подсветка на последних 2 секундах */
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
       наш кастомный стиль — родные уведомления пропадали или
       рисовались неправильно.

       Теперь ZKM-уведомление НЕ трогает родной 'ScreenNotification' —
       он продолжает работать как обычно для всей остальной игры.
       МВД-код обращается к кастомному UI явно, через отдельный
       глобальный объект window.ZkmScreenNotification.
    ─────────────────────────────────────────────────────────────── */
    window.ZkmScreenNotification = ZkmSN;
    console.log('[ZKM-SN] v5.0 готов (стиль приведён в соответствие с zkm.js/laws-helper, изолированный namespace)');

})();
