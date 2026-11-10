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
// Версия 3.3: «моментальное» теперь действительно моментальное.
//   (1) «Заряд»: цепочку раздевалки проходим ЗАРАНЕЕ до последнего вопроса «Да/Нет» (надеть — за DN_ARM_LEAD_MS до :00, снять — сразу после надевания), диалог держим открытым,
//       а в нужный момент уходит ОДИН ответ «Да» — это задержка одного пакета, а не трёх кругов «запрос → ответ». «Вслепую» (без открытого диалога) нельзя:
//       сервер (include/core/dialog.pwn, OnDialogResponse) принимает ответ только на диалог, который реально показан. Заряд не вышел — идём обычной цепочкой, как раньше.
//   (2) Баг: если PayDay приходил, пока форма ещё надевалась, флаг pdPending ставился, но тут же сбрасывался и нигде не использовался — снятие шло по запасному таймеру через 30 с. Теперь снимаем сразу после надевания.
//   (3) FAR_MAX_M 4.5 → 3.8: пикап принимает вход до 5 м, а ответы на диалоги раздевалки сервер принимает только до 4 м (IsPlayerInPickupEx(…, 4.0, …)) — на 4–4,5 м диалог открывался, ответ молча игнорировался.
//   (4) После смены скина сессия закрывается сразу (раньше ещё +1,2 с «хвоста» на журнал): замеры «заняло» честные, следующий шаг цикла стартует раньше.
//   (5) Проверка «второй раз сработает»: при ВКЛ сама (надеть → снять), кнопка «🧪 Проверка» в Telegram и /dressnight check; в Telegram — результат и причина, если не вышло.
//   (6) Часы: по строкам PayDay узнаём, не отстают ли часы телефона от сервера, и в моментальном стартуем раньше на эту разницу (только в сторону «раньше»). Пока ни одного PayDay не сверено — запас +1,5 с (DN_UNLEARNED_EXTRA_MS), как в 3.2.
//   (8) Снятие по первой строке PayDay: сервер шлёт общую рассылку «Текущее время: ЧЧ:00» ДО личных строк («Зарплата…»), а весь OnPayDay идёт одним тиком, так что «Да» уйдёт раньше и всё равно после проверки формы (DN_EARLY_PAYDAY).
//   (7) Между двумя входами в пикап — пауза ≥450 мс (USE_GAP_MS): сервер молча игнорирует вход чаще раза в 300 мс и пока не отработал TIMER_250_MS (иначе «снять» сразу после «надеть» мог не открыть диалог).
// Версия 3.2: тип переодевания в «Переодевание ночь» — «обычное» (как раньше: надеть в :59:35–:59:45, снять через 0,3–1,2 с после PayDay) или «моментальное» (надеть впритык к :00 — старт = замеренное время надевания + запас DN_FAST_MARGIN_MS, точным таймером, а не раз в секунду; снять сразу по строке PayDay, без паузы). Выбор: кнопка «⚡ Тип» в меню Telegram и на экране ВКЛ, /dressnight on [auth|return] [fast|normal], /dressnight speed fast|normal.
// Версия 3.1: в Telegram после каждого переодевания в ночном режиме — сколько заняло /dressu (надевание в :59 и снятие после PayDay): длительность, время старта и конца с десятыми секунды (МСК), отступ от :00, а при снятии — сколько прошло от строки PayDay.
// Версия 3.3: режим «auth» заменён на «off» — после рестарта просто отключаемся («/rec off»: камера в воздух + разрыв, без переподключения), автовход НЕ трогаем и на окно авторизации не идём. Вернуться — «/rec 5» (кнопка «🔌 Зайти» в Telegram или руками): после входа цикл на паузе, кнопка «Вернуться на место и продолжить». Слова auth/авт/login принимаются как раньше (= off).
// Версия 3.0: пока «Переодевание ночь» включено, строй/сбор/готовность/конф на рации игнорируется полностью (DN_IGNORE_STROY): без реконнекта, без сообщений в Telegram, без озвучки Ozv.js. Code.js не менялся — всё делает хук чата и подмена performStroiReconnect/exitAfterStroiPayDay на время ночного режима.
// Версия 2.9: «Переодевание ночь» — выбор, что делать после РЕСТАРТА сервера (сообщение «Сервер возобновит работу в течении минуты» или обрыв связи без нашего /rec):
//   🔐 «auth»   — автовход выключаем, /rec 5: висим на окне авторизации. Зашли (руками или кнопкой «Выйти с автр.») — цикл на паузе, кнопка «Вернуться на место и продолжить»;
//   📍 «return» — автовход включён, /rec 90: выходим сразу и заходим заново, когда сервер уже поднялся; на серверный диалог «Восстановление позиции» отвечаем «Да»;
//                 после входа /tpl go dressnight (место и интерьер запоминаются при нажатии «ВКЛ») и цикл продолжается с нужного места.
//   Выбор — при нажатии «ВКЛ» в Telegram (или /dressnight on off|return); сменить можно кнопкой «После рестарта» в меню или /dressnight mode off|return. Нужен мод /tpl (save/go), APK пересобирать не надо.
// Версия 2.8: диагностика расстояния до пикапа точная — «слишком близко» теперь говорит, на сколько метров отойти (стойте на NEAR_MIN_M…FAR_MAX_M м, без телепортов), добавлено «слишком далеко» (сервер принимает вход только до ~5 м); при обеих причинах ночной режим не тратит повторные попытки.
// Версия 2.7: исправлен баг «список пикапов не пришёл» через 2,5 с: мод отвечает синхронно, таймер списка заводился ПОСЛЕ уже прошедшего списка и убивал живую сессию — из-за него настоящая причина (диалог не открылся) терялась.
// Версия 2.6: диагностика «слишком близко к пикапу» (сервер игнорирует повторный вход, пока вы ближе 1.5 м; работает на 1.5…4 м) — сообщение вместо молчаливой неудачи.
// Версия 2.5: TP_FALLBACK = false — автоматического телепорта при неудаче входа больше нет (ни в /dressu, ни в ночном режиме).
// Версия 2.4: в «Переодевание ночь» после первого удачного круга пикап запоминается (FAST_USE) — дальше без «/tpl pick» и списка в чат, сразу «/tpl pick N use»; время в сообщениях бота — МСК (DN_SERVER_TZ_H), а не часы телефона.
// Версия 2.3: «Переодевание ночь» (см. блок ниже): /nocol on → /dressu → ждать :59:РР → /dressu → PayDay в :00 → /dressu → по кругу; кнопка «👗 Переодевание ночь» в Telegram → «Функции», команда /dressnight. Dress.run получил 6-й параметр — колбэк завершения.
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
var T_DLG1_USE_MS = 4000;           // режим use: диалог-список не открылся за это время — значит сервер вход не принял (далеко от пикапа) или мода use нет
var T_DLG1_UNDER_MS = 3500;         // режим under: диалог-список не открылся за это время — выныриваем сразу
var TP_FALLBACK = false;            // true — «/dressu» и «Переодевание ночь», если вход без движения не открыл диалог, добирают телепортом на пикап (/tpl save → /tpl pick N → /tpl go). false — телепорта нет вообще: не вышло, значит не вышло (ночной режим сам повторит попытку). Ручной «/dress tp» работает всегда
var NEAR_MIN_M  = 1.7;              // сервер (TIMER_250_MS в new.pwn) сбрасывает «вы стоите на пикапе» (P_IN_PICKUP) только когда вы дальше 1.5 м от него; пока ближе — повторный вход в тот же пикап молча игнорируется. 1.7 = 1.5 + запас
var FAR_MAX_M   = 3.8;              // вход в пикап сервер принимает до 5 м (IsPlayerInPickup(..., 5.0)), но ответы на диалоги раздевалки — только до 4 м (IsPlayerInPickupEx(..., 4.0, ...) в DIALOG_TEAM_SKIN / DIALOG_TEAM_SKIN_CHANGE): на 4–5 м диалог откроется, а «Далее»/«Да» сервер молча проигнорирует. 3.8 — с запасом на неточность позиции
var FAST_USE    = true;             // только «Переодевание ночь»: пикап уже известен (стоим у него) — шлём сразу «/tpl pick N use», без «/tpl pick» и разбора списка; не вышло — один раз пересобираем список
var PKC         = null;             // {n, id} — пикап раздевалки, с которого прошлый раз реально открылся диалог (номер N из снимка мода tpl; use ищет пикап по ID из снимка)
var ARM_HOLD_MAX_MS = 75000;        // «заряженный» диалог: дольше столько не держим — снимаем («Нет» + «Отмена»), слот диалога на сервере освобождается
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
    if (!S) return null;                                                // сессия уже закончилась (мод отвечает синхронно, внутри chatCmd)
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

function sessDone(sess, ok, why) {                  // колбэк завершения (для «Переодевание ночь»): ровно один раз на сессию
    if (!sess || sess.cbDone) return;
    sess.cbDone = true;
    if (typeof sess.cb !== 'function') return;
    try { sess.cb({ ok: !!ok, why: why, skin0: sess.skin0, skin1: curSkin(), ms: Date.now() - sess.t0, armed: !!sess.arm && !!sess.tYes, armMs: sess.tArmed ? sess.tArmed - sess.t0 : 0, fireMs: (sess.tYes && sess.tSkin) ? Math.max(0, sess.tSkin - sess.tYes) : 0, dist: sess.dist }); } catch (e) { warn('cb:', e && e.message); }
}
// Сервер не принимает вход в пикап чаще, чем раз в 300 мс (g_pickup_flood в OnPlayerPickUpDynamicPickup), и пока TIMER_250_MS не сбросил P_IN_PICKUP; молча, без ответа.
// «Заряд» «снять» сразу после «надеть» мог попасть в это окно на быстрой сети — вход терялся и диалог не открывался. Держим паузу между входами.
var USE_GAP_MS = 450, LAST_USE_AT = 0, USE_DEFER = false;
function startSession(pickNum, under, holdSec, use, fb, cb, opt) {
    if (USE_DEFER) { if (typeof cb === 'function') { try { cb({ ok: false, why: 'busy', busy: true }); } catch (e) {} } return; }
    if (use && !under && !S) {
        var gapUse = USE_GAP_MS - (Date.now() - LAST_USE_AT);
        if (gapUse > 0) {
            USE_DEFER = true;
            log('пауза ' + gapUse + ' мс перед входом в пикап (сервер игнорирует повторный вход чаще раза в 300 мс)');
            setTimeout(function () { USE_DEFER = false; if (_dead) return; startSession(pickNum, under, holdSec, use, fb, cb, opt); }, gapUse);
            return;
        }
    }
    if (S) { info('уже выполняется (шаг «' + S.step + '»). Прервать: /dress stop'); if (typeof cb === 'function') { try { cb({ ok: false, why: 'busy', busy: true }); } catch (e) {} } return; }
    var sess = { cb: cb || null, cbDone: false, dressed: false, skin0: curSkin(), step: (under || use) ? 'list' : 'save', under: !!under, use: !!use, fb: !!use && !!fb && TP_FALLBACK, fbUsed: false, hold: holdSec || UNDER_SEC, pickNum: pickNum || 0, timers: [], list: [], listN: -1, listTimer: null, t0: Date.now(), tYes: 0, teleported: false, diving: false, returned: false, chatOrig: null, chatWrap: null, dlgOrig: null, dlgWrap: null, skinOrig: null, skinWrap: null, skinUnwatch: null, arm: !!(opt && opt.arm), onArmed: (opt && opt.onArmed) || null, armId: null, tArmed: 0, tSkin: 0, released: false, dist: NaN };
    S = sess;
    if (use && !under) LAST_USE_AT = Date.now();
    if (!hookChat(sess)) { S = null; fail('не нашёл OnChatAddMessage — бот ещё не запущен?'); sessDone(sess, false, 'нет хука чата'); return; }
    if (!hookDialogs(sess)) { unhook(sess); S = null; fail('не нашёл addDialogInQueue — игра ещё не загрузила диалоги'); sessDone(sess, false, 'нет хука диалогов'); return; }
    var skinHooked = hookSkin(sess);
    jlPing();                                       // проверяем, отвечает ли мод /jlog (ответ ловит onChat); строки журнала до ответа ждут в очереди
    setTimer(function () { fail('общий тайм-аут'); endSession('тайм-аут', true); }, T_TOTAL_MS);
    log('=== старт Dress v2, шаг ' + sess.step + (use ? ', вход без движения (/tpl pick N use)' : under ? ', нырок, предел ' + sess.hold + ' с' : ', на пикапе') + (pickNum ? ', пикап №' + pickNum : '') + '; ловлю смену скина: ' + (skinHooked ? 'да' : 'НЕТ (только чат и таймаут ' + T_SKIN_MS + ' мс)') + '; скин сейчас: ' + curSkin());
    if (FAST_USE && use && !under && fb && !pickNum && PKC && typeof DN !== 'undefined' && DN.on) {   // быстрый путь для ночного режима
        sess.fast = true; sess.step = 'tp'; sess.sel = PKC;
        log('быстрый путь: пикап №' + PKC.n + ' (ID ' + PKC.id + ') известен — /tpl pick ' + PKC.n + ' use без списка');
        if (chatCmd('/tpl pick ' + PKC.n + ' use')) {
            if (S === sess && sess.fast && sess.step === 'tp') S.dlgTimer = setTimer(function () { fastFail('диалог не открылся за ' + T_USE_FB_MS + ' мс'); }, T_USE_FB_MS);
            return;
        }
        sess.fast = false; sess.step = 'list'; sess.sel = null; PKC = null;                             // команда не ушла — идём обычным путём
    }
    if (under || use) {                             // нырок или «use»: возвращать никуда не надо (нырок возвращает сам /tpl, use не двигает) — точка возврата не нужна, сразу за списком пикапов
        if (!chatCmd('/tpl pick')) { fail('не удалось отправить /tpl pick'); endSession('нет чата', false); return; }
        // мод отвечает СИНХРОННО (внутри chatCmd): список, выбор пикапа и «use» могут пройти ещё до этой строки. Таймер списка заводим, только если мы всё ещё ждём список —
        // иначе он «осиротеет» и через T_LIST_MS убьёт уже идущую сессию («список не пришёл» при том, что список был)
        if (S === sess && sess.step === 'list') sess.listTimer = setTimer(function () { fail('список пикапов не пришёл (рядом нет пикапов или мода /tpl нет в APK)'); endSession('нет списка', false); }, T_LIST_MS);
        return;
    }
    if (!chatCmd('/tpl save ' + BACK_NAME)) { fail('не удалось отправить команду в чат'); endSession('нет чата', false); return; }
    if (S === sess && sess.step === 'save') setTimer(function () { fail('/tpl не ответил на save — мод tpl не установлен в этом APK?'); endSession('нет ответа /tpl', false); }, T_SAVE_MS);
}

function curSkin() {
    try { if (typeof getSkinIdFromStore === 'function') { var v = getSkinIdFromStore(); if (v !== null && v !== undefined) return v; } } catch (e) {}
    try { var st = window.App && window.App.$store; if (st) return st.getters['player/skinId']; } catch (e) {}
    return '?';
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
    var t = Date.now(), cmd = sendReturn(sess);
    sess.step = 'tail';
    if (cmd === null) log('возврат не нужен (' + why + ')');
    else if (cmd === '') { fail('не удалось отправить команду возврата!'); log('ОШИБКА: команда возврата не отправилась (' + why + ')'); }
    else log('ВОЗВРАТ: ' + cmd + ' (' + why + '), с момента «Да» прошло ' + (sess.tYes ? (t - sess.tYes) : '?') + ' мс, с момента старта ' + (t - sess.t0) + ' мс');
    if (sess.dressed && !sess.tSkin) sess.tSkin = Date.now();
    setTimer(function () { endSession('готово', false); }, (sess.use && !sess.teleported && !sess.diving) ? 0 : T_TAIL_MS);   // вход без движения: возвращать нечего, «хвост» не нужен — сессия закрывается сразу
    gtAdd(sess.use ? '~g~Dress: ~w~переоделся' : '~g~Dress: ~w~вернулся на место');
}
function onSkin(src) {
    if (!S) return;
    if (S.step !== 'wait') { log('смена скина (' + src + ') не в ожидании — шаг «' + S.step + '», игнорирую'); return; }
    S.dressed = true; S.tSkin = Date.now();
    log('скин сменился: ' + src + ', через ' + (S.tYes ? (Date.now() - S.tYes) : '?') + ' мс после «Да»');
    returnNow('скин сменился');
}

function endSession(why, goBack) {
    var sess = S;
    if (!sess) return;
    if (sess.step === 'armed' && !_dead && why !== 'рестарт сервера') { releaseArmed(sess, why); return; }   // заряд не использован: сначала освобождаем диалог на сервере
    if (sess.step === 'armed') { try { blindRelease(sess); } catch (e) {} }                                  // скрипты перезагружаются / рестарт: освободить слот и сразу выйти
    var cmd = null;
    if (goBack && !sess.returned) cmd = sendReturn(sess);             // сначала возврат — потом всё остальное
    clearTimers();
    unhook(sess);
    S = null;                                        // дальше любые хвосты хуков просто пропускают вызовы
    sess.returned = true;
    log('конец: ' + why + ' (всего ' + (Date.now() - sess.t0) + ' мс)' + (cmd ? '; возврат: ' + cmd : ''));
    if (cmd) info('вернулся на место (' + why + ')');
    if (sess.dressed && sess.use && !sess.fbUsed && sess.sel && sess.sel.id > 0) PKC = { n: sess.sel.n, id: sess.sel.id };   // этот пикап сработал — в ночном режиме дальше идём к нему напрямую
    var s1 = curSkin();
    sessDone(sess, sess.dressed || (sess.skin0 !== '?' && s1 !== '?' && String(s1) !== String(sess.skin0)), why);
}

// ───────────────────────── разбор чата ─────────────────────────
var RX_SAVED  = new RegExp('Точка\\s*«\\s*' + BACK_NAME + '\\s*»\\s*(сохранена|обновлена)', 'i');
var RX_HEADER = /Пикапы и маркеры рядом:\s*(\d+)/i;
var RX_NONE   = /Пикапов и маркеров рядом нет|Пикапы: пул не прочитался/i;
var RX_LINE   = /(\d+)\.\s+ID\s+(\d+)\s+\[модель\s+([^\]]+)\]\s*—\s*(\d+)\s*м/;
var RX_FAST_BAD = /уже не в зоне стрима|такого номера нет|Списка пикапов ещё нет|use: не вышло|только с пикапами|нет OnTriggerEnter/i;   // мод отказал во «/tpl pick N use»
var RX_DIST     = /до пикапа ~\s*([\d.,]+)\s*м/;                                     // мод пишет расстояние в ответе на «/tpl pick N use»
var RX_FAST_ID  = /Пикап №\d+ \(ID (\d+)\)/;
var RX_TPL_ERR = /Точка:\s*(уже|не удалось)/i;   // «Точка: уже 64 точки…» / «Точка: не удалось прочитать ваши координаты»

var RX_JLOG   = /JLog:\s*готов/i;                       // ответ мода hassle_jlog.c на «/jlog _ping»
var RX_DONE   = /Вы переоделись/i;                      // сообщение сервера сразу после смены одежды (запасной сигнал, если скин не заметили)
var RX_LOGCHAT = /Точка|икап|Нырок|переод|елепорт|аздевал|Нельзя|не можете|Вы /;   // какие строки чата пишем в журнал (чужой чат не нужен)
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
    if (S.step === 'tp' && S.use) { var dm = RX_DIST.exec(text); if (dm) { S.dist = parseFloat(dm[1].replace(',', '.')); log('расстояние до пикапа по ответу мода: ' + S.dist + ' м'); } }
    if (S.step === 'wait' && RX_DONE.test(text)) { S.dressed = true; returnNow('сообщение сервера «Вы переоделись»'); return; }
    if (S.fast && S.step === 'tp') {                                    // быстрый путь: ответ мода на «/tpl pick N use»
        if (RX_FAST_BAD.test(text)) { fastFail('мод: ' + text.slice(0, 90)); return; }
        var fm = RX_FAST_ID.exec(text);
        if (fm && PKC && parseInt(fm[1], 10) !== PKC.id) { fastFail('номер сдвинулся: мод вошёл в ID ' + fm[1] + ', ждали ' + PKC.id); return; }
    }
    if (S.step === 'save') {
        if (RX_SAVED.test(text)) {
            clearTimers();
            setTimer(function () { fail('общий тайм-аут'); endSession('тайм-аут', true); }, T_TOTAL_MS);
            S.step = 'list';
            log('точка возврата сохранена, запрашиваю список пикапов');
            if (!chatCmd('/tpl pick')) { fail('не удалось отправить /tpl pick'); endSession('нет чата', false); return; }
            if (S && S.step === 'list') S.listTimer = setTimer(function () { fail('список пикапов не пришёл (рядом нет пикапов или /tpl pick не сработал)'); endSession('нет списка', false); }, T_LIST_MS);
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
    log('use не открыл диалог за ' + T_USE_FB_MS + ' мс — запасной путь: точка возврата и телепорт на пикап');
    info('вход без движения не сработал — телепорт на пикап');
    clearTimers();
    S.step = 'save'; S.list = []; S.listN = -1;
    setTimer(function () { fail('общий тайм-аут'); endSession('тайм-аут', true); }, T_TOTAL_MS);
    if (!chatCmd('/tpl save ' + BACK_NAME)) { fail('не удалось отправить команду в чат'); endSession('нет чата', false); return; }
    if (S && S.step === 'save') setTimer(function () { fail('/tpl не ответил на save'); endSession('нет ответа /tpl', false); }, T_SAVE_MS);
}

// быстрый путь не сработал (пикап вышел из зоны стрима, номер сдвинулся, диалог не открылся): забываем кэш и идём обычным путём — список, выбор, use
// вход не открыл диалог, а мы ближе NEAR_MIN_M к пикапу — это не «сервер не принял», а серверное правило «ты ещё на пикапе»: нужно отойти на 2–3,5 м
function nearWhy() {
    if (!S || !S.use || typeof S.dist !== 'number' || isNaN(S.dist) || S.dist >= NEAR_MIN_M) return '';
    var step = Math.ceil((NEAR_MIN_M + 0.3 - S.dist) * 10) / 10;       // сколько метров добавить, чтобы встать с запасом за 1.5 м
    return 'слишком близко к пикапу (' + S.dist + ' м): ближе 1.5 м сервер считает, что вы ещё на нём, и повторный вход игнорирует — отойдите ещё на ~' + step + ' м (стойте на ' + NEAR_MIN_M + '…' + FAR_MAX_M + ' м от пикапа, лучше 2–3.5; телепорт не нужен)';
}
// вход не открыл диалог, а мы дальше FAR_MAX_M — сервер принимает обычный пикап только до ~5 м
function farWhy() {
    if (!S || !S.use || typeof S.dist !== 'number' || isNaN(S.dist) || S.dist <= FAR_MAX_M) return '';
    var step = Math.ceil((S.dist - FAR_MAX_M + 0.3) * 10) / 10;
    return 'слишком далеко от пикапа (' + S.dist + ' м): сервер принимает вход только до ~5 м — подойдите ближе на ~' + step + ' м (стойте на ' + NEAR_MIN_M + '…' + FAR_MAX_M + ' м от пикапа)';
}
function distWhy() { return nearWhy() || farWhy(); }
function fastFail(why) {
    if (!S || !S.fast || S.step !== 'tp') return;
    var nw = /не открылся/.test(why) ? distWhy() : '';
    if (nw) { fail(nw); endSession(nw, false); return; }                // пикап тот же, дело в расстоянии — список пересобирать бессмысленно
    S.fast = false; S.sel = null; PKC = null;
    log('быстрый путь не сработал (' + why + ') — пересобираю список пикапов');
    clearTimers();
    S.step = 'list'; S.list = []; S.listN = -1;
    setTimer(function () { fail('общий тайм-аут'); endSession('тайм-аут', true); }, T_TOTAL_MS);
    if (!chatCmd('/tpl pick')) { fail('не удалось отправить /tpl pick'); endSession('нет чата', false); return; }
    if (S && S.step === 'list') S.listTimer = setTimer(function () { fail('список пикапов не пришёл (рядом нет пикапов или мода /tpl нет в APK)'); endSession('нет списка', false); }, T_LIST_MS);
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
    log('выбран пикап №' + sel.n + ' (ID ' + sel.id + ', модель ' + sel.model + ', ' + sel.d + ' м) — ' + (S.use ? 'вход без движения' : S.under ? 'нырок' : 'телепорт') + '; в списке было ' + S.list.length + ' шт.');
    var t1 = T_DLG1_MS;
    if (S.use) {
        // use: не двигаемся — мод сам вызывает игровой вход в пикап; возвращать нечего (teleported/diving остаются false)
        if (!chatCmd('/tpl pick ' + sel.n + ' use')) { fail('не удалось отправить /tpl pick N use'); endSession('нет чата', false); return; }
        t1 = T_DLG1_USE_MS;
    } else if (S.under) {
        // нырок: возвращаем командой «/tpl up» сразу после смены скина; не успели — мод сам вынырнет через hold секунд (предел)
        t1 = Math.min(T_DLG1_UNDER_MS, Math.round(S.hold * 1000) + 1500);
        S.diving = true;
        if (!chatCmd('/tpl pick ' + sel.n + ' under ' + S.hold)) { S.diving = false; fail('не удалось отправить /tpl pick N under'); endSession('нет чата', false); return; }
    } else {
        S.teleported = true;                            // с этого момента при любой ошибке возвращаемся
        if (!chatCmd('/tpl pick ' + sel.n)) { S.teleported = false; fail('не удалось отправить /tpl pick N'); endSession('нет чата', false); return; }
    }
    if (S.use && S.fb) t1 = T_USE_FB_MS;
    S.dlgTimer = setTimer(function () {
        if (S.use && S.fb && !S.fbUsed) { fallbackToTp(); return; }       // /dressu: use не сработал — запасной путь
        var nw = distWhy(); if (nw) { fail(nw); endSession(nw, true); return; }
        fail('диалог «Раздевалка» не открылся за ' + (t1 / 1000) + ' с' + (S.use ? ' (use: вы дальше ~5 м от пикапа, либо мод tpl без команды use, либо у NPC на сервере уже открыт другой диалог — тогда новый сервер не показывает; смотрите чат; старый способ: /dress tp)' : '')); endSession(S.use ? 'нет диалога 1: вход в пикап не принят сервером или у NPC уже открыт другой диалог' : 'нет диалога 1', true);
    }, t1);
}

// выполнить действие сейчас (D_REPLY_MS = 0) или через D_REPLY_MS; ошибка — завершаем сессию с возвратом
function act(fn) {
    var run = function () { try { fn(); } catch (e) { fail('ошибка ответа на диалог: ' + (e && e.message)); endSession('ошибка', true); } };
    if (D_REPLY_MS > 0) setTimer(run, D_REPLY_MS); else run();
}

// ───────────────────────── разбор диалогов ─────────────────────────
// Возвращает true, если диалог — наш и его нужно «съесть» (игре не показывать).
function onDialog(params, content, priority) {
    if (!S || (S.step !== 'tp' && S.step !== 'dlg2' && S.step !== 'release')) return false;
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
    if (S.step === 'release') return true;               // снимаем заряд: сервер заново показал список — глотаем, игре не отдаём

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
        setTimer(function () {
            var nw2 = distWhy();                                                // «Далее» сервер молча игнорирует, если вы дальше 4 м от пикапа (IsPlayerInPickupEx(..., 4.0, ...)) — это не «нет диалога», а расстояние
            if (nw2) { fail(nw2); endSession(nw2, true); return; }
            fail('вопрос «Да/Нет» не пришёл за ' + (T_DLG2_MS / 1000) + ' с'); endSession('нет диалога 2: сервер не показал вопрос «Да/Нет» после «Далее»', true);
        }, T_DLG2_MS);
        log('диалог 1 (id ' + id + '): пункт ' + (idx + 1) + ' «' + items[idx] + '» → Далее');
        act(function () { respond(id, 1, idx, items[idx]); });                         // «Далее»
        return true;
    }
    if (S.step === 'dlg2' && style === 0) {
        clearTimers();
        if (S.arm) { holdArmed(id, raw); return true; }  // «заряд»: вопрос «Да/Нет» получен — не отвечаем, держим до команды fireArmed()
        S.step = 'wait';                                // ждём смену скина: по ней сразу возвращаемся (onSkin / «Вы переоделись»), иначе по таймауту
        log('диалог 2 (id ' + id + '): «' + strip(raw).slice(0, 80) + '» → Да');
        act(function () { respond(id, 1, -1, ''); if (S) S.tYes = Date.now(); });     // «Да»
        if (S && S.step === 'wait') setTimer(function () { log('скин не сменился за ' + T_SKIN_MS + ' мс — возвращаемся по таймауту'); returnNow('таймаут смены скина'); }, T_SKIN_MS);
        return true;
    }
    return false;
}

// ───────────────────────── «заряд» (v3.3) ─────────────────────────
// Сервер принимает ответ только на реально открытый диалог (g_player_use_dialog_id в dialog.pwn), поэтому «Да» нельзя отправить без открытого диалога.
// Зато можно пройти пикап → список → «Переодеться» ЗАРАНЕЕ, оставить открытым вопрос «Да/Нет» (слот диалога на сервере держит его сколько угодно),
// а в нужный момент отправить один ответ — fireArmed(). Пока диалог открыт, сервер не показывает NPC другие диалоги (ShowDefaultDialog возвращает false) — поэтому держим недолго.
function holdArmed(id, raw) {
    var sess = S;
    sess.step = 'armed'; sess.armId = id; sess.tArmed = Date.now();
    log('ЗАРЯЖЕНО: вопрос «' + strip(raw).slice(0, 80) + '» (id ' + id + ') открыт и ждёт «Да»; с момента старта ' + (sess.tArmed - sess.t0) + ' мс');
    setTimer(function () { log('заряд не понадобился за ' + (ARM_HOLD_MAX_MS / 1000) + ' с — снимаем'); endSession('заряд не использован', false); }, ARM_HOLD_MAX_MS);
    if (typeof sess.onArmed === 'function') { try { sess.onArmed({ ok: true, id: id, ms: sess.tArmed - sess.t0 }); } catch (e) { warn('onArmed:', e && e.message); } }
}
function fireArmed() {                                // ОДИН ответ «Да» на заряженный вопрос; результат — через колбэк сессии (по смене скина)
    var sess = S;
    if (!sess || sess.step !== 'armed') return false;
    clearTimers();
    sess.step = 'wait';
    sess.tYes = Date.now();
    log('ВЫСТРЕЛ: «Да», заряд держали ' + (sess.tYes - sess.tArmed) + ' мс');
    try { respond(sess.armId, 1, -1, ''); }
    catch (e) { fail('ошибка выстрела: ' + (e && e.message)); endSession('ошибка', false); return true; }
    if (S === sess && sess.step === 'wait') setTimer(function () { log('скин не сменился за ' + T_SKIN_MS + ' мс после выстрела — завершаем по таймауту'); returnNow('таймаут смены скина'); }, T_SKIN_MS);
    return true;
}
function blindRelease(sess) {                         // «Нет» → сервер заново показывает список → «Отмена» закрывает его; слот диалога освобождён
    respond(sess.armId, 0, -1, '');
    respond(sess.armId, 0, -1, '');
}
function releaseArmed(sess, why) {
    log('снимаем заряд (' + why + '): «Нет» + «Отмена»');
    sess.step = 'release'; sess.released = true;
    clearTimers();
    try { blindRelease(sess); } catch (e) { warn('снятие заряда:', e && e.message); }
    setTimer(function () { endSession('заряд снят: ' + why, false); }, 1200);   // хук диалогов ещё живёт — перехватит повторно показанный список
}

// ───────────────────────── команда в чате ─────────────────────────
function statusText() {
    return S ? ((S.use ? 'вход без движения, ' : S.under ? 'под пикап, ' : '') + 'шаг «' + S.step + '», ' + Math.round((Date.now() - S.t0) / 100) / 10 + ' с') : 'не запущено';
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
    var under = false, n = 0, sec = 0, i, w, v, use = USE_DEFAULT;
    for (i = 0; i < args.length; i++) {
        w = String(args[i]).toLowerCase();
        if (/^(under|dive|нырок|ниже|под)$/.test(w)) { under = true; continue; }
        if (/^(use|touch|вход)$/.test(w)) { use = true; continue; }          // войти в пикап, не двигаясь (мод tpl: /tpl pick N use)
        if (/^(tp|old|телепорт)$/.test(w)) { use = false; continue; }        // принудительно старый способ: телепорт на пикап и возврат
        v = parseFloat(w.replace(',', '.'));
        if (isNaN(v)) { fail('не понял «' + w + '». Примеры: /dress, /dress use, /dress 2 use, /dress tp, /dress 2, /dress under, /dress 2 under 4, /dress log'); return; }
        if (under) sec = v; else n = Math.round(v);
    }
    if (sec) sec = Math.max(0.2, Math.min(15, sec));
    if (use) under = false;                           // use важнее под-пикапного нырка
    startSession(n, under, sec, use, !!fb && use);
}

// ═════════════════════ «Переодевание ночь» ═════════════════════
// Цикл для тестового NPC, который стоит у раздевалки (кнопка «👗 Переодевание ночь» в Telegram → «Функции», или /dressnight on):
//   1. /nocol on            — коллизия с другими NPC выключена, чтобы не оттолкнули от пикапа
//   2. /dressu              — снимает форму; стоит до :59:РР (РР — случайная секунда, каждый круг новая)
//   3. в :59:РР /dressu     — надевает форму
//   4. в :00 ловит PayDay (строки чека в чате: «Зарплата: … руб» и т.п.) → сразу /dressu — снимает форму
//   5. снова до :59:РР … и так по кругу. Выключить: кнопка «ВЫКЛ» или /dressnight off (вернёт /nocol off).
//   Рестарт сервера посреди цикла — см. блок «рестарт сервера» ниже: на выбор «висим на авторизации» или «входим и возвращаемся на место».
// Состояние «форма надета/снята» ведём сами и сверяем по смене скина, поэтому неудачный /dressu не перевернёт цикл
// (например, если снять не вышло — в :59 повторно «надевать» не будем). Время считаем по UTC-часу (минуты не зависят от пояса телефона).
var DN_SEC_MIN = 35, DN_SEC_MAX = 45;       // :59:РР — РР случайно в этих пределах (с запасом на сам /dressu, он идёт 2–6 с)
var DN_MIN_LEAD_S = 75;                     // запуск, когда до :00 осталось меньше — форму не снимаем (NPC в ней), сразу ждём PayDay
var DN_PD_FALLBACK_S = 30;                  // строка PayDay не пришла за столько секунд после :00:00 — снимаем форму по таймеру
var DN_PD_DELAY_MIN = 300, DN_PD_DELAY_MAX = 1200;   // пауза после строки PayDay перед /dressu, мс (случайно)
var DN_TRIES = 3, DN_RETRY_MS = 2500;       // попыток /dressu подряд и пауза между ними
var DN_NOCOL_WAIT_MS = 2000;                // сколько ждать ответ /nocol on перед первым /dressu
var DN_NOCOL_OFF_ON_STOP = true;            // при выключении вернуть коллизию (/nocol off)
var DN_HOUR = 3600000;
var RX_PAYDAY = /Зарплата:\s*[\d.]+\s*руб|Текущий баланс счета|Для получения зарплаты необходимо|Вы не должны находиться на паузе для получения зарплаты|Для получения опыта необходимо/i;
var RX_NOCOL  = /Коллизия/;

// ── рестарт сервера ──
var DN_POINT = 'dressnight';                // имя точки в «/tpl save»: место, где стоит NPC (файл HLOG/tpl_points.txt переживает перезапуск игры)
var DN_REJOIN_S = 90;                       // режим «return»: «/rec N» — отключаемся сразу и подключаемся заново через N с (сервер обещает вернуться «в течение минуты»)
var DN_OFF_HOLD_MS = 15 * 60 * 1000;           // режим «off»: столько Code.js не считает обрыв связи событием (мы отключились сами)
var DN_REJOIN_RETRY_S = 60;                 // не зашли: раз в столько секунд повторяем «/rec 5» (пока он не «в полёте» — Code.js такой повтор глушит сам)
var DN_REJOIN_GIVEUP_S = 900;               // через столько секунд без входа пишем в Telegram (но пытаться не бросаем)
var DN_FALSE_ALARM_S = 150;                 // объявление было, а связь не пропала столько секунд — рестарта не было, цикл продолжаем
var DN_DROP_TRIGGER = true;                 // обрыв связи без нашего /rec тоже считаем рестартом (сервер упал без объявления)
var DN_DROP_CONFIRM_MS = 8000;              // …если связи нет дольше этого (короткие провалы не в счёт)
var DN_SPAWN_SETTLE_MS = 3500;              // после входа в игру ждём, пока прогрузится мир, и только потом «/tpl go»
var DN_GO_TRIES = 5, DN_GO_RETRY_MS = 2000; // попыток «/tpl go» и пауза между ними
var DN_RX_RESTART = /Сервер возобновит работу в течени[еи]\s+минуты/i;      // как в Code.js (AFK-ночь); сервер пишет «в течении»
var DN_RX_RESTORE = /Восстановление позиции|вернуться на место последнего выхода/i;   // DIALOG_RESTORE_POSITION в new.pwn: «Хотите вернуться на место последнего выхода из игры?» Да/Нет
var RX_PT_SAVED = new RegExp('Точка\\s*«\\s*' + DN_POINT + '\\s*»\\s*(?:сохранена|обновлена):\\s*(-?[\\d.]+)\\s+(-?[\\d.]+)\\s+(-?[\\d.]+)(?:,\\s*интерьер\\s*(-?\\d+))?', 'i');
var DN_START_RX = /^(старт|после рестарта|вручную|рестарта не было|проверка)$/;   // эти «причины» снятия формы не считаем новым кругом

var DN = { on: false, phase: 'off', uniform: null, skinU: null, skinC: null, cycles: 0, paydays: 0, nextAt: 0, fbAt: 0, err: '', tries: 0,
           pdPending: false, tick: null, timers: [], chatOrig: null, chatWrap: null, since: 0, busyN: 0,
           rmode: ((window.__dnRMode === 'off' || window.__dnRMode === 'auth') ? 'off' : 'return'), speed: (window.__dnSpeed === 'fast' ? 'fast' : 'normal'), onMs: (window.__dnOnMs || []), arm: null, chk: null, fireMs: (window.__dnFireMs || []), pdOffs: (window.__dnPdOffs || []), rs: null, pt: null, ptWait: false, downSince: 0, dlgOrig: null, dlgWrap: null, startReason: 'старт' };

function dnTg(html, silent) { try { if (typeof sendToTelegram === 'function') sendToTelegram(html, silent !== false, null); } catch (e) {} }
function dnName() { try { return String(typeof displayName !== 'undefined' ? displayName : ''); } catch (e) { return ''; } }
function dnEsc(s) { return String(s === undefined || s === null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function dnLog(m) { log('[ночь] ' + m); }
function dnTimer(fn, ms) { var h = setTimeout(function () { if (!_dead && DN.on) { try { fn(); } catch (e) { dnLog('ошибка: ' + (e && e.message)); } } }, ms); DN.timers.push(h); return h; }
var DN_SERVER_TZ_H = 3;                     // серверное время игры = МСК (UTC+3), не зависит от пояса телефона
function dnClock(ms) { var d = new Date(ms + DN_SERVER_TZ_H * DN_HOUR); function p(n) { return n < 10 ? '0' + n : '' + n; } return p(d.getUTCHours()) + ':' + p(d.getUTCMinutes()) + ':' + p(d.getUTCSeconds()) + ' МСК'; }
function dnClockT(ms) { var d = new Date(ms + DN_SERVER_TZ_H * DN_HOUR); function p(n) { return n < 10 ? '0' + n : '' + n; } return p(d.getUTCHours()) + ':' + p(d.getUTCMinutes()) + ':' + p(d.getUTCSeconds()) + '.' + Math.floor(d.getUTCMilliseconds() / 100); }   // ЧЧ:ММ:СС.д (МСК, десятые секунды)
function dnSecs(ms) { return (Math.max(0, ms) / 1000).toFixed(1) + ' с'; }
function dnOff00(ms) { var b = Math.round(ms / DN_HOUR) * DN_HOUR, d = ms - b; if (Math.abs(d) > 600000) return ''; return d < 0 ? 'за ' + dnSecs(-d) + ' до :00' : dnSecs(d) + ' после :00'; }   // отступ от ближайшего :00:00; дальше 10 минут — пустая строка (например, снятие при старте в 23:20 к :00 не относится)
// строка «сколько заняло» для сообщения в Telegram (kind: 'on' — надеть в :59, 'off' — снять после PayDay)
function dnTimingText(kind, took, tEnd, extra) {
    var tBeg = tEnd - took, t = '⏱ <b>Заняло ' + dnSecs(took) + '</b>';
    if (DN.tries > 1 && DN.opT0) t += ' (попытка ' + DN.tries + '/' + DN_TRIES + ', всего с повторами ' + dnSecs(tEnd - DN.opT0) + ')';
    t += '\nстарт ' + dnClockT(tBeg) + ' → готово ' + dnClockT(tEnd) + ' МСК';
    var o = dnOff00(tEnd);
    if (o) t += '\nготово ' + o;
    if (kind === 'off' && DN.pdAt) { var op = dnOff00(DN.pdAt); t += '\nстрока PayDay в ' + dnClockT(DN.pdAt) + (op ? ' (' + op + ')' : '') + ', от неё до готово ' + dnSecs(tEnd - DN.pdAt); }
    if (extra) t += '\n' + extra;
    return t;
}
function dnRand(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function dnNextHour(now) { return Math.floor(now / DN_HOUR) * DN_HOUR + DN_HOUR; }
// ── тип переодевания: «обычное» / «моментальное» ──
var DN_FAST_MARGIN_MS = 700;                // моментальное: форма должна быть надета за столько мс ДО :00:00 (запас на разброс сети/часов)
var DN_FAST_DRESS_MS = 2500;                // моментальное: пока нет замеров надевания — считаем, что оно длится столько мс
var DN_FAST_JITTER_MS = 300;                // моментальное: старт раньше расчётного на случайные 0…N мс (чтобы не бить в одну и ту же миллисекунду)
var DN_FAST_PD_DELAY_MS = 0;                // моментальное: пауза после строки PayDay перед снятием, мс (0 — сразу)
// ── «заряд» (v3.3): только в «моментальном». Цепочку раздевалки проходим заранее до вопроса «Да/Нет», в нужный момент уходит один ответ ──
var DN_ARM = true;                          // false — как в 3.2 (каждый раз вся цепочка заново)
var DN_ARM_LEAD_MS = 15000;                 // надеть: заряжаем за столько мс до выстрела (цепочка идёт 1–3 с; запас на повтор)
var DN_ARM_MARGIN_MS = DN_FAST_MARGIN_MS;     // заряженное надевание: форма должна быть надета за столько мс ДО :00 сверх замеренного «выстрел → смена скина» (тот же запас, что в 3.2 — меньше стала только цепочка)
var DN_UNLEARNED_EXTRA_MS = 1500;           // пока ни одной строки PayDay не сверено с часами телефона — добавочный запас (телефон может отставать от сервера); после первого PayDay уходит
var DN_FIRE_DEFAULT_MS = 450;               // пока замеров «выстрел → скин» нет — считаем, что оно длится столько
var DN_ARM_MIN_LEFT_MS = 4000;              // заряжать имеет смысл, если до выстрела осталось не меньше
var DN_SELFCHECK = true;                    // при ВКЛ сразу проверить, что переодевание срабатывает и ВТОРОЙ раз (надеть → снять), результат — в Telegram
var DN_CHECK_MIN_LEFT_S = 150;              // проверка — только если до :59 осталось не меньше
var DN_EARLY_PAYDAY = true;                 // моментальное: снимать по ПЕРВОЙ строке PayDay — общей рассылке «Текущее время: ЧЧ:00» (OnPayDay шлёт её до личных строк, перед циклом по игрокам), а не по личной «Зарплата: N руб».
                                            // Безопасно: весь OnPayDay идёт одним тиком сервера (new.pwn, OnPayDay), наше «Да» обработается только после него — форма на момент выплаты уже проверена.
var RX_PAYDAY_EARLY = /Текущее время:\s*\d{1,2}:00\s*$/;
var DN_CLOCK_LEARN = true;                  // моментальное: если строки PayDay приходят РАНЬШЕ :00 по часам телефона — стартуем раньше на эту разницу (только «раньше»)
function dnParseSpeed(w) {
    w = String(w || '').toLowerCase();
    if (/^(fast|instant|моментальное|моментальный|моментально|быстро|быстрое|быстрый|мгновенно|мгн)$/.test(w)) return 'fast';
    if (/^(normal|usual|обычное|обычный|обычно|норма|стандарт)$/.test(w)) return 'normal';
    return '';
}
function dnSpeedText(m) { return m === 'fast' ? '⚡ моментальное' : '🕐 обычное'; }
function dnSpeedFlip() { DN.speed = DN.speed === 'fast' ? 'normal' : 'fast'; window.__dnSpeed = DN.speed; dnLog('тип переодевания: ' + DN.speed + (DN.on ? ' (со следующего круга)' : '')); return DN.speed; }
// сколько мс до :00 надо начать надевание: худшее из последних замеров (или DN_FAST_DRESS_MS) + запас
function dnClockAdj() {                      // на сколько мс стартовать раньше из-за часов телефона: строки PayDay приходят раньше :00 по часам телефона → телефон спешит/отстаёт
    if (!DN_CLOCK_LEARN || !DN.pdOffs || !DN.pdOffs.length) return 0;
    var m = Math.min.apply(null, DN.pdOffs.slice(-3)), a = 200 - m;              // 200 мс — типичная задержка строки (сервер → телефон)
    return a > 0 ? Math.min(a, 3000) : 0;
}
function dnFastLeadPlain() { var m = DN.onMs && DN.onMs.length ? Math.max.apply(null, DN.onMs) : DN_FAST_DRESS_MS; return m + DN_FAST_MARGIN_MS + dnClockAdj(); }   // обычная цепочка: сколько мс до :00 начать
function dnArmedLead() { var m = DN.fireMs && DN.fireMs.length ? Math.max.apply(null, DN.fireMs) : DN_FIRE_DEFAULT_MS; return m + DN_ARM_MARGIN_MS + dnClockAdj() + ((DN_CLOCK_LEARN && !(DN.pdOffs && DN.pdOffs.length)) ? DN_UNLEARNED_EXTRA_MS : 0); }                    // заряженный выстрел: сколько мс до :00
function dnFastLead() { return DN_ARM ? dnArmedLead() : dnFastLeadPlain(); }
function dnPickFast(now, plain) { var t = Math.floor(now / DN_HOUR) * DN_HOUR + DN_HOUR - (plain ? dnFastLeadPlain() : dnFastLead()) - dnRand(0, DN_FAST_JITTER_MS); if (t <= now + 500) t += DN_HOUR; return t; }
function dnClockAuto(ms) { return DN.speed === 'fast' ? dnClockT(ms) + ' МСК' : dnClock(ms); }   // в моментальном нужны десятые секунды
function dnPick59(now) { var t = Math.floor(now / DN_HOUR) * DN_HOUR + 59 * 60000 + dnRand(DN_SEC_MIN, DN_SEC_MAX) * 1000; if (t <= now + 1000) t += DN_HOUR; return t; }
function dnSkinOk(v) { return v !== undefined && v !== null && v !== '?'; }
// по известным скинам уточняем, в форме ли NPC (если оба скина ещё не известны — верим счётчику)
function dnSyncUniform() {
    var c = curSkin();
    if (!dnSkinOk(c) || !dnSkinOk(DN.skinU) || !dnSkinOk(DN.skinC)) return;
    if (String(c) === String(DN.skinU)) DN.uniform = true;
    else if (String(c) === String(DN.skinC)) DN.uniform = false;
}

// ── строй на рации: в ночном режиме не реагируем вообще ──
var DN_IGNORE_STROY = true;                 // true — пока «Переодевание ночь» включено, строй/сбор/готовность/конф на рации Code.js не видит (ни /rec, ни Telegram, ни озвучки); false — как раньше
var DN_RX_STROY = /строй|сбор|готовность|конф/;   // те же слова, что в Code.js («Smart Stroi System»)
function dnIsStroy(raw, color) {
    var msg = String(raw);
    var low = (typeof normalizeToCyrillic === 'function' ? String(normalizeToCyrillic(msg)) : msg).toLowerCase();
    if (!DN_RX_STROY.test(low)) return false;
    if (typeof isNonRPMessage === 'function' && isNonRPMessage(msg)) return false;      // как в Code.js: не-RP строки не считаем
    if (typeof getChatRadius === 'function' && typeof CHAT_RADIUS !== 'undefined') return getChatRadius(color) === CHAT_RADIUS.RADIO;
    return /^\s*\[R\]/i.test(strip(msg));                                              // запасной вариант: рация помечена [R]
}
// строй, пойманный ДО включения ночного режима (ждём PayDay, висим на авторизации): снимаем ожидание и все его таймеры
function dnClearStroy(why) {
    try {
        if (typeof resetPayDayFlag !== 'function') return;
        var waiting = false;
        try { waiting = (typeof waitingForPayDay !== 'undefined') && !!waitingForPayDay; } catch (e) {}
        resetPayDayFlag();
        if (waiting) {
            dnLog('ожидание PayDay после строя снято (' + why + ')');
            dnTg('🔕 <b>Переодевание ночь (' + dnEsc(dnName()) + ')</b>\nСтрой, пойманный до включения, отменён — выхода/реконнекта из-за него не будет.');
        }
    } catch (e) { dnLog('dnClearStroy: ' + (e && e.message)); }
}

function dnHookChat() {
    var cur = window.OnChatAddMessage;
    if (typeof cur !== 'function') return false;
    var wrapped = function (e, c, t) {
        try { if (!_dead && DN.on) dnOnChat(String(e)); } catch (err) { warn('dnOnChat:', err && err.message); }
        try { if (!_dead && DN.on && DN_IGNORE_STROY && dnIsStroy(e, c)) { dnLog('строй/сбор на рации — игнорирую'); return; } } catch (err) { warn('dnIsStroy:', err && err.message); }
        return cur.apply(this, arguments);
    };
    DN.chatOrig = cur; DN.chatWrap = wrapped;
    window.OnChatAddMessage = wrapped;
    return true;
}
function dnUnhookChat() {
    try { if (DN.chatWrap && window.OnChatAddMessage === DN.chatWrap) window.OnChatAddMessage = DN.chatOrig; } catch (e) {}
    DN.chatWrap = null; DN.chatOrig = null;
}
function dnOnChat(raw) {
    var text = strip(raw);
    if (dnRsChat(text)) return;                                        // рестарт: объявление сервера, ответы /tpl save и /tpl go
    if (DN.phase === 'nocol' && RX_NOCOL.test(text)) {
        if (/не вышло|не прошёл/i.test(text)) { dnTg('⚠️ <b>Переодевание ночь (' + dnEsc(dnName()) + ')</b>\n/nocol: <code>' + dnEsc(text.slice(0, 160)) + '</code>'); }
        dnLog('ответ /nocol: ' + text.slice(0, 120));
        DN.nocolSeen = true; dnAfterNocol();
        return;
    }
    var early = DN_EARLY_PAYDAY && DN.speed === 'fast' && RX_PAYDAY_EARLY.test(text);               // первая строка PayDay (общая рассылка) — раньше личных
    if (!early && !RX_PAYDAY.test(text)) return;
    var m = Date.now() % DN_HOUR;
    if (!(m < 120000 || m >= 3590000)) return;                         // PayDay бывает только возле :00 — случайные совпадения игнорируем
    if (early && DN.phase !== 'wait_payday' && DN.phase !== 'dressing') return;                      // рассылка нужна только как сигнал PayDay; в другое время ничего не делаем (личная строка придёт следом)
    if (!early && DN.pdEarlyAt && Date.now() - DN.pdEarlyAt < 10000) { dnLog('личная строка PayDay пришла через ' + (Date.now() - DN.pdEarlyAt) + ' мс после общей «Текущее время»'); DN.pdEarlyAt = 0; }
    if (early) { DN.pdEarlyAt = Date.now(); }
    dnOnPayday('чат: ' + text.slice(0, 80));
}

function dnStart(src, rmode, speed) {
    if (DN.on) return 'уже включено';
    if (speed === 'fast' || speed === 'normal') { DN.speed = speed; window.__dnSpeed = speed; }
    var connected = true;
    try { connected = !!window.App.$store.getters['player/isPlayerConnected']; } catch (e) {}
    if (!connected) return 'персонаж не в игре';
    if (rmode === 'off' || rmode === 'return') { DN.rmode = rmode; window.__dnRMode = rmode; }
    PKC = null;                                                         // первый круг — всегда со свежим списком пикапов
    DN.on = true; DN.phase = 'nocol'; DN.uniform = true; DN.cycles = 0; DN.paydays = 0; DN.err = ''; DN.tries = 0;
    DN.pdPending = false; DN.nocolSeen = false; DN.nextAt = 0; DN.fbAt = 0; DN.since = Date.now(); DN.busyN = 0; DN.skinU = null; DN.skinC = null;
    DN.rs = null; DN.pt = null; DN.ptWait = true; DN.downSince = 0; DN.startReason = 'старт'; DN.opT0 = 0; DN.pdAt = 0; DN.arm = null; DN.chk = null;
    if (!dnHookChat()) { DN.on = false; DN.phase = 'off'; return 'нет OnChatAddMessage — бот ещё не запущен?'; }
    if (DN_IGNORE_STROY) dnClearStroy('старт');
    jlPing();
    DN.tick = setInterval(dnTick, 1000);
    dnLog('=== ВКЛ (' + src + '), после рестарта: ' + DN.rmode + ', скин сейчас: ' + curSkin());
    dnTg('👗 <b>Переодевание ночь — ВКЛ (' + dnEsc(dnName()) + ')</b>\n🌙 /nocol on → снять форму → ждать :59 → надеть → PayDay → снять…\n⏱ Тип: ' + dnSpeedText(DN.speed) + '\n🔁 После рестарта: ' + dnRModeText(DN.rmode));
    chatCmd('/tpl save ' + DN_POINT);                                   // запоминаем место, где стоит NPC (ответ мода разбирает dnRsChat); вернёмся сюда после рестарта
    dnTimer(function () {
        if (!DN.ptWait) return;
        DN.ptWait = false; dnLog('/tpl save не ответил за 2500 мс');
        dnTg('⚠️ <b>Переодевание ночь (' + dnEsc(dnName()) + ')</b>\nМесто для возврата после рестарта не запомнилось (мод /tpl не ответил). Цикл идёт, но «📍 вернуться» не сработает.');
    }, 2500);
    if (!chatCmd('/nocol on')) { DN.err = 'не удалось отправить /nocol on'; dnLog(DN.err); dnAfterNocol(); return ''; }
    dnTimer(function () { if (DN.phase === 'nocol') { dnLog('/nocol не ответил за ' + DN_NOCOL_WAIT_MS + ' мс — иду дальше'); dnAfterNocol(); } }, DN_NOCOL_WAIT_MS);
    return '';
}
function dnAfterNocol() {
    if (!DN.on || DN.phase !== 'nocol') return;
    DN.phase = 'start';
    var left = (dnNextHour(Date.now()) - Date.now()) / 1000;
    dnSyncUniform();
    if (DN.uniform === false) {                                         // после рестарта: по скину видно, что форма уже снята — снимать нечего
        dnLog('форма уже снята (скин ' + curSkin() + ') — жду :59');
        dnTg('👕 <b>Переодевание ночь (' + dnEsc(dnName()) + ')</b>\nФорма уже снята — следующее: надеть в ' + dnClockAuto(dnWait59()));
        dnAutoCheck();
        return;
    }
    if (left < DN_MIN_LEAD_S) {
        dnLog('до :00 осталось ' + Math.round(left) + ' с — форму не снимаю, жду PayDay');
        dnTg('⏳ <b>Переодевание ночь (' + dnEsc(dnName()) + ')</b>\nДо :00 меньше ' + DN_MIN_LEAD_S + ' с — форма остаётся, ждём PayDay.');
        dnWaitPayday();
    } else dnToggle('off', DN.startReason || 'старт');
}

function dnStop(why, silent) {
    if (!DN.on) return;
    var hadRs = !!DN.rs, offNocol = DN_NOCOL_OFF_ON_STOP && !_dead && dnConnected() !== false;
    dnArmCancel('выключено'); DN.chk = null;
    DN.on = false; PKC = null;
    if (DN.tick) { clearInterval(DN.tick); DN.tick = null; }
    DN.timers.forEach(function (h) { clearTimeout(h); }); DN.timers = [];
    dnUnhookChat(); dnUnhookDialogs();
    if (DN.rs) { dnAlRestore(); DN.rs = null; }                         // автовход возвращаем как был: висели на авторизации — зайдём сами
    DN.phase = 'off'; DN.fbAt = 0; DN.nextAt = 0; DN.ptWait = false;
    if (offNocol) chatCmd('/nocol off');
    dnLog('=== ВЫКЛ: ' + why + '; кругов ' + DN.cycles + ', PayDay ' + DN.paydays);
    if (!silent) dnTg('⏹️ <b>Переодевание ночь — ВЫКЛ (' + dnEsc(dnName()) + ')</b>\n' + dnEsc(why) + '\nКругов: ' + DN.cycles + ', PayDay пойман: ' + DN.paydays +
        '\nФорма сейчас: ' + (DN.uniform === true ? '👔 надета' : DN.uniform === false ? '👕 снята' : '❓') + (offNocol ? '\nКоллизия возвращена (/nocol off).' : '') + (hadRs ? '\nАвтовход возвращён в прежнее состояние.' : ''));
}

function dnTick() {
    if (!DN.on || _dead) return;
    var now = Date.now(), conn = dnConnected();
    if (DN.rs) dnRsTick(now, conn);
    else if (DN_DROP_TRIGGER && conn === false) {                       // связь пропала, а мы её не рвали (/rec) — сервер упал/перезапущен без объявления
        if (!DN.downSince) DN.downSince = now;
        else if (now - DN.downSince >= DN_DROP_CONFIRM_MS && !(window.__recOwnDisconnect && window.__recOwnDisconnect())) { DN.downSince = 0; dnOnRestart('обрыв связи'); return; }
    } else if (conn === true) DN.downSince = 0;
    if (DN.phase === 'wait59' && DN.nextAt && now >= DN.nextAt) { DN.nextAt = 0; dnOn59(); }
    else if (DN.phase === 'wait_payday' && DN.fbAt && now >= DN.fbAt) {
        DN.fbAt = 0;
        dnTg('⚠️ <b>Переодевание ночь (' + dnEsc(dnName()) + ')</b>\nСтрока PayDay не поймана за ' + DN_PD_FALLBACK_S + ' с после :00 — снимаю форму по таймеру.');
        dnOnPayday('таймер');
    }
}

// kind: 'off' — снять форму, 'on' — надеть
function dnToggle(kind, reason) {
    DN.opT0 = Date.now();                                               // начало операции (для «всего с повторами»)
    DN.phase = kind === 'off' ? 'undressing' : 'dressing';
    DN.tries = 0; DN.busyN = 0;
    dnAttempt(kind, reason);
}
function dnAttempt(kind, reason) {
    if (!DN.on || _dead) return;
    var A = DN.arm;
    if (A && A.kind === kind) {                                         // есть заряд нужного типа
        if (A.state === 'ready') { dnFireArmed(kind, reason); return; }
        if (A.state === 'arming') { A.fireReq = { kind: kind, reason: reason }; dnLog('заряд ещё собирается — выстрел сразу, как будет готов'); return; }
        return;                                                         // 'firing' — уже стреляем
    }
    if (A) dnArmCancel('не тот тип заряда');
    if (S) {                                                            // Dress занят (например, руками запустили /dress) — ждём
        if (++DN.busyN > 30) { dnFail(kind, 'Dress занят дольше 30 с'); return; }
        dnTimer(function () { dnAttempt(kind, reason); }, 1000);
        return;
    }
    DN.tries++;
    dnLog((kind === 'off' ? 'СНЯТЬ форму' : 'НАДЕТЬ форму') + ' (' + reason + '), попытка ' + DN.tries + ', скин ' + curSkin());
    startSession(0, false, 0, true, true, function (res) {
        if (_dead || !DN.on || DN.rs) return;                           // идёт рестарт — результат прерванной сессии цикл не двигает
        if (res && res.busy) { dnTimer(function () { dnAttempt(kind, reason); }, 1000); return; }
        dnAfterToggle(kind, reason, res || {});
    });
}
function dnTimeOk(kind) { if (kind === 'off') return true; var m = Date.now() % DN_HOUR; return m >= 50 * 60000 && m < 3598000; }
function dnAfterToggle(kind, reason, res) {
    if (!DN.on) return;
    if (res.ok) {
        DN.uniform = (kind === 'on');
        if (dnSkinOk(res.skin0) && dnSkinOk(res.skin1)) {
            if (kind === 'off') { DN.skinU = res.skin0; DN.skinC = res.skin1; } else { DN.skinC = res.skin0; DN.skinU = res.skin1; }
        }
        if (kind === 'on' && res.armed && typeof res.fireMs === 'number' && res.fireMs >= 20 && res.fireMs <= 8000) {   // заряженное надевание: замер «выстрел → скин»
            DN.fireMs = (DN.fireMs || []).concat([res.fireMs]).slice(-5); window.__dnFireMs = DN.fireMs;
        } else if (kind === 'on' && !res.armed && typeof res.ms === 'number' && res.ms >= 300 && res.ms <= 15000) {   // замеры надевания — для расчёта старта в «моментальном»
            DN.onMs = (DN.onMs || []).concat([res.ms]).slice(-5); window.__dnOnMs = DN.onMs;
        }
        dnLog((kind === 'off' ? 'форма СНЯТА' : 'форма НАДЕТА') + ' за ' + (res.armed ? res.fireMs + ' мс (выстрел; прогрев ' + res.armMs + ' мс)' : res.ms + ' мс') + ', скин ' + res.skin0 + ' → ' + res.skin1);
        if (kind === 'off') {
            if (!DN_START_RX.test(reason)) { DN.cycles++; }
            var tOff = dnTimingText('off', (res.armed ? res.fireMs : res.ms) || 0, Date.now(), res.armed ? dnArmInfo(res) : '');
            DN.pdAt = 0;
            dnTg('👕 <b>Форма снята (' + dnEsc(dnName()) + ')</b> · ' + dnEsc(reason) + ' · ' + dnSpeedText(DN.speed) + '\n' + tOff + '\nСледующее: надеть в ' + dnClockAuto(dnWait59()) + '  ·  круг ' + (DN.cycles + 1));
            if (DN.pdPending) DN.pdPending = false;
            if (reason === 'старт') dnAutoCheck();
        } else {
            dnTg('👔 <b>Форма надета (' + dnEsc(dnName()) + ')</b> · ' + dnSpeedText(DN.speed) + ' · ждём PayDay в :00\n' + dnTimingText('on', (res.armed ? res.fireMs : res.ms) || 0, Date.now(), res.armed ? dnArmInfo(res) : ''));
            var pend = DN.pdPending;                                    // PayDay пришёл, пока надевали (в 3.2 этот флаг терялся — снятие шло по запасному таймеру через 30 с)
            dnWaitPayday();
            if (pend) { dnLog('PayDay пришёл, пока надевали — снимаю сразу'); dnOnPayday('пришёл во время надевания'); }
            else if (DN_ARM && DN.speed === 'fast') dnArm('off', 'после надевания', 0);
        }
        return;
    }
    dnLog('не вышло (' + res.why + '), попытка ' + DN.tries + '/' + DN_TRIES);
    if (DN.tries < DN_TRIES && dnTimeOk(kind) && !/слишком (близко|далеко)/.test(String(res.why))) { dnTimer(function () { dnAttempt(kind, reason); }, DN_RETRY_MS); return; }
    dnFail(kind, (res.why === 'готово' || !res.why) ? 'скин не сменился — сервер не переодел' : res.why);
}
function dnFail(kind, why) {
    dnSyncUniform();
    DN.err = (kind === 'off' ? 'не снял форму' : 'не надел форму') + ': ' + why;
    dnTg('❗ <b>Переодевание ночь (' + dnEsc(dnName()) + ')</b>\n' + dnEsc(DN.err) + (DN.opT0 ? '\n⏱ потрачено ' + dnSecs(Date.now() - DN.opT0) + ', попыток ' + DN.tries + '/' + DN_TRIES + ', сейчас ' + dnClockT(Date.now()) + ' МСК' : '') + '\nФорма по скину: ' + (DN.uniform === true ? '👔 надета' : DN.uniform === false ? '👕 снята' : '❓') + '. Цикл продолжается.');
    dnWait59();                                                         // не сняли — в :59 увидим «уже в форме» и дождёмся PayDay; не надели — ждём следующий :59
}

// ── «заряд» в цикле (v3.3) ──
function dnArmInfo(res) { return '🔫 заряд: прогрев ' + dnSecs(res.armMs || 0) + ', выстрел → смена скина ' + dnSecs(res.fireMs || 0); }
function dnArm(kind, reason, tryN) {
    if (!DN_ARM || !DN.on || _dead || DN.rs || DN.chk) return;
    if (DN.arm) { dnLog('заряд уже есть (' + DN.arm.kind + ', ' + DN.arm.state + ') — второй не собираю'); return; }
    var A = { kind: kind, reason: reason, state: 'arming', t0: Date.now(), tryN: tryN || 0, fireReq: null, tReady: 0, armMs: 0 };
    DN.arm = A;
    dnLog('ЗАРЯЖАЮ: ' + (kind === 'off' ? 'снять' : 'надеть') + ' (' + reason + '), попытка ' + (A.tryN + 1));
    startSession(0, false, 0, true, true, function (res) {
        if (_dead || !DN.on || DN.rs) { if (DN.arm === A) DN.arm = null; return; }
        dnArmDone(A, res || {});
    }, { arm: true, onArmed: function (info) { dnArmReady(A, info); } });
}
function dnArmReady(A, info) {
    if (DN.arm !== A || !DN.on || _dead) { if (S && S.arm && S.step === 'armed') endSession('заряд не нужен', false); return; }
    A.state = 'ready'; A.tReady = Date.now(); A.armMs = info.ms || 0;
    dnLog('ЗАРЯЖЕНО (' + (A.kind === 'off' ? 'снять' : 'надеть') + ') за ' + A.armMs + ' мс');
    if (A.fireReq) { var f = A.fireReq; A.fireReq = null; dnFireArmed(f.kind, f.reason); }
}
function dnFireArmed(kind, reason) {
    var A = DN.arm;
    if (!A || A.state !== 'ready' || !S || S.step !== 'armed') { DN.arm = null; dnLog('заряда нет (или он уже снят) — обычная цепочка'); dnAttempt(kind, reason); return; }
    A.state = 'firing'; A.reason = reason; DN.tries++;
    dnLog((kind === 'off' ? 'ВЫСТРЕЛ: снять' : 'ВЫСТРЕЛ: надеть') + ' (' + reason + '), заряд держали ' + (Date.now() - A.tReady) + ' мс, скин ' + curSkin());
    if (!fireArmed()) { DN.arm = null; dnLog('выстрел не ушёл — обычная цепочка'); dnAttempt(kind, reason); }
}
function dnArmDone(A, res) {                                           // сессия заряда закончилась: после выстрела (итог переодевания) или без него (ошибка / срок / снят)
    if (DN.arm !== A) return;
    DN.arm = null;
    if (A.state === 'firing') { dnAfterToggle(A.kind, A.reason, res); return; }
    dnLog('заряд не вышел/снят: ' + (res.why || '?') + ' (был «' + A.state + '»)');
    if (A.fireReq) { dnAttempt(A.fireReq.kind, A.fireReq.reason); return; }          // выстрел уже просили — обычной цепочкой
    if (A.state === 'arming') dnArmFailed(A, res.why || '?');
}
function dnArmFailed(A, why) {
    var now = Date.now(), end = dnNextHour(now);
    if (A.kind === 'on' && DN.phase === 'wait59' && DN.nextAt) {
        var fireAt = DN.nextAt;
        if (fireAt - now > 6000 && A.tryN < 1) { dnTimer(function () { if (DN.phase === 'wait59' && DN.nextAt === fireAt) dnArm('on', A.reason, A.tryN + 1); }, 1500); return; }   // ещё успеем — вторая попытка
        if (end - now < 800) { dnLog('заряд не вышел, до :00 уже ' + (end - now) + ' мс — надевать поздно'); return; }
        var at = Math.max(now + 150, end - dnFastLeadPlain());
        DN.nextAt = at;
        dnLog('заряд не вышел — обычная цепочка в ' + dnClockT(at) + ' МСК (запас ' + dnFastLeadPlain() + ' мс)');
        dnTimer(function () { if (DN.phase === 'wait59' && DN.nextAt === at) { DN.nextAt = 0; dnOn59(); } }, Math.max(0, at - Date.now()));
    }
    dnTg('⚠️ <b>Переодевание ночь (' + dnEsc(dnName()) + ')</b>\nЗаряд (' + (A.kind === 'on' ? 'надеть' : 'снять') + ') не вышел: <code>' + dnEsc(String(why).slice(0, 140)) + '</code>\nПойду обычной цепочкой (медленнее).');
}
function dnArmCancel(why) {
    var A = DN.arm; DN.arm = null;
    if (S && S.arm && (A || DN.chk)) { dnLog('заряд отменён: ' + why); endSession('заряд отменён: ' + why, false); }
}

// ── проверка «переодевание срабатывает и второй раз» (v3.3) ──
function dnChkTimer(C, fn, ms) { return setTimeout(function () { if (!_dead && DN.chk === C) { try { fn(); } catch (e) { dnLog('проверка, ошибка: ' + (e && e.message)); } } }, ms); }
function dnAutoCheck() {
    if (!DN_SELFCHECK || DN.startReason !== 'старт') return;
    dnTimer(function () { var er = dnCheck('при включении'); if (er) dnLog('проверка при включении не запущена: ' + er); }, 1500);
}
function dnCheck(src) {
    if (DN.chk) return 'проверка уже идёт';
    if (S) return 'Dress занят (шаг «' + S.step + '»)';
    if (dnConnected() === false) return 'персонаж не в игре';
    var now = Date.now();
    if (DN.on) {
        if (DN.rs) return 'идёт рестарт сервера';
        if (DN.phase !== 'wait59') return 'сейчас «' + dnPhaseText() + '» — проверка только пока цикл ждёт :59';
        if (!DN.nextAt || DN.nextAt - now < DN_CHECK_MIN_LEFT_S * 1000) return 'до :59 меньше ' + DN_CHECK_MIN_LEFT_S + ' с — подождите начала часа';
    } else if (dnNextHour(now) - now < (DN_CHECK_MIN_LEFT_S + 90) * 1000) return 'до :00 меньше ' + (DN_CHECK_MIN_LEFT_S + 90) + ' с — подождите начала часа';
    var first = DN.on && DN.uniform === true ? 'off' : (DN.on && DN.uniform === false ? 'on' : '');
    var C = DN.chk = { src: src, t0: now, steps: [], first: first, wasOn: DN.on, uni0: DN.on ? DN.uniform : null };
    if (DN.on) { DN.phase = 'check'; DN.nextAt = 0; }
    dnLog('=== ПРОВЕРКА (' + src + '): переодеться два раза подряд (заряд → выстрел)');
    dnTg('🧪 <b>Проверка переодевания (' + dnEsc(dnName()) + ')</b> — запущена (' + dnEsc(src) + '): переодеваюсь два раза подряд, форма в конце останется как была.', false);
    dnChkStep(C, 0);
    return '';
}
function dnChkDir(C, i) { return C.first ? (i === 0 ? C.first : (C.first === 'on' ? 'off' : 'on')) : ''; }
function dnChkStep(C, i) {
    if (DN.chk !== C) return;
    if (i >= 2) { dnChkFinish(C); return; }
    var rec = { i: i, ok: false, why: '', why2: '', armMs: 0, fireMs: 0, plainOk: false, plainMs: 0, dist: NaN }, fired = false;
    C.steps.push(rec);
    startSession(0, false, 0, true, true, function (res) {
        if (DN.chk !== C) return;
        if (typeof res.dist === 'number' && !isNaN(res.dist)) rec.dist = res.dist;
        var dir = dnChkDir(C, i);
        if (res.ok && fired) {
            rec.ok = true; rec.fireMs = res.fireMs; rec.armMs = res.armMs;
            if (C.wasOn && dnSkinOk(res.skin0) && dnSkinOk(res.skin1)) { if (dir === 'off') { DN.skinU = res.skin0; DN.skinC = res.skin1; } else if (dir === 'on') { DN.skinC = res.skin0; DN.skinU = res.skin1; } }
            dnChkTimer(C, function () { dnChkStep(C, i + 1); }, 700); return;
        }
        rec.why = res.why || '?';
        if (fired) { dnChkTimer(C, function () { dnChkStep(C, i + 1); }, 700); return; }                     // выстрел был, а скин не сменился
        dnChkTimer(C, function () {                                                                           // заряд не вышел — пробуем обычной цепочкой, чтобы отличить «не работает совсем» от «не работает заряд»
            startSession(0, false, 0, true, true, function (r2) {
                if (DN.chk !== C) return;
                if (typeof r2.dist === 'number' && !isNaN(r2.dist)) rec.dist = r2.dist;
                rec.plainOk = !!r2.ok; rec.plainMs = r2.ms || 0; if (!r2.ok) rec.why2 = r2.why || '?';
                dnChkTimer(C, function () { dnChkStep(C, i + 1); }, 700);
            });
        }, 800);
    }, { arm: true, onArmed: function (info) { rec.armMs = info.ms; fired = true; fireArmed(); } });
}
function dnChkFinish(C) {
    if (DN.chk !== C) return;
    DN.chk = null;
    var okN = 0, L = [], dist = NaN, bad = false, anyPlain = false;
    C.steps.forEach(function (r, idx) {
        var dir = dnChkDir(C, idx), name = dir === 'on' ? 'надеть' : dir === 'off' ? 'снять' : 'переодеться';
        if (!isNaN(r.dist)) dist = r.dist;
        if (r.ok) { okN++; L.push('✅ ' + (idx + 1) + ') ' + name + ': прогрев ' + dnSecs(r.armMs) + ', выстрел → смена скина ' + dnSecs(r.fireMs)); }
        else if (r.plainOk) { okN++; anyPlain = true; L.push('⚠️ ' + (idx + 1) + ') ' + name + ': заряд не вышел (<code>' + dnEsc(String(r.why).slice(0, 100)) + '</code>), обычной цепочкой вышло за ' + dnSecs(r.plainMs)); }
        else { bad = true; L.push('❌ ' + (idx + 1) + ') ' + name + ': <code>' + dnEsc(String(r.why2 || r.why).slice(0, 150)) + '</code>'); }
    });
    var head = bad ? '❌ <b>Переодевание сработало не оба раза</b>' : anyPlain ? '⚠️ <b>Переодевается, но заряд не работает — будет обычная цепочка</b>' : '✅ <b>Переодевание срабатывает и второй раз</b>';
    var msg = '🧪 <b>Проверка переодевания (' + dnEsc(dnName()) + ')</b>\n' + head + '\n' + L.join('\n');
    if (!isNaN(dist)) msg += '\nДо пикапа ~' + dist + ' м' + ((dist < NEAR_MIN_M || dist > FAR_MAX_M) ? ' — <b>вне допустимых ' + NEAR_MIN_M + '…' + FAR_MAX_M + ' м</b> (ближе 1.5 м сервер игнорирует повторный вход, дальше 4 м — ответы в диалоге)' : ' (норма ' + NEAR_MIN_M + '…' + FAR_MAX_M + ' м)');
    if (DN.on && C.wasOn) {
        if (okN % 2 === 1 && (C.uni0 === true || C.uni0 === false)) DN.uniform = !C.uni0;                // нечётное число удачных — форма сменилась
        dnSyncUniform();
        msg += '\nФорма сейчас: ' + (DN.uniform === true ? '👔 надета' : DN.uniform === false ? '👕 снята' : '❓') + '. Цикл продолжается.';
        dnWait59();
    }
    dnLog('=== ПРОВЕРКА завершена: удачно ' + okN + '/2' + (bad ? ', есть сбои' : ''));
    dnTg(msg, false);
}

function dnWait59() {
    DN.phase = 'wait59'; DN.pdAt = 0;                                   // новый круг — отметка PayDay прошлого часа больше не нужна
    var now0 = Date.now(), useArm = false;
    if (DN.speed === 'fast') {
        DN.nextAt = dnPickFast(now0);
        useArm = DN_ARM && (DN.nextAt - now0) >= DN_ARM_MIN_LEFT_MS;
        if (DN_ARM && !useArm) DN.nextAt = dnPickFast(now0, true);      // заряжать поздно — старт по запасу обычной цепочки
    } else DN.nextAt = dnPick59(now0);
    if (DN.speed === 'fast') {                                          // тик раз в секунду слишком грубый — ставим точный таймер на расчётный момент
        var at59 = DN.nextAt;
        dnTimer(function () { if (DN.phase === 'wait59' && DN.nextAt === at59) { DN.nextAt = 0; dnOn59(); } }, Math.max(0, at59 - Date.now()));
        if (useArm) dnTimer(function () { if (DN.phase === 'wait59' && DN.nextAt === at59) dnArm('on', ':59', 0); }, Math.max(0, at59 - now0 - DN_ARM_LEAD_MS));
    }
    dnLog('жду ' + dnClockAuto(DN.nextAt) + ' (' + DN.speed + (DN.speed === 'fast' ? ', запас до :00 ' + dnFastLead() + ' мс' : '') + ')');
    return DN.nextAt;
}
function dnOn59() {
    dnSyncUniform();
    if (DN.uniform === true) {                                          // уже в форме (в прошлый раз не сняли) — надевать нечего
        dnArmCancel('уже в форме');
        dnLog(':59 — уже в форме, жду PayDay');
        dnWaitPayday();
        return;
    }
    dnToggle('on', ':59');
}
function dnWaitPayday() {
    DN.phase = 'wait_payday'; DN.pdPending = false;
    var now = Date.now(), base = Math.floor(now / DN_HOUR) * DN_HOUR;
    DN.fbAt = (now - base < 120000) ? Math.max(now + 5000, base + DN_PD_FALLBACK_S * 1000) : base + DN_HOUR + DN_PD_FALLBACK_S * 1000;
    dnLog('жду PayDay, запасной таймер в ' + dnClock(DN.fbAt));
}
function dnOnPayday(src) {
    if (/^чат/.test(String(src)) && DN.on && !DN.rs) {                  // часы: на сколько строка PayDay отстоит от :00 по часам телефона (минус — телефон отстаёт от сервера). Считаем в ЛЮБОЙ фазе, один раз за час
        var tNow = Date.now(), hrN = Math.round(tNow / DN_HOUR);
        if (DN.pdOffHr !== hrN) {
            DN.pdOffHr = hrN;
            var po = tNow - hrN * DN_HOUR;
            if (Math.abs(po) < 20000) { DN.pdOffs = (DN.pdOffs || []).concat([po]).slice(-5); window.__dnPdOffs = DN.pdOffs; dnLog('PayDay пришёл на ' + po + ' мс от :00 по часам телефона (поправка старта сейчас ' + dnClockAdj() + ' мс)'); }
        }
    }
    if ((DN.phase === 'dressing' || DN.phase === 'wait_payday') && !DN.pdAt) DN.pdAt = Date.now();   // когда пришла строка PayDay (или сработал запасной таймер)
    if (DN.phase === 'dressing') { DN.pdPending = true; dnLog('PayDay пришёл во время надевания — снимем сразу после'); return; }
    if (DN.phase !== 'wait_payday') return;
    DN.fbAt = 0; DN.phase = 'payday'; DN.paydays++;
    dnLog('PayDay (' + src + ')');
    dnTimer(function () {
        dnSyncUniform();
        if (DN.uniform === false) { dnLog('PayDay, но форма уже снята — ничего не делаю'); dnWait59(); return; }
        dnToggle('off', 'PayDay');
    }, DN.speed === 'fast' ? DN_FAST_PD_DELAY_MS : dnRand(DN_PD_DELAY_MIN, DN_PD_DELAY_MAX));
}

// ═════════════════════ рестарт сервера ═════════════════════
// Что считаем рестартом: чат-сообщение «Сервер возобновит работу в течении минуты» (его же ждёт Code.js для AFK-ночи)
// или обрыв связи без нашего /rec дольше DN_DROP_CONFIRM_MS. Что делаем — решает человек при включении (DN.rmode):
//   'off'    — просто отключаемся («/rec off»), автовход не трогаем. Вернуться — «/rec 5» (кнопка «🔌 Зайти» или руками); зашли — цикл на паузе, кнопка «Вернуться на место и продолжить».
//   'return' — автовход включён, «/rec 90» → заходим заново, когда сервер поднялся. Сервер при входе в течение 5 минут после выхода спрашивает
//              «Восстановление позиции» (new.pwn, DIALOG_RESTORE_POSITION) — отвечаем «Да» (вернёт на последнее место на улице), затем «/tpl go dressnight»
//              (точка с интерьером, запомнена при ВКЛ) и цикл продолжается. Состояние «форма надета/снята» сверяем по скину.
// Сам рестарт, вход и диалог идут без участия остального кода: пока DN.rs задан, цикл (:59 / PayDay / переодевание) стоит.
function dnConnected() { try { return !!window.App.$store.getters['player/isPlayerConnected']; } catch (e) { return null; } }
function dnRModeText(m) { return m === 'off' ? '🔌 просто отключаемся (/rec off)' : '📍 входим сами и возвращаемся на место'; }
function dnParseMode(w) {
    w = String(w || '').toLowerCase();
    if (/^(off|auth|отключение|отключиться|откл|выход|авторизация|автор|авт|login|stay)$/.test(w)) return 'off';
    if (/^(return|ret|вернуться|возврат|вход|войти|зайти|tp)$/.test(w)) return 'return';
    return '';
}
function dnPtText() { var p = DN.pt; return p ? (p.x + ' ' + p.y + ' ' + p.z + (p.inter >= 0 ? ', интерьер ' + p.inter : '')) : 'не запомнена'; }
function dnTgBtn(html, markup, silent) { try { if (typeof sendToTelegram === 'function') sendToTelegram(html, silent === true, markup || null); } catch (e) {} }
function dnIsRestartMsg(text) {
    if (DN_RX_RESTART.test(text)) return true;
    try { if (typeof normalizeToCyrillic === 'function' && DN_RX_RESTART.test(normalizeToCyrillic(text))) return true; } catch (e) {}
    return false;
}
// автовход: запоминаем, как было до нас (dnAlRestore вернёт)
function dnAl(v) {
    try {
        if (typeof autoLoginConfig === 'undefined') return false;
        if (DN.rs && DN.rs.alWas === undefined) DN.rs.alWas = !!autoLoginConfig.enabled;
        autoLoginConfig.enabled = !!v;
        return true;
    } catch (e) { return false; }
}
function dnAlRestore() {
    var R = DN.rs;
    if (!R || R.alWas === undefined) return;
    var was = R.alWas; R.alWas = undefined;
    try { if (typeof autoLoginConfig !== 'undefined' && !!autoLoginConfig.enabled !== was) autoLoginConfig.enabled = was; } catch (e) {}
}
function dnRsOffButtons() {
    var uid = uniqueId;
    return { inline_keyboard: [
        [createButton('🔌 Зайти (/rec 5)', 'dn_rec_' + uid, 'success')],
        [createButton('⏹️ Выключить', 'dn_off_' + uid, 'danger')]
    ] };
}
function dnRsButtons() {
    var uid = uniqueId;
    return { inline_keyboard: [
        [createButton('📍 Вернуться на место и продолжить', 'dn_back_' + uid, 'success')],
        [createButton('⏹️ Выключить', 'dn_off_' + uid, 'danger')]
    ] };
}

// диалог «Восстановление позиции» — только в режиме «return», пока идёт рестарт
function dnOnDialog(params, content) {
    if (typeof params !== 'string') return false;
    var p;
    try { p = JSON.parse(params.trim()); } catch (e) { return false; }
    var id = parseInt(p[0], 10), style = parseInt(p[1], 10);
    if (isNaN(id) || isNaN(style) || style !== 0) return false;        // «Да/Нет» — обычный MSGBOX
    var raw = Array.isArray(content) ? content.join('<n>') : String(content || '');
    if (!DN_RX_RESTORE.test(strip(p[2]) + ' ' + strip(p[3]) + ' ' + strip(raw))) return false;
    dnLog('диалог «Восстановление позиции» (id ' + id + ') → Да');
    try { respond(id, 1, -1, ''); } catch (e) { warn('dnOnDialog:', e && e.message); return false; }
    if (DN.rs) DN.rs.restored = true;
    return true;
}
function dnHookDialogs() {
    if (DN.dlgWrap) return true;
    var cur = window.addDialogInQueue;
    if (typeof cur !== 'function') { dnLog('addDialogInQueue не найден — «Восстановление позиции» придётся отвечать руками'); return false; }
    var wrapped = function (params, content, priority) {
        var eat = false;
        try { if (!_dead && DN.on && DN.rs && DN.rs.mode === 'return') eat = dnOnDialog(params, content); } catch (err) { warn('dnOnDialog:', err && err.message); }
        if (eat) return;
        return cur.apply(this, arguments);
    };
    DN.dlgOrig = cur; DN.dlgWrap = wrapped; window.addDialogInQueue = wrapped;
    return true;
}
function dnUnhookDialogs() {
    try { if (DN.dlgWrap && window.addDialogInQueue === DN.dlgWrap) window.addDialogInQueue = DN.dlgOrig; } catch (e) {}
    DN.dlgWrap = null; DN.dlgOrig = null;
}

// чат: ответ /tpl save (при ВКЛ), объявление рестарта, ответ /tpl go (после входа). true — строку разобрали
function dnRsChat(text) {
    var m, R = DN.rs;
    if (DN.ptWait) {
        if ((m = RX_PT_SAVED.exec(text))) {
            DN.ptWait = false;
            DN.pt = { x: m[1], y: m[2], z: m[3], inter: m[4] !== undefined ? parseInt(m[4], 10) : -1 };
            dnLog('место запомнено: ' + dnPtText());
            return false;                                              // дальше не мешаем — остальным разборщикам эта строка не нужна, но и «съедать» её незачем
        }
        if (RX_TPL_ERR.test(text)) {
            DN.ptWait = false; dnLog('/tpl save не удался: ' + text.slice(0, 100));
            dnTg('⚠️ <b>Переодевание ночь (' + dnEsc(dnName()) + ')</b>\nМесто для возврата не запомнилось: <code>' + dnEsc(text.slice(0, 120)) + '</code>');
            return false;
        }
    }
    if (!R) {
        if (dnIsRestartMsg(text)) { dnOnRestart('сообщение сервера'); return true; }
        return false;
    }
    if (R.step === 'tp' && R.goWait) {                                  // ответ /tpl go
        if (/Телепорт на точку\s*«/.test(text)) { R.goWait = false; dnLog('/tpl go: ' + text.slice(0, 120)); dnRsDone(); return true; }
        if (/Точки\s*«[^»]*»\s*нет/.test(text)) { R.goWait = false; dnRsGoFail('точки «' + DN_POINT + '» нет в списке /tpl (при ВКЛ она не запомнилась)'); return true; }
        if (/^Телепорт:/i.test(text)) { R.goWait = false; dnRsGoRetry(text.slice(0, 90)); return true; }
    }
    return false;
}

function dnOnRestart(src) {
    if (!DN.on || DN.rs || _dead) return;
    var wasPhase = DN.phase;
    var R = DN.rs = { src: src, t0: Date.now(), step: 'wait', alWas: undefined, sawDown: dnConnected() === false, goTries: 0, goWait: false, goTimer: null, lastRetry: 0, rejoinAt: 0, gaveUp: false, restored: false, mode: DN.rmode };
    DN.phase = 'restart'; DN.nextAt = 0; DN.fbAt = 0; DN.pdPending = false; DN.downSince = 0; DN.arm = null; DN.chk = null;
    DN.timers.forEach(function (h) { clearTimeout(h); }); DN.timers = [];
    if (S) { try { endSession('рестарт сервера', false); } catch (e) {} }  // идущая сессия переодевания не нужна; колбэк цикла её итог не двигает (DN.rs задан)
    dnLog('РЕСТАРТ (' + src + '), были в фазе «' + wasPhase + '», режим: ' + R.mode);
    if (R.mode === 'off') dnRsOff(); else dnRsReturn();
}
function dnRsOff() {
    var R = DN.rs;
    R.step = 'off';
    window.__recDisconnectUntil = Math.max(window.__recDisconnectUntil || 0, Date.now() + DN_OFF_HOLD_MS);   // Code.js: обрыв связи — наш, не реагируем
    chatCmd('/rec off');                                                                                  // автовход не трогаем (dnAl не зовём)
    dnTgBtn('🔌 <b>Рестарт сервера — отключились (' + dnEsc(dnName()) + ')</b>\nПричина: ' + dnEsc(R.src) + '\nОтправлен /rec off: камера в воздухе, соединение разорвано, автовход не менялся.\nЗайти: кнопкой «🔌 Зайти» (/rec 5) или руками. После входа цикл встанет на паузу — вернуться на место можно кнопкой.', dnRsOffButtons(), false);
}
function dnRsReturn() {
    var R = DN.rs, ok = dnAl(true), viaMsg = R.src === 'сообщение сервера';
    R.step = 'wait'; R.rejoinAt = Date.now() + (viaMsg ? DN_REJOIN_S * 1000 : 20000);
    dnHookDialogs();
    if (viaMsg) chatCmd('/rec ' + DN_REJOIN_S);
    dnTg('🔄 <b>Рестарт сервера — зайдём и вернёмся на место (' + dnEsc(dnName()) + ')</b>\nПричина: ' + dnEsc(R.src) + '\n' +
        (viaMsg ? 'Выходим сейчас, заходим через ~' + DN_REJOIN_S + ' с (/rec ' + DN_REJOIN_S + '), автовход включён.' : 'Связь пропала — ждём, пока игра зайдёт заново (автовход включён).') +
        '\nПосле входа: «Да» на «Восстановление позиции» → /tpl go ' + DN_POINT + ' (' + dnEsc(dnPtText()) + ') → цикл дальше.' +
        (DN.pt ? '' : '\n⚠️ Место не запомнено — после входа цикл встанет на паузу.') + (ok ? '' : '\n⚠️ autoLoginConfig не найден — автовход не проверен.'), false);
}
function dnRsTick(now, c) {
    var R = DN.rs;
    if (!R) return;
    if (c === false) R.sawDown = true;
    if ((R.step === 'wait' || R.step === 'off') && c === true && R.sawDown) { dnRsSpawned(); return; }
    if (R.step !== 'wait') return;
    if (!R.sawDown && now - R.t0 > DN_FALSE_ALARM_S * 1000) { dnRsResume('рестарта не было', '⚠️ Объявление было, а связь не пропала за ' + DN_FALSE_ALARM_S + ' с — считаю, что рестарта не было.'); return; }
    if (c === false && now >= R.rejoinAt + 40000 && now - R.lastRetry >= DN_REJOIN_RETRY_S * 1000) {
        R.lastRetry = now; dnLog('входа нет — повторяю /rec 5'); chatCmd('/rec 5');
    }
    if (!R.gaveUp && now - R.t0 > DN_REJOIN_GIVEUP_S * 1000) {
        R.gaveUp = true;
        dnTg('⚠️ <b>Переодевание ночь (' + dnEsc(dnName()) + ')</b>\nНе зашли за ' + Math.round(DN_REJOIN_GIVEUP_S / 60) + ' мин после рестарта — продолжаю пробовать (/rec 5 раз в ' + DN_REJOIN_RETRY_S + ' с). Проверьте пароль/сервер.', false);
    }
}
function dnRsSpawned() {
    var R = DN.rs, took = Math.round((Date.now() - R.t0) / 1000);
    dnLog('в игре после рестарта, прошло ' + took + ' с' + (R.restored ? ', позиция восстановлена сервером' : ''));
    if (R.step === 'off') {
        R.step = 'paused';
        dnTgBtn('🎮 <b>Зашли в игру после рестарта (' + dnEsc(dnName()) + ')</b>\nЦикл «Переодевание ночь» на паузе. Вернуться на место (' + dnEsc(dnPtText()) + ') и продолжить?', dnRsButtons());
        return;
    }
    R.step = 'tp'; R.goTries = 0;
    dnTimer(dnRsGo, DN_SPAWN_SETTLE_MS);                                // даём миру прогрузиться; «Восстановление позиции» к этому моменту уже отвечено (без него входа в игру не было бы)
}
function dnRsGo() {
    var R = DN.rs;
    if (!R || R.step !== 'tp') return;
    if (dnConnected() === false) { R.step = 'wait'; R.sawDown = true; dnLog('связь снова пропала перед /tpl go — жду вход'); return; }
    R.goTries++; R.goWait = true;
    dnLog('/tpl go ' + DN_POINT + ', попытка ' + R.goTries + '/' + DN_GO_TRIES);
    if (!chatCmd('/tpl go ' + DN_POINT)) { R.goWait = false; dnRsGoFail('не удалось отправить /tpl go'); return; }
    if (DN.rs === R && R.goWait) R.goTimer = dnTimer(function () { if (DN.rs === R && R.goWait) { R.goWait = false; dnRsGoRetry('мод /tpl не ответил'); } }, 3000);   // мод отвечает синхронно: если ответ уже был, R.goWait сброшен
}
function dnRsGoRetry(why) {
    var R = DN.rs;
    if (!R) return;
    if (R.goTries < DN_GO_TRIES) { dnLog('/tpl go: ' + why + ' — повтор через ' + DN_GO_RETRY_MS + ' мс'); dnTimer(dnRsGo, DN_GO_RETRY_MS); }
    else dnRsGoFail(why);
}
function dnRsGoFail(why) {
    var R = DN.rs;
    if (!R) return;
    R.goWait = false; R.step = 'paused';
    dnLog('вернуться на точку не вышло: ' + why);
    dnTgBtn('❗ <b>Не вернулись на место (' + dnEsc(dnName()) + ')</b>\n' + dnEsc(why) + '\nЦикл на паузе. Поставьте NPC у раздевалки руками или повторите возврат.', dnRsButtons());
}
function dnRsDone() {
    var R = DN.rs;
    if (!R) return;
    var secs = Math.round((Date.now() - R.t0) / 1000);
    dnUnhookDialogs(); dnAlRestore();
    DN.rs = null;
    dnLog('вернулись на точку, от рестарта прошло ' + secs + ' с');
    dnTg('📍 <b>Вернулись на место (' + dnEsc(dnName()) + ')</b>\nТочка: ' + dnEsc(dnPtText()) + '\nОт рестарта до возврата ' + secs + ' с' + (R.restored ? ' (позицию восстановил сервер)' : '') + '. Продолжаю цикл.', false);
    dnTimer(function () { dnResumeCycle('после рестарта'); }, 1500);   // пауза: пусть телепорт «осядет» (интерьер, земля)
}
// рестарта не было / продолжаем с нуля: возвращаем автовход и запускаем цикл заново (/nocol on → снять форму, если надета → :59 …)
function dnRsResume(reason, note) {
    if (!DN.rs) return;
    dnUnhookDialogs(); dnAlRestore();
    DN.rs = null;
    if (note) dnTg(note, false);
    dnResumeCycle(reason);
}
function dnResumeCycle(reason) {
    if (!DN.on) return;
    DN.startReason = reason || 'старт';
    DN.phase = 'nocol'; DN.nocolSeen = false; DN.tries = 0; DN.busyN = 0;
    dnLog('возобновляю цикл (' + DN.startReason + '): /nocol on, скин ' + curSkin());
    if (!chatCmd('/nocol on')) { DN.err = 'не удалось отправить /nocol on'; dnLog(DN.err); dnAfterNocol(); return; }
    dnTimer(function () { if (DN.phase === 'nocol') { dnLog('/nocol не ответил за ' + DN_NOCOL_WAIT_MS + ' мс — иду дальше'); dnAfterNocol(); } }, DN_NOCOL_WAIT_MS);
}
// кнопка «Вернуться на место и продолжить» (пауза после авторизации или неудачного возврата). Возвращает текст ошибки или ''
function dnRsBack() {
    var R = DN.rs;
    if (!DN.on || !R || R.step !== 'paused') return 'сейчас нет паузы после рестарта';
    if (dnConnected() === false) return 'персонаж не в игре';
    R.step = 'tp'; R.goTries = 0;
    dnRsGo();
    return '';
}
function dnRsText() {
    var R = DN.rs;
    if (!R) return '';
    var s = Math.round((Date.now() - R.t0) / 1000);
    return ({ wait: 'ждём вход после рестарта', off: 'отключились (/rec off), ждём вход', tp: 'в игре — возвращаемся на точку', paused: 'пауза, ждём кнопку «Вернуться на место и продолжить»' })[R.step] + ' (' + s + ' с)';
}

function dnPhaseText() {
    return ({ off: 'выключено', nocol: 'включаю /nocol', start: 'старт', undressing: 'снимаю форму', dressing: 'надеваю форму', check: 'проверка переодевания', wait59: 'жду :59', wait_payday: 'жду PayDay', payday: 'PayDay пойман', restart: 'рестарт сервера' })[DN.phase] || DN.phase;
}
function dnStatusHtml() {
    var now = Date.now(), L = [];
    L.push('👗 <b>Переодевание ночь — ' + dnEsc(dnName()) + '</b>');
    L.push('Статус: ' + (DN.on ? '🟢 <b>работает</b>' : '⏹️ выключено'));
    L.push('Тип: <b>' + dnSpeedText(DN.speed) + '</b>' + (DN.speed === 'fast' ? ' (старт за ' + (dnFastLead() / 1000).toFixed(1) + ' с до :00, снятие сразу по PayDay)' : ''));
    if (DN.on) {
        L.push('Фаза: ' + dnPhaseText());
        if (DN.phase === 'wait59' && DN.nextAt) { var s = Math.max(0, Math.round((DN.nextAt - now) / 1000)); L.push('Надеть форму в <b>' + dnClockAuto(DN.nextAt) + '</b> (через ' + Math.floor(s / 60) + ' мин ' + (s % 60) + ' с)'); }
        if (DN.phase === 'wait_payday') L.push('Снять форму сразу после PayDay (запасной таймер ' + dnClock(DN.fbAt) + ')');
        if (DN.rs) L.push('🔄 Рестарт: ' + dnEsc(dnRsText()));
        if (DN.arm) L.push('🔫 Заряд (' + (DN.arm.kind === 'on' ? 'надеть' : 'снять') + '): ' + ({ arming: 'собирается', ready: 'готов', firing: 'выстрел' })[DN.arm.state]);
        if (DN.pdOffs && DN.pdOffs.length) L.push('⏱ PayDay приходит на ' + DN.pdOffs.slice(-3).join(', ') + ' мс от :00 по часам телефона (поправка старта ' + dnClockAdj() + ' мс)');
    }
    L.push('После рестарта: ' + dnRModeText(DN.rmode));
    if (DN.on) L.push('Точка возврата: ' + (DN.pt ? '<code>' + dnEsc(dnPtText()) + '</code>' : '⚠️ не запомнена'));
    L.push('Форма: ' + (DN.uniform === true ? '👔 надета' : DN.uniform === false ? '👕 снята' : '❓ неизвестно'));
    L.push('Кругов: ' + DN.cycles + ' · PayDay пойман: ' + DN.paydays);
    if (dnSkinOk(DN.skinU) || dnSkinOk(DN.skinC)) L.push('Скины: форма ' + (dnSkinOk(DN.skinU) ? DN.skinU : '?') + ', обычный ' + (dnSkinOk(DN.skinC) ? DN.skinC : '?'));
    if (DN.err) L.push('Последняя ошибка: <code>' + dnEsc(DN.err) + '</code>');
    L.push('\n<i>Поставьте NPC у раздевалки (до ~5 м от пикапа) и нажмите ВКЛ.</i>');
    return L.join('\n');
}
function dnMenuMarkup() {
    var uid = uniqueId;
    return { inline_keyboard: [
        [createButton('🟢 ВКЛ' + (DN.on ? ' ✓' : ''), 'dn_on_' + uid, 'success'), createButton('⏹️ ВЫКЛ' + (!DN.on ? ' ✓' : ''), 'dn_off_' + uid, 'danger')],
        [createButton('⚡ Тип: ' + (DN.speed === 'fast' ? 'моментальное' : 'обычное'), 'dn_speed_' + uid)],
        [createButton('🧪 Проверка переодевания', 'dn_chk_' + uid)],
        [createButton('🔁 После рестарта: ' + (DN.rmode === 'off' ? '🔌 отключиться' : '📍 вернуться'), 'dn_mode_' + uid)]
    ].concat(DN.rs && DN.rs.step === 'paused' ? [[createButton('📍 Вернуться на место и продолжить', 'dn_back_' + uid, 'success')]] : [], DN.rs && DN.rs.step === 'off' ? [[createButton('🔌 Зайти (/rec 5)', 'dn_rec_' + uid, 'success')]] : [], [
        [createButton('🔄 Обновить', 'dn_ref_' + uid)],
        [createButton('⬅️ Вернуться назад', 'show_functions_' + uid)]
    ]) };
}
// экран выбора при нажатии «ВКЛ»: что делаем после рестарта сервера
function dnShowChoice(chatId, messageId) {
    var uid = uniqueId;
    editMessageText(chatId, messageId,
        '🌙 <b>Переодевание ночь — ' + dnEsc(dnName()) + '</b>\n<b>Тип переодевания (сейчас: ' + dnSpeedText(DN.speed) + ')</b>\n' +
        '🕐 <b>Обычное</b> — надеть в :59:' + DN_SEC_MIN + '–:59:' + DN_SEC_MAX + ', снять через ' + (DN_PD_DELAY_MIN / 1000) + '–' + (DN_PD_DELAY_MAX / 1000) + ' с после строки PayDay.\n' +
        '⚡ <b>Моментальное</b> — надеть впритык к :00 (старт за ~' + (dnFastLead() / 1000).toFixed(1) + ' с до :00, по замеру надевания + запас ' + (DN_FAST_MARGIN_MS / 1000) + ' с), снять сразу по строке PayDay.\n' +
        'Кнопка ниже переключает тип.\n\n<b>Что делаем после рестарта сервера?</b>\n\n' +
        '🔌 <b>Просто отключаемся</b> — на рестарте шлём /rec off (камера в воздух + разрыв), автовход не трогаем. Зайти — кнопкой «Зайти» (/rec 5) или руками; после входа цикл на паузе.\n\n' +
        '📍 <b>Входим и возвращаемся</b> — заходим сами (автовход), отвечаем «Да» на «Восстановление позиции», телепортируемся туда, где стояли (/tpl go), цикл идёт дальше.\n\n' +
        '<i>Место запоминается в момент нажатия — NPC уже должен стоять у раздевалки (до ~5 м от пикапа). Прошлый выбор: ' + (DN.rmode === 'off' ? '🔌' : '📍') + '</i>',
        { inline_keyboard: [
            [createButton('⚡ Тип: ' + (DN.speed === 'fast' ? 'моментальное ✓ (нажать — обычное)' : 'обычное ✓ (нажать — моментальное)'), 'dn_spdc_' + uid)],
            [createButton('🔌 Просто отключиться' + (DN.rmode === 'off' ? ' ✓' : ''), 'dn_goauth_' + uid, 'danger')],
            [createButton('📍 Войти и вернуться' + (DN.rmode !== 'off' ? ' ✓' : ''), 'dn_goret_' + uid, 'success')],
            [createButton('⬅️ Назад', 'dn_menu_' + uid)]
        ] });
}
function dnShowMenu(chatId, messageId) { editMessageText(chatId, messageId, dnStatusHtml(), dnMenuMarkup()); }

// ── кнопка в меню «Функции» (как у Code2: вставка строки перед «Вернуться назад») ──
var DN_ACT = ['dn_menu_', 'dn_on_', 'dn_off_', 'dn_ref_', 'dn_goauth_', 'dn_goret_', 'dn_rec_', 'dn_mode_', 'dn_back_', 'dn_speed_', 'dn_spdc_', 'dn_chk_'];
function dnActOf(d) { return DN_ACT.filter(function (p) { return typeof d === 'string' && d.indexOf(p) === 0; })[0] || null; }
function dnMine(u) {
    var cq = u && u.callback_query;
    if (!cq || typeof cq.data !== 'string') return false;
    var pre = dnActOf(cq.data);
    if (!pre || cq.data.slice(pre.length) !== uniqueId) return false;
    return !!(cq.message && cq.message.chat && config.chatIds.includes(String(cq.message.chat.id)));
}
function dnInject(markup) {
    try {
        if (!markup || !Array.isArray(markup.inline_keyboard)) return;
        var rows = markup.inline_keyboard;
        if (rows.some(function (r) { return (r || []).some(function (b) { return b && typeof b.callback_data === 'string' && b.callback_data.indexOf('dn_menu_') === 0; }); })) return;
        rows.splice(Math.max(0, rows.length - 1), 0, [createButton('👗 Переодевание ночь ' + (DN.on ? '🟢' : '🔴'), 'dn_menu_' + uniqueId, DN.on ? 'success' : 'danger')]);
    } catch (e) {}
}
try {
    if (typeof showFunctionsMenu === 'function') {
        var dnOrigShow = showFunctionsMenu;
        var dnPatchedShow = function () {
            if (_dead) return dnOrigShow.apply(this, arguments);
            var oe = editMessageReplyMarkup, ot = editMessageText;
            editMessageReplyMarkup = function (c, m, mk) { dnInject(mk); return oe.apply(this, arguments); };
            editMessageText = function (c, m, t, mk) { dnInject(mk); return ot.apply(this, arguments); };
            try { return dnOrigShow.apply(this, arguments); }
            finally { editMessageReplyMarkup = oe; editMessageText = ot; }
        };
        showFunctionsMenu = dnPatchedShow;
        onUndo(function () { try { if (showFunctionsMenu === dnPatchedShow) showFunctionsMenu = dnOrigShow; } catch (e) {} });
    } else warn('showFunctionsMenu не найдена — кнопки «Переодевание ночь» в Telegram не будет (работает /dressnight)');
} catch (e) { warn('кнопка Функции:', e && e.message); }

// ── нажатия кнопок (как у Screen.js: свои забираем, остальное — дальше) ──
try {
    if (typeof processUpdates === 'function') {
        var dnOrigPU = processUpdates;
        var dnPatchedPU = function (updates) {
            if (!_dead) {
                try {
                    if (Array.isArray(updates) && updates.some(dnMine)) {
                        var rest = [];
                        updates.forEach(function (u) {
                            if (!dnMine(u)) { rest.push(u); return; }
                            var cq = u.callback_query, act = dnActOf(cq.data), ch = cq.message.chat.id, mid = cq.message.message_id;
                            try { answerCallbackQuery(cq.id); } catch (e) {}
                            if (act === 'dn_on_') {
                                if (!DN.on) { dnShowChoice(ch, mid); return; }                        // выбор «что после рестарта» — до запуска
                            } else if (act === 'dn_goauth_' || act === 'dn_goret_') {
                                var er = DN.on ? '' : dnStart('Telegram', act === 'dn_goauth_' ? 'off' : 'return');
                                if (er) dnTg('❌ <b>Переодевание ночь (' + dnEsc(dnName()) + ')</b>\n' + dnEsc(er), false);
                            } else if (act === 'dn_mode_') {
                                DN.rmode = DN.rmode === 'off' ? 'return' : 'off'; window.__dnRMode = DN.rmode;
                                dnLog('после рестарта: ' + DN.rmode + (DN.on ? ' (на лету)' : ''));
                            } else if (act === 'dn_rec_') {
                                if (DN.rs && DN.rs.step === 'off') { dnLog('вход по кнопке: /rec 5'); chatCmd('/rec 5'); }
                            } else if (act === 'dn_back_') {
                                var eb = dnRsBack();
                                if (eb) dnTg('❌ <b>Переодевание ночь (' + dnEsc(dnName()) + ')</b>\n' + dnEsc(eb), false);
                            } else if (act === 'dn_chk_') {
                                var ec = dnCheck('Telegram');
                                if (ec) dnTg('❌ <b>Проверка (' + dnEsc(dnName()) + ')</b>\n' + dnEsc(ec), false);
                            } else if (act === 'dn_speed_') {
                                dnSpeedFlip();
                            } else if (act === 'dn_spdc_') {
                                dnSpeedFlip(); dnShowChoice(ch, mid); return;                         // переключили тип на экране выбора — остаёмся на нём
                            } else if (act === 'dn_off_') dnStop('выключено из Telegram');
                            dnShowMenu(ch, mid);
                        });
                        if (!rest.length) return;
                        updates = rest;
                    }
                } catch (e) { warn('dn processUpdates:', e && e.message); }
            }
            return dnOrigPU.apply(this, [updates].concat([].slice.call(arguments, 1)));
        };
        processUpdates = dnPatchedPU;
        onUndo(function () { try { if (processUpdates === dnPatchedPU) processUpdates = dnOrigPU; } catch (e) {} });
    } else warn('processUpdates не найдена — кнопки «Переодевание ночь» не сработают');
} catch (e) { warn('processUpdates:', e && e.message); }

// ── страховка: даже если строй-функции Code.js как-то вызовутся, пока ночной режим включён, они ничего не делают ──
try {
    if (typeof performStroiReconnect === 'function') {
        var dnOrigPSR = performStroiReconnect;
        var dnPatchedPSR = function () {
            if (!_dead && DN.on && DN_IGNORE_STROY) { dnLog('performStroiReconnect заблокирован (ночной режим)'); return; }
            return dnOrigPSR.apply(this, arguments);
        };
        performStroiReconnect = dnPatchedPSR;
        onUndo(function () { try { if (performStroiReconnect === dnPatchedPSR) performStroiReconnect = dnOrigPSR; } catch (e) {} });
    } else warn('performStroiReconnect не найдена — строй игнорируется только хуком чата');
    if (typeof exitAfterStroiPayDay === 'function') {
        var dnOrigEAS = exitAfterStroiPayDay;
        var dnPatchedEAS = function () {
            if (!_dead && DN.on && DN_IGNORE_STROY) { dnLog('exitAfterStroiPayDay заблокирован (ночной режим)'); dnClearStroy('PayDay'); return; }
            return dnOrigEAS.apply(this, arguments);
        };
        exitAfterStroiPayDay = dnPatchedEAS;
        onUndo(function () { try { if (exitAfterStroiPayDay === dnPatchedEAS) exitAfterStroiPayDay = dnOrigEAS; } catch (e) {} });
    } else warn('exitAfterStroiPayDay не найдена — выход после строя не заблокирован');
} catch (e) { warn('строй:', e && e.message); }

onUndo(function () { try { dnStop('перезагрузка скриптов', true); } catch (e) {} });

// ── команда в игровом чате: /dressnight [on|off|status], /ночь ──
function dnCmd(args) {
    var a = (args[0] || 'status').toLowerCase();
    if (a === 'on' || a === 'вкл') {
        var rm = '', sp = '';
        for (var ai = 1; ai < args.length; ai++) {
            var m1 = dnParseMode(args[ai]), s1 = dnParseSpeed(args[ai]);
            if (m1) rm = m1; else if (s1) sp = s1;
            else { fail('не понял «' + args[ai] + '». После рестарта: off (просто отключаемся) или return (входим и возвращаемся); тип: normal (обычное) или fast (моментальное)'); return; }
        }
        var er = dnStart('чат', rm, sp); if (er) fail('Переодевание ночь: ' + er); else info('Переодевание ночь: включено, тип — ' + (DN.speed === 'fast' ? 'моментальное' : 'обычное') + ', после рестарта — ' + (DN.rmode === 'off' ? 'отключиться' : 'вернуться на место')); return;
    }
    if (a === 'mode' || a === 'режим' || a === 'рестарт') {
        var mm = dnParseMode(args[1]);
        if (!mm) { info('После рестарта сейчас: ' + (DN.rmode === 'off' ? 'просто отключаемся (/rec off)' : 'входим и возвращаемся') + '. Сменить: /dressnight mode off | return'); return; }
        DN.rmode = mm; window.__dnRMode = mm; info('После рестарта: ' + (mm === 'off' ? 'просто отключаемся (/rec off)' : 'входим и возвращаемся')); return;
    }
    if (a === 'speed' || a === 'тип' || a === 'скорость') {
        var sv = dnParseSpeed(args[1]);
        if (!sv) { info('Тип сейчас: ' + (DN.speed === 'fast' ? 'моментальное' : 'обычное') + '. Сменить: /dressnight speed fast | normal'); return; }
        DN.speed = sv; window.__dnSpeed = sv; info('Тип переодевания: ' + (sv === 'fast' ? 'моментальное' : 'обычное') + (DN.on ? ' (со следующего круга)' : '')); return;
    }
    if (a === 'check' || a === 'test' || a === 'проверка') { var ec2 = dnCheck('чат'); if (ec2) fail('Проверка: ' + ec2); else info('Проверка переодевания запущена — результат в Telegram и в журнале'); return; }
    if (a === 'back' || a === 'назад' || a === 'вернуться') { var eb2 = dnRsBack(); if (eb2) fail('Переодевание ночь: ' + eb2); else info('Переодевание ночь: возвращаюсь на место'); return; }
    if (a === 'off' || a === 'выкл' || a === 'stop') { if (DN.on) { dnStop('выключено командой'); info('Переодевание ночь: выключено'); } else info('Переодевание ночь: и так выключено'); return; }
    info('Переодевание ночь: ' + (DN.on ? (DN.rs ? 'рестарт — ' + dnRsText() : dnPhaseText() + (DN.phase === 'wait59' ? ', надеть в ' + dnClockAuto(DN.nextAt) : '')) + ', кругов ' + DN.cycles : 'выключено') + '; тип: ' + (DN.speed === 'fast' ? 'моментальное' : 'обычное') + '; после рестарта: ' + (DN.rmode === 'off' ? 'отключиться' : 'вернуться'));
}

var origChatWin = window.sendChatInputCustom;
var origChatVar = null;
try { if (typeof sendChatInput === 'function') origChatVar = sendChatInput; } catch (e) {}
var prevChat = origChatWin || origChatVar;
var myChat = function (e) {
    if (!_dead && typeof e === 'string') {
        var a = e.trim().split(/\s+/), cmd = (a[0] || '').toLowerCase();
        if (cmd === '/dress' || cmd === '/раздевалка') { runCmd(a.slice(1)); return; }
        if (cmd === '/dressnight' || cmd === '/ночь') { dnCmd(a.slice(1)); return; }
        if (cmd === '/dressu' || cmd === '/раздевалка2') { runCmd(['use'].concat(a.slice(1)), true); return; }   // use + запасной телепорт, если сервер не отреагировал
    }
    if (typeof prevChat === 'function') return prevChat.apply(this, arguments);
};
window.sendChatInputCustom = myChat;
try { sendChatInput = myChat; } catch (e) {}
onUndo(function () {
    if (window.sendChatInputCustom === myChat) window.sendChatInputCustom = origChatWin;
    try { if (sendChatInput === myChat) sendChatInput = origChatVar || origChatWin; } catch (e) {}
});

window.Dress = { run: function (n, under, sec, use, fb, cb) { startSession(n || 0, !!under, sec || 0, !!use, !!fb, cb); }, busy: function () { return !!S; }, night: function (on, rmode, speed) { if (on) return dnStart('api', rmode, dnParseSpeed(speed)); dnStop('api'); return ''; }, nightSpeed: function (m) { m = dnParseSpeed(m); if (m) { DN.speed = m; window.__dnSpeed = m; } return DN.speed; }, nightStatus: dnStatusHtml, nightMode: function (m) { m = dnParseMode(m); if (m) { DN.rmode = m; window.__dnRMode = m; } return DN.rmode; }, nightBack: dnRsBack, nightCheck: dnCheck, nightOn: function () { return !!DN.on; }, stop: function () { if (S) endSession('прервано', true); }, status: statusText };
onUndo(function () { try { delete window.Dress; } catch (e) { window.Dress = undefined; } });

log('Dress.js v3.3 загружен (заряд: «Да» одним пакетом; /dressnight check — проверка «второй раз сработает») (в ночном режиме строй на рации игнорируется; в Telegram — сколько заняло надевание/снятие): /dressnight on [auth|return] [fast|normal]|off|status|mode|speed|back (цикл «Переодевание ночь», кнопка в Telegram → Функции; после рестарта — авторизация или вход и возврат на место), /dressu [N] (вход без движения; не сработал — ошибка, телепорт выключен: TP_FALLBACK), /dress [N] [use|tp], /dress [N] under [предел-сек], /dress stop, /dress status, /dress log (use — вход в пикап без движения, нужен мод /tpl с командой «use»; under — с командой «up»; журнал — мод /jlog)');

})(); } catch (e) { try { console.error('[DRESS] ошибка загрузки Dress.js:', e); } catch (e2) {} }
