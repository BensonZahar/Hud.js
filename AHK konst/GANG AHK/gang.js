// ═══════════════════════════════════════════════════════════════════════
// gang.js — АХК «Банда» (beta 1.0)
//
// Подгружается загрузчиком LoadGang.js (его вставляет установщик) после fkonst.js.
// Умеет:
//   1) Авто-угон — сам решает головоломку интерфейса «Hacking»
//      (модуль AUTO HACK перенесён сюда из fkonst.js — в fkonst.js его больше нет).
//   2) Авто перебив VIN — сам «нажимает Y» в прогресс-баре перебива VIN
//      (ProgressBar), с безопасным интервалом. Мобилка — тап по бару,
//      ПК — виртуальная клавиша Y через onScreenControlTouchStart.
//   3) Меню АХК — открывается хоткеем MENU_KEY или командой /dahk,
//      в нём авто-угон и авто перебив VIN включаются и выключаются.
//   + команды /console (консоль разработчика) и /int (просмотрщик интерфейсов из fkonst.js).
//
// По умолчанию авто-угон и авто перебив VIN ВЫКЛЮЧЕНЫ — включаются из меню.
// ═══════════════════════════════════════════════════════════════════════

// ПРОВЕРКА НИКА — как в fsin.js. Добавляй/убирай ники здесь.
const NICK_CHECK_ENABLED = true; // ← false = проверка выключена, скрипт доступен всем

const _ALLOWED_NICKS = [
    "Zahar_Damidov",
    "Denis_Galievskiy",
	"Fura_Morales",
    "Sergey_Gaben",
	"Steel_Soprano"
];

// Показ уведомления о запрете доступа.
// Приоритет: QuestsProgressInfo (HUD) → ZkmScreenNotification → чат.
function _showAccessDenied(nick) {
    var title = "AHK — Доступ запрещён";
    var text  = "Ник «" + nick + "» не в списке AHK. Обратитесь к создателю.";
    var shown = false;

    function tryShow() {
        if (shown) return;

        // 1) QuestsProgressInfo — HUD-уведомление (правый верхний угол)
        try {
            if (typeof window.openInterface === 'function') {
                // Пропускаем если интерфейс занят активным квестом
                var questBusy = window.getInterfaceStatus && window.getInterfaceStatus("QuestsProgressInfo");
                if (!questBusy) {
                    window.openInterface("QuestsProgressInfo", JSON.stringify([
                        false,  // ручной режим (не из QuestsInfo.js)
                        0,      // currentScores
                        1,      // maxScores
                        title,  // progressName → заголовок
                        text,   // progressTask → текст под заголовком
                        0,      // showedProgress = 0 → без шкалы прогресса
                        false,  // isShowLocateButton
                        0       // progressMode: PERCENT
                    ]));
                    setTimeout(function () {
                        try { window.closeInterface("QuestsProgressInfo"); } catch (e) {}
                    }, 15000);
                    shown = true;
                    console.warn('[gang] 🚫 Доступ запрещён: ник "' + nick + '" не в списке.');
                    return;
                }
            }
        } catch (e) {}

        // 2) ZKM-уведомление (красивое, сверху экрана)
        var sn = window.ZkmScreenNotification;
        if (sn && typeof sn.add === 'function') {
            try {
                sn.add('[1, "' + title + '", "' + text + '", "FF3333", 15000]');
                shown = true;
                console.warn('[gang] 🚫 Доступ запрещён (ZKM): ник "' + nick + '".');
                return;
            } catch (e) {}
        }

        // 3) Fallback — сообщение в чат (работает всегда)
        if (typeof window.onChatMessage === 'function') {
            try {
                window.onChatMessage('{FF3333}[AHK] {FFFFFF}' + title + ': ' + text, [0, 0, 'FF3333']);
                shown = true;
                console.warn('[gang] 🚫 Доступ запрещён (чат): ник "' + nick + '".');
            } catch (e) {}
        }
    }

    // Первая попытка сразу
    tryShow();

    // Если не получилось — повторяем каждые 500мс до 5 секунд
    // (даём время загрузиться интерфейсам)
    if (!shown) {
        var attempts = 0;
        var retryTimer = setInterval(function () {
            attempts++;
            tryShow();
            if (shown || attempts >= 10) {
                clearInterval(retryTimer);
                if (!shown) console.warn('[gang] 🚫 Ник "' + nick + '" — уведомление показать не удалось.');
            }
        }, 500);
    }
}

(function _nickCheck(callback) {
    // Если проверка отключена — сразу запускаем скрипт для всех
    if (!NICK_CHECK_ENABLED) {
        console.log('[gang] ⚠️ Проверка ника ОТКЛЮЧЕНА (NICK_CHECK_ENABLED = false) — скрипт доступен всем.');
        callback();
        return;
    }

    function getNick() {
        try {
            var n = window.App && window.App.$store &&
                    window.App.$store.getters &&
                    window.App.$store.getters['player/nickName'];
            // Игнорируем дефолтное значение стора ("Name_Surname")
            if (n && n !== "Name_Surname") return n;
            return null;
        } catch (e) { return null; }
    }

    var nick = getNick();
    if (nick) {
        if (_ALLOWED_NICKS.indexOf(nick) !== -1) {
            callback();
        } else {
            _showAccessDenied(nick);
        }
        return;
    }

    // Стор ещё не готов — ждём до 30 секунд
    var attempts = 0;
    var timer = setInterval(function() {
        attempts++;
        var n = getNick();
        if (n) {
            clearInterval(timer);
            if (_ALLOWED_NICKS.indexOf(n) !== -1) {
                callback();
            } else {
                _showAccessDenied(n);
            }
        } else if (attempts >= 60) { // 60 × 500мс = 30 сек
            clearInterval(timer);
            console.warn('[gang] Не удалось получить ник — скрипт не запущен.');
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
// АВТО-УГОН  (AUTO HACK, раньше жил в fkonst.js)
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
        if (autoVin.enabled && name === 'ProgressBar' && !autoVin.running) {
            setTimeout(_vinStart, 500);
        }
        return result;
    };
    console.log('[AUTO-HACK] Модуль загружен');
});

// ════════════════════════════════════════════════════════════════════════
// АВТО ПЕРЕБИВ VIN
// В моде (auto.pwn) перебив VIN = прогресс-бар «Нажимайте Y», 20 нажатий
// (add_progress = 5 из 100). Сервер считает нажатие ошибкой, если оно пришло
// раньше чем через 700 мс после предыдущего; 5 ошибок = провал.
//   • Мобилка (Hassle): «нажатие» — тап по бару, интерфейс ProgressBar шлёт
//     серверу OnProgressBarClick(index). Делаем тот же тап (pb.onBarClick).
//   • ПК: сервер принимает только настоящую клавишу Y (OnPlayerKeyStateChange),
//     OnProgressBarClick он игнорирует. Поэтому подаём виртуальную клавишу тем же
//     механизмом, которым HUD жмёт F/G/C: onScreenControlTouchStart("<Keyboard>/y")
//     → короткое удержание → onScreenControlTouchEnd. Работает, если клиент не
//     «legacy» (App.engine != 'legacy'). Пока идёт перебив, другие клавиши не жми:
//     сервер засчитывает Y только когда зажата одна эта клавиша.
// Интервал между нажатиями 800–1100 мс (запас над 700 мс).
// Прогресс-бар у перебива VIN общий с другими (взлом дверей, рем.комплект…),
// поэтому режим включай только на время перебива.
// ════════════════════════════════════════════════════════════════════════
var autoVin = {
    enabled: false,   // вкл/выкл из меню АХК
    running: false,
    timer: null,
    mode: 'tap',      // 'tap' — мобилка, 'key' — ПК (виртуальная Y)
    pcWarned: false
};

function _vinStop() {
    if (autoVin.running && autoVin.mode === 'key') {
        try { window.onScreenControlTouchEnd('<Keyboard>/y'); } catch (e) {}
    }
    autoVin.running = false;
    if (autoVin.timer) {
        clearTimeout(autoVin.timer);
        autoVin.timer = null;
    }
}

function _vinBarOpen() {
    try {
        return typeof window.getInterfaceStatus === 'function' && !!window.getInterfaceStatus('ProgressBar');
    } catch (e) { return false; }
}

function _vinStart() {
    if (!autoVin.enabled || autoVin.running || !_vinBarOpen()) return;

    var pb = window.interface && window.interface('ProgressBar');
    if (!pb) {
        setTimeout(_vinStart, 200);
        return;
    }

    // Как «нажимать»: мобилка — тап по бару, ПК — виртуальная клавиша Y
    var mobile = false;
    try { mobile = !!pb.isMobile; } catch (e) {}
    autoVin.mode = mobile ? 'tap' : 'key';

    if (autoVin.mode === 'key') {
        var engineOk = false;
        try {
            engineOk = typeof window.onScreenControlTouchStart === 'function' &&
                       typeof window.onScreenControlTouchEnd === 'function' &&
                       window.App && window.App.engine !== 'legacy';
        } catch (e) {}
        if (!engineOk) {
            if (!autoVin.pcWarned) {
                autoVin.pcWarned = true;
                _gangNote('~w~Авто VIN~n~~r~Клиент без виртуальных клавиш');
                console.warn('[AUTO-VIN] onScreenControl* недоступен (engine=' + (window.App && window.App.engine) + ') — авто-Y не запущен');
            }
            return;
        }
    }

    autoVin.running = true;
    console.log('[AUTO-VIN] Начинаю перебив VIN, режим: ' + autoVin.mode);
    // Первая пауза чуть длиннее — как у человека, который только что увидел бар
    autoVin.timer = setTimeout(function () { _vinTick(); }, 700 + Math.floor(Math.random() * 400));
}

function _vinTick() {
    autoVin.timer = null;
    if (!autoVin.running || !autoVin.enabled || !_vinBarOpen()) {
        _vinStop();
        return;
    }

    var pb = window.interface && window.interface('ProgressBar');
    if (!pb || !pb.list || !pb.list.length) {
        _vinStop();
        return;
    }

    // Первый бар, который ещё не заполнен
    var idx = -1;
    for (var i = 0; i < pb.list.length; i++) {
        if (pb.list[i] && pb.list[i].fill < 100) { idx = i; break; }
    }
    if (idx === -1) {
        _vinStop();
        return;
    }

    try {
        if (autoVin.mode === 'key') {
            // ПК: виртуальная Y — короткое удержание, чтобы попасть в sync-пакет
            var YKEY = '<Keyboard>/y';
            window.onScreenControlTouchStart(YKEY);
            setTimeout(function () {
                try { window.onScreenControlTouchEnd(YKEY); } catch (e) {}
            }, 90 + Math.floor(Math.random() * 60));
        } else {
            pb.onBarClick(idx);   // мобилка: тот же тап, что и у игрока → OnProgressBarClick(idx)
        }
    } catch (e) {
        console.log('[AUTO-VIN] Ошибка нажатия: ' + e.message);
        _vinStop();
        return;
    }

    // Интервал 800–1100 мс: сервер требует > 700 мс между нажатиями
    var delay = 800 + Math.floor(Math.random() * 300);
    autoVin.timer = setTimeout(_vinTick, delay);
}

// Включить/выключить авто перебив VIN (вызывается из меню)
function setAutoVin(on) {
    autoVin.enabled = !!on;
    autoVin.pcWarned = false;
    if (!autoVin.enabled) {
        _vinStop();
    } else if (_vinBarOpen()) {
        // Прогресс-бар уже открыт — сразу начинаем
        setTimeout(_vinStart, 300);
    }
    _gangNote('~w~Авто перебив VIN~n~' + (autoVin.enabled ? '~g~Вкл' : '~r~Выкл'));
    console.log('[AUTO-VIN] ' + (autoVin.enabled ? 'включён' : 'выключен'));
}

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
        { id: 'autohack', name: 'Авто-угон | ' + (autoHack.enabled ? '{00FF00}Вкл' : '{FF0000}Выкл') },
        { id: 'autovin',  name: 'Авто перебив VIN | ' + (autoVin.enabled ? '{00FF00}Вкл' : '{FF0000}Выкл') }
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
    } else if (it.id === 'autovin') {
        setAutoVin(!autoVin.enabled);
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

// ── /console — переключатель консоли разработчика (логика та же, что в fsin.js) ──
function _gangToggleConsole() {
    try {
        var consoleRef = window.App && window.App.$refs && window.App.$refs.console;
        var willOpen = !consoleRef || !consoleRef.isOpened;
        if (willOpen && window.App) {
            if (!window.App.isDevelopment) {
                window.App.isDevelopment = true;
                if (window.App.engine != "legacy" && typeof engine !== "undefined") {
                    engine.trigger("ActivateDevelopmentMode");
                }
            }
            if (typeof window.App.setConsoleActive === "function") {
                window.App.setConsoleActive(true);
            }
        }
        if (consoleRef && typeof consoleRef.toggle === 'function') {
            consoleRef.toggle();
        } else {
            console.log('[CONSOLE] Интерфейс console не найден');
        }
        if (!willOpen && window.App && typeof window.App.setConsoleActive === "function") {
            // Было открыто — теперь полностью прячем виджет
            window.App.setConsoleActive(false);
        }
        if (!willOpen && typeof window.setCursorStatus === "function") {
            // Курсор мог быть включён через Alt пока консоль была открыта — гасим при закрытии
            window.cursorStatus = false;
            window.setCursorStatus('Console', false);
        }
    } catch (e) {
        console.log('[CONSOLE] Ошибка переключения консоли:', e.message);
    }
}

// ── /int — просмотрщик интерфейсов. Сам модуль (window.zkInterfaceViewer) приходит из fkonst.js,
//    здесь только команда. Доступ к просмотрщику ограничен ником внутри самого модуля. ──
function _gangToggleInt() {
    try {
        if (window.zkInterfaceViewer && typeof window.zkInterfaceViewer.toggle === 'function') {
            window.zkInterfaceViewer.toggle();
        } else {
            console.warn('[ZK-VIEW] window.zkInterfaceViewer не готов — fkonst.js не загружен?');
        }
    } catch (err) {
        console.warn('[ZK-VIEW] /int toggle error:', err);
    }
}

// Команды чата: /dahk (меню), /console, /int. Остальные идут как обычно.
_waitFor(function () { return typeof window.sendChatInput === 'function'; }, function () {
    var prevChat = window.sendChatInput;
    window.sendChatInput = function (text) {
        if (typeof text === 'string') {
            var cmd = text.trim().split(/\s+/)[0].toLowerCase();
            if (cmd === '/dahk')    { showGangMenu();       return; }
            if (cmd === '/console') { _gangToggleConsole(); return; }
            if (cmd === '/int')     { _gangToggleInt();     return; }
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
