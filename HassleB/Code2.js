// Code2.js — продолжение Code.js в отдельном файле
// eval'ится изнутри Code.js — имеет доступ ко всем его переменным напрямую

// ╔══════════════════════════════════════════════════════════╗
// ║  MODULE: DIALOG MONITOR v2.1                             ║
// ║  Описание: Перехват серверных диалогов игры и управление ║
// ║             ими через Telegram.                          ║
// ║             Типы: LIST, TABLIST, INPUT, PASSWORD, MSGBOX ║
// ║  Зависимости: config, displayName, uniqueId, debugLog,   ║
// ║               sendToTelegram, deleteMessage,             ║
// ║               answerCallbackQuery, createButton,         ║
// ║               processUpdates, setSharedLastUpdateId      ║
// ║                                                          ║
// ║  НОВОЕ в v2.1:                                           ║
// ║  1. Захват parsed[6/7] → paginate[0/1] (серв. пагинация)║
// ║  2. Захват priority (3-й аргумент addDialogInQueue)      ║
// ║  3. Захват parsed[8] → prefillValue (для INPUT)          ║
// ║  4. dlgBuildText: ID, priority, кнопки, prefill,        ║
// ║     subtitle/info, статус серверной пагинации            ║
// ║  5. dlgBuildKeyboard: кнопки ◀️/▶️ серверной пагинации  ║
// ║  6. dlgSrvPaginate: OnMultiDialogClickNavigButton        ║
// ║  7. Полный debugLog: все поля + каждый item по строке   ║
// ╚══════════════════════════════════════════════════════════╝


// ==================== Все режимы ====================
/* // ==================== TEST COMMANDS (ScreenNotification + GameText) ====================
const originalSendChatInput = window.sendChatInputCustom || sendChatInput;
window.sendChatInputCustom = function(e) {
    const args = e.trim().split(" ");
    // ===================== /test — ScreenNotification =====================
    if (args[0] === "/test") {
        try {
            window.interface('ScreenNotification').add(
                '[0, "Тест уведомления", "Это тестовый текст с переносом строки", "FF66FF", 5000]'
            );
            console.log('[TEST] ScreenNotification отправлен');
        } catch (err) {
            console.error('[TEST] Ошибка ScreenNotification:', err);
        }
        return;
    }
    // ===================== /test2 — GameText =====================
    if (args[0] === "/test2") {
        try {
            window.interface('GameText').add(
                '[0, "Большой GameText~n~~r~Красный~w~ и ~g~зелёный~w~ текст", 6000, 0, 0, 1, 1, 3.5]'
            );
            console.log('[TEST2] GameText отправлен');
        } catch (err) {
            console.error('[TEST2] Ошибка GameText:', err);
        }
        return;
    }
    // Для всех остальных команд — передаём дальше
    if (typeof originalSendChatInput === 'function') {
        originalSendChatInput(e);
    }
};
sendChatInput = window.sendChatInputCustom;
console.log('[TEST COMMANDS] /test и /test2 успешно загружены!');
// ScreenNotification:
// Формат: [позиция, "Заголовок", "Текст перенос", "ЦветHEX", время_мс]
// Позиции:
// 0 — Сверху (top)
// 1 — Слева (left)
// 2 — Снизу (bottom)
// GameText:
// Формат: [тип, "Текст~n~перенос~~r~цвет", длительность, offset, keyCode, force, звук, размер]
// Типы (0-4):
// 0 — Центр экрана (center-type)
// 1 — Верх экрана (top-type)
// 2 — Справа внизу (right-type)
// 3 — Низ экрана (bottom-type)
// 4 — Центр + ожидание клавиши (key-type)
// Цвета: ~r~красный ~y~жёлтый ~g~зелёный ~b~синий ~p~фиолетовый ~w~белый ~o~оранжевый
*/

// ==================== DIALOG MONITOR MODULE v2.1 ====================
// Перехват серверных диалогов игры и управление ими через Telegram
// Расположение: в самом конце Code.js (после // END HB MENU SYSTEM)
//
// ИСПРАВЛЕНИЯ v2:
// 1. TABLIST_HEADERS (style=5): первая строка — заголовок, не кнопка
// 2. <t> (разделитель колонок) → " │ " для читаемого отображения
// 3. HTML-теги в тексте диалога — текст сохраняется, тег удаляется
// 4. Защита от краша: проверка dlg.active перед dlgRespond
// 5. Пустой info для INPUT-диалогов — исправлен парсинг HTML
//
// НОВОЕ v2.1:
// 6. Захват paginate[0/1] из parsed[6/7] — серверная навигация
// 7. Захват priority из аргумента addDialogInQueue
// 8. Захват prefillValue из parsed[8] (предзаполнение INPUT)
// 9. Полный текст сообщения: ID, приоритет, subtitle, кнопки, prefill
// 10. Кнопки ◀️/▶️ серверной пагинации в клавиатуре Telegram
// 11. dlgSrvPaginate() → OnMultiDialogClickNavigButton
// 12. Подробный debugLog: все поля + items построчно
// ==================================================================

// ── Константы ──────────────────────────────────────────────────
const DIALOG_STYLE = {
    MSGBOX:          0,
    INPUT:           1,
    LIST:            2,
    PASSWORD:        3,
    TABLIST:         4,
    TABLIST_HEADERS: 5
};

// Window.js TYPES: ["text","input","list_normal","input_private","list_title","list_title","image"]
// Соответствие style → имя типа как в Window.js
const DLG_WINDOW_TYPE_NAMES = {
    0: 'text',
    1: 'input',
    2: 'list_normal',
    3: 'input_private',
    4: 'list_title',
    5: 'list_title',
    6: 'image'
};

const DLG_ITEMS_PER_PAGE = 8;  // Элементов списка на одну страницу (клиентская пагинация)
const DLG_LABEL_MAX_LEN  = 24; // Макс. длина подписи кнопки

// Диапазон HB-диалогов — не трогаем
const DLG_HB_MIN = 900;
const DLG_HB_MAX = 913;

// ── Состояние диалога ─────────────────────────────────────────
const dlg = {
    active:        false,
    dialogId:      null,
    style:         null,
    title:         '',
    info:          '',         // subtitle / подзаголовок (parsed[3])
    contentText:   '',         // FIX v2: текст для INPUT/MSGBOX/PASSWORD (из content)
    headers:       [],         // заголовки колонок TABLIST_HEADERS
    items:         [],         // строки списка
    button1:       '',         // parsed[4]
    button2:       '',         // parsed[5]
    tgMsgs:        [],         // [{chatId, messageId}]
    page:          0,          // текущая страница клиентской пагинации
    awaitingInput: false,

    // ── v2.1: новые поля ───────────────────────────────────────
    paginate:      [false, false],  // [canPrev, canNext] — сервер-сайд навигация (parsed[6/7])
    priority:      0,               // приоритет диалога (3-й аргумент addDialogInQueue)
    prefillValue:  '',              // предзаполнение для INPUT/PASSWORD (parsed[8])
};

// ── Вспомогательные функции ───────────────────────────────────

/**
 * Очищает текст от цветовых кодов игры и HTML-тегов,
 * сохраняя текстовое содержимое.
 * FIX v2: <t> → " │ ", <br>/<p> → перенос строки, текст из тегов сохраняется
 */
function dlgStripColors(text) {
    return (text || '')
        .replace(/<t>/gi, ' │ ')              // Разделитель колонок tablist
        .replace(/\{[A-Fa-f0-9]{6}\}/g, '')   // {RRGGBB} цветовые коды игры
        .replace(/<br\s*\/?>/gi, '\n')         // <br> → перенос
        .replace(/<\/p>/gi, '\n')              // </p> → перенос
        .replace(/<p[^>]*>/gi, '')             // Убираем открывающий <p ...>
        .replace(/<[^>]+>/g, '')               // Все остальные HTML-теги
        .replace(/\n{3,}/g, '\n\n')            // Схлопываем лишние переносы
        .trim();
}

/** Экранирует HTML для Telegram HTML-разметки */
function dlgHtml(text) {
    return (text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/** Иконка типа диалога */
function dlgStyleIcon(style) {
    const MAP = { 0: '📋', 1: '✏️', 2: '📜', 3: '🔐', 4: '📊', 5: '📊' };
    return MAP[style] || '💬';
}
function dlgStyleName(style) {
    const MAP = {
        0: 'Сообщение', 1: 'Ввод текста', 2: 'Список',
        3: 'Ввод пароля', 4: 'Таблица', 5: 'Таблица+Загол.'
    };
    return MAP[style] || 'Диалог';
}

// ── Формирование текста и клавиатуры ─────────────────────────

function dlgBuildText() {
    const totalPages = Math.ceil(dlg.items.length / DLG_ITEMS_PER_PAGE);
    const startIdx   = dlg.page * DLG_ITEMS_PER_PAGE;
    const endIdx     = Math.min(startIdx + DLG_ITEMS_PER_PAGE, dlg.items.length);

    // ── Заголовок блока ───────────────────────────────────────
    let text = `🗔 <b>Диалог — ${displayName}</b>\n`;
    text += `<i>${dlgStyleIcon(dlg.style)} ${dlgStyleName(dlg.style)}</i>`;
    text += ` <code>style=${dlg.style} (${DLG_WINDOW_TYPE_NAMES[dlg.style] || '?'})</code>\n`;

    // ── ID + приоритет ────────────────────────────────────────
    text += `🆔 ID: <code>${dlg.dialogId}</code>`;
    if (dlg.priority) text += `  📊 Приоритет: <code>${dlg.priority}</code>`;
    text += `\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n`;

    // ── Заголовок диалога ─────────────────────────────────────
    if (dlg.title)  text += `📌 <b>${dlgHtml(dlg.title)}</b>\n`;

    // ── Подзаголовок (info / subtitle) ───────────────────────
    if (dlg.info)   text += `ℹ️ <i>${dlgHtml(dlg.info)}</i>\n`;

    // ── Текст диалога (INPUT / MSGBOX / PASSWORD — из content) ─
    if (dlg.contentText) {
        text += `\n📝 ${dlgHtml(dlg.contentText)}\n`;
    }

    // ── Предзаполнение для INPUT / PASSWORD ───────────────────
    if (dlg.prefillValue &&
        (dlg.style === DIALOG_STYLE.INPUT || dlg.style === DIALOG_STYLE.PASSWORD)) {
        text += `✏️ Предзаполнение: <code>${dlgHtml(dlg.prefillValue)}</code>\n`;
    }

    // ── Кнопки (названия) ─────────────────────────────────────
    if (dlg.button1 || dlg.button2) {
        text += `\n🔘 `;
        if (dlg.button1) text += `[${dlgHtml(dlg.button1)}]`;
        if (dlg.button1 && dlg.button2) text += ` / `;
        if (dlg.button2) text += `[${dlgHtml(dlg.button2)}]`;
        text += `\n`;
    }

    // ── Статус серверной пагинации ────────────────────────────
    if (dlg.paginate[0] || dlg.paginate[1]) {
        const prev = dlg.paginate[0] ? '◀️ есть' : '— нет';
        const next = dlg.paginate[1] ? '▶️ есть' : '— нет';
        text += `📄 Серв. страницы: пред. ${prev} / след. ${next}\n`;
    }

    // ── Заголовки колонок (только для TABLIST_HEADERS) ────────
    if (dlg.headers.length > 0) {
        text += `\n📊 <b>${dlgHtml(dlg.headers.join(' │ '))}</b>\n`;
    }

    // ── Элементы списка с клиентской пагинацией ───────────────
    if (dlg.items.length > 0) {
        const pageLabel = totalPages > 1
            ? ` (стр. ${dlg.page + 1}/${totalPages})`
            : '';
        text += `\n<b>Пункты [${dlg.items.length}]${pageLabel}:</b>\n`;
        for (let i = startIdx; i < endIdx; i++) {
            text += `${i + 1}. ${dlgHtml(dlg.items[i])}\n`;
        }
    }

    // ── Подсказка для ввода ───────────────────────────────────
    if (dlg.style === DIALOG_STYLE.INPUT || dlg.style === DIALOG_STYLE.PASSWORD) {
        text += `\n💡 <i>Нажмите «Ввести», введите текст в ответном сообщении — он будет отправлен в диалог</i>`;
    }

    return text;
}

function dlgBuildKeyboard() {
    const uid = uniqueId;
    const kb  = [];
    const startIdx = dlg.page * DLG_ITEMS_PER_PAGE;
    const endIdx   = Math.min(startIdx + DLG_ITEMS_PER_PAGE, dlg.items.length);

    // ── LIST / TABLIST / TABLIST_HEADERS ───────────────────────
    // FIX v2: dlg.items уже НЕ содержит строку заголовков — индексы верные
    if (dlg.style === DIALOG_STYLE.LIST ||
        dlg.style === DIALOG_STYLE.TABLIST ||
        dlg.style === DIALOG_STYLE.TABLIST_HEADERS) {

        for (let i = startIdx; i < endIdx; i += 2) {
            const lbl1 = `${i + 1}. ${dlg.items[i].substring(0, DLG_LABEL_MAX_LEN)}`;
            const row  = [createButton(lbl1, `dlg_item_${i}_${uid}`)];
            if (i + 1 < endIdx) {
                const lbl2 = `${i + 2}. ${dlg.items[i + 1].substring(0, DLG_LABEL_MAX_LEN)}`;
                row.push(createButton(lbl2, `dlg_item_${i + 1}_${uid}`));
            }
            kb.push(row);
        }

        // ── Клиентская пагинация (по DLG_ITEMS_PER_PAGE) ──────
        const totalPages = Math.ceil(dlg.items.length / DLG_ITEMS_PER_PAGE);
        if (totalPages > 1) {
            const nav = [];
            if (dlg.page > 0)
                nav.push(createButton('⬅️ Пред.', `dlg_page_${dlg.page - 1}_${uid}`, 'primary'));
            nav.push(createButton(`📄 ${dlg.page + 1}/${totalPages}`, `dlg_noop_${uid}`));
            if (dlg.page < totalPages - 1)
                nav.push(createButton('➡️ След.', `dlg_page_${dlg.page + 1}_${uid}`, 'primary'));
            kb.push(nav);
        }

        // ── v2.1: Серверная пагинация (OnMultiDialogClickNavigButton) ──
        // Отдельный ряд, только если сервер сообщил о наличии страниц
        if (dlg.paginate[0] || dlg.paginate[1]) {
            const srvNav = [];
            if (dlg.paginate[0])
                srvNav.push(createButton('◀️ Пред. стр. (серв.)', `dlg_srv_prev_${uid}`, 'primary'));
            if (dlg.paginate[0] && dlg.paginate[1])
                srvNav.push(createButton('📋', `dlg_noop_${uid}`));
            if (dlg.paginate[1])
                srvNav.push(createButton('▶️ След. стр. (серв.)', `dlg_srv_next_${uid}`, 'primary'));
            kb.push(srvNav);
        }

        // FIX: если button2 пустая — сервер всё равно показывает "Назад", добавляем fallback
        const b2label = dlg.button2 || 'Назад';
        kb.push([createButton(`❌ ${b2label}`, `dlg_btn2_${uid}`, 'danger')]);

    // ── INPUT / PASSWORD ────────────────────────────────────────
    } else if (dlg.style === DIALOG_STYLE.INPUT ||
               dlg.style === DIALOG_STYLE.PASSWORD) {

        const icon = dlg.style === DIALOG_STYLE.PASSWORD ? '🔐' : '✏️';
        kb.push([createButton(`${icon} Ввести текст`, `dlg_input_${uid}`, 'primary')]);

        // FIX: всегда показываем кнопку отмены, даже если button2 пустая
        const cancelLabel = dlg.button2 || 'Назад';
        kb.push([createButton(`❌ ${cancelLabel}`, `dlg_btn2_${uid}`, 'danger')]);

    // ── MSGBOX ──────────────────────────────────────────────────
    } else {
        const btnRow = [];
        if (dlg.button1) btnRow.push(createButton(`✅ ${dlg.button1}`, `dlg_btn1_${uid}`, 'success'));
        // FIX: всегда показываем кнопку отмены, даже если button2 пустая
        const cancelLabel = dlg.button2 || 'Закрыть';
        btnRow.push(createButton(`❌ ${cancelLabel}`, `dlg_btn2_${uid}`, 'danger'));
        if (btnRow.length) kb.push(btnRow);
    }

    return { inline_keyboard: kb };
}

// ── Telegram-операции ────────────────────────────────────────

function dlgSendToTelegram() {
    dlg.tgMsgs.forEach(({ chatId, messageId }) => deleteMessage(chatId, messageId));
    dlg.tgMsgs = [];

    const text     = dlgBuildText();
    const keyboard = dlgBuildKeyboard();

    config.chatIds.forEach(chatId => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.telegram.org/bot${config.botToken}/sendMessage`, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function() {
            if (xhr.status === 200) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    dlg.tgMsgs.push({ chatId, messageId: data.result.message_id });
                    debugLog(`[DLG] Отправлено в чат ${chatId}: msg ${data.result.message_id}`);
                } catch (e) {}
            }
        };
        xhr.send(JSON.stringify({
            chat_id:      chatId,
            text:         text,
            parse_mode:   'HTML',
            reply_markup: JSON.stringify(keyboard)
        }));
    });
}

function dlgUpdateTelegram() {
    const text     = dlgBuildText();
    const keyboard = dlgBuildKeyboard();
    dlg.tgMsgs.forEach(({ chatId, messageId }) => {
        editMessageText(chatId, messageId, text, keyboard);
    });
}

function dlgClose(showClosedMsg = true) {
    if (!dlg.active) return;
    dlg.active        = false;
    dlg.awaitingInput = false;
    if (showClosedMsg) {
        // Закрыто из Telegram — редактируем сообщение в уведомление
        dlg.tgMsgs.forEach(({ chatId, messageId }) => {
            editMessageText(chatId, messageId,
                `✅ <b>Диалог закрыт — ${displayName}</b>`, null);
        });
    } else {
        // Закрыто в игре — удаляем сообщение из Telegram
        dlg.tgMsgs.forEach(({ chatId, messageId }) => {
            deleteMessage(chatId, messageId);
        });
    }
    dlg.tgMsgs = [];
    // FIX: закрываем Vue-компонент диалога в игре (иначе игра крашит)
    try { window.closeLastDialog(); } catch(e) {}
    debugLog('[DLG] Диалог завершён');
}

/**
 * Отправляет ответ на диалог через sendClientEvent.
 * FIX v2: Защита — проверяем dlg.active перед вызовом
 */
function dlgRespond(dialogId, response, listitem, inputText) {
    // Если диалог уже закрыт — не отправляем
    if (!dlg.active && response !== 0) {
        debugLog(`[DLG] dlgRespond: диалог ${dialogId} уже не активен, пропускаем`);
        sendToTelegram(
            `⚠️ <b>Диалог уже закрыт, ответ не отправлен (${displayName})</b>`,
            false, null);
        return;
    }
    try {
        // Используем gm.EVENT_EXECUTE_PUBLIC как в Window.js, с fallback
        const evtType = (window.gm && window.gm.EVENT_EXECUTE_PUBLIC !== undefined)
            ? window.gm.EVENT_EXECUTE_PUBLIC
            : 'server';
        _dlgOrigSendClientEvent(evtType, 'OnDialogResponse',
            dialogId, response, listitem, inputText || '');
        debugLog(`[DLG] Ответ: id=${dialogId} resp=${response} item=${listitem} input="${inputText}"`);
    } catch (err) {
        debugLog(`[DLG] Ошибка ответа: ${err.message}`);
        sendToTelegram(
            `❌ <b>Ошибка ответа на диалог (${displayName}):</b>\n` +
            `<code>${err.message.replace(/</g, '&lt;')}</code>`,
            false, null);
    }
}

/**
 * v2.1: Отправляет серверную навигацию (◀️/▶️ страницы от сервера).
 * Соответствует Window.js onPaginateButton():
 *   sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, 'OnMultiDialogClickNavigButton', direction, dialogId, priority)
 * @param {number} direction — 0 = назад, 1 = вперёд
 */
function dlgSrvPaginate(direction) {
    if (!dlg.active) {
        debugLog('[DLG] dlgSrvPaginate: диалог не активен');
        return;
    }
    try {
        const evtType = (window.gm && window.gm.EVENT_EXECUTE_PUBLIC !== undefined)
            ? window.gm.EVENT_EXECUTE_PUBLIC
            : 'server';
        _dlgOrigSendClientEvent(evtType, 'OnMultiDialogClickNavigButton',
            direction, dlg.dialogId, dlg.priority);
        debugLog(
            `[DLG] Серв. пагинация: direction=${direction}, ` +
            `id=${dlg.dialogId}, priority=${dlg.priority}`
        );
        sendToTelegram(
            `📄 <b>${direction === 0 ? '◀️ Предыдущая' : '▶️ Следующая'} страница — ${displayName}</b>\n` +
            `<i>Сервер пришлёт обновлённый диалог...</i>`,
            false, null
        );
    } catch (err) {
        debugLog(`[DLG] Ошибка серв. пагинации: ${err.message}`);
        sendToTelegram(
            `❌ <b>Ошибка серверной пагинации (${displayName}):</b>\n` +
            `<code>${err.message.replace(/</g, '&lt;')}</code>`,
            false, null
        );
    }
}

// ── Хук addDialogInQueue ─────────────────────────────────────

// FIX: сохраняем оригинал до первого патча.
// hassleCleanupHooks() восстановит его перед каждой перезагрузкой,
// поэтому здесь всегда будет «чистый» оригинал игры.
if (typeof window.addDialogInQueue === 'function' && !window._hassleOrig_addDialogInQueue) {
    window._hassleOrig_addDialogInQueue = window.addDialogInQueue;
}
const _dlgOrigAddDialogInQueue = window._hassleOrig_addDialogInQueue || window.addDialogInQueue;
window.addDialogInQueue = function(dialogParams, content, priority) {
    try {
        // Bug fix: dialogParams может быть false (дефолтный параметр)
        if (!dialogParams || typeof dialogParams !== 'string') {
            return _dlgOrigAddDialogInQueue.call(this, dialogParams, content, priority);
        }

        const parsed   = JSON.parse(dialogParams.trim());
        const dialogId = parseInt(parsed[0]);
        const style    = parseInt(parsed[1]);

        // HB-диалоги (900–913) — не трогаем
        if (dialogId >= DLG_HB_MIN && dialogId <= DLG_HB_MAX) {
            return _dlgOrigAddDialogInQueue.call(this, dialogParams, content, priority);
        }

        const title   = dlgStripColors(parsed[2] || '');
        const info    = dlgStripColors(parsed[3] || '');
        const button1 = dlgStripColors(parsed[4] || '');
        const button2 = dlgStripColors(parsed[5] || '');

        // v2.1: parsed[6/7] = paginate флаги от сервера (как в Window.js openParams[6/7])
        const paginatePrev = !!(parsed[6]);
        const paginateNext = !!(parsed[7]);

        // v2.1: parsed[8] = prefillValue для INPUT (как в Window.js openParams[8])
        const prefillValue = dlgStripColors(parsed[8] || '');

        // v2.1: priority — третий аргумент addDialogInQueue (как в Window.js props.priority)
        const dlgPriority = (typeof priority !== 'undefined' && priority !== null)
            ? Number(priority) : 0;

        // FIX: для INPUT/MSGBOX/PASSWORD — текст диалога хранится в content/stringParam
        let contentText = '';
        if (style === DIALOG_STYLE.INPUT ||
            style === DIALOG_STYLE.MSGBOX ||
            style === DIALOG_STYLE.PASSWORD) {
            const rawContent = Array.isArray(content) ? content.join('') : String(content || '');
            contentText = dlgStripColors(rawContent.split('<n>').join('\n')).trim();
        }

        // ── FIX v2: Разделяем заголовок и данные для TABLIST_HEADERS ──
        let items   = [];
        let headers = [];

        if (content && (style === DIALOG_STYLE.LIST ||
                        style === DIALOG_STYLE.TABLIST ||
                        style === DIALOG_STYLE.TABLIST_HEADERS)) {

            // Bug fix: content может быть массивом [], а не строкой
            const contentStr = Array.isArray(content) ? content.join('<n>') : String(content);
            const allItems = contentStr.split('<n>')
                .map(dlgStripColors)
                .filter(s => s.length > 0);

            if (style === DIALOG_STYLE.TABLIST_HEADERS && allItems.length > 0) {
                // Первая строка — заголовки колонок, НЕ делаем её кнопкой
                headers = allItems[0]
                    .split(' │ ')
                    .map(h => h.trim())
                    .filter(h => h.length > 0);
                items = allItems.slice(1); // Данные начинаются со второй строки
            } else {
                items = allItems;
            }
        }

        // Если диалог содержит сообщение об авторизации/отключении — ставим флаг,
        // чтобы подавить дублирующее уведомление "Вы были отключены от сервера"
        const _dlgAllText = (title + ' ' + info + ' ' + contentText).toLowerCase();
        if (_dlgAllText.includes('авторизац') || _dlgAllText.includes('отключены от сервера')) {
            window.__afterAuthDialog = true;
            debugLog('[DLG] Диалог авторизации/отключения — флаг __afterAuthDialog установлен');
        }

        // Обновляем состояние
        dlg.active        = true;
        dlg.dialogId      = dialogId;
        dlg.style         = style;
        dlg.title         = title;
        dlg.info          = info;
        dlg.contentText   = contentText;
        dlg.headers       = headers;
        dlg.items         = items;
        dlg.button1       = button1;
        dlg.button2       = button2;
        dlg.page          = 0;
        dlg.awaitingInput = false;
        // v2.1
        dlg.paginate      = [paginatePrev, paginateNext];
        dlg.priority      = dlgPriority;
        dlg.prefillValue  = prefillValue;

        // ── v2.1: Подробный debugLog — ВСЕ поля диалога ──────────────
        debugLog(
            `[DLG] ═══════════════ Диалог перехвачен ═══════════════\n` +
            `  ID:          ${dialogId}\n` +
            `  Style:       ${style} → ${dlgStyleName(style)} (${DLG_WINDOW_TYPE_NAMES[style] || '?'})\n` +
            `  Priority:    ${dlgPriority}\n` +
            `  Title:       "${title}"\n` +
            `  Info/Sub:    "${info}"\n` +
            `  ContentText: "${contentText.replace(/\n/g, '\\n')}"\n` +
            `  Button1:     "${button1}"\n` +
            `  Button2:     "${button2}"\n` +
            `  Paginate:    prev=${paginatePrev}  next=${paginateNext}\n` +
            `  PrefillVal:  "${prefillValue}"\n` +
            `  Headers[${headers.length}]:  [${headers.join(' | ')}]\n` +
            `  Items[${items.length}]: (следующие строки)`
        );
        // Логируем каждый item отдельной строкой
        items.forEach((item, idx) => {
            debugLog(`  [DLG]   item[${idx}]: "${item}"`);
        });
        debugLog(`[DLG] ════════════════════════════════════════════════`);

        // ── Диалог "Точное время" от /c 60 — не даём попасть в Vue вообще ──────
        if (title === "Точное время" && window._awaitC60Dialog) {
            window._awaitC60Dialog = false;

            // ── Режим «Отыгровка 27 мин»: извлекаем «Время в игре за час» ──
            if (globalState.otygrovkaMode) {
                try {
                    // Собираем все строки: info, contentText, items
                    const allLines = [];
                    if (info)        allLines.push(...info.split('\n'));
                    if (contentText) allLines.push(...contentText.split('\n'));
                    if (items && items.length > 0) allLines.push(...items);

                    // ── Парсим «Время в игре за час» ────────────────────────
                    let timeInHour = null;
                    let initialMinutes = 0;
                    for (const line of allLines) {
                        if (line.includes('Время в игре за час')) {
                            // Строка вида «Время в игре за час: │  │ 0 мин» или «Время в игре за час │ 0 мин»
                            const parts = line.split('│');
                            if (parts.length > 1) {
                                timeInHour = parts[parts.length - 1].trim();
                            } else {
                                const colonIdx = line.indexOf(':');
                                if (colonIdx !== -1) timeInHour = line.substring(colonIdx + 1).trim();
                            }
                            if (timeInHour !== null) {
                                const mMatch = timeInHour.match(/(\d+)/);
                                if (mMatch) initialMinutes = parseInt(mMatch[1], 10);
                            }
                            break;
                        }
                    }

                    // ── Парсим «Текущее время» (реальное, напр. «0:43») ─────
                    let currentRealTime = null;
                    for (const line of allLines) {
                        if (line.includes('Текущее время') && !line.includes('Время в игре')) {
                            const parts = line.split('│');
                            if (parts.length > 1) {
                                currentRealTime = parts[parts.length - 1].trim();
                            } else {
                                const colonIdx = line.indexOf(':');
                                if (colonIdx !== -1) currentRealTime = line.substring(colonIdx + 1).trim();
                            }
                            break;
                        }
                    }

                    globalState.otygrovkaTimeInHour  = timeInHour;
                    globalState.otygrovkaCurrentTime = currentRealTime;

                    const msgParts = [
                        `🎭 <b>Отыгровка 27 мин — ${displayName}</b>`,
                        `🕐 Текущее время: <b>${currentRealTime || '—'}</b>`,
                        `⏱ Время в игре за час: <b>${timeInHour !== null ? timeInHour : 'не определено'}</b>`,
                    ];

                    // Если авто-режим — запускаем трекинг
                    if (globalState.otygrovkaAuto) {
                        const remaining = 27 - initialMinutes;
                        if (remaining <= 0) {
                            msgParts.push(`✅ Уже ≥27 мин — планируем выход в :59:20`);
                        } else {
                            msgParts.push(`▶️ Трекинг запущен: нужно ещё ~${remaining} мин`);
                        }
                        sendToTelegram(msgParts.join('\n'), false, null);
                        // Запускаем трекинг с начальным значением из диалога
                        startOtygrovkaTracking(initialMinutes);
                    } else {
                        // Просто информационный режим (без авто-цикла)
                        sendToTelegram(msgParts.join('\n'), false, null);
                    }

                    debugLog(`[OTYGROVKA] Время за час: ${timeInHour} (${initialMinutes} мин), реальное время: ${currentRealTime}`);
                } catch (e) {
                    debugLog(`[OTYGROVKA] Ошибка парсинга времени: ${e.message}`);
                }
                // После считывания флаг ожидания диалога сбрасывается — c 60 был один раз
                globalState.otygrovkaMode = false;
            }
            // ── END Отыгровка ──────────────────────────────────────────────────

            // Отвечаем серверу напрямую (response=0 = закрыть)
            dlgRespond(dialogId, 0, -1, '');
            dlgClose(false);
            debugLog('[DLG] "Точное время" — ответ серверу без показа диалога');
            return; // НЕ вызываем _dlgOrigAddDialogInQueue — диалог не попадает в Vue
        }
        // ── END ────────────────────────────────────────────────────────────────

        // ── Пропускаем /find диалог, если идёт проверка выговоров ──────────────
        if (window._warnCheckActive &&
            style === DIALOG_STYLE.TABLIST_HEADERS &&
            /в игре/i.test(title)) {
            debugLog('[DLG] /find диалог пропущен — проверка выговоров активна (Telegram не нужен)');
            return _dlgOrigAddDialogInQueue.call(this, dialogParams, content, priority);
        }
        // ── END /find skip ──────────────────────────────────────────────────────

        // ── Авто-закрытие диалога "Время на авторизацию ограничено" ───────────
        // Появляется когда висим на экране авторизации и время истекло.
        // Закрываем ТОЛЬКО если autoLoginConfig.enabled=false — т.е. мы сами
        // намеренно ушли на авторизацию (строй, отыгровка, ручной выход и т.д.)
        // Если autoLogin включён — диалог пришёл в неожиданный момент, не трогаем.
        if (style === DIALOG_STYLE.MSGBOX &&
            _dlgAllText.includes('авторизацию ограничено') &&
            !autoLoginConfig.enabled) {
            debugLog('[DLG] ⚡ Авто-закрытие: диалог авторизации (тайм-аут, autoLogin=ВЫКЛ) — Vue/Telegram пропущены');
            try { dlgRespond(dialogId, 1, -1, ''); } catch(e) {}  // Симулируем нажатие "Закрыть"
            dlg.active = false;
            dlg.tgMsgs = [];
            try { window.closeLastDialog(); } catch(e) {}
            return; // НЕ вызываем _dlgOrigAddDialogInQueue — диалог не попадает в Vue
        }
        // ── END авто-закрытие авторизации ─────────────────────────────────────

        dlgSendToTelegram();

    } catch (err) {
        debugLog(`[DLG] Ошибка перехвата addDialogInQueue: ${err.message}`);
    }

    return _dlgOrigAddDialogInQueue.call(this, dialogParams, content, priority);
};

// ── Хук sendClientEvent — фиксируем закрытие диалогов из игры ─
// Сохраняем ОРИГИНАЛЬНЫЙ sendClientEvent ДО любых замен
const _dlgOrigSendClientEvent = sendClientEvent;

// FIX: сохраняем оригинал sendClientEventCustom до первого патча.
// hassleCleanupHooks() восстановит его перед каждой перезагрузкой.
if (typeof window.sendClientEventCustom === 'function' && !window._hassleOrig_sendClientEventCustom) {
    window._hassleOrig_sendClientEventCustom = window.sendClientEventCustom;
}
const _dlgOrigSCE = window._hassleOrig_sendClientEventCustom || window.sendClientEventCustom;
window.sendClientEventCustom = function(event, ...args) {
    if (args[0] === 'OnDialogResponse') {
        const respondedId = parseInt(args[1]);
        if ((respondedId < DLG_HB_MIN || respondedId > DLG_HB_MAX) &&
            dlg.active && dlg.dialogId === respondedId) {
            // Игрок сам ответил в игре — закрываем без Telegram-уведомления
            dlgClose(false);
        }
    }
    // Безопасный вызов оригинала — используем сохранённый sendClientEvent
    if (typeof _dlgOrigSCE === 'function') {
        return _dlgOrigSCE.call(this, event, ...args);
    }
    return _dlgOrigSendClientEvent.call(this, event, ...args);
};
// FIX: обновляем глобальный sendClientEvent чтобы хук закрытия диалога работал.
// Рекурсии нет — внутри хука используется _dlgOrigSendClientEvent, а не sendClientEvent.
sendClientEvent = window.sendClientEventCustom;

// ── Обработчик Telegram-коллбэков ────────────────────────────

function handleDialogTgCallback(data, chatId, messageId, callbackQueryId) {
    const uid = uniqueId;

    if (!dlg.active && !data.startsWith(`dlg_noop_`)) {
        sendToTelegram(
            `⚠️ <b>Нет активного диалога (${displayName})</b>\n` +
            `<i>Диалог уже закрыт или ещё не открыт</i>`,
            false, null);
        return; // answerCallbackQuery уже вызван выше в processUpdates
    }

    // ── Button1 ───────────────────────────────────────────────
    if (data.startsWith(`dlg_btn1_${uid}`)) {
        const btn = dlg.button1;
        // FIX: listitem=-1 для не-списочных диалогов (как делает Window.js)
        dlgRespond(dlg.dialogId, 1, -1, '');
        sendToTelegram(`✅ <b>«${dlgHtml(btn)}» нажата (${displayName})</b>`, false, null);
        dlgClose();

    // ── Button2 (отмена) ──────────────────────────────────────
    } else if (data.startsWith(`dlg_btn2_${uid}`)) {
        const btn = dlg.button2 || 'Назад';
        // FIX: listitem=-1 для отмены (как делает Window.js)
        dlgRespond(dlg.dialogId, 0, -1, '');
        sendToTelegram(`❌ <b>«${dlgHtml(btn)}» нажата (${displayName})</b>`, false, null);
        dlgClose();

    // ── Выбор элемента списка ─────────────────────────────────
    } else if (data.startsWith(`dlg_item_`)) {
        const match = data.match(/^dlg_item_(\d+)_/);
        if (match) {
            const idx      = parseInt(match[1]);
            const itemName = dlg.items[idx] || '';
            // FIX v2: idx уже правильный listitem (заголовок отделён при парсинге)
            dlgRespond(dlg.dialogId, 1, idx, itemName);
            sendToTelegram(
                `✅ <b>Выбран пункт ${idx + 1}: «${dlgHtml(itemName.substring(0, 60))}» (${displayName})</b>`,
                false, null);
            dlgClose();
        }

    // ── Клиентская пагинация (внутри одного вызова диалога) ───
    } else if (data.startsWith(`dlg_page_`)) {
        const match = data.match(/^dlg_page_(\d+)_/);
        if (match) {
            dlg.page = parseInt(match[1]);
            dlgUpdateTelegram();
        }

    // ── v2.1: Серверная пагинация ◀️ — предыдущая страница ───
    } else if (data.startsWith(`dlg_srv_prev_${uid}`)) {
        dlgSrvPaginate(0);
        dlgClose(false); // сервер пришлёт новый диалог через addDialogInQueue

    // ── v2.1: Серверная пагинация ▶️ — следующая страница ────
    } else if (data.startsWith(`dlg_srv_next_${uid}`)) {
        dlgSrvPaginate(1);
        dlgClose(false); // сервер пришлёт новый диалог через addDialogInQueue

    // ── Запрос ввода текста (INPUT / PASSWORD) ────────────────
    } else if (data.startsWith(`dlg_input_${uid}`)) {
        // FIX v2: Проверяем активность диалога
        if (!dlg.active) {
            sendToTelegram(
                `⚠️ <b>Диалог уже закрыт, ввод недоступен (${displayName})</b>`,
                false, null);
            return; // answerCallbackQuery уже вызван выше в processUpdates
        }

        dlg.awaitingInput = true;
        const isPass = dlg.style === DIALOG_STYLE.PASSWORD;
        const prompt =
            `✉️ ${isPass ? 'Введите пароль' : 'Введите текст'} для диалога ` +
            `<b>"${dlgHtml(dlg.title)}"</b> (${displayName}):\n` +
            `🔑 DLG_UID: ${uid}`;

        sendToTelegram(prompt, false, { force_reply: true });

    // ── Noop (счётчик страниц) ────────────────────────────────
    } else if (data.startsWith(`dlg_noop_${uid}`)) {
        // Ничего не делаем
    }
    // answerCallbackQuery уже вызван выше в processUpdates
}

// ── Обёртка processUpdates ────────────────────────────────────

const _dlgOrigProcessUpdates = processUpdates;

processUpdates = function(updates) {
    const passThrough = [];

    for (const update of updates) {
        let consumed = false;

        let updateChatId = null;
        if (update.message)             updateChatId = update.message.chat.id;
        else if (update.callback_query) updateChatId = update.callback_query.message.chat.id;

        if (updateChatId && !config.chatIds.includes(String(updateChatId))) {
            passThrough.push(update);
            continue;
        }

        // ── Текстовые сообщения: ввод для диалога ──────────────
        if (update.message && !consumed) {
            const msgText   = update.message.text ? update.message.text.trim() : '';
            const msgChatId = update.message.chat.id;

            /** Вспомогательная функция отправки ввода в диалог */
            function processDlgInput(text) {
                dlg.awaitingInput = false;

                // FIX v2: Проверяем активность диалога перед ответом
                if (dlg.active && dlg.dialogId !== null) {
                    dlgRespond(dlg.dialogId, 1, 0, text);
                    sendToTelegram(
                        `✅ <b>Текст отправлен в диалог (${displayName}):</b>\n` +
                        `<code>${dlgHtml(text)}</code>`,
                        false, null);
                    dlgClose();
                } else {
                    sendToTelegram(
                        `⚠️ <b>Диалог уже закрыт, текст не отправлен (${displayName})</b>\n` +
                        `<i>Возможно, диалог закрылся до получения ответа</i>`,
                        false, null);
                    dlg.awaitingInput = false;
                    dlgClose(false);
                }

                config.lastUpdateId = update.update_id;
                setSharedLastUpdateId(config.lastUpdateId);
            }

            // Вариант 1: стандартный reply (Android/Desktop)
            if (update.message.reply_to_message && msgText && dlg.awaitingInput) {
                const replyText = update.message.reply_to_message.text || '';
                if (replyText.includes(`DLG_UID: ${uniqueId}`)) {
                    processDlgInput(msgText);
                    consumed = true;
                }
            }

        }

        // ── Callback-query: dlg_* ───────────────────────────────
        if (!consumed && update.callback_query) {
            const cbData      = update.callback_query.data;
            const cbChatId    = update.callback_query.message.chat.id;
            const cbMessageId = update.callback_query.message.message_id;
            const cbQueryId   = update.callback_query.id;

            if (cbData.startsWith('dlg_')) {
                const isOurs =
                    cbData.endsWith(`_${uniqueId}`) ||
                    cbData.includes(`_${uniqueId}_`);

                if (isOurs) {
                    handleDialogTgCallback(cbData, cbChatId, cbMessageId, cbQueryId);
                } else {
                    answerCallbackQuery(cbQueryId);
                }

                config.lastUpdateId = update.update_id;
                setSharedLastUpdateId(config.lastUpdateId);
                consumed = true;
            }
        }

        if (!consumed) passThrough.push(update);
    }

    if (passThrough.length > 0) {
        _dlgOrigProcessUpdates(passThrough);
    }
};

debugLog('[DLG] Dialog Monitor v2.1 загружен. Полный лог + серверная пагинация ◀️/▶️.');
// ==================== END DIALOG MONITOR MODULE v2 ====================
// ==================== END DIALOG MONITOR MODULE v2 ====================

// ╔══════════════════════════════════════════════════════════╗
// ║  MODULE: ЗАВОД — авто-производство на заводе             ║
// ║  Описание: Перехватывает команды /zon и /zoff в чате     ║
// ║             игры (не Telegram). В режиме ВКЛ:            ║
// ║             1) автоматически нажимает кнопку             ║
// ║                «Начать производство» при её появлении     ║
// ║             2) автоматически заполняет интерфейс         ║
// ║                токарного станка (Turner) по максимуму    ║
// ║  Зависимости: debugLog, window.openInterface,            ║
// ║               window.sendChatInput                       ║
// ╚══════════════════════════════════════════════════════════╝
// START ZAVOD MODULE //
(function () {
    'use strict';

    // ── Состояние модуля ───────────────────────────────────────
    const zavod = {
        active: false,        // Режим включён?
        prodInterval: null,   // Таймер поиска кнопки «Начать производство»
        turnerInterval: null, // Таймер заполнения Turner
        domObserver: null,    // MutationObserver для появления Turner в DOM
    };

    // ── Хук sendChatInput — перехват /zon и /zoff ─────────────
    // Команды набираются в чате игры (не в Telegram):
    //   /zon  → включить авто-завод
    //   /zoff → выключить авто-завод
    const _origChat = window.sendChatInput;
    window.sendChatInput = function (input) {
        if (typeof input === 'string') {
            const cmd = input.trim().toLowerCase();
            if (cmd === '/zon')  { _zavodOn();  return; } // не отправляем в игру
            if (cmd === '/zoff') { _zavodOff(); return; }
        }
        return typeof _origChat === 'function' ? _origChat.apply(this, arguments) : undefined;
    };

    // ── Хук openInterface — ловим открытие Turner и Interactions ─
    const _origOpen         = window.openInterface;
    const _origSetCursor    = window.setCursorStatus; // сохраняем заранее, один раз
    window.openInterface = function (name) {

        // ════════════════════════════════════════════════════════════
        //  PRE-CALL БЛОК — всё ниже выполняется ДО _origOpen(),
        //  потому что именно во время его выполнения движок скрывает
        //  HUD и блокирует движение игрока.
        // ════════════════════════════════════════════════════════════
        let _hudVm                = null;
        let _savedHideHud         = null;
        let _savedHideChat        = null;
        let _cursorPatched        = false;

        if (zavod.active && name === 'Turner') {

            // ── 1. Перехватываем setCursorStatus ─────────────────────
            // Движок вызывает setCursorStatus(X, true) при открытии
            // интерфейса — это блокирует WASD/мышь/камеру игрока.
            // Временно подменяем: пропускаем любой вызов с true,
            // чтобы игра не знала, что у нас открыт UI с курсором.
            window.setCursorStatus = function (type, status) {
                if (status === true || status === 1) {
                    debugLog('[ЗАВОД] 🛡️ setCursorStatus("' + type + '", true) — заблокирован');
                    return; // не передаём в игру — движение сохраняется
                }
                return typeof _origSetCursor === 'function'
                    ? _origSetCursor.apply(this, arguments)
                    : undefined;
            };
            _cursorPatched = true;
            debugLog('[ЗАВОД] 🛡️ setCursorStatus патч активен');

            // ── 2. Перехватываем manualHideHud / manualHideChat ──────
            // Движок (или его JS-обёртка) вызывает эти методы прямо на
            // Vue-прокси HUD-компонента, добавляя класс hud-iface-hidden
            // (opacity:0; visibility:hidden; pointer-events:none).
            // Подменяем методы на no-op до вызова _origOpen.
            try {
                _hudVm = typeof window.interface === 'function'
                    ? window.interface('Hud')
                    : null;
                if (_hudVm) {
                    _savedHideHud  = _hudVm.manualHideHud;
                    _savedHideChat = _hudVm.manualHideChat;

                    _hudVm.manualHideHud  = function () {
                        debugLog('[ЗАВОД] 🛡️ manualHideHud() заблокирован');
                    };
                    _hudVm.manualHideChat = function () {
                        debugLog('[ЗАВОД] 🛡️ manualHideChat() заблокирован');
                    };
                    debugLog('[ЗАВОД] 🛡️ HUD-методы патч активен');
                }
            } catch (e) {
                debugLog('[ЗАВОД] Ошибка патча HUD-методов: ' + e.message);
            }

            // ── 3. Восстанавливаем всё через 600ms ───────────────────
            // Turner к этому моменту уже закрыт (150-200ms).
            // Восстановление нужно чтобы Chat/другие интерфейсы
            // продолжали работать корректно.
            setTimeout(function () {
                // Cursor
                if (_cursorPatched) {
                    window.setCursorStatus = _origSetCursor;
                    _cursorPatched = false;
                    debugLog('[ЗАВОД] ✅ setCursorStatus восстановлен');
                }
                // HUD-методы
                try {
                    const hudNow = typeof window.interface === 'function'
                        ? window.interface('Hud')
                        : null;
                    if (hudNow) {
                        if (_savedHideHud)  hudNow.manualHideHud  = _savedHideHud;
                        if (_savedHideChat) hudNow.manualHideChat = _savedHideChat;
                        debugLog('[ЗАВОД] ✅ HUD-методы восстановлены');
                    }
                } catch (e) {}
            }, 600);
        }
        // ════════════════════════════════════════════════════════════
        //  END PRE-CALL БЛОК
        // ════════════════════════════════════════════════════════════

        const result = typeof _origOpen === 'function' ? _origOpen.apply(this, arguments) : undefined;

        if (zavod.active && name === 'Turner') {
            debugLog('[ЗАВОД] openInterface("Turner") → невидимый, HUD/чат/движение сохранены');

            // ── 4. Скрываем .turner через opacity ────────────────────
            // Используем opacity (не display:none) — Vue-компонент должен
            // оставаться живым для корректной эмиссии событий прогресса.
            // Серия попыток: DOM рендерится асинхронно.
            var _turnerHidden = false;
            [0, 16, 32, 80, 150].forEach(function (delay) {
                setTimeout(function () {
                    if (_turnerHidden) return;
                    const el = document.querySelector('.turner');
                    if (el) {
                        el.style.setProperty('opacity',        '0',    'important');
                        el.style.setProperty('pointer-events', 'none', 'important');
                        el.style.setProperty('background',     'none', 'important');
                        _turnerHidden = true;
                        debugLog('[ЗАВОД] 🙈 .turner скрыт (opacity:0)');
                    }
                }, delay);
            });

            // ── 5. Turner_OnPlayerEnd → следующий тик (~1ms) ─────────
            // Turner.js watch: { progress(t) { t>=100 && sendClientEvent(...,"Turner_OnPlayerEnd") } }
            // Стреляем напрямую — не ждём Vue-watcher.
            setTimeout(function () {
                try {
                    if (typeof sendClientEvent === 'function' && typeof gm !== 'undefined') {
                        sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, 'Turner_OnPlayerEnd');
                        debugLog('[ЗАВОД] ✅ Turner_OnPlayerEnd → мгновенно (~1ms)');
                    }
                } catch (e) {
                    debugLog('[ЗАВОД] Ошибка Turner_OnPlayerEnd: ' + e.message);
                    _scheduleTurnerFill(0); // резерв: найти компонент и заполнить
                }
            }, 0);

            // ── 6. Принудительное закрытие если сервер не закрыл ─────
            setTimeout(function () {
                try {
                    const stillOpen = typeof window.getInterfaceStatus === 'function'
                        ? window.getInterfaceStatus('Turner')
                        : document.querySelector('.turner');
                    if (stillOpen) {
                        window.closeInterface('Turner');
                        debugLog('[ЗАВОД] 🔒 Turner закрыт принудительно');
                    }
                } catch (e) {}
            }, 200);
        }

        // ── Авто-клик «Начать производство» (тип 399) при /zon ───────
        // Работает точно так же, как авто-клик «Выключить анимацию» (тип 75):
        // получаем Vue-прокси Interactions и вызываем onClick(idx).
        if (zavod.active && name === 'Interactions') {
            const params = arguments[1];
            try {
                let list = [];
                if (params) {
                    const parsed = (typeof params === 'object') ? params : JSON.parse(params);
                    for (const key in parsed) {
                        list.push({ type: parsed[key][0], title: parsed[key][1] });
                    }
                }
                const prodItem = list.find(function (item) { return item.type === 399; });
                if (prodItem) {
                    const prodIdx = list.indexOf(prodItem);
                    debugLog('[ЗАВОД] 🔘 Авто-клик "' + prodItem.title + '" (тип 399)');
                    setTimeout(function () {
                        try {
                            const iface = window.interface('Interactions');
                            if (iface && typeof iface.onClick === 'function') {
                                iface.onClick(prodIdx);
                                debugLog('[ЗАВОД] ✅ onClick("Начать производство") выполнен');
                            } else {
                                sendClientEvent(
                                    window.gm ? window.gm.EVENT_EXECUTE_PUBLIC : 0,
                                    'OnInteractionsClick', prodItem.type
                                );
                                debugLog('[ЗАВОД] ✅ sendClientEvent (fallback) выполнен');
                            }
                        } catch (e2) {
                            debugLog('[ЗАВОД] Ошибка авто-клика: ' + e2.message);
                        }
                    }, 80);
                }
            } catch (e) {
                debugLog('[ЗАВОД] Ошибка парсинга Interactions params: ' + e.message);
            }
        }
        // ── END Авто-клик «Начать производство» ──────────────────────

        return result;
    };

    // ─────────────────────────────────────────────────────────
    //  ВКЛ / ВЫКЛ
    // ─────────────────────────────────────────────────────────

    // Уведомление в чат + автоудаление через 3 сек (как _notifyToggle в fkonst.js)
    function _notifyZavod(on) {
        if (typeof window.onChatMessage !== 'function') return;
        if (on) {
            window.onChatMessage('{999999}ЗАВОД — {33DD77}Включён', '999999FF');
        } else {
            window.onChatMessage('{999999}ЗАВОД — {EE4444}Выключён', '999999FF');
        }
        setTimeout(function () {
            try {
                const hud = window.interface('Hud');
                if (!hud || !hud.$refs || !hud.$refs.chat) return;
                const chat = hud.$refs.chat;
                if (!Array.isArray(chat.messages)) return;
                chat.messages = chat.messages.filter(function (m) {
                    if (!m.content) return true;
                    return !m.content.some(function (c) {
                        return c.text && c.text.includes('ЗАВОД —');
                    });
                });
            } catch (_) { /* тихо */ }
        }, 3000);
    }

    function _zavodOn() {
        if (zavod.active) { debugLog('[ЗАВОД] уже включён'); return; }
        zavod.active = true;
        debugLog('[ЗАВОД] ✅ Авто-завод ВКЛЮЧЁН  (выключить: /zoff)');
        _notifyZavod(true);
        _startProductionPoller(); // поиск кнопки «Начать производство»
        _startDOMObserver();      // слежение за появлением Turner в DOM
    }

    function _zavodOff() {
        zavod.active = false;
        if (zavod.prodInterval)   { clearInterval(zavod.prodInterval);   zavod.prodInterval = null; }
        if (zavod.turnerInterval) { clearInterval(zavod.turnerInterval); zavod.turnerInterval = null; }
        if (zavod.domObserver)    { zavod.domObserver.disconnect();       zavod.domObserver = null; }
        debugLog('[ЗАВОД] ⛔ Авто-завод ВЫКЛЮЧЕН');
        _notifyZavod(false);
    }

    // ─────────────────────────────────────────────────────────
    //  1) АВТО-НАЖАТИЕ «Начать производство»
    // ─────────────────────────────────────────────────────────
    function _startProductionPoller() {
        if (zavod.prodInterval) clearInterval(zavod.prodInterval);
        zavod.prodInterval = setInterval(function () {
            if (!zavod.active) return;
            _tryClickProduction();
        }, 600);
    }

    function _tryClickProduction() {
        // Ищем листовой DOM-элемент с нужным текстом (без вложенных тегов)
        const all = document.querySelectorAll('*');
        for (const el of all) {
            if (el.childElementCount === 0 &&
                el.textContent.trim() === 'Начать производство' &&
                _isVisible(el)) {
                debugLog('[ЗАВОД] 🔘 Нажимаем "Начать производство"');
                // Кликаем сам элемент и несколько его родителей (на случай обёрток)
                let cur = el;
                for (let i = 0; i < 6; i++) {
                    cur.click();
                    cur.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
                    if (!cur.parentElement || cur.parentElement === document.body) break;
                    cur = cur.parentElement;
                }
                return;
            }
        }
    }

    function _isVisible(el) {
        if (!el) return false;
        try {
            const r = el.getBoundingClientRect();
            if (r.width === 0 && r.height === 0) return false;
            const s = getComputedStyle(el);
            return s.display !== 'none' &&
                   s.visibility !== 'hidden' &&
                   parseFloat(s.opacity || '1') > 0;
        } catch (e) { return false; }
    }

    // ─────────────────────────────────────────────────────────
    //  2) DOM OBSERVER — Turner появился в DOM
    // ─────────────────────────────────────────────────────────
    function _startDOMObserver() {
        if (zavod.domObserver) zavod.domObserver.disconnect();
        zavod.domObserver = new MutationObserver(function (mutations) {
            if (!zavod.active) return;
            for (const m of mutations) {
                for (const node of m.addedNodes) {
                    if (node.nodeType !== 1) continue;
                    // Сам узел — turner или его потомок
                    const hasTurner =
                        (node.classList && (node.classList.contains('turner') ||
                                            node.classList.contains('turner-machine'))) ||
                        (node.querySelector && (node.querySelector('.turner-machine') ||
                                                node.querySelector('.turner')));
                    if (hasTurner) {
                        debugLog('[ЗАВОД] Turner обнаружен в DOM → запускаем заполнение');
                        _scheduleTurnerFill(80);
                        return;
                    }
                }
            }
        });
        zavod.domObserver.observe(document.body, { childList: true, subtree: true });
    }

    // ─────────────────────────────────────────────────────────
    //  3) АВТО-ЗАПОЛНЕНИЕ TURNER
    // ─────────────────────────────────────────────────────────
    function _scheduleTurnerFill(delayMs) {
        setTimeout(function () {
            if (!zavod.active) return;
            if (zavod.turnerInterval) clearInterval(zavod.turnerInterval);
            let tries = 0;
            zavod.turnerInterval = setInterval(function () {
                tries++;
                if (!zavod.active || tries > 30) {
                    clearInterval(zavod.turnerInterval);
                    zavod.turnerInterval = null;
                    if (tries > 30) debugLog('[ЗАВОД] ⚠️ Turner: компонент не найден за 3 сек');
                    return;
                }
                if (_tryFillTurner()) {
                    clearInterval(zavod.turnerInterval);
                    zavod.turnerInterval = null;
                    debugLog('[ЗАВОД] ✅ Turner успешно заполнен!');
                }
            }, 80);
        }, delayMs);
    }

    function _tryFillTurner() {
        // ── Способ A: div.turner-machine → Vue-прокси компонента ──
        const machineEl = document.querySelector('.turner-machine');
        if (machineEl) {
            const vm = _getVueProxy(machineEl);
            if (vm) {
                if (_isTurnerMachineVm(vm)) { _fillTurnerMachine(vm); return true; }
                // Ищем дочерний TurnerMachine во vnode-дереве (Vue 3)
                const child = vm.$ && vm.$.subTree
                    ? _findVmInVnodes(vm.$.subTree, _isTurnerMachineVm)
                    : null;
                if (child) { _fillTurnerMachine(child); return true; }
            }
        }

        // ── Способ B: window.interface('Turner') ──────────────────
        try {
            const ti = typeof window.interface === 'function' && window.interface('Turner');
            if (ti) {
                if (_isTurnerMachineVm(ti)) { _fillTurnerMachine(ti); return true; }
                const child = ti.$ && ti.$.subTree
                    ? _findVmInVnodes(ti.$.subTree, _isTurnerMachineVm)
                    : null;
                if (child) { _fillTurnerMachine(child); return true; }
            }
        } catch (e) {}

        // ── Способ C: через canvas-элементы → ищем .turner-machine ─
        const canvases = document.querySelectorAll('canvas.turner-machine-canvas');
        for (const c of canvases) {
            let ancestor = c.parentElement;
            while (ancestor && !ancestor.classList.contains('turner-machine')) {
                ancestor = ancestor.parentElement;
            }
            if (ancestor) {
                const vm = _getVueProxy(ancestor);
                if (vm && _isTurnerMachineVm(vm)) {
                    _fillTurnerMachine(vm);
                    return true;
                }
            }
        }

        return false; // компонент ещё не готов — retry
    }

    // Получаем публичный прокси Vue-компонента по DOM-элементу
    function _getVueProxy(el) {
        if (!el) return null;
        // Vue 3: __vueParentComponent установлен на корневом элементе компонента
        if (el.__vueParentComponent) {
            return el.__vueParentComponent.proxy || el.__vueParentComponent.ctx || null;
        }
        // Vue 2 / некоторые сборки Vue 3
        if (el.__vue__) return el.__vue__;
        return null;
    }

    // Является ли vm компонентом TurnerMachine?
    function _isTurnerMachineVm(vm) {
        return !!(vm &&
                  vm.currentFigure &&
                  Array.isArray(vm.currentFigure.rects) &&
                  typeof vm.changeProgress === 'function');
    }

    // Рекурсивный обход vnode-дерева Vue 3
    function _findVmInVnodes(vnode, predicate) {
        if (!vnode) return null;
        // Vnode — компонент
        if (vnode.component) {
            const proxy = vnode.component.proxy || vnode.component.ctx;
            if (predicate(proxy)) return proxy;
            // Углубляемся в subTree компонента
            const r = _findVmInVnodes(vnode.component.subTree, predicate);
            if (r) return r;
        }
        // Дочерние vnode (статические и динамические)
        const children = vnode.children;
        if (Array.isArray(children)) {
            for (const ch of children) {
                if (ch && typeof ch === 'object') {
                    const r = _findVmInVnodes(ch, predicate);
                    if (r) return r;
                }
            }
        }
        if (Array.isArray(vnode.dynamicChildren)) {
            for (const ch of vnode.dynamicChildren) {
                const r = _findVmInVnodes(ch, predicate);
                if (r) return r;
            }
        }
        return null;
    }

    // Заполняем все прямоугольники TurnerMachine
    function _fillTurnerMachine(vm) {
        const rects = vm.currentFigure.rects;
        debugLog('[ЗАВОД] 🎨 Заполняем ' + rects.length + ' прямоугольников токарного станка...');

        // 1) Устанавливаем прогресс всех секций = 1 через Vue-метод
        //    (обновляет vm.progress[] и эмитит total% в outer Turner)
        for (let i = 0; i < rects.length; i++) {
            try {
                vm.changeProgress(i, 1);
            } catch (e) {
                debugLog('[ЗАВОД] Ошибка changeProgress(' + i + '): ' + e.message);
            }
        }

        // 2) Мгновенная визуальная заливка canvas белым
        document.querySelectorAll('canvas.turner-machine-canvas').forEach(function (c) {
            try {
                const ctx = c.getContext('2d');
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, c.width, c.height);
            } catch (e) {}
        });

        // 3) Напрямую отправляем Turner_OnPlayerEnd — не ждём Vue-watcher.
        //    Turner.js: watch { progress(t) { t>=100 && sendClientEvent(...,"Turner_OnPlayerEnd") } }
        //    Этот watcher — flush:'pre' (асинхронный). Обходим его, стреляем сами.
        setTimeout(function () {
            try {
                if (typeof sendClientEvent === 'function' && typeof gm !== 'undefined') {
                    sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, 'Turner_OnPlayerEnd');
                    debugLog('[ЗАВОД] ✅ Turner_OnPlayerEnd отправлен напрямую');
                }
            } catch (e) {
                debugLog('[ЗАВОД] Ошибка Turner_OnPlayerEnd: ' + e.message);
            }
        }, 80);

        // 4) Закрываем интерфейс, если сервер не закрыл сам
        //    Turner.js close(): sendClientEvent(...,"Turner_OnPlayerClose") + closeInterface("Turner")
        //    После Turner_OnPlayerEnd сервер обычно закрывает сам, но на всякий случай — страховка
        setTimeout(function () {
            try {
                const stillOpen = typeof window.getInterfaceStatus === 'function'
                    ? window.getInterfaceStatus('Turner')
                    : document.querySelector('.turner');
                if (stillOpen) {
                    window.closeInterface('Turner');
                    debugLog('[ЗАВОД] 🔒 Turner принудительно закрыт (сервер не закрыл)');
                }
            } catch (e) {}
        }, 500);
    }

    debugLog('[ЗАВОД] Модуль загружен | /zon — включить | /zoff — выключить');

})();
// ==================== END ZAVOD MODULE ====================
// Code2.js — продолжение Code.js в отдельном файле
// eval'ится изнутри Code.js — имеет доступ ко всем его переменным напрямую


// Code2.js — продолжение Code.js в отдельном файле
// eval'ится изнутри Code.js — имеет доступ ко всем его переменным напрямую


// Code2.js — продолжение Code.js в отдельном файле
// eval'ится изнутри Code.js — имеет доступ ко всем его переменным напрямую


// ╔══════════════════════════════════════════════════════════════╗
// ║  MODULE: FRIEND TRACKER v2                                   ║
// ║  Описание: Отслеживание входа друзей.                       ║
// ║             При появлении ника в списке онлайн —            ║
// ║             уведомление в Telegram.                          ║
// ║                                                              ║
// ║  Команды в ЧАТЕ ИГРЫ:                                       ║
// ║    /check <ник>   — добавить в слежение                     ║
// ║    /uncheck <ник> — убрать из слежения                      ║
// ║    /checklist     — список онлайн → Telegram                ║
// ║                                                              ║
// ║  Команды в TELEGRAM:                                        ║
// ║    /check_Иван_Петров  или  /check Иван Петров              ║
// ║    /uncheck_Иван_Петров или  /uncheck Иван Петров           ║
// ║    /checklist                                                ║
// ║                                                              ║
// ║  КАНАЛЫ ДАННЫХ (все три работают одновременно):             ║
// ║                                                              ║
// ║  1. window.onUpdatePlayersList                              ║
// ║     Глобальный колбэк движка. Срабатывает когда кто-то     ║
// ║     вызывает window.updatePlayerList(). Данные приходят     ║
// ║     БЕЗ поля level на Hassle. Ловит присутствие/отсутствие.║
// ║                                                              ║
// ║  2. window.interface('PlayersOnline') Proxy                 ║
// ║     Перехватывает setPlayersOnlineData / setInterfaceParams  ║
// ║     на уровне window.interface(). Данные приходят С полем   ║
// ║     level — это единственный источник level на Hassle.      ║
// ║                                                              ║
// ║  FIX (Hassle mobile): раньше прокси возвращал inst=false   ║
// ║  (компонент не смонтирован) и крашился на false.method.     ║
// ║  Теперь прокси ВСЕГДА возвращает валидный объект — даже     ║
// ║  когда PlayersOnline не открыт. Движок вызывает             ║
// ║  setPlayersOnlineData() напрямую, мы перехватываем.         ║
// ║                                                              ║
// ║  3. Авто-опрос window.updatePlayerList()                    ║
// ║     Вызываем каждые 1 сек пока watchList не пуст.           ║
// ║     Даёт быстрое обнаружение входа/выхода через Канал 1     ║
// ║     (без level, но с именем — этого достаточно для выхода). ║
// ║                                                              ║
// ║  Зависимости: sendToTelegram, debugLog, config,             ║
// ║               displayName, processUpdates,                  ║
// ║               setSharedLastUpdateId                         ║
// ║                                                              ║
// ║  Детект авторизации: lastLevel (level 0 → >0)              ║
// ║  Level поступает только через Канал 2 (PlayersOnline Proxy).║
// ╚══════════════════════════════════════════════════════════════╝

// ==================== FRIEND TRACKER MODULE ====================
(function () {
    'use strict';

    // ── Состояние модуля ───────────────────────────────────────
    const ft = {
        watchList:    new Set(), // нормализованные ники под наблюдением
        onlineNow:    new Set(), // кто из них сейчас онлайн (de-dup)
        lastLevel:    {},        // { [watched]: number } — последний известный level (0 = авторизация)
        lastNotifyTs: {},        // когда последний раз слали уведомление
        lastSeenNick: {},        // оригинальный регистр ника (для уведомления о выходе)
        pollTimer:    null,      // ID интервала авто-опроса (канал 3)
    };

    // Cooldown между повторными уведомлениями (защита от флуда)
    const FT_COOLDOWN_MS = 60 * 1000; // 1 минута

    // Частота авто-опроса updatePlayerList() — канал 3.
    // 1 сек: мгновенная реакция на вход/выход друга.
    const FT_POLL_MS = 1 * 1000;


    // ── Нормализация ника ──────────────────────────────────────
    // "Иван_Петров" → "иван петров", "Иван Петров" → "иван петров"
    function _ftNorm(nick) {
        return (nick || '').replace(/_/g, ' ').trim().toLowerCase();
    }

    // ── Сравнение ников (поддерживает частичный ввод) ─────────
    function _ftMatch(playerNick, watched) {
        const pn = _ftNorm(playerNick);
        return pn === watched
            || pn.includes(watched)
            || watched.includes(pn);
    }

    // ── Уведомление в чат игры ────────────────────────────────
    function _ftChatNotify(msg) {
        try {
            if (typeof window.onChatMessage === 'function') {
                window.onChatMessage(
                    `{9999FF}[TRACKER] {FFFFFF}${msg}`,
                    'FFFFFFFF'
                );
            }
        } catch (e) { /* тихо */ }
    }

    // ── Добавить в слежение ───────────────────────────────────
    function _ftAdd(rawNick) {
        const norm = _ftNorm(rawNick);
        if (!norm) return;
        const isNew = !ft.watchList.has(norm);
        ft.watchList.add(norm);

        // Запустить авто-опрос (канал 3) если ещё не запущен
        _ftEnsurePoll();

        const listStr = [...ft.watchList].join(', ') || '—';
        _ftChatNotify(`Слежение: +${rawNick}`);
        sendToTelegram(
            `👁 <b>Слежение добавлено — ${displayName}</b>\n` +
            `🎯 Ник: <code>${rawNick}</code>\n` +
            `📋 Список [${ft.watchList.size}]: ${listStr}`,
            false, null
        );
        debugLog(`[TRACKER] Добавлен: "${norm}" (${isNew ? 'новый' : 'уже был в списке'})`);
    }

    // ── Убрать из слежения ────────────────────────────────────
    function _ftRemove(rawNick) {
        const norm    = _ftNorm(rawNick);
        const existed = ft.watchList.delete(norm);
        ft.onlineNow.delete(norm);
        delete ft.lastNotifyTs[norm];
        delete ft.lastLevel[norm];
        delete ft.lastSeenNick[norm];

        // Если список опустел — останавливаем авто-опрос
        if (!ft.watchList.size) _ftStopPoll();

        if (existed) {
            _ftChatNotify(`Слежение: −${rawNick}`);
            sendToTelegram(
                `🗑 <b>Слежение удалено — ${displayName}</b>\n` +
                `❌ Ник: <code>${rawNick}</code>`,
                false, null
            );
        } else {
            _ftChatNotify(`Не найден в списке: ${rawNick}`);
        }
        debugLog(`[TRACKER] Удалён: "${norm}" (был в списке: ${existed})`);
    }

    // ── Показать список → Telegram ────────────────────────────
    function _ftList() {
        const list = [...ft.watchList];
        if (!list.length) {
            sendToTelegram(
                `👁 <b>Список слежения пуст — ${displayName}</b>\n` +
                `<i>Добавьте ник командой /check Имя_Фамилия</i>`,
                false, null
            );
        } else {
            const rows = list.map((n, i) => {
                const status = ft.onlineNow.has(n) ? ' 🟢 онлайн' : ' ⚫ офлайн';
                return `${i + 1}. <code>${n}</code>${status}`;
            });
            sendToTelegram(
                `👁 <b>Список слежения [${list.length}] — ${displayName}</b>\n` +
                rows.join('\n'),
                false, null
            );
        }
        _ftChatNotify('Список → Telegram');
        debugLog(`[TRACKER] /checklist отправлен (${ft.watchList.size} ников)`);
    }

    // ── Анализ входящих данных ────────────────────────────────
    // Принимает данные из любого канала.
    // Формат (из PlayersOnline.js / onUpdatePlayersList):
    //   JSON-строка или объект:
    //   {
    //     count?: number, serverName?: string,
    //     local:   { id, name, ping, level?, ... },
    //     players: [{ id, name, ping, level?, ... }, ...]
    //   }
    function _ftCheck(rawData) {
        if (!ft.watchList.size) return;

        try {
            const data = (typeof rawData === 'string')
                ? JSON.parse(rawData)
                : rawData;
            if (!data) return;

            // ── Собираем всех игроков из снимка (имя + уровень) ──
            const allPlayers = [];
            if (data.local && data.local.name) {
                allPlayers.push({
                    name:  data.local.name,
                    level: Number(data.local.level) || 0
                });
            }
            if (Array.isArray(data.players)) {
                data.players.forEach(p => {
                    if (p && p.name) allPlayers.push({
                        name:  p.name,
                        level: Number(p.level) || 0
                    });
                });
            }

            const now = Date.now();
            for (const watched of ft.watchList) {
                const matchedPlayer = allPlayers.find(p => _ftMatch(p.name, watched));
                const wasOnline     = ft.onlineNow.has(watched);

                if (matchedPlayer) {
                    // ── Игрок в списке — обновляем регистр ника ──────
                    ft.lastSeenNick[watched] = matchedPlayer.name;
                    const displayNick = matchedPlayer.name.replace(/_/g, ' ');
                    const currLevel   = Number(matchedPlayer.level) || 0;

                    if (!wasOnline) {
                        // ── Новый заход ───────────────────────────────
                        ft.onlineNow.add(watched);
                        ft.lastLevel[watched] = currLevel;
                        const lastTs = ft.lastNotifyTs[watched] || 0;
                        if ((now - lastTs) > FT_COOLDOWN_MS) {
                            ft.lastNotifyTs[watched] = now;
                            if (currLevel === 0) {
                                debugLog(`[TRACKER] 🔐 "${displayNick}" зашёл — авторизация`);
                                _ftChatNotify(`🔐 ${displayNick} зашёл (авторизация)`);
                                sendToTelegram(
                                    `🔐 <b>Игрок зашёл — ${displayName}</b>\n` +
                                    `👤 <code>${displayNick}</code> находится на авторизации`,
                                    false, null
                                );
                            } else {
                                // Редкий случай: появился сразу авторизованным
                                debugLog(`[TRACKER] ✅ "${displayNick}" зашёл — сразу на сервере (level ${currLevel})`);
                                _ftChatNotify(`✅ ${displayNick} зашёл в игру`);
                                sendToTelegram(
                                    `✅ <b>Игрок зашёл — ${displayName}</b>\n` +
                                    `👤 <code>${displayNick}</code> находится на сервере`,
                                    false, null
                                );
                            }
                        } else {
                            debugLog(`[TRACKER] "${watched}" онлайн, но cooldown — не спамим`);
                        }

                    } else {
                        // ── Игрок уже онлайн — проверяем переход level 0 → >0 ──
                        const prevLevel = ft.lastLevel[watched] ?? 0;
                        if (prevLevel === 0 && currLevel > 0) {
                            // ── Авторизовался (level 0 → level > 0) ──
                            ft.lastLevel[watched] = currLevel;
                            debugLog(`[TRACKER] ✅ "${displayNick}" авторизовался на сервере (level ${currLevel})`);
                            _ftChatNotify(`✅ ${displayNick} авторизовался`);
                            sendToTelegram(
                                `✅ <b>Игрок авторизовался — ${displayName}</b>\n` +
                                `👤 <code>${displayNick}</code> находится на сервере`,
                                false, null
                            );
                        } else {
                            // Просто обновляем уровень (без уведомления)
                            // FIX: не перезаписываем level > 0 нулём — Канал 1 на Hassle не несёт level
                            if (currLevel > 0) {
                                ft.lastLevel[watched] = currLevel;
                            }
                            // Если currLevel === 0 — это Канал 1 без данных, не трогаем
                        }
                    }
                    // level > 0 → 0 в норме невозможно, игнорируем

                } else if (wasOnline) {
                    // ── Игрок вышел ──────────────────────────────────
                    ft.onlineNow.delete(watched);
                    delete ft.lastLevel[watched];
                    delete ft.lastNotifyTs[watched]; // сбрасываем cooldown — следующий вход всегда уведомит
                    const rawLeave = ft.lastSeenNick[watched] || watched;
                    delete ft.lastSeenNick[watched];
                    const leaveNick = rawLeave.replace(/_/g, ' ');
                    debugLog(`[TRACKER] 💤 "${leaveNick}" покинул игру`);
                    _ftChatNotify(`💤 ${leaveNick} покинул игру`);
                    sendToTelegram(
                        `💤 <b>Игрок вышел — ${displayName}</b>\n` +
                        `👤 <code>${leaveNick}</code> покинул игру`,
                        false, null
                    );
                }
            }

        } catch (e) {
            debugLog(`[TRACKER] Ошибка _ftCheck: ${e.message}`);
        }
    }


    // ═══════════════════════════════════════════════════════════
    //  КАНАЛ 3: Авто-опрос window.updatePlayerList()
    //
    //  Вызываем updatePlayerList() каждую секунду пока watchList
    //  не пуст. Это даёт быстрое срабатывание Канала 1 (вход/
    //  выход без level). Level приходит отдельно через Канал 2.
    //
    //  Таймер запускается при первом /check и останавливается
    //  когда watchList становится пустым.
    // ═══════════════════════════════════════════════════════════
    function _ftEnsurePoll() {
        if (ft.pollTimer !== null) return; // уже запущен
        ft.pollTimer = setInterval(() => {
            if (!ft.watchList.size) {
                _ftStopPoll();
                return;
            }
            try {
                if (typeof window.updatePlayerList === 'function') {
                    window.updatePlayerList();
                }
            } catch (e) {
                debugLog(`[TRACKER] poll err: ${e.message}`);
            }
        }, FT_POLL_MS);
        debugLog(`[TRACKER] Авто-опрос запущен (каждые ${FT_POLL_MS / 1000} сек)`);
    }

    function _ftStopPoll() {
        if (ft.pollTimer === null) return;
        clearInterval(ft.pollTimer);
        ft.pollTimer = null;
        debugLog('[TRACKER] Авто-опрос остановлен (watchList пуст)');
        // getInterfaceStatus-хук сам перестанет подделывать статус,
        // т.к. проверяет ft.watchList.size > 0
    }


    // ═══════════════════════════════════════════════════════════
    //  КАНАЛ 1: window.onUpdatePlayersList
    //
    //  Движок вызывает этот глобальный колбэк каждый раз когда
    //  кто-то дёрнул window.updatePlayerList():
    //    • PlayersOnline.vue — раз в 1 сек (когда открыт)
    //    • mvdF.js           — раз в 30 сек (всегда)
    //    • Наш авто-опрос   — раз в 1 сек (Канал 3, когда watchList не пуст)
    //
    //  На Hassle: данные приходят БЕЗ поля level.
    //  Level детектируется только через Канал 2.
    // ═══════════════════════════════════════════════════════════
    const _ftOrigOnUpdatePlayers = window.onUpdatePlayersList;
    window.onUpdatePlayersList = function (e) {
        try { _ftCheck(e); } catch (err) {
            debugLog(`[TRACKER] onUpdatePlayersList err: ${err.message}`);
        }
        if (typeof _ftOrigOnUpdatePlayers === 'function') {
            return _ftOrigOnUpdatePlayers.apply(this, arguments);
        }
    };


    // ═══════════════════════════════════════════════════════════
    //  КАНАЛ 2: window.interface('PlayersOnline') Proxy  [FIXED]
    //
    //  КАК РАБОТАЕТ:
    //  Оборачиваем window.interface() в Proxy. При любом вызове
    //  window.interface('PlayersOnline') — независимо от того,
    //  смонтирован компонент или нет — возвращаем прокси-объект,
    //  который перехватывает setPlayersOnlineData и
    //  setInterfaceParams и прогоняет данные через _ftCheck().
    //
    //  ПОЧЕМУ БЫЛ БАГ НА HASSLE MOBILE:
    //  Когда PlayersOnline не открыт, window.interface('PlayersOnline')
    //  возвращает false (не null). Старый код проверял inst == null,
    //  что не ловило false, и следующая строка
    //    typeof inst.setPlayersOnlineData
    //  бросала TypeError — движок замолкал и переставал слать данные.
    //
    //  ЧТО ИСПРАВЛЕНО:
    //  Теперь прокси возвращается ВСЕГДА:
    //    • Если компонент смонтирован (inst — Vue-объект) →
    //      target = inst, методы перехватываются + форвардятся.
    //    • Если не смонтирован (inst = false/null/undefined) →
    //      target = {}, создаём виртуальный таргет.
    //      Hassle-движок вызывает setPlayersOnlineData() на нём,
    //      мы перехватываем данные с level и зовём _ftCheck().
    //
    //  КОГДА РАБОТАЕТ:
    //  • Hassle mobile — PlayersOnline НЕ открыт (основной кейс).
    //  • Hassle/Legacy — PlayersOnline открыт пользователем.
    //  • Любой движок, когда другой скрипт дёргает interface().
    //
    //  КОГДА НЕ РАБОТАЕТ:
    //  • Legacy PC — кэширует ссылку на компонент при старте,
    //    не вызывает window.interface() повторно. Там достаточно
    //    Канала 1 + 3.
    //
    //  PlayersOnline.js expose():
    //    { setPlayersOnlineData(json), setInterfaceParams(json) }
    //  Формат данных: JSON-строка или объект
    //    { count, serverName, local: {name, level, ...}, players: [{name, level, ...}] }
    // ═══════════════════════════════════════════════════════════
    (function _ftSetupInterfaceProxy() {
        try {
            const _origIface = window.interface;
            if (typeof _origIface !== 'function') {
                debugLog('[TRACKER] window.interface не найден — Proxy пропущен');
                return;
            }

            window.interface = function (name) {
                const inst = _origIface.apply(this, arguments);

                // Перехватываем только PlayersOnline
                if (name !== 'PlayersOnline') return inst;

                // ── FIX: раньше здесь был `inst == null` — не ловило false.
                // Теперь: если компонент смонтирован — используем его как таргет,
                // иначе создаём пустой объект-заглушку. Прокси возвращается ВСЕГДА.
                const realInst = (inst !== null && inst !== undefined && inst !== false)
                    ? inst
                    : null;

                return new Proxy(realInst || {}, {
                    get(target, prop) {
                        if (
                            prop === 'setPlayersOnlineData' ||
                            prop === 'setInterfaceParams'
                        ) {
                            return function () {
                                // Прогоняем данные через трекер (здесь есть level!)
                                try { _ftCheck(arguments[0]); } catch (e) {
                                    debugLog(`[TRACKER] PO Proxy err: ${e.message}`);
                                }
                                // Если компонент реально смонтирован — зовём оригинал
                                // чтобы Vue-компонент тоже обновил UI
                                if (realInst) {
                                    const fn = realInst[prop];
                                    if (typeof fn === 'function') {
                                        return fn.apply(realInst, arguments);
                                    }
                                }
                            };
                        }
                        // Остальные свойства — из реального компонента или undefined
                        return realInst ? realInst[prop] : undefined;
                    }
                });
            };

            debugLog('[TRACKER] Канал 2: window.interface Proxy установлен (PlayersOnline, Hassle-ready)');
        } catch (e) {
            debugLog(`[TRACKER] Ошибка установки interface Proxy: ${e.message}`);
        }
    })();


    // ═══════════════════════════════════════════════════════════
    //  ХУК getInterfaceStatus — говорим движку Hassle, что
    //  PlayersOnline «открыт», пока watchList не пуст.
    //  Это заставляет движок слать setPlayersOnlineData (с level)
    //  даже когда вкладка физически закрыта.
    // ═══════════════════════════════════════════════════════════
    (function _ftHookInterfaceStatus() {
        try {
            const _origStatus = window.getInterfaceStatus;
            if (typeof _origStatus !== 'function') {
                debugLog('[TRACKER] getInterfaceStatus не найден — хук пропущен');
                return;
            }
            window.getInterfaceStatus = function (name) {
                if (name === 'PlayersOnline' && ft.watchList.size > 0) {
                    return true; // движок будет слать level-данные через Канал 2
                }
                return _origStatus.apply(this, arguments);
            };
            debugLog('[TRACKER] getInterfaceStatus hook установлен (PlayersOnline always-open trick)');
        } catch (e) {
            debugLog(`[TRACKER] Ошибка хука getInterfaceStatus: ${e.message}`);
        }
    })();


    // ═══════════════════════════════════════════════════════════
    //  ХУК: window.sendChatInput — команды в чате игры
    //  Цепочка: этот хук → ZAVOD-хук → оригинал sendChatInput
    // ═══════════════════════════════════════════════════════════
    const _ftOrigChat = window.sendChatInput;
    window.sendChatInput = function (input) {
        if (typeof input === 'string') {
            const raw   = input.trim();
            const parts = raw.split(/\s+/);
            const cmd   = (parts[0] || '').toLowerCase();

            if (cmd === '/check' && parts.length >= 2) {
                _ftAdd(parts.slice(1).join(' '));
                return; // не передаём в игру
            }
            if (cmd === '/uncheck' && parts.length >= 2) {
                _ftRemove(parts.slice(1).join(' '));
                return;
            }
            if (cmd === '/checklist') {
                _ftList();
                return;
            }
        }
        return (typeof _ftOrigChat === 'function')
            ? _ftOrigChat.apply(this, arguments)
            : undefined;
    };


    // ═══════════════════════════════════════════════════════════
    //  ХУК: processUpdates — команды из Telegram
    //  /check Иван Петров      /check_Иван_Петров
    //  /uncheck Иван Петров    /uncheck_Иван_Петров
    //  /checklist
    // ═══════════════════════════════════════════════════════════
    const _ftOrigProcUpd = processUpdates;
    processUpdates = function (updates) {
        const pass = [];

        for (const upd of updates) {
            let consumed = false;

            if (upd.message && upd.message.text) {
                const msgText   = upd.message.text.trim();
                const msgChatId = String(upd.message.chat.id);

                if (config.chatIds.includes(msgChatId)) {

                    // /check Иван Петров  или  /check_Иван_Петров
                    // Отрицательный lookahead: не матчить /checklist
                    const addM = msgText.match(/^\/check(?!list)[_ ](.+)$/i);
                    if (addM) {
                        _ftAdd(addM[1].trim().replace(/_/g, ' '));
                        config.lastUpdateId = upd.update_id;
                        setSharedLastUpdateId(config.lastUpdateId);
                        consumed = true;
                    }

                    // /uncheck Иван Петров  или  /uncheck_Иван_Петров
                    if (!consumed) {
                        const remM = msgText.match(/^\/uncheck[_ ](.+)$/i);
                        if (remM) {
                            _ftRemove(remM[1].trim().replace(/_/g, ' '));
                            config.lastUpdateId = upd.update_id;
                            setSharedLastUpdateId(config.lastUpdateId);
                            consumed = true;
                        }
                    }

                    // /checklist
                    if (!consumed && /^\/checklist$/i.test(msgText)) {
                        _ftList();
                        config.lastUpdateId = upd.update_id;
                        setSharedLastUpdateId(config.lastUpdateId);
                        consumed = true;
                    }
                }
            }

            if (!consumed) pass.push(upd);
        }

        if (pass.length > 0) _ftOrigProcUpd(pass);
    };


    debugLog(
        '[TRACKER] Friend Tracker v2 загружен.\n' +
        '  Каналы: [1] onUpdatePlayersList  [2] interface Proxy (fixed)  [3] авто-опрос\n' +
        '  Команды: /check <ник> | /uncheck <ник> | /checklist\n' +
        '  Детект авторизации: lastLevel (level 0 → >0) via Канал 2'
    );

})();
// ==================== END FRIEND TRACKER MODULE ====================
// ╔══════════════════════════════════════════════════════════╗
// ║  MODULE: SOBESED (уведомления о собеседованиях/наборах)   ║
// ║  • Жёлтое SMS (FFFF00) со словом "набор"                  ║
// ║        → "Планируется собеседование: ..."                 ║
// ║  • Синяя гос-волна (4466CC)                               ║
// ║        → "Обнаружено собеседование: ..."                  ║
// ║        несколько сообщений от одного ника в течение       ║
// ║        1 минуты → редактируем одно сообщение в TG         ║
// ║  • Кнопка "Увед. о собесе" в Функции (TG + /hb)           ║
// ║        с выбором: этот аккаунт / все аккаунты             ║
// ║  • По умолчанию — ВЫКЛ                                    ║
// ║  • После ВКЛ/ВЫКЛ — возврат сообщения к исходному         ║
// ║    виду (текст welcome + кнопки Управление и т.д.)        ║
// ╚══════════════════════════════════════════════════════════╝
// START SOBESED MODULE //
const SOBESED_SMS_COLOR = '0xFFFF00';   // жёлтые SMS
const SOBESED_GOV_COLOR = '0x4466CC';   // синяя гос-волна
const SOBESED_AGG_WINDOW_MS = 60 * 1000; // 1 минута — окно склейки по нику

if (config.sobesNotifications === undefined) config.sobesNotifications = false; // ← изначально ВЫКЛ

const _sobesGovAgg = {}; // nick -> { lastTime, sender, lines[], ids[{chatId,messageId}] }

function _sobesEsc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function _sobesBuildGovMsg(entry) {
    return '🏛 <b>Обнаружено собеседование (' + displayName + '):</b>\n' +
           '👤 ' + _sobesEsc(entry.sender) + '\n' +
           entry.lines.map(_sobesEsc).join('\n');
}

// ── Обработка чата ───────────────────────────────────────────
function _sobesOnChat(msg, colorArg) {
    if (!config.sobesNotifications) return;
    const color = normalizeColor(colorArg);
    const clean = String(msg).replace(/\{[0-9A-Fa-f]{6}\}/g, '').trim();
    if (!clean) return;

    // 1) Жёлтое SMS со словом "набор"
    if (color === SOBESED_SMS_COLOR && clean.toLowerCase().includes('набор')) {
        debugLog('[SOBESED] Жёлтое SMS с "набор" → уведомление');
        sendToTelegram('📅 <b>Планируется собеседование (' + displayName + '):</b>\n' + _sobesEsc(clean), false, null);
        return;
    }

    // 2) Синяя гос-волна — склейка по нику в течение 1 минуты
    if (color === SOBESED_GOV_COLOR) {
        const m = clean.match(/^([^:]+?):\s*([\s\S]+)$/);
        const senderFull = m ? m[1].trim() : clean;
        const text       = m ? m[2].trim() : clean;
        const nickM = senderFull.match(/([A-Za-z]+_[A-Za-z]+)/);
        const nick  = nickM ? nickM[1] : null;

        // FIX: игнорируем сообщения без ника (свалка, системные и т.д.)
        if (!nick) {
            debugLog('[SOBESED] Гос-волна без ника → игнорируем');
            return;
        }

        const now = Date.now();
        let entry = _sobesGovAgg[nick];

        // FIX: убрали проверку entry.ids.length из условия.
        // Причина: три части собеседования приходят за доли секунды. sendToTelegram
        // асинхронный (XHR), поэтому callback с messageId ещё не вернулся когда
        // приходят 2-е и 3-е сообщения → entry.ids пуст → старый код шёл в else
        // и отправлял новое сообщение вместо редактирования существующего.
        // Теперь: проверяем только окно времени; если IDs ещё нет — буферизуем
        // строки, а callback сам сделает editMessageText после получения ID.
        if (entry && (now - entry.lastTime) <= SOBESED_AGG_WINDOW_MS) {
            // Пришло ещё сообщение от того же ника в окне 1 мин
            entry.lastTime = now;
            entry.lines.push(text);
            if (entry.ids.length) {
                // ID уже есть → редактируем сразу
                const full = _sobesBuildGovMsg(entry);
                entry.ids.forEach(function (id) { editMessageText(id.chatId, id.messageId, full); });
                debugLog('[SOBESED] Гос-волна от ' + nick + ' → редактируем сообщение');
            } else {
                // Callback ещё не вернул ID — строки уже в entry.lines,
                // callback сам отредактирует когда получит ID
                debugLog('[SOBESED] Гос-волна от ' + nick + ' → буферизуем (ID ещё не получен)');
            }
        } else {
            entry = { lastTime: now, sender: senderFull, lines: [text], ids: [] };
            _sobesGovAgg[nick] = entry;
            debugLog('[SOBESED] Гос-волна от ' + nick + ' → новое сообщение');
            sendToTelegram(_sobesBuildGovMsg(entry), false, null, function (chatId, messageId) {
                entry.ids.push({ chatId: chatId, messageId: messageId });
                // FIX: если пока ждали callback накопились ещё строки → редактируем
                if (entry.lines.length > 1) {
                    editMessageText(chatId, messageId, _sobesBuildGovMsg(entry));
                    debugLog('[SOBESED] Callback: редактируем после получения ID (строк: ' + entry.lines.length + ')');
                }
            });
        }
    }
}

// ── Встраиваемся в цепочку OnChatAddMessage ──────────────────
// ⚠️ FIX для Load.js (WAIT_CODE2): Code2.js eval'ится РАНЬШЕ, чем
// Load.js вызовет __botInit() → initializeChatMonitor(), которая
// делает `window.OnChatAddMessage = function(...)` и перезаписывает
// обёртку, поставленную при eval. Поэтому ставим обёртку сразу
// (если обработчик уже есть) И патчим initializeChatMonitor, чтобы
// восстанавливать обёртку после каждого её вызова (включая retry).
function _sobesInstallChatHook() {
    const cur = window.OnChatAddMessage;
    if (typeof cur === 'function' && !cur.__sobesWrapped) {
        const wrapped = function (e, colorArg, t) {
            cur.call(this, e, colorArg, t);
            try { _sobesOnChat(String(e), colorArg); } catch (err) { debugLog('[SOBESED] Ошибка: ' + err.message); }
        };
        wrapped.__sobesWrapped = true;
        window.OnChatAddMessage = wrapped;
        debugLog('[SOBESED] ✅ Хук OnChatAddMessage установлен');
    }
}
// 1) Бот уже инициализирован (запуск без WAIT_CODE2) — wrap сразу
_sobesInstallChatHook();
// 2) Инициализация впереди (Load.js) — перехватываем момент
if (typeof initializeChatMonitor === 'function' && !initializeChatMonitor.__sobesPatched) {
    const _sobesOrigInitMonitor = initializeChatMonitor;
    const patchedInitMonitor = function () {
        const res = _sobesOrigInitMonitor.apply(this, arguments);
        _sobesInstallChatHook(); // восстанавливаем обёртку после перезаписи
        return res;
    };
    patchedInitMonitor.__sobesPatched = true;
    initializeChatMonitor = patchedInitMonitor;
    debugLog('[SOBESED] ✅ initializeChatMonitor пропатчена — хук переживёт перезапись');
}

// ── Глобальный broadcast toggle_sobes ────────────────────────
const _sobesOrigHandleGlobal = handleGlobalBroadcastCommand;
handleGlobalBroadcastCommand = function (cmd, val, fromBroadcast) {
    if (cmd === 'toggle_sobes') {
        const isOn = val === 'on';
        config.sobesNotifications = isOn;
        showScreenNotification("Hassle", '[Global] Собес ' + (isOn ? 'ВКЛ' : 'ВЫКЛ'));
        sendToTelegram((isOn ? '🔔' : '🔕') + ' <b>Увед. о собесе ' + (isOn ? 'ВКЛ' : 'ВЫКЛ') + ' (' + displayName + ')</b>', true, null);
        if (fromBroadcast) sendWelcomeMessage(true); // получатели тоже возвращаются к welcome
        debugLog('[GLOBAL] Применена команда: toggle_sobes = ' + val);
        return;
    }
    return _sobesOrigHandleGlobal(cmd, val, fromBroadcast);
};

// ── Telegram-меню: кнопка в "Функции" + выбор скоупа ─────────
showFunctionsMenu = function (chatId, messageId, uniqueIdParam) {
    const uid = uniqueIdParam || uniqueId;
    if (!config.accountInfo.nickname) {
        sendToTelegram('❌ <b>Ошибка ' + displayName + '</b>\nНик не определен', false, null);
        return;
    }
    const isPaused = !!window.getInterfaceStatus("PauseMenu");
    const isAutoLoginDisabled = !autoLoginConfig.enabled;
    const pauseLabel     = isPaused ? "▶️ Выйти с паузы" : "⏸️ Уйти на паузу";
    const pauseStyle     = isPaused ? 'success' : 'danger';
    const autoLoginLabel = isAutoLoginDisabled ? "✅ Выйти с автр." : "🚫 Уйти на автр.";
    const autoLoginStyle = isAutoLoginDisabled ? 'success' : 'danger';
    const kacStyle       = config.kacAutoReply ? 'success' : 'danger';
    const afkActive      = !!(config.afkCycle && config.afkCycle.active);
    const afkStyle       = afkActive ? 'success' : 'danger';
    const otygrovkaStyle = globalState.otygrovkaAuto ? 'success' : 'danger';
    const sobesStyle     = config.sobesNotifications ? 'success' : 'danger';
    const replyMarkup = {
        inline_keyboard: [
            [createButton("🚶 Движение", `func_action_movement_local_${uid}`)],
            [createButton(`🛡️ КАЧ/ЗП автоответ ${config.kacAutoReply ? '🟢' : '🔴'}`, `func_select_kac_${uid}`, kacStyle)],
            [createButton(`🌙 AFK Ночь ${afkActive ? '🟢' : '🔴'}`, `func_select_afk_${uid}`, afkStyle)],
            [createButton(`🎭 Отыгровка 27 мин ${globalState.otygrovkaAuto ? '🟢' : '🔴'}`, `func_select_otygrovka_${uid}`, otygrovkaStyle)],
            [createButton(`🏛 Увед. о собесе ${config.sobesNotifications ? '🟢' : '🔴'}`, `sobes_scope_${uid}`, sobesStyle)],
            [createButton("📝 Написать в чат", `request_chat_message_${uid}`)],
            [createButton(pauseLabel, `func_select_pause_${uid}`, pauseStyle), createButton(autoLoginLabel, `func_select_autologin_${uid}`, autoLoginStyle)],
            [createButton("⬅️ Вернуться назад", `show_controls_${uid}`)]
        ]
    };
    editMessageReplyMarkup(chatId, messageId, replyMarkup);
};

function showSobesScopeMenu(chatId, messageId, uid) {
    editMessageText(chatId, messageId, '🏛 <b>Увед. о собесе</b>\n\nДля кого применить изменения?', {
        inline_keyboard: [
            [createButton("👤 Для этого аккаунта", `sobes_action_local_${uid}`, 'primary'),
             createButton("👥 Для всех аккаунтов", `sobes_action_global_${uid}`, 'primary')],
            [createButton("⬅️ Вернуться назад", `show_functions_${uid}`)]
        ]
    });
}
function showSobesToggleMenu(chatId, messageId, scope, uid) {
    const on = config.sobesNotifications;
    editMessageText(chatId, messageId,
        '🏛 <b>Увед. о собесе</b>\nСейчас: ' + (on ? '🟢 ВКЛ' : '🔴 ВЫКЛ') +
        '\nСкоуп: ' + (scope === 'global' ? '👥 все аккаунты' : '👤 ' + displayName), {
        inline_keyboard: [
            [createButton("🔔 ВКЛ", `sobes_on_${scope}_${uid}`, 'success'),
             createButton("🔕 ВЫКЛ", `sobes_off_${scope}_${uid}`, 'danger')],
            [createButton("⬅️ Вернуться назад", `sobes_scope_${uid}`)]
        ]
    });
}

// ── Перехват callback'ов sobes_* в processUpdates ────────────
function _sobesParseUid(data) {
    const prefixes = ['sobes_scope_', 'sobes_action_local_', 'sobes_action_global_',
                      'sobes_on_local_', 'sobes_on_global_', 'sobes_off_local_', 'sobes_off_global_'];
    for (const p of prefixes) {
        if (data.startsWith(p)) return data.slice(p.length);
    }
    return null;
}
function _sobesHandleCallback(cq) {
    const data = cq.data;
    const chatId = cq.message.chat.id;
    const messageId = cq.message.message_id;
    const uid = _sobesParseUid(data);
    answerCallbackQuery(cq.id);
    if (data.startsWith('sobes_scope_')) { showSobesScopeMenu(chatId, messageId, uid); return; }
    if (data.startsWith('sobes_action_')) {
        const scope = data.startsWith('sobes_action_local_') ? 'local' : 'global';
        showSobesToggleMenu(chatId, messageId, scope, uid);
        return;
    }
    // ── ВКЛ / ВЫКЛ ──
    const isOn  = data.startsWith('sobes_on_');
    const scope = data.includes('_global_') ? 'global' : 'local';
    config.sobesNotifications = isOn;
    if (scope === 'global') {
        handleGlobalBroadcastCommand('toggle_sobes', isOn ? 'on' : 'off'); // применяем у себя
        broadcastGlobalCommand('toggle_sobes', isOn ? 'on' : 'off');       // остальным
    } else {
        sendToTelegram((isOn ? '🔔' : '🔕') + ' <b>Увед. о собесе ' + (isOn ? 'ВКЛ' : 'ВЫКЛ') + ' для ' + displayName + '</b>', false, null);
    }
    // ✅ Как остальные функции: возвращаем сообщение к исходному виду —
    // текст welcome + клавиатура с "⚙️ Управление", "💰 Инфо", "🔔 Настройки"
    sendWelcomeMessage(true);
}
const _sobesOrigProcessUpdates = processUpdates;
processUpdates = function (updates) {
    const rest = [];
    for (const u of updates) {
        const cq = u.callback_query;
        if (cq && typeof cq.data === 'string' && cq.data.startsWith('sobes_') && _sobesParseUid(cq.data) === uniqueId) {
            config.lastUpdateId = u.update_id;
            setSharedLastUpdateId(config.lastUpdateId);
            try { _sobesHandleCallback(cq); } catch (e) { debugLog('[SOBESED] callback error: ' + e.message); }
            continue;
        }
        rest.push(u);
    }
    if (rest.length) _sobesOrigProcessUpdates(rest);
};

// ── /hb меню: переключатели в "Функции" и "Общие функции" ────
showHBLocalFunctionsMenu = function () {
    currentHBMenu = "local_functions";
    currentHBPage = 0;
    const statusOn = "{00FF00}[ВКЛ]";
    const statusOff = "{FF0000}[ВЫКЛ]";
    const menuItems = [
        { name: "{FFD700} > {FFFFFF}Движение", action: "movement" },
        { name: `{FFFFFF}Увед. правик ${config.govMessagesEnabled ? statusOn : statusOff}`, action: "toggle_soob_local" },
        { name: `{FFFFFF}Отслеживание ${config.trackLocationRequests ? statusOn : statusOff}`, action: "toggle_mesto_local" },
        { name: `{FFFFFF}Рация все ${config.radioOfficialNotifications ? statusOn : statusOff}`, action: "toggle_radio_local" },
        { name: `{FFFFFF}Рация фильтр ${config.radioImportantFilter ? statusOn : statusOff}`, action: "toggle_radio_filter_local" },
        { name: `{FFFFFF}Выговоры ${config.warningNotifications ? statusOn : statusOff}`, action: "toggle_warning_local" },
        { name: `{FFFFFF}Автоответ КАЧ/ЗП ${config.kacAutoReply ? statusOn : statusOff}`, action: "toggle_kac_local" },
        { name: `{FFFFFF}Увед. о собесе ${config.sobesNotifications ? statusOn : statusOff}`, action: "toggle_sobes_local" }
    ];
    let menuList = "{FFA500} < Назад <n>";
    menuItems.forEach((item) => { menuList += `${item.name}<n>`; });
    window.addDialogInQueue(`[${HB_DIALOG_IDS.LOCAL_FUNCTIONS},2,"{00BFFF}Функции","","Выбрать","Закрыть",0,0]`, menuList, 0);
};
showHBGlobalFunctionsMenu = function () {
    currentHBMenu = "global_functions";
    currentHBPage = 0;
    const statusOn = "{00FF00}[ВКЛ]";
    const statusOff = "{FF0000}[ВЫКЛ]";
    const menuItems = [
        { name: `{FFFFFF}PayDay ${config.paydayNotifications ? statusOn : statusOff}`, action: "toggle_payday" },
        { name: `{FFFFFF}Сообщ. ${config.govMessagesEnabled ? statusOn : statusOff}`, action: "toggle_soob" },
        { name: `{FFFFFF}Место ${config.trackLocationRequests ? statusOn : statusOff}`, action: "toggle_mesto" },
        { name: `{FFFFFF}Рация все ${config.radioOfficialNotifications ? statusOn : statusOff}`, action: "toggle_radio" },
        { name: `{FFFFFF}Рация фильтр ${config.radioImportantFilter ? statusOn : statusOff}`, action: "toggle_radio_filter" },
        { name: `{FFFFFF}Выговоры ${config.warningNotifications ? statusOn : statusOff}`, action: "toggle_warning" },
        { name: `{FFFFFF}Автоответ КАЧ/ЗП ${config.kacAutoReply ? statusOn : statusOff}`, action: "toggle_kac_global" },
        { name: "{FFD700} > {FFFFFF}AFK Ночь", action: "afk_night" },
        { name: `{FFFFFF}Увед. о собесе ${config.sobesNotifications ? statusOn : statusOff}`, action: "toggle_sobes_global" }
    ];
    let menuList = "{FFA500} < Назад <n>";
    menuItems.forEach((item) => { menuList += `${item.name}<n>`; });
    window.addDialogInQueue(`[${HB_DIALOG_IDS.GLOBAL_FUNCTIONS},2,"{00BFFF}Общие функции","","Выбрать","Закрыть",0,0]`, menuList, 0);
};
const _sobesOrigHBSelection = handleHBMenuSelection;
handleHBMenuSelection = function (dialogId, button, listitem) {
    if (button === 1 && dialogId === HB_DIALOG_IDS.LOCAL_FUNCTIONS && listitem === 8) {
        config.sobesNotifications = !config.sobesNotifications;
        showScreenNotification("Hassle", `Увед. о собесе ${config.sobesNotifications ? 'включены' : 'отключены'}`);
        sendToTelegram(`${config.sobesNotifications ? '🔔' : '🔕'} <b>Увед. о собесе ${config.sobesNotifications ? 'ВКЛ' : 'ВЫКЛ'} для ${displayName}</b>`, false, null);
        setTimeout(() => showHBLocalFunctionsMenu(), 100);
        return;
    }
    if (button === 1 && dialogId === HB_DIALOG_IDS.GLOBAL_FUNCTIONS && listitem === 9) {
        const val = !config.sobesNotifications;
        handleGlobalBroadcastCommand('toggle_sobes', val ? 'on' : 'off');
        broadcastGlobalCommand('toggle_sobes', val ? 'on' : 'off');
        setTimeout(() => showHBGlobalFunctionsMenu(), 100);
        return;
    }
    return _sobesOrigHBSelection(dialogId, button, listitem);
};
debugLog('[SOBESED] Модуль собеседований загружен. Статус: ' + (config.sobesNotifications ? 'ВКЛ' : 'ВЫКЛ'));
// END SOBESED MODULE //
