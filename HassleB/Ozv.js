// Ozv.js — озвучка администратора для HassleB.
// Когда пишет администратор — играет HassleB/Озвучка/Администратор.mp3 из репозитория (через родной window.playSound игры).
// Два входа, звук один раз: перехват sendAdminSpamAlert из Code.js + разбор строк чата через Hud.$refs.chat.add.
// Грузится Load.js вместе с Code2/Code3 (eval в области видимости Code.js).
try { (function () {

if (typeof window.__ozvCleanup === 'function') { try { window.__ozvCleanup(); } catch (e) {} }

var FILE = 'HassleB/Озвучка/Администратор.mp3';
var REPO = 'BensonZahar/Hud.js', BRANCH = 'main';
var SLOT = 1;            // канал звука движка (как в старой версии Code.js)
var COOLDOWN_MS = 4000;  // не чаще одного раза за это время

var GEN = (window.__ozvGen = (window.__ozvGen || 0) + 1);
var _dead = false, _undo = [], _lastAt = 0;
function onUndo(fn) { _undo.push(fn); }
window.__ozvCleanup = function () {
    _dead = true;
    while (_undo.length) { try { _undo.pop()(); } catch (e) {} }
    window.__ozvCleanup = null;
};

var URL_ADMIN = 'https://raw.githubusercontent.com/' + REPO + '/' + BRANCH + '/' +
    FILE.split('/').map(function (s) { return encodeURIComponent(s.normalize ? s.normalize('NFC') : s); }).join('/');

function play() {
    try { window.playSound(URL_ADMIN, false, SLOT); } catch (e) { console.warn('[OZV] playSound:', e && e.message); }
}

function trigger() {
    if (_dead) return;
    var now = Date.now();
    if (now - _lastAt < COOLDOWN_MS) return;   // дубль от второго входа или несколько строк подряд
    _lastAt = now;
    play();
}

// ── Признаки «пишет администратор» (как в Code.js) ──
function normColor(c) {
    if (c === undefined || c === null) return '';
    if (typeof c === 'number') return c.toString(16).toUpperCase().padStart(6, '0').slice(-6);
    var s = String(c).toUpperCase();
    if (s.charAt(0) === '#') s = s.slice(1);
    if (s.indexOf('0X') === 0) s = s.slice(2);
    if (s.length === 8) s = s.slice(0, 6);
    return s;
}
function myNick() {
    try { if (typeof config !== 'undefined' && config.accountInfo && config.accountInfo.nickname) return String(config.accountInfo.nickname); } catch (e) {}
    return '';
}
function isAdminLine(raw, color) {
    var msg = String(raw);
    var clean = msg.replace(/\{[0-9A-Fa-f]{6}\}/g, '');
    var col = normColor(color);
    if (/Администратор\s+\S+\[\d+\]\s+подбросил\s+Вас/i.test(clean)) return false;
    // личное: Администратор / Агент поддержки X[ID] для МойНик[ID]: (цвет FF9945)
    if (col === 'FF9945') {
        var nick = myNick();
        var re = nick
            ? new RegExp('(?:администратор|агент\\s+поддержки)\\s+\\S+\\[\\d+\\]\\s+для\\s+' + nick.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\[', 'i')
            : /(?:администратор|агент\s+поддержки)\s+\S+\[\d+\]\s+для\s+\S+\[/i;
        if (re.test(clean)) return true;
    }
    // [Уведомление от администратора] Администратор X[ID]: …
    if (/\[Уведомление от администратора\]\s*Администратор\s+.+\[\d+\]:/i.test(clean)) return true;
    // админ-чат [A] … (( … )) вне рации (рация 33CC66 — тихое уведомление, без звука); департамент [D] {FF8877} игнорируем
    if (msg.indexOf('[A]') !== -1 && msg.indexOf('((') !== -1) {
        if (msg.indexOf('[D]') !== -1 && msg.indexOf('{FF8877}') !== -1) return false;
        return col !== '33CC66';
    }
    return false;
}

// Копируем служебные флаги исходной функции на обёртку — чтобы циклы «поставь хук, если нет флага» в Code.js/Code2/Code3 не наматывали обёртки
function inherit(w, orig) {
    try { Object.keys(orig).forEach(function (k) { if (!(k in w)) w[k] = orig[k]; }); } catch (e) {}
    return w;
}

// Вход 1: sendAdminSpamAlert из Code.js (его вызывают, когда Code.js признал сообщение «Обнаружен администратор!»)
function hookBotAlert() {
    try {
        if (typeof sendAdminSpamAlert !== 'function' || sendAdminSpamAlert.__ozv) return;
        var orig = sendAdminSpamAlert;
        var w = function () { trigger(); return orig.apply(this, arguments); };
        inherit(w, orig);
        w.__ozv = true;
        sendAdminSpamAlert = w;
        onUndo(function () { try { if (sendAdminSpamAlert === w) sendAdminSpamAlert = orig; } catch (e) {} });
    } catch (e) {}
}

// Вход 2: Hud.$refs.chat.add — видит каждую строку чата (как главный перехват Code3)
function hookChat() {
    try {
        var hud = window.interface && window.interface('Hud');
        var chat = hud && hud.$refs && hud.$refs.chat;
        if (!chat || typeof chat.add !== 'function' || chat.__ozvGen === GEN) return;
        var orig = chat.add;
        var w = function (message, color) {
            if (!_dead && typeof message === 'string') { try { if (isAdminLine(message, color)) trigger(); } catch (e) {} }
            return orig.apply(this, arguments);
        };
        inherit(w, orig);
        w.__ozv = true;
        chat.add = w;
        chat.__ozvGen = GEN;
        onUndo(function () { try { if (chat.add === w) chat.add = orig; chat.__ozvGen = 0; } catch (e) {} });
    } catch (e) {}
}

function ensureHooks() { hookBotAlert(); hookChat(); }
ensureHooks();
var timer = setInterval(ensureHooks, 1500);   // Hud-чат может появиться позже или пересоздаться
onUndo(function () { clearInterval(timer); });

})(); } catch (e) { try { console.error('[OZV] ошибка запуска:', e); } catch (e2) {} }
