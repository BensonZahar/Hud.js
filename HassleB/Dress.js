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
// Версия 2.3 «подмена sync» (требует свежий мод hassle_tpl.c с командой «/tpl sync»): use-режим (/dressu, /dress use) больше НЕ двигает вас и не шлёт «сброс» на сервер.
// Перед входом в пикап скрипт командой «/tpl sync N 2.2 6» включает подмену позиции в sync-пакете: игра продолжает слать серверу пакет «пешком», но с позицией
// в 2.2 м от пикапа (вы физически стоите вплотную к пикапу — тестовые NPC не двигаются и не «стыкуются»). Сервер за ~0.25 с снимает флаг «игрок уже на пикапе»,
// через SYNC_WAIT_MS скрипт шлёт «/tpl pick N use», потом диалоги как обычно. Подмена выключается («/tpl sync off») СРАЗУ по смене скина, при любой ошибке и в конце сессии;
// сам мод закроет её через SYNC_SEC секунд, даже если скрипт упал. Не включилась (старый мод, перехват не встал) — один раз пробуем обычный use без подмены (SYNC_PLAIN_ON_FAIL).
// Телепорт-запасной путь у /dressu теперь выключен (USE_FALLBACK_TP = false): никаких «сохранить точку → телепорт → вернуться». Старый способ — только явно: /dress tp.
// Отключить подмену: SYNC_MODE = false, либо одним запуском «/dress use nosync».
// Версия 2.2: «/dressu» — то же, что «/dress use», но если за T_USE_FB_MS диалог не открылся (сервер молча игнорирует повторный вход с того же места), сам добирает
// старым путём (точка возврата, телепорт на пикап, возврат). Так переодевание получается всегда, а телепорт только когда без него нельзя.
// Версия 2.1 «вход без движения» (/dress use, /dress N use): мод tpl вызывает игровой вход в пикап (/tpl pick N use) — вы НЕ телепортируетесь и не возвращаетесь,
// стойте рядом с пикапом (сервер принимает обычный пикап до ~5 м). Точка возврата не нужна. Диалоги и «Да» — те же. «/dress tp» — старый способ (телепорт и возврат).
// По умолчанию «/dress» работает по-старому; сделать use основным — USE_DEFAULT = true. Нужен мод hassle_tpl.c с командой use (его правка — отдельным файлом).
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
// ВЕРСИЯ 2 — что изменилось:
//   • Журнал пишется в файл HLOG/dress.txt (рядом с konstt.log) через команду /jlog из мода hassle_jlog.c — не в консоль игры.
//     Прошлый запуск игры лежит в dress_prev.txt. Каждая строка с временем (ЧЧ:ММ:СС.мс) и «+N мс» от старта /dress.
//     Если мода jlog в APK-бандле ещё нет — пишется в консоль, как раньше. «/dress log» — где лежит файл и работает ли запись.
//   • Возврат — СРАЗУ по смене скина, а не через фиксированные 350 мс: ловим вызов setPlayerSkinId, смену player/skinId в Vuex-store и
//     сообщение сервера «Вы переоделись…» (что придёт первым). В режиме нырка возврат делает новая команда «/tpl up» (мод tpl), без ожидания
//     секунд; в обычном режиме — «/tpl go dressbk». Если скин так и не сменился за T_SKIN_MS — возвращаем всё равно.
//   • Ответы на диалоги — в тот же момент, когда диалог пришёл (D_REPLY_MS = 0), без таймеров.
//   • В режиме нырка число секунд теперь — ПРЕДЕЛ (страховка), а не время ожидания: по умолчанию 8 с, вынырнем сразу после смены скина.
//     Если диалог раздевалки не открылся за T_DLG1_UNDER_MS — выныриваем тоже сразу (раньше висели под полом все секунды).
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
var D_REPLY_MS  = 0;                // пауза перед ответом на диалог (0 — отвечаем сразу, в том же вызове, где диалог пришёл)
var T_SKIN_MS   = 2500;             // после ответа «Да»: сколько ждать смену скина; не дождались — возвращаемся всё равно
var T_TAIL_MS   = 1200;             // после команды возврата ещё столько слушаем чат — только чтобы записать в журнал подтверждение «вернулись»
var USE_DEFAULT  = false;            // true — «/dress» без слов идёт через «/tpl pick N use» (вход в пикап БЕЗ движения, нужен мод tpl с командой use); false — как раньше, только «/dress use»
var UNDER_SEC    = 8;                // режим under: предел (страховка) удержания под полом, секунд; вынырнем раньше — сразу по смене скина
var T_USE_FB_MS  = 1800;            // «/dressu»: диалог не открылся за это время после use — сервер вход проигнорировал, добираем старым путём (точка возврата + телепорт)
var USE_FALLBACK_TP = false;        // /dressu: true — если вход не сработал, добирать старым путём (точка возврата, телепорт на пикап, возврат); false — НИКОГДА не телепортироваться (тестовые NPC не «стыкуются»), при неудаче просто сообщить об ошибке
var SYNC_MODE    = true;            // use-режим (/dressu, /dress use): перед входом включаем «/tpl sync N» — позиция в sync-пакете подменяется, сервер видит вас в SYNC_M м от пикапа, а вы стоите вплотную; false — use без подмены
var SYNC_M       = 2.2;             // метров от пикапа, которые увидит сервер: больше ~1.5 — «вышел с пикапа» (флаг снимается), до ~5 — сервер ещё принимает use (у пикапов с клавишей предел меньше)
var SYNC_SEC     = 6;               // предел окна подмены в моде tpl, сек (страховка: закроется само); обычно закрываем сами сразу по смене скина
var T_SYNC_ACK_MS = 1500;           // сколько ждать ответ мода «Sync-подмена: включена»
var SYNC_WAIT_MS = 700;             // пауза между включением подмены и use: первый пакет с новой позицией доходит до сервера (≤0.5 с у игры, обычно ~0), его таймер (250 мс) снимает флаг «игрок на пикапе»
var SYNC_PLAIN_ON_FAIL = true;      // подмена не включилась: true — один раз пробуем обычный use без подмены (без телепорта); false — стоп с ошибкой
var T_DLG1_USE_MS = 4000;           // режим use: диалог-список не открылся за это время — значит сервер вход не принял (далеко от пикапа) или мода use нет
var T_DLG1_UNDER_MS = 3500;         // режим under: диалог-список не открылся за это время — выныриваем сразу
var T_TOTAL_MS  = 30000;            // общий потолок — после него всё снимаем и возвращаемся
var LOG_NAME    = 'dress';          // файл журнала: HLOG/dress.txt (команда /jlog из мода hassle_jlog.c)
var LOG_CONSOLE = false;            // true — дублировать журнал и в консоль игры
var LOG_CHUNK   = 110;              // длиннее — режем строку на куски (поле ввода чата длинную команду не пропустит)
var LOG_GAP_MS  = 20;               // пауза между кусками: журнал уходит фоном и не задерживает сам процесс

var _dead = false;
var _undo = [];
function onUndo(fn) { _undo.push(fn); }
window.__dressCleanup = function () {
    _dead = true;
    try { endSession('перезагрузка скриптов', true); } catch (e) {}
    while (_undo.length) { try { _undo.pop()(); } catch (e) {} }
    window.__dressCleanup = null;
};

// ── журнал: HLOG/dress.txt через /jlog (нативный мод), запасной путь — консоль ──
// состояние мода: 0 — ещё не проверяли, 1 — отвечает, -1 — не отвечает (в этом APK-бандле его нет). Хранится в window: переживает /reload скриптов.
var JL = { q: [], busy: false, pingT: null };
function jlState() { return window.__dressJl || 0; }
function hms() {
    var d = new Date();
    function p(n, l) { n = String(n); while (n.length < l) n = '0' + n; return n; }
    return p(d.getHours(), 2) + ':' + p(d.getMinutes(), 2) + ':' + p(d.getSeconds(), 2) + '.' + p(d.getMilliseconds(), 3);
}
function toConsole(line) { try { console.log('[DRESS] ' + line); } catch (e) {} }
function jlPump() {
    if (_dead || JL.busy) return;
    var st = jlState();
    if (st === 0) return;                                           // ждём ответ на /jlog _ping
    if (!JL.q.length) return;
    if (st < 0) { while (JL.q.length) toConsole(JL.q.shift()); return; }
    JL.busy = true;
    var line = JL.q.shift();
    chatCmd('/jlog ' + LOG_NAME + ' ' + line);
    setTimeout(function () { JL.busy = false; jlPump(); }, LOG_GAP_MS);
}
function jlPing() {
    if (jlState() !== 0 || JL.pingT) return;
    chatCmd('/jlog _ping');                                         // отвечает мод: чат-строка «JLog: готов…» (см. onChat)
    JL.pingT = setTimeout(function () {
        JL.pingT = null;
        if (!_dead && jlState() === 0) { window.__dressJl = -1; toConsole('мод /jlog не ответил — журнал в консоли (нужен бандл с hassle_jlog.c)'); jlPump(); }
    }, 1500);
}
function fileLog(msg) {
    var s = hms() + (S ? ' +' + (Date.now() - S.t0) + 'мс' : '') + '  ' + String(msg).replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ');
    if (LOG_CONSOLE) toConsole(s);
    var first = true;
    while (s.length) {                                              // длинное режем; продолжения с отступом
        JL.q.push((first ? '' : '  ~ ') + s.slice(0, LOG_CHUNK));
        s = s.slice(LOG_CHUNK); first = false;
    }
    jlPump();
}
function log() {
    var m = [].slice.call(arguments).join(' ');
    try { fileLog(m); } catch (e) { toConsole(m); }
}
// чужие скрипты тоже могут писать в свой файл: window.JLog('имя', 'текст') → HLOG/имя.txt
window.JLog = function (name, text) {
    if (jlState() < 0) { toConsole(name + ': ' + text); return; }
    var s = hms() + '  ' + String(text).replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ');
    if (jlState() === 1) chatCmd('/jlog ' + String(name).replace(/[^A-Za-z0-9_-]/g, '').slice(0, 24) + ' ' + s.slice(0, LOG_CHUNK));
};
onUndo(function () { try { delete window.JLog; } catch (e) { window.JLog = undefined; } if (JL.pingT) { clearTimeout(JL.pingT); JL.pingT = null; } });
function warn() { log('ПРЕДУПРЕЖДЕНИЕ:', [].slice.call(arguments).join(' ')); }
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
// — хук смены скина (только на время сессии): вызов игрой setPlayerSkinId + смена player/skinId в Vuex-store, что придёт раньше —
function hookSkin(sess) {
    var ok = false;
    try {
        var cur = window.setPlayerSkinId;
        if (typeof cur === 'function') {
            var wrapped = function (skinId) {
                try { if (!_dead && S === sess) onSkin('setPlayerSkinId(' + skinId + ')'); } catch (err) { warn('onSkin:', err && err.message); }
                return cur.apply(this, arguments);
            };
            sess.skinOrig = cur; sess.skinWrap = wrapped;
            window.setPlayerSkinId = wrapped; ok = true;
        }
    } catch (e) {}
    try {
        var st = null;
        try { if (typeof _getVuexStore === 'function') st = _getVuexStore(); } catch (e) {}      // из области видимости Code.js
        if (!st && window.App && window.App.$store) st = window.App.$store;
        if (st && typeof st.watch === 'function') {
            sess.skinUnwatch = st.watch(function (state, getters) { return getters['player/skinId']; },
                function (v) { try { if (!_dead && S === sess) onSkin('store player/skinId=' + v); } catch (err) { warn('onSkin(store):', err && err.message); } });
            ok = true;
        }
    } catch (e) {}
    return ok;
}
function unhook(sess) {
    try { if (sess.skinUnwatch) sess.skinUnwatch(); } catch (e) {}
    try { if (sess.skinWrap && window.setPlayerSkinId === sess.skinWrap) window.setPlayerSkinId = sess.skinOrig; } catch (e) {}
    try { if (sess.chatWrap && window.OnChatAddMessage === sess.chatWrap) window.OnChatAddMessage = sess.chatOrig; } catch (e) {}
    try { if (sess.dlgWrap && window.addDialogInQueue === sess.dlgWrap) window.addDialogInQueue = sess.dlgOrig; } catch (e) {}
    // если поверх нас успели обернуть ещё раз — наша обёртка останется в цепочке, но по S !== sess она просто пропускает вызовы дальше
}

function startSession(pickNum, under, holdSec, use, fb, sync) {
    if (S) { info('уже выполняется (шаг «' + S.step + '»). Прервать: /dress stop'); return; }
    var sess = { step: (under || use) ? 'list' : 'save', under: !!under, use: !!use, fb: !!use && !!fb, sync: !!use && !!sync, syncOn: false, syncTimer: null, tSync: 0, tSyncCmd: 0, fbUsed: false, hold: holdSec || UNDER_SEC, pickNum: pickNum || 0, timers: [], list: [], listN: -1, listTimer: null, t0: Date.now(), tYes: 0, teleported: false, diving: false, returned: false, chatOrig: null, chatWrap: null, dlgOrig: null, dlgWrap: null, skinOrig: null, skinWrap: null, skinUnwatch: null };
    S = sess;
    if (!hookChat(sess)) { S = null; fail('не нашёл OnChatAddMessage — бот ещё не запущен?'); return; }
    if (!hookDialogs(sess)) { unhook(sess); S = null; fail('не нашёл addDialogInQueue — игра ещё не загрузила диалоги'); return; }
    var skinHooked = hookSkin(sess);
    jlPing();                                       // проверяем, отвечает ли мод /jlog (ответ ловит onChat); строки журнала до ответа ждут в очереди
    setTimer(function () { fail('общий тайм-аут'); endSession('тайм-аут', true); }, T_TOTAL_MS);
    log('=== старт Dress v2, шаг ' + sess.step + (use ? ', вход без движения (/tpl pick N use)' + (sess.sync ? ' + подмена позиции в sync (/tpl sync)' : '') : under ? ', нырок, предел ' + sess.hold + ' с' : ', на пикапе') + (pickNum ? ', пикап №' + pickNum : '') + '; ловлю смену скина: ' + (skinHooked ? 'да' : 'НЕТ (только чат и таймаут ' + T_SKIN_MS + ' мс)') + '; скин сейчас: ' + curSkin());
    if (under || use) {                             // нырок или «use»: возвращать никуда не надо (нырок возвращает сам /tpl, use не двигает) — точка возврата не нужна, сразу за списком пикапов
        if (!chatCmd('/tpl pick')) { fail('не удалось отправить /tpl pick'); endSession('нет чата', false); return; }
        sess.listTimer = setTimer(function () { fail('список пикапов не пришёл (рядом нет пикапов или мода /tpl нет в APK)'); endSession('нет списка', false); }, T_LIST_MS);
        return;
    }
    if (!chatCmd('/tpl save ' + BACK_NAME)) { fail('не удалось отправить команду в чат'); endSession('нет чата', false); return; }
    setTimer(function () { fail('/tpl не ответил на save — мод tpl не установлен в этом APK?'); endSession('нет ответа /tpl', false); }, T_SAVE_MS);
}

function curSkin() {
    try { if (typeof getSkinIdFromStore === 'function') { var v = getSkinIdFromStore(); if (v !== null && v !== undefined) return v; } } catch (e) {}
    try { var st = window.App && window.App.$store; if (st) return st.getters['player/skinId']; } catch (e) {}
    return '?';
}
// Выключить подмену позиции в sync (если включали): сервер снова видит настоящую позицию. Только отправка команды, БЕЗ записи в журнал — запись делает вызывающий.
// null — подмены не было; true/false — команда ушла/не ушла (при false окно закроется само через SYNC_SEC с).
function syncOffCmd(sess) {
    if (!sess || !sess.syncOn) return null;
    sess.syncOn = false;
    return chatCmd('/tpl sync off');
}
function syncOffLog(sess, so, why) {
    if (so === null) return;
    log('sync-подмена выключена (' + why + '): ' + (so ? '/tpl sync off' : 'НЕ УДАЛОСЬ отправить /tpl sync off — окно закроется само через ' + SYNC_SEC + ' с') + '; держалась ' + (sess.tSync ? (Date.now() - sess.tSync) : '?') + ' мс');
}
// Вернуться на место: нырок → «/tpl up» (вынырнуть немедленно), обычный режим → «/tpl go dressbk». Всё, что можно, шлём ДО записи в журнал.
function sendReturn(sess) {
    if (sess.diving) return chatCmd('/tpl up') ? '/tpl up' : '';
    if (sess.teleported) return chatCmd('/tpl go ' + BACK_NAME) ? '/tpl go ' + BACK_NAME : '';
    return null;
}
// Возврат сразу после смены скина (или по таймауту скина). Сессия остаётся ещё T_TAIL_MS — только слушать чат для журнала.
function returnNow(why) {
    var sess = S;
    if (!sess || sess.returned) return;
    sess.returned = true;
    clearTimers();
    var t = Date.now(), so = syncOffCmd(sess), cmd = sendReturn(sess);      // подмену снимаем первой: сервер сразу видит настоящую позицию
    sess.step = 'tail';
    syncOffLog(sess, so, why);
    if (cmd === null) log('возврат не нужен (' + why + ')');
    else if (cmd === '') { fail('не удалось отправить команду возврата!'); log('ОШИБКА: команда возврата не отправилась (' + why + ')'); }
    else log('ВОЗВРАТ: ' + cmd + ' (' + why + '), с момента «Да» прошло ' + (sess.tYes ? (t - sess.tYes) : '?') + ' мс, с момента старта ' + (t - sess.t0) + ' мс');
    setTimer(function () { endSession('готово', false); }, T_TAIL_MS);
    gtAdd(sess.use ? '~g~Dress: ~w~переоделся' : '~g~Dress: ~w~вернулся на место');
}
function onSkin(src) {
    if (!S) return;
    if (S.step !== 'wait') { log('смена скина (' + src + ') не в ожидании — шаг «' + S.step + '», игнорирую'); return; }
    log('скин сменился: ' + src + ', через ' + (S.tYes ? (Date.now() - S.tYes) : '?') + ' мс после «Да»');
    returnNow('скин сменился');
}

function endSession(why, goBack) {
    var sess = S;
    if (!sess) return;
    var cmd = null, so = syncOffCmd(sess);            // подмену позиции снимаем в любом случае и первой
    if (goBack && !sess.returned) cmd = sendReturn(sess);             // потом возврат — потом всё остальное
    clearTimers();
    unhook(sess);
    S = null;                                        // дальше любые хвосты хуков просто пропускают вызовы
    sess.returned = true;
    syncOffLog(sess, so, why);
    log('конец: ' + why + ' (всего ' + (Date.now() - sess.t0) + ' мс)' + (cmd ? '; возврат: ' + cmd : ''));
    if (cmd) info('вернулся на место (' + why + ')');
}

// ───────────────────────── разбор чата ─────────────────────────
var RX_SAVED  = new RegExp('Точка\\s*«\\s*' + BACK_NAME + '\\s*»\\s*(сохранена|обновлена)', 'i');
var RX_HEADER = /Пикапы и маркеры рядом:\s*(\d+)/i;
var RX_NONE   = /Пикапов и маркеров рядом нет|Пикапы: пул не прочитался/i;
var RX_LINE   = /(\d+)\.\s+ID\s+(\d+)\s+\[модель\s+([^\]]+)\]\s*—\s*(\d+)\s*м/;
var RX_SYNC_ON  = /Sync-подмена:\s*включена/i;                                  // ответ мода tpl на «/tpl sync N …»
var RX_SYNC_ERR = /Sync-подмена:\s*ошибка/i;                                    // не получилось (нет пикапа, перехват не встал, в машине…)
var RX_TPL_OLD  = /не команда и не сохранённая точка|Используйте:\s*\/tpl/i;      // мод tpl без команды sync: «/tpl sync …» он принял за мусор и показал подсказку
var RX_TPL_ERR = /Точка:\s*(уже|не удалось)/i;   // «Точка: уже 64 точки…» / «Точка: не удалось прочитать ваши координаты»

var RX_JLOG   = /JLog:\s*готов/i;                       // ответ мода hassle_jlog.c на «/jlog _ping»
var RX_DONE   = /Вы переоделись/i;                      // сообщение сервера сразу после смены одежды (запасной сигнал, если скин не заметили)
var RX_LOGCHAT = /Sync|Точка|икап|Нырок|переод|елепорт|аздевал|Нельзя|не можете|Вы /;   // какие строки чата пишем в журнал (чужой чат не нужен)
function onChat(raw) {
    var text = strip(raw);
    if (RX_JLOG.test(text)) {
        window.__dressJl = 1;
        if (JL.pingT) { clearTimeout(JL.pingT); JL.pingT = null; }
        jlPump();
        return;
    }
    if (!S) return;
    if (RX_LOGCHAT.test(text)) log('чат: ' + text.slice(0, 160));
    if (S.step === 'wait' && RX_DONE.test(text)) { returnNow('сообщение сервера «Вы переоделись»'); return; }
    if (S.step === 'sync') {                           // ждём ответ мода на «/tpl sync N …»
        if (RX_SYNC_ON.test(text)) {
            if (S.syncTimer) { clearTimeout(S.syncTimer); S.syncTimer = null; }
            S.syncOn = true; S.tSync = Date.now();
            log('sync-подмена включена (ответ мода через ' + (S.tSync - S.tSyncCmd) + ' мс) — жду ' + SYNC_WAIT_MS + ' мс: сервер должен увидеть новую позицию и снять флаг пикапа');
            S.syncTimer = setTimer(function () { afterSync(); }, SYNC_WAIT_MS);
        } else if (RX_SYNC_ERR.test(text)) syncFailed(text.slice(0, 140));
        else if (RX_TPL_OLD.test(text)) syncFailed('мод tpl не знает «/tpl sync» (старая сборка бандла?)');
        return;
    }
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

// «/dressu»: вход без движения (use) не открыл диалог — повторяем ПО-СТАРОМУ с самого начала (сохранить точку → список → телепорт на пикап → возврат).
// Возврат нужен, только если мы телепортировались: до этого момента S.teleported = false, так что при любой ошибке по дороге вас никуда не «вернёт».
function fallbackToTp() {
    if (!S || S.step !== 'tp' || S.fbUsed) return;
    S.fbUsed = true; S.use = false;
    syncOffLog(S, syncOffCmd(S), 'запасной путь');
    log('use не открыл диалог за ' + T_USE_FB_MS + ' мс — запасной путь: точка возврата и телепорт на пикап');
    info('вход без движения не сработал — телепорт на пикап');
    clearTimers();
    S.step = 'save'; S.list = []; S.listN = -1;
    setTimer(function () { fail('общий тайм-аут'); endSession('тайм-аут', true); }, T_TOTAL_MS);
    if (!chatCmd('/tpl save ' + BACK_NAME)) { fail('не удалось отправить команду в чат'); endSession('нет чата', false); return; }
    setTimer(function () { fail('/tpl не ответил на save'); endSession('нет ответа /tpl', false); }, T_SAVE_MS);
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
    log('выбран пикап №' + sel.n + ' (ID ' + sel.id + ', модель ' + sel.model + ', ' + sel.d + ' м) — ' + (S.use ? (S.sync ? 'вход без движения с подменой позиции в sync' : 'вход без движения') : S.under ? 'нырок' : 'телепорт') + '; в списке было ' + S.list.length + ' шт.');
    var t1 = T_DLG1_MS;
    if (S.use) {
        // use: не двигаемся — мод сам вызывает игровой вход в пикап; возвращать нечего (teleported/diving остаются false)
        if (S.sync) { startSync(sel); return; }          // сначала подмена позиции, use пойдёт из afterSync()
        if (!sendUse(sel)) return;
        t1 = useTimeout();
    } else if (S.under) {
        // нырок: возвращаем командой «/tpl up» сразу после смены скина; не успели — мод сам вынырнет через hold секунд (предел)
        t1 = Math.min(T_DLG1_UNDER_MS, Math.round(S.hold * 1000) + 1500);
        S.diving = true;
        if (!chatCmd('/tpl pick ' + sel.n + ' under ' + S.hold)) { S.diving = false; fail('не удалось отправить /tpl pick N under'); endSession('нет чата', false); return; }
    } else {
        S.teleported = true;                            // с этого момента при любой ошибке возвращаемся
        if (!chatCmd('/tpl pick ' + sel.n)) { S.teleported = false; fail('не удалось отправить /tpl pick N'); endSession('нет чата', false); return; }
    }
    armDlgTimer(t1);
}

function useTimeout() { return (S && S.use && S.fb) ? T_USE_FB_MS : T_DLG1_USE_MS; }
function sendUse(sel) {
    if (!chatCmd('/tpl pick ' + sel.n + ' use')) { fail('не удалось отправить /tpl pick N use'); endSession('нет чата', false); return false; }
    return true;
}
// Ждём диалог-список; не пришёл — ошибка (для /dressu с USE_FALLBACK_TP — запасной путь с телепортом)
function armDlgTimer(t1) {
    S.dlgTimer = setTimer(function () {
        if (S.use && S.fb && !S.fbUsed) { fallbackToTp(); return; }       // /dressu + USE_FALLBACK_TP: use не сработал — запасной путь
        fail('диалог «Раздевалка» не открылся за ' + (t1 / 1000) + ' с' + (S.use ? (S.sync ? ' (use с подменой позиции: сервер не принял вход — смотрите чат и HLOG/dress.txt; старый способ: /dress tp)' : ' (use: вы дальше ~5 м от пикапа, либо мод tpl без команды use — смотрите чат; старый способ: /dress tp)') : '')); endSession('нет диалога 1', true);
    }, t1);
}
// Подмена позиции: «/tpl sync N метры сек» → ответ мода (onChat, шаг «sync») → пауза SYNC_WAIT_MS → afterSync(): use
function startSync(sel) {
    S.step = 'sync';
    var cmd = '/tpl sync ' + sel.n + ' ' + SYNC_M + ' ' + SYNC_SEC;
    S.tSyncCmd = Date.now();
    if (!chatCmd(cmd)) { fail('не удалось отправить ' + cmd); endSession('нет чата', false); return; }
    log('подмена позиции: ' + cmd + ' (вы стоите на месте; пикап №' + sel.n + ' по списку в ' + sel.d + ' м)');
    S.syncTimer = setTimer(function () { syncFailed('нет ответа мода за ' + T_SYNC_ACK_MS + ' мс (в APK нет мода tpl с «/tpl sync»?)'); }, T_SYNC_ACK_MS);
}
function afterSync() {
    if (!S || S.step !== 'sync') return;
    S.syncTimer = null;
    S.step = 'tp';                                      // теперь ждём диалог-список (onDialog)
    if (!sendUse(S.sel)) return;
    armDlgTimer(useTimeout());
}
function syncFailed(why) {
    if (!S || S.step !== 'sync') return;
    if (S.syncTimer) { clearTimeout(S.syncTimer); S.syncTimer = null; }
    log('sync-подмена не включилась: ' + why);
    if (!SYNC_PLAIN_ON_FAIL) { fail('подмена позиции не включилась: ' + why); endSession('sync не включился', false); return; }
    info('подмена позиции не включилась — пробую вход без неё (без телепорта)');
    S.sync = false; S.step = 'tp';
    if (!sendUse(S.sel)) return;
    armDlgTimer(useTimeout());
}

// выполнить действие сейчас (D_REPLY_MS = 0) или через D_REPLY_MS; ошибка — завершаем сессию с возвратом
function act(fn) {
    var run = function () { try { fn(); } catch (e) { fail('ошибка ответа на диалог: ' + (e && e.message)); endSession('ошибка', true); } };
    if (D_REPLY_MS > 0) setTimer(run, D_REPLY_MS); else run();
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
    log('диалог раздевалки: id=' + id + ' style=' + style + ' «' + title + '» ' + strip(raw).slice(0, 100));

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
        log('диалог 1 (id ' + id + '): пункт ' + (idx + 1) + ' «' + items[idx] + '» → Далее');
        act(function () { respond(id, 1, idx, items[idx]); });                         // «Далее»
        return true;
    }
    if (S.step === 'dlg2' && style === 0) {
        clearTimers();
        S.step = 'wait';                                // ждём смену скина: по ней сразу возвращаемся (onSkin / «Вы переоделись»), иначе по таймауту
        log('диалог 2 (id ' + id + '): «' + strip(raw).slice(0, 80) + '» → Да');
        act(function () { respond(id, 1, -1, ''); if (S) S.tYes = Date.now(); });     // «Да»
        if (S && S.step === 'wait') setTimer(function () { log('скин не сменился за ' + T_SKIN_MS + ' мс — возвращаемся по таймауту'); returnNow('таймаут смены скина'); }, T_SKIN_MS);
        return true;
    }
    return false;
}

// ───────────────────────── команда в чате ─────────────────────────
function statusText() {
    return S ? ((S.use ? (S.sync ? 'вход без движения + подмена sync, ' : 'вход без движения, ')  : S.under ? 'под пикап, ' : '') + 'шаг «' + S.step + '», ' + Math.round((Date.now() - S.t0) / 100) / 10 + ' с') : 'не запущено';
}
function runCmd(args, fb) {
    var a = (args[0] || '').toLowerCase();
    if (a === 'stop' || a === 'стоп') { if (S) endSession('прервано командой', true); else info('нечего прерывать'); return; }
    if (a === 'status' || a === 'статус') { info(statusText()); return; }
    if (a === 'log' || a === 'лог') {
        var js = jlState();
        info('журнал: HLOG/' + LOG_NAME + '.txt (' + (js === 1 ? 'мод /jlog отвечает' : js < 0 ? 'мода /jlog нет в бандле — пишу в консоль' : 'мод /jlog ещё не проверен — запустите /dress') + ')');
        return;
    }
    // разбор: число ДО слова under — номер пикапа N, число ПОСЛЕ него — секунды; без under единственное число — номер N
    var under = false, n = 0, sec = 0, i, w, v, use = USE_DEFAULT, sync = SYNC_MODE;
    for (i = 0; i < args.length; i++) {
        w = String(args[i]).toLowerCase();
        if (/^(under|dive|нырок|ниже|под)$/.test(w)) { under = true; continue; }
        if (/^(use|touch|вход)$/.test(w)) { use = true; continue; }          // войти в пикап, не двигаясь (мод tpl: /tpl pick N use)
        if (/^(nosync|plain|безсинк)$/.test(w)) { sync = false; continue; }   // use без подмены позиции в sync
        if (/^(sync|синк|подмена)$/.test(w)) { sync = true; continue; }       // use с подменой (по умолчанию так, если SYNC_MODE)
        if (/^(tp|old|телепорт)$/.test(w)) { use = false; continue; }        // принудительно старый способ: телепорт на пикап и возврат
        v = parseFloat(w.replace(',', '.'));
        if (isNaN(v)) { fail('не понял «' + w + '». Примеры: /dress, /dress use, /dress 2 use, /dress use nosync, /dress tp, /dress 2, /dress under, /dress 2 under 4, /dress log'); return; }
        if (under) sec = v; else n = Math.round(v);
    }
    if (sec) sec = Math.max(0.2, Math.min(15, sec));
    if (use) under = false;                           // use важнее под-пикапного нырка
    startSession(n, under, sec, use, !!fb && use, sync);
}

var origChatWin = window.sendChatInputCustom;
var origChatVar = null;
try { if (typeof sendChatInput === 'function') origChatVar = sendChatInput; } catch (e) {}
var prevChat = origChatWin || origChatVar;
var myChat = function (e) {
    if (!_dead && typeof e === 'string') {
        var a = e.trim().split(/\s+/), cmd = (a[0] || '').toLowerCase();
        if (cmd === '/dress' || cmd === '/раздевалка') { runCmd(a.slice(1)); return; }
        if (cmd === '/dressu' || cmd === '/раздевалка2') { runCmd(['use'].concat(a.slice(1)), USE_FALLBACK_TP); return; }   // use (+ подмена позиции в sync); запасной телепорт — только если USE_FALLBACK_TP = true
    }
    if (typeof prevChat === 'function') return prevChat.apply(this, arguments);
};
window.sendChatInputCustom = myChat;
try { sendChatInput = myChat; } catch (e) {}
onUndo(function () {
    if (window.sendChatInputCustom === myChat) window.sendChatInputCustom = origChatWin;
    try { if (sendChatInput === myChat) sendChatInput = origChatVar || origChatWin; } catch (e) {}
});

window.Dress = { run: function (n, under, sec, use, fb, sync) { startSession(n || 0, !!under, sec || 0, !!use, !!fb, sync === undefined ? SYNC_MODE : !!sync); }, stop: function () { if (S) endSession('прервано', true); }, status: statusText };
onUndo(function () { try { delete window.Dress; } catch (e) { window.Dress = undefined; } });

log('Dress.js v2.3 загружен: /dressu [N] (вход без движения + подмена позиции в sync, без телепорта' + (USE_FALLBACK_TP ? '; не сработал — добирает телепортом' : '') + '), /dress [N] [use [nosync]|tp], /dress [N] under [предел-сек], /dress stop, /dress status, /dress log (use — вход в пикап без движения, нужен мод /tpl с командой «use»; under — с командой «up»; журнал — мод /jlog)');

})(); } catch (e) { try { console.error('[DRESS] ошибка загрузки Dress.js:', e); } catch (e2) {} }
