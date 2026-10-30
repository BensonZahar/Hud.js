// Dress.js — /dress: быстро «сходить» в раздевалку и вернуться на место.
//
// Что делает команда (всё через уже существующий мод /tpl, ничего нового в APK не нужно):
//   1. /tpl save dressbk      — запоминает ТЕКУЩЕЕ место (вместе с номером интерьера)
//   2. /tpl pick              — читает из чата список пикапов рядом, берёт ближайший с моделью «cloth…» (clothesp)
//   3. /tpl pick N            — телепорт на пикап: сервер видит вас на нём и открывает диалог «Раздевалка»
//   4. диалог-список          — выбирает пункт «Переодеться» и жмёт «Далее»
//   5. диалог-вопрос          — жмёт «Да» (то самое «Вы действительно хотите переодеться…»)
//   6. /tpl go dressbk        — возвращает туда, откуда запускали
//
// Команды в чате:
//   /dress          — выполнить всё выше (пикап ищется среди тех, что сейчас в зоне стрима — как у /tpl pick)
//   /dress N        — взять пикап под номером N из списка /tpl pick (если авто-поиск «cloth» не подошёл)
//   /dress stop     — прервать; если уже телепортировались — вернуться на сохранённое место
//   /dress status   — на каком шаге сейчас
//
// Версия «под пикап» (нырок, /tpl pick N under): не встаёте НА пикап, а на секунды уходите под пол, пикап срабатывает, и /tpl сам возвращает вас
// туда, где вы стояли. Не мешает тем, кто стоит на пикапе. Точка возврата не нужна (/tpl save/go в этом режиме не шлются).
//   /dress under [сек]     — нырок, пока идут оба диалога; сек — сколько держаться под полом (по умолчанию 3, от 0.2 до 15)
//   /dress N under [сек]   — то же, но пикап под номером N из списка /tpl pick
//   синонимы слова under: dive, нырок, ниже, под. Глубину задаёт /tpl depth (по умолчанию 1 м; обычные пикапы принимаются до 5 м)
//   Только пешком и только к обычному пикапу (не к маркеру). Если диалог не открылся, прервать нырок нельзя — вас вернёт сам /tpl по истечении секунд.
//
// Чтобы не мешать остальному (тестовым NPC, их диалогам и интерфейсам):
//   • ничего не висит постоянно: хуки на чат и на диалоги ставятся только на время запуска и снимаются в конце (или по тайм-ауту);
//   • перехватываются ТОЛЬКО диалоги с «раздевалк» в заголовке/тексте и только в нужном порядке (сначала список, потом вопрос);
//     все остальные диалоги уходят в игру и в Code2 как обычно. ActorDialog (диалоги NPC) идёт другим путём — openInterface — и не затрагивается;
//   • на сервер уходит штатный OnDialogResponse (так же отвечает Code2 из Telegram); перехваченный диалог игре не показывается.
//
// Подклеивается к тексту Code2 из Load.js (как Near.js): видит debugLog / _dlgOrigSendClientEvent из области видимости Code.js, но без них тоже работает.
// Точка возврата хранится в HLOG/tpl_points.txt под именем dressbk (перезаписывается при каждом запуске, после возврата НЕ удаляется —
// если что-то пошло не так, вернуться можно вручную: /tpl go dressbk).
try { (function () {

if (typeof window.__dressCleanup === 'function') { try { window.__dressCleanup(); } catch (e) {} }

// ───────────────────────── настройки ─────────────────────────
var BACK_NAME   = 'dressbk';        // имя точки возврата в /tpl save
var MODEL_RX    = /cloth/i;         // какой пикап считаем раздевалкой (имя модели из «/tpl pick»: «clothesp»)
var TITLE_RX    = /раздевалк/i;     // по чему узнаём диалоги раздевалки
var ITEM_RX     = /переод/i;        // пункт списка «Переодеться»
var ITEM_BAD_RX = /сменить|униформ|рабоч|отпуск/i; // эти пункты не берём, даже если слово «переод» встретится
var T_SAVE_MS   = 2500;             // сколько ждать подтверждения /tpl save
var T_LIST_MS   = 2500;             // сколько ждать список пикапов (после заголовка — ещё 1,2 с на остальные строки)
var T_DLG1_MS   = 8000;             // после телепорта: сколько ждать диалог-список
var T_DLG2_MS   = 6000;             // после выбора пункта: сколько ждать диалог-вопрос
var D_REPLY_MS  = 150;              // пауза перед ответом на диалог
var D_BACK_MS   = 350;              // пауза между ответом «Да» и возвратом
var UNDER_SEC    = 3;                // сколько секунд держаться под полом в режиме under (хватает на оба диалога)
var T_TOTAL_MS  = 30000;            // общий потолок — после него всё снимаем и возвращаемся

var _dead = false;
var _undo = [];
function onUndo(fn) { _undo.push(fn); }
window.__dressCleanup = function () {
    _dead = true;
    try { endSession('перезагрузка скриптов', true); } catch (e) {}
    while (_undo.length) { try { _undo.pop()(); } catch (e) {} }
    window.__dressCleanup = null;
};

function log() { try { console.log.apply(console, ['[DRESS]'].concat([].slice.call(arguments))); } catch (e) {} try { if (typeof debugLog === 'function') debugLog('[DRESS] ' + [].slice.call(arguments).join(' ')); } catch (e) {} }
function warn() { try { console.warn.apply(console, ['[DRESS]'].concat([].slice.call(arguments))); } catch (e) {} }
function iface(name) { try { return (window.interface && window.interface(name)) || null; } catch (e) { return null; } }
function gtSafe(s) { return String(s === undefined || s === null ? '' : s).replace(/~/g, ''); }
function gtAdd(text, duration) {
    try {
        var gt = iface('GameText');
        if (gt && typeof gt.add === 'function') gt.add(JSON.stringify([3, text, duration || 3500, 0, 0, true, false, 2.0]));
    } catch (e) {}
}
function info(msg) { gtAdd('~g~Dress: ~w~' + gtSafe(msg)); log(msg); }
function fail(msg) { gtAdd('~r~Dress: ~w~' + gtSafe(msg), 5000); log('ОШИБКА:', msg); }

function strip(s) { return String(s === undefined || s === null ? '' : s).replace(/\{[0-9A-Fa-f]{6,8}\}/g, '').replace(/<n>/g, '\n').replace(/<[^>]*>/g, '').trim(); }
function chatCmd(t) {
    try { if (typeof sendChatInput === 'function') { sendChatInput(t); return true; } } catch (e) { warn('чат:', e && e.message); }
    try { if (typeof window.sendChatInput === 'function') { window.sendChatInput(t); return true; } } catch (e) { warn('чат(window):', e && e.message); }
    return false;
}
function respond(dialogId, response, listitem, text) {
    var evt = (window.gm && window.gm.EVENT_EXECUTE_PUBLIC !== undefined) ? window.gm.EVENT_EXECUTE_PUBLIC : 'server';
    var fn = null;
    try { if (typeof _dlgOrigSendClientEvent === 'function') fn = _dlgOrigSendClientEvent; } catch (e) {}   // как у Code2.dlgRespond (без обёрток Telegram)
    if (!fn) { try { if (typeof sendClientEvent === 'function') fn = sendClientEvent; } catch (e) {} }
    if (!fn && typeof window.sendClientEvent === 'function') fn = window.sendClientEvent;
    if (!fn) throw new Error('sendClientEvent недоступен');
    fn(evt, 'OnDialogResponse', dialogId, response, listitem, text || '');
    log('ответ на диалог: id=' + dialogId + ' resp=' + response + ' item=' + listitem + ' text="' + (text || '') + '"');
}

// ───────────────────────── сессия ─────────────────────────
// S.step: save → list → tp(=ждём диалог-список) → dlg2(=ждём диалог-вопрос) → back
var S = null;

function setTimer(fn, ms) {
    var h = setTimeout(function () { if (!_dead && S) { try { fn(); } catch (e) { fail('ошибка: ' + (e && e.message)); endSession('ошибка', true); } } }, ms);
    S.timers.push(h);
    return h;
}
function clearTimers() { if (S) { S.timers.forEach(function (h) { clearTimeout(h); }); S.timers = []; } }

// — хук чата (только на время сессии) —
function hookChat(sess) {
    var cur = window.OnChatAddMessage;
    if (typeof cur !== 'function') return false;
    var wrapped = function (e, c, t) {
        try { if (!_dead && S === sess) onChat(String(e)); } catch (err) { warn('onChat:', err && err.message); }
        return cur.apply(this, arguments);
    };
    sess.chatOrig = cur; sess.chatWrap = wrapped;
    window.OnChatAddMessage = wrapped;
    return true;
}
// — хук диалогов (только на время сессии) —
function hookDialogs(sess) {
    var cur = window.addDialogInQueue;
    if (typeof cur !== 'function') return false;
    var wrapped = function (params, content, priority) {
        var consumed = false;
        try { if (!_dead && S === sess) consumed = onDialog(params, content, priority); } catch (err) { warn('onDialog:', err && err.message); }
        if (consumed) return;                        // наш диалог раздевалки: игре и Code2 не отдаём
        return cur.apply(this, arguments);
    };
    sess.dlgOrig = cur; sess.dlgWrap = wrapped;
    window.addDialogInQueue = wrapped;
    return true;
}
function unhook(sess) {
    try { if (sess.chatWrap && window.OnChatAddMessage === sess.chatWrap) window.OnChatAddMessage = sess.chatOrig; } catch (e) {}
    try { if (sess.dlgWrap && window.addDialogInQueue === sess.dlgWrap) window.addDialogInQueue = sess.dlgOrig; } catch (e) {}
    // если поверх нас успели обернуть ещё раз — наша обёртка останется в цепочке, но по S !== sess она просто пропускает вызовы дальше
}

function startSession(pickNum, under, holdSec) {
    if (S) { info('уже выполняется (шаг «' + S.step + '»). Прервать: /dress stop'); return; }
    var sess = { step: under ? 'list' : 'save', under: !!under, hold: holdSec || UNDER_SEC, pickNum: pickNum || 0, timers: [], list: [], listN: -1, listTimer: null, t0: Date.now(), teleported: false, chatOrig: null, chatWrap: null, dlgOrig: null, dlgWrap: null };
    S = sess;
    if (!hookChat(sess)) { S = null; fail('не нашёл OnChatAddMessage — бот ещё не запущен?'); return; }
    if (!hookDialogs(sess)) { unhook(sess); S = null; fail('не нашёл addDialogInQueue — игра ещё не загрузила диалоги'); return; }
    setTimer(function () { fail('общий тайм-аут'); endSession('тайм-аут', true); }, T_TOTAL_MS);
    log('старт, шаг ' + sess.step + (under ? ', под пикап ' + sess.hold + ' с' : '') + (pickNum ? ', пикап №' + pickNum : ''));
    if (under) {                                    // нырок: возвращает сам /tpl, точка возврата не нужна — сразу за списком пикапов
        if (!chatCmd('/tpl pick')) { fail('не удалось отправить /tpl pick'); endSession('нет чата', false); return; }
        sess.listTimer = setTimer(function () { fail('список пикапов не пришёл (рядом нет пикапов или мода /tpl нет в APK)'); endSession('нет списка', false); }, T_LIST_MS);
        return;
    }
    if (!chatCmd('/tpl save ' + BACK_NAME)) { fail('не удалось отправить команду в чат'); endSession('нет чата', false); return; }
    setTimer(function () { fail('/tpl не ответил на save — мод tpl не установлен в этом APK?'); endSession('нет ответа /tpl', false); }, T_SAVE_MS);
}

function endSession(why, goBack) {
    var sess = S;
    if (!sess) return;
    clearTimers();
    unhook(sess);
    S = null;                                        // дальше любые хвосты хуков просто пропускают вызовы
    log('конец: ' + why);
    if (goBack && sess.teleported) { chatCmd('/tpl go ' + BACK_NAME); info('вернулся на место (' + why + ')'); }
}

// ───────────────────────── разбор чата ─────────────────────────
var RX_SAVED  = new RegExp('Точка\\s*«\\s*' + BACK_NAME + '\\s*»\\s*(сохранена|обновлена)', 'i');
var RX_HEADER = /Пикапы и маркеры рядом:\s*(\d+)/i;
var RX_NONE   = /Пикапов и маркеров рядом нет|Пикапы: пул не прочитался/i;
var RX_LINE   = /(\d+)\.\s+ID\s+(\d+)\s+\[модель\s+([^\]]+)\]\s*—\s*(\d+)\s*м/;
var RX_TPL_ERR = /Точка:\s*(уже|не удалось)/i;   // «Точка: уже 64 точки…» / «Точка: не удалось прочитать ваши координаты»

function onChat(raw) {
    var text = strip(raw);
    if (!S) return;
    if (S.step === 'save') {
        if (RX_SAVED.test(text)) {
            clearTimers();
            setTimer(function () { fail('общий тайм-аут'); endSession('тайм-аут', true); }, T_TOTAL_MS);
            S.step = 'list';
            log('точка возврата сохранена, запрашиваю список пикапов');
            if (!chatCmd('/tpl pick')) { fail('не удалось отправить /tpl pick'); endSession('нет чата', false); return; }
            S.listTimer = setTimer(function () { fail('список пикапов не пришёл (рядом нет пикапов или /tpl pick не сработал)'); endSession('нет списка', false); }, T_LIST_MS);
        } else if (RX_TPL_ERR.test(text)) {
            fail('/tpl save не удался: ' + text.slice(0, 80)); endSession('save не удался', false);
        }
        return;
    }
    if (S.step === 'list') {
        if (RX_NONE.test(text)) { fail('рядом нет пикапов — подойдите к раздевалке (сервер стримит их только вблизи)'); endSession('нет пикапов', false); return; }
        var h = RX_HEADER.exec(text);
        if (h) {
            S.listN = Math.min(parseInt(h[1], 10) || 0, 10);   // на странице 10 строк (TPL_PAGE)
            clearTimers();
            setTimer(function () { fail('общий тайм-аут'); endSession('тайм-аут', true); }, T_TOTAL_MS);
            S.listTimer = setTimer(function () { pickAndGo(); }, 1200);   // если часть строк потерялась — берём что собрали
            return;
        }
        var m = RX_LINE.exec(text);
        if (m) {
            S.list.push({ n: parseInt(m[1], 10), id: parseInt(m[2], 10), model: m[3].trim(), d: parseInt(m[4], 10) });
            if (S.listN >= 0 && S.list.length >= S.listN) pickAndGo();
        }
    }
}

function pickAndGo() {
    if (!S || S.step !== 'list') return;
    var sel = null, i;
    if (S.pickNum) {
        for (i = 0; i < S.list.length; i++) if (S.list[i].n === S.pickNum) { sel = S.list[i]; break; }
        if (!sel) sel = { n: S.pickNum, id: -1, model: '?', d: -1 };       // номер задан руками — доверяем ему
    } else {
        for (i = 0; i < S.list.length; i++) if (MODEL_RX.test(S.list[i].model)) { sel = S.list[i]; break; }   // список уже по расстоянию — берём ближайший
    }
    if (!sel) {
        fail('среди ' + S.list.length + ' пикапов рядом нет «' + MODEL_RX.source + '». Номер можно задать: /dress N');
        endSession('раздевалка не найдена', false);
        return;
    }
    clearTimers();
    setTimer(function () { fail('общий тайм-аут'); endSession('тайм-аут', true); }, T_TOTAL_MS);
    S.step = 'tp';
    S.sel = sel;
    log('выбран пикап №' + sel.n + ' (ID ' + sel.id + ', модель ' + sel.model + ', ' + sel.d + ' м) — телепорт');
    var t1 = T_DLG1_MS;
    if (S.under) {
        // нырок: /tpl вернёт сам через hold секунд — вручную назад не идём (S.teleported остаётся false)
        t1 = Math.min(T_DLG1_MS, Math.round(S.hold * 1000) + 1500);
        if (!chatCmd('/tpl pick ' + sel.n + ' under ' + S.hold)) { fail('не удалось отправить /tpl pick N under'); endSession('нет чата', false); return; }
    } else {
        S.teleported = true;                            // с этого момента при любой ошибке возвращаемся
        if (!chatCmd('/tpl pick ' + sel.n)) { S.teleported = false; fail('не удалось отправить /tpl pick N'); endSession('нет чата', false); return; }
    }
    S.dlgTimer = setTimer(function () { fail('диалог «Раздевалка» не открылся за ' + (t1 / 1000) + ' с'); endSession('нет диалога 1', true); }, t1);
}

// ───────────────────────── разбор диалогов ─────────────────────────
// Возвращает true, если диалог — наш и его нужно «съесть» (игре не показывать).
function onDialog(params, content, priority) {
    if (!S || (S.step !== 'tp' && S.step !== 'dlg2')) return false;
    if (!params || typeof params !== 'string') return false;
    var p;
    try { p = JSON.parse(params.trim()); } catch (e) { return false; }
    var id = parseInt(p[0], 10), style = parseInt(p[1], 10);
    if (isNaN(id) || isNaN(style)) return false;
    var title = strip(p[2]), sub = strip(p[3]);
    var raw = Array.isArray(content) ? content.join('<n>') : String(content || '');
    var hay = title + ' ' + sub + ' ' + strip(raw);
    if (!TITLE_RX.test(hay)) return false;              // чужой диалог — не трогаем

    if (S.step === 'tp' && (style === 2 || style === 4 || style === 5)) {
        var items = raw.split('<n>').map(strip).filter(function (s) { return s.length > 0; });
        if (style === 5 && items.length) items = items.slice(1);                     // как у Code2: первая строка — заголовки колонок
        var idx = -1, k, plain;
        for (k = 0; k < items.length; k++) {
            plain = items[k].replace(/^\d+\s*[.)]\s*/, '');
            if (ITEM_RX.test(plain) && !ITEM_BAD_RX.test(plain)) { idx = k; break; }
        }
        if (idx < 0) {
            fail('в списке «Раздевалка» нет пункта «Переодеться»: ' + items.join(' | ').slice(0, 120));
            endSession('нет пункта', true);
            return false;                               // диалог отдаём игре — пусть человек выберет сам
        }
        clearTimers();
        S.step = 'dlg2';
        setTimer(function () { fail('вопрос «Да/Нет» не пришёл за ' + (T_DLG2_MS / 1000) + ' с'); endSession('нет диалога 2', true); }, T_DLG2_MS);
        setTimer(function () { respond(id, 1, idx, items[idx]); }, D_REPLY_MS);       // «Далее»
        log('диалог 1 (id ' + id + '): пункт ' + (idx + 1) + ' «' + items[idx] + '»');
        return true;
    }
    if (S.step === 'dlg2' && style === 0) {
        clearTimers();
        S.step = 'back';
        log('диалог 2 (id ' + id + '): «' + strip(raw).slice(0, 80) + '» → Да');
        setTimer(function () { respond(id, 1, -1, ''); }, D_REPLY_MS);                // «Да»
        setTimer(function () {
            var under = S && S.under;
            endSession('готово', true);
            if (under) info('готово — /tpl вернёт вас на место сам');
        }, D_REPLY_MS + D_BACK_MS);
        return true;
    }
    return false;
}

// ───────────────────────── команда в чате ─────────────────────────
function statusText() {
    return S ? ((S.under ? 'под пикап, ' : '') + 'шаг «' + S.step + '», ' + Math.round((Date.now() - S.t0) / 100) / 10 + ' с') : 'не запущено';
}
function runCmd(args) {
    var a = (args[0] || '').toLowerCase();
    if (a === 'stop' || a === 'стоп') { if (S) endSession('прервано командой', true); else info('нечего прерывать'); return; }
    if (a === 'status' || a === 'статус') { info(statusText()); return; }
    // разбор: число ДО слова under — номер пикапа N, число ПОСЛЕ него — секунды; без under единственное число — номер N
    var under = false, n = 0, sec = 0, i, w, v;
    for (i = 0; i < args.length; i++) {
        w = String(args[i]).toLowerCase();
        if (/^(under|dive|нырок|ниже|под)$/.test(w)) { under = true; continue; }
        v = parseFloat(w.replace(',', '.'));
        if (isNaN(v)) { fail('не понял «' + w + '». Примеры: /dress, /dress 2, /dress under, /dress under 4, /dress 2 under 4'); return; }
        if (under) sec = v; else n = Math.round(v);
    }
    if (sec) sec = Math.max(0.2, Math.min(15, sec));
    startSession(n, under, sec);
}

var origChatWin = window.sendChatInputCustom;
var origChatVar = null;
try { if (typeof sendChatInput === 'function') origChatVar = sendChatInput; } catch (e) {}
var prevChat = origChatWin || origChatVar;
var myChat = function (e) {
    if (!_dead && typeof e === 'string') {
        var a = e.trim().split(/\s+/), cmd = (a[0] || '').toLowerCase();
        if (cmd === '/dress' || cmd === '/раздевалка') { runCmd(a.slice(1)); return; }
    }
    if (typeof prevChat === 'function') return prevChat.apply(this, arguments);
};
window.sendChatInputCustom = myChat;
try { sendChatInput = myChat; } catch (e) {}
onUndo(function () {
    if (window.sendChatInputCustom === myChat) window.sendChatInputCustom = origChatWin;
    try { if (sendChatInput === myChat) sendChatInput = origChatVar || origChatWin; } catch (e) {}
});

window.Dress = { run: function (n, under, sec) { startSession(n || 0, !!under, sec || 0); }, stop: function () { if (S) endSession('прервано', true); }, status: statusText };
onUndo(function () { try { delete window.Dress; } catch (e) { window.Dress = undefined; } });

log('Dress.js загружен: /dress [N], /dress [N] under [сек], /dress stop, /dress status (нужен мод /tpl в APK)');

})(); } catch (e) { try { console.error('[DRESS] ошибка загрузки Dress.js:', e); } catch (e2) {} }
