/**
 * NotificationMVD.js
 * Кастомные уведомления для МВД АХК.
 * Дизайн в стиле laws-helper/zkm — тёмный glassmorphism, синий акцент МВД.
 *
 * API (совместим с window.interface('ScreenNotification')):
 *   window.interface('NotificationMVD').add(payload)
 *   window.interface('NotificationMVD').hideAll()
 *
 * Формат payload (строка JSON):
 *   [position, title, text, color_hex, duration_ms]
 *   position: 0 = TOP, 1 = LEFT, 2 = BOTTOM
 *   color_hex: hex без '#', напр. "FF0000", "4f6ef7", "00FF00"
 *
 * Иконки: тип определяется по цвету:
 *   красный   → ◉ (отслеживание)
 *   синий     → ⬡ (погоня / информация)
 *   зелёный   → ✔ (успех)
 *   остальное → ℹ
 */
(function () {

    // ─────────────────────────────────────────────
    //  Хелперы
    // ─────────────────────────────────────────────

    /** Парсит hex-цвет в объект {r,g,b} */
    function hexToRgb(hex) {
        const clean = hex.replace('#', '').slice(0, 6);
        const n = parseInt(clean, 16);
        return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    }

    /** Приводит hex к полному формату (6 символов, верхний регистр) */
    function normalizeHex(hex) {
        const s = String(hex || '').replace('#', '');
        if (s.length === 3) return s.split('').map(c => c + c).join('').toUpperCase();
        return s.padEnd(6, '0').slice(0, 6).toUpperCase();
    }

    /**
     * Возвращает «акцентный» цвет для CSS-переменной и бейджа.
     * Использует смягчённые версии ярких игровых цветов.
     */
    function resolveAccent(hex) {
        const h = normalizeHex(hex);
        const { r, g, b } = hexToRgb(h);

        // Красный диапазон → индиго-красный
        if (r > 180 && g < 80 && b < 80) return '#c0392b';
        // Зелёный → изумрудный
        if (g > 180 && r < 80 && b < 80) return '#27ae60';
        // Синий → акцент МВД
        if (b > 160 && r < 80 && g < 80) return '#4f6ef7';
        // Оранжевый / жёлтый
        if (r > 200 && g > 120 && b < 80) return '#e67e22';
        // Голубой (напарник)
        if (b > 140 && g > 140 && r < 80) return '#2980b9';
        // Белый / серый → нейтральный
        if (r > 170 && g > 170 && b > 170) return '#7f8c8d';
        // По умолчанию — синий МВД
        return '#4f6ef7';
    }

    /**
     * Возвращает SVG-иконку для шапки уведомления.
     * Цвет совпадает с акцентом.
     */
    function getIcon(accent) {
        const color = accent;

        // Отслеживание (красный) — прицел
        if (accent === '#c0392b') return `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="8" r="5.5" stroke="${color}" stroke-width="1.5"/>
            <circle cx="8" cy="8" r="1.5" fill="${color}"/>
            <line x1="8" y1="1" x2="8" y2="3.5" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="8" y1="12.5" x2="8" y2="15" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="1" y1="8" x2="3.5" y2="8" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="12.5" y1="8" x2="15" y2="8" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/>
        </svg>`;

        // Погоня (синий) — мигалка
        if (accent === '#4f6ef7') return `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="6" width="10" height="6" rx="1" fill="${color}" opacity="0.15"/>
            <rect x="3" y="6" width="10" height="6" rx="1" stroke="${color}" stroke-width="1.2"/>
            <rect x="5" y="4" width="6" height="3" rx="0.8" fill="${color}" opacity="0.6"/>
            <circle cx="5.5" cy="12.5" r="1.5" fill="${color}" opacity="0.4"/>
            <circle cx="10.5" cy="12.5" r="1.5" fill="${color}" opacity="0.4"/>
        </svg>`;

        // Успех (зелёный) — галочка
        if (accent === '#27ae60') return `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="8" r="6.5" stroke="${color}" stroke-width="1.3"/>
            <path d="M5 8.5l2.2 2.2 3.8-4" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;

        // Погоня / синий 2980b9
        if (accent === '#2980b9') return `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 2L13 7H10V14H6V7H3L8 2Z" fill="${color}" opacity="0.3"/>
            <path d="M8 2L13 7H10V14H6V7H3L8 2Z" stroke="${color}" stroke-width="1.2" stroke-linejoin="round"/>
        </svg>`;

        // Ошибка / оранжевый
        if (accent === '#e67e22') return `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 2L14.5 13H1.5L8 2Z" stroke="${color}" stroke-width="1.3" stroke-linejoin="round"/>
            <line x1="8" y1="7" x2="8" y2="10" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/>
            <circle cx="8" cy="11.5" r="0.7" fill="${color}"/>
        </svg>`;

        // Нейтральный / серый — шеврон
        return `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="8" r="6.5" stroke="${color}" stroke-width="1.3"/>
            <line x1="8" y1="6" x2="8" y2="9.5" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/>
            <circle cx="8" cy="11" r="0.7" fill="${color}"/>
        </svg>`;
    }

    /**
     * Возвращает короткий бейдж-текст для шапки.
     * Отражает тип уведомления, а не весь заголовок.
     */
    function getBadge(title, accent) {
        const t = String(title).toLowerCase();
        if (t.includes('погон') || t.includes('chase')) return 'ПОГОНЯ';
        if (t.includes('отслеж') || t.includes('track')) return 'СКАН';
        if (t.includes('штраф') || t.includes('fine')) return 'КоАП';
        if (t.includes('swap') || t.includes('своп')) return 'СВОП';
        if (t.includes('напарник') || t.includes('partner')) return 'ПАР';
        if (t.includes('снаряж') || t.includes('grab')) return 'КИТ';
        if (t.includes('ошибк') || t.includes('error')) return 'ERR';
        if (accent === '#c0392b') return 'МВД';
        if (accent === '#27ae60') return 'ОК';
        return 'МВД';
    }

    // ─────────────────────────────────────────────
    //  Разметка игровых цветовых тегов {RRGGBB}
    // ─────────────────────────────────────────────
    function colorizeText(text) {
        // Заменяем {RRGGBB}текст на <span style="color:#RRGGBB">текст</span>
        // поддерживаем <br> как перевод строки
        let out = String(text)
            .replace(/</g, '\x00LT\x00')
            .replace(/>/g, '\x00GT\x00');

        // теперь безопасно разбираем {COLOR}
        out = out.replace(/\{([0-9A-Fa-f]{6})\}((?:(?!\{[0-9A-Fa-f]{6}\}).)*)/g, (_, hex, part) => {
            return `<span style="color:#${hex}">${part}</span>`;
        });

        // Восстанавливаем <br>
        out = out
            .replace(/\x00LT\x00br\x00GT\x00/gi, '<br>')
            .replace(/\x00LT\x00/g, '&lt;')
            .replace(/\x00GT\x00/g, '&gt;');

        return out;
    }

    // ─────────────────────────────────────────────
    //  DOM — создаём контейнер
    // ─────────────────────────────────────────────
    let _root = null;
    let _slots = {};

    const POSITIONS = { 0: 'top', 1: 'left', 2: 'bottom' };

    function ensureDOM() {
        if (_root && document.body.contains(_root)) return;

        _root = document.createElement('div');
        _root.className = 'mvd-notifications';
        document.body.appendChild(_root);

        _slots = {};
        ['top', 'left', 'bottom'].forEach(pos => {
            const slot = document.createElement('div');
            slot.className = `mvd-notification-slot mvd-notification-slot_${pos}`;
            _root.appendChild(slot);
            _slots[pos] = slot;
        });
    }

    // ─────────────────────────────────────────────
    //  Очередь / состояние
    // ─────────────────────────────────────────────
    let _lastId = 0;
    /** Map<id, { el, timers: [] }> */
    const _active = new Map();

    // ─────────────────────────────────────────────
    //  add(payload)
    //  payload: строка JSON [pos, title, text, color, duration]
    // ─────────────────────────────────────────────
    function add(payload) {
        try {
            const data = JSON.parse(payload);
            const pos      = Number(data[0]) || 0;
            const title    = String(data[1] || 'МВД');
            const text     = String(data[2] || '');
            const colorRaw = String(data[3] || '4f6ef7');
            const duration = Number(data[4]) || 3000;

            ensureDOM();

            const slotName = POSITIONS[pos] || 'top';
            const slot = _slots[slotName];

            const accent = resolveAccent(colorRaw);
            const icon   = getIcon(accent);
            const badge  = getBadge(title, accent);
            const bodyHtml = colorizeText(text);

            // Создаём элемент
            const card = document.createElement('div');
            card.className = 'mvd-notification';
            card.style.setProperty('--mvd-notif-accent', accent);

            card.innerHTML = `
                <div class="mvd-notification__header">
                    <span class="mvd-notification__icon">${icon}</span>
                    <span class="mvd-notification__title">${escapeHtml(title)}</span>
                    <span class="mvd-notification__badge">${badge}</span>
                </div>
                <div class="mvd-notification__body">${bodyHtml}</div>
                <div class="mvd-notification__progress" style="animation-duration: ${duration}ms"></div>
            `;

            slot.appendChild(card);

            const id = ++_lastId;
            const timers = [];

            _active.set(id, { card, timers });

            // Авто-удаление
            if (duration < 36000000) {
                const t = setTimeout(() => remove(id), duration);
                timers.push(t);
            }

            return id;
        } catch (e) {
            console.error('[NotificationMVD] add() ошибка:', e, payload);
        }
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    // ─────────────────────────────────────────────
    //  remove(id) — с анимацией исчезновения
    // ─────────────────────────────────────────────
    function remove(id) {
        const entry = _active.get(id);
        if (!entry) return;

        entry.timers.forEach(t => clearTimeout(t));
        _active.delete(id);

        const { card } = entry;
        card.classList.add('mvd-notification_leaving');
        const t = setTimeout(() => {
            if (card.parentNode) card.parentNode.removeChild(card);
        }, 320);
        // не сохраняем таймер — элемент уже удалён из _active
        void t;
    }

    // ─────────────────────────────────────────────
    //  hideAll() — мгновенно убирает все
    // ─────────────────────────────────────────────
    function hideAll() {
        for (const [id, entry] of _active) {
            entry.timers.forEach(t => clearTimeout(t));
            if (entry.card.parentNode) entry.card.parentNode.removeChild(entry.card);
        }
        _active.clear();
    }

    // ─────────────────────────────────────────────
    //  Публикуем как pseudo-интерфейс
    // ─────────────────────────────────────────────
    const _mvdNotifInterface = { add, hideAll };

    // Обёртка совместимости: window.interface('NotificationMVD')
    const _origInterface = window.interface;
    window.interface = function (name, ...rest) {
        if (name === 'NotificationMVD') return _mvdNotifInterface;
        return _origInterface ? _origInterface.call(this, name, ...rest) : undefined;
    };

    // Прямой доступ для удобства
    window._mvdNotif = _mvdNotifInterface;

    console.log('[NotificationMVD] ✅ Загружен');

})();
