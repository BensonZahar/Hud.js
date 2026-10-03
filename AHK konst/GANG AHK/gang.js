// ═══════════════════════════════════════════════════════════════════════
// gang.js — АХК «Банда» (beta 1.0)
//
// Подгружается загрузчиком LoadGang.js (его вставляет установщик).
// Сейчас умеет только две вещи:
//   1) Авто-угон — сам решает головоломку интерфейса «Hacking»
//      (модуль AUTO HACK перенесён из fkonst.js без изменений в логике).
//   2) Меню АХК — открывается хоткеем MENU_KEY или командой /dahk,
//      в нём авто-угон включается и выключается.
//
// По умолчанию авто-угон ВЫКЛЮЧЕН — включается из меню.
// ═══════════════════════════════════════════════════════════════════════

// ПРОВЕРКА НИКА — по умолчанию выключена (доступ и так ограничен установщиком).
// Чтобы ограничить скрипт по нику: NICK_CHECK_ENABLED = true и впиши ники.
const NICK_CHECK_ENABLED = false;
const _ALLOWED_NICKS = [
    // "Name_Surname",
];

(function _nickCheck(callback) {
    if (!NICK_CHECK_ENABLED) { callback(); return; }

    function getNick() {
        try {
            var n = window.App && window.App.$store &&
                    window.App.$store.getters &&
                    window.App.$store.getters['player/nickName'];
            if (n && n !== "Name_Surname") return n;
            return null;
        } catch (e) { return null; }
    }

    var nick = getNick();
    if (nick) {
        if (_ALLOWED_NICKS.indexOf(nick) !== -1) callback();
        return;
    }

    // Стор ещё не готов — ждём до 30 секунд
    var attempts = 0;
    var timer = setInterval(function () {
        attempts++;
        var n = getNick();
        if (n) {
            clearInterval(timer);
            if (_ALLOWED_NICKS.indexOf(n) !== -1) callback();
        } else if (attempts >= 60) {
            clearInterval(timer);
        }
    }, 500);
})(function () {
// ── КОНЕЦ ПРОВЕРКИ НИКА — всё ниже выполняется только если ник прошёл проверку ──

// Хоткей открытия меню АХК — подставляется установщиком (через LoadGang.js).
// Примеры: "Alt+0", "F6", "Numpad1", "WheelUp", "Alt+MouseMiddle". Пусто = только /dahk.
var MENU_KEY = "Alt+0";

// ── Универсальный матчер хоткеев (по физической клавише e.code, не зависит от раскладки) ──
var _HK_ALIAS = {up:'arrowup',down:'arrowdown',left:'arrowleft',right:'arrowright',esc:'escape'};
var _HK_PUNCT = {'-':'minus','=':'equal','[':'bracketleft',']':'bracketright',';':'semicolon',"'":'quote',',':'comma','.':'period','/':'slash','\\':'backslash','`':'backquote'};
var _HK_BTN = {0:'mouseleft',1:'mousemiddle',2:'mouseright',3:'mouseback',4:'mouseforward'};
var _hkCache = {};
function _hkParse(combo) {
    if (!combo) return null;
    if (_hkCache[combo]) return _hkCache[combo];
    var s = String(combo).trim(), parts = s.toLowerCase().split('+').map(function (x) { return x.trim(); }), main = '';
    if (s.charAt(s.length - 1) === '+') { main = '+'; parts = parts.filter(Boolean); }
    var h = { alt: parts.indexOf('alt') !== -1, ctrl: parts.indexOf('ctrl') !== -1, shift: parts.indexOf('shift') !== -1, main: main };
    if (!h.main) { for (var i = 0; i < parts.length; i++) { if (parts[i] !== 'alt' && parts[i] !== 'ctrl' && parts[i] !== 'shift') { h.main = parts[i]; break; } } }
    return (_hkCache[combo] = h);
}
function _hkMainMatch(e, m) {
    var t = e.type;
    if (t === 'wheel') return m === (e.deltaY < 0 ? 'wheelup' : 'wheeldown');
    if (t === 'mousedown' || t === 'mouseup') return m === _HK_BTN[e.button];
    var code = String(e.code || '').toLowerCase(), key = String(e.key || '').toLowerCase();
    if (!code || code === 'unidentified') return key === m || key === (_HK_ALIAS[m] || m);
    if (/^[a-z]$/.test(m))  return code === 'key' + m;
    if (/^[0-9]$/.test(m))  return code === 'digit' + m;
    if (m === 'enter')      return code === 'enter' || code === 'numpadenter';
    if (_HK_ALIAS[m])       return code === _HK_ALIAS[m];
    if (_HK_PUNCT[m])       return code === _HK_PUNCT[m];
    return code === m || key === m;   // F1-F24, Numpad*, Space, Tab, Home, ...
}
function _hkMatch(e, combo) {
    var h = _hkParse(combo);
    if (!h || !h.main) return false;
    if (h.alt !== !!e.altKey || h.ctrl !== !!e.ctrlKey || h.shift !== !!e.shiftKey) return false;
    return _hkMainMatch(e, h.main);
}
// Печатаем в чате/поле ввода — «голые» клавиши не должны срабатывать как хоткей
function _hkTyping(e) {
    var t = e.target; if (!t || !t.tagName) return false;
    var editable = t.isContentEditable || t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT';
    return editable && !e.altKey && !e.ctrlKey;
}

// Ждём, пока игра создаст нужные функции, и только потом вешаем хуки
// (иначе обёртка над ещё не существующей функцией сломала бы её).
function _waitFor(cond, cb, maxTries) {
    var tries = 0;
    (function tick() {
        var ok = false;
        try { ok = cond(); } catch (e) {}
        if (ok) { cb(); return; }
        if (++tries < (maxTries || 120)) setTimeout(tick, 500);
        else console.warn('[GANG] Не дождались функций игры — модуль не запущен');
    })();
}

// Короткое экранное уведомление (тот же GameText, что у остальных АХК)
function _gangNote(text) {
    try {
        var gt = window.interface && window.interface('GameText');
        if (gt && typeof gt.add === 'function') gt.add(JSON.stringify([3, text, 2500, 0, 0, true, false, 2]));
    } catch (e) {}
}

// ════════════════════════════════════════════════════════════════════════
// АВТО-УГОН  (AUTO HACK из fkonst.js)
// При открытии интерфейса «Hacking» сам решает головоломку
// с человекоподобными задержками между свапами.
// ════════════════════════════════════════════════════════════════════════
var autoHack = {
    enabled: false,   // вкл/выкл из меню АХК
    solving: false,
    solveTimer: null
};

function _hackStopSolving() {
    autoHack.solving = false;
    if (autoHack.solveTimer) {
        clearTimeout(autoHack.solveTimer);
        autoHack.solveTimer = null;
    }
}

function _hackStartSolving() {
    if (!autoHack.enabled || autoHack.solving) return;

    try {
        if (typeof window.getInterfaceStatus === 'function' &&
            !window.getInterfaceStatus('Hacking')) {
            return;
        }
    } catch (e) { return; }

    var hacking = window.interface('Hacking');
    if (!hacking) {
        setTimeout(_hackStartSolving, 200);
        return;
    }

    autoHack.solving = true;
    console.log('[AUTO-HACK] Начинаю решение головоломки');
    _hackSolveStep(hacking);
}

// Один шаг решения (рекурсивный через setTimeout)
function _hackSolveStep(hacking) {
    if (!autoHack.solving || !autoHack.enabled) {
        _hackStopSolving();
        return;
    }

    // Защита: интерфейс закрыт или уничтожен
    try {
        if (typeof window.getInterfaceStatus === 'function' &&
            !window.getInterfaceStatus('Hacking')) {
            _hackStopSolving();
            return;
        }
    } catch (e) {
        _hackStopSolving();
        return;
    }

    if (!hacking || !hacking.computerMatrix || !hacking.correctMatrix) {
        _hackStopSolving();
        return;
    }

    var correct = hacking.correctSequence;
    var current = hacking.computerSequence;

    if (!correct || !current || correct.length === 0) {
        _hackStopSolving();
        return;
    }

    // Ищем первую несовпадающую позицию
    var mismatchIdx = -1;
    for (var i = 0; i < correct.length; i++) {
        if (current[i] !== correct[i]) {
            mismatchIdx = i;
            break;
        }
    }

    if (mismatchIdx === -1) {
        // Всё совпадает — головоломка решена
        autoHack.solving = false;
        console.log('[AUTO-HACK] ✅ Головоломка решена!');
        return;
    }

    // Находим, где сейчас находится нужное значение.
    // ВАЖНО: если в матрице есть дубли (одно значение на нескольких позициях),
    // нельзя брать экземпляр, который уже стоит на правильном месте —
    // это создаёт бесконечный цикл свапов.
    var targetValue = correct[mismatchIdx];
    var sourceIdx = -1;

    // Проход 1: ищем targetValue там, где он стоит НЕ на своём правильном месте
    for (var a = 0; a < current.length; a++) {
        if (current[a] === targetValue && correct[a] !== targetValue) {
            sourceIdx = a;
            break;
        }
    }

    // Проход 2 (запасной): берём любой экземпляр, кроме самой несовпавшей позиции
    if (sourceIdx === -1) {
        for (var b = 0; b < current.length; b++) {
            if (current[b] === targetValue && b !== mismatchIdx) {
                sourceIdx = b;
                break;
            }
        }
    }

    if (sourceIdx === -1) {
        console.log('[AUTO-HACK] Не удалось найти значение: ' + targetValue + ', прерываю');
        _hackStopSolving();
        return;
    }

    // Выполняем свап через метод компонента
    try {
        hacking.swapItems(mismatchIdx, sourceIdx);
    } catch (e) {
        console.log('[AUTO-HACK] Ошибка свапа: ' + e.message);
        _hackStopSolving();
        return;
    }

    // Человекоподобная задержка (350–750 мс)
    var delay = 350 + Math.floor(Math.random() * 400);
    autoHack.solveTimer = setTimeout(function () {
        _hackSolveStep(hacking);
    }, delay);
}

// Включить/выключить авто-угон (вызывается из меню)
function setAutoHack(on) {
    autoHack.enabled = !!on;
    if (!autoHack.enabled) {
        _hackStopSolving();
    } else {
        // Если окно «Hacking» уже открыто — сразу начинаем решать
        try {
            if (typeof window.getInterfaceStatus === 'function' && window.getInterfaceStatus('Hacking')) {
                setTimeout(_hackStartSolving, 300);
            }
        } catch (e) {}
    }
    _gangNote('~w~Авто-угон~n~' + (autoHack.enabled ? '~g~Вкл' : '~r~Выкл'));
    console.log('[AUTO-HACK] ' + (autoHack.enabled ? 'включён' : 'выключен'));
}

// Хук openInterface — ловим открытие «Hacking»
_waitFor(function () { return typeof window.openInterface === 'function'; }, function () {
    var _origOpen = window.openInterface;
    window.openInterface = function (name) {
        var result = _origOpen.apply(this, arguments);
        if (autoHack.enabled && name === 'Hacking' && !autoHack.solving) {
            setTimeout(_hackStartSolving, 600);
        }
        return result;
    };
    console.log('[AUTO-HACK] Модуль загружен');
});

// ════════════════════════════════════════════════════════════════════════
// МЕНЮ АХК «БАНДА»
// Диалог в том же формате, что главное меню остальных АХК (id 677, TABLIST):
// первая строка — шапка, дальше пункты. Выбор пункта переключает его и
// заново открывает меню, чтобы статус Вкл/Выкл сразу обновился.
// ════════════════════════════════════════════════════════════════════════
var GANG_MENU_ID = 677;
var _shownGangItems = [];
var _gangMenuOpen = false;   // перехватываем ответ диалога только пока наше меню открыто

function _gangMenuItems() {
    return [
        { id: 'autohack', name: 'Авто-угон | ' + (autoHack.enabled ? '{00FF00}Вкл' : '{FF0000}Выкл') }
    ];
}

function showGangMenu() {
    _shownGangItems = _gangMenuItems();
    _gangMenuOpen = true;
    var list = 'AHK by konstt<n>';
    _shownGangItems.forEach(function (it, i) { list += (i + 1) + '. ' + it.name + '<n>'; });
    window.addDialogInQueue('[' + GANG_MENU_ID + ',4,"Банда","","Выбрать","Отмена",0,0]', list, 0);
}
window.showGangMenu = showGangMenu;

function _gangMenuSelect(index) {
    var it = _shownGangItems[index];
    if (!it) return;
    if (it.id === 'autohack') {
        setAutoHack(!autoHack.enabled);
        setTimeout(showGangMenu, 50);
    }
}

// Перехват ответа диалога — серверу он не нужен (диалог наш)
function _gangDialogIntercept(args) {
    if (!args || args[0] !== 'OnDialogResponse') return false;
    if (!_gangMenuOpen || parseInt(args[1], 10) !== GANG_MENU_ID) return false;
    _gangMenuOpen = false;
    var button = parseInt(args[2], 10);
    if (button === 1) _gangMenuSelect(parseInt(args[3], 10));
    return true;
}

_waitFor(function () { return typeof window.addDialogInQueue === 'function'; }, function () {
    // UI-события игры идут через sendClientEvent, события движка — через sendClientEventHandle:
    // ловим оба пути, как это делают остальные АХК.
    ['sendClientEvent', 'sendClientEventHandle'].forEach(function (fn) {
        var prev = window[fn];
        if (typeof prev !== 'function') return;
        window[fn] = function (event) {
            var args = Array.prototype.slice.call(arguments, 1);
            if (_gangDialogIntercept(args)) return;
            return prev.apply(this, arguments);
        };
    });
});

// Команда /dahk открывает меню (остальные команды чата идут как обычно)
_waitFor(function () { return typeof window.sendChatInput === 'function'; }, function () {
    var prevChat = window.sendChatInput;
    window.sendChatInput = function (text) {
        if (typeof text === 'string' && /^\/dahk(\s|$)/i.test(text.trim())) {
            showGangMenu();
            return;
        }
        return prevChat.apply(this, arguments);
    };
});

// ════════════════════════════════════════════════════════════════════════
// ХОТКЕЙ МЕНЮ: клавиатура, колёсико мыши, средняя/боковые кнопки мыши
// ════════════════════════════════════════════════════════════════════════
(function () {
    // Клавиатура
    window.addEventListener('keydown', function (e) {
        if (MENU_KEY && !e.repeat && !_hkTyping(e) && _hkMatch(e, MENU_KEY)) {
            e.preventDefault && e.preventDefault();
            showGangMenu();
        }
    }, true);

    // Колёсико
    window.addEventListener('wheel', function (e) {
        if (MENU_KEY && _hkMatch(e, MENU_KEY)) {
            e.preventDefault && e.preventDefault();
            showGangMenu();
        }
    }, { passive: false, capture: true });

    // Кнопки мыши — только короткий клик (≤ 400 мс): удержание средней кнопки
    // в игре включает режим осмотра камерой, его не трогаем.
    var CLICK_MAX_MS = 400, downAt = {}, downOk = {};
    window.addEventListener('mousedown', function (e) {
        downAt[e.button] = Date.now();
        downOk[e.button] = !!MENU_KEY && _hkMatch(e, MENU_KEY);
    }, true);
    window.addEventListener('mouseup', function (e) {
        var t0 = downAt[e.button], ok = downOk[e.button];
        downAt[e.button] = 0; downOk[e.button] = false;
        if (ok && t0 && Date.now() - t0 <= CLICK_MAX_MS) {
            e.preventDefault && e.preventDefault();
            showGangMenu();
        }
    }, true);
})();

console.log('[GANG] АХК «Банда» загружен | меню: ' + (MENU_KEY || '/dahk'));

}); // ← конец обёртки проверки ника
