// Lyashov.js — «Евгений Ляшов»: ответы нейросети в чат, как в lyashov_ai.pwn (фильтрскрипт с актёром).
//
// Что делает (то же, что pwn, только на стороне клиента):
//   1. Берёт вопрос игрока, формирует «<ник> спрашивает: <вопрос>» и шлёт в модель вместе с системным промптом Ляшова.
//   2. Ответ режет на строки по ~100 символов (максимум 3, по пробелам) и выводит в ЛОКАЛЬНЫЙ чат (видит только игрок):
//        - первая строка...
//          продолжение... (Evgeniy_Lyashov)
//   3. Ошибка сети / пустой ответ — короткие заглушки, как в pwn.
//
// Команды в чате:
//   /lyashov <вопрос>   — спросить Ляшова (синоним /lys)
//   /lyashauto [on|off] — авто-режим как в pwn: обычная фраза в чат, пока вы в радиусе LYASHOV_DISTANCE от актёра,
//                         уходит Ляшову сама (по умолчанию выключен; нужен Near.js/мод Near — он даёт вашу позицию)
//   /lyashdiag          — показать текущие настройки и последний ответ сервера
//
// Настройки (необязательно) — до загрузки скрипта положить в window.LYASHOV_CONFIG, например:
//   window.LYASHOV_CONFIG = { apiKey: 'sk-...', baseUrl: 'https://blockrun.ai/', model: 'nvidia/nemotron-3.5-lightning' };
//   baseUrl/endpoint по умолчанию такие же, как в pwn (AI_BASE_URL / AI_ENDPOINT). Если шлюзу нужен ключ — apiKey (уйдёт как Bearer).
//
// API для других скриптов: window.Lyashov.ask(вопрос, ник, cb) — cb({ok, text, lines, error}); .config; .systemPrompt
//
// Файл подклеивается в Code2 через Load.js (как Near.js/Dress.js): видит config/addLocalChatMessage из области Code.js,
// но от них не зависит — всё нужное есть и здесь.
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

// ══════════════════════════ НАСТРОЙКИ (из pwn) ══════════════════════════
var CFG = {
    baseUrl:    'https://blockrun.ai/',              // AI_BASE_URL
    endpoint:   'api/v1/chat/completions',           // AI_ENDPOINT
    model:      'nvidia/nemotron-3.5-lightning',     // AI_MODEL
    apiKey:     '',                                  // если шлюз требует ключ
    maxTokens:  400,                                 // запас на «размышления» модели; ответ всё равно режется до 3 строк
    timeoutMs:  30000,
    cooldownMs: 3000,                                // не чаще одного запроса раз в N мс
    npcName:    'Evgeniy_Lyashov',
    actorPos:   { x: -2355.6838, y: 2624.3679, z: 35.8898 },   // LYASHOV_ACTOR_POS
    distance:   5.0,                                 // LYASHOV_DISTANCE
    lineLen:    100,                                 // длина куска в pwn (chunk = 100)
    maxLines:   3,                                   // lineNum < 3
    maxQuestion: 128,                                // request[128]
    color:      'FFFFFF'                             // 0xFFFFFFFF
};
try {
    var user = window.LYASHOV_CONFIG;
    if (user && typeof user === 'object') { for (var k in user) { if (Object.prototype.hasOwnProperty.call(user, k)) CFG[k] = user[k]; } }
} catch (e) {}

// Системный промпт — как AI_SYSTEM_PROMPT в pwn (одна строка про реальных людей оттуда не перенесена намеренно)
var SYSTEM_PROMPT =
    'Ты Евгений Ляшов - стример проекта RADMIR ONLINE. ' +
    'Ты очень вспыльчивый, постоянно орёшь капсом когда злишься. ' +
    'Обожаешь открывать кейсы на стримах, но почти всегда проигрываешь и бесишься. ' +
    'Над тобой шутят что ты Буратино из-за длинного носа - ты привык и сам иногда шутишь над этим. ' +
    'Ненавидишь читеров и тупых админов, при любом удобном случае их оскорбляешь. ' +
    'Злишься на Максима Друшляка - руководителя проекта, считаешь его некомпетентным. ' +
    'Пишешь коротко - максимум 2-3 предложения. Без форматирования. ' +
    'Иногда используй капс для злости. Пиши на русском. Текст до 128 символов';

var MSG_BUSY  = '- Я занят, иди нахуй. (' + CFG.npcName + ')';   // status != 200 в pwn
var MSG_EMPTY = '- Без понятия. (' + CFG.npcName + ')';           // нет "content" в ответе в pwn

// ══════════════════════════ ЧАТ ══════════════════════════
function iface(name) { try { return (window.interface && window.interface(name)) || null; } catch (e) { return null; } }

// Локальное сообщение (видит только игрок). Сначала напрямую в чат-компонент Hud — так сообщение не проходит
// через хуки бота (Telegram и т.п.); если компонента нет — те же запасные пути, что у addLocalChatMessage в Code.js.
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
    return 'Игрок';
}

// ══════════════════════════ ОТВЕТ → СТРОКИ ЧАТА (как OnAIResponse в pwn) ══════════════════════════
// Очистка: ответ должен быть простым текстом. Убираем «размышления» (<think>), markdown и всё, что чат принял бы за разметку ({цвет}, <тег>).
function cleanAnswer(s) {
    s = String(s === undefined || s === null ? '' : s);
    s = s.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/<think>[\s\S]*$/i, '');
    s = s.replace(/\{[0-9a-fA-F]{6,8}\}/g, '').replace(/[*_`#>~]+/g, '').replace(/[{}<>]/g, '');
    s = s.replace(/\s+/g, ' ').trim();
    return s;
}

// Режем по CFG.lineLen символов, по пробелам, не больше CFG.maxLines строк; на последней строке — подпись NPC
function splitLines(answer) {
    var len = answer.length, start = 0, n = 0, out = [], chunk, cut, line, msg;
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
        out.push(msg);
        start += chunk;
        if (answer.charAt(start) === ' ') start++;
        n++;
    }
    // Обрезали по лимиту строк, а текст остался — подпись всё равно ставим на последнюю выведенную строку
    if (out.length && out[out.length - 1].indexOf('(' + CFG.npcName + ')') < 0) out[out.length - 1] += ' (' + CFG.npcName + ')';
    return out;
}

function say(lines) { for (var i = 0; i < lines.length; i++) chatAdd(lines[i], CFG.color); }

// content бывает строкой или массивом частей [{type:'text', text:'...'}]
function extractContent(j) {
    try {
        var m = j.choices && j.choices[0] && j.choices[0].message;
        var c = m && m.content;
        if (Array.isArray(c)) c = c.map(function (p) { return (p && (p.text || p.content)) || ''; }).join('');
        return typeof c === 'string' ? c : '';
    } catch (e) { return ''; }
}

// ══════════════════════════ ЗАПРОС К МОДЕЛИ (как SendRequest в pwn) ══════════════════════════
var busy = false, lastAt = 0, lastInfo = 'запросов ещё не было';

function buildBody(userText) {
    return {
        model: CFG.model,
        messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user',   content: userText }
        ],
        max_tokens: CFG.maxTokens
    };
}

function request(userText, cb) {
    var url = String(CFG.baseUrl).replace(/\/+$/, '') + '/' + String(CFG.endpoint).replace(/^\/+/, '');
    var done = false;
    function finish(r) { if (done) return; done = true; cb(r); }
    try {
        var x = new XMLHttpRequest();
        x.open('POST', url, true);
        x.timeout = CFG.timeoutMs;
        x.setRequestHeader('Content-Type', 'application/json');
        if (CFG.apiKey) x.setRequestHeader('Authorization', 'Bearer ' + CFG.apiKey);
        x.onload = function () {
            lastInfo = 'HTTP ' + x.status + ', ' + (x.responseText || '').length + ' байт';
            if (x.status !== 200) {
                warn('HTTP', x.status, String(x.responseText || '').slice(0, 300));
                return finish({ ok: false, error: 'HTTP ' + x.status });
            }
            var j = null;
            try { j = JSON.parse(x.responseText); } catch (e) { warn('ответ не JSON:', String(x.responseText || '').slice(0, 300)); }
            var text = cleanAnswer(j ? extractContent(j) : '');
            if (!text) return finish({ ok: false, error: 'пустой ответ', empty: true });
            finish({ ok: true, text: text, lines: splitLines(text) });
        };
        x.onerror = function () { lastInfo = 'сеть недоступна / CORS'; warn('XHR ошибка (сеть или CORS) для', url); finish({ ok: false, error: 'сеть' }); };
        x.ontimeout = function () { lastInfo = 'таймаут'; finish({ ok: false, error: 'таймаут' }); };
        x.send(JSON.stringify(buildBody(userText)));
    } catch (e) { finish({ ok: false, error: String(e && e.message || e) }); }
}

// Публичный вход: ask(вопрос, ник, cb). Выводит ответ в чат и вызывает cb (необязательно).
function ask(question, nick, cb) {
    question = String(question === undefined || question === null ? '' : question).trim().slice(0, CFG.maxQuestion);
    if (!question) { if (cb) cb({ ok: false, error: 'пустой вопрос' }); return false; }
    var now = Date.now();
    if (busy || now - lastAt < CFG.cooldownMs) { if (cb) cb({ ok: false, error: 'занято' }); return false; }
    busy = true; lastAt = now;
    var userText = (nick || myNick()) + ' спрашивает: ' + question;
    log('→', CFG.model, '|', userText);
    request(userText, function (r) {
        busy = false;
        if (_dead) return;
        if (r.ok) { say(r.lines); log('←', r.text); }
        else { chatAdd(r.empty ? MSG_EMPTY : MSG_BUSY, CFG.color); log('✗', r.error); }
        if (cb) { try { cb(r); } catch (e) {} }
    });
    return true;
}

// ══════════════════════════ АВТО-РЕЖИМ (OnPlayerText в pwn) ══════════════════════════
var autoOn = false;
try { autoOn = window.localStorage.getItem('lyashov_auto') === '1'; } catch (e) {}
if (CFG.auto === true) autoOn = true;
function setAuto(v) { autoOn = !!v; try { window.localStorage.setItem('lyashov_auto', autoOn ? '1' : '0'); } catch (e) {} }

// IsPlayerInRangeOfPoint — 3D. Позицию даёт Near.js (window.NearPlayers.refresh → me {x,y,z}).
function nearActor(cb) {
    var NP = window.NearPlayers;
    if (!NP || typeof NP.refresh !== 'function') return cb(null, 'нужен Near.js и мод Near в APK');
    NP.refresh(function (j) {
        if (!j || !j.ok || !j.me) return cb(null, 'позиция недоступна' + (j && j.stage ? ' (' + j.stage + ')' : ''));
        var dx = j.me.x - CFG.actorPos.x, dy = j.me.y - CFG.actorPos.y, dz = j.me.z - CFG.actorPos.z;
        cb(Math.sqrt(dx * dx + dy * dy + dz * dz), null);
    });
}

// ══════════════════════════ КОМАНДЫ ЧАТА (цепочка как у Near.js) ══════════════════════════
var origChatWin = window.sendChatInputCustom;
var origChatVar = null;
try { if (typeof sendChatInput === 'function') origChatVar = sendChatInput; } catch (e) {}
var prevChat = origChatWin || origChatVar;

var myChat = function (e) {
    if (!_dead && typeof e === 'string') {
        var text = e.trim();
        var m = text.match(/^\/(lyashov|lys)(?:\s+([\s\S]*))?$/i);
        if (m) {
            var q = (m[2] || '').trim();
            if (!q) sys('Использование: /lyashov <вопрос>. Авто-режим: /lyashauto on|off');
            else if (!ask(q)) sys('Ляшов ещё отвечает, подождите пару секунд.');
            return;   // команду серверу не отправляем
        }
        m = text.match(/^\/lyashauto(?:\s+(\S+))?\s*$/i);
        if (m) {
            var arg = (m[1] || '').toLowerCase();
            if (arg === 'on' || arg === '1') setAuto(true);
            else if (arg === 'off' || arg === '0') setAuto(false);
            else if (arg) { sys('Использование: /lyashauto on|off'); return; }
            sys('Авто-режим: ' + (autoOn ? 'ВКЛ' : 'выкл') + ' (радиус ' + CFG.distance + ' м от актёра)');
            if (autoOn) nearActor(function (d, why) { sys(why ? 'Позиция: ' + why : 'До актёра сейчас ' + d.toFixed(1) + ' м'); });
            return;
        }
        if (/^\/lyashdiag\s*$/i.test(text)) {
            sys('Модель: ' + CFG.model);
            sys('Адрес: ' + CFG.baseUrl + CFG.endpoint + (CFG.apiKey ? ' (с ключом)' : ' (без ключа)'));
            sys('Последний запрос: ' + lastInfo);
            return;
        }
        // Авто-режим: обычная фраза (не команда), игрок рядом с актёром — отдаём вопрос Ляшову, фразу при этом не глотаем
        if (autoOn && text.charAt(0) !== '/' && text.length) {
            nearActor(function (d) {
                if (_dead || d === null || d > CFG.distance) return;
                ask(text);
            });
        }
    }
    if (typeof prevChat === 'function') return prevChat.apply(this, arguments);
};
window.sendChatInputCustom = myChat;
try { sendChatInput = myChat; } catch (e) {}
onUndo(function () {
    if (window.sendChatInputCustom === myChat) window.sendChatInputCustom = origChatWin;
    try { if (sendChatInput === myChat) sendChatInput = origChatVar || origChatWin; } catch (e) {}
});

window.Lyashov = { version: 1, ask: ask, config: CFG, systemPrompt: SYSTEM_PROMPT, buildBody: buildBody, splitLines: splitLines, cleanAnswer: cleanAnswer };
onUndo(function () { if (window.Lyashov && window.Lyashov.ask === ask) { try { delete window.Lyashov; } catch (e) { window.Lyashov = undefined; } } });

log('Lyashov.js v1 загружен: /lyashov <вопрос>, /lyashauto on|off, /lyashdiag; модель', CFG.model);

})(); } catch (e) { try { console.error('[LYASHOV] ошибка загрузки Lyashov.js:', e); } catch (e2) {} }
