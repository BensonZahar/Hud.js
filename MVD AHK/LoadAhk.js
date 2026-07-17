(function() {
const CALLSIGN = "";
const AUTO_PASSWORD = ""; // Авто-ввод пароля при входе (пусто = отключено)
const HWID = ""; // Вшивается установщиком — проверяется онлайн при каждом запуске игры
const SWAP_ENABLED = true; // Включить свап тазер ↔ дигл (установщик может выключить)
const SWAP_KEY = "Alt+Q"; // Хоткей свапа: "Alt+Q", "Numpad1", "F6", "Alt+F", и т.д. Пусто = отключено
const MENU_KEY = "Alt+0"; // Хоткей открытия меню АХК (пусто = отключено)
const MENU_HIDDEN_ITEMS = []; // Пункты меню «Повседневная» которые скрыты: ["greeting","checkDocuments",...]
const MENU_BINDS = {}; // Прямые биндинги: {"greeting":"Alt+G","cuffing":"Alt+C",...}
const MENU_ORDER = []; // Порядок пунктов меню: ["greeting","cuffing",...] (пусто = по умолчанию)
const MENU_TIMER_ITEMS = []; // Пункты после которых шлётся "/c 60" + автозакрытие диалога через 1.5с: ["greeting","fine","wantedFine",...]
const KEYS_URL = "https://raw.githubusercontent.com/BensonZahar/Hud.js/main/MVD%20AHK/keys.json";
// ── Авто-снаряжение (авто при открытии службы) ─────────────────
const AUTO_GRAB = false;              // Включить авто-снаряжение
const AUTO_GRAB_THR_MAGNUM = 30;     // Добирать .44 Magnum если меньше N штук
const AUTO_GRAB_THR_762    = 60;     // Добирать 7.62x39 если меньше N штук
const AUTO_GRAB_THR_545    = 60;     // Добирать 5.45x39 если меньше N штук
const AUTO_GRAB_THR_1270   = 20;     // Добирать 12x70 если меньше N штук
const AUTO_GRAB_MENU_MEDKIT      = -1; // Позиция Аптечки в меню (-1 = без изменений)
const AUTO_GRAB_MENU_BATON       = -1;
const AUTO_GRAB_MENU_VEST        = -1;
const AUTO_GRAB_MENU_DEAGLE      = -1;
const AUTO_GRAB_MENU_AMMO_MAGNUM = -1;
const AUTO_GRAB_MENU_AKM         = -1;
const AUTO_GRAB_MENU_AMMO_762    = -1;
const AUTO_GRAB_MENU_PAINKILLERS = -1;
const AUTO_GRAB_MENU_WAND        = -1;
const AUTO_GRAB_MENU_RADAR_GUN   = -1;
const AUTO_GRAB_MENU_DIAGNOSTICS = -1;
const AUTO_GRAB_MENU_TASER       = -1;
const AUTO_GRAB_MENU_AKS74U      = -1;
const AUTO_GRAB_MENU_REMINGTON   = -1;
const AUTO_GRAB_MENU_AMMO_545    = -1;
const AUTO_GRAB_MENU_AMMO_1270   = -1;
const AUTO_GRAB_SKIP = []; // Список предметов которые НЕ брать: ["medkit","painkiller","baton","baton2","vest","taumeter","diag","taser","deagle","magnum","akm","ammo762","aks74u","remington","ammo545","ammo12x70"]
// ── END Авто-снаряжение ─────────────────────────────────────────
// Параметры загрузки скрипта
const username = 'BensonZahar';
const repo = 'Hud.js';
const folder = 'MVD AHK';
const filename = 'mvdF.js';
// Функция загрузчика с retry
function loadScriptFromGitHub(username, repo, folder, filename, retries = 5) {
    const path = folder ? `${encodeURIComponent(folder)}/` : '';
    const url = `https://raw.githubusercontent.com/${username}/${repo}/main/${path}${filename}`;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
            let scriptText = xhr.responseText;
            // ── Патчим AUTO_GRAB и AUTO_GRAB_SKIP (var, не const) ──
            if (AUTO_GRAB) {
                scriptText = scriptText.replace(/var AUTO_GRAB = false;/, 'var AUTO_GRAB = true;');
                scriptText = scriptText.replace(
                    'window.AUTO_GRAB = AUTO_GRAB;',
                    'window.AUTO_GRAB = true;'
                );
                scriptText = scriptText.replace(/const AMMO_THRESHOLD = \{[^}]+\}/,
                    `const AMMO_THRESHOLD = { MAGNUM: ${AUTO_GRAB_THR_MAGNUM}, AK762: ${AUTO_GRAB_THR_762}, AKS545: ${AUTO_GRAB_THR_545}, REM1270: ${AUTO_GRAB_THR_1270} }`);
                const menuPatch = {
                    MEDKIT: AUTO_GRAB_MENU_MEDKIT, BATON: AUTO_GRAB_MENU_BATON,
                    VEST: AUTO_GRAB_MENU_VEST, DEAGLE: AUTO_GRAB_MENU_DEAGLE,
                    AMMO_MAGNUM: AUTO_GRAB_MENU_AMMO_MAGNUM, AKM: AUTO_GRAB_MENU_AKM, AMMO_762: AUTO_GRAB_MENU_AMMO_762,
                    PAINKILLERS: AUTO_GRAB_MENU_PAINKILLERS, WAND: AUTO_GRAB_MENU_WAND,
                    RADAR_GUN: AUTO_GRAB_MENU_RADAR_GUN, DIAGNOSTICS: AUTO_GRAB_MENU_DIAGNOSTICS,
                    TASER: AUTO_GRAB_MENU_TASER, AKS74U: AUTO_GRAB_MENU_AKS74U,
                    REMINGTON: AUTO_GRAB_MENU_REMINGTON, AMMO_545: AUTO_GRAB_MENU_AMMO_545, AMMO_1270: AUTO_GRAB_MENU_AMMO_1270
                };
                // Патчим позиции ТОЛЬКО внутри блока const MENU = { ... }
                // чтобы не задеть одноимённые ключи в const ITEM = { ... }
                scriptText = scriptText.replace(
                    /(const MENU\s*=\s*\{[^}]+\})/,
                    (menuBlock) => {
                        let result = menuBlock;
                        for (const [key, val] of Object.entries(menuPatch)) {
                            if (val >= 0) result = result.replace(new RegExp(`(${key}:\\s*)\\d+`), `$1${val}`);
                        }
                        return result;
                    }
                );
                if (AUTO_GRAB_SKIP.length > 0) {
                    const skipJson = JSON.stringify(AUTO_GRAB_SKIP);
                    scriptText = scriptText.replace(/var AUTO_GRAB_SKIP = \[\];/, `var AUTO_GRAB_SKIP = ${skipJson};`);
                }
            }
            // ── Патчим MENU_KEY (var, не const) ──
            scriptText = scriptText.replace(/var MENU_KEY = "Alt\+0";/, `var MENU_KEY = "${MENU_KEY}";`);
            // ── Патчим MENU_HIDDEN_ITEMS (var, не const) ──
            if (MENU_HIDDEN_ITEMS.length > 0) {
                const hiddenJson = JSON.stringify(MENU_HIDDEN_ITEMS);
                scriptText = scriptText.replace(/var MENU_HIDDEN_ITEMS = \[\];/, `var MENU_HIDDEN_ITEMS = ${hiddenJson};`);
            }
            // ── Патчим MENU_BINDS (var, не const) ──
            if (Object.keys(MENU_BINDS).length > 0) {
                const bindsJson = JSON.stringify(MENU_BINDS);
                scriptText = scriptText.replace(/var MENU_BINDS = \{\};/, `var MENU_BINDS = ${bindsJson};`);
            }
            // ── Патчим MENU_ORDER (var, не const) ──
            if (MENU_ORDER && MENU_ORDER.length > 0) {
                const orderJson = JSON.stringify(MENU_ORDER);
                scriptText = scriptText.replace(/var MENU_ORDER = \[\];/, `var MENU_ORDER = ${orderJson};`);
            }
            // ── Патчим MENU_TIMER_ITEMS (var, не const) ──
            if (MENU_TIMER_ITEMS && MENU_TIMER_ITEMS.length > 0) {
                const timerJson = JSON.stringify(MENU_TIMER_ITEMS);
                scriptText = scriptText.replace(/var MENU_TIMER_ITEMS = \[\];/, `var MENU_TIMER_ITEMS = ${timerJson};`);
            }
            // ── Патчим wantedFine и fine: открываем LawsHelper вместо диалогов 681/678 ──
            // Делаем это ПОСЛЕ eval — mvdF определяет эти функции в window,
            // перезаписываем их сразу после eval.
            eval(scriptText);
            // ── Перехват window.showUkInputDialog (РОЗЫСК) ───────────────────
            // Вызывается mvdF при action === 'wantedFine'.
            // Открываем LawsHelper в режиме 'wanted' — только таб РОЗЫСК.
            var _origShowUk = window.showUkInputDialog;
            window.showUkInputDialog = function(targetId) {
                window._duranWantedTargetId = (targetId !== undefined) ? targetId : -1;
                window._duranOpenMode = 'wanted';
                window.openInterface('Zkm');
            };
            window._origShowUkInputDialog = _origShowUk;
            // ── Перехват window.showKoapTypeMenu (ШТРАФ) ─────────────────────
            // Вызывается mvdF при action === 'fine'.
            // Открываем LawsHelper в режиме 'fine' — только таб ШТРАФЫ.
            var _origShowKoap = window.showKoapTypeMenu;
            window.showKoapTypeMenu = function(targetId) {
                window._duranFineTargetId = (targetId !== undefined) ? targetId : -1;
                window._duranOpenMode = 'fine';
                window.openInterface('Zkm');
            };
            window._origShowKoapTypeMenu = _origShowKoap;
            // ── END перехваты ─────────────────────────────────────────────────
            // Явно устанавливаем window.AUTO_GRAB после eval
            if (AUTO_GRAB) window.AUTO_GRAB = true;
            console.log(`Скрипт ${filename} загружен и выполнен успешно`);
        } else {
            console.error(`HTTP error! status: ${xhr.status} для ${url}`);
            if (retries > 0) {
                console.log(`Повторная попытка... Осталось попыток: ${retries - 1}`);
                setTimeout(() => loadScriptFromGitHub(username, repo, folder, filename, retries - 1), 2000);
            } else {
                console.error(`Не удалось загрузить скрипт AHK ${filename} после всех попыток`);
            }
        }
    };
    xhr.onerror = function() {
        console.error(`Ошибка сети при загрузке скрипта ${filename} с ${url}`);
        if (retries > 0) {
            console.log(`Повторная попытка... Осталось попыток: ${retries - 1}`);
            setTimeout(() => loadScriptFromGitHub(username, repo, folder, filename, retries - 1), 2000);
        } else {
            console.error(`Не удалось загрузить скрипт AHK ${filename} после всех попыток`);
        }
    };
    xhr.send();
}
// ── АВТО-ВВОД ПАРОЛЯ ──────────────────────────────────────────
if (AUTO_PASSWORD) {
    (function setupAutoPassword() {
        var _filling = false; // защита от двойного срабатывания за одно появление

        function tryFill() {
            if (_filling) return;

            var passInput = document.querySelector('.authorization-field__input[type="password"]');
            if (!passInput) return;

            _filling = true;

            // Нативный setter — Vue увидит изменение v-model
            var nativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
            nativeSetter.call(passInput, AUTO_PASSWORD);

            // input event — обновляет v-model
            passInput.dispatchEvent(new Event('input', { bubbles: true }));

            // Enter на форме — Vue слушает @keydown там
            setTimeout(function() {
                var form = document.querySelector('.login-form');
                var target = form || passInput;
                target.dispatchEvent(new KeyboardEvent('keydown', {
                    key: 'Enter', code: 'Enter',
                    keyCode: 13, which: 13,
                    bubbles: true, cancelable: true
                }));
                console.log('[AHK AUTO-PWD] Enter отправлен');

                // После Enter ждём пока форма исчезнет — тогда сбрасываем флаг
                // чтобы при следующем /rec снова сработало
                var waitGone = setInterval(function() {
                    if (!document.querySelector('.authorization-field__input[type="password"]')) {
                        _filling = false;
                        clearInterval(waitGone);
                        console.log('[AHK AUTO-PWD] Форма закрылась — готов к следующей авторизации');
                    }
                }, 300);
            }, 150);
        }

        // Observer живёт вечно — не делаем disconnect()
        var observer = new MutationObserver(function() {
            tryFill();
        });

        if (document.body) {
            observer.observe(document.body, { childList: true, subtree: true });
            tryFill(); // на случай если форма уже есть при загрузке
        } else {
            document.addEventListener('DOMContentLoaded', function() {
                observer.observe(document.body, { childList: true, subtree: true });
                tryFill();
            });
        }
    })();
}
// ── END АВТО-ВВОД ПАРОЛЯ ──────────────────────────────────────

// ── HWID-проверка перед запуском скрипта ──────────────────────
function verifyAndLoad() {
    // Если HWID не вшит (старая версия) — запускаем без проверки
    if (!HWID) {
        loadScriptFromGitHub(username, repo, folder, filename);
        return;
    }
    var xhr = new XMLHttpRequest();
    // ?_ — антикэш
    xhr.open('GET', KEYS_URL + '?_=' + Date.now(), true);
    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
            try {
                var keys = JSON.parse(xhr.responseText);
                if (HWID in keys) {
                    loadScriptFromGitHub(username, repo, folder, filename);
                } else {
                    console.warn('[AHK] Доступ отозван');
                }
            } catch (e) {
                console.warn('[AHK] Ошибка проверки доступа');
            }
        } else {
            console.warn('[AHK] Нет ответа от сервера авторизации');
        }
    };
    xhr.onerror = function() {
        console.warn('[AHK] Нет подключения — скрипт не загружен');
    };
    xhr.send();
}
// Запуск загрузчика
verifyAndLoad();

// ── Регистрация хоткея свапа ────────────────────────────────
// SWAP_ENABLED=false или SWAP_KEY="" → слушатели не вешаются вообще
(function() {
    if (!SWAP_ENABLED || !SWAP_KEY) {
        console.log('[SWAP-KEY] Свап отключён установщиком');
        return;
    }

    // Парсим строку вида "Alt+Q", "Ctrl+Shift+F5", "Numpad1", "F6", "WheelUp", "MouseMiddle" и т.д.
    var parts = SWAP_KEY.toLowerCase().split('+').map(function(s){ return s.trim(); });
    var needAlt   = parts.indexOf('alt')   !== -1;
    var needCtrl  = parts.indexOf('ctrl')  !== -1;
    var needShift = parts.indexOf('shift') !== -1;
    // Основная клавиша — последняя часть или единственная
    var mainParts = parts.filter(function(p){ return p !== 'alt' && p !== 'ctrl' && p !== 'shift'; });
    var mainKey   = mainParts[0] || '';

    // Нормализуем: "numpad1" → code "Numpad1"; "f6" → code "F6"; одиночная буква → key "q"
    var matchCode   = null;
    var matchKey    = null;
    var matchWheel  = null; // 'up' | 'down'
    var matchMouse  = null; // кнопка мыши: 1=средняя, 3=назад, 4=вперёд
    if (mainKey === 'wheelup')   { matchWheel = 'up'; }
    else if (mainKey === 'wheeldown') { matchWheel = 'down'; }
    else if (mainKey === 'mousemiddle') { matchMouse = 1; }
    else if (mainKey === 'mouseback')   { matchMouse = 3; }
    else if (mainKey === 'mouseforward'){ matchMouse = 4; }
    else if (/^numpad(\d)$/.test(mainKey)) {
        matchCode = 'Numpad' + mainKey.replace('numpad','');
    } else if (/^f\d+$/.test(mainKey)) {
        matchCode = mainKey.charAt(0).toUpperCase() + mainKey.slice(1); // "F6"
    } else {
        matchKey = mainKey; // одиночный символ, сравниваем e.key.toLowerCase()
    }

    function isModMatch(e) {
        if (needAlt   && !e.altKey)   return false;
        if (needCtrl  && !e.ctrlKey)  return false;
        if (needShift && !e.shiftKey) return false;
        return true;
    }
    function isMatch(e) {
        if (!isModMatch(e)) return false;
        if (matchCode) return e.code === matchCode;
        if (matchKey)  return e.key.toLowerCase() === matchKey;
        return false;
    }

    window.addEventListener('keydown', function(e) {
        if (!isMatch(e)) return;
        e.preventDefault && e.preventDefault();
        window._mvdSwapTaserDeagle && window._mvdSwapTaserDeagle();
    });

    // Колёсико мыши
    if (matchWheel) {
        window.addEventListener('wheel', function(e) {
            if (!isModMatch(e)) return;
            var dir = e.deltaY < 0 ? 'up' : 'down';
            if (dir !== matchWheel) return;
            e.preventDefault && e.preventDefault();
            window._mvdSwapTaserDeagle && window._mvdSwapTaserDeagle();
        }, { passive: false });
        console.log('[SWAP-KEY] Колёсико зарегистрировано: Wheel' + (matchWheel === 'up' ? 'Up' : 'Down'));
    }

    // Кнопки мыши (средняя и боковые)
    // Работает ТОЛЬКО на короткий клик (≤ CLICK_MAX_MS), чтобы не мешать
    // камере GTA: зажатие средней кнопки в игре включает режим осмотра.
    if (matchMouse !== null) {
        var _mouseBtnDownAt = 0;       // timestamp момента mousedown
        var _mouseBtnModsOk = false;   // были ли нужные модификаторы при нажатии
        var CLICK_MAX_MS = 200;        // удержание дольше = камера, не свап

        window.addEventListener('mousedown', function(e) {
            if (e.button !== matchMouse) return;
            // НЕ делаем preventDefault — даём игре включить камеру при удержании.
            // Просто запоминаем факт нажатия и состояние модификаторов.
            _mouseBtnDownAt = Date.now();
            _mouseBtnModsOk = isModMatch(e);
        });

        window.addEventListener('mouseup', function(e) {
            if (e.button !== matchMouse) return;
            if (!_mouseBtnModsOk) return;          // нажали без Alt/Ctrl/Shift — игнор
            var held = Date.now() - _mouseBtnDownAt;
            _mouseBtnDownAt = 0;
            _mouseBtnModsOk = false;

            if (held > 0 && held <= CLICK_MAX_MS) {
                // Короткий клик → свап тазер ↔ дигл
                e.preventDefault && e.preventDefault();
                window._mvdSwapTaserDeagle && window._mvdSwapTaserDeagle();
            }
            // else: удержание (камера GTA) — ничего не делаем
        });

        console.log('[SWAP-KEY] Кнопка мыши зарегистрирована: button=' + matchMouse +
                    ' (клик ≤ ' + CLICK_MAX_MS + 'мс, удержание = камера)');
    }

    // Также перехватываем через движок для Numpad1 (keyCode 40 в Radmir)
    if (matchCode === 'Numpad1') {
        var _origSCEH_key = window.sendClientEventHandle;
        if (_origSCEH_key) {
            window.sendClientEventHandle = function(event) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (args[0] === 'OnPlayerClientSideKey' && parseInt(args[1]) === 40) {
                    console.log('[SWAP-KEY] OnPlayerClientSideKey Numpad1 (40) — своп');
                    window._mvdSwapTaserDeagle && window._mvdSwapTaserDeagle();
                    return;
                }
                return _origSCEH_key.apply(this, arguments);
            };
        }
    }

    console.log('[SWAP-KEY] Хоткей зарегистрирован: ' + SWAP_KEY);
})();
})();
// === HASSLE HUD PATCH (FIXED — chat preservation, универсальный для Hud.js и index.js) ===
(function(){
console.log("[HAS] патч запускается");

// ═══════════════════════════════════════════════════════════════════════════════
// УНИВЕРСАЛЬНОСТЬ (Hud.js ИЛИ index.js)
// ═══════════════════════════════════════════════════════════════════════════════
// Раньше скрипт работал только если его вставляли в конец Hud.js — там в
// области видимости были локальные переменные Mu (сам компонент Hud) и o/w/h
// (openBlock/createBlock/createCommentVNode), которые Hud.js импортирует из
// index.js. При вставке в конец index.js эти имена либо не существуют вовсе,
// либо (что хуже) заняты СОВСЕМ ДРУГИМИ вещами: например, в index.js "Mu" —
// это чужая служебная функция (что-то вроде merge props), а не компонент Hud,
// и обращение к ней напрямую тихо сломало бы патч без единой ошибки в консоли.
//
// Что изменилось:
//  1) Компонент Hud теперь ищется безопасно: сначала проверяем typeof (не
//     кидает ReferenceError на необъявленных именах), а затем проверяем, что
//     это ПОХОЖЕ на компонент Hud (есть data()/computed/components), а не
//     просто "переменная с именем Mu существует".
//  2) Если компонент не нашёлся в текущей области видимости (значит, скрипт
//     вставлен не в Hud.js) — компонент подгружается вручную через тот же
//     динамический import("./Hud.js"), которым это делает само приложение
//     (Hud — это лениво загружаемый чанк). Тайминг безопасен: к моменту
//     резолва import() модуль Hud.js уже полностью выполнился и Mu создан,
//     так что патч применяется до первого создания инстанса.
//  3) openBlock/createBlock/createCommentVNode ищутся тем же способом: сначала
//     под именами из Hud.js (o/w/h), а если их нет — под именами, которые эти
//     же функции носят в index.js (Oe/Ao/sr — установлено разбором текущей
//     сборки: Oe(e=!1){...} = openBlock, Ao(...)=>createVNode(...,!0) =
//     createBlock, sr(e="",t=!1){...} = createCommentVNode).
//     ⚠️ ЭТИ ИМЕНА (Oe/Ao/sr) ПРИВЯЗАНЫ К КОНКРЕТНОЙ СБОРКЕ index.js и почти
//     наверняка изменятся после обновления игры. Если после обновления в
//     консоли снова появится "VoiceChat-патч отключён" — надо заново найти
//     актуальные имена (ищите в index.js функции с телом вида
//     "e=!1)=>...push..." для openBlock и "(e,t,o,n,r)=>...!0)" для
//     createBlock) и подставить их в __hasFindVueHelpers ниже.
// ═══════════════════════════════════════════════════════════════════════════════

function __hasLooksLikeHudComp(x) {
    return !!x && typeof x === "object" &&
        (typeof x.data === "function" || !!x.computed || !!x.components);
}

function __hasFindVueHelpers() {
    var ob = null, cb = null, cc = null;
    try { if (typeof o === "function") ob = o; } catch (e) {}
    try { if (typeof w === "function") cb = w; } catch (e) {}
    try { if (typeof h === "function") cc = h; } catch (e) {}
    // Фолбэк для index.js текущей сборки (см. предупреждение выше)
    try { if (!ob && typeof Oe === "function") ob = Oe; } catch (e) {}
    try { if (!cb && typeof Ao === "function") cb = Ao; } catch (e) {}
    try { if (!cc && typeof sr === "function") cc = sr; } catch (e) {}
    return { openBlock: ob, createBlock: cb, createCommentVNode: cc };
}

function __hasPatchHudComponent(__hasComp) {
    if (!__hasComp) { console.warn("[HAS] __hasPatchHudComponent вызван без компонента"); return; }

    if (typeof __hasComp.data === "function") {
        var __hasOrigData = __hasComp.data;
        __hasComp.data = function() {
            var s = __hasOrigData.apply(this, arguments);
            if (s && typeof s.__hassleForced === "undefined") s.__hassleForced = false;
            return s;
        };
        console.log("[HAS] data() обёрнут, __hassleForced будет добавлен");
    } else {
        console.warn("[HAS] Hud.data не функция — обёртка data() НЕ применена", __hasComp);
    }

    if (__hasComp.computed) {
        __hasComp.computed.isHassleHud = function() { return this.__hassleForced; };
        console.log("[HAS] computed.isHassleHud переопределён");
    } else {
        console.warn("[HAS] Hud.computed отсутствует — computed НЕ переопределён", __hasComp);
    }

    if (__hasComp.components && __hasComp.components.RadmirChat) {
        var __hasRadmirChatComp = __hasComp.components.RadmirChat;
        if (__hasRadmirChatComp.props) {
            if (__hasRadmirChatComp.props.isHudControls) __hasRadmirChatComp.props.isHudControls.default = true;
            if (__hasRadmirChatComp.props.canChatFadeout) __hasRadmirChatComp.props.canChatFadeout.default = true;
            if (__hasRadmirChatComp.props.useChatAnimation) __hasRadmirChatComp.props.useChatAnimation.default = true;
        }
        __hasComp.components.Chat = __hasRadmirChatComp;
        console.log("[HAS] components.Chat подменён на RadmirChat, дефолты форсированы");
    } else {
        console.warn("[HAS] Hud.components.RadmirChat не найден — подмена чат-компонента НЕ выполнена", __hasComp);
    }

    if (__hasComp.components && __hasComp.components.HudHassle && __hasComp.components.HudRadmir) {
        var __hasHudHassleComp = __hasComp.components.HudHassle;
        var __hasVoiceChatComp = __hasComp.components.HudRadmir.components && __hasComp.components.HudRadmir.components.VoiceChat;
        var __hasHelpers = __hasFindVueHelpers();
        var __hasBlockHelpersOk = typeof __hasHelpers.openBlock === "function" && typeof __hasHelpers.createBlock === "function" && typeof __hasHelpers.createCommentVNode === "function";
        if (!__hasBlockHelpersOk) {
            console.warn("[HAS] openBlock/createBlock/createCommentVNode недоступны в этой области видимости — VoiceChat-патч отключён во избежание краша");
        }
        if (__hasBlockHelpersOk && __hasVoiceChatComp && typeof __hasHudHassleComp.render === "function") {
            var __hasOrigHassleRender = __hasHudHassleComp.render;
            var o = __hasHelpers.openBlock, w = __hasHelpers.createBlock, h = __hasHelpers.createCommentVNode;
            __hasHudHassleComp.render = function() {
                var vnode = __hasOrigHassleRender.apply(this, arguments);
                try {
                    var props = arguments[2] || {};
                    var dataObj = props.data;
                    if (vnode && Array.isArray(vnode.children)) {
                        // ═══════════════════════════════════════════════════════════
                        // ФИКС: раньше узел VoiceChat пушился в children/dynamicChildren
                        // ТОЛЬКО когда voiceChat.show===true. Из-за этого длина и порядок
                        // dynamicChildren "плавали" между рендерами (то есть узел, то нет),
                        // а Vue при быстром патче (patchBlockChildren) сверяет старое и
                        // новое дерево ПОЗИЦИОННО — рассинхрон позиций и ловил
                        // "Cannot read properties of null (reading 'emitsOptions')" /
                        // "...reading 'el'".
                        //
                        // У HudRadmir (dd/rd) точно такая же условная отрисовка VoiceChat
                        // сделана как v-if/v-else:
                        //   showVoice ? (o(), w(VoiceChat, {key:0,...})) : h("", !0)
                        // т.е. на каждый рендер добавляется РОВНО один узел — либо
                        // компонент, либо пустой комментарий-заглушка. Позиция стабильна
                        // всегда. Повторяем этот же паттерн здесь вручную.
                        // ═══════════════════════════════════════════════════════════
                        var showVoice = !!(dataObj && dataObj.useChat && dataObj.voiceChat && dataObj.voiceChat.show);
                        var vcNode;
                        if (showVoice) {
                            var chatFontSize = (window.App && window.App.chatFontSize) || 0;
                            var chatPageSize = (window.App && window.App.chatPageSize) || 1;
                            var chatHeightPx = (window.App && typeof window.App.vhToPx === "function") ? window.App.vhToPx(2.22 + 0.15 * chatFontSize) * chatPageSize : 0;
                            // openBlock()+createBlock() вместо голого createVNode — так же,
                            // как это делает сам компилятор для условных (v-if) веток с key.
                            o();
                            vcNode = w(__hasVoiceChatComp, {
                                key: 0,
                                entries: dataObj.voiceChat.entries,
                                chatHeightPx: chatHeightPx,
                                isHudControls: dataObj.isHudControls,
                                isShowButtons: dataObj.voiceChat.showButtons,
                                isTransparent: window.isOpenedChat ? window.isOpenedChat() : false
                            }, null, 8, ["entries", "chatHeightPx", "isHudControls", "isShowButtons", "isTransparent"]);
                        } else {
                            // Плейсхолдер — держит позицию в массиве стабильной,
                            // когда VoiceChat скрыт (ровно как h("",!0) у Radmir).
                            vcNode = h("", true);
                        }
                        vnode.children.push(vcNode);
                        if (Array.isArray(vnode.dynamicChildren)) { vnode.dynamicChildren.push(vcNode); }
                    }
                } catch (err) { console.warn("[HAS] не удалось добавить VoiceChat внутрь HudHassle", err); }
                return vnode;
            };
            console.log("[HAS] HudHassle.render обёрнут — VoiceChat дорисовывается вручную (стабильная позиция, как у Radmir)");
        } else {
            console.warn("[HAS] не нашёл HudRadmir.components.VoiceChat, HudHassle.render или Vue-хелперы — VoiceChat в Hassle НЕ добавлен", __hasComp.components);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // ФИКС: предотвращаем пересоздание чата при переключении isHassleHud
    // ═══════════════════════════════════════════════════════════════════════════════
    //
    // В шаблоне Hud чат рендерится внутри Fragment с разными key:
    //   isHassleHud=true  → Fragment key:3
    //   isHassleHud=false → Fragment key:2
    // Vue видит разные ключи и уничтожает старый компонент чата, создавая новый.
    // Новый компонент имеет пустой messages:[] — все сообщения теряются.
    //
    // Решение: патчим Mu.render, чтобы Fragment-обёртка чата использовала
    // фиксированный ключ. Тогда Vue переиспользует тот же инстанс компонента,
    // и сообщения не теряются.
    // ═══════════════════════════════════════════════════════════════════════════════

    var FRAGMENT_SYM = Symbol.for("v-fgt");

    function __hasFixChatFragmentKey(vnode) {
        if (!vnode) return;

        // Проверяем, является ли vnode Fragment с key:2 или key:3
        if (vnode.type === FRAGMENT_SYM && (vnode.key === 2 || vnode.key === 3)) {
            // Проверяем, содержит ли children компонент с ref:"chat"
            if (vnode.children && vnode.children.length > 0) {
                var hasChatRef = false;
                for (var i = 0; i < vnode.children.length; i++) {
                    var child = vnode.children[i];
                    if (child && child.props && child.props.ref === "chat") {
                        hasChatRef = true;
                        break;
                    }
                }
                if (hasChatRef) {
                    // Фиксируем ключ — Vue будет переиспользовать инстанс
                    vnode.key = "__has_chat_fixed__";
                }
            }
        }

        // Рекурсивно обходим children
        if (vnode.children && Array.isArray(vnode.children)) {
            for (var j = 0; j < vnode.children.length; j++) {
                __hasFixChatFragmentKey(vnode.children[j]);
            }
        }
    }

    if (typeof __hasComp.render === "function") {
        var __hasOrigHudRender = __hasComp.render;
        __hasComp.render = function() {
            var vnode = __hasOrigHudRender.apply(this, arguments);
            try {
                __hasFixChatFragmentKey(vnode);
            } catch (err) {
                console.warn("[HAS] fixChatFragmentKey error:", err);
            }
            return vnode;
        };
        console.log("[HAS] Hud.render обёрнут — Fragment key чата будет зафиксирован");
    }
}

// ─── Точка входа: скрипт может лежать в конце Hud.js ИЛИ в конце index.js ───
(function __hasInitCompPatch() {
    var comp = null;
    try { if (typeof Mu !== "undefined" && __hasLooksLikeHudComp(Mu)) comp = Mu; } catch (e) {}

    if (comp) {
        // Мы в Hud.js — Mu уже в области видимости, патчим синхронно (как раньше).
        __hasPatchHudComponent(comp);
    } else {
        // Мы не в Hud.js (например, в index.js) — Mu не виден напрямую (а если
        // переменная с именем Mu вообще существует в этой области видимости,
        // это, скорее всего, что-то другое — см. __hasLooksLikeHudComp выше).
        // Hud — лениво загружаемый чанк, подгружаем его сами тем же import(),
        // которым это делает приложение.
        console.log("[HAS] Mu не найден/не похож на компонент Hud в этой области видимости — подгружаю чанк Hud.js вручную");
        import("./Hud.js").then(function(mod) {
            var loadedComp = mod && mod.default;
            if (__hasLooksLikeHudComp(loadedComp)) {
                __hasPatchHudComponent(loadedComp);
            } else {
                console.warn("[HAS] не удалось получить компонент Hud из чанка Hud.js", mod);
            }
        }).catch(function(err) {
            console.warn("[HAS] не удалось подгрузить чанк Hud.js", err);
        });
    }
})();


// ═══════════════════════════════════════════════════════════════════════════════
// FALLBACK: сохранение/восстановление состояния чата
// ═══════════════════════════════════════════════════════════════════════════════

var __mvdChatAddFn = null;
var __mvdChatMessages = null;
var __mvdChatInst = null;

function __hasCaptureChatState() {
    try {
        var hud = window.interface && window.interface("Hud");
        if (hud && hud.$refs && hud.$refs.chat) {
            var chat = hud.$refs.chat;
            __mvdChatAddFn = chat.add;
            __mvdChatMessages = chat.messages ? chat.messages.slice() : [];
            __mvdChatInst = chat;
            console.log("[HAS] chat state сохранён, messages:", __mvdChatMessages.length);
        }
    } catch (e) {
        console.warn("[HAS] captureChatState error:", e);
    }
}

function __hasRestoreChatState() {
    try {
        var hud = window.interface && window.interface("Hud");
        if (hud && hud.$refs && hud.$refs.chat) {
            var chat = hud.$refs.chat;
            if (chat !== __mvdChatInst) {
                // Новый инстанс — восстанавливаем .add() и messages
                if (__mvdChatAddFn) {
                    chat.add = __mvdChatAddFn;
                }
                if (__mvdChatMessages && __mvdChatMessages.length > 0) {
                    chat.messages = __mvdChatMessages;
                    if (chat.$forceUpdate) chat.$forceUpdate();
                }
                __mvdChatInst = chat;
                console.log("[HAS] ✅ chat state восстановлен на новом инстансе");
            }
        }
    } catch (e) {
        console.warn("[HAS] restoreChatState error:", e);
    }
}

var ALLOWED_NICKS = ["Zahar_Konstov", "Fura_Loidov"];
function __hasGetOwnNick() {
    try { var n = window.App && window.App.$store && window.App.$store.getters && window.App.$store.getters['player/nickName']; return n; }
    catch (e) { console.warn("[HAS] ошибка получения ника", e); return null; }
}
function __hasIsAllowedNick() {
    var nick = __hasGetOwnNick();
    return !!nick && ALLOWED_NICKS.indexOf(nick) !== -1;
}

var NICK_PROFILES = {
    "Zahar_Loidov": { autoEnable: true,  border: "default" },
    "Fura_Loidov":  { autoEnable: false, border: "default" }
};
var DEFAULT_PROFILE = { autoEnable: true, border: "default" };
function __hasGetNickProfile(nick) { return NICK_PROFILES[nick] || DEFAULT_PROFILE; }

var DEFAULTS = { chatLeft: 21.53, chatTop: 5.92, chatWidth: 45.89, chatHeight: 26.2, chatFontSize: 6, radarLeft: 6.67, radarTop: 6.57, radarSize: 35.8, infoRight: -1.82, infoTop: -4.35, infoScale: 100, voiceExtra: 7, controlsExtra: -7, border: "default" };
var PC_DEFAULTS = { chatLeft: 21.53, chatTop: 5.92, chatWidth: 45.89, chatHeight: 23.0, chatFontSize: 1, radarLeft: 6.67, radarTop: 6.57, radarSize: 30.8, infoRight: -1.82, infoTop: -1, infoScale: 75, voiceExtra: 7, controlsExtra: -7, border: "default" };
var settings = Object.assign({}, PC_DEFAULTS, { hassleForced: true });
var __hasSettingsNick = null;

var __hasOriginalSendChatInput = window.sendChatInput;

var panelEl = null;

function __hasStorageKeyFor(nick) { return STORAGE_KEY + "::" + nick; }
function __hasLoadSettingsForNick(nick) {
    var profile = __hasGetNickProfile(nick);
    var nickDefaults = Object.assign({}, PC_DEFAULTS, { hassleForced: profile.autoEnable, border: profile.border });
    try {
        var raw = localStorage.getItem(__hasStorageKeyFor(nick));
        if (!raw) {
            var legacy = localStorage.getItem(STORAGE_KEY);
            if (legacy) { try { return Object.assign({}, nickDefaults, JSON.parse(legacy)); } catch (e) {} }
            return nickDefaults;
        }
        var parsed = JSON.parse(raw);
        return Object.assign({}, nickDefaults, parsed);
    } catch (e) { return nickDefaults; }
}
function __hasEnsureSettings() {
    var nick = __hasGetOwnNick();
    if (nick && nick !== __hasSettingsNick) {
        __hasSettingsNick = nick;
        settings = __hasLoadSettingsForNick(nick);
        console.log("[HAS] настройки загружены для ника", nick, settings);
    }
    return settings;
}
function __hasSaveSettings() {
    try {
        var key = __hasSettingsNick ? __hasStorageKeyFor(__hasSettingsNick) : STORAGE_KEY;
        localStorage.setItem(key, JSON.stringify(settings));
    } catch (e) { console.warn("[HAS] ошибка сохранения настроек", e); }
}

function __hasToast(text) {
    var el = document.createElement("div"); el.textContent = text;
    el.style.cssText = "position:fixed;top:12vh;left:50%;transform:translateX(-50%) translateY(-6px);background:rgba(17,21,29,0.92);color:#d2a65e;border:1px solid #1f242e;border-radius:8px;padding:10px 18px;font:600 14px/1.3 Open Sans,var(--fallback-font),sans-serif;z-index:999999;pointer-events:none;box-shadow:0 4px 16px rgba(0,0,0,0.4);opacity:0;transition:opacity .2s,transform .2s;";
    document.body.appendChild(el);
    requestAnimationFrame(function() { el.style.opacity = "1"; el.style.transform = "translateX(-50%) translateY(0)"; });
    setTimeout(function() { el.style.opacity = "0"; el.style.transform = "translateX(-50%) translateY(-6px)"; setTimeout(function() { el.remove(); }, 250); }, 1800);
}

function __hasInjectChatStyle() {
    if (document.getElementById("__has-chat-style")) { console.log("[HAS] стиль уже вставлен"); return; }
    var style = document.createElement("style"); style.id = "__has-chat-style";
    style.textContent =
        "body.__has-chat-hassle-pos .radmir-chat{left:var(--has-chat-left)!important;top:var(--has-chat-top)!important;width:var(--has-chat-width)!important;}  " +
        "body.__has-chat-hassle-pos .radmir-chat__messages{width:var(--has-chat-width)!important;height:var(--has-chat-height)!important;}  " +
        "body.__has-chat-hassle-pos .radmir-chat-input{width:var(--has-chat-width)!important;}  " +
        "body.__has-chat-hassle-pos .radmir-chat-input__input{border-top:0!important;}  " +
        "body.__has-chat-hassle-pos .radmir-chat__before{background:linear-gradient(180deg,#1414149e 33.5%,#14141400)!important;height:71.85vh!important;}  " +
        "body.__has-chat-hassle-pos .radmir-chat_opened .radmir-chat__before{opacity:1!important;}  " +
        "body.__has-chat-hassle-pos .radmir-chat__controls{top:var(--has-chat-controls-top)!important;transform:scale(var(--has-chat-controls-scale))!important;transform-origin:left top!important;z-index:50!important;}  " +
        "body.__has-chat-hassle-pos .hud-hassle-radar{left:var(--has-radar-left)!important;top:var(--has-radar-top)!important;}  " +
        "body.__has-chat-hassle-pos .hud-hassle-radar__map{transform:scale(var(--has-radar-scale))!important;opacity:1!important;visibility:visible!important;}  " +
        "body.__has-chat-hassle-pos .hud-radmir-radar{left:var(--has-radar-left)!important;top:var(--has-radar-top)!important;bottom:auto!important;}  " +
        "body.__has-chat-hassle-pos .hud-radmir-radar__map{transform:scale(var(--has-radar-scale))!important;opacity:1!important;visibility:visible!important;}  " +
        "body.__has-chat-hassle-pos .hud-hassle-info{right:var(--has-info-right)!important;top:var(--has-info-top)!important;transform:scale(var(--has-info-scale))!important;}  " +
        "body.__has-chat-hassle-pos .hud-radmir-info{right:var(--has-info-right)!important;top:var(--has-info-top)!important;transform:scale(var(--has-info-scale))!important;}  " +
        "body.__has-chat-hassle-pos .voice-chat{left:var(--has-voicechat-left)!important;top:var(--has-voicechat-top)!important;margin-top:0!important;z-index:50!important;visibility:visible!important;opacity:1!important;}  " +
        "body.__has-chat-hassle-pos .hud-hassle-controls__joystick, " +
        "body.__has-chat-hassle-pos .hud-hassle-controls__pedals, " +
        "body.__has-chat-hassle-pos .hud-hassle-controls__buttons, " +
        "body.__has-chat-hassle-pos .hud-hassle-controls__threangel, " +
        "body.__has-chat-hassle-pos .hud-hassle-controls-right_top, " +
        "body.__has-chat-hassle-pos .hud-hassle-controls-right_bottom, " +
        "body.__has-chat-hassle-pos .hud-hassle-controls__close, " +
        "body.__has-chat-hassle-pos .hud-hassle-speedometer__controls, " +
        "body.__has-chat-hassle-pos .hud-hassle-radar .mobile-button, " +
        "body.__has-chat-hassle-pos .mobile-button{display:none!important;pointer-events:none!important;}  ";
    document.head.appendChild(style);
    console.log("[HAS] стиль вставлен в head");
}

function __hasApplyCSSVars() {
    var r = document.documentElement.style;
    r.setProperty("--has-chat-left", settings.chatLeft + "vw");
    r.setProperty("--has-chat-top", settings.chatTop + "vh");
    r.setProperty("--has-chat-width", settings.chatWidth + "vw");
    r.setProperty("--has-chat-height", settings.chatHeight + "vh");
    r.setProperty("--has-radar-left", settings.radarLeft + "vh");
    r.setProperty("--has-radar-top", settings.radarTop + "vh");
    r.setProperty("--has-radar-scale", (settings.radarSize / DEFAULTS.radarSize).toFixed(4));
    r.setProperty("--has-info-right", settings.infoRight + "vw");
    r.setProperty("--has-info-top", settings.infoTop + "vh");
    r.setProperty("--has-info-scale", (settings.infoScale / 100).toFixed(4));
    var controlsScale = 1 + settings.chatFontSize * 0.045;
    var controlsTop = settings.chatTop + settings.chatHeight + 1.2 + (settings.controlsExtra || 0);
    r.setProperty("--has-chat-controls-top", controlsTop + "vh");
    r.setProperty("--has-chat-controls-scale", controlsScale.toFixed(3));
    var HINT_ROW_HEIGHT_VH = 3;
    var voiceTop = controlsTop + HINT_ROW_HEIGHT_VH * controlsScale + 1 + (settings.voiceExtra || 0);
    r.setProperty("--has-voicechat-left", settings.chatLeft + "vw");
    r.setProperty("--has-voicechat-top", voiceTop + "vh");
    console.log("[HAS] CSS-переменные применены");
}

function __hasApplyToHud() {
    var hud = window.interface && window.interface("Hud");
    if (!hud) { console.warn("[HAS] __hasApplyToHud: hud не найден"); return; }
    window.App.chatFontSize = settings.chatFontSize;
    hud.isHelloween = settings.border === "helloween";
    hud.isNewYear = settings.border === "newyear";
    if (hud.voiceChat) {
        hud.voiceChat.show = true;
        hud.voiceChat.showButtons = true;
        console.log("[HAS] voiceChat.show/showButtons принудительно включены");
    } else {
        console.warn("[HAS] hud.voiceChat не найден на инстансе");
    }
}
function __hasApplyAll() { __hasApplyCSSVars(); __hasApplyToHud(); }

function __hasSetForced(hud, val, silent) {
    // Сохраняем состояние чата ПЕРЕД переключением
    __hasCaptureChatState();

    hud.__hassleForced = val; settings.hassleForced = val;
    document.body.classList.toggle("__has-chat-hassle-pos", val);
    console.log("[HAS] __hassleForced = ", val, "| body class: ", document.body.classList.contains("__has-chat-hassle-pos"));
    if (val) { __hasApplyAll(); window.updatePlayerList && window.updatePlayerList(); }
    else {
        window.App.chatFontSize = 0; hud.isHelloween = false; hud.isNewYear = false;
        if (!silent) __hasHidePanel();
    }
    __hasSaveSettings();

    // Восстанавливаем состояние чата ПОСЛЕ Vue re-render (fallback)
    setTimeout(__hasRestoreChatState, 100);
    setTimeout(__hasRestoreChatState, 300);
    setTimeout(__hasRestoreChatState, 600);

    setTimeout(function() {
        console.log("[HAS] DOM-проверка: ", {
            ".radmir-chat": !!document.querySelector(".radmir-chat"),
            ".radmir-chat__controls": !!document.querySelector(".radmir-chat__controls"),
            ".voice-chat": !!document.querySelector(".voice-chat"),
            ".chat (Hassle-вариант)": !!document.querySelector(".chat-container"),
            "isHassleHud (computed)": hud.isHassleHud
        });
    }, 300);
}

function __hasSlider(label, key, min, max, step) {
    var row = document.createElement("div"); row.style.cssText = "margin-bottom:10px;";
    var top = document.createElement("div"); top.style.cssText = "display:flex;justify-content:space-between;color:#f4f1e1;font-size:12px;margin-bottom:4px;font-family:Open Sans,var(--fallback-font),sans-serif;";
    var lbl = document.createElement("span"); lbl.textContent = label;
    var val = document.createElement("span"); val.textContent = settings[key]; val.style.color = "#d2a65e";
    top.appendChild(lbl); top.appendChild(val);
    var input = document.createElement("input"); input.type = "range"; input.min = min; input.max = max; input.step = step; input.value = settings[key];
    input.style.cssText = "width:100%;accent-color:#d2a65e;";
    input.addEventListener("input", function() { settings[key] = parseFloat(input.value); val.textContent = settings[key]; __hasApplyAll(); __hasSaveSettings(); });
    row.appendChild(top); row.appendChild(input); return row;
}

function __hasBuildPanel() {
    if (panelEl) return panelEl;
    var p = document.createElement("div");
    p.style.cssText = "position:fixed;top:8vh;right:1.5vw;width:580px;max-height:88vh;overflow-y:auto;overflow-x:hidden;background:rgba(17,21,29,0.95);border:1px solid #1f242e;border-radius:10px;padding:14px;z-index:999998;box-shadow:0 8px 24px rgba(0,0,0,0.5);font-family:Open Sans,var(--fallback-font),sans-serif;display:none;";
    var header = document.createElement("div"); header.style.cssText = "display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;";
    var title = document.createElement("div"); title.textContent = "HASSLE HUD"; title.style.cssText = "color:#d2a65e;font-weight:700;font-size:13px;letter-spacing:0.5px;";
    var closeBtn = document.createElement("div"); closeBtn.textContent = "\u2715"; closeBtn.style.cssText = "color:#f4f1e199;cursor:pointer;font-size:14px;padding:2px 6px;";
    closeBtn.addEventListener("click", function() { __hasHidePanel(); });
    header.appendChild(title); header.appendChild(closeBtn); p.appendChild(header);
    var columns = document.createElement("div"); columns.style.cssText = "display:flex;gap:16px;";
    var colLeft = document.createElement("div"); colLeft.style.cssText = "flex:1;min-width:0;";
    var colRight = document.createElement("div"); colRight.style.cssText = "flex:1;min-width:0;";
    columns.appendChild(colLeft); columns.appendChild(colRight); p.appendChild(columns);
    var chatLabel = document.createElement("div"); chatLabel.textContent = "\u0427\u0430\u0442"; chatLabel.style.cssText = "color:#f4f1e199;font-size:11px;text-transform:uppercase;margin:0 0 6px;"; colRight.appendChild(chatLabel);
    colRight.appendChild(__hasSlider("\u0421\u043b\u0435\u0432\u0430 (vw)", "chatLeft", 0, 60, 0.1));
    colRight.appendChild(__hasSlider("\u0421\u0432\u0435\u0440\u0445\u0443 (vh)", "chatTop", 0, 40, 0.1));
    colRight.appendChild(__hasSlider("\u0428\u0438\u0440\u0438\u043d\u0430 (vw)", "chatWidth", 20, 70, 0.1));
    colRight.appendChild(__hasSlider("\u0412\u044b\u0441\u043e\u0442\u0430 (vh)", "chatHeight", 10, 50, 0.1));
    colRight.appendChild(__hasSlider("\u0420\u0430\u0437\u043c\u0435\u0440 \u0448\u0440\u0438\u0444\u0442\u0430", "chatFontSize", -5, 20, 1));
    colRight.appendChild(__hasSlider("\u0421\u043c\u0435\u0449\u0435\u043d\u0438\u0435 T \u0427\u0410\u0422 / F1 (vh, \u043c\u0438\u043d\u0443\u0441 \u2014 \u0432\u044b\u0448\u0435)", "controlsExtra", -25, 10, 0.1));
    colRight.appendChild(__hasSlider("\u041e\u0442\u0441\u0442\u0443\u043f \u0413\u0421 \u043d\u0438\u0436\u0435 \u043f\u043e\u0434\u0441\u043a\u0430\u0437\u043e\u043a (vh)", "voiceExtra", -5, 15, 0.1));
    var radarLabel = document.createElement("div"); radarLabel.textContent = "\u0420\u0430\u0434\u0430\u0440"; radarLabel.style.cssText = "color:#f4f1e199;font-size:11px;text-transform:uppercase;margin:0 0 6px;"; colLeft.appendChild(radarLabel);
    colLeft.appendChild(__hasSlider("\u0421\u043b\u0435\u0432\u0430 (vh)", "radarLeft", 0, 40, 0.1));
    colLeft.appendChild(__hasSlider("\u0421\u0432\u0435\u0440\u0445\u0443 (vh)", "radarTop", 0, 40, 0.1));
    colLeft.appendChild(__hasSlider("\u0420\u0430\u0437\u043c\u0435\u0440 (vh)", "radarSize", 15, 60, 0.1));
    var borderLabel = document.createElement("div"); borderLabel.textContent = "\u0411\u043e\u0440\u0434\u0435\u0440 \u0440\u0430\u0434\u0430\u0440\u0430"; borderLabel.style.cssText = "color:#f4f1e199;font-size:11px;text-transform:uppercase;margin:12px 0 6px;"; colLeft.appendChild(borderLabel);
    var borderRow = document.createElement("div"); borderRow.style.cssText = "display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap;";
    var borderOptions = [["default", "\u041e\u0431\u044b\u0447\u043d\u044b\u0439"], ["helloween", "\u0425\u044d\u043b\u043b\u043e\u0443\u0438\u043d"], ["newyear", "\u041d\u043e\u0432\u044b\u0439 \u0433\u043e\u0434"]];
    var borderButtons = [];
    borderOptions.forEach(function(opt) {
        var btn = document.createElement("div"); btn.textContent = opt[1]; btn.dataset.value = opt[0];
        btn.style.cssText = "flex:1 1 auto;text-align:center;padding:6px 4px;border-radius:6px;font-size:11px;cursor:pointer;border:1px solid #1f242e;color:#f4f1e1;";
        btn.style.background = settings.border === opt[0] ? "#d2a65e" : "transparent";
        btn.style.color = settings.border === opt[0] ? "#11151d" : "#f4f1e1";
        btn.addEventListener("click", function() {
            settings.border = opt[0];
            borderButtons.forEach(function(b) { var active = b.dataset.value === settings.border; b.style.background = active ? "#d2a65e" : "transparent"; b.style.color = active ? "#11151d" : "#f4f1e1"; });
            __hasApplyAll(); __hasSaveSettings();
        });
        borderButtons.push(btn); borderRow.appendChild(btn);
    });
    colLeft.appendChild(borderRow);
    var infoLabel = document.createElement("div"); infoLabel.textContent = "\u041f\u0440\u0430\u0432\u044b\u0439 HUD"; infoLabel.style.cssText = "color:#f4f1e199;font-size:11px;text-transform:uppercase;margin:12px 0 6px;"; colLeft.appendChild(infoLabel);
    colLeft.appendChild(__hasSlider("\u0421\u043f\u0440\u0430\u0432\u0430 (vw)", "infoRight", -10, 20, 0.1));
    colLeft.appendChild(__hasSlider("\u0421\u0432\u0435\u0440\u0445\u0443 (vh)", "infoTop", -10, 20, 0.1));
    colLeft.appendChild(__hasSlider("\u041c\u0430\u0441\u0448\u0442\u0430\u0431 (%)", "infoScale", 50, 200, 1));
    function __hasRebuildPanel() { panelEl.remove(); panelEl = null; __hasBuildPanel(); __hasShowPanel(); }
    var footer = document.createElement("div"); footer.style.cssText = "margin-top:12px;"; p.appendChild(footer);
    var pcBtn = document.createElement("div"); pcBtn.textContent = "\u041f\u041a \u0440\u0430\u0437\u043c\u0435\u0440"; pcBtn.style.cssText = "text-align:center;padding:8px;border-radius:6px;font-size:12px;cursor:pointer;border:1px solid #1f242e;color:#f4f1e199;margin-top:4px;";
    pcBtn.addEventListener("click", function() { settings = Object.assign({}, PC_DEFAULTS, { hassleForced: true }); __hasSaveSettings(); __hasApplyAll(); __hasRebuildPanel(); });
    footer.appendChild(pcBtn);
    var hassleBtn = document.createElement("div"); hassleBtn.textContent = "Hassle \u0440\u0430\u0437\u043c\u0435\u0440"; hassleBtn.style.cssText = "text-align:center;padding:8px;border-radius:6px;font-size:12px;cursor:pointer;border:1px solid #1f242e;color:#d2a65e;margin-top:6px;";
    hassleBtn.addEventListener("click", function() { settings = Object.assign({}, DEFAULTS, { hassleForced: true }); __hasSaveSettings(); __hasApplyAll(); __hasRebuildPanel(); });
    footer.appendChild(hassleBtn);
    document.body.appendChild(p); panelEl = p; return p;
}
function __hasShowPanel() { __hasBuildPanel(); panelEl.style.display = "block"; window.setCursorStatus && window.setCursorStatus("HasPanel", true); }
function __hasHidePanel() { if (panelEl) panelEl.style.display = "none"; window.setCursorStatus && window.setCursorStatus("HasPanel", false); }
function __hasIsPanelOpen() { return !!panelEl && panelEl.style.display !== "none"; }

window.sendChatInput = function(e) {
    if (!e || typeof e !== "string") {
        return __hasOriginalSendChatInput(e);
    }

    var trimmed = e.trim();
    if (!trimmed) {
        return __hasOriginalSendChatInput(e);
    }

    var firstSpace = trimmed.indexOf(" ");
    var cmd = (firstSpace === -1 ? trimmed : trimmed.substring(0, firstSpace)).toLowerCase();

    if ((cmd === "/has" || cmd === "/has_s") && !__hasIsAllowedNick()) {
        return __hasOriginalSendChatInput(e);
    }

    if (cmd === "/has" || cmd === "/has_s") {
        __hasEnsureSettings();
    }

    if (cmd === "/has") {
        var hud = window.interface && window.interface("Hud");
        if (!hud) {
            console.warn("[HAS] /has: hud не инициализирован");
            __hasToast("HASSLE: HUD \u043d\u0435 \u0438\u043d\u0438\u0446\u0438\u0430\u043b\u0438\u0437\u0438\u0440\u043e\u0432\u0430\u043d");
            return;
        }
        __hasInjectChatStyle();
        __hasSetForced(hud, !hud.__hassleForced);
        __hasToast(hud.__hassleForced ? "HASSLE HUD: \u0432\u043a\u043b\u044e\u0447\u0435\u043d" : "HASSLE HUD: \u0432\u044b\u043a\u043b\u044e\u0447\u0435\u043d");
        return;
    } else if (cmd === "/has_s") {
        var hud = window.interface && window.interface("Hud");
        if (!hud) {
            console.warn("[HAS] /has_s: hud не инициализирован");
            __hasToast("HASSLE: HUD \u043d\u0435 \u0438\u043d\u0438\u0446\u0438\u0430\u043b\u0438\u0437\u0438\u0440\u043e\u0432\u0430\u043d");
            return;
        }
        __hasInjectChatStyle();
        if (!hud.__hassleForced) __hasSetForced(hud, true, true);
        if (__hasIsPanelOpen()) { __hasHidePanel(); } else { __hasShowPanel(); }
        return;
    }

    return __hasOriginalSendChatInput(e);
};

var __hasOriginalOnUpdatePlayersList = window.onUpdatePlayersList;
window.onUpdatePlayersList = function(e) {
    try {
        var hud = window.interface && window.interface("Hud");
        if (hud && e && typeof e.count === "number") { hud.info.online = e.count + 1; }
        if (hud && e && e.local && e.local.id != null) {
            var realId = parseInt(e.local.id, 10);
            if (!isNaN(realId) && realId !== 0 && realId !== hud.info.id) { hud.info.id = realId; }
        }
    } catch (err) { console.warn("[HAS] onUpdatePlayersList ошибка", err); }
    if (__hasOriginalOnUpdatePlayersList) return __hasOriginalOnUpdatePlayersList(e);
};

setInterval(function() {
    var hud = window.interface && window.interface("Hud");
    if (hud && hud.__hassleForced && window.updatePlayerList) window.updatePlayerList();
}, 15000);

window.setPlayerId = function(id) {
    var hud = window.interface && window.interface("Hud");
    if (hud) hud.info.id = parseInt(id) || 0;
};

(function __hasAutoInit() {
    var tries = 0, maxTries = 200;
    var timer = setInterval(function() {
        tries++;
        var hud = window.interface && window.interface("Hud");
        if (hud && __hasIsAllowedNick()) {
            clearInterval(timer);
            console.log("[HAS] автозапуск: HUD найден, ник разрешён");
            __hasEnsureSettings();
            __hasInjectChatStyle();

            setTimeout(function() {
                __hasCaptureChatState();
                if (settings.hassleForced !== false) { __hasSetForced(hud, true, true); }
            }, 500);
        } else if (tries >= maxTries) {
            console.warn("[HAS] автозапуск: не дождались HUD/разрешённого ника");
            clearInterval(timer);
        }
    }, 150);
})();

setInterval(function() {
    var hud = window.interface && window.interface("Hud");
    if (hud && hud.$refs && hud.$refs.chat && __mvdChatAddFn) {
        if (hud.$refs.chat !== __mvdChatInst) {
            console.log("[HAS] ⚠️ Обнаружен новый инстанс чата — восстанавливаем state");
            __hasRestoreChatState();
        }
    }
}, 3000);

})();
// === END HASSLE HUD PATCH ===
