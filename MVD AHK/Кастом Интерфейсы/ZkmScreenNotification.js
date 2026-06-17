// ═══════════════════════════════════════════════════════════════════
//  ZKM Screen Notification — v1.1
//  Подключается через _duranCustomInterfaces (IntLoad.js),
//  mvdN.js загружает файл при openInterface('ScreenNotification').
//
//  Совместим с API оригинального ScreenNotification:
//    window.interface('ScreenNotification').add(jsonPayload)
//    window.interface('ScreenNotification').hideAll()
// ═══════════════════════════════════════════════════════════════════
;(() => {
    'use strict';

    // ─── Защита от двойной загрузки ───────────────────────────────────
    if (window._zkmSNLoaded) {
        console.log('[ZKM-SN] уже загружен, пропуск');
        return;
    }
    window._zkmSNLoaded = true;

    // ─── 1. Утилиты ───────────────────────────────────────────────────

    /** Убирает SAMP-цвета {RRGGBB} и обрезает пробелы */
    const strip = s => String(s || '').replace(/\{[0-9A-Fa-f]{6}\}/g, '').trim();

    /**
     * Переводит HEX цвет (MVDN-параметр) в ZKM семантический акцент:
     *   красный  → #e25544  (ZKM danger, border_red)
     *   зелёный  → #0a9947  (ZKM success, border_green)
     *   синий    → #2d7dd2  (ZKM info)
     *   жёлтый   → #f9b701  (ZKM gold, default)
     *   серый    → #f4f1e166
     */
    function resolveAccent(hex) {
        if (!hex) return '#f9b701';
        const h = String(hex).replace(/^#/, '').padStart(6, '0');
        const r = parseInt(h.slice(0, 2), 16);
        const g = parseInt(h.slice(2, 4), 16);
        const b = parseInt(h.slice(4, 6), 16);
        if (r > 160 && r >= g * 1.5 && r >= b * 1.5) return '#e25544';   // красный
        if (g > 160 && g >= r * 1.5 && g >= b * 1.5) return '#0a9947';   // зелёный
        if (b > 160 && b >= r * 2   && b >= g * 1.5) return '#2d7dd2';   // синий
        if (r > 180 && g > 120      && b < 60)        return '#f9b701';   // жёлтый/золото
        if (r > 170 && g > 170      && b > 170)       return '#f4f1e166'; // серый
        return `#${h}`;
    }

    const ACCENT_RGB = {
        '#e25544':   '226,85,68',
        '#0a9947':   '10,153,71',
        '#2d7dd2':   '45,125,210',
        '#f9b701':   '249,183,1',
        '#f4f1e166': '244,241,225',
    };
    const accentRgb = accent => ACCENT_RGB[accent] || '249,183,1';

    // ─── 2. CSS ───────────────────────────────────────────────────────
    const CSS = `
        #zkm-sn-root {
            position: fixed; inset: 0;
            pointer-events: none; z-index: 99999;
            font-family: "Open Sans", Arial, sans-serif;
        }
        .zkm-sn {
            position: absolute;
            overflow: hidden;
            background: #141419eb;
            border: 0.19vh solid #f4f1e11a;
            border-radius: 0.74vh;
            min-width: 24vh; max-width: 44vh;
            padding: 1.11vh 1.48vh;
            color: #f4f1e1;
            pointer-events: none;
            transition: opacity 0.35s ease, transform 0.35s ease;
        }
        .zkm-sn--top    { top: 8.8vh;    left: 50%;  transform: translateX(-50%); }
        .zkm-sn--left   { left: 4.26vh;  top: 54vh; }
        .zkm-sn--bottom { bottom: 5.93vh; left: 50%; transform: translateX(-50%); }

        .zkm-sn--top.zkm-sn--enter    { opacity: 0; transform: translateX(-50%) translateY(-2.22vh); }
        .zkm-sn--bottom.zkm-sn--enter { opacity: 0; transform: translateX(-50%) translateY(2.22vh);  }
        .zkm-sn--left.zkm-sn--enter   { opacity: 0; transform: translateX(2.22vh); }

        .zkm-sn--top.zkm-sn--leave    { opacity: 0; transform: translateX(-50%) translateY(-1.11vh); }
        .zkm-sn--bottom.zkm-sn--leave { opacity: 0; transform: translateX(-50%) translateY(1.11vh);  }
        .zkm-sn--left.zkm-sn--leave   { opacity: 0; transform: translateX(-1.11vh); }

        .zkm-sn__shimmer {
            position: absolute; inset: 0; pointer-events: none;
            background: linear-gradient(135deg, #f9b70108 0%, transparent 60%);
            border-radius: inherit;
        }
        .zkm-sn__header {
            display: flex; align-items: center; gap: 0.56vh;
            border-bottom: 0.09vh solid #f4f1e11a;
            padding-bottom: 0.65vh; margin-bottom: 0.65vh;
            position: relative; z-index: 1;
        }
        .zkm-sn__bar {
            width: 0.28vh; flex-shrink: 0; border-radius: 0.19vh;
            align-self: stretch; min-height: 1.4vh;
        }
        .zkm-sn__title {
            font-family: "Open Sans Condensed", "Open Sans", Arial, sans-serif;
            font-size: 1.3vh; font-style: italic; font-weight: 700;
            letter-spacing: 0.07vh; text-transform: uppercase;
            line-height: 1; flex: 1; position: relative; z-index: 1;
        }
        .zkm-sn__text {
            font-size: 1.2vh; font-weight: 600; line-height: 1.65;
            color: #f4f1e1cc; position: relative; z-index: 1;
        }
        .zkm-sn__text-line { display: block; }
    `;

    function injectCSS() {
        if (document.getElementById('zkm-sn-css')) return;
        const el = document.createElement('style');
        el.id = 'zkm-sn-css';
        el.textContent = CSS;
        document.head.appendChild(el);
    }

    // ─── 3. Контейнер ─────────────────────────────────────────────────
    let _root = null;

    function getRoot() {
        if (_root && document.body.contains(_root)) return _root;
        _root = document.createElement('div');
        _root.id = 'zkm-sn-root';
        document.body.appendChild(_root);
        return _root;
    }

    // ─── 4. Очередь ───────────────────────────────────────────────────
    let  _lastId = 0;
    const _queue = new Map();

    const POS_MAP = { 0: 'top', 1: 'left', 2: 'bottom' };

    function remove(id) {
        const item = _queue.get(id);
        if (!item) return;
        clearTimeout(item.timerId);
        _queue.delete(id);
        const { el } = item;
        el.classList.add('zkm-sn--leave');
        setTimeout(() => { try { el.remove(); } catch (_) {} }, 380);
    }

    // ─── 5. Публичный API ─────────────────────────────────────────────
    //  Совпадает 1-в-1 с методами оригинального ScreenNotification:
    //    add(jsonString)  — [POSITION, TITLE, TEXT, COLOR, DURATION]
    //    hideAll()        — очистить все активные уведомления

    function add(payload) {
        try {
            const d        = JSON.parse(payload);
            const posKey   = POS_MAP[d[0]] ?? 'top';
            const title    = strip(d[1]);
            const text     = strip(d[2]);
            const color    = d[3] ?? null;
            const duration = Number(d[4]) || 3000;

            const accent = resolveAccent(color);
            const rgb    = accentRgb(accent);
            const id     = ++_lastId;

            const el = document.createElement('div');
            el.className = `zkm-sn zkm-sn--${posKey} zkm-sn--enter`;
            el.style.borderTop = `0.19vh solid ${accent}`;
            el.style.boxShadow = `inset 0 3.89vh 4.81vh -2.96vh rgba(${rgb},0.18), 0 0.28vh 1.48vh 0 #00000055`;

            const lineHtml = text
                .split(/<br\s*\/?>/i)
                .map(l => `<span class="zkm-sn__text-line">${l || '&zwj;'}</span>`)
                .join('');

            el.innerHTML = `
                <div class="zkm-sn__shimmer"></div>
                <div class="zkm-sn__header">
                    <div class="zkm-sn__bar" style="background:${accent};"></div>
                    <div class="zkm-sn__title" style="color:${accent};">${title}</div>
                </div>
                <div class="zkm-sn__text">${lineHtml}</div>
            `;

            getRoot().appendChild(el);
            setTimeout(() => el.classList.remove('zkm-sn--enter'), 20);

            const timerId = setTimeout(() => remove(id), duration);
            _queue.set(id, { el, timerId });
        } catch (err) {
            console.error('[ZKM-SN] ошибка add:', err);
        }
    }

    function hideAll() {
        for (const id of [..._queue.keys()]) remove(id);
    }

    // ─── 6. Регистрация — как у оригинального ScreenNotification ──────
    //
    //  ScreenNotification попадает в window.interface() через $refs.
    //  Мы делаем то же самое: записываем ZkmSN в $refs напрямую
    //  (если App уже готов) или патчим window.interface как запасной вариант.

    const ZkmSN = { add, hideAll };

    function registerComponent() {
        // Путь 1 — прямая запись в $refs (как настоящий Vue ref)
        if (window.App && window.App.$refs) {
            try {
                Object.defineProperty(window.App.$refs, 'ScreenNotification', {
                    get: () => ZkmSN,
                    configurable: true,
                    enumerable: true,
                });
                console.log('[ZKM-SN] ✓ $refs.ScreenNotification зарегистрирован');
                return;
            } catch (e) {
                console.warn('[ZKM-SN] $refs не доступен, переход к window.interface hook');
            }
        }

        // Путь 2 — перехват window.interface (запасной)
        const orig = window.interface;
        if (typeof orig === 'function') {
            window.interface = function (name, ...args) {
                if (name === 'ScreenNotification') return ZkmSN;
                return orig.apply(this, [name, ...args]);
            };
            console.log('[ZKM-SN] ✓ window.interface("ScreenNotification") перехвачен');
            return;
        }

        // App ещё не готов — повторим
        setTimeout(registerComponent, 100);
    }

    // ─── 7. Инициализация ─────────────────────────────────────────────
    function init() {
        injectCSS();
        getRoot();
        registerComponent();
        console.log('[ZKM-SN] v1.1 инициализирован');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
