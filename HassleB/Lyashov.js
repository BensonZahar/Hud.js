// Lyashov.js v4 — разговорный NPC на нейросети: отвечает как обычный человек и пишет ответ в чат от ВАШЕГО лица.
//
// Как это работает:
//   1. Вопрос (ваша команда или реплика другого игрока) уходит в модель вместе с коротким промптом «обычный человек».
//   2. Ответ очищается (рассуждения, markdown, {цвета}, <теги>, эмодзи, ведущий «/») и отправляется в чат игры
//      через sendChatInput — то есть выглядит так, будто вы сами написали это в чат. Сервер режет обычный чат на 83 символа,
//      поэтому длинное режется на части (не больше CFG.maxParts), между частями пауза и учёт антифлуда сервера.
//   3. Режим вывода можно переключить на «local»: тогда ответ видите только вы (как раньше).
//
// Два режима модели:
//   fast  — рассуждения выключены, ответ за пару секунд (по умолчанию)
//   think — «думающий»: модель рассуждает перед ответом, медленнее (до 60 с), но вдумчивее
//
// Команды в чате (серверу не уходят):
//   /lyashov <текст>      — ответить на этот текст (синоним /lys), режим — текущий
//   /lyashthink <текст>   — то же, но один раз в думающем режиме
//   /lyashmode [fast|think] — режим модели (без аргумента — показать); запоминается
//   /lyashout [say|local] — куда писать ответ: say — в чат игры от вашего лица (по умолчанию), local — только вам
//   /lyashlisten [on|off] — отвечать самому на реплики игроков рядом («Ник[id]: текст»). Всегда выключен после запуска игры
//   /lyashauto [on|off]   — (только при /lyashout local) ваша фраза рядом с актёром уходит модели; нужен Near.js
//   /lyashdiag            — режим, адрес и итог последнего запроса
//
// Настройки (необязательно) — до загрузки скрипта: window.LYASHOV_CONFIG = { apiKey: 'sk-...', mode: 'think', out: 'local' };
//
// API: window.Lyashov.ask(текст, ник, cb, {mode}) — cb({ok, text, parts, error}); .setMode(); .setOut(); .config; .systemPrompt
//
// Файл подклеивается в Code2 через Load.js (как Near.js/Dress.js).
try { (function () {

if (typeof window.__lyashovCleanup === 'function') { try { window.__lyashovCleanup(); } catch (e) {} }

var _dead = false;
var _undo = [];
function onUndo(fn) { _undo.push(fn); }
window.__lyashovCleanup = function () {
    _dead = true;
    while (_undo.length) { try { _undo.pop()(); } catch (e) {} }
    window.__lyashovCleanup = null;
};

function log() { try { console.log.apply(console, ['[LYASHOV]'].concat([].slice.call(arguments))); } catch (e) {} }
function warn() { try { console.warn.apply(console, ['[LYASHOV]'].concat([].slice.call(arguments))); } catch (e) {} }

// ══════════════════════════ НАСТРОЙКИ ══════════════════════════
var CFG = {
    baseUrl:    'https://blockrun.ai/',
    endpoint:   'api/v1/chat/completions',
    model:      'nvidia/nemotron-3.5-lightning',
    apiKey:     '',                       // если шлюз требует ключ (уйдёт как Bearer)
    cooldownMs: 1500,                     // не чаще одного запроса раз в N мс
    retries:    1,                        // тихих повторов: утечка рассуждений, пустой ответ, сеть, 5xx/429
    noThink:    true,                     // в режиме fast просить шлюз отключить рассуждения
    npcName:    'NPC',                    // подпись в режиме local
    // ── вывод в чат игры ──
    sayLimit:   83,                       // сервер отбрасывает обычные сообщения длиннее (см. SAY_LIMIT в Code3.js)
    maxParts:   2,                        // максимум сообщений за один ответ
    sayGapMs:   1000,                     // пауза между частями
    typeMsPerChar: 30, typeMaxMs: 2000,   // «время набора» перед отправкой, чтобы не отвечать мгновенно
    // ── режим local (как в pwn) ──
    lineLen: 100, maxLines: 3,
    // ── ответы на реплики других игроков (/lyashlisten) ──
    listenCooldownMs: 5000,               // не чаще одного ответа раз в N мс
    listenPerMin: 6,                      // и не больше N ответов в минуту (защита от болтовни ботов друг с другом)
    // ── авто-режим /lyashauto (pwn OnPlayerText) ──
    actorPos: { x: -2355.6838, y: 2624.3679, z: 35.8898 },
    distance: 5.0,
    maxQuestion: 128,
    color: 'FFFFFF'
};
// Параметры режимов модели
var MODES = {
    fast:  { label: 'быстрый',  thinking: false, maxTokens: 220,  timeoutMs: 20000 },
    think: { label: 'думающий', thinking: true,  maxTokens: 1500, timeoutMs: 60000 }
};
try {
    var user = window.LYASHOV_CONFIG;
    if (user && typeof user === 'object') {
        for (var k in user) { if (Object.prototype.hasOwnProperty.call(user, k) && k !== 'modes') CFG[k] = user[k]; }
        if (user.modes && typeof user.modes === 'object') {
            for (var mk in user.modes) { if (MODES[mk] && user.modes[mk]) for (var pk in user.modes[mk]) MODES[mk][pk] = user.modes[mk][pk]; }
        }
    }
} catch (e) {}

var SYSTEM_PROMPT =
    'Ты обычный человек, житель города в онлайн-игре, и просто разговариваешь с игроком в чате. ' +
    'Отвечай естественно и по делу на то, что тебе написали: на вопрос - ответом, на приветствие - приветствием, на шутку - шуткой. ' +
    'Пиши как живой человек: коротко, одно предложение, без форматирования и списков. ' +
    'Не рассуждай вслух и не объясняй свой ответ. Пиши на русском. Текст до 80 символов.';

var MSG_BUSY  = '- Не могу сейчас ответить. (' + CFG.npcName + ')';   // только в режиме local; в say ничего от вашего имени не пишем
var MSG_EMPTY = '- Без понятия. (' + CFG.npcName + ')';

// ══════════════════════════ СОСТОЯНИЕ (режим / вывод запоминаются) ══════════════════════════
function lsGet(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { window.localStorage.setItem(k, v); } catch (e) {} }

var mode = 'fast';
var _sm = lsGet('lyashov_mode'); if (_sm === 'fast' || _sm === 'think') mode = _sm;
if (CFG.mode === 'fast' || CFG.mode === 'think') mode = CFG.mode;
var out = 'say';
var _so = lsGet('lyashov_out'); if (_so === 'say' || _so === 'local') out = _so;
if (CFG.out === 'say' || CFG.out === 'local') out = CFG.out;

function setMode(m) { if (m !== 'fast' && m !== 'think') return false; mode = m; lsSet('lyashov_mode', m); return true; }
function setOut(o)  { if (o !== 'say' && o !== 'local') return false; out = o; lsSet('lyashov_out', o); return true; }
function modeFor(m) { return MODES[m] || MODES.fast; }

// ══════════════════════════ ЧАТ ══════════════════════════
function iface(name) { try { return (window.interface && window.interface(name)) || null; } catch (e) { return null; } }

// Локальное сообщение (видит только игрок), в обход хуков бота
function chatAdd(text, color) {
    color = color || CFG.color;
    try {
        var hud = iface('Hud'), chat = hud && hud.$refs && hud.$refs.chat;
        if (chat && typeof chat.add === 'function') { chat.add(text, color); return true; }
    } catch (e) {}
    try { if (typeof addLocalChatMessage === 'function') return !!addLocalChatMessage(text, color); } catch (e) {}
    try { if (typeof window.OnChatAddMessage === 'function') { window.OnChatAddMessage(text, color); return true; } } catch (e) {}
    return false;
}
function sys(text) { chatAdd('{00BFFF}[Lyashov] {FFFFFF}' + text, 'FFFFFF'); }

function myNick() {
    try { if (typeof config !== 'undefined' && config.accountInfo && config.accountInfo.nickname) return String(config.accountInfo.nickname); } catch (e) {}
    return '';
}

// ══════════════════════════ ОТВЕТ → ТЕКСТ ══════════════════════════
// Ответ должен быть простым текстом: без «рассуждений», markdown, цветовых кодов, тегов, эмодзи. Ведущий «/» убираем —
// иначе модель смогла бы отправить серверу команду от вашего имени.
function cleanAnswer(s) {
    s = String(s === undefined || s === null ? '' : s);
    s = s.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/<think>[\s\S]*$/i, '');
    s = s.replace(/\{[0-9a-fA-F]{6,8}\}/g, '').replace(/[*_`#>~]+/g, '').replace(/[{}<>]/g, '');
    s = s.replace(/[\uD800-\uDFFF\u2600-\u27BF\uFE0F]/g, '');            // эмодзи и прочие символы вне шрифта чата
    s = s.replace(/\s+/g, ' ').trim();
    s = s.replace(/^(ответ|reply)\s*:\s*/i, '');
    s = s.replace(/^[\s\/\\\-"'«»„“”]+/, '').replace(/["'«»„“”\s]+$/, '');   // кавычки вокруг, тире, слэши в начале
    return s.trim();
}

// Режет по max символов: сначала по концу предложения, потом по запятой/пробелу (как splitSay в Code3.js)
function splitSay(text, max) {
    text = String(text || '').trim();
    if (!text) return [];
    if (text.length <= max) return [text];
    var parts = [], s = text;
    while (s.length > max) {
        var win = s.slice(0, max + 1), cut = -1, i, m;
        var enders = ['. ', '! ', '? '];
        for (m = 0; m < enders.length; m++) { i = win.lastIndexOf(enders[m]); if (i >= max * 0.4) cut = Math.max(cut, i + 1); }
        if (cut === -1) { var commas = [', ', '; ']; for (m = 0; m < commas.length; m++) { i = win.lastIndexOf(commas[m]); if (i >= max * 0.4) cut = Math.max(cut, i + 1); } }
        if (cut === -1) { i = win.lastIndexOf(' '); if (i > 0) cut = i; }
        if (cut <= 0) cut = max;
        parts.push(s.slice(0, cut).trim());
        s = s.slice(cut).trim();
    }
    if (s) parts.push(s);
    return parts.filter(Boolean);
}

// Режим local: куски по ~lineLen символов, не больше maxLines, подпись NPC на последней строке (как OnAIResponse в pwn)
function splitLines(answer) {
    var len = answer.length, start = 0, n = 0, res = [], chunk, cut, line, msg;
    while (start < len && n < CFG.maxLines) {
        chunk = CFG.lineLen;
        if (start + chunk >= len) chunk = len - start;
        if (start + chunk < len) {
            cut = start + chunk;
            while (cut > start && answer.charAt(cut) !== ' ') cut--;
            if (cut > start) chunk = cut - start;
        }
        line = answer.substr(start, chunk);
        msg = (n === 0 ? '- ' : '  ') + line;
        if (start + chunk >= len) msg += ' (' + CFG.npcName + ')';
        res.push(msg);
        start += chunk;
        if (answer.charAt(start) === ' ') start++;
        n++;
    }
    if (res.length && res[res.length - 1].indexOf('(' + CFG.npcName + ')') < 0) res[res.length - 1] += ' (' + CFG.npcName + ')';
    return res;
}
function sayLocal(lines) { for (var i = 0; i < lines.length; i++) chatAdd(lines[i], CFG.color); }

// ══════════════════════════ ОТПРАВКА В ЧАТ ИГРЫ (от вашего лица) ══════════════════════════
// Зеркало серверного антифлуда (как в Code3.js): каждое сообщение/команда rate += 1000, затем rate -= прошедшее время;
// rate >= 3000 — «Не флудите», сообщение НЕ уходит. Считаем всё, что проходит через нашу обёртку sendChatInput.
var FLOOD_MAX = 3000, FLOOD_INC = 1000, FLOOD_MARGIN = 200;
var flood = { rate: 0, last: Date.now() };
function floodDecay() { var n = Date.now(); flood.rate = Math.max(0, flood.rate - (n - flood.last)); flood.last = n; }
function floodNote(n) { floodDecay(); flood.rate += (n || 1) * FLOOD_INC; }
function floodWait(n) { floodDecay(); var over = flood.rate + n * FLOOD_INC - (FLOOD_MAX - FLOOD_MARGIN); return over > 0 ? Math.ceil(over) : 0; }

var _own = false;          // true, пока мы сами вызываем sendChatInput — наша же обёртка такие вызовы не разбирает как команды
var sayQ = [], sayBusy = false, sayTimer = null;
var recentSent = [];       // что мы недавно отправили (для игнора собственного эха в /lyashlisten)
var origChatWin = window.sendChatInputCustom;
var origChatVar = null;
try { if (typeof sendChatInput === 'function') origChatVar = sendChatInput; } catch (e) {}
var prevChat = origChatWin || origChatVar;

function rawSend(text) {
    _own = true;
    try {
        if (typeof sendChatInput === 'function') sendChatInput(text);
        else if (typeof window.sendChatInput === 'function') window.sendChatInput(text);
        else if (typeof prevChat === 'function') prevChat.call(window, text);
    } catch (e) { warn('отправка в чат не удалась:', e && e.message); }
    _own = false;
}
function sayDrain() {
    sayTimer = null;
    if (_dead) { sayQ = []; sayBusy = false; return; }
    if (!sayQ.length) { sayBusy = false; return; }
    sayBusy = true;
    var w = floodWait(1);
    if (w > 0) { sayTimer = setTimeout(sayDrain, w + 5); return; }
    var part = sayQ.shift();
    recentSent.push({ t: Date.now(), text: part });
    if (recentSent.length > 20) recentSent.shift();
    rawSend(part);
    sayTimer = setTimeout(sayDrain, CFG.sayGapMs);
}
function sayEnqueue(parts) {
    for (var i = 0; i < parts.length; i++) { if (sayQ.length < 6) sayQ.push(parts[i]); }
    if (!sayBusy) sayDrain();
}
onUndo(function () { if (sayTimer) { clearTimeout(sayTimer); sayTimer = null; } sayQ = []; sayBusy = false; });

// ══════════════════════════ ЗАПРОС К МОДЕЛИ ══════════════════════════
var busy = false, lastAt = 0, lastInfo = 'запросов ещё не было', pending = null, busyTimer = null;

// «Размышления», попавшие в ответ («Here's a thinking process: 1. Analyze User Input…») — не ответ
function looksLikeLeak(t) {
    var lat = (t.match(/[A-Za-z]/g) || []).length, cyr = (t.match(/[А-Яа-яЁё]/g) || []).length;
    if (lat > cyr && t.length > 25) return true;
    return /thinking process|analy[sz]e (the )?user|user input|persona of|i need to respond|draft(ing)? (the )?(response|answer)/i.test(t);
}

function extractContent(j) {
    try {
        var m = j.choices && j.choices[0] && j.choices[0].message;
        var c = m && m.content;
        if (Array.isArray(c)) c = c.map(function (p) { return (p && (p.text || p.content)) || ''; }).join('');
        return typeof c === 'string' ? c : '';
    } catch (e) { return ''; }
}

function buildBody(userText, extras, strict, m) {
    var mp = modeFor(m);
    var b = {
        model: CFG.model,
        messages: [
            { role: 'system', content: (extras && !mp.thinking ? '/no_think\n' : '') + SYSTEM_PROMPT },
            { role: 'user',   content: userText + (strict ? '\n(Ответь сразу одной короткой репликой по-русски, без рассуждений и без английского.)' : '') }
        ],
        max_tokens: mp.maxTokens
    };
    if (extras) {
        b.chat_template_kwargs = { enable_thinking: !!mp.thinking };   // vLLM / NVIDIA NIM
        b.reasoning = { enabled: !!mp.thinking };                      // OpenRouter-подобные шлюзы
    }
    return b;
}

// Один HTTP-запрос → {ok,text} или {ok:false,error,status,retryable,empty,leak}
function once(userText, m, extras, strict, cb) {
    var url = String(CFG.baseUrl).replace(/\/+$/, '') + '/' + String(CFG.endpoint).replace(/^\/+/, '');
    var mp = modeFor(m), done = false, t0 = Date.now(), tag = '[' + m + '] ';
    function finish(r) { if (done) return; done = true; cb(r); }
    try {
        var x = new XMLHttpRequest();
        x.open('POST', url, true);
        x.timeout = mp.timeoutMs;
        x.setRequestHeader('Content-Type', 'application/json');
        if (CFG.apiKey) x.setRequestHeader('Authorization', 'Bearer ' + CFG.apiKey);
        x.onload = function () {
            lastInfo = tag + 'HTTP ' + x.status + ', ' + (x.responseText || '').length + ' байт, ' + (Date.now() - t0) + ' мс' + (extras ? '' : ', без доп. полей');
            if (x.status !== 200) {
                warn('HTTP', x.status, String(x.responseText || '').slice(0, 300));
                return finish({ ok: false, error: 'HTTP ' + x.status, status: x.status, retryable: x.status === 429 || x.status >= 500 });
            }
            var j = null;
            try { j = JSON.parse(x.responseText); } catch (e) { warn('ответ не JSON:', String(x.responseText || '').slice(0, 300)); }
            var text = cleanAnswer(j ? extractContent(j) : '');
            if (!text) return finish({ ok: false, error: 'пустой ответ', empty: true, retryable: true });
            if (looksLikeLeak(text)) { warn('в ответе «размышления» модели, отбрасываем:', text.slice(0, 120)); lastInfo += ', утечка размышлений'; return finish({ ok: false, error: 'размышления вместо ответа', leak: true, retryable: true }); }
            finish({ ok: true, text: text });
        };
        x.onerror = function () { lastInfo = tag + 'сеть недоступна / CORS'; warn('XHR ошибка (сеть или CORS) для', url); finish({ ok: false, error: 'сеть', retryable: true }); };
        x.ontimeout = function () { lastInfo = tag + 'таймаут ' + mp.timeoutMs + ' мс'; finish({ ok: false, error: 'таймаут', retryable: true }); };
        x.send(JSON.stringify(buildBody(userText, extras, strict, m)));
    } catch (e) { finish({ ok: false, error: String(e && e.message || e) }); }
}

// Запрос с авто-повторами: 400/422 → без доп. полей; утечка/пусто/сеть/5xx → до CFG.retries раз со строгой подсказкой
function request(userText, m, cb) {
    var extras = !!CFG.noThink || modeFor(m).thinking, tries = 0;
    (function go() {
        once(userText, m, extras, tries > 0, function (r) {
            if (_dead) return;
            if (r.ok) return cb(r);
            if ((r.status === 400 || r.status === 422) && extras) { extras = false; return go(); }
            if (r.retryable && tries < CFG.retries) { tries++; log('повтор', tries, '←', r.error); return go(); }
            cb(r);
        });
    })();
}

function release() { busy = false; if (busyTimer) { clearTimeout(busyTimer); busyTimer = null; } }

// Вывод готового ответа: в чат игры от вашего лица (say) или только вам (local)
function deliver(r) {
    if (out === 'local') { r.lines = splitLines(r.text); sayLocal(r.lines); r.parts = r.lines; return; }
    var parts = splitSay(r.text, CFG.sayLimit).slice(0, CFG.maxParts);
    r.parts = parts;
    var delay = Math.min(CFG.typeMaxMs, r.text.length * CFG.typeMsPerChar);
    setTimeout(function () { if (!_dead) sayEnqueue(parts); }, delay);
}

// Публичный вход: ask(текст, ник, cb, {mode, noQueue}). Пока Ляшов отвечает, последний новый вопрос ждёт в очереди
// (opts.noQueue — для /lyashlisten: старые реплики не копим, лишнее отбрасываем).
function ask(question, nick, cb, opts) {
    opts = opts || {};
    question = String(question === undefined || question === null ? '' : question).trim().slice(0, CFG.maxQuestion);
    if (!question) { if (cb) cb({ ok: false, error: 'пустой вопрос' }); return false; }
    var m = opts.mode === 'think' || opts.mode === 'fast' ? opts.mode : mode;
    var now = Date.now();
    if (busy || now - lastAt < CFG.cooldownMs) {
        if (opts.noQueue) return false;
        pending = { q: question, nick: nick, cb: cb, opts: opts };
        if (!busy) setTimeout(flush, Math.max(50, CFG.cooldownMs - (now - lastAt)));
        return 'queued';
    }
    busy = true; lastAt = now;
    busyTimer = setTimeout(function () { busy = false; }, modeFor(m).timeoutMs * (CFG.retries + 1) + 3000);   // флаг «занят» не залипает навсегда
    var userText = nick ? ('Игрок ' + nick + ' пишет тебе в чате: ' + question) : question;
    log('→', CFG.model, '[' + m + ']', '|', userText);
    if (m === 'think' && !opts.silent) sys('Думаю…');
    request(userText, m, function (r) {
        release();
        if (_dead) return;
        if (r.ok) { deliver(r); log('←', r.text); }
        else {
            // От вашего имени при сбое ничего не пишем — только сообщение вам
            if (out === 'local') chatAdd(r.empty ? MSG_EMPTY : MSG_BUSY, CFG.color);
            else sys('Нейросеть не ответила (' + r.error + '). Подробности: /lyashdiag');
            log('✗', r.error);
        }
        if (cb) { try { cb(r); } catch (e) {} }
        flush();
    });
    return true;
}
function flush() {
    if (_dead || !pending || busy) return;
    var p = pending; pending = null;
    ask(p.q, p.nick, p.cb, p.opts);
}

// ══════════════════════════ ОТВЕТЫ НА РЕПЛИКИ ИГРОКОВ (/lyashlisten) ══════════════════════════
// Обычная речь в чате приходит как «Ник[id]: текст» (так её узнают и Code2.js, и Code.js). Цвета: 0xEEEEEE — своя речь,
// 0x6B6B6B — далеко, 0x33CC66 — рация; их пропускаем. Свои реплики и эхо наших сообщений игнорируем.
var listenOn = false, lastListenAt = 0, listenTimes = [], lastSeen = { text: '', t: 0 };
var lastHeard = 'пока ничего не слышал', hookWrap = null, hookTimer = null;

function colorKey(c) { return String(c === undefined || c === null ? '' : c).replace(/^0x/i, '').replace(/^#/, '').slice(-6).toUpperCase(); }
function isEcho(text) {
    var now = Date.now();
    for (var i = 0; i < recentSent.length; i++) {
        if (now - recentSent[i].t < 30000 && recentSent[i].text === text) return true;
    }
    return false;
}
function onIncoming(msg, color) {
    if (_dead || !listenOn) return;
    var clean = String(msg).replace(/\{[0-9a-fA-F]{6,8}\}/g, '').trim(), now = Date.now();
    if (lastSeen.text === clean && now - lastSeen.t < 400) return;      // та же строка дважды (обёртка могла встать в цепочку два раза)
    lastSeen = { text: clean, t: now };
    var m = clean.match(/^([^\s\[\]:]+)\s*\[(\d+)\]\s*:\s*([\s\S]+)$/);
    if (!m) return;
    var nick = m[1], text = m[3].trim(), ck = colorKey(color);
    if (ck === 'EEEEEE' || ck === '6B6B6B' || ck === '33CC66') return;
    if (!text || text.charAt(0) === '/') return;
    var me = myNick();
    if (me && nick === me) return;
    if (isEcho(text)) return;
    lastHeard = nick + ': ' + text;
    if (now - lastListenAt < CFG.listenCooldownMs) return;
    listenTimes = listenTimes.filter(function (t) { return now - t < 60000; });
    if (listenTimes.length >= CFG.listenPerMin) return;
    if (ask(text, nick, null, { noQueue: true, silent: true }) === true) { lastListenAt = now; listenTimes.push(now); }
}
// Code.js при запуске бота может заново назначить window.OnChatAddMessage, поэтому пока слушаем — раз в 3 с проверяем обёртку
function installChatHook() {
    var cur = window.OnChatAddMessage;
    if (typeof cur !== 'function' || cur === hookWrap) return typeof cur === 'function';
    var wrapped = function (e, c, t) {
        try { onIncoming(e, c); } catch (err) { warn('onIncoming:', err && err.message); }
        return cur.apply(this, arguments);
    };
    wrapped.__lyashOrig = cur;
    hookWrap = wrapped;
    window.OnChatAddMessage = wrapped;
    return true;
}
function setListen(v) {
    listenOn = !!v;
    if (hookTimer) { clearInterval(hookTimer); hookTimer = null; }
    if (listenOn) {
        var ok = installChatHook();
        hookTimer = setInterval(function () { if (!_dead && listenOn) installChatHook(); }, 3000);
        return ok;
    }
    return true;
}
onUndo(function () {
    listenOn = false;
    if (hookTimer) { clearInterval(hookTimer); hookTimer = null; }
    try { if (hookWrap && window.OnChatAddMessage === hookWrap) window.OnChatAddMessage = hookWrap.__lyashOrig; } catch (e) {}
});

// ══════════════════════════ АВТО-РЕЖИМ /lyashauto (OnPlayerText в pwn) ══════════════════════════
var autoOn = lsGet('lyashov_auto') === '1';
if (CFG.auto === true) autoOn = true;
function setAuto(v) { autoOn = !!v; lsSet('lyashov_auto', autoOn ? '1' : '0'); }

function nearActor(cb) {
    var NP = window.NearPlayers;
    if (!NP || typeof NP.refresh !== 'function') return cb(null, 'нужен Near.js и мод Near в APK');
    NP.refresh(function (j) {
        if (!j || !j.ok || !j.me) return cb(null, 'позиция недоступна' + (j && j.stage ? ' (' + j.stage + ')' : ''));
        var dx = j.me.x - CFG.actorPos.x, dy = j.me.y - CFG.actorPos.y, dz = j.me.z - CFG.actorPos.z;
        cb(Math.sqrt(dx * dx + dy * dy + dz * dz), null);
    });
}

// ══════════════════════════ КОМАНДЫ ЧАТА ══════════════════════════
function modeText(m) { return m + ' (' + modeFor(m).label + (modeFor(m).thinking ? ': медленнее, но вдумчивее' : ': быстро') + ')'; }
function outText(o) { return o === 'say' ? 'say — ответ уходит в чат игры от вашего лица' : 'local — ответ видите только вы'; }

var myChat = function (e) {
    if (!_dead && typeof e === 'string') {
        if (_own) { floodNote(1); return typeof prevChat === 'function' ? prevChat.apply(this, arguments) : undefined; }
        var text = e.trim();
        var m = text.match(/^\/(lyashov|lys|lyashthink)(?:\s+([\s\S]*))?$/i);
        if (m) {
            var q = (m[2] || '').trim(), think = m[1].toLowerCase() === 'lyashthink';
            if (!q) sys('Использование: /' + m[1].toLowerCase() + ' <текст>. Режим: /lyashmode fast|think. Вывод: /lyashout say|local');
            else if (ask(q, null, null, think ? { mode: 'think' } : null) === 'queued') sys('Ещё отвечаю на предыдущее — ваш текст в очереди.');
            return;   // команду серверу не отправляем
        }
        m = text.match(/^\/lyashmode(?:\s+(\S+))?\s*$/i);
        if (m) {
            var a = (m[1] || '').toLowerCase();
            if (a === 'think' || a === 'fast') setMode(a);
            else if (a) { sys('Использование: /lyashmode fast|think'); return; }
            sys('Режим: ' + modeText(mode));
            return;
        }
        m = text.match(/^\/lyashout(?:\s+(\S+))?\s*$/i);
        if (m) {
            var o = (m[1] || '').toLowerCase();
            if (o === 'say' || o === 'local') setOut(o);
            else if (o) { sys('Использование: /lyashout say|local'); return; }
            sys('Вывод: ' + outText(out));
            return;
        }
        m = text.match(/^\/lyashlisten(?:\s+(\S+))?\s*$/i);
        if (m) {
            var l = (m[1] || '').toLowerCase();
            if (l === 'on' || l === '1') {
                if (!setListen(true)) sys('Чат-хук пока не найден (бот ещё запускается?) — повторю проверку сам.');
                sys('Слушаю чат: отвечаю на реплики игроков рядом' + (out === 'say' ? ' от вашего лица. Выключить: /lyashlisten off' : ' (только вам)'));
            } else if (l === 'off' || l === '0') { setListen(false); sys('Слушаю чат: выкл'); }
            else if (l) { sys('Использование: /lyashlisten on|off'); return; }
            else sys('Слушаю чат: ' + (listenOn ? 'ВКЛ' : 'выкл') + ' | последняя реплика: ' + lastHeard);
            return;
        }
        m = text.match(/^\/lyashauto(?:\s+(\S+))?\s*$/i);
        if (m) {
            var arg = (m[1] || '').toLowerCase();
            if (arg === 'on' || arg === '1') setAuto(true);
            else if (arg === 'off' || arg === '0') setAuto(false);
            else if (arg) { sys('Использование: /lyashauto on|off'); return; }
            sys('Авто-режим: ' + (autoOn ? 'ВКЛ' : 'выкл') + ' (радиус ' + CFG.distance + ' м от актёра)' + (out === 'say' ? ' — работает только при /lyashout local' : ''));
            if (autoOn) nearActor(function (d, why) { sys(why ? 'Позиция: ' + why : 'До актёра сейчас ' + d.toFixed(1) + ' м'); });
            return;
        }
        if (/^\/lyashdiag\s*$/i.test(text)) {
            sys('Режим: ' + modeText(mode) + ' | модель: ' + CFG.model);
            sys('Вывод: ' + outText(out) + ' | слушаю чат: ' + (listenOn ? 'да' : 'нет'));
            sys('Адрес: ' + CFG.baseUrl + CFG.endpoint + (CFG.apiKey ? ' (с ключом)' : ' (без ключа)'));
            sys('Последний запрос: ' + lastInfo);
            return;
        }
        // Авто-режим: только для local, иначе мы бы отвечали на собственные слова от собственного имени
        if (autoOn && out === 'local' && text.charAt(0) !== '/' && text.length) {
            nearActor(function (d) {
                if (_dead || d === null || d > CFG.distance) return;
                ask(text);
            });
        }
        floodNote(1);   // сообщение/команда идёт на сервер — учитываем в модели антифлуда
    }
    if (typeof prevChat === 'function') return prevChat.apply(this, arguments);
};
window.sendChatInputCustom = myChat;
try { sendChatInput = myChat; } catch (e) {}
onUndo(function () {
    if (window.sendChatInputCustom === myChat) window.sendChatInputCustom = origChatWin;
    try { if (sendChatInput === myChat) sendChatInput = origChatVar || origChatWin; } catch (e) {}
});

window.Lyashov = {
    version: 4, ask: ask, config: CFG, systemPrompt: SYSTEM_PROMPT, buildBody: buildBody,
    setMode: setMode, getMode: function () { return mode; }, setOut: setOut, getOut: function () { return out; },
    setListen: setListen, splitSay: splitSay, splitLines: splitLines, cleanAnswer: cleanAnswer
};
onUndo(function () { if (window.Lyashov && window.Lyashov.ask === ask) { try { delete window.Lyashov; } catch (e) { window.Lyashov = undefined; } } });

log('Lyashov.js v4 загружен: /lyashov <текст>, /lyashmode fast|think, /lyashout say|local, /lyashlisten on|off, /lyashdiag; режим', mode, '| вывод', out, '| модель', CFG.model);

})(); } catch (e) { try { console.error('[LYASHOV] ошибка загрузки Lyashov.js:', e); } catch (e2) {} }
